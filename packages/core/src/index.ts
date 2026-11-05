// Домен @tl/core (ARCHITECTURE §4). Чистый TS: без DOM/Node API.
export * from './types';
export { ALGO_VERSION, ANALYSIS_ALGO_VERSION, FIB_ALGO_VERSION, EW_ALGO_VERSION } from './version';
export { aggregate, sliceAt, type SeriesByTf } from './candles/aggregate';
export * from './smc';
export * from './grading';
export * from './tasks';
export { mulberry32, randInt } from './rng';
export * from './pa';
export * from './challenge';
export * from './fib';
export * from './elliott';
export * from './progress';
export * from './feedback';
