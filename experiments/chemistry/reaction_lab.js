/* ============================================================
   REACTION LAB — Chemical Reactions Simulation
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};

  window.experimentRenderers['reaction_lab'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Reaction Lab?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Reaction Lab'], ans: 3, exp: 'The experiment focuses on the specific principles of Reaction Lab.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Reaction Lab experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    const reactions = [
      { id:'combination', name:'Combination', desc:'Iron + Oxygen → Iron Oxide', reactants:'2Fe + O₂', product:'2FeO (black)', observation:'Iron filings glow and form black iron oxide', color1:'#94a3b8', color2:'#ef4444', productColor:'#1e293b', type:'A + B → AB' },
      { id:'decomposition', name:'Decomposition', desc:'Ferrous Sulfate → Iron Oxide + SO₂ + SO₃', reactants:'2FeSO₄(s)', product:'Fe₂O₃ + SO₂↑ + SO₃↑', observation:'Green crystals turn brown/red on heating. Pungent SO₂ gas released.', color1:'#22c55e', color2:null, productColor:'#92400e', type:'AB → A + B' },
      { id:'displacement', name:'Displacement', desc:'Zinc + CuSO₄ → ZnSO₄ + Cu', reactants:'Zn + CuSO₄(aq)', product:'ZnSO₄(aq) + Cu(s)', observation:'Blue solution turns colourless. Brown copper deposits on zinc.', color1:'#94a3b8', color2:'#3b82f6', productColor:'#d97706', type:'A + BC → AC + B' },
      { id:'double_displacement', name:'Double Displacement', desc:'Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃', reactants:'Pb(NO₃)₂ + 2KI', product:'PbI₂↓ (yellow) + 2KNO₃', observation:'Bright yellow precipitate of Lead Iodide forms instantly.', color1:'transparent', color2:'transparent', productColor:'#eab308', type:'AB + CD → AD + CB' }
    ];
    let selectedReaction = 0;
    let reacting = false;
    let progress = 0;
    let animFrame = null;
    let canvas, ctx;
    let bubbles = [];

    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap">
          <canvas id="reaction-canvas" width="800" height="380"></canvas>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">⚗️</span> Select Reaction</div>
            ${reactions.map((r, i) => `
              <div id="rxn-${i}" onclick="window._selectReaction(${i})" style="padding:10px 14px;margin-bottom:6px;border-radius:8px;cursor:pointer;border:1px solid ${i === 0 ? 'var(--border-glass-hover)' : 'transparent'};background:${i === 0 ? 'rgba(255,255,255,0.04)' : 'transparent'};transition:all 0.2s;">
                <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${r.name}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${r.type}</div>
              </div>
            `).join('')}
            <button class="sim-btn btn-primary" id="rxn-start" style="margin-top:8px;width:100%;" onclick="window._startReaction()">🧪 Start Reaction</button>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Reaction Details</div>
            <div class="sim-result-row"><span class="sim-result-label">Type</span><span class="sim-result-value" id="rxn-type" style="color:#06b6d4;font-size:12px;">${reactions[0].type}</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Reactants</span><span class="sim-result-value" id="rxn-reactants" style="color:var(--text-secondary);font-size:12px;">${reactions[0].reactants}</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Products</span><span class="sim-result-value" id="rxn-products" style="color:#22c55e;font-size:12px;">${reactions[0].product}</span></div>
            <div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid var(--border-glass);">
              <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;" id="rxn-obs"><strong>Observation:</strong> ${reactions[0].observation}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('reaction-canvas');
    ctx = canvas.getContext('2d');

    window._selectReaction = (idx) => {
      selectedReaction = idx;
      reacting = false;
      progress = 0;
      bubbles = [];
      reactions.forEach((_, i) => {
        const el = document.getElementById(`rxn-${i}`);
        el.style.borderColor = i === idx ? 'var(--border-glass-hover)' : 'transparent';
        el.style.background = i === idx ? 'rgba(255,255,255,0.04)' : 'transparent';
      });
      const r = reactions[idx];
      document.getElementById('rxn-type').textContent = r.type;
      document.getElementById('rxn-reactants').textContent = r.reactants;
      document.getElementById('rxn-products').textContent = r.product;
      document.getElementById('rxn-obs').innerHTML = `<strong>Observation:</strong> ${r.observation}`;
    };

    window._startReaction = () => {
      reacting = true;
      progress = 0;
      bubbles = [];
    };

    function draw() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      const r = reactions[selectedReaction];

      if (reacting && progress < 1) {
        progress += 0.005;
        // Spawn bubbles
        if (Math.random() < 0.3) {
          bubbles.push({ x: w * 0.5 + (Math.random() - 0.5) * 60, y: h * 0.65, vy: -(1 + Math.random() * 2), opacity: 0.8, radius: 2 + Math.random() * 3 });
        }
      }

      // Update bubbles
      bubbles = bubbles.filter(b => { b.y += b.vy; b.opacity -= 0.01; return b.opacity > 0; });

      // Test tube 1
      drawTestTube(ctx, w * 0.3, h * 0.25, 60, 200, r.color1, 'Reactant 1', progress < 0.5 ? 1 : 1 - (progress - 0.5) * 2);
      // Test tube 2 (if exists)
      if (r.color2) {
        drawTestTube(ctx, w * 0.55, h * 0.25, 60, 200, r.color2, 'Reactant 2', progress < 0.5 ? 1 : 1 - (progress - 0.5) * 2);
      }
      // Product beaker
      drawBeaker(ctx, w * 0.75, h * 0.30, 100, 160, r.productColor, 'Product', progress);

      // Reaction arrow
      if (reacting) {
        ctx.strokeStyle = `rgba(34, 197, 94, ${Math.min(progress * 2, 0.8)})`;
        ctx.lineWidth = 3;
        const arrowY = h * 0.55;
        ctx.beginPath();
        ctx.moveTo(w * 0.42, arrowY);
        ctx.lineTo(w * 0.65, arrowY);
        ctx.stroke();
        ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.beginPath();
        ctx.moveTo(w * 0.65, arrowY);
        ctx.lineTo(w * 0.63, arrowY - 6);
        ctx.lineTo(w * 0.63, arrowY + 6);
        ctx.closePath();
        ctx.fill();
      }

      // Bubbles
      for (const b of bubbles) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${b.opacity * 0.4})`;
        ctx.fill();
      }

      // Equation
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '14px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`${r.reactants}  →  ${r.product}`, w / 2, h - 20);
      ctx.textAlign = 'start';

      animFrame = requestAnimationFrame(draw);
    }

    function drawTestTube(ctx, x, y, w, h, liquidColor, label, fillLevel) {
      const tubeW = w * 0.6;
      const tubeH = h;
      const tx = x - tubeW / 2;
      // Tube outline
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, y);
      ctx.lineTo(tx, y + tubeH - 15);
      ctx.arc(tx + tubeW / 2, y + tubeH - 15, tubeW / 2, Math.PI, 0, true);
      ctx.lineTo(tx + tubeW, y);
      ctx.stroke();
      // Liquid
      if (fillLevel > 0 && liquidColor !== 'transparent') {
        const liqH = tubeH * 0.6 * Math.min(fillLevel, 1);
        const liqY = y + tubeH - 15 - liqH;
        ctx.fillStyle = liquidColor;
        ctx.beginPath();
        ctx.moveTo(tx + 2, liqY);
        ctx.lineTo(tx + 2, y + tubeH - 15);
        ctx.arc(tx + tubeW / 2, y + tubeH - 15, tubeW / 2 - 2, Math.PI, 0, true);
        ctx.lineTo(tx + tubeW - 2, liqY);
        ctx.closePath();
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y - 8);
    }

    function drawBeaker(ctx, x, y, w, h, liquidColor, label, fillLevel) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - w / 2, y, w, h);
      // Liquid fill
      if (fillLevel > 0) {
        const liqH = h * 0.7 * Math.min(fillLevel, 1);
        ctx.fillStyle = liquidColor;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(x - w / 2 + 2, y + h - liqH - 2, w - 4, liqH);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y - 8);
      ctx.textAlign = 'start';
    }

    draw();

    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
      delete window._selectReaction;
      delete window._startReaction;
    };
  };
})();
