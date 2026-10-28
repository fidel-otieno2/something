/* ═══ SERVICE WORKER ═══ */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

/* ═══ SPARKLE TRAIL ═══ */
const sparkleLayer = document.getElementById('sparkle-layer');
const STAR_CHARS = ['✦','✧','★','✨','💫','🌟'];

function spawnSparkle(x, y) {
  for (let i = 0; i < 5; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    const size = 4 + Math.random() * 8;
    s.style.cssText = `
      left:${x + (Math.random()-0.5)*30}px;
      top:${y + (Math.random()-0.5)*30}px;
      width:${size}px; height:${size}px;
      animation-duration:${.4+Math.random()*.5}s;
      animation-delay:${Math.random()*.15}s;
    `;
    sparkleLayer.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }
}

function spawnStarBurst(x, y) {
  for (let i = 0; i < 7; i++) {
    const s = document.createElement('span');
    s.className = 'star-particle';
    s.textContent = STAR_CHARS[Math.floor(Math.random()*STAR_CHARS.length)];
    const angle = (i / 7) * 360;
    const dist  = 30 + Math.random() * 50;
    const dx = Math.cos(angle * Math.PI/180) * dist;
    const dy = Math.sin(angle * Math.PI/180) * dist;
    s.style.cssText = `
      left:${x}px; top:${y}px;
      font-size:${.8+Math.random()*.8}rem;
      animation-duration:${.6+Math.random()*.4}s;
      transform: translate(${dx}px,${dy}px);
    `;
    sparkleLayer.appendChild(s);
    setTimeout(() => s.remove(), 1100);
  }
}

// Sparkle on every touch/click
document.addEventListener('pointermove', e => {
  if (Math.random() > 0.35) return;
  spawnSparkle(e.clientX, e.clientY);
});

document.addEventListener('pointerdown', e => {
  spawnStarBurst(e.clientX, e.clientY);
});

// Burst sparkles on every button tap
document.querySelectorAll('button, .btn-primary, .btn-ghost').forEach(btn => {
  btn.addEventListener('pointerdown', e => {
    const r = btn.getBoundingClientRect();
    spawnStarBurst(r.left + r.width/2, r.top + r.height/2);
  });
});

/* ═══ SCREEN ORDER & PROGRESS ═══ */
const SCREENS = [
  'screen-welcome','screen-why','screen-wanted','screen-facts',
  'screen-confessions','screen-moments','screen-letter','screen-quiz',
  'screen-rate','screen-opinion','screen-selfie','screen-game',
  'screen-scratch','screen-proposal','screen-yes','screen-maybe'
];
let currentScreen = 'screen-welcome';

function goTo(id) {
  const prev = document.getElementById(currentScreen);
  const next = document.getElementById(id);
  if (!next || id === currentScreen) return;

  prev.classList.add('exit');
  prev.classList.remove('active');
  setTimeout(() => prev.classList.remove('exit'), 500);

  next.classList.add('active');
  next.scrollTop = 0;
  currentScreen = id;

  updateProgress();
  if (id === 'screen-why')       initCardDots();
  if (id === 'screen-game')      startGame();
  if (id === 'screen-proposal')  burstProposalPetals();
  if (id === 'screen-yes')       launchConfetti();
  if (id === 'screen-quiz')      initQuiz();
  if (id === 'screen-scratch')   initScratch();

  // Disney entrance burst on every screen change
  setTimeout(() => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => spawnSparkle(cx + (Math.random()-0.5)*200, cy + (Math.random()-0.5)*300), i * 80);
    }
  }, 200);
}

function updateProgress() {
  const endScreens = ['screen-yes','screen-maybe'];
  if (endScreens.includes(currentScreen)) {
    document.getElementById('progress-fill').style.width = '100%';
    return;
  }
  const idx = SCREENS.indexOf(currentScreen);
  const total = SCREENS.length - 2; // exclude end screens
  const pct = Math.max(0, Math.min(100, (idx / (total - 1)) * 100));
  document.getElementById('progress-fill').style.width = pct + '%';
}

/* ═══ FLOATING PETALS ═══ */
const PETALS = ['🌸','🌺','🤍','✨','🌹'];
const layer  = document.getElementById('petals-layer');

