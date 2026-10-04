import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { useCurrentTicket } from '@/hooks/useCurrentTicket'
import { to } from '@/constants/routes'
import { CLIENT_NAV } from '@/constants/site'
import styles from './BottomNav.module.css'

/** Barre de navigation basse, à portée de pouce (mobile / tablette, masquée sur desktop). */
export function BottomNav() {
  const { pathname } = useLocation()
  const { ticketId } = useCurrentTicket()

  return (
    <nav className={styles.nav} aria-label="Navigation rapide">
      {CLIENT_NAV.map((item) => {
        const active = item.isActive(pathname)
        // « Ticket » mène directement au ticket suivi s'il existe
        const target = item.key === 'tickets' && ticketId ? to.ticket(ticketId) : item.to
        return (
          <NavLink key={item.key} to={target} aria-current={active ? 'page' : undefined} className={`${styles.link} ${active ? styles.active : ''}`}>
            <span className={styles.iconWrap}>
              <Icon name={item.icon} size={22} weight={active ? 600 : 400} filled={item.key === 'favorites' && active} />
              {item.key === 'tickets' && ticketId && <span className={styles.badge} aria-label="Ticket en cours" />}
            </span>
            <span>{item.short ?? item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
