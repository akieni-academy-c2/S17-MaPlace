import { Icon } from './Icon'
import styles from './SegmentedControl.module.css'

/** Contrôle segmenté (ex. Terminé / Annulé). options = [{ value, label, icon? }] */
export function SegmentedControl({ options, value, onChange, label }) {
  return (
    <div className={styles.segmented} role="tablist" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={`${styles.segment} ${value === opt.value ? styles.active : ''}`}
          onClick={() => onChange?.(opt.value)}
        >
          {opt.icon && <Icon name={opt.icon} size={20} />}
          {opt.label}
        </button>
      ))}
    </div>
  )
}
