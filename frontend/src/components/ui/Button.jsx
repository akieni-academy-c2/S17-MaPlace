import { ICONS } from '@/constants/icons'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import styles from './Button.module.css'

/**
 * Bouton du design system.
 * variant : primary (vert, action principale) | secondary (orange, action secondaire / attention)
 *           | outline | ghost | danger | soft (vert pâle) | danger-soft | inverse (blanc sur fond vert)
 * size    : sm | md | lg
 * `to` → rendu en <Link>, `href` → <a>. Un lien `disabled` est rendu comme un bouton désactivé.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  loading = false,
  disabled = false,
  to,
  href,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const iconSize = size === 'lg' ? 20 : 18
  const content = (
    <>
      {loading ? (
        <Icon name={ICONS.spinner} size={iconSize} className={styles.spinner} />
      ) : (
        icon && <Icon name={icon} size={iconSize} />
      )}
      {children && <span className={styles.label}>{children}</span>}
      {iconRight && !loading && <Icon name={iconRight} size={iconSize} />}
    </>
  )

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }
  if (href && !disabled) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    )
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  )
}
