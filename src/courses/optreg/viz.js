// Illustrations interactives du cours « Régularisation et optimisation » (SVG, couleurs du thème du site).
// Tous les calculs sont faits dans le navigateur, sur de petites fonctions ou de petits jeux de données simulés (générateur à graine).
import './viz.css';

/* ------------------------------------------------------------------ outils communs */
const fmt = (x, d = 2) => (Number.isFinite(x) ? Number(x).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−') : '∞');
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
/** Écriture scientifique lisible : 1,2·10⁻⁴. */
const sci = x => { if (!Number.isFinite(x)) return '∞'; if (x === 0) return '0'; const e = Math.floor(Math.log10(Math.abs(x))); if (e >= -2 && e <= 3) return fmt(x, e >= 2 ? 0 : 3 - Math.max(0, e)); const m = x / 10 ** e; return `${fmt(m, 1)}·10${String(e).split('').map(c => SUP[c]).join('')}`; };
const head = (t, hint) => `<figcaption><b>${t}</b>${hint ? `<span>${hint}</span>` : ''}</figcaption>`;
const svg = (w, h, body, label, cls = '') => `<svg viewBox="0 0 ${w} ${h}" class="vz-svg ${cls}" role="img" aria-label="${label}">${body}</svg>`;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const RM = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = t => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
let UID = 0;
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(r) { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
const $ = (el, s) => el.querySelector(s);
const tx = (x, y, s, a = 'start', cls = '') => `<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" class="vz-t ${cls}" text-anchor="${a}">${s}</text>`;
const line = (x1, y1, x2, y2, extra = '') => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" ${extra}/>`;
const cl = v => clamp(v, -2000, 4000);
const poly = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${cl(p[0]).toFixed(1)},${cl(p[1]).toFixed(1)}`).join('');
const arrowDefs = id => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="context-stroke"/></marker></defs>`;
const shat = (c, sub = '') => `${c}<tspan dx="-0.5em" dy="-0.5em" font-size="0.9em">ˆ</tspan><tspan dx="0.12em" dy="0.5em">${sub}</tspan>`;
const playLbl = on => (on ? '❚❚ Pause' : '▶ Lancer');
const COL = ['var(--c2)', 'var(--c1)', 'var(--c3)', 'var(--c6)', 'var(--c4)', 'var(--c5)'];

function tween(el, ms, step, done) {
  let id = 0, stop = false;
  if (RM()) { step(1); if (done) done(); return () => {}; }
  const t0 = performance.now();
  const f = now => { if (stop || !el.isConnected) return; const u = Math.min(1, (now - t0) / ms); step(ease(u)); if (u < 1) id = requestAnimationFrame(f); else if (done) done(); };
  id = requestAnimationFrame(f);
  return () => { stop = true; cancelAnimationFrame(id); };
}
/** Boucle d'animation à cadence fixe ; tick() renvoie false pour s'arrêter. Animation réduite : tout est calculé d'un coup. */
function looper(el, ms, tick, onState) {
  let on = false, id = 0, last = 0;
  const fr = now => { if (!on) return; if (!el.isConnected) { on = false; return; } if (now - last >= ms) { last = now; if (tick() === false) { stop(); return; } } id = requestAnimationFrame(fr); };
  const start = () => { if (on) return; if (RM()) { let g = 0; while (tick() !== false && g++ < 20000); if (onState) onState(false); return; } on = true; last = 0; id = requestAnimationFrame(fr); if (onState) onState(true); };
  const stop = () => { if (!on) return; on = false; cancelAnimationFrame(id); if (onState) onState(false); };
  return { start, stop, get on() { return on; } };
}
function svgPt(s, e) { const m = s.getScreenCTM(); if (!m) return { x: 0, y: 0 }; const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); return { x: p.x, y: p.y }; }
function drag(s, pick, move, end) {
  s.addEventListener('pointerdown', e => {
    const h = pick(svgPt(s, e)); if (h == null) return;
    e.preventDefault(); const id = e.pointerId; try { s.setPointerCapture(id); } catch (_) { /* rien */ }
    const mv = ev => { if (ev.pointerId === id) move(h, svgPt(s, ev)); };
    const up = ev => { if (ev.pointerId !== id) return; s.removeEventListener('pointermove', mv); s.removeEventListener('pointerup', up); s.removeEventListener('pointercancel', up); if (end) end(h); };
    s.addEventListener('pointermove', mv); s.addEventListener('pointerup', up); s.addEventListener('pointercancel', up);
  });
}
function solve(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c] || 1e-14;
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / d; if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((r, i) => r[n] / (M[i][i] || 1e-14));
}
const inv2 = (M, g) => { const d = M[0][0] * M[1][1] - M[0][1] * M[1][0]; return [(M[1][1] * g[0] - M[0][1] * g[1]) / d, (-M[1][0] * g[0] + M[0][0] * g[1]) / d]; };

/* ------------------------------------------------------------------ courbes de niveau (marching squares) */
function contourSegs(f, xr, yr, levels, N = 70) {
  const ny = Math.max(20, Math.round(N * (yr[1] - yr[0]) / (xr[1] - xr[0]))), dx = (xr[1] - xr[0]) / N, dy = (yr[1] - yr[0]) / ny;
  const V = []; for (let j = 0; j <= ny; j++) { const row = []; for (let i = 0; i <= N; i++) row.push(f([xr[0] + i * dx, yr[0] + j * dy])); V.push(row); }
  return levels.map(lv => {
    const segs = [];
    for (let j = 0; j < ny; j++) for (let i = 0; i < N; i++) {
      const c = [[i, j, V[j][i]], [i + 1, j, V[j][i + 1]], [i + 1, j + 1, V[j + 1][i + 1]], [i, j + 1, V[j + 1][i]]], P = [];
      for (let e = 0; e < 4; e++) {
        const [x1, y1, v1] = c[e], [x2, y2, v2] = c[(e + 1) % 4];
        if ((v1 < lv) !== (v2 < lv)) { const t = (lv - v1) / (v2 - v1); P.push([xr[0] + (x1 + t * (x2 - x1)) * dx, yr[0] + (y1 + t * (y2 - y1)) * dy]); }
      }
      if (P.length >= 2) segs.push([P[0], P[1]]); if (P.length === 4) segs.push([P[2], P[3]]);
    }
    return segs;
  });
}
/** Repère cartésien à échelles égales sur [xr]×[yr], largeur W. */
function frame(xr, yr, W = 360, pad = 6) {
  const k = (W - 2 * pad) / (xr[1] - xr[0]), H = Math.round((yr[1] - yr[0]) * k + 2 * pad);
  return { W, H, k, X: x => pad + (x - xr[0]) * k, Y: y => H - pad - (y - yr[0]) * k, inv: (sx, sy) => [xr[0] + (sx - pad) / k, yr[0] + (H - pad - sy) / k] };
}
function levelSet(F) {
  if (F.levels) return F.levels;
  const vals = []; for (let i = 0; i <= 20; i++) for (let j = 0; j <= 20; j++) vals.push(F.f([F.xr[0] + (F.xr[1] - F.xr[0]) * i / 20, F.yr[0] + (F.yr[1] - F.yr[0]) * j / 20]) - F.fmin);
  vals.sort((a, b) => a - b); const top = vals[Math.floor(vals.length * 0.85)];
  F.levels = Array.from({ length: 12 }, (_, k) => F.fmin + top * 0.55 ** k);
  return F.levels;
}
function contourSVG(F, fr) {
  if (!F.cache) F.cache = {};
  if (F.cache[fr.W]) return F.cache[fr.W];
  const lv = levelSet(F), segs = contourSegs(F.f, F.xr, F.yr, lv);
  const out = segs.map((ss, i) => `<path d="${ss.map(([a, b]) => `M${fr.X(a[0]).toFixed(1)},${fr.Y(a[1]).toFixed(1)}L${fr.X(b[0]).toFixed(1)},${fr.Y(b[1]).toFixed(1)}`).join('')}" class="or-lv" style="opacity:${(0.35 + 0.65 * (1 - i / lv.length)).toFixed(2)}"/>`).join('');
  F.cache[fr.W] = out + (F.min ? `<path d="M${fr.X(F.min[0]) - 6},${fr.Y(F.min[1])}h12M${fr.X(F.min[0])},${fr.Y(F.min[1]) - 6}v12" class="or-star"/>` : '');
  return F.cache[fr.W];
}

/* ------------------------------------------------------------------ fonctions tests */
const QUAD = (a, b, ang = 0) => {
  const c = Math.cos(ang), s = Math.sin(ang), Q = [[a * c * c + b * s * s, (a - b) * c * s], [(a - b) * c * s, a * s * s + b * c * c]];
  return { Q, f: x => 0.5 * (Q[0][0] * x[0] * x[0] + 2 * Q[0][1] * x[0] * x[1] + Q[1][1] * x[1] * x[1]), g: x => [Q[0][0] * x[0] + Q[0][1] * x[1], Q[0][1] * x[0] + Q[1][1] * x[1]], H: () => Q, min: [0, 0], fmin: 0, L: Math.max(a, b), mu: Math.min(a, b) };
};
const ROSEN = b => ({ f: x => (1 - x[0]) ** 2 + b * (x[1] - x[0] * x[0]) ** 2, g: x => [-2 * (1 - x[0]) - 4 * b * x[0] * (x[1] - x[0] * x[0]), 2 * b * (x[1] - x[0] * x[0])], H: x => [[2 - 4 * b * (x[1] - 3 * x[0] * x[0]), -4 * b * x[0]], [-4 * b * x[0], 2 * b]], min: [1, 1], fmin: 0 });

/* ------------------------------------------------------------------ moteur commun : trajectoires sur les courbes de niveau */
const M_GD = { id: 'gd', lab: 'Gradient', init: () => ({}), step: (S, F, P) => { const g = F.g(S.x); S.x = [S.x[0] - P.alpha * g[0], S.x[1] - P.alpha * g[1]]; } };
const M_MOM = { id: 'mom', lab: 'Momentum', init: () => ({ v: [0, 0] }), step: (S, F, P) => { const g = F.g(S.x); S.v = [P.beta * S.v[0] + g[0], P.beta * S.v[1] + g[1]]; S.x = [S.x[0] - P.alpha * S.v[0], S.x[1] - P.alpha * S.v[1]]; } };
const M_NAG = { id: 'nag', lab: 'Nesterov', init: x => ({ prev: x.slice() }), step: (S, F, P) => { const t = [S.x[0] + P.beta * (S.x[0] - S.prev[0]), S.x[1] + P.beta * (S.x[1] - S.prev[1])], g = F.g(t); S.prev = S.x; S.x = [t[0] - P.alpha * g[0], t[1] - P.alpha * g[1]]; } };
const M_NEWTON = { id: 'newton', lab: 'Newton', init: () => ({}), step: (S, F) => { const d = inv2(F.H(S.x), F.g(S.x)); S.x = [S.x[0] - d[0], S.x[1] - d[1]]; } };
const M_CD = { id: 'cd', lab: 'Coordonnées', init: () => ({ j: 0 }), step: (S, F) => { S.x = F.cmin(S.x, S.j); S.j = 1 - S.j; } };
const M_SGD = { id: 'sgd', lab: 'SGD', init: () => ({ r: rng(77) }), step: (S, F, P) => { const i = Math.floor(S.r() * F.n), g = F.gi(S.x, i), a = P.alpha / (1 + S.k / 40); S.x = [S.x[0] - a * g[0], S.x[1] - a * g[1]]; } };

