// Classification : deux classes de points apparaissent, l'hyperplan séparateur (SVM) pivote en place,
// la marge s'ouvre de part et d'autre et les vecteurs supports sont entourés à l'encre rouge.
import { at, seg, circ, draw, line, dot, cross, g, n } from './kit.js';

function scene({ C, deg, L, m, A, B, sv, r, k }) {
  const t = deg * Math.PI / 180, u = [Math.cos(t), Math.sin(t)], v = [-u[1], u[0]];
  const P = ([a, b]) => [C[0] + a * u[0] + b * v[0], C[1] + a * u[1] + b * v[1]];
  const ends = (off, h) => [P([-h, off]), P([h, off])];
  let out = '';
  if (m) {
    // bande de marge + droites de marge qui s'écartent depuis l'hyperplan
    const [p1, p2] = ends(-m, L * .92), [p3, p4] = ends(m, L * .92);
    out += `<path d="M${n(p1[0])} ${n(p1[1])}L${n(p2[0])} ${n(p2[1])}L${n(p4[0])} ${n(p4[1])}L${n(p3[0])} ${n(p3[1])}Z" ${at('f-soft a-fade', { d: 1.75 * k, t: .7 * k })}/>`;
    for (const s of [-1, 1]) {
      const [a, b] = ends(s * m, L * .92);
      out += line(seg(a[0], a[1], b[0], b[1]), 's-acc em-thin em-dash a-move', { d: 1.6 * k, t: .7 * k, x0: -s * m * v[0], y0: -s * m * v[1], o0: 0 });
    }
  }
  const [a, b] = ends(0, L);
  out += line(seg(a[0], a[1], b[0], b[1]), 's-acc a-rot', { d: (m ? 1 : .55) * k, t: .85 * k, r0: '-62deg', o0: 0, ox: C[0], oy: C[1], e: 'cubic-bezier(.3,1.35,.5,1)' });
  const pts = [...A.map(p => [p, 0]), ...B.map(p => [p, 1])].sort((p, q) => P(p[0])[0] - P(q[0])[0]);
  pts.forEach(([p, c], i) => {
    const [x, y] = P(p), o = { d: (.08 + i * (m ? .07 : .06)) * k, t: .45 * k };
    out += c ? cross(x, y, r * .95, 's-c2 a-pop', o) : dot(x, y, r, 'f-c1 a-pop', o);
  });
  if (sv) {
    let rings = '';
    sv.forEach((p, i) => { const [x, y] = P(p); rings += draw(circ(x, y, r + 3.4), 's-red em-thin', 2.2 + i * .14, .5); });
    out += g(rings, 'l-pulse', { ld: 3.2, lt: 3.4 });
  }
  return out;
}

export function hero() {
  return scene({
    C: [92, 61], deg: -33, L: 66, m: 12, r: 3.2, k: 1,
    A: [[-46, -24], [-28, -36], [-12, -12], [6, -28], [26, -19], [-34, -14], [-4, -44]],
    B: [[-30, 24], [-10, 36], [4, 12], [24, 30], [40, 12], [8, 48]],
    sv: [[-12, -12], [4, 12], [40, 12]],
  });
}
export function card() {
  return scene({
    C: [36, 32], deg: -36, L: 30, m: 0, r: 3.4, k: .8,
    A: [[-14, -10], [2, -15], [12, -9]],
    B: [[-12, 10], [2, 15], [14, 9]],
  });
}
