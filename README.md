# Je cours pour ma forme — App User

Application Vue 3 / Vite / Pinia / PWA destinée aux coureurs. Elle consomme l’API Nuxt du projet voisin et enregistre la progression de l’utilisateur.

## Démarrer le projet

```bash
npm install
npm run dev
```

L’application est servie par Vite, généralement sur `http://localhost:5173`.

```bash
npm run build
npm run preview
```

## Variable d’environnement

Créer un fichier `.env` local :

```env
VITE_API_URL=http://localhost:3000
```

Cette variable contient seulement l’URL publique de l’API et peut donc être embarquée dans le navigateur. Ne jamais y placer un mot de passe de base de données ou une clé JWT.

En production, remplacer cette URL par celle du déploiement Vercel de l’API, puis reconstruire l’App User.

## Arborescence

```text
src/
  main.js                     création de Vue, Pinia et du routeur
  App.vue                     en-tête, pied de page et restauration d’authentification
  router/index.js             routes et protection des pages connectées
  stores/
    auth.js                   connexion, token local et récupération de /api/auth/me
    saisons.js                chargement et lecture du programme actif
    progress.js               saison/séance active et synchronisation MySQL
    session.js                minuteur, pause, audio et sauvegarde locale de séance
  views/
    LoginPage.vue             connexion
    RegisterPage.vue          inscription coureur
    HomePage.vue              choix du programme et déroulement de séance
    ProfilePage.vue           progression, réinitialisation et déconnexion

public/
  sons/                       fichiers audio associés aux types d’exercice
  icons/                      icônes et logo de la PWA
```

## Fonctionnement

1. Le coureur crée un compte ou se connecte.
2. L’application récupère les saisons avec `GET /api/saisons`.
3. Elle restaure la séance stockée dans `current_session_id` si elle existe ; sinon elle sélectionne le premier programme disponible.
4. Au lancement d’une séance, `PATCH /api/users/me/progress` est appelé avant de démarrer le minuteur.
5. À la fin d’une séance, la prochaine séance est enregistrée côté API avant la mise à jour de l’interface.
6. À la fin d’une saison, l’API reçoit `currentSessionId: null`.

Les données du minuteur en cours sont aussi conservées dans `localStorage` pour proposer une reprise après rechargement. Un token invalide, expiré ou une API inaccessible déconnecte l’utilisateur proprement.

## Audio

Les types renvoyés par l’API sont associés aux fichiers de `public/sons/` :

`echauffement`, `trotte`, `marche`, `etirement`, `sprint`, `deboule`, `cours`.

Ce référentiel doit rester synchronisé avec la validation côté API Nuxt.

## Test local recommandé

Lancer l’API Nuxt sur le port `3000`, puis l’App User. Utiliser uniquement la saison `test` pour le scénario de vérification : connexion, affichage du programme, lancement de séance et contrôle de la progression dans le CMS.

## PWA

`vite-plugin-pwa` génère le manifeste et le service worker pendant `npm run build`. Les icônes déclarées dans `vite.config.js` doivent rester présentes dans `public/icons/`.
