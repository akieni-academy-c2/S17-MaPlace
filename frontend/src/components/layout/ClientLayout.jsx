import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import styles from './ClientLayout.module.css'

/** Gabarit mobile-first du parcours client : colonne centrée 480px + navigation basse. */
export function ClientLayout() {
  return (
    <div className={styles.shell}>
      <Outlet />
      <BottomNav />
    </div>
  )
}

/** Zone de contenu d'une page client (à placer sous <AppHeader>). */
export function PageContent({ children, className = '' }) {
  return <main className={`${styles.content} ${className}`}>{children}</main>
}
