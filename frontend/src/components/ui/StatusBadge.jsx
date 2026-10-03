import { Icon } from './Icon'
import styles from './StatusBadge.module.css'

/**
 * Pastille de statut (pill, label-badge uppercase).
 * tone : open | paused | closed | cancelled | waiting | primary | brand
 */
export function StatusBadge({ tone = 'waiting', icon, dot = false, pulse = false, children, className = '' }) {
  return (
    <span className={`${styles.badge} ${styles[tone]} ${className}`}>
      {dot && <span className={`${styles.dot} ${pulse ? styles.pulse : ''}`} />}
      {icon && <Icon name={icon} size={16} />}
      {children}
    </span>
  )
}
