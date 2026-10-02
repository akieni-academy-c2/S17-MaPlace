import bcrypt from 'bcrypt';

/** Coût de hachage des mots de passe (identique au seed). */
const SALT_ROUNDS = 12;

/**
 * Hache un mot de passe en clair.
 *
 * @param {string} password - Mot de passe en clair.
 * @returns {Promise<string>} Mot de passe haché.
 */
async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Vérifie un mot de passe contre son hachage.
 *
 * @param {string} password - Mot de passe saisi par l'utilisateur.
 * @param {string} passwordHash - Hachage stocké en base.
 * @returns {Promise<boolean>} True si le mot de passe correspond.
 */
async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

export { hashPassword, verifyPassword };
