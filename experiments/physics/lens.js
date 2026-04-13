/* ============================================================
   LENS FORMATION — Ray Diagram Simulation
   Convex and Concave lens with interactive object positioning
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};

  window.experimentRenderers['lens_formation'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Lens?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Lens'], ans: 3, exp: 'The experiment focuses on the specific principles of Lens.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Lens experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let focalLength = 15;
    let objectDist = -30; // negative = left of lens
    let objectHeight = 5;
    let lensType = 'convex'; // convex or concave
    let animFrame = null;
    let canvas, ctx;

    function calcImage() {
      // Cartesian convention: Light travels left to right.
      // u is negative. f is positive for convex, negative for concave.
      const f = lensType === 'convex' ? focalLength : -focalLength;
      const u = objectDist; 
      
      if (Math.abs(u) === Math.abs(f) && lensType === 'convex') {
        return { v: Infinity, h: Infinity, nature: 'Real, at infinity', m: Infinity };
      }
      
      // Lens formula: 1/f = 1/v - 1/u => 1/v = 1/f + 1/u
      const v = 1 / ((1 / f) + (1 / u));
      const m = v / u;
      const h = m * objectHeight;
      
      let nature = '';
      if (lensType === 'convex') {
        if (Math.abs(u) > 2 * focalLength) nature = 'Real, inverted, diminished';
        else if (Math.abs(u) === 2 * focalLength) nature = 'Real, inverted, same size';
        else if (Math.abs(u) > focalLength) nature = 'Real, inverted, magnified';
        else nature = 'Virtual, erect, magnified';
      } else {
        nature = 'Virtual, erect, diminished'; // Concave always forms virtual, erect, diminished image
      }
      return { v, h, nature, m };
    }

    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap">
          <canvas class="lens-canvas" width="800" height="450"></canvas>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">🎛️</span> Controls</div>
            <div class="sim-control-row">
              <span class="sim-control-label">Lens Type</span>
              <div class="sim-btn-group">
                <button class="sim-btn btn-primary lens-convex">Convex</button>
                <button class="sim-btn lens-concave">Concave</button>
              </div>
            </div>
            <div class="sim-control-row">
              <span class="sim-control-label">Focal Length (cm)</span>
              <input type="range" class="sim-control-slider lens-focal" min="5" max="30" step="1" value="${focalLength}" />
              <span class="sim-control-value lens-focal-val">${focalLength} cm</span>
            </div>
            <div class="sim-control-row">
              <span class="sim-control-label">Object Dist (cm)</span>
              <input type="range" class="sim-control-slider lens-obj-dist" min="5" max="80" step="1" value="${Math.abs(objectDist)}" />
              <span class="sim-control-value lens-obj-dist-val">${Math.abs(objectDist)} cm</span>
            </div>
            <div class="sim-control-row">
              <span class="sim-control-label">Object Height (cm)</span>
              <input type="range" class="sim-control-slider lens-obj-h" min="1" max="10" step="0.5" value="${objectHeight}" />
              <span class="sim-control-value lens-obj-h-val">${objectHeight} cm</span>
            </div>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Image Properties</div>
            <div class="sim-result-row">
              <span class="sim-result-label">Image Distance (v)</span>
              <span class="sim-result-value lens-img-dist" style="color:var(--physics-primary)">—</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Image Height</span>
              <span class="sim-result-value lens-img-h" style="color:#a855f7">—</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Magnification</span>
              <span class="sim-result-value lens-mag" style="color:#f59e0b">—</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Nature</span>
              <span class="sim-result-value lens-nature" style="color:#22c55e;font-size:11px;">—</span>
            </div>
          </div>
        </div>
      </div>
    `;

    canvas = container.querySelector('.lens-canvas');
    ctx = canvas.getContext('2d');

    const btnConvex = container.querySelector('.lens-convex');
    const btnConcave = container.querySelector('.lens-concave');
    const inputFocal = container.querySelector('.lens-focal');
    const valFocal = container.querySelector('.lens-focal-val');
    const inputObjDist = container.querySelector('.lens-obj-dist');
    const valObjDist = container.querySelector('.lens-obj-dist-val');
    const inputObjH = container.querySelector('.lens-obj-h');
    const valObjH = container.querySelector('.lens-obj-h-val');

    const resDist = container.querySelector('.lens-img-dist');
    const resH = container.querySelector('.lens-img-h');
    const resMag = container.querySelector('.lens-mag');
    const resNature = container.querySelector('.lens-nature');

    btnConvex.addEventListener('click', () => {
      lensType = 'convex';
      btnConvex.className = 'sim-btn btn-primary lens-convex';
      btnConcave.className = 'sim-btn lens-concave';
      updateResults();
    });

    btnConcave.addEventListener('click', () => {
      lensType = 'concave';
      btnConcave.className = 'sim-btn btn-primary lens-concave';
      btnConvex.className = 'sim-btn lens-convex';
      updateResults();
    });

    inputFocal.addEventListener('input', e => {
      focalLength = parseInt(e.target.value);
      valFocal.textContent = focalLength + ' cm';
      updateResults();
    });

    inputObjDist.addEventListener('input', e => {
      objectDist = -parseInt(e.target.value);
      valObjDist.textContent = Math.abs(objectDist) + ' cm';
      updateResults();
    });

    inputObjH.addEventListener('input', e => {
      objectHeight = parseFloat(e.target.value);
      valObjH.textContent = objectHeight + ' cm';
      updateResults();
    });

    function updateResults() {
      const img = calcImage();
      if (Math.abs(img.v) > 9999) {
        resDist.textContent = '∞';
        resH.textContent = '∞';
        resMag.textContent = '∞';
      } else {
        resDist.textContent = img.v.toFixed(1) + ' cm';
        resH.textContent = Math.abs(img.h).toFixed(1) + ' cm';
        resMag.textContent = Math.abs(img.m).toFixed(2) + 'x';
      }
      resNature.textContent = img.nature;
    }
    
    updateResults();

    function draw() {
      if (!ctx) return;
      try {
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Background
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e293b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2, cy = h / 2;
        const scale = 4; // pixels per cm

        // Principal axis
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(20, cy);
        ctx.lineTo(w - 20, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Lens body
        const lensH = 160;
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
        ctx.lineWidth = 3;
        if (lensType === 'convex') {
          ctx.beginPath();
          ctx.moveTo(cx, cy - lensH / 2);
          ctx.quadraticCurveTo(cx + 20, cy, cx, cy + lensH / 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx, cy - lensH / 2);
          ctx.quadraticCurveTo(cx - 20, cy, cx, cy + lensH / 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(cx, cy - lensH / 2);
          ctx.quadraticCurveTo(cx - 15, cy, cx, cy + lensH / 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx, cy - lensH / 2);
          ctx.quadraticCurveTo(cx + 15, cy, cx, cy + lensH / 2);
          ctx.stroke();
        }

        // Arrows at lens ends
        ctx.fillStyle = 'rgba(147, 197, 253, 0.6)';
        drawTriangle(ctx, cx, cy - lensH / 2, 'up');
        drawTriangle(ctx, cx, cy + lensH / 2, 'down');

        // Focal points (F and 2F)
        const fDist = focalLength * scale;
        
        ctx.fillStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.beginPath(); ctx.arc(cx + fDist, cy, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx - fDist, cy, 4, 0, Math.PI * 2); ctx.fill();
        
        ctx.fillStyle = '#f59e0b';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('F', cx + fDist, cy + 18);
        ctx.fillText('F', cx - fDist, cy + 18);

        ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.beginPath(); ctx.arc(cx + fDist * 2, cy, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx - fDist * 2, cy, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#a855f7';
        ctx.fillText('2F', cx + fDist * 2, cy + 18);
        ctx.fillText('2F', cx - fDist * 2, cy + 18);

        // Optical centre label
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText('O', cx - 10, cy + 18);
        ctx.textAlign = 'start';

        // Object (arrow)
        const objX = cx + objectDist * scale;
        const objH = objectHeight * scale;
        drawObjectArrow(ctx, objX, cy, objH, '#3b82f6');
        ctx.fillStyle = '#60a5fa';
        ctx.fillText('Object', objX - 15, cy + objH + 20);

        // Image
        const img = calcImage();
        if (Math.abs(img.v) < 500) {
          const imgX = cx + img.v * scale;
          const imgH = img.h * scale;
          const isVirtual = img.v < 0;

          if (isVirtual) {
            ctx.setLineDash([4, 4]);
          }
          drawObjectArrow(ctx, imgX, cy, imgH, isVirtual ? '#22c55e' : '#f97316');
          ctx.setLineDash([]);
          ctx.fillStyle = isVirtual ? '#22c55e' : '#f97316';
          
          let imgLabelY = cy - imgH;
          imgLabelY += (imgH > 0) ? -15 : 20; 
          ctx.fillText('Image', imgX - 15, imgLabelY);

          drawRays(ctx, cx, cy, objX, objH, imgX, imgH, fDist, lensH, lensType, isVirtual);
        }

      } catch (err) {
        ctx.fillStyle = 'red';
        ctx.font = '14px monospace';
        ctx.fillText('Render Error: ' + err.message, 20, 30);
      }
      animFrame = requestAnimationFrame(draw);
    }

    function drawObjectArrow(ctx, x, cy, h, color) {
      if (!isFinite(x) || !isFinite(h)) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x, cy);
      ctx.lineTo(x, cy - h);
      ctx.stroke();
      
      // Arrowhead
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, cy - h);
      ctx.lineTo(x - 5, cy - h + (h > 0 ? 10 : -10));
      ctx.lineTo(x + 5, cy - h + (h > 0 ? 10 : -10));
      ctx.closePath();
      ctx.fill();
    }

    function drawRays(ctx, cx, cy, objX, objH, imgX, imgH, fDist, lensH, type, isVirtual) {
      if (!isFinite(objX) || !isFinite(imgX)) return;
      const objTopY = cy - objH;
      const imgTopY = cy - imgH;

      // Ray 1: Parallel to principal axis -> through F
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(objX, objTopY);
      ctx.lineTo(cx, objTopY); 
      ctx.stroke();

      if (type === 'convex') {
        const Fx = cx + fDist;
        if (isVirtual) {
          // virtual extension backwards to image
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(cx, objTopY);
          ctx.lineTo(imgX, imgTopY);
          ctx.stroke();
          ctx.setLineDash([]);
          // real ray forward through F
          ctx.beginPath();
          ctx.moveTo(cx, objTopY);
          // extending line through (cx, objTopY) and (Fx, cy)
          const slope = (cy - objTopY) / (Fx - cx);
          const drawEndX = cx + 300;
          ctx.lineTo(drawEndX, objTopY + slope * (drawEndX - cx));
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(cx, objTopY);
          ctx.lineTo(imgX, imgTopY);
          // extend lightly beyond image
          const slope = (imgTopY - objTopY) / (imgX - cx);
          ctx.lineTo(imgX + 100, imgTopY + slope * 100);
          ctx.stroke();
        }
      } else {
        // Concave lens logic
        const Fx = cx - fDist;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        // virtual extension towards Primary F (left side)
        ctx.moveTo(cx, objTopY);
        ctx.lineTo(imgX, imgTopY);
        ctx.stroke();
        ctx.setLineDash([]);
        // real refracted ray diverges
        ctx.beginPath();
        ctx.moveTo(cx, objTopY);
        const slope = (objTopY - cy) / (cx - Fx); 
        const drawEndX = cx + 300;
        ctx.lineTo(drawEndX, objTopY - slope * (drawEndX - cx));
        ctx.stroke();
      }

      // Ray 2: Through optical centre -> undeviated
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.beginPath();
      ctx.moveTo(objX, objTopY);
      
      if (isVirtual) {
        // draw backward extension solid or dashed? Usually dashed for virtual
        ctx.setLineDash([4, 3]);
        ctx.lineTo(imgX, imgTopY);
        ctx.stroke();
        ctx.setLineDash([]);
        // forward real ray
        ctx.beginPath();
        ctx.moveTo(objX, objTopY);
        const slope = (cy - objTopY) / (cx - objX);
        const drawEndX = cx + 300;
        ctx.lineTo(drawEndX, objTopY + slope * (drawEndX - objX));
        ctx.stroke();
      } else {
        ctx.lineTo(imgX, imgTopY);
        const slope = (imgTopY - objTopY) / (imgX - objX);
        ctx.lineTo(imgX + 100, imgTopY + slope * 100);
        ctx.stroke();
      }
    }

    function drawTriangle(ctx, x, y, dir) {
      const size = 6;
      ctx.beginPath();
      if (dir === 'up') {
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x + size, y + size);
      } else {
        ctx.moveTo(x, y + size);
        ctx.lineTo(x - size, y - size);
        ctx.lineTo(x + size, y - size);
      }
      ctx.closePath();
      ctx.fill();
    }

    draw();

    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  };
})();
