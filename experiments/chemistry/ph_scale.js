/* ============================================================
   pH SCALE — Digital pH Meter Simulation
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};

  window.experimentRenderers['ph_scale'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Ph Scale?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Ph Scale'], ans: 3, exp: 'The experiment focuses on the specific principles of Ph Scale.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Ph Scale experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    const solutions = [
      { name: 'Hydrochloric Acid (HCl)', ph: 1.0, color: '#ef4444' },
      { name: 'Lemon Juice', ph: 2.3, color: '#f97316' },
      { name: 'Vinegar', ph: 2.9, color: '#f59e0b' },
      { name: 'Orange Juice', ph: 3.5, color: '#eab308' },
      { name: 'Tomato Juice', ph: 4.2, color: '#eab308' },
      { name: 'Coffee', ph: 5.0, color: '#a3e635' },
      { name: 'Milk', ph: 6.5, color: '#84cc16' },
      { name: 'Distilled Water', ph: 7.0, color: '#22c55e' },
      { name: 'Blood', ph: 7.4, color: '#22c55e' },
      { name: 'Baking Soda', ph: 8.3, color: '#14b8a6' },
      { name: 'Toothpaste', ph: 9.0, color: '#06b6d4' },
      { name: 'Milk of Magnesia', ph: 10.5, color: '#3b82f6' },
      { name: 'Ammonia Solution', ph: 11.0, color: '#6366f1' },
      { name: 'Soap Solution', ph: 12.0, color: '#8b5cf6' },
      { name: 'Sodium Hydroxide (NaOH)', ph: 13.0, color: '#a855f7' },
    ];

    let selectedIdx = 7; // water
    let animatedPh = 7;
    let animFrame = null;

    function classify(ph) {
      if (ph < 7) return { label: 'Acidic', color: '#ef4444' };
      if (ph === 7) return { label: 'Neutral', color: '#22c55e' };
      return { label: 'Basic', color: '#6366f1' };
    }

    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap">
          <canvas id="ph-canvas" width="800" height="320"></canvas>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls" style="max-height:350px;overflow-y:auto;">
            <div class="sim-controls-title"><span class="ctrl-icon">🧫</span> Select Solution</div>
            <div id="ph-solution-list"></div>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> pH Reading</div>
            <div class="sim-result-row">
              <span class="sim-result-label">pH Value</span>
              <span class="sim-result-value" id="ph-value" style="font-size:24px;">7.0</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Nature</span>
              <span class="sim-result-value" id="ph-nature" style="color:#22c55e">Neutral</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Solution</span>
              <span class="sim-result-value" id="ph-name" style="color:var(--text-secondary);font-size:12px;">Distilled Water</span>
            </div>
            <div style="margin-top:16px;padding:12px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid var(--border-glass);">
              <p style="font-size:12px;color:var(--text-muted);line-height:1.5;">
                🔬 <strong>pH Scale:</strong> 0 (most acidic) → 7 (neutral) → 14 (most basic)<br/>
                H⁺ concentration decreases as pH increases.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Solution list
    const listEl = document.getElementById('ph-solution-list');
    listEl.innerHTML = solutions.map((s, i) => `
      <div class="ph-sol-item ${i === selectedIdx ? 'selected' : ''}" id="ph-sol-${i}" onclick="window._selectSolution(${i})" style="
        display:flex;align-items:center;gap:10px;padding:8px 12px;margin-bottom:4px;border-radius:8px;cursor:pointer;
        background:${i === selectedIdx ? 'rgba(255,255,255,0.06)' : 'transparent'};
        border:1px solid ${i === selectedIdx ? 'var(--border-glass-hover)' : 'transparent'};
        transition:all 0.2s;
      ">
        <div style="width:10px;height:10px;border-radius:50%;background:${s.color};flex-shrink:0;"></div>
        <span style="font-size:13px;color:var(--text-secondary);flex:1;">${s.name}</span>
        <span style="font-family:'JetBrains Mono';font-size:12px;color:${s.color};">${s.ph.toFixed(1)}</span>
      </div>
    `).join('');

    window._selectSolution = (idx) => {
      selectedIdx = idx;
      // Update list highlight
      document.querySelectorAll('[id^="ph-sol-"]').forEach((el, i) => {
        el.style.background = i === idx ? 'rgba(255,255,255,0.06)' : 'transparent';
        el.style.borderColor = i === idx ? 'var(--border-glass-hover)' : 'transparent';
      });
      // Update results
      const s = solutions[idx];
      const cl = classify(s.ph);
      document.getElementById('ph-name').textContent = s.name;
      document.getElementById('ph-nature').textContent = cl.label;
      document.getElementById('ph-nature').style.color = cl.color;
    };

    const phCanvas = document.getElementById('ph-canvas');
    const phCtx = phCanvas.getContext('2d');

    function drawPhScale() {
      const w = phCanvas.width, h = phCanvas.height;
      const target = solutions[selectedIdx].ph;

      // Smooth animation
      animatedPh += (target - animatedPh) * 0.08;

      phCtx.clearRect(0, 0, w, h);

      // Background
      phCtx.fillStyle = '#0f172a';
      phCtx.fillRect(0, 0, w, h);

      const barY = h * 0.45;
      const barH = 40;
      const barLeft = 60;
      const barRight = w - 60;
      const barW = barRight - barLeft;

      // pH gradient bar
      const barGrad = phCtx.createLinearGradient(barLeft, 0, barRight, 0);
      barGrad.addColorStop(0, '#ef4444');
      barGrad.addColorStop(0.15, '#f97316');
      barGrad.addColorStop(0.3, '#eab308');
      barGrad.addColorStop(0.43, '#84cc16');
      barGrad.addColorStop(0.5, '#22c55e');
      barGrad.addColorStop(0.6, '#14b8a6');
      barGrad.addColorStop(0.75, '#3b82f6');
      barGrad.addColorStop(0.9, '#8b5cf6');
      barGrad.addColorStop(1, '#a855f7');

      // Draw bar with rounded ends
      phCtx.beginPath();
      phCtx.roundRect(barLeft, barY, barW, barH, 8);
      phCtx.fillStyle = barGrad;
      phCtx.fill();

      // pH number labels
      phCtx.font = '12px JetBrains Mono';
      phCtx.textAlign = 'center';
      phCtx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let i = 0; i <= 14; i++) {
        const x = barLeft + (i / 14) * barW;
        phCtx.fillText(i.toString(), x, barY + barH + 20);
        // tick mark
        phCtx.strokeStyle = 'rgba(255,255,255,0.2)';
        phCtx.lineWidth = 1;
        phCtx.beginPath();
        phCtx.moveTo(x, barY + barH);
        phCtx.lineTo(x, barY + barH + 5);
        phCtx.stroke();
      }

      // Labels
      phCtx.font = '11px Inter';
      phCtx.fillStyle = '#ef4444';
      phCtx.textAlign = 'left';
      phCtx.fillText('ACIDIC', barLeft, barY - 12);
      phCtx.fillStyle = '#22c55e';
      phCtx.textAlign = 'center';
      phCtx.fillText('NEUTRAL', barLeft + barW / 2, barY - 12);
      phCtx.fillStyle = '#8b5cf6';
      phCtx.textAlign = 'right';
      phCtx.fillText('BASIC', barRight, barY - 12);

      // Indicator needle
      const needleX = barLeft + (animatedPh / 14) * barW;
      phCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      phCtx.lineWidth = 2;
      phCtx.beginPath();
      phCtx.moveTo(needleX, barY - 30);
      phCtx.lineTo(needleX, barY + barH + 30);
      phCtx.stroke();

      // Needle top indicator
      phCtx.beginPath();
      phCtx.moveTo(needleX, barY - 6);
      phCtx.lineTo(needleX - 8, barY - 24);
      phCtx.lineTo(needleX + 8, barY - 24);
      phCtx.closePath();
      phCtx.fillStyle = solutions[selectedIdx].color;
      phCtx.fill();

      // pH value display at top
      phCtx.font = 'bold 32px Space Grotesk';
      phCtx.fillStyle = solutions[selectedIdx].color;
      phCtx.textAlign = 'center';
      phCtx.fillText(animatedPh.toFixed(1), needleX, barY - 40);

      // Solution dots
      solutions.forEach((s, i) => {
        const sx = barLeft + (s.ph / 14) * barW;
        const alpha = i === selectedIdx ? 0.9 : 0.25;
        phCtx.beginPath();
        phCtx.arc(sx, barY + barH / 2, i === selectedIdx ? 8 : 4, 0, Math.PI * 2);
        phCtx.fillStyle = i === selectedIdx ? '#ffffff' : `rgba(255,255,255,${alpha})`;
        phCtx.fill();
      });

      // Update value
      document.getElementById('ph-value').textContent = animatedPh.toFixed(1);
      document.getElementById('ph-value').style.color = solutions[selectedIdx].color;

      phCtx.textAlign = 'start';

      animFrame = requestAnimationFrame(drawPhScale);
    }

    drawPhScale();

    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
      delete window._selectSolution;
    };
  };
})();
