// Домен @tl/core (ARCHITECTURE §4). Чистый TS: без DOM/Node API.
export * from './types';
export { ALGO_VERSION } from './version';
export { aggregate, sliceAt, type SeriesByTf } from './candles/aggregate';
export * from './smc';
export * from './grading';
export * from './tasks';
export { mulberry32, randInt } from './rng';
