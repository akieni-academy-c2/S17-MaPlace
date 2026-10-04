/**
 * Chemins de l'application. Utiliser les helpers `to.*` pour construire les URLs.
 *
 * Côté client
 *   /                                     Accueil (hero, établissements, FAQ…)
 *   /etablissements                        Tous les établissements (recherche + filtres)
 *   /etablissements/:establishmentId       Fiche établissement
 *   /etablissements/:establishmentId/rejoindre  Prendre un ticket (formulaire)
 *   /mes-tickets                           Ticket suivi depuis cet appareil
 *   /favoris                               Établissements favoris (stockés localement)
 *   /tickets/:ticketId                     Mon ticket (WAITING)
 *   /tickets/:ticketId/appel               C'est votre tour (SERVING)
 *   /tickets/:ticketId/fin                 Ticket terminé / annulé
 *   /informations/:topic                   À propos, conditions, confidentialité
 *
 * Côté établissement
 *   /pro/connexion                         Connexion gestionnaire
 *   /pro/tableau-de-bord                   Tableau de bord de la file (JWT)
 *   /pro/file-attente                      Liste complète des tickets de la session (JWT)
 */
export const PATHS = Object.freeze({
  home: '/',
  establishments: '/etablissements',
  establishment: '/etablissements/:establishmentId',
  joinQueue: '/etablissements/:establishmentId/rejoindre',
  myTickets: '/mes-tickets',
  favorites: '/favoris',
  ticket: '/tickets/:ticketId',
  ticketCalled: '/tickets/:ticketId/appel',
  ticketEnd: '/tickets/:ticketId/fin',
  info: '/informations/:topic',

  proLogin: '/pro/connexion',
  proDashboard: '/pro/tableau-de-bord',
  proQueue: '/pro/file-attente',
})

export const to = {
  home: () => PATHS.home,
  establishments: (query) => (query ? `${PATHS.establishments}?q=${encodeURIComponent(query)}` : PATHS.establishments),
  establishment: (id) => `/etablissements/${id}`,
  joinQueue: (id) => `/etablissements/${id}/rejoindre`,
  myTickets: () => PATHS.myTickets,
  favorites: () => PATHS.favorites,
  ticket: (id) => `/tickets/${id}`,
  ticketCalled: (id) => `/tickets/${id}/appel`,
  ticketEnd: (id) => `/tickets/${id}/fin`,
  info: (topic) => `/informations/${topic}`,
  proLogin: () => PATHS.proLogin,
  proDashboard: () => PATHS.proDashboard,
  proQueue: () => PATHS.proQueue,
}
