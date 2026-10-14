<script>
  import { onMount } from 'svelte';
  import { kv, progress, setVal } from '../lib/progress.js';
  import { confetti } from '../lib/motion.js';

  let { course, data } = $props();
  const ui = kv(course.id);
  const prog = progress(course.id);
  const chapters = data.chapters;
  const chName = id => (chapters.find(c => c.id === id) || {}).name || id;
  const COL = ['--c1', '--c2', '--c3', '--c4', '--c5', '--c6'];
  const chCol = id => `var(${COL[Math.max(0, chapters.findIndex(c => c.id === id)) % COL.length]})`;

  let filter = $state(ui.get('fcFilter', 'all'));
  let onlyTodo = $state(ui.get('fcTodo', false));
  let order = $state(null);          // ordre mélangé (liste d'id) ou null
  let idx = $state(0);
  let flipped = $state(false);
  let slide = $state('');
  let good = $state(false);

  const isKnown = id => (($prog['card:' + id] || {}).v === 1);
  const scope = $derived(data.cards.filter(c => filter === 'all' || c.ch === filter));
  const deck = $derived.by(() => {
    let d = scope.filter(c => !onlyTodo || !isKnown(c.id));
    if (order) { const pos = new Map(order.map((id, i) => [id, i])); d = [...d].sort((a, b) => (pos.get(a.id) ?? 1e9) - (pos.get(b.id) ?? 1e9)); }
    return d;
  });
  const knownCount = $derived(scope.filter(c => isKnown(c.id)).length);
  const card = $derived(deck[Math.min(idx, Math.max(0, deck.length - 1))]);

  function reset() { idx = 0; flipped = false; }
  function setFilter(v) { filter = v; ui.set('fcFilter', v); reset(); }
  function setTodo(v) { onlyTodo = v; ui.set('fcTodo', v); reset(); }
  function move(d) {
    if (!deck.length) return;
    idx = (Math.min(idx, deck.length - 1) + d + deck.length) % deck.length;
    flipped = false; slide = ''; requestAnimationFrame(() => { slide = d > 0 ? 'slide-l' : 'slide-r'; });
  }
  function mark(v) {
    if (!card) return;
    const wasLast = idx >= deck.length - 1;
    const completes = v && !isKnown(card.id) && scope.length > 1 && scope.every(c => c.id === card.id || isKnown(c.id));
    setVal(course.id, 'card:' + card.id, v ? 1 : 0);
    if (v) { good = false; requestAnimationFrame(() => (good = true)); }
    if (completes) confetti();
    if (onlyTodo && v) { flipped = false; if (wasLast) idx = 0; } else move(1);
  }
  function shuffle() {
    const ids = deck.map(c => c.id);
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    order = ids; reset();
  }
  function flip() { if (deck.length) flipped = !flipped; }

  let sx = null, sy = null, swiped = false;
  const down = e => { sx = e.clientX; sy = e.clientY; swiped = false; };
  const up = e => {
    if (sx === null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) { swiped = true; move(dx < 0 ? 1 : -1); }
  };
  const click = () => { if (swiped) { swiped = false; return; } flip(); };

  onMount(() => {
    const key = e => {
      if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') move(1);
      else if (e.key === 'ArrowLeft') move(-1);
      else if (e.key === ' ' && (e.target === document.body || e.target.closest('.fc-card'))) { e.preventDefault(); flip(); }
      else if (flipped && e.key === '1') mark(false);
      else if (flipped && e.key === '2') mark(true);
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  });
</script>

<div class="fc">
  <div class="fc-top">
    <label class="fc-sel"><span class="sr-only">Chapitre</span>
      <select value={filter} onchange={e => setFilter(e.currentTarget.value)}>
        <option value="all">Tous les chapitres</option>
        {#each chapters as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
      </select>
    </label>
    <div class="fc-seg" role="group" aria-label="Cartes à afficher">
      <button type="button" aria-pressed={!onlyTodo} onclick={() => setTodo(false)}>Toutes</button>
      <button type="button" aria-pressed={onlyTodo} onclick={() => setTodo(true)}>À revoir</button>
    </div>
    <button type="button" class="fc-icon" aria-label="Mélanger les cartes" title="Mélanger" onclick={shuffle}>
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h3.2c1.3 0 2.5.7 3.2 1.8l2.2 3.4c.7 1.1 1.9 1.8 3.2 1.8H17M3 14h3.2c1.3 0 2.5-.7 3.2-1.8M12 7.8c.7-1.1 1.9-1.8 3.2-1.8H17M14.5 3.5 17 6l-2.5 2.5M14.5 11.5 17 14l-2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </div>

  <div class="fc-progress">
    <div class="fc-track" class:fc-bump={good} aria-hidden="true" onanimationend={() => (good = false)}><i style="width:{scope.length ? (100 * knownCount) / scope.length : 0}%"></i></div>
    <div class="fc-meta"><span>{deck.length ? `Carte ${Math.min(idx, deck.length - 1) + 1} / ${deck.length}` : ''}</span><span>{knownCount} / {scope.length} sues</span></div>
  </div>

  <div class="fc-card {slide}" class:is-flipped={flipped} class:is-empty={!deck.length} style="--fc-col:{card ? chCol(card.ch) : 'var(--accent)'}"
       tabindex="0" role="button" aria-label={flipped ? 'Revenir à la question' : 'Voir la réponse'}
       onpointerdown={down} onpointerup={up} onclick={click}
       onkeydown={e => { if (e.key === 'Enter') { e.preventDefault(); flip(); } }}>
    <div class="fc-inner">
      <section class="fc-face fc-front" aria-hidden={flipped}>
        {#if card}
          <header><span class="fc-tag">{chName(card.ch)}</span><span class="fc-state">{isKnown(card.id) ? '✓ sue' : ''}</span></header>
          <p class="fc-q">{card.q}</p>
          <footer>Touche la carte pour voir la réponse</footer>
        {:else}
          <header><span class="fc-tag"></span></header>
          <p class="fc-q">{onlyTodo ? 'Tout est su ici. Bravo !' : 'Aucune carte.'}</p>
          <footer>{onlyTodo ? 'Repasse sur « Toutes » pour réviser à nouveau.' : ''}</footer>
        {/if}
      </section>
      <section class="fc-face fc-back" aria-hidden={!flipped}>
        {#if card}
          <header><span class="fc-tag fc-tag-ans">Réponse</span></header>
          <p class="fc-qmini">{card.q}</p>
          <div class="fc-a">{card.a}</div>
        {/if}
      </section>
    </div>
  </div>

  <div class="fc-actions">
    <button type="button" class="fc-nav" aria-label="Carte précédente" disabled={!deck.length} onclick={() => move(-1)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <div class="fc-main">
      {#if !flipped}
        <button type="button" class="fc-reveal" disabled={!deck.length} onclick={() => (flipped = true)}>Voir la réponse</button>
      {:else}
        <div class="fc-grade">
          <button type="button" class="fc-bad" onclick={() => mark(false)}>À revoir</button>
          <button type="button" class="fc-good" onclick={() => mark(true)}>Je sais</button>
        </div>
      {/if}
    </div>
    <button type="button" class="fc-nav" aria-label="Carte suivante" disabled={!deck.length} onclick={() => move(1)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4.5 13 10l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  </div>
  <p class="fc-keys" aria-hidden="true"><kbd>Espace</kbd> retourner <span>·</span> <kbd>←</kbd><kbd>→</kbd> naviguer <span>·</span> <kbd>1</kbd> à revoir <span>·</span> <kbd>2</kbd> je sais</p>
</div>
