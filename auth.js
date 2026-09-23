/* ==========================================
   DAILY PROGRESS TRACKER - AUTHENTICATION
   Supabase Auth (+ graceful local guest mode)
   ========================================== */

window.AuthManager = {
  currentUser: null,
  _initPromise: null,

  init: function () {
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      window.SupabaseApp?.init();
      this.bindAuthEvents();

      if (!window.SupabaseApp?.isReady()) {
        this.currentUser = null;
        this.updateUserUI();
        return;
      }

      const client = SupabaseApp.getClient();
      const { data, error } = await client.auth.getSession();
      if (error) console.error('[Auth] getSession', error);

      await this.applySession(data?.session || null);

      client.auth.onAuthStateChange(async (_event, session) => {
        await this.applySession(session);
      });
    })();

    return this._initPromise;
  },

  isCloudAuth: function () {
    return !!window.SupabaseApp?.isReady();
  },

  mapSessionUser: function (session, profile) {
    if (!session?.user) return null;
    const u = session.user;
    const meta = u.user_metadata || {};
    return {
      id: u.id,
      email: u.email,
      name: profile?.full_name || meta.full_name || meta.name || (u.email || '').split('@')[0],
      goalTrack: profile?.goal_track || meta.goal_track || 'General Growth'
    };
  },

  fetchProfile: async function (userId) {
    const client = SupabaseApp.getClient();
    const { data, error } = await client
      .from('profiles')
      .select('full_name, goal_track')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[Auth] profile fetch', error.message);
      return null;
    }
    return data;
  },

  applySession: async function (session) {
    if (!session?.user) {
      this.currentUser = null;
      this.updateUserUI();
      if (window.App?.onAuthUserChanged) {
        await window.App.onAuthUserChanged(null);
      }
      return;
    }

    const profile = await this.fetchProfile(session.user.id);
    this.currentUser = this.mapSessionUser(session, profile);
    this.updateUserUI();

    if (window.App?.onAuthUserChanged) {
      await window.App.onAuthUserChanged(this.currentUser);
    }
  },

  getUserStorageKey: function () {
    if (this.currentUser?.id) {
      return `progress_tracker_logs_user_${this.currentUser.id}`;
    }
    if (this.currentUser?.email) {
      return `progress_tracker_logs_user_${this.currentUser.email.toLowerCase()}`;
    }
    return 'progress_tracker_daily_logs_v1';
  },

  getUserId: function () {
    return this.currentUser?.id || null;
  },

  signUp: async function (name, email, password, goalTrack) {
    if (!this.isCloudAuth()) {
      throw new Error(
        'Supabase is not configured. Add your project URL and anon key to config.js first.'
      );
    }

    const client = SupabaseApp.getClient();
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await client.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: name.trim(),
          goal_track: goalTrack || 'General Growth'
        }
      }
    });

    if (error) throw new Error(error.message);

    if (!data.session) {
      return {
        needsConfirmation: true,
        email: cleanEmail
      };
    }

    await this.applySession(data.session);
    return { needsConfirmation: false, user: this.currentUser };
  },

  login: async function (email, password) {
    if (!this.isCloudAuth()) {
      throw new Error(
        'Supabase is not configured. Add your project URL and anon key to config.js first.'
      );
    }

    const client = SupabaseApp.getClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      const raw = error.message || 'Login failed';
      // Supabase uses this same message for wrong password AND unconfirmed / missing users
      if (/invalid login credentials/i.test(raw)) {
        throw new Error(
          'Invalid email or password. Also check: (1) user exists in Supabase → Authentication → Users, (2) email is confirmed, or turn OFF “Confirm email” while testing.'
        );
      }
      if (/email not confirmed/i.test(raw)) {
        throw new Error(
          'Email not confirmed yet. Open the confirmation link, or disable “Confirm email” in Supabase Auth settings for testing.'
        );
      }
      throw new Error(raw);
    }

    await this.applySession(data.session);
    return this.currentUser;
  },

  logout: async function () {
    if (this.isCloudAuth()) {
      const { error } = await SupabaseApp.getClient().auth.signOut();
      if (error) console.error('[Auth] signOut', error);
    }
    this.currentUser = null;
    this.updateUserUI();
    if (window.App?.onAuthUserChanged) {
      await window.App.onAuthUserChanged(null);
    }
    window.App?.showToast?.('Logged out. Switched to Guest Mode.', 'success');
  },

  updateUserUI: function () {
    const userNameEl = document.getElementById('user-display-name');
    const userAvatarEl = document.getElementById('user-avatar-initial');
    const guestNotice = document.getElementById('guest-mode-banner');
    const cloudBadge = document.getElementById('cloud-status-text');

    if (this.currentUser) {
      if (userNameEl) userNameEl.textContent = this.currentUser.name;
      if (userAvatarEl) {
        const initials = this.currentUser.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        userAvatarEl.textContent = initials || 'U';
      }
      if (guestNotice) guestNotice.classList.add('hidden');
      if (cloudBadge) cloudBadge.textContent = 'Cloud sync on';
    } else {
      if (userNameEl) userNameEl.textContent = 'Guest User (Login)';
      if (userAvatarEl) userAvatarEl.textContent = '🔑';
      if (guestNotice) guestNotice.classList.remove('hidden');
      if (cloudBadge) {
        cloudBadge.textContent = this.isCloudAuth()
          ? 'Local guest mode'
          : 'Supabase not configured';
      }
    }
  },

  bindAuthEvents: function () {
    const authModal = document.getElementById('auth-modal-backdrop');
    const profileModal = document.getElementById('profile-modal-backdrop');

    document.getElementById('user-profile-pill')?.addEventListener('click', () => {
      if (this.currentUser) this.openProfileModal();
      else this.openAuthModal();
    });

    document.getElementById('btn-close-auth-modal')?.addEventListener('click', () => {
      authModal?.classList.remove('active');
    });

    document.getElementById('btn-close-profile-modal')?.addEventListener('click', () => {
      profileModal?.classList.remove('active');
    });

    const tabLogin = document.getElementById('auth-tab-login');
    const tabSignup = document.getElementById('auth-tab-signup');
    const formLogin = document.getElementById('auth-form-login');
    const formSignup = document.getElementById('auth-form-signup');

    tabLogin?.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabSignup?.classList.remove('active');
      formLogin?.classList.remove('hidden');
      formSignup?.classList.add('hidden');
    });

    tabSignup?.addEventListener('click', () => {
      tabSignup.classList.add('active');
      tabLogin?.classList.remove('active');
      formSignup?.classList.remove('hidden');
      formLogin?.classList.add('hidden');
    });

    formLogin?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('login-error-msg');
      if (errorEl) errorEl.classList.add('hidden');

      try {
        await this.login(
          document.getElementById('login-email')?.value,
          document.getElementById('login-password')?.value
        );
        authModal?.classList.remove('active');
        window.App?.showToast?.(`Welcome back, ${this.currentUser.name}!`, 'success');
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = err.message;
          errorEl.classList.remove('hidden');
        }
      }
    });

    formSignup?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('signup-error-msg');
      if (errorEl) errorEl.classList.add('hidden');

      try {
        const result = await this.signUp(
          document.getElementById('signup-name')?.value,
          document.getElementById('signup-email')?.value,
          document.getElementById('signup-password')?.value,
          document.getElementById('signup-goal')?.value
        );

        authModal?.classList.remove('active');

        if (result.needsConfirmation) {
          window.App?.showToast?.(
            `Check ${result.email} to confirm your account, then log in.`,
            'warning'
          );
        } else {
          window.App?.showToast?.(
            `Account created! Welcome, ${this.currentUser.name}!`,
            'success'
          );
        }
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = err.message;
          errorEl.classList.remove('hidden');
        }
      }
    });

    document.getElementById('btn-profile-logout')?.addEventListener('click', async () => {
      profileModal?.classList.remove('active');
      await this.logout();
    });

    document.getElementById('btn-guest-signin-link')?.addEventListener('click', () => {
      this.openAuthModal();
    });
  },

  openAuthModal: function () {
    if (!this.isCloudAuth()) {
      window.App?.showToast?.(
        'Add your Supabase URL and anon key to config.js to enable accounts.',
        'warning'
      );
    }
    document.getElementById('auth-modal-backdrop')?.classList.add('active');
  },

  openProfileModal: function () {
    if (!this.currentUser) return;
    document.getElementById('profile-name-text').textContent = this.currentUser.name;
    document.getElementById('profile-email-text').textContent = this.currentUser.email;
    document.getElementById('profile-goal-text').textContent =
      this.currentUser.goalTrack || 'General Growth';
    document.getElementById('profile-modal-backdrop')?.classList.add('active');
  }
};
