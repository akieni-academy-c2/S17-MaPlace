import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ConfirmDialog, Icon, IconButton, Logo } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import { PATHS } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { FarewellScreen } from './FarewellScreen'
import styles from './ProLayout.module.css'

const NAV = [
  { to: PATHS.proDashboard, label: 'Tableau de bord', icon: ICONS.dashboard },
  { to: PATHS.proQueue, label: "File d'attente", icon: ICONS.group },
]

/** Durée de l'écran « Au revoir » avant le retour à l'accueil. */
const FAREWELL_DURATION = 2000

const navClass = ({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`
const tabClass = ({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`

/** Gabarit de l'espace établissement : sidebar (desktop) / barre haute + onglets (mobile). */
export function ProLayout() {
  const { establishment, logout } = useAuth()
  const navigate = useNavigate()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleLogout = () => {
    setConfirmLogout(false)
    setLeaving(true)
    timer.current = setTimeout(async () => {
      // On quitte d'abord l'espace protégé pour éviter la redirection vers /pro/connexion
      await navigate(PATHS.home, { replace: true })
      logout()
    }, FAREWELL_DURATION)
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Logo size={40} subtitle="Espace établissement" />
        <nav className={styles.nav} aria-label="Espace établissement">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end className={navClass}>
              <Icon name={item.icon} size={22} />
              {item.label}
            </NavLink>
          ))}
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
          <button type="button" className={styles.logout} onClick={() => setConfirmLogout(true)}>
            <Icon name={ICONS.logout} size={20} />
            Se déconnecter
          </button>
        </div>
      </aside>

      <header className={styles.mobileBar}>
        <div className={styles.mobileTop}>
          <Logo size={36} subtitle="Espace pro" />
          <IconButton icon={ICONS.logout} label="Se déconnecter" variant="tonal" onClick={() => setConfirmLogout(true)} />
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

      {leaving && <FarewellScreen name={establishment?.name} />}
    </div>
  )
}
