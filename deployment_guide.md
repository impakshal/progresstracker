# Deploy Daily Progress Tracker (Vercel + Supabase)

Your app is a static site. **Vercel** hosts it; **Supabase** handles auth and cloud log sync. Without Supabase keys, the app still works in **guest / localStorage** mode.

---

## What was added in the codebase

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Tables, RLS policies, profile trigger |
| `config.js` / `config.example.js` | Supabase URL + anon key |
| `supabaseClient.js` | Creates the browser client |
| `auth.js` | Supabase email/password auth |
| `app.js` | Cloud load / upsert / clear + guest fallback |
| `scripts/write-config.js` | Builds `config.js` from Vercel env vars |
| `vercel.json` | Static deploy settings |

---

## Step 1 — Create a Supabase project

1. Open [https://supabase.com](https://supabase.com) and create a project.
2. Wait until the database is ready.
3. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key  

   Never put the **service_role** key in this frontend.

---

## Step 2 — Run the SQL schema

1. In Supabase, open **SQL Editor → New query**.
2. Paste everything from `supabase/schema.sql`.
3. Click **Run**.

This creates `profiles`, `daily_logs`, RLS policies, and the signup profile trigger.

---

## Step 3 — Enable Email Auth

1. **Authentication → Providers → Email** → enable.
2. For testing, you can turn **off** “Confirm email” under Auth settings so signup logs you in immediately.
3. For production, turn confirmation **on**, then add your site URL under  
   **Authentication → URL Configuration**:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

---

## Step 4 — Add keys locally

Edit `config.js`:

```js
window.SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
window.SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

Open `index.html` in a browser (or `npm start`).  
Guest mode still works; **Login / Create Account** uses Supabase.

---

## Step 5 — Deploy on Vercel

1. Push this folder to GitHub (ideally its own repo).
2. Import the repo in [Vercel](https://vercel.com).
3. Framework: **Other**. Build command is already in `vercel.json` (`npm run build`).
4. Add Environment Variables:
   - `SUPABASE_URL` = your project URL  
   - `SUPABASE_ANON_KEY` = your anon key  
5. Deploy.

The build script writes `config.js` from those env vars on every deploy.

---

## How data works

| Mode | Auth | Where logs live |
|------|------|-----------------|
| Guest | None | Browser `localStorage` |
| Logged in | Supabase Auth | `daily_logs` table (+ local cache) |

On first login, if guest data exists and the cloud account is empty, guest logs are **migrated** automatically.

Analytics still reads `App.logs` — no chart changes needed.

---

## Quick test checklist

- [ ] SQL ran without errors  
- [ ] `config.js` has real URL + anon key  
- [ ] Sign up a user  
- [ ] Log a day → refresh → data still there  
- [ ] Log out → guest mode  
- [ ] Log in on another browser → same logs  
- [ ] Analytics shows KPIs/charts for cloud data  

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| “Supabase is not configured” | Fill `config.js` or Vercel env vars, redeploy |
| Signup works but no session | Disable email confirm for testing, or confirm via email |
| `new row violates row-level security` | Re-run `schema.sql` policies; ensure user is logged in |
| Empty logs after login | Check **Table Editor → daily_logs**; confirm RLS allows select |
| CORS / blocked | Confirm Site URL + Redirect URLs include your Vercel domain |
