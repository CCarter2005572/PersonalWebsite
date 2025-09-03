const boxes = document.querySelectorAll('.box');

boxes.forEach(box => {
  box.addEventListener('mouseenter', () => {
    gsap.to(box, { scale: 1.15, duration: 0.3, boxShadow: "0 0 20px #0FF" });
  });
  box.addEventListener('mouseleave', () => {
    gsap.to(box, { scale: 1, duration: 0.3, boxShadow: "0 0 10px #0FF" });
  });
});

