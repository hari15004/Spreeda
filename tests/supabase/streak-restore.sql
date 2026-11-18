-- 005_test: scratch test (asli streaks ko touch nahi karta)
create table public.streaks_test (
  user_id uuid not null,
  language text not null,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_day date,
  total_xp int not null default 0,
  unlocked_day int not null default 1,
  lost_streak int not null default 0,
  restore_need int not null default 0,
  restore_done int not null default 0,
  restore_day date,
  primary key (user_id, language)
);
alter table public.streaks_test enable row level security;

create or replace function public.complete_lesson_test(
  p_user uuid, p_language text, p_day int, p_score int, p_today date
)
returns public.streaks_test
language plpgsql as $$
declare
  v_row public.streaks_test;
  v_gap int; v_new int; v_lost int; v_need int; v_done int; v_rday date;
begin
  insert into streaks_test (user_id, language)
  values (p_user, p_language) on conflict do nothing;

  select * into v_row from streaks_test
  where user_id = p_user and language = p_language;

  if p_day <> v_row.unlocked_day or p_score < 80 then return v_row; end if;

  v_gap := p_today - v_row.last_active_day;
  v_lost := 0; v_need := 0; v_done := 0; v_rday := null;

  if v_row.last_active_day = p_today then
    v_new := v_row.current_streak;
    if v_row.restore_day = p_today and v_row.restore_need > 0 then
      v_done := v_row.restore_done + 1;
      if v_done >= v_row.restore_need then
        v_new := v_row.lost_streak; v_done := 0;
      else
        v_lost := v_row.lost_streak; v_need := v_row.restore_need; v_rday := p_today;
      end if;
    end if;
  elsif v_gap = 1 then
    v_new := v_row.current_streak + 1;
  elsif v_gap between 2 and 6 and v_row.current_streak > 0 then
    v_new := 1; v_lost := v_row.current_streak;
    v_need := v_gap; v_done := 1; v_rday := p_today;
  else
    v_new := 1;
  end if;

  update streaks_test
     set current_streak = v_new,
         longest_streak = greatest(longest_streak, v_new),
         last_active_day = p_today,
         total_xp = total_xp + 10,
         unlocked_day = unlocked_day + 1,
         lost_streak = v_lost, restore_need = v_need,
         restore_done = v_done, restore_day = v_rday
   where user_id = p_user and language = p_language
   returning * into v_row;
  return v_row;
end $$;

do $$
declare
  r public.streaks_test;
  u1 uuid := '00000000-0000-0000-0000-000000000001';
  u2 uuid := '00000000-0000-0000-0000-000000000002';
  u3 uuid := '00000000-0000-0000-0000-000000000003';
  u4 uuid := '00000000-0000-0000-0000-000000000004';
  i int;
begin
  -- 1: naya user, roz pass, same din ka 2nd lesson
  r := complete_lesson_test(u1,'t',1,90,'2026-01-01'); assert r.current_streak=1, 'naya user';
  r := complete_lesson_test(u1,'t',2,90,'2026-01-02'); assert r.current_streak=2, 'din 2';
  r := complete_lesson_test(u1,'t',3,90,'2026-01-03'); assert r.current_streak=3, 'din 3';
  r := complete_lesson_test(u1,'t',4,90,'2026-01-03'); assert r.current_streak=3, 'same din +1 nahi';
  r := complete_lesson_test(u1,'t',5,50,'2026-01-04'); assert r.current_streak=3, 'fail score';

  -- 2: Ram, 5 din miss, 6th din 6 pass -> streak 10 wapas
  insert into streaks_test (user_id,language,current_streak,last_active_day,unlocked_day)
  values (u2,'t',10,'2026-01-01',11);
  r := complete_lesson_test(u2,'t',11,90,'2026-01-07');
  assert r.current_streak=1 and r.restore_need=6 and r.lost_streak=10, 'restore start';
  for i in 12..15 loop r := complete_lesson_test(u2,'t',i,90,'2026-01-07'); end loop;
  assert r.current_streak=1 and r.restore_done=5, 'restore beech mein';
  r := complete_lesson_test(u2,'t',16,90,'2026-01-07');
  assert r.current_streak=10, 'restore poora';

  -- 3: Ram adhura chhodta hai (5 pass), agla din
  insert into streaks_test (user_id,language,current_streak,last_active_day,unlocked_day)
  values (u3,'t',10,'2026-01-01',11);
  for i in 11..15 loop r := complete_lesson_test(u3,'t',i,90,'2026-01-07'); end loop;
  r := complete_lesson_test(u3,'t',16,90,'2026-01-08');
  assert r.current_streak=2 and r.lost_streak=0, 'adhura restore khatam';

  -- 4: gap 7 -> streak 1, restore nahi
  insert into streaks_test (user_id,language,current_streak,last_active_day,unlocked_day)
  values (u4,'t',10,'2026-01-01',11);
  r := complete_lesson_test(u4,'t',11,90,'2026-01-08');
  assert r.current_streak=1 and r.restore_need=0 and r.lost_streak=0, 'gap 7';
end $$;

select 'ALL OK' as result;

-- test ke baad cleanup (alag se chalana):
-- drop function public.complete_lesson_test(uuid,text,int,int,date);
-- drop table public.streaks_test;