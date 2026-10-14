import { $, fmt, esc, rng } from '../../lib/common.js';
import { typeset } from '../../lib/math.js';
/* eslint-disable */
/* =====================================================================
   FORMULES (KaTeX) ET ILLUSTRATIONS INTERACTIVES DES FICHES
   ===================================================================== */

/* Lecture des variables CSS, mise en cache (vidée à chaque changement de thème). */
const _vzCss = new Map();
let _vzMQ = null, _vzKey = null;
try{ _vzMQ = matchMedia('(prefers-color-scheme: dark)'); }catch(e){}
const cssv = n => { const key = (_vzMQ && _vzMQ.matches ? 'd' : 'l') + (document.documentElement.getAttribute('data-theme') || ''); if (key !== _vzKey){ _vzCss.clear(); _vzKey = key; } // filet de sécurité si l'évènement de thème manque
  let v = _vzCss.get(n); if (v === undefined){ v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); _vzCss.set(n, v); } return v; };
document.addEventListener('themechange', () => _vzCss.clear());
try{ matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => _vzCss.clear()); }catch(e){}
const gauss = r => { let u = 0; for (let k = 0; k < 6; k++) u += r(); return (u - 3) / Math.sqrt(0.5); }; // ≈ N(0,1)
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
let vzUid = 0;
const vzPal = () => ({ink:cssv('--ink'), muted:cssv('--muted'), line:cssv('--line'), lineS:cssv('--line-strong'), paper:cssv('--paper'), paper2:cssv('--paper-2'),
  accent:cssv('--accent'), red:cssv('--red'), good:cssv('--good'), warn:cssv('--warn'), c0:cssv('--c0'), c:['--c1','--c2','--c3','--c4','--c5','--c6'].map(cssv)});
const vzR = W => clamp(W/120 + 1.8, 4, 6); // rayon des points selon la largeur du dessin
const vzAlive = el => document.body.contains(el);

/* Canevas net (devicePixelRatio) qui suit la largeur de son conteneur et le thème.
   ratio(w) = hauteur relative ; opts : drag (touch-action:none), tap (curseur), minH, maxH, label. */
function vizCanvas(host, ratio, opts={}){
  const cv = document.createElement('canvas'); cv.className = 'viz-cv' + (opts.drag ? ' viz-drag' : '') + (opts.tap || opts.drag ? ' viz-tap' : '');
  if (opts.drag) cv.style.touchAction = 'none';
  if (opts.label){ cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', opts.label); }
  host.appendChild(cv);
  const ctx = cv.getContext('2d');
  const api = {cv, ctx, W:0, H:0, draw:()=>{}};
  let raf = 0, lastW = 0, ro = null;
  api.req = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (api.W) api.draw(); }); };
  api.fit = () => {
    const w = Math.floor(cv.clientWidth || host.clientWidth); // largeur intérieure du canevas (sans bordure)
    if (w < 40) return; // onglet masqué : on attend
    lastW = w;
    const h = Math.round(clamp(w*ratio(w), opts.minH || 120, opts.maxH || 460));
    const dpr = clamp(window.devicePixelRatio || 1, 1, 3), cw = Math.round(w*dpr), ch = Math.round(h*dpr);
    if (cv.width !== cw) cv.width = cw;
    if (cv.height !== ch) cv.height = ch;
    cv.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); api.W = w; api.H = h; api.draw();
  };
  const gone = () => { if (vzAlive(cv)) return false; if (ro) ro.disconnect(); window.removeEventListener('resize', onResize); document.removeEventListener('themechange', onTheme); return true; };
  const onResize = () => { if (!gone() && Math.floor(cv.clientWidth || host.clientWidth) !== lastW) api.fit(); };
  const onTheme = () => { if (!gone()) api.fit(); };
  if (window.ResizeObserver){ ro = new ResizeObserver(onResize); ro.observe(host); } else window.addEventListener('resize', onResize);
  document.addEventListener('themechange', onTheme);
  api.pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left)*api.W/(r.width || 1), (e.clientY - r.top)*api.H/(r.height || 1)]; };
  return api;
}
function vizHead(title, hint){ return `<figcaption><b>${title}</b>${hint ? `<span>${hint}</span>` : ''}</figcaption>`; }
/* légende HTML : [forme, variable CSS, texte] ; formes : o s t star l lt d r a x */
function vzLeg(items){ return `<div class="viz-leg">${items.map(([k, c, l]) => `<span><i class="sw sw-${k}" style="--sw:var(${c})" aria-hidden="true">${k === 'star' ? '★' : k === 'x' ? '✕' : ''}</i>${l}</span>`).join('')}</div>`; }
function dot(ctx, x, y, r, shape, fill, stroke, lw){
  ctx.beginPath();
  if (shape === 1) ctx.rect(x - r*0.9, y - r*0.9, 1.8*r, 1.8*r);
  else if (shape === 2) { ctx.moveTo(x, y - r*1.25); ctx.lineTo(x + r*1.15, y + r*0.85); ctx.lineTo(x - r*1.15, y + r*0.85); ctx.closePath(); }
  else if (shape === 3) { for (let k = 0; k < 10; k++){ const a = -Math.PI/2 + k*Math.PI/5, rr = k % 2 ? r*0.45 : r; k ? ctx.lineTo(x + rr*Math.cos(a), y + rr*Math.sin(a)) : ctx.moveTo(x + rr*Math.cos(a), y + rr*Math.sin(a)); } ctx.closePath(); }
  else ctx.arc(x, y, r, 0, 2*Math.PI);
  if (fill){ ctx.fillStyle = fill; ctx.fill(); }
  if (stroke){ ctx.lineWidth = lw || 1.2; ctx.strokeStyle = stroke; ctx.stroke(); }
}
function ring(ctx, x, y, r, color, lw=1.6, dash){ ctx.beginPath(); ctx.arc(x, y, r, 0, 2*Math.PI); ctx.lineWidth = lw; ctx.strokeStyle = color; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); }
function cross(ctx, x, y, r, color, lw=2){ ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.lineWidth = lw; ctx.strokeStyle = color; ctx.stroke(); }
function txt(ctx, s, x, y, align='left', color, size=12, fam='mono', weight=''){
  ctx.font = `${weight} ${size}px ${(fam === 'body' ? cssv('--f-body') : cssv('--f-mono')) || 'sans-serif'}`; ctx.fillStyle = color || cssv('--muted'); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y);
}
/* étiquette sur fond papier (lisible au-dessus d'un dessin chargé) */
function vzTag(ctx, s, x, y, align='left', color, size=12, weight='600'){
  ctx.font = `${weight} ${size}px ${cssv('--f-mono') || 'monospace'}`;
  const w = ctx.measureText(s).width, x0 = align === 'center' ? x - w/2 : align === 'right' ? x - w : x;
  ctx.fillStyle = shade(cssv('--paper'), 0.88); ctx.fillRect(x0 - 3, y - size*0.68, w + 6, size*1.36);
  txt(ctx, s, x, y, align, color, size, 'mono', weight);
  return w;
}
const CLS = () => [cssv('--c1'), cssv('--c2'), cssv('--c3')];
const CLSNAME = ['A', 'B', 'C'];
function shade(hex, a){ // couleur → rgba avec alpha (accepte #rgb, #rrggbb ou rgb())
  if (!hex) return `rgba(128,128,128,${a})`;
  if (hex[0] === '#'){ let h = hex.slice(1); if (h.length === 3) h = h.split('').map(c=>c+c).join(''); const n = parseInt(h, 16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; }
  const m = hex.match(/\d+(\.\d+)?/g); return m ? `rgba(${m[0]},${m[1]},${m[2]},${a})` : hex;
}
function vzRGB(c){ if (c && c[0] === '#'){ let h = c.slice(1); if (h.length === 3) h = h.split('').map(x => x+x).join(''); const n = parseInt(h, 16); return [n>>16&255, n>>8&255, n&255]; }
  const m = (c || '').match(/\d+(\.\d+)?/g); return m ? [+m[0], +m[1], +m[2]] : [128, 128, 128]; }
/* image basse résolution nx×ny (étirée ensuite) : idx(i, j) → indice dans table = [[r,g,b,a(0-255)], …] */
function vzField(nx, ny, idx, table){
  const off = document.createElement('canvas'); off.width = nx; off.height = ny;
  const c = off.getContext('2d'), im = c.createImageData(nx, ny), d = im.data;
  for (let j = 0, k = 0; j < ny; j++) for (let i = 0; i < nx; i++, k += 4){ const t = table[idx(i, j)] || table[0]; d[k] = t[0]; d[k+1] = t[1]; d[k+2] = t[2]; d[k+3] = t[3]; }
  c.putImageData(im, 0, 0); return off;
}
function vzBlit(ctx, off, S){ ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, S.L, S.T, S.R - S.L, S.B - S.T); ctx.restore(); }
/* échelle linéaire ; iso = même unité en x et en y (cercles et distances vrais) */
function vzScale(L, R, T, B, x0, x1, y0, y1, iso){
  if (iso){ const s = Math.min((R - L)/(x1 - x0), (B - T)/(y1 - y0)), cx = (x0 + x1)/2, cy = (y0 + y1)/2, hw = (R - L)/s/2, hh = (B - T)/s/2; x0 = cx - hw; x1 = cx + hw; y0 = cy - hh; y1 = cy + hh; }
  const S = {L, R, T, B, x0, x1, y0, y1};
  S.X = x => L + (x - x0)/(x1 - x0)*(R - L); S.Y = y => B - (y - y0)/(y1 - y0)*(B - T);
  S.ix = px => x0 + (px - L)/(R - L)*(x1 - x0); S.iy = py => y0 + (B - py)/(B - T)*(y1 - y0);
  S.k = (R - L)/(x1 - x0); S.in = (px, py) => px >= L && px <= R && py >= T && py <= B;
  S.clip = ctx => { ctx.beginPath(); ctx.rect(L, T, R - L, B - T); ctx.clip(); };
  return S;
}
function vzTicks(a, b, n){
  const raw = (b - a)/Math.max(1, n), mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw/mag;
  const st = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10)*mag, out = [];
  for (let v = Math.ceil(a/st - 1e-9)*st; v <= b + st*1e-6; v += st) out.push(+v.toFixed(10));
  return out;
}
function vzAxes(ctx, S, o={}){
  const p = vzPal(), fs = o.fs || 11;
  const xt = o.xt || vzTicks(S.x0, S.x1, Math.max(2, Math.floor((S.R - S.L)/62)));
  const yt = o.yt || vzTicks(S.y0, S.y1, Math.max(2, Math.floor((S.B - S.T)/38)));
  ctx.save(); ctx.lineWidth = 1;
  if (o.grid !== false){ ctx.strokeStyle = shade(p.line, 0.8); ctx.beginPath();
    xt.forEach(v => { const x = Math.round(S.X(v)) + 0.5; ctx.moveTo(x, S.T); ctx.lineTo(x, S.B); });
    yt.forEach(v => { const y = Math.round(S.Y(v)) + 0.5; ctx.moveTo(S.L, y); ctx.lineTo(S.R, y); }); ctx.stroke(); }
  ctx.strokeStyle = p.lineS; ctx.beginPath(); ctx.moveTo(S.L + 0.5, S.T); ctx.lineTo(S.L + 0.5, S.B + 0.5); ctx.lineTo(S.R, S.B + 0.5); ctx.stroke();
  const fx = o.fx || (v => fmt(v, 2)), fy = o.fy || fx;
  if (o.xl !== false) xt.forEach(v => txt(ctx, fx(v), S.X(v), S.B + fs*0.95 + 2, 'center', p.muted, fs));
  if (o.yl !== false) yt.forEach(v => txt(ctx, fy(v), S.L - 5, S.Y(v), 'right', p.muted, fs));
  if (o.xlab) txt(ctx, o.xlab, S.R, S.B + fs*2.25 + 3, 'right', p.ink, fs + 1, 'body', '600');
  if (o.ylab) txt(ctx, o.ylab, S.L - 4, S.T - fs*1.3, 'left', p.ink, fs + 1, 'body', '600');
  ctx.restore();
}
function vzPath(ctx, pts, color, lw=2, dash){ ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); }
/* segments d'iso-valeur (marching squares) sur une grille de (nx+1)×(ny+1) nœuds */
function vzContour(F, nx, ny, lev){
  const seg = [], v = (i, j) => F[j*(nx + 1) + i] - lev;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++){
    const a = v(i, j), b = v(i + 1, j), c = v(i + 1, j + 1), d = v(i, j + 1), q = [];
    if ((a > 0) !== (b > 0)) q.push(i + a/(a - b), j);
    if ((b > 0) !== (c > 0)) q.push(i + 1, j + b/(b - c));
    if ((c > 0) !== (d > 0)) q.push(i + 1 - c/(c - d), j + 1);
    if ((d > 0) !== (a > 0)) q.push(i, j + 1 - d/(d - a));
    if (q.length >= 4) seg.push(...q);
  }
  return seg;
}
function vzSegs(ctx, seg, toX, toY, color, lw, dash){ ctx.beginPath(); for (let k = 0; k + 3 < seg.length; k += 4){ ctx.moveTo(toX(seg[k]), toY(seg[k+1])); ctx.lineTo(toX(seg[k+2]), toY(seg[k+3])); } ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); }
/* SVM linéaire à marge souple : coordonnée duale (Hsieh et al.), biais via une variable constante B */
function vzLinSVM(X, Y, C, B=2.5, ep=500){
  const n = X.length, a = new Float64Array(n), w = [0, 0, 0];
  for (let e = 0; e < ep; e++){
    let mx = 0;
    for (let i = 0; i < n; i++){
      const x = X[i], y = Y[i], G = y*(w[0]*x[0] + w[1]*x[1] + w[2]*B) - 1, Q = x[0]*x[0] + x[1]*x[1] + B*B;
      const na = Math.min(Math.max(a[i] - G/Q, 0), C), d = (na - a[i])*y; if (Math.abs(na - a[i]) > mx) mx = Math.abs(na - a[i]);
      a[i] = na; w[0] += d*x[0]; w[1] += d*x[1]; w[2] += d*B;
    }
    if (mx < 1e-8) break;
  }
  return {w: [w[0], w[1]], b: w[2]*B, a};
}
/* système linéaire (pivot partiel) */
function vzSolve(A, b){
  const n = b.length; A = A.map(r => r.slice()); b = b.slice();
  for (let c = 0; c < n; c++){
    let pv = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[pv][c])) pv = r;
    [A[c], A[pv]] = [A[pv], A[c]]; [b[c], b[pv]] = [b[pv], b[c]];
    const d = A[c][c] || 1e-12;
    for (let r = c + 1; r < n; r++){ const m = A[r][c]/d; if (!m) continue; for (let k = c; k < n; k++) A[r][k] -= m*A[c][k]; b[r] -= m*b[c]; }
  }
  const x = Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--){ let s = b[r]; for (let k = r + 1; k < n; k++) s -= A[r][k]*x[k]; x[r] = s/(A[r][r] || 1e-12); }
  return x;
}
const $q = (el, k) => el.querySelector(`[data-o="${k}"]`), $i = (el, k) => el.querySelector(`[data-i="${k}"]`);
const pct = (x, d=1) => fmt(100*x, d) + ' %';

const VIZ = {};

