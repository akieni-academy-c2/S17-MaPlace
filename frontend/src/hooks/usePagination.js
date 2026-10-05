import { useState } from 'react'

/**
 * Découpe une liste en pages côté navigateur.
 *
 * @param {Array} items Liste complète.
 * @param {number} pageSize Nombre d'éléments par page.
 * @param {string} [resetKey] Quand cette valeur change (recherche, filtre…), on revient à la page 1.
 * @returns {{ page: number, pageCount: number, setPage: (page: number) => void, pageItems: Array, from: number, to: number, total: number }}
 */
export function usePagination(items, pageSize, resetKey = '') {
  const [state, setState] = useState({ key: resetKey, page: 1 })
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const requested = state.key === resetKey ? state.page : 1
  const page = Math.min(Math.max(1, requested), pageCount)
  const start = (page - 1) * pageSize

  return {
    page,
    pageCount,
    setPage: (next) => setState({ key: resetKey, page: next }),
    pageItems: items.slice(start, start + pageSize),
    from: items.length ? start + 1 : 0,
    to: Math.min(start + pageSize, items.length),
    total: items.length,
  }
}
