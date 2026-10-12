// Contenu du cours « Classification supervisée et non supervisée » (généré depuis l'ancien site, ne pas réécrire à la main sans relire).
export const chapters = [
 {
  "id": "intro",
  "name": "Cadre & KNN"
 },
 {
  "id": "eval",
  "name": "Évaluer & sélectionner"
 },
 {
  "id": "reglog",
  "name": "Régression logistique"
 },
 {
  "id": "cart",
  "name": "Arbres CART"
 },
 {
  "id": "svm",
  "name": "SVM"
 },
 {
  "id": "clust",
  "name": "Clustering"
 }
];
export const fiches = {
 "intro": "\n<ul>\n  <li><b>Supervisé</b> : on observe x<sub>1</sub>,…,x<sub>n</sub> <i>et</i> leurs étiquettes y<sub>1</sub>,…,y<sub>n</sub> ; on apprend f telle que f(x) ≈ y pour un nouvel x.</li>\n  <li><b>Non supervisé</b> : pas d'étiquettes. <b>Clustering</b> : trouver des groupes. <b>Réduction de dimension</b> : représenter les données dans un espace de plus petite dimension, pour calculer plus vite, visualiser ou améliorer un modèle supervisé entraîné ensuite. <b>Estimation de densité</b> : estimer la loi ℙ dont x₁,…,xₙ sont des réalisations i.i.d. (ex. un histogramme).</li>\n  <li>Nature de 𝒴 : <span class=\"key\">𝒴 ⊂ ℝ non fini → régression</span> ; Card(𝒴)=2 → classification binaire ; Card(𝒴)=C&gt;2 → multiclasse.</li>\n  <li>Piège d'examen : « prédire la <i>probabilité</i> de … » est une <b>régression</b> (sortie continue dans [0,1]).</li>\n</ul>\n<div class=\"grid2\">\n  <div><h3>Fonction de coût, risque</h3>\n  <div class=\"math\">\\[\\begin{aligned}\n&\\ell(y,y)=0 \\quad\\text{et}\\quad \\ell(y,y')>0 \\ \\text{ si } y\\neq y' \\\\\n&R(f)=\\mathbb{E}\\big[\\ell(Y,f(X))\\big] && \\text{(risque)}\\\\\n&f^*=\\operatorname*{arg\\,min}_{f} R(f) && \\text{(règle optimale)}\\\\\n&\\hat R_n(f)=\\frac1n\\sum_{i=1}^n \\ell\\big(y_i,f(x_i)\\big) && \\text{(risque empirique, ERM)}\n\\end{aligned}\\]</div></div>\n  <div><h3>Règles optimales à connaître</h3>\n  <div class=\"math\">\\[\\begin{aligned}\n\\text{coût quadratique} &\\;\\Rightarrow\\; f^*(x)=\\mathbb{E}[Y\\mid X=x]\\\\\n\\text{coût absolu} &\\;\\Rightarrow\\; f^*(x)=\\text{médiane}(Y\\mid X=x)\\\\\n\\text{coût 0/1} &\\;\\Rightarrow\\; f^*(x)=\\operatorname*{arg\\,max}_k\\ \\mathbb{P}(Y=k\\mid X=x)\n\\end{aligned}\\]</div><p class=\"math-note\">Le dernier est le <b>classifieur de Bayes</b>.</p></div>\n</div>\n<details class=\"fold\"><summary>Démonstration : f*(x) = E[Y | X=x] pour le coût quadratique</summary>\n<p style=\"margin-top:8px\">On suppose que ℙ_{X,Y} a une densité, avec E[Y²] &lt; ∞ et E[f(X)²] &lt; ∞. Alors R(f) = E[(Y−f(X))²] = E_X[ E_{Y|X}[(Y−f(X))² | X] ] = ∫ p(x) ∫ (y−f(x))² p(y|x) dy dx.<br>\nIl suffit de minimiser, pour chaque x, g_x(c) = ∫(y−c)² p(y|x) dy, c'est-à-dire c² − 2c ∫ y p(y|x) dy à une constante près. g'_x(c) = 0 ⇔ c = ∫ y p(y|x) dy = E[Y|X=x], et g''_x(c) = 2 &gt; 0 : c'est un minimum global.</p></details>\n<ul>\n  <li><b>Biais inductif</b> : on cherche f dans un sous-ensemble ℱ plutôt que dans toutes les fonctions mesurables. Exemple : ℱ = {x ↦ φ(⟨w,x⟩+b)} (classes d'hypothèses) ; avec φ = identité, c'est la régression linéaire.</li>\n</ul>\n<h3>K plus proches voisins</h3>\n<div class=\"math\">\\[\\begin{aligned}\n\\text{Classification :}\\quad & f(x)=\\operatorname*{arg\\,max}_{k}\\sum_{i\\,:\\,x_i\\in N_K(x)} \\mathbf 1\\{y_i=k\\}\\\\\n\\text{Régression :}\\quad & f(x)=\\frac1K\\sum_{i\\,:\\,x_i\\in N_K(x)} y_i\n\\end{aligned}\\]</div>\n<ul>\n  <li>Hyperparamètres : <b>K</b> (choisi par validation croisée) et la <b>distance</b> (souvent euclidienne).</li>\n  <li>Méthode <b>non paramétrique</b>, simple, mais coûteuse : n distances en O(nd) puis recherche des K plus petites en O(n log K). Souffre du <b>fléau de la dimension</b>.</li>\n  <li><span class=\"key\">K=1 : erreur nulle sur l'apprentissage → sur-apprentissage.</span> K = n : on prédit toujours la classe majoritaire → sous-apprentissage.</li>\n  <li>K ↓ : variance ↑, biais ↓. K ↑ : biais ↑, variance ↓.</li>\n  <li>Variante pondérée (exam 2025) : poids exp(−d<sub>i</sub>(x)²/h) sur les K plus proches voisins N<sub>K</sub>(x) → les voisins proches comptent plus. h grand ≈ KNN classique ; h petit ≈ 1-NN.</li>\n  <li>Il faut <b>standardiser</b> les variables (sinon la variable à grande échelle domine la distance).</li>\n</ul>\n<figure class=\"viz\" data-viz=\"knn\"></figure>\n<div class=\"tp\"><b>TP1-2 :</b> taux d'erreur nul avec K=1 évalué sur les données d'apprentissage, non nul sur des données mises de côté. Normalisation min-max (x−min)/(max−min) sur iris. Avec K = taille de l'apprentissage, toutes les prédictions = espèce majoritaire.</div>",
 "eval": "\n<div class=\"grid2\">\n<div><h3>Matrice de confusion (convention du cours)</h3>\n<div class=\"scroll\"><table class=\"t\">\n<tr><th></th><th>réel 0</th><th>réel 1</th></tr>\n<tr><th>prédit 0</th><td>TN</td><td>FN</td></tr>\n<tr><th>prédit 1</th><td>FP</td><td>TP</td></tr></table></div>\n<p class=\"lead\" style=\"margin-top:6px;font-size:13px\">Lignes = classe prédite, colonnes = classe réelle (comme <code>table(pred, réel)</code> en R ; l'ordre des arguments de <code>table()</code> décide de l'orientation).</p>\n<p class=\"lead\" style=\"margin-top:6px;font-size:13px\">Attention : en multiclasse, le texte de la diapo 45 définit M<sub>i,j</sub> = nombre d'exemples de la classe i prédits j (lignes = réel), alors que sa figure met le prédit en lignes. À l'examen, <b>écris l'orientation en tête de ta matrice</b>. Précision de k = M[k,k] / nb de prédictions k ; sensibilité de k = M[k,k] / nb de vrais k.</p></div>\n<div><h3>Métriques</h3>\n<div class=\"math\">\\[\\begin{aligned}\n\\text{Accuracy} &= \\frac{TP+TN}{TP+TN+FP+FN}\\\\\n\\text{Sensibilité (rappel)} &= \\frac{TP}{TP+FN} && \\text{taux de vrais positifs}\\\\\n\\text{Précision} &= \\frac{TP}{TP+FP}\\\\\n\\text{Spécificité} &= \\frac{TN}{TN+FP} && \\text{taux de vrais négatifs}\\\\\nF_1 &= \\frac{2\\,P\\,R}{P+R}=\\frac{2\\,TP}{2\\,TP+FP+FN}\\\\\n\\text{FPR} &= \\frac{FP}{FP+TN}=1-\\text{spécificité}\n\\end{aligned}\\]</div></div>\n</div>\n<ul>\n  <li>Accuracy trompeuse si classes <b>déséquilibrées</b> : prédire toujours la classe majoritaire donne une bonne accuracy et une sensibilité nulle.</li>\n  <li>Sensibilité facile à maximiser en prédisant tout positif → regarder aussi précision / spécificité.</li>\n  <li>Sensibilité prioritaire quand rater un positif coûte cher : dépistage d'une maladie, fraude.</li>\n  <li><b>Multiclasse</b> : one-versus-all par classe, puis on combine :\n    <ul><li><b>macro-average</b> = moyenne simple des scores par classe → ne néglige pas les classes rares ;</li>\n    <li><b>weighted-average</b> = pondérée par le support (effectif) ;</li>\n    <li><b>micro-average</b> = on somme les TP, FP… de toutes les classes ; pour la précision, ça revient à l'<b>accuracy</b>.</li></ul></li>\n  <li>Régression : MSE = 1/n Σ(yᵢ − f(xᵢ))², RMSE = √MSE.</li>\n</ul>\n<h3>Sur-apprentissage, biais-variance</h3>\n<ul>\n  <li><b>Généralisation</b> : bien prédire sur des données qui n'ont pas servi à construire le modèle.</li>\n  <li><b>Sur-apprentissage</b> : modèle trop complexe, capture le bruit (variance forte). <b>Sous-apprentissage</b> : modèle trop simple, mauvais même sur l'apprentissage (biais fort).</li>\n  <li><b>Biais</b> : à quel point f(x) vise à côté de la vraie étiquette. <b>Variance</b> : à quel point f change quand les données d'apprentissage changent.</li>\n</ul>\n<figure class=\"viz\" data-viz=\"biasvar\"></figure>\n<h3>Sélection de modèle</h3>\n<div class=\"scroll\"><table class=\"t\">\n<tr><th>Apprentissage</th><th>Validation</th><th>Test</th></tr>\n<tr><td>apprendre les paramètres</td><td>comparer les modèles → choisir les hyperparamètres</td><td>évaluer la performance finale du modèle choisi, sur des données jamais vues</td></tr></table></div>\n<ul>\n  <li><b>Validation croisée K-fold</b> : découper en K parties ; pour chaque partie k, entraîner sur les K−1 autres et évaluer sur k ; moyenner les K scores. Répéter pour chaque valeur d'hyperparamètre, garder la meilleure, réentraîner sur tout.</li>\n  <li>Les noms « validation » et « test » sont parfois inversés dans la littérature. Ce qui compte : le troisième jeu sert à évaluer le modèle <i>sélectionné</i>. Avec seulement deux jeux, c'est le jeu de test qui sert à sélectionner.</li>\n  <li><b>Holdout</b> : un seul découpage (test trop petit → estimation très variable ; trop grand → le modèle voit trop peu de données). <b>Leave-p-out</b> : C(n,p) tests ; leave-one-out : n tests.</li>\n</ul>\n<figure class=\"viz\" data-viz=\"kfold\"></figure>\n<details class=\"fold\"><summary>Exercice du cours : précision macro vs micro</summary>\n<p style=\"margin-top:8px\">Situation 1 (TP/FP) : A 1/1, B 10/90, C 1/1, D 1/1 → précisions 0,5 ; 0,1 ; 0,5 ; 0,5. <b>Macro = 0,4</b> ; <b>micro = 13/106 ≈ 0,123</b>.<br>\nSituation 2 : A 0/2, B 90/10, C 0/2, D 0/2 → 0 ; 0,9 ; 0 ; 0. <b>Macro = 0,225</b> ; <b>micro = 90/106 ≈ 0,849</b>.<br>\nLe micro-average est dominé par la classe B, très représentée. Le macro-average révèle les mauvaises performances sur les classes rares.</p></details>",
 "reglog": "\n<ul>\n  <li><b>Classifieur linéaire</b> : la frontière de décision est un <span class=\"key\">hyperplan</span> (une droite en dimension 2). Il est composé d'une fonction affine h(x)=⟨w,x⟩+b, qui fixe l'hyperplan, et d'une fonction φ qui transforme la position par rapport à l'hyperplan en étiquette.</li>\n  <li>Linéaires : régression logistique, SVM (marge rigide/souple). Non linéaires : KNN, CART, SVM à noyau.</li>\n  <li>À utiliser si les données semblent (à peu près) linéairement séparables.</li>\n</ul>\n<div class=\"grid2\">\n<div><h3>Classifieur des demi-espaces</h3>\n<div class=\"math\">\\[f(x)=\\operatorname{sign}\\big(\\langle w,x\\rangle+b\\big)\\in\\{-1,1\\}\\]</div><p class=\"math-note\">Coût 0/1 : on minimise le nombre d'erreurs ; si les données sont séparables, n'importe quel hyperplan séparateur convient.</p></div>\n<div><h3>Régression logistique</h3>\n<div class=\"math\">\\[\\begin{aligned}\n&\\sigma(z)=\\frac{1}{1+e^{-z}}\\in\\,]0,1[\\\\\n&\\hat{\\mathbb P}(Y=1\\mid x)=\\sigma(\\langle w,x\\rangle+b)\\\\\n&(\\hat w,\\hat b)=\\operatorname*{arg\\,min}_{w,b}\\ \\frac1n\\sum_{i=1}^n\\log\\Big(1+\\exp\\big(-y_i(\\langle w,x_i\\rangle+b)\\big)\\Big)\\\\\n&\\hat y=1 \\ \\text{ si } \\sigma(\\langle \\hat w,x\\rangle+\\hat b)\\ge\\alpha,\\quad \\text{sinon } \\hat y=-1\n\\end{aligned}\\]</div><p class=\"math-note\">α = 0,5 souvent ; le cours note le seuil α, les sujets le notent s.</p></div>\n</div>\n<ul>\n  <li>Dans ce chapitre, 𝒴 = {−1, 1} « sans perte de généralité ».</li>\n  <li>σ(0) = 1/2 : un point sur l'hyperplan a une probabilité 1/2. Loin de l'hyperplan, σ ≈ 0 ou 1. σ(⟨w,x⟩+b) s'interprète comme la probabilité que l'étiquette de x soit 1.</li>\n  <li><b>Pourquoi ce coût ?</b> On veut pénaliser un point mal classé (y(⟨w,x⟩+b) &lt; 0), d'autant plus qu'il est loin de l'hyperplan, et un peu un point bien classé mais proche de l'hyperplan. 1 + exp(−y(⟨w,x⟩+b)) a ce comportement, et on prend le log (croissant).</li>\n  <li>Le coût 0/1 des demi-espaces est difficile à minimiser et ne pénalise <i>que</i> les erreurs : la droite peut frôler les points → <b>risque de sur-apprentissage</b>. La logistique évite mieux cet écueil et donne une probabilité.</li>\n  <li>Seuil α &lt; 0,5 : plus de positifs prédits → sensibilité ↑. Ça a du sens quand rater un positif est grave (ex. prédire une maladie).</li>\n</ul>\n<figure class=\"viz\" data-viz=\"sigmoid\"></figure>\n<h3>Courbe ROC et AUC</h3>\n<ul>\n  <li>Pour chaque seuil s de 0 à 1 : on classe, on calcule <b>FPR</b> (abscisse) et <b>TPR = sensibilité</b> (ordonnée). La courbe relie ces points.</li>\n  <li>s = 0 → tout positif : point (1,1). s &gt; score maximal → tout négatif : point (0,0). Pour la logistique, s = 1 suffit car σ &lt; 1.</li>\n  <li><b>Procédure du cours (à la main)</b> : trier les observations de validation par score décroissant. Partir de (0,0). Parcourir les points dans cet ordre : un vrai positif fait monter de 1/P (pas vertical), un vrai négatif fait avancer de 1/N (pas horizontal). Si plusieurs observations ont le même score, on les traite ensemble : on monte de (nb de positifs)/P et on avance de (nb de négatifs)/N en même temps, ce qui donne un segment oblique. On arrive en (1,1).</li>\n  <li>Classifieur parfait : passe par (0,1), AUC = 1. Classifieur aléatoire : diagonale, AUC = 0,5.</li>\n  <li>L'AUC sur l'échantillon de validation sert à comparer des modèles (ex. choix des variables). La courbe ROC aide à choisir le seuil.</li>\n  <li>Pour un KNN ou un arbre, le score est la <b>proportion de voisins (ou d'observations de la feuille) de classe 1</b>.</li>\n</ul>\n<figure class=\"viz\" data-viz=\"roc\"></figure>\n<div class=\"todo-proof\" id=\"roc-kaggle\"><h3>Question pour lundi : la courbe ROC calculée par Kaggle</h3>\n<p class=\"math-note\">Demi-journée data science : à quoi ressemble la courbe ROC que Kaggle calcule à partir d'un de vos fichiers de soumission ?</p>\n<ul>\n  <li>Kaggle trace la ROC à partir de la colonne de prédictions du fichier, en faisant varier un seuil sur ces valeurs, comme en cours. Les vraies étiquettes utilisées sont celles du jeu de test de Kaggle, que vous ne voyez pas.</li>\n  <li>Si le fichier contient des <b>étiquettes 0/1</b> (la classe prédite, par ex. après un seuil de 0,5), il n'y a que deux valeurs : un seul seuil « utile » sépare les prédictions. La courbe n'a donc que <b>3 points</b> : (0,0), le point (FPR, TPR) du classifieur, et (1,1). Ce sont <b>deux segments de droite</b>, un « coude » unique : toutes les prédictions 0 sont ex aequo, de même que toutes les prédictions 1, donc chaque groupe donne un segment oblique. Si toutes les prédictions sont identiques, on obtient la diagonale et AUC = 0,5.</li>\n  <li>Son aire vaut alors \\(\\text{AUC}=\\dfrac{\\text{TPR}+(1-\\text{FPR})}{2}=\\dfrac{\\text{sensibilité}+\\text{spécificité}}{2}\\) : c'est la moyenne de la sensibilité et de la spécificité, en général plus faible que l'AUC obtenue avec les scores.</li>\n  <li>Pour obtenir une vraie courbe en escalier (et une meilleure AUC), il faut soumettre des <b>scores ou probabilités</b> : <code>predict(fit, type=\"response\")</code> pour la logistique, <code>predict(tree, type=\"prob\")</code> pour un arbre, la proportion de voisins de classe 1 pour un KNN.</li>\n</ul>\n<figure class=\"viz\" data-viz=\"kaggle\"></figure></div>\n<h3>Multiclasse</h3>\n<div class=\"scroll\"><table class=\"t\">\n<tr><th></th><th>One-versus-all</th><th>One-versus-one</th></tr>\n<tr><th>nb de classifieurs</th><td>C</td><td>C(C−1)/2</td></tr>\n<tr><th>données utilisées</th><td>toutes (classe k = positifs, reste = négatifs)</td><td>seulement les 2 classes de la paire</td></tr>\n<tr><th>prédiction</th><td>classe de score σ max</td><td>vote majoritaire</td></tr></table></div>\n<p>Alternative : régression softmax (un seul modèle global).</p>\n<div class=\"tp\"><b>TP3 (prostate, 53 patients) :</b> <code>glm(lymph ~ ..., family=\"binomial\")</code> ; on passe <code>acid</code> au log (loi très dissymétrique). Avec s = 1/2 : 3/33 faux positifs et 6/20 faux négatifs. Meilleur modèle selon l'AUC sur validation : log(acid) + taille.</div>",
 "cart": "\n<ul>\n  <li><b>Arbre de décision</b> : chaque nœud teste une condition sur <b>une seule variable</b> ; les feuilles portent une étiquette. Modèle hiérarchique : chaque test dépend des précédents.</li>\n  <li>Atouts : variables qualitatives sans encodage (apprentissage non métrique), données hétérogènes, multiclasse direct, classes multimodales, <b>interprétable</b>.</li>\n  <li><b>CART</b> : partitionnement glouton, récursif, divisif ; arbre <b>binaire</b> ; frontières <span class=\"key\">orthogonales aux axes</span>. Plusieurs séparateurs linéaires donnent une frontière globale non linéaire.</li>\n  <li>Nombre de régions = nombre de feuilles. Feuille : vote majoritaire (classification) ou moyenne (régression).</li>\n</ul>\n<h3>Choix d'une coupure</h3>\n<div class=\"math\">\\[IG(R_l,R_m)=\\mathcal I(R)-\\frac{n_l}{n}\\,\\mathcal I(R_l)-\\frac{n_m}{n}\\,\\mathcal I(R_m)\\qquad(n=\\text{effectif du nœud }R)\\]</div><p class=\"math-note\">« Gain d'information » : on choisit la variable séparatrice x<sup>j</sup> et le seuil (s si elle est continue, ensemble S de modalités si elle est qualitative) qui le maximisent.</p><div class=\"math\">\\[\\begin{aligned}\n\\text{Gini} &:\\ \\mathcal I(R)=\\sum_{k} p_k(1-p_k)=1-\\sum_k p_k^2\\\\\n\\text{Entropie} &:\\ \\mathcal I(R)=-\\sum_k p_k\\log_2 p_k\\\\\n\\text{Erreur} &:\\ \\mathcal I(R)=1-\\max_k p_k\\\\\n\\text{Régression} &:\\ \\text{minimiser } \\frac{n_l}{n}\\mathrm{MSE}(R_l)+\\frac{n_m}{n}\\mathrm{MSE}(R_m)\n\\end{aligned}\\]</div>\n<ul>\n  <li>Gini = Σ_{k≠k'} p_k p_k' : probabilité de mal étiqueter un exemple tiré au hasard dans R si on l'étiquetait au hasard selon la distribution des classes de R. Minimiser l'entropie revient à maximiser le gain d'information.</li>\n  <li>Exemple du cours : nœud [27, 18] → Gini = 1 − 0,6² − 0,4² = <b>0,48</b>. Feuille pure → 0.</li>\n  <li>Entropie maximale pour des classes équiprobables : 1 bit pour 2 classes à 50&nbsp;% / 50&nbsp;% (log₂ C bits pour C classes).</li>\n</ul>\n<h3>Coupures selon le type de variable</h3>\n<div class=\"scroll\"><table class=\"t\">\n<tr><th>Variable x^j</th><th>Régions R_l / R_m</th></tr>\n<tr><td>binaire</td><td>x^j = 1 / x^j = 0</td></tr>\n<tr><td>qualitative nominale</td><td>x^j ∈ S / x^j ∉ S (souvent Card(S) = 1)</td></tr>\n<tr><td>quantitative continue</td><td>x^j &lt; s / x^j ≥ s</td></tr>\n<tr><td>qualitative ordinale</td><td>par seuil (en respectant l'ordre) ou par regroupement de modalités</td></tr>\n<tr><td>quantitative discrète</td><td>par seuil en général ; regroupement si peu de valeurs (on perd l'ordre)</td></tr></table></div>\n<p>À comparer avec les KNN et la logistique : ils ont besoin d'une représentation numérique des variables, et la logistique passe par OvA ou OvO en multiclasse.</p>\n<figure class=\"viz\" data-viz=\"cart\"></figure>\n<h3>Taille de l'arbre</h3>\n<ul>\n  <li>Arbre peu profond → sous-apprentissage ; trop profond → sur-apprentissage.</li>\n  <li>Stratégie 1 : profondeur max, nb de feuilles max, effectif min par feuille, choisis par validation croisée. Profondeur ↑ : biais ↓, variance ↑.</li>\n  <li>Stratégie 2 : <b>élagage</b>. On construit l'arbre maximal (feuilles pures), puis on garde le sous-arbre minimisant\n  <div class=\"math\">\\[C_\\lambda(T)=\\sum_{l=1}^{|T|} n_l\\,\\mathcal I(R_l)+\\lambda\\,|T|\\]</div>\n  λ choisi sur la validation. <span class=\"key\">λ ↑ → arbre plus petit → biais ↑, variance ↓.</span></li>\n  <li>|T| = 1 : on prédit la classe majoritaire, erreur d'apprentissage = proportion des autres classes. Arbre maximal : erreur d'apprentissage = 0.</li>\n  <li>Les arbres sont des <b>apprenants faibles</b> → méthodes ensemblistes (bagging, forêts aléatoires, boosting).</li>\n</ul>\n<div class=\"tp\"><b>TP4 :</b> <code>rpart</code> utilise Gini par défaut. <code>cp</code> joue le rôle de λ : <code>printcp</code>/<code>plotcp</code>, on garde le cp qui minimise <code>xerror</code> (erreur de validation croisée 10-fold par défaut), puis <code>prune(tree, cp=bestcp)</code>. Sur un nœud de <code>rpart.plot</code>, la correction lit : classe majoritaire, « indice d'impureté » (en pratique, la proportion de la classe 1 dans le nœud), % des individus.</div>",
 "svm": "\n<ul>\n  <li><b>Linéairement séparable</b> : il existe un hyperplan avec tous les positifs d'un côté et tous les négatifs de l'autre. Il en existe alors une infinité.</li>\n  <li>SVM : on choisit celui qui <b>maximise la marge</b> γ = distance de l'hyperplan au point le plus proche. C'est robuste aux petites perturbations.</li>\n  <li>Distance d'un point à l'hyperplan : \\(d(x,H)=\\dfrac{|\\langle w,x\\rangle+b|}{\\|w\\|}\\). Avec la normalisation des contraintes, <span class=\"key\">\\(\\gamma=1/\\|w\\|\\)</span>.</li>\n  <li><b>Vecteurs de support</b> (marge rigide) : points sur H<sup>+</sup> : ⟨w,x⟩+b = 1 et H<sup>−</sup> : ⟨w,x⟩+b = −1. Seuls eux définissent l'hyperplan. La zone entre H<sup>+</sup> et H<sup>−</sup> est la zone d'indécision ; en marge rigide, elle ne contient aucune observation.</li>\n</ul>\n<div class=\"grid2\">\n<div><h3>Marge rigide (primal)</h3>\n<div class=\"math\">\\[\\begin{aligned}\n&\\min_{w,b}\\ \\tfrac12\\|w\\|^2\\\\\n&\\text{s.c. } y_i(\\langle w,x_i\\rangle+b)\\ge 1\\quad\\forall i\\\\\n&\\text{classifieur : } \\operatorname{sign}(\\langle\\hat w,x\\rangle+\\hat b)\n\\end{aligned}\\]</div></div>\n<div><h3>Dual (marge rigide)</h3>\n<div class=\"math\">\\[\\begin{aligned}\n&\\max_{\\alpha}\\ \\sum_i\\alpha_i-\\tfrac12\\sum_i\\sum_j\\alpha_i\\alpha_j y_iy_j\\langle x_i,x_j\\rangle\\\\\n&\\text{s.c. }\\textstyle\\sum_i\\alpha_iy_i=0,\\quad \\alpha_i\\ge0\\\\\n&\\hat w=\\textstyle\\sum_i\\hat\\alpha_i y_i x_i\\\\\n&\\hat b=1-\\min_{i\\,:\\,y_i=1}\\langle\\hat w,x_i\\rangle\\\\\n&\\text{classifieur : }\\operatorname{sign}\\big(\\textstyle\\sum_i\\hat\\alpha_i y_i\\langle x_i,x\\rangle+\\hat b\\big)\n\\end{aligned}\\]</div></div>\n</div>\n<ul>\n  <li>Problème convexe et quadratique. Le primal est en dimension d+1, le dual en n : peu de données et beaucoup de variables → dual ; beaucoup de données et peu de variables → primal.</li>\n  <li>Lagrangien : L(w,b,α) = ½‖w‖² + Σ αᵢ(1 − yᵢ(⟨w,xᵢ⟩+b)), αᵢ ≥ 0. Primal = min_{w,b} max_α L ; dual = max_α min_{w,b} L. Dualité faible : d* ≤ p*. Problème convexe à contraintes affines → <b>condition de Slater</b> → saut de dualité nul (d* = p*).</li>\n  <li>KKT, écart complémentaire : α̂ᵢ [yᵢ(⟨ŵ,xᵢ⟩+b̂) − 1] = 0. Deux cas : un point strictement au-delà de H<sup>±</sup> (yᵢ(⟨ŵ,xᵢ⟩+b̂) &gt; 1) a α̂ᵢ = 0 ; si α̂ᵢ &gt; 0, le point est sur H<sup>±</sup> (vecteur de support). Le dual identifie des vecteurs de support (pas forcément tous).</li>\n</ul>\n<h3>Marge souple</h3>\n<div class=\"math\">\\[\\begin{aligned}\n&\\min_{w,b,\\xi}\\ \\tfrac12\\|w\\|^2+C\\sum_{i=1}^n\\xi_i\\\\\n&\\text{s.c. } y_i(\\langle w,x_i\\rangle+b)\\ge1-\\xi_i,\\quad \\xi_i\\ge0\\\\\n\\iff\\ &\\min_{w,b}\\ \\frac{1}{2Cn}\\|w\\|^2+\\frac1n\\sum_{i=1}^n \\max\\big(0,\\,1-y_i(\\langle w,x_i\\rangle+b)\\big)\n\\end{aligned}\\]</div><p class=\"math-note\">Le terme max(0, …) est la <b>perte hinge</b>. C'est une minimisation du risque empirique <b>régularisé</b> : la régularisation ‖w‖²/(2Cn) évite le sur-apprentissage.</p>\n<div class=\"scroll\"><table class=\"t\">\n<tr><th>ξᵢ = 0</th><th>0 &lt; ξᵢ &lt; 1</th><th>ξᵢ = 1</th><th>ξᵢ &gt; 1</th></tr>\n<tr><td>bien classé, hors de la zone d'indécision (ou sur H<sup>±</sup>)</td><td>bien classé mais dans la zone d'indécision</td><td>sur l'hyperplan H</td><td><b>mal classé</b></td></tr></table></div>\n<div class=\"math\">\\[\\begin{aligned}\n&\\text{Dual souple : même problème avec } 0\\le\\alpha_i\\le C\\\\\n&\\hat b=y_i-\\textstyle\\sum_j\\hat\\alpha_j y_j\\langle x_j,x_i\\rangle\\quad\\text{pour un } i \\text{ tel que } 0\\lt\\hat\\alpha_i\\lt C\\\\\n&\\text{KKT : }\\hat\\alpha_i\\big[y_i(\\langle\\hat w,x_i\\rangle+\\hat b)-1+\\xi_i\\big]=0\n\\end{aligned}\\]</div><p class=\"math-note\">\\(\\hat\\alpha_i>0\\) et \\(\\xi_i=0\\) ⇒ vecteur de support (sur H<sup>±</sup>) ; \\(\\hat\\alpha_i>0\\) et \\(\\xi_i>0\\) ⇒ outlier.</p><p class=\"math-note\">S'il n'existe aucun i tel que \\(0\\lt\\hat\\alpha_i\\lt C\\) (rare), le cours conseille de changer C.</p>\n<ul>\n  <li>En marge souple, le classifieur n'utilise que les points tels que α̂ᵢ &gt; 0 : vecteurs de support et outliers (points dans la marge ou mal classés).</li>\n  <li>Paramètres : w, b (et les ξᵢ). <b>Hyperparamètre : C</b>.</li>\n  <li><span class=\"key\">C grand</span> → on préfère minimiser le nombre d'outliers : marge étroite, peu de points dans la marge → biais ↓, variance ↑. C → ∞ redonne la marge rigide.</li>\n  <li><span class=\"key\">C petit</span> → on accorde moins d'importance aux outliers : marge large, beaucoup de points dans la marge → biais ↑, variance ↓.</li>\n  <li>Même sur des données séparables, la marge souple peut mieux généraliser.</li>\n</ul>\n<figure class=\"viz\" data-viz=\"svm\"></figure>\n<h3>SVM à noyau</h3>\n<ul>\n  <li>Utile quand les données ne sont <b>pas séparables linéairement, même à quelques points près</b>. On les envoie par φ dans un espace où elles le deviennent.</li>\n  <li><b>Astuce du noyau</b> : φ n'apparaît que via ⟨φ(xᵢ),φ(xⱼ)⟩ dans le dual et le classifieur. On calcule directement k(xᵢ,xⱼ) sans calculer φ, ce qui est moins coûteux. Pas besoin de connaître φ.</li>\n  <li>L'astuce du noyau intervient dans le problème <b>dual</b>. Le noyau k est un hyperparamètre.</li>\n  <li>Exemple du cours : φ(x) = (1, x₁…x_d, x₁x₁, x₁x₂, …, x_d x_d) donne ⟨φ(x),φ(x̃)⟩ = 1 + ⟨x,x̃⟩ + ⟨x,x̃⟩². Le calcul direct coûte O(d²), la formule de droite O(d).</li>\n  <li>k valide si <b>symétrique</b> (k(x,x̃) = k(x̃,x)) et <b>semi-défini positif</b> : ∀N, ∀x₁…x_N, ∀a₁…a_N ∈ ℝ, ΣΣ aᵢaⱼ k(xᵢ,xⱼ) ≥ 0. Alors il existe φ telle que k(x,x̃) = ⟨φ(x),φ(x̃)⟩ (théorème de Moore-Aronszajn). Matrice de Gram K<sub>ij</sub> = k(xᵢ,xⱼ).</li>\n</ul>\n<figure class=\"viz\" data-viz=\"kernel\"></figure>\n<div class=\"math\">\\[\\begin{aligned}\n\\text{linéaire} &:\\ k(x,x')=\\langle x,x'\\rangle\\\\\n\\text{cosinus} &:\\ k(x,x')=\\frac{\\langle x,x'\\rangle}{\\|x\\|\\,\\|x'\\|}\\\\\n\\text{quadratique} &:\\ k(x,x')=(\\langle x,x'\\rangle+c)^2\\\\\n\\text{polynomial} &:\\ k(x,x')=(\\langle x,x'\\rangle+c)^q\\\\\n\\text{gaussien }(\\Sigma) &:\\ k(x,x')=\\exp\\big(-\\tfrac12(x-x')^\\top\\Sigma^{-1}(x-x')\\big)\\\\\n\\text{gaussien / RBF} &:\\ k(x,x')=\\exp\\Big(-\\frac{\\|x-x'\\|^2}{2\\sigma^2}\\Big)=e^{-\\gamma\\|x-x'\\|^2},\\quad \\gamma=\\frac1{2\\sigma^2}\n\\end{aligned}\\]</div><div class=\"math\">\\[\\begin{aligned}\n&\\text{dual : }\\max_\\alpha\\ \\sum_i\\alpha_i-\\tfrac12\\sum_{i,j}\\alpha_i\\alpha_jy_iy_j\\,k(x_i,x_j),\\quad 0\\le\\alpha_i\\le C\\\\\n&\\hat b=y_i-\\textstyle\\sum_j\\hat\\alpha_jy_j\\,k(x_j,x_i)\\quad\\text{pour } 0\\lt\\hat\\alpha_i\\lt C\\\\\n&\\text{classifieur : } f(x)=\\operatorname{sign}\\big(\\textstyle\\sum_i\\hat\\alpha_iy_i\\,k(x_i,x)+\\hat b\\big)\n\\end{aligned}\\]</div>\n<ul>\n  <li>Hyperparamètres : <b>C, le noyau, ses paramètres</b> (γ ou σ ; degré q et c).</li>\n  <li>RBF : <span class=\"key\">γ grand (σ petit) → frontière très locale, « îlots » autour des points → variance ↑</span> ; γ petit (σ grand) → frontière lisse, presque linéaire → biais ↑.</li>\n  <li>Exemple : (⟨x,x'⟩+c)² = ⟨φ(x),φ(x')⟩ avec φ(z) = (c, √(2c) z₁…z_d, √2 z_i z_j (i&lt;j), z₁²…z_d²).</li>\n</ul>\n<figure class=\"viz\" data-viz=\"rbf\"></figure>\n<div class=\"tp\"><b>TP5 :</b> <code>svm(y~., kernel=\"linear\", cost=C, scale=FALSE)</code> (e1071). La marge 1/‖w‖ diminue quand C augmente. <code>tune(..., ranges=list(cost=...))</code> fait la validation croisée. Calculer φ à la main est plus lent que le noyau polynomial quand d grandit. Piège : <code>svm()</code> standardise par défaut (<code>scale=TRUE</code>). Avec γ = 0,01 et C = 10, les données standardisées donnent une frontière où la classe majoritaire est prédite partout. Sur données brutes (<code>scale=FALSE</code>), les distances sont plus grandes, donc à γ fixé la frontière est plus locale.</div>",
 "clust": "\n<ul>\n  <li><b>But</b> : séparer des données non étiquetées en groupes <b>homogènes</b> (points proches dans le même cluster) et <b>séparés</b> (clusters distincts). C'est une analyse exploratoire.</li>\n  <li><b>Distance</b> : symétrie, séparation, inégalité triangulaire. Euclidienne, Manhattan, Minkowski, Chebyshev, Mahalanobis ; χ² et Jaccard pour le qualitatif ; Gower (ne satisfait pas l'inégalité triangulaire, donc pas une vraie distance).</li>\n  <li>Variables mixtes : rendre les quantitatives qualitatives (découpage en classes), ou les qualitatives quantitatives (one-hot), ou tout rendre qualitatif puis faire une ACM et utiliser les coordonnées.</li>\n  <li>Deux stratégies : « ne pas séparer des points proches » (ex. CAH lien simple) contre « ne pas mettre des points trop éloignés dans un même cluster » (ex. 2-moyennes).</li>\n  <li>Nombre de partitions possibles : nombre de Bell B_n = (1/e) Σ_{k≥1} kⁿ/k!, énorme (B₅₀ ≥ 10⁴⁷). On ne peut pas tout explorer → algorithmes itératifs : hiérarchiques (agglomératifs ou divisifs), par partitionnement (K-moyennes), probabilistes (modèles de mélange).</li>\n</ul>\n<h3>Critères de qualité</h3>\n<div class=\"math\">\\[\\begin{aligned}\n\\text{centroïde} &:\\ \\mu_k=\\frac1{|C_k|}\\sum_{x\\in C_k}x\\\\\n\\text{homogénéité} &:\\ T_k=\\frac1{|C_k|}\\sum_{x\\in C_k}d(x,\\mu_k),\\qquad T=\\frac1K\\sum_k T_k \\quad(\\text{petit})\\\\\n\\text{séparabilité} &:\\ S_{kl}=d(\\mu_k,\\mu_l),\\qquad S=\\frac{2}{K(K-1)}\\sum_{k=1}^K\\sum_{l=k+1}^K S_{kl} \\quad(\\text{grand})\\\\\n\\text{Davies-Bouldin} &:\\ D_k=\\max_{l\\ne k}\\frac{T_k+T_l}{S_{kl}},\\qquad D=\\frac1K\\sum_k D_k \\quad(\\text{à minimiser})\\\\\n\\text{silhouette} &:\\ s(x)=\\frac{b(x)-a(x)}{\\max\\big(a(x),b(x)\\big)}\\in[-1,1] \\quad(\\text{moyenne à maximiser})\\\\\n&\\ \\ a(x)=\\frac{1}{|C_{k(x)}|-1}\\sum_{y\\in C_{k(x)},\\,y\\ne x}d(x,y),\\qquad b(x)=\\min_{l\\ne k(x)}\\frac1{|C_l|}\\sum_{y\\in C_l}d(x,y)\n\\end{aligned}\\]</div><p class=\"math-note\">a(x) : distance moyenne aux autres points de son cluster. b(x) : plus petite distance moyenne à un autre cluster.</p>\n<ul>\n  <li>s(x) proche de 1 : bien assigné. <b>s(x) &lt; 0</b> : x est en moyenne plus proche d'un autre cluster que du sien, donc probablement mal assigné.</li>\n</ul>\n<figure class=\"viz\" data-viz=\"silhouette\"></figure>\n<h3>Inertie</h3>\n<div class=\"math\">\\[\\begin{aligned}\nI&=\\sum_{i=1}^n\\|x_i-\\mu\\|^2=I_W+I_B\\\\\nI_W&=\\sum_{k=1}^K\\sum_{x_i\\in C_k}\\|x_i-\\mu_k\\|^2 && \\text{intra-classes : homogénéité (petit)}\\\\\nI_B&=\\sum_{k=1}^K|C_k|\\,\\|\\mu_k-\\mu\\|^2 && \\text{inter-classes : séparation (grand)}\n\\end{aligned}\\]</div><p class=\"math-note\">\\(\\mu=\\frac1n\\sum_{i=1}^n x_i\\) (centre de gravité du nuage), \\(\\mu_k=\\frac1{|C_k|}\\sum_{x_i\\in C_k}x_i\\).</p>\n<div class=\"todo-proof\" id=\"preuve-inertie\"><h3>Démonstration à savoir : \\(I=I_W+I_B\\)</h3>\n<p class=\"math-note\">Demandée pour lundi. C'est la démonstration de la correction de l'exercice 1 du TP clustering.</p>\n<p><b>Rappel utile.</b> Pour \\(x,y\\in\\mathbb R^d\\) : \\(\\|x+y\\|^2=\\langle x+y,x+y\\rangle=\\|x\\|^2+\\|y\\|^2+2\\langle x,y\\rangle\\).</p>\n<div class=\"math\">\\[\\begin{aligned}\nI=\\sum_{i=1}^n\\|x_i-\\mu\\|^2\n&=\\sum_{k=1}^K\\sum_{x_i\\in C_k}\\|x_i-\\mu\\|^2 &&\\text{(les } C_k \\text{ forment une partition)}\\\\\n&=\\sum_{k=1}^K\\sum_{x_i\\in C_k}\\big\\|(x_i-\\mu_k)+(\\mu_k-\\mu)\\big\\|^2 &&\\text{(on ajoute et retire } \\mu_k)\\\\\n&=\\sum_{k=1}^K\\sum_{x_i\\in C_k}\\Big(\\|x_i-\\mu_k\\|^2+\\|\\mu_k-\\mu\\|^2+2\\langle x_i-\\mu_k,\\ \\mu_k-\\mu\\rangle\\Big) &&\\text{(rappel)}\\\\\n&=\\underbrace{\\sum_{k=1}^K\\sum_{x_i\\in C_k}\\|x_i-\\mu_k\\|^2}_{I_W}+\\underbrace{\\sum_{k=1}^K|C_k|\\,\\|\\mu_k-\\mu\\|^2}_{I_B}+2\\sum_{k=1}^K\\Big\\langle \\sum_{x_i\\in C_k}(x_i-\\mu_k),\\ \\mu_k-\\mu\\Big\\rangle\n\\end{aligned}\\]</div>\n<p><b>Le terme croisé est nul</b>, par bilinéarité du produit scalaire et par définition de \\(\\mu_k=\\frac1{|C_k|}\\sum_{x_i\\in C_k}x_i\\) :</p>\n<div class=\"math\">\\[\\sum_{x_i\\in C_k}\\langle x_i-\\mu_k,\\ \\mu_k-\\mu\\rangle=\\Big\\langle \\sum_{x_i\\in C_k}x_i-|C_k|\\,\\mu_k,\\ \\mu_k-\\mu\\Big\\rangle=\\langle |C_k|\\mu_k-|C_k|\\mu_k,\\ \\mu_k-\\mu\\rangle=0.\\]</div>\n<p>Le terme \\(\\|\\mu_k-\\mu\\|^2\\) ne dépend pas de \\(i\\) : sommé sur les \\(|C_k|\\) points du cluster, il donne \\(|C_k|\\,\\|\\mu_k-\\mu\\|^2\\). D'où <span class=\"key\">\\(I=I_W+I_B\\)</span>. Comme \\(I\\) ne dépend pas de la partition, minimiser \\(I_W\\) revient à maximiser \\(I_B\\).</p></div>\n<h3>Classification ascendante hiérarchique (CAH)</h3>\n<ul>\n  <li><b>Agglomératif</b> (CAH) : au départ, chaque point est un cluster. À chaque étape on <b>fusionne les deux clusters les plus proches</b>, jusqu'à n'en avoir plus qu'un. <b>Divisif</b> : on part d'un seul cluster et on coupe en deux à chaque étape. Résultat : un <b>dendrogramme</b> (hauteur = distance de fusion).</li>\n  <li>Liens : <b>simple</b> min d(x,y) (effet de chaîne : suit des formes allongées, des anneaux) ; <b>complet</b> max d(x,y) (clusters compacts) ; <b>moyen</b> ; <b>centroïdal</b> d(μ_k,μ_l). Ces liens ne sont pas forcément des distances au sens mathématique (lien complet : d(C,C) ≠ 0 si |C| &gt; 1).</li>\n  <li><b>Ward</b> : \\(\\dfrac{|C_k|\\,|C_l|}{|C_k|+|C_l|}\\,\\|\\mu_k-\\mu_l\\|^2\\) = hausse de I_W (= perte de I_B) lors de la fusion. Elle maximise l'homogénéité et la séparabilité. Comme f(x,y) = xy/(x+y) est petit dès qu'un des deux effectifs est petit, et maximal à x+y fixé quand x = y, Ward fusionne d'abord les petits groupes et pénalise la fusion de deux gros groupes : elle crée des groupes d'effectifs équilibrés.</li>\n  <li><b>Inversions</b> : avec les liens simple, complet, moyen et Ward, les hauteurs de fusion sont croissantes (axiome de la médiane). Avec le lien centroïdal, deux branches peuvent se rejoindre plus bas que leurs descendants : on appelle ça une inversion.</li>\n  <li>Choisir le nombre de clusters : couper le dendrogramme avant une grande branche, arrêter les fusions au-delà d'un seuil r (arbitraire, ou r = α·max d(xᵢ,xⱼ) avec α &lt; 1), ou maximiser la silhouette sur les différentes coupes.</li>\n  <li>Pas besoin de fixer K à l'avance, mais <span class=\"key\">complexité quadratique : O(dn²) opérations par itération</span>, et stockage des distances.</li>\n</ul>\n<figure class=\"viz\" data-viz=\"cah\"></figure>\n<h3>K-moyennes (algorithme de Lloyd)</h3>\n<ol class=\"algo\"><li>Choisir K centroïdes au hasard parmi les points (ou K-means++ : bien dispersés).</li><li>Affecter chaque point au centroïde le plus proche (cellules de Voronoï) : \\(k(x_i)=\\operatorname*{arg\\,min}_k\\|x_i-\\mu_k\\|^2\\).</li><li>Recalculer chaque centroïde : \\(\\mu_k=\\frac1{|C_k|}\\sum_{x_i\\in C_k}x_i\\).</li><li>Répéter 2–3 jusqu'à ce que les affectations ne changent plus.</li></ol>\n<ul>\n  <li>I_W diminue à chaque itération → convergence, mais vers un <b>minimum local</b> → relancer avec plusieurs initialisations (<code>nstart</code>) et garder la plus faible I_W.</li>\n  <li>Choix de K : I_W diminue toujours quand K augmente → <b>méthode du coude</b> (cassure de pente). Silhouette, Davies-Bouldin.</li>\n  <li><b>Complexité</b> : K·n distances par itération → O(nKdT), <b>linéaire en n</b>. On remplace les n−1 distances d'un point aux autres points (CAH) par K distances aux centroïdes.</li>\n  <li>On peut <b>combiner</b> les deux : un K-means avec K grand (une fraction importante de n), puis une CAH sur les centroïdes obtenus.</li>\n  <li>Clusters <b>convexes</b> (Voronoï) : échoue sur anneaux ou lunes. Solutions : astuce du noyau appliquée à l'algorithme de Lloyd / transformation φ(x,y) = (x, y, x²+y²), ou CAH lien simple.</li>\n  <li>Sensible aux valeurs aberrantes : elles finissent seules dans un cluster, ce qui permet aussi de les détecter. Les <b>K-médoïdes</b> sont plus robustes. Le médoïde d'une classe est le point de la classe dont la dissimilarité moyenne aux autres points de la classe est minimale (l'observation la plus centrale).</li>\n  <li><b>Compression d'image</b> : chaque pixel est un point (R,G,B). On fait un K-means et on remplace chaque pixel par la couleur de son centroïde → K couleurs. K = 1 → image unie de couleur moyenne. La CAH serait trop coûteuse avec des millions de pixels.</li>\n</ul>\n<figure class=\"viz\" data-viz=\"kmeans\"></figure>\n<h3>Évaluer un clustering</h3>\n<ul><li>Pas de vérité terrain : il faut des critères qui ne dépendent pas d'étiquettes connues.</li>\n<li><b>Stabilité</b> : collecter plus de données, perturber ou supprimer quelques observations, ou changer l'initialisation ne doit pas changer complètement les conclusions.</li>\n<li><b>Évaluation externe</b> : a posteriori, un expert juge si les groupes ont du sens ; a priori, avec des données (partiellement) étiquetées, on vérifie si on retrouve les classes (indice de Rand).</li>\n<li><b>Évaluation interne</b> : Davies-Bouldin global, silhouette globale (homogénéité et séparabilité).</li></ul>\n<div class=\"tp\"><b>TP clustering :</b> anneaux concentriques → lien simple OK, K-means échoue ; avec φ(x,y)=(x,y,x²+y²) le K-means réussit. Avec φ = (x,y,x²,y²) et nstart = 20, les anneaux ne sont plus séparés : la « bonne » partition n'est pas celle qui minimise I_W. Iris standardisé : coude à K=3 ; Ward suggère 3 clusters ; la silhouette suggère 2 (setosa contre le reste).</div>"
};
export const cards = [
 {
  "id": "c_6cc96360",
  "ch": "intro",
  "q": "Différence entre apprentissage supervisé et non supervisé ?",
  "a": "Supervisé : on dispose des étiquettes yᵢ et on apprend f(x) ≈ y. Non supervisé : pas d'étiquettes ; on cherche une structure (clusters, dimension réduite, densité)."
 },
 {
  "id": "c_98d9a6a2",
  "ch": "intro",
  "q": "Quand parle-t-on de régression, de classification binaire, de multiclasse ?",
  "a": "Selon 𝒴 : 𝒴 ⊂ ℝ non fini → régression ; Card(𝒴)=2 → binaire ; Card(𝒴)=C>2 → multiclasse."
 },
 {
  "id": "c_af913e8f",
  "ch": "intro",
  "q": "Règle de décision optimale pour le coût 0/1 ?",
  "a": "Le classifieur de Bayes : f*(x) = argmax_k P(Y=k | X=x)."
 },
 {
  "id": "c_0c124f1c",
  "ch": "intro",
  "q": "Règle optimale pour le coût quadratique ? et pour le coût absolu ?",
  "a": "Quadratique : E[Y | X=x]. Absolu : médiane de Y | X=x."
 },
 {
  "id": "c_c70da021",
  "ch": "intro",
  "q": "Qu'est-ce que le risque empirique ?",
  "a": "R̂ₙ(f) = 1/n Σ ℓ(yᵢ, f(xᵢ)) : estimation du risque E[ℓ(Y,f(X))] à partir des données. Le paradigme ERM le minimise."
 },
 {
  "id": "c_fda622b9",
  "ch": "intro",
  "q": "Qu'est-ce qu'un biais inductif ?",
  "a": "Le choix a priori de restreindre la recherche de f à un sous-ensemble ℱ (ex. classifieurs linéaires)."
 },
 {
  "id": "c_48eda94b",
  "ch": "intro",
  "q": "Écrire le classifieur des K plus proches voisins.",
  "a": "f(x) = argmax_k Σ_{i : xᵢ∈N_K(x)} 1{yᵢ=k} : la classe majoritaire parmi les K plus proches voisins."
 },
 {
  "id": "c_a557a107",
  "ch": "intro",
  "q": "Hyperparamètres des KNN ?",
  "a": "Le nombre de voisins K (par validation croisée) et la distance (souvent euclidienne)."
 },
 {
  "id": "c_c855da32",
  "ch": "intro",
  "q": "Accuracy d'un 1-NN sur son propre jeu d'apprentissage ?",
  "a": "100 % (erreur nulle) : chaque point est son propre plus proche voisin. C'est du sur-apprentissage (sauf points identiques d'étiquettes différentes)."
 },
 {
  "id": "c_77d37204",
  "ch": "intro",
  "q": "Que prédit un KNN avec K = n ?",
  "a": "Toujours la classe majoritaire de l'apprentissage : sous-apprentissage."
 },
 {
  "id": "c_4a7b11ad",
  "ch": "intro",
  "q": "Effet de K sur le biais et la variance ?",
  "a": "K ↓ : variance ↑, biais ↓. K ↑ : biais ↑, variance ↓."
 },
 {
  "id": "c_c51313f5",
  "ch": "intro",
  "q": "Pourquoi standardiser avant un KNN ?",
  "a": "La distance est dominée par les variables de grande échelle. Min-max ou centrage-réduction remet les variables à égalité."
 },
 {
  "id": "c_87f2726a",
  "ch": "eval",
  "q": "Sensibilité (rappel) ?",
  "a": "TP / (TP + FN) : proportion de positifs correctement détectés (taux de vrais positifs)."
 },
 {
  "id": "c_0ce715ad",
  "ch": "eval",
  "q": "Précision ?",
  "a": "TP / (TP + FP) : proportion de prédictions positives correctes."
 },
 {
  "id": "c_95430a29",
  "ch": "eval",
  "q": "Spécificité ?",
  "a": "TN / (TN + FP) : taux de vrais négatifs."
 },
 {
  "id": "c_aa465313",
  "ch": "eval",
  "q": "F1-score ?",
  "a": "Moyenne harmonique de la précision et du rappel : 2PR/(P+R) = 2TP/(2TP+FP+FN)."
 },
 {
  "id": "c_50732990",
  "ch": "eval",
  "q": "Pourquoi l'accuracy pose problème avec des classes déséquilibrées ?",
  "a": "Prédire toujours la classe majoritaire donne une bonne accuracy et une sensibilité nulle sur la classe rare, qui est souvent la plus importante."
 },
 {
  "id": "c_542b51a0",
  "ch": "eval",
  "q": "Macro-average vs micro-average ?",
  "a": "Macro : moyenne simple des scores par classe (ne néglige pas les classes rares). Micro : on agrège TP/FP de toutes les classes ; pour la précision, c'est l'accuracy."
 },
 {
  "id": "c_cc0efa5c",
  "ch": "eval",
  "q": "Exemple où la macro-average est préférable ?",
  "a": "Diagnostic de plusieurs maladies dont certaines rares ; reconnaissance d'espèces rares. On veut que les petites classes comptent autant."
 },
 {
  "id": "c_9a2a8907",
  "ch": "eval",
  "q": "Rôle des jeux d'apprentissage, de validation et de test ?",
  "a": "Apprentissage : ajuster les paramètres. Validation : comparer les modèles et choisir les hyperparamètres. Test : évaluer le modèle final sur des données jamais vues."
 },
 {
  "id": "c_11e06c2d",
  "ch": "eval",
  "q": "Décrire la validation croisée 5-fold pour choisir K.",
  "a": "Découper en 5 parties. Pour chaque K candidat et chaque partie : entraîner sur 4, évaluer sur la 5ᵉ. Moyenner les 5 erreurs, garder le K de meilleure moyenne, réentraîner sur tout."
 },
 {
  "id": "c_c9a581dd",
  "ch": "eval",
  "q": "Sur-apprentissage vs sous-apprentissage ?",
  "a": "Sur : modèle trop complexe, qui colle au bruit ; très bon sur l'apprentissage, mauvais sur de nouvelles données. Sous : modèle trop simple, mauvais partout."
 },
 {
  "id": "c_543dcb74",
  "ch": "eval",
  "q": "Qu'est-ce que la variance d'un classifieur ?",
  "a": "Sa sensibilité aux données d'apprentissage : si on change l'échantillon, f change beaucoup. Variance très grande → sur-apprentissage, mauvaise généralisation."
 },
 {
  "id": "c_78b57e0a",
  "ch": "reglog",
  "q": "Qu'est-ce qu'un classifieur linéaire (sans formule) ?",
  "a": "Un classifieur dont la frontière de décision est un hyperplan : d'un côté une classe, de l'autre l'autre."
 },
 {
  "id": "c_763401dc",
  "ch": "reglog",
  "q": "Fonction sigmoïde et σ(0) ?",
  "a": "σ(z) = 1/(1+e^{−z}) ∈ ]0,1[, croissante ; σ(0) = 1/2."
 },
 {
  "id": "c_5e5b72be",
  "ch": "reglog",
  "q": "Coût minimisé par la régression logistique ?",
  "a": "1/n Σ log(1 + exp(−yᵢ(⟨w,xᵢ⟩+b))) avec yᵢ ∈ {−1,1}."
 },
 {
  "id": "c_bb715103",
  "ch": "reglog",
  "q": "Demi-espaces vs régression logistique ?",
  "a": "Demi-espaces : coût 0/1, seulement le côté de l'hyperplan compte. Logistique : la distance à l'hyperplan compte, on obtient une probabilité et une solution plus robuste."
 },
 {
  "id": "c_250036c0",
  "ch": "reglog",
  "q": "Comment construire une courbe ROC ?",
  "a": "Pour chaque seuil s ∈ [0,1], classer ŷ=1 si score ≥ s, puis tracer (FPR, TPR). Aléatoire : diagonale (AUC 0,5) ; parfait : AUC 1."
 },
 {
  "id": "c_c362cd7d",
  "ch": "reglog",
  "q": "Score d'un KNN (K=20) pour une courbe ROC ?",
  "a": "La proportion de voisins de classe 1 parmi les 20 plus proches voisins."
 },
 {
  "id": "c_fd198056",
  "ch": "reglog",
  "q": "One-vs-all vs one-vs-one : combien de classifieurs ?",
  "a": "OvA : C classifieurs, chacun sur toutes les données. OvO : C(C−1)/2, chacun sur les données des 2 classes concernées."
 },
 {
  "id": "c_3e19a58c",
  "ch": "cart",
  "q": "Comment CART choisit-il une coupure ?",
  "a": "Il teste toutes les variables et tous les seuils, et garde la coupure qui maximise le gain I(R) − n_l/n·I(R_l) − n_m/n·I(R_m)."
 },
 {
  "id": "c_1d900548",
  "ch": "cart",
  "q": "Gini, entropie, erreur de classification ?",
  "a": "Gini Σp_k(1−p_k) ; entropie −Σp_k log₂ p_k ; erreur 1 − max p_k."
 },
 {
  "id": "c_2862d9da",
  "ch": "cart",
  "q": "Forme des frontières d'un arbre CART ?",
  "a": "Morceaux de droites orthogonales aux axes (une variable par nœud) : frontière en escalier, non linéaire."
 },
 {
  "id": "c_040c7bbf",
  "ch": "cart",
  "q": "Coût en complexité de l'élagage ?",
  "a": "C_λ(T) = Σ n_l·I(R_l) + λ|T|. λ ↑ → arbre plus petit → biais ↑, variance ↓."
 },
 {
  "id": "c_58abef3d",
  "ch": "cart",
  "q": "Erreur d'apprentissage avec |T| = 1 ? avec l'arbre maximal ?",
  "a": "|T|=1 : proportion des classes non majoritaires (on prédit la majoritaire). Arbre maximal : 0 (feuilles pures)."
 },
 {
  "id": "c_a30a94c3",
  "ch": "svm",
  "q": "Qu'est-ce que la marge ? les vecteurs de support ?",
  "a": "Marge : distance de l'hyperplan au point le plus proche (1/‖w‖). Vecteurs de support en marge rigide : les points sur H⁺/H⁻, qui seuls déterminent l'hyperplan. En marge souple, le classifieur utilise tous les points avec αᵢ > 0 : sur H⁺/H⁻, dans la marge ou mal classés (outliers)."
 },
 {
  "id": "c_ed7cd2e0",
  "ch": "svm",
  "q": "Problème primal de la SVM à marge souple ?",
  "a": "min ½‖w‖² + CΣξᵢ  s.c. yᵢ(⟨w,xᵢ⟩+b) ≥ 1−ξᵢ, ξᵢ ≥ 0."
 },
 {
  "id": "c_322583b2",
  "ch": "svm",
  "q": "Où est un point selon ξᵢ ?",
  "a": "ξ = 0 : bien classé, hors de la marge. 0 < ξ < 1 : bien classé, dans la marge. ξ = 1 : sur l'hyperplan. ξ > 1 : mal classé."
 },
 {
  "id": "c_23ca365b",
  "ch": "svm",
  "q": "Rôle de C ?",
  "a": "Arbitrage entre marge large et peu d'erreurs. C grand : marge étroite, variance ↑. C petit : marge large, biais ↑. C→∞ : marge rigide."
 },
 {
  "id": "c_9011f3a1",
  "ch": "svm",
  "q": "Paramètres et hyperparamètres d'une SVM à noyau ?",
  "a": "Paramètres : w (ou αᵢ) et b. Hyperparamètres : C, le noyau, ses paramètres (γ/σ, degré, c)."
 },
 {
  "id": "c_2914392d",
  "ch": "svm",
  "q": "Astuce du noyau ?",
  "a": "Le dual ne fait intervenir φ que via ⟨φ(xᵢ),φ(xⱼ)⟩ = k(xᵢ,xⱼ) : on calcule k directement, sans φ, ce qui est moins coûteux."
 },
 {
  "id": "c_c57dde0d",
  "ch": "svm",
  "q": "Condition pour qu'une fonction k soit un noyau ?",
  "a": "Symétrique et semi-définie positive (Moore-Aronszajn)."
 },
 {
  "id": "c_ceb61419",
  "ch": "svm",
  "q": "Effet de γ (noyau RBF) ?",
  "a": "γ grand : frontière très locale, îlots autour des points → variance ↑. γ petit : frontière lisse → biais ↑."
 },
 {
  "id": "c_a363b8fa",
  "ch": "clust",
  "q": "Que cherche-t-on en clustering ?",
  "a": "Regrouper des données non étiquetées en clusters homogènes (points similaires ensemble) et bien séparés entre eux."
 },
 {
  "id": "c_8cf32c92",
  "ch": "clust",
  "q": "Coefficient de silhouette : formule et interprétation ?",
  "a": "s(x) = (b−a)/max(a,b) ∈ [−1,1]. a = distance moyenne à son cluster, b = plus petite distance moyenne à un autre cluster. On choisit la partition qui maximise la moyenne."
 },
 {
  "id": "c_10ae003a",
  "ch": "clust",
  "q": "Que signifie s(x) < 0 ?",
  "a": "x est en moyenne plus proche d'un autre cluster que du sien : il est probablement mal assigné."
 },
 {
  "id": "c_1b463b51",
  "ch": "clust",
  "q": "Indice de Davies-Bouldin ?",
  "a": "D = moyenne des max_{l≠k} (T_k+T_l)/S_kl. Plus petit = mieux (homogène et séparé)."
 },
 {
  "id": "c_889733e6",
  "ch": "clust",
  "q": "I_W et I_B ?",
  "a": "I_W : inertie intra-classes (homogénéité, à minimiser). I_B : inertie inter-classes (séparation, à maximiser). I = I_W + I_B est constante : elle ne dépend pas de la partition."
 },
 {
  "id": "c_edf1116b",
  "ch": "clust",
  "q": "Lien simple vs lien complet ?",
  "a": "Simple : min des distances, effet de chaîne, suit des formes allongées/anneaux. Complet : max, clusters compacts et sphériques."
 },
 {
  "id": "c_1a445acd",
  "ch": "clust",
  "q": "Étapes de l'algorithme de Lloyd ?",
  "a": "1) K centroïdes initiaux ; 2) affecter chaque point au centroïde le plus proche ; 3) recalculer les centroïdes (moyennes) ; 4) répéter jusqu'à stabilité."
 },
 {
  "id": "c_d5121d0b",
  "ch": "clust",
  "q": "L'inertie intra-classes diminue à chaque itération de Lloyd : quelle limite en découle, et quel remède ?",
  "a": "Convergence vers un minimum local qui dépend de l'initialisation → relancer plusieurs fois (nstart) et/ou K-means++."
 },
 {
  "id": "c_d9a6e113",
  "ch": "clust",
  "q": "Complexité K-means vs CAH ?",
  "a": "K-means : K·n distances par itération, linéaire en n. CAH : distances deux à deux, O(n²) par étape (n(n−1)/2 au départ). La CAH est plus coûteuse."
 },
 {
  "id": "c_695f8a14",
  "ch": "clust",
  "q": "Comment choisir le nombre de clusters ?",
  "a": "Coude de I_W(K), maximum de silhouette, minimum de Davies-Bouldin, coupe du dendrogramme avant une grande branche, seuil de distance."
 },
 {
  "id": "c_8b8247d4",
  "ch": "clust",
  "q": "Pourquoi le K-means échoue-t-il sur des anneaux ?",
  "a": "Ses clusters sont convexes (cellules de Voronoï). Solution : noyau / φ(x,y)=(x,y,x²+y²), ou CAH lien simple."
 },
 {
  "id": "c_12cdeefb",
  "ch": "clust",
  "q": "Qu'est-ce qu'une inversion en CAH ?",
  "a": "Deux branches qui se rejoignent à une hauteur plus petite que celle de leurs descendants : les hauteurs ne sont plus croissantes. Cela peut arriver avec le lien centroïdal, pas avec les liens simple, complet, moyen ou Ward (axiome de la médiane)."
 },
 {
  "id": "c_58f5e27e",
  "ch": "clust",
  "q": "Qu'est-ce qu'un médoïde ?",
  "a": "Le point de la classe dont la dissimilarité moyenne aux autres points de la classe est minimale (l'observation la plus centrale). Les K-médoïdes sont plus robustes aux valeurs aberrantes que les K-moyennes."
 },
 {
  "id": "c_d7013dd2",
  "ch": "clust",
  "q": "Comment contourner le coût de la CAH sur beaucoup de données ?",
  "a": "Faire d'abord un K-means avec K grand (une fraction importante de n), puis une CAH sur les centroïdes obtenus."
 },
 {
  "id": "c_159f6060",
  "ch": "intro",
  "q": "TP1 : pourquoi le K optimal trouvé sur l'apprentissage (K=1, erreur 0) est-il trompeur ?",
  "a": "Sur les 30 % de données mises de côté, l'erreur du 1-NN n'est plus nulle : il faut évaluer sur des données qui n'ont pas servi à l'apprentissage."
 },
 {
  "id": "c_99074a98",
  "ch": "reglog",
  "q": "TP3 (seuil 1/2) : 3/33 faux positifs et 6/20 faux négatifs. Sensibilité, spécificité, accuracy ?",
  "a": "33 négatifs, 20 positifs, donc TP = 14 et TN = 30. Sensibilité = 14/20 = 0,70 ; spécificité = 30/33 ≈ 0,91 ; accuracy = 44/53 ≈ 0,83 ; précision = 14/17 ≈ 0,82."
 },
 {
  "id": "c_a1260945",
  "ch": "cart",
  "q": "TP4 : comment choisir cp dans rpart ?",
  "a": "printcp / plotcp, puis garder le cp qui minimise xerror (erreur de validation croisée, 10-fold par défaut) et élaguer avec prune(tree, cp = bestcp). cp joue le rôle de λ."
 },
 {
  "id": "c_8af2f121",
  "ch": "svm",
  "q": "TP5 : que fait scale par défaut dans e1071::svm et pourquoi ça compte pour le noyau RBF ?",
  "a": "scale = TRUE par défaut : les variables sont standardisées. Or k(x,x') = exp(−γ‖x−x'‖²) dépend de l'échelle des distances : un même γ ne donne pas la même frontière sur données brutes et standardisées. Avec γ = 0,01, C = 10 et des données standardisées, la classe majoritaire est prédite partout."
 },
 {
  "id": "c_32f6c5bd",
  "ch": "svm",
  "q": "TP5 : montrer que (⟨z,z̃⟩+c)² = ⟨φ(z),φ(z̃)⟩ pour z ∈ ℝ³.",
  "a": "φ(z) = (c, √(2c)z₁, √(2c)z₂, √(2c)z₃, √2 z₁z₂, √2 z₁z₃, √2 z₂z₃, z₁², z₂², z₃²). On développe (Σzᵢz̃ᵢ + c)² = c² + 2c Σzᵢz̃ᵢ + Σzᵢ²z̃ᵢ² + 2Σ_{i<j} zᵢzⱼz̃ᵢz̃ⱼ, ce qui est exactement le produit scalaire terme à terme."
 },
 {
  "id": "c_1dd97597",
  "ch": "svm",
  "q": "TP5 (caret) : hyperparamètres de svmPoly et de svmRadial ?",
  "a": "svmPoly : degree, scale, C. svmRadial : sigma, C. On utilise les mêmes plis (createFolds, k = 10) pour comparer équitablement les deux noyaux."
 },
 {
  "id": "c_3d415ce6",
  "ch": "clust",
  "q": "TP clustering : avec φ = (x,y,x²,y²) et nstart = 20, les anneaux ne sont plus séparés. Pourquoi ?",
  "a": "nstart garde la partition de plus petite inertie intra-classes. La partition qui sépare les anneaux n'est donc pas celle qui minimise I_W dans cet espace. Avec φ = (x,y,x²+y²), elle l'est."
 },
 {
  "id": "c_7b57743f",
  "ch": "clust",
  "q": "TP clustering : pourquoi la boucle sur la silhouette commence-t-elle à K = 2 ?",
  "a": "Le coefficient de silhouette n'est défini que pour 2 ≤ K ≤ n−1 : avec un seul cluster, b(x) n'existe pas."
 },
 {
  "id": "c_55a52893",
  "ch": "intro",
  "q": "Trois situations où l'apprentissage automatique est utile (cours) ?",
  "a": "1) Problèmes qu'on sait résoudre sans savoir formaliser comment (reconnaissance d'images, langage naturel). 2) Problèmes qu'on ne sait pas résoudre car les données sont complexes et volumineuses (astrophysique, génomique). 3) Problèmes qu'on sait résoudre mais avec des procédures trop gourmandes en calcul (interactions entre grosses molécules)."
 },
 {
  "id": "c_34ad2024",
  "ch": "intro",
  "q": "Quels sont les trois grands problèmes de l'apprentissage non supervisé vus en cours ?",
  "a": "Le clustering (partitionnement, « classification non supervisée »), la réduction de dimension et l'estimation de densité."
 },
 {
  "id": "c_cb5b11ce",
  "ch": "intro",
  "q": "Définition d'une fonction de coût ℓ ?",
  "a": "ℓ : 𝒴 × 𝒴 → ℝ₊ telle que ℓ(y,y) = 0 pour tout y et ℓ(y,y') > 0 si y ≠ y'. En pratique, ℓ(y,f(x)) est d'autant plus grande que f(x) est loin du vrai label y. Exemples : |y−y'|, (y−y')², 1{y≠y'}."
 },
 {
  "id": "c_2e2b9e53",
  "ch": "intro",
  "q": "Qu'est-ce que le risque R(f) d'une règle de décision f ?",
  "a": "R(f) = E[ℓ(Y, f(X))] sous la loi ℙ_{X,Y} : l'erreur moyenne de prévision de f sur toutes les valeurs possibles. La règle optimale f* minimise R, mais ℙ_{X,Y} est inconnue, d'où le risque empirique."
 },
 {
  "id": "c_b3fb4ddb",
  "ch": "intro",
  "q": "Pourquoi modélise-t-on l'étiquette par une variable aléatoire Y sachant X ?",
  "a": "Deux individus de même description x peuvent avoir des étiquettes différentes : erreurs d'acquisition, manque d'information dans les variables mesurées, phénomène aléatoire par nature."
 },
 {
  "id": "c_de3d2e33",
  "ch": "intro",
  "q": "KNN en régression : quelle prédiction ?",
  "a": "La moyenne des étiquettes des K plus proches voisins : f(x) = 1/K Σ_{i : xᵢ∈N_K(x)} yᵢ."
 },
 {
  "id": "c_2d9a91ff",
  "ch": "intro",
  "q": "Coût d'une prédiction par KNN (version naïve) ? Limite en grande dimension ?",
  "a": "Calcul de n distances en O(nd), puis recherche des K plus petites en O(n log K). Le KNN souffre du fléau de la dimension : quand d est grand, il fonctionne mal."
 },
 {
  "id": "c_9c741bfc",
  "ch": "intro",
  "q": "Qu'appelle-t-on capacité de généralisation ?",
  "a": "La capacité d'un modèle à faire des prédictions correctes sur de nouvelles données, qui n'ont pas servi à le construire. Elle est mauvaise en cas de sur-apprentissage et de sous-apprentissage."
 },
 {
  "id": "c_74872d26",
  "ch": "intro",
  "q": "Exemple du cours d'un algorithme à erreur empirique nulle mais inutile ?",
  "a": "f(x) = yᵢ si x = xᵢ (donnée d'apprentissage), étiquette tirée au hasard sinon. Erreur nulle sur l'apprentissage quel que soit le coût, prédictions très mauvaises sur toute nouvelle observation."
 },
 {
  "id": "c_139e41a7",
  "ch": "eval",
  "q": "Où sont TN, FN, FP, TP dans la matrice de confusion du cours ?",
  "a": "Lignes = classe prédite, colonnes = classe réelle. Ligne « prédit 0 » : TN (réel 0) puis FN (réel 1). Ligne « prédit 1 » : FP (réel 0) puis TP (réel 1)."
 },
 {
  "id": "c_9e8d1536",
  "ch": "eval",
  "q": "Pourquoi ne pas regarder la précision seule ? la sensibilité seule ?",
  "a": "On a une bonne précision en faisant très peu de prédictions positives (au détriment du rappel). On a une sensibilité de 1 en prédisant tout positif. D'où le F1, ou le couple sensibilité/spécificité."
 },
 {
  "id": "c_367ee1b3",
  "ch": "eval",
  "q": "Lien entre spécificité et taux de faux positifs (FPR) ?",
  "a": "FPR = FP/(FP+TN) = 1 − spécificité. C'est l'abscisse de la courbe ROC."
 },
 {
  "id": "c_ec5b1d04",
  "ch": "eval",
  "q": "Weighted-average (multiclasse) ?",
  "a": "Moyenne des scores par classe pondérée par le support (nombre d'observations réelles de la classe) : Σ_k score_k × support_k / n. Les classes très représentées pèsent beaucoup."
 },
 {
  "id": "c_9e3b8666",
  "ch": "eval",
  "q": "Holdout : risque d'un jeu de test trop petit ? trop grand ?",
  "a": "Trop petit : la métrique estimée varie beaucoup d'un échantillon à l'autre (grande variance). Trop grand : le modèle est appris sur trop peu de données."
 },
 {
  "id": "c_5c7d7564",
  "ch": "eval",
  "q": "Leave-p-out : combien de tests ?",
  "a": "On teste toutes les façons de choisir p observations de test parmi n : C(n,p) tests. Pour p = 1 (leave-one-out), n tests."
 },
 {
  "id": "c_fecf4d20",
  "ch": "eval",
  "q": "Métriques de régression du cours ?",
  "a": "MSE = 1/n Σ (yᵢ − f(xᵢ))² et RMSE = √MSE (même unité que y)."
 },
 {
  "id": "c_01fd4041",
  "ch": "reglog",
  "q": "Équation de la droite ⟨w,x⟩ + b = 0 en dimension 2 : pente et ordonnée à l'origine ?",
  "a": "Avec w = (w₁,w₂) et w₂ ≠ 0 : x₂ = −(w₁/w₂)x₁ − b/w₂. Pente −w₁/w₂, ordonnée à l'origine −b/w₂."
 },
 {
  "id": "c_41cd2970",
  "ch": "reglog",
  "q": "Qu'est-ce qu'une classe d'hypothèses ℱ_φ ?",
  "a": "L'ensemble des fonctions x ↦ φ(⟨w,x⟩ + b), w ∈ ℝᵈ, b ∈ ℝ, pour une fonction φ fixée. φ = sign : demi-espaces ; φ = σ : régression logistique ; φ = identité : régression linéaire."
 },
 {
  "id": "c_db858b5d",
  "ch": "reglog",
  "q": "Quand un seuil s < 0,5 a-t-il du sens en régression logistique ?",
  "a": "Quand rater un positif coûte cher (ex. prédire une maladie grave) : on accepte de déclarer ŷ = 1 avec une confiance plus faible. La sensibilité augmente, la spécificité diminue."
 },
 {
  "id": "c_8c2a6598",
  "ch": "reglog",
  "q": "Comment choisir entre des modèles logistiques utilisant 1, 2 ou 3 variables ?",
  "a": "On calcule l'AUC de chaque modèle sur l'échantillon de validation et on garde celui qui la maximise (le cours cite aussi l'AIC, vu en S2)."
 },
 {
  "id": "c_c801ae5b",
  "ch": "reglog",
  "q": "Alternative à OvA/OvO pour une logistique multiclasse ?",
  "a": "La régression softmax : on généralise directement la régression logistique au cas multiclasse en optimisant un seul modèle global."
 },
 {
  "id": "c_f4709d76",
  "ch": "cart",
  "q": "Pourquoi dit-on que les arbres font de l'apprentissage « non métrique » ?",
  "a": "Ils traitent des variables qualitatives (couleur, taille…) sans représentation numérique ni distance. Ils sont donc adaptés aux données hétérogènes (quantitatives et qualitatives)."
 },
 {
  "id": "c_b6413bbd",
  "ch": "cart",
  "q": "Pourquoi un arbre gère-t-il bien des classes multimodales ?",
  "a": "Chaque test dépend des tests précédents : une même étiquette peut correspondre à plusieurs régions décrites par des variables différentes (ex. « pomme » = fruit grand et rouge, ou jaune et rond)."
 },
 {
  "id": "c_6a35fb2e",
  "ch": "cart",
  "q": "Comment CART coupe-t-il selon une variable qualitative nominale ?",
  "a": "On choisit un sous-ensemble S de modalités (souvent une seule) : R_l = {x^j ∈ S}, R_m = {x^j ∉ S}."
 },
 {
  "id": "c_8b529e3f",
  "ch": "cart",
  "q": "Critère de coupure de CART en régression ?",
  "a": "Minimiser n_l·MSE(R_l) + n_m·MSE(R_m), où MSE est calculé par rapport à la moyenne du nœud (la prédiction de la feuille)."
 },
 {
  "id": "c_ef59dcf1",
  "ch": "cart",
  "q": "Que prédit une feuille de CART ?",
  "a": "En classification : l'étiquette majoritaire des observations d'apprentissage de la feuille (vote). En régression : leur moyenne."
 },
 {
  "id": "c_924f10b4",
  "ch": "cart",
  "q": "Pourquoi parle-t-on d'apprenants faibles pour les arbres ? Remède ?",
  "a": "Un arbre seul est souvent peu performant et peu robuste aux variations des données. Remède : méthodes ensemblistes (bagging, forêts aléatoires, boosting)."
 },
 {
  "id": "c_ce9d93fc",
  "ch": "svm",
  "q": "Distance d'un point x à l'hyperplan ⟨w,x⟩ + b = 0 ?",
  "a": "d(x,H) = |⟨w,x⟩ + b| / ‖w‖. Un vecteur de support vérifie |⟨w,x⟩+b| = 1, d'où la marge 1/‖w‖ et une zone d'indécision de largeur 2/‖w‖."
 },
 {
  "id": "c_d5830f66",
  "ch": "svm",
  "q": "Pourquoi choisir l'hyperplan de marge maximale parmi tous les hyperplans séparateurs ?",
  "a": "Il est équidistant des observations positive et négative les plus proches : un petit déplacement des données ne le rend pas non séparateur (robustesse, erreurs de mesure). Il minimise l'incertitude pour un point qui tombe près de la frontière."
 },
 {
  "id": "c_9a947517",
  "ch": "svm",
  "q": "Réécriture de la SVM à marge souple avec la perte hinge ?",
  "a": "min 1/(2nC)‖w‖² + 1/n Σ max(0, 1 − yᵢ(⟨w,xᵢ⟩+b)). C'est une minimisation du risque empirique régularisé ; le terme ‖w‖²/(2nC) évite le sur-apprentissage."
 },
 {
  "id": "c_3009d93e",
  "ch": "svm",
  "q": "Primal ou dual : lequel résoudre ?",
  "a": "Le primal est un problème en d+1 dimensions, le dual en n dimensions. Peu de données et beaucoup de variables : dual. Beaucoup de données et peu de variables : primal."
 },
 {
  "id": "c_b7337c21",
  "ch": "svm",
  "q": "Comment calcule-t-on b̂ en marge souple ?",
  "a": "b̂ = yᵢ − Σⱼ α̂ⱼ yⱼ ⟨xⱼ,xᵢ⟩ pour un i tel que 0 < α̂ᵢ < C (avec un noyau : k(xⱼ,xᵢ) à la place du produit scalaire)."
 },
 {
  "id": "c_201922d9",
  "ch": "svm",
  "q": "Qu'est-ce que la matrice de Gram ?",
  "a": "Pour un noyau k et des observations x₁,…,x_n : la matrice n×n de terme K_ij = k(xᵢ,xⱼ). C'est elle qui intervient dans le dual."
 },
 {
  "id": "c_7e4d6ccf",
  "ch": "svm",
  "q": "Lien entre σ et γ pour le noyau gaussien ?",
  "a": "exp(−‖x−x'‖²/(2σ²)) = exp(−γ‖x−x'‖²) avec γ = 1/(2σ²). σ petit ⇔ γ grand ⇔ frontière très locale (variance ↑)."
 },
 {
  "id": "c_c5254856",
  "ch": "clust",
  "q": "Les trois propriétés d'une distance ?",
  "a": "Symétrie d(x,y) = d(y,x) ; séparation d(x,y) = 0 ⇔ x = y ; inégalité triangulaire d(x,z) ≤ d(x,y) + d(y,z). (Gower ne vérifie pas l'inégalité triangulaire.)"
 },
 {
  "id": "c_e5cc8ac8",
  "ch": "clust",
  "q": "Distances de Manhattan, Chebyshev et Mahalanobis ?",
  "a": "Manhattan : Σ|xⱼ−yⱼ|. Chebyshev : maxⱼ |xⱼ−yⱼ|. Mahalanobis : √((x−y)ᵀΣ⁻¹(x−y)), Σ matrice de variance-covariance empirique."
 },
 {
  "id": "c_2512fc5e",
  "ch": "clust",
  "q": "Lien moyen et lien centroïdal ?",
  "a": "Moyen : 1/(|C_k||C_l|) Σ_{x∈C_k} Σ_{y∈C_l} d(x,y). Centroïdal : d(μ_k, μ_l). Le centroïdal peut créer des inversions."
 },
 {
  "id": "c_aba881a1",
  "ch": "clust",
  "q": "Pourquoi la distance de Ward crée-t-elle des groupes équilibrés ?",
  "a": "Elle vaut |C_k||C_l|/(|C_k|+|C_l|)·‖μ_k−μ_l‖². Le facteur xy/(x+y) est petit si l'un des groupes est petit : fusionner un petit groupe coûte peu, donc les petits groupes sont absorbés en premier."
 },
 {
  "id": "c_af5d00aa",
  "ch": "clust",
  "q": "Que représente la hauteur d'une branche du dendrogramme ?",
  "a": "La distance (selon le lien choisi) entre les deux clusters qu'elle relie au moment de leur fusion."
 },
 {
  "id": "c_b0931fec",
  "ch": "clust",
  "q": "Comment évaluer un clustering sans étiquettes ?",
  "a": "Stabilité (perturber les données ou l'initialisation ne doit pas tout changer) ; évaluation externe (avis d'expert a posteriori, ou indice de Rand si on a des étiquettes partielles) ; évaluation interne (Davies-Bouldin, silhouette)."
 },
 {
  "id": "c_ef6e058f",
  "ch": "clust",
  "q": "Comment le K-means peut-il servir à détecter des valeurs aberrantes ?",
  "a": "Une observation très éloignée des autres se retrouve seule dans un cluster (les n−1 autres sont réparties en K−1 clusters) : les points seuls dans leur cluster sont suspects."
 },
 {
  "id": "c_6f4d769c",
  "ch": "clust",
  "q": "À SAVOIR LUNDI : démontrer I = I_W + I_B.",
  "a": "On écrit I = Σ_k Σ_{x_i∈C_k} ‖x_i − μ‖², puis x_i − μ = (x_i − μ_k) + (μ_k − μ). On développe ‖a+b‖² = ‖a‖² + ‖b‖² + 2⟨a,b⟩ : on obtient I_W + Σ_k |C_k| ‖μ_k − μ‖² (= I_B) + 2 Σ_k ⟨Σ_{x_i∈C_k}(x_i − μ_k), μ_k − μ⟩. Le terme croisé est nul car Σ_{x_i∈C_k} x_i = |C_k| μ_k (bilinéarité)."
 },
 {
  "id": "c_e30d75c5",
  "ch": "reglog",
  "q": "À SAVOIR LUNDI : à quoi ressemble la courbe ROC calculée par Kaggle sur un fichier de soumission ?",
  "a": "Si le fichier contient des étiquettes 0/1, la ROC n'a que 3 points : (0,0), (FPR, TPR) et (1,1), soit deux segments. Son AUC vaut (sensibilité + spécificité)/2. Avec des probabilités, on obtient une vraie courbe en escalier (un point par seuil)."
 }
];
export const quiz = [
 {
  "id": "q_b64855f5",
  "ch": "intro",
  "q": "« Prédire le prix d'un logement à partir de ses caractéristiques » est un problème de…",
  "opts": [
   "clustering",
   "régression",
   "classification binaire",
   "classification multiclasse"
  ],
  "ans": 1,
  "exp": "Le prix est une valeur réelle non finie."
 },
 {
  "id": "q_0b71eb28",
  "ch": "intro",
  "q": "« Prédire la probabilité de défaut d'un nouveau prêt » est un problème de…",
  "opts": [
   "classification binaire",
   "clustering",
   "régression",
   "classification multiclasse"
  ],
  "ans": 2,
  "exp": "On prédit un nombre dans [0,1] : c'est une régression. Prédire « risqué / non risqué » serait une classification binaire."
 },
 {
  "id": "q_0f2be608",
  "ch": "intro",
  "q": "« Détecter la langue d'un texte » est un problème de…",
  "opts": [
   "classification binaire",
   "classification multiclasse",
   "régression",
   "clustering"
  ],
  "ans": 1,
  "exp": "Plus de 2 étiquettes possibles, fixées à l'avance."
 },
 {
  "id": "q_d56d0548",
  "ch": "intro",
  "q": "« Compresser une image » relève…",
  "opts": [
   "de la classification supervisée",
   "de la régression",
   "du clustering",
   "de la classification binaire"
  ],
  "ans": 2,
  "exp": "K-means sur les couleurs des pixels : apprentissage non supervisé."
 },
 {
  "id": "q_2521f80c",
  "ch": "intro",
  "q": "Pour le coût 0/1, la règle de décision optimale est…",
  "opts": [
   "E[Y|X=x]",
   "la médiane de Y|X=x",
   "argmax_k P(Y=k|X=x)",
   "le KNN"
  ],
  "ans": 2,
  "exp": "C'est le classifieur de Bayes."
 },
 {
  "id": "q_b76c0b56",
  "ch": "intro",
  "q": "Pour le coût quadratique, f*(x) vaut…",
  "opts": [
   "E[Y|X=x]",
   "médiane(Y|X=x)",
   "argmax P(Y=k|X=x)",
   "0"
  ],
  "ans": 0,
  "exp": "On minimise E[(Y−c)²|X=x] : la dérivée s'annule en c = E[Y|X=x]."
 },
 {
  "id": "q_cf5c24ef",
  "ch": "intro",
  "q": "Quand K augmente dans un KNN…",
  "opts": [
   "le biais diminue, la variance augmente",
   "le biais augmente, la variance diminue",
   "les deux diminuent",
   "rien ne change"
  ],
  "ans": 1,
  "exp": "Plus de voisins → prédiction lissée, moins sensible au bruit, mais moins fine."
 },
 {
  "id": "q_48521675",
  "ch": "intro",
  "q": "Apprentissage : 53 étiquettes 0 et 47 étiquettes 1. Un KNN avec K = 100 prédit…",
  "opts": [
   "toujours 1",
   "toujours 0",
   "au hasard",
   "comme le 1-NN"
  ],
  "ans": 1,
  "exp": "K = n : tous les points sont voisins → classe majoritaire 0. Sensibilité = 0."
 },
 {
  "id": "q_cbe64c08",
  "ch": "eval",
  "q": "La sensibilité vaut…",
  "opts": [
   "TP/(TP+FP)",
   "TN/(TN+FP)",
   "TP/(TP+FN)",
   "(TP+TN)/total"
  ],
  "ans": 2,
  "exp": "C'est le taux de vrais positifs (rappel)."
 },
 {
  "id": "q_91999c56",
  "ch": "eval",
  "q": "La précision vaut…",
  "opts": [
   "TP/(TP+FP)",
   "TP/(TP+FN)",
   "TN/(TN+FN)",
   "FP/(FP+TN)"
  ],
  "ans": 0,
  "exp": "Proportion de prédictions positives correctes."
 },
 {
  "id": "q_8a2c8d52",
  "ch": "eval",
  "q": "La stratégie micro-average, pour la précision multiclasse, revient à…",
  "opts": [
   "la moyenne simple par classe",
   "l'accuracy",
   "la sensibilité de la plus grande classe",
   "le F1"
  ],
  "ans": 1,
  "exp": "On somme les TP et FP de toutes les classes : ΣTP/total = accuracy."
 },
 {
  "id": "q_937576f8",
  "ch": "eval",
  "q": "À quoi sert le jeu de test (troisième jeu) ?",
  "opts": [
   "ajuster les paramètres",
   "choisir les hyperparamètres",
   "évaluer la performance du modèle finalement choisi",
   "normaliser les données"
  ],
  "ans": 2,
  "exp": "Le jeu de validation a déjà servi à choisir : il n'est plus indépendant."
 },
 {
  "id": "q_2493a0e4",
  "ch": "eval",
  "q": "Leave-one-out sur n données : combien d'entraînements ?",
  "opts": [
   "1",
   "K",
   "n",
   "C(n,2)"
  ],
  "ans": 2,
  "exp": "Chaque observation sert une fois de test."
 },
 {
  "id": "q_714626a6",
  "ch": "eval",
  "q": "Un modèle très bon sur l'apprentissage mais mauvais sur la validation…",
  "opts": [
   "sous-apprend",
   "sur-apprend",
   "a un biais fort",
   "est optimal"
  ],
  "ans": 1,
  "exp": "Il a capturé le bruit : variance forte."
 },
 {
  "id": "q_02d4beaf",
  "ch": "reglog",
  "q": "σ(0) vaut…",
  "opts": [
   "0",
   "1/2",
   "1",
   "e"
  ],
  "ans": 1,
  "exp": "1/(1+e⁰) = 1/2 : point sur l'hyperplan."
 },
 {
  "id": "q_ad46f918",
  "ch": "reglog",
  "q": "En abaissant le seuil s de la régression logistique…",
  "opts": [
   "la sensibilité diminue",
   "la sensibilité augmente",
   "la spécificité augmente",
   "rien ne change"
  ],
  "ans": 1,
  "exp": "Plus d'observations classées positives → plus de TP, mais aussi plus de FP."
 },
 {
  "id": "q_fb1b1f1b",
  "ch": "reglog",
  "q": "La courbe ROC représente…",
  "opts": [
   "précision en fonction du rappel",
   "TPR en fonction de FPR",
   "accuracy en fonction du seuil",
   "erreur en fonction de K"
  ],
  "ans": 1,
  "exp": "Abscisse : taux de faux positifs ; ordonnée : taux de vrais positifs."
 },
 {
  "id": "q_a6c94af8",
  "ch": "reglog",
  "q": "AUC d'un classifieur aléatoire ?",
  "opts": [
   "0",
   "0,5",
   "1",
   "dépend des données"
  ],
  "ans": 1,
  "exp": "Sa courbe ROC est la diagonale."
 },
 {
  "id": "q_5cf78dbb",
  "ch": "cart",
  "q": "Les frontières de décision d'un arbre CART sont…",
  "opts": [
   "des hyperplans quelconques",
   "orthogonales aux axes",
   "des cercles",
   "toujours linéaires"
  ],
  "ans": 1,
  "exp": "Une seule variable par nœud → coupure x_j < s."
 },
 {
  "id": "q_8c5f9e9b",
  "ch": "cart",
  "q": "Gini d'un nœud contenant [27, 18] ?",
  "opts": [
   "0,40",
   "0,48",
   "0,50",
   "0,97"
  ],
  "ans": 1,
  "exp": "1 − 0,6² − 0,4² = 1 − 0,36 − 0,16 = 0,48."
 },
 {
  "id": "q_e1457c91",
  "ch": "cart",
  "q": "Quand λ (élagage) augmente…",
  "opts": [
   "l'arbre grandit",
   "l'arbre rétrécit, le biais augmente",
   "la variance augmente",
   "l'erreur d'apprentissage diminue"
  ],
  "ans": 1,
  "exp": "On pénalise plus le nombre de feuilles."
 },
 {
  "id": "q_260210df",
  "ch": "cart",
  "q": "Entropie d'un nœud 50 % / 50 % (2 classes) ?",
  "opts": [
   "0",
   "0,5",
   "1",
   "2"
  ],
  "ans": 2,
  "exp": "−2·0,5·log₂0,5 = 1 bit : impureté maximale."
 },
 {
  "id": "q_10a7af05",
  "ch": "svm",
  "q": "La marge d'une SVM à marge rigide vaut…",
  "opts": [
   "‖w‖",
   "1/‖w‖",
   "½‖w‖²",
   "b/‖w‖"
  ],
  "ans": 1,
  "exp": "Les vecteurs de support vérifient |⟨w,x⟩+b| = 1."
 },
 {
  "id": "q_49bebb38",
  "ch": "svm",
  "q": "Un point avec ξᵢ = 1,7 est…",
  "opts": [
   "bien classé hors de la marge",
   "bien classé dans la marge",
   "mal classé",
   "un vecteur de support sur H⁺"
  ],
  "ans": 2,
  "exp": "ξ > 1 ⇔ yᵢ(⟨w,xᵢ⟩+b) < 0."
 },
 {
  "id": "q_7a80814b",
  "ch": "svm",
  "q": "Quand C → +∞ (marge souple)…",
  "opts": [
   "on retrouve la marge rigide",
   "la marge devient infinie",
   "tous les points sont supports",
   "le noyau devient gaussien"
  ],
  "ans": 0,
  "exp": "Toute violation est infiniment pénalisée."
 },
 {
  "id": "q_da6416dc",
  "ch": "svm",
  "q": "Noyau RBF avec γ très grand : on observe…",
  "opts": [
   "une frontière quasi linéaire",
   "des îlots autour des points (sur-apprentissage)",
   "un sous-apprentissage",
   "aucun effet"
  ],
  "ans": 1,
  "exp": "exp(−γ‖x−x'‖²) s'annule vite : chaque point n'influence que son voisinage."
 },
 {
  "id": "q_86db80c0",
  "ch": "svm",
  "q": "Une fonction k est un noyau valide si elle est…",
  "opts": [
   "positive",
   "symétrique et semi-définie positive",
   "continue",
   "bornée"
  ],
  "ans": 1,
  "exp": "Théorème de Moore-Aronszajn."
 },
 {
  "id": "q_dd5dc6f7",
  "ch": "svm",
  "q": "Dans quel cas utiliser une SVM à noyau plutôt qu'à marge souple linéaire ?",
  "opts": [
   "données séparables",
   "données non séparables linéairement, même à quelques observations près",
   "toujours",
   "jamais"
  ],
  "ans": 1,
  "exp": "Le noyau se justifie quand aucune droite ne sépare les classes, même en tolérant quelques erreurs. Si elles ne sont séparables qu'à quelques points près, la marge souple linéaire suffit."
 },
 {
  "id": "q_8aa4cd32",
  "ch": "clust",
  "q": "Un coefficient de silhouette s(x) < 0 signifie…",
  "opts": [
   "x est bien assigné",
   "x est plus proche (en moyenne) d'un autre cluster",
   "x est un centroïde",
   "x est isolé"
  ],
  "ans": 1,
  "exp": "b(x) < a(x)."
 },
 {
  "id": "q_9892f74e",
  "ch": "clust",
  "q": "L'indice de Davies-Bouldin…",
  "opts": [
   "se maximise",
   "se minimise",
   "vaut toujours 1",
   "dépend des étiquettes"
  ],
  "ans": 1,
  "exp": "Ratio (homogénéités)/(séparabilité) : on le veut petit."
 },
 {
  "id": "q_9b5efc5b",
  "ch": "clust",
  "q": "Les clusters obtenus par K-means sont…",
  "opts": [
   "quelconques",
   "convexes",
   "toujours de même taille",
   "emboîtés"
  ],
  "ans": 1,
  "exp": "Cellules de Voronoï des centroïdes."
 },
 {
  "id": "q_fc59bfc5",
  "ch": "clust",
  "q": "Pour séparer deux anneaux concentriques, quelle CAH convient ?",
  "opts": [
   "lien complet",
   "lien simple",
   "Ward",
   "lien centroïdal"
  ],
  "ans": 1,
  "exp": "Le lien simple « chaîne » les points voisins le long de l'anneau."
 },
 {
  "id": "q_0497e250",
  "ch": "clust",
  "q": "Distances calculées à chaque itération de K-means ?",
  "opts": [
   "n(n−1)/2",
   "K·n",
   "K²",
   "n²·K"
  ],
  "ans": 1,
  "exp": "Chaque point vers chacun des K centroïdes."
 },
 {
  "id": "q_db8e9dca",
  "ch": "clust",
  "q": "La méthode du coude porte sur…",
  "opts": [
   "l'inertie intra-classes en fonction de K",
   "l'AUC",
   "le Gini",
   "la marge"
  ],
  "ans": 0,
  "exp": "I_W décroît toujours ; on prend K à la cassure de pente."
 },
 {
  "id": "q_e8e71684",
  "ch": "clust",
  "q": "La distance de Ward entre deux clusters correspond à…",
  "opts": [
   "la distance min",
   "la hausse d'inertie intra-classes due à la fusion",
   "la distance max",
   "le nombre de points"
  ],
  "ans": 1,
  "exp": "|C_k||C_l|/(|C_k|+|C_l|)·‖μ_k−μ_l‖² ; elle favorise des groupes équilibrés."
 },
 {
  "id": "q_0a470cb3",
  "ch": "eval",
  "q": "L'accuracy est…",
  "opts": [
   "la proportion de bien classés (1 − taux d'erreur)",
   "TP/(TP+FP)",
   "TP/(TP+FN)",
   "le F1"
  ],
  "ans": 0,
  "exp": "Ne pas confondre avec la précision TP/(TP+FP), comme le rappelle le TP2."
 },
 {
  "id": "q_296065e9",
  "ch": "reglog",
  "q": "Dans summary(glm), la p-value d'un coefficient teste…",
  "opts": [
   "H0 : βⱼ = 0 (test de Wald)",
   "l'indépendance (χ²)",
   "AUC = 0,5",
   "la normalité des résidus"
  ],
  "ans": 0,
  "exp": "TP3 : tests de Wald univariés ; ils retrouvent les liens vus en exploration (log(acid), radio, taille)."
 },
 {
  "id": "q_dfbda353",
  "ch": "cart",
  "q": "Critère d'impureté par défaut de rpart ?",
  "opts": [
   "Gini",
   "entropie",
   "erreur de classification",
   "MSE"
  ],
  "ans": 0,
  "exp": "TP4 : rpart utilise l'indice de Gini en classification."
 },
 {
  "id": "q_729f825b",
  "ch": "svm",
  "q": "(⟨z,z'⟩ + c)² est le noyau…",
  "opts": [
   "quadratique (polynomial de degré 2)",
   "gaussien",
   "linéaire",
   "cosinus"
  ],
  "ans": 0,
  "exp": "Dans e1071 : kernel=\"polynomial\", gamma = 1, coef0 = c, degree = 2 (TP5)."
 },
 {
  "id": "q_e204697b",
  "ch": "svm",
  "q": "Pour Khan (4 classes), e1071::svm fait du…",
  "opts": [
   "one-versus-one (6 classifieurs)",
   "one-versus-all (4 classifieurs)",
   "softmax",
   "rien : erreur"
  ],
  "ans": 0,
  "exp": "svm() traite le multiclasse en one-versus-one : C(C−1)/2 = 6 classifieurs."
 },
 {
  "id": "q_4baeb6a7",
  "ch": "clust",
  "q": "Quel lien peut produire des inversions dans le dendrogramme ?",
  "opts": [
   "centroïdal",
   "simple",
   "complet",
   "Ward"
  ],
  "ans": 0,
  "exp": "Les liens simple, complet, moyen et Ward vérifient l'axiome de la médiane : hauteurs croissantes."
 },
 {
  "id": "q_334d4a60",
  "ch": "clust",
  "q": "Avec φ=(x,y,x²,y²) et nstart=20, le K-means ne sépare plus les anneaux. Pourquoi ?",
  "opts": [
   "la bonne partition n'est pas celle de I_W minimale",
   "nstart est buggé",
   "K est trop grand",
   "les données ne sont pas standardisées"
  ],
  "ans": 0,
  "exp": "nstart garde la partition d'inertie intra minimale, qui n'est pas ici celle qui sépare les anneaux (TP clustering)."
 },
 {
  "id": "q_9bff2d6a",
  "ch": "svm",
  "q": "Un point avec ξᵢ = 1 se trouve…",
  "opts": [
   "sur l'hyperplan séparateur H",
   "sur H⁺",
   "hors de la marge",
   "mal classé"
  ],
  "ans": 0,
  "exp": "yᵢ(⟨w,xᵢ⟩+b) = 1 − ξᵢ = 0 : le point est sur H."
 },
 {
  "id": "q_fa16057d",
  "ch": "intro",
  "q": "« Prédire le nombre de clics sur un lien » est un problème de…",
  "opts": [
   "classification binaire",
   "classification multiclasse",
   "régression",
   "clustering"
  ],
  "ans": 2,
  "exp": "Le nombre de clics est une quantité numérique, non bornée a priori : régression (exemple du quiz du cours)."
 },
 {
  "id": "q_a4056a7a",
  "ch": "intro",
  "q": "« Identifier si une transaction bancaire est frauduleuse » est un problème de…",
  "opts": [
   "classification binaire",
   "régression",
   "clustering",
   "classification multiclasse"
  ],
  "ans": 0,
  "exp": "Deux étiquettes possibles : frauduleuse ou non."
 },
 {
  "id": "q_f9f52e68",
  "ch": "intro",
  "q": "Pour le coût absolu ℓ(y,y') = |y − y'|, la règle optimale f*(x) est…",
  "opts": [
   "E[Y|X=x]",
   "argmax_k P(Y=k|X=x)",
   "0",
   "la médiane de Y sachant X=x"
  ],
  "ans": 3,
  "exp": "Coût quadratique → espérance conditionnelle ; coût absolu → médiane conditionnelle ; coût 0/1 → classifieur de Bayes."
 },
 {
  "id": "q_5d80037e",
  "ch": "intro",
  "q": "KNN en régression avec K = 3 : les 3 plus proches voisins ont pour étiquettes 2, 5 et 11. Prédiction ?",
  "opts": [
   "5",
   "6",
   "11",
   "18"
  ],
  "ans": 1,
  "exp": "Moyenne des étiquettes des voisins : (2 + 5 + 11)/3 = 6."
 },
 {
  "id": "q_c4caa754",
  "ch": "intro",
  "q": "Le paradigme ERM consiste à…",
  "opts": [
   "minimiser le risque empirique 1/n Σ ℓ(yᵢ, f(xᵢ))",
   "maximiser la vraisemblance des étiquettes",
   "minimiser le risque réel E[ℓ(Y,f(X))]",
   "choisir K par validation croisée"
  ],
  "ans": 0,
  "exp": "Le risque réel dépend de ℙ_{X,Y} inconnue : on minimise son estimation à partir des données."
 },
 {
  "id": "q_1cf628b5",
  "ch": "intro",
  "q": "Prédire avec un KNN naïf (n données, dimension d) demande de calculer les distances en…",
  "opts": [
   "O(d)",
   "O(K)",
   "O(nd)",
   "O(n²d)"
  ],
  "ans": 2,
  "exp": "n distances, chacune en O(d), puis la recherche des K plus petites distances en O(n log K)."
 },
 {
  "id": "q_d62b4aa9",
  "ch": "eval",
  "q": "Matrice (lignes = prédit, colonnes = réel) : prédit 0 → [TN=140, FN=10] ; prédit 1 → [FP=20, TP=30]. Accuracy ?",
  "opts": [
   "0,75",
   "0,80",
   "0,85",
   "0,875"
  ],
  "ans": 2,
  "exp": "(TP + TN)/total = (30 + 140)/200 = 0,85."
 },
 {
  "id": "q_dc62606f",
  "ch": "eval",
  "q": "Même matrice (TP=30, FN=10, FP=20, TN=140). Sensibilité ?",
  "opts": [
   "0,60",
   "0,75",
   "0,85",
   "0,875"
  ],
  "ans": 1,
  "exp": "TP/(TP+FN) = 30/40 = 0,75."
 },
 {
  "id": "q_e63bf7e2",
  "ch": "eval",
  "q": "Même matrice (TP=30, FN=10, FP=20, TN=140). Précision ?",
  "opts": [
   "0,60",
   "0,75",
   "0,667",
   "0,875"
  ],
  "ans": 0,
  "exp": "TP/(TP+FP) = 30/50 = 0,60."
 },
 {
  "id": "q_d3b34dd8",
  "ch": "eval",
  "q": "Même matrice (TP=30, FN=10, FP=20, TN=140). F1-score ?",
  "opts": [
   "0,60",
   "0,675",
   "0,75",
   "0,667"
  ],
  "ans": 3,
  "exp": "2TP/(2TP+FP+FN) = 60/90 ≈ 0,667 (moyenne harmonique de 0,6 et 0,75)."
 },
 {
  "id": "q_d45723f6",
  "ch": "eval",
  "q": "Une spécificité de 0,8 correspond à un taux de faux positifs de…",
  "opts": [
   "0,8",
   "0,2",
   "1,25",
   "impossible à dire"
  ],
  "ans": 1,
  "exp": "FPR = FP/(FP+TN) = 1 − spécificité = 0,2."
 },
 {
  "id": "q_6e7b1d53",
  "ch": "eval",
  "q": "Leave-p-out avec n = 10 et p = 2 : combien de jeux de test ?",
  "opts": [
   "10",
   "20",
   "45",
   "90"
  ],
  "ans": 2,
  "exp": "C(10,2) = 10·9/2 = 45."
 },
 {
  "id": "q_63c9ef2c",
  "ch": "eval",
  "q": "Validation croisée 5-fold sur n = 200 : chaque modèle est entraîné sur…",
  "opts": [
   "40 observations",
   "200 observations",
   "199 observations",
   "160 observations"
  ],
  "ans": 3,
  "exp": "On entraîne sur 4 parties sur 5, soit 4/5 × 200 = 160, et on évalue sur les 40 restantes."
 },
 {
  "id": "q_7c5d46b6",
  "ch": "eval",
  "q": "Précisions par classe : 0,9 ; 0,5 ; 0,4. Précision macro-average ?",
  "opts": [
   "0,6",
   "0,9",
   "0,5",
   "dépend des effectifs"
  ],
  "ans": 0,
  "exp": "Moyenne simple : (0,9 + 0,5 + 0,4)/3 = 0,6. Le micro-average, lui, dépendrait des effectifs."
 },
 {
  "id": "q_db9e653a",
  "ch": "eval",
  "q": "Erreurs de prédiction yᵢ − f(xᵢ) : 1, −2, 2. RMSE ?",
  "opts": [
   "3",
   "≈ 1,73",
   "≈ 1,67",
   "9"
  ],
  "ans": 1,
  "exp": "MSE = (1 + 4 + 4)/3 = 3, RMSE = √3 ≈ 1,73."
 },
 {
  "id": "q_1e7cea82",
  "ch": "reglog",
  "q": "Si ⟨w,x⟩ + b = ln 3, la régression logistique donne P̂(Y=1|x) = …",
  "opts": [
   "0,25",
   "0,50",
   "0,75",
   "3"
  ],
  "ans": 2,
  "exp": "σ(ln 3) = 1/(1 + e^{−ln 3}) = 1/(1 + 1/3) = 3/4."
 },
 {
  "id": "q_d089789c",
  "ch": "reglog",
  "q": "Frontière 2x₁ + 4x₂ − 8 = 0 : pente et ordonnée à l'origine ?",
  "opts": [
   "pente 2, ordonnée 8",
   "pente −0,5, ordonnée 2",
   "pente 0,5, ordonnée −2",
   "pente −2, ordonnée 4"
  ],
  "ans": 1,
  "exp": "x₂ = −(w₁/w₂)x₁ − b/w₂ = −(2/4)x₁ + 8/4."
 },
 {
  "id": "q_a8245f36",
  "ch": "reglog",
  "q": "Scores (étiquette) : 0,9 (1) ; 0,6 (0) ; 0,4 (1) ; 0,2 (0). AUC ?",
  "opts": [
   "0,5",
   "1",
   "0,25",
   "0,75"
  ],
  "ans": 3,
  "exp": "Courbe : (0,0) → (0;0,5) → (0,5;0,5) → (0,5;1) → (1,1). Aire = 0,5×0,5 + 0,5×1 = 0,75. Autre lecture : 3 paires (positif, négatif) bien ordonnées sur 4."
 },
 {
  "id": "q_f70de0e3",
  "ch": "reglog",
  "q": "Pour un seuil s = 1, la régression logistique donne le point ROC…",
  "opts": [
   "(0,0)",
   "(1,1)",
   "(0,1)",
   "(1,0)"
  ],
  "ans": 0,
  "exp": "σ < 1 : aucune observation n'est prédite positive, donc TPR = FPR = 0."
 },
 {
  "id": "q_6f8c7f3f",
  "ch": "reglog",
  "q": "Combien de classifieurs en one-versus-all et en one-versus-one avec 5 classes ?",
  "opts": [
   "5 et 10",
   "5 et 20",
   "10 et 5",
   "4 et 10"
  ],
  "ans": 0,
  "exp": "OvA : C = 5. OvO : C(C−1)/2 = 5·4/2 = 10."
 },
 {
  "id": "q_0dd101c5",
  "ch": "reglog",
  "q": "En one-versus-one, chaque classifieur est entraîné sur…",
  "opts": [
   "toutes les données",
   "les données d'une seule classe",
   "les données des deux classes de la paire",
   "un échantillon bootstrap"
  ],
  "ans": 2,
  "exp": "Les observations des autres classes sont ignorées. En OvA, chaque classifieur utilise toutes les données."
 },
 {
  "id": "q_bdec520a",
  "ch": "reglog",
  "q": "Par rapport au classifieur des demi-espaces, le coût logistique…",
  "opts": [
   "ne pénalise que les points mal classés",
   "pénalise aussi les points bien classés proches de l'hyperplan",
   "ne dépend pas de la distance à l'hyperplan",
   "est le coût 0/1"
  ],
  "ans": 1,
  "exp": "log(1 + exp(−y(⟨w,x⟩+b))) est petit mais non nul pour un point bien classé près de la frontière, et croît avec la distance pour un point mal classé."
 },
 {
  "id": "q_00274289",
  "ch": "cart",
  "q": "Gini d'un nœud contenant [10, 10, 20] (3 classes) ?",
  "opts": [
   "0,500",
   "0,625",
   "0,667",
   "1,5"
  ],
  "ans": 1,
  "exp": "p = (0,25 ; 0,25 ; 0,5) : 1 − 0,0625 − 0,0625 − 0,25 = 0,625."
 },
 {
  "id": "q_cb3d19f9",
  "ch": "cart",
  "q": "Entropie (log₂) d'un nœud contenant [4, 4, 8] ?",
  "opts": [
   "1",
   "1,5",
   "2",
   "0,5"
  ],
  "ans": 1,
  "exp": "−(0,25 log₂ 0,25 × 2 + 0,5 log₂ 0,5) = 0,5 + 0,5 + 0,5 = 1,5 bit."
 },
 {
  "id": "q_dcfb2bc5",
  "ch": "cart",
  "q": "Erreur de classification d'un nœud [12, 3, 5] ?",
  "opts": [
   "0,25",
   "0,6",
   "0,15",
   "0,4"
  ],
  "ans": 3,
  "exp": "1 − max p_k = 1 − 12/20 = 0,4."
 },
 {
  "id": "q_2bcb4d5c",
  "ch": "cart",
  "q": "Nœud [20, 20] coupé en [15, 5] et [5, 15]. Gain d'information avec Gini ?",
  "opts": [
   "0,125",
   "0,375",
   "0,5",
   "0"
  ],
  "ans": 0,
  "exp": "I(R) = 0,5 ; chaque enfant : 1 − 0,75² − 0,25² = 0,375 ; IG = 0,5 − ½·0,375 − ½·0,375 = 0,125."
 },
 {
  "id": "q_35e49516",
  "ch": "cart",
  "q": "Arbre à 4 feuilles avec Σ n_l·I(R_l) = 10. Coût C_λ(T) pour λ = 2 ?",
  "opts": [
   "12",
   "14",
   "18",
   "40"
  ],
  "ans": 2,
  "exp": "C_λ(T) = 10 + 2 × 4 = 18."
 },
 {
  "id": "q_d02e9fe3",
  "ch": "cart",
  "q": "Un arbre binaire de profondeur 3 définit au plus…",
  "opts": [
   "3 régions",
   "6 régions",
   "9 régions",
   "8 régions"
  ],
  "ans": 3,
  "exp": "2³ = 8 feuilles au maximum, donc 8 régions (une par feuille)."
 },
 {
  "id": "q_c6fab8f8",
  "ch": "svm",
  "q": "SVM à marge rigide avec ŵ = (6, 8). Marge ?",
  "opts": [
   "0,1",
   "0,2",
   "10",
   "100"
  ],
  "ans": 0,
  "exp": "‖w‖ = √(36 + 64) = 10, marge = 1/‖w‖ = 0,1."
 },
 {
  "id": "q_bd99eab8",
  "ch": "svm",
  "q": "Distance du point (1,1) à l'hyperplan 3x₁ + 4x₂ − 2 = 0 ?",
  "opts": [
   "5",
   "0,2",
   "7",
   "1"
  ],
  "ans": 3,
  "exp": "|3 + 4 − 2| / √(9 + 16) = 5/5 = 1."
 },
 {
  "id": "q_c7b08a4d",
  "ch": "svm",
  "q": "Marge souple : yᵢ(⟨w,xᵢ⟩+b) = 0,3. Valeur de ξᵢ et position ?",
  "opts": [
   "ξᵢ = 0,3 : mal classé",
   "ξᵢ = 0,7 : bien classé, dans la zone d'indécision",
   "ξᵢ = 0 : hors de la marge",
   "ξᵢ = 1,3 : mal classé"
  ],
  "ans": 1,
  "exp": "À l'optimum ξᵢ = max(0, 1 − yᵢ(⟨w,xᵢ⟩+b)) = 0,7 ∈ ]0,1[."
 },
 {
  "id": "q_bfb1bb8c",
  "ch": "svm",
  "q": "Perte hinge d'un point tel que yᵢ(⟨w,xᵢ⟩+b) = −0,5 ?",
  "opts": [
   "0",
   "0,5",
   "1,5",
   "−0,5"
  ],
  "ans": 2,
  "exp": "max(0, 1 − (−0,5)) = 1,5 : le point est mal classé (ξᵢ > 1)."
 },
 {
  "id": "q_6e27ba9a",
  "ch": "svm",
  "q": "n = 50 observations, d = 10 000 variables : quelle formulation de la SVM résoudre ?",
  "opts": [
   "le primal",
   "le dual",
   "les deux sont équivalents en coût",
   "aucune"
  ],
  "ans": 1,
  "exp": "Primal : d + 1 = 10 001 inconnues ; dual : n = 50. Peu de données, beaucoup de variables → dual."
 },
 {
  "id": "q_fc0d9e67",
  "ch": "svm",
  "q": "Pour le noyau gaussien, k(x, x) vaut…",
  "opts": [
   "0",
   "‖x‖²",
   "1",
   "dépend de γ"
  ],
  "ans": 2,
  "exp": "exp(−γ‖x − x‖²) = exp(0) = 1 pour tout γ."
 },
 {
  "id": "q_1f7b22f0",
  "ch": "svm",
  "q": "Si ⟨x, x'⟩ = 2, le noyau quadratique (⟨x,x'⟩ + 1)² vaut…",
  "opts": [
   "4",
   "5",
   "9",
   "3"
  ],
  "ans": 2,
  "exp": "(2 + 1)² = 9."
 },
 {
  "id": "q_97d75b79",
  "ch": "svm",
  "q": "Noyau gaussien avec σ = 0,5. Valeur de γ dans exp(−γ‖x−x'‖²) ?",
  "opts": [
   "0,5",
   "2",
   "4",
   "0,25"
  ],
  "ans": 1,
  "exp": "γ = 1/(2σ²) = 1/(2 × 0,25) = 2."
 },
 {
  "id": "q_64130824",
  "ch": "clust",
  "q": "a(x) = 2 et b(x) = 5. Coefficient de silhouette s(x) ?",
  "opts": [
   "0,6",
   "0,4",
   "−0,6",
   "1,5"
  ],
  "ans": 0,
  "exp": "(b − a)/max(a,b) = 3/5 = 0,6 : x est plutôt bien assigné."
 },
 {
  "id": "q_34e1793b",
  "ch": "clust",
  "q": "a(x) = 6 et b(x) = 4. Coefficient de silhouette s(x) ?",
  "opts": [
   "0,333",
   "−0,5",
   "−0,333",
   "0,5"
  ],
  "ans": 2,
  "exp": "(4 − 6)/max(6,4) = −2/6 ≈ −0,333 : x est en moyenne plus proche d'un autre cluster."
 },
 {
  "id": "q_eae29d7d",
  "ch": "clust",
  "q": "Distance de Ward entre un cluster de 2 points et un cluster de 3 points, avec ‖μ_k − μ_l‖² = 10 ?",
  "opts": [
   "10",
   "12",
   "25",
   "60"
  ],
  "ans": 1,
  "exp": "|C_k||C_l|/(|C_k|+|C_l|) × 10 = 6/5 × 10 = 12."
 },
 {
  "id": "q_fe24b024",
  "ch": "clust",
  "q": "Distance de Manhattan entre (1, 2) et (4, −2) ?",
  "opts": [
   "5",
   "4",
   "7",
   "25"
  ],
  "ans": 2,
  "exp": "|1−4| + |2−(−2)| = 3 + 4 = 7 (euclidienne : 5 ; Chebyshev : 4)."
 },
 {
  "id": "q_34b7a22a",
  "ch": "clust",
  "q": "CAH sur n = 100 points : combien de distances entre points au départ ?",
  "opts": [
   "100",
   "4 950",
   "9 900",
   "10 000"
  ],
  "ans": 1,
  "exp": "n(n−1)/2 = 100 × 99/2 = 4 950."
 },
 {
  "id": "q_23fbfde5",
  "ch": "clust",
  "q": "Inertie totale I = 100 et inertie intra-classes I_W = 30. Inertie inter-classes I_B ?",
  "opts": [
   "30",
   "130",
   "70",
   "impossible à dire"
  ],
  "ans": 2,
  "exp": "I = I_W + I_B, donc I_B = 70."
 },
 {
  "id": "q_437de465",
  "ch": "clust",
  "q": "K = 2 clusters : T₁ = 1, T₂ = 2, S₁₂ = 6. Indice de Davies-Bouldin global ?",
  "opts": [
   "0,5",
   "2",
   "0,25",
   "3"
  ],
  "ans": 0,
  "exp": "D₁ = D₂ = (T₁ + T₂)/S₁₂ = 3/6 = 0,5, donc D = 0,5."
 },
 {
  "id": "q_e90f968e",
  "ch": "clust",
  "q": "Lien moyen entre {a, b} et {c}, avec d(a,c) = 4 et d(b,c) = 8 ?",
  "opts": [
   "4",
   "8",
   "12",
   "6"
  ],
  "ans": 3,
  "exp": "Moyenne des distances entre éléments des deux clusters : (4 + 8)/2 = 6. Lien simple : 4 ; lien complet : 8."
 },
 {
  "id": "q_aa03e4ed",
  "ch": "reglog",
  "q": "Un fichier de soumission Kaggle ne contient que des 0/1. La courbe ROC calculée par Kaggle…",
  "opts": [
   "est une courbe en escalier avec un point par observation",
   "n'a que 3 points : (0,0), (FPR,TPR), (1,1)",
   "est la diagonale",
   "ne peut pas être calculée"
  ],
  "ans": 1,
  "exp": "Avec deux valeurs prédites, un seul seuil sépare les prédictions : deux segments de droite, AUC = (sensibilité + spécificité)/2."
 }
];
export const exams = [
 {
  "id": "e25",
  "title": "Évaluation 1 — 2025-2026",
  "head": "<p><b>Évaluation 1, 2025-2026</b> (TW132MI, M1 MIASHS).</p><p>Durée : 1h30. Le barème est donné à titre indicatif et pourra éventuellement subir quelques modifications.</p>",
  "exos": [
   {
    "t": "Exercice 1 (9 pts) : types de problèmes, KNN pondéré, CART, métriques",
    "intro": "",
    "qs": [
     {
      "q": "<b>1.</b> <p>Indiquer (sans justifier) si les problèmes suivants sont des problèmes de clustering, de régression, de classification binaire ou de classification multiclasse.</p><ol type=\"a\" class=\"sub\"><li>Déterminer si un patient est porteur ou non d'une maladie à partir d'analyses médicales ;</li><li>Estimer la consommation énergétique d'un bâtiment à partir de ses caractéristiques ;</li><li>Identifier le type de véhicule (voiture, bus, vélo, etc.) sur une photo ;</li><li>Prédire la concentration d'un polluant dans l'air ;</li><li>Regrouper des tweets ;</li><li>Prédire le risque de défaillance d'une pièce dans un moteur d'avion.</li></ol>",
      "a": "<ul><li>(a) classification binaire</li><li>(b) régression</li><li>(c) classification multiclasse</li><li>(d) régression</li><li>(e) clustering</li><li>(f) régression si on prédit un risque (probabilité ou score continu). Si on prédit « défaillance oui/non », c'est une classification binaire : précise ton interprétation.</li></ul>"
     },
     {
      "q": "<b>2.</b> On s’intéresse à un algorithme des K plus proches voisins un peu modifié : l’étiquette d’un point \\(x\\in\\mathcal X\\) est maintenant donnée par \\[f(x)=\\operatorname*{arg\\,max}_{k\\in\\{1,\\dots,C\\}}\\ \\sum_{i\\,:\\,x_i\\in N_K(x)}\\exp\\Big(-\\frac{d_i(x)^2}{h}\\Big)\\,\\mathbf 1\\{y_i=k\\}\\] où \\(h>0\\), \\(d_i(x)\\) représente la distance euclidienne entre \\(x\\) et la donnée d’apprentissage \\(x_i\\) et \\(N_K(x)\\) représente l’ensemble des K plus proches voisins de \\(x\\) dans le jeu d’apprentissage. Expliquer ce que cela modifie dans la manière d’étiqueter \\(x\\).",
      "a": "Chaque voisin vote avec un <b>poids décroissant avec sa distance</b> à x, au lieu d'un vote égal. Les voisins proches comptent plus. h règle la décroissance : h grand → poids ≈ 1, on retrouve le KNN classique ; h petit → seul le plus proche compte vraiment (≈ 1-NN). Ça casse aussi les égalités de vote."
     },
     {
      "q": "<b>3.</b> On suppose qu’on observe un jeu de données \\((x_1,y_1),\\dots,(x_n,y_n)\\in\\mathbb R^2\\times\\{1,2,3\\}\\). La classe majoritaire dans ce jeu de données est la classe 1. À partir de ce jeu de données, on souhaite construire un arbre de classification CART permettant de prédire l’étiquette \\(y\\in\\{1,2,3\\}\\) d’un nouveau point \\(x=(x_1,x_2)\\in\\mathbb R^2\\). Pour cela, on divise ce jeu de données en un jeu d’apprentissage de taille \\(n_{\\text{app}}=50\\), un jeu de validation et un jeu de test.<br><b>(a)</b> À quoi servent ces trois jeux de données ici ?",
      "a": "Apprentissage : construire les arbres (les coupures). Validation : comparer les arbres (profondeur, λ d'élagage…) et choisir les hyperparamètres. Test : estimer la performance du modèle finalement choisi sur des données jamais utilisées."
     },
     {
      "q": "À la Figure 1, on a représenté les frontières de décision associées au modèle final sélectionné, entraîné seulement sur les données d’apprentissage (i.e. il n’a pas été réentraîné après la phase de validation), ainsi que ces données d’apprentissage. Pour information, les étiquettes \\(y_1,\\dots,y_{50}\\) de ce jeu d’apprentissage sont telles que \\(y_i=1\\) pour tout \\(i\\in\\{1,\\dots,46\\}\\), \\(y_i=2\\) pour \\(i\\in\\{47,48,49\\}\\) et \\(y_i=3\\) pour \\(i=50\\).<figure class=\"exam-fig\"><img src=\"img/e25_fig1.png\" alt=\"Figure 1\" loading=\"lazy\"><figcaption>Figure 1</figcaption></figure><b>(b)</b> Donner l’arbre de classification final. Comment ont été obtenues les différentes divisions successives de l’arbre, i.e. comment choisit-on la manière dont on découpe un nœud ?",
      "a": "Lecture de la figure (pointillés en x₁ = 2 et x₂ = 3) :<div class=\"f\" style=\"margin:6px 0\">x₁ &lt; 2 ?\n├─ non → classe 1\n└─ oui → x₂ &lt; 3 ?\n         ├─ oui → classe 2\n         └─ non → classe 1</div>Les divisions sont choisies de façon gloutonne : à chaque nœud, on teste toutes les variables séparatrices et tous les seuils de séparation, et on garde celui qui <b>maximise le gain d'information</b> IG = I(R) − n_l/n·I(R_l) − n_m/n·I(R_m) (Gini par défaut)."
     },
     {
      "q": "<b>(c)</b> Donner la matrice de confusion associée aux prédictions faites par cet arbre sur les données d’apprentissage elles-mêmes.<br><b>(d)</b> Calculer ensuite la <i>précision</i>, i.e. la proportion de prédictions correctes parmi les prédictions positives, avec les deux stratégies suivantes :<ul><li>la stratégie macro-average (moyenne simple de la précision calculée séparément pour chaque classe) ;</li><li>la stratégie micro-average (revient à calculer l’accuracy).</li></ul>",
      "a": "Lecture de la figure : en bas à gauche, 2 points de classe 2 et 1 de classe 1 ; à droite (x₁ ≥ 2), les points de classe 1 plus 1 point de classe 2 (en (3,3)) et le point de classe 3.<div class=\"scroll\" style=\"margin:6px 0\"><table class=\"t\"><tr><th>prédit \\ réel</th><th>1</th><th>2</th><th>3</th></tr><tr><th>1</th><td>45</td><td>1</td><td>1</td></tr><tr><th>2</th><td>1</td><td>2</td><td>0</td></tr><tr><th>3</th><td>0</td><td>0</td><td>0</td></tr></table></div>Précision classe 1 = 45/47 ≈ 0,957 ; classe 2 = 2/3 ≈ 0,667 ; classe 3 : aucune prédiction (0/0, indéfinie, souvent comptée 0).<br><b>Macro</b> = (0,957 + 0,667 + 0)/3 ≈ <b>0,541</b> (≈ 0,812 si on ignore la classe 3 ; dis quelle convention tu prends). <b>Micro</b> = accuracy = 47/50 = <b>0,94</b>. Le macro révèle que les classes rares sont mal traitées."
     },
     {
      "q": "<b>(e)</b> Donner un exemple de problème de classification multiclasse pour lequel il semble préférable d’évaluer un modèle en considérant la stratégie macro-average.",
      "a": "Diagnostic de plusieurs maladies dont certaines rares, détection de types de fraude, reconnaissance d'espèces menacées : chaque classe, même rare, doit compter autant."
     },
     {
      "q": "<b>(f)</b> Supposons qu’on contraigne la taille \\(|T|\\) de l’arbre final à être égale à 1 : quel serait le taux d’erreur du modèle sur le jeu de données d’apprentissage ? Et pour l’arbre maximal ? Justifier.",
      "a": "|T| = 1 : une seule feuille → on prédit la classe majoritaire 1 pour tous → erreur = 4/50 = <b>8 %</b>. Arbre maximal : feuilles pures → erreur <b>0 %</b> (sauf points identiques d'étiquettes différentes)."
     },
     {
      "q": "<b>(g)</b> Considérons de nouveau les deux modèles précédents : celui avec \\(|T|=1\\) et l’arbre maximal. Quel cas correspond à un cas de sous-apprentissage ? de sur-apprentissage ? Expliquer pourquoi.",
      "a": "|T| = 1 sous-apprend : trop simple, il ne détecte jamais les classes 2 et 3 (biais fort). L'arbre maximal sur-apprend : il isole chaque point, y compris le bruit, et généralisera mal (variance forte)."
     },
     {
      "q": "<b>4.</b> Dans un problème de classification binaire, on souhaite calculer l’AUC à partir d’un arbre de décision CART. Pour chaque observation, l’algorithme renvoie alors un score entre 0 et 1 (et non plus une étiquette dans \\(\\{0,1\\}\\)) : à quoi correspond ce score ?",
      "a": "La <b>proportion d'observations d'apprentissage de classe 1 dans la feuille</b> où tombe le point. C'est une estimation de P(Y=1 | x ∈ feuille), ce que renvoie <code>predict(..., type=\"prob\")</code>."
     }
    ]
   },
   {
    "t": "Exercice 2 (5,5 pts) : clustering",
    "intro": "",
    "qs": [
     {
      "q": "<b>1.</b> Que cherche-t-on à faire lorsqu’on fait du clustering ?",
      "a": "Partitionner des données <b>non étiquetées</b> en groupes homogènes (individus similaires ensemble) et bien séparés les uns des autres, pour explorer et comprendre la structure des données."
     },
     {
      "q": "<b>2.</b> On dispose d’un jeu de données \\((x_1,x_2,x_3,x_4,x_5)\\) dans \\(\\mathbb R^2\\) dont la matrice des distances \\(D\\) est donnée par<div class=\"scroll\"><table class=\"t\"><tr><th></th><th>x<sub>1</sub></th><th>x<sub>2</sub></th><th>x<sub>3</sub></th><th>x<sub>4</sub></th><th>x<sub>5</sub></th></tr><tr><th>x<sub>1</sub></th><td>0</td><td></td><td></td><td></td><td></td></tr><tr><th>x<sub>2</sub></th><td>43</td><td>0</td><td></td><td></td><td></td></tr><tr><th>x<sub>3</sub></th><td>9</td><td>8</td><td>0</td><td></td><td></td></tr><tr><th>x<sub>4</sub></th><td>10</td><td>39</td><td>24</td><td>0</td><td></td></tr><tr><th>x<sub>5</sub></th><td>12</td><td>19</td><td>15</td><td>42</td><td>0</td></tr></table></div><p>Appliquer deux algorithmes de classification ascendante hiérarchique : l'un en considérant une fonction de lien simple (saut minimum) comme distance entre deux clusters et l'autre en considérant une fonction de lien complet (saut maximum), et tracer les dendrogrammes correspondants.</p><p class=\"rappel\">Rappel : soit \\(\\mathcal C_k\\), \\(\\mathcal C_\\ell\\) deux clusters. Les fonctions de lien simple et lien complet sont données respectivement par \\(d(\\mathcal C_k,\\mathcal C_\\ell)=\\min_{(x,y)\\in\\mathcal C_k\\times\\mathcal C_\\ell}d(x,y)\\) et \\(d(\\mathcal C_k,\\mathcal C_\\ell)=\\max_{(x,y)\\in\\mathcal C_k\\times\\mathcal C_\\ell}d(x,y)\\).</p>",
      "a": "<b>Lien simple :</b> {x2,x3} à 8 → {x1,x2,x3} à 9 → + x4 à 10 → + x5 à 12.<br><b>Lien complet :</b> {x2,x3} à 8 → {x1,x4} à 10 → {x2,x3,x5} à 19 → fusion finale à 43.<br>Vérifie et dessine les dendrogrammes avec l'outil CAH (exemple « Examen 2025 S1 »)."
     },
     {
      "q": "<b>3.</b> Soit \\(\\mathcal C_1,\\dots,\\mathcal C_K\\), \\(K\\in\\mathbb N^*\\), des clusters qui forment une partition des données. On introduit les quantités suivantes : \\[\\frac1K\\sum_{k=1}^K\\frac1{|\\mathcal C_k|}\\sum_{x\\in\\mathcal C_k}d(x,\\mu_k)\\qquad\\text{et}\\qquad\\frac{2}{K(K-1)}\\sum_{k=1}^K\\sum_{\\ell=k+1}^K d(\\mu_k,\\mu_\\ell)\\] <b>(a)</b> Quelles informations donnent ces quantités sur la partition \\(\\mathcal C_1,\\dots,\\mathcal C_K\\) ?",
      "a": "La première est l'<b>homogénéité globale</b> : moyenne, sur les K clusters, de la distance moyenne des points à leur centroïde ; à minimiser. La seconde est la <b>séparabilité globale</b> : distance moyenne entre centroïdes, à maximiser."
     },
     {
      "q": "On s’intéresse maintenant à la quantité \\[\\frac1K\\sum_{k=1}^K\\ \\max_{1\\le\\ell\\le K,\\ \\ell\\ne k}\\ \\frac{\\frac1{|\\mathcal C_k|}\\sum_{x\\in\\mathcal C_k}d(x,\\mu_k)+\\frac1{|\\mathcal C_\\ell|}\\sum_{x\\in\\mathcal C_\\ell}d(x,\\mu_\\ell)}{d(\\mu_k,\\mu_\\ell)}\\] <b>(b)</b> Comment utiliseriez-vous cette quantité pour choisir une partition / un clustering des données parmi toutes les partitions possibles ? Justifier rapidement.",
      "a": "C'est l'<b>indice de Davies-Bouldin</b>. Il compare l'homogénéité de deux clusters à leur séparation, dans le pire cas pour chaque cluster. On choisit la partition qui le <b>minimise</b> : clusters compacts et éloignés."
     },
     {
      "q": "<b>4.</b> Expliquer comment utiliser un algorithme des K-moyennes pour faire de la compression d’image. Que se passe-t-il lorsqu’on choisit K = 1 ? Quel pourrait être un désavantage d’utiliser un algorithme de classification ascendante hiérarchique à la place d’un algorithme des K-moyennes ?",
      "a": "Chaque pixel est un point de ℝ³ (R,G,B). On applique un K-means, puis on remplace chaque pixel par la couleur de son centroïde : l'image n'a plus que K couleurs. <b>K = 1</b> : tous les pixels prennent la couleur moyenne, l'image devient unie. <b>CAH</b> : complexité et mémoire quadratiques en le nombre de pixels (souvent des millions) → infaisable ou très lent. Alternative du cours : un K-means avec K grand, puis une CAH sur les centroïdes."
     }
    ]
   },
   {
    "t": "Exercice 3 (5,5 pts) : SVM à marge souple",
    "intro": "<p>On suppose qu’on observe \\(n=200\\) données \\((x_1,y_1),\\dots,(x_n,y_n)\\in\\mathbb R^2\\times\\{-1,1\\}\\). On décide de prédire les labels \\(y_i\\) à l’aide d’un algorithme de machine à vecteurs supports (SVM) à marge souple. On rappelle que, pour cela, on cherche à déterminer \\((\\hat w,\\hat b,\\hat\\xi)\\in\\mathbb R^2\\times\\mathbb R\\times\\mathbb R_+^n\\) tels que</p>\\[\\begin{aligned}(\\hat w,\\hat b,\\hat\\xi)=\\operatorname*{arg\\,min}_{(w,b,\\xi)\\in\\mathbb R^2\\times\\mathbb R\\times\\mathbb R_+^n}\\ &\\tfrac12\\|w\\|_2^2+C\\sum_{i=1}^n\\xi_i\\\\ \\text{s.c. }\\ &y_i(\\langle w,x_i\\rangle+b)\\ge1-\\xi_i\\ \\text{ et }\\ \\xi_i\\ge0\\quad\\forall i\\in\\{1,\\dots,n\\}\\end{aligned}\\qquad(1)\\]",
    "qs": [
     {
      "q": "<b>1.</b> Quels sont les paramètres et les hyperparamètres de ce modèle ?",
      "a": "Paramètres (appris) : w, b (et les variables d'ajustement ξᵢ). Hyperparamètre : <b>C</b>."
     },
     {
      "q": "<b>2.</b> Pour \\((x_i,y_i)\\) dans le jeu d’apprentissage, décrire en fonction de la valeur de \\(\\xi_i\\) où peut se trouver un point \\(x_i\\) lorsqu’on a la contrainte \\(y_i(\\langle w,x_i\\rangle+b)\\ge1-\\xi_i\\). Préciser alors si ce point peut être mal classé.",
      "a": "<ul><li>ξᵢ = 0 : bien classé, en dehors de la zone d'indécision (ou sur H⁺/H⁻).</li><li>0 &lt; ξᵢ &lt; 1 : bien classé, mais dans la zone d'indécision.</li><li>ξᵢ = 1 : sur l'hyperplan séparateur.</li><li>ξᵢ &gt; 1 : <b>mal classé</b>.</li></ul>"
     },
     {
      "q": "<b>3.</b> On applique l’algorithme pour trois valeurs différentes de \\(C\\) : \\(C=0{,}1\\), \\(C=1\\), \\(C=1000\\), voir Figure 2. En justifiant, préciser à quelle figure correspondent les différents algorithmes.<figure class=\"exam-fig\"><img src=\"img/e25_fig2.png\" alt=\"Figure 2\" loading=\"lazy\"><figcaption>Figure 2</figcaption></figure>",
      "a": "Lecture de la figure : <b>C = 1000 → (b)</b>, marge très étroite. C grand : on préfère minimiser le nombre d'outliers. <b>C = 0,1 → (c)</b>, marge la plus large, beaucoup de points dans la zone d'indécision. C petit : on accorde moins d'importance aux outliers. <b>C = 1 → (a)</b>, intermédiaire. (a) et (c) se ressemblent : compare l'écart entre les pointillés."
     },
     {
      "q": "<b>4.</b> En justifiant, expliquer de quelle manière évoluent le biais et la variance du modèle lorsque \\(C\\) augmente.",
      "a": "C ↑ : on pénalise davantage les erreurs, le modèle colle plus aux données d'apprentissage → <b>biais ↓, variance ↑</b> (risque de sur-apprentissage). C ↓ : marge large, modèle plus rigide → biais ↑, variance ↓."
     },
     {
      "q": "<b>5.</b> Supposons qu’on souhaite maintenant utiliser un algorithme SVM à noyau : dans quel cas un tel modèle est-il intéressant ?",
      "a": "Quand les données ne sont <b>pas séparables linéairement, même à quelques points près</b> (frontière courbe, classes imbriquées) : on les envoie dans un espace où elles le deviennent."
     },
     {
      "q": "<b>6.</b> Expliquer en quoi consiste l’astuce du noyau.",
      "a": "Elle intervient dans le problème d'optimisation <b>dual</b>. Dans le dual et dans le classifieur, φ n'intervient que via des produits scalaires ⟨φ(xᵢ),φ(xⱼ)⟩. On les remplace par k(xᵢ,xⱼ), calculé directement sans passer par φ (ex. (⟨x,x'⟩+c)² en O(d) au lieu de O(d²)). Il suffit que k soit symétrique et semi-défini positif pour qu'un tel φ existe."
     }
    ]
   }
  ]
 },
 {
  "id": "e24a",
  "title": "Évaluation 1 — 2024-2025",
  "head": "<p><b>Évaluation 1, 2024-2025</b> (TW132MI, M1 MIASHS).</p><p>Durée : 1h30. Le barème est donné à titre indicatif et pourra éventuellement subir quelques modifications.</p>",
  "exos": [
   {
    "t": "Exercice 1 (7 pts) : types de problèmes et métriques",
    "intro": "",
    "qs": [
     {
      "q": "<b>1.</b> <p>Indiquer (sans justifier) si les problèmes suivants sont des problèmes de clustering, de régression, de classification binaire ou de classification multiclasse.</p><ol type=\"a\" class=\"sub\"><li>Prédire si un crédit accordé est risqué ou non ;</li><li>Détecter la langue d’un texte ;</li><li>Prédire le prix d’un logement en fonction de certaines de ses caractéristiques ;</li><li>Compresser une image ;</li><li>Prédire la probabilité de défaut d’un nouveau prêt ;</li><li>Regrouper des articles de presse.</li></ol>",
      "a": "<ul><li>(a) classification binaire</li><li>(b) classification multiclasse</li><li>(c) régression</li><li>(d) clustering</li><li>(e) régression</li><li>(f) clustering</li></ul>"
     },
     {
      "q": "<b>2.</b> On suppose qu’on observe \\(n=100\\) données d’apprentissage \\((x_1,y_1),\\dots,(x_n,y_n)\\in\\mathbb R^2\\times\\{0,1\\}\\) avec \\(y_i=0\\) pour tout \\(i\\in\\{1,\\dots,53\\}\\), \\(y_i=1\\) pour \\(i\\in\\{54,\\dots,100\\}\\). À partir de ce jeu d’apprentissage, on construit deux classifieurs des K plus proches voisins : un premier modèle avec \\(K=1\\) et un deuxième avec \\(K=10\\). On utilise ensuite ces modèles pour prédire les étiquettes \\(y_{\\text{new},i}\\) de 15 nouvelles observations ; les prédictions sont notées \\(\\hat y_{\\text{new},i}\\). Les résultats sont donnés dans la Table 1 ci-dessous.<div class=\"scroll\"><table class=\"t\"><tr><th>Observation n°i</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th><th>13</th><th>14</th><th>15</th></tr><tr><th>y<sub>new,i</sub></th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td></tr><tr><th>ŷ<sub>new,i</sub> – modèle 1</th><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>0</td></tr><tr><th>ŷ<sub>new,i</sub> – modèle 2</th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td></tr></table></div><p class=\"cap\">Table 1</p><b>(a)</b> Pour chacun des modèles, construire la matrice de confusion associée à ces prédictions.<br><b>(b)</b> Calculer ensuite :<ul><li>l’accuracy, c’est-à-dire la proportion d’observations bien classées ;</li><li>la sensibilité (aussi appelée rappel) qui représente le taux de vrais positifs parmi les observations étiquetées 1.</li></ul>",
      "a": "Vraies étiquettes : 2 positifs (obs. 8 et 14), 13 négatifs.<br><b>Modèle 1 (K=1)</b> : TP=2, FN=0, FP=2 (obs. 3 et 11), TN=11 → accuracy = 13/15 ≈ <b>0,867</b> ; sensibilité = 2/2 = <b>1</b>.<br><b>Modèle 2 (K=10)</b> : TP=1, FN=1 (obs. 8), FP=0, TN=13 → accuracy = 14/15 ≈ <b>0,933</b> ; sensibilité = 1/2 = <b>0,5</b>.<br>À vérifier avec l'outil « Matrice de confusion »."
     },
     {
      "q": "<b>(c)</b> Supposons que nous considérons un troisième modèle avec \\(K=100\\). Quelles seraient les valeurs de l’accuracy et de la sensibilité sur notre échantillon de validation ? Justifier.",
      "a": "K = n = 100 : tous les points sont voisins → on prédit toujours la classe majoritaire de l'apprentissage, 0 (53 contre 47). Accuracy = 13/15 ≈ <b>0,867</b>, sensibilité = 0/2 = <b>0</b>."
     },
     {
      "q": "<b>(d)</b> Donner un exemple de problème de classification binaire pour lequel il vous semble préférable d’évaluer un modèle en considérant comme critère la <i>sensibilité</i>. Quel modèle choisiriez-vous alors entre le modèle 1 et le modèle 2 ?",
      "a": "Dépistage d'une maladie grave, détection de fraude : rater un positif coûte cher. On choisirait le <b>modèle 1</b> (sensibilité 1 contre 0,5)."
     },
     {
      "q": "<b>(e)</b> Supposons maintenant que l’on s’intéresse à un problème de classification multiclasse. On construit grâce à un échantillon d’apprentissage un classifieur des K plus proches voisins avec \\(K=1\\) et on prédit à l’aide de ce modèle les étiquettes d’un échantillon de validation. Décrire une procédure possible pour calculer la <i>sensibilité</i> de ce modèle.",
      "a": "Stratégie <b>one-versus-all</b> : pour chaque classe k, on considère k comme positive et les autres comme négatives, et on calcule TP_k/(TP_k+FN_k) sur la validation. On agrège ensuite : macro-average (moyenne simple), pondérée par le support, ou micro-average (ΣTP/Σ(TP+FN), qui donne l'accuracy)."
     }
    ]
   },
   {
    "t": "Exercice 2 (7,5 pts) : classifieurs linéaires, CART, SVM",
    "intro": "",
    "qs": [
     {
      "q": "<b>1.</b> Sans donner d’expression mathématique, dire ce qu’est un classifieur linéaire.",
      "a": "Un classifieur dont la <b>frontière de décision est un hyperplan</b> (une droite en 2D) : les points d'un côté reçoivent une classe, ceux de l'autre côté l'autre classe."
     },
     {
      "q": "<b>2.</b> Quel arbre de classification CART maximal construiriez-vous à partir des données présentées dans la Figure 1 ci-dessous ?<br>Pour information, un arbre maximal en classification est un arbre de taille minimale qu’on peut obtenir avec des feuilles <i>pures</i>, i.e. dans chaque feuille, les données d’apprentissage ont toutes la même étiquette.<figure class=\"exam-fig\"><img src=\"img/e24a_fig1.png\" alt=\"Figure 1\" loading=\"lazy\"><figcaption>Figure 1</figcaption></figure>",
      "a": "Lecture de la figure : la classe 1 (orange) est en bas à gauche, la classe 0 (bleu) en haut à droite, plus quelques points bleus tout en bas (x₂ &lt; −1). Un arbre à 4 feuilles pures (seuils approximatifs) :<div class=\"f\" style=\"margin:6px 0\">x₂ &lt; −1 ?\n├─ oui → 0\n└─ non → x₁ &lt; 1,1 ?\n         ├─ oui → 1\n         └─ non → x₂ &lt; 1 ?\n                  ├─ oui → 1\n                  └─ non → 0</div>Méthode : chaque coupure est verticale (x₁ &lt; s) ou horizontale (x₂ &lt; s). On ajoute des coupures jusqu'à ce que toutes les feuilles soient pures, avec le moins de feuilles possible."
     },
     {
      "q": "<b>3.</b> Pourrait-on obtenir une classification similaire à celle donnée à la question précédente si l’on considère le classifieur de régression logistique ? Justifier.",
      "a": "Non : la régression logistique est un <b>classifieur linéaire</b>, sa frontière est une seule droite. Ici, aucune droite ne sépare à la fois les points bleus du haut et ceux du bas des points orange. CART produit une frontière en escalier (plusieurs coupures orthogonales aux axes), non linéaire."
     },
     {
      "q": "On s’intéresse maintenant au problème de classification binaire suivant : on cherche à prédire si une personne souffre ou non du diabète sur la base de variables médicales (jeu de données <i>PimaIndiansDiabetes</i> sous R). À partir d’un jeu d’apprentissage de taille 615, on construit un arbre maximal CART. En utilisant un jeu de validation, on décide ensuite d’élaguer cet arbre : on garde l’arbre \\(T\\) qui permet de minimiser le coût en complexité \\[C_\\lambda(T)=\\sum_{l=1}^{|T|}n_l\\,\\mathcal I(R_l)+\\lambda|T|\\] où \\(|T|\\) est la taille de l’arbre, i.e. le nombre de régions définies par l’arbre \\(T\\) ; \\(\\mathcal I(R_l)\\) est l’indice d’impureté de la région \\(R_l\\) ; \\(\\lambda>0\\) est un paramètre à choisir.<br><b>4.</b> On décide d’élaguer l’arbre maximal pour quatre valeurs différentes de \\(\\lambda\\) : \\(\\lambda_1,\\lambda_2,\\lambda_3,\\lambda_4\\) avec \\(\\lambda_1\\lt\\lambda_2\\lt\\lambda_3\\lt\\lambda_4\\). Les résultats sont donnés à la Figure 2. En justifiant, associer les graphiques aux différentes valeurs de \\(\\lambda\\).<figure class=\"exam-fig\"><img src=\"img/e24a_fig2.png\" alt=\"Figure 2\" loading=\"lazy\"><figcaption>Figure 2</figcaption></figure>",
      "a": "C_λ(T) = Σ n_l I(R_l) + λ|T| : plus λ est grand, plus chaque feuille coûte cher → <b>arbre plus petit</b>. Lecture de la figure : <b>λ₁ → (c)</b> (très grand arbre), <b>λ₂ → (b)</b> (≈ 8 feuilles), <b>λ₃ → (d)</b> (≈ 6 feuilles), <b>λ₄ → (a)</b> (2 feuilles)."
     },
     {
      "q": "<b>5.</b> En justifiant, expliquer de quelle manière évoluent le biais et la variance du modèle lorsque \\(\\lambda\\) augmente.",
      "a": "λ ↑ → arbre plus petit, donc modèle plus simple : <b>biais ↑, variance ↓</b>. λ petit → arbre proche de l'arbre maximal, qui colle aux données : biais faible, variance forte."
     },
     {
      "q": "<b>6.</b> On note toujours \\(|T|\\) la taille de l’arbre construit. Pour \\(|T|=1\\) quel est le taux d’erreur du classifieur CART sur le jeu de données d’apprentissage ? Et pour \\(|T|=615\\) ? Justifier.",
      "a": "|T| = 1 : on prédit la classe majoritaire (non diabétique) pour tous → erreur = proportion de la classe minoritaire (diabétiques) dans l'apprentissage. L'énoncé ne donne pas cette valeur. |T| = 615 = n : une feuille par observation → feuilles pures → erreur <b>0</b> (sauf doublons contradictoires)."
     },
     {
      "q": "<b>7.</b> On s’intéresse encore à un problème de classification binaire. Sur des données d’apprentissage, on a entraîné deux classifieurs différents : un classifieur des demi-espaces et un classifieur de régression logistique pour un seuil \\(s=0{,}5\\) : les frontières de décision sont représentées sur la Figure 3 ci-dessous. En justifiant, dire à quel classifieur correspond chaque frontière de décision. Quel classifieur privilégieriez-vous ? Pourquoi ?<figure class=\"exam-fig\"><img src=\"img/e24a_fig3.png\" alt=\"Figure 3\" loading=\"lazy\"><figcaption>Figure 3</figcaption></figure>",
      "a": "Lecture de la figure : la <b>droite rouge</b>, collée aux points, ne fait (presque) aucune erreur : c'est le <b>classifieur des demi-espaces</b>. Il ne pénalise que les erreurs (coût 0/1) et cherche à toutes les éviter, quitte à frôler les points. La <b>droite verte</b> est la <b>régression logistique</b>. Elle pénalise aussi les points bien classés mais proches de la frontière, donc elle s'éloigne des points, quitte à mal classer les 2 points bleus isolés près des orange. On privilégie la logistique : elle évite mieux l'écueil du <b>sur-apprentissage</b> (ces 2 points sont peut-être du bruit) et donne une probabilité."
     },
     {
      "q": "<b>8.</b> On s’intéresse à un modèle SVM à noyaux. Quels sont les hyperparamètres de ce modèle ? (on considère ici la distance euclidienne comme distance entre deux points de \\(\\mathbb R^2\\)).",
      "a": "La constante <b>C</b>, le <b>choix du noyau</b>, et les <b>paramètres du noyau</b> : γ (ou σ) pour le noyau gaussien ; degré q et constante c pour le polynomial."
     },
     {
      "q": "<b>9.</b> Détailler une procédure pour sélectionner un classifieur parmi les classifieurs SVM à noyaux à partir d’un jeu de données \\((x_1,y_1),\\dots,(x_n,y_n)\\in\\mathbb R^2\\times\\{0,1\\}\\).",
      "a": "<ul><li>Séparer les données en apprentissage/validation d'un côté, test de l'autre.</li><li>Définir une grille : noyaux × valeurs de C × paramètres (γ, degré…).</li><li>Pour chaque combinaison, faire une validation croisée K-fold sur l'apprentissage et calculer le score moyen (accuracy, AUC…).</li><li>Garder la meilleure combinaison et la réentraîner sur tout l'apprentissage.</li><li>Évaluer ce modèle sur le jeu de test.</li></ul>"
     }
    ]
   },
   {
    "t": "Exercice 3 (5,5 pts) : clustering",
    "intro": "<p>On suppose qu’on observe \\(n\\in\\mathbb N^*\\) données \\(x_1,x_2,\\dots,x_n\\in\\mathbb R^2\\).</p>",
    "qs": [
     {
      "q": "<b>1.</b> Que cherche-t-on à faire lorsqu’on fait du clustering ?",
      "a": "Regrouper des données non étiquetées en clusters homogènes et bien séparés."
     },
     {
      "q": "<b>2.</b> Après avoir appliqué un algorithme de clustering sur les données, on décide de sélectionner une partition à l’aide du coefficient de silhouette. Pour rappel, le coefficient de silhouette global \\(s\\) se calcule comme la moyenne des coefficients de silhouette individuels : \\[s=\\frac1n\\sum_{i=1}^ns(x_i)\\] où, pour toute observation \\(x\\in\\{x_1,\\dots,x_n\\}\\), \\[s(x)=\\frac{b(x)-a(x)}{\\max\\big(a(x),b(x)\\big)}\\in[-1,1]\\] avec \\[a(x)=\\frac1{|\\mathcal C_{k(x)}|-1}\\sum_{y\\in\\mathcal C_{k(x)},\\,y\\ne x}d(x,y)\\qquad b(x)=\\min_{\\ell\\ne k(x)}\\frac1{|\\mathcal C_\\ell|}\\sum_{y\\in\\mathcal C_\\ell}d(x,y)\\]<ol type=\"a\" class=\"sub\"><li>Quelles valeurs \\(s\\) peut-il prendre ?</li><li>Soit une observation \\(x\\in\\{x_1,\\dots,x_n\\}\\). Supposons que nous sommes en train d’évaluer une partition avec 3 clusters et que \\(s(x)\\lt0\\). Qu’est-ce que cela signifie ? Dessiner une situation où l’on aurait \\(s(x)\\lt0\\). Vous veillerez à représenter les 3 clusters et à identifier clairement le point \\(x\\).</li><li>Même question que précédemment, avec \\(s(x)\\ge0\\).</li><li>À l’aide du coefficient de silhouette, comment sélectionner une partition ? Justifier rapidement.</li></ol>",
      "a": "(a) s ∈ [−1, 1]. (b) b(x) &lt; a(x) : x est en moyenne plus proche des points d'un autre cluster que du sien, donc probablement mal assigné. Dessin : x placé dans le cluster A mais collé au cluster B. (c) a(x) ≤ b(x) : x est plus proche de son cluster que des autres (bien assigné si s ≈ 1). Dessin : x au cœur de son cluster. (d) On calcule s pour chaque partition candidate et on garde celle qui le <b>maximise</b>."
     },
     {
      "q": "<b>3.</b> Pour \\(n=5\\), la matrice des distances \\(D\\) entre les points \\(x_1,x_2,x_3,x_4\\) et \\(x_5\\) est donnée par<div class=\"scroll\"><table class=\"t\"><tr><th></th><th>x<sub>1</sub></th><th>x<sub>2</sub></th><th>x<sub>3</sub></th><th>x<sub>4</sub></th><th>x<sub>5</sub></th></tr><tr><th>x<sub>1</sub></th><td>0</td><td></td><td></td><td></td><td></td></tr><tr><th>x<sub>2</sub></th><td>23</td><td>0</td><td></td><td></td><td></td></tr><tr><th>x<sub>3</sub></th><td>10</td><td>50</td><td>0</td><td></td><td></td></tr><tr><th>x<sub>4</sub></th><td>13</td><td>33</td><td>55</td><td>0</td><td></td></tr><tr><th>x<sub>5</sub></th><td>35</td><td>24</td><td>18</td><td>34</td><td>0</td></tr></table></div><p>Appliquer deux algorithmes de classification ascendante hiérarchique : l'un en considérant une fonction de lien simple (saut minimum) comme distance entre deux clusters et l'autre en considérant une fonction de lien complet (saut maximum), et tracer les dendrogrammes correspondants.</p><p class=\"rappel\">Rappel : soit \\(\\mathcal C_k\\), \\(\\mathcal C_\\ell\\) deux clusters. Les fonctions de lien simple et lien complet sont données respectivement par \\(d(\\mathcal C_k,\\mathcal C_\\ell)=\\min_{(x,y)\\in\\mathcal C_k\\times\\mathcal C_\\ell}d(x,y)\\) et \\(d(\\mathcal C_k,\\mathcal C_\\ell)=\\max_{(x,y)\\in\\mathcal C_k\\times\\mathcal C_\\ell}d(x,y)\\).</p>",
      "a": "<b>Lien simple :</b> {x1,x3} à 10 → + x4 à 13 → + x5 à 18 → + x2 à 23.<br><b>Lien complet :</b> {x1,x3} à 10 → {x2,x5} à 24 → {x2,x4,x5} à 34 → fusion finale à 55.<br>À vérifier avec l'outil CAH (exemple « Examen 2024 S1 »)."
     },
     {
      "q": "<b>4.</b> Quelle procédure entre l’algorithme des K-moyennes et l’algorithme de classification ascendante hiérarchique a la plus grande complexité algorithmique ? Pour répondre, préciser :<ul><li>combien de distances sont calculées à chaque itération de l’algorithme des K-moyennes,</li><li>combien de distances sont calculées à chaque étape de classification ascendante hiérarchique.</li></ul>",
      "a": "K-means : à chaque itération, <b>K·n distances</b> (chaque point vers chaque centroïde), soit O(nKd) par itération, linéaire en n. CAH : à l'étape où il reste m clusters, on compare <b>m(m−1)/2 paires</b>, et on part de n(n−1)/2 distances entre points → quadratique en n. <b>La CAH est la plus complexe.</b>"
     }
    ]
   }
  ]
 },
 {
  "id": "e24b",
  "title": "Évaluation 2 — 2024-2025",
  "head": "<p><b>Évaluation 2, 2024-2025</b> (TW132MI, M1 MIASHS).</p><p>Durée : 1h30. Le barème est donné à titre indicatif et pourra éventuellement subir quelques modifications.</p><p>Veillez à justifier vos réponses.</p>",
  "exos": [
   {
    "t": "Exercice 1 (9,5 pts) : KNN multiclasse (150 données, 3 classes)",
    "intro": "<p>On suppose qu’on observe \\(n=150\\) données \\((x_1,y_1),\\dots,(x_n,y_n)\\in\\mathbb R^2\\times\\{1,2,3\\}\\) avec \\(y_i=1\\) pour tout \\(i\\in\\{1,\\dots,52\\}\\), \\(y_i=2\\) pour \\(i\\in\\{53,\\dots,107\\}\\), et \\(y_i=3\\) pour \\(i\\in\\{108,\\dots,150\\}\\). On décide de prédire les labels \\(y_i\\) à l’aide de la méthode des K plus proches voisins pour \\(K=1\\), \\(K=20\\) et \\(K=150\\). Chacun des trois algorithmes est entraîné sur les données \\((x_1,y_1),\\dots,(x_n,y_n)\\).</p>",
    "qs": [
     {
      "q": "<b>1.</b> Pour \\(K=20\\), écrire l’expression mathématique du classifieur \\(f\\) associé à l’algorithme des K plus proches voisins susmentionné.",
      "a": "f(x) = argmax_{k∈{1,2,3}} Σ_{i : xᵢ∈N₂₀(x)} 1{yᵢ = k}, où N₂₀(x) est l'ensemble des 20 plus proches voisins de x parmi x₁,…,x₁₅₀."
     },
     {
      "q": "On décide ensuite, grâce à ces 3 algorithmes, de prédire les classes du jeu de données d’entraînement pour voir si les classes prédites correspondent aux classes observées. Les résultats sont donnés à la Figure 1.<figure class=\"exam-fig\"><img src=\"img/e24b_fig1.png\" alt=\"Figure 1\" loading=\"lazy\"><figcaption>Figure 1</figcaption></figure><b>2.</b> En justifiant, préciser à quelle figure correspondent les différents algorithmes.",
      "a": "<b>K = 150 → (a)</b> : une seule couleur de fond, la classe majoritaire 2 (55 points). <b>K = 1 → (b)</b> : îlots autour de chaque point isolé ; les prédictions sur l'apprentissage reproduisent exactement les vraies classes (chaque point est son propre voisin). <b>K = 20 → (c)</b> : frontières lissées, quelques erreurs."
     },
     {
      "q": "<b>3.</b> Quel(s) cas correspond(ent) à un cas de sous-apprentissage ? de sur-apprentissage ? Expliquer pourquoi.",
      "a": "K = 1 : <b>sur-apprentissage</b> (colle au bruit, variance forte). K = 150 : <b>sous-apprentissage</b> (ignore x, biais fort). K = 20 est un compromis."
     },
     {
      "q": "<b>4.</b> Donner l’accuracy du premier modèle (lorsque \\(K=1\\)) et du dernier modèle (lorsque \\(K=150\\)) sur le jeu d’apprentissage.",
      "a": "K = 1 : <b>1</b> (100 %). K = 150 : on prédit toujours la classe 2 → 55/150 ≈ <b>0,367</b>."
     },
     {
      "q": "<b>5.</b> On souhaite calculer la sensibilité du deuxième modèle (toujours sur les données d’apprentissage), c’est-à-dire lorsque le nombre de voisins \\(K=20\\). Décrire une procédure possible.<br><i>Rappel : dans une classification binaire, la sensibilité représente le taux de vrais positifs. C’est la proportion d’exemples positifs correctement classifiés : TP/(TP+FN).</i>",
      "a": "One-versus-all : pour chaque classe k, TP_k/(TP_k+FN_k), avec k positive et les deux autres négatives. On agrège ensuite par macro-average (moyenne des 3), pondérée par le support, ou micro-average."
     },
     {
      "q": "<b>6.</b> On souhaite choisir, à partir du jeu de données \\((x_1,y_1),\\dots,(x_n,y_n)\\), la valeur du nombre de voisins \\(K\\) parmi un ensemble de valeurs possibles en utilisant une méthode de validation croisée 5-fold. Décrire la procédure.",
      "a": "Découper aléatoirement les 150 données en 5 blocs de 30. Pour chaque K candidat et chaque bloc b : entraîner le KNN sur les 4 autres blocs, prédire le bloc b, calculer l'erreur. Moyenner les 5 erreurs pour chaque K, choisir le K d'erreur moyenne minimale, puis réentraîner sur les 150 données."
     },
     {
      "q": "<b>7.</b> On fusionne maintenant les classes 1 et 3 : cela devient donc un problème de classification binaire. À partir du jeu d’apprentissage, on entraîne un classifieur des K plus proches voisins avec \\(K=20\\). Ensuite, à partir d’un nouveau jeu de données test de taille \\(n=40\\), on construit la courbe ROC. Cette courbe représente la capacité du modèle à distinguer entre les deux classes. Sur l’axe des abscisses, on représente le taux de faux positifs et, sur l’axe des ordonnées, le taux de vrais positifs. Chaque point sur la courbe correspond à un seuil de classification différent.<br>Expliquer comment est construite cette courbe. En particulier, vous préciserez comment sont calculées les probabilités qui permettent ensuite, à chaque seuil de classification différent, de savoir si un point est classé dans la classe 0 ou dans la classe 1.",
      "a": "Pour chaque point du test, le score est la <b>proportion de ses 20 voisins de la classe positive</b>. Si la classe positive est la classe fusionnée : p̂(x) = (1/20) Σ_{i : xᵢ∈N₂₀(x)} 1{yᵢ ∈ {1,3}}. Les scores sont donc des multiples de 1/20. Pour chaque seuil s, on prédit 1 si p̂(x) ≥ s, et on calcule TPR = TP/(TP+FN) et FPR = FP/(FP+TN). On place les points (FPR, TPR) : (0,0) pour s &gt; score max, (1,1) pour s = 0. <b>À la main (méthode du cours)</b> : trier les 40 points par score décroissant, partir de (0,0) ; un vrai positif fait monter de 1/P, un vrai négatif fait avancer de 1/N. L'AUC est l'aire sous cette courbe."
     }
    ]
   },
   {
    "t": "Exercice 2 (3,5 pts) : SVM à noyau radial",
    "intro": "<p>On suppose qu’on observe \\(n=200\\) données d’apprentissage \\((x_1,y_1),\\dots,(x_n,y_n)\\in\\mathbb R^2\\times\\{-1,1\\}\\). On décide de prédire les labels \\(y_i\\) à l’aide d’un algorithme de machine à vecteurs supports (SVM) à noyau. On considère pour cela le noyau radial qui dépend d’un paramètre \\(\\gamma\\). En fixant \\(C=10\\), on applique l’algorithme pour 4 valeurs différentes de \\(\\gamma\\) : 0,05, 1, 20 et 50. Les résultats sont donnés à la figure 2.</p>",
    "qs": [
     {
      "q": "<b>1.</b> Expliquer ce qu’est la variance d’une procédure / d’un classifieur. Que se passe-t-il lorsque la variance est très grande ?",
      "a": "C'est la variabilité du classifieur appris quand l'échantillon d'apprentissage change. Variance très grande : le modèle capture le bruit, change beaucoup d'un échantillon à l'autre, et <b>sur-apprend</b> (bon sur l'apprentissage, mauvais sur de nouvelles données)."
     },
     {
      "q": "<b>2.</b> En TP, nous avions remarqué que, plus \\(\\gamma\\) est grand, plus la variance du classifieur augmente. En justifiant, associer les graphiques aux différentes valeurs de \\(\\gamma\\).<br><i>Remarque : comme pour la figure 1, la couleur des points \\(x_i\\) indique la valeur de \\(y_i\\) (rouge lorsque \\(y_i=1\\), noir sinon) et la couleur des pointillés en arrière-plan indique la valeur du label attribué par l’algorithme (rouge pour 1 et noir sinon).</i><figure class=\"exam-fig\"><img src=\"img/e24b_fig2.png\" alt=\"Figure 2\" loading=\"lazy\"><figcaption>Figure 2</figcaption></figure>",
      "a": "γ ↑ → variance ↑ : la frontière devient de plus en plus irrégulière, avec des îlots autour des points. Lecture de la figure : <b>γ = 0,05 → (a)</b> (frontière si lisse qu'une seule classe est prédite partout : sous-apprentissage) ; <b>γ = 1 → (c)</b> (une grande région lisse) ; <b>γ = 20 → (d)</b> (îlots) ; <b>γ = 50 → (b)</b> (îlots les plus petits et serrés autour des points)."
     },
     {
      "q": "<b>3.</b> Aurait-il été intéressant d’appliquer uniquement un algorithme SVM à marge souple sur ces données ? Pourquoi ?",
      "a": "Non : les points noirs sont au milieu, entourés de points rouges des deux côtés. Les classes ne sont <b>pas séparables linéairement, même à quelques points près</b>. Une frontière linéaire ferait beaucoup d'erreurs : il faut un noyau."
     }
    ]
   },
   {
    "t": "Exercice 3 (7 pts) : K-means et CAH",
    "intro": "",
    "qs": [
     {
      "q": "<b>1.</b> Soit \\(n\\in\\mathbb N^*\\) données \\(x_1,x_2,\\dots,x_n\\in\\mathbb R^d\\), \\(d\\in\\mathbb N^*\\). On décide de regrouper ces données observées en trois groupes différents à l’aide de l’algorithme de Lloyd, c’est-à-dire l’algorithme des K moyennes vu en cours. Décrire les étapes de cet algorithme.",
      "a": "1) Choisir 3 centroïdes initiaux au hasard parmi les points (ou K-means++). 2) Affecter chaque point au centroïde le plus proche. 3) Recalculer chaque centroïde comme la moyenne de son cluster. 4) Répéter 2-3 jusqu'à ce que les affectations ne changent plus."
     },
     {
      "q": "<b>2.</b> On sait que l’inertie intra-classes diminue à chaque itération de cet algorithme des K moyennes. Quel problème cela peut-il poser ? Que peut-on faire pour limiter ce problème ?",
      "a": "L'algorithme converge vers un <b>minimum local</b> qui dépend de l'initialisation : il peut rester bloqué sur une mauvaise partition. Solution : relancer plusieurs fois avec des initialisations différentes (<code>nstart</code>) et garder la partition de plus petite I_W ; ou utiliser K-means++."
     },
     {
      "q": "On observe \\(n=400\\) points \\(x_1,\\dots,x_n\\in\\mathbb R^2\\), voir Figure 3. On souhaite regrouper ces données en classes. On décide dans un premier temps de classer ces données à l’aide d’un algorithme de classification ascendante hiérarchique. En particulier, on a considéré deux algorithmes de classification ascendante hiérarchique : l’un utilise une fonction de lien complet et l’autre une fonction de lien simple. On a ensuite utilisé les résultats de ces deux algorithmes pour regrouper les données en 3 classes. La Figure 4 montre les deux résultats obtenus.<p class=\"rappel\">Rappel : soit \\(\\mathcal C_k\\), \\(\\mathcal C_\\ell\\) deux clusters. Les fonctions de lien simple et lien complet sont données respectivement par \\(d(\\mathcal C_k,\\mathcal C_\\ell)=\\min_{(x,y)\\in\\mathcal C_k\\times\\mathcal C_\\ell}d(x,y)\\) et \\(d(\\mathcal C_k,\\mathcal C_\\ell)=\\max_{(x,y)\\in\\mathcal C_k\\times\\mathcal C_\\ell}d(x,y)\\).</p><figure class=\"exam-fig\"><img src=\"img/e24b_fig3.png\" alt=\"Figure 3 – 400 données x1,…,x400 dans R²\" loading=\"lazy\"><figcaption>Figure 3 – 400 données \\(x_1,\\dots,x_{400}\\in\\mathbb R^2\\)</figcaption></figure><b>3.</b> Donner deux méthodes pour choisir le nombre de clusters lorsqu’on effectue une classification ascendante hiérarchique.",
      "a": "Couper le dendrogramme avant une branche très longue (grand saut de distance), ou fixer un seuil de distance. On peut aussi évaluer chaque coupe avec la silhouette (maximiser) ou Davies-Bouldin (minimiser)."
     },
     {
      "q": "<b>4.</b> Pour chacun des résultats de la Figure 4, préciser et justifier à quelle fonction de lien ils sont associés.<figure class=\"exam-fig\"><img src=\"img/e24b_fig4.png\" alt=\"Figure 4\" loading=\"lazy\"><figcaption>Figure 4</figcaption></figure>",
      "a": "<b>4a = lien complet</b> : il coupe le grand anneau extérieur en 3 morceaux compacts, les deux petits anneaux centraux étant regroupés avec le morceau en haut à gauche (classe 2), car il refuse de fusionner des clusters dont certains points sont très éloignés (les deux bouts de l'anneau). <b>4b = lien simple</b> : il enchaîne les points proches de proche en proche, donc il garde l'anneau extérieur entier et sépare les deux petits anneaux."
     },
     {
      "q": "<b>5.</b> Nous avons vu en cours que l’inertie \\(I\\) du nuage de points \\(x_1,\\dots,x_n\\) se décomposait de la manière suivante : \\[I=\\sum_{i=1}^n\\|x_i-\\mu\\|^2=I_W+I_B,\\] avec<ul><li>\\(I_W=\\sum_{k=1}^K\\sum_{x_i\\in\\mathcal C_k}\\|x_i-\\mu_k\\|^2\\) et \\(\\mu_k=\\frac1{|\\mathcal C_k|}\\sum_{x_i\\in\\mathcal C_k}x_i\\) ;</li><li>\\(I_B=\\sum_{k=1}^K|\\mathcal C_k|\\,\\|\\mu_k-\\mu\\|^2\\) et \\(\\mu=\\frac1n\\sum_{i=1}^nx_i\\).</li></ul>Que représentent \\(I_W\\) et \\(I_B\\) ? Comment utiliseriez-vous ces quantités pour choisir le nombre de classes à sélectionner ?",
      "a": "I_W : inertie intra-classes, l'homogénéité des clusters (à minimiser). I_B : inertie inter-classes, la séparation (à maximiser). I = I_W + I_B ne dépend pas de la partition : minimiser I_W revient à maximiser I_B. I_W diminue toujours avec K : on trace I_W(K) et on choisit K au <b>coude</b>, là où la diminution ralentit nettement."
     },
     {
      "q": "<b>6.</b> On décide maintenant de classer ces données à l’aide de l’algorithme des K moyennes vu en cours. Pensez-vous que l’algorithme pourra séparer les données de la même manière que dans la Figure 4b ? Pourquoi ? Sans rentrer dans les détails, que proposeriez-vous sinon pour qu’il trouve les mêmes classes que dans la Figure 4b ?",
      "a": "Non : le K-means produit des cellules de Voronoï, donc des clusters <b>convexes</b>, et l'anneau extérieur ne l'est pas. Solution du cours : appliquer l'<b>astuce du noyau à l'algorithme de Lloyd</b> (K-means à noyau). Autre solution, vue en TP : transformer les données, par exemple φ(x,y) = (x, y, (x−a)²+(y−b)²) avec (a,b) le centre de l'anneau (ici environ (−5, 5)), puis appliquer le K-means dans ce nouvel espace."
     }
    ]
   }
  ]
 },
 {
  "id": "blanc1",
  "title": "Sujet blanc 1 (entraînement)",
  "head": "",
  "exos": [
   {
    "t": "Exercice 1 (7 pts) : types de problèmes, matrice de confusion, courbe ROC",
    "intro": "",
    "qs": [
     {
      "q": "Indiquer (sans justifier) s'il s'agit de clustering, de régression, de classification binaire ou multiclasse : (a) prédire la durée d'hospitalisation (en jours) d'un patient ; (b) reconnaître le chiffre manuscrit (0 à 9) sur une image ; (c) regrouper les clients d'un site de vente selon leur comportement d'achat ; (d) détecter si un e-mail est un spam ; (e) prédire la température maximale de demain ; (f) identifier des groupes de gènes au comportement similaire.",
      "a": "<ul><li>(a) régression (valeur numérique)</li><li>(b) classification multiclasse (10 étiquettes fixées à l'avance)</li><li>(c) clustering (pas d'étiquettes)</li><li>(d) classification binaire</li><li>(e) régression</li><li>(f) clustering</li></ul>"
     },
     {
      "q": "Un modèle de détection de fraude est évalué sur 20 transactions de validation (1 = fraude, classe positive) :<div class=\"scroll\"><table class=\"t\"><tr><th>i</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td><td>20</td></tr><tr><th>y</th><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>0</td></tr><tr><th>ŷ</th><td>0</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td></tr></table></div>Construire la matrice de confusion (lignes = classe prédite, colonnes = classe réelle).",
      "a": "On compte d'abord les classes réelles : 6 positifs (i = 2, 5, 9, 12, 16, 19) et 14 négatifs.<ul><li>Parmi les 6 positifs, ŷ = 1 pour i = 2, 9, 12, 19 → <b>TP = 4</b> ; ŷ = 0 pour i = 5, 16 → <b>FN = 2</b>.</li><li>Parmi les 14 négatifs, ŷ = 1 pour i = 3, 11, 18 → <b>FP = 3</b> ; les autres → <b>TN = 11</b>.</li></ul><div class=\"scroll\"><table class=\"t\"><tr><th>prédit \\ réel</th><th>0</th><th>1</th></tr><tr><th>0</th><td>TN = 11</td><td>FN = 2</td></tr><tr><th>1</th><td>FP = 3</td><td>TP = 4</td></tr></table></div>Vérification : 11 + 2 + 3 + 4 = 20."
     },
     {
      "q": "Calculer l'accuracy, la sensibilité, la spécificité, la précision et le F1-score.",
      "a": "<div class=\"f\">Accuracy    = (TP+TN)/n      = 15/20 = 0,75\nSensibilité = TP/(TP+FN)     = 4/6   ≈ 0,667\nSpécificité = TN/(TN+FP)     = 11/14 ≈ 0,786\nPrécision   = TP/(TP+FP)     = 4/7   ≈ 0,571\nF1          = 2TP/(2TP+FP+FN) = 8/13 ≈ 0,615</div>Le modèle détecte 2 fraudes sur 3, et un peu plus de la moitié de ses alertes sont de vraies fraudes."
     },
     {
      "q": "Un collègue propose un modèle « naïf » qui prédit toujours 0. Calculer son accuracy et sa sensibilité sur ces 20 transactions. Que peut-on en conclure ?",
      "a": "Toujours 0 : TP = 0, FN = 6, FP = 0, TN = 14. <b>Accuracy = 14/20 = 0,70</b>, à peine moins que notre modèle (0,75). <b>Sensibilité = 0/6 = 0</b> : il ne détecte aucune fraude (sa précision n'est même pas définie, 0/0).<br>Conclusion : avec des classes <b>déséquilibrées</b>, l'accuracy est trompeuse. Elle ne reflète pas la capacité à bien classer la classe minoritaire, qui est ici la plus importante. Il faut regarder la sensibilité (et la précision ou la spécificité)."
     },
     {
      "q": "Un autre modèle renvoie un score dans [0,1] pour 10 nouvelles transactions :<div class=\"scroll\"><table class=\"t\"><tr><th>score</th><td>0,95</td><td>0,88</td><td>0,80</td><td>0,71</td><td>0,62</td><td>0,55</td><td>0,47</td><td>0,33</td><td>0,21</td><td>0,10</td></tr><tr><th>y</th><td>1</td><td>1</td><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td></tr></table></div>(a) Avec le seuil s = 0,5 (ŷ = 1 si score ≥ s), donner TP, FP, FN, TN, puis le point (FPR, TPR) correspondant.<br>(b) Tracer la courbe ROC à la main et calculer l'AUC.",
      "a": "<b>(a)</b> Scores ≥ 0,5 : 0,95 ; 0,88 ; 0,80 ; 0,71 ; 0,62 ; 0,55 → 6 prédits positifs, dont 3 vrais positifs. <b>TP = 3, FP = 3, FN = 1, TN = 3</b>. TPR = 3/4 = 0,75 ; FPR = 3/6 = 0,5. Point <b>(0,5 ; 0,75)</b>.<br><b>(b)</b> P = 4 positifs, N = 6 négatifs. Les scores sont déjà triés par ordre décroissant. On part de (0,0) : un positif fait monter de 1/4, un négatif fait avancer de 1/6.<div class=\"f\">0,95 (1) → (0 ; 0,25)\n0,88 (1) → (0 ; 0,5)\n0,80 (0) → (1/6 ; 0,5)\n0,71 (1) → (1/6 ; 0,75)\n0,62 (0) → (2/6 ; 0,75)\n0,55 (0) → (3/6 ; 0,75)\n0,47 (1) → (3/6 ; 1)\n0,33 (0) → (4/6 ; 1)\n0,21 (0) → (5/6 ; 1)\n0,10 (0) → (1 ; 1)</div>AUC = somme des rectangles sous chaque pas horizontal (largeur 1/6, hauteur = TPR atteint) :<div class=\"f\">AUC = (0,5 + 0,75 + 0,75 + 1 + 1 + 1) / 6 = 5/6 ≈ 0,833</div>Vérification : sur les 4 × 6 = 24 paires (positif, négatif), 20 sont bien ordonnées (positif mieux noté), et 20/24 = 5/6. Le point de la question (a) est bien sur la courbe."
     },
     {
      "q": "On veut détecter toutes les fraudes de cet échantillon (sensibilité = 1) en faisant le moins de fausses alertes possible. Quel seuil choisir ? Quelle spécificité obtient-on ? Pourquoi un seuil inférieur à 0,5 peut-il se justifier ici ?",
      "a": "Le positif le moins bien noté a le score 0,47. Le plus grand seuil qui le détecte est <b>s = 0,47</b> (tout s ∈ ]0,33 ; 0,47] convient). On prédit alors 7 positifs : TP = 4, FP = 3, TN = 3 → sensibilité = 1, <b>spécificité = 3/6 = 0,5</b> (point (0,5 ; 1) de la courbe).<br>Un seuil s &lt; 0,5 revient à accepter de déclarer une fraude avec un niveau de confiance plus faible. C'est justifié quand rater un positif coûte beaucoup plus cher qu'une fausse alerte, ce qui est le cas pour une fraude."
     }
    ]
   },
   {
    "t": "Exercice 2 (6 pts) : arbre CART",
    "intro": "",
    "qs": [
     {
      "q": "On veut prédire si un client résilie son abonnement (classe 1) ou non (classe 0). Le nœud racine R contient 40 clients : 30 de classe 0 et 10 de classe 1. Calculer l'indice de Gini, l'entropie (log₂) et l'erreur de classification de R.",
      "a": "p₀ = 30/40 = 0,75 ; p₁ = 10/40 = 0,25.<div class=\"f\">Gini     I(R) = 1 − 0,75² − 0,25² = 1 − 0,5625 − 0,0625 = 0,375\nEntropie I(R) = −0,75 log₂ 0,75 − 0,25 log₂ 0,25 ≈ 0,311 + 0,5 = 0,811\nErreur   I(R) = 1 − max p_k = 1 − 0,75 = 0,25</div>"
     },
     {
      "q": "Deux coupures sont candidates (effectifs [classe 0, classe 1]) :<ul><li>coupure 1, x¹ = ancienneté &lt; 5 ans : R_l = [20, 2], R_m = [10, 8] ;</li><li>coupure 2, x² = nombre de réclamations &lt; 3 : R_l = [28, 4], R_m = [2, 6].</li></ul>Calculer le gain d'information IG = I(R) − n_l/n·I(R_l) − n_m/n·I(R_m) de chaque coupure avec l'indice de Gini. Laquelle CART retient-il ?",
      "a": "<b>Coupure 1</b> (n_l = 22, n_m = 18) :<div class=\"f\">I(R_l) = 1 − (20/22)² − (2/22)²  ≈ 0,165\nI(R_m) = 1 − (10/18)² − (8/18)²  ≈ 0,494\nIG₁ = 0,375 − 22/40 × 0,165 − 18/40 × 0,494 ≈ 0,375 − 0,091 − 0,222 ≈ 0,062</div><b>Coupure 2</b> (n_l = 32, n_m = 8) :<div class=\"f\">I(R_l) = 1 − (28/32)² − (4/32)²  ≈ 0,219\nI(R_m) = 1 − (2/8)² − (6/8)²     = 0,375\nIG₂ = 0,375 − 32/40 × 0,219 − 8/40 × 0,375 = 0,375 − 0,175 − 0,075 = 0,125</div>IG₂ &gt; IG₁ : CART retient la <b>coupure 2</b> (nombre de réclamations &lt; 3). Elle crée un enfant R_l presque pur en classe 0 et un enfant R_m majoritairement de classe 1."
     },
     {
      "q": "Refaire la comparaison avec l'entropie, puis avec l'erreur de classification. Commenter le gain de la coupure 1 avec l'erreur de classification.",
      "a": "<b>Entropie</b> : I(R) ≈ 0,811.<div class=\"f\">Coupure 1 : I(R_l) ≈ 0,439 ; I(R_m) ≈ 0,991 → IG₁ ≈ 0,811 − 0,55×0,439 − 0,45×0,991 ≈ 0,124\nCoupure 2 : I(R_l) ≈ 0,544 ; I(R_m) ≈ 0,811 → IG₂ ≈ 0,811 − 0,8×0,544 − 0,2×0,811 ≈ 0,214</div>Même choix : coupure 2.<br><b>Erreur de classification</b> : I(R) = 0,25.<div class=\"f\">Coupure 1 : I(R_l) = 2/22 ≈ 0,091 ; I(R_m) = 8/18 ≈ 0,444 → IG₁ = 0,25 − 2/40 − 8/40 = 0\nCoupure 2 : I(R_l) = 4/32 = 0,125 ; I(R_m) = 2/8 = 0,25    → IG₂ = 0,25 − 4/40 − 2/40 = 0,1</div>Avec l'erreur, la coupure 1 a un <b>gain nul</b> : ses deux enfants restent majoritairement de classe 0, donc on fait exactement les mêmes 10 erreurs qu'avant. Pourtant R_l = [20, 2] est bien plus pur que R. Gini et l'entropie tiennent compte de toute la répartition des classes, pas seulement de la classe majoritaire : ils détectent cette amélioration."
     },
     {
      "q": "On garde la coupure 2 (arbre à 2 feuilles). Quelle est l'erreur d'apprentissage de cet arbre ? et celle de l'arbre à une seule feuille (|T| = 1) ? Quel score l'arbre attribue-t-il à un nouveau client ayant 4 réclamations (utile pour une courbe ROC) ?",
      "a": "Feuille R_l = [28, 4] : on prédit 0, 4 erreurs. Feuille R_m = [2, 6] : on prédit 1, 2 erreurs. Erreur d'apprentissage = 6/40 = <b>0,15</b>.<br>|T| = 1 : on prédit la classe majoritaire 0 pour tous → 10 erreurs → <b>0,25</b>.<br>Un client avec 4 réclamations tombe dans R_m (4 ≥ 3). Son score est la proportion de clients de classe 1 dans cette feuille : <b>6/8 = 0,75</b>. Il est prédit « résilie » au seuil 0,5. (Un client avec 1 réclamation aurait le score 4/32 = 0,125.)"
     },
     {
      "q": "Pour élaguer l'arbre maximal, on compare trois sous-arbres :<div class=\"scroll\"><table class=\"t\"><tr><th></th><th>|T|</th><th>Σ n_l·I(R_l)</th></tr><tr><th>T_a</th><td>2</td><td>12,4</td></tr><tr><th>T_b</th><td>5</td><td>6,1</td></tr><tr><th>T_c</th><td>9</td><td>2,5</td></tr></table></div>Rappel : C_λ(T) = Σ_{l=1}^{|T|} n_l·I(R_l) + λ|T|. Quel sous-arbre est choisi pour λ = 0,5 ? λ = 1,5 ? λ = 4 ? Pour quelles valeurs de λ chaque arbre est-il choisi ? Commenter en termes de biais et de variance.",
      "a": "<div class=\"f\">           T_a                 T_b                 T_c\nλ = 0,5    12,4 + 1  = 13,4    6,1 + 2,5  = 8,6    2,5 + 4,5  = 7,0   → T_c\nλ = 1,5    12,4 + 3  = 15,4    6,1 + 7,5  = 13,6   2,5 + 13,5 = 16,0  → T_b\nλ = 4      12,4 + 8  = 20,4    6,1 + 20   = 26,1   2,5 + 36   = 38,5  → T_a</div>Seuils : T_b et T_c sont à égalité quand 6,1 + 5λ = 2,5 + 9λ, soit <b>λ = 0,9</b>. T_a et T_b sont à égalité quand 12,4 + 2λ = 6,1 + 5λ, soit <b>λ = 2,1</b>. (T_a et T_c sont à égalité pour λ = 9,9/7 ≈ 1,41, mais T_b y est moins coûteux.) Donc T_c pour λ &lt; 0,9, T_b pour 0,9 &lt; λ &lt; 2,1, T_a pour λ &gt; 2,1.<br>Plus λ augmente, plus chaque feuille coûte cher et plus l'arbre retenu est petit : modèle plus simple, <b>biais ↑ et variance ↓</b>. En pratique, λ est choisi sur un échantillon de validation."
     }
    ]
   },
   {
    "t": "Exercice 3 (7 pts) : clustering",
    "intro": "",
    "qs": [
     {
      "q": "La matrice des distances entre 5 points est :<div class=\"scroll\"><table class=\"t\"><tr><th></th><th>x1</th><th>x2</th><th>x3</th><th>x4</th><th>x5</th></tr><tr><th>x1</th><td>0</td><td></td><td></td><td></td><td></td></tr><tr><th>x2</th><td>14</td><td>0</td><td></td><td></td><td></td></tr><tr><th>x3</th><td>31</td><td>27</td><td>0</td><td></td><td></td></tr><tr><th>x4</th><td>9</td><td>30</td><td>40</td><td>0</td><td></td></tr><tr><th>x5</th><td>35</td><td>18</td><td>12</td><td>37</td><td>0</td></tr></table></div>Appliquer la CAH avec le lien simple puis avec le lien complet. Donner l'ordre et la hauteur des fusions, et décrire les dendrogrammes.",
      "a": "<b>Lien simple</b> (d(C_k,C_l) = min) :<ul><li>Plus petite distance : d14 = 9 → fusion {x1,x4} à <b>9</b>.</li><li>Nouvelles distances : d({x1,x4},x2) = min(14,30) = 14 ; d({x1,x4},x3) = min(31,40) = 31 ; d({x1,x4},x5) = min(35,37) = 35. Plus petite : d35 = 12 → {x3,x5} à <b>12</b>.</li><li>d({x1,x4},x2) = 14 ; d({x1,x4},{x3,x5}) = min(31,35,40,37) = 31 ; d(x2,{x3,x5}) = min(27,18) = 18. → {x1,x2,x4} à <b>14</b>.</li><li>Dernière fusion : d({x1,x2,x4},{x3,x5}) = min(31,35,27,18,40,37) = 18 → à <b>18</b>.</li></ul><b>Lien complet</b> (d(C_k,C_l) = max) :<ul><li>{x1,x4} à <b>9</b>.</li><li>d({x1,x4},x2) = max(14,30) = 30 ; d({x1,x4},x3) = 40 ; d({x1,x4},x5) = 37 ; d23 = 27 ; d25 = 18 ; d35 = 12 → {x3,x5} à <b>12</b>.</li><li>d({x1,x4},x2) = 30 ; d({x1,x4},{x3,x5}) = 40 ; d(x2,{x3,x5}) = max(27,18) = 27 → {x2,x3,x5} à <b>27</b>.</li><li>Dernière fusion : max de toutes les distances entre {x1,x4} et {x2,x3,x5} = 40 → à <b>40</b>.</li></ul><div class=\"f\">Simple  : ((x1,x4)₉ , x2)₁₄  et (x3,x5)₁₂  réunis à 18\nComplet : (x1,x4)₉  et ((x3,x5)₁₂ , x2)₂₇  réunis à 40</div>Vérifie avec l'outil CAH (exemple « Sujet blanc 1 »)."
     },
     {
      "q": "Donner la partition en 3 clusters puis en 2 clusters obtenue avec chaque lien. Pourquoi x2 n'est-il pas rattaché au même groupe ?",
      "a": "<b>3 clusters</b> : les deux premières fusions sont identiques, donc {x1,x4}, {x3,x5}, {x2} dans les deux cas.<br><b>2 clusters</b> : lien simple → {x1,x2,x4} / {x3,x5} ; lien complet → {x1,x4} / {x2,x3,x5}.<br>Le lien simple rattache x2 au groupe qui contient son plus proche voisin (x1, à 14). Le lien complet regarde le point le plus éloigné : x2 est à 30 de x4 mais seulement à 27 de x3, donc il rejoint {x3,x5}. Le lien simple suit les points proches de proche en proche ; le lien complet évite de mettre dans un même cluster des points trop éloignés."
     },
     {
      "q": "On évalue une partition en 3 clusters. Un point x appartient à C₁ = {x, p₂, p₃, p₄} avec d(x,p₂) = 2, d(x,p₃) = 3, d(x,p₄) = 4. Ses distances aux points de C₂ = {q₁, q₂} sont 5 et 7, et aux points de C₃ = {r₁, r₂, r₃} sont 2,5 ; 3,5 et 4,5. Calculer a(x), b(x) et s(x). Un autre point y a a(y) = 4 et b(y) = 2,5 : calculer s(y) et interpréter.",
      "a": "<div class=\"f\">a(x) = (2 + 3 + 4)/3 = 3                     (moyenne sur son cluster, x exclu)\nmoyenne vers C₂ = (5 + 7)/2 = 6\nmoyenne vers C₃ = (2,5 + 3,5 + 4,5)/3 = 3,5\nb(x) = min(6 ; 3,5) = 3,5\ns(x) = (3,5 − 3)/max(3 ; 3,5) = 0,5/3,5 ≈ 0,143</div>s(x) &gt; 0 mais proche de 0 : x est un peu plus proche de son cluster que de C₃, il est à la frontière entre C₁ et C₃.<br>s(y) = (2,5 − 4)/4 = <b>−0,375</b> &lt; 0 : y est en moyenne plus proche des points d'un autre cluster que de ceux du sien, il est probablement mal assigné."
     },
     {
      "q": "On applique l'algorithme de Lloyd (K = 2) aux 7 points de ℝ : 1, 2, 4, 7, 9, 10, 15, avec les centroïdes initiaux μ₁ = 1 et μ₂ = 4. Dérouler l'algorithme jusqu'à convergence en donnant l'inertie intra-classes I_W après chaque mise à jour des centroïdes.",
      "a": "<b>Itération 1</b> — affectation : 1 et 2 vont à μ₁ = 1 (2 est à distance 1 de μ₁, 2 de μ₂) ; 4, 7, 9, 10, 15 vont à μ₂ = 4.<br>Mise à jour : μ₁ = (1+2)/2 = 1,5 ; μ₂ = (4+7+9+10+15)/5 = 9.<div class=\"f\">I_W = 0,25 + 0,25 + (25 + 4 + 0 + 1 + 36) = 0,5 + 66 = 66,5</div><b>Itération 2</b> — affectation : 4 est à 2,5 de μ₁ et à 5 de μ₂ → passe dans le cluster 1 ; 7 est à 5,5 de μ₁ et à 2 de μ₂ → reste dans le cluster 2. Clusters {1, 2, 4} et {7, 9, 10, 15}.<br>Mise à jour : μ₁ = 7/3 ≈ 2,333 ; μ₂ = 41/4 = 10,25.<div class=\"f\">I_W = [(1−7/3)² + (2−7/3)² + (4−7/3)²] + [3,25² + 1,25² + 0,25² + 4,75²]\n    = 42/9 + 34,75 ≈ 4,667 + 34,75 ≈ 39,417</div><b>Itération 3</b> — affectation : 4 est à 1,667 de μ₁ et à 6,25 de μ₂ ; 7 est à 4,667 de μ₁ et à 3,25 de μ₂. Les affectations ne changent plus : <b>convergence</b>. Partition finale {1, 2, 4} / {7, 9, 10, 15}. I_W a bien diminué à chaque itération (66,5 → 39,417)."
     },
     {
      "q": "Calculer l'inertie totale I et l'inertie inter-classes I_B de la partition finale. Vérifier que I = I_W + I_B.",
      "a": "Moyenne globale : μ = 48/7 ≈ 6,857.<div class=\"f\">I   = Σ (xᵢ − μ)² ≈ 146,857\nI_B = 3 × (7/3 − 48/7)² + 4 × (10,25 − 48/7)²\n    ≈ 3 × 20,465 + 4 × 11,512 ≈ 61,395 + 46,046 ≈ 107,440\nI_W + I_B ≈ 39,417 + 107,440 = 146,857 = I</div>I ne dépend pas de la partition : minimiser I_W revient à maximiser I_B."
     },
     {
      "q": "On relance l'algorithme avec μ₁ = 10 et μ₂ = 15. Quelle partition obtient-on ? Que montre cet exemple et comment s'en prémunir ?",
      "a": "Itération 1 : 1, 2, 4, 7, 9, 10 sont plus proches de 10 que de 15 ; 15 reste seul. μ₁ = 33/6 = 5,5 ; μ₂ = 15.<br>Itération 2 : 10 est à 4,5 de μ₁ et à 5 de μ₂ → reste dans le cluster 1. Rien ne change : convergence vers {1, 2, 4, 7, 9, 10} / {15}.<div class=\"f\">I_W = 4,5² + 3,5² + 1,5² + 1,5² + 3,5² + 4,5² + 0 = 69,5 &gt; 39,417</div>L'algorithme de Lloyd converge vers un <b>minimum local</b> qui dépend de l'initialisation. Ici, on obtient une partition moins bonne (et 15 se retrouve seul, comme une valeur aberrante). Remède : relancer l'algorithme avec plusieurs initialisations aléatoires et garder la partition de plus petite I_W, ou initialiser avec K-means++ (centroïdes initiaux dispersés)."
     }
    ]
   }
  ]
 },
 {
  "id": "blanc2",
  "title": "Sujet blanc 2 (entraînement)",
  "head": "",
  "exos": [
   {
    "t": "Exercice 1 (6 pts) : KNN et métriques multiclasse",
    "intro": "",
    "qs": [
     {
      "q": "On dispose de 7 données d'apprentissage dans ℝ avec deux classes A et B :<div class=\"scroll\"><table class=\"t\"><tr><th>xᵢ</th><td>1</td><td>2,2</td><td>3</td><td>5</td><td>6</td><td>8</td><td>9</td></tr><tr><th>yᵢ</th><td>A</td><td>A</td><td>A</td><td>B</td><td>A</td><td>B</td><td>B</td></tr></table></div>Prédire l'étiquette du point x = 5,7 avec un KNN (distance |x − xᵢ|) pour K = 1, 3, 5 et 7. Que remarque-t-on pour K = 7 ?",
      "a": "Distances à x = 5,7, triées :<div class=\"f\">xᵢ = 6 (A) : 0,3     xᵢ = 5 (B) : 0,7     xᵢ = 8 (B) : 2,3     xᵢ = 3 (A) : 2,7\nxᵢ = 9 (B) : 3,3     xᵢ = 2,2 (A) : 3,5   xᵢ = 1 (A) : 4,7</div><ul><li>K = 1 : voisin 6 (A) → <b>A</b>.</li><li>K = 3 : A, B, B → <b>B</b>.</li><li>K = 5 : A, B, B, A, B → 3 B contre 2 A → <b>B</b>.</li><li>K = 7 : tous les points, 4 A contre 3 B → <b>A</b>.</li></ul>Avec K = 7 = n, tous les points sont voisins : on prédit toujours la classe majoritaire de l'apprentissage (A), quel que soit x. C'est du sous-apprentissage."
     },
     {
      "q": "Calculer l'erreur d'apprentissage du 1-NN, puis son erreur en leave-one-out (chaque point est prédit par son plus proche voisin parmi les 6 autres). Expliquer la différence.",
      "a": "<b>Erreur d'apprentissage</b> : chaque point est son propre plus proche voisin → <b>0</b>.<br><b>Leave-one-out</b> : on retire chaque point tour à tour.<div class=\"f\">1   (A) → voisin 2,2 (A)  ok\n2,2 (A) → voisin 3   (A)  ok     (distance 0,8)\n3   (A) → voisin 2,2 (A)  ok\n5   (B) → voisin 6   (A)  erreur  (distance 1 contre 2 pour 3)\n6   (A) → voisin 5   (B)  erreur  (distance 1 contre 2 pour 8)\n8   (B) → voisin 9   (B)  ok\n9   (B) → voisin 8   (B)  ok</div>Erreur LOO = <b>2/7 ≈ 0,286</b>. L'erreur d'apprentissage est trompeuse : le 1-NN a été évalué sur les données qui ont servi à le construire. Le leave-one-out estime l'erreur sur des points qui n'ont pas servi à la prédiction : il mesure la capacité de généralisation. Avec n = 7, il demande 7 apprentissages par valeur de K."
     },
     {
      "q": "Comment évoluent le biais et la variance du KNN quand K augmente ? Quelle procédure utiliser pour choisir K ?",
      "a": "K ↑ : la prédiction est une moyenne sur plus de voisins, donc plus lisse et moins sensible au bruit → <b>variance ↓, biais ↑</b>. K ↓ : l'inverse (K = 1 colle à chaque point, sur-apprentissage).<br>On choisit K par <b>validation croisée</b> (K-fold ou leave-one-out) sur les données d'apprentissage : pour chaque K candidat, erreur moyenne sur les plis ; on garde le K de plus petite erreur moyenne, on réentraîne sur tout l'apprentissage et on évalue le modèle final sur un jeu de test."
     },
     {
      "q": "Un classifieur à 3 classes donne, sur 90 observations de validation, la matrice suivante (lignes = classe prédite, colonnes = classe réelle) :<div class=\"scroll\"><table class=\"t\"><tr><th>prédit \\ réel</th><th>1</th><th>2</th><th>3</th></tr><tr><th>1</th><td>40</td><td>5</td><td>3</td></tr><tr><th>2</th><td>6</td><td>20</td><td>4</td></tr><tr><th>3</th><td>2</td><td>3</td><td>7</td></tr></table></div>Calculer l'accuracy, la précision et la sensibilité de chaque classe (stratégie one-versus-all), puis la précision et la sensibilité en macro-average, et la précision en micro-average.",
      "a": "Effectifs réels (colonnes) : 48, 28, 14. Effectifs prédits (lignes) : 48, 30, 12.<div class=\"f\">Accuracy = (40 + 20 + 7)/90 = 67/90 ≈ 0,744\n\n           précision = M[k,k]/ligne k     sensibilité = M[k,k]/colonne k\nclasse 1   40/48 ≈ 0,833                  40/48 ≈ 0,833\nclasse 2   20/30 ≈ 0,667                  20/28 ≈ 0,714\nclasse 3    7/12 ≈ 0,583                   7/14 = 0,5\n\nPrécision macro   = (0,833 + 0,667 + 0,583)/3 ≈ 0,694\nSensibilité macro = (0,833 + 0,714 + 0,5)/3   ≈ 0,683\nPrécision micro   = ΣTP / Σ(TP+FP) = 67/90 ≈ 0,744 = accuracy</div>Le macro-average est plus bas que le micro-average : la petite classe 3 est la moins bien traitée (la moitié de ses observations est ratée), et le macro-average lui donne autant de poids qu'aux autres."
     },
     {
      "q": "On veut traiter ce problème à 3 classes avec une régression logistique. Combien de classifieurs faut-il entraîner en one-versus-all et en one-versus-one ? Et avec 10 classes ? Quelles données chacun utilise-t-il ?",
      "a": "C = 3 : OvA → 3 classifieurs ; OvO → 3·2/2 = 3 classifieurs (même nombre, cas particulier). C = 10 : OvA → <b>10</b> ; OvO → 10·9/2 = <b>45</b>.<br>OvA : chaque classifieur utilise <b>toutes</b> les données (classe k = positifs, le reste = négatifs) ; on prédit la classe de score σ(⟨ŵ_k,x⟩ + b̂_k) maximal. OvO : chaque classifieur n'utilise que les données des <b>deux classes</b> de sa paire ; on prédit la classe la plus souvent choisie (vote)."
     }
    ]
   },
   {
    "t": "Exercice 2 (7 pts) : régression logistique et SVM",
    "intro": "",
    "qs": [
     {
      "q": "Une régression logistique (𝒴 = {−1, 1}) a appris ŵ = (1,2 ; −0,8) et b̂ = −0,5. Calculer P̂(Y = 1 | x) = σ(⟨ŵ,x⟩ + b̂) pour x_a = (2, 1), x_b = (0,5 ; 1) et x_c = (1 ; 0,5). Donner les prédictions avec le seuil s = 0,5 puis s = 0,3.",
      "a": "<div class=\"f\">x_a : z = 1,2×2 − 0,8×1 − 0,5   = 1,1   → σ(1,1)  = 1/(1+e^{−1,1}) ≈ 0,750\nx_b : z = 1,2×0,5 − 0,8×1 − 0,5 = −0,7  → σ(−0,7) ≈ 0,332\nx_c : z = 1,2×1 − 0,8×0,5 − 0,5 = 0,3   → σ(0,3)  ≈ 0,574</div>s = 0,5 : x_a → 1, x_b → −1, x_c → 1.<br>s = 0,3 : x_a → 1, <b>x_b → 1</b> (0,332 ≥ 0,3), x_c → 1. Abaisser le seuil augmente le nombre de prédictions positives : sensibilité ↑, spécificité ↓."
     },
     {
      "q": "Donner l'équation de la frontière de décision pour s = 0,5 puis pour s = 0,3 (sous la forme x₂ = a·x₁ + c). La régression logistique est-elle un classifieur linéaire quel que soit le seuil ?",
      "a": "σ(z) ≥ s ⇔ z ≥ ln(s/(1−s)) car σ est croissante.<br><b>s = 0,5</b> : ln 1 = 0, frontière 1,2x₁ − 0,8x₂ − 0,5 = 0, soit <b>x₂ = 1,5x₁ − 0,625</b> (pente −w₁/w₂ = 1,5, ordonnée −b/w₂ = −0,625).<br><b>s = 0,3</b> : ln(0,3/0,7) ≈ −0,847, frontière 1,2x₁ − 0,8x₂ − 0,5 = −0,847, soit 1,2x₁ − 0,8x₂ + 0,347 = 0, donc <b>x₂ ≈ 1,5x₁ + 0,434</b>.<br>Les deux frontières sont des droites parallèles : quel que soit le seuil, la frontière est un hyperplan ⟨ŵ,x⟩ + b̂ = ln(s/(1−s)). La régression logistique est bien un classifieur linéaire."
     },
     {
      "q": "Une SVM à marge souple a appris ŵ = (3, 4) et b̂ = −12 (valeurs fictives choisies pour l'exercice ; on étudie seulement la position des points). Calculer la marge. Pour chacun des points suivants, calculer yᵢ(⟨ŵ,xᵢ⟩ + b̂), la valeur de ξᵢ, et dire où se trouve le point :<div class=\"scroll\"><table class=\"t\"><tr><th>point</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th></tr><tr><th>xᵢ</th><td>(1 ; 2,5)</td><td>(4 ; 1)</td><td>(2 ; 1,5)</td><td>(2 ; 1,4)</td><td>(3 ; 1)</td><td>(1 ; 1)</td></tr><tr><th>yᵢ</th><td>+1</td><td>+1</td><td>+1</td><td>−1</td><td>−1</td><td>−1</td></tr></table></div>",
      "a": "‖ŵ‖ = √(9 + 16) = 5 → <b>marge = 1/‖ŵ‖ = 0,2</b> ; la zone d'indécision entre H⁺ et H⁻ a une largeur 2/‖ŵ‖ = 0,4.<br>Pour (ŵ, b̂) fixés, la plus petite valeur admissible est ξᵢ = max(0, 1 − yᵢ(⟨ŵ,xᵢ⟩ + b̂)).<div class=\"f\">pt  ⟨ŵ,x⟩+b̂            yᵢ(…)   ξᵢ    position\nA   3 + 10 − 12 = 1      1      0     sur H⁺ : vecteur de support\nB   12 + 4 − 12 = 4      4      0     bien classé, hors de la marge\nC   6 + 6 − 12 = 0       0      1     sur l'hyperplan séparateur H\nD   6 + 5,6 − 12 = −0,4  0,4    0,6   bien classé, dans la zone d'indécision\nE   9 + 4 − 12 = 1      −1      2     mal classé (ξ &gt; 1)\nF   3 + 4 − 12 = −5      5      0     bien classé, hors de la marge</div>Distance d'un point à H : |⟨ŵ,x⟩ + b̂|/‖ŵ‖, par exemple 4/5 = 0,8 pour B et 0,2 pour A (= la marge)."
     },
     {
      "q": "Calculer Σξᵢ puis la valeur de la fonction objectif ½‖w‖² + CΣξᵢ en (ŵ, b̂) pour C = 1 et pour C = 10. Quels points interviennent dans le classifieur sign(Σ α̂ᵢyᵢ⟨xᵢ,x⟩ + b̂) ? Que se passerait-il si on réentraînait avec un C beaucoup plus grand ?",
      "a": "Σξᵢ = 0 + 0 + 1 + 0,6 + 2 + 0 = <b>3,6</b>. ½‖ŵ‖² = 12,5.<div class=\"f\">C = 1  : 12,5 + 1 × 3,6  = 16,1\nC = 10 : 12,5 + 10 × 3,6 = 48,5</div>Avec C = 10, les violations de marge pèsent beaucoup plus que le terme de marge.<br>Si (ŵ, b̂) était la solution du problème (ce n'est pas le cas avec ces valeurs fictives), l'écart complémentaire (KKT) donnerait : α̂ᵢ[yᵢ(⟨ŵ,xᵢ⟩+b̂) − 1 + ξᵢ] = 0 : les points B et F (yᵢ(…) &gt; 1) ont <b>α̂ᵢ = 0</b> et n'interviennent pas. Seuls peuvent avoir α̂ᵢ &gt; 0 : le vecteur de support A (sur H⁺) et les outliers C, D, E (ξᵢ &gt; 0), qui auraient α̂ᵢ = C.<br>Avec C beaucoup plus grand, on préfère minimiser le nombre d'outliers : la marge se resserre, moins de points dans la zone d'indécision, <b>biais ↓, variance ↑</b>. C → ∞ redonne la SVM à marge rigide, qui existe ici : les 6 points sont linéairement séparables (par exemple par la droite x₁ + 4x₂ = 7,8)."
     },
     {
      "q": "Soient x = (1, 2) et x' = (3, −1). Calculer les noyaux linéaire, quadratique (⟨x,x'⟩ + 1)², cosinus et gaussien exp(−γ‖x − x'‖²) pour γ = 0,1 et γ = 2. Commenter. Vérifier que (⟨x,x'⟩ + 1)² = ⟨φ(x), φ(x')⟩ avec φ(z) = (1, √2 z₁, √2 z₂, z₁², z₂², √2 z₁z₂).",
      "a": "<div class=\"f\">⟨x,x'⟩ = 1×3 + 2×(−1) = 1                        linéaire  : 1\n(⟨x,x'⟩ + 1)² = 2² = 4                             quadratique : 4\n‖x‖ = √5, ‖x'‖ = √10 → 1/√50 ≈ 0,141               cosinus   : 0,141\n‖x − x'‖² = (−2)² + 3² = 13\nγ = 0,1 : exp(−1,3) ≈ 0,273\nγ = 2   : exp(−26)  ≈ 5·10⁻¹²</div>Avec γ = 2, deux points à distance √13 ≈ 3,6 ont une similarité quasi nulle : chaque point n'influence que son voisinage immédiat. C'est ce qui produit des frontières en « îlots » et du sur-apprentissage quand γ est grand.<br><b>Vérification</b> : φ(x) = (1, √2, 2√2, 1, 4, 2√2) et φ(x') = (1, 3√2, −√2, 9, 1, −3√2).<div class=\"f\">⟨φ(x),φ(x')⟩ = 1 + 6 − 4 + 9 + 4 − 12 = 4 = (⟨x,x'⟩ + 1)²</div>Le noyau se calcule en O(d) alors que φ vit en dimension 6 (O(d²) en général) : c'est l'intérêt de l'astuce du noyau, utilisée dans le problème dual."
     }
    ]
   },
   {
    "t": "Exercice 3 (7 pts) : CAH, K-means et critères de qualité",
    "intro": "",
    "qs": [
     {
      "q": "La matrice des distances entre 5 points est :<div class=\"scroll\"><table class=\"t\"><tr><th></th><th>x1</th><th>x2</th><th>x3</th><th>x4</th><th>x5</th></tr><tr><th>x1</th><td>0</td><td></td><td></td><td></td><td></td></tr><tr><th>x2</th><td>21</td><td>0</td><td></td><td></td><td></td></tr><tr><th>x3</th><td>6</td><td>24</td><td>0</td><td></td><td></td></tr><tr><th>x4</th><td>29</td><td>11</td><td>26</td><td>0</td><td></td></tr><tr><th>x5</th><td>16</td><td>33</td><td>19</td><td>14</td><td>0</td></tr></table></div>Appliquer la CAH avec le lien simple puis avec le lien complet (fusions et hauteurs), et donner la partition en 2 clusters dans chaque cas.",
      "a": "<b>Lien simple</b> :<ul><li>d13 = 6 → {x1,x3} à <b>6</b>.</li><li>d({x1,x3},x2) = min(21,24) = 21 ; d({x1,x3},x4) = min(29,26) = 26 ; d({x1,x3},x5) = min(16,19) = 16 ; d24 = 11 ; d25 = 33 ; d45 = 14 → {x2,x4} à <b>11</b>.</li><li>d({x1,x3},{x2,x4}) = min(21,29,24,26) = 21 ; d({x1,x3},x5) = 16 ; d({x2,x4},x5) = min(33,14) = 14 → {x2,x4,x5} à <b>14</b>.</li><li>d({x1,x3},{x2,x4,x5}) = min(21,29,16,24,26,19) = 16 → fusion finale à <b>16</b>.</li></ul><b>Lien complet</b> :<ul><li>{x1,x3} à <b>6</b>, puis {x2,x4} à <b>11</b> (d({x1,x3},x2) = 24, d({x1,x3},x4) = 29, d({x1,x3},x5) = 19 sont plus grands).</li><li>d({x1,x3},{x2,x4}) = max(21,29,24,26) = 29 ; d({x1,x3},x5) = max(16,19) = 19 ; d({x2,x4},x5) = max(33,14) = 33 → {x1,x3,x5} à <b>19</b>.</li><li>Fusion finale : max de toutes les distances entre {x1,x3,x5} et {x2,x4} = 33 → à <b>33</b>.</li></ul><b>2 clusters</b> : lien simple → {x1,x3} / {x2,x4,x5} ; lien complet → {x1,x3,x5} / {x2,x4}. x5 est proche de x4 (14) mais très loin de x2 (33) : le lien simple le rattache à x4, le lien complet refuse de le mettre avec x2. Vérifie avec l'outil CAH (exemple « Sujet blanc 2 »)."
     },
     {
      "q": "On applique l'algorithme de Lloyd (K = 2, distance euclidienne) aux points P1 = (0 ; 0), P2 = (1 ; 0), P3 = (0 ; 2), P4 = (5 ; 4), P5 = (6 ; 4), P6 = (5 ; 6), avec μ₁ = P1 et μ₂ = P3 comme centroïdes initiaux. Dérouler l'algorithme jusqu'à convergence et donner I_W après chaque mise à jour des centroïdes.",
      "a": "On compare les distances au carré.<br><b>Itération 1</b> — P2 : 1 (μ₁) contre 5 (μ₂) → 1. P4 : 41 contre 29 → 2. P5 : 52 contre 40 → 2. P6 : 61 contre 41 → 2. Clusters {P1,P2} et {P3,P4,P5,P6}.<br>Mise à jour : μ₁ = (0,5 ; 0) ; μ₂ = ((0+5+6+5)/4 ; (2+4+4+6)/4) = (4 ; 4).<div class=\"f\">I_W = (0,25 + 0,25) + (20 + 1 + 4 + 5) = 0,5 + 30 = 30,5</div><b>Itération 2</b> — P3 : ‖P3 − μ₁‖² = 0,25 + 4 = 4,25 contre ‖P3 − μ₂‖² = 16 + 4 = 20 → passe dans le cluster 1. P4, P5, P6 restent avec μ₂. Clusters {P1,P2,P3} et {P4,P5,P6}.<br>Mise à jour : μ₁ = (1/3 ; 2/3) ; μ₂ = (16/3 ; 14/3).<div class=\"f\">I_W = (5/9 + 8/9 + 17/9) + (5/9 + 8/9 + 17/9) = 30/9 + 30/9 ≈ 6,667</div><b>Itération 3</b> — plus aucun changement d'affectation : <b>convergence</b>. Partition {P1,P2,P3} / {P4,P5,P6}."
     },
     {
      "q": "Calculer l'inertie totale I et l'inertie inter-classes I_B de la partition finale. Calculer la distance de Ward entre les deux clusters finaux et expliquer pourquoi elle est égale à I_B ici.",
      "a": "Moyenne globale : μ = (17/6 ; 16/6) ≈ (2,833 ; 2,667).<div class=\"f\">I   = Σ‖Pᵢ − μ‖² ≈ 68,167\nI_B = 3‖μ₁ − μ‖² + 3‖μ₂ − μ‖² = 3 × 10,25 + 3 × 10,25 = 61,5\nI_W + I_B = 6,667 + 61,5 = 68,167 = I\n\nWard(C₁,C₂) = |C₁||C₂|/(|C₁|+|C₂|) × ‖μ₁ − μ₂‖²\n            = 9/6 × ((−5)² + (−4)²) = 1,5 × 41 = 61,5</div>La distance de Ward est la hausse d'inertie intra-classes due à la fusion. Fusionner les 2 clusters donne un seul cluster, dont l'inertie intra vaut I. La hausse vaut donc I − I_W = I_B = 61,5."
     },
     {
      "q": "Calculer l'homogénéité T_k de chaque cluster final (distance euclidienne moyenne au centroïde), la séparabilité S₁₂ et l'indice de Davies-Bouldin global. Comment utiliser cet indice pour choisir K ?",
      "a": "<div class=\"f\">C₁, μ₁ = (1/3 ; 2/3) : d(P1) ≈ 0,745 ; d(P2) ≈ 0,943 ; d(P3) ≈ 1,374 → T₁ ≈ 1,021\nC₂, μ₂ = (16/3 ; 14/3) : d(P4) ≈ 0,745 ; d(P5) ≈ 0,943 ; d(P6) ≈ 1,374 → T₂ ≈ 1,021\nS₁₂ = d(μ₁,μ₂) = √(25 + 16) = √41 ≈ 6,403\nD₁ = D₂ = (T₁ + T₂)/S₁₂ ≈ 2,042/6,403 ≈ 0,319    → D ≈ 0,319</div>(C₂ est le translaté de C₁ par le vecteur (5, 4), d'où T₁ = T₂.) On calcule D pour plusieurs partitions (plusieurs K) et on garde celle qui <b>minimise</b> D : clusters homogènes (T petits) et bien séparés (S grand)."
     },
     {
      "q": "Calculer le coefficient de silhouette de P3 dans la partition finale. P3 est-il bien assigné ?",
      "a": "<div class=\"f\">a(P3) = (d(P3,P1) + d(P3,P2))/2 = (2 + √5)/2 ≈ (2 + 2,236)/2 ≈ 2,118\nb(P3) = (d(P3,P4) + d(P3,P5) + d(P3,P6))/3 = (√29 + √40 + √41)/3\n      ≈ (5,385 + 6,325 + 6,403)/3 ≈ 6,038\ns(P3) = (6,038 − 2,118)/6,038 ≈ 0,649</div>s(P3) &gt; 0 et assez proche de 1 : P3 est nettement plus proche de son cluster que de l'autre, il est bien assigné (même si c'est le point le moins central de C₁). Avec K = 2, b(P3) est simplement la distance moyenne à l'autre cluster."
     },
     {
      "q": "On veut compresser une image de 1 000 × 1 000 pixels en 16 couleurs. Combien de distances l'algorithme de Lloyd calcule-t-il à chaque itération ? Combien la CAH doit-elle en calculer au départ ? Conclure.",
      "a": "n = 10⁶ pixels (points de ℝ³ : R, G, B), K = 16.<br>Lloyd : K·n = 16 × 10⁶ = <b>1,6·10⁷ distances par itération</b> (chaque pixel vers chaque centroïde), soit un coût linéaire en n.<br>CAH : n(n−1)/2 = 10⁶ × (10⁶ − 1)/2 ≈ <b>5·10¹¹ distances</b> au départ, à stocker, puis des comparaisons entre toutes les paires de clusters à chaque étape : coût quadratique en n, infaisable en pratique.<br>On utilise donc le K-means : on remplace chaque pixel par la couleur de son centroïde, et l'image n'a plus que 16 couleurs."
     }
    ]
   }
  ]
 }
];
export const tps = [
 {
  "t": "TP1 — La main à la pâte avec les KNN",
  "d": "SynthDiabetes2 (mlbench) : prédire le diabète (variable diabetes, 9ᵉ colonne).",
  "fn": [
   "na.omit()",
   "createDataPartition(y, p=0.7)",
   "knn(train, test, cl, k)",
   "mean(y != pred)"
  ],
  "pts": [
   "Q3 : premier KNN avec K = 5, entraîné et évalué sur les mêmes 70 % des données. Métrique : le taux d'erreur mean(y != pred).",
   "Évaluer le modèle sur les données qui ont servi à l'entraîner donne un taux d'erreur trompeur : avec K = 1, il est nul.",
   "Courbe du taux d'erreur en fonction de K (1 à 100) : sur l'apprentissage, le meilleur K est 1.",
   "Sur les 30 % mis de côté, l'erreur du 1-NN n'est plus nulle : « les performances ont diminué lorsqu'on évalue le modèle sur un jeu de données qui n'a pas servi à le construire ».",
   "La courbe d'erreur sur ces données en fonction de K montre le compromis biais-variance."
  ]
 },
 {
  "t": "TP2 — Toujours plus de KNN",
  "d": "Iris (150 fleurs, 3 espèces), airquality (prédire le mois), données simulées à échelles différentes.",
  "fn": [
   "stdize : (x−min)/(max−min), ou scale()",
   "table(réel, prédit) : ici lignes = réel, ordre inverse de la convention du cours",
   "confusionMatrix() ; cm$byClass[, \"Pos Pred Value\"] (précision), [, \"Sensitivity\"] (rappel)",
   "trainControl(method=\"cv\", number=20)",
   "train(Month ~ ., method=\"knn\", tuneGrid=expand.grid(k=1:20), preProcess=c(\"center\",\"scale\"))",
   "plot(knnFit), knnFit$bestTune, predict(knnFit, newdata)"
  ],
  "pts": [
   "Iris : classification car 𝒴 est fini ; 3 classes ; versicolor et virginica sont les plus difficiles à séparer.",
   "Normaliser quand les variables ont des échelles très différentes (iris : échelles proches, on le fait quand même). La variable à grande échelle domine la distance.",
   "Accuracy ≠ précision : l'accuracy est le taux de bien classés (1 − taux d'erreur) ; la précision est TP/(TP+FP).",
   "1-NN évalué sur l'apprentissage : 100 %. K = taille de l'apprentissage : on prédit l'espèce majoritaire.",
   "Accuracy et F1 macro se comportent pareil car les classes sont équilibrées ; sinon le F1 macro pénaliserait les classes rares.",
   "Un seul découpage dépend du hasard : on répète 100 découpages aléatoires pour K = 1..10 (boxplot des erreurs). Différence avec la validation croisée : en CV, chaque observation est exactement une fois dans le jeu de validation.",
   "airquality : prédire Month (facteur). On retire Day ; les NA de Ozone et Solar.R sont remplacés par la moyenne du mois. Avec caret : CV 20-fold, k = 1..20, centrage-réduction. Puis découpage 75 % / 25 % et évaluation sur le test : mauvaises performances.",
   "Données simulées : x₁ est discriminant (moyennes 2 contre 8), x₂ ne l'est pas (bimodal 200/800 dans les deux classes) mais il est en centaines. Sans standardisation, la frontière du 5-NN dépend presque seulement de x₂ ; après scale(), elle sépare bien selon x₁."
  ]
 },
 {
  "t": "TP3 — La régression logistique",
  "d": "Prostate : 53 patients, prédire l'atteinte lymphatique (lymph : 20 atteints, 33 non).",
  "fn": [
   "glm(lymph ~ age + log(acid) + radio + gravite + taille, family=\"binomial\")",
   "summary() → tests de Wald (H0 : βⱼ = 0)",
   "table(), chisq.test()",
   "predict(fit, type=\"response\")",
   "prediction(), performance(pred,\"tpr\",\"fpr\") (ROCR)",
   "performance(pred,\"auc\")"
  ],
  "pts": [
   "Exploration : boxplots (variables quantitatives) et tests du χ² (qualitatives). acid est très dissymétrique → on utilise log(acid).",
   "Variables liées à lymph : log(acid), radio, taille ; pas gravite ; l'âge faiblement.",
   "summary(glm) : les tests de Wald retrouvent les liens vus en exploration. Piste d'amélioration : ajouter des interactions.",
   "Seuil α = 1/2 : 3/33 faux positifs et 6/20 faux négatifs. Donc TP = 14, TN = 30 : sensibilité 0,70, spécificité ≈ 0,91, accuracy ≈ 0,83.",
   "α = 0 → tout le monde est prédit positif. Quand α augmente, on prédit de plus en plus de 0 : des TP deviennent FN, des FP deviennent TN.",
   "AUC calculée sur l'apprentissage = trop optimiste. On compare les 31 sous-ensembles de variables par l'AUC sur un découpage 70/30 : meilleur modèle log(acid) + taille, puis log(acid) + radio + taille (les variables significatives au test de Wald)."
  ]
 },
 {
  "t": "TP4 — Les arbres de décision",
  "d": "Prostate de nouveau (53 observations).",
  "fn": [
   "rpart(lymph ~ ., data)",
   "printcp(), plotcp()",
   "cptable[which.min(cptable[,\"xerror\"]), \"CP\"]",
   "prune(tree, cp = bestcp)",
   "predict(type=\"class\" | \"prob\" | \"matrix\")",
   "rpart.plot()"
  ],
  "pts": [
   "Critère d'impureté par défaut de rpart : Gini.",
   "cp (complexity parameter) correspond au λ de l'élagage. rpart teste plusieurs cp en validation croisée (10-fold par défaut) : on garde celui qui minimise xerror. Ici, le cp optimal est déjà la valeur par défaut 0,01.",
   "Matrice de confusion : table(prédit, réel) ; TN=[1,1], FN=[1,2], FP=[2,1], TP=[2,2]. On en déduit accuracy, précision et rappel.",
   "Les performances sont calculées sur le jeu d'apprentissage : il faudrait un jeu de test, mais 53 observations c'est peu.",
   "Sur un nœud de rpart.plot, la correction lit : classe majoritaire ; « indice d'impureté » (en pratique la proportion de la classe 1 dans le nœud) ; % des individus dans le nœud."
  ]
 },
 {
  "t": "TP5 — Les SVM",
  "d": "Données simulées séparables, Khan (63 obs., 2308 gènes, 4 classes), données pour le noyau radial, OJ (ISLR2).",
  "fn": [
   "svm(y ~ ., kernel=\"linear\", cost=C, scale=FALSE)",
   "coef(svmfit) → b et w ; svmfit$rho (= −b), $coefs (αᵢyᵢ), $index (vecteurs de support)",
   "tune(svm, ..., ranges=list(cost=...))",
   "kernel=\"polynomial\", gamma=1, coef0=2, degree=2",
   "kernel=\"radial\", gamma",
   "train(method=\"svmPoly\" / \"svmRadial\"), createFolds(k=10)"
  ],
  "pts": [
   "Les données simulées sont linéairement séparables. C → +∞ : on retrouve la SVM à marge rigide.",
   "C testés : 0,001 ; 0,01 ; 1 ; 10. Quand C augmente, la marge 1/‖w‖ diminue et le nombre de mal classés aussi : c'est le compromis biais-variance.",
   "Sur l'apprentissage, C ≥ 0,01 donne une accuracy de 1 : à égalité, on prend le plus petit C (marge la plus large). La validation croisée (tune) choisit C = 0,01 ; un jeu de validation séparé choisit C = 0,001.",
   "Khan : on calcule φ(z) explicitement (degré 2, c = 2, avec combn) puis une SVM linéaire. C'est plus lent que le noyau polynomial (⟨z,z'⟩+c)², et l'écart grandit avec la dimension : c'est l'astuce du noyau. En e1071 le noyau polynomial est (γ⟨u,v⟩ + coef0)^degree.",
   "Le multiclasse avec svm() se fait en one-versus-one (6 classifieurs pour 4 classes).",
   "RBF (γ ∈ {0,01 ; 1 ; 20 ; 50}, C = 10) : γ grand → frontière très irrégulière (variance) ; γ petit → frontière lisse (biais).",
   "Piège : svm() standardise par défaut (scale = TRUE). Avec γ = 0,01, C = 10 et standardisation, la classe majoritaire (150 points contre 50) est prédite partout. Le noyau dépend de l'échelle des distances : un même γ n'a pas le même effet sur données brutes et standardisées.",
   "OJ (prédire Purchase) : 800 observations en apprentissage/validation, le reste en test. Mêmes plis (createFolds) pour svmPoly (degree, scale, C) et svmRadial (sigma, C). Le polynomial l'emporte."
  ]
 },
 {
  "t": "TP6 — Le clustering",
  "d": "Preuve de la décomposition de l'inertie, CAH sur une matrice 5×5, deux lignes de points, anneaux concentriques, iris, compression d'image.",
  "fn": [
   "dist(), hclust(method= \"single\", \"complete\", \"average\", \"centroid\", \"ward.D\")",
   "cutree(h, k), rect.hclust(), h$height",
   "kmeans(x, centers, algorithm=\"Lloyd\", nstart)",
   "$tot.withinss (I_W)",
   "silhouette() (package cluster)",
   "km$centers[km$cluster, ] (compression)"
  ],
  "pts": [
   "Preuve I = I_W + I_B : développer ‖(xᵢ−μ_k)+(μ_k−μ)‖² ; le terme croisé s'annule car Σ_{i∈C_k}(xᵢ−μ_k) = 0.",
   "Matrice du TP, lien complet : {x3,x4} à 11, {x1,x2} à 23, {x3,x4,x5} à 25, fusion finale à 50 (voir l'outil CAH).",
   "Deux lignes de points (x = 1..10, y = −1 et y = 4) : le lien simple sépare les deux lignes ; les liens complet, moyen et centroïdal non. Il faudrait augmenter l'écart entre les lignes. Des branches fusionnent au même niveau car beaucoup de distances sont égales (grille régulière).",
   "Hauteurs de fusion croissantes pour les liens simple, complet, moyen et Ward (axiome de la médiane). Avec le lien centroïdal, il peut y avoir des inversions.",
   "Anneaux : le lien simple trouve les 2 anneaux ; le K-means (K = 2) échoue.",
   "Avec φ = (x,y,x²,y²), le K-means ne sépare les anneaux que pour certaines initialisations. Avec nstart = 20, il garde la partition de plus petite I_W et ne les sépare plus : la « bonne » partition n'est pas celle qui minimise I_W. Avec φ = (x,y,x²+y²), ça marche.",
   "Iris standardisé : les clusters du K-means (K = 3, nstart = 200) ne collent pas parfaitement aux espèces (sauf setosa). Coude à K = 3 ; Ward suggère 3 ; la silhouette suggère 2. La boucle de silhouette commence à K = 2 car elle n'est définie que pour 2 ≤ K ≤ n−1.",
   "Compression : pixels → (R,G,B), kmeans pour K = 2, 4, 8 ; chaque pixel prend la couleur de son centroïde."
  ]
 }
];
export const CAH_PRESETS = {
 "exam2024": {
  "name": "Examen 2024 S1",
  "m": [
   [
    0
   ],
   [
    23,
    0
   ],
   [
    10,
    50,
    0
   ],
   [
    13,
    33,
    55,
    0
   ],
   [
    35,
    24,
    18,
    34,
    0
   ]
  ]
 },
 "exam2025": {
  "name": "Examen 2025 S1",
  "m": [
   [
    0
   ],
   [
    43,
    0
   ],
   [
    9,
    8,
    0
   ],
   [
    10,
    39,
    24,
    0
   ],
   [
    12,
    19,
    15,
    42,
    0
   ]
  ]
 },
 "tp": {
  "name": "TP clustering",
  "m": [
   [
    0
   ],
   [
    23,
    0
   ],
   [
    35,
    21,
    0
   ],
   [
    43,
    32,
    11,
    0
   ],
   [
    50,
    45,
    25,
    17,
    0
   ]
  ]
 },
 "blanc1": {
  "name": "Sujet blanc 1",
  "m": [
   [
    0
   ],
   [
    14,
    0
   ],
   [
    31,
    27,
    0
   ],
   [
    9,
    30,
    40,
    0
   ],
   [
    35,
    18,
    12,
    37,
    0
   ]
  ]
 },
 "blanc2": {
  "name": "Sujet blanc 2",
  "m": [
   [
    0
   ],
   [
    21,
    0
   ],
   [
    6,
    24,
    0
   ],
   [
    29,
    11,
    26,
    0
   ],
   [
    16,
    33,
    19,
    14,
    0
   ]
  ]
 }
};
export const LEGACY_CARD_ORDER = ["c_6cc96360", "c_98d9a6a2", "c_af913e8f", "c_0c124f1c", "c_c70da021", "c_fda622b9", "c_48eda94b", "c_a557a107", "c_c855da32", "c_77d37204", "c_4a7b11ad", "c_c51313f5", "c_87f2726a", "c_0ce715ad", "c_95430a29", "c_aa465313", "c_50732990", "c_542b51a0", "c_cc0efa5c", "c_9a2a8907", "c_11e06c2d", "c_c9a581dd", "c_543dcb74", "c_78b57e0a", "c_763401dc", "c_5e5b72be", "c_bb715103", "c_250036c0", "c_c362cd7d", "c_fd198056", "c_3e19a58c", "c_1d900548", "c_2862d9da", "c_040c7bbf", "c_58abef3d", "c_a30a94c3", "c_ed7cd2e0", "c_322583b2", "c_23ca365b", "c_9011f3a1", "c_2914392d", "c_c57dde0d", "c_ceb61419", "c_a363b8fa", "c_8cf32c92", "c_10ae003a", "c_1b463b51", "c_889733e6", "c_edf1116b", "c_1a445acd", "c_d5121d0b", "c_d9a6e113", "c_695f8a14", "c_8b8247d4", "c_12cdeefb", "c_58f5e27e", "c_d7013dd2", "c_159f6060", "c_99074a98", "c_a1260945", "c_8af2f121", "c_32f6c5bd", "c_1dd97597", "c_3d415ce6", "c_7b57743f", "c_55a52893", "c_34ad2024", "c_cb5b11ce", "c_2e2b9e53", "c_b3fb4ddb", "c_de3d2e33", "c_2d9a91ff", "c_9c741bfc", "c_74872d26", "c_139e41a7", "c_9e8d1536", "c_367ee1b3", "c_ec5b1d04", "c_9e3b8666", "c_5c7d7564", "c_fecf4d20", "c_01fd4041", "c_41cd2970", "c_db858b5d", "c_8c2a6598", "c_c801ae5b", "c_f4709d76", "c_b6413bbd", "c_6a35fb2e", "c_8b529e3f", "c_ef59dcf1", "c_924f10b4", "c_ce9d93fc", "c_d5830f66", "c_9a947517", "c_3009d93e", "c_b7337c21", "c_201922d9", "c_7e4d6ccf", "c_c5254856", "c_e5cc8ac8", "c_2512fc5e", "c_aba881a1", "c_af5d00aa", "c_b0931fec", "c_ef6e058f", "c_6f4d769c", "c_e30d75c5"];