/* ---- KNN : cercle des K voisins, vote, frontière et erreurs selon K ---- */
VIZ.knn = el => {
  el.innerHTML = vizHead('K plus proches voisins : le vote', 'Touche ou clique le graphique pour placer le point à classer ★ (glisse pour le déplacer), puis fais varier K.') +
    `<div class="viz-ctrl"><label>K = <b data-o="k">5</b> <input type="range" min="1" max="59" step="2" value="5" data-i="k" aria-label="Nombre de voisins K"></label>
     <label class="chk"><input type="checkbox" data-i="fr" checked> frontière de décision</label></div><div class="viz-stage" data-s="main"></div>` +
    vzLeg([['o','--c1','classe A (apprentissage)'],['s','--c2','classe B'],['star','--ink','point à classer'],['r','--ink','ses K voisins (dans le cercle)']]) +
    `<div class="viz-vote" data-o="vote"></div><p class="viz-out" data-o="out"></p><div class="viz-stage" data-s="err"></div>`;
  const pts = [], test = [];
  const gen = (arr, n, rr) => { [[0.25, 0.62, 0], [0.75, 0.62, 0], [0.5, 0.82, 0], [0.5, 0.36, 1], [0.5, 0.36, 1]].forEach(([cx, cy, c]) => { // A en « U » autour de B : frontière courbe
    for (let i = 0; i < n; i++) arr.push([clamp(cx + gauss(rr)*0.15, .02, .98), clamp(cy + gauss(rr)*0.15*(c ? 1.2 : 1), .02, .98), c]); }); };
  gen(pts, 12, rng(11)); gen(test, 48, rng(12));
  const N = pts.length, KMAX = 59;
  const order = (x, y) => { const d = pts.map((p, i) => [(p[0] - x)**2 + (p[1] - y)**2, i]); d.sort((a, b) => a[0] - b[0]); return d; };
  const curve = set => { const e = new Float64Array(KMAX + 1); set.forEach(p => { const o = order(p[0], p[1]); let c1 = 0;
    for (let k = 1; k <= KMAX; k++){ c1 += pts[o[k-1][1]][2]; if (k % 2 && (2*c1 > k ? 1 : 0) !== p[2]) e[k]++; } }); for (let k = 1; k <= KMAX; k += 2) e[k] /= set.length; return e; };
  const eTr = curve(pts), eTe = curve(test);
  let bestK = 1; for (let k = 1; k <= KMAX; k += 2) if (eTe[k] < eTe[bestK] - 1e-12) bestK = k;
  let K = 5, q = [0.47, 0.5], drag = false, S = null, ordGrid = null, ordKey = '', fieldCache = new Map();
  const fr = $i(el, 'fr');
  const V = vizCanvas(el.querySelector('[data-s=main]'), w => w < 500 ? 0.86 : 0.56, {tap: true, label: 'Nuage de points de deux classes et point à classer'});
  const fieldFor = (p) => { // ordre des voisins de chaque cellule (calculé une fois par taille), puis image par K
    const nx = Math.ceil((S.R - S.L)/6), ny = Math.ceil((S.B - S.T)/6), key = nx + 'x' + ny;
    if (ordKey !== key){ ordGrid = new Uint8Array(nx*ny*KMAX);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++){ const o = order(S.x0 + (i + 0.5)/nx*(S.x1 - S.x0), S.y1 - (j + 0.5)/ny*(S.y1 - S.y0)), b = (j*nx + i)*KMAX; for (let k = 0; k < KMAX; k++) ordGrid[b + k] = o[k][1]; }
      ordKey = key; fieldCache.clear(); }
    const fk = K + key + p.c[0] + p.c[1];
    if (!fieldCache.has(fk)){ const a0 = vzRGB(p.c[0]), a1 = vzRGB(p.c[1]);
      fieldCache.set(fk, vzField(nx, ny, (i, j) => { const b = (j*nx + i)*KMAX; let c1 = 0; for (let k = 0; k < K; k++) c1 += pts[ordGrid[b + k]][2]; return 2*c1 > K ? 1 : 0; }, [[...a0, 40], [...a1, 40]])); }
    return fieldCache.get(fk);
  };
  V.draw = () => {
    const {ctx, W, H} = V, p = vzPal(), col = p.c, R0 = vzR(W);
    S = vzScale(6, W - 6, 6, H - 6, 0, 1, 0, 1, true);
    ctx.clearRect(0, 0, W, H);
    if (fr.checked) vzBlit(ctx, fieldFor(p), S);
    const nb = order(q[0], q[1]).slice(0, K), rad = Math.sqrt(nb[K-1][0]), qx = S.X(q[0]), qy = S.Y(q[1]);
    ctx.beginPath(); ctx.arc(qx, qy, rad*S.k + R0 + 1, 0, 2*Math.PI); ctx.fillStyle = shade(p.ink, 0.05); ctx.fill();
    ctx.setLineDash([5, 4]); ctx.strokeStyle = p.ink; ctx.lineWidth = 1.3; ctx.stroke(); ctx.setLineDash([]);
    nb.forEach(t => { const pt = pts[t[1]]; ctx.strokeStyle = shade(col[pt[2]], 0.75); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(S.X(pt[0]), S.Y(pt[1])); ctx.stroke(); });
    pts.forEach(pt => dot(ctx, S.X(pt[0]), S.Y(pt[1]), R0, pt[2], col[pt[2]], p.paper));
    nb.forEach(t => { const pt = pts[t[1]]; ring(ctx, S.X(pt[0]), S.Y(pt[1]), R0 + 3, p.ink, 1.5); });
    const c1 = nb.reduce((s, t) => s + pts[t[1]][2], 0), c0 = K - c1, pred = c1 > c0 ? 1 : 0;
    dot(ctx, qx, qy, R0*2.3, 3, col[pred], p.ink, 1.6);
    vzTag(ctx, `K = ${K}`, S.L + 6, S.T + 12, 'left', p.ink, 12);
    $q(el, 'vote').innerHTML = `<span style="flex:${c0} 1 0;background:var(--c1)" ${c0 ? '' : 'hidden'}>${c0} A</span><span style="flex:${c1} 1 0;background:var(--c2)" ${c1 ? '' : 'hidden'}>${c1} B</span>`;
    $q(el, 'out').innerHTML = `Vote des ${K} voisins : <b>${c0}</b> A contre <b>${c1}</b> B → le point ★ est classé <b>${CLSNAME[pred]}</b> (classe majoritaire ; K impair, donc pas d'égalité avec 2 classes). ` +
      `Erreur d'apprentissage : <b>${pct(eTr[K])}</b> ; erreur sur ${test.length} points de test : <b>${pct(eTe[K])}</b>. ` +
      (K === 1 ? 'K = 1 : erreur d\'apprentissage nulle (chaque point est son propre plus proche voisin), frontière très découpée : <b>sur-apprentissage</b> (variance ↑).' :
       K >= 41 ? 'K très grand : le vote porte sur presque tous les points, la frontière s\'efface et on finit par prédire partout la classe majoritaire A : <b>sous-apprentissage</b> (biais ↑).' :
       K === bestK ? 'C\'est ici le K qui minimise l\'erreur de test.' : `Le meilleur K sur le test est ${bestK}.`);
  };
  const E = vizCanvas(el.querySelector('[data-s=err]'), w => w < 500 ? 0.55 : 0.24, {minH: 140, maxH: 210, label: 'Erreurs d\'apprentissage et de test en fonction de K'});
  E.draw = () => {
    const {ctx, W, H} = E, p = vzPal(), mx = Math.max(...eTe, ...eTr)*1.1;
    const S2 = vzScale(42, W - 10, 26, H - 34, 0, 60, 0, mx);
    ctx.clearRect(0, 0, W, H);
    vzAxes(ctx, S2, {fx: v => fmt(v, 0), fy: v => fmt(100*v, 0) + '%', xlab: 'K →  (K petit = modèle complexe)', ylab: 'erreur'});
    const line = (e, c, lw, dash) => { const a = []; for (let k = 1; k <= KMAX; k += 2) a.push([S2.X(k), S2.Y(e[k])]); vzPath(ctx, a, c, lw, dash); };
    line(eTr, p.accent, 2.2); line(eTe, p.red, 2.2, [6, 4]);
    ctx.strokeStyle = p.ink; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(S2.X(K), S2.T); ctx.lineTo(S2.X(K), S2.B); ctx.stroke(); ctx.setLineDash([]);
    dot(ctx, S2.X(K), S2.Y(eTr[K]), 4.5, 0, p.accent, p.paper); dot(ctx, S2.X(K), S2.Y(eTe[K]), 4.5, 1, p.red, p.paper);
    txt(ctx, '— apprentissage', S2.R, S2.T - 14, 'right', p.accent, 11, 'body', '600');
    txt(ctx, '- - test', S2.R - (W < 360 ? 112 : 128), S2.T - 14, 'right', p.red, 11, 'body', '600');
  };
  const setQ = e => { const [x, y] = V.pos(e); q = [clamp(S.ix(x), S.x0, S.x1), clamp(S.iy(y), S.y0, S.y1)]; V.req(); };
  V.cv.addEventListener('pointerdown', e => { drag = true; try{ V.cv.setPointerCapture(e.pointerId); }catch(_){} setQ(e); });
  V.cv.addEventListener('pointermove', e => { if (drag) setQ(e); });
  ['pointerup', 'pointercancel'].forEach(t => V.cv.addEventListener(t, () => drag = false));
  $i(el, 'k').oninput = e => { K = +e.target.value; $q(el, 'k').textContent = K; V.req(); E.req(); };
  fr.onchange = () => V.req();
  V.fit(); E.fit();
};

/* ---- Biais, variance : régression polynomiale sur plusieurs échantillons ---- */
VIZ.biasvar = el => {
  el.innerHTML = vizHead('Biais, variance et complexité', 'On ajuste un polynôme de degré d sur 14 points bruités, et on recommence sur 20 échantillons tirés de la même loi.') +
    `<div class="viz-ctrl"><label>degré d = <b data-o="d">3</b> <input type="range" min="0" max="10" step="1" value="3" data-i="d" aria-label="degré du polynôme (complexité)"></label></div><div class="viz-stage"></div>` +
    vzLeg([['d','--muted','vraie fonction'],['o','--ink','un échantillon de 14 points'],['l','--accent','modèle appris sur cet échantillon'],['lt','--c4','modèles appris sur d\'autres échantillons (leur dispersion = variance)']]) +
    `<p class="viz-out" data-o="out"></p><p class="viz-out">Complexité ↑ : K petit (KNN), arbre profond, C grand ou γ grand (SVM), degré élevé. Le bon modèle minimise l'erreur sur des données <b>non vues</b> (validation), pas sur l'apprentissage.</p>`;
  const f = x => 0.9*Math.sin(2*Math.PI*x), sig = 0.3, M = 20, n = 14, DMAX = 10, G = 101;
  const r = rng(17), sets = [];
  for (let m = 0; m < M; m++){ const s = []; for (let i = 0; i < n; i++){ const x = (i + r())/n; s.push([x, f(x) + sig*gauss(r)]); } sets.push(s); }
  const rt = rng(18), test = []; for (let i = 0; i < 300; i++){ const x = rt(); test.push([x, f(x) + sig*gauss(rt)]); }
  const basis = (x, d) => { const t = 2*x - 1, v = [1]; for (let k = 1; k <= d; k++) v.push(v[k-1]*t); return v; };
  const ev = (c, x) => { const t = 2*x - 1; let s = 0; for (let k = c.length - 1; k >= 0; k--) s = s*t + c[k]; return s; };
  const fit = (s, d) => { const A = Array.from({length: d + 1}, () => Array(d + 1).fill(0)), b = Array(d + 1).fill(0);
    s.forEach(([x, y]) => { const v = basis(x, d); for (let i = 0; i <= d; i++){ b[i] += v[i]*y; for (let j = 0; j <= d; j++) A[i][j] += v[i]*v[j]; } });
    for (let i = 0; i <= d; i++) A[i][i] += 1e-7; return vzSolve(A, b); };
  const R = []; // R[d] = {coefs, tr, te, b2, va}
  for (let d = 0; d <= DMAX; d++){
    const cs = sets.map(s => fit(s, d)); let tr = 0, te = 0, b2 = 0, va = 0;
    cs.forEach((c, m) => { tr += sets[m].reduce((a, [x, y]) => a + (ev(c, x) - y)**2, 0)/n; te += test.reduce((a, [x, y]) => a + (ev(c, x) - y)**2, 0)/test.length; });
    for (let g = 0; g < G; g++){ const x = g/(G - 1), v = cs.map(c => ev(c, x)), mu = v.reduce((a, b) => a + b, 0)/M; b2 += (mu - f(x))**2; va += v.reduce((a, b) => a + (b - mu)**2, 0)/M; }
    R.push({cs, tr: tr/M, te: te/M, b2: b2/G, va: va/G});
  }
  let best = 0; R.forEach((q, d) => { if (q.te < R[best].te) best = d; });
  const inp = $i(el, 'd');
  const V = vizCanvas(el.querySelector('.viz-stage'), w => w >= 620 ? 0.4 : 1.5, {maxH: 640, label: 'Ajustements polynomiaux et courbes d\'erreur'});
  V.draw = () => {
    const {ctx, W, H} = V, p = vzPal(), d = +inp.value, wide = W >= 620;
    $q(el, 'd').textContent = d;
    ctx.clearRect(0, 0, W, H);
    const A = wide ? vzScale(36, W*0.5 - 8, 22, H - 34, 0, 1, -1.7, 1.7) : vzScale(36, W - 10, 22, H*0.5 - 34, 0, 1, -1.7, 1.7);
    const B = wide ? vzScale(W*0.5 + 40, W - 10, 22, H - 34, 0, DMAX, 0, 0.5) : vzScale(36, W - 10, H*0.5 + 22, H - 34, 0, DMAX, 0, 0.5);
    vzAxes(ctx, A, {xt: [0, 0.5, 1], yt: [-1, 0, 1], fy: v => fmt(v, 0), xlab: 'x', ylab: 'y'});
    ctx.save(); A.clip(ctx);
    const curveOf = g => { const a = []; for (let k = 0; k <= 120; k++){ const x = k/120; a.push([A.X(x), A.Y(clamp(g(x), -9, 9))]); } return a; };
    vzPath(ctx, curveOf(f), p.muted, 2, [6, 4]);
    for (let m = 1; m < 8; m++) vzPath(ctx, curveOf(x => ev(R[d].cs[m], x)), shade(p.c[3], 0.7), 1.2);
    vzPath(ctx, curveOf(x => ev(R[d].cs[0], x)), p.accent, 2.8);
    sets[0].forEach(([x, y]) => dot(ctx, A.X(x), A.Y(y), vzR(W)*0.85, 0, p.ink, p.paper));
    ctx.restore();
    txt(ctx, `degré ${d}`, A.R, A.T - 10, 'right', p.ink, 12, 'body', '600');
    vzAxes(ctx, B, {xt: [0, 2, 4, 6, 8, 10], yt: [0, 0.1, 0.2, 0.3, 0.4, 0.5], fx: v => fmt(v, 0), fy: v => fmt(v, 1), xlab: 'degré d (complexité) →', ylab: 'erreur quadratique'});
    ctx.save(); B.clip(ctx);
    const ser = (k, c, lw, dash) => vzPath(ctx, R.map((q, i) => [B.X(i), B.Y(Math.min(q[k], 0.6))]), c, lw, dash);
    ctx.fillStyle = shade(p.muted, 0.08); ctx.fillRect(B.L, B.Y(sig*sig), B.R - B.L, B.B - B.Y(sig*sig));
    ser('va', p.c[3], 1.8); ser('b2', p.c[4], 1.8); ser('tr', p.accent, 2.4); ser('te', p.red, 2.4, [6, 4]);
    ctx.strokeStyle = p.ink; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(B.X(d), B.T); ctx.lineTo(B.X(d), B.B); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    const lab = [['apprentissage', p.accent], ['test', p.red], ['biais²', p.c[4]], ['variance', p.c[3]], ['bruit σ²', p.muted]];
    lab.forEach(([s, c], i) => vzTag(ctx, s, B.X(3.6), B.T + 9 + i*15, 'left', c, 11));
    if (R[d].te > 0.5) txt(ctx, '↑ ' + fmt(R[d].te, 2), B.X(d) + 4, B.T + 8, 'left', p.red, 11);
    const q = R[d];
    $q(el, 'out').innerHTML = `Degré ${d} : erreur d'apprentissage <b>${fmt(q.tr, 3)}</b>, erreur de test <b>${fmt(q.te, 3)}</b> ≈ biais² ${fmt(q.b2, 3)} + variance ${fmt(q.va, 3)} + bruit ${fmt(sig*sig, 2)}. ` +
      (d <= 1 ? '<b>Sous-apprentissage</b> : le modèle est trop simple, il rate la forme même sur l\'apprentissage (biais fort) ; les 20 modèles se ressemblent (variance faible).' :
       d >= 7 ? '<b>Sur-apprentissage</b> : l\'erreur d\'apprentissage est presque nulle mais les modèles changent beaucoup d\'un échantillon à l\'autre (variance forte), l\'erreur de test remonte.' :
       d === best ? '<b>Bon compromis</b> : c\'est le degré qui minimise l\'erreur de test.' : `Compromis raisonnable ; le minimum de l'erreur de test est atteint en d = ${best}.`) +
      ' L\'erreur d\'apprentissage, elle, baisse toujours quand la complexité augmente.';
  };
  inp.oninput = () => V.req();
  V.fit();
};

