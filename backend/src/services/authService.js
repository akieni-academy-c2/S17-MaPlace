import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import AppError from '../error/AppError.js';
import {
  findByEmail,
  findById,
} from '../modele/establishmentModel.js';

const login = async (email, password) => {
  const establishment = await findByEmail(email);

  // Même erreur pour un email ou un mot de passe incorrect.
  if (!establishment) {
    throw new AppError(
      'Email ou mot de passe incorrect.',
      401
    );
  }

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

  // Le JWT identifie l'établissement.
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