import styles from './TicketCard.module.css'

/**
 * Carte « ticket » avec séparateur pointillé et encoches latérales (métaphore du ticket papier).
 * header : bandeau vert supérieur · children : partie principale · footer : partie détachable
 * Les encoches prennent la couleur `--notch-bg` (fond de la page, blanc par défaut).
 */
export function TicketCard({ header, children, footer, className = '' }) {
  return (
    <section className={`${styles.ticket} ${className}`}>
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.body}>{children}</div>
      {footer && (
        <>
          <div className={styles.perforation} aria-hidden="true" />
          <div className={styles.footer}>{footer}</div>
        </>
      )}
    </section>
  )
}
