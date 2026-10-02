const errorMiddleware = (error, req, res, next) => {
  console.error(error);

  // Erreur créée volontairement par notre application.
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  // Erreur inattendue : on ne renvoie pas les détails
  // internes au client.
  return res.status(500).json({
    status: 'error',
    message: 'Une erreur interne est survenue.',
  });
};

export default errorMiddleware;