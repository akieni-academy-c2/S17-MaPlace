import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '@/services/api'
import { storage, STORAGE_KEYS } from '@/utils/storage'
import { AuthContext } from './authContext'

/** Session de l'établissement connecté. `logoutReason` : 'user' ou 'expired'. */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => storage.get(STORAGE_KEYS.token))
  const [establishment, setEstablishment] = useState(() => storage.get(STORAGE_KEYS.establishment))
  const [logoutReason, setLogoutReason] = useState(null)

  const logout = useCallback((reason = 'user') => {
    storage.remove(STORAGE_KEYS.token)
    storage.remove(STORAGE_KEYS.establishment)
    setToken(null)
    setEstablishment(null)
    setLogoutReason(reason)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password)
    storage.set(STORAGE_KEYS.token, data.token)
    storage.set(STORAGE_KEYS.establishment, data.establishment)
    setToken(data.token)
    setEstablishment(data.establishment)
    setLogoutReason(null)
    return data
  }, [])

  // Événement émis par services/api.js quand l'API répond 401.
  useEffect(() => {
    const onUnauthorized = () => logout('expired')
    window.addEventListener('ma-place:unauthorized', onUnauthorized)
    return () => window.removeEventListener('ma-place:unauthorized', onUnauthorized)
  }, [logout])

  const value = useMemo(
    () => ({ establishment, isAuthenticated: Boolean(token), logoutReason, login, logout }),
    [token, establishment, logoutReason, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
