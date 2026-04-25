/* ============================================================
   DIGITAL LAB — Multi-dimensional Exploration UI
   Filters one experiments.json dataset by subject, class, concept, and difficulty.
   ============================================================ */

function flattenExperiments(data) {
  return Object.entries(data || {}).flatMap(([subject, experiments]) => {
    return (experiments || []).map(exp => ({ ...exp, subject: exp.subject || subject }));
  });
}

function formatFilterLabel(value) {
  if (!value) return '';
  return String(value)
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function experimentUrl(exp) {
  return `/experiments/${exp.subject}/${exp.id}.html`;
}

function renderExperimentCard(exp) {
  return `
    <a class="explore-exp-card" href="${experimentUrl(exp)}">
      <div class="explore-exp-topline">
        <span class="explore-exp-icon" style="background:${exp.iconBg || 'rgba(255,255,255,0.08)'}">${exp.icon || '🔬'}</span>
        <span class="explore-pill pill-${exp.subject}">${formatFilterLabel(exp.subject)}</span>
      </div>
      <h3>${exp.title}</h3>
      <p>${exp.description}</p>
      <div class="explore-exp-meta">
        <span>Class ${exp.class || '9-10'}</span>
        <span>${formatFilterLabel(exp.category)}</span>
        <span>${formatFilterLabel(exp.difficulty)}</span>
      </div>
    </a>
  `;
}

function getSelectedFilters() {
  return {
    subject: document.getElementById('filter-subject')?.value || '',
    class: document.getElementById('filter-class')?.value || '',
    category: document.getElementById('filter-category')?.value || '',
    difficulty: document.getElementById('filter-difficulty')?.value || '',
  };
}

function updateExperimentFilters(experiments) {
  const filters = getSelectedFilters();
  const filtered = experiments.filter(exp => {
    return (!filters.subject || exp.subject === filters.subject) &&
      (!filters.class || exp.class === filters.class) &&
      (!filters.category || exp.category === filters.category) &&
      (!filters.difficulty || exp.difficulty === filters.difficulty);
  });

  const grid = document.getElementById('filtered-experiment-grid');
  const count = document.getElementById('filtered-count');
  const empty = document.getElementById('filtered-empty');

  if (count) count.textContent = `${filtered.length} experiment${filtered.length === 1 ? '' : 's'} found`;
  if (grid) grid.innerHTML = filtered.map(renderExperimentCard).join('');
  if (empty) empty.hidden = filtered.length > 0;

  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const nextUrl = params.toString() ? `/experiments.html?${params.toString()}` : '/experiments.html';
  if (window.location.pathname.endsWith('/experiments.html')) {
    window.history.replaceState(null, '', nextUrl);
  }
}

function populateSelect(select, values, labelPrefix) {
  if (!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">All ${labelPrefix}</option>` + values
    .map(value => `<option value="${value}">${formatFilterLabel(value)}</option>`)
    .join('');
  select.value = current;
}

function initExperimentFilterPage(experiments) {
  const grid = document.getElementById('filtered-experiment-grid');
  if (!grid) return;

  populateSelect(document.getElementById('filter-subject'), [...new Set(experiments.map(exp => exp.subject))], 'Subjects');
  populateSelect(document.getElementById('filter-class'), ['6-8', '9-10', '11-12'], 'Classes');
  populateSelect(document.getElementById('filter-category'), [...new Set(experiments.map(exp => exp.category))].sort(), 'Concepts');
  populateSelect(document.getElementById('filter-difficulty'), ['beginner', 'intermediate', 'advanced'], 'Difficulty');

  const params = new URLSearchParams(window.location.search);
  ['subject', 'class', 'category', 'difficulty'].forEach(key => {
    const select = document.getElementById(`filter-${key === 'category' ? 'category' : key}`);
    if (select && params.get(key)) select.value = params.get(key);
  });

  document.querySelectorAll('[data-experiment-filter]').forEach(select => {
    select.addEventListener('change', () => updateExperimentFilters(experiments));
  });

  const clearBtn = document.getElementById('clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.querySelectorAll('[data-experiment-filter]').forEach(select => { select.value = ''; });
      updateExperimentFilters(experiments);
    });
  }

  updateExperimentFilters(experiments);
}

function initFeaturedExperiments(experiments) {
  const grid = document.getElementById('featured-experiment-grid');
  if (!grid) return;
  const featuredIds = ['ohms_law', 'simple_pendulum', 'ph_scale', 'reaction_lab', 'cell_structure', 'photosynthesis_starch_test', 'meter_bridge', 'heart_3d_explorer'];
  const featured = featuredIds.map(id => experiments.find(exp => exp.id === id)).filter(Boolean).slice(0, 8);
  grid.innerHTML = featured.map(renderExperimentCard).join('');
}

function initExplorationUI(data) {
  const experiments = flattenExperiments(data);
  window.ALL_EXPERIMENTS = experiments;
  initFeaturedExperiments(experiments);
  initExperimentFilterPage(experiments);
}
