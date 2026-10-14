// Motion design des écrans d'étude (flashcards, QCM, fiches, formulaire, annales, labos, requêtes).
// Principes : uniquement transform / opacity / clip-path / tracés SVG ; rien n'est caché si le système
// demande de réduire les animations ; aucune boucle qui tourne hors écran.
import { tokens, esc } from './code.js';

export const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const raf = f => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(f) : setTimeout(f, 16));

/** Rejoue une animation CSS (classe) sur un élément, même si elle vient d'être jouée. */
export function play(el, cls, ms = 1200) {
  if (!el || reduced()) return;
  el.classList.remove(cls);
  void el.offsetWidth; // nouveau départ de l'animation
  el.classList.add(cls);
  clearTimeout(el['__mc_' + cls]);
  el['__mc_' + cls] = setTimeout(() => el.classList.remove(cls), ms);
}

/* ------------------------------------------------------------------------------------------------
   Sélecteur à « encre glissante » : une copie inversée des puces (fond encre, texte papier) est posée
   par-dessus la rangée et découpée (clip-path) sur la puce active. Changer de puce fait glisser la
   découpe : l'encre semble couler d'une puce à l'autre, en passant sur celles du milieu.
   ------------------------------------------------------------------------------------------------ */
export function lens(node, opts = {}) {
  if (!node || typeof ResizeObserver !== 'function' || typeof MutationObserver !== 'function') return {};
  const item = opts.item || 'button';
  const layer = document.createElement('div');
  layer.className = 'mc-lens';
  layer.setAttribute('aria-hidden', 'true');
  layer.inert = true;
  node.classList.add('mc-lensed');
  let queued = false, ready = false, dead = false;

  function sync() {
    queued = false;
    if (dead) return;
    if (layer.parentNode !== node) node.appendChild(layer);
    const items = [...node.children].filter(c => c !== layer && c.matches(item));
    const cs = getComputedStyle(node);
    for (const p of ['display', 'flexWrap', 'gap', 'rowGap', 'columnGap', 'gridTemplateColumns', 'alignItems', 'justifyContent', 'padding'])
      layer.style[p] = cs[p];
    if (layer.style.display.startsWith('inline')) layer.style.display = layer.style.display.replace('inline-', '');
    layer.replaceChildren(...items.map(c => {
      const k = c.cloneNode(true);
      k.removeAttribute('id'); k.tabIndex = -1; k.removeAttribute('aria-label');
      return k;
    }));
    const on = items.find(c => c.getAttribute('aria-pressed') === 'true' || c.getAttribute('aria-selected') === 'true');
    const W = node.clientWidth, H = node.clientHeight;
    if (!on || !W) { layer.style.opacity = '0'; return; }
    const l = on.offsetLeft, t = on.offsetTop, w = on.offsetWidth, h = on.offsetHeight;
    const r = getComputedStyle(on).borderTopLeftRadius || '999px';
    layer.style.opacity = '1';
    layer.style.clipPath = `inset(${t}px ${Math.max(0, W - l - w)}px ${Math.max(0, H - t - h)}px ${l}px round ${r})`;
    if (!ready) raf(() => raf(() => { ready = true; layer.classList.add('mc-lens-on'); }));
  }
  const queue = () => { if (!queued) { queued = true; raf(sync); } };
  const mo = new MutationObserver(recs => {
    if (recs.some(r => r.target !== layer && !layer.contains(r.target) && !(r.type === 'childList' && [...r.addedNodes, ...r.removedNodes].every(n => n === layer)))) queue();
  });
  mo.observe(node, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-pressed', 'aria-selected', 'disabled', 'class'] });
  const ro = new ResizeObserver(queue);
  ro.observe(node);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);
  sync();
  return {
    destroy() { dead = true; mo.disconnect(); ro.disconnect(); layer.remove(); node.classList.remove('mc-lensed'); },
  };
}

/* ------------------------------------------------------------------------------------------------
   Compteur à rouleaux : chaque chiffre est une colonne 0-9 qui défile jusqu'à sa valeur.
   <span use:roll={n}></span>  ou  use:roll={{ value: n, from: 0 }} pour partir de zéro à l'affichage.
   ------------------------------------------------------------------------------------------------ */
