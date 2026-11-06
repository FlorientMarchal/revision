// Séries de requêtes ArangoDB : TP 3 (modèle documents), TP 4 (graphes) et annexe « De SQL à AQL ».
// Requêtes recopiées des corrigés et de l'annexe de l'enseignant ; seules l'indentation et, dans un corrigé,
// une coquille de fin de requête (signalée dans la note) ont été retouchées.
import artistes from './arango-artistes.json';
import editions from './arango-editions.json';
import festivals from './arango-festivals.json';

const X = (id, q, sol, more = {}) => ({ id, q, sol, ...more });
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const pre = c => `<pre class="rq-code">${esc(c)}</pre>`;
const alt = (t, c) => `<p><b>${t}</b></p>${pre(c)}`;
const sql = (t, c) => `<p>${t}</p>${pre(c)}`;
const uniq = a => [...new Set(a)];
const byAlpha = (a, b) => String(a).localeCompare(String(b), 'fr');
const pays = Object.fromEntries(artistes.map(a => [a.nom, a.pays]));

export const arangoSets = [
  /* ===================================================================== */
  {
    id: 'tp3', title: 'TP 3 · ArangoDB', lang: 'AQL', src: 'TP 3, corrigé', kind: 'corrige',
    intro: '<p>Les festivals des TP 1 et 2, cette fois dans <b>ArangoDB</b>, en séparant les concepts dans <b>plusieurs collections</b>. Interface web « aardvark » sur <code>http://localhost:8529</code> (installation locale) : onglet « Queries » pour exécuter une requête (bouton « Execute » ou Ctrl+Entrée), bouton « upload documents » d\'une collection pour importer un fichier JSON.</p>',
    schema: `<p class="math-note">Modélisation du corrigé : 3 collections. Contrairement au SQL, <b>pas de collection d'association</b> pour la relation n-n entre artistes et éditions : la liste des noms d'artistes est stockée directement dans chaque édition.</p><div class="grid2">
<div class="box def"><div class="box-h">collection artistes (${artistes.length})</div><pre class="rq-code">${esc(`{
  "nom": "Black Eyed Peas",
  "pays": "USA",
  "style": null
}`)}</pre></div>
<div class="box def"><div class="box-h">collection festivals (${festivals.length})</div><pre class="rq-code">${esc(`{
  "nom": "Francofolies",
  "lieu": "La Rochelle",
  "capacite": "12000"
}`)}</pre></div>
<div class="box def"><div class="box-h">collection editions (${editions.length})</div><pre class="rq-code">${esc(`{
  "nom_festival": "Les Déferlantes",
  "annee": 2023,
  "artistes": [
    "Pomme",
    "Alt-J",
    …
  ]
}`)}</pre></div></div>`,
    dataset: { name: 'fichiers JSON du TP : editions, artistes, festivals', docs: { editions, artistes, festivals } },
    exos: [
      X('tp3-m', '<p><b>Ex. 1</b> · Proposer un modèle pertinent pour stocker ces données dans ArangoDB, en séparant les concepts en plusieurs collections. Faut-il créer autant de collections que de tables SQL ? <i>(réponse en quelques lignes)</i></p>',
        `3 collections "artistes", "festivals" et "éditions".
Contrairement à ce qu'on ferait en SQL, on ne crée pas de
collection d'association pour la relation n-n entre "artistes"
et "éditions", mais on stocke directement la liste des artistes
dans chaque document "édition".`, { lang: 'texte', note: 'Donc non : 3 collections pour 4 tables SQL (la table <code>edition_artiste</code> du TP 1 disparaît). Le corrigé ajoute « On y reviendra dans la partie graphe ».' }),
      X('tp3-1', '<p>Toutes les éditions de festival (nom du festival et année de l\'édition).</p>', `FOR e IN editions
  RETURN {
    nom: e.nom_festival,
    annee: e.annee
  }`, { expected: () => editions.map(e => ({ nom: e.nom_festival, annee: e.annee })) }),
      X('tp3-2', '<p>Tous les festivals où Placebo a joué.</p>', `FOR e IN editions
  FILTER "Placebo" IN e.artistes
  RETURN DISTINCT e.nom_festival`, { expected: () => uniq(editions.filter(e => e.artistes.includes('Placebo')).map(e => e.nom_festival)), note: '<code>"Placebo" IN e.artistes</code> teste si la valeur est dans la liste ; <code>RETURN DISTINCT</code> retire les doublons (un festival où Placebo est venu deux années).' }),
      X('tp3-3', '<p>Tous les artistes.</p>', `FOR a IN artistes
  RETURN a.nom`, { expected: () => artistes.map(a => a.nom), note: '<code>RETURN a.nom</code> renvoie une simple liste de valeurs, <code>RETURN a</code> renverrait les documents entiers.' }),
      X('tp3-4', '<p>Tous les artistes français.</p>', `FOR a IN artistes
  FILTER a.pays == "France"
  RETURN a.nom`, { expected: () => artistes.filter(a => a.pays === 'France').map(a => a.nom), note: 'Comparaison avec <code>==</code> (et non <code>=</code> comme en SQL).' }),
      X('tp3-5', '<p>Tous les artistes ayant joué aux Eurockéennes en 2018, avec leur pays.</p>', `FOR e IN editions
  FILTER e.nom_festival == "Les Eurockéennes"
  FILTER e.annee == 2018
  FOR a IN e.artistes
    FOR a2 in artistes
      FILTER a2.nom == a
      RETURN {
        nom: a,
        pays: a2.pays
      }`, {
        expected: () => editions.filter(e => e.nom_festival === 'Les Eurockéennes' && e.annee === 2018).flatMap(e => e.artistes.map(a => ({ nom: a, pays: pays[a] }))),
        note: 'Une <b>jointure</b> : pour chaque nom de la liste <code>e.artistes</code>, on cherche le document de <code>artistes</code> qui porte ce nom.' + alt('Version simplifiée du corrigé (pas de boucle sur la liste e.artistes, jointure avec « FILTER IN ») :', `FOR e IN editions
  FILTER e.nom_festival == "Les Eurockéennes"
  FILTER e.annee == 2018
  FOR a IN artistes
    FILTER a.nom IN e.artistes
    RETURN {
      nom: a.nom,
      pays: a.pays
    }`) }),
      X('tp3-6', '<p>Tous les artistes différents ayant joué à Garorock, quelle que soit l\'année.</p>', `FOR e IN editions
  FILTER e.nom_festival == "Garorock"
  FOR a IN e.artistes
    COLLECT art = a
    SORT art
    RETURN art`, {
        expected: () => uniq(editions.filter(e => e.nom_festival === 'Garorock').flatMap(e => e.artistes)).sort(byAlpha),
        note: '<code>COLLECT art = a</code> regroupe par nom : chaque artiste n\'apparaît qu\'une fois.' + alt('Autres possibilités du corrigé : RETURN DISTINCT', `FOR e IN editions
  FILTER e.nom_festival == "Garorock"
  FOR nom_artiste IN e.artistes
    RETURN DISTINCT nom_artiste`) + pre(`FOR e IN editions
  FILTER e.nom_festival == "Garorock"
  FOR a IN artistes
    FILTER a.nom IN e.artistes
    RETURN DISTINCT a.nom`) }),
    ],
  },

  /* ===================================================================== */
  {
    id: 'tp4', title: 'TP 4 · graphes', lang: 'AQL', src: 'TP 4, corrigé', kind: 'corrige',
    intro: '<p>Bases de données <b>orientées graphes</b> avec ArangoDB, sur l\'instance en ligne du cours (adresse et identifiants dans le sujet, non reproduits ici). Partie 1 : base <code>miashs_graphes</code>, graphe <code>worldCountry</code> (Monde → continents → pays → capitales). Partie 2 : base <code>miashs_imdb</code>, graphe <code>imdb</code>.</p><p class="math-note">Pas de résultat attendu : les données du TP 4 ne sont disponibles que sur le serveur.</p>',
    schema: `<div class="grid2">
<div class="box def"><div class="box-h">graphe worldCountry</div><p>Sommets <code>worldVertices</code> (<code>name</code>, <code>type</code> : root, continent, country, capital), par ex. <code>worldVertices/world</code>, <code>worldVertices/continent-asia</code>. Arêtes <code>worldEdges</code> du plus petit vers le plus grand : capitale → pays → continent → world. C'est un <b>arbre</b> : les pays sont tous à distance 2 de « world ».</p></div>
<div class="box def"><div class="box-h">graphe imdb</div><p>Sommets <code>imdb_vertices</code> (<code>type</code> : Person, Movie, Genre… ; <code>label</code>, <code>name</code> pour les personnes, <code>genre</code> pour les films). Arêtes <code>imdb_edges</code> avec un <code>$label</code> : <code>ACTS_IN</code> et <code>DIRECTED</code> vont de la personne vers le film, et le genre pointe aussi vers le film : <b>Person → Movie ← Genre</b>.</p></div></div>`,
    exos: [
      X('tp4-v1', '<p><b>Partie 1 · Ex. 1</b> · Dans le visualiseur (menu « Graphs », graphe <code>worldCountry</code>) : si vous rafraîchissez la page, que se passe-t-il ? Comment visualiser le graphe entier ?</p>',
        `Le graph est recalculé en prenant un noeud de départ au hasard.
Pour le voir en entier : dans Settings, définir le noeud de départ
worldVertices/world`, { lang: 'texte' }),
      X('tp4-1', '<p><b>Partie 1 · Ex. 2</b> · Tous les pays, avec leur distance au nœud « World ».</p>', `FOR vertex, edge, path
  IN 1..4 INBOUND "worldVertices/world" GRAPH worldCountry
  FILTER vertex.type == "country"
  RETURN {
    nom: vertex.name,
    type: vertex.type,
    distance: LENGTH(path.edges)
  }`, { note: 'On part de <code>worldVertices/world</code> en suivant les arêtes <b>dirigées vers</b> ce nœud (<code>INBOUND</code>), à une profondeur de 1 à 4, et on ne garde que les nœuds de type « country ». <code>path.edges</code> est la liste des arêtes parcourues : leur nombre est la distance au nœud de référence.' +
        alt('Le graphe est un arbre et les pays sont tous à distance 2, d\'où :', `FOR vertex, edge, path IN 2..2 inbound "worldVertices/world" GRAPH worldCountry
  RETURN {
    nom: vertex.name,
    type: vertex.type,
    distance: LENGTH(path.edges)
  }`) + alt('Sans traversée (requête classique sur la collection de sommets), mais sans la distance :', `FOR vertex in worldVertices
  FILTER vertex.type == "country"
  RETURN {
    nom: vertex.name,
    type: vertex.type
  }`) }),
      X('tp4-2', '<p>Toutes les capitales d\'Asie.</p>', `FOR vertex, edge, path IN 1..4 inbound "worldVertices/world" GRAPH worldCountry
  FILTER vertex.type == "capital"
  FILTER path.vertices[1].name == "Asia"
  RETURN {
    nom: vertex.name,
    type: vertex.type,
    distance: LENGTH(path.edges)
  }`, { note: '<code>path.vertices</code> est la liste des nœuds parcourus, dans l\'ordre : <code>vertices[0]</code> est toujours « world », <code>vertices[1]</code> le continent, sur lequel on filtre.' +
        alt('Plus simple : partir directement du nœud du continent (identifiant trouvé en explorant les collections) :', `FOR vertex, edge, path IN 1..2 inbound "worldVertices/continent-asia" GRAPH worldCountry
  FILTER vertex.type == "capital"
  RETURN {
    nom: vertex.name,
    type: vertex.type,
    distance: LENGTH(path.edges)
  }`) }),
      X('tp4-3', '<p><b>Partie 2</b> · Tous les films liés à Sigourney Weaver (quelle que soit la relation : actrice ou autre).</p>', `FOR v IN imdb_vertices
  FILTER v.name == "Sigourney Weaver"
  FOR vertex, edge, path IN 1..1 OUTBOUND v GRAPH imdb
    FILTER vertex.type == "Movie"
    SORT vertex.label
    RETURN {
      film: vertex.label,
    }`, { note: 'On cherche d\'abord le <b>nœud de départ</b> avec une requête classique, puis on traverse depuis ce nœud en suivant les arêtes <b>sortantes</b> (<code>ACTS_IN</code> ou <code>DIRECTED</code>) : une profondeur de 1 suffit pour atteindre les films.' +
        alt('Alternative : on ne déclare que la variable du nœud atteint (ni edge ni path ne servent)', `FOR v IN imdb_vertices
  FILTER v.name == "Sigourney Weaver"
  FOR film IN 1..1 OUTBOUND v GRAPH imdb
    FILTER film.type == "Movie"
    SORT film.label
    RETURN { film: film.label }`) }),
      X('tp4-4', '<p>Tous les drames réalisés par Robert Redford.</p>', `FOR v IN imdb_vertices
  FILTER v.name == "Robert Redford"
  FOR genre, edge, path IN 2..2 ANY v GRAPH imdb
    FILTER genre.type == "Genre" AND genre.label == "Drama"
    FILTER path.edges[0].$label == "DIRECTED"
    RETURN {
      film: path.vertices[1].label,
      relation: path.edges[0].$label
    }`, { note: 'Chemins de profondeur 2 de « Robert Redford » au nœud « Drama » : <b>Person → Movie ← Genre</b>. Les deux arêtes pointent vers le film, d\'où <code>ANY</code> plutôt que <code>INBOUND</code> ou <code>OUTBOUND</code>. On garde les chemins dont la première arête est <code>DIRECTED</code> ; le film est le 1<sup>er</sup> nœud atteint, <code>path.vertices[1]</code>.' +
        alt('Alternative : lire le genre directement dans le document film', `FOR v IN imdb_vertices
  FILTER v.name == "Robert Redford"
  FOR film, edge IN 1..1 OUTBOUND v GRAPH imdb
    FILTER edge.$label == "DIRECTED"
    FILTER film.genre == "Drama"
    RETURN {
      film: film.label,
      relation: edge.$label
    }`) + '<p>C\'est de la <b>dénormalisation</b> : plus simple à lire, mais une modification devrait changer la donnée à plusieurs endroits (ici, le genre d\'un film n\'est pas censé changer).</p>' }),
      X('tp4-5', '<p>Toutes les personnes ayant joué avec Monica Bellucci, sans doublons.</p>', `FOR v IN imdb_vertices
  FILTER v.name == "Monica Bellucci"
  FOR personne, edge, path IN 2..2 ANY v GRAPH imdb
    FILTER personne.type == "Person"
    FILTER path.edges[*].$label ALL == "ACTS_IN"
    COLLECT nom = personne.label
    RETURN nom`, { note: 'Les « Person » à distance 2 (Person → Movie ← Person). <code>path.edges[*].$label ALL == "ACTS_IN"</code> vérifie que <b>toutes</b> les arêtes du chemin sont <code>ACTS_IN</code>, pour éliminer les réalisateurs/trices. <code>COLLECT</code> dédoublonne les personnes ayant joué avec elle dans deux films (ex. Edouard Baer). Le texte du corrigé évoque aussi <code>OPTIONS { uniqueVertices: "global" }</code> pour dédoublonner, option qui impose <code>order: "bfs"</code> (parcours en largeur).' }),
      X('tp4-6', '<p>Toutes les personnes ayant joué dans au moins deux films différents avec Tilda Swinton, avec la liste des films.</p>', `FOR v IN imdb_vertices
  FILTER v.name == "Tilda Swinton"
  FOR vertex, edge, path IN 2..2 ANY v GRAPH imdb
    FILTER vertex.type == "Person"
    FILTER path.edges[0].$label == "ACTS_IN"
    FILTER path.edges[1].$label == "ACTS_IN"
    COLLECT personne = vertex.label INTO films_avec_ts
    FILTER LENGTH(films_avec_ts) >= 2
    RETURN {
      personne,
      films: films_avec_ts[*].path.vertices[1].label
    }`, { note: 'Cette fois on <b>ne dédoublonne pas</b> la traversée, pour compter les chemins (donc les films) menant à la même personne. <code>COLLECT … INTO</code> regroupe par personne, puis le <code>FILTER</code> garde les groupes d\'au moins 2.' +
        alt('Alternative qui dédoublonne avec UNIQUE les personnes ayant plusieurs rôles dans un même film :', `FOR v IN imdb_vertices
  FILTER v.name == "Tilda Swinton"
  FOR personne, edge, path IN 2..2 ANY v GRAPH imdb
    FILTER personne.type == "Person"
    FILTER path.edges[*].$label ALL == "ACTS_IN"
    COLLECT nom = personne.label INTO films = path.vertices[1].label
    LET films_distincts = UNIQUE(films)
    FILTER LENGTH(films_distincts) >= 2
    RETURN { personne: nom, films: films_distincts }`) + '<p class="math-note">Dans le corrigé, cette dernière requête se termine par un « : » en trop après l\'accolade, retiré ici.</p>' }),
      X('tp4-7', '<p>Toutes les personnes ayant joué avec quelqu\'un qui a déjà joué avec Vincent Cassel.</p>', `FOR v IN imdb_vertices
  FILTER v.name == "Vincent Cassel"
  FOR vertex, edge, path IN 4..4 ANY v GRAPH imdb
    OPTIONS { uniqueVertices: "path" }
    FILTER vertex.type == "Person"
    FILTER path.edges[*].$label ALL == "ACTS_IN"
    COLLECT personne = vertex.label INTO par_personne
    SORT personne
    RETURN {
      nom: personne,
      connaissance_commune: par_personne[0].path.vertices[2].label,
      chemin: CONCAT_SEPARATOR(" -- ", par_personne[0].path.vertices[*].label)
    }`, { note: 'Profondeur 4 : Person → Movie ← Person → Movie ← Person. <code>{ uniqueVertices: "path" }</code> interdit de repasser par un même nœud sur un chemin, ce qui exclut Cassel lui-même. Une personne reste atteignable par plusieurs chemins : c\'est <code>COLLECT</code> qui dédoublonne (<code>"global"</code> supprimerait trop de nœuds aux profondeurs &lt; 4). <code>CONCAT_SEPARATOR</code> (facultatif) affiche le chemin.' }),
    ],
  },

  /* ===================================================================== */
  {
    id: 'annexe', title: 'Annexe · SQL → AQL', lang: 'SQL → AQL', src: 'annexe du cours', kind: 'annexe',
    intro: '<p>L\'annexe « De SQL à AQL : tableau de correspondance » : pour chaque requête SQL, écris son équivalent AQL. Collections fictives <code>livres</code> (titre, annee, genre, pages, auteur_id = <code>_key</code> d\'un auteur…), <code>auteurs</code> (nom, prenom, pays), <code>emprunts</code> (livre = <code>_key</code> d\'un livre, date_emprunt) et <code>archives</code>.</p><p><b>AQL se lit comme du SQL à l\'envers</b> : on part de la collection (<code>FOR</code>), on filtre et on trie, puis on dit ce qu\'on renvoie (<code>RETURN</code>) à la fin.</p>',
    exos: [
      X('ax-1', sql('<b>Insérer</b> un document.', `INSERT INTO livres (titre, annee, genre)
VALUES ('Les Choses', 1965, 'roman');`), `INSERT { titre: "Les Choses", annee: 1965, genre: "roman" } INTO livres`),
      X('ax-2', '<p><b>Insérer plusieurs documents</b> : « W ou le souvenir d\'enfance » (1975) et « La Vie mode d\'emploi » (1978).</p>', `FOR l IN [
  { titre: "W ou le souvenir d'enfance", annee: 1975 },
  { titre: "La Vie mode d'emploi", annee: 1978 }
]
  INSERT l INTO livres`),
      X('ax-3', sql('<b>Copier</b> depuis une autre collection (<code>INSERT … SELECT</code>).', `INSERT INTO archives (titre, annee, genre)
SELECT titre, annee, genre FROM livres WHERE annee < 1900;`), `FOR l IN livres
  FILTER l.annee < 1900
  INSERT l INTO archives`, { note: 'Le document copié garde sa <code>_key</code>. Pour laisser ArangoDB en générer une nouvelle : <code>INSERT UNSET(l, "_key") INTO archives</code>.' }),
      X('ax-4', sql('Générer <b>1000 livres de test</b>, sans table source.', `-- MariaDB, moteur Sequence
INSERT INTO livres (titre, genre)
SELECT CONCAT('Livre test ', seq), IF(seq % 2 = 0, 'roman', 'essai')
FROM seq_1_to_1000;`), `FOR i IN 1..1000
  INSERT {
    titre: CONCAT("Livre test ", i),
    genre: (i % 2 == 0 ? "roman" : "essai")
  } INTO livres`),
      X('ax-5', sql('<b>Modifier</b> un document.', `UPDATE livres SET genre = 'roman' WHERE id = 12345;`), `UPDATE "12345" WITH { genre: "roman" } IN livres`, { note: '<code>UPDATE</code> <b>fusionne</b> : les attributs non cités sont conservés. La <code>_key</code> est une chaîne : <code>"12345"</code>, pas <code>12345</code>.' }),
      X('ax-6', sql('Modifier <b>plusieurs</b> documents.', `UPDATE livres SET domaine_public = TRUE WHERE annee < 1900;`), `FOR l IN livres
  FILTER l.annee < 1900
  UPDATE l WITH { domaine_public: true } IN livres`),
      X('ax-7', sql('<b>Ajouter un attribut</b> avec une valeur par défaut.', `ALTER TABLE livres ADD COLUMN nb_emprunts INT NOT NULL DEFAULT 0;`), `FOR l IN livres
  UPDATE l WITH { nb_emprunts: 0 } IN livres`, { note: 'Sans schéma, ajouter une « colonne » revient à mettre à jour les documents concernés. Les documents insérés ensuite n\'auront pas l\'attribut : il n\'y a pas de <code>DEFAULT</code> en AQL.' }),
      X('ax-8', sql('Ajouter un attribut avec une <b>valeur calculée</b>.', `UPDATE livres
SET nb_emprunts = (
  SELECT COUNT(*) FROM emprunts WHERE emprunts.livre = livres.id
);`), `FOR l IN livres
  LET nb = LENGTH(
    FOR e IN emprunts
      FILTER e.livre == l._key
      RETURN 1
  )
  UPDATE l WITH { nb_emprunts: nb } IN livres`),
      X('ax-9', sql('Ajouter des attributs sur <b>une partie des documents</b> seulement.', `ALTER TABLE livres
  ADD COLUMN classique BOOLEAN DEFAULT NULL,
  ADD COLUMN classique_depuis DATETIME DEFAULT NULL;
UPDATE livres
SET classique = TRUE, classique_depuis = NOW()
WHERE classique IS NULL
  AND (SELECT COUNT(*) FROM emprunts WHERE emprunts.livre = livres.id) > 50;`), `LET maintenant = DATE_NOW()
FOR l IN livres
  FILTER l.classique == null
  LET nb = LENGTH(FOR e IN emprunts FILTER e.livre == l._key RETURN 1)
  FILTER nb > 50
  UPDATE l WITH { classique: true, classique_depuis: maintenant } IN livres`, { note: 'En SQL, la colonne existe pour toutes les lignes et vaut <code>NULL</code> ailleurs ; en AQL, les autres documents restent intacts.' }),
      X('ax-10', sql('<b>Supprimer un attribut</b>.', `ALTER TABLE livres DROP COLUMN nb_emprunts;`), `FOR l IN livres
  UPDATE l WITH { nb_emprunts: null } IN livres
  OPTIONS { keepNull: false }`, { note: 'On met l\'attribut à <code>null</code> avec l\'option <code>keepNull: false</code>, qui retire l\'attribut au lieu de stocker <code>null</code>. Avec un <code>FILTER</code>, on ne le retire que de certains documents (SQL ne peut alors que remettre la valeur à <code>NULL</code>).' }),
      X('ax-11', sql('<b>Remplacer</b> un document entier.', `REPLACE INTO livres (id, titre, annee) VALUES (12345, 'Les Choses', 1965);`), `REPLACE "12345" WITH { titre: "Les Choses", annee: 1965 } IN livres`, { note: '<code>REPLACE</code> écrase le document entier, sauf <code>_key</code> et <code>_id</code> (≠ <code>UPDATE</code>, qui fusionne).' }),
      X('ax-12', sql('Remplacer <b>depuis une autre collection</b>.', `REPLACE INTO livres (id, titre, genre)
SELECT id, titre, genre FROM archives;`), `FOR a IN archives
  REPLACE a WITH { titre: a.titre, genre: a.genre } IN livres`, { note: '<code>REPLACE</code> cherche le document de <code>livres</code> qui a la même <code>_key</code> que <code>a</code> et <b>échoue s\'il n\'existe pas</b>, alors que le <code>REPLACE INTO</code> de MariaDB insère la ligne manquante. Pour ce comportement : <code>UPSERT</code>.' }),
      X('ax-13', sql('<b>Insérer ou mettre à jour</b>.', `INSERT INTO livres (isbn, titre, tirages) VALUES ('978-2-07-036784-6', 'Les Choses', 1)
ON DUPLICATE KEY UPDATE tirages = tirages + 1;`), `UPSERT { isbn: "978-2-07-036784-6" }
INSERT { isbn: "978-2-07-036784-6", titre: "Les Choses", tirages: 1 }
UPDATE { tirages: OLD.tirages + 1 }
IN livres`, { note: '<code>OLD</code> désigne le document trouvé. Sans index sur l\'attribut cherché (<code>isbn</code>), <code>UPSERT</code> parcourt toute la collection.' }),
      X('ax-14', sql('<b>Supprimer</b> des documents.', `DELETE FROM livres WHERE annee < 1900;`), `FOR l IN livres
  FILTER l.annee < 1900
  REMOVE l IN livres`, { note: 'Un seul document par sa clé : <code>REMOVE "12345" IN livres</code>. Toute écriture peut renvoyer les documents touchés avec <code>RETURN NEW</code> (après) ou <code>RETURN OLD</code> (avant). Dans <code>INSERT</code>, <code>UPDATE</code>, <code>REPLACE</code> et <code>REMOVE</code>, <code>IN</code> et <code>INTO</code> sont interchangeables.' }),
      X('ax-15', sql('<b>Tout récupérer</b>.', `SELECT * FROM livres;`), `FOR l IN livres
  RETURN l`),
      X('ax-16', sql('<b>Choisir les attributs</b> (projection).', `SELECT titre, annee AS parution FROM livres;`), `FOR l IN livres
  RETURN { titre: l.titre, parution: l.annee }`, { note: '<code>RETURN l.titre</code> renvoie une simple liste de valeurs ; <code>KEEP(l, "titre", "annee")</code> garde des attributs sans les renommer.' }),
      X('ax-17', sql('Valeur <b>calculée</b> et filtre.', `SELECT CONCAT(prenom, ' ', nom) AS auteur, pays
FROM auteurs
WHERE pays = 'France';`), `FOR a IN auteurs
  FILTER a.pays == "France"
  RETURN { auteur: CONCAT(a.prenom, " ", a.nom), pays: a.pays }`),
      X('ax-18', sql('<b>Filtrer</b> sur deux conditions.', `SELECT * FROM livres
WHERE annee >= 1950 AND genre = 'roman';`), `FOR l IN livres
  FILTER l.annee >= 1950 AND l.genre == "roman"
  RETURN l`, { note: 'Plusieurs <code>FILTER</code> à la suite se combinent comme un <code>AND</code>.' }),
      X('ax-19', sql('<b>Trier et paginer</b>.', `SELECT * FROM livres
ORDER BY annee DESC, titre
LIMIT 10 OFFSET 20;`), `FOR l IN livres
  SORT l.annee DESC, l.titre
  LIMIT 20, 10
  RETURN l`, { note: 'Attention à l\'ordre des arguments : <code>LIMIT décalage, nombre</code>.' }),
      X('ax-20', sql('<b>Dédoublonner</b>.', `SELECT DISTINCT genre FROM livres;`), `FOR l IN livres
  RETURN DISTINCT l.genre`),
      X('ax-21', sql('<b>Jointure interne</b>.', `SELECT l.titre, a.nom
FROM livres l
JOIN auteurs a ON l.auteur_id = a.id;`), `FOR l IN livres
  FOR a IN auteurs
    FILTER l.auteur_id == a._key
    RETURN { titre: l.titre, auteur: a.nom }`, { note: alt('Quand on joint sur la clé, DOCUMENT() lit directement le document voulu :', `FOR l IN livres
  LET a = DOCUMENT("auteurs", l.auteur_id)
  RETURN { titre: l.titre, auteur: a.nom }`) + '<p>L\'équivalent littéral de <code>SELECT *</code>, <code>RETURN MERGE(a, l)</code>, écrase les attributs de même nom (<code>_key</code>, <code>_id</code>, <code>nom</code>…) par ceux du dernier argument ; on préfère <code>RETURN { livre: l, auteur: a }</code>.</p>' }),
      X('ax-22', sql('<b>Jointure externe</b> : chaque auteur, même sans livre.', `SELECT a.nom, l.titre
FROM auteurs a
LEFT JOIN livres l ON l.auteur_id = a.id;`), `FOR a IN auteurs
  LET titres = (
    FOR l IN livres
      FILTER l.auteur_id == a._key
      RETURN l.titre
  )
  RETURN { auteur: a.nom, livres: titres }`, { note: 'En AQL, on préfère une <b>sous-requête</b> qui rattache à chaque auteur la liste de ses livres, vide s\'il n\'en a aucun.' + alt('Pour la même table plate qu\'en SQL, avec null pour les auteurs sans livre :', `FOR a IN auteurs
  LET titres = (FOR l IN livres FILTER l.auteur_id == a._key RETURN l.titre)
  FOR t IN (LENGTH(titres) > 0 ? titres : [null])
    RETURN { auteur: a.nom, titre: t }`) }),
      X('ax-23', sql('<b>Regrouper et compter</b>.', `SELECT genre, COUNT(*) AS n
FROM livres
GROUP BY genre;`), `FOR l IN livres
  COLLECT genre = l.genre WITH COUNT INTO n
  RETURN { genre, n }`),
      X('ax-24', sql('<b>Autres agrégats</b>.', `SELECT genre, AVG(pages) AS moy_pages, MIN(annee) AS premier
FROM livres
GROUP BY genre;`), `FOR l IN livres
  COLLECT genre = l.genre
  AGGREGATE moy_pages = AVG(l.pages), premier = MIN(l.annee)
  RETURN { genre, moy_pages, premier }`, { note: 'Dans <code>AGGREGATE</code> : <code>COUNT(x)</code> ou <code>LENGTH(x)</code>, <code>SUM(x)</code>, <code>AVG(x)</code> ou <code>AVERAGE(x)</code>, <code>MIN(x)</code>, <code>MAX(x)</code>, et <code>UNIQUE(x)</code> ou <code>PUSH(x)</code> (qui renvoient un tableau) à la place du <code>GROUP_CONCAT</code> de MariaDB.' }),
      X('ax-25', sql('Récupérer les <b>documents de chaque groupe</b>.', `SELECT genre, GROUP_CONCAT(id) AS ids
FROM livres
GROUP BY genre;`), `FOR l IN livres
  COLLECT genre = l.genre INTO groupe
  RETURN { genre, ids: groupe[*].l._key }`, { note: 'Sans projection après <code>INTO</code>, chaque élément du groupe contient les variables de la boucle ; l\'opérateur <code>[*]</code> en extrait un attribut. <code>GROUP_CONCAT</code> produit une chaîne, AQL un vrai tableau.' + alt('Avec projection (les titres de chaque auteur) :', `FOR l IN livres
  COLLECT auteur = l.auteur_id INTO groupe = l.titre
  RETURN { auteur, titres: groupe }`) }),
      X('ax-26', sql('<b>Filtrer après regroupement</b> (HAVING).', `SELECT genre, COUNT(*) AS n
FROM livres
GROUP BY genre
HAVING COUNT(*) > 5;`), `FOR l IN livres
  COLLECT genre = l.genre WITH COUNT INTO n
  FILTER n > 5
  RETURN { genre, n }`, { note: 'Le <code>HAVING</code> devient un <code>FILTER</code> placé <b>après</b> le <code>COLLECT</code>.' }),
      X('ax-27', sql('Regrouper sur des <b>valeurs calculées</b> (année et mois).', `SELECT YEAR(date_emprunt) AS annee, MONTH(date_emprunt) AS mois, COUNT(*) AS n
FROM emprunts
GROUP BY annee, mois
HAVING n > 20;`), `FOR e IN emprunts
  COLLECT annee = DATE_YEAR(e.date_emprunt),
          mois = DATE_MONTH(e.date_emprunt)
  WITH COUNT INTO n
  FILTER n > 20
  RETURN { annee, mois, n }`),
      X('ax-28', sql('<b>Compter</b> tout.', `SELECT COUNT(*) FROM livres WHERE annee < 1900;`), `FOR l IN livres
  FILTER l.annee < 1900
  COLLECT WITH COUNT INTO n
  RETURN n`, { note: 'Sans filtre, <code>RETURN LENGTH(livres)</code> suffit.' }),
      X('ax-29', sql('Agrégats sur <b>toute la collection</b>, sans regroupement.', `SELECT MIN(annee) AS plus_ancien, MAX(annee) AS plus_recent FROM livres;`), `FOR l IN livres
  COLLECT AGGREGATE plus_ancien = MIN(l.annee), plus_recent = MAX(l.annee)
  RETURN { plus_ancien, plus_recent }`),
      X('ax-30', sql('<b>Sous-requête scalaire</b>.', `SELECT titre FROM livres
WHERE pages > (SELECT AVG(pages) FROM livres);`), `LET moyenne = AVERAGE(livres[*].pages)
FOR l IN livres
  FILTER l.pages > moyenne
  RETURN l.titre`, { note: 'Toute sous-requête entre parenthèses renvoie un <b>tableau</b> : <code>FIRST(...)</code> en extrait la première valeur.' }),
    ],
  },
];
