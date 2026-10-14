// Convertit les pages Svelte du cours en ligne (parties I et V) en données pour le site de révision.
// Usage : node convert.mjs <racine du dépôt machine_learning> <fichier de sortie .json>
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import { parse } from 'svelte/compiler';

const ROOT = process.argv[2], OUT = process.argv[3];
const PAGES = [
  ['p1/l1', 'part1/lesson1'], ['p1/l2', 'part1/lesson2'], ['p1/l3', 'part1/lesson3'], ['p1/l3-adam', 'part1/lesson3-adam'],
  ['p1/l4', 'part1/lesson4'], ['p1/proximal', 'part1/methodes-proximales'], ['p1/dualite', 'part1/dualite-convexe-kkt'],
  ['p5/l1', 'part5/lesson1'], ['p5/l2', 'part5/lesson2'], ['p5/l3', 'part5/lesson3'], ['p5/l4', 'part5/lesson4'],
  ['p1/ex', 'part1/exercices'], ['p5/ex', 'part5/exercices'],
];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const warnings = [];

function convert(key, rel) {
  const src = readFileSync(`${ROOT}/src/routes/${rel}/+page.svelte`, 'utf8');
  const ast = parse(src, { modern: true });
  // --- constantes du script (formules, tables, tocEntries…)
  const ctx = vm.createContext({ String, Math, Number, Array, Object, JSON, meta: null }); // meta : titre de la page (non utilisé)
  const prog = ast.instance && ast.instance.content;
  for (const st of prog ? prog.body : []) {
    const decl = st.type === 'VariableDeclaration' ? st : (st.type === 'ExportNamedDeclaration' && st.declaration && st.declaration.type === 'VariableDeclaration' ? st.declaration : null);
    if (!decl) continue;
    for (const d of decl.declarations) {
      if (!d.init || d.id.type !== 'Identifier') continue;
      const code = src.slice(d.init.start, d.init.end);
      try { ctx[d.id.name] = vm.runInContext('(' + code + ')', ctx, { timeout: 200 }); } catch (e) { /* imports, stores… */ }
    }
  }
  const evalIn = (node, scope) => {
    const code = src.slice(node.start, node.end);
    try { return vm.runInContext(`(function(){ with (this) { return (${code}); } })`, ctx).call(Object.assign(Object.create(null), scope)); }
    catch (e) { warnings.push(`${key} : expression non évaluée « ${code.slice(0, 80)} »`); return undefined; }
  };
  const attr = (n, name, scope) => {
    const a = (n.attributes || []).find(x => x.type === 'Attribute' && x.name === name);
    if (!a) return undefined;
    if (a.value === true) return true;
    const parts = Array.isArray(a.value) ? a.value : [a.value];
    if (parts.length === 1 && parts[0].type === 'ExpressionTag') return evalIn(parts[0].expression, scope);
    return parts.map(p => (p.type === 'Text' ? p.data : String(evalIn(p.expression, scope) ?? ''))).join('');
  };
  const snippets = (n) => (n.fragment ? n.fragment.nodes.filter(x => x.type === 'SnippetBlock') : []);
  const box = (cls, title, html) => `<div class="box ${cls}"><div class="box-h">${title}</div>${html}</div>`;
  const label = (kind, n, scope) => { const num = attr(n, 'number', scope), t = attr(n, 'title', scope); return [kind + (num ? ' ' + num : ''), t].filter(Boolean).join(' · '); };
  const CALLOUT = { warning: 'warn', summary: 'keep', insight: 'prop', intuition: 'goal', note: 'prop', proof: 'prop' };
  const CALLOUT_T = { warning: 'Attention', summary: 'Synthèse', insight: 'À retenir', intuition: 'Intuition', note: 'Remarque', proof: 'Démonstration' };

  let exPanels = null; // pages d'exercices : on collecte les panneaux
  function frag(nodes, scope) { return nodes.map(x => node(x, scope)).join(''); }
  function node(n, scope) {
    switch (n.type) {
      case 'Text': return n.data;
      case 'Comment': return '';
      case 'ExpressionTag': { const v = evalIn(n.expression, scope); return v == null ? '' : esc(v); }
      case 'HtmlTag': { const v = evalIn(n.expression, scope); return v == null ? '' : String(v); }
      case 'IfBlock': { const t = evalIn(n.test, scope); return t !== false && t !== 0 && t !== null && t !== '' ? frag(n.consequent.nodes, scope) : (n.alternate ? frag(n.alternate.nodes, scope) : ''); }
      case 'EachBlock': {
        const arr = evalIn(n.expression, scope) || [];
        return Array.from(arr).map((item, i) => {
          const s = { ...scope };
          const c = n.context;
          if (c && c.type === 'Identifier') s[c.name] = item;
          else if (c && c.type === 'ObjectPattern') c.properties.forEach(p => { if (p.key && p.value && p.value.type === 'Identifier') s[p.value.name] = item[p.key.name]; });
          else if (c && c.type === 'ArrayPattern') c.elements.forEach((e, k) => { if (e && e.type === 'Identifier') s[e.name] = item[k]; });
          if (n.index) s[n.index] = i;
          return frag(n.body.nodes, s);
        }).join('');
      }
      case 'KeyBlock': return frag(n.fragment.nodes, scope);
      case 'SnippetBlock': case 'RenderTag': case 'ConstTag': case 'SvelteHead': return '';
      case 'RegularElement': return element(n, scope);
      case 'Component': return component(n, scope);
      default: return n.fragment ? frag(n.fragment.nodes, scope) : '';
    }
  }
  function element(n, scope) {
    const inner = frag(n.fragment.nodes, scope);
    const cls = attr(n, 'class', scope);
    if (n.name === 'a') return inner; // pas de liens vers d'autres sites
    if (n.name === 'div' && cls === 'proof-block') return `<details class="fold"><summary>Démonstration</summary><div style="margin-top:8px;display:grid;gap:8px">${inner}</div></details>`;
    if (n.name === 'h2') return `\n<!--H2:${attr(n, 'id', scope) || ''}:${encodeURIComponent(inner.replace(/<[^>]+>/g, '').trim())}-->\n`;
    const keep = ['id', 'colspan', 'rowspan'];
    let at = '';
    for (const a of n.attributes || []) {
      if (a.type !== 'Attribute') continue;
      if (a.name === 'class') { const v = n.name === 'table' ? ('t ' + (cls || '')).trim() : cls; if (v) at += ` class="${esc(v)}"`; }
      else if (keep.includes(a.name)) { const v = attr(n, a.name, scope); if (v != null && v !== true) at += ` ${a.name}="${esc(v)}"`; }
    }
    if (n.name === 'table' && !cls) at += ' class="t"';
    const voids = ['br', 'hr', 'img', 'input', 'col'];
    if (n.name === 'img') return '';
    return voids.includes(n.name) ? `<${n.name}${at}>` : `<${n.name}${at}>${inner}</${n.name}>`;
  }
  function component(n, scope) {
    const kids = () => frag(n.fragment.nodes.filter(x => x.type !== 'SnippetBlock'), scope);
    switch (n.name) {
      case 'KatexInline': { const f = attr(n, 'formula', scope); return f == null ? '' : `\\(${esc(f)}\\)`; }
      case 'KatexBlock': { const f = attr(n, 'formula', scope); return f == null ? '' : `<div class="math">\\[${esc(f)}\\]</div>`; }
      case 'PageTemplate': case 'TheorySection': return kids();
      case 'TableOfContents': case 'InteractiveSection': case 'DeferredDemo': case 'Quiz': return '';
      case 'DefinitionBlock': return box('def', label('Définition', n, scope), kids());
      case 'TheoremBlock': return box('prop', label('Théorème', n, scope), kids());
      case 'ExampleBlock': return box('ex', label('Exemple', n, scope), kids());
      case 'Callout': { const ty = attr(n, 'type', scope) || 'note', t = attr(n, 'title', scope); if (ty === 'proof') return `<details class="fold"><summary>${t || 'Démonstration'}</summary><div style="margin-top:8px;display:grid;gap:8px">${kids()}</div></details>`; return box(CALLOUT[ty] || 'prop', t ? `${CALLOUT_T[ty] || ''} · ${t}`.replace(/^ · /, '') : (CALLOUT_T[ty] || 'Remarque'), kids()); }
      case 'ExpertPanel': return `<details class="fold"><summary>Pour aller plus loin : ${esc(attr(n, 'title', scope) || '')}</summary><div style="margin-top:8px;display:grid;gap:8px">${kids()}</div></details>`;
      case 'ExercisePanel': {
        const sn = snippets(n), sol = sn.find(s => s.expression.name === 'solution'), ts = sn.find(s => s.expression.name === 'titleSnippet');
        const num = attr(n, 'number', scope), t = ts ? frag(ts.body.nodes, scope) : esc(attr(n, 'title', scope) || 'Exercice');
        const q = kids(), a = sol ? frag(sol.body.nodes, scope) : '';
        if (exPanels) { exPanels.push({ num, t, q, a }); return `\n<!--EX:${exPanels.length - 1}-->\n`; }
        return box('method', `Exercice${num ? ' ' + num : ''} · ${t}`, q + (a ? `<details class="fold"><summary>Voir la solution</summary><div style="margin-top:8px;display:grid;gap:8px">${a}</div></details>` : ''));
      }
      case 'Bibliography': return `\n<!--H2:references:${encodeURIComponent('Références')}-->\n<ul class="refs">${kids()}</ul>`;
      case 'BibElement': { const au = attr(n, 'authors', scope); return `<li>${esc(Array.isArray(au) ? au.join(', ') : au || '')} (${esc(attr(n, 'year', scope) || '')}). <i>${esc(attr(n, 'title', scope) || '')}</i>. ${esc(attr(n, 'journal', scope) || '')}</li>`; }
      default: warnings.push(`${key} : composant inconnu ${n.name}`); return kids();
    }
  }

  const isEx = rel.endsWith('exercices');
  if (isEx) exPanels = [];
  const tplRoot = ast.fragment.nodes.find(x => x.type === 'Component' && x.name === 'PageTemplate');
  const title = attr(tplRoot, 'title', {}) , subtitle = attr(tplRoot, 'subtitle', {});
  const html = frag(ast.fragment.nodes, {});
  const toc = ctx.tocEntries || [];
  // découpage en sections sur les <h2>
  const parts = html.split(/\n<!--H2:([^:]*):([^>]*)-->\n/);
  const intro = parts[0].trim();
  const sections = [];
  for (let i = 1; i < parts.length; i += 3) {
    const id = parts[i], t = decodeURIComponent(parts[i + 1]), body = parts[i + 2].trim();
    const te = toc.find(e => e.id === id);
    sections.push({ id: id || 's' + sections.length, t, sub: te && te.description ? te.description : '', html: body });
  }
  return { key, rel, title, subtitle, intro, sections, panels: exPanels };
}

const out = PAGES.map(([k, r]) => convert(k, r));
// QCM des parties I et V
const quizSrc = ['part1', 'part5'].map(p => readFileSync(`${ROOT}/src/lib/quiz/questions/${p}.ts`, 'utf8').replace(/^import[^\n]*\n/gm, '').replace(/export const (\w+)\s*:\s*QuizQuestion\[\]\s*=/, 'globalThis.$1 ='));
const qctx = vm.createContext({});
quizSrc.forEach(s => vm.runInContext(s, qctx));
const quiz = [...qctx.PART1, ...qctx.PART5];
writeFileSync(OUT, JSON.stringify({ pages: out, quiz }, null, 1));
console.log(out.map(p => `${p.key}: ${p.title} | ${p.sections.length} sections${p.panels ? ', ' + p.panels.length + ' exercices' : ''} | ${Math.round(JSON.stringify(p).length / 1024)} ko`).join('\n'));
console.log('QCM :', quiz.length);
console.log(warnings.length + ' avertissements'); warnings.slice(0, 30).forEach(w => console.log(' -', w));
