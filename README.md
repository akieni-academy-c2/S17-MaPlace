# Ma Place — File d'attente en ligne, Brazzaville

## Présentation

Ma Place est une application web de gestion de files d'attente. Les clients prennent un ticket à distance et suivent leur tour en direct depuis leur téléphone, sans compte. Les établissements (administrations, hôpitaux, banques, agences télécoms, salons de beauté) gèrent leur file depuis un tableau de bord.

- Site : https://s17-maplace-1.onrender.com/
- API : https://s17-maplace.onrender.com/

Connexion établissement (démo) :

- Email : `chu@example.com`
- Mot de passe : `password123`

> L'API est hébergée sur l'offre gratuite de Render : après une période d'inactivité, la première requête peut prendre 30 à 50 secondes.

Le projet est composé de deux parties :

- un backend REST développé avec Node.js et Express, relié à PostgreSQL (hébergé sur Supabase) ;
- un frontend React (Vite), en CSS pur (variables CSS + CSS Modules).

Le fonctionnement général est le suivant :

**Client : Accueil → Établissement → Prendre un ticket → Mon ticket (suivi en direct) → C'est votre tour → Récapitulatif.**

**Établissement : Connexion → Tableau de bord → Ouvrir la file, appeler le client suivant, terminer ou annuler des tickets.**

## MVP actuel

1. annuaire des établissements de Brazzaville, avec catégories, quartiers, affluence et attente estimée ;
2. prise de ticket sans compte (nom + téléphone) ;
3. suivi du ticket en direct, avec une couleur qui change selon la position dans la file ;
4. connexion des établissements par email et mot de passe (JWT) ;
5. gestion de la file : ouverture, pause, reprise, report au lendemain, fermeture ;
6. appel du client suivant, tickets créés au guichet pour les clients sans smartphone ;
7. réglage de la durée moyenne d'un passage, utilisée pour estimer l'attente.

## Fonctionnalités disponibles

### Côté client

- recherche d'un établissement par nom, catégorie ou quartier, filtres par état de la file et par catégorie ;
- fiche établissement : état de la file, numéro appelé, personnes en attente, attente estimée, horaires, adresse ;
- prise de ticket avec vérification du nom et du numéro de téléphone (format `06 123 23 23`) ;
- page « Mon ticket » rechargée toutes les 5 secondes : position, personnes devant, numéro appelé, attente estimée ;
- couleur du ticket selon la position : **jaune** de la 15e à la 11e place, **orange** de la 10e à la 6e, **rouge** de la 5e à la 1re, **vert** quand le client est appelé ;
- écran « C'est votre tour ! » avec changement du titre de l'onglet et vibration du téléphone ;
- annulation du ticket depuis le téléphone qui l'a pris ;
- téléchargement du ticket en image ;
- favoris et ticket suivi enregistrés dans le navigateur.

### Côté établissement

- tableau de bord : clients en attente, ticket au guichet, prochain ticket, tickets servis, historique récent ;
- ouverture, pause, reprise et fermeture de la file ;
- report au lendemain : les clients en attente gardent leur numéro ;
- appel du client suivant, fin de passage, annulation d'un ticket ;
- création d'un ticket au guichet, avec impression ou téléchargement ;
- durée moyenne d'un passage : durées proposées (5 à 45 min) ou durée libre (1 à 240 min).

## Structure du projet

```text
.
├── backend/
│   ├── app.js
│   ├── database/
│   │   ├── schema.sql
│   │   ├── reset.js
│   │   └── seed.js
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── error/
│       ├── middleware/
│       ├── modele/
│       ├── routes/
│       └── services/
└── frontend/
    ├── index.html
    └── src/
        ├── routes.jsx
        ├── services/api.js
        ├── pages/
        │   ├── client/
        │   └── establishment/
        ├── components/
        ├── hooks/
        ├── context/
        ├── constants/
        ├── utils/
        ├── styles/
        └── assets/
```

### Backend

- `routes/` définit les endpoints HTTP ;
- `controllers/` lit la requête et construit la réponse ;
- `services/` applique les règles métier et renvoie des erreurs claires (400, 404, 409) ;
- `modele/` exécute les requêtes PostgreSQL (transactions et verrous pour la numérotation des tickets) ;
- `middleware/` gère l'authentification JWT et les erreurs ;
- `config/` configure la connexion à la base de données ;
- `database/schema.sql` définit le schéma SQL ;
- `database/seed.js` contient les données de démonstration (27 établissements de Brazzaville) ;
- `database/reset.js` recrée toutes les tables à partir du schéma.

### Frontend

- `routes.jsx` déclare toutes les pages ;
- `services/api.js` contient **tous** les appels à l'API et l'adresse du backend ;
- `pages/client/` et `pages/establishment/` contiennent les pages ;
- `components/` regroupe les composants réutilisables (interface, ticket, file, mise en page) ;
- `hooks/` contient la logique partagée (rechargement en continu, gestion de la file, suivi du ticket) ;
- `constants/` contient les statuts, catégories, routes et seuils de couleur.

## Prérequis

- Node.js 20 ou plus (le script `dev` utilise `node --watch`) ;
- npm ;
- une base PostgreSQL : locale ou hébergée (Supabase).

