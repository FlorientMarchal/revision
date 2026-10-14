// Illustrations interactives des leçons de probabilités et d'estimation (p1, p2, s1). Tout est calculé dans le navigateur
// (SVG + couleurs du thème) ; les tirages utilisent un générateur pseudo-aléatoire à graine, donc reproductibles.
import './viz-proba.css';

/* ================================================================== outils communs */
const fmt = (x, d = 2) => (Number.isFinite(x) ? Number(x).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−') : '—');
const num = (x, d = 3) => (Number.isFinite(x) ? Number(x).toLocaleString('fr-FR', { maximumFractionDigits: d }).replace('-', '−') : '—');
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };
/** Écriture scientifique d'un nombre positif donné par son log10 (évite les dépassements pour les vraisemblances). */
const sci10 = (lg, d = 2) => {
  if (!Number.isFinite(lg)) return '0';
  let e = Math.floor(lg), m = 10 ** (lg - e);
  if (m >= 9.995) { m /= 10; e += 1; }
  if (e >= -3 && e <= 4) return num(10 ** lg, 4);
  return `${fmt(m, d)} × 10${String(e).replace(/./g, c => SUP[c])}`;
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const head = (t, hint) => `<figcaption><b>${t}</b>${hint ? `<span>${hint}</span>` : ''}</figcaption>`;
const svg = (w, h, body, label, extra = '') => `<svg viewBox="0 0 ${w} ${h}" class="vz-svg vp-svg" role="img" aria-label="${esc(label)}" ${extra}>${body}</svg>`;
const btn = (k, t, attr = 'data-a') => `<button type="button" class="btn small" ${attr}="${k}">${t}</button>`;
const rangeI = (k, lab, min, max, step, v) => `<label>${lab} = <b data-o="${k}"></b><input type="range" min="${min}" max="${max}" step="${step}" value="${v}" data-i="${k}" aria-label="${esc(lab)}"></label>`;
const chips = (attr, opts, cur) => `<div class="vp-seg" role="group">${opts.map(([k, l]) => `<button type="button" class="chip" data-${attr}="${k}" aria-pressed="${k === cur}">${l}</button>`).join('')}</div>`;
const press = (el, attr, cur) => el.querySelectorAll(`[data-${attr}]`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset[attr] === String(cur))));
const leg = items => `<div class="viz-leg">${items.map(([c, t, k = '']) => `<span><i class="sw ${k}" style="--sw:${c}"></i>${t}</span>`).join('')}</div>`;
const CAT = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)'];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const sum = a => a.reduce((s, v) => s + v, 0);
const mean = a => (a.length ? sum(a) / a.length : NaN);
const path = pts => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');

/* animation : respect de prefers-reduced-motion, arrêt quand la figure quitte le DOM */
const RM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
const ease = u => (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) ** 2);
/** Interpolation de 0 à 1 en ms millisecondes ; renvoie une fonction d'annulation. */
function tween(el, ms, step, done) {
  if (RM()) { step(1); if (done) done(); return () => {}; }
  let id = 0, t0 = null, stop = false;
  const f = now => {
    if (stop || !el.isConnected) return;
    if (t0 === null) t0 = now;
    const u = Math.min(1, (now - t0) / ms);
    step(ease(u));
    if (u < 1) id = requestAnimationFrame(f); else if (done) done();
  };
  id = requestAnimationFrame(f);
  return () => { stop = true; cancelAnimationFrame(id); };
}
/** Boucle d'animation : frame(now) renvoie true tant qu'il reste quelque chose à animer. Renvoie la fonction qui la relance. */
function loop(el, frame) {
  let id = 0;
  const run = now => { id = 0; if (!el.isConnected) return; if (frame(now)) id = requestAnimationFrame(run); };
  return () => { if (!id) id = requestAnimationFrame(run); };
}

/* hasard à graine */
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(r) { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
const sPois = (r, l) => { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; };
const sExp = (r, l) => -Math.log(1 - r()) / l;
function sGamma(r, a, l) { // Marsaglia-Tsang (a ≥ 1)
  const d = a - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x, v; do { x = gauss(r); v = 1 + c * x; } while (v <= 0);
    v = v * v * v; const u = r();
    if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v / l;
  }
}
/* fonctions spéciales */
function lgamma(x) {
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
  x -= 1; let a = c[0]; const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
const lfact = k => lgamma(k + 1);
function erf(x) { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)); }
const Phi = z => 0.5 * (1 + erf(z / Math.SQRT2));
const npdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
const gpdf = (x, a, l) => (x <= 0 ? (a === 1 ? l : 0) : Math.exp(a * Math.log(l) - lgamma(a) + (a - 1) * Math.log(x) - l * x));
const bpmf = (k, n, p) => (k < 0 || k > n ? 0 : Math.exp(lfact(n) - lfact(k) - lfact(n - k) + (k ? k * Math.log(p) : 0) + (n - k ? (n - k) * Math.log(1 - p) : 0)));

/* axes */
function niceTicks(lo, hi, n = 5) {
  const span = hi - lo; if (!(span > 0)) return [lo];
  const s0 = span / n, mag = 10 ** Math.floor(Math.log10(s0)), e = s0 / mag;
  const step = (e >= 7.5 ? 10 : e >= 3.5 ? 5 : e >= 1.5 ? 2 : 1) * mag, out = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}
/** Cadre : axes, graduations, quadrillage horizontal. Renvoie { X, Y, g }. */
function frame({ L, R, T, B, xlo, xhi, ylo = 0, yhi, xt, yt, xl = '', yl = '', xf = v => num(v, 2), yf = v => num(v, 3), noY = false }) {
  const X = v => L + (v - xlo) / (xhi - xlo) * (R - L), Y = v => B - (v - ylo) / (yhi - ylo) * (B - T);
  let g = '';
  if (!noY) (yt || niceTicks(ylo, yhi, 4)).forEach(v => { if (v > ylo + 1e-12) g += `<line x1="${L}" x2="${R}" y1="${Y(v)}" y2="${Y(v)}" class="vz-grid"/>`; g += `<text x="${L - 5}" y="${Y(v) + 4}" class="vz-t vz-s" text-anchor="end">${yf(v)}</text>`; });
  g += `<path d="M${L},${T - 4}V${B}H${R}" class="vz-axis"/>`;
  (xt || niceTicks(xlo, xhi, 6)).forEach(v => { if (v >= xlo - 1e-9 && v <= xhi + 1e-9) g += `<line x1="${X(v)}" x2="${X(v)}" y1="${B}" y2="${B + 4}" class="vz-axis"/><text x="${X(v)}" y="${B + 16}" class="vz-t vz-s" text-anchor="middle">${xf(v)}</text>`; });
  if (xl) g += `<text x="${R}" y="${B - 6}" class="vz-t vz-s vp-tm" text-anchor="end">${xl}</text>`;
  if (yl) g += `<text x="${L + 6}" y="${T + 4}" class="vz-t vz-s vp-tm">${yl}</text>`;
  return { X, Y, g };
}
/** Coordonnées d'un événement pointeur dans le repère viewBox d'un SVG. */
function svgPt(s, e) { const r = s.getBoundingClientRect(), vb = s.viewBox.baseVal; return [vb.x + (e.clientX - r.left) * vb.width / r.width, vb.y + (e.clientY - r.top) * vb.height / r.height]; }

/* ================================================================== 1. explorateur de lois */
const LAWS = {
  bern: { nom: 'Bernoulli', disc: 1, P: [['p', 'p', 0.05, 0.95, 0.05, 0.3]], lab: p => `Ber(${num(p.p)})`, sup: () => [0, 1], pmf: (k, p) => (k ? p.p : 1 - p.p), E: p => p.p, V: p => p.p * (1 - p.p), s: (r, p) => (r() < p.p ? 1 : 0),
    f: 'P(X = 1) = p, P(X = 0) = 1 − p ; E = p, V = p(1 − p)', obs: 'la proportion de 1 se rapproche de p ; la variance p(1 − p) est maximale pour p = 0,5.' },
  binom: { nom: 'Binomiale', disc: 1, P: [['n', 'n', 1, 30, 1, 10], ['p', 'p', 0.05, 0.95, 0.05, 0.3]], lab: p => `B(${p.n} ; ${num(p.p)})`, sup: p => [0, p.n], pmf: (k, p) => bpmf(k, p.n, p.p), E: p => p.n * p.p, V: p => p.n * p.p * (1 - p.p),
    s: (r, p) => { let c = 0; for (let i = 0; i < p.n; i++) if (r() < p.p) c++; return c; },
    f: 'P(X = k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ ; E = np, V = np(1 − p)', obs: 'symétrique pour p = 0,5, penchée à droite si p est petit ; le pic est près de E = np.' },
  geom: { nom: 'Géométrique', disc: 1, P: [['p', 'p', 0.1, 0.9, 0.05, 0.3]], lab: p => `G(${num(p.p)})`, sup: p => [1, Math.max(6, Math.min(30, Math.ceil(Math.log(0.003) / Math.log(1 - p.p))))], pmf: (k, p) => (1 - p.p) ** (k - 1) * p.p, E: p => 1 / p.p, V: p => (1 - p.p) / p.p ** 2,
    s: (r, p) => { let k = 1; while (r() >= p.p) k++; return k; },
    f: 'P(X = k) = (1 − p)ᵏ⁻¹ p pour k ≥ 1 ; E = 1/p, V = (1 − p)/p²', obs: 'P(X = 1) = p est toujours la plus grande valeur ; plus p est petit, plus on attend le premier succès (E = 1/p).' },
  pois: { nom: 'Poisson', disc: 1, P: [['l', 'λ', 0.5, 15, 0.5, 3]], lab: p => `P(${num(p.l)})`, sup: p => [0, Math.ceil(p.l + 4 * Math.sqrt(p.l) + 3)], pmf: (k, p) => Math.exp(-p.l + k * Math.log(p.l) - lfact(k)), E: p => p.l, V: p => p.l, s: (r, p) => sPois(r, p.l),
    f: 'P(X = k) = e^(−λ) λᵏ / k! ; E = V = λ', obs: 'quand λ grandit, la loi se décale et s\'étale (V = λ) et prend une forme de cloche.' },
  unif: { nom: 'Uniforme', P: [['a', 'a', -3, 3, 0.5, 0], ['b', 'b', -2.5, 6, 0.5, 2]], lab: p => `U(${num(p.a)} ; ${num(p.b)})`, range: p => { const w = p.b - p.a; return [p.a - 0.35 * w - 0.3, p.b + 0.35 * w + 0.3]; },
    pdf: (x, p) => (x >= p.a && x <= p.b ? 1 / (p.b - p.a) : 0), E: p => (p.a + p.b) / 2, V: p => (p.b - p.a) ** 2 / 12, s: (r, p) => p.a + (p.b - p.a) * r(),
    f: 'f(x) = 1/(b − a) sur [a, b] ; E = (a + b)/2, V = (b − a)²/12', obs: 'la hauteur vaut 1/(b − a) : plus l\'intervalle est large, plus la densité est basse (l\'aire reste égale à 1).' },
  norm: { nom: 'Normale', P: [['m', 'μ', -3, 3, 0.5, 0], ['s', 'σ', 0.3, 3, 0.1, 1]], lab: p => `N(${num(p.m)} ; ${num(p.s ** 2, 2)})`, range: p => [p.m - 4 * p.s, p.m + 4 * p.s], pdf: (x, p) => npdf(x, p.m, p.s), E: p => p.m, V: p => p.s ** 2, s: (r, p) => p.m + p.s * gauss(r),
    f: 'f(x) = e^(−(x − μ)²/(2σ²)) / (σ√(2π)) ; E = μ, V = σ²', obs: 'μ déplace la cloche, σ l\'étale ; environ 95 % des tirages tombent dans [μ − 1,96σ ; μ + 1,96σ].' },
  expo: { nom: 'Exponentielle', P: [['l', 'λ', 0.2, 3, 0.1, 1]], lab: p => `E(${num(p.l)})`, range: p => [0, 6 / p.l], pdf: (x, p) => (x < 0 ? 0 : p.l * Math.exp(-p.l * x)), E: p => 1 / p.l, V: p => 1 / p.l ** 2, s: (r, p) => sExp(r, p.l),
    f: 'f(x) = λe^(−λx) pour x ≥ 0 ; E = 1/λ, V = 1/λ²', obs: 'beaucoup de durées courtes, quelques très longues ; la moyenne vaut 1/λ, et la densité en 0 vaut λ.' },
  gamma: { nom: 'Gamma', P: [['a', 'a', 1, 10, 0.5, 3], ['l', 'λ', 0.5, 3, 0.1, 1]], lab: p => `Γ(${num(p.a)} ; ${num(p.l)})`, range: p => [0, (p.a + 4.5 * Math.sqrt(p.a) + 1) / p.l], pdf: (x, p) => gpdf(x, p.a, p.l), E: p => p.a / p.l, V: p => p.a / p.l ** 2, s: (r, p) => sGamma(r, p.a, p.l),
    f: 'f(x) = λᵃ xᵃ⁻¹ e^(−λx) / Γ(a) pour x > 0 ; E = a/λ, V = a/λ²', obs: 'Γ(1, λ) est l\'exponentielle ; quand a augmente, la loi se décale (E = a/λ) et ressemble de plus en plus à une cloche.' },
};

