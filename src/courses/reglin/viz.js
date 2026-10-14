// Illustrations interactives du cours de régression linéaire (SVG, couleurs du thème du site).
// Tous les calculs sont faits dans le navigateur, sur de petits jeux de données simulés (générateur pseudo-aléatoire à graine).
import './viz.css';

/* ------------------------------------------------------------------ outils communs */
const fmt = (x, d = 2) => (Number.isFinite(x) ? Number(x).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−') : '∞');
const head = (t, hint) => `<figcaption><b>${t}</b>${hint ? `<span>${hint}</span>` : ''}</figcaption>`;
const svg = (w, h, body, label, cls = '') => `<svg viewBox="0 0 ${w} ${h}" class="vz-svg ${cls}" role="img" aria-label="${label}">${body}</svg>`;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const RM = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = t => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
let UID = 0;
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(r) { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
const $ = (el, s) => el.querySelector(s);
const tx = (x, y, s, a = 'start', cls = '', extra = '') => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="vz-t ${cls}" text-anchor="${a}" ${extra}>${s}</text>`;
const line = (x1, y1, x2, y2, extra = '') => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" ${extra}/>`;
const poly = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
const arrowDefs = id => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="context-stroke"/></marker></defs>`;

/** Interpolation animée (désactivée si l'utilisateur préfère réduire les animations). Renvoie une fonction d'arrêt. */
function tween(el, ms, step, done) {
  let id = 0, stop = false;
  if (RM()) { step(1); if (done) done(); return () => {}; }
  const t0 = performance.now();
  const f = now => { if (stop || !el.isConnected) return; const u = Math.min(1, (now - t0) / ms); step(ease(u)); if (u < 1) id = requestAnimationFrame(f); else if (done) done(); };
  id = requestAnimationFrame(f);
  return () => { stop = true; cancelAnimationFrame(id); };
}
/** Boucle d'animation à cadence fixe ; tick() renvoie false pour s'arrêter. */
function looper(el, ms, tick, onState) {
  let on = false, id = 0, last = 0;
  const fr = now => { if (!on) return; if (!el.isConnected) { on = false; return; } if (now - last >= ms) { last = now; if (tick() === false) { stop(); return; } } id = requestAnimationFrame(fr); };
  const start = () => { if (on) return; if (RM()) { let g = 0; while (tick() !== false && g++ < 5000); if (onState) onState(false); return; } on = true; last = 0; id = requestAnimationFrame(fr); if (onState) onState(true); };
  const stop = () => { if (!on) return; on = false; cancelAnimationFrame(id); if (onState) onState(false); };
  return { start, stop, get on() { return on; } };
}
function svgPt(s, e) { const m = s.getScreenCTM(); if (!m) return { x: 0, y: 0 }; const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); return { x: p.x, y: p.y }; }
/** Glisser-déposer dans un SVG : pick(p) renvoie la poignée visée (ou null), move(h, p) la déplace. */
function drag(s, pick, move, end) {
  s.addEventListener('pointerdown', e => {
    const h = pick(svgPt(s, e)); if (h == null) return;
    e.preventDefault(); const id = e.pointerId; try { s.setPointerCapture(id); } catch (_) { /* rien */ }
    s.classList.add('rl-dragging');
    const mv = ev => { if (ev.pointerId === id) move(h, svgPt(s, ev)); };
    const up = ev => { if (ev.pointerId !== id) return; s.removeEventListener('pointermove', mv); s.removeEventListener('pointerup', up); s.removeEventListener('pointercancel', up); s.classList.remove('rl-dragging'); if (end) end(h); };
    s.addEventListener('pointermove', mv); s.addEventListener('pointerup', up); s.addEventListener('pointercancel', up);
  });
}
const nearest = (list, p, rad) => { let best = null, bd = rad * rad; list.forEach((q, i) => { const d = (q[0] - p.x) ** 2 + (q[1] - p.y) ** 2; if (d <= bd) { bd = d; best = i; } }); return best; };

/* ------------------------------------------------------------------ algèbre linéaire et lois */
function solve(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c] || 1e-12;
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / d; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((r, i) => r[n] / (M[i][i] || 1e-12));
}
function inverse(A) { const n = A.length; const cols = A.map((_, j) => solve(A, A.map((__, i) => (i === j ? 1 : 0)))); return A.map((_, i) => cols.map(c => c[i])); }
/** Moindres carrés : X lignes (avec la colonne de 1), y. */
function ols(X, y) {
  const p = X[0].length, XtX = Array.from({ length: p }, (_, a) => Array.from({ length: p }, (__, b) => X.reduce((t, r) => t + r[a] * r[b], 0)));
  const Xty = Array.from({ length: p }, (_, a) => X.reduce((t, r, i) => t + r[a] * y[i], 0));
  const beta = solve(XtX, Xty), fit = X.map(r => r.reduce((t, v, j) => t + v * beta[j], 0));
  return { beta, fit, res: y.map((v, i) => v - fit[i]), XtX };
}
const simple = (xs, ys) => {
  const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, sxy = 0; xs.forEach((x, i) => { sxx += (x - mx) ** 2; sxy += (x - mx) * (ys[i] - my); });
  const b = sxx > 1e-12 ? sxy / sxx : 0, a = my - b * mx;
  const res = ys.map((y, i) => y - a - b * xs[i]);
  return { a, b, mx, my, sxx, res, scr: res.reduce((t, e) => t + e * e, 0) };
};
function lgamma(x) { const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]; if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x); x -= 1; let a = c[0]; const t = x + 7.5; for (let i = 1; i < 9; i++) a += c[i] / (x + i); return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a); }
function betacf(a, b, x) { const FP = 1e-300; const qab = a + b, qap = a + 1, qam = a - 1; let c = 1, d = 1 - qab * x / qap; if (Math.abs(d) < FP) d = FP; d = 1 / d; let h = d; for (let m = 1; m <= 300; m++) { const m2 = 2 * m; let aa = m * (b - m) * x / ((qam + m2) * (a + m2)); d = 1 + aa * d; if (Math.abs(d) < FP) d = FP; c = 1 + aa / c; if (Math.abs(c) < FP) c = FP; d = 1 / d; h *= d * c; aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2)); d = 1 + aa * d; if (Math.abs(d) < FP) d = FP; c = 1 + aa / c; if (Math.abs(c) < FP) c = FP; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 3e-14) break; } return h; }
function ibeta(x, a, b) { if (x <= 0) return 0; if (x >= 1) return 1; const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x)); return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b; }
const tcdf = (t, v) => { const p = 0.5 * ibeta(v / (v + t * t), v / 2, 0.5); return t >= 0 ? 1 - p : p; };
const tpdf = (t, v) => Math.exp(lgamma((v + 1) / 2) - lgamma(v / 2) - 0.5 * Math.log(v * Math.PI) - (v + 1) / 2 * Math.log(1 + t * t / v));
const fcdf = (x, a, b) => (x <= 0 ? 0 : ibeta(a * x / (a * x + b), a / 2, b / 2));
const fpdf = (x, a, b) => (x <= 0 ? 0 : Math.exp(a / 2 * Math.log(a / b) + (a / 2 - 1) * Math.log(x) - (a + b) / 2 * Math.log(1 + a * x / b) - (lgamma(a / 2) + lgamma(b / 2) - lgamma((a + b) / 2))));
function invcdf(cdf, p, lo, hi) { for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (cdf(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
const tq = (p, v) => invcdf(t => tcdf(t, v), p, -1e3, 1e3);
/** Quantile de la loi normale centrée réduite (Acklam). */
function qnorm(p) {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239], b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572], c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783], d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  if (p < 0.02425) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - 0.02425) return -qnorm(1 - p);
  const q = p - 0.5, r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}
const pct = x => fmt(100 * x, 1) + ' %';
const pval = p => (p < 0.0001 ? '&lt; 0,0001' : fmt(p, 4));
/** Lettre chapeau dans un texte SVG (le chapeau combinant s'affiche mal dans certaines polices). */
const shat = (c, sub = '') => `${c}<tspan dx="-0.5em" dy="-0.28em" font-size="0.9em">ˆ</tspan><tspan dx="0.12em" dy="0.28em">${sub}</tspan>`;
const playLbl = on => (on ? '❚❚ Pause' : '▶ Lancer');

/* ================================================================== 1. moindres carrés : les carrés des résidus */
function olsViz(el) {
  const W = 360, H = 292, L = 30, R = 352, T = 8, B = 268, k = (R - L) / 10, ymax = (B - T) / k;
  const X = x => L + x * k, Y = y => B - y * k, uid = 'rl' + (++UID);
  let seed = 4, pts = [], mode = 'libre', ln = { a: 5.2, b: -0.15 }, stopT = () => {};
  const gen = () => { const r = rng(seed); pts = Array.from({ length: 8 }, (_, i) => { const x = 0.9 + i * 1.18 + (r() - 0.5) * 0.5; return [x, clamp(1.1 + 0.55 * x + gauss(r) * 0.85, 0.3, ymax - 0.3)]; }); };
  gen();
  el.innerHTML = head('Les moindres carrés, carré par carré', 'Déplace les points ou, en mode libre, les deux poignées de la droite. Chaque carré a pour aire un résidu au carré : SCR est leur aire totale.') +
    `<div class="viz-ctrl"><span class="vz-seg" role="group" aria-label="droite"><button type="button" class="chip" data-m="libre">Droite libre</button><button type="button" class="chip" data-m="mco">Droite des MCO</button></span>
     <span class="viz-btns"><button type="button" class="btn small primary" data-i="go">Glisser vers les MCO</button><button type="button" class="btn small" data-i="new">Nouveau nuage</button></span></div>
     <div class="rl-stage">${svg(W, H, `<defs><clipPath id="${uid}c"><rect x="${L}" y="${T}" width="${R - L}" height="${B - T}"/></clipPath></defs><g data-l="ax"></g><g clip-path="url(#${uid}c)"><g data-l="sq"></g><g data-l="ln"></g></g><g data-l="pt"></g>`, 'Nuage de points, droite et carrés des résidus', 'rl-drag')}</div>
     <div class="rl-meter"><div class="rl-meter-l"><span>SCR de ta droite</span><b data-o="scr"></b></div><div class="rl-bar"><i data-o="bar"></i><em data-o="min"></em></div><div class="rl-meter-l"><span>minimum (MCO)</span><b data-o="smin"></b></div></div>
     <p class="viz-out" data-o="out"></p>`;
  const s = $(el, 'svg');
  let ax = `<path d="M${L},${T}V${B}H${R}" class="vz-axis"/>`;
  for (let x = 0; x <= 10; x += 2) ax += tx(X(x), B + 16, x, 'middle') + (x ? line(X(x), T, X(x), B, 'class="vz-grid"') : '');
  for (let y = 2; y < ymax; y += 2) ax += tx(L - 5, Y(y) + 4, y, 'end') + line(L, Y(y), R, Y(y), 'class="vz-grid"');
  ax += tx(R - 2, B - 6, 'x', 'end') + tx(L + 6, T + 12, 'y');
  $(el, '[data-l=ax]').innerHTML = ax;
  const handles = () => [[X(1.5), Y(ln.a + ln.b * 1.5)], [X(8.5), Y(ln.a + ln.b * 8.5)]];
  const draw = () => {
    const f = simple(pts.map(p => p[0]), pts.map(p => p[1]));
    const cur = mode === 'mco' ? { a: f.a, b: f.b } : ln;
    let sq = '', scr = 0;
    pts.forEach(([x, y]) => {
      const yh = cur.a + cur.b * x, e = y - yh, side = Math.abs(e) * k; scr += e * e;
      const left = X(x) + side > R - 2;
      sq += `<rect x="${(left ? X(x) - side : X(x)).toFixed(1)}" y="${Y(Math.max(y, yh)).toFixed(1)}" width="${side.toFixed(1)}" height="${side.toFixed(1)}" class="rl-sq"/>` + line(X(x), Y(y), X(x), Y(yh), 'class="rl-res"');
    });
    $(el, '[data-l=sq]').innerHTML = sq;
    let lh = line(X(0), Y(cur.a), X(10), Y(cur.a + cur.b * 10), `class="rl-line${mode === 'mco' ? ' rl-line-mco' : ''}"`);
    if (mode === 'libre') lh += line(X(0), Y(f.a), X(10), Y(f.a + f.b * 10), 'class="rl-ghost"');
    $(el, '[data-l=ln]').innerHTML = lh;
    let ph = pts.map(([x, y]) => `<circle cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="20" class="rl-hit"/><circle cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="6" class="rl-pt"/>`).join('');
    if (mode === 'libre') ph += handles().map(([hx, hy]) => `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="22" class="rl-hit"/><rect x="${(hx - 7).toFixed(1)}" y="${(hy - 7).toFixed(1)}" width="14" height="14" rx="3" class="rl-handle"/>`).join('');
    $(el, '[data-l=pt]').innerHTML = ph;
    el.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === mode)));
    const top = Math.max(scr, f.scr * 2.5, 1e-9);
    $(el, '[data-o=bar]').style.width = (100 * Math.min(1, scr / top)) + '%';
    $(el, '[data-o=bar]').classList.toggle('rl-ok', scr <= f.scr * 1.01 + 1e-9);
    $(el, '[data-o=min]').style.left = (100 * f.scr / top) + '%';
    $(el, '[data-o=scr]').textContent = fmt(scr);
    $(el, '[data-o=smin]').textContent = fmt(f.scr);
    const gap = scr / Math.max(f.scr, 1e-9) - 1;
    $(el, '[data-o=out]').innerHTML = `Droite affichée : ŷ = ${fmt(cur.a)} ${cur.b < 0 ? '−' : '+'} ${fmt(Math.abs(cur.b))} x. ` +
      (mode === 'mco' || gap < 0.01 ? `<b>C'est la droite des moindres carrés</b> : <span class="rl-hat">β</span>₀ = ${fmt(f.a)}, <span class="rl-hat">β</span>₁ = ${fmt(f.b)}. Aucune autre droite n'a une aire totale plus petite. Remarque : les résidus sont de somme nulle (constante dans le modèle).`
        : `Sa SCR dépasse le minimum de <b>${fmt(100 * gap, 0)} %</b>. La droite en pointillés est celle des MCO : essaie de l'atteindre à la main, puis compare avec le bouton.`);
  };
  drag(s, p => {
    if (mode === 'libre') { const h = nearest(handles(), p, 26); if (h != null) return 'h' + h; }
    return nearest(pts.map(([x, y]) => [X(x), Y(y)]), p, 26);
  }, (h, p) => {
    stopT();
    const x = clamp((p.x - L) / k, 0.1, 9.9), y = clamp((B - p.y) / k, 0.1, ymax - 0.1);
    if (typeof h === 'string') {
      const [h1, h2] = [ln.a + ln.b * 1.5, ln.a + ln.b * 8.5], v = [h1, h2]; v[+h[1]] = y;
      ln = { b: (v[1] - v[0]) / 7, a: v[0] - (v[1] - v[0]) / 7 * 1.5 };
    } else pts[h] = [x, y];
    draw();
  });
  el.querySelectorAll('[data-m]').forEach(b => { b.onclick = () => { stopT(); if (b.dataset.m === 'libre' && mode === 'mco') { const f = simple(pts.map(p => p[0]), pts.map(p => p[1])); ln = { a: f.a + 1.6, b: f.b - 0.25 }; } mode = b.dataset.m; draw(); }; });
  $(el, '[data-i=go]').onclick = () => {
    stopT(); mode = 'libre';
    const f = simple(pts.map(p => p[0]), pts.map(p => p[1])), a0 = ln.a, b0 = ln.b;
    stopT = tween(el, 1400, u => { ln = { a: a0 + (f.a - a0) * u, b: b0 + (f.b - b0) * u }; draw(); });
  };
  $(el, '[data-i=new]').onclick = () => { stopT(); seed += 7; gen(); if (mode === 'libre') ln = { a: 5.2, b: -0.15 }; draw(); };
  draw();
}

