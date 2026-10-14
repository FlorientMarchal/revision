// Labos R de la partie probabilités-statistique. TP vecteurs gaussiens : énoncé et corrigé (Quarto) fournis par
// l'enseignante. TP séance 2 (lois limites) : énoncé de l'enseignante, corrigé rédigé pour le site (le corrigé
// officiel n'a pas été fourni). Exercices : les questions « sous R » des exercices et de l'évaluation 2023.
const R = String.raw;

export const tpVec = {
  id: 'tpvec', short: 'TP vecteurs gaussiens', t: 'TP 1 — Vecteurs gaussiens',
  d: '<p>Simuler un vecteur gaussien, comparer moyennes et covariances empiriques aux valeurs théoriques, représenter la densité en 3D et ses courbes de niveau, et vérifier la propriété \\(AZ\\sim\\mathcal N(A\\mu,A\\Sigma A^T)\\). Les paquets <code>mvtnorm</code> et <code>lattice</code> s\'installent automatiquement au premier appel de <code>library()</code>.</p>',
  chunks: [
    { id: 'e1', t: 'Exercice 1 — Simulation', src: 'Bloc de l’énoncé',
      html: R`<p>On considère le vecteur gaussien centré \(Z=(X,Y)'\sim\mathcal N_2\Big(\begin{pmatrix}0\\0\end{pmatrix},\begin{pmatrix}4&1\\1&1\end{pmatrix}\Big)\).</p><ol><li>Définir sous R son vecteur moyen \(\mu\) et sa matrice de variance-covariance \(\Sigma\).</li><li>Charger le package <code>mvtnorm</code>, puis simuler \(n=1000\) réalisations du vecteur gaussien à l'aide de <code>rmvnorm</code>.</li></ol>`,
      code: R`library(mvtnorm)
n <- 1000
mu <- ...
Sigma <- ...
Z <- rmvnorm(n = n, mean = mu, sigma = Sigma)`,
      sol: R`library(mvtnorm)

n <- 1000

mu <- c(0,0)

Sigma <- matrix(c(4,1,1,1),nrow = 2, byrow = TRUE)

Z <- rmvnorm(n = n, mean = mu, sigma = Sigma)` },
    { id: 'e1b', t: 'Moyenne et variance empiriques', src: 'Bloc de l’énoncé',
      html: '<p>3. Calculer le vecteur des moyennes empiriques et la matrice de variance-covariance empirique. Comparer aux valeurs théoriques.</p>',
      code: R`colMeans(Z)
var(Z)`,
      after: '<p><b>Corrigé.</b> On remarque que la variance empirique est proche de la variance théorique (les moyennes sont proches de 0, la matrice proche de \\(\\Sigma\\)).</p>' },
    { id: 'e1c', t: 'Nuage de points et corrélation', src: 'Bloc de l’énoncé',
      html: '<p>4. Représenter le nuage de points des deux composantes et commenter sa forme. 5. Calculer la corrélation empirique et la comparer à la valeur théorique.</p>',
      code: R`plot(...)
cor(...)`,
      sol: R`plot(Z[,1], Z[,2],
     xlab = "X",
     ylab = "Y")
cor(Z[,1], Z[,2])`,
      solHtml: R`<pre class="r-solcode"><code>plot(Z[,1], Z[,2],
     xlab = "X",
     ylab = "Y")</code></pre><p>Le nuage montre une orientation croissante. Cela indique une liaison positive entre \(X\) et \(Y\). Théoriquement \(\rho=\frac{\mathrm{cov}(X,Y)}{\sigma_X\sigma_Y}=\frac1{2\times1}=0{,}5\).</p><pre class="r-solcode"><code>cor(Z[,1], Z[,2])</code></pre><p>La valeur empirique du coefficient de corrélation est proche de \(0.5\).</p>` },
    { id: 'e1d', t: 'Densité en trois dimensions', src: 'Bloc de l’énoncé',
      html: R`<p>6. Représenter en trois dimensions la densité du vecteur gaussien \((X,Y)'\) à l'aide de la fonction <code>persp</code>. Commenter la forme de la distribution et la relier au vecteur moyen et à la matrice de variance-covariance.</p>`,
      code: R`x1 <- seq(...)
x2 <- seq(...)
grille <- expand.grid(x1,x2)
densite <- dmvnorm(grille, mean = mu, sigma = Sigma)
densite <- matrix(densite, nrow = length(x1), ncol = length(x2))
persp(x1,x2,densite, ...)`,
      sol: R`x1 <- seq(-5, 5, 0.05)
x2 <- seq(-4, 4, 0.05)

grille <- expand.grid(x1, x2)

densite <- dmvnorm(grille,mean = mu,sigma = Sigma)

densite <- matrix(densite,nrow = length(x1),ncol = length(x2))


persp(x1, x2, densite,theta = 40,phi = 25,
      xlab = "X",
      ylab = "Y",
      zlab = "Densité")`,
      after: '<p><b>Commentaire.</b> La densité est une « cloche » centrée en \\(\\mu=(0,0)\\), allongée dans la direction de \\(X\\) (variance 4 contre 1) et inclinée dans le sens croissant (covariance positive).</p>' },
    { id: 'e1e', t: 'Autre méthode : wireframe et contourplot (lattice)', src: 'Corrigé',
      code: R`library(lattice)
g<-expand.grid(x=seq(-5,5,0.05), y=seq(-3,3,0.05))
g$z<-dmvnorm(x=cbind(g$x,g$y),mean=mu,sigma=Sigma)
print(wireframe(z~x*y, data=g, colorkey=TRUE, drape=TRUE))
print(contourplot(z ~ x * y,data = g,
            cuts = 10))` },
    { id: 'e2', t: 'Exercice 2 — Trois matrices de variance-covariance', src: 'Bloc de l’énoncé',
      html: R`<p>Soit les trois matrices \(\Sigma_1=\begin{pmatrix}1&0{,}95\\0{,}95&1\end{pmatrix}\), \(\Sigma_2=\begin{pmatrix}1&-0{,}95\\-0{,}95&1\end{pmatrix}\), \(\Sigma_3=\begin{pmatrix}1&0\\0&1\end{pmatrix}\). À l'aide des fonctions <code>expand.grid</code>, <code>dmvnorm</code> et <code>wireframe</code> du package <code>lattice</code>, représenter en trois dimensions les densités correspondant aux trois cas. Pour chacun : la liaison est-elle positive, négative ou nulle (on peut utiliser <code>contourplot()</code>) ? Commenter la forme et l'orientation de la densité.</p>`,
      code: R`library(mvtnorm)
library(lattice)
g <- expand.grid(x = seq(-2,2,0.05), y = seq(-2,2,0.05))
g$z <- dmvnorm(x = cbind(g$x,g$y), mean = c(0,0), sigma = ..., log = FALSE)
wireframe(z ~ x * y, data = g, colorkey = TRUE, drape = TRUE)`,
      sol: R`library(mvtnorm)
library(lattice)

g <- expand.grid(
  x = seq(-2, 2, 0.05),
  y = seq(-2, 2, 0.05)
)

Sigma1 <- matrix(c(1, 0.95,0.95, 1),nrow = 2, byrow = TRUE)

Sigma2 <- matrix(c(1, -0.95,-0.95, 1),nrow = 2, byrow = TRUE)

Sigma3 <- matrix(c(1, 0,0, 1),nrow = 2, byrow = TRUE)

# Premier cas
g$z <- dmvnorm(x = cbind(g$x, g$y),mean = c(0,0),sigma = Sigma1,log = FALSE)
print(wireframe( z ~ x * y, data = g, colorkey = TRUE, drape = TRUE ))
print(contourplot(z ~ x * y, data = g, cuts = 10))

# Deuxième cas
g$z <- dmvnorm(x = cbind(g$x, g$y), mean = c(0,0), sigma = Sigma2, log = FALSE)
print(wireframe(z ~ x * y, data = g, colorkey = TRUE, drape = TRUE))
print(contourplot(z ~ x * y, data = g, cuts = 10))

# Troisième cas
g$z <- dmvnorm(x = cbind(g$x, g$y), mean = c(0,0), sigma = Sigma3, log = FALSE)
print(wireframe(z ~ x * y, data = g, colorkey = TRUE, drape = TRUE))
print(contourplot(z ~ x * y, data = g, cuts = 10))`,
      solHtml: R`<p><b>Premier cas.</b> On obtient une densité fortement orientée dans le sens croissant : lorsque \(X\) augmente, \(Y\) a tendance à augmenter également. Cela correspond à une <b>forte liaison linéaire positive</b>, avec \(\rho=0.95\).</p><p><b>Deuxième cas.</b> La densité est cette fois orientée dans le sens décroissant : lorsque \(X\) augmente, \(Y\) a tendance à diminuer. Cela correspond à une forte liaison linéaire négative, avec \(\rho=-0.95\).</p><p><b>Troisième cas.</b> Ici la densité est symétrique autour de \((0,0)\) et ne présente pas d'orientation. La corrélation est nulle.</p><p>Dans le corrigé de l'enseignante, chaque cas est tracé avec <code>wireframe</code> puis <code>contourplot</code> (courbes de niveau). Ici les appels sont entourés de <code>print()</code>, nécessaire pour afficher un graphique <code>lattice</code> qui n'est pas la dernière instruction d'un bloc.</p>` },
    { id: 'e3', t: 'Exercice 3 — Transformation linéaire', src: 'Bloc de l’énoncé',
      html: R`<p>On définit \(U=X+Y\), \(V=2X-Y\), \(W=(U,V)'\) et \(Z=(X,Y)'\).</p><ol><li>Déterminer la matrice \(A\) telle que \(W=AZ\), puis la définir sous R.</li><li>Calculer <code>A %*% mu</code> et <code>A %*% Sigma %*% t(A)</code>. Que représentent ces deux résultats ?</li><li>Comparer \(A\Sigma A^T\) à la matrice de variance-covariance empirique du vecteur \((U,V)\).</li><li>Retrouve-t-on numériquement la propriété \(Z\sim\mathcal N(\mu,\Sigma)\Rightarrow AZ\sim\mathcal N(A\mu,A\Sigma A^T)\) ? Commenter.</li></ol>`,
      code: R`A <- matrix(c(...), nrow = 2, byrow = TRUE)
A %*% mu
A %*% Sigma %*% t(A)
var(cbind(U,V))`,
      sol: R`A <- matrix(c(1, 1,2,-1), nrow = 2, byrow = TRUE)

mu <- c(0,0)
A%*%mu
A %*% Sigma %*% t(A)

# A partir des simulations de l'exercice 1
X <- Z[,1]
Y <- Z[,2]

U <- X + Y
V <- 2*X - Y

var(cbind(U,V))`,
      solHtml: R`<p>\(A=\begin{pmatrix}1&1\\2&-1\end{pmatrix}\). <code>A %*% mu</code> est l'espérance de \(W\) (ici \((0,0)'\)) ; <code>A %*% Sigma %*% t(A)</code> est sa matrice de variance-covariance théorique, \(\begin{pmatrix}7&8\\8&13\end{pmatrix}\).</p><pre class="r-solcode"><code>A &lt;- matrix(c(1, 1,2,-1), nrow = 2, byrow = TRUE)
mu &lt;- c(0,0)
A%*%mu
A %*% Sigma %*% t(A)

# A partir des simulations de l'exercice 1
X &lt;- Z[,1]
Y &lt;- Z[,2]
U &lt;- X + Y
V &lt;- 2*X - Y
var(cbind(U,V))</code></pre><p>La matrice empirique (dans le corrigé : 6,69, 7,59 et 12,23) est proche de la matrice théorique (7, 8 et 13) : on retrouve numériquement la propriété, aux fluctuations d'échantillonnage près (elle se rapproche quand \(n\) augmente).</p>` },
  ],
};

