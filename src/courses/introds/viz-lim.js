// Illustrations interactives des leçons s2 (LGN, TCL, intervalles) et s3 (tests, tests multiples) du cours introds.
// SVG redessiné à chaque image, couleurs du thème uniquement, animations requestAnimationFrame arrêtées quand la figure
// quitte le DOM, mouvement réduit respecté (on saute à l'état final). Tirages pseudo-aléatoires à graine.
import './viz-lim.css';

/* ================================================================== outils */
const fmt = (x, d = 2) => Number(x).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtI = x => Math.round(x).toLocaleString('fr-FR');
const pc = (x, d = 1) => fmt(100 * x, d) + ' %';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const head = (t, hint) => `<figcaption><b>${t}</b>${hint ? `<span>${hint}</span>` : ''}</figcaption>`;
const svgTag = (w, h, label, extra = '') => `<svg viewBox="0 0 ${w} ${h}" class="vz-svg vl-svg" role="img" aria-label="${esc(label)}" data-s="g" ${extra}></svg>`;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const RM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
let UID = 0;
const uid = p => `vl-${p}-${++UID}`;
const P = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('');
const lin = (d0, d1, r0, r1) => v => r0 + (v - d0) * (r1 - r0) / (d1 - d0);

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(r) { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
const phi = x => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
function Phi(x) { // erfc de Numerical Recipes (précision ~1e-7)
  const z = Math.abs(x) / Math.SQRT2, t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? 1 - r / 2 : r / 2;
}
function qnorm(p) { // Acklam
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - pl) return -qnorm(1 - p);
  const q = p - 0.5, r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}
function ticks(min, max, count = 5) {
  const step0 = (max - min) / count, mag = 10 ** Math.floor(Math.log10(step0)), e = step0 / mag;
  const step = (e >= 7.5 ? 10 : e >= 3.5 ? 5 : e >= 1.5 ? 2 : 1) * mag, out = [];
  for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(10));
  return { t: out, dec: Math.max(0, -Math.floor(Math.log10(step) + 1e-9)) };
}
/** Axes : x et y avec graduations. o = {L,R,T,B,sx,sy,xd,yd,xn,yn,xlab,ylab,xf,yf,grid} */
function axes(o) {
  let g = '';
  if (o.yd) {
    const { t, dec } = ticks(o.yd[0], o.yd[1], o.yn || 4);
    t.forEach(v => { const y = o.sy(v); g += `<line x1="${o.L}" x2="${o.R}" y1="${y}" y2="${y}" class="vz-grid"/><text x="${o.L - 5}" y="${y + 4}" class="vz-t vl-s" text-anchor="end">${o.yf ? o.yf(v) : fmt(v, dec)}</text>`; });
  }
  const { t, dec } = o.noX ? { t: [], dec: 0 } : ticks(o.xd[0], o.xd[1], o.xn || 6);
  t.forEach(v => { const x = o.sx(v); g += `<line x1="${x}" x2="${x}" y1="${o.B}" y2="${o.B + 4}" class="vz-axis"/><text x="${x}" y="${o.B + 16}" class="vz-t vl-s" text-anchor="middle">${o.xf ? o.xf(v) : fmt(v, dec)}</text>`; });
  g += `<path d="M${o.L},${o.yd ? o.T : o.B}V${o.B}H${o.R}" class="vz-axis"/>`;
  if (o.xlab) g += `<text x="${o.R}" y="${o.B + 30}" class="vz-t vl-s" text-anchor="end">${o.xlab}</text>`;
  if (o.ylab) g += `<text x="${o.L}" y="${o.T - 5}" class="vz-t vl-s">${o.ylab}</text>`;
  return g;
}
const seg = (key, opts, cur, label) => `<span class="vz-seg" role="group" aria-label="${esc(label || '')}">${opts.map(([v, l]) => `<button type="button" class="chip" data-${key}="${v}" aria-pressed="${String(v) === String(cur)}">${l}</button>`).join('')}</span>`;
const setSeg = (el, key, cur) => el.querySelectorAll(`[data-${key}]`).forEach(b => b.setAttribute('aria-pressed', String(b.getAttribute('data-' + key) === String(cur))));
const range = (key, lab, min, max, step, val) => `<label>${lab} <b data-o="${key}"></b> <input type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-i="${key}" aria-label="${esc(lab.replace(/<[^>]+>/g, ''))}"></label>`;
const q = (el, s) => el.querySelector(s);

/** Boucle d'animation : step(dt) renvoie false pour s'arrêter. S'arrête seule si la figure quitte le DOM. */
function loop(el, step, onState) {
  let raf = 0, last = 0, on = false;
  const tick = t => {
    raf = 0;
    if (!el.isConnected) { on = false; return; }
    const dt = last ? Math.min(60, t - last) : 16; last = t;
    if (step(dt) === false) { on = false; onState && onState(false); return; }
    if (on) raf = requestAnimationFrame(tick);
  };
  return {
    play() { if (on) return; on = true; last = 0; onState && onState(true); raf = requestAnimationFrame(tick); },
    pause() { const was = on; on = false; if (raf) cancelAnimationFrame(raf); raf = 0; if (was) onState && onState(false); },
    get on() { return on; },
  };
}
/** Interpolation douce d'une valeur (ou d'un tableau de valeurs). */
function tween(el, from, to, ms, onv, done) {
  const mix = u => Array.isArray(from) ? from.map((f, i) => f + (to[i] - f) * u) : from + (to - from) * u;
  if (RM() || ms <= 0) { onv(to); done && done(); return () => {}; }
  const t0 = performance.now(); let id = 0, dead = false;
  const f = t => { if (dead || !el.isConnected) return; const u = Math.min(1, (t - t0) / ms), e = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) ** 2; onv(mix(e)); if (u < 1) id = requestAnimationFrame(f); else done && done(); };
  id = requestAnimationFrame(f);
  return () => { dead = true; cancelAnimationFrame(id); };
}
/** Appelle fn une fois quand la figure devient visible (lancement automatique de l'animation). */
function onVisible(el, fn) {
  if (typeof IntersectionObserver === 'undefined') { fn(); return; }
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); if (el.isConnected) fn(); } }, { threshold: 0.3 });
  io.observe(el);
}
const playLabel = on => on ? '❚❚ Pause' : '▶ Lecture';
/** Coordonnée x (unités du viewBox) d'un événement pointeur sur un svg. */
const svgX = (svg, W, e) => { const r = svg.getBoundingClientRect(); return (e.clientX - r.left) / r.width * W; };
/** Glisser horizontalement : démarre près de la poignée (getX) ou par un simple appui. */
function dragX(svg, W, getX, onX) {
  let on = false;
  svg.addEventListener('pointerdown', e => { const x = svgX(svg, W, e); if (Math.abs(x - getX()) < 34) { on = true; try { svg.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); onX(x); } });
  svg.addEventListener('pointermove', e => { if (on) onX(svgX(svg, W, e)); });
  const up = () => { on = false; };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  svg.addEventListener('click', e => { if (!on) onX(svgX(svg, W, e)); });
}
const leg = items => `<div class="viz-leg">${items.map(([k, c, l]) => `<span><i class="sw sw-${k}" style="--sw:var(${c})" aria-hidden="true"></i>${l}</span>`).join('')}</div>`;
const curve = (f, a, b, sx, sy, n = 160) => { const pts = []; for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; pts.push([sx(x), sy(f(x))]); } return pts; };
const area = (f, a, b, sx, sy, y0, n = 80) => { if (b <= a) return ''; const pts = curve(f, a, b, sx, sy, n); return `M${sx(a).toFixed(1)},${y0}` + pts.map(p => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('') + `L${sx(b).toFixed(1)},${y0}Z`; };

/* ================================================================== s2 · LGN : trajectoires de la moyenne */
const LGN_LAWS = {
  exp: { lab: 'Exponentielle λ = 4', mu: 0.25, sd: 0.25, draw: r => -Math.log(1 - r()) / 4, yd: [0, 0.75], obs: 'les 5 trajectoires se resserrent autour de μ = 0,25, dans le couloir μ ± 2σ/√n qui rétrécit.' },
  de: { lab: 'Dé', mu: 3.5, sd: Math.sqrt(35 / 12), draw: r => 1 + Math.floor(6 * r()), yd: [1, 6], obs: 'au début la moyenne saute (un 6, un 1…), puis elle se stabilise vers μ = 3,5.' },
  ber: { lab: 'Bernoulli p = 0,3', mu: 0.3, sd: Math.sqrt(0.21), draw: r => (r() < 0.3 ? 1 : 0), yd: [0, 1], obs: 'la moyenne est ici la fréquence des 1 : elle tend vers p = 0,3.' },
  p3: { lab: '2/x³ (σ² = +∞)', mu: 2, sd: Infinity, draw: r => 1 / Math.sqrt(1 - r()), yd: [1, 4], obs: 'E(X) = 2 existe : la LGN s\'applique et les moyennes finissent par approcher 2, mais lentement (σ² = +∞, pas de couloir en 1/√n).' },
  piege: { lab: 'Piège : 1/x²', mu: Infinity, sd: Infinity, draw: r => 1 / (1 - r()), yd: null, obs: 'E(X) = +∞ : la LGN ne s\'applique pas. Les moyennes ne se stabilisent jamais, elles font des sauts à chaque très grande valeur.' },
};
function lgnViz(el) {
  const N = 2000, K = 5, COL = ['--c1', '--c2', '--c3', '--c4', '--c6'], W = 400, H = 250, L = 40, R = W - 14, T = 18, B = H - 34;
  const clip = uid('clip');
  let law = 'exp', seed = 1, n = 0, tr = [], speed = 2;
  const IDX = []; for (let t = 0; t <= Math.log10(N) + 1e-9; t += 0.006) { const i = Math.round(10 ** t); if (IDX[IDX.length - 1] !== i) IDX.push(i); } if (IDX[IDX.length - 1] !== N) IDX.push(N);
  el.innerHTML = head('Loi des grands nombres : la moyenne se stabilise', 'Chaque courbe suit Yₙ = (X₁ + … + Xₙ)/n pour une suite de tirages indépendants. Choisis une loi et regarde les trajectoires.') +
    `<div class="viz-ctrl">${seg('law', Object.entries(LGN_LAWS).map(([k, v]) => [k, v.lab]), law, 'loi')}</div>
     <div class="viz-ctrl"><span class="viz-btns"><button type="button" class="btn small primary" data-i="play"></button><button type="button" class="btn small" data-i="new">Nouveau tirage</button></span>${range('sp', 'vitesse', 1, 5, 1, speed)}</div>
     ${svgTag(W, H, 'Trajectoires de la moyenne empirique en fonction de n')}
     <div data-o="leg"></div><p class="viz-out" data-o="out" aria-live="polite"></p>`;
  const g = q(el, '[data-s=g]'), bPlay = q(el, '[data-i=play]');
  const build = () => {
    const r = rng(seed * 7919 + law.charCodeAt(0) * 31 + law.length);
    tr = Array.from({ length: K }, () => { const m = new Float64Array(N + 1), big = new Float64Array(N + 1), top = new Float64Array(N + 1); let s = 0; for (let i = 1; i <= N; i++) { const x = LGN_LAWS[law].draw(r); s += x; m[i] = s / i; big[i] = Math.max(big[i - 1], x); top[i] = Math.max(top[i - 1], m[i]); } return { m, big, top }; });
    n = 0;
  };
  const draw = () => {
    const Lw = LGN_LAWS[law], nn = Math.max(1, n);
    const yd = Lw.yd || [1, Math.max(4, ...tr.map(t => t.top[nn])) * 1.08];
    const sx = i => L + Math.log10(i) / Math.log10(N) * (R - L), sy = lin(yd[0], yd[1], B, T);
    let s = `<defs><clipPath id="${clip}"><rect x="${L}" y="${T - 2}" width="${R - L}" height="${B - T + 4}"/></clipPath></defs>`;
    s += axes({ L, R, T, B, sx: v => v, sy, xd: [0, 1], yd, yn: 4, noX: true });
    [1, 10, 100, 1000].forEach(v => { s += `<line x1="${sx(v)}" x2="${sx(v)}" y1="${T}" y2="${B}" class="vz-grid"/><text x="${sx(v)}" y="${B + 16}" class="vz-t vl-s" text-anchor="middle">${fmtI(v)}</text>`; });
    s += `<text x="${R}" y="${B + 30}" class="vz-t vl-s" text-anchor="end">n (échelle logarithmique)</text><text x="${L}" y="${T - 6}" class="vz-t vl-s">Yₙ</text>`;
    s += `<g clip-path="url(#${clip})">`;
    if (isFinite(Lw.sd)) {
      const up = IDX.map(i => [sx(i), sy(Lw.mu + 2 * Lw.sd / Math.sqrt(i))]), lo = IDX.map(i => [sx(i), sy(Lw.mu - 2 * Lw.sd / Math.sqrt(i))]).reverse();
      s += `<path d="${P(up.concat(lo))}Z" fill="var(--accent-soft)" stroke="var(--accent-line)" stroke-dasharray="4 3"/>`;
    }
    if (isFinite(Lw.mu)) s += `<line x1="${L}" x2="${R}" y1="${sy(Lw.mu)}" y2="${sy(Lw.mu)}" stroke="var(--ink)" stroke-width="1.6" stroke-dasharray="7 4"/>`;
    const idx = IDX.filter(i => i < nn).concat([nn]);
    tr.forEach((t, k) => {
      s += `<path d="${P(idx.map(i => [sx(i), sy(t.m[i])]))}" fill="none" stroke="var(${COL[k]})" stroke-width="1.8" stroke-linejoin="round"/>`;
      s += `<circle cx="${sx(nn)}" cy="${sy(t.m[nn])}" r="3.6" fill="var(${COL[k]})" stroke="var(--paper)" stroke-width="1.2"/>`;
    });
    s += '</g>';
    if (isFinite(Lw.mu)) s += `<text x="${R - 2}" y="${sy(Lw.mu) - 6}" class="vz-t vl-b" text-anchor="end">μ = ${fmt(Lw.mu, 2)}</text>`;
    else s += `<text x="${R - 2}" y="${T + 12}" class="vz-t vl-b" text-anchor="end" fill="var(--red)">μ = +∞ : pas de limite</text>`;
    if (isFinite(Lw.sd)) s += `<text x="${sx(3)}" y="${sy(Lw.mu + 2 * Lw.sd / Math.sqrt(3)) - 4}" class="vz-t vl-s" fill="var(--accent)">μ ± 2σ/√n</text>`;
    g.innerHTML = s;
    const vals = tr.map(t => fmt(t.m[nn], law === 'piege' ? 1 : 3));
    let out = `<b>n = ${fmtI(nn)}</b> tirages · moyennes Yₙ : <span class="vl-mono">${vals.join(' · ')}</span>. `;
    if (law === 'piege') out += `Plus grande valeur tirée : <b>${fmtI(Math.max(...tr.map(t => t.big[nn])))}</b>. `;
    else if (isFinite(Lw.sd)) out += `Écart-type de Yₙ : σ/√n = ${fmt(Lw.sd / Math.sqrt(nn), 3)}. `;
    out += `<b>Observe :</b> ${Lw.obs}`;
    q(el, '[data-o=out]').innerHTML = out;
  };
  const anim = loop(el, () => { if (n >= N) return false; n = Math.min(N, n + Math.max(1, Math.ceil(n * 0.004 * speed * speed + speed / 2))); draw(); return n < N; }, on => { bPlay.textContent = playLabel(on); if (!on && n >= N) bPlay.textContent = '↺ Rejouer'; });
  const start = () => { if (RM()) { n = N; draw(); bPlay.textContent = '↺ Rejouer'; return; } anim.play(); };
  bPlay.onclick = () => { if (anim.on) anim.pause(); else { if (n >= N) n = 0; start(); } };
  q(el, '[data-i=new]').onclick = () => { seed++; build(); draw(); anim.pause(); start(); };
  const sp = q(el, '[data-i=sp]'); const spOut = () => { speed = +sp.value; q(el, '[data-o=sp]').textContent = '×' + speed; }; sp.oninput = spOut; spOut();
  el.querySelectorAll('[data-law]').forEach(b => { b.onclick = () => { law = b.dataset.law; setSeg(el, 'law', law); build(); draw(); anim.pause(); start(); }; });
  q(el, '[data-o=leg]').innerHTML = leg([['l', '--c1', '5 suites de tirages indépendantes'], ['d', '--ink', 'espérance μ'], ['a', '--accent', 'couloir μ ± 2σ/√n']]);
  build(); draw(); bPlay.textContent = playLabel(false);
  onVisible(el, start);
}

/* ================================================================== s2 · σ/√n : la dispersion de X̄ diminue */
function sqrtnViz(el) {
  const NS = [1, 4, 16, 64], MAXD = 80, mu = 3.5, sd = Math.sqrt(35 / 12), W = 400, rowH = 58, T = 8, L = 54, R = W - 12, H = T + NS.length * rowH + 30;
  const COL = ['--c2', '--c4', '--c3', '--c1'];
  let seed = 3, means = [], shown = 0;
  el.innerHTML = head('σ/√n : la moyenne se concentre', 'Chaque point est la moyenne X̄ de n lancers de dé. Quatre valeurs de n, 80 moyennes par ligne.') +
    `<div class="viz-ctrl"><span class="viz-btns"><button type="button" class="btn small primary" data-i="go">▶ Lancer les moyennes</button><button type="button" class="btn small" data-i="new">Nouveau tirage</button></span></div>
     ${svgTag(W, H, 'Nuages de moyennes de dés pour n = 1, 4, 16, 64')}<p class="viz-out" data-o="out" aria-live="polite"></p>`;
  const g = q(el, '[data-s=g]'), sx = lin(1, 6, L, R);
  const build = () => { const r = rng(seed * 104729); means = NS.map(n => Array.from({ length: MAXD }, () => { let s = 0; for (let i = 0; i < n; i++) s += 1 + Math.floor(6 * r()); return { m: s / n, j: (r() - 0.5) }; })); shown = 0; };
  const frame = () => {
    let s = `<line x1="${sx(mu)}" x2="${sx(mu)}" y1="${T}" y2="${T + NS.length * rowH}" stroke="var(--ink)" stroke-dasharray="6 4" stroke-width="1.4"/>`;
    NS.forEach((n, k) => {
      const y0 = T + k * rowH, yc = y0 + rowH / 2 + 4, h = sd / Math.sqrt(n);
      s += `<rect x="${sx(mu - h)}" y="${y0 + 15}" width="${sx(mu + h) - sx(mu - h)}" height="${rowH - 19}" rx="4" fill="var(--accent-soft)" stroke="var(--accent-line)"/>`;
      s += `<line x1="${L}" x2="${R}" y1="${y0 + rowH - 2}" y2="${y0 + rowH - 2}" class="vz-grid"/>`;
      s += `<text x="${L - 8}" y="${yc + 4}" class="vz-t vl-b" text-anchor="end">n = ${n}</text>`;
      s += `<g data-row="${k}"></g>`;
      s += `<text x="${R}" y="${y0 + 11}" class="vz-t vl-s" text-anchor="end" data-st="${k}"></text>`;
      void yc;
    });
    s += axes({ L, R, T, B: T + NS.length * rowH, sx, xd: [1, 6], xn: 5, xlab: 'valeur de X̄ (moyenne de n lancers)' });
    s += `<text x="${sx(mu) - 4}" y="${T + 9}" class="vz-t vl-s vl-b" text-anchor="end">μ = 3,5</text>`;
    g.innerHTML = s;
  };
  const NSVG = 'http://www.w3.org/2000/svg';
  const addDots = upTo => {
    NS.forEach((n, k) => {
      const grp = q(g, `[data-row="${k}"]`), y0 = T + k * rowH;
      for (let i = shown; i < upTo; i++) {
        const d = means[k][i], c = document.createElementNS(NSVG, 'circle');
        c.setAttribute('cx', sx(d.m).toFixed(1)); c.setAttribute('cy', (y0 + rowH / 2 + 6 + d.j * (rowH - 28)).toFixed(1)); c.setAttribute('r', '3');
        c.setAttribute('fill', `var(${COL[k]})`); c.setAttribute('fill-opacity', '0.8'); if (!RM()) c.setAttribute('class', 'vl-pop');
        grp.appendChild(c);
      }
      const ms = means[k].slice(0, upTo).map(d => d.m), m = ms.reduce((a, b) => a + b, 0) / (ms.length || 1);
      const e = Math.sqrt(ms.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, ms.length - 1));
      q(g, `[data-st="${k}"]`).textContent = `σ/√n = ${fmt(sd / Math.sqrt(n), 2)}` + (upTo > 2 ? ` · observé ${fmt(e, 2)}` : '');
    });
    shown = upTo;
  };
  let acc = 0;
  const anim = loop(el, dt => { acc += dt; const k = Math.min(MAXD, Math.floor(acc / 28)); if (k > shown) addDots(k); return shown < MAXD; }, on => { if (!on) out(); });
  const out = () => { q(el, '[data-o=out]').innerHTML = `Bandes bleues : X̄ ± σ/√n avec σ = √(35/12) ≈ 1,71. <b>Observe :</b> quand n est multiplié par 4, l'écart-type σ/√n est divisé par 2 : les moyennes se resserrent autour de μ = 3,5 (et leur forme devient une cloche, c'est le TCL).`; };
  const run = () => { anim.pause(); frame(); shown = 0; acc = 0; if (RM()) { addDots(MAXD); out(); } else anim.play(); };
  q(el, '[data-i=go]').onclick = run;
  q(el, '[data-i=new]').onclick = () => { seed++; build(); run(); };
  build(); frame(); out();
  onVisible(el, run);
}

