// Petite boîte à outils des emblèmes animés : formes SVG en chaînes, classes d'animation (voir src/emblems.css).
// Convention : le balisage décrit l'IMAGE FINALE ; chaque animation part d'un état initial (keyframe `from`)
// et revient à cet état final. Sans animation (mouvement réduit, carte au repos), on voit donc l'image finale.

export const n = v => +(+v).toFixed(2);

const SEC = new Set(['d', 't', 'ld', 'lt']);
/** Attributs class + style : o = { d: délai, t: durée, x0, y0 (px), r0 ('-30deg'), ox, oy (px), o0, e (easing), ld, lt }. */
export function at(cls, o = {}) {
  let s = '';
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === null) continue;
    const val = typeof v === 'number' ? (SEC.has(k) ? `${n(v)}s` : k === 'o0' ? n(v) : `${n(v)}px`) : v;
    s += `--${k}:${val};`;
  }
  return `class="${cls}"${s ? ` style="${s}"` : ''}`;
}

// ---- géométrie ----
export const seg = (x1, y1, x2, y2) => `M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}`;
export const poly = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${n(p[0])} ${n(p[1])}`).join('');
export const circ = (cx, cy, r) => `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0`;
/** Ellipse (demi-axes a, b, inclinaison phi en degrés) tracée en deux arcs, depuis l'extrémité +a. */
export function ell(cx, cy, a, b, phi = 0) {
  const t = phi * Math.PI / 180, ux = Math.cos(t) * a, uy = Math.sin(t) * a;
  return `M${n(cx + ux)} ${n(cy + uy)}A${n(a)} ${n(b)} ${n(phi)} 1 1 ${n(cx - ux)} ${n(cy - uy)}A${n(a)} ${n(b)} ${n(phi)} 1 1 ${n(cx + ux)} ${n(cy + uy)}`;
}
/** Arc de cercle de l'angle a0 à a1 (degrés, 0 = midi, sens horaire). */
export function arc(cx, cy, r, a0, a1) {
  const P = a => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)];
  const [x0, y0] = P(a0), [x1, y1] = P(a1);
  return `M${n(x0)} ${n(y0)}A${n(r)} ${n(r)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${n(x1)} ${n(y1)}`;
}
/** Pointe de flèche (chevron ouvert) au bout (x, y) d'un segment venant de (fx, fy). */
export function head(fx, fy, x, y, s = 4) {
  const a = Math.atan2(y - fy, x - fx), w = 0.5;
  return `M${n(x - s * Math.cos(a - w))} ${n(y - s * Math.sin(a - w))}L${n(x)} ${n(y)}L${n(x - s * Math.cos(a + w))} ${n(y - s * Math.sin(a + w))}`;
}

// ---- éléments ----
/** Trait qui se dessine (stroke-dashoffset sur pathLength=1). */
export const draw = (d, cls, d0, t, more = {}) => `<path d="${d}" pathLength="1" ${at(`em-l a-draw ${cls}`, { d: d0, t, ...more })}/>`;
/** Trait sans animation propre (ou avec une classe d'animation passée dans cls). */
export const line = (d, cls, o = {}) => `<path d="${d}" ${at(`em-l ${cls}`, o)}/>`;
/** Impulsion qui parcourt un tracé en boucle (en-tête seulement). */
export const travel = (d, cls, o = {}) => `<path d="${d}" pathLength="1" ${at(`em-l l-travel ${cls}`, o)}/>`;
export const dot = (cx, cy, r, cls, o = {}) => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" ${at(cls, o)}/>`;
export const cross = (x, y, s, cls, o = {}) => `<path d="M${n(x - s)} ${n(y - s)}L${n(x + s)} ${n(y + s)}M${n(x - s)} ${n(y + s)}L${n(x + s)} ${n(y - s)}" ${at(`em-l ${cls}`, o)}/>`;
export const rect = (x, y, w, h, cls, o = {}, rx = 0) => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"${rx ? ` rx="${rx}"` : ''} ${at(cls, o)}/>`;
export const text = (x, y, s, cls, o = {}, anchor = 'start') => `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" ${at(`em-t ${cls}`, o)}>${s}</text>`;
export const g = (inner, cls = '', o = {}) => `<g ${at(cls, o)}>${inner}</g>`;

/** Fond commun « cahier » : feuille, quadrillage, marge rouge. */
export function paper(w, h, size) {
  const step = size === 'hero' ? 12 : 8, mx = size === 'hero' ? 18 : 9;
  let grid = '';
  for (let x = mx + step; x < w - 1; x += step) grid += `M${x} 1V${h - 1}`;
  for (let y = step; y < h - 1; y += step) grid += `M1 ${y}H${w - 1}`;
  return `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${size === 'hero' ? 12 : 9}" class="em-sheet"/>` +
    `<path d="${grid}" class="em-grid"/>` +
    `<path d="M${mx} 1V${h - 1}" class="em-margin"/>`;
}

export const VB = { hero: [160, 120], card: [64, 64] };
