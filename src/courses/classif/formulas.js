// Formulaire du cours de classification : toutes les formules des fiches, regroupées par chapitre.
const F = (n, tex, note, must) => ({ n, tex, note, must });
const r = String.raw;

export const formulas = [
  { ch: 'intro', t: 'Risque et règle optimale', items: [
    F('Fonction de coût', r`\ell(y,y)=0 \quad\text{et}\quad \ell(y,y')>0 \ \text{ si } y\neq y'`),
    F('Risque', r`R(f)=\mathbb{E}\big[\ell(Y,f(X))\big]`),
    F('Règle optimale', r`f^*=\operatorname*{arg\,min}_{f} R(f)`),
    F('Risque empirique (ERM)', r`\hat R_n(f)=\frac1n\sum_{i=1}^n \ell\big(y_i,f(x_i)\big)`),
    F('Coût quadratique', r`f^*(x)=\mathbb{E}[Y\mid X=x]`, 'Démonstration : on minimise, pour chaque x, \\(c\\mapsto\\int (y-c)^2p(y\\mid x)\\,dy\\).'),
    F('Coût absolu', r`f^*(x)=\text{médiane}(Y\mid X=x)`),
    F('Coût 0/1 : classifieur de Bayes', r`f^*(x)=\operatorname*{arg\,max}_k\ \mathbb{P}(Y=k\mid X=x)`),
  ] },
  { ch: 'intro', t: 'K plus proches voisins', items: [
    F('Classification (vote majoritaire)', r`f(x)=\operatorname*{arg\,max}_{k}\sum_{i\,:\,x_i\in N_K(x)} \mathbf 1\{y_i=k\}`),
    F('Régression (moyenne)', r`f(x)=\frac1K\sum_{i\,:\,x_i\in N_K(x)} y_i`),
    F('KNN pondéré (examen 2025)', r`w_i(x)=\exp\!\big(-d_i(x)^2/h\big)\ \text{ pour } x_i\in N_K(x)`, 'h grand ≈ KNN classique ; h petit ≈ 1-NN.'),
    F('Coût de calcul d\'une prédiction', r`O(nd)\ \text{(distances)} + O(n\log K)\ \text{(K plus petites)}`),
  ] },
  { ch: 'eval', t: 'Métriques de classification', items: [
    F('Accuracy', r`\text{Accuracy}=\frac{TP+TN}{TP+TN+FP+FN}`),
    F('Sensibilité = rappel = TPR', r`\frac{TP}{TP+FN}`, 'Taux de vrais positifs.'),
    F('Spécificité = TNR', r`\frac{TN}{TN+FP}`, 'Taux de vrais négatifs ; FPR = 1 − spécificité.'),
    F('Précision', r`\frac{TP}{TP+FP}`),
    F('F1-score', r`F_1=\frac{2\,P\,R}{P+R}=\frac{2\,TP}{2\,TP+FP+FN}`),
    F('Macro-average', r`\frac1C\sum_{k=1}^C \text{score}_k`, 'Moyenne simple par classe : ne néglige pas les classes rares. Weighted : pondérée par l\'effectif. Micro : on somme TP, FP… de toutes les classes (micro-précision = accuracy).'),
  ] },
  { ch: 'eval', t: 'Régression', items: [
    F('Erreur quadratique moyenne', r`\mathrm{MSE}=\frac1n\sum_{i=1}^n\big(y_i-f(x_i)\big)^2,\qquad \mathrm{RMSE}=\sqrt{\mathrm{MSE}}`),
  ] },
  { ch: 'reglog', t: 'Régression logistique', items: [
    F('Classifieur linéaire', r`f(x)=\operatorname{sign}\big(\langle w,x\rangle+b\big)\in\{-1,1\}`),
    F('Sigmoïde', r`\sigma(z)=\frac{1}{1+e^{-z}}\in\,]0,1[`),
    F('Modèle', r`\hat{\mathbb P}(Y=1\mid x)=\sigma(\langle w,x\rangle+b)`),
    F('Estimation (perte logistique)', r`(\hat w,\hat b)=\operatorname*{arg\,min}_{w,b}\ \frac1n\sum_{i=1}^n\log\Big(1+\exp\big(-y_i(\langle w,x_i\rangle+b)\big)\Big)`),
    F('Décision avec un seuil s', r`\hat y=1 \iff \sigma(\langle\hat w,x\rangle+\hat b)\ge s`),
    F('AUC d\'une soumission de classes (Kaggle)', r`\text{AUC}=\frac{\text{TPR}+(1-\text{FPR})}{2}=\frac{\text{sensibilité}+\text{spécificité}}{2}`, 'Avec des classes 0/1 au lieu de scores, la « courbe » ROC n\'a qu\'un point intermédiaire : deux segments.'),
  ] },
  { ch: 'cart', t: 'Arbres CART', items: [
    F('Gain d\'information d\'une coupure', r`IG(R_l,R_m)=\mathcal I(R)-\frac{n_l}{n}\,\mathcal I(R_l)-\frac{n_m}{n}\,\mathcal I(R_m)`, 'n = effectif du nœud R ; on garde la coupure qui maximise IG.'),
    F('Impureté de Gini', r`\mathcal I(R)=\sum_{k} p_k(1-p_k)=1-\sum_k p_k^2`),
    F('Entropie', r`\mathcal I(R)=-\sum_k p_k\log_2 p_k`),
    F('Erreur de classification', r`\mathcal I(R)=1-\max_k p_k`),
    F('Coupure en régression', r`\min\ \frac{n_l}{n}\mathrm{MSE}(R_l)+\frac{n_m}{n}\mathrm{MSE}(R_m)`),
    F('Élagage : coût-complexité', r`C_\lambda(T)=\sum_{l=1}^{|T|} n_l\,\mathcal I(R_l)+\lambda\,|T|`, 'λ choisi par validation ; |T| = nombre de feuilles.'),
  ] },
  { ch: 'svm', t: 'SVM à marge rigide', items: [
    F('Distance d\'un point à l\'hyperplan', r`d(x,H)=\frac{|\langle w,x\rangle+b|}{\|w\|}`),
    F('Marge', r`\gamma=\frac{1}{\|w\|}`),
    F('Problème primal', r`\min_{w,b}\ \tfrac12\|w\|^2\quad\text{s.c. } y_i(\langle w,x_i\rangle+b)\ge 1\ \ \forall i`),
    F('Problème dual', r`\max_{\alpha}\ \sum_i\alpha_i-\tfrac12\sum_{i,j}\alpha_i\alpha_j y_iy_j\langle x_i,x_j\rangle\quad\text{s.c. }\sum_i\alpha_iy_i=0,\ \alpha_i\ge0`),
    F('Retour au primal', r`\hat w=\sum_i\hat\alpha_i y_i x_i,\qquad \hat b=1-\min_{i\,:\,y_i=1}\langle\hat w,x_i\rangle`, 'Vecteurs de support : les points avec \\(\\hat\\alpha_i>0\\).'),
  ] },
  { ch: 'svm', t: 'SVM à marge souple et noyaux', items: [
    F('Primal souple', r`\min_{w,b,\xi}\ \tfrac12\|w\|^2+C\sum_{i=1}^n\xi_i\quad\text{s.c. } y_i(\langle w,x_i\rangle+b)\ge1-\xi_i,\ \xi_i\ge0`),
    F('Forme « perte charnière »', r`\min_{w,b}\ \frac{1}{2Cn}\|w\|^2+\frac1n\sum_{i=1}^n \max\big(0,\,1-y_i(\langle w,x_i\rangle+b)\big)`),
    F('Dual souple', r`\text{même dual avec } 0\le\alpha_i\le C,\qquad \hat b=y_i-\sum_j\hat\alpha_j y_j\langle x_j,x_i\rangle\ \ (0<\hat\alpha_i<C)`),
    F('Conditions KKT', r`\hat\alpha_i\big[y_i(\langle\hat w,x_i\rangle+\hat b)-1+\xi_i\big]=0`, '\\(\\hat\\alpha_i>0\\) et \\(\\xi_i=0\\) : vecteur de support (sur \\(H^\\pm\\)) ; \\(\\hat\\alpha_i>0\\) et \\(\\xi_i>0\\) : outlier (dans la marge ou mal classé).'),
    F('Noyaux', r`\begin{aligned}\text{linéaire} &:\ k(x,x')=\langle x,x'\rangle\\ \text{cosinus} &:\ k(x,x')=\frac{\langle x,x'\rangle}{\|x\|\,\|x'\|}\\ \text{quadratique} &:\ k(x,x')=(\langle x,x'\rangle+c)^2\\ \text{polynomial} &:\ k(x,x')=(\langle x,x'\rangle+c)^q\\ \text{gaussien }(\Sigma) &:\ k(x,x')=\exp\big(-\tfrac12(x-x')^\top\Sigma^{-1}(x-x')\big)\\ \text{gaussien / RBF} &:\ k(x,x')=e^{-\gamma\|x-x'\|^2},\quad \gamma=\frac1{2\sigma^2}\end{aligned}`, 'Matrice de Gram : \\(K_{ij}=k(x_i,x_j)\\).'),
    F('Classifieur à noyau', r`f(x)=\operatorname{sign}\Big(\sum_i\hat\alpha_iy_i\,k(x_i,x)+\hat b\Big)`),
  ] },
  { ch: 'clust', t: 'Inertie', items: [
    F('Centre de gravité et centroïdes', r`\mu=\frac1n\sum_{i=1}^n x_i,\qquad \mu_k=\frac1{|C_k|}\sum_{x_i\in C_k}x_i`),
    F('Décomposition de l\'inertie (Huygens)', r`I=\sum_{i=1}^n\|x_i-\mu\|^2=I_W+I_B`, 'Démonstration : on écrit \\(x_i-\\mu=(x_i-\\mu_k)+(\\mu_k-\\mu)\\) ; le double produit est nul car \\(\\sum_{x_i\\in C_k}(x_i-\\mu_k)=0\\). Voir la fiche Clustering.', true),
    F('Inertie intra-classes (homogénéité, à minimiser)', r`I_W=\sum_{k=1}^K\sum_{x_i\in C_k}\|x_i-\mu_k\|^2`),
    F('Inertie inter-classes (séparation, à maximiser)', r`I_B=\sum_{k=1}^K|C_k|\,\|\mu_k-\mu\|^2`),
  ] },
  { ch: 'clust', t: 'CAH et K-moyennes', items: [
    F('Liens', r`\begin{aligned}\text{simple} &:\ \min_{x\in C_k,\,y\in C_l} d(x,y)\\ \text{complet} &:\ \max_{x\in C_k,\,y\in C_l} d(x,y)\\ \text{moyen} &:\ \frac{1}{|C_k||C_l|}\sum_{x,y} d(x,y)\\ \text{centroïdal} &:\ d(\mu_k,\mu_l)\end{aligned}`),
    F('Critère de Ward', r`\frac{|C_k|\,|C_l|}{|C_k|+|C_l|}\,\|\mu_k-\mu_l\|^2`, 'Hausse de \\(I_W\\) (= perte de \\(I_B\\)) quand on fusionne \\(C_k\\) et \\(C_l\\).'),
    F('K-moyennes : affectation', r`k(x_i)=\operatorname*{arg\,min}_k\|x_i-\mu_k\|^2`),
    F('K-moyennes : mise à jour', r`\mu_k=\frac1{|C_k|}\sum_{x_i\in C_k}x_i`, 'On alterne jusqu\'à stabilité ; \\(I_W\\) diminue à chaque étape.'),
  ] },
  { ch: 'clust', t: 'Évaluer un clustering', items: [
    F('Homogénéité', r`T_k=\frac1{|C_k|}\sum_{x\in C_k}d(x,\mu_k),\qquad T=\frac1K\sum_k T_k\quad(\text{petit})`),
    F('Séparabilité', r`S_{kl}=d(\mu_k,\mu_l),\qquad S=\frac{2}{K(K-1)}\sum_{k<l} S_{kl}\quad(\text{grand})`),
    F('Davies-Bouldin', r`D_k=\max_{l\ne k}\frac{T_k+T_l}{S_{kl}},\qquad D=\frac1K\sum_k D_k\quad(\text{à minimiser})`),
    F('Silhouette', r`s(x)=\frac{b(x)-a(x)}{\max\big(a(x),b(x)\big)}\in[-1,1]`, '\\(a(x)\\) : distance moyenne aux autres points de son cluster ; \\(b(x)\\) : plus petite distance moyenne à un autre cluster. Moyenne à maximiser.'),
    F('Nombre de partitions (Bell)', r`B_n=\frac1e\sum_{k\ge1}\frac{k^n}{k!}`, 'Énorme (\\(B_{50}\\ge10^{47}\\)) : on ne peut pas tout explorer.'),
  ] },
];
