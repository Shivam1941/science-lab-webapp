/* ============================================================
   GAMIFICATION ENGINE: Lab Master Rank System
   ============================================================ */

const RANKS = [
  { level: 1, title: 'Beginner Scientist', xpRequired: 0, icon: '🎓', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  { level: 2, title: 'Lab Assistant', xpRequired: 200, icon: '🧪', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  { level: 3, title: 'Experimenter', xpRequired: 500, icon: '🔥', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  { level: 4, title: 'Research Scholar', xpRequired: 1000, icon: '🔬', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' },
  { level: 5, title: 'Lab Master', xpRequired: 2000, icon: '🔮', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
  { level: 6, title: 'Grand Scientist', xpRequired: 5000, icon: '👑', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' }
];

const BADGES_DB = [
  { id: 'first_discovery', name: 'First Discovery', icon: '🌟', condition: (p) => p.exps >= 1, desc: 'Complete your first experiment.' },
  { id: 'lab_explorer', name: 'Lab Explorer', icon: '🧭', condition: (p) => p.exps >= 10, desc: 'Complete 10 experiments.' },
  { id: 'research_mind', name: 'Research Mind', icon: '🧠', condition: (p) => p.exps >= 25, desc: 'Complete 25 experiments.' },
  { id: 'science_champ', name: 'Science Champion', icon: '🏆', condition: (p) => p.exps >= 50, desc: 'Complete 50 experiments.' },
  { id: 'sharp_scientist', name: 'Sharp Scientist', icon: '⚡', condition: (p) => p.xp >= 1000, desc: 'Earn 1000 Total XP.' }
];

let playerState = {
  xp: 0,
  exps: 0,
  completedExpIds: [],
  badges: [],
  rankIndex: 0
};

// ── Initialize State ─────────────────────────────────────────
function initGamification() {
  const saved = localStorage.getItem('lab_master_state');
  if (saved) {
    try {
      playerState = { ...playerState, ...JSON.parse(saved) };
    } catch (e) {}
  }
  updateRankData();
  renderDashboardRankCard();
}

function saveState() {
  localStorage.setItem('lab_master_state', JSON.stringify(playerState));
}

// ── Core Logic ───────────────────────────────────────────────
function updateRankData() {
  let newRankIdx = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (playerState.xp >= RANKS[i].xpRequired) {
      newRankIdx = i;
      break;
    }
  }

  if (newRankIdx > playerState.rankIndex) {
    playerState.rankIndex = newRankIdx;
    triggerRankUpCelebration(RANKS[newRankIdx]);
  }
}

function awardXP(amount, reason = "Bonus XP") {
  playerState.xp += amount;
  updateRankData();
  checkBadges();
  saveState();
  renderDashboardRankCard();
  
  // Show mini-toast
  showXPToast(`+${amount} XP (${reason})`);
}

function experimentCompleted(expId) {
  if (!playerState.completedExpIds.includes(expId)) {
    playerState.completedExpIds.push(expId);
    playerState.exps++;
    
    // Core rewards + randomized bonuses to simulate "No Hint" / "Perfect observation"
    let xpGain = 50; 
    let reasons = ["Experiment Complete"];
    
    if (Math.random() > 0.4) {
      xpGain += 30;
      reasons.push("Perfect Observation");
    }
    if (Math.random() > 0.5) {
      xpGain += 20;
      reasons.push("No Hints Used");
    }

    awardXP(xpGain, reasons.join(", "));
  }
}

function checkBadges() {
  let newBadge = false;
  BADGES_DB.forEach(badge => {
    if (!playerState.badges.includes(badge.id) && badge.condition(playerState)) {
      playerState.badges.push(badge.id);
      newBadge = true;
      showBadgeToast(badge);
    }
  });
  if (newBadge) saveState();
}

// ── UI Rendering ─────────────────────────────────────────────
function renderDashboardRankCard() {
  const cardContainer = document.getElementById('dashboard-rank-container');
  if (!cardContainer) return;

  const currentRank = RANKS[playerState.rankIndex];
  const nextRank = RANKS[Math.min(playerState.rankIndex + 1, RANKS.length - 1)];
  const isMaxRank = playerState.rankIndex === RANKS.length - 1;

  let progressPercent = 100;
  let xpText = `${playerState.xp} XP`;
  
  if (!isMaxRank) {
    const xpIntoLevel = playerState.xp - currentRank.xpRequired;
    const levelSize = nextRank.xpRequired - currentRank.xpRequired;
    progressPercent = Math.max(0, Math.min(100, (xpIntoLevel / levelSize) * 100));
    xpText = `${playerState.xp} / ${nextRank.xpRequired} XP`;
  }

  cardContainer.innerHTML = `
    <div class="rank-card glass-card" onclick="navigateTo('profile')" style="cursor: pointer;">
      <div class="rank-card-header">
        <div class="rank-icon-wrap" style="background:${currentRank.bg}; color:${currentRank.color}; box-shadow: 0 0 20px ${currentRank.bg}">
          ${currentRank.icon}
        </div>
        <div class="rank-info">
          <div class="rank-label" style="color:var(--text-secondary); font-size: 13px; font-weight: 600; text-transform:uppercase; letter-spacing:1px; margin-bottom: 4px;">Current Rank</div>
          <div class="rank-title" style="color:${currentRank.color};">${currentRank.title}</div>
        </div>
        <div class="rank-action-icon" style="margin-left: auto; color: var(--text-muted); font-size: 20px;">👤</div>
      </div>
      <div class="rank-progress-section">
        <div class="rank-progress-labels">
          <span class="rank-xp-text" style="color:${currentRank.color}">${xpText}</span>
          <span class="rank-percent-text" style="color:${currentRank.color}">${Math.floor(progressPercent)}%</span>
        </div>
        <div class="rank-progress-track" style="background: rgba(255,255,255,0.05); overflow: hidden;">
          <div class="rank-progress-fill" style="width: ${progressPercent}%; background: linear-gradient(90deg, ${currentRank.color}33, ${currentRank.color}); box-shadow: 0 0 12px ${currentRank.color}66;"></div>
        </div>
      </div>
      </div>
      ${playerState.badges.length > 0 ? `
      <div class="rank-latest-badge" style="margin-top: 16px; display:flex; align-items:center; gap: 8px; font-size: 13px; color: var(--text-secondary); padding-top: 16px; border-top: 1px solid var(--border-glass);">
         <span>Latest Badge:</span> 
         <span style="background:rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 100px; display:flex; gap:6px; border: 1px solid var(--border-glass);">
           ${BADGES_DB.find(b => b.id === playerState.badges[playerState.badges.length-1])?.icon} 
           ${BADGES_DB.find(b => b.id === playerState.badges[playerState.badges.length-1])?.name}
         </span>
      </div>` : ''}
    </div>
  `;
}

function renderProfilePage() {
  const profileContainer = document.getElementById('profile-content');
  if (!profileContainer) return;

  const currentRank = RANKS[playerState.rankIndex];
  const nextRank = RANKS[Math.min(playerState.rankIndex + 1, RANKS.length - 1)];
  const isMaxRank = playerState.rankIndex === RANKS.length - 1;

  let progressPercent = 100;
  if (!isMaxRank) {
    progressPercent = ((playerState.xp - currentRank.xpRequired) / (nextRank.xpRequired - currentRank.xpRequired)) * 100;
  }

  // Generate badges html
  const badgesHtml = BADGES_DB.map(b => {
    const unlocked = playerState.badges.includes(b.id);
    return `
      <div class="profile-badge-card ${unlocked ? 'unlocked' : 'locked'}">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-name">${b.name}</div>
        <div class="badge-desc">${b.desc}</div>
      </div>
    `;
  }).join('');

  profileContainer.innerHTML = `
    <div class="profile-glass-header glass-card">
      <div class="profile-avatar-wrap" style="background:${currentRank.bg}; color:${currentRank.color}; box-shadow: 0 0 30px ${currentRank.bg}">
        ${currentRank.icon}
      </div>
      <div class="profile-header-info">
        <h1 class="profile-name">Student Researcher</h1>
        <div class="profile-rank-title" style="color:${currentRank.color}; font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700;">${currentRank.title}</div>
      </div>
    </div>

    <div class="profile-stats-grid">
      <div class="glass-card stat-box">
        <div class="stat-box-title">Total XP</div>
        <div class="stat-box-val" style="color:var(--physics-primary);">${playerState.xp}</div>
      </div>
      <div class="glass-card stat-box">
        <div class="stat-box-title">Experiments Done</div>
        <div class="stat-box-val" style="color:var(--biology-primary);">${playerState.exps}</div>
      </div>
      <div class="glass-card stat-box">
        <div class="stat-box-title">Badges Earned</div>
        <div class="stat-box-val" style="color:var(--chemistry-primary);">${playerState.badges.length} / ${BADGES_DB.length}</div>
      </div>
    </div>

    <div class="profile-progression glass-card">
      <h3 style="font-family:'Space Grotesk', sans-serif; margin-bottom: 20px;">Rank Progression</h3>
      <div class="rank-progress-labels">
          <span class="rank-xp-text" style="color:${currentRank.color}">${currentRank.title}</span>
          <span class="rank-percent-text" style="color: var(--text-muted)">${isMaxRank ? 'MAX RANK' : 'Next: ' + nextRank.title}</span>
      </div>
      <div class="rank-progress-track" style="height: 12px; margin-top: 8px; background: rgba(255,255,255,0.05); overflow: hidden; border-radius: 100px;">
        <div class="rank-progress-fill" style="width: ${progressPercent}%; background: linear-gradient(90deg, ${currentRank.color}33, ${currentRank.color}); box-shadow: 0 0 15px ${currentRank.color}66; height: 100%; border-radius: 100px; transition: width 0.5s ease;"></div>
      </div>
    </div>

    <div class="section-label" style="margin-top: 40px;">Achievement Badges</div>
    <div class="badges-grid">
      ${badgesHtml}
    </div>

    <div class="section-label" style="margin-top: 40px;">Global Leaderboard</div>
    <div class="leaderboard-card glass-card">
       ${generateMockLeaderboard()}
    </div>
  `;
}

// ── Visual FX & Toasts ───────────────────────────────────────
function triggerRankUpCelebration(rank) {
  if (typeof confetti === 'function') {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: [rank.color, '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: [rank.color, '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }

  // Create Popup Modal
  const modal = document.createElement('div');
  modal.className = 'rankup-modal-overlay';
  modal.innerHTML = `
    <div class="rankup-modal-content glass-card" style="text-align: center; border-color: ${rank.color}; box-shadow: 0 0 50px ${rank.bg};">
      <h2 style="font-family:'Space Grotesk', sans-serif; font-size: 28px; margin-bottom: 8px;">Rank Up!</h2>
      <p style="color: var(--text-secondary); margin-bottom: 30px;">You are now a...</p>
      <div style="font-size: 80px; margin-bottom: 20px; animation: pop 0.5s ease cubic-bezier(0.175, 0.885, 0.32, 1.275);">${rank.icon}</div>
      <h1 style="font-family:'Space Grotesk', sans-serif; font-size: 36px; color: ${rank.color}; margin-bottom: 30px;">${rank.title}</h1>
      <button class="resume-btn" onclick="this.parentElement.parentElement.remove()" style="background:${rank.color}">Awesome!</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function showXPToast(text) {
  const toast = document.createElement('div');
  toast.className = 'xp-toast';
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function showBadgeToast(badge) {
  const toast = document.createElement('div');
  toast.className = 'badge-toast glass-card';
  toast.innerHTML = `
    <div style="font-size: 24px;">${badge.icon}</div>
    <div>
      <div style="font-weight:600; font-size: 14px; margin-bottom:2px;">Badge Unlocked!</div>
      <div style="font-size: 13px; color:var(--text-secondary);">${badge.name}</div>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function generateMockLeaderboard() {
  const mockNames = ["Aarav Patel", "Neha Sharma", "Rohan Verma", "Priya Singh", "Kavya Iyer", "Ananya Reddy"];
  const isMe = "Student Researcher";
  let entries = [...mockNames];
  // Insert player randomly into the top 5
  entries.splice(Math.floor(Math.random() * 4) + 1, 0, isMe);
  
  let html = `<table class="leaderboard-table">
    <thead>
      <tr>
        <th width="10%">Rank</th>
        <th width="50%">Scientist</th>
        <th width="20%">Level</th>
        <th width="20%">XP</th>
      </tr>
    </thead>
    <tbody>`;

  let baseXP = 3200;
  entries.forEach((name, i) => {
    let xp = name === isMe ? playerState.xp : Math.floor(baseXP - (i * 300) + Math.random() * 100);
    // Find rank title for xp
    let rankT = 'Beginner Scientist';
    for (let r = RANKS.length - 1; r >= 0; r--) {
        if (xp >= RANKS[r].xpRequired) { rankT = RANKS[r].title; break; }
    }

    const hl = name === isMe ? 'class="lb-me"' : '';
    html += `
      <tr ${hl}>
        <td style="font-weight:700; color:var(--text-muted);">#${i+1}</td>
        <td style="font-weight:500;">${name}</td>
        <td style="color:var(--text-secondary); font-size:13px;">${rankT}</td>
        <td style="font-family:'JetBrains Mono', monospace; color:var(--physics-primary);">${xp}</td>
      </tr>
    `;
  });
  
  html += `</tbody></table>`;
  return html;
}

// ── Export / Init Event ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', initGamification);