export function roll(node, param) {
  node.classList.add('mc-roll');
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  const box = document.createElement('span');
  box.className = 'mc-roll-box';
  box.setAttribute('aria-hidden', 'true');
  node.replaceChildren(sr, box);
  const cols = [];
  const col = () => {
    const d = document.createElement('span');
    d.className = 'mc-roll-d';
    const c = document.createElement('span');
    c.className = 'mc-roll-c';
    for (let k = 0; k < 10; k++) { const s = document.createElement('span'); s.textContent = k; c.appendChild(s); }
    d.appendChild(c);
    return d;
  };
  const setCol = (d, v) => { d.firstChild.style.transform = `translateY(${-v * 10}%)`; };
  function render(p, first) {
    const o = typeof p === 'object' && p !== null ? p : { value: p };
    const v = Math.max(0, Math.round(Number(o.value) || 0));
    const s = String(v);
    sr.textContent = s;
    while (cols.length < s.length) { const d = col(); box.prepend(d); cols.unshift(d); setCol(d, 0); }
    while (cols.length > s.length) cols.shift().remove();
    const apply = () => cols.forEach((d, k) => { d.style.setProperty('--k', cols.length - 1 - k); setCol(d, +s[k]); });
    if (first && o.from !== undefined && !reduced()) { cols.forEach(d => setCol(d, 0)); raf(() => raf(apply)); }
    else apply();
  }
  render(param, true);
  return { update: p => render(p, false) };
}

/* ------------------------------------------------------------------------------------------------
   Texte cinétique : le HTML est posé par l'action (Svelte ne le gère pas), puis chaque mot (et chaque
   formule KaTeX, d'un bloc) est enveloppé pour monter à son tour.
   ------------------------------------------------------------------------------------------------ */
