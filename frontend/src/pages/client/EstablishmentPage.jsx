import { Link, useParams } from 'react-router-dom'
import { PageContent } from '@/components/layout'
import { Button, Card, EmptyState, FavoriteButton, Icon, InfoNote, Loader, QueueStatusBadge, StatCard } from '@/components/ui'
import { EstablishmentVisual } from '@/components/establishment'
import { establishmentApi } from '@/services/api'
import { usePolling } from '@/hooks/usePolling'
import { useFavorites } from '@/hooks/useFavorites'
import { describeEstablishment, formatWait } from '@/constants/establishments'
import { ICONS } from '@/constants/icons'
import { getQueueStatusMeta, PAUSE_REASON, QUEUE_STATUS } from '@/constants/status'
import { PATHS, to } from '@/constants/routes'
import { formatPhone, formatTicketNumber, plural } from '@/utils/format'
import styles from './EstablishmentPage.module.css'

/** Message d'état de la file pour le bloc "Prendre un ticket". */
const STATUS_NOTE = {
  [QUEUE_STATUS.OPEN]: { tone: 'success', icon: ICONS.checkCircle, title: 'La file est ouverte' },
  [QUEUE_STATUS.PAUSED]: { tone: 'warning', icon: ICONS.pause, title: 'Nouveaux tickets temporairement suspendus' },
  [QUEUE_STATUS.CLOSED]: { tone: 'info', icon: ICONS.power, title: 'Prise de ticket indisponible' },
}

const VISIT_STEPS = [
  { icon: ICONS.ticket, text: 'Prenez votre ticket en indiquant votre nom et votre téléphone.' },
  { icon: ICONS.activity, text: 'Suivez votre position en direct, d’où vous voulez.' },
  { icon: ICONS.walk, text: 'Présentez-vous au guichet quand c’est votre tour.' },
]

/**
 * Page publique d'un établissement : état de la file, numéro appelé, nombre de personnes
 * en attente, attente estimée, horaires et adresse. Les chiffres se rechargent toutes les
 * 5 secondes ; le bouton "Prendre un ticket" n'est actif que si la file est ouverte.
 */
