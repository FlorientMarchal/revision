// Illustrations interactives des fiches « Visualisation d'informations » (SVG, couleurs du thème du site).
// Ce sont des schémas de révision : aucun de ces codes n'est à utiliser en TP.

const NS = 'http://www.w3.org/2000/svg';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const head = (t, hint) => `<figcaption><b>${t}</b>${hint ? `<span>${hint}</span>` : ''}</figcaption>`;
const seg = (name, items, cur) => `<div class="vz-seg" role="group">${items.map(([v, l]) => `<button type="button" class="chip" data-${name}="${v}" aria-pressed="${v === cur}">${l}</button>`).join('')}</div>`;
const CAT = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c6)', 'var(--c5)'];
const fmt = (x, d = 2) => Number(x).toLocaleString('fr-FR', { maximumFractionDigits: d });

// Palettes ColorBrewer (exemples du cours)
const SEQ = ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'];
const DIV = ['#ca0020', '#f4a582', '#f7f7f7', '#92c5de', '#0571b0'];
const QUAL = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00'];

function svg(w, h, body, label) { return `<svg viewBox="0 0 ${w} ${h}" class="vz-svg" role="img" aria-label="${esc(label || '')}">${body}</svg>`; }
function axes(x0, y0, x1, y1) { return `<path d="M${x0},${y1}V${y0}H${x1}" class="vz-axis"/>`; }

const VIZ = {};

/* ---------- Anscombe ---------- */
VIZ.anscombe = el => {
  const X = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5], X4 = [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8];
  const Y = [[8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68], [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74], [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73], [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89]];
  let show = false;
  const panel = (k) => {
    const xs = k === 3 ? X4 : X, ys = Y[k];
    const sx = x => 26 + (x - 3) / 17 * 150, sy = y => 150 - (y - 2) / 12 * 130;
    const pts = xs.map((x, i) => `<circle cx="${sx(x)}" cy="${sy(ys[i])}" r="4" fill="var(--c${k + 1})"/>`).join('');
    const reg = `<line x1="${sx(3)}" y1="${sy(3 + 0.5 * 3)}" x2="${sx(20)}" y2="${sy(3 + 0.5 * 20)}" class="vz-reg"/>`;
    return `<g>${axes(22, 14, 182, 154)}${show ? pts : ''}${reg}<text x="100" y="172" class="vz-t" text-anchor="middle">jeu ${['I', 'II', 'III', 'IV'][k]}</text></g>`;
  };
  const draw = () => {
    el.innerHTML = head('Quartet d\'Anscombe', 'mêmes statistiques, données différentes') +
      `<div class="vz-stats"><span>moyenne x = 9</span><span>moyenne y = 7,5</span><span>variance x = 10</span><span>variance y ≈ 3,75</span><span>corrélation ≈ 0,816 (diapo : 0,876)</span><span>régression : y = 3 + 0,5 x</span></div>` +
      svg(800, 180, [0, 1, 2, 3].map(k => `<g transform="translate(${k * 200},0)">${panel(k)}</g>`).join(''), 'Quatre nuages de points') +
      `<div class="viz-ctrl"><button type="button" class="btn small" data-a="t">${show ? 'Cacher les points' : 'Afficher les points'}</button><span class="viz-out">${show ? 'Une droite, une courbe, une droite avec une valeur aberrante, un seul x avec un point extrême : la visualisation révèle ce que les statistiques cachent.' : 'Les 4 jeux ont la même droite de régression. À quoi ressemblent-ils ?'}</span></div>`;
    el.querySelector('[data-a=t]').onclick = () => { show = !show; draw(); };
  };
  draw();
};
// Note : la diapositive du cours indique une corrélation de 0,876 ; la valeur de référence du quartet est 0,816.