/* ---- Validation croisée K-fold (vrais scores d'un classifieur à seuil) ---- */
VIZ.kfold = el => {
  el.innerHTML = vizHead('Validation croisée K-fold', 'Après mélange, les n = 24 observations sont découpées en K plis. Chaque pli sert une fois de validation.') +
    `<div class="viz-ctrl"><label>K = <b data-o="k">5</b> <input type="range" min="2" max="12" step="1" value="5" data-i="k" aria-label="nombre de plis K"></label>
     <label class="chk"><input type="checkbox" data-i="loo"> leave-one-out (K = n)</label>
     <span class="viz-btns"><button class="btn small" data-i="prev" aria-label="Essai précédent">◀</button><button class="btn small" data-i="next">Essai suivant ▶</button><button class="btn small" data-i="play">Animer</button></span></div>
     <div class="viz-stage"></div>` + vzLeg([['a','--accent','apprentissage (K − 1 plis)'],['a','--c2','validation (1 pli)'],['o','--ink','observation de classe 1'],['r','--ink','observation de classe 0']]) +
    `<p class="viz-out" data-o="out"></p>`;
  const r = rng(23), n = 24, data = [];
  for (let i = 0; i < n; i++){ const x = 2*r() - 1; data.push([x, x + 0.45*gauss(r) > 0 ? 1 : 0]); }
  const stump = idx => { // seuil s qui minimise l'erreur d'apprentissage pour la règle « 1 si x ≥ s »
    const xs = idx.map(i => data[i][0]).sort((a, b) => a - b), cand = [xs[0] - 0.01, ...xs.slice(1).map((v, k) => (v + xs[k])/2), xs[xs.length - 1] + 0.01];
    let bs = 0, be = Infinity; cand.forEach(s => { const e = idx.reduce((a, i) => a + ((data[i][0] >= s ? 1 : 0) !== data[i][1]), 0); if (e < be){ be = e; bs = s; } }); return bs; };
  let K = 5, cur = 5, timer = null, res = [];
  const fold = i => Math.floor(i*K/n);
  const compute = () => { res = []; for (let k = 0; k < K; k++){ const tr = [], va = []; for (let i = 0; i < n; i++) (fold(i) === k ? va : tr).push(i);
    const s = stump(tr), ok = va.reduce((a, i) => a + ((data[i][0] >= s ? 1 : 0) === data[i][1]), 0); res.push({s, ok, m: va.length, acc: ok/va.length}); } };
  const rowH = () => K <= 12 ? 28 : 17;
  const V = vizCanvas(el.querySelector('.viz-stage'), w => (K*rowH() + 56)/w, {maxH: 520, minH: 100, label: 'Plis de la validation croisée'});
  V.draw = () => {
    const {ctx, W, H} = V, p = vzPal(), L = W < 420 ? 52 : 64, Rm = W < 420 ? 46 : 64, rh = rowH(), cw = (W - L - Rm)/n, T = 6;
    ctx.clearRect(0, 0, W, H);
    for (let k = 0; k < K; k++){
      const y = T + k*rh, on = cur >= K || cur === k, done = cur >= K || k <= cur;
      for (let i = 0; i < n; i++){
        const isV = fold(i) === k, x = L + i*cw;
        ctx.fillStyle = isV ? shade(p.c[1], on ? 0.85 : 0.22) : shade(p.accent, on ? 0.3 : 0.1);
        ctx.fillRect(x + 0.5, y + 2, Math.max(1, cw - 1), rh - 4);
        if (cw >= 7 && rh >= 20){ const cx = x + cw/2, cy = y + rh/2, rr = Math.min(cw, rh)*0.2; data[i][1] ? dot(ctx, cx, cy, rr, 0, shade(p.ink, on ? 0.85 : 0.3)) : ring(ctx, cx, cy, rr, shade(p.ink, on ? 0.85 : 0.3), 1.1); }
      }
      txt(ctx, (W < 420 ? 'n° ' : 'essai ') + (k + 1), L - 6, y + rh/2, 'right', on ? p.ink : p.muted, 11);
      if (done) txt(ctx, fmt(res[k].acc, 2), W - Rm + 6, y + rh/2, 'left', on ? p.ink : p.muted, 11, 'mono', cur === k ? '600' : '');
      if (cur === k){ ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5; ctx.strokeRect(L - 0.5, y + 1, W - L - Rm + 1, rh - 2); }
    }
    const yb = T + K*rh + 18;
    if (cur >= K){ const m = res.reduce((a, q) => a + q.acc, 0)/K; txt(ctx, `moyenne des ${K} scores = ${fmt(m, 3)}`, W - 6, yb, 'right', p.ink, 12, 'body', '600'); }
    txt(ctx, 'observations →', L, yb, 'left', p.muted, 11, 'body');
  };
  const say = () => {
    const o = $q(el, 'out');
    if (cur >= K){ const m = res.reduce((a, q) => a + q.acc, 0)/K, sd = Math.sqrt(res.reduce((a, q) => a + (q.acc - m)**2, 0)/K);
      o.innerHTML = `Score de validation croisée = moyenne des ${K} scores = <b>${fmt(m, 3)}</b> (écart-type ${fmt(sd, 2)}). ${K === n ? 'Leave-one-out : n = 24 entraînements, chacun sur 23 observations ; chaque score vaut 0 ou 1.' : `Chaque modèle est entraîné sur environ ${n - Math.round(n/K)} observations : K grand → plus de données d'apprentissage mais K entraînements (coût).`} On refait cela pour chaque valeur d'hyperparamètre, on garde la meilleure, puis on réentraîne sur toutes les données.`; }
    else { const q = res[cur]; o.innerHTML = `Essai ${cur + 1} : on entraîne sur les ${n - q.m} observations des autres plis (règle apprise : classe 1 si x ≥ ${fmt(q.s, 2)}), puis on évalue sur les ${q.m} observations du pli ${cur + 1} : ${q.ok}/${q.m} bien classées → score <b>${fmt(q.acc, 2)}</b>. Le pli de validation n'a jamais servi à apprendre.`; }
  };
  const stop = () => { clearInterval(timer); timer = null; $i(el, 'play').textContent = 'Animer'; };
  const setK = k => { stop(); K = k; cur = K; $q(el, 'k').textContent = K === n ? 'n' : K; compute(); V.fit(); say(); };
  $i(el, 'k').oninput = e => { $i(el, 'loo').checked = false; setK(+e.target.value); };
  $i(el, 'loo').onchange = e => setK(e.target.checked ? n : +$i(el, 'k').value);
  $i(el, 'next').onclick = () => { stop(); cur = cur >= K ? 0 : cur + 1; V.req(); say(); };
  $i(el, 'prev').onclick = () => { stop(); cur = cur <= 0 ? K : cur - 1; V.req(); say(); };
  $i(el, 'play').onclick = () => { if (timer){ stop(); return; } cur = 0; V.req(); say(); $i(el, 'play').textContent = 'Pause';
    timer = setInterval(() => { if (!vzAlive(V.cv)) return stop(); cur++; V.req(); say(); if (cur >= K) stop(); }, K > 12 ? 450 : 1000); };
  compute(); V.fit(); say();
};

/* ---- Sigmoïde, seuil α et coût logistique ---- */
VIZ.sigmoid = el => {
  el.innerHTML = vizHead('Régression logistique en 1D', 'Règle w, b et le seuil α, ou lance la descente de gradient qui minimise le coût logistique.') +
    `<div class="viz-ctrl"><label>w = <b data-o="w"></b> <input type="range" min="-2" max="6" step="0.1" value="1" data-i="w" aria-label="w"></label>
     <label>b = <b data-o="b"></b> <input type="range" min="-5" max="5" step="0.1" value="1.5" data-i="b" aria-label="b"></label>
     <label>α = <b data-o="a"></b> <input type="range" min="0.05" max="0.95" step="0.05" value="0.5" data-i="a" aria-label="seuil alpha"></label>
     <button class="btn small" data-i="fit">Ajuster (descente de gradient)</button></div><div class="viz-stage"></div>` +
    vzLeg([['l','--accent','σ(wx + b) = P(Y = 1 | x)'],['o','--c1','y = −1 (tracé en 0)'],['s','--c2','y = 1'],['r','--red','mal classé au seuil α'],['lt','--muted','écart à la courbe (coût du point)']]) +
    `<div class="metrics viz-metrics" data-o="m"></div><p class="viz-out" data-o="out"></p>
     <p class="math-note">Coût minimisé : \\( \\frac1n\\sum_i\\log\\big(1+e^{-y_i(wx_i+b)}\\big) \\) avec \\(y_i\\in\\{-1,1\\}\\). Il est convexe : la descente de gradient trouve le minimum.</p>`;
  const r = rng(5), xs = [];
  for (let i = 0; i < 16; i++) xs.push([gauss(r)*0.9 - 1.1, -1]);
  for (let i = 0; i < 16; i++) xs.push([gauss(r)*0.9 + 1.1, 1]);
  const Sg = z => 1/(1 + Math.exp(-z)), inp = k => $i(el, k);
  const st = {w: 1, b: 1.5}; let anim = 0;
  const V = vizCanvas(el.querySelector('.viz-stage'), w => w < 500 ? 0.8 : 0.42, {label: 'Courbe sigmoïde et points des deux classes'});
  V.draw = () => {
    const {ctx, W, H} = V, p = vzPal(), col = p.c, {w, b} = st, a = +inp('a').value, R0 = vzR(W);
    $q(el, 'w').textContent = fmt(w, 2); $q(el, 'b').textContent = fmt(b, 2); $q(el, 'a').textContent = fmt(a, 2);
    const S = vzScale(34, W - 12, 20, H - 34, -4, 4, -0.1, 1.1);
    ctx.clearRect(0, 0, W, H);
    const xs0 = Math.abs(w) > 1e-9 ? (Math.log(a/(1 - a)) - b)/w : null;
    ctx.fillStyle = shade(col[1], 0.1);
    if (xs0 !== null){ const xp = clamp(S.X(xs0), S.L, S.R); w > 0 ? ctx.fillRect(xp, S.T, S.R - xp, S.B - S.T) : ctx.fillRect(S.L, S.T, xp - S.L, S.B - S.T); }
    else if (Sg(b) >= a) ctx.fillRect(S.L, S.T, S.R - S.L, S.B - S.T);
    vzAxes(ctx, S, {yt: [0, 0.5, 1], xt: [-4, -2, 0, 2, 4], fx: v => fmt(v, 0), fy: v => fmt(v, 1), xlab: 'x'});
    ctx.setLineDash([5, 4]); ctx.strokeStyle = p.muted; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(S.L, S.Y(a)); ctx.lineTo(S.R, S.Y(a)); ctx.stroke();
    if (xs0 !== null && xs0 > -4 && xs0 < 4){ ctx.strokeStyle = p.ink; ctx.beginPath(); ctx.moveTo(S.X(xs0), S.T); ctx.lineTo(S.X(xs0), S.B); ctx.stroke(); }
    ctx.setLineDash([]);
    let err = 0, loss = 0, TP = 0, FN = 0, TN = 0, FP = 0;
    xs.forEach(([x, y], i) => { const pr = Sg(w*x + b), yh = pr >= a ? 1 : -1, y01 = y > 0 ? 1 : 0, px = S.X(x), py = S.Y(y01) + (i % 3 - 1)*4;
      if (yh !== y) err++; if (y > 0) (yh > 0 ? TP++ : FN++); else (yh > 0 ? FP++ : TN++);
      loss += Math.log(1 + Math.exp(-y*(w*x + b)));
      ctx.strokeStyle = yh !== y ? shade(p.red, 0.7) : shade(p.muted, 0.55); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, S.Y(pr)); ctx.stroke(); });
    const c = []; for (let x = -4; x <= 4.0001; x += 0.04) c.push([S.X(x), S.Y(Sg(w*x + b))]); vzPath(ctx, c, p.accent, 2.6);
    xs.forEach(([x, y], i) => { const pr = Sg(w*x + b), yh = pr >= a ? 1 : -1, px = S.X(x), py = S.Y(y > 0 ? 1 : 0) + (i % 3 - 1)*4;
      dot(ctx, px, py, R0, y > 0 ? 1 : 0, col[y > 0 ? 1 : 0], p.paper); if (yh !== y) ring(ctx, px, py, R0 + 3.5, p.red, 1.8); });
    txt(ctx, 'α = ' + fmt(a, 2), S.L + 4, S.Y(a) - 9, 'left', p.ink, 11);
    if (xs0 !== null && xs0 > -4 && xs0 < 4) vzTag(ctx, 'x* = ' + fmt(xs0, 2), clamp(S.X(xs0), S.L + 40, S.R - 40), S.T + 2, 'center', p.ink, 11);
    txt(ctx, 'ŷ = 1', w >= 0 ? S.R - 4 : S.L + 6, S.B - 12, w >= 0 ? 'right' : 'left', col[1], 12, 'body', '600');
    const m = [['Mal classés', err + ' / ' + xs.length], ['Coût moyen', fmt(loss/xs.length, 3)], ['Sensibilité', fmt(TP/(TP + FN), 2)], ['Spécificité', fmt(TN/(TN + FP), 2)]];
    $q(el, 'm').innerHTML = m.map(([k, v]) => `<div class="metric"><span>${k}</span><b>${v}</b></div>`).join('');
    $q(el, 'out').innerHTML = `Frontière : σ(wx + b) = α ⇔ x* = (ln(α/(1−α)) − b)/w ${xs0 === null ? '(w = 0 : pas de frontière, la probabilité est constante)' : '≈ <b>' + fmt(xs0, 2) + '</b>'}. Zone colorée : ŷ = 1. ` +
      (a < 0.5 ? 'α &lt; 0,5 : on prédit 1 plus souvent → sensibilité ↑, spécificité ↓. ' : a > 0.5 ? 'α &gt; 0,5 : on prédit 1 moins souvent → spécificité ↑, sensibilité ↓. ' : '') +
      (Math.abs(w) > 3 ? '|w| grand : la transition est raide (probabilités proches de 0 ou 1).' : Math.abs(w) < 0.5 ? '|w| petit : la courbe est aplatie, les probabilités restent proches de σ(b).' : '');
  };
  const sync = () => { inp('w').value = st.w.toFixed(1); inp('b').value = st.b.toFixed(1); };
  ['w', 'b'].forEach(k => inp(k).oninput = () => { cancelAnimationFrame(anim); st[k] = +inp(k).value; V.req(); });
  inp('a').oninput = () => V.req();
  inp('fit').onclick = () => {
    cancelAnimationFrame(anim); let fr = 0;
    const step = () => { if (!vzAlive(V.cv)) return;
      for (let it = 0; it < 30; it++){ let gw = 0, gb = 0; xs.forEach(([x, y]) => { const s = -y/(1 + Math.exp(y*(st.w*x + st.b))); gw += s*x; gb += s; }); st.w = clamp(st.w - 0.5*gw/xs.length, -2, 6); st.b = clamp(st.b - 0.5*gb/xs.length, -5, 5); }
      sync(); V.draw(); if (++fr < 90) anim = requestAnimationFrame(step); };
    step();
  };
  V.fit();
};

