import { AVERAGE_SERVICE_MINUTES } from './establishments'
import { APPROACHING_THRESHOLD, NEAR_THRESHOLD, SOON_THRESHOLD } from './status'

/** Questions fréquentes (accueil). Les réponses décrivent le fonctionnement réel de l'application. */
export const FAQ = [
  {
    question: 'Comment prendre un ticket ?',
    answer:
      'Choisissez un établissement dont la file est ouverte, appuyez sur « Prendre un ticket », puis indiquez votre nom et votre numéro de téléphone. Votre numéro vous est attribué immédiatement et vous arrivez sur la page de suivi de votre ticket.',
  },
  {
    question: 'Dois-je créer un compte ?',
    answer:
      'Non. Aucun compte ni mot de passe n’est nécessaire : votre nom et votre numéro de téléphone suffisent. Ils servent uniquement à l’établissement pour vous identifier au moment de votre passage.',
  },
  {
    question: 'Puis-je annuler mon ticket ?',
    answer:
      'Oui, tant que votre ticket est en attente. Depuis la page « Mon ticket », appuyez sur « Annuler mon ticket » sur le téléphone qui a servi à le prendre. Une fois appelé, le ticket ne peut plus être annulé : adressez-vous alors à l’accueil.',
  },
  {
    question: 'Comment savoir quand c’est mon tour ?',
    answer: `La page « Mon ticket » s’actualise automatiquement et change de couleur à mesure que la file avance : jaune « Préparez-vous » à ${NEAR_THRESHOLD} personnes ou moins devant vous, orange « Votre tour approche » à ${APPROACHING_THRESHOLD} ou moins, rouge « Bientôt votre tour » à ${SOON_THRESHOLD} ou moins, puis vert quand personne n’est devant vous et « C’est votre tour ! » quand l’établissement vous appelle. Gardez simplement la page ouverte.`,
  },
  {
    question: 'Que se passe-t-il lorsque la file est en pause ?',
    answer:
      'L’établissement a temporairement suspendu son service. Les nouveaux tickets ne sont plus acceptés, mais votre ticket est conservé avec sa position. Les appels reprennent dès que la file est relancée.',
  },
  {
    question: 'Puis-je suivre mon ticket à distance ?',
    answer:
      'Oui, c’est tout l’intérêt de Ma Place : vous pouvez attendre chez vous, au travail ou à proximité et ne vous déplacer que lorsque votre tour approche. Il suffit d’une connexion internet.',
  },
  {
    question: 'Puis-je prendre un ticket dans plusieurs établissements ?',
    answer:
      'Oui, mais un même numéro de téléphone ne peut avoir qu’un seul ticket en cours dans une même file. Cet appareil suit par ailleurs un ticket à la fois : le dernier ticket pris remplace le précédent dans « Mes tickets ». Téléchargez ou conservez le lien de chaque ticket pour continuer à les suivre.',
  },
  {
    question: 'Je n’ai pas de smartphone, comment faire ?',
    answer:
      'Présentez-vous à l’accueil de l’établissement : le personnel peut vous créer un ticket dans la même file d’attente que les clients connectés et vous l’imprimer. Vous êtes appelé dans l’ordre, comme tout le monde.',
  },
  {
    question: 'Puis-je télécharger mon ticket ?',
    answer:
      'Oui. Depuis la page « Mon ticket », appuyez sur « Télécharger mon ticket » pour enregistrer une image avec votre numéro, l’établissement et le lien de suivi. Pratique pour le présenter au guichet.',
  },
  {
    question: 'Le temps d’attente affiché est-il exact ?',
    answer: `C’est une estimation, calculée à partir du nombre de personnes devant vous et d’une durée moyenne d’environ ${AVERAGE_SERVICE_MINUTES} minutes par passage. Le temps réel peut varier selon les demandes traitées au guichet.`,
  },
]
