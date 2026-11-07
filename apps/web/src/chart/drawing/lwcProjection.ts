import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';
import type { TimeIndex } from '../geometry/timeIndex';
import type { Projection } from './projection';

/** Projection поверх API шкал LWC. Время - через TimeIndex (логический индекс), цена - через шкалу серии. */
export function lwcProjection(
  chart: IChartApi,
  series: ISeriesApi<SeriesType>,
  index: TimeIndex,
  width: number,
  height: number,
): Projection {
  const ts = chart.timeScale();
  return {
    width,
    height,
    timeToX: (t) => ts.logicalToCoordinate(index.timeToLogical(t) as never) ?? NaN,
    xToTime: (x) => {
      const l = ts.coordinateToLogical(x);
      return l === null ? NaN : index.logicalToTime(l);
    },
    priceToY: (p) => series.priceToCoordinate(p) ?? NaN,
    yToPrice: (y) => series.coordinateToPrice(y) ?? NaN,
  };
}