/* ---------- Notes : liste, triée, boîte à moustaches ---------- */
VIZ.notes = el => {
  const N = [13.36, 4.28, 4.30, 2.28, 8.81, 17.87, 14.42, 19.00, 9.61, 4.19, 0.65, 19.51, 2.50, 5.03, 7.55, 3.79, 7.03, 19.97, 2.54, 9.49, 0.72, 7.81, 0.90, 14.55, 10.71, 8.61, 12.17, 0.24, 11.73, 5.48, 0.26, 9.47, 10.11, 10.61, 13.87, 4.94, 10.58, 3.69, 8.15, 5.12];
  const S = [...N].sort((a, b) => a - b);
  const q = p => { const i = (S.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return S[lo] + (S[hi] - S[lo]) * (i - lo); };
  let mode = 'brut';
  const draw = () => {
    let body = '';
    if (mode === 'boite') {
      const x = v => 30 + v / 20 * 740, Q = [S[0], q(0.25), q(0.5), q(0.75), S[S.length - 1]];
      body = svg(800, 120, `<line x1="${x(Q[0])}" x2="${x(Q[1])}" y1="50" y2="50" class="vz-axis"/><line x1="${x(Q[3])}" x2="${x(Q[4])}" y1="50" y2="50" class="vz-axis"/><rect x="${x(Q[1])}" y="30" width="${x(Q[3]) - x(Q[1])}" height="40" fill="var(--accent-soft)" stroke="var(--accent)"/>` +
        Q.map((v, i) => `<line x1="${x(v)}" x2="${x(v)}" y1="${i === 2 ? 30 : 38}" y2="${i === 2 ? 70 : 62}" stroke="var(--accent)" stroke-width="${i === 2 ? 3 : 2}"/><text x="${x(v)}" y="${i % 2 ? 92 : 104}" class="vz-t" text-anchor="middle">${['min', 'Q1', 'médiane', 'Q3', 'max'][i]} ${fmt(v)}</text>`).join('') +
        `<line x1="30" x2="770" y1="16" y2="16" class="vz-grid"/>${[0, 5, 10, 15, 20].map(v => `<text x="${x(v)}" y="12" class="vz-t" text-anchor="middle">${v}</text>`).join('')}`, 'Boîte à moustaches');
    } else {
      const L = mode === 'brut' ? N : S;
      body = `<div class="vz-notes">${L.map((v, i) => `<span class="${mode === 'trie' && (i === L.length - 1) ? 'hi' : ''}${mode === 'trie' && (i === 19 || i === 20) ? ' mid' : ''}">${fmt(v)}</span>`).join('')}</div>`;
    }
    const msg = { brut: 'Quelle est la note la plus élevée ? Il faut tout parcourir.', trie: 'Triée : le maximum (19,97) est à la fin, la médiane entre la 20ᵉ et la 21ᵉ valeur.', boite: 'La boîte à moustaches donne d\'un coup min, Q1, médiane, Q3 et max… mais on ne voit plus chaque note : c\'est un compromis.' }[mode];
    el.innerHTML = head('40 notes, trois représentations', 'exemple du CM 1') + seg('m', [['brut', 'Liste brute'], ['trie', 'Triée'], ['boite', 'Boîte à moustaches']], mode) + body + `<p class="viz-out">${msg}</p>`;
    el.querySelectorAll('[data-m]').forEach(b => (b.onclick = () => { mode = b.dataset.m; draw(); }));
  };
  draw();
};

/* ---------- Catalogue des graphiques (CM 2) ---------- */
const CHARTS = {
  ts: { n: 'Table surlignée', v: [['abscisses', '1 nominale/ordinale'], ['ordonnées', '1 nominale/ordinale'], ['couleur', '1 quantitative']] },
  bar: { n: 'Barres', v: [['abscisses', '1 nominale/ordinale'], ['ordonnées', '1 quantitative']] },
  stack: { n: 'Barres empilées', v: [['abscisses', '1 nominale/ordinale'], ['ordonnées', '1 quantitative'], ['couleur', '1 nominale']] },
  group: { n: 'Barres côte à côte', v: [['abscisses / couleur', '2 nominales/ordinales'], ['ordonnées', '1 quantitative']] },
  pie: { n: 'Secteurs', v: [['secteurs / couleurs', '1 nominale'], ['taille des secteurs', '1 quantitative']] },
  line: { n: 'Lignes', v: [['abscisses', '1 quantitative (souvent une date)'], ['ordonnées', '1 quantitative'], ['lignes / couleurs', '1 nominale']] },
  area: { n: 'Aires empilées', v: [['abscisses', '1 quantitative (souvent une date)'], ['ordonnées', '1 quantitative'], ['aires / couleurs', '1 nominale']] },
  stream: { n: 'Flots', v: [['abscisses', '1 quantitative (souvent une date)'], ['ordonnées', '1 quantitative'], ['aires / couleurs', '1 nominale']] },
  scatter: { n: 'Nuage de points', v: [['abscisses', '1 quantitative'], ['ordonnées', '1 quantitative']] },
  splom: { n: 'Matrice de nuages', v: [['abscisses et ordonnées', 'n quantitatives (un nuage par paire)']] },
  pc: { n: 'Coordonnées parallèles', v: [['individus', 'des lignes'], ['axes verticaux', 'n quantitatives']] },
  kiviat: { n: 'Kiviat', v: [['individus', 'des lignes'], ['axes circulaires', 'n quantitatives']] },
};
const A = [[3, 5, 2], [4, 2, 3], [2, 4, 4], [5, 3, 2]];
function mini(kind, W = 120, H = 90) {
  const b = [];
  const L = 12, B = H - 10, T = 8, R = W - 6;
  const ax = axes(L, T, R, B);
  if (kind === 'bar') { [5, 8, 4, 6].forEach((v, i) => b.push(`<rect x="${L + 6 + i * 25}" y="${B - v * 9}" width="18" height="${v * 9}" fill="var(--c1)"/>`)); b.push(ax); }
  if (kind === 'stack') { A.forEach((r, i) => { let y = B; r.forEach((v, k) => { y -= v * 6; b.push(`<rect x="${L + 6 + i * 25}" y="${y}" width="18" height="${v * 6}" fill="${CAT[k]}"/>`); }); }); b.push(ax); }
  if (kind === 'group') { A.forEach((r, i) => r.forEach((v, k) => b.push(`<rect x="${L + 4 + i * 26 + k * 7}" y="${B - v * 13}" width="6" height="${v * 13}" fill="${CAT[k]}"/>`))); b.push(ax); }
  if (kind === 'pie') { const v = [5, 3, 2, 2], s = 12; let a0 = -Math.PI / 2; const cx = W / 2, cy = H / 2, r = 36; v.forEach((x, k) => { const a1 = a0 + x / s * 2 * Math.PI; b.push(`<path d="M${cx},${cy}L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)}A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)}Z" fill="${CAT[k]}" stroke="var(--paper)"/>`); a0 = a1; }); }
  if (kind === 'line') { [[2, 4, 3, 6, 5], [5, 3, 4, 2, 3], [1, 2, 2, 3, 6]].forEach((s, k) => b.push(`<polyline points="${s.map((v, i) => `${L + 4 + i * 24},${B - v * 11}`).join(' ')}" fill="none" stroke="${CAT[k]}" stroke-width="2"/>`)); b.push(ax); }
  if (kind === 'area' || kind === 'stream') {
    const S = [[2, 3, 2, 3, 2], [1, 2, 3, 2, 3], [2, 1, 2, 3, 2]], n = 5, x = i => L + 2 + i * ((R - L - 4) / (n - 1));
    const tot = i => S.reduce((s, r) => s + r[i], 0);
    let base = Array.from({ length: n }, (_, i) => kind === 'stream' ? (H / 2) + tot(i) * 4.5 : B);
    S.forEach((r, k) => { const top = base.map((y, i) => y - r[i] * 9); b.push(`<path d="M${top.map((y, i) => `${x(i)},${y}`).join('L')}L${base.map((y, i) => `${x(i)},${y}`).reverse().join('L')}Z" fill="${CAT[k]}"/>`); base = top; });
    if (kind === 'area') b.push(ax);
  }
  if (kind === 'scatter') { [[2, 3], [3, 5], [4, 4], [5, 6], [6, 5], [7, 8], [8, 7], [3, 2], [6, 7]].forEach(([u, v]) => b.push(`<circle cx="${L + u * 12}" cy="${B - v * 9}" r="3" fill="var(--c1)"/>`)); b.push(ax); }
  if (kind === 'splom') { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const x0 = 14 + j * 34, y0 = 4 + i * 28; b.push(`<rect x="${x0}" y="${y0}" width="30" height="24" fill="none" stroke="var(--line-strong)"/>`); if (i !== j) [0, 1, 2, 3, 4].forEach(t => b.push(`<circle cx="${x0 + 4 + t * 5.5}" cy="${y0 + 20 - ((t * (i + 2) + j * 3) % 5) * 4}" r="1.6" fill="var(--c1)"/>`)); } }
  if (kind === 'pc') { const xs = [18, 46, 74, 102]; xs.forEach(x => b.push(`<line x1="${x}" x2="${x}" y1="${T}" y2="${B}" class="vz-axis"/>`)); [[1, 3, 2, 5], [4, 2, 5, 1], [2, 5, 3, 3], [5, 4, 1, 2]].forEach((r, k) => b.push(`<polyline points="${r.map((v, i) => `${xs[i]},${B - v * 13}`).join(' ')}" fill="none" stroke="${CAT[k]}" stroke-width="1.6"/>`)); }
  if (kind === 'kiviat') { const cx = W / 2, cy = H / 2, R0 = 36, n = 5; const p = (i, r) => [cx + r * Math.sin(i / n * 2 * Math.PI), cy - r * Math.cos(i / n * 2 * Math.PI)]; for (let i = 0; i < n; i++) { const [x, y] = p(i, R0); b.push(`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="vz-axis"/>`); } [[0.9, 0.5, 0.7, 0.4, 0.8], [0.4, 0.9, 0.5, 0.8, 0.3]].forEach((r, k) => b.push(`<polygon points="${r.map((v, i) => p(i, v * R0).join(',')).join(' ')}" fill="none" stroke="${CAT[k]}" stroke-width="1.8"/>`)); }
  if (kind === 'ts') { const v = [[1, 3, 5, 2], [4, 2, 1, 5], [2, 5, 3, 4]]; v.forEach((r, i) => r.forEach((x, j) => b.push(`<rect x="${14 + j * 25}" y="${6 + i * 26}" width="24" height="25" fill="${SEQ[x - 1]}"/>`))); }
  return svg(W, H, b.join(''), CHARTS[kind] ? CHARTS[kind].n : kind);
}
VIZ.charts = el => {
  let cur = 'stack';
  const draw = () => {
    const c = CHARTS[cur];
    el.innerHTML = head('Graphiques pour les tables', 'clique pour voir ce que représente chaque variable visuelle') +
      `<div class="vz-gallery">${Object.keys(CHARTS).map(k => `<button type="button" class="vz-thumb" data-k="${k}" aria-pressed="${k === cur}">${mini(k)}<span>${CHARTS[k].n}</span></button>`).join('')}</div>` +
      `<div class="vz-detail"><b>${c.n}</b><ul>${c.v.map(([a, b]) => `<li><span>${a}</span> → ${b}</li>`).join('')}</ul></div>`;
    el.querySelectorAll('[data-k]').forEach(b => (b.onclick = () => { cur = b.dataset.k; draw(); }));
  };
  draw();
};

