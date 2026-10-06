import { useState } from 'react'

/** Pagination côté navigateur ; un changement de `resetKey` ramène à la page 1. */
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