/* ================================================================== s2 · TCL : histogramme des Zᵢ */
const TCL_LAWS = {
  exp: { lab: 'Exponentielle λ = 4', mu: 0.25, sd: 0.25, draw: r => -Math.log(1 - r()) / 4, shape: { xd: [0, 1.4], yd: [0, 4.2], f: x => 4 * Math.exp(-4 * x) } },
  unif: { lab: 'Uniforme [0 ; 1]', mu: 0.5, sd: Math.sqrt(1 / 12), draw: r => r(), shape: { xd: [-0.2, 1.2], yd: [0, 1.4], f: x => (x >= 0 && x <= 1 ? 1 : 0) } },
  ber: { lab: 'Bernoulli p = 0,2', mu: 0.2, sd: 0.4, draw: r => (r() < 0.2 ? 1 : 0), shape: { xd: [-0.5, 1.5], yd: [0, 1], bars: [[0, 0.8], [1, 0.2]] } },
  de: { lab: 'Dé', mu: 3.5, sd: Math.sqrt(35 / 12), draw: r => 1 + Math.floor(6 * r()), shape: { xd: [0.3, 6.7], yd: [0, 0.3], bars: [1, 2, 3, 4, 5, 6].map(v => [v, 1 / 6]) } },
  p3: { lab: '2/x³ (σ² = +∞)', mu: 2, sd: Infinity, draw: r => 1 / Math.sqrt(1 - r()), shape: { xd: [0.6, 6], yd: [0, 2.2], f: x => (x >= 1 ? 2 / x ** 3 : 0) } },
};
function tclViz(el) {
  const NS = [1, 2, 3, 5, 10, 20, 30, 50, 100, 200], NTOT = 1500, BW = 0.25, NB = 32, W = 400, H = 240, L = 40, R = W - 12, T = 20, B = H - 34;
  let law = 'exp', ni = 6, seed = 5, r, Z = [], bins, out = 0, last = null, speed = 3, ymax = 0.45;
  el.innerHTML = head('Théorème central limite : la cloche apparaît', 'On tire un échantillon de taille n, on calcule Zᵢ = √n (X̄ − μ)/σ, et on recommence. L\'histogramme des Zᵢ se construit sous tes yeux.') +
    `<div class="viz-ctrl">${seg('law', Object.entries(TCL_LAWS).map(([k, v]) => [k, v.lab]), law, 'loi de X')}</div>
     <div class="viz-ctrl">${range('n', 'taille n =', 0, NS.length - 1, 1, ni)}${range('sp', 'vitesse', 1, 6, 1, speed)}</div>
     <div class="viz-ctrl"><span class="viz-btns"><button type="button" class="btn small primary" data-i="play"></button><button type="button" class="btn small" data-i="new">Nouveau tirage</button></span></div>
     <svg viewBox="0 0 400 76" class="vz-svg vl-svg" role="img" aria-label="Loi de X" data-s="law"></svg>
     ${svgTag(W, H, 'Histogramme des Z et densité N(0, 1)')}
     ${leg([['a', '--accent', 'histogramme des Zᵢ'], ['l', '--red', 'densité de N(0, 1)'], ['t', '--warn', 'dernier Zᵢ']])}
     <p class="viz-out" data-o="out" aria-live="polite"></p>`;
  const g = q(el, '[data-s=g]'), gl = q(el, '[data-s=law]'), bPlay = q(el, '[data-i=play]');
  const sx = lin(-4, 4, L, R);
  const reset = () => { r = rng(seed * 7 + ni * 101 + law.length * 13); Z = []; bins = new Array(NB).fill(0); out = 0; last = null; ymax = 0.45; };
  const one = () => {
    const Lw = TCL_LAWS[law], n = NS[ni]; let s = 0; for (let i = 0; i < n; i++) s += Lw.draw(r);
    const m = s / n, z = isFinite(Lw.sd) ? Math.sqrt(n) * (m - Lw.mu) / Lw.sd : Math.sqrt(n) * (m - Lw.mu);
    Z.push(z); last = z; const b = Math.floor((z + 4) / BW + 1e-9); if (b >= 0 && b < NB) bins[b]++; else out++;
  };
  const drawLaw = () => {
    const sh = TCL_LAWS[law].shape, Lx = 40, Rx = 388, Tt = 8, Bt = 56, fx = lin(sh.xd[0], sh.xd[1], Lx, Rx), fy = lin(0, sh.yd[1], Bt, Tt);
    let s = `<text x="${Rx}" y="${Tt + 4}" class="vz-t vl-s vl-b" text-anchor="end">loi de X : ${TCL_LAWS[law].lab}</text>`;
    if (sh.f) s += `<path d="${area(sh.f, Math.max(sh.xd[0], law === 'p3' ? 1 : law === 'exp' ? 0 : sh.xd[0]), sh.xd[1], fx, fy, Bt, 120)}" fill="var(--c5)" fill-opacity="0.25" stroke="var(--c5)" stroke-width="1.6"/>`;
    else sh.bars.forEach(([v, p]) => { s += `<rect x="${fx(v) - 9}" y="${fy(p)}" width="18" height="${Bt - fy(p)}" fill="var(--c5)" fill-opacity="0.45" stroke="var(--c5)"/>`; });
    s += axes({ L: Lx, R: Rx, T: Tt, B: Bt, sx: fx, xd: sh.xd, xn: 6 });
    const Lw = TCL_LAWS[law];
    s += `<line x1="${fx(Lw.mu)}" x2="${fx(Lw.mu)}" y1="${Tt}" y2="${Bt}" stroke="var(--ink)" stroke-dasharray="4 3"/><text x="${fx(Lw.mu) + 4}" y="${Tt + 12}" class="vz-t vl-s">μ = ${fmt(Lw.mu, 2)}</text>`;
    gl.innerHTML = s;
  };
  const draw = () => {
    const N = Z.length, dens = bins.map(c => (N ? c / (N * BW) : 0)), mx = Math.max(...dens);
    if (N >= 40) { const tg = Math.max(0.45, Math.min(4, mx * 1.1)); ymax += (tg - ymax) * (RM() || N >= NTOT ? 1 : 0.12); } const sy = lin(0, ymax, B, T);
    let s = axes({ L, R, T, B, sx, sy, xd: [-4, 4], yd: [0, ymax], xn: 8, yn: 4, xlab: isFinite(TCL_LAWS[law].sd) ? 'Zᵢ = √n (X̄ − μ)/σ' : '√n (X̄ − 2) : on ne peut pas diviser par σ = +∞', ylab: 'densité' });
    s += `<rect x="${sx(-1.96)}" y="${T}" width="${sx(1.96) - sx(-1.96)}" height="${B - T}" fill="var(--good-soft)" opacity="0.55"/>`;
    dens.forEach((d, i) => { if (d > 0) { const y = Math.max(T, sy(d)); s += `<rect x="${(sx(-4 + i * BW) + 0.6).toFixed(1)}" y="${y.toFixed(1)}" width="${(sx(BW) - sx(0) - 1.2).toFixed(1)}" height="${(B - y).toFixed(1)}" fill="var(--accent)" fill-opacity="0.55" stroke="var(--accent)" stroke-width="0.8"/>`; } });
    s += `<path d="${P(curve(phi, -4, 4, sx, sy))}" fill="none" stroke="var(--red)" stroke-width="2.2"/>`;
    s += `<text x="${sx(-1.96)}" y="${T + 11}" class="vz-t vl-s" text-anchor="middle" fill="var(--good)">−1,96</text><text x="${sx(1.96)}" y="${T + 11}" class="vz-t vl-s" text-anchor="middle" fill="var(--good)">1,96</text>`;
    if (last != null) { const x = sx(clamp(last, -4.2, 4.2)); s += `<path d="M${x},${B + 1}l-6,9h12z" fill="var(--warn)"/>`; }
    g.innerHTML = s;
    q(el, '[data-o=n]').textContent = NS[ni];
    if (!N) { q(el, '[data-o=out]').innerHTML = 'Lance la simulation.'; return; }
    const m = Z.reduce((a, b) => a + b, 0) / N, v = Z.reduce((a, b) => a + (b - m) ** 2, 0) / N, inn = Z.filter(z => Math.abs(z) <= 1.96).length / N;
    const fin = isFinite(TCL_LAWS[law].sd), n = NS[ni];
    let o = `<b>${fmtI(N)}</b> échantillons de taille n = ${n} · moyenne des Z = ${fmt(m, 2)}, écart-type = ${fmt(Math.sqrt(v), 2)}, part dans [−1,96 ; 1,96] = <b>${pc(inn)}</b> (95 % pour N(0, 1))${out ? `, hors cadre : ${out}` : ''}. `;
    if (!fin) o += '<b>Observe :</b> la variance est infinie, le TCL ne s\'applique pas : histogramme dissymétrique, longue queue à droite, et l\'étalement ne se stabilise pas quand n augmente.';
    else if (n <= 3 && law !== 'unif') o += '<b>Observe :</b> avec n petit, l\'histogramme garde la forme de la loi de X (dissymétrique ou en bâtons). Augmente n.';
    else if (law === 'ber' && n < 30) o += '<b>Observe :</b> pour Bernoulli, X̄ ne prend que les valeurs k/n : l\'histogramme est en peigne et reste dissymétrique tant que np est petit.';
    else o += '<b>Observe :</b> quelle que soit la loi de départ (variance finie), l\'histogramme épouse la courbe de N(0, 1) quand n grandit.';
    q(el, '[data-o=out]').innerHTML = o;
  };
  const anim = loop(el, () => { const k = [1, 2, 4, 8, 16, 40][speed - 1]; for (let i = 0; i < k && Z.length < NTOT; i++) one(); draw(); return Z.length < NTOT; }, on => { bPlay.textContent = Z.length >= NTOT && !on ? '↺ Rejouer' : playLabel(on); });
  const start = () => { if (RM()) { while (Z.length < NTOT) one(); draw(); bPlay.textContent = '↺ Rejouer'; return; } anim.play(); };
  const restart = () => { anim.pause(); reset(); draw(); start(); };
  bPlay.onclick = () => { if (anim.on) anim.pause(); else { if (Z.length >= NTOT) reset(); start(); } };
  q(el, '[data-i=new]').onclick = () => { seed++; restart(); };
  const nIn = q(el, '[data-i=n]'); nIn.oninput = () => { ni = +nIn.value; restart(); };
  const sp = q(el, '[data-i=sp]'); const spo = () => { speed = +sp.value; q(el, '[data-o=sp]').textContent = '×' + [1, 2, 4, 8, 16, 40][speed - 1]; }; sp.oninput = spo; spo();
  el.querySelectorAll('[data-law]').forEach(b => { b.onclick = () => { law = b.dataset.law; setSeg(el, 'law', law); drawLaw(); restart(); }; });
  reset(); drawLaw(); draw(); bPlay.textContent = playLabel(false);
  onVisible(el, start);
}

