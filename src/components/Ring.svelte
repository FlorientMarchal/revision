<script>
  // Anneau de progression animé (pourcentage au centre). Le tracé part de zéro à l'affichage.
  let { value = 0, size = 56, stroke = 5, label = '' } = $props();
  const r = $derived((size - stroke) / 2);
  const c = $derived(2 * Math.PI * r);
  const v = $derived(Math.max(0, Math.min(100, Math.round(value))));
</script>

<span class="ring" class:ring-full={v === 100} class:ring-zero={v === 0} style="--size:{size}px" role="img" aria-label={label ? `${label} : ${v} %` : `${v} %`}>
  <svg viewBox="0 0 {size} {size}" width={size} height={size} aria-hidden="true">
    <circle class="ring-bg" cx={size / 2} cy={size / 2} r={r} stroke-width={stroke} />
    <circle class="ring-fg" cx={size / 2} cy={size / 2} r={r} stroke-width={stroke}
      stroke-dasharray={c} stroke-dashoffset={c * (1 - v / 100)} style="--c:{c}" transform="rotate(-90 {size / 2} {size / 2})" />
  </svg>
  <b aria-hidden="true">{v}<small>%</small></b>
</span>
