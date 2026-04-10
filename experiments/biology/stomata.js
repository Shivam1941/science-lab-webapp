/* Stomata Exploration */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['microscopic_stomata'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Stomata?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Stomata'], ans: 3, exp: 'The experiment focuses on the specific principles of Stomata.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Stomata experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let zoom = 10, animFrame, canvas, ctx, time = 0;
    let selectedStoma = null;
    const parts = [
      { name:'Guard Cell', desc:'Two kidney-shaped cells that control the opening and closing of the stomatal pore. They swell with water (turgid) to open and shrink (flaccid) to close.', color:'#22c55e' },
      { name:'Stomatal Pore', desc:'The actual opening/hole between guard cells. Allows gas exchange (CO₂ in, O₂ out) and water vapour loss (transpiration).', color:'#06b6d4' },
      { name:'Epidermal Cells', desc:'Irregular interlocking cells that form the leaf surface. They do not contain chloroplasts (unlike guard cells).', color:'#94a3b8' },
      { name:'Chloroplasts (in Guard Cells)', desc:'Guard cells contain chloroplasts — one of the few epidermal cells that do. They photosynthesize to produce sugars that regulate osmotic pressure.', color:'#84cc16' },
    ];
    container.innerHTML = `
      <div class="sim-container">
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;">
          <div class="sim-canvas-wrap" style="position:relative;">
            <canvas id="stomata-canvas" width="600" height="500"></canvas>
            <div style="position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,0.5);padding:4px 10px;border-radius:6px;">
              <span style="font-size:11px;color:var(--text-muted);">Magnification: </span>
              <span style="font-size:12px;color:var(--text-primary);font-weight:600;" id="stomata-zoom">${zoom}x</span>
            </div>
          </div>
          <div>
            <div class="sim-controls" style="margin-bottom:12px;">
              <div class="sim-controls-title"><span class="ctrl-icon">🔬</span> Zoom</div>
              <div class="sim-control-row">
                <span class="sim-control-label">Magnification</span>
                <input type="range" class="sim-control-slider slider-biology" id="stomata-zoom-slider" min="4" max="40" step="1" value="${zoom}" />
                <span class="sim-control-value" id="stomata-zoom-val">${zoom}x</span>
              </div>
              <div class="sim-controls-title" style="margin-top:12px;"><span class="ctrl-icon">🍃</span> Parts</div>
              ${parts.map((p, i) => `
                <div id="stomata-p-${i}" onclick="window._selectStoma(${i})" style="padding:6px 10px;margin-bottom:3px;border-radius:6px;cursor:pointer;border:1px solid transparent;transition:all 0.2s;display:flex;align-items:center;gap:8px;">
                  <div style="width:8px;height:8px;border-radius:50%;background:${p.color};"></div>
                  <span style="font-size:12px;color:var(--text-secondary);">${p.name}</span>
                </div>
              `).join('')}
            </div>
            <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(VIVA_QUESTIONS)">🎓 Start Viva</button>

              <div class="sim-results-title"><span class="ctrl-icon">📋</span> Details</div>
              <p style="font-size:13px;color:var(--text-muted);" id="stomata-desc">Click a part to learn about stomatal structure.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    canvas = document.getElementById('stomata-canvas');
    ctx = canvas.getContext('2d');
    document.getElementById('stomata-zoom-slider').addEventListener('input', e => {
      zoom = parseInt(e.target.value);
      document.getElementById('stomata-zoom-val').textContent = zoom + 'x';
      document.getElementById('stomata-zoom').textContent = zoom + 'x';
    });
    window._selectStoma = (idx) => {
      selectedStoma = idx;
      parts.forEach((_, i) => {
        const el = document.getElementById(`stomata-p-${i}`);
        el.style.borderColor = i === idx ? parts[i].color : 'transparent';
        el.style.background = i === idx ? 'rgba(255,255,255,0.04)' : 'transparent';
      });
      document.getElementById('stomata-desc').innerHTML = `<strong style="color:${parts[idx].color}">${parts[idx].name}</strong><br/><span style="color:var(--text-secondary)">${parts[idx].desc}</span>`;
    };
    function drawStoma(cx, cy, scale) {
      const s = scale;
      // Guard cells (kidney shape)
      const highlight0 = selectedStoma === 0;
      ctx.fillStyle = highlight0 ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.25)';
      ctx.strokeStyle = highlight0 ? '#22c55e' : 'rgba(34,197,94,0.5)';
      ctx.lineWidth = highlight0 ? 3 : 1.5;
      // Left guard cell
      ctx.beginPath();
      ctx.ellipse(cx - s * 0.12, cy, s * 0.15, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // Right guard cell
      ctx.beginPath();
      ctx.ellipse(cx + s * 0.12, cy, s * 0.15, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // Stomatal pore (dark opening)
      const highlight1 = selectedStoma === 1;
      const poreOpen = 0.5 + Math.sin(time * 0.5) * 0.2;
      ctx.fillStyle = highlight1 ? 'rgba(6,182,212,0.4)' : '#0f172a';
      ctx.beginPath();
      ctx.ellipse(cx, cy, s * 0.04 * poreOpen, s * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      if (highlight1) { ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2; ctx.stroke(); }
      // Chloroplasts in guard cells
      const highlight3 = selectedStoma === 3;
      const chlColor = highlight3 ? 'rgba(132,204,22,0.7)' : 'rgba(132,204,22,0.3)';
      [[-0.12, -0.15], [-0.12, 0.15], [0.12, -0.15], [0.12, 0.15], [-0.12, 0], [0.12, 0]].forEach(([ox, oy]) => {
        ctx.beginPath();
        ctx.arc(cx + ox * s, cy + oy * s, s * 0.025, 0, Math.PI * 2);
        ctx.fillStyle = chlColor;
        ctx.fill();
      });
    }
    function draw() {
      const w = canvas.width, h = canvas.height;
      time += 0.02;
      ctx.clearRect(0, 0, w, h);
      // Microscope background
      ctx.fillStyle = '#f0fdf4';
      ctx.fillRect(0, 0, w, h);
      // Circular field of view
      ctx.save();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 220, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#f0fdf4';
      ctx.fillRect(0, 0, w, h);
      // Epidermal cell outlines (irregular)
      const highlight2 = selectedStoma === 2;
      ctx.strokeStyle = highlight2 ? 'rgba(148,163,184,0.8)' : 'rgba(148,163,184,0.3)';
      ctx.lineWidth = highlight2 ? 2 : 1;
      const cellSize = 250 / (zoom / 10);
      for (let x = -cellSize; x < w + cellSize; x += cellSize) {
        for (let y = -cellSize; y < h + cellSize; y += cellSize) {
          ctx.beginPath();
          ctx.roundRect(x + 5, y + 5, cellSize - 10, cellSize - 10, 8);
          ctx.stroke();
        }
      }
      // Draw stomata
      const stomataN = Math.max(1, Math.floor(zoom / 8));
      const spacing = 400 / stomataN;
      for (let i = 0; i < stomataN; i++) {
        for (let j = 0; j < stomataN; j++) {
          const sx = w / 2 + (i - stomataN / 2 + 0.5) * spacing;
          const sy = h / 2 + (j - stomataN / 2 + 0.5) * spacing;
          drawStoma(sx, sy, zoom * 4);
        }
      }
      ctx.restore();
      // Microscope ring
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 40;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 240, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 220, 0, Math.PI * 2);
      ctx.stroke();
      animFrame = requestAnimationFrame(draw);
    }
    draw();
    return function cleanup() { if (animFrame) cancelAnimationFrame(animFrame); delete window._selectStoma; };
  };
})();
