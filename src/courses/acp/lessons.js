// Le cours en entier, leçon par leçon, rédigé à partir des diapositives (notations, ACP : problèmes et solutions, analyse
// des résultats, Varimax, features engineering, CLV) et du document de démonstrations de l'enseignant.
// Les gabarits utilisent String.raw (R`…`) pour que les antislashs du LaTeX passent tels quels.
const R = String.raw;
const box = (k, title, html) => `<div class="box ${k}"><div class="box-h">${title}</div>${html}</div>`;
const def = (t, h) => box('def', 'Définition · ' + t, h);
const prop = (t, h) => box('prop', t, h);
const ex = (t, h) => box('ex', 'Exemple · ' + t, h);
const warn = (t, h) => box('warn', 'Attention · ' + t, h);
const method = (t, h) => box('method', 'Méthode · ' + t, h);
const proof = (t, h) => `<details class="fold"><summary>${t}</summary><div style="margin-top:8px;display:grid;gap:8px">${h}</div></details>`;
const M = tex => `<div class="math">\\[${tex}\\]</div>`;
const demo = name => `<figure class="viz" data-viz="${name}"></figure>`;
const D = '<p class="math-note">Démonstration à savoir faire : elle est corrigée dans l\'onglet <b>Démonstrations</b>.</p>';

