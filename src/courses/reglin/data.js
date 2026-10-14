// Contenu du cours « Modèles de régression linéaire et outils du diagnostic ».
import tp1 from './rlab-tp1.js';
import { coursEx, td2Ex, revEx } from './rlab-exos.js';
import { lessons } from './lessons.js';

export { lessons };
const r = String.raw;

export const chapters = [
  { id: 'rlm', name: 'Régression multiple & MCO' },
  { id: 'inf', name: 'Inférence gaussienne' },
  { id: 'mcg', name: 'Moindres carrés généralisés' },
  { id: 'val', name: 'Validation (TP R)' },
];

export const rlabs = [tp1, coursEx, td2Ex, revEx];

const F = (n, tex, note, must) => ({ n, tex, note, must });
export const formulas = [
  { ch: 'rlm', t: 'Le modèle', items: [
    F('Modèle (individu i)', r`Y_i=\beta_0+\beta_1x_{i1}+\dots+\beta_px_{ip}+\varepsilon_i`),
    F('Écriture matricielle', r`Y=X\beta+\varepsilon,\qquad X=(\mathbf 1,x_1,\dots,x_p)\in\mathbb R^{n\times(p+1)}`),
    F('(H1) rang plein', r`\operatorname{rang}(X)=p+1`),
    F('(H2) erreurs centrées, homoscédastiques, non corrélées', r`\mathbb E(\varepsilon)=0_n,\qquad \Sigma_\varepsilon=\sigma^2I_n`),
  ] },
  { ch: 'rlm', t: 'Moindres carrés', items: [
    F('Critère', r`\min_\beta\ \|Y-X\beta\|^2=Y^TY-2\beta^TX^TY+\beta^TX^TX\beta`),
    F('Estimateur des MCO (théorème 1)', r`\hat\beta=(X^TX)^{-1}X^TY`, 'Dérivée \\(-2X^TY+2X^TX\\beta\\) annulée : équations normales \\(X^TX\\hat\\beta=X^TY\\).', true),
    F('Sans biais et variance', r`\mathbb E(\hat\beta)=\beta,\qquad \sigma^2_{\hat\beta}=\sigma^2(X^TX)^{-1}`, 'Gauss-Markov : variance minimale parmi les estimateurs sans biais linéaires en Y.'),
    F('Projection', r`\hat Y=X\hat\beta=P_XY,\qquad P_X=X(X^TX)^{-1}X^T,\qquad \hat\varepsilon=(I_n-P_X)Y`),
    F('Estimateur sans biais de σ²', r`\hat\sigma^2=\frac{\|\hat\varepsilon\|^2}{n-p-1}=\frac{1}{n-p-1}\sum_{i=1}^n\hat\varepsilon_i^2`),
    F('Écart-type estimé d\'un coefficient', r`\hat\sigma_{\hat\beta_{j-1}}=\sqrt{\hat\sigma^2\,[(X^TX)^{-1}]_{jj}}`, 'La ligne j correspond à \\(\\beta_{j-1}\\) (ligne 1 = constante).'),
  ] },
  { ch: 'rlm', t: 'Qualité d\'ajustement', items: [
    F('Sommes des carrés', r`\mathrm{SCR}=\|Y-\hat Y\|^2,\quad \mathrm{SCE}=\|\hat Y-\bar y\mathbf 1\|^2,\quad \mathrm{SCT}=\|Y-\bar y\mathbf 1\|^2`),
    F('Décomposition', r`\mathrm{SCT}=\mathrm{SCE}+\mathrm{SCR}`),
    F('Coefficient de détermination', r`R^2=\frac{\mathrm{SCE}}{\mathrm{SCT}}=1-\frac{\mathrm{SCR}}{\mathrm{SCT}}`),
    F('R² ajusté', r`\tilde R^2=1-\frac{n-1}{n-p-1}\,\frac{\mathrm{SCR}}{\mathrm{SCT}}`),
  ] },
  { ch: 'inf', t: 'Modèle gaussien', items: [
    F('(H3) normalité', r`\varepsilon_i\sim\mathcal N(0,\sigma^2),\qquad \varepsilon\sim\mathcal N_n(0_n,\sigma^2I_n)`),
    F('Log-vraisemblance', r`\log L=-\frac n2\log\sigma^2-\frac n2\log2\pi-\frac{1}{2\sigma^2}\|y-X\beta\|^2`, 'Maximiser en β revient aux moindres carrés (théorème 2).', true),
    F('σ² du maximum de vraisemblance (biaisé)', r`\hat\sigma^2_{MV}=\frac{\|\hat\varepsilon\|^2}{n}`),
    F('Lois des estimateurs', r`\hat\beta\sim\mathcal N_{p+1}\big(\beta,\sigma^2(X^TX)^{-1}\big),\qquad \frac{(n-p-1)\hat\sigma^2}{\sigma^2}\sim\chi^2(n-p-1)`, '\\(\\hat\\beta\\) et \\(\\hat\\sigma^2\\) sont indépendants.'),
    F('Statistique de Student', r`T_{j-1}=\frac{\hat\beta_{j-1}-\beta_{j-1}}{\hat\sigma\sqrt{[(X^TX)^{-1}]_{jj}}}\sim\mathcal T(n-p-1)`),
  ] },
  { ch: 'inf', t: 'Intervalles et tests', items: [
    F('IC à 1−α d\'un coefficient', r`\hat\beta_{j-1}\mp t_{n-p-1}(1-\alpha/2)\sqrt{\hat\sigma^2[(X^TX)^{-1}]_{jj}}`),
    F('Test de Student H₀ : β = 0', r`|T_{j-1}|=\frac{|\hat\beta_{j-1}|}{\hat\sigma\sqrt{[(X^TX)^{-1}]_{jj}}}>t_{n-p-1}(1-\alpha/2)\ \Rightarrow\ \text{rejet}`),
    F('Fisher, modèle complet (β₁ = … = βₚ = 0)', r`F=\frac{\mathrm{SCE}/p}{\mathrm{SCR}/(n-p-1)}\sim\mathcal F_{p,\,n-p-1}`),
    F('Fisher, modèle réduit (q coefficients nuls)', r`F_q=\frac{(\mathrm{SCE}-\mathrm{SCE}_q)/q}{\mathrm{SCR}/(n-p-1)}=\frac{(R^2-R^2_q)/q}{(1-R^2)/(n-p-1)}\sim\mathcal F_{q,\,n-p-1}`, 'Pour q = 1 : F = T².'),
    F('Prévision et son intervalle', r`\hat y_0=v_0^T\hat\beta,\qquad \hat y_0\mp t_{n-p-1}(1-\alpha/2)\,\hat\sigma\,\sqrt{1+v_0^T(X^TX)^{-1}v_0}`, '\\(v_0=(1,x_{01},\\dots,x_{0p})^T\\).'),
  ] },
  { ch: 'mcg', t: 'Moindres carrés généralisés', items: [
    F('(H′2) erreurs corrélées', r`\Sigma_\varepsilon=\sigma^2\Omega,\quad \Omega\ \text{connue, symétrique définie positive, de rang } n`),
    F('Variance des MCO sous (H′2)', r`\sigma^2(X^TX)^{-1}X^T\Omega X(X^TX)^{-1}`, 'Toujours sans biais, mais plus de variance minimale.'),
    F('Estimateur des MCG', r`\hat\beta_{MCG}=(X^T\Omega^{-1}X)^{-1}X^T\Omega^{-1}Y`, 'Avec \\(\\Omega=PP^T\\), on multiplie le modèle par \\(P^{-1}\\).', true),
    F('Variance et σ²', r`\sigma^2_{\hat\beta_{MCG}}=\sigma^2(X^T\Omega^{-1}X)^{-1},\qquad \hat\sigma^2_{MCG}=\frac{(Y-X\hat\beta_{MCG})^T\Omega^{-1}(Y-X\hat\beta_{MCG})}{n-p-1}`),
  ] },
  { ch: 'val', t: 'Diagnostic (TP)', items: [
    F('VIF', r`\mathrm{VIF}_j=\frac{1}{1-R_j^2}`, '\\(R_j^2\\) : R² de \\(x_j\\) sur les autres covariables. Inquiétant au-delà de 5 ou 10.'),
    F('Indice de conditionnement', r`\kappa(X)=\frac{\sigma_{\max}(X)}{\sigma_{\min}(X)},\qquad \kappa(X^TX)=\frac{\lambda_{\max}}{\lambda_{\min}}=\kappa(X)^2`, 'κ(X) < 10 : rien ; 10 à 30 : modéré ; > 30 : sévère.'),
    F('R² théorique', r`R^2_{\text{th}}=\frac{\mathrm{Var}(X\beta)}{\mathrm{Var}(X\beta)+\sigma^2}`),
  ] },
];

