<script>
  import { kv, progress, setVal, setBest, getVal } from '../lib/progress.js';
  import { inlineMath } from '../lib/math.js';
  import { confetti } from '../lib/motion.js';
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

  const failed = q => { const r = ($prog['quiz:' + q.id] || {}).v; return r && r.last === 0; };
  const failedCount = $derived(data.quiz.filter(failed).length);
  const q = $derived(list[i]);
  const best = $derived(($prog['best:quiz:' + filter] || {}).v);

  function shuffled(a) { const b = [...a]; for (let k = b.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [b[k], b[j]] = [b[j], b[k]]; } return b; }
  function prepare() { picked = null; opts = q ? shuffled(q.opts.map((o, k) => ({ o, k }))) : []; }
  function start(f = filter) {
    filter = f; ui.set('qzFilter', f);
    const pool = data.quiz.filter(x => f === 'all' ? true : f === 'failed' ? failed(x) : x.ch === f);
    list = shuffled(pool); i = 0; score = 0; prepare();
  }
  function answer(k) {
    if (picked !== null) return;
    picked = k;
    const ok = k === q.ans ? 1 : 0;
    score += ok;
    const prev = getVal(course.id, 'quiz:' + q.id, { ok: 0, n: 0 });
    setVal(course.id, 'quiz:' + q.id, { last: ok, ok: (prev.ok || 0) + ok, n: (prev.n || 0) + 1 });
  }
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

<div class="chips" aria-label="Sélection des questions">
  <button class="chip" aria-pressed={filter === 'all'} onclick={() => start('all')}>Tout</button>
  {#each chapters as c (c.id)}<button class="chip" aria-pressed={filter === c.id} onclick={() => start(c.id)}>{c.name}</button>{/each}
  <button class="chip chip-warn" aria-pressed={filter === 'failed'} disabled={!failedCount} onclick={() => start('failed')}>Mes erreurs ({failedCount})</button>
</div>

<div class="card" id="qz">
  {#if !list.length}
    <h2>Aucune question</h2>
    <p class="lead">{filter === 'failed' ? 'Tu n\'as plus de question ratée. Bravo !' : 'Pas de question pour cette sélection.'}</p>
  {:else if i >= list.length}
    {@const p = Math.round((100 * score) / list.length)}
    <div class="qz-score">
      <Ring value={p} size={92} stroke={8} label="Score" />
      <div class="qz-score-txt">
        <div class="eyebrow">Série terminée</div>
        <h2>{verdict(p)}</h2>
        <p class="qz-score-n"><b>{score}</b> bonne{score > 1 ? 's' : ''} réponse{score > 1 ? 's' : ''} sur {list.length}</p>
        {#if filter !== 'failed'}<p class="lead">Meilleur score sur cette sélection : {Math.max(best || 0, p)} %.</p>{/if}
      </div>
      <div class="row qz-score-btns">
        <button class="btn primary" onclick={() => start(filter)}>Recommencer</button>
        {#if failedCount && filter !== 'failed'}<button class="btn" onclick={() => start('failed')}>Revoir mes erreurs ({failedCount})</button>{/if}
      </div>
    </div>
  {:else}
    <div class="row" style="justify-content:space-between"><span class="eyebrow" style="margin:0">{chName(q.ch)}</span><span class="stat">Question {i + 1}/{list.length} · score {score}</span></div>
    <div class="bar thin"><i style="width:{(100 * i) / list.length}%"></i></div>
    {#key list[i]}<div class="qz-body">
    <h3 class="qz-q" style="margin-top:10px">{@html inlineMath(q.q)}</h3>
    <div class="opts">
      {#each opts as { o, k } (k)}
        <button class="opt" class:ok={picked !== null && k === q.ans} class:ko={picked === k && k !== q.ans} disabled={picked !== null} onclick={() => answer(k)}>{@html inlineMath(o)}</button>
      {/each}
    </div>
    {#if picked !== null}
      <div class="exp" class:exp-ok={picked === q.ans} class:exp-ko={picked !== q.ans}><b>{picked === q.ans ? 'Bonne réponse.' : 'Raté.'}</b> {@html inlineMath(q.exp)}</div>
      <div class="row" style="margin-top:12px"><button class="btn primary" onclick={next}>{i + 1 < list.length ? 'Question suivante →' : 'Voir mon score →'}</button></div>
    {/if}
    </div>{/key}
  {/if}
</div>
