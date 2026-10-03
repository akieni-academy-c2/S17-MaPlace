import { useCallback, useState } from 'react'
import { storage, STORAGE_KEYS } from '@/utils/storage'

/** Favoris stockés localement (aucune route backend dédiée). */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => storage.get(STORAGE_KEYS.favorites) ?? [])

  const toggle = useCallback((id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      storage.set(STORAGE_KEYS.favorites, next)
      return next
    })
  }, [])

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites])

  return { favorites, toggle, isFavorite }
}
