# MRdrive Supabase Connection Fix Guide

## The Problem

Your signup error shows:
```
xn--zrtglawqrdqsmmqbvax-60p.supabase.co/auth/v1/signup: Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

The `xn--` prefix indicates **Punycode encoding** - your Supabase domain is being corrupted during transmission.

---

## Root Causes & Solutions

### Option 1: Use the MRdrive Proxy (Recommended)

The MRdrive project includes a **Vercel proxy** specifically for cases where direct Supabase access doesn't work.

**Steps:**

1. **Deploy the proxy to Vercel:**
   ```bash
   cd mrdrive-main/proxy
   vercel deploy
   ```

2. **Get the proxy URL** (Vercel will give you something like `https://mrdrive-proxy-xyz.vercel.app`)

3. **Update config.js:**
   ```javascript
   // BEFORE:
   const SUPABASE_URL = "https://hharvpgnqmjbbgnfsauq.supabase.co";
   
   // AFTER:
   const SUPABASE_URL = "https://mrdrive-proxy-xyz.vercel.app";
   const SUPABASE_ANON_KEY = "sb_publishable_enRXsK8Yqzn_goNRUHBocg_DPvuWUDb"; // stays the same
   ```

4. **Test in browser** - the signup should work now

---

### Option 2: Fix Network/DNS Issues

If you're hosting this locally or on a custom domain:

**Check these:**
- [ ] Your hosting domain's CORS headers allow Supabase
- [ ] No proxies/VPNs are mangling the domain
- [ ] The Supabase URL is correct: `https://hharvpgnqmjbbgnfsauq.supabase.co`
- [ ] Browser console shows no CSP (Content Security Policy) violations

**For Vercel deployment:**
- Add `vercel.json` configuration
- Make sure environment variables are set properly

---

### Option 3: Direct Supabase Test

Before using the proxy, test direct access:

```javascript
// Open browser console on your login page and run:

const test = await fetch("https://hharvpgnqmjbbgnfsauq.supabase.co/auth/v1/config");
if (test.ok) {
  console.log("✅ Supabase is reachable");
} else {
  console.log("❌ Supabase access denied:", test.status);
}
```

If this fails → **use Option 1 (Proxy)**

---

## What the Proxy Does

The `mrdrive-proxy` is a Vercel serverless function that:
- Accepts requests from your frontend
- Forwards them to Supabase
- Returns the response (bypassing any local network blocks)
- Keeps your ANON_KEY safe (it's public anyway, but the proxy adds a layer)

---

## Files to Update

1. **config.js** - Update SUPABASE_URL to proxy URL
2. **config.local.js** - Same update
3. **api/config.js** - If deployed separately

---

## Quick Checklist

- [ ] Is the Supabase project active?
- [ ] Are auth settings enabled in Supabase?
- [ ] Did you run the setup SQL files?
  ```sql
  -- Run in Supabase SQL editor:
  -- 1. setup.sql
  -- 2. setup-part2.sql (or setup-mcp-anon.sql if using MCP)
  -- 3. enable-realtime.sql
  ```
- [ ] Is the ANON_KEY correct?
- [ ] Try the proxy deployment?

---

## Need More Help?

Check the MRdrive README for:
- Supabase setup instructions
- Proxy deployment details
- Local development setup