/* ---- Seuil, matrice de confusion et ROC ---- */
VIZ.roc = el => {
  el.innerHTML = vizHead('Seuil de décision, matrice de confusion et ROC', 'Déplace le seuil s (curseur, ou fais glisser sur l\'histogramme, ou touche la courbe ROC) : chaque seuil donne une matrice de confusion et un point de la courbe.') +
    `<div class="viz-ctrl"><label>s = <b data-o="s"></b> <input type="range" min="0" max="1" step="0.01" value="0.5" data-i="s" aria-label="seuil s"></label></div><div class="viz-stage"></div>` +
    vzLeg([['s','--c2','scores des positifs (y = 1)'],['o','--c1','scores des négatifs (y = 0)'],['l','--accent','courbe ROC'],['a','--accent','aire = AUC']]) +
    `<div class="viz-row"><div class="viz-cm" data-o="cm" aria-live="polite"></div><div class="metrics viz-metrics" data-o="m"></div></div><p class="viz-out" data-o="out"></p>`;
  const r = rng(21), neg = [], pos = [];
  for (let i = 0; i < 60; i++) neg.push(clamp(0.38 + gauss(r)*0.14, 0.01, 0.99));
  for (let i = 0; i < 40; i++) pos.push(clamp(0.63 + gauss(r)*0.14, 0.01, 0.99));
  const ths = [1.01, ...[...neg, ...pos].sort((a, b) => b - a), -0.01];
  const rates = s => [neg.filter(v => v >= s).length/neg.length, pos.filter(v => v >= s).length/pos.length];
  const curve = ths.map(rates); let auc = 0; for (let i = 1; i < curve.length; i++) auc += (curve[i][0] - curve[i-1][0])*(curve[i][1] + curve[i-1][1])/2;
  const bins = 20, hist = arr => { const h = Array(bins).fill(0); arr.forEach(v => h[Math.min(bins - 1, Math.floor(v*bins))]++); return h; }, hp = hist(pos), hn = hist(neg), mxh = Math.max(...hp, ...hn);
  const inp = $i(el, 's'); let Hs = null, Rs = null, drag = false;
  const lay = W => W >= 600 ? {wide: true, hw: W*0.56} : {wide: false, hh: Math.round(W*0.62)};
  const V = vizCanvas(el.querySelector('.viz-stage'), w => w >= 600 ? 0.46 : (Math.round(w*0.62) + Math.min(w - 64, 280) + 52)/w, {tap: true, maxH: 720, label: 'Histogrammes des scores et courbe ROC'});
  V.draw = () => {
    const {ctx, W, H} = V, s = +inp.value, p = vzPal(), col = p.c, Ly = lay(W);
    $q(el, 's').textContent = fmt(s, 2);
    ctx.clearRect(0, 0, W, H);
    const hw = Ly.wide ? Ly.hw : W, hh = Ly.wide ? H : Ly.hh;
    Hs = vzScale(12, hw - 12, 22, hh - 30, 0, 1, -1, 1);
    const mid = (Hs.T + Hs.B)/2, u = (mid - Hs.T - 4)/mxh, bw = (Hs.R - Hs.L)/bins, X = Hs.X;
    ctx.fillStyle = shade(p.accent, 0.06); ctx.fillRect(X(s), Hs.T, Hs.R - X(s), Hs.B - Hs.T);
    hp.forEach((c, i) => { ctx.fillStyle = shade(col[1], (i + 0.5)/bins >= s ? 0.9 : 0.3); ctx.fillRect(Hs.L + i*bw + 1, mid - 1 - c*u, bw - 2, c*u); });
    hn.forEach((c, i) => { ctx.fillStyle = shade(col[0], (i + 0.5)/bins >= s ? 0.9 : 0.3); ctx.fillRect(Hs.L + i*bw + 1, mid + 1, bw - 2, c*u); });
    ctx.strokeStyle = p.lineS; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Hs.L, mid + 0.5); ctx.lineTo(Hs.R, mid + 0.5); ctx.stroke();
    [0, 0.25, 0.5, 0.75, 1].forEach(v => txt(ctx, fmt(v, 2), X(v), Hs.B + 12, 'center', p.muted, 10.5));
    txt(ctx, 'score →', Hs.R, Hs.B + 25, 'right', p.ink, 11, 'body', '600');
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(X(s), Hs.T - 6); ctx.lineTo(X(s), Hs.B); ctx.stroke();
    dot(ctx, X(s), Hs.T - 6, 6, 0, p.ink, p.paper, 2);
    const xs = clamp(X(s), Hs.L + 30, Hs.R - 30);
    vzTag(ctx, 'FN', xs - 6, Hs.T + 10, 'right', col[1], 12); vzTag(ctx, 'TP', xs + 6, Hs.T + 10, 'left', col[1], 12);
    vzTag(ctx, 'TN', xs - 6, Hs.B - 10, 'right', col[0], 12); vzTag(ctx, 'FP', xs + 6, Hs.B - 10, 'left', col[0], 12);
    txt(ctx, 'positifs', Hs.L, Hs.T - 10, 'left', col[1], 11, 'body', '600'); vzTag(ctx, 'négatifs', Hs.L + 2, Hs.B - 8, 'left', col[0], 11);
    const side = Ly.wide ? Math.min(W - hw - 56, H - 56) : Math.min(W - 64, 280), ox = Ly.wide ? hw + 44 : (W - side)/2 + 12, oy = Ly.wide ? 24 : hh + 20;
    Rs = vzScale(ox, ox + side, oy, oy + side, 0, 1, 0, 1);
    ctx.beginPath(); ctx.moveTo(Rs.X(0), Rs.Y(0)); curve.forEach(q => ctx.lineTo(Rs.X(q[0]), Rs.Y(q[1]))); ctx.lineTo(Rs.X(1), Rs.Y(0)); ctx.closePath(); ctx.fillStyle = shade(p.accent, 0.1); ctx.fill();
    vzAxes(ctx, Rs, {xt: [0, 0.5, 1], yt: [0, 0.5, 1], fx: v => fmt(v, 1), xlab: 'FPR = 1 − spécificité', ylab: 'TPR = sensibilité', fs: 10.5});
    ctx.setLineDash([4, 4]); ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.moveTo(Rs.X(0), Rs.Y(0)); ctx.lineTo(Rs.X(1), Rs.Y(1)); ctx.stroke(); ctx.setLineDash([]);
    vzPath(ctx, curve.map(q => [Rs.X(q[0]), Rs.Y(q[1])]), p.accent, 2.4);
    const [fpr, tpr] = rates(s);
    ctx.setLineDash([2, 3]); ctx.strokeStyle = p.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Rs.X(fpr), Rs.Y(0)); ctx.lineTo(Rs.X(fpr), Rs.Y(tpr)); ctx.lineTo(Rs.X(0), Rs.Y(tpr)); ctx.stroke(); ctx.setLineDash([]);
    dot(ctx, Rs.X(fpr), Rs.Y(tpr), 6, 0, p.ink, p.paper, 2);
    vzTag(ctx, 'AUC = ' + fmt(auc, 3), Rs.R - 4, Rs.B - 12, 'right', p.accent, 11.5);
    const TP = pos.filter(v => v >= s).length, FN = pos.length - TP, FP = neg.filter(v => v >= s).length, TN = neg.length - FP;
    $q(el, 'cm').innerHTML = `<span></span><span class="h">réel 0</span><span class="h">réel 1</span><span class="h">prédit 0</span><span class="ok">TN<b>${TN}</b></span><span class="ko">FN<b>${FN}</b></span><span class="h">prédit 1</span><span class="ko">FP<b>${FP}</b></span><span class="ok">TP<b>${TP}</b></span>`;
    const m = [['Sensibilité TP/(TP+FN)', fmt(TP/(TP + FN), 2)], ['Spécificité TN/(TN+FP)', fmt(TN/(TN + FP), 2)], ['Précision TP/(TP+FP)', fmt(TP/(TP + FP), 2)], ['Accuracy', fmt((TP + TN)/100, 2)]];
    $q(el, 'm').innerHTML = m.map(([k, v]) => `<div class="metric"><span>${k}</span><b>${v}</b></div>`).join('');
    $q(el, 'out').innerHTML = `Seuil s = ${fmt(s, 2)} : on prédit 1 quand le score est ≥ s. Point ROC = (FPR, TPR) = (${fmt(fpr, 2)} ; ${fmt(tpr, 2)}). ` +
      (s <= 0.2 ? 'Seuil bas : presque tout est prédit 1 → sensibilité ≈ 1 mais beaucoup de FP (on monte vers le coin (1,1)).' : s >= 0.8 ? 'Seuil haut : presque tout est prédit 0 → peu de FP mais beaucoup de FN (on descend vers (0,0)).' : 'Baisser s fait monter la sensibilité et baisser la spécificité. L\'AUC, elle, ne dépend pas du seuil.');
  };
  const fromPointer = e => { const [x, y] = V.pos(e);
    if (Rs && Rs.in(x, y)){ const fx = Rs.ix(x), fy = Rs.iy(y); let bi = 0, bd = Infinity; curve.forEach((q, i) => { const d = (q[0] - fx)**2 + (q[1] - fy)**2; if (d < bd){ bd = d; bi = i; } }); inp.value = clamp(ths[bi], 0, 1); }
    else if (Hs && y <= Hs.B + 30 && x <= Hs.R + 12) inp.value = clamp(Hs.ix(x), 0, 1);
    else return false;
    V.req(); return true; };
  V.cv.addEventListener('pointerdown', e => { if (fromPointer(e)){ drag = true; try{ V.cv.setPointerCapture(e.pointerId); }catch(_){} } });
  V.cv.addEventListener('pointermove', e => { if (drag) fromPointer(e); });
  ['pointerup', 'pointercancel'].forEach(t => V.cv.addEventListener(t, () => drag = false));
  inp.oninput = () => V.req();
  V.fit();
};

/* ---- CART : partition du plan et arbre correspondant ---- */
VIZ.cart = el => {
  const uid = ++vzUid;
  el.innerHTML = vizHead('Arbre CART : partition et arbre', 'Augmente la profondeur : chaque coupure maximise le gain d\'impureté. Touche une région ou un nœud pour voir son chemin et ses effectifs.') +
    `<div class="viz-ctrl"><label>profondeur max = <b data-o="d">2</b> <input type="range" min="0" max="6" step="1" value="2" data-i="d" aria-label="profondeur maximale"></label>
     <span class="viz-seg" role="radiogroup" aria-label="critère d'impureté"><label class="chk"><input type="radio" name="crit${uid}" value="gini" checked> Gini</label><label class="chk"><input type="radio" name="crit${uid}" value="ent"> entropie</label></span></div>
     <div class="viz-stage"></div>` + vzLeg([['o','--c1','classe A'],['s','--c2','classe B'],['t','--c3','classe C'],['l','--ink','coupure = nœud interne'],['a','--c2','région = feuille']]) +
    `<p class="viz-out" data-o="node"></p><p class="viz-out" data-o="out"></p>`;
  const r = rng(8), pts = [];
  const add = (n, cx, cy, sd, c) => { for (let i = 0; i < n; i++) pts.push([clamp(cx + gauss(r)*sd, .02, .98), clamp(cy + gauss(r)*sd, .02, .98), c]); };
  add(28, 0.27, 0.3, 0.12, 0); add(26, 0.5, 0.75, 0.12, 1); add(24, 0.76, 0.32, 0.11, 2); add(6, 0.5, 0.45, 0.2, 1);
  const counts = idx => { const c = [0, 0, 0]; idx.forEach(i => c[pts[i][2]]++); return c; };
  const IMP = {gini: c => { const n = c[0] + c[1] + c[2]; return n ? 1 - c.reduce((s, x) => s + (x/n)**2, 0) : 0; },
               ent: c => { const n = c[0] + c[1] + c[2]; return n ? -c.reduce((s, x) => s + (x ? x/n*Math.log2(x/n) : 0), 0) : 0; }};
  function build(idx, box, depth, maxD, crit, path){
    const c = counts(idx), node = {idx, box, c, cls: c.indexOf(Math.max(...c)), imp: IMP[crit](c), depth, path}, g0 = node.imp;
    if (depth >= maxD || g0 < 1e-12 || idx.length < 2) return node;
    let best = null;
    for (const f of [0, 1]){
      const s = idx.slice().sort((a, b) => pts[a][f] - pts[b][f]), L = [0, 0, 0], R = c.slice();
      for (let k = 0; k < s.length - 1; k++){ // balayage : coût linéaire par variable
        L[pts[s[k]][2]]++; R[pts[s[k]][2]]--;
        const v0 = pts[s[k]][f], v1 = pts[s[k+1]][f]; if (v1 - v0 < 1e-12) continue;
        const nl = k + 1, nr = s.length - nl, gain = g0 - nl/s.length*IMP[crit](L) - nr/s.length*IMP[crit](R);
        if (!best || gain > best.gain + 1e-12) best = {f, t: (v0 + v1)/2, gain};
      }
    }
    if (!best || best.gain <= 1e-12) return node;
    const Lh = idx.filter(i => pts[i][best.f] < best.t), Rh = idx.filter(i => pts[i][best.f] >= best.t);
    const bl = box.slice(), br = box.slice(); if (best.f === 0){ bl[2] = best.t; br[0] = best.t; } else { bl[3] = best.t; br[1] = best.t; }
    Object.assign(node, {f: best.f, t: best.t, gain: best.gain, l: build(Lh, bl, depth + 1, maxD, crit, path + 'l'), r: build(Rh, br, depth + 1, maxD, crit, path + 'r')});
    return node;
  }
  const cache = {}; let root = null, sel = '', P = null, T = null, nodesPx = [];
  const getD = () => +$i(el, 'd').value, getC = () => el.querySelector(`input[name=crit${uid}]:checked`).value;
  const rebuild = () => { const k = getD() + getC(); root = cache[k] || (cache[k] = build(pts.map((p, i) => i), [0, 0, 1, 1], 0, getD(), getC(), '')); };
  const nodeAt = path => { let n = root; for (const ch of path){ if (!n.l) break; n = ch === 'l' ? n.l : n.r; } return n; };
  const treeH = () => 56 + 46*Math.max(1, getD());
  const V = vizCanvas(el.querySelector('.viz-stage'), w => w >= 640 ? 0.56 : (Math.round(w*0.86) + treeH())/w, {tap: true, maxH: 900, label: 'Partition du plan par l\'arbre et schéma de l\'arbre'});
  const VAR = ['x₁', 'x₂'], NAMES = {gini: 'Gini', ent: 'entropie'};
  V.draw = () => {
    const {ctx, W, H} = V, p = vzPal(), col = p.c, D = getD(), wide = W >= 640, R0 = vzR(W)*0.9;
    $q(el, 'd').textContent = D;
    ctx.clearRect(0, 0, W, H);
    const side = wide ? Math.min(H - 34, W*0.5) : Math.round(W*0.86) - 30;
    P = vzScale(wide ? 30 : (W - side)/2 + 10, (wide ? 30 : (W - side)/2 + 10) + side - 10, 8, 8 + side - 10, 0, 1, 0, 1);
    T = wide ? {L: P.R + 34, R: W - 10, T: 24, B: H - 26} : {L: 8, R: W - 8, T: P.B + 44, B: H - 22};
    const leaves = [], splits = [];
    (function walk(n){ if (n.l){ splits.push(n); walk(n.l); walk(n.r); } else leaves.push(n); })(root);
    const sn = nodeAt(sel);
    leaves.forEach(n => { const [x0, y0, x1, y1] = n.box; ctx.fillStyle = shade(col[n.cls], 0.17); ctx.fillRect(P.X(x0), P.Y(y1), P.X(x1) - P.X(x0), P.Y(y0) - P.Y(y1)); });
    vzAxes(ctx, P, {grid: false, xt: [0, 0.5, 1], yt: [0, 0.5, 1], fx: v => fmt(v, 1), fs: 10});
    txt(ctx, 'x₁', P.R + 6, P.B, 'left', p.ink, 12, 'body', '600'); txt(ctx, 'x₂', P.L - 18, P.T + 20, 'center', p.ink, 12, 'body', '600');
    splits.forEach(n => { const [x0, y0, x1, y1] = n.box, on = sn === n; ctx.strokeStyle = on ? p.accent : p.ink; ctx.lineWidth = on ? 3 : 1.6; ctx.beginPath();
      if (n.f === 0){ ctx.moveTo(P.X(n.t), P.Y(y0)); ctx.lineTo(P.X(n.t), P.Y(y1)); } else { ctx.moveTo(P.X(x0), P.Y(n.t)); ctx.lineTo(P.X(x1), P.Y(n.t)); } ctx.stroke(); });
    pts.forEach(q => dot(ctx, P.X(q[0]), P.Y(q[1]), R0, q[2], col[q[2]], p.paper));
    { const [x0, y0, x1, y1] = sn.box; ctx.setLineDash([6, 3]); ctx.strokeStyle = p.accent; ctx.lineWidth = 2.4; ctx.strokeRect(P.X(x0) + 1, P.Y(y1) + 1, P.X(x1) - P.X(x0) - 2, P.Y(y0) - P.Y(y1) - 2); ctx.setLineDash([]); }
    // arbre
    let li = 0, md = 0; (function lay(n){ md = Math.max(md, n.depth); if (n.l){ lay(n.l); lay(n.r); n.lx = (n.l.lx + n.r.lx)/2; } else n.lx = li++ + 0.5; })(root);
    const slot = (T.R - T.L)/li, gy = md ? (T.B - T.T)/md : 0, NX = n => T.L + n.lx*slot, NY = n => md ? T.T + n.depth*gy : (T.T + T.B)/2;
    txt(ctx, 'arbre' + (wide ? '' : ' correspondant'), T.L, T.T - 16, 'left', p.muted, 11, 'body', '600');
    const onPath = n => sel.startsWith(n.path);
    nodesPx = [];
    (function edges(n){ if (!n.l) return; [n.l, n.r].forEach((ch, k) => { const hl = onPath(ch); ctx.strokeStyle = hl ? p.accent : p.lineS; ctx.lineWidth = hl ? 3 : 1.4;
      ctx.beginPath(); ctx.moveTo(NX(n), NY(n)); ctx.lineTo(NX(ch), NY(ch)); ctx.stroke();
      if (n.depth === 0) txt(ctx, k ? 'non' : 'oui', (NX(n) + NX(ch))/2 + (k ? 8 : -8), (NY(n) + NY(ch))/2 - 6, k ? 'left' : 'right', p.muted, 10.5, 'body'); edges(ch); }); })(root);
    ctx.font = `600 11px ${cssv('--f-mono')}`;
    (function nodes(n){ const x = NX(n), y = NY(n), hl = sn === n;
      nodesPx.push([x, y, n.path]);
      if (n.l){ const s = `${VAR[n.f]} < ${fmt(n.t, 2)}`, tw = ctx.measureText(s).width;
        const room = (n.r.lx - n.l.lx)*slot;
        const s2 = `${VAR[n.f]}<${fmt(n.t, 2)}`; ctx.font = `600 10px ${cssv('--f-mono')}`; const tw2 = ctx.measureText(s2).width; ctx.font = `600 11px ${cssv('--f-mono')}`;
        const full = room >= tw + 6 || n.depth === 0, lab = full ? s : s2, lw2 = full ? tw : tw2, fs2 = full ? 11 : 10;
        if (full || room >= tw2 + 4){ ctx.fillStyle = p.paper2; ctx.strokeStyle = hl ? p.accent : p.lineS; ctx.lineWidth = hl ? 2.4 : 1;
          ctx.beginPath(); ctx.rect(x - lw2/2 - 4, y - 9, lw2 + 8, 18); ctx.fill(); ctx.stroke(); txt(ctx, lab, x, y + 0.5, 'center', p.ink, fs2, 'mono', '600'); ctx.font = `600 11px ${cssv('--f-mono')}`; }
        else dot(ctx, x, y, 5, 0, p.paper2, hl ? p.accent : p.ink, hl ? 2.4 : 1.2);
        nodes(n.l); nodes(n.r);
      } else { const sz = clamp(slot*0.32, 4, 9); dot(ctx, x, y, sz, n.cls, col[n.cls], hl ? p.accent : p.paper, hl ? 3 : 1.2);
        if (slot >= 24) txt(ctx, String(n.idx.length), x, y + sz + 9, 'center', p.muted, 10); } })(root);
    // textes
    const rules = []; { let n = root; for (const ch of sel){ if (!n.l) break; rules.push(`${VAR[n.f]} ${ch === 'l' ? '<' : '≥'} ${fmt(n.t, 2)}`); n = ch === 'l' ? n.l : n.r; } }
    const cr = getC(), other = cr === 'gini' ? 'ent' : 'gini';
    $q(el, 'node').innerHTML = `<b>${sn === root ? 'Racine' : sn.l ? 'Nœud' : 'Feuille'}</b>${rules.length ? ' (' + rules.join(' et ') + ')' : ''} : effectifs [A, B, C] = [${sn.c.join(', ')}], ${NAMES[cr]} = <b>${fmt(sn.imp, 3)}</b> (${NAMES[other]} : ${fmt(IMP[other](sn.c), 3)}). ` +
      (sn.l ? `Meilleure coupure : <b>${VAR[sn.f]} &lt; ${fmt(sn.t, 2)}</b>, gain ${fmt(sn.gain, 3)} = I(R) − (n_g/n)·I(R_g) − (n_d/n)·I(R_d).` : `On prédit la classe majoritaire <b>${CLSNAME[sn.cls]}</b>${sn.imp < 1e-12 ? ' (feuille pure)' : ''}.`);
    const err = leaves.reduce((s, n) => s + n.idx.length - n.c[n.cls], 0);
    $q(el, 'out').innerHTML = `<b>${leaves.length}</b> feuille(s) = ${leaves.length} région(s) rectangulaire(s). Erreur sur l'apprentissage : <b>${pct(err/pts.length)}</b>. ` +
      (D === 0 ? 'Profondeur 0 : une seule feuille, on prédit la classe majoritaire. ' : D >= 5 ? 'Arbre profond : il isole les points mélangés, l\'erreur d\'apprentissage baisse mais c\'est du sur-apprentissage → élagage (cp, λ). ' : '') +
      'Gini (max 2/3 à 3 classes) et entropie (max log₂ 3 ≈ 1,58) donnent souvent les mêmes coupures.';
  };
  const hit = e => { const [x, y] = V.pos(e);
    if (P && P.in(x, y)){ const fx = P.ix(x), fy = P.iy(y); let n = root, path = ''; while (n.l){ const go = (n.f === 0 ? fx : fy) < n.t ? 'l' : 'r'; path += go; n = n[go]; } sel = path; }
    else { let bd = 26*26, bp = null; nodesPx.forEach(([nx, ny, pa]) => { const d = (nx - x)**2 + (ny - y)**2; if (d < bd){ bd = d; bp = pa; } }); if (bp === null) return; sel = bp; }
    V.req(); };
  V.cv.addEventListener('pointerdown', hit);
  $i(el, 'd').oninput = () => { rebuild(); V.fit(); };
  el.querySelectorAll(`input[name=crit${uid}]`).forEach(i => i.onchange = () => { rebuild(); V.req(); });
  rebuild(); V.fit();
};

