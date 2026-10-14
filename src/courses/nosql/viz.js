// Illustrations interactives du cours « Bases de données NoSQL » (HTML + SVG, couleurs du thème du site).
// Les données sont celles des exemples du cours (bibliothèque, boutique, graphe « world », amis…) : ce sont des
// schémas de révision animés, pas des sorties réelles de CouchDB ou d'ArangoDB.
import './viz.css';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const head = (t, hint) => `<figcaption><b>${t}</b>${hint ? `<span>${hint}</span>` : ''}</figcaption>`;
const svg = (w, h, body, label, cls = '') => `<svg viewBox="0 0 ${w} ${h}" class="vz-svg ${cls}" role="img" aria-label="${esc(label)}">${body}</svg>`;
const RM = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const qa = (el, s) => [...el.querySelectorAll(s)];
const chips = (name, items, cur) => `<span class="vz-seg nq-seg" role="group">${items.map(([k, l]) => `<button type="button" class="chip" data-${name}="${esc(k)}" aria-pressed="${String(k) === String(cur)}">${l}</button>`).join('')}</span>`;
const press = (el, name, cur) => qa(el, `[data-${name}]`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset[name] === String(cur))));
const ease = t => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const NS = 'http://www.w3.org/2000/svg';
const STOP = Symbol('stop');

/** Interpolation animée (requestAnimationFrame) ; immédiate si l'utilisateur préfère réduire les animations. */
function tween(el, dur, f) {
  return new Promise(res => {
    if (RM() || !dur) { f(1); res(); return; }
    const t0 = performance.now();
    const fr = now => { if (!el.isConnected) { res(); return; } const t = Math.min(1, (now - t0) / dur); f(ease(t)); if (t < 1) requestAnimationFrame(fr); else res(); };
    requestAnimationFrame(fr);
  });
}

/** Script animé annulable : run(fn) annule le précédent ; sleep() interrompt si annulé ou si la figure a quitté la page. */
function runner(el) {
  let tok = 0;
  return {
    cancel() { tok++; },
    run(fn) {
      const my = ++tok, alive = () => my === tok && el.isConnected;
      const sleep = ms => new Promise(r => setTimeout(r, RM() ? Math.min(ms, 60) : ms)).then(() => { if (!alive()) throw STOP; });
      return Promise.resolve().then(() => fn(sleep, alive)).catch(e => { if (e !== STOP) console.error(e); });
    },
  };
}

/** Lecture pas à pas : ▶ Lecture / ❚❚ Pause, Pas ›, ↺. render(i, anim) dessine l'état après i étapes. */
function stepper(el, bar, n, render, delay = 1300) {
  let i = 0, timer = null;
  const N = () => (typeof n === 'function' ? n() : n);
  const D = () => (typeof delay === 'function' ? delay(i) : delay);
  bar.insertAdjacentHTML('beforeend', `<span class="viz-btns"><button type="button" class="btn small primary" data-k="play">▶ Lecture</button><button type="button" class="btn small" data-k="step">Pas ›</button><button type="button" class="btn small" data-k="reset" aria-label="Revenir au début">↺</button></span>`);
  const bp = bar.querySelector('[data-k=play]');
  const label = () => { bp.textContent = timer ? '❚❚ Pause' : i >= N() ? '▶ Rejouer' : '▶ Lecture'; };
  const stop = () => { clearTimeout(timer); timer = null; label(); };
  const go = (k, anim = true) => { i = Math.max(0, Math.min(N(), k)); render(i, anim); label(); };
  const tick = () => {
    if (!el.isConnected || i >= N()) { stop(); return; }
    go(i + 1);
    if (i >= N()) stop(); else timer = setTimeout(tick, D());
  };
  bp.onclick = () => { if (timer) { stop(); return; } if (i >= N()) go(0, false); timer = setTimeout(tick, 150); label(); };
  bar.querySelector('[data-k=step]').onclick = () => { stop(); go(i >= N() ? 0 : i + 1); };
  bar.querySelector('[data-k=reset]').onclick = () => { stop(); go(0, false); };
  go(0, false);
  return { stop, get i() { return i; }, go: k => go(k, false), refresh: () => render(i, false) };
}

/** Petit jeton animé qui va d'un point à un autre dans un calque SVG. */
async function packet(el, layer, x0, y0, x1, y1, { dur = 650, cls = 'nq-pk', r = 6, keep = false, stopAt = 1 } = {}) {
  const c = document.createElementNS(NS, 'circle');
  c.setAttribute('r', r); c.setAttribute('class', cls); c.setAttribute('cx', x0); c.setAttribute('cy', y0);
  layer.appendChild(c);
  await tween(el, dur, t => { const u = t * stopAt; c.setAttribute('cx', x0 + (x1 - x0) * u); c.setAttribute('cy', y0 + (y1 - y0) * u); });
  if (!keep) c.remove();
  return c;
}

/* ================================================================== 1. jointure SQL */
function joinViz(el) {
  const P = [{ id: 1, titre: 'iPhone 14', prix: 969 }, { id: 2, titre: 'Galaxy S23', prix: 899 }, { id: 3, titre: 'Pixel 8', prix: 799 }];
  const A = [{ id: 1, p: 1, note: 5, avis: 'Superbe écran' }, { id: 2, p: 3, note: 4, avis: 'Photos nettes' }, { id: 3, p: 1, note: 3, avis: 'Trop cher' }, { id: 4, p: 2, note: 4, avis: 'Très fluide' }, { id: 5, p: 1, note: 4, avis: 'Bonne autonomie' }];
  let cur = 'iPhone 14';
  el.innerHTML = head('Une jointure, ligne par ligne', 'Choisis un produit et lance : le SGBD cherche le produit (WHERE), puis les avis liés par la clé étrangère (JOIN … ON), puis garde les colonnes demandées (SELECT).') +
    `<div class="viz-ctrl">${chips('prod', P.map(p => [p.titre, p.titre]), cur)}</div><div class="viz-ctrl" data-s="bar"></div>
     <pre class="nq-code" data-s="sql"></pre><div class="nq-tables" data-s="tabs"></div><p class="viz-out" data-s="out"></p>`;
  const sql = el.querySelector('[data-s=sql]'), tabs = el.querySelector('[data-s=tabs]'), out = el.querySelector('[data-s=out]');
  const NP = P.length, NA = A.length;
  const render = (i, anim) => {
    const pk = P.find(p => p.titre === cur);
    const ps = Math.min(i, NP), as = Math.max(0, Math.min(i - NP, NA));
    const ph = i === 0 ? 0 : i <= NP ? 1 : i <= NP + NA ? 2 : 3;
    const lines = [['SELECT a.note, a.avis', 3], ['FROM avis a', 2], ['JOIN produits p ON p.id = a.id_produit', 2], [`WHERE p.titre = '${cur}';`, 1]];
    sql.innerHTML = lines.map(([t, q]) => `<span class="${q === ph ? 'on' : ''}">${esc(t)}</span>`).join('\n');
    const prow = (p, k) => {
      const seen = k < ps, isCur = ph === 1 && k === ps - 1, ok = seen && p.id === pk.id;
      return `<tr class="${isCur ? 'cur' : ''} ${ok ? 'ok' : seen ? 'no' : ''}"><td>${p.id}</td><td>${esc(p.titre)}${isCur ? (ok ? ' <b class="nq-yes">✔</b>' : ' <b class="nq-no">✗</b>') : ''}</td><td>${p.prix} €</td></tr>`;
    };
    const arow = (a, k) => {
      const seen = k < as, isCur = ph === 2 && k === as - 1, ok = seen && a.p === pk.id;
      return `<tr class="${isCur ? 'cur' : ''} ${ok ? 'ok' : seen ? 'no' : ''}"><td>${a.id}</td><td class="nq-fk">${a.p}${isCur ? (ok ? ` <b class="nq-yes">= ${pk.id} ✔</b>` : ` <b class="nq-no">≠ ${pk.id}</b>`) : ''}</td><td>${a.note}</td><td>${esc(a.avis)}</td></tr>`;
    };
    const res = A.filter((a, k) => k < as && a.p === pk.id);
    const last = ph === 2 && A[as - 1] && A[as - 1].p === pk.id ? A[as - 1].id : -1;
    const drop = ph === 3 ? ' drop' : '';
    tabs.innerHTML = `
      <div class="nq-tbl"><div class="nq-tt">produits <i>p</i></div><table class="nq-t"><thead><tr><th>#id</th><th>titre</th><th>prix</th></tr></thead><tbody>${P.map(prow).join('')}</tbody></table></div>
      <div class="nq-tbl"><div class="nq-tt">avis <i>a</i></div><table class="nq-t"><thead><tr><th>#id</th><th>🔑 id_produit</th><th>note</th><th>avis</th></tr></thead><tbody>${A.map(arow).join('')}</tbody></table></div>
      <div class="nq-tbl nq-res"><div class="nq-tt">résultat</div>${ph < 2 ? '<p class="nq-empty">(pas encore de ligne)</p>' : `<table class="nq-t"><thead><tr><th class="${drop}">p.titre</th><th>a.note</th><th>a.avis</th></tr></thead><tbody>${res.map(a => `<tr class="${a.id === last && anim ? 'nq-in' : ''}"><td class="${drop}">${esc(pk.titre)}</td><td>${a.note}</td><td>${esc(a.avis)}</td></tr>`).join('') || '<tr><td colspan="3" class="nq-empty">aucune ligne pour l\'instant</td></tr>'}</tbody></table>`}</div>`;
    const msg = [
      `Lance la lecture. Requête : les avis sur <b>${esc(cur)}</b>.`,
      ...P.map((p, k) => `WHERE : ligne ${k + 1} de <code>produits</code>, « ${esc(p.titre)} » ${p.id === pk.id ? `<b>correspond</b> → on retient <code>p.id = ${pk.id}</code>.` : 'ne correspond pas.'}`),
      ...A.map(a => `JOIN : avis n° ${a.id}, <code>id_produit = ${a.p}</code> ${a.p === pk.id ? `= <code>p.id</code> → la ligne est <b>jointe</b>.` : `≠ ${pk.id} → ignorée.`}`),
      `SELECT : on ne garde que <code>a.note</code> et <code>a.avis</code>. <b>${res.length} avis</b> sur ${esc(cur)}, après ${NP + NA} lignes examinées (sans index). Avec un index sur les clés, le SGBD irait directement aux bonnes lignes.`,
    ];
    out.innerHTML = msg[i];
  };
  const st = stepper(el, el.querySelector('[data-s=bar]'), NP + NA + 1, render, 1000);
  qa(el, '[data-prod]').forEach(b => { b.onclick = () => { cur = b.dataset.prod; press(el, 'prod', cur); st.stop(); st.go(0); }; });
}

