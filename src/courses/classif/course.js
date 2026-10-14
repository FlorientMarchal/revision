// Fiche d'identité du cours. Le contenu lourd (data.js, illustrations, outils) est chargé à la demande.
export default {
  id: 'classif',
  title: 'Classification supervisée et non supervisée',
  short: 'Classification',
  code: 'TW132MI',
  level: 'M1 MIASHS',
  semester: 'S1 · 2025-2026',
  teacher: 'Marine Demangeot',
  evals: [
    { label: 'Partiel', date: '2026-10-12', time: '8h15' },
    { label: 'Rattrapage', date: '2027-01-06', time: '14h' },
  ],
  topics: ['KNN', 'régression logistique', 'arbres CART', 'SVM', 'clustering'],
  load: () => import('./data.js'),
  viz: () => import('./viz.js'),
  tools: () => import('./tools.js'),
  legacy: { prefix: 'classif:' },
  todo: {
    title: 'Consignes de l\'enseignante pour le contrôle du 12/10',
    items: [
      { html: '<b>Savoir démontrer</b> la décomposition de l\'inertie en inertie intra-classes et inter-classes (correction de l\'exercice 1 du TP clustering).', go: 'clust', anchor: 'preuve-inertie', label: 'Voir la démonstration' },
      { html: '<b>Savoir répondre</b> : demi-journée data science, à quoi ressemble la courbe ROC calculée par Kaggle à partir d\'un de vos fichiers de soumission ?', go: 'reglog', anchor: 'roc-kaggle', label: 'Voir la réponse' },
    ],
  },
  credit: '<p><b>Source du cours.</b> Fiche de révision personnelle tirée du cours <i>Classification supervisée et non supervisée</i> (TW132MI, M1 MIASHS, Université Paul-Valéry Montpellier 3) de <b>Marine Demangeot</b> : diapositives, sujets d\'examen (2024 S1, 2024 S2, 2025 S1) et corrections de TP. Ce cours s\'inspire lui-même très largement de l\'ouvrage <i>Introduction au Machine Learning</i> de Chloé-Agathe Azencott (Dunod), et cite <i>Understanding Machine Learning</i> (Shalev-Shwartz et Ben-David, 2014) et <i>The Elements of Statistical Learning</i> (Hastie, Tibshirani et Friedman, 2009). Les notions, formules, exemples et sujets appartiennent à leurs auteurs.</p>',
};