function loisViz(el, keys, title) {
  let law = keys[0], P = {}, data = [], parts = [], sel = null, lastV = null;
  const r = rng(2024);
  el.innerHTML = head(title, 'Choisis une loi et règle ses paramètres, puis fais des tirages : chaque bille tombe dans l\'histogramme.') +
    chips('law', keys.map(k => [k, LAWS[k].nom]), law) +
    `<div class="viz-ctrl" data-s="par"></div>
     <div class="viz-btns">${btn(1, 'Tirer 1')}${btn(100, 'Tirer 100')}${btn(1000, 'Tirer 1 000')}${btn(0, 'Effacer')}</div>
     <div class="vp-stage" data-s="stage"></div>
     ${leg([['var(--accent)', 'loi théorique', 'sw-l'], ['var(--c4)', 'fréquences des tirages', 'sw-a'], ['var(--red)', 'espérance E(X)', 'sw-d'], ['var(--accent-soft)', 'E ± σ']])}
     <div class="vp-kpis" data-o="kp"></div><p class="viz-out" data-o="out"></p>`;
  const stage = el.querySelector('[data-s=stage]');

  const setLaw = k => {
    law = k; P = {}; sel = null;
    const Lw = LAWS[k];
    Lw.P.forEach(([key, , , , , v]) => { P[key] = v; });
    const par = el.querySelector('[data-s=par]');
    par.innerHTML = Lw.P.map(([key, lab, mn, mx, st, v]) => rangeI(key, lab, mn, mx, st, v)).join('');
    par.querySelectorAll('[data-i]').forEach(inp => {
      inp.oninput = () => {
        P[inp.dataset.i] = +inp.value;
        if (law === 'unif') { // a < b
          const ia = par.querySelector('[data-i=a]'), ib = par.querySelector('[data-i=b]');
          if (P.b < P.a + 0.5) { if (inp.dataset.i === 'a') { P.b = P.a + 0.5; ib.value = P.b; } else { P.a = P.b - 0.5; ia.value = P.a; } }
        }
        reset();
      };
    });
    press(el, 'law', k);
    reset();
  };
  const reset = () => { data = []; parts = []; lastV = null; sel = null; draw(); };

  const geo = () => {
    const Lw = LAWS[law], N = data.length, W = 420, H = 250, L = 42, R = W - 12, T = 26, B = H - 28;
    const o = { W, H, L, R, T, B };
    if (Lw.disc) {
      const [k0, k1] = Lw.sup(P), nk = k1 - k0 + 1, bw = (R - L) / nk, cnt = new Array(nk).fill(0);
      data.forEach(v => { if (v >= k0 && v <= k1) cnt[v - k0]++; });
      const fr = cnt.map(c => (N ? c / N : 0)), pm = Array.from({ length: nk }, (_, i) => Lw.pmf(k0 + i, P));
      const ym = Math.max(...pm, ...fr) * 1.18;
      const X = k => L + (k - k0 + 0.5) * bw, Y = v => B - v / ym * (B - T);
      Object.assign(o, { k0, k1, nk, bw, fr, pm, ym, X, Y, xlo: k0 - 0.5, xhi: k1 + 0.5, land: v => [X(clamp(v, k0, k1)) + (v > k1 ? bw * 0.3 : 0), Y(fr[clamp(v, k0, k1) - k0] || 0)] });
    } else {
      const [lo, hi] = Lw.range(P), nb = 30, bw = (hi - lo) / nb, cnt = new Array(nb).fill(0);
      data.forEach(v => { const i = Math.floor((v - lo) / bw); if (i >= 0 && i < nb) cnt[i]++; });
      const den = cnt.map(c => (N ? c / (N * bw) : 0)), xs = Array.from({ length: 241 }, (_, i) => lo + (hi - lo) * i / 240), fs = xs.map(x => Lw.pdf(x, P));
      const ym = Math.max(...fs, ...den) * 1.15;
      const X = v => L + (v - lo) / (hi - lo) * (R - L), Y = v => B - v / ym * (B - T);
      Object.assign(o, { lo, hi, nb, bw, den, xs, fs, ym, X, Y, xlo: lo, xhi: hi, land: v => { const i = Math.floor((v - lo) / bw); return [X(clamp(v, lo, hi)), Y(i >= 0 && i < nb ? den[i] : 0)]; } });
    }
    return o;
  };

  const draw = (now = performance.now()) => {
    const Lw = LAWS[law], o = geo(), { L, R, T, B, X, Y } = o, E = Lw.E(P), sd = Math.sqrt(Lw.V(P)), N = data.length;
    const fr0 = frame({ L, R, T, B, xlo: o.xlo, xhi: o.xhi, yhi: o.ym, noY: false, xt: Lw.disc ? [] : undefined, yl: Lw.disc ? 'P(X = k)' : 'densité' });
    // fr0.Y et Y coïncident (même échelle)
    let g = '';
    const xa = Lw.disc ? X : X, bandL = clamp(xa(E - sd), L, R), bandR = clamp(xa(E + sd), L, R);
    g += `<rect x="${bandL}" y="${T}" width="${Math.max(0, bandR - bandL)}" height="${B - T}" class="vp-band"/>`;
    g += fr0.g;
    if (Lw.disc) {
      const step = Math.ceil(o.nk / 15);
      for (let k = o.k0; k <= o.k1; k++) if ((k - o.k0) % step === 0) g += `<text x="${X(k)}" y="${B + 16}" class="vz-t vz-s" text-anchor="middle">${k}</text>`;
      o.fr.forEach((f, i) => { if (f) g += `<rect x="${X(o.k0 + i) - o.bw * 0.4}" y="${Y(f)}" width="${o.bw * 0.8}" height="${B - Y(f)}" class="vp-emp"/>`; });
      o.pm.forEach((p, i) => { const x = X(o.k0 + i); g += `<line x1="${x}" x2="${x}" y1="${B}" y2="${Y(p)}" class="vp-th"/><circle cx="${x}" cy="${Y(p)}" r="${Math.min(4.5, o.bw * 0.28)}" class="vp-thd"/>`; });
      if (sel !== null && sel >= o.k0 && sel <= o.k1) {
        const x = X(sel), p = o.pm[sel - o.k0];
        g += `<rect x="${x - o.bw / 2}" y="${T}" width="${o.bw}" height="${B - T}" fill="var(--accent)" fill-opacity=".08" stroke="var(--accent)" stroke-dasharray="3 3"/>`;
        g += `<text x="${clamp(x, L + 50, R - 50)}" y="${Math.max(T + 10, Y(p) - 10)}" class="vz-t vp-tb vp-ta vp-halo" text-anchor="middle">P(X = ${sel}) = ${num(p, 4)}</text>`;
      }
      for (let k = o.k0; k <= o.k1; k++) g += `<rect x="${X(k) - o.bw / 2}" y="${T}" width="${o.bw}" height="${B - T + 18}" class="vp-hit" data-k="${k}"><title>k = ${k}</title></rect>`;
    } else {
      o.den.forEach((d, i) => { if (d) { const x0 = X(o.lo + i * o.bw); g += `<rect x="${x0 + 0.5}" y="${Y(d)}" width="${Math.max(0, X(o.lo + (i + 1) * o.bw) - x0 - 1)}" height="${B - Y(d)}" class="vp-emp"/>`; } });
      g += `<path d="${path(o.xs.map((x, i) => [X(x), Y(o.fs[i])]))}" class="vp-curve"/>`;
    }
    if (E >= o.xlo && E <= o.xhi) g += `<line x1="${X(E)}" x2="${X(E)}" y1="${T - 6}" y2="${B}" class="vp-E"/><text x="${X(E)}" y="${T - 10}" class="vz-t vz-s vp-tr vp-tb" text-anchor="middle">E = ${num(E, 2)}</text>`;
    // billes en chute
    parts.forEach(p => {
      const u = (now - p.t0) / p.dur; if (u < 0) return;
      const [x, yt] = o.land(p.v), y0 = T - 14, y = y0 + (yt - 5 - y0) * Math.min(1, u * u);
      g += `<circle cx="${x + p.j}" cy="${y}" r="${p.big ? 6 : 4}" class="vp-ball"/>`;
      if (p.big) g += `<text x="${clamp(x + 10, L + 30, R - 40)}" y="${Math.max(T + 4, y - 8)}" class="vz-t vp-tb vp-halo">${Lw.disc ? 'X = ' + p.v : 'x = ' + num(p.v, 2)}</text>`;
    });
    stage.innerHTML = svg(o.W, o.H, g, `Loi ${Lw.lab(P)} et histogramme des tirages`);
    el.querySelectorAll('[data-o]').forEach(b => { if (b.dataset.o in P) b.textContent = num(P[b.dataset.o], 2); });
    const m = mean(data), v = N > 1 ? sum(data.map(x => (x - m) ** 2)) / (N - 1) : NaN;
    el.querySelector('[data-o=kp]').innerHTML = `<div class="hi">loi<b>${Lw.lab(P)}</b></div><div>tirages<b>${N.toLocaleString('fr-FR')}</b></div><div>moyenne observée<b>${N ? num(m, 3) : '—'}</b>E(X) = ${num(E, 3)}</div><div>variance observée<b>${N > 1 ? num(v, 3) : '—'}</b>V(X) = ${num(Lw.V(P), 3)}</div>`;
    el.querySelector('[data-o=out]').innerHTML = `<b>${Lw.nom}</b> : ${Lw.f}.${lastV !== null ? ` Dernier tirage : <b>${Lw.disc ? lastV : num(lastV, 3)}</b>.` : ''} ${Lw.disc ? 'Touche une barre pour lire P(X = k). ' : ''}<b>Observe :</b> ${Lw.obs} Plus tu tires, plus l'histogramme épouse la loi théorique.`;
  };
  const kick = loop(el, now => {
    const keep = [];
    parts.forEach(p => { if (now - p.t0 >= p.dur) { data.push(p.v); lastV = p.v; } else keep.push(p); });
    parts = keep; draw(now); return parts.length > 0;
  });
  const shoot = n => {
    const Lw = LAWS[law], now = performance.now();
    if (!n) { reset(); return; }
    if (n >= 1000 || RM()) {
      for (let i = 0; i < n; i++) data.push(Lw.s(r, P));
      lastV = data[data.length - 1]; draw(); return;
    }
    const sp = n === 1 ? 0 : 1100 / n;
    for (let i = 0; i < n; i++) parts.push({ v: Lw.s(r, P), t0: now + i * sp, dur: n === 1 ? 850 : 520, big: n === 1, j: n === 1 ? 0 : (r() - 0.5) * 4 });
    kick();
  };
  el.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => shoot(+b.dataset.a); });
  el.querySelectorAll('[data-law]').forEach(b => { b.onclick = () => setLaw(b.dataset.law); });
  stage.addEventListener('click', e => { const h = e.target.closest('[data-k]'); if (h) { sel = +h.dataset.k === sel ? null : +h.dataset.k; draw(); } });
  setLaw(law);
}

/* ================================================================== 2. densité et fonction de répartition */
function repartViz(el) {
  const LS = {
    fiche: { nom: '¾(1 − x²) · fiche ex. 1', lo: -1.4, hi: 1.4, f: x => (Math.abs(x) < 1 ? 0.75 * (1 - x * x) : 0), F: x => (x <= -1 ? 0 : x >= 1 ? 1 : 0.5 + 0.75 * x - x ** 3 / 4), a: -0.5, b: 0.5, st: 0.05 },
    norm: { nom: 'N(0, 1)', lo: -3.6, hi: 3.6, f: x => npdf(x, 0, 1), F: Phi, a: -1.96, b: 1.96, st: 0.01 },
    expo: { nom: 'E(2) · fiche ex. 5', lo: -0.3, hi: 3, f: x => (x < 0 ? 0 : 2 * Math.exp(-2 * x)), F: x => (x < 0 ? 0 : 1 - Math.exp(-2 * x)), a: 0.5, b: 1, st: 0.05 },
  };
  let cur = 'fiche', a, b, sw = null, drag = null;
  const W = 420, H = 350, L = 42, R = W - 64, T1 = 24, B1 = 168, T2 = 214, B2 = 318;
  el.innerHTML = head('Densité f et fonction de répartition F', 'Fais glisser les poignées a et b (ou touche le graphique du haut) : l\'aire colorée sous f est P(a < X < b), et elle se lit sur F.') +
    chips('law', Object.entries(LS).map(([k, v]) => [k, v.nom]), cur) +
    `<div class="viz-ctrl"><span data-s="sl"></span><span class="viz-btns">${btn('sweep', 'Balayer : F(x) = aire jusqu\'à x')}</span></div>
     <div class="vp-stage"><svg viewBox="0 0 ${W} ${H}" class="vz-svg vp-svg" role="img" aria-label="Densité et fonction de répartition"><g data-l="dyn"></g></svg></div>
     <p class="viz-out" data-o="out"></p>`;
  const s = el.querySelector('svg'), dyn = el.querySelector('[data-l=dyn]');
  const setLaw = k => {
    cur = k; const D = LS[k]; a = D.a; b = D.b; sw = null;
    el.querySelector('[data-s=sl]').innerHTML = rangeI('a', 'a', D.lo, D.hi, D.st, a) + ' ' + rangeI('b', 'b', D.lo, D.hi, D.st, b);
    el.querySelectorAll('[data-i]').forEach(inp => { inp.oninput = () => { const v = +inp.value; if (inp.dataset.i === 'a') a = Math.min(v, b); else b = Math.max(v, a); sw = null; draw(); }; });
    press(el, 'law', k); draw();
  };
  const draw = () => {
    const D = LS[cur], fm = Math.max(...Array.from({ length: 200 }, (_, i) => D.f(D.lo + (D.hi - D.lo) * i / 199))) * 1.15;
    const top = frame({ L, R, T: T1, B: B1, xlo: D.lo, xhi: D.hi, yhi: fm, yl: 'densité f' });
    const bot = frame({ L, R, T: T2, B: B2, xlo: D.lo, xhi: D.hi, yhi: 1, yt: [0, 0.25, 0.5, 0.75, 1], yl: 'F(x) = P(X ≤ x)' });
    const X = top.X, Yf = top.Y, YF = bot.Y, xs = Array.from({ length: 281 }, (_, i) => D.lo + (D.hi - D.lo) * i / 280);
    const area = (x0, x1) => { const pts = xs.filter(x => x > x0 && x < x1); return `M${X(x0)},${B1}` + [x0, ...pts, x1].map(x => `L${X(x).toFixed(1)},${Yf(D.f(x)).toFixed(1)}`).join('') + `L${X(x1)},${B1}Z`; };
    let g = top.g + bot.g;
    if (sw !== null) {
      g += `<path d="${area(D.lo, sw)}" fill="var(--good)" fill-opacity=".22"/>`;
      g += `<path d="${path(xs.map(x => [X(x), Yf(D.f(x))]))}" class="vp-curve"/>`;
      g += `<path d="${path(xs.filter(x => x <= sw).map(x => [X(x), YF(D.F(x))]))}" fill="none" stroke="var(--good)" stroke-width="2.5"/>`;
      g += `<line x1="${X(sw)}" x2="${X(sw)}" y1="${T1}" y2="${B2}" stroke="var(--good)" stroke-dasharray="4 3"/><circle cx="${X(sw)}" cy="${YF(D.F(sw))}" r="5" fill="var(--good)" stroke="var(--paper)"/>`;
      g += `<text x="${clamp(X(sw) + 6, L + 4, R - 90)}" y="${T1 + 14}" class="vz-t vp-tb vp-tg vp-halo">aire = ${num(D.F(sw), 3)}</text><text x="${clamp(X(sw) + 8, L + 4, R - 90)}" y="${YF(D.F(sw)) + 16}" class="vz-t vp-tb vp-tg vp-halo">F(x) = ${num(D.F(sw), 3)}</text>`;
    } else {
      const Fa = D.F(a), Fb = D.F(b);
      g += `<path d="${area(a, b)}" class="vp-area" />`;
      g += `<path d="${path(xs.map(x => [X(x), Yf(D.f(x))]))}" class="vp-curve"/>`;
      g += `<path d="${path(xs.map(x => [X(x), YF(D.F(x))]))}" fill="none" stroke="var(--good)" stroke-width="2.5"/>`;
      g += `<text x="${X((a + b) / 2)}" y="${(Yf(D.f((a + b) / 2)) + B1) / 2 + 4}" class="vz-t vp-tb vp-ta vp-halo" text-anchor="middle">${num(Fb - Fa, 3)}</text>`;
      [[a, 'a', Fa], [b, 'b', Fb]].forEach(([v, n, Fv]) => {
        g += `<line x1="${X(v)}" x2="${X(v)}" y1="${T1}" y2="${B2}" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="4 3"/>`;
        g += `<line x1="${X(v)}" x2="${R + 12}" y1="${YF(Fv)}" y2="${YF(Fv)}" stroke="var(--muted)" stroke-dasharray="2 3"/><circle cx="${X(v)}" cy="${YF(Fv)}" r="4.5" fill="var(--good)" stroke="var(--paper)"/>`;
        g += `<g class="vp-handle" data-h="${n}"><circle cx="${X(v)}" cy="${B1}" r="20" fill="transparent"/><circle cx="${X(v)}" cy="${B1}" r="9" fill="var(--paper)" stroke="var(--accent)" stroke-width="2.5"/><text x="${X(v)}" y="${B1 + 4}" class="vz-t vz-s vp-tb vp-ta" text-anchor="middle">${n}</text></g>`;
      });
      const y1 = YF(Fa), y2 = YF(Fb), xb = R + 14;
      g += `<path d="M${xb - 4},${y1}H${xb}V${y2}H${xb - 4}" fill="none" stroke="var(--accent)" stroke-width="2"/><text x="${xb + 4}" y="${(y1 + y2) / 2 - 3}" class="vz-t vz-s vp-ta">F(b)−F(a)</text><text x="${xb + 4}" y="${(y1 + y2) / 2 + 12}" class="vz-t vp-tb vp-ta">${num(Fb - Fa, 3)}</text>`;
    }
    dyn.innerHTML = g;
    el.querySelectorAll('[data-o=a]').forEach(o => { o.textContent = num(a, 2); });
    el.querySelectorAll('[data-o=b]').forEach(o => { o.textContent = num(b, 2); });
    const Fa = D.F(a), Fb = D.F(b);
    el.querySelector('[data-o=out]').innerHTML = sw !== null
      ? `F(x) est l'aire sous f à gauche de x : elle part de 0 et monte jusqu'à 1. <b>Observe :</b> F monte vite là où f est haute (F' = f) et reste plate là où f = 0.`
      : `P(${num(a, 2)} &lt; X &lt; ${num(b, 2)}) = F(b) − F(a) = ${num(Fb, 4)} − ${num(Fa, 4)} = <b>${num(Fb - Fa, 4)}</b> : c'est l'aire colorée sous f. Pour une variable continue P(X = a) = 0, donc ≤ ou &lt; ne change rien. <b>Observe :</b> l'aire totale sous f vaut 1, c'est la hauteur finale de F.${cur === 'norm' ? ' Avec a = −1,96 et b = 1,96, on retrouve 0,95.' : ''}`;
  };
  const setX = (h, v) => { const D = LS[cur]; v = clamp(Math.round(v / D.st) * D.st, D.lo, D.hi); if (h === 'a') a = Math.min(v, b); else b = Math.max(v, a); const inp = el.querySelector(`[data-i=${h}]`); if (inp) inp.value = h === 'a' ? a : b; draw(); };
  const toX = px => { const D = LS[cur]; return D.lo + (px - L) / (R - L) * (D.hi - D.lo); };
  s.addEventListener('pointerdown', e => {
    if (sw !== null) return;
    const [px, py] = svgPt(s, e), hd = e.target.closest('[data-h]');
    if (hd) drag = hd.dataset.h;
    else if (py < B1 + 22) { const v = toX(px); drag = Math.abs(v - a) < Math.abs(v - b) ? 'a' : 'b'; setX(drag, v); } else return;
    try { s.setPointerCapture(e.pointerId); } catch (_) { /* rien */ }
  });
  s.addEventListener('pointermove', e => { if (drag) setX(drag, toX(svgPt(s, e)[0])); });
  const end = () => { drag = null; };
  s.addEventListener('pointerup', end); s.addEventListener('pointercancel', end);
  let stop = () => {};
  el.querySelector('[data-a=sweep]').onclick = () => {
    stop(); const D = LS[cur];
    stop = tween(el, 2600, u => { sw = D.lo + (D.hi - D.lo) * u; draw(); }, () => setTimeout(() => { if (el.isConnected) { sw = null; draw(); } }, 900));
  };
  el.querySelectorAll('[data-law]').forEach(bt => { bt.onclick = () => { stop(); setLaw(bt.dataset.law); }; });
  setLaw(cur);
}

