import { AVERAGE_SERVICE_MINUTES } from './establishments'

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
    answer:
      'La page « Mon ticket » s’actualise automatiquement : vous voyez le numéro appelé, le nombre de personnes devant vous et votre position. Quand l’établissement vous appelle, l’écran passe en vert avec le message « C’est votre tour ! ». Gardez simplement la page ouverte.',
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
      'Vous pouvez prendre un ticket dans un autre établissement, mais cet appareil suit un seul ticket à la fois : le dernier ticket pris remplace le précédent dans « Mes tickets ». Conservez le lien de chaque ticket pour continuer à les suivre.',
  },
  {
    question: 'Le temps d’attente affiché est-il exact ?',
    answer: `C’est une estimation, calculée à partir du nombre de personnes devant vous et d’une durée moyenne d’environ ${AVERAGE_SERVICE_MINUTES} minutes par passage. Le temps réel peut varier selon les demandes traitées au guichet.`,
  },
]
