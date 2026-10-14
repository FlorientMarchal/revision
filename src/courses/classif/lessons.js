// Le cours en entier, leçon par leçon. Leçons 3 à 6 : rédigées à partir des diapositives des CM (régression logistique,
// arbres de décision, SVM, clustering), y compris les compléments écrits à la main en cours. Leçons 1 et 2 : à partir
// des rappels de ces diapositives et des fiches du site (premier CM).
// Les gabarits utilisent String.raw (R`…`) pour que les antislashs du LaTeX passent tels quels.
const R = String.raw;
const box = (k, title, html) => `<div class="box ${k}"><div class="box-h">${title}</div>${html}</div>`;
const def = (t, h) => box('def', 'Définition · ' + t, h);
const prop = (t, h) => box('prop', t, h);
const ex = (t, h) => box('ex', 'Exemple · ' + t, h);
const warn = (t, h) => box('warn', 'Attention · ' + t, h);
const method = (t, h) => box('method', 'Méthode · ' + t, h);
const proof = (t, h) => `<details class="fold"><summary>${t}</summary><div style="margin-top:8px;display:grid;gap:8px">${h}</div></details>`;
const M = tex => `<div class="math">\\[${tex}\\]</div>`;
const demo = name => `<figure class="viz" data-viz="${name}"></figure>`;