export const lessons = [
  /* ===================================================================== */
  {
    id: 'a1', ch: 'notations', short: 'Notations', src: 'Notations et statistiques de base',
    t: 'Notations et statistiques de base',
    sub: 'Le tableau de données, les poids des individus, le centre de gravité, le tableau centré et réduit, la matrice de variance-covariance et l\'inertie.',
    goals: [
      'Écrire le tableau des observations, ses colonnes (variables) et ses lignes (individus) avec les notations du cours.',
      'Calculer le centre de gravité, le tableau centré et la matrice de variance-covariance sous forme matricielle.',
      'Passer au tableau réduit et à la matrice des corrélations.',
      'Définir l\'inertie d\'un nuage et montrer qu\'elle vaut la somme des variances.',
    ],
    sections: [
      { id: 'plan', t: 'Le plan du cours', sub: 'Analyse de données multidimensionnelles', html: R`
<ol><li>ACP : problématiques et solutions ;</li><li>ACP : analyse des résultats et Varimax ;</li><li>ACP : features engineering et CLV ;</li><li>ACP sur données temporelles ;</li><li>clustering sur réduction de dimensions.</li></ol>
<p class="math-note">Le site couvre pour l'instant les parties 1 à 3.</p>
` },
      { id: 'donnees', t: 'Le jeu de données', sub: 'n individus, p variables quantitatives', html: R`
<p>Soit \(p\ge2\) le nombre de variables (toutes considérées quantitatives) et \(n\) le nombre d'individus. La <b>matrice des observations</b> est</p>
${M(R`\underset{n\times p}{\mathbf X}=\begin{bmatrix}x_{1,1}&\cdots&x_{1,j}&\cdots&x_{1,p}\\ \vdots&&\vdots&&\vdots\\ x_{i,1}&\cdots&x_{i,j}&\cdots&x_{i,p}\\ \vdots&&\vdots&&\vdots\\ x_{n,1}&\cdots&x_{n,j}&\cdots&x_{n,p}\end{bmatrix}`)}
<p>où \(x_{i,j}\) est la réponse de l'individu \(i\) à la variable \(j\).</p>
<ul><li>\(\underset{n\times1}{\mathbf x_j}=[x_{1,j}\ \cdots\ x_{n,j}]^t\) : la <b>colonne</b> \(j\), les réponses des \(n\) individus pour la variable \(j\).</li>
<li>\(\underset{1\times p}{{}_i\mathbf x}=[x_{i,1}\ \cdots\ x_{i,p}]\) : la <b>ligne</b> \(i\), les réponses de l'individu \(i\).</li></ul>
` },
      { id: 'poids', t: 'La pondération', sub: 'La matrice des poids N', html: R`
${def('Matrice des poids', M(R`\underset{n\times n}{\mathbf N}=\mathrm{diag}\big([w_1\ \cdots\ w_i\ \cdots\ w_n]\big)\qquad\text{avec}\quad\sum_{i=1}^nw_i=1`) + R`<p>Le cas usuel est celui des poids uniformes \(w_i=1/n\) ; les poids permettent de donner plus d'importance à certains individus (par exemple quand une ligne représente un groupe).</p>`)}
` },
      { id: 'stats', t: 'Statistiques descriptives', sub: 'Centre de gravité, tableau centré, variance-covariance', html: R`
${def('Centre de gravité', R`<p>Mesure de la tendance centrale du nuage des individus :</p>${M(R`\underset{1\times p}{\mathbf g}=[\bar x_1\ \cdots\ \bar x_j\ \cdots\ \bar x_p]=\underset{n\times1}{\mathbf 1}^t\times\underset{n\times n}{\mathbf N}\times\underset{n\times p}{\mathbf X}=\sum_{i=1}^nw_i\,{}_i\mathbf x`)}`)}
${def('Tableau centré', R`<p>Le tableau dont le centre de gravité est l'origine, noté \(\underset{n\times p}{\mathbf Y}\) :</p>${M(R`\mathbf Y=\mathbf X-\underset{n\times1}{\mathbf 1}\times\underset{1\times p}{\mathbf g}=\big(\mathbf{Id}_n-\mathbf 1\,\mathbf 1^t\,\mathbf N\big)\,\mathbf X`)}${D}`)}
${def('Matrice de variance-covariance', R`<p>Elle mesure la force des liaisons (linéaires) entre chaque couple de variables : les variances \(\sigma_j^2\) sur la diagonale, les covariances \(\mathrm{cov}(\mathbf x_j,\mathbf x_{j'})\) ailleurs.</p>${M(R`\underset{p\times p}{\mathbf V}=\mathbf X^t\,\mathbf N\,\mathbf X-\mathbf g^t\,\mathbf g=\mathbf Y^t\,\mathbf N\,\mathbf Y`)}`)}
<p>Avec le tableau centré, une variance s'écrit \(\sigma_j^2=\sum_iw_iy_{i,j}^2\) et une covariance \(\mathrm{cov}(\mathbf y_j,\mathbf y_{j'})=\mathbf y_j^t\,\mathbf N\,\mathbf y_{j'}\).</p>
` },
      { id: 'reduit', t: 'Tableau réduit et corrélations', sub: 'Toutes les variances égales à 1', html: R`
${def('Tableau réduit', R`<p>Le tableau dont chaque variable est de variance 1, noté \(\underset{n\times p}{\mathbf Z}\) :</p>${M(R`\mathbf Z=\mathbf Y\times\mathbf W^{-1}\qquad\text{avec}\quad\underset{p\times p}{\mathbf W}=\mathrm{diag}\big([\sigma_1\ \cdots\ \sigma_j\ \cdots\ \sigma_p]\big)`)}`)}
${prop('Matrice des corrélations', R`<p>La matrice de variance-covariance d'un tableau réduit est la <b>matrice des corrélations</b> \(\underset{p\times p}{\mathbf R}\) : \(\mathbf Z^t\,\mathbf N\,\mathbf Z=\mathbf W^{-1}\mathbf V\,\mathbf W^{-1}=\mathbf R\), de terme \(\mathrm{cov}(\mathbf y_j,\mathbf y_{j'})/(\sigma_j\sigma_{j'})\).</p>`)}
` },
      { id: 'inertie', t: 'L\'inertie', sub: 'L\'étalement du nuage', html: R`
${def('Inertie d\'un nuage', R`<p>L'inertie \(In\) mesure l'étalement du nuage autour de son centre de gravité :</p>${M(R`In=\sum_{i=1}^nw_i\,\big\|\underset{1\times p}{{}_i\mathbf y}\big\|^2=\sum_{j=1}^p\sigma_j^2`)}${D}`)}
${proof('Démonstration (document de démonstrations)', M(R`\sum_{i=1}^nw_i\|{}_i\mathbf y\|^2=\sum_{i=1}^nw_i\sum_{j=1}^py_{i,j}^2=\sum_{j=1}^p\sum_{i=1}^nw_iy_{i,j}^2=\sum_{j=1}^p\sigma_j^2`) + '<p>On échange les deux sommes ; chaque somme intérieure est la variance de la variable centrée \(j\).</p>')}
<ul><li>L'inertie est donc aussi la <b>trace</b> de \(\mathbf V\).</li><li>Pour un tableau réduit, chaque variance vaut 1 : \(In(\mathbf Z)=p\).</li></ul>
<p>On montre aussi (démonstration 5) que l'inertie vaut la somme pondérée des carrés des distances entre toutes les paires d'individus :</p>
${M(R`\sum_{i=1}^{n-1}\sum_{k=i+1}^nw_iw_k\,\|{}_i\mathbf x-{}_k\mathbf x\|^2=\sum_{j=1}^p\sigma_j^2`)}
` },
    ],
    keep: [
      'X (n × p) : lignes = individus, colonnes = variables ; N = diag(w), Σ wᵢ = 1.',
      'g = 1ᵗ N X ; Y = X − 1 g = (Id − 1 1ᵗ N) X.',
      'V = Xᵗ N X − gᵗ g = Yᵗ N Y ; Z = Y W⁻¹ et la variance-covariance de Z est R.',
      'In = Σ wᵢ ‖ᵢy‖² = Σ σ²ⱼ = trace(V) ; In(Z) = p.',
    ],
  },

  /* ===================================================================== */
  {
    id: 'a2', ch: 'acp', short: 'Problèmes & solutions', src: 'ACP : problèmes et solutions',
    t: 'L\'ACP : quatre problèmes, une même solution',
    sub: 'Maximiser la variance projetée, préserver les distances, maximiser la covariance avec les variables, minimiser l\'erreur de reconstruction : la solution est toujours donnée par les vecteurs propres de V.',
    goals: [
      'Poser le problème de maximisation de la variance projetée et en déduire que les axes sont les vecteurs propres de V.',
      'Énoncer et démontrer les propriétés des composantes : centrées, non corrélées, variances λ_k, inertie conservée.',
      'Reconnaître les trois autres formulations : distances deux à deux, covariance, erreur de reconstruction.',
    ],
    sections: [
      { id: 'notations', t: 'Notations', sub: 'Les composantes principales', html: R`
<p>Une ACP s'effectue sur un duo de matrices ; on considère le cas général \((\underset{n\times p}{\mathbf Y},\underset{n\times n}{\mathbf N})\) : le tableau centré et les poids.</p>
<p>Soit \(1\le K\le p\). On note \(\underset{n\times K}{\mathbf F}\) le nouveau tableau obtenu par l'ACP et \(\underset{p\times K}{\mathbf A}\) la <b>matrice de passage</b> des variables originales aux composantes principales :</p>
${M(R`\underset{n\times1}{\mathbf f_k}=\underset{n\times p}{\mathbf Y}\times\underset{p\times1}{\mathbf a_k}=\sum_{j=1}^pa_{j,k}\,\underset{n\times1}{\mathbf y_j}`)}
<p>Chaque composante principale est une <b>combinaison linéaire</b> des variables d'origine, de coefficients \(a_{j,k}\).</p>
` },
      { id: 'variance', t: 'Maximiser la variance projetée', sub: 'Le premier axe, puis les suivants', html: R`
<p>L'ACP cherche de façon itérative les composantes principales qui portent le plus d'information (de variance). On cherche d'abord</p>
${M(R`\underset{p\times1}{\mathbf a_1}=\operatorname*{arg\,max}_{\mathbf a\in\mathbb R^p}\ \mathrm{var}(\mathbf Y\mathbf a)\qquad\text{sous la contrainte}\quad\mathbf a_1^t\,\mathbf a_1=1`)}
${prop('Solution', R`<p>\(\mathbf a_1\) est le <b>vecteur propre associé à la plus grande valeur propre</b> de \(\mathbf V\), notée \(\lambda_1\).</p>`)}
${proof('Pourquoi ? (justification par le lagrangien, rédigée pour le site)', R`<p>\(\mathrm{var}(\mathbf Y\mathbf a)=(\mathbf Y\mathbf a)^t\mathbf N(\mathbf Y\mathbf a)=\mathbf a^t\mathbf Y^t\mathbf N\mathbf Y\mathbf a=\mathbf a^t\mathbf V\mathbf a\) (la composante est centrée). On maximise \(\mathbf a^t\mathbf V\mathbf a\) sous \(\mathbf a^t\mathbf a=1\) : le lagrangien \(\mathcal L=\mathbf a^t\mathbf V\mathbf a-\lambda(\mathbf a^t\mathbf a-1)\) donne \(2\mathbf V\mathbf a-2\lambda\mathbf a=0\), soit \(\mathbf V\mathbf a=\lambda\mathbf a\) : \(\mathbf a\) est un vecteur propre de \(\mathbf V\). La variance vaut alors \(\mathbf a^t\mathbf V\mathbf a=\lambda\,\mathbf a^t\mathbf a=\lambda\) : on prend la plus grande valeur propre.</p>`)}
${demo('proj')}
<p>On cherche ensuite</p>
${M(R`\mathbf a_2=\operatorname*{arg\,max}_{\mathbf a\in\mathbb R^p}\ \mathrm{var}(\mathbf Y\mathbf a)\qquad\text{sous}\quad\mathbf a_2^t\mathbf a_2=1\ \text{ et }\ \mathbf a_1^t\mathbf a_2=0`)}
<p>⟹ \(\mathbf a_2\) est le vecteur propre associé à la deuxième plus grande valeur propre \(\lambda_2\) ; et ainsi de suite. Les \(a_{j,k}\) sont donc les coordonnées du vecteur propre associé à la \(k\)-ième plus grande valeur propre \(\lambda_k\) de \(\mathbf V\) ; \(\mathbf V\) étant symétrique, ces vecteurs propres sont orthonormés : \(\mathbf A^t\mathbf A=\mathbf{Id}\).</p>
` },
      { id: 'proprietes', t: 'Propriétés des composantes', sub: 'Centrées, non corrélées, inertie conservée', html: R`
${prop('Les composantes principales sont centrées', M(R`\underset{n\times1}{\mathbf 1}^t\times\mathbf N\times\underset{n\times1}{\mathbf f_k}=0`) + R`<p>Preuve : \(\mathbf 1^t\mathbf N\mathbf f_k=\mathbf 1^t\mathbf N\mathbf Y\mathbf a_k=\mathbf g_{\mathbf Y}\,\mathbf a_k=\mathbf 0\,\mathbf a_k=0\), car le centre de gravité de \(\mathbf Y\) est nul.</p>`)}
${prop('Elles sont non corrélées et leurs variances sont les valeurs propres', M(R`\mathrm{Cov}(\underset{n\times K}{\mathbf F})=\underset{K\times K}{\boldsymbol\Lambda}=\mathrm{diag}\big([\lambda_1\ \cdots\ \lambda_k\ \cdots\ \lambda_K]\big)`) + R`<p>\(\mathrm{var}(\mathbf f_k)=\mathbf f_k^t\mathbf N\mathbf f_k=\mathbf a_k^t\mathbf V\mathbf a_k=\mathbf a_k^t(\lambda_k\mathbf a_k)=\lambda_k\) ; et pour \(k\neq l\), \(\mathrm{cov}(\mathbf f_k,\mathbf f_l)=\mathbf a_k^t\mathbf V\mathbf a_l=\lambda_l\,\mathbf a_k^t\mathbf a_l=0\).</p>`)}
${prop('L\'inertie totale est conservée', M(R`In(\underset{n\times p}{\mathbf F})=\sum_{j=1}^p\lambda_j=In(\underset{n\times p}{\mathbf Y})`) + R`<p>Avec toutes les composantes (\(K=p\)) : \(In(\mathbf F)=\sum_k\mathrm{var}(\mathbf f_k)=\sum_k\lambda_k=\mathrm{trace}(\mathbf V)=\sum_j\sigma_j^2\). L'ACP ne fait que <b>redistribuer</b> l'inertie : les premières composantes en concentrent le plus possible.</p>`)}
${D}
` },
      { id: 'distances', t: 'Minimiser la distorsion des distances', sub: 'Conserver au mieux les distances deux à deux', html: R`
${M(R`\mathbf a_k=\operatorname*{arg\,min}_{\mathbf a\in\mathbb R^p}\ \sum_{i=1}^{n-1}\sum_{j=i+1}^nw_iw_j\Big(\|{}_i\mathbf y-{}_j\mathbf y\|^2-(f_{i,k}-f_{j,k})^2\Big)\qquad\text{sous}\quad\mathbf A^t\mathbf A=\mathbf{Id}`)}
<p>L'ACP crée les variables composites orthogonales qui <b>conservent au mieux les distances deux à deux</b> entre individus.</p>
${proof('Idée de la démonstration (rédigée pour le site, à partir de la démonstration 5)', R`<p>Une projection orthogonale ne peut que raccourcir les distances : chaque terme \(\|{}_i\mathbf y-{}_j\mathbf y\|^2-\sum_k(f_{i,k}-f_{j,k})^2\) est positif. D'après la démonstration 5, appliquée au tableau \(\mathbf Y\) puis à la composante \(\mathbf f_k\) (centrée) :</p>${M(R`\sum_{i\lt j}w_iw_j\|{}_i\mathbf y-{}_j\mathbf y\|^2=\sum_j\sigma_j^2=In(\mathbf Y),\qquad\sum_{i\lt j}w_iw_j(f_{i,k}-f_{j,k})^2=\mathrm{var}(\mathbf f_k)`)}<p>La distorsion totale vaut donc \(In(\mathbf Y)-\sum_k\mathrm{var}(\mathbf f_k)\) : la minimiser revient à <b>maximiser la variance projetée</b>, d'où la même solution.</p>`)}
` },
      { id: 'covariance', t: 'Maximiser la covariance avec les variables', sub: 'Des composantes très liées aux variables d\'origine', html: R`
${M(R`\mathbf a_k=\operatorname*{arg\,max}_{\mathbf a\in\mathbb R^p}\ \sum_{j=1}^p\mathrm{cov}^2(\mathbf Y\mathbf a,\ \mathbf y_j)\qquad\text{sous}\quad\mathbf A^t\mathbf A=\mathbf{Id}`)}
<p>L'ACP crée les variables composites orthogonales qui sont <b>les plus corrélées avec les variables d'origine</b>. On a alors</p>
${M(R`\lambda_k=\sqrt{\sum_{j=1}^p\mathrm{cov}^2(\mathbf f_k,\ \mathbf y_j)}`)}
<p>L'inertie conservée par une composante principale est égale à la force de la liaison entre cette composante et les variables d'origine.</p>
${proof('Démonstration (document de démonstrations)', M(R`\begin{aligned}\sum_{j=1}^p\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)&=(\mathbf Y^t\mathbf N\mathbf f_k)^t(\mathbf Y^t\mathbf N\mathbf f_k)=(\mathbf Y^t\mathbf N\mathbf Y\mathbf a_k)^t(\mathbf Y^t\mathbf N\mathbf Y\mathbf a_k)\\&=(\mathbf V\mathbf a_k)^t(\mathbf V\mathbf a_k)=(\lambda_k\mathbf a_k^t)(\lambda_k\mathbf a_k)=\lambda_k^2\,\mathbf a_k^t\mathbf a_k=\lambda_k^2\end{aligned}`))}
` },
      { id: 'reconstruction', t: 'Minimiser l\'erreur de reconstruction', sub: 'Le meilleur auto-encodeur linéaire', html: R`
<p>Soit \(\mathcal M_K=\{\mathbf B\in\mathbb R^{n\times p}\mid\mathrm{rang}(\mathbf B)\le K\}\). On cherche</p>
${M(R`\operatorname*{arg\,min}_{\hat{\mathbf Y}\in\mathcal M_K}\ \|\mathbf Y-\hat{\mathbf Y}\|_F^2\qquad\text{solution :}\quad\underset{n\times p}{\hat{\mathbf Y}}=\underset{n\times p}{\mathbf Y}\times\underset{p\times K}{\mathbf A}\times\underset{p\times K}{\mathbf A}^t`)}
<p>On <b>encode</b> les données en \(K\) dimensions (\(\mathbf F=\mathbf Y\mathbf A\)), puis on les <b>décode</b> (\(\hat{\mathbf Y}=\mathbf F\mathbf A^t\)) : l'ACP est le <b>meilleur auto-encodeur linéaire</b>. \(\|\cdot\|_F\) est la norme de Frobenius (racine de la somme des carrés des termes).</p>
${prop('Bilan', '<p>Quatre problèmes différents (variance projetée, distances deux à deux, covariance avec les variables, reconstruction), une même solution : les vecteurs propres de \\(\\mathbf V\\), rangés par valeurs propres décroissantes.</p>')}
` },
    ],
    keep: [
      'f_k = Y a_k ; a_k = vecteur propre de V associé à la k-ième plus grande valeur propre λ_k ; AᵗA = Id.',
      'var(Ya) = aᵗ V a ; maximum sous aᵗa = 1 atteint pour un vecteur propre, et il vaut λ.',
      'Composantes centrées, non corrélées, var(f_k) = λ_k ; Σ λ_j = In(Y).',
      'Mêmes axes pour : distances deux à deux, Σ cov²(Ya, y_j) (λ_k² = Σ cov²), erreur de reconstruction Ŷ = Y A Aᵗ.',
    ],
  },

  /* ===================================================================== */
  {
    id: 'a3', ch: 'resultats', short: 'Analyse des résultats', src: 'ACP : analyse des résultats',
    t: 'Analyser les résultats d\'une ACP',
    sub: 'Combien de composantes garder, comment interpréter les composantes avec les variables, et comment lire les individus.',
    goals: [
      'Choisir le nombre K de composantes : part d\'inertie, Kaiser, éboulis (corde, dérivée seconde, coordonnées optimales).',
      'Interpréter une composante avec les contributions a²_{j,k} et la qualité de représentation des variables.',
      'Lire un cercle des corrélations.',
      'Mesurer la qualité de représentation d\'un individu.',
    ],
    sections: [
      { id: 'k', t: 'Combien de composantes conserver ?', sub: 'Part d\'inertie, Kaiser, éboulis', html: R`
${def('Part d\'inertie conservée', M(R`\frac{\sum_{k=1}^K\lambda_k}{In}`))}
<ul><li>On choisit \(K\) tel que le <b>pourcentage souhaité</b> d'inertie conservée soit atteint.</li>
<li><b>Critère de Kaiser</b> : on ne garde que les composantes dont la variance est supérieure à la variance moyenne \(In/p\) (en ACP normée, \(\lambda_k\gt1\)).</li>
<li><b>Éboulis des valeurs propres</b> : visuellement, on garde les composantes dont les variances sont considérablement plus élevées que les autres. Des formules aident à le faire :</li></ul>
${M(R`\begin{aligned}\text{méthode de la corde} &: k=\operatorname*{arg\,max}_{i\in[\![1;p]\!]}\big(i(\lambda_p-\lambda_1)-\lambda_i(p-1)\big)\\ \text{dérivée seconde} &: k=\operatorname*{arg\,max}_{i\in[\![2;p-1]\!]}\ \lambda_{i+1}-2\lambda_i+\lambda_{i-1}\\ \text{coordonnées optimales} &: k \text{ est le dernier index vérifiant } \lambda_k\ge\lambda_{k+1}-\frac{\lambda_p-\lambda_{k+1}}{p-k-1}\end{aligned}`)}
<ul><li><b>Corde</b> : on trace la droite (la corde) qui relie \((1,\lambda_1)\) à \((p,\lambda_p)\) ; \(i(\lambda_p-\lambda_1)-\lambda_i(p-1)\) est, à une constante près, l'écart vertical entre la corde et l'éboulis multiplié par \(p-1\) : on prend le point le plus éloigné sous la corde, c'est-à-dire le coude.</li>
<li><b>Dérivée seconde</b> : \(\lambda_{i+1}-2\lambda_i+\lambda_{i-1}\) est la dérivée seconde discrète ; elle est maximale là où la pente change le plus.</li>
<li><b>Coordonnées optimales</b> : on prolonge la droite qui passe par \(\lambda_{k+1}\) et \(\lambda_p\) jusqu'au rang \(k\) ; on garde \(\lambda_k\) s'il est au-dessus de cette prévision. Dans la méthode d'origine (Raîche et al.), on se limite aux valeurs propres qui passent aussi le critère de Kaiser, sinon presque toutes vérifient la condition.</li></ul>
${demo('eboulis')}
` },
      { id: 'contribution', t: 'Interpréter les composantes : contributions', sub: 'Les coefficients a²_{j,k}', html: R`
${def('Contribution d\'une variable à une composante', R`<p>\(a_{j,k}^2\) représente la <b>part d'inertie de la composante \(k\) due à la variable \(j\)</b> (et \(\sum_ja_{j,k}^2=1\) car \(\mathbf a_k\) est normé). On regarde le <b>signe</b> de \(a_{j,k}\) pour prendre en compte la direction de l'influence.</p>${M(R`a_{j,k}^2=\frac{\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)}{\sum_{j=1}^p\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)}`)}`)}
${proof('Démonstration (document de démonstrations)', R`${M(R`\mathrm{cov}(\mathbf f_k,\mathbf Y)=\mathbf Y^t\mathbf N\mathbf f_k=\mathbf Y^t\mathbf N\mathbf Y\mathbf a_k=\mathbf V\mathbf a_k=\lambda_k\mathbf a_k`)}<p>donc \(\lambda_ka_{j,k}=\mathrm{cov}(\mathbf f_k,\mathbf y_j)\iff\lambda_k^2a_{j,k}^2=\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)\iff a_{j,k}^2=\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)/\lambda_k^2\), et \(\lambda_k^2=\sum_j\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)\).</p>`)}
` },
      { id: 'qualite', t: 'Qualité de représentation des variables', sub: 'Le R² de la variable sur les K composantes', html: R`
<p>Une forte contribution ne suffit pas : pour s'assurer de l'impact d'une variable sur l'interprétation d'une composante, la composante doit aussi contenir <b>suffisamment de l'information de la variable</b>.</p>
${def('Qualité de représentation d\'une variable', R`<p>Pourcentage de la variance de la variable \(j\) capturé par les \(K\) composantes principales (c'est le \(R^2\) de la régression de \(\mathbf y_j\) sur les composantes) :</p>${M(R`\sum_{k=1}^K\mathrm{cor}^2(\mathbf f_k,\mathbf y_j)=\frac{\sum_{k=1}^K\lambda_ka_{j,k}^2}{\sigma_j^2}`)}`)}
${proof('Démonstration (document de démonstrations)', R`<p>La projection de \(\mathbf y_j\) sur les composantes (non corrélées, de variances \(\lambda_k\)) est \(\hat{\mathbf y}_j=\mathbf F\boldsymbol\Lambda^{-1}\mathbf F^t\mathbf N\mathbf y_j\), soit \(\hat y_{i,j}=\sum_k\frac{f_{i,k}}{\lambda_k}\mathrm{cov}(\mathbf y_j,\mathbf f_k)=\sum_k\frac{f_{i,k}}{\lambda_k}\lambda_ka_{j,k}=\sum_kf_{i,k}a_{j,k}\). D'où \(\mathrm{var}(\hat{\mathbf y}_j)=\sum_k\lambda_ka_{j,k}^2\), et le \(R^2\) est \(\mathrm{var}(\hat{\mathbf y}_j)/\sigma_j^2\). Terme à terme : \(\mathrm{cor}^2(\mathbf f_k,\mathbf y_j)=\frac{\lambda_k^2a_{j,k}^2}{\lambda_k\sigma_j^2}=\frac{\lambda_ka_{j,k}^2}{\sigma_j^2}\).</p>`)}
` },
      { id: 'cercle', t: 'Le cercle des corrélations', sub: 'Variables et composantes sur un même graphique', html: R`
<p>On représente chaque variable par un vecteur dont les coordonnées sont ses <b>corrélations avec les composantes</b> du plan, \(\mathrm{cor}(\mathbf f_k,\mathbf y_j)=\sqrt{\lambda_k}\,a_{j,k}/\sigma_j\).</p>
<ul><li>La <b>longueur</b> de la flèche représente sa qualité de représentation (sa racine) : plus elle est proche du cercle, mieux la variable est représentée dans le plan principal.</li>
<li>Le cercle visualise aussi la matrice des corrélations : <b>le cosinus de l'angle entre deux flèches proches du cercle approxime la corrélation</b> entre les variables. Flèches dans la même direction : corrélation positive ; opposées : négative ; perpendiculaires : corrélation proche de 0.</li></ul>
${proof('Démonstration (document de démonstrations)', R`<p>Le cosinus de l'angle entre les flèches de \(\mathbf y_q\) et \(\mathbf y_j\) sur le plan (1, 2) vaut</p>${M(R`\frac{\dfrac{\lambda_1a_{1,j}a_{1,q}+\lambda_2a_{2,j}a_{2,q}}{\sigma_j\sigma_q}}{\dfrac{\sqrt{\lambda_1a_{1,j}^2+\lambda_2a_{2,j}^2}}{\sigma_j}\times\dfrac{\sqrt{\lambda_1a_{1,q}^2+\lambda_2a_{2,q}^2}}{\sigma_q}}`)}<p>Les variables étant bien représentées, les deux racines du dénominateur valent environ 1 (longueur des flèches), et le cosinus vaut environ \(\frac{\lambda_1a_{1,j}a_{1,q}+\lambda_2a_{2,j}a_{2,q}}{\sigma_j\sigma_q}\). De façon exacte, en écrivant \(\mathbf y_j=\sum_ka_{j,k}\mathbf f_k\) :</p>${M(R`\begin{aligned}\mathrm{cor}(\mathbf y_q,\mathbf y_j)&=\frac{\sum_{k=1}^p\lambda_ka_{j,k}a_{q,k}}{\sigma_j\sigma_q}\\&=\frac{\lambda_1a_{1,j}a_{1,q}+\lambda_2a_{2,j}a_{2,q}}{\sigma_j\sigma_q}+\frac{\sum_{k\ge3}\lambda_ka_{j,k}a_{q,k}}{\sigma_j\sigma_q}\end{aligned}`)}<p>Par Cauchy-Schwarz, le dernier terme est majoré par \(\frac{\sqrt{\sum_{k\ge3}\lambda_ka_{j,k}^2}}{\sigma_j}\times\frac{\sqrt{\sum_{k\ge3}\lambda_ka_{q,k}^2}}{\sigma_q}\), proche de 0 quand les deux variables sont bien représentées sur le plan. D'où \(\mathrm{cor}(\mathbf y_q,\mathbf y_j)\approx\cos\).</p>`)}
${demo('cercle')}
` },
      { id: 'individus', t: 'Interpréter les individus', sub: 'Qualité de représentation d\'un individu', html: R`
${def('Qualité de représentation d\'un individu', R`<p>Rapport, dans l'espace de base, entre la distance (carrée) à l'origine de l'individu \(i\) reprojeté et la distance (carrée) à l'origine du même individu. C'est aussi le rapport entre sa distance carrée à l'origine dans l'espace des composantes et dans l'espace de base :</p>${M(R`\frac{\|{}_i\hat{\mathbf y}\|^2}{\|{}_i\mathbf y\|^2}=\frac{d_{\mathbf Y}^2(\hat i,0)}{d_{\mathbf Y}^2(i,0)}=\frac{\sum_{k=1}^Kf_{i,k}^2}{\sum_{j=1}^py_{i,j}^2}=\frac{d_{\mathbf F}^2(i,0)}{d_{\mathbf Y}^2(i,0)}`)}`)}
${proof('Démonstration (document de démonstrations)', M(R`\|{}_i\hat{\mathbf y}\|^2={}_i\hat{\mathbf y}\,{}_i\hat{\mathbf y}^t=({}_i\mathbf F\,\mathbf A^t)(\mathbf A\,{}_i\mathbf F^t)={}_i\mathbf F\,{}_i\mathbf F^t=\sum_{k=1}^Kf_{i,k}^2\qquad(\mathbf A^t\mathbf A=\mathbf{Id})`))}
<p>La distance entre deux individus <b>bien représentés</b> dans le plan est approximativement leur distance dans l'espace d'origine : on ne commente la proximité de deux individus que s'ils sont bien représentés.</p>
` },
    ],
    keep: [
      'Part d\'inertie Σ_{k≤K} λ_k / In ; Kaiser : λ_k > In/p ; éboulis (corde, dérivée seconde, coordonnées optimales).',
      'Contribution de j à k : a²_{j,k} = cov²(f_k, y_j)/λ_k², somme 1 ; regarder le signe.',
      'Qualité d\'une variable : Σ_k cor²(f_k, y_j) = Σ_k λ_k a²_{j,k}/σ²_j (R²).',
      'Cercle : coordonnées cor(f_k, y_j) = √λ_k a_{j,k}/σ_j ; longueur = qualité ; cos(angle) ≈ corrélation.',
      'Qualité d\'un individu : Σ_k f²_{i,k} / Σ_j y²_{i,j}.',
    ],
  },

  /* ===================================================================== */
  {
    id: 'a4', ch: 'varimax', short: 'Varimax', src: 'ACP et analyse des résultats : Varimax',
    t: 'Aller plus loin : la rotation Varimax',
    sub: 'Répartir l\'inertie conservée entre les composantes pour les rendre plus interprétables.',
    goals: [
      'Expliquer l\'objectif de Varimax.',
      'Définir les matrices H, L, L* et le critère maximisé.',
      'Énoncer les propriétés des composantes après rotation et leurs indicateurs.',
    ],
    sections: [
      { id: 'probleme', t: 'Problématique', sub: 'Des composantes interprétables', html: R`
<p>Une fois qu'on dispose des \(K\) composantes à conserver, avoir des composantes qui capturent plus d'information que d'autres est inutile. On souhaite plutôt que les composantes disponibles soient <b>interprétables</b>.</p>
<p>⟹ On <b>répartit l'inertie conservée</b> à travers les composantes pour les rendre plus interprétables : idéalement, chaque variable est liée fortement à une seule composante.</p>
` },
      { id: 'notations', t: 'Notations', sub: 'Les matrices H et L', html: R`
${def('Matrices H et L', R`<p>\(\underset{p\times p}{\mathbf H}\) est diagonale de terme \(h_{j,j}=\sqrt{\sum_{k=1}^K\lambda_ka_{j,k}^2}\) : la racine de la variance de la variable \(j\) conservée par les \(K\) composantes.</p>${M(R`\underset{p\times K}{\mathbf L}=\underset{p\times p}{\mathbf H}^{-1}\times\underset{p\times K}{\mathbf A}\times\underset{K\times K}{\boldsymbol\Lambda}^{1/2}`)}<p>\(L_{j,k}^2=\lambda_ka_{j,k}^2/h_{j,j}^2\) représente la <b>proportion de la variance de la variable \(j\) conservée par la \(k\)-ième composante</b> parmi l'inertie conservée par les \(K\) composantes (chaque ligne de \(\mathbf L^{\circ2}\) somme à 1).</p>`)}
` },
      { id: 'objectif', t: 'Le critère Varimax', sub: 'Maximiser la variance des L*²', html: R`
<p>Soit \(\underset{K\times K}{\mathbf T}\) une <b>matrice de rotation</b> et \(L_{j,k}^*\) les éléments de \(\mathbf L\times\mathbf T\). Varimax maximise</p>
${M(R`In(\mathbf L^{*\circ2})=\sum_{k=1}^K\mathrm{Var}(\mathbf L_k^{*\circ2})=\frac1{p^2}\sum_{k=1}^K\Big(p\sum_{j=1}^pL_{j,k}^{*4}-\Big(\sum_{j=1}^pL_{j,k}^{*2}\Big)^2\Big)`)}
<p>Autrement dit, Varimax cherche la rotation \(\mathbf T\) qui maximise la somme des variances de la répartition des variances conservées. Une colonne \(\mathbf L_k^{*\circ2}\) de grande variance contient des valeurs proches de 0 ou de 1 : chaque composante est très liée à quelques variables et presque pas aux autres.</p>
${demo('varimax')}
` },
      { id: 'resultats', t: 'Résultats', sub: 'Nouvelles valeurs propres et matrice de passage', html: R`
${M(R`\lambda_k^*=\sum_{j=1}^ph_{j,j}^2L_{j,k}^{*2}\qquad\qquad\underset{p\times K}{\mathbf P}=\mathbf A\times\boldsymbol\Lambda^{-1/2}\times\mathbf T\times\boldsymbol\Lambda^{*1/2}`)}
<p>\(\boldsymbol\Lambda^*\) est la matrice diagonale des \(\lambda_k^*\) et \(\mathbf P\) la nouvelle matrice de passage (\(\mathbf F^*=\mathbf Y\mathbf P\)).</p>
${prop('Propriétés', R`<ul><li>Les nouvelles composantes restent <b>centrées</b>.</li><li>Elles restent <b>non corrélées</b>, de matrice de variance-covariance \(\boldsymbol\Lambda^*\).</li><li>L'inertie de l'hyperplan est conservée : \(\sum_k\lambda_k^*=\sum_k\lambda_k\).</li><li>Contribution de la variable \(j\) à la composante \(k\) : \(h_{j,j}^2L_{j,k}^{*2}\).</li><li>Qualité de représentation des variables : \(\dfrac{h_{j,j}^2}{\sigma_j^2}\sum_{k=1}^KL_{j,k}^{*2}\) (elle ne change pas par rotation).</li></ul>`)}
${warn('une matrice de passage non orthonormée', R`<p>\(\mathbf P\) n'est plus orthonormée : l'espace des individus des composantes n'est plus « directement comparable » à l'espace des individus d'origine. Il faut adapter les formules :</p>${M(R`\hat{\mathbf Y}=\mathbf F^*\times(\mathbf P^t\mathbf P)^{-1}\times\mathbf P^t,\qquad\frac{\|{}_i\hat{\mathbf y}\|^2}{\|{}_i\mathbf y\|^2}=\frac{{}_i\mathbf f^*\,(\mathbf P^t\mathbf P)^{-1}\,{}_i\mathbf f^{*t}}{\sum_{j=1}^py_{i,j}^2}`)}`)}
${D}
` },
    ],
    keep: [
      'But : répartir l\'inertie conservée pour rendre les composantes interprétables.',
      'h_j = √(Σ_k λ_k a²_{j,k}) ; L = H⁻¹ A Λ^{1/2} ; L* = L T (T rotation).',
      'Varimax maximise Σ_k Var(L*²_{·k}) = (1/p²) Σ_k (p Σ_j L*⁴ − (Σ_j L*²)²).',
      'λ*_k = Σ_j h²_j L*²_{j,k} ; P = A Λ^{−1/2} T Λ*^{1/2} ; composantes centrées, non corrélées, inertie conservée.',
      'P non orthonormée : Ŷ = F* (PᵗP)⁻¹ Pᵗ.',
    ],
  },

  /* ===================================================================== */
  {
    id: 'a5', ch: 'features', short: 'Features engineering', src: 'ACP : features engineering',
    t: 'Features engineering : préparer les données pour l\'ACP',
    sub: 'Quand les hypothèses de l\'ACP ne sont pas respectées, on transforme les données : rangs, normalisation, pondération des groupes de variables (AFM).',
    goals: [
      'Citer les conditions de pertinence d\'une ACP.',
      'Expliquer l\'intérêt d\'une ACP sur les rangs et calculer des rangs fractionnaires.',
      'Justifier l\'ACP normée.',
      'Pondérer des groupes de variables selon leur taille absolue ou effective (AFM).',
    ],
    sections: [
      { id: 'limites', t: 'Les limites de l\'ACP', sub: 'Quand est-elle pertinente ?', html: R`
${prop('L\'ACP est pertinente si', '<ul><li>les variables sont <b>quantitatives</b> (et plutôt continues) ;</li><li>les relations sont <b>linéaires</b> ;</li><li>l\'<b>inertie est synonyme d\'information</b>.</li></ul>')}
<p>Si le jeu de données ne respecte pas ces conditions, on peut se tourner vers d'autres méthodes… ou il « suffit » de le <b>transformer</b> pour qu'il les respecte.</p>
` },
      { id: 'rangs', t: 'ACP sur les rangs', sub: 'Remplacer chaque valeur par son rang', html: R`
${prop('Utiliser les rangs permet de', '<ul><li><b>linéariser les liaisons monotones</b> ;</li><li><b>réduire l\'impact des valeurs extrêmes</b> (qui affectaient la qualité de l\'inertie comme mesure de l\'information) ;</li><li><b>inclure les variables qualitatives ordinales</b> dans l\'analyse.</li></ul>')}
${warn('interprétation', '<p>Les résultats de l\'ACP s\'interprètent alors <b>vis-à-vis des rangs</b>, pas des valeurs d\'origine.</p>')}
${def('Rang fractionnaire', M(R`Rf(x_{i,j})=1+\sum_{k=1}^n\mathbf 1_{x_{i,j}\lt x_{k,j}}+\frac12\sum_{\substack{k=1\\k\neq i}}^n\mathbf 1_{x_{i,j}=x_{k,j}}`) + '<p>On compte les valeurs qui précèdent \\(x_{i,j}\\) dans l\'ordre choisi (ici, telle qu\'écrite sur la diapositive, celles qui lui sont strictement supérieures : rang 1 pour la plus grande valeur), et chaque ex aequo compte pour moitié. Les ex aequo reçoivent ainsi la moyenne des rangs qu\'ils occupent.</p>')}
${ex('rangs de 10, 20, 20, 30 (par ordre croissant)', '<table class="t"><thead><tr><th>valeurs</th><th>10</th><th>20</th><th>20</th><th>30</th></tr></thead><tbody><tr><th>fractionnaire</th><td>1</td><td>2,5</td><td>2,5</td><td>4</td></tr><tr><th>standard (« 1224 »)</th><td>1</td><td>2</td><td>2</td><td>4</td></tr><tr><th>standard modifié (« 1334 »)</th><td>1</td><td>3</td><td>3</td><td>4</td></tr><tr><th>dense (« 1223 »)</th><td>1</td><td>2</td><td>2</td><td>3</td></tr></tbody></table><p class="math-note">Les noms et exemples des autres rangs sont les définitions usuelles (le cours les cite sans les détailler). En général, les résultats sont robustes au choix du rang.</p>')}
` },
      { id: 'normee', t: 'ACP normée', sub: 'Neutraliser les unités', html: R`
<p>La <b>normalisation</b> (travailler sur le tableau réduit \(\mathbf Z\), donc sur la matrice des corrélations \(\mathbf R\)) évite qu'une variable ait une forte ou faible contribution à l'inertie <b>du seul fait de son échelle de mesure</b>.</p>
<p>⟹ Elle améliore la qualité de l'inertie en tant que mesure de l'information. En ACP normée, \(In=p\), la variance moyenne vaut 1 (Kaiser : \(\lambda_k\gt1\)) et \(\mathrm{cor}(\mathbf f_k,\mathbf z_j)=\sqrt{\lambda_k}\,a_{j,k}\).</p>
${ex('salaire et âge', '<p>Un salaire annuel en euros a une variance des millions de fois plus grande qu\'un âge en années : sans normalisation, la première composante serait presque exactement le salaire.</p>')}
` },
      { id: 'groupes', t: 'ACP sur des groupes de variables', sub: 'Taille absolue et taille effective (AFM)', html: R`
<p>Les variables sont organisées <b>thématiquement en groupes</b>. On veut éviter qu'un groupe pèse trop dans le résultat du fait :</p>
<ul><li>de sa <b>taille absolue</b> : on ne souhaite pas qu'un groupe domine l'analyse parce qu'il compte un grand nombre de variables ;</li>
<li>de sa <b>taille effective</b> : on ne souhaite pas qu'un groupe domine l'analyse parce qu'il ne contient quasiment que des variables « identiques » (redondantes).</li></ul>
${method('Prévenir la taille absolue', R`<p>Une ACP sur le tableau \(\underset{n\times p}{\mathbf Y'}\) avec</p>${M(R`y'_{i,j}=\frac{y_{i,j}}{\sqrt{n_{g(j)}}}`)}<p>où \(n_{g(j)}\) est le nombre de variables du groupe \(g(j)\) de la variable \(j\). Sur données réduites, l'inertie d'un groupe vaut \(n_g\) ; divisée par \(n_g\), elle vaut 1 pour chaque groupe.</p>`)}
${method('Prévenir la taille effective : l\'Analyse Factorielle Multiple (AFM)', R`<p>L'AFM est une ACP sur le tableau \(\mathbf Y'\) avec</p>${M(R`y'_{i,j}=\frac{y_{i,j}}{\sqrt{\lambda_1^{(g(j))}}}`)}<p>où \(\lambda_1^{(g(j))}\) est la première valeur propre de l'ACP faite sur le seul groupe de la variable \(j\). Après pondération, la première valeur propre de chaque groupe vaut 1 : aucun groupe ne peut, à lui seul, imposer la première composante.</p>`)}
${prop('Indicateurs', R`<ul><li>Contribution du groupe \(g\) à la composante \(k\) : \(\sum_{j=1}^{n_g}a_{j,k}^2\) (somme des contributions de ses variables).</li><li>Qualité de représentation : pas de définition universelle.</li></ul>`)}
` },
    ],
    keep: [
      'ACP pertinente : variables quantitatives continues, relations linéaires, inertie = information.',
      'Rangs : linéarisent les liaisons monotones, limitent les valeurs extrêmes, intègrent les ordinales ; interpréter en rangs.',
      'ACP normée : sur Z (matrice R), pour neutraliser les échelles ; In = p.',
      'Taille absolue : y/√n_g ; taille effective (AFM) : y/√λ₁^(g) ; contribution d\'un groupe = Σ a²_{j,k}.',
    ],
  },

  /* ===================================================================== */
  {
    id: 'a6', ch: 'clv', short: 'CLV', src: 'ACP : classification de variables autour de composantes latentes',
    t: 'Aller plus loin : la CLV',
    sub: 'Classification de Variables autour de composantes Latentes : des composantes « sparse » en regroupant les variables.',
    goals: [
      'Expliquer pourquoi l\'ACP et Varimax ne donnent pas des composantes parcimonieuses.',
      'Dérouler l\'algorithme CLV : perte d\'inertie à chaque agrégation.',
      'Montrer que le critère T augmente à chaque étape et produit une hiérarchie.',
    ],
    sections: [
      { id: 'probleme', t: 'Problématique', sub: 'Des composantes qui ne sont pas sparse', html: R`
<p>L'ACP fournit en un sens le « meilleur » résumé d'un jeu de données, et Varimax aide à le rendre plus interprétable en conservant des propriétés jugées importantes. Mais le résultat n'est pas forcément <b>sparse</b> (parcimonieux) : en général, toutes les variables contribuent à une composante, même un peu.</p>
<p>⟹ Pour obtenir de meilleurs résultats, il faut relâcher certaines contraintes : ici, on relâche la <b>contrainte de non-corrélation</b> entre les composantes principales.</p>
` },
      { id: 'algo', t: 'L\'algorithme', sub: 'Agréger pas à pas', html: R`
${method('Étape 1', R`<p>Au temps 1, chaque variable forme un groupe qui ne contient qu'elle-même. On note ce jeu de données \(\underset{n\times p}{\mathbf Y_1}\) et \(T_1=0\) la perte d'inertie.</p>`)}
${method('Étape 2', R`<p>On cherche le couple de variables à agréger, en conservant un maximum d'inertie. Si l'on agrège \(\mathbf y_a\) et \(\mathbf y_b\) en une nouvelle variable \(\mathbf f\), la perte d'inertie globale vaut</p>${M(R`In(\mathbf Y_1)-In(\mathbf Y_2)=\mathrm{var}(\mathbf y_a)+\mathrm{var}(\mathbf y_b)-\mathrm{var}(\mathbf f)\ge0`)}<p>Elle est minimale si \(\mathbf f\) est la <b>première composante principale</b> des deux variables. Et comme \(\lambda_k^2=\sum_j\mathrm{cov}^2(\mathbf f_k,\mathbf y_j)\), le choix qui minimise la perte porte sur le couple des <b>variables les plus corrélées</b>.</p>`)}
${ex('deux variables réduites', R`<p>Pour deux variables réduites de corrélation \(r\), la matrice des corrélations \(\begin{pmatrix}1&r\\r&1\end{pmatrix}\) a pour plus grande valeur propre \(1+|r|\) : la perte vaut \(1+1-(1+|r|)=1-|r|\), minimale pour le couple le plus corrélé (en valeur absolue).</p>`)}
${method('Étapes k et k + 1', R`<p>Si, à l'étape \(k+1\), on agrège deux groupes \(A\) et \(B\) par une composante \(\mathbf f_{A\cup B}\), alors \(T_{k+1}=In(\mathbf Y_1)-In(\mathbf Y_{k+1})\), et</p>${M(R`\Delta T_{k+1}=In(\mathbf Y_{k+1})-In(\mathbf Y_k)=\mathrm{var}(\mathbf f_{A\cup B})-\big(\mathrm{var}(\mathbf f_A)+\mathrm{var}(\mathbf f_B)\big)\le0`)}<p>Autrement dit, l'inertie conservée décroît à chaque étape et le critère \(T\) augmente : la méthode produit une <b>hiérarchie</b> (un dendrogramme), comme une classification ascendante hiérarchique, mais sur les variables.</p>`)}
${demo('clv')}
` },
      { id: 'usages', t: 'Autres utilisations', sub: 'Le clustering de variables', html: R`
<ul><li>Le clustering de variables peut être une <b>fin en soi</b> : savoir quelles variables vont ensemble.</li>
<li>La CLV peut aussi être vue comme du <b>feature engineering</b> pour appliquer une ACP sur un jeu de données dont les variables sont organisées en groupes (leçon précédente) : les groupes trouvés servent à pondérer l'analyse.</li></ul>
` },
    ],
    keep: [
      'ACP et Varimax : composantes non sparse ; la CLV relâche la non-corrélation des composantes.',
      'Agréger y_a et y_b en f : perte var(y_a) + var(y_b) − var(f), minimale si f = 1re composante principale.',
      'On agrège les variables (groupes) les plus corrélées ; deux variables réduites : perte 1 − |r|.',
      'ΔT ≤ 0 pour l\'inertie : T augmente, d\'où une hiérarchie (dendrogramme de variables).',
    ],
  },
];

// Dans le HTML, un « < » suivi d'une lettre ouvrirait une balise : dans les formules, on écrit \lt à la place.
const lt = h => h.replace(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g, m => m.replace(/</g, '\\lt '));
lessons.forEach(l => l.sections.forEach(s => { s.html = lt(s.html); }));
