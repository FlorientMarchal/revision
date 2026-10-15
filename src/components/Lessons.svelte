<script>
  // Le cours en entier : une leçon par chapitre, avec sommaire, encadrés, démonstrations et illustrations.
  import { tick, onMount } from 'svelte';
  import { kv, progress, setVal } from '../lib/progress.js';
  import { typeset } from '../lib/math.js';
  import { reveal, confetti, burst, transition, onEnter, readingBar, afterNav } from '../lib/motion.js';

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

  // changement de leçon : la page tourne dans le sens de la lecture (suivante → depuis la droite)
  function show(lid, anchor) {
    if (lid === id) return;
    const dir = L.findIndex(l => l.id === lid) > i ? 'r' : 'l';
    transition('lesson', async () => {
      id = lid; ui.set('lesson', lid); pendingAnchor = anchor || null;
      await tick();
      if (!anchor && body && body.getBoundingClientRect().top < 0) body.scrollIntoView({ block: 'start' });
    }, { dir, fallbackEl: () => body });
  }
  function markRead(on, el) {
    const all = on && L.length > 1 && L.every(l => l.id === lesson.id || done(l.id));
    setVal(course.id, 'lesson:' + lesson.id, on ? 1 : 0);
    if (on) burst(el);
    if (all) setTimeout(confetti, 180);
  }
  let stopInk = () => {};
  onMount(() => {
    const bar = readingBar(() => body);
    return () => { bar(); stopInk(); };
  });
  function goto(e, sid) {
    e.preventDefault();
    const t = document.getElementById(lesson.id + '-' + sid);
    if (t) t.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  // formules et illustrations : après la transition (l'écran n'est jamais figé) ; le corps de la leçon
  // apparaît en fondu une fois mis en forme, l'en-tête et le sommaire sont là tout de suite
  let typesetting = $state(true);
  let run = 0;
  $effect(() => {
    id;
    const me = ++run;
    typesetting = true;
    tick().then(afterNav).then(async () => {
      if (!body || me !== run) return;
      typeset(body);
      typesetting = false;
      if (course.viz && body.querySelector('[data-viz]')) {
        try { const m = await course.viz(); m.mountViz(body); typeset(body); } catch (e) { console.error(e); }
      }
      if (pendingAnchor) { const t = document.getElementById(pendingAnchor); if (t) t.scrollIntoView({ block: 'start' }); pendingAnchor = null; }
      reveal(body);
      stopInk(); stopInk = onEnter(body, '.lesson-sec', 'ink-on', 90);
    });
  });
</script>

<div class="chips lesson-chips" role="tablist" aria-label="Leçons">
  {#each L as l, k (l.id)}
    <button class="chip" aria-pressed={l.id === id} onclick={() => show(l.id)} style="--k:{k}" data-ripple>
      {#if done(l.id)}<span class="chip-ok" aria-label="lue">✓</span>{/if}<span class="chip-n">{k + 1}</span>{l.short}
    </button>
  {/each}
</div>

<article class="card lesson" class:is-typesetting={typesetting} bind:this={body}>
  {#key id}
    <header class="lesson-head">
      <span class="tag">Leçon {i + 1}/{L.length}{#if lesson.src} · {lesson.src}{/if}</span>
      <h2 class="lesson-t">{#if /\\[(\[]|[<&]/.test(lesson.t)}{lesson.t}{:else}{#each lesson.t.split(/\s+/) as w, k}{#if k}{' '}{/if}<span class="w"><span style="--k:{k}">{w}</span></span>{/each}{/if}</h2>
      {#if lesson.sub}<p class="lead">{lesson.sub}</p>{/if}
    </header>
    <nav class="lesson-toc" aria-label="Sommaire">
      <b>Sommaire</b>
      <ol>
        {#each lesson.sections as s, k}
          <li style="--k:{k}"><a href={'#' + lesson.id + '-' + s.id} onclick={e => goto(e, s.id)}><span class="toc-n">{String(k + 1).padStart(2, '0')}</span><span><b>{s.t}</b>{#if s.sub}<small>{s.sub}</small>{/if}</span></a></li>
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
    <input type="checkbox" checked={done(lesson.id)} onchange={e => markRead(e.currentTarget.checked, e.currentTarget)} />
    J'ai lu et compris cette leçon
  </label>
  <nav class="fiche-nav lesson-nav" aria-label="Leçons">
    {#if i > 0}<button class="btn prev" onclick={() => show(L[i - 1].id)} data-ripple><small><span class="arr" aria-hidden="true">←</span> Leçon précédente</small>{L[i - 1].t}</button>{/if}
    {#if i < L.length - 1}<button class="btn next" onclick={() => show(L[i + 1].id)} data-ripple><small>Leçon suivante <span class="arr" aria-hidden="true">→</span></small>{L[i + 1].t}</button>{/if}
  </nav>
</article>
