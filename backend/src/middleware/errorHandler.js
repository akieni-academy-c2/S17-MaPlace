import AppError from "../error/appError.js";

/**
 * Gère les routes inexistantes (404).
 *
 * @param {import('express').Request} req - Requête HTTP.
 * @param {import('express').Response} res - Réponse HTTP.
 * @returns {void} Réponse JSON 404.
 */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: "Route introuvable.",
  });
}

/**
 * Middleware global de gestion des erreurs.
 *
 * Transforme toute erreur (AppError ou erreur inattendue) en réponse JSON
 * cohérente. Les détails internes ne sont jamais envoyés en production.
 *
 * @param {Error} err - Erreur capturée (AppError ou erreur système).
 * @param {import('express').Request} req - Requête HTTP.
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Non utilisé, requis par Express.
 * @returns {void} Réponse JSON d'erreur.
 */
function errorHandler(err, req, res, next) {
  // Erreur applicative connue : on renvoie son status et son message.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Erreur PostgreSQL de contrainte d'unicité (ex : email déjà pris).
  if (err.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "Cette ressource existe déjà.",
    });
  }

  console.error(err);

  res.status(500).json({
    success: false,
    message: "Erreur interne du serveur.",
  });
}

export { notFound, errorHandler };
