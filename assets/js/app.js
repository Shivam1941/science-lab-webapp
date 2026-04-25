/* ============================================================
   DIGITAL LAB — App Core
   SPA Router + Experiment Data + Navigation
   ============================================================ */

// -- Experiment Data ---------------------------------------------------------
let EXPERIMENTS = {};
window.EXPERIMENTS = EXPERIMENTS;

let experimentsDataPromise = null;

function setExperimentData(data) {
  EXPERIMENTS = data || {};
  window.EXPERIMENTS = EXPERIMENTS;
}

function loadExperimentData() {
  if (!experimentsDataPromise) {
    experimentsDataPromise = (async () => {
      const response = await fetch('/experiments.json');
      if (!response.ok) {
        throw new Error('Failed to load experiments.json: ' + response.status);
      }
      const data = await response.json();
      setExperimentData(data);
      console.log('JSON loaded');
      return EXPERIMENTS;
    })();
  }

  return experimentsDataPromise;
}

function showDataLoadError(message) {
  const root = document.getElementById('app-root') || document.body;
  root.innerHTML = `
    <section class="view" style="padding:40px 0;">
      <div class="glass-card" style="padding:28px;text-align:center;">
        <h1 style="font-family:'Space Grotesk',sans-serif;font-size:28px;margin:0 0 12px;">Unable to load experiments</h1>
        <p style="color:var(--text-secondary);line-height:1.7;margin:0;">${message}</p>
      </div>
    </section>
  `;
}

// ── State ────────────────────────────────────────────────────
let currentView = 'dashboard';
let currentSubject = null;
let currentExperiment = null;
let activeSimCleanup = null;

