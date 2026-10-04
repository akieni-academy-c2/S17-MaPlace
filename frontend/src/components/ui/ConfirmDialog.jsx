import { useEffect, useId, useRef } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'
import styles from './ConfirmDialog.module.css'

/**
 * Modale de confirmation (élément natif <dialog> : focus piégé, Échap, fond assombri).
 * tone : primary | danger — couleur de l'icône et du bouton de confirmation.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  icon,
  tone = 'primary',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  confirmIcon,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${styles[tone]}`}
      aria-labelledby={titleId}
      aria-describedby={children ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault()
        if (!loading) onCancel?.()
      }}
      onClick={(e) => {
        // Clic sur le fond (hors du panneau) = annuler
        if (e.target === e.currentTarget && !loading) onCancel?.()
      }}
    >
      <div className={styles.panel}>
        {icon && (
          <span className={styles.iconBox}>
            <Icon name={icon} size={28} />
          </span>
        )}
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {children && (
          <div id={descId} className={styles.text}>
            {children}
          </div>
        )}
        <div className={styles.actions}>
          <Button variant="outline" fullWidth onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            fullWidth
            icon={confirmIcon}
            loading={loading}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
