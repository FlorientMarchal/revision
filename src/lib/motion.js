// Petites animations de l'interface : apparition au défilement, confettis de fin de série.
// Tout est désactivé si le système demande de réduire les animations.

export const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

let io = null;
function observer() {
  if (io || typeof IntersectionObserver !== 'function') return io;
  io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
  return io;
}

const SEL = '.lesson-sec, .lesson .box, .lesson .viz, .lesson .math, .fiche > h3, .fiche > .f, .fiche > .math, .fiche > .tp, .fiche > .grid2, .fiche > .viz, .card.exo, .form-group, .rq';

/** Fait apparaître en douceur (au défilement) les blocs de `root` situés sous le bas de l'écran. */
export function reveal(root, sel = SEL) {
  if (!root || reduced()) return;
  const o = observer();
  if (!o) return;
  const H = innerHeight;
  for (const el of root.querySelectorAll(sel)) {
    if (el.classList.contains('rv') || (el.parentElement && el.parentElement.closest('.rv'))) continue;
    // ce qui est déjà visible (ou au-dessus) ne disparaît jamais
    if (el.getBoundingClientRect().top < H * 0.96) continue;
    el.classList.add('rv');
    o.observe(el);
  }
}

const COLORS = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)', 'var(--hl)'];
/** Pluie de confettis légère (transform/opacity), sans interaction, retirée après l'animation. */
export function confetti(n = 46) {
  if (reduced() || typeof document === 'undefined') return;
  const box = document.createElement('div');
  box.className = 'confetti';
  box.setAttribute('aria-hidden', 'true');
  for (let k = 0; k < n; k++) {
    const i = document.createElement('i');
    const x = Math.random() * 100;
    i.style.cssText = `left:${x}%;background:${COLORS[k % COLORS.length]};--dx:${(Math.random() - 0.5) * 160}px;--r:${(Math.random() - 0.5) * 900}deg;` +
      `animation-delay:${Math.random() * 0.25}s;animation-duration:${1.3 + Math.random() * 0.9}s;` +
      (k % 3 === 0 ? 'border-radius:50%;width:7px;height:7px;' : '');
    box.appendChild(i);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2600);
}
