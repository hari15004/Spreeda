create policy "squads_delete_owner" on public.squads
  for delete to authenticated
  using (owner_id = auth.uid());