/* ---- SVM linéaire à marge souple : ξᵢ, vecteurs de support, rôle de C ---- */
VIZ.svm = el => {
  const uid = ++vzUid;
  el.innerHTML = vizHead('SVM à marge souple : le rôle de C', 'Fais varier C ; touche un point pour lire son ξᵢ et son αᵢ.') +
    `<div class="viz-ctrl"><label>C = <b data-o="c"></b> <input type="range" min="-2" max="2" step="0.1" value="0" data-i="c" aria-label="log10 de C"></label>
     <span class="viz-seg" role="radiogroup" aria-label="jeu de données"><label class="chk"><input type="radio" name="ds${uid}" value="mix" checked> classes mélangées</label><label class="chk"><input type="radio" name="ds${uid}" value="sep"> séparables</label></span></div>
     <div class="viz-stage"></div>` +
    vzLeg([['l','--ink','H : ⟨w,x⟩ + b = 0'],['d','--ink','H⁺, H⁻ : = ±1'],['r','--ink','vecteur de support sur la marge'],['r','--warn','dans la marge (0 < ξ ≤ 1)'],['x','--ink','mal classé (ξ > 1)'],['l','--c6','segment ξᵢ (vers H⁺ si y = +1, H⁻ si y = −1)']]) +
    `<p class="viz-out" data-o="out"></p><p class="viz-out" data-o="sel"></p>`;
  const gen = (seed, sd, sep) => { const r = rng(seed), out = [], u = [0.9/1.14, 0.7/1.14];
    for (const y of [1, -1]){ let k = 0, guard = 0; while (k < 26 && guard++ < 2000){ const p = [-0.9*y + gauss(r)*sd, -0.7*y + gauss(r)*sd]; if (sep && -y*(p[0]*u[0] + p[1]*u[1]) < 0.4) continue; out.push([p[0], p[1], y]); k++; } }
    return out; };
  const DS = {mix: gen(4, 0.6, false), sep: gen(6, 0.5, true)}, cache = {};
  let sel = -1, S = null;
  const ds = () => el.querySelector(`input[name=ds${uid}]:checked`).value;
  const train = (k, C) => { const key = k + C; if (!cache[key]){ const pts = DS[k]; cache[key] = vzLinSVM(pts.map(p => [p[0], p[1]]), pts.map(p => p[2]), C); } return cache[key]; };
  const V = vizCanvas(el.querySelector('.viz-stage'), w => w < 500 ? 0.9 : 0.58, {tap: true, label: 'Hyperplan séparateur, marge et variables d\'écart'});
  V.draw = () => {
    const {ctx, W, H} = V, p = vzPal(), col = p.c, lc = +$i(el, 'c').value, C = +Math.pow(10, lc).toPrecision(3), k = ds(), pts = DS[k], R0 = vzR(W);
    $q(el, 'c').textContent = fmt(C, C < 1 ? 2 : 1);
    const {w, b, a} = train(k, C), nw = Math.hypot(w[0], w[1]) || 1e-9, d = [-w[1]/nw, w[0]/nw];
    S = vzScale(6, W - 6, 6, H - 6, -2.7, 2.7, -2.7, 2.7, true);
    ctx.clearRect(0, 0, W, H);
    const big = 2*Math.hypot(S.x1 - S.x0, S.y1 - S.y0), P0 = v => [(v - b)*w[0]/(nw*nw), (v - b)*w[1]/(nw*nw)], at = (v, t) => { const o = P0(v); return [o[0] + t*d[0], o[1] + t*d[1]]; };
    ctx.save(); S.clip(ctx);
    // demi-plans
    const half = (v0, sgn, c) => { const A = at(v0, -big), B = at(v0, big), off = [sgn*w[0]/nw*big, sgn*w[1]/nw*big];
      ctx.beginPath(); ctx.moveTo(S.X(A[0]), S.Y(A[1])); ctx.lineTo(S.X(B[0]), S.Y(B[1])); ctx.lineTo(S.X(B[0] + off[0]), S.Y(B[1] + off[1])); ctx.lineTo(S.X(A[0] + off[0]), S.Y(A[1] + off[1])); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); };
    half(0, 1, shade(col[0], 0.09)); half(0, -1, shade(col[1], 0.09));
    { const A = at(1, -big), B = at(1, big), A2 = at(-1, -big), B2 = at(-1, big); ctx.beginPath(); ctx.moveTo(S.X(A[0]), S.Y(A[1])); ctx.lineTo(S.X(B[0]), S.Y(B[1])); ctx.lineTo(S.X(B2[0]), S.Y(B2[1])); ctx.lineTo(S.X(A2[0]), S.Y(A2[1])); ctx.closePath(); ctx.fillStyle = shade(p.ink, 0.06); ctx.fill(); }
    const line = (v, dash, lw) => { const A = at(v, -big), B = at(v, big); vzPath(ctx, [[S.X(A[0]), S.Y(A[1])], [S.X(B[0]), S.Y(B[1])]], p.ink, lw, dash); };
    line(0, [], 2.2); line(1, [6, 4], 1.2); line(-1, [6, 4], 1.2);
    // ξ
    let nsv = 0, onm = 0, inm = 0, mis = 0, sxi = 0;
    const info = pts.map((q, i) => { const f = w[0]*q[0] + w[1]*q[1] + b, m = q[2]*f, xi = Math.max(0, 1 - m); sxi += xi;
      if (a[i] > 1e-6) nsv++; const st = m < -1e-3 ? 'mis' : m < 1 - 0.02 ? 'in' : a[i] > 1e-6 ? 'sv' : 'out'; if (st === 'mis') mis++; else if (st === 'in') inm++; else if (st === 'sv') onm++; return {f, m, xi, st}; });
    pts.forEach((q, i) => { const I = info[i]; if (I.xi <= 0.02) return; const t = (q[2] - I.f)/(nw*nw), fx = q[0] + t*w[0], fy = q[1] + t*w[1];
      vzPath(ctx, [[S.X(q[0]), S.Y(q[1])], [S.X(fx), S.Y(fy)]], p.c[5], i === sel ? 3.2 : 2); dot(ctx, S.X(fx), S.Y(fy), 2.6, 0, p.c[5]); });
    // marge 1/‖w‖
    { const o = P0(0), o1 = P0(1); if (S.in(S.X(o[0]), S.Y(o[1])) && S.in(S.X(o1[0]), S.Y(o1[1]))){ const ax = S.X(o[0]), ay = S.Y(o[1]), bx = S.X(o1[0]), by = S.Y(o1[1]);
      vzPath(ctx, [[ax, ay], [bx, by]], p.accent, 2.2); dot(ctx, bx, by, 3, 0, p.accent); vzTag(ctx, '1/‖w‖', (ax + bx)/2 + 8, (ay + by)/2, 'left', p.accent, 11.5); } }
    ctx.restore();
    pts.forEach((q, i) => { const I = info[i], x = S.X(q[0]), y = S.Y(q[1]), sh = q[2] > 0 ? 0 : 1;
      dot(ctx, x, y, R0, sh, col[sh], p.paper);
      if (I.st === 'sv') ring(ctx, x, y, R0 + 4, p.ink, 1.8);
      if (I.st === 'in') ring(ctx, x, y, R0 + 4, p.warn, 2);
      if (I.st === 'mis'){ cross(ctx, x, y, R0 + 3, p.paper, 4.5); cross(ctx, x, y, R0 + 3, p.ink, 2.2); }
      if (i === sel) ring(ctx, x, y, R0 + 8, p.accent, 2.4, [3, 2]); });
    // étiquettes des droites
    const lab = (v, s) => { for (let t = -big; t <= big; t += 0.05){ const q = at(v, t), x = S.X(q[0]), y = S.Y(q[1]); if (x > S.L + 18 && x < S.R - 30 && y > S.T + 14 && y < S.B - 14){ vzTag(ctx, s, x + 6, y, 'left', p.ink, 11.5); return; } } };
    lab(0, 'H'); if (W >= 400){ lab(1, 'H⁺'); lab(-1, 'H⁻'); }
    txt(ctx, 'y = +1', S.L + 6, S.B - 12, 'left', col[0], 12, 'body', '600'); txt(ctx, 'y = −1', S.R - 6, S.T + 12, 'right', col[1], 12, 'body', '600');
    $q(el, 'out').innerHTML = `Marge 1/‖w‖ = <b>${fmt(1/nw, 3)}</b>. αᵢ &gt; 0 (vecteurs de support au sens large) : <b>${nsv}</b> points, dont ${onm} exactement sur H± (0 &lt; αᵢ &lt; C), ${inm} dans la marge et ${mis} mal classés (αᵢ = C). Σξᵢ = ${fmt(sxi, 2)} ; objectif ½‖w‖² + CΣξᵢ = ${fmt(nw*nw/2 + C*sxi, 2)}. ` +
      (C <= 0.05 ? '<b>C petit</b> : les ξᵢ coûtent peu, marge large, beaucoup de points dans la marge (biais ↑, variance ↓).' : C >= 20 ? '<b>C grand</b> : les ξᵢ coûtent cher, marge étroite, presque une marge rigide (biais ↓, variance ↑).' : 'Seuls les points avec αᵢ &gt; 0 déterminent w = Σ αᵢyᵢxᵢ : déplacer un point hors de la marge ne changerait rien.');
    if (sel >= 0 && sel < pts.length){ const q = pts[sel], I = info[sel];
      $q(el, 'sel').innerHTML = `Point touché : y = ${q[2] > 0 ? '+1' : '−1'}, y·(⟨w,x⟩ + b) = ${fmt(I.m, 2)} → <b>ξ = max(0, 1 − y(⟨w,x⟩+b)) = ${fmt(I.xi, 2)}</b>, α = ${fmt(a[sel], 3)}. ` +
        ({out: 'Bien classé hors de la marge : α = 0, il ne compte pas.', sv: 'Sur la marge : vecteur de support (0 < α < C).', in: 'Dans la marge mais du bon côté (0 < ξ ≤ 1) : α = C.', mis: 'Du mauvais côté de H (ξ > 1) : mal classé, α = C.'})[I.st];
    } else $q(el, 'sel').textContent = '';
  };
  V.cv.addEventListener('pointerdown', e => { const [x, y] = V.pos(e), pts = DS[ds()]; let bi = -1, bd = 24*24; pts.forEach((q, i) => { const d = (S.X(q[0]) - x)**2 + (S.Y(q[1]) - y)**2; if (d < bd){ bd = d; bi = i; } }); sel = bi; V.req(); });
  $i(el, 'c').oninput = () => V.req();
  el.querySelectorAll(`input[name=ds${uid}]`).forEach(i => i.onchange = () => { sel = -1; V.req(); });
  V.fit();
};

/* ---- Silhouette : a(x), b(x) sur le dessin et diagramme des silhouettes ---- */
VIZ.silhouette = el => {
  el.innerHTML = vizHead('Coefficient de silhouette', 'Fais glisser le point entouré x vers un autre groupe : s(x) devient négatif. Touche un autre point pour le sélectionner.') + `<div class="viz-stage"></div>` +
    vzLeg([['l','--ink','vers son cluster : moyenne = a(x)'],['d','--ink','vers le cluster voisin : moyenne = b(x)'],['a','--c1','barres : s de chaque point, triées par cluster']]) + `<p class="viz-out" data-o="out"></p>`;
  const r = rng(9), pts = [];
  [[0.22, 0.68], [0.55, 0.28], [0.8, 0.72]].forEach((c, k) => { for (let i = 0; i < 11; i++) pts.push([clamp(c[0] + gauss(r)*0.06, .03, .97), clamp(c[1] + gauss(r)*0.07, .03, .97), k]); });
  let sel = 3, drag = false, S = null;
  const d = (p, q) => 10*Math.hypot(p[0] - q[0], p[1] - q[1]);
  const sil = i => { const p = pts[i], own = pts.filter((q, j) => j !== i && q[2] === p[2]); const a = own.length ? own.reduce((s, q) => s + d(p, q), 0)/own.length : 0;
    let b = Infinity, bk = -1; [0, 1, 2].filter(k => k !== p[2]).forEach(k => { const o = pts.filter(q => q[2] === k); const m = o.reduce((s, q) => s + d(p, q), 0)/o.length; if (m < b){ b = m; bk = k; } });
    return {a, b, bk, s: own.length ? (b - a)/Math.max(a, b) : 0}; };
  const V = vizCanvas(el.querySelector('.viz-stage'), w => w >= 600 ? 0.5 : (Math.round(w*0.95) + 190)/w, {drag: true, maxH: 720, label: 'Trois clusters, point sélectionné et diagramme des silhouettes'});
  V.draw = () => {
    const {ctx, W, H} = V, p = vzPal(), col = p.c, wide = W >= 600, R0 = vzR(W), Sx = sil(sel), q0 = pts[sel];
    ctx.clearRect(0, 0, W, H);
    S = wide ? vzScale(8, W*0.6, 8, H - 8, 0, 1, 0, 1, true) : vzScale(8, W - 8, 8, Math.round(W*0.95) - 8, 0, 1, 0, 1, true);
    pts.forEach((q, j) => { if (j === sel || (q[2] !== q0[2] && q[2] !== Sx.bk)) return; vzPath(ctx, [[S.X(q0[0]), S.Y(q0[1])], [S.X(q[0]), S.Y(q[1])]], shade(col[q[2]], 0.6), 1.2, q[2] === q0[2] ? [] : [4, 4]); });
    pts.forEach(q => dot(ctx, S.X(q[0]), S.Y(q[1]), R0, q[2], col[q[2]], p.paper));
    const x = S.X(q0[0]), y = S.Y(q0[1]); ring(ctx, x, y, R0 + 6, p.ink, 2.2);
    const lx = x > S.R - 120 ? x - 14 : x + 14, al = x > S.R - 120 ? 'right' : 'left';
    vzTag(ctx, `a(x) = ${fmt(Sx.a, 2)}`, lx, y - 16, al, p.ink, 11.5); vzTag(ctx, `b(x) = ${fmt(Sx.b, 2)}`, lx, y + 1, al, col[Sx.bk], 11.5);
    vzTag(ctx, `s(x) = ${fmt(Sx.s, 2)}`, lx, y + 18, al, Sx.s < 0 ? p.red : p.ink, 11.5);
    // diagramme des silhouettes
    const all = pts.map((q, j) => ({j, k: q[2], s: sil(j).s})), glob = all.reduce((s, v) => s + v.s, 0)/all.length, mn = Math.min(-0.25, ...all.map(v => v.s - 0.05));
    const B = wide ? vzScale(W*0.6 + 34, W - 12, 26, H - 30, mn, 1, 0, 1) : vzScale(30, W - 12, Math.round(W*0.95) + 22, H - 30, mn, 1, 0, 1);
    txt(ctx, 'diagramme des silhouettes', B.L, B.T - 14, 'left', p.muted, 11, 'body', '600');
    const gap = 6, hb = (B.B - B.T - 2*gap)/pts.length; let yy = B.T;
    [0, 1, 2].forEach(k => { all.filter(v => v.k === k).sort((u, v) => v.s - u.s).forEach(v => { const x0 = B.X(0), x1 = B.X(v.s);
      ctx.fillStyle = v.j === sel ? p.ink : shade(col[k], 0.85); ctx.fillRect(Math.min(x0, x1), yy + 0.5, Math.abs(x1 - x0), Math.max(1, hb - 1)); yy += hb; }); yy += gap;
      txt(ctx, CLSNAME[k], B.L - 6, yy - gap - 5.5*hb, 'right', col[k], 11, 'body', '600'); });
    ctx.strokeStyle = p.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(B.X(0) + 0.5, B.T); ctx.lineTo(B.X(0) + 0.5, B.B); ctx.stroke();
    ctx.setLineDash([4, 3]); ctx.strokeStyle = p.red; ctx.beginPath(); ctx.moveTo(B.X(glob), B.T); ctx.lineTo(B.X(glob), B.B); ctx.stroke(); ctx.setLineDash([]);
    [mn < -0.5 ? -0.5 : 0, 0.5, 1].concat(mn < -0.5 ? [0] : []).forEach(v => txt(ctx, fmt(v, 1), B.X(v), B.B + 12, 'center', p.muted, 10.5));
    txt(ctx, 'moyenne ' + fmt(glob, 2), B.X(glob) + 4, B.B + 24, B.X(glob) > B.R - 80 ? 'right' : 'left', p.red, 10.5);
    $q(el, 'out').innerHTML = `x est dans le cluster <b>${CLSNAME[q0[2]]}</b>. a(x) = distance moyenne aux autres points de son cluster (traits pleins) = <b>${fmt(Sx.a, 2)}</b> ; b(x) = plus petite distance moyenne à un autre cluster, ici <b>${CLSNAME[Sx.bk]}</b> (pointillés) = <b>${fmt(Sx.b, 2)}</b>. ` +
      `s(x) = (b − a)/max(a, b) = <b style="color:${Sx.s < 0 ? 'var(--red)' : 'inherit'}">${fmt(Sx.s, 3)}</b>${Sx.s < 0 ? ' &lt; 0 : x est en moyenne plus proche d\'un autre cluster que du sien, il est probablement mal assigné.' : Sx.s > 0.5 ? ' : x est bien assigné.' : ' : x est près de la frontière entre deux clusters.'} Silhouette moyenne de la partition : <b>${fmt(glob, 3)}</b> (on peut choisir K qui la maximise).`;
  };
  const pick = e => { const [x, y] = V.pos(e); return [x, y, clamp(S.ix(x), S.x0, S.x1), clamp(S.iy(y), S.y0, S.y1)]; };
  V.cv.addEventListener('pointerdown', e => { const [px, py, x, y] = pick(e); if (!S.in(px, py)) return; let bi = -1, bd = Infinity; pts.forEach((q, j) => { const dd = (S.X(q[0]) - px)**2 + (S.Y(q[1]) - py)**2; if (dd < bd){ bd = dd; bi = j; } });
    if (bi !== sel && bd < 22*22) sel = bi; else { pts[sel][0] = x; pts[sel][1] = y; }
    drag = true; try{ V.cv.setPointerCapture(e.pointerId); }catch(_){} V.req(); });
  V.cv.addEventListener('pointermove', e => { if (!drag) return; const [, , x, y] = pick(e); pts[sel][0] = x; pts[sel][1] = y; V.req(); });
  ['pointerup', 'pointercancel'].forEach(t => V.cv.addEventListener(t, () => drag = false));
  V.fit();
};

