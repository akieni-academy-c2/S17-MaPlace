import pool from '../config/database.js';

/** Colonnes renvoyées aux clients. */
const PUBLIC_COLUMNS =
    'id, category_id, manager_id, name, address, description, status, created_at, updated_at';

/** Colonnes modifiables lors d'une mise à jour (le status a son propre endpoint). */
const UPDATABLE_COLUMNS = ['name', 'address', 'description', 'category_id'];

/**
 * Crée un établissement.
 *
 * @param {Object} data - Données de l'établissement.
 * @param {string} data.categoryId - Identifiant UUID de la catégorie.
 * @param {string} data.managerId - Identifiant UUID du gestionnaire.
 * @param {string} data.name - Nom de l'établissement.
 * @param {string} data.address - Adresse de l'établissement.
 * @param {string|null} [data.description] - Description facultative.
 * @returns {Promise<Object>} L'établissement créé.
 */
async function createEstablishment({ categoryId, managerId, name, address, description }) {
    const result = await pool.query(
        `INSERT INTO establishments (category_id, manager_id, name, address, description)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING ${PUBLIC_COLUMNS}`,
        [categoryId, managerId, name, address, description || null]
    );

    return result.rows[0];
}

/**
 * Liste les établissements gérés par un utilisateur.
 *
 * @param {string} managerId - Identifiant UUID du gestionnaire.
 * @returns {Promise<Array>} Ses établissements, du plus récent au plus ancien.
 */
async function findEstablishmentsByManager(managerId) {
    const result = await pool.query(
        `SELECT ${PUBLIC_COLUMNS}
         FROM establishments
         WHERE manager_id = $1
         ORDER BY created_at DESC`,
        [managerId]
    );

    return result.rows;
}

/**
 * Recherche un établissement par son identifiant.
 *
 * @param {string} id - Identifiant UUID de l'établissement.
 * @returns {Promise<Object|null>} L'établissement ou null.
 */
async function findEstablishmentById(id) {
    const result = await pool.query(
        `SELECT ${PUBLIC_COLUMNS} FROM establishments WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

/**
 * Met à jour les informations d'un établissement.
 *
 * Seuls les champs présents dans `data` et dans UPDATABLE_COLUMNS
 * sont modifiés.
 *
 * @param {string} id - Identifiant UUID de l'établissement.
 * @param {Object} data - Champs à mettre à jour.
 * @returns {Promise<Object|null>} L'établissement mis à jour ou null.
 */
async function updateEstablishment(id, data) {
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
        `UPDATE establishments
         SET ${assignments.join(', ')}
         WHERE id = $${values.length}
         RETURNING ${PUBLIC_COLUMNS}`,
        values
    );

    return result.rows[0] || null;
}

/**
 * Change le statut d'un établissement (ACTIVE / INACTIVE).
 *
 * @param {string} id - Identifiant UUID de l'établissement.
 * @param {'ACTIVE'|'INACTIVE'} status - Nouveau statut.
 * @returns {Promise<Object|null>} L'établissement mis à jour ou null.
 */
async function updateEstablishmentStatus(id, status) {
    const result = await pool.query(
        `UPDATE establishments
         SET status = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING ${PUBLIC_COLUMNS}`,
        [id, status]
    );

    return result.rows[0] || null;
}

export {
    createEstablishment,
    findEstablishmentsByManager,
    findEstablishmentById,
    updateEstablishment,
    updateEstablishmentStatus,
};
