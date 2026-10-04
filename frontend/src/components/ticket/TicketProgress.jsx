import { Icon } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { APPROACHING_THRESHOLD, SOON_THRESHOLD, TICKET_STATUS } from '@/constants/status'
import { formatTime } from '@/utils/format'
import styles from './TicketProgress.module.css'

const STEPS = [
  { key: 'created', label: 'Ticket créé', text: 'Votre place est réservée.', icon: ICONS.ticketCheck },
  { key: 'waiting', label: 'En attente', text: `Plus de ${APPROACHING_THRESHOLD} personnes devant vous.`, icon: ICONS.hourglass },
  { key: 'approaching', label: 'Votre tour approche', text: 'Commencez à vous rapprocher de l’établissement.', icon: ICONS.navigation },
  { key: 'soon', label: 'Bientôt votre tour', text: 'Présentez-vous à proximité du guichet.', icon: ICONS.walk },
  { key: 'called', label: 'C’est votre tour', text: 'Présentez-vous au guichet.', icon: ICONS.bell },
  { key: 'serving', label: 'En cours', text: 'Vous êtes pris en charge.', icon: ICONS.next },
  { key: 'done', label: 'Terminé', text: 'Merci de votre visite !', icon: ICONS.taskAlt },
]

/**
 * Étapes « en cours » selon le ticket (seuils : constants/status.js). L'API ne distingue pas
 * l'appel de la prise en charge : un ticket SERVING active donc « C'est votre tour » et « En cours ».
 */
function currentSteps(ticket) {
  switch (ticket.status) {
    case TICKET_STATUS.WAITING:
      if (ticket.peopleAhead <= SOON_THRESHOLD) return [3]
      return ticket.peopleAhead <= APPROACHING_THRESHOLD ? [2] : [1]
    case TICKET_STATUS.SERVING:
      return [4, 5]
    case TICKET_STATUS.COMPLETED:
      return [7]
    default:
      return [1]
  }
}

/** Frise verticale du parcours d'un ticket. */
export function TicketProgress({ ticket, className = '' }) {
  const current = currentSteps(ticket)
  const first = current[0]

  return (
    <ol className={`${styles.steps} ${className}`} aria-label="Progression de votre ticket">
      {STEPS.map((step, index) => {
        const state = current.includes(index) ? 'current' : index < first ? 'done' : 'upcoming'
        // Couleur d'alerte de l'étape en cours (orange pâle, orange)
        const alert = state === 'current' && ['approaching', 'soon', 'called'].includes(step.key) ? styles[step.key] : ''
        return (
          <li key={step.key} className={`${styles.step} ${styles[state]} ${alert}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className={styles.marker}>
              <Icon name={state === 'done' ? ICONS.check : step.icon} size={16} weight={state === 'done' ? 600 : 400} />
            </span>
            <div className={styles.text}>
              <span className={styles.label}>
                {step.label}
                {step.key === 'created' && ticket.createdAt && <span className={styles.time}>{formatTime(ticket.createdAt)}</span>}
                {state === 'current' && step.key !== 'serving' && <span className={styles.now}>Maintenant</span>}
              </span>
              {state === 'current' && <span className={styles.description}>{step.text}</span>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
