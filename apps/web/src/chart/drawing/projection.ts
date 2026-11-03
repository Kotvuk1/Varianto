/** Преобразование (время, цена) <-> пиксели панели графика. Инъектируется: LWC в приложении, линейная в тестах. */
export interface Projection {
  timeToX(t: number): number;
  xToTime(x: number): number;
  priceToY(p: number): number;
  yToPrice(y: number): number;
  /** Размеры области рисования (CSS px). */
  width: number;
  height: number;
}
