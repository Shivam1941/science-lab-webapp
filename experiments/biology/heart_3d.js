/* ============================================================
   3D Human Heart Explorer — Interactive Anatomy Lab
   Three.js-based dissection, blood flow, and labelled anatomy
   ============================================================ */
(function () {
  window.experimentRenderers = window.experimentRenderers || {};
  window.experimentRenderers['heart_3d_explorer'] = function (container, exp) {

    /* ── Anatomy Data ─────────────────────────────────────────── */
    const ANATOMY = {
      leftVentricle:   { name: 'Left Ventricle',     fn: 'Pumps oxygenated blood to the entire body through the aorta.',                    role: 'The thickest, most muscular chamber. Generates high systemic pressure.' },
      rightVentricle:  { name: 'Right Ventricle',    fn: 'Pumps deoxygenated blood to the lungs via the pulmonary artery.',                 role: 'Thinner walls — only needs to push blood the short distance to the lungs.' },
      leftAtrium:      { name: 'Left Atrium',        fn: 'Receives oxygenated blood returning from the lungs via pulmonary veins.',         role: 'Upper-left chamber; passes blood down through the mitral valve.' },
      rightAtrium:     { name: 'Right Atrium',       fn: 'Receives deoxygenated blood from the body via the superior & inferior vena cava.',role: 'Upper-right chamber; passes blood through the tricuspid valve.' },
      aorta:           { name: 'Aorta',              fn: 'The largest artery — carries oxygenated blood from the left ventricle to the body.', role: 'Rises from the left ventricle, arches over the heart, and descends.' },
      pulmonaryArtery: { name: 'Pulmonary Artery',   fn: 'Carries deoxygenated blood from the right ventricle to the lungs.',              role: 'The only artery that carries deoxygenated blood.' },
      superiorVC:      { name: 'Superior Vena Cava', fn: 'Returns deoxygenated blood from the upper body to the right atrium.',            role: 'Large vein draining head, arms, and upper torso.' },
      inferiorVC:      { name: 'Inferior Vena Cava', fn: 'Returns deoxygenated blood from the lower body to the right atrium.',            role: 'Large vein draining abdomen, legs, and lower torso.' },
      pulmonaryVeins:  { name: 'Pulmonary Veins',    fn: 'Carry oxygenated blood from the lungs back to the left atrium.',                 role: 'The only veins that carry oxygenated blood.' },
      tricuspidValve:  { name: 'Tricuspid Valve',    fn: 'Prevents backflow from right ventricle to right atrium.',                        role: 'Three leaflets; opens during atrial contraction.' },
      mitralValve:     { name: 'Mitral (Bicuspid) Valve', fn: 'Prevents backflow from left ventricle to left atrium.',                     role: 'Two leaflets; the strongest AV valve.' },
      septum:          { name: 'Interventricular Septum', fn: 'Muscular wall separating the left and right ventricles.',                   role: 'Prevents mixing of oxygenated and deoxygenated blood.' }
    };

    const VIVA_QUESTIONS = [
      { q: 'How many chambers does the human heart have?', opts: ['Two', 'Three', 'Four', 'Five'], ans: 2, exp: 'The heart has four chambers — two atria (upper) and two ventricles (lower).' },
      { q: 'Which chamber pumps blood to the lungs?', opts: ['Left Atrium', 'Right Ventricle', 'Left Ventricle', 'Right Atrium'], ans: 1, exp: 'The right ventricle pumps deoxygenated blood to the lungs via the pulmonary artery.' },
      { q: 'What is the largest artery in the human body?', opts: ['Pulmonary Artery', 'Vena Cava', 'Aorta', 'Coronary Artery'], ans: 2, exp: 'The aorta is the largest artery; it carries oxygenated blood from the left ventricle to the entire body.' },
      { q: 'What prevents blood from flowing backward in the heart?', opts: ['Septum', 'Valves', 'Atria', 'Veins'], ans: 1, exp: 'Heart valves (tricuspid, mitral, aortic, pulmonary) ensure blood flows in one direction only.' },
      { q: 'Which side of the heart contains oxygenated blood?', opts: ['Right side', 'Left side', 'Both sides', 'Neither side'], ans: 1, exp: 'The left atrium receives oxygenated blood from lungs, and the left ventricle pumps it to the body.' },
      { q: 'What is the function of the septum?', opts: ['Pumps blood', 'Filters blood', 'Separates left and right sides', 'Connects atria to ventricles'], ans: 2, exp: 'The interventricular septum is a thick muscular wall that prevents mixing of oxygenated and deoxygenated blood.' }
    ];

    /* ── State ────────────────────────────────────────────────── */
    let showLabels = false;
    let dissectionMode = false;
    let bloodFlowMode = false;
    let heartbeatOn = true;
    let xrayMode = false;
    let stepFlowMode = false;
    let stepFlowIndex = 0;
    let quizActive = false;
    let quizPart = null;
    let speed = 1.0;
    let selectedPart = null;
    let alive = true;

    /* ── HTML UI ──────────────────────────────────────────────── */
    container.innerHTML = `
      <div id="heart3d-root" style="display:flex; gap:0; height:620px; border-radius:14px; overflow:hidden; border:1px solid var(--border-glass); background:#06080d;">
        <!-- 3D Canvas -->
        <div id="heart3d-viewport" style="flex:1; position:relative; min-width:0; overflow:hidden;">
          <div id="heart3d-canvas-host" style="width:100%;height:100%;"></div>
          <!-- Labels overlay -->
          <div id="heart3d-labels" style="position:absolute;inset:0;pointer-events:none;overflow:hidden;"></div>
          <!-- Mode badge -->
          <div id="heart3d-mode-badge" style="position:absolute;top:12px;left:12px;padding:4px 14px;border-radius:100px;font-size:11px;font-weight:600;background:rgba(34,197,94,0.15);color:#22c55e;border:1px solid rgba(34,197,94,0.25);">Normal View</div>
          <!-- Loading -->
          <div id="heart3d-loading" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(6,8,13,0.95);z-index:10;">
            <div style="text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;animation:pulse 1s infinite alternate;">🫀</div>
              <div style="color:var(--text-secondary);font-size:14px;">Building 3D Heart Model...</div>
            </div>
          </div>
        </div>

        <!-- Sidebar Controls -->
        <div style="width:300px; flex-shrink:0; display:flex; flex-direction:column; background:rgba(12,16,24,0.9); border-left:1px solid var(--border-glass); overflow-y:auto;">
          <div style="padding:16px 18px; border-bottom:1px solid var(--border-glass);">
            <div style="font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:700; color:#fff;">🫀 Heart Explorer</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Interactive 3D Anatomy</div>
          </div>

          <div style="padding:14px 18px; display:flex; flex-direction:column; gap:12px; flex:1;">
            <!-- Toggle: Labels -->
            <div class="h3d-toggle-row">
              <span>🏷️ Show All Labels</span>
              <label class="h3d-switch"><input type="checkbox" id="h3d-tgl-labels"><span class="h3d-slider"></span></label>
            </div>
            <!-- Toggle: Heartbeat -->
            <div class="h3d-toggle-row">
              <span>💓 Heartbeat</span>
              <label class="h3d-switch"><input type="checkbox" id="h3d-tgl-heartbeat" checked><span class="h3d-slider"></span></label>
            </div>
            <!-- Toggle: Blood Flow -->
            <div class="h3d-toggle-row">
              <span>🩸 Blood Flow</span>
              <label class="h3d-switch"><input type="checkbox" id="h3d-tgl-bloodflow"><span class="h3d-slider"></span></label>
            </div>
            <!-- Toggle: Dissection -->
            <div class="h3d-toggle-row">
              <span>🔪 Dissection Mode</span>
              <label class="h3d-switch"><input type="checkbox" id="h3d-tgl-dissect"><span class="h3d-slider"></span></label>
            </div>
            <!-- Toggle: X-Ray -->
            <div class="h3d-toggle-row">
              <span>☢️ X-Ray Mode</span>
              <label class="h3d-switch"><input type="checkbox" id="h3d-tgl-xray"><span class="h3d-slider"></span></label>
            </div>

            <!-- Speed slider -->
            <div style="margin-top:6px;">
              <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-bottom:4px;">
                <span>Speed</span><span id="h3d-speed-val">1.0×</span>
              </div>
              <input type="range" min="0.2" max="3" step="0.1" value="1" id="h3d-speed" style="width:100%; accent-color:#ef4444;">
            </div>

            <div style="border-top:1px solid var(--border-glass); margin:4px 0;"></div>

            <!-- Step-by-step flow -->
            <div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:2px;">BLOOD FLOW STEPS</div>
            <button class="sim-btn" style="width:100%;font-size:12px;padding:8px;" id="h3d-step-btn" onclick="window._h3dStepFlow()">▶ Step Through Flow</button>
            <div id="h3d-step-info" style="font-size:11px;color:var(--text-muted);min-height:30px;line-height:1.4;"></div>

            <div style="border-top:1px solid var(--border-glass); margin:4px 0;"></div>

            <!-- Quiz -->
            <button class="sim-btn btn-primary" style="width:100%;font-size:12px;padding:8px;" onclick="window._h3dStartQuiz()">🧠 Identify Parts Quiz</button>
            <div id="h3d-quiz-area" style="min-height:20px;"></div>

            <div style="margin-top:auto; display:flex; gap:8px;">
              <button class="sim-btn" style="flex:1;font-size:12px;" onclick="window._h3dReset()">↺ Reset</button>
              <button class="sim-btn sim-btn-primary" style="flex:1;font-size:12px;" onclick="window.VIVA_SYSTEM.open(VIVA_QUESTIONS)">🎓 Viva</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Info Panel -->
      <div id="heart3d-info" style="margin-top:12px; padding:18px 24px; background:var(--bg-card); border:1px solid var(--border-glass); border-radius:12px; min-height:80px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div id="h3d-info-dot" style="width:12px;height:12px;border-radius:50%;background:#525c6e;flex-shrink:0;"></div>
          <div>
            <div id="h3d-info-name" style="font-family:'Space Grotesk',sans-serif; font-size:18px; font-weight:700; color:var(--text-primary);">Click any part of the heart</div>
            <div id="h3d-info-fn" style="font-size:13px; color:var(--text-secondary); margin-top:4px; line-height:1.5;">Rotate the model by dragging. Scroll to zoom. Click on chambers, vessels, or valves to learn about them.</div>
            <div id="h3d-info-role" style="font-size:12px; color:var(--text-muted); margin-top:4px; line-height:1.4;"></div>
          </div>
        </div>
      </div>

      <!-- Toggle CSS -->
      <style>
        .h3d-toggle-row { display:flex; align-items:center; justify-content:space-between; font-size:13px; color:#ddd; }
        .h3d-switch { position:relative; width:40px; height:22px; flex-shrink:0; }
        .h3d-switch input { opacity:0; width:0; height:0; }
        .h3d-slider { position:absolute; inset:0; background:rgba(255,255,255,0.1); border-radius:22px; cursor:pointer; transition:0.3s; }
        .h3d-slider::before { content:''; position:absolute; width:16px; height:16px; left:3px; bottom:3px; background:#888; border-radius:50%; transition:0.3s; }
        .h3d-switch input:checked + .h3d-slider { background:rgba(239,68,68,0.45); }
        .h3d-switch input:checked + .h3d-slider::before { transform:translateX(18px); background:#ef4444; }
        .h3d-label-tag { position:absolute; padding:3px 10px; border-radius:100px; font-size:10px; font-weight:600; color:#fff; white-space:nowrap; pointer-events:auto; cursor:pointer; transition:all 0.2s; border:1px solid rgba(255,255,255,0.2); backdrop-filter:blur(4px); }
        .h3d-label-tag:hover { transform:scale(1.1); }
        @keyframes pulse { 0%{transform:scale(1)} 100%{transform:scale(1.15)} }
      </style>
    `;

    /* ── Three.js Availability Check ──────────────────────────── */
    if (typeof THREE === 'undefined') {
      document.getElementById('heart3d-loading').innerHTML = '<div style="color:#ef4444;text-align:center;">Three.js failed to load.<br>Please check your internet connection.</div>';
      return function () {};
    }

    /* ── Three.js Setup ───────────────────────────────────────── */
    const host = document.getElementById('heart3d-canvas-host');
    const labelsDiv = document.getElementById('heart3d-labels');
    const rect = host.getBoundingClientRect();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080d);

    const camera = new THREE.PerspectiveCamera(50, rect.width / rect.height, 0.1, 100);
    camera.position.set(0, 0.5, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(rect.width, rect.height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    host.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3;
    controls.maxDistance = 14;
    controls.target.set(0, 0, 0);

    /* ── Lighting ─────────────────────────────────────────────── */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff0e8, 0.9);
    keyLight.position.set(5, 6, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc8d8ff, 0.4);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xff4444, 0.3, 20);
    rimLight.position.set(0, -3, 4);
    scene.add(rimLight);

    /* ── Clipping Plane (for dissection) ──────────────────────── */
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    /* ── Materials ────────────────────────────────────────────── */
    function makeMat(color, opts = {}) {
      return new THREE.MeshStandardMaterial({
        color,
        roughness: opts.roughness !== undefined ? opts.roughness : 0.55,
        metalness: opts.metalness !== undefined ? opts.metalness : 0.05,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        ...opts
      });
    }

    const mats = {
      leftVentricle:   makeMat(0xcc2222),
      rightVentricle:  makeMat(0x993333),
      leftAtrium:      makeMat(0xdd4444),
      rightAtrium:     makeMat(0xaa3838),
      aorta:           makeMat(0xe83030, { roughness: 0.35 }),
      pulmonaryArtery: makeMat(0x4466aa, { roughness: 0.35 }),
      superiorVC:      makeMat(0x3355aa),
      inferiorVC:      makeMat(0x3355aa),
      pulmonaryVeins:  makeMat(0xbb3333, { roughness: 0.4 }),
      tricuspidValve:  makeMat(0xeeddcc, { roughness: 0.3 }),
      mitralValve:     makeMat(0xeeddcc, { roughness: 0.3 }),
      septum:          makeMat(0xbb5555),
      innerWall:       makeMat(0xdd8888, { roughness: 0.7 })
    };

    /* ── Build Procedural Heart ───────────────────────────────── */
    const heartGroup = new THREE.Group();
    const parts = {};        // key → mesh
    const labelAnchors = {}; // key → THREE.Vector3 (world)

    function buildHeart() {
      // Left Ventricle (lower-left, thicker)
      const lvGeo = new THREE.SphereGeometry(1.1, 32, 32);
      lvGeo.scale(0.85, 1.3, 0.8);
      const lv = new THREE.Mesh(lvGeo, mats.leftVentricle);
      lv.position.set(-0.35, -0.6, 0);
      lv.userData.partKey = 'leftVentricle';
      parts.leftVentricle = lv;
      heartGroup.add(lv);

      // Right Ventricle (lower-right, thinner)
      const rvGeo = new THREE.SphereGeometry(0.95, 32, 32);
      rvGeo.scale(0.75, 1.15, 0.7);
      const rv = new THREE.Mesh(rvGeo, mats.rightVentricle);
      rv.position.set(0.45, -0.5, 0.15);
      rv.userData.partKey = 'rightVentricle';
      parts.rightVentricle = rv;
      heartGroup.add(rv);

      // Left Atrium (upper-left)
      const laGeo = new THREE.SphereGeometry(0.65, 32, 32);
      laGeo.scale(0.8, 0.7, 0.7);
      const la = new THREE.Mesh(laGeo, mats.leftAtrium);
      la.position.set(-0.5, 0.8, -0.1);
      la.userData.partKey = 'leftAtrium';
      parts.leftAtrium = la;
      heartGroup.add(la);

      // Right Atrium (upper-right)
      const raGeo = new THREE.SphereGeometry(0.7, 32, 32);
      raGeo.scale(0.85, 0.75, 0.7);
      const ra = new THREE.Mesh(raGeo, mats.rightAtrium);
      ra.position.set(0.55, 0.75, 0.1);
      ra.userData.partKey = 'rightAtrium';
      parts.rightAtrium = ra;
      heartGroup.add(ra);

      // Aorta — Curved tube rising from LV
      const aortaPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.2, 0.4, 0),
        new THREE.Vector3(-0.15, 1.3, 0),
        new THREE.Vector3(0.1, 1.8, -0.1),
        new THREE.Vector3(0.5, 2.1, -0.2),
        new THREE.Vector3(0.9, 1.9, -0.3)
      ]);
      const aortaGeo = new THREE.TubeGeometry(aortaPath, 32, 0.22, 16, false);
      const aortaMesh = new THREE.Mesh(aortaGeo, mats.aorta);
      aortaMesh.userData.partKey = 'aorta';
      parts.aorta = aortaMesh;
      heartGroup.add(aortaMesh);

      // Pulmonary Artery — From RV going up-left
      const paPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.35, 0.3, 0.2),
        new THREE.Vector3(0.2, 1.0, 0.3),
        new THREE.Vector3(-0.1, 1.5, 0.35),
        new THREE.Vector3(-0.5, 1.8, 0.3)
      ]);
      const paGeo = new THREE.TubeGeometry(paPath, 24, 0.18, 12, false);
      const paMesh = new THREE.Mesh(paGeo, mats.pulmonaryArtery);
      paMesh.userData.partKey = 'pulmonaryArtery';
      parts.pulmonaryArtery = paMesh;
      heartGroup.add(paMesh);

      // Superior Vena Cava — Into RA from above
      const svcPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.8, 2.2, 0.1),
        new THREE.Vector3(0.7, 1.6, 0.1),
        new THREE.Vector3(0.6, 1.1, 0.1)
      ]);
      const svcGeo = new THREE.TubeGeometry(svcPath, 16, 0.18, 12, false);
      const svcMesh = new THREE.Mesh(svcGeo, mats.superiorVC);
      svcMesh.userData.partKey = 'superiorVC';
      parts.superiorVC = svcMesh;
      heartGroup.add(svcMesh);

      // Inferior Vena Cava — Into RA from below
      const ivcPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.7, -1.6, 0),
        new THREE.Vector3(0.65, -1.0, 0.05),
        new THREE.Vector3(0.55, -0.2, 0.1)
      ]);
      const ivcGeo = new THREE.TubeGeometry(ivcPath, 16, 0.18, 12, false);
      const ivcMesh = new THREE.Mesh(ivcGeo, mats.inferiorVC);
      ivcMesh.userData.partKey = 'inferiorVC';
      parts.inferiorVC = ivcMesh;
      heartGroup.add(ivcMesh);

      // Pulmonary Veins — Into LA
      const pvPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.4, 1.2, -0.2),
        new THREE.Vector3(-1.0, 1.0, -0.15),
        new THREE.Vector3(-0.6, 0.85, -0.1)
      ]);
      const pvGeo = new THREE.TubeGeometry(pvPath, 12, 0.12, 8, false);
      const pvMesh = new THREE.Mesh(pvGeo, mats.pulmonaryVeins);
      pvMesh.userData.partKey = 'pulmonaryVeins';
      parts.pulmonaryVeins = pvMesh;
      heartGroup.add(pvMesh);

      // Tricuspid Valve — Between RA and RV
      const tvGeo = new THREE.TorusGeometry(0.28, 0.06, 12, 24);
      const tv = new THREE.Mesh(tvGeo, mats.tricuspidValve);
      tv.position.set(0.5, 0.15, 0.12);
      tv.rotation.x = Math.PI / 2;
      tv.userData.partKey = 'tricuspidValve';
      parts.tricuspidValve = tv;
      heartGroup.add(tv);

      // Mitral Valve — Between LA and LV
      const mvGeo = new THREE.TorusGeometry(0.26, 0.06, 12, 24);
      const mv = new THREE.Mesh(mvGeo, mats.mitralValve);
      mv.position.set(-0.4, 0.15, -0.05);
      mv.rotation.x = Math.PI / 2;
      mv.userData.partKey = 'mitralValve';
      parts.mitralValve = mv;
      heartGroup.add(mv);

      // Septum (visible in dissection mode)
      const septGeo = new THREE.BoxGeometry(0.12, 2.0, 1.2);
      const sept = new THREE.Mesh(septGeo, mats.septum);
      sept.position.set(0.05, -0.1, 0);
      sept.userData.partKey = 'septum';
      sept.visible = false; // only shown in dissection
      parts.septum = sept;
      heartGroup.add(sept);

      // Inner wall details (only visible in cross-section)
      const iwGeo = new THREE.SphereGeometry(0.85, 24, 24);
      iwGeo.scale(0.7, 1.1, 0.6);
      const innerLV = new THREE.Mesh(iwGeo, mats.innerWall);
      innerLV.position.set(-0.35, -0.6, 0);
      innerLV.visible = false;
      parts._innerLV = innerLV;
      heartGroup.add(innerLV);

      const iwGeo2 = new THREE.SphereGeometry(0.7, 24, 24);
      iwGeo2.scale(0.55, 0.9, 0.5);
      const innerRV = new THREE.Mesh(iwGeo2, mats.innerWall.clone());
      innerRV.position.set(0.45, -0.5, 0.15);
      innerRV.visible = false;
      parts._innerRV = innerRV;
      heartGroup.add(innerRV);

      // Slight rotation to look anatomically natural
      heartGroup.rotation.z = 0.15;
      heartGroup.rotation.x = 0.05;

      // Store label anchor points (in local coords, converted later)
      labelAnchors.leftVentricle   = new THREE.Vector3(-0.35, -0.6, 0.9);
      labelAnchors.rightVentricle  = new THREE.Vector3(0.45, -0.5, 0.85);
      labelAnchors.leftAtrium      = new THREE.Vector3(-0.5, 0.8, 0.6);
      labelAnchors.rightAtrium     = new THREE.Vector3(0.55, 0.75, 0.7);
      labelAnchors.aorta           = new THREE.Vector3(0.1, 1.8, 0);
      labelAnchors.pulmonaryArtery = new THREE.Vector3(-0.1, 1.5, 0.4);
      labelAnchors.superiorVC      = new THREE.Vector3(0.75, 1.8, 0.1);
      labelAnchors.inferiorVC      = new THREE.Vector3(0.7, -1.3, 0);
      labelAnchors.pulmonaryVeins  = new THREE.Vector3(-1.2, 1.1, -0.15);
      labelAnchors.tricuspidValve  = new THREE.Vector3(0.5, 0.15, 0.5);
      labelAnchors.mitralValve     = new THREE.Vector3(-0.4, 0.15, 0.5);
      labelAnchors.septum          = new THREE.Vector3(0.05, -0.1, 0.7);

      scene.add(heartGroup);
    }

    buildHeart();

    /* ── Blood Flow Particles ─────────────────────────────────── */
    const bloodParticles = [];
    const PARTICLE_COUNT = 120;

    // Deoxygenated path: Body(IVC/SVC) → RA → RV → PA → Lungs
    const deoxyPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.7, -1.6, 0),
      new THREE.Vector3(0.6, -0.6, 0.1),
      new THREE.Vector3(0.55, 0.3, 0.1),
      new THREE.Vector3(0.55, 0.75, 0.1),   // RA
      new THREE.Vector3(0.5, 0.15, 0.12),    // tricuspid
      new THREE.Vector3(0.45, -0.5, 0.15),   // RV
      new THREE.Vector3(0.35, 0.3, 0.2),
      new THREE.Vector3(0.2, 1.0, 0.3),
      new THREE.Vector3(-0.1, 1.5, 0.35),
      new THREE.Vector3(-0.5, 1.8, 0.3)      // PA → lungs
    ]);

    // Oxygenated path: Lungs → PV → LA → LV → Aorta → Body
    const oxyPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.4, 1.2, -0.2),    // PV
      new THREE.Vector3(-0.8, 1.0, -0.15),
      new THREE.Vector3(-0.5, 0.8, -0.1),    // LA
      new THREE.Vector3(-0.4, 0.15, -0.05),  // mitral
      new THREE.Vector3(-0.35, -0.6, 0),     // LV
      new THREE.Vector3(-0.2, 0.4, 0),
      new THREE.Vector3(-0.15, 1.3, 0),
      new THREE.Vector3(0.1, 1.8, -0.1),
      new THREE.Vector3(0.5, 2.1, -0.2),
      new THREE.Vector3(0.9, 1.9, -0.3)      // Aorta → body
    ]);

    const FLOW_STEPS = [
      { label: 'Step 1: Deoxygenated blood returns from the body via Vena Cava', highlight: ['superiorVC', 'inferiorVC'], t: [0, 0.2], path: 'deoxy' },
      { label: 'Step 2: Blood enters the Right Atrium', highlight: ['rightAtrium'], t: [0.2, 0.4], path: 'deoxy' },
      { label: 'Step 3: Blood passes through the Tricuspid Valve into the Right Ventricle', highlight: ['tricuspidValve', 'rightVentricle'], t: [0.4, 0.6], path: 'deoxy' },
      { label: 'Step 4: Right Ventricle pumps blood to lungs via Pulmonary Artery', highlight: ['pulmonaryArtery'], t: [0.6, 1.0], path: 'deoxy' },
      { label: 'Step 5: Oxygenated blood returns from lungs via Pulmonary Veins', highlight: ['pulmonaryVeins'], t: [0, 0.2], path: 'oxy' },
      { label: 'Step 6: Blood enters the Left Atrium', highlight: ['leftAtrium'], t: [0.2, 0.4], path: 'oxy' },
      { label: 'Step 7: Blood passes through the Mitral Valve into the Left Ventricle', highlight: ['mitralValve', 'leftVentricle'], t: [0.4, 0.6], path: 'oxy' },
      { label: 'Step 8: Left Ventricle pumps oxygenated blood to the body via Aorta', highlight: ['aorta'], t: [0.6, 1.0], path: 'oxy' }
    ];

    function createBloodParticles() {
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const colors = new Float32Array(PARTICLE_COUNT * 3);
      const offsets = new Float32Array(PARTICLE_COUNT); // progress 0–1

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        offsets[i] = Math.random();
        // set initial position from path
        const isOxy = i >= PARTICLE_COUNT / 2;
        const path = isOxy ? oxyPath : deoxyPath;
        const pt = path.getPointAt(offsets[i]);
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
        // color
        if (isOxy) { colors[i*3]=1; colors[i*3+1]=0.15; colors[i*3+2]=0.1; }
        else       { colors[i*3]=0.15; colors[i*3+1]=0.2; colors[i*3+2]=0.9; }
      }

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        depthWrite: false
      });

      const pointsMesh = new THREE.Points(geo, mat);
      pointsMesh.visible = false;
      scene.add(pointsMesh);

      return { mesh: pointsMesh, offsets, geo };
    }

    const bloodSystem = createBloodParticles();

    /* ── Raycasting (click detection) ─────────────────────────── */
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let highlightedMesh = null;
    const originalColors = {};

    // Store original colors for reset
    Object.entries(parts).forEach(([key, mesh]) => {
      if (mesh.material && mesh.material.color) {
        originalColors[key] = mesh.material.color.getHex();
      }
    });

    function onCanvasClick(e) {
      const canvasRect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
      mouse.y = -((e.clientY - canvasRect.top) / canvasRect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const clickable = Object.values(parts).filter(m => m.visible && !m.userData.partKey?.startsWith('_'));
      const intersects = raycaster.intersectObjects(clickable, false);

      // Unhighlight previous
      if (highlightedMesh) {
        const k = highlightedMesh.userData.partKey;
        if (k && originalColors[k] !== undefined) {
          highlightedMesh.material.color.setHex(originalColors[k]);
          highlightedMesh.material.emissive.setHex(0x000000);
        }
        highlightedMesh = null;
      }

      if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const key = mesh.userData.partKey;
        if (key && ANATOMY[key]) {
          highlightedMesh = mesh;
          mesh.material.emissive.setHex(0x442222);
          selectPart(key);

          // Quiz answer check
          if (quizActive && quizPart) {
            const qa = document.getElementById('h3d-quiz-area');
            if (key === quizPart) {
              qa.innerHTML = '<div style="color:#22c55e;font-size:12px;margin-top:4px;">✅ Correct! That is the ' + ANATOMY[key].name + '.</div>';
              quizActive = false;
              quizPart = null;
            } else {
              qa.innerHTML = '<div style="color:#ef4444;font-size:12px;margin-top:4px;">❌ That is the ' + ANATOMY[key].name + '. Try again!</div>';
            }
          }
        }
      }
    }
    renderer.domElement.addEventListener('click', onCanvasClick);

    function selectPart(key) {
      selectedPart = key;
      const data = ANATOMY[key];
      document.getElementById('h3d-info-name').textContent = data.name;
      document.getElementById('h3d-info-fn').textContent = data.fn;
      document.getElementById('h3d-info-role').textContent = '💡 ' + data.role;
      const dot = document.getElementById('h3d-info-dot');
      if (parts[key] && parts[key].material) {
        const c = parts[key].material.color;
        dot.style.background = '#' + c.getHexString();
      }
    }

    /* ── Label Projection ─────────────────────────────────────── */
    const labelEls = {};
    function createLabelElements() {
      labelsDiv.innerHTML = '';
      const colors = {
        leftVentricle: '#cc2222', rightVentricle: '#993333',
        leftAtrium: '#dd4444', rightAtrium: '#aa3838',
        aorta: '#e83030', pulmonaryArtery: '#4466aa',
        superiorVC: '#3355aa', inferiorVC: '#3355aa',
        pulmonaryVeins: '#bb3333',
        tricuspidValve: '#eeddcc', mitralValve: '#eeddcc',
        septum: '#bb5555'
      };
      Object.keys(ANATOMY).forEach(key => {
        const el = document.createElement('div');
        el.className = 'h3d-label-tag';
        el.style.background = (colors[key] || '#555') + '88';
        el.textContent = ANATOMY[key].name;
        el.addEventListener('click', () => { selectPart(key); highlightPart(key); });
        labelsDiv.appendChild(el);
        labelEls[key] = el;
      });
    }
    createLabelElements();

    function highlightPart(key) {
      // Clear old
      if (highlightedMesh) {
        const k = highlightedMesh.userData.partKey;
        if (k && originalColors[k] !== undefined) {
          highlightedMesh.material.color.setHex(originalColors[k]);
          highlightedMesh.material.emissive.setHex(0x000000);
        }
      }
      if (parts[key]) {
        highlightedMesh = parts[key];
        parts[key].material.emissive.setHex(0x442222);
      }
    }

    function updateLabels() {
      labelsDiv.style.display = '';
      const vpW = renderer.domElement.clientWidth;
      const vpH = renderer.domElement.clientHeight;

      Object.keys(ANATOMY).forEach(key => {
        const el = labelEls[key];
        if (!el) return;

        // Only show label for this key if: showLabels (all) OR it's the selectedPart
        const shouldShow = showLabels || key === selectedPart;
        if (!shouldShow) { el.style.display = 'none'; return; }

        const anchor = labelAnchors[key];
        if (!anchor) { el.style.display = 'none'; return; }

        // Project world → screen
        const projected = anchor.clone();
        heartGroup.localToWorld(projected);
        projected.project(camera);

        const x = (projected.x * 0.5 + 0.5) * vpW;
        const y = (-projected.y * 0.5 + 0.5) * vpH;

        // Hide if behind camera
        if (projected.z > 1) { el.style.display = 'none'; return; }

        el.style.display = '';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.transform = 'translate(-50%, -50%)';

        // Show septum label only in dissection
        if (key === 'septum' && !dissectionMode) el.style.display = 'none';
      });
    }

    /* ── Toggle Handlers ──────────────────────────────────────── */
    document.getElementById('h3d-tgl-labels').addEventListener('change', function () { showLabels = this.checked; });
    document.getElementById('h3d-tgl-heartbeat').addEventListener('change', function () { heartbeatOn = this.checked; });
    document.getElementById('h3d-tgl-bloodflow').addEventListener('change', function () {
      bloodFlowMode = this.checked;
      bloodSystem.mesh.visible = bloodFlowMode;
    });
    document.getElementById('h3d-tgl-dissect').addEventListener('change', function () {
      dissectionMode = this.checked;
      const badge = document.getElementById('heart3d-mode-badge');
      if (dissectionMode) {
        badge.textContent = 'Dissection View';
        badge.style.background = 'rgba(239,68,68,0.15)';
        badge.style.color = '#ef4444';
        badge.style.borderColor = 'rgba(239,68,68,0.25)';
        // Show internal parts
        parts.septum.visible = true;
        if (parts._innerLV) parts._innerLV.visible = true;
        if (parts._innerRV) parts._innerRV.visible = true;
        // Apply clipping to outer chambers
        [parts.leftVentricle, parts.rightVentricle, parts.leftAtrium, parts.rightAtrium].forEach(m => {
          m.material.clippingPlanes = [clipPlane];
        });
      } else {
        badge.textContent = xrayMode ? 'X-Ray View' : 'Normal View';
        badge.style.background = 'rgba(34,197,94,0.15)';
        badge.style.color = '#22c55e';
        badge.style.borderColor = 'rgba(34,197,94,0.25)';
        parts.septum.visible = false;
        if (parts._innerLV) parts._innerLV.visible = false;
        if (parts._innerRV) parts._innerRV.visible = false;
        [parts.leftVentricle, parts.rightVentricle, parts.leftAtrium, parts.rightAtrium].forEach(m => {
          m.material.clippingPlanes = [];
        });
      }
    });
    document.getElementById('h3d-tgl-xray').addEventListener('change', function () {
      xrayMode = this.checked;
      const badge = document.getElementById('heart3d-mode-badge');
      Object.values(parts).forEach(m => {
        if (!m.material) return;
        m.material.opacity = xrayMode ? 0.3 : 1.0;
        m.material.transparent = true;
      });
      if (xrayMode && !dissectionMode) {
        badge.textContent = 'X-Ray View';
        badge.style.background = 'rgba(56,189,248,0.15)';
        badge.style.color = '#38bdf8';
        badge.style.borderColor = 'rgba(56,189,248,0.25)';
      } else if (!dissectionMode) {
        badge.textContent = 'Normal View';
        badge.style.background = 'rgba(34,197,94,0.15)';
        badge.style.color = '#22c55e';
        badge.style.borderColor = 'rgba(34,197,94,0.25)';
      }
    });
    document.getElementById('h3d-speed').addEventListener('input', function () {
      speed = parseFloat(this.value);
      document.getElementById('h3d-speed-val').textContent = speed.toFixed(1) + '×';
    });

    /* ── Step-through flow ────────────────────────────────────── */
    window._h3dStepFlow = () => {
      if (stepFlowIndex >= FLOW_STEPS.length) stepFlowIndex = 0;
      const step = FLOW_STEPS[stepFlowIndex];
      document.getElementById('h3d-step-info').textContent = step.label;

      // Highlight the relevant parts
      // Clear all highlights
      Object.entries(parts).forEach(([k, m]) => {
        if (originalColors[k] !== undefined) {
          m.material.color.setHex(originalColors[k]);
          m.material.emissive.setHex(0x000000);
        }
      });
      step.highlight.forEach(k => {
        if (parts[k]) {
          parts[k].material.emissive.setHex(0x553333);
        }
      });

      // Also show blood flow if not on
      if (!bloodFlowMode) {
        bloodFlowMode = true;
        bloodSystem.mesh.visible = true;
        document.getElementById('h3d-tgl-bloodflow').checked = true;
      }

      stepFlowIndex++;
      document.getElementById('h3d-step-btn').textContent = stepFlowIndex >= FLOW_STEPS.length ? '↺ Restart Steps' : '▶ Next Step (' + (stepFlowIndex + 1) + '/' + FLOW_STEPS.length + ')';
    };

    /* ── Quiz Mode ────────────────────────────────────────────── */
    window._h3dStartQuiz = () => {
      const keys = Object.keys(ANATOMY);
      quizPart = keys[Math.floor(Math.random() * keys.length)];
      quizActive = true;

      // Highlight the part with a glow
      Object.entries(parts).forEach(([k, m]) => {
        if (originalColors[k] !== undefined) {
          m.material.emissive.setHex(0x000000);
          m.material.opacity = (k === quizPart) ? 1.0 : (xrayMode ? 0.3 : 0.5);
        }
      });
      if (parts[quizPart]) parts[quizPart].material.emissive.setHex(0x664400);

      document.getElementById('h3d-quiz-area').innerHTML = '<div style="font-size:12px;color:#facc15;margin-top:4px;">🎯 Click the highlighted part! What is it?</div>';
    };

    /* ── Reset ─────────────────────────────────────────────────── */
    window._h3dReset = () => {
      // Reset toggles
      showLabels = false; dissectionMode = false; bloodFlowMode = false;
      heartbeatOn = true; xrayMode = false; stepFlowIndex = 0;
      quizActive = false; quizPart = null; speed = 1;

      document.getElementById('h3d-tgl-labels').checked = false;
      selectedPart = null;
      document.getElementById('h3d-tgl-heartbeat').checked = true;
      document.getElementById('h3d-tgl-bloodflow').checked = false;
      document.getElementById('h3d-tgl-dissect').checked = false;
      document.getElementById('h3d-tgl-xray').checked = false;
      document.getElementById('h3d-speed').value = 1;
      document.getElementById('h3d-speed-val').textContent = '1.0×';
      document.getElementById('h3d-step-info').textContent = '';
      document.getElementById('h3d-step-btn').textContent = '▶ Step Through Flow';
      document.getElementById('h3d-quiz-area').innerHTML = '';

      bloodSystem.mesh.visible = false;
      parts.septum.visible = false;
      if (parts._innerLV) parts._innerLV.visible = false;
      if (parts._innerRV) parts._innerRV.visible = false;

      Object.entries(parts).forEach(([k, m]) => {
        if (originalColors[k] !== undefined) {
          m.material.color.setHex(originalColors[k]);
          m.material.emissive.setHex(0x000000);
          m.material.opacity = 1.0;
          m.material.clippingPlanes = [];
        }
      });

      const badge = document.getElementById('heart3d-mode-badge');
      badge.textContent = 'Normal View';
      badge.style.background = 'rgba(34,197,94,0.15)';
      badge.style.color = '#22c55e';
      badge.style.borderColor = 'rgba(34,197,94,0.25)';

      document.getElementById('h3d-info-name').textContent = 'Click any part of the heart';
      document.getElementById('h3d-info-fn').textContent = 'Rotate the model by dragging. Scroll to zoom. Click on chambers, vessels, or valves to learn about them.';
      document.getElementById('h3d-info-role').textContent = '';
      document.getElementById('h3d-info-dot').style.background = '#525c6e';

      camera.position.set(0, 0.5, 7);
      controls.target.set(0, 0, 0);
    };

    /* ── Resize Handler ───────────────────────────────────────── */
    function onResize() {
      if (!alive) return;
      const r = host.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
      renderer.setSize(r.width, r.height);
    }
    window.addEventListener('resize', onResize);

    /* ── Animation Loop ───────────────────────────────────────── */
    const clock = new THREE.Clock();

    function animate() {
      if (!alive) return;
      requestAnimationFrame(animate);

      const dt = clock.getDelta();
      const elapsed = clock.elapsedTime;
      controls.update();

      // Heartbeat animation
      if (heartbeatOn) {
        const beatPhase = (elapsed * speed * 1.2) % 1.0;
        // Systole-diastole simulation
        let s;
        if (beatPhase < 0.15) {
          s = 1.0 + 0.06 * Math.sin(beatPhase / 0.15 * Math.PI); // contract
        } else if (beatPhase < 0.3) {
          s = 1.0 - 0.04 * Math.sin((beatPhase - 0.15) / 0.15 * Math.PI); // relax
        } else {
          s = 1.0;
        }
        heartGroup.scale.set(s, s, s);

        // Subtle color pulse on ventricles
        const pulse = Math.max(0, Math.sin(beatPhase * Math.PI * 2) * 0.15);
        if (parts.leftVentricle && !quizActive) {
          parts.leftVentricle.material.emissive.setRGB(pulse, 0, 0);
        }
        if (parts.rightVentricle && !quizActive) {
          parts.rightVentricle.material.emissive.setRGB(pulse * 0.5, 0, 0);
        }
      } else {
        heartGroup.scale.set(1, 1, 1);
      }

      // Blood flow particles
      if (bloodFlowMode) {
        const posArr = bloodSystem.geo.attributes.position.array;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          bloodSystem.offsets[i] += dt * speed * 0.15;
          if (bloodSystem.offsets[i] > 1) bloodSystem.offsets[i] -= 1;

          const isOxy = i >= PARTICLE_COUNT / 2;
          const path = isOxy ? oxyPath : deoxyPath;

          // If step mode, clamp particles to active step range
          let t = bloodSystem.offsets[i];
          if (stepFlowMode && stepFlowIndex > 0) {
            const step = FLOW_STEPS[stepFlowIndex - 1];
            const pathMatch = isOxy ? 'oxy' : 'deoxy';
            if (step.path === pathMatch) {
              t = step.t[0] + (t * (step.t[1] - step.t[0]));
            }
          }

          const pt = path.getPointAt(Math.max(0, Math.min(t, 0.999)));
          // Add slight random spread
          posArr[i * 3]     = pt.x + (Math.sin(i * 7.3 + elapsed) * 0.04);
          posArr[i * 3 + 1] = pt.y + (Math.cos(i * 5.1 + elapsed) * 0.04);
          posArr[i * 3 + 2] = pt.z + (Math.sin(i * 3.7 + elapsed) * 0.04);
        }
        bloodSystem.geo.attributes.position.needsUpdate = true;
      }

      // Update labels
      updateLabels();

      renderer.render(scene, camera);
    }

    // Hide loading screen and start
    setTimeout(() => {
      document.getElementById('heart3d-loading').style.display = 'none';
      animate();
    }, 500);

    /* ── Cleanup ───────────────────────────────────────────────── */
    return function cleanup() {
      alive = false;
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('click', onCanvasClick);
      renderer.dispose();
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      delete window._h3dStepFlow;
      delete window._h3dStartQuiz;
      delete window._h3dReset;
    };
  };
})();
