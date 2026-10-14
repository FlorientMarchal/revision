<script>
  // Emblème animé d'un cours (motion graphic SVG). size : 'hero' (en-tête du cours) ou 'card' (carte de l'accueil).
  let { id, size = 'card' } = $props();
</script>

<span class="emblem emblem-{size}" data-course={id} aria-hidden="true"></span>
