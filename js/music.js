(() => {
  'use strict';
  // Original playlist retained, in the same order and with the same MP3 filenames.
  const titles = [
    'Changing Seasons', 'Full Moon Full Life', 'Colour Your Night', 'Its Going Down',
    'Aria of the Soul', 'Want To Be Close', 'When The Moons Reaching Out Stars',
    'Iwatodai Dorm', 'Mass Destruction', 'Master of Shadow', 'Paulownia Mall',
    'Master of Tartarus', 'Burn My Dread', 'Wake Up, Get Up, Get Out There',
    'Life Will Change', 'Will Power', 'Victory', 'Last Surprise', 'Layer Cake',
    'Tokyo Daylight', 'When Mother Was There', 'Whims of Fate', 'Rivers In the Desert',
    'Hoshi To Bokura To', 'Colors Flying High', 'Take Over', 'Hes a Trickster',
    'I believe', 'Our Light'
  ];
  const tracks = titles.map((title, number) => ({
    title, number, src: `./assets/music/citypop${number}.mp3`
  }));
  const $ = (selector) => document.querySelector(selector);
  const audio = $('#siteAudio');
  const volumeSlider = $('#volumeSlider');
  const volumeValue = $('#volumeValue');
  const playPause = $('#playPauseBtn');
  const titleEl = $('#trackTitle');
  const vinyl = $('#vinyl');
  const timeLabel = $('#timeLabel');
  const seekSlider = $('#seekSlider');
  const playlist = $('#playlist');
  const playlistBtn = $('#togglePlaylistBtn');
  const karaokeSelect = $('#karaokeTrackSelect');
  const lyricsList = $('#lyricsList');
  const lyricsStatus = $('#lyricsStatus');
  const lrcFile = $('#lrcFile');
  const lyricsCache = new Map();
  let currentIndex = Math.floor(Math.random() * tracks.length);
  let isSeeking = false;
  let activeLyricIndex = -1;

  function formatTime(value) {
    if (!Number.isFinite(value)) return '0:00';
    const mins = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${mins}:${String(seconds).padStart(2, '0')}`;
  }
  function announce(message) { $('#playerStatus').textContent = message; }
  function applyVolume() {
    audio.volume = Number(volumeSlider.value);
    volumeValue.textContent = `${Math.round(audio.volume * 100)}%`;
    window.dispatchEvent(new CustomEvent('site:volumechange', { detail: { volume: audio.volume } }));
  }
  applyVolume();
  volumeSlider.addEventListener('input', applyVolume);

  function updatePlayState() {
    const playing = !audio.paused;
    playPause.textContent = playing ? '⏸' : '▶';
    playPause.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    vinyl.classList.toggle('is-spinning', playing);
    $('#miniPlayer').classList.toggle('is-playing', playing);
  }

  async function play() {
    try {
      if (window.SiteVisualizer) await window.SiteVisualizer.unlock();
      await audio.play();
    } catch {
      announce('The browser blocked playback. Click Play to try again.');
      window.siteToast?.('Click the play button to start music.');
    }
    updatePlayState();
  }
  function pause() { audio.pause(); updatePlayState(); }
  function loadTrack(index, shouldPlay = !audio.paused) {
    currentIndex = (index + tracks.length) % tracks.length;
    const track = tracks[currentIndex];
    audio.src = track.src;
    audio.load();
    titleEl.textContent = track.title;
    vinyl.src = `./assets/images/vinyl${currentIndex % 2 === 0 ? 1 : 2}.jpeg`;
    karaokeSelect.value = String(currentIndex);
    seekSlider.value = '0';
    timeLabel.textContent = '0:00 / 0:00';
    updatePlaylist();
    showLyricsForTrack();
    window.dispatchEvent(new CustomEvent('site:trackchange', { detail: { index: currentIndex, track } }));
    if (shouldPlay) play();
    else updatePlayState();
  }
  function next() { loadTrack(currentIndex + 1); }
  function previous() {
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    loadTrack(currentIndex - 1);
  }

  playPause.addEventListener('click', () => { if (audio.paused) play(); else pause(); });
  $('#nextBtn').addEventListener('click', next);
  $('#prevBtn').addEventListener('click', previous);
  audio.addEventListener('play', updatePlayState);
  audio.addEventListener('pause', updatePlayState);
  audio.addEventListener('ended', () => loadTrack(currentIndex + 1, true));
  audio.addEventListener('error', () => announce(`Unable to load ${tracks[currentIndex].src}. Check that the MP3 is present.`));

  function updateProgress() {
    if (!isSeeking && Number.isFinite(audio.duration) && audio.duration > 0) {
      seekSlider.value = String(Math.round(audio.currentTime / audio.duration * 1000));
    }
    timeLabel.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    updateActiveLyric();
  }
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', updateProgress);
  seekSlider.addEventListener('input', () => { isSeeking = true; });
  seekSlider.addEventListener('change', () => {
    if (Number.isFinite(audio.duration)) audio.currentTime = Number(seekSlider.value) / 1000 * audio.duration;
    isSeeking = false;
    updateProgress();
  });

  function updatePlaylist() {
    playlist.replaceChildren();
    const heading = document.createElement('p');
    heading.className = 'playlist-heading';
    heading.textContent = 'YOUR 29-TRACK PLAYLIST';
    playlist.appendChild(heading);
    tracks.forEach((track, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'playlist-item';
      if (index === currentIndex) { button.classList.add('active'); button.setAttribute('aria-current', 'true'); }
      button.textContent = `${String(index + 1).padStart(2, '0')}  ${track.title}`;
      button.addEventListener('click', () => { loadTrack(index, true); playlist.hidden = true; playlistBtn.setAttribute('aria-expanded', 'false'); });
      playlist.appendChild(button);
    });
  }
  playlistBtn.addEventListener('click', () => {
    playlist.hidden = !playlist.hidden;
    playlistBtn.setAttribute('aria-expanded', String(!playlist.hidden));
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('#miniPlayer')) {
      playlist.hidden = true;
      playlistBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // The karaoke page uses standard timestamped LRC files, not scraped lyrics.
  tracks.forEach((track, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${index + 1}. ${track.title}`;
    karaokeSelect.appendChild(option);
  });
  karaokeSelect.addEventListener('change', () => loadTrack(Number(karaokeSelect.value), true));

  function parseLrc(text) {
    const lines = [];
    for (const line of text.split(/\r?\n/)) {
      const tags = [...line.matchAll(/\[(\d{1,3}):(\d{2})(?:\.(\d{1,3}))?\]/g)];
      if (!tags.length) continue;
      const words = line.replace(/\[\d{1,3}:\d{2}(?:\.\d{1,3})?\]/g, '').trim();
      if (!words) continue;
      for (const tag of tags) {
        const fractional = tag[3] ? Number(`0.${tag[3]}`) : 0;
        lines.push({ time: Number(tag[1]) * 60 + Number(tag[2]) + fractional, text: words });
      }
    }
    return lines.sort((a, b) => a.time - b.time);
  }
  function showLyricsForTrack() {
    activeLyricIndex = -1;
    lyricsList.replaceChildren();
    const lines = lyricsCache.get(currentIndex);
    if (!lines?.length) {
      const p = document.createElement('p');
      p.className = 'lyrics-empty';
      p.textContent = 'No timed lyrics loaded for this song yet. Upload an .lrc file above to sing along.';
      lyricsList.appendChild(p);
      lyricsStatus.textContent = `Ready for lyrics: ${tracks[currentIndex].title}`;
    } else {
      lines.forEach((line) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'lyric-line';
        row.textContent = line.text;
        row.title = `Jump to ${formatTime(line.time)}`;
        row.addEventListener('click', () => { audio.currentTime = line.time; updateActiveLyric(); });
        lyricsList.appendChild(row);
      });
      lyricsStatus.textContent = `${lines.length} synced lyric lines loaded. Click a line to jump to it.`;
      updateActiveLyric();
    }
  }
  function updateActiveLyric() {
    const lines = lyricsCache.get(currentIndex);
    if (!lines?.length) return;
    let active = -1;
    for (let i = 0; i < lines.length; i++) {
      if (audio.currentTime >= lines[i].time) active = i;
      else break;
    }
    if (active === activeLyricIndex) return;
    activeLyricIndex = active;
    [...lyricsList.children].forEach((row, index) => {
      row.classList.toggle('current', index === active);
    });
    if (active >= 0 && location.hash === '#karaoke') {
      lyricsList.children[active]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }
  lrcFile.addEventListener('change', async () => {
    const file = lrcFile.files?.[0];
    if (!file) return;
    const lines = parseLrc(await file.text());
    if (!lines.length) { lyricsStatus.textContent = 'No valid timestamps found. Use [mm:ss.xx] at the start of each line.'; return; }
    lyricsCache.set(currentIndex, lines);
    showLyricsForTrack();
    lrcFile.value = '';
  });

  async function loadPublishedLyrics() {
    const allowed = window.SITE_CONFIG.lyricsAvailable || [];
    if (!allowed.includes(currentIndex) || lyricsCache.has(currentIndex)) return;
    try {
      const response = await fetch(`./assets/lyrics/citypop${currentIndex}.lrc`);
      if (!response.ok) return;
      const idx = currentIndex;
      const lines = parseLrc(await response.text());
      if (lines.length) lyricsCache.set(idx, lines);
      if (currentIndex === idx) showLyricsForTrack();
    } catch { /* Local file:// previews cannot fetch; .lrc upload works there. */ }
  }
  window.addEventListener('site:pagechange', (event) => {
    if (event.detail.page === 'karaoke') { loadPublishedLyrics(); showLyricsForTrack(); }
  });
  window.addEventListener('site:trackchange', () => {
    if (location.hash === '#karaoke') loadPublishedLyrics();
  });

  window.SitePlayer = { audio, tracks, play, pause, next, previous, loadTrack, getCurrentIndex: () => currentIndex };
  loadTrack(currentIndex, false);
})();