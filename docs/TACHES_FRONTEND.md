# Tâches frontend — équipe FT-1 à FT-4

Ce document répartit des petites tâches sur l’application **Ma Place**. Le code à écrire est donné **en entier** : le but est de le remettre **exactement** tel qu’il est écrit ici, sans rien inventer, puis de faire un commit par tâche.

Ne touchez à rien d’autre : ni au backend, ni aux pages établissements, ni au design.

## Qui fait quoi

| Dev | Profil | Page(s) | Tâches | Branche |
|---|---|---|---|---|
| **FT-1** | nouveau sur le projet | Prendre un ticket (`/etablissements/:id/rejoindre`) et Ticket terminé (`/tickets/:id/fin`) | 6 | `feat/ft-1-prendre-un-ticket` |
| **FT-2** | nouveau sur le projet | Mon ticket (`/tickets/:id`) et C’est votre tour (`/tickets/:id/appel`) | 5 | `feat/ft-2-suivi-du-ticket` |
| **FT-3** | a déjà contribué | Mes tickets (`/mes-tickets`) | 3 | `feat/ft-3-mes-tickets` |
| **FT-4** | a déjà contribué | Favoris (`/favoris`) et Page introuvable (toute URL inconnue) | 3 | `feat/ft-4-favoris-404` |

## Repérer où intervenir

Chaque endroit à compléter est signalé dans le code par **🚧 FT-x — Tâche x.y**. Pour les lister :

```bash
grep -rn "🚧 FT-1" frontend/src     # remplacez FT-1 par votre numéro
```

Trois sortes de marqueurs :

- `// 🚧 FT-x — Tâche x.y …` sur une ligne : remplacez la ligne par le code donné.
- Un bloc `// ====` 🚧 suivi d’une fonction marquée `⚠️ version provisoire` : remplacez **le bloc et la fonction provisoire** par la vraie fonction. Gardez le commentaire `/** … */` placé au-dessus.
- `{/* 🚧 FT-x — Tâche x.y … */}` dans le JSX : remplacez le commentaire par le JSX donné.

Certaines tâches demandent aussi de compléter un **import** en haut du fichier ; c’est précisé à chaque fois. Une fois votre travail fini, plus aucun 🚧 à votre nom ne doit rester.

## Travailler avec Git

### 1. Une seule fois : votre identité

Vos commits doivent porter **votre** nom. Utilisez l’email de votre compte GitHub :

```bash
git config user.name "Prénom Nom"
git config user.email "votre-email-github@exemple.com"
```

### 2. Créer votre branche

```bash
git switch develop
git pull
git switch -c <votre-branche>      # voir le tableau « Qui fait quoi »
cd frontend && npm install
```

### 3. Pour chaque tâche

1. Remettez le code de la tâche.
2. Vérifiez :

   ```bash
   npm run lint      # aucune erreur
   npm run build     # doit se terminer par « built »
   npm run dev       # testez la page dans le navigateur
   ```

3. Faites **un commit par tâche**, avec le message indiqué :

   ```bash
   git add -A
   git commit -m "feat(ft-1): …"
   ```

### 4. Envoyer votre travail

```bash
git push -u origin <votre-branche>
```

Ouvrez ensuite une Pull Request de votre branche vers `develop`. Les quatre branches touchent toutes `routes.jsx`, mais chacune à un endroit différent : elles se fusionnent sans conflit.

> Le backend doit tourner pour tester (`cd backend && npm run dev`). Comptes et données de démo : voir le README.

---

## FT-1 — Prendre un ticket (`/etablissements/:id/rejoindre`) et Ticket terminé (`/tickets/:id/fin`)

**Profil :** nouveau sur le projet · **Branche :** `feat/ft-1-prendre-un-ticket`

**Le parcours de votre page, de la route aux composants :**

- `routes.jsx` déclare les routes `PATHS.joinQueue` et `PATHS.ticketEnd`
- → `pages/client/JoinQueuePage.jsx` : formulaire (composants `TextField`, `Button`, `InfoNote`), envoi avec `ticketApi.create` (`services/api.js`)
- → `pages/client/TicketEndPage.jsx` : récapitulatif, données chargées par le hook `useTicketTracking`

