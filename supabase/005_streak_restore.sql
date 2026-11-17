-- 005: streak restore (REVIEW KARKE HI CHALANA)
alter table public.streaks
  add column if not exists lost_streak int not null default 0,
  add column if not exists restore_need int not null default 0,
  add column if not exists restore_done int not null default 0,
  add column if not exists restore_day date;

create or replace function public.complete_lesson(
  p_language text, p_day int, p_score int, p_tz text default 'Asia/Kolkata'
)
returns public.streaks
language plpgsql security definer set search_path = public as $$
declare
  v_today date := (now() at time zone p_tz)::date;
  v_row public.streaks;
  v_gap int;
  v_new int;
  v_lost int;
  v_need int;
  v_done int;
  v_rday date;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;

  insert into streaks (user_id, language)
  values (auth.uid(), p_language)
  on conflict do nothing;

  select * into v_row from streaks
  where user_id = auth.uid() and language = p_language
  for update;

  if p_day <> v_row.unlocked_day or p_score < 80 then
    return v_row;
  end if;

  v_gap := v_today - v_row.last_active_day;
  v_lost := 0; v_need := 0; v_done := 0; v_rday := null;

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

  update streaks
     set current_streak = v_new,
         longest_streak = greatest(longest_streak, v_new),
         last_active_day = v_today,
         total_xp = total_xp + 10,
         unlocked_day = unlocked_day + 1,
         lost_streak = v_lost,
         restore_need = v_need,
         restore_done = v_done,
         restore_day = v_rday
   where user_id = auth.uid() and language = p_language
   returning * into v_row;

  return v_row;
end $$;