import styles from './FilterChips.module.css'

/** Groupe de filtres exclusifs. options = [{ value, label, dot? }] */
export function FilterChips({ options, value, onChange, label = 'Filtres' }) {
  return (
    <div className={styles.chips} role="radiogroup" aria-label={label}>
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
          {opt.label}
        </button>
      ))}
    </div>
  )
}
