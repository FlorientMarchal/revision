// Mémo de code du cours de visualisation. RÈGLE du cours : uniquement le code fourni par l'enseignant.
// Chaque extrait est repris automatiquement du labo (labs.js), lui-même recopié des supports de TP.
import { labs } from './labs.js';

const all = labs.flatMap(l => l.exos.flatMap(x => x.steps.filter(s => s.code).map(s => ({ ...s, exo: x.id }))));
/** L'extrait du labo dont le code commence par `start` (dans l'exercice `exo` si précisé). */
function pick(start, exo) {
  const s = all.find(st => (!exo || st.exo === exo) && st.code.trimStart().startsWith(start));
  if (!s) throw new Error('Extrait introuvable : ' + start);
  return s;
}
const I = (n, start, exo, note) => { const s = pick(start, exo); return { n, code: s.code, note: note ?? (s.src ? 'Source : ' + s.src : '') }; };

export const codesheetNote = 'Pour l\'examen, <b>seuls les codes fournis par l\'enseignant sont acceptés</b> : ce mémo ne contient que ceux des supports de TP, mot pour mot.';

export const codesheet = [
  { part: 'SVG', lang: 'SVG', t: 'Les objets SVG', items: [
    I('Zone de dessin', '<svg width="500"'),
    I('Cercle', '<circle', 'tp1-e1'),
    I('Ligne', '<line'),
    I('Chemin : M (se déplacer), L (ligne)', '<path d="M 50,130'),
    I('Chemin courbe : C (CurveTo) ; Z ferme le chemin', 'd="M 50,130 C'),
    I('Polygone', '<polygon', 'tp1-e1'),
    I('Rectangle (x, y = coin en haut à gauche)', '<rect width="100"'),
    I('Groupe déplacé', '<g transform="translate(150,150)">'),
    I('Texte', '<text'),
  ] },
  { part: 'JavaScript', lang: 'JavaScript', t: 'Charger et dessiner avec jQuery (TP 2)', items: [
    I('Charger un JSON au chargement de la page', '<script type="text/javascript" src="jquery.min.js">'),
    I('Lancer la fonction au chargement', '<body onload'),
    I('Compter les occurrences (lettres connues)', 'var barLengths = {"A":0'),
    I('Récupérer un g avec jQuery', 'var gChart'),
    I('Construire les rectangles dans une chaîne', 'var i = 0;'),
    I('Évènements de survol', "str += '<circle"),
    I('Variable globale pour partager les données', 'var dataGlobale'),
    I('Contenu de l\'infobulle', 'var infobulle = $("#infobulle");\nvar str'),
    I('Vider l\'infobulle', 'var infobulle = $("#infobulle");\ninfobulle.html("")'),
    I('Placer l\'infobulle près du point', 'infobulle.attr('),
  ] },
  { part: 'D3', lang: 'JavaScript', t: 'D3 : données, échelles, axes (TP 3)', items: [
    I('Importer D3', '<script type="text/javascript" src="d3.min.js">'),
    I('Charger un JSON', 'd3.json('),
    I('Compter les occurrences (générique)', 'var barLengths = {};'),
    I('Échelle linéaire', 'var scale = d3.scaleLinear();'),
    I('Échelle de bandes (valeurs discrètes)', 'var scale = d3.scaleBand();'),
    I('Maximum des données', 'function maxData'),
    I('Échelle Y', 'var scaleY = d3.scaleLinear();'),
    I('Tableau des clés', 'function tabOfKeys'),
    I('Échelle X', 'var scaleX = d3.scaleBand();\nscaleX.domain(tabOfKeys'),
    I('Créer les axes', 'var xAxis = d3.axisBottom(scaleX);\nvar yAxis'),
    I('Récupérer le SVG', 'var svg = d3.select("#vis");'),
    I('Ajouter et placer les axes', 'var gxAxis = svg.append("g");\ngxAxis.call(xAxis);\ngxAxis.attr("transform","translate(30,460)");\n\nvar gyAxis', null, 'Range de l\'axe Y inversé : [450,0].'),
  ] },
  { part: 'D3', lang: 'JavaScript', t: 'D3 : objets graphiques (TP 3 à 5)', items: [
    I('Ajouter un rectangle', 'var barre = gBarres.append("rect");\nbarre.attr("width", 50)'),
    I('Les barres d\'un diagramme', 'for (var key in barLengths) {\n\tvar barre'),
    I('Version chaînée', 'gBarres.append("rect")'),
    I('Ligne d\'une série', 'gLignes.append("path")'),
    I('Points d\'une ligne avec d3.line', 'var lValues = d3.line();'),
    I('Triangle (chemin fermé)', 'var triangle = d3.line()'),
    I('Triangles vers le haut / vers le bas', 'var triangleUp'),
    I('Une forme par individu, placée par translation', 'var gTriangles'),
    I('Infobulle simple', 'tr.append("title")'),
  ] },
  { part: 'D3', lang: 'JavaScript', t: 'D3 : couleurs et interaction', items: [
    I('Échelle de couleurs (palette qualitative)', 'var colorScale', 'tp3-e3'),
    I('Couleur selon une variable', 'tr.attr("fill", colorScale'),
    I('Opacité', 'tr.attr("fill-opacity", 0.5);'),
    I('Zoom', 'var z = d3.zoom();'),
    I('Brush (sélection rectangulaire)', 'var b = d3.brush();', 'tp4-e2'),
    I('Objets dans la sélection du brush', 'for(i=0;i<data.length;i++){\n\tif(data[i]["total_cases"]>0 &&'),
  ] },
  { part: 'D3', lang: 'JavaScript', t: 'Coordonnées parallèles (TP 5)', items: [
    I('Variables quantitatives', 'function getNumericalAttributes'),
    I('Échelle X des axes', 'var numericalAttributes'),
    I('Une échelle Y par variable', 'var scalesY'),
    I('Axe X sans trait', 'gxAxis.attr("stroke-width",0);'),
    I('Les axes Y', 'for (var i = 0; i<numericalAttributes.length; i++){\n\tvar yAxis'),
    I('Une ligne par individu', 'var gLines = svg.append("g");'),
    I('Surbrillance avec le brush', 'for(i=0;i<data.length;i++){\n\tpaths[i]'),
  ] },
];
