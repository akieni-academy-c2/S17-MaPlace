const errorMiddleware = (error, req, res, next) => {
  console.error(error);

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Une erreur interne est survenue.',
  });
};

export default errorMiddleware;