function trajWidget(el, cfg) {
  const uid = 'or' + (++UID);
  let fk = cfg.funcKeys[0], F = null, fr = null, x0 = null, states = [], it = 0;
  const P = {}; cfg.params.forEach(p => { P[p.id] = p.val; });
  const chips = cfg.funcKeys.length > 1 ? `<span class="vz-seg" role="group" aria-label="fonction">${cfg.funcKeys.map(k => `<button type="button" class="chip" data-f="${k}">${cfg.funcs[k].lab}</button>`).join('')}</span>` : '';
  el.innerHTML = head(cfg.title, cfg.hint) +
    `<div class="viz-ctrl">${chips}<span class="viz-btns"><button type="button" class="btn small primary" data-i="play">${playLbl(false)}</button><button type="button" class="btn small" data-i="step">Un pas</button><button type="button" class="btn small" data-i="reset">Recommencer</button></span></div>
     <div class="viz-ctrl">${cfg.params.map(p => `<label>${p.lab} = <b data-o="${p.id}"></b><input type="range" data-p="${p.id}" aria-label="${p.lab}"></label>`).join('')}</div>
     <div class="grid2 or-g2"><div class="or-cell">${svg(360, 300, `${arrowDefs(uid + 'a')}<defs><clipPath id="${uid}c"><rect data-o="clip" x="0" y="0" width="360" height="300"/></clipPath></defs><g data-l="lv"></g><g clip-path="url(#${uid}c)"><g data-l="tr"></g></g>`, 'Courbes de niveau et trajectoires', 'or-tap')}</div>
     <div class="or-cell">${svg(360, 200, '<g data-l="err"></g>', 'Écart à l\'optimum au fil des itérations')}<div class="viz-leg or-leg" data-o="leg"></div></div></div>
     <p class="viz-out" data-o="out"></p>`;
  const s = $(el, 'svg'), playB = $(el, '[data-i=play]');
  const setRanges = () => cfg.params.forEach(p => {
    const r = (F && F.ranges && F.ranges[p.id]) || p, inp = $(el, `[data-p=${p.id}]`);
    inp.min = r.min; inp.max = r.max; inp.step = r.step; if (r.val != null && r !== p) P[p.id] = r.val; P[p.id] = clamp(P[p.id], r.min, r.max); inp.value = P[p.id];
  });
  const load = keep => {
    F = cfg.funcs[fk]; if (F.build) F = Object.assign(F, F.build(P));
    fr = frame(F.xr, F.yr, 360);
    s.setAttribute('viewBox', `0 0 ${fr.W} ${fr.H}`); $(el, '[data-o=clip]').setAttribute('height', fr.H);
    if (!keep) setRanges();
    if (!keep || !x0) x0 = F.x0.slice();
    $(el, '[data-l=lv]').innerHTML = `<rect x="0" y="0" width="${fr.W}" height="${fr.H}" class="or-bg"/>` + contourSVG(F, fr);
    reset();
  };
  const reset = () => { it = 0; states = cfg.methods.map(m => ({ m, x: x0.slice(), path: [x0.slice()], err: [Math.log10(Math.max(F.f(x0) - F.fmin, 1e-16))], k: 0, done: false, div: false, ...m.init(x0) })); draw(); };
  const tick = () => {
    let alive = false;
    const per = (F.per || cfg.per || 1);
    for (let r = 0; r < per; r++) {
      states.forEach(S => {
        if (S.done) return;
        S.m.step(S, F, P); S.k++;
        const v = F.f(S.x);
        if (!Number.isFinite(v) || Math.abs(S.x[0]) > 1e6 || Math.abs(S.x[1]) > 1e6) { S.done = true; S.div = true; return; }
        S.path.push(S.x.slice()); S.err.push(Math.log10(Math.max(v - F.fmin, 1e-16)));
        if (v - F.fmin < (cfg.tol || 1e-10) || S.k >= (F.maxIt || cfg.maxIt)) S.done = true;
      });
      it++;
      if (states.every(S => S.done)) break;
    }
    alive = states.some(S => !S.done);
    draw();
    return alive;
  };
  const loop = looper(el, cfg.ms || 60, tick, on => { playB.textContent = playLbl(on); });
  const draw = () => {
    cfg.params.forEach(p => { $(el, `[data-o=${p.id}]`).textContent = p.fmt ? p.fmt(P[p.id]) : fmt(P[p.id], 3); });
    el.querySelectorAll('[data-f]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === fk)));
    let g = '';
    states.forEach((S, i) => {
      const c = COL[cfg.methods.indexOf(S.m) % COL.length], pts = S.path.map(p => [fr.X(p[0]), fr.Y(p[1])]);
      if (S.m.id === 'cd') g += `<path d="${poly(pts)}" class="or-path or-path-cd" style="stroke:${c}"/>`;
      else g += `<path d="${poly(pts)}" class="or-path" style="stroke:${c}"/>`;
      const dots = pts.length > 80 ? pts.filter((_, j) => j % Math.ceil(pts.length / 80) === 0) : pts;
      g += dots.map(p => `<circle cx="${cl(p[0]).toFixed(1)}" cy="${cl(p[1]).toFixed(1)}" r="2.2" style="fill:${c}"/>`).join('');
      const last = pts[pts.length - 1];
      g += `<circle cx="${cl(last[0]).toFixed(1)}" cy="${cl(last[1]).toFixed(1)}" r="${5.5 - i * 0.6}" class="or-head" style="fill:${c}"/>`;
      if (cfg.showGrad && !S.done) { const gr = F.g(S.x), a = P.alpha; g += `<line x1="${fr.X(S.x[0]).toFixed(1)}" y1="${fr.Y(S.x[1]).toFixed(1)}" x2="${fr.X(S.x[0] - a * gr[0]).toFixed(1)}" y2="${fr.Y(S.x[1] - a * gr[1]).toFixed(1)}" class="or-gradarrow" marker-end="url(#${uid}a)"/>`; }
    });
    g += `<circle cx="${fr.X(x0[0]).toFixed(1)}" cy="${fr.Y(x0[1]).toFixed(1)}" r="5" class="or-start"/>`;
    $(el, '[data-l=tr]').innerHTML = g;
    // courbe d'erreur
    const EW = 360, EH = 200, L = 40, R = 352, T = 12, B = 176, kmax = Math.max(cfg.errK || 20, ...states.map(S => S.err.length - 1));
    const emax = Math.max(1, Math.ceil(Math.max(...states.map(S => S.err[0])))), emin = -10, Xe = k => L + k / kmax * (R - L), Ye = v => B - (clamp(v, emin, emax + 2) - emin) / (emax + 2 - emin) * (B - T);
    let e = `<path d="M${L},${T}V${B}H${R}" class="vz-axis"/>`;
    for (let v = emin; v <= emax + 2; v += 2) e += line(L, Ye(v), R, Ye(v), 'class="vz-grid"') + tx(L - 4, Ye(v) + 4, `10${String(v).split('').map(c => SUP[c]).join('')}`, 'end', 'vz-s');
    e += tx(R, EH - 4, `itérations (0 à ${kmax})`, 'end', 'vz-s') + tx(L + 4, T + 2, 'f(xₖ) − f*', 'start', 'vz-s');
    states.forEach(S => { e += `<path d="${poly(S.err.map((v, k) => [Xe(k), Ye(v)]))}" class="or-ecurve" style="stroke:${COL[cfg.methods.indexOf(S.m) % COL.length]}"/>`; });
    $(el, '[data-l=err]').innerHTML = e;
    $(el, '[data-o=leg]').innerHTML = states.map(S => `<span><i class="sw sw-l" style="--sw:${COL[cfg.methods.indexOf(S.m) % COL.length]}"></i>${S.m.lab} : ${S.div ? '<b class="or-bad">diverge</b>' : `k = ${S.k}, f − f* = ${sci(F.f(S.x) - F.fmin)}`}</span>`).join('');
    $(el, '[data-o=out]').innerHTML = cfg.info(F, P, states);
  };
  cfg.params.forEach(p => { $(el, `[data-p=${p.id}]`).oninput = e => { P[p.id] = +e.target.value; loop.stop(); if (p.rebuild) load(true); else reset(); }; });
  el.querySelectorAll('[data-f]').forEach(b => { b.onclick = () => { loop.stop(); fk = b.dataset.f; load(false); }; });
  playB.onclick = () => { if (loop.on) { loop.stop(); return; } if (states.every(S => S.done)) reset(); loop.start(); };
  $(el, '[data-i=step]').onclick = () => { loop.stop(); if (states.every(S => S.done)) reset(); tick(); };
  $(el, '[data-i=reset]').onclick = () => { loop.stop(); reset(); };
  s.addEventListener('click', e => { const p = svgPt(s, e), q = fr.inv(p.x, p.y); loop.stop(); x0 = [clamp(q[0], F.xr[0], F.xr[1]), clamp(q[1], F.yr[0], F.yr[1])]; reset(); });
  load(false);
}

/* ================================================================== 1. descente de gradient : le choix du pas */
function gdViz(el) {
  const q = Object.assign(QUAD(1, 10), { lab: 'Quadratique f = ½(x² + 10y²)', xr: [-5, 5], yr: [-3.2, 3.2], x0: [-4.5, 2.4], ranges: { alpha: { min: 0.01, max: 0.23, step: 0.005, val: 0.08 } }, maxIt: 150 });
  const r = Object.assign(ROSEN(5), { lab: 'Rosenbrock (vallée courbe)', xr: [-2.2, 2.2], yr: [-1.2, 3.2], x0: [-1.6, 2.6], ranges: { alpha: { min: 0.001, max: 0.04, step: 0.001, val: 0.015 } }, maxIt: 3000, per: 8 });
  trajWidget(el, {
    title: 'Descente de gradient : le pas α décide de tout', hint: 'Règle α puis lance. Touche le graphe pour changer le point de départ. La flèche est le prochain pas −α∇f(x).',
    funcs: { q, r }, funcKeys: ['q', 'r'], methods: [M_GD], params: [{ id: 'alpha', lab: 'pas α', min: 0.01, max: 0.23, step: 0.005, val: 0.08 }], maxIt: 150, errK: 40, ms: 70, showGrad: true,
    info: (F, P, S) => {
      const st = S[0];
      if (F === q) {
        const aL = P.alpha * F.L;
        const reg = aL < 1 ? `α·L = ${fmt(aL)} &lt; 1 : chaque pas réduit l'erreur dans toutes les directions, sans oscillation, mais lentement le long de x (facteur 1 − α·μ = ${fmt(1 - P.alpha * F.mu)} par pas).`
          : aL < 2 ? `1 &lt; α·L = ${fmt(aL)} &lt; 2 : le pas est trop long dans la direction raide y, on la <b>dépasse</b> à chaque pas : zigzag, mais cela converge (facteur ${fmt(Math.abs(1 - aL))} en y).`
            : `α·L = ${fmt(aL)} ≥ 2 : la composante y est multipliée par |1 − α·L| = ${fmt(Math.abs(1 - aL))} ≥ 1 à chaque pas : <b class="or-bad">divergence</b>.`;
        return `Sur une quadratique, L = 10 (plus grande courbure) et μ = 1 (plus petite). ${reg} Le meilleur pas constant est α = 2/(L + μ) ≈ 0,18 ; le théorème 3.4 utilise α = 1/L = 0,1.${st.div ? '' : st.done && st.k < (F.maxIt) ? ` Convergé en ${st.k} itérations.` : ''}`;
      }
      return `La vallée de Rosenbrock est étroite et courbe : la courbure varie fortement d'un point à l'autre, donc un pas qui convient au fond de la vallée est trop grand sur les flancs. Avec un petit α, la descente atteint vite la vallée puis <b>rampe</b> le long de son fond (des milliers d'itérations). ${st.div ? 'Ici le pas est trop grand : <b class="or-bad">divergence</b>.' : ''}`;
    },
  });
}

/* ================================================================== 2. momentum et Nesterov */
function momViz(el) {
  const q = Object.assign(QUAD(1, 25, 0.35), { lab: 'Vallée étroite (κ = 25)', xr: [-5, 5], yr: [-3.2, 3.2], x0: [-4.4, -0.2], ranges: { alpha: { min: 0.005, max: 0.08, step: 0.001, val: 0.035 }, beta: { min: 0, max: 0.98, step: 0.01, val: 0.8 } }, maxIt: 300 });
  const r = Object.assign(ROSEN(5), { lab: 'Rosenbrock', xr: [-2.2, 2.2], yr: [-1.2, 3.2], x0: [-1.6, 2.6], ranges: { alpha: { min: 0.001, max: 0.03, step: 0.001, val: 0.006 }, beta: { min: 0, max: 0.98, step: 0.01, val: 0.9 } }, maxIt: 2500, per: 6 });
  trajWidget(el, {
    title: 'Gradient, momentum et Nesterov au coude à coude', hint: 'Les trois méthodes partent du même point avec le même pas α. Règle le coefficient de momentum β et compare les trajectoires et les courbes d\'erreur.',
    funcs: { q, r }, funcKeys: ['q', 'r'], methods: [M_GD, M_MOM, M_NAG], params: [{ id: 'alpha', lab: 'pas α', min: 0.005, max: 0.08, step: 0.001, val: 0.035 }, { id: 'beta', lab: 'momentum β', min: 0, max: 0.98, step: 0.01, val: 0.8, fmt: v => fmt(v, 2) }], maxIt: 300, errK: 60, ms: 50,
    info: (F, P, S) => {
      const k = S.map(s => (s.div ? '∞' : s.done && F.f(s.x) - F.fmin < 1e-10 ? s.k : '>' + s.k));
      return `Nombre d'itérations pour atteindre f − f* &lt; 10⁻¹⁰ : gradient ${k[0]}, momentum ${k[1]}, Nesterov ${k[2]}. La vitesse v accumule les gradients passés (moyenne exponentielle de poids βⁱ) : elle <b>accélère</b> le long de la vallée, où le gradient garde la même direction, et <b>amortit</b> le zigzag en travers, où il change de signe. ` +
        (P.beta > 0.93 ? 'Avec β proche de 1, l\'inertie est trop forte : la bille dépasse et tourne autour du minimum. ' : P.beta < 0.2 ? 'Avec β ≈ 0, on retrouve la descente de gradient. ' : '') + 'Nesterov évalue le gradient au point anticipé x̃ = x + β(x − x_prec) : il freine plus tôt et oscille moins.';
    },
  });
}

/* ================================================================== 3. descente par coordonnées */
function cdViz(el) {
  const F = {
    lab: 'quadratique corrélée', xr: [-3.2, 3.2], yr: [-2.6, 2.6], x0: [-2.6, 2.1], maxIt: 200,
    build: P => { const c = P.c, Q = [[1, c], [c, 1]], L = 1 + c; return { Q, f: x => 0.5 * (x[0] * x[0] + 2 * c * x[0] * x[1] + x[1] * x[1]), g: x => [x[0] + c * x[1], c * x[0] + x[1]], cmin: (x, j) => (j === 0 ? [-c * x[1], x[1]] : [x[0], -c * x[0]]), min: [0, 0], fmin: 0, L, levels: null, cache: null, alphaGD: 1 / L }; },
  };
  const GD1L = { id: 'gd', lab: 'Gradient (α = 1/L)', init: () => ({}), step: (S, Fn) => { const g = Fn.g(S.x), a = Fn.alphaGD; S.x = [S.x[0] - a * g[0], S.x[1] - a * g[1]]; } };
  trajWidget(el, {
    title: 'Descente par coordonnées : l\'escalier', hint: 'Chaque pas de CD minimise exactement f le long d\'un seul axe (alternativement x puis y). Augmente la corrélation c entre les variables et observe l\'escalier s\'allonger.',
    funcs: { F }, funcKeys: ['F'], methods: [GD1L, M_CD], params: [{ id: 'c', lab: 'corrélation c', min: 0, max: 0.95, step: 0.01, val: 0.7, rebuild: true, fmt: v => fmt(v, 2) }], maxIt: 200, errK: 30, ms: 220,
    info: (Fn, P, S) => `f(x, y) = ½(x² + 2c·xy + y²). Chaque itération de CD ne touche qu'une coordonnée et se déplace <b>parallèlement à un axe</b>, jamais en diagonale. ` +
      (P.c < 0.05 ? 'Avec c = 0, la fonction est séparable : deux pas de CD suffisent pour atteindre le minimum exact !' : `Avec c = ${fmt(P.c, 2)}, les courbes de niveau sont des ellipses inclinées : CD avance en zigzag, d'autant plus lentement que c est proche de 1 (chaque balayage multiplie l'erreur par c² = ${fmt(P.c * P.c, 2)}). `) +
      ` Une itération de CD (une coordonnée) coûte environ d fois moins qu'un gradient complet : c'est ce qui la rend intéressante en grande dimension, notamment pour le Lasso (seuillage doux coordonnée par coordonnée).`,
  });
}

/* ================================================================== 4. la course : GD, SGD, CD, Newton sur une régression logistique */
const LOGI = (() => {
  const r = rng(41), n = 40, mu = 0.08, A = [], y = [];
  for (let i = 0; i < n; i++) { const g1 = gauss(r), g2 = gauss(r), a = [1.6 * g1, 1.2 * g1 + 0.45 * g2]; A.push(a); y.push(a[0] - a[1] + 0.5 * gauss(r) > 0 ? 1 : -1); }
  const sig = t => 1 / (1 + Math.exp(-t)), lse = t => (t > 30 ? t : Math.log1p(Math.exp(t)));
  const f = w => A.reduce((t, a, i) => t + lse(-y[i] * (a[0] * w[0] + a[1] * w[1])), 0) / n + mu / 2 * (w[0] ** 2 + w[1] ** 2);
  const gi = (w, i) => { const a = A[i], s = -y[i] * sig(-y[i] * (a[0] * w[0] + a[1] * w[1])); return [s * a[0] + mu * w[0], s * a[1] + mu * w[1]]; };
  const g = w => { const G = [0, 0]; for (let i = 0; i < n; i++) { const q = gi(w, i); G[0] += q[0] / n; G[1] += q[1] / n; } return G; };
  const H = w => { const M = [[mu, 0], [0, mu]]; A.forEach((a, i) => { const p = sig(y[i] * (a[0] * w[0] + a[1] * w[1])), s = p * (1 - p) / n; M[0][0] += s * a[0] * a[0]; M[0][1] += s * a[0] * a[1]; M[1][0] += s * a[0] * a[1]; M[1][1] += s * a[1] * a[1]; }); return M; };
  const cmin = (w, j) => { const x = w.slice(); for (let t = 0; t < 8; t++) { const G = g(x), M = H(x); x[j] -= G[j] / M[j][j]; } return x; };
  let w = [0, 0]; for (let k = 0; k < 40; k++) { const d = inv2(H(w), g(w)); w = [w[0] - d[0], w[1] - d[1]]; }
  return { f, g, gi, H, cmin, n, min: w, fmin: f(w) };
})();
function raceViz(el) {
  const F = Object.assign({}, LOGI, { lab: 'régression logistique', xr: [-2.6, 2.6], yr: [-2, 2], x0: [-2.1, 1.6], maxIt: 400 });
  trajWidget(el, {
    title: 'La course : gradient, SGD, coordonnées, Newton', hint: 'Même fonction pour tous : la perte logistique régularisée d\'un petit jeu de 40 exemples, en dimension 2. Lance la course, change α ou le point de départ.',
    funcs: { F }, funcKeys: ['F'], methods: [M_GD, M_SGD, M_CD, M_NEWTON], params: [{ id: 'alpha', lab: 'pas α (GD, SGD)', min: 0.1, max: 3, step: 0.05, val: 1.2 }], maxIt: 400, errK: 40, ms: 110, tol: 1e-12,
    info: (Fn, P, S) => {
      const k = S.map(s => (s.done && Fn.f(s.x) - Fn.fmin < 1e-12 ? s.k : null));
      return `Newton atteint la précision machine en ${k[3] != null ? k[3] : '…'} itérations (convergence quadratique : le nombre de bons chiffres double à chaque pas), le gradient en ${k[0] != null ? k[0] : 'plus de ' + S[0].k}, la descente par coordonnées en ${k[2] != null ? k[2] : 'plus de ' + S[2].k} demi-pas en escalier. SGD (pas décroissant α/(1 + k/40), un seul exemple par pas) avance vite au début puis <b>tremble</b> autour de l'optimum : son erreur stagne vers 10⁻³–10⁻⁵. Mais compare les <b>coûts</b> : un pas de SGD coûte 1 gradient d'exemple, un pas de GD en coûte n = 40, un pas de Newton demande en plus la Hessienne et la résolution d'un système (O(d³)).`;
    },
  });
}

/* ================================================================== 5. SGD et mini-lots */
function sgdViz(el) {
  const n = 40, r0 = rng(5), t = Array.from({ length: n }, () => 2 * r0()), yv = t.map(v => 1 + 2 * v + 0.8 * gauss(r0));
  const gi = (w, i) => { const e = w[0] + w[1] * t[i] - yv[i]; return [e, e * t[i]]; };
  const gB = (w, I) => { const G = [0, 0]; I.forEach(i => { const q = gi(w, i); G[0] += q[0] / I.length; G[1] += q[1] / I.length; }); return G; };
  const all = Array.from({ length: n }, (_, i) => i), fF = w => all.reduce((s, i) => s + (w[0] + w[1] * t[i] - yv[i]) ** 2, 0) / (2 * n);
  const mt = t.reduce((a, b) => a + b, 0) / n, mt2 = t.reduce((a, b) => a + b * b, 0) / n, my = yv.reduce((a, b) => a + b, 0) / n, mty = t.reduce((a, b, i) => a + b * yv[i], 0) / n;
  const w1 = (mty - mt * my) / (mt2 - mt * mt), wS = [my - w1 * mt, w1], fmin = fF(wS);
  const Fq = { f: fF, xr: [-1.5, 3.5], yr: [-0.5, 3.6], min: wS, fmin };
  const fr = frame(Fq.xr, Fq.yr, 360), uid = 'or' + (++UID);
  let alpha = 0.3, B = 4, decay = true, x0 = [-1.1, 0.0], gd, sg, rr, k = 0;
  el.innerHTML = head('Gradient stochastique : un pas bon marché mais bruité', 'GD (rouge) utilise les 40 exemples à chaque pas, SGD (bleu) un mini-lot de B exemples tirés au hasard. Le faisceau de flèches montre plusieurs gradients de mini-lot possibles au point courant.') +
    `<div class="viz-ctrl"><span class="viz-btns"><button type="button" class="btn small primary" data-i="play">${playLbl(false)}</button><button type="button" class="btn small" data-i="reset">Recommencer</button></span>
     <span class="vz-seg" role="group" aria-label="pas"><button type="button" class="chip" data-d="1">pas décroissant αₖ = α/(1 + k/20)</button><button type="button" class="chip" data-d="0">pas constant</button></span></div>
     <div class="viz-ctrl"><label>taille du mini-lot B = <b data-o="B"></b><input type="range" min="1" max="40" step="1" value="${B}" data-i="B" aria-label="taille du mini-lot"></label>
     <label>pas α = <b data-o="a"></b><input type="range" min="0.05" max="0.9" step="0.01" value="${alpha}" data-i="a" aria-label="pas"></label></div>
     <div class="grid2 or-g2"><div class="or-cell">${svg(fr.W, fr.H, `${arrowDefs(uid + 'a')}<rect width="${fr.W}" height="${fr.H}" class="or-bg"/>${contourSVG(Fq, fr)}<g data-l="tr"></g>`, 'Trajectoires de GD et de SGD dans le plan des paramètres', 'or-tap')}<p class="or-axn">plan des paramètres (w₀, w₁)</p></div>
     <div class="or-cell">${svg(360, 250, '<g data-l="d"></g>', 'Données et droites courantes')}<p class="or-axn">données et droites y = w₀ + w₁ t</p></div></div>
     <div class="metrics or-metrics"><div class="metric"><span>coût / pas : GD</span><b>${n} gradients</b></div><div class="metric"><span>coût / pas : SGD</span><b data-o="cost"></b></div><div class="metric"><span>variance du bruit</span><b data-o="var"></b></div><div class="metric"><span>f − f* (GD / SGD)</span><b data-o="err"></b></div></div>
     <p class="viz-out" data-o="out"></p>`;
  const s = $(el, 'svg'), playB = $(el, '[data-i=play]');
  // variance de l'estimateur : tr Cov(g_B) = (1/B)·(n − B)/(n − 1)·tr S, S covariance des gradients individuels
  const noiseVar = w => { const G = gB(w, all); let tr = 0; all.forEach(i => { const q = gi(w, i); tr += ((q[0] - G[0]) ** 2 + (q[1] - G[1]) ** 2) / n; }); return tr / B * (n - B) / (n - 1); };
  const reset = () => { gd = [x0.slice()]; sg = [x0.slice()]; rr = rng(91); k = 0; draw(); };
  const batch = r => { const idx = all.slice(); for (let i = 0; i < B; i++) { const j = i + Math.floor(r() * (n - i)); [idx[i], idx[j]] = [idx[j], idx[i]]; } return idx.slice(0, B); };
  const draw = () => {
    const a = decay ? alpha / (1 + k / 20) : alpha, w = sg[sg.length - 1], wg = gd[gd.length - 1];
    let g = '';
    const fan = rng(1000 + k), G = gB(w, all);
    for (let j = 0; j < 14; j++) { const q = gB(w, batch(fan)); g += `<line x1="${fr.X(w[0]).toFixed(1)}" y1="${fr.Y(w[1]).toFixed(1)}" x2="${cl(fr.X(w[0] - a * q[0])).toFixed(1)}" y2="${cl(fr.Y(w[1] - a * q[1])).toFixed(1)}" class="or-fan"/>`; }
    g += `<line x1="${fr.X(w[0]).toFixed(1)}" y1="${fr.Y(w[1]).toFixed(1)}" x2="${fr.X(w[0] - a * G[0]).toFixed(1)}" y2="${fr.Y(w[1] - a * G[1]).toFixed(1)}" class="or-gradarrow" marker-end="url(#${uid}a)"/>`;
    g += `<path d="${poly(gd.map(p => [fr.X(p[0]), fr.Y(p[1])]))}" class="or-path" style="stroke:${COL[0]}"/><path d="${poly(sg.map(p => [fr.X(p[0]), fr.Y(p[1])]))}" class="or-path" style="stroke:${COL[1]}"/>`;
    g += `<circle cx="${fr.X(wg[0]).toFixed(1)}" cy="${fr.Y(wg[1]).toFixed(1)}" r="5.5" class="or-head" style="fill:${COL[0]}"/><circle cx="${fr.X(w[0]).toFixed(1)}" cy="${fr.Y(w[1]).toFixed(1)}" r="5" class="or-head" style="fill:${COL[1]}"/>`;
    g += `<circle cx="${fr.X(x0[0]).toFixed(1)}" cy="${fr.Y(x0[1]).toFixed(1)}" r="5" class="or-start"/>`;
    $(el, '[data-l=tr]').innerHTML = g;
    const DW = 360, DH = 250, L = 30, R = 352, T = 10, Bt = 226, X = v => L + v / 2 * (R - L), Y = v => Bt - (v + 1) / 8 * (Bt - T);
    let d = `<path d="M${L},${T}V${Bt}H${R}" class="vz-axis"/>`;
    [0, 1, 2].forEach(v => { d += tx(X(v), Bt + 15, v, 'middle', 'vz-s'); }); [0, 2, 4, 6].forEach(v => { d += tx(L - 4, Y(v) + 4, v, 'end', 'vz-s') + line(L, Y(v), R, Y(v), 'class="vz-grid"'); });
    t.forEach((v, i) => { d += `<circle cx="${X(v).toFixed(1)}" cy="${Y(yv[i]).toFixed(1)}" r="3.2" class="or-dot"/>`; });
    const ln = (ww, c) => `<line x1="${X(0)}" y1="${cl(Y(ww[0])).toFixed(1)}" x2="${X(2)}" y2="${cl(Y(ww[0] + 2 * ww[1])).toFixed(1)}" style="stroke:${c}" class="or-fitl"/>`;
    d += `<defs><clipPath id="${uid}d"><rect x="${L}" y="${T}" width="${R - L}" height="${Bt - T}"/></clipPath></defs><g clip-path="url(#${uid}d)">${ln(wg, COL[0])}${ln(w, COL[1])}</g>`;
    $(el, '[data-l=d]').innerHTML = d;
    $(el, '[data-o=B]').textContent = B; $(el, '[data-o=a]').textContent = fmt(alpha);
    $(el, '[data-o=cost]').textContent = `${B} gradient${B > 1 ? 's' : ''}`; $(el, '[data-o=var]').textContent = sci(noiseVar(w));
    $(el, '[data-o=err]').textContent = `${sci(fF(wg) - fmin)} / ${sci(fF(w) - fmin)}`;
    el.querySelectorAll('[data-d]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.d === '1') === decay)));
    $(el, '[data-o=out]').innerHTML = `Itération ${k}. Le gradient de mini-lot est <b>sans biais</b> (en moyenne, les flèches fines pointent comme la flèche noire −α∇f), mais il est bruité : sa variance est divisée par environ B (exactement (1/B)·(n − B)/(n − 1)·tr S en tirant sans remise). ` +
      (B === n ? 'Avec B = n, SGD redevient la descente de gradient.' : B === 1 ? 'Avec B = 1 (SGD pur), chaque pas coûte 40 fois moins qu\'un pas de GD, mais la trajectoire est erratique.' : '') +
      (decay ? ' Le pas décroissant amortit le bruit : SGD finit par se stabiliser près de w*.' : ' Avec un pas constant, SGD ne converge pas : il <b>erre</b> indéfiniment dans une zone autour de w* dont la taille dépend de α et de B.');
  };
  const loop = looper(el, 90, () => {
    if (k >= 160) return false;
    const a = decay ? alpha / (1 + k / 20) : alpha, wg = gd[gd.length - 1], G = gB(wg, all); gd.push([wg[0] - alpha * G[0], wg[1] - alpha * G[1]]);
    const w = sg[sg.length - 1], q = gB(w, batch(rr)); sg.push([w[0] - a * q[0], w[1] - a * q[1]]); k++;
    draw(); return true;
  }, on => { playB.textContent = playLbl(on); });
  $(el, '[data-i=B]').oninput = e => { B = +e.target.value; loop.stop(); reset(); };
  $(el, '[data-i=a]').oninput = e => { alpha = +e.target.value; loop.stop(); reset(); };
  el.querySelectorAll('[data-d]').forEach(b => { b.onclick = () => { decay = b.dataset.d === '1'; loop.stop(); reset(); }; });
  playB.onclick = () => { if (loop.on) { loop.stop(); return; } if (k >= 160) reset(); loop.start(); };
  $(el, '[data-i=reset]').onclick = () => { loop.stop(); reset(); };
  s.addEventListener('click', e => { const p = svgPt(s, e), q = fr.inv(p.x, p.y); loop.stop(); x0 = [clamp(q[0], Fq.xr[0], Fq.xr[1]), clamp(q[1], Fq.yr[0], Fq.yr[1])]; reset(); });
  reset();
}

/* ================================================================== 6. Newton en dimension 1 : le modèle quadratique */
function newtonViz(el) {
  const FN = {
    exp: { lab: 'f(x) = eˣ − 2x', f: x => Math.exp(x) - 2 * x, d1: x => Math.exp(x) - 2, d2: x => Math.exp(x), xr: [-2.5, 2.5], yr: [-0.5, 6], x0: -1.8, xs: Math.log(2), txt: 'Fonction strictement convexe : depuis n\'importe quel point, Newton converge, et très vite près de x* = ln 2 : regarde la colonne d\'erreur, l\'exposant double à chaque pas (convergence quadratique).' },
    sq: { lab: 'f(x) = √(1 + x²)', f: x => Math.sqrt(1 + x * x), d1: x => x / Math.sqrt(1 + x * x), d2: x => (1 + x * x) ** -1.5, xr: [-4, 4], yr: [0.5, 4.6], x0: 0.9, xs: 0, txt: 'Convexe, mais la courbure s\'effondre loin de 0 : le pas de Newton vaut exactement x ↦ −x³. Depuis |x₀| &lt; 1 on converge (très vite) ; depuis |x₀| &gt; 1 les itérés <b>explosent</b>. Essaie x₀ = 0,9 puis x₀ = 1,1 : la convergence de Newton n\'est que <b>locale</b>, d\'où les versions amorties (avec recherche linéaire).' },
    nc: { lab: 'f non convexe', f: x => x ** 4 / 4 - x * x + 0.35 * x, d1: x => x ** 3 - 2 * x + 0.35, d2: x => 3 * x * x - 2, xr: [-2.4, 2.4], yr: [-1.6, 2.2], x0: 0.35, xs: null, txt: 'Là où f″(x) &lt; 0, le modèle quadratique est une parabole tournée vers le bas : son point critique est un <b>maximum</b>, et Newton y saute, il peut donc <b>monter</b>. Newton cherche un point où f′ = 0, pas forcément un minimum : il faut une Hessienne définie positive.' },
  };
  let key = 'exp', x = FN.exp.x0, hist = [], stopT = () => {}, busy = false;
  const cid = 'ornw' + (++UID);
  el.innerHTML = head('Méthode de Newton : sauter au minimum du modèle quadratique', 'Déplace le point xₖ : la parabole en pointillés est le développement de Taylor d\'ordre 2 en xₖ. Un pas de Newton saute à son sommet xₖ₊₁ = xₖ − f′(xₖ)/f″(xₖ).') +
    `<div class="viz-ctrl"><span class="vz-seg" role="group" aria-label="fonction">${Object.entries(FN).map(([k, v]) => `<button type="button" class="chip" data-f="${k}">${v.lab}</button>`).join('')}</span></div>
     <div class="viz-ctrl"><span class="viz-btns"><button type="button" class="btn small primary" data-i="step">Pas de Newton</button><button type="button" class="btn small" data-i="auto">${playLbl(false)} 6 pas</button><button type="button" class="btn small" data-i="reset">Recommencer</button></span></div>
     <div class="grid2 or-g2"><div class="or-cell">${svg(360, 260, '<g data-l="g"></g>', 'Fonction, modèle quadratique et itérés de Newton', 'or-drag')}</div><div class="or-cell or-tabw"><table class="t or-tab"><thead><tr><th>k</th><th>xₖ</th><th>|xₖ − x*|</th></tr></thead><tbody data-o="tab"></tbody></table></div></div>
     <p class="viz-out" data-o="out"></p>`;
  const s = $(el, 'svg'), W = 360, H = 260, L = 10, R = 350, T = 10, B = 236;
  const sc = () => { const F = FN[key]; return { F, X: v => L + (v - F.xr[0]) / (F.xr[1] - F.xr[0]) * (R - L), Y: v => B - (v - F.yr[0]) / (F.yr[1] - F.yr[0]) * (B - T) }; };
  const draw = (xv = x) => {
    const { F, X, Y } = sc(), d1 = F.d1(xv), d2 = F.d2(xv), nx = xv - d1 / d2, fx = F.f(xv), q = u => fx + d1 * (u - xv) + 0.5 * d2 * (u - xv) ** 2;
    let g = `<defs><clipPath id="${cid}"><rect x="${L}" y="${T}" width="${R - L}" height="${B - T}"/></clipPath></defs>`;
    g += line(L, B, R, B, 'class="vz-axis"');
    for (let v = Math.ceil(F.xr[0]); v <= F.xr[1]; v++) g += tx(X(v), B + 15, v, 'middle', 'vz-s');
    g += `<g clip-path="url(#${cid})">`;
    g += `<path d="${poly(Array.from({ length: 161 }, (_, i) => { const u = F.xr[0] + (F.xr[1] - F.xr[0]) * i / 160; return [X(u), Y(F.f(u))]; }))}" class="or-fcurve"/>`;
    g += `<path d="${poly(Array.from({ length: 121 }, (_, i) => { const u = F.xr[0] + (F.xr[1] - F.xr[0]) * i / 120; return [X(u), Y(q(u))]; }))}" class="or-model ${d2 < 0 ? 'or-model-bad' : ''}"/>`;
    hist.forEach((h, i) => { if (i) g += line(X(hist[i - 1]), Y(F.f(hist[i - 1])), X(h), Y(F.f(h)), 'class="or-hop"'); g += `<circle cx="${cl(X(h)).toFixed(1)}" cy="${cl(Y(F.f(h))).toFixed(1)}" r="3" class="or-hist"/>`; });
    if (Number.isFinite(nx)) g += line(X(nx), Y(q(nx)), X(nx), B, 'class="or-drop"') + `<circle cx="${cl(X(nx)).toFixed(1)}" cy="${cl(Y(q(nx))).toFixed(1)}" r="5" class="${d2 < 0 ? 'or-vtx-bad' : 'or-vtx'}"/>`;
    if (F.xs != null) g += `<path d="M${X(F.xs) - 5},${Y(F.f(F.xs))}h10M${X(F.xs)},${Y(F.f(F.xs)) - 5}v10" class="or-star"/>`;
    g += '</g>';
    if (Number.isFinite(nx) && nx > F.xr[0] && nx < F.xr[1]) g += tx(X(nx), B - 6, 'xₖ₊₁', 'middle', 'or-tvtx');
    g += `<circle cx="${X(xv).toFixed(1)}" cy="${Y(fx).toFixed(1)}" r="22" class="or-hit"/><circle cx="${X(xv).toFixed(1)}" cy="${Y(fx).toFixed(1)}" r="7" class="or-xk"/>` + tx(X(xv), Y(fx) - 12, 'xₖ', 'middle', 'or-txk');
    $(el, '[data-l=g]').innerHTML = g;
    el.querySelectorAll('[data-f]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === key)));
    const rows = hist.slice(-9).map((h, i, arr) => { const kk = hist.length - arr.length + i; return `<tr><td>${kk}</td><td>${Math.abs(h) > 1e4 ? sci(h) : fmt(h, 6)}</td><td>${F.xs != null ? sci(Math.abs(h - F.xs)) : '—'}</td></tr>`; }).join('');
    $(el, '[data-o=tab]').innerHTML = rows;
    $(el, '[data-o=out]').innerHTML = `En xₖ = ${fmt(xv, 3)} : f′ = ${sci(d1)}, f″ = ${sci(d2)}${d2 < 0 ? ' <b class="or-bad">(négative !)</b>' : ''}, donc xₖ₊₁ = ${Number.isFinite(nx) ? fmt(nx, 4) : '∞'}. ${F.txt}`;
  };
  const go = (cb) => {
    const F = FN[key], d1 = F.d1(x), d2 = F.d2(x), nx = x - d1 / d2;
    if (!Number.isFinite(nx) || Math.abs(nx) > 1e12) { if (cb) cb(false); return; }
    busy = true; const a = x;
    stopT = tween(el, Math.abs(nx - a) > 0.01 ? 650 : 200, u => draw(a + (nx - a) * u), () => { x = nx; hist.push(x); busy = false; draw(); if (cb) cb(Math.abs(nx) < 1e8); });
  };
  const reset = () => { stopT(); busy = false; x = FN[key].x0; hist = [x]; draw(); };
  const autoB = $(el, '[data-i=auto]');
  let auto = 0;
  const runAuto = () => { if (auto <= 0 || !el.isConnected) { autoB.textContent = `${playLbl(false)} 6 pas`; return; } auto--; go(ok => { if (ok) setTimeout(runAuto, RM() ? 0 : 250); else { auto = 0; runAuto(); } }); };
  $(el, '[data-i=step]').onclick = () => { if (!busy) go(); };
  autoB.onclick = () => { if (auto > 0) { auto = 0; return; } auto = 6; autoB.textContent = playLbl(true); runAuto(); };
  $(el, '[data-i=reset]').onclick = () => { auto = 0; reset(); };
  el.querySelectorAll('[data-f]').forEach(b => { b.onclick = () => { auto = 0; key = b.dataset.f; reset(); }; });
  drag(s, p => { const { F, X, Y } = sc(); return Math.hypot(p.x - X(x), p.y - Y(F.f(x))) < 30 || Math.abs(p.x - X(x)) < 18 ? 1 : null; }, (_, p) => {
    stopT(); auto = 0; busy = false; const F = FN[key]; x = clamp(F.xr[0] + (p.x - L) / (R - L) * (F.xr[1] - F.xr[0]), F.xr[0] + 0.05, F.xr[1] - 0.05); x = Math.round(x * 100) / 100; hist = [x]; draw();
  });
  reset();
}

/* ================================================================== 7. géométrie de Ridge et du Lasso */
function geomViz(el) {
  const A = [[1.0, 0.55], [0.55, 0.7]], lo = -3.2, hi = 3.2, fr = frame([lo, hi], [lo, hi], 340), uid = 'or' + (++UID);
  let wh = [2.2, 1.3], t = 1.6, mode = 'l1', stopT = () => {};
  const q = w => { const d = [w[0] - wh[0], w[1] - wh[1]]; return A[0][0] * d[0] * d[0] + 2 * A[0][1] * d[0] * d[1] + A[1][1] * d[1] * d[1]; };
  const ridge = lam => solve([[A[0][0] + lam, A[0][1]], [A[1][0], A[1][1] + lam]], [A[0][0] * wh[0] + A[0][1] * wh[1], A[1][0] * wh[0] + A[1][1] * wh[1]]);
  const solveL2 = tt => { if (Math.hypot(...wh) <= tt) return { w: wh.slice(), lam: 0 }; let a = 0, b = 1e6; for (let i = 0; i < 100; i++) { const m = (a + b) / 2; if (Math.hypot(...ridge(m)) > tt) a = m; else b = m; } const m = (a + b) / 2; return { w: ridge(m), lam: m }; };
  const solveL1 = tt => {
    if (Math.abs(wh[0]) + Math.abs(wh[1]) <= tt) return { w: wh.slice(), lam: 0 };
    const V = [[tt, 0], [0, tt], [-tt, 0], [0, -tt]]; let best = null;
    for (let e = 0; e < 4; e++) {
      const P = V[e], Q = V[(e + 1) % 4], d = [Q[0] - P[0], Q[1] - P[1]], r = [P[0] - wh[0], P[1] - wh[1]];
      const Ad = [A[0][0] * d[0] + A[0][1] * d[1], A[1][0] * d[0] + A[1][1] * d[1]], s_ = clamp(-(Ad[0] * r[0] + Ad[1] * r[1]) / (Ad[0] * d[0] + Ad[1] * d[1]), 0, 1);
      const w = [P[0] + s_ * d[0], P[1] + s_ * d[1]], v = q(w); if (!best || v < best.v) best = { w, v };
    }
    const w = best.w.map(v => (Math.abs(v) < 1e-9 ? 0 : v)), G = [2 * (A[0][0] * (wh[0] - w[0]) + A[0][1] * (wh[1] - w[1])), 2 * (A[1][0] * (wh[0] - w[0]) + A[1][1] * (wh[1] - w[1]))];
    const j = Math.abs(w[0]) >= Math.abs(w[1]) ? 0 : 1; return { w, lam: Math.abs(G[j]) };
  };
  // ellipses de niveau de q autour de ŵ
  const ev = (() => { const tr = A[0][0] + A[1][1], det = A[0][0] * A[1][1] - A[0][1] ** 2, l1 = tr / 2 + Math.sqrt(tr * tr / 4 - det), l2 = tr / 2 - Math.sqrt(tr * tr / 4 - det), ang = Math.atan2(l1 - A[0][0], A[0][1]); return { l1, l2, ang }; })();
  const ellipse = c => poly(Array.from({ length: 73 }, (_, i) => { const th = i / 72 * 2 * Math.PI, u = Math.sqrt(c / ev.l1) * Math.cos(th), v = Math.sqrt(c / ev.l2) * Math.sin(th); return [fr.X(wh[0] + u * Math.cos(ev.ang) - v * Math.sin(ev.ang)), fr.Y(wh[1] + u * Math.sin(ev.ang) + v * Math.cos(ev.ang))]; })) + 'Z';
  el.innerHTML = head('Pourquoi le Lasso met des coefficients à zéro', 'Les ellipses sont les courbes de niveau de ‖y − Xw‖², centrées sur la solution des moindres carrés ŵ (déplaçable). La solution régularisée est le premier point de contact avec la boule de rayon t.') +
    `<div class="viz-ctrl"><span class="vz-seg" role="group" aria-label="pénalité"><button type="button" class="chip" data-m="l2">Ridge : disque L2</button><button type="button" class="chip" data-m="l1">Lasso : losange L1</button></span>
     <span class="viz-btns"><button type="button" class="btn small primary" data-i="play">▶ Faire varier t</button></span></div>
     <div class="viz-ctrl"><label>budget t = <b data-o="t"></b><input type="range" min="0.05" max="3.2" step="0.01" value="${t}" data-i="t" aria-label="rayon de la contrainte"></label></div>
     <div class="grid2 or-g2"><div class="or-cell">${svg(fr.W, fr.H, `<defs><clipPath id="${uid}c"><rect width="${fr.W}" height="${fr.H}"/></clipPath></defs><g clip-path="url(#${uid}c)" data-l="g"></g>`, 'Courbes de niveau de la perte et contrainte de régularisation', 'or-drag')}</div>
     <div class="or-cell"><div class="or-coefs" data-o="coefs"></div><div class="metrics or-metrics"><div class="metric"><span>λ équivalent</span><b data-o="lam"></b></div><div class="metric"><span>coefficients nuls</span><b data-o="nz"></b></div></div><p class="viz-out" data-o="out"></p></div></div>`;
  const s = $(el, 'svg');
  const pathPts = () => { const out = [], tm = mode === 'l1' ? Math.abs(wh[0]) + Math.abs(wh[1]) : Math.hypot(...wh); for (let i = 0; i <= 60; i++) { const tt = tm * i / 60; out.push((mode === 'l1' ? solveL1(tt) : solveL2(tt)).w); } return out; };
  const draw = () => {
    const sol = mode === 'l1' ? solveL1(t) : solveL2(t), w = sol.w, X = fr.X, Y = fr.Y;
    let g = `<rect width="${fr.W}" height="${fr.H}" class="or-bg"/>`;
    for (let v = -3; v <= 3; v++) g += line(X(v), 0, X(v), fr.H, 'class="or-grid"') + line(0, Y(v), fr.W, Y(v), 'class="or-grid"');
    g += line(X(lo), Y(0), X(hi), Y(0), 'class="or-axis0"') + line(X(0), Y(lo), X(0), Y(hi), 'class="or-axis0"');
    g += tx(X(hi) - 4, Y(0) - 6, 'w₁', 'end', 'or-tax') + tx(X(0) + 6, Y(hi) + 14, 'w₂', 'start', 'or-tax');
    g += mode === 'l1' ? `<path d="M${X(t)},${Y(0)}L${X(0)},${Y(t)}L${X(-t)},${Y(0)}L${X(0)},${Y(-t)}Z" class="or-ball"/>` : `<circle cx="${X(0)}" cy="${Y(0)}" r="${t * fr.k}" class="or-ball"/>`;
    const q0 = q(w);
    [0.25, 1, 2.5, 5, 9].forEach(f_ => { g += `<path d="${ellipse(Math.max(q0, 0.05) * f_ / 1)}" class="or-ell"/>`; });
    if (q0 > 1e-9) g += `<path d="${ellipse(q0)}" class="or-ell-hit"/>`;
    g += `<path d="${poly(pathPts().map(p => [X(p[0]), Y(p[1])]))}" class="or-rpath"/>`;
    g += `<circle cx="${X(wh[0])}" cy="${Y(wh[1])}" r="22" class="or-hit"/><circle cx="${X(wh[0])}" cy="${Y(wh[1])}" r="6" class="or-ols"/>` + tx(X(wh[0]) + 9, Y(wh[1]) - 8, 'ŵ (MCO)', 'start', 'or-tols');
    const sparse = w.some(v => v === 0) && q0 > 1e-9;
    g += `<circle cx="${X(w[0])}" cy="${Y(w[1])}" r="${sparse ? 9 : 7}" class="or-sol${sparse ? ' or-sol-sp' : ''}"/>`;
    $(el, '[data-l=g]').innerHTML = g;
    const nz = w.filter(v => v === 0).length, m = Math.max(3, Math.abs(wh[0]), Math.abs(wh[1]));
    $(el, '[data-o=coefs]').innerHTML = [0, 1].map(j => `<div class="or-coef"><span>w${j ? '₂' : '₁'}</span><div class="or-cbar"><i style="left:${50 + Math.min(0, w[j]) / m * 50}%;width:${Math.abs(w[j]) / m * 50}%" class="${w[j] === 0 ? 'or-zero' : ''}"></i><em style="left:${50 + wh[j] / m * 50}%"></em></div><b>${w[j] === 0 ? '0 exactement' : fmt(w[j])}</b></div>`).join('');
    $(el, '[data-o=t]').textContent = fmt(t); $(el, '[data-o=lam]').textContent = sol.lam ? fmt(sol.lam) : '0 (inactif)'; $(el, '[data-o=nz]').textContent = nz;
    el.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === mode)));
    $(el, '[data-o=out]').innerHTML = q0 < 1e-9 ? 'ŵ est déjà dans la boule : la contrainte est inactive, la solution est celle des moindres carrés (λ = 0). Réduis t.'
      : mode === 'l1' ? (sparse ? `<b>L'ellipse touche le losange sur un sommet</b> : w${w[0] === 0 ? '₁' : '₂'} = 0 exactement. C'est la sélection de variables du Lasso. Le tracé en pointillés montre le chemin de la solution quand t varie : il longe un axe.` : 'Le contact se fait sur une arête : les deux coefficients sont non nuls mais rétrécis. Diminue encore t : la solution finit par atteindre un sommet.')
        : 'Avec le disque L2 (lisse, sans sommet), le contact se fait presque toujours en un point où les deux coordonnées sont non nulles : Ridge rétrécit tous les coefficients vers 0 sans jamais les annuler (sauf t = 0).';
  };
  drag(s, p => (Math.hypot(p.x - fr.X(wh[0]), p.y - fr.Y(wh[1])) < 28 ? 1 : null), (_, p) => { stopT(); const v = fr.inv(p.x, p.y); wh = [clamp(v[0], -3, 3), clamp(v[1], -3, 3)]; draw(); });
  const tI = $(el, '[data-i=t]');
  tI.oninput = () => { stopT(); t = +tI.value; draw(); };
  el.querySelectorAll('[data-m]').forEach(b => { b.onclick = () => { mode = b.dataset.m; draw(); }; });
  $(el, '[data-i=play]').onclick = () => { stopT(); const a = 3.2; stopT = tween(el, 5000, u => { t = a - (a - 0.05) * u; tI.value = t; draw(); }); };
  draw();
}

