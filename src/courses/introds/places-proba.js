// Emplacements des illustrations de viz-proba.js dans les leçons (lesson, section, name, where).
export const places = [
  // p1 : lois usuelles
  { lesson: 'p1', section: 'vocab', name: 'repartition', where: { before: '<div class="box def"><div class="box-h">Définition · Espérance et variance' } },
  { lesson: 'p1', section: 'discretes', name: 'loisDiscretes', where: { after: '</tbody></table>' } },
  { lesson: 'p1', section: 'continues', name: 'loisContinues', where: { after: '</tbody></table>' } },
  { lesson: 'p1', section: 'continues', name: 'memoire', where: { before: '<div class="box ex"><div class="box-h">Exemple · temps de réparation' } },
  { lesson: 'p1', section: 'sommes', name: 'sommes', where: { before: '<div class="box ex"><div class="box-h">Exemple · cours, exercices 1 à 3' } },
  // p2 : conditionnement, indépendance, covariance, vecteurs gaussiens
  { lesson: 'p2', section: 'cond', name: 'bayes', where: 'end' },
  { lesson: 'p2', section: 'indep', name: 'independance', where: { before: '<div class="box warn"><div class="box-h">Attention · indépendants' } },
  { lesson: 'p2', section: 'cov', name: 'covariance', where: { before: '<div class="box prop"><div class="box-h">Règles de calcul' } },
  { lesson: 'p2', section: 'cov', name: 'nonCorrelees', where: { before: '<div class="box warn"><div class="box-h">Attention · corrélation' } },
  { lesson: 'p2', section: 'gauss', name: 'gauss2d', where: { before: '<div class="box ex"><div class="box-h">Exemple · vecteur transformé' } },
  { lesson: 'p2', section: 'gauss', name: 'transfoGauss', where: { before: '<div class="box method"><div class="box-h">Méthode · sous R' } },
  // s1 : estimateurs et maximum de vraisemblance
  { lesson: 's1', section: 'prop', name: 'cibleEstim', where: 'end' },
  { lesson: 's1', section: 'usuels', name: 'varianceEmp', where: { before: '<div class="box warn"><div class="box-h">Attention · R et la variance' } },
  { lesson: 's1', section: 'emv', name: 'emv', where: { before: '<div class="box ex"><div class="box-h">Exemple · loi de Poisson (CM, exercice 3)' } },
];
