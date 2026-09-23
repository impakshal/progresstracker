/* ==========================================
   DAILY PROGRESS TRACKER - ANALYTICS ENGINE
   Calculations, Chart.js Integrations & Heatmap
   ========================================== */

window.AnalyticsEngine = {
  hoursChartInstance: null,
  trendChartInstance: null,
  resourceChartInstance: null,
  subjectChartInstance: null,

  getLocalDateString: function (d = new Date()) {
    return window.getLocalDateString(d);
  },

  getChartTheme: function () {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      textColor: isDark ? '#cbd5e1' : '#475569',
      gridColor: isDark ? '#334155' : '#e2e8f0'
    };
  },

  formatShortLabel: function (dateStr) {
    const parts = (dateStr || '').split('-');
    if (parts.length < 3) return dateStr || '';
    return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
  },

  countSetTargets: function (log) {
    const targets = log?.morning?.targets || [];
    const withText = targets.filter(t => t.text && t.text.trim() !== '').length;
    return withText || targets.length || 0;
  },

  countCompletedTargets: function (log) {
    return (log?.night?.completedTargets || []).length;
  },

  completionRate: function (log) {
    const setNum = this.countSetTargets(log);
    if (setNum <= 0) return 0;
    return Math.round((this.countCompletedTargets(log) / setNum) * 100);
  },

  destroyChart: function (key) {
    if (this[key]) {
      this[key].destroy();
      this[key] = null;
    }
  },

  resizeCharts: function () {
    [
      this.hoursChartInstance,
      this.trendChartInstance,
      this.resourceChartInstance,
      this.subjectChartInstance
    ].forEach(chart => {
      if (chart && typeof chart.resize === 'function') chart.resize();
    });
  },

  renderAnalytics: function (logs, filterPreset = '30days', startDate = null, endDate = null) {
    const safeLogs = logs || {};
    const filteredLogs = this.filterLogsByInterval(safeLogs, filterPreset, startDate, endDate);
    const metrics = this.calculateMetrics(filteredLogs, safeLogs);

    this.toggleEmptyNotice(filteredLogs.length === 0);
    this.updateKPICards(metrics);
    this.renderCalendarHeatmap(safeLogs);

    if (typeof window.Chart !== 'function') {
      console.warn('Chart.js is not loaded. Analytics charts cannot render.');
      return;
    }

    this.renderHoursChart(filteredLogs);
    this.renderTrendChart(filteredLogs);
    this.renderResourceChart(filteredLogs);
    this.renderSubjectChart(filteredLogs);
    requestAnimationFrame(() => this.resizeCharts());
  },

  toggleEmptyNotice: function (isEmpty) {
    const emptyNotice = document.getElementById('analytics-empty-notice');
    if (emptyNotice) emptyNotice.classList.toggle('hidden', !isEmpty);
  },

  filterLogsByInterval: function (logs, preset, customStart, customEnd) {
    const sortedDates = Object.keys(logs || {}).sort();
    if (sortedDates.length === 0) return [];

    const todayObj = new Date();
    const todayStr = this.getLocalDateString(todayObj);
    let minDateStr = '2000-01-01';
    let maxDateStr = '2099-12-31';

    switch (preset) {
      case 'today':
        minDateStr = todayStr;
        maxDateStr = todayStr;
        break;
      case '7days': {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        minDateStr = this.getLocalDateString(d);
        break;
      }
      case '30days': {
        const d = new Date();
        d.setDate(d.getDate() - 29);
        minDateStr = this.getLocalDateString(d);
        break;
      }
      case 'thisMonth': {
        const month = String(todayObj.getMonth() + 1).padStart(2, '0');
        minDateStr = `${todayObj.getFullYear()}-${month}-01`;
        break;
      }
      case 'lastMonth': {
        const year = todayObj.getFullYear();
        const monthIdx = todayObj.getMonth();
        const lastMonthYear = monthIdx === 0 ? year - 1 : year;
        const lastMonthVal = monthIdx === 0 ? 12 : monthIdx;
        const lastMonthStr = String(lastMonthVal).padStart(2, '0');
        const daysInLastMonth = new Date(lastMonthYear, lastMonthVal, 0).getDate();
        minDateStr = `${lastMonthYear}-${lastMonthStr}-01`;
        maxDateStr = `${lastMonthYear}-${lastMonthStr}-${String(daysInLastMonth).padStart(2, '0')}`;
        break;
      }
      case 'allTime':
        break;
      case 'custom':
      default:
        minDateStr = customStart || '2000-01-01';
        maxDateStr = customEnd || '2099-12-31';
        break;
    }

    return sortedDates
      .filter(dStr => dStr >= minDateStr && dStr <= maxDateStr)
      .map(dStr => logs[dStr]);
  },

  calculateMetrics: function (filteredLogs, allLogs) {
    const streaks = this.calculateStreaks(allLogs || {});
    const empty = {
      avgCompletion: 0,
      totalPlannedHours: 0,
      totalCompletedHours: 0,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      totalTargetsSet: 0,
      totalTargetsCompleted: 0
    };

    if (!filteredLogs || filteredLogs.length === 0) return empty;

    let totalPercentage = 0;
    let totalPlannedHours = 0;
    let totalCompletedHours = 0;
    let totalTargetsSet = 0;
    let totalTargetsCompleted = 0;

    filteredLogs.forEach(log => {
      const setNum = this.countSetTargets(log);
      const compNum = this.countCompletedTargets(log);
      totalPercentage += setNum > 0 ? (compNum / setNum) * 100 : 0;
      totalTargetsSet += setNum;
      totalTargetsCompleted += compNum;
      totalPlannedHours += parseFloat(log.morning?.plannedHours || 0);
      totalCompletedHours += parseFloat(log.night?.completedHours || 0);
    });

    return {
      avgCompletion: Math.round(totalPercentage / filteredLogs.length),
      totalPlannedHours: +totalPlannedHours.toFixed(1),
      totalCompletedHours: +totalCompletedHours.toFixed(1),
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      totalTargetsSet,
      totalTargetsCompleted
    };
  },

  // Current streak walks backward from today (or yesterday); longest is max consecutive run
  calculateStreaks: function (logs) {
    const dateSet = new Set(Object.keys(logs || {}));
    if (dateSet.size === 0) return { current: 0, longest: 0 };

    const dates = [...dateSet].sort();
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prev = dates[i - 1].split('-');
      const curr = dates[i].split('-');
      const prevDate = new Date(+prev[0], +prev[1] - 1, +prev[2]);
      const currDate = new Date(+curr[0], +curr[1] - 1, +curr[2]);
      const diffDays = Math.round((currDate - prevDate) / 86400000);

      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }

    let currentStreak = 0;
    const cursor = new Date();
    const todayStr = this.getLocalDateString(cursor);

    if (!dateSet.has(todayStr)) {
      cursor.setDate(cursor.getDate() - 1);
      if (!dateSet.has(this.getLocalDateString(cursor))) {
        return { current: 0, longest: longestStreak };
      }
    }

    while (dateSet.has(this.getLocalDateString(cursor))) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return {
      current: currentStreak,
      longest: Math.max(longestStreak, currentStreak)
    };
  },

  updateKPICards: function (metrics) {
    const completionEl = document.getElementById('kpi-completion');
    const hoursEl = document.getElementById('kpi-hours');
    const streakEl = document.getElementById('kpi-streak');
    const targetsEl = document.getElementById('kpi-targets');

    if (completionEl) completionEl.textContent = `${metrics.avgCompletion}%`;
    if (hoursEl) hoursEl.textContent = `${metrics.totalCompletedHours}h / ${metrics.totalPlannedHours}h`;
    if (streakEl) streakEl.textContent = `${metrics.currentStreak} Days 🔥 (Best: ${metrics.longestStreak})`;
    if (targetsEl) targetsEl.textContent = `${metrics.totalTargetsCompleted} / ${metrics.totalTargetsSet}`;
  },

  renderHoursChart: function (logs) {
    const canvas = document.getElementById('chart-hours');
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    this.destroyChart('hoursChartInstance');
    const { textColor, gridColor } = this.getChartTheme();
    const labels = logs.map(l => this.formatShortLabel(l.date));

    this.hoursChartInstance = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [
          {
            label: 'Planned Hours',
            data: labels.length ? logs.map(l => parseFloat(l.morning?.plannedHours || 0)) : [0],
            backgroundColor: 'rgba(148, 163, 184, 0.4)',
            borderColor: '#94a3b8',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Completed Hours',
            data: labels.length ? logs.map(l => parseFloat(l.night?.completedHours || 0)) : [0],
            backgroundColor: 'rgba(37, 99, 235, 0.85)',
            borderColor: '#2563eb',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { family: 'Outfit', weight: '600' } } }
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: {
            ticks: { color: textColor },
            grid: { color: gridColor },
            title: { display: true, text: 'Hours', color: textColor }
          }
        }
      }
    });
  },

  renderTrendChart: function (logs) {
    const canvas = document.getElementById('chart-trend');
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    this.destroyChart('trendChartInstance');
    const { textColor, gridColor } = this.getChartTheme();
    const labels = logs.map(l => this.formatShortLabel(l.date));

    this.trendChartInstance = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [
          {
            label: 'Target Completion %',
            data: labels.length ? logs.map(l => this.completionRate(l)) : [0],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#10b981'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { family: 'Outfit', weight: '600' } } }
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: {
            min: 0,
            max: 100,
            ticks: { color: textColor, callback: val => `${val}%` },
            grid: { color: gridColor }
          }
        }
      }
    });
  },

  renderResourceChart: function (logs) {
    const canvas = document.getElementById('chart-resources');
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    this.destroyChart('resourceChartInstance');

    const counts = {};
    logs.forEach(l => {
      const res = l.night?.completedResources || l.morning?.resources || [];
      res.forEach(r => {
        counts[r] = (counts[r] || 0) + 1;
      });
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);
    const { textColor } = this.getChartTheme();

    this.resourceChartInstance = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [
          {
            data: data.length ? data : [1],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6']
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, font: { family: 'Outfit', size: 11 } }
          }
        }
      }
    });
  },

  renderSubjectChart: function (logs) {
    const canvas = document.getElementById('chart-subjects');
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    this.destroyChart('subjectChartInstance');

    const subjectHours = {};
    logs.forEach(l => {
      const subjStr = l.morning?.subjects || 'General Study';
      const hours = parseFloat(l.night?.completedHours || l.morning?.plannedHours || 1);
      const subjects = subjStr.split(/[,;&\n]/).map(s => s.trim()).filter(Boolean);
      const hoursPerSubj = hours / (subjects.length || 1);

      subjects.forEach(s => {
        subjectHours[s] = (subjectHours[s] || 0) + hoursPerSubj;
      });
    });

    const labels = Object.keys(subjectHours);
    const data = Object.values(subjectHours).map(h => +h.toFixed(1));
    const { textColor, gridColor } = this.getChartTheme();

    this.subjectChartInstance = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [
          {
            label: 'Total Hours Focused',
            data: data.length ? data : [0],
            backgroundColor: 'rgba(99, 102, 241, 0.85)',
            borderColor: '#6366f1',
            borderRadius: 4
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { family: 'Outfit', weight: '600' } } }
        },
        scales: {
          x: {
            ticks: { color: textColor },
            grid: { color: gridColor },
            title: { display: true, text: 'Hours', color: textColor }
          },
          y: { ticks: { color: textColor }, grid: { color: gridColor } }
        }
      }
    });
  },

  renderCalendarHeatmap: function (logs) {
    const container = document.getElementById('heatmap-grid-container');
    if (!container) return;

    container.innerHTML = '';
    const today = new Date();
    const totalDays = 112;
    const startDate = new Date();
    startDate.setDate(today.getDate() - totalDays + 1);

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = this.getLocalDateString(d);
      const log = logs[dateStr];
      let level = 0;

      if (log) {
        const rate = this.completionRate(log);
        if (rate <= 0) level = 1;
        else if (rate <= 40) level = 1;
        else if (rate <= 70) level = 2;
        else if (rate <= 90) level = 3;
        else level = 4;
      }

      const cell = document.createElement('div');
      cell.className = `heatmap-cell heatmap-lvl-${level}`;
      cell.title = log
        ? `${dateStr}: ${this.countCompletedTargets(log)} targets completed (${this.completionRate(log)}%)`
        : `${dateStr}: No logs recorded`;
      cell.dataset.date = dateStr;
      cell.addEventListener('click', () => {
        if (window.App?.selectDate) window.App.selectDate(dateStr);
      });
      container.appendChild(cell);
    }
  }
};
