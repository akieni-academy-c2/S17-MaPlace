/** 3 → « #3 » */
export const formatTicketNumber = (n) => (n == null ? '—' : `#${n}`)

/** Date → « 14:32 » */
export const formatTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '—'

/** Date → « il y a 4 min » */
export const formatSince = (date) => {
  if (!date) return ''
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000))
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  return `il y a ${Math.floor(minutes / 60)} h`
}

/** Ne garde que les 9 premiers chiffres : « 06 123 23 23 » → « 061232323 » */
export const normalizePhone = (phone = '') => phone.replace(/\D/g, '').slice(0, 9)

/**
 * Met un numéro au format congolais 2-3-2-2 : « 061232323 » → « 06 123 23 23 ».
 * Fonctionne aussi pendant la saisie (« 0612 » → « 06 12 »).
 */
export const formatPhone = (phone = '') => {
  const digits = phone.replace(/\D/g, '')
  if (digits.length > 9) return digits.replace(/(\d{2})(?=\d)/g, '$1 ')
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean).join(' ')
}

/** plural(3, 'ticket') → « 3 tickets » ; forme plurielle personnalisable. */
export const plural = (count, singular, pluralForm = `${singular}s`) =>
  `${count} ${count > 1 ? pluralForm : singular}`
