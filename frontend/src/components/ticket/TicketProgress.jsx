import { Icon } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { SOON_THRESHOLD, TICKET_STATUS } from '@/constants/status'
import { formatTime } from '@/utils/format'
import styles from './TicketProgress.module.css'

const STEPS = [
  { key: 'created', label: 'Ticket créé', text: 'Votre place est réservée.', icon: ICONS.ticketCheck },
  { key: 'waiting', label: 'En attente', text: 'Votre position avance automatiquement.', icon: ICONS.hourglass },
  { key: 'soon', label: 'Bientôt votre tour', text: 'Rapprochez-vous de l’établissement.', icon: ICONS.walk },
  { key: 'called', label: 'C’est votre tour', text: 'Présentez-vous au guichet.', icon: ICONS.bell },
  { key: 'serving', label: 'En cours', text: 'Vous êtes pris en charge.', icon: ICONS.next },
  { key: 'done', label: 'Terminé', text: 'Merci de votre visite !', icon: ICONS.taskAlt },
]

/**
 * Étapes « en cours » selon le ticket. L'API ne distingue pas l'appel de la prise en charge :
 * un ticket SERVING active donc « C'est votre tour » et « En cours ».
 */
function currentSteps(ticket) {
  switch (ticket.status) {
    case TICKET_STATUS.WAITING:
      return ticket.peopleAhead > SOON_THRESHOLD ? [1] : [2]
    case TICKET_STATUS.SERVING:
      return [3, 4]
    case TICKET_STATUS.COMPLETED:
      return [6]
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
        const isCalled = state === 'current' && step.key === 'called'
        return (
          <li key={step.key} className={`${styles.step} ${styles[state]} ${isCalled ? styles.called : ''}`} aria-current={state === 'current' ? 'step' : undefined}>
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
