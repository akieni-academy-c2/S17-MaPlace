import { useParams } from 'react-router-dom'
import { AppHeader, PageContent } from '@/components/layout'
import { Button, Card, Icon, InfoNote, Loader, TicketNumber } from '@/components/ui'
import { useTicketTracking } from '@/hooks/useTicketTracking'
import { ICONS } from '@/constants/icons'
import styles from './TicketCalledPage.module.css'

/** Client 5/6 — « C'est votre tour ! » (ticket SERVING). */
export default function TicketCalledPage() {
  const { ticketId } = useParams()
  const { ticket, error, loading } = useTicketTracking(ticketId)

  return (
    <>
      <AppHeader section="Mon ticket" />
      <PageContent>
        <div className={styles.liveBar}>
          <span className={styles.liveStatus}>
            <span className={styles.liveDot} /> Statut : appel en cours
          </span>
          <span className={styles.liveTag}>
            <Icon name={ICONS.checkCircle} size={20} /> En direct
          </span>
        </div>

        {loading && <Loader />}
        {error && <InfoNote tone="error" icon={ICONS.warning}>{error.message}</InfoNote>}

        {ticket && (
          <>
            <section className={styles.hero} aria-live="assertive">
              <span className={styles.heroIcon}>
                <Icon name={ICONS.campaign} size={44} />
              </span>
              <span className={styles.heroBadge}>
                <Icon name={ICONS.bell} size={18} /> Votre passage
              </span>
              <h1 className={styles.heroTitle}>C&apos;est votre tour !</h1>
              <span className={styles.numberBox}>
                <TicketNumber number={ticket.number} size="lg" tone="inverse" />
              </span>
              {ticket.name && (
                <span className={styles.namePill}>
                  <Icon name={ICONS.person} size={20} /> {ticket.name}
                </span>
              )}
              <p className={styles.heroText}>Présentez-vous maintenant auprès de votre établissement.</p>
            </section>

            <Card className="stack">
              <div className={styles.cardHead}>
                <span className="text-overline">Détails de l&apos;établissement</span>
                <Icon name={ICONS.verified} className={styles.verified} />
              </div>
              <div className={styles.place}>
                <span className={styles.placeIcon}>
                  <Icon name={ICONS.pharmacy} size={32} />
                </span>
                <div>
                  <p className={styles.placeName}>{ticket.establishment?.name}</p>
                  <p className="text-body-md text-muted">Prise en charge active de votre dossier</p>
                </div>
              </div>
              <InfoNote icon={ICONS.info}>Veuillez préparer vos documents si nécessaire.</InfoNote>
            </Card>

            <Button size="lg" fullWidth icon={ICONS.walk}>
              Je me présente
            </Button>
          </>
        )}
      </PageContent>
    </>
  )
}
