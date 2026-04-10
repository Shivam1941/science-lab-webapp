/* ============================================================
   Microorganisms – Growth of Bread Mold
   CBSE Class 6-10 Biology | Interactive Simulation
   ============================================================ */
(function () {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['bread_mold_fungus'] = function (container) {

    // ── Constants & Config ─────────────────────────────────
    const MOISTURE_OPTS = [
      { id: 'dry', label: 'Dry Bread', factor: 0.1 },
      { id: 'moist', label: 'Moistened Bread', factor: 1.0 }
    ];
    const TEMP_OPTS = [
      { id: 'cold', label: 'Refrigerator (4°C)', factor: 0.1 },
      { id: 'room', label: 'Room Temp (25°C)', factor: 0.8 },
      { id: 'warm_dark', label: 'Warm & Dark (30°C)', factor: 1.2 }
    ];
    const MAX_DAYS = 7;
    const STEPS = [
      { id: 0, icon: '🍞', label: 'Select Bread Context', desc: 'Choose between dry or moistened bread slices.' },
      { id: 1, icon: '🌡️', label: 'Set Environment', desc: 'Select the storage temperature condition.' },
      { id: 2, icon: '📦', label: 'Store in Container', desc: 'Place the setup the container.' },
      { id: 3, icon: '⏳', label: 'Observe Time (Days)', desc: 'Advance the days to track mold progression.' },
      { id: 4, icon: '🔬', label: 'Microscope View', desc: 'Examine the fungal structure closely.' }
    ];

    const VIVA = [
      { q: 'What is the scientific name for common bread mold?',
        opts: ['Saccharomyces', 'Rhizopus', 'Penicillium', 'Aspergillus'], ans: 1,
        exp: 'Rhizopus stolonifer is the common black bread mold.' },
      { q: 'Why does moistened bread grow mold faster?',
        opts: ['Spores are thirsty', 'Water acts as food', 'Moisture is essential for spore germination and hyphal growth', 'It cools down the bread'], ans: 2,
        exp: 'Fungal spores require moisture to germinate and grow their web-like mycelium.' },
      { q: 'Which environment is most optimal for bread mold?',
        opts: ['Warm and moist', 'Cold and moist', 'Warm and dry', 'Cold and dry'], ans: 0,
        exp: 'Fungi thrive best in warm, moist, dark conditions where enzymes can actively break down nutrients.' },
      { q: 'What are the tiny black structures seen on mature mold?',
        opts: ['Seeds', 'Flowers', 'Roots', 'Sporangia (spore cases)'], ans: 3,
        exp: 'Sporangia are reproductive structures containing thousands of spores, appearing black.' },
      { q: 'What type of organism is a fungus?',
        opts: ['Autotroph', 'Saprophyte (Heterotroph)', 'Parasite only', 'Chemosynthetic'], ans: 1,
        exp: 'Bread mold is a saprophyte, feeding on dead/decaying organic matter by secreting enzymes.' },
      { q: 'Why is keeping bread in the refrigerator effective?',
        opts: ['Kills the spores', 'Slows down enzymatic action & growth', 'Dries out the bread instantly', 'Turns spores into ice'], ans: 1,
        exp: 'Cold temperatures significantly restrict metabolic activities, slowing down fungal growth.' }
    ];

    // ── State ──────────────────────────────────────────────
    let step = -1, done = [];
    let selMoist = 0; // 0=dry, 1=moist
    let selTemp = 1;  // 0=cold, 1=room, 2=warm
    let currentDay = 0;
    
    // Growth meter 0 - 100
    let growthLevel = 0;
    
    let isStored = false;
    let showMicroscope = false;
    let demoMode = false;
    let demoTimer = null;
    let animFrame = null;
    let t = 0;

    let vivaOpen = false, vivaIdx = 0, vivaScore = 0;
    let obsSubmitted = false;

    // Mold patches on bread
    let patches = [];
    for(let i=0; i<15; i++){
      patches.push({
        x: 180 + Math.random()*200, 
        y: 120 + Math.random()*150, 
        maxScale: 0.5 + Math.random()*1.5,
        type: Math.random() > 0.3 ? 'dark' : 'white',
        delay: Math.random() * 2 // starts growing after day X
      });
    }

    // ── HTML Layout ────────────────────────────────────────
    container.innerHTML = `
<div class="bm-root">
  <div class="bm-topbar">
    <div class="bm-prog-wrap">
      <span class="bm-prog-label" id="bm-step-lbl">Step 0 / ${STEPS.length}</span>
      <div class="bm-prog-track"><div class="bm-prog-fill" id="bm-pfill" style="width:0%"></div></div>
    </div>
    <div class="bm-top-btns">
      <button class="bm-btn bm-btn-toggle" id="bm-micro-btn" onclick="window._bmToggleMicro()"><span style="font-size:14px">🔬</span> View Scope</button>
      <button class="bm-btn bm-btn-demo" onclick="window._bmDemo()">▶ Auto Demo</button>
      <button class="bm-btn bm-btn-reset" onclick="window._bmReset()">↺ Reset</button>
    </div>
  </div>

  <div class="bm-grid">
    <!-- SIDEBAR -->
    <aside class="bm-sidebar">
      <div class="bm-sidebar-hd">🧫 Procedure</div>
      ${STEPS.map((s,i) => `
        <div class="bm-step" id="bm-s${i}" onclick="window._bmStep(${i})">
          <span class="bm-s-num">${i+1}</span>
          <span class="bm-s-ico">${s.icon}</span>
          <span class="bm-s-name">${s.label}</span>
          <span class="bm-s-chk" id="bm-chk${i}">○</span>
        </div>`).join('')}
    </aside>

    <!-- SIMULATION CANVAS & CONTROLS -->
    <div class="bm-sim-col">
      <div class="bm-controls">
        <div class="bm-control-group">
          <div class="bm-ctrl-lbl">💧 Moisture</div>
          <div class="bm-chip-row">
            ${MOISTURE_OPTS.map((m,i)=>`<button class="bm-chip ${i===0?'bm-chip-act':''}" id="bm-moist-${i}" onclick="window._bmSetMoist(${i})">${m.label}</button>`).join('')}
          </div>
        </div>
        <div class="bm-control-group">
          <div class="bm-ctrl-lbl">🌡️ Environment</div>
          <div class="bm-chip-row">
            ${TEMP_OPTS.map((t,i)=>`<button class="bm-chip ${i===1?'bm-chip-act':''}" id="bm-temp-${i}" onclick="window._bmSetTemp(${i})">${t.label}</button>`).join('')}
          </div>
        </div>
        <div class="bm-control-group" style="margin-left:auto">
          <div class="bm-ctrl-lbl">⏳ Time (Day <span id="bm-day-val">0</span>/${MAX_DAYS})</div>
          <div class="bm-time-ctrls">
             <button class="bm-btn" onclick="window._bmAddDay(-1)">-1</button>
             <button class="bm-btn" style="background:var(--biology-primary);color:var(--bg-card);border-color:var(--biology-primary)" onclick="window._bmAddDay(+1)">+ Day</button>
          </div>
        </div>
      </div>

      <div class="bm-canvas-wrap">
        <canvas id="bm-canvas" width="560" height="380"></canvas>
        <div class="bm-growth-meter">
          <div>Growth Rate</div>
          <div class="bm-meter-bg"><div class="bm-meter-fill" id="bm-growth-fill"></div></div>
        </div>
        
        <div class="bm-overlay" id="bm-overlay">
          <div class="bm-start-card">
            <h3 style="margin-bottom:10px;font-family:'Space Grotesk',sans-serif">Fungal Growth Simulator</h3>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:15px">Test how moisture and temperature affect bread mold.</p>
            <button class="bm-big-btn" onclick="window._bmStep(0)">Start Experiment</button>
          </div>
        </div>
      </div>
      
      <div class="bm-desc-box"><span>ℹ️</span><span id="bm-desc">Set the starting conditions to begin.</span></div>
      <div class="bm-fb hidden" id="bm-fb"></div>
    </div>

    <!-- OBSERVATION PANEL -->
    <aside class="bm-panel">
      <div class="bm-panel-sec">
         <div class="bm-panel-hd">📊 Live Stats</div>
         <div class="bm-stat-row"><span>Moisture:</span><strong id="st-moist" style="color:#06b6d4">Dry</strong></div>
         <div class="bm-stat-row"><span>Environment:</span><strong id="st-temp" style="color:#f59e0b">Room Temp</strong></div>
         <div class="bm-stat-row"><span>Days Passed:</span><strong id="st-days">0</strong></div>
         <div class="bm-stat-row"><span>Mold Coverage:</span><strong id="st-cov">0%</strong></div>
      </div>

      <div class="bm-panel-sec" id="bm-obs-sec" style="display:none">
        <div class="bm-panel-hd">📝 Lab Record</div>
        <p style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">Which setup gives MAXIMUM mold growth?</p>
        
        <label class="bm-form-lbl">Moisture level:</label>
        <select id="bm-obs-moist" class="bm-select">
          <option value="">-- select --</option>
          <option value="dry">Dry</option>
          <option value="moist">Moist</option>
        </select>
        
        <label class="bm-form-lbl">Temperature:</label>
        <select id="bm-obs-temp" class="bm-select">
           <option value="">-- select --</option>
           <option value="cold">Cold</option>
           <option value="room">Room Temp</option>
           <option value="warm">Warm</option>
        </select>

        <button class="bm-obs-btn" id="bm-obs-sub" onclick="window._bmSubmit()">Verify Output</button>
        <div id="bm-obs-res" class="bm-fb hidden" style="margin-top:10px"></div>
      </div>
      
      <div class="bm-panel-sec" id="bm-res-sec" style="display:none">
         <div class="bm-panel-hd">✅ Conclusion</div>
         <p style="font-size:12px;color:var(--text-secondary);line-height:1.5">Saprotrophic fungi like Bread Mold (Rhizopus) require extracellular digestion. Warmth and moisture accelerate enzymatic activity and spore germination.</p>
         <button class="bm-viva-btn" onclick="window._bmOpenViva()">🎓 Start Viva</button>
      </div>
    </aside>
  </div>

  <!-- VIVA -->
  <div class="bm-viva-ov hidden" id="bm-viva-ov">
    <div class="bm-viva-mo">
      <div class="bm-viva-hd">
        <span style="flex:1;font-size:16px;font-weight:700">🎓 Viva Mode</span>
        <span style="margin-right:12px;font-size:13px;color:var(--text-secondary)">Score: <b id="bm-vsc">0</b>/${VIVA.length}</span>
        <button class="bm-vclose" onclick="window._bmCloseViva()">✕</button>
      </div>
      <div class="bm-viva-body" id="bm-vbody"></div>
    </div>
  </div>
</div>`;

    // ── Logic & Render ─────────────────────────────────────
    const canvas = document.getElementById('bm-canvas');
    const ctx = canvas.getContext('2d');

    function calculateGrowth() {
      // growth based on day, moist, temp
      const mFact = MOISTURE_OPTS[selMoist].factor;
      const tFact = TEMP_OPTS[selTemp].factor;
      
      // base growth rate formula
      let maxCap = (mFact * tFact) * 100; // max possible coverage
      if (maxCap > 100) maxCap = 100;
      
      // S-curve for growth over days
      if (currentDay === 0) return 0;
      let dayFactor = (currentDay / MAX_DAYS);
      // accelerates
      dayFactor = Math.pow(dayFactor, 1.5);
      
      let cov = maxCap * dayFactor;
      return Math.min(cov, 100);
    }

    function drawBread() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0,0,W,H);
      
      // bg color setup
      ctx.fillStyle = '#060810';
      ctx.fillRect(0,0,W,H);

      // ambient lighting based on environment
      if (selTemp === 0) { // cold
        ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
        ctx.fillRect(0,0,W,H);
      } else if (selTemp === 2) { // warm/dark
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0,0,W,H);
      }

      // Bread Slice
      const bx = 160, by = 100, bw = 240, bh = 220;
      
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath(); ctx.ellipse(bx+bw/2, by+bh+10, bw*0.6, 20, 0, 0, Math.PI*2); ctx.fill();

      // bread base shape (round top)
      ctx.fillStyle = selMoist === 1 ? '#d6b382' : '#e2cdab'; // darker if moist
      ctx.beginPath();
      ctx.moveTo(bx, by+60);
      ctx.bezierCurveTo(bx, by-20, bx+bw, by-20, bx+bw, by+60);
      ctx.lineTo(bx+bw-15, by+bh);
      ctx.lineTo(bx+15, by+bh);
      ctx.closePath();
      ctx.fill();

      // crust
      ctx.strokeStyle = '#9c6f37';
      ctx.lineWidth = 10;
      ctx.stroke();
      
      // pores texture
      ctx.fillStyle = 'rgba(156, 111, 55, 0.15)';
      for(let i=0;i<60;i++){
         ctx.beginPath();
         let px = bx+20 + Math.random()*(bw-40);
         let py = by+30 + Math.random()*(bh-40);
         ctx.arc(px,py, 1+Math.random()*2, 0, Math.PI*2);
         ctx.fill();
      }

      // Draw mold patches if growing
      if (growthLevel > 0 && isStored) {
        // how many patches visible based on growth level?
        let maxVisible = Math.ceil((growthLevel / 100) * patches.length * 1.5);
        
        patches.forEach((p, i) => {
           let pop = Math.max(0, currentDay - p.delay);
           if(pop <= 0) return; // hasn't started
           
           let curScale = Math.min(p.maxScale, pop * 0.3 * (MOISTURE_OPTS[selMoist].factor * TEMP_OPTS[selTemp].factor));
           
           if(curScale>0){
             drawFuzzyMold(p.x, p.y, curScale*30, p.type, curScale);
           }
        });
      }

      if (showMicroscope) {
        drawMicroscopeOverlay();
      }

      t += 0.05;
      animFrame = requestAnimationFrame(drawBread);
    }

    function drawFuzzyMold(x, y, r, type, age) {
      // base fuzz
      ctx.save();
      ctx.translate(x,y);
      let fuzzCount = Math.floor(10 * age);
      
      ctx.fillStyle = type === 'white' ? 'rgba(240,240,240,0.6)' : 'rgba(50,55,50,0.7)';
      
      // fuzzy blobs
      for(let i=0; i<fuzzCount; i++){
         let a = Math.random()*Math.PI*2;
         let dist = Math.random()*r;
         ctx.beginPath();
         ctx.arc(Math.cos(a)*dist, Math.sin(a)*dist, 4+Math.random()*6, 0, Math.PI*2);
         ctx.fill();
      }
      
      // if dark and mature enough, draw sporangia dots
      if (type === 'dark' && age > 0.8) {
         ctx.fillStyle = '#111';
         for(let i=0; i<fuzzCount*3; i++){
            let a = Math.random()*Math.PI*2;
            let dist = Math.random()*r;
            ctx.beginPath();
            ctx.arc(Math.cos(a)*dist, Math.sin(a)*dist, 1.5, 0, Math.PI*2);
            ctx.fill();
         }
      }
      ctx.restore();
    }

    function drawMicroscopeOverlay() {
      const W = canvas.width, H = canvas.height;
      const cx = 130, cy = 130, r = 100;
      
      // Lens circle
      ctx.beginPath(); ctx.arc(cx,cy,r+4, 0, Math.PI*2);
      ctx.fillStyle = '#fff'; ctx.fill();
      
      ctx.save();
      ctx.beginPath(); ctx.arc(cx,cy,r, 0, Math.PI*2);
      ctx.clip();
      
      // background of zoom view
      ctx.fillStyle = '#e2cdab';
      ctx.fillRect(cx-r, cy-r, r*2, r*2);
      
      // draw detailed hyphae based on growth
      let coverage = growthLevel / 100;
      
      if(coverage > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        // draw mycelium
        let hyphaeCount = Math.floor(coverage * 20);
        for(let i=0; i<hyphaeCount; i++){
           let hx = cx - 50 + Math.random()*100;
           let hy = cy + 80 - Math.random()*40;
           
           ctx.beginPath(); ctx.moveTo(hx, hy);
           ctx.lineTo(hx + Math.sin(i)*15, hy - 40 - Math.random()*30);
           ctx.stroke();
           
           // sporangium head if mature
           if(currentDay > 3 && Math.random() > 0.3) {
             ctx.fillStyle = '#222';
             ctx.beginPath();
             ctx.arc(hx + Math.sin(i)*15, hy - 40 - Math.random()*30, 8, 0, Math.PI*2);
             ctx.fill();
           }
        }
      } else {
        ctx.fillStyle = '#9c6f37'; ctx.font='12px Inter';
        ctx.fillText('No visible fungus', cx-45, cy);
      }
      
      ctx.restore();
      
      // Scope border
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.arc(cx,cy,r, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx,cy,r-6, 0, Math.PI*2); ctx.stroke();
      
      ctx.fillStyle = '#06b6d4'; ctx.font = 'bold 12px JetBrains Mono';
      ctx.fillText('Microscope View (400x)', cx-70, cy+r+25);
    }

    function fb(msg, type='success'){
      const e = document.getElementById('bm-fb');
      e.className = 'bm-fb bm-fb-'+type; e.textContent = msg;
      setTimeout(()=>e.classList.add('hidden'), 3500);
    }
    
    function refreshStats() {
      // growth calc
      growthLevel = calculateGrowth();
      
      document.getElementById('bm-day-val').textContent = currentDay;
      document.getElementById('st-days').textContent = currentDay;
      document.getElementById('st-moist').textContent = MOISTURE_OPTS[selMoist].label;
      document.getElementById('st-temp').textContent = TEMP_OPTS[selTemp].label;
      document.getElementById('st-cov').textContent = Math.round(growthLevel) + '%';
      
      document.getElementById('bm-growth-fill').style.width = growthLevel + '%';
      
      // Update checkmarks
      STEPS.forEach((_,i)=>{
        const e = document.getElementById('bm-s'+i);
        const c = document.getElementById('bm-chk'+i);
        e.className = 'bm-step';
        if(done.includes(i)){ e.classList.add('bm-s-dn'); c.textContent='✓'; }
        else if (i===step+1 || (step<0 && i===0)){ e.classList.add('bm-s-ac'); c.textContent='→'; }
        else { e.classList.add('bm-s-lk'); c.textContent='○'; }
      });
      document.getElementById('bm-step-lbl').textContent = `Step ${Math.max(0,step+1)} / ${STEPS.length}`;
      document.getElementById('bm-pfill').style.width = (done.length/STEPS.length*100) + '%';
      
      if(currentDay >= MAX_DAYS) {
        document.getElementById('bm-obs-sec').style.display='block';
      }
    }

    // ── Actions ───────────────────────────────────────────
    window._bmSetMoist = function(i) {
      if(demoMode) return;
      selMoist = i;
      [0,1].forEach(j => document.getElementById('bm-moist-'+j).classList.toggle('bm-chip-act', i===j));
      fb(`Bread type set to ${MOISTURE_OPTS[i].label}`);
      if(!done.includes(0)) window._bmStep(0);
      refreshStats();
    };

    window._bmSetTemp = function(i) {
      if(demoMode) return;
      selTemp = i;
      [0,1,2].forEach(j => document.getElementById('bm-temp-'+j).classList.toggle('bm-chip-act', i===j));
      fb(`Environment set to ${TEMP_OPTS[i].label}`);
      if(!done.includes(1)) window._bmStep(1);
      refreshStats();
    };
    
    window._bmAddDay = function(d) {
      if(!isStored) { fb('Store the bread in the container first (Step 3)!', 'error'); return;}
      currentDay = Math.max(0, Math.min(MAX_DAYS, currentDay + d));
      if(!done.includes(3) && currentDay > 0) window._bmStep(3);
      refreshStats();
    }

    window._bmToggleMicro = function() {
      if(!isStored) return;
      showMicroscope = !showMicroscope;
      document.getElementById('bm-micro-btn').classList.toggle('bm-btn-on', showMicroscope);
      if(!done.includes(4)) window._bmStep(4);
    }

    window._bmStep = function(i) {
      if(demoMode && i !== step+1 && step>-1) return;
      if (i > step+1 && !done.includes(i)) { fb('Follow procedure in sequence!','error'); return; }
      if (done.includes(i)) return;
      
      step=i; done.push(i);
      if(i===0) document.getElementById('bm-overlay').style.display='none';
      if(i===2) { isStored = true; fb('Bread placed in container. Now advance time.'); }
      
      document.getElementById('bm-desc').textContent = STEPS[i].desc;
      refreshStats();
    }

    window._bmReset = function() {
      if(demoTimer) clearTimeout(demoTimer);
      demoMode = false;
      step=-1; done=[]; currentDay=0; isStored=false; showMicroscope=false;
      selMoist=0; selTemp=1; growthLevel=0; obsSubmitted=false;
      
      document.getElementById('bm-overlay').style.display='flex';
      document.getElementById('bm-micro-btn').classList.remove('bm-btn-on');
      document.getElementById('bm-obs-sec').style.display='none';
      document.getElementById('bm-res-sec').style.display='none';
      document.getElementById('bm-obs-res').classList.add('hidden');
      
      window._bmSetMoist(0); window._bmSetTemp(1); // will trigger refresh
      // reset patches
      patches.forEach(p => Math.random() > 0.5 ? p.delay = Math.random()*2 : p.delay=1);
    }

    window._bmDemo = function() {
      window._bmReset();
      demoMode = true;
      document.getElementById('bm-overlay').style.display='none';
      
      // Force ideal conditions
      window._bmSetMoist(1); // Moist
      window._bmSetTemp(2);  // Warm/Dark
      window._bmStep(0);
      window._bmStep(1);
      
      setTimeout(()=>{ window._bmStep(2); }, 1000); // Store container
      
      let dayClock = 0;
      let dI = setInterval(()=>{
        if(!demoMode || currentDay >= MAX_DAYS) { clearInterval(dI); demoMode=false; return; }
        window._bmAddDay(1);
        if(currentDay===3) window._bmToggleMicro();
      }, 1000);
      demoTimer = dI;
    }
    
    window._bmSubmit = function() {
      if(obsSubmitted) return;
      let m = document.getElementById('bm-obs-moist').value;
      let t = document.getElementById('bm-obs-temp').value;
      let r = document.getElementById('bm-obs-res');
      r.classList.remove('hidden');
      
      if(!m || !t) { r.className='bm-fb bm-fb-error'; r.textContent='Select both answers.'; return;}
      if(m==='moist' && t==='warm') {
        r.className='bm-fb bm-fb-success'; r.innerHTML='✅ Correct! Fungi require <b>moisture</b> and <b>warmth</b> for optimal growth.';
        obsSubmitted=true;
        document.getElementById('bm-res-sec').style.display='block';
        try { localStorage.setItem('lab_prog_bread_mold_fungus', '100'); 
              if(window.experimentCompleted) window.experimentCompleted('bread_mold_fungus');
        } catch(e){}
      } else {
        r.className='bm-fb bm-fb-error'; r.textContent='❌ Incorrect. Dry or cold environments inhibit mold growth. Try again.';
      }
    };
    
    // Viva Logic
    window._bmOpenViva = function(){
      vivaOpen=true; vivaIdx=0; vivaScore=0;
      document.getElementById('bm-viva-ov').classList.remove('hidden'); renderV();
    };
    window._bmCloseViva = function(){
      document.getElementById('bm-viva-ov').classList.add('hidden'); vivaOpen=false;
    };
    window._bmAns = function(c){
      const q=VIVA[vivaIdx];
      if(c===q.ans) vivaScore++;
      document.getElementById('bm-vsc').textContent=vivaScore;
      q.opts.forEach((_,i)=>{
        const b=document.getElementById('bm-vo'+i);
        b.disabled=true;
        if(i===q.ans) b.style.borderColor='#4ade80', b.style.color='#4ade80';
        else if(i===c) b.style.borderColor='#f87171', b.style.color='#f87171';
      });
      document.getElementById('bm-vnext').style.display='block';
      let e = document.getElementById('bm-vexp');
      e.style.display='block';
      e.innerHTML = (c===q.ans?'✅ ':'❌ ') + q.exp;
    };
    window._bmNext = function() { vivaIdx++; renderV(); };
    function renderV() {
      const b=document.getElementById('bm-vbody');
      if(vivaIdx >= VIVA.length){
        let p = Math.round(vivaScore/VIVA.length*100);
        b.innerHTML = `<div style="text-align:center;padding:30px">
           <h1 style="font-size:36px;color:var(--text-primary);margin-bottom:10px">${p}%</h1>
           <p style="color:var(--text-secondary);margin-bottom:20px">You scored ${vivaScore} out of ${VIVA.length}</p>
           <button class="bm-big-btn" onclick="window._bmCloseViva()">Close</button>
        </div>`;
        return;
      }
      let q=VIVA[vivaIdx];
      b.innerHTML = `
        <div style="font-size:11px;color:var(--text-muted);font-weight:600;margin-bottom:8px">Q${vivaIdx+1} of ${VIVA.length}</div>
        <div style="font-size:16px;font-weight:600;margin-bottom:16px;line-height:1.4">${q.q}</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${q.opts.map((o,i)=>`<button class="bm-vopt" id="bm-vo${i}" onclick="window._bmAns(${i})">${o}</button>`).join('')}
        </div>
        <div id="bm-vexp" style="display:none;margin-top:12px;padding:10px;background:rgba(255,255,255,0.05);border-radius:6px;font-size:13px;line-height:1.5"></div>
        <button id="bm-vnext" class="bm-big-btn" style="display:none;margin-top:16px;width:100%" onclick="window._bmNext()">Next Question →</button>
      `;
    }

    refreshStats();
    drawBread();

    return function cleanup() {
      if(animFrame) cancelAnimationFrame(animFrame);
      if(demoTimer) clearInterval(demoTimer);
      ['SetMoist','SetTemp','AddDay','ToggleMicro','Step','Reset','Demo','Submit','OpenViva','CloseViva','Ans','Next'].forEach(n => delete window['_bm'+n]);
    };
  };
})();
