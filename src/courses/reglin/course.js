// Fiche d'identité du cours. Le contenu est chargé à la demande.
export default {
  id: 'reglin',
  title: 'Modèles de régression linéaire et outils du diagnostic',
  short: 'Régression linéaire',
  code: 'TW133MI',
  level: 'M1 MIASHS',
  semester: 'S1 · 2026-2027',
  teacher: 'C. Joutard',
  evals: [
    { label: 'Partiel', date: '2026-11-30', time: '8h15' },
    { label: 'Rattrapage', date: '2027-01-04', time: '10h' },
  ],
  examInfo: '<b>Deux parties :</b> la <b>modélisation</b> (régression linéaire multiple, moindres carrés, inférence dans le modèle gaussien) et la <b>validation</b> du modèle (diagnostics, résidus, colinéarité), travaillée en TP sur R. <b>Cours en cours :</b> le contenu sera complété au fil des séances.',
  examsLabel: 'TD corrigés',
  topics: ['régression multiple', 'moindres carrés', 'tests de Student et de Fisher', 'prévision', 'moindres carrés généralisés', 'validation sur R'],
  load: () => import('./data.js'),
  viz: () => import('./viz.js'),
  credit: '<p><b>Source du cours.</b> Fiche de révision personnelle tirée du cours <i>Modèles de régression linéaire et outils du diagnostic</i> (TW133MI, M1 MIASHS, Université Paul-Valéry Montpellier 3) : diapositives du cours, TD 1 et 2, exercices de révision, éléments de correction et commandes R, et TP de validation en R Markdown. Les notions, exemples, énoncés et codes appartiennent à leurs auteurs. Les exemples <i>swiss</i> et <i>longley</i> sont des jeux de données fournis avec R.</p>',
};
