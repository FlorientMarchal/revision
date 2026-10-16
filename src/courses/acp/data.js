// Contenu du cours « Analyse de données multidimensionnelles (ACP) ». Identifiants fixes : la progression ne se décale pas si l'on ajoute du contenu.
import { lessons } from './lessons.js';

export { lessons };
const r = String.raw;

export const chapters = [
  { id: 'notations', name: 'Notations' },
  { id: 'acp', name: 'Problèmes & solutions' },
  { id: 'resultats', name: 'Analyse des résultats' },
  { id: 'varimax', name: 'Varimax' },
  { id: 'features', name: 'Features engineering' },
  { id: 'clv', name: 'CLV' },
];

/* ------------------------------------------------------------------ formulaire */
const F = (n, tex, note, must) => ({ n, tex, note, must });
export const formulas = [
  { ch: 'notations', t: 'Tableau, poids, statistiques', items: [
    F('Matrice des poids', r`\mathbf N=\mathrm{diag}(w_1,\dots,w_n),\qquad\sum_iw_i=1`),
    F('Centre de gravité', r`\mathbf g=\mathbf 1^t\,\mathbf N\,\mathbf X=\sum_{i=1}^nw_i\,{}_i\mathbf x`, null, true),
    F('Tableau centré', r`\mathbf Y=\mathbf X-\mathbf 1\,\mathbf g=(\mathbf{Id}-\mathbf 1\,\mathbf 1^t\,\mathbf N)\,\mathbf X`, 'À démontrer.', true),
    F('Variance-covariance', r`\mathbf V=\mathbf X^t\mathbf N\mathbf X-\mathbf g^t\mathbf g=\mathbf Y^t\mathbf N\mathbf Y`, null, true),
    F('Tableau réduit', r`\mathbf Z=\mathbf Y\,\mathbf W^{-1},\quad\mathbf W=\mathrm{diag}(\sigma_1,\dots,\sigma_p),\qquad\mathbf Z^t\mathbf N\mathbf Z=\mathbf R`),
    F('Inertie', r`In=\sum_{i=1}^nw_i\|{}_i\mathbf y\|^2=\sum_{j=1}^p\sigma_j^2=\mathrm{trace}(\mathbf V)`, 'À démontrer. En ACP normée, In = p.', true),
    F('Inertie et distances deux à deux', r`\sum_{i=1}^{n-1}\sum_{k=i+1}^nw_iw_k\|{}_i\mathbf x-{}_k\mathbf x\|^2=\sum_{j=1}^p\sigma_j^2`),
  ] },
  { ch: 'acp', t: 'ACP', items: [
    F('Composante principale', r`\mathbf f_k=\mathbf Y\,\mathbf a_k=\sum_{j=1}^pa_{j,k}\,\mathbf y_j`, null, true),
    F('Premier axe', r`\mathbf a_1=\operatorname*{arg\,max}_{\mathbf a^t\mathbf a=1}\mathrm{var}(\mathbf Y\mathbf a)=\operatorname*{arg\,max}_{\mathbf a^t\mathbf a=1}\mathbf a^t\mathbf V\mathbf a`, 'Solution : vecteur propre de V associé à la plus grande valeur propre λ₁.', true),
    F('Équation aux valeurs propres', r`\mathbf V\,\mathbf a_k=\lambda_k\,\mathbf a_k,\qquad\mathbf A^t\mathbf A=\mathbf{Id}`, null, true),
    F('Composantes centrées', r`\mathbf 1^t\,\mathbf N\,\mathbf f_k=0`, 'À démontrer.'),
    F('Non corrélées, variances λ', r`\mathrm{Cov}(\mathbf F)=\boldsymbol\Lambda=\mathrm{diag}(\lambda_1,\dots,\lambda_K),\qquad\mathrm{var}(\mathbf f_k)=\lambda_k`, 'À démontrer.', true),
    F('Inertie conservée', r`In(\mathbf F)=\sum_{j=1}^p\lambda_j=In(\mathbf Y)`),
    F('Distances deux à deux', r`\operatorname*{arg\,min}\sum_{i\lt j}w_iw_j\big(\|{}_i\mathbf y-{}_j\mathbf y\|^2-(f_{i,k}-f_{j,k})^2\big)`),
    F('Covariance avec les variables', r`\lambda_k=\sqrt{\sum_{j=1}^p\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)}`, 'À démontrer.', true),
    F('Reconstruction (auto-encodeur)', r`\hat{\mathbf Y}=\mathbf Y\,\mathbf A\,\mathbf A^t=\operatorname*{arg\,min}_{\mathrm{rang}\le K}\|\mathbf Y-\hat{\mathbf Y}\|_F^2`),
  ] },
  { ch: 'resultats', t: 'Analyse des résultats', items: [
    F('Part d\'inertie conservée', r`\frac{\sum_{k=1}^K\lambda_k}{In}`, null, true),
    F('Critère de Kaiser', r`\lambda_k\gt\frac{In}{p}`, 'En ACP normée : λ > 1.', true),
    F('Méthode de la corde', r`k=\operatorname*{arg\,max}_{i\in[\![1;p]\!]}\big(i(\lambda_p-\lambda_1)-\lambda_i(p-1)\big)`),
    F('Dérivée seconde', r`k=\operatorname*{arg\,max}_{i\in[\![2;p-1]\!]}\lambda_{i+1}-2\lambda_i+\lambda_{i-1}`),
    F('Coordonnées optimales', r`k=\text{dernier index tel que }\lambda_k\ge\lambda_{k+1}-\frac{\lambda_p-\lambda_{k+1}}{p-k-1}`),
    F('Contribution de la variable j à la composante k', r`a_{j,k}^2=\frac{\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)}{\sum_j\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)}=\frac{\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)}{\lambda_k^2}`, 'À démontrer. On regarde aussi le signe de a_{j,k}.', true),
    F('Covariance composante-variable', r`\mathrm{cov}(\mathbf f_k,\mathbf y_j)=\lambda_k\,a_{j,k}`),
    F('Qualité de représentation d\'une variable', r`\sum_{k=1}^K\mathrm{cor}^2(\mathbf f_k,\mathbf y_j)=\frac{\sum_{k=1}^K\lambda_ka_{j,k}^2}{\sigma_j^2}`, 'À démontrer (c\'est un R²).', true),
    F('Coordonnées sur le cercle', r`\mathrm{cor}(\mathbf f_k,\mathbf y_j)=\frac{\sqrt{\lambda_k}\,a_{j,k}}{\sigma_j}`),
    F('Corrélation entre variables', r`\mathrm{cor}(\mathbf y_q,\mathbf y_j)=\frac{\sum_k\lambda_ka_{j,k}a_{q,k}}{\sigma_j\sigma_q}\approx\cos(\text{angle des flèches})`, 'À démontrer.'),
    F('Qualité de représentation d\'un individu', r`\frac{\|{}_i\hat{\mathbf y}\|^2}{\|{}_i\mathbf y\|^2}=\frac{\sum_{k=1}^Kf_{i,k}^2}{\sum_{j=1}^py_{i,j}^2}`, 'À démontrer.', true),
  ] },
  { ch: 'varimax', t: 'Varimax', items: [
    F('Matrice H', r`h_{j,j}=\sqrt{\sum_{k=1}^K\lambda_ka_{j,k}^2}`),
    F('Matrice L', r`\mathbf L=\mathbf H^{-1}\,\mathbf A\,\boldsymbol\Lambda^{1/2},\qquad\mathbf L^*=\mathbf L\,\mathbf T`),
    F('Critère maximisé', r`\frac1{p^2}\sum_{k=1}^K\Big(p\sum_{j=1}^pL_{j,k}^{*4}-\Big(\sum_{j=1}^pL_{j,k}^{*2}\Big)^2\Big)`, null, true),
    F('Nouvelles valeurs propres', r`\lambda_k^*=\sum_{j=1}^ph_{j,j}^2L_{j,k}^{*2}`),
    F('Nouvelle matrice de passage', r`\mathbf P=\mathbf A\,\boldsymbol\Lambda^{-1/2}\,\mathbf T\,\boldsymbol\Lambda^{*1/2}`),
    F('Contribution et qualité', r`h_{j,j}^2L_{j,k}^{*2},\qquad\frac{h_{j,j}^2}{\sigma_j^2}\sum_{k=1}^KL_{j,k}^{*2}`),
    F('Reconstruction', r`\hat{\mathbf Y}=\mathbf F^*(\mathbf P^t\mathbf P)^{-1}\mathbf P^t`),
  ] },
  { ch: 'features', t: 'Features engineering', items: [
    F('Rang fractionnaire', r`Rf(x_{i,j})=1+\sum_{k=1}^n\mathbf 1_{x_{i,j}\lt x_{k,j}}+\frac12\sum_{k\neq i}\mathbf 1_{x_{i,j}=x_{k,j}}`),
    F('Taille absolue d\'un groupe', r`y'_{i,j}=\frac{y_{i,j}}{\sqrt{n_{g(j)}}}`),
    F('AFM (taille effective)', r`y'_{i,j}=\frac{y_{i,j}}{\sqrt{\lambda_1^{(g(j))}}}`, null, true),
    F('Contribution d\'un groupe', r`\sum_{j=1}^{n_g}a_{j,k}^2`),
  ] },
  { ch: 'clv', t: 'CLV', items: [
    F('Perte d\'inertie d\'une agrégation', r`In(\mathbf Y_1)-In(\mathbf Y_2)=\mathrm{var}(\mathbf y_a)+\mathrm{var}(\mathbf y_b)-\mathrm{var}(\mathbf f)\ge0`, 'Minimale si f est la 1re composante principale des deux variables.', true),
    F('Variation du critère', r`\Delta T_{k+1}=\mathrm{var}(\mathbf f_{A\cup B})-\big(\mathrm{var}(\mathbf f_A)+\mathrm{var}(\mathbf f_B)\big)\le0`),
  ] },
];

