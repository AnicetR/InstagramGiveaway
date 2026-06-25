# Tâches Réalisables : Application Roulette de Concours

Ce document décrit le plan d'implémentation étape par étape pour le développement de l'application de Roulette de Concours Instagram. Il est découpé en phases logiques correspondant à la pile technique (Nuxt 3 / Vue 3 / Tailwind CSS / Pinia / GSAP) et aux exigences du cahier des charges (SPEC.md).

---

## Groupe 1 : Fondation & Configuration

### Tâche 1.1 : Configuration & Point d'entrée de Tailwind CSS
* [ ] Créer le fichier de configuration Tailwind (`tailwind.config.js` ou `app/tailwind.config.js`).
* [ ] Définir les constantes pour les zones de sécurité Instagram (ex. hauteurs personnalisées, formats d'image, marges intérieures haut/bas).
* [ ] Créer le fichier CSS principal sous `app/assets/css/tailwind.css` et y ajouter les directives standards :
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
* [ ] Configurer les animations personnalisées (ex. flou de mouvement, lueur dorée, style du canvas de confettis).

### Tâche 1.2 : Initialiser le Store Pinia
* [ ] Créer le fichier du store Pinia dans `app/stores/giveaway.ts`.
* [ ] Définir la structure de l'état :
  - `status` : `'idle' | 'fetching' | 'revealing' | 'purging_likes' | 'purging_follows' | 'morphing' | 'spinning' | 'victory' | 'error'`
  - `url` : `string`
  - `users` : `Array<User>` (voir Schéma)
  - `winner` : `User | null`
  - `errorMsg` : `string | null`
* [ ] Implémenter les actions de base :
  - `setURL(url)`
  - `setUsers(users)`
  - `purgeNonLikers()` (Filtre les utilisateurs pour lesquels `has_liked === false`)
  - `purgeNonFollowers()` (Filtre les utilisateurs pour lesquels `is_follower === false`)
  - `reset()`

---

## Groupe 2 : Intégration Backend & Scraper de Démonstration

### Tâche 2.1 : Implémenter le Client API Apify & la Route d'Extraction
* [ ] Créer la route serveur Nuxt `server/api/giveaway/extract.post.ts`.
* [ ] Intégrer `ApifyClient` en utilisant la variable d'environnement `APIFY_API_TOKEN`.
* [ ] Configurer les appels asynchrones en parallèle pour les commentaires, mentions J'aime et abonnés via `Promise.all`.
* [ ] Implémenter la logique de recoupement des données :
  - Parcourir les commentaires.
  - Définir `has_liked = true` si le nom d'utilisateur est dans le jeu de données des J'aime.
  - Définir `is_follower = true` si le nom d'utilisateur est dans le jeu de données des abonnés.
* [ ] Gérer proprement les erreurs d'extraction et renvoyer des réponses JSON structurées en cas d'échec.

### Tâche 2.2 : Créer un Fournisseur de Données de Simulation (Mock)
* [ ] Pour permettre les tests hors ligne et éviter de consommer les crédits Apify, implémenter un mode simulation (mock) ou une solution de repli dans `server/api/giveaway/extract.post.ts`.
* [ ] Générer plus de 50 profils fictifs avec avatars (via Pravatar), commentaires et drapeaux aléatoires pour `has_liked` et `is_follower`.

---

## Groupe 3 : Disposition Mobile Principale & Zones de Sécurité

### Tâche 3.1 : Développer le Conteneur de l'Application
* [ ] Modifier `app/app.vue` ou créer `app/layouts/default.vue` pour inclure le conteneur principal.
* [ ] Mettre en place le conteneur mobile strict : `w-full max-w-[430px] aspect-[9/16] mx-auto relative overflow-hidden bg-gray-950 shadow-2xl`.
* [ ] Ajouter une superposition visuelle activable représentant l'interface native de l'appareil photo Instagram, l'en-tête du profil et la zone de légende en bas (Visualiseur de zone de sécurité) pour les tests en développement.

### Tâche 3.2 : Implémenter le Tableau de Bord Principal
* [ ] Créer le tableau de bord dans `app/app.vue`.
* [ ] Concevoir un formulaire d'adresse URL élégant avec des boutons néon et des messages d'erreur clairs.

---

## Groupe 4 : Interface Étape 0 & 1 (HUD & Révélation Initiale)

### Tâche 4.1 : Étape 0 - Le HUD d'Extraction
* [ ] Créer le composant de chargement de l'extraction dans `app/components/ExtractionHUD.vue`.
* [ ] Implémenter un terminal de lignes de log ou un cercle de progression lumineux.
* [ ] Faire défiler les messages d'état : « Initialisation... », « Extraction des commentaires... », « Recoupement des mentions J'aime... », etc.

### Tâche 4.2 : Étape 1 - Grille de Révélation en Cascade
* [ ] Créer le composant de grille utilisateur `app/components/UserGrid.vue` affichant les cartes verticales.
* [ ] Mettre en page les cartes sous forme de bandes horizontales : Avatar (à gauche), Nom d'utilisateur + Commentaire (à droite).
* [ ] Appliquer un composant `<TransitionGroup>` avec une animation d'apparition décalée (translation vers le haut et fondu d'opacité).

