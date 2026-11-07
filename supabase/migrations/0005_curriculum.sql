-- 0005: курс из ступеней (docs/specs/CURRICULUM_STAGES.md §13): attempts.module допускает новые модули.
-- skill_stats.skill - свободный текст (новые навыки swing-trend, level-zone, ...), правка не нужна. Новых таблиц нет.

alter table public.attempts drop constraint if exists attempts_module_check;
alter table public.attempts
  add constraint attempts_module_check check (module in (
    'market-structure', 'price-action', 'challenge', 'fibonacci', 'elliott',
    'stage-swings', 'levels', 'limit-entry', 'stop-take', 'combo-level-trade', 'combo-smc-entry'));
