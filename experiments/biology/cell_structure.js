/* Cell Structure Explorer */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['cell_structure'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Cell Structure?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Cell Structure'], ans: 3, exp: 'The experiment focuses on the specific principles of Cell Structure.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Cell Structure experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let selectedPart = null, cellType = 'plant', animFrame, canvas, ctx, time = 0;
    const plantParts = [
      { name:'Cell Wall', desc:'Rigid outer boundary made of cellulose. Provides protection and shape. Unique to plant cells.', color:'#22c55e', draw:'wall' },
      { name:'Cell Membrane', desc:'Thin, flexible semi-permeable membrane. Controls what enters and leaves the cell.', color:'#3b82f6', draw:'membrane' },
      { name:'Nucleus', desc:'Control centre containing DNA. Directs all cell activities and stores genetic information.', color:'#8b5cf6', draw:'nucleus' },
      { name:'Chloroplast', desc:'Contains chlorophyll for photosynthesis. Converts light energy into food (glucose). Green in colour.', color:'#84cc16', draw:'chloroplast' },
      { name:'Central Vacuole', desc:'Large, central, water-filled sac. Maintains turgor pressure, stores nutrients and waste.', color:'#06b6d4', draw:'vacuole' },
      { name:'Mitochondria', desc:'Powerhouse of the cell. Performs cellular respiration to produce ATP energy.', color:'#ef4444', draw:'mito' },
      { name:'Cytoplasm', desc:'Jelly-like fluid filling the cell. Houses all organelles. Site of many metabolic reactions.', color:'#f59e0b', draw:'cyto' },
    ];
    const animalParts = [
      { name:'Cell Membrane', desc:'Outermost boundary of animal cells (no cell wall). Flexible, controls substance movement.', color:'#3b82f6', draw:'membrane' },
      { name:'Nucleus', desc:'Large, central organelle with nuclear membrane. Contains chromosomes (DNA) and nucleolus.', color:'#8b5cf6', draw:'nucleus' },
      { name:'Mitochondria', desc:'Bean-shaped organelles for energy production via aerobic respiration. Present in large numbers.', color:'#ef4444', draw:'mito' },
      { name:'Cytoplasm', desc:'Gel-like matrix where organelles float. Contains enzymes for biochemical reactions.', color:'#f59e0b', draw:'cyto' },
      { name:'Small Vacuoles', desc:'Multiple small vacuoles (not one large). Temporary storage for food, water, or waste.', color:'#06b6d4', draw:'vacuole' },
      { name:'Centrosome', desc:'Helps in cell division. Contains two centrioles. Absent in most plant cells.', color:'#ec4899', draw:'centro' },
    ];
    function getParts() { return cellType === 'plant' ? plantParts : animalParts; }
    container.innerHTML = `
      <div class="sim-container">
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;">
          <div class="sim-canvas-wrap"><canvas id="cellstr-canvas" width="600" height="500"></canvas></div>
          <div>
            <div class="sim-btn-group" style="margin-bottom:12px;">
              <button class="sim-btn btn-primary" id="cell-plant-btn" onclick="window._setCellType('plant')">🌱 Plant Cell</button>
              <button class="sim-btn" id="cell-animal-btn" onclick="window._setCellType('animal')">🐾 Animal Cell</button>
            </div>
            <div class="sim-controls" style="margin-bottom:12px;max-height:240px;overflow-y:auto;" id="cellstr-parts"></div>
            <div class="sim-results" id="cellstr-info">
              <div class="sim-results-title"><span class="ctrl-icon">📋</span> Details</div>
              <p style="font-size:13px;color:var(--text-muted);" id="cellstr-desc">Click on a cell part to learn more.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    canvas = document.getElementById('cellstr-canvas');
    ctx = canvas.getContext('2d');
    function renderParts() {
      const parts = getParts();
      document.getElementById('cellstr-parts').innerHTML = `
        <div class="sim-controls-title"><span class="ctrl-icon">🔬</span> ${cellType === 'plant' ? 'Plant' : 'Animal'} Cell Parts</div>
        ${parts.map((p, i) => `
          <div id="cellstr-p-${i}" onclick="window._selectCellStr(${i})" style="padding:6px 10px;margin-bottom:3px;border-radius:6px;cursor:pointer;border:1px solid transparent;transition:all 0.2s;display:flex;align-items:center;gap:8px;">
            <div style="width:8px;height:8px;border-radius:50%;background:${p.color};"></div>
            <span style="font-size:12px;color:var(--text-secondary);">${p.name}</span>
          </div>
        `).join('')}
      `;
    }
    renderParts();
    window._setCellType = (type) => {
      cellType = type; selectedPart = null;
      document.getElementById('cell-plant-btn').className = type === 'plant' ? 'sim-btn btn-primary' : 'sim-btn';
      document.getElementById('cell-animal-btn').className = type === 'animal' ? 'sim-btn btn-primary' : 'sim-btn';
      document.getElementById('cellstr-desc').textContent = 'Click on a cell part to learn more.';
      renderParts();
    };
    window._selectCellStr = (idx) => {
      selectedPart = idx;
      const p = getParts()[idx];
      getParts().forEach((_, i) => {
        const el = document.getElementById(`cellstr-p-${i}`);
        if (el) { el.style.borderColor = i === idx ? p.color : 'transparent'; el.style.background = i === idx ? 'rgba(255,255,255,0.04)' : 'transparent'; }
      });
      document.getElementById('cellstr-desc').innerHTML = `<strong style="color:${p.color}">${p.name}</strong><br/><span style="color:var(--text-secondary)">${p.desc}</span>`;
    };
    function draw() {
      const w = canvas.width, h = canvas.height;
      time += 0.015;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      if (cellType === 'plant') {
        // Rectangular plant cell
        const rw = 200, rh = 180;
        // Cell wall
        ctx.strokeStyle = selectedPart === 0 ? '#22c55e' : 'rgba(34,197,94,0.4)';
        ctx.lineWidth = selectedPart === 0 ? 6 : 4;
        ctx.beginPath(); ctx.roundRect(cx - rw - 8, cy - rh - 8, (rw + 8) * 2, (rh + 8) * 2, 16); ctx.stroke();
        // Membrane
        ctx.strokeStyle = selectedPart === 1 ? '#3b82f6' : 'rgba(59,130,246,0.3)';
        ctx.lineWidth = selectedPart === 1 ? 3 : 1.5;
        ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.roundRect(cx - rw, cy - rh, rw * 2, rh * 2, 12); ctx.stroke(); ctx.setLineDash([]);
        // Cytoplasm
        ctx.fillStyle = selectedPart === 6 ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.04)';
        ctx.beginPath(); ctx.roundRect(cx - rw + 2, cy - rh + 2, rw * 2 - 4, rh * 2 - 4, 11); ctx.fill();
        // Vacuole
        ctx.fillStyle = selectedPart === 4 ? 'rgba(6,182,212,0.3)' : 'rgba(6,182,212,0.1)';
        ctx.strokeStyle = selectedPart === 4 ? '#06b6d4' : 'rgba(6,182,212,0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(cx + 30, cy + 10, 80 + Math.sin(time) * 3, 65 + Math.cos(time * 0.7) * 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Nucleus
        ctx.fillStyle = selectedPart === 2 ? 'rgba(139,92,246,0.35)' : 'rgba(139,92,246,0.15)';
        ctx.strokeStyle = selectedPart === 2 ? '#8b5cf6' : 'rgba(139,92,246,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx - 80, cy - 30, 35, 30, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx - 80, cy - 30, 10, 0, Math.PI * 2); ctx.fillStyle = 'rgba(139,92,246,0.5)'; ctx.fill();
        // Chloroplasts
        [[-130, 50], [-100, 100], [120, -90], [130, 60]].forEach(([ox, oy], i) => {
          ctx.fillStyle = selectedPart === 3 ? 'rgba(132,204,22,0.5)' : 'rgba(132,204,22,0.2)';
          ctx.strokeStyle = selectedPart === 3 ? '#84cc16' : 'rgba(132,204,22,0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.ellipse(cx + ox, cy + oy, 16, 8, i * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        });
        // Mitochondria
        [[-120, -60], [80, 120]].forEach(([ox, oy]) => {
          ctx.fillStyle = selectedPart === 5 ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.15)';
          ctx.beginPath(); ctx.ellipse(cx + ox, cy + oy, 14, 7, 0.3, 0, Math.PI * 2); ctx.fill();
        });
      } else {
        // Circular animal cell
        const radius = 180;
        // Membrane
        ctx.strokeStyle = selectedPart === 0 ? '#3b82f6' : 'rgba(59,130,246,0.4)';
        ctx.lineWidth = selectedPart === 0 ? 4 : 2;
        ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
        // Cytoplasm
        ctx.fillStyle = selectedPart === 3 ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.04)';
        ctx.beginPath(); ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2); ctx.fill();
        // Nucleus
        ctx.fillStyle = selectedPart === 1 ? 'rgba(139,92,246,0.35)' : 'rgba(139,92,246,0.15)';
        ctx.strokeStyle = selectedPart === 1 ? '#8b5cf6' : 'rgba(139,92,246,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx - 10, cy - 10, 40, 35, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx - 10, cy - 10, 12, 0, Math.PI * 2); ctx.fillStyle = 'rgba(139,92,246,0.5)'; ctx.fill();
        // Mitochondria
        [[-80, 70], [70, -60], [-50, -90], [100, 50]].forEach(([ox, oy]) => {
          ctx.fillStyle = selectedPart === 2 ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.15)';
          ctx.beginPath(); ctx.ellipse(cx + ox, cy + oy, 14, 7, Math.random(), 0, Math.PI * 2); ctx.fill();
        });
        // Small vacuoles
        [[-100, 20], [60, 90], [-30, 110]].forEach(([ox, oy]) => {
          ctx.fillStyle = selectedPart === 4 ? 'rgba(6,182,212,0.3)' : 'rgba(6,182,212,0.1)';
          ctx.beginPath(); ctx.arc(cx + ox, cy + oy, 12 + Math.sin(time + ox) * 2, 0, Math.PI * 2); ctx.fill();
        });
        // Centrosome
        if (selectedPart === 5 || selectedPart === null) {
          ctx.strokeStyle = selectedPart === 5 ? '#ec4899' : 'rgba(236,72,153,0.3)';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(cx + 100, cy - 20, 4, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(cx + 108, cy - 20, 4, 0, Math.PI * 2); ctx.stroke();
        }
      }
      // Title
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '13px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(cellType === 'plant' ? 'Plant Cell (Rectangular)' : 'Animal Cell (Spherical)', cx, h - 15);
      ctx.textAlign = 'start';
      animFrame = requestAnimationFrame(draw);
    }
    draw();
    return function cleanup() { if (animFrame) cancelAnimationFrame(animFrame); delete window._setCellType; delete window._selectCellStr; };
  };
})();