const C = (id, ch, q, a) => ({ id: 'rc_' + id, ch, q, a });
export const cards = [
  C('def', 'rlm', 'À quoi sert la régression linéaire multiple ?', 'Expliquer les variations d\'une variable aléatoire quantitative Y par plusieurs variables explicatives (mesurer leur effet), et prédire Y à partir de leurs valeurs.'),
  C('regr', 'rlm', 'Les régresseurs sont-ils aléatoires ?', 'Non : ils sont déterministes (connus, non aléatoires). Seuls Y et ε sont aléatoires.'),
  C('X', 'rlm', 'Dimension et première colonne de X ?', 'n × (p + 1) ; la première colonne est le vecteur de 1 (la constante β₀).'),
  C('h1', 'rlm', 'Hypothèse (H1) ?', 'X est de plein rang : rang(X) = p + 1, donc XᵀX est inversible.'),
  C('h2', 'rlm', 'Hypothèse (H2) ?', 'Erreurs centrées, de même variance et non corrélées : E(ε) = 0, Σε = σ²Iₙ.'),
  C('mco', 'rlm', 'Estimateur des moindres carrés et sa preuve ?', 'β̂ = (XᵀX)⁻¹XᵀY. On dérive ‖Y − Xβ‖² = YᵀY − 2βᵀXᵀY + βᵀXᵀXβ : −2XᵀY + 2XᵀXβ = 0.'),
  C('prop', 'rlm', 'Propriétés de β̂ sous (H1)-(H2) ?', 'Sans biais ; variance σ²(XᵀX)⁻¹ ; de variance minimale parmi les estimateurs sans biais linéaires en Y (Gauss-Markov).'),
  C('proj', 'rlm', 'Interprétation géométrique de Ŷ ?', 'Ŷ = P_X Y, projection orthogonale de Y sur Vect(X), avec P_X = X(XᵀX)⁻¹Xᵀ. Les résidus sont orthogonaux à Vect(X).'),
  C('sig', 'rlm', 'Estimateur sans biais de σ² ?', 'σ̂² = ‖ε̂‖² / (n − p − 1).'),
  C('ect', 'rlm', 'Écart-type estimé de β̂ⱼ₋₁ ?', '√(σ̂² [(XᵀX)⁻¹]ⱼⱼ), avec le j-ième élément diagonal (la ligne 1 est la constante).'),
  C('sct', 'rlm', 'SCT, SCE, SCR ?', 'SCT = ‖Y − ȳ1‖², SCE = ‖Ŷ − ȳ1‖², SCR = ‖ε̂‖², et SCT = SCE + SCR.'),
  C('r2', 'rlm', 'R² et R² ajusté ?', 'R² = SCE/SCT, part de variation expliquée. R̃² = 1 − (n−1)/(n−p−1) · SCR/SCT tient compte du nombre de régresseurs.'),
  C('swiss', 'rlm', 'Exemple swiss : que montre-t-il ?', 'Quatre régressions simples ont des R² de 0,12 à 0,44 ; la régression multiple sur les 4 variables atteint un R² ajusté de 0,67.'),
  C('ex44', 'rlm', 'Exemple 4.4 : β̂ et σ̂² ?', 'β̂ = (3,2195 ; −12,0562 ; 0,5803 ; 0,6411), σ̂² = 16,8852 ; pour (1 enfant, BEU 30, NSE 50) : ŷ ≈ 40,6.'),
  C('h3', 'inf', 'Hypothèse (H3) et conséquence ?', 'εᵢ ~ N(0, σ²). Avec (H2) : erreurs indépendantes, ε ~ Nₙ(0, σ²Iₙ).'),
  C('mv', 'inf', 'Maximum de vraisemblance dans le modèle gaussien ?', 'β̂_MV = β̂ des MCO ; σ̂²_MV = ‖ε̂‖²/n est biaisé, on préfère ‖ε̂‖²/(n − p − 1).'),
  C('lois', 'inf', 'Lois de β̂ et σ̂² sous (H1)-(H3) ?', 'β̂ ~ N(β, σ²(XᵀX)⁻¹) ; (n−p−1)σ̂²/σ² ~ χ²(n−p−1) ; β̂ et σ̂² indépendants.'),
  C('t', 'inf', 'Loi de Tⱼ₋₁ et degrés de liberté ?', 'Student à n − p − 1 ddl.'),
  C('ic', 'inf', 'IC à 1 − α de βⱼ₋₁ ?', 'β̂ⱼ₋₁ ∓ t_{n−p−1}(1 − α/2) √(σ̂²[(XᵀX)⁻¹]ⱼⱼ).'),
  C('stud', 'inf', 'Test de Student de β = 0 : rejet si… ?', '|T| > t_{n−p−1}(1 − α/2), avec T = β̂/écart-type estimé.'),
  C('fc', 'inf', 'Test du modèle complet ?', 'H₀ : β₁ = … = βₚ = 0 ; F = (SCE/p)/(SCR/(n−p−1)) ~ F(p, n−p−1). Intérêt limité : rejette dès qu\'une variable est liée à Y.'),
  C('fr', 'inf', 'Test d\'un modèle réduit ?', 'F_q = [(R² − R²_q)/q] / [(1 − R²)/(n − p − 1)] ~ F(q, n − p − 1). Pour q = 1, F = T².'),
  C('prev', 'inf', 'Intervalle de prévision ?', 'ŷ₀ ∓ t_{n−p−1}(1 − α/2) σ̂ √(1 + v₀ᵀ(XᵀX)⁻¹v₀), v₀ = (1, x₀ᵀ)ᵀ, dans le domaine où la linéarité est valide.'),
  C('longley', 'inf', 'Exemple longley : conclusion des tests à 5 % ?', 'T = 4,471 ; 3,369 ; −2,391 avec t₅(97,5 %) = 2,571 : on rejette β₀ = 0 et β₁ = 0 (PNB), pas β₂ = 0 (population).'),
  C('h2p', 'mcg', 'Hypothèse (H′2) ?', 'Erreurs centrées, Σε = σ²Ω avec Ω connue, symétrique définie positive, de rang n (erreurs corrélées).'),
  C('mcosous', 'mcg', 'Que devient β̂ des MCO sous (H′2) ?', 'Toujours sans biais, mais variance σ²(XᵀX)⁻¹XᵀΩX(XᵀX)⁻¹ et plus de variance minimale.'),
  C('mcg', 'mcg', 'Estimateur des MCG ?', 'β̂_MCG = (XᵀΩ⁻¹X)⁻¹XᵀΩ⁻¹Y, sans biais, de variance σ²(XᵀΩ⁻¹X)⁻¹, de variance minimale.'),
  C('mcgp', 'mcg', 'Comment obtient-on les MCG ?', 'Ω = PPᵀ ; on multiplie le modèle par P⁻¹ : Y* = X*β + ε* vérifie les hypothèses des MCO.'),
  C('vif', 'val', 'VIF ?', 'VIFⱼ = 1/(1 − Rⱼ²), Rⱼ² = R² de xⱼ sur les autres covariables : facteur d\'inflation de la variance de β̂ⱼ. Inquiétant au-delà de 5 ou 10.'),
  C('kappa', 'val', 'Indice de conditionnement ?', 'κ(X) = σmax/σmin (valeurs singulières), κ(XᵀX) = λmax/λmin = κ(X)². κ(X) > 30 : colinéarité sévère.'),
  C('rangTP', 'val', 'Quel rang vérifier ?', 'Celui de la matrice de design [1, x] (avec la colonne de 1) : il doit valoir k + 1.'),
  C('corr', 'val', 'Corrélations deux à deux faibles : plus de colinéarité ?', 'Non : la colinéarité peut venir d\'une combinaison de plusieurs variables, d\'où le VIF et le conditionnement.'),
  C('sd', 'val', 'Piège de rnorm ?', 'rnorm prend l\'écart-type : σ² = 4 donc sd = 2.'),
  C('ic6', 'val', '6 IC à 95 % : probabilité qu\'ils contiennent tous la vraie valeur ?', 'Environ 0,95⁶ ≈ 73 % (si indépendants) : une vraie valeur hors de son IC n\'est pas anormale.'),
  C('r2th', 'val', 'R² théorique et comment l\'augmenter sans changer β ?', 'Var(Xβ)/(Var(Xβ) + σ²) ; réduire σ ou disperser davantage les x.'),
  C('resid', 'val', 'Que lire sur résidus vs valeurs prédites ?', 'Courbure : non-linéarité. Entonnoir : hétéroscédasticité. Sinon nuage sans structure autour de 0.'),
  C('ordre', 'val', 'Résidus selon l\'ordre des observations ?', 'Vérifie l\'indépendance : pas de tendance ni de regroupement.'),
  C('norm', 'val', 'Vérifier la normalité des erreurs ?', 'Histogramme et QQ-plot des résidus, test de Shapiro-Wilk (H₀ : normalité).'),
  C('somme', 'val', 'Moyenne des résidus d\'un modèle avec constante ?', 'Exactement 0.'),
];

