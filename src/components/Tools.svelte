<script>
  import { onMount } from 'svelte';
  let { course } = $props();
  let el = $state(null);
  let error = $state('');
  onMount(() => { course.tools().then(m => m.renderOutils(el)).catch(e => { error = e.message || String(e); }); });
</script>

<div class="panel" bind:this={el}></div>
{#if error}<p class="lead">Impossible de charger les exercices : {error}</p>{/if}
