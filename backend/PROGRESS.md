# MA PLACE — Suivi du backend

> **Fichier de reprise.** Lire ce fichier en premier pour continuer le développement.
> Dernière mise à jour : étape 5 (Files d'attente) validée — **120 tests verts**.

---

## 1. Où on s'est arrêté

| Étape | Module | État | Tests |
|---|---|---|---|
| 1 | Authentification | ✅ Validé | `npm run test:auth` (9) |
| 2 | Utilisateurs | ✅ Validé | `npm run test:users` (16) |
| 3 | Établissements | ✅ Validé | `npm run test:establishments` (30) |
| 4 | Services + migration 001 | ✅ Validé | `npm run test:services` (34) |
| **5** | **Files d'attente + migration 002** | ✅ **Validé** | `npm run test:queues` (31) |
| 6 | Tickets / clients | ⬜ **À faire (prochaine étape)** | — |
| 7 | Gestion de la file (gestionnaire) | ⬜ | — |
| 8 | Temps réel (WebSocket) | ⬜ | — |
| 9 | QR Code (accès public) | ⬜ | — |
| 10 | Notifications | ⬜ | — |

**Règle :** ne pas commencer une étape tant que la précédente n'est pas verte (`npm test`).

---

## 2. Comment tester (toujours)

```bash
cd backend
npm test        # LA commande : démarre le serveur si besoin, lance les 5
                # scripts de tests, nettoie les données de test, arrête le serveur
```

- Serveur de dev manuel : `npm run dev` (terminal 1), `npm run test:xxx` (terminal 2).
- Si le serveur est éteint, les scripts affichent une consigne claire (plus de `FAIL 000`).
- Code de sortie `0` = tout est vert.
- Chaque étape ajoute son script `tests/<module>.test.sh` + entrée `test:<module>` dans
  `package.json` + appel dans `tests/run.sh` (voir section 5).
- **Nettoyage** : `delete_user()` (helpers.sh) supprime dans l'ordre files → établissements
  → utilisateur. Ne jamais inverser : la FK `queues → services` est en `RESTRICT`.
- Après chaque étape : exécuter `npm test` et n'afficher que les résultats.

Autres commandes :
```bash
npm run migrate    # applique database/migrations/*.sql non exécutés
npm run seed       # reset + seed (catégories, utilisateurs, 1 établissement)
npm run dev        # serveur avec --watch
```

Comptes seed : `gestionnaire@maplace.com` / `password`,
`client@maplace.com` / `password`, admin `adelininfo08@gmail.com` / `Chris`.

---

## 3. Conventions du projet (à respecter)

- **ESM** (`"type": "module"`), Express 5, `pg`, `bcrypt` (cost 12), `jsonwebtoken`.
- Structure : `src/{config,controller,error,middleware,model,route,util}`.
  **`src/config/` reste intact** (uniquement `database.js`).
- Réponses : succès `{ success: true, data: {...} }` (ou `message`),
  erreur `{ success: false, message }` via `AppError(message, statusCode)`
  (`src/error/appError.js`) + middleware global `src/middleware/errorHandler.js`.
- Codes PG mappés dans `errorHandler` : `23505`→409, `23503`→400, `22P02`→400,
  sinon 500 sans détail (jamais de stack trace en prod).
- Auth : `authenticate` (`src/middleware/auth.js`) → `req.user` (jamais de hash).
  Routage : `router.use(authenticate)` en tête de fichier.
- **Propriété des ressources** : toujours vérifier `manager_id === req.user.id`
  (fonction type `getOwnedEstablishment` / `getOwnedService`) → 404 si introuvable,
  403 si pas au propriétaire.
- Models : SQL paramétré (`$1`), whitelist de colonnes pour les UPDATE.
- **JSDoc en français obligatoire** sur chaque fonction (rôle, params avec types,
  retour) — voir exemples existants. Noms de variables/fichiers en anglais.
- Un seul système d'auth, un seul type `User` (rôle via `is_admin` +
  `establishments.manager_id`). **Pas de rôle admin ajouté, pas de paiement.**
- Pas de CRUD inutile : créer uniquement les endpoints réellement utilisés.

---

## 4. Base de données — état et règles

- Source de vérité : `database/schema.sql` (**mis à jour** : section `6. TABLE SERVICE`
  ajoutée, sections renumérotées, index `idx_services_establishment_id`).
- Migrations : `database/migrations/*.sql` appliquées par `database/migrate.js`
  (suivi dans table `schema_migrations`, 1 transaction par fichier, idempotent).
  - `001_add_services.sql` ✅ appliquée.
  - `002_queue_per_service.sql` ✅ appliquée (la file dépend du service).
- Tables : `users`, `categories`, `establishments`, `services`, `queues`,
  `tickets`, `ticket_events`.
- Enums : `establishment_status(ACTIVE,INACTIVE)`,
  `queue_status(OPEN,PAUSED,REGISTRATION_CLOSED,CLOSED)`,
  `ticket_status(WAITING,CALLED,IN_SERVICE,COMPLETED,ABSENT,CANCELLED)`,
  `ticket_channel(ONLINE,PHYSICAL)`.
