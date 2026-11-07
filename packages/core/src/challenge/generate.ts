// Выбор сценария Challenge по сложности и seed (ALGORITHMS §13.5), подсказки easy (§14.6).
// Данные поставляет `ChallengeSource` (сервер: sliceAt по архиву); сеть ядро не трогает.
import { mulberry32, randInt } from '../rng';
import { gaps, atr14, inferTimeframe } from '../smc/series';
import { markItems } from '../smc/marks';
import { visibleCount, MAX_ATTEMPTS, relaxation } from '../pa/generate';
import type { Candle, Difficulty, Mark, TaskTimeframe, UtcMs } from '../types';
import { computeChallengeFacts, type ChallengeFacts, type RefSide } from './facts';

export interface ChallengeSource {
  /** Моменты T-кандидаты на сетке 15m. */
  candidates: readonly UtcMs[];
  /** Закрытые свечи tf к моменту T (closeTime < T), по возрастанию; ядро берёт последние visibleCount. */
  closedAt(tf: TaskTimeframe, T: UtcMs): readonly Candle[];
  /** Вход: close последней видимой свечи (общая для всех ТФ, ADR-0006 п.4). */
  entryAt(T: UtcMs): number;
  /** Есть ли будущее на лимит времени и 1m для drill-down. */
  feasible?(T: UtcMs, tf: TaskTimeframe): boolean;
}

export interface ChallengePickInput {
  source: ChallengeSource;
  difficulty: Difficulty;
  seed: number;
  /** Допустимые рабочие ТФ (по умолчанию по сложности). */
  tfs?: readonly TaskTimeframe[];
  /** Доля WAIT для medium/hard (по умолчанию 0.4 / 0.6; challenge-wait в focus — 0.6). */
  waitShare?: number;
  minHistory?: number;
  minHistoryHtf?: number;
  maxAttempts?: number;
}

export interface ChallengePick {
  T: UtcMs;
  defaultTf: TaskTimeframe;
  entry: number;
  refSide: RefSide;
  facts: ChallengeFacts;
  hints?: Mark[];
  relaxedTo?: Difficulty;
}

const DEFAULT_TFS: Record<Difficulty, TaskTimeframe[]> = {
  easy: ['1h', '4h'],
  medium: ['15m', '1h', '4h'],
  hard: ['15m', '1h', '4h'],
};
const HTF: Record<TaskTimeframe, TaskTimeframe> = { '15m': '1h', '1h': '4h', '4h': '1d', '1d': '1d' };

/** Подсказки easy: внешние swing последних 100 свечей, последнее внешнее событие, защищённый уровень. */
export function buildHints(f: ChallengeFacts): Mark[] {
  const items = markItems(f.structure);
  const from = f.lastIndex - 99;
  const out: Mark[] = items.filter((it) => it.cls === 'swing' && it.scope === 'external' && it.key >= from).map((it) => it.mark);
  const breaks = items.filter((it) => it.cls === 'break' && it.scope === 'external');
  const lastBreak = breaks[breaks.length - 1];
  if (lastBreak) out.push(lastBreak.mark);
  const prot = f.trendTf === 'up' ? f.refLow : f.trendTf === 'down' ? f.refHigh : null;
  if (prot) {
    out.push({
      id: `algo:level:external:-:${prot.time}`,
      kind: 'level',
      anchors: [{ time: prot.time, price: prot.price }],
      scope: 'external',
      direction: null,
      meta: { role: 'protected' },
      author: 'algo',
    });
  }
  return out;
}

function tail(candles: readonly Candle[], tf: TaskTimeframe): Candle[] {
  const n = visibleCount(tf);
  return candles.length > n ? candles.slice(candles.length - n) : [...candles];
}

function meetsDifficulty(level: Difficulty, f: ChallengeFacts, wantWait: boolean): boolean {
  const age = (e: { breakIndex: number }) => f.lastIndex - e.breakIndex;
  if (level === 'easy') {
    if (f.refSide === 'WAIT') return false;
    const e = f.lastEvent;
    return !!e && e.kind === 'bos' && e.direction === (f.refSide === 'LONG' ? 'bull' : 'bear') && age(e) <= 40 && f.trendHtf === (f.refSide === 'LONG' ? 'up' : 'down');
  }
  if (level === 'hard') {
    const flip = !!f.lastEvent && !!f.prevEvent && f.lastEvent.direction !== f.prevEvent.direction && age(f.prevEvent) <= 60;
    const sweep = f.structure.sweeps.some((s) => s.index >= f.lastIndex - 9);
    if (!(f.trendHtf === 'none' || flip || sweep)) return false;
  }
  return (f.refSide === 'WAIT') === wantWait;
}

export function pickChallengeScenario(input: ChallengePickInput): ChallengePick | null {
  const { source } = input;
  const minHistory = input.minHistory ?? 300;
  const minHtf = input.minHistoryHtf ?? 50;
  const attempts = input.maxAttempts ?? MAX_ATTEMPTS;
  const span = source.candidates.length;
  if (span === 0) return null;

  for (const [li, level] of relaxation(input.difficulty).entries()) {
    const rng = mulberry32((input.seed + li * 7919) | 0);
    const tfs = (input.tfs ?? DEFAULT_TFS[level]).filter((tf) => (level === 'easy' ? tf === '1h' || tf === '4h' : true));
    if (tfs.length === 0) continue;
    const share = input.waitShare ?? (level === 'hard' ? 0.6 : 0.4);
    const want = rng() < share;
    // Сначала желаемая доля WAIT, затем (критерий сложности важнее доли) инверсия, и только потом ослабление сложности.
    for (const wantWait of level === 'easy' ? [false] : [want, !want]) {
      for (let a = 0; a < attempts; a++) {
        const T = source.candidates[randInt(rng, span)]!;
        const tf = tfs[randInt(rng, tfs.length)]!;
        if (source.feasible && !source.feasible(T, tf)) continue;
        const work = tail(source.closedAt(tf, T), tf);
        const htf = tail(source.closedAt(HTF[tf], T), HTF[tf]);
        if (work.length < minHistory || htf.length < minHtf) continue;
        if (gaps(work, tf).length > 0 || gaps(htf, inferTimeframe(htf) ?? HTF[tf]).length > 0) continue;
        const A = atr14(work)[work.length - 1];
        if (A === null || A === undefined || !(A > 0)) continue;
        const entry = source.entryAt(T);
        const facts = computeChallengeFacts({ candles: work, tf, htf, entry });
        if (!meetsDifficulty(level, facts, wantWait)) continue;
        return {
          T,
          defaultTf: tf,
          entry,
          refSide: facts.refSide,
          facts,
          ...(input.difficulty === 'easy' ? { hints: buildHints(facts) } : {}),
          ...(level !== input.difficulty ? { relaxedTo: level } : {}),
        };
      }
    }
  }
  return null;
}
