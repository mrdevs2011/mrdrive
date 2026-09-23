-- ============================================================
-- MRdrive: fix public share links (?share=TOKEN)
-- Supabase Dashboard → SQL Editor → Run
-- ============================================================
-- "File not found" on share links is almost always RLS:
--   1) anon cannot SELECT rows where is_public = true
--   2) owner cannot UPDATE is_public / public_token (link never saved)
--   3) storage signed URL fails for anonymous visitors
-- ============================================================

-- 1) Columns
alter table public.files add column if not exists is_public boolean default false;
alter table public.files add column if not exists public_token text;
alter table public.files add column if not exists expires_at timestamptz;
alter table public.files add column if not exists folder text;
alter table public.files add column if not exists download_count integer default 0;

-- Unique token (ignore if already exists)
do $$ begin
  alter table public.files add constraint files_public_token_key unique (public_token);
exception
  when duplicate_object then null;
  when duplicate_table then null;
end $$;

create index if not exists files_public_token_idx
  on public.files (public_token)
  where public_token is not null;

alter table public.files enable row level security;

-- 2) SELECT: owner OR public link
drop policy if exists "users select own files" on public.files;
drop policy if exists "anyone can read public files" on public.files;
drop policy if exists "Users can view own files" on public.files;

create policy "files select own or public"
  on public.files
  for select
  using (
    auth.uid() = user_id
    or (is_public = true and public_token is not null)
  );

-- 3) INSERT / DELETE (owner only)
drop policy if exists "users insert own files" on public.files;
create policy "files insert own"
  on public.files for insert
  with check (auth.uid() = user_id);

drop policy if exists "users delete own files" on public.files;
create policy "files delete own"
  on public.files for delete
  using (auth.uid() = user_id);

-- 4) UPDATE — required to set is_public + public_token when creating a link
drop policy if exists "users update own files" on public.files;
drop policy if exists "Users can update own files" on public.files;
create policy "files update own"
  on public.files for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5) increment_download_count — callable by anon on public download
create or replace function public.increment_download_count(file_id bigint)
returns void
language sql
security definer
set search_path = public
as $$
  update public.files
  set download_count = coalesce(download_count, 0) + 1
  where id = file_id
    and is_public = true;
$$;

grant execute on function public.increment_download_count(bigint) to anon, authenticated;

-- 6) STORAGE (bucket: files) — signed URLs for public visitors
-- Object must be able to SELECT objects that belong to a public file row.

drop policy if exists "users read own folder" on storage.objects;
drop policy if exists "public read public files" on storage.objects;
drop policy if exists "Users can view own files in storage" on storage.objects;

create policy "storage select own or public file"
  on storage.objects
  for select
  using (
    bucket_id = 'files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1
        from public.files f
        where f.storage_path = name
          and f.is_public = true
          and f.public_token is not null
      )
    )
  );

-- Keep upload / delete for owners (re-create if missing)
drop policy if exists "users upload own folder" on storage.objects;
create policy "storage insert own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete own folder" on storage.objects;
create policy "storage delete own folder"
  on storage.objects for delete
  using (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- Optional check after running:
--   select id, filename, is_public, public_token, expires_at
--   from public.files
--   where is_public = true;
--
-- If rows show is_public=true and public_token set, open:
--   https://YOUR_DOMAIN/?share=<public_token>
-- ============================================================
