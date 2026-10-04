import logoUrl from '@/assets/logo.png'
import { estimateWaitMinutes, formatWait } from '@/constants/establishments'
import { formatTicketNumber } from './format'

/**
 * Export d'un ticket en image PNG (téléchargement) ou impression, sans dépendance :
 * le ticket est dessiné avec l'API Canvas 2D du navigateur, puis
 *  - téléchargé via canvas.toBlob() + lien <a download>
 *  - imprimé via une <iframe> masquée contenant l'image (format ticket de caisse 80 mm).
 */

const COLORS = {
  primary: '#134e4a',
  primaryDark: '#0b3532',
  orange: '#e8832a',
  text: '#10302d',
  muted: '#5a6e6b',
  border: '#c9d8d5',
  surface: '#f5f9f8',
}
const DISPLAY = '"Plus Jakarta Sans Variable", "Plus Jakarta Sans", system-ui, sans-serif'
const BODY = '"Inter Variable", "Inter", system-ui, sans-serif'

const WIDTH = 600
const SCALE = 2

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

/** Logo recoloré en blanc (le PNG d'origine est bleu) : on le dessine puis on remplit en « source-in ». */
async function whiteLogo(height) {
  const img = await loadImage(logoUrl)
  const crop = { x: 298, y: 218, w: 1392, h: 496 }
  const width = Math.round((crop.w / crop.h) * height)
  const c = document.createElement('canvas')
  c.width = width * SCALE
  c.height = height * SCALE
  const ctx = c.getContext('2d')
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, c.width, c.height)
  ctx.globalCompositeOperation = 'source-in'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, c.width, c.height)
  return { canvas: c, width, height }
}

