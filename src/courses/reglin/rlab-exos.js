// Exercices en R : commandes R fournies par l'enseignante (fichiers CommandesR_ex4.4, CommandesR_ex6.5,
// CorrExos3_4TD2, Elements_correct_exos_révisions). Seules retouches : les sorties de la console collées
// dans ces fichiers (lignes « > … » et « [1] … ») sont retirées du code et données en « résultats attendus ».
const res = s => `<p><b>Résultats attendus (corrigé de l'enseignante) :</b> ${s}</p>`;

export const coursEx = {
  id: 'cours', short: 'Exemples du cours', t: 'Les exemples du cours en R',
  d: '<p>Les calculs matriciels des exemples 4.4 (bien-être) et 6.5 (données <i>longley</i>), refaits avec les commandes de l\'enseignante. Exécute ces blocs avant les exercices du TD 2 : ils créent des objets réutilisés ensuite.</p>',
  chunks: [
    { id: 'ex44', t: 'Exemple 4.4 : prédiction du sentiment de bien-être', src: 'CommandesR_ex4.4',
      html: '<p>Estimation de \\(\\hat\\beta=(X^TX)^{-1}X^Ty\\), des résidus, de \\(\\hat\\sigma^2\\), du \\(R^2\\) et du \\(R^2\\) ajusté.</p>',
      code: `x0=rep(1,10)
x1=c(2,2,0,0,0,1,0,0,2,0)
x2=c(17,20,21,18,31,34,20,17,48,16)
x3=c(52,56,27,34,29,38,38,25,53,36)

X=cbind(x0,x1,x2,x3)
y=c(21,26,37,40,35,37,35,26,42,38)



#Calcul beta "chapeau"

Ainv=solve(t(X)%*%X)

betac=Ainv%*%t(X)%*%y
betac



#Calcul résidus et sigma2 "chapeau"

yc=X%*%betac
epsilonc=y-yc

sigma2c=sum(epsilonc^2)/(10-1-3)



#Calcul R2 et R2tilde

SCR=sum(epsilonc^2)
SCT=sum((y-mean(y))^2)

R2=1-SCR/SCT
R2tilde= 1-((9*SCR)/(6*SCT))`,
      after: res('SCT = 432,1 ; R² = 0,7655. Le cours donne \\(\\hat\\beta = (3{,}2195\\ ;\\ -12{,}0562\\ ;\\ 0{,}5803\\ ;\\ 0{,}6411)\\) et \\(\\hat\\sigma^2 = 16{,}8852\\). Tape <code>SCT</code>, <code>R2</code>, <code>sigma2c</code> ou <code>R2tilde</code> dans un bloc pour les afficher.') },
    { id: 'ex65', t: 'Exemple 6.5 : données économiques (longley)', src: 'CommandesR_ex6.5',
      html: '<p>Intervalle de confiance de \\(\\beta_1\\) à 95 % et statistiques de Student \\(T_{j-1}\\).</p>',
      code: `#Cours 6.5 Exemple : Données économiques

Donnees=as.matrix(longley[9:16,c(2,5,7)])
un=rep(1,8)
X=cbind(un,Donnees[,1:2])
y=Donnees[,3]
t(X)%*%X
Ainv=solve(t(X)%*%X)
betac=Ainv%*%t(X)%*%y
sigma2c=sum((y-X%*%betac)^2)/5
ect_betajc = sqrt(sigma2c*diag(Ainv))
qt(0.975,5)
IC=c(betac[2]-qt(0.975,5)*ect_betajc[2],betac[2]+qt(0.975,5)*ect_betajc[2])
IC
Tj=betac/ect_betajc
Tj`,
      after: res('\\(\\hat\\beta=(120{,}0801\\ ;\\ 0{,}0882\\ ;\\ -0{,}7570)\\), \\(\\hat\\sigma^2=0{,}2563\\), \\(t_5(97{,}5\\,\\%)=2{,}57058\\), IC(β₁) = [0,02089 ; 0,15547], T = (4,471 ; 3,369 ; −2,391).') + '<p>Attention : ce bloc redéfinit <code>X</code>, <code>y</code>, <code>betac</code>… Réexécute l\'exemple 4.4 avant l\'exercice 4 du TD 2.</p>' },
  ],
};

