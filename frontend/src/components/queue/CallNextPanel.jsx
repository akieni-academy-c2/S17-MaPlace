import { Icon } from '@/components/ui'
import { formatTicketNumber } from '@/utils/format'
import styles from './CallNextPanel.module.css'

/** Bloc d'action principal « Appeler le suivant » (POST /api/queue/next). */
export function CallNextPanel({ nextTicket, disabled, loading, onCallNext }) {
  return (
    <section className={styles.panel}>
      <div className={styles.text}>
        <span className={styles.kicker}>
          <span className={styles.dot} /> Action immédiate
        </span>
        <h2 className={styles.title}>Appeler le suivant</h2>
        <p className={styles.next}>
          {nextTicket ? (
            <>
              Prochain ticket en attente :{' '}
              <strong className={styles.nextChip}>
                {formatTicketNumber(nextTicket.number)} — {nextTicket.name}
              </strong>
            </>
          ) : (
            'Aucun ticket en attente'
          )}
        </p>
      </div>
      <button type="button" className={styles.cta} onClick={onCallNext} disabled={disabled || loading || !nextTicket}>
        <Icon name={loading ? 'progress_activity' : 'notifications_active'} size={28} className={loading ? styles.spin : ''} />
        <span>Faire entrer {nextTicket ? formatTicketNumber(nextTicket.number) : ''}</span>
        <Icon name="arrow_forward" size={24} />
      </button>
    </section>
  )
}
