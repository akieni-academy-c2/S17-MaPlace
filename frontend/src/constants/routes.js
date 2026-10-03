/**
 * Chemins de l'application. Utiliser les helpers `to.*` pour construire les URLs.
 *
 * Côté client (6 pages)
 *   /                                     Accueil + recherche des établissements
 *   /etablissements/:establishmentId       Fiche établissement
 *   /etablissements/:establishmentId/rejoindre  Rejoindre la file (formulaire)
 *   /tickets/:ticketId                     Mon ticket (WAITING)
 *   /tickets/:ticketId/appel               C'est votre tour (SERVING)
 *   /tickets/:ticketId/fin                 Ticket terminé / annulé
 *
 * Côté établissement (2 pages)
 *   /pro/connexion                         Connexion gestionnaire
 *   /pro/tableau-de-bord                   Tableau de bord de la file (JWT)
 */
export const PATHS = Object.freeze({
  home: '/',
  establishment: '/etablissements/:establishmentId',
  joinQueue: '/etablissements/:establishmentId/rejoindre',
  ticket: '/tickets/:ticketId',
  ticketCalled: '/tickets/:ticketId/appel',
  ticketEnd: '/tickets/:ticketId/fin',

  proLogin: '/pro/connexion',
  proDashboard: '/pro/tableau-de-bord',
})

export const to = {
  home: () => PATHS.home,
  establishment: (id) => `/etablissements/${id}`,
  joinQueue: (id) => `/etablissements/${id}/rejoindre`,
  ticket: (id) => `/tickets/${id}`,
  ticketCalled: (id) => `/tickets/${id}/appel`,
  ticketEnd: (id) => `/tickets/${id}/fin`,
  proLogin: () => PATHS.proLogin,
  proDashboard: () => PATHS.proDashboard,
}
