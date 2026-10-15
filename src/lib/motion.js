// Motion design de l'interface : transitions de page (View Transitions API, sinon Web Animations),
// intro de l'accueil, apparitions au défilement, encre qui se trace, éclats et confettis.
// Tout est coupé si le système demande de réduire les animations : le contenu reste toujours visible.
import { tick } from 'svelte';

export const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const canVT = () => typeof document !== 'undefined' && typeof document.startViewTransition === 'function';
const wait = ms => new Promise(r => setTimeout(r, ms));
/** Courbes du site (mêmes valeurs que motion-shell.css). */
export const EASE = { out: 'cubic-bezier(.2,.9,.25,1)', spring: 'cubic-bezier(.3,1.35,.45,1)', in: 'cubic-bezier(.4,0,1,1)' };

/* ---------------------------------------------------------------- transitions */

let vtSeq = 0, activeVT = null;
let nav = null;          // navigation en cours (lue par les composants qui se montent pendant la transition)
let ready = null;        // promesse « le nouvel écran est prêt » (données chargées, défilement restauré)
let homeScroll = 0;      // position de défilement de l'accueil, restaurée au retour
let curRoute = null, lastRoute = null;

/** La navigation qui est en train de monter ce composant ({ kind, id, … }) ou null. */
export const navInfo = () => nav;
/**
 * Promesse résolue quand la transition en cours est terminée (ou tout de suite s'il n'y en a pas) :
 * les travaux lourds (formules KaTeX, illustrations) attendent ce moment pour ne pas figer l'écran.
 */
export function afterNav() {
  const t = activeVT;
  const frame = () => new Promise(r => setTimeout(r, 16));
  if (!t) return frame();
  return Promise.race([t.finished.catch(() => {}), wait(900)]).then(frame);
}
/** Un écran qui se monte peut signaler quand il est prêt à être photographié (max 300 ms d'attente). */
export const setReady = p => { ready = p; };
export const saveHomeScroll = y => { homeScroll = y; };
export const getHomeScroll = () => homeScroll;
/** L'écran qu'on vient de quitter ({ name, course, tab }) : sert à l'accueil pour revenir sur la bonne carte. */
export const lastFrom = () => lastRoute;

/**
 * Joue `update` (qui modifie le DOM) dans une transition chorégraphiée.
 * kind : 'fwd' (accueil → cours), 'back' (cours → accueil), 'tab', 'lesson', 'fade'. dir : 'l' | 'r'.
 * `el` : élément à animer en repli (Web Animations) quand l'API View Transitions manque.
 */
export async function transition(kind, update, { dir = '', fallbackEl = null, info = {}, onDone = null } = {}) {
  if (reduced()) { await update(); onDone && onDone(); return; }
  if (!canVT()) {
    await update();
    onDone && onDone();
    const el = typeof fallbackEl === 'function' ? fallbackEl() : fallbackEl;
    if (el && el.animate && (kind === 'tab' || kind === 'lesson')) {
      const x = dir === 'l' ? -36 : 36;
      el.animate([{ opacity: 0, transform: `translateX(${x}px)` }, { opacity: 1, transform: 'none' }], { duration: 420, easing: EASE.out });
    }
    return;
  }
  const root = document.documentElement;
  const me = ++vtSeq;
  // une transition encore en cours est abrégée avant de lancer la suivante
  if (activeVT) { const prev = activeVT; activeVT = null; try { prev.skipTransition(); } catch (e) {} await Promise.race([prev.finished.catch(() => {}), wait(120)]); }
  if (me !== vtSeq) { await update(); return; }
  // une transition précédente encore active est terminée proprement (ses classes ne doivent pas rester)
  root.classList.forEach(c => { if (c === 'vt' || (c.startsWith('vt-') && c !== 'vt-card')) root.classList.remove(c); });
  const cls = ['vt', 'vt-' + kind];
  if (dir) cls.push('vt-dir-' + dir);
  root.classList.add(...cls);
  nav = { kind, dir, ...info };
  let t;
  try {
    // le nouvel écran est photographié dès que le DOM a basculé : on n'attend jamais les données,
    // la typographie des formules ni les illustrations (plafond dur : 250 ms)
    t = document.startViewTransition(() => Promise.race([(async () => {
      ready = null; const T0 = performance.now(); const L = window.__vtlog = [];
      await update(); L.push('upd ' + Math.round(performance.now() - T0));
      await tick(); L.push('tick ' + Math.round(performance.now() - T0));
      if (ready) await Promise.race([ready, wait(150)]); L.push('ready ' + Math.round(performance.now() - T0));
    })(), wait(250)]));
  } catch (e) { root.classList.remove(...cls); nav = null; await update(); onDone && onDone(); return; }
  activeVT = t;
  const done = () => { if (activeVT === t) activeVT = null; if (me !== vtSeq) return; root.classList.remove(...cls); nav = null; ready = null; onDone && onDone(); };
  t.finished.then(done, done);
  return t.updateCallbackDone.catch(() => {});
}

