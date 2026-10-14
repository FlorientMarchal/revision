<script>
  import { tick } from 'svelte';
  import { kv, progress, setVal } from '../lib/progress.js';
  import { typeset } from '../lib/math.js';
  import { reveal } from '../lib/motion.js';

  let { course, data } = $props();
  const ui = kv(course.id);
  const prog = progress(course.id);
  let id = $state(data.exams.find(e => e.id === ui.get('exam')) ? ui.get('exam') : data.exams[0].id);
  let body = $state(null);
  let openAll = $state(null);
  const exam = $derived(data.exams.find(e => e.id === id));
  const st = (xi, qi) => ($prog[`exam:${id}:${xi}:${qi}`] || {}).v;
  const count = e => {
    let ok = 0, n = 0;
    e.exos.forEach((x, xi) => x.qs.forEach((_, qi) => { n++; if (($prog[`exam:${e.id}:${xi}:${qi}`] || {}).v === 'ok') ok++; }));
    return { ok, n };
  };
  function choose(e) { id = e; ui.set('exam', e); openAll = null; }
  function setStatus(xi, qi, v) { setVal(course.id, `exam:${id}:${xi}:${qi}`, st(xi, qi) === v ? null : v); }

  $effect(() => {
    id; openAll;
    tick().then(async () => {
      if (!body) return;
      typeset(body);
      if (course.viz && body.querySelector('[data-viz]')) {
        try { const m = await course.viz(); m.mountViz(body); } catch (e) { console.error(e); }
      }
      reveal(body);
    });
  });
</script>

<div class="chips" id="ex-chips">
  {#each data.exams as e (e.id)}
    {@const c = count(e)}
    <button class="chip" aria-pressed={e.id === id} onclick={() => choose(e.id)}>{e.title}{#if c.ok}<span class="chip-count">{c.ok}/{c.n}</span>{/if}</button>
  {/each}
</div>
<div class="row"><button class="btn small" onclick={() => (openAll = true)}>Tout révéler</button><button class="btn small" onclick={() => (openAll = false)}>Tout cacher</button></div>

<div class="panel" bind:this={body}>
  {#key id}
    {#if exam.head}<div class="exam-head">{@html exam.head}</div>{/if}
    {#each exam.exos as x, xi}
      <div class="card exo" style="display:grid;gap:12px">
        <h2>{x.t}</h2>
        {#if x.intro}<div class="exo-intro">{@html x.intro}</div>{/if}
        {#each x.qs as qq, qi}
          {@const s = st(xi, qi)}
          <div class="q-item" class:q-ok={s === 'ok'} class:q-todo={s === 'revoir'}>
            <div class="qn">{@html qq.q}</div>
            <details open={openAll === null ? undefined : openAll}>
              <summary class="btn small" style="display:inline-block;list-style:none">Voir la correction</summary>
              <div class="answer" style="margin-top:8px">{@html qq.a}</div>
            </details>
            <div class="q-status" role="group" aria-label="Mon résultat">
              <button class="btn small" class:on-ok={s === 'ok'} aria-pressed={s === 'ok'} onclick={() => setStatus(xi, qi, 'ok')}>✓ Réussie</button>
              <button class="btn small" class:on-todo={s === 'revoir'} aria-pressed={s === 'revoir'} onclick={() => setStatus(xi, qi, 'revoir')}>À revoir</button>
            </div>
          </div>
        {/each}
      </div>
    {/each}
  {/key}
</div>
