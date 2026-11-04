// Series Primitive (LWC v5): рисует метки поверх свечей. Источник истины - Mark[] (React-состояние);
// примитив только конвертирует (время, цена) -> пиксели через Projection и рисует видимое.
import type {
  IChartApi,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  ISeriesApi,
  ISeriesPrimitive,
  SeriesAttachedParameter,
  SeriesType,
  Time,
} from 'lightweight-charts';
import type { Mark } from '@tl/core';
import type { TimeIndex } from '../geometry/timeIndex';
import type { ChartTokens } from '../theme/chartTokens';
import { dimSpans, highlightColumns, labelTop, type CandleHighlight, type HighlightRange } from './highlight';
import { withAlpha } from '../theme/chartTokens';
import { buildGeometry, isMarkVisible, type MarkState } from './layout';
import { lwcProjection } from './lwcProjection';
import { drawGeometry } from './render';

/** Отступ слева для подписи окна: логотип TradingView (атрибуция LWC) занимает левый нижний угол панели. */
const LOGO_CLEAR = 60;

export interface OpenCandleInfo {
  openTime: number;
  high: number;
  low: number;
}

export interface PrimitiveState {
  userMarks: readonly Mark[];
  algoMarks: readonly Mark[];
  selectedId: string | null;
  override: Mark | null;
  preview: Mark | null;
  tokens: ChartTokens;
  openCandle: OpenCandleInfo | null;
  openBadge: string;
  fmt: (price: number) => string;
  /** Состояния меток после проверки (id -> match/missed/extra). */
  states?: Record<string, MarkState>;
  /** Окно оценки: вне него свечи затемнены. */
  highlightRange?: HighlightRange;
  /** Подпись границы окна оценки. */
  windowLabel?: string;
  /** Подсветка свечей модели: колонка за свечой + подпись над high. high - цена верха свечи. */
  candleHighlights?: readonly (CandleHighlight & { high: number; low: number })[];
  /** Метка, кратко подсвеченная по запросу (focusMark). */
  flashId?: string | null;
}

const ZONE_KINDS = new Set(['order-block', 'fvg']);

export class DrawingPrimitive implements ISeriesPrimitive<Time> {
  private chart: IChartApi | null = null;
  private series: ISeriesApi<SeriesType> | null = null;
  private requestUpdate: (() => void) | null = null;
  private state: PrimitiveState | null = null;
  /** Счётчик отрисованных меток (для тестов производительности/видимости). */
  lastDrawnCount = 0;
  /** Центры нарисованных меток (CSS px панели): для e2e и отладки. */
  lastCenters: { id: string; x: number; y: number }[] = [];

  constructor(private readonly getIndex: () => TimeIndex) {}

  attached(p: SeriesAttachedParameter<Time>): void {
    this.chart = p.chart as IChartApi;
    this.series = p.series as ISeriesApi<SeriesType>;
    this.requestUpdate = p.requestUpdate;
  }

  detached(): void {
    this.chart = null;
    this.series = null;
    this.requestUpdate = null;
  }

  setState(s: PrimitiveState): void {
    this.state = s;
    this.requestUpdate?.();
  }

  updateAllViews(): void {
    /* геометрия строится в draw: зависит от текущих шкал */
  }

