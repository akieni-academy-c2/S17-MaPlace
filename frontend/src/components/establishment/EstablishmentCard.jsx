import { Button, Icon, QueueStatusBadge } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { QUEUE_STATUS } from '@/constants/status'
import { to } from '@/constants/routes'
import styles from './EstablishmentCard.module.css'

/** Carte d'un établissement dans la liste de l'accueil. */
export function EstablishmentCard({ establishment, isFavorite, onToggleFavorite }) {
  const { id, name, queue_status: status } = establishment
  const isOpen = status === QUEUE_STATUS.OPEN

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <div className={styles.info}>
          <h3 className={styles.name}>{name}</h3>
          <QueueStatusBadge status={status ?? QUEUE_STATUS.CLOSED} />
        </div>
        <button
          type="button"
          className={`${styles.favorite} ${isFavorite ? styles.isFavorite : ''}`}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          onClick={() => onToggleFavorite(id)}
        >
          <Icon name={ICONS.star} filled={isFavorite} />
        </button>
      </div>
      <Button variant={isOpen ? 'primary' : 'secondary'} fullWidth to={isOpen ? to.joinQueue(id) : to.establishment(id)}>
        {isOpen ? 'Rejoindre la file' : 'Consulter'}
      </Button>
    </article>
  )
}
