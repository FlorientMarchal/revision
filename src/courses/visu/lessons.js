// Le cours en entier, leçon par leçon, rédigé à partir des diapositives des CM 1 à 4 et des supports de TP.
// Le code cité dans la leçon 5 est uniquement celui des supports de TP de l'enseignant.
const box = (k, title, html) => `<div class="box ${k}"><div class="box-h">${title}</div>${html}</div>`;
const def = (t, h) => box('def', 'Définition · ' + t, h);
const prop = (t, h) => box('prop', t, h);
const ex = (t, h) => box('ex', 'Exemple · ' + t, h);
const warn = (t, h) => box('warn', 'Attention · ' + t, h);
const method = (t, h) => box('method', 'Méthode · ' + t, h);
const code = (src, c) => box('code', 'Code fourni · ' + src, `<pre><code>${c.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code></pre>`);
const demo = name => `<figure class="viz" data-viz="${name}"></figure>`;
const YN = { o: '<td class="yes">Oui</td>', e: '<td class="maybe">Éventuellement</td>', n: '<td class="no">Non</td>' };
const vvRow = (n, a, b, c) => `<tr><td>${n}</td>${YN[a]}${YN[b]}${YN[c]}</tr>`;
const vvHead = '<thead><tr><th>Variable visuelle</th><th>Nominale</th><th>Ordinale</th><th>Quantitative</th></tr></thead>';

