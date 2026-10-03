import { ICONS } from '@/constants/icons'
import { Icon } from './Icon'
import styles from './SearchBar.module.css'

export function SearchBar({ value, onChange, placeholder = 'Rechercher…', label = 'Rechercher' }) {
  return (
    <label className={styles.search}>
      <Icon name={ICONS.search} size={22} className={styles.icon} />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}
