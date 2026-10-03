import { useMemo, useState } from 'react'
import { Button, Icon, InfoNote, Loader, StatCard, StatusBadge } from '@/components/ui'
import { CallNextPanel, QueueControls, ServingTicketCard, WaitingList } from '@/components/queue'
import { usePolling } from '@/hooks/usePolling'
import { useAuth } from '@/hooks/useAuth'
import * as queueService from '@/services/queueService'
import { cancelTicket, completeTicket } from '@/services/ticketService'
import { ICONS } from '@/constants/icons'
import { QUEUE_STATUS, TICKET_STATUS } from '@/constants/status'
import { to } from '@/constants/routes'
import { formatTicketNumber, plural } from '@/utils/format'
import styles from './DashboardPage.module.css'

/** Établissement 2/2 — Tableau de bord de la file (GET /api/queue + actions JWT). */
export default function DashboardPage() {
  const { establishment } = useAuth()
  const { data, error, loading, refresh } = usePolling((signal) => queueService.getQueue({ signal }))
  const [pending, setPending] = useState(null) // action en cours : 'queue' | 'next' | ticketId
  const [actionError, setActionError] = useState(null)

  const status = data?.queueStatus ?? data?.queue?.status ?? QUEUE_STATUS.CLOSED
  const tickets = useMemo(() => data?.tickets ?? [], [data])
  const serving = tickets.find((t) => t.status === TICKET_STATUS.SERVING) ?? null
  const waiting = useMemo(
    () => tickets.filter((t) => t.status === TICKET_STATUS.WAITING).sort((a, b) => a.number - b.number),
    [tickets],
  )
  const lastNumber = data?.queue?.last_number ?? 0

  /** Exécute une action API puis recharge la file. */
  const run = (key, action) => async () => {
    setPending(key)
    setActionError(null)
    try {
      await action()
      await refresh()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setPending(null)
    }
  }

  const handleClose = () => {
    if (window.confirm('Fermer la file ? La session sera terminée et la numérotation repartira de #1.')) {
      run('queue', queueService.closeQueue)()
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.titleBlock}>
          <span className={styles.breadcrumb}>
            <span>Console d&apos;accueil</span> · {establishment?.name}
          </span>
          <h1 className="text-headline-lg">Tableau de bord de la file</h1>
        </div>
        {establishment?.id && (
          <Button variant="secondary" size="sm" icon={ICONS.external} href={to.establishment(establishment.id)} target="_blank" rel="noreferrer">
            Accès public
          </Button>
        )}
      </header>

      <QueueControls
        status={status}
        busy={pending === 'queue'}
        onOpen={run('queue', queueService.openQueue)}
        onPause={run('queue', queueService.pauseQueue)}
        onResume={run('queue', queueService.resumeQueue)}
        onClose={handleClose}
      />

      {loading && <Loader label="Chargement de la file…" />}
      {(error || actionError) && (
        <InfoNote tone="error" icon={ICONS.warning}>
          {actionError ?? error.message}
        </InfoNote>
      )}
      {status === QUEUE_STATUS.PAUSED && (
        <InfoNote tone="warning" icon={ICONS.pause} title="File en pause">
          La prise de tickets et les appels sont suspendus. Reprenez la file pour continuer.
        </InfoNote>
      )}

      {!loading && (
        <>
          <div className={styles.kpis}>
            <StatCard label="En attente active" value={waiting.length} caption="Personnes dans la file" icon={ICONS.groups} />
            <StatCard
              tone="success"
              label="Au guichet en cours"
              value={formatTicketNumber(serving?.number)}
              caption={serving ? 'Prise en charge active' : 'Aucun client'}
              icon={ICONS.hourglass}
            />
            <StatCard
              tone="primary"
              label="Dernier distribué"
              value={formatTicketNumber(lastNumber || null)}
              caption={plural(lastNumber, 'ticket émis', 'tickets émis')}
              icon={ICONS.ticket}
            />
          </div>

          <CallNextPanel
            nextTicket={waiting[0]}
            disabled={status !== QUEUE_STATUS.OPEN}
            loading={pending === 'next'}
            onCallNext={run('next', queueService.callNext)}
          />

          <div className={styles.columns}>
            <div className="stack">
              <h2 className={styles.sectionTitle}>
                <Icon name={ICONS.personPin} /> Ticket au guichet
                {serving && <StatusBadge tone="waiting">En cours de service</StatusBadge>}
              </h2>
              <ServingTicketCard
                ticket={serving}
                loading={pending === serving?.id}
                onComplete={(id) => run(id, () => completeTicket(id))()}
              />
            </div>
            <WaitingList
              tickets={waiting}
              cancellingId={pending}
              onCancel={(id) => run(id, () => cancelTicket(id))()}
            />
          </div>
        </>
      )}
    </div>
  )
}
