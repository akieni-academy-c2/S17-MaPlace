class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);

    this.name = 'AppError';
    this.statusCode = statusCode;

    // Permet au middleware d'erreur de distinguer
    // nos erreurs prévues des erreurs inattendues.
    this.isOperational = true;
  }
}

export default AppError;