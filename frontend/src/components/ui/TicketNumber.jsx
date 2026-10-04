import { formatTicketNumber } from '@/utils/format'
import styles from './TicketNumber.module.css'

/** Numéro de ticket en display-ticket (« #3 »). size : sm | md | lg | xl. tone : primary | accent | ink | inverse */
export function TicketNumber({ number, size = 'lg', tone = 'primary', boxed = false, className = '' }) {
  return (
    <span className={`${styles.number} ${styles[size]} ${styles[tone]} ${boxed ? styles.boxed : ''} ${className}`}>
      {formatTicketNumber(number)}
    </span>
  )
}
