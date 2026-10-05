import { formatTicketNumber } from '@/utils/format'
import styles from './TicketNumber.module.css'

/** Numéro de ticket en display-ticket (« #3 »). size : sm | md | lg | xl. tone : primary | accent | ink | inverse
 * ou niveau d'alerte (constants/status.js) : waiting | near | approaching | soon | next | called */
export function TicketNumber({ number, size = 'lg', tone = 'primary', boxed = false, className = '' }) {
  return (
    <span className={`${styles.number} ${styles[size]} ${styles[tone]} ${boxed ? styles.boxed : ''} ${className}`}>
      {formatTicketNumber(number)}
    </span>
  )
}
