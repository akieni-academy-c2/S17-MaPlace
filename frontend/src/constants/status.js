/** Statuts d'une file, identiques à ceux de l'API. */
export const QUEUE_STATUS = Object.freeze({
  OPEN: 'OPEN',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
})

/** Motif d'une pause : NEXT_DAY = file reportée au lendemain. */
export const PAUSE_REASON = Object.freeze({
  NEXT_DAY: 'NEXT_DAY',
})

/** À partir de ce nombre de clients en attente, la fin de journée propose le report plutôt que la fermeture. */
export const POSTPONE_THRESHOLD = 5

export const TICKET_STATUS = Object.freeze({
  WAITING: 'WAITING',
  SERVING: 'SERVING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
})

/** Libellés et couleur (tone de <StatusBadge>) de chaque statut de file. */
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

/** File en pause jusqu'au lendemain (PAUSED + NEXT_DAY). */
export const NEXT_DAY_META = {
  label: 'Reprise demain',
  short: 'Reprise demain',
  tone: 'paused',
  description:
    'L’établissement a fermé pour aujourd’hui. Les clients déjà en attente conservent leur numéro : la file reprendra demain là où elle s’est arrêtée.',
}

/** Libellés d'une file, en tenant compte du report au lendemain. */
export function getQueueStatusMeta(status, pauseReason) {
  if (status === QUEUE_STATUS.PAUSED && pauseReason === PAUSE_REASON.NEXT_DAY) return NEXT_DAY_META
  return QUEUE_STATUS_META[status] ?? QUEUE_STATUS_META.CLOSED
}

/** Libellés et couleur de chaque statut de ticket, côté établissement. */
export const TICKET_STATUS_META = {
  WAITING: { label: 'En attente', tone: 'waiting' },
  SERVING: { label: 'En cours', tone: 'serving' },
  COMPLETED: { label: 'Terminé', tone: 'completed' },
  CANCELLED: { label: 'Annulé', tone: 'cancelled' },
}

/** Alertes selon la position : jaune 15 à 11, orange 10 à 6, rouge 5 à 1, vert quand appelé. */
export const NEAR_THRESHOLD = 15
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
  near: {
    key: 'near',
    tone: 'near',
    label: 'Préparez-vous',
    title: 'Préparez-vous',
    text: `Vous êtes entre la ${APPROACHING_THRESHOLD + 1}e et la ${NEAR_THRESHOLD}e place : prévoyez votre trajet vers l’établissement.`,
  },
  approaching: {
    key: 'approaching',
    tone: 'approaching',
    label: 'Votre tour approche',
    title: 'Votre tour approche',
    text: `Vous êtes entre la ${SOON_THRESHOLD + 1}e et la ${APPROACHING_THRESHOLD}e place : commencez à vous rapprocher de l’établissement.`,
  },
  soon: {
    key: 'soon',
    tone: 'soon',
    label: 'Bientôt votre tour',
    title: 'Bientôt votre tour !',
    text: `Vous êtes dans les ${SOON_THRESHOLD} prochains : présentez-vous à proximité du guichet.`,
  },
  next: {
    key: 'next',
    tone: 'soon',
    label: 'Vous êtes le prochain',
    title: 'Vous êtes le prochain !',
    text: 'Personne devant vous : tenez-vous prêt, vous serez appelé au guichet dans un instant.',
  },
  called: {
    key: 'called',
    tone: 'called',
    label: 'C’est votre tour',
    title: 'C’est votre tour !',
    text: 'Présentez-vous au guichet.',
  },
}

/** Alerte d'un ticket en attente selon sa position dans la file (1 = prochain). */
export function getPositionAlert(position) {
  const rank = position ?? Infinity
  if (rank <= 1) return TICKET_ALERTS.next
  if (rank <= SOON_THRESHOLD) return TICKET_ALERTS.soon
  if (rank <= APPROACHING_THRESHOLD) return TICKET_ALERTS.approaching
  if (rank <= NEAR_THRESHOLD) return TICKET_ALERTS.near
  return TICKET_ALERTS.waiting
}

/** Alerte correspondant à un ticket (WAITING ou SERVING). Position = personnes devant + 1. */
export function getTicketAlert(ticket) {
  if (ticket?.status === TICKET_STATUS.SERVING) return TICKET_ALERTS.called
  const position = ticket?.position ?? (ticket?.peopleAhead != null ? ticket.peopleAhead + 1 : null)
  return getPositionAlert(position)
}
