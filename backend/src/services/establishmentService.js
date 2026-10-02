import AppError from '../error/AppError.js';

import {
  findAll,
  findById,
} from '../modele/establishmentModel.js';

// Récupère tous les établissements disponibles.
const getAllEstablishments = async () => {
  return await findAll();
};

// Récupère un établissement précis.
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