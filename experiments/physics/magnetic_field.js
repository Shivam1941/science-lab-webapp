/* ============================================================
   Magnetic Field Lines — Interactive Simulation
   Bar Magnet · Current-Carrying Conductor · Solenoid
   ============================================================ */
(function () {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['magnetic_field_sim'] = function (container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is a magnetic field?', opts: ['A force field around a charged object at rest', 'The region around a magnet where magnetic force is experienced', 'Gravitational field near a magnet', 'Electric current in a wire'], ans: 1, exp: 'A magnetic field is the region around a magnet (or current-carrying conductor) where a magnetic force is experienced by another magnet or magnetic material.' },
      { q: 'What happens to the magnetic field when current in a conductor increases?', opts: ['Field disappears', 'Field weakens', 'Field becomes stronger', 'Field reverses'], ans: 2, exp: 'Increasing the current increases the magnetic field strength. B = μ₀I / (2πr) shows direct proportionality.' },
      { q: 'What is the Right-Hand Thumb Rule?', opts: ['Thumb points in field direction', 'If the thumb points in the direction of current, curled fingers show field direction', 'Thumb points to the North pole', 'It applies only to bar magnets'], ans: 1, exp: 'Grip the conductor with the right hand so the thumb points in the current direction; the curled fingers indicate the direction of the magnetic field lines.' },
      { q: 'What is the shape of magnetic field lines around a straight conductor?', opts: ['Straight lines', 'Ellipses', 'Concentric circles', 'Parabolas'], ans: 2, exp: 'A straight current-carrying conductor produces concentric circular magnetic field lines in a plane perpendicular to the wire.' },
      { q: 'A solenoid carrying current behaves like a:', opts: ['Capacitor', 'Resistor', 'Bar magnet', 'Transformer'], ans: 2, exp: 'A current-carrying solenoid produces a magnetic field pattern identical to that of a bar magnet, with distinct N and S poles.' }
    ];

    /* ── State ────────────────────────────────────────────────── */
    let mode = 'bar_magnet'; // bar_magnet | conductor | solenoid
    let fieldVisible = true;
    let compassVisible = true;
    let heatmapMode = false;
    let strength = 1.0;     // magnet / current multiplier
    let currentDir = 1;     // +1 upward, -1 downward
    let solenoidTurns = 5;
    let alive = true;

    // Draggable compass
    let compassX = 0, compassY = 0;
    let draggingCompass = false;

    // Particles for field line animation
    let particles = [];
    const PARTICLE_COUNT = 250;

    /* ── HTML ─────────────────────────────────────────────────── */
    container.innerHTML = `
      <div style="display:flex; gap:0; height:620px; border-radius:14px; overflow:hidden; border:1px solid var(--border-glass); background:#06080d;">
        <!-- Canvas -->
        <div style="flex:1; position:relative; min-width:0;">
          <canvas id="mag-canvas" style="width:100%;height:100%;display:block;cursor:crosshair;"></canvas>
          <div id="mag-mode-badge" style="position:absolute;top:12px;left:12px;padding:4px 14px;border-radius:100px;font-size:11px;font-weight:600;background:rgba(168,85,247,0.15);color:#a855f7;border:1px solid rgba(168,85,247,0.25);">Bar Magnet</div>
          <div id="mag-hint" style="position:absolute;bottom:12px;left:12px;right:12px;text-align:center;font-size:11px;color:var(--text-muted);pointer-events:none;">Drag the compass needle anywhere to explore the field direction</div>
        </div>

        <!-- Controls -->
        <div style="width:310px; flex-shrink:0; display:flex; flex-direction:column; background:rgba(12,16,24,0.9); border-left:1px solid var(--border-glass); overflow-y:auto;">
          <div style="padding:16px 18px; border-bottom:1px solid var(--border-glass);">
            <div style="font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:700; color:#fff;">🧲 Magnetic Field</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Interactive Field Simulation</div>
          </div>

          <div style="padding:14px 18px; display:flex; flex-direction:column; gap:12px; flex:1;">

            <!-- Mode Selector -->
            <div style="font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Simulation Mode</div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:4px;">
              <button class="sim-btn btn-primary" id="mag-m-bar" style="font-size:11px;padding:7px 4px;" onclick="window._magMode('bar_magnet')">Bar Magnet</button>
              <button class="sim-btn" id="mag-m-cond" style="font-size:11px;padding:7px 4px;" onclick="window._magMode('conductor')">Conductor</button>
              <button class="sim-btn" id="mag-m-sol" style="font-size:11px;padding:7px 4px;" onclick="window._magMode('solenoid')">Solenoid</button>
            </div>

            <div style="border-top:1px solid var(--border-glass); margin:2px 0;"></div>

            <!-- Toggles -->
            <div class="mag-tgl-row"><span>🔮 Field Lines</span><label class="mag-sw"><input type="checkbox" id="mag-tgl-field" checked><span class="mag-sl"></span></label></div>
            <div class="mag-tgl-row"><span>🧭 Compass</span><label class="mag-sw"><input type="checkbox" id="mag-tgl-compass" checked><span class="mag-sl"></span></label></div>
            <div class="mag-tgl-row"><span>🌡️ Heatmap</span><label class="mag-sw"><input type="checkbox" id="mag-tgl-heatmap"><span class="mag-sl"></span></label></div>

            <!-- Strength slider -->
            <div>
              <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-bottom:4px;">
                <span id="mag-str-label">Magnet Strength</span><span id="mag-str-val">1.0</span>
              </div>
              <input type="range" min="0.2" max="3" step="0.1" value="1" id="mag-strength" style="width:100%; accent-color:#a855f7;">
            </div>

            <!-- Current direction (conductor/solenoid only) -->
            <div id="mag-dir-panel" style="display:none;">
              <div style="display:flex; gap:6px;">
                <button class="sim-btn btn-primary" id="mag-dir-up" style="flex:1;font-size:11px;padding:6px;" onclick="window._magDir(1)">↑ Current Up</button>
                <button class="sim-btn" id="mag-dir-down" style="flex:1;font-size:11px;padding:6px;" onclick="window._magDir(-1)">↓ Current Down</button>
              </div>
            </div>

            <!-- Solenoid turns -->
            <div id="mag-turns-panel" style="display:none;">
              <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-bottom:4px;">
                <span>Coil Turns</span><span id="mag-turns-val">5</span>
              </div>
              <input type="range" min="2" max="15" step="1" value="5" id="mag-turns" style="width:100%; accent-color:#a855f7;">
            </div>

            <div style="border-top:1px solid var(--border-glass); margin:2px 0;"></div>

            <!-- Right-Hand Rule -->
            <div style="padding:10px; background:rgba(168,85,247,0.08); border:1px solid rgba(168,85,247,0.2); border-radius:8px;">
              <div style="font-size:12px; font-weight:700; color:#a855f7; margin-bottom:6px;">✋ Right-Hand Thumb Rule</div>
              <div style="font-size:11px; color:var(--text-secondary); line-height:1.5;">Point your <b style="color:#ef4444;">thumb</b> in the direction of current. Your curled <b style="color:#3b82f6;">fingers</b> show the direction of the magnetic field lines.</div>
            </div>

            <!-- Observations -->
            <div style="border-top:1px solid var(--border-glass); margin:2px 0;"></div>
            <div style="font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Observations</div>

            <div style="font-size:12px; color:var(--text-secondary);">
              <div>Field pattern: <span id="mag-obs-pattern" style="color:#a855f7;">—</span></div>
              <div>Field direction: <span id="mag-obs-dir" style="color:#3b82f6;">—</span></div>
              <div>At compass: <span id="mag-obs-compass" style="color:#22c55e;">—</span></div>
            </div>

            <div style="padding:10px; background:rgba(255,255,255,0.02); border:1px solid var(--border-glass); border-radius:8px; margin-top:4px;">
              <div style="font-size:12px; color:var(--text-secondary); line-height:1.5;" id="mag-result">Select a mode and adjust parameters to begin exploring the magnetic field.</div>
            </div>

            <div style="margin-top:auto; display:flex; gap:8px;">
              <button class="sim-btn" style="flex:1;font-size:12px;" onclick="window._magReset()">↺ Reset</button>
              <button class="sim-btn sim-btn-primary" style="flex:1;font-size:12px;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Viva</button>
            </div>
          </div>
        </div>
      </div>

      <style>
        .mag-tgl-row { display:flex; align-items:center; justify-content:space-between; font-size:13px; color:#ddd; }
        .mag-sw { position:relative; width:40px; height:22px; flex-shrink:0; }
        .mag-sw input { opacity:0; width:0; height:0; }
        .mag-sl { position:absolute; inset:0; background:rgba(255,255,255,0.1); border-radius:22px; cursor:pointer; transition:0.3s; }
        .mag-sl::before { content:''; position:absolute; width:16px; height:16px; left:3px; bottom:3px; background:#888; border-radius:50%; transition:0.3s; }
        .mag-sw input:checked + .mag-sl { background:rgba(168,85,247,0.45); }
        .mag-sw input:checked + .mag-sl::before { transform:translateX(18px); background:#a855f7; }
      </style>
    `;

    /* ── Canvas Setup ─────────────────────────────────────────── */
    const canvas = document.getElementById('mag-canvas');
    const ctx = canvas.getContext('2d');

    function resize() {
      const r = canvas.parentElement.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
      compassX = canvas.width * 0.35;
      compassY = canvas.height * 0.35;
    }
    resize();
    window.addEventListener('resize', resize);

    /* ── Physics: Field Computation ────────────────────────────── */
    // Returns {bx, by, mag} at point (px,py) in canvas coords
    function getField(px, py) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      if (mode === 'bar_magnet' || mode === 'solenoid') {
        // Magnetic dipole approximation
        // North pole at cx - offset, South at cx + offset
        const poleOff = mode === 'solenoid' ? 60 * (solenoidTurns / 5) : 80;
        const m = strength * (mode === 'solenoid' ? solenoidTurns / 3 : 1);

        const nx = cx - poleOff * currentDir;
        const ny = cy;
        const sx = cx + poleOff * currentDir;
        const sy = cy;

        // Field = sum of monopole fields
        let bx = 0, by = 0;

        // North pole (+)
        let dx = px - nx, dy = py - ny;
        let r = Math.max(Math.hypot(dx, dy), 15);
        let f = m * 8000 / (r * r);
        bx += f * dx / r;
        by += f * dy / r;

        // South pole (-)
        dx = px - sx; dy = py - sy;
        r = Math.max(Math.hypot(dx, dy), 15);
        f = m * 8000 / (r * r);
        bx -= f * dx / r;
        by -= f * dy / r;

        return { bx, by, mag: Math.hypot(bx, by) };

      } else if (mode === 'conductor') {
        // Straight wire at center, current along Z (out of screen → field circles in XY)
        const dx = px - cx;
        const dy = py - cy;
        const r = Math.max(Math.hypot(dx, dy), 10);
        const B = strength * 5000 / r;

        // Direction: right-hand rule. Current up (+z) → field CCW
        // Tangent to circle: (-dy, dx) normalized
        const dir = currentDir;
        const bx = -dir * dy / r * B;
        const by =  dir * dx / r * B;

        return { bx, by, mag: Math.hypot(bx, by) };
      }

      return { bx: 0, by: 0, mag: 0 };
    }

    /* ── Particles ────────────────────────────────────────────── */
    function seedParticles() {
      particles = [];
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let px, py;
        if (mode === 'conductor') {
          // Seed in a ring around center
          const angle = Math.random() * Math.PI * 2;
          const dist = 30 + Math.random() * 250;
          px = cx + Math.cos(angle) * dist;
          py = cy + Math.sin(angle) * dist;
        } else {
          // Seed around both poles
          const side = Math.random() > 0.5 ? -1 : 1;
          const off = mode === 'solenoid' ? 60 * (solenoidTurns / 5) : 80;
          const baseX = cx + side * off * currentDir;
          const angle = Math.random() * Math.PI * 2;
          const dist = 10 + Math.random() * 200;
          px = baseX + Math.cos(angle) * dist;
          py = cy + Math.sin(angle) * dist;
        }
        particles.push({
          x: px, y: py,
          life: Math.random(),
          speed: 0.5 + Math.random() * 0.5
        });
      }
    }
    seedParticles();

    /* ── Drawing ───────────────────────────────────────────────── */
    function draw() {
      if (!alive) return;
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Heatmap
      if (heatmapMode) {
        const step = 12;
        for (let x = 0; x < w; x += step) {
          for (let y = 0; y < h; y += step) {
            const f = getField(x + step/2, y + step/2);
            const intensity = Math.min(f.mag / 8, 1);
            const r = Math.floor(100 + intensity * 155);
            const g = Math.floor(40 * (1 - intensity));
            const b = Math.floor(200 * intensity);
            ctx.fillStyle = `rgba(${r},${g},${b},${intensity * 0.5})`;
            ctx.fillRect(x, y, step, step);
          }
        }
      }

      // Draw source object
      if (mode === 'bar_magnet') {
        drawBarMagnet(cx, cy);
      } else if (mode === 'conductor') {
        drawConductor(cx, cy);
      } else if (mode === 'solenoid') {
        drawSolenoid(cx, cy);
      }

      // Animated field particles
      if (fieldVisible) {
        drawFieldParticles();
      }

      // Compass
      if (compassVisible) {
        drawCompass(compassX, compassY);
      }

      // Update observations
      updateObs();

      requestAnimationFrame(draw);
    }

    function drawBarMagnet(cx, cy) {
      const mw = 160, mh = 50;
      // North half (red)
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - mw/2, cy - mh/2, mw/2, mh);
      // South half (blue)
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(cx, cy - mh/2, mw/2, mh);
      // Border
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - mw/2, cy - mh/2, mw, mh);
      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', cx - mw/4, cy);
      ctx.fillText('S', cx + mw/4, cy);
    }

    function drawConductor(cx, cy) {
      // Wire (vertical line)
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx, 20);
      ctx.lineTo(cx, canvas.height - 20);
      ctx.stroke();

      // Current arrow
      ctx.fillStyle = '#f59e0b';
      const arrowY = currentDir > 0 ? cy - 60 : cy + 60;
      const arrowDir = currentDir > 0 ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(cx, arrowY);
      ctx.lineTo(cx - 12, arrowY + arrowDir * 20);
      ctx.lineTo(cx + 12, arrowY + arrowDir * 20);
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.fillStyle = '#f59e0b';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('I = ' + strength.toFixed(1) + 'A ' + (currentDir > 0 ? '↑' : '↓'), cx, canvas.height - 5);

      // Cross-section circle
      ctx.strokeStyle = 'rgba(245,158,11,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.stroke();
      // Dot (current coming toward) or cross (going away)
      ctx.fillStyle = '#f59e0b';
      if (currentDir > 0) {
        // Dot (coming toward viewer in standard convention for upward current)
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Cross
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy - 4); ctx.lineTo(cx + 4, cy + 4);
        ctx.moveTo(cx + 4, cy - 4); ctx.lineTo(cx - 4, cy + 4);
        ctx.stroke();
      }
    }

    function drawSolenoid(cx, cy) {
      const totalW = solenoidTurns * 24;
      const startX = cx - totalW / 2;
      const coilH = 40;

      // Iron core
      ctx.fillStyle = 'rgba(100,100,100,0.5)';
      ctx.fillRect(startX, cy - coilH/2 + 5, totalW, coilH - 10);

      // Coil loops
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      for (let i = 0; i < solenoidTurns; i++) {
        const x = startX + i * 24 + 12;
        ctx.beginPath();
        ctx.ellipse(x, cy, 10, coilH / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Pole labels
      const poleOff = 60 * (solenoidTurns / 5);
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 16px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillText('N', cx - poleOff * currentDir - 20 * currentDir, cy);
      ctx.fillStyle = '#2563eb';
      ctx.fillText('S', cx + poleOff * currentDir + 20 * currentDir, cy);

      // Current direction arrows along wire
      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px Inter';
      ctx.fillText('I = ' + strength.toFixed(1) + 'A, Turns = ' + solenoidTurns, cx, cy + coilH / 2 + 20);
    }

    /* ── Field Particle Animation ─────────────────────────────── */
    function drawFieldParticles() {
      const w = canvas.width, h = canvas.height;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const f = getField(p.x, p.y);

        if (f.mag < 0.1) { resetParticle(p); continue; }

        // Normalize and move
        const nx = f.bx / f.mag;
        const ny = f.by / f.mag;
        const spd = Math.min(f.mag * 0.03, 3) * p.speed * strength;

        p.x += nx * spd;
        p.y += ny * spd;
        p.life -= 0.003;

        // Reset if off screen or dead
        if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20 || p.life <= 0) {
          resetParticle(p);
          continue;
        }

        // Draw
        const alpha = Math.min(p.life * 2, 1) * Math.min(f.mag / 3, 1);
        const size = 1.5 + Math.min(f.mag / 5, 2);

        // Color: blue for weak, purple for medium, red for strong
        const t = Math.min(f.mag / 8, 1);
        const r = Math.floor(80 + t * 175);
        const g = Math.floor(50 + (1 - t) * 80);
        const b = Math.floor(220 - t * 100);

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function resetParticle(p) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      if (mode === 'conductor') {
        const angle = Math.random() * Math.PI * 2;
        const dist = 25 + Math.random() * 200;
        p.x = cx + Math.cos(angle) * dist;
        p.y = cy + Math.sin(angle) * dist;
      } else {
        const side = Math.random() > 0.5 ? -1 : 1;
        const off = mode === 'solenoid' ? 60 * (solenoidTurns / 5) : 80;
        const baseX = cx + side * off * currentDir;
        const angle = Math.random() * Math.PI * 2;
        const dist = 5 + Math.random() * 180;
        p.x = baseX + Math.cos(angle) * dist;
        p.y = cy + Math.sin(angle) * dist;
      }
      p.life = 0.6 + Math.random() * 0.4;
      p.speed = 0.5 + Math.random() * 0.5;
    }

    /* ── Compass ──────────────────────────────────────────────── */
    function drawCompass(x, y) {
      const f = getField(x, y);
      const angle = Math.atan2(f.by, f.bx);

      // Outer ring
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.arc(x, y, 21, 0, Math.PI * 2);
      ctx.fill();

      // Needle
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Red half (north-seeking)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-3, -5);
      ctx.lineTo(-3, 5);
      ctx.closePath();
      ctx.fill();

      // White half (south-seeking)
      ctx.fillStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(3, -5);
      ctx.lineTo(3, 5);
      ctx.closePath();
      ctx.fill();

      // Center dot
      ctx.fillStyle = '#666';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '9px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('🧭', x, y - 28);
    }

    /* ── Compass Drag ─────────────────────────────────────────── */
    canvas.addEventListener('mousedown', (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      if (Math.hypot(mx - compassX, my - compassY) < 30) {
        draggingCompass = true;
      }
    });
    canvas.addEventListener('mousemove', (e) => {
      if (!draggingCompass) return;
      const r = canvas.getBoundingClientRect();
      compassX = e.clientX - r.left;
      compassY = e.clientY - r.top;
    });
    canvas.addEventListener('mouseup', () => { draggingCompass = false; });
    canvas.addEventListener('mouseleave', () => { draggingCompass = false; });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
      const r = canvas.getBoundingClientRect();
      const t = e.touches[0];
      const mx = t.clientX - r.left;
      const my = t.clientY - r.top;
      if (Math.hypot(mx - compassX, my - compassY) < 40) {
        draggingCompass = true;
        e.preventDefault();
      }
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      if (!draggingCompass) return;
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const t = e.touches[0];
      compassX = t.clientX - r.left;
      compassY = t.clientY - r.top;
    }, { passive: false });
    canvas.addEventListener('touchend', () => { draggingCompass = false; });

    /* ── Observations ─────────────────────────────────────────── */
    function updateObs() {
      const patternEl = document.getElementById('mag-obs-pattern');
      const dirEl = document.getElementById('mag-obs-dir');
      const compEl = document.getElementById('mag-obs-compass');
      const resultEl = document.getElementById('mag-result');

      if (mode === 'bar_magnet') {
        patternEl.textContent = 'Closed loops N→S (external)';
        dirEl.textContent = 'North to South externally';
      } else if (mode === 'conductor') {
        patternEl.textContent = 'Concentric circles';
        dirEl.textContent = currentDir > 0 ? 'Anti-clockwise (top view)' : 'Clockwise (top view)';
      } else {
        patternEl.textContent = 'Bar-magnet-like (solenoid)';
        dirEl.textContent = 'N→S external, Turns: ' + solenoidTurns;
      }

      // Compass reading
      const f = getField(compassX, compassY);
      const deg = (Math.atan2(f.by, f.bx) * 180 / Math.PI + 360) % 360;
      compEl.textContent = 'B = ' + f.mag.toFixed(1) + ', θ = ' + deg.toFixed(0) + '°';

      // Result
      if (mode === 'bar_magnet') {
        resultEl.textContent = 'Magnetic field lines emerge from the N pole and enter the S pole, forming closed loops. Field is strongest near the poles (strength = ' + strength.toFixed(1) + ').';
      } else if (mode === 'conductor') {
        resultEl.textContent = 'Current (' + (currentDir > 0 ? 'upward' : 'downward') + ', I = ' + strength.toFixed(1) + 'A) produces concentric circular field lines. Direction follows the Right-Hand Thumb Rule.';
      } else {
        resultEl.textContent = 'The solenoid (' + solenoidTurns + ' turns, I = ' + strength.toFixed(1) + 'A) produces a field identical to a bar magnet. More turns = stronger field.';
      }
    }

    /* ── Controls ─────────────────────────────────────────────── */
    window._magMode = (m) => {
      mode = m;
      document.getElementById('mag-m-bar').className = m === 'bar_magnet' ? 'sim-btn btn-primary' : 'sim-btn';
      document.getElementById('mag-m-cond').className = m === 'conductor' ? 'sim-btn btn-primary' : 'sim-btn';
      document.getElementById('mag-m-sol').className = m === 'solenoid' ? 'sim-btn btn-primary' : 'sim-btn';

      document.getElementById('mag-dir-panel').style.display = (m === 'conductor' || m === 'solenoid') ? '' : 'none';
      document.getElementById('mag-turns-panel').style.display = m === 'solenoid' ? '' : 'none';

      const strLabel = document.getElementById('mag-str-label');
      strLabel.textContent = m === 'bar_magnet' ? 'Magnet Strength' : 'Current (A)';

      const badge = document.getElementById('mag-mode-badge');
      badge.textContent = m === 'bar_magnet' ? 'Bar Magnet' : (m === 'conductor' ? 'Conductor' : 'Solenoid');

      seedParticles();
    };

    window._magDir = (d) => {
      currentDir = d;
      document.getElementById('mag-dir-up').className = d > 0 ? 'sim-btn btn-primary' : 'sim-btn';
      document.getElementById('mag-dir-down').className = d < 0 ? 'sim-btn btn-primary' : 'sim-btn';
      seedParticles();
    };

    window._magReset = () => {
      mode = 'bar_magnet';
      strength = 1; currentDir = 1; solenoidTurns = 5;
      fieldVisible = true; compassVisible = true; heatmapMode = false;

      document.getElementById('mag-tgl-field').checked = true;
      document.getElementById('mag-tgl-compass').checked = true;
      document.getElementById('mag-tgl-heatmap').checked = false;
      document.getElementById('mag-strength').value = 1;
      document.getElementById('mag-str-val').textContent = '1.0';
      document.getElementById('mag-turns').value = 5;
      document.getElementById('mag-turns-val').textContent = '5';

      window._magMode('bar_magnet');
      compassX = canvas.width * 0.35;
      compassY = canvas.height * 0.35;
    };

    // Toggles
    document.getElementById('mag-tgl-field').addEventListener('change', function() { fieldVisible = this.checked; });
    document.getElementById('mag-tgl-compass').addEventListener('change', function() { compassVisible = this.checked; });
    document.getElementById('mag-tgl-heatmap').addEventListener('change', function() { heatmapMode = this.checked; });

    document.getElementById('mag-strength').addEventListener('input', function() {
      strength = parseFloat(this.value);
      document.getElementById('mag-str-val').textContent = strength.toFixed(1);
    });

    document.getElementById('mag-turns').addEventListener('input', function() {
      solenoidTurns = parseInt(this.value);
      document.getElementById('mag-turns-val').textContent = solenoidTurns;
      seedParticles();
    });

    /* ── Start ────────────────────────────────────────────────── */
    requestAnimationFrame(draw);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', resize);
      delete window._magMode;
      delete window._magDir;
      delete window._magReset;
    };
  };
})();
