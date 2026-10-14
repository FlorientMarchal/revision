// Labo des TP. RÈGLE : tout le code de ce fichier est recopié tel quel des supports de TP
// d'Arnaud Sallaberry (champ `code`) ou de ses fichiers de départ (dossier start/). Aucun autre code.
// Seules retouches : l'indentation, et les lignes que la mise en page du PDF coupait au milieu
// d'une chaîne de caractères (recollées, sinon le code ne s'exécute pas) ; elles sont signalées dans `note`.
import page from './start/tp1-page.html?raw';
import tp2e1 from './start/tp2-exo1.html?raw';
import tp2e2 from './start/tp2-exo2.html?raw';
import tp2e3 from './start/tp2-exo3.html?raw';
import tp3e1 from './start/tp3-exo1.html?raw';
import tp3e3 from './start/tp3-exo3.html?raw';
import tp4e1 from './start/tp4-exo1.html?raw';
import tp5e1 from './start/tp5-exo1.html?raw';

const fig = (src, cap) => ({ src, cap });
const RECOLLE = 'Dans le PDF, ce code est coupé au milieu d\'une chaîne de caractères ; les morceaux sont recollés ici pour qu\'il s\'exécute.';

export const labs = [
  {
    id: 'tp1', short: 'TP1 · SVG', folder: 'tp1',
    t: 'TP 1 — SVG',
    d: '<p>Une image <b>vectorielle</b> est un ensemble d\'objets géométriques munis de propriétés (position, couleur…) et de transformations ; elle reste nette quand on zoome. Une image <b>matricielle</b> (PNG, JPEG, GIF) est une grille de pixels. Le SVG est un format vectoriel basé sur XML, normalisé par le W3C et affiché directement par les navigateurs : ses objets et leurs propriétés jouent le rôle des variables visuelles du cours.</p>',
    exos: [
      {
        id: 'tp1-e1', short: 'Exo 1 · smiley', save: 'smiley.html',
        t: 'Exercice 1 — Premier dessin : un smiley',
        goal: 'Découvrir les objets SVG : cercle, ligne, chemin, polygone, groupe et texte.',
        start: { html: page }, files: [],
        steps: [
          { html: '<p>Le fichier de départ est la page HTML bien formée donnée dans le TP. Dans le corps de la page, ajoute une balise <code>svg</code> avec une taille et une bordure pour la voir à l\'écran.</p>', src: 'TP1 p. 2',
            code: `<svg width="500" height="500" style="border: 1px solid gray">
</svg>` },
          { html: '<p>Insère un premier cercle dans le <code>svg</code> : <code>cx</code>, <code>cy</code> = position du centre, <code>r</code> = rayon, <code>fill</code> = couleur de remplissage, <code>stroke</code> = couleur de la bordure, <code>stroke-width</code> = épaisseur de la bordure.</p>', src: 'TP1 p. 2',
            code: `<circle cx="100" cy="100"
        r="100"
        fill="yellow"
        stroke="orange"
        stroke-width=2px
/>`, figs: [fig('tp1-fig2-2.webp', 'Figure 2.2')] },
          { html: '<p>Déplace le centre en (150,150) : le cercle va à droite <b>et vers le bas</b>. L\'origine du repère SVG est <b>en haut à gauche</b> et l\'axe y descend. Reviens ensuite en (100,100).</p>', figs: [fig('tp1-fig3-1.webp', 'Figure 3.1 — repère SVG')] },
          { html: '<p>Ajoute les yeux : deux cercles (sur le modèle du cercle ci-dessus).</p>', figs: [fig('tp1-fig3-2.webp', 'Figure 3.2')] },
          { html: '<p>Bouche, version 1 : une ligne. Ajoute ensuite <code>stroke-linecap="round"</code> pour arrondir ses extrémités.</p>', src: 'TP1 p. 3',
            code: `<line x1="70" y1="140"
      x2="130" y2="140"
      stroke="orange"
      stroke-width=10px
/>`, figs: [fig('tp1-fig4-1.webp', 'Figure 4.1'), fig('tp1-fig4-2.webp', 'Figure 4.2')] },
          { html: '<p>Mets la ligne en commentaire pour la garder en exemple :</p>', src: 'TP1 p. 3', code: '<!-- Texte en commentaire -->' },
          { html: '<p>Bouche, version 2 : un <b>chemin</b>. On dirige un stylo avec <code>M</code> (MoveTo, se déplacer) et <code>L</code> (LineTo, tracer une ligne). Remplace ensuite le deuxième <code>L</code> par un <code>M</code> : le deuxième segment disparaît (figure 5.2). Reviens à une ligne continue.</p>', src: 'TP1 p. 4',
            code: `<path d="M 50,130
         L 70,170
         L 130,170
         L 150,130"
      fill="none"
      stroke="orange"
      stroke-width=10px
      stroke-linecap="round"/>`, figs: [fig('tp1-fig5-1.webp', 'Figure 5.1'), fig('tp1-fig5-2.webp', 'Figure 5.2')] },
          { html: '<p>Arrondis le sourire : remplace le premier <code>L</code> par un <code>C</code> (CurveTo) et supprime les autres <code>L</code> en gardant les coordonnées. Ajoute ensuite un <code>Z</code> à la fin de <code>d</code> pour fermer le chemin, puis mets <code>fill</code> à <code>white</code> pour l\'intérieur de la bouche.</p>', src: 'TP1 p. 4',
            code: 'd="M 50,130 C 70,170 130,170 150,130"', figs: [fig('tp1-fig6-1.webp', 'Figure 6.1'), fig('tp1-fig6-2.webp', 'Figure 6.2 — avec Z'), fig('tp1-fig6-3.webp', 'Figure 6.3 — fill white')] },
          { html: '<p>Un chapeau de fête avec un <b>polygone</b> (plus simple qu\'un chemin quand il n\'y a pas de courbe) :</p>', src: 'TP1 p. 5',
            code: `<polygon points="40 20, 100 -50, 160 20"
  stroke="gray"
  stroke-width="2px"
  fill="silver"
/>`, figs: [fig('tp1-fig7-1.webp', 'Figure 7.1 — le chapeau dépasse')] },
          { html: '<p>Le chapeau sort du cadre : regroupe <b>tous tes objets</b> dans une balise <code>g</code> et applique une translation au groupe.</p>', src: 'TP1 p. 5',
            code: `<g transform="translate(150,150)">
</g>`, note: 'Tous tes objets géométriques vont entre ces deux balises.', figs: [fig('tp1-fig7-2.webp', 'Figure 7.2')] },
          { html: '<p>Pour finir, un texte :</p>', src: 'TP1 p. 5',
            code: `<text
      x="-40"
      y="250"
      fill="teal"
      font-size="30"
>
Ma première image SVG
</text>`, figs: [fig('tp1-fig8.webp', 'Figure 8')] },
          { html: '<p>Couleurs : noms normalisés (aqua, black, blue, fuchsia, gray, green, lime, maroon, navy, olive, purple, red, silver, teal, white, yellow), autres noms de couleurs du Web, ou code hexadécimal précédé de <code>#</code> (par exemple <code>#48D1CC</code>, turquoise).</p>' },
        ],
      },
      {
        id: 'tp1-e2', short: 'Exo 2 · barres', save: 'barres.html',
        t: 'Exercice 2 — Diagramme en barres en SVG',
        goal: 'Dessiner à la main le diagramme en barres de la figure 9. Hauteurs des barres : <b>210, 400, 320, 180, 190 et 230</b>.',
        start: { html: page }, files: [],
        steps: [
          { html: '<p>Nouveau fichier HTML. Les barres peuvent être des lignes épaisses ou des polygones, mais utilise l\'objet <code>rect</code> pour le découvrir. <code>x</code>, <code>y</code> = coin <b>en haut à gauche</b> ; tu peux ajouter les attributs habituels <code>fill</code>, <code>stroke</code>…</p>', src: 'TP1 p. 6',
            code: `<rect width="100"
      height="100"
      x="10"
      y="10"
/>`, figs: [fig('tp1-fig9.webp', 'Figure 9')] },
          { html: '<p>Comme l\'axe y descend, une barre de hauteur h posée sur une ligne de base y<sub>0</sub> commence en y = y<sub>0</sub> − h.</p>' },
        ],
      },
      {
        id: 'tp1-e3', short: 'Exo 3 · aires (entraînement)', save: 'aires.html',
        t: 'Exercice 3 (entraînement) — Zones empilées',
        goal: 'Réaliser le graphique en zones empilées de la figure 10 avec des <b>polygones</b>.',
        start: { html: page }, files: [],
        steps: [
          { html: '<p>Données :</p><table class="t"><thead><tr><th></th><th>0</th><th>100</th><th>200</th><th>300</th><th>400</th></tr></thead><tbody><tr><th>A</th><td>50</td><td>100</td><td>110</td><td>70</td><td>90</td></tr><tr><th>B</th><td>100</td><td>20</td><td>60</td><td>80</td><td>10</td></tr><tr><th>C</th><td>50</td><td>30</td><td>40</td><td>40</td><td>100</td></tr></tbody></table><p>Zones <b>empilées</b> : la zone B commence là où finit A, et C au-dessus de A + B.</p>', figs: [fig('tp1-fig10.webp', 'Figure 10')] },
          { html: '<p>L\'objet à utiliser, vu dans l\'exercice 1 :</p>', src: 'TP1 p. 5',
            code: `<polygon points="40 20, 100 -50, 160 20"
  stroke="gray"
  stroke-width="2px"
  fill="silver"
/>` },
        ],
      },
    ],
  },
  {
    id: 'tp2', short: 'TP2 · JavaScript', folder: 'tp2',
    t: 'TP 2 — JavaScript',
    d: '<p>On automatise (en partie) la création des graphiques : on charge un fichier JSON avec jQuery, on calcule les valeurs à afficher, puis on construit le code SVG dans une chaîne de caractères. Les axes restent écrits « en dur » dans le fichier HTML.</p>',
    exos: [
      {
        id: 'tp2-e1', short: 'Exo 1 · barres', save: 'exo1.html',
        t: 'Exercice 1 — Diagramme en barres automatisé',
        goal: 'Charger <code>exo1.json</code> (une liste de lettres) et dessiner le nombre de A, B, C… avec des rectangles.',
        start: { html: tp2e1 }, files: ['exo1.json'], libs: ['jquery.min.js'],
        steps: [
          { html: '<p>Le fichier de départ <code>exo1.html</code> contient déjà les axes. Charge le fichier de données avec jQuery et affiche-le dans la console. Les deux balises <code>script</code> vont dans l\'en-tête, et l\'attribut <code>onload</code> sur la balise <code>body</code> existante.</p>', src: 'TP2 p. 1',
            code: `<script type="text/javascript" src="jquery.min.js">
</script>

<script type="text/javascript">

	function drawBarChart(){
		$.ajax({
			url: "exo1.json",
			dataType: "json",
			success: function(data){
				console.log(data);
			}
		});
	}

</script>` },
          { html: '', src: 'TP2 p. 1', code: '<body onload="drawBarChart()">', figs: [fig('tp2-fig1-1.webp', 'Figure 1.1 — console')] },
          { html: '<p>Les données sont une liste de lettres : il faut compter les A, B, C… avant de dessiner. Ce code va dans la fonction <code>success</code>. Affiche ensuite <code>barLengths</code> avec un <code>console.log</code> (valeurs attendues : celles du TP 1).</p>', src: 'TP2 p. 2',
            code: `var barLengths = {"A":0,"B":0,"C":0,"D":0,"E":0,"F":0};
for(i=0;i<data.length;i++){
	barLengths[data[i]] = barLengths[data[i]]+1;
}`, figs: [fig('tp2-fig1-2.webp', 'Figure 1.2')] },
          { html: '<p>Donne un identifiant au <code>g</code> du <code>svg</code>, puis récupère-le avec jQuery (vérifie avec un <code>console.log</code>) :</p>', src: 'TP2 p. 2', code: 'var gChart = $("#identifiantDuG");' },
          { html: '<p>Ajoute les rectangles : largeur constante 40, hauteur = valeur, x de 50 en 50 comme les graduations de l\'axe X, y = hauteur du graphique − hauteur de la barre (l\'axe y descend).</p>', src: 'TP2 p. 3',
            code: `var i = 0;
var str = gChart.html();
for (var key in barLengths) {
	str += '<rect ';
		str += 'width="40" ';
		str += 'height="'+barLengths[key]+'" ';
		str += 'x="'+(i*50)+'" ';
		str += 'y="'+(400-barLengths[key])+'" ';
		str += 'fill="teal" '
	str += '/>';
	i++;
}
gChart.html(str);`, figs: [fig('tp2-fig2.webp', 'Figure 2')] },
          { html: '<p>Débuguer : la <b>console</b> montre les erreurs JavaScript, l\'<b>inspecteur</b> montre le SVG produit. Le TP demande ensuite de modifier <code>exo1.json</code> pour voir le graphique se mettre à jour : dans ce labo les fichiers de données sont en lecture seule, fais-le sur ta copie locale.</p><p>Limite : les axes sont fixes, le code ne marche plus au-delà de la lettre F ou de 420 occurrences. D3 réglera ça.</p>' },
        ],
      },
      {
        id: 'tp2-e2', short: 'Exo 2 · nuage interactif', save: 'exo2.html',
        t: 'Exercice 2 — Nuage de points interactif',
        goal: 'Placer les réalisateurs de <code>exo2.json</code> selon le nombre de films réalisés (<code>realise</code>, axe X) et joués (<code>joue</code>, axe Y), avec une infobulle au survol.',
        start: { html: tp2e2 }, files: ['exo2.json'], libs: ['jquery.min.js'],
        steps: [
          { html: '<p>Les axes sont dans le <code>g</code> <code>axes</code> ; deux <code>g</code> vides attendent : <code>points</code> (les cercles) et <code>infobulle</code>. En t\'inspirant de l\'exercice 1, charge <code>exo2.json</code> (vérifie avec un <code>console.log</code>).</p>', figs: [fig('tp2-fig3.webp', 'Figure 3')] },
          { html: '<p>Crée le nuage dans le <code>g</code> <code>points</code> : des <code>circle</code> au lieu de <code>rect</code>, rayon fixe 10, <code>cx</code> et <code>cy</code> calculés à partir de <code>realise</code> et <code>joue</code> multipliés par 10. Pas de somme à calculer cette fois.</p>', figs: [fig('tp2-fig4.webp', 'Figure 4')] },
          { html: '<p>Ajoute à chaque cercle deux évènements :</p>', src: 'TP2 p. 5',
            code: `str += '<circle ';
	…
	str += 'onmouseover="drawInfobulle()"';
	str += 'onmouseleave="removeInfobulle()"';
str += '/>';`, note: 'Le « … » représente les attributs du cercle que tu as déjà écrits.' },
          { html: '<p>Crée les deux fonctions <b>en dehors</b> de la fonction de chargement, pour vérifier que les évènements se déclenchent :</p>', src: 'TP2 p. 5',
            code: `function drawInfobulle(){
	console.log("drawInfobulle");
}

function removeInfobulle(){
	console.log("removeInfobulle");
}` },
          { html: '<p>Passe l\'indice du réalisateur (sa position dans <code>data</code>) en paramètre de <code>drawInfobulle()</code> lors de la création du cercle, et vérifie :</p>', src: 'TP2 p. 6',
            code: `function drawInfobulle(id_realisateur){
	console.log(id_realisateur);
}` },
          { html: '<p>Remplace par <code>console.log(data[id_realisateur]);</code> : erreur <code>Uncaught ReferenceError: data is not defined</code>, car <code>data</code> est locale à la fonction de chargement. Déclare une variable globale tout en haut du script, remplis-la juste après le chargement, et utilise-la :</p>', src: 'TP2 p. 6',
            code: `var dataGlobale ;` },
          { html: '', src: 'TP2 p. 6', code: 'dataGlobale = data;' },
          { html: '', src: 'TP2 p. 6', code: 'console.log(dataGlobale[id_realisateur]);' },
          { html: '<p>Contenu de l\'infobulle, dans <code>drawInfobulle()</code> :</p>', src: 'TP2 p. 6-7',
            code: `var infobulle = $("#infobulle");
var str = '';

str += '<rect x="0" y="0" width="370" height="90" fill="black" fill-opacity="0.1" rx="5" ry="5" />';

str += '<text x="5" y="20" fill="black">'+dataGlobale[id_realisateur]["nom"]+'</text>';

str += '<text x="5" y="40" fill="black">Nationalité : '+dataGlobale[id_realisateur]["nationalite"]+'</text>';

str += '<text x="5" y="60" fill="black">Date de naissance : '+dataGlobale[id_realisateur]["naissance"]+'</text>';

str += '<text x="5" y="80" fill="black">Film remarquable : '+dataGlobale[id_realisateur]["film"]+'</text>';

infobulle.html(str);`, note: RECOLLE, figs: [fig('tp2-fig4-1.webp', 'Figure 4.1')] },
          { html: '<p>Pour que l\'infobulle disparaisse, vide le <code>g</code> dans <code>removeInfobulle()</code> :</p>', src: 'TP2 p. 7',
            code: `var infobulle = $("#infobulle");
infobulle.html("");` },
          { html: '<p>Place l\'infobulle à côté du réalisateur survolé (le <code>g</code> est en (50,50) par défaut) :</p>', src: 'TP2 p. 7',
            code: `infobulle.attr(
	"transform",
	"translate("+(60+10*dataGlobale[id_realisateur]["realise"])+","+(410-10*dataGlobale[id_realisateur]["joue"])+")"
);`, note: RECOLLE, figs: [fig('tp2-fig4-2.webp', 'Figure 4.2')] },
        ],
      },
      {
        id: 'tp2-e3', short: 'Exo 3 · lignes (entraînement)', save: 'exo3.html',
        t: 'Exercice 3 (entraînement) — Diagramme en lignes',
        goal: '<code>exo3.json</code> contient trois séries A, B et C. Affiche-les dans un diagramme en lignes avec des chemins (<code>path</code>), en t\'inspirant des exercices précédents.',
        start: { html: tp2e3 }, files: ['exo3.json'], libs: ['jquery.min.js'],
        steps: [
          { html: '<p>Les axes sont fournis et le <code>g</code> <code>lines</code> attend tes chemins. Rappel du TP 1 : un chemin se décrit dans <code>d</code> avec <code>M</code> puis des <code>L</code>.</p>', figs: [fig('tp2-fig5.webp', 'Figure 5')] },
        ],
      },
    ],
  },
  {
    id: 'tp3', short: 'TP3 · D3 (1)', folder: 'tp3',
    t: 'TP 3 — D3 (1) : échelles, axes, zoom, lignes',
    d: '<p>D3.js (Data-Driven Documents) : très flexible mais bas niveau. Si la visualisation est basique, une librairie de plus haut niveau (vis.js) suffit ; sinon, D3. Ici on crée des <b>axes dynamiques</b> qui s\'adaptent aux données, grâce aux <b>échelles</b>.</p>',
    exos: [
      {
        id: 'tp3-e1', short: 'Exo 1 · barres D3', save: 'exo1.html',
        t: 'Exercice 1 — Diagramme en barres avec axes dynamiques',
        goal: 'Refaire le diagramme en barres de <code>exo1.json</code> en D3, avec des axes créés à partir des données.',
        start: { html: tp3e1 }, files: ['exo1.json', 'exo1G.json'], libs: ['d3.min.js'],
        steps: [
          { html: '<p>Importe D3 dans l\'en-tête :</p>', src: 'TP3 p. 2', code: '<script type="text/javascript" src="d3.min.js"></script>' },
          { html: '<p>Dans une nouvelle balise <code>script</code>, importe le fichier JSON (bien plus simple qu\'en jQuery) :</p>', src: 'TP3 p. 2',
            code: `d3.json("exo1.json").then(function(data) {
	console.log(data);
});` },
          { html: '<p>Compte les lettres, sans connaître la liste des lettres à l\'avance (le code reste valable si une lettre est ajoutée) :</p>', src: 'TP3 p. 2',
            code: `var barLengths = {};
for(i=0;i<data.length;i++){
	if(barLengths[data[i]] == undefined){
		barLengths[data[i]] = 1;
	}
	else{
		barLengths[data[i]] = barLengths[data[i]]+1;
	}
}` },
          { html: '<p>Comprendre les <b>échelles</b> : une échelle transforme une valeur de l\'intervalle de départ (<code>domain</code>) en une valeur de l\'intervalle d\'arrivée (<code>range</code>). Ici <code>scale(2)</code> donne 200 et <code>scale(7.5)</code> donne 750.</p>', src: 'TP3 p. 2-3',
            code: `var scale = d3.scaleLinear();
scale.domain([0,10]);
scale.range([0,1000]);

console.log(scale(2));
console.log(scale(7.5));`, note: '<details><summary>Question du TP : que vaut <code>scale(5)</code> si le range est [100,1100] ?</summary>600 : le milieu de [0,10] va au milieu de [100,1100]. Vérifie en changeant le range.</details>' },
          { html: '<p>Avec un domaine de valeurs <b>discrètes</b>, <code>d3.scaleBand()</code> répartit les éléments uniformément : A → 0, B → 200, C → 400, D → 600, E → 800.</p>', src: 'TP3 p. 3',
            code: `var scale = d3.scaleBand();
scale.domain(["A","B","C","D","E"]);
scale.range([0,1000]);

console.log(scale("A"));
console.log(scale("B"));
console.log(scale("C"));
console.log(scale("D"));
console.log(scale("E"));`, note: 'Mets ensuite toutes ces lignes de test en commentaire.' },
          { html: '<p>Échelle des hauteurs : domain [0, max des données], range [0,450] (marge pour les axes). Définis au-dessus de la fonction de chargement une fonction qui calcule le maximum ; vérifie qu\'elle renvoie 400.</p>', src: 'TP3 p. 4',
            code: `function maxData(d){
	var m = 0;
	for (var key in d){
		if(d[key] > m){
			m = d[key]
		}
	}
	return m;
}` },
          { html: '', src: 'TP3 p. 4',
            code: `var scaleY = d3.scaleLinear();
scaleY.domain([0,maxData(barLengths)]);
scaleY.range([0,450]);` },
          { html: '<p>Échelle des positions en X : domain = tableau des étiquettes, même range (le SVG est carré).</p>', src: 'TP3 p. 4',
            code: `function tabOfKeys(d){
	var t = [];
	var i = 0;
	for (var key in d){
		t[i] = key;
		i++;
	}
	return t;
}` },
          { html: '', src: 'TP3 p. 4',
            code: `var scaleX = d3.scaleBand();
scaleX.domain(tabOfKeys(barLengths));
scaleX.range([0,450]);` },
          { html: '<p>Crée les axes (étiquettes en dessous / à gauche ; il existe aussi <code>d3.axisTop()</code> et <code>d3.axisRight()</code>) :</p>', src: 'TP3 p. 4',
            code: `var xAxis = d3.axisBottom(scaleX);
var yAxis = d3.axisLeft(scaleY);` },
          { html: '<p>Récupère le SVG (syntaxe proche de jQuery), puis ajoute un <code>g</code> par axe, appelle l\'axe avec <code>call</code> et positionne-le avec une translation :</p>', src: 'TP3 p. 5', code: 'var svg = d3.select("#vis");' },
          { html: '', src: 'TP3 p. 5',
            code: `var gxAxis = svg.append("g");
gxAxis.call(xAxis);
gxAxis.attr("transform","translate(30,460)");

var gyAxis = svg.append("g");
gyAxis.call(yAxis);
gyAxis.attr("transform","translate(30,10)");`, figs: [fig('tp3-fig1-1.webp', 'Figure 1.1 — étiquettes Y inversées'), fig('tp3-fig1-2.webp', 'Figure 1.2 — range [450,0]')] },
          { html: '<p>Les étiquettes de l\'axe Y sont inversées (l\'axe y du SVG descend) : <b>inverse le range de <code>scaleY</code></b>, qui devient <code>[450,0]</code>. Charge ensuite <code>exo1G.json</code> (500 « G » en plus) : l\'axe X affiche G et l\'axe Y monte à 500.</p>' },
          { html: '<p>Les barres vont dans un nouveau <code>g</code> :</p>', src: 'TP3 p. 5',
            code: `var gBarres = svg.append("g");
gBarres.attr("transform","translate(30,10)");` },
          { html: '<p>Rectangle de test pour comprendre la syntaxe D3 :</p>', src: 'TP3 p. 5-6',
            code: `var barre = gBarres.append("rect");
barre.attr("width", 50);
barre.attr("height", 50);
barre.attr("x", 70);
barre.attr("y", 90);
barre.attr("fill", "orange");`, figs: [fig('tp3-fig2-1.webp', 'Figure 2.1')] },
          { html: '<p>Supprime-le et remplace-le par la boucle des barres. <code>scaleX.bandwidth()</code> = largeur d\'une bande (moins 2 pixels pour séparer les barres) ; hauteur = 450 − <code>scaleY(valeur)</code> puisque le range est inversé ; +1 en x pour ne pas chevaucher l\'axe Y.</p>', src: 'TP3 p. 6',
            code: `for (var key in barLengths) {
	var barre = gBarres.append("rect");
	barre.attr("width", scaleX.bandwidth()-2);
	barre.attr("height", 450-scaleY(barLengths[key]));
	barre.attr("x", 1+scaleX(key));
	barre.attr("y", scaleY(barLengths[key]));
	barre.attr("fill", "teal");
}`, figs: [fig('tp3-fig2-2.webp', 'Figure 2.2')] },
          { html: '<p>Version chaînée, sans variable <code>barre</code> (même résultat) :</p>', src: 'TP3 p. 6-7',
            code: `gBarres.append("rect")
	.attr("width", scaleX.bandwidth()-2)
	.attr("height", 450-scaleY(barLengths[key]))
	.attr("x", 1+scaleX(key))
	.attr("y", scaleY(barLengths[key]))
	.attr("fill", "teal");` },
        ],
      },
      {
        id: 'tp3-e2', short: 'Exo 2 · zoom', save: 'exo1-zoom.html',
        t: 'Exercice 2 — Ajouter un zoom',
        goal: 'Ajouter un zoom (molette) et un déplacement (glisser) au graphique de l\'exercice 1.',
        start: { from: 'tp3-e1' }, files: ['exo1.json', 'exo1G.json'], libs: ['d3.min.js'],
        steps: [
          { html: '<p>Tu repars de ton code de l\'exercice 1. Affiche la bordure du SVG en ajoutant à la balise <code>svg</code> :</p>', src: 'TP3 p. 7', code: 'style="border: 1px solid gray"' },
          { html: '<p>Sous la ligne <code>var svg = d3.select("#vis");</code>, ajoute un <code>g</code> qui contiendra tous les autres :</p>', src: 'TP3 p. 7', code: 'var gGlobal = svg.append("g");' },
          { html: '<p>Ajoute <code>gxAxis</code>, <code>gyAxis</code> et <code>gBarres</code> dans <code>gGlobal</code> au lieu du SVG. Par exemple, la ligne</p>', src: 'TP3 p. 7', code: 'var gxAxis = svg.append("g");' },
          { html: '<p>devient</p>', src: 'TP3 p. 7', code: 'var gxAxis = gGlobal.append("g");', figs: [fig('tp3-fig3.webp', 'Figure 3 — un g qui contient les 3 autres')] },
          { html: '<p>Le zoom :</p>', src: 'TP3 p. 7',
            code: `var z = d3.zoom();
z.on("zoom", function({transform}){
	gGlobal.attr("transform", transform);
});
svg.call(z);` },
        ],
      },
      {
        id: 'tp3-e3', short: 'Exo 3 · lignes D3', save: 'exo3.html',
        t: 'Exercice 3 — Diagramme en lignes avec D3',
        goal: 'Le fichier <code>exo3.html</code> crée déjà les axes (tu dois savoir refaire ces lignes). Il reste à créer les lignes à l\'endroit indiqué par le <code>TODO</code>.',
        start: { html: tp3e3 }, files: ['exo3.json'], libs: ['d3.min.js'],
        steps: [
          { html: '<p>Dans la boucle, ajoute un chemin par série dans <code>gLignes</code> :</p>', src: 'TP3 p. 8',
            code: `gLignes.append("path")
	.attr("d", lValues(data[j]["valeurs"]))
	.attr("stroke", "teal")
	.attr("fill", "none");` },
          { html: '<p><code>lValues</code> fabrique les points du chemin (l\'attribut <code>d</code> du TP 1) ; définis-la <b>juste avant le <code>for</code></b>. x = position i dans la série × écart entre deux points (taille de la fenêtre / (nombre d\'éléments − 1)) ; y = taille de la fenêtre − valeur mise à l\'échelle.</p>', src: 'TP3 p. 8',
            code: `var lValues = d3.line();
lValues.x(function(d,i) {
	return (450/(nbValParLigne(data)-1))*i;
});
lValues.y(function(d,i) {
	return 450-scaleY(d);
});`, note: 'Le texte du TP écrit <code>data[i]["valeurs"]</code>, mais la boucle du fichier utilise <code>j</code>. Compare ton résultat à la figure 4.1 : selon le <code>range</code> de <code>scaleY</code> déjà défini dans le fichier, les lignes peuvent apparaître à l\'envers.', figs: [fig('tp3-fig4-1.webp', 'Figure 4.1')] },
          { html: '<p>Couleurs : avant la boucle, une échelle ordinale de couleurs avec le modèle <code>schemeCategory10</code>…</p>', src: 'TP3 p. 9', code: 'var colorScale = d3.scaleOrdinal(d3.schemeCategory10);' },
          { html: '<p>… puis utilise-la pour <code>stroke</code> avec l\'indice du chemin :</p>', src: 'TP3 p. 9', code: '.attr("stroke", colorScale(j))', figs: [fig('tp3-fig4-2.webp', 'Figure 4.2')] },
        ],
      },
    ],
  },
  {
    id: 'tp4', short: 'TP4 · D3 (2)', folder: 'tp4',
    t: 'TP 4 — D3 (2) : nuage de points COVID-19 et sélection',
    d: '<p>Données COVID-19 simplifiées (dernières valeurs de chaque pays au 19/07/2020, Our World in Data). On révise échelles et axes, on passe en échelle logarithmique, on code 4 variables, puis on sélectionne des points avec un <b>brush</b>.</p>',
    exos: [
      {
        id: 'tp4-e1', short: 'Exo 1 · nuage COVID', save: 'exo1.html',
        t: 'Exercice 1 — Nuage de points cas / morts',
        goal: 'Chaque pays est un point placé selon <code>total_cases</code> (axe X) et <code>total_deaths</code> (axe Y).',
        start: { html: tp4e1 }, files: ['exo1.json'], libs: ['d3.min.js'],
        steps: [
          { html: '<p>En t\'inspirant du TP précédent, crée les échelles (deux <code>scaleLinear</code>, valeurs continues) et les axes. Définis une fonction qui renvoie la valeur maximale de chaque variable pour les <code>domain</code>.</p>', figs: [fig('tp4-fig1.webp', 'Figure 1')] },
          { html: '<p>Un petit triangle par pays. D3 n\'a pas d\'objet pour le <code>polygon</code> SVG : on utilise un chemin fermé.</p>', src: 'TP4 p. 2',
            code: `var gTriangles = svg.append("g");
gTriangles.attr("transform","translate(40,10)");
for (var i=0; i<data.length; i++){
	var tr = gTriangles.append("path");
	tr.attr("d", triangle);
	tr.attr("fill", "teal");
	tr.attr("transform",
		"translate(" + scaleX(data[i]["total_cases"])+","
		+ scaleY(data[i]["total_deaths"])
		+ ")"
	);
}` },
          { html: '<p>Définis <code>triangle</code> avant la boucle :</p>', src: 'TP4 p. 2', code: 'var triangle = d3.line()([[0, 0], [3, -6], [6, 0]]);', figs: [fig('tp4-fig2-1.webp', 'Figure 2.1')] },
          { html: '<p>Peu lisible : passe en <b>échelles logarithmiques</b> en remplaçant <code>d3.scaleLinear()</code> par <code>d3.scaleLog()</code>. log(0) n\'existe pas : fais commencer les <code>domain</code> à 1 et ne crée un triangle que si cas et morts sont strictement positifs :</p>', src: 'TP4 p. 3',
            code: `if(data[i]["total_cases"]>0 && data[i]["total_deaths"]>0){
	…
}`, note: 'Le « … » représente le corps de la boucle.', figs: [fig('tp4-fig2-2.webp', 'Figure 2.2')] },
          { html: '<p>Infobulle simple avec le nom du pays (<code>location</code>) :</p>', src: 'TP4 p. 3', code: 'tr.append("title").text(data[i]["location"]);', figs: [fig('tp4-fig3-1.webp', 'Figure 3.1')] },
          { html: '<p>Ajoute une bordure au SVG et le zoom de l\'exercice 2 du TP 3.</p>', figs: [fig('tp4-fig3-2.webp', 'Figure 3.2')] },
          { html: '<p><b>Orientation</b> : triangle vers le haut si le pays a de nouveaux cas, vers le bas sinon. Remplace l\'ancienne ligne <code>triangle</code> par :</p>', src: 'TP4 p. 3',
            code: `var triangleUp = d3.line()([[0, 0], [3, -6], [6, 0]]);
var triangleDown = d3.line()([[0, -6], [3, 0], [6, -6]]);` },
          { html: '<p>… et choisis la bonne au moment de donner l\'attribut <code>d</code> :</p>', src: 'TP4 p. 3',
            code: `if(data[i]["new_cases"]==0){
	tr.attr("d", triangleDown);
}
else {
	tr.attr("d", triangleUp);
}`, figs: [fig('tp4-fig4-1.webp', 'Figure 4.1')] },
          { html: '<p><b>Teinte</b> selon le continent : une échelle ordinale de couleurs avant la boucle, puis le <code>fill</code> :</p>', src: 'TP4 p. 4', code: 'var colorScale = d3.scaleOrdinal(d3.schemeCategory10);' },
          { html: '', src: 'TP4 p. 4', code: 'tr.attr("fill", colorScale(data[i]["continent"]));', figs: [fig('tp4-fig4-2.webp', 'Figure 4.2')] },
          { html: '<p>Opacité 0,5 pour voir les points superposés :</p>', src: 'TP4 p. 4', code: 'tr.attr("fill-opacity", 0.5);', figs: [fig('tp4-fig5.webp', 'Figure 5')] },
          { html: '<p><b>Sémiologie</b> (à savoir dire) : implantation ponctuelle, chaque point = un pays ; position x = nombre de cas ; position y = nombre de morts ; <b>orientation</b> de la forme = nouveaux cas ou non ; <b>teinte</b> = continent. 4 variables : <code>total_cases</code>, <code>total_deaths</code>, <code>new_cases</code>, <code>continent</code>. La forme triangle elle-même ne représente rien.</p>' },
        ],
      },
      {
        id: 'tp4-e2', short: 'Exo 2 · brush', save: 'exo1-brush.html',
        t: 'Exercice 2 — Sélection avec un brush',
        goal: 'Sélectionner les triangles situés dans un rectangle tracé à la souris.',
        start: { from: 'tp4-e1' }, files: ['exo1.json'], libs: ['d3.min.js'],
        steps: [
          { html: '<p>Tu repars de ton exercice 1. <b>Supprime le zoom.</b> Pour parcourir les triangles, stocke-les : déclare le tableau juste avant la boucle de création…</p>', src: 'TP4 p. 5', code: 'var triangles = [];' },
          { html: '<p>… et remplis-le dans la boucle (vérifie avec un <code>console.log</code>) :</p>', src: 'TP4 p. 5', code: 'triangles[i]=tr;' },
          { html: '<p>Ajoute le brush :</p>', src: 'TP4 p. 5',
            code: `var b = d3.brush();
b.on("brush", function({selection}){
	// Le code placé ici est appelé quand l’utilisateur sélectionne un rectangle
});
gGlobal.call(b);`, figs: [fig('tp4-fig6-1.webp', 'Figure 6.1')] },
          { html: '<p>Le brush donne les coins du rectangle : <code>selection[0][0]</code>, <code>selection[0][1]</code> (haut gauche) et <code>selection[1][0]</code>, <code>selection[1][1]</code> (bas droite). Remplis la fonction pour passer les triangles sélectionnés à une opacité de 1 :</p>', src: 'TP4 p. 6',
            code: `for(i=0;i<data.length;i++){
	if(data[i]["total_cases"]>0 &&
	   data[i]["total_deaths"]>0){
		var pos_x = scaleX(data[i]["total_cases"])+40;
		var pos_y = scaleY(data[i]["total_deaths"])+10;
		if( pos_x >= selection[0][0] &&
		    pos_x <= selection[1][0] &&
		    pos_y >= selection[0][1] &&
		    pos_y <= selection[1][1] ){
			triangles[i].attr("fill-opacity", 1);
		}
		else {
			triangles[i].attr("fill-opacity", 0.5);
		}
	}
}`, note: '+40 et +10 : la translation du <code>g</code> des triangles, pour comparer dans le même repère que le rectangle du brush.', figs: [fig('tp4-fig6-2.webp', 'Figure 6.2')] },
        ],
      },
      {
        id: 'tp4-e3', short: 'Exo 3 · autres variables (entraînement)', save: 'exo1-variables.html',
        t: 'Exercice 3 (entraînement) — Autres variables',
        goal: 'Afficher d\'autres variables sur les axes, par exemple <code>total_deaths</code> en fonction de <code>aged_70_older</code> (part des plus de 70 ans) ou de <code>life_expectancy</code>.',
        start: { from: 'tp4-e2' }, files: ['exo1.json'], libs: ['d3.min.js'],
        steps: [
          { html: '<p>Tu repars de ton exercice 2. La sélection sert à calculer sur une partie des données, à mettre en surbrillance dans d\'autres vues ou à afficher le détail d\'éléments.</p>' },
        ],
      },
    ],
  },
  {
    id: 'tp5', short: 'TP5 · D3 (3)', folder: 'tp5',
    t: 'TP 5 — D3 (3) : coordonnées parallèles',
    d: '<p>Coordonnées parallèles : un axe vertical par variable quantitative, une ligne par individu, qui coupe chaque axe à sa valeur. Avantage : beaucoup de variables grâce à la position. Inconvénient : on compare mal deux variables dont les axes ne sont pas voisins.</p>',
    exos: [
      {
        id: 'tp5-e1', short: 'Exo 1 · iris', save: 'exo1.html',
        t: 'Exercice 1 — Coordonnées parallèles des iris',
        goal: '<code>exo1.json</code> : des iris avec l\'espèce et 4 variables quantitatives. Il faut 5 échelles : une pour placer les axes en X, une par variable pour les axes Y.',
        start: { html: tp5e1 }, files: ['exo1.json'], libs: ['d3.min.js'],
        steps: [
          { html: '<p>Comme dans les séances précédentes, charge le fichier JSON avec la fonction D3 appropriée (et importe D3).</p>' },
          { html: '<p>Échelle de l\'axe X : type <b>band</b>, car on transforme un ensemble discret (la liste des variables) en position x.</p>', src: 'TP5 p. 2',
            code: `var numericalAttributes = getNumericalAttributes(data)

var scaleX = d3.scaleBand();
scaleX.domain(numericalAttributes);
scaleX.range([0,650]);` },
          { html: '<p>La fonction qui renvoie la liste des variables quantitatives (parcourt les variables du premier iris et ne garde que les nombres, donc pas <code>species</code>) :</p>', src: 'TP5 p. 2',
            code: `function getNumericalAttributes(d){
	var l = [];
	for (var key in d[0]){
		if(typeof(d[0][key]) == "number"){
			l.push(key);
		}
	}
	return l;
}` },
          { html: '<p>Teste : tu dois obtenir 0, 162.5, 325 et 487.5.</p>', src: 'TP5 p. 2',
            code: `console.log(scaleX("petal_length"));
console.log(scaleX("petal_width"));
console.log(scaleX("sepal_length"));
console.log(scaleX("sepal_width"));` },
          { html: '<p>Une échelle linéaire par variable, rangées dans un tableau :</p>', src: 'TP5 p. 2',
            code: `var scalesY = [];
for (var i = 0; i<numericalAttributes.length; i++){
	scalesY[i] = d3.scaleLinear();
	scalesY[i].domain([minValue(data,numericalAttributes[i]),
	                   maxValue(data,numericalAttributes[i])]);
	scalesY[i].range([450,0]);
}`, note: '<b>À toi d\'écrire <code>minValue</code> et <code>maxValue</code></b> (valeur minimale et maximale de la variable passée en paramètre), en t\'inspirant de <code>maxData</code> du TP 3. Le TP ne donne pas ce code. Cette fois, les axes commencent au minimum des données, pas à 0.' },
          { html: '<p>Teste tes fonctions : tu dois obtenir 4.3, 7.9, 2, 4.4, 1, 6.9, 0.1, 2.5.</p>', src: 'TP5 p. 3',
            code: `console.log(minValue(data,"petal_length"),
	maxValue(data,"petal_length"));
console.log(minValue(data,"petal_width"),
	maxValue(data,"petal_width"));
console.log(minValue(data,"sepal_length"),
	maxValue(data,"sepal_length"));
console.log(minValue(data,"sepal_width"),
	maxValue(data,"sepal_width"));` },
          { html: '<p>L\'axe X (n\'oublie pas de récupérer le SVG avant) :</p>', src: 'TP5 p. 3',
            code: `var xAxis = d3.axisBottom(scaleX);
var gxAxis = svg.append("g");
gxAxis.call(xAxis);
gxAxis.attr("transform","translate(30,460)");`, figs: [fig('tp5-fig2.webp', 'Figure 2')] },
          { html: '<p>Cache le trait de l\'axe pour ne garder que les étiquettes :</p>', src: 'TP5 p. 3', code: 'gxAxis.attr("stroke-width",0);', figs: [fig('tp5-fig3.webp', 'Figure 3')] },
          { html: '<p>Les axes Y. Le x de la translation = 30 (décalage, comme l\'axe X) + <code>scaleX.bandwidth()/2</code> (pour centrer l\'axe au-dessus de son étiquette) + <code>scaleX(numericalAttributes[i])</code> (début de la zone de la variable).</p>', src: 'TP5 p. 3',
            code: `for (var i = 0; i<numericalAttributes.length; i++){
	var yAxis = d3.axisLeft(scalesY[i]);
	var gyAxis = svg.append("g");
	gyAxis.call(yAxis);
	gyAxis.attr("transform",
		"translate("+(30+scaleX.bandwidth()/2+scaleX(numericalAttributes[i]))+",10)"
	);
}`, note: RECOLLE, figs: [fig('tp5-fig4.webp', 'Figure 4'), fig('tp5-fig5.webp', 'Figure 5 — calcul du x')] },
          { html: '<p>Les chemins : un par iris, un point par variable (création des points de l\'attribut <code>d</code>, puis création du <code>path</code>).</p>', src: 'TP5 p. 4-5',
            code: `var gLines = svg.append("g");
var paths = [];

for(i=0;i<data.length;i++){

	var l = [];
	for (var j = 0; j<numericalAttributes.length; j++){
		l[j] = [scaleX(numericalAttributes[j]) + scaleX.bandwidth()/2,
			scalesY[j](data[i][numericalAttributes[j]])
		]
	}

	paths[i] = gLines.append("path");
	paths[i].attr("d", d3.line()(l));
	paths[i].attr("transform", "translate(30,10)");
	paths[i].attr("stroke", "teal");
	paths[i].attr("fill", "none");

}`, note: '<code>d3.line()(tableauDePoints)</code> fabrique la valeur de l\'attribut <code>d</code> du chemin.', figs: [fig('tp5-fig6.webp', 'Figure 6')] },
          { html: '<p>La <b>couleur</b> des chemins doit représenter l\'espèce (comme l\'exercice 1 du TP 4). Pour ne pas écrire le nom de la variable dans le code, écris une fonction qui renvoie le nom de la variable nominale, sur le modèle de <code>getNumericalAttributes</code> : tes coordonnées parallèles marcheront alors avec n\'importe quel fichier (une variable nominale + des variables quantitatives). Ce code-là n\'est pas fourni.</p>' },
          { html: '<p>Astuce : déclare le <code>g</code> des lignes <b>avant</b> ceux des axes (juste après <code>gGlobal</code>), pour que les étiquettes passent au-dessus des lignes :</p>', src: 'TP5 p. 5', code: 'var gLines = gGlobal.append("g");', figs: [fig('tp5-fig1.webp', 'Figure 1 — résultat attendu')] },
          { html: '<p><b>Sémiologie</b> : implantation linéaire, chaque ligne = un iris ; positions x des points = les variables quantitatives ; positions y = leurs valeurs ; <b>teinte</b> de la ligne = espèce.</p>' },
        ],
      },
      {
        id: 'tp5-e2', short: 'Exo 2 · brush', save: 'exo1-brush.html',
        t: 'Exercice 2 — Surbrillance avec un brush',
        goal: 'Mettre en surbrillance les iris dont un point est dans le rectangle sélectionné. Exemple de question : les iris aux sépales les moins larges ont-ils aussi les pétales les moins larges ?',
        start: { from: 'tp5-e1' }, files: ['exo1.json'], libs: ['d3.min.js'],
        steps: [
          { html: '<p>Tu repars de ton exercice 1. Ajoute un brush vide et vérifie que tu peux dessiner et déplacer le rectangle (exercice 2 du TP 4).</p>', src: 'TP4 p. 5',
            code: `var b = d3.brush();
b.on("brush", function({selection}){
	// Le code placé ici est appelé quand l’utilisateur sélectionne un rectangle
});
gGlobal.call(b);` },
          { html: '<p>Remplis la fonction : (1) opacité 0,1 pour toutes les lignes, (2) opacité 1 pour une ligne dont un point est dans le rectangle.</p>', src: 'TP5 p. 7',
            code: `for(i=0;i<data.length;i++){
	paths[i].attr("stroke-opacity", 0.1);
	for (var j = 0; j<numericalAttributes.length; j++){
		var pos_x = 30 + scaleX(numericalAttributes[j]) +
			scaleX.bandwidth()/2;
		var pos_y = 10 +
			scalesY[j](data[i][numericalAttributes[j]]);
		if(pos_x >= selection[0][0] &&
		   pos_x <= selection[1][0] &&
		   pos_y >= selection[0][1] &&
		   pos_y <= selection[1][1] ){
			paths[i].attr("stroke-opacity", 1);
		}
	}
}`, figs: [fig('tp5-fig7.webp', 'Figure 7')] },
          { html: '<p>Réponse du TP : non, les iris aux sépales les moins larges ont des pétales de largeur moyenne ou élevée, sauf un (valeur 2.3). On voit une corrélation entre les deux dernières variables (<code>sepal_length</code> / <code>sepal_width</code>), mais pas entre les autres paires voisines.</p>' },
        ],
      },
      {
        id: 'tp5-e3', short: 'Exo 3 · COVID (entraînement)', save: 'covid-parallele.html',
        t: 'Exercice 3 (entraînement) — Coordonnées parallèles COVID-19',
        goal: 'Adapter tes coordonnées parallèles aux données COVID-19 du TP 4. Dans ce labo le fichier s\'appelle <code>covid.json</code> (à charger à la place de <code>exo1.json</code>).',
        start: { from: 'tp5-e2' }, files: ['covid.json'], libs: ['d3.min.js'],
        steps: [
          { html: '<p>Problèmes à gérer (inutile de rester générique) :</p><ul><li>étiquettes de l\'axe X qui se chevauchent : leur appliquer une rotation ;</li><li>valeurs manquantes : supprimer les pays concernés juste après le chargement ;</li><li>échelle logarithmique pour les axes dont le maximum dépasse 100 ; les valeurs inférieures à 0,1 peuvent être mises à 0,1 (qui se lira alors 0).</li></ul><p>Afficher le nom du pays au survol d\'une ligne (comme au TP 4) ne marche que quand le brush est désactivé.</p>', figs: [fig('tp5-fig8.webp', 'Figure 8')] },
        ],
      },
    ],
  },
];
