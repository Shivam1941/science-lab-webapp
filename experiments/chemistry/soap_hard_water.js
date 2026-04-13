/* Soap Capacity in Hard Water */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['soap_capacity_hard_water'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Soap Hard Water?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Soap Hard Water'], ans: 3, exp: 'The experiment focuses on the specific principles of Soap Hard Water.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Soap Hard Water experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let waterType = 'soft'; // soft or hard
    let shakeCount = 0;
    let animFrame, canvas, ctx;
    let foamParticles = [];
    let scumParticles = [];
    let shaking = false;
    let time = 0;

    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap"><canvas id="soap-canvas" width="800" height="400"></canvas></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">🫧</span> Controls</div>
            <div class="sim-btn-group" style="margin-bottom:12px;">
              <button class="sim-btn btn-primary" id="soap-soft" onclick="window._setSoapWater('soft')">💧 Soft Water</button>
              <button class="sim-btn" id="soap-hard" onclick="window._setSoapWater('hard')">🪨 Hard Water</button>
            </div>
            <button class="sim-btn" style="width:100%;margin-bottom:8px;" onclick="window._shakeSoapTube()">🤝 Shake Test Tube</button>
            <button class="sim-btn" style="width:100%;" onclick="window._resetSoap()">↺ Reset</button>
            <div style="margin-top:12px;padding:10px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid var(--border-glass);">
              <p style="font-size:12px;color:var(--text-muted);">Shake count: <strong style="color:var(--text-primary)" id="soap-shake-count">0</strong> / 20</p>
            </div>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Observations</div>
            <div class="sim-result-row"><span class="sim-result-label">Water Type</span><span class="sim-result-value" id="soap-type" style="color:#3b82f6">Soft (Distilled)</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Foam Level</span><span class="sim-result-value" id="soap-foam" style="color:#22c55e">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Scum Formed</span><span class="sim-result-value" id="soap-scum" style="color:#ef4444">No</span></div>
            <div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid var(--border-glass);">
              <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;" id="soap-obs">Add soap solution and shake to observe foaming behaviour.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('soap-canvas');
    ctx = canvas.getContext('2d');

    window._setSoapWater = (type) => {
      waterType = type;
      shakeCount = 0;
      foamParticles = [];
      scumParticles = [];
      document.getElementById('soap-soft').className = type === 'soft' ? 'sim-btn btn-primary' : 'sim-btn';
      document.getElementById('soap-hard').className = type === 'hard' ? 'sim-btn btn-primary' : 'sim-btn';
      document.getElementById('soap-type').textContent = type === 'soft' ? 'Soft (Distilled)' : 'Hard (CaCl₂)';
      document.getElementById('soap-type').style.color = type === 'soft' ? '#3b82f6' : '#f59e0b';
      document.getElementById('soap-shake-count').textContent = '0';
      document.getElementById('soap-foam').textContent = '—';
      document.getElementById('soap-scum').textContent = 'No';
    };

    window._shakeSoapTube = () => {
      if (shakeCount >= 20) return;
      shakeCount++;
      shaking = true;
      setTimeout(() => shaking = false, 300);
      document.getElementById('soap-shake-count').textContent = shakeCount;

      // Generate foam or scum
      if (waterType === 'soft') {
        for (let i = 0; i < 5; i++) {
          foamParticles.push({ x: 0.4 + Math.random() * 0.2, y: 0.25 + Math.random() * 0.1, r: 3 + Math.random() * 5, opacity: 0.8 });
        }
        document.getElementById('soap-foam').textContent = shakeCount < 5 ? 'Low' : shakeCount < 12 ? 'Medium' : 'High ✓';
        document.getElementById('soap-obs').textContent = 'Abundant, persistent lather forms in soft water. Soap reacts fully for cleaning.';
      } else {
        for (let i = 0; i < 2; i++) {
          foamParticles.push({ x: 0.4 + Math.random() * 0.2, y: 0.28 + Math.random() * 0.05, r: 2 + Math.random() * 3, opacity: 0.5 });
        }
        for (let i = 0; i < 3; i++) {
          scumParticles.push({ x: 0.38 + Math.random() * 0.24, y: 0.33 + Math.random() * 0.05, r: 2 + Math.random() * 4, opacity: 0.7 });
        }
        document.getElementById('soap-foam').textContent = 'Very Low';
        document.getElementById('soap-scum').textContent = 'Yes — white scum';
        document.getElementById('soap-scum').style.color = '#ef4444';
        document.getElementById('soap-obs').textContent = 'Soap reacts with Ca²⁺ ions to form insoluble white scum. Very little lather. Poor cleaning ability.';
      }
    };

    window._resetSoap = () => {
      shakeCount = 0;
      foamParticles = [];
      scumParticles = [];
      document.getElementById('soap-shake-count').textContent = '0';
      document.getElementById('soap-foam').textContent = '—';
      document.getElementById('soap-scum').textContent = 'No';
      document.getElementById('soap-scum').style.color = '#ef4444';
      document.getElementById('soap-obs').textContent = 'Add soap solution and shake to observe foaming behaviour.';
    };

    function draw() {
      const w = canvas.width, h = canvas.height;
      time += 0.02;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      const tubeX = w * 0.5 - 40, tubeY = h * 0.1, tubeW = 80, tubeH = 300;
      const shakeOffset = shaking ? Math.sin(time * 40) * 5 : 0;

      ctx.save();
      ctx.translate(shakeOffset, 0);

      // Test tube
      ctx.strokeStyle = 'rgba(148,163,184,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tubeX, tubeY);
      ctx.lineTo(tubeX, tubeY + tubeH - 20);
      ctx.arc(tubeX + tubeW / 2, tubeY + tubeH - 20, tubeW / 2, Math.PI, 0, true);
      ctx.lineTo(tubeX + tubeW, tubeY);
      ctx.stroke();

      // Water
      const waterColor = waterType === 'soft' ? 'rgba(59,130,246,0.15)' : 'rgba(200,190,170,0.2)';
      ctx.fillStyle = waterColor;
      const waterTop = tubeY + tubeH * 0.3;
      ctx.beginPath();
      ctx.moveTo(tubeX + 3, waterTop);
      ctx.lineTo(tubeX + 3, tubeY + tubeH - 20);
      ctx.arc(tubeX + tubeW / 2, tubeY + tubeH - 20, tubeW / 2 - 3, Math.PI, 0, true);
      ctx.lineTo(tubeX + tubeW - 3, waterTop);
      ctx.closePath();
      ctx.fill();

      // Foam particles
      for (const f of foamParticles) {
        ctx.beginPath();
        ctx.arc(w * f.x, h * f.y + Math.sin(time + f.x * 10) * 2, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.opacity * 0.5})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${f.opacity * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Scum particles
      for (const s of scumParticles) {
        ctx.beginPath();
        ctx.arc(w * s.x, h * s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,190,170,${s.opacity * 0.6})`;
        ctx.fill();
      }

      ctx.restore();

      // Labels
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(waterType === 'soft' ? 'Soft Water + Soap' : 'Hard Water + Soap', w / 2, h - 15);
      if (foamParticles.length > 0) {
        ctx.fillStyle = waterType === 'soft' ? '#22c55e' : '#f59e0b';
        ctx.font = '11px Inter';
        ctx.fillText(waterType === 'soft' ? '↑ Rich foam' : '↑ Scum layer', w / 2, h * 0.18);
      }
      ctx.textAlign = 'start';

      animFrame = requestAnimationFrame(draw);
    }
    draw();

    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
      delete window._setSoapWater;
      delete window._shakeSoapTube;
      delete window._resetSoap;
    };
  };
})();
