import jwt from 'jsonwebtoken';

import AppError from '../error/AppError.js';

const authMiddleware = (req, res, next) => {
  try {
    const authorization =
      req.headers.authorization;

    if (!authorization) {
      throw new AppError(
        'Token d’authentification manquant.',
        401
      );
    }

    // Format attendu :
    // Authorization: Bearer <token>
    const [type, token] =
      authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new AppError(
        'Format du token invalide.',
        401
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(
        new AppError(
          'Token expiré.',
          401
        )
      );
    }

    if (error.name === 'JsonWebTokenError') {
      return next(
        new AppError(
          'Token invalide.',
          401
        )
      );
    }

    next(error);
  }
};

export default authMiddleware;