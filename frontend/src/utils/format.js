/** "#3" */
export const formatTicketNumber = (n) => (n == null ? '—' : `#${n}`)

/** "14:32" */
export const formatTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '—'

/** "il y a 4 min" */
export const formatSince = (date) => {
  if (!date) return ''
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000))
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  return `il y a ${Math.floor(minutes / 60)} h`
}

/** "0612345678" -> "06 12 34 56 78" */
export const formatPhone = (phone = '') => phone.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1 ')

export const plural = (count, singular, pluralForm = `${singular}s`) =>
  `${count} ${count > 1 ? pluralForm : singular}`