export const tpLim = {
  id: 'tplim', short: 'TP lois limites', t: 'TP séance 2 — Lois limites de la statistique (simulation)',
  solLabel: 'Corrigé proposé (non officiel)',
  d: '<p>Illustrer par simulation la <b>loi des grands nombres</b> et le <b>théorème central limite</b>, et voir ce qui se passe quand leurs hypothèses ne sont pas vérifiées. Énoncé de l\'enseignante ; <b>le corrigé est rédigé pour ce site</b> (le corrigé officiel n\'a pas été fourni).</p>',
  chunks: [
    { id: 'q1', t: '1. Rappels', html: '<p>Rappeler ces deux théorèmes ainsi que leurs hypothèses.</p>',
      after: R`<p><b>Corrigé.</b> <b>LGN</b> : si \((X_n)\) sont i.i.d. et intégrables (\(E|X_1|\lt\infty\)), \(\overline X_n\to E(X_1)\) presque sûrement. <b>TCL</b> : si \((X_n)\) sont i.i.d. de variance \(\sigma^2\) finie, \(\sqrt n\,(\overline X_n-\mu)/\sigma\) converge en loi vers \(\mathcal N(0,1)\).</p>` },
    { id: 'q2', t: '2. LGN pour la loi exponentielle', src: 'À toi',
      html: R`<p>On prend une suite de \(n\) variables i.i.d. de loi exponentielle de paramètre \(\lambda=4\). Quelle est la moyenne théorique \(\mu\) ? Simuler \(n=8000\) telles variables et représenter \(Y_k=\frac1k\sum_{i=1}^kX_i\) en fonction de \(k\). Superposer une droite d'ordonnée égale à \(\mu\) (fonction <code>abline(a, b, col = "...")</code>, qui trace \(y=a+bx\)). Que remarque-t-on ?</p>`,
      code: '# À toi de jouer\n',
      sol: R`lambda <- 4
mu <- 1 / lambda                 # E(X) = 1/lambda = 0.25
n <- 8000
X <- rexp(n, rate = lambda)
Y <- cumsum(X) / (1:n)           # moyennes Y_1, ..., Y_n
plot(1:n, Y, type = "l", xlab = "k", ylab = "Y_k")
abline(mu, 0, col = "red")`,
      after: '<p><b>Corrigé.</b> \\(\\mu=1/\\lambda=0{,}25\\). La moyenne fluctue beaucoup pour les petits \\(k\\), puis se stabilise autour de la droite \\(y=0{,}25\\) : c\'est la loi des grands nombres.</p>' },
    { id: 'q3', t: '3. TCL pour la loi exponentielle', src: 'À toi',
      html: R`<p>Quelle est la variance \(\sigma^2\) de la loi ? Simuler \(N=100\) échantillons de \(n=100\) variables \((X_{i,j})\). Pour tout \(i\), poser \(Z_i=\sqrt n\,\dfrac{\frac1n\sum_jX_{i,j}-\mu}\sigma\). Représenter l'histogramme des \(Z_i\) (avec <code>freq=F</code> et un bon réglage de <code>breaks</code>). Quelle courbe superposer (fonction <code>curve</code> avec <code>add=T, col="red"</code>) ? Refaire avec \(N\) et \(n\) plus grands.</p>`,
      code: '# À toi de jouer\n',
      sol: R`lambda <- 4; mu <- 1/lambda; sigma <- 1/lambda   # V(X) = 1/lambda^2
N <- 100; n <- 100
X <- matrix(rexp(N * n, rate = lambda), nrow = N)   # une ligne = un échantillon
Z <- sqrt(n) * (rowMeans(X) - mu) / sigma
hist(Z, freq = FALSE, breaks = 15, main = "N = 100, n = 100")
curve(dnorm(x), add = TRUE, col = "red")

N <- 2000; n <- 500                                  # plus grand
X <- matrix(rexp(N * n, rate = lambda), nrow = N)
Z <- sqrt(n) * (rowMeans(X) - mu) / sigma
hist(Z, freq = FALSE, breaks = 30, main = "N = 2000, n = 500")
curve(dnorm(x), add = TRUE, col = "red")`,
      after: '<p><b>Corrigé.</b> \\(\\sigma^2=1/\\lambda^2=1/16\\). On superpose la densité de \\(\\mathcal N(0,1)\\) : l\'histogramme lui ressemble de plus en plus quand \\(N\\) et \\(n\\) augmentent (TCL), alors que la loi exponentielle est très dissymétrique.</p>' },
    { id: 'q45', t: '4-5. Une loi sans espérance', src: 'À toi',
      html: R`<p>On suppose maintenant que la loi des \(X_n\) a la densité \(f(x)=C/x^2\) si \(x\ge1\), 0 sinon. 4. Quelle doit être la constante \(C\) ? 5. Calculer la fonction de répartition \(F\), en déduire une façon de simuler \(n=8000\) variables de densité \(f\) <b>en n'utilisant que des variables de loi uniforme sur [0, 1]</b>. Représenter \(Y_k\) en fonction de \(k\). Augmenter \(n\). Semble-t-il y avoir convergence ? Expliquer.</p>`,
      code: '# À toi de jouer\n',
      sol: R`n <- 8000
U <- runif(n)
X <- 1 / U                 # F(x) = 1 - 1/x  =>  X = 1/(1 - U), et 1 - U a la même loi que U
Y <- cumsum(X) / (1:n)
plot(1:n, Y, type = "l", xlab = "k", ylab = "Y_k")

n <- 200000                # avec n plus grand
X <- 1 / runif(n)
plot(1:n, cumsum(X) / (1:n), type = "l", xlab = "k", ylab = "Y_k")`,
      after: R`<p><b>Corrigé.</b> \(\int_1^{+\infty}\frac C{x^2}dx=C\) donc \(C=1\). \(F(x)=1-\frac1x\) pour \(x\ge1\) ; méthode de la fonction inverse : si \(U\sim\mathcal U[0,1]\), \(X=F^{-1}(U)=\frac1{1-U}\) a la densité \(f\) (et on peut prendre \(1/U\)). La moyenne ne converge pas : elle fait des sauts à chaque très grande valeur et tend à augmenter. En effet \(E(X)=\int_1^{+\infty}\frac{x}{x^2}dx=+\infty\) : l'hypothèse d'intégrabilité de la LGN n'est pas vérifiée.</p>` },
    { id: 'q67', t: '6-7. Une loi avec espérance mais sans variance', src: 'À toi',
      html: R`<p>Densité \(g(x)=D/x^3\) si \(x\ge1\), 0 sinon. 6. Quelle doit être la constante \(D\) ? 7. Calculer la fonction de répartition \(G\), simuler \(n=8000\) variables de densité \(g\) à partir de variables uniformes. La loi des grands nombres s'applique-t-elle ici ? Justifier.</p>`,
      code: '# À toi de jouer\n',
      sol: R`n <- 8000
X <- 1 / sqrt(runif(n))    # G(x) = 1 - 1/x^2  =>  X = 1/sqrt(1 - U)
Y <- cumsum(X) / (1:n)
plot(1:n, Y, type = "l", xlab = "k", ylab = "Y_k")
abline(2, 0, col = "red")  # E(X) = 2`,
      after: R`<p><b>Corrigé.</b> \(\int_1^{+\infty}\frac D{x^3}dx=\frac D2\) donc \(D=2\). \(G(x)=1-\frac1{x^2}\) pour \(x\ge1\), d'où \(X=\frac1{\sqrt{1-U}}\) (ou \(1/\sqrt U\)). \(E(X)=\int_1^{+\infty}\frac2{x^2}dx=2\) est fini : la LGN s'applique et \(Y_k\to2\) (lentement).</p>` },
    { id: 'q8', t: '8. Et le TCL ?', src: 'À toi',
      html: R`<p>Que vaut l'espérance \(\mu\) de la loi ? Même stratégie qu'à la question 3 avec \(N=10000\) échantillons de \(n=10000\) variables (ici réduits pour que le calcul reste rapide dans le navigateur). Pour tout \(i\), \(Z_i=\sqrt n\big(\frac1n\sum_jX_{i,j}-\mu\big)\). Représenter l'histogramme des \(Z_i\). Que se passe-t-il et pourquoi ?</p>`,
      code: '# À toi de jouer\n',
      sol: R`mu <- 2
N <- 2000; n <- 2000           # 10000 x 10000 dans l'énoncé : trop lourd ici
X <- matrix(1 / sqrt(runif(N * n)), nrow = N)
Z <- sqrt(n) * (rowMeans(X) - mu)
hist(Z, freq = FALSE, breaks = 60)
curve(dnorm(x, mean(Z), sd(Z)), add = TRUE, col = "red")`,
      after: R`<p><b>Corrigé.</b> \(\mu=2\). L'histogramme n'a pas la forme d'une gaussienne : il est dissymétrique, avec une longue queue à droite et quelques valeurs très grandes. Le TCL ne s'applique pas car la variance est infinie : \(E(X^2)=\int_1^{+\infty}\frac2x\,dx=+\infty\).</p>` },
    { id: 'q9', t: '9. (optionnel) Autres lois', src: 'À toi',
      html: '<p>Refaire les questions 2 et 3 avec des lois de Poisson, de Bernoulli, uniformes.</p>',
      code: '# À toi de jouer\n',
      sol: R`N <- 1000; n <- 200
lois <- list(
  Poisson   = list(r = function(k) rpois(k, 3),       mu = 3,   s = sqrt(3)),
  Bernoulli = list(r = function(k) rbinom(k, 1, 0.3), mu = 0.3, s = sqrt(0.3 * 0.7)),
  Uniforme  = list(r = function(k) runif(k),          mu = 0.5, s = sqrt(1/12))
)
par(mfrow = c(1, 3))
for (nom in names(lois)) {
  L <- lois[[nom]]
  X <- matrix(L$r(N * n), nrow = N)
  Z <- sqrt(n) * (rowMeans(X) - L$mu) / L$s
  hist(Z, freq = FALSE, breaks = 25, main = nom)
  curve(dnorm(x), add = TRUE, col = "red")
}` },
  ],
};

