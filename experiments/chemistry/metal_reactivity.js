/* Metal Reactivity Matrix */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['metal_reactivity_matrix'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Metal Reactivity?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Metal Reactivity'], ans: 3, exp: 'The experiment focuses on the specific principles of Metal Reactivity.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Metal Reactivity experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    const metals = ['Zn', 'Fe', 'Cu', 'Pb'];
    const salts = ['ZnSO₄', 'FeSO₄', 'CuSO₄', 'Pb(NO₃)₂'];
    const reactivity = { Zn: 4, Fe: 3, Pb: 2, Cu: 1 };
    // Matrix: row = metal, col = salt. true if metal displaces
    const matrix = [
      [false, true, true, true],   // Zn
      [false, false, true, true],  // Fe
      [false, false, false, false],// Cu
      [false, false, true, false], // Pb
    ];
    const observations = [
      ['No reaction', 'Iron deposited, Zn dissolves', 'Copper deposited, blue→colourless', 'Lead deposited, Zn dissolves'],
      ['No reaction', 'No reaction', 'Copper deposited, blue→green', 'Lead deposited on iron'],
      ['No reaction', 'No reaction', 'No reaction', 'No reaction'],
      ['No reaction', 'No reaction', 'Copper deposited, blue→colourless', 'No reaction'],
    ];
    let selectedRow = null, selectedCol = null;
    container.innerHTML = `
      <div class="sim-container">
        <div class="glass-card" style="padding:20px;overflow-x:auto;">
          <div class="sim-controls-title"><span class="ctrl-icon">📊</span> Displacement Reaction Matrix</div>
          <p style="font-size:12px;color:var(--text-muted);margin-bottom:16px;">Click a cell to see if displacement occurs. Green ✓ = displacement happens.</p>
          <table style="width:100%;border-collapse:separate;border-spacing:4px;">
            <tr>
              <th style="padding:10px;color:var(--text-muted);font-size:12px;">Metal ↓ / Salt →</th>
              ${salts.map(s => `<th style="padding:10px;color:var(--chemistry-primary);font-size:13px;font-weight:600;">${s}</th>`).join('')}
            </tr>
            ${metals.map((m, ri) => `
              <tr>
                <td style="padding:10px;font-weight:600;color:var(--text-primary);font-size:14px;">${m}</td>
                ${salts.map((s, ci) => `
                  <td id="matrix-${ri}-${ci}" onclick="window._selectMatrixCell(${ri},${ci})" style="
                    padding:14px;text-align:center;border-radius:8px;cursor:pointer;
                    background:${matrix[ri][ci] ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.06)'};
                    border:1px solid ${matrix[ri][ci] ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)'};
                    transition:all 0.2s;font-size:18px;
                  ">${matrix[ri][ci] ? '✅' : '❌'}</td>
                `).join('')}
              </tr>
            `).join('')}
          </table>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(VIVA_QUESTIONS)">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">🔬</span> Observation</div>
            <div id="matrix-obs" style="padding:12px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid var(--border-glass);">
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.5;">Click a cell in the matrix to see the detailed observation.</p>
            </div>
          </div>
          <div class="sim-results">
            <div class="sim-results-title"><span class="ctrl-icon">📋</span> Reactivity Series</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${Object.entries(reactivity).sort((a,b) => b[1]-a[1]).map(([m, r]) => `
                <div style="display:flex;align-items:center;gap:12px;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:8px;">
                  <span style="font-weight:700;color:var(--text-primary);min-width:30px;">${m}</span>
                  <div style="flex:1;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;">
                    <div style="width:${r * 25}%;height:100%;background:linear-gradient(90deg,#22c55e,#f59e0b);border-radius:3px;"></div>
                  </div>
                  <span style="font-size:11px;color:var(--text-muted);">Level ${r}</span>
                </div>
              `).join('')}
            </div>
            <p style="font-size:11px;color:var(--text-muted);margin-top:12px;text-align:center;">Zn > Fe > Pb > Cu</p>
          </div>
        </div>
      </div>
    `;
    window._selectMatrixCell = (r, c) => {
      const obs = observations[r][c];
      const reacts = matrix[r][c];
      document.getElementById('matrix-obs').innerHTML = `
        <p style="font-size:14px;font-weight:600;color:${reacts ? '#22c55e' : '#ef4444'};margin-bottom:8px;">${reacts ? '✓ Displacement occurs' : '✗ No reaction'}</p>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.5;"><strong>${metals[r]}</strong> + <strong>${salts[c]}</strong>: ${obs}</p>
        ${reacts ? `<p style="font-size:12px;color:var(--text-muted);margin-top:8px;">${metals[r]} is more reactive than the metal in ${salts[c]}, so it displaces it.</p>` : `<p style="font-size:12px;color:var(--text-muted);margin-top:8px;">${metals[r]} is less reactive, so no displacement occurs.</p>`}
      `;
      // Highlight cell
      document.querySelectorAll('[id^="matrix-"]').forEach(el => el.style.boxShadow = 'none');
      document.getElementById(`matrix-${r}-${c}`).style.boxShadow = `0 0 0 2px ${reacts ? '#22c55e' : '#ef4444'}`;
    };
    return function cleanup() { delete window._selectMatrixCell; };
  };
})();
