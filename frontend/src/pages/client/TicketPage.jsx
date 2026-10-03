import { useParams } from 'react-router-dom'
import { AppHeader, PageContent } from '@/components/layout'
import { Button, Icon, InfoNote, Loader, StatusBadge, TicketNumber } from '@/components/ui'
import { TicketCard, TicketStats } from '@/components/ticket'
import { useTicketTracking } from '@/hooks/useTicketTracking'
import { ICONS } from '@/constants/icons'
import { QUEUE_STATUS } from '@/constants/status'
import styles from './TicketPage.module.css'

/** Client 4/6 — Mon ticket en attente (GET /api/tickets/:id, rafraîchi en continu). */
export default function TicketPage() {
  const { ticketId } = useParams()
  const { ticket, error, loading } = useTicketTracking(ticketId)

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

            {/* Annulation client : route publique (cancelToken) non confirmée côté backend */}
            <div className={styles.cancel}>
              <Button variant="danger" fullWidth icon={ICONS.close} disabled title="Bientôt disponible">
                Annuler mon ticket
              </Button>
              <p className="text-body-sm text-muted text-center">
                <Icon name={ICONS.info} size={14} /> Pour annuler, adressez-vous à l&apos;accueil de l&apos;établissement.
              </p>
            </div>
          </>
        )}
      </PageContent>
    </>
  )
}
