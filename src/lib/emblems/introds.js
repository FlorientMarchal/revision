// Science des données : un prompt Python se tape, un dé roule jusqu'à sa place,
// les barres d'un histogramme se remplissent au hasard des tirages et la gaussienne se dessine par-dessus.
import { poly, seg, draw, line, rect, dot, text, g, at } from './kit.js';

const rnd = s => () => ((s = (s * 16807) % 2147483647) / 2147483647);

function histo({ x0, y0, w, bins, H, sigma, d0, k, curveD }) {
  const bw = w / bins, mu = x0 + w / 2, pdf = x => Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));
  const R = rnd(11), order = Array.from({ length: bins }, (_, i) => [R(), i]).sort((a, b) => a[0] - b[0]).map(a => a[1]);
  let out = '';
  for (let i = 0; i < bins; i++) {
    const cx = x0 + (i + .5) * bw, h = Math.max(2, H * pdf(cx) * (1 + (R() - .5) * .22));
    out += rect(x0 + i * bw + .5, y0 - h, bw - 1, h, 'f-soft s-acc em-l em-thin a-gy', { d: d0 + order.indexOf(i) * .08 * k, t: .55 * k, e: 'cubic-bezier(.3,1.25,.5,1)' }, 1);
  }
  out += draw(seg(x0 - 3, y0, x0 + w + 3, y0), 's-mut em-thin', d0 - .2 * k, .4 * k);
  const pts = Array.from({ length: 49 }, (_, i) => { const x = x0 - 2 + (w + 4) * i / 48; return [x, y0 - H * pdf(x)]; });
  out += draw(poly(pts), 's-red', curveD, 1 * k, { e: 'cubic-bezier(.45,.05,.45,1)' });
  return { out, mu };
}

export function hero() {
  const { out: h, mu } = histo({ x0: 30, y0: 106, w: 100, bins: 11, H: 60, sigma: 17, d0: .7, k: 1, curveD: 1.7 });
  let out = h + line(seg(mu, 44, mu, 106), 's-red em-thin em-dash a-fade', { d: 2.6, t: .5 });
  // prompt Python tapé caractère par caractère
  const cw = 5.1, py = 21, px = 28, cmd = 'np.mean(x)';
  out += text(px, py, '&gt;&gt;&gt;', 'em-code em-prompt a-fade', { d: .1, t: .3 });
  [...cmd].forEach((c, i) => { out += text(px + (4 + i) * cw, py, c, 'em-code a-fade', { d: .45 + i * .085, t: .01 }); });
  const cx = px + (4 + cmd.length) * cw + 1;
  out += `<g ${at('a-move', { d: .45, t: cmd.length * .085, x0: -cmd.length * cw, e: `steps(${cmd.length}, end)` })}>` +
    rect(cx, py - 7.5, 4.4, 9, 'f-acc l-blink', { ld: 0, lt: 1.1 }) + '</g>';
  // dé (face 5) qui roule depuis la gauche
  const s = 20, dx = 129, dy = 9, pip = (x, y) => dot(dx + x * s, dy + y * s, 1.9, 'f-ink');
  out += `<g ${at('a-spin', { d: .9, t: 1.1, x0: -46, y0: 0, r0: '-450deg', o0: 0, e: 'cubic-bezier(.2,.9,.3,1.08)' })}>` +
    rect(dx, dy, s, s, 'f-paper s-ink em-l', {}, 4) + pip(.27, .27) + pip(.73, .27) + pip(.5, .5) + pip(.27, .73) + pip(.73, .73) + '</g>';
  return out;
}
export function card() {
  return histo({ x0: 14, y0: 54, w: 42, bins: 7, H: 36, sigma: 8.5, d0: .2, k: .7, curveD: .7 }).out;
}