/* ================================================================== 2. cluster : réplication / partitionnement */
function clusterViz(el) {
  const DOCS = 'ABCDEFGH'.split('');
  let n = 3, mode = 'rep';
  const down = new Set();
  el.innerHTML = head('Un cluster : répliquer, partitionner', 'Ajoute des machines, change de stratégie, et touche une machine pour la mettre en panne. Bleu : lectures ; orange : écritures, recopiées sur chaque copie.') +
    `<div class="viz-ctrl">${chips('mode', [['full', 'Tout répliquer'], ['part', 'Partitionner'], ['rep', 'Partitionner + 1 réplique']], mode)}</div>
     <div class="viz-ctrl"><span class="viz-btns"><button type="button" class="btn small" data-k="minus">− machine</button><button type="button" class="btn small" data-k="plus">+ machine</button></span><span class="nq-pill" data-o="n"></span></div>
     <div data-s="stage"></div><div class="nq-stats" data-o="stats"></div><p class="viz-out" data-o="out"></p>`;
  const W = 360, H = 260, MX = 196, MW = 156;
  const CL = [0, 1, 2, 3, 4].map(k => ({ x: 26, y: 30 + k * 50 }));
  const holders = d => (mode === 'full' ? [...Array(n).keys()] : mode === 'part' ? [d % n] : n > 1 ? [d % n, (d + 1) % n] : [0]);
  let boxes = [], load = [], layer = null, pk = [], stats = { ok: 0, ko: 0, w: 0 };
  const stage = el.querySelector('[data-s=stage]');
  const draw = () => {
    press(el, 'mode', mode);
    const gap = 8, h = (H - 16 - gap * (n - 1)) / n;
    boxes = [...Array(n).keys()].map(k => ({ x: MX, y: 8 + k * (h + gap), w: MW, h }));
    load = boxes.map((_, k) => load[k] || 0);
    let g = CL.map((c, k) => `<g class="nq-client"><circle cx="${c.x}" cy="${c.y - 6}" r="7"/><path d="M${c.x - 12},${c.y + 16} q12,-18 24,0 z"/><text x="${c.x}" y="${c.y + 30}" class="vz-t vz-s" text-anchor="middle">client ${k + 1}</text></g>`).join('');
    boxes.forEach((b, k) => {
      const dn = down.has(k);
      const docs = DOCS.map((d, j) => ({ d, j })).filter(o => holders(o.j).includes(k));
      const cw = Math.min(16, (b.w - 12) / Math.max(docs.length, 1) - 2);
      g += `<g class="nq-mach ${dn ? 'down' : ''}" data-m="${k}"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="7"/>
        <text x="${b.x + 8}" y="${b.y + 15}" class="vz-t vz-s nq-mt">${dn ? '⚠ en panne' : 'machine ' + (k + 1)}</text>
        ${docs.map((o, q) => { const prim = holders(o.j)[0] === k; return `<g class="nq-doc ${prim ? '' : 'rep'}"><rect x="${b.x + 6 + q * (cw + 2)}" y="${b.y + 21}" width="${cw}" height="${Math.min(16, b.h - 26)}" rx="3"/><text x="${b.x + 6 + q * (cw + 2) + cw / 2}" y="${b.y + 21 + Math.min(16, b.h - 26) / 2 + 4}" text-anchor="middle" class="nq-dt">${o.d}</text></g>`; }).join('')}
        <rect x="${b.x + b.w - 52}" y="${b.y + 6}" width="44" height="7" rx="3" class="nq-lbg"/><rect x="${b.x + b.w - 52}" y="${b.y + 6}" width="0" height="7" rx="3" class="nq-lfg" data-l="${k}"/>
        <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="transparent" class="nq-hit"/></g>`;
    });
    stage.innerHTML = svg(W, H, g + '<g data-l="pk"></g>', 'Clients et machines du cluster', 'nq-mid');
    layer = stage.querySelector('[data-l=pk]'); pk = [];
    qa(stage, '[data-m]').forEach(m => { m.onclick = () => { const k = +m.dataset.m; if (down.has(k)) down.delete(k); else down.add(k); draw(); }; });
    el.querySelector('[data-o=n]').textContent = n + (n > 1 ? ' machines' : ' machine');
    const copies = mode === 'full' ? n : mode === 'part' ? 1 : Math.min(2, n);
    const lost = DOCS.filter((_, j) => holders(j).every(k => down.has(k)));
    const per = boxes.map((_, k) => DOCS.filter((__, j) => holders(j).includes(k)).length);
    el.querySelector('[data-o=out]').innerHTML =
      `Chaque machine stocke <b>${Math.min(...per)}${Math.max(...per) !== Math.min(...per) ? ' à ' + Math.max(...per) : ''} documents</b> sur 8 ; une écriture doit être recopiée <b>${copies} fois</b>. ` +
      (lost.length ? `<span class="nq-bad">Documents indisponibles : <b>${lost.join(', ')}</b></span> (aucune copie vivante).` : down.size ? '<span class="nq-good">Malgré la panne, tous les documents restent lisibles.</span>' : 'Touche une machine pour simuler une panne.') +
      (mode === 'full' ? ' Tout répliquer : très disponible, mais chaque écriture coûte n synchronisations.' : mode === 'part' ? ' Partitionner : chacun stocke moins et écrit moins, mais une panne rend des données inaccessibles.' : ' Le compromis courant : données réparties, et chacune existe en deux exemplaires.');
  };
  const mid = b => [b.x + 4, b.y + b.h / 2];
  const spawn = () => {
    const c = CL[Math.floor(Math.random() * CL.length)], d = Math.floor(Math.random() * DOCS.length), write = Math.random() < 0.3;
    const live = holders(d).filter(k => !down.has(k));
    if (!live.length) { pk.push({ x0: c.x + 14, y0: c.y, x1: 120, y1: c.y, t: 0, dur: 500, cls: 'nq-pk bad', fail: true }); stats.ko++; return; }
    const tgt = write ? live[0] : live[Math.floor(Math.random() * live.length)];
    const [x1, y1] = mid(boxes[tgt]);
    pk.push({ x0: c.x + 14, y0: c.y, x1, y1, t: 0, dur: 900, cls: write ? 'nq-pk w' : 'nq-pk', to: tgt, rep: write ? live.filter(k => k !== tgt) : [] });
    if (write) stats.w++; else stats.ok++;
  };
  let raf = 0, vis = true, last = 0, acc = 0;
  const frame = now => {
    raf = 0;
    if (!el.isConnected) { io.disconnect(); return; }
    const dt = Math.min(60, now - (last || now)); last = now; acc += dt;
    if (acc > 380) { acc = 0; spawn(); }
    pk = pk.filter(p => {
      if (!p.c) { p.c = document.createElementNS(NS, 'circle'); p.c.setAttribute('r', 5); p.c.setAttribute('class', p.cls); layer.appendChild(p.c); }
      p.t += dt / p.dur; const u = ease(Math.min(1, p.t));
      p.c.setAttribute('cx', p.x0 + (p.x1 - p.x0) * u); p.c.setAttribute('cy', p.y0 + (p.y1 - p.y0) * u);
      if (p.fail) p.c.setAttribute('opacity', String(1 - Math.max(0, p.t - 0.6) * 2.5));
      if (p.t < 1) return true;
      p.c.remove();
      if (p.to != null && boxes[p.to]) {
        load[p.to] += 1;
        p.rep.forEach(k => { if (!boxes[k]) return; const [x0, y0] = mid(boxes[p.to]), [x1, y1] = mid(boxes[k]); pk.push({ x0: x0 + 40, y0, x1: x1 + 40, y1, t: 0, dur: 600, cls: 'nq-pk w rep', to: k, rep: [] }); });
      }
      return false;
    });
    load = load.map(v => v * Math.pow(0.9985, dt));
    load.forEach((v, k) => { const r = el.querySelector(`[data-l="${k}"]`); if (r) { r.setAttribute('width', (44 * Math.min(1, v / 8)).toFixed(1)); r.classList.toggle('hot', v > 6); } });
    el.querySelector('[data-o=stats]').innerHTML = `<span>lectures servies : <b>${stats.ok}</b></span><span>écritures : <b>${stats.w}</b></span><span class="${stats.ko ? 'ko' : ''}">requêtes échouées : <b>${stats.ko}</b></span>`;
    if (vis) raf = requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver(e => { vis = e[0].isIntersecting; if (vis && !raf && !RM()) { last = 0; raf = requestAnimationFrame(frame); } });
  io.observe(el);
  qa(el, '[data-mode]').forEach(b => { b.onclick = () => { mode = b.dataset.mode; stats = { ok: 0, ko: 0, w: 0 }; draw(); }; });
  el.querySelector('[data-k=plus]').onclick = () => { if (n < 5) { n++; stats = { ok: 0, ko: 0, w: 0 }; draw(); } };
  el.querySelector('[data-k=minus]').onclick = () => { if (n > 1) { n--; down.delete(n); stats = { ok: 0, ko: 0, w: 0 }; draw(); } };
  draw();
  if (RM()) el.querySelector('[data-o=stats]').innerHTML = '<span>animation désactivée (mouvements réduits)</span>';
}

/* ================================================================== 3. théorème CAP */
function capViz(el) {
  let mode = 'CP';
  const SYS = {
    CP: '<b>CP</b> : cohérence + tolérance au partitionnement. Pendant une coupure, le nœud isolé <b>refuse</b> de répondre plutôt que de donner une valeur fausse (ex. HBase, MongoDB par défaut).',
    AP: '<b>AP</b> : disponibilité + tolérance au partitionnement. Chaque nœud <b>répond toujours</b>, quitte à renvoyer une valeur périmée ; les copies convergent ensuite : <i>cohérence à terme</i> (ex. CouchDB, Cassandra).',
    CA: '<b>CA</b> : cohérence + disponibilité, mais pas de partition tolérée : en pratique un SGBD relationnel <b>sur une seule machine</b>. Dès qu\'on a un cluster, une coupure réseau finit par arriver : il faut choisir entre C et A.',
  };
  el.innerHTML = head('Théorème CAP : coupure réseau, que faire ?', 'Un système réparti ne peut garantir à la fois Cohérence, Disponibilité (Availability) et tolérance au Partitionnement. Touche un côté du triangle, puis déroule le scénario.') +
    `<div class="nq-cap"><div class="nq-tri" data-s="tri"></div><p class="viz-out nq-sys" data-o="sys"></p></div>
     <div class="viz-ctrl" data-s="bar"></div><div data-s="stage"></div><p class="viz-out" data-o="out"></p>`;
  const tri = el.querySelector('[data-s=tri]');
  const V = { C: [110, 22], A: [26, 150], P: [194, 150] };
  const E = [['CA', 'C', 'A'], ['CP', 'C', 'P'], ['AP', 'A', 'P']];
  const drawTri = () => {
    let g = E.map(([k, a, b]) => `<g class="nq-edge ${k === mode ? 'on' : ''}" data-e="${k}" tabindex="0" role="button" aria-label="Choisir ${k}"><line x1="${V[a][0]}" y1="${V[a][1]}" x2="${V[b][0]}" y2="${V[b][1]}" class="nq-el"/><line x1="${V[a][0]}" y1="${V[a][1]}" x2="${V[b][0]}" y2="${V[b][1]}" class="nq-ehit"/><text x="${(V[a][0] + V[b][0]) / 2 + (k === 'CA' ? -16 : k === 'CP' ? 16 : 0)}" y="${(V[a][1] + V[b][1]) / 2 + (k === 'AP' ? 18 : 0)}" text-anchor="middle" class="nq-elab">${k}</text></g>`).join('');
    g += Object.entries(V).map(([k, [x, y]]) => `<g class="nq-vtx ${mode.includes(k) ? 'on' : ''}"><circle cx="${x}" cy="${y}" r="15"/><text x="${x}" y="${y + 5}" text-anchor="middle">${k}</text></g>`).join('');
    g += `<text x="110" y="62" text-anchor="middle" class="vz-t vz-s">Cohérence</text><text x="26" y="182" text-anchor="middle" class="vz-t vz-s">Disponibilité</text><text x="194" y="182" text-anchor="middle" class="vz-t vz-s">Partition</text>`;
    tri.innerHTML = svg(220, 192, g, 'Triangle CAP');
    qa(tri, '[data-e]').forEach(e => { const f = () => { mode = e.dataset.e; drawTri(); st.refresh(); }; e.onclick = f; e.onkeydown = ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); f(); } }; });
    el.querySelector('[data-o=sys]').innerHTML = SYS[mode];
  };
  const stage = el.querySelector('[data-s=stage]');
  const W = 360, H = 220, N1 = [92, 150], N2 = [268, 150], AL = [92, 32], BO = [268, 32];
  stage.innerHTML = svg(W, H, '<g data-l="scene"></g><g data-l="pk"></g>', 'Deux nœuds répliqués et une coupure réseau', 'nq-mid');
  const scene = stage.querySelector('[data-l=scene]'), layer = stage.querySelector('[data-l=pk]');
  const person = ([x, y], name) => `<g class="nq-person"><circle cx="${x - 40}" cy="${y - 6}" r="8"/><path d="M${x - 53},${y + 16} q13,-20 26,0 z"/><text x="${x - 24}" y="${y + 2}" class="vz-t">${name}</text></g>`;
  const N = 6;
  const render = (i, anim) => {
    const cut = i >= 3 && i < 6;
    const x1 = i >= 4 ? 3 : i >= 1 ? 2 : 1, x2 = i >= 6 ? 3 : i >= 2 ? 2 : 1;
    const refuse = i === 5 && mode === 'CP', stale = i === 5 && mode === 'AP', ca = i === 5 && mode === 'CA';
    const node = ([x, y], nm, v, cls, extra) => `<g class="nq-node ${cls}"><rect x="${x - 56}" y="${y - 30}" width="112" height="60" rx="9"/><text x="${x}" y="${y - 10}" text-anchor="middle" class="vz-t vz-s">${nm}</text><text x="${x}" y="${y + 16}" text-anchor="middle" class="nq-val">${extra || 'x = ' + v}</text></g>`;
    let g = `<line x1="${N1[0] + 56}" y1="${N1[1]}" x2="${N2[0] - 56}" y2="${N2[1]}" class="nq-link ${cut ? 'cut' : ''}"/>`;
    if (cut) g += `<text x="180" y="${N1[1] + 6}" text-anchor="middle" class="nq-scis">✂</text><text x="180" y="${N1[1] + 30}" text-anchor="middle" class="vz-t vz-s nq-bad">partition</text>`;
    else g += `<text x="180" y="${N1[1] - 8}" text-anchor="middle" class="vz-t vz-s">réplication</text>`;
    g += person(AL, 'Alice') + person(BO, 'Bob');
    g += `<line x1="${AL[0]}" y1="${AL[1] + 22}" x2="${N1[0]}" y2="${N1[1] - 32}" class="vz-grid"/><line x1="${BO[0]}" y1="${BO[1] + 22}" x2="${N2[0]}" y2="${N2[1] - 32}" class="vz-grid"/>`;
    g += node(N1, 'nœud N1', x1, i === 1 || i === 4 ? 'fresh' : '');
    g += node(N2, 'nœud N2', x2, refuse ? 'refuse' : stale ? 'stale' : i === 2 || i === 6 ? 'fresh' : '', refuse ? 'indisponible' : ca ? '???' : null);
    if (i === 5) {
      const txt = refuse ? 'Erreur : réessaie' : stale ? 'x = 2 (périmé !)' : 'impossible ici';
      g += `<g class="nq-bubble ${refuse ? 'bad' : stale ? 'warn' : ''} ${anim ? 'nq-in' : ''}"><rect x="${BO[0] - 70}" y="${BO[1] + 22}" width="140" height="26" rx="8"/><text x="${BO[0]}" y="${BO[1] + 40}" text-anchor="middle">${txt}</text></g>`;
    }
    if (i === 1 || i === 4) g += `<g class="nq-bubble ${anim ? 'nq-in' : ''}"><rect x="${AL[0] - 62}" y="${AL[1] + 22}" width="124" height="26" rx="8"/><text x="${AL[0]}" y="${AL[1] + 40}" text-anchor="middle">écrit x = ${x1}</text></g>`;
    scene.innerHTML = g;
    layer.innerHTML = '';
    if (anim) {
      if (i === 1 || i === 4) packet(el, layer, AL[0], AL[1] + 10, N1[0], N1[1] - 30, { cls: 'nq-pk w' }).then(() => (i === 4 ? packet(el, layer, N1[0] + 56, N1[1], N2[0] - 56, N2[1], { cls: 'nq-pk w bad', stopAt: 0.5, dur: 500 }) : null));
      if (i === 2 || i === 6) packet(el, layer, N1[0] + 56, N1[1], N2[0] - 56, N2[1], { cls: 'nq-pk w' });
      if (i === 5) packet(el, layer, BO[0], BO[1] + 10, N2[0], N2[1] - 30, { cls: 'nq-pk' });
    }
    const T = [
      'Deux nœuds N1 et N2 stockent chacun une copie de <code>x = 1</code>. Lance le scénario.',
      'Alice écrit <code>x = 2</code> sur N1.',
      'N1 réplique l\'écriture vers N2 : les deux copies sont à jour, tout va bien.',
      '<b>Coupure réseau</b> : N1 et N2 ne se voient plus. Sur un cluster, ça finit toujours par arriver.',
      'Alice écrit <code>x = 3</code> sur N1. La réplication vers N2 est <b>bloquée</b> par la coupure.',
      mode === 'CP' ? 'Bob lit x sur N2. <b>Choix CP</b> : N2 se sait isolé et <b>refuse</b> de répondre. Jamais de valeur fausse… mais le service est <b>indisponible</b>.'
        : mode === 'AP' ? 'Bob lit x sur N2. <b>Choix AP</b> : N2 répond <code>x = 2</code>. Toujours <b>disponible</b>… mais la valeur est <b>périmée</b> : Alice a déjà écrit 3.'
          : 'Bob lit x sur N2. Un système <b>CA</b> ne sait pas gérer cette situation : il suppose qu\'il n\'y a jamais de coupure. Choisis CP ou AP.',
      `Le réseau revient : N1 resynchronise N2 (<code>x = 3</code>). ${mode === 'AP' ? 'Les copies ont fini par converger : c\'est la <b>cohérence à terme</b>.' : mode === 'CP' ? 'N2 redevient disponible.' : ''}`,
    ];
    el.querySelector('[data-o=out]').innerHTML = `<b>Étape ${i}/${N}.</b> ${T[i]}`;
  };
  const st = stepper(el, el.querySelector('[data-s=bar]'), N, render, 1700);
  drawTri();
}