/* ---- ROC d'une soumission Kaggle : étiquettes 0/1 ou scores ---- */
VIZ.kaggle = el => {
  const uid = ++vzUid;
  el.innerHTML = vizHead('ROC d\'une soumission : étiquettes ou probabilités ?', 'Compare la courbe calculée à partir de 0/1 et à partir des scores.') +
    `<div class="viz-ctrl"><span class="viz-seg" role="radiogroup" aria-label="contenu du fichier"><label class="chk"><input type="radio" name="kg${uid}" value="lab" checked data-i="lab"> étiquettes 0/1 (seuil 0,5)</label><label class="chk"><input type="radio" name="kg${uid}" value="prob" data-i="prob"> probabilités</label></span></div><div class="viz-stage"></div>` +
    vzLeg([['l','--accent','courbe du fichier choisi'],['lt','--muted','l\'autre courbe'],['a','--accent','aire = AUC'],['d','--muted','classifieur aléatoire']]) + `<p class="viz-out" data-o="out"></p>`;
  const r = rng(21), neg = [], pos = [];
  for (let i = 0; i < 60; i++) neg.push(clamp(0.38 + gauss(r)*0.14, 0.01, 0.99));
  for (let i = 0; i < 40; i++) pos.push(clamp(0.63 + gauss(r)*0.14, 0.01, 0.99));
  const roc = (N, P) => { const ths = [Infinity, ...[...new Set([...N, ...P])].sort((a, b) => b - a), -Infinity];
    const pts = ths.map(t => [N.filter(v => v >= t).length/N.length, P.filter(v => v >= t).length/P.length]);
    let auc = 0; for (let i = 1; i < pts.length; i++) auc += (pts[i][0] - pts[i-1][0])*(pts[i][1] + pts[i-1][1])/2; return {pts, auc}; };
  const scores = roc(neg, pos), labels = roc(neg.map(v => +(v >= 0.5)), pos.map(v => +(v >= 0.5)));
  const mid = labels.pts.find(p => p[0] > 0 && p[0] < 1) || [0, 0];
  const V = vizCanvas(el.querySelector('.viz-stage'), w => Math.min(0.85, 380/w), {label: 'Courbes ROC à partir d\'étiquettes et de probabilités'});
  V.draw = () => {
    const {ctx, W, H} = V, p = vzPal(), lab = $i(el, 'lab').checked, side = Math.min(W - 70, H - 58), ox = (W - side)/2 + 14, oy = 22;
    const S = vzScale(ox, ox + side, oy, oy + side, 0, 1, 0, 1), A = lab ? labels : scores, O = lab ? scores : labels;
    ctx.clearRect(0, 0, W, H);
    ctx.beginPath(); ctx.moveTo(S.X(0), S.Y(0)); A.pts.forEach(q => ctx.lineTo(S.X(q[0]), S.Y(q[1]))); ctx.lineTo(S.X(1), S.Y(0)); ctx.closePath(); ctx.fillStyle = shade(p.accent, 0.12); ctx.fill();
    vzAxes(ctx, S, {xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 0.25, 0.5, 0.75, 1], fx: v => fmt(v, 2), xlab: 'FPR', ylab: 'TPR', fs: 10.5});
    ctx.setLineDash([4, 4]); ctx.strokeStyle = p.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(S.X(0), S.Y(0)); ctx.lineTo(S.X(1), S.Y(1)); ctx.stroke(); ctx.setLineDash([]);
    vzPath(ctx, O.pts.map(q => [S.X(q[0]), S.Y(q[1])]), shade(p.muted, 0.7), 1.5);
    vzPath(ctx, A.pts.map(q => [S.X(q[0]), S.Y(q[1])]), p.accent, 2.6);
    if (lab){ labels.pts.forEach(q => dot(ctx, S.X(q[0]), S.Y(q[1]), 5, 0, p.accent, p.paper)); vzTag(ctx, `(${fmt(mid[0], 2)} ; ${fmt(mid[1], 2)})`, S.X(mid[0]) + 9, S.Y(mid[1]) + 12, 'left', p.ink, 11); }
    vzTag(ctx, 'AUC = ' + fmt(A.auc, 3), S.R - 6, S.B - 14, 'right', p.accent, 12);
    $q(el, 'out').innerHTML = lab
      ? `Étiquettes 0/1 : il n'y a que 3 points, (0,0), (${fmt(mid[0], 2)} ; ${fmt(mid[1], 2)}) et (1,1), donc deux segments. AUC = (TPR + 1 − FPR)/2 = (sensibilité + spécificité)/2 = <b>${fmt(labels.auc, 3)}</b>. En gris, la courbe qu'on aurait avec les probabilités (AUC ${fmt(scores.auc, 3)}).`
      : `Probabilités : une courbe en escalier, un point par seuil. AUC = <b>${fmt(scores.auc, 3)}</b>. En gris, la courbe à deux segments obtenue avec des étiquettes 0/1 (AUC ${fmt(labels.auc, 3)}) : soumettre des scores donne une meilleure AUC.`;
  };
  el.querySelectorAll(`input[name=kg${uid}]`).forEach(i => i.onchange = () => V.req());
  V.fit();
};

/* ---- Astuce du noyau : φ(x) = (x, x²) rend séparables des données 1D ---- */
VIZ.kernel = el => {
  el.innerHTML = vizHead('Astuce du noyau : relever les données', 'En 1D, la classe A est entourée par B : aucun seuil ne les sépare. Relève les points avec φ(x) = (x, x²). Touche deux points pour calculer k(x, x′).') +
    `<div class="viz-ctrl"><label>relèvement t = <b data-o="t">0</b> <input type="range" min="0" max="1" step="0.01" value="0" data-i="t" aria-label="relèvement : points tracés en (x, t·x²)"></label><button class="btn small" data-i="play">Relever ▶</button></div>
     <div class="viz-stage"></div>` + vzLeg([['o','--c1','classe A'],['s','--c2','classe B'],['l','--ink','droite séparatrice dans le plan (x, x²)'],['d','--red','les deux seuils correspondants sur ℝ']]) +
    `<p class="viz-out" data-o="out"></p><p class="viz-out" data-o="k"></p>`;
  const r = rng(13), pts = [];
  [-0.95, -0.6, -0.25, 0.1, 0.4, 0.75].forEach(x => pts.push([x + (r() - 0.5)*0.15, 1]));
  [-2.5, -2.05, -1.6, 1.5, 1.95, 2.45].forEach(x => pts.push([x + (r() - 0.5)*0.2, -1]));
  const svm = vzLinSVM(pts.map(([x]) => [x, x*x]), pts.map(q => q[1]), 100, 2.5, 3000);
  const {w, b} = svm, disc = w[0]*w[0] - 4*w[1]*b, roots = disc >= 0 && Math.abs(w[1]) > 1e-9 ? [(-w[0] - Math.sqrt(disc))/(2*w[1]), (-w[0] + Math.sqrt(disc))/(2*w[1])].sort((u, v) => u - v) : null;
  let t = 0, anim = 0, selA = 2, selB = 9, turn = 0, S = null;
  const V = vizCanvas(el.querySelector('.viz-stage'), w => w < 500 ? 0.85 : 0.48, {tap: true, label: 'Points sur la droite réelle relevés sur la parabole y = x²'});
  V.draw = () => {
    const {ctx, W, H} = V, p = vzPal(), col = p.c, R0 = vzR(W), up = t >= 0.99;
    $q(el, 't').textContent = fmt(t, 2);
    S = vzScale(34, W - 12, 22, H - 34, -3, 3, -0.7, 7.2);
    ctx.clearRect(0, 0, W, H);
    if (up){ ctx.save(); S.clip(ctx); const yl = x => -(b + w[0]*x)/w[1];
      ctx.beginPath(); ctx.moveTo(S.X(-3), S.Y(yl(-3))); ctx.lineTo(S.X(3), S.Y(yl(3))); ctx.lineTo(S.R, S.T); ctx.lineTo(S.L, S.T); ctx.closePath(); ctx.fillStyle = shade(w[1] > 0 ? col[0] : col[1], 0.1); ctx.fill();
      ctx.beginPath(); ctx.moveTo(S.X(-3), S.Y(yl(-3))); ctx.lineTo(S.X(3), S.Y(yl(3))); ctx.lineTo(S.R, S.B); ctx.lineTo(S.L, S.B); ctx.closePath(); ctx.fillStyle = shade(w[1] > 0 ? col[1] : col[0], 0.1); ctx.fill();
      ctx.restore(); }
    vzAxes(ctx, S, {xt: [-3, -2, -1, 0, 1, 2, 3], yt: [0, 2, 4, 6], fx: v => fmt(v, 0), xlab: 'x', ylab: t > 0 ? 'x²' : ''});
    ctx.strokeStyle = p.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(S.L, S.Y(0) + 0.5); ctx.lineTo(S.R, S.Y(0) + 0.5); ctx.stroke();
    if (t > 0.01){ const c = []; for (let x = -3; x <= 3.001; x += 0.05) c.push([S.X(x), S.Y(t*x*x)]); ctx.save(); S.clip(ctx); vzPath(ctx, c, shade(p.muted, 0.6), 1.2, [3, 3]); ctx.restore(); }
    if (up){ ctx.save(); S.clip(ctx); const yl = x => -(b + w[0]*x)/w[1];
      vzPath(ctx, [[S.X(-3), S.Y(yl(-3))], [S.X(3), S.Y(yl(3))]], p.ink, 2.2);
      [1, -1].forEach(v => vzPath(ctx, [[S.X(-3), S.Y(-(b - v + w[0]*-3)/w[1])], [S.X(3), S.Y(-(b - v + w[0]*3)/w[1])]], shade(p.ink, 0.5), 1, [6, 4]));
      if (roots) roots.forEach(x0 => { vzPath(ctx, [[S.X(x0), S.Y(x0*x0)], [S.X(x0), S.Y(0)]], p.red, 1.8, [5, 3]); dot(ctx, S.X(x0), S.Y(x0*x0), 3.5, 0, p.red); });
      ctx.restore();
      if (roots){ const y0 = S.Y(0) + 6; ctx.fillStyle = shade(col[0], 0.5); ctx.fillRect(S.X(roots[0]), y0 - 3, S.X(roots[1]) - S.X(roots[0]), 6);
        ctx.fillStyle = shade(col[1], 0.5); ctx.fillRect(S.L, y0 - 3, S.X(roots[0]) - S.L, 6); ctx.fillRect(S.X(roots[1]), y0 - 3, S.R - S.X(roots[1]), 6);
        roots.forEach(x0 => vzTag(ctx, fmt(x0, 2), S.X(x0), S.Y(0) - 12, 'center', p.red, 11)); } }
    pts.forEach(([x, y], i) => { const px = S.X(x), py = S.Y(t*x*x), sh = y > 0 ? 0 : 1; dot(ctx, px, py, R0 + 0.5, sh, col[sh], p.paper);
      if (i === selA || i === selB){ ring(ctx, px, py, R0 + 5, p.accent, 2.2); vzTag(ctx, i === selA ? 'x' : 'x′', px, py - R0 - 14, 'center', p.accent, 12); } });
    $q(el, 'out').innerHTML = !up ? `Dans ℝ, un classifieur linéaire est un simple seuil (« A si x ≥ s ») : impossible ici, A est au milieu et B des deux côtés. Fais monter t jusqu'à 1 : chaque point x est envoyé en φ(x) = (x, x²).`
      : `Dans le plan (x, x²), une <b>droite</b> sépare A et B : ${fmt(w[0], 2)}·x ${w[1] < 0 ? '−' : '+'} ${fmt(Math.abs(w[1]), 2)}·x² ${b < 0 ? '−' : '+'} ${fmt(Math.abs(b), 2)} = 0 (SVM linéaire sur φ(x)). Revenue dans ℝ, cette frontière est <b>quadratique</b> : ${roots ? `deux seuils x ≈ ${fmt(roots[0], 2)} et x ≈ ${fmt(roots[1], 2)}, A entre les deux.` : ''}`;
    const xa = pts[selA][0], xb = pts[selB][0], k = xa*xb + xa*xa*xb*xb;
    $q(el, 'k').innerHTML = `Noyau associé : k(x, x′) = ⟨φ(x), φ(x′)⟩ = x·x′ + x²·x′². Ici x = ${fmt(xa, 2)}, x′ = ${fmt(xb, 2)} : (${fmt(xa, 2)})·(${fmt(xb, 2)}) + ${fmt(xa*xa, 2)}·${fmt(xb*xb, 2)} = <b>${fmt(k, 3)}</b>. ` +
      `Le SVM dual n'utilise que ces produits scalaires : avec l'<b>astuce du noyau</b>, on calcule k directement à partir de x et x′, sans jamais construire φ (crucial quand φ est en très grande dimension, voire infinie pour le noyau RBF).`;
  };
  const inp = $i(el, 't'), btn = $i(el, 'play');
  const setT = v => { t = v; inp.value = v; btn.textContent = t >= 0.99 ? '◀ Redescendre' : 'Relever ▶'; V.req(); };
  inp.oninput = () => { cancelAnimationFrame(anim); setT(+inp.value); };
  btn.onclick = () => { cancelAnimationFrame(anim); const from = t, to = t >= 0.99 ? 0 : 1, t0 = performance.now();
    const step = now => { if (!vzAlive(V.cv)) return; const u = clamp((now - t0)/1100, 0, 1), e = u < 0.5 ? 2*u*u : 1 - 2*(1 - u)**2; setT(from + (to - from)*e); if (u < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step); };
  V.cv.addEventListener('pointerdown', e => { const [x, y] = V.pos(e); let bi = -1, bd = 26*26; pts.forEach(([px], i) => { const d = (S.X(px) - x)**2 + (S.Y(t*px*px) - y)**2; if (d < bd){ bd = d; bi = i; } });
    if (bi < 0 || bi === selA || bi === selB) return; if (turn++ % 2) selB = bi; else selA = bi; V.req(); });
  V.fit();
};

/* ---- SVM à noyau RBF : effet de γ (et de C) ---- */
VIZ.rbf = el => {
  el.innerHTML = vizHead('SVM à noyau gaussien : effet de γ', 'γ = 1/(2σ²) règle la portée de chaque point. Fais varier γ (et C) et compare les erreurs d\'apprentissage et de test.') +
    `<div class="viz-ctrl"><label>γ = <b data-o="g"></b> <input type="range" min="-1.5" max="2" step="0.25" value="0" data-i="g" aria-label="log10 de gamma"></label>
     <label>C = <b data-o="c"></b> <input type="range" min="-1" max="3" step="0.5" value="1" data-i="c" aria-label="log10 de C"></label></div>
     <div class="viz-stage"></div>` + vzLeg([['o','--c1','classe +1'],['s','--c2','classe −1'],['l','--ink','frontière f(x) = 0'],['d','--muted','f(x) = ±1'],['r','--ink','vecteur de support (α > 0)']]) +
    `<p class="viz-out" data-o="out"></p>`;
  const gen = (r, n, flip) => { const out = []; for (let i = 0; i < n; i++){ const inner = i % 2 === 0, a = 2*Math.PI*r(), rad = inner ? Math.abs(gauss(r))*0.5 : 1.35 + gauss(r)*0.22;
    let y = inner ? 1 : -1; if (r() < flip) y = -y; out.push([rad*Math.cos(a), rad*Math.sin(a)*0.9, y]); } return out; };
  const pts = gen(rng(31), 64, 0.06), test = gen(rng(32), 400, 0.06), n = pts.length, cache = new Map();
  const train = (g, C) => { const key = g + '|' + C; if (cache.has(key)) return cache.get(key);
    const K = new Float64Array(n*n); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) K[i*n + j] = Math.exp(-g*((pts[i][0] - pts[j][0])**2 + (pts[i][1] - pts[j][1])**2)) + 1; // +1 : biais
    const a = new Float64Array(n), f = new Float64Array(n);
    for (let ep = 0; ep < 400; ep++){ let mx = 0;
      for (let i = 0; i < n; i++){ const y = pts[i][2], G = y*f[i] - 1, na = clamp(a[i] - G/K[i*n + i], 0, C), d = na - a[i]; if (!d) continue; if (Math.abs(d) > mx) mx = Math.abs(d); a[i] = na; for (let j = 0; j < n; j++) f[j] += d*y*K[i*n + j]; }
      if (mx < 1e-6) break; }
    const sv = []; for (let i = 0; i < n; i++) if (a[i] > 1e-7) sv.push(i);
    const F = (x, y) => { let s = 0; for (const i of sv) s += a[i]*pts[i][2]*(Math.exp(-g*((pts[i][0] - x)**2 + (pts[i][1] - y)**2)) + 1); return s; };
    const er = set => set.reduce((s, q) => s + ((F(q[0], q[1]) >= 0 ? 1 : -1) !== q[2]), 0)/set.length;
    const res = {a, sv, F, tr: er(pts), te: er(test)}; cache.set(key, res); return res; };
  let img = null, imgKey = '';
  const V = vizCanvas(el.querySelector('.viz-stage'), w => w < 500 ? 0.9 : 0.56, {label: 'Frontière d\'un SVM à noyau gaussien'});
  V.draw = () => {
    const {ctx, W, H} = V, p = vzPal(), col = p.c, lg = +$i(el, 'g').value, lc = +$i(el, 'c').value, g = Math.pow(10, lg), C = Math.pow(10, lc), R0 = vzR(W);
    $q(el, 'g').textContent = fmt(g, g < 1 ? 2 : 1); $q(el, 'c').textContent = fmt(C, C < 1 ? 1 : 0);
    const M = train(g, C), S = vzScale(6, W - 6, 6, H - 6, -2.1, 2.1, -2.1, 2.1, true), st = 5, nx = Math.ceil((S.R - S.L)/st), ny = Math.ceil((S.B - S.T)/st);
    const key = [lg, lc, nx, ny, p.c[0], p.c[1]].join();
    if (key !== imgKey){ const Fg = new Float64Array((nx + 1)*(ny + 1));
      for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) Fg[j*(nx + 1) + i] = M.F(S.ix(S.L + i*st), S.iy(S.T + j*st));
      const c0 = vzRGB(col[0]), c1 = vzRGB(col[1]);
      img = {off: vzField(nx, ny, (i, j) => { const v = (Fg[j*(nx + 1) + i] + Fg[j*(nx + 1) + i + 1] + Fg[(j + 1)*(nx + 1) + i] + Fg[(j + 1)*(nx + 1) + i + 1])/4; return (v >= 0 ? 0 : 2) + (Math.abs(v) < 1 ? 1 : 0); },
        [[...c0, 60], [...c0, 30], [...c1, 60], [...c1, 30]]), z: vzContour(Fg, nx, ny, 0), p1: vzContour(Fg, nx, ny, 1), m1: vzContour(Fg, nx, ny, -1)}; imgKey = key; }
    ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(img.off, S.L, S.T, nx*st, ny*st); ctx.restore();
    const gx = i => S.L + i*st, gy = j => S.T + j*st;
    vzSegs(ctx, img.p1, gx, gy, shade(p.ink, 0.45), 1, [4, 3]); vzSegs(ctx, img.m1, gx, gy, shade(p.ink, 0.45), 1, [4, 3]); vzSegs(ctx, img.z, gx, gy, p.ink, 2.2);
    pts.forEach((q, i) => { const sh = q[2] > 0 ? 0 : 1; dot(ctx, S.X(q[0]), S.Y(q[1]), R0, sh, col[sh], p.paper); if (M.a[i] > 1e-7) ring(ctx, S.X(q[0]), S.Y(q[1]), R0 + 3.5, p.ink, 1.4); });
    vzTag(ctx, `σ = ${fmt(1/Math.sqrt(2*g), 2)}`, S.L + 6, S.T + 12, 'left', p.ink, 11.5);
    $q(el, 'out').innerHTML = `k(x, x′) = exp(−γ‖x − x′‖²) avec γ = ${fmt(g, 2)} (σ = ${fmt(1/Math.sqrt(2*g), 2)}). Vecteurs de support : <b>${M.sv.length}</b>/${n}. Erreur d'apprentissage : <b>${pct(M.tr)}</b> ; erreur sur 400 points de test : <b>${pct(M.te)}</b>. ` +
      (g <= 0.1 ? '<b>γ petit</b> (σ grand) : chaque point influence tout le plan, la frontière est très lisse, presque linéaire → sous-apprentissage (biais ↑).' :
       g >= 10 ? '<b>γ grand</b> (σ petit) : chaque point n\'influence que son voisinage immédiat → « îlots » autour des points, erreur d\'apprentissage faible mais erreur de test qui remonte (variance ↑).' :
       'γ intermédiaire : la frontière suit l\'anneau sans s\'enrouler autour de chaque point. γ et C se choisissent ensemble par validation croisée.');
  };
  ['g', 'c'].forEach(k => $i(el, k).oninput = () => V.req());
  V.fit();
};

