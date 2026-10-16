// Curseurs des illustrations : le navigateur envoie des dizaines d'évènements « input » par seconde pendant un glisser.
// On n'en transmet qu'un par image affichée (le dernier), pour que les illustrations lourdes restent fluides.
export function smoothSliders() {
  const pending = new Set();
  let raf = 0, timer = 0;
  const flush = () => {
    cancelAnimationFrame(raf); clearTimeout(timer);
    raf = 0; timer = 0;
    const list = [...pending];
    pending.clear();
    for (const inp of list) {
      if (!inp.isConnected) continue;
      const ev = new Event('input', { bubbles: true });
      ev.__frame = true;
      inp.dispatchEvent(ev);
    }
  };
  document.addEventListener('input', e => {
    const t = e.target;
    if (e.__frame || !(t instanceof HTMLInputElement) || t.type !== 'range' || !t.closest('.viz')) return;
    e.stopImmediatePropagation();
    pending.add(t);
    if (!raf) {
      raf = requestAnimationFrame(flush);
      timer = setTimeout(flush, 100);   // filet de sécurité si l'affichage est suspendu
    }
  }, true);
}