/* ================================================================== s2 · intervalle de dispersion : 500 lancers */
function dispViz(el) {
  const NT = 500, W = 400, H = 330, cols = 50, cs = 7, gx = 25, gy = 8, L = 40, R = W - 12, T = 128, B = H - 34, lo = 200, hi = 300;
  const IV = [[228, 272, '[228 ; 272] · 95 %'], [221, 279, '[221 ; 279] · 99 %'], [240, 260, '[240 ; 260]'], [180, 320, '[180 ; 320]']];
  const lg = [0]; for (let i = 1; i <= NT; i++) lg[i] = lg[i - 1] + Math.log(i);
  const pmf = k => Math.exp(lg[NT] - lg[k] - lg[NT - k] - NT * Math.LN2);
  const prob = (a, b) => { let s = 0; for (let k = a; k <= b; k++) s += pmf(k); return s; };
  let iv = 0, seed = 9, r, counts, nexp = 0, cur = null, rev = 0, speed = 2, lastS = null;
  el.innerHTML = head('Intervalle de dispersion : 500 lancers de pièce', 'Chaque expérience = 500 lancers (pile en couleur). On compte S, le nombre de piles, et on le range dans l\'histogramme.') +
    `<div class="viz-ctrl">${seg('iv', IV.map((v, i) => [i, v[2]]), iv, 'intervalle')}</div>
     <div class="viz-ctrl"><span class="viz-btns"><button type="button" class="btn small primary" data-i="play"></button><button type="button" class="btn small" data-i="many">+ 200 expériences</button><button type="button" class="btn small" data-i="new">Remise à zéro</button></span>${range('sp', 'vitesse', 1, 5, 1, speed)}</div>
     ${svgTag(W, H, 'Grille des 500 lancers et histogramme du nombre de piles')}<p class="viz-out" data-o="out" aria-live="polite"></p>`;
  const g = q(el, '[data-s=g]'), bPlay = q(el, '[data-i=play]'), sx = lin(lo - 0.5, hi + 0.5, L, R);
  const reset = () => { r = rng(seed * 31337); counts = new Array(NT + 1).fill(0); nexp = 0; cur = null; rev = 0; lastS = null; };
  const newExp = () => { cur = Array.from({ length: NT }, () => r() < 0.5); rev = 0; };
  const finish = () => { const S = cur.filter(Boolean).length; counts[S]++; nexp++; lastS = S; };
  const draw = () => {
    const [a, b] = IV[iv], ins = counts.slice(a, b + 1).reduce((x, y) => x + y, 0);
    let s = '';
    for (let i = 0; i < NT; i++) {
      const x = gx + (i % cols) * cs, y = gy + Math.floor(i / cols) * cs, on = cur && i < rev;
      s += `<rect x="${x}" y="${y}" width="${cs - 1.2}" height="${cs - 1.2}" rx="1.2" fill="${on ? (cur[i] ? 'var(--accent)' : 'var(--line)') : 'var(--paper-2)'}"/>`;
    }
    const piles = cur ? cur.slice(0, rev).filter(Boolean).length : 0;
    s += `<text x="${gx}" y="${gy + 10 * cs + 16}" class="vz-t">Expérience n° ${fmtI(nexp + (cur && rev < NT ? 1 : 0))} · piles : <tspan class="vl-b" fill="var(--accent)">${cur ? piles : lastS ?? '—'}</tspan>${cur ? ` sur ${rev}` : ''}</text>`;
    const mx = Math.max(5, ...counts.slice(lo, hi + 1)) * 1.15, sy = lin(0, mx, B, T);
    s += `<rect x="${sx(a - 0.5)}" y="${T}" width="${sx(b + 0.5) - sx(a - 0.5)}" height="${B - T}" fill="var(--good-soft)"/>`;
    s += axes({ L, R, T, B, sx, sy, xd: [lo, hi], yd: [0, mx], xn: 10, yn: 3, xlab: 'S = nombre de piles sur 500', ylab: 'nombre d\'expériences' });
    for (let k = lo; k <= hi; k++) if (counts[k]) { const inI = k >= a && k <= b; s += `<rect x="${(sx(k - 0.5) + 0.3).toFixed(1)}" y="${sy(counts[k]).toFixed(1)}" width="${(sx(1) - sx(0) - 0.6).toFixed(1)}" height="${(B - sy(counts[k])).toFixed(1)}" fill="var(${inI ? '--good' : '--red'})" fill-opacity="0.8"/>`; }
    if (nexp > 4) s += `<path d="${P(curve(x => nexp * phi((x - 250) / Math.sqrt(125)) / Math.sqrt(125), lo, hi, sx, sy))}" fill="none" stroke="var(--ink)" stroke-width="1.3" stroke-dasharray="5 3" opacity="0.75"/>`;
    [a, b].forEach(v => { if (v >= lo && v <= hi) s += `<line x1="${sx(v)}" x2="${sx(v)}" y1="${T - 4}" y2="${B}" stroke="var(--good)" stroke-width="1.6"/><text x="${sx(v) + (v === a ? -4 : 4)}" y="${T + 12}" class="vz-t vl-b" text-anchor="${v === a ? 'end' : 'start'}" fill="var(--good)">${v}</text>`; });
    if (lastS != null) s += `<path d="M${sx(lastS)},${B + 2}l-6,9h12z" fill="var(--warn)"/>`;
    g.innerHTML = s;
    const p = prob(Math.max(0, a), Math.min(NT, b));
    let o = nexp ? `<b>${fmtI(nexp)}</b> expériences : <b>${fmtI(ins)}</b> dans [${a} ; ${b}], soit <b>${pc(ins / nexp)}</b>. Probabilité exacte (loi binomiale B(500 ; 0,5)) : ${pc(p)}. ` : 'Lance les expériences. ';
    o += iv === 0 ? '<b>Observe :</b> environ 95 expériences sur 100 tombent dans [250 ± 1,96 √125] ≈ [228 ; 272]. Le paramètre p₀ = 0,5 est connu, l\'intervalle est fixe : c\'est S qui varie.'
      : iv === 1 ? '<b>Observe :</b> avec ℓ = 2,576, l\'intervalle s\'élargit et contient environ 99 % des expériences.'
      : iv === 2 ? '<b>Observe :</b> [240 ; 260] est trop étroit : environ une expérience sur trois en sort !'
      : '<b>Observe :</b> [180 ; 320] contient toujours S, mais il est inutilement large : il n\'apprend rien.';
    q(el, '[data-o=out]').innerHTML = o;
  };
  const anim = loop(el, () => {
    if (!cur) newExp();
    const step = [8, 25, 60, 160, 500][speed - 1]; rev = Math.min(NT, rev + step);
    if (rev >= NT) { finish(); draw(); cur = null; return true; }
    draw(); return true;
  }, on => { bPlay.textContent = playLabel(on); });
  bPlay.onclick = () => { if (anim.on) anim.pause(); else if (RM()) { for (let i = 0; i < 20; i++) { newExp(); finish(); } cur = null; draw(); } else anim.play(); };
  q(el, '[data-i=many]').onclick = () => { for (let i = 0; i < 200; i++) { newExp(); finish(); } cur = null; draw(); };
  q(el, '[data-i=new]').onclick = () => { anim.pause(); seed++; reset(); draw(); };
  const sp = q(el, '[data-i=sp]'); const spo = () => { speed = +sp.value; q(el, '[data-o=sp]').textContent = '×' + speed; }; sp.oninput = spo; spo();
  el.querySelectorAll('[data-iv]').forEach(b => { b.onclick = () => { iv = +b.dataset.iv; setSeg(el, 'iv', iv); draw(); }; });
  reset(); draw(); bPlay.textContent = playLabel(false);
  onVisible(el, () => { if (!RM()) anim.play(); });
}

