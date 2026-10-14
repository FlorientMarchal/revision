// Mémo de code du cours NoSQL : requêtes reprises de l'onglet « Requêtes » (corrigés et diapositives), sans copie.
import { queries } from './queries.js';

const all = queries.flatMap(s => s.exos.map(x => ({ ...x, set: s })));
const strip = h => h.replace(/<[^>]+>/g, '').replace(/^Ex\.\s*\d+\s*·\s*/, '').trim();
/** La requête d'identifiant `id`, avec sa question comme intitulé (ou `n` si donné). */
function Q(id, n) {
  const x = all.find(e => e.id === id);
  if (!x) throw new Error('Requête introuvable : ' + id);
  return { n: n || strip(x.q), code: x.sol, note: x.note };
}

export const codesheet = [
  { part: 'SQL', lang: 'SQL', t: 'Sélectionner, filtrer, trier', src: 'CM et TP 1', items: [
    Q('tp1-1', 'Toutes les lignes d\'une table'),
    Q('tp1-2', 'Filtrer (WHERE)'),
    Q('sc-1', 'Trier (ORDER BY)'),
    Q('sc-2', 'Plusieurs conditions (AND)'),
    Q('sc-4', 'Trier en décroissant et limiter'),
    Q('sc-5', 'Modifier une ligne (UPDATE)'),
  ] },
  { part: 'SQL', lang: 'SQL', t: 'Jointures et agrégats', src: 'CM et TP 1', items: [
    Q('sc-3', 'Jointure entre deux tables'),
    Q('tp1-3', 'Plusieurs jointures et DISTINCT'),
    Q('sc-6', 'Le dernier achat d\'un client'),
    Q('sc-7', 'Somme sur une période (SUM)'),
  ] },
  { part: 'CouchDB', lang: 'JavaScript / URL', t: 'CouchDB : documents et vues', src: 'CM, partie 4', items: [
    Q('cd-1', 'Tous les documents, avec leur contenu'),
    Q('cd-2', 'Un document par son identifiant'),
    Q('cd-4', 'Fonction map d\'une vue'),
    Q('cd-5', 'Interroger une vue par clé'),
    Q('cd-6', 'Vue avec reduce _count, groupée par clé'),
    Q('cd-7', 'Clé composée'),
    Q('cd-8', 'Plage de clés sans reduce'),
  ] },
  { part: 'AQL', lang: 'AQL', t: 'ArangoDB : requêtes AQL', src: 'CM, partie 5', items: [
    Q('aq-1', 'Jointure : FOR imbriqués + FILTER, SORT, RETURN'),
    Q('aq-2', 'Filtrer sur des champs indexés'),
    Q('aq-4', 'Deux jointures et une liste imbriquée (IN)'),
    Q('aq-5', 'Requête géographique'),
  ] },
  { part: 'AQL', lang: 'AQL', t: 'Graphes en AQL', src: 'CM, partie 5', items: [
    Q('aq-6', 'Traversée INBOUND de profondeur 1 à 2'),
    Q('aq-7', 'Traversée ANY en largeur, sans doublon'),
  ] },
];
