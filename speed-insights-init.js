// Vercel Speed Insights Initialization
// This script initializes Vercel Speed Insights for tracking web performance metrics

(function() {
  // Initialize the Speed Insights queue
  window.si = window.si || function() {
    (window.siq = window.siq || []).push(arguments);
  };

  // Load the Speed Insights script
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  
  // Add error handling
  script.onerror = function() {
    console.warn('Speed Insights script failed to load');
  };
  
  // Append to document head
  document.head.appendChild(script);
})();
