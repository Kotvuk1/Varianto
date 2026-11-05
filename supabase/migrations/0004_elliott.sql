-- 0004: модуль Elliott Wave Lab (docs/specs/ELLIOTT.md §12.3, §19): attempts.module допускает 'elliott'.
-- skill_stats.skill - свободный текст (ew-impulse, ew-correction, ew-rules, ew-invalidation), правка не нужна.

alter table public.attempts drop constraint if exists attempts_module_check;
alter table public.attempts
  add constraint attempts_module_check check (module in ('market-structure', 'price-action', 'challenge', 'fibonacci', 'elliott'));
