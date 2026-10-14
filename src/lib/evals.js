// Dates des évaluations (partiels, rattrapages) déclarées dans course.js : evals: [{ label, date: 'AAAA-MM-JJ' | null }].
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const parse = s => (s ? new Date(s + 'T00:00:00') : null);

export function fmtEval(s) {
  const d = parse(s);
  return d ? d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : null;
}

/** Évaluations avec leur statut : passée, prochaine, à venir, ou date inconnue. */
export function evalList(c) {
  const t = today();
  const list = (c.evals || []).map(e => ({ ...e, d: parse(e.date) }));
  const next = list.filter(e => e.d && e.d >= t).sort((a, b) => a.d - b.d)[0];
  return list.map(e => ({ ...e, past: !!(e.d && e.d < t), next: e === next, when: fmtEval(e.date) }));
}

/** Clé de tri des cours : la prochaine évaluation d'abord, puis les dates inconnues, puis les cours terminés. */
export function evalRank(c) {
  const t = today();
  const ds = (c.evals || []).map(e => parse(e.date));
  const up = ds.filter(d => d && d >= t).sort((a, b) => a - b)[0];
  if (up) return [0, up.getTime()];
  if ((c.evals || []).some(e => !e.date)) return [1, 0];
  return [2, -Math.max(0, ...ds.filter(Boolean).map(d => d.getTime()))];
}
export const byEval = (a, b) => { const x = evalRank(a), y = evalRank(b); return x[0] - y[0] || x[1] - y[1] || a.title.localeCompare(b.title, 'fr'); };
