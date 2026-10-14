// Exercices et annales corrigés de la partie probabilités-statistique. Fiche d'exercices partie 1 : corrigé de
// l'enseignante (exercices 2 et 7 corrigés pour ce site). Évaluation 2023, TD séance 1, exercices du CM et exercice
// sur l'ECQ : énoncés des enseignantes, corrigés rédigés pour ce site (signalés comme tels).
const R = String.raw;
const Q = (q, a) => ({ q, a });
const M = tex => `<div class="math">\\[${tex}\\]</div>`;
const own = '<p class="exam-note"><b>Corrigé proposé</b>, rédigé pour ce site : il n\'a pas été relu par l\'enseignante.</p>';

export const exams = [
  /* ------------------------------------------------------------------ évaluation 2023 */
  {
    id: 'eval2023', title: 'Évaluation 1 · 2023-2024 (1h30)',
    head: '<p>Le sujet de l\'évaluation de proba-stat de 2023-2024 (TW121MI). Durée 1h30, exercices 3 et 4 sur copie séparée.</p>' + own,
    exos: [
      { t: 'Exercice 1 — Durées de vie de composants', intro: R`<p>La durée de vie des composants de la société A est multipliée par 2 par rapport à celle des composants de la société B. 40 % des composants viennent de A ; ils ont une durée de vie moyenne de 5 ans.</p>`, qs: [
        Q('1. Quelle est la loi de la durée de vie d\'un composant de A ? Préciser son paramètre.', R`<p>Une durée de vie se modélise par une loi exponentielle. \(E(T_A)=1/\lambda_A=5\), donc \(T_A\sim\mathcal E(1/5)\).</p>`),
        Q('2. Quelle est la loi de la durée de vie d\'un composant de B ? Préciser son paramètre.', R`<p>Les durées de B sont deux fois plus courtes : moyenne 2,5 ans, donc \(T_B\sim\mathcal E(2/5)\) (si \(T\sim\mathcal E(\lambda)\), \(T/2\sim\mathcal E(2\lambda)\)).</p>`),
        Q('3. Que vaut la variance de la durée de vie d\'un composant de A ? Démontrer.', R`<p>\(V(T_A)=1/\lambda_A^2=25\). Démonstration par intégrations par parties : \(E(T)=\int_0^\infty x\lambda e^{-\lambda x}dx=\frac1\lambda\), \(E(T^2)=\int_0^\infty x^2\lambda e^{-\lambda x}dx=\big[-x^2e^{-\lambda x}\big]_0^\infty+\frac2\lambda\int_0^\infty x\lambda e^{-\lambda x}dx=\frac2{\lambda^2}\), donc \(V(T)=\frac2{\lambda^2}-\frac1{\lambda^2}=\frac1{\lambda^2}\).</p>`),
        Q('4. Probabilité que la durée de vie d\'un composant de A soit inférieure à 3 ?', R`<p>\(P(T_A\lt3)=1-e^{-3/5}\approx0{,}451\).</p>`),
        Q('5. Commande R pour retrouver cette valeur.', R`<p><code>pexp(3, rate = 1/5)</code> (attention : le paramètre de R est <code>rate</code> \(=\lambda\), pas la moyenne).</p>`),
        Q('6. Pour un composant pris au hasard sur le marché, probabilité que sa durée de vie soit inférieure à 3 ?', R`<p>Probabilités totales avec la partition {A, B} : \(P(T\lt3)=0{,}4\,(1-e^{-0{,}6})+0{,}6\,(1-e^{-1{,}2})\approx0{,}4\times0{,}451+0{,}6\times0{,}699\approx0{,}600\).</p>`),
        Q('7. Six composants d\'une même société ont duré (0,78 ; 2,88 ; 5,15 ; 2,49 ; 6,80 ; 9,81). Écrire la log-vraisemblance du paramètre.', R`${M(R`\ell(\lambda)=\prod_{i=1}^6\lambda e^{-\lambda x_i}=\lambda^6e^{-\lambda\sum x_i},\qquad L(\lambda)=6\ln\lambda-\lambda\sum_{i=1}^6x_i=6\ln\lambda-27{,}91\,\lambda.`)}`),
        Q('8. Que vaut cette log-vraisemblance si les composants viennent de A ? de B ? Quelle société les a plus vraisemblablement fabriqués ?', R`<p>\(L(1/5)=6\ln0{,}2-27{,}91/5\approx-15{,}24\) ; \(L(2/5)=6\ln0{,}4-0{,}4\times27{,}91\approx-16{,}66\). La (log-)vraisemblance est plus grande pour A : c'est A qui a le plus vraisemblablement fabriqué ces composants (cohérent avec l'EMV \(\hat\lambda=6/27{,}91\approx0{,}215\), proche de 1/5).</p>`),
      ] },
      { t: 'Exercice 2 — Triplet gaussien', intro: R`<p>\(T=(X,Y,Z)\) gaussien, \(E(T)=(2,-0{,}5,0)'\), \(\Sigma=\begin{pmatrix}4&1&-2\\1&9&1{,}5\\-2&1{,}5&2\end{pmatrix}\).</p>`, qs: [
        Q('1. Que vaut cov(Y, Z) ?', R`<p>\(\mathrm{cov}(Y,Z)=\Sigma_{23}=1{,}5\).</p>`),
        Q('2. Que vaut V(Y + Z) ?', R`<p>\(V(Y+Z)=V(Y)+V(Z)+2\,\mathrm{cov}(Y,Z)=9+2+3=14\).</p>`),
        Q('3. Que vaut V(X + Y + Z) ? Détailler.', R`<p>\(V(X+Y+Z)=V(X)+V(Y)+V(Z)+2\big[\mathrm{cov}(X,Y)+\mathrm{cov}(X,Z)+\mathrm{cov}(Y,Z)\big]=4+9+2+2(1-2+1{,}5)=16\) : c'est la somme de tous les coefficients de \(\Sigma\).</p>`),
        Q('4. Expression de la densité de T en (0, 0, 0) (sans détailler |Σ| et Σ⁻¹).', R`${M(R`f_T(0,0,0)=\frac1{(2\pi)^{3/2}\sqrt{|\Sigma|}}\exp\Big(-\frac12\,\mu'\Sigma^{-1}\mu\Big),\qquad\mu=(2,-0{,}5,0)'`)}<p>(car \(x-\mu=-\mu\)). Numériquement \(|\Sigma|=19\), \(\mu'\Sigma^{-1}\mu=74/19\) et \(f_T(0,0,0)\approx0{,}0021\).</p>`),
        Q('5. Quelles sont les commandes R pour obtenir cette valeur ?', R`<p><code>library(mvtnorm)</code> ; <code>Sigma &lt;- matrix(c(4,1,-2, 1,9,1.5, -2,1.5,2), nrow = 3, byrow = TRUE)</code> ; <code>dmvnorm(c(0,0,0), mean = c(2,-0.5,0), sigma = Sigma)</code>.</p>`),
        Q('6. Si X est indépendante de Y et de Z, que devient Σ ?', R`<p>\(\mathrm{cov}(X,Y)=\mathrm{cov}(X,Z)=0\) : \(\Sigma=\begin{pmatrix}4&0&0\\0&9&1{,}5\\0&1{,}5&2\end{pmatrix}\).</p>`),
        Q('7. Quelle est la loi du couple (Y, Z) ?', R`<p>Un sous-vecteur d'un vecteur gaussien est gaussien : \((Y,Z)'\sim\mathcal N_2\Big(\begin{pmatrix}-0{,}5\\0\end{pmatrix},\begin{pmatrix}9&1{,}5\\1{,}5&2\end{pmatrix}\Big)\).</p>`),
        Q('8. Lequel des 2 graphiques représente la densité de N((0,0), [[1, 0,95], [0,95, 1]]) ? Pourquoi ?', R`<p>Le graphique de <b>droite</b> (pic étroit, maximum vers 0,5). Avec \(\rho=0{,}95\), la masse est concentrée le long de la droite \(y=x\) : \(|\Sigma|=1-0{,}95^2=0{,}0975\) et le maximum vaut \(\frac1{2\pi\sqrt{0{,}0975}}\approx0{,}51\). Le graphique de gauche, en cloche ronde de maximum \(\approx0{,}16=\frac1{2\pi}\), correspond à des variables non corrélées (\(\Sigma=I_2\)).</p>`),
      ] },
      { t: 'Exercice 3 — Maximum de vraisemblance', intro: R`<p>Soit \(a\in\mathbb R\) et \(X\) de densité \(f(x)=\frac1{\sqrt{2\pi}}e^{-\frac12(x-a)^2}\).</p>`, qs: [
        Q('1. Quelle est la loi de X ?', R`<p>\(X\sim\mathcal N(a,1)\) : loi normale d'espérance \(a\) et de variance 1.</p>`),
        Q('2. Estimateur du maximum de vraisemblance de a.', R`${M(R`L(a)=\sum_{i=1}^n\ln f(x_i)=-\frac n2\ln(2\pi)-\frac12\sum_{i=1}^n(x_i-a)^2,\quad L'(a)=\sum_{i=1}^n(x_i-a)=0\iff\hat a=\overline x,\quad L''(a)=-n\lt0.`)}<p>L'estimateur est \(\hat a=\overline X_n\).</p>`),
        Q('3. D\'après le cours, quelles sont les propriétés de cet estimateur ?', R`<p>Un EMV est asymptotiquement sans biais, asymptotiquement normal et convergent. Ici on a même mieux : \(E(\overline X_n)=a\) (sans biais), \(V(\overline X_n)=1/n\to0\) (donc convergent) et \(\overline X_n\sim\mathcal N(a,1/n)\) exactement.</p>`),
      ] },
      { t: 'Exercice 4 — Rendements de blé', intro: R`<p>\(X\) d'espérance \(\mu\) et de variance \(\sigma^2\) : rendement d'un champ de blé (tonnes/hectare).</p>`, qs: [
        Q('1. Qu\'implique le fait d\'être un échantillon (X₁, …, Xₙ) ? En théorie, et en pratique.', R`<p>En théorie : les \(X_i\) sont <b>indépendantes et de même loi</b> que \(X\). En pratique : parcelles choisies au hasard dans la même population (mêmes conditions de culture), sans influence de l'une sur l'autre (pas de parcelles voisines qui se contaminent, par exemple).</p>`),
        Q('2. Citer un estimateur convergent de μ.', R`<p>La moyenne empirique \(\overline X_n=\frac1n\sum X_i\).</p>`),
        Q('3. Démontrer que cet estimateur est convergent.', R`<p>\(E(\overline X_n)=\mu\) (linéarité) et \(V(\overline X_n)=\sigma^2/n\to0\) (indépendance). Un estimateur sans biais dont la variance tend vers 0 est convergent ; directement par Bienaymé-Tchebychev : \(P(|\overline X_n-\mu|\gt\varepsilon)\le\frac{\sigma^2}{n\varepsilon^2}\to0\).</p>`),
        Q('4. Comment calculer un intervalle de confiance à 95 % de μ ? (hypothèses, calcul, théorème)', R`<p>Hypothèses : échantillon i.i.d., et loi normale ou \(n\) grand. Théorème central limite : \(\frac{\overline X_n-\mu}{\sqrt{\sigma^2/n}}\approx\mathcal N(0,1)\). On remplace \(\sigma^2\) par son estimation \(\hat\sigma^2\) et on obtient \(IC_{95\%}(\mu)=\big[\overline x-1{,}96\sqrt{\hat\sigma^2/n}\ ;\ \overline x+1{,}96\sqrt{\hat\sigma^2/n}\big]\).</p>`),
        Q('5. Groupe 1 (près d\'une usine) : [63,1 ; 88,1], groupe 2 : [89,1 ; 119,7] (n = 10). Que conclure ?', R`<p>Les deux intervalles sont <b>disjoints</b> : les rendements moyens semblent différents, plus faibles près de l'usine. Prudence : \(n=10\) est petit (le TCL est fragile, il faut supposer les rendements gaussiens), chaque intervalle a 5 % de risque, et une différence ne prouve pas que l'usine en est la cause (sol, exposition… : corrélation n'est pas causalité). Un test de comparaison de moyennes serait l'outil adapté.</p>`),
      ] },
    ],
  },
  /* ------------------------------------------------------------------ fiche d'exercices partie 1 */
  {
    id: 'fiche1', title: 'Fiche d\'exercices · Probabilités (partie 1)',
    head: '<p>Les 12 exercices de la fiche de probabilités. Corrigé de l\'enseignante, sauf les exercices 2 et 7 (absents du corrigé), corrigés pour ce site.</p>',
    exos: [
      { t: 'Exercice 1 — Constante et fonction de répartition', intro: R`<p>\(f(x)=c(1-x^2)\) si \(-1\lt x\lt1\), 0 sinon.</p>`, qs: [
        Q('1. Quelle est la valeur de c ?', R`<p>\(f\) est une densité : \(\int_{-1}^1c(1-x^2)\,dx=c\big[x-\frac{x^3}3\big]_{-1}^1=\frac43c=1\), d'où \(c=\frac34\).</p>`),
        Q('2. Quelle est la fonction de répartition de X ?', R`<p>\(F_X(x)=0\) si \(x\le-1\) ; \(F_X(x)=\int_{-1}^x\frac34(1-t^2)\,dt=\frac12+\frac{3x}4-\frac{x^3}4\) si \(-1\lt x\lt1\) ; \(F_X(x)=1\) si \(x\ge1\).</p>`),
      ] },
      { t: 'Exercice 2 — Espérances et probabilités conditionnelles', intro: R`<p>\(f(x)=3x^2\) si \(0\lt x\le1\), 0 sinon. <i>Corrigé proposé.</i></p>`, qs: [
        Q('1. E[2X − 3]', R`<p>\(E(X)=\int_0^13x^3dx=\frac34\), donc \(E(2X-3)=2\times\frac34-3=-1{,}5\).</p>`),
        Q('2. E[(X + 4)²]', R`<p>\(E(X^2)=\int_0^13x^4dx=\frac35\). \(E\big[(X+4)^2\big]=E(X^2)+8E(X)+16=0{,}6+6+16=22{,}6\).</p>`),
        Q('3. P[X > 0,4 | 0,2 ≤ X < 0,5]', R`<p>\(F(x)=x^3\) sur \([0,1]\). \(P(X\gt0{,}4\mid0{,}2\le X\lt0{,}5)=\dfrac{P(0{,}4\lt X\lt0{,}5)}{P(0{,}2\le X\lt0{,}5)}=\dfrac{0{,}125-0{,}064}{0{,}125-0{,}008}=\dfrac{0{,}061}{0{,}117}\approx0{,}521\).</p>`),
        Q('4. P[X + 0,1 > 0,4 | X < 0,5]', R`<p>\(P(X\gt0{,}3\mid X\lt0{,}5)=\dfrac{P(0{,}3\lt X\lt0{,}5)}{P(X\lt0{,}5)}=\dfrac{0{,}125-0{,}027}{0{,}125}=0{,}784\).</p>`),
      ] },
      { t: 'Exercice 3 — Première victoire', intro: '<p>L\'équipe A gagne chaque match avec probabilité 0,6, indépendamment. X = nombre de matchs joués jusqu\'à la première victoire de A (incluse).</p>', qs: [
        Q('1. Quelle est la loi de X ?', R`<p>On compte les essais jusqu'au premier succès : \(X\sim\mathcal G(0{,}6)\) sur \(\{1,2,\dots\}\), avec \(P(X=k)=0{,}4^{k-1}\times0{,}6\).</p>`),
        Q('2. Calculer P(X = k) pour k = 1, …, 5.', R`<p>0,6 ; 0,24 ; 0,096 ; 0,0384 ; 0,01536.</p>`),
        Q('3. Espérance du nombre de matchs nécessaires ?', R`<p>\(E(X)=1/p=1/0{,}6=5/3\approx1{,}67\).</p>`),
      ] },
      { t: 'Exercice 4 — Durée de vie d\'un composant', intro: R`<p>\(f(x)=\frac{10}{x^2}\) si \(x\gt10\), 0 sinon.</p>`, qs: [
        Q('1. Trouver P[X > 20].', R`<p>\(\int_{20}^{+\infty}\frac{10}{x^2}dx=\big[-\frac{10}x\big]_{20}^{+\infty}=\frac12\).</p>`),
        Q('2. Fonction de répartition de X ?', R`<p>\(F_X(x)=0\) si \(x\le10\), \(F_X(x)=\int_{10}^x\frac{10}{t^2}dt=1-\frac{10}x\) si \(x\gt10\).</p>`),
        Q('3. Probabilité que, parmi 6 composants, au moins 3 fonctionnent au moins 15 heures ? Hypothèses ?', R`<p>Pour un composant, \(p=P(X\ge15)=1-F(15)=\frac{10}{15}=\frac23\). On suppose les 6 durées <b>indépendantes et de même loi</b> : le nombre \(N\) de composants qui durent au moins 15 h suit \(\mathcal B(6,2/3)\). \(P(N\ge3)=1-\sum_{k=0}^2\binom6k\big(\frac23\big)^k\big(\frac13\big)^{6-k}=1-\frac{1+12+60}{729}=\frac{656}{729}\approx0{,}8999\).</p>`),
      ] },
      { t: 'Exercice 5 — Temps de réparation', intro: '<p>Loi exponentielle, réparation moyenne d\'une demi-heure.</p>', qs: [
        Q('1. Fonction de répartition F(x) pour tout x réel.', R`<p>\(E(X)=1/\lambda=1/2\) donc \(\lambda=2\) : \(F(x)=0\) si \(x\lt0\), \(F(x)=1-e^{-2x}\) si \(x\ge0\).</p>`),
        Q('2. Probabilité que la réparation dure plus d\'une heure ?', R`<p>\(P(X\gt1)=e^{-2}\approx0{,}1353\).</p>`),
        Q('3. Sachant qu\'elle a déjà duré 45 min, probabilité qu\'elle finisse dans les 15 minutes suivantes ?', R`<p>On cherche \(P(X\le1\mid X\gt0{,}75)\). Par absence de mémoire, \(P(X\gt1\mid X\gt0{,}75)=P(X\gt0{,}25)=e^{-1/2}\), donc \(P(X\le1\mid X\gt0{,}75)=1-e^{-1/2}\approx0{,}3935\).</p>`),
        Q('4. Y = nombre de réparations de plus d\'une heure parmi 3 réparations indépendantes. Loi de Y ? P(Y = 2) ?', R`<p>Chaque réparation dure plus d'une heure avec probabilité \(p=e^{-2}\), indépendamment : \(Y\sim\mathcal B(3,e^{-2})\). \(P(Y=2)=\binom32(e^{-2})^2(1-e^{-2})=3e^{-4}(1-e^{-2})\approx0{,}0475\).</p>`),
      ] },
      { t: 'Exercice 6 — Accidents', intro: '<p>En moyenne 3 accidents par jour sur une autoroute.</p>', qs: [
        Q('1. Trouver la loi de X.', R`<p>Comptage d'événements sur une durée fixe, moyenne 3 : sous l'hypothèse usuelle d'un processus de Poisson, \(X\sim\mathcal P(3)\), \(P(X=k)=e^{-3}\frac{3^k}{k!}\).</p>`),
        Q('2. Probabilité de 3 accidents ou plus un jour donné ?', R`<p>\(P(X\ge3)=1-e^{-3}\big(1+3+\frac{3^2}{2!}\big)=1-\frac{17}2e^{-3}\approx0{,}5768\).</p>`),
        Q('3. Même question sachant qu\'au moins un accident a eu lieu.', R`<p>\(\{X\ge3\}\subset\{X\ge1\}\) donc \(P(X\ge3\mid X\ge1)=\frac{P(X\ge3)}{P(X\ge1)}=\frac{1-\frac{17}2e^{-3}}{1-e^{-3}}\approx0{,}6070\).</p>`),
      ] },
      { t: 'Exercice 7 — Documents', intro: '<p>50 % des documents en Word, 30 % en LaTeX, 20 % en HTML ; 40 % des Word, 20 % des LaTeX et 20 % des HTML dépassent 10 pages. <i>Corrigé proposé.</i></p>', qs: [
        Q('Proportion de documents de plus de 10 pages ?', R`<p>Probabilités totales sur la partition {Word, LaTeX, HTML} : \(P(D)=0{,}5\times0{,}4+0{,}3\times0{,}2+0{,}2\times0{,}2=0{,}30\), soit 30 %.</p>`),
      ] },
      { t: 'Exercice 8 — Ville et vélo', intro: '<p>52 % des élèves habitent en ville, 5 % viennent à vélo, 2 % les deux.</p>', qs: [
        Q('1. Habite en ville sachant qu\'il vient à vélo ?', R`<p>\(P(V\mid B)=\frac{P(V\cap B)}{P(B)}=\frac{0{,}02}{0{,}05}=0{,}4\).</p>`),
        Q('2. Vient à vélo sachant qu\'il habite en ville ?', R`<p>\(P(B\mid V)=\frac{0{,}02}{0{,}52}=\frac1{26}\approx0{,}0385\).</p>`),
      ] },
      { t: 'Exercice 9 — Corrélation taille-poids', intro: '<p>Tableau des effectifs de 1000 individus groupés par classes de taille et de poids.</p>', qs: [
        Q('Déterminer le coefficient de corrélation avec R.', R`<p>On approxime chaque classe par son centre (tailles 162,5 … 197,5 ; poids 67,5 … 97,5), on reconstruit les 1000 couples avec les effectifs du tableau (<code>rep</code>) puis <code>cor(T, P)</code> : \(r\approx0{,}6013\). Corrélation linéaire positive modérée entre taille et poids. Le code est dans l'onglet R (« Exercices en R »).</p>`),
      ] },
      { t: 'Exercice 10 — Non corrélées mais dépendantes', intro: '<p>X et Y indépendantes de loi de Bernoulli de paramètre 1/2.</p>', qs: [
        Q('Montrer que X + Y et X − Y sont dépendantes mais non corrélées.', R`<p>\(U=X+Y\), \(V=X-Y\). \(\mathrm{cov}(U,V)=V(X)-V(Y)=0\) (même variance) : non corrélées. Mais \(P(U=0,V=0)=P(X=0,Y=0)=\frac14\), alors que \(P(U=0)=\frac14\) et \(P(V=0)=P(X=Y)=\frac12\), donc \(P(U=0)P(V=0)=\frac18\ne\frac14\) : dépendantes.</p>`),
      ] },
      { t: 'Exercice 11 — Vecteur gaussien', intro: R`<p>\((X,Y)'\) gaussien centré, \(E(X^2)=4\), \(E(Y^2)=1\), et \(2X+Y\), \(X-3Y\) indépendantes.</p>`, qs: [
        Q('1. Cov(2X + Y, X − 3Y) ?', R`<p>Variables indépendantes : covariance nulle.</p>`),
        Q('2. En déduire Cov(X, Y).', R`<p>Centré : \(V(X)=4\), \(V(Y)=1\). \(0=2V(X)-6\,\mathrm{cov}(X,Y)+\mathrm{cov}(Y,X)-3V(Y)=8-5\,\mathrm{cov}(X,Y)-3\), d'où \(\mathrm{cov}(X,Y)=1\).</p>`),
        Q('3. Matrice de covariance de (X, Y).', R`<p>\(\Sigma=\begin{pmatrix}4&1\\1&1\end{pmatrix}\).</p>`),
        Q('4. Montrer que (X + Y, 2X − Y) est gaussien et donner sa matrice de covariance.', R`<p>\(W=AZ\) avec \(A=\begin{pmatrix}1&1\\2&-1\end{pmatrix}\) : transformation linéaire d'un vecteur gaussien, donc gaussien, centré, de covariance \(A\Sigma A'=\begin{pmatrix}7&8\\8&13\end{pmatrix}\).</p>`),
      ] },
      { t: 'Exercice 12 — Somme de trois normales', intro: '<p>X, Y, Z indépendantes de loi N(0, 1).</p>', qs: [
        Q('1. Loi de T = X + Y + Z ?', R`<p>Somme de normales indépendantes : \(T\sim\mathcal N(0,3)\).</p>`),
        Q('2. Montrer que (T, X − Y) est gaussien ; espérance et covariance ?', R`<p>\((T,X-Y)'=\begin{pmatrix}1&1&1\\1&-1&0\end{pmatrix}(X,Y,Z)'\) : transformation linéaire d'un vecteur gaussien, donc gaussien, d'espérance \((0,0)'\). \(V(T)=3\), \(V(X-Y)=2\), \(\mathrm{cov}(T,X-Y)=1-1=0\) : \(\Sigma=\begin{pmatrix}3&0\\0&2\end{pmatrix}\).</p>`),
        Q('3. En déduire que T est indépendante de X − Y, Y − Z et Z − X.', R`<p>Pour un vecteur gaussien, covariance nulle ⇒ indépendance : \(T\perp(X-Y)\). De même \(\mathrm{cov}(T,Y-Z)=1-1=0\) et \(\mathrm{cov}(T,Z-X)=1-1=0\), avec des couples gaussiens : \(T\) est indépendante de \(X-Y\), \(Y-Z\) et \(Z-X\).</p>`),
      ] },
    ],
  },
  /* ------------------------------------------------------------------ exercices du cours de probabilités */
  {
    id: 'coursproba', title: 'Exercices du cours de probabilités',
    head: '<p>Les quatre exercices de fin du cours de probabilités (partie 1).</p>' + own,
    exos: [
      { t: 'Exercice 1 — Requêtes sur un serveur', intro: R`<p>\(X\) = nombre de demandes par minute, \(X\sim\mathcal P(3)\).</p>`, qs: [
        Q('1. E(X) et V(X).', R`<p>\(E(X)=V(X)=3\).</p>`),
        Q('2. P(X = 2).', R`<p>\(e^{-3}\frac{3^2}{2}=4{,}5e^{-3}\approx0{,}224\).</p>`),
        Q('3. P(X ≤ 2).', R`<p>\(e^{-3}(1+3+4{,}5)=8{,}5e^{-3}\approx0{,}423\).</p>`),
        Q('4. P(X ≥ 1).', R`<p>\(1-e^{-3}\approx0{,}950\).</p>`),
        Q('5. Sur deux minutes indépendantes, loi du nombre total de demandes ?', R`<p>Somme de deux Poisson indépendantes : \(\mathcal P(6)\).</p>`),
        Q('6. Sur 100 heures, moyenne observée 3,1 mais variance 12,4. Qu\'en penser ?', R`<p>Pour une loi de Poisson, espérance = variance. Ici la variance est 4 fois la moyenne : les données sont sur-dispersées, le modèle de Poisson n'est pas adapté (demandes non indépendantes, intensité variable selon l'heure…).</p>`),
      ] },
      { t: 'Exercice 2 — Effet secondaire', intro: '<p>Probabilité 0,2 d\'effet secondaire, 10 patients indépendants, X = nombre de patients avec l\'effet.</p>', qs: [
        Q('1. Loi de X ?', R`<p>\(X\sim\mathcal B(10;0{,}2)\).</p>`),
        Q('2. P(X = 2).', R`<p>\(\binom{10}2\,0{,}2^2\,0{,}8^8=45\times0{,}04\times0{,}1678\approx0{,}302\).</p>`),
        Q('3. P(X ≥ 1).', R`<p>\(1-0{,}8^{10}\approx0{,}893\).</p>`),
        Q('4. E(X) et V(X).', R`<p>\(E(X)=np=2\), \(V(X)=np(1-p)=1{,}6\).</p>`),
      ] },
      { t: 'Exercice 3 — Temps entre deux événements', intro: R`<p>\(T\sim\mathcal E(2)\) (en heures).</p>`, qs: [
        Q('1. E(T) et V(T).', R`<p>\(E(T)=1/2\) h, \(V(T)=1/4\).</p>`),
        Q('2. P(T > 1).', R`<p>\(e^{-2}\approx0{,}135\).</p>`),
        Q('3. P(0,5 < T < 1).', R`<p>\(F(1)-F(0{,}5)=e^{-1}-e^{-2}\approx0{,}233\).</p>`),
        Q('4. Loi de S = T₁ + T₂ + T₃ (indépendantes, de même loi que T) ?', R`<p>Somme de 3 exponentielles indépendantes de même paramètre : \(S\sim\Gamma(3,2)\), \(E(S)=3/2\), \(V(S)=3/4\).</p>`),
        Q('5. Que représente S ?', R`<p>Le temps d'attente jusqu'au 3ᵉ événement.</p>`),
      ] },
      { t: 'Exercice 4 — Loi normale', intro: R`<p>\(X\sim\mathcal N(100,15^2)\).</p>`, qs: [
        Q('1. P(X < 115).', R`<p>\(P\big(Z\lt\frac{115-100}{15}\big)=P(Z\lt1)\approx0{,}841\) (<code>pnorm(115, 100, 15)</code>).</p>`),
        Q('2. P(85 < X < 115).', R`<p>\(P(-1\lt Z\lt1)=2\times0{,}841-1\approx0{,}683\).</p>`),
        Q('3. Y = 2X + 5 : loi de Y ?', R`<p>\(Y\sim\mathcal N(2\times100+5,\ 2^2\times15^2)=\mathcal N(205,900)\), soit un écart-type de 30.</p>`),
      ] },
    ],
  },
  /* ------------------------------------------------------------------ TD séance 1 */
  {
    id: 'td1', title: 'TD séance 1 · Maximum de vraisemblance',
    head: '<p>Séance 1 de statistique : estimateur du maximum de vraisemblance (EMV) et propriétés des estimateurs.</p>' + own,
    exos: [
      { t: 'Exercice 1', intro: R`<p>\(f(x;\theta)=\frac{\sqrt\theta}{\sqrt{2\pi}}e^{-\frac12\theta x^2}\) (c'est la loi \(\mathcal N(0,1/\theta)\)).</p>`, qs: [
        Q('1. Vraisemblance de l\'échantillon.', R`${M(R`\mathcal L(x_1,\dots,x_n;\theta)=\prod_{i=1}^n\frac{\sqrt\theta}{\sqrt{2\pi}}e^{-\frac12\theta x_i^2}=\Big(\frac\theta{2\pi}\Big)^{n/2}\exp\Big(-\frac\theta2\sum_{i=1}^nx_i^2\Big)`)}`),
        Q('2. Estimateur de θ par maximum de vraisemblance.', R`<p>\(L(\theta)=\frac n2\ln\theta-\frac n2\ln(2\pi)-\frac\theta2\sum x_i^2\) ; \(L'(\theta)=\frac n{2\theta}-\frac12\sum x_i^2=0\iff\hat\theta=\dfrac n{\sum_ix_i^2}\) ; \(L''(\theta)=-\frac n{2\theta^2}\lt0\) : maximum.</p>`),
      ] },
      { t: 'Exercice 2', intro: R`<p>\(E(X)=1/\lambda\), \(V(X)=1/\lambda^2\), vraisemblance \(\prod_{i=1}^n\lambda e^{-\lambda x_i}\).</p>`, qs: [
        Q('1. Quelle est la loi de X ?', R`<p>La loi exponentielle \(\mathcal E(\lambda)\), de densité \(\lambda e^{-\lambda x}\) sur \(\mathbb R_+\).</p>`),
        Q('2. EMV de λ.', R`<p>\(L(\lambda)=n\ln\lambda-\lambda\sum x_i\), \(L'(\lambda)=\frac n\lambda-\sum x_i=0\iff\hat\lambda=\frac n{\sum x_i}=\frac1{\overline x}\), \(L''=-\frac n{\lambda^2}\lt0\).</p>`),
        Q('3. Propriétés de cet estimateur (justifier par le calcul).', R`<p>\(\sum X_i\sim\Gamma(n,\lambda)\) et, pour \(n\ge2\), \(E\big(1/\sum X_i\big)=\frac\lambda{n-1}\). Donc \(E(\hat\lambda)=\frac{n}{n-1}\lambda\) : <b>biaisé</b>, mais <b>asymptotiquement sans biais</b> (biais \(\frac\lambda{n-1}\to0\)). Pour \(n\ge3\), \(V(\hat\lambda)=\frac{n^2\lambda^2}{(n-1)^2(n-2)}\to0\) : l'estimateur est <b>convergent</b>. On retrouve les propriétés générales de l'EMV (asymptotiquement sans biais, convergent, asymptotiquement normal) ; l'estimateur corrigé \(\frac{n-1}{\sum X_i}\) est sans biais.</p>`),
        Q('4. Observations 1,11 ; 1,66 ; 3,21 ; 2,02 : estimations de E(X) et V(X).', R`<p>\(\overline x=2\) estime \(E(X)\). \(\hat\lambda=1/\overline x=0{,}5\), d'où \(V(X)=1/\lambda^2\) estimée par 4 (en utilisant le modèle). La variance empirique sans biais vaut, elle, environ 0,79 : avec 4 observations, les estimations sont très imprécises.</p>`),
      ] },
      { t: 'Exercice 3', intro: R`<p>\(\theta\in\big]\frac12;1\big[\), \(f(x)=\frac\theta{1-\theta}x^{\frac{2\theta-1}{1-\theta}}\) sur \([0;1]\).</p>`, qs: [
        Q('1. Vraisemblance de l\'échantillon.', R`${M(R`\mathcal L(x;\theta)=\Big(\frac\theta{1-\theta}\Big)^n\prod_{i=1}^nx_i^{\frac{2\theta-1}{1-\theta}},\qquad L(\theta)=n\ln\theta-n\ln(1-\theta)+\frac{2\theta-1}{1-\theta}\sum_{i=1}^n\ln x_i.`)}`),
        Q('2. EMV de θ.', R`<p>\(\frac{d}{d\theta}\frac{2\theta-1}{1-\theta}=\frac{2(1-\theta)+(2\theta-1)}{(1-\theta)^2}=\frac1{(1-\theta)^2}\). Avec \(S=\sum\ln x_i\lt0\) : \(L'(\theta)=\frac n\theta+\frac n{1-\theta}+\frac S{(1-\theta)^2}=\frac n{\theta(1-\theta)}+\frac S{(1-\theta)^2}\). \(L'(\theta)=0\iff n(1-\theta)+\theta S=0\iff\hat\theta=\dfrac n{n-\sum_i\ln x_i}=\dfrac1{1-\overline{\ln x}}\). On vérifie que \(L''(\hat\theta)\lt0\) (maximum), et \(\hat\theta\in\,]\frac12;1[\) dès que \(-\overline{\ln x}\lt1\).</p>`),
      ] },
      { t: 'Exercice 4 — Trois modèles', intro: '<p>Modèles binomial {B(m, p)} (m connu), de Poisson {P(λ)} et de Cauchy {f(x ; θ) = 1/(π(1 + (x − θ)²))}. Échantillon x₁, …, xₙ.</p>', qs: [
        Q('Binomial : densité, vraisemblance, EMV.', R`<p>\(f(x;p)=\binom mxp^x(1-p)^{m-x}\). \(\mathcal L=\prod\binom m{x_i}\,p^{\sum x_i}(1-p)^{nm-\sum x_i}\). \(L'(p)=\frac{\sum x_i}p-\frac{nm-\sum x_i}{1-p}=0\iff\hat p=\frac{\sum x_i}{nm}=\frac{\overline x}m\).</p>`),
        Q('Poisson : densité, vraisemblance, EMV.', R`<p>\(f(x;\lambda)=e^{-\lambda}\frac{\lambda^x}{x!}\), \(\mathcal L=\frac{\lambda^{\sum x_i}e^{-n\lambda}}{\prod x_i!}\), \(\hat\lambda=\overline x\).</p>`),
        Q('Cauchy : densité, vraisemblance, EMV.', R`<p>\(\mathcal L=\prod\frac1{\pi(1+(x_i-\theta)^2)}\), \(L(\theta)=-n\ln\pi-\sum\ln\big(1+(x_i-\theta)^2\big)\). L'équation \(L'(\theta)=\sum\frac{2(x_i-\theta)}{1+(x_i-\theta)^2}=0\) n'a <b>pas de solution explicite</b> et peut avoir plusieurs racines : on maximise numériquement (par exemple avec <code>optimize</code> en R). La loi de Cauchy n'a pas d'espérance : la moyenne \(\overline x\) n'est pas un bon estimateur de \(\theta\) (la médiane, si).</p>`),
      ] },
    ],
  },
  /* ------------------------------------------------------------------ exercices du CM de statistique */
  {
    id: 'cmstat', title: 'Exercices du CM de statistique',
    head: '<p>Les exercices posés dans le cours de statistique (estimateurs, vraisemblance, intervalles) et l\'exercice de comparaison des risques quadratiques. Exercice ECQ : à partir des éléments de correction manuscrits de l\'enseignante.</p>' + own,
    exos: [
      { t: 'Exercice 1 — Choisir un estimateur', intro: R`<p>\(E(T_1)=\theta+2,\ V(T_1)=\frac{2\theta}n\) ; \(E(T_2)=\theta+\frac2n,\ V(T_2)=\frac{2\theta}n\) ; \(E(T_3)=\theta,\ V(T_3)=2\).</p>`, qs: [
        Q('Propriétés de ces estimateurs ? Lequel garder ?', R`<p>\(T_1\) : biaisé (biais 2, qui ne tend pas vers 0), variance → 0, non convergent. \(T_2\) : biaisé mais asymptotiquement sans biais, variance → 0 : convergent. \(T_3\) : sans biais mais variance constante 2 (risque quadratique 2 qui ne tend pas vers 0). On garde \(T_2\) : son risque quadratique \(\frac{2\theta}n+\frac4{n^2}\to0\).</p>`),
      ] },
      { t: 'Exercice 2 — Loi normale de variance 1', intro: R`<p>Échantillon de taille 20 de \(\mathcal N(\mu,1)\).</p>`, qs: [
        Q('1. Vraisemblance.', R`<p>\(\ell=\prod_{i=1}^{20}\frac1{\sqrt{2\pi}}e^{-\frac12(x_i-\mu)^2}=(2\pi)^{-10}\exp\big(-\frac12\sum(x_i-\mu)^2\big)\).</p>`),
        Q('2. EMV de μ.', R`<p>\(L'(\mu)=\sum(x_i-\mu)=0\iff\hat\mu=\overline x\), \(L''=-20\lt0\).</p>`),
      ] },
      { t: 'Exercice 3 — Loi de Poisson', intro: R`<p>\(X\sim\mathcal P(\lambda)\), \(P(X=k)=\frac{\lambda^k}{k!}e^{-\lambda}\).</p>`, qs: [
        Q('1-2. Vraisemblance et log-vraisemblance.', R`<p>\(\ell=\frac{\lambda^{\sum x_i}e^{-n\lambda}}{\prod x_i!}\) ; \(L=\big(\sum x_i\big)\ln\lambda-n\lambda-\sum\ln(x_i!)\).</p>`),
        Q('3. EMV de λ.', R`<p>\(L'=\frac{\sum x_i}\lambda-n=0\iff\hat\lambda=\overline x\), \(L''=-\frac{\sum x_i}{\lambda^2}\lt0\).</p>`),
        Q('4. Sans biais ? Variance asymptotiquement nulle ?', R`<p>\(E(\overline X)=\lambda\) : sans biais. \(V(\overline X)=\frac\lambda n\to0\). Donc convergent.</p>`),
        Q('5. Observations 3 1 1 1 6 4 2 3 1 5 5 2 7 4 3 : estimation ponctuelle de λ.', R`<p>\(\hat\lambda=48/15=3{,}2\).</p>`),
      ] },
      { t: 'Exercice 4 — Intervalle de dispersion d\'une fréquence', intro: R`<p>Observations de Bernoulli de paramètre \(p_0\) connu.</p>`, qs: [
        Q('Intervalle de dispersion de la fréquence ?', R`<p>Par le TCL, \(\frac{S_n/n-p_0}{\sqrt{p_0(1-p_0)/n}}\approx\mathcal N(0,1)\), donc \(ID_{1-\alpha}(S_n/n)=\Big[p_0-\ell_{\alpha/2}\sqrt{\frac{p_0(1-p_0)}n}\ ;\ p_0+\ell_{\alpha/2}\sqrt{\frac{p_0(1-p_0)}n}\Big]\).</p>`),
      ] },
      { t: 'Exercice 5 — Arrondi en supermarché', intro: '<p>{0,00 ; 0,01 ; 0,02} → 0,00 ; {0,08 ; 0,09} → 0,10 ; {0,03 ; … ; 0,07} → 0,05. A = résultat de l\'arrondi, de −2 à 2 centimes. Vente de 20 000 produits.</p>', qs: [
        Q('1. Pourquoi la loi de A est-elle uniforme ?', R`<p>En supposant le dernier chiffre uniforme sur 0, …, 9 : chaque valeur de l'arrondi correspond à 2 chiffres (0 : chiffres 0 et 5 ; ±1 : 1, 6 et 4, 9 ; ±2 : 2, 7 et 3, 8), donc \(P(A=a)=\frac15\) pour \(a\in\{-2,-1,0,1,2\}\).</p>`),
        Q('2. Espérance, variance, écart-type (en euros).', R`<p>\(E(A)=0\), \(V(A)=\frac{4+1+0+1+4}5=2\) cts² \(=2\times10^{-4}\) €², \(\sigma\approx1{,}41\) ct \(\approx0{,}0141\) €.</p>`),
        Q('3. Même question pour le résultat après 20 000 produits.', R`<p>Somme de 20 000 arrondis indépendants : \(E=0\), \(V=40\,000\) cts² \(=4\) €², \(\sigma=2\) €.</p>`),
        Q('4. Intervalle de dispersion du résultat après 20 000 produits.', R`<p>Par le TCL, à 95 % : \([0-1{,}96\times2\ ;\ 0+1{,}96\times2]\approx[-3{,}92\ ;\ 3{,}92]\) euros. Le supermarché ne gagne ni ne perd en moyenne, et l'écart reste de quelques euros.</p>`),
      ] },
      { t: 'Exercice 6 — Sondage', intro: '<p>Sondage auprès de 98 personnes : 42 votent pour A. Arrondir au millième.</p>', qs: [
        Q('1. Intervalle de confiance de p au niveau 0,95.', R`<p>\(\hat p=42/98\approx0{,}429\). \(IC=\big[0{,}429\pm1{,}96\sqrt{\frac{0{,}429\times0{,}571}{98}}\big]\approx[0{,}331\ ;\ 0{,}527]\).</p>`),
        Q('2. A est élu s\'il a plus de 50 % des voix. Est-il possible qu\'il soit élu ?', R`<p>Oui : 0,5 appartient à l'intervalle de confiance, on ne peut pas exclure \(p\gt0{,}5\).</p>`),
        Q('3. Nouveau sondage : 565 sur 1000. Est-il possible que A ne soit pas élu ?', R`<p>\(IC\approx\big[0{,}565\pm1{,}96\sqrt{\frac{0{,}565\times0{,}435}{1000}}\big]=[0{,}534\ ;\ 0{,}596]\), entièrement au-dessus de 0,5 : au risque 5 %, A sera élu (il reste possible qu'il ne le soit pas, mais c'est peu probable).</p>`),
      ] },
      { t: 'Exercice ECQ — Deux estimateurs de p', intro: R`<p>\(X_1,\dots,X_n\) i.i.d. de Bernoulli de paramètre \(p\), \(S_n=\sum X_i\), \(\hat T_1=\frac{S_n}n\), \(\hat T_2=\frac{S_n+1}{n+2}\).</p>`, qs: [
        Q('1. Loi de Sₙ ? E(Sₙ) et Var(Sₙ).', R`<p>\(S_n\sim\mathcal B(n,p)\), \(E(S_n)=np\), \(V(S_n)=np(1-p)\).</p>`),
        Q('2. E(T₁). T₁ est-il biaisé ?', R`<p>\(E(T_1)=\frac{np}n=p\) : sans biais.</p>`),
        Q('3. E(T₂) et son biais. T₂ est-il sans biais ?', R`<p>\(E(T_2)=\frac{np+1}{n+2}\), \(B(T_2)=\frac{np+1}{n+2}-p=\frac{1-2p}{n+2}\) : biaisé (sauf si \(p=\frac12\)), asymptotiquement sans biais.</p>`),
        Q('4. Var(T₁) et Var(T₂).', R`<p>\(V(T_1)=\frac{p(1-p)}n\) ; \(V(T_2)=\frac{V(S_n)}{(n+2)^2}=\frac{np(1-p)}{(n+2)^2}\).</p>`),
        Q('5. ECQ(T₁) et ECQ(T₂).', R`<p>\(ECQ=V+B^2\) : \(ECQ(T_1)=\frac{p(1-p)}n\) ; \(ECQ(T_2)=\frac{np(1-p)}{(n+2)^2}+\frac{(1-2p)^2}{(n+2)^2}\).</p>`),
        Q('6. p = 1/2 : quel estimateur choisir selon l\'ECQ ?', R`<p>\(ECQ(T_1)=\frac1{4n}\) et \(ECQ(T_2)=\frac n{4(n+2)^2}\lt\frac1{4n}\) car \(n^2\lt(n+2)^2\). On choisit \(T_2\) : un estimateur biaisé peut avoir un plus petit risque quadratique.</p>`),
      ] },
    ],
  },
];

// Dans le HTML, un « < » suivi d'une lettre ouvrirait une balise : dans les formules, on écrit \lt à la place.
const lt = h => h.replace(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g, m => m.replace(/</g, '\\lt '));
exams.forEach(e => e.exos.forEach(x => { x.intro = lt(x.intro || ''); x.qs.forEach(q => { q.a = lt(q.a); }); }));
