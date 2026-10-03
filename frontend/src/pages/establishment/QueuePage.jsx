import { useMemo, useState } from 'react'
import { Button, FilterChips, InfoNote, Loader, QueueStatusBadge } from '@/components/ui'
import { WaitingList } from '@/components/queue'
import { useAuth } from '@/hooks/useAuth'
import { useQueueManager } from '@/hooks/useQueueManager'
import { ICONS } from '@/constants/icons'
import { QUEUE_STATUS, TICKET_STATUS } from '@/constants/status'
import { formatTicketNumber } from '@/utils/format'
import styles from './QueuePage.module.css'

const FILTERS = [
  { value: 'ALL', label: 'Tous' },
  { value: TICKET_STATUS.WAITING, label: 'En attente', dot: 'var(--color-primary-container)' },
  { value: TICKET_STATUS.SERVING, label: 'Au guichet', dot: 'var(--color-status-open)' },
  { value: TICKET_STATUS.COMPLETED, label: 'Terminés', dot: 'var(--color-status-closed)' },
  { value: TICKET_STATUS.CANCELLED, label: 'Annulés', dot: 'var(--color-status-cancelled)' },
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

/** Établissement 3/3 — File d'attente complète de la session en cours (GET /api/queue). */
export default function QueuePage() {
  const { establishment } = useAuth()
  const { status, tickets, waiting, loading, error, pending, actions } = useQueueManager()
  const [filter, setFilter] = useState('ALL')

  const counts = useMemo(
    () => tickets.reduce((acc, t) => ({ ...acc, [t.status]: (acc[t.status] ?? 0) + 1 }), { ALL: tickets.length }),
    [tickets],
  )
  const options = FILTERS.map((f) => ({ ...f, label: `${f.label} · ${counts[f.value] ?? 0}` }))
  const visible = filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter)
  const isActive = status !== QUEUE_STATUS.CLOSED

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.titleBlock}>
          <span className={styles.breadcrumb}>
            <span>File d&apos;attente</span> · {establishment?.name}
          </span>
          <h1 className="text-headline-lg">Tickets de la session</h1>
        </div>
        <QueueStatusBadge status={status} />
      </header>

      {loading && <Loader label="Chargement de la file…" />}
      {error && (
        <InfoNote tone="error" icon={ICONS.warning}>
          {error}
        </InfoNote>
      )}

      {!loading && !isActive && (
        <InfoNote tone="plain" icon={ICONS.info} title="Aucune file active">
          Ouvrez la file depuis le tableau de bord pour commencer à recevoir des tickets.
        </InfoNote>
      )}

      {!loading && isActive && (
        <>
          <div className={styles.toolbar}>
            <FilterChips options={options} value={filter} onChange={setFilter} label="Filtrer par statut du ticket" />
            <Button
              size="sm"
              icon={ICONS.bell}
              loading={pending === 'next'}
              disabled={status !== QUEUE_STATUS.OPEN || waiting.length === 0}
              onClick={actions.callNext}
            >
              Appeler {waiting[0] ? formatTicketNumber(waiting[0].number) : 'le suivant'}
            </Button>
          </div>

          <WaitingList
            id="file-attente"
            title={TITLES[filter]}
            countLabel={['ticket', 'tickets']}
            tickets={visible}
            pendingId={pending}
            onCancel={actions.cancel}
            onComplete={actions.complete}
            emptyTitle="Aucun ticket"
            emptyText={EMPTY[filter]}
            showTime
          />
        </>
      )}
    </div>
  )
}
