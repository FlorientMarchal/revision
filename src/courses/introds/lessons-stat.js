// Leçons de la partie « Probabilités et statistique » (L. Raddaf pour les probabilités, S. Lèbre pour la statistique),
// rédigées à partir des diapositives du cours (partie 1 « probabilités », partie statistique, tests et corrections de
// tests multiples), de la fiche d'exercices et de son corrigé, et des TD/TP. Les diapositives de probabilités laissent
// les formules des lois à compléter en cours : elles sont données ici.
const R = String.raw;
const box = (k, title, html) => `<div class="box ${k}"><div class="box-h">${title}</div>${html}</div>`;
const def = (t, h) => box('def', 'Définition · ' + t, h);
const prop = (t, h) => box('prop', t, h);
const ex = (t, h) => box('ex', 'Exemple · ' + t, h);
const warn = (t, h) => box('warn', 'Attention · ' + t, h);
const method = (t, h) => box('method', 'Méthode · ' + t, h);
const proof = (t, h) => `<details class="fold"><summary>${t}</summary><div style="margin-top:8px;display:grid;gap:8px">${h}</div></details>`;
const M = tex => `<div class="math">\\[${tex}\\]</div>`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const code = (src, out) => `<pre class="code"><code>${esc(src.trim())}</code></pre>` + (out ? `<pre class="code-out">${esc(out.trim())}</pre>` : '');

