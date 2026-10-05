import { useState } from 'react'
import { Button, InfoNote, Modal, TextField } from '@/components/ui'
import { estimateWaitMinutes, formatWait, MAX_SERVICE_MINUTES, MIN_SERVICE_MINUTES } from '@/constants/establishments'
import { ICONS } from '@/constants/icons'
import { plural } from '@/utils/format'
import styles from './ServiceTimeDialog.module.css'

/** Durées proposées par défaut (minutes). */
const PRESETS = [5, 10, 15, 20, 30, 45]

/**
 * Pop-up de réglage de la durée moyenne d'un passage au guichet.
 * Cette durée sert à calculer l'attente estimée affichée aux clients.
 *
 * @param {object} props
 * @param {boolean} props.open Pop-up visible.
 * @param {number} props.value Durée enregistrée, en minutes.
 * @param {number} [props.waitingCount] Clients en attente, pour l'aperçu.
 * @param {boolean} [props.loading] Enregistrement en cours.
 * @param {(minutes: number) => Promise<void>} props.onSave Enregistre la nouvelle durée.
 * @param {() => void} props.onClose Ferme la pop-up.
 */
export function ServiceTimeDialog({ open, value, waitingCount = 0, loading, onSave, onClose }) {
  return (
    <Modal
      open={open}
      title="Durée moyenne d’un passage"
      description="Temps moyen consacré à un client au guichet. Il sert à estimer l’attente affichée à vos clients."
      onClose={onClose}
      closeDisabled={loading}
    >
      <ServiceTimeForm value={value} waitingCount={waitingCount} loading={loading} onSave={onSave} onClose={onClose} />
    </Modal>
  )
}

/**
 * Formulaire de la pop-up. Il est recréé à chaque ouverture, donc il repart toujours
 * de la durée enregistrée. `custom` indique si la durée vient du champ libre ou d'un bouton.
 */
function ServiceTimeForm({ value, waitingCount, loading, onSave, onClose }) {
  const [draft, setDraft] = useState(String(value))
  const [custom, setCustom] = useState(!PRESETS.includes(value)) // saisie libre plutôt qu'une durée proposée
  const [error, setError] = useState(null)

  const minutes = Number(draft)
  const valid = draft !== '' && Number.isInteger(minutes) && minutes >= MIN_SERVICE_MINUTES && minutes <= MAX_SERVICE_MINUTES
  const preview = valid ? minutes : value

  const choose = (next, isCustom = false) => {
    setDraft(String(next))
    setCustom(isCustom)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!valid) {
      setError(`Indiquez un nombre entier de minutes entre ${MIN_SERVICE_MINUTES} et ${MAX_SERVICE_MINUTES}.`)
      return
    }
    if (minutes === value) {
      onClose()
      return
    }
    try {
      await onSave(minutes)
      onClose()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <fieldset className={styles.presets}>
        <legend className={styles.legend}>Durées proposées</legend>
        <div className={styles.grid} role="radiogroup" aria-label="Durées proposées">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              role="radio"
              aria-checked={!custom && minutes === preset}
              className={`${styles.preset} ${!custom && minutes === preset ? styles.active : ''}`}
              onClick={() => choose(preset)}
            >
              <strong>{preset}</strong> min
            </button>
          ))}
        </div>
      </fieldset>

      <TextField
        label="Autre durée (minutes)"
        type="number"
        inputMode="numeric"
        min={MIN_SERVICE_MINUTES}
        max={MAX_SERVICE_MINUTES}
        step={1}
        icon={ICONS.timer}
        placeholder={`Entre ${MIN_SERVICE_MINUTES} et ${MAX_SERVICE_MINUTES}`}
        value={custom ? draft : ''}
        onChange={(e) => choose(e.target.value, true)}
        error={error}
      />

      <InfoNote icon={ICONS.groups}>
        {waitingCount > 0
          ? `Avec ${preview} min par passage, le dernier des ${plural(waitingCount, 'client')} en attente patientera ${formatWait(estimateWaitMinutes(waitingCount - 1, preview), preview)}.`
          : `Avec ${preview} min par passage, un client ayant 3 personnes devant lui patientera ${formatWait(estimateWaitMinutes(3, preview), preview)}.`}
      </InfoNote>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button type="submit" icon={ICONS.check} loading={loading}>
          Enregistrer
        </Button>
      </div>
    </form>
  )
}
