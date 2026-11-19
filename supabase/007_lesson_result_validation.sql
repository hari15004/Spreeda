-- Server-computed lesson scores: the client no longer sends a score.
create table if not exists public.lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  language text not null,
  day int not null check (day between 1 and 30),
  correct_count int not null check (correct_count >= 0),
  total_count int not null check (total_count > 0),
  score int not null check (score between 0 and 100),
  passed boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists lesson_attempts_user_time_idx
  on public.lesson_attempts (user_id, created_at desc);

alter table public.lesson_attempts enable row level security;

create policy "lesson_attempts_read_squad"
  on public.lesson_attempts for select to authenticated
  using (user_id = auth.uid() or public.shares_squad(user_id));

revoke all on public.lesson_attempts from anon, authenticated;
grant select on public.lesson_attempts to authenticated;

-- Replace the client-score RPC signature so old callers cannot submit an arbitrary score.
drop function if exists public.complete_lesson(text, int, int, text);

create or replace function public.complete_lesson(
  p_language text,
  p_day int,
  p_correct_count int,
  p_total_count int,
  p_tz text default 'Asia/Kolkata'
)
returns public.streaks
language plpgsql security definer set search_path = public as $$
declare
  v_today date;
  v_score int;
  v_row public.streaks;
  v_gap int;
  v_new int;
  v_lost int;
  v_need int;
  v_done int;
  v_rday date;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  if p_language is null or length(trim(p_language)) < 2 or length(trim(p_language)) > 24 then
    raise exception 'Invalid language';
  end if;
  if p_day is null or p_day < 1 or p_day > 30 then
    raise exception 'Invalid lesson day';
  end if;
  if p_total_count is null or p_total_count < 1 or p_total_count > 300 then
    raise exception 'Invalid question count';
  end if;
  if p_correct_count is null or p_correct_count < 0 or p_correct_count > p_total_count then
    raise exception 'Invalid correct count';
  end if;
  if p_tz is null or not exists (
    select 1 from pg_timezone_names where name = p_tz
  ) then
    raise exception 'Invalid timezone';
  end if;

  v_today := (now() at time zone p_tz)::date;
  v_score := round((p_correct_count::numeric / p_total_count::numeric) * 100)::int;

  insert into public.lesson_attempts (
    user_id,
    language,
    day,
    correct_count,
    total_count,
    score,
    passed
  )
  values (
    auth.uid(),
    trim(p_language),
    p_day,
    p_correct_count,
    p_total_count,
    v_score,
    v_score >= 80
  );

  insert into public.streaks (user_id, language)
  values (auth.uid(), trim(p_language))
  on conflict do nothing;

  select * into v_row
  from public.streaks
  where user_id = auth.uid() and language = trim(p_language)
  for update;

  if p_day <> v_row.unlocked_day or v_score < 80 then
    return v_row;
  end if;

  v_gap := v_today - v_row.last_active_day;
  v_lost := 0;
  v_need := 0;
  v_done := 0;
  v_rday := null;

  if v_row.last_active_day = v_today then
    v_new := v_row.current_streak;
    if v_row.restore_day = v_today and v_row.restore_need > 0 then
      v_done := v_row.restore_done + 1;
      if v_done >= v_row.restore_need then
        v_new := v_row.lost_streak;
        v_done := 0;
      else
        v_lost := v_row.lost_streak;
        v_need := v_row.restore_need;
        v_rday := v_today;
      end if;
    end if;
  elsif v_gap = 1 then
    v_new := v_row.current_streak + 1;
  elsif v_gap between 2 and 6 and v_row.current_streak > 0 then
    v_new := 1;
    v_lost := v_row.current_streak;
    v_need := v_gap;
    v_done := 1;
    v_rday := v_today;
  else
    v_new := 1;
  end if;

  update public.streaks
     set current_streak = v_new,
         longest_streak = greatest(longest_streak, v_new),
         last_active_day = v_today,
         total_xp = total_xp + 10,
         unlocked_day = unlocked_day + 1,
         lost_streak = v_lost,
         restore_need = v_need,
         restore_done = v_done,
         restore_day = v_rday
   where user_id = auth.uid()
     and language = trim(p_language)
  returning * into v_row;

  return v_row;
end $$;

revoke execute on function
  public.complete_lesson(text, int, int, int, text)
from public, anon;

grant execute on function
  public.complete_lesson(text, int, int, int, text)
to authenticated;
