import { Icon } from './Icon'
import styles from './FilterChips.module.css'

/** Groupe de filtres exclusifs (défile horizontalement sur mobile). options = [{ value, label, dot?, icon?, count? }] */
export function FilterChips({ options, value, onChange, label = 'Filtres', className = '' }) {
  return (
    <div className={`${styles.chips} ${className}`} role="radiogroup" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          className={`${styles.chip} ${value === opt.value ? styles.active : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.dot && <span className={styles.dot} style={{ background: opt.dot }} />}
          {opt.icon && <Icon name={opt.icon} size={16} />}
          {opt.label}
          {opt.count != null && <span className={styles.count}>{opt.count}</span>}
        </button>
      ))}
    </div>
  )
}
