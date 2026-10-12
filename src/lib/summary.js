// Résumé de progression d'un cours, à partir de la table clé → {v, t}.
export function summarize(map, d) {
  const v = k => (map[k] ? map[k].v : undefined);
  const cards = d.cards || [], quiz = d.quiz || [], chapters = d.chapters || [];
  const known = cards.filter(c => v('card:' + c.id) === 1).length;
  const fiches = chapters.filter(c => v('fiche:' + c.id) === 1).length;
  let examOk = 0, examTodo = 0;
  for (const [k, e] of Object.entries(map)) {
    if (!k.startsWith('exam:')) continue;
    if (e.v === 'ok') examOk++; else if (e.v === 'revoir') examTodo++;
  }
  const seen = quiz.filter(q => v('quiz:' + q.id)).length;
  const right = quiz.filter(q => (v('quiz:' + q.id) || {}).last === 1).length;
  return {
    known, cards: cards.length,
    fiches, chapters: chapters.length,
    examOk, examTodo, examQ: d.counts ? d.counts.examQ : 0,
    quizSeen: seen, quizRight: right, quiz: quiz.length,
    best: v('best:quiz:all'),
  };
}

export const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
