/** Chemins des pages, utilisés par le routeur (routes.jsx) et les liens. */
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

/** Construit une URL avec ses paramètres : to.ticket('42') -> '/tickets/42'. */
export const to = {
  establishments: (query) => (query ? `${PATHS.establishments}?q=${encodeURIComponent(query)}` : PATHS.establishments),
  establishment: (id) => `/etablissements/${id}`,
  joinQueue: (id) => `/etablissements/${id}/rejoindre`,
  ticket: (id) => `/tickets/${id}`,
  ticketCalled: (id) => `/tickets/${id}/appel`,
  ticketEnd: (id) => `/tickets/${id}/fin`,
  info: (topic) => `/informations/${topic}`,
}
