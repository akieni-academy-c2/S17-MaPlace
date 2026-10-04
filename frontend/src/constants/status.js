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

/**
 * Alertes de progression d'un ticket en attente, selon le nombre de personnes devant :
 *   > 10    normal       « En attente »
 *   10 – 6  approaching  « Votre tour approche »
 *   5 – 0   soon         « Bientôt votre tour »
 * Un ticket SERVING passe à l'écran vert « C'est votre tour ! ».
 */
export const APPROACHING_THRESHOLD = 10
export const SOON_THRESHOLD = 5

export const TICKET_ALERTS = {
  waiting: {
    key: 'waiting',
    tone: 'waiting',
    label: 'En attente',
    title: 'Votre ticket est enregistré',
    text: 'Gardez l’esprit tranquille, nous suivons la file pour vous.',
  },
  approaching: {
    key: 'approaching',
    tone: 'approaching',
    label: 'Votre tour approche',
    title: 'Votre tour approche',
    text: 'Moins de 10 personnes devant vous : commencez à vous rapprocher de l’établissement.',
  },
  soon: {
    key: 'soon',
    tone: 'soon',
    label: 'Bientôt votre tour',
    title: 'Bientôt votre tour !',
    text: 'Plus que quelques personnes : présentez-vous à proximité du guichet.',
  },
  called: {
    key: 'called',
    tone: 'called',
    label: 'C’est votre tour',
    title: 'C’est votre tour !',
    text: 'Présentez-vous au guichet.',
  },
}

/** Alerte correspondant à un ticket (WAITING ou SERVING). */
export function getTicketAlert(ticket) {
  if (ticket?.status === TICKET_STATUS.SERVING) return TICKET_ALERTS.called
  const ahead = ticket?.peopleAhead ?? Infinity
  if (ahead <= SOON_THRESHOLD) return TICKET_ALERTS.soon
  if (ahead <= APPROACHING_THRESHOLD) return TICKET_ALERTS.approaching
  return TICKET_ALERTS.waiting
}