/* ---- CAH : dendrogramme, liens et coupe ---- */
VIZ.cah = el => {
  const uid = ++vzUid;
  el.innerHTML = vizHead('CAH : dendrogramme et coupe', 'Choisis le lien et le nombre de clusters (ou touche le dendrogramme à la hauteur où couper).') +
    `<div class="viz-ctrl"><span class="viz-seg" role="radiogroup" aria-label="lien"><label class="chk"><input type="radio" name="lk${uid}" value="single" checked> simple</label><label class="chk"><input type="radio" name="lk${uid}" value="complete"> complet</label><label class="chk"><input type="radio" name="lk${uid}" value="average"> moyen</label><label class="chk"><input type="radio" name="lk${uid}" value="ward"> Ward</label></span>
     <label>clusters k = <b data-o="k">3</b> <input type="range" min="1" max="12" step="1" value="3" data-i="k" aria-label="nombre de clusters"></label></div>
     <div class="viz-stage"></div>` + vzLeg([['l','--c1','fusions sous la coupe (segment qui réalise le lien)'],['d','--ink','prochaine fusion'],['d','--red','hauteur de coupe']]) + `<p class="viz-out" data-o="out"></p>`;
  const pts = [[1, 2], [2, 2.6], [3.1, 3.05], [4.15, 3.35], [5.2, 3.55], [6.25, 3.45], [2.2, 7.6], [2.9, 8.25], [1.75, 8.4], [7.8, 7.4], [8.65, 7.95], [8.35, 6.8]], n = pts.length;
  const dist = (i, j) => Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
  const NAMES = {single: 'simple', complete: 'complet', average: 'moyen', ward: 'de Ward'};
  const DEF = {single: 'D(A, B) = min d(a, b)', complete: 'D(A, B) = max d(a, b)', average: 'D(A, B) = moyenne des d(a, b)', ward: 'D(A, B) = |A||B|/(|A|+|B|)·‖μ_A − μ_B‖² (hausse de I_W)'};
  const cache = {};
  const cah = link => { if (cache[link]) return cache[link];
    let cl = pts.map((p, i) => ({id: i, m: [i]})), merges = [], nid = n;
    const mu = m => [m.reduce((s, i) => s + pts[i][0], 0)/m.length, m.reduce((s, i) => s + pts[i][1], 0)/m.length];
    const D = (A, B) => { if (link === 'ward'){ const a = mu(A), b = mu(B); return {h: A.length*B.length/(A.length + B.length)*((a[0] - b[0])**2 + (a[1] - b[1])**2), seg: [a, b]}; }
      let best = link === 'single' ? Infinity : -Infinity, pr = null, sum = 0;
      A.forEach(i => B.forEach(j => { const d = dist(i, j); sum += d; if ((link === 'single' && d < best) || (link !== 'single' && d > best)){ best = d; pr = [i, j]; } }));
      if (link === 'average'){ const a = mu(A), b = mu(B); return {h: sum/(A.length*B.length), seg: [a, b]}; }
      return {h: best, seg: [pts[pr[0]], pts[pr[1]]]}; };
    while (cl.length > 1){ let bi = 0, bj = 1, bv = null;
      for (let i = 0; i < cl.length; i++) for (let j = i + 1; j < cl.length; j++){ const v = D(cl[i].m, cl[j].m); if (!bv || v.h < bv.h - 1e-12){ bv = v; bi = i; bj = j; } }
      const nw = {id: nid++, m: cl[bi].m.concat(cl[bj].m)}; merges.push({a: cl[bi].id, b: cl[bj].id, h: bv.h, seg: bv.seg, id: nw.id, m: nw.m});
      cl = cl.filter((c, k) => k !== bi && k !== bj); cl.push(nw); }
    const ch = {}; merges.forEach(m => ch[m.id] = m); const order = [];
    (function dfs(id){ if (id < n) order.push(id); else { dfs(ch[id].a); dfs(ch[id].b); } })(merges[merges.length - 1].id);
    return cache[link] = {merges, ch, order}; };
  const link = () => el.querySelector(`input[name=lk${uid}]:checked`).value, inp = $i(el, 'k');
  let Dz = null;
  const V = vizCanvas(el.querySelector('.viz-stage'), w => w >= 640 ? 0.5 : (Math.round(w*0.78) + 230)/w, {tap: true, maxH: 760, label: 'Points et dendrogramme de la CAH'});
  V.draw = () => {
    const {ctx, W, H} = V, p = vzPal(), wide = W >= 640, k = +inp.value, lk = link(), {merges, ch, order} = cah(lk), R0 = vzR(W) + 1;
    $q(el, 'k').textContent = k;
    ctx.clearRect(0, 0, W, H);
    const nApplied = n - k, hs = merges.map(m => m.h), hmax = hs[n - 2];
    const hcut = k >= n ? hs[0]/2 : k <= 1 ? hmax*1.04 : (hs[nApplied - 1] + hs[nApplied])/2;
    // clusters à la coupe (union des fusions appliquées), couleurs dans l'ordre du dendrogramme
    const lab = Array.from({length: n}, (_, i) => i); merges.slice(0, nApplied).forEach(m => { const t = lab[m.m[0]]; m.m.forEach(i => lab[i] = t); });
    const size = {}; lab.forEach(c => size[c] = (size[c] || 0) + 1);
    const cIdx = {}; let nc = 0; order.forEach(i => { if (size[lab[i]] > 1 && cIdx[lab[i]] === undefined) cIdx[lab[i]] = nc++; });
    const colOf = i => size[lab[i]] > 1 ? p.c[cIdx[lab[i]] % 6] : p.c0;
    const S = wide ? vzScale(8, W*0.45, 8, H - 8, 0, 10, 0.8, 9.6, true) : vzScale(8, W - 8, 8, Math.round(W*0.78) - 8, 0, 10, 0.8, 9.6, true);
    merges.slice(0, nApplied).forEach(m => { const [a, b] = m.seg; vzPath(ctx, [[S.X(a[0]), S.Y(a[1])], [S.X(b[0]), S.Y(b[1])]], shade(colOf(m.m[0]), 0.8), 2.2); });
    if (nApplied < n - 1 && nApplied >= 0){ const m = merges[nApplied], [a, b] = m.seg; vzPath(ctx, [[S.X(a[0]), S.Y(a[1])], [S.X(b[0]), S.Y(b[1])]], p.ink, 1.6, [5, 4]);
      vzTag(ctx, 'prochaine : ' + fmt(m.h, 2), (S.X(a[0]) + S.X(b[0]))/2, (S.Y(a[1]) + S.Y(b[1]))/2 - 12, 'center', p.ink, 11); }
    pts.forEach((q, i) => { dot(ctx, S.X(q[0]), S.Y(q[1]), R0, 0, colOf(i), p.paper); txt(ctx, String(i + 1), S.X(q[0]) + R0 + 3, S.Y(q[1]) + R0 + 4, 'left', p.ink, 10.5); });
    // dendrogramme
    Dz = wide ? vzScale(W*0.45 + 46, W - 10, 18, H - 30, 0, n, 0, hmax*1.08) : vzScale(42, W - 10, Math.round(W*0.78) + 22, H - 30, 0, n, 0, hmax*1.08);
    vzAxes(ctx, Dz, {grid: false, xl: false, xt: [], fy: v => fmt(v, v >= 10 ? 0 : 1), ylab: 'hauteur'});
    const pos = {}; order.forEach((i, r) => pos[i] = {x: r + 0.5, h: 0});
    merges.forEach(m => { const A = pos[m.a], B = pos[m.b]; pos[m.id] = {x: (A.x + B.x)/2, h: m.h};
      const on = m.h <= hcut, c = on ? colOf(m.m[0]) : p.muted, lw = on ? 2.2 : 1.4;
      vzPath(ctx, [[Dz.X(A.x), Dz.Y(A.h)], [Dz.X(A.x), Dz.Y(m.h)], [Dz.X(B.x), Dz.Y(m.h)], [Dz.X(B.x), Dz.Y(B.h)]], c, lw); });
    order.forEach((i, r) => txt(ctx, String(i + 1), Dz.X(r + 0.5), Dz.B + 11, 'center', p.ink, 10.5));
    ctx.setLineDash([6, 4]); ctx.strokeStyle = p.red; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(Dz.L, Dz.Y(hcut)); ctx.lineTo(Dz.R, Dz.Y(hcut)); ctx.stroke(); ctx.setLineDash([]);
    vzTag(ctx, `coupe → k = ${k}`, Dz.R - 2, Dz.Y(hcut) - 11, 'right', p.red, 11);
    let gi = 1; for (let i = 2; i < n - 1; i++) if (hs[i] - hs[i-1] > hs[gi] - hs[gi-1]) gi = i;
    const kGap = n - gi;
    $q(el, 'out').innerHTML = `Lien ${NAMES[lk]} : ${DEF[lk]}. À chaque étape on fusionne les deux clusters les plus proches ; la hauteur d'une branche est la distance de fusion. Coupe entre ${fmt(nApplied >= 1 ? hs[nApplied - 1] : 0, 2)} et ${fmt(nApplied < n - 1 ? hs[nApplied] : hmax, 2)} → <b>${k} cluster(s)</b>. ` +
      `Le plus grand saut de hauteur (${fmt(hs[gi - 1], 2)} → ${fmt(hs[gi], 2)}) suggère de couper à k = <b>${kGap}</b>. ` +
      (lk === 'single' ? 'Lien simple : <b>effet de chaîne</b>, la chaîne 1 → 6 fusionne point par point à faible hauteur et reste d\'un seul tenant (compare les hauteurs avec le lien complet).' : lk === 'complete' ? 'Lien complet : la chaîne 1 → 6, très allongée, ne se regroupe qu\'à grande hauteur (sa plus grande distance interne) ; ce lien favorise les clusters compacts : avec k = 4, il coupe la chaîne en deux.' : lk === 'ward' ? 'Ward : chaque fusion augmente l\'inertie intra-classe I_W de la hauteur affichée ; il produit des clusters compacts et équilibrés.' : 'Lien moyen : compromis entre simple et complet.');
  };
  V.cv.addEventListener('pointerdown', e => { const [x, y] = V.pos(e); if (!Dz || !Dz.in(x, y)) return; const h = Dz.iy(y), {merges} = cah(link());
    inp.value = clamp(n - merges.filter(m => m.h <= h).length, 1, n); V.req(); });
  inp.oninput = () => V.req();
  el.querySelectorAll(`input[name=lk${uid}]`).forEach(i => i.onchange = () => V.req());
  V.fit();
};

