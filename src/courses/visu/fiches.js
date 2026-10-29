// Fiches de cours (HTML). Les <figure class="viz" data-viz="…"> sont des illustrations interactives (viz.js).
export const chapters = [
  { id: 'intro', name: 'Introduction' },
  { id: 'tables', name: 'Tables & organisation spatiale' },
  { id: 'vv1', name: 'Variables visuelles (1)' },
  { id: 'vv2', name: 'Couleur & efficacité' },
  { id: 'tp', name: 'TP : SVG, JS, D3' },
];

export const fiches = {
intro: `
<p class="lead">Une visualisation part d'un <b>jeu de données</b> et est conçue pour aider à accomplir des <b>tâches</b> de façon <b>efficace</b> (en temps et en exactitude), grâce à une ou plusieurs représentations visuelles : des <b>vues</b>, composées d'<b>idiomes</b>.</p>
<div class="grid2">
  <div><h3>Deux objectifs</h3><ul>
    <li><b>Présenter</b> des résultats connus. Exemple : la carte de <b>Minard</b> (1869) de la campagne de Russie, 6 dimensions : taille, position en 2D et direction de l'armée, températures, dates.</li>
    <li><b>Analyser et explorer</b> des données. Exemples : la carte du choléra de <b>John Snow</b> (Londres, 1854-1855) ; le <b>quartet d'Anscombe</b>.</li>
  </ul></div>
  <div><h3>En informatique</h3><ul>
    <li>Une <b>application</b> informatique ;</li>
    <li>une visualisation avec des <b>vues coordonnées / interactives</b> ;</li>
    <li>utilisée pour <b>automatiser</b> la génération des représentations.</li>
  </ul></div>
</div>
<figure class="viz" data-viz="anscombe"></figure>
<h3>Concevoir une visualisation : un compromis</h3>
<ul>
  <li>Proposer une ou plusieurs vues ; pour chaque vue, choisir les <b>idiomes</b> : <b>encodages visuels</b> (diagramme en barres, camembert…) et <b>techniques d'interaction</b> (filtres, sélections…).</li>
  <li>L'espace des possibilités est <b>vaste</b> et la plupart sont <b>inefficaces</b> pour une tâche donnée : il faut faire des <b>compromis</b>.</li>
  <li>Exemple des notes : dans le tableau brut, on ne trouve pas vite la plus haute note ; le tableau coloré et le diagramme en barres la montrent ; le diagramme en barres ne montre pas la médiane ; pour le minimum, les quartiles et le maximum, le CM utilise le tableau coloré avec sa légende.</li>
</ul>
<figure class="viz" data-viz="notes"></figure>
<h3>Quoi ? Pourquoi ? Comment ? (Munzner)</h3>
<table class="t">
<thead><tr><th>Question</th><th>Porte sur</th><th>On se demande</th></tr></thead>
<tbody>
<tr><td><b>Quoi ?</b> (What)</td><td>les <b>données</b></td><td>Quelles sont les données à visualiser ?</td></tr>
<tr><td><b>Pourquoi ?</b> (Why)</td><td>les <b>tâches</b></td><td>Pourquoi les utilisateurs ont-ils besoin de visualiser ?</td></tr>
<tr><td><b>Comment ?</b> (How)</td><td>les <b>idiomes</b></td><td>Comment visualiser ces données ?</td></tr>
</tbody></table>
<h3>Quoi ? Les données</h3>
<ul>
  <li><b>Sémantique</b> : ce que les données représentent dans le monde réel (un mot est-il un nom, un acronyme, une ville ? un nombre est-il un âge, un code, une position ?).</li>
  <li><b>Type</b> : interprétation structurelle ou mathématique (individus, variables, nœuds, liens…), façon dont les types sont combinés (tables, graphes…) et <b>opérations</b> possibles. Faire la moyenne de codes postaux n'a pas de sens : ce sont des nombres, mais la variable est <b>nominale</b>.</li>
  <li><b>Types de jeux de données</b> : <b>tables</b> (individus × variables, voire table multidimensionnelle), <b>réseaux et arbres</b> (nœuds, liens), <b>champs</b> (grille de positions, valeurs continues), <b>géométrie</b> (positions spatiales), et aussi groupes, ensembles, listes. Disponibilité : <b>statique</b> ou <b>dynamique</b>.</li>
  <li><b>Types de variables</b> : <b>catégorielle</b> (nominale) ou <b>ordonnée</b>, elle-même <b>ordinale</b> ou <b>quantitative</b>. Sens de l'ordre : <b>séquentiel</b>, <b>divergent</b>, <b>cyclique</b>.</li>
  <li>Au semestre 1 : les <b>tables</b> (CM 2) et les <b>variables visuelles</b> (CM 3 et 4). Au semestre 2 : réseaux, champs, géométries, et les actions manipuler, connecter, réduire.</li>
</ul>
<h3>Pourquoi ? Les tâches</h3>
<ul>
  <li>Comprendre les besoins des utilisateurs, puis les traduire en <b>tâches abstraites</b>, indépendantes du domaine et exprimées dans le vocabulaire de la visualisation. Exemple : « trouver le chemin le plus rapide de la ville A à la ville B sur la carte routière » devient « rechercher le plus court chemin dans un graphe multivarié ».</li>
  <li>Intérêt : une tâche plus générique donne accès aux solutions des autres domaines (le plus court chemin sert aussi en analyse de réseaux sociaux) et permet de diffuser le résultat.</li>
  <li>Une tâche = une <b>action</b> (« rechercher ») + une <b>cible</b> (« chemin dans un graphe »).</li>
</ul>
<div class="grid2">
  <div><h3>Actions</h3><ul>
    <li><b>Analyser</b> : consommer (découvrir, présenter, apprécier) ou produire (annoter, enregistrer, dériver).</li>
    <li><b>Rechercher</b> selon qu'on connaît la cible et sa position : <i>lookup</i> (cible et position connues), <i>browse</i> (position connue, cible non), <i>locate</i> (cible connue, position non), <i>explore</i> (ni l'une ni l'autre).</li>
    <li><b>Requêter</b> : identifier (un élément), comparer (quelques-uns), résumer (tous).</li>
  </ul></div>
  <div><h3>Cibles</h3><ul>
    <li><b>Toutes les données</b> : tendances, valeurs aberrantes, caractéristiques.</li>
    <li><b>Variables</b> : une (distribution, extrêmes) ou plusieurs (dépendance, corrélation, similarité).</li>
    <li><b>Réseaux</b> : topologie, chemins. <b>Données spatiales</b> : forme.</li>
  </ul></div>
</div>
<h3>Comment ? Les idiomes</h3>
<ul>
  <li><b>Encoder</b> : <i>arranger</i> dans l'espace (exprimer, séparer, ordonner, aligner, utiliser) et <i>associer</i> (map) les variables à la couleur (teinte, saturation, luminance), à la taille, l'angle, la courbure, à la forme, au mouvement.</li>
  <li><b>Manipuler</b> : changer, sélectionner, naviguer.</li>
  <li><b>Facettes</b> : juxtaposer, partitionner, superposer.</li>
  <li><b>Réduire</b> : filtrer, agréger, intégrer (embed).</li>
</ul>
<p><b>Conclusion.</b> La visualisation d'informations est une « science jeune », sans recette miracle : il faut connaître les visualisations existantes, savoir les utiliser et les combiner. Référence : Tamara Munzner, <i>Visualization Analysis &amp; Design</i> (2014).</p>
`,

tables: `
<h3>Vocabulaire</h3>
<ul>
  <li><b>Jeu de données</b> : ensemble de données sur lequel porte l'analyse (tables, réseaux, champs, géométrie ; seules les tables sont au programme de ce semestre).</li>
  <li><b>Individu</b> (item, élément) : entité particulière de type discret : personnes, actions, gènes, villes, magasins…</li>
  <li><b>Variable</b> (attribut, dimension) : propriété observée, calculée ou enregistrée : salaire, prix, nombre de ventes…</li>
  <li><b>Table</b> : lignes = individus, colonnes = variables ; la cellule (i, j) contient la valeur de la variable j pour l'individu i. On peut ajouter d'autres dimensions (table multidimensionnelle).</li>
</ul>
<h3>Trois types de variables</h3>
<div class="grid2">
  <div><ul>
    <li><span class="key">Nominale</span> : <b>pas d'ordre implicite</b> (patronyme, fruit, nom de ville). Une seule opération : <b>égal ou différent</b>. On peut quand même calculer un ordre : un <b>ordre arbitraire / conventionnel</b> (patronymes par ordre alphabétique) ou un ordre <b>calculé à partir d'une autre variable</b> (fruits classés par prix).</li>
    <li><span class="key">Ordinale</span> : <b>ordre implicite</b>, mais pas d'arithmétique (taille de vêtement, mention de diplôme).</li>
    <li><span class="key">Quantitative</span> : ordre explicite et <b>comparaison arithmétique</b> (longueur, poids, température, prix, nombre de produits vendus).</li>
  </ul></div>
  <div><table class="t">
    <thead><tr><th>Statistique</th><th>Visualisation</th></tr></thead>
    <tbody>
      <tr><td>qualitative nominale</td><td>nominale (<i>categorical</i>)</td></tr>
      <tr><td>qualitative ordinale</td><td rowspan="2">ordonnée (<i>ordered</i>) : ordinale ou quantitative</td></tr>
      <tr><td>quantitative (discrète ou continue)</td></tr>
    </tbody>
  </table>
  <p class="math-note">Piège : en statistique, l'ordinale est rangée avec la nominale (qualitative) ; en visualisation, elle est rangée avec la quantitative (ordonnée), parce qu'elle se représente presque avec les mêmes variables visuelles.</p></div>
</div>
<h3>Comment ? Le catalogue des graphiques pour les tables</h3>
<p>Pour chaque graphique, il faut savoir dire <b>combien de variables de chaque type</b> il représente et <b>avec quoi</b>. Clique sur un graphique :</p>
<figure class="viz" data-viz="charts"></figure>
<table class="t">
<thead><tr><th>Graphique</th><th>Variables représentées</th></tr></thead>
<tbody>
<tr><td>Table surlignée</td><td>abscisses : 1 nominale/ordinale ; ordonnées : 1 nominale/ordinale ; couleur : 1 quantitative</td></tr>
<tr><td>Diagramme en barres</td><td>abscisses : 1 nominale/ordinale ; ordonnées : 1 quantitative</td></tr>
<tr><td>Barres empilées</td><td>abscisses : 1 nominale/ordinale ; ordonnées : 1 quantitative ; couleur : 1 nominale</td></tr>
<tr><td>Barres côte à côte</td><td>abscisses + couleur : 2 nominales/ordinales ; ordonnées : 1 quantitative</td></tr>
<tr><td>Diagramme en secteurs</td><td>secteurs / couleurs : 1 nominale ; taille des secteurs : 1 quantitative</td></tr>
<tr><td>Diagramme en lignes</td><td>abscisses : 1 quantitative (souvent une date) ; ordonnées : 1 quantitative ; lignes / couleurs : 1 nominale</td></tr>
<tr><td>Aires empilées</td><td>abscisses : 1 quantitative (souvent une date) ; ordonnées : 1 quantitative ; aires / couleurs : 1 nominale</td></tr>
<tr><td>Diagramme en flots</td><td>abscisses : 1 quantitative (souvent une date) ; ordonnées : 1 quantitative ; aires / couleurs : 1 nominale</td></tr>
<tr><td>Nuage de points</td><td>abscisses : 1 quantitative ; ordonnées : 1 quantitative</td></tr>
<tr><td>Matrice de nuages de points</td><td>n quantitatives en abscisse et en ordonnée (un nuage par paire)</td></tr>
<tr><td>Coordonnées parallèles</td><td>individus = lignes ; axes verticaux : n quantitatives</td></tr>
<tr><td>Diagramme de Kiviat</td><td>individus = lignes ; axes circulaires : n quantitatives</td></tr>
</tbody></table>
<details class="fold"><summary>Barres empilées ou côte à côte ? (exercice 2 du TD)</summary>
<p style="margin-top:8px">Les deux représentent 1 quantitative et 2 nominales/ordinales. <b>Empilées</b> : on lit directement le <b>total</b> de chaque barre et on compare bien la catégorie du bas (alignée sur l'axe), mais les segments supérieurs n'ont pas de base commune : leurs longueurs se comparent mal. <b>Côte à côte</b> : toutes les barres partent de l'axe, on compare précisément chaque valeur (position sur une échelle commune), mais le total n'est plus visible et le graphique s'élargit quand il y a beaucoup de modalités.</p></details>
`,

vv1: `
<p class="lead">Une visualisation est composée d'<b>objets graphiques</b> (rectangles, points, lignes…). L'apparence de ces objets représente les variables du jeu de données : ce sont les <b>variables visuelles</b>.</p>
<ul>
  <li>Diagramme en barres : la <b>longueur</b> (et la couleur) des rectangles représente les profits ; treemap : leur <b>aire</b> (et leur couleur).</li>
  <li>Les variables visuelles <b>déterminent l'aspect</b> des objets graphiques et <b>représentent des variables</b> des données.</li>
  <li>Liste de base : <b>taille 1D</b> (longueur), <b>taille 2D</b> (aire), <b>couleur</b>, <b>forme</b>, <b>position x</b>, <b>position y</b>. Puis <b>position 3D</b> et <b>taille 3D</b> (volume), et aussi orientation, grain, texture, mouvement.</li>
  <li>Une propriété n'est une variable visuelle que <b>si elle représente une variable</b> : des points tous ronds n'utilisent pas la forme comme variable visuelle.</li>
</ul>
<h3>Quelle variable visuelle pour quel type de variable ?</h3>
<div class="grid2">
<div><ul>
  <li><b>Taille (1D, 2D, 3D)</b> : variable <b>ordonnée</b>. Quantitative : oui ; ordinale : éventuellement (S &lt; M &lt; L &lt; XL) ; nominale : <b>non</b> (une taille suggère un ordre qui n'existe pas).</li>
  <li><b>Forme</b> : variable <b>nominale</b> uniquement. Il n'y a pas d'ordre implicite entre les formes : on peut dire qu'un trait est plus long qu'un autre, pas qu'une croix est « supérieure » à un rond.</li>
  <li><b>Position (1D, 2D, 3D)</b> : quantitative et ordinale : oui ; nominale : <b>éventuellement</b>, avec un <b>ordre conventionnel</b> (alphabétique) ou un ordre <b>calculé à partir d'une autre variable</b>.</li>
</ul></div>
<div><h3 style="margin-top:0">Types de formes</h3><ul>
  <li><b>Géométriques</b> : abstraites (cercle, carré, triangle, pentagone…).</li>
  <li><b>Symboliques</b>, de plus en plus parlantes : <b>conventionnelles</b> (®), <b>évocatrices</b> (fourchette et couteau pour un restaurant), <b>figuratives</b> (une personne attablée).</li>
</ul></div>
</div>
<table class="t vv-table">
<thead><tr><th>Variable visuelle</th><th>Nominale</th><th>Ordinale</th><th>Quantitative</th></tr></thead>
<tbody>
<tr><td>Position 1D ou 2D</td><td class="maybe">Éventuellement</td><td class="yes">Oui</td><td class="yes">Oui</td></tr>
<tr><td>Position 3D</td><td class="maybe">Éventuellement</td><td class="yes">Oui</td><td class="yes">Oui</td></tr>
<tr><td>Taille 1D</td><td class="no">Non</td><td class="maybe">Éventuellement</td><td class="yes">Oui</td></tr>
<tr><td>Taille 2D</td><td class="no">Non</td><td class="maybe">Éventuellement</td><td class="yes">Oui</td></tr>
<tr><td>Taille 3D</td><td class="no">Non</td><td class="maybe">Éventuellement</td><td class="yes">Oui</td></tr>
<tr><td>Forme</td><td class="yes">Oui</td><td class="no">Non</td><td class="no">Non</td></tr>
</tbody></table>
<p class="math-note">La couleur complète ce tableau au CM 4 (palettes qualitative, séquentielle, divergente).</p>
<h3>Aire ou longueur ?</h3>
<p>Les deux peuvent représenter une quantitative, mais on <b>compare beaucoup mieux des longueurs que des aires</b> : la taille 1D est plus efficace que la taille 2D, elle-même plus efficace que la taille 3D. Et une aire doit être <b>proportionnelle</b> à la valeur : pour une valeur double, le côté d'un carré est multiplié par √2, pas par 2 (exercice 4 du TD).</p>
<figure class="viz" data-viz="area"></figure>
`,

vv2: `
<h3>La couleur : trois types de palettes</h3>
<figure class="viz" data-viz="palettes"></figure>
<div class="grid2">
<div><ul>
  <li><b>Séquentielle</b> : variable <b>quantitative ou ordinale</b>. On fait varier la <b>luminosité</b> (et/ou la saturation) ; la teinte peut varier légèrement.</li>
  <li><b>Divergente</b> : variable <b>quantitative</b> avec une valeur <b>pivot</b>. <b>Deux teintes</b>, luminosité qui varie de chaque côté du pivot. Exemples : relief (profondeur, niveau de la mer, altitude), température (négatif, 0°, positif), profit (négatif, 0, positif).</li>
  <li><b>Qualitative</b> : variable <b>nominale</b>. On fait varier la <b>teinte</b>, luminosité et saturation identiques.</li>
</ul></div>
<div><table class="t">
<thead><tr><th>Palette</th><th>Nominale</th><th>Ordinale</th><th>Quantitative</th></tr></thead>
<tbody>
<tr><td>Qualitative</td><td class="yes">Oui</td><td class="no">Non</td><td class="no">Non</td></tr>
<tr><td>Séquentielle</td><td class="no">Non</td><td class="yes">Oui</td><td class="yes">Oui</td></tr>
<tr><td>Divergente</td><td class="no">Non</td><td class="no">Non</td><td class="yes">Oui</td></tr>
</tbody></table></div>
</div>
<h3>Modèles colorimétriques</h3>
<p>Un modèle code chaque couleur par des valeurs numériques.</p>
<div class="grid2">
<div><h3 style="margin-top:0">Rouge Vert Bleu (RVB)</h3>
<ul><li>3 valeurs entre 0 et 255 : quantité de rouge, de vert, de bleu ; leur combinaison donne les autres couleurs.</li>
<li>0,255,0 = vert ; 0,128,0 = vert foncé ; 255,0,255 = magenta ; 0,0,0 = noir ; 255,255,255 = blanc ; 128,128,128 = gris.</li>
<li>Correspond au fonctionnement des écrans, mais n'aide pas à caractériser les palettes.</li></ul></div>
<div><h3 style="margin-top:0">Teinte Saturation Luminosité (TSL)</h3>
<ul><li><b>Teinte</b> : nominale <b>oui</b> ; ordinale et quantitative <b>non</b>.</li>
<li><b>Saturation</b> : quantitative et ordinale <b>oui</b> ; nominale <b>non</b>.</li>
<li><b>Luminosité</b> : quantitative et ordinale <b>oui</b> ; nominale <b>non</b>.</li></ul></div>
</div>
<figure class="viz" data-viz="color"></figure>
<h3>Combiner deux palettes pour deux variables ?</h3>
<table class="t">
<thead><tr><th>Cas</th><th>Palettes</th><th>Possible ?</th></tr></thead>
<tbody>
<tr><td>1</td><td>qualitative + qualitative</td><td class="no">Non</td></tr>
<tr><td>2</td><td>séquentielle + séquentielle</td><td class="maybe">Éventuellement</td></tr>
<tr><td>3</td><td>divergente + divergente</td><td class="maybe">Éventuellement</td></tr>
<tr><td>4</td><td>qualitative + séquentielle</td><td class="yes">Oui</td></tr>
<tr><td>5</td><td>séquentielle + divergente</td><td class="maybe">Éventuellement</td></tr>
<tr><td>6</td><td>divergente + qualitative</td><td class="no">Non</td></tr>
</tbody></table>
<p class="math-note">Idée : deux palettes qui font varier la même composante se mélangent. Une qualitative (teinte) et une séquentielle (luminosité) jouent sur des composantes différentes, donc ça marche ; la divergente utilise déjà deux teintes, ce qui la rend incompatible avec une qualitative.</p>
<h3>Bonnes pratiques</h3>
<ul>
  <li>Trouver des palettes : <b>ColorBrewer 2.0</b> (colorbrewer2.org).</li>
  <li><b>Aire et saturation</b> (palette qualitative) : couleurs <b>peu saturées pour les grandes zones</b>, <b>saturées pour les petites zones</b>.</li>
  <li><b>Daltonisme et impression noir et blanc</b> (outil <b>Viz Palette</b>) : une palette peut être lisible par les personnes daltoniennes mais illisible imprimée en noir et blanc, et inversement (par exemple, rouge et vert indistinguables en deutéranopie).</li>
</ul>
<h3>Le tableau complet des variables visuelles</h3>
<table class="t vv-table">
<thead><tr><th>Variable visuelle</th><th>Nominale</th><th>Ordinale</th><th>Quantitative</th></tr></thead>
<tbody>
<tr><td>Position 1D ou 2D</td><td class="maybe">Éventuellement</td><td class="yes">Oui</td><td class="yes">Oui</td></tr>
<tr><td>Position 3D</td><td class="maybe">Éventuellement</td><td class="yes">Oui</td><td class="yes">Oui</td></tr>
<tr><td>Taille 1D</td><td class="no">Non</td><td class="maybe">Éventuellement</td><td class="yes">Oui</td></tr>
<tr><td>Taille 2D</td><td class="no">Non</td><td class="maybe">Éventuellement</td><td class="yes">Oui</td></tr>
<tr><td>Taille 3D</td><td class="no">Non</td><td class="maybe">Éventuellement</td><td class="yes">Oui</td></tr>
<tr><td>Forme</td><td class="yes">Oui</td><td class="no">Non</td><td class="no">Non</td></tr>
<tr><td>Couleur, palette qualitative</td><td class="yes">Oui</td><td class="no">Non</td><td class="no">Non</td></tr>
<tr><td>Couleur, palette séquentielle</td><td class="no">Non</td><td class="yes">Oui</td><td class="yes">Oui</td></tr>
<tr><td>Couleur, palette divergente</td><td class="no">Non</td><td class="no">Non</td><td class="yes">Oui</td></tr>
</tbody></table>
<h3>Efficacité : classement par type de variable</h3>
<p>Du plus efficace (en haut) au moins efficace. Les variables visuelles des variables <b>ordinales et quantitatives sont quasiment les mêmes</b> : ce sont les variables « ordonnées ».</p>
<figure class="viz" data-viz="ranking"></figure>
<h3>Combinaison et séparabilité</h3>
<ul>
  <li>On combine des variables visuelles pour représenter plusieurs variables sur les mêmes objets : 2 nominales (teinte + forme) ; 1 nominale + 1 ordonnée (teinte + taille) ; 2 ordonnées (luminosité + taille).</li>
  <li><b>Séparabilité</b> : toutes les variables visuelles ne sont pas indépendantes. <b>Faible</b> : largeur + hauteur (on perçoit une forme ou une aire globale, pas deux valeurs). <b>Moyenne</b> : taille + teinte. <b>Forte</b> : position + teinte.</li>
</ul>
<figure class="viz" data-viz="separability"></figure>
`,

tp: `
<p class="lead">L'essentiel des TP à savoir expliquer. Pour coder, utilise l'onglet <b>TP · labo de code</b> : il ne contient que le code fourni par l'enseignant, et c'est le seul accepté à l'examen.</p>
<h3>SVG (TP 1)</h3>
<ul>
  <li><b>Vectoriel</b> (objets géométriques + propriétés + transformations, rendu recalculé : net à tout zoom) contre <b>matriciel</b> (grille de pixels, pixellisé au zoom ; PNG, JPEG, GIF). Le SVG est vectoriel, basé sur XML, normalisé par le W3C et lu par les navigateurs.</li>
  <li><b>Repère</b> : origine <b>en haut à gauche</b>, axe y <b>vers le bas</b>. D'où, pour une barre posée sur une ligne de base y<sub>0</sub> : y = y<sub>0</sub> − hauteur.</li>
  <li>Objets : <code>circle</code> (cx, cy, r), <code>line</code> (x1, y1, x2, y2), <code>rect</code> (x, y du coin <b>en haut à gauche</b>, width, height), <code>polygon</code> (points), <code>path</code> (attribut d : M = se déplacer, L = ligne, C = courbe, Z = fermer), <code>text</code>, <code>g</code> (groupe, avec <code>transform="translate(…)"</code>).</li>
  <li>Propriétés de style : fill, stroke, stroke-width, stroke-linecap, fill-opacity.</li>
</ul>
<figure class="viz" data-viz="svgframe"></figure>
<h3>JavaScript (TP 2)</h3>
<ul>
  <li>Chargement d'un JSON avec jQuery (<code>$.ajax</code>, fonction <code>success</code>), au chargement de la page (<code>&lt;body onload="…"&gt;</code>).</li>
  <li>Les données contiennent rarement les valeurs à afficher : il faut souvent les <b>transformer</b> d'abord (compter les lettres dans <code>barLengths</code>).</li>
  <li>On construit le SVG dans une chaîne puis <code>.html(str)</code>. Interaction : évènements <code>onmouseover</code> / <code>onmouseleave</code> ; une variable déclarée dans une fonction est <b>locale</b>, d'où la variable globale <code>dataGlobale</code>.</li>
  <li>Limite : axes écrits en dur, donc pas d'adaptation aux données.</li>
</ul>
<h3>D3 (TP 3 à 5)</h3>
<ul>
  <li><code>d3.json(…).then(function(data){…})</code> charge les données ; <code>d3.select</code>, <code>append</code>, <code>attr</code>, <code>call</code> construisent le SVG.</li>
  <li><b>Échelle</b> : transforme une valeur du <code>domain</code> (intervalle de départ) en valeur du <code>range</code> (intervalle d'arrivée). <code>scaleLinear</code> (continue), <code>scaleBand</code> (valeurs discrètes réparties uniformément, <code>bandwidth()</code> = largeur d'une bande), <code>scaleLog</code> (valeurs très étalées ; domaine qui ne contient pas 0), <code>scaleOrdinal(d3.schemeCategory10)</code> (couleurs).</li>
  <li>Axe Y : on <b>inverse le range</b> ([450,0]) car l'axe y du SVG descend.</li>
  <li><b>Axes</b> : <code>d3.axisBottom</code>, <code>axisLeft</code>, <code>axisTop</code>, <code>axisRight</code>, placés dans un <code>g</code> déplacé par <code>translate</code>.</li>
  <li><b>Zoom</b> (<code>d3.zoom</code>) : tous les <code>g</code> dans un <code>gGlobal</code> dont on change la transformation. <b>Brush</b> (<code>d3.brush</code>) : rectangle de sélection, coins <code>selection[0]</code> (haut gauche) et <code>selection[1]</code> (bas droite).</li>
  <li><code>d3.line()</code> transforme un tableau de points en attribut <code>d</code> d'un chemin.</li>
</ul>
<figure class="viz" data-viz="scales"></figure>
<h3>La sémiologie des visualisations des TP</h3>
<table class="t">
<thead><tr><th>TP</th><th>Implantation</th><th>Variables visuelles</th></tr></thead>
<tbody>
<tr><td>TP 4 : nuage COVID</td><td>ponctuelle (un point = un pays)</td><td>position x = total_cases ; position y = total_deaths (échelles log) ; <b>orientation</b> du triangle = new_cases nul ou non ; <b>teinte</b> = continent</td></tr>
<tr><td>TP 5 : coordonnées parallèles</td><td>linéaire (une ligne = un iris)</td><td>positions x = les variables quantitatives ; positions y = leurs valeurs ; teinte = espèce</td></tr>
</tbody></table>
`,
};
