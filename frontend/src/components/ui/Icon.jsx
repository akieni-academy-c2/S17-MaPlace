import styles from './Icon.module.css'

/**
 * Icône Material Symbols Outlined (police variable auto-hébergée via `material-symbols`).
 * @param {string}  name    nom Material (utiliser ICONS.* de '@/constants/icons')
 * @param {number}  size    taille en px (défaut 24)
 * @param {boolean} filled  variante pleine (axe FILL)
 * @param {number}  weight  graisse 100–700
 */
export function Icon({ name, size = 24, filled = false, weight = 400, className = '', label, ...rest }) {
  return (
    <span
      className={`material-symbols-outlined ${styles.icon} ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${Math.min(48, Math.max(20, size))}`,
      }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      {...rest}
    >
      {name}
    </span>
  )
}
