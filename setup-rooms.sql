-- ============================================================
-- MRdrive Public Rooms
-- Supabase Dashboard -> SQL Editor -> Run this file once.
-- Safe to re-run (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- ============================================================

-- 1) rooms table
create table if not exists public.rooms (
  id bigint generated always as identity primary key,
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'Room',
  public_token text unique not null,
  created_at timestamptz default now()
);

create index if not exists rooms_owner_id_idx on public.rooms (owner_id);
create index if not exists rooms_public_token_idx on public.rooms (public_token);

alter table public.rooms enable row level security;

-- Owner manages own rooms
drop policy if exists "rooms select own" on public.rooms;
create policy "rooms select own"
  on public.rooms for select
  using (auth.uid() = owner_id);

-- Token lookup via security definer (anon cannot list all rooms)
create or replace function public.get_room_by_token(p_token text)
returns setof public.rooms
language sql
security definer
set search_path = public
as $$
  select * from public.rooms where public_token = p_token limit 1;
$$;

revoke all on function public.get_room_by_token(text) from public;
grant execute on function public.get_room_by_token(text) to anon, authenticated;

-- List files in a room for anyone with the token (used after room resolved)
create or replace function public.list_room_files(p_token text)
returns setof public.files
language sql
security definer
set search_path = public
as $$
  select f.*
  from public.files f
  join public.rooms r on r.id = f.room_id
  where r.public_token = p_token
  order by f.uploaded_at desc;
$$;

revoke all on function public.list_room_files(text) from public;
grant execute on function public.list_room_files(text) to anon, authenticated;

drop policy if exists "rooms insert own" on public.rooms;
create policy "rooms insert own"
  on public.rooms for insert
  with check (auth.uid() = owner_id);

drop policy if exists "rooms update own" on public.rooms;
create policy "rooms update own"
  on public.rooms for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "rooms delete own" on public.rooms;
create policy "rooms delete own"
  on public.rooms for delete
  using (auth.uid() = owner_id);

-- 2) files: room_id + uploader_username
alter table public.files
  add column if not exists room_id bigint references public.rooms(id) on delete cascade;

alter table public.files
  add column if not exists uploader_username text;

create index if not exists files_room_id_idx on public.files (room_id);

-- 3) files RLS — room files visible to everyone; delete still uploader-only
-- Keep existing own-file policies; add room visibility + room insert.

-- Personal + public files via normal select; room files via list_room_files RPC only
drop policy if exists "users select own files" on public.files;
create policy "users select own files"
  on public.files for select
  using (
    auth.uid() = user_id
    or is_public = true
  );

drop policy if exists "users insert own files" on public.files;
create policy "users insert own files"
  on public.files for insert
  with check (
    auth.uid() = user_id
    and (
      room_id is null
      or exists (select 1 from public.rooms r where r.id = room_id)
    )
  );

drop policy if exists "users delete own files" on public.files;
create policy "users delete own files"
  on public.files for delete
  using (auth.uid() = user_id);

drop policy if exists "users update own files" on public.files;
create policy "users update own files"
  on public.files for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4) storage: allow rooms/{token}/{user_id}/... paths
-- Read: anyone (token in path is the secret)
-- Write/delete: only the uploader (3rd path segment = auth.uid())

drop policy if exists "rooms storage select" on storage.objects;
create policy "rooms storage select"
  on storage.objects for select
  using (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = 'rooms'
  );

drop policy if exists "rooms storage insert" on storage.objects;
create policy "rooms storage insert"
  on storage.objects for insert
  with check (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = 'rooms'
    and (storage.foldername(name))[3] = auth.uid()::text
  );

drop policy if exists "rooms storage delete" on storage.objects;
create policy "rooms storage delete"
  on storage.objects for delete
  using (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = 'rooms'
    and (storage.foldername(name))[3] = auth.uid()::text
  );

drop policy if exists "rooms storage update" on storage.objects;
create policy "rooms storage update"
  on storage.objects for update
  using (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = 'rooms'
    and (storage.foldername(name))[3] = auth.uid()::text
  )
  with check (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = 'rooms'
    and (storage.foldername(name))[3] = auth.uid()::text
  );

-- Optional: realtime for rooms table (Dashboard -> Replication if needed)
-- alter publication supabase_realtime add table public.rooms;
