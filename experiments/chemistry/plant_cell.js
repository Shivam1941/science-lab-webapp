/* Plant Cell Explorer */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['plant_cell_explorer'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Plant Cell?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Plant Cell'], ans: 3, exp: 'The experiment focuses on the specific principles of Plant Cell.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Plant Cell experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let selectedPart = null;
    let animFrame = null;
    let canvas, ctx;
    let time = 0;
    const parts = [
      { id:'wall', name:'Cell Wall', x:0.5, y:0.12, desc:'Rigid outer layer made of cellulose. Provides structural support and protection. Present only in plant cells.', color:'#22c55e' },
      { id:'membrane', name:'Cell Membrane', x:0.5, y:0.22, desc:'Semi-permeable membrane just inside the cell wall. Controls entry/exit of substances. Made of phospholipid bilayer.', color:'#3b82f6' },
      { id:'nucleus', name:'Nucleus', x:0.38, y:0.4, desc:'Control centre of the cell. Contains DNA (genetic material) organized in chromosomes. Surrounded by nuclear membrane.', color:'#8b5cf6' },
      { id:'vacuole', name:'Central Vacuole', x:0.62, y:0.5, desc:'Large, fluid-filled organelle. Stores water, nutrients, and waste. Maintains turgor pressure. Much larger in plant cells.', color:'#06b6d4' },
      { id:'chloroplast', name:'Chloroplast', x:0.3, y:0.65, desc:'Site of photosynthesis. Contains chlorophyll (green pigment). Converts light energy to chemical energy (glucose).', color:'#84cc16' },
      { id:'cytoplasm', name:'Cytoplasm', x:0.65, y:0.3, desc:'Gel-like substance filling the cell. Contains all organelles. Site of many chemical reactions.', color:'#f59e0b' },
      { id:'er', name:'Endoplasmic Reticulum', x:0.7, y:0.68, desc:'Network of membranes for protein (rough ER) and lipid (smooth ER) synthesis and transport.', color:'#ec4899' },
      { id:'mitochondria', name:'Mitochondria', x:0.25, y:0.52, desc:'Powerhouse of the cell. Site of cellular respiration. Produces ATP (energy currency).', color:'#ef4444' },
    ];
    container.innerHTML = `
      <div class="sim-container">
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;">
          <div class="sim-canvas-wrap"><canvas id="cell-canvas" width="600" height="500"></canvas></div>
          <div>
            <div class="sim-controls" style="margin-bottom:12px;">
              <div class="sim-controls-title"><span class="ctrl-icon">🔬</span> Cell Parts</div>
              ${parts.map((p, i) => `
                <div id="cell-part-${i}" onclick="window._selectCellPart(${i})" style="padding:6px 10px;margin-bottom:3px;border-radius:6px;cursor:pointer;border:1px solid transparent;transition:all 0.2s;display:flex;align-items:center;gap:8px;">
                  <div style="width:8px;height:8px;border-radius:50%;background:${p.color};"></div>
                  <span style="font-size:12px;color:var(--text-secondary);">${p.name}</span>
                </div>
              `).join('')}
            </div>
            <div class="sim-results" id="cell-info" style="min-height:120px;">
              <div class="sim-results-title"><span class="ctrl-icon">📋</span> Details</div>
              <p style="font-size:13px;color:var(--text-muted);" id="cell-desc">Click on a cell part to learn more about it.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    canvas = document.getElementById('cell-canvas');
    ctx = canvas.getContext('2d');
    window._selectCellPart = (idx) => {
      selectedPart = idx;
      parts.forEach((_, i) => {
        const el = document.getElementById(`cell-part-${i}`);
        el.style.borderColor = i === idx ? parts[i].color : 'transparent';
        el.style.background = i === idx ? 'rgba(255,255,255,0.04)' : 'transparent';
      });
      document.getElementById('cell-desc').innerHTML = `<strong style="color:${parts[idx].color}">${parts[idx].name}</strong><br/><span style="color:var(--text-secondary)">${parts[idx].desc}</span>`;
    };
    function draw() {
      const w = canvas.width, h = canvas.height;
      time += 0.02;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, rw = 220, rh = 190;
      // Cell wall
      ctx.strokeStyle = selectedPart === 0 ? '#22c55e' : 'rgba(34, 197, 94, 0.5)';
      ctx.lineWidth = selectedPart === 0 ? 6 : 4;
      ctx.beginPath();
      ctx.roundRect(cx - rw - 10, cy - rh - 10, (rw + 10) * 2, (rh + 10) * 2, 30);
      ctx.stroke();
      // Cell membrane
      ctx.strokeStyle = selectedPart === 1 ? '#3b82f6' : 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = selectedPart === 1 ? 4 : 2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.roundRect(cx - rw, cy - rh, rw * 2, rh * 2, 25);
      ctx.stroke();
      ctx.setLineDash([]);
      // Cytoplasm fill
      ctx.fillStyle = selectedPart === 5 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.05)';
      ctx.beginPath();
      ctx.roundRect(cx - rw + 2, cy - rh + 2, rw * 2 - 4, rh * 2 - 4, 24);
      ctx.fill();
      // Central vacuole
      const vacW = 100 + Math.sin(time) * 3, vacH = 80 + Math.cos(time * 0.8) * 2;
      ctx.fillStyle = selectedPart === 3 ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.12)';
      ctx.strokeStyle = selectedPart === 3 ? '#06b6d4' : 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx + 40, cy + 10, vacW, vacH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Nucleus
      ctx.fillStyle = selectedPart === 2 ? 'rgba(139, 92, 246, 0.35)' : 'rgba(139, 92, 246, 0.15)';
      ctx.strokeStyle = selectedPart === 2 ? '#8b5cf6' : 'rgba(139, 92, 246, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx - 60, cy - 20, 42, 38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Nucleolus
      ctx.beginPath();
      ctx.arc(cx - 60, cy - 20, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
      ctx.fill();
      // Chloroplasts
      const chlPositions = [[-120, 50], [-80, 100], [120, -80], [150, 30], [-140, -50]];
      chlPositions.forEach(([ox, oy], i) => {
        ctx.fillStyle = selectedPart === 4 ? 'rgba(132, 204, 22, 0.5)' : 'rgba(132, 204, 22, 0.2)';
        ctx.strokeStyle = selectedPart === 4 ? '#84cc16' : 'rgba(132, 204, 22, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cx + ox, cy + oy, 18, 10, (i * 0.7), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      // Mitochondria
      const mitPos = [[-130, -10], [100, 110], [-50, 120]];
      mitPos.forEach(([ox, oy]) => {
        ctx.fillStyle = selectedPart === 7 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.15)';
        ctx.strokeStyle = selectedPart === 7 ? '#ef4444' : 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cx + ox, cy + oy, 16, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      // ER
      ctx.strokeStyle = selectedPart === 6 ? '#ec4899' : 'rgba(236, 72, 153, 0.3)';
      ctx.lineWidth = selectedPart === 6 ? 2 : 1;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + 80, cy + 40 + i * 15);
        ctx.bezierCurveTo(cx + 120, cy + 30 + i * 15, cx + 140, cy + 50 + i * 15, cx + 170, cy + 40 + i * 15);
        ctx.stroke();
      }
      // Labels
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      parts.forEach((p, i) => {
        if (selectedPart === i) {
          ctx.fillStyle = p.color;
          ctx.font = 'bold 12px Inter';
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.font = '11px Inter';
        }
        ctx.fillText(p.name, w * p.x, h * p.y);
      });
      ctx.textAlign = 'start';
      animFrame = requestAnimationFrame(draw);
    }
    draw();
    return function cleanup() { if (animFrame) cancelAnimationFrame(animFrame); delete window._selectCellPart; };
  };
})();
