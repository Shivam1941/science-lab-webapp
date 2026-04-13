/* ============================================================
   Heat Transfer & Thermal Expansion — Interactive Simulation
   Ball & Ring · Conduction · Convection · Radiation
   ============================================================ */
(function () {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['heat_transfer_sim'] = function (container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is conduction?', opts: ['Heat transfer through fluid movement', 'Heat transfer through direct particle-to-particle contact', 'Heat transfer through electromagnetic waves', 'Heat transfer through vacuum'], ans: 1, exp: 'Conduction is the transfer of heat through a material by direct contact between vibrating particles, without bulk movement of the material.' },
      { q: 'Why does a metal ball expand on heating?', opts: ['It absorbs water', 'Particles move faster and need more space', 'It gains mass', 'Gravity changes'], ans: 1, exp: 'When heated, the kinetic energy of particles increases, they vibrate more vigorously and push apart, causing the solid to expand.' },
      { q: 'What is the difference between convection and radiation?', opts: ['Both need a medium', 'Convection needs a medium, radiation does not', 'Radiation needs a medium, convection does not', 'Neither needs a medium'], ans: 1, exp: 'Convection requires a fluid medium (liquid/gas) for bulk movement, while radiation transfers heat via electromagnetic waves and needs no medium.' },
      { q: 'In the ball-and-ring experiment, what happens when the heated ball is cooled?', opts: ['It stays expanded', 'It contracts and passes through the ring', 'It melts', 'Nothing happens'], ans: 1, exp: 'On cooling, particles slow down and come closer together, causing the ball to contract back to its original size and fit through the ring.' },
      { q: 'Which mode of heat transfer causes sea breezes?', opts: ['Conduction', 'Convection', 'Radiation', 'None'], ans: 1, exp: 'Sea breezes are caused by convection. Land heats faster than sea, warm air rises over land, and cooler air from the sea moves in to replace it.' }
    ];

    /* ── State ────────────────────────────────────────────────── */
    let mode = 'ball_ring';
    let heating = false;
    let temperature = 25;   // °C
    let alive = true;
    let time = 0;

    // Ball & Ring
    let ballTemp = 25;
    let ballRadius = 30;
    const RING_RADIUS = 32;
    let ballY = 0;          // vertical position for drop animation
    let dropping = false;
    let dropResult = '';

    // Conduction
    const ROD_SEGMENTS = 12;
    let rodTemps = new Array(ROD_SEGMENTS).fill(25);

    // Convection
    let convParticles = [];
    const CONV_PARTICLE_COUNT = 80;

    // Radiation
    let radWaves = [];

    /* ── HTML ─────────────────────────────────────────────────── */
    container.innerHTML = `
      <div style="display:flex; gap:0; height:600px; border-radius:14px; overflow:hidden; border:1px solid var(--border-glass); background:#06080d;">
        <div style="flex:1; position:relative; min-width:0;">
          <canvas id="ht-canvas" style="width:100%;height:100%;display:block;"></canvas>
          <div id="ht-badge" style="position:absolute;top:12px;left:12px;padding:4px 14px;border-radius:100px;font-size:11px;font-weight:600;background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.25);">Ball & Ring</div>
          <div id="ht-temp-display" style="position:absolute;top:12px;right:12px;padding:5px 14px;border-radius:8px;font-size:13px;font-weight:700;font-family:'JetBrains Mono',monospace;background:rgba(0,0,0,0.5);color:#f59e0b;border:1px solid rgba(245,158,11,0.2);">25 °C</div>
        </div>

        <!-- Controls -->
        <div style="width:300px; flex-shrink:0; display:flex; flex-direction:column; background:rgba(12,16,24,0.9); border-left:1px solid var(--border-glass); overflow-y:auto;">
          <div style="padding:16px 18px; border-bottom:1px solid var(--border-glass);">
            <div style="font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:700; color:#fff;">🔥 Heat Transfer</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Thermal Expansion & Transfer</div>
          </div>
          <div style="padding:14px 18px; display:flex; flex-direction:column; gap:10px; flex:1;">
            <!-- Mode buttons -->
            <div style="font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Mode</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
              <button class="sim-btn btn-primary" id="ht-m-br" onclick="window._htMode('ball_ring')" style="font-size:11px;padding:7px;">🔴 Ball & Ring</button>
              <button class="sim-btn" id="ht-m-cd" onclick="window._htMode('conduction')" style="font-size:11px;padding:7px;">🟧 Conduction</button>
              <button class="sim-btn" id="ht-m-cv" onclick="window._htMode('convection')" style="font-size:11px;padding:7px;">🔵 Convection</button>
              <button class="sim-btn" id="ht-m-rd" onclick="window._htMode('radiation')" style="font-size:11px;padding:7px;">🟡 Radiation</button>
            </div>

            <div style="border-top:1px solid var(--border-glass); margin:2px 0;"></div>

            <!-- Heat control -->
            <div>
              <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-bottom:4px;">
                <span>Heat Source Temperature</span><span id="ht-src-val">200 °C</span>
              </div>
              <input type="range" min="50" max="600" step="10" value="200" id="ht-src-slider" style="width:100%; accent-color:#ef4444;">
            </div>

            <!-- Action buttons -->
            <div style="display:flex; gap:6px;">
              <button class="sim-btn btn-primary" id="ht-heat-btn" style="flex:1;font-size:12px;padding:8px;" onclick="window._htToggleHeat()">🔥 Start Heating</button>
              <button class="sim-btn" style="flex:1;font-size:12px;padding:8px;" onclick="window._htCool()">❄️ Cool Down</button>
            </div>

            <!-- Ball & Ring specific -->
            <div id="ht-br-panel">
              <button class="sim-btn" style="width:100%;font-size:12px;padding:8px;" onclick="window._htDropBall()">⬇ Try Passing Through Ring</button>
              <div id="ht-drop-result" style="font-size:12px; color:var(--text-muted); margin-top:4px; min-height:20px; text-align:center;"></div>
            </div>

            <div style="border-top:1px solid var(--border-glass); margin:2px 0;"></div>

            <!-- Info box -->
            <div style="padding:10px; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.15); border-radius:8px;" id="ht-info-box">
              <div style="font-size:12px; font-weight:700; color:#ef4444; margin-bottom:4px;" id="ht-info-title">Ball & Ring Experiment</div>
              <div style="font-size:11px; color:var(--text-secondary); line-height:1.5;" id="ht-info-desc">When a metal ball is heated, it expands due to increased particle vibration. It no longer fits through a ring it could pass when cold.</div>
            </div>

            <div style="border-top:1px solid var(--border-glass); margin:2px 0;"></div>

            <!-- Observations -->
            <div style="font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Observations</div>
            <div style="font-size:12px; color:var(--text-secondary); line-height:1.6;" id="ht-obs">
              Heat the ball and try passing it through the ring to begin.
            </div>

            <div style="padding:10px; background:rgba(255,255,255,0.02); border:1px solid var(--border-glass); border-radius:8px;">
              <div style="font-size:11px; font-weight:600; color:var(--text-muted); margin-bottom:4px;">RESULT</div>
              <div style="font-size:12px; color:var(--text-secondary); line-height:1.5;" id="ht-result">—</div>
            </div>

            <div style="margin-top:auto; display:flex; gap:8px;">
              <button class="sim-btn" style="flex:1;font-size:12px;" onclick="window._htReset()">↺ Reset</button>
              <button class="sim-btn sim-btn-primary" style="flex:1;font-size:12px;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Viva</button>
            </div>
          </div>
        </div>
      </div>
    `;

    /* ── Canvas ───────────────────────────────────────────────── */
    const canvas = document.getElementById('ht-canvas');
    const ctx = canvas.getContext('2d');
    let srcTemp = 200;

    function resize() {
      const r = canvas.parentElement.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
    }
    resize();
    window.addEventListener('resize', resize);

    /* ── Init Convection Particles ─────────────────────────────── */
    function initConvParticles() {
      convParticles = [];
      const cx = canvas.width / 2, cy = canvas.height / 2;
      for (let i = 0; i < CONV_PARTICLE_COUNT; i++) {
        convParticles.push({
          angle: Math.random() * Math.PI * 2,
          rx: 60 + Math.random() * 100,
          ry: 40 + Math.random() * 80,
          speed: 0.3 + Math.random() * 0.5,
          ox: cx + (Math.random() - 0.5) * 40,
          oy: cy + (Math.random() - 0.5) * 20
        });
      }
    }
    initConvParticles();

    /* ── Color Helper ─────────────────────────────────────────── */
    function tempToColor(t) {
      // 25°C = cool blue → 600°C = bright red/white
      const norm = Math.min(Math.max((t - 25) / 575, 0), 1);
      if (norm < 0.33) {
        const k = norm / 0.33;
        return `rgb(${Math.floor(30 + k * 200)}, ${Math.floor(60 + k * 80)}, ${Math.floor(180 - k * 80)})`;
      } else if (norm < 0.66) {
        const k = (norm - 0.33) / 0.33;
        return `rgb(${Math.floor(230 + k * 25)}, ${Math.floor(140 - k * 40)}, ${Math.floor(30)})`;
      } else {
        const k = (norm - 0.66) / 0.34;
        return `rgb(255, ${Math.floor(100 + k * 155)}, ${Math.floor(30 + k * 180)})`;
      }
    }

    /* ── Main Draw ────────────────────────────────────────────── */
    function draw() {
      if (!alive) return;
      const w = canvas.width, h = canvas.height;
      const dt = 1 / 60;
      time += dt;

      ctx.clearRect(0, 0, w, h);

      // Update physics
      updatePhysics(dt);

      // Draw based on mode
      if (mode === 'ball_ring') drawBallRing(w, h);
      else if (mode === 'conduction') drawConduction(w, h);
      else if (mode === 'convection') drawConvection(w, h);
      else if (mode === 'radiation') drawRadiation(w, h);

      // Update temperature display
      const displayTemp = mode === 'ball_ring' ? ballTemp :
                          mode === 'conduction' ? rodTemps[0] : temperature;
      document.getElementById('ht-temp-display').textContent = Math.round(displayTemp) + ' °C';
      document.getElementById('ht-temp-display').style.color = tempToColor(displayTemp);

      requestAnimationFrame(draw);
    }

    /* ── Physics Update ───────────────────────────────────────── */
    function updatePhysics(dt) {
      if (mode === 'ball_ring') {
        if (heating) {
          ballTemp = Math.min(ballTemp + (srcTemp - ballTemp) * 0.008, srcTemp);
        } else {
          ballTemp = Math.max(ballTemp - (ballTemp - 25) * 0.003, 25);
        }
        // Expansion: radius grows with temperature
        const expansion = 1 + (ballTemp - 25) / 575 * 0.2; // up to 20% expansion
        ballRadius = 30 * expansion;

        // Drop animation
        if (dropping) {
          ballY += 3;
          const ringY = canvas.height / 2 + 60;
          if (ballY >= 0) {
            if (ballRadius <= RING_RADIUS) {
              // Passes through
              if (ballY > 80) {
                dropping = false;
                dropResult = 'pass';
                document.getElementById('ht-drop-result').innerHTML = '<span style="color:#22c55e;">✅ Ball passes through — it fits!</span>';
              }
            } else {
              // Blocked
              dropping = false;
              dropResult = 'blocked';
              document.getElementById('ht-drop-result').innerHTML = '<span style="color:#ef4444;">❌ Ball is too large — blocked by ring!</span>';
            }
          }
        }
      }

      if (mode === 'conduction') {
        if (heating) {
          rodTemps[0] = Math.min(rodTemps[0] + (srcTemp - rodTemps[0]) * 0.01, srcTemp);
        } else {
          rodTemps[0] = Math.max(rodTemps[0] - (rodTemps[0] - 25) * 0.005, 25);
        }
        // Heat conduction along rod
        for (let i = 1; i < ROD_SEGMENTS; i++) {
          const diff = rodTemps[i - 1] - rodTemps[i];
          rodTemps[i] += diff * 0.015;
        }
        // Cool last segment toward ambient
        rodTemps[ROD_SEGMENTS - 1] -= (rodTemps[ROD_SEGMENTS - 1] - 25) * 0.002;
      }

      if (mode === 'convection') {
        if (heating) {
          temperature = Math.min(temperature + (srcTemp - temperature) * 0.005, srcTemp);
        } else {
          temperature = Math.max(temperature - (temperature - 25) * 0.003, 25);
        }
      }

      if (mode === 'radiation') {
        if (heating) {
          temperature = Math.min(temperature + (srcTemp - temperature) * 0.005, srcTemp);
          // Spawn waves
          if (Math.random() < 0.1 * (temperature / 100)) {
            const angle = Math.random() * Math.PI * 2;
            radWaves.push({ r: 20, angle, maxR: 150 + Math.random() * 100, alpha: 1 });
          }
        } else {
          temperature = Math.max(temperature - (temperature - 25) * 0.003, 25);
        }
        // Update waves
        for (let i = radWaves.length - 1; i >= 0; i--) {
          radWaves[i].r += 1.5;
          radWaves[i].alpha = 1 - radWaves[i].r / radWaves[i].maxR;
          if (radWaves[i].r >= radWaves[i].maxR) radWaves.splice(i, 1);
        }
      }
    }

    /* ── Draw: Ball & Ring ─────────────────────────────────────── */
    function drawBallRing(w, h) {
      const cx = w / 2, cy = h / 2;

      // Stand
      ctx.fillStyle = '#333';
      ctx.fillRect(cx - 3, cy + 100, 6, 80);
      ctx.fillRect(cx - 60, cy + 175, 120, 8);

      // Ring (fixed)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy + 60, RING_RADIUS + 3, 0, Math.PI * 2);
      ctx.stroke();
      // Ring label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Ring (ø ' + (RING_RADIUS * 2) + ')', cx, cy + 100);

      // Ball
      const ballDrawY = cy - 50 + (dropping ? ballY : (dropResult === 'pass' ? 80 : 0));
      const ballColor = tempToColor(ballTemp);

      // Glow
      if (ballTemp > 50) {
        const glow = ctx.createRadialGradient(cx, ballDrawY, ballRadius * 0.3, cx, ballDrawY, ballRadius * 2.5);
        glow.addColorStop(0, tempToColor(ballTemp).replace('rgb', 'rgba').replace(')', ',0.3)'));
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(cx - ballRadius * 3, ballDrawY - ballRadius * 3, ballRadius * 6, ballRadius * 6);
      }

      ctx.fillStyle = ballColor;
      ctx.beginPath();
      ctx.arc(cx, ballDrawY, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Ball label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Ball (ø ' + (ballRadius * 2).toFixed(1) + ')', cx, ballDrawY - ballRadius - 10);
      ctx.font = '11px JetBrains Mono';
      ctx.fillStyle = tempToColor(ballTemp);
      ctx.fillText(Math.round(ballTemp) + '°C', cx, ballDrawY + 5);

      // Flame (if heating)
      if (heating) drawFlame(cx, cy + 140);

      // Status
      ctx.fillStyle = ballRadius > RING_RADIUS ? '#ef4444' : '#22c55e';
      ctx.font = 'bold 13px Inter';
      ctx.fillText(ballRadius > RING_RADIUS ? '🔴 Ball > Ring — Won\'t fit!' : '🟢 Ball ≤ Ring — Will fit!', cx, h - 30);
    }

    /* ── Draw: Conduction ──────────────────────────────────────── */
    function drawConduction(w, h) {
      const cy = h / 2;
      const rodStartX = 80, rodEndX = w - 80;
      const segW = (rodEndX - rodStartX) / ROD_SEGMENTS;
      const rodH = 28;

      // Rod segments
      for (let i = 0; i < ROD_SEGMENTS; i++) {
        const x = rodStartX + i * segW;
        ctx.fillStyle = tempToColor(rodTemps[i]);
        ctx.fillRect(x, cy - rodH / 2, segW + 1, rodH);

        // Particles (vibrating dots)
        const vibration = (rodTemps[i] - 25) / 575 * 6;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        for (let j = 0; j < 3; j++) {
          const px = x + segW / 2 + (Math.random() - 0.5) * vibration * 3;
          const py = cy + (Math.random() - 0.5) * vibration * 3;
          ctx.beginPath();
          ctx.arc(px, py, 2 + vibration * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Temperature label
        if (i % 3 === 0 || i === ROD_SEGMENTS - 1) {
          ctx.fillStyle = '#aaa';
          ctx.font = '10px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText(Math.round(rodTemps[i]) + '°', x + segW / 2, cy + rodH / 2 + 18);
        }
      }

      // Rod border
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rodStartX, cy - rodH / 2, rodEndX - rodStartX, rodH);

      // Direction arrows
      if (rodTemps[0] > 30) {
        ctx.fillStyle = 'rgba(239,68,68,0.6)';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        for (let i = 1; i < 5; i++) {
          const ax = rodStartX + i * (rodEndX - rodStartX) / 5;
          const alpha = Math.max(0.2, 1 - i * 0.2);
          ctx.globalAlpha = alpha;
          ctx.fillText('→', ax, cy - rodH / 2 - 10);
        }
        ctx.globalAlpha = 1;
      }

      // Labels
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('🔥 Heat Source', rodStartX - 10, cy + rodH / 2 + 45);
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('❄️ Cold End', rodEndX + 10, cy + rodH / 2 + 45);

      // Flame
      if (heating) drawFlame(rodStartX - 10, cy + rodH / 2 + 10);

      // Info
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Heat travels particle → particle (conduction)', w / 2, h - 25);
    }

    /* ── Draw: Convection ──────────────────────────────────────── */
    function drawConvection(w, h) {
      const cx = w / 2, cy = h / 2;
      const bw = 240, bh = 200;

      // Beaker
      ctx.strokeStyle = 'rgba(100,160,255,0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - bw / 2, cy - bh / 2);
      ctx.lineTo(cx - bw / 2, cy + bh / 2);
      ctx.lineTo(cx + bw / 2, cy + bh / 2);
      ctx.lineTo(cx + bw / 2, cy - bh / 2);
      ctx.stroke();

      // Water fill
      const waterNorm = Math.min((temperature - 25) / 575, 1);
      const waterGrad = ctx.createLinearGradient(0, cy - bh / 2, 0, cy + bh / 2);
      waterGrad.addColorStop(0, `rgba(59, 130, 246, ${0.15 + waterNorm * 0.1})`);
      waterGrad.addColorStop(1, tempToColor(temperature).replace('rgb', 'rgba').replace(')', `,${0.2 + waterNorm * 0.15})`));
      ctx.fillStyle = waterGrad;
      ctx.fillRect(cx - bw / 2 + 2, cy - bh / 2 + 2, bw - 4, bh - 4);

      // Convection current arrows (circular)
      if (temperature > 35) {
        const speedMul = heating ? (temperature / 100) : 0.3;
        convParticles.forEach(p => {
          p.angle += p.speed * 0.02 * speedMul;
          const px = p.ox + Math.cos(p.angle) * p.rx;
          const py = p.oy + Math.sin(p.angle) * p.ry;

          // Only draw if inside beaker
          if (px > cx - bw / 2 + 10 && px < cx + bw / 2 - 10 &&
              py > cy - bh / 2 + 10 && py < cy + bh / 2 - 10) {
            // Color: warm rising (red) vs cool sinking (blue)
            const isRising = Math.sin(p.angle) < 0;
            const c = isRising ? `rgba(239,68,68,${0.4 + waterNorm * 0.4})` : `rgba(59,130,246,${0.3 + waterNorm * 0.3})`;
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Flow direction arrows
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('↑', cx - bw / 4, cy);          // warm rises on left
        ctx.fillText('→', cx, cy - bh / 4);            // flows right at top
        ctx.fillText('↓', cx + bw / 4, cy);            // cool sinks on right
        ctx.fillText('←', cx, cy + bh / 4);            // flows left at bottom
      }

      // KMnO₄ crystals at bottom
      ctx.fillStyle = '#7c3aed';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(cx + i * 10, cy + bh / 2 - 12, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('KMnO₄', cx, cy + bh / 2 + 20);

      // Flame
      if (heating) drawFlame(cx, cy + bh / 2 + 35);

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Inter';
      ctx.fillText('Warm fluid rises, cool fluid sinks → circular convection', w / 2, h - 20);
    }

    /* ── Draw: Radiation ──────────────────────────────────────── */
    function drawRadiation(w, h) {
      const cx = w / 2, cy = h / 2;

      // Heat source (glowing sphere)
      const norm = Math.min((temperature - 25) / 575, 1);

      // Glow
      const glow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 80 + norm * 60);
      glow.addColorStop(0, tempToColor(temperature).replace('rgb', 'rgba').replace(')', ',0.5)'));
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 120 + norm * 60, 0, Math.PI * 2);
      ctx.fill();

      // Source
      ctx.fillStyle = tempToColor(temperature);
      ctx.beginPath();
      ctx.arc(cx, cy, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Radiation waves
      radWaves.forEach(wave => {
        ctx.strokeStyle = `rgba(255,200,50,${wave.alpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, wave.r, wave.angle - 0.3, wave.angle + 0.3);
        ctx.stroke();
      });

      // Surrounding objects that get heated
      const objects = [
        { x: cx - 180, y: cy, label: 'Object A' },
        { x: cx + 180, y: cy, label: 'Object B' },
        { x: cx, y: cy - 160, label: 'Object C' }
      ];
      objects.forEach(obj => {
        const dist = Math.hypot(obj.x - cx, obj.y - cy);
        const receivedHeat = Math.max(0, (temperature - 25) * (100 / dist));
        const objTemp = 25 + receivedHeat * 0.3;

        ctx.fillStyle = tempToColor(objTemp);
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ccc';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(obj.label, obj.x, obj.y + 30);
        ctx.fillText(Math.round(objTemp) + '°C', obj.x, obj.y + 42);
      });

      // Wavy lines between source and objects
      if (temperature > 30) {
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = 'rgba(255,200,50,0.2)';
        ctx.lineWidth = 1;
        objects.forEach(obj => {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(obj.x, obj.y);
          ctx.stroke();
        });
        ctx.setLineDash([]);
      }

      // No medium label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Heat travels as electromagnetic waves — no medium needed', w / 2, h - 20);

      // Flame
      if (heating) drawFlame(cx, cy + 60);
    }

    /* ── Flame Drawing ────────────────────────────────────────── */
    function drawFlame(x, y) {
      const flickerX = Math.sin(time * 15) * 3;
      const flickerY = Math.cos(time * 12) * 4;

      // Outer flame (orange)
      ctx.fillStyle = 'rgba(249,115,22,0.7)';
      ctx.beginPath();
      ctx.ellipse(x + flickerX, y - 12 + flickerY, 12, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner flame (yellow)
      ctx.fillStyle = 'rgba(250,204,21,0.8)';
      ctx.beginPath();
      ctx.ellipse(x + flickerX * 0.5, y - 8 + flickerY * 0.5, 6, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Core (white)
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.ellipse(x, y - 4, 3, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /* ── Observations ─────────────────────────────────────────── */
    function updateObservations() {
      const obs = document.getElementById('ht-obs');
      const result = document.getElementById('ht-result');

      if (mode === 'ball_ring') {
        obs.innerHTML = `Ball temp: <b style="color:${tempToColor(ballTemp)}">${Math.round(ballTemp)}°C</b><br>
          Ball diameter: <b>${(ballRadius * 2).toFixed(1)}</b> vs Ring: <b>${RING_RADIUS * 2}</b><br>
          Status: ${ballRadius > RING_RADIUS ? '<span style="color:#ef4444;">Expanded — won\'t fit</span>' : '<span style="color:#22c55e;">Fits through ring</span>'}`;
        result.textContent = ballTemp > 30 ? 'The ball expands on heating. When its diameter exceeds the ring, it cannot pass through. On cooling, it contracts and fits again.' : 'Ball is at room temperature. Begin heating to observe expansion.';
      } else if (mode === 'conduction') {
        obs.innerHTML = `Hot end: <b style="color:${tempToColor(rodTemps[0])}">${Math.round(rodTemps[0])}°C</b>,
          Cold end: <b style="color:${tempToColor(rodTemps[ROD_SEGMENTS-1])}">${Math.round(rodTemps[ROD_SEGMENTS - 1])}°C</b><br>
          Heat traveling segment by segment through particles.`;
        result.textContent = 'Conduction: heat transfers through direct molecular contact — particles vibrate and pass energy to neighbors.';
      } else if (mode === 'convection') {
        obs.innerHTML = `Water temp: <b style="color:${tempToColor(temperature)}">${Math.round(temperature)}°C</b><br>
          ${temperature > 40 ? 'Convection currents visible — warm water rises, cool water sinks.' : 'Waiting for temperature to rise...'}`;
        result.textContent = 'Convection: heat causes fluid to expand and rise. Cooler fluid sinks, creating circular currents. Requires a medium (liquid/gas).';
      } else {
        obs.innerHTML = `Source temp: <b style="color:${tempToColor(temperature)}">${Math.round(temperature)}°C</b><br>
          Radiation waves propagating outward.<br>
          Nearby objects absorb heat without direct contact.`;
        result.textContent = 'Radiation: heat transfers as electromagnetic waves. No medium is required — this is how the Sun heats the Earth.';
      }
    }

    /* ── Controls ─────────────────────────────────────────────── */
    const modeInfo = {
      ball_ring: { title: 'Ball & Ring Experiment', desc: 'When a metal ball is heated, it expands due to increased particle vibration. It no longer fits through a ring it could pass when cold.', badge: 'Ball & Ring' },
      conduction: { title: 'Conduction', desc: 'Heat transfers through a solid by particle-to-particle vibration. The hot end\'s particles vibrate and pass energy to neighbors along the rod.', badge: 'Conduction' },
      convection: { title: 'Convection', desc: 'Heated fluid expands, becomes less dense, and rises. Cooler fluid sinks to take its place, creating circular convection currents.', badge: 'Convection' },
      radiation: { title: 'Radiation', desc: 'Heat radiates outward as electromagnetic waves. No physical medium is needed — objects can be heated at a distance.', badge: 'Radiation' }
    };

    window._htMode = (m) => {
      mode = m;
      heating = false;
      temperature = 25;
      ballTemp = 25;
      ballRadius = 30;
      ballY = 0;
      dropping = false;
      dropResult = '';
      rodTemps.fill(25);
      radWaves = [];

      document.getElementById('ht-m-br').className = m === 'ball_ring' ? 'sim-btn btn-primary' : 'sim-btn';
      document.getElementById('ht-m-cd').className = m === 'conduction' ? 'sim-btn btn-primary' : 'sim-btn';
      document.getElementById('ht-m-cv').className = m === 'convection' ? 'sim-btn btn-primary' : 'sim-btn';
      document.getElementById('ht-m-rd').className = m === 'radiation' ? 'sim-btn btn-primary' : 'sim-btn';

      document.getElementById('ht-br-panel').style.display = m === 'ball_ring' ? '' : 'none';
      document.getElementById('ht-drop-result').textContent = '';

      const info = modeInfo[m];
      document.getElementById('ht-info-title').textContent = info.title;
      document.getElementById('ht-info-desc').textContent = info.desc;
      document.getElementById('ht-badge').textContent = info.badge;
      document.getElementById('ht-heat-btn').innerHTML = '🔥 Start Heating';
      document.getElementById('ht-heat-btn').className = 'sim-btn btn-primary';

      initConvParticles();
      updateObservations();
    };

    window._htToggleHeat = () => {
      heating = !heating;
      const btn = document.getElementById('ht-heat-btn');
      if (heating) {
        btn.innerHTML = '⏸ Stop Heating';
        btn.className = 'sim-btn';
        btn.style.background = 'rgba(239,68,68,0.2)';
        btn.style.borderColor = 'rgba(239,68,68,0.3)';
        btn.style.color = '#ef4444';
      } else {
        btn.innerHTML = '🔥 Start Heating';
        btn.className = 'sim-btn btn-primary';
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
      }
    };

    window._htCool = () => {
      heating = false;
      document.getElementById('ht-heat-btn').innerHTML = '🔥 Start Heating';
      document.getElementById('ht-heat-btn').className = 'sim-btn btn-primary';
      document.getElementById('ht-heat-btn').style.background = '';
      document.getElementById('ht-heat-btn').style.borderColor = '';
      document.getElementById('ht-heat-btn').style.color = '';
    };

    window._htDropBall = () => {
      if (dropping) return;
      dropping = true;
      ballY = -80;
      dropResult = '';
      document.getElementById('ht-drop-result').textContent = 'Dropping...';
    };

    window._htReset = () => {
      window._htMode('ball_ring');
    };

    document.getElementById('ht-src-slider').addEventListener('input', function () {
      srcTemp = parseInt(this.value);
      document.getElementById('ht-src-val').textContent = srcTemp + ' °C';
    });

    // Observation timer
    setInterval(updateObservations, 500);

    /* ── Start ────────────────────────────────────────────────── */
    requestAnimationFrame(draw);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', resize);
      delete window._htMode;
      delete window._htToggleHeat;
      delete window._htCool;
      delete window._htDropBall;
      delete window._htReset;
    };
  };
})();