const Q = (id, ch, q, opts, ans, exp) => ({ id: 'rq_' + id, ch, q, opts, ans, exp });
export const quiz = [
  Q('somme', 'rlm', 'La somme des résidus d\'une régression multiple avec constante vaut :', ['0', 'approximativement 0', 'parfois 0'], 0, 'TD 1 exo 4 : exactement 0, car le vecteur 1 est dans Vect(X).'),
  Q('orth', 'rlm', 'Le vecteur Ŷ est orthogonal aux résidus ε̂ :', ['oui', 'non', 'seulement si 1 fait partie des variables'], 0, 'Ŷ ∈ Vect(X) et ε̂ ⊥ Vect(X) : toujours.'),
  Q('varest', 'rlm', 'Un estimateur de la variance de β̂ vaut :', ['σ²(XᵀX)⁻¹', 'σ̂²(XᵀX)⁻¹', 'σ̂²(XXᵀ)⁻¹'], 1, 'σ² est inconnu : on le remplace par σ̂².'),
  Q('scr', 'rlm', 'Un autre estimateur que les MCO donne une SCR…', ['plus petite', 'plus grande (ou égale)', 'sans rapport'], 1, 'Les MCO minimisent justement la SCR.'),
  Q('mvq', 'inf', 'Peut-on justifier les MCO par le maximum de vraisemblance quand ε ~ N(0, σ²Iₙ) ?', ['oui', 'non', 'aucun rapport'], 0, 'Théorème 2.'),
  Q('mvdiff', 'inf', 'β̂ des MCO et β̃ du maximum de vraisemblance sont-ils différents ?', ['oui', 'non', 'pas toujours, cela dépend de la loi des erreurs'], 2, 'Identiques sous erreurs gaussiennes ; pas forcément sinon.'),
  Q('ddl', 'inf', 'n = 30 individus, p = 4 régresseurs : degrés de liberté des tests de Student ?', ['30', '26', '25', '29'], 2, 'n − p − 1 = 25.'),
  Q('sigmv', 'inf', 'σ̂²_MV = ‖ε̂‖²/n est…', ['sans biais', 'biaisé', 'de variance nulle'], 1, 'L\'estimateur sans biais divise par n − p − 1.'),
  Q('fcomp', 'inf', 'Le test de Fisher du modèle complet rejette H₀ dès que…', ['toutes les variables sont liées à Y', 'au moins une variable est liée à Y', 'le R² dépasse 0,5'], 1, 'D\'où l\'intérêt des modèles réduits.'),
  Q('q1', 'inf', 'Test d\'un modèle réduit avec q = 1 :', ['équivalent au test de Student (F = T²)', 'impossible', 'toujours plus puissant'], 0, 'Remarque du cours.'),
  Q('prevq', 'inf', 'L\'intervalle de prévision contient le terme…', ['v₀ᵀ(XᵀX)⁻¹v₀ seul', '1 + v₀ᵀ(XᵀX)⁻¹v₀', '(XᵀX)⁻¹ seul'], 1, 'Le 1 vient de la variance de la nouvelle erreur ε₀.'),
  Q('ic', 'inf', 'β̂₂ = 0,075, écart-type 0,034, 62 ddl : IC à 95 % ?', ['[0,007 ; 0,143]', '[0,041 ; 0,109]', '[−0,02 ; 0,17]'], 0, 'TD 2 exo 2 : 0,075 ∓ 1,999 × 0,034.'),
  Q('gm', 'mcg', 'Sous (H′2), l\'estimateur des MCO est…', ['biaisé', 'sans biais mais pas de variance minimale', 'de variance minimale'], 1, 'Gauss-Markov ne s\'applique plus.'),
  Q('mcgf', 'mcg', 'Estimateur des MCG :', ['(XᵀX)⁻¹XᵀY', '(XᵀΩ⁻¹X)⁻¹XᵀΩ⁻¹Y', '(XᵀΩX)⁻¹XᵀΩY'], 1, 'On blanchit les erreurs avec P⁻¹ où Ω = PPᵀ.'),
  Q('vifq', 'val', 'VIFⱼ = 1 signifie que xⱼ…', ['est inutile', 'n\'est pas corrélée aux autres covariables', 'est parfaitement colinéaire'], 1, 'Rⱼ² = 0.'),
  Q('entonnoir', 'val', 'Un graphe résidus vs prédits en entonnoir indique…', ['une non-linéarité', 'une hétéroscédasticité', 'une dépendance'], 1, 'La variance des erreurs augmente avec la valeur prédite.'),
  Q('courbe', 'val', 'Une courbure (forme en U) dans les résidus indique…', ['une non-linéarité', 'une hétéroscédasticité', 'des erreurs gaussiennes'], 0, 'Un terme non linéaire est oublié.'),
  Q('shapiro', 'val', 'Le test de Shapiro-Wilk teste…', ['H₀ : les résidus sont gaussiens', 'H₀ : les résidus sont indépendants', 'H₀ : β = 0'], 0, 'Normalité (H3).'),
  Q('kappaq', 'val', 'κ(X) = 45 :', ['pas de problème', 'colinéarité modérée', 'colinéarité sévère'], 2, 'Au-delà de 30.'),
  Q('rnorm', 'val', 'Pour simuler ε ~ N(0, 4) en R :', ['rnorm(n, 0, 4)', 'rnorm(n, 0, 2)', 'rnorm(n, 4, 0)'], 1, 'rnorm prend l\'écart-type.'),
];

