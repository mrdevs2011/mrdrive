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

6. **Fill in config.js** — put those two values into that file

7. **Run it** — open `index.html` in a browser, or:
   ```
   npx serve .
   ```
   (opening it directly via file:// works too, but serving it is recommended)

## Important notes

- `SUPABASE_ANON_KEY` can be public — security is enforced through RLS
- NEVER put the `service_role` key in the frontend
- Each user can only see/delete their own files (the RLS policies guarantee this)

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
bucket'ni ishlatadi, alohida hisob yoki service_role kalit kerak emas.
Batafsil: `mcp/README.md`.