export const td2Ex = {
  id: 'td2', short: 'TD 2 · exos 3 et 4', t: 'TD 2 : exercices 3 et 4 en R',
  d: '<p>Énoncés dans l\'onglet <b>TD corrigés</b>. Code : la correction de l\'enseignante (CorrExos3_4TD2).</p>',
  chunks: [
    { id: 'e3q1', t: 'Exercice 3, question 1 : estimer β', src: 'CorrExos3_4TD2',
      html: '<p>Perte de voix \\(y\\) du parti au pouvoir en fonction de \\(x_1\\) (sondages favorables, %) et \\(x_2\\) (modification du revenu par tête, euros), sur 6 élections.</p>',
      code: `y=c(6.3,2.5,1.3,4.9,-0.8,1.5)
x1=c(35,44,62,53,65,47)
x2=c(-30,90,-10,-10,50,90)
un=rep(1,6)
X=cbind(un,x1,x2)

t(X)%*%X

solve(t(X)%*%X)

t(X)%*%y

betac=solve(t(X)%*%X)%*%t(X)%*%y

betac`,
      after: res('\\(\\hat\\beta = (12{,}15266\\ ;\\ -0{,}17098\\ ;\\ -0{,}02720)\\).') },
    { id: 'e3q2', t: 'Question 2 : prévision', html: '<p>Sondage à 50 % de satisfaits, revenu par tête +60 euros.</p>' + res('+1,97 % de perte de voix (\\(12{,}1527-0{,}17098\\times50-0{,}0272\\times60\\)).') },
    { id: 'e3q3', t: 'Question 3 : test de β₁ = β₂ = 0 au seuil de 5 %', src: 'CorrExos3_4TD2',
      code: `yc=X%*%betac
epsilonc=y-yc

SCE=sum((yc-mean(y))^2)
SCR=sum(epsilonc^2)

SCE
SCR

F=(SCE/SCR)*(3/2)
F

qf(0.95,2,3)`,
      after: res('SCE = 29,98 ; SCR = 3,465 ; F = 12,98 &gt; \\(f_{2,3}(0{,}95)\\) = 9,55, donc rejet de \\(H_0\\).') },
    { id: 'e3q4', t: 'Question 4 : IC à 90 % de β₁', html: res('IC(β₁) = [−0,2708 ; −0,0712].') + '<p>Formule : \\(\\hat\\beta_1 \\mp t_{3}(0{,}95)\\,\\hat\\sigma\\sqrt{[(X^TX)^{-1}]_{22}}\\), avec \\(n-p-1=3\\) ddl.</p>' },
    { id: 'e4q1', t: 'Exercice 4, question 1 : tester β₁ = β₂ = 0 (exemple 4.4)', src: 'CorrExos3_4TD2',
      html: '<p>On compare le modèle complet au modèle réduit à la seule variable \\(x_3\\). Le corrigé rappelle les valeurs de l\'exemple 4.4 : SCT = 432,0999 et R² = 0,7655382 ; elles sont écrites ici en tête de bloc.</p>',
      code: `un=rep(1,10)
x1=c(2,2,0,0,0,1,0,0,2,0)
x2=c(17,20,21,18,31,34,20,17,48,16)
x3=c(52,56,27,34,29,38,38,25,53,36)
y=c(21,26,37,40,35,37,35,26,42,38)

SCT=432.0999
R2=0.7655382

Xr=cbind(un,x3)
betacr=solve(t(Xr)%*%Xr)%*%t(Xr)%*%y
ycr=Xr%*%betacr

betacr

ycr

SCEr=sum((ycr-mean(y))^2)
SCEr

R2r=SCEr/SCT
R2r

F2=((R2-R2r)/(1-R2))*(6/2)
F2

qf(0.95,2,6)`,
      after: res('\\(\\hat\\beta_r=(39{,}663\\ ;\\ -0{,}1537)\\), SCEr = 26,68, \\(R^2_r\\) = 0,0617, F = 9,005 &gt; \\(f_{2,6}(0{,}95)\\) = 5,143 : rejet de \\(H_0\\).') },
    { id: 'e4q2', t: 'Question 2 : intervalle de confiance des prévisions', src: 'CorrExos3_4TD2',
      html: '<p>Pour l\'ancien étudiant de la page 19 du cours (1 enfant, BEU = 30, NSE = 50). Le corrigé rappelle les valeurs du cours : \\(\\hat\\sigma^2 = 16{,}8852\\) et \\(\\hat y_0 = 40{,}6273\\) ; elles sont écrites ici en tête de bloc.</p>',
      code: `x0=c(1,1,30,50)

sigma2c=16.8852
y0c=40.6273

X=cbind(un,x1,x2,x3)
Ainv=solve(t(X)%*%X)
Ainv

qt(0.975,6)

Binf=y0c-qt(0.975,6)*sqrt(sigma2c*(1+t(x0)%*%Ainv%*%x0))
Binf

Bsup=y0c+qt(0.975,6)*sqrt(sigma2c*(1+t(x0)%*%Ainv%*%x0))
Bsup`,
      after: res('\\(t_6(97{,}5\\,\\%)\\) = 2,4469 ; intervalle [27,94 ; 53,31].') },
  ],
};

