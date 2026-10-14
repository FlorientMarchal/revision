// Fiche d'identité du cours. Le contenu (leçons, démonstrations, formulaire…) et les illustrations sont chargés à la demande.
export default {
  id: 'acp',
  title: 'Analyse de données multidimensionnelles (ACP)',
  short: 'ACP',
  code: 'TW122MI',
  level: 'M1 MIASHS',
  semester: 'S1 · 2026-2027',
  teacher: 'Yoann Debain',
  evals: [
    { label: 'Partiel', date: '2026-11-13', time: '8h15' },
    { label: 'Rattrapage', date: '2027-01-07', time: '9h30' },
  ],
  examInfo: '<b>Savoir démontrer :</b> le cours demande de démontrer la plupart des résultats (tableau centré, inertie, propriétés des composantes, contributions, qualités de représentation…). Ils sont tous corrigés dans l\'onglet <b>Démonstrations</b>.',
  examsLabel: 'Démonstrations',
  topics: ['ACP', 'choix des composantes', 'contributions et qualités', 'Varimax', 'CLV'],
  load: () => import('./data.js'),
  viz: () => import('./viz.js'),
  credit: '<p><b>Source du cours.</b> Fiche de révision personnelle tirée du cours <i>Analyse de données multidimensionnelles</i> (M1 MIASHS, Université Paul-Valéry Montpellier 3) de <b>Yoann Debain</b> : diapositives (notations et statistiques de base ; ACP : problèmes et solutions ; analyse des résultats ; Varimax ; features engineering ; CLV) et document de démonstrations. Les notions, notations et démonstrations appartiennent à leur auteur. Les données des illustrations sont simulées.</p>',
};
