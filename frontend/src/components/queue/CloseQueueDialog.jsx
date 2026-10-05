import { useEffect, useId, useRef } from 'react'
import { Button, Icon } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { POSTPONE_THRESHOLD } from '@/constants/status'
import { plural } from '@/utils/format'
import styles from './CloseQueueDialog.module.css'

/**
 * Fin de journée : fermer la file (tickets en attente annulés, numérotation remise à #1)
 * ou la reporter au lendemain (pause, numéros conservés). Le report est mis en avant
 * dès que POSTPONE_THRESHOLD tickets attendent encore.
 */
export function CloseQueueDialog({ open, waitingCount = 0, loading = false, onCloseQueue, onPostpone, onCancel }) {
  const ref = useRef(null)
  const titleId = useId()
  const descId = useId()
  const hasWaiting = waitingCount > 0
  const recommendPostpone = waitingCount >= POSTPONE_THRESHOLD

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const closeButton = (
    <Button
      variant={recommendPostpone ? 'danger-soft' : 'danger'}
      fullWidth
      icon={ICONS.power}
      loading={loading === 'close'}
      disabled={Boolean(loading)}
      onClick={onCloseQueue}
      autoFocus={!recommendPostpone}
    >
      {hasWaiting ? `Fermer et annuler ${plural(waitingCount, 'ticket')}` : 'Fermer la file'}
    </Button>
  )

  const postponeButton = hasWaiting && (
    <Button
      variant={recommendPostpone ? 'primary' : 'outline'}
      fullWidth
      icon={ICONS.calendar}
      loading={loading === 'postpone'}
      disabled={Boolean(loading)}
      onClick={onPostpone}
      autoFocus={recommendPostpone}
    >
      Reporter à demain
    </Button>
  )

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(e) => {
        e.preventDefault()
        if (!loading) onCancel?.()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel?.()
      }}
    >
      <div className={styles.panel}>
        <span className={`${styles.iconBox} ${hasWaiting ? styles.warn : ''}`}>
          <Icon name={hasWaiting ? ICONS.groups : ICONS.power} size={28} />
        </span>
        <h2 id={titleId} className={styles.title}>
          {hasWaiting ? `${plural(waitingCount, 'client encore', 'clients encore')} en attente` : 'Fermer la file ?'}
        </h2>
        <div id={descId} className={styles.text}>
          {hasWaiting ? (
            <>
              <p>Que souhaitez-vous faire de ces tickets pour la fin de journée ?</p>
              <ul className={styles.options}>
                <li className={recommendPostpone ? styles.recommended : ''}>
                  <Icon name={ICONS.calendar} size={18} />
                  <span>
                    <strong>
                      Reporter à demain
                      {recommendPostpone && <span className={styles.tag}>Recommandé</span>}
                    </strong>
                    La file est mise en pause et les clients sont invités à revenir demain. Ils gardent leur numéro : vous reprendrez
                    là où vous vous êtes arrêté.
                  </span>
                </li>
                <li>
                  <Icon name={ICONS.power} size={18} />
                  <span>
                    <strong>Fermer la file</strong>
                    Les tickets en attente sont annulés et la numérotation repartira de #1 à la prochaine ouverture.
                  </span>
                </li>
              </ul>
            </>
          ) : (
            <p>La session sera terminée pour aujourd’hui et la numérotation repartira de #1 à la prochaine ouverture.</p>
          )}
        </div>
        <div className={styles.actions}>
          {recommendPostpone ? (
            <>
              {postponeButton}
              {closeButton}
            </>
          ) : (
            <>
              {closeButton}
              {postponeButton}
            </>
          )}
          <Button variant="ghost" fullWidth onClick={onCancel} disabled={Boolean(loading)}>
            Annuler
          </Button>
        </div>
      </div>
    </dialog>
  )
}
