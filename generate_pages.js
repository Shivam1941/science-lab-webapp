const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://schooluplab.com';
const data = JSON.parse(fs.readFileSync('experiments.json', 'utf8'));

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getExperimentClass(exp, subject) {
  if (exp.class) return exp.class;
  if (exp.id === 'meter_bridge') return '12';
  if (subject === 'biology' && ['photosynthesis_starch_test', 'water_transport_xylem', 'bread_mold_fungus'].includes(exp.id)) return '6-10';
  return '10';
}

function getFormulaText(exp) {
  const text = `${exp.aim || ''} ${exp.conclusion || ''}`;
  const formulaSentence = text.split(/[.;]/).find(sentence => sentence.includes('='));
  if (formulaSentence) {
    const cleanedSentence = formulaSentence
      .replace(/^.*?formula\s+/i, '')
      .replace(/^.*?:\s*/, '')
      .trim();
    const formulaMatch = cleanedSentence.match(/([A-Za-z0-9ρπλ²₁₂₃⁺⁻()\/\s×.+√−-]+\s*=\s*[A-Za-z0-9ρπλ²₁₂₃⁺⁻()\/\s×.+√−-]+)/);
    if (formulaMatch) return formulaMatch[1].trim().replace(/\s+/g, ' ');
  }
  return `Principle: ${exp.aim}`;
}

function getExperimentHeading(exp) {
  return /experiment$/i.test(exp.title) ? exp.title : `${exp.title} Experiment`;
}

function getTheoryText(exp) {
  return `${exp.description} ${exp.aim}`;
}

function getVivaQuestions(exp) {
  const experimentHeading = getExperimentHeading(exp);
  const apparatus = exp.apparatus && exp.apparatus.length ? exp.apparatus[0] : 'apparatus';
  const precaution = exp.precautions && exp.precautions.length ? exp.precautions[0] : 'proper lab precautions';

  return [
    `What is the main aim of the ${experimentHeading}?`,
    `Which principle is demonstrated in the ${experimentHeading}?`,
    `What apparatus is required for this experiment?`,
    `Why is ${escapeHtml(apparatus)} used in this experiment?`,
    `What formula or relationship is verified in this experiment?`,
    `What precaution should be followed while performing this experiment?`,
    `What conclusion can be drawn from the ${experimentHeading}?`
  ].map(question => question.replace(escapeHtml(apparatus), apparatus).replace('proper lab precautions', precaution));
}

