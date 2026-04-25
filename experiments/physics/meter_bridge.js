/* ============================================================
   METER BRIDGE EXPERIMENT — Interactive Wheatstone Bridge Simulation
   Class 12 Physics | CBSE
   Jockey slider, known resistance input, galvanometer deflection,
   and live calculation of unknown resistance X.
   ============================================================ */
(function () {
  window.experimentRenderers = window.experimentRenderers || {};

  window.experimentRenderers['meter_bridge'] = function (container) {

    /* ── VIVA QUESTIONS ──────────────────────────────────────── */
    const VIVA_QUESTIONS = [
      {
        q: 'What is the principle behind the Meter Bridge experiment?',
        opts: [
          'Ohm\'s Law',
          'Wheatstone Bridge Principle',
          'Kirchhoff\'s Voltage Law',
          'Faraday\'s Law'
        ],
        ans: 1,
        exp: 'The Meter Bridge works on the Wheatstone bridge principle. When the bridge is balanced, P/Q = R/S, which gives the balance condition R/X = l/(100−l).'
      },
      {
        q: 'What is the balance condition formula in a Meter Bridge?',
        opts: [
          'R/X = l × (100 − l)',
          'R/X = l / (100 − l)',
          'X/R = l / (100 + l)',
          'R × X = l / (100 − l)'
        ],
        ans: 1,
        exp: 'At balance: R/X = l/(100−l), where l is the balancing length from the left end and R is the known resistance.'
      },
      {
        q: 'What does the null point (balance point) indicate?',
        opts: [
          'Maximum current flows through the galvanometer',
          'No current flows through the galvanometer',
          'The jockey touches the wire at the midpoint',
          'The unknown resistance equals zero'
        ],
        ans: 1,
        exp: 'At the null point, the galvanometer shows zero deflection, meaning no current flows through it. This indicates the bridge is balanced.'
      },
      {
        q: 'Why is a uniform resistance wire used in a Meter Bridge?',
        opts: [
          'To allow the jockey to slide smoothly',
          'To ensure resistance is directly proportional to length',
          'To minimize heating',
          'To make the wire longer'
        ],
        ans: 1,
        exp: 'A uniform wire ensures that resistance per unit length is constant, so the ratio R/X = l/(100−l) holds accurately.'
      },
      {
        q: 'What happens if the meter bridge wire is non-uniform?',
        opts: [
          'The balance point is found faster',
          'There will be a systematic error in X due to unequal resistance per unit length',
          'The galvanometer shows more deflection',
          'No effect on the result'
        ],
        ans: 1,
        exp: 'A non-uniform wire means resistance is not proportional to length, causing errors in the calculation of X.'
      },
      {
        q: 'What is the role of the galvanometer in a Meter Bridge?',
        opts: [
          'To measure voltage',
          'To detect current imbalance and find the null point',
          'To measure resistance directly',
          'To measure the length of the wire'
        ],
        ans: 1,
        exp: 'The galvanometer acts as a null detector. When no current passes through it, the bridge is balanced.'
      },
      {
        q: 'What is the end error in a Meter Bridge?',
        opts: [
          'Error due to measuring the wrong length',
          'Extra resistance from contact at the ends of the wire',
          'Error due to non-uniform wire',
          'Error due to high voltage'
        ],
        ans: 1,
        exp: 'End error arises from the extra resistance at the terminal contacts (ends) of the bridge wire, which adds a small error to the measured balancing length.'
      },
      {
        q: 'How is the sensitivity of the Meter Bridge increased?',
        opts: [
          'By using a thicker wire',
          'By keeping the balance point near the centre of the wire (around 50 cm)',
          'By increasing the battery voltage',
          'By shortening the wire to 50 cm'
        ],
        ans: 1,
        exp: 'The bridge is most sensitive when the null point is near the middle of the wire (around 50 cm). Choose R to achieve this.'
      },
      {
        q: 'Which law governs the balance condition of a Wheatstone bridge?',
        opts: [
          'Ampere\'s Law',
          'Kirchhoff\'s Current and Voltage Laws',
          'Coulomb\'s Law',
          'Biot-Savart Law'
        ],
        ans: 1,
        exp: 'Kirchhoff\'s Current Law (junction rule) and Voltage Law (loop rule) together explain why the bridge is balanced when P/Q = R/S.'
      },
      {
        q: 'What does a large galvanometer deflection away from the null point tell you?',
        opts: [
          'The bridge is exactly balanced',
          'The jockey is far from the balance position and must be moved',
          'The wire is broken',
          'The battery is dead'
        ],
        ans: 1,
        exp: 'A large deflection means the bridge is far from balance. Move the jockey along the wire until the deflection reduces to zero (null point).'
      }
    ];

    /* ── STATE ───────────────────────────────────────────────── */
    let jockeyPos = 50;       // cm (0–100)
    let knownR    = 20;       // Ω  – known resistance R
    let trueX     = 35;       // Ω  – fixed unknown (student finds it)
    let animFrame = null;
    let canvas, ctx;

    /* Derived values */
    function getBalanceLength() {
      // True balance: l* = R / (R + X) × 100
      return (knownR / (knownR + trueX)) * 100;
    }
    function getCalculatedX() {
      const l = jockeyPos;
      if (l <= 0 || l >= 100) return Infinity;
      return knownR * (100 - l) / l;
    }
    function getGalvDeflection() {
      // Proportional to bridge imbalance
      const l     = jockeyPos;
      const lStar = getBalanceLength();
      const delta = l - lStar;
      // Scale: max ±60 at ends, 0 at null
      return Math.max(-60, Math.min(60, delta * 2.5));
    }

    /* ── BUILD UI ────────────────────────────────────────────── */
    container.innerHTML = `
      <div class="sim-container">

        <!-- Canvas: visual meter bridge -->
        <div class="sim-canvas-wrap">
          <canvas id="mb-canvas" width="800" height="340"></canvas>
        </div>

        <!-- Controls + Results -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">

          <!-- Controls -->
          <div class="sim-controls">
            <div class="sim-controls-title"><span class="ctrl-icon">🎛️</span> Controls</div>

            <div class="sim-control-row">
              <span class="sim-control-label">Jockey Position (l)</span>
              <input type="range" class="sim-control-slider" id="mb-jockey"
                     min="1" max="99" step="0.5" value="${jockeyPos}" />
              <span class="sim-control-value" id="mb-jockey-val">${jockeyPos.toFixed(1)} cm</span>
            </div>

            <div class="sim-control-row">
              <span class="sim-control-label">Known Resistance R (Ω)</span>
              <input type="range" class="sim-control-slider" id="mb-knownR"
                     min="5" max="100" step="5" value="${knownR}" />
              <span class="sim-control-value" id="mb-knownR-val">${knownR} Ω</span>
            </div>

            <div style="margin-top:12px;padding:10px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:13px;line-height:1.7;color:var(--text-secondary);">
              <strong style="color:var(--text-primary);">🎯 Objective:</strong> Slide the jockey to find the
              <em>null point</em> (galvanometer = 0). Then read the calculated X.
            </div>
          </div>

          <!-- Results -->
          <div class="sim-results">
            <button class="sim-btn sim-btn-primary" style="margin-bottom:12px;width:100%;"
              id="mb-viva-btn">🎓 Start Viva</button>

            <div class="sim-results-title"><span class="ctrl-icon">📊</span> Results</div>

            <div class="sim-result-row">
              <span class="sim-result-label">Balancing Length (l)</span>
              <span class="sim-result-value" id="mb-l-display" style="color:#f59e0b;">
                ${jockeyPos.toFixed(1)} cm
              </span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Galvanometer Deflection</span>
              <span class="sim-result-value" id="mb-galv-display" style="color:#ef4444;">
                — div
              </span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Calculated X = R(100−l)/l</span>
              <span class="sim-result-value" id="mb-x-display" style="color:#22c55e;">
                — Ω
              </span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Balance Status</span>
              <span class="sim-result-value" id="mb-status" style="color:#94a3b8;">
                Searching…
              </span>
            </div>

            <div style="margin-top:12px;padding:10px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:12px;color:var(--text-secondary);">
              <strong style="color:var(--text-primary);">Formula:</strong><br/>
              X = R × (100 − l) / l
            </div>
          </div>

        </div>
      </div>
    `;

    /* ── CANVAS ──────────────────────────────────────────────── */
    canvas = document.getElementById('mb-canvas');
    ctx    = canvas.getContext('2d');

    function drawBridge() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      /* Background */
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0f172a');
      bg.addColorStop(1, '#1e293b');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      /* ── Layout constants ── */
      const wireY  = H * 0.55;         // y of meter bridge wire
      const wireX1 = 100;              // left end of wire (A)
      const wireX2 = W - 100;          // right end of wire (B)
      const wireLen = wireX2 - wireX1; // pixel length of 100 cm wire

      const jockeyX = wireX1 + (jockeyPos / 100) * wireLen;
      const galvY   = H * 0.15;        // galvanometer top centre
      const battY   = wireY;

      /* ── Scale / ruler below wire ── */
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth   = 1;
      for (let cm = 0; cm <= 100; cm += 10) {
        const tx = wireX1 + (cm / 100) * wireLen;
        ctx.beginPath();
        ctx.moveTo(tx, wireY + 14);
        ctx.lineTo(tx, wireY + 24);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font      = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(cm, tx, wireY + 38);
      }
      ctx.fillStyle   = 'rgba(255,255,255,0.3)';
      ctx.font        = '11px Inter';
      ctx.textAlign   = 'center';
      ctx.fillText('cm', wireX2 + 24, wireY + 38);

      /* ── Meter bridge wire (A–B) ── */
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth   = 6;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(wireX1, wireY);
      ctx.lineTo(wireX2, wireY);
      ctx.stroke();

      /* Highlight l segment (A to jockey) */
      const galvDefl  = getGalvDeflection();
      const nearNull  = Math.abs(galvDefl) < 3;
      ctx.strokeStyle = nearNull ? '#22c55e' : '#f59e0b';
      ctx.lineWidth   = 5;
      ctx.beginPath();
      ctx.moveTo(wireX1, wireY);
      ctx.lineTo(jockeyX, wireY);
      ctx.stroke();

      /* Endpoints A / B */
      const ptStyle = [
        { x: wireX1, label: 'A' },
        { x: wireX2, label: 'B' }
      ];
      ptStyle.forEach(({ x, label }) => {
        ctx.beginPath();
        ctx.arc(x, wireY, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#64748b';
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle   = '#e2e8f0';
        ctx.font        = 'bold 13px Space Grotesk';
        ctx.textAlign   = 'center';
        ctx.fillText(label, x, wireY - 18);
      });

      /* ── Known resistance box R (left of A) ── */
      const rBoxX = 20, rBoxY = wireY - 30, rBoxW = 60, rBoxH = 30;
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth   = 2;
      ctx.strokeRect(rBoxX, rBoxY, rBoxW, rBoxH);
      ctx.fillStyle = 'rgba(168,85,247,0.1)';
      ctx.fillRect(rBoxX, rBoxY, rBoxW, rBoxH);
      ctx.fillStyle   = '#c084fc';
      ctx.font        = 'bold 13px Space Grotesk';
      ctx.textAlign   = 'center';
      ctx.fillText('R', rBoxX + rBoxW / 2, rBoxY + 20);

      /* Wire: battery → R → A */
      const battX = 55;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(rBoxX + rBoxW, wireY - 15);
      ctx.lineTo(wireX1, wireY - 15);
      ctx.lineTo(wireX1, wireY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rBoxX, wireY - 15);
      ctx.lineTo(battX, wireY - 15);
      ctx.stroke();

      /* ── Unknown resistance X (right of B) ── */
      const xBoxX = wireX2 + 20, xBoxY = wireY - 30, xBoxW = 60, xBoxH = 30;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth   = 2;
      ctx.strokeRect(xBoxX, xBoxY, xBoxW, xBoxH);
      ctx.fillStyle = 'rgba(6,182,212,0.1)';
      ctx.fillRect(xBoxX, xBoxY, xBoxW, xBoxH);
      ctx.fillStyle   = '#22d3ee';
      ctx.font        = 'bold 13px Space Grotesk';
      ctx.textAlign   = 'center';
      ctx.fillText('X', xBoxX + xBoxW / 2, xBoxY + 20);

      /* Wire: B → X → battery */
      const battX2 = W - 55;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(wireX2, wireY);
      ctx.lineTo(wireX2, wireY - 15);
      ctx.lineTo(xBoxX, wireY - 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(xBoxX + xBoxW, wireY - 15);
      ctx.lineTo(battX2, wireY - 15);
      ctx.stroke();

      /* ── Battery (bottom centre) ── */
      const midX = W / 2;
      const batBotY = wireY + 70;
      // horizontal wires to ends
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth   = 2;
      // left wire: A down then right
      ctx.beginPath();
      ctx.moveTo(wireX1, wireY);
      ctx.lineTo(wireX1, batBotY);
      ctx.lineTo(midX - 30, batBotY);
      ctx.stroke();
      // right wire: B down then left
      ctx.beginPath();
      ctx.moveTo(wireX2, wireY);
      ctx.lineTo(wireX2, batBotY);
      ctx.lineTo(midX + 30, batBotY);
      ctx.stroke();
      // battery symbol
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth   = 3;
      ctx.beginPath(); ctx.moveTo(midX - 30, batBotY - 12); ctx.lineTo(midX - 30, batBotY + 12); ctx.stroke(); // long plate
      ctx.lineWidth   = 2;
      ctx.beginPath(); ctx.moveTo(midX - 18, batBotY - 7); ctx.lineTo(midX - 18, batBotY + 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(midX + 18, batBotY - 12); ctx.lineTo(midX + 18, batBotY + 12); ctx.stroke();
      ctx.lineWidth   = 3;
      ctx.beginPath(); ctx.moveTo(midX + 30, batBotY - 7); ctx.lineTo(midX + 30, batBotY + 7); ctx.stroke();
      ctx.fillStyle   = '#fbbf24';
      ctx.font        = '12px Inter';
      ctx.textAlign   = 'center';
      ctx.fillText('E', midX, batBotY + 26);

      /* ── Galvanometer (vertical wire from jockey up) ── */
      const galvCX = jockeyX;
      const galvCY = galvY + 40;

      // wire from jockey to galvanometer
      ctx.strokeStyle = nearNull ? 'rgba(34,197,94,0.8)' : 'rgba(148,163,184,0.7)';
      ctx.lineWidth   = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(jockeyX, wireY - 6);
      ctx.lineTo(galvCX, galvCY + 22);
      ctx.stroke();
      ctx.setLineDash([]);

      // galvanometer circle
      ctx.beginPath();
      ctx.arc(galvCX, galvCY, 28, 0, Math.PI * 2);
      ctx.fillStyle = nearNull ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)';
      ctx.fill();
      ctx.strokeStyle = nearNull ? '#22c55e' : '#ef4444';
      ctx.lineWidth   = 2;
      ctx.stroke();
      // G label
      ctx.fillStyle = nearNull ? '#4ade80' : '#f87171';
      ctx.font      = 'bold 14px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillText('G', galvCX, galvCY + 5);

      /* Needle */
      const needleAngle = (galvDefl / 60) * (Math.PI / 2.5);
      const needleLen   = 20;
      ctx.strokeStyle   = nearNull ? '#4ade80' : '#f87171';
      ctx.lineWidth     = 2;
      ctx.beginPath();
      ctx.moveTo(galvCX, galvCY);
      ctx.lineTo(
        galvCX + needleLen * Math.sin(needleAngle),
        galvCY - needleLen * Math.cos(needleAngle)
      );
      ctx.stroke();

      /* Galvanometer reading text */
      ctx.fillStyle = nearNull ? '#4ade80' : '#f87171';
      ctx.font      = '11px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(
        nearNull ? '0 div ✓' : galvDefl.toFixed(1) + ' div',
        galvCX,
        galvCY - 36
      );

      /* ── Jockey ── */
      ctx.beginPath();
      ctx.arc(jockeyX, wireY, 8, 0, Math.PI * 2);
      ctx.fillStyle   = '#fbbf24';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth   = 2;
      ctx.stroke();
      // jockey label
      ctx.fillStyle   = '#fef3c7';
      ctx.font        = '11px Inter';
      ctx.textAlign   = 'center';
      ctx.fillText('J', jockeyX, wireY + 3);

      /* R & X labels */
      ctx.fillStyle = '#c084fc';
      ctx.font      = '12px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillText(knownR + ' Ω', rBoxX + rBoxW / 2, rBoxY - 6);

      ctx.fillStyle = '#22d3ee';
      ctx.fillText(trueX + ' Ω', xBoxX + xBoxW / 2, xBoxY - 6);

      /* ── l and (100−l) annotations ── */
      const midJWire = wireX1 + (jockeyPos / 200) * wireLen;
      ctx.fillStyle  = 'rgba(245,158,11,0.8)';
      ctx.font       = '12px Space Grotesk';
      ctx.textAlign  = 'center';
      ctx.fillText('l = ' + jockeyPos.toFixed(1) + ' cm', midJWire, wireY + 54);

      const mid2 = jockeyX + ((wireX2 - jockeyX) / 2);
      ctx.fillStyle = 'rgba(148,163,184,0.8)';
      ctx.fillText('(100−l) = ' + (100 - jockeyPos).toFixed(1) + ' cm', mid2, wireY + 54);

      ctx.textAlign = 'start';
    }

    /* ── UPDATE RESULTS ──────────────────────────────────────── */
    function updateUI() {
      const l      = jockeyPos;
      const calcX  = getCalculatedX();
      const galvD  = getGalvDeflection();
      const near   = Math.abs(galvD) < 3;

      document.getElementById('mb-l-display').textContent    = l.toFixed(1) + ' cm';
      document.getElementById('mb-galv-display').textContent =
        near ? '≈ 0 div ✓' : galvD.toFixed(1) + ' div';
      document.getElementById('mb-galv-display').style.color =
        near ? '#22c55e' : '#ef4444';

      if (isFinite(calcX)) {
        document.getElementById('mb-x-display').textContent = calcX.toFixed(2) + ' Ω';
      } else {
        document.getElementById('mb-x-display').textContent = '∞ Ω';
      }

      const statusEl = document.getElementById('mb-status');
      if (near) {
        statusEl.textContent = '🟢 Null Point Found!';
        statusEl.style.color = '#22c55e';
      } else if (galvD > 0) {
        statusEl.textContent = '← Move Jockey Left';
        statusEl.style.color = '#f59e0b';
      } else {
        statusEl.textContent = 'Move Jockey Right →';
        statusEl.style.color = '#f59e0b';
      }
    }

    /* ── ANIMATE ─────────────────────────────────────────────── */
    function animate() {
      drawBridge();
      animFrame = requestAnimationFrame(animate);
    }
    animate();
    updateUI();

    /* ── EVENTS ──────────────────────────────────────────────── */
    document.getElementById('mb-jockey').addEventListener('input', function (e) {
      jockeyPos = parseFloat(e.target.value);
      document.getElementById('mb-jockey-val').textContent = jockeyPos.toFixed(1) + ' cm';
      updateUI();
    });

    document.getElementById('mb-knownR').addEventListener('input', function (e) {
      knownR = parseInt(e.target.value);
      document.getElementById('mb-knownR-val').textContent = knownR + ' Ω';
      updateUI();
    });

    document.getElementById('mb-viva-btn').addEventListener('click', function () {
      if (window.VIVA_SYSTEM && window.VIVA_SYSTEM.open) {
        window.VIVA_SYSTEM.open(VIVA_QUESTIONS);
      }
    });

    /* ── CLEANUP ─────────────────────────────────────────────── */
    return function cleanup() {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  };
})();
