import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Logo } from '@/components/ui'
import styles from './SplashScreen.module.css'

/** Durée de la barre de progression (ms) et du fondu de sortie. */
const DURATION = 1800
const EXIT_DURATION = 450

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Écran d'ouverture de l'application : logo animé + barre de progression.
 * L'application se charge en arrière-plan pendant l'animation, puis l'écran s'efface en fondu.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState('visible') // visible | leaving | done

  useEffect(() => {
    const duration = reducedMotion() ? 600 : DURATION
    const timers = [
      setTimeout(() => setPhase('leaving'), duration),
      setTimeout(() => setPhase('done'), duration + EXIT_DURATION),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  if (phase === 'done') return null

  return createPortal(
    <div
      className={`${styles.overlay} ${phase === 'leaving' ? styles.leaving : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Chargement de Ma Place"
      style={{ '--splash-duration': `${DURATION}ms`, '--splash-exit': `${EXIT_DURATION}ms` }}
    >
      <span className={styles.glow} aria-hidden="true" />
      <div className={styles.content}>
        <span className={styles.logo}>
          <span className={styles.ring} aria-hidden="true" />
          <span className={`${styles.ring} ${styles.ringLate}`} aria-hidden="true" />
          <Logo size={88} tone="white" />
        </span>
        <p className={styles.tagline}>Votre place, sans attendre debout.</p>
        <span className={styles.progress} aria-hidden="true">
          <span className={styles.bar} />
        </span>
      </div>
    </div>,
    document.body,
  )
}
