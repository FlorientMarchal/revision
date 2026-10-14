<script>
  // Labo de code : des blocs exécutables dans le navigateur, dans une même session, comme les blocs d'un
  // fichier R Markdown ou d'un notebook. lang = 'r' (webR) ou 'py' (Pyodide). Code de départ : celui de l'enseignant·e.
  import { tick } from 'svelte';
  import { kv, progress, setVal } from '../lib/progress.js';
  import { typeset } from '../lib/math.js';
  import { lens } from '../lib/motion-components.js';
  import { runR, resetR, rState as rSt, rMessage as rMsg } from '../lib/webr.js';
  import { runPy, resetPy, pyState, pyMessage, provideFiles } from '../lib/pyodide.js';

  let { course, data, lang = 'r' } = $props();
  const PY = lang === 'py';
  const L = PY
    ? { name: 'Python', labs: 'pylabs', ui: 'pylab', code: 'pycode', done: 'pylab', run: runPy, reset: resetPy, state: pyState, msg: pyMessage }
    : { name: 'R', labs: 'rlabs', ui: 'rlab', code: 'rcode', done: 'rlab', run: runR, reset: resetR, state: rSt, msg: rMsg };
  const rState = L.state, rMessage = L.msg;
  if (PY && data.pyfiles) provideFiles(data.pyfiles);
  const ui = kv(course.id);
  const prog = progress(course.id);
  const labs = data[L.labs];

  let labId = $state(labs.find(l => l.id === ui.get(L.ui)) ? ui.get(L.ui) : labs[0].id);
  const lab = $derived(labs.find(l => l.id === labId));
  const KEY = (l, c) => `${L.code}:${l}:${c}`;

  let codes = $state({});
  let results = $state({});
  let running = $state({});
  let showSol = $state({});
  let flash = $state({});   // état bref après exécution : 'ok' (coche) ou 'err' (croix) sur le bouton
  let body = $state(null);

  function load() {
    const c = {};
    for (const ch of lab.chunks) c[ch.id] = ui.get(KEY(lab.id, ch.id)) ?? ch.code ?? '';
    codes = c; results = {}; showSol = {};
  }
  $effect(() => { lab; load(); tick().then(() => body && typeset(body)); });
  $effect(() => { showSol; tick().then(() => body && typeset(body)); });

  function choose(id) { labId = id; ui.set(L.ui, id); }
  function edit(ch, v) { codes = { ...codes, [ch.id]: v }; ui.set(KEY(lab.id, ch.id), v); }
  function restore(ch, v) {
    if (codes[ch.id] && codes[ch.id] !== v && !confirm('Remplacer ton code de ce bloc ?')) return;
    edit(ch, v);
  }

  async function run(ch) {
    running = { ...running, [ch.id]: true };
    let r;
    try { r = await L.run(codes[ch.id] || ''); }
    catch (e) { r = { out: [], images: [], error: (e && e.message) || String(e) }; }
    running = { ...running, [ch.id]: false };
    results = { ...results, [ch.id]: r };
    flash = { ...flash, [ch.id]: r.error ? 'err' : 'ok' };
    setTimeout(() => { if (flash[ch.id]) flash = { ...flash, [ch.id]: '' }; }, 1500);
  }
  async function runAll() { for (const ch of lab.chunks) if ((codes[ch.id] || '').trim()) await run(ch); }
  async function reset() { await L.reset(); results = {}; }

  function onKey(e, ch) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(ch); return; }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const t = e.currentTarget; t.setRangeText(PY ? '    ' : '  ', t.selectionStart, t.selectionEnd, 'end'); edit(ch, t.value);
    }
  }
  const rows = s => Math.min(24, Math.max(3, (s || '').split('\n').length + 1));

  // dessine les graphiques R (ImageBitmap) dans des canevas
  function bitmap(canvas, img) {
    canvas.width = img.width; canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0);
    return { update(n) { canvas.width = n.width; canvas.height = n.height; canvas.getContext('2d').drawImage(n, 0, 0); } };
  }
  const done = id => ($prog[L.done + ':' + id] || {}).v === 1;
</script>

