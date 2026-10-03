import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authService from '@/services/authService'
import { storage, STORAGE_KEYS } from '@/utils/storage'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => storage.get(STORAGE_KEYS.token))
  const [establishment, setEstablishment] = useState(() => storage.get(STORAGE_KEYS.establishment))

  const logout = useCallback(() => {
    storage.remove(STORAGE_KEYS.token)
    storage.remove(STORAGE_KEYS.establishment)
    setToken(null)
    setEstablishment(null)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    storage.set(STORAGE_KEYS.token, data.token)
    storage.set(STORAGE_KEYS.establishment, data.establishment)
    setToken(data.token)
    setEstablishment(data.establishment)
    return data
  }, [])

  // Un 401 sur une route protégée déconnecte le gestionnaire
  useEffect(() => {
    window.addEventListener('ma-place:unauthorized', logout)
    return () => window.removeEventListener('ma-place:unauthorized', logout)
  }, [logout])

  const value = useMemo(
    () => ({ token, establishment, isAuthenticated: Boolean(token), login, logout }),
    [token, establishment, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
