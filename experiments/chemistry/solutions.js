/* ============================================================
   SOLUTIONS, COLLOIDS & SUSPENSIONS — Tyndall Effect Simulation
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};

  window.experimentRenderers['solutions_colloids_suspensions'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Solutions?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Solutions'], ans: 3, exp: 'The experiment focuses on the specific principles of Solutions.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Solutions experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    const types = [
      { id:'solution', name:'True Solution (Salt + Water)', particleSize:'< 1 nm', tyndall:false, settles:false, filters:false, transparency:0.95, color:'rgba(200,220,255,0.15)', particles:[], desc:'Particles are molecular-level. Completely transparent. No Tyndall effect.' },
      { id:'colloid', name:'Colloidal Solution (Starch + Water)', particleSize:'1-100 nm', tyndall:true, settles:false, filters:false, transparency:0.6, color:'rgba(255,255,240,0.35)', particles:[], desc:'Particles scatter light (Tyndall effect). Does not settle. Cannot be filtered.' },
      { id:'suspension', name:'Suspension (Chalk + Water)', particleSize:'> 100 nm', tyndall:true, settles:true, filters:true, transparency:0.25, color:'rgba(200,190,170,0.55)', particles:[], desc:'Particles are large and visible. Settles on standing. Can be filtered.' },
    ];
    let selectedType = 0;
    let laserOn = false;
    let animFrame = null;
    let canvas, ctx;
    let time = 0;

    // Generate particles for each type
    types[1].particles = Array.from({length: 60}, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random()-0.5)*0.001, vy: (Math.random()-0.5)*0.001, r: 1.5+Math.random()*2 }));
    types[2].particles = Array.from({length: 25}, () => ({ x: Math.random(), y: 0.3+Math.random()*0.7, vx: (Math.random()-0.5)*0.0005, vy: 0.0005+Math.random()*0.001, r: 3+Math.random()*4 }));

    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap">
          <canvas id="sol-canvas" width="800" height="400"></canvas>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">💧</span> Select Mixture</div>
            ${types.map((t, i) => `
              <div id="sol-type-${i}" onclick="window._selectSolType(${i})" style="padding:10px 14px;margin-bottom:6px;border-radius:8px;cursor:pointer;border:1px solid ${i === 0 ? 'var(--border-glass-hover)' : 'transparent'};background:${i === 0 ? 'rgba(255,255,255,0.04)' : 'transparent'};transition:all 0.2s;">
                <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${t.name}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Particle size: ${t.particleSize}</div>
              </div>
            `).join('')}
            <button class="sim-btn" id="sol-laser-btn" style="margin-top:12px;width:100%;" onclick="window._toggleSolLaser()">🔦 Toggle Laser Beam</button>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Properties</div>
            <div class="sim-result-row"><span class="sim-result-label">Tyndall Effect</span><span class="sim-result-value" id="sol-tyndall" style="color:#ef4444">No</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Settles on Standing</span><span class="sim-result-value" id="sol-settles" style="color:#ef4444">No</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Filterable</span><span class="sim-result-value" id="sol-filters" style="color:#ef4444">No</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Transparency</span><span class="sim-result-value" id="sol-trans" style="color:#3b82f6">High</span></div>
            <div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid var(--border-glass);">
              <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;" id="sol-desc">${types[0].desc}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('sol-canvas');
    ctx = canvas.getContext('2d');

    window._selectSolType = (idx) => {
      selectedType = idx;
      types.forEach((_, i) => {
        const el = document.getElementById(`sol-type-${i}`);
        el.style.borderColor = i === idx ? 'var(--border-glass-hover)' : 'transparent';
        el.style.background = i === idx ? 'rgba(255,255,255,0.04)' : 'transparent';
      });
      const t = types[idx];
      document.getElementById('sol-tyndall').textContent = t.tyndall ? 'Yes ✓' : 'No';
      document.getElementById('sol-tyndall').style.color = t.tyndall ? '#22c55e' : '#ef4444';
      document.getElementById('sol-settles').textContent = t.settles ? 'Yes ✓' : 'No';
      document.getElementById('sol-settles').style.color = t.settles ? '#22c55e' : '#ef4444';
      document.getElementById('sol-filters').textContent = t.filters ? 'Yes ✓' : 'No';
      document.getElementById('sol-filters').style.color = t.filters ? '#22c55e' : '#ef4444';
      const trans = t.transparency > 0.7 ? 'High' : t.transparency > 0.4 ? 'Medium' : 'Low';
      document.getElementById('sol-trans').textContent = trans;
      document.getElementById('sol-desc').textContent = t.desc;
    };
    window._selectSolType(0); // init

    window._toggleSolLaser = () => {
      laserOn = !laserOn;
      document.getElementById('sol-laser-btn').textContent = laserOn ? '🔦 Laser ON' : '🔦 Toggle Laser Beam';
      document.getElementById('sol-laser-btn').style.borderColor = laserOn ? '#ef4444' : 'var(--border-glass)';
    };

    function draw() {
      const w = canvas.width, h = canvas.height;
      time += 0.016;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      const t = types[selectedType];
      const bx = w * 0.2, by = h * 0.15, bw = w * 0.6, bh = h * 0.65;

      // Beaker
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);
      // Beaker rim
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.beginPath();
      ctx.moveTo(bx - 8, by);
      ctx.lineTo(bx + bw + 8, by);
      ctx.stroke();

      // Liquid fill
      const liquidY = by + bh * 0.1;
      const liquidH = bh * 0.85;
      ctx.fillStyle = t.color;
      ctx.fillRect(bx + 2, liquidY, bw - 4, liquidH);

      // Particles
      for (const p of t.particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0.1 || p.y > 0.95) p.vy *= -1;
        p.x = Math.max(0, Math.min(1, p.x));
        p.y = Math.max(0.1, Math.min(0.95, p.y));

        ctx.beginPath();
        ctx.arc(bx + 4 + p.x * (bw - 8), liquidY + p.y * liquidH, p.r, 0, Math.PI * 2);
        ctx.fillStyle = selectedType === 2 ? 'rgba(200,180,150,0.6)' : 'rgba(255,255,255,0.3)';
        ctx.fill();
      }

      // Laser beam
      if (laserOn) {
        const laserY = by + bh * 0.5;

        // Laser source
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(10, laserY - 8, 30, 16);
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.arc(40, laserY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Beam through liquid
        if (t.tyndall) {
          // Tyndall effect — scattered beam visible
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(40, laserY);
          ctx.lineTo(bx, laserY);
          ctx.stroke();

          // Bright scattered beam inside liquid
          const beamGrad = ctx.createLinearGradient(bx, laserY, bx + bw, laserY);
          beamGrad.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
          beamGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.5)');
          beamGrad.addColorStop(1, 'rgba(239, 68, 68, 0.2)');

          for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = beamGrad;
            ctx.lineWidth = 6 - i * 2;
            ctx.globalAlpha = 0.4 + i * 0.2;
            ctx.beginPath();
            ctx.moveTo(bx, laserY);
            ctx.lineTo(bx + bw, laserY);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;

          // Scatter glow
          for (let x = bx + 20; x < bx + bw - 20; x += 30) {
            ctx.beginPath();
            ctx.arc(x, laserY, 12 + Math.sin(time * 3 + x * 0.01) * 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
            ctx.fill();
          }

          // Label
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 13px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('Tyndall Effect Visible ✓', w / 2, by + bh + 30);
        } else {
          // No Tyndall — beam passes through invisible
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(40, laserY);
          ctx.lineTo(w - 30, laserY);
          ctx.stroke();

          // Very faint inside
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.1)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx, laserY);
          ctx.lineTo(bx + bw, laserY);
          ctx.stroke();

          ctx.fillStyle = '#94a3b8';
          ctx.font = '13px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('No scattering — beam passes straight through', w / 2, by + bh + 30);
        }
      }

      // Labels
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(t.name, w / 2, h - 10);
      ctx.textAlign = 'start';

      animFrame = requestAnimationFrame(draw);
    }

    draw();

    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
      delete window._selectSolType;
      delete window._toggleSolLaser;
    };
  };
})();
