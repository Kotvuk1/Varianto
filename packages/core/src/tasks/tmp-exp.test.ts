import { it } from 'vitest';
import { readKlines } from '../testing/klines';
import { selectMsMarkTask } from './market-structure';
const archive = [...readKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-08.csv'), ...readKlines('klines/BTCUSDT/1h/BTCUSDT-1h-2026-09.csv')];
it('exp', () => {
  for (const d of ['easy', 'medium', 'hard'] as const) {
    const res: string[] = [];
    for (let seed = 1; seed <= 30; seed++) {
      const s = selectMsMarkTask({ candles: archive, tf: '1h', difficulty: d, seed });
      res.push(s ? `${s.windowSize}/${s.requiredCount}/${s.criteria}/${s.focus.join('+')}/a${s.attempts}` : 'null');
    }
    console.log(d, res.join(' | '));
  }
});
