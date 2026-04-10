/* ============================================================
   BUOYANCY & DENSITY LAB — Archimedes' Principle
   ============================================================ */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['buoyancy_density_lab'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is the primary principle behind Buoyancy?', opts: ['Conservation of Energy', 'Newton\'s Laws', 'Ideal Gas Law', 'Specific Principle of Buoyancy'], ans: 3, exp: 'The experiment focuses on the specific principles of Buoyancy.' },
      { q: 'Which variable is manipulated in this setup?', opts: ['Dependent variable', 'Independent variable', 'Control variable', 'Constant'], ans: 1, exp: 'The independent variable is the one you change.' },
      { q: 'What is the expected outcome of a successful Buoyancy experiment?', opts: ['Random noise', 'Theoretical prediction matches data', 'Equipment failure', 'No change'], ans: 1, exp: 'Success is typically when experimental data aligns with theoretical predictions.' }
    ];

    let objectMass = 200; // grams
    let objectVolume = 100; // cm³
    let liquidDensity = 1.0; // g/cm³
    let immersionDepth = 80; // percent
    let animFrame, canvas, ctx;
    let time = 0;
    let bubbles = [];

    const liquids = [
      { name: 'Water', density: 1.0 },
      { name: 'Salt Water', density: 1.12 },
      { name: 'Oil', density: 0.8 },
      { name: 'Mercury', density: 13.6 },
      { name: 'Honey', density: 1.42 },
    ];

    container.innerHTML = `
      <div class="sim-container">
        <div class="sim-canvas-wrap"><canvas id="buoy-canvas" width="800" height="420"></canvas></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">⚙️</span> Controls</div>
            <div class="sim-control-row">
              <span class="sim-control-label">Object Mass (g)</span>
              <input type="range" class="sim-control-slider" id="buoy-mass" min="10" max="1000" step="5" value="${objectMass}" />
              <span class="sim-control-value" id="buoy-mass-val">${objectMass} g</span>
            </div>
            <div class="sim-control-row">
              <span class="sim-control-label">Object Volume (cm³)</span>
              <input type="range" class="sim-control-slider" id="buoy-vol" min="10" max="500" step="5" value="${objectVolume}" />
              <span class="sim-control-value" id="buoy-vol-val">${objectVolume} cm³</span>
            </div>
            <div style="margin-top:8px;">
              <span style="font-size:13px;color:var(--text-secondary);font-weight:500;">Liquid Type</span>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
                ${liquids.map((l, i) => `
                  <button class="sim-btn liquid-btn ${i === 0 ? 'btn-primary' : ''}" data-density="${l.density}" id="liq-${i}" onclick="window._buoySetLiquid(${i})">${l.name}</button>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="sim-results">
