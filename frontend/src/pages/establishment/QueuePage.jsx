import { useMemo, useState } from 'react'
import { Button, EmptyState, FilterChips, InfoNote, Loader, Pagination, QueueStatusBadge } from '@/components/ui'
import { WaitingList, WalkInTicketDialog } from '@/components/queue'
import { useAuth } from '@/hooks/useAuth'
import { useQueueManager } from '@/hooks/useQueueManager'
import { usePagination } from '@/hooks/usePagination'
import { ICONS } from '@/constants/icons'
import { QUEUE_STATUS, TICKET_STATUS } from '@/constants/status'
import { PATHS } from '@/constants/routes'
import { formatTicketNumber } from '@/utils/format'
import { ProPageHeader } from './ProPageHeader'
import styles from './QueuePage.module.css'

const PAGE_SIZE = 10

const FILTERS = [
  { value: 'ALL', label: 'Tous' },
  { value: TICKET_STATUS.WAITING, label: 'En attente', dot: 'var(--primary)' },
  { value: TICKET_STATUS.SERVING, label: 'Au guichet', dot: 'var(--orange)' },
  { value: TICKET_STATUS.COMPLETED, label: 'Terminés', dot: 'var(--success)' },
  { value: TICKET_STATUS.CANCELLED, label: 'Annulés', dot: 'var(--danger)' },
]

const TITLES = {
  ALL: 'Tous les tickets',
  [TICKET_STATUS.WAITING]: 'En attente',
  [TICKET_STATUS.SERVING]: 'Au guichet',
  [TICKET_STATUS.COMPLETED]: 'Terminés',
  [TICKET_STATUS.CANCELLED]: 'Annulés',
}

const EMPTY = {
  ALL: 'Aucun ticket émis pour cette session.',
  [TICKET_STATUS.WAITING]: 'Personne n’attend pour le moment.',
  [TICKET_STATUS.SERVING]: 'Aucun client au guichet.',
  [TICKET_STATUS.COMPLETED]: 'Aucun ticket terminé pour cette session.',
  [TICKET_STATUS.CANCELLED]: 'Aucun ticket annulé pour cette session.',
}

/** Établissement — File d'attente complète de la session en cours (GET /api/queue). */
export default function QueuePage() {
  const { establishment } = useAuth()
  const { status, tickets, waiting, loading, error, pending, actions } = useQueueManager()
  const [filter, setFilter] = useState('ALL')
  const [walkInOpen, setWalkInOpen] = useState(false)

  const counts = useMemo(
    () => tickets.reduce((acc, t) => ({ ...acc, [t.status]: (acc[t.status] ?? 0) + 1 }), { ALL: tickets.length }),
    [tickets],
  )
  const options = FILTERS.map((f) => ({ ...f, count: counts[f.value] ?? 0 }))
  const visible = filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter)
  const isActive = status !== QUEUE_STATUS.CLOSED
  const pagination = usePagination(visible, PAGE_SIZE, filter)

  return (
    <div className={styles.page}>
      <ProPageHeader
        breadcrumb={`File d’attente · ${establishment?.name ?? ''}`}
        title="Tickets de la session"
        subtitle="Tous les tickets émis depuis l’ouverture de la file."
        actions={
          <>
            <QueueStatusBadge status={status} />
            <Button size="sm" icon={ICONS.ticketPlus} onClick={() => setWalkInOpen(true)} disabled={status !== QUEUE_STATUS.OPEN} title="Pour un client sans smartphone">
              Créer un ticket
            </Button>
          </>
        }
      />

      {loading && <Loader label="Chargement de la file…" />}
      {error && (
        <InfoNote tone="error" icon={ICONS.warning}>
          {error}
        </InfoNote>
      )}

      {!loading && !isActive && (
        <EmptyState
          icon={ICONS.power}
          title="Aucune file active"
          action={
            <Button icon={ICONS.dashboard} to={PATHS.proDashboard}>
              Aller au tableau de bord
            </Button>
          }
        >
          Ouvrez la file depuis le tableau de bord pour commencer à recevoir des tickets.
        </EmptyState>
      )}

      {!loading && isActive && (
        <>
          {status === QUEUE_STATUS.PAUSED && (
            <InfoNote tone="warning" icon={ICONS.pause} title="File en pause">
              Les nouveaux tickets et les appels sont suspendus. Les tickets existants sont conservés.
            </InfoNote>
          )}
          <div className={styles.toolbar}>
            <FilterChips options={options} value={filter} onChange={setFilter} label="Filtrer par statut du ticket" className={styles.filters} />
            <Button
              variant="secondary"
              icon={ICONS.bell}
              loading={pending === 'next'}
              disabled={status !== QUEUE_STATUS.OPEN || waiting.length === 0}
              onClick={actions.callNext}
              className={styles.callButton}
            >
              Appeler {waiting[0] ? formatTicketNumber(waiting[0].number) : 'le suivant'}
            </Button>
          </div>

          <WaitingList
            id="file-attente"
            title={TITLES[filter]}
            countLabel={['ticket', 'tickets']}
            tickets={pagination.pageItems}
            total={visible.length}
            pendingId={pending}
            onCancel={actions.cancel}
            onComplete={actions.complete}
            emptyTitle="Aucun ticket"
            emptyText={EMPTY[filter]}
            showTime
            footer={
              <Pagination
                {...pagination}
                onChange={pagination.setPage}
                itemLabel="tickets"
                targetId="file-attente"
                label="Pages de la file"
              />
            }
          />
        </>
      )}

      <WalkInTicketDialog
        open={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        onCreate={actions.createTicket}
        establishmentName={establishment?.name}
      />
    </div>
  )
}
