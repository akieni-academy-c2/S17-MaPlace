import logoUrl from '@/assets/logo.png'
import styles from './Logo.module.css'

/** Dimensions de logo.png et zones utiles (le fichier comporte de larges marges transparentes). */
const SOURCE = { width: 2000, height: 932 }
const CROPS = {
  full: { x: 298, y: 218, width: 1392, height: 496 }, // pictogramme + « maPlace »
  mark: { x: 298, y: 218, width: 391, height: 496 }, // pictogramme seul
}
const WORDMARK_TEXT_X = 793

/** Affiche une zone de logo.png à la hauteur voulue, sans modifier le fichier source. */
function LogoImage({ height, crop, alt, white }) {
  const scale = height / crop.height
  return (
    <span className={styles.crop} style={{ width: Math.round(crop.width * scale), height }}>
      <img
        src={logoUrl}
        alt={alt}
        width={Math.round(SOURCE.width * scale)}
        height={Math.round(SOURCE.height * scale)}
        className={`${styles.image} ${white ? styles.white : ''}`}
        style={{ marginLeft: -crop.x * scale, marginTop: -crop.y * scale }}
      />
    </span>
  )
}

/**
 * Logo Ma Place (le nom est inclus dans l'image) + sous-titre optionnel (« MON TICKET », « ESPACE PRO »…).
 * - showText : logotype complet ; sinon pictogramme seul
 * - size     : hauteur du pictogramme en px
 * - tone     : brand (bleu) | white (sur fond coloré)
 */
export function Logo({ size = 40, subtitle, showText = true, tone = 'brand' }) {
  const white = tone === 'white'

  if (!showText) {
    return <LogoImage height={size} crop={CROPS.mark} alt="Ma Place" white={white} />
  }

  const height = Math.round(size * (subtitle ? 0.85 : 0.95))
  // Le sous-titre s'aligne sous le mot « maPlace », pas sous le pictogramme
  const textOffset = Math.round((WORDMARK_TEXT_X - CROPS.full.x) * (height / CROPS.full.height))

  return (
    <span className={styles.logo}>
      <LogoImage height={height} crop={CROPS.full} alt="Ma Place" white={white} />
      {subtitle && (
        <span className={styles.subtitle} style={{ paddingLeft: textOffset }}>
          {subtitle}
        </span>
      )}
    </span>
  )
}
