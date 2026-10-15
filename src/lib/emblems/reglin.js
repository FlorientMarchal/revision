// Régression linéaire : les observations tombent sur le repère, la droite des moindres carrés pivote
// autour du point moyen (x̄, ȳ) jusqu'à sa place, puis les résidus se tracent et leurs carrés apparaissent.
import { seg, head, draw, line, dot, rect, g, at } from './kit.js';

function scene({ x0, y0, x1, y1, xs, f, noise, k, r, squares, axes }) {
  const P = xs.map((x, i) => [x, f(x) + noise[i]]);
  const mx = P.reduce((s, p) => s + p[0], 0) / P.length, my = P.reduce((s, p) => s + p[1], 0) / P.length;
  const b = P.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / P.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
  const yh = x => my + b * (x - mx);
  let out = '';
  if (axes) {
    out += draw(seg(x0, y0, x1, y0) + head(x0, y0, x1, y0, 4.5), 's-mut em-thin', 0, .5 * k);
    out += draw(seg(x0, y0, x0, y1) + head(x0, y0, x0, y1, 4.5), 's-mut em-thin', .08 * k, .5 * k);
  } else out += draw(seg(x0, y0, x1, y0), 's-mut em-thin', 0, .4 * k);
  const dl = (.25 + P.length * .09 + .3) * k, dr = dl + .8 * k;
  // carrés des plus grands résidus (moindres CARRÉS)
  if (squares) {
    const big = P.map((p, i) => [Math.abs(p[1] - yh(p[0])), i]).sort((a, c) => c[0] - a[0]).slice(0, squares).map(a => a[1]);
    let sq = '';
    big.forEach((i, j) => {
      const [x, y] = P[i], h = Math.abs(y - yh(x)), side = x + h < x1 - 6 ? 1 : -1;
      sq += rect(side > 0 ? x : x - h, Math.min(y, yh(x)), h, h, 'f-redwash s-red em-l em-hair a-fade', { d: dr + .55 + j * .15, t: .5 });
    });
    out += sq;
  }
  let res = '';
  P.forEach(([x, y], i) => { res += draw(seg(x, y, x, yh(x)), 's-red', dr + i * .06 * k, .3 * k); });
  out += g(res, 'l-pulse', { ld: dr + 2.4, lt: 3.4 });
  const xa = x0 + 3, xb = x1 - 6;
  out += line(seg(xa, yh(xa), xb, yh(xb)), 's-acc a-rot', { d: dl, t: .9 * k, r0: '34deg', o0: 0, ox: mx, oy: my, e: 'cubic-bezier(.3,1.5,.45,1)' });
  P.forEach(([x, y], i) => { out += dot(x, y, r, 'f-c1 a-move', { d: (.2 + i * .09) * k, t: .55 * k, y0: -(y - y1 + 10), o0: 0, e: 'cubic-bezier(.35,1.45,.6,1)' }); });
  out += dot(mx, my, r * .7, 'f-paper s-acc em-l em-thin a-pop', { d: dl + .2, t: .4 * k });
  return out;
}

export const hero = () => scene({
  x0: 30, y0: 106, x1: 150, y1: 14, k: 1, r: 3, squares: 3, axes: true,
  xs: [40, 52, 63, 75, 87, 99, 110, 122, 136], f: x => 94 - .55 * (x - 36), noise: [5, -9, 6, -6, 12, -5, 9, -11, 3],
});
export const card = () => scene({
  x0: 14, y0: 56, x1: 58, y1: 8, k: .75, r: 3, squares: 0, axes: false,
  xs: [19, 27, 36, 44, 53], f: x => 48 - .7 * (x - 16), noise: [3, -6, 5, -5, 3],
});