function parseHash(h) {
  const p = decodeURIComponent(h.replace(/^#/, '')).split('/').filter(Boolean);
  if (p[0] === 'c' && p[1]) return { name: 'course', course: p[1], tab: p[2] || '' };
  if (p[0] === 'compte') return { name: 'account' };
  return { name: 'home' };
}
if (typeof window !== 'undefined') {
  curRoute = parseHash(location.hash);
  // écouteur posé avant celui du routeur : il connaît encore l'écran quitté
  addEventListener('hashchange', () => { lastRoute = curRoute; curRoute = parseHash(location.hash); });
}
const hashChanged = () => new Promise(r => addEventListener('hashchange', r, { once: true }));

/** Navigation interne chorégraphiée (clic sur un lien #/…). Retourne false si le lien doit être laissé au navigateur. */
export function go(href, origin) {
  if (href === location.hash || (href === '#/' && (location.hash === '' || location.hash === '#'))) return false;
  const from = parseHash(location.hash), to = parseHash(href);
  let kind = 'fade', dir = '', info = {};
  if (from.name === 'home') saveHomeScroll(scrollY);
  if (from.name === 'home' && to.name === 'course') {
    kind = 'fwd';
    const card = origin && origin.closest('.course-card');
    if (card) { card.classList.add('vt-target'); info.id = to.course; }
  } else if (from.name === 'course' && to.name === 'home') {
    kind = 'back'; info.id = from.course;
  } else if (from.name === 'course' && to.name === 'course' && from.course === to.course) {
    const links = [...document.querySelectorAll('nav.tabs a')];
    const a = links.findIndex(l => l.getAttribute('aria-current') === 'page');
    const b = links.findIndex(l => l.getAttribute('href') === href);
    if (a >= 0 && b >= 0 && a !== b) { kind = 'tab'; dir = b > a ? 'r' : 'l'; }
  }
  if (kind === 'fwd' || kind === 'back') root().classList.add('vt-card');
  // onglet : si l'on avait défilé sous l'en-tête, on reste au niveau de la barre d'onglets
  let keep = -1;
  if (kind === 'tab') {
    const head = document.querySelector('.course-head');
    if (head) { const top = head.getBoundingClientRect().bottom + scrollY + 10; if (scrollY > top) keep = top; }
  }
  const cleanCard = () => { root().classList.remove('vt-card'); document.querySelectorAll('.vt-target').forEach(e => e.classList.remove('vt-target')); };
  transition(kind, async () => {
    const changed = hashChanged(); const T1 = performance.now();
    location.hash = href;
    await Promise.race([changed, wait(250)]); (window.__vtlog2 = window.__vtlog2 || []).push('hash ' + Math.round(performance.now() - T1));
    await tick();
    if (keep >= 0) scrollTo({ top: keep });
  }, { dir, info, onDone: cleanCard, fallbackEl: () => document.querySelector('main.panel') });
  return true;
}
const root = () => document.documentElement;

/* ---------------------------------------------------------------- intro de l'accueil */

const INTRO_KEY = 'rv-intro';
/** L'intro de l'accueil se joue une fois par session, seulement si l'accueil est le premier écran affiché. */
export function introDue() {
  if (reduced()) return false;
  try { if (sessionStorage.getItem(INTRO_KEY)) return false; sessionStorage.setItem(INTRO_KEY, '1'); } catch (e) { return false; }
  return typeof performance === 'undefined' || performance.now() < 5000;
}
/** Démarre l'intro (classe sur <html>) ; tout clic, touche, molette ou défilement la termine aussitôt. */
export function playIntro(ms = 1500) {
  const r = root();
  r.classList.add('intro');
  const evs = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
  let timer;
  const end = skip => {
    clearTimeout(timer);
    evs.forEach(e => removeEventListener(e, onSkip, true));
    removeEventListener('scroll', onSkip);
    // « intro-skip » reste posé tant que l'accueil est affiché : les animations restent terminées
    if (skip) r.classList.add('intro-skip');
    r.classList.remove('intro');
  };
  const onSkip = () => end(true);
  evs.forEach(e => addEventListener(e, onSkip, { capture: true, passive: true }));
  addEventListener('scroll', onSkip, { passive: true });
  timer = setTimeout(() => end(false), ms);
  return () => { end(false); r.classList.remove('intro-skip'); };
}

/* ---------------------------------------------------------------- petits effets */

/** Inclinaison 3D d'une carte qui suit le pointeur (souris seulement), avec reflet. Action Svelte. */
export function tilt(el) {
  if (reduced() || typeof matchMedia !== 'function' || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let raf = 0, x = 0, y = 0;
  const paint = () => { raf = 0; el.style.setProperty('--px', x.toFixed(3)); el.style.setProperty('--py', y.toFixed(3)); };
  const move = e => {
    const b = el.getBoundingClientRect();
    x = ((e.clientX - b.left) / b.width) * 2 - 1; y = ((e.clientY - b.top) / b.height) * 2 - 1;
    if (!raf) raf = requestAnimationFrame(paint);
  };
  const enter = () => el.classList.add('tilting');
  const leave = () => { el.classList.remove('tilting'); x = 0; y = 0; if (!raf) raf = requestAnimationFrame(paint); };
  el.addEventListener('pointerenter', enter);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerleave', leave);
  return { destroy() { cancelAnimationFrame(raf); el.removeEventListener('pointerenter', enter); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); } };
}

/** Onde d'encre au point d'appui, sur tout élément [data-ripple] (délégation globale, à installer une fois). */
export function installRipple() {
  if (typeof document === 'undefined') return () => {};
  const on = e => {
    if (reduced() || e.button > 0) return;
    const el = e.target.closest && e.target.closest('[data-ripple]');
    if (!el) return;
    const b = el.getBoundingClientRect();
    const d = Math.hypot(Math.max(e.clientX - b.left, b.right - e.clientX), Math.max(e.clientY - b.top, b.bottom - e.clientY)) * 2;
    const s = document.createElement('span');
    s.className = 'ripple';
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - b.left - d / 2}px;top:${e.clientY - b.top - d / 2}px`;
    el.appendChild(s);
    const a = s.animate([{ transform: 'scale(0)', opacity: .32 }, { transform: 'scale(1)', opacity: 0 }], { duration: 650, easing: 'cubic-bezier(.2,.7,.3,1)' });
    a.onfinish = () => s.remove();
    setTimeout(() => s.remove(), 900);
  };
  document.addEventListener('pointerdown', on, { passive: true });
  return () => document.removeEventListener('pointerdown', on);
}

/** Ajoute `cls` aux éléments quand ils entrent à l'écran (ceux déjà visibles : en cascade, tout de suite). */
export function onEnter(root, sel, cls = 'in-view', stagger = 70) {
  if (!root) return () => {};
  const els = [...root.querySelectorAll(sel)];
  if (reduced() || typeof IntersectionObserver !== 'function') { els.forEach(e => e.classList.add(cls)); return () => {}; }
  const o = new IntersectionObserver(es => {
    let k = 0;
    for (const e of es) if (e.isIntersecting) {
      e.target.style.setProperty('--enter-delay', (k++ * stagger) + 'ms');
      e.target.classList.add(cls); o.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
  els.forEach(e => o.observe(e));
  return () => o.disconnect();
}

/** Barre de lecture (progression dans `el`), fixée en haut de l'écran. Retourne une fonction de nettoyage. */
export function readingBar(getEl) {
  if (typeof document === 'undefined') return () => {};
  const bar = document.createElement('div');
  bar.className = 'read-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<i></i>';
  document.body.appendChild(bar);
  const fill = bar.firstChild;
  let raf = 0;
  const paint = () => {
    raf = 0;
    const el = getEl();
    if (!el) return;
    const b = el.getBoundingClientRect();
    const span = Math.max(1, b.height - innerHeight * 0.6);
    const p = Math.min(1, Math.max(0, (innerHeight * 0.25 - b.top) / span));
    fill.style.transform = `scaleX(${p.toFixed(4)})`;
    bar.classList.toggle('on', b.top < innerHeight * 0.25 && b.bottom > 0);
  };
  const on = () => { if (!raf) raf = requestAnimationFrame(paint); };
  addEventListener('scroll', on, { passive: true });
  addEventListener('resize', on, { passive: true });
  on();
  return Object.assign(() => { cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on); bar.remove(); }, { update: on });
}

/** Éclat (cercle d'encre + particules) centré sur un élément : récompense d'une case cochée. */
export function burst(el, n = 14) {
  if (!el || reduced() || typeof document === 'undefined') return;
  const b = el.getBoundingClientRect();
  const box = document.createElement('div');
  box.className = 'burst';
  box.setAttribute('aria-hidden', 'true');
  box.style.cssText = `left:${b.left + b.width / 2}px;top:${b.top + b.height / 2}px`;
  const ring = document.createElement('b');
  box.appendChild(ring);
  ring.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: .9 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }], { duration: 560, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
  for (let k = 0; k < n; k++) {
    const i = document.createElement('i');
    i.style.background = COLORS[k % COLORS.length];
    if (k % 2) i.style.borderRadius = '50%';
    box.appendChild(i);
    const a = (k / n) * Math.PI * 2 + Math.random() * .3, r = 34 + Math.random() * 26;
    i.animate([
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * r}px), calc(-50% + ${Math.sin(a) * r}px)) scale(.9) rotate(${a}rad)`, opacity: 1, offset: .65 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * r * 1.2}px), calc(-50% + ${Math.sin(a) * r * 1.2 + 8}px)) scale(0)`, opacity: 0 },
    ], { duration: 720 + Math.random() * 200, easing: 'cubic-bezier(.15,.75,.3,1)', fill: 'forwards' });
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 1000);
}

/* ---------------------------------------------------------------- existant : apparition au défilement, confettis */

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
