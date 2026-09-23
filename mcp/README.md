# MRdrive MCP

Bu kichik loyiha Claude (AI) bilan MRdrive orasida fayl almashishga imkon
beradi — xuddi web ilovada login qilib fayl yuklagandek, lekin Claude
orqali "shu faylni MRdrive'ga qo'y" yoki "u faylni menga ber" deb
so'rash orqali.

**Muhim:** bu `service_role` kalit yoki Supabase dashboard'ga kirishni
talab qilmaydi — faqat `config.js`dagi bilan bir xil ochiq `anon key` va
sizning MRdrive ilovasidagi (web sahifada login qilgan) username/parolingiz
ishlatiladi. Xavfsizlik xuddi web ilovadagi kabi RLS orqali ta'minlanadi:
Claude faqat sizning o'z fayllaringizni ko'radi/o'zgartiradi.

## Tool'lar

- **push** — faylni (base64) MRdrive'ga yuklaydi — web ilovada darhol ko'rinadi
- **pull** — fayl uchun vaqtinchalik yuklab olish linkini qaytaradi
- **list** — barcha fayllar ro'yxati
- **delete** — faylni o'chiradi

## O'rnatish

### 1. Bu papkani (`mcp`) alohida Vercel loyihasi sifatida deploy qiling

```bash
cd mcp
npm install
npx vercel login
npx vercel --prod
```

(`proxy/` papkasi qanday alohida Vercel loyihasi bo'lsa, `mcp/` ham xuddi
shunday — bitta repo ichida, lekin Vercel'da alohida deploy qilinadi.)

### 2. Environment variables qo'shish

Vercel loyiha sozlamalarida (Project → Settings → Environment Variables):

| Nom | Qiymat |
|---|---|
| `SUPABASE_URL` | `config.js`dagi bilan bir xil (masalan `https://xxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | `config.js`dagi bilan bir xil |
| `MRDRIVE_USERNAME` | MRdrive web ilovasida login qiladigan username |
| `MRDRIVE_PASSWORD` | shu username uchun parol |

Qo'shgandan so'ng qayta deploy qiling (`npx vercel --prod`).

### 3. Claude'ga connector sifatida ulash

Vercel bergan domenni oling, masalan:
`https://mrdrive-mcp-xxxx.vercel.app`

MCP endpoint manzili: `https://mrdrive-mcp-xxxx.vercel.app/api/mcp`

claude.ai → Settings → Connectors → "Add custom connector" orqali shu
URL'ni qo'shing.

## Ishlatish

Claude bilan gaplashganda:

> "Shu faylni MRdrive'ga qo'y va linkini ber"
> "MRdrive'da nima bor?"
> "X faylni kompyuterimga tushirib beray, linkini ber"
> "Y faylni MRdrive'dan o'chir"

Kompyuterga tushirish uchun (agar `cmc`/terminal connector ham ulangan
bo'lsa), Claude olgan linkni to'g'ridan-to'g'ri ishlatadi:

```bash
curl -o fayl.zip "<pull tool qaytargan link>"
```

## Eslatma

- Har bir tool chaqiruvida server sizning nomingizdan qayta login qiladi
  (xuddi brauzerda "Login" tugmasini bosgandek) — bu bir necha yuz
  millisekund qo'shimcha vaqt oladi, lekin xavfsizlik jihatidan eng
  soddasi: alohida "service" hisob yoki maxfiy administrator kaliti
  kerak emas.
- Agar MRdrive parolingizni almashtirsangiz, shu ikkita environment
  variable'ni ham Vercel'da yangilashni unutmang.
