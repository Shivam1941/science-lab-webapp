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
