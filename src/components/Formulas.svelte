<script>
  // Formulaire : toutes les formules à connaître, regroupées par chapitre. Mode « s'entraîner » : formules cachées.
  import { tick } from 'svelte';
  import { kv } from '../lib/progress.js';
  import { typeset } from '../lib/math.js';
  import { afterNav } from '../lib/motion.js';
  import { reveal as revealOnScroll } from '../lib/motion.js';
  import { lens, inkReveal } from '../lib/motion-components.js';

  let { course, data } = $props();
  const ui = kv(course.id);
  const groups = data.formulas;
  const chapters = (data.chapters || []).filter(c => groups.some(g => g.ch === c.id));
  let ch = $state(ui.get('formCh', 'all'));
  let hide = $state(ui.get('formHide', false));
  let shown = $state({});
  let body = $state(null);

  const list = $derived(ch === 'all' ? groups : groups.filter(g => g.ch === ch));
  const name = id => (chapters.find(c => c.id === id) || {}).name || id;

  function setCh(v) { ch = v; ui.set('formCh', v); shown = {}; }
  function toggleHide() { hide = !hide; ui.set('formHide', hide); shown = {}; }
  function reveal(k) { shown = { ...shown, [k]: !shown[k] }; }

  $effect(() => { list; hide; shown; tick().then(afterNav).then(() => { if (body) { typeset(body); revealOnScroll(body); inkReveal(body); } }); });
</script>

<div class="form-bar">
  <div class="chips" role="tablist" aria-label="Chapitres" use:lens>
    <button class="chip" aria-pressed={ch === 'all'} onclick={() => setCh('all')}>Tout</button>
    {#each chapters as c (c.id)}<button class="chip" aria-pressed={ch === c.id} onclick={() => setCh(c.id)}>{c.name}</button>{/each}
  </div>
  <div class="row">
    <button class="btn small" aria-pressed={hide} class:on-ok={hide} onclick={toggleHide}>{hide ? '✓ Formules cachées' : 'S\'entraîner : cacher les formules'}</button>
    <button class="btn small" onclick={() => print()}>Imprimer</button>
  </div>
</div>
{#if hide}<p class="lead form-hint">Retrouve chaque formule de tête, puis clique dessus pour vérifier.</p>{/if}

<div class="form-list" class:mc-hide={hide} bind:this={body}>
  {#each list as g, gi (g.ch + g.t)}
    <section class="card form-group" style:--gi={Math.min(gi, 6)}>
      <header><span class="tag">{name(g.ch)}</span><h2>{g.t}</h2></header>
      <div class="form-items">
        {#each g.items as f, fi}
          {@const k = gi + ':' + fi}
          <div class="form-item" class:must={f.must} style:--fi={Math.min(fi, 8)}>
            <div class="form-name">{f.n}{#if f.must}<span class="must-tag">à savoir démontrer</span>{/if}</div>
            {#if hide && !shown[k]}
              <button class="form-mask" onclick={() => reveal(k)}>Afficher la formule</button>
            {:else}
              <div class="form-tex" role={hide ? 'button' : undefined} tabindex={hide ? 0 : undefined} onclick={() => hide && reveal(k)} onkeydown={e => hide && e.key === 'Enter' && reveal(k)}>{@html '\\[' + f.tex.replaceAll('&', '&amp;').replaceAll('<', '&lt;') + '\\]'}</div>
              {#if f.note}<p class="form-note">{@html f.note}</p>{/if}
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/each}
</div>
