import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { PATHS, to } from '@/constants/routes'
import { useCurrentTicket } from '@/hooks/useCurrentTicket'
import styles from './BottomNav.module.css'

/** Entrées de navigation du parcours client (Accueil · Lieux · Mon ticket) + état actif. */
function useClientNavItems() {
  const { ticketId } = useCurrentTicket()
  const { pathname } = useLocation()

  return [
    { to: PATHS.home, label: 'Accueil', icon: ICONS.home, end: true },
    { to: `${PATHS.home}#etablissements`, label: 'Lieux', icon: ICONS.places, match: '/etablissements' },
    { to: ticketId ? to.ticket(ticketId) : PATHS.home, label: 'Mon ticket', icon: ICONS.ticket, match: '/tickets' },
  ].map((item) => ({
    ...item,
    active: item.match ? pathname.startsWith(item.match) : pathname === item.to,
  }))
}

/** Barre de navigation basse (mobile / tablette, masquée sur desktop). */
export function BottomNav() {
  const items = useClientNavItems()

  return (
    <nav className={styles.nav} aria-label="Navigation principale">
      <div className={styles.inner}>
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            aria-current={item.active ? 'page' : undefined}
            className={`${styles.link} ${item.active ? styles.active : ''}`}
          >
            <Icon name={item.icon} size={26} weight={item.active ? 600 : 400} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

/** Même navigation, en ligne dans l'en-tête (desktop uniquement). */
export function TopNav() {
  const items = useClientNavItems()

  return (
    <nav className={styles.topNav} aria-label="Navigation principale">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.end}
          aria-current={item.active ? 'page' : undefined}
          className={`${styles.topLink} ${item.active ? styles.topActive : ''}`}
        >
          <Icon name={item.icon} size={20} weight={item.active ? 600 : 400} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
