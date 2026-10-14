<script>
  import { tick } from 'svelte';
  import { kv, progress, setVal } from '../lib/progress.js';
  import { typeset } from '../lib/math.js';
  import { reveal } from '../lib/motion.js';
  import { lens, roll, inkReveal } from '../lib/motion-components.js';

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
  const exoOk = (x, xi) => x.qs.filter((_, qi) => st(xi, qi) === 'ok').length;
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
      inkReveal(body, '.key');
    });
  });
</script>

<div class="chips" id="ex-chips" use:lens>
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
      {@const xo = exoOk(x, xi)}
      <div class="card exo" style="display:grid;gap:12px">
        <h2>{x.t}</h2>
        <div class="exo-meter" class:full={xo === x.qs.length}>
          <span class="exo-segs" aria-hidden="true">{#each x.qs as _, qi}{@const s = st(xi, qi)}<i class:ok={s === 'ok'} class:todo={s === 'revoir'}></i>{/each}</span>
          <span class="exo-n"><b use:roll={xo}></b>/{x.qs.length} réussie{xo > 1 ? 's' : ''}</span>
        </div>
        {#if x.intro}<div class="exo-intro">{@html x.intro}</div>{/if}
        {#each x.qs as qq, qi}
          {@const s = st(xi, qi)}
          <div class="q-item" class:q-ok={s === 'ok'} class:q-todo={s === 'revoir'}>
            <div class="qn">{@html qq.q}</div>
            <details open={openAll === null ? undefined : openAll}>
              <summary class="btn small" style="display:inline-block;list-style:none"><span class="sm-show">Voir la correction</span><span class="sm-hide">Masquer la correction</span></summary>
              <div class="answer" style="margin-top:8px">{@html qq.a}</div>
            </details>
            <div class="q-status" role="group" aria-label="Mon résultat">
              <button class="btn small" class:on-ok={s === 'ok'} aria-pressed={s === 'ok'} onclick={() => setStatus(xi, qi, 'ok')}><svg class="st-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" pathLength="1" /></svg>Réussie</button>
              <button class="btn small" class:on-todo={s === 'revoir'} aria-pressed={s === 'revoir'} onclick={() => setStatus(xi, qi, 'revoir')}><svg class="st-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3.5v5.5M8 12v.5" pathLength="1" /></svg>À revoir</button>
            </div>
          </div>
        {/each}
      </div>
    {/each}
  {/key}
</div>
