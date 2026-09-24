/* ============================================================
   Copy this file to config.js and fill in your Supabase keys
   and Google Analytics Measurement Stream ID.
   Get Supabase keys from: Supabase → Project Settings → API
   Get GA Stream ID from: Google Analytics → Admin → Data Streams (format: G-XXXXXXXXXX)

   config.js is gitignored so secrets are not committed.
   On Vercel, `npm run build` generates config.js from env vars.
   ============================================================ */

window.SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
window.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_PUBLIC_KEY';
window.GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

