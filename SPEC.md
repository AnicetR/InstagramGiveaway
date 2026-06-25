Voici le document `SPEC.md` mis à jour, fortement optimisé pour une disposition verticale mobile au format 9:16. Il inclut des contraintes UI/UX spécifiques pour garantir que l'animation finale soit parfaite lorsqu'elle est enregistrée et publiée directement sur Instagram Reels ou Stories.

---

# Spécification de l'Application Roulette de Concours (Mobile-First / 9:16)

## 1. Présentation générale

Une application web conçue pour automatiser les tirages au sort de concours Instagram, spécialement pensée pour être enregistrée en vidéo et publiée sur Instagram Reels/Stories. Elle s'exécute dans un conteneur vertical strict au format 9:16. Elle accepte l'URL d'une publication Instagram, extrait les commentaires, les mentions J'aime et les abonnés via l'API d'Apify, puis exécute un flux d'élimination très dynamique avant de désigner le gagnant via une animation de roulette horizontale de style CS2, adaptée aux écrans étroits.

## 2. Pile technique

* **Framework :** Nuxt 3 (SSR + Server Routes)
* **Logique Frontend :** Vue 3 (Composition API)
* **Gestion d'état :** Pinia
* **Styles :** Tailwind CSS (classes utilitaires mobile-first)
* **Moteur d'animation 1 (Mise en page) :** Élément natif Vue `<TransitionGroup>`
* **Moteur d'animation 2 (Roulette) :** GSAP (GreenSock)
* **Extraction des données Backend :** API Apify (via les routes serveur de Nuxt `/api`)

---

## 3. Disposition globale & Zones de sécurité (Safe Zones)

Étant donné que le rendu final sera publié sur Instagram, l'interface utilisateur de l'application doit respecter des dimensions mobiles strictes et éviter les zones d'incrustation natives d'Instagram.

* **Conteneur principal :** L'ensemble de l'application doit être encapsulé dans un conteneur forçant un affichage mobile : `w-full max-w-[430px] aspect-[9/16] mx-auto relative overflow-hidden bg-gray-950`.
* **La « Zone de sécurité » :** Les Reels Instagram recouvrent les 20 % inférieurs (légendes/musique) et les 10 % supérieurs (interface de la caméra/profil) de l'écran. Tous les textes critiques, cartes et l'animation finale de la roulette **doivent** être centrés verticalement dans les 70 % intermédiaires du conteneur.

---

## 4. Schéma des données

| Propriété | Type | Description |
| --- | --- | --- |
| `id` | Chaîne | Un UUID unique généré pour suivre les nœuds du DOM. |
| `username` | Chaîne | L'identifiant Instagram unique (Clé primaire). |
| `avatar` | Chaîne | URL de l'image de profil de l'utilisateur. |
| `comment` | Chaîne | Le texte du commentaire saisi pour participer. |
| `has_liked` | Booléen | Indicateur calculé côté serveur (`true` si l'utilisateur existe dans l'extraction des J'aime). |
| `is_follower` | Booléen | Indicateur calculé côté serveur (`true` si l'utilisateur existe dans l'extraction des abonnés). |

---

## 5. Spécification Backend (Route serveur Nuxt)

**Point de terminaison :** `POST /api/giveaway/extract`  
**Données envoyées :** `{ url: String }`

**Flux d'exécution :**

* Initialiser le SDK d'Apify.
* Exécuter trois acteurs Apify en parallèle avec `Promise.all()` pour minimiser les temps d'attente :
  1. Extraire les commentaires de la publication
  2. Extraire les mentions J'aime de la publication
  3. Extraire les abonnés du créateur
* Croiser les données : se baser sur la liste des commentaires. Parcourir les commentaires et définir `has_liked` à `true` si le nom d'utilisateur est présent dans la liste des J'aime. Définir `is_follower` à `true` si le nom d'utilisateur est présent dans la liste des abonnés.
* Renvoyer le tableau final nettoyé au client.

---

## 6. Cinématique Frontend & Flux de l'Interface Utilisateur

### Étape 0 : Le HUD d'extraction

**Condition d'état :** `status === 'fetching'`  
**Éléments de l'interface :** Un terminal textuel à haut contraste ou un indicateur de progression circulaire lumineux, centré verticalement.  
**Action :** Afficher une variable textuelle dynamique qui fait défiler les différentes étapes de l'extraction (ex. « Connexion à l'API Instagram en cours... », « Extraction des commentaires... », « Recoupement des données... »). Veiller à ce que le texte soit grand et lisible sur mobile.

