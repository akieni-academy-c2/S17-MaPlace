# Ma Place

Application web de file d'attente : les établissements gèrent leur file depuis un tableau de bord, les clients prennent un ticket à distance et suivent leur tour en direct.

- `backend/` : API Express + PostgreSQL
- `frontend/` : application React (Vite)

## Backend

```bash
cd backend
npm install
cp .env.example .env      # renseigner la base PostgreSQL et JWT_SECRET
npm run db:reset          # crée les tables (schema.sql) et ajoute les données de démo
npm run dev               # http://localhost:3000
```

- `npm run db:reset` efface la base, la recrée à partir de `database/schema.sql` puis lance le seed.
- `npm run seed` remet seulement les données de démo (les tables doivent exister).

Comptes de démo : chaque établissement du seed se connecte avec son email (ex. `chu@example.com`) et le mot de passe `password123`.

## Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
npm run build             # version de production dans dist/
```

### Adresse du backend

Tous les appels à l'API sont dans **`frontend/src/services/api.js`**. Pour la mise en ligne, remplacez l'adresse locale par celle du backend hébergé :

```js
export const API_URL = 'http://localhost:3000/api'
```
