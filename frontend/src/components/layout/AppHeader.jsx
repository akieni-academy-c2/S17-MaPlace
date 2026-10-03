import { useNavigate } from 'react-router-dom'
import { Logo, IconButton } from '@/components/ui'
import styles from './AppHeader.module.css'

/**
 * En-tête mobile client.
 * - sans `title` : logo « Ma Place » + sous-titre de section (ACCUEIL, MON TICKET…)
 * - avec `title` : bouton retour + logo + titre de page (« Détails du lieu »)
 */
export function AppHeader({ section, title, backTo, actions }) {
  const navigate = useNavigate()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.start}>
          {title ? (
            <>
              <IconButton icon="arrow_back" label="Retour" onClick={() => (backTo ? navigate(backTo) : navigate(-1))} />
              <Logo size={36} showText={false} />
              <h1 className={styles.title}>{title}</h1>
            </>
          ) : (
            <Logo size={40} subtitle={section} />
          )}
        </div>
        <div className={styles.end}>
          {actions}
          <IconButton icon="person" label="Profil" variant="filled" size={44} />
        </div>
      </div>
    </header>
  )
}