### Tâche 1.1 — Déclarer les deux pages dans le routeur

**Fichier :** `frontend/src/routes.jsx`

**À quoi ça sert :** Sans route, React Router ne sait pas quelle page afficher pour ces URL : la page « Prendre un ticket » et le récapitulatif de fin sont inaccessibles.

1. En haut du fichier, remplacer le commentaire par les deux imports « lazy » (la page n’est téléchargée que lorsqu’on la visite) :

   ```js
   const JoinQueuePage = lazy(() => import('@/pages/client/JoinQueuePage'))
   const TicketEndPage = lazy(() => import('@/pages/client/TicketEndPage'))
   ```

2. Dans les routes client (`children` de `ClientLayout`), remplacer le commentaire par :

   ```jsx
         { path: PATHS.joinQueue, element: <JoinQueuePage /> },
         { path: PATHS.ticketEnd, element: <TicketEndPage /> },
   ```

**Commit :**

```bash
git commit -am "feat(ft-1): déclarer les routes Prendre un ticket et Ticket terminé"
```

### Tâche 1.2 — Vérifier le formulaire avant l’envoi

**Fichier :** `frontend/src/pages/client/JoinQueuePage.jsx`

**À quoi ça sert :** `validate` reçoit le nom et le téléphone et renvoie un objet d’erreurs (un message par champ). Si l’objet est vide, le formulaire est envoyé.

1. Remplacer le commentaire par l’expression régulière du numéro congolais :

   ```js
   /** 9 chiffres commençant par 0, ex. 06 123 23 23 */
   const PHONE_RE = /^0\d{8}$/
   ```

2. Remplacer le bloc 🚧 **et** la version provisoire de `validate` (garder le commentaire JSDoc au-dessus) par :

   ```js
   const validate = ({ name, phone }) => {
     const errors = {}
     if (name.trim().length < 2) errors.name = 'Indiquez votre nom (2 caractères minimum).'
     if (!PHONE_RE.test(normalizePhone(phone))) errors.phone = 'Numéro invalide. Format attendu : 06 123 23 23.'
     return errors
   }
   ```

**Commit :**

```bash
git commit -am "feat(ft-1): valider le nom et le téléphone du formulaire de ticket"
```

### Tâche 1.3 — Remettre le champ téléphone, formaté pendant la saisie

**Fichier :** `frontend/src/pages/client/JoinQueuePage.jsx`

**À quoi ça sert :** `updatePhone` garde uniquement les chiffres (`normalizePhone`) puis les affiche au format `06 123 23 23` (`formatPhone`) à chaque frappe.

1. Dans les imports, ajouter `formatPhone` :

   Ligne actuelle :

   ```js
   import { formatTicketNumber, normalizePhone } from '@/utils/format'
   ```

   Ligne à mettre :

   ```js
   import { formatPhone, formatTicketNumber, normalizePhone } from '@/utils/format'
   ```

2. Sous la fonction `update`, remplacer le commentaire par :

   ```js
     const updatePhone = (e) => setForm((f) => ({ ...f, phone: formatPhone(normalizePhone(e.target.value)) }))
   ```

3. Sous le champ « Votre nom », remplacer le commentaire JSX par :

   ```jsx
               <TextField
                 label="Votre numéro de téléphone"
                 required
                 icon={ICONS.phone}
                 type="tel"
                 inputMode="tel"
                 placeholder="06 123 23 23"
                 maxLength={12}
                 autoComplete="tel"
                 value={form.phone}
                 onChange={updatePhone}
                 error={errors.phone}
               />
   ```

**Commit :**

```bash
git commit -am "feat(ft-1): ajouter le champ téléphone avec formatage automatique"
```

### Tâche 1.4 — Calculer la durée totale du passage

**Fichier :** `frontend/src/pages/client/TicketEndPage.jsx`

