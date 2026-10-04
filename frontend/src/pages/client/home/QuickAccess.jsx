import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon, SearchBar } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentTicket } from '@/hooks/useCurrentTicket'
import { useFavorites } from '@/hooks/useFavorites'
import { ICONS } from '@/constants/icons'
import { PATHS, to } from '@/constants/routes'
import { plural } from '@/utils/format'
import styles from './QuickAccess.module.css'

/** Zone d'accès rapide sous la hero : recherche + raccourcis. */
export function QuickAccess() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { isAuthenticated, establishment } = useAuth()
  const { ticketId } = useCurrentTicket()
  const { favorites } = useFavorites()

  const tiles = [
    {
      key: 'ticket',
      to: ticketId ? to.ticket(ticketId) : PATHS.myTickets,
      icon: ICONS.ticket,
      title: 'Mon ticket',
      text: ticketId ? 'Suivre mon ticket en cours' : 'Aucun ticket en cours',
      tone: 'orange',
      live: Boolean(ticketId),
    },
    {
      key: 'favorites',
      to: PATHS.favorites,
      icon: ICONS.heart,
      title: 'Mes favoris',
      text: favorites.length ? plural(favorites.length, 'établissement') : 'Accès rapide à vos lieux',
      tone: 'orange',
    },
    {
      key: 'pro',
      to: isAuthenticated ? PATHS.proDashboard : PATHS.proLogin,
      icon: ICONS.store,
      title: isAuthenticated ? 'Mon établissement' : 'Espace établissement',
      text: isAuthenticated ? establishment?.name ?? 'Gérer ma file' : 'Gérez votre file d’attente',
      tone: 'green',
    },
  ]

  return (
    <section className={`container ${styles.wrapper}`} aria-label="Accès rapide">
      <div className={styles.panel}>
        <div className={styles.search}>
          <label htmlFor="quick-search" className={styles.searchLabel}>
            Trouver un établissement
          </label>
          <SearchBar
            id="quick-search"
            value={query}
            onChange={setQuery}
            onSubmit={(q) => navigate(to.establishments(q.trim()))}
            placeholder="Pharmacie, banque, mairie…"
            label="Rechercher un établissement ou un service"
          />
        </div>
        <div className={styles.tiles}>
          {tiles.map((tile) => (
            <Link key={tile.key} to={tile.to} className={styles.tile}>
              <span className={`${styles.tileIcon} ${styles[tile.tone]}`}>
                <Icon name={tile.icon} size={22} />
                {tile.live && <span className={styles.live} />}
              </span>
              <span className={styles.tileText}>
                <strong>{tile.title}</strong>
                <small>{tile.text}</small>
              </span>
              <Icon name={ICONS.chevronRight} size={18} className={styles.chevron} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
