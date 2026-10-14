// Illustrations interactives de la partie Python du cours (bases, NumPy, Pandas, Matplotlib/Seaborn).
// Les « pas-à-pas » rejouent des traces écrites à la main (simulées en JS ligne par ligne) : ce n'est pas un interpréteur.
// Tous les résultats affichés ont été vérifiés avec Python 3 (NumPy / Pandas pour la partie données).
import './viz-py.css';

/* ------------------------------------------------------------------ outils communs */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const head = (t, hint) => `<figcaption><b>${t}</b>${hint ? `<span>${hint}</span>` : ''}</figcaption>`;
const svg = (w, h, body, label, cls = '') => `<svg viewBox="0 0 ${w} ${h}" class="vz-svg ${cls}" role="img" aria-label="${esc(label)}">${body}</svg>`;
const RM = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
const reduced = () => RM.matches;
const $ = (el, s) => el.querySelector(s);
const $$ = (el, s) => [...el.querySelectorAll(s)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const fr = (x, d = 2) => Number(x).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** Flottant Python (pour afficher 3.0 et non 3). */
class F { constructor(x) { this.x = x; } }
const pf = x => new F(x);
/** repr() Python d'une valeur JS. */
function pyr(v) {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (v instanceof F) return Number.isInteger(v.x) ? v.x + '.0' : String(v.x);
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return v.includes("'") && !v.includes('"') ? `"${v}"` : `'${v}'`;
  if (Array.isArray(v)) return v.tuple ? '(' + v.map(pyr).join(', ') + (v.length === 1 ? ',' : '') + ')' : '[' + v.map(pyr).join(', ') + ']';
  if (v && v.dict) { const b = '{' + v.dict.map(([k, x]) => pyr(k) + ': ' + pyr(x)).join(', ') + '}'; return v.dd ? `defaultdict(<class 'int'>, ${b})` : b; }
  return String(v);
}
const dct = (entries, dd) => ({ dict: entries.map(e => e.slice()), dd });
const pstr = v => (typeof v === 'string' ? v : pyr(v));
const tup = (...a) => Object.assign(a, { tuple: true });
const cl = v => (Array.isArray(v) ? Object.assign(v.map(cl), v.tuple ? { tuple: true } : {}) : v);
const clv = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, cl(v)]));

