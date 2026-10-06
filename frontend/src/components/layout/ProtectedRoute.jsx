import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PATHS } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'

/** Réserve les pages établissement aux utilisateurs connectés ; sinon redirige vers la connexion. */
export function ProtectedRoute() {
  const { isAuthenticated, logoutReason } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Déconnexion volontaire (après l'écran "Au revoir") -> accueil ; sinon -> connexion
    if (logoutReason === 'user') return <Navigate to={PATHS.home} replace />
    return <Navigate to={PATHS.proLogin} replace state={{ from: location }} />
  }
  return <Outlet />
}
