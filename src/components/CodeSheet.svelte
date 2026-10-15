<script>
  // Mémo de code : les commandes à connaître, regroupées par thème, avec recherche, copie et mode entraînement.
  import { kv } from '../lib/progress.js';
  import { highlight } from '../lib/code.js';
  import { lens } from '../lib/motion-components.js';

  let { course, data } = $props();
  const ui = kv(course.id);
  const groups = data.codesheet;
  const parts = [...new Set(groups.map(g => g.part).filter(Boolean))];
  let part = $state(parts.includes(ui.get('memoPart')) ? ui.get('memoPart') : 'all');
  let q = $state('');
  let hide = $state(ui.get('memoHide', false));
  let shown = $state({});
  let copied = $state('');

  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const list = $derived.by(() => {
    const t = norm(q.trim());
    return groups
      .filter(g => part === 'all' || g.part === part)
      .map(g => ({ ...g, items: t ? g.items.filter(it => norm(it.n + ' ' + it.code + ' ' + (it.note || '') + ' ' + g.t).includes(t)) : g.items }))
      .filter(g => g.items.length);
  });
  const total = $derived(list.reduce((s, g) => s + g.items.length, 0));

  function setPart(v) { part = v; ui.set('memoPart', v); }
  function toggleHide() { hide = !hide; ui.set('memoHide', hide); shown = {}; }
  async function copy(code, k) {
    try { await navigator.clipboard.writeText(code); copied = k; setTimeout(() => { if (copied === k) copied = ''; }, 1400); } catch (e) { /* presse-papiers indisponible */ }
  }
</script>

<div class="form-bar">
  {#if parts.length > 1}
    <div class="chips" role="tablist" aria-label="Langages" use:lens>
      <button class="chip" aria-pressed={part === 'all'} onclick={() => setPart('all')}>Tout</button>
      {#each parts as p}<button class="chip" aria-pressed={part === p} onclick={() => setPart(p)}>{p}</button>{/each}
    </div>
  {/if}
  <div class="row memo-tools">
    <input class="memo-search" type="search" placeholder="Chercher une fonction, un mot…" bind:value={q} aria-label="Chercher dans le mémo" />
    <button class="btn small" aria-pressed={hide} class:on-ok={hide} onclick={toggleHide}>{hide ? '✓ Code caché' : 'S\'entraîner : cacher le code'}</button>
    <button class="btn small" onclick={() => print()}>Imprimer</button>
  </div>
  {#if data.codesheetNote}<p class="math-note">{@html data.codesheetNote}</p>{/if}
  {#if hide}<p class="lead form-hint">Retrouve le code de tête à partir de sa description, puis clique pour vérifier.</p>{/if}
</div>

{#if !total}<p class="lead">Rien ne correspond à « {q} ».</p>{/if}
<div class="form-list" class:mc-hide={hide}>
  {#each list as g, gi (g.part + g.t)}
    <section class="card form-group" style:--gi={Math.min(gi, 6)}>
      <header><span class="tag">{g.lang}{#if g.src} · {g.src}{/if}</span><h2>{g.t}</h2>{#if g.d}<p class="math-note">{@html g.d}</p>{/if}</header>
      <div class="memo-items">
        {#each g.items as it, ii}
          {@const k = gi + ':' + ii}
          <div class="memo-item" style:--fi={Math.min(ii, 8)}>
            <div class="memo-head">
              <span class="form-name">{@html it.n}</span>
              {#if !hide || shown[k]}<button class="btn small mc-copy" class:is-copied={copied === k} onclick={() => copy(it.code, k)}>{copied === k ? 'Copié ✓' : 'Copier'}</button>{/if}
            </div>
            {#if hide && !shown[k]}
              <button class="form-mask" onclick={() => (shown = { ...shown, [k]: true })}>Afficher le code</button>
            {:else}
              <pre class="memo-code"><code>{@html highlight(it.code, g.lang)}</code></pre>
              {#if it.note}<p class="form-note">{@html it.note}</p>{/if}
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/each}
</div>
