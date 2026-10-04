/** Statuts renvoyés par l'API (cf. doc backend §2 et §11). */
export const QUEUE_STATUS = Object.freeze({
  OPEN: 'OPEN',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
})

export const TICKET_STATUS = Object.freeze({
  WAITING: 'WAITING',
  SERVING: 'SERVING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
})

/** Libellés + variante visuelle du composant <StatusBadge>. */
export const QUEUE_STATUS_META = {
  OPEN: {
    label: 'File ouverte',
    short: 'Ouverte',
    tone: 'open',
    description: 'La file accepte de nouveaux tickets.',
  },
  PAUSED: {
    label: 'File en pause',
    short: 'En pause',
    tone: 'paused',
    description: 'Les nouveaux tickets sont temporairement suspendus. Les tickets existants sont conservés.',
  },
  CLOSED: {
    label: 'File fermée',
    short: 'Fermée',
    tone: 'closed',
    description: "La file est terminée pour aujourd'hui. Revenez à la prochaine ouverture.",
  },
}

/**
 * Statuts de ticket côté gestionnaire. « Appelé » (tone `called`) est l'affichage
 * client d'un ticket SERVING : l'API ne distingue pas l'appel de la prise en charge.
 */
export const TICKET_STATUS_META = {
  WAITING: { label: 'En attente', tone: 'waiting' },
  SERVING: { label: 'En cours', tone: 'serving' },
  COMPLETED: { label: 'Terminé', tone: 'completed' },
  CANCELLED: { label: 'Annulé', tone: 'cancelled' },
}

/** En dessous de ce nombre de personnes devant soi, on affiche « Bientôt votre tour ». */
export const SOON_THRESHOLD = 2
