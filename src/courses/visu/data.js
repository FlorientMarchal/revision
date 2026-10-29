// Contenu du cours « Visualisation d'informations ». Identifiants fixes : la progression ne se décale pas si l'on ajoute du contenu.
import { chapters, fiches } from './fiches.js';
import { labs } from './labs.js';
import { lessons } from './lessons.js';

export { chapters, fiches, labs, lessons };

const C = (id, ch, q, a) => ({ id: 'vc_' + id, ch, q, a });

const Q = (id, ch, q, opts, ans, exp) => ({ id: 'vq_' + id, ch, q, opts, ans, exp });
export const quiz = [
  Q('obj', 'intro', 'La carte de Minard sert surtout à…', ['explorer des données inconnues', 'présenter des résultats connus', 'tester une hypothèse statistique', 'réduire la dimension'], 1, 'Minard présente la campagne de Russie : objectif de présentation.'),
  Q('ans', 'intro', 'Le quartet d\'Anscombe montre que…', ['la corrélation suffit à décrire un nuage', 'des jeux aux mêmes statistiques peuvent être très différents', 'la régression linéaire est toujours adaptée', 'la moyenne est plus robuste que la médiane'], 1, 'Mêmes moyennes, variances, corrélation, droite de régression : 4 nuages différents.'),
  Q('qpc', 'intro', 'Dans « Quoi ? Pourquoi ? Comment ? », le « Pourquoi ? » porte sur…', ['les données', 'les tâches', 'les idiomes', 'les couleurs'], 1, 'Quoi = données, Pourquoi = tâches, Comment = idiomes.'),
  Q('idiome', 'intro', 'Un idiome, c\'est…', ['un type de jeu de données', 'un encodage visuel et/ou une technique d\'interaction', 'une tâche abstraite', 'un modèle colorimétrique'], 1, 'Pour chaque vue on choisit des idiomes : encodages visuels et techniques d\'interaction.'),
  Q('cp', 'intro', 'Les codes postaux sont une variable…', ['quantitative, car ce sont des nombres', 'nominale', 'ordinale', 'continue'], 1, 'On ne peut que tester l\'égalité : la moyenne n\'a pas de sens.'),
  Q('abstr', 'intro', '« Trouver le trajet le plus rapide de A à B » devient en tâche abstraite…', ['rechercher le plus court chemin dans un graphe multivarié', 'résumer une table', 'filtrer une carte', 'comparer deux variables'], 0, 'Action « rechercher », cible « chemin dans un graphe ».'),
  Q('locate', 'intro', 'On connaît la cible mais pas sa position : c\'est…', ['lookup', 'browse', 'locate', 'explore'], 2, 'Lookup : tout connu ; browse : position connue ; locate : cible connue ; explore : rien.'),
  Q('summ', 'intro', 'Requête qui porte sur tous les éléments ?', ['identifier', 'comparer', 'résumer', 'naviguer'], 2, 'Identifier un élément, comparer quelques-uns, résumer tous.'),
  Q('compromis', 'intro', 'Exemple des notes du CM 1 : quelle représentation ne permet pas de trouver la note médiane ?', ['le tableau où la médiane est surlignée', 'le diagramme en barres', 'le tableau coloré avec sa légende', 'aucune'], 1, 'Le diagramme en barres montre la note la plus élevée, pas la médiane.'),
  Q('tables', 'tables', 'Dans une table, les lignes représentent…', ['les variables', 'les individus', 'les valeurs', 'les dimensions'], 1, 'Lignes = individus, colonnes = variables.'),
  Q('taille', 'tables', 'La taille de vêtement (S, M, L, XL) est…', ['nominale', 'ordinale', 'quantitative continue', 'quantitative discrète'], 1, 'Ordre implicite, pas d\'arithmétique.'),
  Q('conv', 'tables', 'Ordonner des noms de villes par ordre alphabétique, c\'est utiliser…', ['un ordre implicite', 'un ordre conventionnel', 'un ordre calculé à partir d\'une autre variable', 'une échelle logarithmique'], 1, 'Ordre arbitraire admis par convention sur une variable nominale.'),
  Q('stat', 'tables', 'En visualisation, une variable ordinale est rangée avec…', ['les nominales (qualitatives)', 'les quantitatives, parmi les variables ordonnées', 'les variables continues', 'aucune'], 1, 'Nominale / ordonnée (ordinale, quantitative).'),
  Q('barst', 'tables', 'Barres empilées : combien de variables et de quels types ?', ['2 quantitatives', '1 nominale/ordinale + 1 quantitative + 1 nominale', '3 quantitatives', '1 nominale + 1 quantitative'], 1, 'X : nominale/ordinale ; Y : quantitative ; couleur : nominale.'),
  Q('line', 'tables', 'Dans un diagramme en lignes, l\'axe des abscisses représente souvent…', ['une variable nominale', 'une date (quantitative)', 'une palette', 'une variable ordinale'], 1, 'Abscisses : 1 quantitative, souvent une date.'),
  Q('pc', 'tables', 'Principal inconvénient des coordonnées parallèles ?', ['peu de variables représentables', 'comparer deux variables dont les axes ne sont pas consécutifs', 'impossible avec des quantitatives', 'aucune interaction possible'], 1, 'Avantage : beaucoup de variables ; inconvénient : axes non voisins.'),
  Q('scat', 'tables', 'Pour visualiser 2 variables quantitatives, on utilise…', ['un camembert', 'un nuage de points', 'une table surlignée', 'des barres empilées'], 1, 'Abscisse et ordonnée quantitatives.'),
  Q('ts', 'tables', 'Table surlignée : la couleur représente…', ['1 nominale', '1 quantitative', '2 ordinales', 'rien'], 1, 'Les deux axes : nominales/ordinales ; couleur : quantitative.'),
  Q('kiv', 'tables', 'Graphique à axes circulaires où chaque individu est une ligne ?', ['diagramme en flots', 'diagramme de Kiviat', 'treemap', 'coordonnées parallèles'], 1, 'Kiviat : individus = lignes, axes circulaires.'),
  Q('pie', 'vv1', 'Dans un camembert, quelle(s) variable(s) visuelle(s) représente(nt) la variable quantitative ?', ['la couleur des portions', 'l\'aire totale du camembert', 'l\'angle (longueur d\'arc) et l\'aire des portions', 'la forme des portions'], 2, 'TD exo 3 : taille 1D (angle) et taille 2D (aire des portions). La couleur code la nominale.'),
  Q('forme', 'vv1', 'La forme convient pour une variable…', ['quantitative', 'ordinale', 'nominale', 'continue'], 2, 'Pas d\'ordre implicite sur les formes.'),
  Q('taillenom', 'vv1', 'La taille pour une variable nominale ?', ['oui', 'éventuellement', 'non', 'seulement en 3D'], 2, 'Une taille suggère un ordre qui n\'existe pas.'),
  Q('posnom', 'vv1', 'La position pour une variable nominale ?', ['oui, toujours', 'éventuellement, avec un ordre conventionnel ou calculé', 'non', 'seulement en 3D'], 1, 'Ordre alphabétique ou calculé à partir d\'une autre variable.'),
  Q('vvnot', 'vv1', 'Nuage où tous les points sont des ronds : la forme…', ['est une variable visuelle nominale', 'n\'est pas une variable visuelle', 'représente la variable y', 'représente la densité'], 1, 'Elle ne représente aucune variable.'),
  Q('carre', 'vv1', 'a = 1 et b = 2, représentés par l\'aire de carrés. Si a a un côté c, le côté de b vaut…', ['2c', 'c√2', '4c', 'c/2'], 1, 'Aire doublée : côté × √2.'),
  Q('len', 'vv1', 'Pour comparer précisément des valeurs quantitatives, on préfère…', ['des aires', 'des longueurs', 'des volumes', 'des formes'], 1, 'Taille 1D plus efficace que 2D, plus efficace que 3D.'),
  Q('symb', 'vv1', 'Un couteau et une fourchette pour indiquer un restaurant : forme…', ['géométrique', 'conventionnelle', 'évocatrice', 'figurative'], 2, 'Conventionnelle (®) < évocatrice < figurative (personne attablée).'),
  Q('palquant', 'vv2', 'Palette pour une variable quantitative sans valeur pivot ?', ['qualitative', 'séquentielle', 'divergente', 'aucune'], 1, 'Séquentielle : variation de luminosité.'),
  Q('paltemp', 'vv2', 'Températures autour de 0 °C : palette ?', ['qualitative', 'séquentielle', 'divergente', 'arc-en-ciel'], 2, 'Valeur pivot 0 : deux teintes.'),
  Q('palnom', 'vv2', 'Palette pour des continents ?', ['qualitative', 'séquentielle', 'divergente', 'en niveaux de gris'], 0, 'Variable nominale : variation de teinte.'),
  Q('teinte', 'vv2', 'La teinte peut représenter une variable…', ['quantitative', 'ordinale', 'nominale', 'les trois'], 2, 'Teinte : nominale seulement.'),
  Q('lum', 'vv2', 'La luminosité peut représenter une variable…', ['nominale seulement', 'ordinale et quantitative', 'aucune', 'nominale et ordinale'], 1, 'Saturation et luminosité : ordonnées.'),
  Q('palseqvar', 'vv2', 'Que fait-on varier dans une palette séquentielle ?', ['la teinte', 'la luminosité (ou la saturation)', 'deux teintes', 'la forme'], 1, 'La teinte peut varier légèrement.'),
  Q('rgb', 'vv2', 'En RVB, 255,0,255 donne…', ['jaune', 'cyan', 'magenta', 'blanc'], 2, 'Rouge + bleu = magenta.'),
  Q('combi1', 'vv2', 'Combiner une palette qualitative et une séquentielle ?', ['non', 'éventuellement', 'oui', 'seulement en noir et blanc'], 2, 'Teinte et luminosité varient indépendamment.'),
  Q('combi2', 'vv2', 'Combiner deux palettes qualitatives ?', ['oui', 'éventuellement', 'non', 'oui si elles viennent de ColorBrewer'], 2, 'Les deux jouent sur la teinte.'),
  Q('satur', 'vv2', 'Pour de grandes zones (palette qualitative), on choisit des couleurs…', ['saturées', 'peu saturées', 'très sombres', 'fluorescentes'], 1, 'Saturées pour les petites zones, peu saturées pour les grandes.'),
  Q('effnom', 'vv2', 'Variable visuelle la plus efficace pour une nominale ?', ['forme', 'couleur palette qualitative', 'position', 'taille 1D'], 1, 'Puis forme, puis position (avec ordre).'),
  Q('effquant', 'vv2', 'Variable visuelle la plus efficace pour une quantitative ?', ['taille 2D', 'couleur séquentielle', 'position 1D ou 2D', 'taille 3D'], 2, 'Puis taille 1D, taille 2D, position 3D, couleur, taille 3D.'),
  Q('sep', 'vv2', 'Couple de variables visuelles le plus séparable ?', ['largeur + hauteur', 'taille + teinte', 'position + teinte', 'saturation + luminosité'], 2, 'Largeur + hauteur : faible séparabilité.'),
  Q('svg', 'tp', 'Dans un SVG, augmenter cy d\'un cercle le déplace…', ['vers le haut', 'vers le bas', 'vers la droite', 'nulle part'], 1, 'Origine en haut à gauche, y vers le bas.'),
  Q('z', 'tp', 'Dans l\'attribut d d\'un path, Z sert à…', ['zoomer', 'fermer le chemin', 'tracer une courbe', 'se déplacer sans tracer'], 1, 'Z relie le dernier point au premier.'),
  Q('vectq', 'tp', 'Format vectoriel parmi :', ['PNG', 'JPEG', 'SVG', 'GIF'], 2, 'PNG, JPEG, GIF sont matriciels.'),
  Q('scale', 'tp', 'd3.scaleLinear(), domain [0,10], range [0,1000] : scale(7.5) = ?', ['75', '750', '7500', '0,75'], 1, '7,5 / 10 × 1000.'),
  Q('band', 'tp', 'scaleBand, domain ["A","B","C","D","E"], range [0,1000] : scale("C") = ?', ['300', '400', '500', '600'], 1, 'A 0, B 200, C 400, D 600, E 800.'),
  Q('inv', 'tp', 'Pourquoi range([450,0]) pour l\'axe Y ?', ['pour zoomer', 'parce que l\'axe y du SVG descend', 'pour une échelle log', 'pour centrer l\'axe'], 1, 'Sinon les étiquettes sont inversées.'),
  Q('log0', 'tp', 'Avec d3.scaleLog(), il faut…', ['un domaine qui commence à 0', 'un domaine qui commence à 1 et exclure les valeurs nulles', 'des valeurs négatives', 'une palette divergente'], 1, 'log(0) n\'est pas défini.'),
  Q('orient', 'tp', 'TP 4 : la présence de nouveaux cas est codée par…', ['la teinte', 'la taille', 'l\'orientation du triangle', 'la position y'], 2, 'Triangle vers le haut si nouveaux cas, vers le bas sinon.'),
  Q('glob', 'tp', 'TP 2 : « data is not defined » dans drawInfobulle() vient de…', ['un fichier JSON mal formé', 'une variable locale à la fonction de chargement', 'jQuery non chargé', 'un SVG sans id'], 1, 'Solution : variable globale dataGlobale.'),
];