/* ================================================================== 3. absence de mémoire */
function memoireViz(el) {
  let mode = 'expo', lam = 2, s = 0.75, t = 0.25, u = 0, stop = () => {};
  el.innerHTML = head('Absence de mémoire de la loi exponentielle', 'Conditionner par « X > s », c\'est garder la partie de la courbe après s, l\'agrandir pour que son aire vaille 1, puis la ramener à l\'origine.') +
    chips('m', [['expo', 'Exponentielle E(λ)'], ['gam', 'Contre-exemple : Γ(2, λ)']], mode) +
    `<div class="viz-ctrl">${rangeI('l', 'λ', 0.5, 3, 0.1, lam)}${rangeI('s', 'déjà écoulé s', 0, 2, 0.05, s)}${rangeI('t', 'encore t', 0.05, 2, 0.05, t)}</div>
     <div class="viz-ctrl">${rangeI('u', 'étape', 0, 2, 0.01, u)}<span class="viz-btns">${btn('play', '▶ Conditionner par X > s')}</span></div>
     <div class="vp-stage" data-s="stage"></div>
     ${leg([['var(--accent)', 'densité de X', 'sw-l'], ['var(--c2)', 'densité de X − s sachant X > s', 'sw-l']])}
     <p class="viz-out" data-o="out"></p>`;
  const stage = el.querySelector('[data-s=stage]');
  const Sf = x => (x < 0 ? 1 : mode === 'expo' ? Math.exp(-lam * x) : Math.exp(-lam * x) * (1 + lam * x)); // P(X > x)
  const f = x => (x < 0 ? 0 : mode === 'expo' ? lam * Math.exp(-lam * x) : lam * lam * x * Math.exp(-lam * x));
  const draw = () => {
    const W = 420, H = 250, L = 42, R = W - 12, T = 20, B = H - 28, xmax = Math.max(5 / lam, s + 3 / lam), Ss = Sf(s);
    const xs = Array.from({ length: 301 }, (_, i) => xmax * i / 300);
    const ym = Math.max(...xs.map(f), ...xs.filter(x => x >= s).map(x => f(x) / Ss)) * 1.12;
    const fr = frame({ L, R, T, B, xlo: 0, xhi: xmax, yhi: ym, xl: 'durée x' }), { X, Y } = fr;
    const k = u <= 1 ? 1 + u * (1 / Ss - 1) : 1 / Ss, d = u <= 1 ? 0 : (u - 1) * s;
    const mv = xs.filter(x => x >= s).map(x => [x - d, f(x) * k]);
    let g = fr.g;
    // partie « X > s » de la densité de départ
    g += `<path d="M${X(s)},${B}${xs.filter(x => x >= s).map(x => `L${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`).join('')}L${X(xmax)},${B}Z" fill="var(--warn)" fill-opacity="${0.18 * (1 - Math.min(1, u))}"/>`;
    if (u > 1) { // aire P(X > t) sous la densité d'origine
      g += `<path d="M${X(t)},${B}${xs.filter(x => x >= t).map(x => `L${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`).join('')}L${X(xmax)},${B}Z" class="vp-area" opacity="${u - 1}"/>`;
    }
    // aire P(X > s + t | X > s) sous la courbe déplacée
    const tail = mv.filter(([x]) => x >= s + t - d - 1e-9);
    if (tail.length) g += `<path d="M${X(tail[0][0])},${B}${tail.map(([x, y]) => `L${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join('')}L${X(tail[tail.length - 1][0])},${B}Z" class="vp-area2"/>`;
    g += `<path d="${path(xs.map(x => [X(x), Y(f(x))]))}" class="vp-curve"/>`;
    g += `<path d="${path(mv.filter(([x]) => x <= xmax + 1e-9).map(([x, y]) => [X(x), Y(y)]))}" class="vp-curve2"/>`;
    const sx = X(s - d);
    g += `<line x1="${X(s)}" x2="${X(s)}" y1="${T}" y2="${B}" stroke="var(--warn)" stroke-dasharray="4 3"/><text x="${X(s) + 4}" y="${T + 10}" class="vz-t vz-s vp-tb" fill="var(--warn)">s</text>`;
    g += `<line x1="${X(s + t - d)}" x2="${X(s + t - d)}" y1="${T + 16}" y2="${B}" stroke="var(--c2)" stroke-dasharray="2 3"/><text x="${X(s + t - d) + 4}" y="${T + 26}" class="vz-t vz-s vp-tb" fill="var(--c2)">${u >= 1.99 ? 't' : 's + t'}</text>`;
    if (u > 0 && u < 2 && d > 0) g += `<path d="M${X(s)},${B + 22}H${sx}" stroke="var(--c2)" stroke-width="1.5" marker-end="url(#vp-ar-m)"/>`;
    g += `<defs><marker id="vp-ar-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--c2)"/></marker></defs>`;
    const phase = u < 0.02 ? 'on regarde l\'événement X > s (zone orange)' : u <= 1 ? `on divise par P(X > s) = ${num(Ss, 3)} : la courbe est multipliée par ${num(1 / Ss, 2)}` : u < 1.99 ? 'on décale de s vers la gauche' : (mode === 'expo' ? 'les deux courbes se superposent exactement' : 'les courbes ne se superposent pas');
    g += `<text x="${R}" y="${T + 6}" class="vz-t vz-s vp-tm vp-halo" text-anchor="end">${phase}</text>`;
    stage.innerHTML = svg(W, H, g, 'Densité et densité conditionnelle décalée');
    el.querySelector('[data-o=l]').textContent = num(lam, 1);
    el.querySelector('[data-o=s]').textContent = num(s, 2);
    el.querySelector('[data-o=t]').textContent = num(t, 2);
    el.querySelector('[data-o=u]').textContent = u < 0.02 ? 'départ' : u <= 1 ? 'normaliser' : u < 1.99 ? 'décaler' : 'final';
    const pc = Sf(s + t) / Ss, pt = Sf(t);
    const fiche = mode === 'expo' && Math.abs(lam - 2) < 1e-9 && Math.abs(s - 0.75) < 1e-9 && Math.abs(t - 0.25) < 1e-9 ? ` C'est la fiche ex. 5 : une réparation qui dure déjà 45 min finit dans le quart d'heure avec probabilité 1 − e^(−0,5) ≈ ${num(1 - pc, 4)}, comme une réparation qui commence.` : '';
    el.querySelector('[data-o=out]').innerHTML = mode === 'expo'
      ? `P(X &gt; s + t | X &gt; s) = e^(−λ(s+t)) / e^(−λs) = e^(−λt) = <b>${num(pc, 4)}</b> et P(X &gt; t) = <b>${num(pt, 4)}</b> : <span class="vp-badge yes">égales</span> Les deux aires colorées sont identiques.${fiche} <b>Observe :</b> quels que soient λ et s, la courbe rouge retombe pile sur la bleue : l'exponentielle « oublie » le temps déjà écoulé.`
      : `Pour Γ(2, λ), P(X &gt; x) = e^(−λx)(1 + λx). P(X &gt; s + t | X &gt; s) = <b>${num(pc, 4)}</b> mais P(X &gt; t) = <b>${num(pt, 4)}</b> : <span class="vp-badge no">différentes</span> <b>Observe :</b> la courbe rouge ne retombe pas sur la bleue : le temps déjà écoulé change la loi du temps restant. Seule l'exponentielle est sans mémoire (parmi les lois continues).`;
  };
  const sync = () => { el.querySelector('[data-i=u]').value = u; draw(); };
  [['l', v => { lam = v; }], ['s', v => { s = v; }], ['t', v => { t = v; }], ['u', v => { u = v; stop(); }]].forEach(([k, fn]) => { el.querySelector(`[data-i=${k}]`).oninput = e => { fn(+e.target.value); draw(); }; });
  el.querySelector('[data-a=play]').onclick = () => { stop(); stop = tween(el, 3200, v => { u = 2 * v; sync(); }); };
  el.querySelectorAll('[data-m]').forEach(b => { b.onclick = () => { mode = b.dataset.m; press(el, 'm', mode); draw(); }; });
  draw();
}

/* ================================================================== 4. lois des sommes */
function sommesViz(el) {
  let mode = 'bern', n = 5, p = 0.3, lam = 1, data = [], parts = [], last = null;
  const r = rng(77);
  el.innerHTML = head('Additionner des variables indépendantes', 'Chaque tirage additionne n variables indépendantes de même loi ; la somme tombe dans l\'histogramme. Compare avec la loi annoncée par le cours.') +
    chips('m', [['bern', 'Bernoulli → binomiale'], ['expo', 'Exponentielles → Gamma']], mode) +
    `<div class="viz-ctrl" data-s="par"></div>
     <div class="viz-btns">${btn(1, 'Tirer 1 (au ralenti)')}${btn(200, 'Tirer 200')}${btn(0, 'Effacer')}</div>
     <div class="vp-stage" data-s="stage"></div>
     ${leg([['var(--accent)', 'loi de la somme (cours)', 'sw-l'], ['var(--c4)', 'fréquences des sommes tirées', 'sw-a']])}
     <p class="viz-out" data-o="out"></p>`;
  const stage = el.querySelector('[data-s=stage]');
  const setMode = m => {
    mode = m; n = m === 'bern' ? 5 : 3;
    el.querySelector('[data-s=par]').innerHTML = m === 'bern' ? rangeI('n', 'n', 1, 30, 1, n) + rangeI('p', 'p', 0.05, 0.95, 0.05, p) : rangeI('n', 'n', 1, 10, 1, n) + rangeI('l', 'λ', 0.5, 3, 0.1, lam);
    el.querySelectorAll('[data-s=par] [data-i]').forEach(i => { i.oninput = () => { const v = +i.value; if (i.dataset.i === 'n') n = v; else if (i.dataset.i === 'p') p = v; else lam = v; reset(); }; });
    press(el, 'm', m); reset();
  };
  const reset = () => { data = []; parts = []; last = null; draw(); };
  const comp = () => Array.from({ length: n }, () => (mode === 'bern' ? (r() < p ? 1 : 0) : sExp(r, lam)));
  const draw = (now = performance.now()) => {
    const W = 420, H = 320, L = 42, R = W - 12, T = 122, B = H - 28, N = data.length;
    const disc = mode === 'bern', hi = disc ? n + 0.5 : (n + 4.5 * Math.sqrt(n) + 1) / lam, lo = disc ? -0.5 : 0;
    let g = '', X, Y, land;
    if (disc) {
      const cnt = new Array(n + 1).fill(0); data.forEach(v => cnt[v]++);
      const fr = cnt.map(c => (N ? c / N : 0)), pm = cnt.map((_, k) => bpmf(k, n, p)), ym = Math.max(...pm, ...fr) * 1.18;
      const fm = frame({ L, R, T, B, xlo: lo, xhi: hi, yhi: ym, xt: [] }); X = fm.X; Y = fm.Y; g += fm.g;
      const bw = (R - L) / (n + 1), st = Math.ceil((n + 1) / 16);
      for (let k = 0; k <= n; k++) {
        if (k % st === 0) g += `<text x="${X(k)}" y="${B + 16}" class="vz-t vz-s" text-anchor="middle">${k}</text>`;
        if (fr[k]) g += `<rect x="${X(k) - bw * 0.4}" y="${Y(fr[k])}" width="${bw * 0.8}" height="${B - Y(fr[k])}" class="vp-emp"/>`;
        g += `<line x1="${X(k)}" x2="${X(k)}" y1="${B}" y2="${Y(pm[k])}" class="vp-th"/><circle cx="${X(k)}" cy="${Y(pm[k])}" r="${Math.min(4.5, bw * 0.28)}" class="vp-thd"/>`;
      }
      land = v => [X(v), Y(fr[v])];
    } else {
      const nb = 30, bw = (hi - lo) / nb, cnt = new Array(nb).fill(0);
      data.forEach(v => { const i = Math.floor(v / bw); if (i < nb) cnt[i]++; });
      const den = cnt.map(c => (N ? c / (N * bw) : 0)), xs = Array.from({ length: 201 }, (_, i) => hi * i / 200), fs = xs.map(x => gpdf(x, n, lam));
      const ym = Math.max(...fs, ...den) * 1.15, fm = frame({ L, R, T, B, xlo: lo, xhi: hi, yhi: ym, xl: 'temps' }); X = fm.X; Y = fm.Y; g += fm.g;
      den.forEach((d, i) => { if (d) g += `<rect x="${X(i * bw) + 0.5}" y="${Y(d)}" width="${X(bw) - X(0) - 1}" height="${B - Y(d)}" class="vp-emp"/>`; });
      g += `<path d="${path(xs.map((x, i) => [X(x), Y(fs[i])]))}" class="vp-curve"/>`;
      land = v => { const i = Math.floor(v / bw); return [X(Math.min(v, hi)), Y(i < nb ? den[i] : 0)]; };
    }
    const E = disc ? n * p : n / lam;
    g += `<line x1="${X(E)}" x2="${X(E)}" y1="${T - 4}" y2="${B}" class="vp-E"/><text x="${X(E)}" y="${T - 8}" class="vz-t vz-s vp-tr vp-tb" text-anchor="middle">E = ${num(E, 2)}</text>`;
    // atelier : les n variables du dernier tirage
    if (last) {
      const pr = last.slow ? clamp((now - last.t0) / (last.dur * 0.62), 0, 1) : 1, shown = Math.floor(pr * n + 1e-9);
      if (disc) {
        const rad = Math.min(13, (R - L) / (2 * n) - 1.5), sp = 2 * rad + 3, x0 = (L + R) / 2 - (n * sp) / 2 + sp / 2 - 30;
        last.c.forEach((v, i) => {
          const x = x0 + i * sp, y = 46, on = i < shown;
          g += on ? `<circle cx="${x}" cy="${y}" r="${rad}" fill="${v ? 'var(--accent)' : 'var(--paper)'}" stroke="var(--accent)" stroke-width="1.5"/>` : `<circle cx="${x}" cy="${y}" r="${rad}" fill="none" stroke="var(--line-strong)" stroke-dasharray="3 2"/>`;
          if (on && rad >= 7) g += `<text x="${x}" y="${y + 4}" class="vz-t vz-s vp-tb" text-anchor="middle" fill="${v ? 'var(--paper)' : 'var(--muted)'}">${v}</text>`;
        });
        g += `<text x="${L}" y="18" class="vz-t vz-s vp-tm">X₁, …, Xₙ : ${n} épreuves de Bernoulli(${num(p)})</text>`;
        const partial = sum(last.c.slice(0, shown));
        g += `<text x="${x0 + n * sp + 6}" y="51" class="vz-t vp-tb">Σ = ${partial}</text>`;
      } else {
        const sc = x => L + Math.min(x, hi) / hi * (R - L), y = 50;
        g += `<line x1="${L}" x2="${R}" y1="${y}" y2="${y}" class="vz-axis"/><text x="${L}" y="18" class="vz-t vz-s vp-tm">attentes successives X₁, …, Xₙ ~ E(${num(lam)}) mises bout à bout</text>`;
        let c = 0; const tot = sum(last.c), lim = pr * tot;
        last.c.forEach((v, i) => {
          if (c >= lim) return;
          const e = Math.min(c + v, lim);
          g += `<line x1="${sc(c)}" x2="${sc(e)}" y1="${y}" y2="${y}" stroke="${CAT[i % 6]}" stroke-width="7" stroke-linecap="butt"/>`;
          if (e === c + v) g += `<line x1="${sc(e)}" x2="${sc(e)}" y1="${y - 10}" y2="${y + 10}" stroke="var(--ink)" stroke-width="1.5"/>${n <= 6 && sc(e) - sc(c) > 18 ? `<text x="${(sc(c) + sc(e)) / 2}" y="${y - 9}" class="vz-t vz-s" text-anchor="middle">X${String(i + 1).replace(/./g, d => '₀₁₂₃₄₅₆₇₈₉'[d])}</text>` : ''}`;
          c += v;
        });
        if (pr >= 1) g += `<text x="${clamp(sc(tot), L + 60, R - 10)}" y="${y + 26}" class="vz-t vz-s vp-tb" text-anchor="end">Sₙ = ${num(tot, 2)} (instant du ${n}ᵉ événement)</text>`;
      }
      g += `<line x1="${L}" x2="${R}" y1="84" y2="84" class="vz-grid"/>`;
    }
    parts.forEach(q => {
      const u = (now - q.t0) / q.dur; if (u < 0) return;
      const [x, yt] = land(q.v), y0 = 74, y = y0 + (yt - 5 - y0) * Math.min(1, u * u);
      g += `<circle cx="${x + q.j}" cy="${y}" r="${q.big ? 6 : 4}" class="vp-ball"/>`;
    });
    stage.innerHTML = svg(W, H, g, 'Tirages de sommes de variables indépendantes');
    el.querySelectorAll('[data-s=par] [data-o]').forEach(o => { o.textContent = num(o.dataset.o === 'n' ? n : o.dataset.o === 'p' ? p : lam, 2); });
    const m = mean(data), V = disc ? n * p * (1 - p) : n / lam ** 2, v = N > 1 ? sum(data.map(x => (x - m) ** 2)) / (N - 1) : NaN;
    el.querySelector('[data-o=out]').innerHTML = (disc
      ? `Sₙ = X₁ + … + Xₙ compte les succès : Sₙ ~ <b>B(${n} ; ${num(p)})</b>, E = np = ${num(E, 2)}, V = np(1 − p) = ${num(V, 3)}.`
      : `Sₙ = X₁ + … + Xₙ est l'instant du ${n}ᵉ événement : Sₙ ~ <b>Γ(${n} ; ${num(lam)})</b>, E = n/λ = ${num(E, 2)}, V = n/λ² = ${num(V, 3)}.`) +
      (N ? ` Sur ${N} tirages : moyenne ${num(m, 3)}, variance ${num(v, 3)}.` : '') +
      ` <b>Observe :</b> pour n = 1 on retrouve ${disc ? 'la loi de Bernoulli' : 'l\'exponentielle'} ; quand n grandit, la loi de la somme se décale (E = ${disc ? 'np' : 'n/λ'}), s'étale et prend une forme de cloche (c'est le TCL du chapitre suivant).`;
  };
  const kick = loop(el, now => {
    const keep = []; parts.forEach(q => { if (now - q.t0 >= q.dur) data.push(q.v); else keep.push(q); });
    parts = keep; draw(now); return parts.length > 0 || (last && last.slow && now - last.t0 < last.dur);
  });
  const shoot = k => {
    if (!k) { reset(); return; }
    const now = performance.now();
    if (RM()) { for (let i = 0; i < k; i++) { const c = comp(); last = { c, slow: false }; data.push(mode === 'bern' ? sum(c) : sum(c)); } draw(); return; }
    if (k === 1) {
      const c = comp(), dur = 2600; last = { c, slow: true, t0: now, dur };
      parts.push({ v: sum(c), t0: now + dur * 0.66, dur: dur * 0.34, big: true, j: 0 });
    } else {
      for (let i = 0; i < k; i++) { const c = comp(); last = { c, slow: false }; parts.push({ v: sum(c), t0: now + i * 6, dur: 500, j: (r() - 0.5) * 4 }); }
    }
    kick();
  };
  el.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => shoot(+b.dataset.a); });
  el.querySelectorAll('[data-m]').forEach(b => { b.onclick = () => setMode(b.dataset.m); });
  setMode(mode);
}