/* ---------- Aire ou longueur (CM 3, TD exo 4) ---------- */
VIZ.area = el => {
  let r = 2;
  const draw = () => {
    const s = 34, ok = s * Math.sqrt(r), bad = s * r;
    el.innerHTML = head('Aire ou longueur ?', 'b = r × a') +
      `<div class="viz-ctrl"><label>Rapport r = b / a <input type="range" min="1" max="4" step="0.5" value="${r}"><b>${fmt(r, 1)}</b></label></div>` +
      svg(800, 190,
        `<g transform="translate(10,10)"><text x="0" y="12" class="vz-t">Longueur (barres)</text><rect x="0" y="30" width="${60 * 1}" height="22" fill="var(--c1)"/><rect x="0" y="62" width="${60 * r}" height="22" fill="var(--c1)"/><text x="${60 * r + 6}" y="78" class="vz-t">b</text><text x="66" y="46" class="vz-t">a</text></g>` +
        `<g transform="translate(290,10)"><text x="0" y="12" class="vz-t">Aire correcte (côté × √r)</text><rect x="0" y="30" width="${s}" height="${s}" fill="var(--c3)"/><rect x="${s + 16}" y="30" width="${ok}" height="${ok}" fill="var(--c3)"/><text x="0" y="${42 + Math.max(ok, s) + 8}" class="vz-t">côté de b = ${fmt(Math.sqrt(r))} × côté de a</text></g>` +
        `<g transform="translate(560,10)"><text x="0" y="12" class="vz-t">Faux : côté × r</text><rect x="0" y="30" width="${s}" height="${s}" fill="var(--c2)"/><rect x="${s + 16}" y="30" width="${Math.min(bad, 150)}" height="${Math.min(bad, 150)}" fill="var(--c2)" opacity=".85"/><text x="0" y="${42 + Math.min(Math.max(bad, s), 150) + 8 > 186 ? 186 : 42 + Math.min(Math.max(bad, s), 150) + 8}" class="vz-t">aire × ${fmt(r * r, 2)} au lieu de × ${fmt(r, 1)}</text></g>`, 'Comparaison longueur et aire') +
      `<p class="viz-out">Même quand l'aire est correcte, la différence entre a et b paraît plus faible qu'avec les barres : on compare mal des aires.</p>`;
    const inp = el.querySelector('input'); inp.oninput = () => { r = +inp.value; draw(); el.querySelector('input').focus(); };
  };
  draw();
};

