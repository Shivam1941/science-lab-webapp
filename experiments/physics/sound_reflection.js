/* ============================================================
   SOUND REFLECTION WORKSTATION — Echo & Distance
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['sound_reflection_workstation'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Sound Reflection?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Sound Reflection'], ans: 3, exp: 'The experiment focuses on the specific principles of Sound Reflection.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Sound Reflection experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let wallDistance = 200;   // meters
    let temperature = 25;    // °C
    let surfaceType = 0;     // 0=concrete, 1=wood, 2=glass, 3=curtain
    let animFrame, canvas, ctx;
    let time = 0;
    let pulseActive = false;
    let pulseTime = 0;
    let pulses = [];

    const surfaces = [
      { name: 'Concrete Wall', absorption: 0.05, color: '#64748b' },
      { name: 'Wooden Panel', absorption: 0.15, color: '#a16207' },
      { name: 'Glass Window', absorption: 0.08, color: '#3b82f6' },
      { name: 'Heavy Curtain', absorption: 0.60, color: '#7c3aed' },
    ];

    function speedOfSound(tempC) {
      return 331.4 + 0.6 * tempC; // m/s
    }

    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap"><canvas id="sound-canvas" width="800" height="380"></canvas></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">🔊</span> Controls</div>
            <div class="sim-control-row">
              <span class="sim-control-label">Wall Distance (m)</span>
              <input type="range" class="sim-control-slider" id="sound-dist" min="17" max="500" step="1" value="${wallDistance}" />
              <span class="sim-control-value" id="sound-dist-val">${wallDistance} m</span>
            </div>
            <div class="sim-control-row">
              <span class="sim-control-label">Temperature (°C)</span>
              <input type="range" class="sim-control-slider" id="sound-temp" min="-20" max="50" step="1" value="${temperature}" />
              <span class="sim-control-value" id="sound-temp-val">${temperature}°C</span>
            </div>
            <div style="margin-top:8px;">
              <span style="font-size:13px;color:var(--text-secondary);font-weight:500;">Reflecting Surface</span>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
                ${surfaces.map((s, i) => `
                  <button class="sim-btn surface-btn ${i === 0 ? 'btn-primary' : ''}" id="surf-${i}" onclick="window._soundSetSurface(${i})">${s.name}</button>
                `).join('')}
              </div>
            </div>
            <button class="sim-btn btn-primary" style="width:100%;margin-top:12px;" onclick="window._soundPulse()">🔔 Send Sound Pulse</button>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Echo Data</div>
            <div class="sim-result-row"><span class="sim-result-label">Speed of Sound (v)</span><span class="sim-result-value" id="sound-v" style="color:#3b82f6">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Echo Time (2d/v)</span><span class="sim-result-value" id="sound-echo" style="color:#22c55e">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Echo Heard?</span><span class="sim-result-value" id="sound-heard" style="color:#f59e0b">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Absorption</span><span class="sim-result-value" id="sound-abs" style="color:#8b5cf6">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Reflected Intensity</span><span class="sim-result-value" id="sound-int" style="color:#14b8a6">—</span></div>
            <div style="margin-top:12px;padding:10px;background:rgba(124,58,237,0.06);border-radius:8px;border:1px solid rgba(124,58,237,0.15);">
              <p style="font-size:11px;color:var(--text-muted);line-height:1.5;"><strong>Echo condition:</strong> t ≥ 0.1s (persistence of hearing)<br/>v = 331.4 + 0.6T m/s<br/>Min distance for echo: d ≥ v × 0.1 / 2 ≈ 17 m</p>
            </div>
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('sound-canvas');
    ctx = canvas.getContext('2d');

    document.getElementById('sound-dist').addEventListener('input', e => {
      wallDistance = parseInt(e.target.value);
      document.getElementById('sound-dist-val').textContent = wallDistance + ' m';
    });
    document.getElementById('sound-temp').addEventListener('input', e => {
      temperature = parseInt(e.target.value);
      document.getElementById('sound-temp-val').textContent = temperature + '°C';
    });

    window._soundSetSurface = function(idx) {
      surfaceType = idx;
      document.querySelectorAll('.surface-btn').forEach((b, i) => {
        b.classList.toggle('btn-primary', i === idx);
      });
    };

    window._soundPulse = function() {
      pulses.push({ time: 0, reflected: false, done: false });
    };

    function draw() {
      const w = canvas.width, h = canvas.height;
      time += 0.016;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, w, h);

      const v = speedOfSound(temperature);
      const echoTime = (2 * wallDistance) / v;
      const canHear = echoTime >= 0.1;
      const absorption = surfaces[surfaceType].absorption;
      const reflectedIntensity = ((1 - absorption) * 100).toFixed(1);

      // Ground
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(0, h - 40, w, 40);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.moveTo(0, h - 40);
      ctx.lineTo(w, h - 40);
      ctx.stroke();

      // Person (left side)
      const personX = 60, personY = h - 100;
      // Head
      ctx.beginPath();
      ctx.arc(personX, personY - 40, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      // Body
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(personX, personY - 26);
      ctx.lineTo(personX, personY + 10);
      ctx.stroke();
      // Arms
      ctx.beginPath();
      ctx.moveTo(personX - 16, personY - 12);
      ctx.lineTo(personX + 16, personY - 12);
      ctx.stroke();
      // Legs
      ctx.beginPath();
      ctx.moveTo(personX, personY + 10);
      ctx.lineTo(personX - 10, personY + 35);
      ctx.moveTo(personX, personY + 10);
      ctx.lineTo(personX + 10, personY + 35);
      ctx.stroke();

      // Speaker/mouth icon
      ctx.fillStyle = '#f59e0b';
      ctx.font = '20px sans-serif';
      ctx.fillText('📢', personX + 18, personY - 30);

      // Wall (right side)
      const wallX = w - 80;
      const wallColor = surfaces[surfaceType].color;
      ctx.fillStyle = wallColor;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(wallX, h - 240, 30, 200);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = wallColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(wallX, h - 240);
      ctx.lineTo(wallX, h - 40);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(surfaces[surfaceType].name, wallX + 15, h - 250);

      // Distance label
      const distY = h - 20;
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(personX, distY); ctx.lineTo(wallX, distY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(personX, distY - 5); ctx.lineTo(personX, distY + 5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wallX, distY - 5); ctx.lineTo(wallX, distY + 5); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 12px Inter';
      ctx.fillText(`d = ${wallDistance} m`, (personX + wallX) / 2, distY - 6);

      // Sound wave pulses
      const maxDist = wallX - personX - 30;
      const scaledSpeed = maxDist / echoTime; // px per second

      pulses.forEach(pulse => {
        pulse.time += 0.016;
        const travelTime = pulse.time;
        let px;

        if (!pulse.reflected) {
          px = personX + 30 + travelTime * scaledSpeed;
          if (px >= wallX - 5) {
            pulse.reflected = true;
            pulse.time = 0;
          }
        } else {
          px = wallX - 5 - pulse.time * scaledSpeed * (1 - absorption);
          if (px <= personX + 30) {
            pulse.done = true;
          }
        }

        if (!pulse.done) {
          // Draw expanding sound arcs
          const arcR = 10 + (pulse.time * 60) % 30;
          const opacity = pulse.reflected ? 0.3 * (1 - absorption) : 0.4;
          ctx.strokeStyle = pulse.reflected ? `rgba(34,197,94,${opacity})` : `rgba(59,130,246,${opacity})`;
          ctx.lineWidth = 2;
          for (let a = 0; a < 3; a++) {
            const r = arcR + a * 15;
            ctx.beginPath();
            if (!pulse.reflected) {
              ctx.arc(px, h - 140, r, -0.6, 0.6);
            } else {
              ctx.arc(px, h - 140, r, Math.PI - 0.6, Math.PI + 0.6);
            }
            ctx.stroke();
          }
        }
      });
      pulses = pulses.filter(p => !p.done);

      // Ambient sound wave decoration
      for (let i = 0; i < 3; i++) {
        const aX = personX + 30;
        const aR = 20 + ((time * 40 + i * 25) % 80);
        ctx.strokeStyle = `rgba(245,158,11,${0.1 - aR * 0.001})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(aX, h - 140, aR, -0.4, 0.4);
        ctx.stroke();
      }

      // Update readouts
      document.getElementById('sound-v').textContent = v.toFixed(1) + ' m/s';
      document.getElementById('sound-echo').textContent = echoTime.toFixed(4) + ' s';
      document.getElementById('sound-heard').textContent = canHear ? '✅ Yes (t ≥ 0.1s)' : '❌ No (t < 0.1s)';
      document.getElementById('sound-heard').style.color = canHear ? '#22c55e' : '#ef4444';
      document.getElementById('sound-abs').textContent = (absorption * 100).toFixed(0) + '%';
      document.getElementById('sound-int').textContent = reflectedIntensity + '%';

      ctx.textAlign = 'start';
      animFrame = requestAnimationFrame(draw);
    }
    draw();

    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
      delete window._soundSetSurface;
      delete window._soundPulse;
    };
  };
})();
