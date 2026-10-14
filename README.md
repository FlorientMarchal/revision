# Mes révisions

Site de révision multi-cours : fiches avec formules et illustrations interactives, flashcards, QCM, annales corrigées et TP.
En ligne : https://florientmarchal.github.io/revision/

## Lancer en local

```
npm install
npm run dev
```

`npm run build` produit le site dans `dist/`. Chaque push sur `main` le compile et le publie sur GitHub Pages (`.github/workflows/deploy.yml`).

## Organisation

- `src/courses/<id>/course.js` : fiche d'identité d'un cours (titre, code, enseignant·e, crédits, consignes). Tout dossier qui contient ce fichier apparaît automatiquement sur l'accueil.
- `src/courses/<id>/data.js` : le contenu (chapitres, fiches HTML avec formules LaTeX `\( … \)` / `\[ … \]`, flashcards, QCM, annales, TP). Chaque carte et chaque question a un identifiant stable : la progression ne se décale pas quand on ajoute du contenu.
- `src/courses/<id>/viz.js`, `tools.js` (facultatifs) : illustrations interactives des fiches (`<figure class="viz" data-viz="…">`) et outils de l'onglet « Exercices interactifs ».
- `public/courses/<id>/img/` : figures des annales.
- `src/components/` : les écrans (accueil, cours, fiches, flashcards, QCM, annales, TP, compte).
- `src/lib/progress.js` : progression locale ; `src/lib/sync.js` : connexion et synchronisation Supabase.

## Ajouter un cours

Déposer les PDF du cours, des annales et des TP, puis créer `src/courses/<id>/course.js` et `data.js` sur le modèle de `classif`.

## Synchronisation de la progression

La progression est enregistrée dans le navigateur, puis synchronisée avec Supabase quand on a saisi son adresse e-mail (page Compte). Pas de compte, pas de mot de passe, aucun e-mail envoyé : l'adresse sert d'identifiant et le serveur n'en reçoit que l'empreinte SHA-256. Qui connaît l'adresse peut donc lire et modifier la progression associée ; c'est accepté, ces données ne sont pas sensibles.

1. Créer un projet sur https://supabase.com.
2. SQL Editor : exécuter `supabase/schema.sql` (table `progress_by_key`, sans accès direct, et fonctions `get_progress` / `save_progress`).
3. Renseigner l'URL du projet et la clé publique (`sb_publishable_…`) dans `src/config.js`. Ne jamais y mettre la clé `service_role` / secrète.

## Crédits

Le contenu de chaque cours appartient à ses auteurs (voir le pied de page de chaque cours). Site personnel non officiel.
