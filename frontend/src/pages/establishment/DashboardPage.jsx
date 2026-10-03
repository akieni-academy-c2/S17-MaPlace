import { useState } from 'react'
import { Button, ConfirmDialog, Icon, InfoNote, Loader, StatCard, StatusBadge } from '@/components/ui'
import { CallNextPanel, QueueControls, ServingTicketCard, WaitingList } from '@/components/queue'
import { useAuth } from '@/hooks/useAuth'
import { useQueueManager } from '@/hooks/useQueueManager'
import { ICONS } from '@/constants/icons'
import { QUEUE_STATUS } from '@/constants/status'
import { to } from '@/constants/routes'
import { formatTicketNumber, plural } from '@/utils/format'
import styles from './DashboardPage.module.css'

/** Établissement 2/3 — Tableau de bord de la file (GET /api/queue + actions JWT). */
export default function DashboardPage() {
  const { establishment } = useAuth()
  const { status, serving, waiting, lastNumber, loading, error, pending, actions } = useQueueManager()
  const [confirmClose, setConfirmClose] = useState(false)

  const handleClose = async () => {
    await actions.close()
    setConfirmClose(false)
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
            onCallNext={actions.callNext}
          />

          <div className={styles.columns}>
            <div className="stack">
              <h2 className={styles.sectionTitle}>
                <Icon name={ICONS.personPin} /> Ticket au guichet
                {serving && <StatusBadge tone="waiting">En cours de service</StatusBadge>}
              </h2>
              <ServingTicketCard ticket={serving} loading={pending === serving?.id} onComplete={actions.complete} />
            </div>
            <WaitingList tickets={waiting} pendingId={pending} onCancel={actions.cancel} id="prochains-clients" />
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmClose}
        tone="danger"
        icon={ICONS.power}
        title="Fermer la file ?"
        confirmLabel="Fermer la file"
        confirmIcon={ICONS.cancel}
        loading={pending === 'queue'}
        onConfirm={handleClose}
        onCancel={() => setConfirmClose(false)}
      >
        La session sera terminée et la numérotation repartira de #1 à la prochaine ouverture.
      </ConfirmDialog>
    </div>
  )
}
