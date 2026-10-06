import { Navigate, useParams } from 'react-router-dom'
import { PageContent, PageTitle } from '@/components/layout'
import { Card } from '@/components/ui'
import { PATHS } from '@/constants/routes'
import { CONTACT } from '@/constants/site'
import styles from './InfoPage.module.css'

/** Pages d'information statiques (contenu à valider par le porteur du projet). */
const TOPICS = {
  'a-propos': {
    eyebrow: 'Ma Place',
    title: 'À propos',
    lead: 'Ma Place rend l’attente plus simple et plus humaine, à Brazzaville et ailleurs.',
    sections: [
      {
        title: 'Notre mission',
        text: 'Dans les administrations, hôpitaux, banques, agences télécoms ou salons, l’attente fait partie du quotidien. Ma Place permet de prendre un ticket à distance et de suivre son tour en direct, pour ne se présenter qu’au bon moment.',
      },
      {
        title: 'Pour les usagers',
        text: 'Aucun compte à créer : un nom et un numéro de téléphone suffisent pour obtenir un ticket. La page de suivi s’actualise automatiquement jusqu’à votre passage.',
      },
      {
        title: 'Pour les établissements',
        text: 'Un tableau de bord simple pour ouvrir, mettre en pause ou fermer la file, appeler le client suivant et suivre l’affluence de la journée.',
      },
    ],
  },
  conditions: {
    eyebrow: 'Informations légales',
    title: "Conditions d'utilisation",
    lead: 'Les règles d’utilisation du service Ma Place.',
    sections: [
      {
        title: 'Objet du service',
        text: 'Ma Place permet de rejoindre à distance la file d’attente d’un établissement partenaire et de suivre l’évolution de son ticket. Le service est fourni à titre informatif : l’ordre de passage reste géré par l’établissement.',
      },
      {
        title: 'Prise de ticket',
        text: 'Un ticket ne peut être pris que lorsque la file de l’établissement est ouverte. Les informations saisies doivent être exactes afin que l’établissement puisse vous identifier lors de votre passage.',
      },
      {
        title: 'Annulation et absence',
        text: 'Un ticket en attente peut être annulé depuis l’appareil qui a servi à le prendre. En cas d’absence lors de l’appel, l’établissement peut clôturer votre ticket.',
      },
      {
        title: 'Temps d’attente',
        text: 'Les temps affichés sont des estimations. Ils peuvent varier selon l’activité de l’établissement et ne constituent pas un engagement.',
      },
    ],
  },
  confidentialite: {
    eyebrow: 'Informations légales',
    title: 'Politique de confidentialité',
    lead: 'Ce que nous faisons — et ne faisons pas — de vos données.',
    sections: [
      {
        title: 'Données collectées',
        text: 'Pour prendre un ticket, seuls votre nom et votre numéro de téléphone sont demandés. Ils sont transmis à l’établissement concerné pour vous identifier au moment de votre passage.',
      },
      {
        title: 'Données stockées sur votre appareil',
        text: 'Votre ticket en cours et vos établissements favoris sont enregistrés dans votre navigateur. Vous pouvez les effacer à tout moment en vidant les données du site.',
      },
      {
        title: 'Partage',
        text: 'Vos informations ne sont ni vendues ni utilisées à des fins publicitaires.',
      },
      {
        title: 'Vos droits',
        text: `Pour toute question ou demande relative à vos données, écrivez-nous à ${CONTACT.email}.`,
      },
    ],
  },
}

/** Pages d'information (à propos, conditions, confidentialité), choisies par le paramètre `:topic`. */
export default function InfoPage() {
  const { topic } = useParams()
  const content = TOPICS[topic]
  if (!content) return <Navigate to={PATHS.home} replace />

  return (
    <PageContent width="narrow">
      <PageTitle back={{ to: PATHS.home, label: 'Accueil' }} eyebrow={content.eyebrow} title={content.title} text={content.lead} />
      <Card padding="lg" className={styles.card}>
        {content.sections.map((s) => (
          <section key={s.title} className={styles.section}>
            <h2 className="text-h3">{s.title}</h2>
            <p className="text-muted">{s.text}</p>
          </section>
        ))}
      </Card>
    </PageContent>
  )
}
