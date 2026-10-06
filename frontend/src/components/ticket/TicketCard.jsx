import styles from './TicketCard.module.css'

/** Carte en forme de ticket papier. `tone` : waiting | near | approaching | soon. */
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
