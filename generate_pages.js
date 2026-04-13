const fs = require('fs');
const path = require('path');

const data = eval("(" + fs.readFileSync('experiments.json', 'utf8') + ")");

const viewExperimentTemplate = `
    <!-- EXPERIMENT VIEW (Required by app.js) -->
    <section class="view" id="view-experiment" style="margin-top: 40px; padding: 20px;">
      <div class="exp-topbar">
        <button class="back-btn" id="exp-back-btn">
          <span class="back-arrow">←</span> Back
        </button>
        <div class="exp-title-wrap">
          <span class="exp-subject-badge" id="exp-subject-badge"></span>
          <h2 class="exp-title" id="exp-title"></h2>
        </div>
      </div>
      <div class="lab-record glass-card" id="lab-record">
        <button class="lab-record-toggle" id="lab-record-toggle" onclick="toggleLabRecord()">
          <span>📋 Lab Record</span>
          <span class="toggle-icon" id="toggle-icon">▼</span>
        </button>
        <div class="lab-record-body" id="lab-record-body">
          <div class="lab-record-grid" id="lab-record-grid"></div>
        </div>
      </div>
      <div class="sim-area" id="sim-area"></div>
    </section>
`;

// Common wrapper
const wrapHtml = (title, desc, bodyContent, expId = '') => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | Virtual Science Lab</title>
  <meta name="description" content="${desc}" />
  <link rel="stylesheet" href="/assets/css/styles.css" />
</head>
<body ${expId ? `data-exp-id="${expId}"` : ''}>
  <div id="navbar-container"></div>
  <main class="main-container" id="app-root">
    ${bodyContent}
  </main>
  
  <script src="/assets/js/navbar.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <script src="/assets/js/gamification.js"></script>
  <script src="/assets/js/i18n.js"></script>
  <script src="/assets/js/i18n_experiments_hi.js"></script>
  <script src="/assets/js/i18n_experiments_ta.js"></script>
  <script src="/assets/js/i18n_experiments_te.js"></script>
  <script src="/assets/js/i18n_experiments_kn.js"></script>
  <script src="/assets/js/i18n_experiments_bn.js"></script>
  <script src="/assets/js/i18n_experiments_mr.js"></script>
  <script src="/assets/js/viva_system.js"></script>
  <script src="/assets/js/app.js"></script>
  
  <!-- All experiments attached so simulation logic is available -->
  ${Object.keys(data).map(subj => data[subj].map(exp => `<script src="/experiments/${subj}/${exp.id}.js"></script>`).join('\n  ')).join('\n  ')}
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <script src="/experiments/biology/heart_3d.js"></script>
</body>
</html>`;

// Create Directories
const baseExpDir = path.join(__dirname, 'experiments');
if(!fs.existsSync(baseExpDir)) fs.mkdirSync(baseExpDir);

// 1. Generate Individual Experiment Pages
Object.keys(data).forEach(subj => {
  const subjDir = path.join(baseExpDir, subj);
  if(!fs.existsSync(subjDir)) fs.mkdirSync(subjDir);
  
  data[subj].forEach(exp => {
    // Generate SEO content
    let body = `
      <section class="seo-experiment" style="padding: 40px 20px; max-width: 1000px; margin: 0 auto;">
        
        <!-- SEO Semantic Content -->
        <article style="display:none;">
          <h1>${exp.title}</h1>
          <h2>Theory</h2>
          <p>${exp.aim}</p>
          <h2>Procedure</h2>
          <ul>${exp.procedure.map(a => '<li>' + a + '</li>').join('')}</ul>
          <h2>Apparatus</h2>
          <ul>${exp.apparatus.map(a => '<li>' + a + '</li>').join('')}</ul>
          <h2>Viva Questions</h2>
          <p>Interactive viva questions embedded within simulation.</p>
        </article>

        ${viewExperimentTemplate}

      </section>
    `;
    
    // Write
    const fp = path.join(subjDir, exp.id + '.html');
    fs.writeFileSync(fp, wrapHtml(exp.title, exp.description, body, exp.id));
  });
});

// 2. Generate Subject Pages (e.g. experiments/physics.html)
Object.keys(data).forEach(subj => {
  let list = data[subj].map(exp => `
    <a href="/experiments/${subj}/${exp.id}.html" style="display:block; text-decoration:none; color:inherit; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); padding:20px; border-radius:12px; margin-bottom:16px; cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.07)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
      <div style="font-size:32px; display:inline-block; vertical-align:middle; margin-right:16px; background:${exp.iconBg}; padding:10px; border-radius:8px;">${exp.icon}</div>
      <div style="display:inline-block; vertical-align:middle;">
        <h2 style="margin:0; font-family:'Space Grotesk', sans-serif; font-size:20px; color:var(--${subj}-primary, var(--text-primary));">${exp.title}</h2>
        <p style="margin:4px 0 0; color:var(--text-secondary); font-size:14px;">${exp.description}</p>
      </div>
    </a>
  `).join('');
  
  let body = `
    <section class="seo-subject" style="padding: 40px 20px; max-width: 850px; margin: 0 auto; min-height:80vh;">
      <button onclick="window.location.href='/index.html'" style="background:transparent; border:none; color:var(--text-secondary); cursor:pointer; font-family:'Inter', sans-serif; font-size:14px; margin-bottom:20px;">
        <span style="margin-right:8px;">←</span> Back to Dashboard
      </button>
      <h1 style="font-family:'Space Grotesk', sans-serif; text-transform:capitalize; font-size:36px; margin-bottom:10px;">${subj} Experiments</h1>
      <p style="color:var(--text-secondary); margin-bottom:40px; font-size:16px;">Explore all <strong>${data[subj].length}</strong> interactive ${subj} experiments for CBSE curriculum.</p>
      ${list}
    </section>
  `;
  const fp = path.join(__dirname, 'experiments', subj + '.html');
  // Need to provide a div that matches id="view-subject" to prevent app.js from re-redirecting, or disable app.js redirect simply by NOT giving it subjId and not calling navigateTo subject.
  // We can just add <div id="view-subject" style="display:none;"></div> to satisfy app.js.
  fs.writeFileSync(fp, wrapHtml(subj.charAt(0).toUpperCase() + subj.slice(1) + ' Experiments', `Interactive ${subj} virtual lab experiments.`, '<div id="view-subject" style="display:none;"></div>' + body));
});

console.log("Pages generated successfully!");
