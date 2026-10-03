import { Button, Icon, StatusBadge, TicketNumber } from '@/components/ui'
import { formatPhone, formatSince } from '@/utils/format'
import styles from './ServingTicketCard.module.css'

/** Ticket actuellement au guichet (SERVING) + action « Terminer ce ticket ». */
export function ServingTicketCard({ ticket, loading, onComplete }) {
  if (!ticket) {
    return (
      <section className={`${styles.card} ${styles.empty}`}>
        <Icon name="person_pin" size={32} />
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
            <Icon name="phone" size={18} /> {formatPhone(ticket.phone)}
          </p>
        )}
        {(ticket.called_at ?? ticket.updated_at) && (
          <p className={styles.meta}>
            <Icon name="timer" size={18} /> Pris en charge {formatSince(ticket.called_at ?? ticket.updated_at)}
          </p>
        )}
      </div>
      <Button variant="success" size="lg" fullWidth icon="task_alt" loading={loading} onClick={() => onComplete(ticket.id)}>
        Terminer ce ticket
      </Button>
    </section>
  )
}
