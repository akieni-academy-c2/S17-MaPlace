import { Link } from 'react-router-dom'
import { Logo, IconButton } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { PATHS } from '@/constants/routes'
import styles from './AppHeader.module.css'

/**
 * En-tête mobile client.
 * - sans `title` : logo « Ma Place » + sous-titre de section (ACCUEIL, MON TICKET…)
 * - avec `title` : logo + titre de page (« Détails du lieu »). Le retour est porté par la page elle-même.
 */
export function AppHeader({ section, title, actions }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={PATHS.home} className={styles.start} aria-label="Ma Place — accueil">
          {title ? (
            <>
              <Logo size={36} showText={false} />
              <h1 className={styles.title}>{title}</h1>
            </>
          ) : (
            <Logo size={40} subtitle={section} />
          )}
        </Link>
        <div className={styles.end}>
          {actions}
          <IconButton icon={ICONS.person} label="Profil" variant="filled" size={44} />
        </div>
      </div>
    </header>
  )
}
