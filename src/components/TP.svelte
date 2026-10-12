<script>
  let { data } = $props();
</script>

<p class="lead">L'essentiel des corrections de TP : ce qu'il faut retenir pour l'examen et les fonctions R à reconnaître.</p>
{#each data.tps as t}
  <article class="card fiche">
    <header><h2>{t.t}</h2></header>
    <p class="lead">{t.d}</p>
    <div class="grid2">
      <div><h3 style="margin-bottom:6px">À retenir</h3><ul>{#each t.pts as x}<li>{x}</li>{/each}</ul></div>
      <div><h3 style="margin-bottom:6px">Fonctions R</h3><ul>{#each t.fn as x}<li><code>{x}</code></li>{/each}</ul></div>
    </div>
  </article>
{/each}
