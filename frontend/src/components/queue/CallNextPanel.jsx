import { Icon } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { formatTicketNumber } from '@/utils/format'
import styles from './CallNextPanel.module.css'

/** Bloc d'action principal "Appeler le prochain ticket" (POST /api/queue/next). */
export function CallNextPanel({ nextTicket, disabled, loading, onCallNext, hint }) {
  return (
    <section className={styles.panel} aria-labelledby="call-next-title">
      <div className={styles.text}>
        <span className={styles.kicker}>
          <span className={styles.dot} /> Action principale
        </span>
        <h2 id="call-next-title" className={styles.title}>
          Appeler le prochain ticket
        </h2>
        <p className={styles.next}>
          {nextTicket ? (
            <>
              Prochain en attente :{' '}
              <strong className={styles.nextChip}>
                {formatTicketNumber(nextTicket.number)} · {nextTicket.name}
              </strong>
            </>
          ) : (
            'Aucun ticket en attente pour le moment.'
          )}
        </p>
        {hint && <p className={styles.hint}>{hint}</p>}
      </div>
      <button type="button" className={styles.cta} onClick={onCallNext} disabled={disabled || loading || !nextTicket}>
        <Icon name={loading ? ICONS.spinner : ICONS.bell} size={24} className={loading ? styles.spin : ''} />
        <span>Appeler {nextTicket ? formatTicketNumber(nextTicket.number) : 'le suivant'}</span>
        <Icon name={ICONS.forward} size={22} />
      </button>
    </section>
  )
}
