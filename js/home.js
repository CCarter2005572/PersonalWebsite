// ===== HOME.JS =====

// ===== CITY POP MUSIC & VOLUME CONTROL =====
const bgMusic = document.getElementById('bgMusic');
const volumeSlider = document.getElementById('volumeSlider');

// Set initial volume to 50%
bgMusic.volume = 0.5;

// Play music automatically once homepage is revealed
function playHomepageMusic() {
  bgMusic.play().catch(() => {});
}

// Volume slider
volumeSlider.addEventListener('input', () => {
  bgMusic.volume = volumeSlider.value;
});

// ===== CURSOR BUDDY =====
const cursorBuddy = document.getElementById('cursorBuddy');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Buddy settings
let followingCursor = true;

// Update mouse position
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Random walk / follow logic
function moveBuddy() {
  if (!cursorBuddy) return;

  const rect = cursorBuddy.getBoundingClientRect();
  let buddyX = rect.left + rect.width / 2;
  let buddyY = rect.top + rect.height / 2;

  if (followingCursor) {
    // Smooth follow until touching cursor
    const dx = mouseX - buddyX;
    const dy = mouseY - buddyY;
    buddyX += dx * 0.1;
    buddyY += dy * 0.1;
  } else {
    // Random movement
    buddyX += (Math.random() - 0.5) * 5;
    buddyY += (Math.random() - 0.5) * 5;
  }

  cursorBuddy.style.left = `${buddyX - rect.width / 2}px`;
  cursorBuddy.style.top = `${buddyY - rect.height / 2}px`;
}

// Switch between random and follow every 10s / 5s
setInterval(() => { followingCursor = true; }, 0); // start following
setInterval(() => { followingCursor = false; }, 15000); // random after 15s

setInterval(moveBuddy, 20);

// ===== WII-STYLE BOXES =====
const boxes = document.querySelectorAll('#boxGrid .box');
const wiiClickSound = new Audio('./assets/sounds/click.mp3');

boxes.forEach(box => {
  box.style.cursor = 'pointer';
  box.addEventListener('click', (e) => {
    // Prevent the default immediate navigation so we can animate first
    e.preventDefault();

    // Sound
    wiiClickSound.currentTime = 0;
    wiiClickSound.play().catch(() => {});

    // Animate the anchor itself
    gsap.to(box, {
      scale: 10,
      opacity: 0,
      duration: 0.6,
      onComplete: () => {
        // Open the href from the anchor after animation
        const url = box.getAttribute('href');
        window.open(url, '_blank', 'noopener');

        // Reset for future clicks
        gsap.set(box, { scale: 1, opacity: 1 });
      }
    });
  });
});



// ===== PLAY HOMEPAGE MUSIC WHEN ENTER BUTTON ANIMATION COMPLETES =====
const pageContainer = document.getElementById('pageContainer');

// Observe GSAP transform for pageContainer
// When matrix page is scrolled away, play music
gsap.to(pageContainer, {
  onUpdate: function() {
    const transform = pageContainer._gsap ? pageContainer._gsap.y : 0;
    if (transform <= -window.innerHeight) {
      playHomepageMusic();
    }
  }
});
