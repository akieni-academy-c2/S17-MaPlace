import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Button, Icon, IconButton, Logo } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentTicket } from '@/hooks/useCurrentTicket'
import { ICONS } from '@/constants/icons'
import { PATHS } from '@/constants/routes'
import { CLIENT_NAV, INFO_LINKS } from '@/constants/site'
import styles from './SiteHeader.module.css'

/** Bouton d'accès gestionnaire : « Espace pro » ou « Mon tableau de bord » si connecté. */
function ProAccess({ className = '', fullWidth = false }) {
  const { isAuthenticated, establishment } = useAuth()
  return isAuthenticated ? (
    <Button variant="outline" icon={ICONS.dashboard} to={PATHS.proDashboard} className={className} fullWidth={fullWidth} title={establishment?.name}>
      Mon tableau de bord
    </Button>
  ) : (
    <Button variant="outline" icon={ICONS.account} to={PATHS.proLogin} className={className} fullWidth={fullWidth}>
      Espace pro
    </Button>
  )
}

/** En-tête client : navigation complète sur desktop, menu tiroir sur mobile/tablette. */
export function SiteHeader() {
  const { pathname } = useLocation()
  const { ticketId } = useCurrentTicket()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Ferme le menu à chaque navigation
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setMenuOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

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
          <ProAccess className={styles.proDesktop} />
          <IconButton
            icon={menuOpen ? ICONS.close : ICONS.menu}
            label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            variant="outline"
            size={44}
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            onClick={() => setMenuOpen((v) => !v)}
          />
        </div>
      </div>

      {/* Menu tiroir mobile / tablette (calque qui coupe le débordement : pas de scroll horizontal) */}
      <div className={`${styles.layer} ${menuOpen ? styles.layerOpen : ''}`}>
        <div className={styles.backdrop} onClick={() => setMenuOpen(false)} aria-hidden="true" />
        <div id="menu-mobile" className={styles.drawer} aria-hidden={!menuOpen} inert={!menuOpen}>
          <nav aria-label="Menu" className={styles.drawerNav}>
            {CLIENT_NAV.map((item) => {
              const active = item.isActive(pathname)
              return (
                <NavLink key={item.key} to={item.to} className={`${styles.drawerLink} ${active ? styles.drawerActive : ''}`}>
                  <span className={styles.drawerIcon}>
                    <Icon name={item.icon} size={20} />
                  </span>
                  {item.label}
                  {item.key === 'tickets' && ticketId && <span className={styles.drawerBadge}>En cours</span>}
                  <Icon name={ICONS.chevronRight} size={18} className={styles.drawerChevron} />
                </NavLink>
              )
            })}
          </nav>
          <div className={styles.drawerSection}>
            <p className="text-eyebrow">Informations</p>
            {INFO_LINKS.slice(0, 3).map((link) => (
              <Link key={link.to} to={link.to} className={styles.drawerInfo} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className={styles.drawerFooter}>
            <p className="text-small text-muted">Vous gérez un établissement ?</p>
            <ProAccess fullWidth />
          </div>
        </div>
      </div>
    </header>
  )
}