/* ================================================================== 5. arbre et Bayes */
function bayesViz(el) {
  const SC = {
    docs: { nom: 'Documents (fiche ex. 7)', ev: 'D', evl: 'plus de 10 pages', parts: [['W', 'Word', 0.5, 0.4], ['L', 'LaTeX', 0.3, 0.2], ['H', 'HTML', 0.2, 0.2]] },
    velo: { nom: 'Ville et vélo (fiche ex. 8)', ev: 'B', evl: 'vient à vélo', parts: [['V', 'en ville', 0.52, 0.02 / 0.52], ['V̄', 'hors ville', 0.48, 0.03 / 0.48]] },
    test: { nom: 'Test de dépistage', ev: '+', evl: 'test positif', parts: [['M', 'malade', 0.01, 0.99], ['S', 'sain', 0.99, 0.05]] },
  };
  let cur = 'docs', pr = [], cd = [], sel = null, post = 0, stop = () => {};
  el.innerHTML = head('Arbre de probabilités et théorème de Bayes', 'Règle les probabilités conditionnelles, touche une branche, puis « Sachant … » : on ne garde que les cas où l\'événement est réalisé.') +
    chips('sc', Object.entries(SC).map(([k, v]) => [k, v.nom]), cur) +
    `<div class="viz-ctrl" data-s="par"></div><div class="viz-btns" data-s="bt"></div>
     <div class="vp-two"><div><p class="vp-sub">Arbre</p><div data-s="tree"></div></div><div><p class="vp-sub">Carré unité : aire = probabilité</p><div data-s="sq"></div></div></div>
     <p class="viz-out" data-o="out"></p>`;
  const setSc = k => {
    cur = k; const S = SC[k]; pr = S.parts.map(q => q[2]); cd = S.parts.map(q => q[3]); sel = null; post = 0; stop();
    el.querySelector('[data-s=par]').innerHTML = (S.parts.length === 2 ? rangeI('pr', `P(${S.parts[0][0]})`, 0.01, 0.99, 0.01, pr[0]) : '') +
      S.parts.map((q, i) => rangeI('c' + i, `P(${S.ev} | ${q[0]})`, 0, 1, 0.005, cd[i])).join('');
    el.querySelector('[data-s=bt]').innerHTML = btn('post', `Sachant ${S.ev} ▶`) + btn('reset', 'Valeurs de l\'énoncé');
    el.querySelectorAll('[data-s=par] [data-i]').forEach(inp => {
      inp.oninput = () => { const v = +inp.value; if (inp.dataset.i === 'pr') { pr = [v, 1 - v]; } else cd[+inp.dataset.i.slice(1)] = v; draw(); };
    });
    el.querySelector('[data-a=post]').onclick = () => { stop(); const from = post, to = post > 0.5 ? 0 : 1; stop = tween(el, 1300, u => { post = from + (to - from) * u; draw(); }); };
    el.querySelector('[data-a=reset]').onclick = () => setSc(cur);
    press(el, 'sc', k); draw();
  };
  const draw = () => {
    const S = SC[cur], K = S.parts.length, joint = pr.map((v, i) => v * cd[i]), PD = sum(joint), postP = joint.map(j => (PD > 0 ? j / PD : 0));
    // arbre
    const W = 400, lh = 34, H = 2 * K * lh + 16, xr = 18, xn = 140, xl = 262;
    const ly = i => 14 + lh * (i + 0.5), ny = k => (ly(2 * k) + ly(2 * k + 1)) / 2, ry = H / 2;
    let g = `<circle cx="${xr}" cy="${ry}" r="5" fill="var(--ink)"/>`;
    S.parts.forEach((q, k) => {
      const on = sel === k, col = CAT[k];
      g += `<g class="vp-click" data-k="${k}"><line x1="${xr}" y1="${ry}" x2="${xn - 4}" y2="${ny(k)}" stroke="${on ? 'var(--accent)' : 'var(--line-strong)'}" stroke-width="${on ? 3.5 : 2}"/>`;
      g += `<text x="${(xr + xn) / 2 - 4}" y="${(ry + ny(k)) / 2 - 6}" class="vz-t vz-s vp-halo" text-anchor="middle">${num(pr[k], 3)}</text>`;
      g += `<rect x="${xn - 4}" y="${ny(k) - 12}" width="${Math.max(30, q[0].length * 9 + 14)}" height="24" rx="6" fill="${col}" fill-opacity=".18" stroke="${col}"/><text x="${xn + 3}" y="${ny(k) + 5}" class="vz-t vp-tb">${q[0]}</text></g>`;
      [[1, cd[k]], [0, 1 - cd[k]]].forEach(([isD, pc], j) => {
        const y = ly(2 * k + j), x0 = xn + Math.max(30, q[0].length * 9 + 14) - 4, fade = isD ? 1 : 1 - 0.75 * post, hiD = isD && post > 0.5;
        g += `<g class="vp-click" data-k="${k}" opacity="${fade}"><line x1="${x0}" y1="${ny(k)}" x2="${xl - 4}" y2="${y}" stroke="${on && isD ? 'var(--accent)' : hiD ? 'var(--good)' : 'var(--line-strong)'}" stroke-width="${(on && isD) || hiD ? 3 : 1.6}"/>`;
        g += `<text x="${(x0 + xl) / 2}" y="${(ny(k) + y) / 2 - 4}" class="vz-t vz-s vp-tm vp-halo" text-anchor="middle">${num(pc, 3)}</text>`;
        g += `<text x="${xl}" y="${y + 4}" class="vz-t vz-s ${isD ? 'vp-tb' : 'vp-tm'}">${isD ? S.ev : (S.ev === '+' ? '−' : S.ev + '̄')} : ${num(pr[k] * pc, 4)}</text></g>`;
      });
    });
    el.querySelector('[data-s=tree]').innerHTML = svg(W, H, g, 'Arbre de probabilités');
    // carré unité
    const SW = 400, SH = 286, x0 = 30, w = 340, y0 = 12, h = 186, yb = 236, hb = 28;
    let q = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="var(--line-strong)"/>`;
    let cx = x0, cp = x0;
    S.parts.forEach((pt, k) => {
      const cw = pr[k] * w, hD = cd[k] * h, col = CAT[k], on = sel === k;
      q += `<g class="vp-click" data-k="${k}"><rect x="${cx}" y="${y0}" width="${cw}" height="${h - hD}" fill="${col}" fill-opacity="${0.12 * (1 - 0.6 * post)}" stroke="var(--paper)"/>`;
      // morceau D : du carré vers la barre « sachant D »
      const tw = postP[k] * w, X0 = cx + (cp - cx) * post, Y0 = (y0 + h - hD) + (yb - (y0 + h - hD)) * post, WW = cw + (tw - cw) * post, HH = hD + (hb - hD) * post;
      q += `<rect x="${X0}" y="${Y0}" width="${Math.max(0, WW)}" height="${Math.max(0, HH)}" fill="${col}" fill-opacity="${on ? 0.95 : 0.75}" stroke="${on ? 'var(--ink)' : 'var(--paper)'}" stroke-width="${on ? 2 : 1}"/>`;
      if (cw > 22) q += `<text x="${cx + cw / 2}" y="${y0 + 16}" class="vz-t vz-s vp-tb vp-halo" text-anchor="middle" opacity="${1 - post * 0.6}">${pt[0]}</text>`;
      else q += `<text x="${cx + 3}" y="${y0 - 2}" class="vz-t vz-s vp-tb">${pt[0]}</text>`;
      if (post > 0.98 && tw > 34) q += `<text x="${cp + tw / 2}" y="${yb + 19}" class="vz-t vz-s vp-tb vp-halo" text-anchor="middle">${num(100 * postP[k], 1)} %</text>`;
      q += '</g>';
      cx += cw; cp += tw;
    });
    q += `<text x="${x0 + w + 4}" y="${y0 + h - 4}" class="vz-t vz-s vp-tb" opacity="${1 - post}">${S.ev}</text>`;
    q += `<text x="${x0}" y="${yb - 8}" class="vz-t vz-s vp-tm">${post > 0.02 ? `Sachant ${S.ev} : morceaux « ${S.ev} » remis à l'échelle (total 100 %)` : `Morceaux pleins : ${S.ev} (${S.evl}), d'aire totale P(${S.ev}) = ${num(PD, 4)}`}</text>`;
    q += `<rect x="${x0}" y="${yb}" width="${w}" height="${hb}" fill="none" stroke="var(--line)" stroke-dasharray="3 3"/>`;
    el.querySelector('[data-s=sq]').innerHTML = svg(SW, SH, q, 'Carré unité des probabilités');
    el.querySelectorAll('[data-s=par] [data-o]').forEach(o => { const k = o.dataset.o; o.textContent = num(k === 'pr' ? pr[0] : cd[+k.slice(1)], 3); });
    const tot = `P(${S.ev}) = ${S.parts.map((pt, k) => `${num(pr[k], 3)} × ${num(cd[k], 3)}`).join(' + ')} = <b>${num(PD, 4)}</b> (probabilités totales).`;
    let txt = tot;
    if (sel !== null) txt += ` Bayes : P(${S.parts[sel][0]} | ${S.ev}) = P(${S.ev} | ${S.parts[sel][0]}) P(${S.parts[sel][0]}) / P(${S.ev}) = ${num(cd[sel], 3)} × ${num(pr[sel], 3)} / ${num(PD, 4)} = <b>${num(postP[sel], 4)}</b>.`;
    if (post > 0.5) txt += ` Sachant ${S.ev} : ${S.parts.map((pt, k) => `P(${pt[0]} | ${S.ev}) = ${num(postP[k], 3)}`).join(' ; ')}.`;
    txt += cur === 'test' ? ' <b>Observe :</b> même avec un test fiable à 99 %, un positif n\'est malade qu\'avec une probabilité faible si la maladie est rare : le morceau « malade et + » est minuscule à côté des faux positifs. Augmente P(M) pour voir.'
      : ' <b>Observe :</b> conditionner par l\'événement, c\'est ne garder que ses morceaux et diviser par leur aire totale ; chaque morceau pèse P(Bₖ) × P(événement | Bₖ).';
    el.querySelector('[data-o=out]').innerHTML = txt;
  };
  el.addEventListener('click', e => { const k = e.target.closest('[data-k]'); if (k && el.contains(k)) { sel = +k.dataset.k === sel ? null : +k.dataset.k; draw(); } });
  el.querySelectorAll('[data-sc]').forEach(b => { b.onclick = () => setSc(b.dataset.sc); });
  setSc(cur);
}

/* ================================================================== 6. indépendance */
function indepViz(el) {
  let pa = 0.4, pba = 0.7, pbn = 0.3, stop = () => {};
  el.innerHTML = head('Indépendance de deux événements', 'A est la bande verticale de gauche ; dans chaque bande, la hauteur colorée est la proportion de B. Indépendants ⇔ même proportion de B partout.') +
    `<div class="viz-ctrl">${rangeI('a', 'P(A)', 0.05, 0.95, 0.01, pa)}${rangeI('ba', 'P(B | A)', 0, 1, 0.01, pba)}${rangeI('bn', 'P(B | Ā)', 0, 1, 0.01, pbn)}</div>
     <div class="viz-btns">${btn('ind', 'Rendre indépendants')}${btn('inc', 'Incompatibles (A ∩ B = ∅)')}${btn('incl', 'A ⊂ B')}</div>
     <div class="vp-stage" data-s="stage"></div><div class="vp-kpis" data-o="kp"></div><p class="viz-out" data-o="out"></p>`;
  const draw = () => {
    const W = 400, H = 260, x0 = 36, y0 = 14, w = 330, h = 220, pb = pa * pba + (1 - pa) * pbn;
    const wa = pa * w, ha = pba * h, hn = pbn * h;
    let g = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="var(--paper-2)" stroke="var(--line-strong)"/>`;
    g += `<rect x="${x0}" y="${y0}" width="${wa}" height="${h}" fill="var(--c1)" fill-opacity=".12"/>`;
    g += `<rect x="${x0}" y="${y0 + h - ha}" width="${wa}" height="${ha}" fill="var(--c3)" fill-opacity=".75"/>`;
    g += `<rect x="${x0 + wa}" y="${y0 + h - hn}" width="${w - wa}" height="${hn}" fill="var(--c3)" fill-opacity=".38"/>`;
    g += `<line x1="${x0 + wa}" x2="${x0 + wa}" y1="${y0}" y2="${y0 + h}" stroke="var(--c1)" stroke-width="2.5"/>`;
    g += `<line x1="${x0}" x2="${x0 + w}" y1="${y0 + h - pb * h}" y2="${y0 + h - pb * h}" stroke="var(--red)" stroke-dasharray="6 4" stroke-width="1.5"/><text x="${x0 - 4}" y="${y0 + h - pb * h + 4}" class="vz-t vz-s vp-tr" text-anchor="end">P(B)</text>`;
    g += `<text x="${x0 + wa / 2}" y="${y0 + 16}" class="vz-t vp-tb vp-halo" text-anchor="middle" fill="var(--c1)">A</text><text x="${x0 + wa + (w - wa) / 2}" y="${y0 + 16}" class="vz-t vp-tb vp-tm vp-halo" text-anchor="middle">Ā</text>`;
    if (ha > 18 && wa > 40) g += `<text x="${x0 + wa / 2}" y="${y0 + h - ha / 2 + 4}" class="vz-t vz-s vp-tb vp-halo" text-anchor="middle">A ∩ B</text>`;
    if (hn > 18) g += `<text x="${x0 + wa + (w - wa) / 2}" y="${y0 + h - hn / 2 + 4}" class="vz-t vz-s vp-halo" text-anchor="middle">Ā ∩ B</text>`;
    g += `<text x="${x0}" y="${y0 + h + 16}" class="vz-t vz-s vp-tm">← largeur P(A) = ${num(pa, 2)} →</text>`;
    el.querySelector('[data-s=stage]').innerHTML = svg(W, H, g, 'Carré unité : A et B');
    [['a', pa], ['ba', pba], ['bn', pbn]].forEach(([k, v]) => { el.querySelector(`[data-o=${k}]`).textContent = num(v, 2); el.querySelector(`[data-i=${k}]`).value = v; });
    const pab = pa * pba, prod = pa * pb, ind = Math.abs(pab - prod) < 0.0025;
    el.querySelector('[data-o=kp]').innerHTML = `<div>P(B)<b>${num(pb, 3)}</b></div><div class="hi">P(A ∩ B)<b>${num(pab, 3)}</b></div><div class="hi">P(A) × P(B)<b>${num(prod, 3)}</b></div><div>verdict<b><span class="vp-badge ${ind ? 'yes' : 'no'}">${ind ? 'indépendants' : 'dépendants'}</span></b></div>`;
    el.querySelector('[data-o=out]').innerHTML = (ind
      ? `P(B | A) = P(B | Ā) = P(B) : savoir que A est réalisé ne change pas la probabilité de B, et P(A ∩ B) = P(A) P(B).`
      : `P(B | A) = ${num(pba, 2)} ≠ P(B) = ${num(pb, 3)} : savoir que A est réalisé ${pba > pb ? 'rend B plus probable' : 'rend B moins probable'}, donc P(A ∩ B) ≠ P(A) P(B).${pba === 0 ? ' Incompatibles de probabilités non nulles : jamais indépendants !' : ''}`) +
      ' <b>Observe :</b> les deux événements sont indépendants exactement quand la frontière verte est une seule droite horizontale (elle coïncide alors avec la ligne P(B)).';
  };
  const go = (ta, tb) => { stop(); const a0 = pba, b0 = pbn; stop = tween(el, 900, u => { pba = a0 + (ta - a0) * u; pbn = b0 + (tb - b0) * u; draw(); }); };
  el.querySelector('[data-i=a]').oninput = e => { pa = +e.target.value; draw(); };
  el.querySelector('[data-i=ba]').oninput = e => { stop(); pba = +e.target.value; draw(); };
  el.querySelector('[data-i=bn]').oninput = e => { stop(); pbn = +e.target.value; draw(); };
  el.querySelector('[data-a=ind]').onclick = () => { const pb = pa * pba + (1 - pa) * pbn; go(pb, pb); };
  el.querySelector('[data-a=inc]').onclick = () => go(0, Math.max(pbn, 0.3));
  el.querySelector('[data-a=incl]').onclick = () => go(1, pbn);
  draw();
}

