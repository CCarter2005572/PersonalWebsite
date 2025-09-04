// ===== MATRIX.JS =====
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
const pageContainer = document.getElementById('pageContainer');
const enterBtn = document.getElementById('enterBtn');
const matrixMusicEl = document.getElementById('matrixMusic');

// ===== STATE =====
let onMatrixPage = true; // start on Matrix page

// ===== MATRIX LETTERS =====
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const fontSize = 16;
let columns = Math.floor(canvas.width / fontSize);

function sizeCanvas() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  columns = Math.floor(canvas.width / fontSize);
}
sizeCanvas();
addEventListener('resize', sizeCanvas);

// ===== DROPS =====
const drops = [];
for (let x = 0; x < 300; x++) drops[x] = Math.random() * canvas.height / fontSize;

// ===== DRAW MATRIX RAIN =====
function draw() {
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0F0';
  ctx.font = `${fontSize}px "Share Tech Mono", monospace`;
  for (let i = 0; i < drops.length; i++) {
    const text = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillText(text, (i % columns) * fontSize, drops[i] * fontSize);
    drops[i]++;
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
  }
}
setInterval(draw, 50);

// ===== MATRIX & HOMEPAGE CLICK SFX =====
const clickSfxMatrix = new Audio('./assets/sounds/matrix-click.mp3');
const clickSfxHome = new Audio('./assets/sounds/click.mp3');

document.addEventListener('click', () => {
  if (onMatrixPage) {
    clickSfxMatrix.currentTime = 0;
    clickSfxMatrix.play().catch(() => {});
  } else {
    clickSfxHome.currentTime = 0;
    clickSfxHome.play().catch(() => {});
  }
});

// ===== ENTER BUTTON LOGIC =====
enterBtn.disabled = true; // start disabled

// Show ENTER button after 4s
setTimeout(() => {
  enterBtn.classList.add('show');
  enterBtn.disabled = false;
}, 4000);

enterBtn.addEventListener('click', () => {
  // Stop Matrix music
  if (matrixMusicEl) {
    matrixMusicEl.pause();
    matrixMusicEl.currentTime = 0;
  }

  // Animate pageContainer to homepage
  gsap.to(pageContainer, {
    y: `-${window.innerHeight}px`,
    duration: 2,
    ease: 'power2.inOut',
    onComplete: () => {
      onMatrixPage = false; // now officially on homepage
    }
  });
});

// ===== DISABLE MANUAL SCROLL =====
document.body.style.overflow = 'hidden';
