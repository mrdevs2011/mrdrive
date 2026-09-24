-- MRdrive: Usage (Supabase Free tier storage) ko'rsatkichi
-- Supabase Dashboard -> SQL Editor -> shu faylni bir marta ishga tushiring.
-- Xavfsiz: bir necha marta ishga tushirsa ham bo'ladi.
--
-- Funksiya BUTUN loyihadagi (barcha foydalanuvchilar) fayllar hajmini
-- video / rasm / boshqa fayllar bo'yicha qaytaradi. Boshqa userlarning
-- fayl nomlari yoki ma'lumotlari ochilmaydi — faqat yig'indi baytlar.

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
    'count', count(*)
  )
  from files;
$$;

revoke all on function public.get_storage_usage() from public;
grant execute on function public.get_storage_usage() to authenticated;
