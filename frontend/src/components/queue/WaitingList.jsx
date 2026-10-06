import { Button, EmptyState, Icon, TicketNumber, TicketStatusBadge } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { getPositionAlert, TICKET_STATUS } from '@/constants/status'
import { formatPhone, formatTime, plural } from '@/utils/format'
import styles from './WaitingList.module.css'

/** Liste de tickets (tableau sur desktop, cartes sur mobile) avec les actions Annuler / Terminer. */
export function WaitingList({
  tickets,
  pendingId,
  onCancel,
  onComplete,
  title = 'Prochains clients en file',
  countLabel = ['ticket restant', 'tickets restants'],
  emptyTitle = 'File vide',
  emptyText = 'Les nouveaux tickets apparaîtront ici automatiquement.',
  showTime = false,
  id = 'file-attente',
  total,
  footer,
  waiting = [],
}) {
  const positions = new Map(waiting.map((t, index) => [t.id, index + 1]))

  return (
    <section id={id} className={styles.section}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          <Icon name={ICONS.queue} size={20} /> {title}
        </h2>
        <span className={styles.count}>{plural(total ?? tickets.length, ...countLabel)}</span>
      </header>

      {tickets.length === 0 ? (
        <EmptyState icon={ICONS.groups} title={emptyTitle}>
          {emptyText}
        </EmptyState>
      ) : (
        <div className={styles.table} role="table" aria-label={title}>
          <div className={styles.headRow} role="row">
            <span role="columnheader">Ticket</span>
            <span role="columnheader">Client</span>
            <span role="columnheader">Statut</span>
            <span role="columnheader" className={styles.right}>
              Gestion
            </span>
          </div>
          {tickets.map((ticket) => (
            <div key={ticket.id} className={styles.row} role="row">
              <span role="cell">
                <TicketNumber
                  number={ticket.number}
                  size="sm"
                  boxed
                  tone={positions.has(ticket.id) ? getPositionAlert(positions.get(ticket.id)).tone : undefined}
                />
              </span>
              <span role="cell" className={styles.client}>
                <span className={styles.name}>{ticket.name}</span>
                {ticket.phone && (
                  <span className={styles.phone}>
                    <Icon name={ICONS.phone} size={14} /> {formatPhone(ticket.phone)}
                  </span>
                )}
                {showTime && ticket.createdAt && (
                  <span className={styles.phone}>
                    <Icon name={ICONS.schedule} size={14} /> Arrivé à {formatTime(ticket.createdAt)}
                  </span>
                )}
              </span>
              <span role="cell" className={styles.status}>
                <TicketStatusBadge status={ticket.status} />
              </span>
              <span role="cell" className={styles.right}>
                {ticket.status === TICKET_STATUS.WAITING && onCancel && (
                  <Button
                    variant="danger-soft"
                    size="sm"
                    icon={ICONS.close}
                    loading={pendingId === ticket.id}
                    onClick={() => onCancel(ticket.id)}
                  >
                    Annuler
                  </Button>
                )}
                {ticket.status === TICKET_STATUS.SERVING && onComplete && (
                  <Button
                    size="sm"
                    icon={ICONS.taskAlt}
                    loading={pendingId === ticket.id}
                    onClick={() => onComplete(ticket.id)}
                  >
                    Terminer
                  </Button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
      {footer}
    </section>
  )
}
