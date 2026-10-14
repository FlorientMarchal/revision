// Fiche d'identité du cours. Le contenu (leçons, démonstrations, formulaire…) et les illustrations sont chargés à la demande.
export default {
  id: 'acp',
  title: 'Analyse de données multidimensionnelles (ACP)',
  short: 'ACP',
  level: 'M1 MIASHS',
  semester: 'S1 · 2026-2027',
  teacher: 'Yoann Debain',
  evals: [
    { label: 'Examen', date: null },
  ],
  examInfo: '<b>Savoir démontrer :</b> le cours demande de démontrer la plupart des résultats (tableau centré, inertie, propriétés des composantes, contributions, qualités de représentation…). Ils sont tous corrigés dans l\'onglet <b>Démonstrations</b>. Le site couvre les parties 1 à 3 du cours (ACP, analyse des résultats et Varimax, features engineering et CLV).',
  examsLabel: 'Démonstrations',
  topics: ['notations matricielles', 'ACP : quatre formulations', 'choix du nombre de composantes', 'contributions et qualités', 'cercle des corrélations', 'Varimax', 'rangs, ACP normée, AFM', 'CLV'],
  load: () => import('./data.js'),
  viz: () => import('./viz.js'),
  credit: '<p><b>Source du cours.</b> Fiche de révision personnelle tirée du cours <i>Analyse de données multidimensionnelles</i> (M1 MIASHS, Université Paul-Valéry Montpellier 3) de <b>Yoann Debain</b> : diapositives (notations et statistiques de base ; ACP : problèmes et solutions ; analyse des résultats ; Varimax ; features engineering ; CLV) et document de démonstrations. Les notions, notations et démonstrations appartiennent à leur auteur. Les données des illustrations sont simulées.</p>',
};
