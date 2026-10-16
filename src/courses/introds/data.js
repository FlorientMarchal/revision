// Contenu du cours « Introduction à la science des données ». Identifiants fixes : la progression ne se décale pas
// si l'on ajoute du contenu.
import { lessonsStat } from './lessons-stat.js';
import { lessonsPy, quizPy } from './lessons-python.js';
import { lessonsData, quizData } from './lessons-data.js';
import { exams } from './exams.js';
import { tpVec, tpLim, rExos } from './rlabs.js';
import pylabsAll from './pylabs.json';
import { places as placesProba } from './places-proba.js';
import { places as placesLim } from './places-lim.js';
import { places as placesPy } from './places-py.js';

// Où insérer les illustrations interactives (viz-*.js) dans les leçons.
export const vizPlacements = [...placesProba, ...placesLim, ...placesPy];

const r = String.raw;
export { exams };
export const lessons = [...lessonsStat, ...lessonsPy, ...lessonsData];

export const chapters = [
  { id: 'proba', name: 'Probabilités' },
  { id: 'estim', name: 'Estimation' },
  { id: 'limites', name: 'LGN, TCL, intervalles' },
  { id: 'tests', name: 'Tests' },
  { id: 'pybase', name: 'Bases de Python' },
  { id: 'pydata', name: 'Python pour les données' },
];

/* ------------------------------------------------------------------ labos */
export const rlabs = [tpVec, tpLim, rExos];
export const rlabsLabel = 'R · TP de stat';
export const pylabs = pylabsAll;
export const pylabsLabel = 'Python · notebooks';
// Fichiers que les notebooks ouvrent par leur nom : copiés dans la session Python quand le code les cite.
const base = import.meta.env.BASE_URL + 'courses/introds/data/';
export const pyfiles = Object.fromEntries([
  'aide_test.py', 'manipulation_csv.py', 'exemple_fonctions1.py', 'exemple_fonctions2.py', 'bibliotheque.csv', 'regions_energie.csv', 'regions_energie2.csv',
  'consommation_electrique.csv', 'locations_velos.csv', 'mobilite_urbaine.csv',
].map(f => [f, base + f]));

