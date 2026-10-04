import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import styles from './PageTitle.module.css'

/** En-tête de page : lien retour optionnel, eyebrow, titre (h1), texte et actions. */
export function PageTitle({ back, eyebrow, title, text, actions, className = '' }) {
  return (
    <header className={`${styles.header} ${className}`}>
      {back && (
        <Link to={back.to} className={styles.back}>
          <Icon name={ICONS.back} size={16} /> {back.label}
        </Link>
      )}
      <div className={styles.row}>
        <div className={styles.text}>
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          <h1 className="text-h1">{title}</h1>
          {text && <p className={styles.lead}>{text}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  )
}
