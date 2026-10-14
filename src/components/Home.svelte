<script>
  import { COURSES, loadCourse } from '../courses/index.js';
  import { progress } from '../lib/progress.js';
  import { summarize, pct } from '../lib/summary.js';
  import { link } from '../lib/router.js';
  import { session, configured } from '../lib/sync.js';
  import { evalList, byEval } from '../lib/evals.js';
  const courses = [...COURSES].sort(byEval);

  import { onMount } from 'svelte';
  let loaded = $state({});
  let maps = $state({});
  onMount(() => {
    COURSES.forEach(c => loadCourse(c).then(d => { loaded = { ...loaded, [c.id]: d }; }));
    const unsubs = COURSES.map(c => progress(c.id).subscribe(m => { maps = { ...maps, [c.id]: m }; }));
    return () => unsubs.forEach(u => u());
  });
</script>

<main class="home">
  <section class="hero">
    <p class="eyebrow">Fiches · flashcards · QCM · annales corrigées</p>
    <h1>Mes cours</h1>
    {#if configured && !$session}
      <p class="lead">Ta progression est enregistrée sur cet appareil. <a href={link('compte')}>Entre ton adresse e-mail</a> pour la retrouver sur tous tes appareils.</p>
    {:else if !configured}
      <p class="lead">Ta progression est enregistrée sur cet appareil.</p>
    {/if}
  </section>

  <div class="course-grid">
    {#each courses as c (c.id)}
      {@const d = loaded[c.id]}
      {@const s = d ? summarize(maps[c.id] || {}, d) : null}
      <a class="course-card" href={link('c', c.id)}>
        <div class="cc-head">
          <span class="cc-code">{[c.code, c.level].filter(Boolean).join(' · ')}</span>
          <span class="cc-sem">{c.semester}</span>
        </div>
        <h2>{c.title}</h2>
        <p class="cc-topics">{c.topics.join(' · ')}</p>
        {#if c.evals}
          <ul class="cc-evals" aria-label="Évaluations">
            {#each evalList(c) as e}<li class:next={e.next} class:past={e.past}><b>{e.label}</b>{#if e.when}<span>{e.when}{#if e.time} · {e.time}{/if}</span>{:else}<span class="tbd">date à venir</span>{/if}</li>{/each}
          </ul>
        {/if}
        {#if s}
          <dl class="cc-stats">
            {#if s.labs}<div><dt>Exercices de TP réussis</dt><dd><b>{s.labsDone}</b> / {s.labs}</dd><span class="meter"><i style="width:{pct(s.labsDone, s.labs)}%"></i></span></div>{/if}
            <div><dt>Flashcards sues</dt><dd><b>{s.known}</b> / {s.cards}</dd><span class="meter"><i style="width:{pct(s.known, s.cards)}%"></i></span></div>
            <div><dt>Fiches lues</dt><dd><b>{s.fiches}</b> / {s.chapters}</dd><span class="meter"><i style="width:{pct(s.fiches, s.chapters)}%"></i></span></div>
            {#if s.examQ}<div><dt>Questions d'annales réussies</dt><dd><b>{s.examOk}</b> / {s.examQ}</dd><span class="meter"><i style="width:{pct(s.examOk, s.examQ)}%"></i></span></div>{/if}
            <div><dt>QCM : bonnes réponses</dt><dd><b>{s.quizRight}</b> / {s.quiz}</dd><span class="meter"><i style="width:{pct(s.quizRight, s.quiz)}%"></i></span></div>
          </dl>
        {:else}
          <p class="cc-loading">Chargement…</p>
        {/if}
        <span class="cc-go">Réviser →</span>
      </a>
    {/each}
  </div>

</main>
