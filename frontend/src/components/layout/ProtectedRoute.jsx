import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PATHS } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'

/** Bloque l'accès aux routes établissement sans JWT. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={PATHS.proLogin} replace state={{ from: location }} />
  }
  return <Outlet />
}
