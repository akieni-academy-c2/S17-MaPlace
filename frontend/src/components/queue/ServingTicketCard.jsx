import { Button, Icon, StatusBadge, TicketNumber } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { formatPhone, formatSince } from '@/utils/format'
import styles from './ServingTicketCard.module.css'

/** Ticket actuellement au guichet (SERVING) + action « Terminer ce ticket ». */
export function ServingTicketCard({ ticket, loading, onComplete }) {
  if (!ticket) {
    return (
      <section className={`${styles.card} ${styles.empty}`}>
        <Icon name={ICONS.personPin} size={32} />
        <p>Aucun client au guichet pour le moment.</p>
      </section>
    )
  }

  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <span className="text-overline">Ticket actuellement appelé</span>
        <StatusBadge tone="open" dot pulse>
          En cours
        </StatusBadge>
      </div>
      <TicketNumber number={ticket.number} size="xl" />
      <div className={styles.client}>
        <p className={styles.name}>{ticket.name}</p>
        {ticket.phone && (
          <p className={styles.meta}>
            <Icon name={ICONS.phone} size={18} /> {formatPhone(ticket.phone)}
          </p>
        )}
        {ticket.updatedAt && (
          <p className={styles.meta}>
            <Icon name={ICONS.timer} size={18} /> Pris en charge {formatSince(ticket.updatedAt)}
          </p>
        )}
      </div>
      <Button variant="success" size="lg" fullWidth icon={ICONS.taskAlt} loading={loading} onClick={() => onComplete(ticket.id)}>
        Terminer ce ticket
      </Button>
    </section>
  )
}
