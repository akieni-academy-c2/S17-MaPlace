import { ICONS } from '@/constants/icons'
import { Icon } from './Icon'
import styles from './InfoNote.module.css'

/** Encadré d'information (confidentialité, aide, mise à jour en direct…). tone : info | plain | warning | error | success */
export function InfoNote({ icon = ICONS.info, title, tone = 'info', children, className = '' }) {
  return (
    <div className={`${styles.note} ${styles[tone]} ${className}`} role={tone === 'error' ? 'alert' : undefined}>
      <Icon name={icon} size={22} className={styles.icon} />
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        <div className={styles.text}>{children}</div>
      </div>
    </div>
  )
}
