# MRdrive

A simple HTML/JS/CSS drive app — Supabase auth + storage + Postgres.

## Setup steps

1. **Create a Supabase project** — supabase.com/dashboard -> New project

2. **Run the SQL** — Dashboard -> SQL Editor -> copy-paste `setup.sql` -> Run

3. **Create a storage bucket** — Dashboard -> Storage -> New bucket
   - Name: `files`
   - Public: **OFF** (keep it private!)

4. **Configure auth** — Dashboard -> Authentication -> Providers -> make sure Email is enabled
   (it is enabled by default, leave it alone)

5. **Get the API keys** — Dashboard -> Settings -> API
   - Project URL
   - anon public key

6. **Kalitlarni Vercel Environment Variables'ga qo'shing** (config.js'ga
   emas!) — bu loyihani (repo ildizini) Vercel'ga deploy qilib, Project →
   Settings → Environment Variables'da:
   - `SUPABASE_URL` — Project URL
   - `SUPABASE_ANON_KEY` — anon public key

   **SERVICE_ROLE_KEY KERAK EMAS** — MCP endi faqat anon key bilan ishlaydi.

   `index.html` bu qiymatlarni endi `/api/config.js` orqali runtime'da
   oladi (qarang `api/config.js`) — repo/kodda hech qanday haqiqiy kalit
   saqlanmaydi.

   Mahalliy (Vercel'siz) sinov uchun `config.local.js` faylidagi
   ko'rsatmalarga qarang.

6b. **MCP uchun SQL (majburiy)** — Dashboard → SQL Editor →
    `setup-mcp-anon.sql` ni Run qiling. Bu service_role o'rniga
    `resolve_mcp_user` + RLS header tekshiruvini qo'shadi.
    Bir marta ishga tushirish kifoya.

7. **Deploy qiling / ishga tushiring**
   ```
   vercel --prod
   ```
   (mahalliy sinov uchun `vercel dev` ishlating — oddiy `npx serve .`
   `/api/config.js`ni ishga tushira olmaydi, chunki u serverless function)

## Important notes

- `SUPABASE_ANON_KEY` can be public — security is enforced through RLS
- NEVER put the `service_role` key anywhere (frontend yoki MCP)
- MCP faqat `SUPABASE_URL` + `SUPABASE_ANON_KEY` ishlatadi
- Each user can only see/delete their own files (the RLS policies guarantee this)
- MCP ulanish: `https://mrdrive.vercel.app/api/mcp?name=<Name>&token=<48hex>`
  Token = sha256(sha256(username)+sha256(password))[:48]

## Updating the schema (if you installed earlier)

If the public link / folder features don't work, also run `setup-part2.sql`
in the Supabase SQL Editor — it safely adds the missing columns
(is_public, public_token, etc.). If the public link feature is already
working for you, you don't need this step — the columns are already there.

## Delete button does nothing?

Run `fix-delete.sql` in the Supabase SQL Editor. It re-creates the delete
policies for the `files` table and the storage bucket (safe to run repeatedly).

## Claude orqali fayl almashish (MCP)

`mcp/` papkasida Claude (AI) bilan shu MRdrive orasida fayl almashishga
imkon beruvchi kichik MCP server bor — u xuddi shu Supabase `files`
bucket'ni ishlatadi.

Har bir hisob: `/api/mcp?name=<Name>&token=<48hex>`
Token = sha256(sha256(username)+sha256(password))[:48] — brauzerda
hisoblanadi, MCP_TOKEN_SECRET kerak emas. Name case-sensitive.

Batafsil: `mcp/README.md`.

