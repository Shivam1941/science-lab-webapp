/* Asexual Reproduction Slide Viewer */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['asexual_reproduction'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Asexual Reproduction?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Asexual Reproduction'], ans: 3, exp: 'The experiment focuses on the specific principles of Asexual Reproduction.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Asexual Reproduction experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let selected = 0, animFrame, canvas, ctx, time = 0;
    const modes = [
      { name:'Binary Fission (Amoeba)', desc:'The parent cell divides into two equal daughter cells. The nucleus divides first (karyokinesis), followed by cytoplasm (cytokinesis). Common in unicellular organisms.', color:'#8b5cf6' },
      { name:'Budding (Hydra)', desc:'A small outgrowth (bud) develops on the parent body. It grows, develops tentacles, and eventually detaches as a new organism. Common in Hydra and Yeast.', color:'#22c55e' },
      { name:'Spore Formation (Rhizopus)', desc:'The fungus produces a sporangium filled with spores. When mature, the sporangium bursts, releasing spores that germinate into new organisms in favorable conditions.', color:'#f59e0b' },
    ];
    container.innerHTML = `
      <div class="sim-container">
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;">
          <div class="sim-canvas-wrap"><canvas id="asexual-canvas" width="600" height="450"></canvas></div>
          <div>
            <div class="sim-controls" style="margin-bottom:12px;">
              <div class="sim-controls-title"><span class="ctrl-icon">🧬</span> Mode of Reproduction</div>
              ${modes.map((m, i) => `
                <div id="asex-${i}" onclick="window._selectAsexMode(${i})" style="padding:10px 14px;margin-bottom:4px;border-radius:8px;cursor:pointer;border:1px solid ${i === 0 ? 'var(--border-glass-hover)' : 'transparent'};background:${i === 0 ? 'rgba(255,255,255,0.04)' : 'transparent'};transition:all 0.2s;">
                  <div style="font-size:13px;font-weight:600;color:${m.color};">${m.name}</div>
                </div>
              `).join('')}
            </div>
            <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Start Viva</button>

              <div class="sim-results-title"><span class="ctrl-icon">📋</span> Description</div>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;" id="asex-desc">${modes[0].desc}</p>
            </div>
          </div>
        </div>
      </div>
    `;
    canvas = document.getElementById('asexual-canvas');
    ctx = canvas.getContext('2d');
    window._selectAsexMode = (idx) => {
      selected = idx; time = 0;
      modes.forEach((_, i) => {
        const el = document.getElementById(`asex-${i}`);
        el.style.borderColor = i === idx ? modes[i].color : 'transparent';
        el.style.background = i === idx ? 'rgba(255,255,255,0.04)' : 'transparent';
      });
      document.getElementById('asex-desc').textContent = modes[idx].desc;
    };
    function draw() {
      const w = canvas.width, h = canvas.height;
      time += 0.01;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      if (selected === 0) drawBinaryFission(cx, cy, w, h);
      else if (selected === 1) drawBudding(cx, cy, w, h);
      else drawSporeFormation(cx, cy, w, h);
      animFrame = requestAnimationFrame(draw);
    }
    function drawBinaryFission(cx, cy, w, h) {
      const phase = (time % 4) / 4; // 0..1 cycle
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      if (phase < 0.3) {
        // Parent amoeba
        ctx.beginPath(); ctx.ellipse(cx, cy, 70, 55, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139,92,246,0.3)'; ctx.fill();
        ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139,92,246,0.6)'; ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillText('Parent Amoeba', cx, cy + 80);
      } else if (phase < 0.6) {
        // Constricting
        const squeeze = (phase - 0.3) / 0.3;
        ctx.beginPath(); ctx.ellipse(cx, cy, 70 + squeeze * 20, 55 - squeeze * 15, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139,92,246,0.3)'; ctx.fill();
        ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2; ctx.stroke();
        // Two nuclei
        ctx.beginPath(); ctx.arc(cx - 30 * squeeze, cy, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139,92,246,0.6)'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 30 * squeeze, cy, 15, 0, Math.PI * 2);
        ctx.fill();
        // Constriction line
        ctx.strokeStyle = 'rgba(139,92,246,0.5)';
        ctx.beginPath(); ctx.moveTo(cx, cy - 40 + squeeze * 20); ctx.lineTo(cx, cy + 40 - squeeze * 20); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillText('Nucleus dividing... Constriction forming', cx, cy + 80);
      } else {
        // Two daughter cells
        const sep = (phase - 0.6) / 0.4;
        const dist = 40 + sep * 40;
        [cx - dist, cx + dist].forEach(x => {
          ctx.beginPath(); ctx.ellipse(x, cy, 45, 40, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(139,92,246,0.25)'; ctx.fill();
          ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2; ctx.stroke();
          ctx.beginPath(); ctx.arc(x, cy, 12, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(139,92,246,0.6)'; ctx.fill();
        });
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillText('Two Daughter Cells (identical)', cx, cy + 80);
      }
      ctx.textAlign = 'start';
    }
    function drawBudding(cx, cy, w, h) {
      const phase = (time % 5) / 5;
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      // Parent hydra body (elongated)
      ctx.fillStyle = 'rgba(34,197,94,0.25)';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, cy, 35, 80, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Tentacles
      [[-30, -75], [-15, -85], [0, -90], [15, -85], [30, -75]].forEach(([ox, oy]) => {
        ctx.beginPath(); ctx.moveTo(cx + ox * 0.5, cy - 80);
        ctx.quadraticCurveTo(cx + ox, cy + oy, cx + ox * 1.3, cy + oy - 10);
        ctx.strokeStyle = 'rgba(34,197,94,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
      });
      // Bud
      if (phase > 0.2) {
        const budSize = Math.min((phase - 0.2) / 0.5, 1);
        const budX = cx + 35, budY = cy + 10;
        ctx.fillStyle = 'rgba(34,197,94,0.3)';
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(budX + budSize * 20, budY, 15 * budSize, 30 * budSize, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        if (budSize > 0.5) {
          // Bud tentacles
          [[-8, -20], [0, -25], [8, -20]].forEach(([ox, oy]) => {
            ctx.beginPath();
            ctx.moveTo(budX + budSize * 20 + ox * 0.3, budY - 30 * budSize);
            ctx.lineTo(budX + budSize * 20 + ox * budSize, budY + oy * budSize);
            ctx.strokeStyle = 'rgba(34,197,94,0.4)'; ctx.lineWidth = 1; ctx.stroke();
          });
        }
      }
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText(phase < 0.2 ? 'Parent Hydra' : phase < 0.7 ? 'Bud developing...' : 'Bud ready to detach', cx, cy + 110);
      ctx.textAlign = 'start';
    }
    function drawSporeFormation(cx, cy, w, h) {
      const phase = (time % 4) / 4;
      ctx.textAlign = 'center';
      // Hypha/stalk
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 100);
      ctx.lineTo(cx, cy - 20);
      ctx.stroke();
      // Sporangium
      if (phase < 0.6) {
        ctx.beginPath(); ctx.arc(cx, cy - 40, 30, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245,158,11,0.3)'; ctx.fill();
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.stroke();
        // Spores inside
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * 15, cy - 40 + Math.sin(angle) * 15, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(245,158,11,0.6)'; ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '12px Inter';
        ctx.fillText('Sporangium with spores', cx, cy + 130);
      } else {
        // Burst — spores dispersing
        const spread = (phase - 0.6) / 0.4;
        ctx.beginPath(); ctx.arc(cx, cy - 40, 30, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,158,11,${0.2 * (1 - spread)})`; ctx.fill();
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const dist = 20 + spread * 80;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * dist, cy - 40 + Math.sin(angle) * dist, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245,158,11,${0.8 * (1 - spread * 0.5)})`; ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '12px Inter';
        ctx.fillText('Spores dispersing!', cx, cy + 130);
      }
      // Rhizoids at base
      ctx.strokeStyle = 'rgba(120,113,108,0.5)';
      ctx.lineWidth = 1.5;
      [[-20, 15], [-10, 20], [0, 22], [10, 20], [20, 15]].forEach(([ox, oy]) => {
        ctx.beginPath(); ctx.moveTo(cx, cy + 100); ctx.lineTo(cx + ox, cy + 100 + oy); ctx.stroke();
      });
      ctx.textAlign = 'start';
    }
    draw();
    return function cleanup() { if (animFrame) cancelAnimationFrame(animFrame); delete window._selectAsexMode; };
  };
})();
