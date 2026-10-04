import styles from './SectionHeader.module.css'

/**
 * Titre de section : eyebrow optionnel, titre (avec accent orange décoratif) et texte.
 * `action` s'aligne à droite sur desktop (lien « Voir tout », tri…).
 */
export function SectionHeader({ eyebrow, title, text, action, as: Tag = 'h2', align = 'left', id, className = '' }) {
  return (
    <header className={`${styles.header} ${styles[align]} ${className}`}>
      <div className={styles.text}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <Tag id={id} className={`${styles.title} text-h2`}>
          <span className={styles.spark} aria-hidden="true" />
          {title}
        </Tag>
        {text && <p className={styles.lead}>{text}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </header>
  )
}
