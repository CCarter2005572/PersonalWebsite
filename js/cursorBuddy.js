const buddy = document.getElementById('cursorBuddy');
const selector = document.getElementById('buddySelect');

selector.addEventListener('change', e => {
  buddy.src = `./assets/images/${e.target.value}.png`;
});

document.addEventListener('mousemove', e => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  buddy.style.transform = `translate(${mouseX - buddy.width/2}px, ${mouseY - buddy.height/2}px)`;
});
