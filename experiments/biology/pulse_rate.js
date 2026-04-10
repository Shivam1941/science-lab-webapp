/* Pulse Rate Experiment */
(function() {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['pulse_rate_experiment'] = function(container, exp) {

    const VIVA_QUESTIONS = [
      { q: 'What is pulse rate?', opts: ['Number of breaths per minute', 'Number of times the heart beats per minute', 'Speed of blood flow', 'Amount of oxygen in blood'], ans: 1, exp: 'Pulse rate is the number of times the heart beats (expands and contracts) per minute.' },
      { q: 'Why does pulse rate increase after exercise?', opts: ['To cool down the body', 'Due to excitement', 'To meet the increased oxygen and energy demand', 'To reduce muscle pain'], ans: 2, exp: 'Exercise requires more energy and oxygen, so the heart pumps faster to supply blood to muscles.' },
      { q: 'What is the average resting pulse rate for an adult?', opts: ['40-50 bpm', '60-100 bpm', '100-120 bpm', '120-150 bpm'], ans: 1, exp: 'A normal resting heart rate for adults ranges from 60 to 100 beats per minute.' },
      { q: 'What does a faster recovery time indicate?', opts: ['Lower fitness level', 'Higher fitness level', 'Heart problem', 'Dehydration'], ans: 1, exp: 'A heart that quickly returns to its resting rate after exercise is a sign of good cardiovascular fitness.' }
    ];

    // State
    const states = {
      SETUP: 0,
      MEASURING_REST: 1,
      WAIT_EXERCISE: 2,
      EXERCISING: 3,
      MEASURING_POST: 4,
      RECOVERY: 5
    };
    
    let currentState = states.SETUP;
    let fitnessLevel = 'average'; // athlete, average, beginner
    let exerciseType = 'running';
    let exerciseDuration = 30; // seconds
    let countingMode = 'auto'; // auto or manual
    
    // Heart variables
    let baseHeartRate = 72; // bpm
    let currentHeartRate = 72;
    let targetHeartRate = 72;
    let peakHeartRate = 120;
    
    let timer = 0;
    let maxTimer = 15; // 15 sec measurement
    let fingersPlaced = false;
    let lastBeatTime = 0;
    
    let manualCount = 0;
    let autoCount = 0;
    
    let restingBPMRecorded = 0;
    let postBPMRecorded = 0;

    // Graph history
    let hrHistory = []; // {time: seconds, hr: bpm}
    let simTime = 0; // overall simulation time
    let inSimLoop = true;

    // EKG properties
    let ekgPoints = [];
    let phase = 0; // 0 to 1 inside a heartbeat cycle
    
    // UI Setup
    container.innerHTML = `
      <div class="sim-container" style="display: flex; gap: 20px; height: 100%; min-height: 500px;">
        
        <!-- Left: Canvas and Simulation -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
          <div class="sim-canvas-wrap" style="flex: 1; position: relative;">
             <canvas id="pulse-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
             
             <!-- Hotspot instruction -->
             <div id="hotspot-msg" style="position: absolute; top: 10px; left: 10px; right: 10px; text-align: center; color: white; background: rgba(0,0,0,0.5); padding: 5px; border-radius: 5px; pointer-events: none; font-size: 14px;">
                Click on the wrist or neck of the silhouette to place fingers.
             </div>
             
             <!-- Manual Count Button (Hidden initially) -->
             <button id="manual-tap-btn" class="sim-btn btn-primary" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: none; width: 200px; padding: 15px; font-size: 16px;">Tap on every beat!</button>
          </div>
          
          <!-- State Indicator Bar -->
          <div style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); border-radius: 8px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
             <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;" id="status-icon">🚶</span>
                <div>
                   <div style="font-size: 12px; color: var(--text-secondary);">Current Status</div>
                   <div style="font-weight: 500; color: #fff;" id="status-text">Resting - Setup Phase</div>
                </div>
             </div>
             <div style="text-align: right;">
                <div style="font-size: 12px; color: var(--text-secondary);">Timer</div>
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 18px; color: #38bdf8;" id="timer-display">00:00</div>
             </div>
          </div>
        </div>

        <!-- Right: Controls & Data -->
        <div class="sim-controls" style="flex: 0 0 350px; display: flex; flex-direction: column; gap: 15px; overflow-y: auto;">
          <div class="sim-controls-title"><span class="ctrl-icon">⚙️</span> Configuration</div>
          
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 13px; color: var(--text-secondary);">Subject Fitness Level:</label>
            <select class="sim-btn" style="width: 100%; text-align: left;" id="cfg-fitness">
              <option value="athlete">Athlete (High fitness)</option>
              <option value="average" selected>Average Person</option>
              <option value="beginner">Beginner (Low fitness)</option>
            </select>
          </div>

          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 13px; color: var(--text-secondary);">Measurement Mode:</label>
            <div class="sim-btn-group">
               <button class="sim-btn btn-primary" id="mode-auto" onclick="window._setMode('auto')">Auto Count</button>
               <button class="sim-btn" id="mode-manual" onclick="window._setMode('manual')">Manual Tap</button>
            </div>
          </div>
          
          <button class="sim-btn btn-primary" style="width: 100%; padding: 12px;" id="action-btn" onclick="window._doAction()">1. Measure Resting Pulse</button>
          
          <!-- Exercise panel (enabled later) -->
          <div id="exercise-panel" style="opacity: 0.5; pointer-events: none; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
            <div class="sim-controls-title" style="margin-bottom: 10px;"><span class="ctrl-icon">🏃</span> Exercise</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 10px;">
              <button class="sim-btn btn-primary" style="padding: 5px;" id="ex-run" onclick="window._setEx('running')">Running</button>
              <button class="sim-btn" style="padding: 5px;" id="ex-jump" onclick="window._setEx('jumping_jacks')">Jacks</button>
              <button class="sim-btn" style="padding: 5px;" id="ex-skip" onclick="window._setEx('skipping')">Skipping</button>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
               <select class="sim-btn" style="flex: 1; text-align: left;" id="cfg-duration">
                 <option value="30">30 Seconds</option>
                 <option value="60" selected>1 Minute</option>
                 <option value="120">2 Minutes</option>
               </select>
               <button class="sim-btn btn-primary" style="flex: 1;" id="start-ex-btn" onclick="window._startExercise()">Start Execise</button>
            </div>
          </div>

          <!-- Observation Table -->
          <div style="margin-top: auto; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
             <div class="sim-results-title"><span class="ctrl-icon">📊</span> Observation Table</div>
             
             <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 5px; font-size: 12px; margin-bottom: 10px; text-align: center; color: var(--text-secondary);">
                <div style="text-align: left;">Condition</div>
                <div>Pulse (bpm)</div>
             </div>
             
             <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 5px; margin-bottom: 5px; align-items: center;">
                <div style="font-size: 13px;">Resting Pulse:</div>
                <input type="number" id="obs-rest" class="sim-btn" style="background: rgba(0,0,0,0.2); padding: 5px; text-align: center; pointer-events: none;" placeholder="--" readonly>
             </div>
             
             <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 5px; margin-bottom: 5px; align-items: center;">
                <div style="font-size: 13px;">Post-Exercise Pulse:</div>
                <input type="number" id="obs-post" class="sim-btn" style="background: rgba(0,0,0,0.2); padding: 5px; text-align: center; pointer-events: none;" placeholder="--" readonly>
             </div>
             
             <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 5px; margin-bottom: 5px; align-items: center;">
                <div style="font-size: 13px;">Difference:</div>
                <input type="number" id="obs-diff" class="sim-btn" style="background: rgba(0,0,0,0.2); padding: 5px; text-align: center;" placeholder="Enter...">
             </div>
             
             <button class="sim-btn" style="width: 100%; margin-top: 5px;" onclick="window._checkTable()">Verify Table</button>
             <div id="table-feedback" style="font-size: 12px; margin-top: 5px; text-align: center; min-height: 15px;"></div>
          </div>
          
          <div style="display: flex; gap: 10px;">
             <button class="sim-btn" style="flex: 1;" onclick="window._resetPulseExp()">↺ Reset</button>
             <button class="sim-btn sim-btn-primary" style="flex: 1;" onclick="window.VIVA_SYSTEM.open(VIVA_QUESTIONS)">🎓 Viva</button>
          </div>
          
        </div>
      </div>
    `;

    // Elements
    const canvas = document.getElementById('pulse-canvas');
    const ctx = canvas.getContext('2d');
    const msgEl = document.getElementById('hotspot-msg');
    const actionBtn = document.getElementById('action-btn');
    const exPanel = document.getElementById('exercise-panel');
    const manualBtn = document.getElementById('manual-tap-btn');
    const obsRest = document.getElementById('obs-rest');
    const obsPost = document.getElementById('obs-post');
    const obsDiff = document.getElementById('obs-diff');
    const statusIcon = document.getElementById('status-icon');
    const statusText = document.getElementById('status-text');
    const timerDisplay = document.getElementById('timer-display');
    const feedback = document.getElementById('table-feedback');

    // Make canvas sharp
    function resizeCanvas() {
       const rect = canvas.parentElement.getBoundingClientRect();
       canvas.width = rect.width;
       canvas.height = rect.height;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial parameters
    function updateParams() {
       fitnessLevel = document.getElementById('cfg-fitness').value;
       if (fitnessLevel === 'athlete') {
           baseHeartRate = 60;
           peakHeartRate = 110;
       } else if (fitnessLevel === 'average') {
           baseHeartRate = 72;
           peakHeartRate = 130;
       } else {
           baseHeartRate = 82;
           peakHeartRate = 150;
       }
       if (currentState === states.SETUP || currentState === states.WAIT_EXERCISE) {
           currentHeartRate = baseHeartRate;
           targetHeartRate = baseHeartRate;
       }
    }
    document.getElementById('cfg-fitness').addEventListener('change', updateParams);

    // Methods
    window._setMode = (mode) => {
       if (currentState !== states.SETUP && currentState !== states.WAIT_EXERCISE) return; // Prevent change during active measurement
       countingMode = mode;
       document.getElementById('mode-auto').className = mode === 'auto' ? 'sim-btn btn-primary' : 'sim-btn';
       document.getElementById('mode-manual').className = mode === 'manual' ? 'sim-btn btn-primary' : 'sim-btn';
    };

    window._setEx = (ex) => {
       exerciseType = ex;
       document.getElementById('ex-run').className = ex === 'running' ? 'sim-btn btn-primary' : 'sim-btn';
       document.getElementById('ex-jump').className = ex === 'jumping_jacks' ? 'sim-btn btn-primary' : 'sim-btn';
       document.getElementById('ex-skip').className = ex === 'skipping' ? 'sim-btn btn-primary' : 'sim-btn';
    };

    window._doAction = () => {
       if (!fingersPlaced && currentState === states.SETUP) {
          msgEl.style.color = '#ef4444';
          msgEl.textContent = 'Please place your fingers on the wrist or neck hotspot first!';
          setTimeout(() => { msgEl.style.color = 'white'; }, 1000);
          return;
       }

       if (currentState === states.SETUP) {
          // Start resting measurement
          currentState = states.MEASURING_REST;
          timer = 15; // 15 sec measurement
          manualCount = 0;
          autoCount = 0;
          document.getElementById('cfg-fitness').disabled = true;
          
          statusIcon.textContent = '⏱️';
          statusText.textContent = 'Measuring Resting Pulse...';
          msgEl.style.display = 'none';
          actionBtn.disabled = true;
          actionBtn.textContent = 'Measuring...';
          
          if (countingMode === 'manual') manualBtn.style.display = 'block';
       } else if (currentState === states.WAIT_EXERCISE) {
          // Instruct to start exercise
          msgEl.style.display = 'block';
          msgEl.style.color = '#ef4444';
          msgEl.textContent = 'Start the exercise from the panel below!';
          setTimeout(() => { msgEl.style.display = 'none'; msgEl.style.color = 'white'; }, 2000);
       }
    };

    window._startExercise = () => {
       if (currentState !== states.WAIT_EXERCISE) return;
       exerciseDuration = parseInt(document.getElementById('cfg-duration').value);
       
       // Calculate target heart rate
       let multiplier = exerciseType === 'running' ? 1.8 : (exerciseType === 'jumping_jacks' ? 1.6 : 1.7);
       targetHeartRate = Math.min(peakHeartRate, baseHeartRate * multiplier);
       
       currentState = states.EXERCISING;
       timer = exerciseDuration;
       
       document.getElementById('start-ex-btn').disabled = true;
       document.getElementById('start-ex-btn').textContent = 'Exercising...';
       document.getElementById('cfg-duration').disabled = true;
       
       statusIcon.textContent = exerciseType === 'running' ? '🏃' : (exerciseType === 'jumping_jacks' ? '🤸' : '🪢');
       statusText.textContent = 'Exercising...';
       fingersPlaced = false; // Remove fingers during exercise
    };

    window._checkTable = () => {
       if (currentState < states.WAIT_EXERCISE) {
           feedback.style.color = '#ef4444';
           feedback.textContent = 'Measure resting pulse first.';
           return;
       }
       if (currentState === states.WAIT_EXERCISE && obsPost.value === '') {
           feedback.style.color = '#ef4444';
           feedback.textContent = 'Measure post-exercise pulse first.';
           return;
       }
       
       const rest = parseInt(obsRest.value);
       const post = parseInt(obsPost.value);
       const diff = parseInt(obsDiff.value);
       
       if (isNaN(diff)) {
           feedback.style.color = '#ef4444';
           feedback.textContent = 'Enter a value for Difference.';
       } else if (diff === (post - rest)) {
           feedback.style.color = '#22c55e';
           feedback.textContent = 'Correct! Pulse rate increased due to exercise.';
       } else {
           feedback.style.color = '#ef4444';
           feedback.textContent = 'Incorrect difference. Try again.';
       }
    };

    window._resetPulseExp = () => {
       currentState = states.SETUP;
       timer = 0;
       fingersPlaced = false;
       document.getElementById('cfg-fitness').disabled = false;
       document.getElementById('start-ex-btn').disabled = false;
       document.getElementById('start-ex-btn').textContent = 'Start Execise';
       document.getElementById('cfg-duration').disabled = false;
       
       obsRest.value = '';
       obsPost.value = '';
       obsDiff.value = '';
       feedback.textContent = '';
       
       exPanel.style.opacity = '0.5';
       exPanel.style.pointerEvents = 'none';
       
       msgEl.style.display = 'block';
       msgEl.style.color = 'white';
       msgEl.textContent = 'Click on the wrist or neck of the silhouette to place fingers.';
       
       actionBtn.disabled = false;
       actionBtn.textContent = '1. Measure Resting Pulse';
       manualBtn.style.display = 'none';
       
       hrHistory = [];
       simTime = 0;
       updateParams();
       
       statusIcon.textContent = '🚶';
       statusText.textContent = 'Resting - Setup Phase';
       timerDisplay.textContent = '00:00';
    };

    // Manual tap action
    manualBtn.addEventListener('click', () => {
        manualCount++;
        manualBtn.style.transform = 'translate(-50%, 2px)';
        setTimeout(() => { manualBtn.style.transform = 'translateX(-50%)'; }, 100);
    });

    // Canvas click for hotspot
    canvas.addEventListener('click', (e) => {
        if (currentState !== states.SETUP && currentState !== states.RECOVERY) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Define hotspots (approximate based on drawing)
        const w = canvas.width;
        const h = canvas.height;
        
        // Center X is w/2 for body
        const neckX = w/2;
        const neckY = h * 0.6 - 80;
        const wristX = w/2 - 70;
        const wristY = h * 0.6 - 20;
        
        const distNeck = Math.hypot(x - neckX, y - neckY);
        const distWrist = Math.hypot(x - wristX, y - wristY);
        
        if (distNeck < 30 || distWrist < 30) {
            fingersPlaced = true;
            msgEl.textContent = 'Fingers placed correctly! Proceed to measure.';
            msgEl.style.color = '#22c55e';
            
            if (currentState === states.RECOVERY) {
               // measure post exercise
               currentState = states.MEASURING_POST;
               timer = 15;
               manualCount = 0;
               autoCount = 0;
               statusIcon.textContent = '⏱️';
               statusText.textContent = 'Measuring Post-Exercise Pulse...';
               actionBtn.textContent = 'Measuring...';
               if (countingMode === 'manual') manualBtn.style.display = 'block';
            }
        }
    });

    // Animation Loop
    let lastAnimTime = performance.now();
    
    function draw() {
       if (!inSimLoop) return;
       const now = performance.now();
       let dt = (now - lastAnimTime) / 1000;
       if (dt > 0.1) dt = 0.1; // clamp dt to prevent jumps
       lastAnimTime = now;
       
       const w = canvas.width;
       const h = canvas.height;
       
       ctx.clearRect(0, 0, w, h);
       
       // Handle time
       simTime += dt;
       
       // Heart rate logic
       const beatDuration = 60 / currentHeartRate; // seconds per beat
       phase += dt / beatDuration;
       if (phase >= 1) {
           phase -= 1;
           autoCount++; // For auto measurement
       }
       
       // Smoothly move heart rate towards target
       if (currentHeartRate < targetHeartRate) {
           currentHeartRate += dt * 5; // ramp up speed
           if (currentHeartRate > targetHeartRate) currentHeartRate = targetHeartRate;
       } else if (currentHeartRate > targetHeartRate) {
           currentHeartRate -= dt * (fitnessLevel === 'athlete' ? 2 : (fitnessLevel === 'beginner' ? 0.5 : 1)); // recovery speed
           if (currentHeartRate < targetHeartRate) currentHeartRate = targetHeartRate;
       }
       
       // Record history every 0.1 sec
       if (hrHistory.length === 0 || simTime - hrHistory[hrHistory.length-1].time > 0.1) {
           hrHistory.push({time: simTime, hr: currentHeartRate});
           if (hrHistory.length > 300) hrHistory.shift();
       }
       
       // State Management transition checks
       if (currentState === states.MEASURING_REST || currentState === states.MEASURING_POST || currentState === states.EXERCISING) {
           timer -= dt;
           if (timer <= 0) {
              timer = 0;
              // Transition
              if (currentState === states.MEASURING_REST) {
                  const beats = countingMode === 'manual' ? Math.floor(manualCount/4*2) : autoCount; 
                  // just an approximation if manual counting is erratic, but let's trust manual
                  const finalBeats = countingMode === 'manual' ? (manualCount === 0 ? autoCount*4 : manualCount*4) : autoCount*4;
                  restingBPMRecorded = finalBeats;
                  obsRest.value = restingBPMRecorded;
                  
                  currentState = states.WAIT_EXERCISE;
                  actionBtn.disabled = true;
                  actionBtn.textContent = 'Resting Pulse: ' + restingBPMRecorded + ' bpm';
                  exPanel.style.opacity = '1';
                  exPanel.style.pointerEvents = 'auto';
                  manualBtn.style.display = 'none';
                  msgEl.style.display = 'block';
                  msgEl.textContent = 'Good! Now select an exercise and duration.';
                  statusIcon.textContent = '✅';
                  statusText.textContent = 'Rest Measurement Complete';
                  
              } else if (currentState === states.EXERCISING) {
                  currentState = states.RECOVERY;
                  targetHeartRate = baseHeartRate; // start recovery
                  
                  statusIcon.textContent = '😮‍💨';
                  statusText.textContent = 'Recovery - Measure Pulse Now!';
                  document.getElementById('start-ex-btn').textContent = 'Done';
                  msgEl.style.display = 'block';
                  msgEl.style.color = '#ef4444'; // Red and prominent
                  msgEl.textContent = 'Click hotspot to measure pulse IMMEDIATELY!';
                  fingersPlaced = false;
                  
              } else if (currentState === states.MEASURING_POST) {
                  const finalBeats = countingMode === 'manual' ? (manualCount === 0 ? autoCount*4 : manualCount*4) : autoCount*4;
                  postBPMRecorded = finalBeats;
                  obsPost.value = postBPMRecorded;
                  
                  currentState = Math.max(currentState, states.RECOVERY); // Stay in recovery
                  manualBtn.style.display = 'none';
                  msgEl.style.display = 'none';
                  actionBtn.textContent = 'Post-Exercise: ' + postBPMRecorded + ' bpm';
                  statusIcon.textContent = '📉';
                  statusText.textContent = 'Recovering to resting rate...';
                  targetHeartRate = baseHeartRate;
              }
           }
           
           // Format timer display
           const tSec = Math.ceil(timer);
           const m = Math.floor(tSec / 60).toString().padStart(2, '0');
           const s = (tSec % 60).toString().padStart(2, '0');
           timerDisplay.textContent = `${m}:${s}`;
       }
       
       // Draw EKG graph at top
       const ekgH = 100;
       ctx.fillStyle = 'rgba(0,0,0,0.3)';
       ctx.fillRect(10, 10, w - 20, ekgH);
       ctx.strokeStyle = 'rgba(255,255,255,0.1)';
       ctx.lineWidth = 1;
       // Grid
       for (let i=0; i<w-20; i+=20) { ctx.beginPath(); ctx.moveTo(10+i, 10); ctx.lineTo(10+i, 10+ekgH); ctx.stroke(); }
       for (let i=0; i<ekgH; i+=20) { ctx.beginPath(); ctx.moveTo(10, 10+i); ctx.lineTo(w-10, 10+i); ctx.stroke(); }
       
       // Generate pulse points based on current heart rate
       const speedScale = (currentHeartRate / 60); 
       const numPoints = w - 20;
       
       ctx.beginPath();
       let colorIndicator = '#22c55e'; // green
       if (currentHeartRate > baseHeartRate * 1.3) colorIndicator = '#eab308'; // yellow
       if (currentHeartRate > baseHeartRate * 1.6) colorIndicator = '#ef4444'; // red
       
       ctx.strokeStyle = colorIndicator;
       ctx.lineWidth = 2;
       ctx.lineJoin = 'round';
       
       for (let i=0; i<numPoints; i++) {
           const x = 10 + i;
           // We map the points horizontally so it looks like a scrolling wave
           // simTime defines the scrolling offset
           const t = ((simTime * speedScale * 2) + (x * 0.005)) * Math.PI; 
           let yVal = 0;
           const cyclePhase = (t % (2*Math.PI)) / (2*Math.PI); // 0 to 1
           
           if (cyclePhase > 0.1 && cyclePhase < 0.2) yVal = -0.1; // P wave
           else if (cyclePhase > 0.3 && cyclePhase < 0.35) yVal = 0.2; // Q
           else if (cyclePhase >= 0.35 && cyclePhase < 0.4) yVal = -0.8; // R
           else if (cyclePhase >= 0.4 && cyclePhase < 0.45) yVal = 0.4; // S
           else if (cyclePhase > 0.6 && cyclePhase < 0.8) yVal = -0.2; // T wave
           
           const y = 10 + ekgH/2 + (yVal * (ekgH/2 * 0.8));
           if (i === 0) ctx.moveTo(x, y);
           else ctx.lineTo(x, y);
       }
       ctx.stroke();
       
       // Draw current BPM text
       ctx.fillStyle = colorIndicator;
       ctx.font = '24px JetBrains Mono';
       ctx.textAlign = 'right';
       ctx.fillText(Math.round(currentHeartRate) + ' BPM', w - 20, 10 + ekgH - 10);
       ctx.textAlign = 'left';
       
       // Draw Human Figure
       const centerX = w / 2;
       const centerY = h * 0.55;
       
       // Simple body 
       ctx.save();
       ctx.strokeStyle = 'rgba(255,255,255,0.7)';
       ctx.lineWidth = 4;
       ctx.lineCap = 'round';
       ctx.lineJoin = 'round';
       
       // Oscillation for exercise
       let exY = 0;
       let armRot = 0;
       let legRot = 0;
       
       if (currentState === states.EXERCISING) {
           const exSpeed = currentHeartRate / 60 * 2 * Math.PI;
           const movePhase = simTime * exSpeed;
           const moveCycle = Math.sin(movePhase);
           
           if (exerciseType === 'running') {
               exY = Math.abs(Math.sin(movePhase*2)) * -10; // bounce
               armRot = moveCycle * 0.8; // arm swing
               legRot = moveCycle * 0.8; // leg swing
           } else if (exerciseType === 'jumping_jacks') {
               exY = (Math.cos(movePhase) > 0 ? -15 : 0);
               armRot = Math.cos(movePhase) > 0 ? -Math.PI*0.8 : 0;
               legRot = Math.cos(movePhase) > 0 ? 0.5 : 0.1;
           } else if (exerciseType === 'skipping') {
               exY = Math.abs(Math.sin(movePhase*2)) * -20;
               armRot = 0.2 + moveCycle * 0.1;
               legRot = 0.1;
           }
       }
       
       ctx.translate(centerX, centerY + exY);
       
       // Head
       ctx.beginPath(); ctx.arc(0, -90, 18, 0, Math.PI*2); ctx.stroke();
       // Torso
       ctx.beginPath(); ctx.moveTo(0, -72); ctx.lineTo(0, 20); ctx.stroke();
       
       // Legs
       if (exerciseType === 'running' && currentState === states.EXERCISING) {
           // running legs (side view approximate)
           ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(-20 * Math.sin(legRot), 60 + 20 * Math.cos(legRot)); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(20 * Math.sin(legRot), 60 - 20 * Math.cos(legRot)); ctx.stroke();
       } else if (exerciseType === 'jumping_jacks' || exerciseType === 'skipping' || currentState !== states.EXERCISING) {
           // jumping jacks legs or standing
           const legS = currentState === states.EXERCISING && exerciseType === 'jumping_jacks' ? legRot : 0.2;
           ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(-60 * Math.sin(legS), 20 + 60 * Math.cos(legS)); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(60 * Math.sin(legS), 20 + 60 * Math.cos(legS)); ctx.stroke();
       }
       
       // Arms
       // Left arm
       ctx.beginPath();
       ctx.moveTo(0, -60);
       if (exerciseType === 'running' && currentState === states.EXERCISING) {
           ctx.lineTo(30 * Math.sin(-armRot), -30);
           ctx.lineTo(40 * Math.sin(-armRot) + 10, -10);
       } else if (exerciseType === 'jumping_jacks' && currentState === states.EXERCISING) {
           ctx.lineTo(-40 * Math.cos(armRot), -60 + 40 * Math.sin(armRot)); 
       } else {
           ctx.lineTo(-20, -20);
       }
       ctx.stroke();
       
       // Right arm
       ctx.beginPath();
       ctx.moveTo(0, -60);
       if (fingersPlaced) {
           // Right arm bent to neck or wrist
           ctx.lineTo(20, -50);
           ctx.lineTo(5, -80); // touching neck roughly
       } else {
           if (exerciseType === 'running' && currentState === states.EXERCISING) {
               ctx.lineTo(30 * Math.sin(armRot), -30);
               ctx.lineTo(40 * Math.sin(armRot) - 10, -10);
           } else if (exerciseType === 'jumping_jacks' && currentState === states.EXERCISING) {
               ctx.lineTo(40 * Math.cos(armRot), -60 + 40 * Math.sin(armRot));
           } else {
               ctx.lineTo(25, -20);
               ctx.lineTo(5, 5); // resting
           }
       }
       ctx.stroke();
       
       // Heart icon in chest
       const pulseScale = 1 + (phase < 0.2 ? 0.3 : 0); // Heart beat pump
       ctx.fillStyle = colorIndicator;
       ctx.shadowBlur = 10;
       ctx.shadowColor = colorIndicator;
       ctx.beginPath();
       ctx.arc(-5, -45, 5 * pulseScale, 0, Math.PI*2);
       ctx.fill();
       ctx.shadowBlur = 0;
       
       ctx.restore();
       
       // Draw Hotspots
       if ((currentState === states.SETUP || currentState === states.RECOVERY) && !fingersPlaced) {
           ctx.fillStyle = 'rgba(56, 189, 248, 0.5)'; // blue glow
           ctx.strokeStyle = '#38bdf8';
           ctx.lineWidth = 2;
           const pulseHotspot = 1 + 0.2 * Math.sin(simTime * 5);
           
           // Neck
           ctx.beginPath(); ctx.arc(w/2, h*0.55 - 80, 15 * pulseHotspot, 0, Math.PI*2); ctx.fill(); ctx.stroke();
           // Wrist (left hand approximate standing)
           ctx.beginPath(); ctx.arc(w/2 - 20, h*0.55 - 20, 15 * pulseHotspot, 0, Math.PI*2); ctx.fill(); ctx.stroke();
       }
       
       // Draw HR History Graph (Bottom)
       const histH = 80;
       const histY = h - histH - 10;
       ctx.fillStyle = 'rgba(0,0,0,0.3)';
       ctx.fillRect(10, histY, w - 20, histH);
       ctx.strokeStyle = 'rgba(255,255,255,0.05)';
       ctx.lineWidth = 1;
       
       // Grid
       ctx.beginPath(); ctx.moveTo(10, histY + histH/2); ctx.lineTo(w-10, histY + histH/2); ctx.stroke();
       
       // Labels
       ctx.fillStyle = 'rgba(255,255,255,0.5)';
       ctx.font = '10px Inter';
       ctx.fillText('160', 12, histY + 12);
       ctx.fillText('40', 12, histY + histH - 4);
       
       if (hrHistory.length > 1) {
           ctx.beginPath();
           ctx.strokeStyle = '#38bdf8';
           ctx.lineWidth = 2;
           ctx.lineJoin = 'round';
           
           // Time window is roughly 30 seconds
           const timeWindow = 30;
           const graphW = w - 20;
           
           for (let i=0; i<hrHistory.length; i++) {
               const pt = hrHistory[i];
               const x = 10 + graphW - ((simTime - pt.time) / timeWindow * graphW);
               if (x < 10) continue; // outside graph
               
               // Map HR 40-160 to height
               // clamping values
               let hrClamped = pt.hr;
               if (hrClamped < 40) hrClamped = 40;
               if (hrClamped > 160) hrClamped = 160;
               
               const mappedY = histY + histH - ((hrClamped - 40) / 120 * histH);
               if (i === 0) ctx.moveTo(x, mappedY);
               else ctx.lineTo(x, mappedY);
           }
           ctx.stroke();
       }

       if (inSimLoop) {
           requestAnimationFrame(draw);
       }
    }
    
    // Start Simulation
    setTimeout(() => {
        updateParams();
        requestAnimationFrame(draw);
    }, 100);

    return function cleanup() {
       inSimLoop = false;
       delete window._doAction;
       delete window._startExercise;
       delete window._setMode;
       delete window._setEx;
       delete window._resetPulseExp;
       delete window._checkTable;
       window.removeEventListener('resize', resizeCanvas);
    };
  };
})();
