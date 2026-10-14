<script>
  import { tick } from 'svelte';
  import { kv, progress, setVal, setBest, getVal } from '../lib/progress.js';
  import { inlineMath } from '../lib/math.js';
  import { confetti } from '../lib/motion.js';
  import { lens, roll, kinetic } from '../lib/motion-components.js';
  import Ring from './Ring.svelte';

  let { course, data } = $props();
  const prog = progress(course.id);
  const ui = kv(course.id);
  const chapters = data.chapters;
  const chName = id => (chapters.find(c => c.id === id) || {}).name || id;

  let filter = $state(ui.get('qzFilter', 'all'));
  let list = $state([]);
  let i = $state(0);
  let score = $state(0);
  let picked = $state(null);
  let opts = $state([]);
  let res = $state([]);        // résultats de la série en cours (1 / 0), pour les pastilles d'avancement
  let optsEl = $state(null);
  let link = $state(null);     // trait de correction : de la réponse choisie vers la bonne

  const failed = q => { const r = ($prog['quiz:' + q.id] || {}).v; return r && r.last === 0; };
  const failedCount = $derived(data.quiz.filter(failed).length);
  const q = $derived(list[i]);
  const best = $derived(($prog['best:quiz:' + filter] || {}).v);

  function shuffled(a) { const b = [...a]; for (let k = b.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [b[k], b[j]] = [b[j], b[k]]; } return b; }
  function prepare() { picked = null; link = null; opts = q ? shuffled(q.opts.map((o, k) => ({ o, k }))) : []; }
  function start(f = filter) {
    filter = f; ui.set('qzFilter', f);
    const pool = data.quiz.filter(x => f === 'all' ? true : f === 'failed' ? failed(x) : x.ch === f);
    list = shuffled(pool); i = 0; score = 0; res = []; prepare();
  }
  function answer(k) {
    if (picked !== null) return;
    picked = k;
    const ok = k === q.ans ? 1 : 0;
    score += ok;
    res[i] = ok;
    const prev = getVal(course.id, 'quiz:' + q.id, { ok: 0, n: 0 });
    setVal(course.id, 'quiz:' + q.id, { last: ok, ok: (prev.ok || 0) + ok, n: (prev.n || 0) + 1 });
    if (!ok) tick().then(drawLink);
  }
  // trait de stylo rouge, dans la marge, de la réponse choisie vers la bonne réponse
  function drawLink() {
    if (!optsEl || picked === null || picked === q.ans) { link = null; return; }
    const a = optsEl.querySelector('.opt.ko'), b = optsEl.querySelector('.opt.ok');
    if (!a || !b) return;
    const y1 = a.offsetTop + 22, y2 = b.offsetTop + 22, x = 13, bow = -Math.min(14, 6 + Math.abs(y2 - y1) / 24);
    link = { d: `M${x} ${y1} C${bow} ${y1} ${bow} ${y2} ${x - 1} ${y2}`, head: `M${x - 7} ${y2 - 5} L${x - 1} ${y2} L${x - 7} ${y2 + 5}` };
  }
  $effect(() => {
    if (!link) return;
    const r = () => drawLink();
    addEventListener('resize', r);
    return () => removeEventListener('resize', r);
  });
  function next() {
    i += 1;
    if (i >= list.length && list.length) {
      const p = Math.round((100 * score) / list.length);
      if (filter !== 'failed') setBest(course.id, 'best:quiz:' + filter, p);
      if (p >= 60) confetti(p === 100 ? 70 : 40);
    }
    prepare();
  }
  const verdict = p => p === 100 ? 'Sans faute !' : p >= 80 ? 'Excellent travail !' : p >= 60 ? 'Bien joué !' : p >= 40 ? 'Pas mal, encore un effort.' : 'On continue : chaque erreur est une leçon.';
  start(filter === 'failed' ? 'all' : filter);
</script>

