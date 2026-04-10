/* ============================================================
   LATERAL DISPLACEMENT BY REFRACTION — Glass Slab Experiment
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['lateral_displacement_refraction'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Lateral Displacement?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Lateral Displacement'], ans: 3, exp: 'The experiment focuses on the specific principles of Lateral Displacement.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Lateral Displacement experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let incidentAngle = 40;
    let slabThickness = 60;
    let refractiveIndex = 1.5;
    let animFrame, canvas, ctx;
    let time = 0;

    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap"><canvas id="lat-canvas" width="800" height="420"></canvas></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">📐</span> Controls</div>
            <div class="sim-control-row">
              <span class="sim-control-label">Angle of Incidence</span>
              <input type="range" class="sim-control-slider" id="lat-angle" min="5" max="80" step="1" value="${incidentAngle}" />
              <span class="sim-control-value" id="lat-angle-val">${incidentAngle}°</span>
            </div>
            <div class="sim-control-row">
              <span class="sim-control-label">Slab Thickness (t)</span>
              <input type="range" class="sim-control-slider" id="lat-thick" min="20" max="120" step="1" value="${slabThickness}" />
              <span class="sim-control-value" id="lat-thick-val">${slabThickness} px</span>
            </div>
            <div class="sim-control-row">
              <span class="sim-control-label">Refractive Index (n)</span>
              <input type="range" class="sim-control-slider" id="lat-n" min="1.1" max="2.5" step="0.05" value="${refractiveIndex}" />
              <span class="sim-control-value" id="lat-n-val">${refractiveIndex}</span>
            </div>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(VIVA_QUESTIONS)">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Measurements</div>
            <div class="sim-result-row"><span class="sim-result-label">Angle of Incidence (i)</span><span class="sim-result-value" id="lat-i" style="color:#3b82f6">${incidentAngle}°</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Angle of Refraction (r)</span><span class="sim-result-value" id="lat-r" style="color:#22c55e">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Lateral Displacement (d)</span><span class="sim-result-value" id="lat-d" style="color:#f59e0b">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Emergent Angle</span><span class="sim-result-value" id="lat-e" style="color:#8b5cf6">—</span></div>
            <div style="margin-top:12px;padding:10px;background:rgba(59,130,246,0.06);border-radius:8px;border:1px solid rgba(59,130,246,0.15);">
              <p style="font-size:11px;color:var(--text-muted);line-height:1.5;"><strong>Formula:</strong> d = t × sin(i−r) / cos(r)<br/>Emergent ray is parallel to incident ray but laterally displaced.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('lat-canvas');
    ctx = canvas.getContext('2d');

    document.getElementById('lat-angle').addEventListener('input', e => {
      incidentAngle = parseInt(e.target.value);
      document.getElementById('lat-angle-val').textContent = incidentAngle + '°';
      document.getElementById('lat-i').textContent = incidentAngle + '°';
    });
    document.getElementById('lat-thick').addEventListener('input', e => {
      slabThickness = parseInt(e.target.value);
      document.getElementById('lat-thick-val').textContent = slabThickness + ' px';
    });
    document.getElementById('lat-n').addEventListener('input', e => {
      refractiveIndex = parseFloat(e.target.value);
      document.getElementById('lat-n-val').textContent = refractiveIndex.toFixed(2);
    });

    function draw() {
      const w = canvas.width, h = canvas.height;
      time += 0.02;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, w, h);

      // Glass slab
      const slabX = w * 0.3, slabW = w * 0.4;
      const slabY = h / 2 - slabThickness;
      const slabH = slabThickness * 2;

      ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 2;
      ctx.fillRect(slabX, slabY, slabW, slabH);
      ctx.strokeRect(slabX, slabY, slabW, slabH);

      // Label
      ctx.fillStyle = 'rgba(59,130,246,0.5)';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`Glass Slab (n = ${refractiveIndex.toFixed(2)})`, slabX + slabW / 2, h / 2 + 4);

      // Calculate refraction
      const iRad = incidentAngle * Math.PI / 180;
      const sinR = Math.sin(iRad) / refractiveIndex;
      const rRad = Math.asin(Math.min(1, sinR));
      const rDeg = rRad * 180 / Math.PI;

      // Lateral displacement
      const t = slabH; // actual slab thickness in pixels
      const lateralDisp = t * Math.sin(iRad - rRad) / Math.cos(rRad);

      // Entry point
      const entryX = slabX + slabW * 0.4;
      const entryY = slabY;

      // Exit point (on bottom face)
      const dx = t * Math.tan(rRad);
      const exitX = entryX + dx;
      const exitY = slabY + slabH;

      // Normal at entry (dashed vertical)
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(entryX, slabY - 80);
      ctx.lineTo(entryX, slabY + 80);
      ctx.stroke();

      // Normal at exit
      ctx.beginPath();
      ctx.moveTo(exitX, exitY - 80);
      ctx.lineTo(exitX, exitY + 80);
      ctx.stroke();
      ctx.setLineDash([]);

      // Incident ray
      const incLength = 300;
      const incSrcX = entryX - incLength * Math.sin(iRad);
      const incSrcY = entryY - incLength * Math.cos(iRad);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(incSrcX, incSrcY);
      ctx.lineTo(entryX, entryY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Refracted ray inside slab
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(entryX, entryY);
      ctx.lineTo(exitX, exitY);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Emergent ray (parallel to incident)
      const emLength = 250;
      const emEndX = exitX + emLength * Math.sin(iRad);
      const emEndY = exitY + emLength * Math.cos(iRad);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(exitX, exitY);
      ctx.lineTo(emEndX, emEndY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Lateral displacement indicator
      // Show the perpendicular distance between incident and emergent rays
      const midY = exitY + 60;
      const origX = entryX + (midY - entryY) * Math.tan(Math.PI / 2 - iRad); // projected incident position
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      // Extend incident ray (dashed)
      ctx.strokeStyle = 'rgba(239,68,68,0.3)';
      ctx.beginPath();
      ctx.moveTo(entryX, entryY);
      ctx.lineTo(entryX + 300 * Math.sin(iRad), entryY + 300 * Math.cos(iRad));
      ctx.stroke();
      ctx.setLineDash([]);

      // d label with arrow
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      const dLineY = exitY + 30;
      const projX = entryX + (dLineY - entryY) * Math.sin(iRad) / Math.cos(iRad); // where incident would be
      const actX = exitX + (dLineY - exitY) * Math.sin(iRad) / Math.cos(iRad); // where emergent is
      ctx.beginPath(); ctx.moveTo(projX, dLineY); ctx.lineTo(actX, dLineY); ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`d = ${lateralDisp.toFixed(1)} px`, (projX + actX) / 2, dLineY - 8);

      // Angle arcs
      drawAngleArc(ctx, entryX, entryY, -Math.PI / 2, -Math.PI / 2 + iRad, 30, '#ef4444', 'i');
      drawAngleArc(ctx, entryX, entryY, Math.PI / 2, Math.PI / 2 - rRad, 25, '#22c55e', 'r');

      // Update readouts
      document.getElementById('lat-r').textContent = rDeg.toFixed(1) + '°';
      document.getElementById('lat-d').textContent = lateralDisp.toFixed(2) + ' units';
      document.getElementById('lat-e').textContent = incidentAngle + '° (same as i)';

      // Labels
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Lateral Displacement by a Rectangular Glass Slab', w / 2, h - 10);
      ctx.textAlign = 'start';

      animFrame = requestAnimationFrame(draw);
    }

    function drawAngleArc(ctx, cx, cy, startAngle, endAngle, radius, color, label) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.min(startAngle, endAngle), Math.max(startAngle, endAngle));
      ctx.stroke();
      const midAngle = (startAngle + endAngle) / 2;
      ctx.fillStyle = color;
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx + Math.cos(midAngle) * (radius + 12), cy + Math.sin(midAngle) * (radius + 12));
    }

    draw();

    return function cleanup() { if (animFrame) cancelAnimationFrame(animFrame); };
  };
})();