/* ------------------------------------------------------------------ flashcards */
const C = (id, ch, q, a) => ({ id: 'ac_' + id, ch, q, a });

/* ------------------------------------------------------------------ QCM */
const Q = (id, ch, q, opts, ans, exp) => ({ id: 'aq_' + id, ch, q, opts, ans, exp });
export const quiz = [
  Q('dimV', 'notations', 'Quelle est la dimension de la matrice V ?', ['n × n', 'n × p', 'p × p', '1 × p'], 2, 'V = Yᵗ N Y : (p × n)(n × n)(n × p) = p × p.'),
  Q('g', 'notations', 'Le centre de gravité s\'écrit…', ['g = X N 1', 'g = 1ᵗ N X', 'g = Xᵗ N X', 'g = N X'], 1, 'g (1 × p) = 1ᵗ (1 × n) N (n × n) X (n × p).'),
  Q('poids', 'notations', 'Les poids des individus vérifient…', ['Σ wᵢ = n', 'Σ wᵢ = 1', 'wᵢ = 1 pour tout i', 'Σ wᵢ = p'], 1, 'N = diag(w), Σ wᵢ = 1.'),
  Q('In', 'notations', 'L\'inertie du nuage est égale à…', ['le déterminant de V', 'la trace de V', 'la plus grande valeur propre de V', 'Σ wᵢ'], 1, 'In = Σ σ²ⱼ = trace(V).'),
  Q('InZ', 'notations', 'L\'inertie d\'un tableau réduit à p variables vaut…', ['1', 'n', 'p', 'Σ σⱼ'], 2, 'Chaque variance vaut 1.'),
  Q('R', 'notations', 'La matrice de variance-covariance du tableau réduit Z est…', ['V', 'la matrice des corrélations R', 'l\'identité', 'W'], 1, 'Zᵗ N Z = W⁻¹ V W⁻¹ = R.'),
  Q('a1', 'acp', 'a₁ est…', ['le vecteur propre de V associé à la plus petite valeur propre', 'le vecteur propre de V associé à la plus grande valeur propre', 'la première colonne de Y', 'le centre de gravité'], 1, 'Maximiser aᵗVa sous aᵗa = 1.'),
  Q('varf', 'acp', 'var(f_k) vaut…', ['1', 'λ_k', '√λ_k', 'λ_k²'], 1, 'var(f_k) = a_kᵗ V a_k = λ_k.'),
  Q('cent', 'acp', 'Les composantes principales sont centrées parce que…', ['A est orthonormée', 'Y est centré', 'les λ sont positives', 'N est diagonale'], 1, '1ᵗ N Y a_k = g_Y a_k = 0.'),
  Q('corr', 'acp', 'Deux composantes principales distinctes sont…', ['parfaitement corrélées', 'non corrélées', 'de même variance', 'toujours de corrélation 0,5'], 1, 'cov(f_k, f_l) = a_kᵗ V a_l = λ_l a_kᵗ a_l = 0.'),
  Q('sumlam', 'acp', 'La somme de toutes les valeurs propres de V est égale à…', ['p', 'l\'inertie In(Y)', '1', 'n'], 1, 'Inertie conservée (et p en ACP normée).'),
  Q('covf', 'acp', 'Σ_j cov²(f_k, y_j) vaut…', ['λ_k', 'λ_k²', '√λ_k', '1'], 1, 'C\'est (V a_k)ᵗ(V a_k) = λ_k² ; donc λ_k = √(Σ cov²).'),
  Q('recon', 'acp', 'La meilleure approximation de rang K de Y (Frobenius) est…', ['Y A', 'Y A Aᵗ', 'A Aᵗ Y', 'Y Aᵗ A'], 1, 'Encodage F = YA, décodage F Aᵗ.'),
  Q('kaiser', 'resultats', 'En ACP normée sur 10 variables, Kaiser garde les composantes telles que…', ['λ > 10', 'λ > 1', 'λ > 0,1', 'λ > 0,5'], 1, 'In/p = 10/10 = 1.'),
  Q('part', 'resultats', 'λ = (3 ; 1,5 ; 0,8 ; 0,4 ; 0,3) : part d\'inertie des deux premières composantes ?', ['45 %', '75 %', '80 %', '90 %'], 1, '(3 + 1,5)/6 = 0,75.'),
  Q('contrib', 'resultats', 'La somme des contributions a²_{j,k} des variables à une composante vaut…', ['λ_k', '1', 'p', '100 / p'], 1, 'a_k est normé.'),
  Q('covfy', 'resultats', 'cov(f_k, y_j) = ?', ['a_{j,k}', 'λ_k a_{j,k}', '√λ_k a_{j,k}', 'a_{j,k}/λ_k'], 1, 'cov(f_k, Y) = V a_k = λ_k a_k.'),
  Q('cor', 'resultats', 'En ACP normée, la corrélation entre f_k et la variable j vaut…', ['a_{j,k}', '√λ_k a_{j,k}', 'λ_k a_{j,k}', 'a²_{j,k}'], 1, 'cor = λ_k a_{j,k}/(√λ_k σ_j) avec σ_j = 1.'),
  Q('long', 'resultats', 'Sur le cercle des corrélations, une flèche très courte signifie que la variable…', ['est très importante', 'est mal représentée dans le plan', 'est corrélée à toutes les autres', 'a une forte contribution'], 1, 'Longueur² = qualité de représentation sur le plan.'),
  Q('angle', 'resultats', 'Deux variables bien représentées dont les flèches sont perpendiculaires sont…', ['fortement corrélées positivement', 'fortement corrélées négativement', 'peu corrélées', 'identiques'], 2, 'cos(90°) = 0 ≈ corrélation.'),
  Q('qindiv', 'resultats', 'La qualité de représentation d\'un individu est…', ['Σ_k f²_{i,k} / Σ_j y²_{i,j}', 'Σ_k a²_{j,k}', 'f_{i,1}/f_{i,2}', 'wᵢ'], 0, 'Rapport des distances carrées à l\'origine.'),
  Q('vmbut', 'varimax', 'Varimax sert à…', ['augmenter l\'inertie conservée', 'rendre les composantes plus interprétables en répartissant l\'inertie', 'choisir K', 'centrer les données'], 1, 'L\'inertie du plan est conservée, elle est seulement répartie autrement.'),
  Q('vmT', 'varimax', 'Dans Varimax, T est…', ['une matrice de poids', 'une matrice de rotation K × K', 'la matrice des corrélations', 'une matrice de rang 1'], 1, 'L* = L T.'),
  Q('vmprop', 'varimax', 'Après Varimax, les composantes…', ['ne sont plus centrées', 'restent centrées et non corrélées', 'deviennent corrélées', 'ont toutes la même variance'], 1, 'Cov = Λ*.'),
  Q('vmP', 'varimax', 'La matrice de passage P après Varimax…', ['est orthonormée', 'n\'est pas orthonormée', 'est l\'identité', 'est égale à A'], 1, 'D\'où Ŷ = F*(PᵗP)⁻¹Pᵗ.'),
  Q('vmqual', 'varimax', 'La qualité de représentation d\'une variable après rotation…', ['augmente toujours', 'diminue toujours', 'ne change pas', 'devient nulle'], 2, 'Une rotation dans le plan conserve h²_j.'),
  Q('lim', 'features', 'Laquelle n\'est PAS une condition de pertinence de l\'ACP ?', ['variables quantitatives', 'relations linéaires', 'inertie = information', 'variables indépendantes'], 3, 'Au contraire : l\'ACP exploite les corrélations.'),
  Q('rangs', 'features', 'Une ACP sur les rangs permet notamment de…', ['traiter des variables nominales', 'linéariser les liaisons monotones', 'supprimer la corrélation', 'augmenter le nombre de variables'], 1, 'Et de limiter les valeurs extrêmes, d\'intégrer les ordinales.'),
  Q('rf', 'features', 'Rangs fractionnaires (croissants) de 5, 7, 7, 9 ?', ['1, 2, 2, 4', '1, 2,5, 2,5, 4', '1, 2, 3, 4', '1, 3, 3, 4'], 1, 'Les ex aequo prennent la moyenne de leurs rangs (2 et 3).'),
  Q('normee', 'features', 'L\'ACP normée sert à…', ['supprimer les valeurs extrêmes', 'neutraliser l\'effet des échelles de mesure', 'rendre les relations linéaires', 'réduire n'], 1, 'Chaque variable a une variance 1.'),
  Q('abs', 'features', 'Pour que le groupe de 9 variables ne domine pas celui de 3 à cause de sa taille absolue, on divise ses variables par…', ['9', '√9 = 3', '√λ₁', '1'], 1, 'y/√n_g.'),
  Q('afm', 'features', 'L\'AFM divise les variables du groupe g par…', ['√n_g', '√λ₁^(g)', 'λ₁^(g)', 'σ_j'], 1, 'λ₁^(g) : première valeur propre de l\'ACP du groupe.'),
  Q('clvc', 'clv', 'La CLV relâche la contrainte…', ['de normalisation des axes', 'de non-corrélation des composantes', 'de centrage', 'de positivité des poids'], 1, 'Pour obtenir des composantes sparse.'),
  Q('clvpair', 'clv', 'À l\'étape 2 de la CLV, on agrège en priorité…', ['les deux variables les moins corrélées', 'les deux variables les plus corrélées', 'les deux variables de plus grande variance', 'deux variables au hasard'], 1, 'La perte 1 − |r| (variables réduites) est minimale.'),
  Q('clvloss', 'clv', 'Deux variables réduites de corrélation 0,8 sont agrégées : perte d\'inertie ?', ['0,8', '0,2', '1,8', '0'], 1, 'λ₁ = 1 + 0,8 : perte = 2 − 1,8 = 0,2.'),
  Q('clvT', 'clv', 'Au fil des étapes, le critère T…', ['diminue', 'augmente', 'reste constant', 'oscille'], 1, 'ΔT ≥ 0 (l\'inertie conservée décroît) : hiérarchie.'),
];