// TD 1 : énoncé complet et correction rédigée.
export const exams = [
  {
    id: 'td1', title: 'TD 1',
    head: '<p><b>TD 1 — Visualisation d\'informations</b> (M1 MIASHS). Ce TD comporte un ensemble de questions permettant de mettre en pratique les notions étudiées en cours. <b>Certaines de ces questions sont issues d\'examens proposés durant ces dernières années</b> : c\'est le modèle des 10 points de cours de l\'examen.</p>',
    exos: [
      { t: 'Exercice 1 — Ordre conventionnel', intro: '', qs: [
        { q: '<b>Question 1.</b> Qu\'est-ce qu\'un ordre conventionnel ?',
          a: '<p>Un ordre <b>arbitraire</b>, fixé par une <b>convention</b> partagée, qu\'on impose aux modalités d\'une variable <b>nominale</b>, qui n\'a pas d\'ordre implicite. Il ne dit rien sur les données elles-mêmes : il sert seulement à ranger les modalités de façon prévisible.</p>' },
        { q: '<b>Question 2.</b> Donnez un exemple de variable dont les modalités peuvent être ordonnées à l\'aide d\'un ordre conventionnel.',
          a: '<p>Le <b>nom de famille</b> (ou le nom d\'une ville, d\'un pays) classé par <b>ordre alphabétique</b>.</p>' },
        { q: '<b>Question 3.</b> Dans quel cas utilise-t-on un ordre conventionnel en visualisation ?',
          a: '<p>Quand on représente une variable <b>nominale</b> avec la variable visuelle <b>position</b> (par exemple les modalités le long de l\'axe des abscisses d\'un diagramme en barres). La position suppose un ordre ; une nominale n\'en a pas, donc la position n\'est utilisable qu\'« éventuellement » : avec un ordre conventionnel (alphabétique) ou un ordre calculé à partir d\'une autre variable. L\'ordre conventionnel aide le lecteur à retrouver une modalité.</p>' },
      ] },
      { t: 'Exercice 2 — Barres empilées ou côte à côte', intro: '', qs: [
        { q: 'Les diagrammes en barres empilées et les diagrammes en barres côte-à-côte permettent tous deux de représenter une variable quantitative et deux variables nominales/ordinales. Quels sont les inconvénients/avantages de ces deux méthodes ?',
          a: '<table class="t"><thead><tr><th></th><th>Barres empilées</th><th>Barres côte à côte</th></tr></thead><tbody><tr><td>Avantages</td><td>Le <b>total</b> de chaque barre se lit directement ; graphique compact ; la catégorie du bas, alignée sur l\'axe, se compare bien.</td><td>Toutes les barres partent de la même base : on <b>compare précisément chaque valeur</b> (position sur une échelle commune), entre groupes et dans un groupe.</td></tr><tr><td>Inconvénients</td><td>Les segments du dessus n\'ont <b>pas de base commune</b> : leurs longueurs se comparent mal d\'une barre à l\'autre.</td><td>Le <b>total</b> n\'est plus visible ; le graphique s\'élargit vite et devient chargé s\'il y a beaucoup de modalités.</td></tr></tbody></table><p>Choix : empilées si la tâche porte sur les totaux (et la composition), côte à côte si elle porte sur la comparaison des valeurs détaillées.</p>' },
      ] },
      { t: 'Exercice 3 — Camembert', intro: '<p>Dans la liste ci-dessous, quelle(s) est/sont la/les variable(s) visuelle(s) permettant de visualiser les valeurs de la variable quantitative dans un camembert ?</p><img src="img/td1-camembert.webp" alt="Camembert à 7 portions de couleurs différentes" style="max-width:220px"><ol><li>Couleur (palette qualitative) des portions</li><li>Taille 1D – longueur de l\'angle des portions</li><li>Taille 2D – aire totale du camembert</li><li>Taille 2D – aire des portions</li><li>Forme des portions</li></ol>', qs: [
        { q: 'Réponse(s) ?',
          a: '<p><b>2 et 4.</b> La valeur de chaque portion est représentée par la <b>longueur de son angle</b> (taille 1D) et par son <b>aire</b> (taille 2D), proportionnelles l\'une à l\'autre.</p><ul><li>1 : la couleur (palette qualitative) représente la variable <b>nominale</b> (la catégorie), pas la quantitative.</li><li>3 : l\'aire totale est la même quelles que soient les valeurs : elle ne représente rien (au mieux le total).</li><li>5 : la forme d\'une portion découle de son angle, et la forme ne sert qu\'aux nominales.</li></ul>' },
      ] },
      { t: 'Exercice 4 — Aire de carrés', intro: '<p>Imaginons un jeu de données contenant deux individus a et b et une variable quantitative dont la valeur pour a est 1 et la valeur pour b est 2. Un concepteur de visualisation doit représenter :</p><ul><li>les individus à l\'aide d\'objets graphiques (carrés),</li><li>la variable à l\'aide de la variable visuelle taille 2D (aire) appliquée sur ces objets.</li></ul><figure class="viz" data-viz="tdsquares"></figure>', qs: [
        { q: '<b>Question 1.</b> Dans le dessin, en considérant que la taille de l\'individu a est correcte, quelle doit être la taille de l\'individu b (b.1 ou b.2) ?',
          a: '<p><b>b.2.</b> La variable est codée par l\'<b>aire</b> : b vaut 2 × a, donc l\'aire de b doit être 2 × celle de a. Si a a pour côté c, b doit avoir pour côté c√2 ≈ 1,41c (aire 2c²). b.1 a un côté de 2c, donc une aire de 4c² : il représenterait la valeur 4.</p>' },
        { q: '<b>Question 2.</b> Au-delà de l\'aspect « correct » de la représentation, pensez-vous que la valeur de la variable est bien perçue lorsqu\'un concepteur utilise la variable visuelle aire ?',
          a: '<p><b>Non, pas bien.</b> On compare mal des aires : l\'œil a tendance à comparer les côtés, et sous-estime donc les rapports d\'aires (b.2, correct, ne « paraît » pas deux fois plus grand). La taille 2D est moins efficace que la position et la taille 1D (longueur) pour une variable quantitative : un diagramme en barres serait plus lisible.</p>' },
      ] },
      { t: 'Exercice 5 — Développement du langage', intro: '<p>Un linguiste étudie le développement du langage chez les enfants. Il possède un jeu de données, sous la forme d\'un fichier CSV, dans lequel chaque ligne correspond à un type de mots prononcé par un enfant à un âge donné et chaque colonne à une variable. Les variables sont :</p><ul><li>TYPE : un type de mots, eg. NOM, ADJECTIF, VERBE, ADVERBE…</li><li>AGE : un âge d\'enfant,</li><li>NOMBRE : nombre de mots de ce TYPE prononcé par les enfants de cet AGE.</li></ul>', qs: [
        { q: '<b>Question 1.</b> Pour chaque variable, dites si elle est quantitative, ordinale ou nominale.',
          a: '<ul><li><b>TYPE</b> : nominale (pas d\'ordre entre NOM, VERBE…).</li><li><b>AGE</b> : quantitative (un âge se compare et se soustrait). Si les âges sont des classes (« 2-3 ans »), elle devient ordinale : dans les deux cas c\'est une variable <b>ordonnée</b>.</li><li><b>NOMBRE</b> : quantitative (discrète).</li></ul>' },
        { q: '<b>Question 2.</b> Listez les différents graphiques (ie. organisations spatiales) permettant de visualiser 3 variables de ce type. Précisez, pour chacune d\'entre elles, les variables visuelles utilisées pour représenter les variables TYPE, AGE et NOMBRE. Illustrez votre réponse à l\'aide d\'un dessin par graphique.',
          a: '<p>Une nominale (TYPE), une ordonnée (AGE) et une quantitative (NOMBRE) :</p><table class="t"><thead><tr><th>Graphique</th><th>TYPE</th><th>AGE</th><th>NOMBRE</th></tr></thead><tbody><tr><td>Barres empilées</td><td>couleur (palette qualitative)</td><td>position x</td><td>taille 1D (hauteur du segment)</td></tr><tr><td>Barres côte à côte</td><td>couleur (palette qualitative)</td><td>position x</td><td>position y / taille 1D (hauteur)</td></tr><tr><td>Diagramme en lignes</td><td>couleur (une ligne par type)</td><td>position x</td><td>position y</td></tr><tr><td>Aires empilées (ou flots)</td><td>couleur (une aire par type)</td><td>position x</td><td>taille 1D (épaisseur de l\'aire)</td></tr><tr><td>Table surlignée</td><td>position y (ordre conventionnel)</td><td>position x</td><td>couleur (palette séquentielle)</td></tr></tbody></table><p>On peut aussi échanger les rôles de TYPE et AGE dans les barres (TYPE en x, AGE en couleur avec une palette séquentielle). Les dessins :</p><figure class="viz" data-viz="tdcharts"></figure>' },
      ] },
    ],
  },
];

export * from './codesheet.js';

export { cards } from './cards.js';
