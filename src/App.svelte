<script>
  import { route, link } from './lib/router.js';
  import { byId } from './courses/index.js';
  import { syncState, session } from './lib/sync.js';
  import Home from './components/Home.svelte';
  import CourseView from './components/CourseView.svelte';
  import Account from './components/Account.svelte';

  const course = $derived($route.name === 'course' ? byId($route.course) : null);
  const label = $derived(
    { off: 'Compte', out: 'Se connecter', idle: 'Synchronisé', ok: 'Synchronisé', syncing: 'Synchronisation…', error: 'Erreur de synchro' }[$syncState]
  );
  $effect(() => { document.title = course ? `${course.short} · Révisions` : 'Mes révisions'; });
</script>

<div class="wrap">
  <header class="shell">
    <a class="brand" href={link()} aria-label="Accueil : tous les cours">
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="7" fill="var(--paper)" stroke="var(--line)"/><path d="M6 26 26 6" stroke="var(--ink)" stroke-width="1.6" stroke-dasharray="2 2.5"/><circle cx="9" cy="11" r="2.4" fill="var(--c1)"/><circle cx="13" cy="7.5" r="2.4" fill="var(--c1)"/><circle cx="7.5" cy="16" r="2.4" fill="var(--c1)"/><circle cx="19" cy="21" r="2.4" fill="var(--c2)"/><circle cx="23" cy="18" r="2.4" fill="var(--c2)"/><circle cx="22.5" cy="24" r="2.4" fill="var(--c2)"/></svg>
      <span>Mes révisions</span>
    </a>
    {#if course}<span class="crumb" aria-hidden="true">/</span><a class="crumb-course" href={link('c', course.id)}>{course.short}</a>{/if}
    <a class="account-btn" class:on={$session} class:err={$syncState === 'error'} href={link('compte')}>
      <span class="dot" aria-hidden="true"></span>{label}
    </a>
  </header>

  {#if $route.name === 'course' && course}
    {#key course.id}<CourseView {course} tab={$route.tab} />{/key}
  {:else if $route.name === 'course'}
    <main class="panel"><div class="card"><h2>Cours introuvable</h2><p class="lead">Ce cours n'existe pas (ou plus). <a href={link()}>Retour à la liste des cours</a>.</p></div></main>
  {:else if $route.name === 'account'}
    <Account />
  {:else}
    <Home />
  {/if}
</div>
