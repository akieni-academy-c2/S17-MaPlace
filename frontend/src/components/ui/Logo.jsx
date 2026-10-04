import logoUrl from '@/assets/logo.png'
import styles from './Logo.module.css'

/** Dimensions de logo.png et zones utiles (le fichier comporte de larges marges transparentes). */
const SOURCE = { width: 2000, height: 932 }
const CROPS = {
  full: { x: 298, y: 218, width: 1392, height: 496 }, // pictogramme + « maPlace »
  mark: { x: 298, y: 218, width: 391, height: 496 }, // pictogramme seul
}
const WORDMARK_TEXT_X = 793

/**
 * Affiche une zone de logo.png à la hauteur voulue. Le PNG sert de masque :
 * la couleur vient de `currentColor`, ce qui permet de suivre la charte sans modifier le fichier.
 */
function LogoImage({ height, crop }) {
  const scale = height / crop.height
  return (
    <span
      className={styles.mark}
      role="img"
      aria-label="Ma Place"
      style={{
        width: Math.round(crop.width * scale),
        height,
        '--logo-url': `url(${logoUrl})`,
        '--logo-size': `${Math.round(SOURCE.width * scale)}px ${Math.round(SOURCE.height * scale)}px`,
        '--logo-position': `${-crop.x * scale}px ${-crop.y * scale}px`,
      }}
    />
  )
}

/**
 * Logo Ma Place (le nom est inclus dans l'image) + sous-titre optionnel (« File d'attente en ligne », « Espace pro »…).
 * - showText : logotype complet ; sinon pictogramme seul
 * - size     : hauteur de référence en px
 * - tone     : brand (vert) | white (sur fond vert)
 */
export function Logo({ size = 40, subtitle, showText = true, tone = 'brand' }) {
  const className = `${styles.logo} ${styles[tone]}`

  if (!showText) {
    return (
      <span className={className}>
        <LogoImage height={size} crop={CROPS.mark} />
      </span>
    )
  }

  const height = Math.round(size * (subtitle ? 0.85 : 0.95))
  // Le sous-titre s'aligne sous le mot « maPlace », pas sous le pictogramme
  const textOffset = Math.round((WORDMARK_TEXT_X - CROPS.full.x) * (height / CROPS.full.height))

  return (
    <span className={className}>
      <LogoImage height={height} crop={CROPS.full} />
      {subtitle && (
        <span className={styles.subtitle} style={{ paddingLeft: textOffset }}>
          {subtitle}
        </span>
      )}
    </span>
  )
}
