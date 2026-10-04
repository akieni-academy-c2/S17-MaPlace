import { useState } from 'react'
import { Button, Icon, InfoNote, Modal, TextField, TicketNumber } from '@/components/ui'
import { useTransitionScreen } from '@/hooks/useTransitionScreen'
import { estimateWaitMinutes, formatWait } from '@/constants/establishments'
import { ICONS } from '@/constants/icons'
import { formatPhone, formatTicketNumber, normalizePhone, plural } from '@/utils/format'
import { downloadTicket, printTicket, ticketExportData } from '@/utils/ticketExport'
import styles from './WalkInTicketDialog.module.css'

/** Téléphone facultatif, mais s'il est saisi : 9 chiffres commençant par 0 (même règle que le client). */
const PHONE_RE = /^0\d{8}$/

const validate = ({ name, phone }) => {
  const errors = {}
  if (name.trim().length < 2) errors.name = 'Indiquez le nom du client (2 caractères minimum).'
  if (phone && !PHONE_RE.test(normalizePhone(phone))) errors.phone = 'Numéro invalide. Format attendu : 06 123 23 23.'
  return errors
}

/**
 * Création d'un ticket au guichet pour un client sans smartphone (POST /api/queue/tickets).
 * Le ticket rejoint la même file ; il peut ensuite être imprimé ou téléchargé.
 */
export function WalkInTicketDialog({ open, onClose, onCreate, establishmentName }) {
  const { show } = useTransitionScreen()
  const [form, setForm] = useState({ name: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [ticket, setTicket] = useState(null)
  const [exporting, setExporting] = useState(null)

  const reset = () => {
    setForm({ name: '', phone: '' })
    setErrors({})
    setSubmitError(null)
    setTicket(null)
  }

  const close = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const created = await onCreate({ name: form.name.trim(), phone: form.phone ? normalizePhone(form.phone) : undefined })
      setTicket(created)
      show({
        icon: ICONS.ticketCheck,
        title: 'Ticket créé !',
        highlight: formatTicketNumber(created.number),
        name: created.name,
        text: 'Le client rejoint la file. Vous pouvez imprimer son ticket.',
      })
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const exportTicket = async (kind) => {
    setExporting(kind)
    try {
      const data = ticketExportData(ticket, { issuedBy: `Ticket remis au guichet · ${establishmentName ?? 'Ma Place'}` })
      await (kind === 'print' ? printTicket(data) : downloadTicket(data))
    } finally {
      setExporting(null)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      closeDisabled={submitting}
      title={ticket ? 'Ticket prêt' : 'Créer un ticket au guichet'}
      description={ticket ? undefined : 'Pour un client sans smartphone : il rejoint la même file que les tickets pris en ligne.'}
    >
      {ticket ? (
        <div className={styles.result}>
          <div className={styles.preview}>
            <span className="text-eyebrow">{establishmentName}</span>
            <TicketNumber number={ticket.number} size="xl" />
            <p className={styles.name}>{ticket.name}</p>
            <p className={styles.meta}>
              {ticket.peopleAhead > 0 ? `${plural(ticket.peopleAhead, 'personne')} devant · attente ${formatWait(estimateWaitMinutes(ticket.peopleAhead))}` : 'Prochain à être appelé'}
            </p>
          </div>
          <div className={styles.actions}>
            <Button icon={ICONS.print} loading={exporting === 'print'} onClick={() => exportTicket('print')}>
              Imprimer le ticket
            </Button>
            <Button variant="outline" icon={ICONS.download} loading={exporting === 'download'} onClick={() => exportTicket('download')}>
              Télécharger (PNG)
            </Button>
          </div>
          <div className={styles.footerActions}>
            <Button variant="ghost" icon={ICONS.ticket} onClick={reset}>
              Créer un autre ticket
            </Button>
            <Button variant="ghost" onClick={close}>
              Fermer
            </Button>
          </div>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <TextField
            label="Nom du client"
            icon={ICONS.person}
            placeholder="Ex. Joseph Malonga"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={errors.name}
            autoFocus
          />
          <TextField
            label="Téléphone (facultatif)"
            icon={ICONS.phone}
            type="tel"
            inputMode="tel"
            placeholder="06 123 23 23"
            maxLength={12}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(normalizePhone(e.target.value)) }))}
            error={errors.phone}
            hint="Utile pour joindre le client. Un même numéro ne peut avoir qu’un ticket en cours."
          />
          {submitError && (
            <InfoNote tone="error" icon={ICONS.warning}>
              {submitError}
            </InfoNote>
          )}
          <Button type="submit" size="lg" fullWidth icon={ICONS.ticket} loading={submitting}>
            Créer le ticket
          </Button>
          <p className={styles.note}>
            <Icon name={ICONS.info} size={14} /> Le ticket pourra être imprimé ou téléchargé juste après.
          </p>
        </form>
      )}
    </Modal>
  )
}