/* coloration syntaxique minimale */
const KW = new Set('def return while for in if elif else and or not import from as True False None lambda is try except class pass'.split(' '));
const BI = new Set('print len range enumerate reversed sorted sum any all set list dict int float str abs max min'.split(' '));
function hl(line) {
  let o = '';
  const re = /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|([^#"'\w]+|.)/g;
  let m;
  while ((m = re.exec(line))) {
    if (m[1]) o += `<span class="vy-c">${esc(m[1])}</span>`;
    else if (m[2]) o += `<span class="vy-s">${esc(m[2])}</span>`;
    else if (m[3]) o += `<span class="vy-n">${m[3]}</span>`;
    else if (m[4]) o += KW.has(m[4]) ? `<span class="vy-k">${m[4]}</span>` : BI.has(m[4]) ? `<span class="vy-f">${m[4]}</span>` : m[4];
    else o += esc(m[5]);
  }
  return o;
}
const codeHTML = src => src.replace(/^\n/, '').replace(/\s+$/, '').split('\n').map((l, i) => `<div class="vy-ln" data-l="${i + 1}"><span class="vy-no">${i + 1}</span><span>${hl(l) || ' '}</span></div>`).join('');
const cellsHTML = (items, o = {}) => items.map((x, i) => `<span class="vy-cell ${(o.cls && o.cls[i]) || ''}${o.cur === i ? ' cur' : ''}">${o.top ? `<span class="ix">${o.top[i]}</span>` : ''}<b>${esc(x)}</b>${o.bot ? `<span class="ix neg">${o.bot[i]}</span>` : ''}</span>`).join('');

/* ------------------------------------------------------------------ lecteur Play / Pas / Reset */
const SPEEDS = [1500, 950, 600, 330, 140];
function player(host, { count, show, label = 'pas', onPlay }) {
  host.innerHTML = `<div class="vy-play">
    <button type="button" class="btn small" data-a="reset" aria-label="Revenir au début" title="Revenir au début">⟲</button>
    <button type="button" class="btn small" data-a="prev" aria-label="Pas précédent" title="Pas précédent">◀</button>
    <button type="button" class="btn small primary" data-a="play">▶ Lecture</button>
    <button type="button" class="btn small" data-a="next" aria-label="Pas suivant" title="Pas suivant">Pas ▶</button>
    <span class="vy-prog" aria-hidden="true"><i></i></span><span class="vy-cnt"></span>
    <label class="vy-speed">vitesse <input type="range" min="0" max="4" value="2" aria-label="vitesse de lecture"></label></div>`;
  let k = 0, timer = 0, playing = false;
  const bPlay = $(host, '[data-a=play]'), sp = $(host, 'input');
  const ui = () => {
    const n = count();
    $(host, '.vy-prog i').style.width = (n > 1 ? (100 * k) / (n - 1) : 0) + '%';
    $(host, '.vy-cnt').textContent = `${k + 1}/${n}`;
    bPlay.textContent = playing ? '❚❚ Pause' : k >= n - 1 ? '⟲ Rejouer' : '▶ Lecture';
    $(host, '[data-a=prev]').disabled = k <= 0;
    $(host, '[data-a=next]').disabled = k >= n - 1;
  };
  const go = (n, back) => { k = clamp(n, 0, count() - 1); show(k, back); ui(); };
  const stop = () => { playing = false; clearTimeout(timer); ui(); };
  const tick = () => {
    if (!host.isConnected) { stop(); return; }
    if (k >= count() - 1) { stop(); return; }
    go(k + 1); timer = setTimeout(tick, SPEEDS[+sp.value]);
  };
  bPlay.onclick = () => {
    if (playing) { stop(); return; }
    if (k >= count() - 1) go(0);
    playing = true; ui(); if (onPlay) onPlay(); timer = setTimeout(tick, Math.min(400, SPEEDS[+sp.value]));
  };
  $(host, '[data-a=next]').onclick = () => { stop(); go(k + 1); };
  $(host, '[data-a=prev]').onclick = () => { stop(); go(k - 1, true); };
  $(host, '[data-a=reset]').onclick = () => { stop(); go(0, true); };
  return { go, stop, get k() { return k; }, ui };
}

/* ------------------------------------------------------------------ pas-à-pas d'exécution */
/** Enregistreur de trace : r.v = variables courantes, r.out = sortie, r.st(ligne, note, extra) fige un pas. */
function recorder() {
  const r = { S: [], out: [], v: {} };
  r.st = (l, note, x = {}) => r.S.push({ l, v: clv(r.v), out: r.out.slice(), note, ...x });
  r.print = (...a) => r.out.push(a.map(pstr).join(' '));
  return r;
}
const TF = b => (b ? '<b class="yes">True</b>' : '<b class="no">False</b>');

/** progs : [{ label, code, run: () => steps }]. visual(box, step) dessine l'état (listes, grilles…). */
function tracer(el, { title, hint, progs, visual }) {
  el.innerHTML = (title ? head(title, hint) : '') +
    (progs.length > 1 ? `<div class="vy-chips" role="group" aria-label="Programme">${progs.map((p, i) => `<button type="button" class="chip" data-p="${i}">${p.label}</button>`).join('')}</div>` : '') +
    `<div data-pl></div><div class="vy-trace"><div class="vy-code" aria-label="Code Python"></div>
     <div class="vy-side"><p class="vy-note" aria-live="polite"></p><div class="vy-visual"></div>
     <div class="vy-panel"><h5>Variables</h5><div class="vy-vars"></div></div>
     <div class="vy-panel"><h5>Sortie</h5><pre class="vy-out"></pre></div></div></div>`;
  let P = 0, S = [], prev = -1;
  const code = $(el, '.vy-code'), vars = $(el, '.vy-vars'), out = $(el, '.vy-out'), note = $(el, '.vy-note'), vis = $(el, '.vy-visual');
  const show = k => {
    const s = S[k], p = S[k - 1], fwd = k === prev + 1;
    $$(code, '.vy-ln').forEach(n => { const l = +n.dataset.l; n.classList.toggle('on', l === s.l); n.classList.toggle('was', !!p && l === p.l && l !== s.l); });
    const cur = $(code, '.vy-ln.on');
    if (cur && code.scrollHeight > code.clientHeight + 4) code.scrollTop = cur.offsetTop - code.clientHeight / 2;
    const names = Object.keys(s.v);
    vars.innerHTML = names.length ? names.map(n => `<span class="k">${esc(n)}</span><span class="v${fwd && p && pyr(p.v[n]) !== pyr(s.v[n]) ? ' chg' : ''}">${esc(pyr(s.v[n]))}</span>`).join('') : '<span class="empty">aucune variable pour l\'instant</span>';
    out.innerHTML = s.out.map((l, i) => (fwd && p && i >= p.out.length ? `<span class="new">${esc(l)}</span>` : esc(l))).join('\n');
    out.scrollTop = out.scrollHeight;
    note.innerHTML = s.note || '';
    if (visual) visual(vis, s, progs[P], fwd); else vis.hidden = true;
    prev = k;
  };
  const pl = player($(el, '[data-pl]'), { count: () => S.length, show });
  const load = i => {
    P = i; S = progs[i].run(); prev = -1;
    code.innerHTML = codeHTML(progs[i].code);
    $$(el, '[data-p]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.p === i)));
    pl.stop(); pl.go(0);
  };
  $$(el, '[data-p]').forEach(b => { b.onclick = () => load(+b.dataset.p); });
  load(0);
}

/** Visuel par défaut : bandes de cases (listes, range) et drapeau. */
function stripVisual(box, s) {
  let h = '';
  (s.strips || []).forEach(st => {
    h += `<div class="vy-strip"><span class="vl">${esc(st.lab)}</span>${cellsHTML(st.items.map(x => (st.raw ? String(x) : pyr(x))), { cur: st.cur, cls: st.cls, top: st.top })}</div>`;
  });
  if (s.flag) h += `<div class="vy-flag${s.flag.up ? ' up' : ''}"><svg viewBox="0 0 26 30" aria-hidden="true"><line x1="4" y1="2" x2="4" y2="29" class="pole"/><path d="M5 22h17l-4 3.5 4 3.5H5z" class="cloth"/></svg><span>drapeau <b>${esc(s.flag.name)}</b> = ${esc(pyr(s.flag.val))}${s.flag.up ? ' : levé, la boucle va s\'arrêter' : ''}</span></div>`;
  if (s.cnt) h += `<div class="vy-cnt2">${s.cnt.map(([k, v]) => `<span>${k} : <b>${v}</b></span>`).join('')}</div>`;
  box.innerHTML = h; box.hidden = !h;
}

/* ------------------------------------------------------------------ py1 · boucles */
const FRUITS = ['poire', 'pomme', 'banane'];
function loopsViz(el) {
  const progs = [
    { label: '<code>while</code>', code: `
i = 1
while i <= 3:
    print(i)
    i += 1    # sinon : boucle infinie
print("fin, i =", i)`, run() {
      const r = recorder(); r.v.i = 1; r.st(1, 'On crée <code>i</code> et on l\'initialise à 1. Le <code>while</code> ne sait pas compter : c\'est à toi de gérer <code>i</code>.');
      for (;;) {
        const c = r.v.i <= 3;
        r.st(2, `Test <code>i &lt;= 3</code> : ${r.v.i} &lt;= 3 → ${TF(c)}${c ? ' : on exécute le corps de la boucle.' : ' : on sort de la boucle.'}`);
        if (!c) break;
        r.print(r.v.i); r.st(3, `Affiche ${r.v.i}.`);
        r.v.i += 1; r.st(4, `<code>i</code> passe à ${r.v.i}. Sans cette ligne, le test resterait toujours vrai.`);
      }
      r.print('fin, i =', r.v.i); r.st(5, 'Après la boucle, <code>i</code> vaut 4 : la première valeur qui a rendu le test faux.');
      return r.S;
    } },
    { label: '<code>for … range</code>', code: `
for i in range(1, 4, 1):
    print(i)
print("fin, i =", i)`, run() {
      const r = recorder(), it = [1, 2, 3], lab = 'range(1, 4, 1) →';
      r.st(1, '<code>range(1, 4, 1)</code> fournit 1, 2, 3 : le seuil 4 est <b>exclu</b>. Le nombre de tours est connu d\'avance.', { strips: [{ lab, items: it }] });
      it.forEach((x, k) => {
        r.v.i = x; r.st(1, `<code>i</code> prend la valeur suivante fournie par range : ${x}.`, { strips: [{ lab, items: it, cur: k }] });
        r.print(x); r.st(2, `Affiche ${x}.`, { strips: [{ lab, items: it, cur: k }] });
      });
      r.st(1, 'range est épuisé : la boucle s\'arrête (pas de test à écrire, pas de <code>i += 1</code>).', { strips: [{ lab, items: it, cls: ['ok', 'ok', 'ok'] }] });
      r.print('fin, i =', 3); r.st(3, 'Différence avec le <code>while</code> : après la boucle, <code>i</code> vaut 3, la dernière valeur fournie.', { strips: [{ lab, items: it, cls: ['ok', 'ok', 'ok'] }] });
      return r.S;
    } },
    { label: '<code>for elt in</code>', code: `
fruits = ["poire", "pomme", "banane"]
for fruit in fruits:
    print("une {} est un fruit".format(fruit))`, run() {
      const r = recorder(), lab = 'fruits';
      r.v.fruits = FRUITS; r.st(1, 'Une liste de 3 chaînes.', { strips: [{ lab, items: FRUITS, top: [0, 1, 2] }] });
      FRUITS.forEach((f, k) => {
        r.v.fruit = f; r.st(2, `Pythonesque : <code>fruit</code> reçoit directement l'élément « ${f} », sans indice.`, { strips: [{ lab, items: FRUITS, cur: k, top: [0, 1, 2] }] });
        r.print(`une ${f} est un fruit`); r.st(3, '<code>format</code> remplace <code>{}</code> par la valeur de <code>fruit</code>.', { strips: [{ lab, items: FRUITS, cur: k, top: [0, 1, 2] }] });
      });
      r.st(2, 'Plus d\'élément : fin. Pratique, mais interdit en style passe-partout (on y passe par les indices).', { strips: [{ lab, items: FRUITS, cls: ['ok', 'ok', 'ok'], top: [0, 1, 2] }] });
      return r.S;
    } },
    { label: '<code>enumerate</code>', code: `
fruits = ["poire", "pomme", "banane"]
for i, fruit in enumerate(fruits):
    print(i, fruit)`, run() {
      const r = recorder(), it = FRUITS.map((f, i) => `(${i}, '${f}')`), lab = 'enumerate →';
      r.v.fruits = FRUITS; r.st(1, 'Une liste de 3 chaînes.', { strips: [{ lab, items: it, raw: 1 }] });
      FRUITS.forEach((f, k) => {
        r.v.i = k; r.v.fruit = f; r.st(2, `<code>enumerate</code> fournit le couple (${k}, '${f}') : il est déballé dans <code>i</code> et <code>fruit</code>.`, { strips: [{ lab, items: it, cur: k, raw: 1 }] });
        r.print(k, f); r.st(3, `<code>print</code> sépare ses arguments par une espace.`, { strips: [{ lab, items: it, cur: k, raw: 1 }] });
      });
      r.st(2, 'Fin : on a eu l\'indice et l\'élément, sans écrire <code>fruits[i]</code>.', { strips: [{ lab, items: it, cls: ['ok', 'ok', 'ok'], raw: 1 }] });
      return r.S;
    } },
    { label: 'à l\'envers', code: `
y = [2, 6, "rouge"]
for i in range(len(y) - 1, -1, -1):
    print(i, y[i])`, run() {
      const r = recorder(), y = [2, 6, 'rouge'], rg = [2, 1, 0], lab = 'range(2, -1, -1) →';
      r.v.y = y; r.st(1, '<code>len(y) - 1</code> = 2 est le dernier indice valide.', { strips: [{ lab: 'y', items: y, top: [0, 1, 2] }, { lab, items: rg }] });
      rg.forEach((i, k) => {
        r.v.i = i; r.st(2, `Pas de −1 : <code>i</code> = ${i}. Le seuil −1 est exclu, donc on s'arrête bien à 0.`, { strips: [{ lab: 'y', items: y, cur: i, top: [0, 1, 2] }, { lab, items: rg, cur: k }] });
        r.print(i, y[i]); r.st(3, `<code>y[${i}]</code> vaut ${pyr(y[i])}.`, { strips: [{ lab: 'y', items: y, cur: i, top: [0, 1, 2] }, { lab, items: rg, cur: k }] });
      });
      r.st(2, 'Fin. Version pythonesque : <code>for elt in reversed(y)</code>.', { strips: [{ lab: 'y', items: y, top: [0, 1, 2], cls: ['ok', 'ok', 'ok'] }, { lab, items: rg, cls: ['ok', 'ok', 'ok'] }] });
      return r.S;
    } },
  ];
  tracer(el, { title: 'Pas-à-pas : while, for range, for elt', hint: 'Choisis une boucle, puis avance pas à pas (ou Lecture). Observe la ligne en cours, les variables qui changent et la sortie.', progs, visual: stripVisual });
}

/* ------------------------------------------------------------------ py3 · drapeau */
function flagViz(el) {
  const LIS = [1, 'rouge', pf(3.2), '2'];
  const rech = (cible) => ({
    label: `recherche(${pyr(cible)}, lis)`, code: `
def recherche(a_chercher, lis):
    i = 0
    indice = -1    # drapeau baissé
    while i < len(lis) and indice == -1:
        if lis[i] == a_chercher:
            indice = i
        else:
            i += 1
    return indice

lis = [1, "rouge", 3.2, "2"]
print(recherche(${pyr(cible).replace(/'/g, '"')}, lis))`, run() {
      const r = recorder(), lab = 'lis', top = [0, 1, 2, 3], eq = (a, b) => (a instanceof F ? a.x : a) === b;
      const vis = (cur, cls, up) => ({ strips: [{ lab, items: LIS, cur, cls, top }], flag: r.v.indice === undefined ? null : { name: 'indice', val: r.v.indice, up } });
      r.v.lis = LIS; r.st(11, 'Une liste qui mélange les types.', vis());
      r.v = { a_chercher: cible, lis: LIS }; r.st(12, `Appel : <code>a_chercher</code> = ${esc(pyr(cible))}, <code>lis</code> désigne la liste.`, vis());
      r.v.i = 0; r.st(2, 'On part de l\'indice 0.', vis());
      r.v.indice = -1; r.st(3, 'Drapeau baissé : −1 signifie « pas encore trouvé ».', vis());
      const cls = [];
      for (;;) {
        const c1 = r.v.i < 4, c2 = r.v.indice === -1;
        r.st(4, `Test : <code>i &lt; len(lis)</code> → ${TF(c1)} et <code>indice == -1</code> → ${TF(c2)}${c1 && c2 ? ' : on continue.' : ' : <b>on sort</b>.'}`, vis(c1 && c2 ? r.v.i : undefined, cls.slice(), !c2));
        if (!(c1 && c2)) break;
        const i = r.v.i, ok = eq(LIS[i], cible);
        cls[i] = ok ? 'ok' : 'ko';
        r.st(5, `<code>lis[${i}] == a_chercher</code> : ${esc(pyr(LIS[i]))} == ${esc(pyr(cible))} → ${TF(ok)}${!ok && typeof cible !== typeof LIS[i] && !(LIS[i] instanceof F) ? ' (une chaîne n\'est jamais égale à un entier)' : ''}`, vis(i, cls.slice()));
        if (ok) { r.v.indice = i; r.st(6, `Trouvé : on lève le drapeau, <code>indice</code> = ${i}.`, vis(i, cls.slice(), true)); }
        else { r.v.i++; r.st(8, `Pas trouvé : on avance, <code>i</code> = ${r.v.i}.`, vis(undefined, cls.slice())); }
      }
      const res = r.v.indice;
      r.st(9, `Un seul <code>return</code>, à la fin : on renvoie ${res}.`, vis(undefined, cls.slice(), res !== -1));
      r.v = { lis: LIS }; r.print(res); r.st(12, res === -1 ? 'Valeur absente : −1. On a parcouru toute la liste.' : `Résultat ${res} : on s'est arrêté dès la découverte, sans parcourir la suite.`, { strips: [{ lab, items: LIS, top, cls }] });
      return r.S;
    },
  });
  const tous = {
    label: 'tous_pairs([2, 4, 7])', code: `
def tous_pairs(lis):
    ok = True      # « pour tout »
    i = 0
    while i < len(lis) and ok:
        ok = lis[i] % 2 == 0
        i += 1
    return ok

print(tous_pairs([2, 4, 7]))`, run() {
      const r = recorder(), L = [2, 4, 7], top = [0, 1, 2], cls = [];
      const vis = (cur, up) => ({ strips: [{ lab: 'lis', items: L, cur, cls: cls.slice(), top }], flag: r.v.ok === undefined ? null : { name: 'ok', val: r.v.ok, up } });
      r.v = { lis: L }; r.st(9, 'Appel avec la liste [2, 4, 7].', vis());
      r.v.ok = true; r.st(2, 'Propriété universelle : le drapeau part de <code>True</code> (vrai pour la liste vide).', vis());
      r.v.i = 0; r.st(3, 'On part de l\'indice 0.', vis());
      for (;;) {
        const c1 = r.v.i < 3, c2 = r.v.ok;
        r.st(4, `Test : <code>i &lt; len(lis)</code> → ${TF(c1)} et <code>ok</code> → ${TF(c2)}${c1 && c2 ? ' : on continue.' : ' : <b>on sort</b>.'}`, vis(c1 && c2 ? r.v.i : undefined, !c2));
        if (!(c1 && c2)) break;
        const i = r.v.i; r.v.ok = L[i] % 2 === 0; cls[i] = r.v.ok ? 'ok' : 'ko';
        r.st(5, `<code>${L[i]} % 2 == 0</code> → ${TF(r.v.ok)}${r.v.ok ? '' : ' : un contre-exemple suffit.'}`, vis(i, !r.v.ok));
        r.v.i++; r.st(6, `<code>i</code> = ${r.v.i}.`, vis(undefined, !r.v.ok));
      }
      r.st(7, `On renvoie ${pyr(r.v.ok)}.`, vis(undefined, !r.v.ok));
      r.v = {}; r.print(false); r.st(9, '7 est impair : la propriété « tous pairs » est fausse.', { strips: [{ lab: 'lis', items: L, cls, top }] });
      return r.S;
    },
  };
  tracer(el, { title: 'Pas-à-pas : la technique du drapeau', hint: 'Suis la boucle while : elle s\'arrête dès que le drapeau se lève, sans return ni break dans la boucle.', progs: [rech('rouge'), rech(2), rech('2'), tous], visual: stripVisual });
}

/* ------------------------------------------------------------------ py4 · recherche 2D */
function search2dViz(el) {
  const T = [[1, 2, 1], [], [0, 5, 1], [-10]];
  const mk = val => ({
    label: `est_present(t, ${val})`, code: `
def est_present(lis2D, valeur):
    trouve = False
    i = 0
    while i < len(lis2D) and not trouve:
        j = 0
        while j < len(lis2D[i]) and not trouve:
            if lis2D[i][j] == valeur:
                trouve = True
            else:
                j += 1
        i += 1
    return trouve

t = [[1, 2, 1], [], [0, 5, 1], [-10]]
print(est_present(t, ${val}))`, run() {
      const r = recorder(), seen = new Set();
      const g = (ci, cj, hit) => ({ grid: { ci, cj, hit, seen: new Set(seen) }, flag: r.v.trouve === undefined ? null : { name: 'trouve', val: r.v.trouve, up: r.v.trouve } });
      r.v = { t: T }; r.st(14, 'Une liste de listes « irrégulière » : la ligne 1 est vide.', g());
      r.v = { lis2D: T, valeur: val }; r.st(15, `Appel avec <code>valeur</code> = ${val}.`, g());
      r.v.trouve = false; r.st(2, 'Recherche d\'existence : drapeau à <code>False</code>.', g());
      r.v.i = 0; r.st(3, 'Ligne 0.', g());
      for (;;) {
        const i = r.v.i, c = i < T.length && !r.v.trouve;
        r.st(4, `Boucle des lignes : <code>i &lt; len(lis2D)</code> → ${TF(i < T.length)}, <code>not trouve</code> → ${TF(!r.v.trouve)}${c ? '' : ' : <b>on sort</b>.'}`, g(c ? i : -1));
        if (!c) break;
        r.v.j = 0; r.st(5, `On repart de la colonne 0 dans la ligne ${i}.`, g(i));
        for (;;) {
          const j = r.v.j, cc = j < T[i].length && !r.v.trouve;
          r.st(6, `Boucle des colonnes : <code>j &lt; len(lis2D[${i}])</code> (${j} &lt; ${T[i].length}) → ${TF(j < T[i].length)}${!r.v.trouve ? '' : ', mais trouve est vrai'}${cc ? '' : ' : fin de cette ligne.'}`, g(i, cc ? j : -1));
          if (!cc) break;
          const ok = T[i][j] === val; seen.add(i + ',' + j);
          r.st(7, `<code>lis2D[${i}][${j}]</code> = ${T[i][j]} == ${val} → ${TF(ok)}`, g(i, j, ok));
          if (ok) { r.v.trouve = true; r.st(8, 'Trouvé : le drapeau se lève, les deux boucles vont s\'arrêter.', g(i, j, true)); }
          else { r.v.j++; r.st(10, `Colonne suivante : <code>j</code> = ${r.v.j}.`, g(i)); }
        }
        r.v.i++; r.st(11, `<code>i</code> = ${r.v.i} (exécuté même quand on a trouvé : sans conséquence).`, g());
      }
      const res = r.v.trouve;
      r.st(12, `On renvoie ${pyr(res)}.`, g());
      r.v = { t: T }; r.print(res); r.st(15, res ? 'Arrêt anticipé : les cases après le 5 n\'ont jamais été lues.' : 'Absent : toutes les cases ont été lues (7 comparaisons, la ligne vide n\'en coûte aucune).', g());
      return r.S;
    },
  });
  const visual = (box, s) => {
    const G = s.grid;
    box.innerHTML = `<div class="vy-g2">${T.map((row, i) => `<div class="gr${G.ci === i ? ' cur' : ''}"><span class="rl">ligne ${i}</span>${row.length ? row.map((x, j) => {
      const cls = G.ci === i && G.cj === j ? (G.hit ? 'ok' : 'cur') : G.seen.has(i + ',' + j) ? 'ko' : '';
      return `<span class="vy-cell ${cls}"><b>${x}</b></span>`;
    }).join('') : '<span class="vide">[ ] ligne vide</span>'}</div>`).join('')}</div>` + (s.flag ? `<div class="vy-flag${s.flag.up ? ' up' : ''}"><svg viewBox="0 0 26 30" aria-hidden="true"><line x1="4" y1="2" x2="4" y2="29" class="pole"/><path d="M5 22h17l-4 3.5 4 3.5H5z" class="cloth"/></svg><span>drapeau <b>trouve</b> = ${pyr(s.flag.val)}</span></div>` : '');
  };
  tracer(el, { title: 'Pas-à-pas : chercher dans une liste de listes', hint: 'Deux while imbriqués partagent le même drapeau. Compare la recherche de 5 (trouvé) et de 4 (absent).', progs: [mk(5), mk(4)], visual });
}

/* ------------------------------------------------------------------ py4 · tri par insertion */
function insertionViz(el) {
  const CODE = `
def insertion_dans_liste_triee(lis, val):
    lis.append(val)
    i = len(lis) - 2
    pos_trouve = False
    while i >= 0 and not pos_trouve:
        if lis[i] >= val:
            lis[i+1] = lis[i]
            i -= 1
        else:
            pos_trouve = True
    lis[i+1] = val

def tri_par_insertion(lis):
    res = []
    for elt in lis:
        insertion_dans_liste_triee(res, elt)
    return res

print(tri_par_insertion(LISTE))`;
  const mk = (L, label) => ({
    label, code: CODE.replace('LISTE', pyr(L)), run() {
      const r = recorder(), res = [];
      let cmp = 0, dec = 0, k = -1;
      const st = (l, note, hi = {}) => r.st(l, note, { bars: { res: res.slice(), src: L, k, ...hi }, cnt: [['comparaisons', cmp], ['décalages', dec]] });
      r.v = { lis: L }; st(19, `On trie ${L.length} valeurs.`);
      r.v.res = res; st(14, 'On construit une nouvelle liste <code>res</code>, toujours triée.');
      for (k = 0; k < L.length; k++) {
        const val = L[k];
        r.v = { lis: L, res: res.slice(), elt: val }; st(15, `Élément suivant : <code>elt</code> = ${val}.`);
        st(16, `On l'insère à sa place dans <code>res</code> (modifiée sur place).`);
        r.v = { val, lis: res.slice() };
        res.push(val); r.v.lis = res.slice(); st(2, `<code>append</code> : ${val} est d'abord mis en fin.`, { i: res.length - 1, mode: 'new' });
        let i = res.length - 2; r.v.i = i; st(3, `<code>i</code> = ${i} : l'élément juste avant.`, { i });
        let pos = false; r.v.pos_trouve = false; st(4, 'Drapeau baissé.', { i });
        for (;;) {
          const c = i >= 0 && !pos;
          st(5, `<code>i &gt;= 0</code> → ${TF(i >= 0)}, <code>not pos_trouve</code> → ${TF(!pos)}${c ? '' : ' : on sort.'}`, { i: i >= 0 ? i : undefined });
          if (!c) break;
          cmp++; const ge = res[i] >= val;
          st(6, `<code>lis[${i}] &gt;= val</code> : ${res[i]} &gt;= ${val} → ${TF(ge)}`, { i });
          if (ge) {
            res[i + 1] = res[i]; dec++; r.v.lis = res.slice(); st(7, `Décalage : ${res[i]} est recopié une case à droite (il apparaît deux fois pour l'instant).`, { i, j: i + 1 });
            i--; r.v.i = i; st(8, `<code>i</code> = ${i}.`, { i: i >= 0 ? i : undefined });
          } else { pos = true; r.v.pos_trouve = true; st(10, `${res[i]} &lt; ${val} : la place est juste après.`, { i }); }
        }
        res[i + 1] = val; r.v.lis = res.slice(); st(11, `On écrit ${val} à l'indice ${i + 1}.`, { j: i + 1, mode: 'put' });
      }
      k = L.length;
      r.v = { lis: L, res: res.slice() }; st(17, 'Tous les éléments sont insérés : <code>res</code> est triée.', { done: true });
      r.print(res); st(19, `${cmp} comparaisons pour n = ${L.length} : dans le pire cas (liste décroissante) n(n−1)/2 = ${L.length * (L.length - 1) / 2}, d'où O(n²). <code>sorted</code> (Timsort) fait O(n log n).`, { done: true });
      return r.S;
    },
  });
  const visual = (box, s) => {
    const B = s.bars, mx = Math.max(...B.src.map(Math.abs), 1), n = B.src.length;
    const bar = (v, c) => `<div class="vb ${c}" style="height:${Math.max(4, (Math.abs(v) / mx) * 125)}px"><span>${v}</span></div>`;
    const resb = Array.from({ length: n }, (_, i) => i < B.res.length ? bar(B.res[i], B.done ? 'done' : i === B.i ? 'i' : i === B.j ? (B.mode === 'put' ? 'cur' : 'j') : (B.mode === 'new' && i === B.i ? 'cur' : '')) : '<div class="vb ghost" style="height:4px"></div>').join('');
    box.innerHTML = `<div class="vy-strip"><span class="vl">lis</span>${cellsHTML(B.src.map(String), { cur: B.k < n ? B.k : undefined, cls: B.src.map((_, i) => (i < B.k ? 'dim' : '')) })}</div>
      <div><div class="vy-bars" aria-label="liste res">${resb}</div><div class="vy-barlab">${Array.from({ length: n }, (_, i) => `<span>${i}</span>`).join('')}</div></div>` +
      `<div class="vy-cnt2">${s.cnt.map(([k, v]) => `<span>${k} : <b>${v}</b></span>`).join('')}</div>`;
  };
  tracer(el, { title: 'Pas-à-pas : le tri par insertion', hint: 'Lance la lecture (vitesse max conseillée) : chaque valeur est ajoutée en fin, puis les plus grandes glissent d\'une case vers la droite.', progs: [mk([5, 2, 8, 1, 9, 3], '6 valeurs'), mk([6, 5, 4, 3, 2, 1], 'pire cas : décroissante'), mk([1, 2, 3, 4, 5, 6], 'meilleur cas : déjà triée'), mk([7, 3, 9, 10, 2, 1, 0, 5, 4, 11], 'liste du cours')], visual });
}

/* ------------------------------------------------------------------ py1 · Monte-Carlo */
function monteCarloViz(el) {
  const MAX = 20000, W = 300, M = 10, S = (W - 2 * M) / 2;
  const X = x => M + (x + 1) * S, Y = y => M + (1 - y) * S;
  el.innerHTML = head('π par Monte-Carlo, point par point', 'Lance la pluie de points : chaque point tombe uniformément dans le carré ; 4 × (points dans le disque) / (points tirés) s\'approche de π… lentement.') +
    `<div class="viz-ctrl"><div class="vy-play">
      <button type="button" class="btn small" data-a="reset" aria-label="Recommencer" title="Recommencer">⟲</button>
      <button type="button" class="btn small" data-a="one">+1 point</button>
      <button type="button" class="btn small primary" data-a="play">▶ Pluie</button>
      <button type="button" class="btn small" data-a="k">+1000</button>
      <label class="vy-speed">débit <input type="range" min="0" max="4" value="2" aria-label="points par image"></label></div></div>
    <div class="vy-mc"><div>${svg(W, W, `<rect x="${M}" y="${M}" width="${2 * S}" height="${2 * S}" fill="var(--paper-2)" stroke="var(--line-strong)"/>
      <circle cx="${X(0)}" cy="${Y(0)}" r="${S}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5"/>
      <line x1="${M}" x2="${W - M}" y1="${Y(0)}" y2="${Y(0)}" class="vz-grid"/><line y1="${M}" y2="${W - M}" x1="${X(0)}" x2="${X(0)}" class="vz-grid"/>
      <g data-g="pts"></g><g data-g="last"></g>
      <text x="${W - M - 4}" y="${Y(0) - 4}" class="vz-t vz-s" text-anchor="end">1</text><text x="${M + 3}" y="${Y(0) - 4}" class="vz-t vz-s">−1</text>`, 'Carré [-1,1]² et disque unité, avec les points tirés', 'vy-mcsq')}</div>
    <div class="vy-side"><div class="vy-kpis"><div><small>nb (tirés)</small><b data-o="nb">0</b></div><div><small>dc (dans le disque)</small><b data-o="dc" style="color:var(--c3)">0</b></div><div><small>4 * dc / nb</small><b data-o="pi" style="color:var(--accent)">–</b></div><div><small>écart à π</small><b data-o="err">–</b></div></div>
      <div class="vy-code" data-o="code">${codeHTML(`
x = random.uniform(-1, 1)
y = random.uniform(-1, 1)
if x*x + y*y <= 1:
    dc += 1
nb += 1
print(4 * dc / nb)`)}</div>
      <p class="vy-note" data-o="note">Clique sur <b>+1 point</b> pour suivre un tirage, ou lance la pluie.</p>
      <div data-o="chart"></div></div></div>`;
  const R = rng(2024);
  let nb = 0, dc = 0, playing = false, raf = 0, hist = [];
  const gP = $(el, '[data-g=pts]'), gL = $(el, '[data-g=last]');
  const NS = 'http://www.w3.org/2000/svg';
  const add = (k, detail) => {
    let din = '', dout = '', last = null;
    for (let t = 0; t < k && nb < MAX; t++) {
      const x = R() * 2 - 1, y = R() * 2 - 1, inn = x * x + y * y <= 1;
      nb++; if (inn) dc++;
      const sq = `M${X(x).toFixed(1)} ${Y(y).toFixed(1)}h2.4v2.4h-2.4z`;
      if (inn) din += sq; else dout += sq;
      last = { x, y, inn };
      if (nb <= 50 || nb % Math.max(1, Math.floor(nb / 200)) === 0) hist.push([nb, 4 * dc / nb]);
    }
    [[din, 'pin'], [dout, 'pout']].forEach(([d, c]) => { if (d) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', c); gP.appendChild(p); } });
    if (last) gL.innerHTML = `<circle cx="${X(last.x)}" cy="${Y(last.y)}" r="5" class="last ${last.inn ? 'pin' : 'pout'}" stroke="var(--paper)" stroke-width="1.5"/>`;
    ui(detail ? last : null);
  };
  const chart = () => {
    const w = 320, h = 150, L = 36, Rr = w - 8, T = 10, B = h - 24, lmax = Math.log10(MAX);
    const sx = n => L + (Math.log10(n) / lmax) * (Rr - L), sy = v => B - ((clamp(v, 2.2, 4.2) - 2.2) / 2) * (B - T);
    let g = `<path d="M${L},${T}V${B}H${Rr}" class="vz-axis"/>`;
    [[1, '1'], [10, '10'], [100, '100'], [1000, '10³'], [10000, '10⁴']].forEach(([n, t]) => { g += `<text x="${sx(n)}" y="${B + 14}" class="vz-t vz-s" text-anchor="middle">${t}</text>`; });
    [2.5, 3, 3.5, 4].forEach(v => { g += `<text x="${L - 4}" y="${sy(v) + 4}" class="vz-t vz-s" text-anchor="end">${fr(v, 1)}</text><line x1="${L}" x2="${Rr}" y1="${sy(v)}" y2="${sy(v)}" class="vz-grid"/>`; });
    g += `<line x1="${L}" x2="${Rr}" y1="${sy(Math.PI)}" y2="${sy(Math.PI)}" stroke="var(--good)" stroke-width="1.5" stroke-dasharray="6 4"/><text x="${Rr}" y="${sy(Math.PI) - 4}" class="vz-t vz-s" text-anchor="end" fill="var(--good)">π</text>`;
    if (hist.length) g += `<path d="${hist.map(([n, v], i) => `${i ? 'L' : 'M'}${sx(n).toFixed(1)},${sy(v).toFixed(1)}`).join('')}" fill="none" stroke="var(--accent)" stroke-width="2"/>`;
    g += `<text x="${(L + Rr) / 2}" y="${h - 1}" class="vz-t vz-s" text-anchor="middle">nb (échelle log)</text>`;
    $(el, '[data-o=chart]').innerHTML = svg(w, h, g, 'Estimation de π en fonction du nombre de points');
  };
  const ui = last => {
    $(el, '[data-o=nb]').textContent = nb.toLocaleString('fr-FR');
    $(el, '[data-o=dc]').textContent = dc.toLocaleString('fr-FR');
    $(el, '[data-o=pi]').textContent = nb ? (4 * dc / nb).toFixed(4) : '–';
    $(el, '[data-o=err]').textContent = nb ? (4 * dc / nb - Math.PI >= 0 ? '+' : '−') + Math.abs(4 * dc / nb - Math.PI).toFixed(4) : '–';
    $$(el, '[data-o=code] .vy-ln').forEach(n => n.classList.toggle('on', !!last && (n.dataset.l === '1' || n.dataset.l === '2' || (n.dataset.l === '4' && last.inn))));
    if (last) $(el, '[data-o=note]').innerHTML = `x = ${last.x.toFixed(3)}, y = ${last.y.toFixed(3)} : x*x + y*y = ${(last.x * last.x + last.y * last.y).toFixed(3)} ${last.inn ? '&lt;= 1 → <b class="yes">dans le disque</b>, dc augmente.' : '&gt; 1 → <b class="no">hors du disque</b>.'}`;
    else if (nb >= MAX) $(el, '[data-o=note]').innerHTML = `${MAX.toLocaleString('fr-FR')} points : l'erreur reste de l'ordre de 1/√nb ≈ ${fr(1 / Math.sqrt(nb), 3)}. Pour gagner une décimale, il faut 100 fois plus de points.`;
    else if (playing) $(el, '[data-o=note]').innerHTML = 'Observe la courbe : elle oscille autour de π et se resserre très lentement.';
    chart();
    $(el, '[data-a=play]').textContent = playing ? '❚❚ Pause' : '▶ Pluie';
  };
  const RATE = [1, 4, 15, 60, 250];
  const loop = () => {
    raf = 0;
    if (!el.isConnected || !playing) return;
    if (nb >= MAX) { playing = false; ui(); return; }
    add(RATE[+$(el, '.vy-speed input').value]);
    raf = requestAnimationFrame(loop);
  };
  $(el, '[data-a=play]').onclick = () => { playing = !playing; if (playing && !raf) raf = requestAnimationFrame(loop); ui(); };
  $(el, '[data-a=one]').onclick = () => { playing = false; add(1, true); };
  $(el, '[data-a=k]').onclick = () => { playing = false; add(1000); };
  $(el, '[data-a=reset]').onclick = () => { playing = false; nb = 0; dc = 0; hist = []; gP.innerHTML = ''; gL.innerHTML = ''; $(el, '[data-o=note]').innerHTML = 'Clique sur <b>+1 point</b> pour suivre un tirage, ou lance la pluie.'; ui(); };
  ui();
}

/* ------------------------------------------------------------------ py2 · indices et tranches */
function pySliceIdx(n, a, b, c) {
  if (c == null) c = 1;
  if (c === 0) return null;
  const out = [];
  if (c > 0) {
    const s = a == null ? 0 : a < 0 ? Math.max(a + n, 0) : Math.min(a, n), e = b == null ? n : b < 0 ? Math.max(b + n, 0) : Math.min(b, n);
    for (let i = s; i < e; i += c) out.push(i);
  } else {
    const s = a == null ? n - 1 : a < 0 ? Math.max(a + n, -1) : Math.min(a, n - 1), e = b == null ? -1 : b < 0 ? Math.max(b + n, -1) : Math.min(b, n - 1);
    for (let i = s; i > e; i += c) out.push(i);
  }
  return out;
}
function sliceViz(el) {
  const DATA = { lis: [6, 8, 9, 1, 2], ch: 'python'.split('') };
  const PRE = { lis: ['1:3', ':2', '3:', '-2:', '::2', '::-1', '4:1:-1', '1:100'], ch: ['1:4', ':2', '-3:', '::2', '::-1', '2:2'] };
  let nm = 'lis', pick = null;
  el.innerHTML = head('Indices et tranches', 'Tape une case pour voir ses deux indices, ou règle début:fin:pas (cases vides permises) : les éléments choisis s\'allument dans l\'ordre puis forment la tranche.') +
    `<div class="vy-chips" role="group" aria-label="Séquence"><button type="button" class="chip" data-n="lis"><code>lis = [6, 8, 9, 1, 2]</code></button><button type="button" class="chip" data-n="ch"><code>ch = "python"</code></button></div>
    <div class="vy-strip" data-o="boxes" style="gap:6px"></div>
    <div class="vy-sl-in"><span data-o="nm">lis</span>[<input data-i="a" inputmode="numeric" aria-label="début" placeholder="début">:<input data-i="b" inputmode="numeric" aria-label="fin" placeholder="fin">:<input data-i="c" inputmode="numeric" aria-label="pas" placeholder="pas">]</div>
    <div class="vy-chips" data-o="pre"></div>
    <div class="vy-res" data-o="res"></div><p class="viz-out" data-o="out"></p>`;
  const inA = $(el, '[data-i=a]'), inB = $(el, '[data-i=b]'), inC = $(el, '[data-i=c]');
  const num = s => (s.trim() === '' ? null : /^-?\d+$/.test(s.trim()) ? parseInt(s, 10) : NaN);
  const draw = () => {
    const L = DATA[nm], n = L.length, a = num(inA.value), b = num(inB.value), c = num(inC.value);
    $$(el, '[data-n]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.n === nm)));
    $(el, '[data-o=nm]').textContent = nm;
    $(el, '[data-o=pre]').innerHTML = PRE[nm].map(p => `<button type="button" class="chip" data-pre="${p}"><code>[${p}]</code></button>`).join('');
    $$(el, '[data-pre]').forEach(x => { x.onclick = () => { const [p, q, r] = x.dataset.pre.split(':'); inA.value = p; inB.value = q; inC.value = r ?? ''; pick = null; draw(); }; });
    const disp = v => (nm === 'ch' ? `'${v}'` : String(v));
    const out = $(el, '[data-o=out]'), res = $(el, '[data-o=res]');
    if (pick != null) {
      $(el, '[data-o=boxes]').innerHTML = cellsHTML(L.map(disp), { top: L.map((_, i) => i), bot: L.map((_, i) => i - n), cls: L.map((_, i) => (i === pick ? 'sel' : '')) });
      res.innerHTML = '';
      out.innerHTML = `<code>${nm}[${pick}]</code> = <code>${nm}[${pick - n}]</code> = <b>${esc(disp(L[pick]))}</b>. Indices valides : de 0 à ${n - 1} (ou de −1 à −${n}) ; <code>${nm}[${n}]</code> → <b class="no">IndexError</b>.`;
    } else if ([a, b, c].some(Number.isNaN)) { out.innerHTML = 'Entre des entiers (ou laisse vide).'; res.innerHTML = ''; }
    else {
      const idx = pySliceIdx(n, a, b, c);
      if (!idx) { out.innerHTML = '<b class="no">ValueError: slice step cannot be zero</b>'; res.innerHTML = ''; }
      else {
        const ord = {}; idx.forEach((i, k) => { ord[i] = k + 1; });
        $(el, '[data-o=boxes]').innerHTML = L.map((v, i) => `<span class="vy-cell ${ord[i] ? 'sel' : 'dim'}"><span class="ord">${ord[i] ? '#' + ord[i] : ''}</span><span class="ix">${i}</span><b>${esc(disp(v))}</b><span class="ix neg">${i - n}</span></span>`).join('');
        const val = nm === 'ch' ? `'${idx.map(i => L[i]).join('')}'` : '[' + idx.map(i => L[i]).join(', ') + ']';
        res.innerHTML = `<span class="vy-brk">${nm === 'ch' ? '\'' : '['}</span>` + idx.map((i, k) => `<span class="vy-cell"><b style="animation-delay:${reduced() ? 0 : k * 0.12}s">${esc(nm === 'ch' ? L[i] : String(L[i]))}</b></span>`).join('') + `<span class="vy-brk">${nm === 'ch' ? '\'' : ']'}</span>`;
        const st = c == null ? 1 : c;
        const txt = `${nm}[${inA.value.trim()}:${inB.value.trim()}${inC.value.trim() !== '' ? ':' + inC.value.trim() : ''}]`;
        out.innerHTML = `<code>${esc(txt)}</code> → <b>${esc(val)}</b>. Indices pris : ${idx.length ? idx.join(', ') : 'aucun'}. ` +
          (st > 0 ? `Pas ${st} : de gauche à droite, ${a == null ? 'début absent = 0' : `on part de ${a}${a < 0 ? ` (= ${n} ${a} = ${Math.max(a + n, 0)})` : ''}`} et ${b == null ? 'fin absente = jusqu\'au bout' : `on s'arrête <b>avant</b> ${b}${b > n ? ` (au-delà de len = ${n} : pas d'erreur, on s'arrête au bout)` : ''}`}.`
            : `Pas ${st} : de droite à gauche${a == null ? ', début absent = dernier élément' : ''}${b == null ? ', fin absente = jusqu\'au premier inclus' : `, fin ${b} exclue`}.`) +
          (idx.length === 0 ? ' Tranche vide : pas d\'erreur.' : '');
      }
    }
    $$(el, '[data-o=boxes] .vy-cell').forEach((x, i) => { x.style.cursor = 'pointer'; x.onclick = () => { pick = pick === i ? null : i; draw(); }; });
  };
  [inA, inB, inC].forEach(x => { x.oninput = () => { pick = null; draw(); }; });
  $$(el, '[data-n]').forEach(x => { x.onclick = () => { nm = x.dataset.n; pick = null; const [p, q] = PRE[nm][0].split(':'); inA.value = p; inB.value = q; inC.value = ''; draw(); }; });
  inA.value = '1'; inB.value = '3'; draw();
}

/* ------------------------------------------------------------------ py2 · alias et copie (diagramme mémoire) */
let UID = 0;
function aliasViz(el) {
  const uid = 'vy' + (++UID);
  // état : names [{n, y, to}], objs {id: {x, y, cells: [v | {ref}], hot, lbl}}
  const SC = [
    { label: 'alias ou copie ?', code: `
lis = [6, 8, 9]
alias = lis
copie = lis.copy()
lis[0] = 100
print(alias, copie)
print(alias is lis, copie is lis)`, states: [
      [1, 'Une liste est créée en mémoire ; le nom <code>lis</code> pointe vers elle.', { lis: 'A' }, { A: [6, 8, 9] }],
      [2, '<code>alias = lis</code> ne copie rien : une <b>deuxième flèche</b> vers le même objet.', { lis: 'A', alias: 'A' }, { A: [6, 8, 9] }],
      [3, '<code>.copy()</code> fabrique un <b>nouvel objet</b> (coût O(n)) ; <code>copie</code> pointe vers lui.', { lis: 'A', alias: 'A', copie: 'B' }, { A: [6, 8, 9], B: [6, 8, 9] }],
      [4, 'On modifie l\'objet pointé par <code>lis</code>… qui est aussi celui de <code>alias</code> !', { lis: 'A', alias: 'A', copie: 'B' }, { A: [100, 8, 9], B: [6, 8, 9] }, { A: 0 }, ['[100, 8, 9] [6, 8, 9]']],
      [5, '<code>alias</code> « a changé » sans qu\'on y touche ; <code>copie</code> est indépendante.', { lis: 'A', alias: 'A', copie: 'B' }, { A: [100, 8, 9], B: [6, 8, 9] }, {}, ['[100, 8, 9] [6, 8, 9]']],
      [6, '<code>is</code> teste si deux noms désignent le <b>même objet</b>.', { lis: 'A', alias: 'A', copie: 'B' }, { A: [100, 8, 9], B: [6, 8, 9] }, {}, ['[100, 8, 9] [6, 8, 9]', 'True False']],
    ], pos: { lis: 22, alias: 72, copie: 160, A: [150, 47], B: [150, 160] } },
    { label: '<code>[[0]*3]*3</code>', code: `
t = [[0] * 3] * 3
t[0][0] = 1
print(t)
t = [[0] * 3 for i in range(3)]
t[0][0] = 1
print(t)`, states: [
      [1, '<code>* 3</code> recopie 3 fois la <b>référence</b> vers la même ligne : 3 flèches, 1 seule ligne.', { t: 'O' }, { O: [{ ref: 'R' }, { ref: 'R' }, { ref: 'R' }], R: [0, 0, 0] }],
      [2, 'On modifie la ligne… vue 3 fois.', { t: 'O' }, { O: [{ ref: 'R' }, { ref: 'R' }, { ref: 'R' }], R: [1, 0, 0] }, { R: 0 }],
      [3, 'Le piège : les 3 « lignes » affichent le 1.', { t: 'O' }, { O: [{ ref: 'R' }, { ref: 'R' }, { ref: 'R' }], R: [1, 0, 0] }, {}, ['[[1, 0, 0], [1, 0, 0], [1, 0, 0]]']],
      [4, 'Compréhension : <code>[0] * 3</code> est réévalué à chaque tour, donc <b>3 lignes distinctes</b>. L\'ancien objet, plus référencé, sera libéré.', { t: 'P' }, { P: [{ ref: 'S1' }, { ref: 'S2' }, { ref: 'S3' }], S1: [0, 0, 0], S2: [0, 0, 0], S3: [0, 0, 0] }, {}, ['[[1, 0, 0], [1, 0, 0], [1, 0, 0]]']],
      [5, 'Seule la ligne 0 change.', { t: 'P' }, { P: [{ ref: 'S1' }, { ref: 'S2' }, { ref: 'S3' }], S1: [1, 0, 0], S2: [0, 0, 0], S3: [0, 0, 0] }, { S1: 0 }, ['[[1, 0, 0], [1, 0, 0], [1, 0, 0]]']],
      [6, 'Bonne façon : <code>[[0] * m for i in range(n)]</code>.', { t: 'P' }, { P: [{ ref: 'S1' }, { ref: 'S2' }, { ref: 'S3' }], S1: [1, 0, 0], S2: [0, 0, 0], S3: [0, 0, 0] }, {}, ['[[1, 0, 0], [1, 0, 0], [1, 0, 0]]', '[[1, 0, 0], [0, 0, 0], [0, 0, 0]]']],
    ], pos: { t: 22, O: [110, 10], R: [200, 110], P: [110, 10], S1: [200, 80], S2: [200, 135], S3: [200, 190] } },
    { label: '<code>a = a + …</code> ou <code>+=</code>', code: `
a = [1, 2]
b = a
a = a + [3]
print(a, b)
b += [4]
print(a, b)`, states: [
      [1, '<code>a</code> pointe vers une liste.', { a: 'X' }, { X: [1, 2] }],
      [2, 'Alias : <code>b</code> pointe vers la même liste.', { a: 'X', b: 'X' }, { X: [1, 2] }],
      [3, '<code>a + [3]</code> crée une <b>nouvelle</b> liste ; l\'affectation déplace la flèche de <code>a</code>. <code>b</code> n\'est pas touché.', { a: 'Y', b: 'X' }, { X: [1, 2], Y: [1, 2, 3] }],
      [4, 'Les deux noms ne désignent plus le même objet.', { a: 'Y', b: 'X' }, { X: [1, 2], Y: [1, 2, 3] }, {}, ['[1, 2, 3] [1, 2]']],
      [5, '<code>b += [4]</code> équivaut à <code>b.extend([4])</code> : modification <b>en place</b> de l\'objet de <code>b</code>.', { a: 'Y', b: 'X' }, { X: [1, 2, 4], Y: [1, 2, 3] }, { X: 2 }, ['[1, 2, 3] [1, 2]']],
      [6, 'Si un autre nom pointait vers cette liste, il verrait aussi le 4.', { a: 'Y', b: 'X' }, { X: [1, 2, 4], Y: [1, 2, 3] }, {}, ['[1, 2, 3] [1, 2]', '[1, 2, 3] [1, 2, 4]']],
    ], pos: { a: 30, b: 130, X: [150, 120], Y: [150, 20] } },
  ];
  const deref = (objs, id) => objs[id].map(c => (c && c.ref ? deref(objs, c.ref) : c));
  const progs = SC.map(sc => ({
    label: sc.label, code: sc.code, run: () => sc.states.map(([l, note, names, objs, hot = {}, out = []]) => ({
      l, note, out, v: Object.fromEntries(Object.entries(names).map(([n, id]) => [n, deref(objs, id)])), mem: { names, objs, hot, pos: sc.pos },
    })),
  }));
  const CW = 34, CH = 30;
  const visual = (box, s, prog, fwd) => {
    const { names, objs, hot, pos } = s.mem;
    let g = `<defs><marker id="${uid}a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="hd"/></marker><marker id="${uid}b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="hd2"/></marker></defs>`;
    const ids = Object.keys(objs);
    ids.forEach((id, k) => {
      const [x, y] = pos[id];
      g += `<text x="${x}" y="${y - 5}" class="idl">objet n°${k + 1}${objs[id].length ? '' : ''}</text>`;
      objs[id].forEach((c, i) => {
        g += `<rect x="${x + i * CW}" y="${y}" width="${CW}" height="${CH}" class="${hot[id] === i && fwd ? 'obj hot' : 'obj'}"/>`;
        if (c && c.ref) {
          const [tx, ty] = pos[c.ref], sx = x + i * CW + CW / 2, sy = y + CH / 2;
          g += `<circle cx="${sx}" cy="${sy}" r="3.5" class="hd2"/><path d="M${sx},${sy} C${sx},${sy + 40} ${tx - 40},${ty + CH / 2} ${tx - 2},${ty + CH / 2}" class="arr2" marker-end="url(#${uid}b)"/>`;
        } else g += `<text x="${x + i * CW + CW / 2}" y="${y + CH / 2}" class="val">${c}</text>`;
      });
    });
    Object.entries(names).forEach(([n, id]) => {
      const y = pos[n], [tx, ty] = pos[id];
      g += `<rect x="4" y="${y}" width="62" height="${CH}" rx="5" class="namebox"/><text x="35" y="${y + CH / 2}" class="name" text-anchor="middle" dominant-baseline="central">${n}</text>`;
      g += `<path d="M66,${y + CH / 2} C${(66 + tx) / 2},${y + CH / 2} ${(66 + tx) / 2},${ty + CH / 2} ${tx - 2},${ty + CH / 2}" class="arr" marker-end="url(#${uid}a)"/>`;
    });
    box.innerHTML = `<div class="vy-panel"><h5>Mémoire : noms → objets</h5>${svg(310, 230, g, 'Diagramme des références', 'vy-mem')}</div>`;
  };
  tracer(el, { title: 'Alias, copie et références', hint: 'Avance pas à pas : un nom n\'est qu\'une flèche vers un objet. Repère quand une flèche bouge et quand un objet change.', progs, visual });
}

/* ------------------------------------------------------------------ py2 · append, insert, extend, + */
function listOpsViz(el) {
  let id = 0;
  const mk = v => ({ id: ++id, v });
  let L = [3, 8, 10].map(mk), log = '';
  const OPS = [
    { c: 'lis.append(100)', f: () => { const e = mk(100); L.push(e); return { moved: [], add: [e.id], cost: 'o1', why: 'ajout en fin : rien à déplacer' }; } },
    { c: 'lis.insert(0, 300)', f: () => { const mv = L.map(e => e.id), e = mk(300); L.unshift(e); return { moved: mv, add: [e.id], cost: 'on', why: `insertion en tête : les ${mv.length} éléments glissent d'une case` }; } },
    { c: 'lis.insert(2, -5)', f: () => { const mv = L.slice(2).map(e => e.id), e = mk(-5); L.splice(Math.min(2, L.length), 0, e); return { moved: mv, add: [e.id], cost: 'on', why: `les ${mv.length} éléments après l'indice 2 glissent` }; } },
    { c: 'lis.extend([6, 9])', f: () => { const a = [mk(6), mk(9)]; L.push(...a); return { moved: [], add: a.map(e => e.id), cost: 'ok', why: 'O(k) : coût proportionnel aux k = 2 éléments ajoutés, pas à la longueur' }; } },
    { c: 'lis.append([4, 5])', f: () => { const e = mk([4, 5]); L.push(e); return { moved: [], add: [e.id], cost: 'o1', why: 'UN seul élément ajouté : la liste [4, 5] (comparer avec extend)' }; } },
    { c: 'lis = [300] + lis', f: () => { const mv = L.map(e => e.id); L = [mk(300), ...L.map(e => ({ ...e, id: e.id }))]; return { moved: mv, add: [L[0].id], cost: 'on', why: `+ fabrique une NOUVELLE liste : les ${mv.length} éléments sont recopiés` }; } },
    { c: 'lis.pop()', f: () => { L.pop(); return { moved: [], add: [], cost: 'o1', why: 'retrait en fin : rien à déplacer' }; } },
    { c: 'lis.pop(0)', f: () => { L.shift(); return { moved: L.map(e => e.id), add: [], cost: 'on', why: `retrait en tête : les ${L.length} éléments restants reculent` }; } },
  ];
  el.innerHTML = head('Construire une liste : qui coûte quoi ?', 'Applique des opérations à lis : les cases qui doivent bouger s\'allument en orange. Plus il y en a, plus l\'opération est chère.') +
    `<div class="vy-ops">${OPS.map((o, i) => `<button type="button" class="btn small" data-op="${i}">${esc(o.c)}</button>`).join('')}<button type="button" class="btn small" data-op="r" aria-label="Recommencer">⟲ lis = [3, 8, 10]</button></div>
    <div class="vy-lst" data-o="lst" aria-live="polite"></div>
    <div class="vy-row" style="align-items:center"><span data-o="badge"></span><span class="viz-out" data-o="why"></span></div>
    <div class="vy-codel" data-o="log"></div><pre class="vy-pre" data-o="po"></pre>`;
  const box = $(el, '[data-o=lst]');
  const render = (res) => {
    const before = {};
    $$(box, '.vy-cell').forEach(n => { before[n.dataset.id] = n.getBoundingClientRect(); });
    box.innerHTML = `<span class="vy-brk">[</span>` + L.map((e, i) => `<span class="vy-cell${res && res.add.includes(e.id) ? ' new' : ''}${res && res.moved.includes(e.id) ? ' mv' : ''}" data-id="${e.id}"><span class="ix">${i}</span><b>${esc(pyr(e.v))}</b></span>`).join('') + `<span class="vy-brk">]</span>`;
    if (!reduced()) $$(box, '.vy-cell').forEach(n => {
      const b = before[n.dataset.id], a = n.getBoundingClientRect();
      if (b) n.animate([{ transform: `translate(${b.left - a.left}px, ${b.top - a.top}px)` }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.3,1.2,.5,1)' });
      else n.animate([{ transform: 'translateY(-26px) scale(.5)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.3,1.4,.5,1)' });
    });
    $$(el, '[data-op]').forEach(b => { const o = OPS[+b.dataset.op]; if (o) b.disabled = (o.c.includes('pop') ? L.length === 0 : L.length >= 11); });
    $(el, '[data-o=log]').innerHTML = (log ? hl(log) + '\n' : '') + hl('print(lis, len(lis))');
    $(el, '[data-o=po]').textContent = `${pyr(L.map(e => e.v))} ${L.length}`;
  };
  $$(el, '[data-op]').forEach(b => {
    b.onclick = () => {
      if (b.dataset.op === 'r') { L = [3, 8, 10].map(mk); log = ''; $(el, '[data-o=badge]').innerHTML = ''; $(el, '[data-o=why]').textContent = ''; render(); return; }
      const o = OPS[+b.dataset.op], r = o.f();
      log = o.c;
      const lab = { o1: 'O(1)', on: 'O(n)', ok: 'O(k)' }[r.cost];
      $(el, '[data-o=badge]').innerHTML = `<span class="vy-badge ${r.cost}">${lab} · ${r.moved.length} déplacé${r.moved.length > 1 ? 's' : ''}</span>`;
      $(el, '[data-o=why]').innerHTML = `<code>${esc(o.c)}</code> : ${r.why}.${o.c.startsWith('lis.') && !o.c.includes('pop') ? ' La méthode modifie lis et renvoie <code>None</code>.' : ''}`;
      render(r);
    };
  });
  render();
}

/* ------------------------------------------------------------------ py2 · compréhension de liste */
function compViz(el) {
  const EX = [['2*i + 1', i => 2 * i + 1], ['i**2', i => i * i], ['i % 3', i => i % 3]];
  const FI = [['', null], ['i % 2 == 0', i => i % 2 === 0], ['i % 3 != 0', i => i % 3 !== 0]];
  let e = 0, f = 0, n = 6;
  el.innerHTML = head('Liste par compréhension, élément par élément', 'Choisis l\'expression, le filtre et n, puis lance : chaque i est testé, transformé, et rejoint (ou non) la liste. Le code déroulé est la version générique équivalente.') +
    `<div class="vy-q"><span class="qs">expression</span><div class="vy-chips" data-g="e">${EX.map((x, i) => `<button type="button" class="chip" data-v="${i}"><code>${x[0]}</code></button>`).join('')}</div>
     <span class="qs">filtre</span><div class="vy-chips" data-g="f">${FI.map((x, i) => `<button type="button" class="chip" data-v="${i}">${x[0] ? `<code>if ${x[0]}</code>` : 'sans filtre'}</button>`).join('')}</div>
     <div class="viz-ctrl"><label>n = <b data-o="n">6</b> <input type="range" min="1" max="12" value="6" aria-label="n"></label></div></div>
    <div class="vy-expr" data-o="expr"></div><div data-tr></div>`;
  const build = () => {
    $$(el, '[data-g=e] .chip').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === e)));
    $$(el, '[data-g=f] .chip').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === f)));
    $(el, '[data-o=n]').textContent = n;
    const [es, ef] = EX[e], [fs, ff] = FI[f];
    const comp = `[${es} for i in range(${n})${fs ? ' if ' + fs : ''}]`;
    const code = `
res = []
for i in range(${n}):
${fs ? `    if ${fs}:\n        res.append(${es})` : `    res.append(${es})`}
print(res)
print(res == ${comp})`;
    const L = { for: 2, if: 3, app: fs ? 4 : 3, p1: fs ? 5 : 4, p2: fs ? 6 : 5 };
    const run = () => {
      const r = recorder(), res = [], it = Array.from({ length: n }, (_, i) => i), cls = [];
      const st = (l, note, ph, cur) => r.st(l, note, { comp: { ph, cur, res: res.slice(), cls: cls.slice(), it } });
      r.v.res = []; st(1, 'On part d\'une liste vide.', '', undefined);
      it.forEach(i => {
        r.v.i = i; st(L.for, `<code>i</code> = ${i}.`, 'for', i);
        let ok = true;
        if (ff) { ok = ff(i); cls[i] = ok ? 'ok' : 'ko'; st(L.if, `Filtre <code>${esc(fs)}</code> pour i = ${i} → ${TF(ok)}${ok ? '' : ' : i est ignoré.'}`, 'if', i); }
        if (ok) { const v = ef(i); res.push(v); cls[i] = 'ok'; r.v.res = res.slice(); st(L.app, `On calcule <code>${esc(es)}</code> = ${v} et on l'ajoute.`, 'expr', i); }
      });
      r.print(res); st(L.p1, `${res.length} élément${res.length > 1 ? 's' : ''} sur ${n} valeurs de i.`, 'end');
      r.print(true); st(L.p2, 'La compréhension décrit la même liste en une ligne.', 'end');
      return r.S;
    };
    $(el, '[data-o=expr]').innerHTML = `res = [<span data-p="expr">${esc(es)}</span> <span data-p="for">for i in range(${n})</span>${fs ? ` <span data-p="if">if ${esc(fs)}</span>` : ''}]`;
    tracer($(el, '[data-tr]'), { progs: [{ label: '', code, run }], visual: (box, s) => {
      const C = s.comp;
      $$(el, '[data-o=expr] [data-p]').forEach(x => x.classList.toggle('hl', x.dataset.p === C.ph));
      box.innerHTML = `<div class="vy-pipe"><div class="lane"><span class="vl">range(${n})</span>${cellsHTML(C.it.map(String), { cur: C.cur, cls: C.it.map(i => (C.cls[i] === 'ko' ? 'ko' : C.cls[i] === 'ok' ? 'ok' : '')) })}</div>
        <div class="lane vy-res"><span class="vl">res</span><span class="vy-brk">[</span>${C.res.map((v, k) => `<span class="vy-cell"><b${k === C.res.length - 1 && C.ph === 'expr' ? '' : ' style="animation:none"'}>${v}</b></span>`).join('')}<span class="vy-brk">]</span></div></div>`;
    } });
  };
  $$(el, '[data-g] .chip').forEach(b => { b.onclick = () => { if (b.parentNode.dataset.g === 'e') e = +b.dataset.v; else f = +b.dataset.v; build(); }; });
  $(el, 'input[type=range]').oninput = ev => { n = +ev.target.value; build(); };
  build();
}

/* ------------------------------------------------------------------ py3 · complexité */
function complexityViz(el) {
  const CUR = [
    { k: 'O(1)', f: () => 1, c: 'var(--c3)', ex: 'lis[i], len, append' },
    { k: 'O(n)', f: n => n, c: 'var(--c1)', ex: 'parcours, sum, x in liste, insert' },
    { k: 'O(n log n)', f: n => n * Math.log2(Math.max(n, 1)), c: 'var(--c4)', ex: 'sorted, sort (Timsort)' },
    { k: 'O(n²)', f: n => n * n, c: 'var(--c2)', ex: 'tri par insertion, 2 boucles imbriquées' },
  ];
  const NS = [10, 100, 1000, 10000, 100000, 1000000];
  let ni = 1, shown = 1, logY = false, raf = 0;
  el.innerHTML = head('Complexité : comment le coût grandit avec n', 'Fais grandir n : à n = 10 tout se vaut, à n = 1 000 000 le quadratique devient impraticable. Hypothèse : 10 ns par opération élémentaire.') +
    `<div class="viz-ctrl"><label>n = <b data-o="n"></b> <input type="range" min="0" max="5" value="1" aria-label="taille n (échelle log)"></label>
      <label><input type="checkbox" data-i="log"> axe vertical logarithmique</label></div>
    <div data-o="ch"></div><div class="vy-scroll"><table class="vy-tbl" data-o="tb"></table></div><p class="viz-out" data-o="out"></p>`;
  const tfmt = s => (s < 1e-6 ? fr(s * 1e9, 0) + ' ns' : s < 1e-3 ? fr(s * 1e6, 1) + ' µs' : s < 1 ? fr(s * 1e3, 1) + ' ms' : s < 120 ? fr(s, 1) + ' s' : s < 7200 ? fr(s / 60, 0) + ' min' : fr(s / 3600, 1) + ' h');
  const draw = N => {
    const w = 340, h = 210, L = 46, R = w - 10, T = 12, B = h - 28;
    const ymax = logY ? Math.log10(N * N) : N * N;
    const sx = x => L + (x / N) * (R - L), sy = v => B - ((logY ? Math.log10(Math.max(v, 1)) : v) / ymax) * (B - T);
    let g = `<path d="M${L},${T}V${B}H${R}" class="vz-axis"/>`;
    const labs = [];
    CUR.forEach(c => {
      let d = '';
      for (let t = 0; t <= 80; t++) { const x = Math.max(1, (t / 80) * N); d += `${t ? 'L' : 'M'}${sx(x).toFixed(1)},${clamp(sy(c.f(x)), T - 4, B).toFixed(1)}`; }
      g += `<path d="${d}" fill="none" stroke="${c.c}" stroke-width="2.5"/>`;
      labs.push([clamp(sy(c.f(N)), T + 10, B) - 4, c]);
    });
    labs.sort((a, b) => b[0] - a[0]);
    let prev = Infinity;
    labs.forEach(([y, c]) => { y = Math.min(y, prev - 13); prev = y; g += `<text x="${R - 2}" y="${y}" class="vz-t vz-s" text-anchor="end" style="fill:${c.c};paint-order:stroke;stroke:var(--paper);stroke-width:3px">${c.k}</text>`; });
    g += `<text x="${(L + R) / 2}" y="${h - 4}" class="vz-t vz-s" text-anchor="middle">n (de 1 à ${Math.round(N).toLocaleString('fr-FR')})</text><text x="${L - 6}" y="${T + 4}" class="vz-t vz-s" text-anchor="end">${logY ? '10^' + Math.round(ymax) : 'n²'}</text><text x="${L - 6}" y="${B}" class="vz-t vz-s" text-anchor="end">${logY ? '1' : '0'}</text>`;
    $(el, '[data-o=ch]').innerHTML = svg(w, h, g, 'Nombre d\'opérations en fonction de n');
  };
  const table = () => {
    const N = NS[ni];
    $(el, '[data-o=n]').textContent = N.toLocaleString('fr-FR');
    $(el, '[data-o=tb]').innerHTML = `<tr><th>coût · exemples du cours</th><th>opérations</th><th>temps</th></tr>` + CUR.map(c => { const v = c.f(N); return `<tr><td><span class="sw" style="background:${c.c}"></span><b>${c.k}</b><br><small style="font-family:var(--f-body);color:var(--muted)">${c.ex}</small></td><td style="white-space:nowrap">${v < 1e7 ? Math.round(v).toLocaleString('fr-FR') : v.toExponential(1).replace('.', ',').replace(/e\+(\d+)/, (m, e) => ' × 10<sup>' + e + '</sup>')}</td><td style="white-space:nowrap">${tfmt(v * 1e-8)}</td></tr>`; }).join('');
    const r = (N * N) / (N * Math.log2(N));
    $(el, '[data-o=out]').innerHTML = `À n = ${N.toLocaleString('fr-FR')}, le tri par insertion fait environ <b>${r < 1000 ? fr(r, 0) : Math.round(r).toLocaleString('fr-FR')} fois</b> plus d'opérations que Timsort. Doubler n double le coût linéaire mais <b>quadruple</b> le coût quadratique.`;
  };
  const anim = () => {
    cancelAnimationFrame(raf);
    const from = Math.log10(shown), to = Math.log10(NS[ni]), t0 = performance.now(), D = reduced() ? 0 : 500;
    const stepf = now => {
      if (!el.isConnected) return;
      const t = D ? clamp((now - t0) / D, 0, 1) : 1, e = 1 - (1 - t) ** 3;
      shown = 10 ** (from + (to - from) * e); draw(shown);
      if (t < 1) raf = requestAnimationFrame(stepf);
    };
    raf = requestAnimationFrame(stepf);
  };
  $(el, 'input[type=range]').oninput = e => { ni = +e.target.value; table(); anim(); };
  $(el, '[data-i=log]').onchange = e => { logY = e.target.checked; draw(shown); };
  shown = NS[ni]; table(); draw(shown);
}

/* ------------------------------------------------------------------ py4 · dictionnaire de comptage */
function dictViz(el) {
  const TXT = {
    cours: 'Beautiful is better than ugly. Simple is better than complex. Now is better than never.',
    zen: 'Beautiful is better than ugly.\nExplicit is better than implicit.\nSimple is better than complex.\nComplex is better than complicated.\nFlat is better than nested.\nSparse is better than dense.\nReadability counts.',
  };
  let tk = 'cours';
  el.innerHTML = head('Compter les mots avec un dictionnaire', 'Lance la lecture : chaque mot du texte rejoint le dictionnaire (nouvelle clé en vert, sinon le compteur augmente). À la fin, sorted(…, key=itemgetter(1), reverse=True) réordonne les entrées.') +
    `<div class="vy-chips" data-g="t"><button type="button" class="chip" data-t="cours">texte du cours (3 phrases)</button><button type="button" class="chip" data-t="zen">début du Zen of Python</button></div><div data-tr></div>`;
  const build = () => {
    $$(el, '[data-t]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === tk)));
    const text = TXT[tk], mots = text.split(/\W+/).filter(Boolean);
    const runner = dd => () => {
      const r = recorder(), D = new Map();
      const snap = (w, extra = {}) => ({ dic: { e: [...D.entries()], w, order: extra.order, hit: extra.hit, nw: extra.nw } });
      const dv = () => dct([...D.entries()], dd);
      r.v.dico = dv(); r.st(1, dd ? '<code>defaultdict(int)</code> : une clé absente vaut automatiquement <code>int()</code> = 0. (<code>mots</code> : la liste des mots du texte.)' : 'Un dictionnaire vide <code>{}</code>. (<code>mots</code> est la liste des mots du texte, obtenue avec <code>re.split</code> comme dans le cours.)', snap(-1));
      mots.forEach((m, w) => {
        const low = m.toLowerCase();
        if (dd) {
          r.v.mot = m; r.st(2, `<code>mot</code> = '${m}'.`, snap(w));
          const isNew = !D.has(low); D.set(low, (D.get(low) || 0) + 1); r.v.dico = dv();
          r.st(3, isNew ? `'${low}' absent : créé à 0 puis +1, sans test.` : `'${low}' passe à ${D.get(low)}.`, snap(w, isNew ? { nw: low } : { hit: low }));
        } else {
          r.v.mot = m; r.st(2, `<code>mot</code> = '${m}'.`, snap(w));
          r.v.mot = low; r.st(3, m === low ? 'Déjà en minuscules.' : `'${m}' → '${low}' : sinon « Beautiful » et « beautiful » compteraient séparément.`, snap(w));
          const has = D.has(low);
          r.st(4, `<code>'${low}' in dico</code> → ${TF(has)} (test sur les <b>clés</b>, en O(1)).`, snap(w));
          if (has) { D.set(low, D.get(low) + 1); r.v.dico = dv(); r.st(5, `Compteur de '${low}' : ${D.get(low)}.`, snap(w, { hit: low })); }
          else { D.set(low, 1); r.v.dico = dv(); r.st(7, `Nouvelle clé '${low}' avec la valeur 1.`, snap(w, { nw: low })); }
        }
      });
      const L0 = dd ? 4 : 8;
      const tri = [...D.entries()].map((e, i) => [e, i]).sort((a, b) => b[0][1] - a[0][1] || a[1] - b[1]).map(x => x[0]);
      delete r.v.mot;
      r.v.tri = tri.map(([k, v]) => tup(k, v));
      r.st(L0, '<code>items()</code> donne les couples (mot, compte) ; <code>itemgetter(1)</code> trie sur le compte, <code>reverse=True</code> en décroissant. Le tri est <b>stable</b> : à égalité, l\'ordre d\'insertion est conservé.', { dic: { e: [...D.entries()], w: mots.length, order: tri.map(e => e[0]) } });
      r.print(tri.slice(0, 4).map(([k, v]) => tup(k, v)));
      r.st(L0 + 1, 'Les 4 mots les plus fréquents.', { dic: { e: [...D.entries()], w: mots.length, order: tri.map(e => e[0]) } });
      return r.S;
    };
    const visual = (box, s) => {
      const D = s.dic;
      if (!box.dataset.tk || box.dataset.tk !== tk + text.length) {
        box.dataset.tk = tk + text.length;
        let w = 0;
        box.innerHTML = `<div class="vy-txt">${text.split(/(\W+)/).map(p => (/\w/.test(p) ? `<span data-w="${w++}">${esc(p)}</span>` : esc(p).replace(/\n/g, '<br>'))).join('')}</div><div class="vy-dict" aria-label="dictionnaire"></div>`;
      }
      $$(box, '[data-w]').forEach(n => { const i = +n.dataset.w; n.className = i === D.w ? 'cur' : i < D.w ? 'done' : ''; });
      const dic = $(box, '.vy-dict'), mx = Math.max(1, ...D.e.map(e => e[1])), order = D.order || D.e.map(e => e[0]), H = 30;
      dic.style.height = D.e.length * H + 'px';
      const have = new Map($$(dic, '.ent').map(n => [n.dataset.k, n]));
      have.forEach((n, k) => { if (!D.e.some(e => e[0] === k)) n.remove(); });
      D.e.forEach(([k, v]) => {
        let n = have.get(k);
        if (!n) { n = document.createElement('div'); n.className = 'ent'; n.dataset.k = k; n.innerHTML = `<span class="k">'${esc(k)}'</span><b></b><span><i class="db" style="display:block;width:0"></i></span>`; n.style.position = 'absolute'; n.style.left = '0'; n.style.right = '0'; n.style.transform = `translateY(${order.indexOf(k) * H}px)`; dic.appendChild(n); }
        n.style.transform = `translateY(${order.indexOf(k) * H}px)`;
        $(n, 'b').textContent = v;
        $(n, '.db').style.width = (100 * v) / mx + '%';
        n.classList.toggle('new', D.nw === k);
        n.classList.remove('hit'); if (D.hit === k || D.nw === k) { void n.offsetWidth; n.classList.add('hit'); }
      });
    };
    tracer($(el, '[data-tr]'), { progs: [
      { label: 'if mot in dico … else', code: `
dico = {}
for mot in mots:
    mot = mot.lower()
    if mot in dico:
        dico[mot] += 1
    else:
        dico[mot] = 1
tri = sorted(dico.items(), key=itemgetter(1), reverse=True)
print(tri[:4])`, run: runner(false) },
      { label: 'defaultdict(int)', code: `
dico = defaultdict(int)
for mot in mots:
    dico[mot.lower()] += 1
tri = sorted(dico.items(), key=itemgetter(1), reverse=True)
print(tri[:4])`, run: runner(true) },
    ], visual });
  };
  $$(el, '[data-t]').forEach(b => { b.onclick = () => { tk = b.dataset.t; build(); }; });
  build();
}

/* ------------------------------------------------------------------ py4 · code de César */
function cesarViz(el) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const TP = 'Nd qjpn gdnzu xz hznnvbz vgjmn qjpn vqzu yzxjyz gz ozsoz à xjhkmziymz';
  let d = 3, sel = 0;
  const C = 150, R1 = 128, R2 = 98, step = 360 / 26;
  const pos = (i, r) => { const a = (i * step - 90) * Math.PI / 180; return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
  let outer = `<circle cx="${C}" cy="${C}" r="${R1 + 15}" class="rg"/><circle cx="${C}" cy="${C}" r="${(R1 + R2) / 2}" class="rg"/>`;
  for (let i = 0; i < 26; i++) { const [x, y] = pos(i, R1); outer += `<circle cx="${x}" cy="${y}" r="12" fill="transparent" data-l="${i}" style="cursor:pointer"/><text x="${x}" y="${y}" class="lo" data-t="${i}" style="pointer-events:none">${A[i]}</text>`; }
  let inner = `<circle cx="${C}" cy="${C}" r="${R2 - 15}" class="rg"/>`;
  for (let i = 0; i < 26; i++) { const [x, y] = pos(i, R2); inner += `<text x="${x}" y="${y}" class="li" transform="rotate(${i * step} ${x} ${y})">${A[i].toLowerCase()}</text>`; }
  el.innerHTML = head('Code de César : la roue de décalage', 'Tourne la roue avec d : chaque lettre (anneau extérieur) est remplacée par celle d rangs plus loin (anneau intérieur). Tape une lettre de la roue pour voir le calcul.') +
    `<div class="viz-ctrl"><label>d = <b data-o="d"></b> <input type="range" min="-25" max="25" value="3" aria-label="décalage d"></label>
      <button type="button" class="btn small" data-a="neg">d → −d (décoder)</button></div>
    <div class="vy-row"><div style="flex:1 1 240px;max-width:330px;margin:0 auto">${svg(300, 300, `<g class="vy-wheel">${outer}<path d="" class="hilo" data-o="hl"/><g class="inner" data-o="inner" style="transform-origin:${C}px ${C}px">${inner}</g><text x="${C}" y="${C - 6}" text-anchor="middle" style="font:700 30px var(--f-mono);fill:var(--ink)" data-o="ctr"></text><text x="${C}" y="${C + 24}" text-anchor="middle" class="vz-t" data-o="ctr2"></text><path d="M${C - 7},${C - R1 - 26} L${C + 7},${C - R1 - 26} L${C},${C - R1 - 16}z" class="ptr"/></g>`, 'Roue de César', 'vy-wheel')}</div>
    <div class="vy-ces" style="flex:1 1 260px">
      <div class="vy-chips"><button type="button" class="chip" data-x="ave">« Ave Caesar ! »</button><button type="button" class="chip" data-x="tp">message du TP</button></div>
      <label class="qs" for="${'ces' + (++UID)}" style="font-size:13px;color:var(--muted)">texte</label><textarea id="${'ces' + UID}" spellcheck="false">Ave Caesar !</textarea>
      <div class="vy-codel" data-o="call" style="font-size:11px;padding:8px"></div>
      <div class="outt" data-o="out" aria-live="polite"></div>
      <p class="viz-out" data-o="calc"></p></div></div>`;
  const ta = $(el, 'textarea'), rg = $(el, 'input[type=range]');
  const sh = (c, k) => { const u = c >= 'A' && c <= 'Z', l = c >= 'a' && c <= 'z'; if (!u && !l) return c; const b = u ? 65 : 97; return String.fromCharCode(((c.charCodeAt(0) - b + k) % 26 + 26) % 26 + b); };
  let rot = 0;
  const draw = (anim = true) => {
    $(el, '[data-o=d]').textContent = d;
    // rotation la plus courte vers -d·step
    const target = -d * step; let delta = ((target - rot) % 360 + 540) % 360 - 180; rot += delta;
    const g = $(el, '[data-o=inner]'); g.style.transition = anim && !reduced() ? '' : 'none'; g.style.transform = `rotate(${rot}deg)`;
    const k = ((sel % 26) + 26) % 26, a0 = (k * step - 90 - step / 2) * Math.PI / 180, a1 = (k * step - 90 + step / 2) * Math.PI / 180, ro = R1 + 15, ri = R2 - 15;
    $(el, '[data-o=hl]').setAttribute('d', `M${C + ro * Math.cos(a0)},${C + ro * Math.sin(a0)} A${ro},${ro} 0 0 1 ${C + ro * Math.cos(a1)},${C + ro * Math.sin(a1)} L${C + ri * Math.cos(a1)},${C + ri * Math.sin(a1)} A${ri},${ri} 0 0 0 ${C + ri * Math.cos(a0)},${C + ri * Math.sin(a0)}z`);
    const txt = ta.value, out = [...txt].map(c => sh(c, d));
    $(el, '[data-o=call]').innerHTML = hl('codage_par_substitution(texte,') + '\n' + hl(`  cree_dictionnaire_codage_par_decalage(${d}))`);
    $(el, '[data-o=out]').innerHTML = out.map((c, i) => `<span style="animation-delay:${reduced() ? 0 : Math.min(i, 60) * 0.012}s">${esc(c)}</span>`).join('');
    const j = (((k + d) % 26) + 26) % 26;
    $(el, '[data-o=ctr]').textContent = `${A[k]} → ${A[j]}`;
    $(el, '[data-o=ctr2]').textContent = `d = ${d}`;
    $(el, '[data-o=calc]').innerHTML = `${A[k]} est à l'indice ${k} : <code>(${k} + ${d < 0 ? '(' + d + ')' : d}) % 26 = ${j}</code> → <b>${A[j]}</b>. Le modulo rend l'alphabet circulaire${d < 0 ? ' ; en Python, % reste entre 0 et 25 même si la somme est négative' : ''}. Les caractères hors de l'alphabet (espaces, ponctuation, « à ») ne sont pas dans le dictionnaire : ils sont recopiés tels quels.`;
  };
  rg.oninput = () => { d = +rg.value; draw(); };
  ta.oninput = () => draw(false);
  $(el, '[data-a=neg]').onclick = () => { d = -d; rg.value = d; ta.value = $(el, '[data-o=out]').textContent; draw(); };
  $(el, '[data-x=ave]').onclick = () => { ta.value = 'Ave Caesar !'; d = 3; rg.value = 3; draw(); };
  $(el, '[data-x=tp]').onclick = () => { ta.value = TP; d = 5; rg.value = 5; sel = 13; draw(); };
  $$(el, '[data-l]').forEach(n => { n.onclick = () => { sel = +n.dataset.l; draw(false); }; });
  draw(false);
}

/* ------------------------------------------------------------------ py4 · Sudoku par retour arrière */
function sudokuViz(el) {
  const PZ = {
    '4×4': '..../..43/3..2/.2..',
    '9×9 facile': '..3.2.6../9..3.5..1/..18.64../..81.29../7.......8/..67.82../..26.95../8..2.3..9/..5.1.3..',
    '9×9 coriace': '53..7..../6..195.../.98....6./8...6...3/4..8.3..1/7...2...6/.6....28./...419..5/....8..79',
  };
  let key = '4×4';
  el.innerHTML = head('Sudoku : la résolution par retour arrière', 'Lance la résolution : chaque case vide reçoit le premier chiffre possible ; en cas d\'impasse on revient en arrière (rouge) et on essaie le chiffre suivant.') +
    `<div class="vy-chips">${Object.keys(PZ).map(k => `<button type="button" class="chip" data-k="${k}">${k}</button>`).join('')}</div>
    <div class="viz-ctrl"><div class="vy-play"><button type="button" class="btn small" data-a="reset" aria-label="Recommencer" title="Recommencer">⟲</button><button type="button" class="btn small" data-a="step">Pas ▶</button><button type="button" class="btn small primary" data-a="play">▶ Résoudre</button>
      <label class="vy-speed">vitesse <input type="range" min="0" max="5" value="2" aria-label="vitesse"></label></div></div>
    <div class="vy-row"><div style="flex:1 1 260px" data-o="grid"></div><div class="vy-side" style="flex:1 1 280px"><div class="vy-cnt2" data-o="cnt"></div><p class="vy-note" data-o="note"></p><div class="vy-code" data-o="code"></div></div></div>`;
  let N, B, T, G, gen, cells, tries, undos, lvl, done, playing = false, raf = 0, acc = 0, last = 0, lastEv = null;
  const codeFor = n => `
def resolution(t, niveau=0):
    if niveau == ${n * n}:
        afficher(t)
    else:
        i, j = niveau // ${n}, niveau % ${n}
        if t[i][j] is None:
            for elt in range(1, ${n + 1}):
                if possible(t, i, j, elt):   # ligne, colonne, bloc
                    t[i][j] = elt
                    resolution(t, niveau + 1)
                    t[i][j] = None
        else:
            resolution(t, niveau + 1)`;
  const ok = (i, j, d) => { for (let k = 0; k < N; k++) if (T[i][k] === d || T[k][j] === d) return false; const bi = Math.floor(i / B) * B, bj = Math.floor(j / B) * B; for (let a = bi; a < bi + B; a++) for (let c = bj; c < bj + B; c++) if (T[a][c] === d) return false; return true; };
  function* solve(l) {
    if (l === N * N) { yield { t: 'done' }; return true; }
    const i = Math.floor(l / N), j = l % N;
    if (T[i][j] != null) return yield* solve(l + 1);
    for (let d = 1; d <= N; d++) if (ok(i, j, d)) {
      T[i][j] = d; yield { t: 'try', i, j, d, l };
      if (yield* solve(l + 1)) return true;
      T[i][j] = null; yield { t: 'undo', i, j, d, l };
    }
    return false;
  }
  const reset = () => {
    const P = PZ[key].split('/').map(r => [...r].map(c => (c === '.' ? null : +c)));
    N = P.length; B = Math.sqrt(N); T = P.map(r => r.slice()); G = P.map(r => r.map(x => x != null));
    gen = solve(0); lastEv = null; tries = 0; undos = 0; lvl = 0; done = false; playing = false;
    $$(el, '[data-k]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === key)));
    const g = $(el, '[data-o=grid]');
    g.innerHTML = `<div class="vy-sdk" style="grid-template-columns:repeat(${N},1fr);font-size:${N === 4 ? 26 : 16}px">${Array.from({ length: N * N }, (_, k) => { const i = Math.floor(k / N), j = k % N; return `<span class="${G[i][j] ? 'g' : ''}${j % B === B - 1 && j < N - 1 ? ' bR' : ''}${i % B === B - 1 && i < N - 1 ? ' bB' : ''}">${T[i][j] ?? ''}</span>`; }).join('')}</div>`;
    cells = $$(g, 'span');
    $(el, '[data-o=code]').innerHTML = codeHTML(codeFor(N));
    ui(null);
  };
  const ui = ev => {
    $(el, '[data-o=cnt]').innerHTML = `<span>niveau : <b>${lvl}</b> / ${N * N}</span><span>chiffres posés : <b>${tries}</b></span><span>retours arrière : <b>${undos}</b></span>`;
    const L = ev ? { try: 10, undo: 12, done: 4 }[ev.t] : 0;
    $$(el, '[data-o=code] .vy-ln').forEach(n => n.classList.toggle('on', +n.dataset.l === L));
    const note = $(el, '[data-o=note]');
    if (!ev) note.innerHTML = 'Les cases sont numérotées de 0 à ' + (N * N - 1) + ' ligne par ligne : <code>niveau</code> = numéro de la case.';
    else if (ev.t === 'try') note.innerHTML = `Case (${ev.i}, ${ev.j}) : ${ev.d} n'est ni dans la ligne, ni dans la colonne, ni dans le bloc → on le pose et on passe à la case suivante.`;
    else if (ev.t === 'undo') note.innerHTML = `Impasse plus loin : on efface ${ev.d} en (${ev.i}, ${ev.j}) et on essaie le chiffre suivant.`;
    else note.innerHTML = `<b class="yes">Grille complète !</b> ${tries} chiffres posés, ${undos} effacés. Pas la méthode d'un humain, mais l'ordinateur calcule vite. (La fonction du cours continue ensuite pour chercher d'autres solutions.)`;
    $(el, '[data-a=play]').textContent = playing ? '❚❚ Pause' : done ? '⟲ Rejouer' : '▶ Résoudre';
    $(el, '[data-a=step]').disabled = done;
  };
  const adv = () => {
    const r = gen.next(); if (r.done) { done = true; return null; }
    const ev = r.value; lastEv = ev;
    cells.forEach(c => c.classList.remove('cur', 'back'));
    if (ev.t === 'done') { done = true; playing = false; cells.forEach((c, k) => { if (!G[Math.floor(k / N)][k % N]) c.classList.add('win'); }); return ev; }
    const c = cells[ev.i * N + ev.j];
    if (ev.t === 'try') { tries++; c.textContent = ev.d; c.className = c.className.replace(/\b(p|back|win)\b/g, '') + ' p cur'; lvl = ev.l + 1; }
    else { undos++; c.textContent = ''; c.classList.remove('p'); c.classList.add('back'); lvl = ev.l; }
    return ev;
  };
  const RATE = [0.15, 0.4, 1, 4, 25, 200];
  const loop = now => {
    raf = 0;
    if (!el.isConnected || !playing) return;
    acc += RATE[+$(el, '.vy-speed input').value] * Math.min(4, (now - last) / 16.7); last = now;
    let ev = null;
    while (acc >= 1 && !done) { ev = adv() || ev; acc--; }
    if (ev) ui(ev);
    if (done) { playing = false; ui({ t: 'done' }); return; }
    raf = requestAnimationFrame(loop);
  };
  $(el, '[data-a=play]').onclick = () => {
    if (done) reset();
    playing = !playing; acc = 1; last = performance.now();
    if (playing && !raf) raf = requestAnimationFrame(loop);
    ui(lastEv);
  };
  $(el, '[data-a=step]').onclick = () => { playing = false; const ev = adv(); ui(ev || { t: 'done' }); };
  $(el, '[data-a=reset]').onclick = reset;
  $$(el, '[data-k]').forEach(b => { b.onclick = () => { key = b.dataset.k; reset(); }; });
  reset();
}

/* ------------------------------------------------------------------ sorties exactes (générées avec NumPy / Pandas) */
const OUT = {"axis": {"T.sum.None": "372.5","T.sum.0": "[65.5 71.5 77.  81.5 77. ]","T.sum.1": "[105.  125.  142.5]","T.mean.None": "24.833333333333332","T.mean.0": "[21.83333333 23.83333333 25.66666667 27.16666667 25.66666667]","T.mean.1": "[21.  25.  28.5]","T.max.None": "31.0","T.max.0": "[25.  27.  29.5 31.  30. ]","T.max.1": "[23.  27.5 31. ]","T.min.None": "18.5","T.min.0": "[18.5 20.  21.5 23.  22. ]","T.min.1": "[18.5 22.  25. ]","T.argmax.None": "13","T.argmax.0": "[2 2 2 2 2]","T.argmax.1": "[3 3 3]","pluie.sum.None": "14.0","pluie.sum.0": "[1.  2.5 3.5 4.  3. ]","pluie.sum.1": "[7.5 4.5 2. ]","pluie.mean.None": "0.9333333333333333","pluie.mean.0": "[0.33333333 0.83333333 1.16666667 1.33333333 1.        ]","pluie.mean.1": "[1.5 0.9 0.4]","pluie.max.None": "4.0","pluie.max.0": "[1.  2.5 3.5 4.  2. ]","pluie.max.1": "[4.  3.5 2. ]","pluie.min.None": "0.0","pluie.min.0": "[0. 0. 0. 0. 0.]","pluie.min.1": "[0. 0. 0.]","pluie.argmax.None": "3","pluie.argmax.0": "[1 0 1 0 2]","pluie.argmax.1": "[3 2 4]"},"loc": {"loc[1]": "x    30\nName: 1, dtype: int64","iloc[1]": "x    20\nName: 2, dtype: int64","loc[0]": "x    40\nName: 0, dtype: int64","iloc[0]": "x    10\nName: 3, dtype: int64","loc[-1]": "KeyError: -1","iloc[-1]": "x    40\nName: 0, dtype: int64","loc[3:1]": "    x\n3  10\n2  20\n1  30","iloc[3:1]": "Empty DataFrame\nColumns: [x]\nIndex: []","loc[0:2]": "Empty DataFrame\nColumns: [x]\nIndex: []","iloc[0:2]": "    x\n3  10\n2  20","loc[1:3]": "Empty DataFrame\nColumns: [x]\nIndex: []","iloc[1:3]": "    x\n2  20\n1  30","loc[[0, 2]]": "    x\n0  40\n2  20","iloc[[0, 2]]": "    x\n3  10\n1  30"},"gb": {"sum": "groupe\nA    32\nB    24\nC    31\nName: score, dtype: int64","mean": "groupe\nA    16.0\nB    12.0\nC    15.5\nName: score, dtype: float64","max": "groupe\nA    18\nB    13\nC    16\nName: score, dtype: int64","min": "groupe\nA    14\nB    11\nC    15\nName: score, dtype: int64","size": "groupe\nA    2\nB    2\nC    2\ndtype: int64"},"pv": {"mean": "type_velo  Cargo  Electrique  Ville\nstation                            \nAntigone     NaN         NaN   10.8\nComedie     18.7         NaN    7.7\nGare        21.5        14.3    8.4","size": "type_velo  Cargo  Electrique  Ville\nstation                            \nAntigone       0           0      1\nComedie        1           0      1\nGare           1           1      1"},"nan": {"loc": "    station   type_velo  duree_min  prix_eur  satisfaction\n0      Gare       Ville       46.0       8.4           5.0\n1   Comedie       Cargo        NaN      18.7           4.0\n2      Gare  Electrique       38.0      14.3           NaN\n3  Antigone       Ville       72.0      10.8           2.0\n4   Comedie       Ville       25.0       7.7           3.0\n5      Gare       Cargo       61.0      21.5           NaN","isna": "   station  type_velo  duree_min  prix_eur  satisfaction\n0    False      False      False     False         False\n1    False      False       True     False         False\n2    False      False      False     False          True\n3    False      False      False     False         False\n4    False      False      False     False         False\n5    False      False      False     False          True","isnasum": "station         0\ntype_velo       0\nduree_min       1\nprix_eur        0\nsatisfaction    2\ndtype: int64","fill0": "    station   type_velo  duree_min  prix_eur  satisfaction\n0      Gare       Ville       46.0       8.4           5.0\n1   Comedie       Cargo        NaN      18.7           4.0\n2      Gare  Electrique       38.0      14.3           0.0\n3  Antigone       Ville       72.0      10.8           2.0\n4   Comedie       Ville       25.0       7.7           3.0\n5      Gare       Cargo       61.0      21.5           0.0","fillmean": "    station   type_velo  duree_min  prix_eur  satisfaction\n0      Gare       Ville       46.0       8.4           5.0\n1   Comedie       Cargo       48.4      18.7           4.0\n2      Gare  Electrique       38.0      14.3           3.5\n3  Antigone       Ville       72.0      10.8           2.0\n4   Comedie       Ville       25.0       7.7           3.0\n5      Gare       Cargo       61.0      21.5           3.5","ffill": "    station   type_velo  duree_min  prix_eur  satisfaction\n0      Gare       Ville       46.0       8.4           5.0\n1   Comedie       Cargo       46.0      18.7           4.0\n2      Gare  Electrique       38.0      14.3           4.0\n3  Antigone       Ville       72.0      10.8           2.0\n4   Comedie       Ville       25.0       7.7           3.0\n5      Gare       Cargo       61.0      21.5           3.0","dropna": "    station type_velo  duree_min  prix_eur  satisfaction\n0      Gare     Ville       46.0       8.4           5.0\n3  Antigone     Ville       72.0      10.8           2.0\n4   Comedie     Ville       25.0       7.7           3.0","dropsub": "    station   type_velo  duree_min  prix_eur  satisfaction\n0      Gare       Ville       46.0       8.4           5.0\n2      Gare  Electrique       38.0      14.3           NaN\n3  Antigone       Ville       72.0      10.8           2.0\n4   Comedie       Ville       25.0       7.7           3.0\n5      Gare       Cargo       61.0      21.5           NaN","dropcol": "    station   type_velo  prix_eur\n0      Gare       Ville       8.4\n1   Comedie       Cargo      18.7\n2      Gare  Electrique      14.3\n3  Antigone       Ville      10.8\n4   Comedie       Ville       7.7\n5      Gare       Cargo      21.5"}};

/* ------------------------------------------------------------------ NumPy : affichage façon print(ndarray) */
function npFloat(vals) {
  const s = vals.map(v => { const t = String(v); return t.includes('.') ? t : t + '.'; });
  const ip = s.map(t => t.split('.')[0]), fp = s.map(t => t.split('.')[1]);
  const L = Math.max(...ip.map(x => x.length)), R = Math.max(...fp.map(x => x.length));
  return s.map((_, i) => ip[i].padStart(L) + '.' + fp[i].padEnd(R));
}
function npPrint(A, kind = 'f') {
  const is2 = Array.isArray(A[0]), flat = is2 ? A.flat() : A;
  if (!flat.length) return '[]';
  let cells = kind === 'b' ? flat.map(b => (b ? 'True' : 'False')) : kind === 'i' ? flat.map(String) : npFloat(flat);
  const W = kind === 'b' ? 5 : Math.max(...cells.map(c => c.length));
  if (kind !== 'f') cells = cells.map(c => c.padStart(W));
  if (!is2) return '[' + cells.join(' ') + ']';
  const m = A[0].length;
  return '[' + A.map((_, i) => '[' + cells.slice(i * m, i * m + m).join(' ') + ']').join('\n ') + ']';
}
const pyFloat = x => (Number.isInteger(x) ? x + '.0' : String(x));

const TEMP = [[18.5, 20.0, 21.5, 23.0, 22.0], [22.0, 24.5, 26.0, 27.5, 25.0], [25.0, 27.0, 29.5, 31.0, 30.0]];
const PLUIE = [[0.0, 2.5, 0.0, 4.0, 1.0], [1.0, 0.0, 3.5, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0, 2.0]];
const JOURS = ['lun', 'mar', 'mer', 'jeu', 'ven'];
const n1 = x => (Number.isInteger(x) ? x.toFixed(1) : String(x));

/* ------------------------------------------------------------------ d1 · axis */
function axisViz(el) {
  const DS = { T: { A: TEMP, rows: ['Lille', 'Lyon', 'Montp.'] }, pluie: { A: PLUIE, rows: ['ville 1', 'ville 2', 'ville 3'] } };
  const FN = {
    sum: a => a.reduce((s, x) => s + x, 0), mean: a => a.reduce((s, x) => s + x, 0) / a.length,
    max: a => Math.max(...a), min: a => Math.min(...a), argmax: a => a.indexOf(Math.max(...a)),
  };
  let ds = 'T', fn = 'mean', ax = '1', timers = [];
  el.innerHTML = head('NumPy : le paramètre axis', 'Choisis une fonction et un axe : les cases glissent le long de l\'axe qui disparaît et se fondent dans le résultat.') +
    `<div class="vy-q"><div class="vy-chips" data-g="ds"><button type="button" class="chip" data-v="T">T (températures)</button><button type="button" class="chip" data-v="pluie">pluie</button></div>
     <div class="vy-chips" data-g="fn">${Object.keys(FN).map(f => `<button type="button" class="chip" data-v="${f}"><code>${f}</code></button>`).join('')}</div>
     <div class="vy-chips" data-g="ax"><button type="button" class="chip" data-v="None">sans axis</button><button type="button" class="chip" data-v="0"><code>axis=0</code> ↓</button><button type="button" class="chip" data-v="1"><code>axis=1</code> →</button></div></div>
    <div class="vy-codel" data-o="code"></div><div class="vy-scroll"><div class="vy-tab" data-o="tab"></div></div>
    <div class="vy-shape" data-o="shape"></div><pre class="vy-pre" data-o="out"></pre><p class="viz-out" data-o="txt"></p>`;
  const run = () => {
    timers.forEach(clearTimeout); timers = [];
    ['ds', 'fn', 'ax'].forEach(g => $$(el, `[data-g=${g}] .chip`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === { ds, fn, ax }[g]))));
    const { A, rows } = DS[ds], nm = ds, axn = ax === 'None' ? null : +ax;
    const call = fn === 'argmax' ? `np.argmax(${nm}${axn == null ? '' : ', axis=' + axn})` : `${nm}.${fn}(${axn == null ? '' : 'axis=' + axn})`;
    $(el, '[data-o=code]').innerHTML = hl(`print(${call})`);
    let res;
    if (axn === 0) res = A[0].map((_, j) => FN[fn](A.map(r => r[j])));
    else if (axn === 1) res = A.map(r => FN[fn](r));
    else res = [FN[fn](A.flat())];
    const show = v => (fn === 'argmax' ? String(v) : Number.isInteger(v) ? String(v) : fr(v, 2).replace(',', '.').replace(/0$/, ''));
    // grille : en-têtes + données + emplacements du résultat
    const cols = A[0].length + 1 + (axn === 1 || axn == null ? 1 : 0);
    let h = `<span class="c h"></span>${JOURS.map(j => `<span class="c h">${j}</span>`).join('')}${axn === 1 ? '<span class="c h" title="résultat">→ rés.</span>' : axn == null ? '<span class="c h"></span>' : ''}`;
    A.forEach((r, i) => {
      h += `<span class="c vl">${rows[i]}</span>` + r.map((x, j) => `<span class="c" data-c="${i},${j}">${n1(x)}</span>`).join('');
      if (axn === 1) h += `<span class="c r" data-r="${i}" style="opacity:0">${show(res[i])}</span>`;
      else if (axn == null) h += i === 1 ? `<span class="c r" data-r="0" style="opacity:0">${show(res[0])}</span>` : '<span class="c h"></span>';
    });
    if (axn === 0) h += `<span class="c h" title="résultat">↓ rés.</span>${res.map((v, j) => `<span class="c r" data-r="${j}" style="opacity:0">${show(v)}</span>`).join('')}`;
    const tab = $(el, '[data-o=tab]');
    tab.style.gridTemplateColumns = `auto repeat(${cols - 1}, minmax(40px, auto))`;
    tab.innerHTML = h;
    $(el, '[data-o=shape]').innerHTML = `<span>forme de ${nm}</span><span class="d"><i>3</i><i>5</i></span><span>${axn == null ? 'sans axis' : 'axis=' + axn}</span><span class="d">${axn == null ? '<i class="ko">tout disparaît</i>' : axn === 0 ? '<i class="ko">3</i><i>5</i>' : '<i>3</i><i class="ko">5</i>'}</span><span>résultat</span><span class="d">${axn == null ? '<i>un nombre</i>' : axn === 0 ? '<i>(5,)</i>' : '<i>(3,)</i>'}</span>`;
    const outS = OUT.axis[`${nm}.${fn}.${axn == null ? 'None' : axn}`];
    $(el, '[data-o=out]').textContent = outS;
    const what = { sum: 'somme', mean: 'moyenne', max: 'maximum', min: 'minimum', argmax: 'position du maximum' }[fn];
    $(el, '[data-o=txt]').innerHTML = axn == null ? `Sans axis : la ${what} de <b>tous</b> les éléments${fn === 'argmax' ? ' (indice dans le tableau aplati, ligne après ligne : 3 × 5 = 15 cases)' : ''}.`
      : axn === 0 ? `<code>axis=0</code> : on descend le long des lignes ; l'axe des villes disparaît → une ${what} <b>par jour</b>${fn === 'argmax' ? ' = l\'indice de la ville' : ''}.`
        : `<code>axis=1</code> : on avance le long de chaque ligne ; l'axe des jours disparaît → une ${what} <b>par ville</b>${fn === 'argmax' ? ' = l\'indice du jour' : ''}.`;
    // animation : chaque case vole vers sa case résultat
    const target = (i, j) => $(tab, `[data-r="${axn === 0 ? j : axn === 1 ? i : 0}"]`);
    const R = reduced();
    $$(tab, '[data-c]').forEach(c => {
      const [i, j] = c.dataset.c.split(',').map(Number), t = target(i, j);
      if (R || !c.animate) return;
      const a = c.getBoundingClientRect(), b = t.getBoundingClientRect(), k = axn === 0 ? i : axn === 1 ? j : i * 5 + j;
      const tr = `translate(${b.left - a.left}px, ${b.top - a.top}px)`;
      c.animate([{ transform: 'none', opacity: 1 }, { transform: tr + ' scale(.7)', opacity: 0.2, offset: 0.85 }, { transform: tr + ' scale(.5)', opacity: 0 }], { duration: 700, delay: 150 + k * (axn == null ? 35 : 110), easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' })
        .finished.then(an => { an.cancel(); if (c.isConnected) c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 }); }).catch(() => {});
    });
    const delay = R ? 0 : 150 + (axn === 0 ? 2 : axn === 1 ? 4 : 14) * (axn == null ? 35 : 110) + 650;
    timers.push(setTimeout(() => {
      $$(tab, '[data-r]').forEach((c, k) => { if (R || !c.animate) c.style.opacity = 1; else { c.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 400, delay: k * 60, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'backwards' }); c.style.opacity = 1; } });
      if (fn === 'argmax') {
        if (axn === 0) res.forEach((ri, j) => $(tab, `[data-c="${ri},${j}"]`).classList.add('hi'));
        else if (axn === 1) res.forEach((cj, i) => $(tab, `[data-c="${i},${cj}"]`).classList.add('hi'));
        else { const k = res[0]; $(tab, `[data-c="${Math.floor(k / 5)},${k % 5}"]`).classList.add('hi'); }
      }
    }, delay));
  };
  ['ds', 'fn', 'ax'].forEach(g => $$(el, `[data-g=${g}] .chip`).forEach(b => { b.onclick = () => { if (g === 'ds') ds = b.dataset.v; else if (g === 'fn') fn = b.dataset.v; else ax = b.dataset.v; run(); }; }));
  run();
}