export function kinetic(node, html) {
  function set(h) {
    node.innerHTML = h ?? '';
    if (reduced()) return;
    let i = 0;
    const wrap = (n) => { const s = document.createElement('span'); s.className = 'mc-w'; s.style.setProperty('--i', Math.min(i++, 28)); n.replaceWith(s); s.appendChild(n); };
    const walk = el => {
      for (const n of [...el.childNodes]) {
        if (n.nodeType === 3) {
          if (!n.textContent.trim()) continue;
          const frag = document.createDocumentFragment();
          for (const p of n.textContent.split(/(\s+)/)) {
            if (!p) continue;
            if (/^\s+$/.test(p)) { frag.append(p); continue; }
            const s = document.createElement('span'); s.className = 'mc-w'; s.style.setProperty('--i', Math.min(i++, 28)); s.textContent = p; frag.append(s);
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          if (n.classList.contains('katex') || /^(svg|img|code|canvas)$/i.test(n.tagName)) wrap(n);
          else walk(n);
        }
      }
    };
    walk(node);
    node.classList.remove('mc-kin'); void node.offsetWidth; node.classList.add('mc-kin');
  }
  set(html);
  return { update: set };
}

/* ------------------------------------------------------------------------------------------------
   Apparition à l'encre : les formules s'écrivent de gauche à droite (découpe), les passages à savoir
   reçoivent un coup de surligneur, quand ils entrent à l'écran. Ce qui est déjà visible s'anime en cascade.
   ------------------------------------------------------------------------------------------------ */
let io = null;
function observer() {
  if (io || typeof IntersectionObserver !== 'function') return io;
  io = new IntersectionObserver(es => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add('mc-ink-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
  return io;
}
const INK = '.math, .f, .form-tex, .key, .memo-code';
export function inkReveal(root, sel = INK) {
  if (!root || reduced()) return;
  const o = observer();
  if (!o) return;
  const H = innerHeight;
  let k = 0;
  for (const el of root.querySelectorAll(sel)) {
    if (el.dataset.mcInk || el.closest('.mc-lens')) continue;
    el.dataset.mcInk = '1';
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) { el.classList.add('mc-ink'); o.observe(el); continue; } // dans un bloc replié
    if (r.bottom < 0) continue; // déjà passé : jamais caché
    el.classList.add('mc-ink');
    if (r.top < H * 0.92) { el.style.setProperty('--d', Math.min(k++, 10) * 70 + 'ms'); el.classList.add('mc-ink-in'); }
    else o.observe(el);
  }
}

/* ------------------------------------------------------------------------------------------------
   Calque de vol : une copie de la carte s'envole (fixe, au-dessus de la page, sans débordement).
   ------------------------------------------------------------------------------------------------ */
let flyLayer = null;
export function flyAway(el, { dir = 1, tone = '', from = null } = {}) {
  if (!el || reduced() || typeof el.animate !== 'function') return;
  if (!flyLayer || !flyLayer.isConnected) {
    flyLayer = document.createElement('div');
    flyLayer.className = 'mc-fly-layer';
    flyLayer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(flyLayer);
  }
  const r = el.getBoundingClientRect();
  const k = el.cloneNode(true);
  k.inert = true;
  k.classList.add('mc-fly');
  if (tone) k.classList.add('fly-' + tone);
  // la copie part de l'endroit où était la carte : on retire les animations passagères (classes mc-a-*) et le glissé
  for (const n of [k, ...k.querySelectorAll('*')]) {
    for (const c of [...n.classList]) if (c.startsWith('mc-a-')) n.classList.remove(c);
    if (n !== k && n.style) { n.style.translate = ''; n.style.rotate = ''; }
  }
  k.style.cssText += `;position:absolute;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;translate:none;rotate:none`;
  const x0 = from ? from.x : 0, y0 = from ? from.y : 0, a0 = from ? from.rot : 0;
  if (tone) {
    const t = document.createElement('i');
    t.className = 'mc-trail trail-' + tone;
    t.style.cssText = `left:${r.left}px;top:${r.top + r.height * 0.15}px;width:${r.width}px;height:${r.height * 0.7}px;--dir:${dir}`;
    flyLayer.appendChild(t);
    t.animate([
      { opacity: 0, transform: `translateX(${x0}px) scaleX(.3)` },
      { opacity: 0.55, offset: 0.35 },
      { opacity: 0, transform: `translateX(${x0 + dir * r.width * 0.55}px) scaleX(1.25)` },
    ], { duration: 520, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => t.remove();
  }
  flyLayer.appendChild(k);
  const dx = dir * (innerWidth * 0.55 + r.width * 0.75);
  const anim = k.animate([
    { transform: `translate(${x0}px, ${y0}px) rotate(${a0}deg)`, opacity: 1 },
    { transform: `translate(${dx}px, ${y0 + 60}px) rotate(${dir * 22}deg)`, opacity: 0 },
  ], { duration: 460, easing: 'cubic-bezier(.35,.4,.45,1)' });
  anim.onfinish = anim.oncancel = () => k.remove();
}

/* ------------------------------------------------------------------------------------------------
   Requêtes : solution colorée où les jetons absents de la réponse sont surlignés (marqueur animé).
   ------------------------------------------------------------------------------------------------ */
const normTok = ([t, s]) => t === 'k' ? s.toUpperCase() : t === 's' ? '"' + s.slice(1, -1) + '"' : s;
export function markMissing(src, miss) {
  const want = new Set(miss || []);
  let i = 0;
  return tokens(src).map(([t, s]) => {
    let h = (t === 'w' || t === 'p' || t === 'i') ? esc(s) : `<span class="hl-${t}">${esc(s)}</span>`;
    if (t !== 'w' && t !== 'p' && t !== 'c' && want.has(normTok([t, s]))) h = `<mark class="rq-mk" style="--i:${Math.min(i++, 12)}">${h}</mark>`;
    return h;
  }).join('');
}
/** Action : pose un HTML (géré hors de Svelte). */
export function html(node, h) {
  let cur = h ?? '';
  node.innerHTML = cur;
  return { update: v => { if ((v ?? '') !== cur) node.innerHTML = cur = v ?? ''; } };
}
