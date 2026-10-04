import { ICONS } from '@/constants/icons'
import { Icon } from './Icon'
import styles from './FavoriteButton.module.css'

/**
 * Cœur favori.
 * variant : icon (rond, posé sur un visuel) | labeled (bouton avec libellé, page détail)
 */
export function FavoriteButton({ active, onToggle, name, variant = 'icon', className = '' }) {
  const label = active ? `Retirer ${name ?? 'cet établissement'} des favoris` : `Ajouter ${name ?? 'cet établissement'} aux favoris`

  return (
    <button
      type="button"
      className={`${styles.favorite} ${styles[variant]} ${active ? styles.active : ''} ${className}`}
      aria-pressed={active}
      aria-label={variant === 'icon' ? label : undefined}
      title={label}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
    >
      <Icon name={ICONS.heart} size={18} filled={active} />
      {variant === 'labeled' && <span>{active ? 'Dans mes favoris' : 'Ajouter aux favoris'}</span>}
    </button>
  )
}
