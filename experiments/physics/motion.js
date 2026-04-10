/* ============================================================
   MOTION SIMULATOR — Position, Velocity, Acceleration Graphs
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};

  window.experimentRenderers['motion_simulator'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Motion?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Motion'], ans: 3, exp: 'The experiment focuses on the specific principles of Motion.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Motion experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let initialVelocity = 5;    // m/s
    let acceleration = 2;       // m/s²
    let time = 0;
    let maxTime = 10;
    let running = false;
    let animFrame = null;
    let lastTimestamp = 0;

    function getPosition(t) { return initialVelocity * t + 0.5 * acceleration * t * t; }
    function getVelocity(t) { return initialVelocity + acceleration * t; }

    container.innerHTML = `
      <div class="sim-container">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
          <div class="sim-canvas-wrap" style="padding:12px;">
            <div style="color:var(--text-muted);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:600;">Position vs Time</div>
            <canvas id="motion-s-canvas" width="300" height="200"></canvas>
          </div>
          <div class="sim-canvas-wrap" style="padding:12px;">
            <div style="color:var(--text-muted);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:600;">Velocity vs Time</div>
            <canvas id="motion-v-canvas" width="300" height="200"></canvas>
          </div>
          <div class="sim-canvas-wrap" style="padding:12px;">
            <div style="color:var(--text-muted);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:600;">Acceleration vs Time</div>
            <canvas id="motion-a-canvas" width="300" height="200"></canvas>
          </div>
        </div>
        <div class="sim-canvas-wrap" style="padding:12px;">
          <div style="color:var(--text-muted);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:600;">Object Motion</div>
          <canvas id="motion-obj-canvas" width="900" height="100"></canvas>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">🎛️</span> Controls</div>
            <div class="sim-control-row">
              <span class="sim-control-label">Initial Velocity (m/s)</span>
              <input type="range" class="sim-control-slider" id="motion-v0" min="-10" max="20" step="0.5" value="${initialVelocity}" />
              <span class="sim-control-value" id="motion-v0-val">${initialVelocity} m/s</span>
            </div>
            <div class="sim-control-row">
              <span class="sim-control-label">Acceleration (m/s²)</span>
              <input type="range" class="sim-control-slider" id="motion-acc" min="-5" max="5" step="0.5" value="${acceleration}" />
              <span class="sim-control-value" id="motion-acc-val">${acceleration} m/s²</span>
            </div>
            <div class="sim-btn-group" style="margin-top:12px;">
              <button class="sim-btn btn-primary" id="motion-play">▶ Play</button>
              <button class="sim-btn" id="motion-reset">↺ Reset</button>
            </div>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(VIVA_QUESTIONS)">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Live Data (t = <span id="motion-time">0.0</span>s)</div>
            <div class="sim-result-row">
              <span class="sim-result-label">Position (s)</span>
              <span class="sim-result-value" id="motion-pos" style="color:#3b82f6">0.00 m</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Velocity (v)</span>
              <span class="sim-result-value" id="motion-vel" style="color:#22c55e">${initialVelocity.toFixed(1)} m/s</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Acceleration (a)</span>
              <span class="sim-result-value" id="motion-accel" style="color:#f59e0b">${acceleration.toFixed(1)} m/s²</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const sCanvas = document.getElementById('motion-s-canvas');
    const vCanvas = document.getElementById('motion-v-canvas');
    const aCanvas = document.getElementById('motion-a-canvas');
    const objCanvas = document.getElementById('motion-obj-canvas');

    document.getElementById('motion-v0').addEventListener('input', e => {
      initialVelocity = parseFloat(e.target.value);
      document.getElementById('motion-v0-val').textContent = initialVelocity + ' m/s';
      if (!running) drawAll();
    });
    document.getElementById('motion-acc').addEventListener('input', e => {
      acceleration = parseFloat(e.target.value);
      document.getElementById('motion-acc-val').textContent = acceleration + ' m/s²';
      if (!running) drawAll();
    });
    document.getElementById('motion-play').addEventListener('click', () => {
      running = !running;
      document.getElementById('motion-play').textContent = running ? '⏸ Pause' : '▶ Play';
      if (running) { lastTimestamp = performance.now(); animate(); }
    });
    document.getElementById('motion-reset').addEventListener('click', () => {
      time = 0;
      running = false;
      document.getElementById('motion-play').textContent = '▶ Play';
      drawAll();
    });

    function drawGraph(canvas, plotFn, color, yLabel, maxY) {
      const ctx = canvas.getContext('2d');
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * h / 5);
        ctx.lineTo(w, i * h / 5);
        ctx.stroke();
      }
      for (let i = 1; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(i * w / 10, 0);
        ctx.lineTo(i * w / 10, h);
        ctx.stroke();
      }

      // Calculate auto-scale
      let minV = 0, maxV = 0;
      for (let t = 0; t <= maxTime; t += 0.1) {
        const v = plotFn(t);
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
      }
      const range = Math.max(maxV - minV, 1);
      const padding = range * 0.1;
      minV -= padding;
      maxV += padding;

      // Plot
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let t = 0; t <= maxTime; t += 0.05) {
        const x = (t / maxTime) * w;
        const y = h - ((plotFn(t) - minV) / (maxV - minV)) * h;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Current point
      if (time > 0) {
        const px = (time / maxTime) * w;
        const py = h - ((plotFn(time) - minV) / (maxV - minV)) * h;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(')', ',0.2)').replace('rgb', 'rgba');
        ctx.fill();
      }
    }

    function drawObject() {
      const ctx = objCanvas.getContext('2d');
      const w = objCanvas.width, h = objCanvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
      ctx.fillRect(0, 0, w, h);

      // Track
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, h / 2);
      ctx.lineTo(w - 20, h / 2);
      ctx.stroke();

      // Calculate max position for scaling
      let maxPos = Math.abs(getPosition(maxTime));
      if (maxPos < 1) maxPos = 1;

      const pos = getPosition(time);
      const objX = 40 + ((pos / maxPos) * 0.8 + 0.1) * (w - 80);

      // Object circle
      const vel = getVelocity(time);
      const hue = vel >= 0 ? 210 : 0; // blue if forward, red if backward
      ctx.beginPath();
      ctx.arc(Math.max(30, Math.min(w - 30, objX)), h / 2, 16, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 80%, 55%, 0.9)`;
      ctx.fill();
      ctx.strokeStyle = `hsla(${hue}, 80%, 70%, 0.4)`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Velocity arrow
      if (Math.abs(vel) > 0.1) {
        const arrowLen = Math.min(Math.abs(vel) * 5, 80) * Math.sign(vel);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(objX, h / 2 - 25);
        ctx.lineTo(objX + arrowLen, h / 2 - 25);
        ctx.stroke();
        // arrowhead
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(objX + arrowLen, h / 2 - 25);
        ctx.lineTo(objX + arrowLen - Math.sign(vel) * 6, h / 2 - 30);
        ctx.lineTo(objX + arrowLen - Math.sign(vel) * 6, h / 2 - 20);
        ctx.closePath();
        ctx.fill();
      }
    }

    function drawAll() {
      drawGraph(sCanvas, getPosition, 'rgb(59, 130, 246)', 'Position', null);
      drawGraph(vCanvas, getVelocity, 'rgb(34, 197, 94)', 'Velocity', null);
      drawGraph(aCanvas, () => acceleration, 'rgb(245, 158, 11)', 'Acceleration', null);
      drawObject();

      document.getElementById('motion-time').textContent = time.toFixed(1);
      document.getElementById('motion-pos').textContent = getPosition(time).toFixed(2) + ' m';
      document.getElementById('motion-vel').textContent = getVelocity(time).toFixed(1) + ' m/s';
      document.getElementById('motion-accel').textContent = acceleration.toFixed(1) + ' m/s²';
    }

    function animate() {
      if (!running) return;
      const now = performance.now();
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;
      time += dt;
      if (time > maxTime) {
        time = maxTime;
        running = false;
        document.getElementById('motion-play').textContent = '▶ Play';
      }
      drawAll();
      if (running) animFrame = requestAnimationFrame(animate);
    }

    drawAll();

    return function cleanup() {
      running = false;
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  };
})();
