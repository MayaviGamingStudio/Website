/**
 * SNAKE — Game Engine
 * MayaviStudio · ARCADE VOID
 * v1.0
 */

'use strict';

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────
const CELL        = 20;        // px per grid cell
const COLS        = 25;        // grid columns
const ROWS        = 25;        // grid rows
const CANVAS_W    = CELL * COLS;
const CANVAS_H    = CELL * ROWS;

const SPEEDS = {
  slow:   200,   // ms per tick
  normal: 130,
  fast:   75,
};

const COLORS = {
  bg:         '#000000',
  gridLine:   'rgba(245,196,0,0.05)',
  head:       '#ffe866',
  headGlow:   'rgba(255,232,102,0.6)',
  body:       '#f5c400',
  bodyDim:    '#a88800',
  tail:       '#6b5700',
  food:       '#ffaa00',
  foodGlow:   'rgba(255,170,0,0.5)',
  wallFlash:  'rgba(255,0,0,0.25)',
  text:       '#f5c400',
  textDim:    '#a88800',
};

// ─────────────────────────────────────────────
//  Canvas setup
// ─────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
canvas.width  = CANVAS_W;
canvas.height = CANVAS_H;

// ─────────────────────────────────────────────
//  Game state
// ─────────────────────────────────────────────
let snake, dir, nextDir, food, score, highScore, level, gameLoop, state, speed, wallFlash, foodPulse;

const STATE = { IDLE: 'idle', PLAYING: 'playing', PAUSED: 'paused', DEAD: 'dead' };

// ─────────────────────────────────────────────
//  DOM refs
// ─────────────────────────────────────────────
const elScore      = document.getElementById('score');
const elHighscore  = document.getElementById('highscore');
const elLevel      = document.getElementById('level');
const elLength     = document.getElementById('length');
const elFinalScore = document.getElementById('final-score');
const elNewBest    = document.getElementById('new-best-line');

const overlayStart    = document.getElementById('overlay-start');
const overlayPause    = document.getElementById('overlay-pause');
const overlayGameover = document.getElementById('overlay-gameover');

const btnStart   = document.getElementById('btn-start');
const btnResume  = document.getElementById('btn-resume');
const btnRestart = document.getElementById('btn-restart');

const speedBtns  = document.querySelectorAll('.speed-btn');

// ─────────────────────────────────────────────
//  Initialise / Reset
// ─────────────────────────────────────────────
function init() {
  const midX = Math.floor(COLS / 2);
  const midY = Math.floor(ROWS / 2);

  snake   = [
    { x: midX,     y: midY },
    { x: midX - 1, y: midY },
    { x: midX - 2, y: midY },
  ];

  dir     = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score   = 0;
  level   = 1;
  wallFlash = 0;
  foodPulse = 0;

  spawnFood();
  updateHUD();
}

// ─────────────────────────────────────────────
//  Food
// ─────────────────────────────────────────────
function spawnFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  food = pos;
}

// ─────────────────────────────────────────────
//  Game tick
// ─────────────────────────────────────────────
function tick() {
  dir = { ...nextDir };

  const head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y,
  };

  // Wall collision
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    die(); return;
  }

  // Self collision (skip last segment — it moves away)
  for (let i = 0; i < snake.length - 1; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) { die(); return; }
  }

  snake.unshift(head);

  // Eat food
  if (head.x === food.x && head.y === food.y) {
    eatFood();
  } else {
    snake.pop();
  }

  foodPulse = (foodPulse + 0.15) % (Math.PI * 2);
  draw();
  updateHUD();
}

function eatFood() {
  score += 10 * level;
  if (score > highScore) highScore = score;

  // Level up every 5 food
  const eaten = Math.floor((snake.length - 3) / 1);
  const newLevel = Math.floor(eaten / 5) + 1;
  if (newLevel > level) {
    level = newLevel;
    adjustSpeed();
  }

  spawnFood();
  animateScore();
}

function animateScore() {
  elScore.classList.remove('score-pop');
  void elScore.offsetWidth;
  elScore.classList.add('score-pop');
}

function adjustSpeed() {
  // Level increases base speed by 10ms per level, capped
  const base = SPEEDS[speed] || SPEEDS.normal;
  const adjusted = Math.max(base - (level - 1) * 8, 50);
  clearInterval(gameLoop);
  gameLoop = setInterval(tick, adjusted);
}

