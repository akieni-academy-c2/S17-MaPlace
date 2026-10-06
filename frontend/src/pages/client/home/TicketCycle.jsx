import { Icon } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import styles from './TicketCycle.module.css'

/** Bandeau illustrant l'évolution d'un ticket ("Le cycle de votre ticket"). */
export function TicketCycle() {
  return (
    <section className="container" aria-labelledby="cycle-titre">
      <div className={styles.band}>
        <div className={styles.intro}>
          <h2 id="cycle-titre" className="text-h3">
            Le cycle de votre ticket
          </h2>
          <p className="text-muted">Suivez l’évolution de votre ticket en temps réel, jusqu’à votre passage au guichet.</p>
        </div>
        <div className={styles.flow} aria-hidden="true">
          <div className={styles.card}>
            <strong className={styles.number}>#3</strong>
            <span className="text-small text-muted">2 personnes devant vous</span>
            <span className={styles.badge}>
              <span /> En attente
            </span>
            <span className={styles.bar}>
              <span />
            </span>
          </div>
          <Icon name={ICONS.forward} size={24} className={styles.arrow} />
          <div className={`${styles.card} ${styles.turn}`}>
            <span className={styles.check}>
              <Icon name={ICONS.check} size={22} weight={600} />
            </span>
            <span>
              <strong>C’est votre tour !</strong>
              <small>Rendez-vous au guichet</small>
            </span>
            <Icon name={ICONS.sparkles} size={22} className={styles.sparkles} />
          </div>
        </div>
      </div>
    </section>
  )
}