/* ================================================================== s2 · intervalles de confiance qui tombent */
function icViz(el) {
  const NS = [5, 10, 20, 30, 50, 100, 200], LV = [[90, 1.6449], [95, 1.96], [99, 2.5758]], mu = 50, sig = 10;
  const W = 400, ROWS = 42, rowH = 6.4, T = 26, L = 14, R = W - 14, H = T + ROWS * rowH + 34, xd = [32, 68];
  let ni = 3, lv = 1, sm = 'hat', seed = 11, r, list = [], tot = 0, cov = 0, shift = 0, speed = 3, acc = 0;
  el.innerHTML = head('Intervalle de confiance : 100 intervalles qui tombent', 'Chaque ligne est un nouvel échantillon de taille n tiré de N(μ = 50 ; σ = 10), avec son intervalle [X̄ ± ℓ σ/√n]. Vert s\'il contient μ, rouge sinon.') +
    `<div class="viz-ctrl">${range('n', 'taille n =', 0, NS.length - 1, 1, ni)}${seg('lv', LV.map((v, i) => [i, `niveau ${v[0]} %`]), lv, 'niveau de confiance')}</div>
     <div class="viz-ctrl">${seg('sm', [['known', 'σ connu'], ['hat', 'σ estimé par σ̂']], sm, 'variance')}${range('sp', 'vitesse', 1, 5, 1, speed)}</div>
     <div class="viz-ctrl"><span class="viz-btns"><button type="button" class="btn small primary" data-i="play"></button><button type="button" class="btn small" data-i="many">+ 100 intervalles</button><button type="button" class="btn small" data-i="new">Remise à zéro</button></span></div>
     ${svgTag(W, H, 'Intervalles de confiance successifs et valeur de μ')}
     <div class="vl-meter-row"><span>couverture observée</span><div class="vl-meter" aria-hidden="true"><i data-o="bar"></i><b data-o="tick"></b></div></div>
     <p class="viz-out" data-o="out" aria-live="polite"></p>`;
  const g = q(el, '[data-s=g]'), bPlay = q(el, '[data-i=play]'), sx = lin(xd[0], xd[1], L, R);
  const reset = () => { r = rng(seed * 4099 + ni * 17); list = []; tot = 0; cov = 0; shift = 0; };
  const one = () => {
    const n = NS[ni], l = LV[lv][1]; let s = 0, s2 = 0;
    for (let i = 0; i < n; i++) { const x = mu + sig * gauss(r); s += x; s2 += x * x; }
    const m = s / n, sh = Math.sqrt(Math.max(0, s2 / n - m * m)), half = l * (sm === 'known' ? sig : sh) / Math.sqrt(n);
    const ok = m - half <= mu && mu <= m + half; tot++; if (ok) cov++;
    list.unshift({ m, a: m - half, b: m + half, ok }); if (list.length > ROWS + 2) list.pop();
  };
  const draw = () => {
    let s = '';
    s += `<rect x="${L}" y="${T}" width="${R - L}" height="${ROWS * rowH}" fill="var(--paper-2)" rx="4"/>`;
    s += axes({ L, R, T, B: T + ROWS * rowH + 2, sx, xd, xn: 9, xlab: 'valeur' });
    const y = i => T + (i + shift) * rowH + rowH / 2;
    list.forEach((it, i) => {
      if (i + shift >= ROWS) return;
      const c = it.ok ? '--good' : '--red', a = clamp(sx(it.a), L, R), b = clamp(sx(it.b), L, R), yy = y(i).toFixed(1), op = i === 0 ? Math.max(0.15, 1 - shift) : 1;
      s += `<g opacity="${op.toFixed(2)}"><line x1="${a.toFixed(1)}" x2="${b.toFixed(1)}" y1="${yy}" y2="${yy}" stroke="var(${c})" stroke-width="${it.ok ? 2.2 : 3}" stroke-linecap="round"/><circle cx="${sx(it.m).toFixed(1)}" cy="${yy}" r="1.9" fill="var(--ink)"/></g>`;
    });
    s += `<line x1="${sx(mu)}" x2="${sx(mu)}" y1="${T - 6}" y2="${T + ROWS * rowH}" stroke="var(--ink)" stroke-width="1.6" stroke-dasharray="6 3"/>`;
    s += `<text x="${sx(mu)}" y="${T - 10}" class="vz-t vl-b" text-anchor="middle">μ = 50 (inconnu en pratique)</text>`;
    g.innerHTML = s;
    q(el, '[data-o=n]').textContent = NS[ni];
    const c = tot ? cov / tot : 0, lvl = LV[lv][0];
    q(el, '[data-o=bar]').style.width = (100 * c) + '%';
    q(el, '[data-o=tick]').style.left = lvl + '%';
    const half = LV[lv][1] * sig / Math.sqrt(NS[ni]);
    let o = tot ? `<b>${fmtI(tot)}</b> intervalles, dont <b>${fmtI(cov)}</b> contiennent μ : couverture <b>${pc(c)}</b> (niveau annoncé ${lvl} %). ` : '';
    o += `Largeur ${sm === 'known' ? '' : 'moyenne ≈ '}2 ℓ σ/√n = 2 × ${fmt(LV[lv][1], 3)} × 10/√${NS[ni]} = <b>${fmt(2 * half, 2)}</b>. `;
    o += sm === 'hat' && NS[ni] <= 10 ? '<b>Observe :</b> avec σ estimé et n petit, la couverture réelle est plus faible que le niveau annoncé : il faut n grand (ou la loi de Student). '
      : '<b>Observe :</b> c\'est l\'intervalle qui bouge, pas μ ; à 95 %, environ 1 intervalle sur 20 rate μ. Augmente n : les intervalles rétrécissent comme 1/√n. ';
    q(el, '[data-o=out]').innerHTML = o;
  };
  const anim = loop(el, dt => {
    acc += dt; const every = [700, 350, 160, 60, 16][speed - 1];
    if (shift > 0) shift = Math.max(0, shift - dt / Math.min(every, 260));
    if (acc >= every) { const k = speed === 5 ? 3 : 1; for (let i = 0; i < k; i++) one(); acc = 0; shift = speed >= 4 ? 0 : 1; }
    draw(); return true;
  }, on => { bPlay.textContent = playLabel(on); });
  const restart = () => { reset(); draw(); };
  bPlay.onclick = () => { if (anim.on) anim.pause(); else if (RM()) { for (let i = 0; i < 100; i++) one(); shift = 0; draw(); } else anim.play(); };
  q(el, '[data-i=many]').onclick = () => { for (let i = 0; i < 100; i++) one(); shift = 0; draw(); };
  q(el, '[data-i=new]').onclick = () => { seed++; restart(); };
  const nIn = q(el, '[data-i=n]'); nIn.oninput = () => { ni = +nIn.value; restart(); };
  const sp = q(el, '[data-i=sp]'); const spo = () => { speed = +sp.value; q(el, '[data-o=sp]').textContent = '×' + speed; }; sp.oninput = spo; spo();
  el.querySelectorAll('[data-lv]').forEach(b => { b.onclick = () => { lv = +b.dataset.lv; setSeg(el, 'lv', lv); restart(); }; });
  el.querySelectorAll('[data-sm]').forEach(b => { b.onclick = () => { sm = b.dataset.sm; setSeg(el, 'sm', sm); restart(); }; });
  reset(); draw(); bPlay.textContent = playLabel(false);
  onVisible(el, () => { if (RM()) { for (let i = 0; i < 100; i++) one(); draw(); } else anim.play(); });
}

