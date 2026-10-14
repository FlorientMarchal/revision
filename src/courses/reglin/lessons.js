// Le cours en entier, rédigé à partir des diapositives (partie modélisation) et du TP 1 (partie validation).
// Cours en cours : à compléter au fil des séances.
const r = String.raw;
const box = (k, title, html) => `<div class="box ${k}"><div class="box-h">${title}</div>${html}</div>`;
const def = (t, h) => box('def', 'Définition · ' + t, h);
const thm = (t, h) => box('prop', t, h);
const ex = (t, h) => box('ex', 'Exemple · ' + t, h);
const warn = (t, h) => box('warn', 'Attention · ' + t, h);
const proof = (t, h) => `<details class="fold"><summary>${t}</summary><div style="margin-top:8px">${h}</div></details>`;
const M = s => `<div class="math">\\[${s}\\]</div>`;

export const lessons = [
  {
    id: 'm1', ch: 'rlm', short: 'Régression multiple', src: 'Cours, parties I.1 à I.5',
    t: 'La régression linéaire multiple et les moindres carrés',
    sub: 'Le modèle, son écriture matricielle, l\'estimateur des moindres carrés et ses propriétés, les résidus, le coefficient de détermination.',
    goals: [
      'Écrire le modèle de régression linéaire multiple, élément par élément et sous forme matricielle, avec les hypothèses (H1) et (H2).',
      r`Démontrer la formule \(\hat\beta=(X^TX)^{-1}X^TY\) et connaître ses propriétés (sans biais, variance, Gauss-Markov).`,
      r`Calculer \(\hat\beta\), \(\hat y\), les résidus, \(\hat\sigma^2\), \(R^2\) et \(\tilde R^2\) à la main sur un petit exemple.`,
    ],
    sections: [
      { id: 'intro', t: 'Pourquoi plusieurs variables explicatives ?', sub: 'L\'exemple de la fécondité en Suisse (1888)', html: r`
<p>La régression linéaire multiple étend la régression simple : elle prend en compte <b>plusieurs variables explicatives</b> pour expliquer les variations d'une variable aléatoire <b>quantitative</b> \(Y\), c'est-à-dire mesurer l'effet de ces variables sur \(Y\). Elle sert aussi à <b>prédire</b> \(Y\) à partir de valeurs des variables explicatives.</p>
${ex('swiss (jeu de données de R)', r`<p>47 provinces francophones de Suisse vers 1888. On explique l'indice de fécondité par le % d'hommes dans l'agriculture, le % de conscrits au-delà du primaire (Education), le % de catholiques et la mortalité infantile. Quatre régressions simples \(y_i\approx\beta_0+\beta_1x_i\) donnent :</p>
<table class="t"><thead><tr><th></th><th>\(\hat\beta_0\)</th><th>\(\hat\beta_1\)</th><th>\(R^2\)</th></tr></thead><tbody>
<tr><td>Agriculture</td><td>60,3</td><td>0,194</td><td>0,1247</td></tr><tr><td>Education</td><td>79,6</td><td>−0,862</td><td>0,4406</td></tr><tr><td>Catholique</td><td>64,4</td><td>0,139</td><td>0,2150</td></tr><tr><td>Mortalité infantile</td><td>34,5</td><td>1,787</td><td>0,1735</td></tr></tbody></table>
<p>Avec les 4 variables en même temps, \(y_i\approx\beta_0+\beta_1x_{i1}+\dots+\beta_4x_{i4}\) donne \(\hat\beta=(62{,}1\ ;\ -0{,}155\ ;\ -0{,}98\ ;\ 0{,}125\ ;\ 1{,}078)\) et un \(R^2\) <b>ajusté</b> de 0,6707 : bien meilleur que n'importe quelle régression simple.</p>`)}
` },
      { id: 'modele', t: 'Le modèle', sub: 'Variable à expliquer, régresseurs, erreur', html: r`
${def('modèle de régression linéaire multiple', r`<p>La variable aléatoire \(Y\) (<b>variable à expliquer</b>, ou dépendante) dépend de \(p\) <b>régresseurs</b> \(x_1,\dots,x_p\) <b>déterministes</b> (connus, non aléatoires). Pour l'individu \(i\) :</p>${M(r`Y_i=\beta_0+\beta_1x_{i1}+\dots+\beta_px_{ip}+\varepsilon_i\qquad(1)`)}<p>où \(\beta_0,\dots,\beta_p\) sont des paramètres inconnus et \(\varepsilon_i\) l'<b>erreur</b> aléatoire, d'espérance nulle et de variance inconnue \(\sigma^2\) (un autre paramètre à estimer).</p>`)}
<p>Les paramètres sont estimés par la méthode des <b>moindres carrés</b> : on minimise</p>
${M(r`\sum_{i=1}^n\Big(Y_i-\beta_0-\sum_{j=1}^p\beta_jx_{ij}\Big)^2`)}
<p>On note \(\hat\beta_j\) les estimations, \(\hat Y_i=\hat\beta_0+\hat\beta_1x_{i1}+\dots+\hat\beta_px_{ip}\) la <b>valeur ajustée</b> et \(\hat\varepsilon_i=Y_i-\hat Y_i\) le <b>résidu</b> (erreur de reconstitution).</p>
` },
      { id: 'matrice', t: 'Écriture matricielle', sub: 'Y = Xβ + ε, hypothèses (H1) et (H2)', html: r`
${M(r`Y=X\beta+\varepsilon\qquad(2)`)}
<ul><li>\(Y=(Y_1,\dots,Y_n)^T\) : vecteur des réponses (taille \(n\)).</li><li>\(X=(\mathbf 1,x_1,\dots,x_p)\) : matrice \(n\times(p+1)\) dont la 1<sup>re</sup> colonne est le vecteur de 1 et la colonne \(j+1\) contient les \(x_{ij}\).</li><li>\(\beta=(\beta_0,\dots,\beta_p)^T\) : paramètres (taille \(p+1\)) ; \(\beta_0\) est la constante (<i>intercept</i>).</li><li>\(\varepsilon=(\varepsilon_1,\dots,\varepsilon_n)^T\) : erreurs.</li></ul>
${thm('Hypothèses', r`<ul><li><b>(H1)</b> \(X\) est de <b>plein rang</b> : \(\operatorname{rang}(X)=p+1\).</li><li><b>(H2)</b> Les erreurs sont <b>centrées</b>, de <b>même variance</b> et <b>non corrélées</b> : \(\mathbb E(\varepsilon)=0_n\) et \(\Sigma_\varepsilon=\sigma^2I_n\).</li></ul>`)}
` },
      { id: 'mco', t: 'L\'estimateur des moindres carrés', sub: 'Théorème 1 et sa preuve', html: r`
${thm('Théorème 1', r`<p>Sous (H1), \(X^TX\) est inversible et l'estimateur des moindres carrés de \(\beta\) est</p>${M(r`\hat\beta=(X^TX)^{-1}X^TY`)}`)}
${proof('Démonstration', r`<p>On minimise \(\|Y-X\beta\|^2=(Y-X\beta)^T(Y-X\beta)=Y^TY-2\beta^TX^TY+\beta^TX^TX\beta\). Sa dérivée par rapport à \(\beta\) vaut \(-2X^TY+2X^TX\beta\). En l'annulant : \(X^TX\hat\beta=X^TY\) (équations normales), d'où \(\hat\beta=(X^TX)^{-1}X^TY\).</p>`)}
${thm('Propriétés sous (H1)-(H2)', r`<ul><li>\(\hat\beta\) est <b>sans biais</b> : \(\mathbb E(\hat\beta)=\beta\).</li><li>Sa matrice de variance-covariance est \(\sigma^2_{\hat\beta}=\sigma^2(X^TX)^{-1}\) (3).</li><li><b>Gauss-Markov</b> : parmi les estimateurs sans biais <b>fonctions linéaires des \(Y_i\)</b>, \(\hat\beta\) est de <b>variance minimale</b>.</li></ul>`)}
` },
      { id: 'residus', t: 'Résidus et estimation de σ²', sub: 'Projection orthogonale', html: r`
<p>\(\hat Y=X\hat\beta=P_XY\) avec \(P_X=X(X^TX)^{-1}X^T\) : c'est la <b>projection orthogonale</b> de \(Y\) sur \(\mathrm{Vect}(X)\), le sous-espace engendré par les colonnes de \(X\). Le vecteur des résidus est \(\hat\varepsilon=Y-\hat Y=(I_n-P_X)Y\), orthogonal à \(\mathrm{Vect}(X)\), donc à \(\hat Y\).</p>
${thm('Estimateur sans biais de la variance', M(r`\hat\sigma^2=\frac{1}{n-p-1}\|\hat\varepsilon\|^2=\frac{1}{n-p-1}\sum_{i=1}^n\hat\varepsilon_i^2`))}
<p>En remplaçant \(\sigma^2\) par \(\hat\sigma^2\) dans (3) : \(\hat\sigma^2_{\hat\beta}=\hat\sigma^2(X^TX)^{-1}\), et pour chaque coefficient</p>
${M(r`\hat\sigma^2_{\hat\beta_{j-1}}=\hat\sigma^2[(X^TX)^{-1}]_{jj},\qquad \hat\sigma_{\hat\beta_{j-1}}=\sqrt{\hat\sigma^2[(X^TX)^{-1}]_{jj}}\qquad(4)`)}
<p>où \([(X^TX)^{-1}]_{jj}\) est le \(j\)-ième élément diagonal de \((X^TX)^{-1}\).</p>
${warn('le décalage d\'indice', r`<p>La \(j\)-ième ligne de \(X^TX\) correspond à \(\beta_{j-1}\) : la ligne 1 à la constante \(\beta_0\), la ligne 2 à \(\beta_1\), etc.</p>`)}
` },
      { id: 'exemple', t: 'Exemple 4.4 : le sentiment de bien-être', sub: 'Tous les calculs à la main', html: r`
<p>On prédit le score de bien-être (BE) sept ans après l'université à partir du nombre d'enfants pendant les études (NbEnfU), du bien-être pendant les études (BEU) et du niveau socio-économique des parents (NSE), sur 10 anciens étudiants.</p>
<table class="t"><thead><tr><th>i</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th></tr></thead><tbody>
<tr><th>NbEnfU</th><td>2</td><td>2</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>2</td><td>0</td></tr>
<tr><th>BEU</th><td>17</td><td>20</td><td>21</td><td>18</td><td>31</td><td>34</td><td>20</td><td>17</td><td>48</td><td>16</td></tr>
<tr><th>NSE</th><td>52</td><td>56</td><td>27</td><td>34</td><td>29</td><td>38</td><td>38</td><td>25</td><td>53</td><td>36</td></tr>
<tr><th>BE</th><td>21</td><td>26</td><td>37</td><td>40</td><td>35</td><td>37</td><td>35</td><td>26</td><td>42</td><td>38</td></tr></tbody></table>
${M(r`X^TX=\begin{pmatrix}10&7&242&388\\7&13&204&360\\242&204&6820&9679\\388&360&9679&16184\end{pmatrix},\quad X^Ty=\begin{pmatrix}337\\215\\8483\\12902\end{pmatrix}`)}
${M(r`(X^TX)^{-1}=\begin{pmatrix}7.9183&2.4750&-0.0493&-0.2154\\2.4750&0.9790&-0.0132&-0.0732\\-0.0493&-0.0132&0.0013&0.0007\\-0.2154&-0.0732&0.0007&0.0064\end{pmatrix},\quad \hat\beta=\begin{pmatrix}3.2195\\-12.0562\\0.5803\\0.6411\end{pmatrix}`)}
<p>Résidus : \(\hat\varepsilon=(-1{,}31\ ;\ -0{,}62\ ;\ 4{,}28\ ;\ 4{,}54\ ;\ -4{,}80\ ;\ 1{,}74\ ;\ -4{,}19\ ;\ -3{,}11\ ;\ 1{,}06\ ;\ 2{,}41)\), d'où \(\hat\sigma^2=\frac{1}{10-4}\sum\hat\varepsilon_i^2=16{,}8852\).</p>
<p>Équation : \(\hat y=3{,}2195-12{,}0562\,\text{NbEnfU}+0{,}5803\,\text{BEU}+0{,}6411\,\text{NSE}\). Pour 1 enfant, BEU = 30 et NSE = 50 : \(\hat y=40{,}6273\approx41\).</p>
<p>Ces calculs se refont en R dans l'onglet <b>R · TP et exercices</b> (« Exemples du cours »).</p>
` },
      { id: 'r2', t: 'Coefficient de détermination', sub: 'SCT = SCE + SCR, R² et R² ajusté', html: r`
${def('sommes des carrés', M(r`\mathrm{SCR}=\|Y-\hat Y\|^2=\|\hat\varepsilon\|^2,\qquad \mathrm{SCE}=\|\hat Y-\bar y\mathbf 1\|^2,\qquad \mathrm{SCT}=\|Y-\bar y\mathbf 1\|^2`) + r`<p>et on a \(\mathrm{SCT}=\mathrm{SCE}+\mathrm{SCR}\) (Pythagore, grâce à l'orthogonalité des résidus).</p>`)}
${def('coefficient de détermination', M(r`R^2=\frac{\mathrm{SCE}}{\mathrm{SCT}}=1-\frac{\mathrm{SCR}}{\mathrm{SCT}}`) + r`<p>Part de la variation de \(Y\) expliquée par le modèle : plus il est proche de 1, meilleure est la qualité d'ajustement.</p>`)}
${def('R² ajusté', M(r`\tilde R^2=1-\frac{n-1}{n-p-1}\,\frac{\mathrm{SCR}}{\mathrm{SCT}}`) + r`<p>Le \(R^2\) augmente mécaniquement quand on ajoute des régresseurs ; le \(R^2\) ajusté tient compte de leur nombre \(p\).</p>`)}
${ex('exemple 4.4', r`<p>SCT = 432,1 et \(R^2=0{,}7655\).</p>`)}
` },
    ],
    keep: [
      r`\(Y=X\beta+\varepsilon\), (H1) rang\((X)=p+1\), (H2) \(\mathbb E\varepsilon=0\), \(\Sigma_\varepsilon=\sigma^2I_n\).`,
      r`\(\hat\beta=(X^TX)^{-1}X^TY\) : sans biais, de variance \(\sigma^2(X^TX)^{-1}\), BLUE (Gauss-Markov).`,
      r`\(\hat\sigma^2=\|\hat\varepsilon\|^2/(n-p-1)\) ; \(\hat\sigma_{\hat\beta_{j-1}}=\sqrt{\hat\sigma^2[(X^TX)^{-1}]_{jj}}\).`,
      r`SCT = SCE + SCR ; \(R^2=\mathrm{SCE}/\mathrm{SCT}\) ; \(\tilde R^2=1-\frac{n-1}{n-p-1}\frac{\mathrm{SCR}}{\mathrm{SCT}}\).`,
    ],
  },
  {
    id: 'm2', ch: 'inf', short: 'Inférence gaussienne', src: 'Cours, partie I.6',
    t: 'Inférence dans le modèle gaussien',
    sub: 'Maximum de vraisemblance, lois des estimateurs, intervalles de confiance, tests de Student et de Fisher, prévision.',
    goals: [
      'Montrer que l\'estimateur du maximum de vraisemblance de β est celui des moindres carrés.',
      'Construire un intervalle de confiance et un test de Student pour un coefficient.',
      'Tester le modèle complet et un modèle réduit avec une statistique de Fisher.',
      'Donner un intervalle de confiance des prévisions.',
    ],
    sections: [
      { id: 'h3', t: 'L\'hypothèse gaussienne', sub: '(H3)', html: r`
${thm('Hypothèse (H3)', r`<p>Les erreurs sont <b>gaussiennes</b> : pour tout \(i\), \(\varepsilon_i\sim\mathcal N(0,\sigma^2)\).</p>`)}
<p>(H2) et (H3) impliquent que les erreurs sont <b>indépendantes</b> (non corrélées et gaussiennes) : \(\varepsilon\sim\mathcal N_n(0_n,\sigma^2I_n)\).</p>
` },
      { id: 'mv', t: 'Maximum de vraisemblance', sub: 'Théorème 2', html: r`
${thm('Théorème 2', r`<p>Sous (H1)-(H3), l'estimateur du maximum de vraisemblance de \(\beta\) est \(\hat\beta_{MV}=\hat\beta=(X^TX)^{-1}X^TY\).</p>`)}
${proof('Démonstration', r`<p>Les \(Y_i\sim\mathcal N(\beta_0+\sum_j\beta_jx_{ij},\sigma^2)\) sont indépendantes, donc la vraisemblance est</p>${M(r`L(y,X,\beta,\sigma^2)=\prod_{i=1}^n f_{Y_i}(y_i)=\Big(\frac{1}{2\pi\sigma^2}\Big)^{n/2}\exp\Big(-\frac{1}{2\sigma^2}\|y-X\beta\|^2\Big)`)}${M(r`\log L=-\frac n2\log\sigma^2-\frac n2\log2\pi-\frac{1}{2\sigma^2}\|y-X\beta\|^2`)}<p>Maximiser en \(\beta\) revient à minimiser \(\|y-X\beta\|^2\) : on retrouve les moindres carrés. La dérivée en \(\sigma^2\), \(-\frac{n}{2\sigma^2}+\frac{1}{2\sigma^4}\|y-X\beta\|^2\), s'annule en \(\hat\sigma^2_{MV}=\|\hat\varepsilon\|^2/n\).</p>`)}
${warn('σ² du maximum de vraisemblance', r`<p>\(\hat\sigma^2_{MV}=\|\hat\varepsilon\|^2/n\) est <b>biaisé</b> ; on lui préfère l'estimateur sans biais \(\hat\sigma^2=\|\hat\varepsilon\|^2/(n-p-1)\).</p>`)}
` },
      { id: 'lois', t: 'Lois des estimateurs', sub: 'Normale, χ², Student', html: r`
${thm('Propriétés sous (H1)-(H3)', r`<ol type="i"><li>\(\hat\beta\sim\mathcal N_{p+1}\big(\beta,\sigma^2(X^TX)^{-1}\big)\) ;</li><li>\(\dfrac{(n-p-1)\hat\sigma^2}{\sigma^2}\sim\chi^2(n-p-1)\) ;</li><li>\(\hat\beta\) et \(\hat\sigma^2\) sont indépendants ;</li><li>pour \(j=1,\dots,p+1\), \(T_{j-1}=\dfrac{\hat\beta_{j-1}-\beta_{j-1}}{\hat\sigma\sqrt{[(X^TX)^{-1}]_{jj}}}\sim\text{Student}(n-p-1)\) (conséquence de i à iii et de (4)).</li></ol>`)}
` },
      { id: 'ic', t: 'Intervalle de confiance d\'un coefficient', sub: 'Quantile de Student', html: r`
${thm(r`IC à \(1-\alpha\) de \(\beta_{j-1}\)`, M(r`\hat\beta_{j-1}\mp t_{n-p-1}(1-\alpha/2)\sqrt{\hat\sigma^2[(X^TX)^{-1}]_{jj}}`) + r`<p>où \(t_{n-p-1}(1-\alpha/2)\) est le quantile d'ordre \(1-\alpha/2\) de la loi de Student à \(n-p-1\) degrés de liberté.</p>`)}
` },
      { id: 'student', t: 'Test de Student de significativité', sub: 'H₀ : β = 0', html: r`
<p>On teste \(H_0:\beta_{j-1}=0\) contre \(H_1:\beta_{j-1}\ne0\). Sous \(H_0\),</p>
${M(r`T_{j-1}=\frac{\hat\beta_{j-1}}{\hat\sigma\sqrt{[(X^TX)^{-1}]_{jj}}}\sim\text{Student}(n-p-1)`)}
${thm('Région de rejet', r`<p>Rejet de \(H_0\) si \(|T_{j-1}|>t_{n-p-1}(1-\alpha/2)\).</p>`)}
${ex('données longley (exemple 6.5)', r`<p>Nombre d'actifs aux États-Unis (millions) expliqué par le PNB (milliards de dollars) et la population (millions), années 1955 à 1962 : \(n=8\), \(p=2\). On obtient \(\hat\beta=(120{,}0801\ ;\ 0{,}0882\ ;\ -0{,}7570)\), \(\hat\sigma^2=\frac{1}{8-3}\|y-X\hat\beta\|^2=0{,}2563\) et les écarts-types \((26{,}8533\ ;\ 0{,}0262\ ;\ 0{,}3167)\).</p><p>Avec \(t_5(97{,}5\,\%)=2{,}57058\) : \(IC(\beta_1)=[0{,}02089\ ;\ 0{,}15547]\). Les statistiques valent 4,471 ; 3,369 et −2,391 : à 5 %, on rejette \(\beta_0=0\) et \(\beta_1=0\), mais pas \(\beta_2=0\).</p>`)}
` },
      { id: 'fisher', t: 'Test du modèle complet', sub: 'Fisher et tableau d\'analyse de la variance', html: r`
<p>Sous \(H_0:\beta_1=\beta_2=\dots=\beta_p=0\),</p>
${M(r`F=\frac{\mathrm{SCE}/p}{\mathrm{SCR}/(n-p-1)}\sim\mathcal F_{p,\,n-p-1}`)}
<table class="t"><thead><tr><th>Source de variation</th><th>ddl</th><th>Somme des carrés</th><th>Variance</th><th>F</th></tr></thead><tbody>
<tr><td>Régression</td><td>\(p\)</td><td>SCE</td><td>SCE/\(p\)</td><td>\(F\)</td></tr><tr><td>Erreur</td><td>\(n-p-1\)</td><td>SCR</td><td>SCR/\((n-p-1)\)</td><td></td></tr><tr><td>Total</td><td>\(n-1\)</td><td>SCT</td><td></td><td></td></tr></tbody></table>
<p>On rejette \(H_0\) si \(F>f_{p,n-p-1}(1-\alpha)\). Ce test est d'un intérêt limité : il rejette dès qu'<b>une seule</b> variable est liée à \(Y\).</p>
` },
      { id: 'reduit', t: 'Test d\'un modèle réduit', sub: 'Modèles emboîtés', html: r`
<p>On teste \(H_0:\beta_1=\dots=\beta_q=0\) (\(q\lt p\), après avoir éventuellement réordonné les variables). Avec \(\mathrm{SCE}_q\), \(\mathrm{SCR}_q\), \(R^2_q\) du modèle réduit à \(p-q\) variables, sous \(H_0\) :</p>
${M(r`F_q=\frac{(\mathrm{SCE}-\mathrm{SCE}_q)/q}{\mathrm{SCR}/(n-p-1)}=\frac{(R^2-R^2_q)/q}{(1-R^2)/(n-p-1)}\sim\mathcal F_{q,\,n-p-1}`)}
${thm('Remarque', r`<p>Pour \(q=1\), \(F\) est le carré de la statistique de Student : les deux tests sont équivalents.</p>`)}
${ex('exemple 4.4, TD 2 exercice 4', r`<p>Tester \(\beta_1=\beta_2=0\) : modèle réduit à NSE seul, \(R^2_q=0{,}0617\), \(F=\frac{(0{,}7655-0{,}0617)/2}{(1-0{,}7655)/6}=9{,}005>f_{2,6}(0{,}95)=5{,}143\) : rejet.</p>`)}
` },
      { id: 'prevision', t: 'Prévisions', sub: 'Valeur prévue et intervalle', html: r`
<p>Pour une nouvelle observation \(x_0^T=(x_{01},\dots,x_{0p})\), dans le domaine où la linéarité reste valide : \(\hat y_0=\hat\beta_0+\hat\beta_1x_{01}+\dots+\hat\beta_px_{0p}\). En posant \(v_0=(1,x_0^T)^T\in\mathbb R^{p+1}\), l'intervalle de confiance des prévisions est</p>
${M(r`\Big[\hat y_0\mp t_{n-p-1}(1-\alpha/2)\,\hat\sigma\,\big(1+v_0^T(X^TX)^{-1}v_0\big)^{1/2}\Big]`)}
${ex('exemple 4.4', r`<p>Pour \(v_0=(1,1,30,50)\) : \(\hat y_0=40{,}63\), intervalle à 95 % : [27,94 ; 53,31].</p>`)}
` },
    ],
    keep: [
      r`(H3) : \(\varepsilon\sim\mathcal N_n(0,\sigma^2I_n)\) ; MV de \(\beta\) = MCO ; \(\hat\sigma^2_{MV}=\|\hat\varepsilon\|^2/n\) biaisé.`,
      r`\(T_{j-1}=\hat\beta_{j-1}/(\hat\sigma\sqrt{[(X^TX)^{-1}]_{jj}})\sim t(n-p-1)\) sous \(H_0\).`,
      r`Modèle complet : \(F=\frac{\mathrm{SCE}/p}{\mathrm{SCR}/(n-p-1)}\) ; réduit : \(F_q=\frac{(R^2-R^2_q)/q}{(1-R^2)/(n-p-1)}\).`,
      r`Prévision : \(\hat y_0\mp t\,\hat\sigma\sqrt{1+v_0^T(X^TX)^{-1}v_0}\).`,
    ],
  },
  {
    id: 'm3', ch: 'mcg', short: 'Moindres carrés généralisés', src: 'Cours, partie I.7',
    t: 'Moindres carrés généralisés',
    sub: 'Quand les erreurs sont corrélées : la variance n\'est plus σ²Iₙ.',
    sections: [
      { id: 'h2p', t: 'Erreurs corrélées', sub: 'Hypothèse (H′2)', html: r`
${thm('Hypothèse (H′2)', r`<p>Les erreurs sont centrées et \(\Sigma_\varepsilon=\sigma^2\Omega\), où \(\Omega\) est <b>connue</b>, symétrique <b>définie positive</b> et de rang \(n\).</p>`)}
<p>Sous (H1) et (H′2), l'estimateur des moindres carrés \(\hat\beta=(X^TX)^{-1}X^TY\) reste <b>sans biais</b>, mais sa variance devient \(\sigma^2(X^TX)^{-1}X^T\Omega X(X^TX)^{-1}\), et il <b>n'est plus de variance minimale</b> : Gauss-Markov ne s'applique plus.</p>
` },
      { id: 'mcg', t: 'L\'estimateur des MCG', sub: 'Se ramener au cas classique', html: r`
${thm('Estimateur des moindres carrés généralisés', M(r`\hat\beta_{MCG}=(X^T\Omega^{-1}X)^{-1}X^T\Omega^{-1}Y`))}
${proof('D\'où vient-il ?', r`<p>\(\Omega\) étant définie positive, il existe \(P\) inversible telle que \(\Omega=PP^T\). En multipliant (2) à gauche par \(P^{-1}\) : \(Y^*=X^*\beta+\varepsilon^*\) avec \(Y^*=P^{-1}Y\), \(X^*=P^{-1}X\), \(\varepsilon^*=P^{-1}\varepsilon\), et \(\Sigma_{\varepsilon^*}=\sigma^2P^{-1}\Omega P^{-T}=\sigma^2I_n\). Ce modèle vérifie les hypothèses des moindres carrés ; son estimateur \((X^{*T}X^*)^{-1}X^{*T}Y^*\) est exactement \(\hat\beta_{MCG}\).</p>`)}
${thm('Propriétés sous (H1) et (H′2)', r`<ul><li>\(\hat\beta_{MCG}\) est sans biais ;</li><li>\(\sigma^2_{\hat\beta_{MCG}}=\sigma^2(X^T\Omega^{-1}X)^{-1}\) ;</li><li>parmi les estimateurs sans biais fonctions linéaires des \(Y_i\), il est de <b>variance minimale</b> ;</li><li>\(\hat\sigma^2_{MCG}=\dfrac{\|Y-X\hat\beta_{MCG}\|^2_{\Omega^{-1}}}{n-p-1}\) est sans biais, avec \(\|A\|^2_{\Omega^{-1}}=A^T\Omega^{-1}A\).</li></ul><p>Sous hypothèse de normalité, on retrouve les mêmes tests de Student et de Fisher.</p>`)}
` },
    ],
    keep: [r`Erreurs corrélées : MCO sans biais mais pas optimal ; \(\hat\beta_{MCG}=(X^T\Omega^{-1}X)^{-1}X^T\Omega^{-1}Y\), de variance \(\sigma^2(X^T\Omega^{-1}X)^{-1}\).`],
  },
  {
    id: 'v1', ch: 'val', short: 'Valider un modèle', src: 'TP 1 de validation',
    t: 'Valider un modèle linéaire',
    sub: 'Vérifier une à une les hypothèses du modèle linéaire gaussien : rang plein, colinéarité, linéarité, homoscédasticité, indépendance, normalité. Partie construite à partir du TP 1 (en cours).',
    sections: [
      { id: 'principe', t: 'Le principe du TP', sub: 'Simuler pour connaître la vérité', html: r`
<p>On simule des données selon un modèle connu, \(Y=2+3x_1-x_2+\varepsilon\) avec \(\mathrm{Var}(\varepsilon)=4\) (\(n=200\), cinq covariables de moyenne 2 dont \(x_3,x_4,x_5\) inutiles), puis on estime le modèle et on vérifie les hypothèses. Comme la vérité est connue, on voit à quoi ressemblent des diagnostics « satisfaisants », qui servent ensuite de référence sur des données réelles.</p>
${warn('rnorm', r`<p><code>rnorm</code> prend l'<b>écart-type</b>, pas la variance : \(\sigma^2=4\) donc <code>sd = 2</code>.</p>`)}
` },
      { id: 'rang', t: 'Rang plein et multicolinéarité', sub: 'Rang, corrélations, VIF, conditionnement', html: r`
<ul><li><b>Rang</b> : c'est le rang de la matrice de design \([\mathbf 1,x]\) (avec la colonne de 1) qui doit valoir \(k+1\) pour que \(X^TX\) soit inversible (<code>qr(cbind(1, x))$rank</code>).</li><li><b>Corrélations deux à deux</b> (<code>corrplot</code>, <code>pairs</code>) : nécessaires mais pas suffisantes, car la colinéarité peut venir d'une combinaison de plusieurs variables.</li></ul>
${def('VIF', M(r`\mathrm{VIF}_j=\frac{1}{1-R_j^2}`) + r`<p>où \(R_j^2\) est le \(R^2\) de la régression de \(x_j\) sur les autres covariables. Il mesure de combien la variance de \(\hat\beta_j\) est multipliée par la corrélation de \(x_j\) avec les autres. VIF = 1 : aucune corrélation ; on s'inquiète au-delà de 5 ou 10. Il ne dépend que des covariables, pas de \(y\).</p>`)}
${def('indice de conditionnement', M(r`\kappa(X^TX)=\frac{\lambda_{\max}(X^TX)}{\lambda_{\min}(X^TX)}=\kappa(X)^2,\qquad \kappa(X)=\frac{\sigma_{\max}(X)}{\sigma_{\min}(X)}`) + r`<p>Comme \((X^TX)^{-1}=\sum_i\frac{1}{\lambda_i}v_iv_i^T\), une petite valeur propre est amplifiée : la variance de \(\hat\beta\) le long de \(v_i\) vaut \(\sigma^2/\lambda_i\). Repères (Belsley, Kuh et Welsch) : \(\kappa(X)<10\) pas de problème, de 10 à 30 colinéarité modérée, au-delà de 30 sévère.</p>`)}
${warn('l\'intercept et les variables non centrées', r`<p>Avec des covariables de moyenne 2, l'indice est plus élevé avec la colonne de 1 : quasi-colinéarité artificielle qui disparaît quand on centre. L'indice de conditionnement dépend de l'échelle des colonnes, pas les VIF.</p>`)}
` },
      { id: 'estim', t: 'Estimation et lecture du résumé', sub: 'lm(), summary(), confint()', html: r`
<ul><li>Les estimations de la constante, de \(\beta_1\) et \(\beta_2\) sont proches de 2, 3 et −1 ; les vraies valeurs sont en général dans les IC à 95 %. Mais pour 6 paramètres simultanément, la probabilité n'est que d'environ \(0{,}95^6\approx73\,\%\) (si les estimateurs étaient indépendants).</li><li>Les coefficients de \(x_3,x_4,x_5\) sont proches de 0, avec de grandes p-valeurs. Une variable inutile peut sortir significative par hasard : erreur de type I.</li><li>L'écart-type résiduel estimé est proche de \(\sigma=2\).</li></ul>
${thm('R² théorique', M(r`R^2_{\text{théorique}}=\frac{\mathrm{Var}(X\beta)}{\mathrm{Var}(X\beta)+\sigma^2}=\frac{10}{14}\approx0{,}71`) + r`<p>Le \(R^2\) mesure la part de variance expliquée, pas la justesse des coefficients : on l'augmente sans changer \(\beta\) en réduisant \(\sigma\) ou en dispersant davantage les covariables (\(\mathrm{sd}_x=3\) donne \(90/94\approx0{,}96\)).</p>`)}
` },
      { id: 'adequation', t: 'Adéquation et résidus', sub: 'Les graphiques à savoir lire', html: r`
<ul><li><b>Observé contre prédit</b> : nuage centré sur la première bissectrice, sans courbure. Utile mais insuffisant : il ne dit rien sur l'homoscédasticité ou la normalité.</li><li><b>Résidus contre ordre des observations</b> : ni tendance ni regroupement (indépendance).</li><li><b>Résidus contre valeurs prédites</b> et <b>contre chaque \(x_j\)</b>, avec une courbe de tendance <code>lowess</code> : plate autour de 0 (linéarité), dispersion constante (homoscédasticité).</li><li><b>Histogramme et QQ-plot</b> des résidus, <b>test de Shapiro-Wilk</b> (\(H_0\) : normalité) : normalité (H3).</li></ul>
<p>Avec une constante dans le modèle, les résidus sont de moyenne exactement nulle.</p>
<figure style="margin:0"><img src="img/residus.webp" alt="Trois graphiques de résidus en fonction des valeurs prédites" style="max-width:100%;border:1px solid var(--line);border-radius:6px;background:#fff"><figcaption class="math-note">Exercices de révision, exercice 3 : (a) rien à signaler ; (b) entonnoir, donc hétéroscédasticité ; (c) courbure, donc non-linéarité.</figcaption></figure>
` },
      { id: 'synthese', t: 'Synthèse', sub: 'Hypothèse, outil, symptôme', html: r`
<table class="t"><thead><tr><th>Hypothèse</th><th>Outil graphique</th><th>Test / indicateur</th><th>Symptôme de violation</th></tr></thead><tbody>
<tr><td>Linéarité</td><td>résidus vs prédictions et vs \(x_j\)</td><td><code>anova</code> entre modèles emboîtés</td><td>courbure (U ou S)</td></tr>
<tr><td>Rang plein (H1)</td><td><code>corrplot</code>, <code>pairs</code></td><td>rang de \([1,x]\), VIF, conditionnement</td><td>rang &lt; \(k+1\), corrélations proches de ±1, VIF &gt; 5 ou 10, \(\kappa(X)>30\)</td></tr>
<tr><td>Homoscédasticité (H2)</td><td>résidus vs prédictions</td><td>—</td><td>entonnoir</td></tr>
<tr><td>Indépendance (H2)</td><td>résidus vs ordre</td><td>—</td><td>tendance ou regroupement</td></tr>
<tr><td>Normalité (H3)</td><td>QQ-plot, histogramme</td><td>Shapiro-Wilk</td><td>points qui s'écartent de la droite aux extrémités</td></tr></tbody></table>
<p class="math-note">Tableau repris du corrigé du TP. La question 8 (simplifier le modèle) n'est pas encore corrigée.</p>
` },
    ],
    keep: [
      'Rang de [1, x] = k + 1 ; VIF > 5 ou 10 et κ(X) > 30 signalent la colinéarité.',
      'Résidus : sans structure, centrés, de variance constante, gaussiens (QQ-plot, Shapiro-Wilk).',
      'Entonnoir = hétéroscédasticité ; courbure = non-linéarité ; tendance selon l\'ordre = dépendance.',
      'Le R² dépend de β, de la dispersion des x et du bruit : ce n\'est pas une mesure de justesse des coefficients.',
    ],
  },
];
