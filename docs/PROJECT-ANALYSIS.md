# MRdrive Project Analysis

## Project Overview

**MRdrive** is a web-based file storage app similar to Google Drive or Dropbox.

### Tech Stack
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Backend**: Vercel serverless functions (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (S3-compatible)
- **Authentication**: Supabase Auth (Email/Password)

---

## Architecture

```
┌─────────────────────────────────────┐
│   MRdrive Frontend (Browser)         │
│  index.html, app.js, style.css       │
└─────────────────┬───────────────────┘
                  │
                  ├─ Direct auth calls (Supabase)
                  ├─ File upload/download
                  └─ RLS queries
                  │
                  ↓
        ┌──────────────────────┐
        │  Vercel Proxy        │  ← OPTIONAL (for reliability)
        │  /api/[...path].js   │
        └──────────┬───────────┘
                   │
                   ↓
        ┌──────────────────────────┐
        │   Supabase             │
        │ - Auth (email/password)│
        │ - PostgreSQL DB        │
        │ - Storage (files)      │
        └──────────────────────────┘
```

### Key Files

#### Frontend (`/`)
- **index.html** - Main app UI (file browser, upload, download)
- **login/index.html** - Sign up / Login form
- **app.js** - 90KB of app logic (file operations, auth, UI)
- **style.css** - Styling
- **config.js** - Supabase credentials (public, read from `/api/config.js` on server)

#### Backend (`/api/`)
- **config.js** - Serves Supabase credentials from environment variables
- **mcp.js** - MCP server endpoint (Claude AI integration)
- **mcp-token.js** - Generates secure tokens for MCP connections
- **mcp-info.js** - MCP metadata

#### Proxy (`/proxy/`)
- **api/[...path].js** - Vercel edge function that forwards requests to Supabase
- Used when direct Supabase access is blocked

#### MCP Module (`/mcp/`)
- Separate MCP server for Claude AI integration
- Can be deployed to Vercel separately
- Provides file access to Claude through MCP

---

## Current Issue

### Symptom
```
xn--zrtglawqrdqsmmqbvax-60p.supabase.co/auth/v1/signup: Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

### Analysis
1. **Punycode Encoding** - The `xn--` prefix indicates the domain is being encoded
2. **DNS Failure** - Browser cannot resolve the Supabase domain
3. **Possible Causes**:
   - Network/ISP blocking
   - Proxy mangling the domain
   - CORS/firewall issues
   - Browser encoding the domain incorrectly

### Solution
Use the **Vercel Proxy** - it's a middleman that bypasses direct Supabase access.

---

## File Structure

```
mrdrive-main/
├── index.html              # Main app
├── app.js                  # All app logic
├── style.css              # Styling
├── config.js              # Supabase credentials (for local testing)
├── config.local.js        # Local testing config
├── package.json           # Dependencies
├── vercel.json            # Vercel config
│
├── login/
│   └── index.html         # Login page
│
├── api/                   # Vercel serverless functions
│   ├── config.js          # Returns SUPABASE_URL + KEY
│   ├── mcp.js             # MCP server endpoint
│   ├── mcp-token.js       # Token generation
│   └── mcp-info.js        # MCP metadata
│
├── proxy/                 # Optional Vercel proxy
│   ├── api/
│   │   └── [...path].js   # Forwards to Supabase
│   ├── package.json
│   └── vercel.json
│
├── mcp/                   # Separate MCP deployment
│   ├── index.html         # MCP frontend
│   ├── api/
│   │   └── mcp.js         # MCP server
│   ├── package.json
│   └── vercel.json
│
└── SQL Scripts/
    ├── setup.sql          # Create tables, RLS policies
    ├── setup-part2.sql    # Add public link features
    ├── enable-realtime.sql # Enable WebSockets (optional)
    └── fix-delete.sql     # Fix delete permissions
```

---

## Features

### User-Facing
✅ Email/password authentication
✅ File upload/download
✅ Folder creation
✅ File deletion
✅ Public file links (share with others)
✅ Real-time file sync (optional)
✅ Private by default (RLS enforces it)

### Admin/Integration
✅ Claude AI integration (MCP)
✅ Secure token-based access
✅ Deployable to Vercel
✅ PostgreSQL database access

---

## Database Schema

### `files` table
```sql
id              uuid (primary key)
user_id         uuid (references auth.users)
name            text (filename)
size            integer (bytes)
type            text (mime type)
path            text (storage path)
created_at      timestamp
is_public       boolean (default false)
public_token    text unique (for public links)
is_folder       boolean (default false)
```

### Storage bucket: `files`
- Private by default
- Organized by user: `{user_id}/{filename}`
- Signed URLs for download
- Delete enforced through RLS

---

## Deployment Options

### Option 1: Direct to Vercel (No Proxy)
```bash
vercel deploy --prod
```
✅ Simpler
❌ Might fail if Supabase is blocked

### Option 2: With Proxy (Recommended)
1. Deploy proxy to Vercel
2. Deploy MRdrive to Vercel (pointing to proxy)
✅ More reliable
✅ Works when Supabase is blocked
❌ Slightly more setup

### Option 3: Local (Development)
```bash
vercel dev
# Opens http://localhost:3000
```
✅ Fast local testing
❌ Requires Node.js and Vercel CLI

---

## Security Notes

- **ANON_KEY** (public): ✅ Safe to commit and put in frontend
  - Security enforced through Supabase RLS policies
  - Each user can only access their own files

- **SERVICE_ROLE_KEY** (secret): ❌ NEVER in frontend
  - Only in Vercel environment variables (server-side)
  - Used for MCP operations (admin access)

- **RLS Policies**: ✅ Enforced on database
  - Users can only see their own files
  - Public files have time-limited signed URLs
  - Deletes only work for file owner

---

## Performance

- **Frontend**: ~100KB JavaScript (includes UI + file operations)
- **Frontend**: ~36KB CSS
- **API calls**: RESTful to Supabase
- **Storage**: S3-compatible (fast downloads)
- **Auth**: Email/password (immediate login)

---

## Customization Ideas

### Easy Changes
- Change logo/branding
- Adjust colors in style.css
- Rename folder/file
- Add features (password protection, sharing)

### Medium Changes
- Add more auth methods (Google, GitHub)
- Add file versioning
- Add trash/recovery
- Add file preview

### Hard Changes
- Use different database (Firebase, etc.)
- Add end-to-end encryption
- Multi-user collaboration (like Google Docs)
- Use different storage (AWS S3, etc.)

---

## Next Steps

1. **Immediate**: Deploy proxy + redeploy with proxy URL
2. **Test**: Sign up works → Upload file → Download works
3. **Share**: Send MRdrive URL to users
4. **Scale**: Monitor Supabase usage, adjust RLS as needed
5. **Enhance**: Add features based on user feedback

---

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MCP Docs**: See `mcp/README.md`
- **Database**: `setup.sql` has detailed comments

---

## Questions?

Check:
- README.md in root (original setup instructions)
- proxy/README.md (proxy deployment)
- mcp/README.md (Claude AI integration)
- Browser console for errors during signup/login