/* ================================================================== s2 · IC d'une proportion (sondage) */
function propViz(el) {
  const PRE = [[42, 98], [565, 1000], [200, 1000], [500, 1000], [900, 1000]], W = 400, H = 196, L = 16, R = W - 16;
  let n = 98, k = 42, lv = 95, view = null, stop = () => {};
  el.innerHTML = head('IC d\'une proportion : le sondage', 'Règle n (personnes interrogées) et k (votes pour A), ou choisis un exemple du cours. L\'intervalle [p̂ ± ℓ √(p̂(1 − p̂)/n)] se recalcule.') +
    `<div class="viz-ctrl"><span class="vz-seg">${PRE.map(([a, b]) => `<button type="button" class="chip" data-pre="${a}/${b}">${a} / ${b}</button>`).join('')}</span></div>
     <div class="viz-ctrl">${range('n', 'n =', 20, 2000, 1, n)}${range('k', 'k =', 0, n, 1, k)}${seg('lv', [[95, '95 %'], [99, '99 %']], lv, 'niveau')}</div>
     ${svgTag(W, H, 'Intervalle de confiance de la proportion et seuil 0,5')}<div class="vl-badges" data-o="badge"></div><p class="viz-out" data-o="out" aria-live="polite"></p>`;
  const g = q(el, '[data-s=g]'), nIn = q(el, '[data-i=n]'), kIn = q(el, '[data-i=k]');
  const target = () => { const p = k / n, se = Math.sqrt(p * (1 - p) / n), l = lv === 95 ? 1.96 : 2.5758, h = l * se, lo = Math.max(0, Math.min(p - 5 * Math.max(se, 0.004), 0.47)), hi = Math.min(1, Math.max(p + 5 * Math.max(se, 0.004), 0.53)); return [p, se, h, lo, hi]; };
  const draw = v => {
    const [p, se, h, lo, hi] = v, T0 = 20, sm = lin(0, 1, L, R), T = 70, B = H - 34, sx = lin(lo, hi, L, R);
    let s = `<text x="${L}" y="${T0 - 7}" class="vz-t vl-s">vue d'ensemble [0 ; 1]</text><line x1="${L}" x2="${R}" y1="${T0 + 6}" y2="${T0 + 6}" class="vz-axis"/>`;
    [0, 0.25, 0.5, 0.75, 1].forEach(t => { s += `<line x1="${sm(t)}" x2="${sm(t)}" y1="${T0 + 3}" y2="${T0 + 9}" class="vz-axis"/><text x="${sm(t)}" y="${T0 + 21}" class="vz-t vl-s" text-anchor="middle">${fmt(t, t % 0.5 ? 2 : 1)}</text>`; });
    s += `<rect x="${sm(lo)}" y="${T0}" width="${sm(hi) - sm(lo)}" height="12" fill="none" stroke="var(--muted)" stroke-dasharray="2 2"/>`;
    s += `<line x1="${sm(Math.max(0, p - h))}" x2="${sm(Math.min(1, p + h))}" y1="${T0 + 6}" y2="${T0 + 6}" stroke="var(--accent)" stroke-width="5" stroke-linecap="round"/>`;
    s += `<path d="M${sm(lo)},${T0 + 12}L${L},${T - 12}M${sm(hi)},${T0 + 12}L${R},${T - 12}" stroke="var(--line-strong)" fill="none" stroke-dasharray="2 3"/>`;
    const f = x => phi((x - p) / se) / se, top = phi(0) / se, sy = lin(0, top * 1.12, B, T);
    s += `<path d="${area(f, Math.max(lo, p - h), Math.min(hi, p + h), sx, sy, B, 100)}" fill="var(--accent-soft)" stroke="none"/>`;
    s += `<path d="${P(curve(f, lo, hi, sx, sy, 160))}" fill="none" stroke="var(--accent)" stroke-width="1.6"/>`;
    s += axes({ L, R, T, B, sx, xd: [lo, hi], xn: 6, xlab: 'proportion p' });
    if (0.5 >= lo && 0.5 <= hi) s += `<line x1="${sx(0.5)}" x2="${sx(0.5)}" y1="${T - 8}" y2="${B}" stroke="var(--red)" stroke-width="1.8" stroke-dasharray="6 3"/><text x="${sx(0.5)}" y="${T - 11}" class="vz-t vl-b" text-anchor="middle" fill="var(--red)">0,5</text>`;
    const a = sx(Math.max(lo, p - h)), b = sx(Math.min(hi, p + h)), yb = B - 10;
    s += `<line x1="${a}" x2="${b}" y1="${yb}" y2="${yb}" stroke="var(--accent)" stroke-width="5" stroke-linecap="round"/><circle cx="${sx(p)}" cy="${yb}" r="5" fill="var(--ink)" stroke="var(--paper)" stroke-width="1.5"/>`;
    s += `<text x="${a}" y="${yb - 9}" class="vz-t vl-s" text-anchor="middle">${fmt(p - h, 3)}</text><text x="${b}" y="${yb - 9}" class="vz-t vl-s" text-anchor="middle">${fmt(p + h, 3)}</text>`;
    s += `<text x="${sx(p)}" y="${sy(top) - 6}" class="vz-t vl-b" text-anchor="middle">p̂ = ${fmt(p, 3)}</text>`;
    g.innerHTML = s;
  };
  const update = (animate = true) => {
    q(el, '[data-o=n]').textContent = fmtI(n); q(el, '[data-o=k]').textContent = fmtI(k);
    kIn.max = n; kIn.value = k;
    el.querySelectorAll('[data-pre]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pre === `${k}/${n}`)));
    const to = target(), [p, se, h] = to, a = p - h, b = p + h;
    stop(); if (view && animate) stop = tween(el, view, to, 550, v => { view = v; draw(v); }); else { view = to; draw(to); }
    const l = lv === 95 ? '1,96' : '2,576';
    const kind = a > 0.5 ? 'up' : b < 0.5 ? 'down' : 'in';
    q(el, '[data-o=badge]').innerHTML = `<span class="vl-badge ${kind === 'in' ? 'vl-warn' : kind === 'up' ? 'vl-ok' : 'vl-rej'} vl-bump">${kind === 'in' ? '0,5 ∈ IC : l\'élection de A reste possible' : kind === 'up' ? 'IC au-dessus de 0,5 : A est en tête' : 'IC sous 0,5 : A est battu'}</span>`;
    q(el, '[data-o=out]').innerHTML = `p̂ = ${k}/${fmtI(n)} = <b>${fmt(p, 3)}</b>, √(p̂(1 − p̂)/n) = ${fmt(se, 4)}, marge ℓ × ${fmt(se, 4)} = ${l} × ${fmt(se, 4)} = <b>${fmt(h, 3)}</b> → IC<sub>${lv} %</sub>(p) = <b>[${fmt(a, 3)} ; ${fmt(b, 3)}]</b>. ` +
      `<b>Observe :</b> pour diviser la marge par 2, il faut interroger 4 fois plus de personnes (marge ∝ 1/√n)${kind === 'in' ? ' ; tant que 0,5 est dans l\'intervalle, on ne peut pas conclure.' : `, et un intervalle qui ne contient pas 0,5 permet de conclure au risque ${100 - lv} %.`}`;
  };
  nIn.oninput = () => { const p = k / n; n = +nIn.value; k = Math.round(p * n); update(false); };
  kIn.oninput = () => { k = +kIn.value; update(false); };
  el.querySelectorAll('[data-pre]').forEach(b => { b.onclick = () => { [k, n] = b.dataset.pre.split('/').map(Number); nIn.value = n; update(); }; });
  el.querySelectorAll('[data-lv]').forEach(b => { b.onclick = () => { lv = +b.dataset.lv; setSeg(el, 'lv', lv); update(); }; });
  update(false);
}

/* ================================================================== s2 · comparer deux IC */
function twoIcViz(el) {
  const W = 400, H = 170, L = 20, R = W - 16, xd = [45, 140], m1 = 75.6, h1 = 12.5, H2 = 15.3, M2 = 104.4;
  let n = 10, m2 = M2, stop = () => {};
  el.innerHTML = head('Comparer deux groupes avec leurs IC', 'Exercice des deux parcelles (n = 10) : groupe 1 près de l\'usine [63,1 ; 88,1], groupe 2 [89,1 ; 119,7]. Déplace la moyenne du groupe 2 ou change n.') +
    `<div class="viz-ctrl">${range('m', 'moyenne du groupe 2 =', 60, 125, 0.1, m2)}${range('n', 'n par groupe =', 4, 60, 1, n)}<button type="button" class="btn small" data-i="ex">Valeurs de l'exercice</button></div>
     ${svgTag(W, H, 'Deux intervalles de confiance')}<div class="vl-badges" data-o="badge"></div><p class="viz-out" data-o="out" aria-live="polite"></p>`;
  const g = q(el, '[data-s=g]'), sx = lin(xd[0], xd[1], L, R), mIn = q(el, '[data-i=m]'), nIn = q(el, '[data-i=n]');
  const draw = () => {
    const k = Math.sqrt(10 / n), a1 = m1 - h1 * k, b1 = m1 + h1 * k, a2 = m2 - H2 * k, b2 = m2 + H2 * k, y1 = 48, y2 = 104, B = H - 34;
    let s = axes({ L, R, T: 10, B, sx, xd, xn: 8, xlab: 'rendement moyen' });
    const ov = Math.min(b1, b2) - Math.max(a1, a2);
    if (ov > 0) s += `<rect x="${sx(Math.max(a1, a2))}" y="${y1 - 18}" width="${sx(Math.min(b1, b2)) - sx(Math.max(a1, a2))}" height="${y2 - y1 + 36}" fill="var(--warn-soft)" stroke="var(--warn)" stroke-dasharray="4 3"/><text x="${sx((Math.max(a1, a2) + Math.min(b1, b2)) / 2)}" y="${(y1 + y2) / 2 + 4}" class="vz-t vl-b" text-anchor="middle" fill="var(--warn)">chevauchement</text>`;
    else { const lo = Math.min(b1, b2), hi = Math.max(a1, a2); s += `<rect x="${sx(lo)}" y="${y1 - 18}" width="${sx(hi) - sx(lo)}" height="${y2 - y1 + 36}" fill="var(--good-soft)" stroke="var(--good)" stroke-dasharray="4 3"/><text x="${sx((lo + hi) / 2)}" y="${(y1 + y2) / 2 + 4}" class="vz-t vl-b" text-anchor="middle" fill="var(--good)">${hi - lo > 6 ? 'écart' : ''}</text>`; }
    [[a1, b1, m1, y1, '--c1', 'groupe 1 (près de l\'usine)'], [a2, b2, m2, y2, '--c2', 'groupe 2']].forEach(([a, b, m, y, c, lab]) => {
      s += `<line x1="${sx(a)}" x2="${sx(b)}" y1="${y}" y2="${y}" stroke="var(${c})" stroke-width="7" stroke-linecap="round"/><circle cx="${sx(m)}" cy="${y}" r="5.5" fill="var(--paper)" stroke="var(${c})" stroke-width="2.5"/>`;
      s += `<text x="${sx(a)}" y="${y + 20}" class="vz-t vl-s" text-anchor="middle">${fmt(a, 1)}</text><text x="${sx(b)}" y="${y + 20}" class="vz-t vl-s" text-anchor="middle">${fmt(b, 1)}</text><text x="${sx(m)}" y="${y - 12}" class="vz-t vl-b" text-anchor="middle" fill="var(${c})">${lab}</text>`;
    });
    g.innerHTML = s;
    q(el, '[data-o=m]').textContent = fmt(m2, 1); q(el, '[data-o=n]').textContent = n;
    q(el, '[data-o=badge]').innerHTML = ov > 0 ? '<span class="vl-badge vl-warn">IC qui se chevauchent : on ne peut pas conclure</span>' : '<span class="vl-badge vl-ok">IC disjoints : les moyennes semblent différentes</span>';
    q(el, '[data-o=out]').innerHTML = `Groupe 1 : [${fmt(a1, 1)} ; ${fmt(b1, 1)}], groupe 2 : [${fmt(a2, 1)} ; ${fmt(b2, 1)}] (demi-largeurs ∝ 1/√n). ` +
      (ov > 0 ? '<b>Observe :</b> un chevauchement ne prouve pas que les moyennes sont égales ; il dit seulement que les données ne suffisent pas à les distinguer. Augmente n : les intervalles rétrécissent.' : '<b>Observe :</b> des intervalles disjoints indiquent des moyennes différentes. Avec n = 10, il faut supposer les rendements gaussiens ; un test de comparaison de moyennes (t.test) est plus rigoureux.');
  };
  mIn.oninput = () => { stop(); m2 = +mIn.value; draw(); };
  nIn.oninput = () => { stop(); n = +nIn.value; draw(); };
  q(el, '[data-i=ex]').onclick = () => { stop(); stop = tween(el, [m2, n], [M2, 10], 600, v => { m2 = v[0]; n = Math.round(v[1]); mIn.value = m2; nIn.value = n; draw(); }); };
  draw();
}

/* ================================================================== s3 · principe d'un test : le chocolat */
function testViz(el) {
  const s0 = 0.4, EFF = -0.8, W = 400, H = 256, L = 16, R = W - 16, T = 40, B = 176, xd = [-1.6, 1.6];
  const AL = [[0.1, '10 %'], [0.05, '5 %'], [0.01, '1 %'], [0.001, '0,1 %']];
  const hatch = uid('hatch');
  let al = 0.05, M = -0.85, mode = 'h0', seed = 21, r = rng(seed * 977), hist = [], stop = () => {}, busy = false, bump = false;
  el.innerHTML = head('Le test du chocolat : zone de rejet et p-valeur', 'Sous H0 (« le chocolat ne fait rien »), la variation moyenne de poids M suit N(0 ; 0,4²). Fais glisser M_obs (ou le curseur) et choisis α.') +
    `<div class="viz-ctrl">${seg('al', AL.map(([v, l]) => [v, 'α = ' + l]), al, 'risque alpha')}</div>
     <div class="viz-ctrl">${range('m', 'M_obs =', -1.6, 1.6, 0.01, M)}</div>
     ${svgTag(W, H, 'Densité de M sous H0, zones de rejet et p-valeur')}
     <div class="vl-badges" data-o="badge" aria-live="polite"></div>
     ${leg([['a', '--red', 'zone de rejet (probabilité α)'], ['a', '--warn', 'p-valeur (aire au-delà de |M_obs|)']])}
     <div class="viz-ctrl"><span class="viz-btns"><button type="button" class="btn small primary" data-i="one">Simuler une étude</button><button type="button" class="btn small" data-i="twenty">Simuler 20 études</button></span>${seg('mode', [['h0', 'pas d\'effet (H0 vraie)'], ['h1', 'vrai effet : −0,8 kg']], mode, 'vérité')}</div>
     <p class="viz-out" data-o="out" aria-live="polite"></p>`;
  const g = q(el, '[data-s=g]'), sx = lin(xd[0], xd[1], L, R), mIn = q(el, '[data-i=m]');
  const f = x => phi(x / s0) / s0, sy = lin(0, f(0) * 1.12, B, T);
  const pval = m => 2 * (1 - Phi(Math.abs(m) / s0));
  const draw = () => {
    const c = qnorm(1 - al / 2) * s0, a = Math.abs(M), p = pval(M), rej = p <= al;
    let s = `<defs><pattern id="${hatch}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="var(--warn)" fill-opacity="0.18"/><line x1="0" y1="0" x2="0" y2="6" stroke="var(--warn)" stroke-width="2.4"/></pattern></defs>`;
    s += `<text x="${L}" y="${12}" class="vz-t vl-s">densité de M sous H0 : N(0 ; 0,4²)</text>`;
    s += `<path d="${area(f, xd[0], -c, sx, sy, B)}" fill="var(--red)" fill-opacity="0.22"/><path d="${area(f, c, xd[1], sx, sy, B)}" fill="var(--red)" fill-opacity="0.22"/>`;
    s += `<path d="${area(f, xd[0], -a, sx, sy, B)}" fill="url(#${hatch})"/><path d="${area(f, a, xd[1], sx, sy, B)}" fill="url(#${hatch})"/>`;
    s += `<path d="${P(curve(f, xd[0], xd[1], sx, sy))}" fill="none" stroke="var(--accent)" stroke-width="2.2"/>`;
    s += `<line x1="${sx(xd[0])}" x2="${sx(-c)}" y1="${B}" y2="${B}" stroke="var(--red)" stroke-width="5"/><line x1="${sx(c)}" x2="${sx(xd[1])}" y1="${B}" y2="${B}" stroke="var(--red)" stroke-width="5"/>`;
    [-c, c].forEach(v => { s += `<line x1="${sx(v)}" x2="${sx(v)}" y1="${T + 30}" y2="${B}" stroke="var(--red)" stroke-dasharray="4 3"/><text x="${sx(v)}" y="${T + 26}" class="vz-t vl-s" text-anchor="middle" fill="var(--red)">${fmt(v, 2)}</text>`; });
    s += `<text x="${sx(xd[0]) + 2}" y="${B - 46}" class="vz-t vl-s" fill="var(--red)">rejet</text><text x="${sx(xd[1]) - 2}" y="${B - 46}" class="vz-t vl-s" text-anchor="end" fill="var(--red)">rejet</text>`;
    s += axes({ L, R, T, B, sx, xd, xn: 8, xlab: 'M = variation moyenne de poids (kg)' });
    hist.forEach((h, i) => { s += `<circle cx="${sx(clamp(h, xd[0], xd[1])).toFixed(1)}" cy="${B + 46 + (i % 3) * 5}" r="3.2" fill="var(${pval(h) <= al ? '--red' : '--muted'})" fill-opacity="0.8"/>`; });
    if (hist.length) s += `<text x="${R}" y="${B + 66}" class="vz-t vl-s" text-anchor="end">études simulées</text>`;
    const xm = sx(M);
    s += `<line x1="${xm}" x2="${xm}" y1="${T - 2}" y2="${B}" stroke="var(--ink)" stroke-width="2"/>`;
    s += `<text x="${clamp(xm, L + 50, R - 50)}" y="${T - 4}" class="vz-t vl-b" text-anchor="middle">M_obs = ${fmt(M, 2)} kg</text>`;
    s += `<g class="vl-handle"><circle cx="${xm}" cy="${B}" r="10" fill="var(--ink)" stroke="var(--paper)" stroke-width="2"/><path d="M${xm - 4},${B}h8M${xm - 2},${B - 3}l-3,3l3,3M${xm + 2},${B - 3}l3,3l-3,3" stroke="var(--paper)" fill="none" stroke-width="1.4"/></g>`;
    g.innerHTML = s;
    q(el, '[data-o=m]').textContent = fmt(M, 2) + ' kg'; mIn.value = M;
    q(el, '[data-o=badge]').innerHTML = `<span class="vl-badge ${rej ? 'vl-rej' : 'vl-ok'}${bump ? ' vl-bump' : ''}">${rej ? 'Rejet de H0 : effet « significatif »' : 'Non-rejet de H0 : on ne peut pas conclure'}</span><span class="vl-badge"><span class="vl-mono">p = ${p < 0.0001 ? '< 0,0001' : fmt(p, 4)}</span>&nbsp;${rej ? '≤' : '>'} α = ${fmt(al, al < 0.01 ? 3 : 2)}</span>`;
    bump = false;
    const nr = hist.filter(h => pval(h) <= al).length, pw = Phi((-c - EFF) / s0) + 1 - Phi((c - EFF) / s0);
    let o = `p-valeur = P<sub>H0</sub>(|M| ≥ ${fmt(a, 2)}) = 2 × (1 − Φ(${fmt(a, 2)}/0,4)) = <b>${fmt(p, 4)}</b>. Zone de rejet : |M| > ${fmt(qnorm(1 - al / 2), 3)} × 0,4 = ${fmt(c, 3)} kg. `;
    if (hist.length) o += `<br><b>${hist.length}</b> études simulées (${mode === 'h0' ? 'sans effet' : 'avec un vrai effet'}) : <b>${nr}</b> rejet${nr > 1 ? 's' : ''} (${pc(nr / hist.length, 0)}). ${mode === 'h0' ? `Sous H0 on rejette à tort environ α = ${pc(al, al < 0.01 ? 1 : 0)} du temps : ce sont des fausses découvertes.` : `Avec un vrai effet, la proportion de rejets est la puissance (théorique : ${pc(pw, 0)}).`}`;
    else o += '<b>Observe :</b> plus M_obs est loin de 0, plus la p-valeur est petite ; on rejette H0 dès que M_obs entre dans la zone rouge, c\'est-à-dire quand p ≤ α.';
    q(el, '[data-o=out]').innerHTML = o;
  };
  const setM = v => { stop(); M = Math.round(clamp(v, xd[0], xd[1]) * 100) / 100; draw(); };
  mIn.oninput = () => setM(+mIn.value);
  dragX(g, W, () => sx(M), x => setM(xd[0] + (x - L) / (R - L) * (xd[1] - xd[0])));
  const sim = (k, ms) => {
    if (k <= 0) { busy = false; return; }
    busy = true; const m = (mode === 'h1' ? EFF : 0) + s0 * gauss(r);
    stop(); stop = tween(el, M, m, ms, v => { M = v; draw(); }, () => { M = m; hist.push(m); if (hist.length > 120) hist.shift(); bump = true; draw(); setTimeout(() => sim(k - 1, ms), RM() ? 0 : 60); });
  };
  q(el, '[data-i=one]').onclick = () => { if (!busy) sim(1, 650); };
  q(el, '[data-i=twenty]').onclick = () => { if (!busy) sim(20, 220); };
  el.querySelectorAll('[data-al]').forEach(b => { b.onclick = () => { al = +b.dataset.al; setSeg(el, 'al', al); bump = true; draw(); }; });
  el.querySelectorAll('[data-mode]').forEach(b => { b.onclick = () => { mode = b.dataset.mode; setSeg(el, 'mode', mode); hist = []; draw(); }; });
  draw();
}

/* ================================================================== s3 · erreurs de type I et II */
function errViz(el) {
  const AL = [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.2], W = 400, H = 232, L = 16, R = W - 16, T = 30, B = 190;
  let ai = 4, d = 0.5, n = 10, c = qnorm(0.95), view = null, stop = () => {};
  el.innerHTML = head('Erreurs de type I et II', 'Test unilatéral : on rejette H0 si la statistique Z dépasse le seuil c. Sous H0, Z ~ N(0, 1) ; sous H1, Z ~ N(δ, 1) avec δ = d √n. Fais glisser le seuil.') +
    `<div class="viz-ctrl">${range('a', 'α =', 0, AL.length - 1, 1, ai)}${range('d', 'effet d =', 0, 1.2, 0.05, d)}${range('n', 'n =', 1, 40, 1, n)}</div>
     ${svgTag(W, H, 'Densités sous H0 et H1, risques alpha et beta')}
     ${leg([['l', '--accent', 'Z sous H0 (pas d\'effet)'], ['l', '--c2', 'Z sous H1 (effet réel)'], ['a', '--red', 'α : fausse découverte'], ['a', '--warn', 'β : découverte manquée']])}
     <div class="vl-cm" data-o="cm"></div><p class="viz-out" data-o="out" aria-live="polite"></p>`;
  const g = q(el, '[data-s=g]'), aIn = q(el, '[data-i=a]');
  const draw = ([cc, del, xmax]) => {
    const xd = [-3.8, xmax], sx = lin(xd[0], xd[1], L, R), sy = lin(0, 0.5, B, T), f0 = phi, f1 = x => phi(x - del);
    let s = `<path d="${area(f1, xd[0], cc, sx, sy, B)}" fill="var(--warn)" fill-opacity="0.35"/><path d="${area(f1, cc, xd[1], sx, sy, B)}" fill="var(--good)" fill-opacity="0.12"/>`;
    s += `<path d="${area(f0, cc, xd[1], sx, sy, B)}" fill="var(--red)" fill-opacity="0.45"/>`;
    s += `<path d="${P(curve(f0, xd[0], xd[1], sx, sy))}" fill="none" stroke="var(--accent)" stroke-width="2.2"/><path d="${P(curve(f1, xd[0], xd[1], sx, sy))}" fill="none" stroke="var(--c2)" stroke-width="2.2"/>`;
    s += axes({ L, R, T, B, sx, xd, xn: 8, xlab: 'statistique de test Z' });
    s += `<text x="${sx(0)}" y="${sy(phi(0)) - 6}" class="vz-t vl-b" text-anchor="middle" fill="var(--accent)">H0</text><text x="${sx(del)}" y="${sy(phi(0)) - (Math.abs(del) < 0.6 ? 20 : 6)}" class="vz-t vl-b" text-anchor="middle" fill="var(--c2)">H1 (δ = ${fmt(del, 2)})</text>`;
    const xc = sx(cc);
    s += `<line x1="${xc}" x2="${xc}" y1="${T - 8}" y2="${B}" stroke="var(--ink)" stroke-width="2"/><text x="${clamp(xc, L + 40, R - 40)}" y="${T - 12}" class="vz-t vl-b" text-anchor="middle">seuil c = ${fmt(cc, 2)}</text>`;
    s += `<text x="${xc + 6}" y="${B - 8}" class="vz-t vl-b" fill="var(--red)">α</text><text x="${xc - 6}" y="${B - 8}" class="vz-t vl-b" text-anchor="end" fill="var(--warn)">β</text>`;
    s += `<text x="${xc + 6}" y="${T + 8}" class="vz-t vl-s" fill="var(--red)">rejet de H0 →</text><text x="${xc - 6}" y="${T + 8}" class="vz-t vl-s" text-anchor="end">← non-rejet</text>`;
    s += `<g class="vl-handle"><circle cx="${xc}" cy="${B}" r="10" fill="var(--ink)" stroke="var(--paper)" stroke-width="2"/><path d="M${xc - 2},${B - 3}l-3,3l3,3M${xc + 2},${B - 3}l3,3l-3,3" stroke="var(--paper)" fill="none" stroke-width="1.4"/></g>`;
    g.innerHTML = s;
  };
  const update = (anim = true) => {
    const del = d * Math.sqrt(n), to = [c, del, Math.max(4.6, del + 3.6)];
    stop(); if (view && anim) stop = tween(el, view, to, 420, v => { view = v; draw(v); }); else { view = to; draw(to); }
    const a = 1 - Phi(c), b = Phi(c - del);
    q(el, '[data-o=a]').textContent = fmt(a * 100, a < 0.01 ? 2 : 1) + ' %'; q(el, '[data-o=d]').textContent = fmt(d, 2); q(el, '[data-o=n]').textContent = n;
    q(el, '[data-o=cm]').innerHTML = `<span class="h"></span><span class="h">H0 vraie</span><span class="h">H0 fausse</span>
      <span class="h">Ne pas rejeter</span><span class="ok">bonne décision<b>${pc(1 - a)}</b></span><span class="wa">type II : β<b>${pc(b)}</b></span>
      <span class="h">Rejeter H0</span><span class="ko">type I : α<b>${pc(a, a < 0.01 ? 2 : 1)}</b></span><span class="ok">puissance 1 − β<b>${pc(1 - b)}</b></span>`;
    q(el, '[data-o=out]').innerHTML = `<b>Observe :</b> déplacer le seuil vers la droite diminue α (moins de fausses découvertes) mais augmente β (plus de découvertes manquées) : on ne peut pas réduire les deux en bougeant le seuil. Pour diminuer β à α fixé, il faut un effet plus grand ou <b>plus d'observations</b> (δ = d √n grandit).`;
  };
  aIn.oninput = () => { ai = +aIn.value; c = qnorm(1 - AL[ai]); update(); };
  q(el, '[data-i=d]').oninput = e => { d = +e.target.value; update(false); };
  q(el, '[data-i=n]').oninput = e => { n = +e.target.value; update(false); };
  dragX(g, W, () => lin(-3.8, view[2], L, R)(view[0]), x => {
    const xd1 = view[2]; c = clamp(-3.8 + (x - L) / (R - L) * (xd1 + 3.8), -1, 4);
    let best = 0; AL.forEach((v, i) => { if (Math.abs(Math.log(v) - Math.log(1 - Phi(c))) < Math.abs(Math.log(AL[best]) - Math.log(1 - Phi(c)))) best = i; }); ai = best; aIn.value = ai; update(false);
  });
  update(false);
}

/* ================================================================== s3 · pêche aux p-valeurs */
const VARS = ['poids', 'cholestérol', 'sodium', 'sommeil', 'bien-être', 'tension', 'glycémie', 'protéines', 'triglycérides', 'HDL', 'LDL', 'humeur', 'énergie', 'IMC', 'tour de taille', 'appétit', 'pouls', 'concentration'];
function pecheViz(el) {
  const W = 400, R = W - 14;
  let m = 18, seed = 31, r = rng(seed), ps = [], born = [], rev = 0, studies = 0, hits = 0, auto = false, acc = 0, settle = 0, counted = true;
  el.innerHTML = head('La pêche aux p-valeurs', 'Le chocolat n\'a aucun effet, mais on mesure m variables et on fait un test à 5 % sur chacune. Sous H0, chaque p-valeur est uniforme sur [0 ; 1].') +
    `<div class="viz-ctrl"><span class="viz-btns"><button type="button" class="btn small primary" data-i="one">▶ Nouvelle étude</button><button type="button" class="btn small" data-i="auto">Enchaîner les études</button><button type="button" class="btn small" data-i="many">+ 100 études</button></span>${range('m', 'nombre de tests m =', 1, 40, 1, m)}</div>
     <svg viewBox="0 0 400 300" class="vz-svg vl-svg" role="img" aria-label="p-valeurs des m tests" data-s="g"></svg>
     <div class="vl-badges" data-o="badge" aria-live="polite"></div>
     <svg viewBox="0 0 400 160" class="vz-svg vl-svg" role="img" aria-label="Probabilité d'au moins une fausse découverte en fonction de m" data-s="c"></svg>
     <p class="viz-out" data-o="out" aria-live="polite"></p>`;
  const g = q(el, '[data-s=g]'), gc = q(el, '[data-s=c]'), bAuto = q(el, '[data-i=auto]');
  const lay = () => { const rowH = m <= 20 ? 16 : Math.max(6, 300 / m), T = 24, L = m <= 24 ? 112 : 30; return { rowH, T, L, H: T + m * rowH + 34 }; };
  const newStudy = () => { ps = Array.from({ length: m }, () => r()); born = new Array(m).fill(0); rev = 0; settle = 0; counted = false; };
  const count = () => { if (counted) return; counted = true; studies++; if (ps.some(p => p <= 0.05)) hits++; };
  const draw = now => {
    const { rowH, T, L, H } = lay(), sx = lin(0, 1, L, R);
    g.setAttribute('viewBox', `0 0 ${W} ${H}`);
    let s = `<rect x="${sx(0)}" y="${T - 4}" width="${sx(0.05) - sx(0)}" height="${m * rowH + 4}" fill="var(--red)" fill-opacity="0.16"/>`;
    s += `<line x1="${sx(0.05)}" x2="${sx(0.05)}" y1="${T - 12}" y2="${T + m * rowH}" stroke="var(--red)" stroke-width="1.6"/><text x="${sx(0.05) + 4}" y="${T - 9}" class="vz-t vl-s vl-b" fill="var(--red)">α = 0,05</text>`;
    for (let i = 0; i < m; i++) {
      const y = T + i * rowH + rowH / 2;
      if (m <= 24) s += `<text x="${L - 6}" y="${y + 4}" class="vz-t vl-s" text-anchor="end" ${i < rev && ps[i] <= 0.05 ? 'fill="var(--red)" font-weight="700"' : ''}>${VARS[i] || 'variable ' + (i + 1)}</text>`;
      s += `<line x1="${L}" x2="${R}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="0.7"/>`;
      if (i < rev) {
        const u = RM() ? 1 : clamp((now - born[i]) / 420, 0, 1), e = 1 - (1 - u) ** 3, x = sx(1) + (sx(ps[i]) - sx(1)) * e, hit = ps[i] <= 0.05;
        s += `<circle cx="${x.toFixed(1)}" cy="${y}" r="${Math.min(5, rowH / 2 - 0.5) + (hit && u >= 1 ? 1 : 0)}" fill="var(${hit ? '--red' : '--accent'})" ${hit ? '' : 'fill-opacity="0.75"'}/>`;
        if (hit && u >= 1 && rowH >= 10) s += `<text x="${x + 9}" y="${y + 4}" class="vz-t vl-s vl-b" fill="var(--red)">« découverte » !</text>`;
      }
    }
    s += axes({ L, R, T, B: T + m * rowH + 2, sx, xd: [0, 1], xn: 5, xlab: 'p-valeur' });
    g.innerHTML = s;
    const found = ps.slice(0, rev).map((p, i) => [p, i]).filter(([p]) => p <= 0.05);
    q(el, '[data-o=badge]').innerHTML = rev ? `<span class="vl-badge ${found.length ? 'vl-rej' : 'vl-ok'}">${found.length ? `${found.length} fausse${found.length > 1 ? 's' : ''} découverte${found.length > 1 ? 's' : ''} : ${found.map(([, i]) => VARS[i] || 'variable ' + (i + 1)).join(', ')}` : 'aucune p-valeur sous 0,05'}</span>` : '';
    drawCurve();
  };
  const drawCurve = () => {
    const Lc = 40, Rc = 386, T = 16, B = 124, sx = lin(1, 60, Lc, Rc), sy = lin(0, 1, B, T);
    let s = axes({ L: Lc, R: Rc, T, B, sx, sy, xd: [1, 60], yd: [0, 1], xn: 6, yn: 4, xlab: 'nombre de tests m', yf: v => fmt(v * 100, 0) + ' %' });
    s += `<path d="${P(Array.from({ length: 60 }, (_, i) => [sx(i + 1), sy(1 - 0.95 ** (i + 1))]))}" fill="none" stroke="var(--accent)" stroke-width="2.2"/>`;
    s += `<text x="${Rc}" y="${B - 10}" class="vz-t vl-s" text-anchor="end">P(au moins une fausse découverte) = 1 − 0,95<tspan dy="-5" font-size="9">m</tspan></text>`;
    const pm = 1 - 0.95 ** m;
    s += `<line x1="${sx(m)}" x2="${sx(m)}" y1="${sy(pm)}" y2="${B}" stroke="var(--accent)" stroke-dasharray="3 3"/><circle cx="${sx(m)}" cy="${sy(pm)}" r="5" fill="var(--accent)" stroke="var(--paper)" stroke-width="1.5"/>`;
    s += `<text x="${sx(m) + 8}" y="${sy(pm) + 14}" class="vz-t vl-b">m = ${m} : ${pc(pm, 0)}</text>`;
    if (studies) s += `<path d="M${sx(m)},${sy(hits / studies) - 7}l6,7l-6,7l-6,-7z" fill="var(--red)" stroke="var(--paper)"/><text x="${sx(m) - 9}" y="${sy(hits / studies) + 4}" class="vz-t vl-s" text-anchor="end" fill="var(--red)">simulé ${pc(hits / studies, 0)}</text>`;
    gc.innerHTML = s;
    q(el, '[data-o=out]').innerHTML = `${studies ? `<b>${fmtI(studies)}</b> étude${studies > 1 ? 's' : ''} simulée${studies > 1 ? 's' : ''}, dont <b>${fmtI(hits)}</b> avec au moins une « découverte » : <b>${pc(hits / studies, 0)}</b> (théorie : 1 − 0,95<sup>${m}</sup> = ${pc(1 - 0.95 ** m, 1)}). ` : ''}<b>Observe :</b> aucun effet n'existe, et pourtant avec 18 variables on trouve un résultat « significatif » dans 6 études sur 10. C'est ce qu'a fait l'étude sur le chocolat (Bohannon, 2015).`;
  };
  const anim = loop(el, dt => {
    const now = performance.now(); acc += dt;
    if (rev < m) { if (acc > Math.max(40, 1100 / m)) { born[rev] = now; rev++; acc = 0; } }
    else if (!counted && acc > 450) { count(); acc = 0; }
    else if (counted && auto && acc > 900) { newStudy(); acc = 0; }
    draw(now);
    return auto || !counted || rev < m || now - (born[m - 1] || 0) < 450;
  });
  const runOne = () => { if (!counted) { rev = m; count(); } newStudy(); acc = 0; if (RM()) { rev = m; count(); draw(0); } else anim.play(); };
  q(el, '[data-i=one]').onclick = () => { auto = false; bAuto.textContent = 'Enchaîner les études'; runOne(); };
  bAuto.onclick = () => { auto = !auto; bAuto.textContent = auto ? '❚❚ Arrêter' : 'Enchaîner les études'; if (auto) { if (RM()) { auto = false; bAuto.textContent = 'Enchaîner les études'; runOne(); } else { if (counted) newStudy(); anim.play(); } } };
  q(el, '[data-i=many]').onclick = () => { if (!counted) { rev = m; count(); } for (let k = 0; k < 100; k++) { newStudy(); rev = m; count(); } born.fill(0); draw(performance.now()); };
  const mIn = q(el, '[data-i=m]'); mIn.oninput = () => { m = +mIn.value; q(el, '[data-o=m]').textContent = m; studies = 0; hits = 0; newStudy(); counted = true; draw(performance.now()); };
  q(el, '[data-o=m]').textContent = m;
  newStudy(); counted = true; draw(0);
  onVisible(el, runOne);
}

/* ================================================================== s3 · Bonferroni et Benjamini-Hochberg pas à pas */
function bhViz(el) {
  const COURSE = [['score_A', 0.0000], ['score_B', 0.0144], ['score_C', 0.1063], ['score_D', 0.1639], ['score_E', 0.1100]];
  const W = 400, H = 236, L = 46, R = W - 14, T = 18, B = H - 40;
  let items = COURSE.map(x => x.slice()), alpha = 0.05, wk = null, wphase = 'idle', timer = 0, seed = 51;
  const toTxt = () => items.map(([, p]) => fmt(p, 4)).join(' ; ');
  el.innerHTML = head('Bonferroni et Benjamini-Hochberg pas à pas', 'p-valeurs triées p₍ᵢ₎ (points), droite de BH iα/m et seuil plat de Bonferroni α/m. Lance le déroulé de BH ou saisis tes propres p-valeurs.') +
    `<label class="vl-field" data-o="fld">p-valeurs (séparées par des points-virgules)<input type="text" inputmode="decimal" data-i="txt" value="${toTxt()}" aria-label="p-valeurs"></label>
     <div class="viz-ctrl"><span class="viz-btns"><button type="button" class="btn small primary" data-i="walk">▶ Dérouler BH</button><button type="button" class="btn small" data-i="course">Exemple du cours</button><button type="button" class="btn small" data-i="rand">Au hasard (12 tests)</button></span>${range('al', 'α =', 0.01, 0.2, 0.01, alpha)}</div>
     ${svgTag(W, H, 'p-valeurs triées et seuils de Bonferroni et Benjamini-Hochberg')}
     ${leg([['l', '--accent', 'BH : iα/m'], ['l', '--c4', 'Bonferroni : α/m'], ['d', '--muted', 'sans correction : α'], ['o', '--good', 'rejeté par BH'], ['r', '--c4', 'rejeté par Bonferroni']])}
     <p class="viz-out" data-o="st" aria-live="polite"></p><div class="vl-tab" data-o="tab"></div>`;
  const g = q(el, '[data-s=g]'), txt = q(el, '[data-i=txt]');
  const calc = () => {
    const m = items.length, srt = items.map(([nm, p], i) => ({ nm, p, i })).sort((a, b) => a.p - b.p);
    let k = 0; srt.forEach((it, j) => { if (it.p <= (j + 1) * alpha / m + 1e-12) k = j + 1; });
    const adj = srt.map((it, j) => Math.min(1, m * it.p / (j + 1))); for (let j = m - 2; j >= 0; j--) adj[j] = Math.min(adj[j], adj[j + 1]);
    return { m, srt, k, adj };
  };
  const draw = () => {
    const { m, srt, k, adj } = calc(), maxp = Math.max(...srt.map(s => s.p), 0), ymax = Math.min(1, Math.max(2 * alpha, maxp * 1.08)), sx = lin(0, m + 0.6, L, R), sy = lin(0, ymax, B, T), done = wphase === 'done';
    let s = axes({ L, R, T, B, sx: v => v, sy, xd: [0, 1], yd: [0, ymax], yn: 4, xn: 1, noX: true, ylab: 'p-valeur', yf: v => fmt(v, ymax < 0.2 ? 2 : 1) });
    s += `<line x1="${sx(0)}" x2="${R}" y1="${sy(alpha)}" y2="${sy(alpha)}" stroke="var(--muted)" stroke-dasharray="6 4"/><text x="${sx(0) + 4}" y="${sy(alpha) - 5}" class="vz-t vl-s">sans correction : α = ${fmt(alpha, 2)}</text>`;
    s += `<line x1="${sx(0)}" x2="${R}" y1="${sy(alpha / m)}" y2="${sy(alpha / m)}" stroke="var(--c4)" stroke-width="1.8"/><text x="${R}" y="${sy(alpha / m) + 13}" class="vz-t vl-s" text-anchor="end" fill="var(--c4)">α/m = ${fmt(alpha / m, 4)}</text>`;
    s += `<line x1="${sx(0)}" x2="${sx(m + 0.6)}" y1="${sy(0)}" y2="${sy(alpha * (m + 0.6) / m)}" stroke="var(--accent)" stroke-width="2"/>`;
    srt.forEach((it, j) => {
      const x = sx(j + 1), y = Math.max(T, sy(it.p)), thr = (j + 1) * alpha / m, active = wk === j + 1;
      if (m <= 14) s += `<text x="${x}" y="${B + 15}" class="vz-t vl-s" text-anchor="middle">${j + 1}</text>`;
      if (m <= 8) s += `<text x="${x}" y="${B + 28}" class="vz-t vl-s" text-anchor="middle" fill="var(--muted)">${esc(it.nm.replace('score_', ''))}</text>`;
      if (active) { const okk = it.p <= thr; s += `<line x1="${x}" x2="${x}" y1="${y}" y2="${sy(thr)}" stroke="var(${okk ? '--good' : '--red'})" stroke-width="2.5" stroke-dasharray="3 2"/><circle cx="${x}" cy="${sy(thr)}" r="4" fill="var(--accent)"/><circle cx="${x}" cy="${y}" r="11" fill="none" stroke="var(${okk ? '--good' : '--red'})" stroke-width="2" class="vl-pop"/>`; }
      const rejB = done && j < k, bon = it.p <= alpha / m;
      if (done && bon) s += `<circle cx="${x}" cy="${y}" r="9.5" fill="none" stroke="var(--c4)" stroke-width="2"/>`;
      s += `<circle cx="${x}" cy="${y}" r="5.5" fill="var(${rejB ? '--good' : '--paper'})" stroke="var(${rejB ? '--good' : '--ink'})" stroke-width="1.8" ${rejB ? 'class="vl-pop"' : ''}/>`;
      if (it.p > ymax) s += `<path d="M${x - 4},${T + 2}l4,-6l4,6z" fill="var(--ink)"/>`;
    });
    s += `<text x="${R}" y="${B + 15}" class="vz-t vl-s" text-anchor="end">${m <= 14 ? '' : 'rang i →'}</text>`;
    s += `<text x="${sx(m + 0.6) - 4}" y="${sy(alpha * (m + 0.6) / m) - 6}" class="vz-t vl-s" text-anchor="end" fill="var(--accent)">iα/m</text>`;
    g.innerHTML = s;
    const nb = srt.filter(it => it.p <= alpha / m).length, nn = srt.filter(it => it.p <= alpha).length;
    let st;
    if (wphase === 'walk' && wk) { const it = srt[wk - 1], thr = wk * alpha / m; st = `<b>k = ${wk}</b> : p₍${wk}₎ = ${fmt(it.p, 4)} ${it.p <= thr ? '≤' : '>'} ${wk}α/m = ${fmt(thr, 4)} ${it.p <= thr ? '→ <b>trouvé !</b>' : '→ on descend d\'un rang'}`; }
    else if (done) st = k ? `<b>BH</b> : le plus grand k avec p₍ₖ₎ ≤ kα/m est <b>k = ${k}</b> → on rejette les ${k} plus petites p-valeurs (${k} découverte${k > 1 ? 's' : ''}). <b>Bonferroni</b> (p ≤ ${fmt(alpha / m, 4)}) : ${nb} découverte${nb > 1 ? 's' : ''} (cerclées). Sans correction : ${nn}.` : `Aucun rang ne vérifie p₍ₖ₎ ≤ kα/m : BH ne rejette rien. Bonferroni : ${nb}, sans correction : ${nn}.`;
    else st = 'Appuie sur « Dérouler BH » : on part du plus grand rang k = m et on descend jusqu\'au premier point situé sous la droite iα/m.';
    q(el, '[data-o=st]').innerHTML = st;
    const D = (b, show = true) => !show ? '<td class="vl-m">…</td>' : b ? '<td class="vl-r">rejet</td>' : '<td class="vl-m">non</td>';
    q(el, '[data-o=tab]').innerHTML = `<table class="t"><thead><tr><th>i · test</th><th>p₍ᵢ₎</th><th>iα/m</th><th>sans</th><th>Bonf.</th><th>BH</th><th>p adj. BH</th></tr></thead><tbody>${srt.map((it, j) => `<tr${wk === j + 1 && wphase === 'walk' ? ' class="vl-hi"' : ''}><td style="text-align:left">${j + 1} · ${esc(it.nm.replace('score_', ''))}</td><td class="vl-mono">${fmt(it.p, 4)}</td><td class="vl-mono">${fmt((j + 1) * alpha / m, 4)}</td>${D(it.p <= alpha)}${D(it.p <= alpha / m)}${D(j < k, done)}<td class="vl-mono">${fmt(adj[j], 4)}</td></tr>`).join('')}</tbody></table>`;
  };
  const stopWalk = () => { clearTimeout(timer); wk = null; };
  const walk = () => {
    stopWalk(); const { m, srt } = calc();
    if (RM()) { wphase = 'done'; draw(); return; }
    wphase = 'walk'; wk = m;
    const step = () => {
      if (!el.isConnected) return; draw();
      const it = srt[wk - 1];
      if (it.p <= wk * alpha / m) { timer = setTimeout(() => { wphase = 'done'; wk = null; draw(); }, 1100); return; }
      if (wk === 1) { timer = setTimeout(() => { wphase = 'done'; wk = null; draw(); }, 900); return; }
      timer = setTimeout(() => { wk--; step(); }, 850);
    };
    step();
  };
  const parse = () => {
    const raw = txt.value.replace(/,\s+/g, ';').split(/[;\s]+/).filter(Boolean).map(t => Number(t.replace(',', '.')));
    const ok = raw.length >= 2 && raw.length <= 30 && raw.every(v => isFinite(v) && v >= 0 && v <= 1);
    q(el, '[data-o=fld]').classList.toggle('vl-bad', !ok);
    if (!ok) return;
    const same = raw.length === COURSE.length && raw.every((v, i) => Math.abs(v - COURSE[i][1]) < 1e-9);
    items = raw.map((p, i) => [same ? COURSE[i][0] : 'H' + (i + 1), p]); stopWalk(); wphase = 'done'; draw();
  };
  txt.oninput = parse;
  q(el, '[data-i=walk]').onclick = walk;
  q(el, '[data-i=course]').onclick = () => { items = COURSE.map(x => x.slice()); txt.value = toTxt(); q(el, '[data-o=fld]').classList.remove('vl-bad'); walk(); };
  q(el, '[data-i=rand]').onclick = () => {
    const r = rng(++seed * 6007);
    items = Array.from({ length: 12 }, (_, i) => ['H' + (i + 1), i < 4 ? 1 - Phi(2.8 + gauss(r)) : r()]).sort(() => r() - 0.5).map((x, i) => ['H' + (i + 1), Math.round(x[1] * 1e4) / 1e4]);
    txt.value = toTxt(); q(el, '[data-o=fld]').classList.remove('vl-bad'); walk();
  };
  const aIn = q(el, '[data-i=al]'); aIn.oninput = () => { alpha = +aIn.value; q(el, '[data-o=al]').textContent = fmt(alpha, 2); stopWalk(); wphase = 'done'; draw(); };
  q(el, '[data-o=al]').textContent = fmt(alpha, 2);
  draw();
}

/* ================================================================== s3 · FWER ou FDR : simulation de m tests */
function fdrViz(el) {
  const ALPHA = 0.05, W = 400, L = 100, R = W - 10, T = 22, rowH = 28, ROWS = ['vérité', 'sans correction', 'Bonferroni', 'BH'], H = T + ROWS.length * rowH + 14;
  const MET = [['none', 'Sans corr.'], ['bonf', 'Bonferroni'], ['bh', 'BH']];
  let m = 50, m1 = 10, delta = 3, seed = 61, r, runs, S, cur = null, target = 0;
  el.innerHTML = head('FWER ou FDR ? Simulation de m tests', 'Parmi m hypothèses, m₁ correspondent à un vrai effet. Chaque case est un test, triées par p-valeur croissante. On répète l\'expérience pour estimer les taux d\'erreur.') +
    `<div class="viz-ctrl">${range('m1', 'vrais effets m₁ =', 0, 50, 1, m1)}${range('dl', 'force de l\'effet =', 1, 5, 0.5, delta)}</div>
     <div class="viz-ctrl"><span class="viz-btns"><button type="button" class="btn small primary" data-i="run">▶ 300 simulations</button><button type="button" class="btn small" data-i="one">Une simulation</button><button type="button" class="btn small" data-i="new">Remise à zéro</button></span></div>
     ${svgTag(W, H, 'Décisions des trois procédures pour la dernière simulation')}
     ${leg([['a', '--c1', 'vrai effet (ligne vérité)'], ['a', '--good', 'vraie découverte'], ['a', '--red', 'fausse découverte'], ['r', '--good', 'effet manqué'], ['a', '--c0', 'H0 vraie, non rejetée']])}
     <div class="vl-tab" data-o="tab"></div><p class="viz-out" data-o="out" aria-live="polite"></p>`;
  const g = q(el, '[data-s=g]'), bRun = q(el, '[data-i=run]');
  const reset = () => { r = rng(seed * 811 + m1 * 7 + delta * 13); runs = 0; S = Object.fromEntries(MET.map(([k]) => [k, { fw: 0, fdp: 0, pow: 0, rej: 0 }])); cur = null; target = 0; };
  const one = () => {
    const ps = Array.from({ length: m }, (_, i) => { const eff = i < m1; return { eff, p: 1 - Phi(eff ? delta + gauss(r) : gauss(r)) }; }).sort((a, b) => a.p - b.p);
    let k = 0; ps.forEach((it, j) => { if (it.p <= (j + 1) * ALPHA / m) k = j + 1; });
    const dec = { none: ps.map(it => it.p <= ALPHA), bonf: ps.map(it => it.p <= ALPHA / m), bh: ps.map((_, j) => j < k) };
    MET.forEach(([key]) => { let V = 0, Sx = 0; dec[key].forEach((d, j) => { if (d) { if (ps[j].eff) Sx++; else V++; } }); const st = S[key]; st.fw += V > 0 ? 1 : 0; st.fdp += V + Sx ? V / (V + Sx) : 0; st.pow += m1 ? Sx / m1 : 0; st.rej += V + Sx; });
    runs++; cur = { ps, dec };
  };
  const draw = () => {
    const tw = (R - L) / m; let s = '';
    ROWS.forEach((lab, k) => { s += `<text x="${L - 6}" y="${T + k * rowH + rowH / 2 + 4}" class="vz-t vl-s" text-anchor="end" ${k ? '' : 'fill="var(--muted)"'}>${lab}</text>`; });
    if (cur) cur.ps.forEach((it, j) => {
      const x = (L + j * tw + 0.6).toFixed(1), w = Math.max(1, tw - 1.2).toFixed(1);
      s += `<rect x="${x}" y="${T + 3}" width="${w}" height="${rowH - 8}" rx="1.5" fill="var(${it.eff ? '--c1' : '--c0'})" fill-opacity="${it.eff ? 0.9 : 0.35}"/>`;
      ['none', 'bonf', 'bh'].forEach((key, k) => {
        const d = cur.dec[key][j], y = T + (k + 1) * rowH + 3;
        if (d) s += `<rect x="${x}" y="${y}" width="${w}" height="${rowH - 8}" rx="1.5" fill="var(${it.eff ? '--good' : '--red'})"/>`;
        else if (it.eff) s += `<rect x="${(+x + 0.8).toFixed(1)}" y="${y + 0.8}" width="${Math.max(0.5, tw - 2.8).toFixed(1)}" height="${rowH - 9.6}" rx="1.5" fill="none" stroke="var(--good)" stroke-width="1.4"/>`;
        else s += `<rect x="${x}" y="${y}" width="${w}" height="${rowH - 8}" rx="1.5" fill="var(--c0)" fill-opacity="0.18"/>`;
      });
    });
    s += `<text x="${L}" y="${T - 6}" class="vz-t vl-s">p-valeur la plus petite</text><text x="${R}" y="${T - 6}" class="vz-t vl-s" text-anchor="end">la plus grande →</text>`;
    g.innerHTML = s;
    const bar = (v, bad) => `<span class="vl-bar${bad ? ' vl-bad' : ''}" style="width:${Math.round(36 * Math.min(1, v))}px"></span>`;
    q(el, '[data-o=tab]').innerHTML = runs ? `<table class="t"><thead><tr><th>procédure</th><th>FWER</th><th>FDR</th><th>puissance</th></tr></thead><tbody>${MET.map(([k, lab]) => { const st = S[k], fw = st.fw / runs, fd = st.fdp / runs, pw = st.pow / runs; return `<tr><td style="text-align:left">${lab}</td><td style="text-align:left">${bar(fw, fw > 0.08)}<span class="vl-mono">${pc(fw, 0)}</span></td><td style="text-align:left">${bar(fd, fd > 0.08)}<span class="vl-mono">${pc(fd, 1)}</span></td><td style="text-align:left">${m1 ? bar(pw) + `<span class="vl-mono">${pc(pw, 0)}</span>` : '—'}</td></tr>`; }).join('')}</tbody></table>` : '';
    q(el, '[data-o=out]').innerHTML = (runs ? `<b>${fmtI(runs)}</b> simulations de m = ${m} tests à α = 5 %. FWER = P(au moins une fausse découverte), FDR = moyenne de FP/(FP + TP), puissance = part des vrais effets trouvés. ` : '') + '<b>Observe :</b> sans correction, il y a presque toujours au moins une fausse découverte (FWER énorme). Bonferroni garde le FWER sous 5 % mais rate beaucoup d\'effets ; BH garde le FDR sous 5 % (en moyenne, moins de 5 % de fausses parmi les découvertes) tout en trouvant bien plus d\'effets.';
  };
  const anim = loop(el, () => { for (let i = 0; i < 3 && runs < target; i++) one(); draw(); return runs < target; }, on => { bRun.textContent = on ? '❚❚ Pause' : '▶ 300 simulations'; });
  bRun.onclick = () => { if (anim.on) { anim.pause(); target = runs; return; } target = runs + 300; if (RM()) { while (runs < target) one(); draw(); } else anim.play(); };
  q(el, '[data-i=one]').onclick = () => { anim.pause(); one(); target = runs; draw(); };
  q(el, '[data-i=new]').onclick = () => { anim.pause(); seed++; reset(); one(); draw(); };
  const m1In = q(el, '[data-i=m1]'), dlIn = q(el, '[data-i=dl]');
  const ch = () => { m1 = +m1In.value; delta = +dlIn.value; q(el, '[data-o=m1]').textContent = m1; q(el, '[data-o=dl]').textContent = fmt(delta, 1); anim.pause(); reset(); one(); draw(); };
  m1In.oninput = ch; dlIn.oninput = ch;
  q(el, '[data-o=m1]').textContent = m1; q(el, '[data-o=dl]').textContent = fmt(delta, 1);
  reset(); one(); draw();
  onVisible(el, () => { target = runs + 300; if (RM()) { while (runs < target) one(); draw(); } else anim.play(); });
}

/* ================================================================== s3 · quel test choisir ? */
const TESTS = {
  'Moyenne': [['1 échantillon', 'n > 30 ou normalité', 't.test(x, ...)'], ['2 échantillons', 'normalité et variances égales', 't.test(x, y, var.equal = T)'], ['2 échantillons', 'normalité (variances différentes)', 't.test(x, y, var.equal = F)'], ['2 éch. appariés', 'n > 30 ou normalité', 't.test(x, y, paired = T)']],
  'Variance': [['1 échantillon', 'normalité', 'sigma2.test(x, ...)'], ['2 échantillons', 'normalité', 'var.test(x, y)'], ['2 échantillons', 'grand échantillon', 'asymp.test(x, y)']],
  'Proportion': [['1 échantillon', 'np ≥ 5 et n(1 − p) ≥ 5', 'prop.test(...)'], ['1 échantillon', 'toujours (test exact)', 'binom.test(...)'], ['2 échantillons', 'grand échantillon', 'prop.test(...)']],
  'Corrélation': [['1 échantillon', 'normalité, H0 : ρ = ρ₀', 'cor.test(x, y)'], ['2 échantillons', 'normalité', 'cor.test.2.sample(...)']],
  'Indépendance': [['tableau de contingence', 'effectifs théoriques ≥ 5', 'chisq.test(..., correct = F)'], ['tableau 2 × 2', 'effectifs théoriques ≥ 2,5 (correction de Yates)', 'chisq.test()'], ['tableau de contingence', 'toujours (test exact de Fisher)', 'fisher.test()']],
  'Adéquation à une loi': [['1 échantillon', 'normalité (Shapiro-Wilk)', 'shapiro.test(x)'], ['1 échantillon', 'effectifs théoriques ≥ 5 (khi-deux)', 'chisq.test()'], ['1 ou 2 échantillons', 'Kolmogorov-Smirnov', 'ks.test(x, ...) / ks.test(x, y)']],
  'Position (médiane)': [['1 éch., 2 éch. ou appariés', 'test du signe', 'binom.test'], ['2 échantillons', 'min(n₁, n₂) > 10 (Mann-Whitney)', 'wilcox.test(x, y, exact = F)'], ['2 échantillons', 'min(n₁, n₂) ≤ 10', 'wilcox.test(x, y)'], ['2 éch. appariés', 'Wilcoxon', 'wilcox.test(x, y, paired = T)']],
};
const TEST_EX = {
  'Moyenne': 'Ex. : le poids moyen a-t-il changé entre le début et la fin de l\'étude sur le chocolat ? Mêmes personnes pesées deux fois → appariés.',
  'Variance': 'Ex. : deux machines ont-elles la même régularité (même variance des mesures) ?',
  'Proportion': 'Ex. : la proportion de votes pour A dépasse-t-elle 0,5 ?',
  'Corrélation': 'Ex. : la taille et le poids sont-ils corrélés (ρ = 0) ?',
  'Indépendance': 'Ex. : le choix d\'une filière est-il indépendant du sexe ? (tableau croisé)',
  'Adéquation à une loi': 'Ex. : mes données suivent-elles une loi normale ? (souvent vérifié avant un t.test)',
  'Position (médiane)': 'Ex. : comparer deux groupes sans supposer la normalité (petits effectifs, valeurs aberrantes).',
};
function choixViz(el) {
  let qq = 'Moyenne', dd = '2 éch. appariés';
  el.innerHTML = head('Quel test choisir ?', 'Réponds aux questions : le site te propose le test usuel et sa fonction R (tableau de Lafaye de Micheaux et al.).') +
    `<div class="vl-steps"><div class="vl-step"><p>1. Que veux-tu tester ?</p><div class="vz-seg" data-o="q1"></div></div><div class="vl-step" data-o="s2" hidden><p>2. Quelles données ?</p><div class="vz-seg" data-o="q2"></div></div><div class="vl-step" data-o="s3" hidden><p>3. Selon les conditions</p><div class="vl-cards" data-o="cards"></div></div></div>
     <p class="viz-out" data-o="out"></p>`;
  const render = () => {
    q(el, '[data-o=q1]').innerHTML = Object.keys(TESTS).map(k => `<button type="button" class="chip" data-q="${esc(k)}" aria-pressed="${k === qq}">${k}</button>`).join('');
    const s2 = q(el, '[data-o=s2]'), s3 = q(el, '[data-o=s3]');
    s2.hidden = !qq; s3.hidden = !(qq && dd);
    if (qq) { const ds = [...new Set(TESTS[qq].map(t => t[0]))]; q(el, '[data-o=q2]').innerHTML = ds.map(d => `<button type="button" class="chip" data-d="${esc(d)}" aria-pressed="${d === dd}">${d}</button>`).join(''); }
    if (qq && dd) q(el, '[data-o=cards]').innerHTML = TESTS[qq].filter(t => t[0] === dd).map(t => `<div class="vl-card"><small>si : ${t[1]}</small><code>${esc(t[2])}</code></div>`).join('');
    q(el, '[data-o=out]').innerHTML = qq ? `<span class="vl-path">${['<b>' + qq + '</b>', dd ? '<b>' + dd + '</b>' : ''].filter(Boolean).join(' → ')}</span> ${TEST_EX[qq]}${dd ? ' Rappel : si la p-valeur affichée par R est ≤ α, on rejette H0.' : ''}` : 'Commence par la question posée.';
    el.querySelectorAll('[data-q]').forEach(b => { b.onclick = () => { qq = b.dataset.q; const ds = [...new Set(TESTS[qq].map(t => t[0]))]; dd = ds.length === 1 ? ds[0] : null; render(); }; });
    el.querySelectorAll('[data-d]').forEach(b => { b.onclick = () => { dd = b.dataset.d; render(); }; });
  };
  render();
}

export const VIZ = {
  'lim-lgn': lgnViz,
  'lim-sqrtn': sqrtnViz,
  'lim-tcl': tclViz,
  'lim-disp': dispViz,
  'lim-ic': icViz,
  'lim-prop': propViz,
  'lim-2ic': twoIcViz,
  'lim-test': testViz,
  'lim-err': errViz,
  'lim-choix': choixViz,
  'lim-peche': pecheViz,
  'lim-bh': bhViz,
  'lim-fdr': fdrViz,
};
