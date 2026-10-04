import { ICONS } from '@/constants/icons'
import { Icon } from './Icon'
import styles from './EmptyState.module.css'

export function EmptyState({ icon = ICONS.searchOff, title, children, action, className = '' }) {
  return (
    <div className={`${styles.empty} ${className}`}>
      <span className={styles.iconBox}>
        <Icon name={icon} size={28} />
      </span>
      <p className={styles.title}>{title}</p>
      {children && <p className={styles.text}>{children}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
