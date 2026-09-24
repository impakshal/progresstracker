/* ============================================================
   GOOGLE ANALYTICS 4 (GA4) INTEGRATION ENGINE
   Loads gtag.js dynamically using window.GA_MEASUREMENT_ID
   and provides helper functions for tracking custom events.
   ============================================================ */

(function () {
  function initGoogleAnalytics() {
    const measurementId = window.GA_MEASUREMENT_ID;

    if (!measurementId || measurementId === 'G-XXXXXXXXXX' || measurementId.trim() === '') {
      console.log('[Google Analytics] Measurement ID is not configured. Set window.GA_MEASUREMENT_ID in config.js or env vars.');
      return;
    }

    const cleanId = measurementId.trim();

    // Prevent duplicate script injection
    if (document.getElementById('ga-gtag-script')) {
      return;
    }

    // Inject gtag.js script into <head>
    const script = document.createElement('script');
    script.id = 'ga-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/googletagmanager.com/gtag/js?id=${encodeURIComponent(cleanId)}`;

    // Fix src URL (https://www.googletagmanager.com/gtag/js?id=...)
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(cleanId)}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', cleanId, {
      send_page_view: true
    });

    console.log(`[Google Analytics] GA4 initialized successfully with Measurement ID: ${cleanId}`);
  }

  // Global helper function to log GA events safely anywhere in the application
  window.trackGAEvent = function (eventName, eventParams = {}) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams);
    } else {
      console.debug(`[Google Analytics Event] ${eventName}:`, eventParams);
    }
  };

  // Run initialization when DOM is ready or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGoogleAnalytics);
  } else {
    initGoogleAnalytics();
  }
})();
