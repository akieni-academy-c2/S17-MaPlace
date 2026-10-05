import { Link } from 'react-router-dom'
import { PageContent, PageTitle } from '@/components/layout'
import { Button, EmptyState, Icon, InfoNote, Loader, StatusBadge, TicketNumber } from '@/components/ui'
import { getTicket } from '@/services/ticketService'
import { usePolling } from '@/hooks/usePolling'
import { useCurrentTicket } from '@/hooks/useCurrentTicket'
import { estimateWaitMinutes, formatWait, serviceMinutesOf } from '@/constants/establishments'
import { ICONS } from '@/constants/icons'
import { getTicketAlert, PAUSE_REASON, TICKET_STATUS } from '@/constants/status'
import { PATHS, to } from '@/constants/routes'
import { formatTicketNumber, formatTime } from '@/utils/format'
import styles from './MyTicketsPage.module.css'

/** Statut affiché côté client : alerte de progression (en attente, approche, bientôt, appelé) ou fin. */
const clientStatus = (ticket) => {
  if (ticket.status === TICKET_STATUS.COMPLETED) return { tone: 'completed', label: 'Terminé', link: to.ticketEnd }
  if (ticket.status === TICKET_STATUS.CANCELLED) return { tone: 'cancelled', label: 'Annulé', link: to.ticketEnd }
  const alert = getTicketAlert(ticket)
  const label = ticket.pauseReason === PAUSE_REASON.NEXT_DAY ? 'Reprise demain' : alert.label
  return { tone: alert.tone, label, link: ticket.status === TICKET_STATUS.SERVING ? to.ticketCalled : to.ticket }
}

/** Client — Mes tickets : ticket suivi depuis cet appareil (pas de compte client). */
export default function MyTicketsPage() {
  const { ticketId, clear } = useCurrentTicket()
  const { data, error, loading } = usePolling((signal) => getTicket(ticketId, { signal }), {
    enabled: Boolean(ticketId),
    deps: [ticketId],
  })
  const ticket = ticketId ? data?.ticket : null
  const status = ticket && clientStatus(ticket)
  const isWaiting = ticket?.status === TICKET_STATUS.WAITING
  const serviceMinutes = serviceMinutesOf(ticket?.establishment)

  return (
    <PageContent width="narrow">
      <PageTitle eyebrow="Suivi" title="Mes tickets" text="Le ticket pris depuis cet appareil est suivi ici en temps réel." />

      {ticketId && loading && <Loader label="Récupération de votre ticket…" />}

      {ticketId && error && (
        <InfoNote tone="error" icon={ICONS.warning} title={error.status === 404 ? 'Ticket introuvable' : 'Impossible de charger le ticket'}>
          {error.status === 404 ? 'Ce ticket n’existe plus. ' : `${error.message} `}
          {error.status === 404 && (
            <button type="button" className={styles.inlineLink} onClick={clear}>
              Retirer de cet appareil
            </button>
          )}
        </InfoNote>
      )}

      {ticket && (
        <article className={`${styles.card} ${styles[status.tone]}`}>
          <div className={styles.cardHead}>
            <span className={styles.place}>
              <Icon name={ICONS.store} size={16} /> {ticket.establishment?.name}
            </span>
            <StatusBadge tone={status.tone} dot={isWaiting} pulse={ticket.status === TICKET_STATUS.SERVING}>
              {status.label}
            </StatusBadge>
          </div>
          <div className={styles.cardBody}>
            <div>
              <span className="text-eyebrow">Numéro</span>
              <TicketNumber number={ticket.number} size="lg" tone={isWaiting ? status.tone : 'primary'} />
            </div>
            <dl className={styles.facts}>
              {isWaiting && (
                <>
                  <div>
                    <dt>Devant vous</dt>
                    <dd>{ticket.peopleAhead}</dd>
                  </div>
                  <div>
                    <dt>Attente estimée</dt>
                    <dd>{formatWait(estimateWaitMinutes(ticket.peopleAhead, serviceMinutes), serviceMinutes)}</dd>
                  </div>
                </>
              )}
              <div>
                <dt>Numéro appelé</dt>
                <dd>{formatTicketNumber(ticket.currentNumber)}</dd>
              </div>
              <div>
                <dt>Pris à</dt>
                <dd>{formatTime(ticket.createdAt)}</dd>
              </div>
            </dl>
          </div>
          <Button fullWidth size="lg" iconRight={ICONS.forward} to={status.link(ticket.id)}>
            {ticket.status === TICKET_STATUS.COMPLETED || ticket.status === TICKET_STATUS.CANCELLED ? 'Voir le récapitulatif' : 'Suivre mon ticket'}
          </Button>
        </article>
      )}

      {!ticketId && (
        <EmptyState
          icon={ICONS.ticket}
          title="Aucun ticket en cours"
          action={
            <Button icon={ICONS.search} to={PATHS.establishments}>
              Trouver un établissement
            </Button>
          }
        >
          Prenez un ticket dans un établissement ouvert : il apparaîtra ici et vous pourrez suivre votre tour en direct.
        </EmptyState>
      )}

      <div className={styles.tips}>
        <InfoNote icon={ICONS.smartphone} title="Un ticket par appareil">
          Ma Place suit le dernier ticket pris depuis ce téléphone. Prendre un nouveau ticket remplace le suivi du précédent.
        </InfoNote>
        <InfoNote icon={ICONS.shield} title="Sans compte">
          Votre ticket est mémorisé dans ce navigateur uniquement. Pour l’annuler, utilisez le même appareil.
        </InfoNote>
      </div>
      <p className="text-small text-muted">
        Une question ? Consultez la <Link to="/#faq" className={styles.inlineLink}>FAQ</Link>.
      </p>
    </PageContent>
  )
}
