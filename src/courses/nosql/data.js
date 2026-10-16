// Contenu du cours « Bases de données NoSQL ». Identifiants fixes : la progression ne se décale pas si l'on ajoute du contenu.
import { lessons } from './lessons.js';
import { queries } from './queries.js';

export { lessons, queries };

export const chapters = [
  { id: 'intro', name: 'Bases & SQL' },
  { id: 'nosql', name: 'Le NoSQL' },
  { id: 'couchdb', name: 'CouchDB' },
  { id: 'arango', name: 'ArangoDB & AQL' },
  { id: 'graphes', name: 'Graphes' },
  { id: 'index', name: 'Performances & index' },
];

const C = (id, ch, q, a) => ({ id: 'nc_' + id, ch, q, a });

const Q = (id, ch, q, opts, ans, exp) => ({ id: 'nq_' + id, ch, q, opts, ans, exp });
export const quiz = [
  Q('bdd', 'intro', 'Laquelle n\'est pas une base de données au sens du cours ?', ['une bibliothèque', 'une penderie', 'un annuaire classé', 'une archive étiquetée'], 1, 'Dans la penderie, on passe tout en revue un par un : rien n\'est classé pour retrouver efficacement.'),
  Q('acidA', 'intro', 'Dans ACID, le A signifie…', ['Accessibilité', 'Atomicité', 'Authentification', 'Agrégation'], 1, 'Atomicité : la transaction réussit ou échoue entièrement.'),
  Q('acidI', 'intro', '« La simultanéité des transactions n\'impacte pas le résultat » : c\'est…', ['la durabilité', 'la cohérence', 'l\'isolation', 'l\'atomicité'], 2, 'Isolation : obtenue par l\'ordonnancement des transactions (verrous).'),
  Q('fk', 'intro', 'Dans un SGBD relationnel, les relations entre tables sont modélisées par…', ['des index', 'des clés étrangères', 'des vues', 'des documents imbriqués'], 1, 'Clés étrangères, avec des mécanismes « cascade ».'),
  Q('having', 'intro', 'Pour garder les artistes présents dans au moins 2 festivals, on utilise…', ['WHERE COUNT(*) >= 2', 'HAVING COUNT(DISTINCT f.id) >= 2 après GROUP BY', 'ORDER BY COUNT(*) LIMIT 2', 'DISTINCT 2'], 1, 'Une condition sur un agrégat se met dans HAVING, après GROUP BY.'),
  Q('left', 'intro', 'Pour garder les artistes sans aucune édition dans un comptage, on utilise…', ['JOIN', 'LEFT JOIN', 'DISTINCT', 'HAVING'], 1, 'LEFT JOIN garde les lignes de la table de gauche sans correspondance.'),
  Q('nom', 'nosql', 'NoSQL signifie aujourd\'hui…', ['No SQL at all', 'Not Only SQL', 'New Object SQL', 'Non-Optimized SQL'], 1, 'D\'abord « not SQL », puis « Not Only SQL ».'),
  Q('horiz', 'nosql', 'Le passage à l\'échelle horizontal consiste à…', ['acheter une machine plus puissante', 'répartir la charge sur plusieurs machines en réseau', 'compresser les données', 'ajouter des index'], 1, 'Cluster de machines ordinaires, extensibilité presque infinie.'),
  Q('cap', 'nosql', 'Pourquoi ACID est-il difficile sur un cluster ?', ['à cause du typage', 'à cause de la réplication / partition : latence, incohérence, indisponibilité (théorème CAP)', 'parce que SQL est interdit', 'parce que les machines sont ordinaires'], 1, 'Le cours cite le théorème CAP.'),
  Q('garde', 'nosql', 'Quelle propriété ACID est en général conservée en NoSQL ?', ['l\'atomicité', 'la cohérence', 'l\'isolation', 'la durabilité'], 2, '« Propriétés ACID → poubelle (sauf l\'isolation en général). »'),
  Q('inconv', 'nosql', 'Lequel n\'est PAS un inconvénient du NoSQL cité en cours ?', ['cohérence à garantir à la main', 'pas de langage de requête normalisé', 'pas de schéma : plus de logique applicative', 'impossible de stocker plus de 1 To'], 3, 'Au contraire, le NoSQL vise les très grands volumes.'),
  Q('redis', 'nosql', 'Redis est un SGBD…', ['orienté documents', 'clé-valeur', 'orienté graphes', 'orienté colonnes'], 1, 'Clé-valeur : le niveau 0 de la base de données.'),
  Q('cass', 'nosql', 'Cassandra et HBase sont orientés…', ['documents', 'graphes', 'colonnes', 'clé-valeur'], 2, 'Plus proches du relationnel, ils stockent les valeurs par colonnes.'),
  Q('neo', 'nosql', 'Quel SGBD est à la fois orienté documents et graphes ?', ['Redis', 'Neo4J', 'ArangoDB', 'Cassandra'], 2, 'ArangoDB est multi-modèle.'),
  Q('modele', 'nosql', 'Bibliothèque modélisée avec un document par ouvrage : qu\'est-ce qui est moins facile ?', ['lister les ouvrages', 'lister les auteurs', 'trouver un ouvrage par son id', 'ajouter un ouvrage'], 1, 'Les auteurs sont dispersés dans les ouvrages.'),
  Q('alldocs', 'couchdb', 'La seule vue par défaut de CouchDB est…', ['_find', '_changes', '_all_docs', '_design'], 2, '_all_docs, interrogeable avec key, limit, include_docs…'),
  Q('incl', 'couchdb', 'Pour obtenir le contenu des documents avec _all_docs, on ajoute…', ['?limit=1', '?include_docs=true', '?group=true', '?reduce=false'], 1, 'Sinon on n\'a que les identifiants.'),
  Q('emit', 'couchdb', 'Dans une fonction map CouchDB, on produit les paires clé-valeur avec…', ['return', 'emit(cle, valeur)', 'RETURN { }', 'yield'], 1, 'emit(a, doc.titre) émet la clé a et la valeur doc.titre.'),
  Q('collation', 'couchdb', 'Pour obtenir toutes les clés [pays, nom] commençant par "France", on écrit…', ['startkey=["France"]&endkey=["France"]', 'startkey=["France"]&endkey=["France", {}]', 'key="France"', 'endkey=["France", null]'], 1, 'L\'objet vide est trié après toutes les chaînes (null < booléens < nombres < chaînes < tableaux < objets).'),
  Q('cleordre', 'couchdb', 'Artistes français des Eurockéennes, toutes éditions confondues : quelle clé émettre ?', ['[doc.nom, doc.annee, a.pays]', '[doc.nom, a.pays, doc.annee]', '[a.pays, doc.annee]', 'doc.nom'], 1, 'Les critères fixés (festival, pays) d\'abord, l\'élément libre (année) à la fin.'),
  Q('incr', 'couchdb', 'Après l\'ajout de documents, une vue CouchDB…', ['doit être recréée à la main', 'est mise à jour de façon incrémentale, au moment de la requête', 'est supprimée', 'n\'est jamais mise à jour'], 1, 'Seuls les documents nouveaux ou modifiés repassent dans map.'),
  Q('group', 'couchdb', 'Une vue map + reduce _count interrogée sans paramètre renvoie…', ['une ligne par document', 'une ligne par clé', 'une seule ligne (key: null) avec le total', 'une erreur'], 2, 'Il faut group=true pour une ligne par clé, reduce=false pour les lignes de map.'),
  Q('vueperf', 'couchdb', 'Principal inconvénient des vues CouchDB ?', ['elles sont lentes à interroger', 'temps d\'indexation et volume de données', 'elles ne supportent pas JSON', 'elles imposent un schéma'], 1, 'Très performantes une fois construites, mais il faut les construire et les stocker.'),
  Q('arango', 'arango', 'Qu\'est-ce qu\'ArangoDB reprend du relationnel ?', ['les clés étrangères', 'le schéma et le typage', 'plusieurs collections et des jointures', 'les transactions ACID'], 2, 'Mais pas de schéma, pas de clés étrangères, pas d\'ACID.'),
  Q('aqlwhere', 'arango', 'En AQL, l\'équivalent du WHERE de SQL est…', ['WHERE', 'FILTER', 'COLLECT', 'PRUNE'], 1, 'FOR … IN …, FILTER, SORT, RETURN.'),
  Q('aqlsel', 'arango', 'En AQL, le résultat est construit par…', ['SELECT', 'RETURN', 'EMIT', 'PROJECT'], 1, 'RETURN { titre: o.titre, … }.'),
  Q('aqlpara', 'arango', 'AQL est un langage…', ['plus ensembliste qu\'itératif', 'plus itératif qu\'ensembliste', 'purement fonctionnel', 'identique à SQL'], 1, 'On écrit des boucles imbriquées.'),
  Q('edge', 'graphes', 'Une arête ArangoDB relie deux sommets par…', ['_key et _rev', '_from et _to', 'source et target', 'in et out'], 1, '{ "_from": "noeuds/A", "_to": "noeuds/B", … }.'),
  Q('inbound', 'graphes', 'INBOUND "worldVertices/world" suit…', ['les arêtes sortant de world', 'les arêtes entrant vers world', 'les arêtes dans les deux sens', 'le plus court chemin'], 1, 'Les arêtes « is-in » vont du pays vers le continent vers world : on remonte les arêtes entrantes.'),
  Q('any', 'graphes', 'Pour un graphe d\'amitié non orienté, on utilise…', ['INBOUND', 'OUTBOUND', 'ANY', 'SHORTEST_PATH'], 2, 'ANY parcourt les arêtes dans les deux sens.'),
  Q('dist', 'graphes', 'Comment obtenir la distance au nœud de départ dans une traversée ?', ['COUNT(vertex)', 'LENGTH(path.edges)', 'edge.depth', 'DISTANCE(vertex)'], 1, 'path.edges contient les arêtes parcourues.'),
  Q('bfs', 'graphes', 'OPTIONS { order: "bfs" } donne…', ['les plus éloignés d\'abord', 'les plus proches d\'abord (parcours en largeur)', 'un ordre aléatoire', 'un tri alphabétique'], 1, 'bfs = breadth-first search.'),
  Q('2for', 'index', 'Deux boucles FOR imbriquées sur des collections de taille n coûtent…', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 3, 'Une boucle O(n), deux imbriquées O(n²).'),
  Q('redond', 'index', 'Recopier le nom de l\'auteur dans chaque post est avantageux si…', ['les écritures sont plus nombreuses que les lectures', 'les lectures sont plus nombreuses que les écritures', 'on a un index geo', 'jamais'], 1, 'On évite la jointure à la lecture, au prix d\'un travail à l\'écriture.'),
  Q('persist', 'index', 'Un index persistent permet d\'accéder aux _key en…', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 1, 'Il produit un arbre.'),
  Q('sparse', 'index', 'Un index « sparse »…', ['impose des valeurs uniques', 'ignore les valeurs nulles ou manquantes', 'n\'est pas trié', 'indexe tous les champs'], 1, 'Unique : chaque valeur différente ; sparse : valeurs nulles ou manquantes ignorées.'),
  Q('sel', 'index', 'Un index sur un champ booléen a une sélectivité…', ['forte', 'faible', 'nulle', 'infinie'], 1, 'Beaucoup de valeurs identiques : peu discriminant.'),
  Q('use1', 'index', 'Index sur [auteur, parution] : quelle requête NE peut PAS l\'utiliser ?', ['FILTER d.auteur == "Alain Damasio"', 'FILTER d.auteur == "Alain Damasio" FILTER d.parution > 2000', 'FILTER d.parution < 1990', 'FILTER d.auteur > "A" FILTER d.auteur < "F"'], 2, 'Il faut interroger les premiers champs dans l\'ordre : parution seul ne suffit pas.'),
  Q('use2', 'index', 'Index sur [auteur, parution] : laquelle utilise l\'index ?', ['FILTER d.auteur > "E" FILTER d.parution < 1990', 'FILTER d.auteur > "E" FILTER d.parution == 1847', 'FILTER d.auteur == "Alain Damasio" SORT d.parution', 'SORT d.parution'], 2, 'Égalité sur le premier champ puis tri sur le second : OK. L\'inégalité doit porter sur le dernier champ interrogé.'),
  Q('un', 'index', 'Combien d\'index une requête AQL utilise-t-elle à chaque parcours de collection ?', ['aucun', 'un seul', 'deux au maximum', 'tous ceux de la collection'], 1, 'L\'optimiseur choisit le plus sélectif.'),
  Q('geo', 'index', 'Un index geo porte sur…', ['un seul champ numérique', 'deux champs (latitude, longitude) ou un objet GeoJSON', 'le champ _key', 'n\'importe quelle liste'], 1, 'Il accélère GEO_CONTAINS, GEO_DISTANCE, GEO_INTERSECTS…'),
];

