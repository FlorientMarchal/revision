// Fiche d'identité du cours. Le contenu (leçons, requêtes, flashcards, QCM) est chargé à la demande.
export default {
  id: 'nosql',
  title: 'Bases de données NoSQL',
  short: 'NoSQL',
  code: 'TW111MI',
  level: 'M1 MIASHS',
  semester: 'S1 · 2026-2027',
  teacher: 'Killian Stefanini',
  evals: [
    { label: 'Partiel', date: '2026-11-09', time: '8h45' },
    { label: 'Rattrapage', date: '2027-01-05', time: '14h' },
  ],
  examInfo: '<b>Examen le 9 novembre :</b> un QCM et un TP, 1h au total. 18h de cours, TD et TP du 8 octobre au 6 novembre. <i>Le site ne couvre pour l\'instant que le début du cours</i> (support des CM et TP 1).',
  topics: ['SGBD relationnels et SQL', 'pourquoi le NoSQL', 'CouchDB', 'ArangoDB et AQL', 'graphes', 'index'],
  load: () => import('./data.js'),
  credit: '<p><b>Source du cours.</b> Fiche de révision personnelle tirée du cours <i>Bases de données NoSQL</i> (M1 MIASHS, Université Paul-Valéry Montpellier 3) de <b>Killian Stefanini</b>, adapté du support du Pr. <b>Mathias Chouet</b> (licence CC BY-SA) : diapositives du cours, TP 1 et son corrigé, données du TP 2. Les notions, exemples, énoncés et requêtes appartiennent à leurs auteurs.</p>',
};
