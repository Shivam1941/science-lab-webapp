/* ============================================================
   PULSE / WAVE VELOCITY — Transverse & Longitudinal Waves
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['pulse_velocity_experiment'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Pulse Velocity?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Pulse Velocity'], ans: 3, exp: 'The experiment focuses on the specific principles of Pulse Velocity.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Pulse Velocity experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let frequency = 2;      // Hz
    let amplitude = 40;     // px
    let wavelength = 200;   // px
    let waveType = 'transverse'; // transverse or longitudinal
    let running = true;
    let animFrame, canvas, ctx;
    let time = 0;

    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap"><canvas id="wave-canvas" width="800" height="350"></canvas></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">🌊</span> Wave Controls</div>
            <div class="sim-control-row">
              <span class="sim-control-label">Frequency (Hz)</span>
              <input type="range" class="sim-control-slider" id="wave-freq" min="0.5" max="5" step="0.1" value="${frequency}" />
              <span class="sim-control-value" id="wave-freq-val">${frequency} Hz</span>
            </div>
            <div class="sim-control-row">
              <span class="sim-control-label">Amplitude</span>
              <input type="range" class="sim-control-slider" id="wave-amp" min="10" max="80" step="1" value="${amplitude}" />
              <span class="sim-control-value" id="wave-amp-val">${amplitude} px</span>
            </div>
            <div class="sim-control-row">
              <span class="sim-control-label">Wavelength (λ)</span>
              <input type="range" class="sim-control-slider" id="wave-wl" min="60" max="400" step="5" value="${wavelength}" />
              <span class="sim-control-value" id="wave-wl-val">${wavelength} px</span>
            </div>
            <div style="display:flex;gap:8px;margin-top:10px;">
              <button class="sim-btn btn-primary" id="wave-trans-btn" onclick="window._waveSetType('transverse')">Transverse</button>
              <button class="sim-btn" id="wave-long-btn" onclick="window._waveSetType('longitudinal')">Longitudinal</button>
              <button class="sim-btn" onclick="window._waveToggle()" id="wave-pause-btn">⏸ Pause</button>
            </div>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(VIVA_QUESTIONS)">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Wave Properties</div>
            <div class="sim-result-row"><span class="sim-result-label">Velocity (v = fλ)</span><span class="sim-result-value" id="wave-v" style="color:#3b82f6">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Time Period (T = 1/f)</span><span class="sim-result-value" id="wave-t" style="color:#22c55e">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Frequency (f)</span><span class="sim-result-value" id="wave-f" style="color:#f59e0b">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Wavelength (λ)</span><span class="sim-result-value" id="wave-wlr" style="color:#8b5cf6">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Amplitude (A)</span><span class="sim-result-value" id="wave-ar" style="color:#14b8a6">—</span></div>
            <div style="margin-top:12px;padding:10px;background:rgba(14,165,233,0.06);border-radius:8px;border:1px solid rgba(14,165,233,0.15);">
              <p style="font-size:11px;color:var(--text-muted);line-height:1.5;"><strong>v = f × λ</strong><br/>Transverse: particles oscillate ⊥ to wave direction.<br/>Longitudinal: particles oscillate ∥ to wave direction.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('wave-canvas');
    ctx = canvas.getContext('2d');

    document.getElementById('wave-freq').addEventListener('input', e => {
      frequency = parseFloat(e.target.value);
      document.getElementById('wave-freq-val').textContent = frequency.toFixed(1) + ' Hz';
    });
    document.getElementById('wave-amp').addEventListener('input', e => {
      amplitude = parseInt(e.target.value);
      document.getElementById('wave-amp-val').textContent = amplitude + ' px';
    });
    document.getElementById('wave-wl').addEventListener('input', e => {
      wavelength = parseInt(e.target.value);
      document.getElementById('wave-wl-val').textContent = wavelength + ' px';
    });

    window._waveSetType = function(type) {
      waveType = type;
      document.getElementById('wave-trans-btn').classList.toggle('btn-primary', type === 'transverse');
      document.getElementById('wave-long-btn').classList.toggle('btn-primary', type === 'longitudinal');
    };
    window._waveToggle = function() {
      running = !running;
      document.getElementById('wave-pause-btn').textContent = running ? '⏸ Pause' : '▶ Play';
    };

    function draw() {
      const w = canvas.width, h = canvas.height;
      if (running) time += 0.016;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, w, h);

      const midY = h / 2;
      const midX = 40;
      const waveW = w - 80;

      // Equilibrium line
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(midX + waveW, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      const omega = 2 * Math.PI * frequency;
      const k = 2 * Math.PI / wavelength;
      const numParticles = 80;
      const spacing = waveW / numParticles;

      if (waveType === 'transverse') {
        // Draw wave curve
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let i = 0; i <= waveW; i++) {
          const x = midX + i;
          const y = midY + amplitude * Math.sin(k * i - omega * time);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Particles
        for (let i = 0; i < numParticles; i++) {
          const px = midX + i * spacing;
          const py = midY + amplitude * Math.sin(k * (i * spacing) - omega * time);
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#60a5fa';
          ctx.fill();

          // Vertical velocity indicator
          const vy = amplitude * omega * Math.cos(k * (i * spacing) - omega * time);
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, midY);
          ctx.lineTo(px, py);
          ctx.stroke();
        }

        // Wavelength annotation
        const annotY = midY - amplitude - 20;
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 1.5;
        const phase1 = (-omega * time % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const x1 = midX + phase1 / k;
        const x2 = x1 + wavelength;
        if (x1 > midX && x2 < midX + waveW) {
          ctx.beginPath(); ctx.moveTo(x1, annotY); ctx.lineTo(x2, annotY); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x1, annotY - 6); ctx.lineTo(x1, annotY + 6); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x2, annotY - 6); ctx.lineTo(x2, annotY + 6); ctx.stroke();
          ctx.fillStyle = '#8b5cf6';
          ctx.font = 'bold 11px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('λ', (x1 + x2) / 2, annotY - 6);
        }

        // Amplitude annotation
        ctx.strokeStyle = '#14b8a6';
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(midX + 20, midY); ctx.lineTo(midX + 20, midY - amplitude); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#14b8a6';
        ctx.font = '10px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('A', midX + 24, midY - amplitude / 2);

      } else {
        // Longitudinal wave
        for (let i = 0; i < numParticles; i++) {
          const restX = midX + i * spacing;
          const displacement = amplitude * 0.6 * Math.sin(k * (i * spacing) - omega * time);
          const px = restX + displacement;

          // Color based on compression/rarefaction
          const density = -amplitude * k * Math.cos(k * (i * spacing) - omega * time);
          const compressed = density > 0;
          ctx.beginPath();
          ctx.arc(px, midY, compressed ? 4 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = compressed ? '#ef4444' : '#3b82f6';
          ctx.fill();

          // Draw spring-like connections
          if (i > 0) {
            const prevX = midX + (i - 1) * spacing + amplitude * 0.6 * Math.sin(k * ((i - 1) * spacing) - omega * time);
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(prevX, midY); ctx.lineTo(px, midY); ctx.stroke();
          }
        }

        // Labels
        ctx.fillStyle = 'rgba(239,68,68,0.5)';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Compression', w / 2, midY + 60);
        ctx.fillStyle = 'rgba(59,130,246,0.5)';
        ctx.fillText('Rarefaction', w / 2 + wavelength / 4, midY + 75);
      }

      // Direction arrow
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('→ Wave propagation direction →', w / 2, h - 15);

      // Legend
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(waveType === 'transverse' ? 'Transverse Wave' : 'Longitudinal Wave', midX, 25);

      // Update readouts
      const velocity = frequency * wavelength;
      const period = 1 / frequency;
      document.getElementById('wave-v').textContent = velocity.toFixed(1) + ' px/s';
      document.getElementById('wave-t').textContent = period.toFixed(3) + ' s';
      document.getElementById('wave-f').textContent = frequency.toFixed(1) + ' Hz';
      document.getElementById('wave-wlr').textContent = wavelength + ' px';
      document.getElementById('wave-ar').textContent = amplitude + ' px';

      animFrame = requestAnimationFrame(draw);
    }
    draw();

    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
      delete window._waveSetType;
      delete window._waveToggle;
    };
  };
})();
