// Séries de requêtes à taper puis comparer avec la solution (onglet « Requêtes »).
// kind : 'corrige' = corrigé de l'enseignant, 'cours' = requête des diapositives, 'propose' = solution rédigée pour le site.
// Les requêtes « corrige » et « cours » sont recopiées des supports ; seuls l'indentation et les guillemets typographiques
// (‘…’, “…”) remplacés par des guillemets droits ont été retouchés.
import editions from './editions.json';

const E = editions.docs;
const X = (id, q, sol, more = {}) => ({ id, q, sol, ...more });
const uniq = a => [...new Set(a)];
const byAlpha = (a, b) => String(a).localeCompare(String(b), 'fr');
// Imitation d'une vue CouchDB : lignes { key, value } triées selon la collation (nombres < chaînes < tableaux).
const rank = v => v === null ? 0 : typeof v === 'boolean' ? 1 : typeof v === 'number' ? 2 : typeof v === 'string' ? 3 : Array.isArray(v) ? 4 : 5;
function collate(a, b) {
  const ra = rank(a), rb = rank(b);
  if (ra !== rb) return ra - rb;
  if (ra === 2) return a - b;
  if (ra === 3) return a.localeCompare(b, 'fr');
  if (ra === 4) { for (let i = 0; i < Math.min(a.length, b.length); i++) { const c = collate(a[i], b[i]); if (c) return c; } return a.length - b.length; }
  return 0;
}
const view = pairs => pairs.map(([key, value]) => ({ key, value })).sort((x, y) => collate(x.key, y.key));
const grouped = pairs => { const out = []; for (const r of view(pairs)) { const last = out[out.length - 1]; if (last && collate(last.key, r.key) === 0) last.value++; else out.push({ key: r.key, value: 1 }); } return out; };

const TABLE = (name, cols) => `<div class="box def"><div class="box-h">table ${name}</div><p><code>${cols}</code></p></div>`;