<div class="chips" role="tablist" aria-label="TP et exercices en {L.name}" use:lens>
  {#each labs as l (l.id)}
    <button class="chip" aria-pressed={l.id === labId} onclick={() => choose(l.id)}>{#if done(l.id)}<span class="chip-ok" aria-label="fait">✓</span>{/if}{l.short}</button>
  {/each}
</div>

{#if $rState === 'error'}<p class="card r-error-box" role="alert">{$rMessage}</p>{/if}

<article class="card r-lab" bind:this={body}>
  <header>
    <h2>{lab.t}</h2>
    {#if lab.d}<div class="lead">{@html lab.d}</div>{/if}
    <div class="r-tools">
      <button class="btn small" onclick={runAll}>Tout exécuter</button>
      <button class="btn small" onclick={reset} disabled={$rState === 'off'} title="Efface tous les objets de la session {L.name}">Vider la session {L.name}</button>
    </div>
  </header>
  {#each lab.chunks as ch (ch.id)}
    {@const r = results[ch.id]}
    <section class="r-chunk">
      {#if ch.t}<h3>{ch.t}</h3>{/if}
      {#if ch.html}<div class="r-text">{@html ch.html}</div>{/if}
      <div class="r-work" class:with-sol={ch.sol && showSol[ch.id]}>
      <div class="r-mine">
      {#if ch.code !== undefined || ch.sol}
      <div class="r-editor">
        <div class="r-bar">
          <span class="r-src">{ch.src || L.name}</span>
          <span class="r-btns">
            <button class="btn primary small mc-run" class:is-run={running[ch.id]} class:is-done={!running[ch.id] && flash[ch.id] === 'ok'} class:is-err={!running[ch.id] && flash[ch.id] === 'err'} onclick={() => run(ch)} disabled={running[ch.id]} title="Ctrl/⌘ + Entrée"><span class="mc-run-ic" aria-hidden="true"><svg viewBox="0 0 16 16"><path class="i-play" d="M5 3.2v9.6L12.6 8z" /><circle class="i-spin" cx="8" cy="8" r="5.6" pathLength="1" /><path class="i-ok" d="M3.6 8.4l3 3 5.8-6.6" pathLength="1" /><path class="i-err" d="M5 5l6 6M11 5l-6 6" pathLength="1" /></svg></span>{running[ch.id] ? 'Calcul…' : 'Exécuter'}</button>
            {#if ch.code !== undefined && codes[ch.id] !== ch.code}<button class="btn small" onclick={() => restore(ch, ch.code)}>Code de départ</button>{/if}
            {#if ch.sol}<button class="btn small" aria-pressed={!!showSol[ch.id]} onclick={() => (showSol = { ...showSol, [ch.id]: !showSol[ch.id] })}>{showSol[ch.id] ? 'Masquer le corrigé' : 'Voir le corrigé'}</button>{/if}
          </span>
        </div>
        <textarea class="r-code" rows={rows(codes[ch.id])} value={codes[ch.id]} oninput={e => edit(ch, e.currentTarget.value)} onkeydown={e => onKey(e, ch)}
          spellcheck="false" autocapitalize="off" autocomplete="off" aria-label={'Code ' + L.name}></textarea>
      </div>
      {/if}
      {#if running[ch.id]}
        <p class="r-busy" role="status"><span class="r-spin" aria-hidden="true"></span>{$rMessage || ($rState === 'loading' ? 'Chargement de ' + L.name + '…' : 'Exécution en cours…')}</p>
      {:else if r}
        <div class="r-out" aria-live="polite">
          <div class="r-text-out">
            {#each r.out as o, n}<pre class="r-{o.type}" style:--n={Math.min(n, 12)}>{o.text}</pre>{/each}
            {#if r.error}<pre class="r-error">Erreur : {r.error}</pre>{/if}
          </div>
          {#each r.images as img, n}<canvas class="r-plot" style:--n={Math.min(n, 6)} use:bitmap={img}></canvas>{/each}
          {#if !r.out.length && !r.error && !r.images.length}<p class="r-none">Exécuté, sans sortie.</p>{/if}
        </div>
      {/if}
      </div>
      {#if ch.sol && showSol[ch.id]}
        <div class="r-sol">
          <div class="r-bar"><span class="r-src">{ch.solLabel || lab.solLabel || "Corrigé de l'enseignante"}</span><button class="btn small" onclick={() => restore(ch, ch.sol)}>Copier dans le bloc</button></div>
          {#if ch.solHtml}<div class="r-solhtml">{@html ch.solHtml}</div>{:else}<pre><code>{ch.sol}</code></pre>{/if}
        </div>
      {/if}
      </div>
      {#if ch.after}<div class="r-text r-after">{@html ch.after}</div>{/if}
    </section>
  {/each}
  <label class="read-toggle">
    <input type="checkbox" checked={done(lab.id)} onchange={e => setVal(course.id, L.done + ':' + lab.id, e.currentTarget.checked ? 1 : 0)} />
    J'ai fait et compris ce TP / cet exercice
  </label>
</article>
