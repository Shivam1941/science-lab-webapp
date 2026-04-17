/* ============================================================
   Work, Energy & Conservation — Roller-Coaster Simulation
   PE ↔ KE conversion with real-time graph
   ============================================================ */
(function () {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['energy_conservation'] = function (container, exp) {

    const VIVA = [
      { q: 'What is kinetic energy?', opts: ['Energy due to position', 'Energy due to motion', 'Energy stored in a spring', 'Thermal energy'], ans: 1, exp: 'Kinetic energy is the energy a body possesses due to its motion. KE = ½mv².' },
      { q: 'What is potential energy?', opts: ['Energy due to motion', 'Energy stored due to position or height', 'Energy from the sun', 'Chemical energy'], ans: 1, exp: 'Gravitational potential energy is the energy stored in an object due to its height above a reference. PE = mgh.' },
      { q: 'State the law of conservation of energy.', opts: ['Energy can be created', 'Energy can be destroyed', 'Energy can neither be created nor destroyed, only transformed', 'Energy always increases'], ans: 2, exp: 'The total energy of an isolated system remains constant. Energy transforms from one form to another but is never lost.' },
      { q: 'At which point of a roller coaster is KE maximum?', opts: ['Highest point', 'Lowest point', 'Middle point', 'It is always the same'], ans: 1, exp: 'KE is maximum at the lowest point because the object has maximum velocity there (all PE has converted to KE).' },
      { q: 'What does friction do to mechanical energy?', opts: ['Increases it', 'Keeps it constant', 'Converts some to heat, reducing it', 'Has no effect'], ans: 2, exp: 'Friction converts mechanical energy into heat, so the total mechanical energy (PE + KE) decreases over time.' }
    ];

    const G = 9.81;       // gravity (m/s²)

    /* ── State ────────────────────────────────────────────────── */
    let mass = 2;         // kg
    let friction = 0;     // coefficient (0 = none)
    let running = false;
    let alive = true;
    let time = 0;

    // Track control points (normalised 0–1 in x, 0–1 in y where 0=top)
    let controlPts = [
      { x: 0.05, y: 0.15 },  // start — high
      { x: 0.2,  y: 0.75 },  // dip
      { x: 0.35, y: 0.3  },  // hill
      { x: 0.5,  y: 0.8  },  // valley
      { x: 0.65, y: 0.25 },  // hill
      { x: 0.8,  y: 0.7  },  // dip
      { x: 0.95, y: 0.5  }   // end
    ];
    let draggingPt = -1;

    // Ball state
    let ballT = 0;        // parameter along track (0–1)
    let ballSpeed = 0;    // speed along track (≥0, direction handled separately)
    let ballDir = 1;      // +1 forward, -1 backward

    // Graph data
    const graphData = { pe: [], ke: [], te: [], t: [] };
    const MAX_GRAPH = 300;

    /* ── HTML ─────────────────────────────────────────────────── */
    container.innerHTML = `
      <div style="display:flex; gap:0; height:580px; border-radius:14px; overflow:hidden; border:1px solid var(--border-glass); background:#06080d;">
        <!-- Canvas area -->
        <div style="flex:1; position:relative; min-width:0; display:flex; flex-direction:column;">
          <canvas id="ec-canvas" style="flex:1; width:100%; display:block; cursor:grab;"></canvas>
          <!-- Energy bars overlay -->
          <div style="position:absolute; top:12px; left:12px; display:flex; gap:8px; align-items:flex-end; height:100px;">
            <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
              <div style="font-size:9px; color:#22c55e; font-weight:700;">PE</div>
              <div style="width:22px; background:rgba(0,0,0,0.5); border:1px solid rgba(34,197,94,0.3); border-radius:4px; height:80px; display:flex; flex-direction:column-reverse; overflow:hidden;">
                <div id="ec-bar-pe" style="width:100%; background:linear-gradient(to top,#22c55e,#16a34a); transition:height 0.1s;"></div>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
              <div style="font-size:9px; color:#ef4444; font-weight:700;">KE</div>
              <div style="width:22px; background:rgba(0,0,0,0.5); border:1px solid rgba(239,68,68,0.3); border-radius:4px; height:80px; display:flex; flex-direction:column-reverse; overflow:hidden;">
                <div id="ec-bar-ke" style="width:100%; background:linear-gradient(to top,#ef4444,#dc2626); transition:height 0.1s;"></div>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
              <div style="font-size:9px; color:#f59e0b; font-weight:700;">TE</div>
              <div style="width:22px; background:rgba(0,0,0,0.5); border:1px solid rgba(245,158,11,0.3); border-radius:4px; height:80px; display:flex; flex-direction:column-reverse; overflow:hidden;">
                <div id="ec-bar-te" style="width:100%; background:linear-gradient(to top,#f59e0b,#d97706); transition:height 0.1s;"></div>
              </div>
            </div>
          </div>
          <!-- Values overlay -->
          <div style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.6); border:1px solid var(--border-glass); border-radius:8px; padding:8px 12px; font-family:'JetBrains Mono',monospace; font-size:11px; line-height:1.7;">
            <div>PE = <span id="ec-val-pe" style="color:#22c55e;">0</span> J</div>
            <div>KE = <span id="ec-val-ke" style="color:#ef4444;">0</span> J</div>
            <div>TE = <span id="ec-val-te" style="color:#f59e0b;">0</span> J</div>
            <div>v  = <span id="ec-val-v" style="color:#3b82f6;">0</span> m/s</div>
            <div>h  = <span id="ec-val-h" style="color:#a855f7;">0</span> m</div>
          </div>
          <!-- Graph -->
          <canvas id="ec-graph" style="width:100%; height:140px; display:block; border-top:1px solid var(--border-glass); background:rgba(0,0,0,0.3);"></canvas>
        </div>

        <!-- Controls -->
        <div style="width:290px; flex-shrink:0; display:flex; flex-direction:column; background:rgba(12,16,24,0.9); border-left:1px solid var(--border-glass); overflow-y:auto;">
          <div style="padding:16px 18px; border-bottom:1px solid var(--border-glass);">
            <div style="font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:700; color:#fff;">⚡ Energy Conservation</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">PE ↔ KE Interconversion</div>
          </div>
          <div style="padding:14px 18px; display:flex; flex-direction:column; gap:10px; flex:1;">

            <!-- Mass -->
            <div>
              <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-bottom:4px;"><span>Mass</span><span id="ec-mass-val">2.0 kg</span></div>
              <input type="range" min="0.5" max="10" step="0.5" value="2" id="ec-mass" style="width:100%; accent-color:#eab308;">
            </div>

            <!-- Friction -->
            <div class="ec-tgl-row"><span>🧊 Friction</span><label class="ec-sw"><input type="checkbox" id="ec-friction"><span class="ec-sl"></span></label></div>
            <div id="ec-fric-panel" style="display:none;">
              <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-bottom:4px;"><span>Coefficient</span><span id="ec-fric-val">0.05</span></div>
              <input type="range" min="0.01" max="0.2" step="0.01" value="0.05" id="ec-fric-slider" style="width:100%; accent-color:#ef4444;">
            </div>

            <div style="border-top:1px solid var(--border-glass); margin:2px 0;"></div>

            <!-- Play / Pause / Reset -->
            <div style="display:flex; gap:6px;">
              <button class="sim-btn btn-primary" id="ec-play-btn" style="flex:1; font-size:12px; padding:8px;" onclick="window._ecToggle()">▶ Release Ball</button>
              <button class="sim-btn" style="flex:1; font-size:12px; padding:8px;" onclick="window._ecReset()">↺ Reset</button>
            </div>

            <div style="font-size:10px; color:var(--text-muted); text-align:center; margin-top:-4px;">Drag track points to reshape the track</div>

            <div style="border-top:1px solid var(--border-glass); margin:2px 0;"></div>

            <!-- Preset tracks -->
            <div style="font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Track Presets</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
              <button class="sim-btn" style="font-size:10px; padding:6px;" onclick="window._ecPreset('hills')">🏔️ Hills</button>
              <button class="sim-btn" style="font-size:10px; padding:6px;" onclick="window._ecPreset('valley')">🏜️ Valley</button>
              <button class="sim-btn" style="font-size:10px; padding:6px;" onclick="window._ecPreset('slide')">📐 Slide</button>
              <button class="sim-btn" style="font-size:10px; padding:6px;" onclick="window._ecPreset('loop')">🎢 Roller</button>
            </div>

            <div style="border-top:1px solid var(--border-glass); margin:2px 0;"></div>

            <!-- Info -->
            <div style="padding:10px; background:rgba(234,179,8,0.06); border:1px solid rgba(234,179,8,0.15); border-radius:8px;">
              <div style="font-size:12px; font-weight:700; color:#eab308; margin-bottom:4px;">📐 Key Formulae</div>
              <div style="font-size:11px; color:var(--text-secondary); line-height:1.6; font-family:'JetBrains Mono',monospace;">
                PE = mgh<br>KE = ½mv²<br>TE = PE + KE<br>
                <span style="color:var(--text-muted);">Without friction: TE = const</span>
              </div>
            </div>

            <!-- Observations -->
            <div style="font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Observations</div>
            <div style="font-size:11px; color:var(--text-secondary); line-height:1.5;" id="ec-obs">Release the ball to begin observing energy conversion.</div>

            <div style="margin-top:auto; display:flex; gap:8px;">
              <button class="sim-btn sim-btn-primary" style="flex:1;font-size:12px;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Viva</button>
            </div>
          </div>
        </div>
      </div>
      <style>
        .ec-tgl-row { display:flex; align-items:center; justify-content:space-between; font-size:13px; color:#ddd; }
        .ec-sw { position:relative; width:40px; height:22px; flex-shrink:0; }
        .ec-sw input { opacity:0; width:0; height:0; }
        .ec-sl { position:absolute; inset:0; background:rgba(255,255,255,0.1); border-radius:22px; cursor:pointer; transition:0.3s; }
        .ec-sl::before { content:''; position:absolute; width:16px; height:16px; left:3px; bottom:3px; background:#888; border-radius:50%; transition:0.3s; }
        .ec-sw input:checked + .ec-sl { background:rgba(239,68,68,0.45); }
        .ec-sw input:checked + .ec-sl::before { transform:translateX(18px); background:#ef4444; }
      </style>
    `;

    /* ── Canvases ─────────────────────────────────────────────── */
    const canvas = document.getElementById('ec-canvas');
    const ctx = canvas.getContext('2d');
    const gCanvas = document.getElementById('ec-graph');
    const gCtx = gCanvas.getContext('2d');

    function resize() {
      let r = canvas.parentElement.getBoundingClientRect();
      // Main canvas takes flex:1 area minus graph height
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gCanvas.width = gCanvas.clientWidth;
      gCanvas.height = gCanvas.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* ── Track Interpolation ──────────────────────────────────── */
    // Catmull-Rom spline interpolation for smooth track
    function catmullRom(p0, p1, p2, p3, t) {
      const t2 = t * t, t3 = t2 * t;
      return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
      );
    }

    // Returns {x, y} in canvas coords for parameter t ∈ [0, 1]
    function getTrackPoint(t) {
      const pts = controlPts;
      const n = pts.length - 1;
      const seg = Math.min(Math.floor(t * n), n - 1);
      const lt = (t * n) - seg;

      const i0 = Math.max(seg - 1, 0);
      const i1 = seg;
      const i2 = Math.min(seg + 1, n);
      const i3 = Math.min(seg + 2, n);

      const px = catmullRom(pts[i0].x, pts[i1].x, pts[i2].x, pts[i3].x, lt);
      const py = catmullRom(pts[i0].y, pts[i1].y, pts[i2].y, pts[i3].y, lt);

      return {
        x: px * canvas.width,
        y: py * canvas.height
      };
    }

    // Height in "meters" (canvas bottom = 0, top = max)
    function getHeight(t) {
      const pt = getTrackPoint(t);
      const hPixels = canvas.height - pt.y;
      return hPixels * 0.05; // scale: 1 pixel = 0.05 m
    }

    // Track tangent for slope angle
    function getTrackTangent(t) {
      const dt = 0.001;
      const p1 = getTrackPoint(Math.max(t - dt, 0));
      const p2 = getTrackPoint(Math.min(t + dt, 1));
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      return { dx: dx / len, dy: dy / len, len };
    }

    /* ── Physics ──────────────────────────────────────────────── */
    let totalEnergy = 0;
    let energyLost = 0;

    function initPhysics() {
      ballT = 0;
      ballSpeed = 0;
      ballDir = 1;
      time = 0;
      energyLost = 0;
      const h0 = getHeight(0);
      totalEnergy = mass * G * h0;
      graphData.pe.length = 0;
      graphData.ke.length = 0;
      graphData.te.length = 0;
      graphData.t.length = 0;
    }
    initPhysics();

    function stepPhysics(dt) {
      if (!running) return;
      time += dt;

      const h = getHeight(ballT);
      const pe = mass * G * h;

      // Available kinetic energy
      let keAvailable = totalEnergy - energyLost - pe;
      if (keAvailable < 0) {
        // Ball can't reach this height — reverse direction
        keAvailable = 0;
        ballDir = -ballDir;
      }

      const v = Math.sqrt(2 * keAvailable / mass);
      ballSpeed = v;

      // Move along track
      const tangent = getTrackTangent(ballT);
      const arcLen = tangent.len;
      // dt in track parameter ≈ v * dt / (arc length per unit t)
      const pixelsPerT = canvas.width * 0.9; // approximate
      const dT = (v / 0.05) * dt / pixelsPerT * ballDir; // convert m/s to pixels/s

      ballT += dT;

      // Friction energy loss
      if (friction > 0) {
        const distMoved = Math.abs(dT) * pixelsPerT * 0.05; // meters
        energyLost += friction * mass * G * distMoved;
      }

      // Boundaries
      if (ballT <= 0) { ballT = 0.001; ballDir = 1; }
      if (ballT >= 1) { ballT = 0.999; ballDir = -1; }

      // Record graph data
      const ke = 0.5 * mass * v * v;
      const te = pe + ke;
      graphData.pe.push(pe);
      graphData.ke.push(ke);
      graphData.te.push(te);
      graphData.t.push(time);
      if (graphData.pe.length > MAX_GRAPH) {
        graphData.pe.shift();
        graphData.ke.shift();
        graphData.te.shift();
        graphData.t.shift();
      }

      // Update energy bars
      const maxE = totalEnergy || 1;
      document.getElementById('ec-bar-pe').style.height = (pe / maxE * 100) + '%';
      document.getElementById('ec-bar-ke').style.height = (ke / maxE * 100) + '%';
      document.getElementById('ec-bar-te').style.height = (te / maxE * 100) + '%';

      // Update values
      document.getElementById('ec-val-pe').textContent = pe.toFixed(1);
      document.getElementById('ec-val-ke').textContent = ke.toFixed(1);
      document.getElementById('ec-val-te').textContent = te.toFixed(1);
      document.getElementById('ec-val-v').textContent = v.toFixed(2);
      document.getElementById('ec-val-h').textContent = h.toFixed(2);
    }

    /* ── Drawing ──────────────────────────────────────────────── */
    function draw() {
      if (!alive) return;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      stepPhysics(1 / 60);

      // Draw track
      drawTrack(w, h);

      // Draw ball
      drawBall();

      // Draw control points
      drawControlPoints();

      // Draw graph
      drawGraph();

      // Observations
      updateObs();

      requestAnimationFrame(draw);
    }

    function drawTrack(w, h) {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.005) {
        const pt = getTrackPoint(t);
        if (t === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Track fill (gradient below)
      ctx.strokeStyle = 'transparent';
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.005) {
        const pt = getTrackPoint(t);
        if (t === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.lineTo(getTrackPoint(1).x, h);
      ctx.lineTo(getTrackPoint(0).x, h);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(234,179,8,0.08)');
      grad.addColorStop(1, 'rgba(234,179,8,0.02)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Height reference lines
      ctx.setLineDash([3, 6]);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const y = h * i / 5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    function drawBall() {
      const pt = getTrackPoint(ballT);
      const r = 10 + mass;

      // Glow based on KE
      const h = getHeight(ballT);
      const pe = mass * G * h;
      const ke = Math.max(totalEnergy - energyLost - pe, 0);
      const keNorm = ke / (totalEnergy || 1);

      if (keNorm > 0.05) {
        const glow = ctx.createRadialGradient(pt.x, pt.y, r * 0.3, pt.x, pt.y, r * 3);
        glow.addColorStop(0, `rgba(239,68,68,${keNorm * 0.4})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ball body — color transitions from green (high PE) to red (high KE)
      const rC = Math.floor(60 + keNorm * 195);
      const gC = Math.floor(180 - keNorm * 130);
      const bC = Math.floor(80 - keNorm * 50);
      ctx.fillStyle = `rgb(${rC},${gC},${bC})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Velocity arrow
      if (running && ballSpeed > 0.5) {
        const tang = getTrackTangent(ballT);
        const arrowLen = Math.min(ballSpeed * 3, 40) * ballDir;
        ctx.strokeStyle = 'rgba(59,130,246,0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x + tang.dx * arrowLen, pt.y + tang.dy * arrowLen);
        ctx.stroke();
        // Arrowhead
        const ax = pt.x + tang.dx * arrowLen;
        const ay = pt.y + tang.dy * arrowLen;
        ctx.fillStyle = 'rgba(59,130,246,0.8)';
        ctx.beginPath();
        ctx.arc(ax, ay, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Height line
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = 'rgba(168,85,247,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(pt.x, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // h label
      ctx.fillStyle = 'rgba(168,85,247,0.6)';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('h=' + getHeight(ballT).toFixed(1) + 'm', pt.x, canvas.height - 6);
    }

    function drawControlPoints() {
      controlPts.forEach((p, i) => {
        const px = p.x * canvas.width;
        const py = p.y * canvas.height;

        ctx.fillStyle = draggingPt === i ? '#eab308' : 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    /* ── Graph ────────────────────────────────────────────────── */
    function drawGraph() {
      const w = gCanvas.width, h = gCanvas.height;
      gCtx.clearRect(0, 0, w, h);

      // Background
      gCtx.fillStyle = 'rgba(6,8,13,0.8)';
      gCtx.fillRect(0, 0, w, h);

      // Labels
      gCtx.fillStyle = 'rgba(255,255,255,0.3)';
      gCtx.font = '10px Inter';
      gCtx.textAlign = 'left';
      gCtx.fillText('Energy vs Time', 8, 14);

      // Legend
      gCtx.fillStyle = '#22c55e'; gCtx.fillRect(w - 150, 6, 10, 3);
      gCtx.fillStyle = '#aaa'; gCtx.font = '9px Inter'; gCtx.fillText('PE', w - 136, 11);
      gCtx.fillStyle = '#ef4444'; gCtx.fillRect(w - 110, 6, 10, 3);
      gCtx.fillStyle = '#aaa'; gCtx.fillText('KE', w - 96, 11);
      gCtx.fillStyle = '#f59e0b'; gCtx.fillRect(w - 70, 6, 10, 3);
      gCtx.fillStyle = '#aaa'; gCtx.fillText('TE', w - 56, 11);

      if (graphData.pe.length < 2) return;

      const maxE = (totalEnergy || 1) * 1.2;
      const pad = 25;
      const gw = w - pad * 2;
      const gh = h - pad - 10;
      const n = graphData.pe.length;

      function plotLine(data, color) {
        gCtx.strokeStyle = color;
        gCtx.lineWidth = 1.5;
        gCtx.beginPath();
        for (let i = 0; i < n; i++) {
          const px = pad + (i / (MAX_GRAPH - 1)) * gw;
          const py = pad + (1 - data[i] / maxE) * gh;
          if (i === 0) gCtx.moveTo(px, py);
          else gCtx.lineTo(px, py);
        }
        gCtx.stroke();
      }

      plotLine(graphData.pe, '#22c55e');
      plotLine(graphData.ke, '#ef4444');
      plotLine(graphData.te, '#f59e0b');

      // Axes
      gCtx.strokeStyle = 'rgba(255,255,255,0.1)';
      gCtx.lineWidth = 1;
      gCtx.beginPath();
      gCtx.moveTo(pad, pad);
      gCtx.lineTo(pad, pad + gh);
      gCtx.lineTo(pad + gw, pad + gh);
      gCtx.stroke();
    }

    /* ── Drag Control Points ──────────────────────────────────── */
    canvas.addEventListener('mousedown', (e) => {
      if (running) return;
      const r = canvas.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width;
      const my = (e.clientY - r.top) / r.height;

      for (let i = 0; i < controlPts.length; i++) {
        const dx = controlPts[i].x - mx;
        const dy = controlPts[i].y - my;
        if (Math.hypot(dx, dy) < 0.03) {
          draggingPt = i;
          canvas.style.cursor = 'grabbing';
          break;
        }
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (draggingPt < 0) return;
      const r = canvas.getBoundingClientRect();
      const mx = Math.max(0.03, Math.min((e.clientX - r.left) / r.width, 0.97));
      const my = Math.max(0.05, Math.min((e.clientY - r.top) / r.height, 0.92));
      controlPts[draggingPt].x = mx;
      controlPts[draggingPt].y = my;
      // Keep x ordering
      controlPts.sort((a, b) => a.x - b.x);
      initPhysics();
    });

    canvas.addEventListener('mouseup', () => {
      draggingPt = -1;
      canvas.style.cursor = 'grab';
    });
    canvas.addEventListener('mouseleave', () => {
      draggingPt = -1;
      canvas.style.cursor = 'grab';
    });

    /* ── Observations ─────────────────────────────────────────── */
    function updateObs() {
      if (!running && time === 0) return;
      const h = getHeight(ballT);
      const pe = mass * G * h;
      const ke = Math.max(totalEnergy - energyLost - pe, 0);
      const v = Math.sqrt(2 * ke / mass);
      const te = pe + ke;

      const el = document.getElementById('ec-obs');
      el.innerHTML = `At current position:<br>
        Height = <b style="color:#a855f7">${h.toFixed(2)} m</b>,
        Velocity = <b style="color:#3b82f6">${v.toFixed(2)} m/s</b><br>
        PE = <b style="color:#22c55e">${pe.toFixed(1)} J</b>,
        KE = <b style="color:#ef4444">${ke.toFixed(1)} J</b><br>
        Total = <b style="color:#f59e0b">${te.toFixed(1)} J</b>
        ${friction > 0 ? '<br>Energy lost to friction: <b style="color:#ef4444">' + energyLost.toFixed(1) + ' J</b>' : ''}
        <br><span style="color:var(--text-muted);">${friction > 0 ? 'TE decreasing — energy lost as heat.' : 'TE constant — energy is conserved! ✓'}</span>`;
    }

    /* ── Controls ─────────────────────────────────────────────── */
    window._ecToggle = () => {
      running = !running;
      if (running && time === 0) initPhysics();
      const btn = document.getElementById('ec-play-btn');
      btn.textContent = running ? '⏸ Pause' : '▶ Resume';
      if (!running && time === 0) btn.textContent = '▶ Release Ball';
    };

    window._ecReset = () => {
      running = false;
      initPhysics();
      document.getElementById('ec-play-btn').textContent = '▶ Release Ball';
      document.getElementById('ec-obs').textContent = 'Release the ball to begin observing energy conversion.';
      ['ec-val-pe', 'ec-val-ke', 'ec-val-te', 'ec-val-v', 'ec-val-h'].forEach(id => {
        document.getElementById(id).textContent = '0';
      });
      ['ec-bar-pe', 'ec-bar-ke', 'ec-bar-te'].forEach(id => {
        document.getElementById(id).style.height = '0%';
      });
    };

    const presets = {
      hills:  [{ x:0.05,y:0.15 },{ x:0.2,y:0.75 },{ x:0.35,y:0.2 },{ x:0.5,y:0.7 },{ x:0.65,y:0.2 },{ x:0.8,y:0.65 },{ x:0.95,y:0.3 }],
      valley: [{ x:0.05,y:0.2  },{ x:0.25,y:0.8 },{ x:0.5,y:0.85 },{ x:0.75,y:0.8 },{ x:0.95,y:0.2 }],
      slide:  [{ x:0.05,y:0.1  },{ x:0.3,y:0.15 },{ x:0.5,y:0.5 },{ x:0.7,y:0.75 },{ x:0.95,y:0.8 }],
      loop:   [{ x:0.05,y:0.1  },{ x:0.15,y:0.8 },{ x:0.3,y:0.3 },{ x:0.45,y:0.85 },{ x:0.55,y:0.2 },{ x:0.7,y:0.9 },{ x:0.85,y:0.35 },{ x:0.95,y:0.8 }]
    };

    window._ecPreset = (name) => {
      if (running) return;
      controlPts = presets[name].map(p => ({ ...p }));
      initPhysics();
    };

    document.getElementById('ec-mass').addEventListener('input', function () {
      mass = parseFloat(this.value);
      document.getElementById('ec-mass-val').textContent = mass.toFixed(1) + ' kg';
      if (!running) initPhysics();
    });

    document.getElementById('ec-friction').addEventListener('change', function () {
      document.getElementById('ec-fric-panel').style.display = this.checked ? '' : 'none';
      friction = this.checked ? parseFloat(document.getElementById('ec-fric-slider').value) : 0;
    });

    document.getElementById('ec-fric-slider').addEventListener('input', function () {
      friction = parseFloat(this.value);
      document.getElementById('ec-fric-val').textContent = friction.toFixed(2);
    });

    /* ── Start ────────────────────────────────────────────────── */
    requestAnimationFrame(draw);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', resize);
      delete window._ecToggle;
      delete window._ecReset;
      delete window._ecPreset;
    };
  };
})();
