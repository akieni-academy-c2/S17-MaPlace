import AppError from '../error/AppError.js';

import {
  findAll,
  findById,
} from '../modele/establishmentModel.js';

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

export {
  getAllEstablishments,
  getEstablishmentById,
};