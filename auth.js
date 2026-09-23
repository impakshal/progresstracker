/* ==========================================
   DAILY PROGRESS TRACKER - AUTHENTICATION ENGINE
   User Registration, Login, Session & Account Scoping
   ========================================== */

const USERS_STORAGE_KEY = 'progress_tracker_users_db_v1';
const SESSION_STORAGE_KEY = 'progress_tracker_active_session_v1';

window.AuthManager = {
  currentUser: null,

  init: function () {
    this.loadSession();
    this.bindAuthEvents();
    this.updateUserUI();
  },

  // ----------------------------------------------------
  // Session & Storage Handlers
  // ----------------------------------------------------
  loadSession: function () {
    try {
      const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionData) {
        this.currentUser = JSON.parse(sessionData);
      } else {
        // Default to Guest Mode
        this.currentUser = null;
      }
    } catch (e) {
      console.error('Error loading auth session', e);
      this.currentUser = null;
    }
  },

  getUsersDB: function () {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  },

  saveUsersDB: function (db) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(db));
  },

  saveSession: function (userObj) {
    this.currentUser = userObj;
    if (userObj) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userObj));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    this.updateUserUI();

    if (window.App?.onAuthUserChanged) {
      window.App.onAuthUserChanged(userObj);
    }
  },

  // Get current active user key for scoping localStorage
  getUserStorageKey: function () {
    if (this.currentUser?.email) {
      return `progress_tracker_logs_user_${this.currentUser.email.toLowerCase()}`;
    }
    return 'progress_tracker_daily_logs_v1';
  },

  // ----------------------------------------------------
  // Sign Up Routine
  // ----------------------------------------------------
  signUp: function (name, email, password, goalTrack) {
    const db = this.getUsersDB();
    const cleanEmail = email.trim().toLowerCase();

    if (db[cleanEmail]) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: this.simpleHash(password),
      goalTrack: goalTrack || 'General Growth',
      createdAt: new Date().toISOString()
    };

    db[cleanEmail] = newUser;
    this.saveUsersDB(db);

    // Auto login after sign up
    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      goalTrack: newUser.goalTrack
    };
    this.saveSession(sessionUser);
    return sessionUser;
  },

  // ----------------------------------------------------
  // Login Routine
  // ----------------------------------------------------
  login: function (email, password) {
    const db = this.getUsersDB();
    const cleanEmail = email.trim().toLowerCase();
    const user = db[cleanEmail];

    if (!user) {
      throw new Error('No account found with this email address.');
    }

    if (user.password !== this.simpleHash(password)) {
      throw new Error('Incorrect password. Please try again.');
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      goalTrack: user.goalTrack
    };

    this.saveSession(sessionUser);
    return sessionUser;
  },

  // Logout Routine
  logout: function () {
    this.saveSession(null);
    window.App?.showToast?.('Logged out. Switched to Guest Mode.', 'success');
  },

  // Basic client-side string hash helper for mock security
  simpleHash: function (str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
  },

  // ----------------------------------------------------
  // UI & Event Bindings
  // ----------------------------------------------------
  updateUserUI: function () {
    const userPill = document.getElementById('user-profile-pill');
    const userNameEl = document.getElementById('user-display-name');
    const userAvatarEl = document.getElementById('user-avatar-initial');
    const guestNotice = document.getElementById('guest-mode-banner');

    if (this.currentUser) {
      if (userPill) userPill.classList.remove('hidden');
      if (userNameEl) userNameEl.textContent = this.currentUser.name;
      if (userAvatarEl) {
        const initials = this.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        userAvatarEl.textContent = initials || 'U';
      }
      if (guestNotice) guestNotice.classList.add('hidden');
    } else {
      if (userPill) userPill.classList.remove('hidden'); // Show Login/Signup trigger
      if (userNameEl) userNameEl.textContent = 'Guest User (Login)';
      if (userAvatarEl) userAvatarEl.textContent = '🔑';
      if (guestNotice) guestNotice.classList.remove('hidden');
    }
  },

  bindAuthEvents: function () {
    // Open Auth Modal
    const profilePill = document.getElementById('user-profile-pill');
    const authModal = document.getElementById('auth-modal-backdrop');
    const profileModal = document.getElementById('profile-modal-backdrop');
    const closeAuthModal = document.getElementById('btn-close-auth-modal');
    const closeProfileModal = document.getElementById('btn-close-profile-modal');

    if (profilePill) {
      profilePill.addEventListener('click', () => {
        if (this.currentUser) {
          this.openProfileModal();
        } else {
          this.openAuthModal();
        }
      });
    }

    if (closeAuthModal && authModal) {
      closeAuthModal.addEventListener('click', () => {
        authModal.classList.remove('active');
      });
    }

    if (closeProfileModal && profileModal) {
      closeProfileModal.addEventListener('click', () => {
        profileModal.classList.remove('active');
      });
    }

    // Auth Modal Tab Switcher (Login vs Sign Up)
    const tabLogin = document.getElementById('auth-tab-login');
    const tabSignup = document.getElementById('auth-tab-signup');
    const formLogin = document.getElementById('auth-form-login');
    const formSignup = document.getElementById('auth-form-signup');

    if (tabLogin && tabSignup && formLogin && formSignup) {
      tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        formLogin.classList.remove('hidden');
        formSignup.classList.add('hidden');
      });

      tabSignup.addEventListener('click', () => {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        formSignup.classList.remove('hidden');
        formLogin.classList.add('hidden');
      });
    }

    // Submit Login Form
    if (formLogin) {
      formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email')?.value;
        const pass = document.getElementById('login-password')?.value;
        const errorEl = document.getElementById('login-error-msg');

        if (errorEl) errorEl.classList.add('hidden');

        try {
          this.login(email, pass);
          authModal.classList.remove('active');
          if (window.App) window.App.showToast(`Welcome back, ${this.currentUser.name}!`, 'success');
        } catch (err) {
          if (errorEl) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('hidden');
          }
        }
      });
    }

    // Submit Sign Up Form
    if (formSignup) {
      formSignup.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name')?.value;
        const email = document.getElementById('signup-email')?.value;
        const pass = document.getElementById('signup-password')?.value;
        const goal = document.getElementById('signup-goal')?.value;
        const errorEl = document.getElementById('signup-error-msg');

        if (errorEl) errorEl.classList.add('hidden');

        try {
          this.signUp(name, email, pass, goal);
          authModal.classList.remove('active');
          if (window.App) window.App.showToast(`Account created! Welcome, ${this.currentUser.name}!`, 'success');
        } catch (err) {
          if (errorEl) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('hidden');
          }
        }
      });
    }

    // Logout Button in Profile Modal
    const logoutBtn = document.getElementById('btn-profile-logout');
    if (logoutBtn && profileModal) {
      logoutBtn.addEventListener('click', () => {
        profileModal.classList.remove('active');
        this.logout();
      });
    }

    // Guest Banner Sign In Link Trigger
    const guestSignInBtn = document.getElementById('btn-guest-signin-link');
    if (guestSignInBtn) {
      guestSignInBtn.addEventListener('click', () => {
        this.openAuthModal();
      });
    }
  },

  openAuthModal: function () {
    const authModal = document.getElementById('auth-modal-backdrop');
    if (authModal) authModal.classList.add('active');
  },

  openProfileModal: function () {
    const profileModal = document.getElementById('profile-modal-backdrop');
    if (!profileModal || !this.currentUser) return;

    document.getElementById('profile-name-text').textContent = this.currentUser.name;
    document.getElementById('profile-email-text').textContent = this.currentUser.email;
    document.getElementById('profile-goal-text').textContent = this.currentUser.goalTrack || 'General Growth';

    profileModal.classList.add('active');
  }
};

// Initialize Auth Engine when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  window.AuthManager.init();
});
