import { useId } from 'react'
import { Icon } from './Icon'
import styles from './TextField.module.css'

/**
 * Champ de saisie avec label, icône, aide et erreur. `trailing` = élément à droite (ex. œil mot de passe).
 * `required` : affiche un astérisque à côté du label.
 */
export function TextField({ label, icon, hint, error, aside, trailing, id, required = false, className = '', ...inputProps }) {
  const autoId = useId()
  const inputId = id ?? autoId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className={`${styles.field} ${className}`}>
      {(label || aside) && (
        <div className={styles.labelRow}>
          {label && (
            <label htmlFor={inputId} className={styles.label}>
              {label}
              {required && (
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
          {aside}
        </div>
      )}
      <div className={`${styles.control} ${error ? styles.invalid : ''}`}>
        {icon && <Icon name={icon} size={22} className={styles.icon} />}
        <input id={inputId} className={styles.input} required={required} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...inputProps} />
        {trailing}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className={styles.error}>
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}
