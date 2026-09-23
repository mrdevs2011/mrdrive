# MRdrive Deployment & Supabase Connection Guide

## Current Issue

Your MRdrive signup is failing with:
```
xn--zrtglawqrdqsmmqbvax-60p.supabase.co/auth/v1/signup: Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

This means the Supabase domain is being corrupted (Punycode encoding indicates possible proxy/encoding issues).

---

## Solution: Use Vercel + Proxy

### Phase 1: Supabase Setup (Do This First!)

#### 1.1 Create a Supabase Project
- Go to https://supabase.com/dashboard
- Click "New Project"
- Choose region, enter password, wait for setup

#### 1.2 Get Your API Keys
After project is created:
- **Settings → API**
  - Copy: **Project URL** (looks like `https://xxxxxx.supabase.co`)
  - Copy: **anon public key** (looks like `sb_publishable_xxxxx`)

**Keep these safe** - you'll need them in a few steps.

#### 1.3 Enable Email Authentication
- **Authentication → Providers**
- Make sure **Email** is enabled (it is by default)
- Don't need to change anything

#### 1.4 Create Storage Bucket
- **Storage → Buckets**
- Click "New bucket"
  - Name: `files`
  - Public: **OFF** ← Important! Keep it private
- Create bucket

#### 1.5 Run the Setup SQL
- **SQL Editor**
- Delete any placeholder content
- Copy-paste this entire block:

```sql
-- From setup.sql (required)
create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  size integer,
  type text,
  path text,
  created_at timestamp default now(),
  is_public boolean default false,
  public_token text unique,
  is_folder boolean default false
);

alter table files enable row level security;

create policy "Users can view own files"
  on files for select
  using (auth.uid() = user_id or is_public = true);

create policy "Users can insert own files"
  on files for insert
  with check (auth.uid() = user_id);

create policy "Users can update own files"
  on files for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own files"
  on files for delete
  using (auth.uid() = user_id);

-- Storage bucket policies
create policy "Users can upload to their folder"
  on storage.objects for insert
  with check (
    bucket_id = 'files' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own files in storage"
  on storage.objects for select
  using (
    bucket_id = 'files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (select is_public from files where files.path = objects.name)
    )
  );

create policy "Users can delete own files in storage"
  on storage.objects for delete
  using (
    bucket_id = 'files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

- Click **Run**
- It should say "Success"

---

### Phase 2: Deploy Proxy to Vercel

The proxy solves the domain resolution issue.

#### 2.1 Get Vercel Ready
- Go to https://vercel.com (create account if needed)
- Install Vercel CLI: `npm i -g vercel`
- Login: `vercel login`

#### 2.2 Deploy the Proxy
From your mrdrive folder:

```bash
cd mrdrive-main/proxy
vercel deploy
```

When asked:
- "Set up and deploy?" → `y`
- "Which scope?" → Your personal account
- "Link to existing project?" → `n`
- "Project name?" → `mrdrive-proxy`
- "Modify vercel.json?" → `n`

Wait for deployment. **Copy the URL** you get (like `https://mrdrive-proxy-abc123.vercel.app`)

#### 2.3 Update Proxy's Supabase URL
The proxy needs to know where to forward requests to:

1. Go to your proxy's Vercel project
2. **Settings → Environment Variables**
3. No additional setup needed - the proxy reads from `api/[...path].js` which is already configured

Actually, let me check the proxy file... looking at it, you might need to update `api/[...path].js` - it should already have your Supabase URL.

---

### Phase 3: Deploy MRdrive to Vercel

#### 3.1 Push to GitHub (Optional but Recommended)
If you want Vercel to auto-deploy on git push:

```bash
cd mrdrive-main
git init
git add .
git commit -m "Initial MRdrive setup"
git remote add origin https://github.com/YOUR_USERNAME/mrdrive.git
git push -u origin main
```

#### 3.2 Deploy Main App
```bash
cd ..  # Back to mrdrive-main root
vercel deploy --prod
```

When asked:
- "Set up and deploy?" → `y`
- "Which scope?" → Your personal account
- "Link to existing project?" → `n` (first time)
- "Project name?" → `mrdrive`
- "Modify vercel.json?" → `n`

**Copy the URL** you get (like `https://mrdrive-xyz.vercel.app`)

#### 3.3 Add Environment Variables to MRdrive
1. Go to your MRdrive Vercel project (Settings)
2. **Settings → Environment Variables**
3. Add these (from your Supabase keys):
   ```
   SUPABASE_URL = https://xxxxxx.supabase.co
   SUPABASE_ANON_KEY = sb_publishable_xxxxx
   SUPABASE_SERVICE_ROLE_KEY = sb_service_role_xxxxx  (get from Settings → API)
   ```
4. Click "Save"

#### 3.4 Redeploy with Environment Variables
```bash
vercel deploy --prod
```

The app will redeploy with the real keys.

---

### Phase 4: (Optional) Switch to Proxy for Direct Access

If you want to add the proxy layer (recommended for reliability):

1. In your MRdrive Vercel project **Settings → Environment Variables**
2. Change `SUPABASE_URL`:
   ```
   SUPABASE_URL = https://mrdrive-proxy-abc123.vercel.app
   ```
   (Use the proxy URL from Phase 2.2)

3. Keep `SUPABASE_ANON_KEY` the same
4. Redeploy: `vercel deploy --prod`

---

## Testing the Setup

1. Go to your MRdrive URL: `https://mrdrive-xyz.vercel.app/login`
2. Click "Sign up"
3. Fill in:
   - Name: `Test User`
   - Username: `testuser`
   - Password: `testpass123`
4. Click "Sign up"

**Expected:**
- ✅ Account created
- ✅ Redirects to main app
- ✅ Can upload files
- ✅ Can create folders

**If still failing:**
- Check browser console for errors
- Check Vercel deployment logs
- Verify Supabase auth is enabled
- Try the proxy URL instead of direct Supabase

---

## Local Development (Optional)

To test locally before deploying:

```bash
cd mrdrive-main
npm install
vercel env pull  # Get environment variables locally
vercel dev       # Starts local dev server with api/ support
```

Then open `http://localhost:3000/login`

---

## Quick Checklist

Before launching:

- [ ] Supabase project created
- [ ] `files` storage bucket created (private)
- [ ] setup.sql ran successfully
- [ ] API keys copied (Project URL + Anon Key)
- [ ] Proxy deployed to Vercel
- [ ] MRdrive deployed to Vercel
- [ ] Environment variables set (SUPABASE_URL, SUPABASE_ANON_KEY)
- [ ] Test signup works

---

## Troubleshooting

### "Failed to load resource: net::ERR_NAME_NOT_RESOLVED"
→ Use the **proxy** (Phase 4). This error means direct Supabase access is blocked.

### "User already exists"
→ Normal. You already signed up this username. Try a different username.

### Signup works but can't upload files
→ Check Supabase storage permissions. Run the setup SQL again.

### "SUPABASE_URL is undefined"
→ Environment variables aren't set. Go to Vercel Settings and add them, then redeploy.

### Local test works, Vercel doesn't
→ Add environment variables to Vercel, then redeploy.

---

## Need Help?

- MRdrive main project: Check the root README.md
- Supabase docs: https://supabase.com/docs
- Vercel deployment: https://vercel.com/docs
