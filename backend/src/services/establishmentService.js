import AppError from '../error/AppError.js';

import {
  findAll,
  findById,
  updateAverageServiceMinutes,
} from '../modele/establishmentModel.js';

const MIN_SERVICE_MINUTES = 1;
const MAX_SERVICE_MINUTES = 240;

const getAllEstablishments = async () => {
  return await findAll();
};

const getEstablishmentById = async (id) => {
  const establishment = await findById(id);

  if (!establishment) {
    throw new AppError(
      'Établissement introuvable.',
      404
    );
  }

  return establishment;
};

const updateServiceTime = async (id, minutes) => {
  if (
    !Number.isInteger(minutes)
    || minutes < MIN_SERVICE_MINUTES
    || minutes > MAX_SERVICE_MINUTES
  ) {
    throw new AppError(
      `La durée moyenne d'un passage doit être un nombre entier de minutes entre ${MIN_SERVICE_MINUTES} et ${MAX_SERVICE_MINUTES}.`,
      400
    );
  }

  const establishment =
    await updateAverageServiceMinutes(id, minutes);

  if (!establishment) {
    throw new AppError(
      'Établissement introuvable.',
      404
    );
  }

  return establishment;
};

export {
  getAllEstablishments,
  getEstablishmentById,
  updateServiceTime,
};