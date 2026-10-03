import { ICONS } from '@/constants/icons'
import styles from './Icon.module.css'

/**
 * Icône Lucide (SVG, tree-shaké).
 * @param {import('react').ComponentType|string} name  composant Lucide (ICONS.*) ou clé de ICONS
 * @param {number}  size    taille en px (défaut 24)
 * @param {boolean} filled  remplit la forme (étoile favorite, onglet actif…)
 * @param {number}  weight  graisse 100–700, convertie en épaisseur de trait
 */
export function Icon({ name, size = 24, filled = false, weight = 400, className = '', label, ...rest }) {
  const Component = typeof name === 'string' ? ICONS[name] : name
  if (!Component) return null

  return (
    <Component
      size={size}
      strokeWidth={weight >= 600 ? 2.5 : weight <= 300 ? 1.5 : 2}
      fill={filled ? 'currentColor' : 'none'}
      className={`${styles.icon} ${className}`}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable="false"
      {...rest}
    />
  )
}
