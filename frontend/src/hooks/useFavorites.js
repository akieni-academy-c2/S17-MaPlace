import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { readRaw, setAndNotify, storage, STORAGE_KEYS, subscribeStorage } from '@/utils/storage'

const read = () => storage.get(STORAGE_KEYS.favorites) ?? []

/** Favoris stockés localement (aucune route backend dédiée), synchronisés entre composants. */
export function useFavorites() {
  const raw = useSyncExternalStore(subscribeStorage, () => readRaw(STORAGE_KEYS.favorites))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const favorites = useMemo(() => read(), [raw])

  const toggle = useCallback((id) => {
    const prev = read()
    setAndNotify(STORAGE_KEYS.favorites, prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])
  }, [])

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites])

  return { favorites, toggle, isFavorite }
}