/* ------------------------------------------------------------------ démonstrations (onglet « Démonstrations ») */
const off = '<p class="math-note">Correction du document de démonstrations de l\'enseignant.</p>';
const own = '<p class="math-note">Pas de correction dans le document de démonstrations : correction rédigée pour le site.</p>';
export const exams = [
  {
    id: 'demo-cm1', title: 'Notations et ACP',
    head: '<p>Les résultats que le cours demande de <b>démontrer</b>. Essaie d\'abord sur papier, puis compare avec la correction et note ton résultat.</p>',
    exos: [
      { t: 'Statistiques de base', intro: '', qs: [
        { q: r`<b>1.</b> Démontrer que \(\underset{n\times p}{\mathbf X}-\underset{n\times1}{\mathbf 1}\times\underset{1\times p}{\mathbf g}=(\mathbf{Id}_n-\mathbf 1\,\mathbf 1^t\,\mathbf N)\times\mathbf X\).`, a: off + r`<div class="math">\[(\mathbf{Id}-\mathbf 1\,\mathbf 1^t\,\mathbf N)\,\mathbf X=\mathbf X-(\mathbf 1\,\mathbf 1^t\,\mathbf N\,\mathbf X)=\mathbf X-\mathbf 1\,(\mathbf 1^t\,\mathbf N\,\mathbf X)=\mathbf X-\mathbf 1\,\mathbf g\]</div><p>On distribue, puis on utilise l'associativité du produit matriciel et la définition \(\mathbf g=\mathbf 1^t\mathbf N\mathbf X\).</p>` },
        { q: r`<b>2.</b> Démontrer que \(In=\sum_{i=1}^nw_i\,\|{}_i\mathbf y\|^2=\sum_{j=1}^p\sigma_j^2\).`, a: off + r`<div class="math">\[\sum_{i=1}^nw_i\|{}_i\mathbf y\|^2=\sum_{i=1}^nw_i\Big(\sum_{j=1}^py_{i,j}^2\Big)=\sum_{j=1}^p\sum_{i=1}^nw_iy_{i,j}^2=\sum_{j=1}^p\sigma_j^2\]</div><p>La dernière égalité vient de ce que \(\mathbf y_j\) est centrée.</p>` },
        { q: r`<b>3.</b> Démontrer que \(\sum_{i=1}^{n-1}\sum_{k=i+1}^nw_iw_k\,\|{}_i\mathbf x-{}_k\mathbf x\|^2=\sum_{j=1}^p\sigma_j^2\).`, a: off + r`<div class="math">\[\begin{aligned}\sum_{i\lt k}w_iw_k\|{}_i\mathbf x-{}_k\mathbf x\|^2&=\sum_{i\lt k}w_iw_k\sum_{j=1}^p(x_{i,j}^2-2x_{k,j}x_{i,j}+x_{k,j}^2)\\&=\frac12\sum_{j=1}^p\sum_{i=1}^n\sum_{k=1}^nw_iw_k(x_{i,j}^2-2x_{k,j}x_{i,j}+x_{k,j}^2)\\&=\frac12\sum_{j=1}^p\sum_{i=1}^nw_i\Big(x_{i,j}^2\sum_kw_k-2x_{i,j}\sum_kw_kx_{k,j}+\sum_kw_kx_{k,j}^2\Big)\\&=\frac12\sum_{j=1}^p\sum_{i=1}^nw_i\Big(x_{i,j}^2-2x_{i,j}\bar x_j+\sum_kw_kx_{k,j}^2\Big)\\&=\frac12\sum_{j=1}^p\Big(\sum_iw_ix_{i,j}^2-2\bar x_j\sum_iw_ix_{i,j}+\sum_kw_kx_{k,j}^2\sum_iw_i\Big)\\&=\frac12\sum_{j=1}^p\Big(2\sum_iw_ix_{i,j}^2-2\bar x_j^2\Big)\\&=\sum_{j=1}^p\Big(\sum_iw_ix_{i,j}^2-\bar x_j^2\Big)=\sum_{j=1}^p\sigma_j^2\end{aligned}\]</div><p>Passage à la somme double complète : le terme est symétrique en \((i,k)\) et nul pour \(i=k\), d'où le facteur ½. On utilise \(\sum_kw_k=1\) et \(\sum_kw_kx_{k,j}=\bar x_j\).</p>` },
      ] },
      { t: 'Propriétés des composantes principales', intro: '', qs: [
        { q: r`<b>4.</b> Démontrer que les composantes principales sont centrées : \(\mathbf 1^t\,\mathbf N\,\mathbf f_k=0\).`, a: off + r`<div class="math">\[\mathbf 1^t\mathbf N\mathbf f_k=\mathbf 1^t\mathbf N\mathbf Y\mathbf a_k=\mathbf g_{\mathbf Y}\,\mathbf a_k=\mathbf 0_{1\times p}\,\mathbf a_k=0\]</div><p>\(\mathbf 1^t\mathbf N\mathbf Y\) est le centre de gravité du tableau centré : il est nul.</p>` },
        { q: r`<b>5.</b> Démontrer que \(\mathrm{var}(\mathbf f_k)=\lambda_k\).`, a: off + r`<div class="math">\[\mathrm{var}(\mathbf f_k)=\mathbf f_k^t\mathbf N\mathbf f_k=(\mathbf Y\mathbf a_k)^t\mathbf N(\mathbf Y\mathbf a_k)=\mathbf a_k^t\mathbf Y^t\mathbf N\mathbf Y\mathbf a_k=\mathbf a_k^t\mathbf V\mathbf a_k=\mathbf a_k^t(\lambda_k\mathbf a_k)=\lambda_k(\mathbf a_k^t\mathbf a_k)=\lambda_k\]</div><p>La première égalité utilise que \(\mathbf f_k\) est centrée (question 4).</p>` },
        { q: r`<b>6.</b> Démontrer que les composantes sont non corrélées : \(\mathrm{Cov}(\mathbf F)=\boldsymbol\Lambda\).`, a: own + r`<p>Pour \(k\neq l\) : \(\mathrm{cov}(\mathbf f_k,\mathbf f_l)=\mathbf f_k^t\mathbf N\mathbf f_l=\mathbf a_k^t\mathbf V\mathbf a_l=\mathbf a_k^t(\lambda_l\mathbf a_l)=\lambda_l\,\mathbf a_k^t\mathbf a_l=0\), car les vecteurs propres d'une matrice symétrique sont orthonormés. Avec la question 5 (diagonale), \(\mathrm{Cov}(\mathbf F)=\mathbf A^t\mathbf V\mathbf A=\boldsymbol\Lambda\).</p>` },
        { q: r`<b>7.</b> Démontrer que l'inertie totale est conservée : \(In(\mathbf F_{n\times p})=\sum_{j=1}^p\lambda_j=In(\mathbf Y)\).`, a: own + r`<p>Les composantes sont centrées, donc (question 2) \(In(\mathbf F)=\sum_k\mathrm{var}(\mathbf f_k)=\sum_k\lambda_k\) (question 5). Or la somme des valeurs propres est la trace : \(\sum_k\lambda_k=\mathrm{trace}(\mathbf V)=\sum_j\sigma_j^2=In(\mathbf Y)\). Autre façon : \(\mathbf F=\mathbf Y\mathbf A\) avec \(\mathbf A\) orthogonale (\(K=p\)), donc \(\|{}_i\mathbf f\|=\|{}_i\mathbf y\,\mathbf A\|=\|{}_i\mathbf y\|\) pour chaque individu.</p>` },
        { q: r`<b>8.</b> Démontrer que l'ACP minimise la distorsion des distances deux à deux (et donne les mêmes axes que la maximisation de la variance projetée).`, a: own + r`<p>Pour \(\mathbf A\) orthonormée, la distance entre deux individus dans l'espace des composantes est celle de leurs projections orthogonales : elle est plus petite que leur distance d'origine, donc chaque terme de distorsion est positif. Par la question 3 appliquée à \(\mathbf Y\) puis à chaque composante (centrée) :</p><div class="math">\[\sum_{i\lt j}w_iw_j\Big(\|{}_i\mathbf y-{}_j\mathbf y\|^2-\sum_{k=1}^K(f_{i,k}-f_{j,k})^2\Big)=In(\mathbf Y)-\sum_{k=1}^K\mathrm{var}(\mathbf f_k)\]</div><p>Minimiser la distorsion revient à maximiser \(\sum_k\mathrm{var}(\mathbf f_k)=\sum_k\mathbf a_k^t\mathbf V\mathbf a_k\) sous \(\mathbf A^t\mathbf A=\mathbf{Id}\) : on retrouve les vecteurs propres de \(\mathbf V\) associés aux \(K\) plus grandes valeurs propres.</p>` },
        { q: r`<b>9.</b> Démontrer que \(\lambda_k=\sqrt{\sum_{j=1}^p\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)}\).`, a: off + r`<div class="math">\[\sum_{j=1}^p\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)=(\mathbf Y^t\mathbf N\mathbf f_k)^t(\mathbf Y^t\mathbf N\mathbf f_k)=(\mathbf V\mathbf a_k)^t(\mathbf V\mathbf a_k)=(\lambda_k\mathbf a_k^t)(\lambda_k\mathbf a_k)=\lambda_k^2(\mathbf a_k^t\mathbf a_k)=\lambda_k^2\]</div><p>\(\mathbf Y^t\mathbf N\mathbf f_k\) est le vecteur des covariances \(\mathrm{cov}(\mathbf y_j,\mathbf f_k)\) ; et \(\mathbf Y^t\mathbf N\mathbf f_k=\mathbf Y^t\mathbf N\mathbf Y\mathbf a_k=\mathbf V\mathbf a_k\).</p>` },
      ] },
    ],
  },
  {
    id: 'demo-cm2', title: 'Analyse des résultats et Varimax',
    head: '<p>Démonstrations des indicateurs d\'interprétation.</p>',
    exos: [
      { t: 'Variables', intro: '', qs: [
        { q: r`<b>1.</b> Démontrer que \(a_{j,k}^2=\dfrac{\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)}{\sum_{j=1}^p\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)}\).`, a: off + r`<div class="math">\[\mathrm{cov}(\mathbf f_k,\mathbf Y)=\mathbf Y^t\mathbf N\mathbf f_k=\mathbf Y^t\mathbf N\mathbf Y\mathbf a_k=\mathbf V\mathbf a_k=\lambda_k\mathbf a_k\]</div><p>donc \(\lambda_ka_{j,k}=\mathrm{cov}(\mathbf f_k,\mathbf y_j)\iff\lambda_k^2a_{j,k}^2=\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)\iff a_{j,k}^2=\dfrac{\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)}{\lambda_k^2}\), et \(\lambda_k^2=\sum_j\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)\) (démonstration précédente).</p>` },
        { q: r`<b>2.</b> Démontrer que \(\sum_{k=1}^K\mathrm{cor}^2(\mathbf f_k,\mathbf y_j)=\dfrac{\sum_{k=1}^K\lambda_ka_{j,k}^2}{\sigma_j^2}\).`, a: off + r`<p>On projette \(\mathbf y_j\) sur l'espace des composantes (régression) :</p><div class="math">\[\hat{\mathbf y}_j=\mathbf F\,\boldsymbol\Lambda^{-1}\,\mathbf F^t\,\mathbf N\,\mathbf y_j,\qquad\hat y_{i,j}=\sum_{k=1}^K\frac{f_{i,k}}{\lambda_k}\,\mathrm{cov}(\mathbf y_j,\mathbf f_k)=\sum_{k=1}^K\frac{f_{i,k}}{\lambda_k}\lambda_ka_{j,k}=\sum_{k=1}^Kf_{i,k}a_{j,k}\]</div><div class="math">\[\mathrm{var}(\hat{\mathbf y}_j)=\mathrm{var}\Big(\sum_{k=1}^K\mathbf f_k\,a_{j,k}\Big)=\sum_{k=1}^K\lambda_ka_{j,k}^2\]</div><p>(composantes non corrélées). Le \(R^2\) de cette régression est \(\mathrm{var}(\hat{\mathbf y}_j)/\sigma_j^2\), et c'est aussi la somme des \(\mathrm{cor}^2(\mathbf f_k,\mathbf y_j)\) puisque les régresseurs sont non corrélés.</p>` },
        { q: r`<b>3.</b> Démontrer que le cosinus de l'angle entre les flèches de deux variables bien représentées, proches du cercle, approxime leur corrélation.`, a: off + r`<p>Le cosinus de l'angle entre les flèches de \(\mathbf y_q\) et \(\mathbf y_j\) dans le plan factoriel est</p><div class="math">\[\frac{\dfrac{\lambda_1a_{1,j}a_{1,q}+\lambda_2a_{2,j}a_{2,q}}{\sigma_j\sigma_q}}{\dfrac{\sqrt{\lambda_1a_{1,j}^2+\lambda_2a_{2,j}^2}}{\sigma_j}\times\dfrac{\sqrt{\lambda_1a_{1,q}^2+\lambda_2a_{2,q}^2}}{\sigma_q}}\]</div><p>Les variables étant bien représentées, les deux facteurs du dénominateur valent environ 1, et le cosinus vaut environ \(\frac{\lambda_1a_{1,j}a_{1,q}+\lambda_2a_{2,j}a_{2,q}}{\sigma_j\sigma_q}\). De façon exacte :</p><div class="math">\[\begin{aligned}\mathrm{cor}(\mathbf y_q,\mathbf y_j)&=\mathrm{cor}\Big(\sum_ka_{q,k}\mathbf f_k,\sum_ka_{j,k}\mathbf f_k\Big)=\frac{\sum_k\sum_la_{j,k}a_{q,l}\,\mathrm{cov}(\mathbf f_k,\mathbf f_l)}{\sigma_j\sigma_q}\\&=\frac{\sum_{k=1}^p\lambda_ka_{j,k}a_{q,k}}{\sigma_j\sigma_q}\\&=\frac{\lambda_1a_{1,j}a_{1,q}+\lambda_2a_{2,j}a_{2,q}}{\sigma_j\sigma_q}+\frac{\sum_{k\ge3}\lambda_ka_{j,k}a_{q,k}}{\sigma_j\sigma_q}\end{aligned}\]</div><p>Par Cauchy-Schwarz, le dernier terme est majoré par \(\frac{\sqrt{\sum_{k\ge3}\lambda_ka_{j,k}^2}}{\sigma_j}\times\frac{\sqrt{\sum_{k\ge3}\lambda_ka_{q,k}^2}}{\sigma_q}\), qui est proche de 0 pour des variables bien représentées sur le plan. Donc \(\mathrm{cor}(\mathbf y_q,\mathbf y_j)\approx\cos\).</p>` },
      ] },
      { t: 'Individus et Varimax', intro: '', qs: [
        { q: r`<b>4.</b> Démontrer que \(\dfrac{\|{}_i\hat{\mathbf y}\|^2}{\|{}_i\mathbf y\|^2}=\dfrac{\sum_{k=1}^Kf_{i,k}^2}{\sum_{j=1}^py_{i,j}^2}\).`, a: off + r`<div class="math">\[\|{}_i\hat{\mathbf y}\|^2={}_i\hat{\mathbf y}\;{}_i\hat{\mathbf y}^t=({}_i\mathbf F\,\mathbf A^t)(\mathbf A\,{}_i\mathbf F^t)={}_i\mathbf F\;{}_i\mathbf F^t=\sum_{k=1}^Kf_{i,k}^2\]</div><p>avec \({}_i\hat{\mathbf y}={}_i\mathbf F\,\mathbf A^t\) (reconstruction) et \(\mathbf A^t\mathbf A=\mathbf{Id}\). Le dénominateur est \(\|{}_i\mathbf y\|^2=\sum_jy_{i,j}^2\).</p>` },
        { q: r`<b>5.</b> Démontrer la qualité de représentation d'une variable après Varimax : \(\dfrac{h_{j,j}^2}{\sigma_j^2}\sum_{k=1}^KL_{j,k}^{*2}\).`, a: off + r`<p>Soit \(\mathbf e_j=(0,\dots,0,1,0,\dots,0)^t\) (1 en position \(j\)). La projection de \(\mathbf y_j\) sur les composantes tournées est</p><div class="math">\[\begin{aligned}\hat{\mathbf y}_j&=\mathbf F^*(\mathbf F^{*t}\mathbf N\mathbf F^*)^{-1}\mathbf F^{*t}\mathbf N\mathbf y_j\\&=\mathbf F^*\boldsymbol\Lambda^{*-1}\boldsymbol\Lambda^{*1/2}\mathbf T^t\boldsymbol\Lambda^{-1/2}\mathbf F^t\mathbf N\mathbf y_j\\&=\mathbf F^*\boldsymbol\Lambda^{*-1/2}\mathbf T^t\boldsymbol\Lambda^{-1/2}\mathbf A^t\mathbf Y^t\mathbf N\mathbf Y\mathbf e_j\\&=\mathbf F^*\boldsymbol\Lambda^{*-1/2}\mathbf T^t\boldsymbol\Lambda^{-1/2}\mathbf A^t\mathbf V\mathbf e_j\\&=\mathbf F^*\boldsymbol\Lambda^{*-1/2}\mathbf T^t\boldsymbol\Lambda^{-1/2}\boldsymbol\Lambda\mathbf A^t\mathbf e_j\\&=\mathbf F^*\boldsymbol\Lambda^{*-1/2}\mathbf T^t\boldsymbol\Lambda^{1/2}\mathbf A^t\mathbf e_j\\&=\mathbf F^*\boldsymbol\Lambda^{*-1/2}\mathbf L^{*t}\mathbf H\,\mathbf e_j\end{aligned}\]</div><p>donc \(\hat y_{i,j}=\sum_k\frac{h_jL_{j,k}^*}{\sqrt{\lambda_k^*}}f_{i,k}^*\) et, les composantes tournées étant non corrélées de variances \(\lambda_k^*\) :</p><div class="math">\[\mathrm{var}(\hat{\mathbf y}_j)=\sum_{k=1}^K\frac{h_j^2L_{j,k}^{*2}}{\lambda_k^*}\mathrm{var}(\mathbf f_k^*)=h_j^2\sum_{k=1}^KL_{j,k}^{*2}\]</div><p>On divise par \(\sigma_j^2\) pour obtenir la part de variance (le \(R^2\)).</p>` },
      ] },
    ],
  },
];

export { cards } from './cards.js';
