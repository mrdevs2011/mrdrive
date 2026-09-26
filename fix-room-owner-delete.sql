-- Run once in Supabase Dashboard -> SQL Editor
-- Room owner can delete ANY file in their room;
-- members keep delete-own only.

drop policy if exists "room owner delete files" on public.files;
create policy "room owner delete files"
  on public.files for delete
  using (
    room_id is not null
    and exists (
      select 1 from public.rooms r
      where r.id = files.room_id
        and r.owner_id = auth.uid()
    )
  );

drop policy if exists "room owner storage delete" on storage.objects;
create policy "room owner storage delete"
  on storage.objects for delete
  using (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = 'rooms'
    and exists (
      select 1 from public.rooms r
      where r.public_token = (storage.foldername(name))[2]
        and r.owner_id = auth.uid()
    )
  );