/* ================================================================== 2. projection orthogonale Ŷ = P_X Y */
function projViz(el) {
  const W = 360, H = 250, cx = 180, cy = 150, k = 58, oc = 1.3, phi = 30 * Math.PI / 180, uid = 'rl' + (++UID);
  let th = 32, h = 1.6, C = [0.35, 2.3], stopT = () => {};
  const Yp = [1.9, 1.25];
  el.innerHTML = head('Ŷ est la projection orthogonale de Y sur Vect(X)', 'Déplace le point violet Xβ dans le plan : la distance à Y est minimale quand Xβ = Ŷ. Fais tourner la scène pour voir l\'angle droit.') +
    `<div class="viz-ctrl"><label>rotation <input type="range" min="0" max="359" step="1" value="${th}" data-i="th" aria-label="angle de vue"></label>
     <label>‖<span class="rl-hat">ε</span>‖ (hauteur de Y) = <b data-o="h"></b><input type="range" min="0.3" max="2.4" step="0.05" value="${h}" data-i="h" aria-label="hauteur de Y au-dessus du plan"></label>
     <span class="viz-btns"><button type="button" class="btn small" data-i="spin">${playLbl(false)}</button><button type="button" class="btn small primary" data-i="proj">Projeter : Xβ → Ŷ</button></span></div>
     <div class="rl-stage">${svg(W, H, `${arrowDefs(uid + 'a')}<g data-l="g"></g>`, 'Projection orthogonale de Y sur le plan engendré par les colonnes de X', 'rl-drag')}</div>
     <p class="viz-out" data-o="out"></p>`;
  const s = $(el, 'svg'), thI = $(el, '[data-i=th]'), hI = $(el, '[data-i=h]'), spinB = $(el, '[data-i=spin]');
  const P = (u0, v0, z) => { const u = u0 - oc, v = v0 - oc, t = th * Math.PI / 180, xr = u * Math.cos(t) - v * Math.sin(t), yr = u * Math.sin(t) + v * Math.cos(t); return [cx + k * xr, cy - k * (z * Math.cos(phi) + yr * Math.sin(phi))]; };
  const inv = (sx, sy) => { const t = th * Math.PI / 180, xr = (sx - cx) / k, yr = -(sy - cy) / (k * Math.sin(phi)); return [oc + xr * Math.cos(t) + yr * Math.sin(t), oc - xr * Math.sin(t) + yr * Math.cos(t)]; };
  const arrow = (a, b, cls) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" class="${cls}" marker-end="url(#${uid}a)"/>`;
  const draw = () => {
    let g = '';
    const corners = [[-0.6, -0.6], [3.2, -0.6], [3.2, 3.2], [-0.6, 3.2]].map(([u, v]) => P(u, v, 0));
    g += `<path d="${poly(corners)}Z" class="rl-plane"/>`;
    for (let i = 0; i <= 3; i++) { g += line(...P(i, -0.6, 0), ...P(i, 3.2, 0), 'class="rl-pgrid"') + line(...P(-0.6, i, 0), ...P(3.2, i, 0), 'class="rl-pgrid"'); }
    const lab = corners.reduce((a, b) => (b[0] > a[0] ? b : a)); g += tx(lab[0] - 6, lab[1] - 8, 'Vect(X)', 'end', 'rl-tplane');
    const O = P(0, 0, 0), c1 = P(1.4, 0, 0), c2 = P(0.55, 1.3, 0);
    g += arrow(O, c1, 'rl-vcol') + arrow(O, c2, 'rl-vcol') + tx(c1[0] + 4, c1[1] + 14, '𝟙', 'start', 'rl-tcol') + tx(c2[0] - 4, c2[1] - 6, 'x₁', 'end', 'rl-tcol');
    const Yh = P(Yp[0], Yp[1], 0), Yv = P(Yp[0], Yp[1], h), Cs = P(C[0], C[1], 0);
    // angle droit en Ŷ : direction vers O dans le plan et verticale
    const nrm = Math.hypot(Yp[0], Yp[1]), sz = 0.22, du = -Yp[0] / nrm * sz, dv = -Yp[1] / nrm * sz;
    g += `<path d="${poly([P(Yp[0] + du, Yp[1] + dv, 0), P(Yp[0] + du, Yp[1] + dv, sz), P(Yp[0], Yp[1], sz)])}" class="rl-right"/>`;
    g += line(...Cs, ...Yh, 'class="rl-cdist"') + line(...Cs, ...Yv, 'class="rl-cline"');
    g += arrow(O, Yv, 'rl-vY') + arrow(O, Yh, 'rl-vYh') + arrow(Yh, Yv, 'rl-vE');
    g += tx(Yv[0] + 8, Yv[1] - 4, 'Y', 'start', 'rl-tY') + tx(Yh[0] + 8, Yh[1] + 14, 'Ŷ = P<tspan dy="3" font-size="10">X</tspan><tspan dy="-3">Y</tspan>', 'start', 'rl-tYh');
    const mE = [(Yh[0] + Yv[0]) / 2, (Yh[1] + Yv[1]) / 2]; g += tx(mE[0] + 7, mE[1], shat('ε'), 'start', 'rl-tE');
    g += tx(O[0] - 6, O[1] + 14, 'O', 'end');
    g += `<circle cx="${Cs[0].toFixed(1)}" cy="${Cs[1].toFixed(1)}" r="22" class="rl-hit"/><circle cx="${Cs[0].toFixed(1)}" cy="${Cs[1].toFixed(1)}" r="7" class="rl-cand"/>` + tx(Cs[0] - 10, Cs[1] - 10, 'Xβ', 'end', 'rl-tcand');
    $(el, '[data-l=g]').innerHTML = g;
    const d2 = (C[0] - Yp[0]) ** 2 + (C[1] - Yp[1]) ** 2;
    $(el, '[data-o=h]').textContent = fmt(h);
    $(el, '[data-o=out]').innerHTML = `‖Y − Xβ‖² = ‖<span class="rl-hat">ε</span>‖² + ‖Ŷ − Xβ‖² = ${fmt(h * h)} + ${fmt(d2)} = <b>${fmt(h * h + d2)}</b> (Pythagore, car <span class="rl-hat">ε</span> est orthogonal au plan). ` +
      (d2 < 0.002 ? '<b>Xβ = Ŷ : la distance est minimale</b>, il reste seulement ‖<span class="rl-hat">ε</span>‖² = SCR. C\'est exactement β = <span class="rl-hat">β</span>.' : 'Ce n\'est pas le minimum : rapproche Xβ de Ŷ, ou clique « Projeter ».');
  };
  const spin = looper(el, 30, () => { th = (th + 1) % 360; thI.value = th; draw(); }, on => { spinB.textContent = playLbl(on); });
  drag(s, p => { const Cs = P(C[0], C[1], 0); return Math.hypot(Cs[0] - p.x, Cs[1] - p.y) < 28 ? 1 : null; }, (_, p) => { stopT(); const q = inv(p.x, p.y); C = [clamp(q[0], -0.5, 3.1), clamp(q[1], -0.5, 3.1)]; draw(); });
  thI.oninput = () => { spin.stop(); th = +thI.value; draw(); };
  hI.oninput = () => { h = +hI.value; draw(); };
  spinB.onclick = () => (spin.on ? spin.stop() : spin.start());
  $(el, '[data-i=proj]').onclick = () => { stopT(); const c0 = C.slice(); stopT = tween(el, 1100, u => { C = [c0[0] + (Yp[0] - c0[0]) * u, c0[1] + (Yp[1] - c0[1]) * u]; draw(); }); };
  draw();
}

/* ================================================================== 3. SCT = SCE + SCR, R² et R² ajusté */
function r2Viz(el) {
  const n = 20, r = rng(21), xs = Array.from({ length: n }, () => 0.5 + 9 * r()), z = xs.map(() => gauss(r)), Z = xs.map(() => Array.from({ length: 10 }, () => gauss(r)));
  const W = 360, H = 250, L = 34, R = 352, T = 10, B = 226;
  let sig = 1.6, kk = 0, part = 'sct';
  el.innerHTML = head('SCT = SCE + SCR : ce que mesure le R²', 'Choisis quels écarts afficher, change le bruit, puis ajoute des régresseurs inutiles (du pur bruit) : le R² monte quand même, pas le R² ajusté.') +
    `<div class="viz-ctrl"><span class="vz-seg" role="group" aria-label="écarts affichés"><button type="button" class="chip" data-p="sct">y − ȳ (total)</button><button type="button" class="chip" data-p="sce">ŷ − ȳ (expliqué)</button><button type="button" class="chip" data-p="scr">y − ŷ (résidu)</button></span></div>
     <div class="viz-ctrl"><label>bruit σ = <b data-o="sig"></b><input type="range" min="0.2" max="4" step="0.1" value="${sig}" data-i="sig" aria-label="écart-type du bruit"></label>
     <label>régresseurs inutiles = <b data-o="k"></b><input type="range" min="0" max="10" step="1" value="0" data-i="k" aria-label="nombre de régresseurs inutiles"></label></div>
     <div class="rl-stage">${svg(W, H, '<g data-l="g"></g>', 'Nuage de points, moyenne et valeurs ajustées')}</div>
     <div class="rl-stack" aria-hidden="true"><i class="rl-sce" data-o="bsce"></i><i class="rl-scr" data-o="bscr"></i></div>
     <div class="rl-stack-leg"><span><i class="rl-sw rl-sce"></i>SCE = <b data-o="sce"></b></span><span><i class="rl-sw rl-scr"></i>SCR = <b data-o="scr"></b></span><span>SCT = <b data-o="sct"></b></span></div>
     <div class="metrics rl-metrics"><div class="metric"><span>R²</span><b data-o="r2"></b></div><div class="metric"><span>R² ajusté</span><b data-o="r2a"></b></div><div class="metric"><span>p</span><b data-o="p"></b></div></div>
     <p class="viz-out" data-o="out"></p>`;
  const draw = () => {
    const ys = xs.map((x, i) => 2 + 0.8 * x + sig * z[i]), Xm = xs.map((x, i) => [1, x, ...Z[i].slice(0, kk)]);
    const f = ols(Xm, ys), ybar = ys.reduce((a, b) => a + b, 0) / n;
    const sct = ys.reduce((t, y) => t + (y - ybar) ** 2, 0), scr = f.res.reduce((t, e) => t + e * e, 0), sce = f.fit.reduce((t, v) => t + (v - ybar) ** 2, 0);
    const p = 1 + kk, R2 = sce / sct, R2a = 1 - (n - 1) / (n - p - 1) * scr / sct;
    const lo = Math.min(...ys, ...f.fit) - 0.5, hi = Math.max(...ys, ...f.fit) + 0.5;
    const X = x => L + x / 10 * (R - L), Y = y => B - (y - lo) / (hi - lo) * (B - T);
    let g = `<path d="M${L},${T}V${B}H${R}" class="vz-axis"/>` + line(L, Y(ybar), R, Y(ybar), 'class="rl-mean"') + tx(R - 2, Y(ybar) - 5, 'ȳ', 'end', 'rl-tmean');
    for (let x = 0; x <= 10; x += 2) g += tx(X(x), B + 16, x, 'middle');
    if (kk === 0) g += line(X(0), Y(f.beta[0]), X(10), Y(f.beta[0] + f.beta[1] * 10), 'class="rl-line rl-line-mco"');
    xs.forEach((x, i) => {
      const y = ys[i], yh = f.fit[i], [a, b, cls] = part === 'sct' ? [y, ybar, 'rl-dev-t'] : part === 'sce' ? [yh, ybar, 'rl-dev-e'] : [y, yh, 'rl-dev-r'];
      g += line(X(x), Y(a), X(x), Y(b), `class="${cls}"`);
    });
    xs.forEach((x, i) => { g += `<circle cx="${X(x).toFixed(1)}" cy="${Y(ys[i]).toFixed(1)}" r="4.5" class="rl-pt"/>`; if (kk > 0) g += `<path d="M${X(x).toFixed(1)},${(Y(f.fit[i]) - 5).toFixed(1)}l5,5l-5,5l-5,-5z" class="rl-fit"/>`; });
    g += kk ? tx(L + 6, T + 12, '◇ valeurs ajustées ŷᵢ (plus sur une droite)', 'start', 'vz-s') : tx(L + 6, T + 12, 'droite ajustée', 'start', 'vz-s rl-tline');
    $(el, '[data-l=g]').innerHTML = g;
    $(el, '[data-o=bsce]').style.flexGrow = sce; $(el, '[data-o=bscr]').style.flexGrow = scr;
    $(el, '[data-o=sce]').textContent = fmt(sce, 1); $(el, '[data-o=scr]').textContent = fmt(scr, 1); $(el, '[data-o=sct]').textContent = fmt(sct, 1);
    $(el, '[data-o=r2]').textContent = fmt(R2, 3); $(el, '[data-o=r2a]').textContent = fmt(R2a, 3); $(el, '[data-o=p]').textContent = p;
    $(el, '[data-o=sig]').textContent = fmt(sig, 1); $(el, '[data-o=k]').textContent = kk;
    el.querySelectorAll('[data-p]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.p === part)));
    const txt = { sct: 'Les segments gris sont les écarts y − ȳ : SCT est la somme de leurs carrés, la variation totale à expliquer.', sce: 'Les segments bleus vont de ȳ aux valeurs ajustées : SCE est la part de variation reproduite par le modèle.', scr: 'Les segments rouges sont les résidus : SCR est ce qui reste inexpliqué.' }[part];
    $(el, '[data-o=out]').innerHTML = `${txt} Ici ${fmt(sct, 1)} = ${fmt(sce, 1)} + ${fmt(scr, 1)} (Pythagore) et R² = SCE/SCT = <b>${fmt(R2, 3)}</b>. ` +
      (kk ? `Avec ${kk} régresseur${kk > 1 ? 's' : ''} sans aucun lien avec y, le R² a quand même augmenté ; le R² ajusté = 1 − (n−1)/(n−p−1) · SCR/SCT, lui, pénalise p = ${p} : ${fmt(R2a, 3)}.` : 'Plus σ est grand, plus SCR pèse dans SCT et plus le R² baisse, alors que la vraie pente (0,8) ne change pas.');
  };
  el.querySelectorAll('[data-p]').forEach(b => { b.onclick = () => { part = b.dataset.p; const g = $(el, '[data-l=g]'); g.classList.remove('rl-pop'); void g.getBoundingClientRect(); g.classList.add('rl-pop'); draw(); }; });
  $(el, '[data-i=sig]').oninput = e => { sig = +e.target.value; draw(); };
  $(el, '[data-i=k]').oninput = e => { kk = +e.target.value; draw(); };
  draw();
}

/* ================================================================== 4. test de Student */
function studentViz(el) {
  const W = 360, H = 236, L = 14, R = 346, T = 22, B = 202, xr = 6;
  let nu = 5, alpha = 0.05, Tv = 2.0, stopT = () => {};
  el.innerHTML = head('Test de Student : où tombe T ?', 'Fais glisser T (ou le curseur) : la zone rouge est la région de rejet au niveau α, la zone bleue la p-valeur bilatérale.') +
    `<div class="viz-ctrl"><label>T observé = <b data-o="t"></b><input type="range" min="-6" max="6" step="0.01" value="${Tv}" data-i="t" aria-label="valeur observée de T"></label>
     <label>ddl n − p − 1 = <b data-o="nu"></b><input type="range" min="1" max="60" step="1" value="${nu}" data-i="nu" aria-label="degrés de liberté"></label>
     <span class="vz-seg" role="group" aria-label="niveau α">${[0.1, 0.05, 0.01].map(a => `<button type="button" class="chip" data-a="${a}">α = ${fmt(100 * a, 0)} %</button>`).join('')}</span></div>
     <div class="viz-ctrl"><span class="rl-lab">Données longley (ddl = 5) :</span><span class="viz-btns">${[['β₀', 4.471], ['β₁', 3.369], ['β₂', -2.391]].map(([n_, v]) => `<button type="button" class="btn small" data-pre="${v}">${n_} : T = ${fmt(v, 3)}</button>`).join('')}</span></div>
     <div class="rl-stage">${svg(W, H, '<g data-l="g"></g>', 'Densité de Student, région de rejet et p-valeur', 'rl-drag')}</div>
     <p class="viz-out" data-o="out"></p>`;
  const s = $(el, 'svg'), tI = $(el, '[data-i=t]'), nI = $(el, '[data-i=nu]');
  const X = t => L + (t + xr) / (2 * xr) * (R - L);
  const draw = () => {
    const ymax = 0.42, Y = d => B - d / ymax * (B - T), q = tq(1 - alpha / 2, nu), at = Math.abs(Tv), pv = 2 * (1 - tcdf(at, nu));
    const area = (a, b) => { const pts = [[X(a), B]]; for (let i = 0; i <= 60; i++) { const t = a + (b - a) * i / 60; pts.push([X(t), Y(tpdf(t, nu))]); } pts.push([X(b), B]); return poly(pts) + 'Z'; };
    let g = '';
    g += `<path d="${area(-xr, -q)}" class="rl-rej"/><path d="${area(q, xr)}" class="rl-rej"/>`;
    if (at < xr) g += `<path d="${area(-xr, -at)}" class="rl-pv"/><path d="${area(at, xr)}" class="rl-pv"/>`;
    const curve = Array.from({ length: 241 }, (_, i) => { const t = -xr + 2 * xr * i / 240; return [X(t), Y(tpdf(t, nu))]; });
    const nrm = Array.from({ length: 241 }, (_, i) => { const t = -xr + 2 * xr * i / 240; return [X(t), Y(Math.exp(-t * t / 2) / Math.sqrt(2 * Math.PI))]; });
    g += `<path d="${poly(nrm)}" class="rl-norm"/><path d="${poly(curve)}" class="rl-dens"/>`;
    g += line(L, B, R, B, 'class="vz-axis"');
    for (let t = -6; t <= 6; t += 2) g += tx(X(t), B + 15, t, 'middle');
    g += line(X(q), B, X(q), T + 34, 'class="rl-crit"') + line(X(-q), B, X(-q), T + 34, 'class="rl-crit"');
    g += tx(X(q) + 3, T + 32, `t = ${fmt(q, 3)}`, 'start', 'vz-s rl-tcrit') + tx(X(-q) - 3, T + 32, `−${fmt(q, 3)}`, 'end', 'vz-s rl-tcrit');
    const tc = clamp(Tv, -xr, xr);
    g += line(X(-tc), B, X(-tc), Y(tpdf(tc, nu)) - 6, 'class="rl-tobs-m"');
    g += line(X(tc), B + 2, X(tc), T + 2, 'class="rl-tobs"') + `<circle cx="${X(tc).toFixed(1)}" cy="${B}" r="22" class="rl-hit"/><path d="M${X(tc).toFixed(1)},${B - 2}l-8,13h16z" class="rl-tri"/>` + tx(clamp(X(tc), L + 34, R - 34), T - 2, `T = ${fmt(Tv, 2)}`, 'middle', 'rl-ttobs');
    g += tx(R, T + 40, 'Student(' + nu + ')', 'end', 'vz-s rl-tdens') + tx(R, T + 54, '-- N(0, 1)', 'end', 'vz-s');
    $(el, '[data-l=g]').innerHTML = g;
    $(el, '[data-o=t]').textContent = fmt(Tv, 2); $(el, '[data-o=nu]').textContent = nu;
    el.querySelectorAll('[data-a]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.a === alpha)));
    const rej = at > q;
    $(el, '[data-o=out]').innerHTML = `Quantile t<sub>${nu}</sub>(1 − α/2) = ${fmt(q, 3)} ; p-valeur = P(|T| ≥ ${fmt(at, 2)}) = <b>${pval(pv)}</b>. ` +
      (rej ? `<b class="rl-bad">|T| > ${fmt(q, 3)} : on rejette H₀ : β = 0</b> au niveau ${fmt(100 * alpha, 0)} % (p-valeur &lt; α), le coefficient est significatif.` : `<b class="rl-good">|T| ≤ ${fmt(q, 3)} : on ne rejette pas H₀</b> au niveau ${fmt(100 * alpha, 0)} % (p-valeur ≥ α).`) +
      (nu <= 5 ? ' Avec peu de degrés de liberté, les queues de Student sont plus épaisses que celles de N(0, 1) : le seuil est plus loin que 1,96.' : nu >= 30 ? ' Avec beaucoup de ddl, Student(ν) ≈ N(0, 1) et le seuil approche 1,96 (à 5 %).' : '');
  };
  const setT = v => { Tv = clamp(v, -6, 6); tI.value = Tv; draw(); };
  drag(s, p => (Math.abs(p.x - X(Tv)) < 28 && p.y > T + 10 ? 1 : null), (_, p) => { stopT(); setT(Math.round(((p.x - L) / (R - L) * 2 * xr - xr) * 100) / 100); });
  tI.oninput = () => { stopT(); setT(+tI.value); };
  nI.oninput = () => { nu = +nI.value; draw(); };
  el.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => { alpha = +b.dataset.a; draw(); }; });
  el.querySelectorAll('[data-pre]').forEach(b => { b.onclick = () => { stopT(); nu = 5; nI.value = 5; alpha = 0.05; const a = Tv, z = +b.dataset.pre; stopT = tween(el, 900, u => setT(a + (z - a) * u)); }; });
  draw();
}

/* ================================================================== 5. test de Fisher (modèle complet ou réduit) */
function fisherViz(el) {
  const W = 360, H = 226, L = 14, R = 346, T = 22, B = 196;
  const st = { mode: 'complet', R2: 0.7655, R2q: 0.0617, n: 10, p: 3, q: 2 };
  let stopT = () => {};
  el.innerHTML = head('Test de Fisher : le modèle explique-t-il quelque chose ?', 'Règle R², n et p : la statistique F se place sur la densité de Fisher ; au-delà du seuil rouge, on rejette H₀.') +
    `<div class="viz-ctrl"><span class="vz-seg" role="group" aria-label="type de test"><button type="button" class="chip" data-m="complet">Modèle complet</button><button type="button" class="chip" data-m="reduit">Modèle réduit</button></span>
     <span class="viz-btns"><button type="button" class="btn small" data-pre="c">Exemple 4.4 complet</button><button type="button" class="btn small" data-pre="r">Exemple 4.4 : β₁ = β₂ = 0</button></span></div>
     <div class="viz-ctrl"><label>R² = <b data-o="R2"></b><input type="range" min="0" max="0.99" step="0.0005" data-i="R2" aria-label="R² du modèle complet"></label>
     <label data-red>R²<sub>q</sub> = <b data-o="R2q"></b><input type="range" min="0" max="0.99" step="0.0005" data-i="R2q" aria-label="R² du modèle réduit"></label>
     <label>n = <b data-o="n"></b><input type="range" min="4" max="80" step="1" data-i="n" aria-label="nombre d'observations"></label>
     <label>p = <b data-o="p"></b><input type="range" min="1" max="10" step="1" data-i="p" aria-label="nombre de régresseurs"></label>
     <label data-red>q = <b data-o="q"></b><input type="range" min="1" max="10" step="1" data-i="q" aria-label="nombre de coefficients testés"></label></div>
     <div class="rl-stage">${svg(W, H, '<g data-l="g"></g>', 'Densité de Fisher, seuil et statistique observée')}</div>
     <p class="viz-out" data-o="out"></p>`;
  const I = k => $(el, `[data-i=${k}]`);
  const sync = () => { ['R2', 'R2q', 'n', 'p', 'q'].forEach(k => { I(k).value = st[k]; }); };
  const draw = () => {
    const red = st.mode === 'reduit';
    st.n = Math.max(st.n, st.p + 2); st.q = Math.min(st.q, st.p); st.R2q = Math.min(st.R2q, st.R2);
    const d2 = st.n - st.p - 1, d1 = red ? st.q : st.p;
    const F = red ? ((st.R2 - st.R2q) / st.q) / ((1 - st.R2) / d2) : (st.R2 / st.p) / ((1 - st.R2) / d2);
    const q95 = invcdf(x => fcdf(x, d1, d2), 0.95, 0, 1e4), pv = 1 - fcdf(F, d1, d2);
    const xm = Math.min(40, Math.max(6, q95 * 1.6, F * 1.15)), X = x => L + x / xm * (R - L);
    let ymax = 0; for (let i = 1; i <= 200; i++) { const x = xm * i / 200; if (x > 0.12) ymax = Math.max(ymax, fpdf(x, d1, d2)); }
    ymax = Math.max(ymax, 0.05) * 1.12; const Y = d => Math.max(T, B - d / ymax * (B - T));
    const area = (a, b) => { const pts = [[X(a), B]]; for (let i = 0; i <= 80; i++) { const x = a + (b - a) * i / 80; pts.push([X(x), Y(fpdf(Math.max(x, 1e-4), d1, d2))]); } pts.push([X(b), B]); return poly(pts) + 'Z'; };
    let g = '';
    if (q95 < xm) g += `<path d="${area(q95, xm)}" class="rl-rej"/>`;
    if (F < xm) g += `<path d="${area(Math.max(F, 1e-4), xm)}" class="rl-pv"/>`;
    g += `<path d="${poly(Array.from({ length: 301 }, (_, i) => { const x = Math.max(1e-4, xm * i / 300); return [X(x), Y(fpdf(x, d1, d2))]; }))}" class="rl-dens"/>`;
    g += line(L, B, R, B, 'class="vz-axis"');
    const stp = xm > 20 ? 5 : xm > 10 ? 2 : 1; for (let x = 0; x <= xm; x += stp) g += tx(X(x), B + 15, x, 'middle');
    if (q95 < xm) g += line(X(q95), B, X(q95), T + 34, 'class="rl-crit"') + tx(X(q95) + 3, T + 32, `f = ${fmt(q95, 3)}`, 'start', 'vz-s rl-tcrit');
    const Fx = X(Math.min(F, xm)); g += line(Fx, B + 2, Fx, T + 2, 'class="rl-tobs"') + `<path d="M${Fx.toFixed(1)},${B - 2}l-8,13h16z" class="rl-tri"/>` + tx(clamp(Fx, L + 40, R - 40), T - 2, `F = ${fmt(F, 3)}${F > xm ? ' →' : ''}`, 'middle', 'rl-ttobs');
    g += tx(R, T + 44, `loi F(${d1}, ${d2})`, 'end', 'vz-s rl-tdens');
    $(el, '[data-l=g]').innerHTML = g;
    ['R2', 'R2q'].forEach(k => { $(el, `[data-o=${k}]`).textContent = fmt(st[k], 4); });
    ['n', 'p', 'q'].forEach(k => { $(el, `[data-o=${k}]`).textContent = st[k]; });
    el.querySelectorAll('[data-red]').forEach(l => { l.hidden = !red; });
    el.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === st.mode)));
    const formula = red ? `F<sub>q</sub> = [(R² − R²<sub>q</sub>)/q] / [(1 − R²)/(n − p − 1)] = [(${fmt(st.R2, 4)} − ${fmt(st.R2q, 4)})/${st.q}] / [${fmt(1 - st.R2, 4)}/${d2}]` : `F = [R²/p] / [(1 − R²)/(n − p − 1)] = [${fmt(st.R2, 4)}/${st.p}] / [${fmt(1 - st.R2, 4)}/${d2}]`;
    $(el, '[data-o=out]').innerHTML = `${formula} = <b>${fmt(F, 3)}</b>, à comparer à f<sub>${d1},${d2}</sub>(0,95) = ${fmt(q95, 3)} ; p-valeur = ${pval(pv)}. ` +
      (F > q95 ? `<b class="rl-bad">On rejette H₀</b> (${red ? `β₁ = … = β<sub>q</sub> = 0` : 'β₁ = … = β<sub>p</sub> = 0'}) au niveau 5 %.` : `<b class="rl-good">On ne rejette pas H₀</b> au niveau 5 %.`) +
      (red && st.q === 1 ? ' Avec q = 1, F est le carré du T de Student : les deux tests coïncident.' : '') + (!red ? ' Rappel : ce test rejette dès qu\'une seule variable est liée à Y.' : '');
  };
  el.querySelectorAll('[data-m]').forEach(b => { b.onclick = () => { st.mode = b.dataset.m; draw(); }; });
  ['R2', 'R2q', 'n', 'p', 'q'].forEach(k => { I(k).oninput = () => { stopT(); st[k] = +I(k).value; draw(); sync(); }; });
  el.querySelectorAll('[data-pre]').forEach(b => { b.onclick = () => {
    stopT(); const tgt = b.dataset.pre === 'c' ? { mode: 'complet', R2: 0.7655, n: 10, p: 3 } : { mode: 'reduit', R2: 0.7655, R2q: 0.0617, n: 10, p: 3, q: 2 };
    st.mode = tgt.mode; st.n = tgt.n; st.p = tgt.p; if (tgt.q) st.q = tgt.q; const a = st.R2, aq = st.R2q;
    stopT = tween(el, 800, u => { st.R2 = a + (tgt.R2 - a) * u; if (tgt.R2q != null) st.R2q = aq + (tgt.R2q - aq) * u; draw(); sync(); });
  }; });
  sync(); draw();
}