export const rExos = {
  id: 'rexos', short: 'Exercices en R', t: 'Les questions « sous R » des exercices',
  solLabel: 'Corrigé',
  d: '<p>Les calculs à faire avec R dans la fiche d\'exercices, l\'évaluation 2023 et le cours de tests : probabilités des lois usuelles, densité d\'un vecteur gaussien, corrélation sur données groupées, intervalles de confiance et corrections de tests multiples.</p>',
  chunks: [
    { id: 'lois', t: 'Lois usuelles : d, p, q, r', src: 'R',
      html: R`<p>Exercices 1 à 4 du cours de probabilités. Pour chaque loi : <code>d…</code> densité ou \(P(X=k)\), <code>p…</code> fonction de répartition, <code>q…</code> quantile, <code>r…</code> simulation.</p>`,
      code: R`# Ex. 1 : X ~ P(3)
dpois(2, 3); ppois(2, 3); 1 - dpois(0, 3)
# Ex. 2 : X ~ B(10, 0.2)
dbinom(2, 10, 0.2); 1 - dbinom(0, 10, 0.2)
# Ex. 3 : T ~ E(2)
1 - pexp(1, rate = 2); pexp(1, 2) - pexp(0.5, 2)
# Ex. 4 : X ~ N(100, 15^2) : attention, R prend l'écart-type
pnorm(115, mean = 100, sd = 15)
pnorm(115, 100, 15) - pnorm(85, 100, 15)` },
    { id: 'eval1', t: 'Évaluation 2023, exercice 1 : composants électroniques', src: 'À toi',
      html: R`<p>Durées de vie exponentielles : moyenne 5 ans pour A (40 % du marché), 2,5 ans pour B. Calculer \(P(T_A\lt3)\), la probabilité qu'un composant pris au hasard sur le marché dure moins de 3 ans, puis la log-vraisemblance des 6 durées (0,78 ; 2,88 ; 5,15 ; 2,49 ; 6,80 ; 9,81) sous A et sous B.</p>`,
      code: '# À toi de jouer\n',
      sol: R`pexp(3, rate = 1/5)                                   # P(T_A < 3)
0.4 * pexp(3, rate = 1/5) + 0.6 * pexp(3, rate = 2/5)  # probabilités totales
x <- c(0.78, 2.88, 5.15, 2.49, 6.80, 9.81)
logv <- function(lambda) sum(dexp(x, rate = lambda, log = TRUE))   # = 6 log(lambda) - lambda sum(x)
c(A = logv(1/5), B = logv(2/5))` },
    { id: 'eval2', t: 'Évaluation 2023, exercice 2 : densité d\'un triplet gaussien', src: 'À toi',
      html: R`<p>\(T=(X,Y,Z)\), \(E(T)=(2,-0{,}5,0)'\), \(\Sigma=\begin{pmatrix}4&1&-2\\1&9&1{,}5\\-2&1{,}5&2\end{pmatrix}\). Donner les commandes R pour obtenir la densité en \((0,0,0)\), et vérifier \(V(Y+Z)\) et \(V(X+Y+Z)\).</p>`,
      code: '# À toi de jouer\n',
      sol: R`library(mvtnorm)
mu <- c(2, -0.5, 0)
Sigma <- matrix(c(4, 1, -2,
                  1, 9, 1.5,
                  -2, 1.5, 2), nrow = 3, byrow = TRUE)
dmvnorm(c(0, 0, 0), mean = mu, sigma = Sigma)
a <- c(0, 1, 1); t(a) %*% Sigma %*% a     # V(Y + Z) = 14
b <- c(1, 1, 1); t(b) %*% Sigma %*% b     # V(X + Y + Z) = 16
det(Sigma); solve(Sigma)                  # |Sigma| et Sigma^-1 de la formule` },
    { id: 'cor', t: 'Fiche, exercice 9 : corrélation taille-poids', src: 'Corrigé de l’enseignante',
      html: '<p>Données groupées : on remplace chaque classe par son centre, on reconstruit les 1000 couples avec les effectifs du tableau, puis on calcule la corrélation.</p>',
      code: R`taille <- c(162.5, 167.5, 172.5, 177.5, 182.5, 187.5, 192.5, 197.5)
poids <- c(67.5, 72.5, 77.5, 82.5, 87.5, 92.5, 97.5)
n <- matrix(c( 51,46,5,4,3,0,0, 86,137,46,11,2,0,0, 27,153,89,25,7,0,0, 5,45,91,40,6,0,0,
0,10,33,21,16,1,1, 0,1,4,11,10,3,0, 0,0,1,2,4,0,1, 0,0,0,0,1,1,0), nrow=8, byrow=TRUE)
T <- rep(taille, times=rowSums(n))
P <- unlist(lapply(1:8, function(i) rep(poids, times=n[i,])))
cor(T,P)`,
      after: '<p>On obtient \\(r\\approx0{,}60\\) : corrélation linéaire positive modérée entre taille et poids.</p>' },
    { id: 'ic', t: 'Intervalles de confiance (CM, exercice 6)', src: 'À toi',
      html: R`<p>Sondage : 42 personnes sur 98 votent pour A, puis 565 sur 1000. Calculer les intervalles de confiance à 95 % de \(p\).</p>`,
      code: '# À toi de jouer\n',
      sol: R`ic <- function(k, n, niveau = 0.95) {
  p <- k / n
  l <- qnorm(1 - (1 - niveau) / 2)        # 1.96 pour 95 %
  p + c(-1, 1) * l * sqrt(p * (1 - p) / n)
}
ic(42, 98)
ic(565, 1000)` },
    { id: 'multi', t: 'Tests multiples', src: 'R',
      html: R`<p>Probabilité d'au moins un faux positif parmi \(m\) tests sans effet, puis corrections de Bonferroni et de Benjamini-Hochberg sur l'exemple du cours. Une simulation : 18 variables sans aucun effet, testées sur 15 personnes.</p>`,
      code: R`1 - 0.95^18                        # au moins un faux positif sur 18 tests

pval <- c(0.0000, 0.0144, 0.1063, 0.1639, 0.1100)
p.adjust(pval, method = "bonferroni")
p.adjust(pval, method = "BH")

# Simulation : 18 mesures sans effet, 15 personnes, test de Student de moyenne nulle
p <- replicate(18, t.test(rnorm(15))$p.value)
sum(p < 0.05)                      # « découvertes » sans correction
sum(p.adjust(p, "bonferroni") < 0.05)` },
  ],
};

// Les corrections rédigées sont masquées : avec le code du corrigé (bouton « Voir le corrigé ») quand il y en a un,
// sinon dans un bloc dépliable.
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
for (const lab of [tpVec, tpLim, rExos]) for (const ch of lab.chunks) {
  if (!ch.after || !/^<p><b>(Corrigé|Commentaire)\.<\/b>/.test(ch.after)) continue;
  const txt = ch.after.replace(/^<p><b>(Corrigé|Commentaire)\.<\/b>\s*/, '<p>');
  if (ch.sol && !ch.solHtml) { ch.solHtml = `<pre class="r-solcode"><code>${esc(ch.sol)}</code></pre>` + txt; delete ch.after; }
  else if (!ch.sol) ch.after = `<details class="fold"><summary>Voir la correction</summary><div style="margin-top:8px">${txt}</div></details>`;
}