### Étape 1 : Révélation initiale (Optimisée verticale)

**Condition d'état :** `status === 'revealing'`  
**Éléments de l'interface :** Une grille sur une seule colonne ou sur deux colonnes serrées (`grid-cols-1` ou `grid-cols-2`). Les cartes doivent être des bandes horizontales compactes (avatar à gauche, nom d'utilisateur et commentaire empilés à droite).  
**Implémentation :** Parcourir le tableau `users` au sein d'un composant `<TransitionGroup name="list" tag="div" class="flex flex-col gap-2 p-4">`.  
**Animation :** Utiliser le hook `onEnter` de Vue ou des transitions CSS pour afficher les cartes en cascade vers le haut (Opacité de `0` à `1`, `transform: translateY(20px)` à `0`).

### Étape 2 : Le filtre des mentions J'aime (Like Purge)

**Condition d'état :** `status === 'purging_likes'`  
**Étape 2.1 (Identification) :** Appliquer dynamiquement les classes Tailwind `grayscale opacity-40 scale-95` à toute carte affichée pour laquelle `has_liked === false`.  
**Étape 2.2 (Pause) :** Attendre 1500 ms avec un `setTimeout`.  
**Étape 2.3 (Élimination) :** Appeler l'action Pinia `purgeNonLikers()`.  
**Animation :** Le composant `<TransitionGroup>` gère l'état `list-leave-active`. Les bandes verticales grisées réduisent leur hauteur (`height`) et leurs marges (`margin`) jusqu'à `0`. Les éléments survivants glissent de manière fluide vers le haut pour combler le vide.

### Étape 3 : Le filtre des abonnés (Follower Purge)

**Condition d'état :** `status === 'purging_follows'`  
**Étape 3.1 (Identification) :** Appliquer dynamiquement les classes Tailwind `grayscale opacity-40 scale-95` à toute carte pour laquelle `is_follower === false`.  
**Étape 3.2 (Pause) :** Attendre 1500 ms avec un `setTimeout`.  
**Étape 3.3 (Élimination) :** Appeler l'action Pinia `purgeNonFollowers()`. La disposition se réorganise de manière fluide grâce à `<TransitionGroup>`.

### Étape 4 : La métamorphose et préparation

**Condition d'état :** `status === 'morphing'`  
**Étape 4.1 (Nettoyage) :** Le texte du commentaire de chaque carte disparaît en fondu (`opacity: 0`).  
**Étape 4.2 (Métamorphose) :** La liste verticale se transforme en un conteneur horizontal `flex flex-row` parfaitement centré verticalement dans la « Zone de sécurité » de l'écran.  
**Étape 4.3 (Redimensionnement) :** Les cartes animent leurs dimensions pour passer de bandes horizontales à de grands carrés (ex. `120px` sur `120px`), affichant uniquement l'avatar et le nom d'utilisateur. La bande horizontale s'aligne hors de l'écran sur la droite.

### Étape 5 : La roulette CS2 (Optimisée pour écrans étroits)

**Condition d'état :** `status === 'spinning'`  
**Étape 5.1 (Construction de la bande) :** Dupliquer le tableau des participants survivants au moins 20 fois au sein de la bande horizontale. Étant donné l'étroitesse de l'écran 9:16, seuls 3 à 4 avatars seront entièrement visibles simultanément, ce qui amplifie la sensation de vitesse et de suspense.  
**Étape 5.2 (Pré-calcul du gagnant) :** Sélectionner aléatoirement le gagnant et l'insérer vers la fin de la bande (ex. à l'index 130). Calculer le décalage négatif en X exact pour centrer l'index 130 à l'écran.  
**Étape 5.3 (L'interface) :** Afficher une ligne de visée verticale lumineuse et épaisse pile au milieu de l'écran 9:16.  
**Étape 5.4 (Le lancer) :** Cibler le conteneur de la bande : `gsap.to(tapeRef.value, { x: targetXDistance, duration: 8, ease: "power4.out" })`. Ajouter une classe CSS de flou de mouvement horizontal (motion blur) qui s'active à grande vitesse et s'estompe à mesure que la vitesse diminue.  
**Étape 5.5 (Victoire) :** Lorsque le callback `onComplete` de GSAP se déclenche, agrandir la carte gagnante à `1.2x`, réduire l'opacité de toutes les autres cartes visibles à `30 %`, appliquer une ombre portée dorée (glow) au vainqueur et lancer un jet de confettis sur tout l'écran via un canvas dédié.