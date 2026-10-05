import AppError from '../error/AppError.js';

import {
  findCurrentByEstablishmentId,
  openForEstablishment,
  transitionCurrentStatus,
} from '../modele/queueModel.js';
import { findAllForCurrentQueue } from '../modele/ticketModel.js';

const getCurrentQueue = async (establishmentId) => {
  const result =
    await findCurrentByEstablishmentId(establishmentId);

  if (!result) {
    throw new AppError('Établissement introuvable.', 404);
  }

  return {
    ...result,
    tickets: await findAllForCurrentQueue(establishmentId),
  };
};

const openQueue = async (establishmentId) => {
  const result = await openForEstablishment(establishmentId);

  if (result.outcome === 'establishment_not_found') {
    throw new AppError('Établissement introuvable.', 404);
  }

  if (result.outcome === 'queue_already_active') {
    throw new AppError(
      result.queue.status === 'PAUSED'
        ? 'La file est en pause. Reprenez-la au lieu de l’ouvrir.'
        : 'La file est déjà ouverte.',
      409
    );
  }

  return result.queue;
};

/** Applique une transition de file et traduit chaque refus en erreur HTTP (404, 409). */
const updateQueueStatus = async (
  establishmentId,
  allowedStatuses,
  targetStatus,
  invalidTransitionMessage,
  options
) => {
  const result = await transitionCurrentStatus(
    establishmentId,
    allowedStatuses,
    targetStatus,
    options
  );

  if (result.outcome === 'establishment_not_found') {
    throw new AppError('Établissement introuvable.', 404);
  }

  if (result.outcome === 'no_active_queue') {
    throw new AppError(
      'Aucune file active. Ouvrez une nouvelle file.',
      409
    );
  }

  if (result.outcome === 'invalid_transition') {
    throw new AppError(invalidTransitionMessage, 409);
  }

  return result.queue;
};

const pauseQueue = async (establishmentId) =>
  updateQueueStatus(
    establishmentId,
    ['OPEN'],
    'PAUSED',
    'Seule une file ouverte peut être mise en pause.'
  );

const resumeQueue = async (establishmentId) =>
  updateQueueStatus(
    establishmentId,
    ['PAUSED'],
    'OPEN',
    'Seule une file en pause peut être reprise.'
  );

const closeQueue = async (establishmentId) =>
  updateQueueStatus(
    establishmentId,
    ['OPEN', 'PAUSED'],
    'CLOSED',
    'La file est déjà fermée.'
  );

/**
 * Fin de journée avec des clients encore en attente : la file passe en pause jusqu'au
 * lendemain. Les tickets en attente gardent leur numéro et la reprise continue la même
 * numérotation. Refusé (409) s'il n'y a personne en attente : il suffit alors de fermer.
 */
const postponeQueue = async (establishmentId) => {
  const tickets = await findAllForCurrentQueue(establishmentId);

  if (!tickets.some((ticket) => ticket.status === 'WAITING')) {
    throw new AppError(
      'Aucun ticket en attente à reporter. Fermez simplement la file.',
      409
    );
  }

  return updateQueueStatus(
    establishmentId,
    ['OPEN', 'PAUSED'],
    'PAUSED',
    'Seule une file active peut être reportée au lendemain.',
    { pauseReason: 'NEXT_DAY' }
  );
};

export {
  getCurrentQueue,
  postponeQueue,
  openQueue,
  pauseQueue,
  resumeQueue,
  closeQueue,
};
