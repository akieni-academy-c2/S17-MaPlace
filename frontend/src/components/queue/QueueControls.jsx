import { Button, Icon, QueueStatusBadge } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { QUEUE_STATUS, QUEUE_STATUS_META } from '@/constants/status'
import styles from './QueueControls.module.css'

const STATUS_ICON = {
  [QUEUE_STATUS.OPEN]: ICONS.play,
  [QUEUE_STATUS.PAUSED]: ICONS.pause,
  [QUEUE_STATUS.CLOSED]: ICONS.power,
}

/** État de la file + transitions autorisées (open / pause / resume / close). */
export function QueueControls({ status = QUEUE_STATUS.CLOSED, busy, onOpen, onPause, onResume, onClose }) {
  const isActive = status === QUEUE_STATUS.OPEN || status === QUEUE_STATUS.PAUSED
  const meta = QUEUE_STATUS_META[status] ?? QUEUE_STATUS_META.CLOSED

  return (
    <section className={`${styles.controls} ${styles[meta.tone]}`} aria-label="État de la file">
      <div className={styles.state}>
        <span className={styles.icon}>
          <Icon name={STATUS_ICON[status]} size={22} />
        </span>
        <div className={styles.text}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>État de la file</h2>
            <QueueStatusBadge status={status} />
          </div>
          <p className={styles.description}>{meta.description}</p>
        </div>
      </div>
      <div className={styles.actions}>
        {status === QUEUE_STATUS.OPEN && (
          <Button variant="outline" icon={ICONS.pause} onClick={onPause} disabled={busy}>
            Mettre en pause
          </Button>
        )}
        {status === QUEUE_STATUS.PAUSED && (
          <Button icon={ICONS.play} onClick={onResume} disabled={busy}>
            Reprendre la file
          </Button>
        )}
        {isActive ? (
          <Button variant="danger-soft" icon={ICONS.power} onClick={onClose} disabled={busy}>
            Fermer la file
          </Button>
        ) : (
          <Button icon={ICONS.play} onClick={onOpen} disabled={busy} loading={busy}>
            Ouvrir la file
          </Button>
        )}
      </div>
    </section>
  )
}
