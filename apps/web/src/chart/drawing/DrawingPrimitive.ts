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
import { dimSpans, type HighlightRange } from './highlight';
import { buildGeometry, isMarkVisible, type MarkState } from './layout';
import { lwcProjection } from './lwcProjection';
import { drawGeometry } from './render';

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
              context.globalAlpha = 0.6;
              context.fillStyle = st.tokens.bg;
              for (const sp of dimSpans(xa, xb, spacing, mediaSize.width)) context.fillRect(sp.x1, 0, sp.x2 - sp.x1, mediaSize.height);
              context.restore();
              const edge = xa - spacing / 2;
              if (edge > 0 && edge < mediaSize.width) {
                context.save();
                context.strokeStyle = st.tokens.text1;
                context.globalAlpha = 0.5;
                context.setLineDash([4, 4]);
                context.beginPath();
                context.moveTo(edge, 0);
                context.lineTo(edge, mediaSize.height);
                context.stroke();
                context.restore();
              }
            }
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
            drawGeometry(context, g, { tokens: st.tokens, selected: m.id === st.selectedId, ghost: false });
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

  paneViews(): readonly IPrimitivePaneView[] {
    return [this.view];
  }
}
