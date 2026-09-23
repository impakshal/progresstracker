/* ==========================================
   SUPABASE CLIENT BOOTSTRAP
   ========================================== */

window.SupabaseApp = {
  client: null,
  configured: false,

  init: function () {
    const url = window.SUPABASE_URL || '';
    const key = window.SUPABASE_ANON_KEY || '';
    const placeholder =
      !url ||
      !key ||
      url.includes('YOUR_PROJECT_REF') ||
      key.includes('YOUR_SUPABASE_ANON');

    if (placeholder) {
      this.configured = false;
      this.client = null;
      console.info(
        '[Supabase] Not configured. App runs in local/guest mode. ' +
          'Set config.js (or Vercel env vars) to enable cloud sync.'
      );
      return null;
    }

    if (typeof window.supabase?.createClient !== 'function') {
      console.error('[Supabase] SDK failed to load from CDN.');
      this.configured = false;
      this.client = null;
      return null;
    }

    this.client = window.supabase.createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    this.configured = true;
    return this.client;
  },

  getClient: function () {
    return this.client;
  },

  isReady: function () {
    return this.configured && !!this.client;
  }
};