---

## Groupe 5 : Interface Étape 2 & 3 (Cinématique d'Élimination)

### Tâche 5.1 : Étape 2 - Animation de Filtre des Mentions J'aime
* [ ] Identifier les cartes ayant `has_liked === false` et leur appliquer les classes CSS de transition Tailwind `grayscale opacity-40 scale-95 duration-1000`.
* [ ] Orchestrer le timing de l'élimination :
  - 0 ms : Appliquer les effets de gris et de réduction d'échelle.
  - 1500 ms : Déclencher la mise à jour de l'état `purgeNonLikers()`.
  - Le composant `<TransitionGroup>` gère automatiquement la réduction de hauteur et des marges via les classes `list-leave-to` et `list-leave-active`.

### Tâche 5.2 : Étape 3 - Animation de Filtre des Abonnés
* [ ] Suivre les mêmes étapes que la tâche 5.1 en ciblant cette fois les cartes avec `is_follower === false`.
* [ ] S'assurer que les cartes restantes se déplacent de manière fluide pour combler les espaces vides.

---

## Groupe 6 : Interface Étape 4 & 5 (Métamorphose & Roulette CS2)

### Tâche 6.1 : Étape 4 - La Phase de Métamorphose
* [ ] Faire disparaître le texte des commentaires (`opacity-0`) sur les cartes des participants restants.
* [ ] Passer d'une grille verticale à une seule ligne horizontale de tuiles carrées (dimensions : `120x120` px) alignées hors-écran sur la droite.
* [ ] Centrer cette bande de roulette parfaitement dans la zone de sécurité médiane (les 70 % centraux).

### Tâche 6.2 : Étape 5 - Lancement de la Roulette CS2
* [ ] Créer le composant de bande de roulette `app/components/RouletteTape.vue`.
* [ ] Construire la bande en dupliquant la liste des survivants au moins 20 fois.
* [ ] Sélectionner au hasard un gagnant, le placer à l'index cible (ex. 130) et calculer sa position X exacte.
* [ ] Afficher une ligne de visée verticale lumineuse jaune au centre de l'écran.
* [ ] Déclencher l'animation GSAP : `gsap.to(tapeRef, { x: targetX, duration: 8, ease: "power4.out" })`.
* [ ] Appliquer dynamiquement un filtre CSS de flou de mouvement (motion blur) pendant la phase de rotation rapide de la roulette.

---

## Groupe 7 : Interface Étape 6 (Victoire & Particules)

### Tâche 7.1 : Écran de Victoire & Confettis
* [ ] Réduire l'opacité des tuiles non gagnantes de la roulette à `opacity-30`.
* [ ] Agrandir la tuile gagnante à `1.2x` et lui appliquer une lueur dorée pulsante.
* [ ] Déclencher un jet de confettis sur le canvas à partir de la position de la tuile gagnante.
* [ ] Ajouter une carte moderne avec l'identifiant Instagram et le commentaire du vainqueur.

### Tâche 7.2 : Intégration & Chef d'Orchestre
* [ ] Relier toutes les phases dans `app/app.vue` en utilisant un observateur (watcher) sur l'état `status` du store Pinia.