/** Réduit la taille de police jusqu'à ce que le texte tienne dans `maxWidth`. */
function fitText(ctx, text, { weight, size, family, maxWidth, min = 14 }) {
  let s = size
  ctx.font = `${weight} ${s}px ${family}`
  while (ctx.measureText(text).width > maxWidth && s > min) {
    s -= 1
    ctx.font = `${weight} ${s}px ${family}`
  }
  let t = text
  while (ctx.measureText(t).width > maxWidth && t.length > 1) t = t.slice(0, -1)
  return t === text ? t : `${t.trimEnd()}…`
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

/**
 * Dessine le ticket.
 * @param {object} t { number, establishmentName, name, createdAt, peopleAhead, trackingUrl, issuedBy }
 */
export async function renderTicketCanvas(t) {
  await Promise.all([document.fonts.load(`800 40px ${DISPLAY}`), document.fonts.load(`400 16px ${BODY}`)]).catch(() => {})

  const H = 860
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH * SCALE
  canvas.height = H * SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(SCALE, SCALE)
  ctx.textBaseline = 'alphabetic'

  // Fond
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, WIDTH, H)

  // Bandeau vert
  const bandH = 150
  ctx.fillStyle = COLORS.primary
  ctx.fillRect(0, 0, WIDTH, bandH)
  ctx.fillStyle = COLORS.orange
  ctx.beginPath()
  ctx.arc(WIDTH - 30, bandH - 10, 70, 0, Math.PI * 2)
  ctx.fill()
  const logo = await whiteLogo(46).catch(() => null)
  if (logo) ctx.drawImage(logo.canvas, 40, 36, logo.width, logo.height)
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = `600 15px ${BODY}`
  ctx.fillText('Ticket de file d’attente', 40, 116)

  // Établissement
  ctx.textAlign = 'center'
  ctx.fillStyle = COLORS.text
  const place = fitText(ctx, t.establishmentName ?? '', { weight: 700, size: 30, family: DISPLAY, maxWidth: WIDTH - 80 })
  ctx.fillText(place, WIDTH / 2, 212)

  // Numéro
  ctx.fillStyle = COLORS.muted
  ctx.font = `700 14px ${BODY}`
  ctx.fillText('VOTRE NUMÉRO', WIDTH / 2, 262)
  ctx.fillStyle = COLORS.primary
  ctx.font = `800 150px ${DISPLAY}`
  ctx.fillText(formatTicketNumber(t.number), WIDTH / 2, 410)

  // Nom + date
  ctx.fillStyle = COLORS.text
  const name = fitText(ctx, t.name ?? '', { weight: 700, size: 26, family: DISPLAY, maxWidth: WIDTH - 80 })
  ctx.fillText(name, WIDTH / 2, 462)
  const date = new Date(t.createdAt ?? Date.now())
  ctx.fillStyle = COLORS.muted
  ctx.font = `400 16px ${BODY}`
  ctx.fillText(
    `Pris le ${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
    WIDTH / 2,
    494,
  )

  // Perforation
  const perfY = 536
  ctx.strokeStyle = COLORS.border
  ctx.lineWidth = 2
  ctx.setLineDash([10, 8])
  ctx.beginPath()
  ctx.moveTo(40, perfY)
  ctx.lineTo(WIDTH - 40, perfY)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = COLORS.surface
  ;[0, WIDTH].forEach((x) => {
    ctx.beginPath()
    ctx.arc(x, perfY, 18, 0, Math.PI * 2)
    ctx.fill()
  })

  // Indicateurs
  const boxes = [
    { label: 'Devant vous', value: t.peopleAhead != null ? String(t.peopleAhead) : '—' },
    { label: 'Attente estimée', value: formatWait(estimateWaitMinutes(t.peopleAhead)) },
  ]
  const boxW = (WIDTH - 80 - 16) / 2
  boxes.forEach((b, i) => {
    const x = 40 + i * (boxW + 16)
    ctx.fillStyle = i === 0 ? COLORS.primary : '#fdf1e6'
    roundRect(ctx, x, 570, boxW, 104, 16)
    ctx.fill()
    ctx.textAlign = 'left'
    ctx.fillStyle = i === 0 ? 'rgba(255,255,255,0.8)' : COLORS.muted
    ctx.font = `600 14px ${BODY}`
    ctx.fillText(b.label, x + 20, 604)
    ctx.fillStyle = i === 0 ? '#ffffff' : '#b45a10'
    ctx.font = `800 36px ${DISPLAY}`
    ctx.fillText(b.value, x + 20, 650)
  })

  // Consignes
  ctx.textAlign = 'center'
  ctx.fillStyle = COLORS.text
  ctx.font = `600 16px ${BODY}`
  ctx.fillText('Présentez ce ticket au guichet lorsque votre numéro est appelé.', WIDTH / 2, 720)
  ctx.fillStyle = COLORS.muted
  ctx.font = `400 14px ${BODY}`
  if (t.trackingUrl) {
    ctx.fillText('Suivre ce ticket en direct :', WIDTH / 2, 752)
    ctx.fillStyle = COLORS.primary
    ctx.font = `600 14px ${BODY}`
    ctx.fillText(fitText(ctx, t.trackingUrl, { weight: 600, size: 14, family: BODY, maxWidth: WIDTH - 60, min: 10 }), WIDTH / 2, 774)
  }
  ctx.fillStyle = COLORS.muted
  ctx.font = `400 13px ${BODY}`
  ctx.fillText(t.issuedBy ?? 'Ma Place · Moins d’attente, plus de temps pour vous', WIDTH / 2, 826)

  return canvas
}

const fileName = (t) =>
  `ticket-${t.number}-${(t.establishmentName ?? 'ma-place')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}.png`

/** Télécharge le ticket en PNG. */
export async function downloadTicket(t) {
  const canvas = await renderTicketCanvas(t)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName(t)
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Imprime le ticket (format ticket de caisse 80 mm, compatible imprimante A4). */
export async function printTicket(t) {
  const canvas = await renderTicketCanvas(t)
  const dataUrl = canvas.toDataURL('image/png')
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(frame)
  const doc = frame.contentDocument
  doc.open()
  doc.write(
    `<!doctype html><html><head><title>Ticket ${formatTicketNumber(t.number)}</title><style>@page{margin:4mm}html,body{margin:0}img{width:72mm;display:block}</style></head><body><img alt="Ticket ${formatTicketNumber(t.number)}" src="${dataUrl}"></body></html>`,
  )
  doc.close()
  const img = doc.querySelector('img')
  await (img.complete ? Promise.resolve() : new Promise((resolve) => (img.onload = resolve)))
  frame.contentWindow.focus()
  frame.contentWindow.print()
  setTimeout(() => frame.remove(), 1000)
}

/** Données d'export à partir d'un ticket de l'API (GET /api/tickets/:id). */
export const ticketExportData = (ticket, extra = {}) => ({
  number: ticket.number,
  establishmentName: ticket.establishment?.name,
  name: ticket.name,
  createdAt: ticket.createdAt,
  peopleAhead: ticket.peopleAhead,
  trackingUrl: `${window.location.origin}/tickets/${ticket.id}`,
  ...extra,
})
