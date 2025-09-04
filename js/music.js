// ===== MATRIX PAGE MUSIC =====
const matrixMusic = document.getElementById('matrixMusic');
if (matrixMusic) {
  matrixMusic.volume = 0.2; // your chosen Matrix volume
  matrixMusic.play().catch(() => {
    // Autoplay block fallback
    document.getElementById('matrixPage')?.addEventListener('click', () => matrixMusic.play(), { once: true });
  });
}

// ===== HOMEPAGE MUSIC & VOLUME =====
const cityPopMusic = document.getElementById('bgMusic');
const volumeSlider = document.getElementById('volumeSlider');

// ensure true 50% start (not just UI)
if (cityPopMusic && volumeSlider) {
  const startVol = parseFloat(volumeSlider.value || '0.5');
  cityPopMusic.volume = isNaN(startVol) ? 0.5 : startVol;
  volumeSlider.addEventListener('input', () => {
    cityPopMusic.volume = parseFloat(volumeSlider.value);
  });
}

// start city pop when homepage reached
addEventListener('scroll', () => {
  const hp = document.getElementById('homePage');
  if (!hp || !cityPopMusic) return;
  if (scrollY >= hp.offsetTop && cityPopMusic.paused) {
    cityPopMusic.play().catch(()=>{ /* user will interact soon */ });
    // stop Matrix music immediately on arrival
    if (matrixMusic) { matrixMusic.pause(); matrixMusic.currentTime = 0; }
  }
}, { passive: true });

// ===== MINI PLAYER (no seeking, randomized playlist, vinyl spin) =====
const tracks = [
  { title: 'Full Moon Full Life', src: './assets/music/citypop1.mp3' },
  { title: 'Colour Your Night', src: './assets/music/citypop2.mp3' },
  { title: 'Its Going Down', src: './assets/music/citypop3.mp3' },
  { title: 'Burn My Dread', src: './assets/music/citypop12.mp3' },
  { title: 'Our Light', src: './assets/music/citypop28.mp3' },
];

const vinyl = document.getElementById('vinyl');
const trackTitle = document.getElementById('trackTitle');
const playPauseBtn = document.getElementById('playPauseBtn');
const togglePlaylistBtn = document.getElementById('togglePlaylistBtn');
const playlistEl = document.getElementById('playlist');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const timeLabel = document.getElementById('timeLabel');

let currentIndex = Math.floor(Math.random() * tracks.length);
let audio = new Audio(tracks[currentIndex].src);
audio.volume = cityPopMusic ? cityPopMusic.volume : 0.5;
audio.loop = false; // move to next track on end

function loadTrack(idx) {
  currentIndex = idx;
  audio.src = tracks[currentIndex].src;
  trackTitle.textContent = tracks[currentIndex].title;
  progressFill.style.width = '0%';
  timeLabel.textContent = '0:00 / 0:00';
}

function play() {
  audio.play().then(() => vinyl?.classList.add('spin')).catch(()=>{});
}
function pause() {
  audio.pause();
  vinyl?.classList.remove('spin');
}

function formatTime(t){
  if (!isFinite(t)) return '0:00';
  const m = Math.floor(t/60); const s = Math.floor(t%60);
  return `${m}:${s.toString().padStart(2,'0')}`;
}

// Sync cityPopMusic and mini player: we want one soundtrack.
// Strategy: when homepage reached, we’ll pause bgMusic and let mini-player be the master.
addEventListener('scroll', () => {
  const hp = document.getElementById('homePage');
  if (!hp) return;
  if (scrollY >= hp.offsetTop) {
    if (cityPopMusic && !cityPopMusic.paused) cityPopMusic.pause();
    // start mini player if not already playing
    if (audio.paused) play();
  }
}, { passive: true });

// keep mini player volume in sync with slider
if (volumeSlider) {
  volumeSlider.addEventListener('input', () => {
    audio.volume = parseFloat(volumeSlider.value);
  });
}

// progress updates (display only; no seeking)
audio.addEventListener('timeupdate', () => {
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  progressFill.style.width = `${pct}%`;
  timeLabel.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
});
audio.addEventListener('ended', () => {
  // next track (no user skip control exposed)
  const next = (currentIndex + 1) % tracks.length;
  loadTrack(next);
  play();
});

// controls
playPauseBtn?.addEventListener('click', () => {
  if (audio.paused) play(); else pause();
});

// playlist view (read-only: no skipping)
togglePlaylistBtn?.addEventListener('click', () => {
  playlistEl.classList.toggle('show');
});

// render playlist (non-interactive items)
if (playlistEl) {
  playlistEl.innerHTML = tracks.map((t,i) => 
    `<div class="item">${i+1}. ${t.title}${i===currentIndex?' •':' '}</div>`
  ).join('');
}

// init
loadTrack(currentIndex);

// OPTIONAL: if you want the mini player to fully replace bgMusic, ensure bgMusic never autoplays:
if (cityPopMusic) {
  cityPopMusic.pause();
  cityPopMusic.currentTime = 0;
}
