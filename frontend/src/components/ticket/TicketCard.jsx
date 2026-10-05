import styles from './TicketCard.module.css'

/**
 * Carte « ticket » avec séparateur pointillé et encoches latérales (métaphore du ticket papier).
 * header : bandeau vert supérieur · children : partie principale · footer : partie détachable
 * Les encoches prennent la couleur `--notch-bg` (fond de la page, blanc par défaut).
 * tone : couleur d'alerte selon la position dans la file — waiting (au-delà de 15) | near (jaune, 15–11)
 *        | approaching (orange, 10–6) | soon (rouge, 5–1)
 */
export function TicketCard({ header, children, footer, tone = 'waiting', className = '' }) {
  return (
    <section className={`${styles.ticket} ${styles[tone] ?? ''} ${className}`}>
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
