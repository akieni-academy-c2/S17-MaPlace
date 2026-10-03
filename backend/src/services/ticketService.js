import AppError from '../error/AppError.js';

import {
  callNextForEstablishment,
  createForEstablishment,
  findById,
  updateOwnedTicketStatus,
} from '../modele/ticketModel.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validateId = (id, label) => {
  if (!UUID_PATTERN.test(id)) {
    throw new AppError(`${label} invalide.`, 400);
  }
};

const createTicket = async ({ establishmentId, name, phone }) => {
  validateId(establishmentId, 'Identifiant de l’établissement');

  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
    throw new AppError(
      'Le nom est obligatoire et doit contenir au maximum 100 caractères.',
      400
    );
  }

  if (typeof phone !== 'string' || !phone.trim() || phone.trim().length > 30) {
    throw new AppError(
      'Le numéro de téléphone est obligatoire et doit contenir au maximum 30 caractères.',
      400
    );
  }

  const result = await createForEstablishment(
    establishmentId,
    name.trim(),
    phone.trim()
  );

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

  return result.ticket;
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

export {
  callNextTicket,
  cancelTicket,
  completeTicket,
  createTicket,
  getTicket,
};
