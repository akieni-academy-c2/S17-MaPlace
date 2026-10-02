import AppError from '../error/appError.js';
import { verifyToken } from '../util/token.js';
import { findUserById } from '../model/userModel.js';

/**
 * Authentifie une requête à partir du token JWT porteur.
 *
 * Lit l'en-tête `Authorization: Bearer <token>`, vérifie le token,
 * charge l'utilisateur et l'attache à `req.user`.
 *
 * @param {import('express').Request} req - Requête HTTP.
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} Ne retourne aucune valeur.
 */
async function authenticate(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const [scheme, token] = header.split(' ');

        if (scheme !== 'Bearer' || !token) {
            throw new AppError('Authentification requise.', 401);
        }

        let payload;
        try {
            payload = verifyToken(token);
        } catch {
            throw new AppError('Token invalide ou expiré.', 401);
        }

        const user = await findUserById(payload.sub);
        if (!user) {
            throw new AppError('Utilisateur introuvable.', 401);
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}


/**
 * Authentification facultative : n'impose aucun token.
 *
 * Sans en-tête Authorization, la requête passe anonymement (req.user undefined).
 * Si un token est présent, il doit être valide : dans ce cas l'utilisateur est
 * attaché à req.user, sinon la requête est refusée (401) afin de ne jamais
 * perdre silencieusement l'identité du client.
 *
 * @param {import('express').Request} req - Requête HTTP.
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 * @returns {Promise<void>} Ne retourne aucune valeur.
 */
async function optionalAuthenticate(req, res, next) {
    try {
        const header = req.headers.authorization || '';

        if (!header) {
            return next();
        }

        const [scheme, token] = header.split(' ');

        if (scheme !== 'Bearer' || !token) {
            throw new AppError('Authentification requise.', 401);
        }

        let payload;

        try {
            payload = verifyToken(token);
        } catch {
            throw new AppError('Token invalide ou expiré.', 401);
        }

        const user = await findUserById(payload.sub);

        if (!user) {
            throw new AppError('Utilisateur introuvable.', 401);
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}

export { authenticate, optionalAuthenticate };
