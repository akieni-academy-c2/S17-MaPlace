import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AppHeader, PageContent } from '@/components/layout'
import { Button, Icon, InfoNote, Loader, SegmentedControl, StatusBadge } from '@/components/ui'
import { useTicketTracking } from '@/hooks/useTicketTracking'
import { useCurrentTicket } from '@/hooks/useCurrentTicket'
import { ICONS } from '@/constants/icons'
import { TICKET_STATUS } from '@/constants/status'
import { PATHS } from '@/constants/routes'
import { formatTicketNumber, formatTime } from '@/utils/format'
import styles from './TicketEndPage.module.css'

const CONTENT = {
  [TICKET_STATUS.COMPLETED]: {
    icon: ICONS.check,
    badge: 'Service finalisé',
    title: 'Ticket terminé',
    text: 'Merci d’avoir utilisé Ma Place. Votre passage s’est déroulé avec succès.',
  },
  [TICKET_STATUS.CANCELLED]: {
    icon: ICONS.close,
    badge: 'Ticket annulé',
    title: 'Ticket annulé',
    text: 'Votre ticket a été annulé. Vous pouvez reprendre un ticket à tout moment.',
  },
}

const TABS = [
  { value: TICKET_STATUS.COMPLETED, label: 'Terminé', icon: ICONS.checkCircle },
  { value: TICKET_STATUS.CANCELLED, label: 'Annulé', icon: ICONS.cancel },
]

/** Client 6/6 — Ticket terminé ou annulé. */
export default function TicketEndPage() {
  const { ticketId } = useParams()
  const { ticket, error, loading } = useTicketTracking(ticketId, { poll: false })
  const { ticketId: currentId, clear } = useCurrentTicket()

  // Le parcours est fini : on libère le « Mon ticket » de la navigation
  useEffect(() => {
    if (ticket && currentId === ticketId) clear()
  }, [ticket, currentId, ticketId, clear])

  const status = ticket?.status === TICKET_STATUS.CANCELLED ? TICKET_STATUS.CANCELLED : TICKET_STATUS.COMPLETED
  const content = CONTENT[status]
  const cancelled = status === TICKET_STATUS.CANCELLED

  return (
    <>
      <AppHeader section="Accueil" />
      <PageContent>
        {loading && <Loader />}
        {error && <InfoNote tone="error" icon={ICONS.warning}>{error.message}</InfoNote>}

        {ticket && (
          <>
            <SegmentedControl options={TABS} value={status} label="Issue du ticket" />

            <section className={`${styles.card} ${cancelled ? styles.cancelled : ''}`}>
              <span className={styles.halo}>
                <span className={styles.check}>
                  <Icon name={content.icon} size={40} weight={600} />
                </span>
              </span>
              <StatusBadge tone={cancelled ? 'cancelled' : 'open'} dot>
                {content.badge}
              </StatusBadge>
              <h1 className="text-headline-lg">{content.title}</h1>
              <p className="text-body-lg text-muted">{content.text}</p>

              <div className={styles.summary}>
                <div className={styles.summaryHead}>
                  <div>
                    <span className="text-overline">Récapitulatif</span>
                    <p className={styles.summaryTitle}>Ticket {formatTicketNumber(ticket.number)}</p>
                  </div>
                  <span className={styles.summaryIcon}>
                    <Icon name={ICONS.pharmacy} />
                  </span>
                </div>
                <p className={styles.place}>
                  <Icon name={ICONS.location} size={22} /> {ticket.establishment?.name}
                </p>
                <p className={styles.meta}>
                  <span>Ticket {cancelled ? 'annulé' : 'terminé'}</span>
                  <span>{formatTime(ticket.updatedAt)}</span>
                </p>
              </div>

              <InfoNote icon={ICONS.shield}>
                Vos coordonnées temporaires ont été effacées conformément à notre engagement de confidentialité.
              </InfoNote>
            </section>

            <div className="stack" style={{ '--stack-gap': 'var(--space-sm)' }}>
              <Button size="lg" fullWidth icon={ICONS.home} to={PATHS.home}>
                Retour à l&apos;accueil
              </Button>
              <Button variant="secondary" size="lg" fullWidth icon={ICONS.search} to={`${PATHS.home}#etablissements`}>
                Trouver un autre établissement
              </Button>
            </div>

            <p className="text-body-md text-muted text-center">Ma Place · Pour des files d&apos;attente sereines et humaines</p>
          </>
        )}
      </PageContent>
    </>
  )
}
