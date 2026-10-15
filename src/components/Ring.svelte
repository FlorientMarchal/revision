<script>
  // Anneau de progression animé (pourcentage au centre). Le tracé part de zéro à l'affichage
  // et le nombre compte en même temps ; ensuite, chaque changement est animé depuis l'ancienne valeur.
  import { untrack } from 'svelte';
  import { reduced } from '../lib/motion.js';
  let { value = 0, size = 56, stroke = 5, label = '', delay = 150, animate = true } = $props();
  const r = $derived((size - stroke) / 2);
  const c = $derived(2 * Math.PI * r);
  const v = $derived(Math.max(0, Math.min(100, Math.round(value))));
  const still = !animate || reduced();
  let shown = $state(still ? Math.max(0, Math.min(100, Math.round(value))) : 0);
  let first = true;
  $effect(() => {
    const to = v;
    const fromV = untrack(() => shown);
    if (still || to === fromV) { shown = to; first = false; return; }
    const wait = first ? delay : 0, dur = first ? 950 : 600;
    first = false;
    let raf = 0, t0 = 0;
    const step = t => {
      if (!t0) t0 = t + wait;
      const p = Math.min(1, Math.max(0, (t - t0) / dur));
      const e = 1 - Math.pow(1 - p, 3);
      shown = Math.round(fromV + (to - fromV) * e);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); shown = to; };
  });
</script>

<span class="ring" class:ring-full={v === 100} class:ring-zero={v === 0} class:ring-still={still} style="--size:{size}px; --ring-delay:{delay}ms" role="img" aria-label={label ? `${label} : ${v} %` : `${v} %`}>
  <svg viewBox="0 0 {size} {size}" width={size} height={size} aria-hidden="true">
    <circle class="ring-bg" cx={size / 2} cy={size / 2} r={r} stroke-width={stroke} />
    <circle class="ring-fg" cx={size / 2} cy={size / 2} r={r} stroke-width={stroke}
      stroke-dasharray={c} stroke-dashoffset={c * (1 - v / 100)} style="--c:{c}" transform="rotate(-90 {size / 2} {size / 2})" />
  </svg>
  <b aria-hidden="true">{shown}<small>%</small></b>
</span>