// ── Navigation ───────────────────────────────────────────────
function navigateTo(view, id, isInit = false) {
  // Dismiss landing hero if it's still present when navigating
  const hero = document.getElementById('landing-hero');
  if (!isInit && hero && !hero.classList.contains('landing-hero-hidden')) {
    sessionStorage.setItem('lab_hero_dismissed', 'true');
    hero.classList.add('landing-hero-hidden');
  }

  // Multi-page routing: SEO-critical subject and experiment views live at real URLs.
  if (!isInit) {
    if (view === 'dashboard' && !document.getElementById('view-dashboard')) {
      window.location.href = '/index.html';
      return;
    }
    if (view === 'subject') {
      window.location.href = `/experiments/${id}.html`;
      return;
    }
    if (view === 'experiment') {
      // Find the subject for this experiment to form the URL
      let expSubject = 'physics';
      for (const subj of Object.keys(EXPERIMENTS)) {
        if (EXPERIMENTS[subj].find(e => e.id === id)) { expSubject = subj; break; }
      }
      window.location.href = `/experiments/${expSubject}/${id}.html`;
      return;
    }
    if (view === 'profile' && !document.getElementById('view-profile')) {
      // For now fallback to index
      window.location.href = '/index.html'; 
      return;
    }
  }

  // Cleanup previous sim
  if (activeSimCleanup) {
    activeSimCleanup();
    activeSimCleanup = null;
  }

  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

  if (view === 'dashboard') {
    currentView = 'dashboard';
    currentSubject = null;
    currentExperiment = null;
    document.getElementById('view-dashboard').classList.remove('hidden');
    updateBreadcrumb([]);
    loadRecentActivity();
  }
  else if (view === 'subject') {
    currentView = 'subject';
    currentSubject = id;
    currentExperiment = null;
    renderSubjectView(id);
    document.getElementById('view-subject').classList.remove('hidden');
    updateBreadcrumb([{ label: capitalize(id), onClick: () => navigateTo('subject', id) }]);
  }
  else if (view === 'experiment') {
    currentView = 'experiment';
    const exp = findExperiment(id);
    if (!exp) {
      showDataLoadError('Experiment data was loaded, but this experiment could not be found.');
      return;
    }
    console.log('Experiment found', exp.id);
    currentExperiment = exp;
    console.log('Rendering experiment', exp.id);
    renderExperimentView(exp);
    document.getElementById('view-experiment').classList.remove('hidden');
    updateBreadcrumb([
      { label: capitalize(currentSubject), onClick: () => navigateTo('subject', currentSubject) },
      { label: exp.title, onClick: null }
    ]);
  }
  else if (view === 'profile') {
    currentView = 'profile';
    currentSubject = null;
    currentExperiment = null;
    if (typeof renderProfilePage === 'function') renderProfilePage();
    document.getElementById('view-profile').classList.remove('hidden');
    updateBreadcrumb([
      { label: 'My Lab Profile', onClick: null }
    ]);
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getLocalizedExperiment(exp) {
  if (!exp) return exp;
  let tExp = { ...exp };
  const langObjName = 'EXP_I18N_' + currentLang.toUpperCase();
  if (window[langObjName] && window[langObjName][exp.id]) {
    Object.assign(tExp, window[langObjName][exp.id]);
  }
  return tExp;
}

function findExperiment(id) {
  for (const subject of Object.keys(EXPERIMENTS)) {
    const exp = EXPERIMENTS[subject].find(e => e.id === id);
    if (exp) {
      currentSubject = subject;
      return getLocalizedExperiment(exp);
    }
  }
  return null;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Breadcrumb ───────────────────────────────────────────────
function updateBreadcrumb(items) {
  const bc = document.getElementById('nav-breadcrumb');
  if (!items.length) {
    bc.innerHTML = '';
    return;
  }
  let html = '<span class="bc-sep">/</span>';
  items.forEach((item, i) => {
    const isLast = i === items.length - 1;
    if (item.onClick && !isLast) {
      html += `<span class="bc-link" style="cursor:pointer;color:var(--text-secondary)" onclick="navigateTo('subject','${currentSubject}')">${item.label}</span>`;
      html += '<span class="bc-sep">/</span>';
    } else {
      html += `<span class="bc-current">${item.label}</span>`;
    }
  });
  bc.innerHTML = html;
}

// ── Subject View ─────────────────────────────────────────────
function renderSubjectView(subject) {
  const meta = {
    physics: { icon: '⚡', color: 'var(--physics-primary)', bg: 'var(--physics-bg)', desc: () => (typeof t === 'function' ? t('interactivePhysicsDesc') : 'Interactive physics experiments with real-time simulations') },
    chemistry: { icon: '🧪', color: 'var(--chemistry-primary)', bg: 'var(--chemistry-bg)', desc: () => (typeof t === 'function' ? t('interactiveChemistryDesc') : 'Explore chemical reactions, properties, and analysis') },
    biology: { icon: '🌿', color: 'var(--biology-primary)', bg: 'var(--biology-bg)', desc: () => (typeof t === 'function' ? t('interactiveBiologyDesc') : 'Study life science through virtual microscopy and dissection') }
  };
  const m = meta[subject];
  const exps = EXPERIMENTS[subject] || [];

  // Header
  const iconEl = document.getElementById('subject-header-icon');
  iconEl.style.background = m.bg;
  iconEl.innerHTML = m.icon;

  const subjectNameKey = subject; // e.g. 'physics'
  const nameEl = document.getElementById('subject-header-name');
  nameEl.textContent = (typeof t === 'function') ? t(subjectNameKey) : capitalize(subject);
  nameEl.style.color = m.color;

  document.getElementById('subject-header-sub').textContent = m.desc();

  // List
  const listEl = document.getElementById('exp-list');
  listEl.innerHTML = exps.map(exp => {
    const tExp = getLocalizedExperiment(exp);
    return `
    <a class="exp-list-item" href="/experiments/${subject}/${exp.id}.html" style="text-decoration:none;color:inherit;">
      <div class="exp-item-icon" style="background:${tExp.iconBg || exp.iconBg}">
        <span>${tExp.icon || exp.icon}</span>
      </div>
      <div class="exp-item-info">
        <div class="exp-item-title">${tExp.title}</div>
        <div class="exp-item-desc">${tExp.description}</div>
      </div>
      <span class="exp-item-arrow">→</span>
    </a>
  `}).join('');
}

// ── Experiment View ──────────────────────────────────────────
function renderExperimentView(exp) {
  // Back button
  const backBtn = document.getElementById('exp-back-btn');
  backBtn.onclick = () => navigateTo('subject', currentSubject);

  // Badge
  const badge = document.getElementById('exp-subject-badge');
  badge.textContent = capitalize(currentSubject);
  badge.className = `exp-subject-badge badge-${currentSubject}`;

  // Title
  document.getElementById('exp-title').textContent = exp.title;

  // Lab Record
  const _t = (typeof t === 'function') ? t : (k => k);
  const grid = document.getElementById('lab-record-grid');
  grid.innerHTML = `
    <div class="lab-record-item">
      <div class="lab-record-label lbl-aim">${_t('aim')}</div>
      <div class="lab-record-text">${exp.aim}</div>
    </div>
    <div class="lab-record-item">
      <div class="lab-record-label lbl-apparatus">${_t('apparatus')}</div>
      <ul class="lab-record-list">${exp.apparatus.map(a => `<li>${a}</li>`).join('')}</ul>
    </div>
    <div class="lab-record-item">
      <div class="lab-record-label lbl-procedure">${_t('procedure')}</div>
      <ul class="lab-record-list">${exp.procedure.map(p => `<li>${p}</li>`).join('')}</ul>
    </div>
    <div class="lab-record-item">
      <div class="lab-record-label lbl-precautions">${_t('precautions')}</div>
      <ul class="lab-record-list">${exp.precautions.map(p => `<li>${p}</li>`).join('')}</ul>
    </div>
    <div class="lab-record-item">
      <div class="lab-record-label lbl-conclusion">${_t('conclusion')}</div>
      <div class="lab-record-text">${exp.conclusion}</div>
    </div>
  `;

  // Reset lab record
  const body = document.getElementById('lab-record-body');
  body.classList.remove('open');
  document.getElementById('toggle-icon').classList.remove('open');

  // Clear sim area and load experiment
  const simArea = document.getElementById('sim-area');
  const loadingMsg = (typeof t === 'function') ? t('loadingSimulation') : 'Loading simulation...';
  simArea.innerHTML = `<div class="sim-loading" style="text-align:center;padding:60px;color:var(--text-muted);">${loadingMsg}</div>`;

  // Launch experiment renderer
  setTimeout(() => {
    if (window.experimentRenderers && window.experimentRenderers[exp.id]) {
      simArea.innerHTML = '';
      activeSimCleanup = window.experimentRenderers[exp.id](simArea, exp);
    } else {
      simArea.innerHTML = `
        <div class="glass-card" style="padding:40px;text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">${exp.icon}</div>
          <h3 style="font-family:'Space Grotesk',sans-serif;font-size:20px;margin-bottom:8px;">${exp.title}</h3>
          <p style="color:var(--text-secondary);font-size:14px;max-width:400px;margin:0 auto;">${exp.description}</p>
          <div style="margin-top:24px;padding:16px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid var(--border-glass);">
            <p style="color:var(--text-muted);font-size:13px;">Interactive simulation loaded. Adjust parameters below to see real-time changes.</p>
          </div>
        </div>
      `;
    }
    
    // Set as recent experiment
    try {
      localStorage.setItem('lab_recent_exp', exp.id);
      let p = parseInt(localStorage.getItem('lab_prog_' + exp.id));
      if (isNaN(p)) {
        localStorage.setItem('lab_prog_' + exp.id, '5'); // initial 5% progress
      }
    } catch (e) {}

  }, 100);
}

// ── Lab Record Toggle ────────────────────────────────────────
function toggleLabRecord() {
  const body = document.getElementById('lab-record-body');
  const icon = document.getElementById('toggle-icon');
  body.classList.toggle('open');
  icon.classList.toggle('open');
}

// ── Clock ────────────────────────────────────────────────────
function updateClock() {
  const timeEl = document.getElementById('nav-time');
  if (!timeEl) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  timeEl.textContent = `${h}:${m}`;
}
let clockInterval = null;

// ── Recent Activity & Progress ───────────────────────────────
function loadRecentActivity() {
  const container = document.getElementById('recent-activity-container');
  if (!container) return;
  
  try {
    const recentId = localStorage.getItem('lab_recent_exp');
    if (!recentId) {
      container.style.display = 'none';
      return;
    }
    
    const exp = findExperiment(recentId);
    if (!exp) {
      container.style.display = 'none';
      return;
    }

    let progress = parseInt(localStorage.getItem('lab_prog_' + recentId)) || 5;
    
    container.style.display = 'block';
    
    const iconWrap = document.getElementById('recent-icon-wrap');
    iconWrap.style.background = exp.iconBg || 'rgba(100,100,100,0.15)';
    document.getElementById('recent-icon').textContent = exp.icon;
    document.getElementById('recent-title').textContent = exp.title;
    
    document.getElementById('recent-progress-text').textContent = progress + '%';
    document.getElementById('recent-progress-fill').style.width = progress + '%';
    
    const btn = document.getElementById('resume-btn');
    btn.onclick = () => {
      // Find the subject for this experiment to set currentSubject
      for (const subject of Object.keys(EXPERIMENTS)) {
        if (EXPERIMENTS[subject].find(e => e.id === recentId)) {
          navigateTo('experiment', recentId);
          break;
        }
      }
    };
  } catch (e) {
    container.style.display = 'none';
  }
}

// ── Progress Tracker ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const simArea = document.getElementById('sim-area');
  if (simArea) {
    simArea.addEventListener('click', trackInteraction);
    simArea.addEventListener('input', trackInteraction);
  }
});

function trackInteraction(e) {
  if (!currentExperiment) return;
  // Ignore clicks on non-interactive elements if possible, but any click implies engagement
  try {
    let p = parseInt(localStorage.getItem('lab_prog_' + currentExperiment.id)) || 5;
    if (p < 100) {
      let oldP = p;
      p += Math.floor(Math.random() * 3) + 2; // Add 2-4% randomly per interaction
      if (p >= 100) {
        p = 100;
        if (typeof experimentCompleted === 'function') {
          experimentCompleted(currentExperiment.id);
        }
      }
      localStorage.setItem('lab_prog_' + currentExperiment.id, p);
    }
  } catch (err) {}
}

// ── Global experiment renderer registry ──────────────────────
window.experimentRenderers = window.experimentRenderers || {};

async function initApp() {
  try {
    await loadExperimentData();
  } catch (error) {
    console.error(error);
    showDataLoadError('Please refresh the page or check that /experiments.json is available.');
    return;
  }

  updateClock();
  if (!clockInterval) clockInterval = setInterval(updateClock, 30000);

  // Dynamically update experiment counts in UI
  let totalExps = 0;
  for (const subj of Object.keys(EXPERIMENTS)) {
    const count = (EXPERIMENTS[subj] || []).length;
    totalExps += count;
    
    // Update dashboard subject counts
    const countEl = document.getElementById(`${subj}-count`);
    if (countEl) countEl.textContent = `${count} Experiments`;
  }
  
  // Update total counts in stats bar
  const statNum = document.querySelector('.stats-bar .stat-item:first-child .stat-num');
  if (statNum) statNum.textContent = totalExps;
  
  // Update landing pills
  const pills = document.querySelectorAll('.landing-pill');
  pills.forEach(pill => {
    if (pill.textContent.includes('Experiments') && pill.textContent.match(/\d+/)) {
      pill.textContent = `📊 ${totalExps} Experiments`;
    }
  });

  // Init language picker (i18n.js must be loaded before app.js)
  if (typeof initLangPicker === 'function') initLangPicker();
  if (typeof initExplorationUI === 'function') initExplorationUI(EXPERIMENTS);
  
  const expId = document.body.getAttribute('data-exp-id');
  if (expId) {
    // MPA Mode: Experiment Page Auto-load
    navigateTo('experiment', expId, true);
  } else {
    // Check if we are on a subject page via body attribute
    const subjId = document.body.getAttribute('data-subject-id');
    if (subjId) {
      navigateTo('subject', subjId, true);
    } else {
      // SPA or Homepage mode
      if (document.getElementById('view-dashboard')) {
        navigateTo('dashboard', null, true);
        if (typeof renderDashboard === 'function') renderDashboard();
      }
    }
  }
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initApp);
