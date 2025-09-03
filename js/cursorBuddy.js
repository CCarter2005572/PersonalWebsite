const buddy = document.getElementById('cursorBuddy');
const selector = document.getElementById('buddySelect');

let followCursor = false;
let buddyInterval;

// Change buddy sprite based on selection
selector.addEventListener('change', e => {
  buddy.src = `./assets/images/${e.target.value}-sprite.png`;
});

// Move buddy smoothly to cursor
function moveToCursor(x, y) {
  gsap.to(buddy, { x: x - buddy.width/2, y: y - buddy.height/2, duration: 0.5 });
  animateSprite();
}

// Random walk to a position on screen
function randomWalk() {
  const x = Math.random() * (window.innerWidth - buddy.width);
  const y = Math.random() * (window.innerHeight - buddy.height);
  gsap.to(buddy, { x: x, y: y, duration: 3, onUpdate: animateSprite });
}

// Sprite animation placeholder
let currentFrame = 0;
function animateSprite() {
  // Placeholder: here you would update the background-position for the sprite sheet
  // Example for CSS sprite sheet:
  // buddy.style.backgroundPosition = `-${currentFrame * 50}px 0`;
  currentFrame = (currentFrame + 1) % 4; // assuming 4 frames
}

// Cycle: 10s random walk → 5s follow cursor
function startBuddyCycle() {
  followCursor = false;
  randomWalk();

  buddyInterval = setInterval(() => {
    // Follow cursor for 5s
    followCursor = true;
    setTimeout(() => {
      followCursor = false;
      randomWalk();
    }, 5000);
  }, 15000); // total cycle 15s
}

// Listen for cursor movement
document.addEventListener('mousemove', e => {
  if (followCursor) moveToCursor(e.clientX, e.clientY);
});

// Initialize
startBuddyCycle();
