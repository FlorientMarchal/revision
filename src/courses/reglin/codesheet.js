// Mémo R du cours de régression : lignes reprises des commandes R de l'enseignante (CommandesR_ex4.4, ex6.5,
// CorrExos3_4TD2, Elements_correct_exos_révisions) et du corrigé du TP 1 de validation.
const I = (n, code, note) => ({ n, code, note });

export const codesheet = [
  { part: 'Calcul matriciel', lang: 'R', t: 'Construire X et y', src: 'commandes de l\'enseignante', items: [
    I('Vecteur de 1 (la constante)', 'un=rep(1,10)'),
    I('Un régresseur', 'x1=c(2,2,0,0,0,1,0,0,2,0)'),
    I('Matrice de design X = (1, x₁, x₂, x₃)', 'X=cbind(x0,x1,x2,x3)'),
    I('Matrice saisie par lignes', 'XX=matrix(c(40,0,0,0,0,20,15,4,0,15,30,10,0,4,10,35),ncol=4,byrow=T)'),
    I('Extraire des lignes et colonnes d\'un jeu de données de R', 'Donnees=as.matrix(longley[9:16,c(2,5,7)])'),
    I('Garder les deux premières colonnes', 'Xd=X[,1:2]'),
  ] },
  { part: 'Calcul matriciel', lang: 'R', t: 'Moindres carrés à la main', src: 'commandes de l\'enseignante', items: [
    I('Transposée, produit, inverse', 't(X)%*%X\nsolve(t(X)%*%X)\nt(X)%*%y'),
    I('Déterminant', 'det(t(Xd)%*%Xd)'),
    I('β̂ = (XᵀX)⁻¹Xᵀy', 'Ainv=solve(t(X)%*%X)\nbetac=Ainv%*%t(X)%*%y'),
    I('Valeurs ajustées et résidus', 'yc=X%*%betac\nepsilonc=y-yc'),
    I('σ̂² = SCR / (n − p − 1)', 'sigma2c=sum(epsilonc^2)/(10-1-3)'),
    I('Écarts-types des β̂ⱼ', 'ect_betajc = sqrt(sigma2c*diag(Ainv))'),
    I('SCR, SCT, SCE', 'SCR=sum(epsilonc^2)\nSCT=sum((y-mean(y))^2)\nSCE=sum((yc-mean(y))^2)'),
    I('R² et R² ajusté', 'R2=1-SCR/SCT\nR2tilde= 1-((9*SCR)/(6*SCT))', 'Ici n − 1 = 9 et n − p − 1 = 6.'),
  ] },
  { part: 'Calcul matriciel', lang: 'R', t: 'Lois, tests et intervalles', src: 'commandes de l\'enseignante', items: [
    I('Quantile de Student t₅(0,975)', 'qt(0.975,5)'),
    I('Quantile de Fisher f₂,₃(0,95)', 'qf(0.95,2,3)'),
    I('IC d\'un coefficient', 'IC=c(betac[2]-qt(0.975,5)*ect_betajc[2],betac[2]+qt(0.975,5)*ect_betajc[2])'),
    I('Statistiques de Student', 'Tj=betac/ect_betajc'),
    I('Fisher du modèle complet', 'F=(SCE/SCR)*(3/2)', 'Ici p = 2 et n − p − 1 = 3.'),
    I('Fisher d\'un modèle réduit', 'F2=((R2-R2r)/(1-R2))*(6/2)'),
    I('Intervalle de prévision', 'Binf=y0c-qt(0.975,6)*sqrt(sigma2c*(1+t(x0)%*%Ainv%*%x0))\nBsup=y0c+qt(0.975,6)*sqrt(sigma2c*(1+t(x0)%*%Ainv%*%x0))'),
  ] },
  { part: 'Validation (TP)', lang: 'R', t: 'Simuler', src: 'corrigé du TP 1', items: [
    I('Graine (reproductibilité)', 'set.seed(2026)'),
    I('Covariables N(2, 1)', 'x <- matrix(NA,n,k)\n\nfor (i in 1:k) {\n  x[,i] <- rnorm(n , mean = 2, sd = 1)\n}\ncolnames(x) <- paste0("x", 1:k)', '<code>rnorm</code> prend l\'écart-type, pas la variance.'),
    I('Bruit et réponse', 'eps <- rnorm(n, mean = 0, sd = sigma)\ny   <- as.numeric(beta0 + x %*% beta + eps)'),
    I('data.frame', 'data <- data.frame(y = y, x)'),
  ] },
  { part: 'Validation (TP)', lang: 'R', t: 'Explorer et vérifier le rang', src: 'corrigé du TP 1', items: [
    I('Histogramme + densité théorique', 'hist(y, freq = FALSE, main = "Distribution de y", xlab = "y")\ncurve(dnorm(x, mean = 6, sd = sqrt(14)), add = TRUE, col = 2)'),
    I('Plusieurs graphiques', 'par(mfrow = c(2, 3))'),
    I('Rang de la matrice de design', 'qr(cbind(1, x))$rank'),
    I('Corrélations', 'library(corrplot)\ncorrplot(cor(x), method = "number", type = "upper")'),
    I('Nuages de points deux à deux', 'pairs(data, pch = 20, cex = 0.5)'),
    I('VIF à la main', 'vif <- sapply(1:k, function(j) 1 / (1 - summary(lm(x[, j] ~ x[, -j]))$r.squared))'),
    I('VIF avec le paquet car', 'car::vif(lm(y ~ x1 + x2 + x3 + x4 + x5, data = data))'),
    I('Indice de conditionnement', 'kappa(t(X_design)%*%X_design, exact = TRUE)\nkappa(X_design, exact= TRUE)', 'κ(XᵀX) = κ(X)².'),
  ] },
  { part: 'Validation (TP)', lang: 'R', t: 'Estimer et diagnostiquer', src: 'corrigé du TP 1', items: [
    I('Régression linéaire', 'reg <- lm(y ~ x1 + x2 + x3 + x4 + x5, data = data)   # équivalent à lm(y ~ ., data = data)'),
    I('Résumé (tests de Student, R², Fisher)', 'summary(reg)'),
    I('Coefficients et IC à 95 %', 'cbind(vrai = c(beta0, beta), estimation = coef(reg), confint(reg))'),
    I('Observé contre prédit', 'plot(reg$fitted.values, y, pch = 20, xlab = "y prédit", ylab = "y observé")\nabline(a = 0, b = 1, col = 2, lwd = 2)'),
    I('Résidus contre prédits, avec tendance', 'plot(reg$fitted.values, res, pch = 20, xlab = "Valeurs prédites", ylab = "Résidus")\nabline(h = 0, col = 2)\nlines(lowess(fitted(reg), res), col = 4, lwd = 2)'),
    I('QQ-plot', 'qqnorm(res, pch = 20, main = "QQ-plot des résidus")\nqqline(res, col = 2)'),
    I('Test de normalité', 'shapiro.test(res)', 'H₀ : les résidus sont gaussiens.'),
    I('R² d\'un ajustement', 'summary(fit)$r.squared'),
  ] },
];