**À quoi ça sert :** `formatDuration` calcule le temps entre la prise du ticket et la fin du passage, et l’affiche « 12 min » ou « 1 h 05 ».

Remplacer le bloc 🚧 et la version provisoire (garder le JSDoc au-dessus) par :

   ```js
   const formatDuration = (from, until) => {
     if (!from || !until) return '—'
     const minutes = Math.max(0, Math.round((new Date(until) - new Date(from)) / 60000))
     if (minutes < 60) return `${minutes} min`
     return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`
   }
   ```

**Commit :**

```bash
git commit -am "feat(ft-1): afficher la durée totale du parcours"
```

### Tâche 1.5 — Bouton « Reprendre un ticket ici »

**Fichier :** `frontend/src/pages/client/TicketEndPage.jsx`

**À quoi ça sert :** Après une annulation, le client peut revenir directement sur la fiche de l’établissement pour reprendre un ticket.

1. Dans les imports, ajouter `to` :

   Ligne actuelle :

   ```js
   import { PATHS } from '@/constants/routes'
   ```

   Ligne à mettre :

   ```js
   import { PATHS, to } from '@/constants/routes'
   ```

2. Sous le bouton « Trouver un autre établissement », remplacer le commentaire JSX par :

   ```jsx
               {cancelled && ticket.establishment?.id && (
                 <Button variant="secondary" size="lg" fullWidth icon={ICONS.ticket} to={to.establishment(ticket.establishment.id)}>
                   Reprendre un ticket ici
                 </Button>
               )}
   ```

**Commit :**

```bash
git commit -am "feat(ft-1): proposer de reprendre un ticket après une annulation"
```

### Tâche 1.6 — Arrêter de suivre le ticket une fois le parcours fini

**Fichier :** `frontend/src/pages/client/TicketEndPage.jsx`

**À quoi ça sert :** Quand le ticket est terminé ou annulé, on l’efface du navigateur : « Mes tickets » n’affiche plus un ticket fini.

1. Tout en haut du fichier, ajouter l’import de `useEffect` (première ligne) :

   ```js
   import { useEffect } from 'react'
   ```

2. Sous l’import de `useTicketTracking`, ajouter :

   ```js
   import { useCurrentTicket } from '@/hooks/useCurrentTicket'
   ```

3. Dans le composant, remplacer le premier commentaire par :

   ```js
     const { ticketId: currentId, clear } = useCurrentTicket()
   ```

4. Remplacer le second commentaire par :

   ```js
     // Le parcours est fini : on libère le « Mon ticket » de la navigation
     useEffect(() => {
       if (ticket && currentId === ticketId) clear()
     }, [ticket, currentId, ticketId, clear])
   ```

**Commit :**

```bash
git commit -am "feat(ft-1): libérer le ticket suivi à la fin du parcours"
```

---

## FT-2 — Mon ticket (`/tickets/:id`) et C’est votre tour (`/tickets/:id/appel`)

**Profil :** nouveau sur le projet · **Branche :** `feat/ft-2-suivi-du-ticket`

**Le parcours de votre page, de la route aux composants :**

- `routes.jsx` déclare les routes `PATHS.ticket` et `PATHS.ticketCalled`
- → `pages/client/TicketPage.jsx` : ticket coloré (`TicketCard`, `TicketNumber`), chiffres (`TicketStats`), frise (`TicketProgress`)
- → la couleur vient de `getTicketAlert` / `getPositionAlert` dans `constants/status.js`
- → `pages/client/TicketCalledPage.jsx` : écran d’appel, alerte via le hook `useCallAlert`

### Tâche 2.1 — Déclarer les deux pages dans le routeur

**Fichier :** `frontend/src/routes.jsx`

**À quoi ça sert :** Ces routes affichent le suivi du ticket. `useTicketTracking` envoie automatiquement le client de l’une à l’autre selon le statut du ticket.

1. En haut du fichier, remplacer le commentaire par :

   ```js
   const TicketPage = lazy(() => import('@/pages/client/TicketPage'))
   const TicketCalledPage = lazy(() => import('@/pages/client/TicketCalledPage'))
   ```

2. Dans les routes client, remplacer le commentaire par :

   ```jsx
         { path: PATHS.ticket, element: <TicketPage /> },
         { path: PATHS.ticketCalled, element: <TicketCalledPage /> },
   ```

**Commit :**

```bash
git commit -am "feat(ft-2): déclarer les routes Mon ticket et C’est votre tour"
```

### Tâche 2.2 — Couleur du ticket selon la position

**Fichier :** `frontend/src/constants/status.js`

**À quoi ça sert :** Règle métier : de la 15e à la 11e place → jaune (`near`), de la 10e à la 6e → orange (`approaching`), de la 5e à la 2e → rouge (`soon`), 1re place → « Vous êtes le prochain » (`next`, rouge aussi). Au-delà de la 15e → couleur normale (`waiting`).

Remplacer le bloc 🚧 et la version provisoire (garder le JSDoc au-dessus) par :

   ```js
   export function getPositionAlert(position) {
     const rank = position ?? Infinity
     if (rank <= 1) return TICKET_ALERTS.next
     if (rank <= SOON_THRESHOLD) return TICKET_ALERTS.soon
     if (rank <= APPROACHING_THRESHOLD) return TICKET_ALERTS.approaching
     if (rank <= NEAR_THRESHOLD) return TICKET_ALERTS.near
     return TICKET_ALERTS.waiting
   }
   ```

**Commit :**

```bash
git commit -am "feat(ft-2): colorer le ticket selon sa position dans la file"
```

### Tâche 2.3 — Carte « Progression » de la page Mon ticket

**Fichier :** `frontend/src/pages/client/TicketPage.jsx`

**À quoi ça sert :** `TicketProgress` affiche la frise des étapes du ticket (créé, en attente, préparez-vous…), l’étape en cours prend la couleur du ticket.

1. Dans les imports, ajouter `TicketProgress` :

   Ligne actuelle :

   ```js
   import { TicketCard, TicketStats } from '@/components/ticket'
   ```

   Ligne à mettre :

   ```js
   import { TicketCard, TicketProgress, TicketStats } from '@/components/ticket'
   ```

2. Au début de la colonne de droite (`styles.sideCol`), remplacer le commentaire JSX par :

   ```jsx
                 <Card className={styles.progressCard}>
                   <h2 className="text-h3">Progression</h2>
                   <TicketProgress ticket={ticket} />
                 </Card>
   ```

**Commit :**

```bash
git commit -am "feat(ft-2): afficher la progression sur la page Mon ticket"
```

### Tâche 2.4 — Alerter le client quand il est appelé

**Fichier :** `frontend/src/pages/client/TicketCalledPage.jsx`

**À quoi ça sert :** Le hook change le titre de l’onglet (« 🔔 C’est votre tour ! ») et fait vibrer le téléphone. À la sortie de la page, l’ancien titre est remis.

1. Tout en haut du fichier, ajouter l’import de `useEffect` (première ligne) :

   ```js
   import { useEffect } from 'react'
   ```

2. Remplacer le bloc 🚧 et la version provisoire (garder le JSDoc au-dessus) par :

   ```js
   function useCallAlert(active) {
     useEffect(() => {
       if (!active) return undefined
       const previous = document.title
       document.title = '🔔 C’est votre tour ! — Ma Place'
       // Le navigateur n'autorise la vibration qu'après une interaction avec la page
       if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.([250, 120, 250])
       return () => {
         document.title = previous
       }
     }, [active])
   }
   ```

**Commit :**

```bash
git commit -am "feat(ft-2): alerter le client quand son ticket est appelé"
```

### Tâche 2.5 — Carte « Progression » de la page C’est votre tour

**Fichier :** `frontend/src/pages/client/TicketCalledPage.jsx`

**À quoi ça sert :** Même frise que sur « Mon ticket » : ici, les étapes « C’est votre tour » et « En cours » sont actives.

1. Sous l’import de `@/components/ui`, ajouter :

   ```js
   import { TicketProgress } from '@/components/ticket'
   ```

2. Après la carte « Au guichet », remplacer le commentaire JSX par :

   ```jsx
               <Card className={styles.block}>
                 <h2 className="text-h3">Progression</h2>
                 <TicketProgress ticket={ticket} />
               </Card>
   ```

**Commit :**

```bash
git commit -am "feat(ft-2): afficher la progression sur la page C’est votre tour"
```

---

## FT-3 — Mes tickets (`/mes-tickets`)

**Profil :** a déjà contribué · **Branche :** `feat/ft-3-mes-tickets`

**Le parcours de votre page, de la route aux composants :**

- `routes.jsx` déclare la route `PATHS.myTickets`
- → `pages/client/MyTicketsPage.jsx` : ticket suivi depuis cet appareil (`useCurrentTicket`), rechargé avec `usePolling` + `ticketApi.get`

### Tâche 3.1 — Déclarer la page dans le routeur

**Fichier :** `frontend/src/routes.jsx`

**À quoi ça sert :** Le lien « Mes tickets » du menu et de la barre basse mène à cette route.

1. En haut du fichier, remplacer le commentaire par :

   ```js
   const MyTicketsPage = lazy(() => import('@/pages/client/MyTicketsPage'))
   ```

2. Dans les routes client, remplacer le commentaire par :

   ```jsx
         { path: PATHS.myTickets, element: <MyTicketsPage /> },
   ```

**Commit :**

```bash
git commit -am "feat(ft-3): déclarer la route Mes tickets"
```

### Tâche 3.2 — Statut, couleur et lien de la carte

**Fichier :** `frontend/src/pages/client/MyTicketsPage.jsx`

**À quoi ça sert :** Ticket terminé ou annulé → récapitulatif ; appelé → page « C’est votre tour » ; en attente → couleur d’alerte et page « Mon ticket ». Une file reportée affiche « Reprise demain ».

1. Dans les imports, ajouter `getTicketAlert` et `PAUSE_REASON` :

   Ligne actuelle :

   ```js
   import { TICKET_STATUS } from '@/constants/status'
   ```

   Ligne à mettre :

   ```js
   import { getTicketAlert, PAUSE_REASON, TICKET_STATUS } from '@/constants/status'
   ```

2. Remplacer le bloc 🚧 et la version provisoire (garder le JSDoc au-dessus) par :

   ```js
   const clientStatus = (ticket) => {
     if (ticket.status === TICKET_STATUS.COMPLETED) return { tone: 'completed', label: 'Terminé', link: to.ticketEnd }
     if (ticket.status === TICKET_STATUS.CANCELLED) return { tone: 'cancelled', label: 'Annulé', link: to.ticketEnd }
     const alert = getTicketAlert(ticket)
     const label = ticket.pauseReason === PAUSE_REASON.NEXT_DAY ? 'Reprise demain' : alert.label
     return { tone: alert.tone, label, link: ticket.status === TICKET_STATUS.SERVING ? to.ticketCalled : to.ticket }
   }
   ```

**Commit :**

```bash
git commit -am "feat(ft-3): afficher le statut et la couleur du ticket suivi"
```

### Tâche 3.3 — « Devant vous » et « Attente estimée »

**Fichier :** `frontend/src/pages/client/MyTicketsPage.jsx`

**À quoi ça sert :** Affichés seulement si le ticket est en attente. L’attente = personnes devant × durée moyenne d’un passage de l’établissement.

1. Sous l’import de `useCurrentTicket`, ajouter :

   ```js
   import { estimateWaitMinutes, formatWait, serviceMinutesOf } from '@/constants/establishments'
   ```

2. Sous `const isWaiting = …`, remplacer le commentaire par :

   ```js
     const serviceMinutes = serviceMinutesOf(ticket?.establishment)
   ```

3. En haut de la liste `<dl className={styles.facts}>`, remplacer le commentaire JSX par :

   ```jsx
                 {isWaiting && (
                   <>
                     <div>
                       <dt>Devant vous</dt>
                       <dd>{ticket.peopleAhead}</dd>
                     </div>
                     <div>
                       <dt>Attente estimée</dt>
                       <dd>{formatWait(estimateWaitMinutes(ticket.peopleAhead, serviceMinutes), serviceMinutes)}</dd>
                     </div>
                   </>
                 )}
   ```

**Commit :**

```bash
git commit -am "feat(ft-3): afficher les personnes devant et l’attente estimée"
```

---

## FT-4 — Favoris (`/favoris`) et Page introuvable (toute URL inconnue)

**Profil :** a déjà contribué · **Branche :** `feat/ft-4-favoris-404`

**Le parcours de votre page, de la route aux composants :**

- `routes.jsx` déclare la route `PATHS.favorites` et la route `*` (404)
- → `pages/client/FavoritesPage.jsx` : favoris de `useFavorites`, cartes `EstablishmentCard`
- → `pages/NotFoundPage.jsx` : page déjà complète, il suffit de la brancher

### Tâche 4.1 — Déclarer la page Favoris dans le routeur

**Fichier :** `frontend/src/routes.jsx`

**À quoi ça sert :** Le cœur des cartes et le lien « Favoris » du menu mènent à cette route. `NotFoundPage` est importée ici aussi, elle sert à la tâche 4.3.

1. En haut du fichier, remplacer le commentaire par :

   ```js
   const FavoritesPage = lazy(() => import('@/pages/client/FavoritesPage'))
   const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
   ```

2. Dans les routes client, remplacer le commentaire par :

   ```jsx
         { path: PATHS.favorites, element: <FavoritesPage /> },
   ```

**Commit :**

```bash
git commit -am "feat(ft-4): déclarer la route Favoris"
```

### Tâche 4.2 — Grille des établissements favoris

**Fichier :** `frontend/src/pages/client/FavoritesPage.jsx`

**À quoi ça sert :** Chaque favori est affiché avec `EstablishmentCard` ; `toggle` permet de le retirer des favoris en touchant le cœur.

1. Sous l’import de `@/components/ui`, ajouter :

   ```js
   import { EstablishmentCard } from '@/components/establishment'
   ```

2. À la fin des imports, remplacer le commentaire par :

   ```js
   import styles from './FavoritesPage.module.css'
   ```

3. Dans le composant, remplacer la ligne `useFavorites` (et son commentaire) par :

   ```js
     const { isFavorite, toggle, favorites } = useFavorites()
   ```

4. Sous le bloc `EmptyState`, remplacer le commentaire JSX par :

   ```jsx
         {items.length > 0 && (
           <div className={styles.grid}>
             {items.map((e) => (
               <EstablishmentCard key={e.id} establishment={e} isFavorite onToggleFavorite={toggle} />
             ))}
           </div>
         )}
   ```

**Commit :**

```bash
git commit -am "feat(ft-4): afficher la grille des établissements favoris"
```

### Tâche 4.3 — Brancher la page 404

**Fichier :** `frontend/src/routes.jsx`

**À quoi ça sert :** Le chemin `*` attrape toutes les URL qui ne correspondent à aucune autre route. Il doit rester la dernière entrée du tableau.

Tout en bas du tableau `createBrowserRouter([...])`, remplacer le commentaire par :

   ```jsx
     { path: '*', element: <NotFoundPage /> },
   ```

**Commit :**

```bash
git commit -am "feat(ft-4): afficher la page 404 pour les URL inconnues"
```

---

## Vérification finale (à faire par le lead après les fusions)

```bash
grep -rn "🚧" frontend/src     # ne doit plus rien afficher
cd frontend && npm run lint && npm run build
```

Puis tester le parcours complet : prendre un ticket → Mon ticket (couleur selon la position) → être appelé depuis le tableau de bord → C’est votre tour → fin du passage → récapitulatif ; vérifier aussi Mes tickets, Favoris et une URL inconnue (page 404).