<div class="chips" aria-label="Sélection des questions" use:lens>
  <button class="chip" aria-pressed={filter === 'all'} onclick={() => start('all')}>Tout</button>
  {#each chapters as c (c.id)}<button class="chip" aria-pressed={filter === c.id} onclick={() => start(c.id)}>{c.name}</button>{/each}
  <button class="chip chip-warn" aria-pressed={filter === 'failed'} disabled={!failedCount} onclick={() => start('failed')}>Mes erreurs ({failedCount})</button>
</div>

<div class="card qz-card" id="qz">
  {#if !list.length}
    <h2>Aucune question</h2>
    <p class="lead">{filter === 'failed' ? 'Tu n\'as plus de question ratée. Bravo !' : 'Pas de question pour cette sélection.'}</p>
  {:else if i >= list.length}
    {@const p = Math.round((100 * score) / list.length)}
    <div class="qz-score qz-end">
      <Ring value={p} size={92} stroke={8} label="Score" />
      <div class="qz-score-txt">
        <div class="eyebrow">Série terminée</div>
        <h2 use:kinetic={verdict(p)}></h2>
        <p class="qz-score-n"><b use:roll={{ value: score, from: 0 }}></b> bonne{score > 1 ? 's' : ''} réponse{score > 1 ? 's' : ''} sur {list.length}</p>
        {#if filter !== 'failed'}<p class="lead">Meilleur score sur cette sélection : {Math.max(best || 0, p)} %.</p>{/if}
      </div>
      <ul class="qz-stats" aria-label="Bilan de la série">
        <li class="st-good"><b use:roll={{ value: score, from: 0 }}></b><span>justes</span></li>
        <li class="st-bad"><b use:roll={{ value: list.length - score, from: 0 }}></b><span>ratées</span></li>
        <li><b use:roll={{ value: p, from: 0 }}></b><span>% de réussite</span></li>
      </ul>
      <div class="qz-recap" aria-hidden="true" style:--n={list.length}>
        {#each list as _, k}<i class:ok={res[k] === 1} class:ko={res[k] === 0} style:--k={Math.min(k, 40)}></i>{/each}
      </div>
      <div class="row qz-score-btns">
        <button class="btn primary" onclick={() => start(filter)}>Recommencer</button>
        {#if failedCount && filter !== 'failed'}<button class="btn" onclick={() => start('failed')}>Revoir mes erreurs ({failedCount})</button>{/if}
      </div>
    </div>
  {:else}
    <div class="row" style="justify-content:space-between"><span class="eyebrow" style="margin:0">{chName(q.ch)}</span><span class="stat">Question <b use:roll={i + 1}></b>/{list.length} · score <b class="qz-sc" use:roll={score}></b></span></div>
    <div class="qz-dots" aria-hidden="true" style:--n={list.length} class:dense={list.length > 30}>
      {#each list as _, k}<i class:ok={res[k] === 1} class:ko={res[k] === 0} class:cur={k === i}></i>{/each}
    </div>
    {#key list[i]}<div class="qz-body">
    <h3 class="qz-q" style="margin-top:10px" use:kinetic={inlineMath(q.q)}></h3>
    <div class="opts mc-opts" class:answered={picked !== null} bind:this={optsEl}>
      {#each opts as { o, k }, n (k)}
        <button class="opt" style:--i={n} class:ok={picked !== null && k === q.ans} class:ko={picked === k && k !== q.ans} class:picked={picked === k} disabled={picked !== null} onclick={() => answer(k)}>
          <span class="opt-t">{@html inlineMath(o)}</span>
          {#if picked !== null && (k === q.ans || picked === k)}
            <svg class="opt-mark" viewBox="0 0 24 24" aria-hidden="true">
              {#if k === q.ans}<path d="M7 12.5l3.3 3.3L17.2 8.6" pathLength="1" />{:else}<path d="M8 8l8 8" pathLength="1" /><path class="p2" d="M16 8l-8 8" pathLength="1" />{/if}
            </svg>
            <span class="opt-glow" aria-hidden="true"></span>
          {/if}
        </button>
      {/each}
      {#if link}
        <svg class="qz-link" aria-hidden="true"><path d={link.d} pathLength="1" /><path class="hd" d={link.head} pathLength="1" /></svg>
      {/if}
    </div>
    {#if picked !== null}
      <div class="exp" class:exp-ok={picked === q.ans} class:exp-ko={picked !== q.ans}><b>{picked === q.ans ? 'Bonne réponse.' : 'Raté.'}</b> {@html inlineMath(q.exp)}</div>
      <div class="row qz-next" style="margin-top:12px"><button class="btn primary" onclick={next}>{i + 1 < list.length ? 'Question suivante →' : 'Voir mon score →'}</button></div>
    {/if}
    </div>{/key}
  {/if}
</div>
