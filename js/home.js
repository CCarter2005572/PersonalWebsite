const boxes = document.querySelectorAll('.box');

boxes.forEach(box => {
  box.addEventListener('click', () => {
    gsap.to(box, { scale: 10, opacity: 0, duration: 1, onComplete: () => {
      alert(`Entering ${box.textContent}`); // replace with actual project navigation
    }});
    const clickSound = new Audio('./assets/sounds/click.wav');
    clickSound.play();
  });
});
