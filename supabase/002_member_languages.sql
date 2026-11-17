-- squad ab kisi ek language se bandha nahi
alter table public.squads alter column language drop not null;

-- har user ki apni language
alter table public.profiles
  add column if not exists learning_language text not null default 'japanese';

-- create_squad: language ab optional
create or replace function public.create_squad(p_name text, p_language text default null)
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