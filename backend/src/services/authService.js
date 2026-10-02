import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import AppError from '../error/AppError.js';
import {
  findByEmail,
  findById,
} from '../modele/establishmentModel.js';

// Vérifie les identifiants et génère le JWT.
const login = async (email, password) => {
  const establishment = await findByEmail(email);

  // On utilise volontairement le même message
  // si l'email ou le mot de passe est incorrect.
  if (!establishment) {
    throw new AppError(
      'Email ou mot de passe incorrect.',
      401
    );
  }

  // Compare le mot de passe envoyé avec le hash
  // enregistré dans PostgreSQL.
  const passwordIsValid = await bcrypt.compare(
    password,
    establishment.password_hash
  );

  if (!passwordIsValid) {
    throw new AppError(
      'Email ou mot de passe incorrect.',
      401
    );
  }

  // Le JWT contient seulement les informations
  // nécessaires pour identifier l'établissement.
  const token = jwt.sign(
    {
      id: establishment.id,
      type: 'establishment',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  );

  return {
    token,

    establishment: {
      id: establishment.id,
      name: establishment.name,
      email: establishment.email,
      phone: establishment.phone,
      queueStatus: establishment.queue_status,
    },
  };
};

// Récupère l'établissement correspondant au JWT.
const getAuthenticatedEstablishment = async (id) => {
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
  login,
  getAuthenticatedEstablishment,
};