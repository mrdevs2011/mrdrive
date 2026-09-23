# 🚀 MRdrive Supabase Connection - QUICK FIX

**Your Error:** `ERR_NAME_NOT_RESOLVED` on Supabase domain

**Root Cause:** Direct Supabase access is being blocked/encoded

**Solution:** Deploy the proxy

---

## 30-Second Setup

### Step 1: Deploy Proxy (2 minutes)
```bash
cd mrdrive-main/proxy
vercel deploy
# Copy the URL it gives you (e.g., https://mrdrive-proxy-xxx.vercel.app)
```

### Step 2: Update MRdrive Config
Edit `config.js`:
```javascript
// BEFORE:
const SUPABASE_URL = "https://hharvpgnqmjbbgnfsauq.supabase.co";

// AFTER (use proxy URL from step 1):
const SUPABASE_URL = "https://mrdrive-proxy-xxx.vercel.app";
```

### Step 3: Deploy MRdrive
```bash
cd ../  # back to mrdrive-main
vercel deploy --prod
```

### Step 4: Test
- Open your MRdrive URL
- Click "Sign up"
- Try to create an account
- Should work now ✅

---

## Why This Works

The proxy is a middleman between your browser and Supabase:

```
Browser → Proxy (Vercel) → Supabase
```

Instead of:

```
Browser → Supabase (might be blocked)
```

The Vercel proxy doesn't get blocked because it's a well-known domain.

---

## If You Need Supabase Setup First

Make sure Supabase is ready:

1. Create project at https://supabase.com
2. Get **Project URL** and **Anon Key** from Settings → API
3. Create `files` storage bucket (keep private)
4. Run SQL from root `setup.sql` in Supabase SQL Editor

Then follow the 4 steps above.

---

## Environment Variables (For Vercel)

If deploying to Vercel, set these in your MRdrive project settings:

```
SUPABASE_URL = https://mrdrive-proxy-xxx.vercel.app
SUPABASE_ANON_KEY = sb_publishable_xxxxx
SUPABASE_SERVICE_ROLE_KEY = sb_service_role_xxxxx
```

Then redeploy.

---

## Testing Locally

Before deploying:

```bash
cd mrdrive-main
npm install
vercel env pull  # Gets your environment variables
vercel dev       # Starts local server
# Open http://localhost:3000/login
```

If this works, the full Vercel deploy will too.

---

## Checklist

- [ ] Proxy deployed (`mrdrive-proxy`)
- [ ] Proxy URL copied
- [ ] config.js updated with proxy URL
- [ ] MRdrive deployed
- [ ] Test signup works
- [ ] Can upload files
- [ ] Can create folders

---

Done! Your MRdrive is now live. 🎉
