<script>
  import { tick } from 'svelte';
  import { kv, progress, setVal } from '../lib/progress.js';
  import { typeset } from '../lib/math.js';
  import { reveal, confetti } from '../lib/motion.js';

  let { course, data } = $props();
  const ui = kv(course.id);
  const prog = progress(course.id);
  const chapters = data.chapters;
  let ch = $state(chapters.find(c => c.id === ui.get('ficheCh')) ? ui.get('ficheCh') : chapters[0].id);
  let body = $state(null);
  let pendingAnchor = null;

  const i = $derived(chapters.findIndex(c => c.id === ch));
  const read = $derived(($prog['fiche:' + ch] || {}).v === 1);

  function markRead(on) {
    const all = on && chapters.length > 1 && chapters.every(c => c.id === ch || ($prog['fiche:' + c.id] || {}).v === 1);
    setVal(course.id, 'fiche:' + ch, on ? 1 : 0);
    if (all) confetti();
  }
  async function show(id, anchor) {
    ch = id; ui.set('ficheCh', id); pendingAnchor = anchor || null;
    if (!anchor && body && body.getBoundingClientRect().top < 0) body.scrollIntoView({ block: 'start' });
  }

  $effect(() => {
    ch; // relancé à chaque changement de chapitre
    tick().then(async () => {
      if (!body) return;
      typeset(body);
      if (course.viz && body.querySelector('[data-viz]')) {
        try { const m = await course.viz(); m.mountViz(body); typeset(body); } catch (e) { console.error(e); }
      }
      if (pendingAnchor) { const t = document.getElementById(pendingAnchor); if (t) t.scrollIntoView({ block: 'start' }); pendingAnchor = null; }
      reveal(body);
    });
  });
</script>

<div class="chips" role="tablist" aria-label="Chapitres">
  {#each chapters as c (c.id)}
    <button class="chip" aria-pressed={c.id === ch} onclick={() => show(c.id)}>
      {#if ($prog['fiche:' + c.id] || {}).v === 1}<span class="chip-ok" aria-label="lue">✓</span>{/if}{c.name}
    </button>
  {/each}
</div>

{#if course.todo}
  <aside class="card todo" aria-label={course.todo.title}>
    <h3>{course.todo.title}</h3>
    <ul>
      {#each course.todo.items as it}
        <li>{@html it.html} <button class="btn small" onclick={() => show(it.go, it.anchor)}>{it.label}</button></li>
      {/each}
    </ul>
  </aside>
{/if}

<article class="card fiche" bind:this={body}>
  {#key ch}
    <header><span class="tag">Chapitre {i + 1}/{chapters.length}</span><h2>{chapters[i].name}</h2></header>
    {@html data.fiches[ch] || ''}
  {/key}
  <label class="read-toggle">
    <input type="checkbox" checked={read} onchange={e => markRead(e.currentTarget.checked)} />
    J'ai lu et compris ce chapitre
  </label>
  <nav class="fiche-nav" aria-label="Chapitres">
    {#if i > 0}<button class="btn" onclick={() => show(chapters[i - 1].id)}><small>← Précédent</small>{chapters[i - 1].name}</button>{/if}
    {#if i < chapters.length - 1}<button class="btn next" onclick={() => show(chapters[i + 1].id)}><small>Suivant →</small>{chapters[i + 1].name}</button>{/if}
  </nav>
</article>
