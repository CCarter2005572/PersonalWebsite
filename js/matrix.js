// Matrix Canvas Setup
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const fontSize = 16;
const columns = Math.floor(canvas.width / fontSize);
const drops = [];

// Initialize drop positions
for (let x = 0; x < columns; x++) {
  drops[x] = Math.random() * canvas.height / fontSize;
}

// Draw Matrix rain
function draw() {
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0F0';
  ctx.font = fontSize + 'px monospace';

  for (let i = 0; i < drops.length; i++) {
    const text = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    drops[i]++;
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
  }
}
setInterval(draw, 50);

// Sounds
const matrixClickSound = new Audio('./assets/sounds/matrix-click.mp3'); // glass click
const wiiHoverSound = new Audio('./assets/sounds/wii-hover.mp3');       // hover sound

// ENTER button
const enterBtn = document.getElementById('enterBtn');
enterBtn.addEventListener('click', () => {
  // Play glass click
  matrixClickSound.currentTime = 2.5;
  matrixClickSound.play();

  // Scroll smoothly to homepage (camera pan)
  gsap.to(window, {
    scrollTo: { y: window.innerHeight },
    duration: 2,
    ease: "power2.inOut"
  });
});

// Play glass click on any click in the Matrix page
document.getElementById('matrixPage').addEventListener('click', () => {
  matrixClickSound.currentTime = 0;
  matrixClickSound.play();
});

// Homepage box hover sound (subtle Wii feel)
const boxes = document.querySelectorAll('.box');
boxes.forEach(box => {
  box.addEventListener('mouseenter', () => {
    wiiHoverSound.currentTime = 0;
    wiiHoverSound.play();
  });

  // Existing click sound for boxes
  const wiiClickSound = new Audio('./assets/sounds/wii-click.mp3');
  box.addEventListener('click', () => {
    wiiClickSound.currentTime = 0;
    wiiClickSound.play();

    // Box enlarge animation
    gsap.to(box, {
      scale: 10,
      opacity: 0,
      duration: 1,
      onComplete: () => {
        alert(`Entering ${box.textContent}`);
      }
    });
  });
});

