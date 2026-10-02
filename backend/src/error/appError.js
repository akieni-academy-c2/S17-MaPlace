/**
 * Erreur applicative portant un message et un status code HTTP.
 *
 * Utilisée par les controllers, models et middlewares pour signaler
 * une erreur métier que le middleware global transformera en réponse JSON.
 */
class AppError extends Error {
    /**
     * Crée une erreur applicative.
     *
     * @param {string} message - Message d'erreur lisible par le client.
     * @param {number} [statusCode=500] - Code HTTP (400, 401, 403, 404, 409, 500...).
     */
    constructor(message, statusCode = 500) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        // Conserve la stack d'erreur correcte pour le débogage.
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
