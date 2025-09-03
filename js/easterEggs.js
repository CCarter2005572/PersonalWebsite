const konamiCode = [38,38,40,40,37,39,37,39,66,65];
let konamiIndex = 0;
const discoMusic = new Audio('./assets/sounds/disco.mp3');
discoMusic.loop = true;

document.addEventListener('keydown', e => {
  if (e.keyCode === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      activateDiscoMode();
      konamiIndex = 0;
    }
  } else konamiIndex = 0;
});

function activateDiscoMode() {
  document.body.classList.add('disco-mode');
  discoMusic.play();
  const bgMusic = document.getElementById('bgMusic');
  if (bgMusic) bgMusic.pause();
}
