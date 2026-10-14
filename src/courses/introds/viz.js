// Illustrations interactives du cours : chaque module exporte VIZ = { nom: (el) => … } ; mountViz les monte dans les
// <figure class="viz" data-viz="nom"> des leçons.
import { VIZ as P } from './viz-proba.js';
import { VIZ as L } from './viz-lim.js';
import { VIZ as Y } from './viz-py.js';

const VIZ = { ...P, ...L, ...Y };

export function mountViz(root) {
  root.querySelectorAll('[data-viz]').forEach(el => {
    const f = VIZ[el.dataset.viz];
    if (f && !el.dataset.ready) { el.dataset.ready = '1'; try { f(el); } catch (e) { el.textContent = ''; console.error(e); } }
  });
}