/* ================================================================== 8. chemins de régularisation (Ridge, Lasso, Elastic Net) */
function pathViz(el) {
  const n = 50, p = 6, r = rng(23), Z = Array.from({ length: n }, () => Array.from({ length: p }, () => gauss(r)));
  const Xr = Z.map(z => [z[0], 0.85 * z[0] + 0.53 * z[1], z[2], z[3], 0.6 * z[3] + 0.8 * z[4], z[5]]);
  const mean = j => Xr.reduce((s_, x) => s_ + x[j], 0) / n, sd = j => { const m = mean(j); return Math.sqrt(Xr.reduce((s_, x) => s_ + (x[j] - m) ** 2, 0) / n); };
  const M = Array.from({ length: p }, (_, j) => mean(j)), S = Array.from({ length: p }, (_, j) => sd(j));
  const X = Xr.map(x => x.map((v, j) => (v - M[j]) / S[j])), wStar = [3, 1.5, 0, -2, 0, 1];
  const y0 = X.map(x => x.reduce((s_, v, j) => s_ + v * wStar[j], 0) + 1.2 * gauss(r)), my = y0.reduce((a, b) => a + b, 0) / n, y = y0.map(v => v - my);
  const NL = 90, LL = Array.from({ length: NL }, (_, i) => -1 + 5.2 * i / (NL - 1)); // log10 λ de −1 à 4,2
  let alpha = 1, li = 55, paths = null;
  const compute = () => {
    const w = new Array(p).fill(0), res = y.slice(); paths = [];
    for (let i = NL - 1; i >= 0; i--) {
      const lam = 10 ** LL[i];
      for (let sweep = 0; sweep < 400; sweep++) {
        let delta = 0;
        for (let j = 0; j < p; j++) {
          let z = 0; for (let k = 0; k < n; k++) z += X[k][j] * (res[k] + X[k][j] * w[j]);
          const th = lam * alpha / 2, nw = (Math.sign(z) * Math.max(Math.abs(z) - th, 0)) / (n + lam * (1 - alpha) / 2);
          if (nw !== w[j]) { const d = nw - w[j]; for (let k = 0; k < n; k++) res[k] -= X[k][j] * d; delta = Math.max(delta, Math.abs(d)); w[j] = nw; }
        }
        if (delta < 1e-9) break;
      }
      paths[i] = w.slice();
    }
  };
  el.innerHTML = head('Chemins de régularisation : Ridge, Lasso, Elastic Net', '6 variables standardisées (x₁ et x₂ corrélées, x₄ et x₅ aussi) ; vrais coefficients (3 ; 1,5 ; 0 ; −2 ; 0 ; 1). Fais glisser λ et change le mélange α.') +
    `<div class="viz-ctrl"><span class="vz-seg" role="group" aria-label="méthode"><button type="button" class="chip" data-a="0">Ridge (α = 0)</button><button type="button" class="chip" data-a="0.5">Elastic Net (α = 0,5)</button><button type="button" class="chip" data-a="1">Lasso (α = 1)</button></span>
     <span class="viz-btns"><button type="button" class="btn small primary" data-i="play">▶ Balayer λ</button></span></div>
     <div class="viz-ctrl"><label>log₁₀ λ = <b data-o="l"></b><input type="range" min="0" max="${NL - 1}" step="1" value="${li}" data-i="l" aria-label="logarithme de lambda"></label>
     <label>mélange α = <b data-o="a"></b><input type="range" min="0" max="1" step="0.05" value="${alpha}" data-i="a" aria-label="mélange L1 L2"></label></div>
     <div class="grid2 or-g2"><div class="or-cell">${svg(360, 250, '<g data-l="g"></g>', 'Coefficients en fonction de lambda', 'or-drag')}</div><div class="or-cell"><div class="or-coefs" data-o="bars"></div></div></div>
     <p class="viz-out" data-o="out"></p>`;
  const s = $(el, 'svg'), W = 360, H = 250, L = 34, R = 350, T = 12, B = 222, Xl = i => L + i / (NL - 1) * (R - L);
  const draw = () => {
    const wmax = 3.6, Yv = v => (T + B) / 2 - v / wmax * (B - T) / 2;
    let g = `<path d="M${L},${T}V${B}" class="vz-axis"/>` + line(L, Yv(0), R, Yv(0), 'class="or-axis0"');
    [-3, -2, -1, 1, 2, 3].forEach(v => { g += line(L, Yv(v), R, Yv(v), 'class="vz-grid"') + tx(L - 4, Yv(v) + 4, v, 'end', 'vz-s'); });
    for (let e = -1; e <= 4; e++) { const i = (e + 1) / 5.2 * (NL - 1); g += tx(Xl(i), B + 15, `10${String(e).split('').map(c => SUP[c]).join('')}`, 'middle', 'vz-s'); }
    g += tx(R, H - 2, 'λ (échelle log) →', 'end', 'vz-s');
    for (let j = 0; j < p; j++) g += `<path d="${poly(paths.map((w, i) => [Xl(i), Yv(clamp(w[j], -wmax, wmax))]))}" class="or-pathc" style="stroke:${COL[j]}"/>` + tx(L + 3, Yv(paths[0][j]) + (j === 1 ? 12 : j === 5 ? -4 : 4), `w${'₁₂₃₄₅₆'[j]}`, 'start', 'vz-s or-tlab');
    g += line(Xl(li), T, Xl(li), B, 'class="or-lam"') + `<rect x="${Xl(li) - 16}" y="${T}" width="32" height="${B - T}" class="or-hit"/>`;
    paths[li].forEach((v, j) => { g += `<circle cx="${Xl(li).toFixed(1)}" cy="${Yv(clamp(v, -wmax, wmax)).toFixed(1)}" r="4.5" style="fill:${COL[j]}" class="or-pdot"/>`; });
    $(el, '[data-l=g]').innerHTML = g;
    const w = paths[li], nz = w.filter(v => Math.abs(v) < 1e-10).length;
    $(el, '[data-o=bars]').innerHTML = w.map((v, j) => `<div class="or-coef"><span style="color:${COL[j]}">w${'₁₂₃₄₅₆'[j]}</span><div class="or-cbar"><i style="left:${50 + Math.min(0, v) / 3.6 * 50}%;width:${Math.abs(v) / 3.6 * 50}%;background:${COL[j]}"></i><em style="left:${50 + wStar[j] / 3.6 * 50}%"></em></div><b>${Math.abs(v) < 1e-10 ? '0' : fmt(v)}</b></div>`).join('') + '<p class="or-axn">trait vertical : vraie valeur</p>';
    $(el, '[data-o=l]').textContent = fmt(LL[li], 2); $(el, '[data-o=a]').textContent = fmt(alpha, 2);
    el.querySelectorAll('[data-a]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.a === alpha)));
    $(el, '[data-o=out]').innerHTML = `Objectif : ‖y − Xw‖² + λα‖w‖₁ + λ(1 − α)/2 ‖w‖², résolu par descente de coordonnées (seuillage doux). À λ = ${sci(10 ** LL[li])} : <b>${nz} coefficient${nz > 1 ? 's' : ''} nul${nz > 1 ? 's' : ''}</b>. ` +
      (alpha === 0 ? 'Ridge rétrécit tous les coefficients en douceur (facteur dᵢ/(dᵢ + λ) dans chaque direction propre) mais n\'en annule aucun.' : alpha === 1 ? 'Le Lasso annule les coefficients un par un quand λ grandit : les chemins sont affines par morceaux et touchent 0 à des λ précis. Entre x₁ et x₂ corrélées, il favorise l\'une plus que l\'autre.' : 'L\'Elastic Net annule aussi des coefficients (partie L1) mais traite plus équitablement les variables corrélées (partie L2) : comparer w₁/w₂ et w₄/w₅ avec le Lasso.');
  };
  const loop = looper(el, 40, () => { if (li >= NL - 1) return false; li++; $(el, '[data-i=l]').value = li; draw(); });
  $(el, '[data-i=l]').oninput = e => { loop.stop(); li = +e.target.value; draw(); };
  $(el, '[data-i=a]').oninput = e => { alpha = +e.target.value; compute(); draw(); };
  el.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => { alpha = +b.dataset.a; $(el, '[data-i=a]').value = alpha; compute(); draw(); }; });
  $(el, '[data-i=play]').onclick = () => { if (loop.on) { loop.stop(); return; } li = 0; loop.start(); };
  drag(s, p => (p.x >= L - 10 && p.x <= R + 10 ? 1 : null), (_, pt) => { loop.stop(); li = clamp(Math.round((pt.x - L) / (R - L) * (NL - 1)), 0, NL - 1); $(el, '[data-i=l]').value = li; draw(); });
  compute(); draw();
}

