-- Тест RLS (NFR-SEC-02, AC-16). Запуск: см. docs/SETUP_SUPABASE_VERCEL.md, раздел «Проверка миграции».
-- Любая неудачная проверка падает исключением; в конце печатается RLS TESTS PASSED.
\set ON_ERROR_STOP on
insert into auth.users (id) values ('11111111-1111-1111-1111-111111111111'), ('22222222-2222-2222-2222-222222222222');

create function pg_temp.expect_error(q text) returns void language plpgsql as $$
begin
  begin execute q; exception when others then return; end;
  raise exception 'ожидалась ошибка: %', q;
end $$;
create function pg_temp.expect_count(q text, n int) returns void language plpgsql as $$
declare c int;
begin
  execute 'with s as (' || q || ') select count(*) from s' into c;
  if c <> n then raise exception 'ожидалось % строк, получено %: %', n, c, q; end if;
end $$;
grant execute on function pg_temp.expect_error(text), pg_temp.expect_count(text, int) to public;

-- 1. профили созданы триггером регистрации (до RLS, как владелец)
select pg_temp.expect_count('select 1 from public.profiles', 2);

-- 2. пользователь A пишет свои данные
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
insert into public.attempts (module, task_id, task_token_payload, answer, grade, algo_version, correct, local_day)
  values ('market-structure', 't1', '{}', '{}', '{"verdict":"correct"}', '0.1.0', true, '2026-11-03');
insert into public.terminal_marks (symbol, marks) values ('BTCUSDT', '[]');
insert into public.settings (data) values ('{"dailyGoal":10}');
insert into public.skill_stats (skill, attempts, correct) values ('bos', 1, 1);
insert into public.daily_activity (day, tasks_done, goal) values ('2026-11-03', 1, 10);
select pg_temp.expect_count('select 1 from public.attempts', 1);
select pg_temp.expect_count('select 1 from public.profiles', 1);

-- 3. подстановка чужого user_id отклоняется
select pg_temp.expect_error($q$insert into public.attempts (user_id, module, task_id, task_token_payload, answer, grade, algo_version, correct, local_day)
  values ('22222222-2222-2222-2222-222222222222','challenge','x','{}','{}','{}','1',true,'2026-11-03')$q$);
select pg_temp.expect_error($q$insert into public.profiles (id) values ('22222222-2222-2222-2222-222222222222')$q$);
select pg_temp.expect_error($q$update public.attempts set user_id = '22222222-2222-2222-2222-222222222222'$q$);

-- 4. пользователь B не видит и не меняет чужое
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
select pg_temp.expect_count('select 1 from public.attempts', 0);
select pg_temp.expect_count('select 1 from public.terminal_marks', 0);
select pg_temp.expect_count('select 1 from public.settings', 0);
select pg_temp.expect_count('select 1 from public.skill_stats', 0);
select pg_temp.expect_count('select 1 from public.daily_activity', 0);
select pg_temp.expect_count('select 1 from public.profiles', 1);  -- только свой
select pg_temp.expect_count('update public.attempts set correct = false returning 1', 0);
select pg_temp.expect_count('delete from public.attempts returning 1', 0);
select pg_temp.expect_count('update public.terminal_marks set marks = ''[1]'' returning 1', 0);
select pg_temp.expect_count('delete from public.profiles where id = ''11111111-1111-1111-1111-111111111111'' returning 1', 0);

-- 5. у B свои строки не пересекаются с A (unique per user)
insert into public.terminal_marks (symbol, marks) values ('BTCUSDT', '[]');
select pg_temp.expect_count('select 1 from public.terminal_marks', 1);

-- 6. A меняет и удаляет своё; триггер updated_at
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
select pg_temp.expect_count('update public.terminal_marks set marks = ''[1]'' returning 1', 1);
select pg_temp.expect_count('select 1 from public.terminal_marks where updated_at > created_at', 1);
-- будущее updated_at ограничивается now()+5 минут
update public.settings set data = '{"dailyGoal":12}', updated_at = now() + interval '1 day';
select pg_temp.expect_count($q$select 1 from public.settings where updated_at <= now() + interval '5 minutes 1 second'$q$, 1);
-- прошлое updated_at сохраняется (нужно для импорта)
update public.settings set data = '{"dailyGoal":13}', updated_at = '2020-01-01';
select pg_temp.expect_count($q$select 1 from public.settings where updated_at = '2020-01-01'$q$, 1);
select pg_temp.expect_count('delete from public.attempts returning 1', 1);

-- 7. anon: нет прав вообще
reset role;
set role anon;
select pg_temp.expect_error('select 1 from public.attempts');
select pg_temp.expect_error('insert into public.settings (data) values (''{}'')');

select pg_temp.expect_count('select public.keepalive()', 1);
reset role;

-- 8. ограничения размера jsonb (0002); keepalive доступен anon
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
select pg_temp.expect_error($q$insert into public.settings (data) values (to_jsonb(repeat(md5(random()::text), 20000)))$q$);
select pg_temp.expect_error($q$update public.terminal_marks set marks = to_jsonb(array(select md5(i::text || random()::text) from generate_series(1, 20000) i))$q$);
select pg_temp.expect_error($q$insert into public.attempts (module, task_id, task_token_payload, answer, grade, algo_version, correct, local_day)
  values ('challenge','big','{}', to_jsonb(array(select md5(i::text || random()::text) from generate_series(1, 20000) i)),'{}','1',true,'2026-11-03')$q$);

-- 0003/0004: модули fibonacci и elliott допустимы, неизвестный модуль - нет
insert into public.attempts (module, task_id, task_token_payload, answer, grade, algo_version, correct, local_day)
  values ('fibonacci', 'fib1', '{}', '{}', '{"verdict":"correct"}', '1.2.0', true, '2026-11-04');
insert into public.attempts (module, task_id, task_token_payload, answer, grade, algo_version, correct, local_day)
  values ('elliott', 'ew1', '{}', '{}', '{"verdict":"correct"}', '1.3.0', true, '2026-11-05');
-- 0005: модули курса допустимы
insert into public.attempts (module, task_id, task_token_payload, answer, grade, algo_version, correct, local_day)
  select m, 'cur-' || m, '{}', '{}', '{"verdict":"correct"}', '2.0.0', true, '2026-11-07'
  from unnest(array['stage-swings','levels','limit-entry','stop-take','combo-level-trade','combo-smc-entry']) as m;
select pg_temp.expect_error($q$insert into public.attempts (module, task_id, task_token_payload, answer, grade, algo_version, correct, local_day)
  values ('chess','x','{}','{}','{}','1',true,'2026-11-05')$q$);
reset role;

select 'RLS TESTS PASSED' as result;
