const boxes = document.querySelectorAll('.box');
const wiiClickSound = new Audio('./assets/sounds/wii-click.mp3');

boxes.forEach(box => {
  box.addEventListener('click', () => {
    // Play sci-fi / Wii click
    wiiClickSound.currentTime = 0;
    wiiClickSound.play();

    // Box animation
    gsap.to(box, { scale: 10, opacity: 0, duration: 1, onComplete: () => {
      alert(`Entering ${box.textContent}`);
    }});
  });
});