/* ================================================================== 7. covariance et corrélation */
function covViz(el) {
  let mode = 'lin', rho = 0.6, seed = 3, Z = [], pos = null, stop = () => {};
  const N = 150;
  el.innerHTML = head('Covariance : le signe des produits (x − x̄)(y − ȳ)', 'Les droites pointillées passent par les moyennes. Un point vert contribue positivement à la covariance, un point rouge négativement.') +
    chips('m', [['lin', 'Liaison linéaire'], ['parab', 'Y ≈ X² (non linéaire)'], ['cerc', 'Cercle']], mode) +
    `<div class="viz-ctrl"><span data-s="rho">${rangeI('r', 'ρ', -1, 1, 0.05, rho)}</span><span class="viz-btns">${btn('new', 'Nouveau tirage')}</span></div>
     <div class="vp-stage" data-s="stage"></div><div class="vp-kpis" data-o="kp"></div><p class="viz-out" data-o="out"></p>`;
  const gen = () => { const r = rng(seed); Z = Array.from({ length: N }, () => [gauss(r), gauss(r), r()]); };
  const W = 400, H = 350, L = 34, R = W - 12, T = 12, B = 276;
  const dom = () => (mode === 'parab' ? [-3.2, 3.2, -2, 8] : [-3.2, 3.2, -3.2, 3.2]);
  const target = () => {
    const P = Z.map(([a, b, c]) => {
      if (mode === 'lin') return [a, rho * a + Math.sqrt(Math.max(0, 1 - rho * rho)) * b];
      if (mode === 'parab') return [clamp(a, -2.8, 2.8), clamp(a, -2.8, 2.8) ** 2 - 1 + 0.35 * b];
      const t = 2 * Math.PI * c, rr = 2.2 + 0.18 * b; return [rr * Math.cos(t), rr * Math.sin(t)];
    });
    const [x0, x1, y0, y1] = dom(), X = v => L + (v - x0) / (x1 - x0) * (R - L), Y = v => B - (v - y0) / (y1 - y0) * (B - T);
    return { P, px: P.map(([x, y]) => [X(clamp(x, x0, x1)), Y(clamp(y, y0, y1))]), X, Y };
  };
  const render = (tg, px) => {
    const { P, X, Y } = tg, mx = mean(P.map(p => p[0])), my = mean(P.map(p => p[1]));
    const prods = P.map(([x, y]) => (x - mx) * (y - my)), cov = mean(prods);
    const sx = Math.sqrt(mean(P.map(p => (p[0] - mx) ** 2))), sy = Math.sqrt(mean(P.map(p => (p[1] - my) ** 2))), cor = cov / (sx * sy);
    const [x0, x1, y0, y1] = dom(), MX = X(mx), MY = Y(my);
    let g = '';
    g += `<rect x="${MX}" y="${T}" width="${R - MX}" height="${MY - T}" fill="var(--good-soft)"/><rect x="${L}" y="${MY}" width="${MX - L}" height="${B - MY}" fill="var(--good-soft)"/>`;
    g += `<rect x="${L}" y="${T}" width="${MX - L}" height="${MY - T}" fill="var(--red-soft)"/><rect x="${MX}" y="${MY}" width="${R - MX}" height="${B - MY}" fill="var(--red-soft)"/>`;
    g += `<text x="${R - 8}" y="${T + 22}" class="vp-tg" text-anchor="end" font-size="22" font-weight="700" opacity=".6">+</text><text x="${L + 8}" y="${B - 8}" class="vp-tg" font-size="22" font-weight="700" opacity=".6">+</text><text x="${L + 8}" y="${T + 22}" class="vp-tr" font-size="22" font-weight="700" opacity=".6">−</text><text x="${R - 8}" y="${B - 8}" class="vp-tr" text-anchor="end" font-size="22" font-weight="700" opacity=".6">−</text>`;
    g += `<path d="M${L},${T}V${B}H${R}" class="vz-axis"/>`;
    niceTicks(x0, x1, 6).forEach(v => { g += `<text x="${X(v)}" y="${B + 14}" class="vz-t vz-s" text-anchor="middle">${num(v)}</text>`; });
    niceTicks(y0, y1, 5).forEach(v => { g += `<text x="${L - 4}" y="${Y(v) + 4}" class="vz-t vz-s" text-anchor="end">${num(v)}</text>`; });
    g += `<line x1="${MX}" x2="${MX}" y1="${T}" y2="${B}" stroke="var(--ink-2)" stroke-dasharray="5 4"/><line x1="${L}" x2="${R}" y1="${MY}" y2="${MY}" stroke="var(--ink-2)" stroke-dasharray="5 4"/>`;
    g += `<text x="${MX + 4}" y="${T + 12}" class="vz-t vz-s vp-halo">x̄</text><text x="${R - 2}" y="${MY - 5}" class="vz-t vz-s vp-halo" text-anchor="end">ȳ</text>`;
    px.forEach(([x, y], i) => { g += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="${prods[i] >= 0 ? 'var(--good)' : 'var(--red)'}" fill-opacity=".85" stroke="var(--paper)" stroke-width=".8"/>`; });
    // balance des contributions
    const pos2 = sum(prods.filter(v => v > 0)), neg = -sum(prods.filter(v => v < 0)), tot = pos2 + neg || 1, bw = R - L, yb = B + 42;
    g += `<text x="${L}" y="${yb - 5}" class="vz-t vz-s vp-tm">somme des produits : positifs ${num(pos2, 1)} contre négatifs ${num(neg, 1)}</text>`;
    g += `<rect x="${L}" y="${yb}" width="${bw * pos2 / tot}" height="16" fill="var(--good)" fill-opacity=".75"/><rect x="${L + bw * pos2 / tot}" y="${yb}" width="${bw * neg / tot}" height="16" fill="var(--red)" fill-opacity=".75"/><line x1="${L + bw / 2}" x2="${L + bw / 2}" y1="${yb - 3}" y2="${yb + 19}" stroke="var(--ink)" stroke-width="1.5"/>`;
    el.querySelector('[data-s=stage]').innerHTML = svg(W, H, g, 'Nuage de points et signe des produits');
    el.querySelector('[data-o=kp]').innerHTML = `<div class="hi">cov(X, Y)<b>${num(cov, 3)}</b></div><div>σ(X) · σ(Y)<b>${num(sx * sy, 3)}</b></div><div class="hi">corr(X, Y)<b>${num(cor, 3)}</b></div>`;
    el.querySelector('[data-o=out]').innerHTML = mode === 'lin'
      ? `Ici Y = ρX + √(1 − ρ²)·ε avec ε indépendante de X : corr(X, Y) = ρ = ${num(rho, 2)} en théorie, ${num(cor, 3)} sur ces ${N} points. <b>Observe :</b> plus |ρ| est proche de 1, plus les points s'alignent et plus un signe domine ; pour ρ = 0, verts et rouges s'équilibrent.`
      : mode === 'parab'
        ? `Y est presque une fonction de X (Y ≈ X²) : les variables sont très <b>dépendantes</b>, et pourtant la corrélation est proche de 0 (${num(cor, 3)}). <b>Observe :</b> les contributions positives (à droite) et négatives (à gauche) se compensent. La covariance ne mesure qu'une liaison <b>linéaire</b>.`
        : `Les points sont sur un cercle : connaître X limite fortement Y (dépendance), mais corr ≈ ${num(cor, 3)}. Non corrélées n'implique pas indépendantes.`;
    el.querySelector('[data-o=r]').textContent = num(rho, 2);
  };
  const update = (anim = true) => {
    const tg = target(), to = tg.px, from = pos && pos.length === to.length ? pos : to;
    stop();
    if (!anim) { pos = to; render(tg, to); return; }
    stop = tween(el, 550, u => { pos = from.map((p, i) => [p[0] + (to[i][0] - p[0]) * u, p[1] + (to[i][1] - p[1]) * u]); render(tg, pos); });
  };
  el.querySelector('[data-i=r]').oninput = e => { rho = +e.target.value; update(); };
  el.querySelector('[data-a=new]').onclick = () => { seed++; gen(); update(); };
  el.querySelectorAll('[data-m]').forEach(b => { b.onclick = () => { mode = b.dataset.m; press(el, 'm', mode); el.querySelector('[data-s=rho]').style.opacity = mode === 'lin' ? '1' : '.45'; el.querySelector('[data-i=r]').disabled = mode !== 'lin'; update(); }; });
  gen(); update(false);
}

/* ================================================================== 8. non corrélées mais dépendantes (U = X + Y, V = X − Y) */
function xpyViz(el) {
  let p = 0.5, t = 0, stop = () => {};
  el.innerHTML = head('U = X + Y et V = X − Y : non corrélées mais dépendantes', 'X et Y indépendantes de loi de Bernoulli(p). Transforme les 4 issues : l\'aire de chaque disque est sa probabilité.') +
    `<div class="viz-ctrl">${rangeI('p', 'p', 0.1, 0.9, 0.05, p)}<span class="viz-btns">${btn('go', '▶ (X, Y) → (U, V)')}</span></div>
     <div class="vp-two"><div data-s="stage"></div><div data-s="tab"></div></div><p class="viz-out" data-o="out"></p>`;
  const OUT = [[0, 0], [1, 0], [0, 1], [1, 1]];
  const draw = () => {
    const q = 1 - p, pr = { '00': q * q, '10': p * q, '01': q * p, '11': p * p };
    const W = 340, H = 300, L = 44, R = W - 16, T = 16, B = H - 36, X = v => L + (v + 0.6) / 3.2 * (R - L), Y = v => B - (v + 1.6) / 3.2 * (B - T);
    let g = `<path d="M${L},${T}V${B}H${R}" class="vz-axis"/>`;
    [0, 1, 2].forEach(v => { g += `<line x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${B}" class="vz-grid"/><text x="${X(v)}" y="${B + 15}" class="vz-t vz-s" text-anchor="middle">${v}</text>`; });
    [-1, 0, 1].forEach(v => { g += `<line x1="${L}" x2="${R}" y1="${Y(v)}" y2="${Y(v)}" class="vz-grid"/><text x="${L - 6}" y="${Y(v) + 4}" class="vz-t vz-s" text-anchor="end">${num(v)}</text>`; });
    g += `<text x="${R}" y="${B + 30}" class="vz-t vp-tb" text-anchor="end">${t < 0.5 ? 'X' : 'U = X + Y'}</text><text x="${L + 4}" y="${T + 4}" class="vz-t vp-tb">${t < 0.5 ? 'Y' : 'V = X − Y'}</text>`;
    OUT.forEach(([x, y], i) => {
      const u = x + y, v = x - y, cx = X(x + (u - x) * t), cy = Y(y + (v - y) * t), rad = 6 + 34 * Math.sqrt(pr[`${x}${y}`]);
      g += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${CAT[i]}" fill-opacity=".3" stroke="${CAT[i]}" stroke-width="2"/><text x="${cx}" y="${cy + 4}" class="vz-t vz-s vp-tb vp-halo" text-anchor="middle">${t < 0.5 ? `(${x}, ${y})` : `(${u}, ${num(v)})`}</text>`;
    });
    el.querySelector('[data-s=stage]').innerHTML = svg(W, H, g, 'Les quatre issues de (X, Y) et leurs images (U, V)');
    // tableau loi jointe / produit des marges
    const PU = [q * q, 2 * p * q, p * p], PV = { '-1': p * q, 0: q * q + p * p, 1: p * q }, J = { '0,0': q * q, '1,1': p * q, '1,-1': p * q, '2,0': p * p };
    let tb = `<table class="t vp-tab"><thead><tr><th>V \\ U</th><th>0</th><th>1</th><th>2</th></tr></thead><tbody>`;
    [1, 0, -1].forEach(v => {
      tb += `<tr><th>${num(v)}</th>`;
      [0, 1, 2].forEach(u => { const j = J[`${u},${v}`] || 0, pp = PU[u] * PV[v], ok = Math.abs(j - pp) < 1e-9; tb += `<td class="${ok ? 'ok' : 'ko'}${j ? '' : ' zero'}">${num(j, 3)}<br><small>vs ${num(pp, 3)}</small></td>`; });
      tb += '</tr>';
    });
    tb += `</tbody></table><p class="viz-out" style="font-size:13px">Dans chaque case : P(U = u, V = v), puis P(U = u) × P(V = v). En rouge, les cases où ils diffèrent.</p>`;
    el.querySelector('[data-s=tab]').innerHTML = t > 0.5 ? tb : '<p class="viz-out">Lance la transformation pour comparer la loi du couple (U, V) au produit de ses lois marginales.</p>';
    el.querySelector('[data-o=p]').textContent = num(p, 2);
    el.querySelector('[data-o=out]').innerHTML = `cov(U, V) = cov(X + Y, X − Y) = V(X) − V(Y) = 0 : U et V sont <b>non corrélées</b> (les points images sont symétriques par rapport à l'axe V = 0). Mais P(U = 0, V = 0) = ${num(q * q, 4)} alors que P(U = 0) P(V = 0) = ${num(q * q, 4)} × ${num(q * q + p * p, 4)} = ${num(q * q * (q * q + p * p), 4)} : elles sont <b>dépendantes</b> (si U = 0, alors forcément V = 0). <b>Observe :</b> change p : la covariance reste nulle et la dépendance demeure.`;
  };
  el.querySelector('[data-i=p]').oninput = e => { p = +e.target.value; draw(); };
  el.querySelector('[data-a=go]').onclick = () => { stop(); const a = t, b = t > 0.5 ? 0 : 1; stop = tween(el, 1200, u => { t = a + (b - a) * u; draw(); }); };
  draw();
}

/* ================================================================== 9. vecteur gaussien en dimension 2 */
function gauss2dViz(el) {
  let s1 = 1, s2 = 1, rho = 0, showPts = true, spin = !RM(), phi = 0.35, visible = true, stop = () => {};
  const r = rng(91), ZZ = Array.from({ length: 220 }, () => [gauss(r), gauss(r)]);
  el.innerHTML = head('Densité d\'un vecteur gaussien (X₁, X₂)', 'Règle σ₁, σ₂ et ρ : à gauche les ellipses de niveau vues de dessus, à droite la surface de densité en relief (même échelle de hauteur).') +
    `<div class="viz-ctrl">${rangeI('s1', 'σ₁', 0.8, 2, 0.05, s1)}${rangeI('s2', 'σ₂', 0.8, 2, 0.05, s2)}${rangeI('r', 'ρ', -0.95, 0.95, 0.05, rho)}</div>
     <div class="viz-btns">${btn('p0', 'ρ = 0')}${btn('p95', 'ρ = 0,95 (pic pointu)')}${btn('pneg', 'ρ = −0,6')}${btn('pf', 'Σ de la fiche ex. 11')}<button type="button" class="chip" data-t="pts" aria-pressed="true">points simulés</button><button type="button" class="chip" data-t="spin" aria-pressed="${spin}">rotation</button></div>
     <div class="vp-two"><div data-s="top"></div><div data-s="d3"></div></div>
     <div class="vp-mats" data-o="mat"></div><p class="viz-out" data-o="out"></p>`;
  const cid = 'vp-clip-' + Math.random().toString(36).slice(2, 8), top = el.querySelector('[data-s=top]'), d3 = el.querySelector('[data-s=d3]');
  const dens = (x, y) => { const q = (x * x / (s1 * s1) - 2 * rho * x * y / (s1 * s2) + y * y / (s2 * s2)) / (1 - rho * rho); return Math.exp(-q / 2) / (2 * Math.PI * s1 * s2 * Math.sqrt(1 - rho * rho)); };
  const drawTop = () => {
    const W = 300, H = 300, c = 150, k = 33, X = x => c + k * x, Y = y => c - k * y, peak = dens(0, 0), G = 30, cs = 8 / G;
    let g = '';
    for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
      const x = -4 + (i + 0.5) * cs, y = -4 + (j + 0.5) * cs, d = dens(x, y) / peak;
      if (d > 0.02) g += `<rect x="${X(x - cs / 2).toFixed(1)}" y="${Y(y + cs / 2).toFixed(1)}" width="${(k * cs + 1).toFixed(1)}" height="${(k * cs + 1).toFixed(1)}" shape-rendering="crispEdges" fill="color-mix(in srgb, var(--accent) ${(55 * d).toFixed(1)}%, var(--paper))"/>`;
    }
    g += `<line x1="0" x2="${W}" y1="${c}" y2="${c}" class="vz-grid"/><line x1="${c}" x2="${c}" y1="0" y2="${H}" class="vz-grid"/>`;
    const a = s2 * Math.sqrt(1 - rho * rho);
    [[1, '39 %'], [2, '86 %'], [3, '99 %']].forEach(([m, lab]) => {
      const pts = Array.from({ length: 73 }, (_, i) => { const th = 2 * Math.PI * i / 72, u = m * Math.cos(th), v = m * Math.sin(th); return [X(s1 * u), Y(rho * s2 * u + a * v)]; });
      g += `<path d="${path(pts)}Z" fill="none" stroke="var(--accent)" stroke-width="${m === 1 ? 2 : 1.3}" opacity="${1 - 0.22 * m}"/>`;
      const tx = s1 * m * 0.707, ty = rho * s2 * m * 0.707 + a * m * 0.707;
      if (m < 3) g += `<text x="${X(tx) + 3}" y="${Y(ty) - 3}" class="vz-t vz-s vp-ta vp-halo">${lab}</text>`;
    });
    if (showPts) ZZ.forEach(([u, v]) => { g += `<circle cx="${X(s1 * u).toFixed(1)}" cy="${Y(rho * s2 * u + a * v).toFixed(1)}" r="1.8" fill="var(--ink)" fill-opacity=".55"/>`; });
    g = `<defs><clipPath id="${cid}"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath></defs><g clip-path="url(#${cid})">${g}</g>`;
    g += `<text x="${W - 4}" y="${c - 5}" class="vz-t vz-s" text-anchor="end">x₁</text><text x="${c + 5}" y="12" class="vz-t vz-s">x₂</text>`;
    top.innerHTML = `<p class="vp-sub">Vue de dessus : ellipses de niveau</p>` + svg(W, H, g, 'Ellipses de niveau de la densité');
  };
  const draw3d = () => {
    const W = 360, H = 300, cx = 192, cy = 214, k = 25, tilt = 0.5, Zs = 210, n = 31, cph = Math.cos(phi), sph = Math.sin(phi), peak = dens(0, 0);
    const P = (x, y, z) => [cx + k * (x * cph - y * sph), cy + k * tilt * (x * sph + y * cph) - Zs * z];
    let g = '';
    const corner = [[-4, -4], [4, -4], [4, 4], [-4, 4]].map(([x, y]) => P(x, y, 0));
    g += `<path d="${path(corner)}Z" fill="var(--paper-2)" stroke="var(--line-strong)"/>`;
    // jauge de hauteur
    const gx = 22;
    g += `<line x1="${gx}" x2="${gx}" y1="${cy}" y2="${cy - Zs * 0.9}" class="vz-axis"/>`;
    [0.2, 0.4, 0.6, 0.8].forEach(v => { g += `<line x1="${gx - 3}" x2="${gx + 3}" y1="${cy - Zs * v}" y2="${cy - Zs * v}" class="vz-axis"/><text x="${gx + 5}" y="${cy - Zs * v + 4}" class="vz-t vz-s vp-tm">${num(v, 1)}</text>`; });
    const ref = 1 / (2 * Math.PI);
    g += `<line x1="${gx - 6}" x2="${gx + 6}" y1="${cy - Zs * ref}" y2="${cy - Zs * ref}" stroke="var(--muted)" stroke-width="2"/><text x="${gx - 8}" y="${cy - Zs * ref + 4}" class="vz-t vz-s vp-tm" text-anchor="end">⊥</text>`;
    const xs = Array.from({ length: 97 }, (_, i) => -4 + 8 * i / 96);
    for (let j = 0; j < n; j++) {
      const y = -4 + 8 * j / (n - 1), curve = xs.map(x => P(x, y, dens(x, y))), base = xs.slice().reverse().map(x => P(x, y, 0));
      g += `<path d="${path([...curve, ...base])}Z" fill="var(--paper)" fill-opacity=".93"/><path d="${path(curve)}" fill="none" stroke="var(--accent)" stroke-width="1.3"/>`;
    }
    const [pxx, pyy] = P(0, 0, peak);
    g += `<line x1="${gx}" x2="${pxx}" y1="${pyy}" y2="${pyy}" stroke="var(--red)" stroke-dasharray="4 3"/><circle cx="${gx}" cy="${pyy}" r="4" fill="var(--red)"/><text x="${gx + 8}" y="${pyy - 6}" class="vz-t vz-s vp-tr vp-tb vp-halo">max = ${num(peak, 3)}</text>`;
    const ax1 = P(4.6, 0, 0), ax2 = P(0, 4.6, 0);
    g += `<text x="${ax1[0]}" y="${ax1[1]}" class="vz-t vz-s vp-tm">x₁</text><text x="${ax2[0]}" y="${ax2[1] + 10}" class="vz-t vz-s vp-tm">x₂</text>`;
    d3.innerHTML = `<p class="vp-sub">Surface de densité (hauteur = f(x₁, x₂))</p>` + svg(W, H, g, 'Surface de densité en relief');
  };
  const info = () => {
    const det = s1 * s1 * s2 * s2 * (1 - rho * rho), c = rho * s1 * s2;
    el.querySelector('[data-o=mat]').innerHTML = `<span>Σ = <span class="vp-mat"><span>${num(s1 * s1, 3)}</span><span>${num(c, 3)}</span><span>${num(c, 3)}</span><span>${num(s2 * s2, 3)}</span></span></span><span>|Σ| = σ₁²σ₂²(1 − ρ²) = <b>${num(det, 4)}</b></span><span>max = 1/(2π√|Σ|) = <b>${num(1 / (2 * Math.PI * Math.sqrt(det)), 4)}</b></span>`;
    el.querySelector('[data-o=out]').innerHTML = `Les courbes de niveau sont des ellipses centrées en μ = (0, 0) ; les pourcentages indiquent la probabilité d'être à l'intérieur. ${rho > 0.02 ? 'ρ &gt; 0 : ellipses orientées dans le sens croissant.' : rho < -0.02 ? 'ρ &lt; 0 : ellipses orientées dans le sens décroissant.' : Math.abs(s1 - s2) < 0.01 ? 'ρ = 0 et σ₁ = σ₂ : des cercles.' : 'ρ = 0 : ellipses parallèles aux axes (composantes indépendantes).'} <b>Observe :</b> quand |ρ| s'approche de 1, |Σ| devient petit, la densité se concentre le long d'une droite et son pic monte (repère ⊥ : 1/(2π) ≈ 0,159 pour ρ = 0, σ₁ = σ₂ = 1 ; avec ρ = 0,95 il atteint ≈ 0,51, le graphique « pointu » de l'examen).`;
    ['s1', 's2', 'r'].forEach(kk => { el.querySelector(`[data-o=${kk}]`).textContent = num(kk === 's1' ? s1 : kk === 's2' ? s2 : rho, 2); el.querySelector(`[data-i=${kk}]`).value = kk === 's1' ? s1 : kk === 's2' ? s2 : rho; });
  };
  const all = () => { drawTop(); draw3d(); info(); };
  let tPrev = null;
  const kick = loop(el, now => {
    if (!spin || !visible || RM()) { tPrev = null; return false; }
    if (tPrev !== null) phi += (now - tPrev) * 0.0004 * dir;
    if (phi > 0.6) dir = -1; if (phi < -0.6) dir = 1;
    tPrev = now; draw3d(); return true;
  });
  let dir = 1;
  try { new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(el); } catch (e) { /* rien */ }
  [['s1', v => { s1 = v; }], ['s2', v => { s2 = v; }], ['r', v => { rho = v; }]].forEach(([kk, fn]) => { el.querySelector(`[data-i=${kk}]`).oninput = e => { stop(); fn(+e.target.value); all(); }; });
  const go = (a, b, c) => { stop(); const A = s1, Bb = s2, C = rho; stop = tween(el, 900, u => { s1 = A + (a - A) * u; s2 = Bb + (b - Bb) * u; rho = C + (c - C) * u; all(); }); };
  el.querySelector('[data-a=p0]').onclick = () => go(1, 1, 0);
  el.querySelector('[data-a=p95]').onclick = () => go(1, 1, 0.95);
  el.querySelector('[data-a=pneg]').onclick = () => go(1.5, 1, -0.6);
  el.querySelector('[data-a=pf]').onclick = () => go(2, 1, 0.5);
  el.querySelector('[data-t=pts]').onclick = e => { showPts = !showPts; e.currentTarget.setAttribute('aria-pressed', String(showPts)); drawTop(); };
  el.querySelector('[data-t=spin]').onclick = e => { spin = !spin; e.currentTarget.setAttribute('aria-pressed', String(spin)); kick(); };
  all(); kick();
}

/* ================================================================== 10. transformation linéaire AX */
function transfoViz(el) {
  const S = [[4, 1], [1, 1]], Lc = [[2, 0], [0.5, Math.sqrt(0.75)]];
  const PRE = {
    fiche: { nom: 'A de la fiche ex. 11', A: [[1, 1], [2, -1]], txt: 'W = (X + Y, 2X − Y)' },
    rot: { nom: 'Rotation 45°', A: [[Math.SQRT1_2, -Math.SQRT1_2], [Math.SQRT1_2, Math.SQRT1_2]], txt: 'rotation d\'angle 45°' },
    diag: { nom: 'Dilatation', A: [[0.5, 0], [0, 2]], txt: '(X/2, 2Y)' },
    somme: { nom: 'Somme a\'X', A: [[1, 1], [0, 0]], txt: 'X + Y (combinaison linéaire a\'X avec a = (1, 1)\')' },
  };
  let cur = 'fiche', t = 0, seed = 5, Z = [], stop = () => {};
  const gen = () => { const r = rng(seed); Z = Array.from({ length: 260 }, () => [gauss(r), gauss(r)]); };
  el.innerHTML = head('Transformation linéaire d\'un vecteur gaussien', 'X ~ N₂(0, Σ) avec Σ de la fiche ex. 11. Applique A : le nuage, les ellipses et la grille se déforment, et la covariance devient AΣA\'.') +
    chips('tf', Object.entries(PRE).map(([k, v]) => [k, v.nom]), cur) +
    `<div class="viz-ctrl">${rangeI('t', 'progression', 0, 1, 0.01, t)}<span class="viz-btns">${btn('go', '▶ Appliquer A')}${btn('new', 'Nouveau tirage')}</span></div>
     <div class="vp-stage" data-s="stage"></div><div class="vp-mats" data-o="mat"></div><p class="viz-out" data-o="out"></p>`;
  const mul = (A, B) => [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
  const tr = A => [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];
  const ap = (A, [x, y]) => [A[0][0] * x + A[0][1] * y, A[1][0] * x + A[1][1] * y];
  const mat = (M, d = 2) => `<span class="vp-mat">${[M[0][0], M[0][1], M[1][0], M[1][1]].map(v => `<span>${num(Math.abs(v) < 1e-12 ? 0 : v, d)}</span>`).join('')}</span>`;
  const draw = () => {
    const A = PRE[cur].A, M = [[1 + (A[0][0] - 1) * t, A[0][1] * t], [A[1][0] * t, 1 + (A[1][1] - 1) * t]];
    const ST = mul(mul(A, S), tr(A)), D = 3.1 * Math.sqrt(Math.max(S[0][0], S[1][1], ST[0][0], ST[1][1]));
    const W = 340, H = 340, c = W / 2, k = (W / 2 - 14) / D, X = x => c + k * x, Y = y => c - k * y;
    let g = '';
    for (let v = -12; v <= 12; v += 2) {
      const a1 = ap(M, [v, -12]), a2 = ap(M, [v, 12]), b1 = ap(M, [-12, v]), b2 = ap(M, [12, v]);
      g += `<line x1="${X(a1[0])}" y1="${Y(a1[1])}" x2="${X(a2[0])}" y2="${Y(a2[1])}" stroke="var(--line)" stroke-width="${v ? 1 : 1.6}"/><line x1="${X(b1[0])}" y1="${Y(b1[1])}" x2="${X(b2[0])}" y2="${Y(b2[1])}" stroke="var(--line)" stroke-width="${v ? 1 : 1.6}"/>`;
    }
    g += `<line x1="0" x2="${W}" y1="${c}" y2="${c}" class="vz-axis" opacity=".6"/><line x1="${c}" x2="${c}" y1="0" y2="${H}" class="vz-axis" opacity=".6"/>`;
    const pts = Z.map(z => ap(M, ap(Lc, z)));
    [1, 2].forEach(m => {
      const e = Array.from({ length: 73 }, (_, i) => { const th = 2 * Math.PI * i / 72, q = ap(M, ap(Lc, [m * Math.cos(th), m * Math.sin(th)])); return [X(q[0]), Y(q[1])]; });
      g += `<path d="${path(e)}Z" fill="${m === 1 ? 'var(--accent)' : 'none'}" fill-opacity=".1" stroke="var(--accent)" stroke-width="${m === 1 ? 2.2 : 1.4}"/>`;
    });
    pts.forEach(([x, y]) => { g += `<circle cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="2" fill="var(--c2)" fill-opacity=".7"/>`; });
    // images des vecteurs de base
    const e1 = ap(M, [1, 0]), e2 = ap(M, [0, 1]);
    g += `<defs><marker id="vp-ar-t" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="context-stroke"/></marker></defs>`;
    g += `<line x1="${c}" y1="${c}" x2="${X(e1[0])}" y2="${Y(e1[1])}" stroke="var(--c3)" stroke-width="2.5" marker-end="url(#vp-ar-t)"/><line x1="${c}" y1="${c}" x2="${X(e2[0])}" y2="${Y(e2[1])}" stroke="var(--c6)" stroke-width="2.5" marker-end="url(#vp-ar-t)"/>`;
    el.querySelector('[data-s=stage]').innerHTML = svg(W, H, g, 'Nuage gaussien transformé par A');
    const n = pts.length, mx = mean(pts.map(p => p[0])), my = mean(pts.map(p => p[1]));
    const emp = [[mean(pts.map(p => (p[0] - mx) ** 2)), mean(pts.map(p => (p[0] - mx) * (p[1] - my)))], [0, mean(pts.map(p => (p[1] - my) ** 2))]]; emp[1][0] = emp[0][1];
    const Mt = mul(mul(M, S), tr(M));
    el.querySelector('[data-o=mat]').innerHTML = `<span>Σ = ${mat(S, 0)}</span><span>A = ${mat(A)}</span><span>A Σ A' = ${mat(ST)}</span><span>${t < 1 ? 'étape actuelle M Σ M\' = ' + mat(Mt) : 'covariance observée ≈ ' + mat(emp)}</span>`;
    el.querySelector('[data-o=t]').textContent = num(t * 100, 0) + ' %';
    el.querySelector('[data-i=t]').value = t;
    el.querySelector('[data-o=out]').innerHTML = `${PRE[cur].txt} : AX ~ N₂(0, AΣA'). ${cur === 'fiche' ? 'On retrouve AΣA\' = (7 8 ; 8 13) de la fiche.' : cur === 'somme' ? 'Le nuage s\'écrase sur l\'axe horizontal : X + Y ~ N(0, a\'Σa) avec a\'Σa = 4 + 1 + 2 × 1 = 7 (la somme de tous les termes de Σ).' : cur === 'rot' ? 'Une rotation ne change ni |Σ| ni la forme du nuage : elle le fait tourner.' : 'Chaque coordonnée est multipliée par une constante : les variances par son carré (4 × 0,25 = 1 et 1 × 4 = 4).'} <b>Observe :</b> l'image d'un vecteur gaussien par une application linéaire reste gaussienne : les ellipses restent des ellipses. Flèches : images des vecteurs de base (colonnes de A).`;
  };
  el.querySelector('[data-i=t]').oninput = e => { stop(); t = +e.target.value; draw(); };
  el.querySelector('[data-a=go]').onclick = () => { stop(); const a = t >= 0.99 ? 0 : t; t = a; stop = tween(el, 1800, u => { t = a + (1 - a) * u; draw(); }); };
  el.querySelector('[data-a=new]').onclick = () => { seed++; gen(); draw(); };
  el.querySelectorAll('[data-tf]').forEach(b => { b.onclick = () => { stop(); cur = b.dataset.tf; press(el, 'tf', cur); t = 0; draw(); stop = tween(el, 1800, u => { t = u; draw(); }); }; });
  gen(); draw();
}

/* ================================================================== 11. biais, variance, risque : la cible */
function cibleViz(el) {
  const SC = {
    ecq: { nom: 'T₁ = Sₙ/n ou T₂ = (Sₙ + 1)/(n + 2) ?', P: [['p', 'p', 0.05, 0.95, 0.05, 0.5], ['n', 'n', 1, 50, 1, 10]] },
    cm: { nom: 'Trois estimateurs (CM ex. 1)', P: [['th', 'θ', 1, 10, 0.5, 4], ['n', 'n', 1, 100, 1, 10]] },
  };
  let cur = 'ecq', P = {}, darts = [], parts = [];
  const r = rng(31);
  el.innerHTML = head('Biais, variance, risque quadratique : la cible', 'Chaque lancer = un nouvel échantillon, et chaque estimateur tire une fléchette (son estimation). Le centre de la cible est la vraie valeur.') +
    chips('sc', Object.entries(SC).map(([k, v]) => [k, v.nom]), cur) +
    `<div class="viz-ctrl" data-s="par"></div><div class="viz-btns">${btn(1, 'Lancer 1 échantillon')}${btn(50, 'Lancer 50')}${btn(0, 'Effacer')}</div>
     <div class="vp-stage" data-s="stage"></div><div data-o="tab"></div><p class="viz-out" data-o="out"></p>`;
  const ests = () => {
    if (cur === 'ecq') {
      const { p, n } = P;
      return { th: p, lo: 0, hi: 1, list: [
        { nm: 'T₁ = Sₙ/n', E: p, V: p * (1 - p) / n },
        { nm: 'T₂ = (Sₙ+1)/(n+2)', E: (n * p + 1) / (n + 2), V: n * p * (1 - p) / (n + 2) ** 2 },
      ], draw: () => { let s = 0; for (let i = 0; i < n; i++) if (r() < p) s++; return [s / n, (s + 1) / (n + 2)]; } };
    }
    const { th, n } = P, sd1 = Math.sqrt(2 * th / n);
    return { th, lo: th - 5, hi: th + 6, list: [
      { nm: 'T₁', E: th + 2, V: 2 * th / n }, { nm: 'T₂', E: th + 2 / n, V: 2 * th / n }, { nm: 'T₃', E: th, V: 2 },
    ], draw: () => { const z = gauss(r); return [th + 2 + sd1 * z, th + 2 / n + sd1 * gauss(r), th + Math.SQRT2 * gauss(r)]; } };
  };
  const setSc = k => {
    cur = k; P = {}; SC[k].P.forEach(([kk, , , , , v]) => { P[kk] = v; });
    el.querySelector('[data-s=par]').innerHTML = SC[k].P.map(([kk, lab, a, b, s, v]) => rangeI(kk, lab, a, b, s, v)).join('');
    el.querySelectorAll('[data-s=par] [data-i]').forEach(i => { i.oninput = () => { P[i.dataset.i] = +i.value; darts = []; parts = []; draw(); }; });
    press(el, 'sc', k); darts = []; parts = []; draw();
  };
  const draw = (now = performance.now()) => {
    const es = ests(), K = es.list.length, W = 420, L = 78, R = W - 14, lh = 66, T = 24, Hl = T + K * lh, H = Hl + 28 + K * 30 + 8;
    const X = v => L + (clamp(v, es.lo, es.hi) - es.lo) / (es.hi - es.lo) * (R - L);
    let g = '';
    niceTicks(es.lo, es.hi, 6).forEach(v => { g += `<line x1="${X(v)}" x2="${X(v)}" y1="${T - 4}" y2="${Hl}" class="vz-grid"/><text x="${X(v)}" y="${T - 8}" class="vz-t vz-s" text-anchor="middle">${num(v, 2)}</text>`; });
    es.list.forEach((e, i) => {
      const mid = T + i * lh + lh / 2, cx = X(es.th);
      g += `<line x1="${L}" x2="${R}" y1="${T + (i + 1) * lh}" y2="${T + (i + 1) * lh}" stroke="var(--line)"/>`;
      [26, 18, 10].forEach((rr, j) => { g += `<circle cx="${cx}" cy="${mid}" r="${rr}" fill="${j % 2 ? 'var(--paper)' : 'var(--red-soft)'}" stroke="var(--red)" stroke-width="1" opacity=".9"/>`; });
      g += `<circle cx="${cx}" cy="${mid}" r="3" fill="var(--red)"/>`;
      g += `<text x="${L - 8}" y="${mid + 4}" class="vz-t vp-tb" text-anchor="end" fill="${CAT[i]}">${e.nm.split(' =')[0]}</text>`;
      // biais théorique
      const bx = X(e.E);
      if (Math.abs(bx - cx) > 3) g += `<line x1="${cx}" x2="${bx}" y1="${mid + 27}" y2="${mid + 27}" stroke="var(--red)" stroke-width="2" marker-end="url(#vp-ar-c)"/><text x="${(cx + bx) / 2}" y="${mid + 24}" class="vz-t vz-s vp-tr vp-halo" text-anchor="middle">biais</text>`;
      const ds = darts.filter(d => d.i === i);
      ds.forEach(d => { g += `<circle cx="${X(d.v)}" cy="${mid + d.j}" r="3.4" fill="${CAT[i]}" stroke="var(--paper)" stroke-width=".8"/>`; });
      if (ds.length > 1) { const m = mean(ds.map(d => d.v)); g += `<path d="M${X(m)},${mid - 30}l5,6l-5,6l-5,-6z" fill="var(--ink)"/>`; }
    });
    g += `<defs><marker id="vp-ar-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--red)"/></marker></defs>`;
    parts.forEach(q => {
      const u = (now - q.t0) / q.dur; if (u < 0) return;
      const mid = T + q.i * lh + lh / 2, x1 = X(q.v), y1 = mid + q.j, x0 = R + 10, y0 = T - 20, e = 1 - (1 - Math.min(1, u)) ** 2;
      const x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e - 40 * Math.sin(Math.PI * Math.min(1, u));
      g += `<circle cx="${x}" cy="${y}" r="4" fill="${CAT[q.i]}" stroke="var(--paper)"/>`;
    });
    // barres du risque quadratique
    const Rs = es.list.map(e => e.V + (e.E - es.th) ** 2), Rm = Math.max(...Rs) * 1.05, bl = L, br = R - 70;
    g += `<text x="${L - 8}" y="${Hl + 20}" class="vz-t vz-s vp-tm" text-anchor="end">risque</text><text x="${bl}" y="${Hl + 20}" class="vz-t vz-s vp-tm">R = variance (bleu) + biais² (rouge)</text>`;
    es.list.forEach((e, i) => {
      const y = Hl + 28 + i * 30, wv = (br - bl) * e.V / Rm, wb = (br - bl) * (e.E - es.th) ** 2 / Rm, best = Rs[i] === Math.min(...Rs);
      g += `<text x="${L - 8}" y="${y + 13}" class="vz-t vz-s vp-tb" text-anchor="end" fill="${CAT[i]}">${e.nm.split(' =')[0]}</text>`;
      g += `<rect x="${bl}" y="${y}" width="${Math.max(0.5, wv)}" height="18" fill="var(--accent)" fill-opacity=".8"/><rect x="${bl + wv}" y="${y}" width="${Math.max(0, wb)}" height="18" fill="var(--red)" fill-opacity=".8"/>`;
      g += `<text x="${bl + wv + wb + 6}" y="${y + 13}" class="vz-t vz-s ${best ? 'vp-tb vp-tg' : ''}">${num(Rs[i], 4)}${best ? ' ★' : ''}</text>`;
    });
    el.querySelector('[data-s=stage]').innerHTML = svg(W, H, g, 'Cibles des estimateurs et risques quadratiques');
    el.querySelectorAll('[data-s=par] [data-o]').forEach(o => { o.textContent = num(P[o.dataset.o], 2); });
    const N = darts.length / K;
    let tb = `<table class="t vp-tab"><thead><tr><th>estimateur</th><th>E(T) − θ</th><th>V(T)</th><th>R(T)</th>${N ? `<th>moyenne des ${N} tirs</th><th>risque observé</th>` : ''}</tr></thead><tbody>`;
    es.list.forEach((e, i) => {
      const ds = darts.filter(d => d.i === i).map(d => d.v);
      tb += `<tr><td style="text-align:left;color:${CAT[i]}"><b>${e.nm.split(" =")[0]}</b></td><td>${num(e.E - es.th, 4)}</td><td>${num(e.V, 4)}</td><td><b>${num(Rs[i], 4)}</b></td>${N ? `<td>${num(mean(ds), 3)}</td><td>${num(mean(ds.map(v => (v - es.th) ** 2)), 4)}</td>` : ''}</tr>`;
    });
    el.querySelector('[data-o=tab]').innerHTML = tb + '</tbody></table>';
    el.querySelector('[data-o=out]').innerHTML = cur === 'ecq'
      ? `Xᵢ ~ Ber(p), Sₙ ~ B(n, p). T₁ est sans biais ; T₂ est biaisé (biais (1 − 2p)/(n + 2)) mais moins dispersé. <b>Observe :</b> pour p = 0,5, T₂ a le plus petit risque (biais nul, variance plus faible) ; éloigne p de 0,5 avec n petit : le biais de T₂ grandit et T₁ peut gagner. Quand n augmente, les deux se resserrent sur le centre.`
      : `E(T₁) = θ + 2, E(T₂) = θ + 2/n, E(T₃) = θ ; V(T₁) = V(T₂) = 2θ/n, V(T₃) = 2 (les tirs sont simulés avec une loi normale de cette espérance et cette variance). <b>Observe :</b> augmente n : T₁ se resserre… à côté du centre (biais 2, pas convergent), T₃ reste dispersé (variance 2), seul T₂ se resserre sur le centre : il est convergent.`;
  };
  const kick = loop(el, now => {
    const keep = []; parts.forEach(q => { if (now - q.t0 >= q.dur) darts.push(q); else keep.push(q); });
    parts = keep; draw(now); return parts.length > 0;
  });
  const shoot = k => {
    if (!k) { darts = []; parts = []; draw(); return; }
    const es = ests(), now = performance.now();
    for (let s = 0; s < k; s++) {
      const v = es.draw();
      v.forEach((x, i) => { const d = { i, v: x, j: (r() - 0.5) * 40, t0: now + s * (k > 1 ? 30 : 0) + i * 90, dur: 650 }; if (RM()) darts.push(d); else parts.push(d); });
    }
    if (RM()) draw(); else kick();
  };
  el.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => shoot(+b.dataset.a); });
  el.querySelectorAll('[data-sc]').forEach(b => { b.onclick = () => setSc(b.dataset.sc); });
  setSc(cur);
}

