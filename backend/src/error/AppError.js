class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);

    this.name = 'AppError';
    this.statusCode = statusCode;

    // Identifie les erreurs prévues par l'application.
    this.isOperational = true;
  }
}

export default AppError;