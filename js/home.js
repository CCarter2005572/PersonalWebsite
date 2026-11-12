(() => {
  'use strict';
  const config = window.SITE_CONFIG;
  const $ = (selector) => document.querySelector(selector);
  const menuBtn = $('#menuToggle');
  const menu = $('#siteNav');
  const profileBtn = $('#profileToggle');
  const profile = $('#profilePanel');
  const toastEl = $('#toast');
  let toastTimeout;

  function toast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { toastEl.hidden = true; }, 4200);
  }
  window.siteToast = toast;

  function closePanels() {
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    profile.hidden = true;
    profileBtn.setAttribute('aria-expanded', 'false');
  }

  function togglePanel(button, panel, otherButton, otherPanel) {
    const opening = panel.hidden;
    otherPanel.hidden = true;
    otherButton.setAttribute('aria-expanded', 'false');
    panel.hidden = !opening;
    button.setAttribute('aria-expanded', String(opening));
  }

  menuBtn.addEventListener('click', () => togglePanel(menuBtn, menu, profileBtn, profile));
  profileBtn.addEventListener('click', () => togglePanel(profileBtn, profile, menuBtn, menu));
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.profile-area') && !event.target.closest('.menu-area')) closePanels();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closePanels(); });

  const pages = new Set(['home', 'karaoke', 'finals', 'blog']);
  function route() {
    const requested = location.hash.slice(1).toLowerCase();
    const page = pages.has(requested) ? requested : 'home';
    document.querySelectorAll('.page').forEach((element) => {
      const isActive = element.dataset.page === page;
      element.hidden = !isActive;
      element.classList.toggle('is-active', isActive);
    });
    document.querySelectorAll('.nav-tile').forEach((element) => {
      if (element.getAttribute('href') === `#${page}`) element.setAttribute('aria-current', 'page');
      else element.removeAttribute('aria-current');
    });
    document.title = page === 'home' ? 'Cameron “FREAKYTINK” Carter' : `${page === 'finals' ? 'THE FINALS' : page.toUpperCase()} | FREAKYTINK`;
    closePanels();
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.dispatchEvent(new CustomEvent('site:pagechange', { detail: { page } }));
  }
  window.addEventListener('hashchange', route);
  route();

  function validHttpUrl(value) {
    if (!value || typeof value !== 'string') return '';
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  }

  // Empty links show a helpful message instead of opening a broken URL.
  document.querySelectorAll('[data-link]').forEach((tile) => {
    const key = tile.dataset.link;
    const url = validHttpUrl(config.links[key]);
    if (url) tile.href = url;
    else {
      tile.removeAttribute('target');
      tile.classList.add('needs-link');
      tile.querySelector('.tile-cta').textContent = 'ADD LINK IN CONFIG ↗';
      tile.setAttribute('aria-label', `${tile.querySelector('strong').textContent}: link needs configuring`);
      tile.addEventListener('click', (event) => {
        event.preventDefault();
        toast(`Add the ${key} URL in js/config.js before publishing this link.`);
      });
    }
  });

  // Fill the profile drawer from the single configuration file.
  $('#profileBio').textContent = config.profile.bio;
  const socials = [
    { id: 'profileEmail', value: config.profile.email, mail: true },
    { id: 'profileLinkedin', value: validHttpUrl(config.profile.linkedin) },
    { id: 'profileGithub', value: validHttpUrl(config.profile.github) }
  ];
  socials.forEach(({ id, value, mail }) => {
    const link = document.getElementById(id);
    if (value) link.href = mail ? `mailto:${value}` : value;
    else {
      link.classList.add('is-unconfigured');
      link.addEventListener('click', (event) => {
        event.preventDefault();
        toast(`Add your ${mail ? 'email address' : id.replace('profile', '')} in js/config.js.`);
      });
    }
  });
  $('#profileDiscord').addEventListener('click', async () => {
    const username = config.profile.discord.trim();
    if (!username) { toast('Add your Discord username in js/config.js.'); return; }
    try {
      await navigator.clipboard.writeText(username);
      toast(`Discord username copied: ${username}`);
    } catch { toast(`My Discord username: ${username}`); }
  });

  // Crossfade two image layers; unavailable user photos simply leave the CC avatar.
  const photos = config.profile.photos || [];
  const imageLayers = [$('#avatarPhotoA'), $('#avatarPhotoB')];
  const validPhotos = [];
  Promise.all(photos.map((src) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ src, ok: true });
    image.onerror = () => resolve({ src, ok: false });
    image.src = src;
  }))).then((results) => {
    results.filter((result) => result.ok).forEach((result) => validPhotos.push(result.src));
    if (!validPhotos.length) return;
    let index = 0;
    let layerIndex = 0;
    imageLayers[0].src = validPhotos[0];
    imageLayers[0].classList.add('visible');
    if (validPhotos.length === 1) return;
    setInterval(() => {
      index = (index + 1) % validPhotos.length;
      const nextLayerIndex = 1 - layerIndex;
      const nextLayer = imageLayers[nextLayerIndex];
      nextLayer.src = validPhotos[index];
      nextLayer.classList.add('visible');
      imageLayers[layerIndex].classList.remove('visible');
      layerIndex = nextLayerIndex;
    }, 4400);
  });

  // THE FINALS content: no invented stats or achievements.
  const finals = config.finals;
  $('#finalsName').textContent = finals.playerName;
  $('#finalsTeam').textContent = finals.team;
  $('#finalsRank').textContent = finals.rank;
  $('#finalsBio').textContent = finals.bio;
  const highlights = $('#finalsHighlights');
  finals.highlights.forEach((highlight) => {
    const li = document.createElement('li');
    li.textContent = highlight;
    highlights.appendChild(li);
  });

  // Safe blog rendering: textContent instead of interpreting user-provided HTML.
  const blog = $('#blogPosts');
  if (!config.blogPosts.length) {
    const p = document.createElement('p');
    p.textContent = 'First post coming soon.';
    blog.appendChild(p);
  }
  config.blogPosts.forEach((post) => {
    const article = document.createElement('article');
    article.className = 'blog-card';
    const kicker = document.createElement('p'); kicker.className = 'blog-kicker';
    kicker.textContent = `${post.category}  ·  ${post.date}`;
    const h = document.createElement('h3'); h.textContent = post.title;
    const summary = document.createElement('p'); summary.textContent = post.summary;
    const details = document.createElement('details');
    const toggle = document.createElement('summary'); toggle.textContent = 'READ POST +';
    const body = document.createElement('p'); body.textContent = post.body;
    details.append(toggle, body);
    article.append(kicker, h, summary, details);
    blog.appendChild(article);
  });

  // Lightweight sakura petals: decorative only and disabled for reduced motion.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const petalLayer = $('#petals');
    for (let i = 0; i < 18; i += 1) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      petal.style.setProperty('--x', `${Math.random() * 100}%`);
      petal.style.setProperty('--delay', `${Math.random() * -25}s`);
      petal.style.setProperty('--duration', `${12 + Math.random() * 14}s`);
      petal.style.setProperty('--drift', `${Math.random() * 190 - 95}px`);
      petal.style.setProperty('--size', `${5 + Math.random() * 8}px`);
      petalLayer.appendChild(petal);
    }
  }
})();