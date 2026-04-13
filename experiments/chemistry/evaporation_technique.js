window.experimentRenderers = window.experimentRenderers || {};

window.experimentRenderers['evaporation_technique'] = function(container, exp) {
  const VIVA_QUESTIONS = [
    { q: "Evaporation is used to separate:", o: ["Two miscible liquids", "A soluble solid from a liquid", "An insoluble solid from a liquid", "Two gases"], a: 1 },
    { q: "During evaporation of salt water, what is left behind?", o: ["Water", "Salt", "Both salt and water", "Nothing"], a: 1 },
    { q: "Evaporation involves the conversion of a liquid into a:", o: ["Solid", "Gas", "Plasma", "Another liquid"], a: 1 },
    { q: "Which tool is generally used to hold the solution during evaporation?", o: ["China dish", "Test tube", "Thermometer", "Funnel"], a: 0 },
    { q: "Heating the solution speeds up evaporation because:", o: ["It increases the kinetic energy of molecules", "It breaks the chemical bonds of salt", "It makes the liquid heavier", "It decreases the surface area"], a: 0 }
  ];

  const style = document.createElement('style');
  style.innerHTML = `
    .evap-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      height: 350px;
      margin-top: 30px;
    }
    .china-dish {
      width: 120px;
      height: 40px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 0 0 60px 60px;
      position: relative;
      z-index: 3;
      overflow: hidden;
      border: 3px solid rgba(200, 200, 200, 0.8);
      border-top: none;
    }
    .salt-water {
      width: 100%;
      height: 100%;
      background: rgba(100, 200, 255, 0.3);
      position: absolute;
      bottom: 0;
      transition: height 5s linear;
    }
    .salt-crystals {
      width: 80%;
      height: 60%;
      background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="2" height="2" fill="white"/></svg>');
      position: absolute;
      bottom: 0;
      left: 10%;
      opacity: 0;
      transition: opacity 5s ease;
    }
    .tripod {
      width: 100px;
      height: 100px;
      border-left: 4px solid #666;
      border-right: 4px solid #666;
      position: relative;
      top: -10px;
      z-index: 1;
    }
    .burner {
      width: 30px;
      height: 60px;
      background: #444;
      position: absolute;
      bottom: 10px;
      left: 35px;
      z-index: 2;
    }
    .flame {
      width: 20px;
      height: 30px;
      background: radial-gradient(ellipse at bottom, rgba(255,200,0,1) 0%, rgba(255,0,0,0.8) 50%, rgba(255,0,0,0) 100%);
      position: absolute;
      bottom: 60px;
      left: 5px;
      border-radius: 50% 50% 20% 20%;
      opacity: 0;
      transition: opacity 0.5s;
    }
    .flame.active {
      opacity: 1;
      animation: flicker 0.1s infinite alternate;
    }
    @keyframes flicker {
      0% { transform: scale(1); }
      100% { transform: scale(1.1) translateY(-2px); }
    }
    .steam {
      position: absolute;
      width: 20px;
      height: 20px;
      background: rgba(255, 255, 255, 0);
      border-radius: 50%;
      bottom: 200px;
      left: 50px;
      z-index: 4;
      filter: blur(4px);
    }
    .steam.active {
      animation: rise 2s infinite ease-out;
    }
    @keyframes rise {
      0% { transform: translateY(0) scale(1); background: rgba(255, 255, 255, 0.4); }
      100% { transform: translateY(-80px) scale(3); background: rgba(255, 255, 255, 0); }
    }
  `;
  document.head.appendChild(style);

  container.innerHTML = `
    <div class="sim-wrapper glass-card" style="padding:20px; text-align:center;">
      <h3 style="color:var(--text-primary); margin-bottom: 20px;">Evaporation Simulator</h3>
      
      <div class="evap-container">
        
        <div class="steam" id="steam-anim"></div>
        <div class="steam" id="steam-anim-2" style="left:30px; animation-delay:1s;"></div>
        
        <div class="china-dish">
          <div class="salt-water" id="sol-liquid"></div>
          <div class="salt-crystals" id="crystals"></div>
        </div>
        
        <div class="tripod">
          <div class="burner">
            <div class="flame" id="b-flame"></div>
          </div>
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
  const solLiquid = container.querySelector('#sol-liquid');
  const crystals = container.querySelector('#crystals');
  const steam1 = container.querySelector('#steam-anim');
  const steam2 = container.querySelector('#steam-anim-2');

  let isHeating = false;
  let timer;

  btnHeat.addEventListener('click', () => {
    isHeating = !isHeating;
    if (isHeating) {
      flame.classList.add('active');
      Object.assign(solLiquid.style, { height: '0', transitionDuration: '5s' });
      Object.assign(crystals.style, { opacity: '1', transitionDuration: '5s' });
      
      timer = setTimeout(() => {
        steam1.classList.add('active');
        steam2.classList.add('active');
      }, 500);

      // Stop steam when dry
      setTimeout(() => {
        steam1.classList.remove('active');
        steam2.classList.remove('active');
      }, 5000);
      
    } else {
      flame.classList.remove('active');
      steam1.classList.remove('active');
      steam2.classList.remove('active');
      // freeze current state
      clearTimeout(timer);
    }
  });

  btnReset.addEventListener('click', () => {
    isHeating = false;
    flame.classList.remove('active');
    steam1.classList.remove('active');
    steam2.classList.remove('active');
    Object.assign(solLiquid.style, { height: '100%', transitionDuration: '0s' });
    Object.assign(crystals.style, { opacity: '0', transitionDuration: '0s' });
  });

  return function cleanup() {
    if (document.head.contains(style)) document.head.removeChild(style);
  };
};
