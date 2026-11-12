(() => {
  'use strict';
  const canvas = document.getElementById('audioVisualizer');
  const ctx = canvas.getContext('2d', { alpha: true });
  const audio = window.SitePlayer.audio;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let audioContext;
  let analyser;
  let frequencies;
  let animationId;
  let width = 1;
  let height = 1;
  let frame = 0;

  function resize() {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  async function unlock() {
    if (!audioContext) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      try {
        audioContext = new Context();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.83;
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        frequencies = new Uint8Array(analyser.frequencyBinCount);
      } catch (error) {
        // Keep normal music playback available if Web Audio is unsupported.
        console.warn('Audio visualiser unavailable:', error);
      }
    }
    if (audioContext?.state === 'suspended') await audioContext.resume();
  }

  function draw() {
    animationId = requestAnimationFrame(draw);
    if (document.hidden || reducedMotion.matches) { ctx.clearRect(0, 0, width, height); return; }
    frame += 0.012;
    ctx.clearRect(0, 0, width, height);
    const playing = !audio.paused;
    const volume = audio.volume;
    let energy = 0;
    if (playing && analyser && frequencies) {
      analyser.getByteFrequencyData(frequencies);
      for (let i = 0; i < 70; i++) energy += frequencies[i];
      energy = energy / 70 / 255;
    }
    // Explicit volume scaling ensures raising/lowering the slider changes the
    // background effect even on browsers that analyse pre-volume audio.
    const strength = playing ? (0.3 + energy * 2.2) * volume : 0.035;
    const baseY = height * 0.76;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#00c6e8');
    gradient.addColorStop(0.5, '#fa74d4');
    gradient.addColorStop(1, '#ffe46a');
    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';

    for (let layer = 0; layer < 3; layer++) {
      ctx.beginPath();
      const amplitude = (14 + layer * 16) * strength;
      const phase = frame * (1 + layer * 0.37);
      const step = Math.max(4, Math.round(width / 160));
      for (let x = 0; x <= width + step; x += step) {
        const wave = Math.sin(x / (55 + layer * 27) + phase) +
          Math.sin(x / (22 + layer * 16) - phase * 1.4) * 0.35;
        const y = baseY + (layer - 1) * 12 + wave * amplitude;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineWidth = layer === 1 ? 3 : 1.6;
      ctx.globalAlpha = (layer === 1 ? 0.65 : 0.25) * Math.min(1, 0.4 + strength * 2);
      ctx.shadowBlur = playing ? 16 + 22 * volume : 5;
      ctx.shadowColor = '#f779dc';
      ctx.stroke();
    }

    if (playing) {
      const bars = 58;
      const gap = width / bars;
      ctx.shadowBlur = 11;
      for (let i = 0; i < bars; i++) {
        const sampled = frequencies ? frequencies[Math.min(frequencies.length - 1, i * 3)] / 255 : 0.4;
        const barHeight = Math.max(2, (5 + sampled * 63) * volume);
        ctx.fillStyle = i % 3 === 0 ? '#fc74d5' : '#3ee2ee';
        ctx.globalAlpha = 0.2 + 0.27 * volume;
        ctx.fillRect(i * gap + 2, height - 10 - barHeight, Math.max(2, gap - 5), barHeight);
      }
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
  draw();
  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) ctx.clearRect(0, 0, width, height);
  });
  window.SiteVisualizer = { unlock };
})();