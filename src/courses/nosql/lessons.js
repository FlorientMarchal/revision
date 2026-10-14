// Le cours en entier, leçon par leçon, rédigé à partir des diapositives du CM (début du cours) et du TP 1.
// Les requêtes citées sont celles des supports (seuls l'indentation et les guillemets typographiques ont été retouchés).
const box = (k, title, html) => `<div class="box ${k}"><div class="box-h">${title}</div>${html}</div>`;
const def = (t, h) => box('def', 'Définition · ' + t, h);
const prop = (t, h) => box('prop', t, h);
const ex = (t, h) => box('ex', 'Exemple · ' + t, h);
const warn = (t, h) => box('warn', 'Attention · ' + t, h);
const method = (t, h) => box('method', 'Méthode · ' + t, h);
const code = (src, c) => box('code', 'Code du cours · ' + src, `<pre><code>${c.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code></pre>`);
const go = '<p class="math-note">À t\'entraîner dans l\'onglet <b>Requêtes</b>.</p>';

export const lessons = [
  /* ===================================================================== */
  {
    id: 'n1', ch: 'intro', short: 'Bases & SQL', src: 'CM, parties 1-2',
    t: 'Bases de données, SGBD relationnels et SQL',
    sub: 'Ce qu\'est une base de données, ce que fait un SGBD relationnel, les propriétés ACID et les requêtes SQL à connaître.',
    goals: [
      'Définir une base de données et un SGBD(R).',
      'Décrire l\'organisation d\'une base relationnelle : tables, tuples, clés primaires et étrangères, index.',
      'Énoncer les propriétés ACID.',
      'Écrire des requêtes SQL de sélection avec jointures, regroupements et tris.',
    ],
    sections: [
      { id: 'bdd', t: 'Qu\'est-ce qu\'une base de données ?', sub: 'Des données structurées, faciles à retrouver', html: `
${def('Base de données', '<p>Un <b>jeu de données structurées</b> : classées, organisées, étiquetées. Souvent numériques, mais pas seulement (bibliothèques, archives…). Objectif : <b>retrouver efficacement</b> les données en fonction de <b>critères multiples</b>.</p>')}
${ex('la bibliothèque et la penderie', '<p>Une <b>bibliothèque</b> est une base de données : je cherche « La Zone du Dehors » d\'Alain Damasio → rayon « science-fiction », lettre « D » → il y est, il n\'y est pas, ou une fiche indique qu\'il a été emprunté.</p><p>Ma <b>penderie</b> n\'en est pas une : pour trouver une chemise bleu foncé à motifs, je passe les vêtements en revue un par un… et si je ne la trouve pas, mystère (au sale ? perdue ? rangée ailleurs ?).</p>')}
` },
      { id: 'sgbd', t: 'Les SGBD', sub: 'Système de Gestion de Bases de Données (Relationnel)', html: `
${def('SGBD(R)', '<p>Logiciel qui permet de <b>gérer des bases de données</b>. Il est centralisé, multi-utilisateurs et fonctionne en mode <b>client-serveur</b> (le SGBD est le serveur). Il est <b>relationnel</b> quand les relations entre les données sont modélisées (clés étrangères) : on y gagne en performances et en sémantique, au prix d\'un <b>schéma contraignant</b>.</p>')}
<table class="t"><thead><tr><th>Relationnels</th><th>Non relationnels (NoSQL)</th></tr></thead><tbody><tr><td>MySQL / MariaDB, PostgreSQL, Oracle, Microsoft SQL Server…</td><td>CouchDB, MongoDB, ArangoDB…</td></tr></tbody></table>
` },
      { id: 'sql', t: 'Les bases de données SQL', sub: 'Tables, relations, index, ACID', html: `
${def('SQL', '<p><i>Structured english as Query Language</i> : un langage <b>standardisé</b> pour exprimer des requêtes adressées au SGBD : lecture (recherche multicritère), écriture (insertion, modification), suppression. « Base de données SQL » est un abus de langage pour « SGBD relationnel ».</p>')}
<h4>Organisation des données</h4>
<ul><li><b>Tables</b> : des lignes (<b>tuples</b> : un tuple = une donnée de la table) et des colonnes <b>typées</b>. La <b>clé primaire</b> identifie un tuple.</li>
<li><b>Relations entre tables</b> : <b>clés étrangères</b>, avec des mécanismes « cascade ».</li>
<li><b>Index</b>, et aussi déclencheurs (triggers), procédures stockées, vues…</li></ul>
${def('Propriétés ACID', '<ul><li><b>Atomicité</b> : une transaction réussit ou échoue entièrement, pas d\'entre-deux.</li><li><b>Cohérence</b> : la base n\'est jamais dans un état où des contraintes ne sont pas respectées.</li><li><b>Isolation</b> : la simultanéité des transactions n\'impacte pas le résultat.</li><li><b>Durabilité</b> : toute transaction réussie est enregistrée définitivement.</li></ul>')}
${ex('une boutique en ligne', '<p><code>clients</code> (# id, nom, prenom, adresse…), <code>produits</code> (# id, titre, prix…), <code>avis</code> (# id, 🔑 id_produit, note, avis…), <code>achats</code> (# id, 🔑 id_produit, 🔑 id_client, date, quantite…). # = clé primaire, 🔑 = clé étrangère.</p>')}
` },
      { id: 'requetes', t: 'Requêtes SQL', sub: 'Sélection, jointures, agrégats', html: `
${code('structure d\'une sélection', `SELECT [champs]
FROM [table]
JOIN [table_2] ON [condition]
WHERE [critères]
ORDER BY [tri] [direction]`)}
<p>Une <b>jointure</b> retourne des informations de plusieurs tables liées par des relations sémantiques :</p>
${code('les avis sur l\'iPhone 14', `SELECT a.note, a.avis FROM avis a JOIN produits p ON p.id = a.id_produit WHERE p.titre = 'iPhone 14';`)}
${code('ce que Dominique Dubois a dépensé cet été', `SELECT SUM(a.quantite * p.prix) as total FROM produits p
JOIN achats a ON a.id_produit = p.id
JOIN clients c ON c.id = a.id_client
WHERE c.nom = 'Dubois' AND c.prenom = 'Dominique' AND a.date > '2024-07-01' AND a.date < '2024-08-31';`)}
<h4>Les éléments du TP 1</h4>
<ul><li><code>SELECT DISTINCT</code> supprime les doublons (un artiste venu à plusieurs éditions).</li>
<li><code>GROUP BY … HAVING COUNT(DISTINCT f.id) &gt;= 2</code> : <code>WHERE</code> filtre les lignes avant regroupement, <code>HAVING</code> filtre les groupes.</li>
<li><code>LEFT JOIN</code> garde les lignes de gauche sans correspondance (artistes sans édition).</li></ul>
${prop('Choisir une clé primaire (corrigé du TP 1)', '<ul><li>Le plus simple : une clé numérique <b>auto-incrémentée</b>.</li><li>Une clé <b>naturelle</b> (colonne existante) si sa valeur est unique pour toute donnée potentielle, ex. <code>nom</code> pour les artistes.</li><li>Une clé sur <b>plusieurs colonnes</b>, ex. <code>(id_edition, id_artiste)</code> pour la table d\'association : c\'est la combinaison qui identifie le tuple.</li></ul>')}
${go}
` },
    ],
    keep: [
      'Base de données : données structurées pour retrouver efficacement selon plusieurs critères.',
      'SGBDR : client-serveur, relations par clés étrangères, schéma contraignant.',
      'ACID : atomicité, cohérence, isolation, durabilité.',
      'SELECT … FROM … JOIN … ON … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT.',
    ],
  },

  /* ===================================================================== */
  {
    id: 'n2', ch: 'nosql', short: 'Le NoSQL', src: 'CM, partie 3',
    t: 'Les bases de données NoSQL',
    sub: 'Pourquoi sortir du relationnel, ce qu\'on y perd, les grandes familles de SGBD NoSQL et la modélisation en documents.',
    goals: [
      'Expliquer ce que signifie NoSQL et à quels besoins il répond.',
      'Décrire le passage à l\'échelle horizontal (cluster) et ses difficultés.',
      'Lister ce qui coûte en performances dans un SGBD relationnel, et ce que le NoSQL abandonne.',
      'Citer les quatre familles de SGBD NoSQL avec un exemple chacune.',
      'Proposer plusieurs modélisations d\'un même problème dans une base orientée documents.',
    ],
    sections: [
      { id: 'def', t: 'Qu\'est-ce qu\'un SGBD NoSQL ?', sub: '« Not Only SQL »', html: `
${def('NoSQL', '<p>D\'abord « <i>not SQL</i> », puis « <b>Not Only SQL</b> » (le terme apparaît vers 2010). Désigne des SGBD <b>non relationnels</b> ou partiellement relationnels, qui répondent à des cas d\'utilisation particuliers :</p><ul><li><b>très grands volumes</b> de données (plus de 1 To) ;</li><li>besoin de <b>performances</b> sur ces volumes ;</li><li><b>clusters</b> : répartition et redondance des données.</li></ul>')}
` },
      { id: 'cluster', t: 'Le cluster : passage à l\'échelle horizontal', sub: 'Plusieurs machines ordinaires en réseau', html: `
<p>On répartit la charge (les clients) sur plusieurs machines en réseau. Des machines « ordinaires » suffisent, et l'extensibilité est presque infinie. Les données sont <b>répliquées</b> (redondance) et/ou <b>partitionnées</b> ; les machines se synchronisent.</p>
${warn('les problèmes du cluster', '<ul><li>Garantir <b>ACID</b> sur un cluster est difficile, voire impossible (voir notamment le <b>théorème CAP</b>).</li><li>Réplication et partition entraînent de la <b>latence</b> (réseau), une potentielle <b>incohérence</b> ou <b>indisponibilité</b>.</li><li>Les SGBD relationnels s\'accommodent mal d\'une distribution horizontale (au mieux, performances réduites).</li></ul><p>Il faut donc adapter le paradigme des SGBD.</p>')}
` },
      { id: 'couts', t: 'Ce qui coûte dans le relationnel', sub: 'Surtout à l\'écriture, mais aussi à la lecture', html: `
<h4>À l'écriture (insertion, modification, suppression)</h4>
<ul><li><b>ACID</b>, surtout sur cluster : l'atomicité impose de pouvoir annuler (<i>rollback</i>) ; la cohérence, de vérifier les contraintes à chaque transaction ; l'isolation, d'ordonnancer les transactions (verrous) ; la durabilité, de s'assurer du stockage « dur » avant de répondre.</li>
<li><b>Relations</b> : vérification des contraintes de clés à chaque modification.</li>
<li><b>Typage</b> : vérification des types à chaque modification.</li></ul>
<h4>Mais aussi à la lecture</h4>
<ul><li>Une <b>granularité fine</b> : un concept par table, des tables d'association, une propriété par colonne → des <b>jointures</b> nécessaires (une recherche par index pour chaque table) et de multiples lectures sur le stockage → latence des entrées-sorties.</li>
<li>Une structure qui dépend des <b>concepts</b> et pas (peu) des <b>cas d'utilisation</b> : les requêtes fréquentes n'ont pas de performances particulières.</li></ul>
` },
      { id: 'compromis', t: 'Gagner en souplesse et en performances', sub: 'Ce qu\'on jette… et ce qu\'on y perd', html: `
${prop('La recette (caricaturale, prévient le cours)', '<ul><li>Propriétés ACID → 🗑️ (sauf l\'isolation en général).</li><li>Relations (clés, jointures) → 🗑️ ; typage → 🗑️ ; schéma → 🗑️.</li><li>Structure des données à <b>granularité forte et variable</b> : une donnée peut peser 2 ko ou 1 Go ; organisable selon les <b>cas d\'utilisation</b> ; <b>dé-normalisation</b> : on peut introduire de la redondance.</li></ul><p>Et voilà : c\'est performant, et extensible horizontalement (cluster).</p>')}
${warn('inconvénients', '<ul><li>La <b>cohérence</b> est à garantir « à la main » (relations, redondance…).</li><li><b>Plusieurs modèles</b> de données valides : il faut anticiper les usages.</li><li><b>Pas de schéma</b> : beaucoup plus de logique applicative, on ne peut que supposer le format de la donnée.</li><li><b>Pas de langage de requête normalisé.</b></li></ul>')}
` },
      { id: 'galaxie', t: 'La galaxie NoSQL', sub: 'Quatre grandes orientations', html: `
<table class="t"><thead><tr><th>Famille</th><th>Principe</th><th>Exemples</th></tr></thead><tbody>
<tr><td><b>clé-valeur</b></td><td>le niveau 0 de la base de données</td><td>Redis</td></tr>
<tr><td><b>documents</b></td><td>clé-valeur dont la valeur est un document dont le format (JSON, XML…) est compris par le SGBD</td><td>CouchDB, ArangoDB, MongoDB</td></tr>
<tr><td><b>graphes</b></td><td>stocke des nœuds et des arêtes, avec des opérateurs de traversée</td><td>ArangoDB, Neo4J</td></tr>
<tr><td><b>colonnes</b></td><td>plus proche du relationnel, mais stocke les valeurs par colonnes</td><td>Cassandra, HBase</td></tr></tbody></table>
` },
      { id: 'modeliser', t: 'Modéliser en documents (JSON)', sub: 'L\'exemple de la bibliothèque', html: `
<p>Sans schéma, le même problème admet plusieurs modélisations. Chacune facilite certaines requêtes et en complique d'autres.</p>
${code('un document = un ouvrage', `{
  "_id": "6564764501f28f9c35b91a1a2271f60d98b86528ef0a089feaecb9c81ccd53c3",
  "titre": "La Zone du Dehors",
  "genres": [ "Science-fiction", "Anarchisme" ],
  "auteurs": [ "Alain Damasio" ],
  "parution": 1999
}`)}
<p>ID généré, niveau d'information variable (un autre ouvrage a un <code>titre_original</code>), un document contient toute l'information connexe → <b>facile de lister les ouvrages</b>, moins facile de lister les auteurs.</p>
${code('un document = un auteur', `{
  "_id": "65230de5926fb24d38137f72a6dc1fe328d6ff39733665f7401157410b6ef32f",
  "nom": "Emily Brontë",
  "pays": "Royaume Uni",
  "date_naissance": -4778524800,
  "ouvrages": [
    { "titre": "Les Hauts de Hurlevent", "titre_original": "Wuthering Heights",
      "parution": 1847, "genres": [ "Roman" ] }
  ]
}`)}
<p>→ <b>facile de lister les auteurs</b>, moins facile de lister les ouvrages.</p>
<p><b>Simulation du modèle relationnel</b> : des documents de différents concepts distingués par un champ <code>"type": "ouvrage"</code> ou <code>"type": "auteur"</code>. Un document ne contient qu'une partie de l'information connexe → difficulté égale pour lister tous les concepts ; et si le nom de l'auteur change (le « ë » de Brontë), il faut le mettre à jour partout où il est recopié.</p>
${method('Question ouverte du cours', '<p>Comment stocker les <b>emprunts</b> ? Il faut se demander quelles requêtes seront fréquentes (les emprunts en cours d\'un lecteur ? l\'historique d\'un ouvrage ?) : c\'est l\'usage qui guide la modélisation, pas seulement les concepts.</p>')}
` },
    ],
    keep: [
      'NoSQL = Not Only SQL : grands volumes, performances, clusters.',
      'Cluster : passage à l\'échelle horizontal ; ACID difficile (théorème CAP).',
      'On abandonne ACID (sauf isolation), relations, typage, schéma ; on dé-normalise.',
      'Inconvénients : cohérence à la main, plusieurs modèles valides, pas de schéma, pas de langage normalisé.',
      'Familles : clé-valeur (Redis), documents (CouchDB, MongoDB, ArangoDB), graphes (Neo4J, ArangoDB), colonnes (Cassandra, HBase).',
    ],
  },

  /* ===================================================================== */
  {
    id: 'n3', ch: 'couchdb', short: 'CouchDB', src: 'CM, partie 4',
    t: 'CouchDB : interroger par des vues',
    sub: 'Un SGBD orienté documents interrogé par des vues pré-construites en JavaScript (map / reduce) et par des URL.',
    goals: [
      'Décrire le fonctionnement de CouchDB : documents JSON, vue all_docs, paramètres d\'URL.',
      'Écrire une fonction map qui émet des paires clé-valeur.',
      'Expliquer reduce et group.',
      'Citer les avantages et inconvénients des vues pré-construites.',
    ],
    sections: [
      { id: 'principe', t: 'Un SGBD orienté documents', sub: 'Clé-valeur, documents JSON, vues', html: `
<ul><li><b>Clé-valeur</b> : un id (<i>hash</i>) pointe sur un <b>document JSON</b>.</li>
<li>Documents <b>ordonnés</b> par date d'insertion.</li>
<li>Interrogation des données par des <b>vues</b>. Une seule vue par défaut : <code>_all_docs</code>.</li>
<li>Paramètres d'interrogation d'une vue : <code>skip</code>, <code>limit</code>, <code>descending</code>, <code>key</code>, <code>startkey</code>, <code>endkey</code>…</li>
<li>Et aussi : <i>design docs</i>, API <code>_changes</code>, <code>_find</code>, réplication pair à pair.</li></ul>
${code('URL d\'interrogation de _all_docs', `/couchdb/miashs/_all_docs?include_docs=true
/couchdb/miashs/_all_docs?include_docs=true&key="4a0a116450abbefa98fd1f646c00030e"
/couchdb/miashs/_all_docs?include_docs=true&limit=1`)}
` },
      { id: 'vues', t: 'Les vues', sub: 'Pré-construites, écrites en JavaScript', html: `
${def('Vue CouchDB', '<p>Une requête <b>pré-construite</b>, écrite en JavaScript : on parcourt les documents et on <b>émet des paires clé-valeur</b>. Avantage : <b>très performant</b> une fois la vue construite. Inconvénients : <b>temps d\'indexation</b> et <b>volume</b> de données.</p>')}
${code('vue des ouvrages par auteur (map)', `function (doc) {
  doc.auteurs.forEach((a) => {
    emit(a, doc.titre);
  });
}`)}
<p>Résultat : <code>total_rows: 3</code>, des lignes <code>{ id, key: "Alain Damasio", value: "La Zone du Dehors" }</code>, <code>{ …, key: "Alain Damasio", value: "La Horde du Contrevent" }</code>, <code>{ …, key: "Emily Brontë", value: "Les Hauts de Hurlevent" }</code>. On l'interroge par <code>/_design/par_auteur/_view/par_auteur</code>, avec <code>?include_docs=true</code> ou <code>?key="Alain Damasio"</code>.</p>
${def('map / reduce et group', '<ul><li>Une vue a deux fonctions : <b>map</b> (produit les paires clé-valeur) et <b>reduce</b> (optionnelle).</li><li><b>reduce</b> produit une donnée calculée <b>pour chaque clé</b> et <b>pour l\'ensemble des documents</b> de la vue (ex. <code>_count</code>).</li><li>Les données de reduce peuvent être <b>groupées par clé</b> (<code>group=true</code>) : astuce pour <b>lister les différentes clés</b> d\'une vue.</li></ul>')}
${ex('par_auteur_2 (map ci-dessus + reduce _count)', '<ul><li><code>…/par_auteur_2</code> : une seule ligne <code>{ key: null, value: 3 }</code> (reduce sur tout).</li><li><code>?reduce=false</code> : les lignes de map.</li><li><code>?key="Alain Damasio"</code> : 2.</li><li><code>?group=true</code> : une ligne par auteur avec son nombre d\'ouvrages.</li></ul>')}
<p>CouchDB a aussi un langage de requêtes, « Mango » (≠ MongoDB), depuis la version 2.0 : le cours n'en parle volontairement pas.</p>
` },
      { id: 'perfs', t: 'Un exemple de performances', sub: 'Une vue à clé composée', html: `
<p>Base « demo » : ~230 000 documents représentant des requêtes clients sur un SI (~130 Mo sans vues). Vue « requêtes par type de client » :</p>
${code('map + reduce _count', `emit([doc.client.type, doc.date], 1);`)}
<p>Une <b>clé composée</b> permet d'obtenir toutes les requêtes Android, ou les requêtes Android du 16 juillet 2024 entre 9h10 et 9h12 avec <code>startkey=["android",1721121000000]&amp;endkey=["android",1721121120000]&amp;reduce=false</code>.</p>
<p>Performances : indexation ~80 s ; volume de la vue &lt; 5 Mo ; exécution ~100 ms.</p>
${go}
` },
    ],
    keep: [
      'CouchDB : un id (hash) → un document JSON ; vue par défaut _all_docs.',
      'Paramètres : include_docs, key, startkey, endkey, limit, skip, descending.',
      'Vue = map (emit(clé, valeur)) + reduce optionnelle (_count) ; group=true groupe par clé.',
      'Rapide une fois construite ; coûte du temps d\'indexation et du volume.',
    ],
  },

  /* ===================================================================== */
  {
    id: 'n4', ch: 'arango', short: 'ArangoDB & AQL', src: 'CM, partie 5.1',
    t: 'ArangoDB : modèle documents et langage AQL',
    sub: 'Un SGBD multi-modèle qui remet un peu de relationnel dans le NoSQL : collections et jointures en AQL.',
    goals: [
      'Présenter ArangoDB et ce qui le distingue de CouchDB.',
      'Expliquer ce qu\'on garde et ce qu\'on abandonne du relationnel.',
      'Traduire une requête SQL simple en AQL (FOR, FILTER, SORT, RETURN).',
    ],
    sections: [
      { id: 'presentation', t: 'Un SGBD NoSQL multi-modèle', sub: 'Documents et graphes', html: `
<ul><li>Depuis 2011 ; produit commercial, gratuit pour un usage non lucratif jusqu'à 100 Go de données.</li>
<li>Un compromis qui <b>se rapproche du modèle relationnel</b>, et <b>multi-modèle</b> : documents et graphes.</li>
<li>Clé-valeur : un id (hash) pointe sur un document JSON ; en modèle graphes, un document est soit un <b>vertex</b> (nœud) soit un <b>edge</b> (arête).</li>
<li><b>Plusieurs collections</b> de documents dans chaque base.</li>
<li>Interrogation par un <b>langage de requêtes : AQL</b>.</li>
<li><b>Indexation</b> de champs, requêtes <b>géospatiales</b>, cluster, schémas souples, champs générés, « vues », recherche plein texte…</li></ul>
` },
      { id: 'relationnel', t: 'Un peu de relationnel…', sub: 'Collections et jointures', html: `
<p><b>Plusieurs collections</b> de documents dans chaque base → séparation des concepts, moins de redondance. Le document « Les Hauts de Hurlevent » qui contenait ses genres et ses auteurs en entier est éclaté en trois collections : <code>ouvrages</code> (titre, auteurs : liste de noms, parution…), <code>auteurs</code> (nom, pays, dates) et <code>genres</code> (nom, description).</p>
<p><b>Un langage de requêtes, AQL</b> → plus souple, pas de pré-calcul, moins d'espace disque (mais plus de temps de réponse) ; et des <b>jointures</b> !</p>
${warn('…mais on reste dans du NoSQL', '<ul><li>Plusieurs collections, mais <b>pas de schéma ni de typage</b>.</li><li>Des jointures, mais <b>pas de clés étrangères</b> → pas de contraintes relationnelles.</li><li><b>Dé-normalisé</b> : redondance possible.</li><li><b>Pas d\'ACID</b> : extensible horizontalement (cluster).</li></ul>')}
` },
      { id: 'aql', t: 'Le langage AQL', sub: 'Un paradigme plus itératif qu\'ensembliste', html: `
<p>En SQL on décrit un <b>ensemble</b> ; en AQL on écrit des <b>boucles</b> imbriquées : <code>FOR</code> parcourt une collection, <code>FILTER</code> garde certains documents, <code>SORT</code> trie, <code>RETURN</code> construit le résultat (un objet JSON).</p>
<div class="grid2">
${code('SQL', `SELECT
  o.titre as titre,
  o.parution as parution,
  a.nom as auteur,
  a.pays as pays
FROM ouvrages o
JOIN auteurs a ON a.nom == o.auteurs[0]
ORDER BY o.parution DESC`)}
${code('AQL', `FOR o IN ouvrages
  FOR a IN auteurs
    FILTER a.nom == o.auteurs[0]
    SORT o.parution DESC
    RETURN {
      titre: o.titre,
      parution: o.parution,
      auteur: a.nom,
      pays: a.pays
    }`)}
</div>
<table class="t"><thead><tr><th>titre</th><th>parution</th><th>auteur</th><th>pays</th></tr></thead><tbody>
<tr><td>Les Hauts de Hurlevent</td><td>1847</td><td>Emily Brontë</td><td>Royaume Uni</td></tr>
<tr><td>La Zone du Dehors</td><td>1999</td><td>Alain Damasio</td><td>France</td></tr>
<tr><td>La Horde du Contrevent</td><td>2006</td><td>Alain Damasio</td><td>France</td></tr></tbody></table>
<p class="math-note">Résultat de la diapositive pour la requête sans <code>SORT</code>.</p>
<h4>Pour aller plus loin (utile pour le TP 2)</h4>
<ul><li><code>FOR a IN e.artistes</code> parcourt une <b>liste imbriquée</b> dans un document : pas besoin de jointure.</li>
<li><code>RETURN DISTINCT</code> supprime les doublons ; <code>"Placebo" IN e.artistes[*].nom</code> teste l'appartenance à la liste des noms.</li>
<li><code>COLLECT … WITH COUNT INTO n</code> ou <code>COLLECT … INTO g</code> regroupent comme un <code>GROUP BY</code> ; un <code>FILTER</code> après le <code>COLLECT</code> joue le rôle du <code>HAVING</code>.</li></ul>
${go}
` },
    ],
    keep: [
      'ArangoDB : multi-modèle (documents + graphes), plusieurs collections, langage AQL, index.',
      'On garde : collections, jointures. On reste NoSQL : pas de schéma, pas de clés étrangères, redondance, pas d\'ACID.',
      'AQL : FOR … IN …, FILTER, SORT … DESC, RETURN { … } ; plus itératif qu\'ensembliste.',
    ],
  },

  /* ===================================================================== */
  {
    id: 'n5', ch: 'graphes', short: 'Graphes', src: 'CM, partie 5.2',
    t: 'ArangoDB : le modèle graphes',
    sub: 'Sommets et arêtes, traversées de profondeur variable en AQL.',
    goals: [
      'Décrire un graphe ArangoDB : collections de sommets et d\'arêtes, champs _from et _to.',
      'Écrire une traversée AQL (FOR vertex, edge, path IN min..max INBOUND/OUTBOUND/ANY … GRAPH …).',
      'Expliquer pourquoi une traversée est plus simple qu\'une suite de jointures.',
    ],
    sections: [
      { id: 'modele', t: 'Sommets et arêtes', sub: '1 graphe = collections « edges » + collections « vertices »', html: `
<ul><li>En modèle graphes, une donnée est soit un <b>vertex</b> (nœud), stocké dans une collection de type « document », soit un <b>edge</b> (arête), stocké dans une collection de type « edge ».</li>
<li>Utile pour les problèmes de <b>traversée</b>, de <b>plus court chemin</b>…</li>
<li>Opérateurs AQL dédiés : <code>GRAPH</code>, <code>INBOUND</code>, <code>OUTBOUND</code>, <code>ANY</code>, <code>PRUNE</code>, <code>SHORTEST_PATH</code>, <code>K_PATHS</code>…</li></ul>
${prop('Un graphe = au moins une collection « edges » + au moins une collection « vertices »', '<p>Une arête relie deux sommets par leurs identifiants : <code>_from</code> et <code>_to</code>.</p>')}
<div class="grid2">
${code('collection « noeuds »', `{ "_id": "noeuds/A", "name": "Le nœud A", … }
{ "_id": "noeuds/B", "name": "Le nœud B", … }`)}
${code('collection « aretes »', `{
  "_from": "noeuds/A",
  "_to": "noeuds/B",
  "relation": "R",
  …
}`)}
</div>
${ex('continents, pays et capitales', '<p>Sommets <code>worldVertices</code> : <code>world</code> (type root), <code>continent-europe</code> (continent), <code>country-albania</code> (country, code ALB), <code>capital-tirana</code> (capital). Arêtes <code>worldEdges</code> de type « is-in », du plus petit vers le plus grand : Tirana → Albanie → Europe → World.</p>')}
` },
      { id: 'traversee', t: 'La traversée de graphe en AQL', sub: 'Profondeur variable', html: `
${code('syntaxe', `FOR vertex, edge, path
  IN 1..3
  INBOUND "collectionVertices/noeudDeReference"
  GRAPH nomDuGraphe
    FILTER vertex.unChamp == "…"
    FILTER edge.unAutreChamp == "…"
    [ PRUNE, OPTIONS ]
    RETURN {
      noeud: vertex.name,
      distance: LENGTH(path.edges)
    }`)}
<ul><li><code>1..3</code> : on parcourt au minimum 1 arête et au maximum 3.</li>
<li><code>INBOUND</code> : on suit les relations <b>entrantes</b> vers le nœud de référence (<code>_to</code> = nœud de référence) ; <code>OUTBOUND</code> : sortantes ; <code>ANY</code> : dans les deux sens.</li>
<li>À chaque tour : <code>vertex</code> est le nœud atteint, <code>edge</code> l'arête parcourue pour l'atteindre, <code>path</code> le chemin complet depuis le nœud de référence ; <code>path.edges</code> la liste des arêtes, donc <code>LENGTH(path.edges)</code> la distance.</li>
<li><code>PRUNE</code> arrête le parcours sous conditions ; <code>OPTIONS</code> configure le parcours (ordre, unicité…).</li></ul>
${code('les pays, à 1 ou 2 arêtes de « world »', `FOR vertex, edge, path IN 1..2 INBOUND "worldVertices/world" GRAPH worldCountry
  FILTER vertex.type == "country"
  RETURN {
    name: vertex.name,
    type: vertex.type,
    depth: LENGTH(path.edges)
  }`)}
<p>Résultat : 40 éléments (Ecuador, Colombia, Chile, Brazil…), tous à la profondeur 2. Le cours s'amuse : ici, <code>FOR v IN world_vertices FILTER v.type == "country" RETURN v</code> suffisait 😅.</p>
` },
      { id: 'pourquoi', t: 'Pourquoi un graphe plutôt que des jointures ?', sub: 'Les amis d\'amis', html: `
${code('amis, amis d\'amis et amis d\'amis d\'amis de B', `FOR vertex, edge, path
  IN 1..3                 // amis, amis d'amis, et amis d'amis d'amis
  ANY "amis/B"            // en partant de "B"
  GRAPH leGrapheDeLAmitie
  // plus proches d'abord, sans doublon
  OPTIONS { uniqueVertices: "path", order: "bfs" }
  RETURN {
    personne: vertex.name,
    distance: LENGTH(path.edges)
  }`)}
<p>Avec des jointures, il faut une boucle par niveau :</p>
${code('version par jointures', `FOR ami IN amis                                   // profondeur 1
  FILTER "B" IN ami._a_comme_amis                  // A, C, D
  FOR amidami IN amis                              // profondeur 2
    FILTER ami._key IN amidami._a_comme_amis       // A, B, C, E, F, G
    (…)                                            // profondeur 3
    RETURN {
      personne: vertex.name
    }`)}
${warn('les problèmes des jointures', '<p>Comment obtenir la distance ? Les nœuds déjà vus à la profondeur d − 1 ? Et une profondeur de 3000 ? La traversée gère une <b>profondeur variable</b> naturellement.</p>')}
${go}
` },
    ],
    keep: [
      'Graphe ArangoDB : collections de sommets (documents) + collections d\'arêtes (edges, avec _from et _to).',
      'FOR vertex, edge, path IN min..max INBOUND|OUTBOUND|ANY "coll/cle" GRAPH nom.',
      'LENGTH(path.edges) = distance ; OPTIONS { uniqueVertices, order: "bfs" } ; PRUNE.',
      'Une traversée gère une profondeur variable, contrairement aux jointures.',
    ],
  },

  /* ===================================================================== */
  {
    id: 'n6', ch: 'index', short: 'Performances & index', src: 'CM, partie 5.3',
    t: 'ArangoDB : performances et index',
    sub: 'Pourquoi les requêtes ralentissent, quand dupliquer des données, et comment les index persistants et géographiques accélèrent les requêtes.',
    goals: [
      'Expliquer la complexité des boucles FOR et les leviers de performance.',
      'Choisir entre une modélisation avec ou sans redondance selon les usages.',
      'Savoir quelles requêtes peuvent utiliser un index persistant sur plusieurs champs.',
      'Expliquer la sélectivité d\'un index et le rôle des entrées-sorties.',
    ],
    sections: [
      { id: 'complexite', t: 'La complexité augmente vite', sub: 'Une boucle par collection', html: `
<p>Une boucle <code>FOR</code> coûte <b>O(n)</b>, deux boucles imbriquées <b>O(n²)</b>, etc. Leviers pour garder de bonnes performances :</p>
<ul><li><b>limiter les jointures</b> (modélisation pertinente, redondance) ;</li><li><b>indexer</b> des champs ;</li><li><b>limiter les entrées-sorties</b>.</li></ul>
` },
      { id: 'redondance', t: 'Modéliser avec ou sans redondance', sub: 'Ça dépend des cas d\'utilisation', html: `
<p>Une collection <code>users</code> (<code>_key: "12345"</code>, first_name « Claude », last_name « Ho »…) et une collection <code>posts</code>. On veut afficher le nom de l'auteur dans le post.</p>
<table class="t"><thead><tr><th></th><th>Sans redondance : <code>"author": "12345"</code></th><th>Avec redondance : <code>"author": { "id": "12345", "displayed_name": "Claude Ho" }</code></th></tr></thead><tbody>
<tr><th>lecture</th><td>jointure</td><td>rien à faire</td></tr>
<tr><th>écriture</th><td>rien à faire</td><td>jointure + concaténation</td></tr>
<tr><th>avantageux si…</th><td>lectures &lt; écritures</td><td>lectures &gt; écritures</td></tr></tbody></table>
${warn('et si l\'utilisateur change son nom ?', '<p>Avec redondance, il faut mettre à jour tous ses posts : la cohérence est à garantir à la main.</p>')}
` },
      { id: 'index', t: 'Les index', sub: 'Persistent et geo', html: `
<ul><li>Un index est <b>propre à une collection</b>. Plusieurs types : <b>persistent</b>, <b>geo</b>…</li>
<li>Un index persistent est créé <b>par défaut sur <code>_key</code></b> (clé primaire).</li>
<li>Les index occupent de la place en <b>mémoire</b> et sur le <b>disque</b>.</li></ul>
${def('Index persistent', '<ul><li>Un <b>hash</b> sur un ou plusieurs champs, qui produit un <b>arbre</b> : accès aux <code>_key</code> des documents indexés en <b>O(log n)</b>.</li><li>On peut indexer des listes à une profondeur de 1, ex. <code>artists[*].name</code>.</li><li>Les index sont <b>triés</b>.</li><li>Il peut être <b>unique</b> (chaque valeur doit être différente) et/ou <b>sparse</b> (valeurs nulles ou manquantes ignorées).</li><li>Il a une <b>sélectivité</b> : <b>forte</b> s\'il y a beaucoup de valeurs différentes (index très discriminant, ex. un timestamp), <b>faible</b> s\'il y a beaucoup de valeurs identiques (ex. un booléen).</li></ul>')}
${code('index sur un champ, puis sur deux', `{ type: "persistent", fields: [ "auteur" ], unique: false, sparse: false }
{ type: "persistent", fields: [ "auteur", "parution" ], unique: false, sparse: false }`)}
<p>Sur un champ : hash("Alain Damasio") → documents 003 et 004 ; hash("Emily Brontë") → 002 ; hash("Ursula K. Le Guin") → 001. Sur deux champs, l'arbre a un second niveau : hash("Alain Damasio") → hash(1999) → 003 et hash(2019) → 004 ; hash("Ursula K. Le Guin") → hash(1974) → 001 et 005…</p>
` },
      { id: 'regles', t: 'Quelles requêtes utilisent l\'index ?', sub: 'Index persistent sur [auteur, parution]', html: `
<p>Modes d'interrogation : <b>égalité</b>, <b>inégalité</b>, <b>rang</b> (double inégalité), <b>tri</b>.</p>
${prop('Règle 1 · les n premiers champs, dans l\'ordre', '<p>On peut n\'interroger que les n premiers champs, mais <b>dans l\'ordre</b> de l\'index.</p>')}
${prop('Règle 2 · l\'inégalité en dernier', '<p>Seul le <b>dernier champ interrogé</b> peut faire l\'objet d\'une <b>inégalité</b>.</p>')}
<table class="t"><thead><tr><th>Filtres (et tri)</th><th>Index utilisé ?</th></tr></thead><tbody>
<tr><td><code>auteur == "Alain Damasio"</code></td><td class="yes">✔</td></tr>
<tr><td><code>auteur &gt; "E"</code></td><td class="yes">✔</td></tr>
<tr><td><code>auteur &gt; "A"</code> et <code>auteur &lt; "F"</code> (rang)</td><td class="yes">✔</td></tr>
<tr><td><code>auteur == "Alain Damasio"</code> et <code>parution == 2019</code></td><td class="yes">✔</td></tr>
<tr><td><code>auteur == "Alain Damasio"</code> et <code>parution &gt; 2000</code></td><td class="yes">✔</td></tr>
<tr><td><code>auteur == "Alain Damasio"</code> puis <code>SORT parution</code></td><td class="yes">✔</td></tr>
<tr><td><code>parution &lt; 1990</code> seul</td><td class="no">❌ (le premier champ n'est pas interrogé)</td></tr>
<tr><td><code>SORT parution</code> seul</td><td class="no">❌</td></tr>
<tr><td><code>auteur &gt; "E"</code> et <code>parution &lt; 1990</code></td><td class="no">❌ (inégalité sur un champ qui n'est pas le dernier)</td></tr>
<tr><td><code>auteur &gt; "E"</code> et <code>parution == 1847</code></td><td class="no">❌</td></tr></tbody></table>
${ex('index pour une requête à jointures', '<p>Pour <code>FOR e IN editions FOR a IN artists FILTER a.nom IN e.artistes FOR f IN Festivals FILTER f.nom == e.nom_festival SORT e.annee RETURN …</code> : un index sur <code>artists.nom</code> (jointure 1), sur <code>Festivals.nom</code> (jointure 2) et sur <code>editions.annee</code> (tri).</p>')}
${def('Index geo', '<p>Pour indexer des paires de coordonnées géographiques ; il accélère <code>GEO_CONTAINS()</code>, <code>GEO_DISTANCE()</code>, <code>GEO_INTERSECTS()</code>… Toujours <b>2 champs</b> (latitude, longitude) ou un objet GeoJSON : <code>{ type: "geo", fields: [ "lat", "lon" ], unique: false, sparse: true }</code>.</p>')}
${warn('un seul index par parcours de collection', '<p>Dans une requête AQL, <b>un seul index</b> est utilisé à chaque parcours de collection : avec un index geo sur <code>[lat, lon]</code> et un index persistent sur <code>type</code>, la requête qui filtre <code>d.type == "commune"</code> et <code>GEO_CONTAINS(…)</code> n\'en utilisera qu\'un des deux.</p>')}
` },
      { id: 'io', t: 'Les entrées-sorties', sub: 'Lire un document coûte cher', html: `
<p>Lire un document (accès au stockage) est coûteux : entrées-sorties → <b>latence</b>. Pour y remédier :</p>
<ul><li><b>accélérer les i/o</b> : stockage SSD NVMe (latence 10 à 100 fois plus faible que les disques à plateaux) ;</li>
<li><b>augmenter la mémoire</b> : cache du système de fichiers ;</li>
<li><b>éviter d'ouvrir les documents</b> : créer des index.</li></ul>
${warn('les index ne stockent que les _key', '<p>Un <code>FILTER</code> sur un champ non indexé oblige à <b>ouvrir le document</b>. Mais plus l\'index utilisé est <b>sélectif</b>, moins on a de documents à lire. Vaut-il mieux l\'index geo ou l\'index sur <code>type</code> ? <b>Ça dépend des données</b> : l\'optimiseur AQL choisit seul en fonction de la sélectivité.</p>')}
` },
    ],
    keep: [
      'FOR : O(n) ; deux FOR imbriqués : O(n²). Leviers : moins de jointures, index, moins d\'i/o.',
      'Redondance : avantageuse si lectures > écritures ; sinon, jointure à la lecture.',
      'Index persistent : arbre de hash, accès en O(log n), trié ; unique, sparse ; sélectivité forte ou faible.',
      'Index multi-champs : premiers champs dans l\'ordre ; seule la dernière condition peut être une inégalité.',
      'Un seul index par parcours de collection ; les index ne stockent que les _key.',
    ],
  },
];
