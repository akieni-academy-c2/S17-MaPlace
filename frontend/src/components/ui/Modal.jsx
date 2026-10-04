import { useEffect, useId, useRef } from 'react'
import { ICONS } from '@/constants/icons'
import { IconButton } from './IconButton'
import styles from './Modal.module.css'

/** Fenêtre modale (élément natif <dialog> : focus piégé, Échap, fond assombri). */
export function Modal({ open, title, description, onClose, children, closeDisabled = false }) {
  const ref = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        if (!closeDisabled) onClose?.()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !closeDisabled) onClose?.()
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description && <p className={styles.description}>{description}</p>}
          </div>
          <IconButton icon={ICONS.close} label="Fermer" size={40} onClick={onClose} disabled={closeDisabled} />
        </header>
        {open && children}
      </div>
    </dialog>
  )
}
