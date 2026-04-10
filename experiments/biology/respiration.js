/* Respiration Lab */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['respiration_lab'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Respiration?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Respiration'], ans: 3, exp: 'The experiment focuses on the specific principles of Respiration.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Respiration experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let seedType = 'germinating'; // germinating or boiled
    let running = false, time = 0, co2Level = 0;
    let limeWaterOpacity = 0;
    let bubbles = [];
    let animFrame, canvas, ctx;
    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap"><canvas id="resp-canvas" width="800" height="400"></canvas></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">🫁</span> Controls</div>
            <div class="sim-btn-group" style="margin-bottom:12px;">
              <button class="sim-btn btn-primary" id="resp-germ" onclick="window._setRespSeeds('germinating')">🌱 Germinating Seeds</button>
              <button class="sim-btn" id="resp-boiled" onclick="window._setRespSeeds('boiled')">🫘 Boiled (Dead) Seeds</button>
            </div>
            <button class="sim-btn" style="width:100%;" id="resp-start" onclick="window._startRespiration()">▶ Start Experiment</button>
            <button class="sim-btn" style="width:100%;margin-top:6px;" onclick="window._resetRespiration()">↺ Reset</button>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(VIVA_QUESTIONS)">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Observations</div>
            <div class="sim-result-row"><span class="sim-result-label">Seed Type</span><span class="sim-result-value" id="resp-type" style="color:#22c55e">Germinating (Living)</span></div>
            <div class="sim-result-row"><span class="sim-result-label">CO₂ Released</span><span class="sim-result-value" id="resp-co2" style="color:#f59e0b">0%</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Lime Water</span><span class="sim-result-value" id="resp-lime" style="color:var(--text-secondary)">Clear</span></div>
            <div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid var(--border-glass);">
              <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;" id="resp-obs">Set up the experiment and press Start to observe CO₂ release from seeds.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    canvas = document.getElementById('resp-canvas');
    ctx = canvas.getContext('2d');
    window._setRespSeeds = (type) => {
      seedType = type; running = false; time = 0; co2Level = 0; limeWaterOpacity = 0; bubbles = [];
      document.getElementById('resp-germ').className = type === 'germinating' ? 'sim-btn btn-primary' : 'sim-btn';
      document.getElementById('resp-boiled').className = type === 'boiled' ? 'sim-btn btn-primary' : 'sim-btn';
      document.getElementById('resp-type').textContent = type === 'germinating' ? 'Germinating (Living)' : 'Boiled (Dead)';
      document.getElementById('resp-type').style.color = type === 'germinating' ? '#22c55e' : '#ef4444';
      document.getElementById('resp-co2').textContent = '0%';
      document.getElementById('resp-lime').textContent = 'Clear';
      document.getElementById('resp-obs').textContent = 'Set up the experiment and press Start.';
    };
    window._startRespiration = () => { running = true; };
    window._resetRespiration = () => {
      running = false; time = 0; co2Level = 0; limeWaterOpacity = 0; bubbles = [];
      document.getElementById('resp-co2').textContent = '0%';
      document.getElementById('resp-lime').textContent = 'Clear';
    };
    function draw() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      if (running && seedType === 'germinating') {
        time += 0.016;
        co2Level = Math.min(co2Level + 0.002, 1);
        limeWaterOpacity = Math.min(limeWaterOpacity + 0.0015, 0.8);
        if (Math.random() < 0.15) bubbles.push({ x: w * 0.58, y: h * 0.55, vx: 1.5, vy: (Math.random() - 0.5) * 0.5, opacity: 0.7, r: 2 + Math.random() * 2 });
        document.getElementById('resp-co2').textContent = (co2Level * 100).toFixed(0) + '%';
        document.getElementById('resp-lime').textContent = limeWaterOpacity > 0.3 ? 'Milky ✓' : 'Turning milky...';
        document.getElementById('resp-lime').style.color = limeWaterOpacity > 0.3 ? '#f59e0b' : 'var(--text-secondary)';
        if (co2Level > 0.5) document.getElementById('resp-obs').textContent = 'CO₂ from germinating seeds turns lime water milky, confirming that living cells respire and release CO₂.';
      } else if (running && seedType === 'boiled') {
        time += 0.016;
        document.getElementById('resp-obs').textContent = 'Boiled (dead) seeds do not respire. No CO₂ released. Lime water remains clear. This is the control experiment.';
      }
      // Update bubbles
      bubbles = bubbles.filter(b => { b.x += b.vx; b.y += b.vy; b.opacity -= 0.005; return b.opacity > 0; });
      // Flask with seeds
      const fx = w * 0.25, fy = h * 0.2, fW = 120, fH = 180;
      ctx.strokeStyle = 'rgba(148,163,184,0.5)';
      ctx.lineWidth = 2;
      // Flask body
      ctx.beginPath();
      ctx.moveTo(fx - 15, fy);
      ctx.lineTo(fx - fW / 2, fy + fH * 0.4);
      ctx.arc(fx, fy + fH, fW / 2, Math.PI, 0, true);
      ctx.lineTo(fx + 15, fy);
      ctx.stroke();
      // Seeds inside
      const seedColor = seedType === 'germinating' ? '#84cc16' : '#78716c';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(fx + (Math.random() - 0.5) * 40, fy + fH * 0.7 + (Math.random() - 0.5) * 30, 6, 0, Math.PI * 2);
        ctx.fillStyle = seedColor;
        ctx.fill();
      }
      // Delivery tube
      ctx.strokeStyle = 'rgba(148,163,184,0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fx + 15, fy);
      ctx.lineTo(fx + 15, fy - 20);
      ctx.lineTo(w * 0.55, fy - 20);
      ctx.lineTo(w * 0.55, h * 0.55);
      ctx.stroke();
      // Test tube with lime water
      const lx = w * 0.65, ly = h * 0.25, lW = 60, lH = 200;
      ctx.strokeStyle = 'rgba(148,163,184,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx - lW / 2, ly);
      ctx.lineTo(lx - lW / 2, ly + lH - 15);
      ctx.arc(lx, ly + lH - 15, lW / 2, Math.PI, 0, true);
      ctx.lineTo(lx + lW / 2, ly);
      ctx.stroke();
      // Lime water liquid
      const limeColor = `rgba(255, 255, 255, ${0.1 + limeWaterOpacity * 0.6})`;
      ctx.fillStyle = limeColor;
      ctx.beginPath();
      ctx.moveTo(lx - lW / 2 + 3, ly + lH * 0.3);
      ctx.lineTo(lx - lW / 2 + 3, ly + lH - 15);
      ctx.arc(lx, ly + lH - 15, lW / 2 - 3, Math.PI, 0, true);
      ctx.lineTo(lx + lW / 2 - 3, ly + lH * 0.3);
      ctx.closePath();
      ctx.fill();
      // Bubbles
      for (const b of bubbles) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${b.opacity * 0.4})`;
        ctx.fill();
      }
      // Labels
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(seedType === 'germinating' ? 'Germinating Seeds' : 'Boiled Seeds', fx, fy + fH + 30);
      ctx.fillText('Lime Water Ca(OH)₂', lx, ly + lH + 30);
      ctx.fillText('Delivery Tube', w * 0.42, fy - 30);
      ctx.textAlign = 'start';
      animFrame = requestAnimationFrame(draw);
    }
    draw();
    return function cleanup() { if (animFrame) cancelAnimationFrame(animFrame); delete window._setRespSeeds; delete window._startRespiration; delete window._resetRespiration; };
  };
})();
