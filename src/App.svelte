<script>
  import { onMount } from 'svelte';
  import { route, link } from './lib/router.js';
  import { byId } from './courses/index.js';
  import { syncState, session } from './lib/sync.js';
  import { go, installRipple } from './lib/motion.js';
  import Home from './components/Home.svelte';
  import CourseView from './components/CourseView.svelte';
  import Account from './components/Account.svelte';

  const course = $derived($route.name === 'course' ? byId($route.course) : null);
  const label = $derived(
    { off: 'Compte', out: 'Se connecter', idle: 'Synchronisé', ok: 'Synchronisé', syncing: 'Synchronisation…', error: 'Erreur de synchro' }[$syncState]
  );
  $effect(() => { document.title = course ? `${course.short} · Révisions` : 'Mes révisions'; });

  onMount(() => {
    // liens internes (#/…) : navigation chorégraphiée (View Transitions si possible)
    const click = e => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href^="#/"]');
      if (!a || a.target || a.hasAttribute('download')) return;
      if (go(a.getAttribute('href'), a)) e.preventDefault();
    };
    document.addEventListener('click', click);
    const offRipple = installRipple();
    return () => { document.removeEventListener('click', click); offRipple(); };
  });
</script>

<div class="wrap">
  <header class="shell">
    <a class="brand" href={link()} aria-label="Accueil : tous les cours">
      <svg class="brand-mark" viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="7" fill="var(--paper)" stroke="var(--line)"/><path class="bm-line" d="M6 26 26 6" stroke="var(--ink)" stroke-width="1.6" stroke-dasharray="2 2.5"/><g class="bm-a"><circle cx="9" cy="11" r="2.4" fill="var(--c1)" style="--k:0"/><circle cx="13" cy="7.5" r="2.4" fill="var(--c1)" style="--k:1"/><circle cx="7.5" cy="16" r="2.4" fill="var(--c1)" style="--k:2"/></g><g class="bm-b"><circle cx="19" cy="21" r="2.4" fill="var(--c2)" style="--k:3"/><circle cx="23" cy="18" r="2.4" fill="var(--c2)" style="--k:4"/><circle cx="22.5" cy="24" r="2.4" fill="var(--c2)" style="--k:5"/></g></svg>
      <span class="brand-t">Mes révisions</span>
    </a>
    {#if course}
      {#key course.id}<span class="crumb" aria-hidden="true">/</span><a class="crumb-course" href={link('c', course.id)}>{course.short}</a>{/key}
    {/if}
    <a class="account-btn" class:on={$session} class:err={$syncState === 'error'} class:syncing={$syncState === 'syncing'} href={link('compte')} data-ripple>
      <span class="dot" aria-hidden="true"></span>{#key label}<span class="ab-label">{label}</span>{/key}
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