/* ---------- Palettes (CM 4) ---------- */
VIZ.palettes = el => {
  let pal = 'seq', vt = 'quant';
  const P = { seq: ['Séquentielle', SEQ, 'luminosité (et/ou saturation)'], div: ['Divergente', DIV, 'deux teintes + luminosité, autour d\'un pivot'], qual: ['Qualitative', QUAL, 'teinte (luminosité et saturation égales)'] };
  const OK = { seq: { nom: 0, ord: 1, quant: 1 }, div: { nom: 0, ord: 0, quant: 1 }, qual: { nom: 1, ord: 0, quant: 0 } };
  const V = { nom: ['Nominale', 'continent'], ord: ['Ordinale', 'mention'], quant: ['Quantitative', 'profit (−, 0, +)'] };
  const grid = [[0, 1, 2, 3, 4], [1, 2, 3, 4, 3], [2, 3, 4, 2, 1], [3, 4, 2, 1, 0]];
  const draw = () => {
    const [n, cols, how] = P[pal], ok = OK[pal][vt];
    el.innerHTML = head('Quelle palette pour quelle variable ?', '') +
      seg('p', [['seq', 'Séquentielle'], ['div', 'Divergente'], ['qual', 'Qualitative']], pal) + seg('v', [['nom', 'Nominale'], ['ord', 'Ordinale'], ['quant', 'Quantitative']], vt) +
      svg(800, 130, cols.map((c, i) => `<rect x="${10 + i * 44}" y="10" width="40" height="40" fill="${c}" stroke="var(--line)"/>`).join('') +
        `<text x="10" y="74" class="vz-t">${n} : on fait varier la ${how}</text>` +
        grid.map((r, i) => r.map((k, j) => `<rect x="${420 + j * 54}" y="${8 + i * 28}" width="52" height="26" fill="${cols[k]}"/>`).join('')).join(''), 'Palette et carte') +
      `<p class="viz-out"><span class="vz-badge ${ok ? 'yes' : 'no'}">${ok ? 'Adaptée' : 'Inadaptée'}</span> ${n} pour une variable ${V[vt][0].toLowerCase()} (${V[vt][1]}). ${ok ? '' : pal === 'qual' ? 'Les teintes n\'ont pas d\'ordre : on ne voit pas qui est plus grand.' : pal === 'div' && vt === 'ord' ? 'Pas de valeur pivot pour une ordinale.' : pal === 'div' ? 'Une divergente suggère un ordre et un pivot qu\'une nominale n\'a pas.' : 'Des luminosités différentes suggèrent un ordre qui n\'existe pas.'}</p>`;
    el.querySelectorAll('[data-p]').forEach(b => (b.onclick = () => { pal = b.dataset.p; draw(); }));
    el.querySelectorAll('[data-v]').forEach(b => (b.onclick = () => { vt = b.dataset.v; draw(); }));
  };
  draw();
};

