import { useParams } from 'react-router-dom'
import { PageContent } from '@/components/layout'
import { Button, Card, Icon, InfoNote, Loader, StatusBadge, TicketNumber } from '@/components/ui'
import { useTicketTracking } from '@/hooks/useTicketTracking'
import { ICONS } from '@/constants/icons'
import { to } from '@/constants/routes'
import { formatTime } from '@/utils/format'
import styles from './TicketCalledPage.module.css'

/** Signale l'appel même si l'utilisateur regarde un autre onglet (titre) ou a le téléphone en main (vibration). */
// ============================================================================
// 🚧 FT-2 — Tâche 2.4 : remettre le corps du hook useCallAlert (titre de l’onglet + vibration)
//    Code à remettre : docs/TACHES_FRONTEND.md
// ============================================================================
function useCallAlert() {} // ⚠️ version provisoire : aucune alerte

/** Écran « C'est votre tour ! » affiché quand l'établissement appelle le ticket. */
export default function TicketCalledPage() {
  const { ticketId } = useParams()
  const { ticket, error, loading } = useTicketTracking(ticketId)
  useCallAlert(Boolean(ticket))

  return (
    <PageContent className={styles.page}>
      {loading && <Loader />}
      {error && (
        <InfoNote tone="error" icon={ICONS.warning}>
          {error.message}
        </InfoNote>
      )}

      {ticket && (
        <>
          <section className={styles.hero} aria-live="assertive">
            <span className={styles.bell}>
              <span className={styles.wave} />
              <span className={styles.wave} />
              <Icon name={ICONS.bell} size={36} />
            </span>
            <StatusBadge tone="called" icon={ICONS.campaign}>
              Vous êtes appelé
            </StatusBadge>
            <h1 className={styles.title}>C&apos;est votre tour !</h1>
            <div className={styles.number}>
              <span>Ticket</span>
              <TicketNumber number={ticket.number} size="xl" tone="inverse" />
            </div>
            {ticket.name && (
              <span className={styles.name}>
                <Icon name={ICONS.person} size={16} /> {ticket.name}
              </span>
            )}
            <p className={styles.instruction}>
              Présentez-vous dès maintenant au guichet de <strong>{ticket.establishment?.name}</strong> et indiquez votre numéro.
            </p>
          </section>

          <div className={styles.grid}>
            <Card className={styles.block}>
              <h2 className="text-h3">Au guichet</h2>
              <ul className={styles.checklist}>
                <li>
                  <Icon name={ICONS.walk} size={18} /> Rendez-vous directement à l’accueil, sans reprendre de ticket.
                </li>
                <li>
                  <Icon name={ICONS.ticket} size={18} /> Annoncez votre numéro et votre nom.
                </li>
                <li>
                  <Icon name={ICONS.list} size={18} /> Préparez vos documents ou ordonnances si nécessaire.
                </li>
              </ul>
              <InfoNote icon={ICONS.info}>
                Appelé à {formatTime(ticket.updatedAt)}. Cette page passera automatiquement au récapitulatif une fois votre passage terminé.
              </InfoNote>
              <Button variant="outline" fullWidth icon={ICONS.store} to={to.establishment(ticket.establishment?.id)}>
                Voir l’établissement
              </Button>
            </Card>

            {/* 🚧 FT-2 — Tâche 2.5 : remettre la carte « Progression » (voir docs/TACHES_FRONTEND.md) */}
          </div>
        </>
      )}
    </PageContent>
  )
}
