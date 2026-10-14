// Contenu du cours « Régularisation et optimisation ». content.json est généré depuis les pages du cours en ligne
// (parties I et V) : ne pas le modifier à la main, le régénérer.
import content from './content.json';

export const { chapters, lessons, exams, quiz } = content;

// Illustrations interactives (viz.js), placées dans les leçons (les identifiants viennent de content.json).
export const vizPlacements = [
  { lesson: 'o-descente', section: 'choix-pas-apprentissage', name: 'or-gd', where: 'end' },
  { lesson: 'o-descente', section: 'methode-nesterov', name: 'or-momentum', where: 'end' },
  { lesson: 'o-sgd', section: 'sgd', name: 'or-sgd', where: { before: '<h3>1.2 Mini-batch' } },
  { lesson: 'o-sgd', section: 'coordinate-descent', name: 'or-cd', where: { before: '<h3>2.1 Analyse théorique</h3>' } },
  { lesson: 'o-sgd', section: 'newton-raphson', name: 'or-newton', where: { before: '<h3>3.1' } },
  { lesson: 'o-sgd', section: 'synthese-methodes', name: 'or-race', where: { before: '<div class="synthesis-note">' } },
  { lesson: 'o-l1l2', section: 'introduction-reg', name: 'or-bv', where: { before: '<h3>Forme générale d\'un problème régularisé</h3>' } },
  { lesson: 'o-l1l2', section: 'lasso-regression', name: 'or-geom', where: { before: '<h3>Résolution par descente de coordonnées' } },
  { lesson: 'o-l1l2', section: 'elastic-net', name: 'or-path', where: 'end' },
  { lesson: 'o-l1l2', section: 's4', name: 'or-cv', where: 'end' },
];
