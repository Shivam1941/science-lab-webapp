window.experimentRenderers = window.experimentRenderers || {};

window.experimentRenderers['filtration_technique'] = function(container, exp) {
  // Extract Viva questions from existing system or define locally for this script
  const VIVA_QUESTIONS = [
    { q: "What is the purpose of the filter paper?", o: ["To evaporate the liquid", "To trap insoluble solid particles", "To dissolve the solute", "To heat the mixture"], a: 1 },
    { q: "The clear liquid collected after filtration is called:", o: ["Residue", "Distillate", "Filtrate", "Solvent"], a: 2 },
    { q: "Filtration is best used for separating:", o: ["Two miscible liquids", "A soluble solid from a liquid", "An insoluble solid from a liquid", "Two gases"], a: 2 },
    { q: "Which of the following cannot be separated by filtration?", o: ["Sand and water", "Chalk powder and water", "Salt and water", "Mud and water"], a: 2 },
    { q: "The solid trapped on the filter paper is known as:", o: ["Filtrate", "Residue", "Distillate", "Precipitate"], a: 1 }
  ];

  // Inline CSS for animation and layout
  const style = document.createElement('style');
  style.innerHTML = `
    .filtration-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      height: 400px;
      margin-top: 30px;
    }
    .funnel {
      width: 0;
      height: 0;
      border-left: 60px solid transparent;
      border-right: 60px solid transparent;
      border-top: 100px solid rgba(255, 255, 255, 0.2);
      position: relative;
      margin-bottom: 50px;
      z-index: 2;
    }
    .funnel-tube {
      width: 16px;
      height: 60px;
      background: rgba(255, 255, 255, 0.2);
      position: absolute;
      top: -1px;
      left: -8px;
    }
    .filter-paper {
      width: 0;
      height: 0;
      border-left: 55px solid transparent;
      border-right: 55px solid transparent;
      border-top: 90px solid rgba(240, 240, 240, 0.9);
      position: absolute;
      top: -95px;
      left: -55px;
      z-index: 3;
      transition: border-top-color 3s ease;
    }
    .beaker-top {
      width: 80px;
      height: 100px;
      border: 3px solid rgba(255, 255, 255, 0.4);
      border-top: none;
      border-radius: 0 0 10px 10px;
      position: absolute;
      top: -120px;
      left: 100px;
      transform: rotate(-30deg);
      transition: transform 1s ease;
      z-index: 4;
      overflow: hidden;
    }
    .beaker-top.pouring {
      transform: rotate(-70deg) translate(-20px, 40px);
    }
    .mixture-liquid {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 80%;
      background: #8b5a2b; /* muddy water */
      transition: height 4s ease;
    }
    .pour-stream {
      position: absolute;
      width: 6px;
      height: 0;
      background: #8b5a2b;
      top: -30px;
      left: -5px;
      z-index: 5;
      transition: height 0.5s ease;
    }
    .receiving-flask {
      width: 100px;
      height: 120px;
      border: 3px solid rgba(255, 255, 255, 0.4);
      border-top: none;
      border-radius: 40px 40px 10px 10px;
      position: absolute;
      bottom: 20px;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
    }
    .filtrate-liquid {
      width: 100%;
      height: 0;
      background: rgba(100, 200, 255, 0.5); /* clear water */
      transition: height 4s ease;
    }
    .drops {
      position: absolute;
      width: 6px;
      height: 6px;
      background: rgba(100, 200, 255, 0.8);
      border-radius: 50%;
      bottom: 140px;
      opacity: 0;
    }
    @keyframes drop-fall {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(80px); opacity: 0; }
    }
    .drop-anim {
      animation: drop-fall 0.4s linear infinite;
    }
  `;
  document.head.appendChild(style);

  container.innerHTML = `
    <div class="sim-wrapper glass-card" style="padding:20px; text-align:center;">
      <h3 style="color:var(--text-primary); margin-bottom: 20px;">Filtration Simulator</h3>
      
      <div class="filtration-container">
        <!-- Beaker pouring from top right -->
        <div class="beaker-top" id="top-beaker">
          <div class="mixture-liquid" id="mix-liq"></div>
        </div>
        <div class="pour-stream" id="pour-stream"></div>
        
        <!-- Funnel and filter paper -->
        <div class="funnel">
          <div class="filter-paper" id="filter-paper"></div>
          <div class="funnel-tube"></div>
        </div>
        
        <div class="drops" id="filtrate-drops"></div>

        <!-- Receiving flask at bottom -->
        <div class="receiving-flask">
          <div class="filtrate-liquid" id="filtrate-liq"></div>
        </div>
      </div>

      <div style="margin-top:20px; display:flex; gap:10px; justify-content:center;">
        <button class="sim-btn sim-btn-primary" id="btn-pour">Pour Mixture</button>
        <button class="sim-btn" id="btn-reset">Reset</button>
      </div>

      <button class="sim-btn sim-btn-primary" style="margin-top:20px; width:100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/"/g, '&quot;')})">🎓 Start Viva</button>
    </div>
  `;

  const btnPour = container.querySelector('#btn-pour');
  const btnReset = container.querySelector('#btn-reset');
  const topBeaker = container.querySelector('#top-beaker');
  const mixLiq = container.querySelector('#mix-liq');
  const pourStream = container.querySelector('#pour-stream');
  const filterPaper = container.querySelector('#filter-paper');
  const filtrateDrops = container.querySelector('#filtrate-drops');
  const filtrateLiq = container.querySelector('#filtrate-liq');

  let isPouring = false;

  btnPour.addEventListener('click', () => {
    if (isPouring) return;
    isPouring = true;
    
    // Tilt beaker
    topBeaker.classList.add('pouring');
    
    setTimeout(() => {
      // Stream starts
      pourStream.style.height = '70px';
      
      // Decrease mixture
      mixLiq.style.height = '0';

      // Start drops and filtrate accumulation
      setTimeout(() => {
        filtrateDrops.classList.add('drop-anim');
        filtrateLiq.style.height = '60%';
        filterPaper.style.borderTopColor = '#8b5a2b'; // Residue buildup
      }, 500);

      // Stop pouring
      setTimeout(() => {
        pourStream.style.height = '0';
        topBeaker.classList.remove('pouring');
      }, 4000);
      
      // Stop drops
      setTimeout(() => {
        filtrateDrops.classList.remove('drop-anim');
      }, 4500);

    }, 1000);
  });

  btnReset.addEventListener('click', () => {
    isPouring = false;
    topBeaker.classList.remove('pouring');
    mixLiq.style.height = '80%';
    pourStream.style.height = '0';
    filtrateLiq.style.height = '0';
    filtrateDrops.classList.remove('drop-anim');
    filterPaper.style.borderTopColor = 'rgba(240, 240, 240, 0.9)';
  });

  return function cleanup() {
    if (document.head.contains(style)) document.head.removeChild(style);
  };
};
