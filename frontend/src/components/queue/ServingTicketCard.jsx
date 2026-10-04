import { Button, Icon, StatusBadge, TicketNumber } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { formatPhone, formatSince } from '@/utils/format'
import styles from './ServingTicketCard.module.css'

/** Ticket actuellement au guichet (SERVING) + action « Terminer ce ticket ». */
export function ServingTicketCard({ ticket, loading, onComplete }) {
  if (!ticket) {
    return (
      <section className={`${styles.card} ${styles.empty}`}>
        <span className={styles.emptyIcon}>
          <Icon name={ICONS.personPin} size={26} />
        </span>
        <p className={styles.emptyTitle}>Guichet libre</p>
        <p className="text-small text-muted">Appelez le prochain ticket pour accueillir un client.</p>
      </section>
    )
  }

  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <span className="text-eyebrow">Ticket appelé</span>
        <StatusBadge tone="serving" dot pulse>
          En cours
        </StatusBadge>
      </div>
      <TicketNumber number={ticket.number} size="xl" />
      <div className={styles.client}>
        <p className={styles.name}>{ticket.name}</p>
        {ticket.phone && (
          <a href={`tel:${ticket.phone}`} className={styles.meta}>
            <Icon name={ICONS.phone} size={16} /> {formatPhone(ticket.phone)}
          </a>
        )}
        {ticket.updatedAt && (
          <p className={styles.meta}>
            <Icon name={ICONS.timer} size={16} /> Pris en charge {formatSince(ticket.updatedAt)}
          </p>
        )}
      </div>
      <Button size="lg" fullWidth icon={ICONS.taskAlt} loading={loading} onClick={() => onComplete(ticket.id)}>
        Terminer ce ticket
      </Button>
    </section>
  )
}
