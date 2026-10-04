import { Icon } from './Icon'
import styles from './IconButton.module.css'

/** Bouton rond icône seule (menu, recherche, déconnexion…). variant : ghost | filled | tonal | outline. `label` obligatoire pour l'accessibilité. */
export function IconButton({ icon, label, variant = 'ghost', size = 40, className = '', ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`${styles.iconButton} ${styles[variant]} ${className}`}
      style={{ width: size, height: size }}
      {...rest}
    >
      <Icon name={icon} size={Math.round(size * 0.55)} />
    </button>
  )
}
