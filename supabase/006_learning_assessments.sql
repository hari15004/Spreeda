create table if not exists public.learning_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  language text not null,
  item_id text not null,
  skill text not null check (
    skill in ('listening', 'speaking', 'reading', 'writing', 'vocabulary', 'grammar')
  ),
  is_correct boolean not null,
  is_review boolean not null default false,
  studied_on date not null,
  created_at timestamptz not null default now()
);

create index if not exists learning_assessments_user_time_idx
  on public.learning_assessments (user_id, created_at desc);

create unique index if not exists learning_assessments_daily_item_idx
  on public.learning_assessments (user_id, language, item_id, skill, studied_on);

alter table public.learning_assessments enable row level security;

create policy "learning_assessments_read_squad"
  on public.learning_assessments for select to authenticated
  using (user_id = auth.uid() or public.shares_squad(user_id));

revoke all on public.learning_assessments from anon, authenticated;
grant select on public.learning_assessments to authenticated;

create or replace function public.record_learning_assessment(
  p_language text,
  p_item_id text,
  p_skill text,
  p_is_correct boolean,
  p_is_review boolean default false,
  p_timezone text default 'UTC'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_studied_on date;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  if p_language is null or length(p_language) < 2 or length(p_language) > 24 then
    raise exception 'Invalid language';
  end if;
  if p_item_id is null or length(p_item_id) = 0 or length(p_item_id) > 120 then
    raise exception 'Invalid learning item';
  end if;
  if p_skill not in ('listening', 'speaking', 'reading', 'writing', 'vocabulary', 'grammar') then
    raise exception 'Invalid learning skill';
  end if;
  if not exists (select 1 from pg_timezone_names where name = p_timezone) then
    raise exception 'Invalid timezone';
  end if;
  v_studied_on := (now() at time zone p_timezone)::date;

  insert into public.learning_assessments (
    user_id,
    language,
    item_id,
    skill,
    is_correct,
    is_review,
    studied_on
  )
  values (
    auth.uid(),
    p_language,
    p_item_id,
    p_skill,
    p_is_correct,
    coalesce(p_is_review, false)
      and exists (
        select 1
        from public.learning_assessments previous
        where previous.user_id = auth.uid()
          and previous.language = p_language
          and previous.item_id = p_item_id
          and previous.studied_on < v_studied_on
      ),
    v_studied_on
  )
  on conflict (user_id, language, item_id, skill, studied_on)
  do update set
    is_correct = excluded.is_correct,
    is_review = public.learning_assessments.is_review or excluded.is_review,
    created_at = now();
end;
$$;

revoke execute on function
  public.record_learning_assessment(text, text, text, boolean, boolean, text)
from public, anon;

grant execute on function
  public.record_learning_assessment(text, text, text, boolean, boolean, text)
to authenticated;