/* ---- K-moyennes (Lloyd) pas à pas ---- */
VIZ.kmeans = el => {
  el.innerHTML = vizHead('K-moyennes pas à pas (Lloyd)', 'Alterne affectation (Voronoï) et mise à jour des centroïdes ; relance avec une autre initialisation pour voir les minima locaux.') +
    `<div class="viz-ctrl"><label>K = <b data-o="k">3</b> <input type="range" min="2" max="6" step="1" value="3" data-i="k" aria-label="nombre de clusters K"></label>
     <span class="viz-btns"><button class="btn small primary" data-i="step">Étape suivante</button><button class="btn small" data-i="run">Jusqu'à convergence</button><button class="btn small" data-i="init">Nouvelle initialisation</button></span></div>
     <div class="viz-stage" data-s="main"></div>` + vzLeg([['x','--ink','centroïde μₖ'],['a','--c1','cellule de Voronoï (points plus proches de μₖ)'],['l','--muted','déplacement du centroïde']]) +
    `<p class="viz-out" data-o="out"></p><div class="viz-stage" data-s="iw"></div>`;
  const r = rng(41), pts = [];
  [[2.4, 7.2, 16], [7.4, 7.6, 16], [4.6, 2.6, 16], [8.3, 3.2, 10]].forEach(([cx, cy, m]) => { for (let i = 0; i < m; i++) pts.push([clamp(cx + gauss(r)*0.8, 0.2, 9.8), clamp(cy + gauss(r)*0.8, 0.2, 9.8)]); });
  let K = 3, seed = 1, cent = [], prev = null, asg = null, phase = 'affect', iter = 0, conv = false, hist = [], timer = null; const best = {};
  const IW = () => pts.reduce((s, q, i) => s + (q[0] - cent[asg[i]][0])**2 + (q[1] - cent[asg[i]][1])**2, 0);
  const near = q => { let b = 0, bd = Infinity; cent.forEach((c, k) => { const d = (q[0] - c[0])**2 + (q[1] - c[1])**2; if (d < bd){ bd = d; b = k; } }); return b; };
  const reset = () => { stop(); const rr = rng(1000*K + seed), idx = []; while (idx.length < K){ const i = Math.floor(rr()*pts.length); if (!idx.includes(i)) idx.push(i); }
    cent = idx.map(i => pts[i].slice()); prev = null; asg = null; phase = 'affect'; iter = 0; conv = false; hist = []; draw(); };
  const step = () => { if (conv) return;
    if (phase === 'affect'){ const na = pts.map(near), ch = !asg || na.some((v, i) => v !== asg[i]); asg = na; prev = null; iter++;
      if (!ch){ conv = true; const v = IW(); best[K] = Math.min(best[K] ?? Infinity, v); } else { hist.push(['a', IW()]); phase = 'update'; } }
    else { prev = cent.map(c => c.slice()); cent = cent.map((c, k) => { const m = pts.filter((q, i) => asg[i] === k); return m.length ? [m.reduce((s, q) => s + q[0], 0)/m.length, m.reduce((s, q) => s + q[1], 0)/m.length] : c; });
      hist.push(['u', IW()]); phase = 'affect'; }
    draw(); };
  const stop = () => { clearInterval(timer); timer = null; $i(el, 'run').textContent = 'Jusqu\'à convergence'; };
  const V = vizCanvas(el.querySelector('[data-s=main]'), w => w < 500 ? 0.92 : 0.56, {label: 'Points, centroïdes et cellules de Voronoï'});
  V.draw = () => {
    const {ctx, W, H} = V, p = vzPal(), col = p.c, R0 = vzR(W);
    const S = vzScale(6, W - 6, 6, H - 6, 0, 10, 0, 10, true), st = 6, nx = Math.ceil((S.R - S.L)/st), ny = Math.ceil((S.B - S.T)/st);
    ctx.clearRect(0, 0, W, H);
    const tb = col.map(c => [...vzRGB(c), 34]);
    vzBlit(ctx, vzField(nx, ny, (i, j) => near([S.ix(S.L + (i + 0.5)*(S.R - S.L)/nx), S.iy(S.T + (j + 0.5)*(S.B - S.T)/ny)]), tb), S);
    pts.forEach((q, i) => dot(ctx, S.X(q[0]), S.Y(q[1]), R0, 0, asg ? col[asg[i] % 6] : p.c0, p.paper));
    if (prev) prev.forEach((c, k) => { const a = [S.X(c[0]), S.Y(c[1])], b = [S.X(cent[k][0]), S.Y(cent[k][1])]; ring(ctx, a[0], a[1], 6, p.muted, 1.4); vzPath(ctx, [a, b], p.muted, 2);
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 12){ ctx.beginPath(); ctx.moveTo(b[0] - 13*Math.cos(ang - 0.4), b[1] - 13*Math.sin(ang - 0.4)); ctx.lineTo(b[0] - 7*Math.cos(ang), b[1] - 7*Math.sin(ang)); ctx.lineTo(b[0] - 13*Math.cos(ang + 0.4), b[1] - 13*Math.sin(ang + 0.4)); ctx.strokeStyle = p.muted; ctx.stroke(); } });
    cent.forEach((c, k) => { const x = S.X(c[0]), y = S.Y(c[1]); cross(ctx, x, y, 9, p.paper, 6); cross(ctx, x, y, 9, col[k % 6], 3.2); txt(ctx, 'μ' + '₁₂₃₄₅₆'[k], x + 11, y - 11, 'left', p.ink, 12, 'body', '600'); });
    vzTag(ctx, conv ? 'convergé' : `itération ${iter}`, S.L + 6, S.T + 12, 'left', p.ink, 11.5);
  };
  const E = vizCanvas(el.querySelector('[data-s=iw]'), w => w < 500 ? 0.62 : 0.22, {minH: 150, maxH: 200, label: 'Évolution de l\'inertie intra-classe'});
  E.draw = () => {
    const {ctx, W, H} = E, p = vzPal(); ctx.clearRect(0, 0, W, H);
    const n = Math.max(6, hist.length), mx = hist.length ? Math.max(...hist.map(h => h[1]))*1.08 : 100;
    const S = vzScale(48, W - 12, W < 500 ? 42 : 24, H - 32, 0.5, n + 0.5, 0, mx);
    vzAxes(ctx, S, {xt: vzTicks(1, n, Math.min(n, Math.floor((W - 60)/40))).filter(v => v % 1 === 0), fx: v => fmt(v, 0), fy: v => fmt(v, 0), xlab: 'étape', ylab: 'I_W (inertie intra)'});
    if (hist.length){ vzPath(ctx, hist.map((h, i) => [S.X(i + 1), S.Y(h[1])]), p.accent, 2); hist.forEach((h, i) => dot(ctx, S.X(i + 1), S.Y(h[1]), 4, h[0] === 'a' ? 0 : 1, p.accent, p.paper)); }
    if (best[K] !== undefined){ ctx.setLineDash([4, 3]); ctx.strokeStyle = p.good; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(S.L, S.Y(best[K])); ctx.lineTo(S.R, S.Y(best[K])); ctx.stroke(); ctx.setLineDash([]);
      txt(ctx, 'meilleure I_W vue', S.R - 2, S.Y(best[K]) - 8, 'right', p.good, 10.5, 'body', '600'); }
    txt(ctx, '● après affectation  ■ après mise à jour', S.R, 10, 'right', p.muted, 10.5, 'body');
  };
  const draw = () => { $q(el, 'k').textContent = K; V.req(); E.req();
    const o = $q(el, 'out'), v = asg ? fmt(IW(), 1) : '—';
    o.innerHTML = conv ? `<b>Convergence</b> après ${iter} affectations : plus aucun point ne change de cluster. I_W finale = <b>${v}</b>. Meilleure I_W obtenue avec K = ${K} sur les initialisations essayées : ${fmt(best[K], 1)}. ` + (IW() > best[K] + 0.5 ? 'Cette initialisation est tombée dans un <b>minimum local</b> moins bon : c\'est pourquoi on relance plusieurs fois (nstart) et on garde la plus faible I_W.' : 'Relance avec « Nouvelle initialisation » : le résultat peut changer (minimum local).')
      : !asg ? `<b>Initialisation</b> : ${K} centroïdes tirés au hasard parmi les points. Étape suivante : affecter chaque point au centroïde le plus proche.`
      : phase === 'update' ? `<b>Affectation</b> (itération ${iter}) : chaque point rejoint le centroïde le plus proche, d'où les cellules de Voronoï. I_W = <b>${v}</b>. Étape suivante : remplacer chaque centroïde par la moyenne de ses points.`
      : `<b>Mise à jour</b> : chaque centroïde devient la moyenne (barycentre) de son cluster (flèches). I_W = <b>${v}</b> : elle ne peut que baisser à chaque étape, d'où la convergence.`;
  };
  $i(el, 'step').onclick = () => { stop(); step(); };
  $i(el, 'run').onclick = () => { if (timer){ stop(); return; } if (conv) reset(); $i(el, 'run').textContent = 'Pause';
    timer = setInterval(() => { if (!vzAlive(V.cv) || conv){ stop(); return; } step(); }, 550); };
  $i(el, 'init').onclick = () => { seed++; reset(); };
  $i(el, 'k').oninput = e => { K = +e.target.value; reset(); };
  V.fit(); E.fit(); reset();
};

/* ---- Fonctions de coût en fonction de la marge y(⟨w,x⟩+b) : 0/1, logistique, hinge ---- */
VIZ.loss = el => {
  el.innerHTML = vizHead('Trois fonctions de coût', 'Déplace le point : m = y(⟨w,x⟩ + b) est positif si x est bien classé, et grand s\'il est loin de l\'hyperplan.') +
    `<div class="viz-ctrl"><label>m = y(⟨w,x⟩+b) = <b data-o="m"></b> <input type="range" min="-3" max="3" step="0.05" value="-0.5" data-i="m" aria-label="marge m"></label></div><div class="viz-stage"></div>` +
    vzLeg([['l','--c0','coût 0/1 : 1{m < 0}'],['l','--accent','logistique : log(1 + e^(−m))'],['l','--c3','hinge (SVM) : max(0, 1 − m)']]) +
    `<div class="metrics viz-metrics" data-o="v"></div><p class="viz-out" data-o="out"></p>`;
  const F = [m => m < 0 ? 1 : 0, m => Math.log(1 + Math.exp(-m)), m => Math.max(0, 1 - m)];
  const V = vizCanvas(el.querySelector('.viz-stage'), w => w < 500 ? 0.8 : 0.42, {label: 'Coûts 0/1, logistique et hinge en fonction de la marge'});
  V.draw = () => {
    const {ctx, W, H} = V, p = vzPal(), m = +$i(el, 'm').value, col = [p.c0, p.accent, p.c[2]];
    const S = vzScale(38, W - 12, 22, H - 34, -3, 3, 0, 4);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = shade(p.red, 0.07); ctx.fillRect(S.L, S.T, S.X(0) - S.L, S.B - S.T);
    vzAxes(ctx, S, {xt: [-3, -2, -1, 0, 1, 2, 3], yt: [0, 1, 2, 3, 4], fx: v => fmt(v, 0), xlab: 'm = y(⟨w,x⟩+b)', ylab: 'coût'});
    txt(ctx, 'mal classé', S.L + 6, S.T + 10, 'left', p.red, 11, 'body', '600'); txt(ctx, 'bien classé', S.R - 4, S.T + 10, 'right', p.good, 11, 'body', '600');
    ctx.save(); S.clip(ctx);
    vzPath(ctx, [[S.X(-3), S.Y(1)], [S.X(0), S.Y(1)]], col[0], 2.4); vzPath(ctx, [[S.X(0), S.Y(0)], [S.X(3), S.Y(0)]], col[0], 2.4);
    [1, 2].forEach(k => { const c = []; for (let x = -3; x <= 3.0001; x += 0.03) c.push([S.X(x), S.Y(F[k](x))]); vzPath(ctx, c, col[k], 2.4); });
    ctx.restore();
    ctx.setLineDash([4, 3]); ctx.strokeStyle = p.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(S.X(m), S.T); ctx.lineTo(S.X(m), S.B); ctx.stroke(); ctx.setLineDash([]);
    F.forEach((f, k) => { const v = f(m); if (v <= 4) dot(ctx, S.X(m), S.Y(v), 5, 0, col[k], p.paper, 1.5); });
    $q(el, 'm').textContent = fmt(m, 2);
    $q(el, 'v').innerHTML = [['0/1', fmt(F[0](m), 0)], ['logistique', fmt(F[1](m), 3)], ['hinge', fmt(F[2](m), 2)]].map(([k, v]) => `<div class="metric"><span>${k}</span><b>${v}</b></div>`).join('');
    $q(el, 'out').innerHTML = m < 0 ? '<b>Mal classé</b> : les trois coûts pénalisent. Le coût 0/1 vaut 1 quelle que soit la distance ; les coûts logistique et hinge augmentent d\'autant plus que le point est loin du mauvais côté.'
      : m < 1 ? '<b>Bien classé mais proche de l\'hyperplan</b> : le coût 0/1 ne dit rien (0), alors que la logistique et la hinge pénalisent encore un peu. C\'est ce qui éloigne la frontière des points et limite le sur-apprentissage.'
      : '<b>Bien classé et loin de l\'hyperplan</b> : coût 0/1 et hinge nuls (pour la hinge, le point est hors de la marge), coût logistique presque nul mais jamais exactement 0.';
  };
  $i(el, 'm').oninput = () => V.req();
  V.fit();
};

/* ---- Critères d'impureté d'un nœud à deux classes ---- */
VIZ.impurity = el => {
  el.innerHTML = vizHead('Impureté d\'un nœud à deux classes', 'Règle les effectifs des deux classes dans le nœud ; l\'exemple de départ est la racine de l\'arbre du cours, [27, 18].') +
    `<div class="viz-ctrl"><label>classe A : <b data-o="a"></b> <input type="range" min="0" max="45" step="1" value="27" data-i="a" aria-label="effectif de la classe A"></label>
     <label>classe B : <b data-o="b"></b> <input type="range" min="0" max="45" step="1" value="18" data-i="b" aria-label="effectif de la classe B"></label></div><div class="viz-stage"></div>` +
    vzLeg([['l','--c1','Gini : Σ p_k(1 − p_k)'],['l','--c2','entropie : −Σ p_k log₂ p_k'],['l','--c3','erreur : 1 − max p_k']]) +
    `<div class="metrics viz-metrics" data-o="v"></div><p class="viz-out" data-o="out"></p>`;
  const lg = x => x > 0 ? x*Math.log2(x) : 0;
  const F = [q => 2*q*(1 - q), q => -lg(q) - lg(1 - q), q => 1 - Math.max(q, 1 - q)];
  const V = vizCanvas(el.querySelector('.viz-stage'), w => w < 500 ? 0.75 : 0.4, {label: 'Gini, entropie et erreur de classification en fonction de la proportion de la classe A'});
  V.draw = () => {
    const {ctx, W, H} = V, p = vzPal(), col = p.c, a = +$i(el, 'a').value, b = +$i(el, 'b').value, n = a + b, q = n ? a/n : 0.5;
    const S = vzScale(38, W - 12, 22, H - 34, 0, 1, 0, 1.05);
    ctx.clearRect(0, 0, W, H);
    vzAxes(ctx, S, {xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 0.25, 0.5, 0.75, 1], xlab: 'p_A (proportion de A dans le nœud)', ylab: 'impureté'});
    F.forEach((f, k) => { const c = []; for (let x = 0; x <= 1.0001; x += 0.005) c.push([S.X(x), S.Y(f(Math.min(1, x)))]); vzPath(ctx, c, col[k], 2.4); });
    if (n){ ctx.setLineDash([4, 3]); ctx.strokeStyle = p.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(S.X(q), S.T); ctx.lineTo(S.X(q), S.B); ctx.stroke(); ctx.setLineDash([]);
      F.forEach((f, k) => dot(ctx, S.X(q), S.Y(f(q)), 5, 0, col[k], p.paper, 1.5)); }
    $q(el, 'a').textContent = a; $q(el, 'b').textContent = b;
    $q(el, 'v').innerHTML = (n ? [['p_A', fmt(q, 3)], ['Gini', fmt(F[0](q), 3)], ['Entropie', fmt(F[1](q), 3)], ['Erreur', fmt(F[2](q), 3)]] : [['nœud vide', '—']]).map(([k, v]) => `<div class="metric"><span>${k}</span><b>${v}</b></div>`).join('');
    $q(el, 'out').innerHTML = !n ? 'Le nœud est vide.' : (a === 0 || b === 0) ? '<b>Nœud pur</b> : une seule classe, les trois critères valent 0. C\'est une feuille de l\'arbre maximal.'
      : Math.abs(q - 0.5) < 0.02 ? '<b>Mélange maximal</b> (50 % / 50 %) : Gini = 0,5, entropie = 1 bit, erreur = 0,5. Les trois critères sont maximaux.'
      : `Gini = 1 − p_A² − p_B² = 1 − ${fmt(q, 3)}² − ${fmt(1 - q, 3)}² = <b>${fmt(F[0](q), 3)}</b>. Les trois critères sont nuls pour un nœud pur et maximaux à 50 % / 50 % ; Gini et entropie sont strictement concaves, l'erreur est linéaire par morceaux.`;
  };
  ['a', 'b'].forEach(k => $i(el, k).oninput = () => V.req());
  V.fit();
};

function mountViz(root){
  root.querySelectorAll('[data-viz]').forEach(el => { const f = VIZ[el.dataset.viz]; if (f && !el.dataset.ready){ el.dataset.ready = '1'; try{ f(el); }catch(e){ el.textContent = ''; console.error(e); } } });
}


export { mountViz };