export * from './codesheet.js';

// Illustrations interactives (src/courses/nosql/viz.js), insérées dans les sections des leçons.
export const vizPlacements = [
  { lesson: 'n1', section: 'requetes', name: 'nq-join', where: { after: 'WHERE p.titre = \'iPhone 14\';</code></pre></div>' } },
  { lesson: 'n2', section: 'cluster', name: 'nq-cluster', where: { before: '<div class="box warn"><div class="box-h">Attention · les problèmes du cluster' } },
  { lesson: 'n2', section: 'cluster', name: 'nq-cap', where: 'end' },
  { lesson: 'n2', section: 'compromis', name: 'nq-recipe', where: { before: '<div class="box warn"><div class="box-h">Attention · inconvénients' } },
  { lesson: 'n2', section: 'galaxie', name: 'nq-families', where: 'end' },
  { lesson: 'n2', section: 'modeliser', name: 'nq-model', where: { before: '<div class="box method">' } },
  { lesson: 'n3', section: 'vues', name: 'nq-couchview', where: { before: '<p>CouchDB a aussi un langage' } },
  { lesson: 'n3', section: 'perfs', name: 'nq-couchkey', where: { before: '<p>Performances : indexation' } },
  { lesson: 'n4', section: 'aql', name: 'nq-aql', where: { before: '<h4>Pour aller plus loin' } },
  { lesson: 'n5', section: 'traversee', name: 'nq-traversal', where: 'end' },
  { lesson: 'n5', section: 'pourquoi', name: 'nq-friends', where: { before: '<div class="box warn"><div class="box-h">Attention · les problèmes des jointures' } },
  { lesson: 'n6', section: 'redondance', name: 'nq-redund', where: { before: '<div class="box warn">' } },
  { lesson: 'n6', section: 'regles', name: 'nq-index', where: { before: '<div class="box ex">' } },
];

export { cards } from './cards.js';
