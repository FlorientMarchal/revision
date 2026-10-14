// Optimisation & régularisation : les lignes de niveau d'une perte se tracent, une bille descend le gradient
// en zigzag (problème mal conditionné) jusqu'au minimum ; en encart, les boules L1 (losange) et L2 (cercle).
import { seg, circ, ell, poly, head, draw, line, dot, cross, g, at } from './kit.js';

function descent({ M, phi, a, b, scales, start, steps, k, r, d0, dt }) {
  const t = phi * Math.PI / 180, e1 = [Math.cos(t), Math.sin(t)], e2 = [-Math.sin(t), Math.cos(t)];
  const W = ([u, v]) => [M[0] + u * e1[0] + v * e2[0], M[1] + u * e1[1] + v * e2[1]];
  let out = '';
  scales.forEach((s, i) => { out += draw(ell(M[0], M[1], a * s, b * s, phi), i ? 's-acc em-thin' : 's-acc em-thin', (.05 + i * .2) * k, .7 * k, { e: 'cubic-bezier(.45,0,.3,1)' }); });
  out += cross(M[0], M[1], 2.2, 's-acc em-thin a-pop', { d: (.1 + scales.length * .2) * k, t: .4 * k });
  // descente de gradient : u *= 1 - 2η/a², v *= 1 - 2η/b²  (η choisi pour que v oscille)
  const eta = .8 * b * b, fu = 1 - 2 * eta / (a * a), fv = 1 - 2 * eta / (b * b);
  const L = [start];
  for (let i = 0; i < steps; i++) { const [u, v] = L[L.length - 1]; L.push([u * fu, v * fv]); }
  L.push([0, 0]);
  const P = L.map(W);
  let path = '', ball = dot(P.at(-1)[0], P.at(-1)[1], r, 'f-red a-pop', { d: d0 - .3 * k, t: .35 * k });
  const ease = 'cubic-bezier(.45,0,.3,1)';
  for (let i = P.length - 1; i >= 1; i--) {
    const d = d0 + (i - 1) * dt, [x0, y0] = P[i - 1], [x1, y1] = P[i];
    path = draw(seg(x0, y0, x1, y1), 's-red em-thin', d, dt, { e: ease }) + path;
    ball = `<g ${at('a-move', { d, t: dt, x0: x0 - x1, y0: y0 - y1, e: ease })}>${ball}</g>`;
  }
  const end = d0 + (P.length - 1) * dt;
  out += path + dot(M[0], M[1], r + 1, 's-red em-l em-thin f-none l-ripple', { ld: end + .1, lt: 2.8 }) + ball;
  return out;
}

export function hero() {
  let out = descent({ M: [112, 44], phi: -25, a: 40, b: 19, scales: [1, .72, .46, .22], start: [-50, 13], steps: 6, k: 1, r: 3.6, d0: 1.35, dt: .34 });
  // encart L1 / L2
  const O = [42, 87], R = 12;
  out += draw(seg(O[0] - 17, O[1], O[0] + 17, O[1]) + `M${O[0]} ${O[1] + 17}V${O[1] - 17}`, 's-line em-thin', .2, .5);
  out += draw(circ(O[0], O[1], R), 's-c5', .55, .7);
  out += draw(poly([[O[0], O[1] - R], [O[0] + R, O[1]], [O[0], O[1] + R], [O[0] - R, O[1]], [O[0], O[1] - R]]), 's-c4', .8, .7);
  out += dot(O[0], O[1] - R, 2.4, 'f-c4 a-pop', { d: 1.45, t: .4 });
  return out;
}
export function card() {
  return descent({ M: [40, 25], phi: -25, a: 23, b: 10.5, scales: [1, .6, .26], start: [-28, 7], steps: 4, k: .7, r: 3, d0: .65, dt: .2 });
}
