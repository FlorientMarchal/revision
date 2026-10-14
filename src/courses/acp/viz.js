// Illustrations interactives du cours d'ACP (SVG, couleurs du thème du site). Tous les calculs sont faits dans le navigateur
// sur de petits jeux de données simulés : ce sont des schémas de révision, pas des sorties de logiciel.

const fmt = (x, d = 2) => Number(x).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const head = (t, hint) => `<figcaption><b>${t}</b>${hint ? `<span>${hint}</span>` : ''}</figcaption>`;
const svg = (w, h, body, label) => `<svg viewBox="0 0 ${w} ${h}" class="vz-svg" role="img" aria-label="${esc(label)}">${body}</svg>`;
const CAT = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)', 'var(--c0)'];

/* ------------------------------------------------------------------ outils numériques */
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(r) { let u = 0, v = 0; while (!u) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

/** Valeurs et vecteurs propres d'une matrice symétrique (méthode de Jacobi), triés par valeur propre décroissante. */
function eig(S) {
  const n = S.length, A = S.map(r => r.slice()), V = S.map((_, i) => S.map((__, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] * A[i][j];
    if (off < 1e-20) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(A[p][q]) < 1e-15) continue;
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
      for (let k = 0; k < n; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
      for (let k = 0; k < n; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; }
    }
  }
  const idx = A.map((_, i) => i).sort((a, b) => A[b][b] - A[a][a]);
  return { vals: idx.map(i => A[i][i]), vecs: idx.map(i => {
    const v = V.map(r => r[i]); const big = v.reduce((m, x) => (Math.abs(x) > Math.abs(m) ? x : m), 0);
    return big < 0 ? v.map(x => -x) : v; // signe fixé : la plus grande coordonnée est positive
  }) };
}

/* Jeu de notes simulé : 80 étudiants, 7 matières, deux facteurs latents (sciences, lettres) et le sport presque indépendant. */
const NOTES = (() => {
  const names = ['Maths', 'Physique', 'Info', 'Français', 'Histoire', 'Anglais', 'Sport'];
  const load = [[0.85, 0.1], [0.8, 0.15], [0.7, 0.0], [0.1, 0.85], [0.15, 0.75], [0.35, 0.6], [0.15, -0.1]];
  const r = rng(7), n = 80, X = [];
  for (let i = 0; i < n; i++) {
    const s = gauss(r), l = gauss(r);
    X.push(load.map(([a, b]) => a * s + b * l + Math.sqrt(Math.max(0.05, 1 - a * a - b * b)) * gauss(r)));
  }
  const p = names.length, m = names.map((_, j) => X.reduce((t, x) => t + x[j], 0) / n);
  const sd = names.map((_, j) => Math.sqrt(X.reduce((t, x) => t + (x[j] - m[j]) ** 2, 0) / n));
  const Z = X.map(x => x.map((v, j) => (v - m[j]) / sd[j]));
  const R = names.map((_, a) => names.map((__, b) => Z.reduce((t, z) => t + z[a] * z[b], 0) / n));
  const E = eig(R);
  return { names, n, p, Z, R, E };
})();

/* ------------------------------------------------------------------ 1. variance projetée */
function projViz(el) {
  const r = rng(11), P = [];
  for (let i = 0; i < 40; i++) { const u = gauss(r), v = gauss(r); P.push([1.6 * u, 0.85 * u + 0.75 * v]); }
  const mx = P.reduce((t, q) => t + q[0], 0) / P.length, my = P.reduce((t, q) => t + q[1], 0) / P.length;
  P.forEach(q => { q[0] -= mx; q[1] -= my; });
  const n = P.length, v11 = P.reduce((t, q) => t + q[0] * q[0], 0) / n, v22 = P.reduce((t, q) => t + q[1] * q[1], 0) / n, v12 = P.reduce((t, q) => t + q[0] * q[1], 0) / n;
  const E = eig([[v11, v12], [v12, v22]]), In = v11 + v22;
  const best = ((Math.atan2(E.vecs[0][1], E.vecs[0][0]) * 180 / Math.PI) + 180) % 180;
  const varAt = t => { const c = Math.cos(t * Math.PI / 180), s = Math.sin(t * Math.PI / 180); return c * c * v11 + 2 * c * s * v12 + s * s * v22; };
  el.innerHTML = head('Chercher l\'axe de variance projetée maximale', 'Fais tourner l\'axe : chaque point est projeté orthogonalement dessus. La variance des projections est var(Ya).') +
    `<div class="viz-ctrl"><label>angle de l'axe = <b data-o="t"></b> <input type="range" min="0" max="179" step="1" value="20" data-i="t" aria-label="angle de l'axe"></label>
     <button type="button" class="btn small" data-i="best">Aller au maximum (a₁)</button></div><div data-s="stage"></div><p class="viz-out" data-o="out"></p>`;
  const inp = el.querySelector('[data-i=t]');
  const draw = () => {
    const t = +inp.value, c = Math.cos(t * Math.PI / 180), s = Math.sin(t * Math.PI / 180), W = 340, k = 52, cx = W / 2, cy = W / 2;
    const X = x => cx + k * x, Y = y => cy - k * y;
    let g = `<line x1="0" y1="${cy}" x2="${W}" y2="${cy}" class="vz-grid"/><line x1="${cx}" y1="0" x2="${cx}" y2="${W}" class="vz-grid"/>`;
    g += `<line x1="${X(-4 * c)}" y1="${Y(-4 * s)}" x2="${X(4 * c)}" y2="${Y(4 * s)}" stroke="var(--accent)" stroke-width="2.5"/>`;
    g += `<line x1="${X(4 * s)}" y1="${Y(-4 * c)}" x2="${X(-4 * s)}" y2="${Y(4 * c)}" stroke="var(--muted)" stroke-width="1.2" stroke-dasharray="5 4"/>`;
    P.forEach(([x, y]) => { const d = x * c + y * s; g += `<line x1="${X(x)}" y1="${Y(y)}" x2="${X(d * c)}" y2="${Y(d * s)}" stroke="var(--muted)" stroke-width="0.8" opacity="0.6"/><circle cx="${X(d * c)}" cy="${Y(d * s)}" r="3" fill="var(--accent)"/><circle cx="${X(x)}" cy="${Y(y)}" r="4" fill="var(--c2)" stroke="var(--paper)"/>`; });
    // courbe var(θ)
    const w2 = 340, h2 = 200, L = 40, R = w2 - 10, T = 16, B = h2 - 30, vmax = E.vals[0] * 1.12;
    const sx = a => L + a / 180 * (R - L), sy = v => B - v / vmax * (B - T);
    let cv = `<path d="M${L},${T}V${B}H${R}" class="vz-axis"/>`;
    cv += `<path d="${Array.from({ length: 181 }, (_, a) => `${a ? 'L' : 'M'}${sx(a).toFixed(1)},${sy(varAt(a)).toFixed(1)}`).join('')}" fill="none" stroke="var(--accent)" stroke-width="2"/>`;
    cv += `<line x1="${sx(best)}" y1="${T}" x2="${sx(best)}" y2="${B}" stroke="var(--good)" stroke-dasharray="4 3"/><text x="${sx(best) + 4}" y="${T + 10}" class="vz-t" fill="var(--good)">max = λ₁</text>`;
    cv += `<circle cx="${sx(t)}" cy="${sy(varAt(t))}" r="5" fill="var(--accent)" stroke="var(--paper)" stroke-width="1.5"/>`;
    [0, 45, 90, 135, 180].forEach(a => { cv += `<text x="${sx(a)}" y="${B + 14}" class="vz-t" text-anchor="middle">${a}°</text>`; });
    cv += `<text x="${L - 4}" y="${sy(E.vals[0])}" class="vz-t" text-anchor="end">λ₁</text><text x="${L - 4}" y="${sy(E.vals[1])}" class="vz-t" text-anchor="end">λ₂</text>`;
    cv += `<line x1="${L}" x2="${R}" y1="${sy(E.vals[0])}" y2="${sy(E.vals[0])}" class="vz-grid"/><line x1="${L}" x2="${R}" y1="${sy(E.vals[1])}" y2="${sy(E.vals[1])}" class="vz-grid"/>`;
    cv += `<text x="${R}" y="${h2 - 4}" class="vz-t" text-anchor="end">angle de l'axe</text><text x="${L}" y="${T - 4}" class="vz-t">var(Ya)</text>`;
    el.querySelector('[data-s=stage]').innerHTML = `<div class="grid2">${svg(W, W, g, 'Nuage de points et axe de projection')}${svg(w2, h2, cv, 'Variance projetée en fonction de l\'angle')}</div>`;
    const v = varAt(t), vo = In - v;
    el.querySelector('[data-o=t]').textContent = t + '°';
    el.querySelector('[data-o=out]').innerHTML = `Variance projetée sur l'axe : <b>${fmt(v)}</b> (${fmt(100 * v / In, 1)} % de l'inertie ${fmt(In)}). Sur l'axe orthogonal (pointillés) : ${fmt(vo)} ; la somme vaut toujours l'inertie. ` +
      (Math.abs(t - best) <= 1 ? `<b>Maximum atteint</b> : l'axe est dirigé par le premier vecteur propre a₁ de V, et la variance projetée vaut λ₁ = ${fmt(E.vals[0])}. L'axe orthogonal porte λ₂ = ${fmt(E.vals[1])}.` : `Le maximum (λ₁ = ${fmt(E.vals[0])}) est atteint à ${fmt(best, 0)}°.`);
  };
  inp.oninput = draw;
  el.querySelector('[data-i=best]').onclick = () => { inp.value = Math.round(best); draw(); };
  draw();
}

/* ------------------------------------------------------------------ 2. éboulis et critères de choix de K */
function eboulisViz(el) {
  const SETS = {
    notes: { label: 'notes simulées (7 matières, ACP normée)', vals: NOTES.E.vals },
    coude: { label: 'un coude net', vals: [4.1, 2.2, 0.9, 0.35, 0.2, 0.12, 0.08, 0.05] },
    lent: { label: 'décroissance régulière', vals: [2.4, 1.9, 1.5, 1.2, 0.9, 0.6, 0.35, 0.15] },
  };
  let cur = 'notes';
  el.innerHTML = head('Éboulis des valeurs propres et choix de K', 'Les critères du cours, avec les formules des diapositives.') +
    `<div class="viz-ctrl"><span class="viz-seg">${Object.entries(SETS).map(([k, s]) => `<button type="button" class="chip" data-set="${k}">${s.label}</button>`).join('')}</span>
     <label>inertie souhaitée = <b data-o="s"></b> <input type="range" min="50" max="95" step="5" value="80" data-i="s" aria-label="pourcentage d'inertie souhaité"></label></div>
     <div data-s="stage"></div><div data-o="tab"></div>`;
  const inp = el.querySelector('[data-i=s]');
  const draw = () => {
    const l = SETS[cur].vals, p = l.length, In = l.reduce((a, b) => a + b, 0), seuil = +inp.value / 100;
    el.querySelectorAll('[data-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.set === cur)));
    let cum = 0, kPct = p; for (let k = 0; k < p; k++) { cum += l[k]; if (cum / In >= seuil - 1e-12) { kPct = k + 1; break; } }
    const kKaiser = l.filter(v => v > In / p).length;
    const L1 = i => l[i - 1];
    let kCorde = 1, bc = -Infinity; for (let i = 1; i <= p; i++) { const v = i * (L1(p) - L1(1)) - L1(i) * (p - 1); if (v > bc) { bc = v; kCorde = i; } }
    let kD2 = 2, bd = -Infinity; for (let i = 2; i <= p - 1; i++) { const v = L1(i + 1) - 2 * L1(i) + L1(i - 1); if (v > bd) { bd = v; kD2 = i; } }
    // règle de la diapositive, restreinte comme dans la méthode d'origine (Raîche et al.) aux λ_k ≥ In/p :
    // telle quelle, la condition est vérifiée par presque toutes les valeurs propres d'un éboulis convexe
    let kOpt = 1; for (let k = 1; k <= p - 2; k++) if (L1(k) >= In / p && L1(k) >= L1(k + 1) - (L1(p) - L1(k + 1)) / (p - k - 1)) kOpt = k;
    const W = 620, H = 230, Lm = 40, R = W - 12, T = 14, B = H - 28, vmax = l[0] * 1.1, bw = (R - Lm) / p;
    const sx = i => Lm + (i - 0.5) * bw, sy = v => B - v / vmax * (B - T);
    let g = `<path d="M${Lm},${T}V${B}H${R}" class="vz-axis"/>`;
    l.forEach((v, i) => { g += `<rect x="${sx(i + 1) - bw * 0.32}" y="${sy(v)}" width="${bw * 0.64}" height="${B - sy(v)}" fill="${i < kPct ? 'var(--accent)' : 'var(--accent-soft)'}" stroke="var(--accent)"/><text x="${sx(i + 1)}" y="${B + 14}" class="vz-t" text-anchor="middle">${i + 1}</text><text x="${sx(i + 1)}" y="${sy(v) - 4}" class="vz-t" text-anchor="middle">${fmt(v)}</text>`; });
    g += `<path d="${l.map((v, i) => `${i ? 'L' : 'M'}${sx(i + 1)},${sy(v)}`).join('')}" fill="none" stroke="var(--ink)" stroke-width="1.5"/>`;
    g += `<line x1="${sx(1)}" y1="${sy(l[0])}" x2="${sx(p)}" y2="${sy(l[p - 1])}" stroke="var(--c3)" stroke-dasharray="5 4"/>`;
    g += `<line x1="${Lm}" x2="${R}" y1="${sy(In / p)}" y2="${sy(In / p)}" stroke="var(--red)" stroke-dasharray="6 4"/><text x="${R}" y="${sy(In / p) - 5}" class="vz-t" text-anchor="end" fill="var(--red)">In / p = ${fmt(In / p)} (Kaiser)</text>`;
    el.querySelector('[data-s=stage]').innerHTML = svg(W, H, g, 'Éboulis des valeurs propres');
    el.querySelector('[data-o=s]').textContent = Math.round(seuil * 100) + ' %';
    const rows = [
      ['Part d\'inertie souhaitée', kPct, `${Math.round(seuil * 100)} % atteints avec ${kPct} composante${kPct > 1 ? 's' : ''} (barres foncées)`],
      ['Critère de Kaiser', kKaiser, `λ_k > In/p = ${fmt(In / p)}`],
      ['Méthode de la corde', kCorde, 'le point le plus éloigné, sous la corde (pointillés) reliant λ₁ à λ_p'],
      ['Dérivée seconde', kD2, 'là où la pente change le plus : max de λ_{i+1} − 2λ_i + λ_{i−1}'],
      ['Coordonnées optimales', kOpt, 'dernier k tel que λ_k ≥ λ_{k+1} − (λ_p − λ_{k+1})/(p − k − 1), parmi les λ_k ≥ In/p (sans cette restriction, absente de la diapo, la règle retient presque tout)'],
    ];
    el.querySelector('[data-o=tab]').innerHTML = `<table class="t"><thead><tr><th>Méthode</th><th>K</th><th>Lecture</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td><b>${r[1]}</b></td><td style="text-align:left">${esc(r[2])}</td></tr>`).join('')}</tbody></table><p class="viz-out">Les méthodes ne sont pas toujours d'accord : c'est normal, il faut les confronter et garder un nombre de composantes <b>interprétables</b>.</p>`;
  };
  el.querySelectorAll('[data-set]').forEach(b => { b.onclick = () => { cur = b.dataset.set; draw(); }; });
  inp.oninput = draw;
  draw();
}

/* ------------------------------------------------------------------ 3. cercle des corrélations (ACP normée) et rotation Varimax */
function circle(C, names, ax, title, hi) {
  const W = 330, c = 158, rad = 128, X = x => c + rad * x, Y = y => c - rad * y;
  let g = `<circle cx="${c}" cy="${c}" r="${rad}" fill="none" stroke="var(--line-strong)"/><line x1="${c - rad - 8}" y1="${c}" x2="${c + rad + 8}" y2="${c}" class="vz-grid"/><line x1="${c}" y1="${c - rad - 8}" x2="${c}" y2="${c + rad + 8}" class="vz-grid"/>`;
  g += `<defs><marker id="vz-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="context-stroke"/></marker></defs>`;
  // étiquettes : au bout de chaque flèche, décalées verticalement si elles se chevauchent
  const labs = C.map((row, j) => { const x = row[ax[0]], y = row[ax[1]], len = Math.hypot(x, y) || 1; return { j, x, y, lx: X(x + 0.1 * x / len), ly: Y(y + 0.1 * y / len) + 4, w: names[j].length * 7.2 }; });
  labs.sort((a, b) => a.ly - b.ly);
  const placed = [];
  labs.forEach(l => {
    const box = q => [q.x >= 0 ? q.lx : q.lx - q.w, q.x >= 0 ? q.lx + q.w : q.lx];
    let guard = 0;
    while (guard++ < 12 && placed.some(q => { const [a1, a2] = box(q), [b1, b2] = box(l); return a1 < b2 && b1 < a2 && Math.abs(q.ly - l.ly) < 14; })) l.ly += 14;
    placed.push(l);
  });
  C.forEach((row, j) => {
    const x = row[ax[0]], y = row[ax[1]], col = CAT[j % CAT.length], len = Math.hypot(x, y);
    g += `<line x1="${c}" y1="${c}" x2="${X(x)}" y2="${Y(y)}" stroke="${col}" stroke-width="${hi === j ? 3.5 : 2.2}" marker-end="url(#vz-ar)" opacity="${len < 0.5 ? 0.55 : 1}"/>`;
  });
  placed.forEach(l => { g += `<text x="${l.lx}" y="${l.ly}" class="vz-t" text-anchor="${l.x >= 0 ? 'start' : 'end'}" fill="${CAT[l.j % CAT.length]}" font-weight="600">${esc(names[l.j])}</text>`; });
  g += `<text x="${c}" y="${W - 4}" class="vz-t" text-anchor="middle">horizontal : ${title[0]} · vertical : ${title[1]}</text>`;
  return svg(W, W, g, 'Cercle des corrélations');
}

function cercleViz(el) {
  const { names, p, E } = NOTES, In = p;
  const C = names.map((_, j) => E.vals.map((l, k) => Math.sqrt(Math.max(l, 0)) * E.vecs[k][j])); // cor(f_k, y_j) = √λ_k a_{j,k}
  const PL = [[0, 1], [0, 2], [1, 2]];
  let plan = 0;
  el.innerHTML = head('Cercle des corrélations (ACP normée des notes simulées)', 'Coordonnées d\'une variable = ses corrélations avec les deux composantes. Choisis le plan.') +
    `<div class="viz-ctrl"><span class="viz-seg">${PL.map((q, i) => `<button type="button" class="chip" data-plan="${i}">F${q[0] + 1} × F${q[1] + 1}</button>`).join('')}</span></div><div data-s="stage"></div>`;
  const draw = () => {
    const ax = PL[plan], pct = k => fmt(100 * E.vals[k] / In, 1);
    el.querySelectorAll('[data-plan]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.plan === plan)));
    const rows = names.map((nm, j) => {
      const q = C[j][ax[0]] ** 2 + C[j][ax[1]] ** 2;
      return `<tr><td style="text-align:left">${nm}</td><td>${fmt(C[j][ax[0]])}</td><td>${fmt(C[j][ax[1]])}</td><td>${fmt(E.vecs[ax[0]][j] ** 2 * 100, 0)} %</td><td>${fmt(E.vecs[ax[1]][j] ** 2 * 100, 0)} %</td><td><b>${fmt(q)}</b></td></tr>`;
    }).join('');
    el.querySelector('[data-s=stage]').innerHTML = `<div class="grid2">${circle(C, names, ax, [`F${ax[0] + 1} (${pct(ax[0])} %)`, `F${ax[1] + 1} (${pct(ax[1])} %)`])}
      <div><table class="t"><thead><tr><th>variable</th><th>cor F${ax[0] + 1}</th><th>cor F${ax[1] + 1}</th><th>contrib. F${ax[0] + 1}</th><th>contrib. F${ax[1] + 1}</th><th>qualité</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="viz-out">Valeurs propres : ${E.vals.map((l, k) => `λ${k + 1} = ${fmt(l)}`).join(' ; ')} (somme = p = ${p}). Contribution = a²<sub>j,k</sub> (somme 100 % par composante). Qualité = somme des cor² sur le plan = longueur² de la flèche : une flèche courte (Sport) est mal représentée, on ne l'interprète pas sur ce plan.</p></div></div>`;
  };
  el.querySelectorAll('[data-plan]').forEach(b => { b.onclick = () => { plan = +b.dataset.plan; draw(); }; });
  draw();
}

function varimaxViz(el) {
  const { names, p, E } = NOTES, K = 2;
  const C = names.map((_, j) => [0, 1].map(k => Math.sqrt(E.vals[k]) * E.vecs[k][j]));
  const h = C.map(r => Math.hypot(r[0], r[1])), L = C.map((r, j) => [r[0] / h[j], r[1] / h[j]]);
  const rot = (M, f) => { const c = Math.cos(f), s = Math.sin(f); return M.map(([a, b]) => [a * c + b * s, -a * s + b * c]); };
  const crit = f => { const Ls = rot(L, f); let v = 0; for (let k = 0; k < K; k++) { const s2 = Ls.reduce((t, r) => t + r[k] ** 2, 0), s4 = Ls.reduce((t, r) => t + r[k] ** 4, 0); v += (p * s4 - s2 * s2) / (p * p); } return v; };
  let bestDeg = 0, bv = -Infinity; for (let d = -90; d <= 0; d += 0.1) { const v = crit(d * Math.PI / 180); if (v > bv) { bv = v; bestDeg = d; } }
  el.innerHTML = head('Rotation Varimax des deux premières composantes', 'Fais tourner les axes : Varimax choisit l\'angle qui maximise la dispersion des L*²<sub>j,k</sub>.') +
    `<div class="viz-ctrl"><label>angle de rotation = <b data-o="t"></b> <input type="range" min="-90" max="0" step="0.5" value="0" data-i="t" aria-label="angle de rotation"></label>
     <button type="button" class="btn small" data-i="best">Rotation Varimax</button><button type="button" class="btn small" data-i="zero">Sans rotation</button></div><div data-s="stage"></div>`;
  const inp = el.querySelector('[data-i=t]');
  const draw = () => {
    const d = +inp.value, f = d * Math.PI / 180, Cs = rot(C, f), lam = [0, 1].map(k => Cs.reduce((t, r) => t + r[k] ** 2, 0));
    const W = 460, H = 200, Lm = 16, R = W - 14, T = 22, B = H - 26, vmin = Math.min(...Array.from({ length: 91 }, (_, i) => crit(-i * Math.PI / 180))), vmax = bv;
    const sx = a => Lm + (a + 90) / 90 * (R - Lm), sy = v => B - (v - vmin) / (vmax - vmin || 1) * (B - T);
    let cv = `<path d="M${Lm},${T}V${B}H${R}" class="vz-axis"/><path d="${Array.from({ length: 181 }, (_, i) => { const a = -90 + i * 0.5; return `${i ? 'L' : 'M'}${sx(a).toFixed(1)},${sy(crit(a * Math.PI / 180)).toFixed(1)}`; }).join('')}" fill="none" stroke="var(--accent)" stroke-width="2"/>`;
    cv += `<line x1="${sx(bestDeg)}" x2="${sx(bestDeg)}" y1="${T}" y2="${B}" stroke="var(--good)" stroke-dasharray="4 3"/><circle cx="${sx(d)}" cy="${sy(crit(f))}" r="5" fill="var(--accent)" stroke="var(--paper)"/>`;
    [-90, -45, 0].forEach(a => { cv += `<text x="${sx(a)}" y="${B + 16}" class="vz-t" text-anchor="${a === -90 ? 'start' : a ? 'middle' : 'end'}">${a}°</text>`; });
    cv += `<text x="${Lm}" y="${T - 8}" class="vz-t">critère Varimax selon l'angle (période 90°)</text>`;
    const rows = names.map((nm, j) => `<tr><td style="text-align:left">${nm}</td><td>${fmt(Cs[j][0])}</td><td>${fmt(Cs[j][1])}</td><td>${fmt(h[j] ** 2)}</td></tr>`).join('');
    el.querySelector('[data-s=stage]').innerHTML = `<div class="grid2">${circle(Cs, names, [0, 1], [d ? 'F1*' : 'F1', d ? 'F2*' : 'F2'])}<div>${svg(W, H, cv, 'Critère Varimax en fonction de l\'angle')}
      <table class="t"><thead><tr><th>variable</th><th>cor ${d ? 'F1*' : 'F1'}</th><th>cor ${d ? 'F2*' : 'F2'}</th><th>h²<sub>j</sub> (qualité)</th></tr></thead><tbody>${rows}</tbody></table></div></div>
      <p class="viz-out">${d ? 'λ*' : 'λ'}₁ = <b>${fmt(lam[0])}</b>, ${d ? 'λ*' : 'λ'}₂ = <b>${fmt(lam[1])}</b> ; somme = ${fmt(lam[0] + lam[1])} : l'inertie du plan est conservée, et la qualité h²<sub>j</sub> de chaque variable ne change pas. ` +
      (Math.abs(d - bestDeg) < 0.6 ? '<b>Rotation Varimax</b> : chaque matière est maintenant liée surtout à une seule composante (sciences d\'un côté, lettres de l\'autre), au prix d\'une inertie mieux répartie entre F1* et F2*.' : `Varimax tourne de ${fmt(bestDeg, 1)}°.`) + '</p>';
    el.querySelector('[data-o=t]').textContent = fmt(d, 1) + '°';
  };
  inp.oninput = draw;
  el.querySelector('[data-i=best]').onclick = () => { inp.value = String(Math.round(bestDeg * 2) / 2); draw(); };
  el.querySelector('[data-i=zero]').onclick = () => { inp.value = '0'; draw(); };
  draw();
}

/* ------------------------------------------------------------------ 4. CLV : hiérarchie de variables autour de composantes latentes */
function clvViz(el) {
  const { names, R } = NOTES, p = names.length;
  const lam1 = idx => (idx.length === 1 ? 1 : eig(idx.map(a => idx.map(b => R[a][b]))).vals[0]); // var de la 1re composante du groupe
  let groups = names.map((_, j) => ({ idx: [j], h: 0, id: j, lam: 1 }));
  const merges = []; let T = 0, nid = p;
  while (groups.length > 1) {
    let best = null;
    for (let a = 0; a < groups.length; a++) for (let b = a + 1; b < groups.length; b++) {
      const u = groups[a].idx.concat(groups[b].idx), lu = lam1(u), loss = groups[a].lam + groups[b].lam - lu;
      if (!best || loss < best.loss) best = { a, b, lu, loss, u };
    }
    T += best.loss;
    const A = groups[best.a], B = groups[best.b], node = { idx: best.u, h: T, id: nid++, lam: best.lu, kids: [A, B], loss: best.loss };
    merges.push(node);
    groups = groups.filter((_, i) => i !== best.a && i !== best.b).concat([node]);
  }
  const root = groups[0];
  // ordre des feuilles
  const order = []; (function walk(g) { if (g.kids) { walk(g.kids[0]); walk(g.kids[1]); } else order.push(g.idx[0]); })(root);
  el.innerHTML = head('CLV : regrouper les variables autour de composantes latentes', 'À chaque étape, on agrège les deux groupes dont la fusion fait perdre le moins d\'inertie (ACP normée des notes simulées).') +
    `<div class="viz-ctrl"><label>nombre de groupes = <b data-o="g"></b> <input type="range" min="1" max="${p}" step="1" value="3" data-i="g" aria-label="nombre de groupes"></label></div><div data-s="stage"></div>`;
  const inp = el.querySelector('[data-i=g]');
  const draw = () => {
    const G = +inp.value, W = 620, H = 250, Lm = 50, Rm = W - 10, Tm = 14, Bm = H - 40, hmax = root.h * 1.05;
    const sx = j => Lm + (order.indexOf(j) + 0.5) * (Rm - Lm) / p, sy = v => Bm - v / hmax * (Bm - Tm);
    const cut = G >= p ? 0 : (merges[p - G - 1].h + (merges[p - G] ? merges[p - G].h : root.h * 1.04)) / 2;
    // groupes à la coupe
    const groupsAt = []; (function walk(g) { if (!g.kids || g.h <= cut) groupsAt.push(g); else { walk(g.kids[0]); walk(g.kids[1]); } })(root);
    const colOf = {}; groupsAt.forEach((g, i) => g.idx.forEach(j => { colOf[j] = CAT[i % CAT.length]; }));
    let s = `<path d="M${Lm},${Tm}V${Bm}" class="vz-axis"/><text x="${Lm - 6}" y="${Tm + 4}" class="vz-t" text-anchor="end">T</text>`;
    const pos = g => (g.kids ? (pos(g.kids[0]) + pos(g.kids[1])) / 2 : sx(g.idx[0]));
    (function walk(g) {
      if (!g.kids) return;
      const [a, b] = g.kids, xa = pos(a), xb = pos(b), y = sy(g.h);
      s += `<path d="M${xa},${sy(a.h)}V${y}H${xb}V${sy(b.h)}" fill="none" stroke="var(--ink)" stroke-width="1.6"/>`;
      walk(a); walk(b);
    })(root);
    if (G < p) s += `<line x1="${Lm}" x2="${Rm}" y1="${sy(cut)}" y2="${sy(cut)}" stroke="var(--red)" stroke-dasharray="6 4"/>`;
    order.forEach(j => { s += `<text x="${sx(j)}" y="${Bm + 16}" class="vz-t" text-anchor="middle" fill="${colOf[j]}" font-weight="600">${names[j]}</text>`; });
    [0, root.h / 2, root.h].forEach(v => { s += `<text x="${Lm - 6}" y="${sy(v) + 4}" class="vz-t" text-anchor="end">${fmt(v)}</text>`; });
    const kept = groupsAt.reduce((t, g) => t + g.lam, 0), lost = p - kept; // départ : p variables réduites, T = 0
    el.querySelector('[data-s=stage]').innerHTML = svg(W, H, s, 'Dendrogramme CLV') +
      `<table class="t"><thead><tr><th>groupe</th><th>variables</th><th>variance de la composante latente</th></tr></thead><tbody>${groupsAt.map((g, i) => `<tr><td style="color:${CAT[i % CAT.length]};font-weight:700">${i + 1}</td><td style="text-align:left">${g.idx.map(j => names[j]).join(', ')}</td><td>${fmt(g.lam)}</td></tr>`).join('')}</tbody></table>
      <p class="viz-out">Avec ${G} groupe${G > 1 ? 's' : ''}, chacun résumé par sa première composante principale : inertie conservée = ${fmt(kept)} sur ${p}, perte T = ${fmt(lost)}. La hauteur d'une fusion est le critère T cumulé : il ne fait qu'augmenter, d'où une hiérarchie.</p>`;
    el.querySelector('[data-o=g]').textContent = G;
  };
  inp.oninput = draw;
  draw();
}

const VIZ = { proj: projViz, eboulis: eboulisViz, cercle: cercleViz, varimax: varimaxViz, clv: clvViz };

export function mountViz(root) {
  root.querySelectorAll('[data-viz]').forEach(el => { const f = VIZ[el.dataset.viz]; if (f && !el.dataset.ready) { el.dataset.ready = '1'; try { f(el); } catch (e) { el.textContent = ''; console.error(e); } } });
}
