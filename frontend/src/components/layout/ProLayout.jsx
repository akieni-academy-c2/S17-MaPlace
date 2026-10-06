import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { ConfirmDialog, Icon, IconButton, Logo } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { PATHS, to } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { initials } from '@/constants/establishments'
import { useTransitionScreen } from '@/hooks/useTransitionScreen'
import styles from './ProLayout.module.css'

const NAV = [
  { to: PATHS.proDashboard, label: 'Tableau de bord', icon: ICONS.dashboard },
  { to: PATHS.proQueue, label: "File d'attente", icon: ICONS.group },
]

const navClass = ({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`
const tabClass = ({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`

/** Gabarit de l'espace établissement : sidebar (desktop) / barre haute + onglets (mobile). */
export function ProLayout() {
  const { establishment, logout } = useAuth()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const { show } = useTransitionScreen()

  const handleLogout = () => {
    setConfirmLogout(false)
    // L'écran "Au revoir" couvre la redirection vers l'accueil (ProtectedRoute après une déconnexion volontaire)
    show({ title: `Au revoir${establishment?.name ? ',' : ''}`, name: establishment?.name, text: 'À très bientôt sur Ma Place.' })
    logout('user')
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to={PATHS.proDashboard} aria-label="Tableau de bord">
          <Logo size={44} subtitle="Espace établissement" tone="white" />
        </Link>
        <nav className={styles.nav} aria-label="Espace établissement">
          <p className={styles.navTitle}>Gestion</p>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end className={navClass}>
              <Icon name={item.icon} size={20} />
              {item.label}
            </NavLink>
          ))}
          <p className={styles.navTitle}>Liens utiles</p>
          {establishment?.id && (
            <a href={to.establishment(establishment.id)} target="_blank" rel="noreferrer" className={styles.navLink}>
              <Icon name={ICONS.external} size={20} />
              Page publique
            </a>
          )}
          <Link to={PATHS.home} className={styles.navLink}>
            <Icon name={ICONS.home} size={20} />
            Site Ma Place
          </Link>
        </nav>
        <div className={styles.account}>
          <div className={styles.accountInfo}>
            <span className={styles.accountIcon}>{initials(establishment?.name ?? 'É')}</span>
            <div className={styles.accountText}>
              <p className={styles.accountName}>{establishment?.name ?? 'Établissement'}</p>
              <p className={styles.accountRole}>{establishment?.email ?? 'Gestionnaire'}</p>
            </div>
          </div>
          <button type="button" className={styles.logout} onClick={() => setConfirmLogout(true)}>
            <Icon name={ICONS.logout} size={18} />
            Se déconnecter
          </button>
        </div>
      </aside>

      <header className={styles.mobileBar}>
        <div className={styles.mobileTop}>
          <Link to={PATHS.proDashboard} aria-label="Tableau de bord">
            <Logo size={40} subtitle="Espace pro" />
          </Link>
          <IconButton icon={ICONS.logout} label="Se déconnecter" variant="outline" size={44} onClick={() => setConfirmLogout(true)} />
        </div>
        <nav className={styles.tabs} aria-label="Espace établissement">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end className={tabClass}>
              <Icon name={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <ConfirmDialog
        open={confirmLogout}
        icon={ICONS.logout}
        title="Se déconnecter ?"
        confirmLabel="Se déconnecter"
        cancelLabel="Rester connecté"
        confirmIcon={ICONS.logout}
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      >
        Vous quitterez l&apos;espace de <strong>{establishment?.name ?? 'votre établissement'}</strong>. La file reste dans
        son état actuel : pensez à la mettre en pause ou à la fermer si nécessaire.
      </ConfirmDialog>

    </div>
  )
}
