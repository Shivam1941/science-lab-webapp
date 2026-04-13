window.experimentRenderers = window.experimentRenderers || {};

window.experimentRenderers['chromatography_technique'] = function(container, exp) {
  const VIVA_QUESTIONS = [
    { q: "Chromatography is used to separate components of a mixture based on their different:", o: ["Boiling points", "Solubilities in a solvent", "Densities", "Magnetic properties"], a: 1 },
    { q: "The spot of ink is placed above the solvent level to prevent it from:", o: ["Evaporating", "Dissolving directly into the solvent reservoir", "Turning black", "Floating"], a: 1 },
    { q: "In paper chromatography, the filter paper acts as the:", o: ["Mobile phase", "Stationary phase", "Solvent", "Solute"], a: 1 },
    { q: "As the solvent rises, the component that is more soluble in it will:", o: ["Stay at the bottom", "Rise faster and higher", "Rise slower", "Disappear"], a: 1 }
  ];

  const style = document.createElement('style');
  style.innerHTML = `
    .chromatography-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      height: 400px;
      margin-top: 30px;
    }
    .beaker-jar {
      width: 150px;
      height: 250px;
      border: 4px solid rgba(255, 255, 255, 0.4);
      border-top: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px 10px 20px 20px;
      position: relative;
      background: rgba(255, 255, 255, 0.05);
      overflow: hidden;
      display: flex;
      justify-content: center;
    }
    .solvent-reservoir {
      width: 100%;
      height: 40px;
      background: rgba(100, 200, 255, 0.3);
      position: absolute;
      bottom: 0;
    }
    .chrom-paper {
      width: 60px;
      height: 220px;
      background: #f0f0f0;
      position: absolute;
      top: 10px;
      border: 1px solid #ccc;
      box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
    }
    .pencil-line {
      width: 100%;
      height: 1px;
      background: #999;
      position: absolute;
      bottom: 50px;
    }
    .ink-spot {
      width: 8px;
      height: 8px;
      background: #000;
      border-radius: 50%;
      position: absolute;
      bottom: 46px;
      left: 26px;
      z-index: 5;
    }
    .solvent-front {
      width: 100%;
      height: 0;
      background: rgba(100, 200, 255, 0.2);
      position: absolute;
      bottom: 0;
      transition: height 10s linear;
    }
    .color-band {
      width: 20px;
      height: 10px;
      border-radius: 5px;
      position: absolute;
      left: 20px;
      opacity: 0;
      filter: blur(2px);
      transition: bottom 10s linear, opacity 1s;
    }
    .band-yellow { background: yellow; transition-timing-function: linear; }
    .band-magenta { background: magenta; transition-timing-function: linear; }
    .band-cyan { background: cyan; transition-timing-function: linear; }
  `;
  document.head.appendChild(style);

  container.innerHTML = `
    <div class="sim-wrapper glass-card" style="padding:20px; text-align:center;">
      <h3 style="color:var(--text-primary); margin-bottom: 20px;">Paper Chromatography</h3>
      
      <div class="chromatography-container">
        <div class="beaker-jar">
          <div class="solvent-reservoir"></div>
          <div class="chrom-paper">
            <div class="solvent-front" id="solvent-f"></div>
            <div class="pencil-line"></div>
            <div class="ink-spot" id="ink-s"></div>
            <div class="color-band band-yellow" id="band-y"></div>
            <div class="color-band band-magenta" id="band-m"></div>
            <div class="color-band band-cyan" id="band-c"></div>
          </div>
        </div>
      </div>

      <div style="margin-top:20px; display:flex; gap:10px; justify-content:center;">
        <button class="sim-btn sim-btn-primary" id="btn-start">Start Chromatography</button>
        <button class="sim-btn" id="btn-reset">Reset</button>
      </div>

      <button class="sim-btn sim-btn-primary" style="margin-top:20px; width:100%;" onclick="window.VIVA_SYSTEM.open(${JSON.stringify(VIVA_QUESTIONS).replace(/&/g, '&amp;').replace(/"/g, '&quot;')})">🎓 Start Viva</button>
    </div>
  `;

  const btnStart = container.querySelector('#btn-start');
  const btnReset = container.querySelector('#btn-reset');
  const solventF = container.querySelector('#solvent-f');
  const inkS = container.querySelector('#ink-s');
  const bandY = container.querySelector('#band-y');
  const bandM = container.querySelector('#band-m');
  const bandC = container.querySelector('#band-c');

  let isStarted = false;

  btnStart.addEventListener('click', () => {
    if (isStarted) return;
    isStarted = true;

    // Start solvent rise
    solventF.style.height = '180px';
    
    setTimeout(() => {
        inkS.style.opacity = '0.3';
        
        // Bands start moving at different rates
        // Original spot is at 46px from bottom of paper.
        // Solvent reaches 180px.
        
        bandY.style.opacity = '0.8';
        bandM.style.opacity = '0.8';
        bandC.style.opacity = '0.8';

        bandY.style.bottom = '160px'; // Most soluble
        bandM.style.bottom = '110px';
        bandC.style.bottom = '70px'; // Least soluble
    }, 1000);
  });

  btnReset.addEventListener('click', () => {
    isStarted = false;
    solventF.style.transition = 'none';
    bandY.style.transition = 'none';
    bandM.style.transition = 'none';
    bandC.style.transition = 'none';
    inkS.style.transition = 'none';

    solventF.style.height = '0';
    bandY.style.opacity = '0';
    bandM.style.opacity = '0';
    bandC.style.opacity = '0';
    bandY.style.bottom = '46px';
    bandM.style.bottom = '46px';
    bandC.style.bottom = '46px';
    inkS.style.opacity = '1';

    setTimeout(() => {
        solventF.style.transition = 'height 10s linear';
        bandY.style.transition = 'bottom 10s linear, opacity 1s';
        bandM.style.transition = 'bottom 10s linear, opacity 1s';
        bandC.style.transition = 'bottom 10s linear, opacity 1s';
        inkS.style.transition = 'opacity 1s';
    }, 50);
  });

  return function cleanup() {
    if (document.head.contains(style)) document.head.removeChild(style);
  };
};
