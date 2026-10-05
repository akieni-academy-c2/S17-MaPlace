import { useParams } from 'react-router-dom'
import { PageContent } from '@/components/layout'
import { Button, Icon, InfoNote, Loader, StatusBadge, TicketNumber } from '@/components/ui'
import { useTicketTracking } from '@/hooks/useTicketTracking'
import { ICONS } from '@/constants/icons'
import { QUEUE_STATUS, TICKET_STATUS } from '@/constants/status'
import { PATHS } from '@/constants/routes'
import { formatTicketNumber, formatTime } from '@/utils/format'
import styles from './TicketEndPage.module.css'

const CONTENT = {
  [TICKET_STATUS.COMPLETED]: {
    icon: ICONS.check,
    badge: 'Passage terminé',
    title: 'Ticket terminé',
    text: 'Merci d’avoir utilisé Ma Place. Votre passage s’est déroulé avec succès : à bientôt !',
    endLabel: 'Fin du passage',
  },
  [TICKET_STATUS.CANCELLED]: {
    icon: ICONS.close,
    badge: 'Ticket annulé',
    title: 'Ticket annulé',
    text: 'Votre ticket a été annulé et votre place libérée. Vous pouvez reprendre un ticket à tout moment.',
    endLabel: 'Annulé à',
  },
}

const CLOSED_CONTENT = {
  ...CONTENT[TICKET_STATUS.CANCELLED],
  badge: 'File fermée',
  title: 'La file est fermée',
  text: 'L’établissement a fermé sa file avant votre passage : votre ticket a été annulé. Reprenez un ticket à la prochaine ouverture.',
  endLabel: 'Fermée à',
}

/** Durée entre deux dates : « 12 min », « 1 h 05 ». */
// ============================================================================
// 🚧 FT-1 — Tâche 1.4 : remettre le corps de la fonction formatDuration
//    Code à remettre : docs/TACHES_FRONTEND.md
// ============================================================================
const formatDuration = () => '—' // ⚠️ version provisoire

/** Récapitulatif d'un ticket terminé ou annulé ; le ticket n'est plus suivi sur l'appareil. */
export default function TicketEndPage() {
  const { ticketId } = useParams()
  const { ticket, error, loading } = useTicketTracking(ticketId, { poll: false })
  // 🚧 FT-1 — Tâche 1.6 : récupérer le ticket suivi avec useCurrentTicket()

  // 🚧 FT-1 — Tâche 1.6 : remettre l'effet qui libère « Mon ticket » à la fin du parcours

  const status = ticket?.status === TICKET_STATUS.CANCELLED ? TICKET_STATUS.CANCELLED : TICKET_STATUS.COMPLETED
  const cancelled = status === TICKET_STATUS.CANCELLED
  // Ticket non traité à la fermeture de la file : annulé automatiquement
  const content = cancelled && ticket?.queueStatus === QUEUE_STATUS.CLOSED ? CLOSED_CONTENT : CONTENT[status]

  return (
    <PageContent width="narrow">
      {loading && <Loader />}
      {error && (
        <InfoNote tone="error" icon={ICONS.warning}>
          {error.message}
        </InfoNote>
      )}

      {ticket && (
        <>
          <section className={`${styles.card} ${cancelled ? styles.cancelled : ''}`}>
            <span className={styles.halo}>
              <span className={styles.check}>
                <Icon name={content.icon} size={36} weight={600} />
              </span>
            </span>
            <StatusBadge tone={cancelled ? 'cancelled' : 'completed'} dot>
              {content.badge}
            </StatusBadge>
            <h1 className="text-h1">{content.title}</h1>
            <p className={styles.text}>{content.text}</p>

            <div className={styles.summary}>
              <div className={styles.summaryHead}>
                <div>
                  <span className="text-eyebrow">Récapitulatif</span>
                  <p className={styles.summaryTitle}>{ticket.establishment?.name}</p>
                </div>
                <TicketNumber number={ticket.number} size="md" tone={cancelled ? 'ink' : 'primary'} />
              </div>
              <dl className={styles.facts}>
                <div>
                  <dt>Numéro</dt>
                  <dd>{formatTicketNumber(ticket.number)}</dd>
                </div>
                <div>
                  <dt>Service</dt>
                  <dd>File principale</dd>
                </div>
                <div>
                  <dt>Ticket pris à</dt>
                  <dd>{formatTime(ticket.createdAt)}</dd>
                </div>
                <div>
                  <dt>{content.endLabel}</dt>
                  <dd>{formatTime(ticket.updatedAt)}</dd>
                </div>
                {!cancelled && (
                  <div className={styles.wide}>
                    <dt>Durée totale du parcours</dt>
                    <dd>{formatDuration(ticket.createdAt, ticket.updatedAt)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </section>

          <div className={styles.actions}>
            <Button size="lg" fullWidth icon={ICONS.home} to={PATHS.home}>
              Retour à l&apos;accueil
            </Button>
            <Button variant="outline" size="lg" fullWidth icon={ICONS.search} to={PATHS.establishments}>
              Trouver un autre établissement
            </Button>
            {/* 🚧 FT-1 — Tâche 1.5 : remettre le bouton « Reprendre un ticket ici » (voir docs/TACHES_FRONTEND.md) */}
          </div>

          <InfoNote icon={ICONS.shield}>Ce ticket n’est plus suivi sur cet appareil. Merci de votre confiance !</InfoNote>
        </>
      )}
    </PageContent>
  )
}
