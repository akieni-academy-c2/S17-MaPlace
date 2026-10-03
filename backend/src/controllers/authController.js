import * as authService from '../services/authService.js';
import AppError from '../error/AppError.js';

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(
        'Email et mot de passe sont obligatoires.',
        400
      );
    }

    const result = await authService.login(
      email,
      password
    );

    return res.status(200).json({
      status: 'success',
      message: 'Connexion réussie.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const establishment =
      await authService.getAuthenticatedEstablishment(
        req.user.id
      );

    return res.status(200).json({
      status: 'success',
      data: {
        establishment,
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  login,
  me,
};