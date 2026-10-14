<script>
  // Le cours en entier : une leçon par chapitre, avec sommaire, encadrés, démonstrations et illustrations.
  import { tick } from 'svelte';
  import { kv, progress, setVal } from '../lib/progress.js';
  import { typeset } from '../lib/math.js';

  let { course, data } = $props();
  const ui = kv(course.id);
  const prog = progress(course.id);
  const L = data.lessons;
  let id = $state(L.find(l => l.id === ui.get('lesson')) ? ui.get('lesson') : L[0].id);
  let body = $state(null);
  let pendingAnchor = null;

  const i = $derived(L.findIndex(l => l.id === id));
  const lesson = $derived(L[i]);
  const done = lid => ($prog['lesson:' + lid] || {}).v === 1;

  function show(lid, anchor) {
    id = lid; ui.set('lesson', lid); pendingAnchor = anchor || null;
    if (!anchor && body && body.getBoundingClientRect().top < 0) body.scrollIntoView({ block: 'start' });
  }
  function goto(e, sid) {
    e.preventDefault();
    const t = document.getElementById(lesson.id + '-' + sid);
    if (t) t.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  $effect(() => {
    id;
    tick().then(async () => {
      if (!body) return;
      typeset(body);
      if (course.viz && body.querySelector('[data-viz]')) {
        try { const m = await course.viz(); m.mountViz(body); typeset(body); } catch (e) { console.error(e); }
      }
      if (pendingAnchor) { const t = document.getElementById(pendingAnchor); if (t) t.scrollIntoView({ block: 'start' }); pendingAnchor = null; }
    });
  });
</script>

<div class="chips" role="tablist" aria-label="Leçons">
  {#each L as l, k (l.id)}
    <button class="chip" aria-pressed={l.id === id} onclick={() => show(l.id)}>
      {#if done(l.id)}<span class="chip-ok" aria-label="lue">✓</span>{/if}<span class="chip-n">{k + 1}</span>{l.short}
    </button>
  {/each}
</div>

<article class="card lesson" bind:this={body}>
  {#key id}
    <header class="lesson-head">
      <span class="tag">Leçon {i + 1}/{L.length}{#if lesson.src} · {lesson.src}{/if}</span>
      <h2>{lesson.t}</h2>
      {#if lesson.sub}<p class="lead">{lesson.sub}</p>{/if}
    </header>
    <nav class="lesson-toc" aria-label="Sommaire">
      <b>Sommaire</b>
      <ol>
        {#each lesson.sections as s, k}
          <li><a href={'#' + lesson.id + '-' + s.id} onclick={e => goto(e, s.id)}><span class="toc-n">{String(k + 1).padStart(2, '0')}</span><span><b>{s.t}</b>{#if s.sub}<small>{s.sub}</small>{/if}</span></a></li>
        {/each}
      </ol>
    </nav>
    {#if lesson.goals}
      <div class="box goal"><div class="box-h">Objectifs de la leçon</div><ul>{#each lesson.goals as g}<li>{@html g}</li>{/each}</ul></div>
    {/if}
    {#each lesson.sections as s, k}
      <section class="lesson-sec" id={lesson.id + '-' + s.id}>
        <h3><span class="sec-n">{String(k + 1).padStart(2, '0')}</span>{s.t}</h3>
        {@html s.html}
      </section>
    {/each}
    {#if lesson.keep}
      <div class="box keep"><div class="box-h">À retenir</div><ul>{#each lesson.keep as g}<li>{@html g}</li>{/each}</ul></div>
    {/if}
  {/key}
  <label class="read-toggle">
    <input type="checkbox" checked={done(lesson.id)} onchange={e => setVal(course.id, 'lesson:' + lesson.id, e.currentTarget.checked ? 1 : 0)} />
    J'ai lu et compris cette leçon
  </label>
  <nav class="fiche-nav" aria-label="Leçons">
    {#if i > 0}<button class="btn" onclick={() => show(L[i - 1].id)}><small>← Leçon précédente</small>{L[i - 1].t}</button>{/if}
    {#if i < L.length - 1}<button class="btn next" onclick={() => show(L[i + 1].id)}><small>Leçon suivante →</small>{L[i + 1].t}</button>{/if}
  </nav>
</article>
