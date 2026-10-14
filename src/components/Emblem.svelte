<script>
  // Emblème animé d'un cours (motion graphic SVG, décoratif). size : 'hero' (en-tête du cours) ou 'card' (carte de l'accueil).
  // - hero : l'animation d'entrée se joue à l'affichage puis de petites boucles prennent le relais (en pause hors écran) ;
  // - card : image finale au repos, l'animation se rejoue au survol / focus de la carte .course-card parente.
  // Formes dans src/lib/emblems/, animations dans src/emblems.css ; id inconnu → emblème générique.
  import { emblemSVG } from '../lib/emblems/index.js';

  let { id, size = 'card' } = $props();
  const s = $derived(size === 'hero' ? 'hero' : 'card');
  const svg = $derived(emblemSVG(id, s));

  let el = $state();
  // en-tête : en pause tant qu'il n'est pas visible (l'entrée démarre quand il apparaît)
  let paused = $state(true);
  $effect(() => {
    if (s !== 'hero' || !el || typeof IntersectionObserver !== 'function') { paused = false; return; }
    const io = new IntersectionObserver(entries => { for (const e of entries) paused = !e.isIntersecting; });
    io.observe(el);
    return () => io.disconnect();
  });
</script>

<span bind:this={el} class="emblem emblem-{s}" class:e-paused={s === 'hero' && paused} data-course={id} aria-hidden="true">{@html svg}</span>
