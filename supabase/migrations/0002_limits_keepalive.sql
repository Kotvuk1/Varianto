-- 0002: ограничения размера jsonb (защита квоты Free) и keepalive() для суточного пинга.

alter table public.attempts
  add constraint attempts_answer_size check (pg_column_size(answer) <= 262144),
  add constraint attempts_grade_size check (pg_column_size(grade) <= 262144),
  add constraint attempts_task_token_payload_size check (pg_column_size(task_token_payload) <= 262144);
alter table public.terminal_marks
  add constraint terminal_marks_marks_size check (pg_column_size(marks) <= 262144);
alter table public.settings
  add constraint settings_data_size check (pg_column_size(data) <= 262144);

-- Пинг без доступа к таблицам: anon имеет только execute на эту функцию (revoke anon на таблицах сохраняется).
create or replace function public.keepalive() returns integer
  language sql stable security invoker set search_path = ''
  as $$ select 1 $$;
revoke all on function public.keepalive() from public;
grant execute on function public.keepalive() to anon, authenticated;
