// ACP : un nuage de points incliné apparaît, ses axes principaux F1/F2 se tracent, puis le nuage pivote
// jusqu'à s'aligner sur eux (changement de base) ; les projections sur F1 se marquent en rouge.
// Carte : le cercle des corrélations se trace et les variables y poussent comme des flèches.
import { seg, circ, head, draw, line, dot, text, g, at } from './kit.js';

// pseudo-aléatoire déterministe
const rnd = s => () => ((s = (s * 16807) % 2147483647) / 2147483647);

export function hero() {
  const cx = 90, cy = 60, tilt = 30, R = rnd(7);
  const pts = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 21 - .5) * 2, x = a * 46 + (R() - .5) * 8, y = (R() - .5) * 2 * (15 - Math.abs(a) * 8);
    return [cx + x, cy + y];
  });
  const T = (a, l) => [cx + l * Math.cos(a * Math.PI / 180), cy + l * Math.sin(a * Math.PI / 180)];
  let inner = '';
  // axes d'origine (x1, x2), droits au départ, inclinés une fois le nuage tourné
  for (const [a, l, d] of [[tilt, 50, .15], [tilt - 90, 40, .3]]) {
    const [x0, y0] = T(a + 180, l * .55), [x1, y1] = T(a, l);
    inner += draw(seg(x0, y0, x1, y1) + head(x0, y0, x1, y1, 3.5), 's-line em-thin', d, .5);
  }
  inner += draw(seg(cx - 58, cy, cx + 58, cy) + head(cx - 58, cy, cx + 58, cy, 5), 's-acc', 1.05, .55);
  inner += draw(seg(cx, cy + 26, cx, cy - 26) + head(cx, cy + 26, cx, cy - 26, 4), 's-acc em-thin', 1.3, .4);
  pts.forEach(([x, y], i) => { inner += dot(x, y, 2.3, 'f-c1 a-pop', { d: .1 + i * .035, t: .4 }); });
  let out = `<g ${at('a-rot', { d: 1.75, t: 1.1, r0: `${-tilt}deg`, ox: cx, oy: cy, e: 'cubic-bezier(.6,0,.25,1.15)' })}>${inner}</g>`;
  let ticks = '';
  pts.forEach(([x], i) => { if (i % 2 === 0) ticks += line(seg(x, cy - 2.6, x, cy + 2.6), 's-red em-thin a-pop', { d: 2.9 + i * .025, t: .3 }); });
  out += g(ticks, 'l-pulse', { ld: 4, lt: 3.6 });
  out += text(cx + 62, cy + 3, 'F1', 'em-lab a-fade', { d: 2.9, t: .5 });
  out += text(cx + 4, cy - 29, 'F2', 'em-lab a-fade', { d: 3, t: .5 });
  return out;
}

export function card() {
  const cx = 34, cy = 32, r = 21;
  let out = line(seg(cx - r - 3, cy, cx + r + 3, cy) + 'M' + cx + ' ' + (cy - r - 3) + 'V' + (cy + r + 3), 's-line em-thin a-fade', { d: 0, t: .3 });
  out += draw(circ(cx, cy, r), 's-acc', .05, .7, { e: 'cubic-bezier(.5,0,.3,1)' });
  const vars = [[-38, .93, 's-c1'], [-62, .86, 's-c1'], [200, .78, 's-c2'], [68, .58, 's-c3']];
  vars.forEach(([a, l, c], i) => {
    const x = cx + r * l * Math.cos(a * Math.PI / 180), y = cy + r * l * Math.sin(a * Math.PI / 180);
    out += line(seg(cx, cy, x, y) + head(cx, cy, x, y, 4), `${c} a-grow`, { d: .45 + i * .12, t: .45, ox: cx, oy: cy, e: 'cubic-bezier(.3,1.4,.5,1)' });
  });
  return out;
}
