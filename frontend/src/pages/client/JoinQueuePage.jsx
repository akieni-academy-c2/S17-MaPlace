import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppHeader, PageContent } from '@/components/layout'
import { Button, Card, Icon, InfoNote, QueueStatusBadge, TextField } from '@/components/ui'
import { getEstablishment } from '@/services/establishmentService'
import { createTicket } from '@/services/ticketService'
import { usePolling } from '@/hooks/usePolling'
import { useCurrentTicket } from '@/hooks/useCurrentTicket'
import { ICONS } from '@/constants/icons'
import { to } from '@/constants/routes'
import styles from './JoinQueuePage.module.css'

const PHONE_RE = /^(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}$/

const validate = ({ name, phone }) => {
  const errors = {}
  if (name.trim().length < 2) errors.name = 'Indiquez votre nom (2 caractères minimum).'
  if (!PHONE_RE.test(phone.trim())) errors.phone = 'Numéro de téléphone invalide.'
  return errors
}

/** Client 3/6 — Formulaire « Rejoindre la file » (POST /api/tickets). */
export default function JoinQueuePage() {
  const { establishmentId } = useParams()
  const navigate = useNavigate()
  const { save } = useCurrentTicket()
  const { data } = usePolling((signal) => getEstablishment(establishmentId, { signal }), { interval: 0, deps: [establishmentId] })
  const establishment = data?.establishment

  const [form, setForm] = useState({ name: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const { ticket } = await createTicket({
        establishmentId,
        name: form.name.trim(),
        phone: form.phone.replace(/[\s.-]/g, ''),
      })
      save(ticket.id)
      navigate(to.ticket(ticket.id), { replace: true })
    } catch (err) {
      setSubmitError(err.status === 409 ? "La file n'accepte pas de nouveaux tickets pour le moment." : err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <AppHeader title="Prise de ticket" backTo={to.establishment(establishmentId)} />
      <PageContent>
        <div className={styles.context}>
          <Button variant="ghost" size="sm" icon={ICONS.back} to={to.establishment(establishmentId)} className={styles.back}>
            {establishment?.name ?? 'Établissement'}
          </Button>
          {establishment && <QueueStatusBadge status={establishment.queue_status} />}
        </div>

        <Card padding="lg">
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className="stack" style={{ '--stack-gap': 'var(--space-sm)' }}>
              <h2 className="text-headline-lg">Rejoindre la file</h2>
              <p className="text-body-lg text-muted">
                Renseignez uniquement vos coordonnées pour recevoir votre ticket digital en temps réel.
              </p>
            </div>

            <TextField
              label="Votre nom"
              icon={ICONS.person}
              placeholder="Jean Dupont"
              autoComplete="name"
              value={form.name}
              onChange={update('name')}
              error={errors.name}
            />
            <TextField
              label="Votre numéro de téléphone"
              icon={ICONS.phone}
              type="tel"
              inputMode="tel"
              placeholder="06 12 34 56 78"
              autoComplete="tel"
              value={form.phone}
              onChange={update('phone')}
              error={errors.phone}
            />

            <InfoNote icon={ICONS.shield}>
              Aucun compte requis. Vos informations sont utilisées exclusivement pour le suivi de votre tour.
            </InfoNote>

            {submitError && (
              <InfoNote tone="error" icon={ICONS.warning}>
                {submitError}
              </InfoNote>
            )}

            <Button type="submit" size="lg" fullWidth icon={ICONS.ticket} loading={submitting}>
              Prendre mon ticket
            </Button>
            <Button variant="ghost" fullWidth onClick={() => navigate(to.establishment(establishmentId))}>
              Annuler
            </Button>
          </form>
        </Card>

        <p className={styles.footnote}>
          <Icon name={ICONS.info} size={16} /> Vous pourrez suivre votre position en direct après validation.
        </p>
      </PageContent>
    </>
  )
}