/* ================================================================== 4. les quatre familles */
function familiesViz(el) {
  const B = [
    { k: 1, t: 'La Zone du Dehors', a: 'Alain Damasio', y: 1999, g: 'Science-fiction' },
    { k: 2, t: 'La Horde du Contrevent', a: 'Alain Damasio', y: 2006, g: 'Science-fiction' },
    { k: 3, t: 'Les Hauts de Hurlevent', a: 'Emily Brontë', y: 1847, g: 'Roman' },
  ];
  const F = {
    kv: { n: 'clé-valeur', ex: 'Redis', p: 'Le niveau 0 : une clé → une valeur <b>opaque</b> pour le SGBD.', q: 'Lire une clé est instantané ; chercher « par auteur » oblige à tout relire et décoder dans l\'application.' },
    doc: { n: 'documents', ex: 'CouchDB, ArangoDB, MongoDB', p: 'Clé-valeur dont la valeur est un document (JSON…) <b>compris</b> par le SGBD.', q: 'Le SGBD lit le champ <code>auteurs</code> de chaque document (ou un index) : un document contient toute l\'info de l\'ouvrage.' },
    col: { n: 'colonnes', ex: 'Cassandra, HBase', p: 'Proche du relationnel, mais les valeurs sont stockées <b>par colonne</b>.', q: 'On ne lit que la colonne <code>auteur</code>, puis les titres des lignes retenues : idéal pour parcourir un champ sur des millions de lignes.' },
    gr: { n: 'graphes', ex: 'Neo4J, ArangoDB', p: 'Des <b>nœuds</b> et des <b>arêtes</b>, avec des opérateurs de traversée.', q: 'On part du nœud « Alain Damasio » et on suit les arêtes « a écrit » : pas de parcours de tout le reste.' },
  };
  let cur = 'doc', q = false;
  el.innerHTML = head('Un même exemple, quatre familles', 'Change de famille, puis pose la question : « quels ouvrages a écrits Alain Damasio ? ». En surligné : ce que le SGBD doit lire.') +
    `<div class="viz-ctrl">${chips('fam', Object.entries(F).map(([k, f]) => [k, f.n]), cur)}</div>
     <div class="viz-ctrl"><button type="button" class="btn small primary" data-k="q" aria-pressed="false">🔎 Ouvrages d'Alain Damasio ?</button></div>
     <div class="nq-fam" data-s="stage"></div><p class="viz-out" data-o="out"></p>`;
  const stage = el.querySelector('[data-s=stage]');
  const d = k => `style="--d:${k}"`;
  const draw = () => {
    press(el, 'fam', cur);
    const bq = el.querySelector('[data-k=q]'); bq.setAttribute('aria-pressed', String(q)); bq.textContent = q ? '✕ Effacer la recherche' : '🔎 Ouvrages d\'Alain Damasio ?';
    const Q = q ? ' nq-q' : '';
    let h = '';
    if (cur === 'kv') {
      h = `<div class="nq-kv${Q}">${B.map((b, i) => `<div class="nq-kvr"><code class="k">ouvrage:${b.k}</code><span class="nq-arr">→</span><code class="v ${b.a === 'Alain Damasio' ? 'hit' : 'scan'}" ${d(i)}>"${esc(b.t)}|${esc(b.a)}|${b.y}"</code></div>`).join('')}</div>`;
    } else if (cur === 'doc') {
      h = `<div class="nq-docs${Q}">${B.map((b, i) => `<pre class="nq-json">{
  "_key": "${b.k}",
  "titre": "${esc(b.t)}",
<span class="nq-f ${b.a === 'Alain Damasio' ? 'hit' : 'scan'}" ${d(i)}>  "auteurs": [ "${esc(b.a)}" ],</span>
  "parution": ${b.y}
}</pre>`).join('')}</div>`;
    } else if (cur === 'col') {
      const cols = [['titre', b => b.t], ['auteur', b => b.a], ['parution', b => b.y], ['genre', b => b.g]];
      h = `<div class="nq-cols${Q}">${cols.map(([c, f]) => `<div class="nq-colr ${c === 'auteur' ? 'nq-key' : ''}"><b>${c}</b><span class="nq-cells">${B.map((b, i) => {
        const cl = c === 'auteur' ? (b.a === 'Alain Damasio' ? 'hit' : 'scan') : c === 'titre' && b.a === 'Alain Damasio' ? 'hit late' : '';
        return `<span class="${cl}" ${d(c === 'titre' ? 3 + i : i)}><i>${b.k}</i> ${esc(String(f(b)))}</span>`;
      }).join('')}</span></div>`).join('')}</div>`;
    } else {
      const P = { a1: [62, 58, 'Alain Damasio'], a2: [62, 150, 'Emily Brontë'], b1: [196, 30, 'La Zone du Dehors'], b2: [196, 92, 'La Horde du Contrevent'], b3: [196, 154, 'Les Hauts de Hurlevent'], g1: [318, 60, 'Science-fiction'], g2: [318, 154, 'Roman'] };
      const Ed = [['a1', 'b1', 'a écrit', 1], ['a1', 'b2', 'a écrit', 1], ['a2', 'b3', 'a écrit', 0], ['b1', 'g1', 'genre', 0], ['b2', 'g1', 'genre', 0], ['b3', 'g2', 'genre', 0]];
      let g = Ed.map(([a, b, l, hit], i) => `<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" class="nq-ge ${hit ? 'hit' : ''}" ${d(i)} pathLength="1"/>${i < 3 ? `<text x="${(P[a][0] + P[b][0]) / 2 + 6}" y="${(P[a][1] + P[b][1]) / 2 - 4}" class="vz-t vz-s nq-gl">${l}</text>` : ''}`).join('');
      g += Object.entries(P).map(([k, [x, y, t]]) => `<g class="nq-gn ${k[0]} ${['a1', 'b1', 'b2'].includes(k) ? 'hit' : ''}" ${d(k === 'a1' ? 0 : 1)}><rect x="${x - 50}" y="${y - 15}" width="100" height="30" rx="${k[0] === 'a' ? 15 : 6}"/><text x="${x}" y="${y + 4}" text-anchor="middle">${esc(t.length > 17 ? t.slice(0, 16) + '…' : t)}</text></g>`).join('');
      h = `<div class="nq-graph${Q}">${svg(370, 180, g, 'Graphe auteurs, ouvrages, genres', 'nq-mid')}<div class="viz-leg"><span><i class="sw sw-o" style="--sw:var(--c1)"></i>auteur</span><span><i class="sw" style="--sw:var(--c3)"></i>ouvrage</span><span><i class="sw" style="--sw:var(--c4)"></i>genre</span></div></div>`;
    }
    stage.innerHTML = `<div class="nq-famcard ${RM() ? '' : 'nq-in'}">${h}</div>`;
    const f = F[cur];
    el.querySelector('[data-o=out]').innerHTML = `<b>${f.n}</b> (${f.ex}) · ${f.p}${q ? `<br>🔎 ${f.q}` : ''}`;
  };
  qa(el, '[data-fam]').forEach(b => { b.onclick = () => { cur = b.dataset.fam; draw(); }; });
  el.querySelector('[data-k=q]').onclick = () => { q = !q; draw(); };
  draw();
}