export const queries = [
  /* ===================================================================== */
  {
    id: 'tp1', title: 'TP 1 · SQL', lang: 'SQL', src: 'TP 1, corrigé', kind: 'corrige',
    intro: '<p>L\'historique (partiel) des festivals de musique en France. Un festival porte un nom, a lieu à un endroit et accueille un nombre maximal de personnes. Chaque année peut avoir lieu une édition de chaque festival (date de début, date de fin, liste d\'artistes). Chaque artiste a un nom, un pays et un style.</p>',
    schema: '<p class="math-note">Schéma utilisé par le corrigé (noms des tables et colonnes lus dans ses requêtes ; <code>#</code> = clé primaire, <code>→</code> = clé étrangère) :</p><div class="grid2">' +
      TABLE('festival', '# id, nom, lieu, max_personnes') +
      TABLE('edition', '# id, → id_festival, annee, date_debut, date_fin') +
      TABLE('artiste', '# id, nom, pays, style') +
      TABLE('edition_artiste', '# → id_edition, # → id_artiste') + '</div>',
    exos: [
      X('tp1-pk', '<p><b>Ex. 1</b> · Quelles clés primaires choisir, et pourquoi ? <i>(réponse en quelques lignes)</i></p>',
        `Le plus simple : une clé primaire numérique auto-incrémentée.
Ou une clé "naturelle" (colonne existante) si on est sûr
que sa valeur est unique pour toute donnée : ex. "nom" pour "artistes".
Ou une clé sur plusieurs colonnes : ex. (id_edition, id_artiste)
pour "editions_artistes" : c'est la combinaison qui identifie le tuple.`, { lang: 'texte' }),
      X('tp1-1', '<p>Tous les artistes.</p>', `SELECT * FROM artiste;`),
      X('tp1-2', '<p>Tous les artistes français.</p>', `SELECT * FROM artiste WHERE pays = 'France';`),
      X('tp1-3', '<p>Tous les artistes ayant joué aux Eurockéennes.</p>', `SELECT DISTINCT a.*
FROM artiste a
JOIN edition_artiste ea ON ea.id_artiste = a.id
JOIN edition e ON e.id = ea.id_edition
JOIN festival f ON f.id = e.id_festival
WHERE f.nom = 'Les Eurockéennes';`, { note: '<code>DISTINCT</code> : un artiste venu à plusieurs éditions n\'apparaît qu\'une fois.' }),
      X('tp1-4', '<p>Tous les artistes français ayant joué aux Eurockéennes en 2018.</p>', `SELECT a.*
FROM artiste a
JOIN edition_artiste ea ON ea.id_artiste = a.id
JOIN edition e ON e.id = ea.id_edition
JOIN festival f ON f.id = e.id_festival
WHERE f.nom = 'Les Eurockéennes' AND e.annee = 2018 AND a.pays = 'France';`),
      X('tp1-5', '<p>Tous les festivals où Placebo a joué.</p>', `SELECT DISTINCT f.*
FROM artiste a
JOIN edition_artiste ea ON ea.id_artiste = a.id
JOIN edition e ON e.id = ea.id_edition
JOIN festival f ON f.id = e.id_festival
WHERE a.nom = 'Placebo';`),
      X('tp1-6', '<p>Tous les artistes ayant joué dans au moins 2 festivals de plus de 40000 personnes.</p>', `SELECT a.*
FROM artiste a
JOIN edition_artiste ea ON ea.id_artiste = a.id
JOIN edition e ON e.id = ea.id_edition
JOIN festival f ON f.id = e.id_festival
WHERE f.max_personnes > 40000
GROUP BY a.id
HAVING COUNT(DISTINCT f.id) >= 2;`, { note: '<code>WHERE</code> filtre les lignes avant le regroupement ; <code>HAVING</code> filtre les groupes après. <code>COUNT(DISTINCT f.id)</code> compte des festivals différents, pas des éditions.' }),
      X('tp1-7', '<p>Tous les artistes, avec pour chacun le nombre de festivals différents et le nombre d\'éditions (tous festivals confondus) auxquels l\'artiste a participé.</p>', `SELECT a.*,
       COUNT(DISTINCT e.id_festival) AS nb_festivals,
       COUNT(e.id) AS nb_editions
FROM artiste a
LEFT JOIN edition_artiste ea ON ea.id_artiste = a.id
LEFT JOIN edition e ON e.id = ea.id_edition
GROUP BY a.id;`, { note: '<code>LEFT JOIN</code> garde aussi les artistes sans aucune édition (ils ont alors 0 et 0).' }),
      X('tp1-8', '<p>Le nombre d\'artistes différents par année, tous festivals confondus.</p>', `SELECT e.annee, COUNT(DISTINCT ea.id_artiste) AS nb_artistes
FROM edition_artiste ea
JOIN edition e ON e.id = ea.id_edition
GROUP BY e.annee
ORDER BY e.annee;`),
    ],
  },

  /* ===================================================================== */
  {
    id: 'sql-cours', title: 'SQL du cours', lang: 'SQL', src: 'CM, partie 2', kind: 'cours',
    intro: '<p>Les exemples de requêtes des diapositives, sur une boutique en ligne.</p>',
    schema: '<div class="grid2">' + TABLE('clients', '# id, nom, prenom, adresse, …') + TABLE('produits', '# id, titre, prix, …') +
      TABLE('avis', '# id, → id_produit, note, avis, …') + TABLE('achats', '# id, → id_produit, → id_client, date, quantite, …') + '</div>',
    exos: [
      X('sc-1', '<p>Le titre et le prix de tous les produits, du moins cher au plus cher.</p>', `SELECT titre, prix FROM produits
ORDER BY prix;`),
      X('sc-2', '<p>L\'adresse de Dominique Dubois.</p>', `SELECT adresse FROM clients
WHERE nom = 'Dubois' AND prenom = 'Dominique';`),
      X('sc-3', '<p>La note et le texte des avis sur l\'« iPhone 14 » (jointure entre <code>avis</code> et <code>produits</code>).</p>', `SELECT a.note, a.avis FROM avis a
JOIN produits p ON p.id = a.id_produit
WHERE p.titre = 'iPhone 14';`, { expected: [{ note: 5, avis: 'la bonne affaire du moment' }, { note: 4, avis: 'capteur photo décevant' }], note: 'Résultat sur l\'extrait de tables de la diapositive (avis 646 et 648, qui portent sur le produit 2).' }),
      X('sc-4', '<p>Les 10 avis les mieux notés sur le « Déguisement de dinosaure gonflable ».</p>', `SELECT a.avis FROM avis a
JOIN produits p ON p.id = a.id_produit
WHERE p.titre = 'Déguisement de dinosaure gonflable'
ORDER BY a.note DESC LIMIT 10;`),
      X('sc-5', '<p>Changer l\'adresse du client n° 432 en « 4 rue Pierre Soulages, 34200 Sète ».</p>', `UPDATE clients SET adresse = '4 rue Pierre Soulages, 34200 Sète' WHERE id = 432;`),
      X('sc-6', '<p>Le titre et le prix du dernier produit acheté par Dominique Dubois.</p>', `SELECT p.titre, p.prix FROM produits p
JOIN achats a ON a.id_produit = p.id
JOIN clients c ON c.id = a.id_client
WHERE c.nom = 'Dubois' AND c.prenom = 'Dominique'
ORDER BY a.date DESC LIMIT 1;`),
      X('sc-7', '<p>Le montant total dépensé par Dominique Dubois entre le 1<sup>er</sup> juillet et le 31 août 2024.</p>', `SELECT SUM(a.quantite * p.prix) as total FROM produits p
JOIN achats a ON a.id_produit = p.id
JOIN clients c ON c.id = a.id_client
WHERE c.nom = 'Dubois' AND c.prenom = 'Dominique'
AND a.date > '2024-07-01' AND a.date < '2024-08-31';`),
    ],
  },

  /* ===================================================================== */
  {
    id: 'couch', title: 'CouchDB · vues', lang: 'JavaScript / URL', src: 'CM, partie 4', kind: 'cours',
    intro: '<p>Une base <code>miashs</code> de documents « ouvrage » (<code>titre</code>, <code>genres</code>, <code>auteurs</code> : liste de noms, <code>parution</code>). On interroge CouchDB par des URL (le serveur est noté <code>&lt;serveur&gt;</code>) et on écrit les vues en JavaScript.</p>',
    exos: [
      X('cd-1', '<p>URL : tous les documents de la base, avec leur contenu.</p>', `http://<serveur>/couchdb/miashs/_all_docs?include_docs=true`, { lang: 'URL', note: 'Sans <code>include_docs=true</code>, la vue <code>_all_docs</code> ne renvoie que les identifiants.' }),
      X('cd-2', '<p>URL : le document d\'identifiant <code>4a0a116450abbefa98fd1f646c00030e</code>.</p>', `http://<serveur>/couchdb/miashs/_all_docs?include_docs=true&key="4a0a116450abbefa98fd1f646c00030e"`, { lang: 'URL' }),
      X('cd-3', '<p>URL : seulement le premier document.</p>', `http://<serveur>/couchdb/miashs/_all_docs?include_docs=true&limit=1`, { lang: 'URL' }),
      X('cd-4', '<p>Fonction <b>map</b> d\'une vue « ouvrages par auteur » : pour chaque auteur d\'un ouvrage, émettre la clé = l\'auteur, la valeur = le titre.</p>', `function (doc) {
  doc.auteurs.forEach((a) => {
    emit(a, doc.titre);
  });
}`, { lang: 'JavaScript', expected: [{ id: '4a0a116450abbefa98fd1f646c00030e', key: 'Alain Damasio', value: 'La Zone du Dehors' }, { id: '4a0a116450abbefa98fd1f646c0067b1', key: 'Alain Damasio', value: 'La Horde du Contrevent' }, { id: '4a0a116450abbefa98fd1f646c0013b2', key: 'Emily Brontë', value: 'Les Hauts de Hurlevent' }], note: 'Les lignes de la vue sont triées par clé (copie d\'écran de la diapositive).' }),
      X('cd-5', '<p>URL : interroger cette vue (design doc <code>par_auteur</code>, vue <code>par_auteur</code>) pour les ouvrages d\'Emily Brontë.</p>', `http://<serveur>/couchdb/miashs/_design/par_auteur/_view/par_auteur?key="Emily Brontë"`, { lang: 'URL' }),
      X('cd-6', '<p>La même vue avec la fonction <b>reduce</b> <code>_count</code> (vue <code>par_auteur_2</code>) : quelle URL donne le nombre d\'ouvrages <b>pour chaque auteur</b> (et donc la liste des auteurs) ?</p>', `http://<serveur>/couchdb/miashs/_design/par_auteur/_view/par_auteur_2?group=true`, { lang: 'URL', expected: [{ key: 'Alain Damasio', value: 2 }, { key: 'Emily Brontë', value: 1 }], note: 'Sans <code>group=true</code>, reduce porte sur tous les documents : une seule ligne <code>{ key: null, value: 3 }</code>. Avec <code>reduce=false</code>, on retrouve les lignes de map.' }),
      X('cd-7', '<p>Base « demo » de requêtes clients : fonction <b>map</b> qui émet la clé <code>[type de client, date]</code> et la valeur 1 (vue « requêtes par type de client », reduce <code>_count</code>).</p>', `emit([doc.client.type, doc.date], 1);`, { lang: 'JavaScript', note: 'Une clé composée (tableau) permet de filtrer par type puis par plage de dates avec <code>startkey</code> / <code>endkey</code>.' }),
      X('cd-8', '<p>URL : les requêtes Android du 16 juillet 2024 entre 9h10 et 9h12 (timestamps 1721121000000 et 1721121120000), sans reduce. Design doc <code>vues</code>, vue <code>client-date</code>.</p>', `http://<serveur>/couchdb/demo/_design/vues/_view/client-date?startkey=["android",1721121000000]&endkey=["android",1721121120000]&reduce=false`, { lang: 'URL', note: 'Dans la diapositive, les crochets et guillemets sont encodés pour <code>curl</code> (<code>\\[</code>, <code>%22</code>). Performances annoncées : indexation ~80 s, vue &lt; 5 Mo, exécution ~100 ms sur ~230 000 documents.' }),
    ],
  },

  /* ===================================================================== */
  {
    id: 'aql-cours', title: 'AQL du cours', lang: 'AQL', src: 'CM, partie 5', kind: 'cours',
    intro: '<p>ArangoDB, base <code>miashs</code> : une collection <code>ouvrages</code> (<code>titre</code>, <code>parution</code>, <code>auteurs</code> : liste de noms…) et une collection <code>auteurs</code> (<code>nom</code>, <code>pays</code>…). Exemples d\'index et de graphes des diapositives.</p>',
    exos: [
      X('aq-1', '<p>Pour chaque ouvrage : titre, parution, nom et pays de son premier auteur (jointure avec <code>auteurs</code>), du plus récent au plus ancien.</p>', `FOR o IN ouvrages
  FOR a IN auteurs
    FILTER a.nom == o.auteurs[0]
    SORT o.parution DESC
    RETURN {
      titre: o.titre,
      parution: o.parution,
      auteur: a.nom,
      pays: a.pays
    }`, { expected: [{ titre: 'La Horde du Contrevent', parution: 2006, auteur: 'Alain Damasio', pays: 'France' }, { titre: 'La Zone du Dehors', parution: 1999, auteur: 'Alain Damasio', pays: 'France' }, { titre: 'Les Hauts de Hurlevent', parution: 1847, auteur: 'Emily Brontë', pays: 'Royaume Uni' }],
        note: 'Équivalent SQL : <code>SELECT o.titre as titre, … FROM ouvrages o JOIN auteurs a ON a.nom == o.auteurs[0] ORDER BY o.parution DESC</code>. AQL est plus itératif qu\'ensembliste : deux boucles imbriquées + un filtre.' }),
      X('aq-2', '<p>Collection <code>data</code> indexée sur <code>[auteur, parution]</code> : les ouvrages d\'Alain Damasio parus après 2000.</p>', `FOR d IN data
  FILTER d.auteur == "Alain Damasio"
  FILTER d.parution > 2000
  RETURN d`, { note: 'Utilise l\'index : égalité sur le premier champ, inégalité sur le dernier champ interrogé.' }),
      X('aq-3', '<p>Les ouvrages d\'Alain Damasio triés par date de parution (même index).</p>', `FOR d IN data
  FILTER d.auteur == "Alain Damasio"
  SORT d.parution
  RETURN d`),
      X('aq-4', '<p>Collections <code>editions</code> (liste de noms d\'<code>artistes</code>, <code>nom_festival</code>, <code>annee</code>), <code>artists</code> (<code>nom</code>, <code>pays</code>) et <code>Festivals</code> (<code>nom</code>, <code>capacite</code>) : pour chaque artiste de chaque édition, renvoyer artiste, pays, année d\'édition, festival et capacité, triés par année.</p>', `FOR e IN editions
  FOR a IN artists
    FILTER a.nom IN e.artistes
    FOR f IN Festivals
      FILTER f.nom == e.nom_festival
      SORT e.annee
      RETURN {
        artiste: a.nom,
        pays: a.pays,
        edition: e.annee,
        festival: f.nom,
        capacite: f.capacite
      }`, { note: 'Deux jointures et un tri : index utiles sur <code>artists.nom</code>, <code>editions.annee</code> et <code>Festivals.nom</code>.' }),
      X('aq-5', '<p>Communes (<code>lat</code>, <code>lon</code>) situées dans un polygone : renvoyer un point GeoJSON pour chaque document de <code>data</code> contenu dans le polygone de sommets [-4.1435049, 46.2347509], [2.1599641, 46.2347509], [2.1599641, 48.6586929], [-4.1435049, 48.6586929].</p>', `FOR d IN data
  FILTER GEO_CONTAINS(
    GEO_POLYGON([ [
      [-4.1435049, 46.2347509], [2.1599641, 46.2347509],
      [2.1599641, 48.6586929], [-4.1435049, 48.6586929],
      [-4.1435049, 46.2347509]
    ] ]),
    [ d.lon, d.lat ]
  )
  RETURN {
    type: "Point",
    coordinates: [ d.lon, d.lat ]
  }`, { note: 'Le polygone est fermé (le premier sommet est répété à la fin) et les coordonnées sont dans l\'ordre <b>[longitude, latitude]</b>. Un index « geo » sur <code>[lat, lon]</code> accélère <code>GEO_CONTAINS</code>.' }),
      X('aq-6', '<p>Graphe <code>worldCountry</code> (sommets <code>worldVertices</code>, arêtes « is-in » <code>worldEdges</code> du plus petit vers le plus grand) : les pays, à 1 ou 2 arêtes du sommet « world », avec leur nom, leur type et leur profondeur.</p>', `FOR vertex, edge, path IN 1..2 INBOUND "worldVertices/world" GRAPH worldCountry
  FILTER vertex.type == "country"
  RETURN {
    name: vertex.name,
    type: vertex.type,
    depth: LENGTH(path.edges)
  }`, { note: '<code>INBOUND</code> : on suit les arêtes entrantes vers « world » (pays → continent → world). La démo renvoie 40 éléments (Ecuador, Colombia, Chile, Brazil…), tous à la profondeur 2. Le cours remarque qu\'ici <code>FOR v IN world_vertices FILTER v.type == "country" RETURN v</code> suffirait !' }),
      X('aq-7', '<p>Graphe <code>leGrapheDeLAmitie</code> (« est ami avec », non orienté) : les amis, amis d\'amis et amis d\'amis d\'amis de <code>amis/B</code>, les plus proches d\'abord et sans doublon, avec leur distance.</p>', `FOR vertex, edge, path
  IN 1..3
  ANY "amis/B"
  GRAPH leGrapheDeLAmitie
  OPTIONS { uniqueVertices: "path", order: "bfs" }
  RETURN {
    personne: vertex.name,
    distance: LENGTH(path.edges)
  }`, { note: '<code>ANY</code> : relation non orientée. <code>order: "bfs"</code> (parcours en largeur) donne les plus proches d\'abord. Avec des jointures, il faudrait une boucle par niveau de profondeur, et on ne saurait pas facilement calculer la distance.' }),
    ],
  },

  /* ===================================================================== */
  {
    id: 'tp2', title: 'TP 2 · CouchDB', lang: 'JavaScript / URL', src: 'TP 2, corrigé', kind: 'corrige',
    intro: '<p>Les mêmes festivals qu\'au TP 1, cette fois dans <b>CouchDB</b>. Le corrigé propose <b>un document par édition de festival</b>, avec la liste des artistes imbriquée. Pour chaque question : la vue à créer (fonction <code>map</code>, et <code>reduce</code> si besoin) et les URL à appeler.</p><p><b>La recette du corrigé : émettre des clés correspondant aux critères sur lesquels on veut filtrer !</b></p><p class="math-note">Base <code>festivals</code>, design doc <code>tp2</code>. L\'adresse du serveur du TP et ses identifiants sont dans le sujet ; ils ne sont pas reproduits ici. Le résultat attendu est calculé à partir des données du TP (11 éditions) en imitant CouchDB : lignes triées par clé.</p>',
    dataset: { name: 'base festivals, 11 documents', docs: E },
    exos: [
      X('tp2-0', '<p><b>Ex. 1</b> · Proposer un modèle non relationnel (orienté documents) pour stocker ces données.</p>', `{
  "_id": "4fa1e268725e09e2fceded90fe003af3",
  "nom": "Garorock",
  "lieu": "Marmande",
  "annee": 2021,
  "max_personnes": 50000,
  "artistes": [
    { "nom": "Vianney", "pays": "France" },
    { "nom": "Selah Sue", "pays": "Belgique" },
    { "nom": "PNL", "pays": "France" },
    { "nom": "Gorillaz", "pays": "Royaume Uni" },
    { "nom": "Izïa", "pays": "France" }
  ]
}`, { lang: 'JSON', note: 'Un document par édition : le festival (nom, lieu, jauge) est répété à chaque édition, et les artistes sont imbriqués.' }),
      X('tp2-1', '<p><b>Ex. 2</b> · Toutes les éditions de festival (nom du festival et année), en pouvant filtrer par festival.</p>', `// Sans vue : un document = une édition
https://<serveur>/festivals/_all_docs?include_docs=true

// Vue toutes_les_editions, map :
function (doc) {
  emit(doc.nom, { "nom": doc.nom, "annee": doc.annee });
}

https://<serveur>/festivals/_design/tp2/_view/toutes_les_editions
https://<serveur>/festivals/_design/tp2/_view/toutes_les_editions?key="Garorock"`,
        { expected: () => view(E.map(d => [d.nom, { nom: d.nom, annee: d.annee }])), note: 'Résultat attendu de la vue sans paramètre. Avec <code>?key="Garorock"</code>, on ne garde que les lignes de clé « Garorock ».' }),
      X('tp2-2', '<p>Tous les festivals où Placebo a joué.</p>', `// Vue editions_par_artiste, map :
function (doc) {
  doc.artistes.forEach((a) => {
    emit(a.nom, { festival: doc.nom, edition: doc.annee});
  });
}

https://<serveur>/festivals/_design/tp2/_view/editions_par_artiste?key="Placebo"`,
        { expected: () => view(E.flatMap(d => d.artistes.map(a => [a.nom, { festival: d.nom, edition: d.annee }]))).filter(r => r.key === 'Placebo'), note: 'Le corrigé propose ensuite de modifier un document pour ajouter Placebo à une édition, et de relancer la vue.' }),
      X('tp2-3', '<p>Tous les artistes (chacun une seule fois).</p>', `// Chaque artiste peut apparaître plusieurs fois : reduce + group
// Vue tous_les_artistes, map :
function (doc) {
  doc.artistes.forEach((a) => {
    emit(a.nom, a);
  })
}
// reduce : _count

https://<serveur>/festivals/_design/tp2/_view/tous_les_artistes?reduce=false
https://<serveur>/festivals/_design/tp2/_view/tous_les_artistes?group=true`,
        { expected: () => grouped(E.flatMap(d => d.artistes.map(a => [a.nom, a]))), note: 'Résultat de <code>?group=true</code> : une ligne par artiste, avec son nombre d\'éditions. <code>?reduce=false</code> renvoie les lignes de map (un artiste par édition).' }),
      X('tp2-3b', '<p>Le détail d\'un artiste (Angèle).</p>', `// On filtre par clé, et on enlève le reduce pour avoir la valeur
https://<serveur>/festivals/_design/tp2/_view/tous_les_artistes?key="Angèle"
https://<serveur>/festivals/_design/tp2/_view/tous_les_artistes?key="Angèle"&reduce=false
https://<serveur>/festivals/_design/tp2/_view/tous_les_artistes?key="Angèle"&reduce=false&limit=1`,
        { lang: 'URL', expected: () => view(E.flatMap(d => d.artistes.map(a => [a.nom, a]))).filter(r => r.key === 'Angèle').slice(0, 1), note: 'Avec le reduce, <code>?key="Angèle"</code> ne renvoie que le compte ; <code>reduce=false</code> donne les documents émis, <code>limit=1</code> n\'en garde qu\'un.' }),
      X('tp2-4', '<p>Tous les artistes français : première idée, une clé = le pays.</p>', `// Vue artistes_par_pays, map :
function (doc) {
  doc.artistes.forEach((a) => {
    emit(a.pays, a.nom);
  })
}
// reduce : _count

https://<serveur>/festivals/_design/tp2/_view/artistes_par_pays?key="France"&reduce=false
https://<serveur>/festivals/_design/tp2/_view/artistes_par_pays?group=true`,
        { expected: () => grouped(E.flatMap(d => d.artistes.map(a => [a.pays, a.nom]))), note: '« Zut… on a besoin d\'une autre stratégie. » Avec <code>group=true</code> on obtient un compte <b>par pays</b>, pas la liste des artistes ; avec <code>reduce=false</code>, un artiste revient autant de fois qu\'il a joué.' }),
      X('tp2-4b', '<p>Tous les artistes français, chacun une seule fois : la bonne stratégie.</p>', `// Vue artistes_par_pays_2, map : clé composée [pays, nom]
function (doc) {
  doc.artistes.forEach((a) => {
    emit([a.pays, a.nom], null);
  })
}
// reduce : _count

https://<serveur>/festivals/_design/tp2/_view/artistes_par_pays_2?reduce=false
https://<serveur>/festivals/_design/tp2/_view/artistes_par_pays_2?group=true
https://<serveur>/festivals/_design/tp2/_view/artistes_par_pays_2?startkey=["France"]&endkey=["France", {}]&group=true`,
        { expected: () => grouped(E.flatMap(d => d.artistes.map(a => [[a.pays, a.nom], null]))).filter(r => r.key[0] === 'France').map(r => ({ key: JSON.stringify(r.key), value: r.value })), note: 'L\'objet vide <code>{}</code> à la fin de <code>endkey</code> se place <b>après</b> toutes les chaînes : ordre de collation <code>null &lt; booléens &lt; nombres &lt; chaînes &lt; tableaux &lt; objets</code>. On obtient ainsi toutes les clés qui commencent par "France". Marche aussi avec <code>endkey=["France "]</code> (un espace de plus), mais c\'est moins lisible.' }),
      X('tp2-5', '<p>Tous les artistes français ayant joué aux Eurockéennes en 2018.</p>', `// Vue artistes_par_pays_et_edition, map :
function (doc) {
  doc.artistes.forEach((a) => {
    emit([doc.nom, doc.annee, a.pays], a.nom);
  });
}

https://<serveur>/festivals/_design/tp2/_view/artistes_par_pays_et_edition?key=["Les Eurockéennes",2018,"France"]
https://<serveur>/festivals/_design/tp2/_view/artistes_par_pays_et_edition?startkey=["Les Eurockéennes"]&endkey=["Les Eurockéennes", {}]`,
        { expected: () => view(E.flatMap(d => d.artistes.map(a => [[d.nom, d.annee, a.pays], a.nom]))).filter(r => r.key[0] === 'Les Eurockéennes' && r.key[1] === 2018 && r.key[2] === 'France').map(r => ({ key: JSON.stringify(r.key), value: r.value })), note: 'Résultat de la première URL. La seconde, avec <code>{}</code>, donne tous les artistes de toutes les éditions des Eurockéennes.' }),
      X('tp2-5b', '<p>Tous les artistes français des Eurockéennes, <b>quelle que soit l\'édition</b>.</p>', `// Le corrigé : émettre la clé avec les mêmes éléments, mais dans un autre ordre :
// nom du festival, pays de l'artiste, année
function (doc) {
  doc.artistes.forEach((a) => {
    emit([doc.nom, a.pays, doc.annee], a.nom);
  });
}

// puis :
startkey=["Les Eurockéennes","France"]&endkey=["Les Eurockéennes","France "]`,
        { expected: () => view(E.flatMap(d => d.artistes.map(a => [[d.nom, a.pays, d.annee], a.nom]))).filter(r => r.key[0] === 'Les Eurockéennes' && r.key[1] === 'France').map(r => ({ key: JSON.stringify(r.key), value: r.value })), note: 'Le corrigé décrit cette vue en une phrase ; la fonction map ci-dessus l\'écrit en suivant ce qu\'il dit. Une plage de clés ne peut porter que sur la <b>fin</b> d\'une clé composée : les critères fixés doivent venir en premier.', kind: 'propose' }),
      X('tp2-6', '<p>Que se passe-t-il au niveau des vues lorsqu\'on ajoute ou modifie un document ?</p>', `Les vues sont mises à jour automatiquement ;
l'index est mis à jour de façon incrémentale : seuls les documents
modifiés/ajoutés depuis la dernière mise à jour passent dans le map.
Par défaut, cette mise à jour a lieu au moment de la requête,
ce qui rend la première requête après beaucoup d'écritures plus lente.`, { lang: 'texte' }),
      X('tp2-7', '<p>Avec le recul, choisiriez-vous une modélisation différente ?</p>', `Avec une base de documents "à plat", aucune modélisation n'est parfaite
dès lors que plusieurs concepts sont en jeu.

Alternative : un document par occurrence d'un artiste dans une édition :
{
  "nom": "Garorock", "lieu": "Marmande", "annee": 2021, "max_personnes": 50000,
  "artiste": { "nom": "Vianney", "pays": "France" }
}

→ Encore plus de redondance, mais une granularité plus fine :
  pas de boucle à faire dans le code des vues.`, { lang: 'texte' }),
    ],
  },

  {
    id: 'aql-tp2', title: 'Entraînement AQL · festivals', lang: 'AQL', src: 'données du TP 2', kind: 'propose',
    intro: '<p>Les questions du TP 1, cette fois en AQL sur la collection <code>editions</code> du fichier <code>tp2-editions.json</code> : un document par édition, avec <code>nom</code> (du festival), <code>lieu</code>, <code>annee</code>, <code>max_personnes</code> et la liste des <code>artistes</code> (<code>nom</code>, <code>pays</code>) imbriquée dans le document.</p><p><b>Ces solutions ont été rédigées pour le site</b> : le TP 2 se fait avec CouchDB (série précédente), cette série est un entraînement en plus, pas un corrigé de l\'enseignant. Le résultat attendu est calculé à partir du fichier.</p>',
    dataset: { name: 'collection editions, 11 documents', docs: E },
    exos: [
      X('t2-1', '<p>Toutes les éditions, triées par année puis par nom de festival.</p>', `FOR e IN editions
  SORT e.annee, e.nom
  RETURN e`, { expected: () => [...E].sort((a, b) => a.annee - b.annee || byAlpha(a.nom, b.nom)).map(e => ({ nom: e.nom, annee: e.annee, lieu: e.lieu, max_personnes: e.max_personnes })), note: 'Le tableau n\'affiche pas la liste des artistes de chaque document.' }),
      X('t2-2', '<p>Le nom et le lieu des éditions de 2023.</p>', `FOR e IN editions
  FILTER e.annee == 2023
  RETURN { nom: e.nom, lieu: e.lieu }`, { expected: () => E.filter(e => e.annee === 2023).map(e => ({ nom: e.nom, lieu: e.lieu })) }),
      X('t2-3', '<p>Les festivals (sans doublon) dont la jauge dépasse 40000 personnes.</p>', `FOR e IN editions
  FILTER e.max_personnes > 40000
  RETURN DISTINCT e.nom`, { expected: () => uniq(E.filter(e => e.max_personnes > 40000).map(e => e.nom)) }),
      X('t2-4', '<p>Tous les artistes ayant joué aux Eurockéennes, sans doublon.</p>', `FOR e IN editions
  FILTER e.nom == "Les Eurockéennes"
  FOR a IN e.artistes
    RETURN DISTINCT a.nom`, { expected: () => uniq(E.filter(e => e.nom === 'Les Eurockéennes').flatMap(e => e.artistes.map(a => a.nom))), note: 'Pas de jointure : les artistes sont imbriqués dans chaque édition, on les parcourt avec une seconde boucle <code>FOR a IN e.artistes</code>.' }),
      X('t2-5', '<p>Les artistes français ayant joué aux Eurockéennes en 2018.</p>', `FOR e IN editions
  FILTER e.nom == "Les Eurockéennes" AND e.annee == 2018
  FOR a IN e.artistes
    FILTER a.pays == "France"
    RETURN a.nom`, { expected: () => E.filter(e => e.nom === 'Les Eurockéennes' && e.annee === 2018).flatMap(e => e.artistes.filter(a => a.pays === 'France').map(a => a.nom)) }),
      X('t2-6', '<p>Les festivals où Placebo a joué, sans doublon.</p>', `FOR e IN editions
  FILTER "Placebo" IN e.artistes[*].nom
  RETURN DISTINCT e.nom`, { expected: () => uniq(E.filter(e => e.artistes.some(a => a.nom === 'Placebo')).map(e => e.nom)), note: '<code>e.artistes[*].nom</code> (opérateur d\'expansion) donne la liste des noms des artistes de l\'édition. Variante : <code>FOR a IN e.artistes FILTER a.nom == "Placebo" RETURN DISTINCT e.nom</code>.' }),
      X('t2-7', '<p>Pour chaque artiste, le nombre d\'éditions auxquelles il a participé, du plus grand au plus petit.</p>', `FOR e IN editions
  FOR a IN e.artistes
    COLLECT artiste = a.nom WITH COUNT INTO n
    SORT n DESC, artiste
    RETURN { artiste, editions: n }`, { expected: () => { const m = {}; E.forEach(e => e.artistes.forEach(a => { m[a.nom] = (m[a.nom] || 0) + 1; })); return Object.entries(m).sort((a, b) => b[1] - a[1] || byAlpha(a[0], b[0])).map(([artiste, n]) => ({ artiste, editions: n })); }, note: '<code>COLLECT … WITH COUNT INTO</code> est l\'équivalent de <code>GROUP BY</code> + <code>COUNT(*)</code>.' }),
      X('t2-8', '<p>Les artistes ayant joué dans au moins 2 festivals différents de plus de 40000 personnes.</p>', `FOR e IN editions
  FILTER e.max_personnes > 40000
  FOR a IN e.artistes
    COLLECT artiste = a.nom INTO festivals = e.nom
    FILTER COUNT_DISTINCT(festivals) >= 2
    RETURN { artiste, festivals: UNIQUE(festivals) }`, { expected: () => { const m = {}; E.filter(e => e.max_personnes > 40000).forEach(e => e.artistes.forEach(a => { (m[a.nom] = m[a.nom] || new Set()).add(e.nom); })); return Object.entries(m).filter(([, s]) => s.size >= 2).sort((a, b) => byAlpha(a[0], b[0])).map(([artiste, s]) => ({ artiste, festivals: [...s] })); }, note: '<code>COLLECT … INTO festivals = e.nom</code> regroupe, pour chaque artiste, la liste des noms de festivals. Le <code>FILTER</code> après le <code>COLLECT</code> joue le rôle du <code>HAVING</code>.' }),
      X('t2-9', '<p>Tous les artistes, avec pour chacun le nombre de festivals différents et le nombre d\'éditions.</p>', `FOR e IN editions
  FOR a IN e.artistes
    COLLECT artiste = a.nom INTO g = e.nom
    SORT artiste
    RETURN {
      artiste,
      nb_festivals: COUNT_DISTINCT(g),
      nb_editions: LENGTH(g)
    }`, { expected: () => { const m = {}; E.forEach(e => e.artistes.forEach(a => { (m[a.nom] = m[a.nom] || []).push(e.nom); })); return Object.keys(m).sort(byAlpha).map(k => ({ artiste: k, nb_festivals: new Set(m[k]).size, nb_editions: m[k].length })); } }),
      X('t2-10', '<p>Le nombre d\'artistes différents par année, tous festivals confondus.</p>', `FOR e IN editions
  FOR a IN e.artistes
    COLLECT annee = e.annee INTO noms = a.nom
    RETURN { annee, nb_artistes: COUNT_DISTINCT(noms) }`, { expected: () => { const m = {}; E.forEach(e => e.artistes.forEach(a => { (m[e.annee] = m[e.annee] || new Set()).add(a.nom); })); return Object.keys(m).sort().map(y => ({ annee: +y, nb_artistes: m[y].size })); }, note: '<code>COLLECT</code> trie déjà les groupes par la clé de regroupement.' }),
    ],
  },
];
