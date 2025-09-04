const buddy = document.getElementById('cursorBuddy');
const selector = document.getElementById('buddySelect');

let mode = 'random'; // 'random' | 'follow'
let target = { x: innerWidth/2, y: innerHeight/2 };
let buddyPos = { x: innerWidth/2, y: innerHeight/2 };
let buddyRadius = 24; // “touch” radius (~buddy half-size)
let rafId = null;

// swap sprite when user changes animal
selector?.addEventListener('change', e => {
  buddy.src = `./assets/images/${e.target.value}-sprite.png`;
});

// capture cursor target
addEventListener('mousemove', e => {
  target.x = e.clientX;
  target.y = e.clientY;
});

// physics-ish pursuit: ease toward target until within touch radius
function update() {
  const stiffness = (mode === 'follow') ? 0.18 : 0.04; // faster when following
  const dx = target.x - buddyPos.x;
  const dy = target.y - buddyPos.y;
  const dist = Math.hypot(dx, dy);

  if (mode === 'follow') {
    if (dist > buddyRadius) {
      buddyPos.x += dx * stiffness;
      buddyPos.y += dy * stiffness;
    } else {
      // snap near cursor when “touching”
      buddyPos.x += dx * 0.1;
      buddyPos.y += dy * 0.1;
    }
  } else {
    // random drift toward a moving random target
    buddyPos.x += dx * stiffness;
    buddyPos.y += dy * stiffness;
  }

  buddy.style.transform = `translate(${buddyPos.x - 25}px, ${buddyPos.y - 25}px)`;
  rafId = requestAnimationFrame(update);
}

// random walk target changer (only in random mode)
function nudgeRandomTarget() {
  if (mode !== 'random') return;
  target.x = Math.max(20, Math.min(innerWidth - 20, target.x + (Math.random()*400 - 200)));
  target.y = Math.max(20, Math.min(innerHeight - 20, target.y + (Math.random()*300 - 150)));
}

// cycle: 10s random → 5s follow → repeat
function startCycle() {
  mode = 'random';
  const randomPhase = setInterval(nudgeRandomTarget, 1000);
  setTimeout(() => {
    clearInterval(randomPhase);
    mode = 'follow';
    // after 5s, back to random with a fresh target near current pos
    setTimeout(() => {
      mode = 'random';
      target.x = buddyPos.x + (Math.random()*300 - 150);
      target.y = buddyPos.y + (Math.random()*200 - 100);
      startCycle();
    }, 5000);
  }, 10000);
}

cancelAnimationFrame(rafId);
update();
startCycle();
