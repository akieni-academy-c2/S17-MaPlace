import { Icon } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { getAheadAlert, NEAR_THRESHOLD, TICKET_STATUS } from '@/constants/status'
import { formatTime } from '@/utils/format'
import styles from './TicketProgress.module.css'

const STEPS = [
  { key: 'created', label: 'Ticket créé', text: 'Votre place est réservée.', icon: ICONS.ticketCheck },
  { key: 'waiting', label: 'En attente', text: `Plus de ${NEAR_THRESHOLD} personnes devant vous.`, icon: ICONS.hourglass },
  { key: 'near', label: 'Préparez-vous', text: 'Prévoyez votre trajet vers l’établissement.', icon: ICONS.schedule },
  { key: 'approaching', label: 'Votre tour approche', text: 'Commencez à vous rapprocher de l’établissement.', icon: ICONS.navigation },
  { key: 'soon', label: 'Bientôt votre tour', text: 'Présentez-vous à proximité du guichet.', icon: ICONS.walk },
  { key: 'next', label: 'Vous êtes le prochain', text: 'Personne devant vous : tenez-vous prêt.', icon: ICONS.personPin },
  { key: 'called', label: 'C’est votre tour', text: 'Présentez-vous au guichet.', icon: ICONS.bell },
  { key: 'serving', label: 'En cours', text: 'Vous êtes pris en charge.', icon: ICONS.next },
  { key: 'done', label: 'Terminé', text: 'Merci de votre visite !', icon: ICONS.taskAlt },
]

/** Étapes colorées selon le niveau d'alerte (jaune, orange, rouge, vert). */
const ALERT_STEPS = ['near', 'approaching', 'soon', 'next', 'called']

/**
 * Étapes « en cours » selon le ticket (seuils : constants/status.js). L'API ne distingue pas
 * l'appel de la prise en charge : un ticket SERVING active donc « C'est votre tour » et « En cours ».
 */
function currentSteps(ticket) {
  switch (ticket.status) {
    case TICKET_STATUS.WAITING:
      return [getAheadAlert(ticket.peopleAhead).key]
    case TICKET_STATUS.SERVING:
      return ['called', 'serving']
    case TICKET_STATUS.COMPLETED:
      return [] // toutes les étapes sont franchies
    default:
      return ['waiting']
  }
}

/** Frise verticale du parcours d'un ticket. */
export function TicketProgress({ ticket, className = '' }) {
  const current = currentSteps(ticket)
  const first = current.length ? STEPS.findIndex((step) => step.key === current[0]) : STEPS.length

  return (
    <ol className={`${styles.steps} ${className}`} aria-label="Progression de votre ticket">
      {STEPS.map((step, index) => {
        const state = current.includes(step.key) ? 'current' : index < first ? 'done' : 'upcoming'
        // Couleur d'alerte de l'étape en cours
        const alert = state === 'current' && ALERT_STEPS.includes(step.key) ? styles[step.key] : ''
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
