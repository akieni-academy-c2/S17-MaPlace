import { useParams } from 'react-router-dom'
import { AppHeader, PageContent } from '@/components/layout'
import { Button, Card, Icon, InfoNote, Loader, QueueStatusBadge, TicketNumber } from '@/components/ui'
import { getEstablishment } from '@/services/establishmentService'
import { usePolling } from '@/hooks/usePolling'
import { useFavorites } from '@/hooks/useFavorites'
import { ICONS } from '@/constants/icons'
import { QUEUE_STATUS } from '@/constants/status'
import { PATHS, to } from '@/constants/routes'
import styles from './EstablishmentPage.module.css'

/** Client 2/6 — Fiche d'un établissement (GET /api/establishments/:id). */
export default function EstablishmentPage() {
  const { establishmentId } = useParams()
  const { isFavorite, toggle } = useFavorites()
  const { data, error, loading } = usePolling((signal) => getEstablishment(establishmentId, { signal }), {
    deps: [establishmentId],
  })
  const establishment = data?.establishment
  const status = establishment?.queue_status ?? QUEUE_STATUS.CLOSED
  const favorite = isFavorite(establishmentId)

  return (
    <>
      <AppHeader title="Détails du lieu" backTo={PATHS.home} />
      <PageContent>
        <div className={styles.toolbar}>
          <Button variant="ghost" size="sm" icon={ICONS.back} to={`${PATHS.home}#etablissements`} className={styles.backLink}>
            Retour aux établissements
          </Button>
          <Button variant="secondary" size="sm" icon={ICONS.star} onClick={() => toggle(establishmentId)} aria-pressed={favorite}>
            {favorite ? 'Favori' : 'Ajouter aux favoris'}
          </Button>
        </div>

        {loading && <Loader />}
        {error && (
          <InfoNote tone="error" icon={ICONS.warning}>
            {error.status === 404 ? "Cet établissement n'existe pas." : error.message}
          </InfoNote>
        )}

        {establishment && (
          <Card padding="lg" className="stack" style={{ '--stack-gap': 'var(--space-lg)' }}>
            <div className={styles.head}>
              {establishment.category && <span className="text-overline">{establishment.category}</span>}
              <QueueStatusBadge status={status} className={styles.badge} />
            </div>
            <h2 className={styles.name}>{establishment.name}</h2>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>
                  <Icon name={ICONS.campaign} size={20} /> Actuellement appelé
                </span>
                <TicketNumber number={establishment.current_number} size="lg" />
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>
                  <Icon name={ICONS.groups} size={20} /> En attente
                </span>
                <span className={styles.waiting}>
                  <strong>{establishment.waiting_count ?? '—'}</strong> personnes
                </span>
              </div>
            </div>

            <hr className={styles.divider} />

            <Button
              size="lg"
              fullWidth
              icon={ICONS.ticket}
              to={to.joinQueue(establishmentId)}
              disabled={status !== QUEUE_STATUS.OPEN}
              aria-disabled={status !== QUEUE_STATUS.OPEN}
              className={status !== QUEUE_STATUS.OPEN ? styles.disabledLink : ''}
            >
              Rejoindre la file d&apos;attente
            </Button>
            {status !== QUEUE_STATUS.OPEN && (
              <InfoNote tone="warning" icon={ICONS.pause}>
                La file n&apos;accepte pas de nouveaux tickets pour le moment.
              </InfoNote>
            )}
            <InfoNote tone="plain" icon={ICONS.shield}>
              Aucun compte nécessaire. Vous renseignerez simplement votre prénom et numéro de téléphone.
            </InfoNote>
          </Card>
        )}
      </PageContent>
    </>
  )
}