export default function EstablishmentPage() {
  const { establishmentId } = useParams()
  const { isFavorite, toggle } = useFavorites()
  const { data, error, loading } = usePolling((signal) => establishmentApi.get(establishmentId, { signal }), {
    deps: [establishmentId],
  })
  const establishment = data?.establishment
  const status = establishment?.queue_status ?? QUEUE_STATUS.CLOSED
  const info = describeEstablishment(establishment)
  const isOpen = status === QUEUE_STATUS.OPEN
  const isActive = status !== QUEUE_STATUS.CLOSED
  const pauseReason = establishment?.pause_reason
  const note =
    pauseReason === PAUSE_REASON.NEXT_DAY
      ? { tone: 'warning', icon: ICONS.calendar, title: 'File reportée à demain' }
      : STATUS_NOTE[status]
  const waiting = establishment?.waiting_count ?? 0

  return (
    <PageContent>
      <Link to={PATHS.establishments} className={styles.back}>
        <Icon name={ICONS.back} size={16} /> Tous les établissements
      </Link>

      {loading && <Loader />}
      {error && (
        <EmptyState
          icon={ICONS.searchOff}
          title={error.status === 404 ? 'Établissement introuvable' : 'Chargement impossible'}
          action={
            <Button icon={ICONS.back} to={PATHS.establishments}>
              Retour aux établissements
            </Button>
          }
        >
          {error.status === 404 ? 'Cet établissement n’existe pas ou n’est plus disponible.' : error.message}
        </EmptyState>
      )}

      {establishment && (
        <div className={styles.layout}>
          <section className={styles.header}>
            <EstablishmentVisual establishment={establishment} variant="banner" emblem={false} className={styles.banner}>
              <QueueStatusBadge status={status} pauseReason={pauseReason} className={styles.bannerBadge} />
            </EstablishmentVisual>
            <div className={styles.identity}>
              <EstablishmentVisual establishment={establishment} size={64} className={styles.avatar} />
              <div className={styles.identityText}>
                <span className={styles.category}>
                  <Icon name={info.category.icon} size={15} /> {info.category.label}
                </span>
                <h1 className="text-h1">{establishment.name}</h1>
                <p className={styles.location}>
                  <Icon name={ICONS.location} size={16} /> {[info.address, info.location].filter(Boolean).join(' · ')}
                </p>
              </div>
              <FavoriteButton variant="labeled" active={isFavorite(establishmentId)} name={establishment.name} onToggle={() => toggle(establishmentId)} className={styles.favorite} />
            </div>
          </section>

          <aside className={styles.aside}>
            <Card variant="elevated" padding="md" className={styles.cta}>
              <div className={styles.ctaHead}>
                <h2 className="text-h3">Prendre un ticket</h2>
                <QueueStatusBadge status={status} pauseReason={pauseReason} short size="sm" />
              </div>
              <InfoNote tone={note.tone} icon={note.icon} title={note.title}>
                {isOpen
                  ? waiting > 0
                    ? `${plural(waiting, 'personne')} ${waiting > 1 ? 'attendent' : 'attend'} actuellement. Attente estimée : ${formatWait(info.waitMinutes, info.serviceMinutes)}.`
                    : 'Personne n’attend : vous serez le prochain à être servi.'
                  : getQueueStatusMeta(status, pauseReason).description}
              </InfoNote>
              <Button size="lg" fullWidth icon={ICONS.ticket} to={to.joinQueue(establishmentId)} disabled={!isOpen}>
                Prendre un ticket
              </Button>
              <p className={styles.ctaFoot}>
                <Icon name={ICONS.shield} size={15} /> Sans compte · nom et téléphone uniquement
              </p>
            </Card>
          </aside>

          <section className={`${styles.block} ${styles.state}`} aria-labelledby="etat-file">
            <div className={styles.blockHead}>
              <h2 id="etat-file" className="text-h3">
                État de la file
              </h2>
              <span className={styles.live}>
                <span className={styles.liveDot} /> En direct
              </span>
            </div>
            <div className={styles.stats}>
              <StatCard tone="primary" label="Numéro appelé" value={isActive ? formatTicketNumber(establishment.current_number) : '—'} caption="au guichet" icon={ICONS.campaign} />
              <StatCard label="En attente" value={isActive ? waiting : '—'} caption={waiting > 1 ? 'personnes' : 'personne'} icon={ICONS.groups} />
              <StatCard tone="accent" label="Temps estimé" value={isActive ? formatWait(info.waitMinutes, info.serviceMinutes) : '—'} caption="pour un nouveau ticket" icon={ICONS.timer} />
            </div>
          </section>

          <div className={styles.details}>
            <Card className={styles.block}>
              <h2 className="text-h3">À propos</h2>
              <p className="text-muted">
                {info.description ??
                  `${establishment.name} utilise Ma Place pour gérer son accueil : prenez votre ticket à distance et présentez-vous lorsque votre tour arrive.`}
              </p>
              <ul className={styles.facts}>
                <li>
                  <Icon name={ICONS.schedule} size={18} />
                  <span>
                    <strong>Horaires</strong>
                    {info.hours ?? 'Communiqués par l’établissement'}
                  </span>
                </li>
                <li>
                  <Icon name={ICONS.location} size={18} />
                  <span>
                    <strong>Adresse</strong>
                    {[info.address, info.location].filter(Boolean).join(', ')}
                  </span>
                </li>
                {establishment.phone && (
                  <li>
                    <Icon name={ICONS.phone} size={18} />
                    <span>
                      <strong>Téléphone</strong>
                      <a href={`tel:${establishment.phone}`}>{formatPhone(establishment.phone)}</a>
                    </span>
                  </li>
                )}
              </ul>
            </Card>

            <Card variant="tinted" className={styles.block}>
              <h2 className="text-h3">Comment se passe votre visite ?</h2>
              <ol className={styles.visit}>
                {VISIT_STEPS.map((step, i) => (
                  <li key={step.text}>
                    <span className={styles.visitIcon}>
                      <Icon name={step.icon} size={18} />
                    </span>
                    <span>
                      <strong>Étape {i + 1}</strong>
                      {step.text}
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </div>
      )}
    </PageContent>
  )
}
