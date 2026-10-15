<script>
  import { onMount } from 'svelte';
  import { lens } from '../lib/motion-components.js';
  let { course } = $props();
  let el = $state(null);
  let error = $state('');
  onMount(() => {
    let l = null;
    course.tools().then(m => { m.renderOutils(el); const c = el && el.querySelector('.chips'); if (c) l = lens(c); }).catch(e => { error = e.message || String(e); });
    return () => l && l.destroy && l.destroy();
  });
</script>

<div class="panel" bind:this={el}></div>
{#if error}<p class="lead">Impossible de charger les exercices : {error}</p>{/if}
