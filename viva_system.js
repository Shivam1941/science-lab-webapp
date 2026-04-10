window.VIVA_SYSTEM = (function() {
  let vivaOpen = false;
  let vivaIdx = 0;
  let vivaScore = 0;
  let currentQuestions = [];
  let onCompleteCallback = null;

  function init() {
    // Add CSS globally
    const style = document.createElement('style');
    style.innerHTML = `
      .glob-viva-ov { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
      .glob-viva-ov.hidden { display: none; }
      .glob-viva-mo { background: var(--bg-card, #111827); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; width: 90%; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden; color: var(--text-primary, #fff); font-family: 'Inter', sans-serif;}
      .glob-viva-hd { display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
      .glob-viva-body { padding: 20px; }
      .glob-vclose { background: none; border: none; color: #9ca3af; font-size: 20px; cursor: pointer; transition: color 0.2s; }
      .glob-vclose:hover { color: #fff; }
      .glob-vopt { width: 100%; text-align: left; padding: 12px 16px; margin-bottom: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--text-primary, #fff); cursor: pointer; transition: all 0.2s; font-size: 14px; font-family: 'Inter', sans-serif;}
      .glob-vopt:hover:not(:disabled) { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.3); }
      .glob-vopt:disabled { cursor: not-allowed; }
      .glob-big-btn { width: 100%; padding: 14px; background: #3b82f6; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; font-size: 14px; }
      .glob-big-btn:hover { background: #2563eb; }
    `;
    document.head.appendChild(style);

    // Add HTML globally
    const el = document.createElement('div');
    el.id = 'glob-viva-ov';
    el.className = 'glob-viva-ov hidden';
    el.innerHTML = `
      <div class="glob-viva-mo">
        <div class="glob-viva-hd">
          <span style="flex:1;font-size:16px;font-weight:700">🎓 Viva Mode</span>
          <span style="margin-right:12px;font-size:13px;color: #9ca3af;">Score: <b id="glob-vsc">0</b>/<span id="glob-vtot">0</span></span>
          <button class="glob-vclose" onclick="window.VIVA_SYSTEM.close()">✕</button>
        </div>
        <div class="glob-viva-body" id="glob-vbody"></div>
      </div>
    `;
    document.body.appendChild(el);
  }

  function open(questions, callback) {
    if(!document.getElementById('glob-viva-ov')) init();
    currentQuestions = questions;
    onCompleteCallback = callback;
    vivaOpen = true;
    vivaIdx = 0;
    vivaScore = 0;
    document.getElementById('glob-vtot').textContent = questions.length;
    document.getElementById('glob-vsc').textContent = 0;
    document.getElementById('glob-viva-ov').classList.remove('hidden');
    renderV();
  }

  function close() {
    vivaOpen = false;
    document.getElementById('glob-viva-ov').classList.add('hidden');
    if (vivaIdx >= currentQuestions.length && onCompleteCallback) {
        onCompleteCallback(vivaScore);
    }
  }

  function answer(c) {
    const q = currentQuestions[vivaIdx];
    if (c === q.ans) vivaScore++;
    document.getElementById('glob-vsc').textContent = vivaScore;
    q.opts.forEach((_, i) => {
      const b = document.getElementById('glob-vo' + i);
      b.disabled = true;
      if (i === q.ans) { b.style.borderColor = '#4ade80'; b.style.color = '#4ade80'; }
      else if (i === c) { b.style.borderColor = '#f87171'; b.style.color = '#f87171'; }
    });
    document.getElementById('glob-vnext').style.display = 'block';
    const e = document.getElementById('glob-vexp');
    e.style.display = 'block';
    e.innerHTML = (c === q.ans ? '✅ ' : '❌ ') + q.exp;
  }

  function next() {
    vivaIdx++;
    renderV();
  }

  function renderV() {
    const b = document.getElementById('glob-vbody');
    if (vivaIdx >= currentQuestions.length) {
      const p = Math.round((vivaScore / currentQuestions.length) * 100);
      b.innerHTML = \`<div style="text-align:center;padding:30px">
         <h1 style="font-size:36px;color: #fff; margin-bottom:10px">\${p}%</h1>
         <p style="color: #9ca3af; margin-bottom:20px">You scored \${vivaScore} out of \${currentQuestions.length}</p>
         <button class="glob-big-btn" onclick="window.VIVA_SYSTEM.close()">Close</button>
      </div>\`;
      return;
    }
    const q = currentQuestions[vivaIdx];
    b.innerHTML = \`
      <div style="font-size:11px;color: #6b7280; font-weight:600;margin-bottom:8px">Q\${vivaIdx + 1} of \${currentQuestions.length}</div>
      <div style="font-size:16px;font-weight:600;margin-bottom:16px;line-height:1.4;color:#fff">\${q.q}</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        \${q.opts.map((o, i) => \`<button class="glob-vopt" id="glob-vo\${i}" onclick="window.VIVA_SYSTEM.answer(\${i})">\${o}</button>\`).join('')}
      </div>
      <div id="glob-vexp" style="display:none;margin-top:12px;padding:10px;background:rgba(255,255,255,0.05);border-radius:6px;font-size:13px;line-height:1.5;color:#ddd;"></div>
      <button id="glob-vnext" class="glob-big-btn" style="display:none;margin-top:16px;width:100%" onclick="window.VIVA_SYSTEM.next()">Next Question →</button>
    \`;
  }

  return { open, close, answer, next };
})();
