import pool from '../config/database.js';

/** Colonnes renvoyées aux clients (jamais le hash du mot de passe). */
const PUBLIC_COLUMNS = 'id, name, email, phone, is_admin, created_at, updated_at';

/**
 * Recherche un utilisateur par son email.
 *
 * @param {string} email - Adresse email de l'utilisateur.
 * @returns {Promise<Object|null>} L'utilisateur complet (avec hash) ou null.
 */
async function findUserByEmail(email) {
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );

    return result.rows[0] || null;
}

/**
 * Recherche un utilisateur par son identifiant, sans données sensibles.
 *
 * @param {string} id - Identifiant UUID de l'utilisateur.
 * @returns {Promise<Object|null>} L'utilisateur public ou null.
 */
async function findUserById(id) {
    const result = await pool.query(
        `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

/**
 * Crée un nouvel utilisateur.
 *
 * @param {Object} data - Données du nouvel utilisateur.
 * @param {string} data.name - Nom de l'utilisateur.
 * @param {string} data.email - Adresse email.
 * @param {string|null} [data.phone] - Numéro de téléphone.
 * @param {string} data.passwordHash - Mot de passe déjà haché.
 * @returns {Promise<Object>} L'utilisateur créé (sans hash).
 */
async function createUser({ name, email, phone, passwordHash }) {
    const result = await pool.query(
        `INSERT INTO users (name, email, phone, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING ${PUBLIC_COLUMNS}`,
        [name, email, phone || null, passwordHash]
    );

    return result.rows[0];
}

/** Colonnes modifiables lors d'une mise à jour de profil. */
const UPDATABLE_COLUMNS = ['name', 'email', 'phone'];

/**
 * Retourne les identifiants nécessaires à la vérification du mot de passe.
 *
 * @param {string} id - Identifiant UUID de l'utilisateur.
 * @returns {Promise<{id: string, password_hash: string}|null>} Identifiant et hash, ou null.
 */
async function findUserWithHashById(id) {
    const result = await pool.query(
        `SELECT id, password_hash FROM users WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

/**
 * Met à jour le profil d'un utilisateur.
 *
 * Seuls les champs présents dans `data` et présents dans la liste
 * blanche UPDATABLE_COLUMNS sont modifiés.
 *
 * @param {string} id - Identifiant UUID de l'utilisateur.
 * @param {Object} data - Champs à mettre à jour (name?, email?, phone?).
 * @returns {Promise<Object|null>} L'utilisateur mis à jour (sans hash) ou null.
 */
async function updateUser(id, data) {
    const assignments = [];
    const values = [];

    for (const column of UPDATABLE_COLUMNS) {
        if (data[column] !== undefined) {
            values.push(data[column]);
            assignments.push(`${column} = $${values.length}`);
        }
    }

    if (assignments.length === 0) {
        return null;
    }

    assignments.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await pool.query(
        `UPDATE users
         SET ${assignments.join(', ')}
         WHERE id = $${values.length}
         RETURNING ${PUBLIC_COLUMNS}`,
        values
    );

    return result.rows[0] || null;
}

/**
 * Met à jour le mot de passe d'un utilisateur.
 *
 * @param {string} id - Identifiant UUID de l'utilisateur.
 * @param {string} passwordHash - Nouveau mot de passe déjà haché.
 * @returns {Promise<Object|null>} L'utilisateur mis à jour (sans hash) ou null.
 */
async function updateUserPassword(id, passwordHash) {
    const result = await pool.query(
        `UPDATE users
         SET password_hash = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING ${PUBLIC_COLUMNS}`,
        [id, passwordHash]
    );

    return result.rows[0] || null;
}

export {
    findUserByEmail,
    findUserById,
    findUserWithHashById,
    createUser,
    updateUser,
    updateUserPassword,
};
