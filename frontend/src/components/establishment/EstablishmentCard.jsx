import { Link } from 'react-router-dom'
import { Button, FavoriteButton, Icon, QueueStatusBadge } from '@/components/ui'
import { describeEstablishment, formatWait } from '@/constants/establishments'
import { ICONS } from '@/constants/icons'
import { QUEUE_STATUS } from '@/constants/status'
import { to } from '@/constants/routes'
import { formatTicketNumber } from '@/utils/format'
import { EstablishmentVisual } from './EstablishmentVisual'
import styles from './EstablishmentCard.module.css'

/** Carte d'un établissement : visuel, catégorie, localisation, état de la file et action. */
export function EstablishmentCard({ establishment, isFavorite, onToggleFavorite }) {
  const { id, name, queue_status: rawStatus, current_number: current, waiting_count: waiting } = establishment
  const status = rawStatus ?? QUEUE_STATUS.CLOSED
  const info = describeEstablishment(establishment)
  const isOpen = status === QUEUE_STATUS.OPEN
  const isActive = status !== QUEUE_STATUS.CLOSED

  return (
    <article className={styles.card}>
      <EstablishmentVisual establishment={establishment} variant="banner">
        <QueueStatusBadge status={status} pauseReason={establishment.pause_reason} short className={styles.status} />
        <FavoriteButton active={isFavorite} name={name} onToggle={() => onToggleFavorite(id)} className={styles.favorite} />
      </EstablishmentVisual>

      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.name}>
            <Link to={to.establishment(id)} className={styles.link}>
              {name}
            </Link>
          </h3>
          <p className={styles.meta}>
            <Icon name={info.category.icon} size={15} /> {info.category.label}
          </p>
          <p className={styles.meta}>
            <Icon name={ICONS.location} size={15} /> {info.location}
          </p>
        </div>

        <dl className={styles.stats}>
          <div>
            <dt>Appelé</dt>
            <dd className={styles.current}>{isActive ? formatTicketNumber(current) : '—'}</dd>
          </div>
          <div>
            <dt>En attente</dt>
            <dd>
              {isActive ? waiting ?? 0 : '—'}
              {isActive && <small> pers.</small>}
            </dd>
          </div>
          <div>
            <dt>Estimation</dt>
            <dd>{isActive ? formatWait(info.waitMinutes, info.serviceMinutes) : '—'}</dd>
          </div>
        </dl>

        {/* Toujours vers la fiche : le client consulte l'état de la file avant le formulaire */}
        <div className={styles.actions}>
          <Button variant={isOpen ? 'primary' : 'outline'} fullWidth iconRight={ICONS.forward} to={to.establishment(id)}>
            {isOpen ? 'Prendre un ticket' : 'Voir la file'}
          </Button>
        </div>
      </div>
    </article>
  )
}
