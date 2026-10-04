import { Icon } from '@/components/ui'
import { inferCategory, initials } from '@/constants/establishments'
import styles from './EstablishmentVisual.module.css'

/**
 * Visuel d'un établissement, sans dépendance à une photo : couleur de catégorie, motif,
 * icône et initiales. Si l'API fournit un jour `image_url`, il est utilisé en fond.
 * variant : banner (haut de carte / page détail) | avatar (carré). `emblem` : icône sur la bannière.
 */
export function EstablishmentVisual({ establishment, variant = 'avatar', size = 48, emblem = true, className = '', children }) {
  const category = inferCategory(establishment)
  const accent = category.accent === 'orange' ? styles.orange : styles.green
  const image = establishment?.image_url

  if (variant === 'avatar') {
    return (
      <span className={`${styles.avatar} ${accent} ${className}`} style={{ width: size, height: size }} aria-hidden="true">
        <Icon name={category.icon} size={Math.round(size * 0.46)} />
      </span>
    )
  }

  return (
    <div
      className={`${styles.banner} ${accent} ${image ? styles.withImage : ''} ${className}`}
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    >
      {!image && (
        <>
          <span className={styles.pattern} aria-hidden="true" />
          <span className={styles.initials} aria-hidden="true">
            {initials(establishment?.name)}
          </span>
          {emblem && (
            <span className={styles.emblem} aria-hidden="true">
              <Icon name={category.icon} size={26} />
            </span>
          )}
        </>
      )}
      {children}
    </div>
  )
}
