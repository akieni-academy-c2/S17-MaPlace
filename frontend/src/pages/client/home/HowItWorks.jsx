import { Icon, SectionHeader } from '@/components/ui'
import { ICONS } from '@/constants/icons'
import styles from './HowItWorks.module.css'

const STEPS = [
  {
    icon: ICONS.search,
    title: 'Recherchez un établissement',
    text: 'Trouvez l’administration, l’hôpital, la banque ou l’agence qui vous intéresse et consultez l’affluence en direct.',
  },
  {
    icon: ICONS.ticket,
    title: 'Prenez votre ticket à distance',
    text: 'Renseignez simplement votre nom et votre téléphone : votre numéro vous est attribué immédiatement.',
  },
  {
    icon: ICONS.bell,
    title: 'Suivez votre tour en direct',
    text: 'Votre position se met à jour automatiquement. Présentez-vous quand l’écran affiche « C’est votre tour ! ».',
  },
]

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className={`container ${styles.section}`} aria-labelledby="how-titre">
      <SectionHeader id="how-titre" eyebrow="Simple et rapide" title="Comment ça marche ?" text="Trois étapes, aucune inscription." />
      <ol className={styles.steps}>
        {STEPS.map((step, index) => (
          <li key={step.title} className={styles.step}>
            <div className={styles.head}>
              <span className={styles.number}>{index + 1}</span>
              <span className={styles.icon}>
                <Icon name={step.icon} size={24} />
              </span>
              {index < STEPS.length - 1 && <Icon name={ICONS.forward} size={20} className={styles.arrow} />}
            </div>
            <h3 className="text-h3">{step.title}</h3>
            <p className="text-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
