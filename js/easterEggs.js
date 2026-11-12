// A small nod to the original site's Konami-code Easter egg.
// No missing disco soundtrack or conflicting secondary music player.
(() => {
  'use strict';
  const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let progress = 0;
  document.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    progress = key === code[progress] ? progress + 1 : (key === code[0] ? 1 : 0);
    if (progress === code.length) {
      document.body.classList.toggle('disco-mode');
      window.siteToast?.(document.body.classList.contains('disco-mode') ? 'DISCO MODE ACTIVATED ✨' : 'Disco mode off.');
      progress = 0;
    }
  });
})();