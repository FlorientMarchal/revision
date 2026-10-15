// Visualisation : les barres poussent, une courbe relie leurs sommets (le diagramme devient une courbe),
// puis un anneau (camembert) se dessine secteur par secteur ; une impulsion parcourt la courbe en boucle.
import { seg, poly, arc, head, draw, line, rect, dot, travel, g } from './kit.js';

function scene({ x0, y0, w, gap, hs, k, pie, ax }) {
  let out = draw(seg(x0 - 4, y0, x0 + hs.length * (w + gap) + 2, y0), 's-mut em-thin', 0, .4 * k);
  if (ax) out += draw(seg(x0 - 4, y0, x0 - 4, y0 - ax) + head(x0 - 4, y0, x0 - 4, y0 - ax, 4), 's-mut em-thin', .05, .45);
  const tops = [];
  hs.forEach((h, i) => {
    const x = x0 + i * (w + gap);
    tops.push([x + w / 2, y0 - h]);
    out += rect(x, y0 - h, w, h, 'f-soft s-acc em-l em-thin a-gy', { d: (.15 + i * .1) * k, t: .55 * k, e: 'cubic-bezier(.3,1.3,.5,1)' }, 1.5);
  });
  const d1 = (.25 + hs.length * .1 + .25) * k;
  out += draw(poly(tops), 's-red', d1, .8 * k, { e: 'cubic-bezier(.5,.1,.4,1)' });
  out += travel(poly(tops), 's-warn em-thick', { ld: 3.6, lt: 3.2 });
  tops.forEach((p, i) => { out += dot(p[0], p[1], pie ? 2.6 : 2.4, 'f-paper s-red em-l em-thin a-pop', { d: d1 + (.12 + i * .13) * k, t: .4 * k }); });
  if (pie) {
    const [cx, cy, r] = pie, parts = [[0, 150, 's-c1'], [150, 250, 's-c3'], [250, 360, 's-c4']];
    let ring = '';
    parts.forEach(([a0, a1, c], i) => { ring += draw(arc(cx, cy, r, a0 + 5, a1 - 5), `${c} em-ring`, d1 + .9 + i * .28, .45, { e: 'cubic-bezier(.4,0,.3,1)' }); });
    out += g(g(ring, 'l-spin', { ld: 3.4, lt: 30 }), '');
  }
  return out;
}

export const hero = () => scene({ x0: 36, y0: 104, w: 11, gap: 6, hs: [28, 50, 38, 66, 56], k: 1, pie: [134, 30, 12], ax: 84 });
export const card = () => scene({ x0: 17, y0: 54, w: 7, gap: 4, hs: [14, 26, 20, 36], k: .75 });
