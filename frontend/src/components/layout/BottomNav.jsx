import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { PATHS, to } from '@/constants/routes'
import { useCurrentTicket } from '@/hooks/useCurrentTicket'
import styles from './BottomNav.module.css'

/** Barre de navigation basse du parcours client (Accueil · Lieux · Mon ticket). */
export function BottomNav() {
  const { ticketId } = useCurrentTicket()
  const { pathname } = useLocation()

  const items = [
    { to: PATHS.home, label: 'Accueil', icon: ICONS.home, end: true },
    { to: `${PATHS.home}#etablissements`, label: 'Lieux', icon: ICONS.places, match: '/etablissements' },
    { to: ticketId ? to.ticket(ticketId) : PATHS.home, label: 'Mon ticket', icon: ICONS.ticket, match: '/tickets' },
  ]

  return (
    <nav className={styles.nav} aria-label="Navigation principale">
      <div className={styles.inner}>
        {items.map((item) => {
          const active = item.match ? pathname.startsWith(item.match) : pathname === item.to
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              aria-current={active ? 'page' : undefined}
              className={`${styles.link} ${active ? styles.active : ''}`}
            >
              <Icon name={item.icon} size={26} filled={active} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
