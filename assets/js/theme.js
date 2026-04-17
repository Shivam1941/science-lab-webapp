/* ============================================================
   Theme System — Light / Dark toggle
   Reads from localStorage, applies to <body data-theme>
   ============================================================ */

(function () {
  // Apply saved theme immediately (before paint) to avoid flicker
  var saved = localStorage.getItem('lab_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('lab_theme', theme);

    // Update toggle button icon wherever it exists
    var btns = document.querySelectorAll('.theme-toggle-btn');
    btns.forEach(function (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    });
  }

  // Global toggle function — called by the navbar button
  window.toggleTheme = function () {
    var current = localStorage.getItem('lab_theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  };

  // Re-apply on DOMContentLoaded so body attrs are set and button icon is correct
  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(localStorage.getItem('lab_theme') || 'dark');
  });
})();
