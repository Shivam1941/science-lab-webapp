/* ============================================================
   PRISM REFRACTION & DISPERSION — Light through a Glass Prism
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['refraction_dispersion_prism'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Prism?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Prism'], ans: 3, exp: 'The experiment focuses on the specific principles of Prism.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Prism experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let incidentAngle = 45;
    let wavelength = 550;
    let whiteLight = false;
    let animFrame, canvas, ctx;
    let time = 0;

    const spectralColors = [
      { wl:700, name:'Red', color:'#ef4444' },
      { wl:640, name:'Orange', color:'#f97316' },
      { wl:590, name:'Yellow', color:'#eab308' },
      { wl:560, name:'Green', color:'#22c55e' },
      { wl:520, name:'Cyan', color:'#06b6d4' },
      { wl:470, name:'Blue', color:'#3b82f6' },
      { wl:420, name:'Violet', color:'#8b5cf6' },
    ];

    function wavelengthToColor(wl) {
      if (wl <= 420) return '#8b5cf6';
      if (wl <= 470) return '#3b82f6';
      if (wl <= 520) return '#06b6d4';
      if (wl <= 560) return '#22c55e';
      if (wl <= 590) return '#eab308';
      if (wl <= 640) return '#f97316';
      return '#ef4444';
    }

    function refractiveIndex(wl) {
      const lambda = wl / 1000;
      return 1.49 + 0.005 / (lambda * lambda);
    }

    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap"><canvas id="prism-canvas" width="800" height="420"></canvas></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">🔬</span> Controls</div>
            <div class="sim-control-row">
              <span class="sim-control-label">Incident Angle</span>
              <input type="range" class="sim-control-slider" id="prism-angle" min="15" max="75" step="1" value="${incidentAngle}" />
              <span class="sim-control-value" id="prism-angle-val">${incidentAngle}°</span>
            </div>
            <div class="sim-control-row">
              <span class="sim-control-label">Wavelength</span>
              <input type="range" class="sim-control-slider" id="prism-wl" min="380" max="750" step="5" value="${wavelength}" style="background:linear-gradient(90deg,#8b5cf6,#3b82f6,#06b6d4,#22c55e,#eab308,#f97316,#ef4444);" />
              <span class="sim-control-value" id="prism-wl-val">${wavelength} nm</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;margin-top:8px;">
              <label style="font-size:13px;color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;gap:8px;">
                <input type="checkbox" id="prism-white" ${whiteLight ? 'checked' : ''} style="accent-color:#8b5cf6;" />
                White Light Mode (Dispersion)
              </label>
            </div>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Measurements</div>
            <div class="sim-result-row"><span class="sim-result-label">Angle of Incidence (i)</span><span class="sim-result-value" id="prism-i" style="color:#3b82f6">${incidentAngle}°</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Angle of Emergence (e)</span><span class="sim-result-value" id="prism-e" style="color:#22c55e">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Angle of Deviation (D)</span><span class="sim-result-value" id="prism-d" style="color:#f59e0b">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Refractive Index (n)</span><span class="sim-result-value" id="prism-n" style="color:#8b5cf6">—</span></div>
            <div style="margin-top:12px;padding:10px;background:rgba(139,92,246,0.06);border-radius:8px;border:1px solid rgba(139,92,246,0.15);">
              <p style="font-size:11px;color:var(--text-muted);line-height:1.5;">Snell's Law: n₁ sin(i) = n₂ sin(r)<br/>Prism angle A = 60°. Deviation D = (i + e) − A</p>
            </div>
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('prism-canvas');
    ctx = canvas.getContext('2d');

    document.getElementById('prism-angle').addEventListener('input', e => {
      incidentAngle = parseInt(e.target.value);
      document.getElementById('prism-angle-val').textContent = incidentAngle + '°';
      document.getElementById('prism-i').textContent = incidentAngle + '°';
    });
    document.getElementById('prism-wl').addEventListener('input', e => {
      wavelength = parseInt(e.target.value);
      document.getElementById('prism-wl-val').textContent = wavelength + ' nm';
    });
    document.getElementById('prism-white').addEventListener('change', e => {
      whiteLight = e.target.checked;
    });

    const A = 60 * Math.PI / 180; // Prism angle

    function traceRay(iDeg, n) {
      const iRad = iDeg * Math.PI / 180;
      const sinR1 = Math.sin(iRad) / n;
      if (Math.abs(sinR1) > 1) return null; // TIR
      const r1 = Math.asin(sinR1);
      const r2 = A - r1;
      const sinE = n * Math.sin(r2);
      if (Math.abs(sinE) > 1) return null; // TIR at second surface
      const e = Math.asin(sinE);
      const D = iRad + e - A;
      return { i: iDeg, e: e * 180 / Math.PI, D: D * 180 / Math.PI, r1: r1 * 180 / Math.PI, r2: r2 * 180 / Math.PI, n };
    }

    function draw() {
      const w = canvas.width, h = canvas.height;
      time += 0.02;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, w, h);

      // Prism triangle
      const cx = w * 0.5, cy = h * 0.55;
      const side = 200;
      const prismH = side * Math.sqrt(3) / 2;
      const v0 = { x: cx, y: cy - prismH * 0.6 }; // top
      const v1 = { x: cx - side / 2, y: cy + prismH * 0.4 }; // bottom-left
      const v2 = { x: cx + side / 2, y: cy + prismH * 0.4 }; // bottom-right

      // Prism fill
      ctx.beginPath();
      ctx.moveTo(v0.x, v0.y);
      ctx.lineTo(v1.x, v1.y);
      ctx.lineTo(v2.x, v2.y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // "A = 60°" label
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('A = 60°', v0.x, v0.y - 10);

      // Trace rays
      const rays = whiteLight 
        ? spectralColors.map(sc => ({ ...traceRay(incidentAngle, refractiveIndex(sc.wl)), color: sc.color, wl: sc.wl }))
        : [{ ...traceRay(incidentAngle, refractiveIndex(wavelength)), color: wavelengthToColor(wavelength), wl: wavelength }];

      // Left face midpoint and normal
      const leftMidX = (v0.x + v1.x) / 2, leftMidY = (v0.y + v1.y) / 2;
      // Left face angle
      const leftFaceAngle = Math.atan2(v1.y - v0.y, v1.x - v0.x);
      const leftNormalAngle = leftFaceAngle - Math.PI / 2;

      // Entry point on left face
      const entryFrac = 0.5;
      const entryX = v0.x + (v1.x - v0.x) * entryFrac;
      const entryY = v0.y + (v1.y - v0.y) * entryFrac;

      // Draw normal at entry (dashed)
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(entryX - Math.cos(leftNormalAngle) * 80, entryY - Math.sin(leftNormalAngle) * 80);
      ctx.lineTo(entryX + Math.cos(leftNormalAngle) * 80, entryY + Math.sin(leftNormalAngle) * 80);
      ctx.stroke();
      ctx.setLineDash([]);

      for (const ray of rays) {
        if (!ray || ray.D === undefined) continue;

        const rayColor = ray.color;
        // Incident ray: comes from the left
        const incidentDir = leftNormalAngle + Math.PI + (incidentAngle * Math.PI / 180);
        const srcX = entryX - Math.cos(incidentDir) * 350;
        const srcY = entryY - Math.sin(incidentDir) * 350;

        ctx.strokeStyle = rayColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = rayColor;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(srcX, srcY);
        ctx.lineTo(entryX, entryY);
        ctx.stroke();

        // Right face
        const rightFaceAngle = Math.atan2(v2.y - v0.y, v2.x - v0.x);
        const rightNormalAngle = rightFaceAngle + Math.PI / 2;

        // Exit point on right face
        const exitFrac = 0.5 + (ray.wl - 550) * 0.0003; // Slight spread for dispersion
        const exitX = v0.x + (v2.x - v0.x) * Math.max(0.3, Math.min(0.7, exitFrac));
        const exitY = v0.y + (v2.y - v0.y) * Math.max(0.3, Math.min(0.7, exitFrac));

        // Ray inside prism
        ctx.strokeStyle = rayColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(entryX, entryY);
        ctx.lineTo(exitX, exitY);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Emergent ray
        const emergeDir = rightNormalAngle + (ray.e * Math.PI / 180);
        const outX = exitX + Math.cos(emergeDir) * 400;
        const outY = exitY + Math.sin(emergeDir) * 400;

        ctx.strokeStyle = rayColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(exitX, exitY);
        ctx.lineTo(outX, outY);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Update readouts (use first/only ray)
      const mainRay = rays[0];
      if (mainRay && mainRay.e !== undefined) {
        document.getElementById('prism-e').textContent = mainRay.e.toFixed(1) + '°';
        document.getElementById('prism-d').textContent = mainRay.D.toFixed(1) + '°';
        document.getElementById('prism-n').textContent = mainRay.n.toFixed(4);
      }

      // Spectrum label for white light
      if (whiteLight) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('VIBGYOR Spectrum (Dispersion)', w * 0.75, h - 20);

        // Label each color
        spectralColors.forEach((sc, i) => {
          const y = h - 40 - i * 16;
          ctx.fillStyle = sc.color;
          ctx.font = '10px Inter';
          ctx.textAlign = 'left';
          ctx.fillText(`${sc.name} (${sc.wl} nm)`, w - 140, y);
        });
      }

      // Ray box
      const boxX = 40, boxY = entryY - 35;
      ctx.fillStyle = '#1f2937';
      ctx.strokeStyle = 'rgba(147,197,253,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, 60, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Light Source', boxX + 30, boxY + 15);
      ctx.textAlign = 'start';

      animFrame = requestAnimationFrame(draw);
    }
    draw();

    return function cleanup() { if (animFrame) cancelAnimationFrame(animFrame); };
  };
})();
