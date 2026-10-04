import { Icon } from './Icon'
import styles from './StatusBadge.module.css'

/**
 * Pastille de statut.
 * tone : open | paused | closed (file) · approaching (ticket à 6–10 personnes)
 *        waiting | soon | called | serving | completed | cancelled (ticket)
 *        brand | accent | neutral
 * size : sm | md
 */
export function StatusBadge({ tone = 'neutral', icon, dot = false, pulse = false, size = 'md', children, className = '' }) {
  return (
    <span className={`${styles.badge} ${styles[tone]} ${styles[size]} ${className}`}>
      {dot && <span className={`${styles.dot} ${pulse ? styles.pulse : ''}`} />}
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} />}
      {children}
    </span>
  )
}
