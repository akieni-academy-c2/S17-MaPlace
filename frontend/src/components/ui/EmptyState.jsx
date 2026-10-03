import { ICONS } from '@/constants/icons'
import { Icon } from './Icon'
import styles from './EmptyState.module.css'

export function EmptyState({ icon = ICONS.searchOff, title, children, action }) {
  return (
    <div className={styles.empty}>
      <span className={styles.iconBox}>
        <Icon name={icon} size={32} />
      </span>
      <p className={styles.title}>{title}</p>
      {children && <p className={styles.text}>{children}</p>}
      {action}
    </div>
  )
}
