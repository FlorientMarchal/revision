<script>
  import { loadCourse } from '../courses/index.js';
  import { kv, migrateLegacy, progress } from '../lib/progress.js';
  import { summarize, overall } from '../lib/summary.js';
  import Ring from './Ring.svelte';
  import { link } from '../lib/router.js';
  import Fiches from './Fiches.svelte';
  import Flashcards from './Flashcards.svelte';
  import Quiz from './Quiz.svelte';
  import Tools from './Tools.svelte';
  import Annales from './Annales.svelte';
  import TP from './TP.svelte';
  import TPLab from './TPLab.svelte';
  import Lessons from './Lessons.svelte';
  import Formulas from './Formulas.svelte';
  import Queries from './Queries.svelte';
  import RLab from './RLab.svelte';
  import CodeSheet from './CodeSheet.svelte';
  import { evalList } from '../lib/evals.js';
  import Emblem from './Emblem.svelte';
  import { tick } from 'svelte';
  import { navInfo } from '../lib/motion.js';

  let { course, tab } = $props();
  const ui = kv(course.id);
  let data = $state(null);
  let error = $state('');

  // arrivée depuis la carte de l'accueil : titre, emblème et anneau arrivent par morphing (pas d'entrée cinétique)
  const arrival = navInfo();
  const viaCard = !!(arrival && arrival.kind === 'fwd' && arrival.id === course.id);

  const loading = loadCourse(course)
    .then(d => {
      if (course.legacy && d.LEGACY_CARD_ORDER) migrateLegacy(course.id, course.legacy.prefix, d.LEGACY_CARD_ORDER);
      data = d;
    })
    .catch(e => { error = e.message || String(e); });

  const words = course.title.split(/\s+/);
  const DAY = 864e5;
  const daysTo = d => { const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((d - t) / DAY); };

  const tabs = $derived(data ? [
    { id: 'cours', label: 'Cours complet', on: (data.lessons || []).length },
    { id: 'fiches', label: 'Fiches', on: Object.keys(data.fiches || {}).length },
    { id: 'formules', label: 'Formulaire', on: (data.formulas || []).length },
    { id: 'memo', label: 'Mémo code', on: (data.codesheet || []).length },
    { id: 'requetes', label: 'Requêtes', on: (data.queries || []).length },
    { id: 'flash', label: 'Flashcards', on: (data.cards || []).length },
    { id: 'quiz', label: 'QCM', on: (data.quiz || []).length },
    { id: 'outils', label: 'Exercices interactifs', on: !!course.tools },
    { id: 'annales', label: course.examsLabel || 'Annales corrigées', on: (data.exams || []).length },
    { id: 'tp', label: data.labs ? 'TP · labo de code' : 'TP', on: (data.tps || data.labs || []).length },
    { id: 'py', label: data.pylabsLabel || 'Python · TP et exercices', on: (data.pylabs || []).length },
    { id: 'r', label: data.rlabsLabel || 'R · TP et exercices', on: (data.rlabs || []).length },
  ].filter(t => t.on) : []);

  const current = $derived(tabs.find(t => t.id === tab) ? tab : (tabs.find(t => t.id === ui.get('tab', 'fiches')) || tabs[0] || {}).id);
  $effect(() => { if (current) ui.set('tab', current); });

  const prog = progress(course.id);
  const total = $derived(data ? overall(summarize($prog, data)) : 0);

  // soulignement partagé de l'onglet actif : il glisse d'un onglet à l'autre
  let ink = $state(null);
  let inkOn = $state(false);
  function placeInk() {
    if (!nav_ || !ink) return;
    const a = nav_.querySelector('[aria-current="page"]');
    if (!a) return;
    ink.style.transform = `translateX(${a.offsetLeft + 8}px) scaleX(${Math.max(0, a.offsetWidth - 16) / 100})`;
    if (!inkOn) requestAnimationFrame(() => { inkOn = true; });
  }
  $effect(() => {
    current; tabs.length;
    if (!nav_) return;
    tick().then(placeInk);
  });
  $effect(() => {
    const nav = nav_;
    if (!nav || typeof ResizeObserver !== 'function') return;
    const ro = new ResizeObserver(() => placeInk());
    ro.observe(nav);
    nav.querySelectorAll('a').forEach(a => ro.observe(a));
    return () => ro.disconnect();
  });

  // l'onglet actif reste visible dans la barre (qui défile horizontalement sur mobile)
  let nav_ = $state(null);
  $effect(() => {
    current;
    const nav = nav_;
    if (!nav) return;
    const a = nav.querySelector('[aria-current="page"]');
    if (a && (a.offsetLeft < nav.scrollLeft || a.offsetLeft + a.offsetWidth > nav.scrollLeft + nav.clientWidth - 28)) {
      nav.scrollTo({ left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' });
    }
  });
</script>

<section class="course-head" class:via-card={viaCard} style="--vt-t:ct-{course.id}; --vt-e:em-{course.id}; --vt-r:rg-{course.id}">
  <div class="ch-main">
    <p class="eyebrow ch-eyebrow">{[course.code, course.level, course.semester].filter(Boolean).join(' · ')}</p>
    <h1 class="ch-h">{#each words as w, k}{#if k}{' '}{/if}<span class="w"><span style="--k:{k}">{w}</span></span>{/each}</h1>
    <p class="sub">{#each course.topics as t, k}{#if k}<span class="sub-sep">{' / '}</span>{/if}<span class="sub-t" style="--k:{k}">{t}</span>{/each}</p>
    {#if course.evals}
      <ul class="cc-evals ch-evals" aria-label="Évaluations">
        {#each evalList(course) as e, k}<li class:next={e.next} class:past={e.past} style="--k:{k}">{#if e.next}<span class="ev-pulse" aria-hidden="true"></span>{/if}<b>{e.label}</b>{#if e.when}<span>{e.when}{#if e.time} · {e.time}{/if}</span>{:else}<span class="tbd">date à venir</span>{/if}{#if e.next}{@const n = daysTo(e.d)}<em class="ev-badge">{n === 0 ? "aujourd'hui" : 'J-' + n}</em>{/if}</li>{/each}
      </ul>
    {/if}
    {#if course.links}
      <p class="course-links">{#each course.links as l, k}<a href={l.url} target="_blank" rel="noopener" style="--k:{k}">{l.label} ↗</a>{/each}</p>
    {/if}
  </div>
  <div class="ch-side">
    <span class="ch-emblem"><Emblem id={course.id} size="hero" /></span>
    {#if data}<Ring value={total} size={58} stroke={5} label="Progression dans ce cours" delay={viaCard ? 0 : 450} animate={!viaCard} />{/if}
  </div>
  {#if course.examInfo}<p class="exam-info"><span class="ei-in">{@html course.examInfo}</span></p>{/if}
</section>

{#if error}
  <div class="card"><h2>Impossible de charger le cours</h2><p class="lead">{error}</p></div>
{:else if !data}
  <div class="skel" role="status" aria-label="Chargement du cours"><i class="skel-tabs"></i><i></i><i></i><i class="short"></i></div>
{:else}
  <nav class="tabs" class:ink-on={inkOn} aria-label="Sections du cours" bind:this={nav_}>
    <span class="tab-ink" aria-hidden="true" bind:this={ink}></span>
    {#each tabs as t, i (t.id)}
      <a href={link('c', course.id, t.id)} aria-current={t.id === current ? 'page' : undefined} style="--k:{i}" data-ripple><span class="tab-n">{String(i + 1).padStart(2, '0')}</span>{t.label}</a>
    {/each}
  </nav>
  <main class="panel course-panel">
    {#if current === 'cours'}<Lessons {course} {data} />
    {:else if current === 'fiches'}<Fiches {course} {data} />
    {:else if current === 'formules'}<Formulas {course} {data} />
    {:else if current === 'memo'}<CodeSheet {course} {data} />
    {:else if current === 'requetes'}<Queries {course} {data} />
    {:else if current === 'r'}<RLab {course} {data} />
    {:else if current === 'py'}<RLab {course} {data} lang="py" />
    {:else if current === 'flash'}<Flashcards {course} {data} />
    {:else if current === 'quiz'}<Quiz {course} {data} />
    {:else if current === 'outils'}<Tools {course} />
    {:else if current === 'annales'}<Annales {course} {data} />
    {:else if current === 'tp'}{#if data.labs}<TPLab {course} {data} />{:else}<TP {data} />{/if}
    {/if}
  </main>
{/if}

<footer class="credit">
  {@html course.credit || ''}
  <p>Site non officiel, sans lien avec l'enseignant·e ni l'université. Les résumés, flashcards, QCM et corrections ont été rédigés pour réviser et peuvent contenir des erreurs : en cas de doute, le cours fait foi.</p>
</footer>
