# MRdrive

Oddiy HTML/JS/CSS drive app — Supabase auth (email/magic link) + storage + Postgres.

## Ishga tushirish qadamlari

1. **Supabase project yarat** — supabase.com/dashboard -> New project

2. **SQL ishga tushir** — Dashboard -> SQL Editor -> `setup.sql` faylini copy-paste qil -> Run

3. **Storage bucket yarat** — Dashboard -> Storage -> New bucket
   - Nomi: `files`
   - Public: **OFF** (private qilib qo'y!)

4. **Auth sozla** — Dashboard -> Authentication -> Providers -> Email yoqilganini tekshir
   (default holatda yoqilgan bo'ladi, tegma)

5. **API kalitlarni ol** — Dashboard -> Settings -> API
   - Project URL
   - anon public key

6. **config.js ni to'ldir** — shu ikkitasini o'sha faylga qo'y

7. **Ishga tushir** — `index.html` ni brauzerda och, yoki:
   ```
   npx serve .
   ```
   (to'g'ridan-to'g'ri file:// orqali ochsa ham ishlaydi, lekin serve orqali ochish tavsiya etiladi)

## Muhim eslatma

- `SUPABASE_ANON_KEY` public bo'lishi mumkin — xavfsizlik RLS orqali ta'minlanadi
- `service_role` key'ni HECH QACHON frontendga qo'yma
- Har bir user faqat o'zining fayllarini ko'radi/o'chiradi (RLS policy shuni ta'minlaydi)
