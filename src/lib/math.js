// Rendu des formules LaTeX écrites entre \( … \) (en ligne) et \[ … \] (bloc).
import katex from 'katex';
import renderMathInElement from 'katex/contrib/auto-render';

export function typeset(el) {
  if (!el) return;
  try {
    renderMathInElement(el, {
      delimiters: [
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
      ],
      throwOnError: false,
      strict: 'ignore',
    });
  } catch (e) { /* une formule invalide ne doit pas casser la page */ }
  fitWide(el);
}

// Formules en ligne plus larges que leur bloc (ex. un vecteur de résidus sur mobile) : on les rend défilables
// horizontalement plutôt que de faire déborder toute la page. Les autres formules ne changent pas.
function blockOf(n) {
  for (let p = n.parentElement; p; p = p.parentElement) if (!getComputedStyle(p).display.startsWith('inline')) return p;
  return null;
}
export function fitWide(root) {
  if (!root || typeof getComputedStyle !== 'function') return;
  for (const k of root.querySelectorAll('.katex')) {
    if (k.closest('.katex-display')) continue;
    const b = blockOf(k);
    if (!b || !b.clientWidth) continue;
    const cs = getComputedStyle(b);
    const avail = b.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    k.classList.remove('katex-wide');
    if (k.getBoundingClientRect().width > avail + 1) k.classList.add('katex-wide');
  }
}
if (typeof window !== 'undefined') {
  let t = null;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => fitWide(document.body), 200); });
}

// Action Svelte : <div use:math> re-rend les formules à chaque mise à jour du contenu.
export function math(node) {
  typeset(node);
  const obs = new MutationObserver(() => { obs.disconnect(); typeset(node); obs.observe(node, { childList: true, subtree: true }); });
  obs.observe(node, { childList: true, subtree: true });
  return { destroy: () => obs.disconnect() };
}

/** Texte brut → HTML : échappe le texte et rend les formules \( … \) avec KaTeX (pour un affichage par {@html}). */
export function inlineMath(text) {
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return String(text ?? '').split(/\\\(([\s\S]*?)\\\)/).map((part, i) => {
    if (!(i % 2)) return esc(part);
    try { return katex.renderToString(part, { throwOnError: false, strict: 'ignore' }); } catch (e) { return esc(part); }
  }).join('');
}
