const scene = document.querySelector('.coffee-background');
const picture = scene?.querySelector('img');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let pending = false;

function paint() {
  pending = false;
  if (!scene || reducedMotion.matches) return;
  const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)));
  const x = Math.sin(progress * Math.PI * 2) * Math.min(window.innerWidth * .1, 130);
  const y = (progress - .5) * Math.min(window.innerHeight * .25, 180);
  scene.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${Math.sin(progress * Math.PI * 2) * 3}deg)`;
}

function schedule() {
  if (!pending) {
    pending = true;
    requestAnimationFrame(paint);
  }
}

function configure() {
  if (!scene || !picture) return;
  picture.src = reducedMotion.matches ? '/assets/coffee-cat-still.jpg' : '/assets/coffee-cat.gif';
  scene.style.transform = '';
  if (!reducedMotion.matches) schedule();
}

window.addEventListener('scroll', schedule, {passive: true});
window.addEventListener('resize', schedule, {passive: true});
reducedMotion.addEventListener('change', configure);
configure();