/* ================================================================== 6. intervalles de confiance et de prévision */
function icViz(el) {
  const W = 360, H = 270, L = 30, R = 352, T = 10, B = 244, xlo = -2, xhi = 12, ylo = -3, yhi = 11, sigma = 1;
  const X = x => L + (x - xlo) / (xhi - xlo) * (R - L), Y = y => B - (y - ylo) / (yhi - ylo) * (B - T);
  let n = 10, x0 = 7, seed = 5, data = null, sims = [], run = null;
  const uid = 'rlic' + (++UID);
  const gen = () => { const r = rng(seed); const xs = Array.from({ length: n }, () => 1 + 7 * r()); data = { xs, ys: xs.map(x => 1 + 0.6 * x + sigma * gauss(r)) }; sims = []; };
  gen();
  el.innerHTML = head('Intervalle de confiance et intervalle de prévision', 'Déplace x₀ : la bande intérieure encadre la droite moyenne E(Y₀), la bande extérieure une nouvelle observation Y₀. Simule pour vérifier les 95 %.') +
    `<div class="viz-ctrl"><label>n = <b data-o="n"></b><input type="range" min="4" max="40" step="1" value="${n}" data-i="n" aria-label="taille de l'échantillon"></label>
     <label>x₀ = <b data-o="x0"></b><input type="range" min="-2" max="12" step="0.05" value="${x0}" data-i="x0" aria-label="point de prévision"></label>
     <span class="viz-btns"><button type="button" class="btn small primary" data-i="sim">${playLbl(false)} 40 simulations</button><button type="button" class="btn small" data-i="new">Nouvel échantillon</button></span></div>
     <div class="rl-stage">${svg(W, H, '<g data-l="g"></g>', 'Droite ajustée, bande de confiance et bande de prévision', 'rl-drag')}</div>
     <div class="viz-leg"><span><i class="sw" style="--sw:var(--accent)"></i>IC de E(Y₀) : ŷ₀ ∓ t <span class="rl-hat">σ</span> √(v₀ᵀ(XᵀX)⁻¹v₀)</span><span><i class="sw" style="--sw:var(--warn)"></i>prévision : ŷ₀ ∓ t <span class="rl-hat">σ</span> √(1 + v₀ᵀ(XᵀX)⁻¹v₀)</span><span><i class="sw sw-d" style="--sw:var(--ink-2)"></i>vraie droite</span></div>
     <p class="viz-out" data-o="out"></p>`;
  const s = $(el, 'svg'), simB = $(el, '[data-i=sim]');
  const fitOf = (xs, ys) => { const f = simple(xs, ys), m = xs.length, s2 = f.scr / (m - 2); return { ...f, m, sh: Math.sqrt(s2), q: tq(0.975, m - 2) }; };
  const band = (f, x, pred) => f.q * f.sh * Math.sqrt((pred ? 1 : 0) + 1 / f.m + (x - f.mx) ** 2 / f.sxx);
  const draw = () => {
    const f = fitOf(data.xs, data.ys);
    const xsG = Array.from({ length: 71 }, (_, i) => xlo + (xhi - xlo) * i / 70);
    const bandPath = pred => { const up = xsG.map(x => [X(x), Y(f.a + f.b * x + band(f, x, pred))]), dn = xsG.slice().reverse().map(x => [X(x), Y(f.a + f.b * x - band(f, x, pred))]); return poly(up.concat(dn)) + 'Z'; };
    let g = `<defs><clipPath id="${uid}"><rect x="${L}" y="${T}" width="${R - L}" height="${B - T}"/></clipPath></defs>`;
    g += `<path d="M${L},${T}V${B}H${R}" class="vz-axis"/>`;
    for (let x = 0; x <= 12; x += 2) g += tx(X(x), B + 16, x, 'middle');
    for (let y = 0; y <= 10; y += 5) g += tx(L - 5, Y(y) + 4, y, 'end') + line(L, Y(y), R, Y(y), 'class="vz-grid"');
    g += `<g clip-path="url(#${uid})">`;
    g += `<rect x="${X(1)}" y="${T}" width="${X(8) - X(1)}" height="${B - T}" class="rl-dom"/>`;
    g += `<path d="${bandPath(true)}" class="rl-band-p"/><path d="${bandPath(false)}" class="rl-band-c"/>`;
    sims.forEach(sm => { g += line(X(xlo), Y(sm.a + sm.b * xlo), X(xhi), Y(sm.a + sm.b * xhi), 'class="rl-ghost-l"'); });
    g += line(X(xlo), Y(1 + 0.6 * xlo), X(xhi), Y(1 + 0.6 * xhi), 'class="rl-true"');
    g += line(X(xlo), Y(f.a + f.b * xlo), X(xhi), Y(f.a + f.b * xhi), 'class="rl-line rl-line-mco"');
    g += '</g>';
    g += tx(X(4.5), T + 12, 'domaine des données', 'middle', 'vz-s');
    data.xs.forEach((x, i) => { g += `<circle cx="${X(x).toFixed(1)}" cy="${Y(data.ys[i]).toFixed(1)}" r="4.5" class="rl-pt"/>`; });
    const yh = f.a + f.b * x0, bc = band(f, x0, false), bp = band(f, x0, true);
    g += line(X(x0), T, X(x0), B, 'class="rl-x0"');
    g += `<rect x="${(X(x0) - 4).toFixed(1)}" y="${Y(yh + bp).toFixed(1)}" width="8" height="${(Y(yh - bp) - Y(yh + bp)).toFixed(1)}" rx="3" class="rl-ip"/><rect x="${(X(x0) - 4).toFixed(1)}" y="${Y(yh + bc).toFixed(1)}" width="8" height="${(Y(yh - bc) - Y(yh + bc)).toFixed(1)}" rx="3" class="rl-ic"/>`;
    sims.forEach(sm => { g += `<circle cx="${(X(x0) + 12 + (sm.i % 4) * 4).toFixed(1)}" cy="${Y(sm.y0).toFixed(1)}" r="3" class="${sm.inP ? 'rl-in' : 'rl-out'}"/>`; });
    g += `<circle cx="${X(x0).toFixed(1)}" cy="${B}" r="22" class="rl-hit"/><path d="M${X(x0).toFixed(1)},${B - 3}l-8,14h16z" class="rl-tri"/>`;
    $(el, '[data-l=g]').innerHTML = g;
    $(el, '[data-o=n]').textContent = n; $(el, '[data-o=x0]').textContent = fmt(x0, 2);
    const inC = sims.filter(sm => sm.inC).length, inP = sims.filter(sm => sm.inP).length;
    $(el, '[data-o=out]').innerHTML = `En x₀ = ${fmt(x0, 1)} : ŷ₀ = ${fmt(yh)} ; IC à 95 % de E(Y₀) = [${fmt(yh - bc)} ; ${fmt(yh + bc)}] ; intervalle de prévision = [<b>${fmt(yh - bp)} ; ${fmt(yh + bp)}</b>] (t<sub>${n - 2}</sub>(0,975) = ${fmt(f.q, 3)}). ` +
      'Les deux bandes sont les plus étroites en x̄ et s\'évasent quand x₀ s\'éloigne des données : extrapoler est risqué. Quand n grandit, la bande intérieure se resserre vers la droite, mais la bande extérieure garde au moins la largeur ±t <span class="rl-hat">σ</span> : le « 1 + » est le bruit de la nouvelle observation. ' +
      (sims.length ? `<br>Sur ${sims.length} échantillons simulés : la vraie moyenne était dans l'IC <b>${inC}</b> fois, la nouvelle observation Y₀ (points verts/rouges) dans l'intervalle de prévision <b>${inP}</b> fois (${pct(inP / sims.length)}).` : '');
  };
  let k = 0;
  run = looper(el, 140, () => {
    if (sims.length >= 40) return false;
    const r = rng(seed * 1000 + 17 + k++), ys = data.xs.map(x => 1 + 0.6 * x + sigma * gauss(r)), f = fitOf(data.xs, ys), y0 = 1 + 0.6 * x0 + sigma * gauss(r), yh = f.a + f.b * x0;
    sims.push({ a: f.a, b: f.b, i: sims.length, y0, inP: Math.abs(y0 - yh) <= band(f, x0, true), inC: Math.abs(1 + 0.6 * x0 - yh) <= band(f, x0, false) });
    draw();
  }, on => { simB.textContent = `${playLbl(on)} 40 simulations`; });
  drag(s, p => (Math.abs(p.x - X(x0)) < 26 ? 1 : null), (_, p) => { run.stop(); sims = []; x0 = clamp(Math.round(((p.x - L) / (R - L) * (xhi - xlo) + xlo) * 20) / 20, xlo, xhi); $(el, '[data-i=x0]').value = x0; draw(); });
  $(el, '[data-i=n]').oninput = e => { run.stop(); n = +e.target.value; gen(); draw(); };
  $(el, '[data-i=x0]').oninput = e => { run.stop(); sims = []; x0 = +e.target.value; draw(); };
  $(el, '[data-i=new]').onclick = () => { run.stop(); seed += 3; gen(); draw(); };
  simB.onclick = () => { if (run.on) { run.stop(); return; } if (sims.length >= 40) sims = []; run.start(); };
  draw();
}

