<script>
  import { COURSES, loadCourse } from '../courses/index.js';
  import { progress } from '../lib/progress.js';
  import { summarize, pct, overall } from '../lib/summary.js';
  import Ring from './Ring.svelte';
  import Emblem from './Emblem.svelte';
  import { link } from '../lib/router.js';
  import { session, configured } from '../lib/sync.js';
  import { evalList, byEval } from '../lib/evals.js';
  import { introDue, playIntro, navInfo, lastFrom, getHomeScroll, saveHomeScroll, setReady, tilt } from '../lib/motion.js';
  import { onMount, tick } from 'svelte';
  const courses = [...COURSES].sort(byEval);

  // Chorégraphie d'entrée : intro complète (1re visite de la session), retour depuis un cours (morphing), ou cascade courte.
  const nav = navInfo();
  const from = lastFrom();
  const backId = from && from.name === 'course' ? from.course : null;
  const mode = nav && nav.kind === 'back' ? 'back' : (typeof window !== 'undefined' && introDue() ? 'intro' : 'plain');
  const stopIntro = mode === 'intro' ? playIntro(1500) : () => {};
  const cardDelay = ci => mode === 'intro' ? 420 + ci * 65 : 70 + ci * 45;

  // Prochaine évaluation, tous cours confondus (compte à rebours)
  const DAY = 864e5;
  const next = (() => {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    let best = null;
    for (const c of COURSES) for (const e of evalList(c)) if (e.next && (!best || e.d < best.e.d)) best = { c, e };
    return best && { ...best, days: Math.round((best.e.d - t) / DAY) };
  })();
  const digits = next ? String(next.days).split('').map(Number) : [];

  const title = 'Mes cours';

  let loaded = $state({});
  let maps = $state({});
  onMount(() => {
    const all = COURSES.map(c => loadCourse(c).then(d => { loaded = { ...loaded, [c.id]: d }; }));
    const unsubs = COURSES.map(c => progress(c.id).subscribe(m => { maps = { ...maps, [c.id]: m }; }));
    // retour depuis un cours : on revient là où l'on était (sur la carte du cours quitté)
    if (backId) {
      setReady(Promise.allSettled(all).then(tick).then(() => {
        const y = getHomeScroll();
        if (y > 0) scrollTo({ top: y });
        const card = document.querySelector(`.course-card[data-id="${backId}"]`);
        if (card) { const b = card.getBoundingClientRect(); if (b.bottom < 60 || b.top > innerHeight - 60) scrollTo({ top: scrollY + b.top - 90 }); }
      }));
    }
    const onScroll = () => saveHomeScroll(scrollY);
    addEventListener('scroll', onScroll, { passive: true });
    return () => { unsubs.forEach(u => u()); removeEventListener('scroll', onScroll); stopIntro(); };
  });
</script>