/* ------------------------------------------------------------------ régression polynomiale Ridge (base de Legendre), commune à 9 et 10 */
const TRUEF = x => Math.sin(2.6 * x) + 0.4 * x;
const DEG = 12;
function legendre(x) { const P = [1, x]; for (let k = 2; k <= DEG; k++) P.push(((2 * k - 1) * x * P[k - 1] - (k - 1) * P[k - 2]) / k); return P; }
function ridgePoly(xs, ys, lam) {
  const Phi = xs.map(legendre), m = DEG + 1, A = Array.from({ length: m }, (_, a) => Array.from({ length: m }, (__, b) => Phi.reduce((t, r) => t + r[a] * r[b], 0) + (a === b && a > 0 ? lam : 0)));
  const b = Array.from({ length: m }, (_, a) => Phi.reduce((t, r, i) => t + r[a] * ys[i], 0));
  const w = solve(A, b); return x => legendre(x).reduce((t, v, j) => t + v * w[j], 0);
}
function polyAxes(L, R, T, B, ylo, yhi) {
  const X = x => L + (x + 1) / 2 * (R - L), Y = y => B - (y - ylo) / (yhi - ylo) * (B - T);
  let g = `<path d="M${L},${T}V${B}H${R}" class="vz-axis"/>`;
  [-1, -0.5, 0, 0.5, 1].forEach(v => { g += tx(X(v), B + 15, fmt(v, v % 1 ? 1 : 0), 'middle', 'vz-s'); });
  for (let v = Math.ceil(ylo); v <= yhi; v++) g += line(L, Y(v), R, Y(v), 'class="vz-grid"') + tx(L - 4, Y(v) + 4, v, 'end', 'vz-s');
  return { X, Y, g };
}
const curve = (fn, X, Y) => poly(Array.from({ length: 101 }, (_, i) => { const x = -1 + 2 * i / 100; return [X(x), Y(fn(x))]; }));

