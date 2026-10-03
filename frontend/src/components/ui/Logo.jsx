import logoUrl from '@/assets/logo.svg'
import styles from './Logo.module.css'

/** Logo Ma Place + titre et sous-titre optionnels (« MON TICKET », « ESPACE ÉTABLISSEMENT »…). */
export function Logo({ size = 40, title = 'Ma Place', subtitle, showText = true }) {
  return (
    <span className={styles.logo}>
      <img src={logoUrl} width={size} height={size} alt={showText ? '' : 'Ma Place'} className={styles.mark} />
      {showText && (
        <span className={styles.text}>
          <span className={styles.title}>{title}</span>
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </span>
      )}
    </span>
  )
}
