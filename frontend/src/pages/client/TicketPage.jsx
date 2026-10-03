import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppHeader, PageContent } from '@/components/layout'
import { Button, ConfirmDialog, Icon, InfoNote, Loader, StatusBadge, TicketNumber } from '@/components/ui'
import { TicketCard, TicketStats } from '@/components/ticket'
import { useTicketTracking } from '@/hooks/useTicketTracking'
import { getCancelToken } from '@/hooks/useCurrentTicket'
import { cancelTicketByClient } from '@/services/ticketService'
import { ICONS } from '@/constants/icons'
import { QUEUE_STATUS, TICKET_STATUS } from '@/constants/status'
import { formatTicketNumber } from '@/utils/format'
import { to } from '@/constants/routes'
import styles from './TicketPage.module.css'

/** Client 4/6 — Mon ticket en attente (GET /api/tickets/:id, rafraîchi en continu). */
export default function TicketPage() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { ticket, error, loading } = useTicketTracking(ticketId)
  const cancelToken = getCancelToken(ticketId)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)

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

  return (
    <>
      <AppHeader section="Mon ticket" />
      <PageContent>
        {loading && <Loader label="Récupération de votre ticket…" />}
        {error && (
          <InfoNote tone="error" icon={ICONS.warning}>
            {error.status === 404 ? 'Ticket introuvable.' : error.message}
          </InfoNote>
        )}

        {ticket && (
          <>
            <div className={styles.intro}>
              <StatusBadge tone="waiting" icon={ICONS.pharmacy}>
                {ticket.establishment?.name}
              </StatusBadge>
              <h1 className="text-headline-lg">Votre ticket digital</h1>
              <p className="text-body-md text-muted">Gardez l&apos;esprit tranquille, votre tour approche</p>
            </div>

            {ticket.queueStatus === QUEUE_STATUS.PAUSED && (
              <InfoNote tone="warning" icon={ICONS.pause} title="File en pause">
                L&apos;établissement a temporairement suspendu les appels. Votre place est conservée.
              </InfoNote>
            )}

            <TicketCard
              header={
                <>
                  <span className={styles.active}>
                    <span className={styles.activeDot} /> Ticket actif
                  </span>
                  <StatusBadge tone="waiting" icon={ICONS.hourglass}>
                    En attente
                  </StatusBadge>
                </>
              }
              footer={<TicketStats currentNumber={ticket.currentNumber} peopleAhead={ticket.peopleAhead} position={ticket.position} />}
            >
              <span className="text-overline">Numéro d&apos;appel</span>
              <TicketNumber number={ticket.number} size="xl" />
              <span className={styles.underline} />
            </TicketCard>

            <InfoNote icon={ICONS.sync} title="Mise à jour en direct" className={styles.live}>
              Nous actualisons automatiquement votre position. Restez sur cette page ou gardez-la ouverte.
            </InfoNote>

            <div className={styles.cancel}>
              {cancelError && (
                <InfoNote tone="error" icon={ICONS.warning}>
                  {cancelError}
                </InfoNote>
              )}
              <Button
                variant="danger"
                fullWidth
                icon={ICONS.close}
                disabled={!cancelToken || ticket.status !== TICKET_STATUS.WAITING}
                onClick={() => setConfirmOpen(true)}
              >
                Annuler mon ticket
              </Button>
              {!cancelToken && (
                <p className="text-body-sm text-muted text-center">
                  <Icon name={ICONS.info} size={14} /> Ticket pris depuis un autre appareil : pour l&apos;annuler,
                  adressez-vous à l&apos;accueil de l&apos;établissement.
                </p>
              )}
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
              Vous perdrez votre place {formatTicketNumber(ticket.number)} dans la file de{' '}
              <strong>{ticket.establishment?.name}</strong>. Cette action est définitive.
            </ConfirmDialog>
          </>
        )}
      </PageContent>
    </>
  )
}
