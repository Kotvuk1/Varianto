-- Trading Lab: начальная схема (docs/DATABASE_SCHEMA.md §3). Применять в Supabase SQL Editor.

-- Служебные функции -----------------------------------------------------------

-- updated_at: если клиент не менял значение — now(); значение из будущего ограничивается now() + 5 минут (защита LWW от кривых часов).
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.updated_at is not distinct from old.updated_at then
    new.updated_at := now();
  end if;
  new.updated_at := least(coalesce(new.updated_at, now()), now() + interval '5 minutes');
  return new;
end $$;

-- profiles ---------------------------------------------------------------------

create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  display_name    text,
  timezone        text,                                   -- IANA, например 'Europe/Moscow'; справочно
  local_import_at timestamptz,                            -- момент импорта локальных данных (раздел 4)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Профиль создаётся при регистрации пользователя.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- attempts ---------------------------------------------------------------------

create table public.attempts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade default auth.uid(),
  module             text not null check (module in ('market-structure', 'price-action', 'challenge')),
  task_id            text not null,
  task_token_payload jsonb not null,           -- RevealedTask: параметры задания, reveal.decisionTime/shiftMs
  answer             jsonb not null,           -- Answer
  grade              jsonb not null,           -- GradeResult без replay
  algo_version       text not null,
  skills             text[] not null default '{}',
  correct            boolean not null,         -- grade.verdict = 'correct'
  r_multiple         numeric(12, 4),           -- только challenge с позицией
  local_day          date not null,            -- локальный день попытки (для цели и серии)
  duration_ms        integer check (duration_ms is null or duration_ms >= 0),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index attempts_user_created_idx on public.attempts (user_id, created_at desc);
create index attempts_user_module_created_idx on public.attempts (user_id, module, created_at desc);
create index attempts_user_local_day_idx on public.attempts (user_id, local_day);
create index attempts_skills_gin_idx on public.attempts using gin (skills);

-- skill_stats (кэш, пересчитывается из attempts) ---------------------------------

create table public.skill_stats (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  skill      text not null,
  attempts   integer not null default 0 check (attempts >= 0),
  correct    integer not null default 0 check (correct >= 0 and correct <= attempts),
  recent     jsonb not null default '[]'::jsonb,       -- [{ "t": <ms>, "ok": <bool> }, ...] последние N исходов
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, skill)
);

-- terminal_marks ----------------------------------------------------------------

create table public.terminal_marks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  symbol     text not null check (symbol ~ '^[A-Z0-9]{2,20}USDT$'),
  marks      jsonb not null default '[]'::jsonb,       -- Mark[] (время/цена, не пиксели)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, symbol)
);

-- settings ----------------------------------------------------------------------

create table public.settings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid() unique,
  data       jsonb not null,                           -- Settings (theme, candleStyle, dailyGoal, ...)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- daily_activity (кэш, пересчитывается из attempts; goal — снимок) ---------------

create table public.daily_activity (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  day        date not null,                            -- локальный день
  tasks_done integer not null default 0 check (tasks_done >= 0),
  goal       integer not null check (goal > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day)
);

-- updated_at ---------------------------------------------------------------------

create trigger touch_profiles       before insert or update on public.profiles       for each row execute function public.touch_updated_at();
create trigger touch_attempts       before insert or update on public.attempts       for each row execute function public.touch_updated_at();
create trigger touch_skill_stats    before insert or update on public.skill_stats    for each row execute function public.touch_updated_at();
create trigger touch_terminal_marks before insert or update on public.terminal_marks for each row execute function public.touch_updated_at();
create trigger touch_settings       before insert or update on public.settings       for each row execute function public.touch_updated_at();
create trigger touch_daily_activity before insert or update on public.daily_activity for each row execute function public.touch_updated_at();

-- RLS (docs/DATABASE_SCHEMA.md §3.1) ----------------------------------------
alter table public.profiles       enable row level security;
alter table public.attempts       enable row level security;
alter table public.skill_stats    enable row level security;
alter table public.terminal_marks enable row level security;
alter table public.settings       enable row level security;
alter table public.daily_activity enable row level security;

-- profiles: владелец определяется по id ------------------------------------------
create policy profiles_select_own on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_insert_own on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_delete_own on public.profiles for delete to authenticated using (id = (select auth.uid()));

-- attempts ---------------------------------------------------------------------
create policy attempts_select_own on public.attempts for select to authenticated using (user_id = (select auth.uid()));
create policy attempts_insert_own on public.attempts for insert to authenticated with check (user_id = (select auth.uid()));
create policy attempts_update_own on public.attempts for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy attempts_delete_own on public.attempts for delete to authenticated using (user_id = (select auth.uid()));

-- skill_stats ------------------------------------------------------------------
create policy skill_stats_select_own on public.skill_stats for select to authenticated using (user_id = (select auth.uid()));
create policy skill_stats_insert_own on public.skill_stats for insert to authenticated with check (user_id = (select auth.uid()));
create policy skill_stats_update_own on public.skill_stats for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy skill_stats_delete_own on public.skill_stats for delete to authenticated using (user_id = (select auth.uid()));

-- terminal_marks ---------------------------------------------------------------
create policy terminal_marks_select_own on public.terminal_marks for select to authenticated using (user_id = (select auth.uid()));
create policy terminal_marks_insert_own on public.terminal_marks for insert to authenticated with check (user_id = (select auth.uid()));
create policy terminal_marks_update_own on public.terminal_marks for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy terminal_marks_delete_own on public.terminal_marks for delete to authenticated using (user_id = (select auth.uid()));

-- settings ---------------------------------------------------------------------
create policy settings_select_own on public.settings for select to authenticated using (user_id = (select auth.uid()));
create policy settings_insert_own on public.settings for insert to authenticated with check (user_id = (select auth.uid()));
create policy settings_update_own on public.settings for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy settings_delete_own on public.settings for delete to authenticated using (user_id = (select auth.uid()));

-- daily_activity ---------------------------------------------------------------
create policy daily_activity_select_own on public.daily_activity for select to authenticated using (user_id = (select auth.uid()));
create policy daily_activity_insert_own on public.daily_activity for insert to authenticated with check (user_id = (select auth.uid()));
create policy daily_activity_update_own on public.daily_activity for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy daily_activity_delete_own on public.daily_activity for delete to authenticated using (user_id = (select auth.uid()));

-- Права ролей: anon не получает ничего (гостевой режим отложен), authenticated работает через RLS.
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on public.profiles, public.attempts, public.skill_stats,
  public.terminal_marks, public.settings, public.daily_activity to authenticated;