- **Règle d'or des files** : une file = un service **+ une journée**
  (`queues.service_id` + `queues.date`, `UNIQUE (service_id, date)`, défaut
  `CURRENT_DATE`) → chaque jour, nouvelle file, anciens tickets jamais actifs le
  lendemain. À respecter dans toute l'API.
- `queues.service_id` : `NOT NULL`, `FK → services ON DELETE RESTRICT` → un service
  ayant eu des files ne peut pas être supprimé (le controller renvoie une erreur claire
  avant même l'erreur PG).
- `tickets` : `number` UNIQUE par queue, `tracking_token` UNIQUE (suivi anonyme),
  `user_id` nullable (client non connecté).

---

## 5. Étapes restantes (détaill pour la reprise)

### Étape 5 — Files d'attente ✅ Validé

Routes (toutes sous `authenticate`, montées dans `app.js` sur `/api/establishments`) :

| Méthode | Chemin | Rôle |
|---|---|---|
| POST | `/api/establishments/:estId/services/:serviceId/queue` | Ouvre la file du jour (409 si déjà ouverte) |
| GET | `.../queue` | État + stats `{ peoplePresent, currentTicket }` |
| PATCH | `.../queue` | Change l'état via `body.status` |

Transitions autorisées (endpoint unique, validées côté serveur) :

```text
OPEN ───────────► PAUSED ─────────► OPEN (reprise)
 │                  │
 ├──► REGISTRATION_CLOSED ──► OPEN (reprise)
 │
 └──► CLOSED   (terminal : CLOSED → * renvoie 400)
PAUSED et REGISTRATION_CLOSED peuvent aussi aller directement à CLOSED.
```

Fichiers : `model/queueModel.js`, `controller/queueController.js`, `route/queue.js`,
`tests/queues.test.sh` (31 tests) + migration `002_queue_per_service.sql`.

**Le ticket en cours et le nombre de personnes** sont déjà calculés par
`getQueueStats()` : ils resteront à `0` / `null` tant que l'étape 6 (tickets)
n'existe pas.

### Étape 6 — Tickets ⬜ (prochaine)
- Parcours : QR → établissement → service → file du jour → nom + téléphone →
  ticket → position.
- Endpoints : rejoindre (créer ticket avec `number` séquentiel par queue,
  `tracking_token`), récupérer son ticket, position / nb de personnes devant,
  quitter la file, état du ticket.
- Gérer les doublons (contraintes `UNIQUE`) et les erreurs PG propres.
- `model/ticketModel.js`, `controller/ticketController.js`, `route/ticket.js`,
  `tests/tickets.test.sh`.
- **Déjà en place** : `getQueueStats()` (queueModel) compte les personnes présentes
  et le ticket appelé — à brancher sur la réponse de `GET .../queue` (déjà fait) et
  à réutiliser pour la position.

### Étape 7 — Gestion de la file par le gestionnaire ⬜
- Actions : suivant (appeler), absent, servi, annuler, pause, reprendre, fermer.
- Centraliser la logique métier (ne pas la mettre dans le controller),
  tout consigner dans `ticket_events` (`old_status`, `new_status`, `actor_id`).
- Le « suivant » : ticket courant → `COMPLETED`/`IN_SERVICE`, prochain `WAITING`
  → `CALLED` (`called_at`).
- Vérifier `queue_status` avant chaque action (ex : ticket interdit si `CLOSED`).
- `tests/queue-management.test.sh`.

### Étape 8 — Temps réel (WebSocket) ⬜
- **Uniquement après REST stable.** Dépendance à ajouter (`socket.io` ou `ws`).
- Événements : changement de position, appel du ticket, changement d'état de la
  file, fermeture — rooms par file/service.
- Émettre depuis la couche métier au moment des écritures DB de l'étape 7.

### Étape 9 — QR Code ⬜
- Le backend doit fournir les données du parcours (routes publiques à prévoir) :
  `GET /api/establishments/:id` et `.../services/:serviceId` en **lecture publique**
  (aujourd'hui elles sont en 403 pour les non-propriétaires).
- Ne pas complexifier : le QR pointe vers l'URL du service, le frontend enchaîne.

### Étape 10 — Notifications ⬜
- « Bientôt votre tour », « votre numéro est appelé », changements importants.
- Solution technique à choisir plus tard (voir avec l'utilisateur).

---

## 6. Points ouverts / décisions à revalider

1. **Pas de `DELETE` établissement** (désactivation `INACTIVE` uniquement) —
   protège l'historique des files/tickets. À réévaluer si demandé.
2. ~~**Suppression d'un service**~~ ✅ résolu : `deleteServiceHandler` vérifie
   `countQueuesByService()` et renvoie 400 « Ce service a un historique de files
   d'attente : suppression impossible. » avant l'erreur PG `23503`.
3. `GET /api/auth/me` et `GET /api/users/me` font doublon volontairement
   (compatibilité) — le second est le canonical.
4. Changer un mot de passe n'invalide pas les JWT émis (pas de liste de
   révocation) — acceptable pour le MVP, à réévaluer.
5. `npm test` détecte un serveur déjà lancé et l'utilise sans l'arrêter.
