/** Erreur prévue par l'application : son message et son code HTTP sont renvoyés au client. */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);

    this.name = 'AppError';
    this.statusCode = statusCode;

    this.isOperational = true;
  }
}

export default AppError;