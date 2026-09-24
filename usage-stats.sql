-- MRdrive: Usage (Supabase storage) ko'rsatkichi
-- Supabase Dashboard -> SQL Editor -> shu faylni ishga tushiring.
-- Xavfsiz: bir necha marta ishga tushirsa ham bo'ladi (limit qiymatini qayta yozmaydi).
--
-- Supabase rejaning umumiy storage kvotasini loyiha API orqali bermaydi,
-- shuning uchun limit shu yerda, bazadagi BITTA joyda saqlanadi
-- (Free = 1 GB). Reja o'zgarsa, pastdagi "LIMITNI O'ZGARTIRISH" ni bajaring —
-- ilovani qayta joylashtirish shart emas.

create table if not exists public.app_settings (
  key   text primary key,
  value text not null
);
alter table public.app_settings enable row level security;
-- Siyosat yo'q = brauzer jadvalni to'g'ridan-to'g'ri o'qiy olmaydi.
-- Faqat pastdagi security definer funksiyasi o'qiydi.

insert into public.app_settings (key, value)
values ('storage_limit_bytes', '1073741824')          -- 1 GB (Free reja)
on conflict (key) do nothing;

create or replace function public.get_storage_usage()
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'video', coalesce(sum(size) filter (
      where filename ~* '\.(mp4|m4v|mov|webm|mkv|avi|wmv|flv|mpe?g|3gp|ogv)$'), 0),
    'image', coalesce(sum(size) filter (
      where filename ~* '\.(png|jpe?g|gif|webp|avif|bmp|svg|ico|heic|heif|tiff?)$'), 0),
    'file',  coalesce(sum(size) filter (
      where filename !~* '\.(mp4|m4v|mov|webm|mkv|avi|wmv|flv|mpe?g|3gp|ogv|png|jpe?g|gif|webp|avif|bmp|svg|ico|heic|heif|tiff?)$'), 0),
    'mine',  coalesce(sum(size) filter (where user_id = auth.uid()), 0),
    'count', count(*),
    'limit', coalesce(
      (select value::bigint from app_settings where key = 'storage_limit_bytes'),
      1073741824)
  )
  from files;
$$;

revoke all on function public.get_storage_usage() from public;
grant execute on function public.get_storage_usage() to authenticated;

-- ---------------------------------------------------------------
-- LIMITNI O'ZGARTIRISH (masalan Pro reja: 100 GB):
-- update public.app_settings
--   set value = (100::bigint * 1024 * 1024 * 1024)::text
--   where key = 'storage_limit_bytes';
-- ---------------------------------------------------------------
