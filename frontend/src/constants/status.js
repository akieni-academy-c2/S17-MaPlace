/** Statuts renvoyés par l'API (cf. doc backend §2 et §11). */
export const QUEUE_STATUS = Object.freeze({
  OPEN: 'OPEN',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
})

/** Motif d'une pause (queues.pause_reason) : NEXT_DAY = file reportée au lendemain. */
export const PAUSE_REASON = Object.freeze({
  NEXT_DAY: 'NEXT_DAY',
})

/**
 * Seuil à partir duquel le report au lendemain est recommandé au lieu de la fermeture
 * (nombre de tickets encore en attente en fin de journée).
 */
export const POSTPONE_THRESHOLD = 5

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

/** File en pause jusqu'au lendemain (PAUSED + NEXT_DAY). */
export const NEXT_DAY_META = {
  label: 'Reprise demain',
  short: 'Reprise demain',
  tone: 'paused',
  description:
    'L’établissement a fermé pour aujourd’hui. Les clients déjà en attente conservent leur numéro : la file reprendra demain là où elle s’est arrêtée.',
}

/** Métadonnées d'affichage d'une file, en tenant compte du report au lendemain. */
export function getQueueStatusMeta(status, pauseReason) {
  if (status === QUEUE_STATUS.PAUSED && pauseReason === PAUSE_REASON.NEXT_DAY) return NEXT_DAY_META
  return QUEUE_STATUS_META[status] ?? QUEUE_STATUS_META.CLOSED
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
 *   > 15     waiting      brand   « En attente »
 *   15 – 11  near         jaune   « Préparez-vous »
 *   10 – 6   approaching  orange  « Votre tour approche »
 *   5 – 1    soon         rouge   « Bientôt votre tour »
 *   0        next         vert    « Vous êtes le prochain »
 * Un ticket SERVING passe à l'écran vert « C'est votre tour ! ».
 */
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
    text: `Moins de ${NEAR_THRESHOLD + 1} personnes devant vous : prévoyez votre trajet vers l’établissement.`,
  },
  approaching: {
    key: 'approaching',
    tone: 'approaching',
    label: 'Votre tour approche',
    title: 'Votre tour approche',
    text: `${APPROACHING_THRESHOLD} personnes ou moins devant vous : commencez à vous rapprocher de l’établissement.`,
  },
  soon: {
    key: 'soon',
    tone: 'soon',
    label: 'Bientôt votre tour',
    title: 'Bientôt votre tour !',
    text: 'Plus que quelques personnes : présentez-vous à proximité du guichet.',
  },
  next: {
    key: 'next',
    tone: 'next',
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

/** Alerte d'un ticket en attente selon le nombre de personnes devant lui. */
export function getAheadAlert(peopleAhead) {
  const ahead = peopleAhead ?? Infinity
  if (ahead <= 0) return TICKET_ALERTS.next
  if (ahead <= SOON_THRESHOLD) return TICKET_ALERTS.soon
  if (ahead <= APPROACHING_THRESHOLD) return TICKET_ALERTS.approaching
  if (ahead <= NEAR_THRESHOLD) return TICKET_ALERTS.near
  return TICKET_ALERTS.waiting
}

/** Alerte correspondant à un ticket (WAITING ou SERVING). */
export function getTicketAlert(ticket) {
  if (ticket?.status === TICKET_STATUS.SERVING) return TICKET_ALERTS.called
  return getAheadAlert(ticket?.peopleAhead)
}
