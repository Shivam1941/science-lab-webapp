/* ============================================================
   SIMPLE PENDULUM — Animated Physics Simulation
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};

  window.experimentRenderers['simple_pendulum'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Pendulum?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Pendulum'], ans: 3, exp: 'The experiment focuses on the specific principles of Pendulum.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Pendulum experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let length = 1.0;    // meters
    let gravity = 9.81;  // m/s²
    let angle = 30;      // degrees initial
    let damping = 0.999;
    let theta, omega, running = true;
    let simSpeed = 1.0;
    let animFrame = null;
    let canvas, ctx;
    let trail = [];
    let lastTime = performance.now();

    function period() { return 2 * Math.PI * Math.sqrt(length / gravity); }

    theta = angle * Math.PI / 180;
    omega = 0;

    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap">
          <canvas id="pendulum-canvas" width="800" height="500"></canvas>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">🎛️</span> Controls</div>
            <div class="sim-control-row">
              <span class="sim-control-label">Length (m)</span>
              <input type="range" class="sim-control-slider" id="pend-length" min="0.2" max="3" step="0.1" value="${length}" />
              <span class="sim-control-value" id="pend-length-val">${length.toFixed(1)} m</span>
            </div>
            <div class="sim-control-row">
              <span class="sim-control-label">Gravity (m/s²)</span>
              <input type="range" class="sim-control-slider" id="pend-gravity" min="1" max="20" step="0.1" value="${gravity}" />
              <span class="sim-control-value" id="pend-gravity-val">${gravity.toFixed(1)}</span>
            </div>
            <div class="sim-control-row">
              <span class="sim-control-label">Initial Angle (°)</span>
              <input type="range" class="sim-control-slider" id="pend-angle" min="5" max="80" step="1" value="${angle}" />
              <span class="sim-control-value" id="pend-angle-val">${angle}°</span>
            </div>
            <div class="sim-btn-group" style="margin-top:12px;">
              <button class="sim-btn btn-primary" id="pend-reset">↺ Reset</button>
              <button class="sim-btn" id="pend-toggle">${running ? '⏸ Pause' : '▶ Play'}</button>
            </div>
            <div style="margin-top:16px;">
              <span class="sim-control-label" style="display:block;margin-bottom:8px;font-size:11px;">Simulation Speed</span>
              <div class="sim-btn-group" id="pend-speed-btns">
                <button class="sim-btn speed-btn" data-speed="0.25" style="padding:4px 8px;font-size:12px;">0.25x</button>
                <button class="sim-btn speed-btn" data-speed="0.5" style="padding:4px 8px;font-size:12px;">0.5x</button>
                <button class="sim-btn speed-btn" data-speed="0.75" style="padding:4px 8px;font-size:12px;">0.75x</button>
                <button class="sim-btn speed-btn" data-speed="1.0" style="padding:4px 8px;font-size:12px;background:rgba(59,130,246,0.2);color:#60a5fa;border-color:rgba(59,130,246,0.4);">1x</button>
              </div>
            </div>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Live Data</div>
            <div class="sim-result-row">
              <span class="sim-result-label">Period (T)</span>
              <span class="sim-result-value" id="pend-period" style="color:var(--physics-primary)">${period().toFixed(3)} s</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Current Angle</span>
              <span class="sim-result-value" id="pend-cur-angle" style="color:#a855f7">${angle.toFixed(1)}°</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Angular Velocity</span>
              <span class="sim-result-value" id="pend-omega" style="color:#22c55e">0.000 rad/s</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Formula</span>
              <span class="sim-result-value" style="color:var(--text-secondary);font-size:12px;">T = 2π√(L/g)</span>
            </div>
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('pendulum-canvas');
    ctx = canvas.getContext('2d');

    // Events
    document.getElementById('pend-length').addEventListener('input', e => {
      length = parseFloat(e.target.value);
      document.getElementById('pend-length-val').textContent = length.toFixed(1) + ' m';
      document.getElementById('pend-period').textContent = period().toFixed(3) + ' s';
    });
    document.getElementById('pend-gravity').addEventListener('input', e => {
      gravity = parseFloat(e.target.value);
      document.getElementById('pend-gravity-val').textContent = gravity.toFixed(1);
      document.getElementById('pend-period').textContent = period().toFixed(3) + ' s';
    });
    document.getElementById('pend-angle').addEventListener('input', e => {
      angle = parseInt(e.target.value);
      document.getElementById('pend-angle-val').textContent = angle + '°';
      theta = angle * Math.PI / 180;
      omega = 0;
      trail = [];
    });
    document.getElementById('pend-reset').addEventListener('click', () => {
      theta = angle * Math.PI / 180;
      omega = 0;
      trail = [];
      running = true;
      document.getElementById('pend-toggle').textContent = '⏸ Pause';
    });
    document.getElementById('pend-toggle').addEventListener('click', () => {
      running = !running;
      document.getElementById('pend-toggle').textContent = running ? '⏸ Pause' : '▶ Play';
    });

    const speedBtns = document.querySelectorAll('#pend-speed-btns .speed-btn');
    speedBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        simSpeed = parseFloat(e.target.dataset.speed);
        speedBtns.forEach(b => {
          b.style.background = '';
          b.style.color = '';
          b.style.borderColor = '';
        });
        e.target.style.background = 'rgba(59,130,246,0.2)';
        e.target.style.color = '#60a5fa';
        e.target.style.borderColor = 'rgba(59,130,246,0.4)';
      });
    });

    function draw() {
      const w = canvas.width, h = canvas.height;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Physics update
      if (running) {
        const alpha = -(gravity / (length * 100)) * Math.sin(theta);
        omega += alpha * simSpeed;
        omega *= Math.pow(damping, simSpeed);
        theta += omega * simSpeed;
      }

      ctx.clearRect(0, 0, w, h);

      // Background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const pivotX = w / 2;
      const pivotY = 80;
      const rodLen = 60 + length * 120;
      const bobX = pivotX + Math.sin(theta) * rodLen;
      const bobY = pivotY + Math.cos(theta) * rodLen;
      const bobRadius = 18;

      // Trail
      trail.push({ x: bobX, y: bobY });
      if (trail.length > 80) trail.shift();
      for (let i = 0; i < trail.length - 1; i++) {
        const alpha = (i / trail.length) * 0.4;
        ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(trail[i].x, trail[i].y);
        ctx.lineTo(trail[i + 1].x, trail[i + 1].y);
        ctx.stroke();
      }

      // Pivot support
      ctx.fillStyle = '#475569';
      ctx.fillRect(pivotX - 60, pivotY - 12, 120, 12);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Rod
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Bob
      const bobGrad = ctx.createRadialGradient(bobX - 4, bobY - 4, 2, bobX, bobY, bobRadius);
      bobGrad.addColorStop(0, '#60a5fa');
      bobGrad.addColorStop(0.5, '#3b82f6');
      bobGrad.addColorStop(1, '#1d4ed8');
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.fillStyle = bobGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Bob glow
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.fill();

      // Angle arc
      if (Math.abs(theta) > 0.01) {
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const arcR = 50;
        const startAngle = Math.PI / 2 - Math.abs(theta);
        const endAngle = Math.PI / 2;
        if (theta > 0) {
          ctx.arc(pivotX, pivotY, arcR, Math.PI / 2 - theta, Math.PI / 2);
        } else {
          ctx.arc(pivotX, pivotY, arcR, Math.PI / 2, Math.PI / 2 - theta);
        }
        ctx.stroke();
      }

      // Update values
      document.getElementById('pend-cur-angle').textContent = (theta * 180 / Math.PI).toFixed(1) + '°';
      document.getElementById('pend-omega').textContent = omega.toFixed(3) + ' rad/s';

      // Info text
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`L = ${length.toFixed(1)} m  |  g = ${gravity.toFixed(1)} m/s²  |  T = ${period().toFixed(3)} s`, w / 2, h - 16);
      ctx.textAlign = 'start';

      animFrame = requestAnimationFrame(draw);
    }
    draw();

    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  };
})();