// TD et exercices de révision : énoncés complets et corrections.
export const exams = [
  {
    id: 'td1', title: 'TD 1',
    head: '<p><b>TD 1 — Modèles de régression linéaire</b> (M1 MIASHS). Correction rédigée pour la révision : pas de corrigé de l\'enseignante pour ce TD.</p>',
    exos: [
      { t: 'Exercice 1 — Centre de tri postal', intro: r`<p>Enquête sur 27 employés : productivité (lettres correctement triées par minute), expérience (mois) et score d'aptitude au test d'entrée. Équation obtenue : \(\widehat{\text{Prod}}=2{,}0+0{,}5\,\text{Exp}+0{,}2\,\text{Apt}\).</p>`, qs: [
        { q: '<b>1.</b> Un employé venant juste d\'être recruté a obtenu un score d\'aptitude de 80. Quel niveau de productivité peut-on attendre de lui ?', a: r`<p>Exp = 0, Apt = 80 : \(2+0{,}5\times0+0{,}2\times80=18\) lettres par minute.</p>` },
        { q: '<b>2.</b> À quelle augmentation de sa productivité peut-on s\'attendre après avoir bénéficié de 6 mois d\'expérience ?', a: r`<p>\(0{,}5\times6=3\) lettres par minute de plus (à aptitude égale).</p>` },
        { q: r`<b>3.</b> Donner une interprétation du terme « constant » \(\hat\beta_0\) (2,0) dans l'équation de régression.`, a: r`<p>C'est la productivité prévue pour Exp = 0 et Apt = 0. Un score d'aptitude nul est hors du domaine observé : la constante ajuste le modèle mais n'a pas d'interprétation concrète ici.</p>` },
        { q: '<b>4.</b> Monsieur A a 3 mois d\'expérience de plus que Monsieur B mais son score d\'aptitude est de 20 points en dessous de celui de Monsieur B. Lequel des deux est supposé être le plus productif ?', a: r`<p>\(\text{Prod}_A-\text{Prod}_B=0{,}5\times3-0{,}2\times20=1{,}5-4=-2{,}5\) : <b>B</b>, de 2,5 lettres par minute.</p>` },
      ] },
      { t: 'Exercice 2 — Engrais et rendement en blé', intro: '<p>Sur 4 lots de terre identiques, on répand au hasard quatre doses d\'engrais et on observe le rendement en blé.</p><table class="t"><thead><tr><th>Engrais (kg/ha)</th><td>1</td><td>2</td><td>4</td><td>5</td></tr></thead><tbody><tr><th>Rendement (q/ha)</th><td>70</td><td>70</td><td>80</td><td>100</td></tr></tbody></table>', qs: [
        { q: '<b>1.</b> Indiquer quelles sont la variable à expliquer et la (ou les) variable(s) explicative(s).', a: '<p>À expliquer : le rendement. Explicative : la dose d\'engrais.</p>' },
        { q: '<b>2.</b> Estimer les paramètres du modèle de régression linéaire en utilisant le calcul matriciel (sans l\'aide d\'un logiciel).', a: r`<div class="math">\[X=\begin{pmatrix}1&1\\1&2\\1&4\\1&5\end{pmatrix},\quad X^TX=\begin{pmatrix}4&12\\12&46\end{pmatrix},\quad X^Ty=\begin{pmatrix}320\\1030\end{pmatrix}\]</div><div class="math">\[\det(X^TX)=184-144=40,\quad (X^TX)^{-1}=\frac1{40}\begin{pmatrix}46&-12\\-12&4\end{pmatrix},\quad \hat\beta=\frac1{40}\begin{pmatrix}46\times320-12\times1030\\-12\times320+4\times1030\end{pmatrix}=\begin{pmatrix}59\\7\end{pmatrix}\]</div><p>\(\hat y=59+7x\).</p>` },
        { q: '<b>3.</b> Utiliser l\'équation de régression pour prévoir le rendement si on utilise 3 kg/ha d\'engrais.', a: r`<p>\(59+7\times3=80\) q/ha.</p>` },
      ] },
      { t: 'Exercice 3 — Matrice XᵀX', intro: r`<p>On examine l'évolution de Y en fonction de deux variables explicatives x et z, sur n observations. On note \(X=(\mathbf 1\ x\ z)\).</p><div class="math">\[X^TX=\begin{pmatrix}30&0&0\\?&10&7\\?&?&15\end{pmatrix}\]</div>`, qs: [
        { q: '<b>1. (a)</b> Donner les valeurs manquantes. <b>(b)</b> Que vaut n ? <b>(c)</b> Calculer le coefficient de corrélation linéaire entre x et z.', a: r`<p>(a) \(X^TX\) est symétrique : les valeurs manquantes sont 0, 0 et 7. (b) Le coefficient (1,1) est \(\mathbf 1^T\mathbf 1=n\) : \(n=30\). (c) \(\sum x_i=\sum z_i=0\) (première ligne), donc les moyennes sont nulles et \(r=\dfrac{\sum x_iz_i}{\sqrt{\sum x_i^2\sum z_i^2}}=\dfrac{7}{\sqrt{10\times15}}\approx0{,}572\).</p>` },
        { q: r`<b>2.</b> La régression de Y sur 1, x, z donne \(y=-21+x+2z+\hat\varepsilon\), SCR \(=\|\hat\varepsilon\|^2=12\). <b>(a)</b> Déterminer \(\bar y\). <b>(b)</b> Calculer SCE, SCT et le coefficient de détermination.`, a: r`<p>(a) Avec une constante, \(\sum\hat\varepsilon_i=0\), donc \(\bar y=-21+\bar x+2\bar z=-21\).</p><p>(b) \(\mathrm{SCE}=\|\hat y-\bar y\mathbf1\|^2=\|x+2z\|^2=\sum x_i^2+4\sum x_iz_i+4\sum z_i^2=10+28+60=98\) ; \(\mathrm{SCT}=98+12=110\) ; \(R^2=98/110\approx0{,}891\).</p>` },
      ] },
      { t: 'Exercice 4 — Questions de cours', intro: '', qs: [
        { q: '<b>1.</b> La somme des résidus calculés d\'une régression multiple (avec 1 faisant partie des variables explicatives) vaut : A. 0, B. approximativement 0, C. parfois 0.', a: r`<p><b>A</b> : exactement 0, car \(\hat\varepsilon\perp\mathbf 1\).</p>` },
        { q: r`<b>2.</b> Le vecteur \(\hat Y\) est orthogonal au vecteur des résidus \(\hat\varepsilon\) : A. oui, B. non, C. seulement si 1 fait partie des variables explicatives.`, a: r`<p><b>A</b> : \(\hat Y\) est la projection orthogonale de \(Y\) sur Vect(X), toujours orthogonale aux résidus.</p>` },
        { q: r`<b>3.</b> Un estimateur de la variance de \(\hat\beta\) vaut : A. \(\sigma^2(X^TX)^{-1}\), B. \(\hat\sigma^2(X^TX)^{-1}\), C. \(\hat\sigma^2(XX^T)^{-1}\).`, a: '<p><b>B</b> (A est la variance elle-même, qui dépend de σ² inconnu).</p>' },
        { q: r`<b>4.</b> Un autre estimateur \(\tilde\beta\) que celui des moindres carrés (moindres valeurs absolues par exemple) a été calculé. La SCR obtenue est : A. plus petite, B. plus grande, C. aucun rapport.`, a: '<p><b>B</b> (ou égale) : les MCO minimisent la SCR.</p>' },
        { q: r`<b>5.</b> Peut-on justifier les moindres carrés quand \(\varepsilon\sim\mathcal N_n(0_n,\sigma^2I_n)\) via le maximum de vraisemblance ? A. oui, B. non, C. aucun rapport entre les deux méthodes.`, a: '<p><b>A</b> (théorème 2).</p>' },
        { q: r`<b>6.</b> Les estimateurs \(\hat\beta\) des MC et \(\tilde\beta\) du maximum de vraisemblance sont-ils différents ? A. oui, B. non, C. pas toujours, cela dépend de la loi des erreurs.`, a: '<p><b>C</b> : identiques si les erreurs sont gaussiennes, différents en général sinon.</p>' },
      ] },
    ],
  },
  {
    id: 'td2', title: 'TD 2',
    head: '<p><b>TD 2 — Modèles de régression linéaire</b>. Exercices 3 et 4 : correction de l\'enseignante (refaisable dans l\'onglet R). Exercices 1 et 2 : correction rédigée pour la révision.</p>',
    exos: [
      { t: 'Exercice 1 — Chiffre d\'affaires', intro: r`<p>Modèle \(Y_i=\beta_0+\beta_1x_{i1}+\beta_2x_{i2}+\varepsilon_i\), \(n=10\), \(\sum x_{i1}=30\), \(\sum x_{i2}=450\), \(\sum y_i=110\), \(\hat\beta_1=-1{,}739\), \(\hat\beta_2=0{,}0622\). Y = chiffre d'affaires hebdomadaire (milliers d'euros), \(x_1\) = nombre de concurrents dans la région, \(x_2\) = population (milliers d'habitants), sur 10 régions.</p>`, qs: [
        { q: r`<b>1.</b> Déterminer la valeur de \(\hat\beta_0\). <b>2.</b> Quelle est l'équation de régression correspondante ?`, a: r`<p>Avec une constante, le point moyen est sur l'hyperplan : \(\hat\beta_0=\bar y-\hat\beta_1\bar x_1-\hat\beta_2\bar x_2=11+1{,}739\times3-0{,}0622\times45=13{,}418\). Équation : \(\hat y=13{,}418-1{,}739\,x_1+0{,}0622\,x_2\).</p>` },
        { q: '<b>3.</b> Si le nombre de concurrents augmente de 1 dans une région, est-il exact de dire qu\'en moyenne le chiffre d\'affaires augmente de 17 390 euros, la population restant inchangée ?', a: '<p>Non : il <b>diminue</b> de 1,739 millier d\'euros, soit <b>1 739 €</b> en moyenne.</p>' },
        { q: '<b>4.</b> Quelle est l\'estimation du chiffre d\'affaires dans une région comportant 3 concurrents et 36 000 habitants ?', a: r`<p>\(13{,}418-1{,}739\times3+0{,}0622\times36=10{,}44\) milliers d'euros, soit environ 10 440 €.</p>` },
      ] },
      { t: 'Exercice 2 — Élèves infirmières', intro: r`<p>Classe de 66 élèves : \(\hat y=3{,}1+0{,}021x_1+0{,}075x_2+0{,}043x_3\), où Y = note de l'examen théorique, \(x_1\) = classement dans le secondaire (à partir du bas), \(x_2\) = note d'expression orale, \(x_3\) = mesure psychométrique du caractère. Écarts-types estimés : 0,019 ; 0,034 ; 0,018.</p>`, qs: [
        { q: r`<b>1.</b> Donner l'intervalle de confiance à 95 % pour chacun des paramètres \(\beta_j\).`, a: r`<p>\(n-p-1=66-3-1=62\) ddl, \(t_{62}(0{,}975)\approx1{,}999\).</p><ul><li>\(\beta_1\) : \(0{,}021\mp1{,}999\times0{,}019=[-0{,}017\ ;\ 0{,}059]\)</li><li>\(\beta_2\) : \(0{,}075\mp1{,}999\times0{,}034=[0{,}007\ ;\ 0{,}143]\)</li><li>\(\beta_3\) : \(0{,}043\mp1{,}999\times0{,}018=[0{,}007\ ;\ 0{,}079]\)</li></ul>` },
        { q: r`<b>2.</b> Donner la valeur \(t_j\) de la statistique du test de Student pour chacun des paramètres.`, a: r`<p>\(t_1=0{,}021/0{,}019=1{,}11\) ; \(t_2=0{,}075/0{,}034=2{,}21\) ; \(t_3=0{,}043/0{,}018=2{,}39\). À 5 %, \(\beta_2\) et \(\beta_3\) sont significatifs, pas \(\beta_1\) (seul son IC contient 0).</p>` },
        { q: '<b>3.</b> Quelle hypothèse sur la loi des erreurs faites-vous en répondant aux 2 questions précédentes ?', a: r`<p>(H3) : erreurs gaussiennes \(\mathcal N(0,\sigma^2)\), indépendantes (avec H1 et H2).</p>` },
        { q: '<b>4.</b> Quel régresseur vous semble pouvoir conduire aux conclusions statistiquement les plus sûres ?', a: r`<p>\(x_3\) (mesure psychométrique) : la plus grande statistique \(|t_3|=2{,}39\), donc la plus petite p-valeur.</p>` },
      ] },
      { t: 'Exercice 3 — Perte de voix aux élections', intro: '<p>Perte de voix du parti au pouvoir (Y) lors de 6 élections intermédiaires ; x₁ = sondages favorables au dirigeant (%) ; x₂ = modification du revenu par tête (euros) l\'année précédant l\'élection.</p><table class="t"><thead><tr><th>y</th><th>x₁</th><th>x₂</th></tr></thead><tbody><tr><td>6,3 %</td><td>35 %</td><td>−30</td></tr><tr><td>2,5</td><td>44</td><td>90</td></tr><tr><td>1,3</td><td>62</td><td>−10</td></tr><tr><td>4,9</td><td>53</td><td>−10</td></tr><tr><td>−0,8</td><td>65</td><td>50</td></tr><tr><td>1,5</td><td>47</td><td>90</td></tr></tbody></table>', qs: [
        { q: '<b>1.</b> Calculer l\'équation de la régression de Y en x₁ et x₂ en indiquant toutes les étapes (utiliser R pour les produits et l\'inversion de matrices).', a: r`<div class="math">\[X^TX=\begin{pmatrix}6&306&180\\306&16248&9240\\180&9240&19800\end{pmatrix},\quad X^Ty=\begin{pmatrix}15.7\\689.3\\69\end{pmatrix}\]</div><p>\(\hat y=12{,}1527-0{,}1710\,x_1-0{,}0272\,x_2\).</p>` },
        { q: '<b>2.</b> Estimer la perte de voix pour un sondage donnant 50 % de satisfaits et une augmentation du revenu par tête de 60 euros.', a: '<p>+1,97 %.</p>' },
        { q: '<b>3.</b> Tester la nullité des paramètres β₁ et β₂ simultanément au seuil de 5 %.', a: r`<p>SCE = 29,98, SCR = 3,465, \(F=\frac{29{,}98/2}{3{,}465/3}=12{,}98>f_{2,3}(0{,}95)=9{,}55\) : rejet de \(H_0\).</p>` },
        { q: '<b>4.</b> Donner les bornes de l\'intervalle de confiance à 90 % du paramètre β₁.', a: '<p>[−0,2708 ; −0,0712].</p>' },
      ] },
      { t: 'Exercice 4 — Retour à l\'exemple 4.4 du cours', intro: '', qs: [
        { q: '<b>1.</b> Tester l\'hypothèse β₁ = β₂ = 0.', a: r`<p>Modèle réduit à NSE seul : \(R^2_r=0{,}0617\) ; \(F=\frac{(0{,}7655-0{,}0617)/2}{(1-0{,}7655)/6}=9{,}005>f_{2,6}(0{,}95)=5{,}143\) : rejet de \(H_0\).</p>` },
        { q: '<b>2.</b> Calculer un intervalle de confiance des prévisions du sentiment de bien-être à partir des valeurs des régresseurs de la page 19 du cours.', a: r`<p>\(v_0=(1,1,30,50)\), \(\hat y_0=40{,}63\), \(t_6(0{,}975)=2{,}447\) : [27,94 ; 53,31].</p>` },
      ] },
    ],
  },
  {
    id: 'rev', title: 'Exercices de révision',
    head: '<p><b>Exercices de révision</b>. Corrections : éléments de correction de l\'enseignante (refaisables dans l\'onglet R), complétés pour les questions sans réponse détaillée.</p>',
    exos: [
      { t: 'Exercice 1', intro: r`<p>\(Y_i=\beta_0+\beta_1x_{i1}+\beta_2x_{i2}+\beta_3x_{i3}+\varepsilon_i\), les \(x_{ij}\) déterministes, \(\varepsilon\) gaussien centré de variance \(\sigma^2I_n\).</p><div class="math">\[X^TX=\begin{pmatrix}40&0&0&0\\0&20&15&4\\0&15&30&10\\0&4&10&35\end{pmatrix},\quad (X^TX)^{-1}=\frac{1}{473800}\begin{pmatrix}11845&0&0&0\\0&38000&-19400&1200\\0&-19400&27360&-5600\\0&1200&-5600&15000\end{pmatrix}\]</div><p>\(X^Ty=(100\ 50\ 40\ 80)^T\), \(\sum y_i=100\), \(\sum y_i^2=640\), somme des carrés des résidus = 113,6471.</p>`, qs: [
        { q: '<b>1.</b> Donner la valeur de n.', a: '<p>n = 40.</p>' },
        { q: '<b>2.</b> Interpréter les 0 de la matrice XᵀX.', a: r`<p>La première ligne contient \(\sum_i x_{ij}\) : ces sommes sont nulles, donc les trois variables explicatives sont <b>centrées</b>. Conséquence : \(\hat\beta_0=\bar y\), non corrélé aux autres coefficients.</p>` },
        { q: '<b>3-4.</b> Estimer β₀, …, β₃ par maximum de vraisemblance et donner un estimateur sans biais de σ², avec leurs valeurs.', a: r`<p>MV = MCO : \(\hat\beta=(X^TX)^{-1}X^Ty=(2{,}5\ ;\ 2{,}5749\ ;\ -0{,}6830\ ;\ 2{,}1866)\) ; \(\hat\sigma^2=\mathrm{SCR}/(n-p-1)=113{,}6471/36=3{,}1569\).</p>` },
        { q: '<b>5.</b> Tester la validité globale du modèle au risque α = 5 %.', a: r`<p>\(\bar y=2{,}5\), SCT \(=640-40\times2{,}5^2=390\), SCE = 276,35, \(F=\frac{276{,}35/3}{113{,}65/36}=29{,}18>f_{3,36}(0{,}95)\approx2{,}87\) : rejet de \(H_0\).</p>` },
        { q: '<b>6.</b> Construire un test de risque α = 1 % de H₀ : β₃ = 0. Que peut-on conclure ?', a: r`<p>\(T=\frac{2{,}1866}{\sqrt{3{,}1569\times15000/473800}}=6{,}917>t_{36}(0{,}995)=2{,}7195\) : rejet de \(H_0\).</p>` },
        { q: '<b>7.</b> Nouvelles valeurs x₀₁ = 1, x₀₂ = −1, x₀₃ = 0,5 : intervalle de confiance de niveau 95 % des prévisions de Y.', a: r`<p>\(v_0=(1,1,-1,0{,}5)\), \(\hat y_0=6{,}8512\), \(v_0^T(X^TX)^{-1}v_0=0{,}2671\), \(t_{36}(0{,}975)=2{,}028\) : [2,795 ; 10,907].</p>` },
      ] },
      { t: 'Exercice 2 — Profit, publicité, investissement', intro: '<p>6 entreprises de taille moyenne d\'un secteur de haute technologie (unité : 100 000 euros).</p><table class="t"><thead><tr><th>Firme</th><th>Profit</th><th>Dépense</th><th>Investissement</th></tr></thead><tbody><tr><td>1</td><td>16</td><td>4</td><td>24</td></tr><tr><td>2</td><td>17</td><td>5</td><td>1</td></tr><tr><td>3</td><td>3</td><td>3</td><td>6</td></tr><tr><td>4</td><td>4</td><td>1</td><td>26</td></tr><tr><td>5</td><td>13</td><td>2</td><td>28</td></tr><tr><td>6</td><td>2</td><td>0</td><td>18</td></tr></tbody></table><p>Régression multiple : Profit = −6,0685 + 3,9118 Dépense + 0,3178 Investissement ; écarts-types 5,5875 ; 1,135 ; 0,1893 ; R² = 0,799.</p>', qs: [
        { q: '<b>1.</b> Estimer la régression linéaire simple du profit expliqué par la dépense, uniquement par calcul matriciel.', a: r`<p>\(X^TX=\begin{pmatrix}6&15\\15&55\end{pmatrix}\), déterminant 105, \(X^Ty=(55\ ;\ 188)\), \(\hat\beta=(1{,}952\ ;\ 2{,}886)\) : Profit = 1,952 + 2,886 Dépense.</p>` },
        { q: r`<b>2.</b> Calculer le coefficient de détermination de cette régression, sachant que l'estimation sans biais de la variance des erreurs vaut 23,28.`, a: r`<p>SCR \(=23{,}28\times4=93{,}12\), SCT \(=6\times39{,}806=238{,}83\), \(R^2=1-93{,}12/238{,}83=0{,}610\).</p>` },
        { q: '<b>3.</b> Donner une interprétation de la valeur 3,9118.', a: '<p>À investissement égal, 1 unité de dépense publicitaire en plus (100 000 €) s\'accompagne en moyenne de 3,9118 unités de profit en plus (≈ 391 000 €).</p>' },
        { q: '<b>4.</b> Comparer les constantes de la régression simple et de la régression multiple, et expliquer la différence.', a: '<p>1,952 contre −6,0685. La constante est le profit prévu quand toutes les variables du modèle sont nulles : en ajoutant l\'investissement (en moyenne 17,2), son effet moyen, auparavant absorbé par la constante, passe dans le terme 0,3178 × Investissement, et la constante baisse.</p>' },
        { q: '<b>5.</b> Construire l\'intervalle de confiance à 95 % du coefficient associé à l\'investissement.', a: r`<p>\(t_3(0{,}975)=3{,}182\) : \(0{,}3178\mp3{,}182\times0{,}1893=[-0{,}285\ ;\ 0{,}920]\).</p>` },
        { q: '<b>6.</b> Mettre en œuvre le test de Fisher (α = 5 %) de la significativité du coefficient de l\'investissement et conclure.', a: r`<p>Modèle réduit = régression simple (\(R^2_q=0{,}61\)) : \(F=\frac{(0{,}799-0{,}61)/1}{(1-0{,}799)/3}=2{,}82<f_{1,3}(0{,}95)=10{,}13\) : non-rejet, cohérent avec l'IC qui contient 0.</p>` },
      ] },
      { t: 'Exercice 3 — Graphes de résidus', intro: '<p>Graphes des résidus estimés (ordonnée) en fonction de la valeur prédite (abscisse) pour 3 modèles. Le graphe permet-il de détecter une contradiction avec les hypothèses du modèle ? Si oui, laquelle, et que proposez-vous pour y pallier ?</p><img src="img/residus.webp" alt="Graphes de résidus (a), (b) et (c)" style="max-width:100%">', qs: [
        { q: '<b>(a)</b>', a: '<p>Nuage sans structure, centré sur 0, de dispersion constante : <b>aucune contradiction</b>.</p>' },
        { q: '<b>(b)</b>', a: '<p>Dispersion qui augmente avec la valeur prédite (<b>entonnoir</b>) : <b>hétéroscédasticité</b>, (H2) violée. Remède : transformer Y (log, racine carrée) ou pondérer les observations (moindres carrés pondérés ou généralisés).</p>' },
        { q: '<b>(c)</b>', a: '<p>Structure en <b>arche</b> (résidus négatifs aux extrémités, positifs au milieu) : la relation n\'est <b>pas linéaire</b>. Remède : ajouter un terme quadratique ou transformer les variables.</p>' },
      ] },
    ],
  },
];

export * from './codesheet.js';
