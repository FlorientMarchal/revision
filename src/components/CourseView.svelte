<script>
  import { loadCourse } from '../courses/index.js';
  import { kv, migrateLegacy } from '../lib/progress.js';
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
  import { evalList } from '../lib/evals.js';

  let { course, tab } = $props();
  const ui = kv(course.id);
  let data = $state(null);
  let error = $state('');

  loadCourse(course)
    .then(d => {
      if (course.legacy && d.LEGACY_CARD_ORDER) migrateLegacy(course.id, course.legacy.prefix, d.LEGACY_CARD_ORDER);
      data = d;
    })
    .catch(e => { error = e.message || String(e); });

  const tabs = $derived(data ? [
    { id: 'cours', label: 'Cours complet', on: (data.lessons || []).length },
    { id: 'fiches', label: 'Fiches', on: Object.keys(data.fiches || {}).length },
    { id: 'formules', label: 'Formulaire', on: (data.formulas || []).length },
    { id: 'requetes', label: 'Requêtes', on: (data.queries || []).length },
    { id: 'flash', label: 'Flashcards', on: (data.cards || []).length },
    { id: 'quiz', label: 'QCM', on: (data.quiz || []).length },
    { id: 'outils', label: 'Exercices interactifs', on: !!course.tools },
    { id: 'annales', label: course.examsLabel || 'Annales corrigées', on: (data.exams || []).length },
    { id: 'tp', label: data.labs ? 'TP · labo de code' : 'TP', on: (data.tps || data.labs || []).length },
    { id: 'r', label: 'R · TP et exercices', on: (data.rlabs || []).length },
  ].filter(t => t.on) : []);

  const current = $derived(tabs.find(t => t.id === tab) ? tab : (tabs.find(t => t.id === ui.get('tab', 'fiches')) || tabs[0] || {}).id);
  $effect(() => { if (current) ui.set('tab', current); });
</script>

<section class="course-head">
  <p class="eyebrow">{[course.code, course.level, course.semester].filter(Boolean).join(' · ')}</p>
  <h1>{course.title}</h1>
  <p class="sub">{course.topics.join(' / ')}</p>
  {#if course.evals}
    <ul class="cc-evals" aria-label="Évaluations">
      {#each evalList(course) as e}<li class:next={e.next} class:past={e.past}><b>{e.label}</b>{#if e.when}<span>{e.when}{#if e.time} · {e.time}{/if}</span>{:else}<span class="tbd">date à venir</span>{/if}</li>{/each}
    </ul>
  {/if}
  {#if course.links}
    <p class="course-links">{#each course.links as l}<a href={l.url} target="_blank" rel="noopener">{l.label} ↗</a>{/each}</p>
  {/if}
  {#if course.examInfo}<p class="exam-info">{@html course.examInfo}</p>{/if}
</section>

{#if error}
  <div class="card"><h2>Impossible de charger le cours</h2><p class="lead">{error}</p></div>
{:else if !data}
  <p class="lead">Chargement du cours…</p>
{:else}
  <nav class="tabs" aria-label="Sections du cours">
    {#each tabs as t, i (t.id)}
      <a href={link('c', course.id, t.id)} aria-current={t.id === current ? 'page' : undefined}><span class="tab-n">0{i + 1}</span>{t.label}</a>
    {/each}
  </nav>
  <main class="panel">
    {#if current === 'cours'}<Lessons {course} {data} />
    {:else if current === 'fiches'}<Fiches {course} {data} />
    {:else if current === 'formules'}<Formulas {course} {data} />
    {:else if current === 'requetes'}<Queries {course} {data} />
    {:else if current === 'r'}<RLab {course} {data} />
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
