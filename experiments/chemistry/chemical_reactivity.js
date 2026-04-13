/* ============================================================
   CHEMICAL REACTIVITY WORKSTATION — Metal Reactivity with Acids
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};

  window.experimentRenderers['chemical_reactivity_workstation'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Chemical Reactivity?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Chemical Reactivity'], ans: 3, exp: 'The experiment focuses on the specific principles of Chemical Reactivity.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Chemical Reactivity experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    const metals = [
      { name:'Magnesium (Mg)', reactivity:4, color:'#e2e8f0', bubbleRate:0.8, observation:'Very vigorous reaction. Rapid effervescence. Solution heats up considerably.' },
      { name:'Zinc (Zn)', reactivity:3, color:'#94a3b8', bubbleRate:0.4, observation:'Moderate reaction. Steady bubbles of H₂ gas. Solution warms slightly.' },
      { name:'Iron (Fe)', reactivity:2, color:'#78716c', bubbleRate:0.15, observation:'Slow reaction. Occasional small bubbles. Very gradual dissolution.' },
      { name:'Copper (Cu)', reactivity:0, color:'#f59e0b', bubbleRate:0, observation:'No reaction. Copper does not react with dilute HCl. No gas evolved.' },
    ];
    let selectedMetal = 0;
    let testing = false;
    let bubbles = [];
    let animFrame = null;
    let canvas, ctx;

    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap">
          <canvas id="react-canvas" width="800" height="380"></canvas>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">🔬</span> Select Metal</div>
            ${metals.map((m, i) => `
              <div id="react-m-${i}" onclick="window._selectMetal(${i})" style="padding:10px 14px;margin-bottom:6px;border-radius:8px;cursor:pointer;border:1px solid ${i === 0 ? 'var(--border-glass-hover)' : 'transparent'};background:${i === 0 ? 'rgba(255,255,255,0.04)' : 'transparent'};transition:all 0.2s;display:flex;align-items:center;gap:10px;">
                <div style="width:16px;height:16px;border-radius:4px;background:${m.color};border:1px solid rgba(255,255,255,0.1);"></div>
                <div>
                  <div style="font-size:13px;font-weight:600;color:var(--text-primary);">${m.name}</div>
                  <div style="font-size:11px;color:var(--text-muted);">Reactivity: ${'★'.repeat(m.reactivity)}${'☆'.repeat(4-m.reactivity)}</div>
                </div>
              </div>
            `).join('')}
            <button class="sim-btn btn-primary" style="margin-top:8px;width:100%;" onclick="window._startReactTest()">🧪 Add to Acid</button>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Observation</div>
            <div class="sim-result-row"><span class="sim-result-label">Metal</span><span class="sim-result-value" id="react-metal" style="color:var(--text-primary);font-size:13px;">${metals[0].name}</span></div>
            <div class="sim-result-row"><span class="sim-result-label">H₂ Evolution</span><span class="sim-result-value" id="react-h2" style="color:#22c55e">${metals[0].reactivity > 0 ? 'Yes' : 'No'}</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Reactivity</span><span class="sim-result-value" id="react-level" style="color:#f59e0b">${['None','Low','Moderate','High','Very High'][metals[0].reactivity]}</span></div>
            <div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid var(--border-glass);">
              <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;" id="react-obs">${metals[0].observation}</p>
            </div>
            <div style="margin-top:12px;padding:12px;background:rgba(20,184,166,0.08);border-radius:8px;border:1px solid rgba(20,184,166,0.2);">
              <p style="font-size:12px;color:#14b8a6;line-height:1.5;"><strong>Reactivity Series:</strong><br/>Mg > Zn > Fe > Cu</p>
            </div>
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('react-canvas');
    ctx = canvas.getContext('2d');

    window._selectMetal = (idx) => {
      selectedMetal = idx;
      testing = false;
      bubbles = [];
      metals.forEach((_, i) => {
        const el = document.getElementById(`react-m-${i}`);
        el.style.borderColor = i === idx ? 'var(--border-glass-hover)' : 'transparent';
        el.style.background = i === idx ? 'rgba(255,255,255,0.04)' : 'transparent';
      });
      const m = metals[idx];
      document.getElementById('react-metal').textContent = m.name;
      document.getElementById('react-h2').textContent = m.reactivity > 0 ? 'Yes' : 'No';
      document.getElementById('react-h2').style.color = m.reactivity > 0 ? '#22c55e' : '#ef4444';
      document.getElementById('react-level').textContent = ['None','Low','Moderate','High','Very High'][m.reactivity];
      document.getElementById('react-obs').textContent = m.observation;
    };

    window._startReactTest = () => {
      testing = true;
      bubbles = [];
    };

    function draw() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      const m = metals[selectedMetal];
      const tubeX = w / 2, tubeW = 80, tubeH = 240, tubeY = h * 0.15;

      // Test tube
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tubeX - tubeW / 2, tubeY);
      ctx.lineTo(tubeX - tubeW / 2, tubeY + tubeH - 20);
      ctx.arc(tubeX, tubeY + tubeH - 20, tubeW / 2, Math.PI, 0, true);
      ctx.lineTo(tubeX + tubeW / 2, tubeY);
      ctx.stroke();

      // HCl acid (light blue-green)
      const acidY = tubeY + tubeH * 0.3;
      const acidH = tubeH * 0.55;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.beginPath();
      ctx.moveTo(tubeX - tubeW / 2 + 3, acidY);
      ctx.lineTo(tubeX - tubeW / 2 + 3, tubeY + tubeH - 20);
      ctx.arc(tubeX, tubeY + tubeH - 20, tubeW / 2 - 3, Math.PI, 0, true);
      ctx.lineTo(tubeX + tubeW / 2 - 3, acidY);
      ctx.closePath();
      ctx.fill();

      // Metal piece in acid
      if (testing) {
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.roundRect(tubeX - 8, tubeY + tubeH - 45, 16, 20, 3);
        ctx.fill();

        // Bubbles
        if (m.bubbleRate > 0 && Math.random() < m.bubbleRate) {
          bubbles.push({
            x: tubeX + (Math.random() - 0.5) * 30,
            y: tubeY + tubeH - 50,
            vy: -(1 + Math.random() * 2 * m.reactivity),
            opacity: 0.8,
            radius: 1.5 + Math.random() * 3
          });
        }
      }

      // Update bubbles
      bubbles = bubbles.filter(b => {
        b.y += b.vy;
        b.opacity -= 0.008;
        return b.opacity > 0 && b.y > tubeY - 30;
      });

      for (const b of bubbles) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.5})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${b.opacity * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Labels
      ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Dilute HCl', tubeX, acidY - 8);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText(testing ? m.name : 'Click "Add to Acid" to start', tubeX, h - 16);
      ctx.textAlign = 'start';

      animFrame = requestAnimationFrame(draw);
    }
    draw();

    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
      delete window._selectMetal;
      delete window._startReactTest;
    };
  };
})();
