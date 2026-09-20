# MRdrive Supabase Proxy

Bu kichik loyiha — Supabase'ga to'g'ridan-to'g'ri kira olmaganingda, brauzer
o'rniga shu proxy Supabase bilan gaplashadi. MRdrive frontend'i endi
`*.supabase.co`ga emas, shu proxy manziliga murojaat qiladi, proxy esa
Supabase'ga forward qiladi.

## O'rnatish

1. **Bu papkani (`mrdrive-proxy`) alohida GitHub repo qilib yukla** (yoki
   to'g'ridan-to'g'ri Vercel CLI bilan deploy qil).

2. **Vercel'da yangi loyiha sifatida import qil**
   - vercel.com -> Add New -> Project -> shu repo'ni tanla -> Deploy.
   - Hech qanday build sozlamasi kerak emas, default holicha ishlaydi.

3. **`api/[...path].js` ichidagi `SUPABASE_PROJECT_URL`ni tekshir** — u
   allaqachon sening haqiqiy Supabase project URL'ing bilan to'ldirilgan
   (`config.js`dan olindi). Agar Supabase project'ni almashtirsang, shu
   yerni yangila.

4. Deploy tugagach, senga shunga o'xshash manzil beriladi:
   `https://mrdrive-proxy-xxxx.vercel.app`

5. **MRdrive'ning `config.js` faylida** `SUPABASE_URL`ni proxy manziliga
   almashtir:
   ```js
   const SUPABASE_URL = "https://mrdrive-proxy-xxxx.vercel.app";
   const SUPABASE_ANON_KEY = "..."; // bu o'zgarmaydi
   ```

Shu bilan tamom — endi MRdrive brauzerdan to'g'ridan-to'g'ri Supabase'ga
emas, shu Vercel manziliga murojaat qiladi, u esa orqa fonda Supabase bilan
gaplashadi. Login, fayl yuklash, yuklab olish, public link — hammasi shu
proxy orqali ishlaydi (chunki signed URL'lar ham SUPABASE_URL asosida
generatsiya qilinadi, ya'ni ular ham proxy manzilida bo'ladi).

## Eslatma

- Bu faqat auth/rest/storage (oddiy HTTP) so'rovlarini proxy qiladi.
  MRdrive'da realtime (websocket) ishlatilmagani uchun bu yetarli.
- `SUPABASE_ANON_KEY` hali ham public — xavfsizlik Supabase RLS orqali
  ta'minlanadi, proxy buni o'zgartirmaydi.
- Agar Vercel domenlari ham bloklansa, xuddi shu `api/[...path].js`
  mantig'ini Cloudflare Worker sifatida ham joylashtirish mumkin — aytsang,
  o'sha versiyasini ham tayyorlab beraman.
