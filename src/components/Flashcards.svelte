<script>
  import { onMount } from 'svelte';
  import { kv, progress, setVal } from '../lib/progress.js';
  import { confetti } from '../lib/motion.js';
  import { lens, roll, play, flyAway, reduced } from '../lib/motion-components.js';

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
  let good = $state(false);
  let party = $state(false);         // célébration de fin de paquet

  let cardEl = $state(null), mover = $state(null), deckEl = $state(null);

  const isKnown = id => (($prog['card:' + id] || {}).v === 1);
  const scope = $derived(data.cards.filter(c => filter === 'all' || c.ch === filter));
  const deck = $derived.by(() => {
    let d = scope.filter(c => !onlyTodo || !isKnown(c.id));
    if (order) { const pos = new Map(order.map((id, i) => [id, i])); d = [...d].sort((a, b) => (pos.get(a.id) ?? 1e9) - (pos.get(b.id) ?? 1e9)); }
    return d;
  });
  const knownCount = $derived(scope.filter(c => isKnown(c.id)).length);
  const card = $derived(deck[Math.min(idx, Math.max(0, deck.length - 1))]);
  // épaisseur du paquet : jusqu'à deux cartes visibles sous la carte du dessus
  const ghosts = $derived(Math.max(0, Math.min(2, deck.length - 1)));

  // ---------- chorégraphie ----------
  const rise = () => play(mover, 'mc-a-rise', 700);
  const drop = () => play(mover, 'mc-a-drop', 700);
  function flyOut(dir, tone, from) { if (cardEl && card) flyAway(cardEl, { dir, tone, from }); }

  function reset() { idx = 0; flipped = false; rise(); }
  function setFilter(v) { filter = v; ui.set('fcFilter', v); party = false; reset(); }
  function setTodo(v) { onlyTodo = v; ui.set('fcTodo', v); party = false; reset(); }
  function step(d) {
    if (!deck.length) return;
    idx = (Math.min(idx, deck.length - 1) + d + deck.length) % deck.length;
    flipped = false;
  }
  function move(d, from) {
    if (!deck.length) return;
    if (deck.length > 1) { if (d > 0) { flyOut(-1, '', from); step(d); rise(); } else { step(d); drop(); } }
    else { step(d); rise(); }
  }
  function mark(v, from) {
    if (!card) return;
    const wasLast = idx >= deck.length - 1;
    const completes = v && !isKnown(card.id) && scope.length > 1 && scope.every(c => c.id === card.id || isKnown(c.id));
    flyOut(v ? 1 : -1, v ? 'good' : 'bad', from);
    setVal(course.id, 'card:' + card.id, v ? 1 : 0);
    if (v) { good = false; requestAnimationFrame(() => (good = true)); }
    if (completes) { confetti(); party = true; setTimeout(() => (party = false), 2800); }
    if (onlyTodo && v) { flipped = false; if (wasLast) idx = 0; } else step(1);
    rise();
  }
  function shuffle() {
    const ids = deck.map(c => c.id);
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    order = ids; idx = 0; flipped = false;
    play(deckEl, 'mc-a-shuffle', 800);
  }
  function flip() {
    if (!deck.length) return;
    flipped = !flipped;
    play(mover, 'mc-a-sheen', 800);
  }

  // ---------- glisser la carte : → je sais, ← à revoir (le défilement vertical reste natif) ----------
  let drag = null, eatClick = false, frame = 0;
  const paint = () => {
    frame = 0;
    if (!drag || !mover) return;
    const p = Math.max(-1, Math.min(1, drag.dx / 120));
    mover.style.translate = `${drag.dx}px ${drag.dy * 0.15}px`;
    mover.style.rotate = `${drag.dx * 0.05}deg`;
    mover.style.setProperty('--p', p.toFixed(3));
    deckEl && deckEl.style.setProperty('--pa', Math.abs(p).toFixed(3));
  };
  function settle() {
    if (!mover) return;
    mover.classList.remove('is-drag');
    mover.style.translate = ''; mover.style.rotate = ''; mover.style.removeProperty('--p');
    deckEl && deckEl.style.removeProperty('--pa');
    document.documentElement.classList.remove('mc-xclip');
  }
  function down(e) {
    eatClick = false;
    if (!card || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, t: e.timeStamp, vx: 0, on: false };
  }
  function moveP(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.on) {
      if (Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; } // c'est un défilement
      if (Math.abs(dx) < 12 || Math.abs(dx) < 1.4 * Math.abs(dy)) return;
      drag.on = true;
      try { cardEl.setPointerCapture(e.pointerId); } catch (err) { /* pointeur déjà relâché */ }
      document.documentElement.classList.add('mc-xclip');
      mover && mover.classList.add('is-drag');
    }
    const dt = Math.max(1, e.timeStamp - drag.t);
    drag.vx = 0.6 * drag.vx + 0.4 * ((dx - drag.dx) / dt);
    drag.t = e.timeStamp; drag.dx = dx; drag.dy = dy;
    if (!reduced() && !frame) frame = requestAnimationFrame(paint);
  }
  function up(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (!d.on) return;
    eatClick = true;
    const go = Math.abs(d.dx) > 110 || (Math.abs(d.dx) > 45 && Math.abs(d.vx) > 0.55 && Math.sign(d.vx) === Math.sign(d.dx));
    const from = reduced() ? null : { x: d.dx, y: d.dy * 0.15, rot: d.dx * 0.05 };
    if (go) { settle(); mark(d.dx > 0, from); }
    else {
      mover && mover.classList.add('mc-a-spring');
      settle();
      setTimeout(() => mover && mover.classList.remove('mc-a-spring'), 450);
    }
  }
  function cancel(e) { if (drag && e.pointerId === drag.id) { drag = null; settle(); } }
  const click = () => { if (eatClick) { eatClick = false; return; } flip(); };

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
    return () => { document.removeEventListener('keydown', key); document.documentElement.classList.remove('mc-xclip'); };
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
    <div class="fc-seg" role="group" aria-label="Cartes à afficher" use:lens>
      <button type="button" aria-pressed={!onlyTodo} onclick={() => setTodo(false)}>Toutes</button>
      <button type="button" aria-pressed={onlyTodo} onclick={() => setTodo(true)}>À revoir</button>
    </div>
    <button type="button" class="fc-icon" aria-label="Mélanger les cartes" title="Mélanger" onclick={shuffle}>
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h3.2c1.3 0 2.5.7 3.2 1.8l2.2 3.4c.7 1.1 1.9 1.8 3.2 1.8H17M3 14h3.2c1.3 0 2.5-.7 3.2-1.8M12 7.8c.7-1.1 1.9-1.8 3.2-1.8H17M14.5 3.5 17 6l-2.5 2.5M14.5 11.5 17 14l-2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </div>

  <div class="fc-progress">
    <div class="fc-track" class:fc-bump={good} aria-hidden="true" onanimationend={() => (good = false)}><i style="transform:scaleX({scope.length ? knownCount / scope.length : 0})"></i></div>
    <div class="fc-meta">
      <span>{#if deck.length}Carte <b use:roll={Math.min(idx, deck.length - 1) + 1}></b> / {deck.length}{/if}</span>
      <span><b use:roll={knownCount}></b> / {scope.length} sues</span>
    </div>
  </div>

  <div class="fc-deck" bind:this={deckEl} style:--gh={ghosts}>
    {#each { length: ghosts } as _, g}<div class="fc-ghost" style:--g={ghosts - g} aria-hidden="true"></div>{/each}
    <div class="fc-card" class:is-flipped={flipped} class:is-empty={!deck.length} style:--fc-col={card ? chCol(card.ch) : 'var(--accent)'} bind:this={cardEl}
         tabindex="0" role="button" aria-label={flipped ? 'Revenir à la question' : 'Voir la réponse'}
         onpointerdown={down} onpointermove={moveP} onpointerup={up} onpointercancel={cancel} onclick={click}
         onkeydown={e => { if (e.key === 'Enter') { e.preventDefault(); flip(); } }}>
      <div class="fc-mover" bind:this={mover}>
        <div class="fc-inner">
          <section class="fc-face fc-front" aria-hidden={flipped}>
            {#if card}
              <header><span class="fc-tag">{chName(card.ch)}</span><span class="fc-state">{isKnown(card.id) ? '✓ sue' : ''}</span></header>
              <p class="fc-q">{card.q}</p>
              <footer><span class="fc-hint-fine">Touche la carte pour voir la réponse</span><span class="fc-hint-touch">Touche pour retourner · glisse → je sais, ← à revoir</span></footer>
            {:else}
              <header><span class="fc-tag"></span></header>
              {#if onlyTodo}
                <svg class="fc-done-ic" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" pathLength="1" /><path d="M15 25l6 6 12-14" pathLength="1" /></svg>
              {/if}
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
        <span class="fc-stamp fc-stamp-good" aria-hidden="true">Je sais</span>
        <span class="fc-stamp fc-stamp-bad" aria-hidden="true">À revoir</span>
      </div>
    </div>
    {#if party}
      <div class="fc-party" role="status">
        <div class="fc-party-in">
          <span class="fc-rays" aria-hidden="true">{#each { length: 12 } as _, k}<i style:--k={k}></i>{/each}</span>
          <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="27" pathLength="1" /><path d="M20 33l8 8 17-19" pathLength="1" /></svg>
          <b>Paquet maîtrisé !</b>
          <span>{scope.length} cartes sues sur {scope.length}</span>
        </div>
      </div>
    {/if}
  </div>

  <div class="fc-actions">
    <button type="button" class="fc-nav" aria-label="Carte précédente" disabled={!deck.length} onclick={() => move(-1)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <div class="fc-main">
      {#if !flipped}
        <button type="button" class="fc-reveal" disabled={!deck.length} onclick={flip}>Voir la réponse</button>
      {:else}
        <div class="fc-grade">
          <button type="button" class="fc-bad" onclick={() => mark(false)}>À revoir</button>
          <button type="button" class="fc-good" onclick={() => mark(true)}>Je sais</button>
        </div>
      {/if}
    </div>
    <button type="button" class="fc-nav" aria-label="Carte suivante" disabled={!deck.length} onclick={() => move(1)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4.5 13 10l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  </div>
  <p class="fc-keys" aria-hidden="true"><kbd>Espace</kbd> retourner <span>·</span> <kbd>←</kbd><kbd>→</kbd> naviguer <span>·</span> <kbd>1</kbd> à revoir <span>·</span> <kbd>2</kbd> je sais <span>·</span> glisser la carte : → je sais, ← à revoir</p>
</div>
