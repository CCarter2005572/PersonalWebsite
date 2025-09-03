const layers = document.querySelectorAll('.skyline-layer');
document.addEventListener('mousemove', e => {
  const x = e.clientX / window.innerWidth;
  layers.forEach((layer, i) => {
    layer.style.transform = `translateX(${x * (i+1) * 20}px)`;
  });
});
