import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import styles from './ClientLayout.module.css'

/** Gabarit mobile-first du parcours client : colonne centrée + navigation basse (en-tête sur desktop). */
export function ClientLayout() {
  return (
    <div className={styles.shell}>
      <Outlet />
      <BottomNav />
    </div>
  )
}

/**
 * Zone de contenu d'une page client (à placer sous <AppHeader>).
 * width : reading (colonne centrée, parcours) | wide (accueil en grille sur desktop)
 */
export function PageContent({ children, width = 'reading', className = '' }) {
  return <main className={`${styles.content} ${styles[width]} ${className}`}>{children}</main>
}