/* ================================================================== 12. variance empirique en 1/n ou 1/(n − 1) */
function varEmpViz(el) {
  const mu = 10, sg = 2, S2 = 4, lo = 0, hi = 16, nb = 32;
  let n = 4, A = [], Bv = [], last = null, parts = [];
  const r = rng(15);
  el.innerHTML = head('Variance empirique : diviser par n ou par n − 1 ?', 'Échantillons de taille n d\'une loi N(10 ; 4), donc σ² = 4. Chaque échantillon donne deux estimations de σ², qui tombent dans deux histogrammes.') +
    `<div class="viz-ctrl">${rangeI('n', 'n', 2, 30, 1, n)}<span class="viz-btns">${btn(1, '1 échantillon')}${btn(200, '+200 échantillons')}${btn(0, 'Effacer')}</span></div>
     <div class="vp-stage" data-s="stage"></div><div class="vp-kpis" data-o="kp"></div><p class="viz-out" data-o="out"></p>`;
  const sample = () => { const x = Array.from({ length: n }, () => mu + sg * gauss(r)), m = mean(x), ss = sum(x.map(v => (v - m) ** 2)); return { x, m, a: ss / n, b: ss / (n - 1) }; };
  const draw = (now = performance.now()) => {
    const W = 420, L = 20, R = W - 14, H = 376, X = v => L + (clamp(v, lo, hi) - lo) / (hi - lo) * (R - L);
    const lanes = [{ y: 190, h: 86, d: A, nm: 'en 1/n (biaisé)', c: 'var(--c2)', th: (n - 1) / n * S2 }, { y: 332, h: 86, d: Bv, nm: 'en 1/(n − 1) (sans biais)', c: 'var(--c1)', th: S2 }];
    const bw = (hi - lo) / nb, cnts = lanes.map(l => { const c = new Array(nb).fill(0); l.d.forEach(v => { const i = Math.floor((v - lo) / bw); if (i >= 0 && i < nb) c[i]++; else if (i >= nb) c[nb - 1]++; }); return c; });
    const cm = Math.max(1, ...cnts.flat());
    let g = '';
    // bande de l'échantillon
    const sx = v => L + (v - 3) / 14 * (R - L);
    g += `<line x1="${L}" x2="${R}" y1="56" y2="56" class="vz-axis"/>`;
    [4, 6, 8, 10, 12, 14, 16].forEach(v => { g += `<text x="${sx(v)}" y="70" class="vz-t vz-s" text-anchor="middle">${v}</text>`; });
    g += `<line x1="${sx(mu)}" x2="${sx(mu)}" y1="14" y2="56" class="vp-mu"/><text x="${sx(mu) + 4}" y="14" class="vz-t vz-s vp-tg">μ = 10</text>`;
    if (last) {
      const pr = last.t0 ? clamp((now - last.t0) / 500, 0, 1) : 1;
      g += `<line x1="${sx(last.m)}" x2="${sx(last.m)}" y1="22" y2="56" stroke="var(--red)" stroke-width="2" opacity="${pr}"/><text x="${sx(last.m) - 4}" y="30" class="vz-t vz-s vp-tr vp-tb" text-anchor="end" opacity="${pr}">x̄</text>`;
      last.x.forEach((v, i) => { g += `<line x1="${sx(last.m)}" x2="${sx(v)}" y1="${44 - (i % 4) * 4}" y2="${44 - (i % 4) * 4}" stroke="var(--red)" stroke-opacity="${0.35 * pr}"/><circle cx="${sx(clamp(v, 3, 17))}" cy="${44 - (i % 4) * 4}" r="3.5" fill="var(--ink)" fill-opacity=".8"/>`; });
      g += `<text x="${R}" y="12" class="vz-t vz-s vp-tm" text-anchor="end">dernier échantillon (n = ${last.x.length})</text>`;
    }
    lanes.forEach((l, j) => {
      g += `<text x="${L}" y="${l.y - l.h - 6}" class="vz-t vz-s vp-tb" fill="${l.c}">S² ${l.nm}</text><line x1="${L}" x2="${R}" y1="${l.y}" y2="${l.y}" class="vz-axis"/>`;
      cnts[j].forEach((c, i) => { if (c) { const h = c / cm * (l.h - 14); g += `<rect x="${X(lo + i * bw) + 0.5}" y="${l.y - h}" width="${X(bw) - X(0) - 1}" height="${h}" fill="${l.c}" fill-opacity=".35" stroke="${l.c}"/>`; } });
      if (j === 0) g += `<line x1="${X(l.th)}" x2="${X(l.th)}" y1="${l.y - l.h + 8}" y2="${l.y}" class="vp-E"/><text x="${X(l.th) - 4}" y="${l.y - l.h + 8}" class="vz-t vz-s vp-tr" text-anchor="end">E = ${num(l.th, 2)}</text>`;
      if (l.d.length) { const m = mean(l.d); g += `<path d="M${X(m)},${l.y + 2}l6,8h-12z" fill="${l.c}"/><text x="${X(m)}" y="${l.y + 22}" class="vz-t vz-s vp-tb vp-halo" text-anchor="middle" fill="${l.c}">moyenne ${num(m, 2)}</text>`; }
      niceTicks(lo, hi, 8).forEach(v => { if (j === 1) g += `<text x="${X(v)}" y="${l.y + 34}" class="vz-t vz-s" text-anchor="middle">${v}</text>`; });
    });
    g += `<line x1="${X(S2)}" x2="${X(S2)}" y1="${lanes[0].y - lanes[0].h}" y2="${lanes[1].y}" class="vp-mu"/><text x="${X(S2) + 4}" y="${lanes[0].y - lanes[0].h + 8}" class="vz-t vz-s vp-tg vp-tb">σ² = 4</text>`;
    parts.forEach(q => {
      const u = (now - q.t0) / q.dur; if (u < 0) return;
      const l = lanes[q.k], i = Math.min(nb - 1, Math.floor((q.v - lo) / bw)), h = cnts[q.k][i] / cm * (l.h - 14), y0 = 60, y1 = l.y - h - 5;
      g += `<circle cx="${X(q.v)}" cy="${y0 + (y1 - y0) * Math.min(1, u * u)}" r="${q.big ? 5.5 : 3.5}" fill="${l.c}" stroke="var(--paper)"/>`;
    });
    el.querySelector('[data-s=stage]').innerHTML = svg(W, H, g, 'Histogrammes des deux estimateurs de la variance');
    el.querySelector('[data-o=n]').textContent = n;
    const N = A.length;
    el.querySelector('[data-o=kp]').innerHTML = `<div>échantillons<b>${N}</b></div><div>moyenne des S² en 1/n<b>${N ? num(mean(A), 3) : '—'}</b>théorie (n − 1)σ²/n = ${num((n - 1) / n * S2, 3)}</div><div class="hi">moyenne des S² en 1/(n − 1)<b>${N ? num(mean(Bv), 3) : '—'}</b>théorie σ² = 4</div>`;
    el.querySelector('[data-o=out]').innerHTML = `Les écarts sont mesurés à x̄ et non à μ : x̄ est « au milieu » des points, donc les écarts sont un peu trop petits, d'où E(S²₁/ₙ) = (n − 1)σ²/n. Diviser par n − 1 corrige exactement ce biais. <b>Observe :</b> avec n = 2 ou 3 le biais saute aux yeux ; avec n = 30, (n − 1)/n ≈ 0,97 et les deux histogrammes se ressemblent.`;
  };
  const kick = loop(el, now => {
    const keep = []; parts.forEach(q => { if (now - q.t0 >= q.dur) (q.k ? Bv : A).push(q.v); else keep.push(q); });
    parts = keep; draw(now); return parts.length > 0 || (last && last.t0 && now - last.t0 < 600);
  });
  const shoot = k => {
    if (!k) { A = []; Bv = []; parts = []; last = null; draw(); return; }
    const now = performance.now();
    for (let s = 0; s < k; s++) {
      const sm = sample(); last = { ...sm, t0: k === 1 && !RM() ? now : 0 };
      if (RM()) { A.push(sm.a); Bv.push(sm.b); continue; }
      const t0 = now + (k === 1 ? 650 : s * 7);
      parts.push({ k: 0, v: sm.a, t0, dur: k === 1 ? 700 : 450, big: k === 1 }, { k: 1, v: sm.b, t0: t0 + (k === 1 ? 150 : 0), dur: k === 1 ? 800 : 500, big: k === 1 });
    }
    if (RM()) draw(); else kick();
  };
  el.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => shoot(+b.dataset.a); });
  el.querySelector('[data-i=n]').oninput = e => { n = +e.target.value; A = []; Bv = []; parts = []; last = null; draw(); };
  draw();
}

