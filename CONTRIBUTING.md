# Contribuer à Ma Place

Ce guide fixe la façon de travailler à plusieurs sur le dépôt. **La structure du frontend est figée** : chacun ajoute son travail dans les fichiers qui lui sont confiés, en réutilisant les composants, hooks et services existants.

## 1. Branches

```
main        ← production, uniquement via PR depuis develop
develop     ← intégration : toutes les PR de fonctionnalité arrivent ici
feat/<prenom>-<sujet>   ← une branche par tâche, créée depuis develop
fix/<prenom>-<sujet>    ← correction de bug
```

- Ne jamais travailler directement sur `main` ni sur `develop`.
- Une tâche = une branche = une PR. Pas de branche partagée entre plusieurs personnes.
- Avant d'ouvrir la PR, se remettre à jour : `git pull --rebase origin develop`.

```bash
git switch develop && git pull
git switch -c feat/djenna-recherche-file
# … travail …
git push -u origin feat/djenna-recherche-file   # puis ouvrir la PR vers develop
```

## 2. Pull requests

- Cible : `develop`. Relecture obligatoire par le lead dev (Giovani) ; fusion par l'admin du dépôt (Gerland).
- Avant d'ouvrir la PR, dans `frontend/` : `npm run lint` et `npm run build` doivent passer.
- Vérifier le rendu à 390, 768, 1024 et 1440 px (mobile d'abord).
- Décrire ce qui change et joindre une capture d'écran pour toute modification visuelle.
- Messages de commit en français, préfixés : `feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`.

## 3. Ce qu'on ne modifie pas sans l'accord du lead dev

| Zone | Pourquoi |
| --- | --- |
| `frontend/src/components/ui/` | Design system partagé par toutes les pages |
| `frontend/src/components/layout/` | En-têtes, navigation, gabarits client / pro |
| `frontend/src/constants/` | Routes, statuts, registre d'icônes |
| `frontend/src/services/` | Seul point d'accès à l'API |
| `frontend/src/hooks/`, `frontend/src/context/` | Logique partagée (polling, auth, file, ticket) |
| `frontend/src/routes.jsx`, `frontend/src/styles/tokens.css` | Routage et jetons de design |
| `backend/` | Schéma et logique métier établis |

Besoin d'un nouveau composant, d'une icône, d'une route ou d'un champ d'API ? Ouvrir une issue ou demander au lead : il l'ajoute au socle, puis vous l'utilisez.

## 4. Règles de code frontend

- **Composants** : réutiliser `Button`, `Card`, `InfoNote`, `StatusBadge`, `ConfirmDialog`, `TextField`, `EmptyState`… depuis `@/components/ui`.
- **Icônes** : toujours via le registre, `<Icon name={ICONS.ticket} />` (Lucide). Pas d'import direct de `lucide-react` dans les pages.
- **Styles** : un CSS Module à côté de la page (`MaPage.module.css`), uniquement avec les variables de `tokens.css` (`var(--color-…)`, `var(--space-…)`). Pas de couleur en dur, pas de style inline.
- **API** : uniquement via `@/services/*`. Jamais de `fetch` dans un composant.
- **Données** : passer par les hooks existants (`usePolling`, `useTicketTracking`, `useQueueManager`, `useAuth`, `useCurrentTicket`).
- **Navigation** : chemins via `PATHS` / `to.*` de `@/constants/routes`, jamais d'URL écrite à la main.
- **Formats** : `formatPhone`, `formatTicketNumber`, `formatTime`, `plural` de `@/utils/format`. Téléphone affiché en `06 123 23 23`.
- **Responsive** : mobile-first ; les points de rupture du projet sont 768 px et 1024 px.
- **Textes** : en français, avec apostrophes échappées dans le JSX (`&apos;`).
