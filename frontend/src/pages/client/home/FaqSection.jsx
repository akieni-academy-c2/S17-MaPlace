import { Accordion, Icon, SectionHeader } from '@/components/ui'
import { CONTACT } from '@/constants/site'
import { FAQ } from '@/constants/faq'
import { ICONS } from '@/constants/icons'
import styles from './FaqSection.module.css'

export function FaqSection() {
  return (
    <section id="faq" className={`container ${styles.section}`} aria-labelledby="faq-titre">
      <div className={styles.aside}>
        <SectionHeader id="faq-titre" eyebrow="Besoin d’aide ?" title="Questions fréquentes" text="Trouvez rapidement les réponses aux questions les plus courantes." />
        <div className={styles.help}>
          <span className={styles.helpIcon}>
            <Icon name={ICONS.help} size={22} />
          </span>
          <div>
            <p className={styles.helpTitle}>Vous ne trouvez pas votre réponse ?</p>
            <a href={`mailto:${CONTACT.email}`} className={styles.helpLink}>
              Écrivez-nous <Icon name={ICONS.forward} size={16} />
            </a>
          </div>
        </div>
      </div>
      <Accordion items={FAQ} />
    </section>
  )
}
