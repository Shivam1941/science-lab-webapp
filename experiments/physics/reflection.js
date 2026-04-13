/* ============================================================
   REFLECTION OF LIGHT — Interactive Mirror Simulation
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};

  window.experimentRenderers['reflection_of_light'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Reflection?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Reflection'], ans: 3, exp: 'The experiment focuses on the specific principles of Reflection.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Reflection experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let incidentAngle = 30;
    let animFrame = null;
    let canvas, ctx;
    let rayAnim = 0;

    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap">
          <canvas id="reflection-canvas" width="800" height="500"></canvas>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">🎛️</span> Controls</div>
            <div class="sim-control-row">
              <span class="sim-control-label">Angle of Incidence</span>
              <input type="range" class="sim-control-slider" id="ref-angle" min="0" max="85" step="1" value="${incidentAngle}" />
              <span class="sim-control-value" id="ref-angle-val">${incidentAngle}°</span>
            </div>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Measurements</div>
            <div class="sim-result-row">
              <span class="sim-result-label">∠ Incidence (i)</span>
              <span class="sim-result-value" id="ref-i" style="color:#f59e0b">${incidentAngle}°</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">∠ Reflection (r)</span>
              <span class="sim-result-value" id="ref-r" style="color:#22c55e">${incidentAngle}°</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Law Verified?</span>
              <span class="sim-result-value" id="ref-law" style="color:#3b82f6">✓ i = r</span>
            </div>
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('reflection-canvas');
    ctx = canvas.getContext('2d');

    document.getElementById('ref-angle').addEventListener('input', e => {
      incidentAngle = parseInt(e.target.value);
      document.getElementById('ref-angle-val').textContent = incidentAngle + '°';
      document.getElementById('ref-i').textContent = incidentAngle + '°';
      document.getElementById('ref-r').textContent = incidentAngle + '°';
    });

    function draw() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const mirrorX = w / 2;
      const mirrorY = h * 0.6;
      const mirrorLen = 300;

      // Mirror
      const mirGrad = ctx.createLinearGradient(mirrorX - mirrorLen / 2, mirrorY, mirrorX + mirrorLen / 2, mirrorY);
      mirGrad.addColorStop(0, 'rgba(148, 163, 184, 0.3)');
      mirGrad.addColorStop(0.5, 'rgba(148, 163, 184, 0.8)');
      mirGrad.addColorStop(1, 'rgba(148, 163, 184, 0.3)');
      ctx.fillStyle = mirGrad;
      ctx.fillRect(mirrorX - mirrorLen / 2, mirrorY, mirrorLen, 6);

      // Mirror hatching
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 1;
      for (let x = mirrorX - mirrorLen / 2; x < mirrorX + mirrorLen / 2; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, mirrorY + 6);
        ctx.lineTo(x - 8, mirrorY + 18);
        ctx.stroke();
      }

      // Normal (dashed)
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(mirrorX, mirrorY - 200);
      ctx.lineTo(mirrorX, mirrorY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Normal label
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Normal', mirrorX, mirrorY - 210);

      const angleRad = incidentAngle * Math.PI / 180;
      const rayLen = 250;

      // Incident ray
      const incEndX = mirrorX - Math.sin(angleRad) * rayLen;
      const incEndY = mirrorY - Math.cos(angleRad) * rayLen;

      // Animated ray glow
      rayAnim = (rayAnim + 0.03) % 1;

      // Incident ray
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(incEndX, incEndY);
      ctx.lineTo(mirrorX, mirrorY);
      ctx.stroke();

      // Arrow on incident ray
      const arrowMidX = (incEndX + mirrorX) / 2;
      const arrowMidY = (incEndY + mirrorY) / 2;
      const arrowAngle = Math.atan2(mirrorY - incEndY, mirrorX - incEndX);
      drawArrowhead(ctx, arrowMidX, arrowMidY, arrowAngle, '#f59e0b');

      // Reflected ray
      const refEndX = mirrorX + Math.sin(angleRad) * rayLen;
      const refEndY = mirrorY - Math.cos(angleRad) * rayLen;

      ctx.strokeStyle = '#22c55e';
      ctx.shadowColor = 'rgba(34, 197, 94, 0.5)';
      ctx.beginPath();
      ctx.moveTo(mirrorX, mirrorY);
      ctx.lineTo(refEndX, refEndY);
      ctx.stroke();

      // Arrow on reflected ray
      const refArrowMidX = (mirrorX + refEndX) / 2;
      const refArrowMidY = (mirrorY + refEndY) / 2;
      const refArrowAngle = Math.atan2(refEndY - mirrorY, refEndX - mirrorX);
      drawArrowhead(ctx, refArrowMidX, refArrowMidY, refArrowAngle, '#22c55e');

      ctx.shadowBlur = 0;

      // Angle arcs
      if (incidentAngle > 0) {
        const arcR = 60;
        // Incident angle arc
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mirrorX, mirrorY, arcR, -Math.PI / 2, -Math.PI / 2 + angleRad, false);
        ctx.stroke();

        // Reflected angle arc
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.beginPath();
        ctx.arc(mirrorX, mirrorY, arcR, -Math.PI / 2 - angleRad, -Math.PI / 2, false);
        ctx.stroke();

        // Angle labels
        ctx.font = 'bold 14px JetBrains Mono';
        const labelR = arcR + 18;
        ctx.fillStyle = '#f59e0b';
        const iLabelAngle = -Math.PI / 2 + angleRad / 2;
        ctx.textAlign = 'center';
        ctx.fillText('i=' + incidentAngle + '°', mirrorX + Math.cos(iLabelAngle) * labelR, mirrorY + Math.sin(iLabelAngle) * labelR);

        ctx.fillStyle = '#22c55e';
        const rLabelAngle = -Math.PI / 2 - angleRad / 2;
        ctx.fillText('r=' + incidentAngle + '°', mirrorX + Math.cos(rLabelAngle) * labelR, mirrorY + Math.sin(rLabelAngle) * labelR);
      }

      // Labels
      ctx.font = '13px Inter';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'left';
      ctx.fillText('Incident Ray', incEndX - 20, incEndY - 10);
      ctx.fillStyle = '#22c55e';
      ctx.fillText('Reflected Ray', refEndX - 10, refEndY - 10);
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('Plane Mirror', mirrorX, mirrorY + 32);

      // Point of incidence glow
      ctx.beginPath();
      ctx.arc(mirrorX, mirrorY, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mirrorX, mirrorY, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fill();

      ctx.textAlign = 'start';

      animFrame = requestAnimationFrame(draw);
    }

    function drawArrowhead(ctx, x, y, angle, color) {
      const size = 10;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
      ctx.lineTo(x + Math.cos(angle + 2.5) * size * 0.6, y + Math.sin(angle + 2.5) * size * 0.6);
      ctx.lineTo(x + Math.cos(angle - 2.5) * size * 0.6, y + Math.sin(angle - 2.5) * size * 0.6);
      ctx.closePath();
      ctx.fill();
    }

    draw();

    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  };
})();
