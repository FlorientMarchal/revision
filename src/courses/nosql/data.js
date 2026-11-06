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
  Q('ordre', 'arango', 'AQL : que renvoie FOR o IN ouvrages SORT o.parution LIMIT 10 FILTER o.genre == "roman" RETURN o ?', ['les 10 romans les plus anciens', 'les romans parmi les 10 ouvrages les plus anciens', 'une erreur : FILTER doit précéder LIMIT', 'tous les romans triés'], 1, 'Les opérations s\'exécutent dans l\'ordre écrit : le FILTER placé après LIMIT ne filtre que les 10 résultats déjà limités.'),
  Q('limit', 'arango', 'Équivalent AQL de LIMIT 10 OFFSET 20 ?', ['LIMIT 10, 20', 'LIMIT 20, 10', 'LIMIT 10 OFFSET 20', 'SKIP 20 LIMIT 10'], 1, 'LIMIT décalage, nombre : attention à l\'ordre des arguments.'),
  Q('havingaql', 'arango', 'En AQL, le HAVING de SQL s\'écrit…', ['HAVING après COLLECT', 'FILTER avant COLLECT', 'FILTER après COLLECT', 'COLLECT … HAVING'], 2, 'COLLECT genre = l.genre WITH COUNT INTO n FILTER n > 5 RETURN { genre, n }.'),
  Q('count', 'arango', 'Compter les livres d\'avant 1900 en AQL :', ['RETURN COUNT(livres)', 'FOR l IN livres FILTER l.annee < 1900 COLLECT WITH COUNT INTO n RETURN n', 'SELECT COUNT(*) …', 'FOR l IN livres FILTER l.annee < 1900 RETURN COUNT'], 1, 'Sans filtre, RETURN LENGTH(livres) suffit.'),
  Q('update', 'arango', 'UPDATE "12345" WITH { genre: "roman" } IN livres…', ['remplace le document par { genre: "roman" }', 'modifie genre et conserve les autres attributs', 'crée le document s\'il n\'existe pas', 'supprime les autres attributs'], 1, 'UPDATE fusionne ; REPLACE écrase tout sauf _key et _id.'),
  Q('replace', 'arango', 'Que fait REPLACE si le document visé n\'existe pas ?', ['il l\'insère', 'il échoue', 'il ne fait rien', 'il crée une collection'], 1, 'Contrairement au REPLACE INTO de MariaDB. Pour insérer ou mettre à jour : UPSERT.'),
  Q('upsert', 'arango', 'Équivalent AQL de INSERT … ON DUPLICATE KEY UPDATE ?', ['REPLACE', 'UPSERT … INSERT … UPDATE … IN', 'MERGE', 'INSERT … OPTIONS { overwrite }'], 1, 'UPSERT { isbn: … } INSERT { … } UPDATE { tirages: OLD.tirages + 1 } IN livres.'),
  Q('keepnull', 'arango', 'Pour retirer un attribut de documents (comme DROP COLUMN), on écrit…', ['REMOVE l.attr', 'UPDATE l WITH { attr: null } IN livres OPTIONS { keepNull: false }', 'UPDATE l WITH { attr: null } IN livres', 'ALTER COLLECTION'], 1, 'Sans keepNull: false, l\'attribut serait conservé avec la valeur null.'),
  Q('leftjoin', 'arango', 'Comment l\'annexe traduit-elle un LEFT JOIN (chaque auteur, même sans livre) ?', ['FOR imbriqués + FILTER', 'une sous-requête LET titres = (FOR l IN livres FILTER … RETURN l.titre)', 'LEFT FOR', 'MERGE(a, l)'], 1, 'Chaque auteur reçoit la liste de ses livres, vide s\'il n\'en a aucun.'),
  Q('egal', 'arango', 'En AQL, à quoi sert = (un seul signe égal) ?', ['à comparer', 'à affecter : LET x = …, COLLECT g = …', 'à rien, c\'est une erreur', 'à tester l\'égalité stricte'], 1, 'La comparaison s\'écrit ==.'),
  Q('conv', 'arango', 'Que vaut "1965" == 1965 en AQL ?', ['true', 'false', 'null', 'une erreur'], 1, 'Pas de conversion implicite : TO_NUMBER() ou TO_STRING().'),
  Q('nullord', 'arango', 'FILTER l.annee < 1900 garde aussi…', ['rien d\'autre', 'les documents sans attribut annee', 'les documents où annee est une chaîne', 'les documents supprimés'], 1, 'Un attribut absent vaut null, et null < nombre.'),
  Q('key', 'arango', 'Comment désigner le document de clé 12345 ?', ['12345', '"12345"', 'id = 12345', '_id: 12345'], 1, 'La _key est une chaîne.'),
  Q('ddl', 'arango', 'Comment créer une collection ou un index ?', ['CREATE COLLECTION en AQL', 'depuis l\'interface web, arangosh ou l\'API : AQL ne manipule que les données', 'INSERT INTO _collections', 'avec RETURN NEW'], 1, 'AQL n\'a ni CREATE TABLE ni GRANT.'),
  Q('subq', 'arango', 'Une sous-requête entre parenthèses renvoie…', ['une valeur', 'un tableau', 'un document', 'un booléen'], 1, 'FIRST(...) en extrait la première valeur.'),
  Q('tp3', 'arango', 'TP 3 : comment le corrigé stocke-t-il la relation n-n entre artistes et éditions ?', ['une collection d\'association', 'la liste des noms d\'artistes dans chaque édition', 'une clé étrangère', 'un graphe'], 1, '3 collections (artistes, festivals, editions) pour 4 tables SQL.'),
  Q('distinct', 'arango', 'Tous les artistes différents ayant joué à Garorock : qu\'est-ce qui NE retire PAS les doublons ?', ['COLLECT art = a', 'RETURN DISTINCT nom_artiste', 'RETURN a', 'COLLECT puis RETURN'], 2, 'COLLECT et RETURN DISTINCT dédoublonnent.'),
  Q('pathv', 'graphes', 'Traversée depuis "worldVertices/world" : que contient path.vertices[1] pour une capitale ?', ['world', 'le continent', 'le pays', 'la capitale'], 1, 'vertices[0] est toujours world, vertices[1] le continent.'),
  Q('anyimdb', 'graphes', 'Drames réalisés par Robert Redford (Person → Movie ← Genre) : pourquoi ANY ?', ['par habitude', 'les deux arêtes pointent vers le film, donc le chemin change de sens', 'parce que le graphe n\'est pas orienté', 'pour aller plus vite'], 1, 'Ni INBOUND ni OUTBOUND ne suivent un chemin dont les arêtes changent de sens.'),
  Q('all', 'graphes', 'path.edges[*].$label ALL == "ACTS_IN" vérifie que…', ['au moins une arête est ACTS_IN', 'toutes les arêtes du chemin sont ACTS_IN', 'la dernière arête est ACTS_IN', 'aucune arête n\'est DIRECTED à la profondeur 1'], 1, 'Opérateur de comparaison de tableau ALL, avec l\'expansion [*].'),
  Q('global', 'graphes', 'OPTIONS { uniqueVertices: "global" } impose…', ['order: "dfs"', 'order: "bfs"', 'une profondeur de 1', 'ANY'], 1, 'Parcours en largeur.'),
  Q('upath', 'graphes', 'Que garantit OPTIONS { uniqueVertices: "path" } ?', ['chaque nœud n\'apparaît qu\'une fois dans le résultat', 'on ne repasse pas par un même nœud sur un chemin', 'on ne suit que les arêtes sortantes', 'les plus proches d\'abord'], 1, 'Une personne reste atteignable par plusieurs chemins : on dédoublonne avec COLLECT.'),
  Q('refresh', 'graphes', 'Dans le visualiseur, que se passe-t-il quand on rafraîchit la page ?', ['rien', 'le graphe est recalculé depuis un nœud de départ pris au hasard', 'le graphe entier s\'affiche', 'les arêtes disparaissent'], 1, 'Pour tout voir : nœud de départ worldVertices/world dans Settings.'),
  Q('start', 'graphes', 'TP 4 imdb : comment partir du nœud « Sigourney Weaver » ?', ['FOR v IN 1..1 "Sigourney Weaver"', 'le chercher par une requête classique (FOR v IN imdb_vertices FILTER v.name == …), puis traverser depuis v', 'GRAPH "Sigourney Weaver"', 'START WITH'], 1, 'FOR vertex, edge, path IN 1..1 OUTBOUND v GRAPH imdb.'),
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
