import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authService from '@/services/authService'
import { storage, STORAGE_KEYS } from '@/utils/storage'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => storage.get(STORAGE_KEYS.token))
  const [establishment, setEstablishment] = useState(() => storage.get(STORAGE_KEYS.establishment))
  // Motif de la dernière déconnexion : 'user' (volontaire) | 'expired' (401) — oriente la redirection
  const [logoutReason, setLogoutReason] = useState(null)

  const logout = useCallback((reason = 'user') => {
    storage.remove(STORAGE_KEYS.token)
    storage.remove(STORAGE_KEYS.establishment)
    setToken(null)
    setEstablishment(null)
    setLogoutReason(reason)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    storage.set(STORAGE_KEYS.token, data.token)
    storage.set(STORAGE_KEYS.establishment, data.establishment)
    setToken(data.token)
    setEstablishment(data.establishment)
    setLogoutReason(null)
    return data
  }, [])

  // Un 401 sur une route protégée déconnecte le gestionnaire
  useEffect(() => {
    const onUnauthorized = () => logout('expired')
    window.addEventListener('ma-place:unauthorized', onUnauthorized)
    return () => window.removeEventListener('ma-place:unauthorized', onUnauthorized)
  }, [logout])

  const value = useMemo(
    () => ({ token, establishment, isAuthenticated: Boolean(token), logoutReason, login, logout }),
    [token, establishment, logoutReason, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
