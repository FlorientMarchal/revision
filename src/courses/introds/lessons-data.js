// Leçons de la partie « Python pour la science des données » (S. Bringay), rédigées à partir des notebooks corrigés du cours.
const R = String.raw;
const box = (k, title, html) => `<div class="box ${k}"><div class="box-h">${title}</div>${html}</div>`;
const def = (t, h) => box('def', 'Définition · ' + t, h);
const prop = (t, h) => box('prop', t, h);
const ex = (t, h) => box('ex', 'Exemple · ' + t, h);
const warn = (t, h) => box('warn', 'Attention · ' + t, h);
const method = (t, h) => box('method', 'Méthode · ' + t, h);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const code = (src, out) => `<pre class="code"><code>${esc(src.trim())}</code></pre>` + (out ? `<pre class="code-out">${esc(out.trim())}</pre>` : '');

// Tableau météo réutilisé dans toute la leçon NumPy (3 villes × 5 jours).
const TV = R`
import numpy as np

# lignes = villes (Lille, Lyon, Montpellier) ; colonnes = jours (lundi … vendredi)
T = np.array([
    [18.5, 20.0, 21.5, 23.0, 22.0],   # Lille
    [22.0, 24.5, 26.0, 27.5, 25.0],   # Lyon
    [25.0, 27.0, 29.5, 31.0, 30.0]    # Montpellier
])
`;

