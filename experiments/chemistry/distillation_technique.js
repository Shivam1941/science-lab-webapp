window.experimentRenderers = window.experimentRenderers || {};

window.experimentRenderers['distillation_technique'] = function(container, exp) {
  const VIVA_QUESTIONS = [
    { q: "Distillation is a combination of which two processes?", o: ["Evaporation and Condensation", "Melting and Boiling", "Sublimation and Deposition", "Filtration and Evaporation"], a: 0 },
    { q: "What is the function of the Liebig condenser?", o: ["To boil the liquid", "To condense the vapor back into liquid", "To filter out impurities", "To measure the temperature"], a: 1 },
    { q: "The liquid that is collected after passing through the condenser is called:", o: ["Residue", "Solvent", "Distillate", "Vapor"], a: 2 },
    { q: "Why are boiling chips added to the distillation flask?", o: ["To increase boiling point", "To provide a smooth boiling action", "To decrease the boiling point", "To filter the liquid"], a: 1 },
    { q: "Distillation is most effective when the boiling points of two liquids differ by:", o: ["Less than 5°C", "Between 5°C and 10°C", "More than 25°C", "They must have the same boiling point"], a: 2 }
  ];

  const style = document.createElement('style');
  style.innerHTML = `
    .dist-container {
      position: relative;
      width: 100%;
      height: 350px;
      margin-top: 20px;
    }
    .flask-round {
      width: 80px;
      height: 80px;
      border: 3px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      position: absolute;
      left: 60px;
      bottom: 60px;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
    }
    .flask-liquid {
      width: 100%;
      height: 60%;
      background: rgba(100, 200, 255, 0.4);
      transition: height 8s linear;
    }
    .flask-neck {
      width: 24px;
      height: 60px;
      border-left: 3px solid rgba(255, 255, 255, 0.4);
      border-right: 3px solid rgba(255, 255, 255, 0.4);
      position: absolute;
      left: 88px;
      bottom: 137px;
    }
    .side-arm {
      width: 40px;
      height: 10px;
      border-top: 3px solid rgba(255, 255, 255, 0.4);
      border-bottom: 3px solid rgba(255, 255, 255, 0.4);
      position: absolute;
      left: 112px;
      bottom: 160px;
      transform: rotate(15deg);
      transform-origin: left center;
    }
    .condenser {
      width: 120px;
      height: 30px;
      border: 3px solid rgba(100, 200, 255, 0.3);
      border-radius: 10px;
      position: absolute;
      left: 147px;
      bottom: 140px;
      transform: rotate(15deg);
      background: rgba(100, 200, 255, 0.1);
    }
    .condenser-inner {
      width: 130px;
      height: 8px;
      border-top: 2px dashed rgba(255, 255, 255, 0.5);
      border-bottom: 2px dashed rgba(255, 255, 255, 0.5);
      position: absolute;
      top: 8px;
      left: -5px;
    }
    .recv-flask {
      width: 60px;
      height: 80px;
      border: 3px solid rgba(255, 255, 255, 0.4);
      border-radius: 30px 30px 10px 10px;
      position: absolute;
      left: 270px;
      bottom: 30px;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
    }
    .distillate {
      width: 100%;
      height: 0%;
      background: rgba(100, 200, 255, 0.6);
      transition: height 7s linear 1s;
    }
    .burner {
      width: 30px;
      height: 50px;
      background: #444;
      position: absolute;
      left: 85px;
      bottom: 10px;
    }
    .flame {
      width: 20px;
      height: 30px;
      background: radial-gradient(ellipse at bottom, rgba(255,200,0,1) 0%, rgba(255,0,0,0.8) 50%, rgba(255,0,0,0) 100%);
      position: absolute;
      bottom: 50px;
      left: 5px;
      border-radius: 50% 50% 20% 20%;
      opacity: 0;
    }
    .flame.active {
      opacity: 1;
      animation: flicker 0.1s infinite alternate;
    }
    .vapor {
      position: absolute;
      width: 15px;
      height: 15px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      left: 92px;
      bottom: 120px;
      filter: blur(2px);
      opacity: 0;
    }
    .vapor.active {
      animation: vapor-move 2s infinite linear;
    }
    @keyframes vapor-move {
      0% { transform: translateY(0); opacity: 0.8; }
      40% { transform: translateY(-40px); opacity: 0.8; left: 92px;}
      100% { transform: translate(140px, -5px); opacity: 0; left: 92px; }
    }
    .drop {
      position: absolute;
      width: 6px;
      height: 6px;
      background: rgba(100, 200, 255, 0.8);
      border-radius: 50%;
      left: 297px;
      bottom: 110px;
      opacity: 0;
    }
    .drop.active {
      animation: drop-fall-dist 0.5s infinite linear 1s;
    }
    @keyframes drop-fall-dist {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(60px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  container.innerHTML = `
    <div class="sim-wrapper glass-card" style="padding:20px; text-align:center;">
      <h3 style="color:var(--text-primary); margin-bottom: 20px;">Distillation Simulator</h3>
      
      <div class="dist-container">
        <!-- Heating apparatus -->
        <div class="burner"><div class="flame" id="b-flame"></div></div>
        
        <!-- Flask -->
        <div class="flask-round">
          <div class="flask-liquid" id="flask-liq"></div>
        </div>
        <div class="flask-neck"></div>
        <div class="side-arm"></div>
        <div class="vapor" id="vapor-anim"></div>
        
        <!-- Condenser -->
        <div class="condenser">
          <div class="condenser-inner"></div>
        </div>
        
        <!-- Receiving flask -->
        <div class="drop" id="dist-drop"></div>
        <div class="recv-flask">
          <div class="distillate" id="distillate"></div>
        </div>
      </div>

      <div style="margin-top:20px; display:flex; gap:10px; justify-content:center;">
        <button class="sim-btn sim-btn-primary" id="btn-heat">Toggle Heat</button>
        <button class="sim-btn" id="btn-reset">Reset</button>
      </div>

      <button class="sim-btn sim-btn-primary" style="margin-top:20px; width:100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/"/g, '&quot;')})">🎓 Start Viva</button>
    </div>
  `;

  const btnHeat = container.querySelector('#btn-heat');
  const btnReset = container.querySelector('#btn-reset');
  const flame = container.querySelector('#b-flame');
  const flaskLiq = container.querySelector('#flask-liq');
  const distillate = container.querySelector('#distillate');
  const vapor = container.querySelector('#vapor-anim');
  const drop = container.querySelector('#dist-drop');

  let isHeating = false;
  let t1, t2;

  btnHeat.addEventListener('click', () => {
    isHeating = !isHeating;
    if (isHeating) {
      flame.classList.add('active');
      vapor.classList.add('active');
      drop.classList.add('active');
      
      flaskLiq.style.height = '10%';
      distillate.style.height = '60%';
      
      t1 = setTimeout(() => {
        vapor.classList.remove('active');
        drop.classList.remove('active');
      }, 7000); // stops bubbling after finish
      
    } else {
      flame.classList.remove('active');
      vapor.classList.remove('active');
      drop.classList.remove('active');
      clearTimeout(t1);
    }
  });

  btnReset.addEventListener('click', () => {
    isHeating = false;
    flame.classList.remove('active');
    vapor.classList.remove('active');
    drop.classList.remove('active');
    
    // reset transitions instantly
    flaskLiq.style.transitionDuration = '0s';
    distillate.style.transitionDuration = '0s';
    flaskLiq.style.height = '60%';
    distillate.style.height = '0%';
    
    // restore transition length for next play
    setTimeout(() => {
      flaskLiq.style.transitionDuration = '8s';
      distillate.style.transitionDuration = '7s';
    }, 50);
  });

  return function cleanup() {
    if (document.head.contains(style)) document.head.removeChild(style);
  };
};
