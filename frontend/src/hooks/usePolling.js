import { useCallback, useEffect, useRef, useState } from 'react'

const POLL_INTERVAL = 5000

/**
 * Charge des données puis les recharge à intervalle régulier (« temps réel » sans WebSocket).
 *
 * @param {(signal: AbortSignal) => Promise<any>} fetcher Fonction qui appelle l'API.
 * @param {object} [options]
 * @param {number} [options.interval=5000] Délai entre deux chargements en ms ; 0 = un seul chargement.
 * @param {boolean} [options.enabled=true] false = ne rien charger.
 * @param {Array} [options.deps] Valeurs qui relancent le chargement quand elles changent (ex. un id).
 * @returns {{ data: any, error: Error | null, loading: boolean, refresh: () => Promise<void> }}
 */
export function usePolling(fetcher, { interval = POLL_INTERVAL, enabled = true, deps = [] } = {}) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const refresh = useCallback(async (signal) => {
    try {
      const result = await fetcherRef.current(signal)
      setData(result)
      setError(null)
    } catch (err) {
      if (err.name !== 'AbortError') setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    const controller = new AbortController()
    refresh(controller.signal)
    const id = interval > 0 ? setInterval(() => refresh(controller.signal), interval) : null
    return () => {
      controller.abort()
      if (id) clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, interval, refresh, ...deps])

  return { data, error, loading, refresh }
}
