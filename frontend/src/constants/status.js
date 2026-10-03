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
  OPEN: { label: 'File ouverte', tone: 'open' },
  PAUSED: { label: 'File en pause', tone: 'paused' },
  CLOSED: { label: 'File fermée', tone: 'closed' },
}

export const TICKET_STATUS_META = {
  WAITING: { label: 'En attente', tone: 'waiting' },
  SERVING: { label: 'En cours', tone: 'open' },
  COMPLETED: { label: 'Terminé', tone: 'closed' },
  CANCELLED: { label: 'Annulé', tone: 'cancelled' },
}
