/* ============================================================
   Photosynthesis – Starch Test (Iodine Test)
   CBSE Class 6-10 Biology Interactive Experiment
   ============================================================ */
(function () {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['photosynthesis_starch_test'] = function (container, exp) {

    // ── State ────────────────────────────────────────────────
    const STEPS = [
      { id: 0, icon: '🌑', label: 'Destarch Plant', desc: 'Keep plant in dark for 48 hours to remove all stored starch.' },
      { id: 1, icon: '📄', label: 'Cover with Paper', desc: 'Cover part of a leaf with black paper to block sunlight.' },
      { id: 2, icon: '☀️', label: 'Expose to Sunlight', desc: 'Place plant in bright sunlight for 4–6 hours.' },
      { id: 3, icon: '💧', label: 'Boil in Water', desc: 'Boil leaf in water for 5 min to kill cells and fix the leaf.' },
      { id: 4, icon: '🧪', label: 'Boil in Alcohol', desc: 'Heat leaf in alcohol (water bath) until chlorophyll is removed — leaf turns pale/white.' },
      { id: 5, icon: '🟤', label: 'Add Iodine', desc: 'Add iodine solution drops over the leaf. Observe colour change.' },
    ];

    let currentStep = -1;      // -1 = not started
    let completedSteps = [];
    let demoMode = false;
    let demoTimer = null;
    let animFrame = null;
    let vivaMode = false;
    let vivaIdx = 0;
    let vivaScore = 0;
    let answered = [];
    let showHints = false;
    let canvasTime = 0;
    let leafAnimT = 0;
    let bubbleParticles = [];

    // observation table answers
    const obsAnswers = { exposed: 'blue-black', covered: 'brown/yellow' };
    let obsSubmitted = false;

    // Viva questions
    const vivaQuestions = [
      {
        q: 'Why is the leaf boiled in alcohol during the iodine test?',
        options: ['To add colour to the leaf', 'To remove chlorophyll so colour change is visible', 'To kill bacteria in the leaf', 'To make the leaf soft'],
        ans: 1,
        exp: 'Alcohol dissolves chlorophyll (the green pigment). Removing it allows the blue-black iodine colour change to be clearly seen.'
      },
      {
        q: 'What does iodine solution indicate?',
        options: ['Presence of glucose', 'Presence of starch', 'Presence of chlorophyll', 'Presence of water'],
        ans: 1,
        exp: 'Iodine solution (iodine + potassium iodide) turns blue-black in the presence of starch. This is a standard starch indicator.'
      },
      {
        q: 'Why is the plant kept in the dark for 48 hours before the experiment?',
        options: ['To water it', 'To allow it to grow more leaves', 'To remove all stored starch (destarching)', 'To prevent wilting'],
        ans: 2,
        exp: 'Destarching removes all existing starch so that any starch found after the experiment was produced during the experiment, giving an accurate result.'
      },
      {
        q: 'Why is only PART of the leaf covered with black paper?',
        options: ['To make the experiment look nice', 'To act as a control — compare covered vs uncovered parts', 'To protect the leaf from insects', 'To keep the leaf cool'],
        ans: 1,
        exp: 'The covered part acts as a negative control. Any starch found only in the uncovered part proves that sunlight (not some other factor) caused photosynthesis.'
      },
      {
        q: 'What colour does the uncovered (sunlit) part of the leaf turn with iodine?',
        options: ['Red', 'Yellow-brown', 'Blue-black', 'Green'],
        ans: 2,
        exp: 'The uncovered part was in sunlight and performed photosynthesis, producing starch. Iodine reacts with starch to give a characteristic blue-black colour.'
      },
      {
        q: 'Why is alcohol heated in a water bath and NOT directly over a flame?',
        options: ['Water bath heats faster', 'Alcohol is highly flammable — direct flame is dangerous', 'Direct flame breaks the beaker', 'Water bath is cheaper'],
        ans: 1,
        exp: 'Ethanol is highly flammable. Heating it directly over an open flame is a serious fire hazard. A water bath provides controlled, indirect heat safely.'
      },
      {
        q: 'What is the conclusion of this experiment?',
        options: [
          'Photosynthesis does not require light',
          'Iodine is produced by leaves',
          'Light is essential for photosynthesis and starch production',
          'Starch is present everywhere in the leaf equally'
        ],
        ans: 2,
        exp: 'Only the light-exposed part produced starch. The covered part did not. This proves that light energy is essential for photosynthesis to occur.'
      }
    ];

    // leaf colour states keyed by step
    // [r,g,b,a] for exposed zone  /  [r,g,b,a] for covered zone
    const leafColors = [
      { exp: [34, 139, 34, 1], cov: [34, 139, 34, 1], label: 'Dark green (normal leaf)' },
      { exp: [34, 139, 34, 1], cov: [30, 30, 30, 0.85], label: 'Covered part shielded' },
      { exp: [50, 170, 50, 1], cov: [30, 30, 30, 0.85], label: 'Bright green after sunlight' },
      { exp: [60, 160, 60, 0.85], cov: [50, 140, 50, 0.85], label: 'Boiled — slightly softened' },
      { exp: [240, 240, 220, 1], cov: [230, 230, 215, 1], label: 'Pale / white — chlorophyll removed' },
      { exp: [20, 30, 100, 1], cov: [160, 120, 60, 1], label: 'Iodine applied — result visible!' }
    ];

    // ── HTML Layout ──────────────────────────────────────────
    container.innerHTML = `
      <div class="ps-root">

        <!-- TOP CONTROLS BAR -->
        <div class="ps-topbar">
          <div class="ps-progress-wrap">
            <span class="ps-progress-label" id="ps-step-label">Step 0 / ${STEPS.length}</span>
            <div class="ps-progress-track">
              <div class="ps-progress-fill" id="ps-progress-fill" style="width:0%"></div>
            </div>
          </div>
          <div class="ps-top-btns">
            <button class="ps-ctrl-btn ps-hint-btn" id="ps-hint-btn" onclick="window._psToggleHints()" title="Toggle step hints">💡 Hints</button>
            <button class="ps-ctrl-btn ps-demo-btn" id="ps-demo-btn" onclick="window._psDemoMode()">▶ Auto Demo</button>
            <button class="ps-ctrl-btn ps-reset-btn" onclick="window._psReset()">↺ Reset</button>
          </div>
        </div>

        <!-- MAIN GRID -->
        <div class="ps-main-grid">

          <!-- LEFT: Step Sidebar -->
          <aside class="ps-sidebar">
            <div class="ps-sidebar-title">🧫 Experiment Steps</div>
            <div id="ps-steps-list">
              ${STEPS.map((s, i) => `
                <div class="ps-step-item" id="ps-step-${i}" onclick="window._psDoStep(${i})">
                  <div class="ps-step-num">${i + 1}</div>
                  <div class="ps-step-icon">${s.icon}</div>
                  <div class="ps-step-info">
                    <div class="ps-step-name">${s.label}</div>
                    <div class="ps-step-hint hidden" id="ps-hint-${i}">${s.desc}</div>
                  </div>
                  <div class="ps-step-check" id="ps-check-${i}">○</div>
                </div>
              `).join('')}
            </div>
            <div class="ps-sidebar-note" id="ps-sidebar-note">
              👆 Click steps in order to perform the experiment
            </div>
          </aside>

          <!-- CENTER: Simulation Canvas -->
          <div class="ps-sim-center">
            <div class="ps-canvas-wrap">
              <canvas id="ps-canvas" width="520" height="380"></canvas>
              <div class="ps-canvas-overlay" id="ps-overlay">
                <div class="ps-start-card">
                  <div class="ps-start-icon">🌿</div>
                  <h3>Photosynthesis – Starch Test</h3>
                  <p>Click <strong>Step 1</strong> on the left to begin the experiment, or use <strong>Auto Demo</strong> to watch the full simulation.</p>
                  <button class="ps-big-btn" onclick="window._psDemoMode()">▶ Watch Auto Demo</button>
                </div>
              </div>
            </div>
            <!-- Step feedback banner -->
            <div class="ps-feedback-banner hidden" id="ps-feedback"></div>
            <!-- Current step description -->
            <div class="ps-step-desc-box" id="ps-step-desc">
              <span class="ps-step-desc-icon">ℹ️</span>
              <span id="ps-step-desc-text">Perform each step in order. Start with Step 1.</span>
            </div>
          </div>

          <!-- RIGHT: Info Panel -->
          <aside class="ps-info-panel">
            <div class="ps-panel-section">
              <div class="ps-panel-title">🔬 Observation</div>
              <div class="ps-obs-items" id="ps-obs-items">
                <div class="ps-obs-row">
                  <span class="ps-obs-label">Exposed (light)</span>
                  <span class="ps-obs-value" id="obs-exposed">—</span>
                </div>
                <div class="ps-obs-row">
                  <span class="ps-obs-label">Covered (dark)</span>
                  <span class="ps-obs-value" id="obs-covered">—</span>
                </div>
                <div class="ps-obs-row">
                  <span class="ps-obs-label">Leaf texture</span>
                  <span class="ps-obs-value" id="obs-texture">—</span>
                </div>
              </div>
            </div>

            <div class="ps-panel-section" id="ps-obs-table-section" style="display:none">
              <div class="ps-panel-title">📋 Fill Observation</div>
              <div class="ps-obs-form">
                <label class="ps-obs-form-label">Exposed part iodine colour:</label>
                <select id="obs-q1" class="ps-obs-select">
                  <option value="">-- select --</option>
                  <option value="blue-black">Blue-black</option>
                  <option value="yellow">Yellow</option>
                  <option value="red">Red</option>
                  <option value="brown/yellow">Brown/Yellow</option>
                </select>
                <label class="ps-obs-form-label">Covered part iodine colour:</label>
                <select id="obs-q2" class="ps-obs-select">
                  <option value="">-- select --</option>
                  <option value="blue-black">Blue-black</option>
                  <option value="yellow">Yellow</option>
                  <option value="brown/yellow">Brown/Yellow</option>
                  <option value="green">Green</option>
                </select>
                <button class="ps-obs-submit-btn" onclick="window._psCheckObs()" id="ps-obs-submit">Submit Observation</button>
                <div id="ps-obs-result" class="ps-obs-result hidden"></div>
              </div>
            </div>

            <div class="ps-panel-section" id="ps-result-section" style="display:none">
              <div class="ps-panel-title">✅ Result</div>
              <div class="ps-result-box" id="ps-result-box"></div>
            </div>

            <div class="ps-panel-section">
              <button class="ps-viva-open-btn" id="ps-viva-btn" onclick="window._psOpenViva()" style="display:none">
                🎓 Start Viva Questions
              </button>
            </div>
          </aside>
        </div>

        <!-- VIVA MODAL OVERLAY -->
        <div class="ps-viva-overlay hidden" id="ps-viva-overlay">
          <div class="ps-viva-modal">
            <div class="ps-viva-header">
              <span class="ps-viva-title">🎓 Viva Mode</span>
              <span class="ps-viva-score-label">Score: <strong id="ps-viva-score">0</strong> / ${vivaQuestions.length}</span>
              <button class="ps-viva-close" onclick="window._psCloseViva()">✕</button>
            </div>
            <div class="ps-viva-progress-bar">
              <div class="ps-viva-progress-fill" id="ps-viva-pfill" style="width:0%"></div>
            </div>
            <div id="ps-viva-body"></div>
          </div>
        </div>
      </div>
    `;

    // ── Canvas ───────────────────────────────────────────────
    const canvas = document.getElementById('ps-canvas');
    const ctx = canvas.getContext('2d');

    function randomBetween(a, b) { return a + Math.random() * (b - a); }

    function initBubbles(n, type) {
      bubbleParticles = [];
      for (let i = 0; i < n; i++) {
        bubbleParticles.push({
          x: randomBetween(160, 360),
          y: randomBetween(100, 300),
          r: randomBetween(2, 6),
          dx: randomBetween(-0.4, 0.4),
          dy: randomBetween(-1.2, -0.3),
          alpha: randomBetween(0.4, 0.9),
          color: type === 'steam' ? '#ffffff' : (type === 'alcohol' ? '#c4b5fd' : '#60a5fa'),
          life: randomBetween(0.5, 1)
        });
      }
    }

    function updateBubbles() {
      bubbleParticles.forEach(b => {
        b.x += b.dx + Math.sin(canvasTime * 2 + b.y) * 0.3;
        b.y += b.dy;
        b.alpha -= 0.008;
        if (b.y < 60 || b.alpha <= 0) {
          b.y = randomBetween(260, 310);
          b.x = randomBetween(160, 360);
          b.alpha = randomBetween(0.4, 0.8);
        }
      });
    }

    function lerpColor(c1, c2, t) {
      return [
        Math.round(c1[0] + (c2[0] - c1[0]) * t),
        Math.round(c1[1] + (c2[1] - c1[1]) * t),
        Math.round(c1[2] + (c2[2] - c1[2]) * t),
        +(c1[3] + (c2[3] - c1[3]) * t).toFixed(2)
      ];
    }

    function getLeafColor(zone) {
      if (currentStep < 0) return leafColors[0][zone];
      const step = Math.min(currentStep, leafColors.length - 1);
      const lc = leafColors[step][zone];
      return lc;
    }

    function rgbaStr(c) { return `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`; }

    function drawLeaf(cx, cy, expColor, covColor) {
      ctx.save();
      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 20;

      // Draw leaf shape — ellipse with tapering
      const leafW = 130, leafH = 185;

      // Covered zone (right half of leaf)
      const covGrad = ctx.createLinearGradient(cx, cy - leafH * 0.5, cx, cy + leafH * 0.5);
      covGrad.addColorStop(0, rgbaStr(covColor));
      covGrad.addColorStop(1, `rgba(${covColor[0] - 20},${covColor[1] - 15},${covColor[2]},${covColor[3]})`);
      ctx.fillStyle = covGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, leafW * 0.5, leafH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Exposed zone (left half)
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx - leafW, cy - leafH, leafW, leafH * 2);
      ctx.clip();
      const expGrad = ctx.createLinearGradient(cx - leafW, cy, cx, cy);
      expGrad.addColorStop(0, rgbaStr(expColor));
      expGrad.addColorStop(1, `rgba(${expColor[0]},${expColor[1]},${expColor[2]},${expColor[3] * 0.85})`);
      ctx.fillStyle = expGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, leafW * 0.5, leafH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.shadowBlur = 0;

      // Midrib
      ctx.strokeStyle = 'rgba(0,80,0,0.3)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - leafH * 0.48);
      ctx.lineTo(cx, cy + leafH * 0.48);
      ctx.stroke();

      // Veins
      ctx.strokeStyle = 'rgba(0,80,0,0.18)';
      ctx.lineWidth = 1.2;
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const vy = cy + i * 25;
        const dir = (i < 0 ? -1 : 1) * 0.6;
        ctx.beginPath();
        ctx.moveTo(cx, vy);
        ctx.quadraticCurveTo(cx + 40 * dir, vy - 12 * dir, cx + leafW * 0.42 * dir, vy - 20 * dir);
        ctx.stroke();
      }

      // Divider line between zones
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - leafH * 0.48);
      ctx.lineTo(cx, cy + leafH * 0.48);
      ctx.stroke();
      ctx.setLineDash([]);

      // Outline
      ctx.strokeStyle = 'rgba(0,50,0,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, leafW * 0.5, leafH * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    function drawStep0(t) {
      // Dark room
      ctx.fillStyle = '#060a10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Stars
      for (let i = 0; i < 40; i++) {
        const sx = (((i * 137) % 520));
        const sy = (((i * 89) % 160));
        ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.3 * Math.sin(t + i)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      // Moon
      ctx.fillStyle = 'rgba(255,240,180,0.85)';
      ctx.beginPath();
      ctx.arc(450, 50, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#060a10';
      ctx.beginPath();
      ctx.arc(463, 45, 28, 0, Math.PI * 2);
      ctx.fill();

      // Dark room box
      ctx.fillStyle = 'rgba(15,20,30,0.9)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(80, 180, 360, 160, 10);
      ctx.fill(); ctx.stroke();

      // Plant pot in dark
      drawPot(260, 310, 0.7, '#222');
      drawLeaf(260, 230, [34, 100, 34, 0.6], [34, 100, 34, 0.6]);

      // Label
      ctx.fillStyle = '#64748b';
      ctx.font = '13px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('🌑 Plant in darkness — 48 hours', 260, 360);
      ctx.textAlign = 'start';
    }

    function drawPot(cx, cy, scale, soilColor) {
      const s = scale;
      // Pot
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(cx - 40 * s, cy - 25 * s, 80 * s, 55 * s, [0, 0, 8, 8]);
      ctx.fill();
      ctx.fillStyle = '#92400e';
      ctx.fillRect(cx - 45 * s, cy - 30 * s, 90 * s, 12 * s);
      ctx.beginPath();
      ctx.roundRect(cx - 45 * s, cy - 30 * s, 90 * s, 12 * s, 4);
      ctx.fill();
      // Soil
      ctx.fillStyle = soilColor || '#3d2a10';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 22 * s, 35 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawSunScene(t) {
      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, 280);
      sky.addColorStop(0, '#0c1445');
      sky.addColorStop(0.4, '#1e3a8a');
      sky.addColorStop(1, '#7c3aed44');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, canvas.width, 280);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 280, canvas.width, 100);

      // Sun
      const sunX = 430, sunY = 70;
      const sunR = 38;
      const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 3);
      glow.addColorStop(0, 'rgba(255,220,50,0.6)');
      glow.addColorStop(1, 'rgba(255,180,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();

      // Light rays
      ctx.strokeStyle = 'rgba(253,224,71,0.25)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + t * 0.3;
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(ang) * (sunR + 5), sunY + Math.sin(ang) * (sunR + 5));
        ctx.lineTo(sunX + Math.cos(ang) * (sunR + 25), sunY + Math.sin(ang) * (sunR + 25));
        ctx.stroke();
      }
    }

    function drawBoilingScene(t, liquid) {
      // Beaker
      const bx = 180, by = 290, bw = 160, bh = 110;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Flame
      const flameColors = ['#ef4444', '#f97316', '#fbbf24'];
      for (let fi = 0; fi < 3; fi++) {
        ctx.fillStyle = flameColors[fi];
        ctx.globalAlpha = 0.7 + Math.sin(t * 8 + fi) * 0.3;
        ctx.beginPath();
        ctx.ellipse(260, by + bh + 20 - fi * 8, 20 - fi * 5, 25 - fi * 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Beaker body
      ctx.strokeStyle = liquid === 'water' ? '#60a5fa' : '#a78bfa';
      ctx.lineWidth = 3;
      ctx.fillStyle = liquid === 'water' ? 'rgba(96,165,250,0.12)' : 'rgba(167,139,250,0.12)';
      ctx.beginPath();
      ctx.moveTo(bx, by - bh);
      ctx.lineTo(bx - 10, by);
      ctx.lineTo(bx + bw + 10, by);
      ctx.lineTo(bx + bw, by - bh);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Liquid level
      ctx.fillStyle = liquid === 'water' ? 'rgba(96,165,250,0.3)' : 'rgba(167,139,250,0.25)';
      ctx.beginPath();
      ctx.rect(bx + 2, by - bh * 0.7, bw - 4, bh * 0.7 - 2);
      ctx.fill();

      // Bubbles
      updateBubbles();
      bubbleParticles.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.globalAlpha = b.alpha;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Leaf in beaker
      ctx.save();
      ctx.translate(260, by - bh * 0.4);
      ctx.rotate(Math.sin(t * 0.5) * 0.05);
      const lc = getLeafColor('exp');
      const cc = getLeafColor('cov');
      drawLeaf(0, 0, lc, cc);
      ctx.restore();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(liquid === 'water' ? '💧 Boiling in water — 5 min' : '🧪 Boiling in alcohol (water bath)', 260, 370);
      ctx.textAlign = 'start';
    }

    function drawIodineScene(t) {
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Petri dish
      ctx.strokeStyle = 'rgba(148,163,184,0.4)';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(15,20,35,0.6)';
      ctx.beginPath();
      ctx.ellipse(260, 220, 150, 70, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Expanded leaf in petri dish
      ctx.save();
      ctx.translate(260, 210);
      ctx.scale(1.15, 0.9);
      const ec = getLeafColor('exp');
      const cc = getLeafColor('cov');
      drawLeaf(0, 0, ec, cc);
      ctx.restore();

      // Dropper animation
      const dropperY = 80 + Math.sin(t * 1.5) * 10;
      ctx.fillStyle = '#475569';
      ctx.fillRect(320, dropperY, 18, 50);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(329, dropperY, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iodine drops
      if (currentStep >= 5) {
        ctx.fillStyle = 'rgba(100,60,160,0.6)';
        for (let d = 0; d < 3; d++) {
          ctx.beginPath();
          const dy = dropperY + 55 + d * 25 + Math.sin(t * 3 + d) * 3;
          ctx.arc(329, dy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Labels on leaf zones
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      if (currentStep >= 5) {
        ctx.fillStyle = '#818cf8';
        ctx.fillText('Blue-black ✓', 200, 290);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('Brown/Yellow ✗', 320, 290);
        ctx.fillStyle = '#22c55e';
        ctx.font = '13px Inter';
        ctx.fillText('🔬 Starch confirmed in light-exposed zone!', 260, 345);
      } else {
        ctx.fillStyle = '#64748b';
        ctx.fillText('Light zone', 200, 295);
        ctx.fillText('Covered zone', 320, 295);
      }
      ctx.textAlign = 'start';
    }

    function drawCanvas() {
      canvasTime += 0.02;
      const t = canvasTime;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (currentStep < 0) {
        // Idle: animated plant
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#060d1f');
        sky.addColorStop(1, '#0f172a');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
        drawPot(260, 310, 1, '#3d2a10');
        const pulse = Math.sin(t * 0.8) * 3;
        ctx.save();
        ctx.translate(0, pulse);
        drawLeaf(260, 190, [34, 139, 34, 1], [34, 139, 34, 1]);
        ctx.restore();
        ctx.fillStyle = '#334155';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Ready to begin • Click Step 1', 260, 365);
        ctx.textAlign = 'start';
      } else if (currentStep === 0) {
        drawStep0(t);
      } else if (currentStep === 1) {
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#0c1445');
        sky.addColorStop(1, '#0f172a');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 280, w, h);
        drawPot(260, 320, 1, '#3d2a10');
        drawLeaf(260, 210, leafColors[1].exp, leafColors[1].cov);
        // paper indicator
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(275, 140, 70, 155, 4);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#64748b';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Black', 311, 195);
        ctx.fillText('Paper', 311, 210);
        ctx.textAlign = 'start';
        ctx.fillStyle = '#475569';
        ctx.font = '13px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('📄 Right half covered with black paper', 260, 370);
        ctx.textAlign = 'start';
      } else if (currentStep === 2) {
        drawSunScene(t);
        drawPot(260, 330, 1, '#3d2a10');
        drawLeaf(260, 210, leafColors[2].exp, leafColors[2].cov);
        // Paper still on
        ctx.fillStyle = 'rgba(15,23,42,0.8)';
        ctx.beginPath();
        ctx.roundRect(275, 135, 70, 155, 4);
        ctx.fill();
        ctx.fillStyle = 'rgba(253,224,71,0.15)';
        ctx.beginPath();
        ctx.moveTo(430, 70);
        ctx.lineTo(230, 135);
        ctx.lineTo(230, 290);
        ctx.lineTo(430, 70);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('☀️ Sunlight — photosynthesis happening!', 260, 375);
        ctx.textAlign = 'start';
      } else if (currentStep === 3) {
        initBubbles(20, 'steam');
        drawBoilingScene(t, 'water');
      } else if (currentStep === 4) {
        initBubbles(15, 'alcohol');
        drawBoilingScene(t, 'alcohol');
      } else if (currentStep === 5) {
        drawIodineScene(t);
      }

      animFrame = requestAnimationFrame(drawCanvas);
    }

    // ── Step Logic ───────────────────────────────────────────
    function updateStepUI() {
      const pct = currentStep < 0 ? 0 : Math.round(((currentStep + 1) / STEPS.length) * 100);
      document.getElementById('ps-progress-fill').style.width = pct + '%';
      document.getElementById('ps-step-label').textContent = `Step ${Math.max(0, currentStep + 1)} / ${STEPS.length}`;

      STEPS.forEach((s, i) => {
        const el = document.getElementById(`ps-step-${i}`);
        const chk = document.getElementById(`ps-check-${i}`);
        el.classList.remove('ps-step-active', 'ps-step-done', 'ps-step-locked');
        if (completedSteps.includes(i)) {
          el.classList.add('ps-step-done');
          chk.textContent = '✓';
        } else if (i === currentStep + 1 || (currentStep < 0 && i === 0)) {
          el.classList.add('ps-step-active');
          chk.textContent = '→';
        } else if (i > currentStep + 1) {
          el.classList.add('ps-step-locked');
          chk.textContent = '○';
        } else {
          chk.textContent = '○';
        }
      });

      // Update observations
      const textures = ['Normal', 'Normal', 'Turgid', 'Soft/limp', 'Pale/brittle', 'Flat/spread'];
      const expObs = ['—', '—', '—', '—', 'Pale/white', 'Blue-black ◀'];
      const covObs = ['—', '—', '—', '—', 'Pale/white', 'Brown/Yellow ◀'];
      const step = Math.max(0, currentStep);
      document.getElementById('obs-exposed').textContent = expObs[step] || '—';
      document.getElementById('obs-covered').textContent = covObs[step] || '—';
      document.getElementById('obs-texture').textContent = textures[step] || '—';
      if (currentStep >= 4) { document.getElementById('obs-exposed').style.color = '#f0fdf4'; }
      if (currentStep >= 5) {
        document.getElementById('obs-exposed').style.color = '#818cf8';
        document.getElementById('obs-covered').style.color = '#f59e0b';
      }
    }

    function showFeedback(msg, type) {
      const fb = document.getElementById('ps-feedback');
      fb.className = 'ps-feedback-banner ps-fb-' + type;
      fb.textContent = msg;
      setTimeout(() => { fb.classList.add('hidden'); }, 3000);
    }

    window._psDoStep = function (idx) {
      if (demoMode) return;
      const nextExpected = currentStep + 1;
      if (idx > nextExpected) {
        showFeedback('⚠️ Complete previous steps first!', 'error');
        return;
      }
      if (completedSteps.includes(idx)) {
        showFeedback('✓ Already done! Move to the next step.', 'warn');
        return;
      }

      // Hide overlay on first step
      if (currentStep < 0) {
        document.getElementById('ps-overlay').style.display = 'none';
      }

      currentStep = idx;
      completedSteps.push(idx);

      // step description
      document.getElementById('ps-step-desc-text').textContent = STEPS[idx].desc;
      showFeedback('✓ ' + STEPS[idx].label + ' — done!', 'success');

      // Init bubbles for boiling steps
      if (idx === 3) initBubbles(20, 'steam');
      if (idx === 4) initBubbles(15, 'alcohol');

      // After iodine step — show observation form and result
      if (idx === 5) {
        document.getElementById('ps-obs-table-section').style.display = 'block';
        document.getElementById('ps-viva-btn').style.display = 'block';
        showResult();
        // update progress
        try { localStorage.setItem('lab_prog_photosynthesis_starch_test', '85'); } catch (e) {}
      }

      updateStepUI();
    };

    function showResult() {
      const sec = document.getElementById('ps-result-section');
      const box = document.getElementById('ps-result-box');
      sec.style.display = 'block';
      box.innerHTML = `
        <p><strong>🟣 Exposed part:</strong> Turns <span style="color:#818cf8;font-weight:600">blue-black</span> — starch present ✓</p>
        <p style="margin-top:8px"><strong>🟡 Covered part:</strong> Remains <span style="color:#f59e0b;font-weight:600">brown/yellow</span> — no starch ✗</p>
        <p style="margin-top:12px;color:#94a3b8;font-size:13px">
          ∴ <em>Light is essential for photosynthesis. Starch is produced only where light was available.</em>
        </p>
      `;
    }

    window._psCheckObs = function () {
      if (obsSubmitted) return;
      const q1 = document.getElementById('obs-q1').value;
      const q2 = document.getElementById('obs-q2').value;
      const res = document.getElementById('ps-obs-result');
      res.classList.remove('hidden');

      if (!q1 || !q2) {
        res.className = 'ps-obs-result ps-obs-wrong';
        res.textContent = '⚠️ Please select both answers.';
        return;
      }

      const correct = q1 === obsAnswers.exposed && q2 === obsAnswers.covered;
      if (correct) {
        res.className = 'ps-obs-result ps-obs-correct';
        res.innerHTML = '✅ Correct! Excellent observation skills!';
        obsSubmitted = true;
        document.getElementById('ps-obs-submit').disabled = true;
        try { localStorage.setItem('lab_prog_photosynthesis_starch_test', '100'); } catch (e) {}
        if (typeof experimentCompleted === 'function') experimentCompleted('photosynthesis_starch_test');
      } else {
        let hint = [];
        if (q1 !== obsAnswers.exposed) hint.push('Hint: The exposed (light) part shows the iodine starch reaction.');
        if (q2 !== obsAnswers.covered) hint.push('Hint: The covered part cannot make starch without light.');
        res.className = 'ps-obs-result ps-obs-wrong';
        res.innerHTML = '❌ Incorrect. ' + hint.join(' ');
      }
    };

    // ── Demo Mode ────────────────────────────────────────────
    window._psDemoMode = function () {
      if (demoMode) return;
      window._psReset();
      demoMode = true;
      document.getElementById('ps-demo-btn').textContent = '⏳ Demo running…';
      document.getElementById('ps-demo-btn').disabled = true;
      document.getElementById('ps-overlay').style.display = 'none';
      let step = 0;

      function runNext() {
        if (step >= STEPS.length) {
          demoMode = false;
          document.getElementById('ps-demo-btn').textContent = '▶ Auto Demo';
          document.getElementById('ps-demo-btn').disabled = false;
          return;
        }
        window._psDoStep(step);
        step++;
        demoTimer = setTimeout(runNext, 2500);
      }
      runNext();
    };

    // ── Reset ────────────────────────────────────────────────
    window._psReset = function () {
      if (demoTimer) clearTimeout(demoTimer);
      demoMode = false;
      currentStep = -1;
      completedSteps = [];
      obsSubmitted = false;
      bubbleParticles = [];
      canvasTime = 0;

      document.getElementById('ps-demo-btn').textContent = '▶ Auto Demo';
      document.getElementById('ps-demo-btn').disabled = false;
      document.getElementById('ps-overlay').style.display = 'flex';
      document.getElementById('ps-feedback').className = 'ps-feedback-banner hidden';
      document.getElementById('ps-step-desc-text').textContent = 'Perform each step in order. Start with Step 1.';
      document.getElementById('ps-obs-table-section').style.display = 'none';
      document.getElementById('ps-result-section').style.display = 'none';
      document.getElementById('ps-viva-btn').style.display = 'none';
      document.getElementById('ps-obs-result').className = 'ps-obs-result hidden';
      document.getElementById('obs-q1').value = '';
      document.getElementById('obs-q2').value = '';
      document.getElementById('ps-obs-submit').disabled = false;
      document.getElementById('obs-exposed').style.color = '';
      document.getElementById('obs-covered').style.color = '';
      updateStepUI();
    };

    // ── Hints ────────────────────────────────────────────────
    window._psToggleHints = function () {
      showHints = !showHints;
      STEPS.forEach((_, i) => {
        const el = document.getElementById(`ps-hint-${i}`);
        if (el) el.classList.toggle('hidden', !showHints);
      });
      document.getElementById('ps-hint-btn').classList.toggle('ps-hint-active', showHints);
    };

    // ── Viva Mode ────────────────────────────────────────────
    window._psOpenViva = function () {
      vivaMode = true;
      vivaIdx = 0;
      vivaScore = 0;
      answered = [];
      document.getElementById('ps-viva-overlay').classList.remove('hidden');
      renderVivaQuestion();
    };

    window._psCloseViva = function () {
      document.getElementById('ps-viva-overlay').classList.add('hidden');
      vivaMode = false;
    };

    function renderVivaQuestion() {
      const body = document.getElementById('ps-viva-body');
      document.getElementById('ps-viva-score').textContent = vivaScore;
      const pct = (vivaIdx / vivaQuestions.length) * 100;
      document.getElementById('ps-viva-pfill').style.width = pct + '%';

      if (vivaIdx >= vivaQuestions.length) {
        // Summary
        const pct = Math.round((vivaScore / vivaQuestions.length) * 100);
        const grade = pct >= 80 ? '🏆 Excellent!' : pct >= 60 ? '👍 Good!' : '📖 Keep Studying';
        body.innerHTML = `
          <div class="ps-viva-summary">
            <div class="ps-viva-grade">${grade}</div>
            <div class="ps-viva-final-score">${vivaScore} / ${vivaQuestions.length}</div>
            <div class="ps-viva-final-pct">${pct}% accuracy</div>
            <button class="ps-big-btn" style="margin-top:16px" onclick="window._psCloseViva()">Close Viva</button>
            <button class="ps-ctrl-btn" style="margin-top:8px;width:100%;justify-content:center" onclick="window._psOpenViva()">Retry</button>
          </div>
        `;
        return;
      }

      const q = vivaQuestions[vivaIdx];
      body.innerHTML = `
        <div class="ps-viva-q">
          <div class="ps-viva-qnum">Q${vivaIdx + 1} of ${vivaQuestions.length}</div>
          <div class="ps-viva-qtext">${q.q}</div>
          <div class="ps-viva-options">
            ${q.options.map((opt, i) => `
              <button class="ps-viva-opt" id="ps-vopt-${i}" onclick="window._psAnswerViva(${i})">${opt}</button>
            `).join('')}
          </div>
          <div class="ps-viva-exp hidden" id="ps-viva-exp"></div>
          <button class="ps-big-btn hidden" id="ps-viva-next" style="margin-top:12px" onclick="window._psNextViva()">Next →</button>
        </div>
      `;
    }

    window._psAnswerViva = function (chosen) {
      const q = vivaQuestions[vivaIdx];
      const correct = chosen === q.ans;
      if (correct) vivaScore++;
      document.getElementById('ps-viva-score').textContent = vivaScore;

      q.options.forEach((_, i) => {
        const btn = document.getElementById(`ps-vopt-${i}`);
        if (!btn) return;
        btn.disabled = true;
        if (i === q.ans) btn.classList.add('ps-vopt-correct');
        else if (i === chosen && !correct) btn.classList.add('ps-vopt-wrong');
      });

      const expEl = document.getElementById('ps-viva-exp');
      expEl.classList.remove('hidden');
      expEl.innerHTML = (correct ? '✅ ' : '❌ ') + q.exp;
      expEl.className = 'ps-viva-exp ' + (correct ? 'ps-exp-correct' : 'ps-exp-wrong');

      document.getElementById('ps-viva-next').classList.remove('hidden');
    };

    window._psNextViva = function () {
      vivaIdx++;
      renderVivaQuestion();
    };

    // ── Launch ───────────────────────────────────────────────
    updateStepUI();
    drawCanvas();

    // cleanup
    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
      if (demoTimer) clearTimeout(demoTimer);
      ['_psDoStep', '_psDemoMode', '_psReset', '_psToggleHints', '_psCheckObs',
        '_psOpenViva', '_psCloseViva', '_psAnswerViva', '_psNextViva'].forEach(fn => delete window[fn]);
    };
  };
})();
