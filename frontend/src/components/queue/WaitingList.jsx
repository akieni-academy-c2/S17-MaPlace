import { Button, EmptyState, Icon, TicketNumber, TicketStatusBadge } from '@/components/ui'
import { formatPhone, plural } from '@/utils/format'
import styles from './WaitingList.module.css'

/** Liste des tickets WAITING (tableau en desktop, cartes en mobile) avec action « Annuler ». */
export function WaitingList({ tickets, cancellingId, onCancel }) {
  return (
    <section id="file-attente" className={styles.section}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          <Icon name="format_list_numbered" /> Prochains clients en file
        </h2>
        <span className={styles.count}>{plural(tickets.length, 'ticket restant', 'tickets restants')}</span>
      </header>

      {tickets.length === 0 ? (
        <EmptyState icon="groups" title="File vide">
          Les nouveaux tickets apparaîtront ici automatiquement.
        </EmptyState>
      ) : (
        <div className={styles.table} role="table" aria-label="Tickets en attente">
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
                <TicketNumber number={ticket.number} size="md" boxed />
              </span>
              <span role="cell" className={styles.client}>
                <span className={styles.name}>{ticket.name}</span>
                {ticket.phone && (
                  <span className={styles.phone}>
                    <Icon name="phone" size={16} /> {formatPhone(ticket.phone)}
                  </span>
                )}
              </span>
              <span role="cell" className={styles.status}>
                <TicketStatusBadge status={ticket.status} />
              </span>
              <span role="cell" className={styles.right}>
                <Button
                  variant="danger"
                  size="sm"
                  icon="close"
                  loading={cancellingId === ticket.id}
                  onClick={() => onCancel(ticket.id)}
                >
                  Annuler
                </Button>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
