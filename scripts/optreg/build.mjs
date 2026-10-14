// Transforme la conversion (out.json) en contenu du cours « Régularisation et optimisation » pour le site de révision.
import { readFileSync, writeFileSync } from 'node:fs';
const d = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const OUT = process.argv[3];

const META = {
  'p1/l1': ['cond', "Conditions d'un minimum", 'Partie I · leçon 1'],
  'p1/l2': ['fonctions', "Fonctions d'optimisation en ML", 'Partie I · leçon 2'],
  'p1/l3': ['descente', 'Descente de gradient & accélération', 'Partie I · leçon 3'],
  'p1/l3-adam': ['adam', 'Adam : comprendre l’optimiseur adaptatif', 'Partie I · approfondissement'],
  'p1/l4': ['sgd', 'SGD, descente par coordonnées & Newton', 'Partie I · leçon 4'],
  'p1/proximal': ['prox', 'Méthodes proximales : prox, FISTA et ADMM', 'Partie I · approfondissement'],
  'p1/dualite': ['dualite', 'Dualité convexe et conditions KKT', 'Partie I · approfondissement'],
  'p5/l1': ['bagging', 'Méthodes ensemblistes et bagging', 'Partie V · leçon 1'],
  'p5/l2': ['rf', 'Random Forest & sélection de features', 'Partie V · leçon 2'],
  'p5/l3': ['boosting', 'Boosting (AdaBoost, Gradient Boosting)', 'Partie V · leçon 3'],
  'p5/l4': ['l1l2', 'Régularisation L1, L2 et Elastic Net', 'Partie V · leçon 4'],
};
const SHORT = { cond: 'Conditions', fonctions: 'Fonctions en ML', descente: 'Descente', adam: 'Adam', sgd: 'SGD, CD, Newton', prox: 'Proximal', dualite: 'Dualité & KKT', bagging: 'Bagging', rf: 'Random Forest', boosting: 'Boosting', l1l2: 'L1, L2, Elastic Net' };
const clean0 = h => h.replace(/\n\s*\n+/g, '\n').replace(/[ \t]+/g, ' ').trim();
// coquilles de formules du site d'origine (elles y apparaissent aussi en erreur)
const clean = h => fix(clean0(h));
const FIX = [
  [String.raw`\rVert_{\infty\)`, String.raw`\rVert_{\infty}\)`],
  [String.raw`X^\topX`, String.raw`X^\top X`],
  [String.raw`\frac{\sigma_2^2}{\sigma_1^2 + \sigma_2^2\)`, String.raw`\frac{\sigma_2^2}{\sigma_1^2 + \sigma_2^2}\)`],
  [String.raw`w_1(\sigma_1^2 + \sigma_2^2
 w_1(\sigma_1^2 + \sigma_2^2)`, String.raw`w_1(\sigma_1^2 + \sigma_2^2)`],
];
const fix = h => FIX.reduce((t, [a, b]) => t.split(a).join(b), h);

const lessons = [], chapters = [];
for (const p of d.pages) {
  const m = META[p.key];
  if (!m) continue;
  const [ch, t, src] = m;
  chapters.push({ id: ch, name: SHORT[ch] });
  const sections = p.sections.map(s => ({ id: s.id, t: s.t, sub: s.sub, html: clean(s.html) })).filter(s => s.html);
  lessons.push({ id: 'o-' + ch, ch, short: SHORT[ch], src, t, sub: p.subtitle ? p.subtitle.trim() : '', sections });
}
chapters.push({ id: 'synth-optim', name: 'Synthèse optimisation' }, { id: 'synth-regul', name: 'Synthèse régularisation' });

const exams = [];
for (const [key, id, title, head] of [['p1/ex', 'ex-optim', 'Optimisation', 'Partie I'], ['p5/ex', 'ex-regul', 'Régularisation', 'Partie V']]) {
  const p = d.pages.find(x => x.key === key);
  const exos = p.sections.map(s => {
    const qs = [], introParts = [];
    s.html.split(/<!--EX:(\d+)-->/).forEach((chunk, i) => {
      if (i % 2) { const x = p.panels[+chunk]; qs.push({ q: `<p><b>Exercice ${x.num || ''} · ${x.t}</b></p>` + clean(x.q), a: x.a ? clean(x.a) : '<p class="math-note">Pas de solution dans le cours.</p>' }); }
      else if (chunk.trim()) introParts.push(chunk);
    });
    return { t: s.t, intro: clean(introParts.join('')), qs };
  }).filter(x => x.qs.length);
  const n = exos.reduce((a, x) => a + x.qs.length, 0);
  exams.push({ id, title: `${title} (${n})`, head: `<p><b>${head} · exercices corrigés</b> du cours en ligne. Cherche d'abord, puis ouvre la correction et note ton résultat.</p>`, exos });
}

const TAG = { 'p1/l1': 'cond', 'p1/l2': 'fonctions', 'p1/l3': 'descente', 'p1/l3-adam': 'adam', 'p1/l4': 'sgd', 'p1/proximal': 'prox', 'p1/dualite': 'dualite', 'p1/synthese': 'synth-optim', 'p5/l1': 'bagging', 'p5/l2': 'rf', 'p5/l3': 'boosting', 'p5/l4': 'l1l2', 'p5/synthese': 'synth-regul' };
const quiz = d.quiz.map(q => ({ id: 'oq_' + q.id, ch: TAG[q.tags.find(t => TAG[t])], q: q.question, opts: q.options, ans: q.answerIndex, exp: q.explanation }));
const lost = quiz.filter(q => !q.ch);
if (lost.length) console.log('QCM sans chapitre :', lost.map(q => q.id));

writeFileSync(OUT, JSON.stringify({ chapters, lessons, exams, quiz }));
console.log(lessons.length, 'leçons,', lessons.reduce((a, l) => a + l.sections.length, 0), 'sections ;', exams.map(e => e.title).join(', '), ';', quiz.length, 'QCM ;', Math.round(readFileSync(OUT).length / 1024), 'ko');