<main class="home is-{mode}">
  <section class="hero">
    <p class="eyebrow">Fiches · flashcards · QCM · annales corrigées</p>
    <h1 class="hero-t">
      <span class="sr-only">{title}</span>
      <span class="kt" aria-hidden="true">{#each title.split('') as ch, k}<span class="kt-c" style="--k:{k}">{ch === ' ' ? ' ' : ch}</span>{/each}</span>
      <svg class="hero-swash" viewBox="0 0 260 14" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M3 9.5C46 4.2 98 3.4 150 5.6c38 1.6 72 3.4 106-1.8"/><path pathLength="1" d="M28 12.4c52-3.4 118-3.6 196-2.2"/></svg>
    </h1>
    {#if configured && !$session}
      <p class="lead">Ta progression est enregistrée sur cet appareil. <a href={link('compte')}>Entre ton adresse e-mail</a> pour la retrouver sur tous tes appareils.</p>
    {:else if !configured}
      <p class="lead">Ta progression est enregistrée sur cet appareil.</p>
    {/if}
    {#if next}
      <a class="next-exam" href={link('c', next.c.id)} data-ripple>
        <span class="ne-days" aria-label={next.days === 0 ? "aujourd'hui" : `dans ${next.days} jour${next.days > 1 ? 's' : ''}`}>
          {#if next.days === 0}<span aria-hidden="true">J</span>{:else}<span class="ne-j" aria-hidden="true">J-</span>{#each digits as d, k}<span class="odo" aria-hidden="true"><span class="odo-s" style="--d:{d}; --k:{k}">{#each [0,1,2,3,4,5,6,7,8,9] as n}<span>{n}</span>{/each}</span></span>{/each}{/if}
        </span>
        <span class="ne-what">
          <span class="ne-k">Prochaine évaluation</span>
          <b>{next.e.label} · {next.c.short}</b>
          <small>{next.e.when}{#if next.e.time} · {next.e.time}{/if}</small>
        </span>
        <span class="ne-go" aria-hidden="true">→</span>
      </a>
    {/if}
  </section>

  <div class="course-grid">
    {#each courses as c, ci (c.id)}
      {@const d = loaded[c.id]}
      {@const s = d ? summarize(maps[c.id] || {}, d) : null}
      <a class="course-card" class:vt-target={mode === 'back' && c.id === backId} href={link('c', c.id)} data-id={c.id} data-ripple use:tilt
        style="--i:{ci}; --cd:{cardDelay(ci)}ms; --vt-t:ct-{c.id}; --vt-e:em-{c.id}; --vt-r:rg-{c.id}; --vt-c:cb-{c.id}">
        <span class="cc-glare" aria-hidden="true"></span>
        <div class="cc-top">
          <span class="cc-emblem"><Emblem id={c.id} size="card" /></span>
          <div class="cc-head">
            <span class="cc-code">{[c.code, c.level].filter(Boolean).join(' · ')}</span>
            <span class="cc-sem">{c.semester}</span>
          </div>
          {#if s}<Ring value={overall(s)} size={52} stroke={5} label="Progression globale" delay={cardDelay(ci) + 320} animate={mode !== 'back'} />{:else}<span class="ring ring-wait" style="--size:52px" aria-hidden="true"></span>{/if}
        </div>
        <div class="cc-title">
          <h2>{c.title}</h2>
        </div>
        <p class="cc-topics">{c.topics.join(' · ')}</p>
        {#if c.evals}
          <ul class="cc-evals" aria-label="Évaluations">
            {#each evalList(c) as e, k}<li class:next={e.next} class:past={e.past} style="--k:{k}"><b>{e.label}</b>{#if e.when}<span>{e.when}{#if e.time} · {e.time}{/if}</span>{:else}<span class="tbd">date à venir</span>{/if}</li>{/each}
          </ul>
        {/if}
        {#if s}
          <dl class="cc-stats">
            {#if s.labs}<div><dt>Exercices de TP réussis</dt><dd><b>{s.labsDone}</b> / {s.labs}</dd><span class="meter"><i style="width:{pct(s.labsDone, s.labs)}%"></i></span></div>{/if}
            <div><dt>Flashcards sues</dt><dd><b>{s.known}</b> / {s.cards}</dd><span class="meter"><i style="width:{pct(s.known, s.cards)}%"></i></span></div>
            {#if s.rq}<div><dt>Requêtes réussies</dt><dd><b>{s.rqOk}</b> / {s.rq}</dd><span class="meter"><i style="width:{pct(s.rqOk, s.rq)}%"></i></span></div>{/if}
            {#if s.hasFiches}<div><dt>Fiches lues</dt><dd><b>{s.fiches}</b> / {s.chapters}</dd><span class="meter"><i style="width:{pct(s.fiches, s.chapters)}%"></i></span></div>
            {:else if s.lessons}<div><dt>Leçons lues</dt><dd><b>{s.lessonsRead}</b> / {s.lessons}</dd><span class="meter"><i style="width:{pct(s.lessonsRead, s.lessons)}%"></i></span></div>{/if}
            {#if s.examQ}<div><dt>{c.examsLabel ? c.examsLabel + ' : questions réussies' : "Questions d'annales réussies"}</dt><dd><b>{s.examOk}</b> / {s.examQ}</dd><span class="meter"><i style="width:{pct(s.examOk, s.examQ)}%"></i></span></div>{/if}
            <div><dt>QCM : bonnes réponses</dt><dd><b>{s.quizRight}</b> / {s.quiz}</dd><span class="meter"><i style="width:{pct(s.quizRight, s.quiz)}%"></i></span></div>
          </dl>
        {:else}
          <div class="cc-loading" role="status"><span class="sr-only">Chargement…</span><i></i><i></i><i></i></div>
        {/if}
        <span class="cc-go">Réviser <span class="cc-arr" aria-hidden="true">→</span></span>
      </a>
    {/each}
  </div>
  {#if mode === 'intro'}<div class="intro-grid" aria-hidden="true"><i class="ig-h"></i><i class="ig-v"></i></div>{/if}
</main>
