// NoSQL : des documents { } tombent en place, des arêtes les relient en graphe (nœuds du cluster),
// puis des impulsions circulent le long des arêtes.
import { seg, draw, line, rect, dot, text, travel, g } from './kit.js';

function doc(cx, cy, w, h, d, k, hero) {
  const x = cx - w / 2, y = cy - h / 2;
  let s = rect(x, y, w, h, 'f-paper s-acc em-l', {}, hero ? 3 : 2);
  s += text(cx, y + (hero ? 11 : h / 2 + 3), hero ? '{ }' : '{}', 'em-brace', {}, 'middle');
  if (hero) {
    s += line(seg(x + 5, y + 16, x + w - 5, y + 16), 's-mut em-thin');
    s += line(seg(x + 5, y + 21, x + w - 9, y + 21), 's-c3 em-thin');
  }
  return g(s, `a-move ${hero ? 'em-doc-h' : 'em-doc-c'}`, { d, t: .6 * k, y0: hero ? -22 : -12, o0: 0, e: 'cubic-bezier(.3,1.4,.5,1)' });
}

function scene({ docs, nodes, edges, w, h, k, hero }) {
  const P = [...docs, ...nodes];
  let es = '', pulses = '';
  const d1 = (docs.length * .18 + .45) * k;
  edges.forEach(([a, b], i) => {
    const d = seg(P[a][0], P[a][1], P[b][0], P[b][1]);
    es += draw(d, 's-line', d1 + i * .12 * k, .5 * k);
    pulses += travel(d, `${i % 2 ? 's-red' : 's-warn'} em-thick`, { ld: 3 + i * .55, lt: 2.4 + (i % 3) * .5 });
  });
  let out = es + pulses;
  docs.forEach((p, i) => { out += doc(p[0], p[1], w, h, (.1 + i * .18) * k, k, hero); });
  nodes.forEach((p, i) => { out += dot(p[0], p[1], p[2], 'f-c3 a-pop', { d: d1 + (.3 + i * .15) * k, t: .4 * k }); });
  return out;
}

export const hero = () => scene({
  docs: [[44, 34], [116, 26], [86, 86]], nodes: [[140, 82, 5], [42, 96, 4], [138, 54, 3.2]],
  edges: [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [1, 5], [5, 3], [0, 4]], w: 26, h: 26, k: 1, hero: true,
});
export const card = () => scene({
  docs: [[23, 22], [45, 42]], nodes: [[47, 17, 3.4], [20, 47, 3]],
  edges: [[0, 1], [0, 2], [2, 1], [0, 3], [3, 1]], w: 16, h: 18, k: .8, hero: false,
});