/* ---------- RVB et TSL ---------- */
VIZ.color = el => {
  let m = 'rgb', c = [255, 0, 255], h = [300, 100, 50];
  const draw = () => {
    const col = m === 'rgb' ? `rgb(${c.join(',')})` : `hsl(${h[0]},${h[1]}%,${h[2]}%)`;
    const ctl = m === 'rgb'
      ? ['Rouge', 'Vert', 'Bleu'].map((l, i) => `<label>${l} <input type="range" min="0" max="255" value="${c[i]}" data-i="${i}"><b>${c[i]}</b></label>`).join('')
      : [['Teinte', 360], ['Saturation', 100], ['Luminosité', 100]].map(([l, mx], i) => `<label>${l} <input type="range" min="0" max="${mx}" value="${h[i]}" data-i="${i}"><b>${h[i]}${i ? ' %' : '°'}</b></label>`).join('');
    const strip = m === 'rgb' ? '' : `<div class="vz-strips">${[0, 1, 2].map(k => `<div><span>${['Teinte → nominale', 'Saturation → ordonnée', 'Luminosité → ordonnée'][k]}</span><div class="vz-strip">${[0, 1, 2, 3, 4, 5].map(t => { const v = [...h]; v[k] = k === 0 ? t * 60 : 10 + t * 16; return `<i style="background:hsl(${v[0]},${v[1]}%,${v[2]}%)"></i>`; }).join('')}</div></div>`).join('')}</div>`;
    el.innerHTML = head('Modèles colorimétriques', m === 'rgb' ? 'essaie 0,255,0 · 0,128,0 · 255,0,255 · 0,0,0 · 255,255,255 · 128,128,128' : 'chaque composante a son usage') +
      seg('mm', [['rgb', 'Rouge Vert Bleu'], ['hsl', 'Teinte Saturation Luminosité']], m) +
      `<div class="vz-color"><div class="vz-swatch" style="background:${col}"></div><div class="viz-ctrl">${ctl}</div></div>${strip}`;
    el.querySelectorAll('[data-mm]').forEach(b => (b.onclick = () => { m = b.dataset.mm; draw(); }));
    el.querySelectorAll('input[data-i]').forEach(inp => (inp.oninput = () => { (m === 'rgb' ? c : h)[+inp.dataset.i] = +inp.value; draw(); el.querySelector(`input[data-i="${inp.dataset.i}"]`).focus(); }));
  };
  draw();
};

