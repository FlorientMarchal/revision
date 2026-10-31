// Zones de code des labos : Tab / Maj+Tab indentent ou désindentent la ligne ou toute la sélection ;
// Entrée reprend l'indentation de la ligne (un niveau de plus après { ( [ ou : en Python) ;
// une fermante } ) ] tapée en début de ligne retire un niveau ; Retour arrière efface un niveau d'espaces d'un coup ;
// et un historique propre à chaque zone permet d'annuler / rétablir (Ctrl/⌘+Z, Ctrl/⌘+Maj+Z ou Ctrl+Y, et boutons).
// Usage : <textarea use:codeEditor={{ unit: '  ', onChange: v => … }}>
const HIST = new WeakMap();
const MAX = 300;

function lineRange(v, a, b) {
  const start = v.lastIndexOf('\n', a - 1) + 1;
  // une sélection qui finit en début de ligne n'inclut pas cette ligne
  const last = b > a && v[b - 1] === '\n' ? b - 1 : b;
  let end = v.indexOf('\n', last);
  if (end === -1) end = v.length;
  return [start, end];
}

function indent(v, a, b, unit, out) {
  const multi = v.slice(a, b).includes('\n');
  if (!multi && !out) return { v: v.slice(0, a) + unit + v.slice(b), a: a + unit.length, b: a + unit.length };
  const [s, e] = lineRange(v, a, b);
  const width = unit === '\t' ? 4 : unit.length;
  let na = a, nb = b;
  const lines = v.slice(s, e).split('\n').map((l, i) => {
    let d;
    if (out) {
      const m = l.match(/^(\t| +)/);
      const n = !m ? 0 : m[1] === '\t' ? 1 : Math.min(m[1].length, width);
      l = l.slice(n); d = -n;
    } else if (l.trim()) { l = unit + l; d = unit.length; } else d = 0;
    // décale la sélection selon ce qui a été ajouté ou retiré avant elle
    if (i === 0) na = Math.max(s, a + (out ? Math.max(d, s - a) : d));
    nb += d;
    return l;
  });
  return { v: v.slice(0, s) + lines.join('\n') + v.slice(e), a: na, b: Math.max(na, nb) };
}

const OPEN = /[{([]\s*$/;
const PAIR = { '{': '}', '(': ')', '[': ']' };

// Entrée : nouvelle ligne alignée sur la ligne courante, un niveau de plus après une ouvrante ;
// entre deux accolades {|}, la fermante descend sur sa propre ligne
function newline(v, a, b, unit, py) {
  const start = v.lastIndexOf('\n', a - 1) + 1;
  const before = v.slice(start, a);
  const base = before.match(/^[ \t]*/)[0];
  const open = OPEN.test(before) || (py && /:\s*(#.*)?$/.test(before));
  const next = v[b];
  if (open && next && PAIR[before.trimEnd().slice(-1)] === next) {
    const ins = '\n' + base + unit + '\n' + base;
    return { v: v.slice(0, a) + ins + v.slice(b), a: a + 1 + base.length + unit.length };
  }
  const ins = '\n' + base + (open ? unit : '');
  return { v: v.slice(0, a) + ins + v.slice(b), a: a + ins.length };
}

export function codeEditor(t, params) {
  let p = params;
  const h = { stack: [{ v: t.value, a: 0, b: 0 }], i: 0, last: 0, kind: '' };
  HIST.set(t, h);

  const snap = () => ({ v: t.value, a: t.selectionStart, b: t.selectionEnd });
  function push(kind) {
    const now = Date.now();
    const top = h.stack[h.i];
    if (top && top.v === t.value) return;
    // la frappe continue (même type d'action, moins d'une seconde) reste un seul pas d'annulation
    if (kind && kind === h.kind && now - h.last < 1000 && h.i > 0) h.stack[h.i] = snap();
    else { h.stack.splice(h.i + 1); h.stack.push(snap()); if (h.stack.length > MAX) h.stack.shift(); h.i = h.stack.length - 1; }
    h.last = now; h.kind = kind;
  }
  // une modification faite hors de l'éditeur (bouton « Insérer », « Code de départ »…) devient un pas d'historique
  function sync() { if (h.stack[h.i].v !== t.value) { h.kind = ''; push(''); } }
  function apply(s) {
    t.value = s.v; t.setSelectionRange(s.a, s.b);
    p.onChange?.(s.v);
  }
  h.step = dir => {
    onFocus();
    sync();
    const j = h.i + dir;
    if (j < 0 || j >= h.stack.length) return;
    h.i = j; h.kind = '';
    apply(h.stack[j]);
    t.focus();
  };

  // la valeur de départ n'est posée qu'après le montage : on la reprend tant que rien n'a été modifié
  function onFocus() { if (h.stack.length === 1) h.stack[0] = snap(); }
  function onInput(e) {
    const k = e.inputType || '';
    push(k.startsWith('insertText') ? 'type' : k.startsWith('delete') ? 'del' : '');
  }
  function onKey(e) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && !e.altKey && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); h.step(e.shiftKey ? 1 : -1); return; }
    if (mod && !e.altKey && e.key === 'y') { e.preventDefault(); h.step(1); return; }
    if (e.isComposing || mod || e.altKey) return;
    const v = t.value, a = t.selectionStart, b = t.selectionEnd;
    const unit = p.unit || '  ';
    const lineStart = v.lastIndexOf('\n', a - 1) + 1;
    const lead = v.slice(lineStart, a);
    let r = null;
    if (e.key === 'Enter') r = newline(v, a, b, unit, p.py);
    // fermante tapée sur une ligne vide d'indentation : on retire un niveau
    else if ((e.key === '}' || e.key === ')' || e.key === ']') && a === b && lead && !lead.trim()) {
      const cut = lead.endsWith('\t') ? 1 : Math.min(lead.length, unit === '\t' ? 4 : unit.length);
      r = { v: v.slice(0, a - cut) + e.key + v.slice(b), a: a - cut + 1 };
    }
    // Retour arrière dans l'indentation (espaces) : efface jusqu'au niveau précédent
    else if (e.key === 'Backspace' && a === b && unit !== '\t' && lead && /^ +$/.test(lead)) {
      const cut = (lead.length % unit.length) || unit.length;
      if (cut > 1) r = { v: v.slice(0, a - cut) + v.slice(b), a: a - cut };
    }
    if (r) {
      e.preventDefault();
      sync();
      t.value = r.v; t.setSelectionRange(r.a, r.a);
      h.kind = ''; push('');
      p.onChange?.(r.v);
      return;
    }
    if (e.key !== 'Tab') return;
    e.preventDefault();
    sync();
    r = indent(v, a, b, unit, e.shiftKey);
    if (r.v === t.value) return;
    t.value = r.v; t.setSelectionRange(r.a, r.b);
    h.kind = ''; push('');
    p.onChange?.(r.v);
  }
  t.addEventListener('focus', onFocus);
  t.addEventListener('input', onInput);
  t.addEventListener('keydown', onKey);
  return {
    update(n) { p = n; },
    destroy() { t.removeEventListener('focus', onFocus); t.removeEventListener('input', onInput); t.removeEventListener('keydown', onKey); HIST.delete(t); },
  };
}

/** Annule (dir = -1) ou rétablit (dir = 1) dans la zone de code la plus proche du bouton cliqué. */
export function historyStep(btn, dir) {
  const t = btn.closest('[data-editor]')?.querySelector('textarea');
  HIST.get(t)?.step(dir);
}
