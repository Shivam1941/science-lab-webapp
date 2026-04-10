/* ============================================================
   Water Transport in Plants – Xylem Dye Experiment
   CBSE Class 6-10 Biology | Interactive Simulation
   ============================================================ */
(function () {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['water_transport_xylem'] = function (container) {

    /* ── Constants & State ─────────────────────────────────── */
    const DYE_COLORS = [
      { name: 'Red',    hex: '#ef4444', r: 239, g: 68,  b: 68  },
      { name: 'Blue',   hex: '#3b82f6', r: 59,  g: 130, b: 246 },
      { name: 'Green',  hex: '#22c55e', r: 34,  g: 197, b: 94  },
      { name: 'Purple', hex: '#a855f7', r: 168, g: 85,  b: 247 },
    ];
    const PLANTS = [
      { id: 'celery',  label: 'Celery Stalk',    icon: '🥬' },
      { id: 'flower',  label: 'White Carnation',  icon: '🌸' },
      { id: 'stem',    label: 'Generic Stem',     icon: '🌿' },
    ];
    const STEPS = [
      { id: 0, icon: '🥬', label: 'Select Plant',        desc: 'Choose a plant: celery, white carnation, or a generic stem.' },
      { id: 1, icon: '🫙', label: 'Fill Beaker',         desc: 'Add water to the beaker until it is about ¾ full.' },
      { id: 2, icon: '🎨', label: 'Add Dye',             desc: 'Drop food colouring into the water and stir until evenly mixed.' },
      { id: 3, icon: '🌱', label: 'Place Plant',         desc: 'Place the freshly cut stem into the coloured water immediately.' },
      { id: 4, icon: '⏱️', label: 'Wait / Observe',      desc: 'Use the time slider to fast-forward. Watch the dye rise through the xylem.' },
      { id: 5, icon: '🔬', label: 'Cross Section View',  desc: 'Toggle the stem cross-section to see coloured xylem vessels inside.' },
    ];
    const VIVA = [
      { q: 'What tissue transports water upward in plants?',
        opts: ['Phloem','Xylem','Cortex','Epidermis'], ans: 1,
        exp: 'Xylem vessels form a continuous tube from roots to leaves, transporting water and minerals upward.' },
      { q: 'What force drives water up the plant in this experiment?',
        opts: ['Root pressure only','Gravity','Transpiration pull (capillarity + cohesion)','Osmosis alone'], ans: 2,
        exp: 'Transpiration pull — water evaporates from leaves, creating suction that pulls more water up through xylem.' },
      { q: 'Why is a diagonal cut made at the stem base?',
        opts: ['Looks better','Increases surface area for water uptake','Prevents air entry','Makes it shorter'], ans: 1,
        exp: 'A diagonal cut exposes more xylem cross-section, increasing the surface area available for water uptake.' },
      { q: 'Which part of the plant turns coloured first?',
        opts: ['Leaves','Petals','Stem (xylem vessels)','Roots'], ans: 2,
        exp: 'The dye enters the xylem in the stem first, then travels up to colour the veins in leaves/petals.' },
      { q: 'What is transpiration?',
        opts: ['Absorption of CO₂','Loss of water vapour from leaves','Transport of food','Root absorption'], ans: 1,
        exp: 'Transpiration is the evaporation of water from leaf surfaces, which creates the pull that moves water upward.' },
      { q: 'What type of transport does xylem perform?',
        opts: ['Bidirectional','Downward only','Upward (unidirectional)','Lateral only'], ans: 2,
        exp: 'Xylem conducts water and minerals in one direction — upward from roots to shoots and leaves.' },
      { q: 'If the stem is cut horizontally, what pattern of coloured dots is visible?',
        opts: ['A solid coloured circle','Scattered coloured dots (xylem vessels)','No colour at all','Only the outer ring'], ans: 1,
        exp: 'When cut cross-sectionally, individual xylem vessels appear as small coloured dots arranged in a ring or scattered pattern.' },
    ];

    let step = -1, done = [], dyeIdx = 0, plantIdx = 0;
    let waterFilled = false, dyeAdded = false, plantPlaced = false;
    let simProgress = 0;   // 0–1
    let simRunning = false, simSpeed = 1;
    let showXylem = false, showCross = false;
    let demoMode = false, demoTimer = null;
    let animFrame = null, t = 0;
    let vivaOpen = false, vivaIdx = 0, vivaScore = 0;
    let particles = [];
    let obsSubmitted = false;

    // drag state
    let dragging = null; // 'plant' | 'dye'

    /* ── HTML ─────────────────────────────────────────────── */
    container.innerHTML = `
<div class="wt-root">
  <!-- TOP BAR -->
  <div class="wt-topbar">
    <div class="wt-prog-wrap">
      <span class="wt-prog-label" id="wt-step-lbl">Step 0 / ${STEPS.length}</span>
      <div class="wt-prog-track"><div class="wt-prog-fill" id="wt-pfill" style="width:0%"></div></div>
    </div>
    <div class="wt-top-btns">
      <button class="wt-btn wt-btn-toggle" id="wt-xylem-btn" onclick="window._wtToggleXylem()">🔬 Show Xylem</button>
      <button class="wt-btn wt-btn-toggle" id="wt-cross-btn" onclick="window._wtToggleCross()">✂️ Cross Section</button>
      <button class="wt-btn wt-btn-demo" onclick="window._wtDemo()">▶ Auto Demo</button>
      <button class="wt-btn wt-btn-reset" onclick="window._wtReset()">↺ Reset</button>
    </div>
  </div>

  <!-- MAIN GRID -->
  <div class="wt-grid">

    <!-- SIDEBAR -->
    <aside class="wt-sidebar">
      <div class="wt-sidebar-hd">🧫 Steps</div>
      ${STEPS.map((s,i) => `
        <div class="wt-step" id="wt-s${i}" onclick="window._wtStep(${i})">
          <span class="wt-s-num">${i+1}</span>
          <span class="wt-s-ico">${s.icon}</span>
          <span class="wt-s-name">${s.label}</span>
          <span class="wt-s-chk" id="wt-chk${i}">○</span>
        </div>`).join('')}
      <div class="wt-sidebar-note">Click steps in order</div>
    </aside>

    <!-- SIMULATION CANVAS -->
    <div class="wt-sim-col">
      <!-- Plant & Dye pickers (drag source) -->
      <div class="wt-picker-row">
        <div class="wt-picker-section">
          <div class="wt-picker-lbl">🌱 Choose Plant</div>
          <div class="wt-plant-row">
            ${PLANTS.map((p,i)=>`<div class="wt-plant-chip ${i===0?'wt-chip-active':''}" id="wt-pc${i}" onclick="window._wtPickPlant(${i})">${p.icon} ${p.label}</div>`).join('')}
          </div>
        </div>
        <div class="wt-picker-section">
          <div class="wt-picker-lbl">🎨 Dye Color</div>
          <div class="wt-dye-row">
            ${DYE_COLORS.map((d,i)=>`<div class="wt-dye-dot ${i===0?'wt-dye-active':''}" id="wt-dc${i}" style="background:${d.hex}" onclick="window._wtPickDye(${i})" title="${d.name}"></div>`).join('')}
          </div>
        </div>
        <div class="wt-picker-section">
          <div class="wt-picker-lbl">⏩ Speed</div>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" class="wt-slider" id="wt-speed" min="1" max="10" value="1" oninput="window._wtSpeed(this.value)"/>
            <span class="wt-spd-val" id="wt-spd-lbl">1×</span>
          </div>
        </div>
      </div>

      <!-- Canvas -->
      <div class="wt-canvas-wrap" id="wt-cwrap">
        <canvas id="wt-canvas" width="560" height="400"></canvas>
        <div class="wt-overlay" id="wt-overlay">
          <div class="wt-start-card">
            <div class="wt-start-ico">💧</div>
            <h3>Water Transport in Plants</h3>
            <p>Select a plant and dye colour, then click <strong>Step 1</strong> to begin the experiment, or press <strong>Auto Demo</strong>.</p>
            <button class="wt-big-btn" onclick="window._wtDemo()">▶ Auto Demo</button>
          </div>
        </div>
      </div>

      <!-- Feedback + desc -->
      <div class="wt-fb hidden" id="wt-fb"></div>
      <div class="wt-desc-box"><span>ℹ️</span><span id="wt-desc">Perform each step in order to run the experiment.</span></div>
    </div>

    <!-- INFO PANEL -->
    <aside class="wt-panel">
      <div class="wt-panel-sec">
        <div class="wt-panel-hd">💧 Live Observations</div>
        <div class="wt-obs-list">
          <div class="wt-obs-row"><span class="wt-obs-k">Dye colour</span><span class="wt-obs-v" id="ob-dye">—</span></div>
          <div class="wt-obs-row"><span class="wt-obs-k">Plant type</span><span class="wt-obs-v" id="ob-plant">—</span></div>
          <div class="wt-obs-row"><span class="wt-obs-k">Stem colour</span><span class="wt-obs-v" id="ob-stem">—</span></div>
          <div class="wt-obs-row"><span class="wt-obs-k">Leaf veins</span><span class="wt-obs-v" id="ob-leaf">—</span></div>
          <div class="wt-obs-row"><span class="wt-obs-k">Transport %</span><span class="wt-obs-v" id="ob-pct">0%</span></div>
        </div>
      </div>

      <div class="wt-panel-sec" id="wt-obs-form-sec" style="display:none">
        <div class="wt-panel-hd">📋 Fill Observation</div>
        <label class="wt-form-lbl">Which tissue shows the dye?</label>
        <select id="wt-q1" class="wt-select">
          <option value="">-- select --</option>
          <option value="xylem">Xylem</option>
          <option value="phloem">Phloem</option>
          <option value="cortex">Cortex</option>
          <option value="epidermis">Epidermis</option>
        </select>
        <label class="wt-form-lbl">Direction of transport?</label>
        <select id="wt-q2" class="wt-select">
          <option value="">-- select --</option>
          <option value="upward">Upward</option>
          <option value="downward">Downward</option>
          <option value="sideways">Sideways</option>
        </select>
        <button class="wt-obs-btn" id="wt-obs-sub" onclick="window._wtCheckObs()">Submit Observation</button>
        <div class="wt-obs-res hidden" id="wt-obs-res"></div>
      </div>

      <div class="wt-panel-sec" id="wt-result-sec" style="display:none">
        <div class="wt-panel-hd">✅ Result</div>
        <div id="wt-result-box" class="wt-result-box"></div>
      </div>

      <div class="wt-panel-sec">
        <button class="wt-viva-btn" id="wt-viva-btn" style="display:none" onclick="window._wtOpenViva()">🎓 Start Viva</button>
      </div>
    </aside>
  </div>

  <!-- VIVA OVERLAY -->
  <div class="wt-viva-ov hidden" id="wt-viva-ov">
    <div class="wt-viva-modal">
      <div class="wt-viva-hdr">
        <span class="wt-viva-title">🎓 Viva Mode</span>
        <span class="wt-viva-score">Score: <strong id="wt-vscore">0</strong> / ${VIVA.length}</span>
        <button class="wt-viva-close" onclick="window._wtCloseViva()">✕</button>
      </div>
      <div class="wt-viva-pbar"><div class="wt-viva-pfill" id="wt-vpfill" style="width:0%"></div></div>
      <div id="wt-vbody"></div>
    </div>
  </div>
</div>`;

    /* ── Canvas Setup ─────────────────────────────────────── */
    const canvas = document.getElementById('wt-canvas');
    const ctx = canvas.getContext('2d');

    function dye() { return DYE_COLORS[dyeIdx]; }
    function plant() { return PLANTS[plantIdx]; }
    function dyeRgb(a=1) { const d=dye(); return `rgba(${d.r},${d.g},${d.b},${a})`; }
    function rnd(a,b) { return a+Math.random()*(b-a); }

    /* ── Particles ─────────────────────────────────────────── */
    function spawnParticles(n) {
      for(let i=0;i<n;i++) particles.push({
        x: rnd(235,280), y: rnd(290,340),
        vy: rnd(-0.8,-0.3), vx: rnd(-0.3,0.3),
        r: rnd(2,5), alpha: rnd(0.5,0.9), life: 1
      });
    }
    function tickParticles() {
      particles = particles.filter(p=>p.alpha>0);
      particles.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.alpha-=0.012; });
    }
    function drawParticles() {
      particles.forEach(p=>{
        ctx.fillStyle=dyeRgb(p.alpha);
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      });
    }

    /* ── Drawing helpers ─────────────────────────────────── */
    function drawBeaker(filled, progress) {
      const bx=180,by=240,bw=200,bh=130;
      // glass body
      ctx.strokeStyle='rgba(148,163,184,0.5)'; ctx.lineWidth=3;
      ctx.fillStyle='rgba(96,165,250,0.05)';
      ctx.beginPath();
      ctx.moveTo(bx,by-bh); ctx.lineTo(bx-10,by); ctx.lineTo(bx+bw+10,by); ctx.lineTo(bx+bw,by-bh);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // measurements
      for(let i=1;i<=3;i++){
        ctx.strokeStyle='rgba(148,163,184,0.2)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(bx+5,by-bh*i/4); ctx.lineTo(bx+20,by-bh*i/4); ctx.stroke();
        ctx.fillStyle='rgba(148,163,184,0.3)'; ctx.font='9px Inter';
        ctx.fillText(i*25+'mL',bx+22,by-bh*i/4+3);
      }
      if(!filled) return;
      // water / dye fill
      const waterH = bh*0.72;
      const waterY = by - waterH;
      const alpha = dyeAdded ? Math.min(0.75, 0.15 + progress*0.6) : 0.18;
      const baseColor = dyeAdded ? dyeRgb(alpha) : `rgba(96,165,250,${alpha})`;
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.moveTo(bx+2, by);
      // wavy surface
      const wx = bx+2, ww = bw-4;
      ctx.moveTo(wx, waterY + Math.sin(t*2)*3);
      for(let xi=0;xi<=ww;xi+=20){
        ctx.lineTo(wx+xi, waterY + Math.sin(t*2 + xi*0.08)*3);
      }
      ctx.lineTo(bx+bw-2, by); ctx.lineTo(bx+2, by); ctx.closePath(); ctx.fill();
      // glass rim highlight
      ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(bx,by-bh); ctx.lineTo(bx+bw,by-bh); ctx.stroke();
    }

    function drawStem(progress, plantId) {
      if(!plantPlaced) return;
      const stemX=262, stemBot=238, stemTop=90;
      const stemH = stemBot-stemTop;
      // progress fill height
      const fillH = stemH*progress;

      // stem body (green base)
      ctx.strokeStyle='#166534'; ctx.lineWidth=14; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(stemX, stemBot); ctx.lineTo(stemX, stemTop); ctx.stroke();

      // xylem fill (coloured dye rising)
      if(progress>0.02){
        ctx.strokeStyle = dyeRgb(0.85); ctx.lineWidth=5;
        ctx.beginPath();
        ctx.moveTo(stemX, stemBot);
        ctx.lineTo(stemX, stemBot - fillH);
        ctx.stroke();
        // secondary xylem lines
        ctx.strokeStyle = dyeRgb(0.5); ctx.lineWidth=2;
        [-4,4].forEach(offset=>{
          ctx.beginPath();
          ctx.moveTo(stemX+offset, stemBot);
          ctx.lineTo(stemX+offset, stemBot - fillH*0.85);
          ctx.stroke();
        });
      }

      // xylem highlight overlay
      if(showXylem && progress>0.05){
        ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=2; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(stemX,stemBot); ctx.lineTo(stemX,stemTop); ctx.stroke();
        ctx.setLineDash([]);
        // flow arrows
        const arrowCount = 4;
        for(let i=0;i<arrowCount;i++){
          const ay = stemBot - (stemH*(i+1)/arrowCount)*progress;
          if(ay<stemBot && ay>stemTop){
            ctx.fillStyle=dyeRgb(0.9);
            ctx.beginPath();
            ctx.moveTo(stemX,ay-8); ctx.lineTo(stemX-5,ay); ctx.lineTo(stemX+5,ay);
            ctx.closePath(); ctx.fill();
          }
        }
      }

      // leaves
      drawLeaves(stemX, stemTop, progress, plantId);
    }

    function drawLeaves(sx, stopY, progress, plantId) {
      const leafData = plantId==='flower'
        ? [ {x:-40,y:stopY+20,rx:35,ry:18,ang:-0.4},
            {x:40, y:stopY+20,rx:35,ry:18,ang:0.4} ]
        : [ {x:-45,y:stopY+30,rx:40,ry:16,ang:-0.5},
            {x:45, y:stopY+30,rx:40,ry:16,ang:0.5},
            {x:-30,y:stopY+60,rx:35,ry:14,ang:-0.3},
            {x:30, y:stopY+60,rx:35,ry:14,ang:0.3} ];

      leafData.forEach(l=>{
        // base leaf
        ctx.fillStyle='rgba(34,197,94,0.85)';
        ctx.strokeStyle='rgba(22,163,74,0.6)'; ctx.lineWidth=1;
        ctx.save();
        ctx.translate(sx+l.x, stopY+l.y);
        ctx.rotate(l.ang);
        ctx.beginPath(); ctx.ellipse(0,0,l.rx,l.ry,0,0,Math.PI*2);
        ctx.fill(); ctx.stroke();

        // vein colouring
        if(progress>0.6){
          const vAlpha = Math.min(0.7,(progress-0.6)*2.5);
          ctx.strokeStyle=dyeRgb(vAlpha); ctx.lineWidth=2;
          ctx.beginPath(); ctx.moveTo(-l.rx*0.8,0); ctx.lineTo(l.rx*0.8,0); ctx.stroke();
          // secondary veins
          for(let vi=-2;vi<=2;vi++){
            ctx.strokeStyle=dyeRgb(vAlpha*0.5); ctx.lineWidth=1;
            ctx.beginPath();
            ctx.moveTo(vi*l.rx/3,0);
            ctx.lineTo(vi*l.rx/3 + (vi<0?-10:10), l.ry*0.6*(vi<0?-1:1));
            ctx.stroke();
          }
        }
        ctx.restore();
      });

      // flower petals (carnation)
      if(plantId==='flower'){
        const petalColors = progress>0.85 ? [dyeRgb(0.7),dyeRgb(0.5)] : ['rgba(255,255,255,0.9)','rgba(255,220,220,0.7)'];
        for(let pi=0;pi<6;pi++){
          const ang = (pi/6)*Math.PI*2 + t*0.2;
          ctx.fillStyle = petalColors[pi%2];
          ctx.save();
          ctx.translate(sx, stopY-8);
          ctx.rotate(ang);
          ctx.beginPath(); ctx.ellipse(0,-22,8,18,0,0,Math.PI*2); ctx.fill();
          ctx.restore();
        }
        // centre
        ctx.fillStyle=progress>0.85?dyeRgb(0.8):'#fde68a';
        ctx.beginPath(); ctx.arc(sx,stopY-8,7,0,Math.PI*2); ctx.fill();
      }
    }

    function drawCrossSection() {
      if(!showCross) return;
      const cx=420, cy=170, r=55;
      // ring
      ctx.fillStyle='rgba(22,101,52,0.85)';
      ctx.strokeStyle='#166534'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill(); ctx.stroke();
      // cortex
      ctx.fillStyle='rgba(74,222,128,0.4)';
      ctx.beginPath(); ctx.arc(cx,cy,r-10,0,Math.PI*2); ctx.fill();
      // pith
      ctx.fillStyle='rgba(187,247,208,0.3)';
      ctx.beginPath(); ctx.arc(cx,cy,18,0,Math.PI*2); ctx.fill();
      // xylem bundles (small dots in ring)
      const xylemPositions = 8;
      for(let xi=0;xi<xylemPositions;xi++){
        const a = (xi/xylemPositions)*Math.PI*2;
        const vx = cx + Math.cos(a)*(r-22);
        const vy = cy + Math.sin(a)*(r-22);
        const xyAlpha = simProgress>0.1 ? Math.min(1,simProgress*1.5) : 0;
        ctx.fillStyle = xyAlpha>0 ? dyeRgb(xyAlpha) : 'rgba(255,255,255,0.5)';
        ctx.beginPath(); ctx.arc(vx,vy,7,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=1;
        ctx.stroke();
        // phloem (adjacent, smaller)
        const pa = a+0.25;
        ctx.fillStyle='rgba(250,204,21,0.6)';
        ctx.beginPath(); ctx.arc(cx+Math.cos(pa)*(r-22), cy+Math.sin(pa)*(r-22),4,0,Math.PI*2); ctx.fill();
      }
      // labels
      ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='10px Inter'; ctx.textAlign='center';
      ctx.fillText('Cross Section',cx,cy+r+14);
      ctx.fillStyle=dyeRgb(0.9); ctx.font='9px Inter';
      ctx.fillText('● Xylem',cx-30,cy-r-6);
      ctx.fillStyle='rgba(250,204,21,0.9)';
      ctx.fillText('● Phloem',cx+25,cy-r-6);
      ctx.textAlign='start';
    }

    function drawScene() {
      t += 0.025;
      tickParticles();
      const W=canvas.width, H=canvas.height;
      ctx.clearRect(0,0,W,H);

      // background gradient
      const bg = ctx.createLinearGradient(0,0,0,H);
      bg.addColorStop(0,'#060810'); bg.addColorStop(1,'#0c1220');
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

      // lab bench
      ctx.fillStyle='#1e293b';
      ctx.beginPath(); ctx.roundRect(50,360,460,30,4); ctx.fill();
      ctx.fillStyle='#0f172a';
      ctx.beginPath(); ctx.roundRect(50,380,460,10,2); ctx.fill();

      drawBeaker(waterFilled, simProgress);
      drawParticles();
      drawStem(simProgress, plant().id);
      drawCrossSection();

      // progress badge
      if(plantPlaced && simProgress>0){
        const pct = Math.round(simProgress*100);
        ctx.fillStyle='rgba(6,182,212,0.15)';
        ctx.strokeStyle='rgba(6,182,212,0.35)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(10,10,140,36,8); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#06b6d4'; ctx.font='bold 11px JetBrains Mono';
        ctx.fillText(`Transport: ${pct}%`,20,22);
        ctx.fillStyle='rgba(6,182,212,0.2)'; ctx.fillRect(10,28,130*(simProgress),6);
        ctx.fillStyle='#06b6d4'; ctx.fillRect(10,28,130*(simProgress),6);
      }

      // xylem label
      if(showXylem && simProgress>0.05){
        ctx.fillStyle='rgba(6,182,212,0.9)'; ctx.font='bold 11px Inter';
        ctx.fillText('↑ Xylem flow',285,120);
      }

      animFrame = requestAnimationFrame(drawScene);
    }

    /* ── Simulation Engine ─────────────────────────────────── */
    let simInterval = null;
    function startSim() {
      if(simRunning) return;
      simRunning=true;
      simInterval = setInterval(()=>{
        if(simProgress>=1){ simProgress=1; stopSim(); return; }
        simProgress = Math.min(1, simProgress + 0.0015*simSpeed);
        if(simProgress>0.1 && Math.random()<0.15) spawnParticles(1);
        updateObsPanel();
      }, 40);
    }
    function stopSim() {
      simRunning=false;
      if(simInterval) clearInterval(simInterval);
      if(simProgress>=1) onSimComplete();
    }

    function onSimComplete() {
      document.getElementById('wt-obs-form-sec').style.display='block';
      document.getElementById('wt-result-sec').style.display='block';
      document.getElementById('wt-viva-btn').style.display='block';
      const rb = document.getElementById('wt-result-box');
      rb.innerHTML=`<p><strong style="color:#06b6d4">Xylem vessels</strong> transported the ${dye().name.toLowerCase()} dye from the beaker all the way up through the stem to the leaves${plant().id==='flower'?' and petals':''}.</p>
      <p style="margin-top:8px;color:#94a3b8;font-size:13px">∴ Water and dissolved minerals move <em>upward</em> through xylem by transpiration pull (cohesion-tension mechanism).</p>`;
      try { localStorage.setItem('lab_prog_water_transport_xylem','85'); } catch(e){}
    }

    function updateObsPanel() {
      const d=dye(), p=plant(), pct=Math.round(simProgress*100);
      document.getElementById('ob-dye').textContent = dyeAdded ? d.name : '—';
      document.getElementById('ob-dye').style.color = dyeAdded ? d.hex : '';
      document.getElementById('ob-plant').textContent = plantPlaced ? p.label : '—';
      document.getElementById('ob-stem').textContent = simProgress>0.15 ? `${d.name} dye rising` : simProgress>0 ? 'Just started' : '—';
      document.getElementById('ob-leaf').textContent = simProgress>0.65 ? `Veins turning ${d.name.toLowerCase()}` : 'Not yet';
      document.getElementById('ob-pct').textContent = pct+'%';
      document.getElementById('ob-pct').style.color = pct>0 ? d.hex : '';
      // progress bar
      document.getElementById('wt-pfill').style.width = (done.length/STEPS.length*100)+'%';
      document.getElementById('wt-step-lbl').textContent = `Step ${Math.max(0,step+1)} / ${STEPS.length}`;
    }

    /* ── Step Logic ─────────────────────────────────────────── */
    function feedback(msg,type){
      const el=document.getElementById('wt-fb');
      el.className='wt-fb wt-fb-'+type; el.textContent=msg;
      setTimeout(()=>el.classList.add('hidden'),3000);
    }

    function updateStepUI(){
      STEPS.forEach((_,i)=>{
        const el=document.getElementById('wt-s'+i);
        const chk=document.getElementById('wt-chk'+i);
        el.classList.remove('wt-s-active','wt-s-done','wt-s-lock');
        if(done.includes(i)){ el.classList.add('wt-s-done'); chk.textContent='✓'; }
        else if(i===step+1||(step<0&&i===0)){ el.classList.add('wt-s-active'); chk.textContent='→'; }
        else if(i>step+1){ el.classList.add('wt-s-lock'); chk.textContent='○'; }
      });
    }

    window._wtStep = function(idx){
      if(demoMode) return;
      if(idx > step+1){ feedback('⚠️ Complete previous steps first!','error'); return; }
      if(done.includes(idx)){ feedback('✓ Already done — move to next step.','warn'); return; }

      if(step<0) document.getElementById('wt-overlay').style.display='none';

      step=idx; done.push(idx);

      if(idx===0){ feedback(`✓ Plant selected: ${plant().label}`,'success'); }
      if(idx===1){ waterFilled=true; feedback('✓ Beaker filled with water!','success'); }
      if(idx===2){ dyeAdded=true; spawnParticles(20); feedback(`✓ ${dye().name} dye added!`,'success'); }
      if(idx===3){ plantPlaced=true; feedback('✓ Stem placed in coloured water!','success'); }
      if(idx===4){ startSim(); feedback('⏩ Transport started — watch the dye rise!','success'); }
      if(idx===5){ showCross=true; document.getElementById('wt-cross-btn').classList.add('wt-btn-on');
                   feedback('✂️ Cross-section view enabled!','success'); }

      document.getElementById('wt-desc').textContent = STEPS[idx].desc;
      updateStepUI(); updateObsPanel();
    };

    /* ── Controls ───────────────────────────────────────────── */
    window._wtPickPlant = function(i){
      plantIdx=i;
      PLANTS.forEach((_,j)=>{ document.getElementById('wt-pc'+j).classList.toggle('wt-chip-active',i===j); });
      feedback(`Plant: ${PLANTS[i].label}`,'success');
    };
    window._wtPickDye = function(i){
      dyeIdx=i;
      DYE_COLORS.forEach((_,j)=>{ document.getElementById('wt-dc'+j).classList.toggle('wt-dye-active',i===j); });
      feedback(`Dye: ${DYE_COLORS[i].name}`,'success');
    };
    window._wtSpeed = function(v){
      simSpeed=parseInt(v);
      document.getElementById('wt-spd-lbl').textContent=v+'×';
    };
    window._wtToggleXylem = function(){
      showXylem=!showXylem;
      document.getElementById('wt-xylem-btn').classList.toggle('wt-btn-on',showXylem);
    };
    window._wtToggleCross = function(){
      showCross=!showCross;
      document.getElementById('wt-cross-btn').classList.toggle('wt-btn-on',showCross);
    };

    /* ── Demo Mode ──────────────────────────────────────────── */
    window._wtDemo = function(){
      if(demoMode) return;
      window._wtReset();
      demoMode=true;
      document.getElementById('wt-overlay').style.display='none';
      document.getElementById('wt-canvas').style.display='block';
      simSpeed=5; document.getElementById('wt-speed').value=5; document.getElementById('wt-spd-lbl').textContent='5×';
      let si=0;
      function next(){
        if(si>=STEPS.length){ demoMode=false; return; }
        window._wtStep(si++);
        demoTimer=setTimeout(next, si===5?1800:2000);
      }
      next();
    };

    /* ── Reset ──────────────────────────────────────────────── */
    window._wtReset = function(){
      if(demoTimer) clearTimeout(demoTimer);
      stopSim();
      step=-1; done=[];
      waterFilled=false; dyeAdded=false; plantPlaced=false;
      simProgress=0; simRunning=false; simSpeed=1;
      showXylem=false; showCross=false; demoMode=false;
      particles=[];
      obsSubmitted=false;
      document.getElementById('wt-overlay').style.display='flex';
      document.getElementById('wt-fb').className='wt-fb hidden';
      document.getElementById('wt-desc').textContent='Perform each step in order to run the experiment.';
      document.getElementById('wt-obs-form-sec').style.display='none';
      document.getElementById('wt-result-sec').style.display='none';
      document.getElementById('wt-viva-btn').style.display='none';
      document.getElementById('wt-obs-res').className='wt-obs-res hidden';
      document.getElementById('wt-obs-sub').disabled=false;
      document.getElementById('wt-q1').value='';
      document.getElementById('wt-q2').value='';
      document.getElementById('wt-xylem-btn').classList.remove('wt-btn-on');
      document.getElementById('wt-cross-btn').classList.remove('wt-btn-on');
      document.getElementById('wt-speed').value=1;
      document.getElementById('wt-spd-lbl').textContent='1×';
      updateStepUI(); updateObsPanel();
    };

    /* ── Observation Check ──────────────────────────────────── */
    window._wtCheckObs = function(){
      if(obsSubmitted) return;
      const q1=document.getElementById('wt-q1').value;
      const q2=document.getElementById('wt-q2').value;
      const res=document.getElementById('wt-obs-res');
      res.classList.remove('hidden');
      if(!q1||!q2){ res.className='wt-obs-res wt-obs-wrong'; res.textContent='⚠️ Please answer both questions.'; return; }
      const correct = q1==='xylem' && q2==='upward';
      if(correct){
        res.className='wt-obs-res wt-obs-ok'; res.innerHTML='✅ Correct! Xylem transports water upward.';
        obsSubmitted=true; document.getElementById('wt-obs-sub').disabled=true;
        try{ localStorage.setItem('lab_prog_water_transport_xylem','100'); }catch(e){}
        if(typeof experimentCompleted==='function') experimentCompleted('water_transport_xylem');
      } else {
        const hints=[];
        if(q1!=='xylem') hints.push('Hint: The coloured tissue is xylem.');
        if(q2!=='upward') hints.push('Hint: Water moves against gravity — upward.');
        res.className='wt-obs-res wt-obs-wrong'; res.innerHTML='❌ Incorrect. '+hints.join(' ');
      }
    };

    /* ── Viva ───────────────────────────────────────────────── */
    window._wtOpenViva = function(){
      vivaOpen=true; vivaIdx=0; vivaScore=0;
      document.getElementById('wt-viva-ov').classList.remove('hidden'); renderViva();
    };
    window._wtCloseViva = function(){
      document.getElementById('wt-viva-ov').classList.add('hidden'); vivaOpen=false;
    };
    function renderViva(){
      document.getElementById('wt-vscore').textContent=vivaScore;
      document.getElementById('wt-vpfill').style.width=(vivaIdx/VIVA.length*100)+'%';
      const body=document.getElementById('wt-vbody');
      if(vivaIdx>=VIVA.length){
        const pct=Math.round(vivaScore/VIVA.length*100);
        const grade=pct>=80?'🏆 Excellent!':pct>=60?'👍 Good!':'📖 Keep Studying';
        body.innerHTML=`<div class="wt-viv-sum"><div class="wt-viv-grade">${grade}</div>
          <div class="wt-viv-big">${vivaScore}/${VIVA.length}</div>
          <div class="wt-viv-pct">${pct}% accuracy</div>
          <button class="wt-big-btn" style="margin-top:16px" onclick="window._wtCloseViva()">Close</button>
          <button class="wt-btn" style="margin-top:8px;width:100%;justify-content:center" onclick="window._wtOpenViva()">Retry</button></div>`;
        return;
      }
      const q=VIVA[vivaIdx];
      body.innerHTML=`<div class="wt-viv-q">
        <div class="wt-viv-num">Q${vivaIdx+1} of ${VIVA.length}</div>
        <div class="wt-viv-qtext">${q.q}</div>
        <div class="wt-viv-opts">${q.opts.map((o,i)=>`<button class="wt-vopt" id="wt-vo${i}" onclick="window._wtAns(${i})">${o}</button>`).join('')}</div>
        <div class="wt-viv-exp hidden" id="wt-vexp"></div>
        <button class="wt-big-btn hidden" id="wt-vnext" style="margin-top:10px" onclick="window._wtNext()">Next →</button></div>`;
    }
    window._wtAns = function(chosen){
      const q=VIVA[vivaIdx];
      if(chosen===q.ans) vivaScore++;
      document.getElementById('wt-vscore').textContent=vivaScore;
      q.opts.forEach((_,i)=>{
        const b=document.getElementById('wt-vo'+i);
        if(!b) return;
        b.disabled=true;
        if(i===q.ans) b.classList.add('wt-vopt-ok');
        else if(i===chosen) b.classList.add('wt-vopt-bad');
      });
      const exp=document.getElementById('wt-vexp');
      exp.classList.remove('hidden');
      exp.className='wt-viv-exp '+(chosen===q.ans?'wt-exp-ok':'wt-exp-bad');
      exp.innerHTML=(chosen===q.ans?'✅ ':'❌ ')+q.exp;
      document.getElementById('wt-vnext').classList.remove('hidden');
    };
    window._wtNext = function(){ vivaIdx++; renderViva(); };

    /* ── Launch ─────────────────────────────────────────────── */
    updateStepUI(); updateObsPanel();
    drawScene();

    return function cleanup(){
      if(animFrame) cancelAnimationFrame(animFrame);
      if(simInterval) clearInterval(simInterval);
      if(demoTimer) clearTimeout(demoTimer);
      ['_wtStep','_wtPickPlant','_wtPickDye','_wtSpeed','_wtToggleXylem','_wtToggleCross',
       '_wtDemo','_wtReset','_wtCheckObs','_wtOpenViva','_wtCloseViva','_wtAns','_wtNext']
        .forEach(fn=>delete window[fn]);
    };
  };
})();