export const lessonsStat = [
  /* ===================================================================== */
  {
    id: 'p1', ch: 'proba', short: 'Lois usuelles', src: 'Cours proba, partie 1',
    t: 'Variables aléatoires et lois usuelles',
    sub: 'Le vocabulaire (expérience, variable, loi, espérance, variance) et les lois discrètes et continues à connaître par cœur, avec leurs sommes.',
    goals: [
      'Définir une variable aléatoire, sa loi, son espérance et sa variance, et utiliser leurs propriétés (linéarité, transformation affine, somme).',
      'Connaître valeurs possibles, loi, espérance et variance des lois de Bernoulli, binomiale, géométrique, de Poisson, uniforme, normale, exponentielle et gamma.',
      'Reconnaître la loi d\'une situation concrète (nombre de succès, attente du premier succès, comptage d\'événements, durée de vie).',
      'Utiliser les lois des sommes de variables indépendantes.',
    ],
    sections: [
      { id: 'vocab', t: 'Le vocabulaire', sub: 'Expérience aléatoire, variable aléatoire, loi', html: R`
${def('Expérience et variable aléatoires', R`<p>Une <b>expérience aléatoire</b> est une expérience dont on ne peut pas prévoir le résultat (lancer un dé, mesurer une durée de vie). L'ensemble de ses résultats possibles est l'<b>univers</b> \(\Omega\). Une <b>variable aléatoire</b> (v.a.) \(X\) associe un nombre à chaque résultat : \(X:\Omega\to\mathbb R\). On note \(X(\Omega)\) l'ensemble des valeurs qu'elle peut prendre.</p>`)}
${def('Loi de probabilité', R`<p>La <b>loi</b> (ou distribution) de \(X\) dit avec quelle probabilité \(X\) prend chacune de ses valeurs.</p><ul>
<li><b>v.a. discrète</b> (\(X(\Omega)\) fini ou dénombrable) : on donne \(P(X=k)\) pour tout \(k\in X(\Omega)\), avec \(\sum_{k\in X(\Omega)}P(X=k)=1\).</li>
<li><b>v.a. continue</b> : on donne une <b>densité</b> \(f\ge 0\) avec \(\int_{-\infty}^{+\infty}f(x)\,dx=1\), et \(P(a\le X\le b)=\int_a^bf(x)\,dx\). Pour une v.a. continue, \(P(X=a)=0\) : \(\le\) ou \(\lt\) ne change rien.</li></ul>
<p>La <b>fonction de répartition</b> est \(F(x)=P(X\le x)\) : croissante, de 0 en \(-\infty\) à 1 en \(+\infty\). Pour une densité, \(F(x)=\int_{-\infty}^xf(t)\,dt\) et \(F'=f\).</p>`)}
${def('Espérance et variance', R`${M(R`E(X)=\sum_k k\,P(X=k)\quad\text{ou}\quad E(X)=\int x\,f(x)\,dx,\qquad V(X)=E\big[(X-E(X))^2\big]=E(X^2)-E(X)^2`)}<p>L'espérance est la <b>moyenne théorique</b>, la variance la <b>dispersion théorique</b> ; l'écart-type est \(\sigma(X)=\sqrt{V(X)}\). Pour une fonction \(g\) : \(E(g(X))=\sum_kg(k)P(X=k)\) ou \(\int g(x)f(x)\,dx\).</p>`)}
${prop('Propriétés', R`${M(R`E(aX+b)=aE(X)+b,\qquad E(X+Y)=E(X)+E(Y)\ \text{(toujours)}`)}${M(R`V(aX+b)=a^2V(X),\qquad V(X+Y)=V(X)+V(Y)+2\,\mathrm{cov}(X,Y)`)}<p>Si \(X\) et \(Y\) sont <b>indépendantes</b>, \(\mathrm{cov}(X,Y)=0\) et \(V(X+Y)=V(X)+V(Y)\). Attention : \(V(X-Y)=V(X)+V(Y)\) aussi (les variances s'ajoutent toujours).</p>`)}
${ex('densité à normaliser (fiche, exercice 1)', R`<p>\(f(x)=c(1-x^2)\) sur \(]-1,1[\). Il faut \(\int_{-1}^1c(1-x^2)\,dx=c\big[x-\tfrac{x^3}3\big]_{-1}^1=\tfrac43c=1\), donc \(c=\tfrac34\). Fonction de répartition : \(F(x)=0\) si \(x\le-1\), \(F(x)=\tfrac12+\tfrac{3x}4-\tfrac{x^3}4\) si \(-1\lt x\lt 1\), \(F(x)=1\) si \(x\ge1\).</p>`)}
` },
      { id: 'discretes', t: 'Les lois discrètes', sub: 'Bernoulli, binomiale, géométrique, Poisson', html: R`
<table class="t"><thead><tr><th>Loi</th><th>Situation</th><th>Valeurs</th><th>\(P(X=k)\)</th><th>\(E(X)\)</th><th>\(V(X)\)</th></tr></thead><tbody>
<tr><td>Bernoulli \(\mathcal{B}er(p)\)</td><td>une épreuve, succès (1) ou échec (0)</td><td>\(\{0,1\}\)</td><td>\(P(X=1)=p,\ P(X=0)=1-p\)</td><td>\(p\)</td><td>\(p(1-p)\)</td></tr>
<tr><td>Binomiale \(\mathcal B(n,p)\)</td><td>nombre de succès en \(n\) épreuves indépendantes</td><td>\(\{0,\dots,n\}\)</td><td>\(\binom nkp^k(1-p)^{n-k}\)</td><td>\(np\)</td><td>\(np(1-p)\)</td></tr>
<tr><td>Géométrique \(\mathcal G(p)\)</td><td>rang du premier succès</td><td>\(\{1,2,\dots\}\)</td><td>\((1-p)^{k-1}p\)</td><td>\(1/p\)</td><td>\((1-p)/p^2\)</td></tr>
<tr><td>Poisson \(\mathcal P(\lambda)\)</td><td>nombre d'événements rares sur une durée fixée</td><td>\(\mathbb N\)</td><td>\(e^{-\lambda}\lambda^k/k!\)</td><td>\(\lambda\)</td><td>\(\lambda\)</td></tr>
</tbody></table>
<p>Il en existe d'autres (hypergéométrique pour des tirages <b>sans</b> remise, binomiale négative…).</p>
${method('reconnaître la loi', R`<ul><li>On compte des succès parmi \(n\) essais <b>indépendants</b> de même probabilité → <b>binomiale</b>.</li><li>On compte les essais <b>jusqu'au premier succès inclus</b> → <b>géométrique</b>.</li><li>On compte des événements sur une durée, avec une moyenne connue (accidents par jour, requêtes par minute) → <b>Poisson</b>, de paramètre la moyenne.</li></ul>`)}
${ex('loi géométrique (fiche, exercice 3)', R`<p>L'équipe A gagne chaque match avec probabilité 0,6, indépendamment. \(X\) = nombre de matchs jusqu'à la première victoire : \(X\sim\mathcal G(0{,}6)\), \(P(X=k)=0{,}4^{k-1}\times0{,}6\). Donc \(P(X=1)=0{,}6\), \(P(X=2)=0{,}24\), \(P(X=3)=0{,}096\), \(P(X=4)=0{,}0384\), \(P(X=5)=0{,}01536\), et \(E(X)=1/0{,}6\approx1{,}67\).</p>`)}
${ex('loi de Poisson (fiche, exercice 6)', R`<p>3 accidents par jour en moyenne : \(X\sim\mathcal P(3)\). \(P(X\ge3)=1-P(X\le2)=1-e^{-3}\big(1+3+\tfrac{3^2}{2}\big)=1-\tfrac{17}2e^{-3}\approx0{,}5768\). Sachant qu'au moins un accident a eu lieu : \(P(X\ge3\mid X\ge1)=\dfrac{P(X\ge3)}{P(X\ge1)}=\dfrac{1-\frac{17}2e^{-3}}{1-e^{-3}}\approx0{,}6070\) (car \(\{X\ge3\}\subset\{X\ge1\}\)).</p>`)}
${warn('Poisson : moyenne = variance', R`<p>Si sur 100 heures on observe une moyenne de 3,1 requêtes par minute mais une variance de 12,4, le modèle de Poisson est douteux : pour une loi de Poisson, espérance et variance sont égales. Les données sont « sur-dispersées » (cours, exercice 1).</p>`)}
` },
      { id: 'continues', t: 'Les lois continues', sub: 'Uniforme, normale, exponentielle, gamma', html: R`
<table class="t"><thead><tr><th>Loi</th><th>Valeurs</th><th>Densité \(f(x)\)</th><th>\(E(X)\)</th><th>\(V(X)\)</th></tr></thead><tbody>
<tr><td>Uniforme \(\mathcal U(a,b)\)</td><td>\([a,b]\)</td><td>\(\frac1{b-a}\mathbf 1_{[a,b]}(x)\)</td><td>\(\frac{a+b}2\)</td><td>\(\frac{(b-a)^2}{12}\)</td></tr>
<tr><td>Normale \(\mathcal N(\mu,\sigma^2)\)</td><td>\(\mathbb R\)</td><td>\(\frac1{\sigma\sqrt{2\pi}}e^{-\frac{(x-\mu)^2}{2\sigma^2}}\)</td><td>\(\mu\)</td><td>\(\sigma^2\)</td></tr>
<tr><td>Exponentielle \(\mathcal E(\lambda)\)</td><td>\(\mathbb R_+\)</td><td>\(\lambda e^{-\lambda x}\mathbf 1_{x\ge0}\)</td><td>\(\frac1\lambda\)</td><td>\(\frac1{\lambda^2}\)</td></tr>
<tr><td>Gamma \(\Gamma(a,\lambda)\)</td><td>\(\mathbb R_+^*\)</td><td>\(\frac{\lambda^a}{\Gamma(a)}x^{a-1}e^{-\lambda x}\mathbf 1_{x\gt 0}\)</td><td>\(\frac a\lambda\)</td><td>\(\frac a{\lambda^2}\)</td></tr>
</tbody></table>
<p>Et toutes les autres : Cauchy, Weibull, khi-deux, Student, Fisher…</p>
${prop('Loi exponentielle : à connaître', R`<ul><li>Fonction de répartition : \(F(x)=1-e^{-\lambda x}\) pour \(x\ge0\) ; donc \(P(X\gt x)=e^{-\lambda x}\).</li><li>Le paramètre se lit sur la moyenne : \(E(X)=1/\lambda\). Une durée moyenne de 5 ans donne \(\lambda=1/5\).</li><li><b>Absence de mémoire</b> : \(P(X\gt s+t\mid X\gt s)=P(X\gt t)\).</li></ul>`)}
${proof('Démonstration : E(X) = 1/λ et V(X) = 1/λ² pour la loi exponentielle', R`<p>Par intégration par parties, \(E(X)=\int_0^{+\infty}x\lambda e^{-\lambda x}dx=\big[-xe^{-\lambda x}\big]_0^{+\infty}+\int_0^{+\infty}e^{-\lambda x}dx=0+\frac1\lambda\).</p><p>De même \(E(X^2)=\int_0^{+\infty}x^2\lambda e^{-\lambda x}dx=\big[-x^2e^{-\lambda x}\big]_0^{+\infty}+\int_0^{+\infty}2xe^{-\lambda x}dx=\frac2\lambda E(X)=\frac2{\lambda^2}\). Donc \(V(X)=E(X^2)-E(X)^2=\frac2{\lambda^2}-\frac1{\lambda^2}=\frac1{\lambda^2}\).</p>`)}
${ex('temps de réparation (fiche, exercice 5)', R`<p>Réparation moyenne d'une demi-heure : \(\lambda=2\), \(F(x)=1-e^{-2x}\) pour \(x\ge0\). \(P(X\gt1)=e^{-2}\approx0{,}1353\). Sachant qu'elle dure déjà 45 min, probabilité qu'elle finisse dans les 15 min : \(P(X\le1\mid X\gt0{,}75)=1-P(X\gt0{,}25)=1-e^{-1/2}\approx0{,}3935\) (absence de mémoire). Sur 3 réparations indépendantes, le nombre \(Y\) de réparations de plus d'une heure suit \(\mathcal B(3,e^{-2})\) et \(P(Y=2)=3e^{-4}(1-e^{-2})\approx0{,}0475\).</p>`)}
${prop('Loi normale centrée réduite', R`<p>Si \(X\sim\mathcal N(\mu,\sigma^2)\), alors \(Z=\frac{X-\mu}\sigma\sim\mathcal N(0,1)\). Valeurs à retenir : \(P(-1{,}96\lt Z\lt1{,}96)=0{,}95\) et \(P(-2{,}576\lt Z\lt2{,}576)=0{,}99\).</p>`)}
` },
      { id: 'sommes', t: 'Lois des sommes', sub: 'Ce que devient la loi quand on additionne des variables indépendantes', html: R`
${prop('Sommes de variables indépendantes', M(R`\begin{aligned}X_1,\dots,X_n\ \text{i.i.d.}\sim\mathcal{B}er(p)&\ \Rightarrow\ \textstyle\sum_iX_i\sim\mathcal B(n,p)\\ X\sim\mathcal B(n,p),\ Y\sim\mathcal B(m,p)&\ \Rightarrow\ X+Y\sim\mathcal B(n+m,p)\\ X\sim\mathcal P(\lambda),\ Y\sim\mathcal P(\mu)&\ \Rightarrow\ X+Y\sim\mathcal P(\lambda+\mu)\\ X_1,\dots,X_n\ \text{i.i.d.}\sim\mathcal E(\lambda)&\ \Rightarrow\ \textstyle\sum_iX_i\sim\Gamma(n,\lambda)\\ X\sim\Gamma(a,\lambda),\ Y\sim\Gamma(b,\lambda)&\ \Rightarrow\ X+Y\sim\Gamma(a+b,\lambda)\\ X\sim\mathcal N(\mu_1,\sigma_1^2),\ Y\sim\mathcal N(\mu_2,\sigma_2^2)&\ \Rightarrow\ X+Y\sim\mathcal N(\mu_1+\mu_2,\sigma_1^2+\sigma_2^2)\\ X\sim\mathcal N(\mu,\sigma^2)&\ \Rightarrow\ aX+b\sim\mathcal N(a\mu+b,a^2\sigma^2)\end{aligned}`) + '<p>Toutes les lignes supposent les variables <b>indépendantes</b> (sauf la dernière, qui porte sur une seule variable).</p>')}
${ex('cours, exercices 1 à 3', R`<ul><li>Requêtes par minute \(X\sim\mathcal P(3)\) : sur deux minutes indépendantes, le total suit \(\mathcal P(6)\).</li><li>Effet secondaire de probabilité 0,2 sur 10 patients indépendants : \(X\sim\mathcal B(10;0{,}2)\), \(P(X=2)=\binom{10}2 0{,}2^2\,0{,}8^8\approx0{,}302\), \(P(X\ge1)=1-0{,}8^{10}\approx0{,}893\), \(E(X)=2\), \(V(X)=1{,}6\).</li><li>Temps entre deux événements \(T\sim\mathcal E(2)\) : \(E(T)=0{,}5\) h, \(V(T)=0{,}25\), \(P(T\gt1)=e^{-2}\), \(P(0{,}5\lt T\lt1)=e^{-1}-e^{-2}\approx0{,}233\). \(S=T_1+T_2+T_3\sim\Gamma(3,2)\) : c'est le temps d'attente du 3ᵉ événement.</li></ul>`)}
${method('commandes R utiles', R`<p>Pour chaque loi, R fournit quatre fonctions : <code>d…</code> (densité ou \(P(X=k)\)), <code>p…</code> (fonction de répartition \(P(X\le x)\)), <code>q…</code> (quantile) et <code>r…</code> (simulation). Suffixes : <code>binom</code>, <code>geom</code> (attention : en R, le nombre d'<b>échecs</b> avant le succès, donc \(P(X=k)\) = <code>dgeom(k-1, p)</code>), <code>pois</code>, <code>unif</code>, <code>norm</code> (avec l'<b>écart-type</b> : <code>pnorm(x, mean, sd)</code>), <code>exp</code> (avec <code>rate</code> \(=\lambda\)), <code>gamma</code>.</p>${code(R`dbinom(2, size = 10, prob = 0.2)   # P(X = 2), X ~ B(10, 0.2)
ppois(2, lambda = 3)               # P(X <= 2), X ~ P(3)
pexp(3, rate = 1/5)                # P(X <= 3), X ~ E(1/5)
1 - pexp(1, rate = 2)              # P(T > 1)
qnorm(0.975)                       # 1.96`, R`[1] 0.3019899
[1] 0.4231901
[1] 0.4511884
[1] 0.1353353
[1] 1.959964`)}`)}
` },
    ],
    keep: [
      'V(X) = E(X²) − E(X)², V(aX + b) = a² V(X), V(X ± Y) = V(X) + V(Y) si indépendantes.',
      'B(n, p) : np et np(1 − p) ; G(p) : 1/p et (1 − p)/p² ; P(λ) : λ et λ.',
      'U(a, b) : (a + b)/2 et (b − a)²/12 ; N(μ, σ²) : μ et σ² ; E(λ) : 1/λ et 1/λ² ; Γ(a, λ) : a/λ et a/λ².',
      'Exponentielle : P(X > x) = e^(−λx), sans mémoire, λ = 1/moyenne.',
      'Somme de Bernoulli = binomiale ; Poisson + Poisson = Poisson ; somme de n exponentielles = Γ(n, λ).',
      'Densité : f ≥ 0 et ∫ f = 1 ; F(x) = ∫ f jusqu\'à x ; F\' = f.',
    ],
  },
  /* ===================================================================== */
  {
    id: 'p2', ch: 'proba', short: 'Indépendance & vecteurs gaussiens', src: 'Cours proba, partie 1 · TP vecteurs gaussiens',
    t: 'Conditionnement, indépendance, corrélation et vecteurs gaussiens',
    sub: 'Probabilités totales et Bayes, indépendance, covariance et corrélation ; la loi normale en dimension d.',
    goals: [
      'Utiliser la formule des probabilités totales, les probabilités conditionnelles et le théorème de Bayes.',
      'Définir l\'indépendance de deux événements et de deux variables aléatoires.',
      'Calculer covariance et corrélation, et savoir que non corrélées n\'implique pas indépendantes (sauf pour un vecteur gaussien).',
      'Écrire la densité d\'un vecteur gaussien, lire sa matrice de variance-covariance, utiliser AX + B ~ N(Aμ + B, AΣA\').',
    ],
    sections: [
      { id: 'cond', t: 'Événements et probabilités conditionnelles', sub: 'Probabilités totales et théorème de Bayes', html: R`
<p>Un <b>événement</b> est un ensemble d'issues de \(\Omega\) (un sous-ensemble de \(\Omega\)). Pour deux événements \(A\) et \(B\) : \(P(A\cup B)=P(A)+P(B)-P(A\cap B)\).</p>
${def('Probabilité conditionnelle', R`${M(R`P(A\mid B)=P_B(A)=\frac{P(A\cap B)}{P(B)}\qquad(P(B)\gt0)`)}`)}
${prop('Probabilités totales et Bayes', R`<p>Si \(B_1,\dots,B_K\) forment une <b>partition</b> de \(\Omega\) :</p>${M(R`P(A)=\sum_{k=1}^KP(A\cap B_k)=\sum_{k=1}^KP(A\mid B_k)\,P(B_k),\qquad P(B\mid A)=\frac{P(A\mid B)\,P(B)}{P(A)}`)}`)}
${ex('documents de plus de 10 pages (fiche, exercice 7)', R`<p>50 % des documents en Word, 30 % en LaTeX, 20 % en HTML ; 40 %, 20 % et 20 % d'entre eux dépassent 10 pages. Probabilités totales : \(P(D)=0{,}5\times0{,}4+0{,}3\times0{,}2+0{,}2\times0{,}2=0{,}2+0{,}06+0{,}04=0{,}30\). Avec Bayes, un document de plus de 10 pages est en Word avec probabilité \(0{,}2/0{,}3=2/3\).</p>`)}
${ex('ville et vélo (fiche, exercice 8)', R`<p>\(P(V)=0{,}52\), \(P(B)=0{,}05\), \(P(V\cap B)=0{,}02\). Alors \(P(V\mid B)=0{,}02/0{,}05=0{,}4\) et \(P(B\mid V)=0{,}02/0{,}52=1/26\approx0{,}0385\).</p>`)}
` },
      { id: 'indep', t: 'Indépendance', sub: 'Événements et variables indépendants', html: R`
${def('Indépendance', R`<p>Deux événements \(A\) et \(B\) (non vides) sont <b>indépendants</b> si et seulement si \(P(A\cap B)=P(A)\,P(B)\), ou de façon équivalente \(P(A\mid B)=P(A)\) ou \(P(B\mid A)=P(B)\).</p><p>Deux variables aléatoires \(X\) et \(Y\) sont indépendantes si et seulement si <b>tous</b> les événements définis à partir de \(X\) sont indépendants de tous ceux définis à partir de \(Y\) : \(P(X\in I,Y\in J)=P(X\in I)P(Y\in J)\) pour tous intervalles \(I,J\).</p>`)}
${warn('indépendants ≠ incompatibles', R`<p>Deux événements incompatibles (\(A\cap B=\varnothing\)) de probabilités non nulles ne sont <b>jamais</b> indépendants : \(P(A\cap B)=0\ne P(A)P(B)\).</p>`)}
${method('montrer que deux variables ne sont pas indépendantes', R`<p>Il suffit d'un contre-exemple : trouver des valeurs \(u,v\) avec \(P(U=u,V=v)\ne P(U=u)P(V=v)\).</p>`)}
` },
      { id: 'cov', t: 'Covariance et corrélation', sub: 'Mesurer une liaison linéaire', html: R`
${def('Covariance et corrélation', M(R`\mathrm{cov}(X,Y)=E\big[(X-E(X))(Y-E(Y))\big]=E(XY)-E(X)E(Y),\qquad \mathrm{corr}(X,Y)=\frac{\mathrm{cov}(X,Y)}{\sigma(X)\,\sigma(Y)}\in[-1,1]`))}
${prop('Règles de calcul', R`<p>La covariance est <b>bilinéaire</b> et symétrique : \(\mathrm{cov}(aX+bY,Z)=a\,\mathrm{cov}(X,Z)+b\,\mathrm{cov}(Y,Z)\), \(\mathrm{cov}(X,X)=V(X)\), \(\mathrm{cov}(X,c)=0\). On développe comme un produit :</p>${M(R`\mathrm{cov}(2X+Y,\,X-3Y)=2V(X)-6\,\mathrm{cov}(X,Y)+\mathrm{cov}(Y,X)-3V(Y)=2V(X)-5\,\mathrm{cov}(X,Y)-3V(Y)`)}`)}
${prop('Indépendance et corrélation', R`<p>Si \(X\) et \(Y\) sont indépendantes alors \(\mathrm{cov}(X,Y)=\mathrm{corr}(X,Y)=0\). <b>La réciproque est fausse</b> en général.</p>`)}
${ex('non corrélées mais dépendantes (fiche, exercice 10)', R`<p>\(X,Y\) indépendantes de loi \(\mathcal{B}er(1/2)\), \(U=X+Y\), \(V=X-Y\). \(\mathrm{cov}(U,V)=V(X)-V(Y)=0\) : non corrélées. Mais \(P(U=0,V=0)=P(X=0,Y=0)=\tfrac14\) alors que \(P(U=0)P(V=0)=\tfrac14\times\tfrac12=\tfrac18\) : dépendantes.</p>`)}
${warn('corrélation ≠ causalité', R`<p>Une corrélation, même forte, ne prouve pas un lien de cause à effet (chocolat et prix Nobel, tâches ménagères et divorce…) : un troisième facteur peut expliquer les deux.</p>`)}
${ex('corrélation taille-poids sous R (fiche, exercice 9)', R`<p>Avec des données groupées en classes, on remplace chaque classe par son centre, on reconstruit les 1000 couples avec <code>rep</code>, puis <code>cor(T, P)</code> : \(r\approx0{,}60\), corrélation linéaire positive modérée. Code dans l'onglet R.</p>`)}
` },
      { id: 'gauss', t: 'Vecteurs gaussiens', sub: 'La loi normale en dimension d', html: R`
${def('Vecteur gaussien', R`<p>On généralise la loi normale à un vecteur \(X=(X_1,\dots,X_d)'\) dont les composantes sont gaussiennes, \(X_i\sim\mathcal N(\mu_i,\sigma_i^2)\). Son <b>espérance</b> est le vecteur \(\mu=E(X)=(\mu_1,\dots,\mu_d)'\) ; sa <b>variance</b> est la matrice de variance-covariance (\(d\times d\), symétrique) :</p>${M(R`V(X)=\Sigma=\begin{pmatrix}\sigma_1^2&\mathrm{cov}(X_1,X_2)&\cdots&\mathrm{cov}(X_1,X_d)\\ \mathrm{cov}(X_2,X_1)&\sigma_2^2&\cdots&\mathrm{cov}(X_2,X_d)\\ \vdots&&\ddots&\vdots\\ \mathrm{cov}(X_d,X_1)&\cdots&\cdots&\sigma_d^2\end{pmatrix}`)}<p>On note \(X\sim\mathcal N_d(\mu,\Sigma)\), de densité</p>${M(R`f_X(x)=\Big(\frac1{\sqrt{2\pi}}\Big)^d\frac1{\sqrt{|\Sigma|}}\exp\Big(-\frac12(x-\mu)'\Sigma^{-1}(x-\mu)\Big)`)}`)}
${prop('Composantes indépendantes', R`<p>Si les \(X_i\) sont indépendantes deux à deux, \(\Sigma=\mathrm{diag}(\sigma_1^2,\dots,\sigma_d^2)\), \(|\Sigma|=\prod_i\sigma_i^2\) et la densité devient le produit des densités : \(f_X(x)=\prod_{i=1}^df_{X_i}(x_i)\).</p><p>Réciproquement, pour un <b>vecteur gaussien</b>, des composantes <b>non corrélées sont indépendantes</b> : c'est le cas particulier où la réciproque de « indépendantes ⇒ non corrélées » est vraie.</p>`)}
${prop('Propriétés', R`<ul><li>Les composantes d'un vecteur gaussien sont des v.a. gaussiennes, <b>mais la réciproque est fausse</b> : des composantes gaussiennes ne forment pas forcément un vecteur gaussien.</li><li><b>Linéarité</b> : \(AX+B\sim\mathcal N(A\mu+B,\ A\Sigma A')\). En particulier toute combinaison linéaire \(a'X\) est gaussienne, de variance \(a'\Sigma a\). Un sous-vecteur, comme \((Y,Z)\), est gaussien : on garde les lignes et colonnes correspondantes de \(\mu\) et \(\Sigma\).</li></ul>`)}
${method('lire Σ', R`<p>Pour \(T=(X,Y,Z)\) d'espérance \((2,-0{,}5,0)'\) et \(\Sigma=\begin{pmatrix}4&1&-2\\1&9&1{,}5\\-2&1{,}5&2\end{pmatrix}\) (évaluation 2023) :</p><ul><li>\(\mathrm{cov}(Y,Z)=\Sigma_{23}=1{,}5\) ;</li><li>\(V(Y+Z)=V(Y)+V(Z)+2\,\mathrm{cov}(Y,Z)=9+2+3=14\) ;</li><li>\(V(X+Y+Z)\) = somme de <b>tous</b> les coefficients de \(\Sigma\) = \(4+9+2+2(1-2+1{,}5)=16\) ;</li><li>\((Y,Z)\sim\mathcal N_2\big((-0{,}5,0)',\begin{pmatrix}9&1{,}5\\1{,}5&2\end{pmatrix}\big)\).</li></ul>`)}
${prop('Forme de la densité en dimension 2', R`<p>Les courbes de niveau sont des ellipses centrées en \(\mu\). Si \(\rho\gt0\), elles sont orientées dans le sens croissant ; si \(\rho\lt0\), décroissant ; si \(\rho=0\) avec variances égales, ce sont des cercles. Plus \(|\rho|\) est proche de 1, plus la densité est concentrée le long d'une droite : un pic étroit et haut (le maximum vaut \(\frac1{2\pi\sqrt{|\Sigma|}}\), grand quand \(|\Sigma|=1-\rho^2\) est petit). Pour \(\rho=0{,}95\), \(|\Sigma|=0{,}0975\) et le maximum vaut environ 0,51 : c'est le graphique « pointu ».</p>`)}
${ex('vecteur transformé (fiche, exercice 11)', R`<p>\((X,Y)\) gaussien centré, \(E(X^2)=4\), \(E(Y^2)=1\), et \(2X+Y\) indépendante de \(X-3Y\). Alors \(0=\mathrm{cov}(2X+Y,X-3Y)=2\times4-5\,\mathrm{cov}(X,Y)-3\), d'où \(\mathrm{cov}(X,Y)=1\) et \(\Sigma=\begin{pmatrix}4&1\\1&1\end{pmatrix}\). Pour \(W=(X+Y,2X-Y)'=AX\) avec \(A=\begin{pmatrix}1&1\\2&-1\end{pmatrix}\) : \(W\) est gaussien centré de covariance \(A\Sigma A'=\begin{pmatrix}7&8\\8&13\end{pmatrix}\).</p>`)}
${method('sous R (TP vecteurs gaussiens)', code(R`library(mvtnorm)
mu <- c(0, 0)
Sigma <- matrix(c(4, 1, 1, 1), nrow = 2, byrow = TRUE)
Z <- rmvnorm(n = 1000, mean = mu, sigma = Sigma)   # simulation
colMeans(Z); var(Z); cor(Z[, 1], Z[, 2])            # proches de mu, Sigma, 0.5
dmvnorm(c(0, 0), mean = mu, sigma = Sigma)          # densité en (0, 0)`))}
` },
    ],
    keep: [
      'P(A | B) = P(A ∩ B)/P(B) ; probabilités totales sur une partition ; Bayes P(B | A) = P(A | B) P(B)/P(A).',
      'A, B indépendants ⇔ P(A ∩ B) = P(A) P(B).',
      'cov(X, Y) = E(XY) − E(X)E(Y) ; corr = cov/(σX σY) ; la covariance est bilinéaire.',
      'Indépendantes ⇒ non corrélées ; réciproque fausse, sauf pour un vecteur gaussien.',
      'X ~ N_d(μ, Σ) : densité (2π)^(−d/2) |Σ|^(−1/2) exp(−½ (x − μ)\' Σ⁻¹ (x − μ)).',
      'AX + B ~ N(Aμ + B, AΣA\') ; V(somme des composantes) = somme de tous les termes de Σ.',
    ],
  },
  /* ===================================================================== */
  {
    id: 's1', ch: 'estim', short: 'Estimateurs & EMV', src: 'CM statistique, chap. 1 · TD séance 1',
    t: 'Estimateurs, propriétés et maximum de vraisemblance',
    sub: 'Ce qu\'est un estimateur, comment juger s\'il est bon (biais, variance, convergence, risque quadratique) et comment en construire un par maximum de vraisemblance.',
    goals: [
      'Distinguer variable aléatoire X̄ₙ, valeur observée x̄ₙ et paramètre μ.',
      'Calculer le biais, la variance et le risque quadratique d\'un estimateur ; montrer qu\'il est convergent.',
      'Connaître les estimateurs de μ et σ² et savoir lesquels sont biaisés.',
      'Écrire la vraisemblance et la log-vraisemblance d\'un échantillon et en déduire l\'estimateur du maximum de vraisemblance.',
    ],
    sections: [
      { id: 'vocab', t: 'Échantillon et notations', sub: 'Le modèle de la statistique', html: R`
<p>On répète une expérience aléatoire \(X\) de façon <b>indépendante</b>. On note \((X_1,\dots,X_n)\) les \(n\) variables aléatoires associées aux \(n\) répétitions : elles sont <b>indépendantes et de même loi que \(X\)</b> (i.i.d.). C'est un <b>échantillon</b> (théorique). L'échantillon <b>observé</b> \((x_1,\dots,x_n)\) est une réalisation de \((X_1,\dots,X_n)\).</p>
${ex('le dé', '<p>Lancer 10 fois un dé revient à considérer 10 dés identiques et à les lancer une fois chacun.</p>')}
${def('Moyenne et variance empiriques', R`${M(R`\overline X_n=\frac1n\sum_{i=1}^nX_i,\qquad S_n=\frac1n\sum_{i=1}^n(X_i-\overline X_n)^2`)}<p>Leurs réalisations sur l'échantillon observé : \(\overline x_n=\frac1n\sum x_i\) (la moyenne de l'échantillon) et \(\overline s_n=\frac1n\sum(x_i-\overline x_n)^2\).</p>`)}
${warn('trois objets différents', R`<p>Ne pas confondre \(\overline X_n\) (une <b>variable aléatoire</b>), \(\overline x_n\) (une <b>valeur observée</b>, un nombre) et \(E(X)=\mu\) (une <b>valeur fixe</b> qui définit la loi de \(X\), en général inconnue).</p>`)}
${ex('ce qu\'implique « être un échantillon » (évaluation 2023, exercice 4)', R`<p>En théorie : les \(X_i\) sont indépendantes et ont toutes la loi de \(X\) (même espérance \(\mu\), même variance \(\sigma^2\)). En pratique, pour des rendements de blé : les parcelles doivent être choisies au hasard, dans les mêmes conditions, sans que le rendement de l'une influence celui d'une autre.</p>`)}
` },
      { id: 'def', t: 'Estimateur et estimation', sub: 'Une fonction de l\'échantillon', html: R`
${def('Estimateur', R`<p>Soit \(\theta\) un paramètre inconnu de la loi de \(X\). Un <b>estimateur</b> \(T_n\) de \(\theta\) est une fonction (une combinaison) des répétitions \(X_1,\dots,X_n\). On note \(\hat\theta=T_n\). Sa valeur sur l'échantillon observé est une <b>estimation</b> de \(\theta\).</p>`)}
<ul><li>Un estimateur est une <b>variable aléatoire</b> : pour différents échantillons, on obtient différentes estimations.</li>
<li>Il existe souvent plusieurs estimateurs « légitimes » : la moyenne empirique \(\hat\mu=\frac1n\sum X_i\), mais aussi n'importe quelle fonction de \((X_1,\dots,X_n)\), par exemple la dernière réalisation \(\hat\mu=X_n\). On garde ceux qui ont de <b>bonnes propriétés</b>.</li></ul>
` },
      { id: 'prop', t: 'Propriétés d\'un estimateur', sub: 'Biais, variance, convergence, risque quadratique', html: R`
${def('Biais', R`<p>\(T_n\) est <b>sans biais</b> si \(E(T_n)=\theta\). Sinon il est <b>biaisé</b> et son biais est \(B(T_n)=E(T_n)-\theta\). Il est <b>asymptotiquement sans biais</b> si \(\lim_{n\to+\infty}E(T_n)=\theta\).</p>`)}
${def('Variance asymptotiquement nulle, précision', R`<p>La variance de \(T_n\) est <b>asymptotiquement nulle</b> si \(V(T_n)\to0\) quand \(n\to+\infty\). Pour un estimateur sans biais, \(V(T_n)\) mesure sa <b>précision</b> : plus elle est petite, plus il est précis. Entre deux estimateurs sans biais, on choisit celui de plus petite variance.</p>`)}
${def('Convergence', R`<p>\(T_n\) est <b>convergent</b> (ou consistant) s'il converge en probabilité vers \(\theta\) :</p>${M(R`\forall\varepsilon\gt0,\quad\lim_{n\to+\infty}P\big(|T_n-\theta|\gt\varepsilon\big)=0.`)}<p>Il s'écarte du paramètre avec une faible probabilité si l'échantillon est assez grand.</p>`)}
${prop('Critère pratique de convergence', R`<p>Si \(T_n\) est <b>sans biais</b> (ou asymptotiquement sans biais) et si \(V(T_n)\to0\), alors \(T_n\) est convergent. Plus généralement, si le risque quadratique tend vers 0, l'estimateur est convergent.</p>`)}
${proof('Démonstration : X̄ₙ est un estimateur convergent de μ (évaluation 2023, exercice 4)', R`<p>\(E(\overline X_n)=\frac1n\sum E(X_i)=\mu\) : sans biais. Par indépendance, \(V(\overline X_n)=\frac1{n^2}\sum V(X_i)=\frac{\sigma^2}n\to0\). Par l'inégalité de Bienaymé-Tchebychev, \(P(|\overline X_n-\mu|\gt\varepsilon)\le\frac{V(\overline X_n)}{\varepsilon^2}=\frac{\sigma^2}{n\varepsilon^2}\to0\) : \(\overline X_n\) est convergent.</p>`)}
${def('Risque quadratique', R`${M(R`R(T_n,\theta)=E\big[(T_n-\theta)^2\big]=V(T_n)+\big(E(T_n)-\theta\big)^2`)}<p>Le risque quadratique (erreur quadratique moyenne, ECQ) est la somme de la <b>variance</b> et du <b>carré du biais</b>. Entre deux estimateurs, on choisit celui de plus petit risque. Pour le minimiser, il est parfois intéressant d'accepter un estimateur biaisé ; si le biais est connu, on corrige l'estimateur.</p>`)}
<p>C'est le <b>compromis biais-variance</b>, qui revient dans tout l'apprentissage statistique (classification, régression…).</p>
${ex('trois estimateurs (CM, exercice 1)', R`<p>\(E(T_1)=\theta+2,\ V(T_1)=2\theta/n\) : biaisé (biais 2, même asymptotiquement), variance asymptotiquement nulle, <b>pas convergent</b>. \(E(T_2)=\theta+2/n,\ V(T_2)=2\theta/n\) : biaisé mais asymptotiquement sans biais, variance → 0 : <b>convergent</b>. \(E(T_3)=\theta,\ V(T_3)=2\) : sans biais mais variance constante, pas convergent par ce critère. On garde \(T_2\).</p>`)}
${ex('deux estimateurs de p (exercice ECQ)', R`<p>\(X_i\sim\mathcal{B}er(p)\), \(S_n=\sum X_i\sim\mathcal B(n,p)\). \(T_1=S_n/n\) : sans biais, \(V(T_1)=\frac{p(1-p)}n=R(T_1)\). \(T_2=\frac{S_n+1}{n+2}\) : \(E(T_2)=\frac{np+1}{n+2}\), biais \(\frac{1-2p}{n+2}\), \(V(T_2)=\frac{np(1-p)}{(n+2)^2}\), \(R(T_2)=\frac{np(1-p)+(1-2p)^2}{(n+2)^2}\). Pour \(p=\tfrac12\) : \(R(T_1)=\frac1{4n}\) et \(R(T_2)=\frac n{4(n+2)^2}\lt\frac1{4n}\). L'estimateur biaisé \(T_2\) a un plus petit risque.</p>`)}
` },
      { id: 'usuels', t: 'Estimateurs usuels de μ et σ²', sub: 'Lesquels sont biaisés', html: R`
<p>Pour \(n\) répétitions indépendantes de \(X\) avec \(E(X)=\mu\), \(V(X)=\sigma^2\) :</p>
<table class="t"><thead><tr><th>Situation</th><th>Estimateur</th><th>Propriété</th></tr></thead><tbody>
<tr><td>\(\mu\) inconnu</td><td>\(\hat\mu=\overline X_n=\frac1n\sum X_i\)</td><td>sans biais, \(V=\sigma^2/n\to0\), convergent</td></tr>
<tr><td>\(\mu\) connu, \(\sigma^2\) inconnu</td><td>\(\hat\sigma^2_\mu=\frac1n\sum(X_i-\mu)^2\)</td><td>sans biais</td></tr>
<tr><td>\(\mu\) et \(\sigma^2\) inconnus</td><td>\(\hat\sigma^2=\frac1n\sum(X_i-\overline X_n)^2\)</td><td><b>biaisé</b> : \(E(\hat\sigma^2)=\frac{n-1}n\sigma^2\)</td></tr>
<tr><td>\(\mu\) et \(\sigma^2\) inconnus</td><td>\(\hat\sigma^2_{SB}=\frac1{n-1}\sum(X_i-\overline X_n)^2\)</td><td>sans biais</td></tr>
<tr><td>Bernoulli</td><td>\(\hat p=\overline X_n\) (la proportion de 1)</td><td>sans biais, \(V=p(1-p)/n\)</td></tr>
</tbody></table>
${warn('R et la variance', R`<p><code>var(x)</code> en R calcule la version <b>sans biais</b>, en \(\frac1{n-1}\).</p>`)}
${ex('estimation ponctuelle (TD séance 1, exercice 2)', R`<p>Observations 1,11 ; 1,66 ; 3,21 ; 2,02 d'une loi exponentielle. \(\overline x=8/4=2\) estime \(E(X)=1/\lambda\) ; donc \(\hat\lambda=1/\overline x=0{,}5\) et la variance \(1/\lambda^2\) s'estime par \(\overline x^2=4\) (ou, sans utiliser le modèle, par la variance empirique \(\frac1{n-1}\sum(x_i-\overline x)^2\approx0{,}79\)).</p>`)}
` },
      { id: 'emv', t: 'Le maximum de vraisemblance', sub: 'Choisir le paramètre qui rend l\'échantillon le plus probable', html: R`
${def('Vraisemblance', R`<p>La <b>vraisemblance</b> de l'échantillon est la loi du \(n\)-uplet, vue comme une fonction de \(\theta\) (les \(x_i\) étant fixés) :</p>${M(R`\ell(x_1,\dots,x_n;\theta)=\prod_{i=1}^nP_\theta(X_i=x_i)\ \ \text{(cas discret)},\qquad \ell(x_1,\dots,x_n;\theta)=\prod_{i=1}^nf_\theta(x_i)\ \ \text{(cas continu)}.`)}<p>Elle représente la probabilité d'observer l'échantillon pour une valeur fixée de \(\theta\). Le produit vient de l'<b>indépendance</b> des \(X_i\).</p>`)}
${def('Estimateur du maximum de vraisemblance (EMV)', R`${M(R`\hat\theta=\operatorname*{arg\,max}_\theta\ \ell(x_1,\dots,x_n;\theta)`)}<p>Principe : si on ne connaît pas \(\theta\), on prend la valeur pour laquelle l'échantillon observé avait la plus grande probabilité. La variable aléatoire \(T_n=\operatorname{arg\,max}\ell(X_1,\dots,X_n;\theta)\) est l'estimateur du maximum de vraisemblance.</p>`)}
${def('Log-vraisemblance', R`${M(R`L(x_1,\dots,x_n;\theta)=\ln\ell(x_1,\dots,x_n;\theta)=\sum_{i=1}^n\ln f(x_i;\theta)`)}<p>Le logarithme transforme le produit en somme, plus facile à dériver. Comme \(\ln\) est strictement croissante, maximiser \(\ell\) ou \(\ln\ell\) donne le même \(\hat\theta\).</p>`)}
${method('calculer un EMV', R`<ol><li>Écrire la vraisemblance (produit) puis la log-vraisemblance (somme), en simplifiant avec \(\ln(ab)=\ln a+\ln b\), \(\ln(a^k)=k\ln a\), \(\ln e^x=x\).</li><li>Dériver par rapport à \(\theta\) et résoudre \(\frac{\partial L}{\partial\theta}=0\).</li><li>Vérifier que c'est un <b>maximum</b> : dérivée seconde négative.</li><li>Remplacer les \(x_i\) par les \(X_i\) pour obtenir l'estimateur.</li></ol>`)}
${ex('loi de Poisson (CM, exercice 3)', R`${M(R`\ell(x;\lambda)=\prod_{i=1}^n\frac{\lambda^{x_i}}{x_i!}e^{-\lambda}=\frac{\lambda^{\sum x_i}e^{-n\lambda}}{\prod x_i!},\qquad L=\Big(\sum x_i\Big)\ln\lambda-n\lambda-\sum\ln(x_i!)`)}<p>\(\frac{\partial L}{\partial\lambda}=\frac{\sum x_i}\lambda-n=0\iff\hat\lambda=\overline x\) ; \(\frac{\partial^2L}{\partial\lambda^2}=-\frac{\sum x_i}{\lambda^2}\lt0\) : maximum. L'estimateur \(\overline X_n\) est sans biais (\(E=\lambda\)) et de variance \(\lambda/n\to0\). Sur les 15 appareils (3 1 1 1 6 4 2 3 1 5 5 2 7 4 3) : \(\hat\lambda=48/15=3{,}2\).</p>`)}
${ex('loi normale de variance 1 (CM, exercice 2 ; évaluation 2023, exercice 3)', R`<p>\(f(x)=\frac1{\sqrt{2\pi}}e^{-\frac12(x-a)^2}\) : c'est la loi \(\mathcal N(a,1)\). \(L(a)=-\frac n2\ln(2\pi)-\frac12\sum(x_i-a)^2\), \(L'(a)=\sum(x_i-a)=0\iff\hat a=\overline x\), \(L''=-n\lt0\). L'EMV est la moyenne empirique : sans biais, de variance \(1/n\), convergent.</p>`)}
${ex('loi exponentielle (TD séance 1, exercice 2)', R`<p>\(\ell=\prod\lambda e^{-\lambda x_i}=\lambda^ne^{-\lambda\sum x_i}\), \(L=n\ln\lambda-\lambda\sum x_i\), \(L'=\frac n\lambda-\sum x_i=0\iff\hat\lambda=\frac n{\sum x_i}=\frac1{\overline x}\), \(L''=-n/\lambda^2\lt0\).</p>`)}
${prop('Propriétés de l\'EMV', R`<p>L'estimateur du maximum de vraisemblance est <b>asymptotiquement sans biais</b>, <b>asymptotiquement distribué selon une loi normale</b> et <b>convergent</b>. En revanche, il peut être biaisé pour \(n\) fini (par exemple l'EMV de \(\sigma^2\) pour une loi normale est \(\frac1n\sum(X_i-\overline X)^2\), biaisé).</p>`)}
${ex('comparer deux sociétés par la vraisemblance (évaluation 2023, exercice 1)', R`<p>Durées de vie exponentielles : moyenne 5 ans pour A (\(\lambda_A=1/5\)) ; celles de B sont deux fois plus courtes, moyenne 2,5 ans (\(\lambda_B=2/5\)). Pour les 6 durées, de somme \(27{,}91\) : \(L(\lambda)=6\ln\lambda-27{,}91\,\lambda\). \(L(1/5)\approx-15{,}24\) et \(L(2/5)\approx-16{,}66\) : la vraisemblance est plus grande pour A, c'est la société qui a le plus vraisemblablement fabriqué ces composants.</p>`)}
` },
    ],
    keep: [
      'Estimateur = variable aléatoire fonction de (X₁, …, Xₙ) ; estimation = sa valeur sur l\'échantillon observé.',
      'Biais B = E(Tₙ) − θ ; sans biais + variance → 0 ⇒ convergent.',
      'Risque quadratique = V(Tₙ) + B² : compromis biais-variance.',
      'X̄ₙ : sans biais, V = σ²/n. Variance en 1/n biaisée (E = (n − 1)σ²/n), en 1/(n − 1) sans biais.',
      'EMV : écrire ℓ = Π f(xᵢ ; θ), passer au log, dériver, annuler, vérifier dérivée seconde < 0.',
      'Poisson, normale(a, 1) : EMV = x̄ ; exponentielle : EMV = 1/x̄.',
      'EMV : asymptotiquement sans biais, asymptotiquement normal, convergent ; peut être biaisé à n fini.',
    ],
  },
  /* ===================================================================== */
  {
    id: 's2', ch: 'limites', short: 'LGN, TCL, intervalles', src: 'CM statistique, chap. 2 · TP séance 2',
    t: 'Lois limites et intervalles : LGN, TCL, dispersion, confiance',
    sub: 'Pourquoi la moyenne marche (loi des grands nombres), comment elle fluctue (théorème central limite), et les deux intervalles qu\'on en déduit.',
    goals: [
      'Énoncer la loi des grands nombres et le théorème central limite, avec leurs hypothèses.',
      'Connaître espérance, variance et écart-type de X̄ₙ, et le cas de Bernoulli.',
      'Construire un intervalle de dispersion (paramètre connu, pour une variable aléatoire) et un intervalle de confiance (paramètre inconnu).',
      'Interpréter un intervalle de confiance, en particulier pour comparer deux groupes ou un sondage.',
    ],
    sections: [
      { id: 'lgn', t: 'La loi des grands nombres', sub: 'La moyenne converge vers l\'espérance', html: R`
${prop('Loi forte des grands nombres', R`<p>Soit \((X_n)\) une suite de variables aléatoires <b>indépendantes, identiquement distribuées et intégrables</b> (\(E(|X_1|)\lt+\infty\)). Alors</p>${M(R`\overline X_n=\frac1n\sum_{i=1}^nX_i\ \xrightarrow{\ p.s.\ }\ E(X),\qquad\text{c'est-à-dire}\qquad P\Big(\lim_{n\to+\infty}\overline X_n=E(X)\Big)=1.`)}<p>Les moyennes observées ont de très fortes chances de s'approcher de \(\mu\) quand \(n\) grandit.</p>`)}
${prop('Moyenne de n répétitions indépendantes', M(R`E(\overline X_n)=\mu,\qquad V(\overline X_n)=\frac{\sigma^2}n,\qquad\sigma(\overline X_n)=\frac\sigma{\sqrt n}`) + '<p>La dispersion de la moyenne diminue quand \\(n\\) grandit : c\'est la loi des grands nombres. \\(\\overline X_n\\) est un estimateur sans biais de \\(\\mu\\), de variance asymptotiquement nulle.</p>')}
${prop('Cas de Bernoulli', R`<p>Pour \(X\sim\mathcal{B}er(p)\) : \(E(X)=p\), \(V(X)=p(1-p)\). La moyenne \(\overline X_n\) est la <b>proportion</b> (la fréquence) de 1 : \(E(\overline X_n)=p\), \(V(\overline X_n)=\frac{p(1-p)}n\), et \(\overline X_n\to p\) : la proportion de 1 est aussi proche que possible de \(p\) à condition que \(n\) soit grand. \(\hat p=\overline X_n\) est un estimateur sans biais de \(p\).</p>`)}
${warn('l\'hypothèse d\'intégrabilité (TP séance 2)', R`<p>Pour la densité \(g(x)=\frac2{x^3}\) sur \([1,+\infty[\), \(E(X)=\int_1^{+\infty}\frac2{x^2}dx=2\) : la LGN s'applique. Pour \(f(x)=\frac1{x^2}\) sur \([1,+\infty[\), \(E(X)=\int_1^{+\infty}\frac1x\,dx=+\infty\) : la LGN ne s'applique pas, et la moyenne simulée ne se stabilise pas, elle fait des sauts quand une très grande valeur apparaît.</p>`)}
` },
      { id: 'tcl', t: 'Le théorème central limite', sub: 'La moyenne centrée réduite est approximativement normale', html: R`
<p>Rappel : \(X-E(X)\) est <b>centrée</b>, \(\frac{X-E(X)}{\sigma(X)}\) est <b>centrée réduite</b> (espérance 0, écart-type 1).</p>
${prop('Théorème central limite (TCL)', R`<p>Pour \(n\) répétitions indépendantes d'une même expérience d'espérance \(\mu\) et de variance \(\sigma^2\) finie, la moyenne centrée réduite se comporte comme une loi \(\mathcal N(0,1)\) quand \(n\) est grand :</p>${M(R`\frac{\overline X_n-\mu}{\sqrt{\sigma^2/n}}=\sqrt n\,\frac{\overline X_n-\mu}\sigma\ \xrightarrow[n\to+\infty]{\ loi\ }\ \mathcal N(0,1).`)}<p>Cas de Bernoulli : \(\dfrac{\overline X_n-p}{\sqrt{p(1-p)/n}}\to\mathcal N(0,1)\). Pour la somme \(S_n=\sum X_i\) : \(\dfrac{S_n-n\mu}{\sqrt{n\sigma^2}}\to\mathcal N(0,1)\).</p>`)}
<p>Le TCL est remarquable : il vaut <b>quelle que soit la loi de \(X\)</b> (exponentielle, Bernoulli, uniforme…), pourvu que la variance soit finie. Il faut une variance finie : pour \(g(x)=2/x^3\), \(E(X^2)=+\infty\) et l'histogramme des \(Z_i\) ne ressemble pas à une gaussienne (TP séance 2, question 8).</p>
${method('illustrer le TCL par simulation (TP séance 2)', code(R`N <- 100; n <- 100; lambda <- 4          # loi E(4) : mu = sigma = 1/4
X <- matrix(rexp(N * n, rate = lambda), nrow = N)
Z <- sqrt(n) * (rowMeans(X) - 1/lambda) / (1/lambda)
hist(Z, freq = FALSE, breaks = 20)
curve(dnorm(x), add = TRUE, col = "red")   # la densité N(0, 1)`))}
` },
      { id: 'disp', t: 'Intervalle de dispersion', sub: 'Paramètre connu : où tombera la variable aléatoire ?', html: R`
${def('Intervalle de dispersion', R`<p>On cherche un intervalle de grande probabilité pour les <b>réalisations d'une variable aléatoire</b> dont la loi est <b>connue</b>. On fixe une faible probabilité \(\alpha\) (1 %, 5 %, parfois 10 % ou 0,1 %) et on construit l'intervalle de dispersion de probabilité \(1-\alpha\) : une valeur prise par la variable a une probabilité \(1-\alpha\) d'y appartenir. Exemple : les courbes de croissance des carnets de santé.</p>`)}
<p>Pour \(Z\sim\mathcal N(0,1)\), on note \(\ell_{\alpha/2}\) le quantile tel que \(P(-\ell_{\alpha/2}\lt Z\lt\ell_{\alpha/2})=1-\alpha\) : \(ID_{1-\alpha}(Z)=[-\ell_{\alpha/2};\ell_{\alpha/2}]\), avec \(\ell=1{,}96\) à 95 % et \(\ell=2{,}576\) à 99 % (<code>qnorm(1 - alpha/2)</code>).</p>
${prop('Intervalle de dispersion d\'une moyenne (μ₀ et σ₀² connus, TCL)', M(R`ID_{1-\alpha}(\overline X)=\Big[\mu_0-\ell_{\alpha/2}\sqrt{\tfrac{\sigma_0^2}n}\ ;\ \mu_0+\ell_{\alpha/2}\sqrt{\tfrac{\sigma_0^2}n}\Big]`))}
${prop('Intervalle de dispersion d\'une somme de Bernoulli (p₀ connu)', M(R`ID_{1-\alpha}(S_n)=\Big[np_0-\ell_{\alpha/2}\sqrt{np_0(1-p_0)}\ ;\ np_0+\ell_{\alpha/2}\sqrt{np_0(1-p_0)}\Big]`) + R`<p>Pour la fréquence \(S_n/n\) : on divise par \(n\), soit \(\Big[p_0\pm\ell_{\alpha/2}\sqrt{\tfrac{p_0(1-p_0)}n}\Big]\) (CM, exercice 4).</p>`)}
${ex('500 naissances', R`<p>Nombre de garçons, \(p_0=1/2\) : \(\big[250-1{,}96\sqrt{125}\ ;\ 250+1{,}96\sqrt{125}\big]=[250-21{,}91;250+21{,}91]\approx[228;272]\) à 95 %, \([221;279]\) à 99 %. Pour 500 lancers d'une pièce, c'est donc \([228;272]\) et non \([240;260]\) ou \([180;320]\).</p>`)}
${ex('arrondi en supermarché (CM, exercice 5)', R`<p>L'arrondi \(A\) prend les valeurs −2, −1, 0, 1, 2 centimes avec la même probabilité (chaque valeur correspond à 2 chiffres sur 10, en supposant les derniers chiffres uniformes) : \(E(A)=0\), \(V(A)=\frac{4+1+0+1+4}5=2\) cts², \(\sigma=\sqrt2\approx1{,}41\) cts. Sur 20 000 produits : \(E=0\), \(V=40\,000\) cts², \(\sigma=200\) cts = 2 €. Intervalle de dispersion à 95 % du résultat : \([-1{,}96\times2;1{,}96\times2]\approx[-3{,}92;3{,}92]\) euros.</p>`)}
` },
      { id: 'ic', t: 'Intervalle de confiance', sub: 'Paramètre inconnu : un intervalle aléatoire qui le contient avec grande probabilité', html: R`
${def('Intervalle de confiance', R`<p>On cherche un intervalle de grande probabilité pour un <b>paramètre inconnu</b> de la loi. On fixe un <b>risque</b> \(\alpha\) et on construit \(IC_{1-\alpha}(\theta)=[B_1;B_2]\) : ses bornes sont des <b>variables aléatoires</b>, calculées avec les observations, et l'intervalle a une probabilité \(1-\alpha\) de contenir le paramètre.</p>`)}
${warn('dispersion ou confiance ?', R`<p><b>Dispersion</b> : le paramètre est connu, l'intervalle est fixe et on parie sur la future valeur de la variable aléatoire. <b>Confiance</b> : le paramètre est inconnu, l'intervalle est aléatoire (il change à chaque échantillon) et on parie qu'il contient le paramètre.</p>`)}
${prop('IC de μ pour une loi normale N(μ, σ²)', R`<p>Comme \(\frac{\overline X-\mu}{\sqrt{\sigma^2/n}}\sim\mathcal N(0,1)\) exactement, \(P\big(-\ell_{\alpha/2}\lt\frac{\overline X-\mu}{\sqrt{\sigma^2/n}}\lt\ell_{\alpha/2}\big)=1-\alpha\), d'où en isolant \(\mu\) :</p>${M(R`IC_{1-\alpha}(\mu)=\Big[\overline X-\ell_{\alpha/2}\sqrt{\tfrac{\sigma^2}n}\ ,\ \overline X+\ell_{\alpha/2}\sqrt{\tfrac{\sigma^2}n}\Big]\quad(\sigma^2\text{ connu}).`)}<p>Si \(\sigma^2\) est inconnu, on le remplace par la variance empirique \(\hat\sigma^2=\frac1n\sum(X_i-\overline X)^2\) : d'autant plus précis que \(n\) est grand.</p>`)}
${prop('IC de μ pour une loi quelconque (TCL)', R`<p>Le TCL donne la même construction, de manière <b>approchée</b>, avec \(\sigma^2\) remplacé par \(\hat\sigma^2\) : \(IC_{1-\alpha}(\mu)=\big[\overline X\pm\ell_{\alpha/2}\sqrt{\hat\sigma^2/n}\big]\). Il faut un nombre d'observations encore plus grand (approximation du TCL + estimation de \(\sigma^2\)).</p>`)}
${prop('IC d\'une proportion p (Bernoulli)', M(R`IC_{1-\alpha}(p)=\Big[\overline X-\ell_{\alpha/2}\sqrt{\tfrac{\overline X(1-\overline X)}n}\ ,\ \overline X+\ell_{\alpha/2}\sqrt{\tfrac{\overline X(1-\overline X)}n}\Big]`) + '<p>Probabilité approximativement \\(1-\\alpha\\) : on a utilisé le TCL puis remplacé \\(p\\) inconnu par son estimateur.</p>')}
<table class="t"><thead><tr><th>\(\overline x\) (n = 1000)</th><th>\(\sqrt{\overline x(1-\overline x)/n}\)</th><th>IC à 95 %</th><th>IC à 99 %</th></tr></thead><tbody>
<tr><td>0,2</td><td>0,01265</td><td>[0,1752 ; 0,2248]</td><td>[0,1674 ; 0,2326]</td></tr>
<tr><td>0,5</td><td>0,01581</td><td>[0,4690 ; 0,5310]</td><td>[0,4593 ; 0,5407]</td></tr>
<tr><td>0,9</td><td>0,00949</td><td>[0,8814 ; 0,9186]</td><td>[0,8756 ; 0,9244]</td></tr></tbody></table>
${ex('sondage (CM, exercice 6)', R`<p>42 personnes sur 98 votent A : \(\hat p=42/98\approx0{,}429\), \(IC_{95\%}=\big[0{,}429\pm1{,}96\sqrt{0{,}429\times0{,}571/98}\big]\approx[0{,}331;0{,}527]\). 0,5 est dans l'intervalle : il est <b>possible</b> que A soit élu. Avec 565 sur 1000 : \(IC_{95\%}\approx[0{,}534;0{,}596]\), entièrement au-dessus de 0,5 : il est peu probable (risque 5 %) que A ne soit pas élu.</p>`)}
${ex('deux parcelles (évaluation 2023, exercice 4)', R`<p>Groupe 1 (près d'une usine) : [63,1 ; 88,1] ; groupe 2 : [89,1 ; 119,7]. Les deux intervalles de confiance à 95 % sont <b>disjoints</b> : les rendements moyens semblent différents, plus faibles près de l'usine. Avec \(n=10\), le TCL est fragile : il faut supposer les rendements gaussiens (et un test de comparaison de moyennes serait plus rigoureux).</p>`)}
${method('calculer un IC à 95 % de μ', R`<ol><li>Hypothèses : échantillon i.i.d. ; loi normale, ou \(n\) grand (TCL).</li><li>Calculer \(\overline x\) et \(\hat\sigma^2\).</li><li>\(\big[\overline x-1{,}96\,\hat\sigma/\sqrt n\ ;\ \overline x+1{,}96\,\hat\sigma/\sqrt n\big]\) (théorème central limite).</li></ol>${code(R`x <- c(1.11, 1.66, 3.21, 2.02)
mean(x) + c(-1, 1) * qnorm(0.975) * sqrt(var(x) / length(x))`)}`)}
` },
    ],
    keep: [
      'LGN : X̄ₙ → E(X) presque sûrement, si i.i.d. et intégrables.',
      'E(X̄ₙ) = μ, V(X̄ₙ) = σ²/n, σ(X̄ₙ) = σ/√n.',
      'TCL : (X̄ₙ − μ)/√(σ²/n) → N(0, 1) quelle que soit la loi, si σ² < ∞.',
      'Quantiles : 1,96 (95 %) et 2,576 (99 %).',
      'Dispersion : paramètre connu, intervalle fixe pour la variable. Confiance : paramètre inconnu, intervalle aléatoire.',
      'IC(μ) = [x̄ ± ℓ √(σ̂²/n)] ; IC(p) = [x̄ ± ℓ √(x̄(1 − x̄)/n)].',
      'Deux IC disjoints : les paramètres semblent différents.',
    ],
  },
  /* ===================================================================== */
  {
    id: 's3', ch: 'tests', short: 'Tests & tests multiples', src: 'CM statistique, chap. 3 · Tests et corrections',
    t: 'Le test statistique et la correction des tests multiples',
    sub: 'Le raisonnement d\'un test (H0, zone de rejet, p-valeur, erreurs), les tests usuels sous R, les biais, et Bonferroni / Benjamini-Hochberg.',
    goals: [
      'Expliquer le principe d\'un test : raisonnement par l\'absurde sous H0, statistique de test, zone de rejet.',
      'Définir la p-valeur, le risque α, les erreurs de type I et II, et conclure correctement (on ne valide jamais H0).',
      'Choisir le test usuel adapté et sa fonction R.',
      'Expliquer pourquoi les tests multiples posent problème et appliquer Bonferroni (FWER) et Benjamini-Hochberg (FDR).',
    ],
    sections: [
      { id: 'principe', t: 'Principe d\'un test', sub: 'Le chocolat fait-il maigrir ?', html: R`
<p>Exemple du cours : on pèse un groupe de personnes au début et à la fin d'une étude, et on regarde la moyenne \(\overline X_n\) des différences de poids. Sur le groupe sans chocolat, on estime espérance et variance (chapitre 1) et on applique le TCL (chapitre 2) : on connaît la loi de \(\overline X_n\) <b>en l'absence d'effet</b>.</p>
${def('Hypothèses', R`<p>On oppose une <b>hypothèse nulle</b> \(H_0\) (« il n'y a pas d'effet », « il ne se passe rien ») à une hypothèse alternative \(H_1\). On <b>raisonne par l'absurde</b> en supposant \(H_0\) vraie, et on se demande si l'observation produit une <b>contradiction</b>.</p>`)}
${def('Statistique de test et zone de rejet', R`<p>On calcule une <b>statistique de test</b> dont la loi sous \(H_0\) est connue. La <b>zone de rejet</b> regroupe les valeurs très improbables sous \(H_0\) ; sa probabilité sous \(H_0\) est \(\alpha\) (souvent 5 %). Si la valeur observée \(M_{obs}\) tombe dans la zone de rejet, on <b>rejette \(H_0\)</b> (on conclut à un lien) ; sinon on ne rejette pas \(H_0\) (on ne peut pas affirmer qu'il y a un lien).</p>`)}
${def('p-valeur', R`<p>La <b>p-valeur</b> est l'aire « au-dessus » de la valeur observée : la probabilité, sous \(H_0\), d'observer une statistique au moins aussi extrême que celle observée. Elle mesure à quel point l'observation est extrême sous \(H_0\).</p><ul><li>p-valeur \(\le\alpha\) : on est dans la zone de rejet, on <b>rejette \(H_0\)</b>.</li><li>p-valeur \(\gt\alpha\) : on ne peut pas se distinguer de \(H_0\), <b>non-rejet</b>.</li></ul><p>La p-valeur est à peu près la probabilité de se tromper si on affirme qu'il y a un lien. Choix classiques de \(\alpha\) : 5 %, 1 %, 0,1 %.</p>`)}
${warn('ce qu\'un test permet de conclure', R`<ul><li>On ne « valide » <b>jamais</b> \(H_0\) : on la rejette, ou on ne la rejette pas (« le maïs OGM est sans danger » n'est pas une conclusion possible d'un test).</li><li>Plus la p-valeur est petite, moins on prend de risque en rejetant \(H_0\).</li><li>On a toujours un risque de se tromper, mais il est contrôlé par \(\alpha\) : en rejetant à 5 %, on se trompe environ 5 fois sur 100 expériences sans effet.</li></ul>`)}
` },
      { id: 'erreurs', t: 'Les deux erreurs', sub: 'Fausse découverte ou découverte manquée', html: R`
<table class="t"><thead><tr><th></th><th>\(H_0\) vraie</th><th>\(H_0\) fausse</th></tr></thead><tbody>
<tr><td>Ne pas rejeter \(H_0\)</td><td>décision correcte</td><td>erreur de type II (\(\beta\)) : passer à côté d'une découverte</td></tr>
<tr><td>Rejeter \(H_0\)</td><td>erreur de type I (\(\alpha\)) : faire une découverte à tort</td><td>décision correcte</td></tr></tbody></table>
<p>Le risque de première espèce est \(\alpha=P(\text{rejeter }H_0\mid H_0\text{ vraie})\). En statistique on considère souvent que l'erreur la plus grave est la <b>fausse découverte</b> (type I) : c'est pourquoi \(H_0\) est « pas de découverte » et qu'on fixe \(\alpha\) pour contrôler l'erreur de type I.</p>
` },
      { id: 'usuels', t: 'Les tests usuels avec R', sub: 'Choisir le test selon la question et les données', html: R`
<table class="t"><thead><tr><th>Question</th><th>Données</th><th>Conditions</th><th>Fonction R</th></tr></thead><tbody>
<tr><td rowspan="4">Moyenne</td><td>1 échantillon</td><td>n > 30 ou normalité</td><td><code>t.test(x, ...)</code></td></tr>
<tr><td>2 échantillons</td><td>normalité et variances égales</td><td><code>t.test(x, y, var.equal = T)</code></td></tr>
<tr><td>2 échantillons</td><td>normalité</td><td><code>t.test(x, y, var.equal = F)</code></td></tr>
<tr><td>2 éch. appariés</td><td>n > 30 ou normalité</td><td><code>t.test(x, y, paired = T)</code></td></tr>
<tr><td rowspan="3">Variance</td><td>1 échantillon</td><td>normalité</td><td><code>sigma2.test(x, ...)</code></td></tr>
<tr><td>2 échantillons</td><td>normalité</td><td><code>var.test(x, y)</code></td></tr>
<tr><td>2 échantillons</td><td>grand échantillon</td><td><code>asymp.test(x, y)</code></td></tr>
<tr><td rowspan="2">Corrélation</td><td>1 échantillon</td><td>normalité, \(H_0:\rho=\rho_0\)</td><td><code>cor.test(x, y)</code></td></tr>
<tr><td>2 échantillons</td><td>normalité</td><td><code>cor.test.2.sample(...)</code></td></tr>
<tr><td rowspan="3">Proportion</td><td>1 échantillon</td><td>np ≥ 5 et n(1 − p) ≥ 5</td><td><code>prop.test(...)</code></td></tr>
<tr><td>1 échantillon</td><td>—</td><td><code>binom.test(...)</code></td></tr>
<tr><td>2 échantillons</td><td>grand échantillon</td><td><code>prop.test(...)</code></td></tr>
<tr><td rowspan="3">Indépendance</td><td>tableau de contingence</td><td>effectifs théoriques ≥ 5</td><td><code>chisq.test(..., correct = F)</code> (khi-deux)</td></tr>
<tr><td>tableau 2 × 2</td><td>effectifs théoriques ≥ 2,5</td><td><code>chisq.test()</code> (correction de Yates)</td></tr>
<tr><td>tableau de contingence</td><td>—</td><td><code>fisher.test()</code> (test exact de Fisher)</td></tr>
<tr><td rowspan="3">Adéquation à une loi</td><td>1 échantillon</td><td>—</td><td><code>shapiro.test(x)</code> (normalité, Shapiro-Wilk)</td></tr>
<tr><td>1 échantillon</td><td>effectifs théoriques ≥ 5</td><td><code>chisq.test()</code> (khi-deux d'ajustement)</td></tr>
<tr><td>1 ou 2 échantillons</td><td>—</td><td><code>ks.test(x, ...)</code>, <code>ks.test(x, y)</code> (Kolmogorov-Smirnov)</td></tr>
<tr><td rowspan="4">Position (médiane)</td><td>1 échantillon, 2 éch., appariés</td><td>—</td><td><code>binom.test</code> (test du signe)</td></tr>
<tr><td>2 échantillons</td><td>min(n₁, n₂) > 10</td><td><code>wilcox.test(x, y, exact = F)</code> (Mann-Whitney)</td></tr>
<tr><td>2 échantillons</td><td>min(n₁, n₂) ≤ 10</td><td><code>wilcox.test(x, y)</code></td></tr>
<tr><td>2 éch. appariés</td><td>—</td><td><code>wilcox.test(x, y, paired = T)</code> (Wilcoxon)</td></tr>
</tbody></table>
<p>Source du tableau : <i>Le logiciel R</i>, Lafaye de Micheaux, Drouilhet et Liquet. Les tests sont utilisés dans tous les domaines (médecine et pharmacovigilance, industrie, économie, sociologie…) et sont en général fiables.</p>
${method('lire une sortie de test sous R', code(R`t.test(x, y)    # H0 : les deux moyennes sont égales
# La sortie donne la statistique t, les degrés de liberté et la p-value.
# Par exemple p-value = 0.033 < 0.05 : on rejette H0 au risque 5 %.`))}
` },
      { id: 'biais', t: 'Les biais possibles', sub: 'Pourquoi le résultat sur le chocolat est-il faux ?', html: R`
<ul>
<li><b>Valider \(H_0\)</b> : un non-rejet ne prouve pas l'absence d'effet.</li>
<li><b>Interprétation</b> : corrélation n'est pas causalité (tâches ménagères et divorce, consommation de chocolat et prix Nobel).</li>
<li><b>Tri des données, valeurs aberrantes</b> retirées ou ajoutées, <b>biais des indicateurs</b>, non-publication des résultats négatifs, publication partielle…</li>
<li><b>Pêche aux p-valeurs</b> (utilisation multiple des tests) : l'étude sur le chocolat (Bohannon, 2015) mesurait 18 variables (poids, cholestérol, sodium, sommeil, bien-être…) sur 15 personnes. Avec autant de tests, un résultat « significatif » est presque garanti.</li>
</ul>
${prop('Probabilité d\'au moins une fausse découverte', R`<p>Si aucun effet n'existe et qu'on fait \(m\) tests indépendants au seuil \(\alpha\), la probabilité de tomber au moins une fois dans la zone de rejet est</p>${M(R`1-(1-\alpha)^m,\qquad\text{soit pour }m=18,\ \alpha=0{,}05\ :\ 1-0{,}95^{18}\approx0{,}60.`)}`)}
` },
      { id: 'multi', t: 'Corriger les tests multiples', sub: 'FWER (Bonferroni) et FDR (Benjamini-Hochberg)', html: R`
<p>Pour \(m\) hypothèses nulles \(H_{0,1},\dots,H_{0,m}\), on veut une procédure qui décide lesquelles rejeter en <b>contrôlant l'erreur commise</b>. Quelle erreur ?</p>
${def('FWER (Family-Wise Error Rate)', R`<p>\(\text{FWER}=P(\text{rejeter au moins une }H_{0,i}\text{ à tort})=P(FP\ge1)\) : la probabilité de faire au moins une fausse découverte. But : \(\text{FWER}\le\alpha\). Principe : quitte à oublier des découvertes, on est sûr de la liste fournie.</p>`)}
${prop('Procédure de Bonferroni (1959)', R`<p>On ne garde (on ne rejette) que les \(H_{0,i}\) dont la p-valeur vérifie \(p_i\le\dfrac\alpha m\). Elle contrôle le FWER, mais elle est <b>très conservatrice</b> : quand \(m\) est grand, le seuil \(\alpha/m\) devient minuscule et on conserve souvent \(H_0\).</p>`)}
${def('FDR (False Discovery Rate)', R`<p>La proportion de fausses découvertes parmi les découvertes est \(\text{FDP}=\frac{FP}{FP+TP}\) (aléatoire). Son espérance est le <b>FDR</b> : \(\text{FDR}=E\big[\frac{FP}{FP+TP}\big]\), le taux moyen de rejets à tort parmi les hypothèses rejetées. But : \(\text{FDR}\le\alpha\). Principe : étude <b>prospective</b>, qui fournit une liste de candidats « potentiels » à valider ensuite (comme toujours en statistique). Moins strict que le FWER.</p>`)}
${prop('Procédure de Benjamini-Hochberg (1995)', R`<ol><li>Trier les p-valeurs : \(p_{(1)}\le\dots\le p_{(m)}\).</li><li>Chercher le plus grand rang \(k\) tel que \(p_{(k)}\le\alpha\dfrac km\) (alors pour tout \(j\le k\), on rejette).</li><li>Rejeter les \(k\) hypothèses \(H_{0(1)},\dots,H_{0(k)}\) aux plus petites p-valeurs.</li></ol><p>Elle contrôle le FDR <b>si les p-valeurs sont indépendantes</b>. Limite du FDR : la difficulté mathématique de trouver des procédures applicables sans hypothèses fortes.</p>`)}
${ex('5 tests simultanés au seuil 5 %', R`<table class="t"><thead><tr><th>\(i\)</th><th>Variable</th><th>\(p_{(i)}\)</th><th>\(i\alpha/m\)</th><th>Sans correction</th><th>Bonferroni (\(p\le0{,}01\))</th><th>BH</th></tr></thead><tbody>
<tr><td>1</td><td>score_A</td><td>0,0000</td><td>0,01</td><td>rejet</td><td>rejet</td><td>rejet</td></tr>
<tr><td>2</td><td>score_B</td><td>0,0144</td><td>0,02</td><td>rejet</td><td>non-rejet</td><td>rejet</td></tr>
<tr><td>3</td><td>score_C</td><td>0,1063</td><td>0,03</td><td>non-rejet</td><td>non-rejet</td><td>non-rejet</td></tr>
<tr><td>4</td><td>score_E</td><td>0,1100</td><td>0,04</td><td>non-rejet</td><td>non-rejet</td><td>non-rejet</td></tr>
<tr><td>5</td><td>score_D</td><td>0,1639</td><td>0,05</td><td>non-rejet</td><td>non-rejet</td><td>non-rejet</td></tr></tbody></table><p>Le plus grand rang avec \(p_{(k)}\le k\alpha/m\) est \(k=2\) : BH rejette A et B (2 découvertes), Bonferroni seulement A (1 découverte).</p>`)}
${method('sous R', code(R`pval <- c(0.0000, 0.0144, 0.1063, 0.1639, 0.1100)
p.adjust(pval, method = "bonferroni")
p.adjust(pval, method = "BH")`, R`[1] 0.0000 0.0720 0.5315 0.8195 0.5500
[1] 0.0000 0.0360 0.1375 0.1639 0.1375`) + '<p>On compare ensuite les p-valeurs <b>ajustées</b> à α = 0,05 : mêmes conclusions que le tableau.</p>')}
` },
    ],
    keep: [
      'Test = raisonnement par l\'absurde sous H0 « pas d\'effet » ; on rejette ou on ne rejette pas, on ne valide jamais H0.',
      'p-valeur ≤ α ⇒ rejet de H0 ; α = P(rejeter H0 | H0 vraie) = erreur de type I.',
      'Type I : fausse découverte (contrôlée par α) ; type II : découverte manquée.',
      'm tests sans effet : P(au moins un faux positif) = 1 − (1 − α)^m (≈ 0,60 pour m = 18).',
      'Bonferroni : rejeter si pᵢ ≤ α/m, contrôle le FWER, très conservateur.',
      'BH : trier, plus grand k avec p(k) ≤ kα/m, rejeter les k premières ; contrôle le FDR (p-valeurs indépendantes).',
      'R : p.adjust(p, "bonferroni"), p.adjust(p, "BH").',
    ],
  },
];

// Dans le HTML, un « < » suivi d'une lettre ouvrirait une balise : dans les formules, on écrit \lt à la place.
const lt = h => h.replace(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g, m => m.replace(/</g, '\\lt '));
lessonsStat.forEach(l => l.sections.forEach(s => { s.html = lt(s.html); }));
