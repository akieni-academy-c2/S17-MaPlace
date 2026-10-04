import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, ConfirmDialog, EmptyState, InfoNote, Loader, StatCard, TicketNumber, TicketStatusBadge } from '@/components/ui'
import { CallNextPanel, QueueControls, ServingTicketCard, WaitingList, WalkInTicketDialog } from '@/components/queue'
import { useAuth } from '@/hooks/useAuth'
import { useQueueManager } from '@/hooks/useQueueManager'
import { ICONS } from '@/constants/icons'
import { QUEUE_STATUS, TICKET_STATUS } from '@/constants/status'
import { PATHS, to } from '@/constants/routes'
import { formatTicketNumber, formatTime, plural } from '@/utils/format'
import { ProPageHeader } from './ProPageHeader'
import styles from './DashboardPage.module.css'

const HISTORY_SIZE = 5
/** Nombre de tickets en attente affichés sur le tableau de bord (la liste complète est dans « File d'attente »). */
const NEXT_SIZE = 5
const today = () => new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

/** Établissement — Tableau de bord de la file (GET /api/queue + actions JWT). */
export default function DashboardPage() {
  const { establishment } = useAuth()
  const { status, tickets, serving, waiting, lastNumber, loading, error, pending, actions } = useQueueManager()
  const [confirmClose, setConfirmClose] = useState(false)
  const [walkInOpen, setWalkInOpen] = useState(false)

  const completed = tickets.filter((t) => t.status === TICKET_STATUS.COMPLETED)
  const history = useMemo(
    () =>
      tickets
        .filter((t) => t.status === TICKET_STATUS.COMPLETED || t.status === TICKET_STATUS.CANCELLED)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, HISTORY_SIZE),
    [tickets],
  )

  const handleClose = async () => {
    await actions.close()
    setConfirmClose(false)
  }

  return (
    <div className={styles.page}>
      <ProPageHeader
        title="Tableau de bord"
        subtitle={today()}
        actions={
          <>
            {establishment?.id && (
              <Button variant="outline" size="sm" icon={ICONS.external} href={to.establishment(establishment.id)} target="_blank" rel="noreferrer">
                Page publique
              </Button>
            )}
            <Button size="sm" icon={ICONS.ticketPlus} onClick={() => setWalkInOpen(true)} disabled={status !== QUEUE_STATUS.OPEN} title="Pour un client sans smartphone">
              Créer un ticket
            </Button>
          </>
        }
      />

      <QueueControls
        status={status}
        busy={pending === 'queue'}
        onOpen={actions.open}
        onPause={actions.pause}
        onResume={actions.resume}
        onClose={() => setConfirmClose(true)}
      />

      {loading && <Loader label="Chargement de la file…" />}
      {error && (
        <InfoNote tone="error" icon={ICONS.warning}>
          {error}
        </InfoNote>
      )}

      {!loading && (
        <>
          <div className={styles.kpis}>
            <StatCard tone="primary" label="En attente" value={waiting.length} caption={waiting.length > 1 ? 'personnes dans la file' : 'personne dans la file'} icon={ICONS.groups} />
            <StatCard label="Ticket appelé" value={formatTicketNumber(serving?.number)} caption={serving ? serving.name : 'Guichet libre'} icon={ICONS.campaign} />
            <StatCard tone="accent" label="Prochain ticket" value={formatTicketNumber(waiting[0]?.number)} caption={waiting[0] ? waiting[0].name : 'Personne en attente'} icon={ICONS.next} />
            <StatCard tone="success" label="Tickets servis" value={completed.length} caption={`sur ${plural(lastNumber, 'ticket émis', 'tickets émis')}`} icon={ICONS.checkAll} />
          </div>

          <CallNextPanel
            nextTicket={waiting[0]}
            disabled={status !== QUEUE_STATUS.OPEN}
            loading={pending === 'next'}
            onCallNext={actions.callNext}
            hint={
              status === QUEUE_STATUS.PAUSED
                ? 'File en pause : reprenez la file pour appeler le client suivant.'
                : status === QUEUE_STATUS.CLOSED
                  ? 'Ouvrez la file pour commencer à recevoir des tickets.'
                  : serving
                    ? `Appeler le suivant terminera automatiquement le ticket ${formatTicketNumber(serving.number)}.`
                    : null
            }
          />

          <div className={styles.columns}>
            <div className={styles.servingCol}>
              <h2 className={styles.sectionTitle}>Au guichet</h2>
              <ServingTicketCard ticket={serving} loading={pending === serving?.id} onComplete={actions.complete} />
            </div>
            <WaitingList
              tickets={waiting.slice(0, NEXT_SIZE)}
              waiting={waiting}
              total={waiting.length}
              title={`${waiting.length > NEXT_SIZE ? `${NEXT_SIZE} prochains` : 'Prochains'} clients en file`}
              countLabel={['en attente', 'en attente']}
              pendingId={pending}
              onCancel={actions.cancel}
              id="prochains-clients"
              footer={
                waiting.length > NEXT_SIZE && (
                  <Link to={PATHS.proQueue} className={styles.moreLink}>
                    + {plural(waiting.length - NEXT_SIZE, 'autre ticket', 'autres tickets')} en attente · Voir toute la file
                  </Link>
                )
              }
            />
          </div>

          <Card className={styles.history}>
            <div className={styles.historyHead}>
              <h2 className={styles.sectionTitle}>Historique récent</h2>
              <Link to={PATHS.proQueue} className={styles.historyLink}>
                Voir toute la file
              </Link>
            </div>
            {history.length === 0 ? (
              <EmptyState icon={ICONS.history} title="Aucun passage pour l’instant">
                Les tickets terminés ou annulés de la session apparaîtront ici.
              </EmptyState>
            ) : (
              <ul className={styles.historyList}>
                {history.map((t) => (
                  <li key={t.id}>
                    <TicketNumber number={t.number} size="sm" tone="ink" />
                    <span className={styles.historyName}>{t.name}</span>
                    <span className={styles.historyTime}>{formatTime(t.updatedAt)}</span>
                    <TicketStatusBadge status={t.status} size="sm" />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}

      <WalkInTicketDialog
        open={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        onCreate={actions.createTicket}
        establishmentName={establishment?.name}
      />

      <ConfirmDialog
        open={confirmClose}
        tone="danger"
        icon={ICONS.power}
        title="Fermer la file ?"
        confirmLabel="Fermer la file"
        confirmIcon={ICONS.power}
        loading={pending === 'queue'}
        onConfirm={handleClose}
        onCancel={() => setConfirmClose(false)}
      >
        La session sera terminée pour aujourd’hui et la numérotation repartira de #1 à la prochaine ouverture.
        {waiting.length > 0 && (
          <>
            {' '}
            <strong>{plural(waiting.length, 'ticket en attente sera annulé', 'tickets en attente seront annulés')}.</strong>
          </>
        )}
      </ConfirmDialog>
    </div>
  )
}
