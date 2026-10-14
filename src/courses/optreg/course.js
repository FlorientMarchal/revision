// Fiche d'identité du cours. Le contenu (content.json) est généré à partir du cours en ligne du master (parties I et V).
export default {
  id: 'optreg',
  title: 'Régularisation et optimisation',
  short: 'Optim. & régularisation',
  code: 'TW131MI',
  level: 'M1 MIASHS',
  semester: 'S1 · 2026-2027',
  evals: [
    { label: 'Partiel', date: '2026-12-02', time: '13h' },
    { label: 'Rattrapage', date: '2027-01-07', time: '14h' },
  ],
  examInfo: '<b>Deux parties du cours en ligne du master :</b> <b>Optimisation</b> (conditions d\'un minimum, fonctions de perte, descente de gradient, SGD, Newton ; et en approfondissement Adam, méthodes proximales, dualité et KKT) et <b>Régularisation</b> (bagging, forêts aléatoires, boosting, Ridge, Lasso, Elastic Net). Les leçons, les 163 exercices corrigés et les QCM sont repris du cours ; les démonstrations interactives n\'y sont pas.',
  examsLabel: 'Exercices corrigés',
  topics: ['conditions d\'optimalité', 'convexité', 'descente de gradient', 'SGD, Newton, Adam', 'méthodes proximales', 'dualité et KKT', 'bagging, forêts, boosting', 'Ridge, Lasso, Elastic Net'],
  load: () => import('./data.js'),
  credit: '<p><b>Source du cours.</b> Fiche de révision personnelle reprenant les parties « Optimisation » et « Régularisation » du cours en ligne <i>Fondations de l\'apprentissage statistique</i> (Master MIASHS, Université Paul-Valéry Montpellier 3) : leçons, exercices et leurs solutions (mode enseignant), questions de quiz. Le contenu appartient à ses auteurs ; seules la mise en page et la conversion ont été faites pour ce site.</p>',
};
