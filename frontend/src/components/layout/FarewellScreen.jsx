import { createPortal } from 'react-dom'
import { Logo } from '@/components/ui'
import styles from './FarewellScreen.module.css'

/** Écran plein « Au revoir » affiché pendant la déconnexion. */
export function FarewellScreen({ name }) {
  return createPortal(
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.content}>
        <span className={styles.logo}>
          <Logo size={96} tone="white" />
        </span>
        <h2 className={styles.title}>Au revoir{name ? ',' : ''}</h2>
        {name && <p className={styles.name}>{name}</p>}
        <p className={styles.text}>À très bientôt sur Ma Place.</p>
        <span className={styles.progress} aria-hidden="true" />
      </div>
    </div>,
    document.body,
  )
}
