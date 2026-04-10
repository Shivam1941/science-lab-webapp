/* ============================================================
   VIRTUAL BREADBOARD — Series / Parallel Resistance Calculator
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['virtual_breadboard'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Breadboard?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Breadboard'], ans: 3, exp: 'The experiment focuses on the specific principles of Breadboard.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Breadboard experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let seriesResistors = [];
    let parallelResistors = [];
    let nextId = 0;
    let newOhms = 100;
    let animFrame, canvas, ctx;
    let phase = 0;

    const digitColors = ['#000','#8B4513','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#6b7280','#fff'];

    function getColorBands(ohms) {
      const s = Math.max(1, ohms).toString();
      const d1 = parseInt(s[0]) || 0;
      const d2 = parseInt(s[1]) || 0;
      const mult = Math.max(0, s.length - 2);
      return [digitColors[d1], digitColors[d2], digitColors[Math.min(mult, 9)], '#d4af37'];
    }

    function calcReq() {
      const rs = seriesResistors.reduce((sum, r) => sum + r.ohms, 0);
      if (parallelResistors.length === 0) return seriesResistors.length ? rs : null;
      const inv = parallelResistors.reduce((sum, r) => sum + 1 / r.ohms, 0);
      const rp = inv > 0 ? 1 / inv : 0;
      if (seriesResistors.length === 0) return rp;
      return rs + rp;
    }

    function formulaText() {
      if (!seriesResistors.length && !parallelResistors.length) return 'Add resistors to see calculation.';
      let text = '';
      if (seriesResistors.length) text += `Series: ${seriesResistors.map(r => r.ohms + 'Ω').join(' + ')} = ${seriesResistors.reduce((s,r) => s+r.ohms, 0).toFixed(1)}Ω`;
      if (parallelResistors.length) {
        if (text) text += '  ·  ';
        const inv = parallelResistors.reduce((s,r) => s + 1/r.ohms, 0);
        text += `Parallel: 1/Rp = ${parallelResistors.map(r => '1/' + r.ohms).join(' + ')} = ${(1/inv).toFixed(2)}Ω`;
      }
      return text;
    }

    function renderUI() {
      const req = calcReq();
      document.getElementById('bb-req').textContent = req !== null ? req.toFixed(2) + ' Ω' : 'Open circuit';
      document.getElementById('bb-req').style.color = req !== null ? '#22c55e' : '#ef4444';
      document.getElementById('bb-formula').textContent = formulaText();
      document.getElementById('bb-count').textContent = `${seriesResistors.length + parallelResistors.length}`;

      // Series list
      document.getElementById('bb-series-list').innerHTML = seriesResistors.map(r => `
        <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);border-radius:6px;font-size:12px;">
          <div style="display:flex;gap:2px;">${getColorBands(r.ohms).map(c => `<div style="width:5px;height:16px;background:${c};border-radius:1px;"></div>`).join('')}</div>
          <span style="color:var(--text-primary);font-weight:600;">${r.ohms}Ω</span>
          <span style="cursor:pointer;color:#ef4444;font-size:14px;" onclick="window._bbRemove('${r.id}')">×</span>
        </div>
      `).join('') || '<span style="font-size:12px;color:var(--text-muted);">Empty</span>';

      // Parallel list
      document.getElementById('bb-parallel-list').innerHTML = parallelResistors.map(r => `
        <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:6px;font-size:12px;">
          <div style="display:flex;gap:2px;">${getColorBands(r.ohms).map(c => `<div style="width:5px;height:16px;background:${c};border-radius:1px;"></div>`).join('')}</div>
          <span style="color:var(--text-primary);font-weight:600;">${r.ohms}Ω</span>
          <span style="cursor:pointer;color:#ef4444;font-size:14px;" onclick="window._bbRemove('${r.id}')">×</span>
        </div>
      `).join('') || '<span style="font-size:12px;color:var(--text-muted);">Empty</span>';
    }

    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap"><canvas id="bb-canvas" width="800" height="300"></canvas></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">🔧</span> Component Tray</div>
            <div class="sim-control-row">
              <span class="sim-control-label">Resistance</span>
              <input type="range" class="sim-control-slider" id="bb-new-ohms" min="1" max="1000" step="1" value="${newOhms}" />
              <span class="sim-control-value" id="bb-new-val">${newOhms}Ω</span>
            </div>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <button class="sim-btn btn-primary" style="flex:1;" onclick="window._bbAddSeries()">+ Series</button>
              <button class="sim-btn" style="flex:1;border-color:rgba(245,158,11,0.3);color:#f59e0b;" onclick="window._bbAddParallel()">+ Parallel</button>
            </div>
            <div style="margin-top:12px;">
              <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;">Series Rail <span style="color:#3b82f6;">━━</span></div>
              <div id="bb-series-list" style="display:flex;flex-wrap:wrap;gap:6px;min-height:28px;"></div>
            </div>
            <div style="margin-top:10px;">
              <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;">Parallel Rail <span style="color:#f59e0b;">━━</span></div>
              <div id="bb-parallel-list" style="display:flex;flex-wrap:wrap;gap:6px;min-height:28px;"></div>
            </div>
            <button class="sim-btn" style="width:100%;margin-top:10px;" onclick="window._bbClear()">🗑 Clear All</button>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(VIVA_QUESTIONS)">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Multimeter</div>
            <div style="text-align:center;padding:16px;background:rgba(34,197,94,0.06);border-radius:12px;border:1px solid rgba(34,197,94,0.15);margin-bottom:12px;">
              <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">Equivalent Resistance</div>
              <div style="font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;margin-top:4px;" id="bb-req" style="color:#22c55e;">Open circuit</div>
            </div>
            <div class="sim-result-row"><span class="sim-result-label">Total Resistors</span><span class="sim-result-value" id="bb-count" style="color:var(--text-primary);">0</span></div>
            <div style="margin-top:8px;padding:10px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid var(--border-glass);">
              <p style="font-size:11px;color:var(--text-secondary);line-height:1.5;font-family:'JetBrains Mono',monospace;" id="bb-formula">Add resistors to see calculation.</p>
            </div>
            <div style="margin-top:10px;padding:10px;background:rgba(59,130,246,0.06);border-radius:8px;border:1px solid rgba(59,130,246,0.15);">
              <p style="font-size:11px;color:var(--text-muted);line-height:1.5;"><strong>Series:</strong> Req = R₁ + R₂ + R₃...<br/><strong>Parallel:</strong> 1/Req = 1/R₁ + 1/R₂ + 1/R₃...</p>
            </div>
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('bb-canvas');
    ctx = canvas.getContext('2d');

    document.getElementById('bb-new-ohms').addEventListener('input', e => {
      newOhms = parseInt(e.target.value);
      document.getElementById('bb-new-val').textContent = newOhms + 'Ω';
    });

    window._bbAddSeries = () => { seriesResistors.push({ id: 'r' + (nextId++), ohms: newOhms }); renderUI(); };
    window._bbAddParallel = () => { parallelResistors.push({ id: 'r' + (nextId++), ohms: newOhms }); renderUI(); };
    window._bbRemove = (id) => { seriesResistors = seriesResistors.filter(r => r.id !== id); parallelResistors = parallelResistors.filter(r => r.id !== id); renderUI(); };
    window._bbClear = () => { seriesResistors = []; parallelResistors = []; renderUI(); };

    renderUI();

    function draw() {
      const w = canvas.width, h = canvas.height;
      phase += 0.015;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0c1220';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(59,130,246,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const req = calcReq();
      const hasCircuit = req !== null;

      // Battery
      ctx.fillStyle = '#1f2937';
      ctx.strokeStyle = hasCircuit ? '#22c55e' : '#6b7280';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(20, h/2 - 20, 50, 40, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
      ctx.fillText('9V', 45, h/2 + 4);

      // Series wire (top)
      if (seriesResistors.length) {
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(70, h/2 - 10); ctx.lineTo(70, 50); ctx.lineTo(w - 70, 50); ctx.lineTo(w - 70, h/2 - 10); ctx.stroke();

        // Resistors on series wire
        const spacing = (w - 160) / (seriesResistors.length + 1);
        seriesResistors.forEach((r, i) => {
          const rx = 80 + spacing * (i + 1);
          drawResistor(ctx, rx, 50, r.ohms);
        });

        // Current particles
        if (hasCircuit) {
          for (let i = 0; i < 6; i++) {
            const t = ((phase * 100 + i * 60) % (2 * (w - 140) + 2 * (h/2 - 60)));
            const pos = getWirePosition(t, w, h, 'series');
            ctx.beginPath(); ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#22d3ee'; ctx.fill();
          }
        }
      }

      // Parallel wire (bottom)
      if (parallelResistors.length) {
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3;
        const railY1 = h/2 + 20, railY2 = h - 40;
        ctx.beginPath(); ctx.moveTo(70, h/2 + 10); ctx.lineTo(70, railY1); ctx.lineTo(w - 70, railY1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(70, railY1); ctx.lineTo(70, railY2); ctx.lineTo(w - 70, railY2); ctx.lineTo(w - 70, railY1); ctx.stroke();

        // Parallel branches
        const spacing = (w - 160) / (parallelResistors.length + 1);
        parallelResistors.forEach((r, i) => {
          const bx = 80 + spacing * (i + 1);
          ctx.strokeStyle = 'rgba(245,158,11,0.4)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(bx, railY1); ctx.lineTo(bx, railY2); ctx.stroke();
          drawResistor(ctx, bx, (railY1 + railY2) / 2, r.ohms);
        });
      }

      // Ammeter
      if (hasCircuit) {
        const current = (9 / req).toFixed(2);
        ctx.fillStyle = '#052e16'; ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(w - 45, h/2, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#22c55e'; ctx.font = 'bold 9px JetBrains Mono'; ctx.textAlign = 'center';
        ctx.fillText(current + 'A', w - 45, h/2 + 3);
      }

      ctx.textAlign = 'start';
      animFrame = requestAnimationFrame(draw);
    }

    function drawResistor(ctx, x, y, ohms) {
      const bands = getColorBands(ohms);
      ctx.fillStyle = '#e8d5b0';
      ctx.beginPath(); ctx.roundRect(x - 20, y - 8, 40, 16, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.stroke();
      bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(x - 14 + i * 9, y - 6, 5, 12); });
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center';
      ctx.fillText(ohms + 'Ω', x, y + 22); ctx.textAlign = 'start';
    }

    function getWirePosition(t, w, h, type) {
      const len = w - 140;
      if (t < len) return { x: 80 + t, y: 50 };
      return { x: w - 70, y: 50 + (t - len) * 0.5 };
    }

    draw();

    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
      delete window._bbAddSeries; delete window._bbAddParallel;
      delete window._bbRemove; delete window._bbClear;
    };
  };
})();