export const lessonsData = [
  /* ===================================================================== */
  {
    id: 'd1', ch: 'pydata', short: 'NumPy', src: 'Notebook NumPy (météo)',
    t: 'NumPy : tableaux et calcul vectorisé',
    sub: 'Le ndarray et son dtype, la création de tableaux, l\'indexation et le slicing, la concaténation, le calcul vectorisé, les masques, les statistiques selon un axe et le broadcasting, sur des relevés météo (villes × jours).',
    goals: [
      'Créer un tableau NumPy, lire son dtype, son ndim, sa shape et sa size, et prévoir le type choisi par NumPy.',
      'Accéder à un élément T[i, j], à une ligne, à une colonne ou à un sous-tableau avec début:fin:pas.',
      'Remplacer une boucle Python par une opération vectorisée, un masque booléen ou np.where.',
      'Calculer des statistiques avec axis=0 (une valeur par colonne) ou axis=1 (une valeur par ligne) sans se tromper.',
      'Prévoir si deux formes sont compatibles pour le broadcasting et quelle forme aura le résultat.',
    ],
    sections: [
      { id: 'ndarray', t: 'Le tableau NumPy et son dtype', sub: 'Un tableau = des éléments d\'un même type', html: R`
<p>NumPy (<i>Numerical Python</i>) fournit le type <code>ndarray</code> : un tableau à une ou plusieurs dimensions (vecteur, matrice…) et des fonctions précompilées qui s'appliquent au tableau entier. On l'importe toujours sous l'alias <code>np</code>.</p>
${def('dtype', R`<p>Tous les éléments d'un tableau NumPy ont le <b>même type</b>, stocké dans l'attribut <code>dtype</code>. NumPy le déduit des valeurs à la création, ou on l'impose avec l'argument <code>dtype=</code>. Le type conditionne les opérations possibles et la mémoire utilisée.</p>`)}
${code(R`
import numpy as np

a = np.array([18, 21, 19, 24, 22])                 # que des entiers
b = np.array([18.5, 21, 19, 24, 22])               # un seul décimal suffit
c = np.array([0, 2, 5, 1], dtype="float32")        # type imposé
print(a, a.dtype)
print(b, b.dtype)
print(c, c.dtype)
`, R`
[18 21 19 24 22] int64
[18.5 21.  19.  24.  22. ] float64
[0. 2. 5. 1.] float32
`)}
<p>Avec <code>18.5</code> dans la liste, NumPy convertit <b>toutes</b> les valeurs en flottants : c'est pourquoi <code>21</code> s'affiche <code>21.</code>. NumPy choisit le type le plus « large » capable de tout représenter (booléen &lt; entier &lt; flottant &lt; chaîne).</p>
${warn('conversions silencieuses', R`<p>Un seul texte transforme tout le tableau en chaînes, et une valeur décimale affectée dans un tableau d'entiers est <b>tronquée</b> sans message d'erreur :</p>
${code(R`
print(np.array([1, 2.5, "3"]))      # tout devient du texte
x = np.array([18, 21, 19])          # dtype int64
x[0] = 18.9
print(x)
print(np.array([18.7, 21.2]).astype(int))   # conversion explicite : troncature
`, R`
['1' '2.5' '3']
[18 21 19]
[18 21]
`)}
<p>Le type entier par défaut est <code>int64</code> sous Linux et macOS (et sous Windows depuis NumPy 2 ; <code>int32</code> avant).</p>`)}
<h3>Caractéristiques d'un tableau</h3>
<table class="t"><thead><tr><th>Attribut</th><th>Contenu</th><th>Pour T de 3 villes × 5 jours</th></tr></thead><tbody>
<tr><td><code>T.ndim</code></td><td>nombre de dimensions (d'axes)</td><td><code>2</code></td></tr>
<tr><td><code>T.shape</code></td><td>tuple des tailles de chaque axe (lignes, colonnes)</td><td><code>(3, 5)</code></td></tr>
<tr><td><code>T.size</code></td><td>nombre total d'éléments (produit de la shape)</td><td><code>15</code></td></tr>
<tr><td><code>T.dtype</code></td><td>type des éléments</td><td><code>float64</code></td></tr>
<tr><td><code>len(T)</code></td><td>taille du <b>premier</b> axe seulement</td><td><code>3</code></td></tr>
</tbody></table>
${code(TV + R`
print(T.ndim, T.shape, T.size, T.dtype, len(T))
`, R`
2 (3, 5) 15 float64 3
`)}
<p>Une shape <code>(3, 5)</code> se lit « 3 lignes (les villes), 5 colonnes (les jours) ». Un vecteur de 7 valeurs a la shape <code>(7,)</code> : un tuple à <b>un seul</b> élément (la virgule est obligatoire), donc <code>ndim = 1</code>.</p>
` },
      { id: 'creer', t: 'Créer des tableaux', sub: 'zeros, ones, full, arange, linspace, eye, reshape, random', html: R`
<p>On crée un tableau à partir d'une liste (<code>np.array</code>, une liste de listes donne une matrice) ou avec des fonctions qui fabriquent directement des tableaux. Les fonctions qui prennent une forme acceptent un entier (vecteur) ou un <b>tuple</b> <code>(lignes, colonnes)</code>.</p>
<table class="t"><thead><tr><th>Fonction</th><th>Produit</th><th>Exemple → résultat</th></tr></thead><tbody>
<tr><td><code>np.zeros(forme)</code></td><td>que des 0 (float par défaut)</td><td><code>np.zeros(4)</code> → <code>[0. 0. 0. 0.]</code></td></tr>
<tr><td><code>np.ones(forme)</code></td><td>que des 1</td><td><code>np.ones((2, 3))</code> → 2 × 3 de <code>1.</code></td></tr>
<tr><td><code>np.full(forme, v)</code></td><td>que des v</td><td><code>np.full((3, 5), 20.0)</code> → 3 × 5 de <code>20.</code></td></tr>
<tr><td><code>np.arange(début, fin, pas)</code></td><td>comme <code>range</code> : <b>fin exclue</b>, pas fixé</td><td><code>np.arange(0, 24, 3)</code> → <code>[0 3 … 21]</code></td></tr>
<tr><td><code>np.linspace(début, fin, n)</code></td><td>n valeurs régulièrement espacées, <b>fin incluse</b></td><td><code>np.linspace(10, 30, 5)</code> → <code>[10. 15. 20. 25. 30.]</code></td></tr>
<tr><td><code>np.eye(n)</code></td><td>matrice identité n × n</td><td>1 sur la diagonale, 0 ailleurs</td></tr>
<tr><td><code>t.reshape(l, c)</code></td><td>même données, nouvelle forme (l × c = size)</td><td><code>np.arange(16).reshape(4, 4)</code></td></tr>
<tr><td><code>rng.random(forme)</code></td><td>uniformes dans [0, 1[</td><td>avec <code>rng = np.random.default_rng(42)</code></td></tr>
</tbody></table>
${code(R`
print(np.zeros((2, 3), dtype=int))
print(np.arange(0, 24, 3))        # heures de relevé, toutes les 3 h
print(np.arange(0, 1, 0.25))      # le pas peut être décimal
print(np.linspace(0, 1, 5))       # 5 points, bornes comprises
print(np.eye(3))
print(np.arange(12).reshape(3, 4))
print(np.arange(12).reshape(4, -1).shape)   # -1 : NumPy calcule la taille manquante
`, R`
[[0 0 0]
 [0 0 0]]
[ 0  3  6  9 12 15 18 21]
[0.   0.25 0.5  0.75]
[0.   0.25 0.5  0.75 1.  ]
[[1. 0. 0.]
 [0. 1. 0.]
 [0. 0. 1.]]
[[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]
(4, 3)
`)}
${prop('arange ou linspace ?', R`<p><code>arange</code> fixe le <b>pas</b> (le nombre de valeurs en découle, la fin est exclue) ; <code>linspace</code> fixe le <b>nombre de points</b> (le pas en découle, la fin est incluse). Pour tracer une courbe lisse, on utilise <code>np.linspace(0, 8, 500)</code>. <code>reshape</code> échoue (<code>ValueError</code>) si le produit des nouvelles dimensions n'est pas égal à <code>size</code>.</p>`)}
<h3>Nombres aléatoires reproductibles</h3>
<p>La méthode actuelle consiste à créer un générateur avec une <b>graine</b> : avec la même graine, on obtient les mêmes tirages à chaque exécution.</p>
${code(R`
rng = np.random.default_rng(42)       # graine fixée
print(rng.random((2, 3)))              # uniformes dans [0, 1[
# autres méthodes : rng.integers(0, 10, size=5), rng.normal(moyenne, écart_type, size=n),
#                   rng.uniform(-10, 40, size=500_000)
`, R`
[[0.77395605 0.43887844 0.85859792]
 [0.69736803 0.09417735 0.97562235]]
`)}
` },
      { id: 'acceder', t: 'Indexation et slicing', sub: 'T[i], T[i, j], début:fin:pas', html: R`
<p>Les indices commencent à <b>0</b> ; les indices négatifs partent de la fin (<code>-1</code> = dernier). Dans un tableau 2D, on écrit <b>ligne puis colonne</b> dans les mêmes crochets : <code>T[ligne, colonne]</code>.</p>
${code(R`
P = np.array([17, 19, 21, 20, 23, 25, 22])   # Paris, 7 jours
print(P[0], P[-1], P[2])
`, R`
17 22 21
`)}
${def('slicing', R`<p><code>x[début:fin:pas]</code> sélectionne les indices de <code>début</code> (inclus) à <code>fin</code> (<b>exclue</b>) avec le pas donné. Chaque partie peut être omise : début par défaut 0, fin par défaut la taille, pas par défaut 1. Un pas négatif parcourt le tableau à l'envers.</p>`)}
${code(R`
print(P[:5])      # 5 premiers jours (indices 0 à 4)
print(P[4:])      # à partir de l'indice 4 inclus
print(P[::2])     # un jour sur deux
print(P[1:6:2])   # indices 1, 3, 5
print(P[::-1])    # ordre inversé
`, R`
[17 19 21 20 23]
[23 25 22]
[17 21 23 22]
[19 20 25]
[22 25 23 20 21 19 17]
`)}
<h3>En deux dimensions</h3>
<p>Le <code>:</code> seul signifie « toutes les lignes » ou « toutes les colonnes ».</p>
${code(TV + R`
print(T[2, 2])      # Montpellier (ligne 2), mercredi (colonne 2)
print(T[0, :])      # toute la ligne 0 = Lille ; T[0] donne la même chose
print(T[:, 2])      # toute la colonne 2 = mercredi, pour toutes les villes
print(T[:, -2:])    # les deux derniers jours
print(T[1:, :2])    # Lyon et Montpellier, lundi et mardi
`, R`
29.5
[18.5 20.  21.5 23.  22. ]
[21.5 26.  29.5]
[[23.  22. ]
 [27.5 25. ]
 [31.  30. ]]
[[22.  24.5]
 [25.  27. ]]
`)}
${prop('Forme du résultat', R`<p>Un indice entier <b>supprime</b> un axe, une tranche le <b>conserve</b> : <code>T[:, 2]</code> a la forme <code>(3,)</code> alors que <code>T[:, 2:3]</code> a la forme <code>(3, 1)</code>. <code>T[2, 2]</code> est un simple nombre.</p>`)}
${warn('une tranche est une vue', R`<p>Le slicing ne copie pas les données : il renvoie une <b>vue</b> sur le tableau d'origine. Modifier la vue modifie l'original. Pour travailler sur une copie indépendante, utiliser <code>.copy()</code>.</p>
${code(R`
P = np.array([17, 19, 21, 20, 23, 25, 22])
v = P[:3]
v[0] = 99
print(P)            # l'original a changé !
`, R`
[99 19 21 20 23 25 22]
`)}`)}
` },
      { id: 'assembler', t: 'Concaténer des tableaux', sub: 'concatenate, vstack, hstack', html: R`
<table class="t"><thead><tr><th>Fonction</th><th>Effet</th><th>Condition</th></tr></thead><tbody>
<tr><td><code>np.concatenate([a, b])</code></td><td>met bout à bout le long d'un axe existant (<code>axis=0</code> par défaut)</td><td>mêmes tailles sur les autres axes</td></tr>
<tr><td><code>np.concatenate([a, b], axis=1)</code></td><td>colle côte à côte (ajoute des colonnes)</td><td>même nombre de lignes</td></tr>
<tr><td><code>np.vstack([a, b])</code></td><td>empile verticalement : <b>ajoute des lignes</b> ; un vecteur 1D est traité comme une ligne</td><td>même nombre de colonnes</td></tr>
<tr><td><code>np.hstack([a, b])</code></td><td>empile horizontalement : <b>ajoute des colonnes</b> (pour des vecteurs 1D : les met bout à bout)</td><td>même nombre de lignes</td></tr>
</tbody></table>
${code(R`
debut = np.array([18, 20, 21])
fin = np.array([22, 24, 23, 19])
print(np.concatenate([debut, fin]))        # une semaine complète

nouvelle_ville = np.array([19.0, 21.0, 22.0, 24.0, 23.0])
T4 = np.vstack([T, nouvelle_ville])         # (3, 5) + une ligne de 5
print(T4)
print(T4.shape)

samedi = np.array([[24.0], [26.5], [31.5]]) # colonne de forme (3, 1)
print(np.hstack([T, samedi]).shape)         # un jour de plus

A = np.ones((2, 3)); B = np.zeros((2, 3))
print(np.concatenate([A, B]).shape, np.concatenate([A, B], axis=1).shape)
`, R`
[18 20 21 22 24 23 19]
[[18.5 20.  21.5 23.  22. ]
 [22.  24.5 26.  27.5 25. ]
 [25.  27.  29.5 31.  30. ]
 [19.  21.  22.  24.  23. ]]
(4, 5)
(3, 6)
(4, 3) (2, 6)
`)}
<p>Toutes ces fonctions prennent une <b>liste</b> (ou un tuple) de tableaux comme premier argument et renvoient un <b>nouveau</b> tableau : l'original n'est pas modifié, il faut réaffecter le résultat.</p>
` },
      { id: 'vectoriser', t: 'Calcul vectorisé, masques et np.where', sub: 'Éviter les boucles Python', html: R`
${def('vectorisation', R`<p>Une opération <b>vectorisée</b> s'applique à tout le tableau en une instruction, élément par élément, sans boucle Python : la boucle est exécutée en code compilé par NumPy, ce qui est beaucoup plus rapide.</p>`)}
${code(R`
def celsius_vers_fahrenheit_boucle(valeurs):
    sortie = np.empty(len(valeurs))
    for i in range(len(valeurs)):
        sortie[i] = valeurs[i] * 9 / 5 + 32
    return sortie

petit = np.array([10., 15., 20., 25., 30.])
print("Boucle :", celsius_vers_fahrenheit_boucle(petit))
print("NumPy  :", petit * 9 / 5 + 32)
`, R`
Boucle : [50. 59. 68. 77. 86.]
NumPy  : [50. 59. 68. 77. 86.]
`)}
<p>Dans le TP, sur 500 000 températures, la boucle met environ 0,1 s et la version NumPy environ 0,001 s (≈ 100 fois plus rapide) pour un résultat identique (<code>np.allclose</code> renvoie <code>True</code>). De même, <code>np.sum(t)</code> est plus rapide que la fonction Python <code>sum(t)</code>. <b>Règle :</b> dès qu'une opération concerne tout un tableau, chercher l'opération NumPy plutôt qu'une boucle.</p>
<h3>Opérateurs et fonctions universelles (ufuncs)</h3>
${code(R`
x = np.array([10, 15, 20, 25])
print(x + 2, x * 2, x // 3, x % 3)
print(x / 2)                     # la division / donne toujours des flottants
print(x + np.array([1, 2, 3, 4]))    # deux tableaux de même forme : terme à terme

a = np.array([-3, -1, 1, 2])
print(np.abs(a))
print(np.round(np.exp(a), 3))
`, R`
[12 17 22 27] [20 30 40 50] [3 5 6 8] [1 0 2 1]
[ 5.   7.5 10.  12.5]
[11 17 23 29]
[3 1 1 2]
[0.05  0.368 2.718 7.389]
`)}
<p>Les <b>ufuncs</b> (<code>np.abs</code>, <code>np.sqrt</code>, <code>np.exp</code>, <code>np.log</code>, <code>np.log1p</code> = log(1+x), <code>np.sin</code>, <code>np.round</code>…) s'appliquent élément par élément et renvoient un tableau de même forme. Il faut utiliser <code>np.exp</code> et non <code>math.exp</code>, qui n'accepte qu'un nombre.</p>
<h3>Masques booléens</h3>
<p>Une comparaison appliquée à un tableau renvoie un tableau de booléens de même forme : un <b>masque</b>. Placé entre crochets, il sélectionne les éléments où il vaut <code>True</code> (le résultat est toujours un vecteur 1D).</p>
${code(R`
M = np.array([[18.5, 22.0, 27.0],
              [24.5, 29.0, 31.5],
              [16.0, 25.5, 28.0]])
print(M > 25)
print(M[M > 25])                     # filtrage
print(np.sum(M > 25))                # True vaut 1 : on compte
print((M > 25).mean())               # proportion de True
print(M[(M > 20) & (M < 28)])        # ET : & avec parenthèses
print(M[(M < 17) | (M > 30)])        # OU : |
print(M[~(M > 25)])                  # NON : ~
`, R`
[[False False  True]
 [False  True  True]
 [False  True  True]]
[27.  29.  31.5 25.5 28. ]
5
0.5555555555555556
[22.  27.  24.5 25.5]
[31.5 16. ]
[18.5 22.  24.5 16. ]
`)}
${warn('&amp;, | et ~, jamais and / or / not', R`<p>Sur des tableaux, on combine les conditions avec <code>&amp;</code>, <code>|</code> et <code>~</code>, et chaque condition doit être <b>entre parenthèses</b> (ces opérateurs sont prioritaires sur <code>&lt;</code> et <code>&gt;</code>). <code>and</code>, <code>or</code> et <code>not</code> provoquent une <code>ValueError</code> (« The truth value of an array with more than one element is ambiguous »).</p>`)}
<h3><code>np.where(condition, si_vrai, si_faux)</code></h3>
<p>Construit un <b>nouveau</b> tableau de même forme : là où la condition est vraie on prend <code>si_vrai</code>, sinon <code>si_faux</code> (des tableaux ou des constantes).</p>
${code(R`
print(np.where(M >= 25, M, -1))             # garder >= 25, remplacer le reste par -1
print(np.where(M > 25, "chaud", "doux"))   # étiqueter
print(np.where(M > 30))                     # 1 seul argument : indices (lignes, colonnes) des True
`, R`
[[-1.  -1.  27. ]
 [-1.  29.  31.5]
 [-1.  25.5 28. ]]
[['doux' 'doux' 'chaud']
 ['doux' 'chaud' 'chaud']
 ['doux' 'chaud' 'chaud']]
(array([1]), array([2]))
`)}
<p>Exemple du TP : plafonner à 30 °C s'écrit <code>np.where(t &gt; 30, 30, t)</code>.</p>
` },
      { id: 'axis', t: 'Statistiques et paramètre axis', sub: 'axis=0 : par colonne ; axis=1 : par ligne', html: R`
<p>NumPy propose <code>sum</code>, <code>mean</code>, <code>min</code>, <code>max</code>, <code>std</code>, <code>median</code>, <code>argmin</code>, <code>argmax</code>, <code>percentile</code>… sous forme de fonctions (<code>np.mean(T)</code>) ou de méthodes (<code>T.mean()</code>). <b>Sans <code>axis</code></b>, le calcul porte sur <b>tous</b> les éléments et renvoie un seul nombre.</p>
${def('axis', R`<p><code>axis</code> désigne l'axe <b>le long duquel on calcule</b>, c'est-à-dire l'axe qui <b>disparaît</b> du résultat. Pour T de forme <code>(3 villes, 5 jours)</code> :</p>
<ul><li><code>axis=0</code> : on parcourt les <b>lignes</b> (on descend dans chaque colonne) et on les écrase → une valeur <b>par colonne</b> = <b>par jour</b>, résultat de forme <code>(5,)</code> ;</li>
<li><code>axis=1</code> : on parcourt les <b>colonnes</b> (on avance le long de chaque ligne) → une valeur <b>par ligne</b> = <b>par ville</b>, résultat de forme <code>(3,)</code>.</li></ul>`)}
${ex('précipitations (3 villes × 5 jours)', R`
${code(R`
pluie = np.array([[0.0, 2.5, 0.0, 4.0, 1.0],    # ville 1
                  [1.0, 0.0, 3.5, 0.0, 0.0],    # ville 2
                  [0.0, 0.0, 0.0, 0.0, 2.0]])   # ville 3
print(pluie.sum())          # tout le tableau
print(pluie.sum(axis=0))    # somme de chaque colonne = par jour (5 valeurs)
print(pluie.sum(axis=1))    # somme de chaque ligne = par ville (3 valeurs)
`, R`
14.0
[1.  2.5 3.5 4.  3. ]
[7.5 4.5 2. ]
`)}
<table class="t"><thead><tr><th></th><th>lun</th><th>mar</th><th>mer</th><th>jeu</th><th>ven</th><th>axis=1 (par ville)</th></tr></thead><tbody>
<tr><td>ville 1</td><td>0</td><td>2.5</td><td>0</td><td>4</td><td>1</td><td><b>7.5</b></td></tr>
<tr><td>ville 2</td><td>1</td><td>0</td><td>3.5</td><td>0</td><td>0</td><td><b>4.5</b></td></tr>
<tr><td>ville 3</td><td>0</td><td>0</td><td>0</td><td>0</td><td>2</td><td><b>2</b></td></tr>
<tr><td>axis=0 (par jour)</td><td><b>1</b></td><td><b>2.5</b></td><td><b>3.5</b></td><td><b>4</b></td><td><b>3</b></td><td>total 14</td></tr>
</tbody></table>`)}
${code(TV + R`
print(T.mean(axis=1))              # moyenne de chaque ville
print(T.mean(axis=0))              # moyenne de chaque jour, toutes villes confondues
print(T.max(axis=0))               # maximum de chaque jour
print(np.argmax(T, axis=1))        # pour chaque ville : indice du jour le plus chaud
print(np.argmax(T))                # sans axis : indice dans le tableau "aplati"
print(np.std(T, axis=1))           # écart type de chaque ville
print((T > 25).sum(axis=1))        # nombre de jours > 25 °C par ville
`, R`
[21.  25.  28.5]
[21.83333333 23.83333333 25.66666667 27.16666667 25.66666667]
[25.  27.  29.5 31.  30. ]
[3 3 3]
13
[1.58113883 1.81659021 2.19089023]
[0 2 4]
`)}
<p>Les trois villes ont leur maximum le jeudi (indice 3). <code>argmax</code> renvoie une <b>position</b>, pas la valeur ; elle sert à retrouver un nom : <code>villes[np.argmax(moyennes)]</code> donne <code>Montpellier</code> dans l'exercice de synthèse. En cas d'égalité, c'est la <b>première</b> position qui est renvoyée.</p>
<h3>Percentiles et écart type</h3>
${code(R`
print(np.percentile(T, 75))           # 75 % des valeurs sont inférieures ou égales
print(np.percentile(T, 50, axis=1))   # médiane de chaque ville
print(np.median(T))

v = np.array([2, 4, 4, 4, 5, 5, 7, 9])
print(np.std(v), np.std(v, ddof=1))
`, R`
27.25
[21.5 25.  29.5]
25.0
2.0 2.138089935299395
`)}
${warn('écart type de NumPy et de Pandas', R`<p><code>np.std</code> divise par n (<code>ddof=0</code>, écart type de population) ; la méthode <code>.std()</code> de Pandas divise par n − 1 (<code>ddof=1</code>, écart type corrigé). Les deux valeurs diffèrent donc sur les mêmes données.</p>`)}
${method('ne plus se tromper d\'axe', R`<ol><li>Écrire la forme : <code>(3, 5)</code> = (villes, jours).</li><li>Se demander ce que l'on veut obtenir : une valeur par ville → il faut garder l'axe 0 et faire disparaître l'axe 1 → <code>axis=1</code>.</li><li>Vérifier la forme du résultat : <code>(3,)</code>.</li></ol>`)}
` },
      { id: 'broadcasting', t: 'Le broadcasting', sub: 'Opérer entre tableaux de formes différentes', html: R`
${def('broadcasting', R`<p>Le <b>broadcasting</b> est l'ensemble des règles qui permettent une opération entre tableaux de formes différentes : NumPy « étire » virtuellement le plus petit (sans le copier) pour qu'il ait la même forme que l'autre. Le cas le plus simple est un tableau et un nombre : <code>a + 5</code> ajoute 5 à chaque élément.</p>`)}
${prop('Règles', R`<ol><li>On aligne les formes <b>par la droite</b> (dernière dimension sous dernière dimension) ; s'il manque des dimensions à gauche, on les complète par des 1.</li>
<li>Deux dimensions sont compatibles si elles sont <b>égales</b> ou si l'une d'elles vaut <b>1</b> (elle est alors répliquée).</li>
<li>Sinon : <code>ValueError: operands could not be broadcast together</code>.</li></ol>
<table class="t"><thead><tr><th>Forme A</th><th>Forme B</th><th>Résultat</th></tr></thead><tbody>
<tr><td>(3, 5)</td><td>(5,) → (1, 5)</td><td>(3, 5) : le vecteur est répété sur chaque ligne</td></tr>
<tr><td>(3, 5)</td><td>(3, 1)</td><td>(3, 5) : la colonne est répétée sur chaque colonne</td></tr>
<tr><td>(3, 1)</td><td>(1, 4)</td><td>(3, 4) : les deux sont étirés</td></tr>
<tr><td>(3, 5)</td><td>(3,) → (1, 3)</td><td><b>erreur</b> : 5 ≠ 3</td></tr>
</tbody></table>`)}
${ex('une correction par jour', R`<p>Un capteur a un biais différent chaque jour ; on corrige toutes les villes avec le même vecteur de 5 valeurs. Forme <code>(3, 5)</code> + <code>(5,)</code> : le vecteur est appliqué à chacune des 3 lignes.</p>
${code(R`
corrections = np.array([-0.5, 0.0, 0.5, -1.0, 0.0])
print(T + corrections)
`, R`
[[18.  20.  22.  22.  22. ]
 [21.5 24.5 26.5 26.5 25. ]
 [24.5 27.  30.  30.  30. ]]
`)}`)}
${ex('une valeur par ville', R`<p>Pour ajouter une valeur différente à chaque <b>ville</b> (ligne), un vecteur de forme <code>(3,)</code> ne marche pas : il faut une <b>colonne</b> de forme <code>(3, 1)</code>.</p>
${code(R`
try:
    T + np.array([1.0, 2.0, 3.0])
except ValueError as e:
    print("ValueError:", e)

print(T + np.array([[1.0], [2.0], [3.0]]))     # forme (3, 1)
`, R`
ValueError: operands could not be broadcast together with shapes (3,5) (3,)
[[19.5 21.  22.5 24.  23. ]
 [24.  26.5 28.  29.5 27. ]
 [28.  30.  32.5 34.  33. ]]
`)}
<p>On obtient une colonne avec <code>v.reshape(-1, 1)</code>, <code>v[:, np.newaxis]</code> ou, après une statistique, avec <code>keepdims=True</code>.</p>`)}
${ex('centrer chaque ville sur sa propre moyenne', R`
${code(R`
moy = T.mean(axis=1, keepdims=True)    # forme (3, 1) au lieu de (3,)
print(T - moy)
`, R`
[[-2.5 -1.   0.5  2.   1. ]
 [-3.  -0.5  1.   2.5  0. ]
 [-3.5 -1.5  1.   2.5  1.5]]
`)}
<p>À l'inverse, <code>T - T.mean(axis=0)</code> (forme <code>(3, 5)</code> moins <code>(5,)</code>) fonctionne directement et centre chaque <b>jour</b>.</p>`)}
<p>La conversion °C → °F de tout le tableau, <code>T * 9 / 5 + 32</code>, est elle aussi du broadcasting : les constantes 9, 5 et 32 sont diffusées sur les 15 cases.</p>
` },
    ],
    keep: [
      'Un ndarray a un seul dtype ; un flottant rend tout float64, une chaîne rend tout texte.',
      'shape (3, 5) = 3 lignes × 5 colonnes ; size = 15 ; ndim = 2.',
      'arange : pas fixé, fin exclue ; linspace : nombre de points fixé, fin incluse.',
      'T[ligne, colonne] ; x[début:fin:pas] avec fin exclue ; T[:, j] = colonne j.',
      'Masques : &, |, ~ avec parenthèses ; np.where(cond, si_vrai, si_faux).',
      'axis = l\'axe qui disparaît : axis=0 → une valeur par colonne, axis=1 → une valeur par ligne.',
      'Broadcasting : formes alignées à droite, dimensions égales ou égales à 1.',
      'Une tranche est une vue : utiliser .copy() pour une copie indépendante.',
    ],
  },

  /* ===================================================================== */
  {
    id: 'd2', ch: 'pydata', short: 'Pandas', src: 'Notebooks Pandas (vélos, énergie)',
    t: 'Pandas : DataFrame, nettoyage, jointures et agrégations',
    sub: 'Series et DataFrame, sélection avec [] / loc / iloc et masques, lecture et exploration d\'un CSV, valeurs manquantes, union et jointures (cardinalités), groupby, pivot_table et pd.cut, avec le parallèle SQL.',
    goals: [
      'Construire un DataFrame, distinguer Series et DataFrame, index et colonnes.',
      'Sélectionner des colonnes et des lignes avec [], [[ ]], loc (labels) et iloc (positions), et filtrer avec des masques.',
      'Explorer et nettoyer un jeu de données : describe, isna, fillna, ffill, dropna, rename, drop, replace.',
      'Assembler des tables avec concat et merge et prévoir le nombre de lignes selon la cardinalité.',
      'Produire des indicateurs par groupe avec groupby, pivot_table et pd.cut, et relier ces opérations à SQL.',
    ],
    sections: [
      { id: 'objets', t: 'Series et DataFrame', sub: 'Des tableaux avec des noms', html: R`
<p>Avec NumPy, le poids des vélos est « la colonne 0 » : <code>catalogue_numpy[:, 0]</code>. C'est peu lisible. Pandas donne des <b>noms</b> aux lignes et aux colonnes et accepte des colonnes de types différents (texte, nombres, dates…).</p>
${def('DataFrame et Series', R`<ul><li>Un <b>DataFrame</b> est une table : des colonnes nommées (<code>df.columns</code>), des lignes repérées par un <b>index</b> (<code>df.index</code>). Chaque colonne a son propre dtype.</li>
<li>Une <b>Series</b> est une colonne seule : un tableau 1D de valeurs (<code>s.values</code>) muni d'un index et d'un nom (<code>s.name</code>).</li></ul>`)}
${code(R`
import pandas as pd

catalogue = [[14, 8, 0, 650], [23, 10, 70, 2200], [31, 8, 55, 3200]]
cat = pd.DataFrame(catalogue,
                   index=["ville", "electrique", "cargo"],
                   columns=["poids_kg", "vitesses", "autonomie_km", "prix_eur"])
print(cat)
print(cat.index)
print(cat["prix_eur"])
`, R`
            poids_kg  vitesses  autonomie_km  prix_eur
ville             14         8             0       650
electrique        23        10            70      2200
cargo             31         8            55      3200
Index(['ville', 'electrique', 'cargo'], dtype='object')
ville          650
electrique    2200
cargo         3200
Name: prix_eur, dtype: int64
`)}
<p>On construit aussi un DataFrame à partir d'un <b>dictionnaire</b> {nom de colonne : liste de valeurs} ; l'index est alors <code>0, 1, 2…</code> (<code>RangeIndex</code>).</p>
${code(R`
regions = pd.DataFrame({
    "region": ["Nord", "Ouest", "Centre", "Sud"],
    "population_millions": [6.1, 4.8, 3.5, 5.7],
    "production_renouvelable_gwh": [8200, 10400, 6900, 12100]
})
print(regions)
print(regions.shape)
`, R`
   region  population_millions  production_renouvelable_gwh
0    Nord                  6.1                         8200
1   Ouest                  4.8                        10400
2  Centre                  3.5                         6900
3     Sud                  5.7                        12100
(4, 3)
`)}
<h3>Ajouter une colonne</h3>
<p>On affecte une liste de même longueur, une constante ou le résultat d'un calcul <b>vectorisé</b> entre colonnes :</p>
${code(R`
cat["assistance"] = ["non", "oui", "oui"]
cat["prix_par_kg"] = (cat["prix_eur"] / cat["poids_kg"]).round(1)
print(cat)
print(cat["assistance"].unique())     # valeurs distinctes
print(cat["assistance"].nunique())    # leur nombre
print(cat["assistance"].value_counts())
`, R`
            poids_kg  vitesses  autonomie_km  prix_eur assistance  prix_par_kg
ville             14         8             0       650        non         46.4
electrique        23        10            70      2200        oui         95.7
cargo             31         8            55      3200        oui        103.2
['non' 'oui']
2
assistance
oui    2
non    1
Name: count, dtype: int64
`)}
<p><code>unique()</code> liste les valeurs sans répétition (dans l'ordre d'apparition) ; <code>value_counts()</code> compte chaque valeur, triée par effectif décroissant (<code>normalize=True</code> donne des proportions). Dans le TP vélos : <code>Ville 57, Electrique 44, Cargo 19</code>.</p>
${warn('versions de Pandas', R`<p>Les affichages de cette leçon viennent de Pandas 2.2. Depuis Pandas 2.0, la Series renvoyée par <code>value_counts()</code> s'appelle <code>count</code> (les anciens notebooks affichent <code>Name: type_velo</code>). Avec Pandas 3, les colonnes de texte ont le dtype <code>str</code> au lieu de <code>object</code>.</p>`)}
` },
      { id: 'selection', t: 'Sélectionner : [], [[ ]], loc, iloc et masques', sub: 'Projection et restriction', html: R`
<table class="t"><thead><tr><th>Écriture</th><th>Sélectionne</th><th>Renvoie</th></tr></thead><tbody>
<tr><td><code>df["col"]</code></td><td>une colonne</td><td>Series</td></tr>
<tr><td><code>df[["c1", "c2"]]</code></td><td>plusieurs colonnes (une <b>liste</b> de noms)</td><td>DataFrame</td></tr>
<tr><td><code>df[masque]</code></td><td>les lignes où le masque est <code>True</code></td><td>DataFrame</td></tr>
<tr><td><code>df.loc[label]</code></td><td>une ligne par son <b>label d'index</b></td><td>Series</td></tr>
<tr><td><code>df.loc[lignes, colonnes]</code></td><td>par labels, masques ou listes de labels</td><td>selon le cas</td></tr>
<tr><td><code>df.iloc[i, j]</code></td><td>par <b>positions entières</b> (comme NumPy)</td><td>selon le cas</td></tr>
</tbody></table>
${code(R`
print(cat.loc["cargo"])                        # ligne de label "cargo"
print(cat.iloc[2].equals(cat.loc["cargo"]))    # même ligne, par position
print(cat.loc["electrique", "prix_eur"], cat.iloc[1, 3])
print(cat.loc["ville":"electrique", ["poids_kg", "prix_eur"]])
`, R`
poids_kg           31
vitesses            8
autonomie_km       55
prix_eur         3200
assistance        oui
prix_par_kg     103.2
Name: cargo, dtype: object
True
2200 2200
            poids_kg  prix_eur
ville             14       650
electrique        23      2200
`)}
${warn('loc ≠ iloc', R`<p><code>loc</code> lit des <b>labels</b> et ses tranches <b>incluent</b> la borne de fin ; <code>iloc</code> lit des <b>positions</b> et exclut la fin, comme en Python. La différence se voit dès que l'index n'est pas 0, 1, 2… dans l'ordre :</p>
${code(R`
df = pd.DataFrame({"x": [10, 20, 30, 40]}, index=[3, 2, 1, 0])
print(df.loc[1])      # label 1  -> 30
print(df.iloc[1])     # position 1 -> 20
print(df.loc[3:1])    # labels 3, 2, 1 : fin incluse -> 3 lignes
print(df.iloc[0:2])   # positions 0, 1 : fin exclue -> 2 lignes
`, R`
x    30
Name: 1, dtype: int64
x    20
Name: 2, dtype: int64
    x
3  10
2  20
1  30
    x
3  10
2  20
`)}`)}
<h3>Filtrer avec un masque</h3>
<p>Une comparaison sur une colonne donne une Series de booléens ; placée dans <code>df[...]</code>, elle garde les lignes <code>True</code>. Comme en NumPy, on combine avec <code>&amp;</code> (et), <code>|</code> (ou), <code>~</code> (non), chaque condition entre parenthèses.</p>
${code(R`
masque = cat["prix_eur"] > 1000
print(masque)
print(cat[~masque][["poids_kg", "prix_eur"]])                    # prix <= 1000
print(cat[(cat["prix_eur"] > 1000) & (cat["vitesses"] == 8)].index.tolist())
print(cat[(cat["poids_kg"] < 20) | (cat["autonomie_km"] > 60)].index.tolist())
print(regions[regions["region"].isin(["Nord", "Sud"])])
`, R`
ville         False
electrique     True
cargo          True
Name: prix_eur, dtype: bool
       poids_kg  prix_eur
ville        14       650
['cargo']
['ville', 'electrique']
  region  population_millions  production_renouvelable_gwh
0   Nord                  6.1                         8200
3    Sud                  5.7                        12100
`)}
<p>Avec <code>loc</code>, on filtre les lignes <b>et</b> on choisit les colonnes en une fois : <code>df.loc[(df["Consommation_GWh"] &gt;= 115) &amp; (df["Annee"] &gt; 2022), ["Mois", "Annee"]]</code> (TP énergie : 14 mois, de janvier 2023 à décembre 2025). Écrire <code>cond1 and cond2</code> provoque <code>ValueError: The truth value of a Series is ambiguous</code>.</p>
${prop('Vocabulaire relationnel', R`<p><b>Projection</b> = choisir des colonnes (<code>df[["c1", "c2"]]</code>, SQL <code>SELECT c1, c2</code>). <b>Restriction</b> (ou sélection) = choisir des lignes selon une condition (<code>df[masque]</code>, SQL <code>WHERE</code>).</p>`)}
` },
      { id: 'explorer', t: 'Lire et explorer un fichier', sub: 'read_csv, head, shape, dtypes, info, describe', html: R`
<p><code>pd.read_csv("fichier.csv")</code> lit un fichier texte tabulaire. Le séparateur par défaut est la virgule ; pour un CSV « à la française » séparé par des points-virgules, il faut <code>sep=";"</code>, sinon toute la ligne tombe dans <b>une seule colonne</b>. Le fichier doit être dans le répertoire courant (<code>os.getcwd()</code>) ou désigné par son chemin.</p>
${ex('un petit fichier de locations', R`
${code(R`
loc = pd.read_csv("locations.csv", sep=";")
print(loc)
`, R`
    station   type_velo  duree_min  prix_eur  satisfaction
0      Gare       Ville       46.0       8.4           5.0
1   Comedie       Cargo        NaN      18.7           4.0
2      Gare  Electrique       38.0      14.3           NaN
3  Antigone       Ville       72.0      10.8           2.0
4   Comedie       Ville       25.0       7.7           3.0
5      Gare       Cargo       61.0      21.5           NaN
`)}
<p>Les cases vides deviennent <code>NaN</code> (valeur manquante). Une colonne d'entiers qui contient un <code>NaN</code> passe en <code>float64</code> (<code>46.0</code>). Lu sans <code>sep=";"</code>, ce fichier donnerait une forme <code>(6, 1)</code>.</p>`)}
<table class="t"><thead><tr><th>Instruction</th><th>Rôle</th><th>Sur l'exemple</th></tr></thead><tbody>
<tr><td><code>df.head(n)</code> / <code>df.tail(n)</code></td><td>n premières / dernières lignes (5 par défaut)</td><td></td></tr>
<tr><td><code>df.shape</code></td><td>(nb de lignes, nb de colonnes) — attribut, sans parenthèses</td><td><code>(6, 5)</code></td></tr>
<tr><td><code>df.columns</code></td><td>noms des colonnes (un <code>Index</code> ; <code>.tolist()</code> pour une liste)</td><td></td></tr>
<tr><td><code>df.dtypes</code></td><td>type de chaque colonne</td><td><code>object</code> pour le texte</td></tr>
<tr><td><code>df.info()</code></td><td>index, nombre de valeurs <b>non nulles</b> et type de chaque colonne, mémoire</td><td></td></tr>
<tr><td><code>df.describe()</code></td><td>count, mean, std, min, quartiles, max des colonnes numériques</td><td></td></tr>
<tr><td><code>df.describe(include="all")</code></td><td>ajoute les colonnes non numériques : count, unique, top (valeur la plus fréquente), freq</td><td></td></tr>
</tbody></table>
${code(R`
loc.info()
`, R`
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 6 entries, 0 to 5
Data columns (total 5 columns):
 #   Column        Non-Null Count  Dtype
---  ------        --------------  -----
 0   station       6 non-null      object
 1   type_velo     6 non-null      object
 2   duree_min     5 non-null      float64
 3   prix_eur      6 non-null      float64
 4   satisfaction  4 non-null      float64
dtypes: float64(3), object(2)
memory usage: 372.0+ bytes
`)}
${code(R`
print(loc.describe(include="all"))
`, R`
       station type_velo  duree_min   prix_eur  satisfaction
count        6         6   5.000000   6.000000      4.000000
unique       3         3        NaN        NaN           NaN
top       Gare     Ville        NaN        NaN           NaN
freq         3         3        NaN        NaN           NaN
mean       NaN       NaN  48.400000  13.566667      3.500000
std        NaN       NaN  18.555323   5.631933      1.290994
min        NaN       NaN  25.000000   7.700000      2.000000
25%        NaN       NaN  38.000000   9.000000      2.750000
50%        NaN       NaN  46.000000  12.550000      3.500000
75%        NaN       NaN  61.000000  17.600000      4.250000
max        NaN       NaN  72.000000  21.500000      5.000000
`)}
${prop('Lire describe', R`<p><code>count</code> ne compte que les valeurs <b>non manquantes</b> : dans le TP vélos (120 locations), <code>duree_min</code> a un count de 113 et <code>satisfaction</code> de 111, ce qui révèle 7 et 9 valeurs manquantes. <code>50%</code> est la médiane ; <code>std</code> est l'écart type corrigé (division par n − 1). Les statistiques sans objet sont notées <code>NaN</code>.</p>`)}
` },
      { id: 'nettoyer', t: 'Nettoyer : manquants, renommage, suppression', sub: 'isna, fillna, ffill, dropna, rename, drop, replace, drop_duplicates', html: R`
<h3>Repérer les valeurs manquantes</h3>
${code(R`
print(loc.isna().sum())          # nombre de NaN par colonne
print(loc.isna().sum().sum())    # nombre total de NaN
`, R`
station         0
type_velo       0
duree_min       1
prix_eur        0
satisfaction    2
dtype: int64
3
`)}
<p><code>isna()</code> renvoie un DataFrame de booléens (<code>True</code> là où la valeur manque) ; <code>sum()</code> compte les <code>True</code> <b>colonne par colonne</b>.</p>
<h3>Remplacer ou supprimer</h3>
<table class="t"><thead><tr><th>Méthode</th><th>Effet</th></tr></thead><tbody>
<tr><td><code>df.fillna(value={"satisfaction": 0})</code></td><td>remplace les NaN de la colonne indiquée par 0 (un nombre seul remplit toutes les colonnes)</td></tr>
<tr><td><code>s.fillna(s.mean())</code></td><td>imputation par la moyenne de la colonne</td></tr>
<tr><td><code>df.ffill()</code></td><td><i>forward fill</i> : chaque NaN prend la dernière valeur non manquante <b>au-dessus</b></td></tr>
<tr><td><code>df.dropna()</code></td><td>supprime les <b>lignes</b> contenant au moins un NaN</td></tr>
<tr><td><code>df.dropna(axis="columns")</code></td><td>supprime les <b>colonnes</b> contenant au moins un NaN (<code>axis=1</code> équivalent)</td></tr>
<tr><td><code>df.dropna(subset=["duree_min"])</code></td><td>ne regarde que les colonnes citées</td></tr>
</tbody></table>
${code(R`
print(loc.ffill())
print(loc.dropna().shape, loc.dropna(subset=["duree_min"]).shape)
print(loc.dropna(axis="columns").columns.tolist())
`, R`
    station   type_velo  duree_min  prix_eur  satisfaction
0      Gare       Ville       46.0       8.4           5.0
1   Comedie       Cargo       46.0      18.7           4.0
2      Gare  Electrique       38.0      14.3           4.0
3  Antigone       Ville       72.0      10.8           2.0
4   Comedie       Ville       25.0       7.7           3.0
5      Gare       Cargo       61.0      21.5           3.0
(3, 5) (5, 5)
['station', 'type_velo', 'prix_eur']
`)}
<p>Dans le TP vélos, <code>dropna()</code> fait passer de <code>(120, 8)</code> à <code>(104, 8)</code> : 16 lignes perdues pour 7 + 9 NaN. Les calculs (<code>mean</code>, <code>sum</code>…) <b>ignorent</b> les NaN par défaut : la moyenne de <code>satisfaction</code> ci-dessus vaut 3.5 = (5 + 4 + 2 + 3) / 4.</p>
<h3>Renommer, supprimer, remplacer, dédoublonner</h3>
${code(R`
print(loc.rename(columns={"prix_eur": "cout_eur"}).columns.tolist())
print(loc.drop(columns=["satisfaction"]).columns.tolist())
print(loc.drop(index=[0, 1]).index.tolist())
print(loc.replace("Comedie", "Comédie")["station"].tolist())
print(loc.columns.tolist())      # loc n'a pas changé !
`, R`
['station', 'type_velo', 'duree_min', 'cout_eur', 'satisfaction']
['station', 'type_velo', 'duree_min', 'prix_eur']
[2, 3, 4, 5]
['Gare', 'Comédie', 'Gare', 'Antigone', 'Comédie', 'Gare']
['station', 'type_velo', 'duree_min', 'prix_eur', 'satisfaction']
`)}
<p><code>drop_duplicates()</code> retire les lignes identiques à une ligne précédente (l'index n'est pas comparé) : dans le TP, la ligne <code>ville_bis</code>, copie de <code>ville</code>, disparaît. <code>duplicated()</code> donne le masque correspondant.</p>
${warn('inplace ou réaffectation', R`<p>Presque toutes ces méthodes (<code>fillna</code>, <code>dropna</code>, <code>rename</code>, <code>drop</code>, <code>replace</code>, <code>drop_duplicates</code>…) <b>renvoient un nouveau DataFrame</b> et laissent l'original intact. Pour garder le résultat :</p>
<ul><li>réaffecter : <code>df = df.dropna()</code> (recommandé, plus lisible) ;</li>
<li>ou modifier en place : <code>df.replace("Fevrier", "Février", inplace=True)</code> (TP énergie). Avec <code>inplace=True</code>, la méthode renvoie <code>None</code> : écrire <code>df = df.dropna(inplace=True)</code> remplace <code>df</code> par <code>None</code> !</li></ul>
<p>Pour ajouter des colonnes sans toucher aux données d'origine, partir d'une copie : <code>data2 = data.copy()</code>.</p>`)}
` },
      { id: 'assembler', t: 'Union et jointures', sub: 'concat, merge et cardinalités', html: R`
<h3>Union : <code>pd.concat</code></h3>
<p><code>pd.concat([df1, df2])</code> empile les lignes de deux tables (verticalement par défaut). Les index d'origine sont <b>conservés</b>, d'où des doublons d'index ; <code>ignore_index=True</code> renumérote de 0 à n − 1.</p>
${code(R`
regions2 = pd.DataFrame({"region": ["Est", "Sud-Ouest", "Littoral"],
                         "population_millions": [5.2, 4.1, 2.9],
                         "production_renouvelable_gwh": [9100, 8800, 7600]})
print(pd.concat([regions, regions2]).index.tolist())
print(pd.concat([regions, regions2], ignore_index=True))
`, R`
[0, 1, 2, 3, 0, 1, 2]
      region  population_millions  production_renouvelable_gwh
0       Nord                  6.1                         8200
1      Ouest                  4.8                        10400
2     Centre                  3.5                         6900
3        Sud                  5.7                        12100
4        Est                  5.2                         9100
5  Sud-Ouest                  4.1                         8800
6   Littoral                  2.9                         7600
`)}
<p>Sans <code>ignore_index</code>, <code>.loc[0]</code> renverrait deux lignes (Nord et Est).</p>
<h3>Jointure : <code>pd.merge</code></h3>
<p><code>pd.merge(gauche, droite)</code> associe les lignes qui ont la même valeur dans la ou les colonnes communes (la <b>clé</b>). Sans <code>on=</code>, Pandas prend automatiquement les colonnes de même nom ; on peut préciser <code>on="participant"</code>, ou <code>left_on=</code> / <code>right_on=</code> si les noms diffèrent.</p>
${ex('un-à-un', R`<p>Chaque participant apparaît une seule fois de chaque côté : le résultat a autant de lignes que de participants, et l'ordre des lignes de droite n'a pas d'importance.</p>
${code(R`
participants = pd.DataFrame({"participant": ["Amira", "Bastien", "Chloé", "Diego"],
                             "service": ["Finance", "Data", "Data", "RH"]})
inscriptions = pd.DataFrame({"participant": ["Chloé", "Amira", "Diego", "Bastien"],
                             "annee_inscription": [2025, 2024, 2026, 2025]})
pi = pd.merge(participants, inscriptions)      # clé détectée : participant
print(pi)
`, R`
  participant  service  annee_inscription
0       Amira  Finance               2024
1     Bastien     Data               2025
2       Chloé     Data               2025
3       Diego       RH               2026
`)}`)}
${ex('plusieurs-à-un', R`<p>Plusieurs participants partagent un service, chaque service a un seul responsable : l'information du côté « un » est <b>répétée</b> (Yanis apparaît deux fois). Le nombre de lignes ne change pas.</p>
${code(R`
responsables = pd.DataFrame({"service": ["Finance", "Data", "RH"],
                             "responsable": ["Nora", "Yanis", "Sofia"]})
print(pd.merge(pi, responsables))
`, R`
  participant  service  annee_inscription responsable
0       Amira  Finance               2024        Nora
1     Bastien     Data               2025       Yanis
2       Chloé     Data               2025       Yanis
3       Diego       RH               2026       Sofia
`)}`)}
${ex('plusieurs-à-plusieurs', R`<p>La clé <code>service</code> est répétée des deux côtés : chaque ligne de gauche est combinée avec <b>chaque</b> ligne de droite de même clé. Data : 2 participants × 2 modules = 4 lignes ; au total 2 + 4 + 2 = 8 lignes, une par combinaison participant–module.</p>
${code(R`
modules = pd.DataFrame({"service": ["Finance", "Finance", "Data", "Data", "RH", "RH"],
                        "module": ["Excel avancé", "Budget", "Python", "SQL",
                                   "Recrutement", "Droit social"]})
plan = pd.merge(pi, modules)
print(plan)
print(plan.shape)
`, R`
  participant  service  annee_inscription        module
0       Amira  Finance               2024  Excel avancé
1       Amira  Finance               2024        Budget
2     Bastien     Data               2025        Python
3     Bastien     Data               2025           SQL
4       Chloé     Data               2025        Python
5       Chloé     Data               2025           SQL
6       Diego       RH               2026   Recrutement
7       Diego       RH               2026  Droit social
(8, 4)
`)}`)}
${prop('Le paramètre how', R`<p>Par défaut <code>how="inner"</code> : on ne garde que les clés présentes <b>des deux côtés</b>. <code>how="left"</code> garde toutes les lignes de gauche (NaN si pas de correspondance), <code>"right"</code> celles de droite, <code>"outer"</code> toutes.</p>
${code(R`
resp2 = pd.DataFrame({"service": ["Finance", "Data", "Marketing"],
                      "responsable": ["Nora", "Yanis", "Léo"]})
print(pd.merge(participants, resp2))              # inner : Diego (RH) disparaît
print(pd.merge(participants, resp2, how="left"))  # Diego gardé, responsable NaN
`, R`
  participant  service responsable
0       Amira  Finance        Nora
1     Bastien     Data       Yanis
2       Chloé     Data       Yanis
  participant  service responsable
0       Amira  Finance        Nora
1     Bastien     Data       Yanis
2       Chloé     Data       Yanis
3       Diego       RH         NaN
`)}`)}
<h3>Le parallèle avec SQL</h3>
<table class="t"><thead><tr><th>Opération relationnelle</th><th>Pandas</th><th>SQL</th></tr></thead><tbody>
<tr><td>Projection (colonnes)</td><td><code>df[["c1", "c2"]]</code></td><td><code>SELECT c1, c2 FROM t</code></td></tr>
<tr><td>Restriction (lignes)</td><td><code>df[df["c"] &gt; 9000]</code></td><td><code>WHERE c &gt; 9000</code></td></tr>
<tr><td>Union</td><td><code>pd.concat([t1, t2], ignore_index=True)</code></td><td><code>UNION ALL</code> (<code>UNION</code> = + <code>drop_duplicates()</code>)</td></tr>
<tr><td>Jointure</td><td><code>pd.merge(t1, t2, on="k", how="inner")</code></td><td><code>t1 JOIN t2 ON t1.k = t2.k</code></td></tr>
<tr><td>Agrégation</td><td><code>df.groupby("g")["c"].mean()</code></td><td><code>SELECT g, AVG(c) … GROUP BY g</code></td></tr>
<tr><td>Tri</td><td><code>df.sort_values("c", ascending=False)</code></td><td><code>ORDER BY c DESC</code></td></tr>
</tbody></table>
` },
      { id: 'agreger', t: 'Agréger : groupby, pivot_table, pd.cut', sub: 'Des indicateurs par groupe', html: R`
${def('groupby', R`<p><code>df.groupby("col")</code> partitionne les lignes selon les valeurs de <code>col</code> (comme <code>GROUP BY</code>), puis une fonction d'agrégation (<code>mean</code>, <code>sum</code>, <code>size</code>, <code>count</code>, <code>min</code>, <code>max</code>…) produit une ligne par groupe. Les clés de groupe deviennent l'<b>index</b> du résultat, triées par ordre alphabétique.</p>`)}
${code(R`
resultats = pd.DataFrame({"groupe": ["A", "B", "C", "A", "B", "C"],
                          "score": [14, 11, 16, 18, 13, 15],
                          "duree_min": [45, 52, 48, 39, 50, 46]})
gb = resultats.groupby("groupe")
print(gb.sum())
print(gb["score"].mean())           # une seule colonne -> une Series
print(gb.size())                    # nombre de lignes par groupe
`, R`
        score  duree_min
groupe
A          32         84
B          24        102
C          31         94
groupe
A    16.0
B    12.0
C    15.5
Name: score, dtype: float64
groupe
A    2
B    2
C    2
dtype: int64
`)}
${code(R`
print(loc.groupby("station")["prix_eur"].mean())
print(loc.groupby("station")["prix_eur"].mean().idxmax())
print(loc.groupby("station").get_group("Gare"))
print(loc.groupby("station")["prix_eur"].agg(["mean", "min", "max", "count"]))
`, R`
station
Antigone    10.800000
Comedie     13.200000
Gare        14.733333
Name: prix_eur, dtype: float64
Gare
  station   type_velo  duree_min  prix_eur  satisfaction
0    Gare       Ville       46.0       8.4           5.0
2    Gare  Electrique       38.0      14.3           NaN
5    Gare       Cargo       61.0      21.5           NaN
               mean   min   max  count
station
Antigone  10.800000  10.8  10.8      1
Comedie   13.200000   7.7  18.7      2
Gare      14.733333   8.4  21.5      3
`)}
<ul><li><code>idxmax()</code> / <code>idxmin()</code> renvoient le <b>label</b> de l'index du maximum / minimum (l'équivalent Pandas de <code>argmax</code>). TP vélos : la station la plus chère en moyenne est <code>Gare</code> ; TP énergie : l'année où la part renouvelable moyenne est la plus haute est <code>2024</code>.</li>
<li><code>get_group("Gare")</code> renvoie les lignes d'un groupe (TP énergie : les 7 mois de janvier).</li>
<li><code>size()</code> compte les lignes ; <code>count()</code> compte les valeurs <b>non manquantes</b> d'une colonne.</li>
<li><code>df.groupby("Annee")[["c1", "c2"]].mean()</code> agrège plusieurs colonnes ; <code>groupby(["g1", "g2"])</code> groupe sur plusieurs clés.</li></ul>
<h3>Trier</h3>
<p><code>df.sort_values(by="prix_eur", ascending=False)</code> trie les lignes (l'index d'origine suit les lignes) ; <code>sort_index()</code> trie selon l'index. Pour la ligne du maximum : <code>df[df["c"] == df["c"].max()]</code> ou <code>df.loc[df["c"].idxmax()]</code>.</p>
<h3>Tableau croisé : <code>pivot_table</code></h3>
<p><code>df.pivot_table(values=…, index=…, columns=…, aggfunc=…)</code> : une ligne par valeur de <code>index</code>, une colonne par valeur de <code>columns</code>, et dans chaque case l'agrégation (<code>"mean"</code> par défaut) de <code>values</code>. Une combinaison absente donne <code>NaN</code>, sauf si l'on fixe <code>fill_value</code>.</p>
${code(R`
print(loc.pivot_table(values="prix_eur", index="station",
                      columns="type_velo", aggfunc="mean"))
print(loc.pivot_table(index="station", columns="type_velo",
                      aggfunc="size", fill_value=0))      # effectifs
`, R`
type_velo  Cargo  Electrique  Ville
station
Antigone     NaN         NaN   10.8
Comedie     18.7         NaN    7.7
Gare        21.5        14.3    8.4
type_velo  Cargo  Electrique  Ville
station
Antigone       0           0      1
Comedie        1           0      1
Gare           1           1      1
`)}
<p>Dans le TP vélos, <code>data.pivot_table(index="type_velo", columns="meteo", aggfunc="size", fill_value=0)</code> donne par exemple 22 vélos électriques loués au soleil et 1 seul cargo sous la pluie. <code>aggfunc="size"</code> compte les lignes et n'a pas besoin de <code>values</code>.</p>
<h3>Discrétiser avec <code>pd.cut</code>, ajouter avec <code>assign</code></h3>
<p><code>pd.cut(série, bins=[…], labels=[…])</code> range chaque valeur numérique dans un intervalle. Les intervalles sont <b>fermés à droite</b> : <code>(0, 30]</code>, <code>(30, 60]</code>, <code>(60, inf]</code>. Une valeur hors des bornes (ou manquante) donne <code>NaN</code>. <code>df.assign(nom=…)</code> renvoie une <b>copie</b> avec la ou les colonnes ajoutées.</p>
${code(R`
import numpy as np
cat_duree = pd.cut(loc["duree_min"], bins=[0, 30, 60, np.inf],
                   labels=["courte", "moyenne", "longue"])
print(loc.assign(categorie=cat_duree,
                 prix_par_min=(loc["prix_eur"] / loc["duree_min"]).round(2))
         [["duree_min", "prix_eur", "categorie", "prix_par_min"]])
`, R`
   duree_min  prix_eur categorie  prix_par_min
0       46.0       8.4   moyenne          0.18
1        NaN      18.7       NaN           NaN
2       38.0      14.3   moyenne          0.38
3       72.0      10.8    longue          0.15
4       25.0       7.7    courte          0.31
5       61.0      21.5    longue          0.35
`)}
<p>La série catégorielle peut servir directement d'index de tableau croisé : <code>data.pivot_table(values="prix_eur", index=duree_cat, columns="type_velo", aggfunc="mean", observed=False)</code>. Pour seulement deux catégories, <code>np.where</code> suffit : <code>df2["categorie_temperature"] = np.where(df2["Temperature_C"] &lt; 12, "froid", "doux/chaud")</code> puis un <code>groupby</code> (TP énergie : 120.1 GWh en moyenne quand il fait froid contre 87.1 sinon).</p>
${method('répondre à « calculer X moyen selon Y »', R`<ol><li>Une seule variable de regroupement → <code>df.groupby("Y")["X"].mean()</code>.</li><li>Deux variables croisées → <code>df.pivot_table(values="X", index="Y1", columns="Y2", aggfunc="mean")</code>.</li><li>Compter au lieu de moyenner → <code>value_counts()</code> (une variable) ou <code>aggfunc="size"</code> (deux).</li><li>« Lequel est le plus grand ? » → enchaîner <code>.idxmax()</code>.</li></ol>`)}
` },
    ],
    keep: [
      'df["c"] → Series ; df[["c1", "c2"]] → DataFrame (projection).',
      'loc = labels, fin de tranche incluse ; iloc = positions, fin exclue.',
      'Masques : (cond1) & (cond2), |, ~ ; jamais and / or.',
      'read_csv(..., sep=";") pour un CSV à points-virgules ; isna().sum() compte les NaN par colonne.',
      'fillna, ffill, dropna, rename, drop, replace renvoient une copie : réaffecter (inplace=True renvoie None).',
      'concat empile et garde les index (ignore_index=True) ; merge joint sur les colonnes communes, how="inner" par défaut.',
      'Plusieurs-à-plusieurs : chaque ligne × chaque correspondance (2 × 2 = 4 lignes).',
      'groupby("g")["c"].mean() ; pivot_table(values, index, columns, aggfunc, fill_value) ; idxmax donne le label.',
    ],
  },

  /* ===================================================================== */
  {
    id: 'd3', ch: 'pydata', short: 'Matplotlib & Seaborn', src: 'Notebooks Matplotlib et Seaborn (mobilité)',
    t: 'Visualiser : Matplotlib et Seaborn',
    sub: 'Figure et axes, courbes et leurs options, barres d\'erreur et zones d\'incertitude, grilles de sous-graphiques, barres, camemberts et boîtes à moustaches ; puis Seaborn : thèmes, format long, distributions, relations, facettes, graphiques catégoriels, et le choix du graphique.',
    goals: [
      'Tracer et habiller une courbe Matplotlib (couleur, style, marqueurs, titre, axes, légende).',
      'Représenter une incertitude avec errorbar ou fill_between et organiser plusieurs graphiques avec subplots / add_subplot.',
      'Choisir entre bar, barh, pie et boxplot selon la question posée.',
      'Utiliser Seaborn sur un DataFrame au format long avec hue, row et col (histplot, kdeplot, pairplot, jointplot, FacetGrid, catplot, violinplot).',
      'Associer un type de données à un graphique adapté.',
    ],
    sections: [
      { id: 'mpl-base', t: 'Figure, axes et courbes', sub: 'plot et ses options', html: R`
${def('figure et axes', R`<p>Une <b>figure</b> (<code>fig</code>) est la fenêtre ou l'image entière ; un <b>axes</b> (<code>ax</code>) est une zone de tracé avec son repère (axes x et y, titre, légende). Une figure peut contenir plusieurs axes.</p>`)}
<p>Matplotlib offre deux écritures équivalentes :</p>
<ul><li>l'interface <b>pyplot</b> (<code>plt.plot</code>, <code>plt.title</code>…) qui agit sur l'axes « courant » ;</li>
<li>l'interface <b>objet</b> : <code>fig, ax = plt.subplots()</code> puis <code>ax.plot</code>, <code>ax.set_title</code>… plus explicite quand il y a plusieurs graphiques.</li></ul>
${code(R`
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 8, 500)                 # 500 abscisses : courbe lisse

fig = plt.figure()
ax = plt.axes()
plt.plot(x, np.exp(-0.5 * x),
         color="navy", linestyle="-", linewidth=2, label="exp(-0.5x)")
plt.plot(x, np.log1p(x),
         linestyle="--", marker="o", markevery=40, label="log(1+x)")
plt.title("Deux fonctions")
plt.xlabel("x")
plt.ylabel("Valeur")
plt.legend(loc="upper right")
plt.show()
`)}
<p><b>Ce que ça dessine :</b> une courbe pleine bleu marine qui décroît de 1 vers 0 et une courbe en tirets, croissante, avec un marqueur rond tous les 40 points ; la légende, en haut à droite, reprend les <code>label</code>.</p>
<table class="t"><thead><tr><th>Option de <code>plot</code></th><th>Valeurs courantes</th></tr></thead><tbody>
<tr><td><code>color</code></td><td><code>"navy"</code>, <code>"red"</code>, <code>"#1f77b4"</code>…</td></tr>
<tr><td><code>linestyle</code></td><td><code>"-"</code> plein, <code>"--"</code> tirets, <code>":"</code> pointillés, <code>"-."</code> mixte</td></tr>
<tr><td><code>marker</code></td><td><code>"o"</code> rond, <code>"s"</code> carré, <code>"^"</code> triangle, <code>"x"</code>, <code>"+"</code></td></tr>
<tr><td><code>linewidth</code>, <code>alpha</code></td><td>épaisseur ; transparence entre 0 et 1</td></tr>
<tr><td><code>label</code></td><td>texte affiché par <code>legend()</code> (sans <code>legend()</code>, rien ne s'affiche)</td></tr>
</tbody></table>
<table class="t"><thead><tr><th>pyplot</th><th>méthode de l'axes</th></tr></thead><tbody>
<tr><td><code>plt.title("…")</code></td><td><code>ax.set_title("…")</code></td></tr>
<tr><td><code>plt.xlabel</code> / <code>plt.ylabel</code></td><td><code>ax.set_xlabel</code> / <code>ax.set_ylabel</code></td></tr>
<tr><td><code>plt.xlim</code>, <code>plt.xticks</code></td><td><code>ax.set_xlim</code>, <code>ax.set_xticks</code></td></tr>
<tr><td>tout d'un coup</td><td><code>ax.set(xlabel="Heure", ylabel="Visiteurs", title="…")</code></td></tr>
</tbody></table>
<p>Réglages globaux : <code>plt.style.use("seaborn-v0_8-whitegrid")</code> (style de fond), <code>plt.rcParams.update({"font.size": 13})</code>. <code>plt.show()</code> affiche la figure ; <code>plt.savefig("fig.png")</code> l'enregistre. Pandas sait tracer directement : <code>data["duree_min"].hist()</code> dessine l'histogramme d'une colonne.</p>
` },
      { id: 'mpl-incertitude', t: 'Incertitudes : errorbar et fill_between', sub: 'Mesures discrètes et zones', html: R`
<h3>Mesures discrètes : <code>plt.errorbar</code></h3>
${code(R`
rng = np.random.default_rng(42)
heures = np.arange(8, 19)
theorique = 20 + 2 * np.sin((heures - 8) / 10 * np.pi)
mesuree = theorique + rng.normal(0, 0.4, size=len(heures))

plt.errorbar(heures, mesuree, yerr=0.4, fmt="s",
             ecolor="gray", elinewidth=2, capsize=4)
plt.xlabel("Heure")
plt.ylabel("Température (°C)")
plt.show()
`)}
<p><b>Ce que ça dessine :</b> 11 carrés (un par heure de 8 h à 18 h) autour d'une bosse de température, chacun traversé par un segment vertical gris de ±0,4 °C terminé par de petits traits horizontaux.</p>
<table class="t"><thead><tr><th>Argument</th><th>Rôle</th></tr></thead><tbody>
<tr><td><code>x</code>, <code>y</code></td><td>abscisses et valeurs mesurées</td></tr>
<tr><td><code>yerr</code></td><td>demi-longueur des barres verticales : un nombre (même incertitude partout) ou un tableau (une par point, ex. <code>yerr=incertitudes</code>) ; <code>xerr</code> pour l'horizontale</td></tr>
<tr><td><code>fmt</code></td><td>format des points / de la ligne : <code>"o"</code> points seuls, <code>"^"</code> triangles, <code>"o-"</code> points reliés</td></tr>
<tr><td><code>ecolor</code>, <code>elinewidth</code></td><td>couleur et épaisseur des barres d'erreur</td></tr>
<tr><td><code>capsize</code></td><td>longueur des petits traits aux extrémités (0 par défaut : pas de « chapeau »)</td></tr>
</tbody></table>
<h3>Données continues : <code>fill_between</code></h3>
${code(R`
temps = np.linspace(0, 24, 200)
visiteurs = 30 + 60 * np.exp(-((temps - 15) / 5) ** 2)
marge = 8 + 3 * np.sin(temps / 24 * 2 * np.pi) ** 2

fig, ax = plt.subplots(figsize=(10, 5))
ax.plot(temps, visiteurs, label="fréquentation moyenne")
ax.fill_between(temps, visiteurs - marge, visiteurs + marge,
                alpha=0.25, label="zone d'incertitude")
ax.set(xlabel="Heure", ylabel="Nombre de visiteurs", title="Fréquentation estimée")
ax.legend()
plt.show()
`)}
<p><b>Ce que ça dessine :</b> une courbe en cloche culminant vers 15 h (environ 90 visiteurs), entourée d'une bande colorée semi-transparente comprise entre <code>visiteurs - marge</code> et <code>visiteurs + marge</code>. <code>fill_between(x, y1, y2)</code> colorie la surface entre deux courbes ; <code>alpha</code> la rend transparente pour laisser voir la courbe.</p>
${prop('Lequel choisir ?', R`<p>Quelques mesures ponctuelles avec une incertitude chacune → <code>errorbar</code>. Une courbe continue (des centaines de points) avec une marge → <code>fill_between</code>, sinon on obtiendrait une forêt de barres.</p>`)}
` },
      { id: 'mpl-grilles', t: 'Plusieurs graphiques dans une figure', sub: 'add_subplot, subplots, tight_layout', html: R`
${def('add_subplot(n_lignes, n_colonnes, position)', R`<p>Découpe la figure en une grille <code>n_lignes × n_colonnes</code> et crée l'axes situé à <code>position</code>. Les positions sont numérotées <b>à partir de 1</b>, ligne par ligne, de gauche à droite : dans une grille 2 × 2, 1 = haut gauche, 2 = haut droite, 3 = bas gauche, 4 = bas droite.</p>`)}
${code(R`
fig = plt.figure(figsize=(12, 8))
fonctions = [("sin(x)", np.sin(x)), ("cos(x)", np.cos(x)),
             ("sqrt(x)", np.sqrt(x)), ("log(1+x)", np.log1p(x))]

for i, (titre, valeurs) in enumerate(fonctions):
    ax = fig.add_subplot(2, 2, i + 1)     # i + 1 car les positions commencent à 1
    ax.plot(x, valeurs)
    ax.set_title(titre)

plt.tight_layout()
plt.show()
`)}
<p><b>Ce que ça dessine :</b> quatre petits graphiques en carré, chacun avec son titre. <code>plt.tight_layout()</code> ajuste les marges pour que titres et graduations ne se chevauchent pas. Pour 1 ligne et 3 colonnes : <code>fig.add_subplot(1, 3, i + 1)</code>.</p>
<h3>Avec <code>plt.subplots</code></h3>
<p><code>fig, axes = plt.subplots(2, 3, figsize=(12, 6))</code> crée d'un coup la figure et un tableau NumPy d'axes de forme <code>(2, 3)</code> : on dessine avec <code>axes[0, 1].plot(…)</code>. Avec une seule ligne (<code>plt.subplots(1, 2)</code>), <code>axes</code> est un vecteur : <code>axes[0]</code>, <code>axes[1]</code>. Sans argument, <code>plt.subplots()</code> renvoie un seul axes.</p>
${ex('barres et camembert côte à côte (TP médiathèque)', R`
${code(R`
jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
entrees = np.array([120, 135, 210, 150, 175, 260])

fig = plt.figure(figsize=(13, 5))
ax1 = fig.add_subplot(1, 2, 1)
ax1.bar(jours, entrees)
ax1.set_title("Entrées par jour")
ax1.tick_params(axis="x", rotation=45)     # étiquettes inclinées

ax2 = fig.add_subplot(1, 2, 2)
ax2.pie(entrees, labels=jours, autopct="%1.1f%%")
ax2.set_title("Répartition hebdomadaire")

plt.tight_layout()
plt.show()
`)}
<p>À gauche, six barres dont la plus haute est le samedi (260 : <code>jours[np.argmax(entrees)]</code>) ; à droite, un disque en six secteurs avec leur pourcentage.</p>`)}
` },
      { id: 'mpl-categories', t: 'Barres, camembert, boîte à moustaches', sub: 'bar, barh, pie, boxplot', html: R`
<h3>Diagramme en barres : comparer des catégories</h3>
${code(R`
modes = ["Marche", "Vélo", "Bus", "Tram", "Voiture"]
trajets = [42, 31, 27, 35, 18]
positions = np.arange(len(modes))

plt.bar(positions, trajets)          # hauteurs aux positions 0..4
plt.xticks(positions, modes)         # remplace 0..4 par les noms
plt.ylabel("Nombre moyen de trajets")
plt.show()

plt.barh(modes, trajets)             # barres horizontales
plt.show()
`)}
<p><code>plt.bar(x, hauteurs)</code> trace des barres verticales ; <code>plt.xticks(positions, étiquettes)</code> place les noms sous les barres (on peut aussi passer directement la liste de noms en <code>x</code>). <code>plt.barh(y, largeurs)</code> trace des barres horizontales, pratiques quand les étiquettes sont longues ou nombreuses.</p>
<h3>Diagramme circulaire : la répartition d'un total</h3>
${code(R`
categories = ["Papier/carton", "Verre", "Plastique", "Métal", "Autres"]
quantites = [38, 24, 20, 8, 10]

plt.figure(figsize=(7, 7))
plt.pie(quantites, labels=categories, autopct="%1.1f%%", startangle=90)
plt.axis("equal")
plt.title("Répartition des déchets collectés")
plt.show()
`)}
<ul><li>Les valeurs sont converties en <b>parts du total</b> (38 / 100 → 38 %) : pas besoin qu'elles somment à 100.</li>
<li><code>autopct="%1.1f%%"</code> écrit le pourcentage de chaque secteur avec <b>une décimale</b> (<code>%%</code> affiche le symbole %) : « 38.0% ».</li>
<li><code>startangle=90</code> fait partir le premier secteur du haut (au lieu de l'axe horizontal à droite) ; les secteurs se suivent ensuite dans le sens inverse des aiguilles d'une montre.</li>
<li><code>plt.axis("equal")</code> impose la même échelle en x et y : le camembert est un <b>cercle</b> et non une ellipse.</li></ul>
<h3>Boîte à moustaches : comparer des distributions</h3>
${code(R`
rng = np.random.default_rng(10)
velo = rng.normal(24, 5, 120)
transport_commun = rng.normal(37, 9, 120)
voiture = rng.normal(31, 11, 120)

plt.boxplot([velo, transport_commun, voiture],
            tick_labels=["Vélo", "Transport en commun", "Voiture"])
plt.ylabel("Temps de trajet (minutes)")
plt.show()
print(np.median(velo), np.median(transport_commun), np.median(voiture))
`, R`
23.13230015775135 35.046416767755105 29.734689595342534
`)}
${def('boxplot', R`<p>Pour chaque groupe : la <b>boîte</b> va du 1<sup>er</sup> quartile Q1 au 3<sup>e</sup> quartile Q3 (elle contient les 50 % centraux), le <b>trait</b> intérieur est la <b>médiane</b>, les <b>moustaches</b> vont jusqu'à la dernière valeur située à moins de 1,5 × (Q3 − Q1) de la boîte, et les points au-delà sont les valeurs <b>atypiques</b>. Ici, la boîte « Transport en commun » est la plus haute (médiane ≈ 35 min) et celle de la voiture la plus étirée (écart type 11).</p>`)}
${warn('labels → tick_labels', R`<p>Le notebook écrit <code>plt.boxplot(donnees, labels=[…])</code>. Depuis Matplotlib 3.9, ce paramètre s'appelle <code>tick_labels</code> ; <code>labels</code> a été supprimé dans Matplotlib 3.11 (erreur <code>TypeError</code>).</p>`)}
` },
      { id: 'sns-bases', t: 'Seaborn : thème, format long et distributions', sub: 'set_theme, histplot, kdeplot', html: R`
<p><b>Seaborn</b> (<code>import seaborn as sns</code>) est construit au-dessus de Matplotlib : on lui passe un DataFrame (<code>data=</code>) et des <b>noms de colonnes</b> (<code>x=</code>, <code>y=</code>, <code>hue=</code>…), et il calcule lui-même les statistiques (comptages, densités, quartiles, régressions). On peut toujours finir avec <code>plt.title</code>, <code>plt.show</code>…</p>
<h3>Apparence globale : <code>sns.set_theme</code></h3>
<ul><li><code>context</code> : taille des textes et des traits selon l'usage, <code>"paper"</code> &lt; <code>"notebook"</code> (défaut) &lt; <code>"talk"</code> &lt; <code>"poster"</code>. Le contenu du graphique ne change pas.</li>
<li><code>style</code> : fond et grille, <code>"darkgrid"</code> (défaut), <code>"whitegrid"</code>, <code>"dark"</code>, <code>"white"</code>, <code>"ticks"</code>.</li>
<li><code>palette</code> : jeu de couleurs, par exemple <code>"Set2"</code> ; <code>sns.color_palette("Set2")</code> renvoie la liste de ses 8 couleurs (triplets RGB).</li></ul>
<p>On l'appelle <b>une fois</b> en début de script pour que toutes les figures soient cohérentes : <code>sns.set_theme(style="whitegrid", context="notebook")</code>. Pour un style temporaire : <code>with sns.axes_style("ticks"): …</code>.</p>
${def('format long', R`<p>Seaborn attend des données au format <b>long</b> (« tidy ») : <b>une ligne par observation, une colonne par variable</b>. Une variable catégorielle (mode, météo, abonnement…) est alors une colonne que l'on peut passer à <code>hue</code>, <code>row</code> ou <code>col</code>. Un tableau « large » (une colonne par jour…) se convertit avec <code>melt</code> :</p>
${code(R`
large = pd.DataFrame({"ville": ["Lille", "Lyon"],
                      "lundi": [18.5, 22.0], "mardi": [20.0, 24.5]})
long = large.melt(id_vars="ville", var_name="jour", value_name="temperature")
print(long)
`, R`
   ville   jour  temperature
0  Lille  lundi         18.5
1   Lyon  lundi         22.0
2  Lille  mardi         20.0
3   Lyon  mardi         24.5
`)}`)}
<p>Le fil rouge du TP est <code>mobilite</code> (1 200 trajets, 10 colonnes) : <code>mode</code> (3 modes : vélo, marche, trottinette), <code>moment</code>, <code>meteo</code>, <code>abonnement</code> (812 abonnés, 388 occasionnels), <code>age</code>, <code>distance_km</code>, <code>duree_min</code>, <code>calories</code>, <code>satisfaction</code>, <code>annee</code>.</p>
<h3>Distribution d'une variable : <code>histplot</code> et <code>kdeplot</code></h3>
${code(R`
sns.histplot(data=mobilite, x="distance_km", kde=True)
plt.show()

sns.histplot(data=mobilite, x="age", hue="abonnement",
             element="step", stat="density", common_norm=False)
plt.show()

sns.kdeplot(data=mobilite, x="duree_min", hue="mode", common_norm=False)
plt.show()
`)}
<p><b>Ce que ça dessine :</b> (1) l'histogramme des distances avec une courbe de densité lissée superposée ; (2) deux histogrammes des âges (abonnés / occasionnels) en contour seul (<code>element="step"</code>), de couleurs différentes, chacun d'aire 1 ; (3) une courbe de densité des durées par mode de déplacement.</p>
<table class="t"><thead><tr><th>Paramètre</th><th>Effet</th></tr></thead><tbody>
<tr><td><code>kde=True</code></td><td>superpose une estimation lissée de la densité (<i>kernel density estimate</i>)</td></tr>
<tr><td><code>hue="col"</code></td><td>une couleur par modalité de la colonne, avec légende automatique</td></tr>
<tr><td><code>bins</code></td><td>nombre de classes ou bornes (<code>bins=np.linspace(1, 5, 13)</code>)</td></tr>
<tr><td><code>element</code></td><td><code>"bars"</code> (défaut), <code>"step"</code> (contour, lisible quand les groupes se superposent), <code>"poly"</code></td></tr>
<tr><td><code>stat</code></td><td><code>"count"</code> (défaut), <code>"frequency"</code>, <code>"probability"</code>/<code>"proportion"</code>, <code>"percent"</code>, <code>"density"</code> (aire totale 1)</td></tr>
<tr><td><code>common_norm</code></td><td><code>True</code> (défaut) : normalisation commune à tous les groupes, un petit groupe paraît petit ; <code>False</code> : chaque groupe est normalisé séparément → on compare les <b>formes</b> malgré des effectifs différents (812 vs 388)</td></tr>
</tbody></table>
<p>Une <b>KDE</b> donne une version lissée de l'histogramme, plus facile à comparer entre plusieurs groupes. En 2D, <code>sns.kdeplot(data=mobilite, x="distance_km", y="duree_min", fill=True, levels=8, thresh=0.05)</code> dessine des <b>courbes de niveau</b> de la densité jointe (8 niveaux, les zones de densité trop faible n'étant pas coloriées).</p>
` },
      { id: 'sns-multi', t: 'Seaborn : relations, facettes et catégories', sub: 'pairplot, jointplot, FacetGrid, catplot, boxplot, violinplot, scatterplot', html: R`
<h3>Plusieurs variables numériques : <code>pairplot</code></h3>
${code(R`
variables = mobilite[["distance_km", "duree_min", "calories", "satisfaction", "mode"]]
sns.pairplot(variables.sample(450, random_state=1), hue="mode", height=2.2)
plt.show()
`)}
<p><b>Ce que ça dessine :</b> une grille 4 × 4 (une ligne et une colonne par variable numérique). Hors diagonale, le nuage de points de chaque couple de variables ; sur la <b>diagonale</b>, la distribution d'une seule variable (une densité par mode, puisque <code>hue</code> est donné). On y voit que distance et durée sont positivement liées et que les calories augmentent avec la distance. <code>sample(450)</code> tire 450 lignes pour alléger le graphique.</p>
<h3>Deux variables et leurs marges : <code>jointplot</code></h3>
<p><code>sns.jointplot(data=mobilite, x="distance_km", y="duree_min", kind="reg", height=7)</code> : au centre le nuage avec la <b>droite de régression</b> (et sa bande de confiance), en haut et à droite les distributions marginales de chaque variable. Avec <code>kind="hex"</code>, le centre est un <b>histogramme hexagonal</b> : le plan est pavé d'hexagones colorés selon le nombre de points qu'ils contiennent, ce qui évite la superposition quand il y a beaucoup de points. Autres valeurs : <code>"scatter"</code> (défaut), <code>"kde"</code>, <code>"hist"</code>.</p>
<h3>Petits multiples : <code>FacetGrid</code></h3>
${code(R`
grid = sns.FacetGrid(mobilite, row="abonnement", col="meteo",
                     margin_titles=True, height=2.5)
grid.map_dataframe(sns.histplot, x="satisfaction", bins=np.linspace(1, 5, 13))
plt.show()
`)}
<p><b>Ce que ça dessine :</b> 2 lignes (Abonné, Occasionnel) × 3 colonnes (Nuageux, Pluie, Soleil) = 6 histogrammes de la satisfaction, un par sous-groupe, sur des axes communs. <code>map_dataframe</code> appelle la fonction de tracé sur le sous-DataFrame de chaque case. Les effectifs étant très différents (163 trajets sous la pluie, 689 au soleil), remplacer <code>histplot</code> par <code>sns.kdeplot</code> (<code>fill=True</code>) compare mieux les formes.</p>
<h3>Variable numérique selon des catégories</h3>
${code(R`
with sns.axes_style("ticks"):
    g = sns.catplot(data=mobilite, x="mode", y="duree_min", hue="moment",
                    kind="box", height=5, aspect=1.4)
    g.set_axis_labels("Mode de déplacement", "Durée (minutes)")
plt.show()

g = sns.catplot(data=mobilite, x="annee", hue="mode", kind="count", aspect=2.0)
g.set_ylabels("Nombre de trajets")
plt.show()

sns.violinplot(data=mobilite, x="mode", y="satisfaction",
               hue="abonnement", split=True, inner="quartile")
plt.show()
`)}
<ul><li><code>catplot(kind="box")</code> : une boîte à moustaches des durées par mode, dédoublée par moment de la journée grâce à <code>hue</code>.</li>
<li><code>catplot(kind="count")</code> : des barres de <b>comptage</b> (nombre de lignes) par année, découpées par mode avec <code>hue</code> (pas de <code>y</code>).</li>
<li><code>sns.boxplot(data=…, x="mode", y="distance_km")</code> : la même boîte sans passer par <code>catplot</code>.</li>
<li><code>violinplot</code> : la boîte est remplacée par la <b>forme de la densité</b>, symétrisée. <code>inner="quartile"</code> trace la médiane et les quartiles à l'intérieur (défaut : <code>"box"</code>, une mini-boîte) ; <code>split=True</code> avec deux modalités de <code>hue</code> met une demi-densité de chaque côté du même violon (abonnés à gauche, occasionnels à droite).</li>
<li><code>sns.scatterplot(data=…, x="distance_km", y="calories", hue="mode", alpha=0.7)</code> : nuage de points coloré par mode.</li></ul>
${prop('Boxplot ou violon ?', R`<p>Le boxplot résume la distribution en 5 nombres (médiane, quartiles, moustaches) et montre les valeurs atypiques ; le violon montre en plus la <b>forme</b> complète (plusieurs pics, asymétrie), qu'une boîte cache.</p>`)}
${warn('fonctions « figure » et fonctions « axes »', R`<p><code>catplot</code>, <code>pairplot</code>, <code>jointplot</code>, <code>FacetGrid</code> (et <code>relplot</code>, <code>displot</code>) créent <b>leur propre figure</b> : on règle la taille avec <code>height</code> et <code>aspect</code> (largeur = height × aspect), pas avec <code>plt.figure(figsize=…)</code>, et ils renvoient un objet grille (<code>FacetGrid</code>, <code>PairGrid</code>, <code>JointGrid</code>) qui a ses propres méthodes (<code>set_axis_labels</code>, <code>set_ylabels</code>, <code>map_dataframe</code>). <code>histplot</code>, <code>kdeplot</code>, <code>boxplot</code>, <code>violinplot</code>, <code>scatterplot</code>, <code>lineplot</code> dessinent dans <b>un</b> axes (paramètre <code>ax=</code>) et renvoient cet axes.</p>`)}
` },
      { id: 'choisir', t: 'Choisir le bon graphique', sub: 'Du type de données au graphique', html: R`
<p>La question à se poser : <b>combien de variables</b> et de <b>quel type</b> (quantitative / qualitative), et que veut-on montrer (distribution, comparaison, relation, évolution, répartition) ?</p>
<table class="t"><thead><tr><th>Données</th><th>Objectif</th><th>Graphique</th></tr></thead><tbody>
<tr><td>Une fonction, une série dans le temps</td><td>évolution</td><td><code>plt.plot</code>, <code>sns.lineplot</code></td></tr>
<tr><td>Mesures ponctuelles avec incertitude</td><td>valeur ± erreur</td><td><code>plt.errorbar</code> (yerr, capsize)</td></tr>
<tr><td>Courbe continue avec marge</td><td>zone d'incertitude</td><td><code>ax.fill_between</code></td></tr>
<tr><td>1 variable quantitative</td><td>distribution</td><td><code>hist</code>, <code>sns.histplot</code> (kde=True), <code>sns.kdeplot</code>, boxplot</td></tr>
<tr><td>1 variable qualitative</td><td>effectifs par catégorie</td><td><code>plt.bar</code> / <code>barh</code>, <code>catplot(kind="count")</code></td></tr>
<tr><td>Parts d'un total (peu de catégories)</td><td>répartition</td><td><code>plt.pie</code> (autopct, axis equal)</td></tr>
<tr><td>Quantitative selon qualitative</td><td>comparer des distributions</td><td><code>boxplot</code>, <code>violinplot</code>, <code>catplot(kind="box")</code>, <code>histplot</code>/<code>kdeplot</code> avec <code>hue</code> et <code>common_norm=False</code></td></tr>
<tr><td>2 quantitatives</td><td>relation</td><td><code>scatterplot</code> (hue), <code>jointplot</code> (<code>kind="reg"</code> ; <code>"hex"</code> si beaucoup de points), <code>kdeplot</code> 2D</td></tr>
<tr><td>Plusieurs quantitatives</td><td>toutes les relations deux à deux</td><td><code>pairplot</code> (hue)</td></tr>
<tr><td>2 qualitatives</td><td>effectifs croisés</td><td><code>catplot(kind="count", hue=…)</code>, tableau <code>pivot_table(aggfunc="size")</code></td></tr>
<tr><td>Même graphique par sous-groupe</td><td>petits multiples</td><td><code>FacetGrid(row=…, col=…)</code> + <code>map_dataframe</code></td></tr>
</tbody></table>
${method('un graphique lisible', R`<ol><li>Choisir la forme d'après le tableau ci-dessus.</li><li>Ajouter un <b>titre</b>, des <b>labels d'axes avec unités</b> et une <b>légende</b> dès qu'il y a plusieurs séries : le graphique doit se comprendre sans lire le code.</li><li>Si les groupes ont des effectifs différents, comparer des densités ou des proportions (<code>stat="density"</code>, <code>common_norm=False</code>) plutôt que des comptes.</li><li>Trop de points qui se chevauchent : <code>alpha</code>, échantillon (<code>sample</code>) ou hexbin.</li><li>Vérifier numériquement ce que le graphique suggère (<code>np.median</code>, <code>groupby(...).mean()</code>).</li></ol>`)}
${warn('le camembert', R`<p>L'œil compare mal des angles : au-delà de 5 ou 6 secteurs, ou pour comparer des valeurs proches, un diagramme en barres est plus lisible. Un camembert n'a de sens que pour des <b>parts d'un même total</b>.</p>`)}
` },
    ],
    keep: [
      'fig = la figure entière, ax = une zone de tracé ; fig, ax = plt.subplots().',
      'plot(x, y, color, linestyle, marker, label) + title, xlabel, ylabel, legend().',
      'errorbar(x, y, yerr, fmt, capsize, ecolor) pour des points ; fill_between(x, y1, y2, alpha) pour une bande.',
      'add_subplot(lignes, colonnes, position) avec position à partir de 1 ; tight_layout() évite les chevauchements.',
      'pie : autopct="%1.1f%%", startangle=90, axis("equal") ; boxplot : médiane, Q1–Q3, moustaches à 1,5 × IQR.',
      'Seaborn : format long, data= + noms de colonnes, hue / row / col ; set_theme(context, style, palette).',
      'common_norm=False pour comparer des groupes d\'effectifs différents ; violinplot(split=True, inner="quartile").',
      'catplot, pairplot, jointplot, FacetGrid : figure-level, taille par height et aspect.',
    ],
  },
];

/* ======================================================================= */
const C = (id, ch, q, a) => ({ id: 'dtc_' + id, ch, q, a });

export const cardsData = [
  C('dtype', 'pydata', 'Que donne np.array([18.5, 21, 19]).dtype et pourquoi ?', 'float64 : un tableau NumPy n\'a qu\'un type, et la présence d\'un flottant convertit tous les éléments en flottants (21 s\'affiche 21.).'),
  C('dtype2', 'pydata', 'Comment imposer le type d\'un tableau NumPy ?', 'Avec l\'argument dtype à la création, par exemple np.array([0, 2, 5], dtype="float32"), ou après coup avec t.astype(int) (troncature des décimales).'),
  C('attrs', 'pydata', 'Que valent ndim, shape et size pour un tableau de 3 villes × 5 jours ?', 'ndim = 2, shape = (3, 5) (lignes, colonnes), size = 15 éléments. len(T) vaut 3 (taille du premier axe).'),
  C('arange', 'pydata', 'Différence entre np.arange et np.linspace ?', 'arange(début, fin, pas) fixe le pas et exclut la fin ; linspace(début, fin, n) fixe le nombre de points et inclut la fin. np.arange(0, 24, 3) donne 0 à 21 ; np.linspace(10, 30, 5) donne 10, 15, 20, 25, 30.'),
  C('creation', 'pydata', 'Que créent np.zeros, np.ones, np.full, np.eye et reshape ?', 'zeros/ones/full : tableau de la forme donnée rempli de 0, de 1 ou d\'une valeur ; eye(n) : matrice identité n × n ; t.reshape(l, c) : mêmes données réorganisées (l × c doit égaler size, -1 laisse NumPy calculer).'),
  C('rng', 'pydata', 'Comment obtenir des tirages aléatoires reproductibles ?', 'rng = np.random.default_rng(42) (graine fixée), puis rng.random(forme), rng.normal(moy, ecart, size), rng.integers(a, b, size), rng.uniform(a, b, size).'),
  C('index2d', 'pydata', 'Comment lire T[2, 2], T[0, :] et T[:, 2] (lignes = villes, colonnes = jours) ?', 'T[2, 2] : la ville d\'indice 2 le jour d\'indice 2 (un nombre). T[0, :] : toute la première ville. T[:, 2] : le jour d\'indice 2 pour toutes les villes.'),
  C('slicing', 'pydata', 'Que renvoie P[::2], P[4:], P[::-1] pour P = [17 19 21 20 23 25 22] ?', 'P[::2] = [17 21 23 22] (un sur deux), P[4:] = [23 25 22] (à partir de l\'indice 4), P[::-1] = [22 25 23 20 21 19 17] (inversé). La borne de fin est toujours exclue.'),
  C('vue', 'pydata', 'Que se passe-t-il si on modifie une tranche v = P[:3] ?', 'Le slicing renvoie une vue : modifier v modifie aussi P. Pour une copie indépendante : P[:3].copy().'),
  C('stack', 'pydata', 'Différence entre np.vstack et np.hstack ?', 'vstack empile verticalement (ajoute des lignes, même nombre de colonnes) ; hstack empile horizontalement (ajoute des colonnes, même nombre de lignes). vstack d\'un (3, 5) et d\'un vecteur de 5 donne (4, 5).'),
  C('vecto', 'pydata', 'Pourquoi préférer t * 9 / 5 + 32 à une boucle for ?', 'C\'est une opération vectorisée : la boucle tourne en code compilé dans NumPy. Dans le TP, sur 500 000 valeurs : 0,1 s avec la boucle contre 0,001 s avec NumPy, pour le même résultat.'),
  C('masque', 'pydata', 'Comment compter les mesures strictement supérieures à 25 °C ?', 'np.sum(T > 25) : la comparaison donne un masque de booléens et True vaut 1. (T > 25).mean() donne la proportion, (T > 25).sum(axis=1) le nombre par ligne.'),
  C('etou', 'pydata', 'Comment combiner deux conditions sur un tableau ou une colonne ?', 'Avec & (et), | (ou), ~ (non), chaque condition entre parenthèses : T[(T > 20) & (T < 28)]. and / or / not lèvent une ValueError (valeur de vérité ambiguë).'),
  C('where', 'pydata', 'Que fait np.where(cond, a, b) ?', 'Il construit un nouveau tableau de même forme : a là où cond est vraie, b sinon. Exemple : np.where(T > 30, 30, T) plafonne à 30.'),
  C('axis', 'pydata', 'Pour T de forme (3 villes, 5 jours), que donnent T.mean(axis=0) et T.mean(axis=1) ?', 'axis=0 fait disparaître l\'axe des lignes : une moyenne par colonne, soit par jour, forme (5,). axis=1 fait disparaître l\'axe des colonnes : une moyenne par ligne, soit par ville, forme (3,).'),
  C('argmax', 'pydata', 'Que renvoie np.argmax(T, axis=1) ?', 'Pour chaque ligne, l\'indice de la colonne contenant le maximum (ici le jour le plus chaud de chaque ville). Sans axis, l\'indice dans le tableau aplati. En cas d\'égalité, la première position.'),
  C('std', 'pydata', 'Pourquoi np.std et la méthode .std() de Pandas donnent-elles des valeurs différentes ?', 'np.std divise par n (ddof=0) ; Pandas divise par n - 1 (ddof=1, écart type corrigé). Sur [2, 4, 4, 4, 5, 5, 7, 9] : 2.0 contre 2.138.'),
  C('broad', 'pydata', 'Quelles sont les règles du broadcasting ?', 'On aligne les formes par la droite ; deux dimensions sont compatibles si elles sont égales ou si l\'une vaut 1 (elle est répliquée). (3, 5) + (5,) marche, (3, 5) + (3,) lève une ValueError, (3, 5) + (3, 1) marche.'),
  C('keepdims', 'pydata', 'Comment retirer à chaque ville (ligne) sa propre moyenne ?', 'T - T.mean(axis=1, keepdims=True) : keepdims donne une colonne de forme (3, 1), compatible par broadcasting avec (3, 5).'),
  C('seriesdf', 'pydata', 'Différence entre df["prix"] et df[["prix"]] ?', 'df["prix"] renvoie une Series (une colonne, avec l\'index et un nom). df[["prix"]] renvoie un DataFrame d\'une colonne : la liste de noms sert à la projection sur plusieurs colonnes.'),
  C('lociloc', 'pydata', 'Différence entre loc et iloc ?', 'loc sélectionne par labels (index et noms de colonnes) et ses tranches incluent la fin ; iloc sélectionne par positions entières et exclut la fin. df.loc["cargo"] et df.iloc[2] peuvent désigner la même ligne.'),
  C('readcsv', 'pydata', 'Comment lire un CSV dont les champs sont séparés par des points-virgules ?', 'pd.read_csv("fichier.csv", sep=";"). Sans sep, chaque ligne entière tombe dans une seule colonne.'),
  C('explorer', 'pydata', 'Quelles instructions pour une première exploration d\'un DataFrame ?', 'head()/tail(), shape, columns, dtypes, info() (non-null et types), describe() et describe(include="all") (ajoute unique, top, freq pour les colonnes texte), unique() et value_counts() sur une colonne.'),
  C('isna', 'pydata', 'Que fait df.isna().sum() ?', 'isna() marque True les valeurs manquantes (NaN) ; sum() compte les True colonne par colonne. On obtient le nombre de valeurs manquantes par colonne.'),
  C('fill', 'pydata', 'Différence entre fillna, ffill et dropna ?', 'fillna remplace les NaN par une valeur (par colonne avec un dictionnaire) ; ffill recopie la dernière valeur connue au-dessus ; dropna supprime les lignes (ou avec axis="columns" les colonnes) contenant un NaN.'),
  C('inplace', 'pydata', 'Pourquoi data.drop(columns=["meteo"]) ne modifie-t-il pas data ?', 'La méthode renvoie un nouveau DataFrame. Il faut réaffecter (data = data.drop(...)) ou utiliser inplace=True, qui modifie l\'objet et renvoie None.'),
  C('concat', 'pydata', 'Que fait pd.concat([df1, df2]) et à quoi sert ignore_index=True ?', 'Il empile les lignes (union). Les index d\'origine sont conservés, donc répétés ; ignore_index=True renumérote de 0 à n - 1.'),
  C('merge', 'pydata', 'Sur quelle colonne pd.merge(a, b) fait-il la jointure si on ne précise rien ?', 'Sur les colonnes de même nom dans les deux DataFrames. On peut préciser on="cle", ou left_on/right_on. Par défaut how="inner" : seules les clés présentes des deux côtés sont gardées.'),
  C('cardinal', 'pydata', 'Combien de lignes produit une jointure plusieurs-à-plusieurs ?', 'Pour chaque clé, (lignes de gauche) × (lignes de droite) avec cette clé. Dans le TP : Finance 1 × 2, Data 2 × 2, RH 1 × 2, soit 8 lignes participant-module.'),
  C('plusun', 'pydata', 'Que remarque-t-on après une jointure plusieurs-à-un ?', 'Le nombre de lignes de la table « plusieurs » ne change pas, et l\'information du côté « un » est répétée (le responsable Yanis apparaît pour les deux participants du service Data).'),
  C('groupby', 'pydata', 'Comment calculer le prix moyen par station et trouver la plus chère ?', 'data.groupby("station")["prix_eur"].mean() donne une Series indexée par station ; .idxmax() renvoie le label du maximum (Gare dans le TP).'),
  C('getgroup', 'pydata', 'À quoi servent get_group, size et count après un groupby ?', 'get_group("Janvier") renvoie les lignes d\'un groupe ; size() compte les lignes de chaque groupe ; count() compte les valeurs non manquantes de chaque colonne.'),
  C('pivot', 'pydata', 'Que fait data.pivot_table(values="prix_eur", index="type_velo", columns="abonne", aggfunc="mean") ?', 'Un tableau croisé : une ligne par type de vélo, une colonne par statut d\'abonné, et dans chaque case le prix moyen. aggfunc="size" compte les lignes, fill_value=0 remplace les cases vides.'),
  C('cut', 'pydata', 'Que fait pd.cut(s, bins=[0, 30, 60, np.inf], labels=["courte", "moyenne", "longue"]) ?', 'Il range chaque valeur dans un intervalle fermé à droite : (0, 30] courte, (30, 60] moyenne, (60, inf] longue. Une valeur manquante ou hors bornes (comme 0) donne NaN.'),
  C('sql', 'pydata', 'Équivalents Pandas de projection, restriction, union, jointure et GROUP BY ?', 'Projection df[["a", "b"]] ; restriction df[masque] ; union pd.concat ; jointure pd.merge ; GROUP BY df.groupby("g").agg ; ORDER BY df.sort_values.'),
  C('figax', 'pydata', 'Différence entre figure et axes dans Matplotlib ?', 'La figure est l\'image entière ; un axes est une zone de tracé (repère, titre, légende). fig, ax = plt.subplots() crée les deux ; une figure peut contenir plusieurs axes.'),
  C('errorbar', 'pydata', 'Rôle de yerr, fmt et capsize dans plt.errorbar ?', 'yerr : demi-longueur des barres d\'erreur verticales (un nombre ou un tableau) ; fmt : format des points ("o", "s", "^") ; capsize : longueur des petits traits aux extrémités des barres.'),
  C('subplot', 'pydata', 'Que signifie fig.add_subplot(2, 2, i + 1) ?', 'Grille de 2 lignes et 2 colonnes, axes placé à la position i + 1 (positions numérotées à partir de 1, ligne par ligne). plt.tight_layout() évite les chevauchements.'),
  C('pie', 'pydata', 'Que font autopct="%1.1f%%", startangle=90 et plt.axis("equal") dans un camembert ?', 'autopct écrit le pourcentage de chaque secteur avec une décimale ; startangle=90 fait commencer le premier secteur en haut ; axis("equal") rend le disque circulaire.'),
  C('boxplot', 'pydata', 'Comment lire une boîte à moustaches ?', 'Boîte de Q1 à Q3 (50 % centraux), trait intérieur = médiane, moustaches jusqu\'aux dernières valeurs à moins de 1,5 × (Q3 - Q1) de la boîte, points au-delà = valeurs atypiques.'),
  C('long', 'pydata', 'Qu\'est-ce que le format long et pourquoi Seaborn l\'aime-t-il ?', 'Une ligne par observation, une colonne par variable. Une variable catégorielle est alors une colonne qu\'on passe directement à hue, row ou col. df.melt convertit un tableau large en format long.'),
  C('commonnorm', 'pydata', 'À quoi sert common_norm=False dans histplot ou kdeplot avec hue ?', 'Chaque groupe est normalisé séparément (aire 1 chacun) : on compare les formes des distributions même quand les effectifs diffèrent beaucoup (812 abonnés contre 388 occasionnels).'),
  C('jointplot', 'pydata', 'Que montre sns.jointplot(..., kind="reg") ? Et kind="hex" ?', 'reg : le nuage de points avec la droite de régression au centre et les distributions marginales sur les bords. hex : le centre devient un pavage d\'hexagones colorés selon le nombre de points, utile quand les points se superposent.'),
  C('violin', 'pydata', 'Que font split=True et inner="quartile" dans sns.violinplot ?', 'split=True (avec deux modalités de hue) met une demi-densité de chaque côté du même violon ; inner="quartile" trace la médiane et les quartiles à l\'intérieur.'),
  C('figlevel', 'pydata', 'Comment régler la taille d\'un catplot ou d\'un FacetGrid ?', 'Avec height (hauteur de chaque case, en pouces) et aspect (largeur = height × aspect) : ces fonctions « figure-level » créent leur propre figure, plt.figure(figsize=...) n\'a pas d\'effet.'),
];

/* ======================================================================= */
const Q = (id, ch, q, opts, ans, exp) => ({ id: 'dtq_' + id, ch, q, opts, ans, exp });

export const quizData = [
  Q('dtype', 'pydata', 'Que vaut np.array([18, 21.5, 19]).dtype ?',
    ['int64', 'object', 'float64', 'Une erreur : types mélangés'], 2,
    'Un tableau NumPy a un seul type : la présence de 21.5 convertit tous les éléments en flottants.'),
  Q('trunc', 'pydata', 'x = np.array([18, 21, 19]) puis x[0] = 18.9. Que contient x ?',
    ['[18 21 19]', '[19 21 19]', '[18.9 21. 19.]', 'Une erreur de type'], 0,
    'x est de type entier : la valeur affectée est tronquée en 18, sans message.'),
  Q('arange', 'pydata', 'Que renvoie np.arange(0, 10, 3) ?',
    ['[3 6 9]', '[0 3 6 9 12]', '[0. 3.33 6.67 10.]', '[0 3 6 9]'], 3,
    'arange s\'arrête avant la borne de fin (exclue) avec un pas de 3.'),
  Q('linspace', 'pydata', 'Que renvoie np.linspace(0, 1, 5) ?',
    ['[0. 0.2 0.4 0.6 0.8]', '[0. 0.25 0.5 0.75 1.]', '[0 1 2 3 4]', '[0.2 0.4 0.6 0.8 1.]'], 1,
    'linspace donne 5 points régulièrement espacés, bornes incluses : le pas vaut 1/4.'),
  Q('reshape', 'pydata', 'g = np.arange(12).reshape(3, 4). Que vaut g[1, 2] ?',
    ['5', '6', '9', '7'], 1,
    'La ligne 1 contient 4 5 6 7 ; l\'élément d\'indice 2 de cette ligne est 6.'),
  Q('shape', 'pydata', 'T a la forme (3, 5) (3 villes, 5 jours). Quelle est la forme de T.mean(axis=0) ?',
    ['(3,)', '(1,)', '(3, 5)', '(5,)'], 3,
    'axis=0 fait disparaître l\'axe des lignes : il reste une moyenne par colonne, soit par jour.'),
  Q('axis1', 'pydata', 'Pour obtenir la température moyenne de chaque ville (une ville par ligne), on écrit :',
    ['T.mean(axis=1)', 'T.mean(axis=0)', 'T.mean()', 'np.mean(T, axis=2)'], 0,
    'Une valeur par ligne : on réduit l\'axe des colonnes, axis=1. T.mean() donnerait un seul nombre.'),
  Q('colonne', 'pydata', 'Lignes = villes, colonnes = jours. Que représente T[:, 2] ?',
    ['La troisième ville, tous les jours', 'Les deux premières villes', 'Le troisième jour, toutes les villes', 'L\'élément (2, 2)'], 2,
    'Le : prend toutes les lignes (villes) et 2 désigne la colonne d\'indice 2.'),
  Q('slice', 'pydata', 'P = np.array([17, 19, 21, 20, 23, 25, 22]). Que renvoie P[1:6:2] ?',
    ['[19 20 25 22]', '[19 21 23]', '[17 21 23 22]', '[19 20 25]'], 3,
    'Indices 1, 3, 5 (la borne 6 est exclue) : 19, 20, 25.'),
  Q('vstack', 'pydata', 'T est de forme (3, 5) et v de forme (5,). Quelle est la forme de np.vstack([T, v]) ?',
    ['(3, 6)', '(8,)', '(4, 5)', 'Erreur : formes incompatibles'], 2,
    'vstack ajoute v comme une nouvelle ligne : 4 lignes de 5 colonnes.'),
  Q('concat1', 'pydata', 'A et B sont de forme (2, 3). Forme de np.concatenate([A, B], axis=1) ?',
    ['(2, 6)', '(4, 3)', '(2, 3)', '(12,)'], 0,
    'axis=1 colle les tableaux côte à côte : on ajoute des colonnes.'),
  Q('where', 'pydata', 'x = np.array([1, 3, 5]). Que renvoie np.where(x > 2, x, 0) ?',
    ['[3 5]', '[0 3 5]', '[False True True]', '[1 0 0]'], 1,
    'Là où la condition est vraie on garde x, sinon on met 0 ; la forme est conservée.'),
  Q('compte', 'pydata', 'M est un tableau de températures. Que calcule np.sum(M > 25) ?',
    ['La somme des températures supérieures à 25', 'Un tableau de booléens', 'Le nombre de températures supérieures à 25', 'L\'indice du maximum'], 2,
    'M > 25 est un masque de booléens et True vaut 1 : la somme compte les valeurs concernées.'),
  Q('andor', 'pydata', 'Quelle écriture sélectionne les valeurs de M comprises strictement entre 20 et 28 ?',
    ['M[(M > 20) & (M < 28)]', 'M[M > 20 and M < 28]', 'M[M > 20 & M < 28]', 'M[(M > 20) and (M < 28)]'], 0,
    'Sur des tableaux on utilise &, avec des parenthèses (& est prioritaire sur les comparaisons) ; and lève une ValueError.'),
  Q('broadcast', 'pydata', 'T est de forme (3, 5). Que donne T + np.array([1.0, 2.0, 3.0]) ?',
    ['Ajoute 1, 2, 3 aux trois lignes', 'Ajoute 1, 2, 3 aux trois premières colonnes', 'Un tableau de forme (3, 3)', 'ValueError : formes (3,5) et (3,) incompatibles'], 3,
    'Les formes s\'alignent par la droite : 5 et 3 diffèrent et aucune ne vaut 1. Il faudrait une colonne (3, 1).'),
  Q('broadcast2', 'pydata', 'Quelle est la forme de np.ones((3, 1)) + np.ones((1, 4)) ?',
    ['(3, 1)', '(3, 4)', '(1, 4)', 'Erreur'], 1,
    'Chaque dimension égale à 1 est étirée : 3 lignes et 4 colonnes.'),
  Q('argmax', 'pydata', 'Que renvoie np.argmax(T, axis=1) si T a une ville par ligne et un jour par colonne ?',
    ['La température maximale de chaque ville', 'Pour chaque ville, l\'indice du jour le plus chaud', 'Pour chaque jour, l\'indice de la ville la plus chaude', 'L\'indice global du maximum'], 1,
    'argmax renvoie une position, ici celle de la colonne du maximum dans chaque ligne.'),
  Q('serie', 'pydata', 'Quel est le type de df[["prix_eur"]] ?',
    ['Series', 'list', 'ndarray', 'DataFrame'], 3,
    'Une liste de noms de colonnes entre crochets renvoie toujours un DataFrame, même avec une seule colonne.'),
  Q('lociloc', 'pydata', 'df = pd.DataFrame({"x": [10, 20, 30, 40]}, index=[3, 2, 1, 0]). Que valent df.loc[1, "x"] et df.iloc[1, 0] ?',
    ['30 et 20', '20 et 20', '20 et 30', '30 et 30'], 0,
    'loc cherche le label 1 (troisième ligne, 30) ; iloc prend la position 1 (deuxième ligne, 20).'),
  Q('locslice', 'pydata', 'Avec le même df (index 3, 2, 1, 0), combien de lignes renvoie df.loc[3:1] ?',
    ['2', '0', '3', '4'], 2,
    'Avec loc, la borne de fin est incluse : labels 3, 2 et 1.'),
  Q('concat', 'pydata', 'regions a 4 lignes (index 0 à 3), regions2 en a 3 (index 0 à 2). Que donne pd.concat([regions, regions2]).index.tolist() ?',
    ['[0, 1, 2, 3, 4, 5, 6]', 'Une erreur : index en double', '[0, 1, 2]', '[0, 1, 2, 3, 0, 1, 2]'], 3,
    'concat conserve les index d\'origine ; il faut ignore_index=True pour renuméroter.'),
  Q('m2m', 'pydata', 'participants (4 lignes : 1 Finance, 2 Data, 1 RH) est joint à modules (2 modules par service). Combien de lignes compte pd.merge(participants, modules) ?',
    ['4', '6', '8', '24'], 2,
    'Plusieurs-à-plusieurs : chaque participant est combiné avec les 2 modules de son service, 4 × 2 = 8.'),
  Q('inner', 'pydata', 'participants a les services Finance, Data, Data, RH ; resp2 a Finance, Data, Marketing. Combien de lignes renvoie pd.merge(participants, resp2) ?',
    ['3', '4', '5', '6'], 0,
    'Par défaut how="inner" : RH et Marketing n\'ont pas de correspondance, il reste Amira, Bastien et Chloé.'),
  Q('dropna', 'pydata', 'Que fait df.dropna(axis="columns") ?',
    ['Supprime les lignes contenant un NaN', 'Supprime les colonnes contenant au moins un NaN', 'Remplace les NaN par 0', 'Supprime les colonnes entièrement vides seulement'], 1,
    'axis="columns" (ou 1) applique la suppression aux colonnes ; sans argument, ce sont les lignes.'),
  Q('inplace', 'pydata', 'Après df = df.dropna(inplace=True), que contient df ?',
    ['Le DataFrame sans les lignes incomplètes', 'Le DataFrame d\'origine', 'None', 'Une erreur est levée'], 2,
    'Avec inplace=True, la méthode modifie l\'objet et renvoie None, qui est ensuite affecté à df.'),
  Q('isna', 'pydata', 'Que renvoie data.isna().sum() ?',
    ['Le nombre de valeurs manquantes de chaque colonne', 'Le nombre total de lignes', 'La somme des colonnes en ignorant les NaN', 'Un DataFrame de booléens'], 0,
    'isna() marque les NaN par True et sum() compte les True colonne par colonne.'),
  Q('meannan', 'pydata', 'La colonne satisfaction vaut [5, 4, NaN, 2, 3, NaN]. Que renvoie sa méthode mean() ?',
    ['NaN', '2.33', '2.8', '3.5'], 3,
    'Pandas ignore les NaN par défaut : (5 + 4 + 2 + 3) / 4 = 3.5.'),
  Q('groupby', 'pydata', 'Scores : A → 14 et 18, B → 11 et 13, C → 16 et 15. Que vaut resultats.groupby("groupe")["score"].mean()["C"] ?',
    ['31', '15.5', '16.0', '12.0'], 1,
    'Le groupe C a deux scores, 16 et 15 : moyenne 15.5.'),
  Q('idxmax', 'pydata', 'Que renvoie data.groupby("station")["prix_eur"].mean().idxmax() ?',
    ['Le prix moyen maximal', 'Le nom de la station au prix moyen le plus élevé', 'La position (entier) de cette station', 'La ligne la plus chère du DataFrame'], 1,
    'idxmax renvoie le label de l\'index du maximum ; ici l\'index est formé des noms de stations.'),
  Q('pivot', 'pydata', 'Quel appel donne le nombre de locations par type de vélo (lignes) et météo (colonnes), avec 0 pour les cases vides ?',
    ['data.groupby("type_velo")["meteo"].mean()', 'data["type_velo"].value_counts()', 'data.pivot_table(values="meteo", index="type_velo", aggfunc="mean")', 'data.pivot_table(index="type_velo", columns="meteo", aggfunc="size", fill_value=0)'], 3,
    'aggfunc="size" compte les lignes de chaque combinaison et fill_value=0 remplit les combinaisons absentes.'),
  Q('cut', 'pydata', 'pd.cut avec bins=[0, 30, 60, np.inf] et labels=["courte", "moyenne", "longue"] : dans quelle catégorie tombe 30 ?',
    ['courte', 'moyenne', 'NaN', 'longue'], 0,
    'Les intervalles sont fermés à droite : 30 appartient à (0, 30]. En revanche 0 donnerait NaN.'),
  Q('readcsv', 'pydata', 'Un CSV utilise ";" comme séparateur et on écrit pd.read_csv("f.csv"). Que se passe-t-il ?',
    ['Pandas détecte automatiquement le ;', 'Une erreur est levée', 'Chaque ligne tombe dans une seule colonne', 'Les ; sont remplacés par des NaN'], 2,
    'Le séparateur par défaut est la virgule : il faut préciser sep=";".'),
  Q('subplot', 'pydata', 'Dans fig.add_subplot(2, 3, 5), où se trouve l\'axes créé ?',
    ['Ligne 1, colonne 2', 'Ligne 1, colonne 5', 'Ligne 2, colonne 3', 'Ligne 2, colonne 2'], 3,
    'Grille 2 × 3 numérotée à partir de 1, ligne par ligne : 1 2 3 en haut, 4 5 6 en bas ; 5 est au milieu de la ligne du bas.'),
  Q('subplots', 'pydata', 'Après fig, axes = plt.subplots(2, 3), que vaut axes.shape ?',
    ['(6,)', '(3, 2)', '(2, 3)', 'axes est un seul objet Axes'], 2,
    'subplots renvoie un tableau NumPy d\'axes ayant la forme de la grille ; on dessine avec axes[i, j].'),
  Q('autopct', 'pydata', 'Dans plt.pie(..., autopct="%1.1f%%"), à quoi sert autopct ?',
    ['À afficher le pourcentage de chaque secteur avec une décimale', 'À trier les secteurs', 'À faire commencer le premier secteur en haut', 'À rendre le disque circulaire'], 0,
    'startangle oriente le premier secteur et plt.axis("equal") rend le disque rond.'),
  Q('errorbar', 'pydata', 'Pour tracer 11 mesures ponctuelles avec une incertitude de ±0,4 °C, on utilise :',
    ['plt.fill_between(heures, 0.4)', 'plt.errorbar(heures, mesures, yerr=0.4, fmt="o")', 'plt.bar(heures, mesures, 0.4)', 'plt.plot(heures, mesures, yerr=0.4)'], 1,
    'errorbar dessine les points (fmt) et des barres verticales de demi-longueur yerr. fill_between convient plutôt à une courbe continue.'),
  Q('choix', 'pydata', 'On veut comparer la distribution des durées de trajet selon le mode de déplacement. Quel graphique choisir ?',
    ['Un camembert', 'Un pairplot', 'Un boxplot ou un violinplot avec x="mode" et y="duree_min"', 'Un plt.plot des durées'], 2,
    'Variable quantitative selon une variable qualitative : boxplot ou violon, un par catégorie.'),
  Q('commonnorm', 'pydata', 'Deux groupes ont des effectifs très différents (812 et 388). Avec sns.histplot(..., hue="abonnement", stat="density"), quel réglage permet de comparer leurs formes ?',
    ['common_norm=False', 'common_norm=True', 'element="bars"', 'kde=False'], 0,
    'Avec common_norm=False, chaque groupe est normalisé séparément et a une aire de 1.'),
  Q('pairplot', 'pydata', 'Dans un sns.pairplot, que représentent les graphiques de la diagonale ?',
    ['La relation de chaque variable avec elle-même (une droite)', 'Rien, la diagonale est vide', 'Les corrélations numériques', 'La distribution d\'une seule variable'], 3,
    'Hors diagonale : nuages de points entre deux variables ; sur la diagonale : histogramme ou densité de chaque variable.'),
  Q('hex', 'pydata', 'Pourquoi utiliser sns.jointplot(..., kind="hex") ?',
    ['Pour ajouter une droite de régression', 'Pour représenter la densité de points quand ils sont très nombreux et se superposent', 'Pour afficher des catégories', 'Pour obtenir six sous-graphiques'], 1,
    'Les hexagones agrègent les observations et sont colorés selon leur nombre.'),
  Q('figlevel', 'pydata', 'Comment agrandir une figure produite par sns.catplot ?',
    ['plt.figure(figsize=(10, 5)) avant l\'appel', 'Avec les paramètres height et aspect de catplot', 'Avec plt.axis("equal")', 'Avec sns.set_theme(context="paper")'], 1,
    'catplot est une fonction « figure-level » qui crée sa propre figure : la taille se règle avec height et aspect.'),
];
