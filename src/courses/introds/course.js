// Fiche d'identité du cours. Le contenu (leçons, labos Python et R, corrigés…) est chargé à la demande.
export default {
  id: 'introds',
  title: 'Introduction à la science des données',
  short: 'Science des données',
  code: 'TW121MI',
  level: 'M1 MIASHS',
  semester: 'S1 · 2026-2027',
  teacher: 'L. Raddaf, S. Lèbre, G. Richomme, S. Bringay',
  evals: [
    { label: 'Partiel', date: '2026-10-12' },
    { label: 'Rattrapage', date: '2027-01-08', time: '9h et 12h' },
  ],
  examInfo: '<b>Trois parties :</b> <b>probabilités et statistique</b> (50 % des points : lois, vecteurs gaussiens, estimateurs et maximum de vraisemblance, LGN, TCL, intervalles, tests et tests multiples), <b>bases de Python</b> (25 % : contrôle, listes, fonctions, dictionnaires ; savoir écrire une version générique <i>et</i> une version « pythonesque ») et <b>Python pour les données</b> (25 % : NumPy, Pandas, Matplotlib, Seaborn). Les onglets <b>Python</b> et <b>R</b> exécutent le code directement dans le navigateur.',
  examsLabel: 'Exercices corrigés',
  topics: ['probabilités', 'estimation', 'intervalles et tests', 'Python', 'NumPy · Pandas', 'Matplotlib · Seaborn'],
  load: () => import('./data.js'),
  viz: () => import('./viz.js'),
  credit: '<p><b>Source du cours.</b> Fiche de révision personnelle tirée du cours <i>Introduction à la science des données</i> (TW121MI, M1 MIASHS, Université Paul-Valéry Montpellier 3) : diapositives de probabilités (L. Raddaf) et de statistique (S. Lèbre), tests et corrections de tests multiples, fiche d\'exercices et son corrigé, TD et TP (vraisemblance, lois limites, vecteurs gaussiens), évaluation 2023 ; notebooks corrigés de bases de Python (G. Richomme) et de Python pour les données (S. Bringay). Les notions, énoncés, codes et jeux de données appartiennent à leurs auteurs. Les corrigés marqués « proposé » ont été rédigés pour ce site.</p>',
};