/* ================================================================== 5. modéliser en documents */
function modelViz(el) {
  const j = s => s; // lignes déjà formatées
  const M = {
    o: { n: 'un document = un ouvrage', docs: [
      j('{ "titre": "La Zone du Dehors",\n  "auteurs": [ "Alain Damasio" ],\n  "parution": 1999 }'),
      j('{ "titre": "La Horde du Contrevent",\n  "auteurs": [ "Alain Damasio" ],\n  "parution": 2006 }'),
      j('{ "titre": "Les Hauts de Hurlevent",\n  "auteurs": [ "Emily Brontë" ],\n  "parution": 1847 }')] },
    a: { n: 'un document = un auteur', docs: [
      j('{ "nom": "Alain Damasio",\n  "pays": "France",\n  "ouvrages": [\n    { "titre": "La Zone du Dehors", … },\n    { "titre": "La Horde du Contrevent", … } ] }'),
      j('{ "nom": "Emily Brontë",\n  "pays": "Royaume Uni",\n  "ouvrages": [\n    { "titre": "Les Hauts de Hurlevent", … } ] }')] },
    t: { n: 'simulation relationnelle', docs: [
      j('{ "type": "ouvrage",\n  "titre": "La Zone du Dehors",\n  "auteur": "Alain Damasio" }'),
      j('{ "type": "ouvrage",\n  "titre": "La Horde du Contrevent",\n  "auteur": "Alain Damasio" }'),
      j('{ "type": "ouvrage",\n  "titre": "Les Hauts de Hurlevent",\n  "auteur": "Emily Brontë" }'),
      j('{ "type": "auteur",\n  "nom": "Alain Damasio",\n  "pays": "France" }'),
      j('{ "type": "auteur",\n  "nom": "Emily Brontë",\n  "pays": "Royaume Uni" }')] },
  };
  // pour chaque modèle et chaque action : rôle de chaque document (h = utilisé, s = lu puis écarté, w = réécrit, r = lu sans modif) et bilan
  const PLAN = {
    o: { books: ['hhh', 'Lecture directe : chaque document <b>est</b> un ouvrage. Facile.', 'good'],
      authors: ['hhh', 'Il faut extraire les auteurs de chaque ouvrage puis <b>dédoublonner</b> (Damasio apparaît 2 fois). Et le pays n\'est stocké nulle part.', 'warn'],
      rename: ['wwr', 'Le nom est <b>recopié</b> dans chaque ouvrage : 2 documents à réécrire (et à ne pas oublier !).', 'warn'] },
    a: { books: ['hh', 'Il faut <b>déplier</b> les listes <code>ouvrages</code> de chaque auteur pour lister les 3 ouvrages.', 'warn'],
      authors: ['hh', 'Lecture directe : chaque document <b>est</b> un auteur. Facile.', 'good'],
      rename: ['wr', 'Un seul document contient le nom : 1 écriture.', 'good'] },
    t: { books: ['hhhss', 'On lit les 5 documents et on garde ceux de <code>"type": "ouvrage"</code> : difficulté égale pour chaque concept.', 'warn'],
      authors: ['ssshh', 'On lit les 5 documents et on garde ceux de <code>"type": "auteur"</code>.', 'warn'],
      rename: ['wwrwr', 'Le nom est dans le document auteur <b>et recopié</b> dans ses ouvrages : 3 écritures pour garder la base cohérente.', 'bad'] },
  };
  const ACT = { books: 'Lister les ouvrages', authors: 'Lister les auteurs', rename: 'Corriger le nom « Alain Damasio »' };
  let cur = 'o', act = null;
  el.innerHTML = head('Trois modélisations de la bibliothèque', 'Choisis un modèle et une requête : les documents s\'allument quand le SGBD les lit (bleu), les garde (vert) ou doit les réécrire (orange).') +
    `<div class="viz-ctrl">${chips('mod', Object.entries(M).map(([k, m]) => [k, m.n]), cur)}</div>
     <div class="viz-ctrl"><span class="viz-btns">${Object.entries(ACT).map(([k, l]) => `<button type="button" class="btn small" data-act="${k}">${l}</button>`).join('')}</span></div>
     <div class="nq-cards" data-s="cards"></div><div class="nq-stats" data-o="stats"></div><p class="viz-out" data-o="out"></p>`;
  const R = runner(el);
  const cards = el.querySelector('[data-s=cards]'), out = el.querySelector('[data-o=out]'), stats = el.querySelector('[data-o=stats]');
  const draw = () => {
    press(el, 'mod', cur); press(el, 'act', act);
    cards.innerHTML = M[cur].docs.map((d, i) => `<pre class="nq-json nq-card" data-c="${i}">${esc(d)}</pre>`).join('');
    stats.innerHTML = ''; out.innerHTML = `${M[cur].docs.length} documents. Lance une requête pour voir ce qu'elle coûte avec ce modèle.`;
  };
  const run = a => R.run(async sleep => {
    act = a; draw();
    const [roles, txt, tone] = PLAN[cur][a], cs = qa(cards, '[data-c]');
    let r = 0, w = 0;
    out.innerHTML = `${ACT[a]}…`;
    for (let i = 0; i < cs.length; i++) {
      cs[i].classList.add('scan'); r++;
      stats.innerHTML = `<span>documents lus : <b>${r}</b></span><span>réécrits : <b>${w}</b></span>`;
      await sleep(520);
      cs[i].classList.remove('scan');
      const ro = roles[i];
      cs[i].classList.add(ro === 'h' ? 'hit' : ro === 'w' ? 'write' : 'skip');
      if (ro === 'w') w++;
      stats.innerHTML = `<span>documents lus : <b>${r}</b></span><span class="${w ? 'ko' : ''}">réécrits : <b>${w}</b></span>`;
    }
    out.innerHTML = `<span class="nq-${tone}">${tone === 'good' ? '✔' : tone === 'bad' ? '✗' : '≈'}</span> ${txt}`;
  });
  qa(el, '[data-mod]').forEach(b => { b.onclick = () => { R.cancel(); cur = b.dataset.mod; const a = act; act = null; draw(); if (a) run(a); }; });
  qa(el, '[data-act]').forEach(b => { b.onclick = () => run(b.dataset.act); });
  draw();
}

/* ================================================================== 6. ce qu'on jette, ce qu'on y perd */
function recipeViz(el) {
  const S = [
    { k: 'T', n: 'Typage', s: 'vérifier le type de chaque champ', c: 2, cl: 0, lose: 'Pas de typage : un champ peut contenir n\'importe quoi.' },
    { k: 'S', n: 'Schéma', s: 'valider la structure', c: 2, cl: 0, lose: 'Pas de schéma : l\'application doit <b>supposer</b> le format de la donnée.' },
    { k: 'R', n: 'Relations', s: 'vérifier les clés étrangères', c: 4, cl: 1, lose: 'Pas de clés étrangères : relations et redondance à garder <b>cohérentes à la main</b>.' },
    { k: 'C', n: 'Cohérence', s: 'vérifier les contraintes', c: 3, cl: 1, lose: 'Les contraintes ne sont plus vérifiées par le SGBD : à faire dans l\'application.' },
    { k: 'A', n: 'Atomicité', s: 'journaliser pour pouvoir annuler', c: 3, cl: 1, lose: 'Une opération sur plusieurs documents peut rester <b>à moitié faite</b>.' },
    { k: 'I', n: 'Isolation', s: 'poser des verrous', c: 2, cl: 0, lose: 'Deux écritures simultanées peuvent se mélanger (c\'est pourquoi on la garde en général).' },
    { k: 'D', n: 'Durabilité', s: 'attendre l\'écriture sur disque', c: 4, cl: 1, lose: 'Une réponse avant le stockage « dur » : une panne peut perdre une écriture confirmée.' },
  ];
  const on = new Set(S.map(s => s.k));
  let m = 1;
  el.innerHTML = head('La recette NoSQL : ce qu\'on jette, ce qu\'on y perd', 'Allume ou éteins chaque garantie, augmente le nombre de machines, puis écris un document : chaque garantie ajoute une étape (et, sur un cluster, une coordination réseau).') +
    `<div class="viz-ctrl"><span class="viz-btns"><button type="button" class="btn small" data-k="sql">SGBD relationnel</button><button type="button" class="btn small" data-k="nosql">Recette NoSQL</button></span>
     <label>machines = <b data-o="m">1</b> <input type="range" min="1" max="8" value="1" data-i="m" aria-label="nombre de machines"></label></div>
     <div class="nq-toggles">${S.map(s => `<button type="button" class="chip" data-g="${s.k}" aria-pressed="true">${s.n}</button>`).join('')}</div>
     <div class="nq-pipe" data-s="pipe"></div>
     <div class="viz-ctrl"><button type="button" class="btn small primary" data-k="go">✍ Écrire un document</button><span class="nq-pill" data-o="t"></span></div>
     <div class="nq-bars" data-s="bars"></div><ul class="nq-lose" data-s="lose"></ul>`;
  const R = runner(el);
  const cost = s => s.c * (s.cl ? 1 + 0.7 * (m - 1) : 1);
  const total = () => 2 + S.filter(s => on.has(s.k)).reduce((t, s) => t + cost(s), 0);
  const MAX = 2 + S.reduce((t, s) => t + s.c * (s.cl ? 1 + 0.7 * 7 : 1), 0);
  const draw = () => {
    R.cancel();
    qa(el, '[data-g]').forEach(b => b.setAttribute('aria-pressed', String(on.has(b.dataset.g))));
    el.querySelector('[data-o=m]').textContent = m;
    el.querySelector('[data-s=pipe]').innerHTML = S.filter(s => on.has(s.k)).map(s => `<span class="nq-st" data-p="${s.k}"><b>${s.n}</b>${s.s}${s.cl && m > 1 ? ` <i>× ${m} machines</i>` : ''}</span>`).join('<span class="nq-pa">→</span>') +
      `${on.size ? '<span class="nq-pa">→</span>' : ''}<span class="nq-st done" data-p="W"><b>Écrire</b>le document</span>`;
    const t = total(), base = 2 + S.reduce((a, s) => a + cost(s), 0);
    const sc = (on.has('R') || on.has('A') || on.has('C') || on.has('D')) ? Math.max(8, 100 - (m - 1) * 13) : 100;
    el.querySelector('[data-s=bars]').innerHTML =
      `<div class="nq-bar"><span>temps d'une écriture</span><i><em style="width:${(100 * t / MAX).toFixed(1)}%" class="${t > base * 0.6 && m > 1 ? 'bad' : ''}"></em></i><b>${t.toFixed(0)} u</b></div>
       <div class="nq-bar"><span>gain en ajoutant une machine</span><i><em style="width:${m === 1 ? 100 : sc}%" class="${sc < 50 && m > 1 ? 'bad' : 'good'}"></em></i><b>${m === 1 ? '—' : sc > 60 ? 'bon' : sc > 30 ? 'faible' : 'quasi nul'}</b></div>`;
    el.querySelector('[data-o=t]').textContent = `≈ ${t.toFixed(0)} unités de temps`;
    const lost = S.filter(s => !on.has(s.k));
    el.querySelector('[data-s=lose]').innerHTML = lost.length ? lost.map(s => `<li class="nq-in"><b>${s.n} jeté(e)</b> → ${s.lose}</li>`).join('') : '<li>Rien de jeté : c\'est un SGBD relationnel complet. Sûr, mais chaque écriture coûte cher, surtout sur un cluster.</li>';
  };
  qa(el, '[data-g]').forEach(b => { b.onclick = () => { const k = b.dataset.g; if (on.has(k)) on.delete(k); else on.add(k); draw(); }; });
  el.querySelector('[data-k=sql]').onclick = () => { S.forEach(s => on.add(s.k)); draw(); };
  el.querySelector('[data-k=nosql]').onclick = () => { on.clear(); on.add('I'); draw(); };
  el.querySelector('[data-i=m]').oninput = e => { m = +e.target.value; draw(); };
  el.querySelector('[data-k=go]').onclick = () => R.run(async sleep => {
    const st = qa(el, '[data-p]');
    st.forEach(s => s.classList.remove('on', 'ok'));
    let acc = 0; const pill = el.querySelector('[data-o=t]');
    for (const s of st) {
      s.classList.add('on');
      const def = S.find(x => x.k === s.dataset.p), c = def ? cost(def) : 2, t0 = acc;
      await Promise.all([sleep(c * 110), tween(el, c * 110, u => { pill.textContent = `⏱ ${(t0 + c * u).toFixed(0)} u`; })]);
      acc += c; s.classList.remove('on'); s.classList.add('ok');
    }
    pill.textContent = `✔ écrit en ${acc.toFixed(0)} unités de temps`;
  });
  draw();
}

