import styles from './Card.module.css'

/**
 * Conteneur de contenu.
 * variant : default (blanc + bordure légère) | elevated (ombre douce) | tinted (surface menthe) | outlined
 * padding : none | sm | md | lg
 */
export function Card({ as: Tag = 'div', variant = 'default', padding = 'md', className = '', children, ...rest }) {
  return (
    <Tag className={`${styles.card} ${styles[variant]} ${styles[`pad-${padding}`]} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