/* ================================================================== 9. biais et variance */
function bvViz(el) {
  const sig = 0.35, n = 20, Mset = 25, grid = Array.from({ length: 41 }, (_, i) => -1 + 2 * i / 40);
  const sets = Array.from({ length: Mset }, (_, m) => { const r = rng(300 + m), xs = Array.from({ length: n }, () => 2 * r() - 1); return { xs, ys: xs.map(x => TRUEF(x) + sig * gauss(r)) }; });
  const LG = Array.from({ length: 33 }, (_, i) => -6 + 8 * i / 32);
  const stats = li => { const fits = sets.map(st => ridgePoly(st.xs, st.ys, 10 ** LG[li])), P = fits.map(f => grid.map(f)), mean = grid.map((_, g) => P.reduce((t, p) => t + p[g], 0) / Mset);
    const b2 = grid.reduce((t, x, g) => t + (mean[g] - TRUEF(x)) ** 2, 0) / grid.length, v = grid.reduce((t, x, g) => t + P.reduce((s_, p) => s_ + (p[g] - mean[g]) ** 2, 0) / Mset, 0) / grid.length; return { fits, mean, b2, v }; };
  const ALL = LG.map((_, i) => stats(i));
  let li = 20, shown = Mset;
  const cid = 'orbv' + (++UID);
  el.innerHTML = head('Biais et variance : ce que fait la régularisation', `Un polynôme de degré ${DEG} est ajusté par Ridge sur ${Mset} jeux d'entraînement différents (${n} points chacun). Fais varier λ : peu régularisé, les courbes s'agitent (variance) ; trop régularisé, elles ratent la vraie fonction (biais).`) +
    `<div class="viz-ctrl"><label>log₁₀ λ = <b data-o="l"></b><input type="range" min="0" max="${LG.length - 1}" step="1" value="${li}" data-i="l" aria-label="logarithme de lambda"></label>
     <span class="viz-btns"><button type="button" class="btn small primary" data-i="play">${playLbl(false)} Tirer les ${Mset} jeux</button></span></div>
     <div class="grid2 or-g2"><div class="or-cell">${svg(360, 240, '<g data-l="f"></g>', 'Ajustements sur plusieurs jeux d\'entraînement')}</div><div class="or-cell">${svg(360, 240, '<g data-l="c"></g>', 'Biais au carré, variance et erreur totale selon lambda')}</div></div>
     <div class="viz-leg"><span><i class="sw sw-d" style="--sw:var(--ink)"></i>vraie fonction</span><span><i class="sw sw-lt" style="--sw:var(--c1)"></i>un ajustement par jeu</span><span><i class="sw sw-l" style="--sw:var(--c2)"></i>moyenne des ajustements</span></div>
     <p class="viz-out" data-o="out"></p>`;
  const draw = () => {
    const st = ALL[li], { X, Y, g: ax } = polyAxes(30, 352, 10, 214, -2.2, 2.2);
    let g = `<defs><clipPath id="${cid}"><rect x="30" y="10" width="322" height="204"/></clipPath></defs>` + ax + `<g clip-path="url(#${cid})">`;
    st.fits.slice(0, shown).forEach(f => { g += `<path d="${curve(f, X, Y)}" class="or-fitc"/>`; });
    g += `<path d="${curve(TRUEF, X, Y)}" class="or-truec"/>`;
    if (shown >= Mset) g += `<path d="${poly(grid.map((x, i) => [X(x), Y(st.mean[i])]))}" class="or-meanc"/>`;
    g += '</g>';
    $(el, '[data-l=f]').innerHTML = g;
    // courbes biais², variance, total
    const L = 40, R = 352, T = 12, B = 210, Xl = i => L + i / (LG.length - 1) * (R - L), tot = ALL.map(a => a.b2 + a.v + sig * sig), ymax = 0.8, Yv = v => B - Math.min(v, ymax) / ymax * (B - T);
    let c = `<path d="M${L},${T}V${B}H${R}" class="vz-axis"/>`;
    [0.2, 0.4, 0.6, 0.8].forEach(v => { c += line(L, Yv(v), R, Yv(v), 'class="vz-grid"') + tx(L - 4, Yv(v) + 4, fmt(v, 1), 'end', 'vz-s'); });
    [-6, -4, -2, 0, 2].forEach(e => { c += tx(Xl((e + 6) / 8 * (LG.length - 1)), B + 15, `10${String(e).split('').map(ch => SUP[ch]).join('')}`, 'middle', 'vz-s'); });
    c += line(L, Yv(sig * sig), R, Yv(sig * sig), 'class="or-noise"') + tx(R, Yv(sig * sig) - 4, 'σ² (irréductible)', 'end', 'vz-s or-tnoise');
    c += `<path d="${poly(ALL.map((a, i) => [Xl(i), Yv(a.b2)]))}" class="or-bias"/><path d="${poly(ALL.map((a, i) => [Xl(i), Yv(a.v)]))}" class="or-var"/><path d="${poly(tot.map((v, i) => [Xl(i), Yv(v)]))}" class="or-tot"/>`;
    const best = tot.indexOf(Math.min(...tot));
    c += line(Xl(best), T, Xl(best), B, 'class="or-best"') + tx(Xl(best) + 4, T + 10, 'optimum', 'start', 'vz-s or-tbest');
    c += line(Xl(li), T, Xl(li), B, 'class="or-lam"') + [[ALL[li].b2, 'or-bias'], [ALL[li].v, 'or-var'], [tot[li], 'or-tot']].map(([v, k]) => `<circle cx="${Xl(li).toFixed(1)}" cy="${Yv(v).toFixed(1)}" r="4.5" class="${k}-d"/>`).join('');
    c += tx(L + 4, T + 2, 'erreur moyenne', 'start', 'vz-s') + tx(R, 236, 'λ (échelle log) →', 'end', 'vz-s');
    $(el, '[data-l=c]').innerHTML = c;
    $(el, '[data-o=l]').textContent = fmt(LG[li], 2);
    const a = ALL[li];
    $(el, '[data-o=out]').innerHTML = `<span class="or-kb">biais² = <b>${fmt(a.b2, 3)}</b></span> <span class="or-kv">variance = <b>${fmt(a.v, 3)}</b></span> <span class="or-kt">biais² + variance + σ² = <b>${fmt(tot[li], 3)}</b></span><br>` +
      (li < best - 3 ? 'λ trop petit : le polynôme suit le bruit de chaque échantillon (sur-apprentissage), les courbes divergent surtout aux bords. La variance domine.' : li > best + 3 ? 'λ trop grand : toutes les courbes se ressemblent (faible variance) mais sont trop « raides » pour suivre la vraie fonction : sous-apprentissage, le biais domine.' : 'Zone du compromis : on accepte un peu de biais pour réduire fortement la variance, et l\'erreur totale est minimale.');
  };
  const btn = $(el, '[data-i=play]');
  const loop = looper(el, 120, () => { if (shown >= Mset) return false; shown++; draw(); }, on => { btn.textContent = `${playLbl(on)} Tirer les ${Mset} jeux`; });
  $(el, '[data-i=l]').oninput = e => { loop.stop(); shown = Mset; li = +e.target.value; draw(); };
  btn.onclick = () => { if (loop.on) { loop.stop(); return; } shown = 0; loop.start(); };
  draw();
}