<button class="sim-btn sim-btn-primary" style="margin-top:10px; width: 100%;" onclick="window.VIVA_SYSTEM.open(VIVA_QUESTIONS)">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Calculations</div>
            <div class="sim-result-row"><span class="sim-result-label">Object Density</span><span class="sim-result-value" id="buoy-od" style="color:var(--text-primary);">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Weight (W = mg)</span><span class="sim-result-value" id="buoy-w" style="color:#ef4444">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Buoyant Force (Fb)</span><span class="sim-result-value" id="buoy-fb" style="color:#22c55e">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Apparent Weight</span><span class="sim-result-value" id="buoy-aw" style="color:#f59e0b">—</span></div>
            <div class="sim-result-row"><span class="sim-result-label">Behaviour</span><span class="sim-result-value" id="buoy-beh" style="color:#8b5cf6">—</span></div>
            <div style="margin-top:12px;padding:10px;background:rgba(14,165,233,0.06);border-radius:8px;border:1px solid rgba(14,165,233,0.15);">
              <p style="font-size:11px;color:var(--text-muted);line-height:1.5;"><strong>Archimedes' Principle:</strong><br/>Fb = ρ_liquid × V_submerged × g<br/>Object sinks if ρ_obj > ρ_liquid, floats otherwise.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('buoy-canvas');
    ctx = canvas.getContext('2d');
    let currentLiquidIdx = 0;

    document.getElementById('buoy-mass').addEventListener('input', e => {
      objectMass = parseInt(e.target.value);
      document.getElementById('buoy-mass-val').textContent = objectMass + ' g';
    });
    document.getElementById('buoy-vol').addEventListener('input', e => {
      objectVolume = parseInt(e.target.value);
      document.getElementById('buoy-vol-val').textContent = objectVolume + ' cm³';
    });

    window._buoySetLiquid = function(idx) {
      currentLiquidIdx = idx;
      liquidDensity = liquids[idx].density;
      document.querySelectorAll('.liquid-btn').forEach((b, i) => {
        b.classList.toggle('btn-primary', i === idx);
      });
    };

    function draw() {
      const w = canvas.width, h = canvas.height;
      time += 0.025;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, w, h);

      const objDensity = objectMass / objectVolume;
      const g = 9.8;
      const weight = (objectMass / 1000) * g; // N
      const sinks = objDensity > liquidDensity;
      const floats = !sinks;

      // How much of the object is submerged
      let submergedFraction;
      if (sinks) {
        submergedFraction = 1.0;
      } else {
        submergedFraction = objDensity / liquidDensity;
      }

      const buoyantForce = liquidDensity * (objectVolume * submergedFraction / 1e6) * g * 1000; // scale for display
      const apparentWeight = Math.max(0, weight - buoyantForce);

      // Container
      const tankX = 200, tankY = 60, tankW = 400, tankH = 320;
      ctx.fillStyle = 'rgba(59,130,246,0.04)';
      ctx.fillRect(tankX, tankY, tankW, tankH);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(tankX, tankY, tankW, tankH);

      // Liquid level
      const liquidFraction = 0.7;
      const liquidTop = tankY + tankH * (1 - liquidFraction);
      const liqColors = [
        'rgba(59,130,246,0.2)', // water
        'rgba(59,130,246,0.3)', // salt water
        'rgba(245,158,11,0.15)', // oil
        'rgba(148,163,184,0.25)', // mercury
        'rgba(245,158,11,0.25)', // honey
      ];
      ctx.fillStyle = liqColors[currentLiquidIdx];
      ctx.fillRect(tankX + 1, liquidTop, tankW - 2, tankH - (liquidTop - tankY) - 1);

      // Water surface wave
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = tankX; x <= tankX + tankW; x++) {
        ctx.lineTo(x, liquidTop + Math.sin((x * 0.03) + time * 2) * 2);
      }
      ctx.stroke();

      // Object (rectangular block)
      const objW = Math.min(80, Math.sqrt(objectVolume) * 3);
      const objH = Math.min(80, Math.sqrt(objectVolume) * 3);
      const objX = tankX + tankW / 2 - objW / 2;
      let objY;

      if (sinks) {
        // Sink to bottom with gentle bobbing
        objY = tankY + tankH - objH - 10 + Math.sin(time) * 2;
      } else {
        // Float at water surface
        objY = liquidTop - objH * (1 - submergedFraction) + Math.sin(time * 1.5) * 3;
      }

      // Object shadow in water
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(objX + 5, objY + 5, objW, objH);

      // Object body
      const objGrad = ctx.createLinearGradient(objX, objY, objX + objW, objY + objH);
      objGrad.addColorStop(0, sinks ? '#b91c1c' : '#22c55e');
      objGrad.addColorStop(1, sinks ? '#7f1d1d' : '#166534');
      ctx.fillStyle = objGrad;
      ctx.fillRect(objX, objY, objW, objH);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(objX, objY, objW, objH);

      // Label on object
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`${objectMass}g`, objX + objW / 2, objY + objH / 2 + 4);

      // Force arrows
      // Weight arrow (down)
      const arrowX = objX + objW / 2;
      const arrowScale = 15;
      const wLen = Math.min(60, weight * arrowScale);
      drawArrow(ctx, arrowX - 15, objY + objH / 2, arrowX - 15, objY + objH / 2 + wLen, '#ef4444', 'W');

      // Buoyant force arrow (up)
      const fbLen = Math.min(60, buoyantForce * arrowScale);
      drawArrow(ctx, arrowX + 15, objY + objH / 2, arrowX + 15, objY + objH / 2 - fbLen, '#22c55e', 'Fb');

      // Bubbles
      if (Math.random() < 0.06) {
        bubbles.push({
          x: tankX + 50 + Math.random() * (tankW - 100),
          y: tankY + tankH - 10,
          r: 1 + Math.random() * 3,
          speed: 0.5 + Math.random() * 1.5
        });
      }
      bubbles = bubbles.filter(b => b.y > liquidTop);
      bubbles.forEach(b => {
        b.y -= b.speed;
        b.x += Math.sin(time * 3 + b.x) * 0.3;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fill();
      });

      // Liquid label
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`${liquids[currentLiquidIdx].name} (ρ = ${liquidDensity} g/cm³)`, tankX + tankW / 2, tankY + tankH + 20);

      // Spring scale (right side)
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'left';
      ctx.fillText('Spring Scale', tankX + tankW + 20, 80);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tankX + tankW + 40, 90);
      ctx.lineTo(tankX + tankW + 40, 90 + apparentWeight * 30);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(tankX + tankW + 40, 90 + apparentWeight * 30, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.fillText(`${apparentWeight.toFixed(2)} N`, tankX + tankW + 52, 95 + apparentWeight * 30);
      ctx.textAlign = 'start';

      // Update readouts
      document.getElementById('buoy-od').textContent = objDensity.toFixed(3) + ' g/cm³';
      document.getElementById('buoy-w').textContent = weight.toFixed(3) + ' N';
      document.getElementById('buoy-fb').textContent = buoyantForce.toFixed(3) + ' N';
      document.getElementById('buoy-aw').textContent = apparentWeight.toFixed(3) + ' N';
      document.getElementById('buoy-beh').textContent = sinks ? '🔻 Sinks (ρ_obj > ρ_liq)' : '🔺 Floats (ρ_obj ≤ ρ_liq)';
      document.getElementById('buoy-beh').style.color = sinks ? '#ef4444' : '#22c55e';

      animFrame = requestAnimationFrame(draw);
    }

    function drawArrow(ctx, x1, y1, x2, y2, color, label) {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Arrowhead
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 6 * Math.cos(angle - 0.4), y2 - 6 * Math.sin(angle - 0.4));
      ctx.lineTo(x2 - 6 * Math.cos(angle + 0.4), y2 - 6 * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.fillStyle = color;
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(label, x2 + Math.cos(angle + Math.PI / 2) * 14, y2 + Math.sin(angle + Math.PI / 2) * 14);
    }

    draw();

    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
      delete window._buoySetLiquid;
    };
  };
})();
