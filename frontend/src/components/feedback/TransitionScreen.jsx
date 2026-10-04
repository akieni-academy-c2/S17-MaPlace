import { createPortal } from 'react-dom'
import { Icon, Logo } from '@/components/ui'
import styles from './TransitionScreen.module.css'

/**
 * Écran plein de transition affiché après une action (connexion, déconnexion, prise de ticket…).
 * - icon      : icône Lucide dans une pastille ; sans icône, le logo Ma Place est animé
 * - title     : message principal (« Au revoir », « Ticket confirmé ! »)
 * - name      : ligne secondaire (nom de l'établissement…)
 * - highlight : grande valeur mise en avant (numéro de ticket)
 * - text      : phrase d'accompagnement
 * - tone      : brand | accent (pastille orange)
 * Animations : CSS pur (@keyframes), rendu dans <body> via un portail React.
 */
export function TransitionScreen({ icon, title, name, highlight, text, tone = 'brand', duration, leaving }) {
  return createPortal(
    <div
      className={`${styles.overlay} ${styles[tone] ?? ''} ${leaving ? styles.leaving : ''}`}
      role="status"
      aria-live="polite"
      style={{ '--transition-duration': `${duration - 100}ms` }}
    >
      <div className={styles.content}>
        {icon ? (
          <span className={styles.iconBadge}>
            <Icon name={icon} size={40} weight={600} />
          </span>
        ) : (
          <span className={styles.logo}>
            <Logo size={96} tone="white" />
          </span>
        )}
        <h2 className={styles.title}>{title}</h2>
        {highlight && <p className={styles.highlight}>{highlight}</p>}
        {name && <p className={styles.name}>{name}</p>}
        {text && <p className={styles.text}>{text}</p>}
        <span className={styles.progress} aria-hidden="true" />
      </div>
    </div>,
    document.body,
  )
}