Le backend lit les variables d'environnement suivantes (`backend/.env`, voir `backend/.env.example`) :

```text
PORT
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
DB_SSL            # true pour Supabase, absent ou false en local
JWT_SECRET
JWT_EXPIRES_IN
```

Le fichier `.env` contient des secrets : il ne doit pas être publié.

## Installation et lancement en local

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # renseigner la base de données et JWT_SECRET
npm run db:reset          # crée les tables et ajoute les données de démo
npm run dev               # http://localhost:3000
```

- `npm run db:reset` efface la base, la recrée à partir de `database/schema.sql` puis lance le seed ;
- `npm run seed` remet seulement les données de démo (les tables doivent exister) ;
- `npm start` lance le serveur sans rechargement automatique (production).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

L'adresse du backend se règle à un seul endroit, `frontend/src/services/api.js` :

```js
export const API_URL = 'http://localhost:3000/api'          // en local
export const API_URL = 'https://s17-maplace.onrender.com/api' // en ligne
```

Autres commandes : `npm run lint` (vérification du code) et `npm run build` (version de production dans `dist/`).

## Comptes de démonstration

Chaque établissement du seed se connecte avec son email et le mot de passe `password123`. Quelques exemples :

| Établissement | Catégorie | Email |
|---|---|---|
| CHU de Brazzaville — Consultations externes | Santé | `chu@example.com` |
| Mairie centrale de Brazzaville | Administration | `mairie.centrale@example.com` |
| BGFIBank Congo — Agence centrale | Banque | `bgfibank@example.com` |
| MTN Congo — Agence centrale | Télécom | `mtn.centre@example.com` |
| Salon Élégance | Esthétique & Beauté | `salon@example.com` |

Ces comptes n'existent que si le seed a été chargé. Ils servent au développement et aux démonstrations.

## API

Préfixe : `/api`. Les routes marquées **(JWT)** demandent le jeton JWT de l'établissement :

```text
Authorization: Bearer <token>
```

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/auth/login` | Connexion d'un établissement |
| GET | `/auth/me` **(JWT)** | Établissement connecté |
| GET | `/establishments` | Liste des établissements et de leur affluence |
| GET | `/establishments/:id` | Fiche d'un établissement |
| PATCH | `/establishments/me` **(JWT)** | Durée moyenne d'un passage |
| POST | `/tickets` | Prendre un ticket |
| GET | `/tickets/:id` | Suivre un ticket |
| POST | `/tickets/:id/cancel-by-client` | Annulation par le client (jeton d'annulation) |
| POST | `/tickets/:id/complete` **(JWT)** | Terminer un passage |
| POST | `/tickets/:id/cancel` **(JWT)** | Annuler un ticket |
| GET | `/queue` **(JWT)** | File en cours et ses tickets |
| POST | `/queue/open` · `/pause` · `/resume` · `/postpone` · `/close` **(JWT)** | Changer l'état de la file |
| POST | `/queue/next` **(JWT)** | Appeler le client suivant |
| POST | `/queue/tickets` **(JWT)** | Créer un ticket au guichet |

`GET /health` indique si l'API est connectée à la base.

## Déploiement

| Partie | Hébergeur |
|---|---|
| Base de données | Supabase | 
| Backend | Render (Web Service) | 
| Frontend | Vercel ou Render (Static Site) | 

## Équipe du projet

| Membre | Rôle |
|---|---|
| Giovani MOUKOKO | Lead développeur |
| Chrislain MOUYOCKOLO  | Administrateur du dépôt et développeur |

### Équipe frontend — répartition des tâches

Chaque développeur a repris une ou deux pages, de la route dans `routes.jsx` jusqu'aux composants, avec un commit par tâche.

| Identifiant | Auteur | Page(s) | Tâches |
|---|---|---|---|
| FT-1 | Nice Tiphaine ASSOURA  | Prendre un ticket + Ticket terminé | routes, vérification du formulaire, champ téléphone, durée du passage, « Reprendre un ticket ici », fin du suivi |
| FT-2 | Messi Soleil ELENGA  | Mon ticket + C'est votre tour | routes, couleur selon la position, cartes « Progression », alerte d'appel |
| FT-3 | Gael YANGU GABRI  | Mes tickets | route, statut et couleur du ticket suivi, attente estimée |
| FT-4 | Nsangou DJENNA | Favoris + page 404 | routes, grille des favoris |
| FT-5 | Giovani MOUKOKO | Dashborad + file d'sttente | routes, dashbord et setup du frontend |
| FT-6 | Chrislain MOUYOCKOLO | accueil et connexion | routes, accueil et connexion |

> Les identifiants FT-1 à FT-4 servent à répartir les tâches dans la documentation du projet.

### Équipe frontend — répartition des tâches

| Auteur | Taches |
|---|---|
| Nsangou DJENNA | queue + ticket |
| Chrislain Mouyockolo | authentification + etablissement |

## État du projet

Le dépôt contient le MVP fonctionnel : l'API est en ligne et reliée à PostgreSQL sur Supabase. Aucun test automatisé n'est configuré : `npm test` dans `backend/` affiche seulement un message indiquant qu'aucun test n'existe.