/* ---------- Classement d'efficacité ---------- */
VIZ.ranking = el => {
  const R = {
    nom: [['Couleur, palette qualitative', ''], ['Forme', ''], ['Position', 'avec ordre conventionnel ou calculé']],
    ord: [['Position 1D ou 2D', ''], ['Taille 1D', 'si les données s\'y prêtent (tailles d\'habits : ok ; mention : pas ok)'], ['Taille 2D', 'idem'], ['Position 3D', ''], ['Couleur, palette séquentielle', ''], ['Taille 3D', 'si les données s\'y prêtent']],
    quant: [['Position 1D ou 2D', ''], ['Taille 1D', ''], ['Taille 2D', ''], ['Position 3D', ''], ['Couleur, palette séquentielle ou divergente', 'divergente : si valeur « pivot »'], ['Taille 3D', '']],
  };
  let t = 'quant';
  const draw = () => {
    el.innerHTML = head('Efficacité des variables visuelles', 'du plus au moins efficace') + seg('t', [['nom', 'Nominale'], ['ord', 'Ordinale'], ['quant', 'Quantitative']], t) +
      `<ol class="vz-rank">${R[t].map(([a, b], i) => `<li style="--w:${100 - i * 13}%"><b>${a}</b>${b ? `<span>${b}</span>` : ''}</li>`).join('')}</ol>`;
    el.querySelectorAll('[data-t]').forEach(b => (b.onclick = () => { t = b.dataset.t; draw(); }));
  };
  draw();
};

/* ---------- Séparabilité ---------- */
VIZ.separability = el => {
  const pts = [[30, 30, 1, 0], [90, 60, 0, 1], [60, 100, 1, 1], [130, 40, 0, 0], [150, 110, 1, 0], [110, 90, 0, 1], [40, 120, 0, 0], [140, 80, 1, 1]];
  const box = (t, inner, x) => `<g transform="translate(${x},10)"><rect width="180" height="140" fill="none" stroke="var(--line-strong)"/>${inner}<text x="90" y="162" text-anchor="middle" class="vz-t">${t}</text></g>`;
  const wh = pts.map(([x, y, a, b]) => `<ellipse cx="${x + 10}" cy="${y}" rx="${a ? 14 : 5}" ry="${b ? 14 : 5}" fill="var(--c1)"/>`).join('');
  const sh = pts.map(([x, y, a, b]) => `<circle cx="${x + 10}" cy="${y}" r="${a ? 12 : 5}" fill="${b ? 'var(--c6)' : 'var(--c1)'}"/>`).join('');
  const ph = pts.map(([x, y, a, b]) => `<circle cx="${a ? 40 + (y % 30) : 130 + (x % 25)}" cy="${y}" r="6" fill="${b ? 'var(--c2)' : 'var(--c1)'}"/>`).join('');
  el.innerHTML = head('Séparabilité', 'peut-on lire chaque variable séparément ?') +
    svg(800, 175, box('largeur + hauteur : faible', wh, 20) + box('taille + teinte : moyenne', sh, 310) + box('position + teinte : forte', ph, 600), 'Trois exemples de séparabilité');
};

/* ---------- Repère SVG ---------- */
VIZ.svgframe = el => {
  let x = 100, y = 100;
  const draw = () => {
    el.innerHTML = head('Le repère SVG', 'l\'origine est en haut à gauche, y descend') +
      `<div class="viz-ctrl"><label>cx <input type="range" min="20" max="280" value="${x}" data-k="x"><b>${x}</b></label><label>cy <input type="range" min="20" max="180" value="${y}" data-k="y"><b>${y}</b></label></div>` +
      svg(800, 210, `<g transform="translate(20,10)"><rect width="300" height="200" fill="none" stroke="var(--line-strong)"/><path d="M0,0H60M0,0V60" stroke="var(--red)" stroke-width="2" marker-end=""/><text x="64" y="12" class="vz-t">x</text><text x="6" y="74" class="vz-t">y</text><text x="4" y="-2" class="vz-t">(0,0)</text><line x1="${x}" y1="0" x2="${x}" y2="${y}" class="vz-grid"/><line x1="0" y1="${y}" x2="${x}" y2="${y}" class="vz-grid"/><circle cx="${x}" cy="${y}" r="16" fill="var(--c4)" stroke="var(--c2)" stroke-width="2"/></g>` +
        `<g transform="translate(360,30)"><text class="vz-t" y="0">Barre de hauteur h posée sur la ligne y₀ = 160 :</text><line x1="0" x2="300" y1="160" y2="160" class="vz-axis"/><rect x="40" y="${160 - (y - 20) * 0.8}" width="50" height="${(y - 20) * 0.8}" fill="var(--c1)"/><text x="100" y="${170 - (y - 20) * 0.4}" class="vz-t">h = ${fmt((y - 20) * 0.8, 0)} → y = 160 − h = ${fmt(160 - (y - 20) * 0.8, 0)}</text></g>`, 'Repère SVG');
    el.querySelectorAll('input').forEach(inp => (inp.oninput = () => { if (inp.dataset.k === 'x') x = +inp.value; else y = +inp.value; draw(); el.querySelector(`input[data-k="${inp.dataset.k}"]`).focus(); }));
  };
  draw();
};

