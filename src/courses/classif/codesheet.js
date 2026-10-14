// Mémo R du cours de classification : les fonctions des corrections de TP (TP 1 à 6).
const I = (n, code, note) => ({ n, code, note });

export const codesheet = [
  { part: 'R', lang: 'R', t: 'Préparer et découper les données', src: 'TP 1 et 2', items: [
    I('Retirer les lignes incomplètes', 'na.omit(data)'),
    I('Échantillon d\'apprentissage (70 %)', 'createDataPartition(y, p=0.7)', 'Paquet caret.'),
    I('Standardiser', 'scale(x)', 'Ou min-max : (x − min)/(max − min).'),
    I('Plis de validation croisée', 'createFolds(y, k=10)'),
  ] },
  { part: 'R', lang: 'R', t: 'KNN et évaluation', src: 'TP 1 et 2', items: [
    I('KNN', 'knn(train, test, cl, k)', 'Paquet class.'),
    I('Taux d\'erreur', 'mean(y != pred)'),
    I('Matrice de confusion', 'table(réel, prédit)', 'Lignes = réel : ordre inverse de la convention du cours.'),
    I('Matrice de confusion détaillée (caret)', 'cm <- confusionMatrix(pred, réel)\ncm$byClass[, "Pos Pred Value"]   # précision\ncm$byClass[, "Sensitivity"]      # rappel'),
    I('Validation croisée et choix de K (caret)', 'trainControl(method="cv", number=20)\ntrain(Month ~ ., method="knn", tuneGrid=expand.grid(k=1:20), preProcess=c("center","scale"))'),
    I('Résultats du réglage', 'plot(knnFit)\nknnFit$bestTune\npredict(knnFit, newdata)'),
  ] },
  { part: 'R', lang: 'R', t: 'Régression logistique', src: 'TP 3', items: [
    I('Ajuster le modèle', 'glm(lymph ~ age + log(acid) + radio + gravite + taille, family="binomial")'),
    I('Tests de Wald (H₀ : βⱼ = 0)', 'summary(fit)'),
    I('Probabilités prédites', 'predict(fit, type="response")'),
    I('Test du χ² d\'indépendance', 'chisq.test(table(x, y))'),
    I('Courbe ROC et AUC (ROCR)', 'pred <- prediction(scores, labels)\nplot(performance(pred, "tpr", "fpr"))\nperformance(pred, "auc")'),
  ] },
  { part: 'R', lang: 'R', t: 'Arbres CART', src: 'TP 4', items: [
    I('Construire l\'arbre', 'rpart(lymph ~ ., data)'),
    I('Erreur selon la complexité', 'printcp(tree)\nplotcp(tree)'),
    I('Meilleur cp (erreur de validation croisée minimale)', 'bestcp <- tree$cptable[which.min(tree$cptable[,"xerror"]), "CP"]'),
    I('Élaguer', 'prune(tree, cp = bestcp)'),
    I('Prédire', 'predict(tree, newdata, type="class")   # ou "prob", "matrix"'),
    I('Dessiner', 'rpart.plot(tree)'),
  ] },
  { part: 'R', lang: 'R', t: 'SVM', src: 'TP 5', items: [
    I('SVM linéaire (e1071)', 'svm(y ~ ., kernel="linear", cost=C, scale=FALSE)', 'Attention : <code>scale=TRUE</code> par défaut.'),
    I('w, b et vecteurs de support', 'coef(svmfit)\nsvmfit$rho      # = −b\nsvmfit$coefs    # αᵢ yᵢ\nsvmfit$index    # vecteurs de support'),
    I('Choisir C par validation croisée', 'tune(svm, y ~ ., data = data, kernel="linear", ranges=list(cost=c(0.01, 0.1, 1, 10)))'),
    I('Noyau polynomial', 'svm(y ~ ., kernel="polynomial", gamma=1, coef0=2, degree=2)'),
    I('Noyau gaussien', 'svm(y ~ ., kernel="radial", gamma=gamma)'),
    I('Avec caret', 'train(y ~ ., method="svmPoly")   # ou "svmRadial"'),
  ] },
  { part: 'R', lang: 'R', t: 'Clustering', src: 'TP 6', items: [
    I('CAH', 'h <- hclust(dist(x), method="ward.D")   # "single", "complete", "average", "centroid"'),
    I('Couper le dendrogramme', 'cutree(h, k)\nrect.hclust(h, k)\nh$height'),
    I('K-moyennes', 'km <- kmeans(x, centers, algorithm="Lloyd", nstart=10)'),
    I('Inertie intra-classes I_W', 'km$tot.withinss'),
    I('Silhouette (paquet cluster)', 'silhouette(km$cluster, dist(x))'),
    I('Compression d\'image : chaque pixel remplacé par son centre', 'km$centers[km$cluster, ]'),
  ] },
];
export const codesheetNote = 'Fonctions des corrections de TP. Les noms des données (<code>lymph</code>, <code>Month</code>…) sont ceux des TP.';