/* ================================================================== 7. vue CouchDB : map / reduce */
function couchViz(el) {
  const D = [
    { id: '4a0a…', titre: 'La Zone du Dehors', auteurs: ['Alain Damasio'] },
    { id: 'b93f…', titre: 'Les Hauts de Hurlevent', auteurs: ['Emily Brontë'] },
    { id: '7c1e…', titre: 'La Horde du Contrevent', auteurs: ['Alain Damasio'] },
  ];
  const Q = {
    red: ['', 'reduce _count sur tout'],
    nored: ['?reduce=false', 'reduce=false'],
    key: ['?key="Alain Damasio"', 'key="Alain Damasio"'],
    group: ['?group=true', 'group=true'],
    incl: ['?reduce=false&include_docs=true', 'include_docs=true'],
  };
  let q = 'nored';
  el.innerHTML = head('Construire puis interroger une vue CouchDB', 'Lance la construction : map parcourt chaque document et émet des paires (clé, valeur), rangées triées par clé. Puis choisis des paramètres d\'URL.') +
    `<div class="viz-ctrl" data-s="bar"></div>
     <div class="nq-couch"><div><div class="nq-tt">documents (ordre d'insertion)</div><div class="nq-cdocs" data-s="docs"></div></div>
     <div><pre class="nq-code" data-s="map"></pre><div class="nq-tt">index de la vue (trié par clé)</div><table class="nq-t nq-view"><thead><tr><th>key</th><th>value</th><th>id</th></tr></thead><tbody data-s="rows"></tbody></table></div></div>
     <div class="viz-ctrl">${chips('cq', Object.entries(Q).map(([k, v]) => [k, v[1]]), q)}</div>
     <div class="nq-url" data-o="url"></div><pre class="nq-json nq-resp" data-o="resp"></pre><p class="viz-out" data-o="out"></p>`;
  const docs = el.querySelector('[data-s=docs]'), rowsEl = el.querySelector('[data-s=rows]');
  let built = 0, anim = false;
  const rowsOf = k => D.slice(0, k).flatMap(d => d.auteurs.map(a => ({ key: a, value: d.titre, id: d.id, d }))).sort((x, y) => (x.key < y.key ? -1 : x.key > y.key ? 1 : x.id < y.id ? -1 : 1));
  const draw = () => {
    press(el, 'cq', q);
    docs.innerHTML = D.map((d, i) => `<pre class="nq-json nq-card ${i < built ? 'hit' : ''} ${i === built - 1 && anim ? 'scan' : ''}">{ "_id": "${d.id}",\n  "titre": "${esc(d.titre)}",\n  "auteurs": [ "${esc(d.auteurs[0])}" ] }</pre>`).join('');
    el.querySelector('[data-s=map]').innerHTML = `<span>function (doc) {</span>\n<span>  doc.auteurs.forEach((a) =&gt; {</span>\n<span class="${built && built <= D.length && anim ? 'on' : ''}">    emit(a, doc.titre);</span>\n<span>  });</span>\n<span>}</span>   <span class="nq-dim">// reduce : _count</span>`;
    const R = rowsOf(built), newId = anim && built ? D[built - 1].id : null;
    const sel = r => (q === 'key' ? r.key === 'Alain Damasio' : true);
    rowsEl.innerHTML = R.length ? R.map((r, i) => `<tr class="${r.id === newId ? 'nq-in' : ''} ${sel(r) ? 'ok' : 'no'} ${q === 'group' ? (r.key === 'Alain Damasio' ? 'g0' : 'g1') : ''}"><td>"${esc(r.key)}"</td><td>"${esc(r.value)}"</td><td>${r.id}</td></tr>`).join('') : '<tr><td colspan="3" class="nq-empty">vue vide : lance la construction</td></tr>';
    el.querySelector('[data-o=url]').innerHTML = `<span class="nq-dim">GET /couchdb/miashs/_design/par_auteur/_view/par_auteur_2</span><b>${esc(Q[q][0])}</b>`;
    const S = R.filter(sel);
    let js;
    if (q === 'red' || q === 'key') js = `{ "rows": [ { "key": null, "value": ${S.length} } ] }`;
    else if (q === 'group') {
      const g = []; S.forEach(r => { const l = g.find(x => x.key === r.key); if (l) l.n++; else g.push({ key: r.key, n: 1 }); });
      js = `{ "rows": [\n${g.map(x => `  { "key": "${esc(x.key)}", "value": ${x.n} }`).join(',\n')}\n] }`;
    } else js = `{ "total_rows": ${R.length}, "offset": 0, "rows": [\n${S.map(r => `  { "id": "${r.id}", "key": "${esc(r.key)}", "value": "${esc(r.value)}"${q === 'incl' ? `,\n    "doc": { "_id": "${r.id}", "titre": "${esc(r.d.titre)}", … }` : ''} }`).join(',\n')}\n] }`;
    el.querySelector('[data-o=resp]').innerHTML = js;
    const msg = {
      red: 'Sans paramètre, la vue applique <b>reduce</b> (<code>_count</code>) à l\'ensemble : une seule ligne <code>key: null</code>.',
      nored: '<code>reduce=false</code> : on récupère les lignes émises par map, <b>triées par clé</b> (pas dans l\'ordre d\'insertion !).',
      key: '<code>key="Alain Damasio"</code> : seules les lignes de cette clé, puis reduce les compte.',
      group: '<code>group=true</code> : reduce <b>par clé</b>, une ligne par auteur. L\'astuce pour lister les clés distinctes.',
      incl: '<code>include_docs=true</code> : chaque ligne embarque le document complet (avec <code>reduce=false</code>).',
    }[q];
    el.querySelector('[data-o=out]').innerHTML = built < D.length ? `${built ? `Document ${built} indexé : ${D[built - 1].auteurs.length} paire émise. ` : ''}La vue n'est pas encore construite (${built}/${D.length}) : c'est le <b>temps d'indexation</b>.` : `Vue construite. ${msg} Une fois construite, chaque requête est <b>très rapide</b>.`;
  };
  stepper(el, el.querySelector('[data-s=bar]'), D.length, (i, a) => { built = i; anim = a; draw(); }, 1300);
  qa(el, '[data-cq]').forEach(b => { b.onclick = () => { q = b.dataset.cq; anim = false; draw(); }; });
}

/* ================================================================== 8. clé composée et startkey / endkey */
function couchKeyViz(el) {
  const T0 = 1721121000000; // 16/07/2024 9h10 (UTC)
  const raw = [['web', -3], ['android', -4], ['ios', -2], ['android', -1], ['web', 0], ['android', 0], ['ios', 1], ['android', 1], ['android', 2], ['web', 1], ['android', 2], ['ios', 3], ['android', 3], ['android', 4], ['web', 4], ['ios', 5]];
  const rows = raw.map(([t, m]) => ({ t, ts: T0 + Math.round(m * 60000) })).sort((a, b) => (a.t < b.t ? -1 : a.t > b.t ? 1 : a.ts - b.ts));
  const hm = ts => { const d = new Date(ts); return `${d.getUTCHours()}h${String(d.getUTCMinutes()).padStart(2, '0')}${d.getUTCSeconds() ? ':' + String(d.getUTCSeconds()).padStart(2, '0') : ''}`; };
  let type = 'android', a = 0, b = 2;
  el.innerHTML = head('Une plage sur une clé composée', 'Les lignes de la vue sont triées par [type, date]. Choisis un type et une plage horaire : startkey / endkey découpent une tranche contiguë, sans parcourir le reste.') +
    `<div class="viz-ctrl">${chips('ty', [['android', 'android'], ['ios', 'ios'], ['web', 'web']], type)}</div>
     <div class="viz-ctrl"><label>de <b data-o="a"></b> <input type="range" min="-5" max="5" step="1" value="0" data-i="a" aria-label="début de la plage"></label><label>à <b data-o="b"></b> <input type="range" min="-5" max="5" step="1" value="2" data-i="b" aria-label="fin de la plage"></label></div>
     <div class="nq-url" data-o="url"></div><div class="nq-keys" data-s="rows"></div><p class="viz-out" data-o="out"></p>`;
  const R = runner(el);
  const draw = () => {
    press(el, 'ty', type);
    const s = T0 + a * 60000, e = T0 + b * 60000;
    el.querySelector('[data-o=a]').textContent = hm(s); el.querySelector('[data-o=b]').textContent = hm(e);
    el.querySelector('[data-o=url]').innerHTML = `<span class="nq-dim">…/_view/par_type?</span><b>startkey=["${type}",${s}]&amp;endkey=["${type}",${e}]&amp;reduce=false</b>`;
    const box = el.querySelector('[data-s=rows]');
    box.innerHTML = rows.map((r, i) => `<span data-r="${i}" class="${r.t === type && r.ts >= s && r.ts <= e ? 'in' : ''}"><i>["${r.t}",</i> ${hm(r.ts)}<i>]</i></span>`).join('');
    const hits = rows.map((r, i) => (r.t === type && r.ts >= s && r.ts <= e ? i : -1)).filter(i => i >= 0);
    el.querySelector('[data-o=out]').innerHTML = hits.length
      ? `<b>${hits.length} ligne${hits.length > 1 ? 's' : ''}</b> lue${hits.length > 1 ? 's' : ''} sur ${rows.length} : comme la vue est triée, CouchDB saute directement à <code>startkey</code> puis lit jusqu'à <code>endkey</code>. Avec reduce (<code>_count</code>), il renverrait simplement ${hits.length}.`
      : 'Aucune ligne dans cette plage : la tranche est vide.';
    R.run(async sleep => {
      const els = qa(box, '[data-r]');
      els.forEach(x => x.classList.remove('lit'));
      for (const i of hits) { els[i].classList.add('lit'); await sleep(90); }
    });
  };
  const ia = el.querySelector('[data-i=a]'), ib = el.querySelector('[data-i=b]');
  ia.oninput = () => { a = +ia.value; if (a > b) { b = a; ib.value = b; } draw(); };
  ib.oninput = () => { b = +ib.value; if (b < a) { a = b; ia.value = a; } draw(); };
  qa(el, '[data-ty]').forEach(x => { x.onclick = () => { type = x.dataset.ty; draw(); }; });
  draw();
}

