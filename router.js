/* ============================================================
   CLIENT-SIDE ROUTER ENGINE (HASH ROUTER & GA4 TRACKER)
   Deep URL Routing to maximize pageviews and SEO indexing.
   ============================================================ */

window.Router = {
  currentRoute: '/tracker',
  routes: {},

  init: function () {
    window.addEventListener('hashchange', () => this.handleHashChange());
    // Initial route load
    this.handleHashChange();
  },

  handleHashChange: function () {
    let rawHash = window.location.hash || '#/tracker';
    let path = rawHash.replace(/^#/, '');

    if (!path.startsWith('/')) path = '/' + path;

    this.navigate(path, false);
  },

  navigate: function (path, updateHash = true) {
    if (updateHash && window.location.hash !== '#' + path) {
      window.location.hash = '#' + path;
      return; // hashchange listener will fire handleHashChange
    }

    this.currentRoute = path;
    const routeParts = path.split('/').filter(Boolean);
    const mainSection = routeParts[0] || 'tracker';
    const subParam = routeParts[1] || null;

    // Handle Exam parameter if provided in URL (e.g., /tracker/jee)
    if (['boards', 'jee', 'neet', 'upsc'].includes(subParam)) {
      if (window.App && window.App.setExamTrack && window.App.activeExam !== subParam) {
        window.App.setExamTrack(subParam, false);
      }
    }

    // Determine view container ID
    let viewId = `view-${mainSection}`;
    let targetView = document.getElementById(viewId);

    if (!targetView) {
      // Fallback to logger if view not found
      viewId = 'view-logger';
      targetView = document.getElementById(viewId);
    }

    // Hide all tab views
    document.querySelectorAll('.tab-view').forEach(v => v.classList.add('hidden'));
    
    // Show active tab view
    if (targetView) {
      targetView.classList.remove('hidden');
    }

    // Highlight active navbar tab
    document.querySelectorAll('.nav-tabs .nav-tab').forEach(tab => {
      const tabRoute = tab.getAttribute('data-route');
      const tabName = tab.getAttribute('data-tab');
      const isActive = tabRoute ? path.startsWith(tabRoute) : (mainSection === tabName);
      tab.classList.toggle('active', isActive);
    });

    // Notify App of route change for specific logic
    if (window.App?.onRouteChanged) {
      window.App.onRouteChanged(mainSection, subParam, path);
    }

    // Fire GA4 Page View tracking
    this.trackPageView(path, mainSection);
  },

  trackPageView: function (path, pageName) {
    const activeExam = window.App?.activeExam || 'boards';
    const pageTitle = `Pathshalla | ${pageName.toUpperCase()} (${activeExam.toUpperCase()})`;

    // Log GA4 Page View
    if (window.trackGAEvent) {
      window.trackGAEvent('page_view', {
        page_path: path,
        page_title: pageTitle,
        exam_track: activeExam
      });
    }

    if (typeof window.gtag === 'function' && window.GA_MEASUREMENT_ID && window.GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      window.gtag('config', window.GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: pageTitle
      });
    }

    console.debug(`[Router] Navigated to ${path} (Page View tracked for ${activeExam})`);
  }
};
