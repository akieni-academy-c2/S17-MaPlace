# Répartition des tâches frontend

Chacun travaille sur **sa propre branche**, créée depuis `develop`, et uniquement dans **les fichiers qui lui sont confiés**. Deux tâches ne touchent jamais le même fichier : les PR peuvent être fusionnées dans n'importe quel ordre.

Les règles de code et le fonctionnement des branches sont décrits dans [CONTRIBUTING.md](../CONTRIBUTING.md).

## Mise en place (dans cet ordre)

1. **Giovani** pousse `feat/frontend-v1` et ouvre la PR `feat/frontend-v1 → develop`.
2. **Gerland** fusionne cette PR, puis protège `develop` et `main` (voir sa fiche).
3. **Chacun** crée sa branche depuis `develop` à jour :

   ```bash
   git switch develop && git pull
   git switch -c feat/<prenom>-<sujet>
   ```

## Tâches par personne

### Giovani (@giovani-mouk) — lead dev · `fix/giovani-entete`

- Relire toutes les PR. Seul à modifier les zones partagées (voir `.github/CODEOWNERS`). Ses propres PR sur ces zones sont approuvées par Gerland.
- En-tête client : le bouton « Profil » n'a aucune action (pas de compte client). Le retirer ou le diriger vers « Mon ticket ».
- Titre « Détails Du Lieu » : `text-transform: capitalize` met une majuscule à chaque mot. Garder la casse du texte.
- Arbitrer les demandes de l'équipe : nouvelles icônes, composants, champs d'API ; texte de confidentialité de la fin de parcours (voir Gael).

Fichiers : `frontend/src/components/layout/AppHeader.*`, zones partagées.

### Gerland (@chrislainInfo) — admin du dépôt · `chore/gerland-github`

- Fusionner la PR du socle.
- Ajouter les membres de l'équipe comme collaborateurs du dépôt (Settings → Collaborators, droit **Write**).
- Protéger `develop` et `main` (Settings → Branches) : PR obligatoire, 1 approbation, **Require review from Code Owners**, vérifications CI requises, pas de push forcé.
- Créer `.github/pull_request_template.md` : checklist reprise de `CONTRIBUTING.md` (lint, build, captures 390 / 768 / 1024 / 1440 px).
- Créer `.github/workflows/frontend-ci.yml` : sur chaque PR vers `develop`, `npm ci`, `npm run lint` et `npm run build` dans `frontend/`.

Fichiers : `.github/pull_request_template.md`, `.github/workflows/`.

### Djenna (@DIASSIVI-sys) — dev · `feat/djenna-file-pro`

- **Recherche dans « File d'attente »** : ajouter le `SearchBar` existant, qui filtre par nom ou numéro (« 4 », « #4 », « aicha » trouve « Aïcha »), en plus des filtres de statut.
- **Alerte nouveau ticket sur le tableau de bord** : quand `lastNumber` augmente, son bref (Web Audio, sans fichier) et titre d'onglet « (n) Ma Place ». Bouton pour couper le son, mémorisé via `utils/storage`.

Fichiers : `frontend/src/pages/establishment/QueuePage.*`, `frontend/src/pages/establishment/DashboardPage.*`.

### Tiphaine — dev · `feat/tiphaine-decouverte`

- **Cartes d'établissement** : afficher « n en attente » et « Appelé #N ». `waiting_count` et `current_number` sont déjà renvoyés par `GET /api/establishments`. Lisible en mobile et en grille desktop.
- **Fiche du lieu** : afficher le téléphone (`phone`) avec `formatPhone`. Retirer l'affichage de `category`, que l'API ne renvoie pas.

Fichiers : `frontend/src/components/establishment/EstablishmentCard.*`, `frontend/src/pages/client/EstablishmentPage.*`.

### Soleil (@elengamessisoleil-hash) · `feat/soleil-parcours-ticket`

- **Bouton « Je me présente »** : il ne fait rien aujourd'hui. Il n'y a pas de route backend, donc la confirmation est locale : le bouton devient « Présence signalée » et un `InfoNote` s'affiche.
- **Alerte « C'est votre tour »** : à l'arrivée sur la page d'appel, vibration si le téléphone le permet, son court, titre d'onglet « C'est votre tour ! ».
- **Icône d'établissement neutre** : l'icône pharmacie s'affiche pour tous les lieux. Utiliser `ICONS.store`.

Fichiers : `frontend/src/pages/client/TicketCalledPage.*`, `frontend/src/pages/client/TicketPage.*`.

### Gael · `feat/gael-finitions`

- **Page « Ticket terminé / annulé »** : les onglets Terminé / Annulé sont cliquables mais sans effet. N'afficher que le statut réel. Icône pharmacie remplacée par `ICONS.store`.
- **Texte de confidentialité** : « Vos coordonnées ont été effacées » est faux, le backend les conserve. Proposer une formulation exacte, validée par Giovani.
- **Page 404** : remplacer les styles inline par `NotFoundPage.module.css`, rendu correct du mobile au desktop.
- **Favicon et couleur du navigateur** : favicon tiré du pictogramme de `logo.png` (32 px et 512 px), `theme-color` de `index.html` aligné sur le bleu du logo.

Fichiers : `frontend/src/pages/client/TicketEndPage.*`, `frontend/src/pages/NotFoundPage.*`, `frontend/public/`, `frontend/index.html`.

## Qui touche quoi

| Zone | Giovani | Gerland | Djenna | Tiphaine | Soleil | Gael |
| --- | :-: | :-: | :-: | :-: | :-: | :-: |
| `components/ui`, `layout`, `constants`, `services`, `hooks`, `context`, `routes.jsx`, `styles/` | modifie | | | | | |
| `backend/` | modifie | | | | | |
| `.github/` | relit | modifie | | | | |
| `pages/establishment/QueuePage`, `DashboardPage` | relit | | modifie | | | |
| `components/establishment`, `pages/client/EstablishmentPage` | relit | | | modifie | | |
| `pages/client/TicketPage`, `TicketCalledPage` | relit | | | | modifie | |
| `pages/client/TicketEndPage`, `pages/NotFoundPage`, `public/`, `index.html` | relit | | | | | modifie |

Besoin de toucher un fichier hors de sa ligne ? Demander d'abord à Giovani.