/* ================================================================== 9. AQL : boucles imbriquées */
function aqlViz(el) {
  const O = [{ t: 'Les Hauts de Hurlevent', y: 1847, a: 'Emily Brontë' }, { t: 'La Zone du Dehors', y: 1999, a: 'Alain Damasio' }, { t: 'La Horde du Contrevent', y: 2006, a: 'Alain Damasio' }];
  const A = [{ n: 'Alain Damasio', p: 'France' }, { n: 'Emily Brontë', p: 'Royaume Uni' }];
  let sort = true;
  el.innerHTML = head('Exécuter une requête AQL, tour de boucle par tour de boucle', 'Une boucle FOR par collection : pour chaque ouvrage, on parcourt tous les auteurs et FILTER garde les paires qui correspondent.') +
    `<div class="viz-ctrl" data-s="bar"></div><div class="viz-ctrl"><label><input type="checkbox" data-i="sort" checked> avec <code>SORT o.parution DESC</code></label></div>
     <div class="nq-aql"><pre class="nq-code" data-s="code"></pre><div class="nq-loops" data-s="loops"></div></div>
     <div class="nq-tt">résultat (RETURN)</div><div data-s="res"></div><p class="viz-out" data-o="out"></p>`;
  const N = () => O.length * A.length + (sort ? 1 : 0);
  let prev = {};
  const render = i => {
    const nc = Math.min(i, O.length * A.length), k = nc - 1;
    const oi = k >= 0 ? Math.floor(k / A.length) : -1, ai = k >= 0 ? k % A.length : -1;
    const match = k >= 0 && O[oi].a === A[ai].n, sorted = sort && i === N();
    const L = [['FOR o IN ouvrages', 'o'], ['  FOR a IN auteurs', 'a'], ['    FILTER a.nom == o.auteurs[0]', 'f'], ...(sort ? [['    SORT o.parution DESC', 's']] : []), ['    RETURN { titre: o.titre, parution: o.parution,', 'r'], ['             auteur: a.nom, pays: a.pays }', 'r']];
    const act = sorted ? 's' : k < 0 ? '' : match ? 'r' : 'f';
    el.querySelector('[data-s=code]').innerHTML = L.map(([t, c]) => `<span class="${c === act || (c === 'f' && act === 'r') ? 'on' : ''}">${esc(t)}</span>`).join('\n');
    el.querySelector('[data-s=loops]').innerHTML =
      `<div><div class="nq-tt">ouvrages (o)</div>${O.map((o, j) => `<div class="nq-it ${j === oi && !sorted ? 'cur' : ''}"><b>${esc(o.t)}</b><i>auteurs[0] : ${esc(o.a)}</i></div>`).join('')}</div>
       <div><div class="nq-tt">auteurs (a)</div>${A.map((a, j) => `<div class="nq-it ${j === ai && !sorted ? (match ? 'cur ok' : 'cur ko') : ''}"><b>${esc(a.n)}</b><i>${esc(a.p)}</i></div>`).join('')}</div>`;
    let res = [];
    for (let c = 0; c < nc; c++) { const o = O[Math.floor(c / A.length)], a = A[c % A.length]; if (o.a === a.n) res.push({ ...o, p: a.p, key: o.t }); }
    if (sorted) res = res.slice().sort((x, y) => y.y - x.y);
    const box = el.querySelector('[data-s=res]');
    const before = {}; qa(box, '[data-key]').forEach(r => { before[r.dataset.key] = r.getBoundingClientRect().top; });
    box.innerHTML = `<table class="nq-t"><thead><tr><th>titre</th><th>parution</th><th>auteur</th><th>pays</th></tr></thead><tbody>${res.map(r => `<tr data-key="${esc(r.key)}" class="${!(r.key in prev) ? 'nq-in ok' : ''}"><td>${esc(r.t)}</td><td>${r.y}</td><td>${esc(r.a)}</td><td>${esc(r.p)}</td></tr>`).join('') || '<tr><td colspan="4" class="nq-empty">vide</td></tr>'}</tbody></table>`;
    if (!RM()) qa(box, '[data-key]').forEach(r => { const b = before[r.dataset.key]; if (b != null) { const d = b - r.getBoundingClientRect().top; if (d) { r.style.transform = `translateY(${d}px)`; r.style.transition = 'none'; requestAnimationFrame(() => { r.style.transition = 'transform .6s ease'; r.style.transform = ''; }); } } });
    prev = Object.fromEntries(res.map(r => [r.key, 1]));
    el.querySelector('[data-o=out]').innerHTML = i === 0 ? `Il y aura ${O.length} × ${A.length} = <b>${O.length * A.length} comparaisons</b> : deux boucles imbriquées coûtent O(n × m), soit O(n²).`
      : sorted ? '<b>SORT</b> s\'applique à toutes les paires retenues : les lignes sont réordonnées par parution décroissante.'
        : `Tour ${nc}/${O.length * A.length} : <code>"${esc(A[ai].n)}" == "${esc(O[oi].a)}"</code> → ${match ? '<b class="nq-yes">vrai</b> : RETURN ajoute une ligne.' : '<b class="nq-no">faux</b> : la paire est écartée.'}` + (nc === O.length * A.length ? ` Bilan : ${nc} comparaisons pour ${res.length} lignes.` : '');
  };
  const st = stepper(el, el.querySelector('[data-s=bar]'), N, (i, a) => { if (i === 0) prev = {}; render(i, a); }, 1100);
  el.querySelector('[data-i=sort]').onchange = e => { sort = e.target.checked; st.stop(); prev = {}; st.go(0); };
}

/* ================================================================== 10. traversée de graphe */
function traversalViz(el) {
  const V = {
    world: ['World', 'root', 180, 22],
    'continent-europe': ['Europe', 'continent', 92, 86], 'continent-south-america': ['South America', 'continent', 268, 86],
    'country-albania': ['Albania', 'country', 46, 150], 'country-france': ['France', 'country', 136, 150], 'country-brazil': ['Brazil', 'country', 224, 150], 'country-colombia': ['Colombia', 'country', 314, 150],
    'capital-tirana': ['Tirana', 'capital', 46, 214], 'capital-paris': ['Paris', 'capital', 136, 214], 'capital-brasilia': ['Brasilia', 'capital', 224, 214], 'capital-bogota': ['Bogota', 'capital', 314, 214],
  };
  const Ed = [['capital-tirana', 'country-albania'], ['capital-paris', 'country-france'], ['capital-brasilia', 'country-brazil'], ['capital-bogota', 'country-colombia'], ['country-albania', 'continent-europe'], ['country-france', 'continent-europe'], ['country-brazil', 'continent-south-america'], ['country-colombia', 'continent-south-america'], ['continent-europe', 'world'], ['continent-south-america', 'world']];
  let start = 'world', dir = 'INBOUND', lo = 1, hi = 2, ft = 'country', reached = -1;
  el.innerHTML = head('Une traversée AQL sur le graphe « world »', 'Arêtes « is-in » du plus petit vers le plus grand (_from → _to). Touche un nœud pour en faire le départ, règle le sens et la profondeur, puis lance.') +
    `<div class="viz-ctrl">${chips('dir', [['INBOUND', 'INBOUND'], ['OUTBOUND', 'OUTBOUND'], ['ANY', 'ANY']], dir)}</div>
     <div class="viz-ctrl"><label>min <b data-o="lo"></b><input type="range" min="0" max="3" value="1" data-i="lo" aria-label="profondeur minimale"></label><label>max <b data-o="hi"></b><input type="range" min="1" max="3" value="2" data-i="hi" aria-label="profondeur maximale"></label></div>
     <div class="viz-ctrl"><span class="nq-lab">FILTER vertex.type ==</span>${chips('ft', [['', 'aucun'], ['continent', 'continent'], ['country', 'country'], ['capital', 'capital']], ft)}</div>
     <pre class="nq-code" data-o="aql"></pre><div class="viz-ctrl"><button type="button" class="btn small primary" data-k="go">▶ Lancer la traversée</button></div>
     <div data-s="stage"></div><div data-s="res"></div><p class="viz-out" data-o="out"></p>`;
  const R = runner(el);
  const bfs = () => {
    const depth = { [start]: 0 }, via = {}, levels = [[start]];
    for (let d = 1; d <= hi; d++) {
      const nx = [];
      levels[d - 1].forEach(u => Ed.forEach(([f, t], ei) => {
        const v = (dir !== 'OUTBOUND' && t === u) ? f : (dir !== 'INBOUND' && f === u) ? t : null;
        if (v && !(v in depth)) { depth[v] = d; via[v] = ei; nx.push(v); }
      }));
      if (!nx.length) break;
      levels.push(nx);
    }
    return { depth, via, levels };
  };
  const draw = () => {
    press(el, 'dir', dir); press(el, 'ft', ft);
    el.querySelector('[data-o=lo]').textContent = lo; el.querySelector('[data-o=hi]').textContent = hi;
    el.querySelector('[data-o=aql]').innerHTML = esc(`FOR vertex, edge, path IN ${lo}..${hi} ${dir} "worldVertices/${start}" GRAPH worldCountry\n${ft ? `  FILTER vertex.type == "${ft}"\n` : ''}  RETURN { name: vertex.name, type: vertex.type,\n           depth: LENGTH(path.edges) }`);
    const { depth, via } = bfs();
    const shown = v => v in depth && depth[v] <= reached;
    const usedE = new Set(Object.entries(via).filter(([v]) => shown(v)).map(([, e]) => e));
    const ok = v => shown(v) && depth[v] >= lo && (!ft || V[v][1] === ft);
    let g = '<defs><marker id="nq-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="nq-arh"/></marker></defs>';
    g += Ed.map(([f, t], ei) => { const [, , x1, y1] = V[f], [, , x2, y2] = V[t]; return `<line x1="${x1}" y1="${y1 - 13}" x2="${x2 + (x1 - x2) * 0.12}" y2="${y2 + 15}" class="nq-ge2 ${usedE.has(ei) ? 'on' : ''}" marker-end="url(#nq-ar)"/>`; }).join('');
    g += Object.entries(V).map(([k, [n, ty, x, y]]) => {
      const cl = k === start ? 'start' : ok(k) ? 'res' : shown(k) ? 'seen' : '';
      const badge = k === start ? '★' : shown(k) ? depth[k] : '';
      return `<g class="nq-tv ${ty} ${cl}" data-v="${k}" role="button" tabindex="0" aria-label="Partir de ${n}"><rect x="${x - 44}" y="${y - 20}" width="88" height="40" class="nq-hit2"/><rect x="${x - 40}" y="${y - 12}" width="80" height="24" rx="12" class="nq-tc"/><text x="${x}" y="${y + 4}" text-anchor="middle" class="nq-tn2">${n}</text>${badge !== '' ? `<g class="nq-badge ${!RM() && shown(k) && depth[k] === reached ? 'nq-in' : ''}"><circle cx="${x + 38}" cy="${y - 11}" r="9"/><text x="${x + 38}" y="${y - 7.5}" text-anchor="middle">${badge}</text></g>` : ''}</g>`;
    }).join('');
    el.querySelector('[data-s=stage]').innerHTML = svg(360, 240, g, 'Graphe des continents, pays et capitales', 'nq-mid');
    qa(el, '[data-v]').forEach(n => { const f = () => { start = n.dataset.v; reached = -1; draw(); }; n.onclick = f; n.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } }; });
    const res = Object.keys(depth).filter(ok).sort((a, b) => depth[a] - depth[b]);
    el.querySelector('[data-s=res]').innerHTML = reached < 0 ? '' : `<table class="nq-t"><thead><tr><th>name</th><th>type</th><th>depth</th></tr></thead><tbody>${res.map(v => `<tr class="nq-in"><td>${V[v][0]}</td><td>${V[v][1]}</td><td>${depth[v]}</td></tr>`).join('') || '<tr><td colspan="3" class="nq-empty">résultat vide</td></tr>'}</tbody></table>`;
    const lead = `Départ : <b>${V[start][0]}</b>. ${dir === 'INBOUND' ? 'INBOUND suit les arêtes qui <b>arrivent</b> sur le nœud (_to) : on descend vers les plus petits.' : dir === 'OUTBOUND' ? 'OUTBOUND suit les arêtes qui <b>partent</b> du nœud (_from) : on remonte vers les plus grands.' : 'ANY suit les arêtes dans <b>les deux sens</b>.'}`;
    el.querySelector('[data-o=out]').innerHTML = reached < 0 ? lead + ' Lance la traversée.' : `${lead} Le chiffre dans chaque nœud est <code>LENGTH(path.edges)</code>. Pleins : retournés ; en pointillés : atteints mais écartés (profondeur &lt; ${lo} ou FILTER).`;
  };
  el.querySelector('[data-k=go]').onclick = () => R.run(async sleep => { const { levels } = bfs(); for (let d = 0; d < levels.length; d++) { reached = d; draw(); await sleep(750); } reached = 9; draw(); });
  const ilo = el.querySelector('[data-i=lo]'), ihi = el.querySelector('[data-i=hi]');
  ilo.oninput = () => { lo = +ilo.value; if (lo > hi) { hi = lo; ihi.value = hi; } R.cancel(); reached = -1; draw(); };
  ihi.oninput = () => { hi = +ihi.value; if (hi < lo) { lo = hi; ilo.value = lo; } R.cancel(); reached = -1; draw(); };
  qa(el, '[data-dir]').forEach(b => { b.onclick = () => { dir = b.dataset.dir; R.cancel(); reached = -1; draw(); }; });
  qa(el, '[data-ft]').forEach(b => { b.onclick = () => { ft = b.dataset.ft; if (reached < 0) draw(); else { reached = 9; draw(); } }; });
  draw();
}

