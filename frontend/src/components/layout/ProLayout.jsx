import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Icon, IconButton, Logo } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { PATHS } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import styles from './ProLayout.module.css'

const NAV = [
  { to: PATHS.proDashboard, label: 'Tableau de bord', icon: ICONS.dashboard },
  { to: `${PATHS.proDashboard}#file-attente`, label: "File d'attente", icon: ICONS.group, hash: true },
]

/** Gabarit de l'espace établissement : sidebar (desktop) / barre haute (mobile). */
export function ProLayout() {
  const { establishment, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(PATHS.proLogin, { replace: true })
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Logo size={40} subtitle="Espace établissement" />
        <nav className={styles.nav} aria-label="Espace établissement">
          {NAV.map((item) =>
            item.hash ? (
              <a key={item.label} href={item.to} className={styles.navLink}>
                <Icon name={item.icon} size={22} />
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                end
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                <Icon name={item.icon} size={22} />
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
        <div className={styles.account}>
          <div className={styles.accountInfo}>
            <span className={styles.accountIcon}>
              <Icon name={ICONS.store} size={22} />
            </span>
            <div>
              <p className={styles.accountName}>{establishment?.name ?? 'Établissement'}</p>
              <p className={styles.accountRole}>Guichet actif</p>
            </div>
          </div>
          <button type="button" className={styles.logout} onClick={handleLogout}>
            <Icon name={ICONS.logout} size={20} />
            Se déconnecter
          </button>
        </div>
      </aside>

      <header className={styles.mobileBar}>
        <Logo size={36} subtitle="Espace pro" />
        <IconButton icon={ICONS.logout} label="Se déconnecter" variant="tonal" onClick={handleLogout} />
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