/* ------------------------------------------------------------------ d1 · broadcasting */
function broadcastViz(el) {
  const COR = [-0.5, 0.0, 0.5, -1.0, 0.0];
  const CASES = [
    { lab: '<code>T + 5</code>', code: 'T + 5', A: TEMP, B: [[5]], bs: [], bShape: '()', note: 'Un nombre est un tableau de forme () : il est diffusé sur les 15 cases.' },
    { lab: '(3, 5) + (5,)', code: 'T + corrections', A: TEMP, B: [COR], bs: [5], bShape: '(5,)', note: 'Le vecteur des corrections (une par jour) est répété sur chaque ligne.' },
    { lab: '(3, 5) + (3, 1)', code: 'T + np.array([[1.0], [2.0], [3.0]])', A: TEMP, B: [[1], [2], [3]], bs: [3, 1], bShape: '(3, 1)', note: 'La colonne (une valeur par ville) est répétée sur chaque colonne.' },
    { lab: '(3, 1) + (4,)', code: 'np.array([[0], [10], [20]]) + np.array([1, 2, 3, 4])', A: [[0], [10], [20]], B: [[1, 2, 3, 4]], bs: [4], bShape: '(4,)', note: 'Les <b>deux</b> tableaux sont étirés : résultat (3, 4), une table d\'addition.' },
    { lab: '(3, 5) + (3,) ✗', code: 'T + np.array([1.0, 2.0, 3.0])', A: TEMP, B: [[1, 2, 3]], bs: [3], bShape: '(3,)', err: true, note: 'Alignées par la droite, les dimensions 5 et 3 sont différentes et aucune ne vaut 1 : erreur. Il faut une colonne (3, 1) : <code>v.reshape(-1, 1)</code>.' },
  ];
  let ci = 1;
  el.innerHTML = head('Le broadcasting, étape par étape', 'Choisis un cas puis avance : on aligne les formes par la droite, on étire les dimensions égales à 1, puis on calcule case par case.') +
    `<div class="vy-chips">${CASES.map((c, i) => `<button type="button" class="chip" data-c="${i}">${c.lab}</button>`).join('')}</div><div data-pl></div>
    <div class="vy-codel" data-o="code"></div><div data-o="shape"></div><div class="vy-scroll"><div class="vy-row" data-o="st"></div></div><p class="vy-note" data-o="note"></p>`;
  const shp = a => [a.length, a[0].length];
  const show = k => {
    const c = CASES[ci];
    $$(el, '[data-c]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.c === ci)));
    $(el, '[data-o=code]').innerHTML = hl(c.code);
    const [ar, ac] = shp(c.A), bs = c.bs, as = c.A === TEMP ? [3, 5] : [3, 1];
    // alignement par la droite
    const bPad = bs.length === 2 ? bs : bs.length === 1 ? [1, bs[0]] : [1, 1];
    const rr = Math.max(as[0], bPad[0]), rc = c.err ? null : Math.max(as[1], bPad[1]);
    const dim = (x, other, pad, stage) => {
      if (stage < 1) return `<i${pad ? ' class="pad"' : ''}>${pad && stage < 1 ? '' : x}</i>`;
      if (x === other) return `<i class="ok">${x}</i>`;
      if (x === 1) return `<i class="st${pad ? ' pad' : ''}">${x}→${other}</i>`;
      if (other === 1) return `<i class="ok">${x}</i>`;
      return `<i class="ko">${x}</i>`;
    };
    const padB = i => bs.length < 2 && (bs.length === 0 || i === 0);
    $(el, '[data-o=shape]').innerHTML = `<div class="vy-shape"><span>A</span><span class="d">${dim(as[0], bPad[0], false, k)}${dim(as[1], bPad[1], false, k)}</span>
      <span>B ${c.bShape}</span><span class="d">${k < 1 ? (bs.length === 2 ? `<i>${bs[0]}</i><i>${bs[1]}</i>` : bs.length === 1 ? `<i class="pad"></i><i>${bs[0]}</i>` : '<i class="pad"></i><i class="pad"></i>') : [0, 1].map(i => dim(bPad[i], as[i], padB(i), k)).join('')}</span>
      <span>résultat</span><span class="d">${k < 1 ? '<i>?</i><i>?</i>' : c.err ? `<i>${rr}</i><i class="ko">✗</i>` : `<i>${rr}</i><i>${rc}</i>`}</span></div>`;
    const grid = (M, R, C, stretch, cls) => {
      // M réel (r × c), étiré virtuellement vers R × C : cases fantômes pour les copies
      const r = M.length, cc = M[0].length;
      let h = `<div class="vy-tab" style="grid-template-columns:repeat(${stretch ? C : cc}, minmax(38px, auto))">`;
      for (let i = 0; i < (stretch ? R : r); i++) for (let j = 0; j < (stretch ? C : cc); j++) {
        const real = i < r && j < cc, v = M[i % r][j % cc];
        h += `<span class="c ${real ? cls : 'ghost'}"${!real && !reduced() ? ` style="animation:vy-pop .4s ${(i + j) * 0.05}s both"` : ''}>${n1(v)}</span>`;
      }
      return h + '</div>';
    };
    let st = '';
    const stretch = k >= 2 && !c.err;
    st += `<div><div class="vz-t vz-s" style="font-size:12px;color:var(--muted)">A</div>${grid(c.A, rr, rc, stretch, '')}</div><span class="vy-op">+</span>`;
    st += `<div><div style="font-size:12px;color:var(--muted)">B</div>${grid(c.B, rr, rc, stretch, 'hi')}</div>`;
    if (k >= 3 && !c.err) {
      let h = `<div class="vy-tab" style="grid-template-columns:repeat(${rc}, minmax(38px, auto))">`;
      for (let i = 0; i < rr; i++) for (let j = 0; j < rc; j++) {
        const v = c.A[i % c.A.length][j % c.A[0].length] + c.B[i % c.B.length][j % c.B[0].length];
        h += `<span class="c yes"${reduced() ? '' : ` style="animation:vy-pop .4s ${(i * rc + j) * 0.04}s both"`}>${c.A === TEMP ? n1(v) : v}</span>`;
      }
      st += `<span class="vy-op">=</span><div><div style="font-size:12px;color:var(--muted)">résultat (${rr}, ${rc})</div>${h}</div></div>`;
    }
    $(el, '[data-o=st]').innerHTML = st;
    const notes = [
      `A a la forme (${as.join(', ')}), B la forme ${c.bShape}. Peut-on les additionner ?`,
      `On aligne les formes <b>par la droite</b>${bs.length < 2 ? ' et on complète B à gauche par des 1' : ''}. Chaque dimension doit être égale à l'autre ou valoir 1.`,
      c.err ? `<b class="no">ValueError: operands could not be broadcast together with shapes (3,5) (3,)</b><br>${c.note}` : `Les dimensions égales à 1 sont <b>étirées</b> (copies virtuelles en pointillés, rien n'est recopié en mémoire). ${c.note}`,
      'Le calcul se fait case par case, sans boucle Python.',
    ];
    $(el, '[data-o=note]').innerHTML = notes[k];
  };
  const pl = player($(el, '[data-pl]'), { count: () => (CASES[ci].err ? 3 : 4), show });
  $$(el, '[data-c]').forEach(b => { b.onclick = () => { ci = +b.dataset.c; pl.stop(); pl.go(0); }; });
  pl.go(0);
}

/* ------------------------------------------------------------------ d1 · masques et np.where */
function maskViz(el) {
  const M = [[18.5, 22.0, 27.0], [24.5, 29.0, 31.5], [16.0, 25.5, 28.0]];
  const OPS = { '>': (a, b) => a > b, '>=': (a, b) => a >= b, '<': (a, b) => a < b };
  const MODES = [['mask', 'M {c}'], ['filt', 'M[M {c}]'], ['where', 'np.where(M {c}, M, -1)'], ['sum', 'np.sum(M {c})'], ['mean', '(M {c}).mean()']];
  let op = '>', s = 25, mode = 'mask';
  el.innerHTML = head('Masques booléens et np.where', 'Déplace le seuil : chaque case est testée en même temps (calcul vectorisé). Puis choisis ce que tu fais du masque.') +
    `<div class="viz-ctrl"><span class="vy-chips" data-g="op">${Object.keys(OPS).map(o => `<button type="button" class="chip" data-v="${o}"><code>${esc(o)}</code></button>`).join('')}</span>
      <label>seuil = <b data-o="s"></b> <input type="range" min="15" max="32" step="0.5" value="25" aria-label="seuil"></label></div>
    <div class="vy-chips" data-g="m">${MODES.map(([k, t]) => `<button type="button" class="chip" data-v="${k}"><code>${esc(t.replace('{c}', '> s'))}</code></button>`).join('')}</div>
    <div class="vy-codel" data-o="code"></div><div class="vy-row" style="align-items:center"><div class="vy-tab" data-o="tab" style="grid-template-columns:repeat(3, minmax(52px, auto))"></div><div data-o="side" style="min-width:0;flex:1 1 160px"></div></div>
    <pre class="vy-pre" data-o="out"></pre><p class="viz-out" data-o="txt"></p>`;
  const draw = (anim) => {
    $$(el, '[data-g=op] .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === op)));
    $$(el, '[data-g=m] .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === mode)));
    $$(el, '[data-g=m] .chip code').forEach((c, i) => { c.textContent = MODES[i][1].replace('{c}', op + ' ' + (Number.isInteger(s) ? s : s)); });
    $(el, '[data-o=s]').textContent = String(s);
    const cond = `M ${op} ${s}`, B = M.map(r => r.map(x => OPS[op](x, s))), flat = M.flat().filter((x, k) => B.flat()[k]);
    const expr = MODES.find(m => m[0] === mode)[1].replace('{c}', `${op} ${s}`);
    $(el, '[data-o=code]').innerHTML = hl(`print(${expr})`);
    const tab = $(el, '[data-o=tab]');
    tab.innerHTML = M.map((r, i) => r.map((x, j) => {
      const b = B[i][j];
      if (mode === 'mask') return `<span class="c ${b ? 'yes' : 'no'}">${b ? 'True' : 'False'}</span>`;
      if (mode === 'where') return `<span class="c ${b ? 'yes' : 'no'}">${b ? n1(x) : '−1'}</span>`;
      return `<span class="c ${b ? 'yes' : 'no'}" data-k="${i * 3 + j}">${n1(x)}</span>`;
    }).join('')).join('');
    let out = '', side = '';
    const nT = flat.length;
    if (mode === 'mask') out = npPrint(B, 'b');
    else if (mode === 'filt') { out = npPrint(flat); side = `<div class="vy-res">${flat.map((x, k) => `<span class="vy-cell"><b style="animation-delay:${reduced() || !anim ? 0 : k * 0.1}s">${n1(x)}</b></span>`).join('') || '<span class="vy-brk">[ ]</span>'}</div>`; }
    else if (mode === 'where') out = npPrint(M.map((r, i) => r.map((x, j) => (B[i][j] ? x : -1))));
    else if (mode === 'sum') { out = String(nT); side = `<span class="vy-big">${nT}</span> <span class="viz-out">case${nT > 1 ? 's' : ''} True (True compte 1)</span>`; }
    else { out = pyFloat(nT / 9); side = `<span class="vy-big">${nT}/9</span> <span class="viz-out">= proportion de True</span>`; }
    $(el, '[data-o=side]').innerHTML = side;
    $(el, '[data-o=out]').textContent = out;
    if (mode === 'filt' && anim && !reduced()) {
      $$(tab, '.c.yes').forEach((c, k) => c.animate([{ transform: 'scale(1.15)', boxShadow: '0 0 0 3px var(--good)' }, { transform: 'none' }], { duration: 500, delay: k * 100 }));
    }
    $(el, '[data-o=txt]').innerHTML = {
      mask: `<code>${esc(cond)}</code> donne un tableau de booléens de même forme : le <b>masque</b>. Pour combiner : <code>(M &gt; 20) &amp; (M &lt; 28)</code>, avec parenthèses, jamais <code>and</code>.`,
      filt: `Le masque entre crochets garde les cases True, lues ligne par ligne : le résultat est toujours un <b>vecteur 1D</b> (${nT} valeur${nT > 1 ? 's' : ''}).`,
      where: '<code>np.where(cond, si_vrai, si_faux)</code> construit un <b>nouveau</b> tableau de même forme : on garde M là où la condition est vraie, −1 ailleurs.',
      sum: 'Additionner des booléens compte les True : nombre de cases qui vérifient la condition.',
      mean: 'La moyenne des booléens est la <b>proportion</b> de cases qui vérifient la condition.',
    }[mode];
  };
  $(el, 'input[type=range]').oninput = e => { s = +e.target.value; draw(false); };
  $$(el, '[data-g=op] .chip').forEach(b => { b.onclick = () => { op = b.dataset.v; draw(true); }; });
  $$(el, '[data-g=m] .chip').forEach(b => { b.onclick = () => { mode = b.dataset.v; draw(true); }; });
  draw(false);
}

/* ------------------------------------------------------------------ d2 · loc ou iloc */
function locIlocViz(el) {
  const IDX = [3, 2, 1, 0], X = [10, 20, 30, 40];
  const ARGS = ['[1]', '[0]', '[-1]', '[3:1]', '[0:2]', '[1:3]', '[[0, 2]]'];
  let m = 'loc', a = '[1]', timers = [];
  el.innerHTML = head('loc lit des labels, iloc des positions', 'L\'index vaut 3, 2, 1, 0 : les labels ne sont pas les positions. Choisis loc ou iloc et un argument, puis compare.') +
    `<div class="vy-chips" data-g="m"><button type="button" class="chip" data-v="loc"><code>df.loc</code> (labels)</button><button type="button" class="chip" data-v="iloc"><code>df.iloc</code> (positions)</button></div>
    <div class="vy-chips" data-g="a">${ARGS.map(x => `<button type="button" class="chip" data-v="${esc(x)}"><code>${esc(x)}</code></button>`).join('')}</div>
    <div class="vy-codel" data-o="code"></div>
    <div class="vy-row"><table class="vy-pd" data-o="df"></table><pre class="vy-pre" data-o="out" style="flex:1 1 180px"></pre></div><p class="vy-note" data-o="note"></p>`;
  const NOTES = {
    loc: {
      '[1]': 'Ligne dont le <b>label</b> vaut 1 : c\'est la 3ᵉ ligne (position 2), x = 30.',
      '[0]': 'Label 0 : la dernière ligne, x = 40.',
      '[-1]': 'Aucune ligne n\'a le label −1 : <b>KeyError</b>. Les indices négatifs n\'existent pas pour loc.',
      '[3:1]': 'Du label 3 au label 1, <b>fin incluse</b>, dans l\'ordre de l\'index : 3, 2, 1 → 3 lignes.',
      '[0:2]': 'Dans l\'ordre de l\'index (3, 2, 1, 0), le label 0 vient <b>après</b> le label 2 : la tranche est vide.',
      '[1:3]': 'Même piège : 1 est après 3 dans l\'index, donc tranche vide. loc suit l\'ordre des lignes, pas l\'ordre des nombres.',
      '[[0, 2]]': 'Une liste de labels : les lignes 0 puis 2, dans l\'ordre demandé.',
    },
    iloc: {
      '[1]': 'Position 1 = 2ᵉ ligne (dont le label est 2), x = 20.',
      '[0]': 'Position 0 = 1ʳᵉ ligne (label 3), x = 10.',
      '[-1]': 'iloc accepte les positions négatives, comme une liste : la dernière ligne.',
      '[3:1]': 'Positions de 3 à 1 avec un pas +1 : tranche vide, comme <code>lis[3:1]</code>.',
      '[0:2]': 'Positions 0 et 1 : <b>fin exclue</b>, comme en Python → 2 lignes.',
      '[1:3]': 'Positions 1 et 2 (fin 3 exclue) : labels 2 et 1.',
      '[[0, 2]]': 'Positions 0 et 2 : labels 3 et 1.',
    },
  };
  const run = () => {
    timers.forEach(clearTimeout); timers = [];
    $$(el, '[data-g=m] .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === m)));
    $$(el, '[data-g=a] .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === a)));
    $(el, '[data-o=code]').innerHTML = hl(`print(df.${m}${a})`);
    const res = OUT.loc[m + a];
    // lignes choisies : relues dans la sortie (labels d'index)
    const err = res.startsWith('KeyError');
    let rows = [];
    if (!err && !res.startsWith('Empty')) {
      if (res.includes('Name:')) rows = [+res.match(/Name: (-?\d+)/)[1]];
      else rows = res.split('\n').slice(1).map(l => +l.trim().split(/\s+/)[0]);
    }
    const tb = $(el, '[data-o=df]');
    tb.innerHTML = `<caption>df</caption><tr><th class="ix">position</th><th class="ix">label</th><th>x</th></tr>` + IDX.map((l, p) => `<tr data-p="${p}"><td class="pos">${p}</td><th class="ix">${l}</th><td>${X[p]}</td></tr>`).join('');
    $(el, '[data-o=out]').textContent = '';
    $(el, '[data-o=out]').classList.toggle('err', err);
    $(el, '[data-o=note]').innerHTML = NOTES[m][a];
    const trs = $$(tb, 'tr[data-p]'), R = reduced(), dt = R ? 0 : 260;
    // balayage : loc lit la colonne des labels, iloc la colonne des positions
    trs.forEach((tr, k) => timers.push(setTimeout(() => { trs.forEach(t => t.classList.remove('scan')); tr.classList.add('scan'); tr.querySelector(m === 'loc' ? 'th' : 'td.pos').style.boxShadow = 'inset 0 0 0 2px var(--warn)'; }, k * dt)));
    timers.push(setTimeout(() => {
      trs.forEach(t => { t.classList.remove('scan'); t.querySelector('th').style.boxShadow = ''; t.querySelector('td.pos').style.boxShadow = ''; });
      trs.forEach((t, p) => t.classList.toggle('sel', rows.includes(IDX[p])));
      $(el, '[data-o=out]').textContent = res;
    }, 4 * dt + 60));
  };
  ['m', 'a'].forEach(g => $$(el, `[data-g=${g}] .chip`).forEach(b => { b.onclick = () => { if (g === 'm') m = b.dataset.v; else a = b.dataset.v; run(); }; }));
  run();
}

/* ------------------------------------------------------------------ d2 · jointures (merge) */
function mergeViz(el) {
  const part = { cols: ['participant', 'service'], rows: [['Amira', 'Finance'], ['Bastien', 'Data'], ['Chloé', 'Data'], ['Diego', 'RH']] };
  const insc = { cols: ['participant', 'annee_inscription'], rows: [['Chloé', 2025], ['Amira', 2024], ['Diego', 2026], ['Bastien', 2025]] };
  const pi = { cols: ['participant', 'service', 'annee_inscription'], rows: [['Amira', 'Finance', 2024], ['Bastien', 'Data', 2025], ['Chloé', 'Data', 2025], ['Diego', 'RH', 2026]] };
  const resp = { cols: ['service', 'responsable'], rows: [['Finance', 'Nora'], ['Data', 'Yanis'], ['RH', 'Sofia']] };
  const mods = { cols: ['service', 'module'], rows: [['Finance', 'Excel avancé'], ['Finance', 'Budget'], ['Data', 'Python'], ['Data', 'SQL'], ['RH', 'Recrutement'], ['RH', 'Droit social']] };
  const resp2 = { cols: ['service', 'responsable'], rows: [['Finance', 'Nora'], ['Data', 'Yanis'], ['Marketing', 'Léo']] };
  const SC = [
    { lab: 'un-à-un', L: part, Ln: 'participants', R: insc, Rn: 'inscriptions', key: 'participant', code: 'pi = pd.merge(participants, inscriptions)', note: 'Chaque clé apparaît une fois de chaque côté : autant de lignes que de participants. L\'ordre de la table de droite ne compte pas.' },
    { lab: 'plusieurs-à-un', L: pi, Ln: 'pi', R: resp, Rn: 'responsables', key: 'service', code: 'pd.merge(pi, responsables)', note: 'Le côté « un » est <b>répété</b> : Yanis apparaît deux fois. Le nombre de lignes ne change pas.' },
    { lab: 'plusieurs-à-plusieurs', L: pi, Ln: 'pi', R: mods, Rn: 'modules', key: 'service', code: 'plan = pd.merge(pi, modules)', note: 'Chaque ligne de gauche × chaque ligne de droite de même clé : Data donne 2 × 2 = 4 lignes ; total 2 + 4 + 2 = 8.' },
    { lab: 'how="inner"', L: part, Ln: 'participants', R: resp2, Rn: 'resp2', key: 'service', code: 'pd.merge(participants, resp2)', note: 'Par défaut on ne garde que les clés présentes des <b>deux</b> côtés : Diego (RH) disparaît, Marketing aussi.' },
    { lab: 'how="left"', L: part, Ln: 'participants', R: resp2, Rn: 'resp2', key: 'service', how: 'left', code: 'pd.merge(participants, resp2, how="left")', note: 'Toutes les lignes de gauche sont gardées ; sans correspondance, la colonne de droite vaut NaN.' },
  ];
  const KEYS = ['Finance', 'Data', 'RH', 'Marketing'];
  let si = 0;
  el.innerHTML = head('Jointures : pd.merge et les cardinalités', 'Choisis un cas et avance : chaque ligne de gauche cherche les lignes de droite de même clé ; chaque couple trouvé produit une ligne du résultat.') +
    `<div class="vy-chips">${SC.map((s, i) => `<button type="button" class="chip" data-s="${i}">${s.lab}</button>`).join('')}</div><div data-pl></div>
    <div class="vy-codel" data-o="code"></div><div class="vy-scroll"><div class="vy-row" data-o="tabs"></div></div><p class="vy-note" data-o="note"></p><div class="vy-scroll"><table class="vy-pd" data-o="res"></table></div>`;
  const kc = (sc, v) => (sc.key === 'service' ? 'k' + KEYS.indexOf(v) : 'k' + (['Amira', 'Bastien', 'Chloé', 'Diego'].indexOf(v)));
  const table = (sc, T, name, hiRows, scan, dim) => {
    const ki = T.cols.indexOf(sc.key);
    return `<table class="vy-pd"><caption>${name}</caption><tr><th></th>${T.cols.map(c => `<th>${c}</th>`).join('')}</tr>` +
      T.rows.map((r, i) => `<tr class="${kc(sc, r[ki])}${hiRows.includes(i) ? ' sel' : ''}${scan === i ? ' scan' : ''}${dim && !hiRows.includes(i) && scan !== i ? ' dim' : ''}"><th class="ix">${i}</th>${r.map((v, j) => `<td class="${j === ki ? 'vk' : ''}">${esc(v)}</td>`).join('')}</tr>`).join('') + '</table>';
  };
  const result = sc => {
    const L = sc.L, R = sc.R, lk = L.cols.indexOf(sc.key), rk = R.cols.indexOf(sc.key);
    const cols = [...L.cols, ...R.cols.filter(c => c !== sc.key)], out = [];
    L.rows.forEach((lr, i) => {
      const ms = R.rows.map((rr, j) => [rr, j]).filter(([rr]) => rr[rk] === lr[lk]);
      if (ms.length) ms.forEach(([rr, j]) => out.push({ i, j, row: [...lr, ...rr.filter((_, c) => c !== rk)] }));
      else if (sc.how === 'left') out.push({ i, j: -1, row: [...lr, ...R.cols.filter(c => c !== sc.key).map(() => 'NaN')] });
      else out.push({ i, j: -1, row: null });
    });
    return { cols, out };
  };
  const show = k => {
    const sc = SC[si], { cols, out } = result(sc);
    $$(el, '[data-s]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.s === si)));
    $(el, '[data-o=code]').innerHTML = hl(`${sc.code}   # clé : "${sc.key}"`);
    const li = k - 1, cur = li >= 0 && li < sc.L.rows.length ? li : -1;
    const matches = cur >= 0 ? out.filter(o => o.i === cur && o.j >= 0).map(o => o.j) : [];
    $(el, '[data-o=tabs]').innerHTML = table(sc, sc.L, sc.Ln, cur >= 0 ? [] : [], cur, cur >= 0) + table(sc, sc.R, sc.Rn, matches, -1, cur >= 0);
    const done = out.filter(o => o.i <= (k >= sc.L.rows.length + 1 ? 99 : cur) && o.row);
    const fmtv = v => (v === 'NaN' ? '<td class="nan">NaN</td>' : `<td>${esc(v)}</td>`);
    $(el, '[data-o=res]').innerHTML = `<caption>résultat${k > sc.L.rows.length ? ` · forme (${done.length}, ${cols.length})` : ''}</caption><tr><th></th>${cols.map(c => `<th>${c}</th>`).join('')}</tr>` +
      done.map((o, n) => `<tr class="${kc(sc, o.row[sc.L.cols.indexOf(sc.key)])}${o.i === cur ? ' in sel' : ''}"><th class="ix">${n}</th>${o.row.map((v, j) => (j === sc.L.cols.indexOf(sc.key) ? `<td class="vk">${esc(v)}</td>` : fmtv(v))).join('')}</tr>`).join('');
    let note;
    if (k === 0) note = `On joint <code>${sc.Ln}</code> et <code>${sc.Rn}</code> sur leur colonne commune <b>${sc.key}</b>.`;
    else if (cur >= 0) {
      const v = sc.L.rows[cur][sc.L.cols.indexOf(sc.key)];
      note = matches.length ? `Ligne ${cur} de gauche, clé <b>${esc(v)}</b> : ${matches.length} correspondance${matches.length > 1 ? 's' : ''} à droite → ${matches.length} ligne${matches.length > 1 ? 's' : ''} ajoutée${matches.length > 1 ? 's' : ''}.`
        : sc.how === 'left' ? `Clé <b>${esc(v)}</b> absente à droite : avec <code>how="left"</code>, la ligne est gardée avec NaN.` : `Clé <b>${esc(v)}</b> absente à droite : avec <code>how="inner"</code>, la ligne est <b>perdue</b>.`;
    } else note = sc.note;
    $(el, '[data-o=note]').innerHTML = note;
  };
  const pl = player($(el, '[data-pl]'), { count: () => SC[si].L.rows.length + 2, show });
  $$(el, '[data-s]').forEach(b => { b.onclick = () => { si = +b.dataset.s; pl.stop(); pl.go(0); }; });
  pl.go(0);
}

/* ------------------------------------------------------------------ d2 · groupby et pivot_table */
function groupbyViz(el) {
  const RES = [['A', 14, 45], ['B', 11, 52], ['C', 16, 48], ['A', 18, 39], ['B', 13, 50], ['C', 15, 46]];
  const LOC = [['Gare', 'Ville', 8.4], ['Comedie', 'Cargo', 18.7], ['Gare', 'Electrique', 14.3], ['Antigone', 'Ville', 10.8], ['Comedie', 'Ville', 7.7], ['Gare', 'Cargo', 21.5]];
  const AGG = { mean: a => a.reduce((s, x) => s + x, 0) / a.length, sum: a => a.reduce((s, x) => s + x, 0), max: a => Math.max(...a), size: a => a.length };
  let mode = 'gb', agg = 'mean', pagg = 'mean';
  el.innerHTML = head('groupby : séparer, appliquer, combiner', 'Avance pas à pas : les lignes sont réparties par groupe (split), chaque groupe est résumé (apply), puis les résumés forment une nouvelle table (combine).') +
    `<div class="vy-chips" data-g="mode"><button type="button" class="chip" data-v="gb"><code>groupby</code></button><button type="button" class="chip" data-v="pv"><code>pivot_table</code></button></div>
    <div class="vy-chips" data-g="agg"></div><div data-pl></div><div class="vy-codel" data-o="code"></div><div data-o="st"></div><pre class="vy-pre" data-o="out"></pre><p class="vy-note" data-o="note"></p>`;
  const G = ['A', 'B', 'C'];
  const showGB = k => {
    const f = AGG[agg], call = agg === 'size' ? 'resultats.groupby("groupe").size()' : `resultats.groupby("groupe")["score"].${agg}()`;
    $(el, '[data-o=code]').innerHTML = hl(`print(${call})`);
    const gi = g => G.indexOf(g);
    const src = `<table class="vy-pd"><caption>resultats</caption><tr><th></th><th>groupe</th><th>score</th><th>duree_min</th></tr>${RES.map((r, i) => `<tr class="k${gi(r[0])}"><th class="ix">${i}</th><td class="vk">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table>`;
    const grp = G.map((g, n) => {
      const rows = RES.map((r, i) => [r, i]).filter(([r]) => r[0] === g), vals = rows.map(([r]) => r[1]), v = f(vals);
      return `<div class="grp g${n}"><table class="vy-pd" style="width:100%"><caption>groupe ${g}</caption>${rows.map(([r, i]) => `<tr class="k${n}${k === 1 ? ' in' : ''}"><th class="ix">${i}</th><td class="vk">${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>
        ${k >= 2 ? `<div class="vy-codel" style="font-size:12.5px;margin-top:4px;animation:vy-in .4s ${reduced() ? 0 : n * 0.2}s both">${agg}(${agg === 'size' ? rows.length + ' lignes' : '[' + vals.join(', ') + ']'}) = <b>${agg === 'mean' ? pyFloat(v) : v}</b></div>` : ''}</div>`;
    }).join('');
    const comb = `<table class="vy-pd"><caption>${agg === 'size' ? 'Series' : 'Series score'}</caption><tr><th class="ix">groupe</th><th></th></tr>${G.map((g, n) => { const v = f(RES.filter(r => r[0] === g).map(r => r[1])); return `<tr class="k${n} in"><th class="ix">${g}</th><td>${agg === 'mean' ? pyFloat(v) : v}</td></tr>`; }).join('')}</table>`;
    $(el, '[data-o=st]').innerHTML = `<div class="vy-gb"><div class="phase on"><div class="st">0 · la table</div>${src}</div><div class="phase${k >= 1 ? ' on' : ''}"><div class="st">1 · split · 2 · apply</div>${k >= 1 ? grp : ''}</div><div class="phase${k >= 3 ? ' on' : ''}"><div class="st">3 · combine</div>${k >= 3 ? comb : ''}</div></div>`;
    $(el, '[data-o=out]').textContent = k >= 3 ? OUT.gb[agg] : '';
    $(el, '[data-o=note]').innerHTML = [
      'Trois groupes A, B, C, chacun sur deux lignes.',
      '<b>Split</b> : les lignes sont réparties selon la valeur de <code>groupe</code> (comme <code>GROUP BY</code> en SQL).',
      `<b>Apply</b> : on applique <code>${agg}</code> à ${agg === 'size' ? 'chaque groupe (nombre de lignes)' : 'la colonne score de chaque groupe'}.`,
      `<b>Combine</b> : une ligne par groupe ; les clés deviennent l'<b>index</b>, triées. Ensuite <code>.idxmax()</code> donnerait le label du plus grand.${agg === 'size' ? ' (<code>size</code> compte les lignes, <code>count</code> les valeurs non manquantes.)' : ''}`,
    ][k];
  };
  const ST = ['Antigone', 'Comedie', 'Gare'], TY = ['Cargo', 'Electrique', 'Ville'];
  const showPV = k => {
    const call = pagg === 'size' ? 'loc.pivot_table(index="station", columns="type_velo",\n                      aggfunc="size", fill_value=0)' : 'loc.pivot_table(values="prix_eur", index="station",\n                      columns="type_velo", aggfunc="mean")';
    $(el, '[data-o=code]').innerHTML = call.split('\n').map(hl).join('\n');
    const upto = k === 0 ? -1 : k === 1 ? 5 : 5;
    const cell = (s, t) => { const v = LOC.filter(r => r[0] === s && r[1] === t).map(r => r[2]); return pagg === 'size' ? v.length : v.length ? String(AGG.mean(v)) : 'NaN'; };
    const src = `<table class="vy-pd"><caption>loc (colonnes utiles)</caption><tr><th></th><th>station</th><th>type_velo</th><th>prix_eur</th></tr>${LOC.map((r, i) => `<tr class="${i <= upto ? '' : ''}"><th class="ix">${i}</th><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table>`;
    let pv = `<table class="vy-pd"><caption>tableau croisé</caption><tr><th class="ix">station \\ type_velo</th>${TY.map(t => `<th>${t}</th>`).join('')}</tr>`;
    ST.forEach((s, i) => { pv += `<tr><th class="ix">${s}</th>${TY.map((t, j) => { const v = cell(s, t), d = reduced() ? 0 : (i * 3 + j) * 0.08; return k >= 1 ? `<td class="${v === 'NaN' ? 'nan' : ''}" style="animation:vy-pop .4s ${d}s both">${v}</td>` : '<td></td>'; }).join('')}</tr>`; });
    pv += '</table>';
    $(el, '[data-o=st]').innerHTML = `<div class="vy-row">${src}<div>${pv}</div></div>`;
    $(el, '[data-o=out]').textContent = k >= 2 ? OUT.pv[pagg] : '';
    $(el, '[data-o=note]').innerHTML = [
      'Deux variables de regroupement : <code>station</code> (lignes) et <code>type_velo</code> (colonnes).',
      pagg === 'size' ? 'Chaque case compte les lignes du couple (station, type) ; <code>fill_value=0</code> remplace les combinaisons absentes.' : 'Chaque case reçoit la moyenne des prix du couple (station, type). Une seule location par couple ici, donc la moyenne est le prix lui-même.',
      pagg === 'size' ? '<code>aggfunc="size"</code> n\'a pas besoin de <code>values</code>.' : 'Combinaison jamais observée (Antigone en cargo…) → <b>NaN</b>, sauf avec <code>fill_value</code>.',
    ][Math.min(k, 2)];
  };
  const chips = () => {
    $$(el, '[data-g=mode] .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === mode)));
    const opts = mode === 'gb' ? ['mean', 'sum', 'max', 'size'] : ['mean', 'size'], cur = mode === 'gb' ? agg : pagg;
    $(el, '[data-g=agg]').innerHTML = opts.map(o => `<button type="button" class="chip" data-v="${o}" aria-pressed="${o === cur}"><code>${mode === 'gb' ? o + '()' : 'aggfunc="' + o + '"'}</code></button>`).join('');
    $$(el, '[data-g=agg] .chip').forEach(b => { b.onclick = () => { if (mode === 'gb') agg = b.dataset.v; else pagg = b.dataset.v; chips(); pl.stop(); pl.go(mode === 'gb' ? 3 : 2); }; });
  };
  const pl = player($(el, '[data-pl]'), { count: () => (mode === 'gb' ? 4 : 3), show: k => (mode === 'gb' ? showGB(k) : showPV(k)) });
  $$(el, '[data-g=mode] .chip').forEach(b => { b.onclick = () => { mode = b.dataset.v; chips(); pl.stop(); pl.go(0); }; });
  chips(); pl.go(0);
}

/* ------------------------------------------------------------------ d2 · valeurs manquantes */
function nanViz(el) {
  const COLS = ['station', 'type_velo', 'duree_min', 'prix_eur', 'satisfaction'];
  const D = [['Gare', 'Ville', 46, 8.4, 5], ['Comedie', 'Cargo', null, 18.7, 4], ['Gare', 'Electrique', 38, 14.3, null], ['Antigone', 'Ville', 72, 10.8, 2], ['Comedie', 'Ville', 25, 7.7, 3], ['Gare', 'Cargo', 61, 21.5, null]];
  const OPS = [
    ['loc', 'loc', 'Le tableau lu : les cases vides du CSV sont devenues <b>NaN</b> (3 au total). Une colonne d\'entiers avec un NaN passe en float (46.0).'],
    ['isna', 'loc.isna()', '<code>isna()</code> : True là où la valeur manque.'],
    ['isnasum', 'loc.isna().sum()', 'True vaut 1 : <code>sum()</code> compte les NaN <b>colonne par colonne</b>.'],
    ['fill0', 'loc.fillna(value={"satisfaction": 0})', 'Seule la colonne citée est remplie ; le NaN de duree_min reste.'],
    ['fillmean', 'loc.fillna(loc.mean(numeric_only=True))', 'Imputation par la moyenne de chaque colonne (les NaN sont ignorés dans le calcul : (5 + 4 + 2 + 3) / 4 = 3.5).'],
    ['ffill', 'loc.ffill()', '<i>Forward fill</i> : chaque NaN prend la dernière valeur non manquante <b>au-dessus</b>.'],
    ['dropna', 'loc.dropna()', 'Toute ligne contenant au moins un NaN est supprimée : il reste 3 lignes (l\'index d\'origine est conservé).'],
    ['dropsub', 'loc.dropna(subset=["duree_min"])', 'On ne regarde que duree_min : seule la ligne 1 part.'],
    ['dropcol', 'loc.dropna(axis="columns")', 'Ce sont les <b>colonnes</b> avec un NaN qui partent.'],
  ];
  let op = 'loc';
  el.innerHTML = head('Valeurs manquantes : repérer, remplir, supprimer', 'Applique une opération : les NaN sont en rouge, les cases remplies s\'allument en vert, ce qui est supprimé s\'efface. Rappel : le résultat est une copie, loc ne change pas.') +
    `<div class="vy-chips">${OPS.map(([k, c]) => `<button type="button" class="chip" data-o2="${k}"><code>${esc(c.replace('loc.', '.').replace(/^loc$/, 'loc'))}</code></button>`).join('')}</div>
    <div class="vy-codel" data-o="code"></div><div class="vy-scroll"><table class="vy-pd" data-o="t"></table></div><p class="vy-note" data-o="note"></p>
    <details><summary style="cursor:pointer;font-size:13px;color:var(--muted);min-height:32px">Sortie exacte de print</summary><pre class="vy-pre" data-o="out"></pre></details>`;
  const fmt = (j, v) => (v == null ? 'NaN' : j === 2 || j === 4 ? pyFloat(v) : String(v));
  const draw = () => {
    $$(el, '[data-o2]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.o2 === op)));
    const [, call, note] = OPS.find(o => o[0] === op);
    $(el, '[data-o=code]').innerHTML = hl(`print(${call})`);
    $(el, '[data-o=out]').textContent = OUT.nan[op];
    $(el, '[data-o=note]').innerHTML = note;
    const t = $(el, '[data-o=t]');
    const nanRow = r => D[r].some(v => v == null), nanCol = j => D.some(r => r[j] == null);
    const meanCol = j => { const v = D.map(r => r[j]).filter(x => x != null); return v.reduce((a, b) => a + b, 0) / v.length; };
    if (op === 'isnasum') {
      t.innerHTML = `<tr><th class="ix">colonne</th><th>NaN</th></tr>` + COLS.map((c, j) => { const n = D.filter(r => r[j] == null).length; return `<tr class="in"${reduced() ? '' : ` style="animation-delay:${j * 0.08}s"`}><th class="ix">${c}</th><td class="${n ? 'nan' : ''}">${n}</td></tr>`; }).join('');
      return;
    }
    const brk = c => c.replace('_', '_<wbr>').replace('satisfaction', 'satis&shy;faction');
    let h = `<tr><th></th>${COLS.map((c, j) => `<th style="${op === 'dropcol' && nanCol(j) ? 'opacity:.25;text-decoration:line-through' : ''}">${brk(c)}</th>`).join('')}</tr>`;
    D.forEach((r, i) => {
      const goneRow = (op === 'dropna' && nanRow(i)) || (op === 'dropsub' && r[2] == null);
      h += `<tr style="${goneRow ? 'opacity:.25;text-decoration:line-through' : ''}"><th class="ix">${i}</th>` + r.map((v, j) => {
        const goneCol = op === 'dropcol' && nanCol(j);
        let txt = fmt(j, v), cls = v == null ? 'nan' : '';
        if (op === 'isna') { txt = v == null ? 'True' : 'False'; cls = v == null ? 'nan' : ''; }
        if (v == null && op === 'fill0' && j === 4) { txt = '0.0'; cls = 'fill'; }
        if (v == null && op === 'fillmean') { txt = pyFloat(Math.round(meanCol(j) * 1e6) / 1e6); cls = 'fill'; }
        if (v == null && op === 'ffill') { let k = i - 1; while (k >= 0 && D[k][j] == null) k--; txt = fmt(j, D[k][j]); cls = 'fill'; }
        return `<td class="${cls}" style="${goneCol ? 'opacity:.25;text-decoration:line-through' : ''}${cls === 'fill' ? ';background:var(--good-soft);color:var(--good);font-weight:700' : ''}">${txt}</td>`;
      }).join('') + '</tr>';
    });
    t.innerHTML = h;
    if (!reduced()) $$(t, 'td').forEach(td => { if (td.style.color) td.animate([{ transform: 'translateY(-14px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 500, easing: 'cubic-bezier(.3,1.4,.5,1)' }); });
  };
  $$(el, '[data-o2]').forEach(b => { b.onclick = () => { op = b.dataset.o2; draw(); }; });
  draw();
}

/* ------------------------------------------------------------------ d3 · anatomie d'une figure */
function anatomyViz(el) {
  const PARTS = [
    ['fig', 'Figure', 'fig = plt.figure()', 'La <b>figure</b> : l\'image entière, qui peut contenir plusieurs axes. <code>fig, ax = plt.subplots()</code> crée les deux d\'un coup.'],
    ['ax', 'Axes', 'ax = plt.axes()', 'Un <b>axes</b> : une zone de tracé avec son repère (axes x et y, titre, légende). Ce n\'est pas « un axe » !'],
    ['l1', 'Courbe pleine', 'plt.plot(x, np.exp(-0.5 * x), color="navy",\n         linestyle="-", linewidth=2, label="exp(-0.5x)")', '<code>x = np.linspace(0, 8, 500)</code> : 500 abscisses, donc une courbe lisse.'],
    ['l2', 'Courbe en tirets', 'plt.plot(x, np.log1p(x), linestyle="--",\n         marker="o", markevery=40, label="log(1+x)")', 'Tirets + un marqueur rond tous les 40 points.'],
    ['title', 'Titre', 'plt.title("Deux fonctions")      # ax.set_title(…)', 'Version objet : <code>ax.set_title</code>.'],
    ['xl', 'Label de x', 'plt.xlabel("x")                  # ax.set_xlabel(…)', 'Toujours nommer les axes (avec l\'unité si besoin).'],
    ['yl', 'Label de y', 'plt.ylabel("Valeur")             # ax.set_ylabel(…)', 'Ou tout d\'un coup : <code>ax.set(xlabel=…, ylabel=…, title=…)</code>.'],
    ['leg', 'Légende', 'plt.legend(loc="upper right")', 'Elle reprend les <code>label=</code> des courbes ; sans <code>legend()</code>, rien ne s\'affiche.'],
    ['tk', 'Graduations', 'plt.xticks(…), plt.xlim(0, 8)   # ax.set_xticks, ax.set_xlim', 'Graduations et bornes des axes.'],
  ];
  const W = 340, H = 250, L = 52, R = 322, T = 34, B = 196;
  const sx = x => L + (x / 8) * (R - L), sy = y => B - ((y + 0.05) / 2.35) * (B - T);
  const xs = Array.from({ length: 161 }, (_, i) => (i * 8) / 160);
  const p1 = xs.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(Math.exp(-0.5 * x)).toFixed(1)}`).join('');
  const p2 = xs.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(Math.log1p(x)).toFixed(1)}`).join('');
  const mk = Array.from({ length: 13 }, (_, k) => (40 * k * 8) / 499).filter(x => x <= 8).map(x => `<circle cx="${sx(x)}" cy="${sy(Math.log1p(x))}" r="3.5" fill="var(--c4)"/>`).join('');
  const g = `<g class="part" data-p="fig"><rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="6" fill="var(--paper)" stroke="var(--ink-2)" stroke-width="2"/></g>
    <g class="part" data-p="ax"><rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" fill="var(--paper-2)" stroke="var(--line-strong)"/></g>
    <g class="part" data-p="tk">${[0, 2, 4, 6, 8].map(v => `<line x1="${sx(v)}" x2="${sx(v)}" y1="${B}" y2="${B + 5}" stroke="var(--ink-2)"/><text x="${sx(v)}" y="${B + 17}" class="vz-t vz-s" text-anchor="middle">${v}</text>`).join('')}${[0, 0.5, 1, 1.5, 2].map(v => `<line x1="${L - 5}" x2="${L}" y1="${sy(v)}" y2="${sy(v)}" stroke="var(--ink-2)"/><text x="${L - 8}" y="${sy(v) + 4}" class="vz-t vz-s" text-anchor="end">${String(v).replace('.', '.')}</text>`).join('')}</g>
    <g class="part vy-ch" data-p="l1"><path d="${p1}" fill="none" stroke="var(--c1)" stroke-width="2.5" class="draw"/></g>
    <g class="part vy-ch" data-p="l2"><path d="${p2}" fill="none" stroke="var(--c4)" stroke-width="2" stroke-dasharray="7 5"/>${mk}</g>
    <g class="part" data-p="title"><text x="${(L + R) / 2}" y="22" class="vz-t" text-anchor="middle" style="font-weight:700">Deux fonctions</text></g>
    <g class="part" data-p="xl"><text x="${(L + R) / 2}" y="${B + 36}" class="vz-t" text-anchor="middle">x</text></g>
    <g class="part" data-p="yl"><text transform="translate(16 ${(T + B) / 2}) rotate(-90)" class="vz-t" text-anchor="middle">Valeur</text></g>
    <g class="part" data-p="leg"><rect x="${R - 112}" y="${T + 6}" width="106" height="44" rx="4" fill="var(--paper)" stroke="var(--line-strong)"/><line x1="${R - 104}" x2="${R - 84}" y1="${T + 20}" y2="${T + 20}" stroke="var(--c1)" stroke-width="2.5"/><text x="${R - 80}" y="${T + 24}" class="vz-t vz-s">exp(-0.5x)</text><line x1="${R - 104}" x2="${R - 84}" y1="${T + 38}" y2="${T + 38}" stroke="var(--c4)" stroke-width="2" stroke-dasharray="5 3"/><circle cx="${R - 94}" cy="${T + 38}" r="3" fill="var(--c4)"/><text x="${R - 80}" y="${T + 42}" class="vz-t vz-s">log(1+x)</text></g>`;
  el.innerHTML = head('Anatomie d\'une figure Matplotlib', 'Tape un élément (sur le dessin ou dans la liste) : il est mis en évidence avec l\'instruction qui le crée.') +
    `<div class="vy-chips">${PARTS.map(([k, t]) => `<button type="button" class="chip" data-k="${k}">${t}</button>`).join('')}</div>
    <div class="vy-row"><div style="flex:1 1 300px;max-width:440px">${svg(W, H, g, 'Figure Matplotlib annotée', 'vy-anat')}</div>
    <div style="flex:1 1 240px;display:grid;gap:8px;align-content:start"><div class="vy-codel" data-o="code" style="white-space:pre-wrap"></div><p class="vy-note" data-o="note"></p></div></div>`;
  let cur = null;
  const set = k => {
    cur = cur === k ? null : k;
    const s = $(el, 'svg');
    s.classList.toggle('focus', !!cur);
    $$(s, '.part').forEach(p => p.classList.toggle('on', p.dataset.p === cur || (cur === 'ax' && ['ax', 'tk', 'l1', 'l2', 'leg', 'title', 'xl', 'yl'].includes(p.dataset.p))));
    $$(el, '[data-k]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === cur)));
    const P = PARTS.find(p => p[0] === cur);
    $(el, '[data-o=code]').innerHTML = P ? P[2].split('\n').map(hl).join('\n') : [hl('plt.show()               # affiche'), hl('plt.savefig("fig.png")   # enregistre')].join('\n');
    $(el, '[data-o=note]').innerHTML = P ? P[3] : 'Une figure contient un ou plusieurs <b>axes</b> ; chaque élément visible correspond à une instruction.';
    if (P && (cur === 'l1' || cur === 'l2') && !reduced()) { const p = $(s, `[data-p=${cur}] path`); p.animate([{ strokeDashoffset: 1200, strokeDasharray: cur === 'l1' ? '1200' : '7 5' }, { strokeDashoffset: 0 }], { duration: 700 }); }
  };
  $$(el, '[data-k]').forEach(b => { b.onclick = () => set(b.dataset.k); });
  $$(el, '.part').forEach(p => { p.onclick = e => { e.stopPropagation(); set(p.dataset.p === 'fig' && cur === 'fig' ? 'fig' : p.dataset.p); }; });
  set(null); cur = null;
}

/* ------------------------------------------------------------------ d3 · add_subplot(n_lignes, n_colonnes, position) */
function subplotViz(el) {
  let nr = 2, nc = 2, sel = 0;
  el.innerHTML = head('add_subplot : la grille des positions', 'Règle le nombre de lignes et de colonnes, puis tape une case : tu vois son numéro (à partir de 1, ligne par ligne) et son indice avec plt.subplots.') +
    `<div class="viz-ctrl"><label>n_lignes = <b data-o="r"></b> <input type="range" min="1" max="4" value="2" data-i="r" aria-label="nombre de lignes"></label><label>n_colonnes = <b data-o="c"></b> <input type="range" min="1" max="4" value="2" data-i="c" aria-label="nombre de colonnes"></label></div>
    <div class="vy-row"><div style="flex:1 1 280px;max-width:420px" data-o="fig"></div><div style="flex:1 1 240px;display:grid;gap:8px;align-content:start"><div class="vy-codel" data-o="code" style="white-space:pre-wrap"></div><p class="vy-note" data-o="note"></p></div></div>`;
  const FN = [Math.sin, Math.cos, x => Math.sqrt(x) / 1.6 - 0.9, x => Math.log1p(x) / 1.2 - 0.9];
  const draw = (anim) => {
    $(el, '[data-o=r]').textContent = nr; $(el, '[data-o=c]').textContent = nc;
    sel = Math.min(sel, nr * nc - 1);
    const W = 320, H = 230, P = 10, gw = (W - 2 * P) / nc, gh = (H - 2 * P) / nr;
    let g = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="6" class="figr"/>`;
    for (let k = 0; k < nr * nc; k++) {
      const i = Math.floor(k / nc), j = k % nc, x = P + j * gw + 6, y = P + i * gh + 6, w = gw - 12, h = gh - 12, f = FN[k % 4];
      const d = Array.from({ length: 41 }, (_, t) => { const xx = (t / 40) * 8; return `${t ? 'L' : 'M'}${(x + 4 + (t / 40) * (w - 8)).toFixed(1)},${(y + h / 2 - (f(xx) * (h / 2 - 6))).toFixed(1)}`; }).join('');
      g += `<g class="cellg" data-k="${k}" style="cursor:pointer;${anim && !reduced() ? `animation-delay:${k * 0.07}s` : 'animation:none'}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="ax${k === sel ? ' on' : ''}"/><text x="${x + w / 2}" y="${y + h / 2}" class="num" style="font-size:${Math.min(22, h / 2.4)}px">${k + 1}</text><path d="${d}" fill="none" stroke="var(--c${(k % 6) + 1})" stroke-width="1.5" opacity=".55" style="pointer-events:none"/></g>`;
    }
    $(el, '[data-o=fig]').innerHTML = svg(W, H, g, 'Grille de sous-graphiques', 'vy-fig');
    $$(el, '[data-o=fig] [data-k]').forEach(c => { c.onclick = () => { sel = +c.dataset.k; draw(false); }; });
    const i = Math.floor(sel / nc), j = sel % nc, pos = sel + 1;
    const idx = nr === 1 && nc === 1 ? 'ax' : nr === 1 || nc === 1 ? `axes[${nr === 1 ? j : i}]` : `axes[${i}, ${j}]`;
    $(el, '[data-o=code]').innerHTML = [`ax = fig.add_subplot(${nr}, ${nc}, ${pos})`, `fig, axes = plt.subplots(${nr}, ${nc})`, `${idx}.plot(x, y)   # même case`].map(hl).join('\n');
    $(el, '[data-o=note]').innerHTML = `Case en ligne ${i}, colonne ${j} (en comptant de 0) → position <b>${i} × ${nc} + ${j} + 1 = ${pos}</b>. Les positions de <code>add_subplot</code> commencent à <b>1</b>, d'où le <code>i + 1</code> dans la boucle <code>for i, … in enumerate(…)</code>. ` +
      (nr === 1 && nc === 1 ? 'Avec une seule case, <code>plt.subplots()</code> renvoie un seul axes.' : nr === 1 || nc === 1 ? 'Une seule ligne (ou colonne) : <code>axes</code> est un <b>vecteur</b>, un seul indice.' : `<code>axes</code> est un tableau NumPy de forme (${nr}, ${nc}) : deux indices, à partir de 0.`);
  };
  $(el, '[data-i=r]').oninput = e => { nr = +e.target.value; draw(true); };
  $(el, '[data-i=c]').oninput = e => { nc = +e.target.value; draw(true); };
  draw(true);
}

/* ------------------------------------------------------------------ d3 · choisir le bon graphique */
function chartPickViz(el) {
  const r = rng(31), gs = () => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };
  const DUR = Array.from({ length: 120 }, () => 40 + 14 * gs() + (r() < 0.25 ? 18 : 0));
  const GRP = [0, 1, 2].map(k => Array.from({ length: 40 }, () => [30, 45, 58][k] + [8, 12, 10][k] * gs()));
  const SC = Array.from({ length: 45 }, () => { const t = 4 + r() * 26; return [t, 20 + 3.2 * t + 12 * gs()]; });
  const W = 300, H = 220, L = 40, R = 288, T = 14, B = 190;
  const ax = (yl, xl) => `<path d="M${L},${T}V${B}H${R}" class="vz-axis"/>${xl ? `<text x="${(L + R) / 2}" y="${H - 4}" class="vz-t vz-s" text-anchor="middle">${xl}</text>` : ''}${yl ? `<text transform="translate(11 ${(T + B) / 2}) rotate(-90)" class="vz-t vz-s" text-anchor="middle">${yl}</text>` : ''}`;
  const kde = (data, lo, hi, n = 60, bw = 5) => Array.from({ length: n + 1 }, (_, i) => { const x = lo + ((hi - lo) * i) / n; return [x, data.reduce((s, d) => s + Math.exp(-0.5 * ((x - d) / bw) ** 2), 0) / (data.length * bw * Math.sqrt(2 * Math.PI))]; });
  const q = (a, p) => { const s = a.slice().sort((x, y) => x - y), k = (s.length - 1) * p, f = Math.floor(k); return s[f] + (s[Math.min(f + 1, s.length - 1)] - s[f]) * (k - f); };
  const box = (data, cx, w, sy, c) => {
    const q1 = q(data, 0.25), q2 = q(data, 0.5), q3 = q(data, 0.75), iq = q3 - q1, lo = Math.min(...data.filter(x => x >= q1 - 1.5 * iq)), hi = Math.max(...data.filter(x => x <= q3 + 1.5 * iq));
    const out = data.filter(x => x < lo || x > hi);
    return `<g class="grow"><line x1="${cx}" x2="${cx}" y1="${sy(hi)}" y2="${sy(lo)}" stroke="var(--ink-2)"/><line x1="${cx - w / 4}" x2="${cx + w / 4}" y1="${sy(hi)}" y2="${sy(hi)}" stroke="var(--ink-2)"/><line x1="${cx - w / 4}" x2="${cx + w / 4}" y1="${sy(lo)}" y2="${sy(lo)}" stroke="var(--ink-2)"/>
      <rect x="${cx - w / 2}" y="${sy(q3)}" width="${w}" height="${sy(q1) - sy(q3)}" fill="${c}" fill-opacity=".35" stroke="${c}" stroke-width="1.5"/><line x1="${cx - w / 2}" x2="${cx + w / 2}" y1="${sy(q2)}" y2="${sy(q2)}" stroke="${c}" stroke-width="3"/>${out.map(o => `<circle cx="${cx}" cy="${sy(o)}" r="2.5" fill="none" stroke="${c}"/>`).join('')}</g>`;
  };
  const CH = {
    line: { t: 'Courbe', code: 'sns.lineplot(data=df, x="heure", y="visiteurs")   # ou plt.plot(x, y)', tip: 'Pour une <b>évolution</b> : l\'axe x est ordonné (temps), on relie les points.', draw: () => {
      const ys = Array.from({ length: 24 }, (_, h) => 20 + 60 * Math.exp(-(((h - 11) / 3) ** 2)) + 45 * Math.exp(-(((h - 18) / 2.5) ** 2)) + 4 * gs());
      const sx = h => L + (h / 23) * (R - L), sy = v => B - (v / 110) * (B - T);
      return ax('visiteurs', 'heure') + `<path d="${ys.map((v, h) => `${h ? 'L' : 'M'}${sx(h).toFixed(1)},${sy(v).toFixed(1)}`).join('')}" fill="none" stroke="var(--c1)" stroke-width="2.5" class="draw"/>` + [0, 6, 12, 18, 23].map(h => `<text x="${sx(h)}" y="${B + 13}" class="vz-t vz-s" text-anchor="middle">${h}h</text>`).join('');
    } },
    hist: { t: 'Histogramme + KDE', code: 'sns.histplot(data=df, x="duree_min", kde=True)', tip: 'Distribution d\'<b>une variable quantitative</b> : la forme (asymétrie, plusieurs bosses ?). La courbe KDE lisse l\'histogramme.', draw: () => {
      const lo = 0, hi = 100, nb = 14, bw = (hi - lo) / nb, cnt = Array(nb).fill(0); DUR.forEach(d => { const k = Math.floor((d - lo) / bw); if (k >= 0 && k < nb) cnt[k]++; });
      const mx = Math.max(...cnt), sx = x => L + ((x - lo) / (hi - lo)) * (R - L), sy = c => B - (c / (mx * 1.1)) * (B - T);
      const k = kde(DUR, lo, hi, 60, 5), sc = DUR.length * bw;
      return ax('effectif', 'durée (min)') + cnt.map((c, i) => `<rect x="${sx(lo + i * bw) + 1}" y="${sy(c)}" width="${sx(bw) - L - 2}" height="${B - sy(c)}" fill="var(--c1)" fill-opacity=".55" class="grow" style="animation-delay:${i * 0.04}s"/>`).join('') +
        `<path d="${k.map(([x, d], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(d * sc).toFixed(1)}`).join('')}" fill="none" stroke="var(--c2)" stroke-width="2.5" class="draw" style="animation-delay:.5s"/>` + [0, 25, 50, 75, 100].map(v => `<text x="${sx(v)}" y="${B + 13}" class="vz-t vz-s" text-anchor="middle">${v}</text>`).join('');
    } },
    box1: { t: 'Boîte à moustaches', code: 'sns.boxplot(data=df, x="duree_min")', tip: 'Résumé en 5 nombres : médiane (trait épais), Q1–Q3 (boîte), moustaches jusqu\'à 1,5 × IQR, points isolés au-delà.', draw: () => {
      const sx = v => L + (v / 100) * (R - L), cy = (T + B) / 2, h = 50;
      const q1 = q(DUR, 0.25), q2 = q(DUR, 0.5), q3 = q(DUR, 0.75), iq = q3 - q1, lo = Math.min(...DUR.filter(x => x >= q1 - 1.5 * iq)), hi = Math.max(...DUR.filter(x => x <= q3 + 1.5 * iq));
      const out = DUR.filter(x => x < lo || x > hi), lab = (x, t) => `<text x="${sx(x)}" y="${cy - h / 2 - 8}" class="vz-t vz-s fade" text-anchor="middle" style="animation-delay:.6s">${t}</text>`;
      return `<path d="M${L},${B}H${R}" class="vz-axis"/><g class="growx"><line x1="${sx(lo)}" x2="${sx(hi)}" y1="${cy}" y2="${cy}" stroke="var(--ink-2)"/><line x1="${sx(lo)}" x2="${sx(lo)}" y1="${cy - 12}" y2="${cy + 12}" stroke="var(--ink-2)"/><line x1="${sx(hi)}" x2="${sx(hi)}" y1="${cy - 12}" y2="${cy + 12}" stroke="var(--ink-2)"/>
        <rect x="${sx(q1)}" y="${cy - h / 2}" width="${sx(q3) - sx(q1)}" height="${h}" fill="var(--c1)" fill-opacity=".35" stroke="var(--c1)" stroke-width="1.5"/><line x1="${sx(q2)}" x2="${sx(q2)}" y1="${cy - h / 2}" y2="${cy + h / 2}" stroke="var(--c1)" stroke-width="3"/>${out.map(o => `<circle cx="${sx(o)}" cy="${cy}" r="3" fill="none" stroke="var(--c1)"/>`).join('')}</g>` +
        lab(q1, 'Q1') + lab(q2, 'médiane') + lab(q3, 'Q3') +
        [0, 25, 50, 75, 100].map(v => `<text x="${sx(v)}" y="${B + 13}" class="vz-t vz-s" text-anchor="middle">${v}</text>`).join('') + `<text x="${(L + R) / 2}" y="${H - 4}" class="vz-t vz-s" text-anchor="middle">durée (min)</text>`;
    } },
    bar: { t: 'Barres', code: 'plt.bar(jours, entrees)   # ou sns.countplot / catplot(kind="count")', tip: 'Une variable <b>qualitative</b> : une barre par catégorie, hauteur = effectif. Comparer des longueurs est facile pour l\'œil.', draw: () => {
      const J = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'], E = [120, 135, 210, 150, 175, 260], bw = (R - L) / J.length, sy = v => B - (v / 280) * (B - T);
      return ax('entrées', '') + E.map((v, i) => `<rect x="${L + i * bw + 5}" y="${sy(v)}" width="${bw - 10}" height="${B - sy(v)}" fill="var(--c${i === 5 ? 2 : 1})" fill-opacity=".75" class="grow" style="animation-delay:${i * 0.07}s"/><text x="${L + i * bw + bw / 2}" y="${B + 13}" class="vz-t vz-s" text-anchor="middle">${J[i]}</text><text x="${L + i * bw + bw / 2}" y="${sy(v) - 4}" class="vz-t vz-s fade" text-anchor="middle" style="animation-delay:${0.4 + i * 0.07}s">${v}</text>`).join('');
    } },
    pie: { t: 'Camembert', code: 'plt.pie(entrees, labels=jours, autopct="%1.1f%%", startangle=90)', tip: '<b>Parts d\'un même total</b>, peu de catégories. L\'œil compare mal les angles : au-delà de 5–6 secteurs, préfère les barres.', draw: () => {
      const V = [120, 135, 210, 150, 175, 260], J = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'], S = V.reduce((a, b) => a + b, 0), cx = 150, cy = 112, rr = 88;
      let a = -Math.PI / 2, g = '';
      V.forEach((v, i) => { const b = a + (2 * Math.PI * v) / S, m = (a + b) / 2, lg = b - a > Math.PI ? 1 : 0;
        g += `<path d="M${cx},${cy}L${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}A${rr},${rr} 0 ${lg} 1 ${cx + rr * Math.cos(b)},${cy + rr * Math.sin(b)}z" fill="var(--c${i + 1})" fill-opacity=".8" stroke="var(--paper)" stroke-width="2"/><text x="${cx + rr * 0.66 * Math.cos(m)}" y="${cy + rr * 0.66 * Math.sin(m) + 4}" class="vz-t vz-s" text-anchor="middle" style="fill:var(--paper);font-weight:700">${fr((100 * v) / S, 1)}%</text><text x="${cx + (rr + 14) * Math.cos(m)}" y="${cy + (rr + 14) * Math.sin(m) + 4}" class="vz-t vz-s" text-anchor="middle">${J[i]}</text>`; a = b; });
      return `<g class="spin" style="transform-origin:${cx}px ${cy}px">${g}</g>`;
    } },
    box: { t: 'Boîtes par groupe', code: 'sns.boxplot(data=df, x="type_velo", y="duree_min")', tip: 'Une quantitative <b>selon</b> une qualitative : une boîte par groupe, on compare médianes et dispersions d\'un coup d\'œil.', draw: () => {
      const sy = v => B - (v / 100) * (B - T), N = ['Ville', 'Électrique', 'Cargo'], bw = (R - L) / 3;
      return ax('durée (min)', 'type_velo') + GRP.map((d, k) => box(d, L + bw * k + bw / 2, 44, sy, `var(--c${k + 1})`).replace('class="grow"', `class="grow" style="animation-delay:${k * 0.12}s"`) + `<text x="${L + bw * k + bw / 2}" y="${B + 13}" class="vz-t vz-s" text-anchor="middle">${N[k]}</text>`).join('');
    } },
    violin: { t: 'Violons', code: 'sns.violinplot(data=df, x="type_velo", y="duree_min", inner="quartile")', tip: 'Comme la boîte, mais avec la <b>forme</b> de la distribution (une KDE en miroir) : on voit les bosses.', draw: () => {
      const sy = v => B - (v / 100) * (B - T), N = ['Ville', 'Électrique', 'Cargo'], bw = (R - L) / 3;
      return ax('durée (min)', 'type_velo') + GRP.map((d, k) => {
        const kk = kde(d, 0, 100, 50, 5), mx = Math.max(...kk.map(p => p[1])), cx = L + bw * k + bw / 2, s = 30 / mx;
        const path = kk.map(([x, v], i) => `${i ? 'L' : 'M'}${(cx + v * s).toFixed(1)},${sy(x).toFixed(1)}`).join('') + kk.slice().reverse().map(([x, v]) => `L${(cx - v * s).toFixed(1)},${sy(x).toFixed(1)}`).join('') + 'z';
        const qs = [0.25, 0.5, 0.75].map(p => q(d, p));
        return `<g class="grow" style="animation-delay:${k * 0.12}s"><path d="${path}" fill="var(--c${k + 1})" fill-opacity=".35" stroke="var(--c${k + 1})" stroke-width="1.5"/>${qs.map((v, i) => `<line x1="${cx - 14}" x2="${cx + 14}" y1="${sy(v)}" y2="${sy(v)}" stroke="var(--c${k + 1})" stroke-width="${i === 1 ? 2.5 : 1.2}" stroke-dasharray="${i === 1 ? '' : '4 3'}"/>`).join('')}</g><text x="${cx}" y="${B + 13}" class="vz-t vz-s" text-anchor="middle">${N[k]}</text>`;
      }).join('');
    } },
    scatter: { t: 'Nuage de points', code: 'sns.scatterplot(data=df, x="temperature", y="locations")\nsns.jointplot(data=df, x="temperature", y="locations", kind="reg")', tip: '<b>Deux quantitatives</b> : chaque individu est un point ; on cherche une tendance (ici croissante). Beaucoup de points : <code>alpha</code> ou <code>kind="hex"</code>.', draw: () => {
      const sx = t => L + ((t - 0) / 32) * (R - L), sy = v => B - (v / 140) * (B - T);
      const n = SC.length, mx = SC.reduce((s, p) => s + p[0], 0) / n, my = SC.reduce((s, p) => s + p[1], 0) / n, b = SC.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / SC.reduce((s, p) => s + (p[0] - mx) ** 2, 0), a = my - b * mx;
      return ax('locations', 'température (°C)') + SC.map((p, i) => `<circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="4" fill="var(--c1)" fill-opacity=".6" class="fade" style="animation-delay:${i * 0.02}s"/>`).join('') + `<path d="M${sx(2)},${sy(a + 2 * b)}L${sx(31)},${sy(a + 31 * b)}" stroke="var(--c2)" stroke-width="2.5" class="draw" style="animation-delay:1s"/>` + [0, 10, 20, 30].map(v => `<text x="${sx(v)}" y="${B + 13}" class="vz-t vz-s" text-anchor="middle">${v}</text>`).join('');
    } },
    heat: { t: 'Carte de chaleur', code: 'tab = df.pivot_table(index="type_velo", columns="meteo",\n                     aggfunc="size", fill_value=0)\nsns.heatmap(tab, annot=True)   # ou catplot(kind="count", hue=…)', tip: '<b>Deux qualitatives</b> : les effectifs croisés, la couleur code le nombre.', draw: () => {
      const RW = ['Ville', 'Électrique', 'Cargo'], CL = ['soleil', 'nuages', 'pluie'], V = [[18, 12, 5], [22, 9, 3], [7, 4, 1]], cw = (R - 70) / 3, chh = (B - T - 10) / 3;
      return V.map((row, i) => row.map((v, j) => `<rect x="${70 + j * cw}" y="${T + 10 + i * chh}" width="${cw - 3}" height="${chh - 3}" rx="3" fill="var(--accent)" fill-opacity="${0.12 + (0.85 * v) / 22}" class="fade" style="animation-delay:${(i * 3 + j) * 0.06}s"/><text x="${70 + j * cw + cw / 2}" y="${T + 10 + i * chh + chh / 2 + 5}" class="vz-t" text-anchor="middle" style="font-weight:700;${v > 11 ? 'fill:var(--paper)' : ''}">${v}</text>`).join('')).join('') +
        RW.map((t, i) => `<text x="64" y="${T + 10 + i * chh + chh / 2 + 4}" class="vz-t vz-s" text-anchor="end">${t}</text>`).join('') + CL.map((t, j) => `<text x="${70 + j * cw + cw / 2}" y="${B + 14}" class="vz-t vz-s" text-anchor="middle">${t}</text>`).join('');
    } },
    err: { t: 'Barres d\'erreur', code: 'plt.errorbar(x, y, yerr=erreurs, fmt="o", capsize=4)\nax.fill_between(x, y - e, y + e, alpha=0.3)   # version zone', tip: '<b>Mesures ponctuelles</b> avec leur incertitude : un point ± une barre. Pour une courbe continue, une bande avec <code>fill_between</code>.', draw: () => {
      const X = [1, 2, 3, 4, 5, 6], Y = [3.1, 4.4, 4.9, 6.3, 6.8, 8.2], E = [0.6, 0.5, 0.9, 0.7, 1.1, 0.8], sx = x => L + (x / 7) * (R - L), sy = v => B - (v / 10) * (B - T);
      return ax('mesure', 'essai') + X.map((x, i) => `<g class="fade" style="animation-delay:${i * 0.1}s"><line x1="${sx(x)}" x2="${sx(x)}" y1="${sy(Y[i] + E[i])}" y2="${sy(Y[i] - E[i])}" stroke="var(--c2)" stroke-width="1.5"/><line x1="${sx(x) - 6}" x2="${sx(x) + 6}" y1="${sy(Y[i] + E[i])}" y2="${sy(Y[i] + E[i])}" stroke="var(--c2)" stroke-width="1.5"/><line x1="${sx(x) - 6}" x2="${sx(x) + 6}" y1="${sy(Y[i] - E[i])}" y2="${sy(Y[i] - E[i])}" stroke="var(--c2)" stroke-width="1.5"/><circle cx="${sx(x)}" cy="${sy(Y[i])}" r="4.5" fill="var(--c1)"/></g><text x="${sx(x)}" y="${B + 13}" class="vz-t vz-s" text-anchor="middle">${x}</text>`).join('');
    } },
  };
  const Q = [
    ['Une évolution dans le temps', ['line']],
    ['1 variable quantitative', ['hist', 'box1']],
    ['1 variable qualitative', ['bar']],
    ['Les parts d\'un total', ['pie', 'bar']],
    ['Quantitative selon qualitative', ['box', 'violin']],
    ['2 variables quantitatives', ['scatter']],
    ['2 variables qualitatives', ['heat']],
    ['Mesures avec incertitude', ['err']],
  ];
  let qi = 1, ci = 0;
  el.innerHTML = head('Choisir le bon graphique', 'Dis ce que tu veux montrer : le graphique adapté se dessine, avec l\'instruction Matplotlib / Seaborn et la raison du choix.') +
    `<div class="vy-q"><span class="qs">Mes données…</span><div class="vy-chips vy-cg" data-g="q">${Q.map((x, i) => `<button type="button" class="chip" data-v="${i}">${x[0]}</button>`).join('')}</div><div class="vy-chips" data-g="c" style="align-items:center"></div></div>
    <div class="vy-row"><div style="flex:1 1 280px;max-width:420px" data-o="ch"></div><div style="flex:1 1 240px;display:grid;gap:8px;align-content:start"><div class="vy-codel" data-o="code" style="white-space:pre-wrap"></div><p class="vy-note" data-o="tip"></p></div></div>`;
  const draw = () => {
    $$(el, '[data-g=q] .chip').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === qi)));
    const opts = Q[qi][1];
    $(el, '[data-g=c]').innerHTML = opts.length > 1 ? '<span class="qs">Graphique :</span>' + opts.map((k, i) => `<button type="button" class="chip" data-v="${i}" aria-pressed="${i === ci}">${CH[k].t}</button>`).join('') : '';
    $$(el, '[data-g=c] .chip').forEach(b => { b.onclick = () => { ci = +b.dataset.v; draw(); }; });
    const c = CH[opts[ci]];
    $(el, '[data-o=ch]').innerHTML = svg(W, H, c.draw(), c.t, 'vy-ch');
    $(el, '[data-o=code]').innerHTML = c.code.split('\n').map(hl).join('\n');
    $(el, '[data-o=tip]').innerHTML = `<b>${c.t}</b> · ${c.tip}${opts.length > 1 ? ' Essaie l\'autre option.' : ''}`;
  };
  $$(el, '[data-g=q] .chip').forEach(b => { b.onclick = () => { qi = +b.dataset.v; ci = 0; draw(); }; });
  draw();
}

/* ------------------------------------------------------------------ export */
export const VIZ = {
  'py-loops': loopsViz,
  'py-montecarlo': monteCarloViz,
  'py-slice': sliceViz,
  'py-alias': aliasViz,
  'py-listops': listOpsViz,
  'py-comp': compViz,
  'py-flag': flagViz,
  'py-complexity': complexityViz,
  'py-search2d': search2dViz,
  'py-sudoku': sudokuViz,
  'py-dict': dictViz,
  'py-cesar': cesarViz,
  'py-insertion': insertionViz,
  'py-axis': axisViz,
  'py-broadcast': broadcastViz,
  'py-mask': maskViz,
  'py-lociloc': locIlocViz,
  'py-merge': mergeViz,
  'py-groupby': groupbyViz,
  'py-nan': nanViz,
  'py-anatomy': anatomyViz,
  'py-subplot': subplotViz,
  'py-chartpick': chartPickViz,
};