/* ================================================================== 11. amis d'amis : traversée vs jointures */
function friendsViz(el) {
  const P = { B: [180, 150], A: [108, 106], C: [252, 106], D: [180, 222], E: [44, 58], F: [316, 58], G: [282, 226], H: [180, 26], I: [338, 160] };
  const Ed = [['B', 'A'], ['B', 'C'], ['B', 'D'], ['A', 'C'], ['A', 'E'], ['C', 'F'], ['D', 'G'], ['E', 'H'], ['F', 'H'], ['G', 'I']];
  const nb = u => Ed.flatMap(([a, b]) => (a === u ? [b] : b === u ? [a] : []));
  let dmax = 2, shown = 0;
  el.innerHTML = head('Amis d\'amis : une traversée contre des jointures', 'Règle la profondeur et lance : la traversée part de B en largeur (bfs), sans doublon, en connaissant la distance. À droite, ce que donneraient des jointures.') +
    `<div class="viz-ctrl"><label>profondeur max <b data-o="d"></b><input type="range" min="1" max="3" value="2" data-i="d" aria-label="profondeur maximale"></label><button type="button" class="btn small primary" data-k="go">▶ Parcourir depuis B</button></div>
     <div class="nq-two"><div data-s="stage"></div><div data-s="side"></div></div><p class="viz-out" data-o="out"></p>`;
  const R = runner(el);
  const bfs = () => { const d = { B: 0 }; let fr = ['B']; for (let k = 1; k <= dmax; k++) { const nx = []; fr.forEach(u => nb(u).forEach(v => { if (!(v in d)) { d[v] = k; nx.push(v); } })); fr = nx; } return d; };
  const joins = () => { let rows = [['B']]; const lv = []; for (let k = 1; k <= dmax; k++) { rows = rows.flatMap(r => nb(r[r.length - 1]).map(v => [...r, v])); lv.push(rows.map(r => r[r.length - 1])); } return lv; };
  const draw = () => {
    el.querySelector('[data-o=d]').textContent = dmax;
    const d = bfs(), vis = v => v in d && d[v] <= shown;
    let g = [1, 2, 3].map(k => `<circle cx="${P.B[0]}" cy="${P.B[1]}" r="${k * 62}" class="nq-ring ${k <= shown && k <= dmax ? 'on' : ''}"/>`).join('');
    g += Ed.map(([a, b]) => `<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" class="nq-fe ${vis(a) && vis(b) && Math.abs(d[a] - d[b]) === 1 ? 'on' : ''}"/>`).join('');
    g += Object.entries(P).map(([k, [x, y]]) => `<g class="nq-fn ${k === 'B' ? 'start' : vis(k) ? 'l' + d[k] : ''}"><circle cx="${x}" cy="${y}" r="16"/><text x="${x}" y="${y + 5}" text-anchor="middle">${k}</text>${vis(k) && k !== 'B' ? `<text x="${x + 19}" y="${y - 12}" class="vz-t vz-s">${d[k]}</text>` : ''}</g>`).join('');
    el.querySelector('[data-s=stage]').innerHTML = svg(360, 252, g, 'Graphe d\'amitié autour de B', 'nq-fsvg');
    const lv = joins(), res = Object.keys(d).filter(v => v !== 'B' && d[v] <= shown);
    const seen = new Set(['B']);
    const loops = Array.from({ length: dmax }, (_, k) => `${'  '.repeat(k)}FOR a${k + 1} IN amis  <span class="nq-dim">// profondeur ${k + 1}</span>\n${'  '.repeat(k + 1)}FILTER ${k ? 'a' + k + '._key' : '"B"'} IN a${k + 1}._a_comme_amis`).join('\n');
    el.querySelector('[data-s=side]').innerHTML =
      `<div class="nq-tt">traversée : une requête, IN 1..${dmax}</div><pre class="nq-code">FOR vertex, edge, path IN 1..${dmax} ANY "amis/B"\n  GRAPH leGrapheDeLAmitie\n  OPTIONS { uniqueVertices: "path", order: "bfs" }</pre>
       <div class="nq-tt">jointures : ${dmax} boucle${dmax > 1 ? 's' : ''} FOR</div><pre class="nq-code">${loops}</pre>
       <div class="nq-jl">${lv.map((l, k) => `<div><b>niveau ${k + 1}</b> · ${l.length} lignes : ${l.map(v => { const dup = seen.has(v); seen.add(v); return `<span class="${dup ? 'dup' : ''}">${v}</span>`; }).join(' ')}</div>`).join('')}</div>`;
    const total = lv.reduce((t, l) => t + l.length, 0);
    el.querySelector('[data-o=out]').innerHTML = shown ? `Traversée : <b>${res.length} personnes</b> uniques à ≤ ${Math.min(shown, dmax)} arête${shown > 1 ? 's' : ''}, chacune avec sa distance. Jointures : <b>${total} lignes</b>, avec des doublons (barrés : B lui-même, des amis déjà vus) et sans distance. Et pour une profondeur de 3000 ? Il faudrait 3000 boucles…`
      : 'Lance le parcours : les cercles concentriques sont les niveaux 1, 2, 3.';
  };
  el.querySelector('[data-k=go]').onclick = () => R.run(async sleep => { for (let k = 0; k <= dmax; k++) { shown = k; draw(); await sleep(800); } });
  el.querySelector('[data-i=d]').oninput = e => { dmax = +e.target.value; R.cancel(); shown = 0; draw(); };
  draw();
}

/* ================================================================== 12. avec ou sans redondance */
function redundViz(el) {
  const NP = 4;
  let name = 'Claude Ho', r = 6;
  const cnt = { s: 0, a: 0 };
  el.innerHTML = head('Avec ou sans redondance ?', 'Affiche un post ou renomme l\'utilisateur et compare le nombre d\'accès aux documents. Puis règle le nombre de lectures pour une écriture.') +
    `<div class="viz-ctrl"><span class="viz-btns"><button type="button" class="btn small primary" data-k="read">📖 Afficher un post</button><button type="button" class="btn small" data-k="ren">✏️ Renommer l'utilisateur</button><button type="button" class="btn small" data-k="z" aria-label="Remettre les compteurs à zéro">↺</button></span></div>
     <div class="nq-red" data-s="cols"></div>
     <div class="viz-ctrl"><label>lectures pour une écriture <b data-o="r"></b><input type="range" min="1" max="12" value="6" data-i="r" aria-label="lectures pour une écriture"></label></div>
     <div class="nq-bars" data-s="bars"></div><p class="viz-out" data-o="out"></p>`;
  const R = runner(el);
  const draw = () => {
    const col = (k, t, author) => `<div class="nq-rc" data-m="${k}"><div class="nq-tt">${t}</div>
      <pre class="nq-json nq-card" data-u>{ "_key": "12345",\n  "first_name": "${esc(name.split(' ')[0])}",\n  "last_name": "${esc(name.split(' ').slice(1).join(' '))}" }</pre>
      <div class="nq-posts">${Array.from({ length: NP }, (_, i) => `<pre class="nq-json nq-card" data-p="${i}">post ${i + 1}\n"author": ${author}</pre>`).join('')}</div>
      <div class="nq-stats"><span>accès : <b data-c>${cnt[k]}</b></span></div></div>`;
    el.querySelector('[data-s=cols]').innerHTML = col('s', 'sans redondance', '"12345"') + col('a', 'avec redondance', `{ "id": "12345",\n  "displayed_name": "<span data-dn>${esc(name)}</span>" }`);
    el.querySelector('[data-o=r]').textContent = r;
    const cs = 2 * r + 1, ca = r + 1 + NP, mx = Math.max(cs, ca);
    el.querySelector('[data-s=bars]').innerHTML = `<div class="nq-bar"><span>sans redondance</span><i><em style="width:${(100 * cs / mx).toFixed(0)}%" class="${cs <= ca ? 'good' : ''}"></em></i><b>${cs}</b></div><div class="nq-bar"><span>avec redondance</span><i><em style="width:${(100 * ca / mx).toFixed(0)}%" class="${ca <= cs ? 'good' : ''}"></em></i><b>${ca}</b></div>`;
    el.querySelector('[data-o=out]').innerHTML = `Pour ${r} lecture${r > 1 ? 's' : ''} et 1 renommage : sans redondance ${r} × 2 + 1 = <b>${cs}</b> accès ; avec redondance ${r} × 1 + (1 + ${NP} posts) = <b>${ca}</b> accès. ` +
      (cs === ca ? 'Égalité.' : cs < ca ? '→ <b>sans redondance</b> gagne : peu de lectures par rapport aux écritures.' : '→ <b>avec redondance</b> gagne : lectures &gt; écritures.');
  };
  const flash = async (sleep, nodes, cls, k) => { for (const n of nodes) { n.classList.add(cls); cnt[k]++; n.closest('[data-m]').querySelector('[data-c]').textContent = cnt[k]; await sleep(380); } };
  el.querySelector('[data-k=read]').onclick = () => R.run(async sleep => {
    draw();
    const S = el.querySelector('[data-m=s]'), A = el.querySelector('[data-m=a]'), p = Math.floor(Math.random() * NP);
    await Promise.all([flash(sleep, [S.querySelector(`[data-p="${p}"]`), S.querySelector('[data-u]')], 'hit', 's'), flash(sleep, [A.querySelector(`[data-p="${p}"]`)], 'hit', 'a')]);
    S.querySelector('[data-u]').insertAdjacentHTML('beforeend', '<span class="nq-tag">jointure</span>');
  });
  el.querySelector('[data-k=ren]').onclick = () => R.run(async sleep => {
    name = name === 'Claude Ho' ? 'Claude Hoarau' : 'Claude Ho';
    draw();
    const S = el.querySelector('[data-m=s]'), A = el.querySelector('[data-m=a]');
    qa(A, '[data-dn]').forEach(s => { s.textContent = name === 'Claude Ho' ? 'Claude Hoarau' : 'Claude Ho'; });
    const posts = qa(A, '[data-p]');
    await Promise.all([flash(sleep, [S.querySelector('[data-u]')], 'write', 's'), (async () => {
      await flash(sleep, [A.querySelector('[data-u]')], 'write', 'a');
      for (const p of posts) { p.classList.add('write'); p.querySelector('[data-dn]').textContent = name; cnt.a++; A.querySelector('[data-c]').textContent = cnt.a; await sleep(380); }
    })()]);
  });
  el.querySelector('[data-k=z]').onclick = () => { R.cancel(); cnt.s = 0; cnt.a = 0; draw(); };
  el.querySelector('[data-i=r]').oninput = e => { r = +e.target.value; R.cancel(); draw(); };
  draw();
}

