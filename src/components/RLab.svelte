<script>
  // Labo R : des blocs de code R exécutables dans le navigateur (webR), dans une même session R,
  // comme les blocs d'un fichier R Markdown. Code de départ : celui de l'enseignante.
  import { tick } from 'svelte';
  import { kv, progress, setVal } from '../lib/progress.js';
  import { typeset } from '../lib/math.js';
  import { runR, resetR, rState, rMessage } from '../lib/webr.js';

  let { course, data } = $props();
  const ui = kv(course.id);
  const prog = progress(course.id);
  const labs = data.rlabs;

  let labId = $state(labs.find(l => l.id === ui.get('rlab')) ? ui.get('rlab') : labs[0].id);
  const lab = $derived(labs.find(l => l.id === labId));
  const KEY = (l, c) => `rcode:${l}:${c}`;

  let codes = $state({});
  let results = $state({});
  let running = $state({});
  let showSol = $state({});
  let body = $state(null);

  function load() {
    const c = {};
    for (const ch of lab.chunks) c[ch.id] = ui.get(KEY(lab.id, ch.id)) ?? ch.code ?? '';
    codes = c; results = {}; showSol = {};
  }
  $effect(() => { lab; load(); tick().then(() => body && typeset(body)); });
  $effect(() => { showSol; tick().then(() => body && typeset(body)); });

  function choose(id) { labId = id; ui.set('rlab', id); }
  function edit(ch, v) { codes = { ...codes, [ch.id]: v }; ui.set(KEY(lab.id, ch.id), v); }
  function restore(ch, v) {
    if (codes[ch.id] && codes[ch.id] !== v && !confirm('Remplacer ton code de ce bloc ?')) return;
    edit(ch, v);
  }

  async function run(ch) {
    running = { ...running, [ch.id]: true };
    const r = await runR(codes[ch.id] || '');
    running = { ...running, [ch.id]: false };
    results = { ...results, [ch.id]: r };
  }
  async function runAll() { for (const ch of lab.chunks) if ((codes[ch.id] || '').trim()) await run(ch); }
  async function reset() { await resetR(); results = {}; }

  function onKey(e, ch) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(ch); return; }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const t = e.currentTarget; t.setRangeText('  ', t.selectionStart, t.selectionEnd, 'end'); edit(ch, t.value);
    }
  }
  const rows = s => Math.min(24, Math.max(3, (s || '').split('\n').length + 1));

  // dessine les graphiques R (ImageBitmap) dans des canevas
  function bitmap(canvas, img) {
    canvas.width = img.width; canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0);
    return { update(n) { canvas.width = n.width; canvas.height = n.height; canvas.getContext('2d').drawImage(n, 0, 0); } };
  }
  const done = id => ($prog['rlab:' + id] || {}).v === 1;
</script>

<div class="chips" role="tablist" aria-label="TP et exercices en R">
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
      <button class="btn small" onclick={reset} disabled={$rState === 'off'} title="Efface tous les objets de la session R">Vider la session R</button>
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
          <span class="r-src">{ch.src || 'R'}</span>
          <span class="r-btns">
            <button class="btn primary small" onclick={() => run(ch)} disabled={running[ch.id]} title="Ctrl/⌘ + Entrée">{running[ch.id] ? 'Calcul…' : '▶ Exécuter'}</button>
            {#if ch.code !== undefined && codes[ch.id] !== ch.code}<button class="btn small" onclick={() => restore(ch, ch.code)}>Code de départ</button>{/if}
            {#if ch.sol}<button class="btn small" aria-pressed={!!showSol[ch.id]} onclick={() => (showSol = { ...showSol, [ch.id]: !showSol[ch.id] })}>{showSol[ch.id] ? 'Masquer le corrigé' : 'Voir le corrigé'}</button>{/if}
          </span>
        </div>
        <textarea class="r-code" rows={rows(codes[ch.id])} value={codes[ch.id]} oninput={e => edit(ch, e.currentTarget.value)} onkeydown={e => onKey(e, ch)}
          spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code R"></textarea>
      </div>
      {/if}
      {#if running[ch.id] && ($rState === 'loading' || $rMessage)}
        <p class="r-busy" role="status"><span class="r-dot"></span>{$rMessage || 'Chargement de R…'}</p>
      {/if}
      {#if r}
        <div class="r-out" aria-live="polite">
          {#each r.out as o}<pre class="r-{o.type}">{o.text}</pre>{/each}
          {#if r.error}<pre class="r-error">Erreur : {r.error}</pre>{/if}
          {#each r.images as img}<canvas class="r-plot" use:bitmap={img}></canvas>{/each}
          {#if !r.out.length && !r.error && !r.images.length}<p class="r-none">Exécuté, sans sortie.</p>{/if}
        </div>
      {/if}
      </div>
      {#if ch.sol && showSol[ch.id]}
        <div class="r-sol">
          <div class="r-bar"><span class="r-src">Corrigé de l'enseignante</span><button class="btn small" onclick={() => restore(ch, ch.sol)}>Copier dans le bloc</button></div>
          {#if ch.solHtml}<div class="r-solhtml">{@html ch.solHtml}</div>{:else}<pre><code>{ch.sol}</code></pre>{/if}
        </div>
      {/if}
      </div>
      {#if ch.after}<div class="r-text r-after">{@html ch.after}</div>{/if}
    </section>
  {/each}
  <label class="read-toggle">
    <input type="checkbox" checked={done(lab.id)} onchange={e => setVal(course.id, 'rlab:' + lab.id, e.currentTarget.checked ? 1 : 0)} />
    J'ai fait et compris ce TP / cet exercice
  </label>
</article>
