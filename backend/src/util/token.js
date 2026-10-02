import jwt from 'jsonwebtoken';

/** Durée de validité du token (définie dans .env, 1 jour par défaut). */
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Génère un JWT pour un utilisateur connecté.
 *
 * @param {string} userId - Identifiant UUID de l'utilisateur.
 * @returns {string} Token JWT signé.
 */
function generateToken(userId) {
    return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
        expiresIn: EXPIRES_IN,
    });
}

/**
 * Vérifie un token JWT et retourne son contenu.
 *
 * @param {string} token - Token JWT à vérifier.
 * @returns {{sub: string}} Payload du token (identifiant utilisateur).
 * @throws {Error} Le token est invalide ou expiré.
 */
function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

export { generateToken, verifyToken };
