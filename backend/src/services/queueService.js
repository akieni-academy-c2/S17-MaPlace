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

const updateQueueStatus = async (
  establishmentId,
  allowedStatuses,
  targetStatus,
  invalidTransitionMessage
) => {
  const result = await transitionCurrentStatus(
    establishmentId,
    allowedStatuses,
    targetStatus
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

export {
  getCurrentQueue,
  openQueue,
  pauseQueue,
  resumeQueue,
  closeQueue,
};
