/**
 * Версия алгоритмов (ALGORITHMS §1.5). Смена семантики определений = MAJOR.
 * 1.1.0: генерация и оценка заданий Market Structure «Разметка» (§13.2, поправка v1.1); определения анализа не менялись.
 * 1.2.0: Fibonacci Playground (FIBONACCI.md): новый детектор импульса и новые задания; метки и эталоны MS/PA/Challenge не менялись.
 * 1.3.0: Elliott Wave Lab (ELLIOTT.md): новые задания и оценка; метки и эталоны MS/PA/Challenge/Fibonacci не менялись.
 */
export const ALGO_VERSION = '1.3.0';
/** Версия определений анализа (swing/структура/sweep/OB/FVG, §2-§8) - в `StructureResult.algoVersion` и golden-файлах. */
export const ANALYSIS_ALGO_VERSION = '1.0.0';
/** Версия правил Fibonacci (FIBONACCI.md): импульс, реакция, extension, конфлюэнс, оценка; в golden `fib_*` и `params` токена. */
export const FIB_ALGO_VERSION = '1.0.0';
/** Версия правил Elliott (ELLIOTT.md): правила, допуски, веса, сценарии; в golden `ew_*` и `params` токена. */
export const EW_ALGO_VERSION = '1.0.0';
