// Coloration légère de requêtes (SQL, AQL, JavaScript, URL) et comparaison indicative d'une réponse avec la solution.
const KW = new Set(('select from where join left right inner outer on and or not in is null as order by group having limit offset distinct ' +
  'insert into values update set delete create table primary key foreign references asc desc count sum avg min max like between exists union all ' +
  'for filter return sort collect with into aggregate keep let inbound outbound any graph prune options shortest_path k_paths ' +
  'function emit var const return true false length unique').split(' '));

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const TOK = /(--[^\n]*|\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|“[^”]*”|‘[^’]*’)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([\s\S])/g;

/** Découpe en jetons : [type, texte] avec type = c (commentaire), s (chaîne), n (nombre), k (mot-clé), i (identifiant), w (blanc), p (ponctuation). */
export function tokens(src) {
  const out = [];
  let m;
  TOK.lastIndex = 0;
  while ((m = TOK.exec(src || ''))) {
    if (m[1]) out.push(['c', m[1]]);
    else if (m[2]) out.push(['s', m[2]]);
    else if (m[3]) out.push(['n', m[3]]);
    else if (m[4]) out.push([KW.has(m[4].toLowerCase()) ? 'k' : 'i', m[4]]);
    else if (m[5]) out.push(['w', m[5]]);
    else out.push(['p', m[6]]);
  }
  return out;
}

/** HTML coloré (à placer dans un <pre>). */
export function highlight(src) {
  return tokens(src).map(([t, s]) => (t === 'w' || t === 'p' || t === 'i') ? esc(s) : `<span class="hl-${t}">${esc(s)}</span>`).join('');
}

// Forme normalisée d'un jeton pour la comparaison : mots-clés sans casse, guillemets unifiés.
const norm = ([t, s]) => t === 'k' ? s.toUpperCase() : t === 's' ? '"' + s.slice(1, -1) + '"' : s;

/** Mots-clés, chaînes, nombres, champs et tables de la solution qui n'apparaissent pas dans la réponse. */
export function missing(answer, solution) {
  // champ (après un point) ou table / collection (après FROM, JOIN, IN, UPDATE, INTO, GRAPH)
  const prev = (a, k) => { let j = k - 1; while (j >= 0 && a[j][0] === 'w') j--; return j >= 0 ? a[j] : null; };
  const named = (a, k) => { const p = prev(a, k); return !!p && (p[1] === '.' || (p[0] === 'k' && /^(from|join|in|update|into|graph)$/i.test(p[1]))); };
  const keep = (tk, k, a) => tk[0] === 'k' || tk[0] === 's' || tk[0] === 'n' || (tk[0] === 'i' && named(a, k));
  const have = new Set(tokens(answer).filter(keep).map(norm));
  const seen = new Set(), out = [];
  for (const tk of tokens(solution).filter(keep)) {
    const n = norm(tk);
    if (!have.has(n) && !seen.has(n)) { seen.add(n); out.push(n); }
  }
  return out;
}