export const lessons = [
  /* ===================================================================== */
  {
    id: 'l1', ch: 'intro', short: 'Introduction', src: 'CM 1',
    t: 'Introduction à la visualisation d\'informations',
    sub: 'Ce qu\'est une visualisation, à quoi elle sert, et le cadre « Quoi ? Pourquoi ? Comment ? » qui structure tout le cours.',
    goals: [
      'Donner une définition précise d\'une visualisation et de ses composants (vues, idiomes).',
      'Distinguer les deux objectifs : présenter et explorer, avec un exemple de chaque.',
      'Expliquer pourquoi concevoir une visualisation est toujours un compromis.',
      'Décrire une situation avec le cadre Quoi (données) / Pourquoi (tâches) / Comment (idiomes).',
    ],
    sections: [
      { id: 'def', t: 'Qu\'est-ce qu\'une visualisation ?', sub: 'Données, tâches, efficacité, vues et idiomes', html: `
${def('Visualisation', `<p>Une visualisation part d'un <b>jeu de données</b>. Elle est <b>conçue pour aider à accomplir des tâches de façon efficace</b>, l'efficacité se mesurant en <b>temps</b> (aller vite) et en <b>exactitude</b> (ne pas se tromper). Elle se compose d'une ou plusieurs <b>représentations visuelles</b>, appelées <b>vues</b>, elles-mêmes composées d'<b>idiomes</b>.</p>`)}
<p>Chaque mot compte. Une visualisation n'est pas un « joli dessin » : elle se juge à sa capacité à faire accomplir une tâche précise. Le même jeu de données peut donc appeler des visualisations différentes selon la question posée.</p>
${ex('trouver la note la plus élevée', `<p>Face à une liste de 40 notes non triées (13,36 ; 4,28 ; 4,30 ; 2,28 ; …), trouver la plus haute demande de parcourir toutes les valeurs. Une représentation où la note la plus haute « saute aux yeux » (liste triée, barres, mise en évidence) rend la tâche immédiate : c'est le rôle d'une visualisation.</p>`)}
` },
      { id: 'objectifs', t: 'Deux objectifs', sub: 'Présenter des résultats connus ; analyser et explorer', html: `
${prop('Les deux objectifs d\'une visualisation', `<ul><li><b>Présentation de résultats connus</b> : on sait déjà ce qu'on veut montrer et on cherche à le communiquer.</li><li><b>Analyse et exploration des données</b> : on ne sait pas encore ce qu'il y a dans les données ; la visualisation sert à le découvrir.</li></ul>`)}
<h4>Présenter : la carte de Minard (1869)</h4>
<p>Charles Joseph Minard représente la campagne de Russie de Napoléon. Une seule image montre <b>6 dimensions</b> : la <b>taille</b> de l'armée (épaisseur du flux), sa <b>position en 2D</b> et sa <b>direction</b> (aller, retour), les <b>températures</b> et les <b>dates</b> pendant la retraite. Les résultats sont connus (l'armée a été décimée) ; la visualisation les rend saisissants.</p>
<h4>Explorer : John Snow et le choléra (Londres, 1854)</h4>
<p>En reportant les décès sur une carte du quartier, John Snow voit les cas se concentrer autour d'une pompe à eau. La visualisation a permis de <b>découvrir</b> une structure dans les données (l'origine de l'épidémie).</p>
<h4>Explorer : le quartet d'Anscombe</h4>
<p>Quatre jeux de données de 11 points ont les mêmes statistiques : moyenne des x = 9, moyenne des y = 7,5, variance des x = 10, variance des y = 3,75, même droite de régression y = 3 + 0,5x, même somme des carrés des écarts à la moyenne (110), et la même corrélation (la diapositive indique 0,876 ; la valeur de référence du quartet est 0,816). Pourtant leurs nuages de points sont radicalement différents.</p>
${demo('anscombe')}
${prop('Leçon d\'Anscombe', '<p>Des résumés statistiques identiques peuvent cacher des données très différentes : <b>il faut visualiser</b> les données, pas seulement les résumer.</p>')}
` },
      { id: 'info', t: 'La visualisation en informatique', sub: 'Application, vues coordonnées, automatisation', html: `
<p>Dans ce cours, une visualisation est une <b>application informatique</b> :</p>
<ul><li>elle peut comporter plusieurs <b>vues coordonnées et interactives</b> (sélectionner dans une vue met en évidence dans une autre) ;</li><li>elle sert à <b>automatiser</b> la génération des représentations : quand les données changent, le graphique se met à jour tout seul. C'est l'objet des TP (SVG, JavaScript, D3).</li></ul>
` },
      { id: 'conception', t: 'Concevoir : un espace vaste, des compromis', sub: 'Vues, idiomes, et l\'exemple des notes', html: `
${method('Concevoir une visualisation', `<ol><li>Proposer une ou plusieurs <b>vues</b>.</li><li>Pour chaque vue, déterminer les <b>idiomes</b> : les <b>encodages visuels</b> (types de représentation : diagramme en barres, camembert…) et les <b>techniques d'interaction</b> (filtres, sélections…).</li></ol>`)}
<p>L'<b>espace conceptuel</b> est <b>vaste</b> : on peut imaginer une infinité de représentations. Mais <b>la plupart sont inefficaces</b> pour une tâche donnée. Il faut donc faire des <b>compromis</b>.</p>
${ex('les notes, suite', `<ul><li>« Quelle est la note la plus élevée ? » : la liste triée suffit.</li><li>« Quelle est la note médiane ? » : la liste triée la donne aussi (entre la 20<sup>e</sup> et la 21<sup>e</sup> valeur).</li><li>« Quels sont le minimum, le premier quartile, le troisième quartile… ? » : une <b>boîte à moustaches</b> donne tout d'un coup (minimum, Q1, médiane, Q3, maximum), mais on ne voit plus chaque note.</li></ul><p>Aucune représentation n'est la meilleure pour toutes les tâches : chaque choix gagne sur certaines questions et perd sur d'autres.</p>`)}
${demo('notes')}
` },
      { id: 'qpc', t: 'Quoi ? Pourquoi ? Comment ?', sub: 'Le cadre d\'analyse de Munzner', html: `
<p>Toute visualisation s'analyse avec trois questions (Tamara Munzner) :</p>
<table class="t"><thead><tr><th>Question</th><th>Porte sur</th><th>Formulation</th></tr></thead><tbody>
<tr><td><b>Quoi ?</b> (What)</td><td>les <b>données</b></td><td>Quelles sont les données à visualiser ?</td></tr>
<tr><td><b>Pourquoi ?</b> (Why)</td><td>les <b>tâches</b></td><td>Pourquoi les utilisateurs ont-ils besoin de visualiser ?</td></tr>
<tr><td><b>Comment ?</b> (How)</td><td>les <b>idiomes</b></td><td>Comment visualiser ces données ?</td></tr></tbody></table>
<p>La suite du cours suit ce plan : au semestre 1, le <b>Quoi</b> pour les tables (CM 2) et une partie du <b>Comment</b> (les variables visuelles, CM 3 et 4) ; au semestre 2, les autres organisations spatiales (graphes, champs, géométries) et les actions manipuler, connecter, réduire.</p>
` },
      { id: 'quoi', t: 'Quoi ? Les données', sub: 'Sémantique, type, jeux de données, types de variables', html: `
<p>Pour concevoir une visualisation, il faut connaître deux aspects des données.</p>
${def('Sémantique', '<p>Ce que les données représentent dans le monde réel. Un mot représente-t-il le nom d\'une personne, un acronyme, une ville ou un fruit ? Un nombre représente-t-il un âge, un jour, une longueur, un code ou une position ?</p>')}
${def('Type', '<p>L\'interprétation structurelle ou mathématique des données : individus, variables, nœuds, liens… ; la façon dont ces types sont combinés dans le jeu de données (tables, graphes…) ; et les <b>opérations</b> qui ont un sens sur chaque variable.</p>')}
${warn('un nombre n\'est pas forcément quantitatif', '<p>Faire la moyenne de codes postaux n\'a pas de sens, même si ce sont des nombres : la variable est <b>nominale</b>, pas quantitative.</p>')}
<h4>Types de jeux de données</h4>
<ul><li><b>Tables</b> : individus (lignes) × variables (colonnes) ; chaque cellule contient une valeur. Variante : table multidimensionnelle.</li><li><b>Réseaux et arbres</b> : des nœuds (les individus) reliés par des liens, avec des variables sur les uns et les autres.</li><li><b>Champs</b> : une grille de positions ; chaque cellule porte des valeurs (données continues, par exemple une température en tout point).</li><li><b>Géométrie</b> : des formes et positions spatiales.</li><li>Aussi : groupes (clusters), ensembles, listes.</li></ul>
<p>Disponibilité des données : <b>statiques</b> (fixées) ou <b>dynamiques</b> (qui arrivent au fil du temps).</p>
<h4>Types de variables (attributs)</h4>
<ul><li><b>Catégorielle</b> (nominale) : pas d'ordre.</li><li><b>Ordonnée</b> : <b>ordinale</b> (ordre sans arithmétique) ou <b>quantitative</b> (ordre et arithmétique).</li><li>Sens de l'ordre : <b>séquentiel</b> (du plus petit au plus grand), <b>divergent</b> (de part et d'autre d'une valeur centrale), <b>cyclique</b> (jours de la semaine, angles).</li></ul>
` },
      { id: 'pourquoi', t: 'Pourquoi ? Les tâches', sub: 'Tâches abstraites, actions et cibles', html: `
${method('Passer du besoin à la tâche abstraite', '<ol><li>Comprendre les besoins des utilisateurs.</li><li>Les transformer en <b>tâches abstraites</b>, c\'est-à-dire non spécifiques au domaine d\'application, exprimées dans le vocabulaire de la visualisation d\'informations.</li></ol>')}
${ex('carte routière', '<p>Besoin : « j\'ai une carte du réseau routier et je dois trouver le chemin qui me permet d\'aller le plus rapidement de la ville A à la ville B ». Tâche abstraite : <b>rechercher le plus court chemin dans un graphe multivarié</b>.</p>')}
<p><b>Intérêt</b> : la tâche abstraite est plus générique. Elle donne accès aux solutions proposées dans d'autres domaines (le plus court chemin est un problème d'algorithmique et de visualisation de graphes, qui sert aussi en analyse de réseaux sociaux) et permet de diffuser le résultat.</p>
${def('Tâche', '<p>Une tâche se décrit par une <b>action</b> (« rechercher ») et une <b>cible</b> (« chemin dans un graphe »).</p>')}
<h4>Les actions</h4>
<ul><li><b>Analyser</b> : <i>consommer</i> l'information (découvrir, présenter, apprécier) ou en <i>produire</i> (annoter, enregistrer, dériver de nouvelles données).</li>
<li><b>Rechercher</b>, selon ce qu'on connaît :
<table class="t"><thead><tr><th></th><th>Cible connue</th><th>Cible inconnue</th></tr></thead><tbody><tr><th>Position connue</th><td>lookup (consulter)</td><td>browse (parcourir)</td></tr><tr><th>Position inconnue</th><td>locate (localiser)</td><td>explore (explorer)</td></tr></tbody></table></li>
<li><b>Requêter</b> : <i>identifier</i> (un élément), <i>comparer</i> (quelques éléments), <i>résumer</i> (tous les éléments).</li></ul>
<h4>Les cibles</h4>
<ul><li><b>Toutes les données</b> : tendances, valeurs aberrantes, caractéristiques.</li><li><b>Les variables</b> : une seule (distribution, extrêmes) ou plusieurs (dépendance, corrélation, similarité).</li><li><b>Les réseaux</b> : topologie, chemins.</li><li><b>Les données spatiales</b> : forme.</li></ul>
` },
      { id: 'comment', t: 'Comment ? Les idiomes', sub: 'Encoder, manipuler, facettes, réduire', html: `
<ul><li><b>Encoder</b> : <i>arranger</i> les éléments dans l'espace (exprimer une valeur, séparer, ordonner, aligner, utiliser un espace existant comme une carte) et <i>associer</i> (« map ») les variables catégorielles et ordonnées à des canaux visuels : couleur (teinte, saturation, luminance), taille, angle, courbure, forme, mouvement…</li>
<li><b>Manipuler</b> : changer la vue, sélectionner, naviguer.</li>
<li><b>Facettes</b> : juxtaposer plusieurs vues, partitionner les données entre vues, superposer des couches.</li>
<li><b>Réduire</b> : filtrer, agréger, intégrer (embed : du détail dans le contexte).</li></ul>
<p>Les CM 3 et 4 détaillent la partie « associer » : ce sont les <b>variables visuelles</b>.</p>
` },
      { id: 'conclusion', t: 'Conclusion', sub: 'Pas de recette miracle', html: `
<ul><li>La visualisation d'informations est une « <b>science jeune</b> » : il n'existe pas de recette miracle.</li><li>L'idée : <b>connaître les visualisations existantes</b>, savoir les utiliser et les combiner.</li><li>Référence : Tamara Munzner, <i>Visualization Analysis &amp; Design</i>, A K Peters Visualization Series, CRC Press, 2014.</li></ul>
` },
    ],
    keep: [
      'Visualisation = jeu de données + tâches + efficacité (temps, exactitude) + vues composées d\'idiomes.',
      'Deux objectifs : présenter (Minard) ; analyser et explorer (Snow, Anscombe).',
      'Anscombe : mêmes statistiques, données différentes, donc il faut visualiser.',
      'Concevoir = choisir des idiomes (encodages visuels, interactions) parmi un espace vaste : toujours un compromis.',
      'Quoi = données ; Pourquoi = tâches (action + cible) ; Comment = idiomes.',
      'Un nombre n\'est pas forcément quantitatif (codes postaux : nominale).',
    ],
  },
  /* ===================================================================== */
  {
    id: 'l2', ch: 'tables', short: 'Tables', src: 'CM 2',
    t: 'Organisation spatiale : les tables',
    sub: 'Individus, variables et types de variables ; puis le catalogue des graphiques pour les tables, avec ce que chacun représente.',
    goals: [
      'Définir individu, variable, table.',
      'Classer une variable : nominale, ordinale, quantitative, et faire le lien avec le vocabulaire statistique.',
      'Pour chaque graphique du catalogue, dire combien de variables de chaque type il représente et avec quoi.',
    ],
    sections: [
      { id: 'jeux', t: 'Jeux de données', sub: 'Tables, réseaux, champs, géométrie', html: `
${def('Jeu de données', '<p>L\'ensemble de données sur lequel porte l\'analyse. Quatre grandes familles : <b>tables</b>, <b>réseaux</b>, <b>champs</b>, <b>géométrie</b>.</p>')}
<p>Ce semestre ne traite que les <b>tables</b> ; réseaux, champs et géométrie sont au programme du semestre 2.</p>
` },
      { id: 'table', t: 'Individus, variables, tables', sub: 'Le vocabulaire de base', html: `
${def('Individu', '<p>Entité particulière de type <b>discret</b>. Synonymes : <i>item</i>, <i>élément</i>. Exemples : personnes, actions, gènes, villes, magasins…</p>')}
${def('Variable', '<p>Propriété <b>observée, calculée ou enregistrée</b>. Synonymes : <i>attribut</i>, <i>dimension</i>. Exemples : salaire, prix, nombre de ventes…</p>')}
${def('Table', '<p>Ensemble de lignes et de colonnes définissant des cellules : <b>les lignes représentent des individus</b>, <b>les colonnes des variables</b>, et chaque cellule (i, j) contient la valeur de la variable j pour l\'individu i. On peut ajouter d\'autres dimensions (table multidimensionnelle).</p>')}
${ex('table de commandes', '<p>Une table de commandes avec les colonnes « Order ID », « Order Date », « Order Priority » (1-Urgent, 2-High, 3-Medium…), « Product Container » (Small Box, Wrap Bag…), « Product Base Margin », « Ship Date ». On y trouve les trois types de variables : <b>quantitative</b> (la marge, les dates), <b>ordinale</b> (la priorité), <b>nominale</b> (le contenant).</p>')}
` },
      { id: 'types', t: 'Les trois types de variables', sub: 'Nominale, ordinale, quantitative', html: `
${def('Variable nominale', '<p><b>Pas d\'ordre implicite</b> : patronyme, fruit, nom de ville… Une seule opération implicite : <b>égal ou différent</b>. On peut cependant calculer un ordre : un <b>ordre arbitraire</b> (classer les patronymes par ordre alphabétique) ou un ordre tiré d\'<b>une autre variable</b> (classer les fruits par ordre de prix).</p>')}
${def('Variable ordinale', '<p><b>Ordre implicite</b>, mais elle <b>ne peut pas être traitée arithmétiquement</b> : taille de vêtement, mention de diplôme… (l\'écart entre « Bien » et « Très bien » n\'est pas un nombre).</p>')}
${def('Variable quantitative', '<p><b>Ordre explicite</b> et <b>comparaison arithmétique</b> possible (différences, rapports) : longueur, poids, température, prix, nombre de produits vendus…</p>')}
<h4>Statistique et visualisation : deux vocabulaires</h4>
<table class="t"><thead><tr><th>Statistique</th><th>Visualisation</th><th>en anglais</th></tr></thead><tbody>
<tr><td>qualitative nominale</td><td>nominale</td><td>categorical attribute</td></tr>
<tr><td>qualitative ordinale</td><td rowspan="2">ordonnée : ordinale ou quantitative</td><td rowspan="2">ordered attribute : ordinal / quantitative</td></tr>
<tr><td>quantitative (discrète ou continue)</td></tr></tbody></table>
${warn('l\'ordinale change de camp', '<p>En statistique, l\'ordinale est rangée avec la nominale (qualitative). En visualisation, elle est rangée avec la quantitative, parmi les variables <b>ordonnées</b>, parce qu\'elle se représente presque avec les mêmes variables visuelles.</p>')}
` },
      { id: 'catalogue', t: 'Le catalogue des graphiques', sub: 'Que représente chaque axe, chaque couleur ?', html: `
<p>Pour chaque graphique, il faut savoir dire <b>combien de variables de chaque type</b> il représente, et <b>avec quoi</b> (axe, couleur, taille…). Clique sur les vignettes :</p>
${demo('charts')}
<h4>Une nominale (ou ordinale) et une quantitative</h4>
<ul><li><b>Diagramme en barres</b> : abscisses = 1 nominale ou ordinale ; ordonnées = 1 quantitative. L'<b>histogramme</b> est un diagramme en barres dont les barres représentent les effectifs de classes de valeurs.</li><li><b>Diagramme en secteurs</b> (camembert) : secteurs / couleurs = 1 nominale ; taille des secteurs = 1 quantitative.</li></ul>
<h4>Deux nominales (ou ordinales) et une quantitative</h4>
<ul><li><b>Table surlignée</b> : abscisses = 1 nominale ou ordinale ; ordonnées = 1 nominale ou ordinale ; couleur = 1 quantitative.</li><li><b>Diagramme en barres empilées</b> : abscisses = 1 nominale ou ordinale ; ordonnées = 1 quantitative ; couleurs = 1 nominale.</li><li><b>Diagramme en barres côte à côte</b> : abscisses et couleur = 2 nominales ou ordinales ; ordonnées = 1 quantitative.</li></ul>
<h4>Une évolution (souvent dans le temps)</h4>
<ul><li><b>Diagramme en lignes</b> : abscisses = 1 quantitative (souvent une date) ; ordonnées = 1 quantitative ; lignes / couleurs = 1 nominale (une ligne par catégorie).</li><li><b>Diagramme en aires empilées</b> : mêmes variables, les aires de chaque catégorie s'empilent.</li><li><b>Diagramme en flots</b> (streamgraph) : mêmes variables, les aires s'empilent autour d'un axe central.</li></ul>
<h4>Plusieurs quantitatives</h4>
<ul><li><b>Nuage de points</b> : abscisses = 1 quantitative ; ordonnées = 1 quantitative.</li><li><b>Matrice de nuages de points</b> : n quantitatives en abscisse et en ordonnée, un nuage par paire de variables.</li><li><b>Coordonnées parallèles</b> : les individus sont des lignes ; axes verticaux = n quantitatives. Avantage : beaucoup de variables grâce à la position ; inconvénient : on compare mal deux variables dont les axes ne sont pas voisins (TP 5).</li><li><b>Diagramme de Kiviat</b> (radar) : les individus sont des lignes ; axes circulaires = n quantitatives.</li></ul>
` },
      { id: 'comparer', t: 'Comparer deux graphiques', sub: 'Barres empilées ou côte à côte (TD, exercice 2)', html: `
<p>Les deux représentent 1 quantitative et 2 nominales/ordinales. Le bon choix dépend de la tâche.</p>
<table class="t"><thead><tr><th></th><th>Empilées</th><th>Côte à côte</th></tr></thead><tbody>
<tr><th>Avantages</th><td>total de chaque barre lisible directement ; compact ; la catégorie du bas (alignée sur l'axe) se compare bien</td><td>toutes les barres partent de l'axe : comparaison précise de chaque valeur</td></tr>
<tr><th>Inconvénients</th><td>segments supérieurs sans base commune, difficiles à comparer</td><td>total non visible ; graphique large et chargé si beaucoup de modalités</td></tr></tbody></table>
` },
    ],
    keep: [
      'Table : lignes = individus, colonnes = variables, cellule (i, j) = valeur de j pour i.',
      'Nominale (=, ≠ ; ordre arbitraire ou calculé possible) ; ordinale (ordre sans arithmétique) ; quantitative (ordre et arithmétique).',
      'En visualisation : nominale / ordonnée (ordinale + quantitative).',
      'Connaître pour chaque graphique les variables représentées par chaque axe et par la couleur.',
    ],
  },
  /* ===================================================================== */
  {
    id: 'l3', ch: 'vv1', short: 'Variables visuelles (1)', src: 'CM 3',
    t: 'Variables visuelles (1) : taille, forme, position',
    sub: 'Les composantes de l\'apparence des objets graphiques qui représentent les variables, et le type de variable que chacune peut représenter.',
    goals: [
      'Définir objet graphique et variable visuelle.',
      'Dire si une propriété est ou non une variable visuelle dans un graphique donné.',
      'Justifier quelles variables visuelles conviennent aux variables nominales, ordinales, quantitatives.',
    ],
    sections: [
      { id: 'choisir', t: 'Lequel choisir ?', sub: 'Treemap ou diagramme en barres', html: `
<p>Le CM part de deux graphiques des profits par catégorie (fournitures de bureau, mobilier, produits technologiques) : une <b>treemap</b> et un <b>diagramme en barres</b>. Qu'est-ce qui représente la somme des profits ? Dans les deux cas, la <b>couleur</b> ; en plus, l'<b>aire des rectangles</b> dans la treemap et la <b>longueur des barres</b> dans le diagramme.</p>
<p>D'où la question : <b>vaut-il mieux représenter une variable quantitative avec des aires ou des longueurs ?</b> Réponse au CM 4 (efficacité) : les longueurs.</p>
` },
      { id: 'objets', t: 'Objets graphiques et variables visuelles', sub: 'Définitions', html: `
${def('Objet graphique', '<p>Une visualisation est composée d\'objets graphiques (des rectangles dans les deux exemples, mais aussi des points, des lignes…). L\'<b>apparence</b> des objets graphiques représente les variables du jeu de données.</p>')}
${ex('les deux graphiques', '<ul><li>Diagramme en barres : longueurs et couleurs des rectangles représentent les profits.</li><li>Treemap : aires et couleurs des rectangles représentent les profits.</li></ul>')}
${def('Variable visuelle', '<p>Une composante de l\'apparence des objets graphiques qui <b>représente une variable</b> du jeu de données. Les variables visuelles <b>déterminent l\'aspect</b> des objets graphiques et <b>représentent des variables</b> des données.</p>')}
<p>Liste de base : <b>taille 1D</b> (longueur), <b>taille 2D</b> (aire), <b>couleur</b>, <b>forme</b>, <b>position x</b>, <b>position y</b>.</p>
${ex('nuage de points des ventes', '<p>Taille 2D (aire) = profit ; couleur = pays ; forme = catégorie ; position x = ventes ; position y = profit.</p>')}
${warn('une propriété qui ne représente rien n\'est pas une variable visuelle', '<p>Dans un nuage où tous les points sont des ronds, la forme n\'est <b>pas</b> une variable visuelle : elle ne représente aucune variable.</p>')}
` },
      { id: 'types', t: 'Quels types de données pour quelles variables visuelles ?', sub: 'Le raisonnement, variable visuelle par variable visuelle', html: `
<p>Dans le nuage précédent : aire (profit) et positions (ventes, profit) représentent des <b>quantitatives</b> ; couleur (pays) et forme (catégorie) des <b>nominales</b>. Mais la couleur peut aussi représenter une quantitative (palette dégradée), et la position une nominale (les catégories le long de l'axe d'un diagramme en barres). Il faut donc raisonner sur ce que chaque variable visuelle <b>peut</b> représenter.</p>
<h4>Taille (longueur, aire)</h4>
<p>Une taille est <b>ordonnée</b> : on voit qu'un trait est plus long qu'un autre. Elle convient à une <b>quantitative</b>, <b>éventuellement</b> à une <b>ordinale</b> (des carrés de plus en plus grands pour S, M, L, XL), mais <b>pas à une nominale</b> : la taille suggérerait un ordre qui n'existe pas.</p>
<h4>Forme</h4>
<p>« Est-ce qu'un long trait est supérieur à un court ? » Oui (taille 1D). « Est-ce qu'une croix est supérieure à un rond ? » Non. Il n'y a <b>pas d'ordre implicite sur les formes</b> : on les utilise pour des <b>nominales</b>, pas pour des ordonnées.</p>
<h4>Position</h4>
<p>Pour une <b>ordinale</b> : oui (les modalités dans leur ordre le long d'un axe). Pour une <b>nominale</b> : <b>éventuellement</b>, car la position impose un ordre ; on utilise alors un <b>ordre conventionnel</b> (par exemple alphabétique) ou un <b>ordre calculé à partir d'une autre variable</b> (trier les barres par valeur).</p>
` },
      { id: 'formes', t: 'Types de formes', sub: 'Géométriques et symboliques', html: `
<ul><li><b>Formes géométriques</b>, abstraites : cercle, carré, triangle, pentagone, octogone, ellipse, trapèze…</li><li><b>Formes symboliques</b>, de plus en plus parlantes : <b>conventionnelles</b> (le symbole ®), <b>évocatrices</b> (une fourchette et un couteau pour un restaurant), <b>figuratives</b> (une personne attablée).</li></ul>
` },
      { id: 'recap', t: 'Récapitulatif', sub: 'Le tableau à connaître par cœur', html: `
<table class="t vv-table">${vvHead}<tbody>
${vvRow('Position (1D ou 2D)', 'e', 'o', 'o')}${vvRow('Taille 1D', 'n', 'e', 'o')}${vvRow('Taille 2D', 'n', 'e', 'o')}${vvRow('Forme', 'o', 'n', 'n')}</tbody></table>
` },
      { id: 'autres', t: 'Autres variables visuelles', sub: '3D, orientation, grain, texture, mouvement… et la couleur', html: `
<p>Un graphique en 3D ajoute la <b>position 3D</b> et la <b>taille 3D</b> (volume), qui se comportent comme leurs équivalents 2D :</p>
<table class="t vv-table">${vvHead}<tbody>
${vvRow('Position 1D ou 2D', 'e', 'o', 'o')}${vvRow('Position 3D', 'e', 'o', 'o')}${vvRow('Taille 1D', 'n', 'e', 'o')}${vvRow('Taille 2D', 'n', 'e', 'o')}${vvRow('Taille 3D', 'n', 'e', 'o')}${vvRow('Forme', 'o', 'n', 'n')}</tbody></table>
<p>Il existe aussi l'<b>orientation</b>, le <b>grain</b>, la <b>texture</b>, le <b>mouvement</b>… et bien sûr la <b>couleur</b>, sujet du CM 4.</p>
${demo('area')}
` },
    ],
    keep: [
      'Variable visuelle = composante de l\'apparence d\'un objet graphique qui représente une variable.',
      'Taille : quantitative (oui), ordinale (éventuellement), nominale (non).',
      'Forme : nominale seulement (pas d\'ordre implicite).',
      'Position : ordonnées (oui), nominale (éventuellement, avec un ordre conventionnel ou calculé).',
    ],
  },
  /* ===================================================================== */
  {
    id: 'l4', ch: 'vv2', short: 'Couleur & efficacité', src: 'CM 4',
    t: 'Variables visuelles (2) : la couleur, l\'efficacité, la combinaison',
    sub: 'Les palettes et les modèles colorimétriques, le tableau complet des variables visuelles, leur classement par efficacité et la séparabilité.',
    goals: [
      'Choisir la bonne palette (séquentielle, divergente, qualitative) pour une variable.',
      'Expliquer avec le modèle TSL ce que fait varier chaque palette.',
      'Dire si deux palettes peuvent être combinées.',
      'Classer les variables visuelles par efficacité pour chaque type de variable.',
    ],
    sections: [
      { id: 'rappel', t: 'Rappel', sub: 'Une variable visuelle par variable', html: `
<p>Une visualisation est composée d'objets graphiques dont les variables visuelles représentent les variables des données : un diagramme en barres (1 variable → taille 1D, 1 → position X), un nuage de points (1 → position X, 1 → position Y, 1 → couleur, 1 → taille 2D)…</p>
<p>La couleur peut représenter une variable <b>nominale</b> (des continents) comme une variable <b>quantitative</b> (une densité de population). Tout dépend de la <b>palette</b>.</p>
` },
      { id: 'palettes', t: 'Quelle palette utiliser ?', sub: 'Séquentielle, divergente, qualitative', html: `
${demo('palettes')}
${def('Palette séquentielle', '<p>Pour une variable <b>quantitative ou ordinale</b>. On fait varier la <b>luminosité</b> (et/ou la saturation) ; on peut faire varier légèrement la teinte.</p>')}
${def('Palette divergente', '<p>Pour une variable <b>quantitative</b>, <b>seulement si les mesures comportent une valeur « pivot »</b>. Deux teintes, et la luminosité varie sur chacune. Exemples : relief (profondeur – niveau de la mer – altitude), température (négatif – 0° – positif), profit (négatif – 0 – positif).</p>')}
${def('Palette qualitative', '<p>Pour une variable <b>nominale</b>. On fait varier la <b>teinte</b> ; luminosité et saturation identiques.</p>')}
<table class="t vv-table"><thead><tr><th>Palette</th><th>Nominale</th><th>Ordinale</th><th>Quantitative</th></tr></thead><tbody>
${vvRow('Séquentielle', 'n', 'o', 'o')}${vvRow('Divergente', 'n', 'n', 'o')}${vvRow('Qualitative', 'o', 'n', 'n')}</tbody></table>
` },
      { id: 'modeles', t: 'Modèles colorimétriques', sub: 'RVB et TSL', html: `
${def('Modèle colorimétrique', '<p>Un modèle permettant de coder les couleurs en informatique : chaque couleur correspond à des valeurs numériques.</p>')}
<h4>Rouge Vert Bleu (RVB)</h4>
<p>Trois valeurs entre 0 et 255 : quantité de rouge, de vert, de bleu ; leur combinaison donne toutes les autres couleurs (synthèse additive : rouge + vert = jaune, vert + bleu = cyan, rouge + bleu = magenta, les trois = blanc).</p>
${ex('les codes du CM', '<p>0,255,0 = vert ; 0,128,0 = vert foncé ; 255,0,255 = magenta ; 0,0,0 = noir ; 255,255,255 = blanc ; 128,128,128 = gris.</p>')}
<p>Ce modèle correspond au fonctionnement des écrans, mais <b>n'aide pas à caractériser les types de palettes</b>.</p>
<h4>Teinte Saturation Luminosité (TSL)</h4>
<p>Trois valeurs : la <b>teinte</b> (la couleur « pure » : rouge, bleu…), la <b>saturation</b> (de terne à vive), la <b>luminosité</b> (de sombre à clair).</p>
<table class="t vv-table"><thead><tr><th>Composante</th><th>Nominale</th><th>Ordinale</th><th>Quantitative</th></tr></thead><tbody>
${vvRow('Teinte', 'o', 'n', 'n')}${vvRow('Saturation', 'n', 'o', 'o')}${vvRow('Luminosité', 'n', 'o', 'o')}</tbody></table>
<p>D'où ce que fait varier chaque palette : <b>séquentielle → luminosité (ou saturation)</b> ; <b>divergente → teinte et luminosité</b> ; <b>qualitative → teinte</b>.</p>
${demo('color')}
` },
      { id: 'combiner', t: 'Combiner deux palettes', sub: 'Les six cas', html: `
<p>Peut-on représenter deux variables par deux palettes sur les mêmes objets ?</p>
<table class="t"><thead><tr><th>Cas</th><th>Palettes</th><th>Réponse</th><th>L'idée</th></tr></thead><tbody>
<tr><td>1</td><td>qualitative + qualitative</td><td class="no">Non</td><td>les deux jouent sur la teinte</td></tr>
<tr><td>2</td><td>séquentielle + séquentielle</td><td class="maybe">Éventuellement</td><td>par exemple luminosité pour l'une, saturation pour l'autre, mais la lecture devient difficile</td></tr>
<tr><td>3</td><td>divergente + divergente</td><td class="maybe">Éventuellement</td><td>même difficulté</td></tr>
<tr><td>4</td><td>qualitative + séquentielle</td><td class="yes">Oui</td><td>teinte et luminosité varient indépendamment</td></tr>
<tr><td>5</td><td>séquentielle + divergente</td><td class="maybe">Éventuellement</td><td>la divergente utilise déjà la luminosité</td></tr>
<tr><td>6</td><td>divergente + qualitative</td><td class="no">Non</td><td>la divergente utilise déjà des teintes</td></tr></tbody></table>
` },
      { id: 'pratique', t: 'Bonnes pratiques', sub: 'ColorBrewer, saturation, daltonisme', html: `
<ul><li><b>Où trouver des palettes ?</b> ColorBrewer 2.0 (colorbrewer2.org).</li><li><b>Aire et saturation</b> (palette qualitative) : pour de <b>grosses zones</b>, des couleurs <b>non saturées</b> ; pour de <b>petites zones</b>, des couleurs <b>saturées</b> (une grande surface très saturée agresse et écrase le reste).</li><li><b>Daltonisme et impression en noir et blanc</b> (outil Viz Palette) : une palette qualitative peut être distinguable par les personnes daltoniennes mais pas imprimée en noir et blanc, et une autre l'inverse (rouge et vert indistinguables en deutéranopie, mais de luminosités différentes en N&amp;B). Il faut vérifier les deux.</li></ul>
` },
      { id: 'tableau', t: 'Le tableau complet', sub: 'Toutes les variables visuelles du cours', html: `
<table class="t vv-table">${vvHead}<tbody>
${vvRow('Position 1D ou 2D', 'e', 'o', 'o')}${vvRow('Position 3D', 'e', 'o', 'o')}${vvRow('Taille 1D', 'n', 'e', 'o')}${vvRow('Taille 2D', 'n', 'e', 'o')}${vvRow('Taille 3D', 'n', 'e', 'o')}${vvRow('Forme', 'o', 'n', 'n')}${vvRow('Couleur, palette qualitative', 'o', 'n', 'n')}${vvRow('Couleur, palette séquentielle', 'n', 'o', 'o')}${vvRow('Couleur, palette divergente', 'n', 'n', 'o')}</tbody></table>
` },
      { id: 'efficacite', t: 'Efficacité', sub: 'Classer les variables visuelles', html: `
<p>Toutes les variables visuelles adaptées ne se valent pas : certaines sont lues plus vite et plus exactement. Classement du plus au moins efficace :</p>
${demo('ranking')}
<ul><li><b>Nominale</b> : couleur (palette qualitative), forme, position (<i>avec ordre conventionnel ou calculé</i>).</li><li><b>Ordinale</b> : position 1D ou 2D, taille 1D, taille 2D, position 3D, couleur (palette séquentielle), taille 3D. Les tailles seulement <i>si les données s'y prêtent</i> : tailles d'habits, oui ; mention à un diplôme, non.</li><li><b>Quantitative</b> : position 1D ou 2D, taille 1D, taille 2D, position 3D, couleur (palette séquentielle, ou divergente <i>si valeur « pivot »</i>), taille 3D.</li></ul>
${prop('Aire ou longueur ?', '<p>Réponse à la question du CM 3 : pour une quantitative, la <b>longueur</b> (taille 1D) est plus efficace que l\'aire (taille 2D). Le diagramme en barres l\'emporte sur la treemap pour comparer les profits.</p>')}
${prop('Variables ordonnées', '<p>Les variables visuelles pour représenter les variables ordinales et quantitatives sont <b>quasiment les mêmes</b> : d\'où le regroupement en variables « ordonnées », contrairement au vocabulaire statistique.</p>')}
` },
      { id: 'combinaison', t: 'Combinaison et séparabilité', sub: 'Plusieurs variables sur les mêmes objets', html: `
<p>On combine des variables visuelles pour représenter plusieurs variables avec les mêmes objets :</p>
<ul><li>2 variables nominales : teinte + forme (cercles et triangles de 3 couleurs) ;</li><li>1 nominale + 1 ordonnée : teinte + taille ;</li><li>2 ordonnées : luminosité + taille.</li></ul>
${def('Séparabilité', '<p>Toutes les variables visuelles ne sont pas indépendantes : certaines combinaisons se lisent séparément, d\'autres se confondent.</p>')}
${demo('separability')}
<ul><li><b>Faible séparabilité</b> : largeur + hauteur (on perçoit une forme ou une aire globale, pas deux valeurs).</li><li><b>Intermédiaire</b> : taille + teinte.</li><li><b>Forte séparabilité</b> : position + teinte.</li></ul>
` },
    ],
    keep: [
      'Séquentielle → ordinale ou quantitative (luminosité) ; divergente → quantitative avec pivot (2 teintes + luminosité) ; qualitative → nominale (teinte).',
      'TSL : teinte → nominale ; saturation et luminosité → ordonnées.',
      'Combiner : quali + séq oui ; quali + quali et div + quali non ; les autres éventuellement.',
      'Grosses zones : peu saturé ; petites zones : saturé. Vérifier daltonisme et N&B.',
      'Efficacité : la position d\'abord ; la longueur avant l\'aire, l\'aire avant le volume.',
    ],
  },
  /* ===================================================================== */
  {
    id: 'l5', ch: 'tp', short: 'SVG, JS, D3', src: 'TP 1 à 5',
    t: 'Programmer une visualisation : SVG, JavaScript, D3',
    sub: 'Les notions des TP, expliquées. Le code cité est uniquement celui des supports de l\'enseignant ; pour t\'entraîner, utilise l\'onglet « TP · labo de code ».',
    goals: [
      'Expliquer la différence entre image vectorielle et matricielle, et le repère SVG.',
      'Expliquer le rôle des échelles, des axes, du zoom et du brush en D3.',
      'Décrire la sémiologie des visualisations des TP 4 et 5.',
    ],
    sections: [
      { id: 'svg', t: 'SVG', sub: 'Vectoriel, repère, objets (TP 1)', html: `
${def('Image vectorielle', '<p>Un ensemble d\'objets géométriques (points, lignes, polygones) munis de propriétés (position, couleur…) et de transformations (translations, rotations, redimensionnement). Le logiciel calcule le rendu : l\'image reste <b>nette à tout niveau de zoom</b>. À l\'inverse, une image <b>matricielle</b> (bitmap : PNG, JPEG, GIF) est une grille de pixels ; zoomée, elle se pixellise.</p>')}
<p>Le <b>SVG</b> (Scalable Vector Graphics) est un format vectoriel basé sur XML, normalisé par le W3C, affiché directement par les navigateurs. Ses objets et leurs propriétés jouent exactement le rôle des objets graphiques et des variables visuelles du cours.</p>
${warn('le repère SVG', '<p>L\'origine est <b>en haut à gauche</b> et l\'axe y <b>descend</b> : augmenter y déplace un objet vers le bas. Conséquence pour les graphiques : une barre de hauteur h posée sur une ligne de base y<sub>0</sub> commence en y = y<sub>0</sub> − h.</p>')}
${demo('svgframe')}
<p>Objets vus en TP : <code>circle</code> (centre <code>cx</code>, <code>cy</code>, rayon <code>r</code>), <code>line</code>, <code>path</code> (attribut <code>d</code> : M pour se déplacer, L pour tracer une ligne, C pour une courbe, Z pour fermer), <code>polygon</code>, <code>rect</code> (<code>x</code>, <code>y</code> = coin en haut à gauche), <code>text</code>, et <code>g</code> pour grouper des objets et leur appliquer une transformation commune. Propriétés : <code>fill</code>, <code>stroke</code>, <code>stroke-width</code>, <code>stroke-linecap</code>, <code>fill-opacity</code>.</p>
${code('TP1 p. 2', `<circle cx="100" cy="100"
        r="100"
        fill="yellow"
        stroke="orange"
        stroke-width=2px
/>`)}
` },
      { id: 'js', t: 'JavaScript', sub: 'Charger, transformer, dessiner (TP 2)', html: `
<ul><li>On charge un fichier JSON avec jQuery (<code>$.ajax</code>, fonction <code>success</code>), au chargement de la page (<code>&lt;body onload="…"&gt;</code>).</li><li>Les données chargées contiennent rarement les valeurs à afficher : il faut souvent les <b>transformer</b> avant de dessiner (compter les lettres dans <code>barLengths</code>).</li><li>On construit le code SVG dans une chaîne de caractères, puis on l'insère avec <code>.html(str)</code>.</li><li>Interaction : évènements <code>onmouseover</code> / <code>onmouseleave</code> pour afficher et effacer une infobulle.</li></ul>
${warn('portée des variables', '<p>Une variable déclarée dans une fonction est <b>locale</b> : <code>data</code> n\'existe pas dans <code>drawInfobulle()</code> (« data is not defined »). Le TP déclare donc une variable globale <code>dataGlobale</code>, remplie après le chargement.</p>')}
<p>Limite : les axes sont écrits en dur dans le HTML, donc le graphique ne s'adapte pas aux données (une lettre après F, une valeur au-delà de 420). D3 résout ce problème.</p>
` },
      { id: 'd3', t: 'D3 : échelles et axes', sub: 'Des axes qui s\'adaptent aux données (TP 3)', html: `
<p><b>D3.js</b> (Data-Driven Documents) : très flexible mais bas niveau. Pour une visualisation basique, une librairie de plus haut niveau (vis.js) suffit ; pour une visualisation spécifique ou innovante, D3.</p>
${def('Échelle', '<p>Un objet qui transforme une valeur de l\'intervalle de départ (<code>domain</code>) en une valeur de l\'intervalle d\'arrivée (<code>range</code>).</p>')}
${code('TP3 p. 2', `var scale = d3.scaleLinear();
scale.domain([0,10]);
scale.range([0,1000]);`)}
<p>Ici <code>scale(2)</code> = 200 et <code>scale(7.5)</code> = 750. Avec un range [100,1100], <code>scale(5)</code> = 600.</p>
<ul><li><code>d3.scaleBand()</code> : domaine de valeurs <b>discrètes</b>, réparties uniformément sur le range ; <code>bandwidth()</code> donne la largeur d'une bande. ["A","B","C","D","E"] sur [0,1000] : 0, 200, 400, 600, 800.</li><li><code>d3.scaleLog()</code> (TP 4) : pour des valeurs très étalées ; log(0) n'existe pas, donc domaine à partir de 1 et pas de valeur nulle.</li><li><code>d3.scaleOrdinal(d3.schemeCategory10)</code> : une échelle de couleurs pour une variable nominale (palette qualitative).</li></ul>
${demo('scales')}
${warn('inverser le range de l\'axe Y', '<p>Comme l\'axe y du SVG descend, l\'axe Y créé avec un range [0,450] a ses étiquettes inversées : on utilise le range <b>[450,0]</b>. La hauteur d\'une barre devient alors 450 − scaleY(valeur).</p>')}
<p>Les axes se créent avec <code>d3.axisBottom</code>, <code>d3.axisLeft</code> (ou <code>axisTop</code>, <code>axisRight</code>) à partir d'une échelle, s'ajoutent dans un <code>g</code> avec <code>call</code>, et se placent avec une translation.</p>
` },
      { id: 'interaction', t: 'D3 : zoom, lignes, brush', sub: 'Interaction et sélection (TP 3 à 5)', html: `
<ul><li><b>Zoom</b> : tous les <code>g</code> sont placés dans un <code>gGlobal</code> ; <code>d3.zoom()</code> applique la transformation courante à <code>gGlobal</code> (molette pour zoomer, glisser pour déplacer).</li><li><b>Lignes</b> : <code>d3.line()</code> transforme un tableau de points en attribut <code>d</code> d'un chemin.</li><li><b>Brush</b> : <code>d3.brush()</code> permet de tracer un rectangle de sélection ; <code>selection[0]</code> est son coin en haut à gauche, <code>selection[1]</code> son coin en bas à droite. On compare la position de chaque objet au rectangle pour le mettre en surbrillance (opacité).</li></ul>
${code('TP3 p. 7', `var z = d3.zoom();
z.on("zoom", function({transform}){
	gGlobal.attr("transform", transform);
});
svg.call(z);`)}
<p>La sélection sert à lancer des calculs sur une partie des données, à mettre en surbrillance les éléments sélectionnés dans d'autres vues, ou à afficher le détail d'une liste d'éléments.</p>
` },
      { id: 'semiologie', t: 'La sémiologie des TP', sub: 'Les visualisations décrites avec le vocabulaire du cours', html: `
<h4>TP 4 : nuage de points COVID-19</h4>
<p>Implantation <b>ponctuelle</b> : chaque point (un triangle) représente un pays. Variables visuelles : <b>position x</b> = nombre de cas (<code>total_cases</code>) ; <b>position y</b> = nombre de morts (<code>total_deaths</code>), en échelles logarithmiques ; <b>orientation</b> du triangle = présence ou non de nouveaux cas (<code>new_cases</code>) ; <b>teinte</b> = continent. Quatre variables. La forme triangle elle-même ne représente rien : c'est son orientation qui code la donnée.</p>
<h4>TP 5 : coordonnées parallèles des iris</h4>
<p>Implantation <b>linéaire</b> : chaque ligne représente un iris. <b>Positions x</b> des points de la ligne = les variables quantitatives ; <b>positions y</b> = leurs valeurs ; <b>teinte</b> de la ligne = espèce. Avantage : beaucoup de variables grâce à la position ; inconvénient : on ne compare bien que des axes consécutifs, d'où l'intérêt du brush.</p>
${prop('Pour l\'examen', '<p>Il faut savoir implémenter les visualisations des séances. Tous les codes faits en exemple sont autorisés, mais les consignes ne seront pas détaillées comme dans les supports, et seuls les codes fournis par l\'enseignant sont acceptés.</p>')}
` },
    ],
    keep: [
      'SVG : vectoriel, origine en haut à gauche, y vers le bas.',
      'Échelle D3 : domain → range ; scaleLinear, scaleBand (bandwidth), scaleLog, scaleOrdinal.',
      'Axe Y : range inversé [450,0].',
      'Zoom : gGlobal + d3.zoom ; brush : selection[0] et selection[1].',
      'TP 4 : position x, position y, orientation, teinte ; TP 5 : positions x et y, teinte.',
    ],
  },
];
