/* Ethanoic Acid Properties */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['ethanoic_acid_properties'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Ethanoic Acid?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Ethanoic Acid'], ans: 3, exp: 'The experiment focuses on the specific principles of Ethanoic Acid.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Ethanoic Acid experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    const tests = [
      { id:'litmus', name:'Litmus Test', desc:'Ethanoic acid turns blue litmus red, confirming its acidic nature.', result:'Blue litmus → Red', icon:'🔴', animation:'litmus' },
      { id:'nahco3', name:'NaHCO₃ Test', desc:'Ethanoic acid reacts with sodium bicarbonate to release CO₂ gas with brisk effervescence.', result:'CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂↑', icon:'🫧', animation:'fizz' },
      { id:'naoh', name:'NaOH Neutralization', desc:'Ethanoic acid neutralizes sodium hydroxide. The solution becomes neutral (pH ≈ 7).', result:'CH₃COOH + NaOH → CH₃COONa + H₂O', icon:'⚖️', animation:'neutral' },
      { id:'ester', name:'Esterification', desc:'Ethanoic acid + Ethanol (with conc. H₂SO₄ catalyst) → Ethyl Ethanoate (sweet fruity smell)', result:'CH₃COOH + C₂H₅OH → CH₃COOC₂H₅ + H₂O', icon:'🌸', animation:'ester' },
    ];
    let selected = 0, testing = false, progress = 0;
    let animFrame, canvas, ctx, bubbles = [];
    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap"><canvas id="etha-canvas" width="800" height="350"></canvas></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">🧪</span> Select Test</div>
            ${tests.map((t, i) => `
              <div id="etha-${i}" onclick="window._selectEthaTest(${i})" style="padding:10px 14px;margin-bottom:4px;border-radius:8px;cursor:pointer;border:1px solid ${i === 0 ? 'var(--border-glass-hover)' : 'transparent'};background:${i === 0 ? 'rgba(255,255,255,0.04)' : 'transparent'};transition:all 0.2s;">
                <span style="margin-right:6px;">${t.icon}</span><span style="font-size:13px;font-weight:500;color:var(--text-primary);">${t.name}</span>
              </div>
            `).join('')}
            <button class="sim-btn btn-primary" style="margin-top:8px;width:100%;" onclick="window._runEthaTest()">🧪 Run Test</button>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Result</div>
            <div class="sim-result-row"><span class="sim-result-label">Test</span><span class="sim-result-value" id="etha-test-name" style="color:#0ea5e9;font-size:13px;">${tests[0].name}</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Equation</span><span class="sim-result-value" id="etha-eq" style="color:var(--text-secondary);font-size:10px;">${tests[0].result}</span></div>
            <div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid var(--border-glass);">
              <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;" id="etha-desc">${tests[0].desc}</p>
            </div>
          </div>
        </div>
      </div>
    `;
    canvas = document.getElementById('etha-canvas');
    ctx = canvas.getContext('2d');
    window._selectEthaTest = (idx) => {
      selected = idx; testing = false; progress = 0; bubbles = [];
      tests.forEach((_, i) => {
        const el = document.getElementById(`etha-${i}`);
        el.style.borderColor = i === idx ? 'var(--border-glass-hover)' : 'transparent';
        el.style.background = i === idx ? 'rgba(255,255,255,0.04)' : 'transparent';
      });
      document.getElementById('etha-test-name').textContent = tests[idx].name;
      document.getElementById('etha-eq').textContent = tests[idx].result;
      document.getElementById('etha-desc').textContent = tests[idx].desc;
    };
    window._runEthaTest = () => { testing = true; progress = 0; bubbles = []; };
    function draw() {
      const w = canvas.width, h = canvas.height;
      if (testing && progress < 1) progress += 0.008;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      const t = tests[selected];
      // Test tube
      const tx = w * 0.4, ty = h * 0.15, tw = 70, th = 220;
      ctx.strokeStyle = 'rgba(148,163,184,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, ty); ctx.lineTo(tx, ty + th - 15);
      ctx.arc(tx + tw / 2, ty + th - 15, tw / 2, Math.PI, 0, true);
      ctx.lineTo(tx + tw, ty); ctx.stroke();
      // Liquid color based on test progress
      let liquidColor = 'rgba(255,255,255,0.1)'; // acetic acid
      if (t.id === 'litmus' && testing) liquidColor = `rgba(239, 68, 68, ${0.1 + progress * 0.3})`;
      else if (t.id === 'naoh' && testing) liquidColor = `rgba(34, 197, 94, ${0.1 + progress * 0.2})`;
      else if (t.id === 'ester' && testing) liquidColor = `rgba(245, 158, 11, ${0.1 + progress * 0.25})`;
      else liquidColor = 'rgba(255,255,255,0.08)';
      const liqH = th * 0.6;
      ctx.fillStyle = liquidColor;
      ctx.beginPath();
      ctx.moveTo(tx + 3, ty + th * 0.35);
      ctx.lineTo(tx + 3, ty + th - 15);
      ctx.arc(tx + tw / 2, ty + th - 15, tw / 2 - 3, Math.PI, 0, true);
      ctx.lineTo(tx + tw - 3, ty + th * 0.35);
      ctx.closePath();
      ctx.fill();
      // Bubbles for NaHCO3 test
      if (t.id === 'nahco3' && testing && progress < 0.9) {
        if (Math.random() < 0.5) bubbles.push({ x: tx + tw / 2 + (Math.random() - 0.5) * 30, y: ty + th - 30, vy: -(1 + Math.random() * 3), opacity: 0.8, r: 2 + Math.random() * 3 });
      }
      bubbles = bubbles.filter(b => { b.y += b.vy; b.opacity -= 0.01; return b.opacity > 0; });
      for (const b of bubbles) {
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${b.opacity * 0.4})`; ctx.fill();
      }
      // Smell lines for ester
      if (t.id === 'ester' && testing && progress > 0.5) {
        ctx.strokeStyle = `rgba(236, 72, 153, ${(progress - 0.5) * 0.6})`;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          const sx = tx + tw / 2 + (i - 1) * 20;
          ctx.moveTo(sx, ty - 10);
          ctx.bezierCurveTo(sx - 10, ty - 30, sx + 10, ty - 50, sx, ty - 70);
          ctx.stroke();
        }
        ctx.fillStyle = '#ec4899';
        ctx.font = '13px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('🌸 Sweet fruity smell!', tx + tw / 2, ty - 80);
      }
      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Ethanoic Acid (CH₃COOH)', tx + tw / 2, ty - 10);
      if (testing && progress >= 1) {
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 14px Inter';
        ctx.fillText('Test Complete ✓', w / 2, h - 20);
      }
      ctx.textAlign = 'start';
      animFrame = requestAnimationFrame(draw);
    }
    draw();
    return function cleanup() { if (animFrame) cancelAnimationFrame(animFrame); delete window._selectEthaTest; delete window._runEthaTest; };
  };
})();
