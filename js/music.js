// MATRIX MUSIC
const matrixMusic = document.getElementById('matrixMusic');
matrixMusic.volume = 0.2; // adjust matrix music volume
matrixMusic.play().catch(() => {
  // If autoplay blocked, play on first user interaction
  document.getElementById('matrixPage').addEventListener('click', () => {
    matrixMusic.play();
  }, { once: true });
});

// HOMEPAGE CITY POP MUSIC
const cityPopMusic = document.getElementById('bgMusic');
const volumeSlider = document.getElementById('volumeSlider');

// Play city pop when the homepage is reached
window.addEventListener('scroll', () => {
  const homepageOffset = document.getElementById('homePage').offsetTop;
  if (window.scrollY >= homepageOffset && cityPopMusic.paused) {
    cityPopMusic.play();
  }
});

// Volume slider controls homepage music only
volumeSlider.addEventListener('input', () => {
  cityPopMusic.volume = volumeSlider.value;
});
