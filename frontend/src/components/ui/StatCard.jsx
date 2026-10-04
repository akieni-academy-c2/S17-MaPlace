import { Icon } from './Icon'
import styles from './StatCard.module.css'

/**
 * Indicateur chiffré (KPI).
 * tone : neutral | primary (fond vert) | accent (orange) | success
 */
export function StatCard({ label, value, caption, icon, tone = 'neutral', compact = false, className = '' }) {
  return (
    <div className={`${styles.stat} ${styles[tone]} ${compact ? styles.compact : ''} ${className}`}>
      <div className={styles.body}>
        <span className={styles.label}>{label}</span>
        <span className={`${styles.value} tabular`}>{value}</span>
        {caption && <span className={styles.caption}>{caption}</span>}
      </div>
      {icon && (
        <span className={styles.iconBox}>
          <Icon name={icon} size={compact ? 18 : 22} />
        </span>
      )}
    </div>
  )
}
