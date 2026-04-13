/* ============================================================
   Vernier Caliper — Precision Measurement Simulation
   Pixel-accurate scale, draggable jaw, zoom lens, exam mode
   ============================================================ */
(function () {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['vernier_caliper'] = function (container, exp) {

    const VIVA = [
      { q: 'What is the least count of a standard Vernier caliper?', opts: ['0.1 cm', '0.01 cm', '1 mm', '0.001 cm'], ans: 1, exp: 'Least Count = 1 MSD − 1 VSD = 1 mm − 0.9 mm = 0.1 mm = 0.01 cm.' },
      { q: 'What is zero error?', opts: ['Error when battery is zero', 'Error when jaws are fully closed but zero marks don\'t align', 'Error in the object size', 'A manufacturing defect that cannot be corrected'], ans: 1, exp: 'Zero error occurs when the zero of the Vernier scale doesn\'t coincide with the zero of the main scale when jaws are fully closed.' },
      { q: 'Why is a Vernier caliper more accurate than a ruler?', opts: ['It is heavier', 'It has a magnifying glass', 'It can measure fractions of the smallest main scale division', 'It is made of steel'], ans: 2, exp: 'The Vernier scale allows measurement of fractions of mm that a regular ruler cannot distinguish, giving 0.01 cm precision.' },
      { q: 'If MSR = 3.2 cm and VSR = 6, what is the reading (LC = 0.01 cm)?', opts: ['3.26 cm', '3.86 cm', '3.206 cm', '3.62 cm'], ans: 0, exp: 'Reading = MSR + (VSR × LC) = 3.2 + (6 × 0.01) = 3.2 + 0.06 = 3.26 cm.' },
      { q: 'What type of zero error occurs when the Vernier zero is to the RIGHT of the main scale zero?', opts: ['No error', 'Positive zero error', 'Negative zero error', 'Parallax error'], ans: 1, exp: 'When jaws are closed and the Vernier zero is to the right of the main scale zero, it is a positive zero error (subtract correction).' }
    ];

    /* ── Constants for scale drawing ──────────────────────────── */
    const PX_PER_MM = 6;                  // 6 pixels per mm (suits ~120mm visible)
    const MAIN_SCALE_MM = 150;            // total main scale length in mm
    const VERNIER_DIVS = 10;              // 10 Vernier divisions
    const VERNIER_SPAN_MM = 9;            // 10 VSD = 9 MSD
    const LEAST_COUNT = 0.1;              // mm (0.01 cm)

    /* ── State ────────────────────────────────────────────────── */
    let jawOpeningMM = 0;                 // mm gap between jaws
    let zeroErrorMM = 0;                  // zero error in mm (+ or -)
    let alive = true;
    let dragging = false;
    let autoMode = true;                  // auto-calc vs exam mode

    // Objects to measure (actual sizes in mm)
    const OBJECTS = [
      { name: 'Steel Cylinder', actualMM: 0, color: '#94a3b8', shape: 'cylinder' },
      { name: 'Brass Coin',     actualMM: 0, color: '#d4a017', shape: 'coin' },
      { name: 'Wooden Block',   actualMM: 0, color: '#a0522d', shape: 'block' }
    ];
    let currentObj = 0;
    let objectPlaced = false;

    // Observation table
    let observations = [];

    // Exam mode answer state
    let examMSR = '';
    let examVSR = '';
    let examResult = null;

    // Randomize sizes
    function randomizeSizes() {
      OBJECTS[0].actualMM = +(12 + Math.random() * 28).toFixed(1);  // 12–40 mm
      OBJECTS[1].actualMM = +(15 + Math.random() * 10).toFixed(1);  // 15–25 mm
      OBJECTS[2].actualMM = +(20 + Math.random() * 30).toFixed(1);  // 20–50 mm
      // Snap to 0.1mm precision
      OBJECTS.forEach(o => { o.actualMM = Math.round(o.actualMM * 10) / 10; });
    }
    randomizeSizes();

    // Random zero error (-0.3 to +0.3 mm in steps of 0.1)
    function randomizeZeroError() {
      const choices = [-0.3, -0.2, -0.1, 0, 0, 0, 0.1, 0.2, 0.3]; // weighted toward zero
      zeroErrorMM = choices[Math.floor(Math.random() * choices.length)];
    }
    randomizeZeroError();

    /* ── HTML ─────────────────────────────────────────────────── */
    container.innerHTML = `
      <div style="display:flex; gap:0; border-radius:14px; overflow:hidden; border:1px solid var(--border-glass); background:#06080d;">
        <!-- Main area -->
        <div style="flex:1; min-width:0; display:flex; flex-direction:column;">
          <!-- Caliper canvas -->
          <div style="position:relative; flex:1;">
            <canvas id="vc-canvas" style="width:100%; height:360px; display:block; cursor:ew-resize;"></canvas>
            <!-- Zoom lens -->
            <div id="vc-zoom-box" style="position:absolute; bottom:10px; right:10px; width:200px; height:120px; border:1px solid rgba(14,165,233,0.4); border-radius:10px; overflow:hidden; background:rgba(0,0,0,0.8);">
              <canvas id="vc-zoom" style="width:100%; height:100%; display:block;"></canvas>
              <div style="position:absolute;top:4px;left:8px;font-size:9px;color:rgba(14,165,233,0.6);font-weight:600;">🔍 ZOOM ×4</div>
            </div>
          </div>
          <!-- Reading panel -->
          <div style="padding:14px 20px; border-top:1px solid var(--border-glass); background:rgba(10,14,20,0.9);">
            <div style="display:flex; gap:24px; align-items:center; flex-wrap:wrap;">
              <div style="font-family:'JetBrains Mono',monospace; font-size:13px; line-height:1.8;">
                <div>MSR = <span id="vc-msr" style="color:#22c55e; font-weight:700;">—</span> cm</div>
                <div>VSD = <span id="vc-vsd" style="color:#3b82f6; font-weight:700;">—</span></div>
                <div>LC  = <span style="color:#f59e0b;">0.01 cm</span></div>
              </div>
              <div style="font-family:'JetBrains Mono',monospace; font-size:13px; line-height:1.8; border-left:1px solid var(--border-glass); padding-left:20px;">
                <div>Reading = MSR + VSD × LC</div>
                <div style="font-size:18px; font-weight:700; color:#0ea5e9;" id="vc-reading">— cm</div>
                <div style="font-size:11px; color:var(--text-muted);" id="vc-corrected"></div>
              </div>
              <div style="font-family:'JetBrains Mono',monospace; font-size:11px; line-height:1.7; border-left:1px solid var(--border-glass); padding-left:20px; color:var(--text-muted);">
                <div>Zero Error = <span id="vc-ze" style="color:#f59e0b;"></span></div>
                <div>Jaw Gap = <span id="vc-gap" style="color:#a855f7;"></span></div>
              </div>
            </div>
          </div>
          <!-- Observation table -->
          <div style="padding:12px 20px; border-top:1px solid var(--border-glass); max-height:180px; overflow-y:auto; background:rgba(6,8,13,0.8);" id="vc-obs-panel">
            <div style="font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">Observation Table</div>
            <table style="width:100%; font-size:11px; border-collapse:collapse;" id="vc-table">
              <thead>
                <tr style="color:var(--text-muted); border-bottom:1px solid var(--border-glass);">
                  <th style="padding:4px 8px; text-align:left;">#</th>
                  <th style="padding:4px 8px; text-align:left;">Object</th>
                  <th style="padding:4px 8px;">MSR (cm)</th>
                  <th style="padding:4px 8px;">VSD</th>
                  <th style="padding:4px 8px;">Reading (cm)</th>
                  <th style="padding:4px 8px;">Corrected (cm)</th>
                  <th style="padding:4px 8px;">Actual (cm)</th>
                  <th style="padding:4px 8px;">✓</th>
                </tr>
              </thead>
              <tbody id="vc-tbody"></tbody>
            </table>
          </div>
        </div>

        <!-- Sidebar -->
        <div style="width:280px; flex-shrink:0; display:flex; flex-direction:column; background:rgba(12,16,24,0.9); border-left:1px solid var(--border-glass); overflow-y:auto;">
          <div style="padding:16px 18px; border-bottom:1px solid var(--border-glass);">
            <div style="font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:700; color:#fff;">📏 Vernier Caliper</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Precision Measurement</div>
          </div>
          <div style="padding:14px 18px; display:flex; flex-direction:column; gap:10px; flex:1;">

            <!-- Object selection -->
            <div style="font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Select Object</div>
            <div style="display:flex; flex-direction:column; gap:4px;" id="vc-obj-btns">
              <button class="sim-btn btn-primary" style="font-size:11px; padding:7px;" onclick="window._vcObj(0)">🔩 Steel Cylinder</button>
              <button class="sim-btn" style="font-size:11px; padding:7px;" onclick="window._vcObj(1)">🪙 Brass Coin</button>
              <button class="sim-btn" style="font-size:11px; padding:7px;" onclick="window._vcObj(2)">🧱 Wooden Block</button>
            </div>

            <button class="sim-btn" style="font-size:11px; padding:7px;" onclick="window._vcPlaceObj()">⬇ Place Object in Jaws</button>

            <div style="border-top:1px solid var(--border-glass); margin:2px 0;"></div>

            <!-- Mode toggle -->
            <div class="vc-tgl-row"><span>🤖 Auto-Calc Mode</span><label class="vc-sw"><input type="checkbox" id="vc-auto" checked><span class="vc-sl"></span></label></div>

            <div style="border-top:1px solid var(--border-glass); margin:2px 0;"></div>

            <!-- Exam mode input -->
            <div id="vc-exam-panel" style="display:none;">
              <div style="font-size:11px; font-weight:600; color:#f59e0b; margin-bottom:6px;">📝 EXAM MODE — Enter Your Reading</div>
              <div style="display:flex; gap:6px; align-items:center; margin-bottom:6px;">
                <label style="font-size:11px; color:var(--text-secondary); width:45px;">MSR:</label>
                <input type="number" step="0.1" id="vc-exam-msr" style="flex:1; background:rgba(255,255,255,0.05); border:1px solid var(--border-glass); border-radius:6px; padding:5px 8px; color:#fff; font-size:12px; font-family:'JetBrains Mono',monospace;" placeholder="cm">
              </div>
              <div style="display:flex; gap:6px; align-items:center; margin-bottom:6px;">
                <label style="font-size:11px; color:var(--text-secondary); width:45px;">VSD:</label>
                <input type="number" step="1" min="0" max="10" id="vc-exam-vsd" style="flex:1; background:rgba(255,255,255,0.05); border:1px solid var(--border-glass); border-radius:6px; padding:5px 8px; color:#fff; font-size:12px; font-family:'JetBrains Mono',monospace;" placeholder="0–10">
              </div>
              <button class="sim-btn btn-primary" style="width:100%; font-size:11px; padding:7px;" onclick="window._vcCheckExam()">✅ Check Answer</button>
              <div id="vc-exam-fb" style="font-size:11px; margin-top:6px; min-height:20px; line-height:1.5;"></div>
            </div>

            <!-- Theory -->
            <div style="padding:10px; background:rgba(14,165,233,0.06); border:1px solid rgba(14,165,233,0.15); border-radius:8px;">
              <div style="font-size:12px; font-weight:700; color:#0ea5e9; margin-bottom:4px;">📐 Theory</div>
              <div style="font-size:10px; color:var(--text-secondary); line-height:1.6; font-family:'JetBrains Mono',monospace;">
                LC = 1 MSD − 1 VSD<br>
                &nbsp;&nbsp; = 1mm − 0.9mm = <b>0.1mm</b><br>
                &nbsp;&nbsp; = <b>0.01 cm</b><br><br>
                Reading = MSR + (VSD × LC)<br>
                Corrected = Reading − Zero Error
              </div>
            </div>

            <!-- Actions -->
            <div style="display:flex; gap:4px;">
              <button class="sim-btn" style="flex:1; font-size:10px; padding:6px;" onclick="window._vcCloseJaws()">Zero Check</button>
              <button class="sim-btn" style="flex:1; font-size:10px; padding:6px;" onclick="window._vcRecord()">📋 Record</button>
            </div>
            <button class="sim-btn" style="font-size:10px; padding:6px;" onclick="window._vcNewSizes()">🔀 New Random Sizes</button>

            <div style="margin-top:auto; display:flex; gap:8px;">
              <button class="sim-btn" style="flex:1;font-size:12px;" onclick="window._vcReset()">↺ Reset</button>
              <button class="sim-btn sim-btn-primary" style="flex:1;font-size:12px;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/\"/g, '&quot;')})">🎓 Viva</button>
            </div>
          </div>
        </div>
      </div>
      <style>
        .vc-tgl-row{ display:flex;align-items:center;justify-content:space-between;font-size:13px;color:#ddd; }
        .vc-sw{ position:relative;width:40px;height:22px;flex-shrink:0; }
        .vc-sw input{ opacity:0;width:0;height:0; }
        .vc-sl{ position:absolute;inset:0;background:rgba(255,255,255,0.1);border-radius:22px;cursor:pointer;transition:0.3s; }
        .vc-sl::before{ content:'';position:absolute;width:16px;height:16px;left:3px;bottom:3px;background:#888;border-radius:50%;transition:0.3s; }
        .vc-sw input:checked+.vc-sl{ background:rgba(14,165,233,0.45); }
        .vc-sw input:checked+.vc-sl::before{ transform:translateX(18px);background:#0ea5e9; }
      </style>
    `;

    /* ── Canvas Setup ─────────────────────────────────────────── */
    const canvas = document.getElementById('vc-canvas');
    const ctx = canvas.getContext('2d');
    const zoomCanvas = document.getElementById('vc-zoom');
    const zoomCtx = zoomCanvas.getContext('2d');

    function resize() {
      canvas.width = canvas.clientWidth;
      canvas.height = 360;
      zoomCanvas.width = zoomCanvas.clientWidth;
      zoomCanvas.height = zoomCanvas.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* ── Drawing Constants ────────────────────────────────────── */
    const CALIPER_Y = 120;        // vertical center of the caliper
    const MAIN_SCALE_X = 100;     // where main scale starts (px)
    const JAW_HEIGHT = 80;        // height of each jaw
    const FIXED_JAW_X = MAIN_SCALE_X; // left jaw = start of main scale

    function vernierZeroX() {
      // Position of the Vernier zero mark on the canvas
      return MAIN_SCALE_X + jawOpeningMM * PX_PER_MM;
    }

    /* ── Scale Reading Computation ────────────────────────────── */
    function computeReading() {
      const totalMM = jawOpeningMM + zeroErrorMM;

      // MSR: largest mm reading on main scale that is ≤ totalMM
      const msrMM = Math.floor(totalMM); // in mm
      const msrCM = (msrMM / 10);

      // Fractional part in mm
      const frac = totalMM - msrMM; // 0–0.9 mm
      // VSD: which vernier division coincides (0–10)
      const vsd = Math.round(frac / LEAST_COUNT);

      const readingCM = msrCM + vsd * 0.01;
      const correctedCM = readingCM - (zeroErrorMM / 10);  // subtract zero error in cm

      return { msrMM, msrCM, vsd, readingCM, correctedCM, totalMM };
    }

    /* ── Main Draw ────────────────────────────────────────────── */
    function draw() {
      if (!alive) return;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      drawCaliperBody(w, h);
      drawMainScale(w, h);
      drawVernierScale(w, h);
      drawJaws(w, h);
      drawObject(w, h);
      drawZoomLens();
      updateReadingDisplay();

      requestAnimationFrame(draw);
    }

    /* ── Caliper Body ─────────────────────────────────────────── */
    function drawCaliperBody(w, h) {
      // Main beam (top bar)
      const beamY = CALIPER_Y - 8;
      ctx.fillStyle = '#3a3f4a';
      ctx.fillRect(MAIN_SCALE_X - 20, beamY, MAIN_SCALE_MM * PX_PER_MM + 60, 16);
      // Gloss
      const gloss = ctx.createLinearGradient(0, beamY, 0, beamY + 16);
      gloss.addColorStop(0, 'rgba(255,255,255,0.08)');
      gloss.addColorStop(0.5, 'rgba(255,255,255,0.02)');
      gloss.addColorStop(1, 'rgba(0,0,0,0.15)');
      ctx.fillStyle = gloss;
      ctx.fillRect(MAIN_SCALE_X - 20, beamY, MAIN_SCALE_MM * PX_PER_MM + 60, 16);

      // Vernier carrier (slides)
      const vx = vernierZeroX();
      ctx.fillStyle = '#2e333d';
      ctx.fillRect(vx - 10, beamY - 2, VERNIER_SPAN_MM * PX_PER_MM + 40, 20);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.strokeRect(vx - 10, beamY - 2, VERNIER_SPAN_MM * PX_PER_MM + 40, 20);
    }

    /* ── Main Scale ───────────────────────────────────────────── */
    function drawMainScale(w, h) {
      const y0 = CALIPER_Y - 8;  // top of beam
      const scaleY = y0 + 16;     // bottom of beam = start of scale marks going down

      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '9px JetBrains Mono';
      ctx.textAlign = 'center';

      for (let mm = 0; mm <= MAIN_SCALE_MM; mm++) {
        const x = MAIN_SCALE_X + mm * PX_PER_MM;
        if (x > w - 20) break;

        let tickH = 4;
        if (mm % 10 === 0) tickH = 14;       // cm marks
        else if (mm % 5 === 0) tickH = 9;    // half cm

        ctx.lineWidth = mm % 10 === 0 ? 1.2 : 0.6;
        ctx.beginPath();
        ctx.moveTo(x, scaleY);
        ctx.lineTo(x, scaleY + tickH);
        ctx.stroke();

        // cm labels
        if (mm % 10 === 0) {
          ctx.fillText((mm / 10).toString(), x, scaleY + tickH + 10);
        }
      }

      // "cm" label
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '8px Inter';
      ctx.textAlign = 'left';
      ctx.fillText('cm', MAIN_SCALE_X - 16, scaleY + 24);
    }

    /* ── Vernier Scale ────────────────────────────────────────── */
    function drawVernierScale(w, h) {
      const y0 = CALIPER_Y - 8;
      const scaleY = y0 + 16;
      const vernierY = scaleY + 30;  // Vernier scale drawn below main scale

      const vZero = vernierZeroX();
      const vsdPx = (VERNIER_SPAN_MM * PX_PER_MM) / VERNIER_DIVS; // pixels per VSD

      const reading = computeReading();

      // Vernier body background
      ctx.fillStyle = 'rgba(14,165,233,0.06)';
      ctx.fillRect(vZero - 4, vernierY - 3, VERNIER_DIVS * vsdPx + 8, 22);

      for (let i = 0; i <= VERNIER_DIVS; i++) {
        const x = vZero + i * vsdPx;
        const tickH = i === 0 ? 16 : (i === VERNIER_DIVS ? 14 : 10);

        // Highlight coinciding division
        const isCoinciding = i === reading.vsd;
        ctx.strokeStyle = isCoinciding ? '#0ea5e9' : 'rgba(255,255,255,0.5)';
        ctx.lineWidth = isCoinciding ? 2 : 0.7;

        ctx.beginPath();
        ctx.moveTo(x, vernierY);
        ctx.lineTo(x, vernierY + tickH);
        ctx.stroke();

        // Division number
        ctx.fillStyle = isCoinciding ? '#0ea5e9' : 'rgba(255,255,255,0.5)';
        ctx.font = isCoinciding ? 'bold 9px JetBrains Mono' : '8px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(i.toString(), x, vernierY + tickH + 10);
      }

      // MSR indicator line (from vernier zero up to main scale)
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = 'rgba(34,197,94,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(vZero, scaleY);
      ctx.lineTo(vZero, vernierY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Highlight MSR region
      if (autoMode) {
        const msrX = MAIN_SCALE_X + reading.msrMM * PX_PER_MM;
        ctx.fillStyle = 'rgba(34,197,94,0.12)';
        ctx.fillRect(msrX, scaleY, PX_PER_MM, 14);
      }
    }

    /* ── Jaws ─────────────────────────────────────────────────── */
    function drawJaws(w, h) {
      const jawTop = CALIPER_Y + 50;
      const jawBot = jawTop + JAW_HEIGHT;

      // Fixed jaw (left)
      ctx.fillStyle = '#4a5060';
      ctx.beginPath();
      ctx.moveTo(FIXED_JAW_X, jawTop);
      ctx.lineTo(FIXED_JAW_X, jawBot);
      ctx.lineTo(FIXED_JAW_X + 15, jawBot);
      ctx.lineTo(FIXED_JAW_X + 15, jawTop + 10);
      ctx.closePath();
      ctx.fill();
      // Inner face
      ctx.fillStyle = '#5a6070';
      ctx.fillRect(FIXED_JAW_X + 12, jawTop + 10, 3, JAW_HEIGHT - 10);

      // Movable jaw (right)
      const mjX = vernierZeroX();
      ctx.fillStyle = '#4a5060';
      ctx.beginPath();
      ctx.moveTo(mjX, jawTop);
      ctx.lineTo(mjX, jawBot);
      ctx.lineTo(mjX - 15, jawBot);
      ctx.lineTo(mjX - 15, jawTop + 10);
      ctx.closePath();
      ctx.fill();
      // Inner face
      ctx.fillStyle = '#5a6070';
      ctx.fillRect(mjX - 15, jawTop + 10, 3, JAW_HEIGHT - 10);

      // Drag handle indicator
      ctx.fillStyle = dragging ? 'rgba(14,165,233,0.4)' : 'rgba(255,255,255,0.1)';
      ctx.fillRect(mjX - 6, jawTop - 10, 12, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '7px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('⇔', mjX, jawTop - 3);

      // Over-tightening warning
      if (objectPlaced && jawOpeningMM < OBJECTS[currentObj].actualMM - 0.5) {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('⚠ Over-tightened!', mjX, jawBot + 18);
      }
    }

    /* ── Object Between Jaws ──────────────────────────────────── */
    function drawObject(w, h) {
      if (!objectPlaced) return;
      const obj = OBJECTS[currentObj];
      const jawTop = CALIPER_Y + 50;
      const objWidthPx = obj.actualMM * PX_PER_MM;
      const objX = FIXED_JAW_X + 15;
      const objH = JAW_HEIGHT - 20;

      ctx.fillStyle = obj.color;

      if (obj.shape === 'cylinder') {
        ctx.beginPath();
        ctx.ellipse(objX + objWidthPx / 2, jawTop + objH / 2 + 5, objWidthPx / 2, objH / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (obj.shape === 'coin') {
        ctx.beginPath();
        ctx.ellipse(objX + objWidthPx / 2, jawTop + objH / 2 + 5, objWidthPx / 2, objH / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillRect(objX, jawTop + 12, objWidthPx, objH - 10);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(objX, jawTop + 12, objWidthPx, objH - 10);
      }

      // Object label
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '9px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(obj.name, objX + objWidthPx / 2, jawTop + objH + 20);
    }

    /* ── Zoom Lens ────────────────────────────────────────────── */
    function drawZoomLens() {
      const zw = zoomCanvas.width, zh = zoomCanvas.height;
      zoomCtx.clearRect(0, 0, zw, zh);
      zoomCtx.fillStyle = '#0a0e14';
      zoomCtx.fillRect(0, 0, zw, zh);

      // Zoom 4× centered on the Vernier zero
      const zoomFactor = 4;
      const centerX = vernierZeroX();
      const centerY = CALIPER_Y + 25; // focus on scale area

      const srcW = zw / zoomFactor;
      const srcH = zh / zoomFactor;
      const srcX = centerX - srcW / 2;
      const srcY = centerY - srcH / 2;

      // Draw zoomed content by re-rendering at scale
      zoomCtx.save();
      zoomCtx.scale(zoomFactor, zoomFactor);
      zoomCtx.translate(-srcX, -srcY);

      // Re-draw just the scale portion
      drawMainScaleZoom(zoomCtx);
      drawVernierScaleZoom(zoomCtx);

      zoomCtx.restore();

      // Border
      zoomCtx.strokeStyle = 'rgba(14,165,233,0.3)';
      zoomCtx.lineWidth = 1;
      zoomCtx.strokeRect(0, 0, zw, zh);
    }

    function drawMainScaleZoom(c) {
      const y0 = CALIPER_Y - 8;
      const scaleY = y0 + 16;

      c.strokeStyle = 'rgba(255,255,255,0.7)';
      c.fillStyle = 'rgba(255,255,255,0.8)';
      c.font = '9px JetBrains Mono';
      c.textAlign = 'center';

      for (let mm = 0; mm <= MAIN_SCALE_MM; mm++) {
        const x = MAIN_SCALE_X + mm * PX_PER_MM;
        let tickH = 4;
        if (mm % 10 === 0) tickH = 14;
        else if (mm % 5 === 0) tickH = 9;

        c.lineWidth = mm % 10 === 0 ? 1.2 : 0.6;
        c.beginPath();
        c.moveTo(x, scaleY);
        c.lineTo(x, scaleY + tickH);
        c.stroke();

        if (mm % 10 === 0) {
          c.fillText((mm / 10).toString(), x, scaleY + tickH + 10);
        }
      }
    }

    function drawVernierScaleZoom(c) {
      const y0 = CALIPER_Y - 8;
      const scaleY = y0 + 16;
      const vernierY = scaleY + 30;
      const vZero = vernierZeroX();
      const vsdPx = (VERNIER_SPAN_MM * PX_PER_MM) / VERNIER_DIVS;
      const reading = computeReading();

      for (let i = 0; i <= VERNIER_DIVS; i++) {
        const x = vZero + i * vsdPx;
        const tickH = i === 0 ? 16 : 10;
        const isCoinciding = i === reading.vsd;

        c.strokeStyle = isCoinciding ? '#0ea5e9' : 'rgba(255,255,255,0.5)';
        c.lineWidth = isCoinciding ? 2 : 0.7;
        c.beginPath();
        c.moveTo(x, vernierY);
        c.lineTo(x, vernierY + tickH);
        c.stroke();

        c.fillStyle = isCoinciding ? '#0ea5e9' : 'rgba(255,255,255,0.5)';
        c.font = isCoinciding ? 'bold 8px JetBrains Mono' : '7px JetBrains Mono';
        c.textAlign = 'center';
        c.fillText(i.toString(), x, vernierY + tickH + 9);
      }

      // Vernier zero line
      c.setLineDash([2, 3]);
      c.strokeStyle = 'rgba(34,197,94,0.6)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(vZero, scaleY);
      c.lineTo(vZero, vernierY);
      c.stroke();
      c.setLineDash([]);
    }

    /* ── Reading Display ──────────────────────────────────────── */
    function updateReadingDisplay() {
      const r = computeReading();

      if (autoMode) {
        document.getElementById('vc-msr').textContent = r.msrCM.toFixed(1);
        document.getElementById('vc-vsd').textContent = r.vsd;
        document.getElementById('vc-reading').textContent = r.readingCM.toFixed(2) + ' cm';
        if (zeroErrorMM !== 0) {
          document.getElementById('vc-corrected').textContent =
            'Corrected: ' + r.correctedCM.toFixed(2) + ' cm (ZE = ' + (zeroErrorMM > 0 ? '+' : '') + (zeroErrorMM / 10).toFixed(2) + ' cm)';
        } else {
          document.getElementById('vc-corrected').textContent = 'No zero error correction needed.';
        }
      } else {
        document.getElementById('vc-msr').textContent = '?';
        document.getElementById('vc-vsd').textContent = '?';
        document.getElementById('vc-reading').textContent = '? cm';
        document.getElementById('vc-corrected').textContent = 'Enter your reading in Exam Mode →';
      }

      document.getElementById('vc-ze').textContent =
        zeroErrorMM === 0 ? 'None' : ((zeroErrorMM > 0 ? '+' : '') + (zeroErrorMM / 10).toFixed(2) + ' cm');
      document.getElementById('vc-gap').textContent = jawOpeningMM.toFixed(1) + ' mm';
    }

    /* ── Drag Interaction ─────────────────────────────────────── */
    function handleDragStart(clientX) {
      const r = canvas.getBoundingClientRect();
      const mx = clientX - r.left;
      const mjX = vernierZeroX();
      // Check if near movable jaw
      if (Math.abs(mx - mjX) < 25) {
        dragging = true;
        canvas.style.cursor = 'grabbing';
      }
    }

    function handleDragMove(clientX) {
      if (!dragging) return;
      const r = canvas.getBoundingClientRect();
      const mx = clientX - r.left;
      let newMM = (mx - MAIN_SCALE_X) / PX_PER_MM;
      newMM = Math.max(0, Math.min(newMM, MAIN_SCALE_MM - 10));

      // If object placed, snap to object size (± small tolerance)
      if (objectPlaced) {
        const objMM = OBJECTS[currentObj].actualMM;
        if (newMM >= objMM - 0.5 && newMM <= objMM + 1) {
          newMM = objMM; // snap to exact object size
        }
        if (newMM < objMM - 0.5) newMM = objMM - 0.5; // can't close past object
      }

      jawOpeningMM = Math.round(newMM * 10) / 10; // round to 0.1mm
    }

    function handleDragEnd() {
      dragging = false;
      canvas.style.cursor = 'ew-resize';
    }

    // Mouse events
    canvas.addEventListener('mousedown', (e) => handleDragStart(e.clientX));
    canvas.addEventListener('mousemove', (e) => handleDragMove(e.clientX));
    canvas.addEventListener('mouseup', handleDragEnd);
    canvas.addEventListener('mouseleave', handleDragEnd);

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
      handleDragStart(e.touches[0].clientX);
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      handleDragMove(e.touches[0].clientX);
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchend', handleDragEnd);

    /* ── Controls ─────────────────────────────────────────────── */
    window._vcObj = (idx) => {
      currentObj = idx;
      objectPlaced = false;
      const btns = document.getElementById('vc-obj-btns').children;
      for (let i = 0; i < btns.length; i++) {
        btns[i].className = i === idx ? 'sim-btn btn-primary' : 'sim-btn';
      }
    };

    window._vcPlaceObj = () => {
      objectPlaced = true;
      // Open jaws wider than the object
      jawOpeningMM = Math.max(jawOpeningMM, OBJECTS[currentObj].actualMM + 5);
    };

    window._vcCloseJaws = () => {
      objectPlaced = false;
      jawOpeningMM = 0;
    };

    window._vcRecord = () => {
      const r = computeReading();
      const obj = OBJECTS[currentObj];
      const actualCM = (obj.actualMM / 10).toFixed(2);
      const correct = Math.abs(r.correctedCM - obj.actualMM / 10) < 0.015;

      observations.push({
        obj: obj.name,
        msr: r.msrCM.toFixed(1),
        vsd: r.vsd,
        reading: r.readingCM.toFixed(2),
        corrected: r.correctedCM.toFixed(2),
        actual: actualCM,
        correct
      });

      renderTable();
    };

    window._vcNewSizes = () => {
      randomizeSizes();
      randomizeZeroError();
      jawOpeningMM = 0;
      objectPlaced = false;
      observations = [];
      renderTable();
    };

    window._vcReset = () => {
      jawOpeningMM = 0;
      objectPlaced = false;
      observations = [];
      autoMode = true;
      document.getElementById('vc-auto').checked = true;
      document.getElementById('vc-exam-panel').style.display = 'none';
      document.getElementById('vc-exam-fb').textContent = '';
      renderTable();
    };

    // Auto/Exam mode
    document.getElementById('vc-auto').addEventListener('change', function () {
      autoMode = this.checked;
      document.getElementById('vc-exam-panel').style.display = autoMode ? 'none' : '';
    });

    // Exam mode check
    window._vcCheckExam = () => {
      const userMSR = parseFloat(document.getElementById('vc-exam-msr').value);
      const userVSD = parseInt(document.getElementById('vc-exam-vsd').value);
      const fb = document.getElementById('vc-exam-fb');

      if (isNaN(userMSR) || isNaN(userVSD)) {
        fb.innerHTML = '<span style="color:#f59e0b;">Please enter both MSR and VSD values.</span>';
        return;
      }

      const r = computeReading();
      const correctMSR = r.msrCM;
      const correctVSD = r.vsd;

      let msgs = [];
      let allCorrect = true;

      if (Math.abs(userMSR - correctMSR) > 0.01) {
        allCorrect = false;
        msgs.push(`<span style="color:#ef4444;">MSR: You said ${userMSR} cm, correct is ${correctMSR.toFixed(1)} cm. Look for the main scale mark just BEFORE the Vernier zero.</span>`);
      } else {
        msgs.push('<span style="color:#22c55e;">MSR ✓</span>');
      }

      if (userVSD !== correctVSD) {
        allCorrect = false;
        msgs.push(`<span style="color:#ef4444;">VSD: You said ${userVSD}, correct is ${correctVSD}. Find the Vernier mark that aligns best with ANY main scale mark.</span>`);
      } else {
        msgs.push('<span style="color:#22c55e;">VSD ✓</span>');
      }

      if (allCorrect) {
        msgs.push(`<br><span style="color:#22c55e; font-weight:700;">🎉 Correct! Reading = ${r.readingCM.toFixed(2)} cm</span>`);
      }

      fb.innerHTML = msgs.join('<br>');
    };

    /* ── Table Rendering ──────────────────────────────────────── */
    function renderTable() {
      const tbody = document.getElementById('vc-tbody');
      tbody.innerHTML = '';
      observations.forEach((o, i) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        tr.innerHTML = `
          <td style="padding:4px 8px; color:var(--text-muted);">${i + 1}</td>
          <td style="padding:4px 8px; color:var(--text-secondary);">${o.obj}</td>
          <td style="padding:4px 8px; text-align:center; color:#22c55e;">${o.msr}</td>
          <td style="padding:4px 8px; text-align:center; color:#3b82f6;">${o.vsd}</td>
          <td style="padding:4px 8px; text-align:center; color:#0ea5e9;">${o.reading}</td>
          <td style="padding:4px 8px; text-align:center; color:#f59e0b;">${o.corrected}</td>
          <td style="padding:4px 8px; text-align:center; color:var(--text-muted);">${o.actual}</td>
          <td style="padding:4px 8px; text-align:center;">${o.correct ? '✅' : '❌'}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    /* ── Start ────────────────────────────────────────────────── */
    requestAnimationFrame(draw);

    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', resize);
      delete window._vcObj;
      delete window._vcPlaceObj;
      delete window._vcCloseJaws;
      delete window._vcRecord;
      delete window._vcNewSizes;
      delete window._vcReset;
      delete window._vcCheckExam;
    };
  };
})();
