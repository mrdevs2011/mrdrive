-- ============================================================
-- MRdrive MCP: service_role KEYSIZ ishlashi uchun
-- Faqat SUPABASE_URL + SUPABASE_ANON_KEY bilan MCP ishlaydi.
-- Supabase Dashboard -> SQL Editor -> shu faylni Run qiling.
-- Bir marta ishga tushirish kifoya (safe to re-run).
-- ============================================================

-- 1) Token + name orqali user_id ni topish (admin API o'rniga)
create or replace function public.resolve_mcp_user(p_name text, p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
begin
  if p_name is null or p_name = '' or p_token is null or length(p_token) <> 48 then
    return null;
  end if;

  select id into uid
  from auth.users
  where lower(coalesce(raw_user_meta_data->>'mcp_token', '')) = lower(p_token)
    and coalesce(raw_user_meta_data->>'name', '') = p_name
  limit 1;

  return uid;
end;
$$;

revoke all on function public.resolve_mcp_user(text, text) from public;
grant execute on function public.resolve_mcp_user(text, text) to anon, authenticated;

-- 2) Header dagi x-mcp-token ni tekshiradigan yordamchi
-- supabase-js createClient({ global: { headers: { 'x-mcp-token': token } } })
create or replace function public.mcp_token_matches(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  hdr text;
  tok text;
begin
  begin
    hdr := current_setting('request.headers', true);
  exception when others then
    return false;
  end;
  if hdr is null or hdr = '' then
    return false;
  end if;

  tok := lower(coalesce((hdr::json)->>'x-mcp-token', ''));
  if tok = '' or length(tok) <> 48 then
    return false;
  end if;

  return exists (
    select 1
    from auth.users u
    where u.id = p_user_id
      and lower(coalesce(u.raw_user_meta_data->>'mcp_token', '')) = tok
  );
end;
$$;

revoke all on function public.mcp_token_matches(uuid) from public;
grant execute on function public.mcp_token_matches(uuid) to anon, authenticated;

-- 3) files jadvali: mavjud policy'larga MCP ruxsatini qo'shamiz
-- (auth.uid() yoki to'g'ri x-mcp-token)

drop policy if exists "users select own files" on files;
create policy "users select own files"
  on files for select
  using (auth.uid() = user_id or public.mcp_token_matches(user_id));

drop policy if exists "users insert own files" on files;
create policy "users insert own files"
  on files for insert
  with check (auth.uid() = user_id or public.mcp_token_matches(user_id));

drop policy if exists "users update own files" on files;
create policy "users update own files"
  on files for update
  using (auth.uid() = user_id or public.mcp_token_matches(user_id))
  with check (auth.uid() = user_id or public.mcp_token_matches(user_id));

drop policy if exists "users delete own files" on files;
create policy "users delete own files"
  on files for delete
  using (auth.uid() = user_id or public.mcp_token_matches(user_id));

-- public link policy (avvaldan bor, qayta yaratamiz)
drop policy if exists "anyone can read public files" on files;
create policy "anyone can read public files"
  on files for select
  using (is_public = true);

-- 4) folders jadvali
drop policy if exists "users select own folders" on folders;
create policy "users select own folders"
  on folders for select
  using (auth.uid() = user_id or public.mcp_token_matches(user_id));

drop policy if exists "users insert own folders" on folders;
create policy "users insert own folders"
  on folders for insert
  with check (auth.uid() = user_id or public.mcp_token_matches(user_id));

drop policy if exists "users delete own folders" on folders;
create policy "users delete own folders"
  on folders for delete
  using (auth.uid() = user_id or public.mcp_token_matches(user_id));

-- 5) storage.objects (files bucket)
drop policy if exists "users upload own folder" on storage.objects;
create policy "users upload own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
        and public.mcp_token_matches(((storage.foldername(name))[1])::uuid)
      )
    )
  );

drop policy if exists "users read own folder" on storage.objects;
create policy "users read own folder"
  on storage.objects for select
  using (
    bucket_id = 'files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
        and public.mcp_token_matches(((storage.foldername(name))[1])::uuid)
      )
    )
  );

drop policy if exists "users delete own folder" on storage.objects;
create policy "users delete own folder"
  on storage.objects for delete
  using (
    bucket_id = 'files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
        and public.mcp_token_matches(((storage.foldername(name))[1])::uuid)
      )
    )
  );

-- update policy ham kerak bo'lishi mumkin (move va h.k.)
drop policy if exists "users update own folder" on storage.objects;
create policy "users update own folder"
  on storage.objects for update
  using (
    bucket_id = 'files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
        and public.mcp_token_matches(((storage.foldername(name))[1])::uuid)
      )
    )
  )
  with check (
    bucket_id = 'files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
        and public.mcp_token_matches(((storage.foldername(name))[1])::uuid)
      )
    )
  );
