// Fiche d'identité du cours. Le contenu (fiches, TD, labo de TP) est chargé à la demande.
export default {
  id: 'visu',
  title: 'Visualisation d\'informations',
  code: 'TW113MI',
  short: 'Visualisation',
  level: 'M1 MIASHS',
  semester: 'S1 · 2026-2027',
  teacher: 'Arnaud Sallaberry',
  evals: [
    { label: 'Partiel', date: '2026-11-02', time: '9h15' },
    { label: 'Rattrapage', date: '2027-01-05', time: '9h30' },
  ],
  examInfo: '<b>Examen sur 20 :</b> 10 points de cours (questions dans l\'esprit du TD, dont certaines viennent d\'anciens examens) et 10 points de TP (coder une visualisation). Pour la partie TP, <b>seuls les codes fournis par l\'enseignant sont acceptés</b> ; tu as droit à tous les codes faits en exemple, mais les consignes ne seront pas détaillées comme dans les supports.',
  examsLabel: 'TD corrigé',
  topics: ['quoi / pourquoi / comment', 'types de variables', 'organisation spatiale', 'variables visuelles', 'couleur', 'SVG, JavaScript, D3'],
  load: () => import('./data.js'),
  viz: () => import('./viz.js'),
  credit: '<p><b>Source du cours.</b> Fiche de révision personnelle tirée du cours <i>Visualisation d\'informations</i> (M1 MIASHS, Université Paul-Valéry Montpellier 3) d\'<b>Arnaud Sallaberry</b> : diapositives des CM 1 à 4, TD 1, supports et fichiers de départ des TP 1 à 5. Le cours s\'appuie sur <i>Visualization Analysis &amp; Design</i> de Tamara Munzner (A K Peters / CRC Press, 2014). Les notions, exemples, énoncés et extraits de code appartiennent à leurs auteurs ; les données COVID-19 des TP viennent de <i>Our World in Data</i>.</p>',
};
