import { Icon } from './Icon'
import styles from './StatusBadge.module.css'

/** Pastille de statut (file, ticket ou neutre). size : sm | md. */
export function StatusBadge({ tone = 'neutral', icon, dot = false, pulse = false, size = 'md', children, className = '' }) {
  return (
    <span className={`${styles.badge} ${styles[tone]} ${styles[size]} ${className}`}>
      {dot && <span className={`${styles.dot} ${pulse ? styles.pulse : ''}`} />}
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} />}
      {children}
    </span>
  )
}