/* ================================================================== 13. maximum de vraisemblance */
function emvViz(el) {
  const MOD = {
    pois: { nom: 'Poisson (CM ex. 3)', par: 'λ', disc: 1, base: [3, 1, 1, 1, 6, 4, 2, 3, 1, 5, 5, 2, 7, 4, 3], logf: (x, l) => x * Math.log(l) - l - lfact(x), hat: d => mean(d),
      d1: (d, l) => sum(d) / l - d.length, d2: (d, l) => -sum(d) / l ** 2, rg: () => [0.8, 7], sim: (r, n) => Array.from({ length: n }, () => sPois(r, 3.2)), htxt: 'λ̂ = x̄' },
    expo: { nom: 'Exponentielle (TD ex. 2)', par: 'λ', base: [1.11, 1.66, 3.21, 2.02], logf: (x, l) => Math.log(l) - l * x, hat: d => 1 / mean(d), pdf: (x, l) => (x < 0 ? 0 : l * Math.exp(-l * x)),
      d1: (d, l) => d.length / l - sum(d), d2: (d, l) => -d.length / l ** 2, rg: () => [0.08, 1.6], xr: d => [0, Math.max(6, Math.max(...d) * 1.15)], sim: (r, n) => Array.from({ length: n }, () => +sExp(r, 0.5).toFixed(2)), htxt: 'λ̂ = 1/x̄' },
    norm: { nom: 'Normale N(a, 1) (CM ex. 2)', par: 'a', base: [2.31, 0.84, 1.92, 3.05, 1.47, 2.66, 0.38, 1.73, 2.94, 1.2], logf: (x, a) => -0.5 * Math.log(2 * Math.PI) - 0.5 * (x - a) ** 2, hat: d => mean(d), pdf: (x, a) => npdf(x, a, 1),
      d1: (d, a) => sum(d.map(x => x - a)), d2: d => -d.length, rg: d => [mean(d) - 2.5, mean(d) + 2.5], xr: d => [Math.min(...d) - 2.2, Math.max(...d) + 2.2], sim: (r, n) => Array.from({ length: n }, () => +(1.8 + gauss(r)).toFixed(2)), htxt: 'â = x̄' },
  };
  let cur = 'pois', data = MOD.pois.base.slice(), th = 5.5, trail = [], stop = () => {};
  const r = rng(404);
  el.innerHTML = head('Maximum de vraisemblance', 'Déplace θ : la vraisemblance est le produit des hauteurs orange (une par observation). Le meilleur θ est celui qui rend ce produit maximal.') +
    chips('m', Object.entries(MOD).map(([k, v]) => [k, v.nom]), cur) +
    `<div class="viz-ctrl"><span data-s="sl"></span><span class="viz-btns">${btn('climb', '▲ Grimper au maximum')}${btn('new', 'Nouvel échantillon')}${btn('base', 'Données du cours')}</span></div>
     <div class="vp-two"><div data-s="mod"></div><div data-s="lik"></div></div><div class="vp-kpis" data-o="kp"></div><p class="viz-out" data-o="out"></p>`;
  const L = d => sum(d.map(x => MOD[cur].logf(x, th)));
  const Lof = (d, t) => sum(d.map(x => MOD[cur].logf(x, t)));
  const setSl = () => {
    const [a, b] = MOD[cur].rg(data);
    el.querySelector('[data-s=sl]').innerHTML = rangeI('th', MOD[cur].par, a.toFixed(3), b.toFixed(3), ((b - a) / 400).toFixed(4), th);
    el.querySelector('[data-i=th]').oninput = e => { stop(); trail = []; th = +e.target.value; draw(); };
  };
  const setMod = k => {
    stop(); cur = k; data = MOD[k].base.slice(); trail = [];
    const [a, b] = MOD[k].rg(data), h = MOD[k].hat(data); th = clamp(h + (b - a) * 0.3, a, b);
    setSl(); press(el, 'm', k); draw();
  };
  const draw = () => {
    const M = MOD[cur], [a, b] = M.rg(data), hat = M.hat(data), n = data.length;
    // panneau 1 : modèle et données
    const W = 340, H = 236, Lm = 40, Rm = W - 10, T = 20, B = 168;
    let g = '';
    if (M.disc) {
      const km = Math.max(12, Math.max(...data) + 1), pm = Array.from({ length: km + 1 }, (_, k) => Math.exp(M.logf(k, th))), ym = Math.max(0.3, ...pm) * 1.1;
      const fr = frame({ L: Lm, R: Rm, T, B, xlo: -0.5, xhi: km + 0.5, yhi: ym, xt: [], yl: `P(X = k), ${M.par} = ${num(th, 2)}` }), { X, Y } = fr; g += fr.g;
      const cnt = {}; data.forEach(x => { cnt[x] = (cnt[x] || 0) + 1; });
      const bw = (Rm - Lm) / (km + 1);
      pm.forEach((p, k) => {
        const on = cnt[k];
        g += `<rect x="${X(k) - bw * 0.36}" y="${Y(p)}" width="${bw * 0.72}" height="${B - Y(p)}" fill="${on ? 'var(--c4)' : 'var(--accent)'}" fill-opacity="${on ? 0.75 : 0.18}" stroke="${on ? 'var(--c4)' : 'var(--accent)'}"/>`;
        g += `<text x="${X(k)}" y="${B + 14}" class="vz-t vz-s" text-anchor="middle">${k}</text>`;
        if (on) { g += `<text x="${X(k)}" y="${Y(p) - 4}" class="vz-t vz-s vp-tb" text-anchor="middle" fill="var(--c4)">×${on}</text>`; for (let j = 0; j < on; j++) g += `<circle cx="${X(k)}" cy="${B + 24 + j * 9}" r="3.6" fill="var(--ink)"/>`; }
      });
      g += `<text x="${Rm}" y="${H - 4}" class="vz-t vz-s vp-tm" text-anchor="end">points : les ${n} observations</text>`;
    } else {
      const [x0, x1] = M.xr(data), xs = Array.from({ length: 201 }, (_, i) => x0 + (x1 - x0) * i / 200), fs = xs.map(x => M.pdf(x, th));
      const ym = Math.max(cur === 'expo' ? 0.6 : 0.45, ...fs) * 1.08;
      const fr = frame({ L: Lm, R: Rm, T, B, xlo: x0, xhi: x1, yhi: ym, yl: `densité, ${M.par} = ${num(th, 2)}` }), { X, Y } = fr; g += fr.g;
      g += `<path d="${path(xs.map((x, i) => [X(x), Y(fs[i])]))}" class="vp-curve"/>`;
      data.forEach(x => { const f = M.pdf(x, th); g += `<line x1="${X(x)}" x2="${X(x)}" y1="${B}" y2="${Y(f)}" stroke="var(--c4)" stroke-width="3" stroke-linecap="round"/><circle cx="${X(x)}" cy="${Y(f)}" r="3.5" fill="var(--c4)"/><circle cx="${X(x)}" cy="${B + 26}" r="3.6" fill="var(--ink)"/><line x1="${X(x)}" x2="${X(x)}" y1="${B + 4}" y2="${B + 22}" stroke="var(--line-strong)" stroke-dasharray="2 2"/>`; });
      g += `<text x="${Rm}" y="${H - 4}" class="vz-t vz-s vp-tm" text-anchor="end">points : les ${n} observations</text>`;
    }
    el.querySelector('[data-s=mod]').innerHTML = `<p class="vp-sub">Le modèle et les données</p>` + svg(W, H, g, 'Loi du modèle et observations');
    // panneau 2 : log-vraisemblance
    const ts = Array.from({ length: 201 }, (_, i) => a + (b - a) * i / 200), Ls = ts.map(t => Lof(data, t)), Lmax = Lof(data, hat), Lmin = Math.min(...Ls);
    const yl = Math.max(Lmin, Lmax - Math.max(12, (Lmax - Lmin) * 0.9)), span = Lmax - yl;
    const fr2 = frame({ L: 46, R: Rm, T, B, xlo: a, xhi: b, ylo: yl - span * 0.05, yhi: Lmax + span * 0.12, yl: 'L(θ) = ln ℓ(θ)', xl: M.par, yf: v => num(v, 0) });
    const { X, Y } = fr2;
    let q = '';
    // ℓ relative en fond
    q += `<path d="M${X(a)},${B}${ts.map((t, i) => `L${X(t).toFixed(1)},${(B - Math.exp(Ls[i] - Lmax) * (B - T - 10)).toFixed(1)}`).join('')}L${X(b)},${B}Z" fill="var(--accent)" fill-opacity=".1"/>`;
    q += fr2.g;
    q += `<path d="${path(ts.map((t, i) => [X(t), Y(Math.max(Ls[i], yl - span * 0.05))]))}" class="vp-curve"/>`;
    q += `<line x1="${X(hat)}" x2="${X(hat)}" y1="${T}" y2="${B}" class="vp-mu"/><text x="${X(hat) + 4}" y="${B - 6}" class="vz-t vz-s vp-tg vp-tb vp-halo">${M.htxt} = ${num(hat, 3)}</text>`;
    trail.forEach((t, i) => { q += `<circle cx="${X(t)}" cy="${Y(Lof(data, t))}" r="3" fill="var(--c2)" opacity="${0.3 + 0.7 * (i + 1) / trail.length}"/>`; });
    const Lc = L(data), d1 = M.d1(data, th), cy = Y(Lc), cx = X(th);
    if (cy > T - 6 && cy < B + 6) {
      const h = (b - a) * 0.01, dx = X(th + h) - cx, dy = Y(Lc + d1 * h) - cy, nn = Math.hypot(dx, dy) || 1, ln = 30;
      q += `<line x1="${cx - dx / nn * ln}" y1="${cy - dy / nn * ln}" x2="${cx + dx / nn * ln}" y2="${cy + dy / nn * ln}" stroke="var(--c2)" stroke-width="2"/>`;
      q += `<circle cx="${cx}" cy="${cy}" r="6" fill="var(--c2)" stroke="var(--paper)" stroke-width="2"/>`;
    }
    q += `<text x="${Rm}" y="${T + 10}" class="vz-t vz-s vp-tm" text-anchor="end">fond : ℓ(θ) (échelle relative)</text>`;
    el.querySelector('[data-s=lik]').innerHTML = `<p class="vp-sub">Log-vraisemblance en fonction de ${M.par}</p>` + svg(W, B + 28, q, 'Courbe de log-vraisemblance');
    el.querySelector('[data-o=th]').textContent = num(th, 3);
    el.querySelector('[data-i=th]').value = th;
    const at = Math.abs(th - hat) < (b - a) / 150;
    el.querySelector('[data-o=kp]').innerHTML = `<div>ℓ(${M.par}) = produit des ${n} facteurs<b>${sci10(Lc / Math.LN10)}</b></div><div>L(${M.par}) = ln ℓ<b>${num(Lc, 3)}</b></div><div>pente L'(${M.par})<b>${num(Math.abs(d1) < 5e-3 ? 0 : d1, 3)}</b></div><div class="hi">maximum : ${M.htxt}<b>${num(hat, 4)}</b>${at ? '<span class="vp-badge yes">atteint !</span>' : ''}</div>`;
    el.querySelector('[data-o=out]').innerHTML = `Données : ${data.map(x => num(x, 2)).join(' ; ')}. ${M.disc ? 'Facteurs : P(X = xᵢ) pour chaque observation (barres orange, avec leur multiplicité).' : 'Facteurs : f(xᵢ ; θ) = hauteur de la tige orange au-dessus de chaque observation.'} <b>Observe :</b> loin de ${M.par}̂, certains facteurs deviennent minuscules et le produit s'effondre ; au maximum la pente de L (segment rouge) est nulle : c'est l'équation L'(${M.par}) = 0 du cours, et ℓ et ln ℓ ont le même argmax.`;
  };
  const climb = () => {
    stop(); const M = MOD[cur], [a, b] = M.rg(data), hat = M.hat(data);
    if (Math.abs(th - hat) < (b - a) / 150) { th = clamp(hat + (b - a) * (hat - a > (b - a) / 2 ? -0.4 : 0.4), a, b); }
    trail = [th];
    const steps = [];
    let t = th;
    for (let i = 0; i < 14; i++) { const st = clamp(-0.7 * M.d1(data, t) / M.d2(data, t), -(b - a) * 0.22, (b - a) * 0.22), nt = clamp(t + st, a, b); steps.push(nt); if (Math.abs(nt - t) < 1e-4) break; t = nt; }
    let i = 0;
    const next = () => {
      if (i >= steps.length || !el.isConnected) return;
      const from = th, to = steps[i++];
      stop = tween(el, 380, u => { th = from + (to - from) * u; draw(); }, () => { trail.push(th); if (RM()) { th = steps[steps.length - 1]; draw(); return; } next(); });
    };
    next();
  };
  el.querySelector('[data-a=climb]').onclick = climb;
  el.querySelector('[data-a=new]').onclick = () => { stop(); data = MOD[cur].sim(r, MOD[cur].base.length); trail = []; const [a, b] = MOD[cur].rg(data); th = clamp(th, a, b); setSl(); draw(); };
  el.querySelector('[data-a=base]').onclick = () => setMod(cur);
  el.querySelectorAll('[data-m]').forEach(bt => { bt.onclick = () => setMod(bt.dataset.m); });
  setMod(cur);
}

/* ================================================================== export */
export const VIZ = {
  loisDiscretes: el => loisViz(el, ['bern', 'binom', 'geom', 'pois'], 'Explorateur de lois discrètes'),
  loisContinues: el => loisViz(el, ['unif', 'norm', 'expo', 'gamma'], 'Explorateur de lois continues'),
  repartition: repartViz,
  memoire: memoireViz,
  sommes: sommesViz,
  bayes: bayesViz,
  independance: indepViz,
  covariance: covViz,
  nonCorrelees: xpyViz,
  gauss2d: gauss2dViz,
  transfoGauss: transfoViz,
  cibleEstim: cibleViz,
  varianceEmp: varEmpViz,
  emv: emvViz,
};
