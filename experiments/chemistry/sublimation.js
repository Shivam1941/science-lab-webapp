/* ============================================================
   SUBLIMATION OF NH₄Cl — Vapor Particle Canvas Simulation
   Faithful port of the Flutter CustomPainter experiment
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};

  window.experimentRenderers['sublimation_ammonium_chloride'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Sublimation?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Sublimation'], ans: 3, exp: 'The experiment focuses on the specific principles of Sublimation.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Sublimation experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let phase = 'setup'; // setup, heating, sublimating, inspection, scraping
    let burnerOn = false;
    let temperature = 25;
    let sublimationRate = 0;
    let depositThickness = 0;
    let cottonPlugInserted = false;
    let showWarning = false;
    let scrapedAmount = 0;
    let mixtureAmount = 1;
    let particles = [];
    let notebook = ['Experiment initialized. Insert cotton plug and ignite burner.'];
    let animFrame = null;
    let canvas, ctx;

    const rand = () => Math.random();

    function log(msg) {
      notebook.unshift(msg);
      if (notebook.length > 12) notebook.pop();
      updateNotebook();
    }

    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-phase-bar" id="sub-phase-bar"></div>
        <div id="sub-warning" style="display:none;"></div>
        <div class="sim-canvas-wrap">
          <canvas id="sub-canvas" width="800" height="400"></canvas>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Start Viva</button>

            <div class="sim-controls-title"><span class="ctrl-icon">🎛️</span> Controls</div>
            <div class="sim-btn-group" id="sub-btns">
              <button class="sim-btn" id="sub-plug-btn" onclick="window._subTogglePlug()">🔘 Insert Plug</button>
              <button class="sim-btn" id="sub-burner-btn" onclick="window._subToggleBurner()">🔥 Light Burner</button>
            </div>
            <div id="sub-scrape-area" style="display:none;margin-top:12px;">
              <p style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">Drag slider to scrape NH₄Cl from funnel:</p>
              <input type="range" class="sim-control-slider slider-chemistry" id="sub-scrape" min="0" max="100" step="1" value="0" />
              <p style="font-size:12px;color:var(--text-muted);margin-top:4px;" id="sub-scrape-pct">0% collected</p>
            </div>
          </div>
          <div class="sim-data-panel">
            <div class="sim-data-title">📈 Live Data</div>
            <div class="sim-data-row">
              <span class="sim-data-label">Temperature</span>
              <div class="sim-data-bar-track"><div class="sim-data-bar-fill" id="sub-temp-bar" style="width:4%;background:linear-gradient(90deg,#22c55e,#f97316);"></div></div>
              <span class="sim-data-value" id="sub-temp-val">25 °C</span>
            </div>
            <div class="sim-data-row">
              <span class="sim-data-label">Sublimation Rate</span>
              <div class="sim-data-bar-track"><div class="sim-data-bar-fill" id="sub-rate-bar" style="width:0%;background:#8b5cf6;"></div></div>
              <span class="sim-data-value" id="sub-rate-val">0%</span>
            </div>
            <div class="sim-data-row">
              <span class="sim-data-label">Deposit Thickness</span>
              <div class="sim-data-bar-track"><div class="sim-data-bar-fill" id="sub-dep-bar" style="width:0%;background:#06b6d4;"></div></div>
              <span class="sim-data-value" id="sub-dep-val">0%</span>
            </div>
            <div class="sim-data-row">
              <span class="sim-data-label">Mixture Remaining</span>
              <div class="sim-data-bar-track"><div class="sim-data-bar-fill" id="sub-mix-bar" style="width:100%;background:#f59e0b;"></div></div>
              <span class="sim-data-value" id="sub-mix-val">100%</span>
            </div>
          </div>
        </div>
        <div class="sim-notebook">
          <div class="sim-notebook-title">📓 Observation Notebook</div>
          <ul class="sim-notebook-list" id="sub-notebook"></ul>
        </div>
      </div>
    `;

    canvas = document.getElementById('sub-canvas');
    ctx = canvas.getContext('2d');

    // Scrape slider
    document.getElementById('sub-scrape').addEventListener('input', e => {
      scrapedAmount = parseInt(e.target.value) / 100;
      document.getElementById('sub-scrape-pct').textContent = `${(scrapedAmount * 100).toFixed(0)}% collected`;
      if (scrapedAmount >= 0.95) log('Collection complete! Pure NH₄Cl recovered.');
    });

    window._subTogglePlug = () => {
      if (phase === 'sublimating' || phase === 'heating') return;
      cottonPlugInserted = !cottonPlugInserted;
      showWarning = false;
      log(cottonPlugInserted ? 'Cotton plug inserted in funnel stem.' : 'Cotton plug removed.');
      updateBtns();
    };

    window._subToggleBurner = () => {
      if (phase === 'inspection' || phase === 'scraping') return;
      if (!cottonPlugInserted) {
        showWarning = true;
        updateWarning();
        return;
      }
      burnerOn = !burnerOn;
      showWarning = false;
      log(burnerOn ? 'Bunsen burner ignited.' : 'Bunsen burner turned off.');
      updateBtns();
      updateWarning();
    };

    function updateBtns() {
      const plugBtn = document.getElementById('sub-plug-btn');
      const burnerBtn = document.getElementById('sub-burner-btn');
      plugBtn.textContent = cottonPlugInserted ? '✅ Plug Inserted' : '🔘 Insert Plug';
      plugBtn.style.borderColor = cottonPlugInserted ? '#22c55e' : 'var(--border-glass)';
      burnerBtn.textContent = burnerOn ? '🔥 Burner ON' : '🔥 Light Burner';
      burnerBtn.style.borderColor = burnerOn ? '#f97316' : 'var(--border-glass)';

      if (phase === 'inspection' || phase === 'scraping') {
        document.getElementById('sub-scrape-area').style.display = 'block';
        const btnsDiv = document.getElementById('sub-btns');
        if (!document.getElementById('sub-scrape-btn')) {
          const btn = document.createElement('button');
          btn.id = 'sub-scrape-btn';
          btn.className = 'sim-btn';
          btn.textContent = '🔧 Scrape';
          btn.style.borderColor = '#8b5cf6';
          btn.onclick = () => { phase = 'scraping'; log('Scraping deposited NH₄Cl from funnel walls...'); };
          btnsDiv.appendChild(btn);
        }
      }
    }

    function updateWarning() {
      const el = document.getElementById('sub-warning');
      if (showWarning) {
        el.style.display = 'block';
        el.innerHTML = `<div style="padding:12px 16px;background:rgba(245,158,11,0.12);border:1px solid #f59e0b;border-radius:10px;display:flex;align-items:center;gap:10px;">
          <span style="font-size:20px;">⚠️</span>
          <span style="color:#fde68a;font-size:13px;">Insert cotton plug in funnel opening before heating! Vapours will escape without it.</span>
        </div>`;
      } else {
        el.style.display = 'none';
      }
    }

    function updatePhaseBar() {
      const phases = ['setup', 'heating', 'sublimating', 'inspection', 'scraping'];
      const labels = ['Setup', 'Heating', 'Sublimating', 'Inspect', 'Scrape'];
      const idx = phases.indexOf(phase);
      const bar = document.getElementById('sub-phase-bar');
      bar.innerHTML = labels.map((l, i) => `
        <div class="sim-phase-step">
          <div class="sim-phase-bar-track ${i < idx ? 'done' : i === idx ? 'active' : ''}"></div>
          <div class="sim-phase-label ${i === idx ? 'active' : ''}">${l}</div>
        </div>
      `).join('');
    }

    function updateNotebook() {
      const el = document.getElementById('sub-notebook');
      el.innerHTML = notebook.map(n => `<li>${n}</li>`).join('');
    }

    function tick() {
      // Temperature
      if (burnerOn && cottonPlugInserted) {
        temperature = Math.min(temperature + 0.8, 600);
      } else if (!burnerOn) {
        temperature = Math.max(temperature - 0.4, 25);
      }

      // Sublimation rate
      sublimationRate = temperature >= 338 ? Math.min((temperature - 338) / 150, 1) : 0;

      // Phase transitions
      if (phase === 'setup' && burnerOn && cottonPlugInserted) {
        phase = 'heating';
        log('Burner ON — heating the mixture.');
      }
      if (phase === 'heating' && sublimationRate > 0.01) {
        phase = 'sublimating';
        log('Sublimation started at ~338°C — NH₄Cl vapour rising!');
      }
      if (phase === 'sublimating' && depositThickness >= 0.95) {
        phase = 'inspection';
        burnerOn = false;
        log('Sublimation complete. Burner turned off. Inspect funnel.');
        updateBtns();
      }

      // Mixture depletion
      if (phase === 'sublimating') {
        mixtureAmount = Math.max(mixtureAmount - sublimationRate * 0.0012, 0);
      }

      // Spawn particles
      if (phase === 'sublimating' || (phase === 'heating' && sublimationRate > 0)) {
        const count = Math.ceil(sublimationRate * 3);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: 0.42 + rand() * 0.16,
            y: 0.58 + rand() * 0.04,
            vx: (rand() - 0.5) * 0.003,
            vy: -(0.004 + rand() * 0.006 * sublimationRate),
            opacity: 0.6 + rand() * 0.4,
            radius: 1.5 + rand() * 2.5,
            hue: rand() > 0.5 ? 270 : (280 + rand() * 60)
          });
        }
      }

      // Update particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity -= 0.005;
        if (p.y < 0.32 && p.x > 0.28 && p.x < 0.72) {
          depositThickness = Math.min(depositThickness + 0.0008, 1);
          p.opacity = 0;
        }
      }
      particles = particles.filter(p => p.opacity > 0 && p.y > 0.1);

      if (burnerOn && !cottonPlugInserted) {
        showWarning = true;
        burnerOn = false;
        updateWarning();
      }

      // Update data displays
      document.getElementById('sub-temp-val').textContent = `${temperature.toFixed(0)} °C`;
      document.getElementById('sub-temp-bar').style.width = `${(temperature / 600) * 100}%`;
      document.getElementById('sub-rate-val').textContent = `${(sublimationRate * 100).toFixed(0)}%`;
      document.getElementById('sub-rate-bar').style.width = `${sublimationRate * 100}%`;
      document.getElementById('sub-dep-val').textContent = `${(depositThickness * 100).toFixed(0)}%`;
      document.getElementById('sub-dep-bar').style.width = `${depositThickness * 100}%`;
      document.getElementById('sub-mix-val').textContent = `${(mixtureAmount * 100).toFixed(0)}%`;
      document.getElementById('sub-mix-bar').style.width = `${mixtureAmount * 100}%`;

      updatePhaseBar();
    }

    function drawSim() {
      tick();

      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Tripod
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      [[0.30, 0.62, 0.18, 0.88], [0.70, 0.62, 0.82, 0.88], [0.50, 0.62, 0.50, 0.88]].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath(); ctx.moveTo(w * x1, h * y1); ctx.lineTo(w * x2, h * y2); ctx.stroke();
      });
      ctx.beginPath(); ctx.moveTo(w * 0.30, h * 0.62); ctx.lineTo(w * 0.70, h * 0.62); ctx.stroke();

      // Wire gauze
      ctx.fillStyle = '#475569';
      ctx.fillRect(w * 0.28, h * 0.60, w * 0.44, h * 0.03);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.8;
      for (let x = w * 0.28 + 4; x < w * 0.72; x += 6) {
        ctx.beginPath(); ctx.moveTo(x, h * 0.60); ctx.lineTo(x, h * 0.63); ctx.stroke();
      }

      // China dish
      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.moveTo(w * 0.30, h * 0.58);
      ctx.quadraticCurveTo(w * 0.50, h * 0.64, w * 0.70, h * 0.58);
      ctx.quadraticCurveTo(w * 0.72, h * 0.60, w * 0.68, h * 0.62);
      ctx.quadraticCurveTo(w * 0.50, h * 0.66, w * 0.32, h * 0.62);
      ctx.quadraticCurveTo(w * 0.28, h * 0.60, w * 0.30, h * 0.58);
      ctx.closePath();
      ctx.fill();

      // Mixture
      ctx.fillStyle = `rgba(194, 160, 110, ${0.6 + mixtureAmount * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(w * 0.50, h * 0.595, w * 0.16, h * 0.012, 0, 0, Math.PI * 2);
      ctx.fill();
      // NH4Cl white spots
      ctx.fillStyle = `rgba(255, 255, 255, ${mixtureAmount * 0.6})`;
      for (let i = 0; i < 8; i++) {
        const sx = w * (0.38 + (i * 0.037));
        const sy = h * (0.59 + Math.sin(i * 2.3) * 0.004);
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Inverted funnel
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.lineWidth = 2;
      // Funnel body (trapezoid)
      ctx.beginPath();
      ctx.moveTo(w * 0.32, h * 0.55);
      ctx.lineTo(w * 0.42, h * 0.20);
      ctx.lineTo(w * 0.58, h * 0.20);
      ctx.lineTo(w * 0.68, h * 0.55);
      ctx.stroke();
      // Funnel top (stem)
      ctx.beginPath();
      ctx.moveTo(w * 0.47, h * 0.20);
      ctx.lineTo(w * 0.47, h * 0.10);
      ctx.moveTo(w * 0.53, h * 0.20);
      ctx.lineTo(w * 0.53, h * 0.10);
      ctx.stroke();

      // Deposit on funnel (white layer)
      if (depositThickness > 0) {
        const dep = depositThickness;
        ctx.fillStyle = `rgba(255, 255, 255, ${dep * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(w * (0.34 + dep * 0.02), h * 0.52);
        ctx.lineTo(w * 0.43, h * (0.22 + (1 - dep) * 0.15));
        ctx.lineTo(w * 0.57, h * (0.22 + (1 - dep) * 0.15));
        ctx.lineTo(w * (0.66 - dep * 0.02), h * 0.52);
        ctx.closePath();
        ctx.fill();
      }

      // Cotton plug
      if (cottonPlugInserted) {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.ellipse(w * 0.50, h * 0.19, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(w * p.x, h * p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 75%, ${p.opacity})`;
        ctx.fill();
      }

      // Bunsen burner
      ctx.fillStyle = '#475569';
      ctx.fillRect(w * 0.47, h * 0.88, w * 0.06, h * 0.10);
      ctx.fillStyle = '#334155';
      ctx.fillRect(w * 0.44, h * 0.95, w * 0.12, h * 0.04);

      // Flame
      if (burnerOn) {
        const flameH = 0.08 + sublimationRate * 0.04;
        const flameGrad = ctx.createLinearGradient(w * 0.50, h * 0.88, w * 0.50, h * (0.88 - flameH));
        flameGrad.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
        flameGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.8)');
        flameGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.6)');
        flameGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.beginPath();
        ctx.moveTo(w * 0.47, h * 0.88);
        ctx.quadraticCurveTo(w * 0.46, h * (0.88 - flameH * 0.5), w * 0.50, h * (0.88 - flameH));
        ctx.quadraticCurveTo(w * 0.54, h * (0.88 - flameH * 0.5), w * 0.53, h * 0.88);
        ctx.closePath();
        ctx.fillStyle = flameGrad;
        ctx.fill();

        // Inner flame
        ctx.beginPath();
        ctx.moveTo(w * 0.485, h * 0.88);
        ctx.quadraticCurveTo(w * 0.48, h * (0.88 - flameH * 0.35), w * 0.50, h * (0.88 - flameH * 0.6));
        ctx.quadraticCurveTo(w * 0.52, h * (0.88 - flameH * 0.35), w * 0.515, h * 0.88);
        ctx.closePath();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.fill();
      }

      // Temperature label
      ctx.fillStyle = temperature > 300 ? '#f97316' : '#94a3b8';
      ctx.font = 'bold 14px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`${temperature.toFixed(0)}°C`, w * 0.50, h * 0.75);

      // Collection container (inspection/scraping phase)
      if (phase === 'inspection' || phase === 'scraping') {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.fillRect(w * 0.75, h * 0.70, w * 0.12, h * 0.05);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(w * 0.75, h * 0.70, w * 0.12, h * 0.05);
        ctx.fillStyle = `rgba(255, 255, 255, ${scrapedAmount * 0.7})`;
        ctx.fillRect(w * 0.752, h * 0.71, w * 0.116 * scrapedAmount, h * 0.03);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px Inter';
        ctx.fillText('Watch Glass', w * 0.81, h * 0.80);
      }

      ctx.textAlign = 'start';

      animFrame = requestAnimationFrame(drawSim);
    }

    updatePhaseBar();
    updateNotebook();
    drawSim();

    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
      delete window._subTogglePlug;
      delete window._subToggleBurner;
    };
  };
})();