function spawnPetal() {
  const el = document.createElement('span');
  el.className = 'petal';
  el.textContent = PETALS[Math.floor(Math.random() * PETALS.length)];
  el.style.left = Math.random() * 100 + 'vw';
  el.style.fontSize = (.8 + Math.random() * .8) + 'rem';
  const dur = 6 + Math.random() * 8;
  el.style.animationDuration = dur + 's';
  el.style.animationDelay = Math.random() * -dur + 's';
  layer.appendChild(el);
  setTimeout(() => el.remove(), (dur + 2) * 1000);
}
setInterval(spawnPetal, 1200);
for (let i = 0; i < 6; i++) spawnPetal();

/* ═══ CARD DOTS ═══ */
function initCardDots() {
  const track  = document.getElementById('cards-track');
  const dotsEl = document.getElementById('card-dots');
  const cards  = track.querySelectorAll('.why-card');
  dotsEl.innerHTML = '';
  cards.forEach((_, i) => {
    const d = document.createElement('span');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    dotsEl.appendChild(d);
  });
  const dots = dotsEl.querySelectorAll('.dot');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = +e.target.dataset.index;
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      }
    });
  }, { root: track, threshold: .6 });
  cards.forEach(c => observer.observe(c));
}

/* ═══ QUIZ ═══ */
const QUESTIONS = [
  {
    q: "What's Fidel's music taste?",
    opts: ["Only reggae 🎵","EDM and Pop 🎧","Classical piano 🎹","He hums to himself 🎶"],
    correct: 1,
    fun: "EDM and Pop! But he's been secretly adding reggae to his playlist... for research purposes. 👀"
  },
  {
    q: "What did Fidel do after your first call?",
    opts: ["Went straight to sleep 😴","Couldn't stop smiling 😁","Called his mum 📞","Ate a whole meal 🍽️"],
    correct: 1,
    fun: "He couldn't stop smiling. For a very long time. His face hurt. He didn't mind. 🥹"
  },
  {
    q: "How did Fidel describe Florence?",
    opts: ["In a short text 💬","In a paragraph that made her say 'Damn 😝🙈'","In a voice note 🎤","He drew a picture 🎨"],
    correct: 1,
    fun: "In a paragraph. And you said it was the first time anyone described you like that. He still thinks about that. 🤍"
  },
  {
    q: "What is Fidel studying?",
    opts: ["Medicine 🏥","IT 💻","Law ⚖️","Architecture 🏗️"],
    correct: 1,
    fun: "IT! Which is why he built you a whole app instead of just texting. This is what IT students do with their feelings. 😭"
  },
  {
    q: "What does Fidel want most right now?",
    opts: ["A new phone 📱","To meet Florence in person 🥹","A good night's sleep 😴","Free WiFi 📶"],
    correct: 1,
    fun: "To meet you. In person. Just once. To see if you're as wonderful as he already knows you are. 🌸"
  }
];

let quizIndex = 0;
let quizScore = 0;

function initQuiz() {
  quizIndex = 0;
  quizScore = 0;
  document.getElementById('quiz-result').style.display = 'none';
  renderQuestion();
}

function renderQuestion() {
  const container = document.getElementById('quiz-container');
  if (quizIndex >= QUESTIONS.length) {
    showQuizResult();
    return;
  }
  const q = QUESTIONS[quizIndex];
  container.innerHTML = `
    <div class="quiz-card">
      <p class="quiz-progress">${quizIndex + 1} / ${QUESTIONS.length}</p>
      <p class="quiz-q">${q.q}</p>
      <div class="quiz-opts">
        ${q.opts.map((o, i) => `<button class="quiz-opt" onclick="answerQuiz(${i})">${o}</button>`).join('')}
      </div>
    </div>
  `;
}

function answerQuiz(chosen) {
  const q = QUESTIONS[quizIndex];
  const opts = document.querySelectorAll('.quiz-opt');
  opts.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
    else if (i === chosen) btn.classList.add('wrong');
  });
  if (chosen === q.correct) quizScore++;

  const feedback = document.createElement('div');
  feedback.className = 'quiz-feedback';
  feedback.textContent = q.fun;
  document.querySelector('.quiz-card').appendChild(feedback);

  setTimeout(() => {
    quizIndex++;
    renderQuestion();
  }, 2200);
}

