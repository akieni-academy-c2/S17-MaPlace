import { Button, QueueStatusBadge } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { QUEUE_STATUS } from '@/constants/status'
import styles from './QueueControls.module.css'

/** Statut de la file + transitions autorisées (open / pause / resume / close). */
export function QueueControls({ status, busy, onOpen, onPause, onResume, onClose }) {
  const isActive = status === QUEUE_STATUS.OPEN || status === QUEUE_STATUS.PAUSED

  return (
    <div className={styles.controls}>
      <QueueStatusBadge status={status ?? QUEUE_STATUS.CLOSED} />
      <div className={styles.actions}>
        {status === QUEUE_STATUS.OPEN && (
          <Button variant="secondary" size="sm" icon={ICONS.pause} onClick={onPause} disabled={busy}>
            Mettre en pause
          </Button>
        )}
        {status === QUEUE_STATUS.PAUSED && (
          <Button variant="secondary" size="sm" icon={ICONS.play} onClick={onResume} disabled={busy}>
            Reprendre
          </Button>
        )}
        {isActive ? (
          <Button variant="danger-soft" size="sm" icon={ICONS.cancel} onClick={onClose} disabled={busy}>
            Fermer la file
          </Button>
        ) : (
          <Button variant="primary" size="sm" icon={ICONS.play} onClick={onOpen} disabled={busy}>
            Ouvrir la file
          </Button>
        )}
      </div>
    </div>
  )
}