/* ================================================================== 13. index persistent sur [auteur, parution] */
function indexViz(el) {
  const DOCS = [{ k: '001', a: 'Ursula K. Le Guin', y: 1974 }, { k: '002', a: 'Emily Brontë', y: 1847 }, { k: '003', a: 'Alain Damasio', y: 1999 }, { k: '004', a: 'Alain Damasio', y: 2019 }, { k: '005', a: 'Ursula K. Le Guin', y: 1974 }];
  const AC = {
    no: ['—', null, null],
    eq: ['== "Alain Damasio"', 'eq', a => a === 'Alain Damasio', 'd.auteur == "Alain Damasio"'],
    gt: ['> "E"', 'ineq', a => a > 'E', 'd.auteur > "E"'],
    rg: ['entre "A" et "F"', 'ineq', a => a > 'A' && a < 'F', 'd.auteur > "A" && d.auteur < "F"'],
  };
  const PC = {
    no: ['—', null, null],
    eq: ['== 2019', 'eq', y => y === 2019, 'd.parution == 2019'],
    eq2: ['== 1847', 'eq', y => y === 1847, 'd.parution == 1847'],
    gt: ['> 2000', 'ineq', y => y > 2000, 'd.parution > 2000'],
    lt: ['< 1990', 'ineq', y => y < 1990, 'd.parution < 1990'],
  };
  let ac = 'eq', pc = 'gt', srt = false;
  el.innerHTML = head('Cet index sert-il ma requête ?', 'Compose les FILTER, puis exécute : si l\'index est utilisable, on descend l\'arbre et on n\'ouvre que les bons documents ; sinon, on ouvre tout.') +
    `<div class="viz-ctrl"><span class="nq-lab">auteur</span>${chips('ia', Object.entries(AC).map(([k, v]) => [k, esc(v[0])]), ac)}</div>
     <div class="viz-ctrl"><span class="nq-lab">parution</span>${chips('ip', Object.entries(PC).map(([k, v]) => [k, esc(v[0])]), pc)}</div>
     <div class="viz-ctrl"><label><input type="checkbox" data-i="s"> <code>SORT d.parution</code></label><button type="button" class="btn small primary" data-k="go">▶ Exécuter</button></div>
     <pre class="nq-code" data-o="aql"></pre><p class="viz-out nq-verdict" data-o="v"></p><div data-s="stage"></div><div class="nq-stats" data-o="stats"></div><p class="viz-out" data-o="out"></p>`;
  const R = runner(el);
  const L1 = [['Alain Damasio', 62], ['Emily Brontë', 180], ['Ursula K. Le Guin', 298]];
  const L2 = [['Alain Damasio', 1999, 30, ['003']], ['Alain Damasio', 2019, 94, ['004']], ['Emily Brontë', 1847, 180, ['002']], ['Ursula K. Le Guin', 1974, 298, ['001', '005']]];
  const verdict = () => {
    const a = AC[ac][1], p = PC[pc][1];
    if (!a && !p && !srt) return [false, 'Aucun filtre : il faut lire toute la collection.'];
    if (!a) return [false, '❌ <b>Règle 1</b> : le premier champ de l\'index (<code>auteur</code>) n\'est pas interrogé.'];
    if (a === 'ineq' && p) return [false, '❌ <b>Règle 2</b> : l\'inégalité porte sur <code>auteur</code>, qui n\'est pas le dernier champ interrogé.'];
    if (a === 'ineq' && srt) return [false, '❌ Après une inégalité sur <code>auteur</code>, l\'index n\'est plus trié par <code>parution</code> : il ne peut pas servir au tri.'];
    return [true, `✔ Index utilisé : ${a === 'eq' ? 'égalité sur le premier champ' : 'inégalité (ou rang) sur le dernier champ interrogé'}${p ? (p === 'eq' ? ', égalité sur le second' : ', inégalité sur le second (le dernier)') : ''}${srt ? ', puis tri déjà fait par l\'index' : ''}.`];
  };
  const fa = a => (AC[ac][2] ? AC[ac][2](a) : true), fp = y => (PC[pc][2] ? PC[pc][2](y) : true);
  const draw = () => {
    press(el, 'ia', ac); press(el, 'ip', pc);
    const f = [AC[ac][3], PC[pc][3]].filter(Boolean);
    el.querySelector('[data-o=aql]').innerHTML = esc(`FOR d IN ouvrages\n${f.map(x => `  FILTER ${x}\n`).join('')}${srt ? '  SORT d.parution\n' : ''}  RETURN d`);
    const [ok, txt] = verdict();
    el.querySelector('[data-o=v]').innerHTML = txt;
    el.querySelector('[data-o=v]').className = 'viz-out nq-verdict ' + (ok ? 'good' : 'bad');
    let g = `<text x="180" y="18" text-anchor="middle" class="vz-t vz-s">index persistent [ auteur, parution ]</text>`;
    L1.forEach(([a, x]) => { g += `<line x1="180" y1="24" x2="${x}" y2="58" class="nq-tl" data-e1="${esc(a)}"/>`; });
    L2.forEach(([a, y, x]) => { const px = L1.find(l => l[0] === a)[1]; g += `<line x1="${px}" y1="76" x2="${x}" y2="114" class="nq-tl" data-e2="${y}"/><line x1="${x}" y1="130" x2="${x}" y2="156" class="nq-tl" data-e3="${y}"/>`; });
    g += L1.map(([a, x]) => `<g class="nq-tn" data-n1="${esc(a)}"><rect x="${x - 56}" y="56" width="112" height="22" rx="6"/><text x="${x}" y="71" text-anchor="middle">${esc(a.length > 15 ? 'U. K. Le Guin' : a)}</text></g>`).join('');
    g += L2.map(([, y, x]) => `<g class="nq-tn" data-n2="${y}"><rect x="${x - 26}" y="112" width="52" height="20" rx="6"/><text x="${x}" y="126" text-anchor="middle">${y}</text></g>`).join('');
    g += L2.map(([, y, x, ks]) => `<text x="${x}" y="170" text-anchor="middle" class="nq-keyt" data-n3="${y}">_key ${ks.join(', ')}</text>`).join('');
    g += `<text x="6" y="200" class="vz-t vz-s">documents (stockage : chaque ouverture = une entrée-sortie)</text>`;
    g += DOCS.map((d, i) => `<g class="nq-dk" data-d="${d.k}"><rect x="${8 + i * 70}" y="206" width="64" height="50" rx="6"/><text x="${40 + i * 70}" y="220" text-anchor="middle" class="nq-dt2">${d.k}</text><text x="${40 + i * 70}" y="234" text-anchor="middle" class="nq-dt3">${d.a.split(' ').pop()}</text><text x="${40 + i * 70}" y="248" text-anchor="middle" class="nq-dt3">${d.y}</text></g>`).join('');
    el.querySelector('[data-s=stage]').innerHTML = svg(360, 260, g, 'Arbre de l\'index et documents', 'nq-mid');
    el.querySelector('[data-o=stats]').innerHTML = '';
    el.querySelector('[data-o=out]').innerHTML = 'Appuie sur ▶ Exécuter.';
  };
  const run = () => R.run(async sleep => {
    draw();
    const [ok] = verdict(), st = el.querySelector('[data-o=stats]'), out = el.querySelector('[data-o=out]');
    const hits = DOCS.filter(d => fa(d.a) && fp(d.y));
    let opened = 0;
    const upd = () => { st.innerHTML = `<span>documents ouverts : <b>${opened}</b></span><span>retournés : <b>${hits.length}</b></span>`; };
    upd();
    const S = (s, v) => el.querySelector(`[${s}="${v}"]`);
    if (ok) {
      out.innerHTML = 'On descend l\'arbre de l\'index (trié) : O(log n).';
      for (const [a] of L1.filter(([a]) => fa(a))) { S('data-n1', a).classList.add('on'); S('data-e1', a).classList.add('on'); await sleep(420); }
      for (const [a, y] of L2.filter(([a, y]) => fa(a) && fp(y))) { S('data-n2', y).classList.add('on'); S('data-e2', y).classList.add('on'); await sleep(380); S('data-e3', y).classList.add('on'); S('data-n3', y).classList.add('on'); await sleep(300); }
      for (const d of (srt ? hits.slice().sort((x, y) => x.y - y.y) : hits)) { opened++; upd(); S('data-d', d.k).classList.add('open', 'hit'); await sleep(380); }
      out.innerHTML = `L'index ne stocke que les <code>_key</code> : on n'ouvre que les <b>${hits.length}</b> document${hits.length > 1 ? 's' : ''} retenu${hits.length > 1 ? 's' : ''}${srt ? ', déjà dans l\'ordre de parution' : ''}.`;
    } else {
      out.innerHTML = 'Index inutilisable : parcours complet de la collection, O(n).';
      for (const d of DOCS) { opened++; upd(); const n = S('data-d', d.k); n.classList.add('open'); await sleep(420); n.classList.add(fa(d.a) && fp(d.y) ? 'hit' : 'miss'); }
      out.innerHTML = `Il a fallu ouvrir les <b>${DOCS.length}</b> documents pour en garder ${hits.length}${srt ? ', puis les trier' : ''}. Sur 230 000 documents, la différence se sent !`;
    }
  });
  qa(el, '[data-ia]').forEach(b => { b.onclick = () => { ac = b.dataset.ia; R.cancel(); draw(); }; });
  qa(el, '[data-ip]').forEach(b => { b.onclick = () => { pc = b.dataset.ip; R.cancel(); draw(); }; });
  el.querySelector('[data-i=s]').onchange = e => { srt = e.target.checked; R.cancel(); draw(); };
  el.querySelector('[data-k=go]').onclick = run;
  draw();
}

const VIZ = {
  'nq-join': joinViz,
  'nq-cluster': clusterViz,
  'nq-cap': capViz,
  'nq-families': familiesViz,
  'nq-model': modelViz,
  'nq-recipe': recipeViz,
  'nq-couchview': couchViz,
  'nq-couchkey': couchKeyViz,
  'nq-aql': aqlViz,
  'nq-traversal': traversalViz,
  'nq-friends': friendsViz,
  'nq-redund': redundViz,
  'nq-index': indexViz,
};
export function mountViz(root) { root.querySelectorAll('[data-viz]').forEach(el => { const f = VIZ[el.dataset.viz]; if (f && !el.dataset.ready) { el.dataset.ready = '1'; try { f(el); } catch (e) { el.textContent = ''; console.error(e); } } }); }
