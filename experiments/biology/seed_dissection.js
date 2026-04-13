/* Virtual Seed Dissection */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['virtual_seed_dissection'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Seed Dissection?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Seed Dissection'], ans: 3, exp: 'The experiment focuses on the specific principles of Seed Dissection.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Seed Dissection experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let seedType = 'dicot', selectedPart = null, dissected = false;
    let animFrame, canvas, ctx, time = 0;
    const dicotParts = [
      { name:'Seed Coat (Testa)', desc:'Outer protective layer. Hard, brown/tan covering that protects the embryo from mechanical damage, desiccation, and pathogens.', color:'#92400e' },
      { name:'Cotyledons (2)', desc:'Two fleshy seed leaves that store food (starch, oils, proteins) for the germinating embryo. In dicots, food is stored primarily in cotyledons.', color:'#84cc16' },
      { name:'Radicle', desc:'Embryonic root. Grows downward into soil to anchor the plant and absorb water and minerals. First part to emerge during germination.', color:'#f59e0b' },
      { name:'Plumule', desc:'Embryonic shoot. Grows upward to form the stem and leaves. Contains tiny folded leaves inside.', color:'#22c55e' },
      { name:'Hilum', desc:'Scar on the seed coat where it was attached to the fruit/pod. Shaped like a small oval mark.', color:'#a78bfa' },
      { name:'Micropyle', desc:'Tiny pore near the hilum. Allows water absorption during germination. Was the opening for pollen tube entry during fertilization.', color:'#06b6d4' },
    ];
    const monocotParts = [
      { name:'Seed Coat', desc:'Thin protective outer layer, often fused with the fruit wall (pericarp) in monocots like maize.', color:'#92400e' },
      { name:'Endosperm', desc:'Large, starchy tissue that stores food for the embryo. In monocots, food is primarily stored in the endosperm (not cotyledons). Turns blue-black with iodine.', color:'#fbbf24' },
      { name:'Scutellum (Cotyledon)', desc:'Single, shield-shaped cotyledon. Acts as an absorbing organ — transfers nutrients from endosperm to the embryo during germination.', color:'#84cc16' },
      { name:'Coleoptile', desc:'Protective sheath covering the plumule (embryonic shoot). Helps the shoot push through soil during germination.', color:'#22c55e' },
      { name:'Coleorhiza', desc:'Protective sheath covering the radicle (embryonic root). Root tip breaks through this during germination.', color:'#f59e0b' },
    ];
    function getParts() { return seedType === 'dicot' ? dicotParts : monocotParts; }
    container.innerHTML = `
      <div class="sim-container">
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;">
          <div class="sim-canvas-wrap"><canvas id="seed-canvas" width="600" height="450"></canvas></div>
          <div>
            <div class="sim-btn-group" style="margin-bottom:12px;">
              <button class="sim-btn btn-primary" id="seed-dicot" onclick="window._setSeedType('dicot')">🫘 Dicot (Gram)</button>
              <button class="sim-btn" id="seed-mono" onclick="window._setSeedType('monocot')">🌽 Monocot (Maize)</button>
            </div>
            <button class="sim-btn" style="width:100%;margin-bottom:12px;" id="seed-dissect-btn" onclick="window._dissectSeed()">🔪 ${dissected ? 'Close Seed' : 'Dissect Seed'}</button>
            <div class="sim-controls" style="margin-bottom:12px;max-height:200px;overflow-y:auto;" id="seed-parts-list"></div>
            <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Start Viva</button>

              <div class="sim-results-title"><span class="ctrl-icon">📋</span> Details</div>
              <p style="font-size:13px;color:var(--text-muted);" id="seed-desc">Dissect the seed to explore its internal structure.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    canvas = document.getElementById('seed-canvas');
    ctx = canvas.getContext('2d');
    function renderPartsList() {
      document.getElementById('seed-parts-list').innerHTML = `
        <div class="sim-controls-title"><span class="ctrl-icon">🌰</span> ${seedType === 'dicot' ? 'Dicot' : 'Monocot'} Seed Parts</div>
        ${getParts().map((p, i) => `
          <div id="seed-p-${i}" onclick="window._selectSeedPart(${i})" style="padding:6px 10px;margin-bottom:3px;border-radius:6px;cursor:pointer;border:1px solid transparent;transition:all 0.2s;display:flex;align-items:center;gap:8px;">
            <div style="width:8px;height:8px;border-radius:50%;background:${p.color};"></div>
            <span style="font-size:12px;color:var(--text-secondary);">${p.name}</span>
          </div>
        `).join('')}
      `;
    }
    renderPartsList();
    window._setSeedType = (type) => {
      seedType = type; selectedPart = null; dissected = false;
      document.getElementById('seed-dicot').className = type === 'dicot' ? 'sim-btn btn-primary' : 'sim-btn';
      document.getElementById('seed-mono').className = type === 'monocot' ? 'sim-btn btn-primary' : 'sim-btn';
      document.getElementById('seed-dissect-btn').textContent = '🔪 Dissect Seed';
      document.getElementById('seed-desc').textContent = 'Dissect the seed to explore its internal structure.';
      renderPartsList();
    };
    window._dissectSeed = () => {
      dissected = !dissected;
      document.getElementById('seed-dissect-btn').textContent = dissected ? '🔪 Close Seed' : '🔪 Dissect Seed';
    };
    window._selectSeedPart = (idx) => {
      selectedPart = idx;
      const p = getParts()[idx];
      getParts().forEach((_, i) => {
        const el = document.getElementById(`seed-p-${i}`);
        if (el) { el.style.borderColor = i === idx ? p.color : 'transparent'; el.style.background = i === idx ? 'rgba(255,255,255,0.04)' : 'transparent'; }
      });
      document.getElementById('seed-desc').innerHTML = `<strong style="color:${p.color}">${p.name}</strong><br/><span style="color:var(--text-secondary)">${p.desc}</span>`;
    };
    function draw() {
      const w = canvas.width, h = canvas.height;
      time += 0.015;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      if (seedType === 'dicot') drawDicot(cx, cy, w, h);
      else drawMonocot(cx, cy, w, h);
      animFrame = requestAnimationFrame(draw);
    }
    function drawDicot(cx, cy, w, h) {
      if (!dissected) {
        // Whole seed
        ctx.fillStyle = selectedPart === 0 ? 'rgba(146,64,14,0.7)' : 'rgba(146,64,14,0.5)';
        ctx.strokeStyle = selectedPart === 0 ? '#b45309' : 'rgba(180,83,9,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, 80, 55, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Hilum
        ctx.fillStyle = selectedPart === 4 ? '#a78bfa' : 'rgba(167,139,250,0.4)';
        ctx.beginPath(); ctx.ellipse(cx + 65, cy, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
        // Micropyle
        ctx.fillStyle = selectedPart === 5 ? '#06b6d4' : 'rgba(6,182,212,0.4)';
        ctx.beginPath(); ctx.arc(cx + 70, cy - 12, 3, 0, Math.PI * 2); ctx.fill();
        // Labels
        ctx.font = '11px Inter'; ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('Whole Seed (External)', cx, cy + 85);
        if (selectedPart === 4) { ctx.fillStyle = '#a78bfa'; ctx.fillText('Hilum →', cx + 40, cy - 15); }
        if (selectedPart === 5) { ctx.fillStyle = '#06b6d4'; ctx.fillText('← Micropyle', cx + 95, cy - 12); }
      } else {
        // Split — two cotyledons
        const sep = 15;
        // Left cotyledon
        ctx.fillStyle = selectedPart === 1 ? 'rgba(132,204,22,0.5)' : 'rgba(132,204,22,0.25)';
        ctx.strokeStyle = selectedPart === 1 ? '#84cc16' : 'rgba(132,204,22,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx - sep - 40, cy, 60, 50, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Right cotyledon
        ctx.beginPath(); ctx.ellipse(cx + sep + 40, cy, 60, 50, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Radicle
        ctx.fillStyle = selectedPart === 2 ? '#f59e0b' : 'rgba(245,158,11,0.3)';
        ctx.beginPath(); ctx.ellipse(cx, cy + 45, 8, 20, 0, 0, Math.PI * 2); ctx.fill();
        // Plumule
        ctx.fillStyle = selectedPart === 3 ? '#22c55e' : 'rgba(34,197,94,0.3)';
        ctx.beginPath(); ctx.ellipse(cx, cy - 35, 6, 18, 0, 0, Math.PI * 2); ctx.fill();
        // Labels
        ctx.font = '11px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('Dissected Dicot Seed', cx, cy + 90);
        ctx.fillStyle = '#84cc16'; ctx.fillText('Cotyledon', cx - sep - 40, cy - 60);
        ctx.fillText('Cotyledon', cx + sep + 40, cy - 60);
        if (selectedPart === 2) { ctx.fillStyle = '#f59e0b'; ctx.fillText('Radicle ↓', cx, cy + 75); }
        if (selectedPart === 3) { ctx.fillStyle = '#22c55e'; ctx.fillText('↑ Plumule', cx, cy - 60); }
      }
      ctx.textAlign = 'start';
    }
    function drawMonocot(cx, cy, w, h) {
      if (!dissected) {
        // Whole seed
        ctx.fillStyle = selectedPart === 0 ? 'rgba(146,64,14,0.7)' : 'rgba(146,64,14,0.5)';
        ctx.strokeStyle = 'rgba(180,83,9,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, 50, 70, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.font = '11px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('Whole Maize Seed', cx, cy + 95);
      } else {
        // Longitudinal section
        ctx.strokeStyle = 'rgba(180,83,9,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, 65, 90, 0, 0, Math.PI * 2); ctx.stroke();
        // Seed coat
        ctx.fillStyle = selectedPart === 0 ? 'rgba(146,64,14,0.5)' : 'rgba(146,64,14,0.2)';
        ctx.beginPath(); ctx.ellipse(cx, cy, 65, 90, 0, 0, Math.PI * 2); ctx.fill();
        // Endosperm
        ctx.fillStyle = selectedPart === 1 ? 'rgba(251,191,36,0.4)' : 'rgba(251,191,36,0.15)';
        ctx.strokeStyle = selectedPart === 1 ? '#fbbf24' : 'rgba(251,191,36,0.3)';
        ctx.beginPath(); ctx.ellipse(cx + 10, cy, 45, 75, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Scutellum
        ctx.fillStyle = selectedPart === 2 ? 'rgba(132,204,22,0.5)' : 'rgba(132,204,22,0.2)';
        ctx.strokeStyle = selectedPart === 2 ? '#84cc16' : 'rgba(132,204,22,0.3)';
        ctx.beginPath(); ctx.ellipse(cx - 25, cy, 15, 50, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Coleoptile
        ctx.fillStyle = selectedPart === 3 ? '#22c55e' : 'rgba(34,197,94,0.3)';
        ctx.beginPath(); ctx.ellipse(cx - 25, cy - 40, 8, 20, 0, 0, Math.PI * 2); ctx.fill();
        // Coleorhiza
        ctx.fillStyle = selectedPart === 4 ? '#f59e0b' : 'rgba(245,158,11,0.3)';
        ctx.beginPath(); ctx.ellipse(cx - 25, cy + 45, 7, 15, 0, 0, Math.PI * 2); ctx.fill();
        // Labels
        ctx.font = '11px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('Monocot Seed (Longitudinal Section)', cx, cy + 110);
        if (selectedPart === 1) { ctx.fillStyle = '#fbbf24'; ctx.fillText('Endosperm', cx + 35, cy - 80); }
        if (selectedPart === 2) { ctx.fillStyle = '#84cc16'; ctx.fillText('← Scutellum', cx - 55, cy); }
        if (selectedPart === 3) { ctx.fillStyle = '#22c55e'; ctx.fillText('↑ Coleoptile', cx - 25, cy - 70); }
        if (selectedPart === 4) { ctx.fillStyle = '#f59e0b'; ctx.fillText('Coleorhiza ↓', cx - 25, cy + 75); }
      }
      ctx.textAlign = 'start';
    }
    draw();
    return function cleanup() { if (animFrame) cancelAnimationFrame(animFrame); delete window._setSeedType; delete window._dissectSeed; delete window._selectSeedPart; };
  };
})();