function die() {
  state = STATE.DEAD;
  clearInterval(gameLoop);
  wallFlash = 8;

  // Flash animation then show overlay
  let flashes = 0;
  const flashInterval = setInterval(() => {
    wallFlash = flashes % 2 === 0 ? 8 : 0;
    draw();
    flashes++;
    if (flashes >= 6) {
      clearInterval(flashInterval);
      showOverlay('gameover');
    }
  }, 80);
}

// ─────────────────────────────────────────────
//  Drawing
// ─────────────────────────────────────────────
function draw() {
  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  drawGrid();
  drawFood();
  drawSnake();

  // Wall flash on death
  if (wallFlash > 0) {
    ctx.fillStyle = COLORS.wallFlash;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }
}

function drawGrid() {
  ctx.strokeStyle = COLORS.gridLine;
  ctx.lineWidth = 0.5;

  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL, 0);
    ctx.lineTo(x * CELL, CANVAS_H);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL);
    ctx.lineTo(CANVAS_W, y * CELL);
    ctx.stroke();
  }
}

function drawFood() {
  const pulse = 0.7 + 0.3 * Math.sin(foodPulse);
  const fx = food.x * CELL + CELL / 2;
  const fy = food.y * CELL + CELL / 2;
  const r  = (CELL / 2 - 3) * pulse;

  // Glow
  const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, CELL);
  grad.addColorStop(0, COLORS.foodGlow);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(fx, fy, CELL, 0, Math.PI * 2);
  ctx.fill();

  // Core
  ctx.fillStyle = COLORS.food;
  ctx.beginPath();
  ctx.arc(fx, fy, r, 0, Math.PI * 2);
  ctx.fill();

  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.arc(fx - r * 0.25, fy - r * 0.25, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake() {
  const len = snake.length;

  snake.forEach((seg, i) => {
    const x = seg.x * CELL;
    const y = seg.y * CELL;
    const pad = 1;

    if (i === 0) {
      // Head
      const gx = x + CELL / 2;
      const gy = y + CELL / 2;

      // Glow
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, CELL);
      g.addColorStop(0, COLORS.headGlow);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(x - CELL / 2, y - CELL / 2, CELL * 2, CELL * 2);

      // Head body
      ctx.fillStyle = COLORS.head;
      roundRect(ctx, x + pad, y + pad, CELL - pad * 2, CELL - pad * 2, 4);
      ctx.fill();

      // Eyes
      drawEyes(seg, dir);

    } else {
      // Body gradient from bright to dim toward tail
      const t = i / (len - 1);
      ctx.fillStyle = lerpColor(COLORS.body, COLORS.tail, t);
      roundRect(ctx, x + pad, y + pad, CELL - pad * 2, CELL - pad * 2, 3);
      ctx.fill();

      // Body shine
      if (i < 4) {
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        roundRect(ctx, x + pad + 2, y + pad + 2, (CELL - pad * 2) * 0.5, 3, 1);
        ctx.fill();
      }
    }
  });
}

