import { useContext } from 'react'
import { AuthContext } from '@/context/authContext'

/** Établissement connecté et actions `login` / `logout` (à utiliser sous <AuthProvider>). */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
