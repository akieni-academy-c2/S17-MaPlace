import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import styles from './Button.module.css'

/**
 * Bouton du design system.
 * variant : primary | secondary | success | danger | danger-soft | ghost | inverse
 * size    : sm | md | lg
 * `to` → rendu en <Link>, `href` → <a>
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

  const iconSize = size === 'lg' ? 24 : size === 'sm' ? 18 : 20
  const content = (
    <>
      {loading ? (
        <Icon name="progress_activity" size={iconSize} className={styles.spinner} />
      ) : (
        icon && <Icon name={icon} size={iconSize} />
      )}
      {children && <span>{children}</span>}
      {iconRight && !loading && <Icon name={iconRight} size={iconSize} />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }
  if (href) {
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
