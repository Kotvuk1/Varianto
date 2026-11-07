/**
 * Версия алгоритмов (ALGORITHMS §1.5). Смена семантики определений = MAJOR.
 * 1.1.0: генерация и оценка заданий Market Structure «Разметка» (§13.2, поправка v1.1); определения анализа не менялись.
 * 1.2.0: Fibonacci Playground (FIBONACCI.md): новый детектор импульса и новые задания; метки и эталоны MS/PA/Challenge не менялись.
 * 1.3.0: Elliott Wave Lab (ELLIOTT.md): новые задания и оценка; метки и эталоны MS/PA/Challenge/Fibonacci не менялись.
 * 2.0.0: курс по ступеням (CURRICULUM_STAGES.md): MS переразмечен (ступень 5, §9.1), запас стопа 0.25-1.5 ATR в Challenge (§20), swing/HH-LL вынесены в ступень 1.
 */
export const ALGO_VERSION = '2.0.0';
/** Версия определений анализа (swing/структура/sweep/OB/FVG, §2-§8) - в `StructureResult.algoVersion` и golden-файлах. */
export const ANALYSIS_ALGO_VERSION = '1.0.0';
/** Версия правил Fibonacci (FIBONACCI.md): импульс, реакция, extension, конфлюэнс, оценка; в golden `fib_*` и `params` токена. */
export const FIB_ALGO_VERSION = '1.0.0';
/** Версия правил Elliott (ELLIOTT.md): правила, допуски, веса, сценарии; в golden `ew_*` и `params` токена. */
export const EW_ALGO_VERSION = '1.0.0';
/** Версия правил ступеней 2-4 и комбинированных модулей (CURRICULUM_STAGES.md): зоны, сила, реакция, лимитка, SL/TP, resolveLimitTrade; в golden `cur_*` и `params` токена. */
export const CUR_ALGO_VERSION = '1.0.0';