/* ================================================================== 10. validation croisée à K plis */
function cvViz(el) {
  const n = 30, K = 5, sig = 0.35, r = rng(808), xs = Array.from({ length: n }, () => 2 * r() - 1), ys = xs.map(x => TRUEF(x) + sig * gauss(r));
  const perm = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  const fold = new Array(n); perm.forEach((p, k) => { fold[p] = k % K; });
  const LG = Array.from({ length: 33 }, (_, i) => -6 + 8 * i / 32);
  const fitOut = (k, lam) => { const I = xs.map((_, i) => i).filter(i => fold[i] !== k); return ridgePoly(I.map(i => xs[i]), I.map(i => ys[i]), lam); };
  const CV = LG.map(l => { const lam = 10 ** l, errs = Array.from({ length: K }, (_, k) => { const f = fitOut(k, lam), I = xs.map((_, i) => i).filter(i => fold[i] === k); return I.reduce((t, i) => t + (ys[i] - f(xs[i])) ** 2, 0) / I.length; });
    const m = errs.reduce((a, b) => a + b, 0) / K, sd = Math.sqrt(errs.reduce((t, e) => t + (e - m) ** 2, 0) / (K - 1)) / Math.sqrt(K); const fa = ridgePoly(xs, ys, lam); return { errs, m, se: sd, train: xs.reduce((t, x, i) => t + (ys[i] - fa(x)) ** 2, 0) / n }; });
  const iOpt = CV.reduce((b, c, i) => (c.m < CV[b].m ? i : b), 0), lim = CV[iOpt].m + CV[iOpt].se;
  let i1se = iOpt; CV.forEach((c, i) => { if (i > i1se && c.m <= lim) i1se = i; });
  let li = 12, k = -1, revealed = new Set(), run = null, phase = 'idle';
  const cid = 'orcv' + (++UID);
  el.innerHTML = head('Validation croisée à 5 plis pour choisir λ', 'Les 30 points sont répartis en 5 plis (couleurs). Pour un λ donné, on entraîne 5 fois sur 4 plis et on mesure l\'erreur sur le pli restant ; CV(λ) est la moyenne.') +
    `<div class="viz-ctrl"><label>log₁₀ λ = <b data-o="l"></b><input type="range" min="0" max="${LG.length - 1}" step="1" value="${li}" data-i="l" aria-label="logarithme de lambda"></label>
     <span class="viz-btns"><button type="button" class="btn small primary" data-i="one">▶ 5 plis pour ce λ</button><button type="button" class="btn small" data-i="all">▶ Balayer tous les λ</button><button type="button" class="btn small" data-i="clr">Effacer</button></span></div>
     <div class="or-folds" data-o="folds"></div>
     <div class="grid2 or-g2"><div class="or-cell">${svg(360, 240, '<g data-l="f"></g>', 'Données, plis et ajustement')}</div><div class="or-cell">${svg(360, 240, '<g data-l="c"></g>', 'Erreur de validation croisée selon lambda')}</div></div>
     <p class="viz-out" data-o="out"></p>`;
  const FC = j => COL[[1, 2, 3, 4, 5][j]];
  const draw = () => {
    const lam = 10 ** LG[li], { X, Y, g: ax } = polyAxes(30, 352, 10, 214, -2.2, 2.2);
    let g = `<defs><clipPath id="${cid}"><rect x="30" y="10" width="322" height="204"/></clipPath></defs>` + ax + `<g clip-path="url(#${cid})">`;
    if (k >= 0) { const f = fitOut(k, lam); g += `<path d="${curve(f, X, Y)}" class="or-cvfit"/>`; xs.forEach((x, i) => { if (fold[i] === k) g += line(X(x), Y(ys[i]), X(x), Y(f(x)), 'class="or-cvres"'); }); }
    else g += `<path d="${curve(ridgePoly(xs, ys, lam), X, Y)}" class="or-cvfit"/>`;
    g += '</g>';
    xs.forEach((x, i) => { const test = k >= 0 && fold[i] === k; g += `<circle cx="${X(x).toFixed(1)}" cy="${Y(ys[i]).toFixed(1)}" r="${test ? 6 : 4}" class="or-cvpt${k >= 0 && !test ? ' or-dim' : ''}${test ? ' or-test' : ''}" style="fill:${FC(fold[i])}"/>`; });
    g += tx(36, 22, k >= 0 ? `pli ${k + 1} mis de côté (gros points) : entraînement sur les 4 autres` : 'ajustement sur toutes les données', 'start', 'vz-s');
    $(el, '[data-l=f]').innerHTML = g;
    const L = 40, R = 352, T = 12, B = 210, Xl = i => L + i / (LG.length - 1) * (R - L), ymax = 0.8, Yv = v => B - Math.min(v, ymax) / ymax * (B - T);
    let c = `<path d="M${L},${T}V${B}H${R}" class="vz-axis"/>`;
    [0.2, 0.4, 0.6, 0.8].forEach(v => { c += line(L, Yv(v), R, Yv(v), 'class="vz-grid"') + tx(L - 4, Yv(v) + 4, fmt(v, 1), 'end', 'vz-s'); });
    [-6, -4, -2, 0, 2].forEach(e => { c += tx(Xl((e + 6) / 8 * (LG.length - 1)), B + 15, `10${String(e).split('').map(ch => SUP[ch]).join('')}`, 'middle', 'vz-s'); });
    c += `<path d="${poly(CV.map((cv, i) => [Xl(i), Yv(cv.train)]))}" class="or-train"/>` + tx(Xl(2), Yv(CV[2].train) - 6, 'erreur d\'entraînement', 'start', 'vz-s or-ttrain');
    const rv = [...revealed].sort((a, b) => a - b);
    rv.forEach(i => { const cv = CV[i]; c += line(Xl(i), Yv(cv.m - cv.se), Xl(i), Yv(cv.m + cv.se), 'class="or-eb"') + `<circle cx="${Xl(i).toFixed(1)}" cy="${Yv(cv.m).toFixed(1)}" r="3.6" class="or-cvdot"/>`; });
    if (revealed.size === LG.length) {
      c += line(Xl(iOpt), T, Xl(iOpt), B, 'class="or-best"') + tx(Xl(iOpt) - 3, T + 10, shat('λ', 'opt'), 'end', 'vz-s or-tbest');
      c += line(Xl(i1se), T, Xl(i1se), B, 'class="or-1se"') + tx(Xl(i1se) + 3, T + 22, shat('λ', '1se'), 'start', 'vz-s or-t1se') + line(L, Yv(lim), R, Yv(lim), 'class="or-1se-h"');
    }
    c += line(Xl(li), T, Xl(li), B, 'class="or-lam"') + tx(L + 4, T + 2, 'erreur quadratique moyenne', 'start', 'vz-s') + tx(R, 236, 'λ (échelle log) →', 'end', 'vz-s');
    $(el, '[data-l=c]').innerHTML = c;
    $(el, '[data-o=l]').textContent = fmt(LG[li], 2);
    const cv = CV[li];
    $(el, '[data-o=folds]').innerHTML = Array.from({ length: K }, (_, j) => `<span class="or-fold${j === k ? ' on' : ''}" style="--fc:${FC(j)}"><i></i>pli ${j + 1}<b>${(phase === 'one' && j <= k) || revealed.has(li) ? fmt(cv.errs[j], 3) : '—'}</b></span>`).join('') + `<span class="or-fold or-cvm">CV(λ)<b>${revealed.has(li) ? fmt(cv.m, 3) : '—'}</b></span>`;
    $(el, '[data-o=out]').innerHTML = revealed.size === LG.length
      ? `Courbe complète : <span class="or-hat">λ</span>_opt = 10^${fmt(LG[iOpt], 2)} minimise CV(λ) = ${fmt(CV[iOpt].m, 3)} ; la règle « à un écart-type » choisit le plus grand λ dont l'erreur reste sous CV(<span class="or-hat">λ</span>_opt) + s_opt = ${fmt(lim, 3)} (ligne pointillée) : <span class="or-hat">λ</span>_1se = 10^${fmt(LG[i1se], 2)}, un modèle plus régularisé, presque aussi bon. L'erreur d'entraînement, elle, ne fait que baisser quand λ diminue : elle ne permet pas de choisir λ. Dernière étape : réentraîner sur toutes les données avec le λ retenu.`
      : `Lance les 5 plis pour ce λ, puis balaie tous les λ. Les barres verticales indiquent l'incertitude (± erreur-type des 5 erreurs de pli).`;
  };
  const stop = () => { if (run) run.stop(); };
  const oneFor = () => { stop(); phase = 'one'; k = -1; run = looper(el, 650, () => { if (k < K - 1) { k++; draw(); return true; } revealed.add(li); k = -1; phase = 'idle'; draw(); return false; }); run.start(); };
  const all = () => { stop(); phase = 'idle'; k = -1; let i = 0; run = looper(el, 70, () => { while (i < LG.length && revealed.has(i)) i++; if (i >= LG.length) { draw(); return false; } revealed.add(i); li = i; $(el, '[data-i=l]').value = li; draw(); return true; }); run.start(); };
  $(el, '[data-i=l]').oninput = e => { stop(); phase = 'idle'; k = -1; li = +e.target.value; draw(); };
  $(el, '[data-i=one]').onclick = oneFor;
  $(el, '[data-i=all]').onclick = all;
  $(el, '[data-i=clr]').onclick = () => { stop(); revealed = new Set(); k = -1; phase = 'idle'; draw(); };
  draw();
}

const VIZ = { 'or-gd': gdViz, 'or-momentum': momViz, 'or-cd': cdViz, 'or-race': raceViz, 'or-sgd': sgdViz, 'or-newton': newtonViz, 'or-geom': geomViz, 'or-path': pathViz, 'or-bv': bvViz, 'or-cv': cvViz };

export function mountViz(root) {
  root.querySelectorAll('[data-viz]').forEach(el => { const f = VIZ[el.dataset.viz]; if (f && !el.dataset.ready) { el.dataset.ready = '1'; try { f(el); } catch (e) { el.textContent = ''; console.error(e); } } });
}
