// Emblème générique (cours inconnu) : un repère se trace, une courbe s'y dessine et son maximum est pointé.
import { seg, poly, head, draw, line, dot, g } from './kit.js';

function scene(x0, y0, x1, y1, k, hero) {
  const W = x1 - x0, H = y0 - y1;
  const f = t => y0 - H * (0.18 + 0.62 * Math.exp(-((t - .55) ** 2) / .045) + 0.12 * Math.sin(t * 9) * (1 - t));
  const pts = Array.from({ length: 41 }, (_, i) => [x0 + 4 + (W - 8) * i / 40, f(i / 40)]);
  const top = pts.reduce((a, b) => (b[1] < a[1] ? b : a));
  let out = draw(seg(x0, y0, x1, y0) + head(x0, y0, x1, y0, hero ? 4.5 : 3.5), 's-mut em-thin', 0, .5 * k);
  out += draw(seg(x0, y0, x0, y1) + head(x0, y0, x0, y1, hero ? 4.5 : 3.5), 's-mut em-thin', .1 * k, .5 * k);
  out += draw(poly(pts), 's-acc', .45 * k, 1.1 * k, { e: 'cubic-bezier(.45,.1,.4,1)' });
  out += line(seg(top[0], top[1] + 4, top[0], y0), 's-red em-thin em-dash a-fade', { d: 1.5 * k, t: .4 * k });
  out += g(dot(top[0], top[1], hero ? 3.4 : 3, 'f-red a-pop', { d: 1.45 * k, t: .45 * k }), 'l-bob', { ld: 2.4, lt: 2.6 });
  return out;
}
export const hero = () => scene(32, 102, 148, 16, 1, true);
export const card = () => scene(15, 54, 57, 10, .8, false);