  private readonly view: IPrimitivePaneView = {
    zOrder: () => 'normal',
    renderer: (): IPrimitivePaneRenderer => ({
      draw: (target) => {
        const chart = this.chart;
        const series = this.series;
        const st = this.state;
        if (!chart || !series || !st) return;
        target.useMediaCoordinateSpace(({ context, mediaSize }) => {
          const proj = lwcProjection(chart, series, this.getIndex(), mediaSize.width, mediaSize.height);
          let drawn = 0;
          const centers: { id: string; x: number; y: number }[] = [];

          const hr = st.highlightRange;
          if (hr) {
            const spacing = chart.timeScale().options().barSpacing;
            const xa = proj.timeToX(hr.fromTime);
            const xb = proj.timeToX(hr.toTime);
            if (Number.isFinite(xa) && Number.isFinite(xb)) {
              context.save();
              context.globalAlpha = 0.45;
              context.fillStyle = st.tokens.bg;
              for (const sp of dimSpans(xa, xb, spacing, mediaSize.width)) context.fillRect(sp.x1, 0, sp.x2 - sp.x1, mediaSize.height);
              context.restore();
              // Границы окна - сплошная тонкая линия; подпись у левой границы.
              const left = xa - spacing / 2;
              const right = xb + spacing / 2;
              context.save();
              context.strokeStyle = st.tokens.text1;
              context.globalAlpha = 0.6;
              context.lineWidth = 1;
              for (const e of [left, right]) {
                if (e <= 0 || e >= mediaSize.width) continue;
                context.beginPath();
                context.moveTo(Math.round(e) + 0.5, 0);
                context.lineTo(Math.round(e) + 0.5, mediaSize.height);
                context.stroke();
              }
              context.globalAlpha = 1;
              const label = st.windowLabel ?? 'Окно задания';
              context.font = `600 11px ${st.tokens.fontSans}`;
              const lw = context.measureText(label).width + 10;
              const lx = Math.min(Math.max(left + 4, LOGO_CLEAR), Math.max(LOGO_CLEAR, mediaSize.width - lw - 4));
              // внизу панели (сверху легенда OHLC), правее логотипа TradingView (слева внизу, ~48 px)
              const ly = mediaSize.height - 24;
              context.fillStyle = st.tokens.bg;
              context.fillRect(lx, ly, lw, 16);
              context.strokeRect(lx + 0.5, ly + 0.5, lw - 1, 15);
              context.fillStyle = st.tokens.text1;
              context.textAlign = 'left';
              context.textBaseline = 'middle';
              context.fillText(label, lx + 5, ly + 8.5);
              context.restore();
            }
          }

          // Подписи подсвеченных свечей: над high, не перекрывают свечу (колонки рисуются в нижнем слое).
          if (st.candleHighlights?.length) {
            const spacing = chart.timeScale().options().barSpacing;
            const cols = highlightColumns(st.candleHighlights, proj.timeToX, spacing, mediaSize.width);
            context.save();
            context.font = `600 11px ${st.tokens.fontSans}`;
            context.textBaseline = 'middle';
            for (const col of cols) {
              if (!col.label) continue;
              const info = st.candleHighlights.find((h) => h.time === col.time);
              if (!info) continue;
              const yh = proj.priceToY(info.high);
              const yl = proj.priceToY(info.low);
              if (!Number.isFinite(yh) || !Number.isFinite(yl)) continue;
              const w = context.measureText(col.label).width + 12;
              const bx = Math.min(Math.max(col.cx - w / 2, 2), Math.max(2, mediaSize.width - w - 2));
              const by = labelTop(yh, yl, 18, mediaSize.height);
              context.fillStyle = st.tokens.bg;
              context.strokeStyle = col.tone === 'focus' ? st.tokens.markAlgo : st.tokens.text1;
              context.lineWidth = 1;
              context.beginPath();
              context.rect(bx + 0.5, by + 0.5, w - 1, 17);
              context.fill();
              context.stroke();
              context.fillStyle = st.tokens.text1;
              context.textAlign = 'center';
              context.fillText(col.label, bx + w / 2, by + 9.5);
            }
            context.restore();
          }

          // Открытая (незакрытая) свеча: пунктирный контур и бейдж «Идёт».
          const oc = st.openCandle;
          if (oc) {
            const spacing = chart.timeScale().options().barSpacing;
            const cx = proj.timeToX(oc.openTime);
            const yh = proj.priceToY(oc.high);
            const yl = proj.priceToY(oc.low);
            if (Number.isFinite(cx) && Number.isFinite(yh) && Number.isFinite(yl) && cx > -20 && cx < mediaSize.width + 20) {
              const hw = Math.max(3, spacing * 0.45);
              context.save();
              context.strokeStyle = st.tokens.text1;
              context.lineWidth = 1;
              context.setLineDash([3, 3]);
              context.strokeRect(cx - hw, yh - 3, hw * 2, yl - yh + 6);
              context.setLineDash([]);
              if (spacing >= 5) {
                context.font = `600 11px ${st.tokens.fontSans}`;
                const w = context.measureText(st.openBadge).width + 12;
                context.strokeStyle = st.tokens.text1;
                context.fillStyle = st.tokens.bg;
                const bx = Math.min(Math.max(cx - w / 2, 2), mediaSize.width - w - 2);
                const by = Math.max(yh - 26, 2);
                context.beginPath();
                context.rect(bx, by, w, 18);
                context.fill();
                context.stroke();
                context.fillStyle = st.tokens.text1;
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(st.openBadge, bx + w / 2, by + 9.5);
              }
              context.restore();
            }
          }

          const all: Mark[] = [];
          for (const m of st.algoMarks) all.push(m);
          for (const m of st.userMarks) all.push(st.override && st.override.id === m.id ? st.override : m);
          const visible = all.filter((m) => isMarkVisible(m, proj));
          // Зоны под линиями и подписями.
          visible.sort((a, b) => Number(ZONE_KINDS.has(b.kind)) - Number(ZONE_KINDS.has(a.kind)));
          for (const m of visible) {
            const state = st.states?.[m.id];
            const g = buildGeometry(m, proj, { fmt: st.fmt, ...(state ? { state } : {}) });
            if (g.parts.some((p) => Object.values(p).some((v) => typeof v === 'number' && !Number.isFinite(v)))) continue;
            drawGeometry(context, g, { tokens: st.tokens, selected: m.id === st.selectedId || m.id === st.flashId, ghost: false });
            drawn++;
            if (g.handles.length) {
              centers.push({
                id: m.id,
                x: g.handles.reduce((a, h) => a + h.x, 0) / g.handles.length,
                y: g.handles.reduce((a, h) => a + h.y, 0) / g.handles.length,
              });
            }
          }
          if (st.preview) {
            const g = buildGeometry(st.preview, proj, { fmt: st.fmt });
            drawGeometry(context, g, { tokens: st.tokens, selected: false, ghost: true });
          }
          this.lastDrawnCount = drawn;
          this.lastCenters = centers;
        });
      },
    }),
  };

  /** Нижний слой: колонки подсветки модели за свечами. */
  private readonly bottomView: IPrimitivePaneView = {
    zOrder: () => 'bottom',
    renderer: (): IPrimitivePaneRenderer => ({
      draw: (target) => {
        const chart = this.chart;
        const series = this.series;
        const st = this.state;
        if (!chart || !series || !st?.candleHighlights?.length) return;
        target.useMediaCoordinateSpace(({ context, mediaSize }) => {
          const proj = lwcProjection(chart, series, this.getIndex(), mediaSize.width, mediaSize.height);
          const spacing = chart.timeScale().options().barSpacing;
          context.save();
          for (const col of highlightColumns(st.candleHighlights ?? [], proj.timeToX, spacing, mediaSize.width)) {
            context.fillStyle = col.tone === 'focus' ? withAlpha(st.tokens.markAlgo, 0.2) : withAlpha(st.tokens.text1, 0.12);
            context.fillRect(col.x1, 0, col.x2 - col.x1, mediaSize.height);
          }
          context.restore();
        });
      },
    }),
  };

  paneViews(): readonly IPrimitivePaneView[] {
    return [this.bottomView, this.view];
  }
}
