import styles from './ProPageHeader.module.css'

/** En-tête des pages gestionnaire : fil d'Ariane, titre, sous-titre et actions. */
export function ProPageHeader({ breadcrumb, title, subtitle, actions }) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        <span className={styles.breadcrumb}>{breadcrumb}</span>
        <h1 className="text-h1">{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}