function drawEyes(head, d) {
  const cx = head.x * CELL + CELL / 2;
  const cy = head.y * CELL + CELL / 2;

  let e1, e2;
  const o = 4;
  const forward = 3;

  if      (d.x === 1)  { e1 = {x: cx+forward, y: cy-o}; e2 = {x: cx+forward, y: cy+o}; }
  else if (d.x === -1) { e1 = {x: cx-forward, y: cy-o}; e2 = {x: cx-forward, y: cy+o}; }
  else if (d.y === -1) { e1 = {x: cx-o, y: cy-forward}; e2 = {x: cx+o, y: cy-forward}; }
  else                 { e1 = {x: cx-o, y: cy+forward}; e2 = {x: cx+o, y: cy+forward}; }

  ctx.fillStyle = '#000';
  [e1, e2].forEach(e => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(e.x - 0.5, e.y - 0.5, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
  });
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function lerpColor(a, b, t) {
  const ah = a.replace('#','');
  const bh = b.replace('#','');
  const ar = parseInt(ah.substring(0,2),16);
  const ag = parseInt(ah.substring(2,4),16);
  const ab = parseInt(ah.substring(4,6),16);
  const br = parseInt(bh.substring(0,2),16);
  const bg = parseInt(bh.substring(2,4),16);
  const bb = parseInt(bh.substring(4,6),16);
  const r = Math.round(ar + (br-ar)*t).toString(16).padStart(2,'0');
  const g = Math.round(ag + (bg-ag)*t).toString(16).padStart(2,'0');
  const bl= Math.round(ab + (bb-ab)*t).toString(16).padStart(2,'0');
  return `#${r}${g}${bl}`;
}

function updateHUD() {
  elScore.textContent     = score;
  elHighscore.textContent = highScore;
  elLevel.textContent     = level;
  elLength.textContent    = snake.length;
}

// ─────────────────────────────────────────────
//  Overlay management
// ─────────────────────────────────────────────
function showOverlay(which) {
  overlayStart.classList.add('hidden');
  overlayPause.classList.add('hidden');
  overlayGameover.classList.add('hidden');

  if (which === 'start')    overlayStart.classList.remove('hidden');
  if (which === 'pause')    overlayPause.classList.remove('hidden');
  if (which === 'gameover') {
    elFinalScore.textContent = score;
    elNewBest.style.display = score >= highScore && score > 0 ? 'block' : 'none';
    overlayGameover.classList.remove('hidden');
  }
}

function hideOverlays() {
  overlayStart.classList.add('hidden');
  overlayPause.classList.add('hidden');
  overlayGameover.classList.add('hidden');
}

// ─────────────────────────────────────────────
//  Game control
// ─────────────────────────────────────────────
function startGame() {
  init();
  state = STATE.PLAYING;
  hideOverlays();
  speed = getActiveSpeed();
  gameLoop = setInterval(tick, SPEEDS[speed]);
  draw();
}

function pauseGame() {
  if (state !== STATE.PLAYING) return;
  state = STATE.PAUSED;
  clearInterval(gameLoop);
  showOverlay('pause');
}

function resumeGame() {
  if (state !== STATE.PAUSED) return;
  state = STATE.PLAYING;
  hideOverlays();
  gameLoop = setInterval(tick, SPEEDS[getActiveSpeed()]);
}

function getActiveSpeed() {
  const btn = document.querySelector('.speed-btn.active');
  return btn ? btn.dataset.speed : 'normal';
}

// ─────────────────────────────────────────────
//  Input
// ─────────────────────────────────────────────
const DIR_MAP = {
  ArrowUp:    { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
  ArrowDown:  { x: 0, y:  1 }, s: { x: 0, y:  1 }, S: { x: 0, y:  1 },
  ArrowLeft:  { x:-1, y:  0 }, a: { x:-1, y:  0 }, A: { x:-1, y:  0 },
  ArrowRight: { x: 1, y:  0 }, d: { x: 1, y:  0 }, D: { x: 1, y:  0 },
};

document.addEventListener('keydown', (e) => {
  const key = e.key;

  // Direction
  const newDir = DIR_MAP[key];
  if (newDir) {
    e.preventDefault();
    // Prevent reversing
    if (newDir.x !== -dir.x || newDir.y !== -dir.y) {
      nextDir = newDir;
    }
    // Start on first key press if idle
    if (state === STATE.IDLE) startGame();
    return;
  }

  // Pause
  if (key === 'p' || key === 'P') {
    if (state === STATE.PLAYING) pauseGame();
    else if (state === STATE.PAUSED) resumeGame();
    return;
  }

  // Restart
  if (key === 'r' || key === 'R') {
    if (state !== STATE.IDLE) {
      clearInterval(gameLoop);
      startGame();
    }
  }
});

// Touch / swipe support
let touchStartX = 0, touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const abs = Math.max(Math.abs(dx), Math.abs(dy));
  if (abs < 10) return;

  let newDir;
  if (Math.abs(dx) > Math.abs(dy)) {
    newDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
  } else {
    newDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
  }

  if (newDir.x !== -dir.x || newDir.y !== -dir.y) nextDir = newDir;
  if (state === STATE.IDLE || state === STATE.DEAD) startGame();
  e.preventDefault();
}, { passive: false });

// ─────────────────────────────────────────────
//  Button events
// ─────────────────────────────────────────────
btnStart.addEventListener('click',   startGame);
btnResume.addEventListener('click',  resumeGame);
btnRestart.addEventListener('click', startGame);

speedBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    speedBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    speed = btn.dataset.speed;
    if (state === STATE.PLAYING) {
      clearInterval(gameLoop);
      gameLoop = setInterval(tick, SPEEDS[speed]);
    }
  });
});

// ─────────────────────────────────────────────
//  Boot
// ─────────────────────────────────────────────
highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
elHighscore.textContent = highScore;

// Save high score
setInterval(() => {
  if (score > 0) localStorage.setItem('snakeHighScore', highScore);
}, 2000);

state = STATE.IDLE;
init();
draw();
showOverlay('start');

// Draw idle animation
let idleFrame = 0;
function idleLoop() {
  if (state === STATE.IDLE) {
    foodPulse += 0.06;
    draw();
    idleFrame = requestAnimationFrame(idleLoop);
  }
}
idleLoop();