function getRelatedExperiments(exp, subject) {
  const allExperiments = Object.entries(data).flatMap(([itemSubject, experiments]) => {
    return experiments.map(item => ({ ...item, subject: item.subject || itemSubject }));
  });

  const related = allExperiments
    .filter(item => item.id !== exp.id)
    .map(item => {
      let score = 0;
      if (item.subject === subject) score += 3;
      if (item.category && item.category === exp.category) score += 4;
      if (item.class && item.class === exp.class) score += 2;
      if (item.difficulty && item.difficulty === exp.difficulty) score += 1;
      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 5);

  return related.length ? related : allExperiments.filter(item => item.id !== exp.id).slice(0, 5);
}

function discoverRendererFiles() {
  const rendererFiles = {};
  const expRoot = path.join(__dirname, 'experiments');

  for (const subject of fs.readdirSync(expRoot)) {
    const subjectDir = path.join(expRoot, subject);
    if (!fs.statSync(subjectDir).isDirectory()) continue;

    for (const file of fs.readdirSync(subjectDir)) {
      if (!file.endsWith('.js')) continue;
      const fullPath = path.join(subjectDir, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      const match = content.match(/experimentRenderers\[['"]([^'"]+)['"]\]/);
      if (match) {
        rendererFiles[match[1]] = `/experiments/${subject}/${file}`;
      }
    }
  }

  return rendererFiles;
}

const rendererFiles = discoverRendererFiles();

function commonScripts(extraScripts = []) {
  return `
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
  <script src="/assets/js/app.js"></script>${extraScripts.map(src => `\n  <script src="${src}"></script>`).join('')}`;
}

function wrapHtml({ title, description, canonicalPath, bodyAttrs = '', bodyContent, extraScripts = [], appendSiteTitle = true }) {
  const canonical = `${SITE_URL}${canonicalPath}`;
  const pageTitle = appendSiteTitle ? `${title} | Virtual Science Lab` : title;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <script src="/assets/js/theme.js"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${escapeHtml(pageTitle)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/css/styles.css" />
</head>
<body${bodyAttrs ? ' ' + bodyAttrs : ''}>
  <div id="navbar-container"></div>
  <main class="main-container" id="app-root">
${bodyContent}
  </main>
${commonScripts(extraScripts)}
</body>
</html>
`;
}

function experimentViewTemplate(exp) {
  const theory = getTheoryText(exp);
  const formula = getFormulaText(exp);
  const vivaQuestions = getVivaQuestions(exp);
  const experimentHeading = getExperimentHeading(exp);
  const relatedExperiments = getRelatedExperiments(exp, exp.subject);

  return `    <section class="seo-experiment" style="padding: 40px 0; width: 100%; margin: 0 auto;">
      <article class="glass-card" style="padding: 28px; margin-bottom: 28px;">
        <p style="margin:0 0 12px;color:var(--text-secondary);font-size:14px;"><a href="/experiments/${exp.subject}.html" style="color:inherit;">${titleCase(exp.subject)} Experiments</a> / ${escapeHtml(exp.title)}</p>
        <h1 style="font-family:'Space Grotesk',sans-serif;font-size:40px;margin:0 0 12px;">${escapeHtml(experimentHeading)}</h1>
        <p style="color:var(--text-secondary);line-height:1.7;margin:0 0 20px;">${escapeHtml(exp.description)}</p>
        <h2 style="font-size:22px;margin:24px 0 10px;">Theory</h2>
        <p style="color:var(--text-secondary);line-height:1.7;">${escapeHtml(theory)}</p>
        <h2 style="font-size:22px;margin:24px 0 10px;">Formula</h2>
        <p style="color:var(--text-secondary);line-height:1.7;">${escapeHtml(formula)}</p>
        <h2 style="font-size:22px;margin:24px 0 10px;">Aim</h2>
        <p style="color:var(--text-secondary);line-height:1.7;">${escapeHtml(exp.aim)}</p>
        <h2 style="font-size:22px;margin:24px 0 10px;">Apparatus</h2>
        <ul style="color:var(--text-secondary);line-height:1.7;">${exp.apparatus.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        <h2 style="font-size:22px;margin:24px 0 10px;">Procedure</h2>
        <ol style="color:var(--text-secondary);line-height:1.7;">${exp.procedure.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol>
        <h2 style="font-size:22px;margin:24px 0 10px;">Viva Questions</h2>
        <ol style="color:var(--text-secondary);line-height:1.7;">${vivaQuestions.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol>
        <div class="related-experiments">
          <h3>Related Experiments</h3>
          <ul>${relatedExperiments.map(item => `<li><a href="/experiments/${item.subject}/${item.id}.html">${escapeHtml(item.title)}</a></li>`).join('')}</ul>
        </div>
      </article>

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
    </section>`;
}

function subjectPage(subject, experiments) {
  const list = experiments.map(exp => `
        <a href="/experiments/${subject}/${exp.id}.html" class="exp-list-item" style="text-decoration:none;color:inherit;">
          <div class="exp-item-icon" style="background:${escapeHtml(exp.iconBg)}"><span>${escapeHtml(exp.icon)}</span></div>
          <div class="exp-item-info">
            <h2 class="exp-item-title" style="margin:0;">${escapeHtml(exp.title)}</h2>
            <p class="exp-item-desc">${escapeHtml(exp.description)}</p>
          </div>
          <span class="exp-item-arrow">→</span>
        </a>`).join('');

  return `    <section class="seo-subject" style="padding: 40px 0; width: 100%; margin: 0 auto; min-height:80vh;">
      <a href="/index.html" class="back-btn" style="display:inline-flex;text-decoration:none;margin-bottom:24px;"><span class="back-arrow">←</span> Back to Dashboard</a>
      <h1 style="font-family:'Space Grotesk', sans-serif; text-transform:capitalize; font-size:42px; margin-bottom:10px;">${titleCase(subject)} Experiments</h1>
      <p style="color:var(--text-secondary); margin-bottom:36px; font-size:16px; line-height:1.7;">Explore all <strong>${experiments.length}</strong> interactive ${subject} experiments for the CBSE science curriculum.</p>
      <div class="exp-list">${list}
      </div>
    </section>`;
}

function writeSitemap(urls) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${SITE_URL}${url}</loc>
  </url>`).join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), xml);
}

const sitemapUrls = ['/', '/index.html', '/about.html', '/contact.html', '/experiments.html', '/viva.html'];
const baseExpDir = path.join(__dirname, 'experiments');
if (!fs.existsSync(baseExpDir)) fs.mkdirSync(baseExpDir);

for (const [subject, experiments] of Object.entries(data)) {
  const subjectDir = path.join(baseExpDir, subject);
  if (!fs.existsSync(subjectDir)) fs.mkdirSync(subjectDir);

  const subjectPath = `/experiments/${subject}.html`;
  fs.writeFileSync(path.join(baseExpDir, `${subject}.html`), wrapHtml({
    title: `${titleCase(subject)} Experiments`,
    description: `Interactive ${subject} virtual lab experiments for CBSE students.`,
    canonicalPath: subjectPath,
    bodyContent: subjectPage(subject, experiments),
  }));
  sitemapUrls.push(subjectPath);

  for (const exp of experiments) {
    const expPath = `/experiments/${subject}/${exp.id}.html`;
    const renderer = rendererFiles[exp.id];
    const expClass = getExperimentClass(exp, subject);
    const seoTitle = `${getExperimentHeading(exp)} Class ${expClass} | Formula, Procedure, Viva Questions`;
    const seoDescription = `Learn ${exp.title} with theory, procedure, formula, simulation and viva questions. Designed for CBSE students.`;
    if (!renderer) {
      console.warn(`Missing renderer for ${exp.id}`);
    }

    const scripts = [];
    if (exp.id === 'heart_3d_explorer') {
      scripts.push('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js');
      scripts.push('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js');
    }
    if (renderer) scripts.push(renderer);

    fs.writeFileSync(path.join(subjectDir, `${exp.id}.html`), wrapHtml({
      title: seoTitle,
      description: seoDescription,
      canonicalPath: expPath,
      bodyAttrs: `data-exp-id="${escapeHtml(exp.id)}"`,
      bodyContent: experimentViewTemplate({ ...exp, subject }),
      extraScripts: scripts,
      appendSiteTitle: false,
    }));
    sitemapUrls.push(expPath);
  }
}

writeSitemap(sitemapUrls);
console.log(`Generated ${sitemapUrls.length} sitemap URLs and MPA pages successfully.`);
