import { ICONS } from '@/constants/icons'
import { Icon } from './Icon'
import styles from './SearchBar.module.css'

/**
 * Champ de recherche. Avec `onSubmit`, il devient un formulaire avec bouton de validation
 * (zone d'accès rapide de l'accueil) ; sinon il filtre en direct via `onChange`.
 */
export function SearchBar({ value, onChange, onSubmit, placeholder = 'Rechercher…', label = 'Rechercher', id, className = '' }) {
  const field = (
    <>
      <Icon name={ICONS.search} size={20} className={styles.icon} />
      <span className="sr-only">{label}</span>
      <input
        id={id}
        type="search"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        enterKeyHint="search"
      />
    </>
  )

  if (onSubmit) {
    return (
      <form
        role="search"
        className={`${styles.search} ${className}`}
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(value)
        }}
      >
        <label className="cluster" style={{ flex: 1, minWidth: 0, flexWrap: 'nowrap' }}>
          {field}
        </label>
        <button type="submit" className={styles.submit} aria-label="Lancer la recherche">
          <Icon name={ICONS.forward} size={20} />
        </button>
      </form>
    )
  }

  return <label className={`${styles.search} ${className}`}>{field}</label>
}