export const lessons = [
  /* ===================================================================== */
  {
    id: 'l1', ch: 'intro', short: 'Cadre & KNN', src: 'CM 1',
    t: 'Le cadre de l\'apprentissage et les K plus proches voisins',
    sub: 'Ce qu\'on cherche à apprendre, comment on le mesure (coût, risque, risque empirique), et un premier classifieur : les KNN.',
    goals: [
      'Distinguer apprentissage supervisé et non supervisé, régression et classification.',
      'Définir fonction de coût, risque, règle optimale et risque empirique (ERM).',
      'Connaître les règles optimales des coûts quadratique, absolu et 0/1 (classifieur de Bayes).',
      'Appliquer l\'algorithme des K plus proches voisins et expliquer le rôle de K.',
    ],
    sections: [
      { id: 'types', t: 'Les types d\'apprentissage', sub: 'Supervisé, non supervisé ; régression, classification', html: R`
${def('Apprentissage supervisé', R`<p>On observe des données \(x_1,\dots,x_n\in\mathcal X\) <b>et</b> leurs étiquettes \(y_1,\dots,y_n\in\mathcal Y\). On veut apprendre une fonction \(f:\mathcal X\to\mathcal Y\) telle que \(f(x)\approx y\) pour une <b>nouvelle</b> observation \(x\) dont on ne connaît pas l'étiquette.</p>`)}
${def('Apprentissage non supervisé', R`<p>On observe seulement \(x_1,\dots,x_n\), <b>sans étiquettes</b>. Trois grandes tâches : le <b>clustering</b> (trouver des groupes, leçon 6), la <b>réduction de dimension</b> (représenter les données dans un espace plus petit pour calculer plus vite, visualiser, ou améliorer un modèle supervisé entraîné ensuite) et l'<b>estimation de densité</b> (estimer la loi dont les \(x_i\) sont des réalisations, par exemple avec un histogramme).</p>`)}
<p>En supervisé, c'est la nature de \(\mathcal Y\) qui donne le nom du problème :</p>
<table class="t"><thead><tr><th>Ensemble des étiquettes</th><th>Problème</th><th>Exemple</th></tr></thead><tbody>
<tr><td>\(\mathcal Y\subset\mathbb R\), infini</td><td><b>régression</b></td><td>prédire un prix, une température</td></tr>
<tr><td>\(\mathrm{Card}(\mathcal Y)=2\)</td><td><b>classification binaire</b></td><td>malade / sain ; \(\mathcal Y=\{0,1\}\) ou \(\{-1,1\}\)</td></tr>
<tr><td>\(\mathrm{Card}(\mathcal Y)=C>2\)</td><td><b>classification multiclasse</b></td><td>espèce d'iris ; \(\mathcal Y=\{1,\dots,C\}\)</td></tr></tbody></table>
${warn('piège classique', '<p>« Prédire la <b>probabilité</b> qu\'un client résilie » est un problème de <b>régression</b> : la sortie est un nombre continu dans [0, 1]. « Prédire <b>si</b> le client résilie » est une classification.</p>')}
` },
      { id: 'risque', t: 'Coût, risque et règle optimale', sub: 'Ce que « bien prédire » veut dire', html: R`
<p>On modélise l'observation et son étiquette par un couple aléatoire \((X,Y)\sim\mathbb P_{X,Y}\). Pour dire si une prédiction est bonne, on se donne une <b>fonction de coût</b> \(\ell:\mathcal Y\times\mathcal Y\to\mathbb R\) avec \(\ell(y,y)=0\) et \(\ell(y,y')>0\) si \(y\neq y'\).</p>
${def('Risque et règle optimale', R`<p>Le <b>risque</b> d'une fonction \(f\) est le coût moyen qu'elle commet : \(R(f)=\mathbb E_{\mathbb P_{X,Y}}\big[\ell(Y,f(X))\big]\). La <b>règle optimale</b> (le classifieur optimal) est celle qui le minimise parmi toutes les fonctions mesurables \(\mathcal F\) :</p>${M(R`f^*=\operatorname*{arg\,min}_{f\in\mathcal F}\ \mathbb E\big[\ell(Y,f(X))\big]`)}`)}
${prop('Règles optimales à connaître', M(R`\begin{aligned}\text{coût quadratique } (y-y')^2 &\Rightarrow f^*(x)=\mathbb E[Y\mid X=x]\\ \text{coût absolu } |y-y'| &\Rightarrow f^*(x)=\text{médiane}(Y\mid X=x)\\ \text{coût 0/1 } \mathbf 1\{y\neq y'\} &\Rightarrow f^*(x)=\operatorname*{arg\,max}_k\ \mathbb P(Y=k\mid X=x)\end{aligned}`) + '<p>La dernière règle s\'appelle le <b>classifieur de Bayes</b> : on prédit la classe la plus probable sachant x.</p>')}
${proof('Démonstration : coût quadratique ⇒ f*(x) = E[Y | X = x]', R`<p>On suppose que \(\mathbb P_{X,Y}\) a une densité. En conditionnant par \(X\) :</p>${M(R`R(f)=\mathbb E\big[(Y-f(X))^2\big]=\int p(x)\Big(\int (y-f(x))^2\,p(y\mid x)\,dy\Big)dx.`)}<p>Il suffit donc de minimiser, pour chaque \(x\), la fonction \(g_x(c)=\int (y-c)^2p(y\mid x)\,dy=c^2-2c\int y\,p(y\mid x)\,dy+\text{cte}\). On a \(g_x'(c)=0\iff c=\int y\,p(y\mid x)\,dy=\mathbb E[Y\mid X=x]\), et \(g_x''=2>0\) : c'est bien un minimum.</p>`)}
` },
      { id: 'erm', t: 'Le risque empirique (ERM)', sub: 'On ne connaît pas la loi : on utilise les données', html: R`
<p>La loi \(\mathbb P_{X,Y}\) est <b>inconnue</b> : on ne peut pas calculer \(f^*\). On utilise à la place les données d'apprentissage \((x_1,y_1),\dots,(x_n,y_n)\), vues comme des réalisations de \((X,Y)\).</p>
${def('Paradigme ERM (minimisation du risque empirique)', M(R`\hat f^*=\operatorname*{arg\,min}_{f\in\mathcal F}\ \frac1n\sum_{i=1}^n\ell\big(y_i,f(x_i)\big)`) + '<p>On remplace l\'espérance par une moyenne sur les données observées.</p>')}
${def('Biais inductif', R`<p>Plutôt que de chercher \(\hat f^*\) parmi toutes les fonctions mesurables, on restreint la recherche à un sous-ensemble \(\mathcal H\subset\mathcal F\) (une famille de modèles). Ce choix, fait avant de voir les données, est le <b>biais inductif</b>. Exemple : les classifieurs linéaires \(\{x\mapsto\phi(\langle w,x\rangle+b)\}\) ; avec \(\phi=\) identité et le coût quadratique, c'est la régression linéaire.</p>`)}
` },
      { id: 'knn', t: 'Les K plus proches voisins', sub: 'Prédire comme ses voisins', html: R`
<p>Idée : un point a sans doute la même étiquette que les points qui lui ressemblent. Notons \(\mathcal N_K(x)\) les \(K\) plus proches voisins de \(x\) parmi \(x_1,\dots,x_n\) (au sens d'une distance, souvent euclidienne).</p>
${def('Algorithme des K plus proches voisins (KNN)', M(R`\begin{aligned}\text{classification (vote majoritaire)} &: f(x)=\operatorname*{arg\,max}_{k\in\mathcal Y}\sum_{i\,:\,x_i\in\mathcal N_K(x)}\mathbf 1\{y_i=k\}\\ \text{régression (moyenne)} &: f(x)=\frac1K\sum_{i\,:\,x_i\in\mathcal N_K(x)}y_i\end{aligned}`))}
${demo('knn')}
<h4>Ce qu'il faut savoir</h4>
<ul>
<li><b>Pas de paramètre à optimiser</b> : « apprendre », c'est seulement garder les données en mémoire. Méthode <b>non paramétrique</b>.</li>
<li><b>Hyperparamètres</b> : le nombre de voisins \(K\) et la distance. On choisit \(K\) sur des données de validation (leçon 2).</li>
<li><b>Rôle de K</b> : \(K=1\) donne une erreur nulle sur les données d'apprentissage (chaque point est son propre voisin), donc du <b>sur-apprentissage</b>. \(K=n\) prédit toujours la classe majoritaire : <b>sous-apprentissage</b>. Quand K diminue, la variance augmente et le biais diminue.</li>
<li><b>Coût de calcul</b> d'une prédiction : \(n\) distances en \(O(nd)\), puis recherche des K plus petites en \(O(n\log K)\). Les KNN souffrent du <b>fléau de la dimension</b> : en grande dimension, tous les points sont loin les uns des autres.</li>
<li>Il faut <b>standardiser</b> les variables : sinon la variable de plus grande échelle domine la distance (normalisation min-max \((x-\min)/(\max-\min)\) dans le TP sur iris).</li>
<li><b>Variante pondérée</b> (examen 2025) : chaque voisin vote avec un poids \(\exp(-d_i(x)^2/h)\), les voisins proches comptent plus. \(h\) grand : KNN classique ; \(h\) petit : presque 1-NN.</li>
</ul>
${ex('TP 1-2', '<p>Évalué sur les données d\'apprentissage, le 1-NN a un taux d\'erreur nul ; sur des données mises de côté, il ne l\'est plus. Avec K égal à la taille de l\'apprentissage, toutes les prédictions sont l\'espèce majoritaire.</p>')}
` },
    ],
    keep: [
      'Supervisé : données étiquetées ; régression si 𝒴 continu, classification si 𝒴 fini.',
      'Risque R(f) = E[ℓ(Y, f(X))] ; on minimise à la place le risque empirique (1/n) Σ ℓ(yᵢ, f(xᵢ)).',
      'Coût 0/1 ⇒ classifieur de Bayes : la classe la plus probable sachant x.',
      'KNN : vote des K plus proches voisins ; K = 1 sur-apprend, K = n sous-apprend ; standardiser les variables.',
    ],
  },

  /* ===================================================================== */
  {
    id: 'l2', ch: 'eval', short: 'Évaluer', src: 'CM 1',
    t: 'Évaluer et sélectionner un modèle',
    sub: 'Généralisation, compromis biais-variance, découpage apprentissage / validation / test, validation croisée et métriques de classification.',
    goals: [
      'Expliquer sur-apprentissage, sous-apprentissage et compromis biais-variance.',
      'Distinguer paramètres et hyperparamètres, et le rôle des jeux d\'apprentissage, de validation et de test.',
      'Décrire la validation croisée K-fold.',
      'Calculer les métriques d\'une matrice de confusion, y compris en multiclasse (macro et micro).',
    ],
    sections: [
      { id: 'gen', t: 'Généralisation et biais-variance', sub: 'Bien prédire sur des données jamais vues', html: R`
<p>Un modèle est bon s'il <b>généralise</b> : il prédit bien des données qui n'ont pas servi à le construire. L'erreur sur les données d'apprentissage est trop optimiste.</p>
${def('Sur-apprentissage et sous-apprentissage', '<ul><li><b>Sur-apprentissage</b> : le modèle est trop complexe, il « colle » aux données d\'apprentissage et capture le bruit. Excellent sur l\'apprentissage, mauvais sur de nouvelles données.</li><li><b>Sous-apprentissage</b> : le modèle est trop simple, mauvais même sur les données d\'apprentissage.</li></ul>')}
${def('Biais et variance', '<p>Le <b>biais</b> mesure à quel point le modèle vise à côté de la vraie étiquette en moyenne. La <b>variance</b> mesure à quel point le modèle change quand les données d\'apprentissage changent. Un modèle simple a un biais fort et une variance faible ; un modèle complexe, l\'inverse.</p>')}
${demo('biasvar')}
${prop('Le compromis', '<p>Augmenter la complexité (K petit pour les KNN, arbre profond, C grand pour les SVM…) fait baisser le biais et monter la variance. On cherche le niveau de complexité qui minimise l\'erreur sur des données <b>nouvelles</b>.</p>')}
` },
      { id: 'decoupe', t: 'Apprentissage, validation, test', sub: 'Paramètres et hyperparamètres', html: R`
<table class="t"><thead><tr><th>Données d'apprentissage</th><th>Données de validation</th><th>Données de test</th></tr></thead><tbody>
<tr><td>On apprend un ou des modèles : on ajuste leurs <b>paramètres</b>.</td><td>On compare les modèles appris pour garder le meilleur : on choisit les <b>hyperparamètres</b>.</td><td>On évalue la performance finale du modèle sélectionné sur des données <b>jamais vues</b>.</td></tr></tbody></table>
${ex('régression linéaire', R`<p>Avec \(x=(x_1,x_2)\in\mathbb R^2\) : modèle 1 \(f_1(x)=\beta_0+\beta_1x_1\), modèle 2 \(f_2(x)=\beta_0+\beta_1x_1+\beta_2x_2\). <b>Apprendre</b> = trouver les \(\beta\) qui minimisent l'erreur empirique (coût quadratique) sur l'apprentissage. <b>Sélectionner l'hyperparamètre</b> = choisir les variables explicatives, donc choisir entre les modèles 1 et 2 selon leur capacité à bien prédire sur la validation.</p>`)}
${ex('K plus proches voisins', R`<p>Modèle 1 : \(K=K_1\) ; modèle 2 : \(K=K_2\). Apprendre = déterminer, pour tout \(x\), ses \(K_1\) (ou \(K_2\)) plus proches voisins parmi l'apprentissage : il n'y a pas de paramètre à optimiser. Sélectionner = garder la valeur de K qui a les meilleures performances sur la validation.</p>`)}
${warn('vocabulaire', '<p>Les noms « validation » et « test » sont parfois inversés dans la littérature. Ce qui compte : le jeu qui sert à <b>choisir</b> ne peut pas servir à <b>évaluer</b> le modèle choisi. Avec seulement deux jeux, c\'est le second qui sert à sélectionner.</p>')}
` },
      { id: 'cv', t: 'Validation croisée', sub: 'Utiliser toutes les données pour choisir', html: R`
${method('Validation croisée K-fold', '<ol><li>Découper les données en K parties (plis) de même taille.</li><li>Pour chaque pli k : entraîner le modèle sur les K − 1 autres plis, l\'évaluer sur le pli k.</li><li>Moyenner les K scores.</li><li>Recommencer pour chaque valeur d\'hyperparamètre, garder la meilleure, puis réentraîner sur toutes les données.</li></ol>')}
${demo('kfold')}
<ul><li><b>Holdout</b> : un seul découpage. Jeu de validation trop petit : estimation très variable ; trop grand : le modèle apprend sur trop peu de données.</li>
<li><b>Leave-p-out</b> : on teste toutes les façons de mettre p points de côté, soit \(\binom np\) entraînements ; <b>leave-one-out</b> (p = 1) : n entraînements.</li></ul>
` },
      { id: 'metriques', t: 'Métriques de classification', sub: 'Matrice de confusion, sensibilité, spécificité…', html: R`
<p>Convention du cours (comme <code>table(pred, réel)</code> en R) : lignes = classe prédite, colonnes = classe réelle.</p>
<table class="t"><thead><tr><th></th><th>réel 0 (négatif)</th><th>réel 1 (positif)</th></tr></thead><tbody>
<tr><th>prédit 0</th><td>TN (vrais négatifs)</td><td>FN (faux négatifs)</td></tr>
<tr><th>prédit 1</th><td>FP (faux positifs)</td><td>TP (vrais positifs)</td></tr></tbody></table>
${M(R`\begin{aligned}\text{Accuracy}&=\frac{TP+TN}{TP+TN+FP+FN} & \text{Précision}&=\frac{TP}{TP+FP}\\ \text{Sensibilité (rappel, TPR)}&=\frac{TP}{TP+FN} & \text{Spécificité (TNR)}&=\frac{TN}{TN+FP}\\ F_1&=\frac{2\,P\,R}{P+R}=\frac{2\,TP}{2\,TP+FP+FN} & 1-\text{spécificité}&=\frac{FP}{FP+TN}=\text{FPR}\end{aligned}`)}
${warn('classes déséquilibrées', '<p>Avec 95 % de négatifs, prédire toujours « négatif » donne 95 % d\'accuracy… et une sensibilité nulle. À l\'inverse, tout prédire positif donne une sensibilité de 1. Il faut toujours regarder plusieurs métriques. La sensibilité est prioritaire quand rater un positif coûte cher (dépistage, fraude).</p>')}
<h4>Multiclasse</h4>
<p>On calcule les scores de chaque classe en « one-versus-all » (la classe k contre toutes les autres), puis on les combine : <b>macro-average</b> = moyenne simple des scores par classe (ne néglige pas les classes rares) ; <b>weighted-average</b> = moyenne pondérée par l'effectif de chaque classe ; <b>micro-average</b> = on somme les TP, FP… de toutes les classes avant de calculer (la micro-précision vaut l'accuracy).</p>
${ex('précision macro contre micro (exercice du cours)', '<p>Situation 1 (TP/FP par classe) : A 1/1, B 10/90, C 1/1, D 1/1. Précisions 0,5 ; 0,1 ; 0,5 ; 0,5 → <b>macro = 0,4</b> ; <b>micro = 13/106 ≈ 0,123</b>.<br>Situation 2 : A 0/2, B 90/10, C 0/2, D 0/2 → 0 ; 0,9 ; 0 ; 0 → <b>macro = 0,225</b> ; <b>micro = 90/106 ≈ 0,849</b>.<br>Le micro est dominé par la grosse classe B ; le macro révèle les mauvaises performances sur les classes rares.</p>')}
<p>En régression, on utilise l'erreur quadratique moyenne \(\mathrm{MSE}=\frac1n\sum_i(y_i-f(x_i))^2\) et \(\mathrm{RMSE}=\sqrt{\mathrm{MSE}}\).</p>
` },
    ],
    keep: [
      'Paramètres : appris sur l\'apprentissage ; hyperparamètres : choisis sur la validation ; test : évaluation finale.',
      'Complexité ↑ : biais ↓, variance ↑. On vise l\'erreur minimale sur des données nouvelles.',
      'K-fold : K entraînements sur K − 1 plis, évaluation sur le pli restant, moyenne des scores.',
      'Sensibilité = TP/(TP+FN), spécificité = TN/(TN+FP), précision = TP/(TP+FP).',
    ],
  },

  /* ===================================================================== */
  {
    id: 'l3', ch: 'reglog', short: 'Régression logistique', src: 'CM 2',
    t: 'Classifieurs linéaires et régression logistique',
    sub: 'Séparer les classes par un hyperplan : classifieur des demi-espaces, puis régression logistique, courbe ROC et multiclasse.',
    goals: [
      'Définir un classifieur linéaire comme la composée d\'une fonction affine et d\'une fonction φ.',
      'Savoir de quel côté d\'un hyperplan se trouve un point, et le démontrer.',
      'Justifier le coût logistique et écrire le problème d\'optimisation de la régression logistique.',
      'Construire une courbe ROC à la main et interpréter l\'AUC.',
      'Comparer les stratégies multiclasses one-versus-all et one-versus-one.',
    ],
    sections: [
      { id: 'lineaire', t: 'Qu\'est-ce qu\'un classifieur linéaire ?', sub: 'Une frontière de décision qui est un hyperplan', html: R`
${def('Classifieur linéaire', R`<p>En classification binaire, un classifieur linéaire découpe \(\mathcal X=\mathbb R^d\) en deux parties séparées par un <b>hyperplan</b> (une droite quand \(d=2\)) : d'un côté les points reçoivent l'étiquette 0, de l'autre l'étiquette 1. Autrement dit, <b>la frontière de décision est un hyperplan</b>.</p>`)}
<p>Plutôt que de chercher \(\hat f^*\) parmi toutes les fonctions, on la cherche dans un sous-ensemble \(\mathcal H\) (biais inductif). Un classifieur linéaire a deux parties :</p>
<ol><li>une partie qui <b>fixe un hyperplan</b> : les fonctions affines \(L_d=\{h_{w,b}:x\mapsto\langle w,x\rangle+b,\ w\in\mathbb R^d,\ b\in\mathbb R\}\). À chaque \(h_{w,b}\) on associe l'hyperplan d'équation \(\langle w,x\rangle+b=0\), et \(h_{w,b}(x)\) renseigne sur la position de \(x\) par rapport à lui ;</li>
<li>une fonction \(\phi\) qui transforme cette position en étiquette.</li></ol>
${def('Classes d\'hypothèses', M(R`\mathcal H_\phi=\big\{x\mapsto\phi\circ h_{w,b}(x),\ h_{w,b}\in L_d\big\},\qquad \phi:\mathbb R\to\mathcal Y`) + '<p>Le choix de φ dépend du problème (classification ou régression) et de la fonction de coût.</p>')}
<p>Une fois φ fixée, apprendre revient à trouver les paramètres de l'hyperplan :</p>
${M(R`(\hat w,\hat b)=\operatorname*{arg\,min}_{w\in\mathbb R^d,\,b\in\mathbb R}\ \frac1n\sum_{i=1}^n\ell\Big(y_i,\ \phi\big(\langle w,x_i\rangle+b\big)\Big)\qquad(1)`)}
${prop('Quand utiliser un classifieur linéaire ?', '<p>Quand les données semblent (à peu près) <b>linéairement séparables</b>. En dimension 2 on le voit sur un graphique ; en dimension plus grande c\'est difficile, d\'où l\'importance de l\'avis d\'experts. Si les données sont loin d\'être séparables, on préfère un classifieur non linéaire.</p>')}
<table class="t"><thead><tr><th>Classifieurs linéaires</th><th>Classifieurs non linéaires</th></tr></thead><tbody>
<tr><td>régression logistique ; SVM (marge rigide, marge souple)</td><td>KNN ; arbres de décision (CART) ; SVM à noyau</td></tr></tbody></table>
<p>Remarque : quand \(d=2\), la droite \(\langle w,x\rangle+b=0\) a pour pente \(-w_1/w_2\) et pour ordonnée à l'origine \(-b/w_2\).</p>
` },
      { id: 'geometrie', t: 'Géométrie de l\'hyperplan', sub: 'w est orthogonal à l\'hyperplan ; le signe de ⟨w,x⟩+b donne le côté', html: R`
<p>Dans ce chapitre, \(\mathcal Y=\{-1,1\}\) « sans perte de généralité ». On se place dans \(\mathbb R^2\), avec \(w\) et \(b\) fixés.</p>
<ul><li>Les points \(x=(x_1,x_2)\) tels que \(\langle w,x\rangle+b=0\) forment la droite \(D\) d'équation \(x_2=-\frac{w_1}{w_2}x_1-\frac{b}{w_2}\).</li>
<li><b>\(w\) est orthogonal à \(D\)</b> : pour deux points \(a,c\in D\), le vecteur directeur \(a-c\) vérifie \(\langle a-c,w\rangle=\langle a,w\rangle+b-(\langle c,w\rangle+b)=0-0=0\).</li></ul>
${prop('Propriété', R`<p>Soit \(D\) la droite d'équation \(\langle w,x\rangle+b=0\) et \(x\in\mathcal X\). Alors</p><ol><li>\(\langle w,x\rangle+b>0\iff x\) est <b>au-dessus</b> de \(D\) (du côté où pointe \(w\)) ;</li><li>\(\langle w,x\rangle+b<0\iff x\) est <b>en dessous</b> de \(D\).</li></ol>`)}
${proof('Démonstration (faite en cours)', R`<p>Soit \(p\) le projeté orthogonal de \(x\) sur \(D\). Les vecteurs \(\vec{px}\) et \(\vec w\) sont colinéaires (tous deux orthogonaux à \(D\)), donc il existe \(k\in\mathbb R\) tel que \(\vec{px}=k\,\vec w\). Si \(k>0\), \(\vec{px}\) et \(\vec w\) ont le même sens : \(x\) est au-dessus de \(D\) ; si \(k<0\), \(x\) est en dessous. Il reste à trouver \(k\).</p>${M(R`\begin{aligned}\vec{px}=k\,w &\iff x-p=k\,w\iff p=x-k\,w\\ p\in D &\iff \langle w,x-kw\rangle+b=0\iff\langle w,x\rangle-k\langle w,w\rangle+b=0\\ &\iff k=\frac{\langle w,x\rangle+b}{\|w\|^2}\end{aligned}`)}<p>Comme \(\|w\|^2>0\), \(k\) a le signe de \(\langle w,x\rangle+b\) : \(k>0\iff\langle w,x\rangle+b>0\). De plus \(\|\vec{px}\|=|k|\,\|w\|=\frac{|\langle w,x\rangle+b|}{\|w\|}\) : plus \(|\langle w,x\rangle+b|\) est grand, plus \(x\) est loin de l'hyperplan (cette distance resservira pour les SVM).</p>`)}
` },
      { id: 'demi', t: 'Le classifieur des demi-espaces', sub: 'φ = signe, coût 0/1', html: R`
${def('Classifieur des demi-espaces', R`<p>On prend \(\phi(z)=\mathrm{sign}(z)\) avec \(\mathrm{sign}(z)=-1\) si \(z<0\) et \(1\) si \(z\ge0\). On prédit l'étiquette selon le côté de l'hyperplan. Le coût naturel est le <b>coût 0/1</b> : \(\ell(y,y')=\mathbf 1\{y\neq y'\}\).</p>`)}
${M(R`(\hat w,\hat b)=\operatorname*{arg\,min}_{w\in\mathbb R^d,\,b\in\mathbb R}\ \frac1n\sum_{i=1}^n\mathbf 1\big\{y_i\neq\mathrm{sign}(\langle w,x_i\rangle+b)\big\}`)}
<p>Comment minimiser cela ? On remarque que \(y\,(\langle w,x\rangle+b)\) est <b>positif si le point est bien classé</b> et négatif sinon. D'où la reformulation, un peu plus facile à manipuler (mais il reste une indicatrice, non dérivable) :</p>
${M(R`(\hat w,\hat b)=\operatorname*{arg\,min}_{w,b}\ \frac1n\sum_{i=1}^n\mathbf 1\big\{y_i(\langle w,x_i\rangle+b)<0\big\}`)}
<p>Pour une nouvelle observation \(x\), on prédit \(\hat y=1\) si \(\langle\hat w,x\rangle+\hat b>0\). Les paramètres optimaux dépendent des données d'apprentissage.</p>
` },
      { id: 'sigmoide', t: 'La fonction sigmoïde', sub: 'Nuancer la confiance dans l\'étiquette', html: R`
<p>Au lieu de \(\phi(z)=\mathrm{sign}(z)\in\{-1,1\}\), la régression logistique prend la <b>fonction sigmoïde</b>, qui renvoie un nombre dans \([0,1]\) pour nuancer la confiance dans l'étiquetage :</p>
${M(R`\phi_{sig}(z)=\frac{1}{1+\exp(-z)},\qquad z\in\mathbb R`)}
<p>\(\phi_{sig}\) est croissante, \(\lim_{z\to-\infty}\phi_{sig}(z)=0\), \(\lim_{z\to+\infty}\phi_{sig}(z)=1\) et \(\phi_{sig}(0)=1/2\).</p>
<table class="t"><thead><tr><th>\(z=\langle w,x\rangle+b\)</th><th>Position de \(x\)</th><th>\(\phi_{sig}(z)\)</th></tr></thead><tbody>
<tr><td>\(>0\) et très grand</td><td>au-dessus de H et loin</td><td>proche de 1</td></tr>
<tr><td>\(<0\) et \(|z|\) très grand</td><td>en dessous de H et loin</td><td>proche de 0</td></tr>
<tr><td>proche de 0</td><td>proche de H (au-dessus si z > 0, en dessous si z < 0)</td><td>proche de 1/2</td></tr></tbody></table>
<p>Pourquoi « loin » ? Avec la démonstration précédente, \(\vec{px}=k\,w\) avec \(k=\frac{\langle w,x\rangle+b}{\|w\|^2}\) : plus \(|k|\) est grand, plus \(x\) est loin de H.</p>
${prop('Règle de décision', R`${M(R`\hat y=\begin{cases}1 & \text{si } \phi_{sig}(\langle w,x\rangle+b)\ge0{,}5\\ -1 & \text{si } \phi_{sig}(\langle w,x\rangle+b)<0{,}5\end{cases}`)}<p>C'est la même étiquette que le classifieur des demi-espaces, mais nuancée : si \(x\) est proche de l'hyperplan (\(\phi_{sig}\approx1/2\)), on n'est pas très confiant dans la classification ; s'il est loin (\(\phi_{sig}\approx0\) ou 1), on est confiant. \(\phi_{sig}(\langle w,x\rangle+b)\) s'interprète comme la <b>probabilité que l'étiquette de x soit 1</b> (« mais ce n'est pas une proba » au sens strict, précise le cours).</p>`)}
` },
      { id: 'cout', t: 'Le coût logistique', sub: 'Pénaliser selon la position et la distance à l\'hyperplan', html: R`
<p>φ étant choisie, quel coût \(\ell\) prendre ? Pour \((x,y)\in\mathcal X\times\mathcal Y\), on veut :</p>
<ul><li>pénaliser quand \(y(\langle w,x\rangle+b)<0\) (mauvais étiquetage) ;</li>
<li>pénaliser <b>d'autant plus</b> que \(|y(\langle w,x\rangle+b)|\) est grand quand l'étiquetage est mauvais (x loin de l'hyperplan, du mauvais côté) ;</li>
<li>pénaliser <b>un peu</b> un point bien étiqueté mais proche de l'hyperplan (\(|y(\langle w,x\rangle+b)|\) proche de 0).</li></ul>
<p>La pénalisation ne dépend donc plus seulement de la position de x par rapport à l'hyperplan, mais aussi de sa <b>distance</b> à l'hyperplan.</p>
${proof('Dérivation du coût (faite en cours) : les cas y = 1 et y = −1', R`<p><b>Cas \(y=1\).</b> On veut \(\phi_{sig}(\langle w,x\rangle+b)=\frac{1}{1+e^{-(\langle w,x\rangle+b)}}=\frac{1}{1+e^{-y(\langle w,x\rangle+b)}}\) le plus proche possible de 1, donc \(1+e^{-y(\langle w,x\rangle+b)}\) le plus petit possible : on pénalise quand cette quantité est grande.</p><p><b>Cas \(y=-1\).</b> On veut \(\phi_{sig}(\langle w,x\rangle+b)\) proche de 0, c'est-à-dire \(1-\phi_{sig}\) proche de 1. Or</p>${M(R`1-\phi_{sig}(z)=\frac{1+e^{-z}-1}{1+e^{-z}}=\frac{1}{e^{z}+1}=\frac{1}{1+e^{-y z}}\quad(y=-1).`)}<p>Dans les deux cas on veut pénaliser quand \(1+\exp(-y(\langle w,x\rangle+b))\) est grand. On prend une fonction croissante de cette quantité : le <b>logarithme</b>.</p>`)}
${def('Régression logistique', M(R`(\hat w,\hat b)=\operatorname*{arg\,min}_{w\in\mathbb R^d,\,b\in\mathbb R}\ \frac1n\sum_{i=1}^n\log\Big(1+\exp\big(-y_i\,[\langle w,x_i\rangle+b]\big)\Big)`) + R`<p>Pour une nouvelle observation, \(\hat y=1\) si \(\phi_{sig}(\langle\hat w,x\rangle+\hat b)\ge0{,}5\), \(\hat y=-1\) sinon.</p>`)}
<p>Allure de \(z\mapsto\log(1+\exp(-yz))\) : pour \(y=1\), le coût est grand quand \(z<0\) (on étiquette −1 à tort), petit mais non nul pour \(z\) légèrement positif (bien étiqueté mais proche de l'hyperplan), et tend vers 0 quand \(z\to+\infty\). Pour \(y=-1\), c'est le symétrique.</p>
${demo('loss')}
${demo('sigmoid')}
` },
      { id: 'seuil', t: 'Le seuil de décision α', sub: 'Choisir le niveau de confiance minimal', html: R`
<p>Plus généralement, on peut décider \(\hat y=1\) si \(\phi_{sig}(\langle\hat w,x\rangle+\hat b)\ge\alpha\), avec \(\alpha\in\,]0,1[\). Le seuil α est le <b>niveau de confiance minimal</b> qu'on accepte pour décider \(\hat y=1\).</p>
${ex('α < 0,5', R`<p>On prédit 1 plus facilement. Cela a du sens quand on préfère prédire \(\hat y=1\) alors que \(y=-1\) plutôt que l'inverse, c'est-à-dire quand on veut limiter le risque de mal classer une observation d'étiquette 1. Exemple : prédire une maladie.</p>`)}
${prop('Demi-espaces contre régression logistique', '<p>Le classifieur des demi-espaces ne pénalise que les points mal étiquetés : son hyperplan peut frôler les points, d\'où un <b>risque de sur-apprentissage</b>. La régression logistique pénalise aussi les points bien étiquetés mais proches de l\'hyperplan : elle l\'éloigne des points, ce qui permet d\'éviter un peu plus l\'écueil du sur-apprentissage.</p>')}
` },
      { id: 'roc', t: 'Courbe ROC et AUC', sub: 'Les performances quand le seuil α varie', html: R`
<p>Une fois \((w,b)\) ajustés, on peut évaluer le modèle avec les métriques de la leçon 2. Mais elles dépendent du seuil α. On regarde donc comment évoluent les performances quand α varie, ce qui permet aussi de comparer des modèles (par exemple un modèle à 2 variables explicatives et un modèle à 3).</p>
<ul><li><b>Sensibilité</b> \(=\frac{TP}{TP+FN}\) : taux de vrais positifs (parmi les observations réellement positives). Si on perd un TP, on gagne un FN, et inversement.</li>
<li><b>1 − spécificité</b> \(=1-\frac{TN}{FP+TN}=\frac{FP}{FP+TN}\) : taux de faux positifs (parmi les observations réellement négatives). Si on perd un TN, on gagne un FP, et inversement.</li>
<li>Quand α est <b>haut</b> : moins de TP et de FP, plus de FN et de TN → sensibilité ↓ et 1 − spécificité ↓.</li>
<li>Quand α est <b>bas</b> : plus de TP et de FP → sensibilité ↑ et 1 − spécificité ↑.</li></ul>
${method('Construire la courbe ROC (faite en cours)', R`<p>Sur un jeu de validation \((x_i,y_i)_{1\le i\le m}\) avec P positifs et N négatifs :</p><ol><li>Ordonner les observations par score décroissant : \(\phi_{sig}(\langle\hat w,x_{(1)}\rangle+\hat b)\ge\phi_{sig}(\langle\hat w,x_{(2)}\rangle+\hat b)\ge\dots\)</li><li><b>Étape 0</b> : pour α plus grand que le score maximal, aucune observation n'est classée positive : TP = FP = 0, la courbe part de \((0,0)\).</li><li><b>Étape k</b> : on abaisse α jusqu'au k-ième score ; l'observation \(x_{(k)}\) passe en positive. Si son étiquette est 1, la sensibilité augmente de \(\frac1{TP+FN}=\frac1P\) (pas vers le haut) ; si son étiquette est −1, 1 − spécificité augmente de \(\frac1{FP+TN}=\frac1N\) (pas vers la droite).</li><li>À la fin, tout est positif : on arrive en \((1,1)\). Si plusieurs observations ont le même score, elles basculent ensemble.</li></ol><p>La courbe ROC est donc une <b>courbe en escalier</b> construite à partir des données de validation (on la dessine souvent lissée pour l'illustration). L'<b>AUC</b> est l'aire sous cette courbe : \(0\le\text{AUC}\le1\).</p>`)}
${ex('construire la ROC (exercice du cours)', R`<p>Jeu de validation de 6 observations :</p><table class="t"><thead><tr><th></th><th>\(x_1\)</th><th>\(x_2\)</th><th>\(x_3\)</th><th>\(x_4\)</th><th>\(x_5\)</th><th>\(x_6\)</th></tr></thead><tbody><tr><th>vraie étiquette</th><td>1</td><td>−1</td><td>1</td><td>1</td><td>−1</td><td>1</td></tr><tr><th>score</th><td>0,9</td><td>0,8</td><td>0,6</td><td>0,4</td><td>0,3</td><td>0,1</td></tr></tbody></table><p>P = 4, N = 2 : un positif fait monter de 1/4, un négatif avance de 1/2.</p><table class="t"><thead><tr><th>seuil α</th><th>> 0,9</th><th>]0,8 ; 0,9]</th><th>]0,6 ; 0,8]</th><th>]0,4 ; 0,6]</th><th>]0,3 ; 0,4]</th><th>]0,1 ; 0,3]</th><th>≤ 0,1</th></tr></thead><tbody><tr><th>TP/P</th><td>0</td><td>1/4</td><td>1/4</td><td>1/2</td><td>3/4</td><td>3/4</td><td>1</td></tr><tr><th>FP/N</th><td>0</td><td>0</td><td>1/2</td><td>1/2</td><td>1/2</td><td>1</td><td>1</td></tr></tbody></table><p>Points successifs : (0,0) → (0, 1/4) → (1/2, 1/4) → (1/2, 1/2) → (1/2, 3/4) → (1, 3/4) → (1, 1). Aire : \(\frac12\times\frac14+\frac12\times\frac34=\frac12\), donc <b>AUC = 0,5</b> (on le retrouve en comptant les paires positif/négatif bien ordonnées : 4 sur 8).</p>`)}
${prop('Deux cas extrêmes (faits en cours)', R`<ul><li><b>Classifieur parfait</b> : il existe un seuil qui ne fait aucune erreur, c'est-à-dire \(\max(S^-)<\min(S^+)\) où \(S^+\) (resp. \(S^-\)) est l'ensemble des scores des observations positives (resp. négatives). Tous les positifs passent avant les négatifs : la courbe monte jusqu'à \((0,1)\) puis va à \((1,1)\). <b>AUC = 1</b>.</li><li><b>Classifieur aléatoire</b> : il prédit 1 avec probabilité 1/2. À chaque étape, on a autant de chances de faire un pas vers le haut (gagner un TP) que vers la droite (gagner un FP) : la courbe suit à peu près la diagonale. <b>AUC proche de 1/2</b>.</li></ul>`)}
${demo('roc')}
<h4>Choisir le seuil α avec la courbe ROC</h4>
<ul><li>Au début de la courbe (point A, pente forte), on « gagne » beaucoup de TP sans trop prendre de FP. On choisit un seuil de cette zone s'il est bien plus coûteux d'avoir un FP qu'un FN (exemple : filtre à SPAM).</li>
<li>En haut (point C, pente faible), pour gagner des TP on est obligé de gagner beaucoup de FP. On choisit un seuil de cette zone s'il est bien plus coûteux d'avoir un FN qu'un FP (exemple : détection d'un cancer).</li>
<li>Entre les deux (point B), un compromis si on n'a pas de préférence entre bien estimer une classe ou l'autre.</li></ul>
${prop('Choisir un modèle avec l\'AUC', R`<p>L'AUC calculée sur l'échantillon de <b>validation</b> sert à choisir entre plusieurs modèles, par exemple : modèle 1 avec \(x^1\), modèle 2 avec \(x^1,x^2\), modèle 3 avec \(x^1,x^2,x^3\). On garde le modèle qui <b>maximise l'AUC</b>. (On peut aussi utiliser un critère comme l'AIC, vu en S2.)</p>`)}
${demo('kaggle')}
` },
      { id: 'multi', t: 'Régression logistique multiclasse', sub: 'One-versus-all et one-versus-one', html: R`
<p>Pour \(\mathcal Y=\{1,\dots,C\}\), on combine des classifieurs binaires :</p>
${def('One versus all', R`<p>On estime <b>un modèle par classe</b>. Le j-ème classifieur \(\hat f_j\) utilise tous les exemples de la classe j comme positifs et toutes les autres observations comme négatifs. Pour une observation \(x\) de validation ou de test, chaque modèle donne un score \(\phi_j(x)=\phi_{sig}(\langle\hat w_j,x\rangle+\hat b_j)\) et on attribue la classe j de <b>score maximal</b>.</p>`)}
${def('One versus one', R`<p>On estime <b>un modèle par paire de classes</b>. Le classifieur \(\hat f_{(j,k)}\) sépare la classe j de la classe k ; il est estimé uniquement avec les données de ces deux classes. Pour une nouvelle observation, on attribue la classe <b>la plus souvent choisie</b> par l'ensemble des classifieurs (vote).</p>`)}
${ex('réponse à la question du cours', R`<table class="t"><thead><tr><th></th><th>One versus all</th><th>One versus one</th></tr></thead><tbody><tr><th>nombre de classifieurs</th><td>\(C\)</td><td>\(\binom C2=\frac{C(C-1)}2\)</td></tr><tr><th>données utilisées pour chacun</th><td>toutes (classe j = positifs, le reste = négatifs)</td><td>seulement celles des 2 classes de la paire</td></tr></tbody></table>`)}
<p>Pour information : au lieu de plusieurs modèles binaires, la <b>régression softmax</b> généralise directement la régression logistique au cas multiclasse avec un seul modèle global.</p>
` },
    ],
    keep: [
      'Classifieur linéaire : φ(⟨w,x⟩ + b) ; w est orthogonal à l\'hyperplan ; le signe de ⟨w,x⟩ + b donne le côté.',
      'Distance à l\'hyperplan : |⟨w,x⟩ + b| / ‖w‖.',
      'Logistique : σ(z) = 1/(1 + e^(−z)) ; coût (1/n) Σ log(1 + exp(−yᵢ(⟨w,xᵢ⟩ + b))) ; ŷ = 1 si σ ≥ α.',
      'ROC : sensibilité en fonction de 1 − spécificité quand α varie ; parfait AUC = 1, aléatoire AUC ≈ 0,5.',
      'OvA : C modèles sur toutes les données ; OvO : C(C − 1)/2 modèles sur les paires.',
    ],
  },

  /* ===================================================================== */
  {
    id: 'l4', ch: 'cart', short: 'Arbres CART', src: 'CM 3',
    t: 'Les arbres de décision et l\'algorithme CART',
    sub: 'Une suite de tests sur une variable à la fois : construction gloutonne, critères d\'impureté, taille de l\'arbre et élagage.',
    goals: [
      'Définir un arbre de décision et citer ses atouts par rapport aux KNN et à la régression logistique.',
      'Décrire le fonctionnement de CART : arbre binaire, une variable par nœud, règle d\'agrégation.',
      'Calculer Gini, entropie, erreur de classification et gain d\'information d\'une coupure.',
      'Contrôler la taille de l\'arbre par validation croisée ou par élagage.',
    ],
    sections: [
      { id: 'motivation', t: 'Pourquoi des arbres ?', sub: 'Des classes multimodales, des tests successifs', html: R`
<p>Les KNN et la régression logistique étiquettent une observation <b>en une seule étape</b> : ils utilisent le même ensemble de variables pour toutes les classes et leur accordent la même importance pour toutes les observations. Ce n'est pas adapté quand les classes ont une distribution <b>multimodale</b> : selon la région de l'espace, elles sont déterminées par des variables différentes. Exemple : les symptômes d'une maladie ne sont pas les mêmes selon l'âge.</p>
<p>Les arbres de décision sont des modèles <b>hiérarchiques</b> qui se comportent comme une série de tests conditionnels, chaque test dépendant des tests précédents et de leur résultat.</p>
${def('Arbre de décision', '<p>Modèle de prédiction représenté sous la forme d\'un arbre. Chaque <b>nœud</b> teste une condition sur <b>une seule variable</b> et chacun de ses enfants correspond à une réponse possible à cette condition. Les <b>feuilles</b> correspondent à une étiquette.</p>')}
${ex('les fruits (Azencott)', '<p>Couleur ? <b>rouge</b> → Taille ? (grande → <b>pomme</b> ; petite → Forme ? ronde → <b>cerise</b>, pointue → <b>fraise</b>) ; <b>jaune</b> → Forme ? (ovale → <b>citron</b>, ronde → <b>pomme</b>, incurvée → <b>banane</b>).</p>')}
${prop('Atouts des arbres', '<ul><li>Ils traitent des <b>variables qualitatives</b> (taille, couleur du fruit) sans représentation numérique : apprentissage <b>non métrique</b>, adapté aux données hétérogènes (quantitatives et qualitatives).</li><li>Ils traitent la classification <b>multiclasse</b> directement, sans passer par des classifications binaires.</li><li>Ils traitent les classes <b>multimodales</b> : « pomme » est donnée à un fruit grand et rouge ou à un fruit jaune et rond.</li></ul><p>À comparer : les KNN et la régression logistique ont besoin de variables numériques (encodage), et la logistique passe par OvA ou OvO en multiclasse.</p>')}
` },
      { id: 'cart', t: 'L\'algorithme CART', sub: 'Classification and Regression Tree', html: R`
${def('CART', R`<p>Algorithme de partitionnement de l'espace par une approche <b>gloutonne, récursive et divisive</b>, qui apprend un <b>arbre binaire</b> à partir des données d'apprentissage \((x_1,y_1),\dots,(x_n,y_n)\).</p>`)}
<ol><li><b>Chaque nœud sépare linéairement</b> le jeu de données et a exactement deux enfants. Pas de perte de généralité : tout arbre peut être réécrit sous forme binaire (« Rouge ? oui / non », « Incurvé ? oui / non »…).</li>
<li><b>Une seule variable par nœud</b>. Pour une variable numérique, la frontière de décision produite est orthogonale à l'axe de cette variable.</li>
<li>Dans les feuilles, une <b>règle d'agrégation</b> donne l'étiquette : vote en classification, moyenne en régression.</li></ol>
<p>La construction est itérative, nœud par nœud, en partant de la racine.</p>
<h4>La coupure selon le type de variable</h4>
<p>À chaque nœud correspond une <b>variable séparatrice</b> \(x^j\) qui définit deux régions \(R_l\) et \(R_m\) (les deux enfants) :</p>
<table class="t"><thead><tr><th>Variable \(x^j\)</th><th>\(R_l\)</th><th>\(R_m\)</th></tr></thead><tbody>
<tr><td>binaire (quali ou quanti)</td><td>\(x^j=1\)</td><td>\(x^j=0\)</td></tr>
<tr><td>qualitative nominale (sous-ensemble \(S\) de modalités, souvent une seule)</td><td>\(x^j\in S\)</td><td>\(x^j\notin S\)</td></tr>
<tr><td>quantitative continue (point de séparation \(s\))</td><td>\(x^j<s\)</td><td>\(x^j\ge s\)</td></tr>
<tr><td>qualitative ordinale</td><td colspan="2">par seuil en respectant l'ordre, ou par regroupement de modalités</td></tr>
<tr><td>quantitative discrète</td><td colspan="2">par seuil en général ; regroupement si peu de valeurs (on perd alors l'ordre)</td></tr></tbody></table>
` },
      { id: 'frontieres', t: 'Des frontières orthogonales aux axes', sub: 'L\'exemple des notes en maths et en informatique', html: R`
<p>Données du cours : 45 étudiants, notes en informatique (X[0]) et en mathématiques (X[1]), réussite ou échec. Chaque nœud produit une frontière orthogonale à un axe ; avec une profondeur 1, 2 puis 3, la partition s'affine.</p>
${ex('l\'arbre obtenu', '<ul><li>Racine : X[1] ≤ 8,063 ; gini = 0,48 ; 45 individus ; [27, 18].</li><li>Oui : feuille pure [19, 0] (gini = 0).</li><li>Non : X[0] ≤ 10,933 ; gini = 0,426 ; [8, 18]. Oui → X[1] ≤ 17,946 ; gini = 0,397 ; [8, 3], qui donne deux feuilles pures [8, 0] et [0, 3]. Non → feuille pure [0, 15].</li></ul>')}
${prop('Remarques', R`<ul><li>L'algorithme construit non pas un mais <b>plusieurs séparateurs linéaires</b>, ce qui donne une frontière de décision <b>non linéaire</b>.</li><li>Des séparateurs parallèles aux axes favorisent l'<b>interprétabilité</b>.</li><li>Chaque point de \(\mathcal X\) appartient à une unique région à un instant donné. Un arbre partitionne \(\mathcal X\) en <b>autant de régions qu'il a de feuilles</b>.</li></ul>`)}
${demo('cart')}
${ex('quel arbre pour cette partition ? (exercice du cours)', R`<p>Le carré est coupé par une ligne horizontale \(x_2=v_2\) sur toute sa largeur. En dessous : une ligne verticale \(x_1=u_2\) sépare \(R_1\) (à gauche) d'une partie droite, elle-même coupée en \(x_2=v_1\) entre \(R_3\) (en bas) et \(R_5\). Au-dessus : une verticale \(x_1=u_1\) sépare \(R_2\) et \(R_4\). L'arbre :</p><ul><li>\(x_2<v_2\) ? <b>oui</b> → \(x_1<u_2\) ? oui → \(R_1\) ; non → \(x_2<v_1\) ? oui → \(R_3\), non → \(R_5\).</li><li><b>non</b> → \(x_1<u_1\) ? oui → \(R_2\) ; non → \(R_4\).</li></ul><p>5 régions, donc 5 feuilles.</p>`)}
` },
      { id: 'agregation', t: 'La règle d\'agrégation', sub: 'Vote ou moyenne dans chaque feuille', html: R`
<p>Supposons que l'algorithme a partitionné les données en \(r\) régions \(R_1,\dots,R_r\). Toutes les observations d'une même feuille reçoivent la même étiquette.</p>
${M(R`\begin{aligned}\text{classification} &: f(x)=\sum_{j=1}^r\mathbf 1\{x\in R_j\}\ \operatorname*{arg\,max}_{k\in\{1,\dots,C\}}\sum_{i\,:\,x_i\in R_j}\mathbf 1\{y_i=k\}\\ \text{régression} &: f(x)=\sum_{j=1}^r\mathbf 1\{x\in R_j\}\ \frac1{|R_j|}\sum_{i\,:\,x_i\in R_j}y_i\end{aligned}`)}
<p>En classification, on prédit l'étiquette <b>majoritaire</b> parmi les observations d'apprentissage de la région ; en régression, leur <b>moyenne</b>.</p>
` },
      { id: 'impurete', t: 'Choisir la coupure : l\'impureté', sub: 'Gain d\'information, Gini, entropie, erreur', html: R`
<p>Pour un nœud, comment choisir la bonne variable séparatrice et la frontière ? En classification, pour un nœud (une région \(R\)), on choisit le découpage en \(R_l\) et \(R_m\) qui <b>maximise le gain d'information</b> : la variable \(x^j\) et le seuil (\(s\) si elle est continue, \(S\) si elle est discrète) qui maximisent</p>
${M(R`\mathcal{IG}(R_l,R_m)=\mathcal I(R)-\frac{n_l}{n}\,\mathcal I\big(R_l(x^j,\text{seuil})\big)-\frac{n_m}{n}\,\mathcal I\big(R_m(x^j,\text{seuil})\big)`)}
<p>où \(\mathcal I\) est un <b>critère d'impureté</b> (à quel point la région est « polluée » par des éléments des classes qui n'y sont pas majoritaires), \(n\) le nombre de points d'apprentissage dans \(R\), et \(n_l\), \(n_m\) ceux de \(R_l\) et \(R_m\).</p>
${def('Critères d\'impureté', R`<p>Soit \(p_k\) la proportion d'éléments de la classe \(k\) dans la région \(R\).</p>${M(R`\begin{aligned}\text{Gini} &: \mathcal I_G(R)=\sum_{k=1}^Cp_k(1-p_k)=\sum_{k=1}^C\sum_{k'\neq k}p_kp_{k'}=1-\sum_kp_k^2\\ \text{Entropie} &: \mathcal I_E(R)=-\sum_kp_k\log_2(p_k)\\ \text{Erreur de classification} &: \mathcal I_{EC}(R)=1-\max_kp_k\end{aligned}`)}<ul><li><b>Gini</b> : probabilité qu'un exemple de \(R\) soit mal étiqueté s'il était étiqueté au hasard selon la distribution des étiquettes dans \(R\).</li><li><b>Entropie</b> (mesure du désordre) : plus la région est mélangée, plus elle est élevée ; elle tend vers 0 quand la région est pure. Minimiser l'entropie revient à maximiser le gain d'information.</li><li><b>Erreur</b> : proportion d'exemples qui n'appartiennent pas à la classe majoritaire.</li></ul>`)}
${demo('impurity')}
${ex('gain d\'information de la racine', R`<p>Racine [27, 18] : \(p=(0{,}6\,;\,0{,}4)\), donc \(\mathcal I_G=1-0{,}6^2-0{,}4^2=0{,}48\) ; entropie \(=-0{,}6\log_20{,}6-0{,}4\log_20{,}4\approx0{,}971\) ; erreur \(=0{,}4\).</p><p>Coupure X[1] ≤ 8,063 : à gauche [19, 0] (Gini 0), à droite [8, 18] (Gini \(=1-(8/26)^2-(18/26)^2\approx0{,}426\)).</p>${M(R`\mathcal{IG}=0{,}48-\tfrac{19}{45}\times0-\tfrac{26}{45}\times0{,}426\approx0{,}48-0{,}246=0{,}234`)}<p>CART calcule ce gain pour chaque variable et chaque seuil possible, et garde le meilleur.</p>`)}
<h4>En régression</h4>
<p>On utilise l'erreur quadratique relativement à la moyenne, \(\mathrm{MSE}(R)=\frac1n\sum_i(y_i-\bar y)^2\), et on cherche à <b>minimiser</b> \(\frac{n_l}{n}\mathrm{MSE}(R_l)+\frac{n_m}{n}\mathrm{MSE}(R_m)\). On calcule la MSE par rapport à la moyenne car c'est justement notre prédiction dans un nœud.</p>
` },
      { id: 'taille', t: 'Quand arrêter l\'arbre ?', sub: 'Validation croisée et élagage', html: R`
<p>Si l'arbre est <b>peu profond</b>, on risque de mal modéliser le problème : <b>sous-apprentissage</b>. S'il est <b>trop profond</b>, il « colle » aux données : <b>sur-apprentissage</b>.</p>
${method('Stratégie 1 : un hyperparamètre de taille', '<p>On fixe par validation croisée l\'un des hyperparamètres suivants : profondeur maximale, nombre maximal de feuilles, nombre minimal d\'exemples dans une feuille ou un nœud.</p><p>Réponse à la question du cours : quand la profondeur augmente, le <b>biais diminue</b> et la <b>variance augmente</b>.</p>')}
${method('Stratégie 2 : l\'élagage', R`<p>Méthode de <b>régularisation</b> qui contrôle la complexité de l'arbre, mesurée par son nombre de régions.</p><ol><li>On apprend l'arbre sans limite sur l'apprentissage (les individus de chaque feuille appartiennent à la même classe).</li><li>On l'élague : on cherche le sous-arbre \(T\) qui minimise le coût en complexité ${M(R`C_\lambda(T)=\sum_{l=1}^{|T|}n_l\,\mathcal I(R_l)+\lambda|T|`)} où \(|T|\) est le nombre de régions de \(T\) et \(\lambda>0\) règle l'importance relative de l'erreur et de la complexité.</li><li>On choisit \(\lambda\) grâce à un échantillon de validation.</li></ol>`)}
${prop('Conséquences', '<ul><li>λ ↑ → arbre plus petit → biais ↑, variance ↓.</li><li>|T| = 1 : on prédit partout la classe majoritaire. Arbre maximal : erreur d\'apprentissage nulle.</li></ul>')}
${warn('apprenants faibles', '<p>Les arbres ont tendance à donner des modèles trop simples, avec des performances à peine supérieures à des modèles aléatoires et peu robustes aux variations des données : on parle d\'<b>apprenants faibles</b> (weak learners). On y remédie avec les méthodes ensemblistes (bagging, forêts aléatoires, boosting), vues dans le cours Régularisation et optimisation.</p>')}
${ex('TP 4 (rpart)', '<p><code>rpart</code> utilise Gini par défaut. Le paramètre <code>cp</code> joue le rôle de λ : <code>printcp</code> et <code>plotcp</code> donnent l\'erreur de validation croisée <code>xerror</code> ; on garde le cp qui la minimise puis <code>prune(tree, cp = bestcp)</code>.</p>')}
` },
    ],
    keep: [
      'Arbre : un test sur une seule variable par nœud ; nombre de régions = nombre de feuilles.',
      'CART : glouton, récursif, divisif, binaire ; frontières orthogonales aux axes.',
      'Feuille : vote majoritaire (classification) ou moyenne (régression).',
      'IG = I(R) − (n_l/n) I(R_l) − (n_m/n) I(R_m) ; Gini = 1 − Σ p_k², entropie = −Σ p_k log₂ p_k, erreur = 1 − max p_k.',
      'Profondeur ↑ : biais ↓, variance ↑. Élagage : C_λ(T) = Σ n_l I(R_l) + λ|T|, λ choisi sur la validation.',
    ],
  },

  /* ===================================================================== */
  {
    id: 'l5', ch: 'svm', short: 'SVM', src: 'CM 4',
    t: 'Les machines à vecteurs de support (SVM)',
    sub: 'Maximiser la marge : SVM à marge rigide, à marge souple, puis à noyau.',
    goals: [
      'Définir la séparabilité linéaire, la marge et les vecteurs de support.',
      'Écrire les problèmes primal et dual de la SVM à marge rigide et le classifieur associé.',
      'Interpréter les variables d\'ajustement ξᵢ et l\'hyperparamètre C de la marge souple ; faire le lien avec la perte hinge.',
      'Expliquer l\'astuce du noyau et reconnaître un noyau valide.',
    ],
    sections: [
      { id: 'rappel', t: 'Le problème et les classifieurs déjà vus', sub: 'Classification binaire, 𝒴 = {−1, 1}', html: R`
<p>On observe \((x_1,y_1),\dots,(x_n,y_n)\in\mathbb R^d\times\{-1,1\}\) et on veut apprendre un modèle \(f\) qui prédit au mieux l'étiquette de tout point.</p>
<ul><li><b>KNN</b> : \(f(x)=\operatorname*{arg\,max}_{k}\sum_{i\,:\,x_i\in\mathcal N_K(x)}\mathbf 1\{y_i=k\}\).</li>
<li><b>Linéaire, coût 0/1</b> : \(f(x)=\mathrm{sign}(\langle\hat w,x\rangle+\hat b)\) avec \((\hat w,\hat b)=\operatorname*{arg\,min}\frac1n\sum_i\mathbf 1\{[\langle w,x_i\rangle+b]\,y_i<0\}\).</li>
<li><b>Linéaire, coût logistique</b> : \(f(x)=\mathbf 1\{\phi_{\hat w,\hat b}(x)\ge\text{seuil}\}-\mathbf 1\{\phi_{\hat w,\hat b}(x)<\text{seuil}\}\) avec \(\phi_{\hat w,\hat b}(x)=(1+\exp(-\langle\hat w,x\rangle-\hat b))^{-1}\) et \((\hat w,\hat b)=\operatorname*{arg\,min}\frac1n\sum_i\log[1+e^{-y_i(\langle w,x_i\rangle+b)}]\).</li>
<li><b>SVM</b> : comment choisir \((\hat w,\hat b)\) ? C'est l'objet de cette leçon.</li></ul>
<p>Le choix de l'algorithme SVM dépend des données. Première étape : savoir si elles sont <b>linéairement séparables</b> ou non.</p>
` },
      { id: 'marge', t: 'Séparabilité, marge et vecteurs de support', sub: 'Choisir l\'hyperplan le plus robuste', html: R`
${def('Séparabilité linéaire', R`<p>Un jeu de données \(\{(x_i,y_i)\}_{i=1,\dots,n}\) est <b>linéairement séparable</b> s'il existe au moins un hyperplan de \(\mathbb R^d\) tel que tous les points positifs (\(y_i=1\)) sont d'un côté et tous les points négatifs (\(y_i=-1\)) de l'autre.</p>`)}
<p>L'hyperplan \(H\) a pour équation \(\langle w,x\rangle+b=0\), avec \(w\perp H\). On choisit \((w,b)\) tel que \(w\) pointe du côté des positifs (angle inférieur à 90° avec tout point positif), et on estime le label d'un nouveau point par \(\mathrm{sign}(\langle w,x\rangle+b)\). Un hyperplan séparateur ne fait aucune erreur sur l'apprentissage : il minimise le risque empirique pour le coût 0/1. Mais <b>il en existe une infinité</b>.</p>
${def('Marge', '<p>La <b>marge</b> γ d\'un hyperplan séparateur est la distance de cet hyperplan à l\'observation d\'apprentissage <b>la plus proche</b>.</p>')}
<p><b>Objectif</b> : chercher l'hyperplan séparateur <b>qui maximise sa marge γ</b>. Il est à une distance γ d'au moins une observation négative et une positive, donc à égale distance des observations positive et négative les plus proches. Cela le rend peu sensible à un petit changement des données (par exemple des erreurs de mesure).</p>
${def('Vecteurs de support', R`<p>Les points d'apprentissage situés à une distance γ de \(H\). Ils « soutiennent » les hyperplans \(H^+\) et \(H^-\) parallèles à \(H\), situés à une distance γ de part et d'autre. La zone entre \(H^+\) et \(H^-\) est la <b>zone d'indécision</b> ; elle ne contient aucune observation.</p>`)}
<ul><li>Déplacer légèrement un vecteur de support peut modifier \(H\) ; déplacer légèrement un autre point ne le change pas.</li>
<li>Même si \(H\) change, il reste séparateur : la méthode est <b>robuste</b> à de légères perturbations.</li>
<li>Maximiser la marge minimise l'incertitude sur la classe d'une nouvelle observation qui tombe près de \(H\).</li></ul>
` },
      { id: 'rigide', t: 'SVM à marge rigide : formulation primale', sub: 'Le cas linéairement séparable', html: R`
${prop('Distance d\'un point à un hyperplan', M(R`d(x,H)=\frac{|\langle w,x\rangle+b|}{\|w\|}`) + R`<p>Preuve (n'est pas à savoir) : si \(p\) est le projeté orthogonal de \(x\) sur \(H\), \(\vec{xp}=k\,\vec w\) avec \(k=-\frac{\langle w,x\rangle+b}{\|w\|^2}\) (voir la leçon sur la régression logistique), donc \(\|\vec{xp}\|=|k|\,\|w\|=\frac{|\langle w,x\rangle+b|}{\|w\|}\).</p>`)}
${def('SVM à marge rigide (primal)', M(R`(\hat w,\hat b)=\operatorname*{arg\,min}_{(w,b)\in\mathbb R^d\times\mathbb R}\ \frac12\|w\|^2\quad\text{s.c.}\quad y_i\big(\langle w,x_i\rangle+b\big)\ge1\quad\forall i\in\{1,\dots,n\}\qquad(1)`) + R`<p>Alors \(H=\{x:\langle\hat w,x\rangle+\hat b=0\}\) est un hyperplan séparateur qui maximise la marge. En particulier, il existe \(i,j\) tels que \(x_i\in H^+=\{x:\langle\hat w,x\rangle+\hat b=1\}\) et \(x_j\in H^-=\{x:\langle\hat w,x\rangle+\hat b=-1\}\).</p>`)}
${proof('Pourquoi minimiser ‖w‖ revient à maximiser la marge', R`<p>Les paramètres \((w,b)\) d'un hyperplan sont définis à un facteur près ; on les normalise pour que les points les plus proches vérifient \(y_i(\langle w,x_i\rangle+b)=1\). Les contraintes disent alors que tous les points sont bien classés et au moins à cette distance. La marge vaut la distance d'un vecteur de support à \(H\) :</p>${M(R`\gamma=\frac{|\langle w,x_i\rangle+b|}{\|w\|}=\frac1{\|w\|}.`)}<p>Maximiser \(\gamma=1/\|w\|\) revient à minimiser \(\|w\|\), donc \(\frac12\|w\|^2\) (plus simple à dériver). La largeur de la zone d'indécision est \(2/\|w\|\).</p>`)}
<ul><li>(1) est un problème d'<b>optimisation convexe</b> et <b>quadratique</b> : de nombreuses méthodes existent pour le résoudre.</li></ul>
${prop('Classifieur SVM à marge rigide', R`<p>Pour un nouveau point \(x\) : \(\mathrm{sign}\big[\langle\hat w,x\rangle+\hat b\big]\), avec \((\hat w,\hat b)\) solution de (1).</p>`)}
` },
      { id: 'dual', t: 'Formulation duale et conditions KKT', sub: 'Seuls les vecteurs de support comptent', html: R`
${def('SVM à marge rigide (dual)', M(R`\begin{aligned}\hat\alpha&=\operatorname*{arg\,max}_{\alpha\in\mathbb R^n}\ \sum_{i=1}^n\alpha_i-\frac12\sum_{i=1}^n\sum_{\ell=1}^n\alpha_i\alpha_\ell\,y_iy_\ell\,\langle x_i,x_\ell\rangle\\ &\text{s.c. }\sum_{i=1}^n\alpha_iy_i=0\ \text{ et }\ \alpha_i\ge0\quad\forall i\qquad(2)\end{aligned}`) + R`<p>Alors \(\hat w=\sum_{i=1}^n\hat\alpha_iy_ix_i\) et \(\hat b=1-\min_{i\,:\,y_i=1}\langle\hat w,x_i\rangle\) redonnent la solution de (1). Classifieur : \(\mathrm{sign}\big[\sum_{i=1}^n\hat\alpha_iy_i\langle x_i,x\rangle+\hat b\big]\).</p>`)}
<h4>D'où vient le dual ?</h4>
<p>(2) est aussi convexe et quadratique. On l'obtient à partir du primal (1) avec le <b>Lagrangien</b> :</p>
${M(R`\mathcal L(w,b,\alpha)=\frac12\|w\|^2+\sum_{i=1}^n\alpha_i\Big(1-y_i\big(\langle w,x_i\rangle+b\big)\Big),\qquad (P):\ \min_{(w,b)}\ \max_{\alpha\ge0}\ \mathcal L(w,b,\alpha)`)}
<p>En inversant le min et le max, on obtient le problème dual \((Q):\ \max_{\alpha\ge0}\ \min_{(w,b)}\ \mathcal L(w,b,\alpha)\). En général, les solutions vérifient \(q^*\le p^*\) (<b>dualité faible</b>) ; mais comme \((P)\) est convexe avec des contraintes affines, on a \(p^*=q^*\) (<b>condition de Slater</b>) : le saut de dualité est nul.</p>
${prop('Interprétation géométrique (KKT)', R`<p>Les solutions vérifient les conditions de Karush-Kuhn-Tucker, dont la condition d'<b>écart complémentaire</b> : pour tout \(i\), \(\hat\alpha_i\big[y_i(\langle\hat w,x_i\rangle+\hat b)-1\big]=0\). Deux possibilités :</p><ul><li>si \(x_i\) est à l'<b>extérieur</b> de \(H^+\) et \(H^-\) (\(y_i(\langle\hat w,x_i\rangle+\hat b)>1\)), alors \(\hat\alpha_i=0\) ;</li><li>si \(\hat\alpha_i>0\), alors \(y_i(\langle\hat w,x_i\rangle+\hat b)=1\) : \(x_i\in H^+\) ou \(H^-\), c'est un <b>vecteur de support</b>.</li></ul><p>Le dual identifie des vecteurs de support (pas forcément tous), et <b>seuls ces vecteurs de support</b> servent à construire le classifieur.</p>`)}
${prop('Complexité algorithmique', '<p>Le primal est un problème en <b>d + 1</b> dimensions, le dual en <b>n</b> dimensions. Avec peu de données et beaucoup de variables, on préfère le dual ; dans le cas inverse, le primal.</p>')}
` },
      { id: 'souple', t: 'SVM à marge souple', sub: 'Autoriser quelques erreurs', html: R`
<p>Quand les données ne sont pas séparables, mais seulement à quelques observations près (du bruit ?), on sépare quand même linéairement en maximisant la marge, mais en <b>autorisant quelques erreurs</b>.</p>
${def('Variable d\'ajustement ξᵢ', R`<p>On relâche la contrainte de séparabilité \(y_i(\langle w,x_i\rangle+b)\ge1\) en \(y_i(\langle w,x_i\rangle+b)\ge1-\xi_i\), avec \(\xi_i\ge0\) (slack variable) qui mesure à quel point \((x_i,y_i)\) échoue à être bien séparé. Trois cas :</p><ul><li>\(\xi_i=0\) : \(y_i(\langle w,x_i\rangle+b)\ge1\), le point est bien classé et hors de la zone d'indécision ;</li><li>\(0<\xi_i\le1\) : \(0\le y_i(\langle w,x_i\rangle+b)<1\), bien classé mais <b>dans la zone d'indécision</b> ;</li><li>\(\xi_i>1\) : \(y_i(\langle w,x_i\rangle+b)<0\), <b>mal classé</b>.</li></ul>`)}
<p>On veut minimiser le nombre d'<b>outliers</b> (points dans la zone d'indécision ou mal classés), donc \(\sum_i\xi_i\), tout en minimisant \(\|w\|^2\) pour maximiser la marge. Or quand \(\sum_i\xi_i\) diminue, la marge diminue, et inversement : il faut un <b>compromis</b>.</p>
${def('SVM à marge souple (primal)', M(R`(\hat w,\hat b,\hat\xi)=\operatorname*{arg\,min}_{(w,b,\xi)}\ \frac12\|w\|^2+C\sum_{i=1}^n\xi_i\quad\text{s.c.}\quad y_i\big(\langle w,x_i\rangle+b\big)\ge1-\xi_i,\ \ \xi_i\ge0\qquad(3)`))}
${prop('L\'hyperparamètre C', '<ul><li><b>C grand</b> : on préfère minimiser le nombre d\'outliers (marge étroite ; C → ∞ redonne la marge rigide).</li><li><b>C petit</b> : on accorde moins d\'importance aux outliers (marge large).</li></ul><p>C est choisi par l\'utilisateur, en comparant les performances sur les données de validation pour différentes valeurs.</p>')}
${prop('Lien avec la perte hinge', R`<p>Quand \(C>0\), l'objectif est croissant en chaque \(\xi_i\), et (3) se réécrit</p>${M(R`\min_{(w,b)}\ \frac1{2nC}\|w\|^2+\frac1n\sum_{i=1}^n\ell_{hinge}\big((w,b),(x_i,y_i)\big),\qquad \ell_{hinge}=\max\Big(0,\ 1-y_i\big(\langle w,x_i\rangle+b\big)\Big).`)}<p>C'est une <b>minimisation du risque empirique régularisé</b> : la régularisation \(w\mapsto\frac1{2nC}\|w\|^2\) évite le sur-apprentissage.</p>`)}
${warn('même sur des données séparables', '<p>Une SVM à marge rigide peut donner une frontière qui colle à un point isolé et risque de mal fonctionner sur de nouvelles données. Il peut être préférable d\'utiliser une marge souple, même quand les données sont séparables, pour éviter le sur-apprentissage.</p>')}
${demo('svm')}
${def('SVM à marge souple (dual)', M(R`\begin{aligned}\hat\alpha&=\operatorname*{arg\,max}_{\alpha\in\mathbb R^n}\ \sum_{i=1}^n\alpha_i-\frac12\sum_{i=1}^n\sum_{\ell=1}^n\alpha_i\alpha_\ell\,y_iy_\ell\,\langle x_i,x_\ell\rangle\quad\text{s.c. }\sum_i\alpha_iy_i=0,\ \ 0\le\alpha_i\le C\qquad(4)\\ \hat w&=\sum_{i=1}^n\hat\alpha_iy_ix_i,\qquad \hat b=y_i-\sum_{j=1}^n\hat\alpha_jy_j\langle x_j,x_i\rangle\ \text{ pour un } i \text{ tel que } 0<\hat\alpha_i<C\end{aligned}`) + R`<p>Classifieur : \(\mathrm{sign}\big[\sum_{i=1}^n\hat\alpha_iy_i\langle x_i,x\rangle+\hat b\big]\). S'il n'existe aucun \(i\) avec \(0<\hat\alpha_i<C\) (rare), on peut prendre \(\hat b\) au hasard dans un intervalle, mais le cours conseille plutôt de <b>changer C</b>.</p>`)}
${prop('KKT pour la marge souple', R`<p>Écart complémentaire : \(\hat\alpha_i\big[y_i(\langle\hat w,x_i\rangle+\hat b)-1+\xi_i\big]=0\).</p><ul><li>Si \(x_i\) est au-dessus de \(H^+\) (pour \(y_i=1\)) ou en dessous de \(H^-\) (pour \(y_i=-1\)), c'est-à-dire \(y_i(\langle\hat w,x_i\rangle+\hat b)>1\), alors \(\xi_i=0\) et \(\hat\alpha_i=0\).</li><li>Si \(\hat\alpha_i>0\) : si \(\xi_i=0\), le point est sur \(H^+\) ou \(H^-\), c'est un <b>vecteur de support</b> ; si \(\xi_i\neq0\), c'est un <b>outlier</b>.</li></ul><p>Le dual identifie des vecteurs de support et des outliers (pas forcément tous) ; seuls eux servent à construire le classifieur.</p>`)}
` },
      { id: 'noyau', t: 'SVM à noyau et astuce du noyau', sub: 'Séparer linéairement dans un autre espace', html: R`
<p>Quand les données ne sont <b>pas séparables linéairement, même à quelques observations près</b> (par exemple une classe en anneau autour de l'autre), on les transforme par une application \(\phi:\mathcal X\to\mathcal H\) pour les séparer linéairement dans l'<b>espace de redescription</b> \(\mathcal H\), avec une SVM à marge souple. Exemple du cours : \(\phi(x_1,x_2)=(x_1^2,x_2^2)\).</p>
${M(R`\hat\alpha=\operatorname*{arg\,max}_{\alpha}\ \sum_i\alpha_i-\frac12\sum_{i,\ell}\alpha_i\alpha_\ell\,y_iy_\ell\,\langle\phi(x_i),\phi(x_\ell)\rangle\quad\text{s.c. }\sum_i\alpha_iy_i=0,\ 0\le\alpha_i\le C`)}
<p>et le classifieur \(f(x)=\mathrm{sign}\big[\sum_i\hat\alpha_iy_i\langle\phi(x_i),\phi(x)\rangle+\hat b\big]\), avec \(\hat b=y_i-\sum_j\hat\alpha_jy_j\langle\phi(x_j),\phi(x_i)\rangle\) pour un \(i\) tel que \(0<\hat\alpha_i<C\).</p>
${demo('kernel')}
${def('Noyau et astuce du noyau', R`<p>φ n'intervient (dans le dual et dans le classifieur) <b>que par les produits scalaires</b> \(\langle\phi(x_j),\phi(x_i)\rangle\). Or la dimension de \(\mathcal H\) peut être grande et ce calcul coûteux. On définit le <b>noyau</b> \(K:(x,\tilde x)\mapsto\langle\phi(x),\phi(\tilde x)\rangle\). L'<b>astuce du noyau</b> : au lieu de calculer \(\phi(x_i)\), \(\phi(x_j)\) puis leur produit scalaire, on calcule directement \(K(x_i,x_j)\).</p>`)}
${ex('le calcul est plus rapide', R`<p>\(\phi:x\in\mathbb R^d\mapsto(1,x_1,\dots,x_d,x_1x_1,x_1x_2,\dots,x_dx_d)\in\mathbb R^{1+d+d^2}\).</p>${M(R`\langle\phi(x),\phi(\tilde x)\rangle=1+\sum_{i=1}^dx_i\tilde x_i+\sum_{i=1}^d\sum_{j=1}^dx_i\tilde x_ix_j\tilde x_j\ \ (O(d^2))\ =\ 1+\langle x,\tilde x\rangle+\langle x,\tilde x\rangle^2\ \ (O(d))=K(x,\tilde x)`)}`)}
<ul><li>L'astuce du noyau intervient dans le problème <b>dual</b>.</li>
<li>Il n'y a pas besoin de connaître φ explicitement : il suffit de connaître K. On peut choisir K arbitrairement (c'est un <b>hyperparamètre</b>), du moment que l'existence de φ est garantie.</li></ul>
${def('Noyau valide', R`<ul><li>\(K\) est <b>symétrique</b> si \(K(x,\tilde x)=K(\tilde x,x)\) pour tous \(x,\tilde x\).</li><li>\(K\) est <b>semi-défini positif</b> si pour tout \(m\), tous \(x_1,\dots,x_m\) et tous \(a_1,\dots,a_m\in\mathbb R\) : \(\sum_{i=1}^m\sum_{j=1}^ma_ia_jK(x_i,x_j)\ge0\).</li></ul><p><b>Théorème de Moore-Aronszajn</b> : si \(K\) est symétrique et semi-défini positif, il existe un espace (de Hilbert) \(\mathcal H\) et une application \(\phi\) tels que \(K(x,\tilde x)=\langle\phi(x),\phi(\tilde x)\rangle\). On choisit donc un noyau symétrique et semi-défini positif. La matrice \(M_{i,j}=K(x_i,x_j)\) s'appelle la <b>matrice de Gram</b>.</p>`)}
${ex('exercice du cours : (⟨x, x̃⟩ + c)² comme produit scalaire', R`${M(R`\begin{aligned}(\langle x,\tilde x\rangle+c)^2&=\Big(\sum_ix_i\tilde x_i\Big)^2+2c\sum_ix_i\tilde x_i+c^2\\ &=\sum_{i=1}^d\sum_{j=1}^d(x_ix_j)(\tilde x_i\tilde x_j)+\sum_{i=1}^d(\sqrt{2c}\,x_i)(\sqrt{2c}\,\tilde x_i)+c\cdot c\end{aligned}`)}<p>Donc \(K(x,\tilde x)=\langle\phi(x),\phi(\tilde x)\rangle\) avec \(\phi(x)=\big((x_ix_j)_{1\le i,j\le d},\ \sqrt{2c}\,x_1,\dots,\sqrt{2c}\,x_d,\ c\big)\in\mathbb R^{d^2+d+1}\) (on peut regrouper \(x_ix_j\) et \(x_jx_i\) en \(\sqrt2\,x_ix_j\) pour \(i<j\)).</p>`)}
${prop('Exemples de noyaux', M(R`\begin{aligned}\text{linéaire} &: K(x,\tilde x)=\langle x,\tilde x\rangle\\ \text{cosinus} &: K(x,\tilde x)=\frac{\langle x,\tilde x\rangle}{\|x\|\,\|\tilde x\|}\\ \text{quadratique} &: K(x,\tilde x)=(\langle x,\tilde x\rangle+c)^2,\ c\in\mathbb R_+\\ \text{polynomial} &: K(x,\tilde x)=(\langle x,\tilde x\rangle+c)^d,\ c\in\mathbb R_+,\ d\in\mathbb N\\ \text{gaussien} &: K(x,\tilde x)=\exp\big(-(x-\tilde x)^\top\Sigma^{-1}(x-\tilde x)\big),\ \Sigma \text{ semi-définie positive}\\ \text{gaussien (RBF)} &: K(x,\tilde x)=\exp\Big(-\frac{\|x-\tilde x\|^2}{2\sigma^2}\Big),\ \sigma>0\end{aligned}`))}
${def('SVM à marge souple et à noyau', M(R`\begin{aligned}\hat\alpha&=\operatorname*{arg\,max}_{\alpha}\ \sum_i\alpha_i-\frac12\sum_{i,\ell}\alpha_i\alpha_\ell\,y_iy_\ell\,K(x_i,x_\ell)\quad\text{s.c. }\sum_i\alpha_iy_i=0,\ 0\le\alpha_i\le C\qquad(5)\\ \hat b&=y_i-\sum_j\hat\alpha_jy_jK(x_j,x_i)\ \ (0<\hat\alpha_i<C),\qquad f(x)=\mathrm{sign}\Big[\sum_i\hat\alpha_iy_iK(x_i,x)+\hat b\Big]\end{aligned}`) + '<p>Le paramètre <b>C</b> et le noyau <b>K</b> (et ses paramètres) sont des hyperparamètres, choisis en comparant les performances sur les données de validation.</p>')}
${demo('rbf')}
<p>Avec le noyau RBF, \(\gamma=\frac1{2\sigma^2}\) grand (σ petit) donne une frontière très locale, en « îlots » autour des points (variance ↑) ; γ petit donne une frontière lisse, presque linéaire (biais ↑).</p>
` },
    ],
    keep: [
      'Marge γ = distance de l\'hyperplan au point le plus proche ; avec la normalisation, γ = 1/‖w‖.',
      'Marge rigide : min ½‖w‖² s.c. yᵢ(⟨w,xᵢ⟩ + b) ≥ 1 ; classifieur sign(⟨ŵ,x⟩ + b̂).',
      'Dual : ŵ = Σ α̂ᵢ yᵢ xᵢ ; α̂ᵢ > 0 seulement pour les vecteurs de support (et outliers en marge souple).',
      'Marge souple : + C Σ ξᵢ ; C grand → peu d\'outliers, marge étroite ; équivaut à la perte hinge régularisée.',
      'Noyau : K(x, x̃) = ⟨φ(x), φ(x̃)⟩, symétrique et semi-défini positif ; l\'astuce intervient dans le dual.',
    ],
  },

  /* ===================================================================== */
  {
    id: 'l6', ch: 'clust', short: 'Clustering', src: 'CM 5',
    t: 'Le clustering',
    sub: 'Regrouper des données sans étiquettes : distances, critères de qualité, classification ascendante hiérarchique et K-moyennes.',
    goals: [
      'Définir une distance et choisir une distance selon le type de variables.',
      'Calculer homogénéité, séparabilité, indice de Davies-Bouldin, silhouette, inertie intra et inter-classes.',
      'Démontrer la décomposition de l\'inertie I = I_W + I_B.',
      'Dérouler la CAH (liens, Ward, dendrogramme) et l\'algorithme de Lloyd (K-moyennes) ; comparer leurs complexités.',
      'Citer les façons d\'évaluer un clustering.',
    ],
    sections: [
      { id: 'objectif', t: 'Objectif et exemples', sub: 'Une analyse exploratoire', html: R`
${def('Clustering', R`<p>On observe des données \(x_1,\dots,x_n\in\mathcal X\) pour \(n\) individus, <b>sans étiquettes</b> (non étiquetées). On veut les séparer en sous-groupes <b>homogènes</b>, appelés <b>clusters</b> : \(\{x_1,\dots,x_n\}=\bigcup_{k=1}^KC_k\). Cela permet d'extraire de l'information sur les données et de mieux comprendre leurs caractéristiques générales : c'est une <b>analyse exploratoire</b>.</p>`)}
<ul><li><b>Gènes similaires</b> : faire des hypothèses sur le rôle des gènes.</li>
<li><b>Segmentation de marché</b> : identifier des groupes de clients au comportement similaire.</li>
<li><b>Compression d'image</b> : remplacer chaque pixel par la couleur du centre de son groupe (16 couleurs, 4 couleurs).</li>
<li><b>Annotation d'un corpus de textes</b> : regrouper les textes par sujet, puis lire seulement quelques textes de chaque cluster pour connaître son sujet.</li></ul>
` },
      { id: 'distance', t: 'Choisir une distance', sub: 'Mesurer la ressemblance entre deux individus', html: R`
<p>On veut que les individus similaires soient dans le même cluster et les individus dissimilaires dans des clusters différents. Il faut donc mesurer la distance entre deux individus.</p>
${def('Distance', R`<p>Une fonction \(d:\mathcal X\times\mathcal X\to\mathbb R_+\) est une distance si, pour tous \(x,y,z\) :</p><ul><li>\(d(x,y)=d(y,x)\) (<b>symétrie</b>) ;</li><li>\(d(x,y)=0\iff x=y\) (<b>séparation</b>) ;</li><li>\(d(x,y)\le d(x,z)+d(z,y)\) (<b>inégalité triangulaire</b>).</li></ul>`)}
<h4>Variables quantitatives</h4>
${M(R`\begin{aligned}\text{Euclidienne} &: \|x-y\|_2=\sqrt{\textstyle\sum_{i=1}^d(x_i-y_i)^2} & \text{Manhattan} &: \|x-y\|_1=\textstyle\sum_{i=1}^d|x_i-y_i|\\ \text{Minkowski} &: \Big(\textstyle\sum_{i=1}^d|x_i-y_i|^p\Big)^{1/p} & \text{Chebyshev} &: \max_i|x_i-y_i|\\ \text{Mahalanobis} &: \sqrt{(x-y)^\top\Sigma^{-1}(x-y)} && (\Sigma \text{ : variance-covariance empirique})\end{aligned}`)}
<p>On utilise souvent la distance euclidienne, notée simplement \(\|\cdot\|\) par la suite.</p>
<h4>Variables qualitatives ou mixtes</h4>
<ul><li>Qualitatives : distance du <b>χ²</b>, distance de <b>Jaccard</b>, distance de <b>Gower</b> (qui n'est pas une distance au sens mathématique : elle ne vérifie pas l'inégalité triangulaire).</li>
<li>Mixtes : rendre les quantitatives qualitatives (découpage en classes), ou les qualitatives quantitatives (encodage one-hot), ou tout rendre qualitatif puis faire une <b>ACM</b> et utiliser les coordonnées (quantitatives) des individus sur les nouveaux axes.</li></ul>
` },
      { id: 'criteres', t: 'Quelle partition choisir ?', sub: 'Homogénéité, séparabilité, Davies-Bouldin, silhouette', html: R`
<p>Deux stratégies s'opposent : <b>ne pas séparer des points proches</b> (ex. CAH avec lien simple, qui suit des formes allongées) ou <b>ne pas mettre des points trop éloignés dans le même cluster</b> (ex. 2-moyennes, qui fait des groupes compacts). On voudrait choisir la partition qui minimise un critère dépendant de l'homogénéité et de la séparabilité des clusters.</p>
${def('Centroïde et homogénéité', R`<p>Le <b>centroïde</b> du cluster \(C\) est \(\mu_C=\frac1{|C|}\sum_{x\in C}x\). L'<b>homogénéité</b> (tightness) du cluster \(C_k\) est la moyenne des distances de ses observations à son centroïde, et l'homogénéité globale d'un clustering de taille K est la moyenne :</p>${M(R`T_k=\frac1{|C_k|}\sum_{x\in C_k}d(x,\mu_k),\qquad T=\frac1K\sum_{k=1}^KT_k\quad(\text{le plus petit possible})`)}`)}
${def('Séparabilité', M(R`S_{k\ell}=d(\mu_k,\mu_\ell),\qquad S=\frac{2}{K(K-1)}\sum_{k=1}^K\sum_{\ell=k+1}^KS_{k\ell}\quad(\text{le plus grand possible})`) + '<p>Distance entre les centroïdes, moyennée sur toutes les paires de clusters.</p>')}
${def('Indice de Davies-Bouldin', M(R`D_k=\max_{\ell\neq k}\frac{T_k+T_\ell}{S_{k\ell}},\qquad D=\frac1K\sum_{k=1}^KD_k\quad(\text{à minimiser})`) + '<p>On regarde le « pire des cas » en termes d\'homogénéité et de séparabilité.</p>')}
${def('Coefficient de silhouette', M(R`s(x)=\frac{b(x)-a(x)}{\max\big(a(x),b(x)\big)}\in[-1,1],\quad a(x)=\frac1{|C_{k(x)}|-1}\sum_{y\in C_{k(x)},\,y\neq x}d(x,y),\quad b(x)=\min_{\ell\neq k(x)}\frac1{|C_\ell|}\sum_{y\in C_\ell}d(x,y)`) + R`<p>\(a(x)\) est la distance moyenne de \(x\) aux autres éléments de son cluster ; \(b(x)\) est la plus petite valeur que pourrait prendre \(a(x)\) si \(x\) appartenait à un autre cluster. \(s(x)\) est d'autant plus proche de 1 que l'assignation de \(x\) est satisfaisante (\(s(x)<0\) : \(x\) est en moyenne plus proche d'un autre cluster). La silhouette globale \(s=\frac1n\sum_is(x_i)\) est à <b>maximiser</b>.</p>`)}
${demo('silhouette')}
` },
      { id: 'inertie', t: 'Inertie intra et inter-classes', sub: 'La décomposition I = I_W + I_B', html: R`
<p>Avec \(x_1,\dots,x_n\in\mathbb R^d\), \(\mu=\frac1n\sum_ix_i\) et la distance euclidienne, l'homogénéité et la séparabilité se quantifient aussi par l'<b>inertie</b> :</p>
${M(R`I=\sum_{i=1}^n\|x_i-\mu\|^2=\underbrace{\sum_{k=1}^K\sum_{x_i\in C_k}\|x_i-\mu_k\|^2}_{I_W\ :\ \text{intra-classes}}+\underbrace{\sum_{k=1}^K|C_k|\,\|\mu_k-\mu\|^2}_{I_B\ :\ \text{inter-classes}}`)}
<ul><li>\(I_W\) mesure l'<b>homogénéité</b> au sein des classes ; \(I_B\) mesure l'<b>hétérogénéité entre les classes</b> (à quel point elles sont bien séparées).</li>
<li><b>Objectif</b> : trouver le clustering qui maximise \(I_B\), ou de manière équivalente qui minimise \(I_W\) (car \(I\) ne dépend pas de la partition).</li></ul>
<div class="todo-proof"><h3>Démonstration à savoir : \(I=I_W+I_B\)</h3>
<p><b>Rappel.</b> \(\|x+y\|^2=\|x\|^2+\|y\|^2+2\langle x,y\rangle\).</p>
${M(R`\begin{aligned}I&=\sum_{k=1}^K\sum_{x_i\in C_k}\big\|(x_i-\mu_k)+(\mu_k-\mu)\big\|^2\\ &=\sum_{k=1}^K\sum_{x_i\in C_k}\|x_i-\mu_k\|^2+\sum_{k=1}^K|C_k|\,\|\mu_k-\mu\|^2+2\sum_{k=1}^K\Big\langle\sum_{x_i\in C_k}(x_i-\mu_k),\ \mu_k-\mu\Big\rangle\end{aligned}`)}
<p>Le terme croisé est nul car \(\sum_{x_i\in C_k}(x_i-\mu_k)=|C_k|\mu_k-|C_k|\mu_k=0\) par définition du centroïde. Le terme \(\|\mu_k-\mu\|^2\) ne dépend pas de \(i\) : sommé sur les \(|C_k|\) points, il donne \(|C_k|\,\|\mu_k-\mu\|^2\). D'où \(I=I_W+I_B\).</p></div>
${warn('trop de partitions', R`<p>On voudrait \(C^*=\operatorname*{arg\,min}_{K}\min_{C_1,\dots,C_K}R(C_1,\dots,C_K)\) avec R l'indice de Davies-Bouldin, la silhouette (à maximiser) ou l'inertie intra-classes. Mais le nombre de partitions possibles, le <b>nombre de Bell</b> \(B_n=\frac1e\sum_{K\ge1}\frac{K^n}{K!}\), est gigantesque (\(B_{50}\ge10^{47}\)). On utilise des <b>algorithmes itératifs</b> qui explorent un sous-ensemble de partitions : algorithmes agglomératifs ou divisifs (classification hiérarchique), par partitionnement (K-moyennes), probabilistes (modèles de mélange).</p>`)}
` },
      { id: 'cah', t: 'Clustering hiérarchique (CAH)', sub: 'Fusionner pas à pas les deux clusters les plus proches', html: R`
<p>Le clustering hiérarchique propose une partition pour <b>toute taille</b> \(k\in\{1,\dots,n\}\), par récurrence : chaque partition est obtenue à partir de la précédente.</p>
<ul><li><b>Agglomératif</b> : au départ, chaque observation forme un cluster. À chaque itération, on agglomère les <b>deux clusters les plus proches</b>, jusqu'à n'avoir qu'un cluster. C'est la <b>classification ascendante hiérarchique (CAH)</b>, étudiée ici.</li>
<li><b>Divisif</b> : on part d'un seul cluster et on en sépare un en deux à chaque itération, jusqu'à des clusters d'une observation.</li></ul>
${def('Distances entre deux clusters', M(R`\begin{aligned}\text{lien simple} &: d(C_k,C_\ell)=\min_{(x,y)\in C_k\times C_\ell}d(x,y) && \text{deux de leurs éléments sont proches}\\ \text{lien complet} &: d(C_k,C_\ell)=\max_{(x,y)\in C_k\times C_\ell}d(x,y) && \text{tous leurs éléments sont proches}\\ \text{lien moyen} &: d(C_k,C_\ell)=\frac1{|C_k|\,|C_\ell|}\sum_{x\in C_k}\sum_{y\in C_\ell}d(x,y)\\ \text{lien centroïdal} &: d(C_k,C_\ell)=d(\mu_k,\mu_\ell)\end{aligned}`) + '<p>Ces liens garantissent la séparabilité des clusters. Ce ne sont pas forcément des distances au sens mathématique : pour le lien complet, d(C, C) ≠ 0 si |C| > 1.</p>')}
${def('Distance de Ward', M(R`d(C_k,C_\ell)=\frac{|C_k|\,|C_\ell|}{|C_k|+|C_\ell|}\,\|\mu_k-\mu_\ell\|^2`) + R`<p><b>Proposition.</b> La distance de Ward est le gain de variance intra-classe (de manière équivalente, la perte d'inertie inter-classes) quand on fusionne \(C_k\) et \(C_\ell\) pour passer de K à K − 1 classes. On fusionne donc les deux clusters dont la fusion augmente le moins la variance intra : on maximise l'homogénéité, et aussi la séparabilité puisqu'on minimise la perte de variance inter.</p>`)}
${ex('pourquoi Ward crée des groupes équilibrés', R`<p>Le facteur \(f(x,y)=\frac{xy}{x+y}\) (avec \(x=|C_k|\), \(y=|C_\ell|\)) est petit dès qu'un des effectifs est petit, et, à \(x+y\) fixé, maximal quand \(x=y\). Ward fusionne donc volontiers un petit groupe et pénalise la fusion de deux gros groupes : les groupes obtenus ont des effectifs équilibrés.</p>`)}
${def('Dendrogramme', '<p>Le résultat d\'un clustering hiérarchique se visualise sous la forme d\'un <b>dendrogramme</b>. La longueur d\'une branche est égale à la distance entre les deux clusters qu\'elle connecte.</p>')}
${demo('cah')}
${method('Choisir le nombre de clusters', R`<p>La CAH ne demande pas de fixer le nombre de groupes à l'avance : le dendrogramme permet d'explorer toutes les partitions. Mais il faut à un moment choisir :</p><ul><li>arrêter les fusions dès que la distance minimale entre clusters dépasse un seuil \(r\), arbitraire ou égal à \(\alpha\max_{(x,y)}d(x,y)\) avec \(\alpha<1\) ;</li><li>visuellement, couper le dendrogramme avant qu'une branche ne soit trop grande ;</li><li>évaluer les différentes partitions (les nœuds du dendrogramme) avec une mesure comme la silhouette et garder la meilleure.</li></ul>`)}
${warn('complexité', R`<p>À chaque itération, il faut calculer les distances deux à deux entre toutes les paires : \(O(dn^2)\) opérations. La CAH est <b>quadratique en n</b>, donc coûteuse sur de gros jeux de données.</p>`)}
` },
      { id: 'kmeans', t: 'Les K-moyennes', sub: 'L\'algorithme de Lloyd', html: R`
<p>Plutôt que d'explorer toutes les tailles de partition, on fixe le nombre K de clusters à l'avance, ce qui réduit les temps de calcul.</p>
${def('Objectif des K-moyennes', M(R`C^*=\operatorname*{arg\,min}_{C_1,\dots,C_K}\ \sum_{k=1}^K\sum_{x\in C_k}\|x-\mu_k\|^2\qquad(\text{inertie intra-classes})`) + '<p>Ce problème est trop long à résoudre exactement : on utilise une heuristique, l\'algorithme de Lloyd.</p>')}
${method('Algorithme de Lloyd', R`<ol><li>Choisir K observations \(\mu_1,\dots,\mu_K\) au hasard (uniformément) parmi les données. Variante <b>K-means++</b> : on les tire de façon à les disperser au maximum.</li><li>Affecter chaque observation au centroïde le plus proche : \(k(x_i)=\operatorname*{arg\,min}_k\|x_i-\mu_k\|^2\) (cellule du diagramme de Voronoï induit par les \(\mu_k\)).</li><li>Recalculer les centroïdes : \(\mu_k=\frac1{|C_k|}\sum_{x_i\in C_k}x_i\).</li><li>Répéter 2–3 jusqu'à convergence (les affectations ne changent plus).</li></ol>`)}
${demo('kmeans')}
${prop('Convergence et minimum local', '<p>L\'inertie intra-classes <b>diminue à chaque itération</b> (lemme 22.1 de Shalev-Shwartz et Ben-David). Mais on peut tomber dans un <b>minimum local</b> : il est recommandé de répéter la procédure avec plusieurs initialisations aléatoires et de garder la meilleure.</p>')}
${method('Choisir K : le critère du coude', '<p>K est un hyperparamètre. L\'inertie intra diminue forcément quand K augmente (on ne veut pourtant pas n clusters). Pour K petit, elle décroît fortement, puis la décroissance s\'atténue au niveau d\'un <b>coude</b> (changement de pente) : on choisit K au coude (vers K = 4 dans l\'exemple du cours).</p>')}
${prop('Complexité', R`<p>À chaque itération on calcule \(Kn\) distances en dimension \(d\) : pour \(t\) itérations, \(O(ndKt)\). K et t étant négligeables devant n, l'algorithme est <b>linéaire en n</b>, contre quadratique pour la CAH : les distances d'une observation aux \(n-1\) autres sont remplacées par ses distances aux K centroïdes. On peut <b>combiner</b> les deux : un K-moyennes avec \(K=\lambda n\) (une fraction importante des données), puis une CAH sur le résultat.</p>`)}
${warn('données aberrantes et forme des clusters', '<ul><li>Les K-moyennes sont <b>sensibles aux données aberrantes</b> : une observation très éloignée se retrouve seule dans un cluster et le reste est partitionné en K − 1 clusters. Cela permet d\'ailleurs de <b>détecter</b> les valeurs aberrantes. Les <b>K-médoïdes</b> sont plus robustes : le médoïde d\'une classe est le point de la classe dont la dissimilarité moyenne aux autres points est minimale (l\'observation la plus centrale).</li><li>Les centroïdes forment un diagramme de Voronoï : les clusters sont <b>convexes</b>. Pour des clusters non convexes (anneaux), on peut appliquer l\'astuce du noyau à l\'algorithme de Lloyd.</li></ul>')}
` },
      { id: 'evaluation', t: 'Évaluer un clustering', sub: 'Sans vérité terrain', html: R`
<p>Le clustering n'étant pas supervisé, il faut des critères qui ne dépendent pas d'étiquettes connues. C'est plus délicat qu'en supervisé, où le but est beaucoup plus clair.</p>
<ul><li><b>Stabilité des clusters</b> : collecter plus de données, perturber ou supprimer quelques observations, ou initialiser différemment l'algorithme ne doit pas changer complètement les conclusions.</li>
<li><b>Évaluation externe</b> : a posteriori, un expert juge si les groupes sont cohérents et ont du sens ; a priori, avec des données (partiellement) étiquetées, on vérifie si on retrouve les classes (<b>indice de Rand</b>).</li>
<li><b>Évaluation interne</b> : indice de Davies-Bouldin global, silhouette globale, pour juger l'homogénéité des clusters et leur séparabilité.</li></ul>
${ex('TP clustering', '<p>Anneaux concentriques : le lien simple les sépare, les K-moyennes échouent ; avec φ(x, y) = (x, y, x² + y²), les K-moyennes réussissent. Iris standardisé : coude à K = 3 ; Ward suggère 3 clusters ; la silhouette en suggère 2 (setosa contre le reste).</p>')}
` },
    ],
    keep: [
      'Distance : symétrie, séparation, inégalité triangulaire ; Gower n\'en est pas une.',
      'Davies-Bouldin à minimiser, silhouette s(x) = (b − a)/max(a, b) à maximiser.',
      'I = I_W + I_B (le terme croisé est nul par définition des centroïdes) : minimiser I_W ⇔ maximiser I_B.',
      'CAH : liens simple, complet, moyen, centroïdal, Ward (= hausse de I_W) ; dendrogramme ; O(dn²).',
      'Lloyd : affecter au centroïde le plus proche, recalculer les centroïdes ; I_W décroît ; minimum local ; coude ; O(ndKt).',
    ],
  },
];

// Dans le HTML, un « < » suivi d'une lettre ouvrirait une balise : dans les formules, on écrit \lt à la place.
const lt = h => h.replace(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g, m => m.replace(/</g, '\\lt '));
lessons.forEach(l => l.sections.forEach(s => { s.html = lt(s.html); }));
