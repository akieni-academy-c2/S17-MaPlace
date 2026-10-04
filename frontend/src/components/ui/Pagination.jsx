import { ICONS } from '@/constants/icons'
import { Icon } from './Icon'
import styles from './Pagination.module.css'

/** Pages affichées : 1 … 4 5 6 … 12 */
function pageList(page, count) {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  const pages = new Set([1, count, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['…', p] : [p]))
}

/**
 * Pagination (précédent / pages / suivant) + résumé « 1–8 sur 23 ».
 * Masquée s'il n'y a qu'une page. `targetId` : élément ramené en haut de l'écran au changement de page.
 */
export function Pagination({ page, pageCount, onChange, from, to, total, itemLabel = 'éléments', targetId, label = 'Pagination' }) {
  if (pageCount <= 1) return null

  const go = (next) => {
    onChange(next)
    if (targetId) document.getElementById(targetId)?.scrollIntoView({ block: 'start' })
  }

  return (
    <nav className={styles.pagination} aria-label={label}>
      <p className={styles.summary}>
        {from}–{to} sur {total} {itemLabel}
      </p>
      <div className={styles.controls}>
        <button type="button" className={styles.arrow} onClick={() => go(page - 1)} disabled={page === 1} aria-label="Page précédente">
          <Icon name={ICONS.back} size={18} />
        </button>
        {pageList(page, pageCount).map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className={styles.gap} aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`${styles.page} ${p === page ? styles.current : ''}`}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${p}`}
              onClick={() => go(p)}
            >
              {p}
            </button>
          ),
        )}
        <button type="button" className={styles.arrow} onClick={() => go(page + 1)} disabled={page === pageCount} aria-label="Page suivante">
          <Icon name={ICONS.forward} size={18} />
        </button>
      </div>
    </nav>
  )
}