export const revEx = {
  id: 'rev', short: 'Exercices de révision', t: 'Exercices de révision en R',
  d: '<p>Énoncés dans l\'onglet <b>TD corrigés</b> (« Exercices de révision »). Code : les éléments de correction de l\'enseignante.</p>',
  chunks: [
    { id: 'r1a', t: 'Exercice 1, questions 1 à 4 : estimations', src: 'Elements_correct_exos_révisions',
      html: '<p>On part de \\(X^TX\\), \\(X^Ty\\), \\(\\sum y_i=100\\), \\(\\sum y_i^2=640\\) et SCR = 113,6471. Réponse 1 : \\(n = 40\\) (coefficient en haut à gauche de \\(X^TX\\)).</p>',
      code: `XX=matrix(c(40,0,0,0,0,20,15,4,0,15,30,10,0,4,10,35),ncol=4,byrow=T)
invXX=solve(XX)

Xy=c(100,50,40,80)

invXX%*%Xy

SCR=113.6471
sig2=SCR/(40-4)
sig2`,
      after: res('\\(\\hat\\beta = (2{,}5\\ ;\\ 2{,}5749\\ ;\\ -0{,}6830\\ ;\\ 2{,}1866)\\), \\(\\hat\\sigma^2 = 3{,}1569\\).') },
    { id: 'r1b', t: 'Question 5 : validité globale (Fisher, α = 5 %)', src: 'Elements_correct_exos_révisions',
      code: `ybar=100/40
SCT=640-40*ybar^2
SCT
SCE=SCT-SCR
SCE

F=((SCE/3)/(SCR/(40-4)))
F`,
      after: res('SCT = 390, SCE = 276,35, F = 29,18 : rejet de \\(H_0 : \\beta_1=\\beta_2=\\beta_3=0\\).') + '<p>Le corrigé ne donne pas le quantile ; tu peux l\'afficher avec <code>qf(0.95,3,36)</code> (≈ 2,87).</p>' },
    { id: 'r1c', t: 'Question 6 : test de β₃ = 0 (α = 1 %)', src: 'Elements_correct_exos_révisions',
      code: `T=2.1866/(sqrt(sig2*invXX[4,4]))
T
qt(0.995,df=36)`,
      after: res('T = 6,917 &gt; \\(t_{36}(0{,}995)\\) = 2,7195 : rejet de \\(H_0\\).') },
    { id: 'r1d', t: 'Question 7 : intervalle de prévision à 95 %', src: 'Elements_correct_exos_révisions',
      code: `v0 = c(1,1,-1,0.5)

y0c=sum(v0*t(invXX%*%Xy))
y0c

v0%*%invXX%*%v0
(1+v0%*%invXX%*%v0)^0.5

qt(0.975,df=36)

y0c-2.028*sig2^0.5*(1+v0%*%invXX%*%v0)^0.5
y0c+2.028*sig2^0.5*(1+v0%*%invXX%*%v0)^0.5`,
      after: res('\\(\\hat y_0 = 6{,}8512\\), intervalle [2,795 ; 10,907].') },
    { id: 'r2a', t: 'Exercice 2, questions 1 et 2 : régression simple', src: 'Elements_correct_exos_révisions',
      code: `X=cbind(rep(1,6),c(4,5,3,1,2,0),c(24,1,6,26,28,18))
Y=c(16, 17,  3,  4, 13,  2)

Xd=X[,1:2]

t(Xd)%*%Xd
det(t(Xd)%*%Xd)

invXX=solve(t(Xd)%*%Xd)
invXX

t(Xd)%*%Y

invXX%*%t(Xd)%*%Y

SCR=23.28*(6-2)
SCR

mean(Y^2)-(mean(Y))^2
SCT=6*39.80556
SCT

R2=1-SCR/SCT
R2`,
      after: res('\\(\\hat\\beta=(1{,}952\\ ;\\ 2{,}886)\\), SCR = 93,12, SCT = 238,83, R² = 0,6101.') },
    { id: 'r2b', t: 'Questions 5 et 6 : IC et test de Fisher pour l\'investissement', src: 'Elements_correct_exos_révisions',
      code: `qt(0.975,3)

0.3178-0.1893*qt(0.975,3)
0.3178+0.1893*qt(0.975,3)

F1=((0.799-0.61)/(1-0.799))*(3/1)
F1
qf(0.95,1,3)`,
      after: res('IC = [−0,2846 ; 0,9202] ; F = 2,82 &lt; \\(f_{1,3}(0{,}95)\\) = 10,13 : non-rejet de \\(H_0\\).') },
  ],
};