/* ---------- Échelles (domain → range) ---------- */
VIZ.scales = el => {
  let kind = 'lin', v = 2, r0 = 0, r1 = 1000;
  const draw = () => {
    const X = t => 40 + t * 720;
    let body, out;
    if (kind === 'lin') {
      const y = r0 + (v - 0) / 10 * (r1 - r0);
      body = `<line x1="${X(0)}" x2="${X(1)}" y1="40" y2="40" class="vz-axis"/><line x1="${X(0)}" x2="${X(1)}" y1="120" y2="120" class="vz-axis"/><text x="${X(0)}" y="28" class="vz-t">domain [0,10]</text><text x="${X(0)}" y="148" class="vz-t">range [${r0},${r1}]</text>` +
        `<line x1="${X(v / 10)}" y1="40" x2="${X(v / 10)}" y2="120" stroke="var(--accent)" stroke-width="2"/><circle cx="${X(v / 10)}" cy="40" r="5" fill="var(--accent)"/><circle cx="${X(v / 10)}" cy="120" r="5" fill="var(--accent)"/><text x="${X(v / 10) + 8}" y="84" class="vz-t">${fmt(v)} → ${fmt(y)}</text>`;
      out = `Échelle linéaire : scale(${fmt(v)}) = ${fmt(y)}.`;
    } else {
      const D = ['A', 'B', 'C', 'D', 'E'], bw = 1000 / D.length;
      body = `<line x1="${X(0)}" x2="${X(1)}" y1="120" y2="120" class="vz-axis"/><text x="${X(0)}" y="148" class="vz-t">range [0,1000] · bandwidth = ${bw}</text>` +
        D.map((d, i) => `<rect x="${X(i / 5) + 2}" y="70" width="${720 / 5 - 4}" height="40" fill="${i === Math.round(v / 2.5) ? 'var(--accent-soft)' : 'var(--paper-2)'}" stroke="var(--line)"/><text x="${X(i / 5) + 8}" y="94" class="vz-t">${d} → ${i * bw}</text><line x1="${X(i / 5)}" x2="${X(i / 5)}" y1="110" y2="126" stroke="var(--accent)" stroke-width="2"/>`).join('');
      out = 'scaleBand : chaque valeur du domaine reçoit le début de sa bande ; la largeur d\'une bande est bandwidth().';
    }
    el.innerHTML = head('Une échelle D3 transforme le domain en range', '') + seg('s', [['lin', 'scaleLinear'], ['band', 'scaleBand']], kind) +
      (kind === 'lin' ? `<div class="viz-ctrl"><label>valeur <input type="range" min="0" max="10" step="0.5" value="${v}" data-k="v"><b>${fmt(v)}</b></label><label>range de départ <input type="range" min="0" max="500" step="100" value="${r0}" data-k="r0"><b>${r0}</b></label></div>` : '') +
      svg(800, 160, body, 'Échelle') + `<p class="viz-out">${out}</p>`;
    el.querySelectorAll('[data-s]').forEach(b => (b.onclick = () => { kind = b.dataset.s; draw(); }));
    el.querySelectorAll('input').forEach(inp => (inp.oninput = () => { if (inp.dataset.k === 'v') v = +inp.value; else { r0 = +inp.value; r1 = r0 + 1000; } draw(); el.querySelector(`input[data-k="${inp.dataset.k}"]`).focus(); }));
  };
  draw();
};

