/* ==========================================
   DAILY PROGRESS TRACKER - APPLICATION CONTROLLER
   State Management, Event Handlers & Persistence
   ========================================== */

const STORAGE_KEY = 'progress_tracker_daily_logs_v1';
const THEME_KEY = 'progress_tracker_theme_v1';
const GAUGE_CIRCUMFERENCE = 339.292;

window.App = {
  activeDate: window.getLocalDateString(new Date()),
  activeTab: 'logger',
  activeMode: 'all',
  activeAnalyticsPreset: '30days',
  logs: {},
  _saveTimer: null,

  init: function () {
    this.loadTheme();
    this.bindEvents();
    this.setupDateNavigator();
    this.loadDailyLog(this.activeDate);
    this.updateStreakBadge();
  },

  isCloudMode: function () {
    return !!(window.SupabaseApp?.isReady() && window.AuthManager?.getUserId?.());
  },

  onAuthUserChanged: async function () {
    await this.loadLogsFromStorage();
    this.loadDailyLog(this.activeDate);
    this.updateStreakBadge();
    this.refreshActiveSecondaryView();
  },

  refreshActiveSecondaryView: function () {
    if (this.activeTab === 'analytics') this.refreshAnalyticsView();
    if (this.activeTab === 'history') this.renderHistoryList();
  },

  selectAnalyticsPreset: function (preset) {
    this.activeAnalyticsPreset = preset;

    document.querySelectorAll('#preset-pills-group .mode-btn').forEach(btn => {
      const isActive = btn.getAttribute('data-preset') === preset;
      btn.classList.toggle('active', isActive);
      btn.classList.toggle('all', isActive);
    });

    document.querySelector('.custom-range-box')?.classList.remove('active');
    this.refreshAnalyticsView();
  },

  applyCustomDateRange: function () {
    this.activeAnalyticsPreset = 'custom';

    document.querySelectorAll('#preset-pills-group .mode-btn').forEach(btn => {
      btn.classList.remove('active', 'all');
    });
    document.querySelector('.custom-range-box')?.classList.add('active');

    const start = document.getElementById('analytics-start-date')?.value;
    const end = document.getElementById('analytics-end-date')?.value;
    if (start && end && start > end) {
      this.showToast('Start date cannot be after end date', 'warning');
      return;
    }

    this.refreshAnalyticsView();
  },

  refreshAnalyticsView: function () {
    if (!window.AnalyticsEngine?.renderAnalytics) {
      console.warn('AnalyticsEngine is not available.');
      return;
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        const startDateInput = document.getElementById('analytics-start-date');
        const endDateInput = document.getElementById('analytics-end-date');

        if (startDateInput && !startDateInput.value) {
          const d = new Date();
          d.setDate(d.getDate() - 29);
          startDateInput.value = window.getLocalDateString(d);
        }
        if (endDateInput && !endDateInput.value) {
          endDateInput.value = window.getLocalDateString(new Date());
        }

        AnalyticsEngine.renderAnalytics(
          this.logs,
          this.activeAnalyticsPreset || '30days',
          startDateInput?.value || null,
          endDateInput?.value || null
        );
      }, 80);
    });
  },

  loadSampleData: async function () {
    if (!window.SampleDataGenerator?.generate30Days) {
      this.showToast('Demo data generator is unavailable.', 'error');
      return;
    }

    this.logs = SampleDataGenerator.generate30Days();
    await this.saveLogsToStorage({ mode: 'replace' });
    this.loadDailyLog(this.activeDate);
    this.updateStreakBadge();
    this.showToast('Loaded 30 days of sample tracker data!', 'success');

    if (this.activeTab !== 'analytics') {
      this.switchTab('analytics');
    } else {
      this.refreshAnalyticsView();
    }
  },

  clearAllData: async function () {
    if (!confirm('Clear all progress logs for this account? This cannot be undone.')) return;

    this.logs = {};
    await this.saveLogsToStorage({ mode: 'clear' });
    this.loadDailyLog(this.activeDate);
    this.updateStreakBadge();
    this.showToast('All progress logs cleared.', 'error');
    this.refreshActiveSecondaryView();
  },

  loadTheme: function () {
    document.documentElement.setAttribute(
      'data-theme',
      localStorage.getItem(THEME_KEY) || 'light'
    );
  },

  toggleTheme: function () {
    const next = (document.documentElement.getAttribute('data-theme') || 'light') === 'light'
      ? 'dark'
      : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    if (this.activeTab === 'analytics') this.refreshAnalyticsView();
  },

  getStorageKey: function () {
    if (window.AuthManager?.getUserStorageKey) {
      return AuthManager.getUserStorageKey();
    }
    return STORAGE_KEY;
  },

  writeLocalCache: function () {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.logs));
    } catch (e) {
      console.error('Error writing local cache', e);
    }
  },

  readLocalCache: function () {
    try {
      const raw = localStorage.getItem(this.getStorageKey());
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error('Error reading local cache', e);
      return {};
    }
  },

  rowToLog: function (row) {
    const dateStr = row.log_date;
    return {
      id: dateStr,
      date: dateStr,
      morning: row.morning_data || {},
      night: row.night_data || {},
      updatedAt: row.updated_at || new Date().toISOString()
    };
  },

  logToRow: function (dateStr, log, userId) {
    return {
      user_id: userId,
      log_date: dateStr,
      morning_data: log.morning || {},
      night_data: log.night || {},
      updated_at: log.updatedAt || new Date().toISOString()
    };
  },

  loadLogsFromStorage: async function () {
    if (!this.isCloudMode()) {
      this.logs = this.readLocalCache();
      return;
    }

    const client = SupabaseApp.getClient();
    const userId = AuthManager.getUserId();

    const { data, error } = await client
      .from('daily_logs')
      .select('log_date, morning_data, night_data, updated_at')
      .eq('user_id', userId)
      .order('log_date', { ascending: true });

    if (error) {
      console.error('Error loading cloud logs', error);
      this.showToast('Could not load cloud logs — using local cache.', 'warning');
      this.logs = this.readLocalCache();
      return;
    }

    const mapped = {};
    (data || []).forEach((row) => {
      mapped[row.log_date] = this.rowToLog(row);
    });

    // First login: push any guest-local logs into the cloud
    const guestRaw = localStorage.getItem(STORAGE_KEY);
    if (guestRaw && Object.keys(mapped).length === 0) {
      try {
        const guestLogs = JSON.parse(guestRaw);
        if (guestLogs && Object.keys(guestLogs).length > 0) {
          await this.migrateGuestLogs(guestLogs, userId);
          Object.assign(mapped, guestLogs);
          localStorage.removeItem(STORAGE_KEY);
          this.showToast('Migrated guest logs to your cloud account.', 'success');
        }
      } catch (e) {
        console.warn('Guest migration skipped', e);
      }
    }

    this.logs = mapped;
    this.writeLocalCache();
  },

  migrateGuestLogs: async function (guestLogs, userId) {
    const client = SupabaseApp.getClient();
    const rows = Object.keys(guestLogs).map((dateStr) =>
      this.logToRow(dateStr, guestLogs[dateStr], userId)
    );
    if (!rows.length) return;

    const { error } = await client.from('daily_logs').upsert(rows, {
      onConflict: 'user_id,log_date'
    });
    if (error) throw error;
  },

  upsertCloudDay: async function (dateStr) {
    const client = SupabaseApp.getClient();
    const userId = AuthManager.getUserId();
    const log = this.logs[dateStr];

    if (!log) {
      const { error } = await client
        .from('daily_logs')
        .delete()
        .eq('user_id', userId)
        .eq('log_date', dateStr);
      if (error) throw error;
      return;
    }

    const { error } = await client.from('daily_logs').upsert(
      this.logToRow(dateStr, log, userId),
      { onConflict: 'user_id,log_date' }
    );
    if (error) throw error;
  },

  replaceAllCloudLogs: async function () {
    const client = SupabaseApp.getClient();
    const userId = AuthManager.getUserId();

    const { error: delError } = await client
      .from('daily_logs')
      .delete()
      .eq('user_id', userId);
    if (delError) throw delError;

    const rows = Object.keys(this.logs).map((dateStr) =>
      this.logToRow(dateStr, this.logs[dateStr], userId)
    );
    if (!rows.length) return;

    const { error } = await client.from('daily_logs').upsert(rows, {
      onConflict: 'user_id,log_date'
    });
    if (error) throw error;
  },

  clearCloudLogs: async function () {
    const client = SupabaseApp.getClient();
    const userId = AuthManager.getUserId();
    const { error } = await client.from('daily_logs').delete().eq('user_id', userId);
    if (error) throw error;
  },

  saveLogsToStorage: async function (options = {}) {
    const mode = options.mode || 'day';
    const dateStr = options.date || this.activeDate;

    this.writeLocalCache();
    this.updateStreakBadge();

    if (!this.isCloudMode()) return;

    try {
      if (mode === 'clear') {
        await this.clearCloudLogs();
      } else if (mode === 'replace') {
        await this.replaceAllCloudLogs();
      } else {
        await this.upsertCloudDay(dateStr);
      }
    } catch (e) {
      console.error('Cloud save failed', e);
      this.showToast('Saved locally, but cloud sync failed.', 'warning');
    }
  },

  setupDateNavigator: function () {
    const picker = document.getElementById('date-picker');
    if (picker) {
      picker.value = this.activeDate;
      picker.addEventListener('change', (e) => {
        if (e.target.value) this.selectDate(e.target.value);
      });
    }

    const shiftDay = (delta) => {
      const parts = this.activeDate.split('-');
      const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      d.setDate(d.getDate() + delta);
      this.selectDate(window.getLocalDateString(d));
    };

    document.getElementById('btn-prev-day')?.addEventListener('click', () => shiftDay(-1));
    document.getElementById('btn-next-day')?.addEventListener('click', () => shiftDay(1));
    document.getElementById('btn-today')?.addEventListener('click', () => {
      this.selectDate(window.getLocalDateString(new Date()));
    });

    this.renderDayPills();
  },

  selectDate: function (dateStr) {
    this.activeDate = dateStr;
    const picker = document.getElementById('date-picker');
    if (picker) picker.value = dateStr;
    if (this.activeTab !== 'logger') this.switchTab('logger');
    this.renderDayPills();
    this.loadDailyLog(dateStr);
  },

  renderDayPills: function () {
    const container = document.getElementById('day-pills-container');
    if (!container) return;

    container.innerHTML = '';
    const parts = this.activeDate.split('-');
    const current = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const currentDayIndex = current.getDay();

    dayNames.forEach((name, idx) => {
      const pill = document.createElement('div');
      pill.className = `day-pill${idx === currentDayIndex ? ' active' : ''}`;
      pill.textContent = name;
      container.appendChild(pill);
    });
  },

  loadDailyLog: function (dateStr) {
    const log = this.logs[dateStr] || this.createEmptyLog(dateStr);

    const setVal = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    };

    setVal('morning-planned-hours', log.morning?.plannedHours || 0);
    setVal('morning-subjects', log.morning?.subjects || '');
    setVal('morning-affirmation', log.morning?.affirmation || '');
    setVal('night-completed-hours', log.night?.completedHours || 0);
    setVal('night-challenges', log.night?.challenges || '');
    setVal('night-solutions', log.night?.solutions || '');
    setVal('night-learned', log.night?.learned || '');
    setVal('night-reflections', log.night?.reflections || '');

    this.renderTargetsList(log.morning?.targets || [], log.night?.completedTargets || []);
    this.setCheckboxGroup('morning-resources-group', log.morning?.resources || []);
    this.setCheckboxGroup('morning-revision-group', log.morning?.revision || []);
    this.setCheckboxGroup('morning-current-affairs-group', log.morning?.currentAffairs || []);
    this.updateHoursVariance();
    this.updateCompletionGauge();
  },

  createEmptyLog: function (dateStr) {
    const targets = [];
    for (let i = 1; i <= 10; i++) {
      targets.push({ id: i, text: '', priority: 'medium' });
    }

    return {
      id: dateStr,
      date: dateStr,
      morning: {
        targets,
        plannedHours: 0,
        subjects: '',
        resources: [],
        revision: [],
        currentAffairs: [],
        affirmation: ''
      },
      night: {
        completedTargets: [],
        completedHours: 0,
        completedResources: [],
        completedRevision: [],
        completedCurrentAffairs: [],
        challenges: '',
        solutions: '',
        learned: '',
        reflections: ''
      },
      updatedAt: new Date().toISOString()
    };
  },

  isLogEmpty: function (log) {
    if (!log) return true;
    const m = log.morning || {};
    const n = log.night || {};
    const hasTargets = (m.targets || []).some(t => t.text && t.text.trim());
    return (
      !hasTargets &&
      !m.plannedHours &&
      !String(m.subjects || '').trim() &&
      !(m.resources || []).length &&
      !(m.revision || []).length &&
      !(m.currentAffairs || []).length &&
      !String(m.affirmation || '').trim() &&
      !n.completedHours &&
      !(n.completedTargets || []).length &&
      !String(n.challenges || '').trim() &&
      !String(n.solutions || '').trim() &&
      !String(n.learned || '').trim() &&
      !String(n.reflections || '').trim()
    );
  },

  renderTargetsList: function (targets, completedIds) {
    const container = document.getElementById('targets-list-container');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 1; i <= 10; i++) {
      const targetObj = targets.find(t => t.id === i) || { id: i, text: '', priority: 'medium' };
      const isCompleted = completedIds.includes(i);
      const item = document.createElement('div');
      item.className = `target-item${isCompleted ? ' completed' : ''}`;
      item.dataset.targetId = i;
      item.innerHTML = `
        <div class="custom-checkbox btn-toggle-target" data-id="${i}">
          ${isCompleted ? '✓' : ''}
        </div>
        <span class="target-index">${i}.</span>
        <input type="text" class="target-input" value="${this.escapeHtml(targetObj.text)}" placeholder="Set target ${i}..." data-id="${i}">
        <button type="button" class="priority-tag priority-${targetObj.priority} btn-change-priority" data-id="${i}" data-priority="${targetObj.priority}">
          ${targetObj.priority.toUpperCase()}
        </button>
      `;
      container.appendChild(item);
    }
  },

  escapeHtml: function (str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  scheduleSave: function () {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this.saveCurrentLogFromDOM(), this.isCloudMode() ? 600 : 250);
  },

  saveCurrentLogFromDOM: async function () {
    const dateStr = this.activeDate;
    const targets = [];
    const completedTargets = [];

    document.querySelectorAll('.target-item').forEach((item, index) => {
      const id = index + 1;
      const text = item.querySelector('.target-input')?.value || '';
      const priority = item.querySelector('.btn-change-priority')?.getAttribute('data-priority') || 'medium';
      targets.push({ id, text, priority });
      if (item.classList.contains('completed')) completedTargets.push(id);
    });

    const resources = this.getCheckboxGroupValues('morning-resources-group');
    const revision = this.getCheckboxGroupValues('morning-revision-group');
    const currentAffairs = this.getCheckboxGroupValues('morning-current-affairs-group');

    const log = {
      id: dateStr,
      date: dateStr,
      morning: {
        targets,
        plannedHours: parseFloat(document.getElementById('morning-planned-hours')?.value || 0),
        subjects: document.getElementById('morning-subjects')?.value || '',
        resources,
        revision,
        currentAffairs,
        affirmation: document.getElementById('morning-affirmation')?.value || ''
      },
      night: {
        completedTargets,
        completedHours: parseFloat(document.getElementById('night-completed-hours')?.value || 0),
        completedResources: resources,
        completedRevision: revision,
        completedCurrentAffairs: currentAffairs,
        challenges: document.getElementById('night-challenges')?.value || '',
        solutions: document.getElementById('night-solutions')?.value || '',
        learned: document.getElementById('night-learned')?.value || '',
        reflections: document.getElementById('night-reflections')?.value || ''
      },
      updatedAt: new Date().toISOString()
    };

    if (this.isLogEmpty(log)) {
      delete this.logs[dateStr];
    } else {
      this.logs[dateStr] = log;
    }

    await this.saveLogsToStorage({ mode: 'day', date: dateStr });
    this.updateHoursVariance();
    this.updateCompletionGauge();
  },

  updateCompletionGauge: function () {
    const targetItems = document.querySelectorAll('.target-item');
    let totalSet = 0;
    let completedCount = 0;

    targetItems.forEach(item => {
      const text = item.querySelector('.target-input')?.value.trim();
      if (text) {
        totalSet++;
        if (item.classList.contains('completed')) completedCount++;
      }
    });

    if (totalSet === 0) {
      totalSet = 10;
      completedCount = document.querySelectorAll('.target-item.completed').length;
    }

    const percentage = Math.round((completedCount / totalSet) * 100);
    const percentEl = document.getElementById('gauge-percent-text');
    const ratioEl = document.getElementById('gauge-ratio-text');
    const fillCircle = document.getElementById('gauge-fill-circle');

    if (percentEl) percentEl.textContent = `${percentage}%`;
    if (ratioEl) ratioEl.textContent = `${completedCount} / ${totalSet}`;
    if (fillCircle) {
      fillCircle.style.strokeDashoffset =
        GAUGE_CIRCUMFERENCE - (percentage / 100) * GAUGE_CIRCUMFERENCE;
    }
  },

  updateHoursVariance: function () {
    const planned = parseFloat(document.getElementById('morning-planned-hours')?.value || 0);
    const completed = parseFloat(document.getElementById('night-completed-hours')?.value || 0);
    const diff = +(completed - planned).toFixed(1);
    const diffEl = document.getElementById('hours-diff-display');
    if (!diffEl) return;

    if (diff > 0) {
      diffEl.className = 'hours-diff positive';
      diffEl.textContent = `+${diff} hrs over plan! 💪`;
    } else if (diff < 0) {
      diffEl.className = 'hours-diff negative';
      diffEl.textContent = `${diff} hrs under plan`;
    } else {
      diffEl.className = 'hours-diff';
      diffEl.textContent = 'On target (100% matched)';
    }
  },

  getCheckboxGroupValues: function (groupId) {
    const group = document.getElementById(groupId);
    if (!group) return [];
    return [...group.querySelectorAll('input[type="checkbox"]:checked')].map(box => box.value);
  },

  setCheckboxGroup: function (groupId, valuesArray) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('input[type="checkbox"]').forEach(box => {
      box.checked = valuesArray.includes(box.value);
    });
  },

  bindEvents: function () {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.currentTarget.getAttribute('data-tab'));
      });
    });

    document.getElementById('btn-toggle-theme')?.addEventListener('click', () => this.toggleTheme());

    // Logger morning/night mode only (not analytics preset pills)
    document.querySelectorAll('#logger-mode-toggle .mode-btn[data-mode]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchMode(e.currentTarget.getAttribute('data-mode'));
      });
    });

    const targetsContainer = document.getElementById('targets-list-container');
    if (targetsContainer) {
      targetsContainer.addEventListener('click', (e) => {
        const checkBtn = e.target.closest('.btn-toggle-target');
        const priorityBtn = e.target.closest('.btn-change-priority');

        if (checkBtn) {
          const item = checkBtn.closest('.target-item');
          item.classList.toggle('completed');
          checkBtn.innerHTML = item.classList.contains('completed') ? '✓' : '';
          this.saveCurrentLogFromDOM();
        }

        if (priorityBtn) {
          const currentPri = priorityBtn.getAttribute('data-priority');
          const nextPri = currentPri === 'high' ? 'medium' : currentPri === 'medium' ? 'low' : 'high';
          priorityBtn.setAttribute('data-priority', nextPri);
          priorityBtn.className = `priority-tag priority-${nextPri} btn-change-priority`;
          priorityBtn.textContent = nextPri.toUpperCase();
          this.saveCurrentLogFromDOM();
        }
      });
    }

    // Single delegated input listener for logger form (debounced)
    document.getElementById('view-logger')?.addEventListener('input', (e) => {
      if (e.target.matches('input, textarea')) this.scheduleSave();
    });

    document.getElementById('btn-load-sample-data')?.addEventListener('click', () => this.loadSampleData());
    document.getElementById('btn-load-demo-motto')?.addEventListener('click', () => this.loadSampleData());
    document.getElementById('btn-load-demo-analytics')?.addEventListener('click', () => this.loadSampleData());
    document.getElementById('btn-clear-data')?.addEventListener('click', () => this.clearAllData());
    document.getElementById('btn-export-json')?.addEventListener('click', () => this.exportJSON());

    const fileImportInput = document.getElementById('file-import-input');
    document.getElementById('btn-import-json')?.addEventListener('click', () => fileImportInput?.click());
    fileImportInput?.addEventListener('change', (e) => this.importJSON(e));

    document.querySelectorAll('#preset-pills-group .mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = e.currentTarget.getAttribute('data-preset');
        if (preset) this.selectAnalyticsPreset(preset);
      });
    });

    document.getElementById('analytics-start-date')?.addEventListener('change', () => this.applyCustomDateRange());
    document.getElementById('analytics-end-date')?.addEventListener('change', () => this.applyCustomDateRange());
    document.getElementById('btn-apply-custom-range')?.addEventListener('click', () => this.applyCustomDateRange());

    document.getElementById('history-search-input')?.addEventListener('input', (e) => {
      this.renderHistoryList(e.target.value.toLowerCase());
    });
  },

  switchTab: function (tabName) {
    this.activeTab = tabName;

    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });

    document.querySelectorAll('.tab-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`view-${tabName}`)?.classList.remove('hidden');

    if (tabName === 'analytics') this.refreshAnalyticsView();
    if (tabName === 'history') this.renderHistoryList();
  },

  switchMode: function (mode) {
    this.activeMode = mode;

    document.querySelectorAll('#logger-mode-toggle .mode-btn[data-mode]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    const showMorning = mode === 'morning' || mode === 'all';
    const showNight = mode === 'night' || mode === 'all';

    document.querySelectorAll('.morning-card, .night-card').forEach(el => {
      const isMorning = el.classList.contains('morning-card');
      const isNight = el.classList.contains('night-card');
      const show = (isMorning && showMorning) || (isNight && showNight);
      el.classList.toggle('hidden', !show);
    });
  },

  updateStreakBadge: function () {
    const badge = document.getElementById('streak-count-display');
    if (!badge || !window.AnalyticsEngine?.calculateStreaks) return;
    const streaks = AnalyticsEngine.calculateStreaks(this.logs);
    badge.textContent = `${streaks.current} Days 🔥`;
  },

  renderHistoryList: function (filterTerm = '') {
    const container = document.getElementById('history-list-container');
    if (!container) return;

    const sortedDates = Object.keys(this.logs).sort().reverse();
    container.innerHTML = '';

    if (sortedDates.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 2rem;">
          <p style="font-weight: 600;">No progress logs recorded yet.</p>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">
            Select today's date in the Daily Logger tab or click "⚡ Demo Data" in the header to load sample history.
          </p>
          <button class="btn btn-primary" id="btn-load-demo-history" style="margin-top: 1rem;">⚡ Load Demo Data Now</button>
        </div>
      `;
      document.getElementById('btn-load-demo-history')?.addEventListener('click', () => this.loadSampleData());
      return;
    }

    sortedDates.forEach(dStr => {
      const log = this.logs[dStr];
      const parts = dStr.split('-');
      const dt = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      const dayNum = dt.getDate();
      const monthStr = dt.toLocaleString('default', { month: 'short' });
      const yearStr = dt.getFullYear();

      const targetsSet = window.AnalyticsEngine
        ? AnalyticsEngine.countSetTargets(log)
        : (log.morning?.targets || []).filter(t => t.text?.trim()).length || 10;
      const targetsComp = window.AnalyticsEngine
        ? AnalyticsEngine.countCompletedTargets(log)
        : (log.night?.completedTargets || []).length;
      const percent = targetsSet > 0 ? Math.round((targetsComp / targetsSet) * 100) : 0;
      const plannedH = log.morning?.plannedHours || 0;
      const completedH = log.night?.completedHours || 0;

      const textToSearch = `${dStr} ${log.morning?.subjects || ''} ${log.night?.learned || ''} ${log.night?.challenges || ''}`.toLowerCase();
      if (filterTerm && !textToSearch.includes(filterTerm)) return;

      const card = document.createElement('div');
      card.className = 'history-card';
      card.innerHTML = `
        <div class="history-date-box">
          <div class="history-date-num">${dayNum}</div>
          <div class="history-date-month">${monthStr} '${String(yearStr).slice(-2)}</div>
        </div>
        <div class="history-details">
          <div class="history-title">${this.escapeHtml(log.morning?.subjects || 'Daily Progress Track')}</div>
          <div class="history-summary">
            <span class="history-stat">🎯 ${targetsComp}/${targetsSet} Targets (${percent}%)</span>
            <span class="history-stat">⏱️ ${completedH} hrs completed / ${plannedH} hrs planned</span>
          </div>
          ${log.night?.learned ? `<p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.35rem;">💡 <em>${this.escapeHtml(log.night.learned)}</em></p>` : ''}
        </div>
        <div>
          <button class="btn btn-secondary btn-open-log" data-date="${dStr}">View / Edit</button>
        </div>
      `;

      card.querySelector('.btn-open-log').addEventListener('click', () => this.selectDate(dStr));
      container.appendChild(card);
    });
  },

  exportJSON: function () {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.logs, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `progress_tracker_backup_${this.activeDate}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    this.showToast('Exported backup JSON file successfully!', 'success');
  },

  importJSON: function (event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported && typeof imported === 'object' && !Array.isArray(imported)) {
          this.logs = { ...this.logs, ...imported };
          await this.saveLogsToStorage({ mode: 'replace' });
          this.loadDailyLog(this.activeDate);
          this.refreshActiveSecondaryView();
          this.showToast('Imported tracker logs successfully!', 'success');
        } else {
          this.showToast('Invalid JSON backup file', 'error');
        }
      } catch (err) {
        this.showToast('Invalid JSON backup file', 'error');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  },

  showToast: function (msg, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = { success: '✅', error: '⚠️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type === 'warning' ? 'warning' : type}`;
    toast.innerHTML = `<span>${icons[type] || '✅'}</span> ${this.escapeHtml(msg)}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  await window.AuthManager.init();
  // Load guest/local logs if still logged out after auth init
  if (!AuthManager.currentUser) {
    await App.loadLogsFromStorage();
  }
  App.init();
});