/* ================================================================== 7. colinéarité : VIF et nuage des β̂ */
function colinViz(el) {
  const n = 30, NS = 220, r = rng(31), z1 = Array.from({ length: n }, () => gauss(r)), z2 = Array.from({ length: n }, () => gauss(r));
  const E = Array.from({ length: NS }, () => Array.from({ length: n }, () => gauss(r)));
  let rho = 0.8, shown = NS;
  el.innerHTML = head('Colinéarité : quand les <span class="rl-hat">β</span> deviennent instables', 'Augmente la corrélation ρ entre x₁ et x₂. Chaque point de droite est le couple (<span class="rl-hat">β</span>₁, <span class="rl-hat">β</span>₂) estimé sur un nouvel échantillon (vrais β₁ = β₂ = 1).') +
    `<div class="viz-ctrl"><label>ρ = <b data-o="rho"></b><input type="range" min="0" max="0.99" step="0.01" value="${rho}" data-i="rho" aria-label="corrélation entre x1 et x2"></label>
     <span class="viz-btns"><button type="button" class="btn small primary" data-i="play">▶ Rejouer les ${NS} échantillons</button></span></div>
     <div class="grid2 rl-g2"><div>${svg(250, 250, '<g data-l="x"></g>', 'Nuage des deux covariables', 'rl-small')}</div><div>${svg(300, 300, '<g data-l="b"></g>', 'Nuage des estimations de beta1 et beta2')}</div></div>
     <div class="metrics rl-metrics"><div class="metric"><span>r observé</span><b data-o="r"></b></div><div class="metric"><span>VIF = 1/(1 − r²)</span><b data-o="vif"></b></div><div class="metric"><span>écart-type de <span class="rl-hat">β</span>₁</span><b data-o="sd"></b></div><div class="metric"><span>κ(X) centré</span><b data-o="kap"></b></div></div>
     <p class="viz-out" data-o="out"></p>`;
  const draw = () => {
    const c = Math.sqrt(1 - rho * rho), x1 = z1, x2 = z1.map((v, i) => rho * v + c * z2[i]);
    const Xm = x1.map((v, i) => [1, v, x2[i]]);
    // nuage des covariables
    const S = 250, m = 22, sx = v => S / 2 + v * (S / 2 - m) / 3, sy = v => S / 2 - v * (S / 2 - m) / 3;
    let gx = `<rect x="${m}" y="${m}" width="${S - 2 * m}" height="${S - 2 * m}" class="rl-frame"/>` + line(sx(0), m, sx(0), S - m, 'class="vz-grid"') + line(m, sy(0), S - m, sy(0), 'class="vz-grid"');
    x1.forEach((v, i) => { gx += `<circle cx="${sx(v).toFixed(1)}" cy="${sy(x2[i]).toFixed(1)}" r="3.5" class="rl-pt"/>`; });
    gx += tx(S - m, S - 6, 'x₁', 'end') + tx(6, m + 4, 'x₂');
    $(el, '[data-l=x]').innerHTML = gx;
    // estimations
    const XtX = [0, 1, 2].map(a => [0, 1, 2].map(b => Xm.reduce((t, rw) => t + rw[a] * rw[b], 0))), Inv = inverse(XtX);
    const H = Xm.map(rw => { const v = Inv.map(row => row.reduce((t, q, j) => t + q * rw[j], 0)); return v; }); // lignes de (XᵀX)⁻¹Xᵀ transposées
    const bs = E.slice(0, shown).map(eps => { const y = x1.map((v, i) => 1 + v + x2[i] + eps[i]); const b = [0, 0, 0]; H.forEach((h, i) => { for (let j = 0; j < 3; j++) b[j] += h[j] * y[i]; }); return b; });
    const P = 300, pm = 26, lo = -3, hi = 5, bx = v => pm + (v - lo) / (hi - lo) * (P - 2 * pm), by = v => P - pm - (v - lo) / (hi - lo) * (P - 2 * pm);
    let gb = `<rect x="${pm}" y="${pm}" width="${P - 2 * pm}" height="${P - 2 * pm}" class="rl-frame"/>`;
    for (let v = -2; v <= 4; v += 2) gb += line(bx(v), pm, bx(v), P - pm, 'class="vz-grid"') + line(pm, by(v), P - pm, by(v), 'class="vz-grid"') + tx(bx(v), P - pm + 15, v, 'middle') + tx(pm - 5, by(v) + 4, v, 'end');
    // ellipse de confiance à 95 % : σ²·(XᵀX)⁻¹ restreinte à (β₁, β₂), rayon √χ²₂(0,95)
    const a = Inv[1][1], b = Inv[1][2], d = Inv[2][2], tr = a + d, det = a * d - b * b, l1 = tr / 2 + Math.sqrt(tr * tr / 4 - det), l2 = tr / 2 - Math.sqrt(Math.max(0, tr * tr / 4 - det));
    const ang = Math.abs(b) < 1e-12 ? 0 : Math.atan2(l1 - a, b), rad = Math.sqrt(5.991);
    const ell = Array.from({ length: 73 }, (_, i) => { const t = i / 72 * 2 * Math.PI, u = rad * Math.sqrt(l1) * Math.cos(t), v = rad * Math.sqrt(Math.max(l2, 0)) * Math.sin(t); return [bx(1 + u * Math.cos(ang) - v * Math.sin(ang)), by(1 + u * Math.sin(ang) + v * Math.cos(ang))]; });
    gb += `<path d="${poly(ell)}Z" class="rl-ell"/>`;
    bs.forEach((bb, i) => { if (bb[1] > lo && bb[1] < hi && bb[2] > lo && bb[2] < hi) gb += `<circle cx="${bx(bb[1]).toFixed(1)}" cy="${by(bb[2]).toFixed(1)}" r="2.6" class="rl-est${i === shown - 1 && shown < NS ? ' rl-est-new' : ''}"/>`; });
    gb += `<circle cx="${bx(1)}" cy="${by(1)}" r="5" class="rl-truth"/>` + tx(P - pm, P - 6, shat('β', '₁'), 'end') + tx(6, pm - 8, shat('β', '₂'));
    $(el, '[data-l=b]').innerHTML = gb;
    const mx1 = x1.reduce((s_, v) => s_ + v, 0) / n, mx2 = x2.reduce((s_, v) => s_ + v, 0) / n;
    let s11 = 0, s22 = 0, s12 = 0; x1.forEach((v, i) => { s11 += (v - mx1) ** 2; s22 += (x2[i] - mx2) ** 2; s12 += (v - mx1) * (x2[i] - mx2); });
    const rr = s12 / Math.sqrt(s11 * s22), vif = 1 / (1 - rr * rr);
    const C = [[s11, s12], [s12, s22]], ct = s11 + s22, cd = s11 * s22 - s12 * s12, e1 = ct / 2 + Math.sqrt(ct * ct / 4 - cd), e2 = ct / 2 - Math.sqrt(Math.max(0, ct * ct / 4 - cd));
    void C;
    $(el, '[data-o=rho]').textContent = fmt(rho, 2); $(el, '[data-o=r]').textContent = fmt(rr, 3); $(el, '[data-o=vif]').textContent = fmt(vif, vif > 100 ? 0 : 2);
    $(el, '[data-o=sd]').textContent = fmt(Math.sqrt(Inv[1][1]), 3); $(el, '[data-o=kap]').textContent = fmt(Math.sqrt(e1 / Math.max(e2, 1e-12)), 1);
    $(el, '[data-o=out]').innerHTML = `Var(<span class="rl-hat">β</span>₁) = σ² [(XᵀX)⁻¹]₂₂ est multipliée par VIF = <b>${fmt(vif, vif > 100 ? 0 : 2)}</b> par rapport à des covariables non corrélées. ` +
      (vif > 10 ? '<b class="rl-bad">Colinéarité sévère</b> : le nuage des <span class="rl-hat">β</span> s\'étire le long de la droite <span class="rl-hat">β</span>₁ + <span class="rl-hat">β</span>₂ ≈ 2. Le modèle sait que la <i>somme</i> des effets vaut 2, mais ne sait plus les séparer : les estimations individuelles sont instables, de signes parfois faux, alors que les prévisions restent bonnes.'
        : vif > 5 ? '<b class="rl-warnt">Colinéarité notable</b> (VIF > 5) : l\'ellipse s\'allonge et s\'incline, les estimations deviennent négativement corrélées.'
          : vif > 1.5 ? 'Colinéarité modérée : le nuage reste centré sur la vraie valeur (1, 1) mais s\'étire déjà en biais, conformément à l\'ellipse de confiance à 95 % σ²(XᵀX)⁻¹. Pousse ρ au-delà de 0,9.'
          : 'Peu de colinéarité : le nuage reste rond et serré autour de la vraie valeur (1, 1), en accord avec l\'ellipse de confiance à 95 % σ²(XᵀX)⁻¹.');
  };
  const btn = $(el, '[data-i=play]');
  const play = looper(el, 16, () => { if (shown >= NS) return false; shown = Math.min(NS, shown + 2); draw(); }, on => { btn.textContent = `${on ? '❚❚ Pause' : '▶ Rejouer'} les ${NS} échantillons`; });
  $(el, '[data-i=rho]').oninput = e => { rho = +e.target.value; draw(); };
  btn.onclick = () => { if (play.on) { play.stop(); return; } if (shown >= NS) shown = 0; play.start(); };
  draw();
}

