# Ma Place — Frontend (React + Vite)

Frontend du MVP **Ma Place** (gestion de files d'attente), réalisé à partir des maquettes Stitch (`../*_mvp`)
et du design system **Serene Flow** (`../serene_flow/DESIGN.md`).

- React 19 + Vite, React Router
- **CSS pur** : variables CSS + CSS Modules (pas de Tailwind)
- Icônes **Material Symbols Outlined** auto-hébergées (`material-symbols`)
- Polices Inter et Plus Jakarta Sans auto-hébergées (`@fontsource-variable/*`)
- ESLint (flat config)

## Démarrage

```bash
npm install
cp .env.example .env    # optionnel
npm run dev             # http://localhost:5173 — /api est proxifié vers http://localhost:3000
npm run lint
npm run build
```

## Routes

| Espace | Route | Page | API utilisée |
|---|---|---|---|
| Client | `/` | Accueil + recherche | `GET /api/establishments` |
| Client | `/etablissements/:establishmentId` | Fiche établissement | `GET /api/establishments/:id` |
| Client | `/etablissements/:establishmentId/rejoindre` | Rejoindre la file | `POST /api/tickets` |
| Client | `/tickets/:ticketId` | Mon ticket (WAITING) | `GET /api/tickets/:id` (polling) |
| Client | `/tickets/:ticketId/appel` | C'est votre tour (SERVING) | `GET /api/tickets/:id` (polling) |
| Client | `/tickets/:ticketId/fin` | Terminé / Annulé | `GET /api/tickets/:id` |
| Établissement | `/pro/connexion` | Connexion | `POST /api/auth/login` |
| Établissement | `/pro/tableau-de-bord` | Tableau de bord (JWT) | `/api/queue/*`, `/api/tickets/:id/complete` et `/cancel` |

Les chemins sont déclarés dans `src/constants/routes.js` (`PATHS` + helpers `to.*`) et la table de
routage dans `src/routes.jsx`. Les pages ticket redirigent automatiquement selon le statut du ticket
(`useTicketTracking`).

## Structure

```
src/
├── routes.jsx              # Table de routage (lazy loading)
├── App.jsx / main.jsx
├── index.css               # Imports polices, icônes, design system
├── styles/
│   ├── tokens.css          # Design tokens : couleurs, typo, rayons, espacements, ombres
│   ├── base.css            # Reset + base
│   └── utilities.css       # Classes typo (.text-headline-lg…) et helpers
├── constants/
│   ├── routes.js           # PATHS + to.*
│   ├── icons.js            # Registre des icônes Material utilisées
│   └── status.js           # OPEN/PAUSED/CLOSED, WAITING/SERVING/COMPLETED/CANCELLED + libellés
├── components/
│   ├── ui/                 # Design system : Icon, Logo, Button, IconButton, StatusBadge,
│   │                       # QueueStatusBadge, Card, TextField, SearchBar, FilterChips,
│   │                       # SegmentedControl, StatCard, InfoNote, TicketNumber, Loader, EmptyState
│   ├── layout/             # AppHeader, BottomNav, ClientLayout, ProLayout, ProtectedRoute
│   ├── establishment/      # EstablishmentCard
│   ├── ticket/             # TicketCard (ticket perforé), TicketStats
│   └── queue/              # QueueControls, CallNextPanel, ServingTicketCard, WaitingList
├── pages/
│   ├── client/             # 6 pages client
│   └── establishment/      # LoginPage, DashboardPage
├── services/               # apiClient (fetch + JWT) + 1 service par domaine
├── context/                # AuthProvider (JWT en localStorage)
├── hooks/                  # useAuth, usePolling, useTicketTracking, useCurrentTicket, useFavorites
└── utils/                  # format, storage
```

## Icônes

```jsx
import { Icon } from '@/components/ui'
import { ICONS } from '@/constants/icons'

<Icon name={ICONS.ticket} />            // contour
<Icon name={ICONS.star} filled />       // plein (axe FILL)
<Icon name="campaign" size={32} weight={600} />
```

Ajouter une icône : la référencer dans `src/constants/icons.js` (nom issu de https://fonts.google.com/icons).

## Points en attente côté backend

- **Annulation par le client** (route publique avec `cancelToken`) : non confirmée dans la doc backend → bouton désactivé.
- **Fiche établissement** : « Actuellement appelé » et « En attente » lisent `current_number` / `waiting_count` s'ils sont renvoyés ; sinon `—`.
- **Mon ticket** : « Appelé actuellement » lit `currentNumber` s'il est renvoyé par `GET /api/tickets/:id`.
- **Favoris** : stockés dans le navigateur (pas de route backend).
