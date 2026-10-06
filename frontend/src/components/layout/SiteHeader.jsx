import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Icon, Logo } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentTicket } from '@/hooks/useCurrentTicket'
import { ICONS } from '@/constants/icons'
import { PATHS } from '@/constants/routes'
import { CLIENT_NAV } from '@/constants/site'
import styles from './SiteHeader.module.css'

/** Accès gestionnaire : "Espace pro" (connexion) ou "Mon espace" si déjà connecté. Visible sur toutes les tailles. */
function ProAccess() {
  const { isAuthenticated, establishment } = useAuth()
  return isAuthenticated ? (
    <Link to={PATHS.proDashboard} className={styles.pro} title={establishment?.name}>
      <Icon name={ICONS.dashboard} size={18} />
      <span>
        Mon <span className={styles.dashLong}>tableau de bord</span>
        <span className={styles.dashShort}>espace</span>
      </span>
    </Link>
  ) : (
    <Link to={PATHS.proLogin} className={styles.pro} title="Connexion établissement">
      <Icon name={ICONS.account} size={18} />
      <span className={styles.proLong}>Espace pro</span>
      <span className={styles.proShort}>Pro</span>
    </Link>
  )
}

/**
 * En-tête client. Desktop : navigation complète. Mobile / tablette : logo, recherche et accès pro
 * (la navigation principale est assurée par la barre basse).
 */
export function SiteHeader() {
  const { pathname } = useLocation()
  const { ticketId } = useCurrentTicket()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to={PATHS.home} className={styles.brand} aria-label="Ma Place — accueil">
          <Logo size={44} subtitle="File d'attente en ligne" />
        </Link>

        <nav className={styles.nav} aria-label="Navigation principale">
          {CLIENT_NAV.map((item) => {
            const active = item.isActive(pathname)
            return (
              <NavLink key={item.key} to={item.to} className={`${styles.navLink} ${active ? styles.active : ''}`} aria-current={active ? 'page' : undefined}>
                {item.label}
                {item.key === 'tickets' && ticketId && <span className={styles.liveDot} title="Ticket en cours" />}
              </NavLink>
            )
          })}
        </nav>

        <div className={styles.end}>
          <Link to={`${PATHS.establishments}#recherche`} className={styles.searchLink} aria-label="Rechercher un établissement" title="Rechercher">
            <Icon name={ICONS.search} size={20} />
          </Link>
          <ProAccess />
        </div>
      </div>
    </header>
  )
}
