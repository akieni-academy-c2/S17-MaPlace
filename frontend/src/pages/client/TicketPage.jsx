import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { PageContent } from '@/components/layout'
import { Button, Card, ConfirmDialog, Icon, IconButton, InfoNote, Loader, StatusBadge, TicketNumber } from '@/components/ui'
import { TicketCard, TicketProgress, TicketStats } from '@/components/ticket'
import { useTicketTracking } from '@/hooks/useTicketTracking'
import { getCancelToken } from '@/hooks/useCurrentTicket'
import { cancelTicketByClient } from '@/services/ticketService'
import { estimateWaitMinutes, formatWait } from '@/constants/establishments'
import { ICONS } from '@/constants/icons'
import { getTicketAlert, QUEUE_STATUS, TICKET_STATUS } from '@/constants/status'
import { formatTicketNumber, formatTime, plural } from '@/utils/format'
import { PATHS, to } from '@/constants/routes'
import { downloadTicket, ticketExportData } from '@/utils/ticketExport'
import styles from './TicketPage.module.css'

/** Client — Mon ticket en attente (GET /api/tickets/:id, rafraîchi en continu). */
export default function TicketPage() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { ticket, error, loading } = useTicketTracking(ticketId)
  const cancelToken = getCancelToken(ticketId)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(Boolean(location.state?.justCreated))

  const handleCancel = async () => {
    setCancelling(true)
    setCancelError(null)
    try {
      await cancelTicketByClient(ticketId, cancelToken)
      navigate(to.ticketEnd(ticketId), { replace: true })
    } catch (err) {
      setConfirmOpen(false)
      setCancelError(
        err.status === 409
          ? "Ce ticket ne peut plus être annulé : il a déjà été appelé ou clôturé."
          : err.status === 404
            ? "Annulation impossible depuis cet appareil. Adressez-vous à l'accueil de l'établissement."
            : err.message,
      )
    } finally {
      setCancelling(false)
    }
  }

  const dismissConfirmation = () => {
    setShowConfirmation(false)
    navigate(location.pathname, { replace: true, state: null })
  }

  const alert = getTicketAlert(ticket)
  const paused = ticket?.queueStatus === QUEUE_STATUS.PAUSED
  const [downloading, setDownloading] = useState(false)

  // Le titre de l'onglet reflète l'alerte (visible même si l'utilisateur consulte un autre onglet)
  useEffect(() => {
    if (!ticket) return undefined
    const previous = document.title
    document.title = `${alert.key === 'waiting' ? '' : '⏳ '}${formatTicketNumber(ticket.number)} · ${alert.label} — Ma Place`
    return () => {
      document.title = previous
    }
  }, [ticket, alert])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await downloadTicket(ticketExportData(ticket))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <PageContent className={styles.page}>
      {loading && <Loader label="Récupération de votre ticket…" />}
      {error && (
        <InfoNote tone="error" icon={ICONS.warning} title={error.status === 404 ? 'Ticket introuvable' : 'Connexion interrompue'}>
          {error.status === 404 ? 'Ce ticket n’existe pas ou plus.' : `${error.message} Nouvelle tentative automatique…`}
        </InfoNote>
      )}

      {ticket && (
        <>
          {showConfirmation && (
            <section className={styles.confirmation} role="status">
              <span className={styles.confirmIcon}>
                <Icon name={ICONS.check} size={22} weight={600} />
              </span>
              <div className={styles.confirmText}>
                <p className={styles.confirmTitle}>Ticket confirmé : vous êtes le {formatTicketNumber(ticket.number)}</p>
                <p className="text-small">
                  {ticket.establishment?.name} ·{' '}
                  {ticket.peopleAhead > 0
                    ? `${plural(ticket.peopleAhead, 'personne')} devant vous · attente estimée ${formatWait(estimateWaitMinutes(ticket.peopleAhead))}`
                    : 'personne devant vous'}
                </p>
              </div>
              <IconButton icon={ICONS.close} label="Masquer la confirmation" size={36} onClick={dismissConfirmation} className={styles.confirmClose} />
            </section>
          )}

          <header className={styles.intro}>
            <div>
              <span className="text-eyebrow">Mon ticket</span>
              <h1 className={`text-h1 ${styles[`title-${alert.key}`] ?? ''}`}>{alert.title}</h1>
              <p className="text-muted">{alert.text}</p>
            </div>
            <span className={styles.live}>
              <span className={styles.liveDot} /> Actualisé en direct
            </span>
          </header>

          {paused && (
            <InfoNote tone="warning" icon={ICONS.pause} title="File en pause">
              L&apos;établissement a temporairement suspendu les appels. Votre place est conservée.
            </InfoNote>
          )}

          <div className={styles.layout}>
            <div className={styles.ticketCol}>
              <TicketCard
                tone={alert.key}
                header={
                  <>
                    <span className={styles.place}>
                      <Icon name={ICONS.store} size={16} /> {ticket.establishment?.name}
                    </span>
                    <StatusBadge
                      tone={alert.key === 'approaching' ? 'approaching' : 'onDark'}
                      dot
                      pulse={alert.key !== 'waiting'}
                      size="sm"
                      className={styles.headerBadge}
                    >
                      {alert.label}
                    </StatusBadge>
                  </>
                }
                footer={<TicketStats currentNumber={ticket.currentNumber} peopleAhead={ticket.peopleAhead} position={ticket.position} />}
              >
                <span className="text-eyebrow">Votre numéro</span>
                <TicketNumber number={ticket.number} size="xl" />
                {ticket.name && <p className={styles.holder}>{ticket.name}</p>}
                <p className={styles.service}>
                  <Icon name={ICONS.queue} size={14} /> File d’attente principale · pris à {formatTime(ticket.createdAt)}
                </p>
              </TicketCard>
            </div>

            <div className={styles.sideCol}>
              <Card className={styles.progressCard}>
                <h2 className="text-h3">Progression</h2>
                <TicketProgress ticket={ticket} />
              </Card>

              <InfoNote icon={ICONS.sync} title="Gardez cette page ouverte">
                Votre position s’actualise automatiquement. Quand ce sera votre tour, l’écran passera en vert.
              </InfoNote>

              <div className={styles.cancel}>
                <Button variant="outline" fullWidth icon={ICONS.download} loading={downloading} onClick={handleDownload}>
                  Télécharger mon ticket
                </Button>
                {cancelError && (
                  <InfoNote tone="error" icon={ICONS.warning}>
                    {cancelError}
                  </InfoNote>
                )}
                <Button
                  variant="danger-soft"
                  fullWidth
                  icon={ICONS.close}
                  disabled={!cancelToken || ticket.status !== TICKET_STATUS.WAITING}
                  onClick={() => setConfirmOpen(true)}
                >
                  Annuler mon ticket
                </Button>
                {!cancelToken && (
                  <p className="text-small text-muted text-center">
                    Ticket pris depuis un autre appareil : pour l&apos;annuler, adressez-vous à l&apos;accueil de l&apos;établissement.
                  </p>
                )}
                <Link to={to.establishment(ticket.establishment?.id)} className={styles.link}>
                  Voir la fiche de l’établissement
                </Link>
              </div>
            </div>
          </div>

          <ConfirmDialog
            open={confirmOpen}
            tone="danger"
            icon={ICONS.cancel}
            title="Annuler votre ticket ?"
            confirmLabel="Oui, annuler"
            cancelLabel="Garder ma place"
            confirmIcon={ICONS.close}
            loading={cancelling}
            onConfirm={handleCancel}
            onCancel={() => setConfirmOpen(false)}
          >
            Vous perdrez votre place {formatTicketNumber(ticket.number)} dans la file de <strong>{ticket.establishment?.name}</strong>. Cette
            action est définitive.
          </ConfirmDialog>
        </>
      )}

      {!loading && error?.status === 404 && (
        <Button variant="outline" icon={ICONS.home} to={PATHS.home}>
          Retour à l’accueil
        </Button>
      )}
    </PageContent>
  )
}