/* ---------- TD exercice 4 : la figure a, b.1, b.2 ---------- */
VIZ.tdsquares = el => {
  const g = 34, grid = [];
  for (let i = 0; i <= 9; i++) grid.push(`<line x1="${i * g}" y1="0" x2="${i * g}" y2="${9 * g}" class="vz-grid"/><line x1="0" y1="${i * g}" x2="${9 * g}" y2="${i * g}" class="vz-grid"/>`);
  const s2 = g * Math.SQRT2;
  el.innerHTML = head('Figure de l\'exercice 4', 'redessinée') + svg(800, 9 * g + 10,
    `<g transform="translate(200,5)">${grid.join('')}<rect x="${g}" y="${4 * g}" width="${g}" height="${g}" fill="#ff5e5e"/><text x="${g + 10}" y="${4 * g - 6}" class="vz-t">a</text>` +
    `<rect x="${6 * g}" y="${g}" width="${2 * g}" height="${2 * g}" fill="#ff5e5e"/><text x="${8 * g + 6}" y="${g + 14}" class="vz-t">b.1</text>` +
    `<rect x="${6 * g}" y="${6.5 * g}" width="${s2}" height="${s2}" fill="#ff5e5e"/><text x="${6 * g + s2 + 6}" y="${6.5 * g + 14}" class="vz-t">b.2</text></g>`, 'Carrés a, b.1 et b.2');
};

/* ---------- TD exercice 5 : un dessin par graphique ---------- */
VIZ.tdcharts = el => {
  const types = ['NOM', 'VERBE', 'ADJ.'], ages = ['2 ans', '3 ans', '4 ans', '5 ans'];
  const D = [[20, 45, 70, 90], [8, 30, 55, 80], [3, 12, 30, 50]];
  const W = 250, H = 170, L = 30, B = 140, T = 10, R = 240;
  const sy = v => B - v / 220 * (B - T);
  const leg = types.map((t, k) => `<rect x="${L + k * 66}" y="${H - 12}" width="10" height="10" fill="${CAT[k]}"/><text x="${L + 14 + k * 66}" y="${H - 3}" class="vz-t vz-s">${t}</text>`).join('');
  const xl = ages.map((a, i) => `<text x="${L + 16 + i * 52}" y="${B + 12}" class="vz-t vz-s" text-anchor="middle">${a}</text>`).join('');
  const stack = ages.map((_, i) => { let y = B; return types.map((_, k) => { const h = (B - sy(D[k][i])) * 0.95; y -= h; return `<rect x="${L + 4 + i * 52}" y="${y}" width="24" height="${h}" fill="${CAT[k]}"/>`; }).join(''); }).join('');
  const group = ages.map((_, i) => types.map((_, k) => `<rect x="${L + 2 + i * 52 + k * 10}" y="${sy(D[k][i] * 2)}" width="9" height="${B - sy(D[k][i] * 2)}" fill="${CAT[k]}"/>`).join('')).join('');
  const lines = types.map((_, k) => `<polyline points="${ages.map((_, i) => `${L + 16 + i * 52},${sy(D[k][i] * 2)}`).join(' ')}" fill="none" stroke="${CAT[k]}" stroke-width="2.5"/>`).join('');
  let base = ages.map(() => B);
  const areas = types.map((_, k) => { const top = base.map((y, i) => y - (B - sy(D[k][i])) * 0.95); const p = `<path d="M${top.map((y, i) => `${L + 16 + i * 52},${y}`).join('L')}L${base.map((y, i) => `${L + 16 + i * 52},${y}`).reverse().join('L')}Z" fill="${CAT[k]}"/>`; base = top; return p; }).join('');
  const table = types.map((t, k) => `<text x="${L - 2}" y="${T + 22 + k * 38}" class="vz-t vz-s" text-anchor="end">${t}</text>` + ages.map((_, i) => `<rect x="${L + 4 + i * 52}" y="${T + 6 + k * 38}" width="50" height="36" fill="${SEQ[Math.min(4, Math.floor(D[k][i] / 20))]}"/>`).join('')).join('');
  const ax = axes(L, T, R, B);
  const card = (t, body, withLeg = true) => `<div class="vz-card"><b>${t}</b>${svg(W, H, body + (withLeg ? leg : ''), t)}</div>`;
  el.innerHTML = head('Exercice 5 : un dessin par graphique', 'données fictives : TYPE, AGE, NOMBRE') +
    `<div class="vz-cards">${card('Barres empilées', stack + ax + xl)}${card('Barres côte à côte', group + ax + xl)}${card('Lignes', lines + ax + xl)}${card('Aires empilées', areas + ax + xl)}${card('Table surlignée', table + xl.replaceAll(`y="${B + 12}"`, `y="${T + 130}"`), false)}</div>`;
};

export function mountViz(root) {
  root.querySelectorAll('[data-viz]').forEach(el => {
    const f = VIZ[el.dataset.viz];
    if (f && !el.dataset.ready) { el.dataset.ready = '1'; try { f(el); } catch (e) { el.textContent = ''; console.error(e); } }
  });
}
