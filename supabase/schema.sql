-- ========== TABLES ==========
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Learner',
  created_at timestamptz not null default now()
);

create table public.squads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  language text not null,
  invite_code text not null unique default substr(md5(random()::text), 1, 6),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.squad_members (
  squad_id uuid not null references public.squads(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (squad_id, user_id)
);

create table public.streaks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  language text not null,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_day date,
  total_xp int not null default 0,
  unlocked_day int not null default 1,
  primary key (user_id, language)
);

-- ========== HELPERS ==========
create or replace function public.is_squad_member(p_squad uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from squad_members
    where squad_id = p_squad and user_id = auth.uid()
  );
$$;

create or replace function public.shares_squad(p_user uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from squad_members a
    join squad_members b on a.squad_id = b.squad_id
    where a.user_id = auth.uid() and b.user_id = p_user
  );
$$;

-- profile auto-create on signup
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- squad max 6
create or replace function public.enforce_squad_size() returns trigger
language plpgsql as $$
begin
  if (select count(*) from public.squad_members where squad_id = new.squad_id) >= 6 then
    raise exception 'Squad full (max 6)';
  end if;
  return new;
end $$;

create trigger squad_size_guard
before insert on public.squad_members
for each row execute function public.enforce_squad_size();

-- ========== GAME LOGIC ==========
create or replace function public.create_squad(p_name text, p_language text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  insert into squads (name, language, owner_id)
  values (p_name, p_language, auth.uid())
  returning id into v_id;
  insert into squad_members (squad_id, user_id) values (v_id, auth.uid());
  return v_id;
end $$;

create or replace function public.join_squad(p_code text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_squad uuid;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select id into v_squad from squads where invite_code = lower(trim(p_code));
  if v_squad is null then raise exception 'Invalid code'; end if;
  insert into squad_members (squad_id, user_id)
  values (v_squad, auth.uid())
  on conflict do nothing;
  return v_squad;
end $$;

-- pass (score >= 80) hone par hi day unlock + streak update
create or replace function public.complete_lesson(
  p_language text, p_day int, p_score int, p_tz text default 'Asia/Kolkata'
)
returns public.streaks
language plpgsql security definer set search_path = public as $$
declare
  v_today date := (now() at time zone p_tz)::date;
  v_row public.streaks;
  v_new int;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;

  insert into streaks (user_id, language)
  values (auth.uid(), p_language)
  on conflict do nothing;

  select * into v_row from streaks
  where user_id = auth.uid() and language = p_language
  for update;

  -- skip ya replay: kuch change nahi
  if p_day <> v_row.unlocked_day or p_score < 80 then
    return v_row;
  end if;

  v_new := case
    when v_row.last_active_day = v_today then v_row.current_streak
    when v_row.last_active_day = v_today - 1 then v_row.current_streak + 1
    else 1
  end;

  update streaks
     set current_streak = v_new,
         longest_streak = greatest(longest_streak, v_new),
         last_active_day = v_today,
         total_xp = total_xp + 10,
         unlocked_day = unlocked_day + 1
   where user_id = auth.uid() and language = p_language
   returning * into v_row;

  return v_row;
end $$;

revoke execute on function
  public.complete_lesson(text, int, int, text),
  public.create_squad(text, text),
  public.join_squad(text)
from public, anon;

grant execute on function
  public.complete_lesson(text, int, int, text),
  public.create_squad(text, text),
  public.join_squad(text)
to authenticated;

-- ========== SECURITY (RLS) ==========
alter table public.profiles enable row level security;
alter table public.squads enable row level security;
alter table public.squad_members enable row level security;
alter table public.streaks enable row level security;

create policy "profiles_read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.shares_squad(id));

create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "squads_read" on public.squads for select to authenticated
  using (public.is_squad_member(id));

create policy "members_read" on public.squad_members for select to authenticated
  using (public.is_squad_member(squad_id));

create policy "members_leave" on public.squad_members for delete to authenticated
  using (user_id = auth.uid());

create policy "streaks_read" on public.streaks for select to authenticated
  using (user_id = auth.uid() or public.shares_squad(user_id));