function showQuizResult() {
  document.getElementById('quiz-container').innerHTML = '';
  const res = document.getElementById('quiz-result');
  res.style.display = 'block';
  const msgs = [
    { min: 5, text: "5/5! Florence, you've been paying attention. 🥹 Fidel is emotional right now." },
    { min: 3, text: `${quizScore}/5! Not bad at all. Fidel is impressed and slightly nervous. 🌸` },
    { min: 1, text: `${quizScore}/5. That's okay — you'll learn more about him. He's not going anywhere. 🤍` },
    { min: 0, text: "0/5?! Florence... 😭 Fidel is fine. He's fine. (He's not fine.)" }
  ];
  const msg = msgs.find(m => quizScore >= m.min);
  res.innerHTML = `
    <div class="quiz-result-card">
      <p class="quiz-score-big">${quizScore} / ${QUESTIONS.length}</p>
      <p class="quiz-result-msg">${msg.text}</p>
      <button class="btn-primary mt-lg" onclick="goTo('screen-rate')">Next →</button>
    </div>
  `;
}

/* ═══ RATE FIDEL ═══ */
const REACTIONS = {
  1:  { emoji: '😭', text: "1?! Florence... Fidel is on the floor. He needs a moment." },
  2:  { emoji: '😢', text: "A 2. Fidel is writing sad poetry right now." },
  3:  { emoji: '😬', text: "3. Okay. There's room to grow. Fidel is taking notes." },
  4:  { emoji: '😅', text: "4. Fidel is sweating but still smiling. Barely." },
  5:  { emoji: '😐', text: "5. A solid middle. Fidel is nervously sweating." },
  6:  { emoji: '🙂', text: "6! Okay okay. Fidel will take it. Progress." },
  7:  { emoji: '😊', text: "7! Fidel just did a little happy dance. Don't tell anyone." },
  8:  { emoji: '😄', text: "8!! Fidel is grinning. Widely. Embarrassingly." },
  9:  { emoji: '🥰', text: "9!!! Fidel is floating. He's going to screenshot this." },
  10: { emoji: '🤩', text: "10!!! FLORENCE. Fidel has left the building. He's too happy." }
};

function updateRating(val) {
  document.getElementById('rate-display').textContent = val;
  document.getElementById('rate-emoji').textContent = REACTIONS[val].emoji;
  document.getElementById('rate-reaction').textContent = REACTIONS[val].text;
}

function submitRating() {
  const val = document.getElementById('rate-slider').value;
  document.getElementById('form-rating-val').value = `Florence rated Fidel ${val}/10 ${REACTIONS[val].emoji}`;
  silentSubmit('form-rating');
  goTo('screen-opinion');
}

/* ═══ OPINION ═══ */
document.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('opinion-text');
  if (ta) {
    ta.addEventListener('input', () => {
      document.getElementById('char-count').textContent = ta.value.length + ' / 500';
    });
  }
});

function submitOpinion() {
  const val = document.getElementById('opinion-text').value.trim();
  if (!val) { goTo('screen-selfie'); return; }
  document.getElementById('form-opinion-val').value = val;
  silentSubmit('form-opinion');
  goTo('screen-selfie');
}

/* ═══ SELFIE ═══ */
function handleSelfie(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('selfie-preview');
    const placeholder = document.getElementById('selfie-placeholder');
    const overlay = document.getElementById('selfie-overlay');
    preview.src = e.target.result;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
    overlay.style.display = 'flex';
    document.getElementById('selfie-frame').classList.add('has-photo');
    setTimeout(() => goTo('screen-game'), 1200);
  };
  reader.readAsDataURL(file);
}

/* ═══ HEART CATCH GAME ═══ */
let gameScore = 0, gameRunning = false, gameInterval = null;

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  gameScore = 0;
  const arena = document.getElementById('game-arena');
  arena.innerHTML = '<div id="game-score-display">0 / 7</div>';
  updateScore();
  gameInterval = setInterval(() => { if (gameRunning) spawnFallingHeart(arena); }, 900);
}

function spawnFallingHeart(arena) {
  const heart = document.createElement('span');
  heart.className = 'falling-heart';
  heart.textContent = ['🤍','💗','💖','💝','🌸'][Math.floor(Math.random() * 5)];
  heart.style.left = (10 + Math.random() * 75) + '%';
  const dur = 2.2 + Math.random() * 1.8;
  heart.style.animationDuration = dur + 's';
  arena.appendChild(heart);
  heart.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (!gameRunning) return;
    heart.style.transform = 'scale(2)';
    heart.style.opacity = '0';
    heart.style.transition = 'all .25s';
    gameScore++;
    updateScore();
    setTimeout(() => heart.remove(), 300);
    if (gameScore >= 7) endGame();
  });
  setTimeout(() => heart.remove(), dur * 1000 + 200);
}

