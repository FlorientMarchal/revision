// Mémo de code du cours NoSQL : requêtes reprises de l'onglet « Requêtes » (corrigés, diapositives et annexe), sans copie.
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
  { part: 'CouchDB', lang: 'JavaScript / URL', t: 'CouchDB : les vues du TP 2', src: 'TP 2, corrigé', items: [
    Q('tp2-2', 'Une ligne par élément d\'une liste imbriquée (forEach + emit)'),
    Q('tp2-3', 'Lister des valeurs sans doublon : reduce _count + group=true'),
    Q('tp2-4b', 'Clé composée et plage startkey / endkey avec {}'),
    Q('tp2-5', 'Filtrer sur plusieurs critères avec une clé composée'),
  ] },
  { part: 'AQL', lang: 'AQL', t: 'ArangoDB : requêtes AQL', src: 'CM, partie 5', items: [
    Q('aq-1', 'Jointure : FOR imbriqués + FILTER, SORT, RETURN'),
    Q('aq-2', 'Filtrer sur des champs indexés'),
    Q('aq-4', 'Deux jointures et une liste imbriquée (IN)'),
    Q('aq-5', 'Requête géographique'),
  ] },
  { part: 'AQL', lang: 'AQL', t: 'ArangoDB : les requêtes du TP 3', src: 'TP 3, corrigé', items: [
    Q('tp3-2', 'Valeur dans une liste (IN) et RETURN DISTINCT'),
    Q('tp3-5', 'Jointure entre une liste imbriquée et une collection'),
    Q('tp3-6', 'Lister sans doublon avec COLLECT'),
  ] },
  { part: 'AQL', lang: 'AQL', t: 'De SQL à AQL : lire', src: 'annexe', items: [
    Q('ax-19', 'Trier et paginer (LIMIT décalage, nombre)'),
    Q('ax-21', 'Jointure interne'),
    Q('ax-22', 'Jointure externe : sous-requête'),
    Q('ax-23', 'Regrouper et compter (COLLECT … WITH COUNT INTO)'),
    Q('ax-24', 'Autres agrégats (AGGREGATE)'),
    Q('ax-26', 'HAVING : FILTER après COLLECT'),
    Q('ax-28', 'Compter tout'),
    Q('ax-30', 'Sous-requête scalaire'),
  ] },
  { part: 'AQL', lang: 'AQL', t: 'De SQL à AQL : écrire', src: 'annexe', items: [
    Q('ax-1', 'Insérer'),
    Q('ax-6', 'Modifier plusieurs documents (UPDATE fusionne)'),
    Q('ax-11', 'Remplacer (REPLACE écrase)'),
    Q('ax-13', 'Insérer ou mettre à jour (UPSERT)'),
    Q('ax-14', 'Supprimer (REMOVE)'),
    Q('ax-10', 'Retirer un attribut'),
  ] },
  { part: 'AQL', lang: 'AQL', t: 'Graphes en AQL', src: 'CM, partie 5', items: [
    Q('aq-6', 'Traversée INBOUND de profondeur 1 à 2'),
    Q('aq-7', 'Traversée ANY en largeur, sans doublon'),
  ] },
  { part: 'AQL', lang: 'AQL', t: 'Graphes : les traversées du TP 4', src: 'TP 4, corrigé', items: [
    Q('tp4-1', 'Distance au nœud de référence'),
    Q('tp4-2', 'Filtrer sur un nœud du chemin (path.vertices)'),
    Q('tp4-3', 'Partir d\'un document trouvé par une requête'),
    Q('tp4-4', 'Chemin qui change de sens (ANY) et type d\'arête'),
    Q('tp4-5', 'Toutes les arêtes du même type (ALL ==), sans doublon'),
    Q('tp4-6', 'Regrouper les chemins (COLLECT … INTO) et compter'),
  ] },
];
