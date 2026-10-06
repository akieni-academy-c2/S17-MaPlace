import AppError from '../error/AppError.js';

import {
  callNextForEstablishment,
  cancelByClient,
  createForEstablishment,
  findById,
  updateOwnedTicketStatus,
} from '../modele/ticketModel.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Refuse (400) un identifiant qui n'est pas un UUID, avant toute requête SQL. */
const validateId = (id, label) => {
  if (!UUID_PATTERN.test(id)) {
    throw new AppError(`${label} invalide.`, 400);
  }
};

const validateName = (name) => {
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
    throw new AppError(
      'Le nom est obligatoire et doit contenir au maximum 100 caractères.',
      400
    );
  }
};

/** Téléphone : 30 caractères maximum ; facultatif pour un ticket créé au guichet. */
const validatePhone = (phone, { required }) => {
  if (!required && (phone === undefined || phone === null || phone === '')) {
    return;
  }

  if (typeof phone !== 'string' || !phone.trim() || phone.trim().length > 30) {
    throw new AppError(
      required
        ? 'Le numéro de téléphone est obligatoire et doit contenir au maximum 30 caractères.'
        : 'Le numéro de téléphone doit contenir au maximum 30 caractères.',
      400
    );
  }
};

/**
 * Création d'un ticket, commune aux tickets pris en ligne et au guichet.
 * Traduit chaque refus du modèle en erreur HTTP compréhensible (404, 409).
 */
const createInQueue = async (establishmentId, name, phone) => {
  const result = await createForEstablishment(establishmentId, name, phone);

  if (result.outcome === 'establishment_not_found') {
    throw new AppError('Établissement introuvable.', 404);
  }

  if (result.outcome === 'queue_not_open') {
    throw new AppError(
      result.queueStatus === 'PAUSED'
        ? 'La file est en pause et ne peut pas accepter de nouveaux tickets.'
        : 'La file est fermée et ne peut pas accepter de nouveaux tickets.',
      409
    );
  }

  if (result.outcome === 'duplicate_phone') {
    throw new AppError(
      'Ce numéro de téléphone a déjà un ticket en cours dans cette file.',
      409
    );
  }

  return result.ticket;
};

const createTicket = async ({ establishmentId, name, phone }) => {
  validateId(establishmentId, 'Identifiant de l’établissement');
  validateName(name);
  validatePhone(phone, { required: true });

  return createInQueue(establishmentId, name.trim(), phone.trim());
};

/**
 * Ticket créé au guichet pour un client sans smartphone. Le téléphone est facultatif
 * (enregistré vide). Renvoie le ticket complet (position, personnes devant...) pour l'impression.
 */
const createWalkInTicket = async (establishmentId, { name, phone } = {}) => {
  validateName(name);
  validatePhone(phone, { required: false });

  const ticket = await createInQueue(
    establishmentId,
    name.trim(),
    typeof phone === 'string' ? phone.trim() : ''
  );

  return findById(ticket.id);
};

const getTicket = async (ticketId) => {
  validateId(ticketId, 'Identifiant du ticket');

  const ticket = await findById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket introuvable.', 404);
  }

  return ticket;
};

const callNextTicket = async (establishmentId) => {
  const result = await callNextForEstablishment(establishmentId);

  if (result.outcome === 'establishment_not_found') {
    throw new AppError('Établissement introuvable.', 404);
  }

  if (result.outcome === 'queue_not_open') {
    throw new AppError(
      result.queueStatus === 'PAUSED'
        ? 'La file est en pause et aucun client ne peut être appelé.'
        : 'La file est fermée et aucun client ne peut être appelé.',
      409
    );
  }

  if (result.outcome === 'no_waiting_tickets') {
    throw new AppError('Aucun ticket en attente.', 404);
  }

  return result.ticket;
};

/** Change le statut d'un ticket de l'établissement et traduit chaque refus en erreur HTTP. */
const updateTicketStatus = async (
  ticketId,
  establishmentId,
  allowedStatuses,
  targetStatus,
  invalidStatusMessage
) => {
  validateId(ticketId, 'Identifiant du ticket');

  const result = await updateOwnedTicketStatus(
    ticketId,
    establishmentId,
    allowedStatuses,
    targetStatus
  );

  if (result.outcome === 'updated') {
    return result.ticket;
  }

  if (
    result.outcome === 'establishment_not_found' ||
    result.outcome === 'ticket_not_found'
  ) {
    throw new AppError('Ticket introuvable.', 404);
  }

  if (result.outcome === 'queue_closed') {
    throw new AppError(
      'Un ticket d’une file fermée ne peut plus être modifié.',
      409
    );
  }

  throw new AppError(invalidStatusMessage(result.ticket.status), 409);
};

const completeTicket = async (ticketId, establishmentId) =>
  updateTicketStatus(
    ticketId,
    establishmentId,
    ['SERVING'],
    'COMPLETED',
    (status) =>
      status === 'WAITING'
        ? 'Un ticket doit être appelé avant de pouvoir être terminé.'
        : 'Seul un ticket en cours de service peut être terminé.'
  );

const cancelTicket = async (ticketId, establishmentId) =>
  updateTicketStatus(
    ticketId,
    establishmentId,
    ['WAITING'],
    'CANCELLED',
    () => 'Seul un ticket en attente peut être annulé.'
  );

  const cancelTicketByClient = async (ticketId, cancelToken) => {
  validateId(ticketId, 'Identifiant du ticket');

  if (
    typeof cancelToken !== 'string' ||
    !cancelToken.trim()
  ) {
    throw new AppError(
      'Le token d’annulation est obligatoire.',
      400
    );
  }

  const result = await cancelByClient(
    ticketId,
    cancelToken.trim()
  );

  if (result.outcome === 'ticket_not_found') {
    throw new AppError(
      'Ticket introuvable ou token d’annulation invalide.',
      404
    );
  }

  if (result.outcome === 'invalid_status') {
    throw new AppError(
      'Seul un ticket en attente peut être annulé.',
      409
    );
  }

  return result.ticket;
};

export {
  callNextTicket,
  cancelTicket,
  completeTicket,
  createTicket,
  createWalkInTicket,
  getTicket,
  cancelTicketByClient,
};