/* ================================================================== 8. diagnostics : résidus et QQ-plot */
function diagViz(el) {
  const n = 80, SC = {
    ok: { lab: 'Tout va bien', y: (x, z) => 2 + x + 1.2 * z, txt: 'Bande horizontale de largeur constante autour de 0, tendance plate : linéarité et homoscédasticité OK. Le QQ-plot suit la droite : normalité plausible.' },
    fun: { lab: 'Entonnoir', y: (x, z) => 2 + x + 0.32 * (x + 0.5) * z, txt: '<b>Entonnoir</b> : la dispersion des résidus croît avec ŷ, la variance n\'est pas constante (hétéroscédasticité, (H2) violée). Pistes : transformer Y (log, √), moindres carrés pondérés.' },
    cur: { lab: 'Courbure', y: (x, z) => 2 + x + 0.28 * (x - 5) ** 2 + 0.9 * z, txt: '<b>Courbure en U</b> : la tendance n\'est pas plate, le modèle linéaire oublie un terme (non-linéarité). Pistes : ajouter x², transformer x.' },
    tail: { lab: 'Queues lourdes', y: (x, z, t) => 2 + x + 0.9 * t, txt: '<b>Queues lourdes</b> : la bande paraît correcte, mais le QQ-plot s\'écarte de la droite aux extrémités (forme en S) : la normalité (H3) est douteuse, les tests de Student et de Fisher deviennent approximatifs. Shapiro-Wilk rejetterait ici.' },
  };
  let sc = 'ok', seed = 9, prev = null, stopT = () => {};
  el.innerHTML = head('Lire les graphiques de résidus', 'Choisis un scénario : les points glissent vers leur nouvelle position. À gauche résidus contre valeurs ajustées (avec tendance lissée), à droite le QQ-plot normal.') +
    `<div class="viz-ctrl"><span class="vz-seg" role="group" aria-label="scénario">${Object.entries(SC).map(([k, v]) => `<button type="button" class="chip" data-s="${k}">${v.lab}</button>`).join('')}</span>
     <button type="button" class="btn small" data-i="new">Nouvel échantillon</button></div>
     <div class="grid2 rl-g2"><div>${svg(320, 262, '<g data-l="r"></g>', 'Résidus en fonction des valeurs ajustées')}</div><div>${svg(320, 262, '<g data-l="q"></g>', 'QQ-plot normal des résidus standardisés')}</div></div>
     <p class="viz-out" data-o="out"></p>`;
  const W = 320, H = 262, L = 34, R = 312, T = 14, B = 222;
  const compute = () => {
    const r = rng(seed), xs = Array.from({ length: n }, () => 10 * r()), zs = xs.map(() => gauss(r));
    const ts = xs.map(() => { const g = gauss(r), c = (gauss(r) ** 2 + gauss(r) ** 2) / 2; return g / Math.sqrt(c) * 0.7; });
    const ys = xs.map((x, i) => SC[sc].y(x, zs[i], ts[i])), f = simple(xs, ys), fit = xs.map(x => f.a + f.b * x), sd = Math.sqrt(f.scr / (n - 2));
    const std = f.res.map(e => e / sd), ord = std.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]), qq = new Array(n);
    ord.forEach(([v, i], k) => { qq[i] = [qnorm((k + 1 - 0.375) / (n + 0.25)), v]; });
    const fl = Math.min(...fit), fh = Math.max(...fit), em = Math.max(...f.res.map(Math.abs)) * 1.1;
    const Xr = v => L + (v - fl) / (fh - fl) * (R - L), Yr = v => (T + B) / 2 - v / em * (B - T) / 2;
    const qm = Math.max(3, ...std.map(Math.abs)) * 1.05, Xq = v => L + (v + 3.2) / 6.4 * (R - L), Yq = v => (T + B) / 2 - v / qm * (B - T) / 2;
    // tendance lissée : moyenne locale à noyau gaussien
    const bw = (fh - fl) / 9, trend = Array.from({ length: 41 }, (_, j) => { const u = fl + (fh - fl) * j / 40; let sw = 0, sv = 0; fit.forEach((v, i) => { const w = Math.exp(-(((v - u) / bw) ** 2) / 2); sw += w; sv += w * f.res[i]; }); return [Xr(u), Yr(sv / sw)]; });
    return { rp: fit.map((v, i) => [Xr(v), Yr(f.res[i])]), qp: qq.map(([a, b]) => [Xq(a), Yq(b)]), trend, em, qm, Xq, Yq, Yr, fl, fh, Xr };
  };
  const frame = (c, pr, pq) => {
    let gr = `<path d="M${L},${T}V${B}H${R}" class="vz-axis"/>` + line(L, c.Yr(0), R, c.Yr(0), 'class="rl-zero"');
    gr += tx(R, H - 4, 'valeurs ajustées ŷ', 'end', 'vz-s') + tx(L + 4, T - 2, 'résidus', 'start', 'vz-s');
    const ys = [c.em * 0.8, -c.em * 0.8]; ys.forEach(v => { gr += tx(L - 4, c.Yr(v) + 4, fmt(v, 1), 'end', 'vz-s'); });
    pr.forEach(([x, y]) => { gr += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" class="rl-pt"/>`; });
    gr += `<path d="${poly(c.trend)}" class="rl-trend"/>`;
    $(el, '[data-l=r]').innerHTML = gr;
    let gq = `<path d="M${L},${T}V${B}H${R}" class="vz-axis"/>` + line(c.Xq(-3), c.Yq(-3), c.Xq(3), c.Yq(3), 'class="rl-qline"');
    [-2, 0, 2].forEach(v => { gq += tx(c.Xq(v), B + 15, v, 'middle', 'vz-s'); });
    gq += tx(R, H - 4, 'quantiles théoriques N(0,1)', 'end', 'vz-s') + tx(L + 4, T - 2, 'résidus standardisés', 'start', 'vz-s');
    pq.forEach(([x, y]) => { gq += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" class="rl-pt rl-pt2"/>`; });
    $(el, '[data-l=q]').innerHTML = gq;
  };
  const update = () => {
    stopT();
    const c = compute(), from = prev;
    el.querySelectorAll('[data-s]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.s === sc)));
    $(el, '[data-o=out]').innerHTML = SC[sc].txt;
    if (!from) { frame(c, c.rp, c.qp); prev = c; return; }
    const mix = (a, b, u) => a.map((p, i) => [p[0] + (b[i][0] - p[0]) * u, p[1] + (b[i][1] - p[1]) * u]);
    const tr0 = from.trend;
    stopT = tween(el, 700, u => { frame({ ...c, trend: mix(tr0, c.trend, u) }, mix(from.rp, c.rp, u), mix(from.qp, c.qp, u)); }, () => { prev = c; });
    prev = c;
  };
  el.querySelectorAll('[data-s]').forEach(b => { b.onclick = () => { sc = b.dataset.s; update(); }; });
  $(el, '[data-i=new]').onclick = () => { seed += 11; update(); };
  update();
}

/* ================================================================== 9. levier et distance de Cook */
function cookViz(el) {
  const W = 360, H = 250, L = 30, R = 352, T = 10, B = 226, xlo = 0, xhi = 12, ylo = -1, yhi = 11;
  const X = x => L + (x - xlo) / (xhi - xlo) * (R - L), Y = y => B - (y - ylo) / (yhi - ylo) * (B - T);
  const r = rng(13);
  const base = Array.from({ length: 10 }, (_, i) => { const x = 1 + 0.6 * i + r() * 0.4; return [x, 1.5 + 0.6 * x + gauss(r) * 0.6]; });
  let pts = [...base.map(p => p.slice()), [10.5, 2.5]], stopT = () => {};
  el.innerHTML = head('Levier et distance de Cook', 'Fais glisser le point rouge P (tous les points se déplacent). Trait plein : droite avec P ; pointillés : sans P. Plus P est loin de x̄ et de la tendance, plus il fait pivoter la droite.') +
    `<div class="viz-ctrl"><span class="viz-btns"><button type="button" class="btn small" data-pre="in">P sur la tendance, loin de x̄</button><button type="button" class="btn small" data-pre="mid">P aberrant mais au centre</button><button type="button" class="btn small primary" data-pre="out">P aberrant à fort levier</button></span></div>
     <div class="rl-stage">${svg(W, H, '<g data-l="g"></g>', 'Nuage de points avec un point influent', 'rl-drag')}</div>
     <div class="rl-stage">${svg(W, 130, '<g data-l="c"></g>', 'Distances de Cook de chaque observation')}</div>
     <p class="viz-out" data-o="out"></p>`;
  const s = $(el, 'svg');
  const draw = () => {
    const n = pts.length, xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), f = simple(xs, ys), g0 = simple(xs.slice(0, -1), ys.slice(0, -1));
    const s2 = f.scr / (n - 2), h = xs.map(x => 1 / n + (x - f.mx) ** 2 / f.sxx), D = f.res.map((e, i) => e * e / (2 * s2) * h[i] / (1 - h[i]) ** 2);
    let g = `<path d="M${L},${T}V${B}H${R}" class="vz-axis"/>`;
    for (let x = 0; x <= 12; x += 2) g += tx(X(x), B + 16, x, 'middle');
    g += line(X(f.mx), T, X(f.mx), B, 'class="vz-grid"') + tx(X(f.mx) + 4, T + 12, 'x̄', 'start', 'vz-s');
    g += line(X(xlo), Y(g0.a + g0.b * xlo), X(xhi), Y(g0.a + g0.b * xhi), 'class="rl-ghost"');
    g += line(X(xlo), Y(f.a + f.b * xlo), X(xhi), Y(f.a + f.b * xhi), 'class="rl-line rl-line-mco"');
    pts.forEach(([x, y], i) => { const P = i === n - 1; g += `<circle cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="${P ? 22 : 16}" class="rl-hit"/><circle cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="${(P ? 7 : 4.5) + Math.min(10, 6 * Math.sqrt(D[i]))}" class="rl-infl"/><circle cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="${P ? 7 : 4.5}" class="${P ? 'rl-P' : 'rl-pt'}"/>`; });
    const P = pts[n - 1]; g += tx(X(P[0]) + 11, Y(P[1]) - 9, 'P', 'start', 'rl-tP');
    $(el, '[data-l=g]').innerHTML = g;
    // barres de Cook
    const CH = 130, cb = 108, ct = 12, dm = Math.max(1.2, ...D) * 1.08, bw = (R - L) / n, Yc = v => cb - Math.min(v, dm) / dm * (cb - ct);
    let c = line(L, cb, R, cb, 'class="vz-axis"') + line(L, Yc(4 / n), R, Yc(4 / n), 'class="rl-thr"') + line(L, Yc(1), R, Yc(1), 'class="rl-crit"');
    c += tx(L + 2, Yc(1) - 4, 'D = 1', 'start', 'vz-s rl-tcrit') + tx(L + 50, Yc(4 / n) - 4, '4/n', 'start', 'vz-s rl-tthr');
    const order = xs.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]);
    order.forEach(([, i], k) => { const x0 = L + k * bw + bw * 0.18; c += `<rect x="${x0.toFixed(1)}" y="${Yc(D[i]).toFixed(1)}" width="${(bw * 0.64).toFixed(1)}" height="${(cb - Yc(D[i])).toFixed(1)}" class="${i === n - 1 ? 'rl-barP' : 'rl-barc'}"/>`; if (i === n - 1) c += tx(x0 + bw * 0.32, cb + 14, 'P', 'middle', 'rl-tP'); });
    c += tx(L, CH - 4, 'distance de Cook Dᵢ (points rangés selon x)', 'start', 'vz-s');
    $(el, '[data-l=c]').innerHTML = c;
    const hP = h[n - 1], DP = D[n - 1], hi = hP > 4 / n;
    $(el, '[data-o=out]').innerHTML = `Levier de P : h = 1/n + (x − x̄)²/Σ(xᵢ − x̄)² = <b>${fmt(hP, 3)}</b> ${hi ? `(> 2(p+1)/n = ${fmt(4 / n, 2)} : fort levier)` : '(levier modéré)'} ; distance de Cook D = <span class="rl-hat">ε</span>²/(2<span class="rl-hat">σ</span>²) · h/(1 − h)² = <b>${fmt(DP, 2)}</b>. ` +
      `Pente avec P : ${fmt(f.b)} ; sans P : ${fmt(g0.b)}. ` + (DP > 1 ? '<b class="rl-bad">P est très influent</b> : à lui seul, il change nettement l\'ajustement. Le levier seul ne suffit pas (un point loin de x̄ mais sur la tendance ne pèse pas), il faut aussi un gros résidu.' : DP > 4 / n ? '<b class="rl-warnt">P est influent</b> (D > 4/n) : à examiner.' : 'P a peu d\'influence sur la droite.');
  };
  drag(s, p => nearest(pts.map(([x, y]) => [X(x), Y(y)]), p, 26), (i, p) => { stopT(); pts[i] = [clamp((p.x - L) / (R - L) * (xhi - xlo) + xlo, 0.2, 11.8), clamp((B - p.y) / (B - T) * (yhi - ylo) + ylo, -0.8, 10.8)]; draw(); });
  el.querySelectorAll('[data-pre]').forEach(b => { b.onclick = () => {
    stopT(); const tgt = { in: [10.5, 1.5 + 0.6 * 10.5], mid: [4.2, 8.6], out: [10.5, 2.5] }[b.dataset.pre];
    const from = pts.map(p => p.slice()), to = [...base.map(p => p.slice()), tgt];
    stopT = tween(el, 900, u => { pts = from.map((p, i) => [p[0] + (to[i][0] - p[0]) * u, p[1] + (to[i][1] - p[1]) * u]); draw(); });
  }; });
  draw();
}

const VIZ = { 'rl-ols': olsViz, 'rl-proj': projViz, 'rl-r2': r2Viz, 'rl-student': studentViz, 'rl-fisher': fisherViz, 'rl-ic': icViz, 'rl-colin': colinViz, 'rl-diag': diagViz, 'rl-cook': cookViz };

export function mountViz(root) {
  root.querySelectorAll('[data-viz]').forEach(el => { const f = VIZ[el.dataset.viz]; if (f && !el.dataset.ready) { el.dataset.ready = '1'; try { f(el); } catch (e) { el.textContent = ''; console.error(e); } } });
}
