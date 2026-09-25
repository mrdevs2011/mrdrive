# MRdrive MCP

Bu qism Claude (AI) bilan MRdrive orasida fayl almashishga imkon
beradi — xuddi web ilovada login qilib fayl yuklagandek, lekin Claude
orqali "shu faylni MRdrive'ga qo'y" yoki "u faylni menga ber" deb
so'rash orqali.

**Ko'p foydalanuvchili:** har bir MRdrive hisobi o'zining shaxsiy,
doimiy MCP havolasiga ega. Bitta domen, bitta deploy:

- `mcp/index.html` → `/mcp` sahifasi — login qilingandan keyin shaxsiy
  MCP havolangizni ko'rsatadi
- `api/mcp-token.js` → sessiyadan name + mcp_token ni o'qib URL qaytaradi
- `api/mcp.js` → haqiqiy MCP server: `/api/mcp?name=...&token=...`

## Tool'lar

- **push** — AI chaqirmaydi. CMC yo'q + push: yumshoq javob — tool yo'q, lekin list/pull/folder/delete/move bor.
- **pull** — fayl uchun ochiq (`?share=...`) link qaytaradi
- **list** — fayllar ro'yxati
- **delete** — faylni o'chiradi
- **move_file** — faylni boshqa papkaga ko'chiradi
- **unpublish** — ochiq linkni bekor qiladi
- **refresh_link** — yangi link yaratadi
- **list_folders** / **create_folder** / **delete_folder**

## Shaxsiy MCP havola qanday ishlaydi

### Token formulasi (server siri YO'Q)

```
uHash = sha256(username)           # 64 hex
pHash = sha256(password)           # 64 hex
token = sha256(uHash + pHash)[:48] # 48 hex — ikki marta hash
```

- Token **brauzerda** (Web Crypto) hisoblanadi — parol serverga yuborilmaydi.
- Signup va login paytida `user_metadata.mcp_token` ga yoziladi.
- URL: `/api/mcp?name=<Name>&token=<48hex>`
- **name** — hisobni identifikatsiya qilish uchun (Claude'da 4 ta account
  ulaganda "Muhammadrasul" vs "Kamoliddin" deb ajratasiz). Username emas.
- **name case-sensitive:** `Muhammadrasul` ≠ `muhammadrasul`. Mos kelmasa
  server xato qaytaradi.

### Oqim

1. Foydalanuvchi `/mcp` ga kiradi — avval MRdrive'ga login bo'lishi shart.
2. Agar `mcp_token` metadata da bo'lsa — darhol URL ko'rsatiladi.
3. Bo'lmasa (eski hisob) — username + parol so'raladi, brauzerda hash
   qilinadi, metadata ga yoziladi, URL chiqadi.
4. Claude shu havolaga ulanganda server:
   - `resolve_mcp_user` RPC orqali `name` + `token` bo'yicha user_id topadi
   - Mos kelmasa xato; mos kelsa faqat shu user_id fayllari bilan ishlaydi

### Nega parol hash, UID emas?

- `MCP_TOKEN_SECRET` kerak emas — oddiy foydalanuvchi ham ishlata oladi,
  server siri sozlanishi shart emas.
- Token faqat username+parol biladigan odamda chiqadi.
- Ikki marta hash (48+48 → yana 48) — URL qisqa (~50 belgi token), lekin
  oldingisidan ham xavfsizroq.

## O'rnatish

### 1. Environment variables

| Nom | Qiymat |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role (secret) — **MCP uchun majburiy** |

**`MCP_TOKEN_SECRET` KERAK EMAS.**

`SUPABASE_SERVICE_ROLE_KEY` nima uchun: MCP turli user nomidan ishlaydi;
har so'rovda token+name orqali aniq `user_id` topiladi va qo'lda filtrlanadi.

### 2. MCP havolangizni oling

1. `https://<domen>/mcp` oching
2. MRdrive'ga login qiling
3. Havolani nusxalang (ko'z belgisi + "Nusxalash")
4. claude.ai → Settings → Connectors → Add custom connector

### 3. Bir nechta account

Bitta Claude'ga 4 ta MRdrive ulamoqchi bo'lsangiz:

- Har bir hisob uchun alohida `/mcp` dan havola oling
- URL dagi `name=` qiymati hisobni ajratadi (masalan `Muhammadrasul`,
  `Kamoliddin`) — username emas, chunki dunyoda bir xil ism ko'p bo'lishi mumkin,
  lekin sizning name + token juftligi noyob

## Eslatma

- Name va token mos kelmasa (jumladan katta/kichik harf) — server xato beradi.
- Parol o'zgarsa — qayta login qiling (yoki `/mcp` da parolni qayta kiriting);
  yangi token chiqadi, eski havola ishlamaydi.
- Token hech qachon ochiq matnda saqlanmaydi: faqat hash `user_metadata` da.
