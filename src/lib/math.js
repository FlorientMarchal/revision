// Rendu des formules LaTeX écrites entre \( … \) (en ligne) et \[ … \] (bloc).
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
}

// Action Svelte : <div use:math> re-rend les formules à chaque mise à jour du contenu.
export function math(node) {
  typeset(node);
  const obs = new MutationObserver(() => { obs.disconnect(); typeset(node); obs.observe(node, { childList: true, subtree: true }); });
  obs.observe(node, { childList: true, subtree: true });
  return { destroy: () => obs.disconnect() };
}
