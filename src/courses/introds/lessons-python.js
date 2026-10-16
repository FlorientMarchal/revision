// Leçons de la partie « bases de Python » (G. Richomme), rédigées à partir des notebooks corrigés du cours.
const R = String.raw;
const box = (k, title, html) => `<div class="box ${k}"><div class="box-h">${title}</div>${html}</div>`;
const def = (t, h) => box('def', 'Définition · ' + t, h);
const prop = (t, h) => box('prop', t, h);
const ex = (t, h) => box('ex', 'Exemple · ' + t, h);
const warn = (t, h) => box('warn', 'Attention · ' + t, h);
const method = (t, h) => box('method', 'Méthode · ' + t, h);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const code = (src, out) => `<pre class="code"><code>${esc(src.trim())}</code></pre>` + (out ? `<pre class="code-out">${esc(out.trim())}</pre>` : '');

export const lessonsPy = [
  /* ===================================================================== */
  {
    id: 'py1', ch: 'pybase', short: 'Démarrer', src: 'Notebooks 01, 02, 03 + diapos de lancement',
    t: 'Démarrer : notebook, variables, affichage, structures de contrôle',
    sub: "L'esprit de la partie Python (passe-partout et pythonesque), le notebook Jupyter, l'affichage formaté, la saisie, les conditions, les boucles while et for, et un premier programme complet : l'estimation de π par Monte-Carlo.",
    goals: [
      "Savoir ce qu'attend l'examen : écrire vite et sans aide un traitement de base, <b>dans les deux styles</b> (passe-partout et pythonesque).",
      'Utiliser un notebook : cellules, exécution, redémarrage du noyau.',
      'Afficher proprement avec <code>print</code> (<code>sep</code>, <code>end</code>) et <code>format</code> ; convertir une saisie <code>input</code>.',
      'Écrire des <code>if / elif / else</code>, des <code>while</code> et des <code>for</code> (<code>range</code>, <code>for elt in</code>, <code>enumerate</code>) et savoir lequel choisir.',
      'Programmer la méthode de Monte-Carlo avec le module <code>random</code>.',
    ],
    sections: [
      { id: 'esprit', t: "L'esprit du cours et de l'examen", sub: 'Passe-partout vs pythonesque', html: R`
<p>La partie « bases de Python » (G. Richomme) compte pour <b>25 % de la note</b> : un examen d'environ <b>3/4 d'heure, sur papier, sans document</b> (en seconde session, elle forme un tiers de la partie papier). L'objectif affiché : <b>être capable d'écrire rapidement des traitements basiques en style pythonesque <i>et</i> en style passe-partout… sans aide</b> (ni IA, ni documentation). Il faut aussi savoir <b>vérifier</b> un code écrit par un tiers (ou une IA, qui « ne donne qu'un texte probable »).</p>
${def('les deux approches', R`<ul>
<li><b>Approche passe-partout (générique)</b> : un code transposable dans presque tout langage impératif (C, Java, Pascal…) : boucles sur les <b>indices</b>, <code>while</code> + <b>drapeau</b>, pas de fonctions toutes faites.</li>
<li><b>Approche pythonesque</b> : on utilise les spécificités de Python : <code>for elt in liste</code>, <code>enumerate</code>, listes par compréhension, <code>in</code>, <code>sum</code>, <code>any</code>, <code>all</code>, <code>sorted</code>, ensembles, dictionnaires…</li></ul>
<p>Le cours répète qu'il faut maîtriser <b>les deux</b> : le passe-partout est le savoir de base (utile pour un nouveau langage plus pauvre) ; le pythonesque est le savoir plus « professionnel », mais attention à la lisibilité et il oblige à suivre les évolutions du langage.</p>`)}
${method('les règles du style passe-partout (diapos du cours, liste non exhaustive)', R`<ul>
<li><code>while</code> quand on <b>ne connaît pas</b> le nombre d'itérations ; <code>for i in range(…)</code> quand on le connaît.</li>
<li>Pas de <code>for element in liste</code> : on passe par les <b>indices</b>.</li>
<li>Pas de <code>in</code> en dehors de <code>for … in range(…)</code>.</li>
<li><b>Pas de <code>return</code> à l'intérieur d'une boucle</b>, pas de <code>break</code>, pas de <code>pass</code>.</li>
<li>Considérer que les expressions booléennes sont évaluées <b>complètement</b> (pas d'évaluation paresseuse).</li>
<li>Pas de liste par compréhension.</li>
<li>Indices uniquement entre <code>0</code> et <code>len(lis)-1</code> (pas d'indice négatif).</li>
<li>Pas d'affectation multiple (<code>a, b = b, a</code>).</li></ul>`)}
${method('avant de coder : spécifier', R`<p>Avant d'écrire une fonction, il faut savoir :</p><ul>
<li><b>sur quoi on travaille</b> : les données (paramètres) et leurs types ;</li>
<li><b>quel résultat et où</b> : type du résultat retourné (éviter les affichages, pour la réutilisabilité) ;</li>
<li><b>les conditions de fonctionnement</b> : préconditions sur les données (si elles ne sont pas remplies, on ne sait pas faire), postconditions sur le résultat ;</li>
<li><b>les valeurs particulières</b> (liste vide, un seul élément…) : éviter des comportements ou types de retour différents.</li></ul>
<p>Cette réflexion doit apparaître dans la <b>docstring</b> et sert à prévoir les <b>tests</b> (cas particuliers, valeurs limites ; on ne teste pas hors préconditions).</p>`)}
<p>Deux schémas de base reviennent sans cesse : <b>parcours de tous les éléments</b> (→ <code>for</code>) et <b>arrêt dès que le résultat est trouvé</b> (→ <code>while</code> en passe-partout ; en Python, souvent <code>in</code>, <code>any</code>, <code>all</code>).</p>
` },
      { id: 'notebook', t: 'Le notebook Jupyter', sub: 'Cellules, exécution, noyau', html: R`
<p>Un notebook est une suite de <b>cellules</b> : cellules de <b>code</b> (par défaut) ou de texte <b>Markdown</b>. On peut les exécuter dans l'ordre de son choix : ce qui compte est l'ordre réel d'exécution, pas l'ordre à l'écran.</p>
<table class="t"><thead><tr><th>Touche</th><th>Effet</th></tr></thead><tbody>
<tr><td>Maj + Entrée</td><td>exécute la cellule et passe à la suivante (en crée une si c'était la dernière)</td></tr>
<tr><td>Alt + Entrée</td><td>exécute et insère une nouvelle cellule en dessous</td></tr>
<tr><td>Ctrl + Entrée</td><td>exécute et reste sur la cellule</td></tr>
<tr><td>Entrée / Échap</td><td>passe en mode édition / en mode commande</td></tr>
</tbody></table>
<ul>
<li><b>Kernel &gt; Restart &amp; Clear Output</b> réinitialise l'interpréteur (toutes les variables sont perdues). Indispensable après la modification d'un module déjà importé (leçon 3).</li>
<li>Dans une cellule, seule la <b>dernière expression évaluée</b> est affichée automatiquement ; pour le reste, il faut <code>print</code>.</li>
<li><code>import this</code> affiche le <i>Zen of Python</i> (« Beautiful is better than ugly », « Readability counts »…).</li>
<li><code>help(objet)</code> affiche la documentation d'une fonction ou d'un module (<code>help(print)</code>, <code>help(random.uniform)</code>). Le cours insiste : il faut apprendre à <b>lire les aides</b>.</li></ul>
` },
      { id: 'affichage', t: 'Variables, affichage et saisie', sub: 'print, format, input', html: R`
<p>Une affectation lie un nom à une valeur ; le type est celui de la valeur. Python permet l'<b>affectation multiple</b> (n'existe pas dans tous les langages).</p>
${code(R`
a, b = 1/3, 2/3
print(a)
print("a =", a, "b =", b)
print("somme =", a + b)
`, R`
0.3333333333333333
a = 0.3333333333333333 b = 0.6666666666666666
somme = 1.0
`)}
${ex('échanger deux variables', R`<p>Avec l'affectation multiple (pythonesque) puis avec une variable temporaire (passe-partout, valable dans tout langage impératif) :</p>
${code(R`
a, b = 1, 2
a, b = b, a          # pythonesque
print(a, b)
tmp = a              # passe-partout
a = b
b = tmp
print(a, b)
`, R`
2 1
1 2
`)}`)}
<p><b>print</b> sépare ses arguments par <code>sep</code> (une espace par défaut) et termine par <code>end</code> (passage à la ligne <code>"\n"</code> par défaut). <code>print(*lis)</code> « déplie » la liste : chaque élément devient un argument.</p>
${code(R`
y = [2, 6, "rouge", True, 3.6]
print(y)
print(*y)
print(*y, sep=" ; ", end=" !\n")
print("a", "b", sep="")
`, R`
[2, 6, 'rouge', True, 3.6]
2 6 rouge True 3.6
2 ; 6 ; rouge ; True ; 3.6 !
ab
`)}
<p>La méthode <b>format</b> remplace les <code>{}</code> d'une chaîne ; on peut préciser un format : <code>{:.3f}</code> (3 chiffres après la virgule), <code>{:^7}</code> (centré sur 7 caractères), <code>{:-&lt;7}</code> (aligné à gauche, complété par des <code>-</code>). <code>\t</code> est une tabulation, <code>\n</code> un passage à la ligne.</p>
${code(R`
a, b = 1/3, 2/3
print("a = {:.3f}, b = {:.3f}, somme = {:.3f}".format(a, b, a + b))
print("{:^7}|{:^7}|{:^7}".format("a", "b", "a+b"))
print("{:-<7}|{:-<7}|{:-<7}".format("", "", ""))
print("{:^7.3f}|{:^7.3f}|{:^7.3f}".format(a, b, a + b))
`, R`
a = 0.333, b = 0.667, somme = 1.000
   a   |   b   |  a+b
-------|-------|-------
 0.333 | 0.667 | 1.000
`)}
<p class="math-note">Les f-strings (<code>f"a = {a:.3f}"</code>) font la même chose de façon plus concise ; les notebooks du cours utilisent surtout <code>format</code>.</p>
${warn('input renvoie toujours une chaîne', R`<p><code>input("…")</code> renvoie une <b>chaîne de caractères</b> (<code>str</code>). Si l'on saisit <code>21</code>, <code>2*x</code> vaut <code>"2121"</code> (répétition de chaîne), pas 42 ! Il faut convertir avec <code>int(…)</code> ou <code>float(…)</code>.</p>
${code(R`
x = "21"            # ce que renverrait input pour la saisie 21
print(2 * x)
x = int(x)          # ou directement : x = int(input("Donnez un entier : "))
print(2 * x)
`, R`
2121
42
`)}`)}
` },
      { id: 'conditions', t: 'Structures conditionnelles', sub: 'if, elif, else et tests', html: R`
<p>L'indentation (4 espaces) délimite les blocs ; la ligne d'en-tête se termine par <code>:</code>. Comparaisons : <code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&lt;=</code>… ; connecteurs : <code>and</code>, <code>or</code>, <code>not</code> ; appartenance : <code>in</code>.</p>
${code(R`
def analyse(x):
    if len(x) == 0:
        print("Erreur : vous n'avez rien saisi")
    elif len(x) >= 2:
        print("Erreur : trop de caractères")
    elif x.isdigit():                 # la chaîne n'est faite que de chiffres
        print("Complément à 10 :", 10 - int(x))
    else:
        print("Erreur : ce n'est pas un chiffre")

for saisie in ["", "42", "7", "a"]:
    analyse(saisie)
`, R`
Erreur : vous n'avez rien saisi
Erreur : trop de caractères
Complément à 10 : 3
Erreur : ce n'est pas un chiffre
`)}
${method('tester un programme à branches', R`<p>Il faut au moins <b>un test par cas possible</b> : ici 4 exécutions (rien, trop long, un chiffre, autre chose). Le cours pose systématiquement la question : « avez-vous fait au moins 4 tests ? ».</p>`)}
<p><code>elif</code> évite d'empiler des <code>else: if …</code>. Attention : une suite de <code>if</code> indépendants (sans <code>elif</code>) teste <b>chaque</b> condition, plusieurs messages peuvent s'afficher.</p>
${code(R`
x = "a"
if x == "a":
    print("première lettre")
if x != "z":
    print("pas la dernière lettre")
if x in ["a", "e", "i", "o", "u", "y"]:
    print("voyelle")
`, R`
première lettre
pas la dernière lettre
voyelle
`)}
` },
      { id: 'boucles', t: 'Boucles : while, for, range, enumerate', sub: 'Et comment choisir', html: R`
${code(R`
i = 1
while i <= 3:
    print(i)
    i += 1          # sinon : boucle infinie
for i in range(1, 4, 1):
    print(i)
`, R`
1
2
3
1
2
3
`)}
${def('range([début], seuil, [pas])', R`<ul><li><code>début</code> vaut 0 par défaut, <code>pas</code> vaut 1 par défaut ;</li>
<li>le <b>seuil n'est jamais atteint</b> (exclu) ;</li>
<li>pour préciser le pas, il faut préciser le début ; le pas peut être négatif.</li></ul>
${code(R`
print(list(range(5)))
print(list(range(2, 10, 3)))
print(list(range(5, 0, -1)))
print(list(range(-1, -6, -1)))
`, R`
[0, 1, 2, 3, 4]
[2, 5, 8]
[5, 4, 3, 2, 1]
[-1, -2, -3, -4, -5]
`)}`)}
<p>Trois façons de parcourir une liste : par indice (générique), par élément (pythonesque), par indice <i>et</i> élément avec <code>enumerate</code> (pythonesque).</p>
${code(R`
fruits = ["poire", "pomme", "banane"]
for i in range(0, len(fruits), 1):          # générique
    print("#{} : {}".format(i + 1, fruits[i]))
for fruit in fruits:                         # pythonesque, sans indice
    print("une {} est un fruit".format(fruit))
for i, fruit in enumerate(fruits):           # pythonesque, avec indice
    print(i, fruit)
`, R`
#1 : poire
#2 : pomme
#3 : banane
une poire est un fruit
une pomme est un fruit
une banane est un fruit
0 poire
1 pomme
2 banane
`)}
${prop('Comment choisir sa structure de contrôle (règle du cours)', R`<ul>
<li><b>Toujours utiliser la structure qui explique le mieux l'algorithme.</b></li>
<li>En passe-partout : <code>for</code> pour un <b>parcours complet</b> (montre le côté systématique) ; <code>while</code> si l'algorithme <b>peut s'arrêter avant la fin</b> (éviter <code>break</code>, <code>continue</code> et <code>return</code> dans les boucles : analyse et débogage vite complexes).</li>
<li>En Python : <code>for elt in liste</code> dès que possible, <code>enumerate</code> si l'on a besoin des indices ; avec <code>range</code>, préciser début et pas peut clarifier l'algorithme.</li></ul>`)}
` },
      { id: 'montecarlo', t: 'Exemple complet : π par Monte-Carlo', sub: 'Module random, compteur, listes', html: R`
<p><b>Principe</b> : on tire <code>nb</code> points <code>(x, y)</code> uniformément dans le carré \([-1,1]^2\) (aire 4) ; la proportion de points dans le disque unité (aire \(\pi\)), c'est-à-dire vérifiant \(x^2+y^2 \le 1\), approche \(\pi/4\). Donc \(\pi \approx 4\,dc/nb\) où <code>dc</code> compte les points « dans le cercle ». La convergence est lente.</p>
<ul><li><code>random.random()</code> renvoie un flottant de \([0, 1)\) ; donc <code>random.random()*2 - 1</code> est dans \([-1, 1)\) ;</li>
<li><code>random.uniform(a, b)</code> fait la même chose directement (trouvé en lisant <code>help(random)</code>) ;</li>
<li><code>random.randint(a, b)</code> renvoie un entier entre <code>a</code> et <code>b</code> <b>inclus</b>.</li></ul>
${code(R`
import random

nb = 1000000
dc = 0
lxin, lyin, lxout, lyout = [], [], [], []
for i in range(nb):            # i ne sert pas : on répète juste nb fois
    x, y = random.uniform(-1, 1), random.uniform(-1, 1)
    if x*x + y*y <= 1:
        dc += 1
        lxin.append(x)
        lyin.append(y)
    else:
        lxout.append(x)
        lyout.append(y)
print(4 * dc / nb)             # environ 3.14, différent à chaque exécution
`)}
<p>Les quatre listes servent ensuite au dessin (<code>plt.scatter(lxin, lyin)</code>…). <code>append</code> ajoute en fin de liste en \(O(1)\).</p>
${warn('import module vs from module import', R`<p>Le cours conseille <code>import random</code> (puis <code>random.uniform(…)</code>) plutôt que <code>from random import *</code> : le préfixe est plus contraignant mais évite que le contenu du module <b>écrase</b> une fonction de même nom définie par l'utilisateur (ici le module <code>random</code> contient justement une fonction <code>random</code>).</p>`)}
` },
    ],
    keep: [
      "Examen : 3/4 h, papier, sans document : savoir écrire le même traitement en <b>passe-partout</b> (indices, <code>while</code> + drapeau) et en <b>pythonesque</b>.",
      "Passe-partout : pas de <code>for elt in</code>, pas de <code>return</code>/<code>break</code> dans une boucle, pas de compréhension, pas d'indice négatif, pas d'affectation multiple.",
      "<code>for</code> pour un parcours complet, <code>while</code> si l'on peut s'arrêter avant la fin ; choisir la structure qui explique le mieux l'algorithme.",
      "<code>range(début, seuil, pas)</code> : le seuil est exclu ; <code>range(5)</code> = 0..4.",
      "<code>input</code> renvoie une chaîne : convertir avec <code>int</code> / <code>float</code>.",
      "<code>print(*lis, sep=…, end=…)</code> ; <code>\"{:.3f}\".format(x)</code> pour 3 décimales.",
      "Monte-Carlo : \\(\\pi \\approx 4\\,dc/nb\\) avec <code>random.uniform(-1, 1)</code>.",
    ],
  },

  /* ===================================================================== */
  {
    id: 'py2', ch: 'pybase', short: 'Listes, ensembles, chaînes', src: 'Notebooks 04, 07, 09',
    t: 'Listes, ensembles et chaînes',
    sub: 'Définir, parcourir et construire des listes (et leur coût), les listes par compréhension, le slicing et les copies, les ensembles, les chaînes de caractères et le piège des flottants.',
    goals: [
      'Accéder aux éléments d\'une liste (indices positifs et négatifs) et la parcourir de quatre façons, à l\'endroit et à l\'envers.',
      'Construire une liste avec <code>append</code>, <code>+</code>, <code>extend</code>, <code>insert</code> en connaissant leur complexité, et avec une compréhension (avec filtre).',
      'Utiliser le slicing, distinguer <b>alias</b> et <b>copie</b>, supprimer avec <code>del</code> / <code>remove</code>.',
      'Utiliser les ensembles (modalités, doublons) et savoir pourquoi une liste ne peut pas y entrer.',
      'Manipuler les chaînes comme des listes non modifiables.',
    ],
    sections: [
      { id: 'def', t: 'Définition, longueur, indices', sub: 'De 0 à len(lis)-1, et les indices négatifs', html: R`
<p>Les listes jouent le rôle des <b>tableaux</b> des autres langages, en beaucoup plus riche. Elles peuvent mélanger les types (mais on conseille des éléments de même type, pour la lisibilité).</p>
${code(R`
x = []                               # liste vide
y = [2, 6, "rouge", True, 3.6]
print(len(x), len(y))
print(y[0], y[len(y) - 1])           # premier et dernier (générique)
print(y[-1], y[-2], y[-len(y)])      # indices négatifs (Python)
`, R`
0 5
2 3.6
3.6 True 2
`)}
${def('indices', R`<p>Pour une liste <code>lis</code>, un indice valide est un entier de <b>0 à <code>len(lis)-1</code></b> ; <code>lis[i]</code> est l'élément d'indice <code>i</code>. Python accepte aussi <code>-1</code> (dernier) à <code>-len(lis)</code> (premier). Au-delà : <code>IndexError</code>.</p>`)}
${warn('les indices négatifs cachent des erreurs', R`<p>Un indice calculé qui devient négatif par erreur (par exemple <code>lis[i-1]</code> avec <code>i = 0</code>) ne provoque <b>pas</b> d'erreur : on lit le dernier élément. C'est une source de bugs difficiles à trouver ; en passe-partout, on n'utilise que des indices de 0 à <code>len-1</code>.</p>`)}
` },
      { id: 'parcours', t: 'Parcourir une liste', sub: 'while, for range, for elt, enumerate, reversed', html: R`
<p>Il faut <b>maîtriser les quatre techniques</b> : les deux premières sont génériques, les deux dernières pythonesques. En passe-partout on préfère le <code>for</code> tant que tous les éléments sont systématiquement traités.</p>
${code(R`
y = [2, 6, "rouge"]
i = 0
while i < len(y):                      # 1. while (générique)
    print("élément d'indice {} = {}".format(i, y[i]))
    i += 1
for i in range(len(y)):                # 2. for + range (générique)
    print(i, y[i])
for elt in y:                          # 3. for elt in (pythonesque)
    print(elt)
for i, elt in enumerate(y):            # 4. enumerate (pythonesque)
    print(i, elt)
`, R`
élément d'indice 0 = 2
élément d'indice 1 = 6
élément d'indice 2 = rouge
0 2
1 6
2 rouge
2
6
rouge
0 2
1 6
2 rouge
`)}
<p><b>À l'envers</b> : en générique, on fait varier l'indice de <code>len-1</code> à 0 (ou de -1 à <code>-len</code>) avec un pas de -1 ; en Python on utilise <code>reversed()</code>, qui renvoie un <b>itérateur</b> (pas une liste).</p>
${code(R`
y = [2, 6, "rouge"]
for i in range(len(y) - 1, -1, -1):          # générique
    print(i, y[i])
for elt in reversed(y):                      # pythonesque
    print(elt)
for i, elt in reversed(list(enumerate(y))):  # indices d'origine conservés
    print(i, elt)
`, R`
2 rouge
1 6
0 2
rouge
6
2
2 rouge
1 6
0 2
`)}
${warn('enumerate(reversed(y)) renumérote à partir de 0', R`<p><code>enumerate(reversed(y))</code> donne <code>(0, "rouge"), (1, 6), (2, 2)</code> : les indices ne sont plus ceux de <code>y</code>. Pour garder les indices d'origine, il faut <code>reversed(list(enumerate(y)))</code> (<code>enumerate</code> ne se renverse pas directement, d'où le <code>list</code>).</p>`)}
` },
      { id: 'construire', t: 'Construire et modifier une liste', sub: 'append, +, extend, insert et leurs coûts', html: R`
${code(R`
print([1, 2] + [6, 9, 10])     # concaténation : nouvelle liste
lis1 = [1, 2]
lis2 = [6, 9, 10]
lis1.extend(lis2)              # modifie lis1 (lis2 inchangée) ; équivaut à lis1 += lis2
print(lis1, lis2)
lis = [3, 8, 10]
lis.append(100)                # ajout d'UN élément en fin
lis = [300] + lis              # insertion en tête
lis.insert(2, -5)              # insertion à l'indice 2
print(lis)
`, R`
[1, 2, 6, 9, 10]
[1, 2, 6, 9, 10] [6, 9, 10]
[300, 3, -5, 8, 10, 100]
`)}
<table class="t"><thead><tr><th>Opération</th><th>Effet</th><th>Coût en temps</th></tr></thead><tbody>
<tr><td><code>lis.append(x)</code></td><td>ajoute <code>x</code> en fin (modifie <code>lis</code>)</td><td>\(O(1)\)</td></tr>
<tr><td><code>lis1 + lis2</code></td><td>nouvelle liste</td><td>\(O(n_1+n_2)\)</td></tr>
<tr><td><code>lis1.extend(lis2)</code>, <code>lis1 += lis2</code></td><td>ajoute les éléments de <code>lis2</code> à la fin de <code>lis1</code></td><td>\(O(n_2)\)</td></tr>
<tr><td><code>[x] + lis</code>, <code>lis.insert(i, x)</code></td><td>insertion en tête / à l'indice <code>i</code></td><td>\(O(n)\)</td></tr>
<tr><td><code>x in lis</code>, <code>lis.index(x)</code></td><td>recherche</td><td>\(O(n)\)</td></tr>
<tr><td><code>lis[i]</code>, <code>len(lis)</code></td><td>accès, longueur</td><td>\(O(1)\)</td></tr>
<tr><td><code>lis[i:j]</code>, <code>lis.copy()</code></td><td>copie d'une tranche / de la liste</td><td>\(O(j-i)\) / \(O(n)\)</td></tr>
</tbody></table>
${warn('append vs extend', R`<p><code>lis.append([4, 5])</code> ajoute <b>un</b> élément (la liste <code>[4, 5]</code>) ; <code>lis.extend([4, 5])</code> ajoute <b>deux</b> éléments. Et <code>append</code>, <code>extend</code>, <code>insert</code> modifient la liste et <b>renvoient <code>None</code></b> : écrire <code>lis = lis.append(x)</code> perd la liste.</p>
${code(R`
lis = [1, 2, 3]
lis.append([4, 5])
print(lis, len(lis))
lis = [1, 2, 3]
lis.extend([4, 5])
print(lis, len(lis))
print(lis.append(6))
`, R`
[1, 2, 3, [4, 5]] 4
[1, 2, 3, 4, 5] 5
None
`)}`)}
${ex('carrés, version générique', R`${code(R`
def carres(lis):
    """Retourne la liste des carrés des valeurs de lis (lis : liste de nombres)"""
    res = []
    for elt in lis:
        res.append(elt * elt)
    return res

print(carres([1, 3, 0.4, 2]))
`, R`
[1, 9, 0.16000000000000003, 4]
`)}<p>Le <code>0.16000000000000003</code> vient de la représentation binaire des flottants (voir la dernière section) : un test d'égalité stricte avec <code>0.16</code> échoue.</p>`)}
` },
      { id: 'comprehension', t: 'Listes par compréhension', sub: 'Décrire une liste en une ligne, avec ou sans filtre', html: R`
<p>Définir une liste par compréhension, c'est la <b>décrire</b> : <code>[expression for variable in itérable]</code>, éventuellement suivi d'un filtre <code>if condition</code>. C'est une spécificité Python (concis et clair), mais il faut savoir écrire <b>aussi</b> la version générique avec <code>append</code>.</p>
${code(R`
lis = [1, 3, 0.5, 2]
print([elt**2 for elt in lis])
print([lis[i]**2 for i in range(len(lis))])
print([i**2 for i in range(11) if i % 2 == 0])     # avec filtre
`, R`
[1, 9, 0.25, 4]
[1, 9, 0.25, 4]
[0, 4, 16, 36, 64, 100]
`)}
${ex('les fonctions « mystère » du TD', R`${code(R`
def mystere1(n):
    """Liste des entiers impairs strictement inférieurs à n (n >= 0)"""
    lis = []
    for i in range(1, n, 2):
        lis.append(i)
    return lis

def mystere2(n):
    """Liste des n premiers entiers impairs (n >= 0)"""
    return [2*i + 1 for i in range(n)]

print(mystere1(10))
print([2*i + 1 for i in range(10 // 2)])   # mystere1 en une ligne
print(mystere2(5))
`, R`
[1, 3, 5, 7, 9]
[1, 3, 5, 7, 9]
[1, 3, 5, 7, 9]
`)}<p><code>mystere1(n)</code> et <code>mystere2(n)</code> ne font <b>pas</b> le même traitement : la première borne les valeurs (<code>&lt; n</code>), la seconde en fixe le nombre (<code>n</code> valeurs). Ici elles coïncident par hasard (10 et 5).</p>`)}
${method('traduire une compréhension filtrée en générique', R`<p><code>res = [f(x) for x in lis if cond(x)]</code> s'écrit :</p>
${code(R`
res = []
for i in range(0, len(lis), 1):
    if cond(lis[i]):
        res.append(f(lis[i]))
`)}
<p>Exemple du cours : <code>[elt for elt in lis if elt % 2 == 0]</code> (éléments pairs) ⇔ boucle <code>for i in range(0, len(lis), 1)</code> + <code>if lis[i] % 2 == 0: res.append(lis[i])</code>. Plusieurs <code>for</code> peuvent se suivre dans une compréhension (boucles imbriquées, leçon 4).</p>`)}
` },
      { id: 'slicing', t: 'Slicing, copies et suppressions', sub: 'lis[i:j], alias, del, remove', html: R`
${def('tranche (slice)', R`<p><code>lis[i:j]</code> est la liste des éléments d'indices <code>i</code> à <code>j-1</code>. Sans <code>i</code> : 0 ; sans <code>j</code> : <code>len(lis)</code>. Dans une expression, c'est une <b>copie</b> (coût \(O(j-i)\)) ; à gauche d'un <code>=</code>, cela <b>remplace</b> cette partie de la liste. On peut ajouter un pas : <code>lis[::2]</code>, <code>lis[::-1]</code>.</p>`)}
${code(R`
lis = [6, 8, 9, 1, 2]
print(lis[1:3], lis[:2], lis[3:], lis[-2:])
print(lis[::2], lis[::-1])
`, R`
[8, 9] [6, 8] [1, 2] [1, 2]
[6, 9, 2] [2, 1, 9, 8, 6]
`)}
${warn('affectation = alias, pas copie', R`<p><code>lis2 = lis</code> ne copie rien : les deux noms désignent <b>la même liste</b>. Pour une copie indépendante : <code>lis[:]</code> ou, plus clair (préféré par le cours), <code>lis.copy()</code>.</p>
${code(R`
lis = [6, 8, 9]
alias = lis
copie = lis.copy()
lis[0] = 100
print(alias, copie)
`, R`
[100, 8, 9] [6, 8, 9]
`)}`)}
<p>Suppressions (exercice 8 du notebook 09) :</p>
${code(R`
lis = [6, 8, 9, 1, 2]
lis2 = lis[:]
lis3 = lis.copy()
lis[1] = 5           # remplacement
lis2[1:4] = []       # suppression des 3 éléments centraux par slice
del lis3[-1]         # suppression par indice
lis3.remove(6)       # suppression de la première occurrence d'une VALEUR
print("lis  :", lis)
print("lis2 :", lis2)
print("lis3 :", lis3)
`, R`
lis  : [6, 5, 9, 1, 2]
lis2 : [6, 2]
lis3 : [8, 9, 1]
`)}
${ex('le slicing en générique', R`${code(R`
def tranche(lis, i, j):
    """Retourne lis[i:j] ; précondition : 0 <= i <= j <= len(lis)"""
    res = []
    for k in range(i, j, 1):
        res.append(lis[k])
    return res

print(tranche([3, 2, 5, 2, 3], 1, 4))
`, R`
[2, 5, 2]
`)}<p>On en déduit que le slicing coûte \(O(j-i)\) : ce n'est pas gratuit (mais la version native est bien plus rapide que la boucle).</p>`)}
` },
      { id: 'ensembles', t: 'Ensembles', sub: 'set, add, modalités, doublons', html: R`
<p>Un <b>ensemble</b> (<code>set</code>) contient des éléments <b>sans doublon et sans ordre</b>. Test d'appartenance en \(O(1)\) en moyenne. L'ensemble vide s'écrit <code>set()</code> (<code>{}</code> est un dictionnaire vide !).</p>
${code(R`
lis = [3, 2, 5, 2, 3, 2]
modalites = set(lis)                 # changement de type
print(len(modalites), sorted(modalites))
s = set()                            # version générique
for i in range(len(lis)):
    s.add(lis[i])
print(s == modalites)
print({lis[i] for i in range(len(lis))} == s)   # compréhension d'ensemble
`, R`
3 [2, 3, 5]
True
True
`)}
<p>Les <b>modalités</b> (au sens statistique : valeurs prises) d'une liste s'obtiennent donc par <code>set(lis)</code>. Une copie sans doublon : <code>list(set(lis))</code> (ordre non garanti).</p>
${ex('copie sans doublon, version générique', R`<p>Méthode : trier (une copie), puis garder le premier élément et chaque élément différent de son prédécesseur.</p>
${code(R`
def copie_sans_doublon(lis):
    tmp = sorted(lis)          # copie triée : lis n'est pas modifiée
    res = []
    if tmp != []:
        res.append(tmp[0])
        for i in range(1, len(tmp)):
            if tmp[i] != tmp[i-1]:
                res.append(tmp[i])
    return res

print(copie_sans_doublon([3, 2, 5, 2, 3, 2]))
`, R`
[2, 3, 5]
`)}
<p><code>lis.sort()</code> trie la liste <b>sur place</b> (et renvoie <code>None</code>) ; <code>sorted(lis)</code> renvoie une <b>nouvelle</b> liste triée.</p>`)}
${warn('une liste n\'est pas hachable', R`<p>Les éléments d'un ensemble (et les clés d'un dictionnaire) doivent être <b>hachables</b> (non modifiables : nombres, chaînes, tuples…). Une liste ne l'est pas :</p>
${code(R`
s = {(1, 2), "ab", 3}      # tuple, chaîne, entier : OK
s.add([1, 2])
`, R`
TypeError: unhashable type: 'list'
`)}`)}
` },
      { id: 'chaines', t: 'Chaînes de caractères et flottants', sub: 'Listes non modifiables ; le piège 0.1 + 0.2', html: R`
<p>Une chaîne (<code>str</code>) se manipule comme une <b>liste non modifiable</b> de caractères : <code>len</code>, indices, slicing, <code>for c in ch</code>, <code>+</code> (concaténation), <code>*</code> (répétition). <code>in</code> teste la présence d'une <b>sous-chaîne</b>.</p>
${code(R`
ch = "python"
print(len(ch), ch[0], ch[-1], ch[1:4], ch[::-1])
print("th" in ch, "pt" in ch)
print(ch + "!" * 3, "Zen".lower(), "-".join(["a", "b", "c"]))
ch[0] = "P"
`, R`
6 p n yth nohtyp
True False
python!!! zen a-b-c
TypeError: 'str' object does not support item assignment
`)}
${ex('ensemble des facteurs (sous-chaînes) d\'un mot', R`<p>Générique (deux boucles imbriquées) puis pythonesque (compréhension d'ensemble à deux indices) :</p>
${code(R`
def facteurs(ch):
    s = set()
    for i in range(len(ch) + 1):
        for j in range(len(ch) + 1):
            s.add(ch[i:j])          # ch[i:j] vaut "" si i >= j
    return s

def facteurs2(ch):
    return {ch[i:j] for i in range(len(ch) + 1) for j in range(len(ch) + 1)}

print(sorted(facteurs("pepe")))
print(facteurs("") == {""}, facteurs2("pepe") == facteurs("pepe"))
`, R`
['', 'e', 'ep', 'epe', 'p', 'pe', 'pep', 'pepe']
True True
`)}
<p>Appliquée à une liste, <code>facteurs([1, 2, 3])</code> échoue (<code>unhashable type: 'list'</code>) : les tranches d'une liste sont des listes. Avec \(n+1\) valeurs de <code>i</code> et de <code>j</code> et un slicing en \(O(n)\), le coût est en \(O(n^3)\).</p>`)}
${warn('les flottants sont approchés', R`<p>Les nombres à virgule sont stockés en binaire : beaucoup de décimaux (0.1, 0.4…) ne sont pas représentables exactement. Ne <b>jamais</b> tester l'égalité de deux flottants calculés ; comparer avec une tolérance.</p>
${code(R`
print(0.1 + 0.2, 0.1 + 0.2 == 0.3)
print(0.4 * 0.4)
print(abs((0.1 + 0.2) - 0.3) < 1e-9)
`, R`
0.30000000000000004 False
0.16000000000000003
True
`)}<p>C'est pourquoi le test de <code>carres([1, 3, 0.4, 2, 0.])</code> contre <code>[1, 9, 0.16, 4, 0.]</code> échoue dans le notebook.</p>`)}
` },
    ],
    keep: [
      "Indices de <code>0</code> à <code>len(lis)-1</code> ; <code>lis[-1]</code> = dernier élément.",
      "Quatre parcours à maîtriser : <code>while</code>, <code>for i in range(len(lis))</code>, <code>for elt in lis</code>, <code>for i, elt in enumerate(lis)</code> ; à l'envers : <code>reversed</code>.",
      "<code>append</code> \\(O(1)\\) ; <code>insert</code> / ajout en tête \\(O(n)\\) ; <code>+</code> crée une nouvelle liste ; <code>extend</code> / <code>+=</code> modifient sur place.",
      "<code>[f(x) for x in lis if cond(x)]</code> ⇔ liste vide + boucle + <code>if</code> + <code>append</code>.",
      "<code>lis2 = lis</code> est un alias ; copie : <code>lis.copy()</code> ou <code>lis[:]</code>.",
      "<code>lis[i:j]</code> : indices <code>i</code> à <code>j-1</code>, copie en \\(O(j-i)\\).",
      "<code>set()</code> = ensemble vide ; <code>set(lis)</code> = modalités ; listes non hachables.",
      "Chaînes non modifiables ; <code>0.1 + 0.2 != 0.3</code> : comparer les flottants avec une tolérance.",
    ],
  },

  /* ===================================================================== */
  {
    id: 'py3', ch: 'pybase', short: 'Fonctions, modules, tests', src: 'Notebooks 05, 06, 08',
    t: 'Fonctions, modules, tests et complexité',
    sub: "Écrire et documenter une fonction, la technique du drapeau, pourquoi éviter le return dans une boucle, any/all, None, les arguments facultatifs, les modules et __name__, le module de test du cours et la mesure du temps d'exécution avec timeit.",
    goals: [
      'Écrire une fonction avec une docstring complète (rôle, données, résultat, préconditions) consultable par <code>help</code>.',
      'Écrire une recherche avec la <b>technique du drapeau</b>, et sa version pythonesque (<code>in</code>, <code>index</code>, <code>any</code>, <code>all</code>).',
      'Expliquer <code>None</code>, les arguments facultatifs et le piège de la valeur par défaut modifiable.',
      'Importer un module (<code>import</code>, <code>from … import</code>, <code>as</code>) et protéger le programme principal par <code>if __name__ == "__main__":</code>.',
      'Tester une fonction avec <code>aide_test.test</code> et mesurer un temps d\'exécution avec <code>timeit</code>.',
    ],
    sections: [
      { id: 'def', t: 'Définir et documenter une fonction', sub: 'def, docstring, help, return', html: R`
<p>On écrit une fonction quand un traitement est réutilisé, pour résoudre un sous-problème, et pour pouvoir le <b>tester</b>. La chaîne entre triples guillemets <code>"""…"""</code> placée juste après l'en-tête est la <b>docstring</b> : elle est affichée par <code>help</code>.</p>
${code(R`
def somme(lis):
    """
    Retourne la somme des éléments de lis

    Donnée : lis, liste de nombres
    Résultat : un nombre (0 si lis est vide)
    """
    s = 0
    for i in range(len(lis)):      # version générique de sum()
        s += lis[i]
    return s

print(somme([1, 2, 3, 4]), somme([3.5, 0.5, 6.0]), somme([]))
print(sum([1, 2, 3, 4]))
`, R`
10 10.0 0
10
`)}
${def('return et None', R`<p><code>return expr</code> arrête la fonction et renvoie la valeur. Une fonction qui se termine <b>sans</b> <code>return</code> renvoie <code>None</code>. Le cours conseille des fonctions au <b>comportement homogène</b> : toujours une valeur de retour (de même type) ou jamais. Un <code>None</code> inattendu signale souvent un cas oublié.</p>
${code(R`
def signe(x):
    if x > 0:
        return "positif"
    elif x < 0:
        return "négatif"
    # cas x == 0 oublié

print(signe(3), signe(0))
`, R`
positif None
`)}`)}
<p><b>Retourner</b> plutôt qu'<b>afficher</b> : un résultat retourné peut être réutilisé et testé ; un <code>print</code> dans la fonction ne le peut pas. <code>sum</code>, <code>max</code>, <code>min</code>, <code>any</code>, <code>all</code> sont des fonctions natives sur les itérables ; il faut savoir réécrire <code>sum</code>, <code>max</code>, <code>min</code> de façon générique.</p>
${ex('max générique', R`${code(R`
def maximum(lis):
    """Retourne le plus grand élément de lis ; précondition : lis non vide"""
    m = lis[0]
    for i in range(1, len(lis), 1):
        if lis[i] > m:
            m = lis[i]
    return m

print(maximum([3, 9, -1, 9, 2]), max([3, 9, -1, 9, 2]))
`, R`
9 9
`)}`)}
` },
      { id: 'drapeau', t: 'La technique du drapeau', sub: 'Sortir d\'un while dès que le résultat est trouvé', html: R`
<p>Une variable booléenne (ou une valeur sentinelle) joue le rôle d'un <b>drapeau</b> : la boucle <code>while</code> s'arrête quand il « se lève ». Technique de base <b>à connaître</b>.</p>
${code(R`
def recherche(a_chercher, lis):
    """
    Retourne le plus petit indice de a_chercher dans lis, -1 en cas d'absence.
    """
    i = 0
    indice = -1                       # drapeau : -1 = pas encore trouvé
    while i < len(lis) and indice == -1:
        if lis[i] == a_chercher:
            indice = i
        else:
            i += 1
    return indice

lis = [1, "rouge", 3.2, "2"]
print(recherche("rouge", lis), recherche(2, lis), recherche("2", lis))
`, R`
1 -1 3
`)}
${prop('Initialiser le drapeau', R`<ul>
<li><b>Recherche d'existence</b> (« existe-t-il un élément pair ? ») : drapeau initialisé à <code>False</code> (dans une liste vide, on ne trouve rien).</li>
<li><b>Propriété universelle</b> (« tous les éléments sont-ils pairs ? ») : drapeau initialisé à <code>True</code> (la propriété est vraie pour la liste vide).</li></ul>`)}
${code(R`
def existe_element_pair(lis):
    """Retourne True si lis (liste d'entiers) contient un élément pair, False sinon"""
    res = False
    i = 0
    while i < len(lis) and not res:
        if lis[i] % 2 == 0:
            res = True
        else:
            i = i + 1
    return res

def tous_pairs(lis):
    """Retourne True si tous les éléments de lis sont pairs"""
    ok = True
    i = 0
    while i < len(lis) and ok:
        ok = lis[i] % 2 == 0
        i += 1
    return ok

print(existe_element_pair([3, 5, 2]), existe_element_pair([]))
print(tous_pairs([2, 4, 7]), tous_pairs([]))
`, R`
True False
False True
`)}
${warn('ne pas lire lis[i] hors limites', R`<p>Dans <code>while i &lt; len(lis) and lis[i] != x</code>, Python évalue de manière paresseuse (le second test n'est pas évalué si le premier est faux), mais le cours demande en passe-partout de <b>ne pas compter dessus</b> : d'où le drapeau mis à jour <b>dans</b> le corps de la boucle.</p>`)}
` },
      { id: 'return', t: 'return dans une boucle, in, any, all', sub: 'Ce qu\'on rencontre et ce que le cours conseille', html: R`
<p>En Python (comme en C ou Java), <code>return</code> arrête immédiatement la fonction ; en Pascal ou Ada, non. On rencontre donc souvent :</p>
${code(R`
def recherche_v2(a_chercher, lis):
    for i in range(len(lis)):
        if lis[i] == a_chercher:
            return i
    return -1
`)}
${warn('pas de return dans une boucle', R`<p>Le cours <b>déconseille</b> cette écriture : plusieurs points de sortie rendent le code moins lisible et plus difficile à reprendre, et le <code>for</code> laisse croire à un parcours complet alors qu'il peut s'arrêter en route. Règle : <b>un seul <code>return</code>, à la fin</b> ; <code>while</code> + drapeau si l'on peut s'arrêter avant la fin. (Les diapos montrent toutefois la version <code>for</code> + <code>return</code> comme « plus pythonesque » : savoir la lire.)</p>`)}
<p><b>Versions pythonesques</b> : <code>lis.index(x)</code> renvoie le premier indice mais lève une <b>exception</b> (<code>ValueError</code>) en cas d'absence, que l'on capture avec <code>try / except</code> ; pour un simple test de présence, on utilise <code>in</code>.</p>
${code(R`
def recherche_v3(a_chercher, lis):
    try:
        return lis.index(a_chercher)
    except ValueError:
        return -1

lis = [3, 5, 1, -1, 0, 2, 9]
print(recherche_v3(2, lis), recherche_v3("2", lis))
print(2 in lis, "2" in lis)
`, R`
5 -1
True False
`)}
${def('any et all', R`<p><code>any(it)</code> vaut <code>True</code> si <b>au moins un</b> élément est vrai ; <code>all(it)</code> si <b>tous</b> le sont. On les combine avec une liste de booléens construite par compréhension.</p>
${code(R`
lis = [3, 5, 1, -1, 0, 2, 9]
elts_pairs = [elt % 2 == 0 for elt in lis]
print(elts_pairs)
print(any(elts_pairs), all(elts_pairs))
print(all([]), any([]))
`, R`
[False, False, False, False, True, True, False]
True False
True False
`)}`)}
${warn('all([]) vaut True', R`<p>C'est logique (« tous les éléments de la liste vide sont pairs » est vrai) et cohérent avec le drapeau initialisé à <code>True</code>. Symétriquement <code>any([])</code> vaut <code>False</code>.</p>`)}
<p>Coût : <code>any</code>/<code>all</code> sur une liste en compréhension sont <b>linéaires</b>, mais la liste entière est d'abord construite : contrairement au drapeau, on ne s'arrête pas au premier élément trouvé. En pratique, les fonctions natives optimisées compensent souvent ce facteur (au plus 2 en moyenne).</p>
${ex('my_all générique', R`${code(R`
def my_all(lis_booleens):
    """Retourne True si tous les éléments de lis_booleens valent True"""
    ok = True
    i = 0
    while i < len(lis_booleens) and ok:
        ok = lis_booleens[i]
        i += 1
    return ok

print(my_all([True, True]), my_all([True, False, True]), my_all([]))
`, R`
True False True
`)}`)}
` },
      { id: 'arguments', t: 'Arguments facultatifs et passage des listes', sub: 'Valeurs par défaut, arguments nommés, modification en place', html: R`
<p>Un paramètre peut avoir une <b>valeur par défaut</b> : il devient facultatif à l'appel. On peut aussi nommer les arguments à l'appel. Exemples du cours : <code>print(…, sep=' ', end='\n')</code>, <code>lire_fichier_csv(nom_fichier, delim=";")</code>, <code>resoudre_sudoku(t2D, niveau=0)</code>.</p>
${code(R`
def puissance(x, n=2):
    return x ** n

print(puissance(3), puissance(3, 3), puissance(n=0, x=5))
`, R`
9 27 1
`)}
${prop('Une liste passée en paramètre peut être modifiée', R`<p>Le paramètre désigne <b>le même objet</b> que l'argument : si la fonction modifie la liste (<code>append</code>, affectation d'un élément…), l'appelant voit la modification. C'est voulu dans <code>insertion_dans_liste_triee(lis, val)</code> (leçon 4), qui ne retourne rien.</p>
${code(R`
def ajoute_zero(lis):
    lis.append(0)

ma_liste = [1, 2]
ajoute_zero(ma_liste)
print(ma_liste)
`, R`
[1, 2, 0]
`)}`)}
${warn('valeur par défaut modifiable', R`<p>La valeur par défaut est créée <b>une seule fois</b>, à la définition. Une liste par défaut est donc partagée entre les appels :</p>
${code(R`
def ajoute(x, lis=[]):
    lis.append(x)
    return lis

print(ajoute(1))
print(ajoute(2))
`, R`
[1]
[1, 2]
`)}
<p>Correctif usuel : <code>def ajoute(x, lis=None):</code> puis <code>if lis is None: lis = []</code>.</p>`)}
` },
      { id: 'modules', t: 'Modules', sub: 'import, from, as, __name__, commandes magiques', html: R`
<p>Un <b>module</b> est un fichier <code>.py</code> que l'on importe (les modules peuvent être regroupés en <i>packages</i>, non abordés).</p>
<table class="t"><thead><tr><th>Syntaxe</th><th>Utilisation</th><th>Remarque</th></tr></thead><tbody>
<tr><td><code>import exemple_fonctions2</code></td><td><code>exemple_fonctions2.recherche(…)</code></td><td>préfixe obligatoire, aucun écrasement : <b>préféré</b></td></tr>
<tr><td><code>import exemple_fonctions2 as fonc</code></td><td><code>fonc.recherche(…)</code></td><td>alias pour un nom long (<code>import numpy as np</code>)</td></tr>
<tr><td><code>from exemple_fonctions2 import *</code></td><td><code>recherche(…)</code></td><td>peut <b>écraser</b> des noms déjà définis</td></tr>
<tr><td><code>from operator import itemgetter</code></td><td><code>itemgetter(1)</code></td><td>import ciblé</td></tr>
</tbody></table>
${warn('ce qui se passe à l\'import', R`<ul>
<li>Le code du fichier est <b>exécuté</b> à l'import : un « programme principal » (saisies, affichages de test) placé au niveau du module se lance à chaque import.</li>
<li>Un module déjà importé n'est <b>pas relu</b> par un nouvel <code>import</code> dans la même session : après une modification, il faut <b>Kernel &gt; Restart</b>.</li></ul>`)}
${def('__name__', R`<p>La variable <code>__name__</code> vaut <code>"__main__"</code> quand le fichier est exécuté comme programme principal, et le <b>nom du module</b> quand il est importé. On protège donc le programme de test :</p>
${code(R`
def recherche(val, lis):
    ...

if __name__ == "__main__":
    # exécuté par "%run exemple_fonctions2.py" ou "python exemple_fonctions2.py",
    # PAS lors d'un "import exemple_fonctions2"
    print(recherche(2, [1, 2, 3]))
`)}`)}
<p><b>Commandes magiques</b> de Jupyter/IPython :</p>
<ul><li><code>%run fichier.py</code> exécute le fichier comme programme principal ;</li>
<li><code>%load fichier.py</code> copie le contenu du fichier dans la cellule (la commande se met alors en commentaire) ;</li>
<li><code>%%writefile fichier.py</code> (en tête de cellule) écrit le contenu de la cellule dans un fichier ; <code>%%writefile -a</code> l'ajoute à la fin ;</li>
<li><code>%matplotlib inline</code> affiche les graphiques dans le notebook.</li></ul>
<p><code>help("exemple_fonctions2")</code> affiche la docstring du module (son premier <code>"""…"""</code>) et celles de ses fonctions : d'où l'intérêt de bien les rédiger.</p>
` },
      { id: 'tests', t: 'Tester avec aide_test', sub: 'Garder ses tests et les relancer', html: R`
<p>Tester une fonction (ni d'affichage, ni de saisie), c'est vérifier qu'elle renvoie le <b>résultat attendu</b> sur des cas connus. On <b>conserve</b> les tests pour les relancer après chaque modification (pas de tests par saisie, pas d'écrasement d'un test par un autre). Le cours fournit le module <code>aide_test</code> :</p>
${code(R`
def test(fonction_a_tester, liste_tests):
    nb_prob = 0
    for data, res_attendu, test in liste_tests:
        if type(data) == tuple:
            res_reel = fonction_a_tester(*data)   # plusieurs paramètres
        else:
            res_reel = fonction_a_tester(data)    # un seul paramètre
        if res_reel != res_attendu:
            print("------\nprobleme avec test : {}".format(test))
            print("Données = {}".format(data))
            print("Résultat attendu = {}".format(res_attendu))
            print("Résultat réel    = {}".format(res_reel))
            nb_prob += 1
    print("{} problème(s) sur {} tests".format(nb_prob, len(liste_tests)))

def recherche(a_chercher, lis):
    i = 0
    indice = -1
    while i < len(lis) and indice == -1:
        if lis[i] == a_chercher:
            indice = i
        else:
            i += 1
    return indice

liste = [2, "rouge", 3.2, 5, 1, 5]
test(recherche, [
    ((2, liste), 0, "première position"),
    ((1, liste), 4, "dernière position"),
    ((5, liste), 3, "doublon : plus petit indice"),
    ((7, liste), -1, "valeur absente"),
    ((7, []), -1, "liste vide"),
    ((7, [7]), 0, "un seul élément"),
])
test(len, [("abc", 3, "chaîne"), ([], 1, "test volontairement faux")])
`, R`
0 problème(s) sur 6 tests
------
probleme avec test : test volontairement faux
Données = []
Résultat attendu = 1
Résultat réel    = 0
1 problème(s) sur 2 tests
`)}
${method('choisir ses tests', R`<ul>
<li>Chaque test est un <b>triplet</b> <code>(paramètres, résultat attendu, description)</code> ; plusieurs paramètres → un <b>tuple</b> <code>(a, b)</code> ; un seul paramètre → la valeur directement.</li>
<li>Cas généraux <b>positifs</b> et <b>négatifs</b> (sur une liste pas trop petite) ;</li>
<li>cas <b>extrêmes</b> : première / dernière position, liste vide, un seul élément, doublons ;</li>
<li>jamais de cas hors préconditions.</li></ul>`)}
${warn('un seul paramètre qui est un tuple', R`<p><code>((0), False, "avec 0")</code> : <code>(0)</code> n'est <b>pas</b> un tuple, c'est l'entier 0 (le tuple à un élément s'écrit <code>(0,)</code>). Si l'unique paramètre est lui-même un tuple, il faut l'envelopper : <code>((mon_tuple,), …)</code>, sinon il serait déplié.</p>`)}
` },
      { id: 'timeit', t: "Temps d'exécution et complexité", sub: 'timeit, setup, lambda, croissance linéaire', html: R`
<p>Le module <code>timeit</code> mesure le temps d'exécution d'un fragment de code. <code>timeit.timeit(stmt=…, setup=…, number=…)</code> exécute <code>number</code> fois le code <code>stmt</code> et renvoie le <b>temps total en secondes</b> ; <code>setup</code> n'est exécuté <b>qu'une fois</b>.</p>
${code(R`
import timeit

def mystere2(n):
    lis = []
    for i in range(n):
        lis.append(2*i + 1)
    return lis

nb_repet = 100
t = timeit.timeit(stmt="x=1", setup="", number=nb_repet)
print(int(t / nb_repet * 1000000000), "ns par exécution")
t = timeit.timeit(stmt="mystere2(10)", setup="from __main__ import mystere2",
                  number=nb_repet)
t = timeit.timeit(stmt=lambda: mystere2(10), number=nb_repet)   # plus souple
`)}
${warn('NameError dans timeit', R`<p><code>timeit.timeit(stmt="mystere2(10)", number=100)</code> lève <code>NameError: name 'mystere2' is not defined</code> : timeit s'exécute dans un <b>environnement séparé</b> du notebook. Il faut importer la fonction via <code>setup="from __main__ import mystere2"</code> (pas de <code>import *</code>), ou passer une <code>lambda</code>. Plusieurs instructions dans <code>stmt</code>/<code>setup</code> se séparent par <code>;</code> ou s'écrivent dans une chaîne multiligne.</p>`)}
${ex('vérifier une complexité linéaire', R`<p>On mesure <code>mystere2(taille)</code> pour des tailles croissantes et on trace le nuage (<code>plt.scatter</code>) : on obtient approximativement une <b>droite</b>, car l'algorithme est en \(O(n)\) (\(n\) appels à <code>append</code> en \(O(1)\)). Les mesures varient d'une exécution à l'autre, mais l'ordre de grandeur reste le même. Un <code>print</code> coûte beaucoup plus cher qu'une affectation.</p>
${code(R`
temps = []
for taille in range(1, 100000, 1000):
    t = timeit.timeit(stmt=lambda: mystere2(taille), number=10)
    temps.append(int(t / 10 * 1000000000))
`)}
<p>La version en compréhension (<code>mystere2bis</code>) est plus rapide (même complexité, meilleure constante) ; de même le slicing natif est bien plus rapide que la fonction <code>tranche</code> générique.</p>`)}
<table class="t"><thead><tr><th>Complexité</th><th>Exemples du cours</th></tr></thead><tbody>
<tr><td>\(O(1)\)</td><td><code>append</code>, <code>lis[i]</code>, <code>len</code>, <code>x in ensemble</code> (en moyenne), accès à un dictionnaire</td></tr>
<tr><td>\(O(n)\)</td><td>parcours, <code>sum</code>, <code>x in liste</code>, <code>insert</code>, copie, <code>est_trie</code>, palindrome</td></tr>
<tr><td>\(O(n \log n)\)</td><td><code>sorted</code>, <code>sort</code> (Timsort)</td></tr>
<tr><td>\(O(n^2)\)</td><td>tri par insertion, deux boucles imbriquées sur la liste</td></tr>
</tbody></table>
` },
    ],
    keep: [
      "Docstring = rôle, données (types), résultat, préconditions ; lue par <code>help</code>.",
      "Drapeau : <code>while i &lt; len(lis) and not trouve</code> ; initialisé à <code>False</code> pour « il existe », à <code>True</code> pour « pour tout ».",
      "Règle du cours : <b>un seul <code>return</code>, à la fin</b> ; pas de <code>return</code> ni de <code>break</code> dans une boucle.",
      "Pythonesque : <code>x in lis</code>, <code>lis.index(x)</code> (exception si absent), <code>any</code>, <code>all</code>, <code>sum</code>, <code>max</code>, <code>min</code>.",
      "<code>all([])</code> = <code>True</code>, <code>any([])</code> = <code>False</code> ; une fonction sans <code>return</code> renvoie <code>None</code>.",
      "<code>import module</code> (préfixe) évite les écrasements de <code>from module import *</code> ; <code>if __name__ == \"__main__\":</code> protège les tests.",
      "Tests : triplets (paramètres, attendu, description), tuple si plusieurs paramètres ; cas vides, extrêmes, doublons.",
      "<code>timeit.timeit(stmt, setup, number)</code> renvoie le temps total en secondes ; <code>setup=\"from __main__ import f\"</code> ou <code>lambda</code>.",
    ],
  },

  /* ===================================================================== */
  {
    id: 'py4', ch: 'pybase', short: 'Listes de listes, dictionnaires, types', src: 'Notebooks 10, 11, 12, 13, 20',
    t: 'Listes de listes, dictionnaires et nouveaux types',
    sub: 'Tableaux 2D et Sudoku, dictionnaires et defaultdict, tris avec sorted/key/itemgetter et stabilité, codage par substitution (César), Enum et classes, lecture CSV, et les exercices compléments à savoir refaire dans les deux styles.',
    goals: [
      'Construire et parcourir un tableau 2D (ligne, colonne, bloc), en générique et par compréhension.',
      'Compter des occurrences avec un dictionnaire, avec et sans <code>defaultdict</code>, et inverser un dictionnaire.',
      'Trier avec <code>sorted</code>, <code>key</code>, <code>reverse</code>, <code>itemgetter</code> / <code>attrgetter</code> en exploitant la stabilité du tri.',
      'Coder un texte par substitution (<code>chr</code>, <code>ord</code>, <code>%</code>, <code>join</code>).',
      'Définir un type avec <code>Enum</code> et une classe (<code>__init__</code>, <code>__str__</code>), et refaire les exercices compléments.',
    ],
    sections: [
      { id: 'tab2d', t: 'Listes de listes (tableaux 2D)', sub: 'Construire, extraire une ligne, une colonne, un bloc', html: R`
<p>Un tableau 2D est simulé par une <b>liste de listes</b> de même longueur ; <code>t[i][j]</code> est l'élément de la ligne <code>i</code>, colonne <code>j</code>. (NumPy offrira des structures plus adaptées, mais il faut savoir parcourir et chercher dans une liste de listes.)</p>
${code(R`
tab = []                                   # générique : deux boucles + append
for i in range(3):
    ligne = []
    for j in range(4):
        ligne.append(10*(i+1) + (j+1))
    tab.append(ligne)
tab2 = [[10*(i+1) + (j+1) for j in range(4)] for i in range(3)]   # compréhension
print(tab)
print(tab == tab2, tab[1][2], len(tab), len(tab[0]))
for ligne in tab:
    print(*ligne)
`, R`
[[11, 12, 13, 14], [21, 22, 23, 24], [31, 32, 33, 34]]
True 23 3 4
11 12 13 14
21 22 23 24
31 32 33 34
`)}
${code(R`
def extraire_ligne(t2D, i):
    return t2D[i]

def extraire_colonne(t2D, j):
    return [t2D[i][j] for i in range(len(t2D))]

def extraire_neuvieme(t2D, i, j):
    """Bloc (sous forme de liste) contenant la case (i, j) ; len(t2D) multiple de 3"""
    tiers = len(t2D) // 3
    li, co = (i // tiers) * tiers, (j // tiers) * tiers   # coin haut-gauche du bloc
    return [t2D[a][b] for a in range(li, li + tiers) for b in range(co, co + tiers)]

t = [[10*(i+1) + (j+1) for j in range(9)] for i in range(9)]
print(extraire_ligne(t, 2))
print(extraire_colonne(t, 2))
print(extraire_neuvieme(t, 4, 7))
`, R`
[31, 32, 33, 34, 35, 36, 37, 38, 39]
[13, 23, 33, 43, 53, 63, 73, 83, 93]
[47, 48, 49, 57, 58, 59, 67, 68, 69]
`)}
${warn('[[0]*3]*3 crée trois fois la même ligne', R`<p>Multiplier une liste de listes copie les <b>références</b>, pas les lignes :</p>
${code(R`
t = [[0] * 3] * 3
t[0][0] = 1
print(t)
t = [[0] * 3 for i in range(3)]      # bonne façon : une nouvelle ligne à chaque tour
t[0][0] = 1
print(t)
`, R`
[[1, 0, 0], [1, 0, 0], [1, 0, 0]]
[[1, 0, 0], [0, 0, 0], [0, 0, 0]]
`)}`)}
${ex('somme et recherche 2D, dans les deux styles', R`${code(R`
def somme2D(lis2D):                       # générique
    s = 0
    for i in range(0, len(lis2D), 1):
        for j in range(0, len(lis2D[i]), 1):
            s += lis2D[i][j]
    return s

def est_present(lis2D, valeur):           # générique : double while + drapeau
    trouve = False
    i = 0
    while i < len(lis2D) and not trouve:
        j = 0
        while j < len(lis2D[i]) and not trouve:
            if lis2D[i][j] == valeur:
                trouve = True
            else:
                j += 1
        i += 1
    return trouve

t = [[1, 2, 1], [], [0, 5, 1], [-10]]
print(somme2D(t), sum([sum(lis) for lis in t]))
print(est_present(t, 5), any([5 in lis for lis in t]), est_present(t, 4))
print(len({len(lis) for lis in t}) == 1)  # toutes les lignes de même longueur ?
`, R`
0 0
True True False
False
`)}`)}
` },
      { id: 'sudoku', t: 'Application : le Sudoku', sub: 'Vérifier avec set et all, résoudre par retour arrière', html: R`
<p>Une grille est solution si chaque ligne, chaque colonne et chaque bloc 3×3 contient exactement les chiffres de 1 à 9 (les cases vides valent <code>None</code>).</p>
${code(R`
def tous_les_chiffres(lis):
    """Vérifie que lis contient tous les chiffres de 1 à 9 et uniquement eux"""
    return set(lis) == set(range(1, 10))

print(tous_les_chiffres([1, 2, 5, 3, 4, 9, 6, 7, 8]), tous_les_chiffres([1, 1, 2]))
`, R`
True False
`)}
<p>La vérification complète tient en une instruction : une conjonction de <code>all</code> sur des listes en compréhension.</p>
${code(R`
def verif_sudoku(t2D):
    return all([t2D[i][j] != None for i in range(9) for j in range(9)]) and \
           all([tous_les_chiffres(extraire_ligne(t2D, i)) for i in range(9)]) and \
           all([tous_les_chiffres(extraire_colonne(t2D, i)) for i in range(9)]) and \
           all([tous_les_chiffres(extraire_neuvieme(t2D, i, j))
                for i in range(0, 9, 3) for j in range(0, 9, 3)])
`)}
<p>La <b>résolution</b> fournie est <b>récursive</b> avec retour arrière : on numérote les cases de 0 à 80 (paramètre facultatif <code>niveau=0</code>) ; si la case est vide, on y essaie chaque chiffre absent de sa ligne, de sa colonne et de son bloc (<code>elt not in ligne</code>…), on rappelle la fonction sur la case suivante, puis on remet <code>None</code> pour essayer le chiffre suivant. Arrivé au niveau 81, la grille est pleine : on l'affiche. Ce n'est pas la méthode d'un humain, mais la puissance de calcul le permet.</p>
<p class="math-note">Pour tester l'absence de valeur, on écrit plutôt <code>x is None</code> / <code>x is not None</code> que <code>== None</code>.</p>
` },
      { id: 'dico', t: 'Dictionnaires', sub: 'Compter les occurrences, defaultdict, dictionnaire inversé', html: R`
${def('dictionnaire', R`<p>Un <code>dict</code> associe des <b>clés</b> (hachables, uniques) à des <b>valeurs</b> : <code>d = {}</code>, <code>d[cle] = valeur</code>, <code>d[cle]</code> (<code>KeyError</code> si la clé est absente), <code>cle in d</code> (test sur les <b>clés</b>, en \(O(1)\) en moyenne), <code>d.keys()</code>, <code>d.values()</code>, <code>d.items()</code> (couples), <code>d.get(cle, defaut)</code>, <code>del d[cle]</code>. Depuis Python 3.7, l'ordre d'insertion est conservé.</p>`)}
${code(R`
import re
texte = "Beautiful is better than ugly. Simple is better than complex. Now is better than never."
mots = re.split(r'\W+', texte)       # découpe sur tout ce qui n'est pas lettre/chiffre
mots.remove("")                       # chaîne vide finale due au point final
dico = {}
for mot in mots:                      # comptage version 1
    mot = mot.lower()
    if mot in dico:
        dico[mot] += 1
    else:
        dico[mot] = 1
print(dico)
for mot, freq in dico.items():
    if freq > 1:
        print(mot, ":", freq)
`, R`
{'beautiful': 1, 'is': 3, 'better': 3, 'than': 3, 'ugly': 1, 'simple': 1, 'complex': 1, 'now': 1, 'never': 1}
is : 3
better : 3
than : 3
`)}
${def('defaultdict', R`<p><code>collections.defaultdict(int)</code> crée automatiquement une valeur <code>int()</code> = 0 pour une clé absente : plus besoin du test <code>if mot in dico</code>. Avec <code>defaultdict(list)</code>, la valeur par défaut est une liste vide <code>[]</code> : idéal pour regrouper.</p>
${code(R`
from collections import defaultdict
mots = ["the", "zen", "The", "of", "python", "the"]
dico = defaultdict(int)
for mot in mots:
    dico[mot.lower()] += 1
print(dict(dico))
dico_inverse = defaultdict(list)          # fréquence -> liste des mots
for cle, valeur in dico.items():
    dico_inverse[valeur].append(cle)
print(dict(dico_inverse))
for frequence, liste in sorted(dico_inverse.items(), reverse=True):
    print(frequence, ":", sorted(liste))
`, R`
{'the': 3, 'zen': 1, 'of': 1, 'python': 1}
{3: ['the'], 1: ['zen', 'of', 'python']}
3 : ['the']
1 : ['of', 'python', 'zen']
`)}`)}
<p>Le cours compare aussi <b>dictionnaire et ensemble</b> : <code>set(lis)</code> donne les modalités, un dictionnaire donne les modalités <b>et</b> leurs fréquences.</p>
` },
      { id: 'tri', t: 'Trier : sorted, key, reverse, stabilité', sub: 'itemgetter, attrgetter, lambda', html: R`
<p><code>sorted(it)</code> renvoie une <b>nouvelle liste</b> triée ; <code>lis.sort()</code> trie sur place. Paramètres : <code>key</code> (fonction qui donne le critère de tri de chaque élément) et <code>reverse=True</code> (ordre décroissant). <code>sorted(dico)</code> trie les <b>clés</b> ; <code>sorted(dico.items())</code> trie les couples (d'abord par clé).</p>
${code(R`
from operator import itemgetter
dico = {"is": 3, "better": 3, "ugly": 1, "than": 3, "zen": 1}
print(sorted(dico))
print(sorted(dico.items(), key=lambda x: x[1], reverse=True))
print(sorted(dico.items(), key=itemgetter(1, 0), reverse=True))
`, R`
['better', 'is', 'than', 'ugly', 'zen']
[('is', 3), ('better', 3), ('than', 3), ('ugly', 1), ('zen', 1)]
[('than', 3), ('is', 3), ('better', 3), ('zen', 1), ('ugly', 1)]
`)}
<p><code>itemgetter(1)</code> équivaut à <code>lambda x: x[1]</code> ; <code>itemgetter(1, 0)</code> à <code>lambda x: (x[1], x[0])</code> (tri par fréquence puis par mot). Mais <code>reverse=True</code> inverse <b>les deux</b> critères : les mots de même fréquence sortent en ordre alphabétique décroissant.</p>
${def('tri stable', R`<p>Un tri est <b>stable</b> s'il conserve l'ordre relatif des éléments égaux pour le critère. Les tris Python sont stables (même avec <code>reverse=True</code>). D'où la technique du cours pour « fréquences décroissantes, puis mots croissants » : trier d'abord par le critère <b>secondaire</b>, puis par le critère <b>principal</b>.</p>
${code(R`
from operator import itemgetter
dico = {"is": 3, "better": 3, "ugly": 1, "than": 3, "zen": 1}
tmp = sorted(dico.items())                          # 1. par mot croissant
res = sorted(tmp, key=itemgetter(1), reverse=True)  # 2. par fréquence décroissante
print(res)
print(sorted(dico.items(), key=lambda x: (-x[1], x[0])))   # équivalent en un tri
`, R`
[('better', 3), ('is', 3), ('than', 3), ('ugly', 1), ('zen', 1)]
[('better', 3), ('is', 3), ('than', 3), ('ugly', 1), ('zen', 1)]
`)}`)}
<p>Pour des objets, <code>attrgetter("titre", "numL")</code> trie selon les attributs <code>titre</code> puis <code>numL</code> (exemple de la bibliothèque, ci-dessous).</p>
` },
      { id: 'cesar', t: 'Codage par substitution (César)', sub: 'Dictionnaire de codage, chr, ord, join', html: R`
<p>Chaque lettre est remplacée par une autre selon un dictionnaire (une permutation de l'alphabet, pour pouvoir décoder) ; les caractères absents du dictionnaire sont conservés.</p>
${code(R`
def substitute(lettre, dictionnaire_codage):
    if lettre in dictionnaire_codage:
        return dictionnaire_codage[lettre]
    else:
        return lettre

def codage_par_substitution(texte, dictionnaire_codage):
    return "".join([substitute(lettre, dictionnaire_codage) for lettre in texte])

print(codage_par_substitution("CARCBCDCARC!", {"A": "B", "B": "C", "C": "A"}))
`, R`
ABRACADABRA!
`)}
<p><code>"".join(liste_de_chaînes)</code> recolle une liste de caractères en une chaîne (le séparateur est la chaîne sur laquelle on appelle <code>join</code>). <code>ord(c)</code> donne le code d'un caractère, <code>chr(n)</code> le caractère d'un code : <code>ord('A') = 65</code>, <code>ord('a') = 97</code>.</p>
${code(R`
def cree_dictionnaire_codage_par_decalage(d):
    """Associe à chaque lettre celle située d rangs plus loin (alphabet circulaire)"""
    maj = [chr(i + ord('A')) for i in range(26)]
    mini = [chr(i + ord('a')) for i in range(26)]
    dico = {}
    for i, lettre in enumerate(maj):
        dico[lettre] = maj[(i + d) % 26]
    for i, lettre in enumerate(mini):
        dico[lettre] = mini[(i + d) % 26]
    return dico

code3 = cree_dictionnaire_codage_par_decalage(3)
print(code3["A"], code3["Z"], code3["x"])
secret = codage_par_substitution("Ave Caesar !", code3)
print(secret)
print(codage_par_substitution(secret, cree_dictionnaire_codage_par_decalage(-3)))
`, R`
D C a
Dyh Fdhvdu !
Ave Caesar !
`)}
<p>Le <b>modulo</b> rend l'alphabet circulaire : <code>(25 + 3) % 26 = 2</code> donc <code>Z → C</code>. Pour décoder, on code avec le décalage opposé (en Python, <code>(i - 3) % 26</code> reste entre 0 et 25 même si <code>i - 3 &lt; 0</code>).</p>
` },
      { id: 'types', t: 'Définir de nouveaux types', sub: 'Enum, dictionnaires-enregistrements, classes, CSV', html: R`
${def('Enum', R`<p>Une classe héritant de <code>Enum</code> définit un <b>nombre fini de constantes</b> nommées, non modifiables, utilisables sans ambiguïté.</p>
${code(R`
from enum import Enum

class Etat(Enum):
    LIBRE = 1
    EMPRUNTE = 2

etats = [Etat.LIBRE, Etat.EMPRUNTE, Etat.EMPRUNTE]
print(1 in etats, Etat.LIBRE in etats)
print(Etat.LIBRE, Etat.LIBRE.value, Etat.LIBRE.name)
`, R`
False True
Etat.LIBRE 1 LIBRE
`)}
<p><code>Etat.LIBRE = 5</code> lève une <code>AttributeError</code> : on ne peut pas réassigner un membre.</p>`)}
<p>Un <b>enregistrement</b> regroupe des attributs décrivant un objet du réel. On peut utiliser un dictionnaire (<code>{"numL": "numL01", "titre": …, "etat": Etat.LIBRE}</code>), mais il faut alors nommer les clés toujours de la même façon ; une <b>classe</b> permet de bénéficier de la vérification syntaxique.</p>
${code(R`
from enum import Enum

class Etat(Enum):
    LIBRE = 1
    EMPRUNTE = 2

class Livre:
    def __init__(self, numL, titre, auteur, etat):   # constructeur
        self.numL = numL
        self.titre = titre
        self.auteur = auteur
        self.etat = etat

    def __str__(self):              # utilisée par print et str()
        return "Numéro = {}, Titre = {}, Etat = {}".format(self.numL, self.titre, self.etat)

livre1 = Livre("numL01", "Titre 01", "Auteur1", Etat.LIBRE)
livre2 = Livre("numL02", "Titre 02", "Auteur2", Etat.EMPRUNTE)
biblio = [livre2, livre1]
print(livre1)
print(livre1.titre, livre2.etat == Etat.EMPRUNTE)
for livre in biblio:
    print(livre)
`, R`
Numéro = numL01, Titre = Titre 01, Etat = Etat.LIBRE
Titre 01 True
Numéro = numL02, Titre = Titre 02, Etat = Etat.EMPRUNTE
Numéro = numL01, Titre = Titre 01, Etat = Etat.LIBRE
`)}
${warn('print d\'une liste d\'objets', R`<p><code>print(biblio)</code> affiche <code>[&lt;__main__.Livre object at 0x…&gt;, …]</code> : l'affichage d'une liste n'utilise pas <code>__str__</code> de ses éléments (il utilise <code>__repr__</code>). D'où la fonction <code>affichage_biblio</code> qui fait <code>for livre in lis_livres: print(livre)</code>.</p>`)}
<p>Le module <code>manipulation_csv</code> du cours fournit <code>lire_fichier_csv(nom_fichier, delim=";")</code> qui renvoie une <b>liste de listes de chaînes</b> (une par ligne du fichier, via <code>csv.reader</code>) et <code>ecrire_liste_dans_fichier_csv</code>. On convertit ensuite chaque ligne en <code>Livre</code> par compréhension :</p>
${code(R`
from operator import attrgetter
from manipulation_csv import lire_fichier_csv

def etat(val):
    if val == "1":
        return Etat.LIBRE
    elif val == "2":
        return Etat.EMPRUNTE

biblio = [Livre(l[0], l[1], l[2], etat(l[3])) for l in lire_fichier_csv("bibliotheque.csv")]
biblio = sorted(biblio, key=attrgetter("titre", "numL"))
`)}
${ex('compter et filtrer des objets, dans les deux styles', R`${code(R`
def nb_livres_libres(biblio):                      # pythonesque
    return sum([1 for livre in biblio if livre.etat == Etat.LIBRE])

def nb_livres_libres_gen(biblio):                  # générique
    nb = 0
    for i in range(0, len(biblio), 1):
        if biblio[i].etat == Etat.LIBRE:
            nb += 1
    return nb

def livres_empruntes(biblio):                      # pythonesque
    return [livre for livre in biblio if livre.etat == Etat.EMPRUNTE]

print(nb_livres_libres(biblio), nb_livres_libres_gen(biblio))
for livre in livres_empruntes(biblio):
    print(livre)
`, R`
1 1
Numéro = numL02, Titre = Titre 02, Etat = Etat.EMPRUNTE
`)}`)}
` },
      { id: 'complements', t: 'Exercices compléments', sub: 'Les classiques à refaire dans les deux styles', html: R`
<p>Ces exercices du notebook 20 sont typiques de l'examen : à chaque fois une version <b>générique</b> (drapeau, indices) et une version <b>pythonesque</b>.</p>
${code(R`
def est_trie(lis):                     # générique, linéaire, arrêt dès que possible
    trie = True
    i = 0
    while i < len(lis) - 1 and trie:
        if lis[i] <= lis[i+1]:
            i += 1
        else:
            trie = False
    return trie

def est_trie2(lis):                    # pythonesque
    return all([lis[i] <= lis[i+1] for i in range(len(lis) - 1)])

def est_palindrome(lis):               # générique : on compare jusqu'au milieu
    is_pal = True
    i = 0
    while i < len(lis) // 2 and is_pal:
        if lis[i] == lis[len(lis) - i - 1]:
            i += 1
        else:
            is_pal = False
    return is_pal

def est_palindrome2(lis):              # pythonesque
    return lis == [elt for elt in reversed(lis)]   # ou lis == lis[::-1]

def sont_equivalentes(lis1, lis2):     # mêmes valeurs, mêmes nombres d'occurrences
    return sorted(lis1) == sorted(lis2)

print(est_trie([1, 1, 2, 7]), est_trie([1, 0, 3]), est_trie([]), est_trie2([-1, 5, 3]))
print(est_palindrome([0, 1, 2, 1, 0]), est_palindrome2([1, 2]), est_palindrome([]))
print(sont_equivalentes([1, 2, 1], [2, 1, 1]), sont_equivalentes([1, 1, 1], [1, 1]))
`, R`
True False True False
True False True
True False
`)}
${ex('tri par insertion', R`<p>Insérer une valeur dans une liste <b>triée</b> (modifiée sur place, pas de retour) : on l'ajoute en fin puis on décale vers la droite les éléments plus grands.</p>
${code(R`
def insertion_dans_liste_triee(lis, val):
    lis.append(val)
    i = len(lis) - 2
    pos_trouve = False
    while i >= 0 and not pos_trouve:
        if lis[i] >= val:
            lis[i+1] = lis[i]
            i -= 1
        else:
            pos_trouve = True
    lis[i+1] = val

def tri_par_insertion(lis):
    """Retourne une copie triée de lis"""
    res = []
    for elt in lis:
        insertion_dans_liste_triee(res, elt)
    return res

print(tri_par_insertion([7, 3, 9, 10, 2, 1, 0, 5, 4, 11]))
print(tri_par_insertion(["Python", "java", "R", "C"]))
`, R`
[0, 1, 2, 3, 4, 5, 7, 9, 10, 11]
['C', 'Python', 'R', 'java']
`)}
<p>Pourquoi préférer <code>sort</code>/<code>sorted</code> ? Ils sont optimisés (algorithme et implémentation) : le <b>Timsort</b> est en \(O(n \log n)\), alors que le tri par insertion est en \(O(n^2)\). (Les chaînes se comparent par codes de caractères : les majuscules passent avant les minuscules.)</p>`)}
${ex('somme des n premiers impairs = n²', R`<p>Démarche imposée (complexité linéaire) : liste des impairs, liste des cumuls, puis vérification avec arrêt dès que possible « dans le respect des règles du cours » (donc <code>while</code> + drapeau, pas de <code>return</code> dans la boucle).</p>
${code(R`
def verif_somme_premiers_impairs(k):
    impairs = [2*i + 1 for i in range(k + 1)]
    cumuls = [impairs[0]]
    for i in range(1, len(impairs), 1):
        cumuls.append(cumuls[i-1] + impairs[i])
    ok = True
    i = 0
    while i < len(cumuls) and ok:
        ok = cumuls[i] == (i + 1)**2
        i += 1
    return ok

print(verif_somme_premiers_impairs(1000))
`, R`
True
`)}<p>Le calcul vérifie la propriété jusqu'à <code>k</code>, ce n'est pas une preuve pour tout entier.</p>`)}
` },
    ],
    keep: [
      "<code>t[i][j]</code> : ligne <code>i</code>, colonne <code>j</code> ; colonne <code>j</code> = <code>[t[i][j] for i in range(len(t))]</code>.",
      "Créer un tableau 2D avec <code>[[0]*m for i in range(n)]</code>, jamais <code>[[0]*m]*n</code>.",
      "Comptage : <code>if mot in dico: dico[mot] += 1 else: dico[mot] = 1</code>, ou <code>defaultdict(int)</code> ; regroupement : <code>defaultdict(list)</code>.",
      "<code>sorted(d.items(), key=itemgetter(1), reverse=True)</code> ; tri stable : trier d'abord par le critère secondaire.",
      "<code>\"\".join(liste)</code>, <code>ord</code>/<code>chr</code>, <code>(i + d) % 26</code> pour un décalage circulaire.",
      "<code>Enum</code> = constantes non modifiables ; classe : <code>__init__(self, …)</code> stocke les attributs, <code>__str__</code> sert à <code>print</code>.",
      "Timsort (<code>sorted</code>, <code>sort</code>) en \\(O(n \\log n)\\) contre \\(O(n^2)\\) pour le tri par insertion.",
      "Classiques à savoir refaire en deux styles : est trié, palindrome, équivalence de listes, présence/somme en 2D, filtrer/compter des objets.",
    ],
  },
];

/* ======================================================================= */
const C = (id, ch, q, a) => ({ id: 'pyc_' + id, ch, q, a });

/* ======================================================================= */
const Q = (id, ch, q, opts, ans, exp) => ({ id: 'pyq_' + id, ch, q, opts, ans, exp });
export const quizPy = [
  Q('range1', 'pybase', `Que vaut list(range(2, 10, 3)) ?`, [`[2, 5, 8]`, `[2, 5, 8, 11]`, `[3, 6, 9]`, `[2, 3, 4, 5, 6, 7, 8, 9]`], 0, `On part de 2 avec un pas de 3 ; le seuil 10 est exclu.`),
  Q('range2', 'pybase', `Combien de valeurs parcourt for i in range(1, 11, 1) ?`, [`11`, `9`, `10`, `12`], 2, `De 1 à 10 inclus (11 exclu) : 10 valeurs.`),
  Q('input', 'pybase', `On saisit 21 pour x = input("Entier : "). Que vaut 2*x ?`, [`42`, `"2121"`, `une erreur TypeError`, `"42"`], 1, `input renvoie une chaîne ; 2 * "21" répète la chaîne. Il fallait int(input(...)).`),
  Q('neg', 'pybase', `Avec y = [2, 6, "rouge", True, 3.6], que vaut y[-2] ?`, [`6`, `"rouge"`, `3.6`, `True`], 3, `y[-1] est 3.6, y[-2] l'avant-dernier : True.`),
  Q('compr1', 'pybase', `Que vaut [2*i+1 for i in range(3)] ?`, [`[1, 3, 5]`, `[0, 2, 4]`, `[1, 3, 5, 7]`, `[3, 5, 7]`], 0, `i prend 0, 1, 2 donc 1, 3, 5 : les 3 premiers impairs.`),
  Q('compr2', 'pybase', `Que vaut [i**2 for i in range(6) if i % 2 == 0] ?`, [`[0, 1, 4, 9, 16, 25]`, `[1, 9, 25]`, `[0, 4, 16]`, `[4, 16]`], 2, `Le filtre garde i = 0, 2, 4, dont les carrés sont 0, 4, 16.`),
  Q('alias', 'pybase', `Après lis = [1, 2, 3] ; lis2 = lis ; lis2.append(4), que vaut lis ?`, [`[1, 2, 3]`, `[1, 2, 3, 4]`, `[4]`, `une erreur`], 1, `lis2 = lis crée un alias : les deux noms désignent la même liste.`),
  Q('copy', 'pybase', `Après lis = [1, 2, 3] ; c = lis.copy() ; lis[0] = 9, que vaut c ?`, [`[9, 2, 3]`, `[9]`, `None`, `[1, 2, 3]`], 3, `copy crée une liste indépendante.`),
  Q('append', 'pybase', `Après lis = [1, 2] ; lis.append([3, 4]), que vaut len(lis) ?`, [`3`, `4`, `2`, `5`], 0, `append ajoute un seul élément : la liste [3, 4]. Avec extend, on aurait 4.`),
  Q('appendnone', 'pybase', `Après lis = [1, 2] ; lis = lis.append(3), que vaut lis ?`, [`[1, 2, 3]`, `[3]`, `None`, `[1, 2]`], 2, `append modifie la liste sur place et renvoie None : on a écrasé la liste.`),
  Q('slice', 'pybase', `Avec lis = [6, 8, 9, 1, 2], que vaut lis[1:3] ?`, [`[6, 8, 9]`, `[8, 9]`, `[8, 9, 1]`, `[9, 1]`], 1, `Indices 1 à 2 (3 exclu).`),
  Q('slicedel', 'pybase', `Avec lis = [6, 8, 9, 1, 2] ; lis[1:4] = [], que vaut lis ?`, [`[6, 2]`, `[6, 1, 2]`, `[2]`, `[6, 8, 2]`], 0, `Une tranche à gauche d'un = remplace cette partie : les indices 1 à 3 sont supprimés.`),
  Q('remove', 'pybase', `Avec lis = [3, 1, 3, 2] ; lis.remove(3), que vaut lis ?`, [`[1, 2]`, `[3, 1, 2]`, `[3, 1, 3]`, `[1, 3, 2]`], 3, `remove supprime la première occurrence de la valeur 3.`),
  Q('set', 'pybase', `Que vaut len(set([3, 2, 5, 2, 3, 2])) ?`, [`6`, `3`, `2`, `5`], 1, `Les modalités sont 2, 3 et 5.`),
  Q('setvide', 'pybase', `Quel est le type de x = {} ?`, [`dict`, `set`, `list`, `tuple`], 0, `{} est un dictionnaire vide ; l'ensemble vide s'écrit set().`),
  Q('hash', 'pybase', `Que provoque s = set() ; s.add([1, 2]) ?`, [`s vaut {1, 2}`, `s vaut {[1, 2]}`, `TypeError : unhashable type: 'list'`, `s reste vide`], 2, `Une liste est modifiable donc non hachable.`),
  Q('float', 'pybase', `Que vaut 0.1 + 0.2 == 0.3 ?`, [`True`, `False`, `une erreur`, `None`], 1, `0.1 + 0.2 vaut 0.30000000000000004 en flottant binaire.`),
  Q('allvide', 'pybase', `Que vaut all([]) ?`, [`False`, `None`, `une erreur`, `True`], 3, `Une propriété universelle est vraie sur la liste vide (drapeau initialisé à True).`),
  Q('any', 'pybase', `Que vaut any([elt % 2 == 0 for elt in [3, 5, 8]]) ?`, [`True`, `False`, `[False, False, True]`, `8`], 0, `8 est pair : au moins un élément vaut True.`),
  Q('sum', 'pybase', `Que vaut sum([1 for x in [4, 7, 10, 3] if x > 5]) ?`, [`17`, `4`, `2`, `0`], 2, `On compte les éléments > 5 : 7 et 10.`),
  Q('none', 'pybase', `La fonction f contient pour seul return : if x > 0: return 1. Que vaut f(-3) ?`, [`0`, `-1`, `une erreur`, `None`], 3, `Aucun return n'est exécuté : la fonction renvoie None.`),
  Q('index', 'pybase', `Que fait [1, 2, 3].index(5) ?`, [`renvoie -1`, `lève une exception ValueError`, `renvoie None`, `renvoie 3`], 1, `index lève une exception si la valeur est absente ; on la capture avec try / except.`),
  Q('defaut', 'pybase', `def f(x, lis=[]): lis.append(x); return lis. Que donne print(f(1), f(2)) ?`, [`[1] [2]`, `[1, 2] [1, 2]`, `[1] [1, 2]`, `[2] [2]`], 1, `La liste par défaut est partagée : après les deux appels, les deux résultats sont la même liste [1, 2].`),
  Q('rule', 'pybase', `En approche passe-partout, quelle structure pour chercher un élément en s'arrêtant dès qu'on le trouve ?`, [`un for avec return`, `un for avec break`, `un while avec un drapeau`, `x in lis`], 2, `Règle du cours : while si l'on peut s'arrêter avant la fin, pas de return ni de break dans une boucle.`),
  Q('main', 'pybase', `Quand le bloc if __name__ == "__main__": est-il exécuté ?`, [`à chaque import du module`, `quand le fichier est lancé directement (python fichier.py ou %run)`, `jamais dans un notebook`, `seulement avec from module import *`], 1, `Lors d'un import, __name__ vaut le nom du module, pas "__main__".`),
  Q('timeit', 'pybase', `timeit.timeit(stmt="f(10)", number=100) lève NameError alors que f est définie dans le notebook. Pourquoi ?`, [`number est trop grand`, `stmt doit être une liste`, `f doit être renvoyée par setup`, `timeit s'exécute dans un environnement séparé : il faut setup="from __main__ import f"`], 3, `Ou passer stmt=lambda: f(10).`),
  Q('defaultdict', 'pybase', `Avec d = defaultdict(int) ; for m in ["a", "b", "a"]: d[m] += 1, que vaut d["a"] ?`, [`2`, `1`, `KeyError`, `0`], 0, `Une clé absente vaut d'abord int() = 0, puis on incrémente.`),
  Q('sorteddict', 'pybase', `Que renvoie sorted({"b": 1, "a": 2}) ?`, [`[("a", 2), ("b", 1)]`, `["a", "b"]`, `[1, 2]`, `{"a": 2, "b": 1}`], 1, `Trier un dictionnaire trie ses clés ; pour les couples, utiliser items().`),
  Q('sortkey', 'pybase', `Que vaut sorted([("a", 2), ("b", 3), ("c", 1)], key=itemgetter(1), reverse=True) ?`, [`[("c", 1), ("a", 2), ("b", 3)]`, `[("c", 1), ("b", 3), ("a", 2)]`, `[("b", 3), ("a", 2), ("c", 1)]`, `[("a", 2), ("b", 3), ("c", 1)]`], 2, `Tri par seconde composante décroissante.`),
  Q('stable', 'pybase', `Pour trier des couples (mot, fréquence) par fréquence décroissante puis mot croissant, que propose le cours ?`, [`trier par mot, puis trier le résultat par fréquence avec reverse=True (tri stable)`, `trier par fréquence, puis par mot`, `key=itemgetter(1, 0), reverse=True`, `c'est impossible avec sorted`], 0, `Le tri est stable : on trie d'abord par le critère secondaire. itemgetter(1, 0) avec reverse=True inverserait aussi l'ordre des mots.`),
  Q('join', 'pybase', `Que vaut "-".join(["a", "b", "c"]) ?`, [`"abc"`, `"-a-b-c-"`, `"a-b-c"`, `["a-", "b-", "c"]`], 2, `join recolle les chaînes avec le séparateur entre elles.`),
  Q('cesar', 'pybase', `Avec maj = [chr(i + ord("A")) for i in range(26)], que vaut maj[(25 + 3) % 26] ?`, [`"Z"`, `"C"`, `"D"`, `IndexError`], 1, `(25 + 3) % 26 = 2 : Z décalé de 3 donne C.`),
  Q('enum', 'pybase', `Avec class Etat(Enum): LIBRE = 1, que vaut 1 in [Etat.LIBRE] ?`, [`False`, `True`, `une erreur`, `None`], 0, `Etat.LIBRE est un membre d'énumération, pas l'entier 1 (sa valeur est Etat.LIBRE.value).`),
  Q('str', 'pybase', `Quelle méthode d'une classe est utilisée par print(objet) ?`, [`__init__`, `__print__`, `__str__`, `__main__`], 2, `__str__ renvoie la description textuelle ; une liste d'objets s'affiche toutefois avec __repr__.`),
  Q('tab2d', 'pybase', `t = [[0]*2]*2 ; t[0][0] = 1. Que vaut t ?`, [`[[1, 0], [0, 0]]`, `[[1, 1], [0, 0]]`, `[[1, 0], [1, 0]]`, `une erreur`], 2, `Les deux lignes sont la même liste. Utiliser [[0]*2 for i in range(2)].`),
  Q('colonne', 'pybase', `Avec t = [[1, 2], [3, 4], [5, 6]], que vaut [t[i][1] for i in range(len(t))] ?`, [`[3, 4]`, `[1, 3, 5]`, `[2, 4, 6]`, `[1, 2]`], 2, `C'est la colonne d'indice 1.`),
  Q('tri', 'pybase', `Quelle est la complexité de sorted (Timsort) sur n éléments ?`, [`O(n)`, `O(n log n)`, `O(n²)`, `O(log n)`], 1, `Contre O(n²) pour le tri par insertion vu en TD.`),
  Q('palin', 'pybase', `Que vaut lis == lis[::-1] pour lis = [1, 2, 1] ?`, [`True`, `False`, `[1, 2, 1]`, `une erreur`], 0, `lis[::-1] renverse la liste ; [1, 2, 1] est un palindrome.`),
];
