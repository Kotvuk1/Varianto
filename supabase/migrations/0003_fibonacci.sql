-- 0003: модуль Fibonacci Playground (docs/specs/FIBONACCI.md §14 п.2): attempts.module допускает 'fibonacci'.
-- skill_stats.skill - свободный текст, правка не нужна.

alter table public.attempts drop constraint if exists attempts_module_check;
alter table public.attempts
  add constraint attempts_module_check check (module in ('market-structure', 'price-action', 'challenge', 'fibonacci'));
