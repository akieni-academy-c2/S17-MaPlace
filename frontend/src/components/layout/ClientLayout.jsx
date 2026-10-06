import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import styles from './ClientLayout.module.css'

/** Fait défiler jusqu'à l'ancre (#faq, #comment-ca-marche...) après la navigation. */
function useHashScroll() {
  const { hash, pathname } = useLocation()
  useEffect(() => {
    if (!hash) return undefined
    // Laisse le temps aux pages chargées à la demande de s'afficher
    const timer = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }), 80)
    return () => clearTimeout(timer)
  }, [hash, pathname])
}

/** Gabarit du parcours client : en-tête, contenu, pied de page et navigation basse (mobile). */
export function ClientLayout() {
  useHashScroll()
  return (
    <div className={styles.shell}>
      <SiteHeader />
      <div className={styles.main}>
        <Outlet />
      </div>
      <SiteFooter />
      <BottomNav />
      <ScrollRestoration getKey={(location) => location.pathname} />
    </div>
  )
}

/**
 * Zone de contenu d'une page client.
 * width : narrow (parcours ticket, formulaires) | wide (listes, grilles)
 */
export function PageContent({ children, width = 'wide', className = '' }) {
  return <main className={`${styles.content} ${width === 'narrow' ? 'container-narrow' : 'container'} ${className}`}>{children}</main>
}