function updateScore() {
  const el = document.getElementById('game-score-display');
  if (el) el.textContent = gameScore + ' / 7';
}

function endGame() {
  gameRunning = false;
  clearInterval(gameInterval);
  const arena = document.getElementById('game-arena');
  arena.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:var(--serif);font-size:1.5rem;color:var(--rose);padding:20px;text-align:center;">You caught them all 🤍<br/>Just like you caught his attention.</div>';
  setTimeout(() => goTo('screen-scratch'), 2200);
}

/* ═══ SCRATCH CARD ═══ */
function initScratch() {
  const canvas = document.getElementById('scratch-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  ctx.fillStyle = '#c9748a';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let i = 0; i < 8; i++) {
    ctx.font = '1.4rem serif';
    ctx.fillText('🌸', Math.random() * W, Math.random() * H);
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 1rem Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✦ Scratch here ✦', W / 2, H / 2 - 8);
  ctx.font = '0.85rem Inter, sans-serif';
  ctx.fillText('Use your finger 🤍', W / 2, H / 2 + 18);

  ctx.globalCompositeOperation = 'destination-out';
  let scratching = false;

  function scratch(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    checkReveal(ctx, W, H);
  }

  canvas.addEventListener('pointerdown', e => { scratching = true; scratch(...getPos(e, canvas)); });
  canvas.addEventListener('pointermove', e => { if (scratching) scratch(...getPos(e, canvas)); });
  canvas.addEventListener('pointerup', () => { scratching = false; });
  canvas.addEventListener('pointerleave', () => { scratching = false; });
}

function getPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return [(e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY];
}

let revealed = false;
function checkReveal(ctx, W, H) {
  if (revealed) return;
  const data = ctx.getImageData(0, 0, W, H).data;
  let transparent = 0;
  for (let i = 3; i < data.length; i += 4) { if (data[i] < 128) transparent++; }
  if (transparent / (W * H) > 0.55) revealScratch();
}

function revealScratch() {
  if (revealed) return;
  revealed = true;
  const canvas = document.getElementById('scratch-canvas');
  if (canvas) {
    canvas.style.transition = 'opacity .6s';
    canvas.style.opacity = '0';
    setTimeout(() => { canvas.style.display = 'none'; }, 600);
  }
  const skip = document.getElementById('scratch-skip');
  if (skip) skip.textContent = 'Continue →';
}

/* ═══ PROPOSAL PETALS ═══ */
function burstProposalPetals() {
  const container = document.getElementById('proposal-petals');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('span');
    p.textContent = ['🌸','🌺','✨','🤍'][i % 4];
    p.style.cssText = `position:absolute;font-size:${1+Math.random()}rem;left:${Math.random()*100}%;top:${Math.random()*100}%;animation:petalFall ${4+Math.random()*4}s linear infinite;animation-delay:${Math.random()*-4}s;opacity:.5;pointer-events:none;`;
    container.appendChild(p);
  }
}

/* ═══ ANSWER HANDLER ═══ */
function handleAnswer(type) {
  silentSubmit(type === 'yes' ? 'form-yes' : 'form-maybe');
  goTo(type === 'yes' ? 'screen-yes' : 'screen-maybe');
}

function silentSubmit(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
  }).catch(() => {});
}

/* ═══ CONFETTI ═══ */
function launchConfetti() {
  const colors = ['#c9748a','#c9a84c','#f48fb1','#fff','#8b3a52','#fce4ec'];
  for (let i = 0; i < 100; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `left:${Math.random()*100}vw;background:${colors[Math.floor(Math.random()*colors.length)]};width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;border-radius:${Math.random()>.5?'50%':'2px'};animation-duration:${2+Math.random()*2.5}s;animation-delay:${Math.random()*1.5}s;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }
}

/* ═══ MUSIC ═══ */
const musicBtn = document.getElementById('music-btn');
const bgMusic  = document.getElementById('bg-music');
let isPlaying  = false;

musicBtn.addEventListener('click', () => {
  if (isPlaying) {
    bgMusic.pause();
    musicBtn.classList.remove('playing');
  } else {
    bgMusic.play().catch(() => {});
    musicBtn.classList.add('playing');
  }
  isPlaying = !isPlaying;
});

document.addEventListener('click', () => {
  if (!isPlaying && bgMusic.paused && bgMusic.readyState > 0) {
    bgMusic.play().then(() => { isPlaying = true; musicBtn.classList.add('playing'); }).catch(() => {});
  }
}, { once: true });
