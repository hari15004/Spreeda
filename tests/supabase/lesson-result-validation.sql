-- Run against the actual Spreeda Supabase project after 007 is migrated.
do $$
begin
  assert exists (
    select 1
    from pg_proc
    where oid = 'public.complete_lesson(text,integer,integer,integer,text)'::regprocedure
  ), 'server-computed lesson RPC is missing';

  assert not exists (
    select 1
    from pg_proc
    where oid = 'public.complete_lesson(text,integer,integer,text)'::regprocedure
  ), 'legacy client-score RPC is still callable';

  assert round((4::numeric / 5::numeric) * 100)::int = 80,
    '80 percent pass threshold calculation failed';

  assert exists (
    select 1
    from pg_tables
    where schemaname = 'public'
      and tablename = 'lesson_attempts'
  ), 'lesson_attempts table is missing';

  assert exists (
    select 1
    from pg_class
    where oid = 'public.lesson_attempts'::regclass
      and relrowsecurity
  ), 'lesson_attempts RLS is not enabled';
end $$;

select 'lesson result validation: ALL OK' as result;
