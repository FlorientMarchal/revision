<script>
  // Entraînement aux requêtes : on tape sa requête, on affiche la solution à côté pour comparer, on note son résultat.
  // Rien n'est exécuté : le « résultat attendu » éventuel est calculé à l'avance à partir des données du cours.
  import { kv, progress, setVal } from '../lib/progress.js';
  import { highlight, missing } from '../lib/code.js';
  import { lens, markMissing, html } from '../lib/motion-components.js';

  let { course, data } = $props();
  const ui = kv(course.id);
  const prog = progress(course.id);
  const S = data.queries;
  let id = $state(S.find(s => s.id === ui.get('rqSet')) ? ui.get('rqSet') : S[0].id);
  const set = $derived(S.find(s => s.id === id));

  let drafts = $state({});
  let shown = $state({});
  const draft = x => drafts[x.id] ?? ui.get('rq:' + x.id, '');
  function edit(x, v) { drafts[x.id] = v; ui.set('rq:' + x.id, v); }
  const st = x => ($prog['rq:' + x.id] || {}).v;
  function mark(x, v) { setVal(course.id, 'rq:' + x.id, st(x) === v ? null : v); }
  const count = s => s.exos.filter(x => ($prog['rq:' + x.id] || {}).v === 'ok').length;
  function choose(s) { id = s; ui.set('rqSet', s); }

  // Tabulation dans la zone de saisie : insère deux espaces au lieu de quitter le champ.
  function tab(e, x) {
    if (e.key !== 'Tab' || e.shiftKey) return;
    e.preventDefault();
    const t = e.currentTarget, a = t.selectionStart, b = t.selectionEnd;
    const v = t.value.slice(0, a) + '  ' + t.value.slice(b);
    edit(x, v);
    requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = a + 2; });
  }
  const rows = x => (typeof x.expected === 'function' ? x.expected(data) : x.expected) || [];
  const cols = r => (r.length && r[0] !== null && typeof r[0] === 'object' && !Array.isArray(r[0])) ? Object.keys(r[0]) : null;
  const cell = v => (v !== null && typeof v === 'object') ? JSON.stringify(v) : String(v);
  const label = { cours: 'Requête du cours', corrige: 'Corrigé de l\'enseignant', propose: 'Solution proposée (pas un corrigé officiel)' };
</script>

<div class="chips" role="tablist" aria-label="Séries de requêtes" use:lens>
  {#each S as s (s.id)}
    {@const c = count(s)}
    <button class="chip" aria-pressed={s.id === id} onclick={() => choose(s.id)}>{s.title}{#if c}<span class="chip-count">{c}/{s.exos.length}</span>{/if}</button>
  {/each}
</div>

{#key id}
  <section class="card rq-set">
    <header class="rq-head">
      <span class="tag">{set.lang}{#if set.src} · {set.src}{/if}</span>
      <h2>{set.title}</h2>
      {#if set.intro}<div class="lead">{@html set.intro}</div>{/if}
    </header>
    {#if set.schema}<div class="rq-schema">{@html set.schema}</div>{/if}
    {#if set.dataset}
      <details class="fold">
        <summary>Voir les données ({set.dataset.name})</summary>
        <pre class="rq-code rq-data">{@html highlight(JSON.stringify(set.dataset.docs, null, 2))}</pre>
      </details>
    {/if}
    <p class="math-note">Tape ta requête, puis affiche la solution pour comparer. Rien n'est exécuté : plusieurs écritures peuvent être justes (alias, ordre des conditions, mise en forme).</p>
  </section>

  {#each set.exos as x, k (x.id)}
    {@const s = st(x)}
    {@const v = draft(x)}
    <article class="card rq" class:rq-ok={s === 'ok'} class:rq-todo={s === 'revoir'}>
      <div class="rq-q"><span class="rq-n">{k + 1}</span><div>{@html x.q}</div></div>
      <div class="rq-field">
      <textarea class="rq-input" rows={Math.max(3, Math.min(14, (v.match(/\n/g) || []).length + 2))} spellcheck="false" autocapitalize="off" autocomplete="off"
        placeholder={'Écris ta requête ' + (x.lang || set.lang) + '…'} aria-label={'Ta requête pour la question ' + (k + 1)}
        value={v} oninput={e => edit(x, e.currentTarget.value)} onkeydown={e => tab(e, x)}></textarea>
      <i class="rq-line" aria-hidden="true"></i>
      </div>
      <div class="row">
        <button class="btn small" class:primary={!shown[x.id]} aria-expanded={!!shown[x.id]} onclick={() => (shown[x.id] = !shown[x.id])}>{shown[x.id] ? 'Masquer la solution' : 'Voir la solution'}</button>
        {#if v}<button class="btn small" onclick={() => edit(x, '')}>Effacer</button>{/if}
      </div>
      {#if shown[x.id]}
        {@const miss = v.trim() ? missing(v, x.sol) : []}
        <div class="grid2 rq-compare">
          <div><h4>Ta réponse</h4>{#if v.trim()}<pre class="rq-code">{@html highlight(v)}</pre>{:else}<p class="math-note">Pas de réponse tapée.</p>{/if}</div>
          <div><h4>{label[x.kind || set.kind] || 'Solution'}</h4><pre class="rq-code" use:html={markMissing(x.sol, miss)}></pre></div>
        </div>
        {#if v.trim()}
          {#if miss.length}
            <p class="rq-miss"><b>Présents dans la solution, absents de ta réponse :</b> {#each miss as m, n}<code style:--i={Math.min(n, 14)}>{m}</code>{/each}</p>
          {:else}
            <p class="rq-miss ok"><svg class="rq-ok-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" pathLength="1" /></svg>Tous les mots-clés, valeurs et champs de la solution sont dans ta réponse.</p>
          {/if}
        {/if}
        {#if x.note}<div class="math-note">{@html x.note}</div>{/if}
        {#if x.expected}
          {@const r = rows(x)}
          {@const c = cols(r)}
          <details class="fold" open={r.length <= 15}>
            <summary>Résultat attendu ({r.length} {r.length > 1 ? 'résultats' : 'résultat'})</summary>
            <table class="t rq-res">
              {#if c}<thead><tr>{#each c as h}<th>{h}</th>{/each}</tr></thead>{/if}
              <tbody>{#each r as row}<tr>{#if c}{#each c as h}<td>{cell(row[h])}</td>{/each}{:else}<td>{cell(row)}</td>{/if}</tr>{/each}</tbody>
            </table>
          </details>
        {/if}
        <div class="q-status" role="group" aria-label="Mon résultat">
          <button class="btn small" class:on-ok={s === 'ok'} aria-pressed={s === 'ok'} onclick={() => mark(x, 'ok')}><svg class="st-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" pathLength="1" /></svg>J'avais juste</button>
          <button class="btn small" class:on-todo={s === 'revoir'} aria-pressed={s === 'revoir'} onclick={() => mark(x, 'revoir')}><svg class="st-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3.5v5.5M8 12v.5" pathLength="1" /></svg>À revoir</button>
        </div>
      {/if}
    </article>
  {/each}
{/key}
