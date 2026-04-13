/* ============================================================
   OHM'S LAW — Interactive Circuit Simulation
   Canvas-based circuit with voltage/resistance sliders
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};

  window.experimentRenderers['ohms_law'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Ohms Law?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Ohms Law'], ans: 3, exp: 'The experiment focuses on the specific principles of Ohms Law.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Ohms Law experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let voltage = 5;
    let resistance = 10;
    let animFrame = null;
    let electronOffset = 0;
    let canvas, ctx;

    function getCurrent() { return resistance > 0 ? voltage / resistance : 0; }
    function getPower() { return voltage * getCurrent(); }

    // Build UI
    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap">
          <canvas id="ohms-canvas" width="800" height="450"></canvas>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">🎛️</span> Controls</div>
            <div class="sim-control-row">
              <span class="sim-control-label">Voltage (V)</span>
              <input type="range" class="sim-control-slider" id="ohm-voltage" min="0" max="24" step="0.5" value="${voltage}" />
              <span class="sim-control-value" id="ohm-voltage-val">${voltage.toFixed(1)} V</span>
            </div>
            <div class="sim-control-row">
              <span class="sim-control-label">Resistance (Ω)</span>
              <input type="range" class="sim-control-slider" id="ohm-resistance" min="1" max="100" step="1" value="${resistance}" />
              <span class="sim-control-value" id="ohm-resistance-val">${resistance} Ω</span>
            </div>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Results</div>
            <div class="sim-result-row">
              <span class="sim-result-label">Current (I)</span>
              <span class="sim-result-value" id="ohm-current" style="color:var(--physics-primary)">${getCurrent().toFixed(3)} A</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Power (P)</span>
              <span class="sim-result-value" id="ohm-power" style="color:#f59e0b">${getPower().toFixed(2)} W</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Formula</span>
              <span class="sim-result-value" style="color:var(--text-secondary);font-size:13px;">V = I × R</span>
            </div>
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('ohms-canvas');
    ctx = canvas.getContext('2d');

    // Slider events
    document.getElementById('ohm-voltage').addEventListener('input', e => {
      voltage = parseFloat(e.target.value);
      document.getElementById('ohm-voltage-val').textContent = voltage.toFixed(1) + ' V';
      updateResults();
    });
    document.getElementById('ohm-resistance').addEventListener('input', e => {
      resistance = parseFloat(e.target.value);
      document.getElementById('ohm-resistance-val').textContent = resistance + ' Ω';
      updateResults();
    });

    function updateResults() {
      document.getElementById('ohm-current').textContent = getCurrent().toFixed(3) + ' A';
      document.getElementById('ohm-power').textContent = getPower().toFixed(2) + ' W';
    }

    // Drawing
    function drawCircuit() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Circuit path
      const cx = w / 2, cy = h / 2;
      const rw = 280, rh = 140;
      const left = cx - rw, right = cx + rw, top = cy - rh, bottom = cy + rh;

      // Wires
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Top wire
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(right, top);
      ctx.stroke();

      // Right wire
      ctx.beginPath();
      ctx.moveTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.stroke();

      // Bottom wire
      ctx.beginPath();
      ctx.moveTo(right, bottom);
      ctx.lineTo(left, bottom);
      ctx.stroke();

      // Left wire
      ctx.beginPath();
      ctx.moveTo(left, bottom);
      ctx.lineTo(left, top);
      ctx.stroke();

      // Battery (left side)
      const batY = cy;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      // Long plate
      ctx.beginPath();
      ctx.moveTo(left - 2, batY - 25);
      ctx.lineTo(left - 2, batY + 25);
      ctx.stroke();
      // Short plate
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(left - 12, batY - 15);
      ctx.lineTo(left - 12, batY + 15);
      ctx.stroke();
      // + and - signs
      ctx.fillStyle = '#f59e0b';
      ctx.font = '14px Inter';
      ctx.fillText('+', left + 6, batY - 18);
      ctx.fillText('−', left + 6, batY + 26);
      // Voltage label
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 16px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillText(voltage.toFixed(1) + ' V', left - 50, batY + 5);
      ctx.textAlign = 'start';

      // Resistor (top, center)
      const resX = cx;
      const resY = top;
      const segments = 8;
      const segW = 12;
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(resX - segments * segW / 2, resY);
      for (let i = 0; i < segments; i++) {
        const x = resX - segments * segW / 2 + i * segW;
        ctx.lineTo(x + segW / 4, resY - 12);
        ctx.lineTo(x + segW * 3 / 4, resY + 12);
        ctx.lineTo(x + segW, resY);
      }
      ctx.stroke();
      // Label
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 15px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillText(resistance + ' Ω', resX, resY - 28);

      // Ammeter (bottom)
      ctx.beginPath();
      ctx.arc(cx, bottom, 22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 13px Inter';
      ctx.fillText('A', cx - 4, bottom + 5);
      ctx.font = '12px JetBrains Mono';
      ctx.fillStyle = '#93c5fd';
      ctx.fillText(getCurrent().toFixed(2) + 'A', cx - 20, bottom + 40);
      ctx.textAlign = 'start';

      // Electron flow animation
      if (voltage > 0 && resistance > 0) {
        const current = getCurrent();
        const speed = Math.min(current * 2, 8);
        electronOffset = (electronOffset + speed) % 40;

        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
        const path = [
          // Top: left to right
          ...Array.from({ length: 20 }, (_, i) => ({ x: left + (i / 20) * (right - left), y: top })),
          // Right: top to bottom
          ...Array.from({ length: 10 }, (_, i) => ({ x: right, y: top + (i / 10) * (bottom - top) })),
          // Bottom: right to left
          ...Array.from({ length: 20 }, (_, i) => ({ x: right - (i / 20) * (right - left), y: bottom })),
          // Left: bottom to top
          ...Array.from({ length: 10 }, (_, i) => ({ x: left, y: bottom - (i / 10) * (bottom - top) })),
        ];

        for (let i = 0; i < path.length; i++) {
          const phase = (i * 40 / path.length + electronOffset) % 40;
          if (phase < 6) {
            const alpha = 1 - phase / 6;
            ctx.globalAlpha = alpha * 0.9;
            ctx.beginPath();
            ctx.arc(path[i].x, path[i].y, 3 + current * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;

        // Glow around wires
        ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
        ctx.shadowBlur = current * 5;
      }
      ctx.shadowBlur = 0;

      // Labels
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Battery', left - 40, bottom + 20);
      ctx.fillText('Resistor', cx, top - 46);
      ctx.fillText('Ammeter', cx, bottom + 56);
      ctx.textAlign = 'start';
    }

    function animate() {
      drawCircuit();
      animFrame = requestAnimationFrame(animate);
    }
    animate();

    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  };
})();