/* ------------------------------------------------------------------ formulaire */
const F = (n, tex, note, must) => ({ n, tex, note, must });
export const formulas = [
  { ch: 'proba', t: 'Espérance, variance, covariance', items: [
    F('Variance', r`V(X)=E\big[(X-E(X))^2\big]=E(X^2)-E(X)^2`, null, true),
    F('Transformation affine', r`E(aX+b)=aE(X)+b,\qquad V(aX+b)=a^2V(X)`, null, true),
    F('Somme', r`V(X+Y)=V(X)+V(Y)+2\,\mathrm{cov}(X,Y)`, 'Si X et Y sont indépendantes, cov = 0.', true),
    F('Covariance', r`\mathrm{cov}(X,Y)=E(XY)-E(X)E(Y),\qquad \mathrm{corr}(X,Y)=\frac{\mathrm{cov}(X,Y)}{\sigma(X)\sigma(Y)}`, null, true),
    F('Probabilité conditionnelle', r`P(A\mid B)=\frac{P(A\cap B)}{P(B)}`),
    F('Probabilités totales', r`P(A)=\sum_kP(A\mid B_k)\,P(B_k)\quad(B_k\text{ partition})`),
    F('Bayes', r`P(B\mid A)=\frac{P(A\mid B)\,P(B)}{P(A)}`),
    F('Indépendance', r`P(A\cap B)=P(A)\,P(B)`),
  ] },
  { ch: 'proba', t: 'Lois discrètes', items: [
    F('Bernoulli', r`P(X=1)=p,\quad E=p,\quad V=p(1-p)`),
    F('Binomiale', r`P(X=k)=\binom nkp^k(1-p)^{n-k},\quad E=np,\quad V=np(1-p)`, null, true),
    F('Géométrique (rang du 1ᵉʳ succès)', r`P(X=k)=(1-p)^{k-1}p,\quad E=\frac1p,\quad V=\frac{1-p}{p^2}`),
    F('Poisson', r`P(X=k)=e^{-\lambda}\frac{\lambda^k}{k!},\quad E=V=\lambda`, null, true),
  ] },
  { ch: 'proba', t: 'Lois continues', items: [
    F('Uniforme', r`f(x)=\frac1{b-a}\mathbf 1_{[a,b]},\quad E=\frac{a+b}2,\quad V=\frac{(b-a)^2}{12}`),
    F('Normale', r`f(x)=\frac1{\sigma\sqrt{2\pi}}e^{-\frac{(x-\mu)^2}{2\sigma^2}},\quad E=\mu,\quad V=\sigma^2`, null, true),
    F('Exponentielle', r`f(x)=\lambda e^{-\lambda x}\mathbf 1_{x\ge0},\quad F(x)=1-e^{-\lambda x},\quad E=\frac1\lambda,\quad V=\frac1{\lambda^2}`, 'Sans mémoire : P(X > s + t | X > s) = P(X > t).', true),
    F('Gamma', r`f(x)=\frac{\lambda^a}{\Gamma(a)}x^{a-1}e^{-\lambda x},\quad E=\frac a\lambda,\quad V=\frac a{\lambda^2}`),
    F('Centrer-réduire', r`X\sim\mathcal N(\mu,\sigma^2)\Rightarrow\frac{X-\mu}\sigma\sim\mathcal N(0,1),\qquad aX+b\sim\mathcal N(a\mu+b,a^2\sigma^2)`, null, true),
  ] },
  { ch: 'proba', t: 'Sommes et vecteurs gaussiens', items: [
    F('Sommes indépendantes', r`\textstyle\sum\mathcal{B}er(p)=\mathcal B(n,p);\ \ \mathcal P(\lambda)+\mathcal P(\mu)=\mathcal P(\lambda+\mu);\ \ \sum_{i=1}^n\mathcal E(\lambda)=\Gamma(n,\lambda)`),
    F('Normales indépendantes', r`\mathcal N(\mu_1,\sigma_1^2)+\mathcal N(\mu_2,\sigma_2^2)=\mathcal N(\mu_1+\mu_2,\sigma_1^2+\sigma_2^2)`),
    F('Densité d\'un vecteur gaussien', r`f_X(x)=\frac1{(2\pi)^{d/2}\sqrt{|\Sigma|}}\exp\Big(-\frac12(x-\mu)'\Sigma^{-1}(x-\mu)\Big)`, null, true),
    F('Transformation linéaire', r`X\sim\mathcal N_d(\mu,\Sigma)\Rightarrow AX+B\sim\mathcal N(A\mu+B,\ A\Sigma A')`, null, true),
  ] },
  { ch: 'estim', t: 'Estimateurs', items: [
    F('Biais', r`B(T_n)=E(T_n)-\theta`, null, true),
    F('Risque quadratique', r`R(T_n,\theta)=E\big[(T_n-\theta)^2\big]=V(T_n)+B(T_n)^2`, null, true),
    F('Convergence', r`\forall\varepsilon\gt0,\ P(|T_n-\theta|\gt\varepsilon)\to0`, 'Sans biais (ou asymptotiquement) et V(Tₙ) → 0 ⇒ convergent.'),
    F('Moyenne empirique', r`E(\overline X_n)=\mu,\qquad V(\overline X_n)=\frac{\sigma^2}n`, null, true),
    F('Variances empiriques', r`E\Big(\frac1n\sum(X_i-\overline X)^2\Big)=\frac{n-1}n\sigma^2,\qquad \frac1{n-1}\sum(X_i-\overline X)^2\ \text{sans biais}`, null, true),
    F('Vraisemblance', r`\ell(x;\theta)=\prod_{i=1}^nf(x_i;\theta),\qquad L(x;\theta)=\sum_{i=1}^n\ln f(x_i;\theta)`, null, true),
    F('EMV', r`\hat\theta=\operatorname*{arg\,max}_\theta\ \ell(x;\theta):\quad L'(\hat\theta)=0,\ L''(\hat\theta)\lt0`),
  ] },
  { ch: 'limites', t: 'Lois limites et intervalles', items: [
    F('Loi des grands nombres', r`\overline X_n\xrightarrow{p.s.}E(X)\quad(\text{i.i.d., intégrables})`, null, true),
    F('Théorème central limite', r`\frac{\overline X_n-\mu}{\sqrt{\sigma^2/n}}\xrightarrow{loi}\mathcal N(0,1)\quad(\text{i.i.d., }\sigma^2\lt\infty)`, null, true),
    F('Quantiles N(0, 1)', r`P(|Z|\lt1{,}96)=0{,}95,\qquad P(|Z|\lt2{,}576)=0{,}99`, null, true),
    F('Dispersion d\'une moyenne', r`ID_{1-\alpha}(\overline X)=\Big[\mu_0\pm\ell_{\alpha/2}\sqrt{\sigma_0^2/n}\Big]`),
    F('Dispersion d\'une somme de Bernoulli', r`ID_{1-\alpha}(S_n)=\Big[np_0\pm\ell_{\alpha/2}\sqrt{np_0(1-p_0)}\Big]`),
    F('Confiance pour μ', r`IC_{1-\alpha}(\mu)=\Big[\overline X\pm\ell_{\alpha/2}\sqrt{\hat\sigma^2/n}\Big]`, null, true),
    F('Confiance pour p', r`IC_{1-\alpha}(p)=\Big[\overline X\pm\ell_{\alpha/2}\sqrt{\overline X(1-\overline X)/n}\Big]`, null, true),
  ] },
  { ch: 'tests', t: 'Tests', items: [
    F('Risque de 1ʳᵉ espèce', r`\alpha=P(\text{rejeter }H_0\mid H_0\text{ vraie})`, 'Rejet de H0 si p-valeur ≤ α.', true),
    F('Au moins un faux positif sur m tests', r`1-(1-\alpha)^m`),
    F('Bonferroni (FWER)', r`\text{rejeter }H_{0,i}\iff p_i\le\frac\alpha m`, null, true),
    F('Benjamini-Hochberg (FDR)', r`k=\max\Big\{i:\ p_{(i)}\le\frac{i\,\alpha}m\Big\},\ \text{rejeter }H_{0(1)},\dots,H_{0(k)}`, null, true),
    F('FDR', r`\mathrm{FDR}=E\Big[\frac{FP}{FP+TP}\Big]`),
  ] },
];

