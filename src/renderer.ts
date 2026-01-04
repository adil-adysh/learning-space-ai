/**
 * Renderer Entry Point
 * Bootstraps the UI and provides a safety net for initialization failures.
 */

const startApp = async () => {
  try {
    // Attempt to load the main UI logic
    // Ensure this path correctly points to your init file
    const { init } = await import('./ui/index'); 
    await init();
    
    console.log('UI Initialized successfully.');
  } catch (err) {
    // 1. Log for developers/diagnostics
    console.error('Critical UI Initialization Error:', err);

    // 2. Visual Fallback for Users (Calm UX)
    // We target the container to maintain the app shell if possible
    const root = document.querySelector('.container') || document.body;
    
    root.innerHTML = `
      <div class="error-state" role="alert" style="
        padding: 3rem; 
        text-align: center; 
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 600px;
        margin: 0 auto;
      ">
        <h1 style="font-weight: 500; color: #1a1a1a;">Something went wrong</h1>
        <p style="color: #666; line-height: 1.6;">
          The app couldn't start properly. This is usually caused by a configuration 
          issue or a corrupted update.
        </p>
        <div style="margin-top: 2rem;">
          <button 
            onclick="window.location.reload()" 
            style="
              background: #0056b3; 
              color: white; 
              border: none; 
              padding: 12px 24px; 
              border-radius: 6px; 
              cursor: pointer;
              font-size: 1rem;
            ">
            Reload App
          </button>
        </div>
      </div>
    `;
    
    // 3. Announce failure to Screen Readers
    // We attempt a dynamic import, but fallback to direct DOM manipulation
    // to ensure accessibility even if the 'utils' module is missing.
    try {
      const { srAnnounce } = await import('./ui/utils');
      srAnnounce('Critical error: The application failed to load.');
    } catch (a11yErr) {
      const sr = document.getElementById('sr-announcements');
      if (sr) {
        sr.textContent = 'Critical error: The application failed to load. Please restart.';
      }
    }
  }
};

// Check if DOM is already loaded (Safety check for fast Electron boots)
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', startApp);
} else {
  // If the script is deferred or loaded after DOM is ready
  void startApp();
}

export {};