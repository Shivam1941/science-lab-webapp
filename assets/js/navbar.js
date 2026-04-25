document.addEventListener("DOMContentLoaded", function() {
  const navbarHTML = `
  <nav class="navbar" id="navbar">
    <div class="navbar-inner">
      <div class="nav-brand" id="nav-brand" onclick="navigateTo('dashboard')">
        <div class="nav-logo">🔬</div>
        <div class="nav-title-group">
          <span class="nav-title" id="nav-title">Digital Lab</span>
          <span class="nav-subtitle" id="nav-subtitle">Science Experiments</span>
        </div>
      </div>
      <div class="nav-breadcrumb" id="nav-breadcrumb"></div>
      <div class="nav-menu" aria-label="Primary navigation">
        <a class="nav-menu-link" href="/index.html">Home</a>
        <a class="nav-menu-link" href="/experiments.html">Experiments</a>
        <a class="nav-menu-link" href="/experiments/physics.html">Physics</a>
        <a class="nav-menu-link" href="/experiments/chemistry.html">Chemistry</a>
        <a class="nav-menu-link" href="/experiments/biology.html">Biology</a>
        <div class="nav-menu-dropdown">
          <button class="nav-menu-link nav-menu-button" type="button">Classes ▾</button>
          <div class="nav-menu-panel">
            <a href="/experiments.html?class=6-8">Classes 6–8</a>
            <a href="/experiments.html?class=9-10">Classes 9–10</a>
            <a href="/experiments.html?class=11-12">Classes 11–12</a>
          </div>
        </div>
        <div class="nav-menu-dropdown">
          <button class="nav-menu-link nav-menu-button" type="button">Concepts ▾</button>
          <div class="nav-menu-panel nav-menu-panel-wide">
            <a href="/experiments.html?category=electricity">Electricity</a>
            <a href="/experiments.html?category=optics">Optics</a>
            <a href="/experiments.html?category=reactions">Reactions</a>
            <a href="/experiments.html?category=life-processes">Life Processes</a>
            <a href="/experiments.html?category=separation-techniques">Separation</a>
          </div>
        </div>
      </div>
      <div class="nav-actions">
        <!-- Language Picker -->
        <div class="lang-picker" id="lang-picker">
          <button class="lang-btn" id="lang-btn" onclick="toggleLangDropdown()" aria-label="Select Language">
            🇬🇧 <span>English</span> <span class="lang-caret">▾</span>
          </button>
          <div class="lang-dropdown" id="lang-dropdown">
            <div class="lang-dropdown-header">🌐 Select Language</div>
            <div id="lang-options"></div>
          </div>
        </div>
        <div class="nav-time" id="nav-time"></div>
        <button class="theme-toggle-btn" id="theme-toggle-btn" onclick="toggleTheme()" title="Toggle theme" aria-label="Toggle theme">☀️</button>
        <button class="nav-profile-btn" onclick="navigateTo('profile')" aria-label="My Profile">👤</button>
      </div>
    </div>
  </nav>
  `;
  
  const container = document.getElementById("navbar-container");
  if (container) {
    container.innerHTML = navbarHTML;
  }
});
