const bgMusic = document.getElementById('bgMusic');
window.addEventListener('click', () => {
  if (bgMusic.paused) bgMusic.play();
}, { once: true });
