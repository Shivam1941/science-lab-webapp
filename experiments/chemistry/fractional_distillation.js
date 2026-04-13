window.experimentRenderers = window.experimentRenderers || {};

window.experimentRenderers['fractional_distillation'] = function(container, exp) {
  const VIVA_QUESTIONS = [
    { q: "Fractional distillation is used when the difference in boiling points of two liquids is:", o: ["Less than 25 K", "Between 25 K and 50 K", "More than 50 K", "Exactly the same"], a: 0 },
    { q: "What provides a larger surface area for cooling vapors in the fractionating column?", o: ["Glass beads", "Water", "Cotton", "Sand"], a: 0 },
    { q: "During fractional distillation, which liquid distills first?", o: ["The one with the higher boiling point", "The one with the lower boiling point", "Both distill simultaneously", "The heavier liquid"], a: 1 },
    { q: "What is an industrial application of fractional distillation?", o: ["Separation of salt from water", "Separating components of crude oil", "Filtering muddy water", "Extracting essential oils"], a: 1 }
  ];

  const style = document.createElement('style');
  style.innerHTML = `
    .f-dist-container {
      position: relative;
      width: 100%;
      height: 400px;
      margin-top: 20px;
    }
    .f-flask {
      width: 80px;
      height: 80px;
      border: 3px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      position: absolute;
      left: 60px;
      bottom: 60px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    .f-liq-top {
      width: 100%;
      height: 30%;
      background: rgba(100, 255, 100, 0.5); /* Liquid A */
      transition: height 6s linear;
    }
    .f-liq-bot {
      width: 100%;
      height: 30%;
      background: rgba(100, 100, 255, 0.5); /* Liquid B */
      transition: height 6s linear;
    }
    .f-column {
      width: 24px;
      height: 120px;
      border-left: 3px solid rgba(255, 255, 255, 0.4);
      border-right: 3px solid rgba(255, 255, 255, 0.4);
      position: absolute;
      left: 88px;
      bottom: 137px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-content: flex-start;
      padding-top: 5px;
      gap: 2px;
      background: rgba(255, 255, 255, 0.05);
    }
    .bead {
      width: 8px;
      height: 8px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 50%;
    }
    .f-arm {
      width: 40px;
      height: 10px;
      border-top: 3px solid rgba(255, 255, 255, 0.4);
      border-bottom: 3px solid rgba(255, 255, 255, 0.4);
      position: absolute;
      left: 112px;
      bottom: 220px;
      transform: rotate(15deg);
      transform-origin: left center;
    }
    .f-condenser {
      width: 120px;
      height: 30px;
      border: 3px solid rgba(100, 200, 255, 0.3);
      border-radius: 10px;
      position: absolute;
      left: 147px;
      bottom: 200px;
      transform: rotate(15deg);
      background: rgba(100, 200, 255, 0.1);
    }
    .f-condenser-inner {
      width: 130px;
      height: 8px;
      border-top: 2px dashed rgba(255, 255, 255, 0.5);
      border-bottom: 2px dashed rgba(255, 255, 255, 0.5);
      position: absolute;
      top: 8px;
      left: -5px;
    }
    .f-recv-flask {
      width: 60px;
      height: 80px;
      border: 3px solid rgba(255, 255, 255, 0.4);
      border-radius: 30px 30px 10px 10px;
      position: absolute;
      left: 270px;
      bottom: 90px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    .f-distillate {
      width: 100%;
      height: 0%;
      background: rgba(100, 255, 100, 0.6); /* First matches Liquid A */
      transition: height 6s linear;
    }
    .f-burner {
      width: 30px;
      height: 50px;
      background: #444;
      position: absolute;
      left: 85px;
      bottom: 10px;
    }
    .f-flame {
      width: 20px;
      height: 30px;
      background: radial-gradient(ellipse at bottom, rgba(255,200,0,1) 0%, rgba(255,0,0,0.8) 50%, rgba(255,0,0,0) 100%);
      position: absolute;
      bottom: 50px;
      left: 5px;
      border-radius: 50% 50% 20% 20%;
      opacity: 0;
    }
    .f-flame.active {
      opacity: 1;
      animation: flicker 0.1s infinite alternate;
    }
    .f-vapor {
      position: absolute;
      width: 20px;
      height: 40px;
      background: rgba(100, 255, 100, 0.3); /* Vapor A */
      border-radius: 5px;
      left: 90px;
      bottom: 140px;
      filter: blur(3px);
      opacity: 0;
    }
    .f-vapor.active {
      animation: f-vapor-move 2.5s infinite linear;
    }
    @keyframes f-vapor-move {
      0% { transform: translateY(0); opacity: 0.8; height: 10px;}
      40% { transform: translateY(-70px); opacity: 0.8; height: 40px;}
      100% { transform: translate(140px, -30px); opacity: 0; height: 10px;}
    }
    .f-drop {
      position: absolute;
      width: 6px;
      height: 6px;
      background: rgba(100, 255, 100, 0.8);
      border-radius: 50%;
      left: 297px;
      bottom: 170px;
      opacity: 0;
    }
    .f-drop.active {
      animation: f-drop-fall 0.6s infinite linear 1.2s;
    }
    @keyframes f-drop-fall {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(60px); opacity: 0; }
    }
    .temp-display {
      position: absolute;
      left: 20px;
      top: 50px;
      background: rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.2);
      padding: 10px;
      border-radius: 8px;
      color: white;
      font-family: monospace;
      font-size: 16px;
    }
  `;
  document.head.appendChild(style);

  // Generate beads
  let beadsHtml = '';
  for(let i=0; i<20; i++) {
    beadsHtml += '<div class="bead"></div>';
  }

  container.innerHTML = `
    <div class="sim-wrapper glass-card" style="padding:20px; text-align:center;">
      <h3 style="color:var(--text-primary); margin-bottom: 20px;">Fractional Distillation</h3>
      
      <div class="f-dist-container">
        
        <div class="temp-display">Temp: <span id="thermometer">25.0</span> °C</div>

        <div class="f-burner"><div class="f-flame" id="f-flame"></div></div>
        
        <div class="f-flask">
          <div class="f-liq-top" id="liq-a"></div>
          <div class="f-liq-bot" id="liq-b"></div>
        </div>
        <div class="f-column">
          ${beadsHtml}
        </div>
        <div class="f-arm"></div>
        <div class="f-vapor" id="f-vapor"></div>
        
        <div class="f-condenser">
          <div class="f-condenser-inner"></div>
        </div>
        
        <div class="f-drop" id="f-drop"></div>
        <div class="f-recv-flask">
          <div class="f-distillate" id="f-distillate"></div>
        </div>
      </div>

      <div style="margin-top:20px; display:flex; gap:10px; justify-content:center;">
        <button class="sim-btn sim-btn-primary" id="btn-start">Start Process</button>
        <button class="sim-btn" id="btn-reset">Reset</button>
      </div>

      <button class="sim-btn sim-btn-primary" style="margin-top:20px; width:100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/"/g, '&quot;')})">🎓 Start Viva</button>
    </div>
  `;

  const btnStart = container.querySelector('#btn-start');
  const btnReset = container.querySelector('#btn-reset');
  const flame = container.querySelector('#f-flame');
  const liqA = container.querySelector('#liq-a');
  const liqB = container.querySelector('#liq-b');
  const fVapor = container.querySelector('#f-vapor');
  const fDrop = container.querySelector('#f-drop');
  const fDistillate = container.querySelector('#f-distillate');
  const therm = container.querySelector('#thermometer');

  let isRunning = false;
  let tempInterval;
  let temp = 25.0;

  btnStart.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    flame.classList.add('active');
    
    // Simulate heating up to 78°C (Boiling point A)
    tempInterval = setInterval(() => {
      if (temp < 78) {
        temp += 1.5;
        therm.textContent = temp.toFixed(1);
      } else if (temp >= 78 && temp < 79) {
        // Distilling A
        fVapor.classList.add('active');
        fDrop.classList.add('active');
        liqA.style.height = '0%';
        fDistillate.style.height = '40%';
        temp += 0.05;
        therm.textContent = temp.toFixed(1);
      } else if (temp >= 79 && temp < 100) {
        // A finished, heating to 100
        fVapor.classList.remove('active');
        fDrop.classList.remove('active');
        // change colors for B
        fVapor.style.background = 'rgba(100, 100, 255, 0.3)';
        fDrop.style.background = 'rgba(100, 100, 255, 0.8)';
        // Swap flask visual
        fDistillate.style.background = 'rgba(100, 100, 255, 0.6)';
        fDistillate.style.transitionDuration = '0s';
        fDistillate.style.height = '0%';
        setTimeout(()=> fDistillate.style.transitionDuration = '6s', 50);

        temp += 1.5;
        therm.textContent = temp.toFixed(1);
      } else if (temp >= 100 && temp < 101) {
        // Distilling B
        fVapor.classList.add('active');
        fDrop.classList.add('active');
        liqB.style.height = '0%';
        fDistillate.style.height = '40%';
        temp += 0.05;
        therm.textContent = temp.toFixed(1);
      } else {
        // Finish
        fVapor.classList.remove('active');
        fDrop.classList.remove('active');
        flame.classList.remove('active');
        clearInterval(tempInterval);
      }
    }, 200);
  });

  btnReset.addEventListener('click', () => {
    isRunning = false;
    clearInterval(tempInterval);
    temp = 25.0;
    therm.textContent = temp.toFixed(1);
    
    flame.classList.remove('active');
    fVapor.classList.remove('active');
    fDrop.classList.remove('active');
    
    // reset transitions
    liqA.style.transitionDuration = '0s';
    liqB.style.transitionDuration = '0s';
    fDistillate.style.transitionDuration = '0s';
    
    liqA.style.height = '30%';
    liqB.style.height = '30%';
    fDistillate.style.height = '0%';
    
    // restore original colors
    fVapor.style.background = 'rgba(100, 255, 100, 0.3)';
    fDrop.style.background = 'rgba(100, 255, 100, 0.8)';
    fDistillate.style.background = 'rgba(100, 255, 100, 0.6)';

    setTimeout(() => {
      liqA.style.transitionDuration = '6s';
      liqB.style.transitionDuration = '6s';
      fDistillate.style.transitionDuration = '6s';
    }, 50);
  });

  return function cleanup() {
    if (document.head.contains(style)) document.head.removeChild(style);
    clearInterval(tempInterval);
  };
};