/* ------------------------------------------------------------------ flashcards */
const C = (id, ch, q, a) => ({ id: 'dsc_' + id, ch, q, a });

/* ------------------------------------------------------------------ QCM */
const Q = (id, ch, q, opts, ans, exp) => ({ id: 'dsq_' + id, ch, q, opts, ans, exp });
const quizStat = [
  Q('vpois', 'proba', 'Pour X ~ P(4), que vaut V(X) ?', ['2', '4', '16', '1/4'], 1, 'Pour une loi de Poisson, E(X) = V(X) = λ = 4.'),
  Q('geo', 'proba', 'On lance un dé jusqu\'à obtenir un 6. Loi du nombre de lancers ?', ['B(6, 1/6)', 'G(1/6)', 'P(6)', 'U(1, 6)'], 1, 'Rang du premier succès de probabilité 1/6 : loi géométrique, d\'espérance 6.'),
  Q('expo', 'proba', 'Une durée de vie exponentielle a une moyenne de 5 ans. Son paramètre λ vaut…', ['5', '1/5', '25', '1/25'], 1, 'E(X) = 1/λ = 5, donc λ = 1/5.'),
  Q('vaff', 'proba', 'V(2X + 5) vaut…', ['2V(X) + 5', '4V(X)', '4V(X) + 5', '2V(X)'], 1, 'V(aX + b) = a² V(X) : la constante ne change pas la dispersion.'),
  Q('vdiff', 'proba', 'X et Y indépendantes, V(X) = 3, V(Y) = 2. V(X − Y) vaut…', ['1', '5', '−1', '6'], 1, 'Les variances s\'ajoutent : V(X − Y) = V(X) + V(Y) = 5.'),
  Q('somme', 'proba', 'X₁, X₂, X₃ indépendantes de loi E(2). Loi de X₁ + X₂ + X₃ ?', ['E(6)', 'E(2/3)', 'Γ(3, 2)', 'N(3/2, 3/4)'], 2, 'Somme de n exponentielles indépendantes de paramètre λ : Γ(n, λ).'),
  Q('unif', 'proba', 'Variance de U(0, 1) ?', ['1/2', '1/3', '1/12', '1'], 2, '(b − a)²/12 = 1/12.'),
  Q('cov0', 'proba', 'cov(X, Y) = 0. Que peut-on en conclure ?', ['X et Y sont indépendantes', 'X et Y sont indépendantes si (X, Y) est un vecteur gaussien', 'X = Y', 'V(X + Y) = 0'], 1, 'Non corrélées n\'implique l\'indépendance que pour un vecteur gaussien.'),
  Q('bayes', 'proba', 'P(B) = 0,05, P(A ∩ B) = 0,02. P(A | B) vaut…', ['0,001', '0,02', '0,4', '0,07'], 2, 'P(A | B) = P(A ∩ B)/P(B) = 0,02/0,05 = 0,4.'),
  Q('sigma', 'proba', 'Σ = [[4, 1], [1, 1]]. La corrélation entre X et Y vaut…', ['1', '0,25', '0,5', '0,2'], 2, 'ρ = 1/(√4 × √1) = 0,5.'),
  Q('lin', 'proba', 'Z ~ N₂(0, Σ) et W = AZ. Matrice de covariance de W ?', ['AΣ', 'A\'ΣA', 'AΣA\'', 'Σ'], 2, 'AX + B ~ N(Aμ + B, AΣA\').'),
  Q('vsum', 'proba', 'Pour un vecteur gaussien T = (X, Y, Z), V(X + Y + Z) est…', ['la trace de Σ', 'la somme de tous les coefficients de Σ', 'le déterminant de Σ', 'la plus grande valeur propre de Σ'], 1, 'V(1\'T) = 1\'Σ1 : variances et deux fois chaque covariance.'),
  Q('estim', 'estim', 'Un estimateur est…', ['un nombre calculé sur l\'échantillon', 'une variable aléatoire, fonction de l\'échantillon', 'le paramètre inconnu', 'toujours sans biais'], 1, 'L\'estimation (le nombre) est la valeur de l\'estimateur sur l\'échantillon observé.'),
  Q('biais', 'estim', 'E(Tₙ) = θ + 2/n et V(Tₙ) = 2θ/n. Tₙ est…', ['sans biais', 'biaisé et non convergent', 'biaisé, asymptotiquement sans biais et convergent', 'de variance constante'], 2, 'Biais 2/n → 0 et variance → 0 : convergent.'),
  Q('rq', 'estim', 'Le risque quadratique d\'un estimateur est égal à…', ['V(Tₙ) + B(Tₙ)', 'V(Tₙ) + B(Tₙ)²', 'V(Tₙ) × B(Tₙ)', 'B(Tₙ)²'], 1, 'R = E[(Tₙ − θ)²] = V + B².'),
  Q('s2', 'estim', 'L\'espérance de (1/n) Σ (Xᵢ − X̄)² vaut…', ['σ²', '(n − 1)σ²/n', 'nσ²/(n − 1)', 'σ²/n'], 1, 'Estimateur biaisé de σ² ; on corrige en divisant par n − 1.'),
  Q('vxbar', 'estim', 'V(X̄ₙ) vaut…', ['σ²', 'σ/√n', 'σ²/n', 'nσ²'], 2, 'Par indépendance, V(X̄ₙ) = (1/n²) × nσ² = σ²/n.'),
  Q('emvp', 'estim', 'L\'EMV d\'un paramètre de Poisson, pour l\'échantillon 2, 4, 3, 7 ?', ['3', '4', '16', '1/4'], 1, 'λ̂ = x̄ = 16/4 = 4.'),
  Q('emve', 'estim', 'EMV du paramètre λ d\'une loi exponentielle ?', ['x̄', '1/x̄', 'x̄²', 'n x̄'], 1, 'L(λ) = n ln λ − λ Σ xᵢ, L\'(λ) = 0 ⇔ λ = n/Σ xᵢ.'),
  Q('log', 'estim', 'Pourquoi maximiser la log-vraisemblance plutôt que la vraisemblance ?', ['Elle donne un autre estimateur', 'Le produit devient une somme, plus facile à dériver, et le maximum est le même', 'Elle est toujours positive', 'Elle est sans biais'], 1, 'ln est strictement croissante : même argmax.'),
  Q('emvprop', 'estim', 'Un EMV est toujours…', ['sans biais', 'asymptotiquement sans biais et convergent', 'de variance nulle', 'égal à la moyenne'], 1, 'Il peut être biaisé à n fini (EMV de σ² en 1/n).'),
  Q('lgn', 'limites', 'Hypothèses de la loi forte des grands nombres ?', ['Variables gaussiennes', 'i.i.d. et intégrables', 'n > 30', 'Variance finie et loi normale'], 1, 'Pour f(x) = 1/x² sur [1, ∞[, l\'espérance est infinie : la LGN ne s\'applique pas.'),
  Q('tcl', 'limites', 'Le TCL dit que, pour n grand, (X̄ₙ − μ)/√(σ²/n)…', ['vaut 0', 'suit approximativement N(0, 1)', 'suit la loi de X', 'tend vers μ'], 1, 'Quelle que soit la loi de X, pourvu que σ² soit finie.'),
  Q('q99', 'limites', 'Le quantile utilisé pour un intervalle à 99 % est…', ['1,645', '1,96', '2,576', '3'], 2, 'P(−2,576 < Z < 2,576) = 0,99.'),
  Q('largeur', 'limites', 'Pour diviser par 2 la largeur d\'un intervalle de confiance, il faut multiplier n par…', ['2', '4', '√2', '8'], 1, 'La largeur est proportionnelle à 1/√n.'),
  Q('ic', 'limites', 'Sondage : x̄ = 0,5 sur n = 1000. IC à 95 % de p ?', ['[0,45 ; 0,55]', '[0,469 ; 0,531]', '[0,484 ; 0,516]', '[0,49 ; 0,51]'], 1, '1,96 × √(0,25/1000) ≈ 0,031.'),
  Q('disj', 'limites', 'Deux intervalles de confiance à 95 % de deux moyennes sont disjoints. On peut dire…', ['les moyennes sont égales', 'les moyennes semblent différentes', 'les échantillons sont trop petits', 'rien du tout'], 1, 'Sans prouver de causalité (corrélation ≠ causalité).'),
  Q('disp500', 'limites', 'Intervalle de dispersion à 95 % du nombre de piles en 500 lancers ?', ['[240 ; 260]', '[228 ; 272]', '[180 ; 320]', '[250 ; 272]'], 1, '250 ± 1,96 √(500 × ½ × ½) ≈ 250 ± 21,9.'),
  Q('pval', 'tests', 'p-valeur = 0,03 au seuil α = 5 %. On…', ['valide H0', 'rejette H0', 'ne rejette pas H0', 'recommence le test'], 1, 'p-valeur ≤ α : rejet de H0.'),
  Q('pval2', 'tests', 'p-valeur = 0,20. La bonne conclusion est…', ['H0 est vraie', 'on rejette H0', 'on ne peut pas rejeter H0', 'H1 est vraie'], 2, 'On ne valide jamais H0.'),
  Q('type1', 'tests', 'L\'erreur de type I consiste à…', ['ne pas rejeter H0 alors qu\'elle est fausse', 'rejeter H0 alors qu\'elle est vraie', 'choisir un mauvais test', 'mal calculer la p-valeur'], 1, 'C\'est une fausse découverte, de probabilité α.'),
  Q('m18', 'tests', 'On fait 18 tests indépendants sans aucun effet au seuil 5 %. Probabilité d\'au moins un « effet significatif » ?', ['5 %', '18 %', 'environ 60 %', '90 %'], 2, '1 − 0,95¹⁸ ≈ 0,60 : c\'est la pêche aux p-valeurs.'),
  Q('bonf', 'tests', 'Bonferroni avec m = 5 tests et α = 5 % : seuil pour chaque test ?', ['0,05', '0,25', '0,01', '0,001'], 2, 'α/m = 0,01.'),
  Q('bh', 'tests', 'p-valeurs triées 0,001 ; 0,012 ; 0,03 ; 0,2 avec α = 5 %. Combien de rejets avec BH ?', ['1', '2', '3', '4'], 2, 'Seuils kα/m : 0,0125 ; 0,025 ; 0,0375 ; 0,05. Plus grand k avec p(k) ≤ kα/m : k = 3.'),
  Q('fdr', 'tests', 'La procédure de Benjamini-Hochberg contrôle…', ['le FWER', 'le FDR', 'l\'erreur de type II', 'la puissance'], 1, 'Le taux moyen de fausses découvertes parmi les rejets (p-valeurs indépendantes).'),
  Q('shapiro', 'tests', 'Quelle fonction R teste la normalité d\'un échantillon ?', ['t.test', 'chisq.test', 'shapiro.test', 'cor.test'], 2, 'Test de Shapiro-Wilk.'),
];
export const quiz = [...quizStat, ...quizPy, ...quizData];

export * from './codesheet.js';

export { cards } from './cards.js';
