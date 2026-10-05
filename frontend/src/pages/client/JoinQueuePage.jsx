import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageContent } from '@/components/layout'
import { Button, Card, Icon, InfoNote, QueueStatusBadge, TextField } from '@/components/ui'
import { EstablishmentVisual } from '@/components/establishment'
import { establishmentApi, ticketApi } from '@/services/api'
import { usePolling } from '@/hooks/usePolling'
import { useCurrentTicket } from '@/hooks/useCurrentTicket'
import { useTransitionScreen } from '@/hooks/useTransitionScreen'
import { describeEstablishment, formatWait } from '@/constants/establishments'
import { ICONS } from '@/constants/icons'
import { getQueueStatusMeta, QUEUE_STATUS } from '@/constants/status'
import { to } from '@/constants/routes'
import { formatTicketNumber, normalizePhone } from '@/utils/format'
import styles from './JoinQueuePage.module.css'

/** 9 chiffres commençant par 0, ex. 06 123 23 23 */
const PHONE_RE = /^0\d{8}$/

/**
 * Vérifie le formulaire avant l'envoi.
 *
 * @returns {object} Un message par champ invalide, ex. { phone: 'Numéro invalide…' } ; vide si tout est bon.
 */
const validate = ({ name, phone }) => {
  const errors = {}
  if (name.trim().length < 2) errors.name = 'Indiquez votre nom (2 caractères minimum).'
  if (!PHONE_RE.test(normalizePhone(phone))) errors.phone = 'Numéro invalide. Format attendu : 06 123 23 23.'
  return errors
}

/**
 * Formulaire « Prendre un ticket ».
 *
 * 1. Le client saisit son nom et son téléphone (formaté pendant la saisie).
 * 2. À l'envoi, le ticket est créé ; son id et son jeton d'annulation sont gardés dans le navigateur.
 * 3. Un écran de confirmation s'affiche, puis le client arrive sur la page de suivi du ticket.
 *
 * Si la file n'est pas ouverte, le bouton d'envoi est désactivé.
 */
export default function JoinQueuePage() {
  const { establishmentId } = useParams()
  const navigate = useNavigate()
  const { save } = useCurrentTicket()
  const { data } = usePolling((signal) => establishmentApi.get(establishmentId, { signal }), { interval: 0, deps: [establishmentId] })
  const establishment = data?.establishment
  const info = describeEstablishment(establishment)
  const status = establishment?.queue_status
  const notOpen = Boolean(establishment) && status !== QUEUE_STATUS.OPEN

  const [form, setForm] = useState({ name: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { show } = useTransitionScreen()

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  // 🚧 FT-1 — Tâche 1.3 : remettre la fonction updatePhone ici

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const { ticket } = await ticketApi.create({
        establishmentId,
        name: form.name.trim(),
        phone: normalizePhone(form.phone),
      })
      save(ticket.id, ticket.cancelToken)
      show({
        icon: ICONS.ticketCheck,
        title: 'Ticket confirmé !',
        highlight: formatTicketNumber(ticket.number),
        name: establishment?.name,
        text: 'Suivez votre position en direct sur la page suivante.',
      })
      // `justCreated` : la page du ticket affiche la confirmation de prise de ticket
      navigate(to.ticket(ticket.id), { replace: true, state: { justCreated: true } })
    } catch (err) {
      // Les messages 409 du serveur sont explicites (file en pause/fermée, numéro déjà en file)
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContent>
      <Link to={to.establishment(establishmentId)} className={styles.back}>
        <Icon name={ICONS.back} size={16} /> {establishment?.name ?? 'Établissement'}
      </Link>

      <div className={styles.layout}>
        <aside className={styles.summary}>
          <Card variant="tinted" className={styles.summaryCard}>
            <span className="text-eyebrow">Vous rejoignez</span>
            <div className={styles.place}>
              {establishment && <EstablishmentVisual establishment={establishment} size={48} />}
              <div className={styles.placeText}>
                <strong>{establishment?.name ?? '…'}</strong>
                {info && (
                  <small>
                    {info.category.label} · {info.location}
                  </small>
                )}
              </div>
            </div>
            <dl className={styles.facts}>
              <div>
                <dt>Service</dt>
                <dd>File d’attente principale</dd>
              </div>
              <div>
                <dt>État</dt>
                <dd>{status ? <QueueStatusBadge status={status} pauseReason={establishment?.pause_reason} short size="sm" /> : '—'}</dd>
              </div>
              <div>
                <dt>En attente</dt>
                <dd>{establishment ? establishment.waiting_count ?? 0 : '—'}</dd>
              </div>
              <div>
                <dt>Attente estimée</dt>
                <dd>{info ? formatWait(info.waitMinutes, info.serviceMinutes) : '—'}</dd>
              </div>
            </dl>
          </Card>
          <ol className={styles.steps} aria-label="Étapes">
            <li className={styles.stepActive}>
              <span>1</span> Vos informations
            </li>
            <li>
              <span>2</span> Votre ticket
            </li>
          </ol>
        </aside>

        <Card padding="lg" className={styles.formCard}>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.formHead}>
              <h1 className="text-h2">Prendre un ticket</h1>
              <p className="text-muted">Renseignez simplement votre nom et votre téléphone : votre numéro vous est attribué immédiatement.</p>
            </div>

            {notOpen && (
              <InfoNote tone="warning" icon={ICONS.pause} title={getQueueStatusMeta(status, establishment.pause_reason).label}>
                {getQueueStatusMeta(status, establishment.pause_reason).description}
              </InfoNote>
            )}

            <TextField
              label="Votre nom"
              required
              icon={ICONS.person}
              placeholder="Ex. Grâce Mabiala"
              autoComplete="name"
              value={form.name}
              onChange={update('name')}
              error={errors.name}
              hint="Il sera utilisé par l’établissement pour vous appeler."
            />
            {/* 🚧 FT-1 — Tâche 1.3 : remettre le champ « Votre numéro de téléphone » (voir docs/TACHES_FRONTEND.md) */}

            <InfoNote icon={ICONS.shield}>Aucun compte requis. Vos informations servent uniquement au suivi de votre passage.</InfoNote>

            {submitError && (
              <InfoNote tone="error" icon={ICONS.warning}>
                {submitError}
              </InfoNote>
            )}

            <div className={styles.actions}>
              <Button type="submit" size="lg" fullWidth icon={ICONS.ticket} loading={submitting} disabled={notOpen}>
                Prendre mon ticket
              </Button>
              <Button variant="ghost" fullWidth onClick={() => navigate(to.establishment(establishmentId))}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageContent>
  )
}
