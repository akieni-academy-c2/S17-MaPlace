import pool from '../config/database.js';

/** Colonnes renvoyées aux clients. */
const PUBLIC_COLUMNS =
    'id, establishment_id, name, description, status, created_at, updated_at';

/** Colonnes modifiables lors d'une mise à jour. */
const UPDATABLE_COLUMNS = ['name', 'description'];

/**
 * Crée un service dans un établissement.
 *
 * @param {Object} data - Données du service.
 * @param {string} data.establishmentId - Identifiant UUID de l'établissement.
 * @param {string} data.name - Nom du service.
 * @param {string|null} [data.description] - Description facultative.
 * @returns {Promise<Object>} Le service créé.
 */
async function createService({ establishmentId, name, description }) {
    const result = await pool.query(
        `INSERT INTO services (establishment_id, name, description)
         VALUES ($1, $2, $3)
         RETURNING ${PUBLIC_COLUMNS}`,
        [establishmentId, name, description || null]
    );

    return result.rows[0];
}

/**
 * Liste les services actifs d'un établissement.
 *
 * @param {string} establishmentId - Identifiant UUID de l'établissement.
 * @returns {Promise<Array>} Les services de l'établissement.
 */
async function findServicesByEstablishment(establishmentId) {
    const result = await pool.query(
        `SELECT ${PUBLIC_COLUMNS}
         FROM services
         WHERE establishment_id = $1
         ORDER BY name`,
        [establishmentId]
    );

    return result.rows;
}

/**
 * Recherche un service par son identifiant.
 *
 * @param {string} id - Identifiant UUID du service.
 * @returns {Promise<Object|null>} Le service ou null.
 */
async function findServiceById(id) {
    const result = await pool.query(
        `SELECT ${PUBLIC_COLUMNS} FROM services WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

/**
 * Recherche un service portant déjà ce nom dans un établissement.
 *
 * @param {string} establishmentId - Identifiant UUID de l'établissement.
 * @param {string} name - Nom du service.
 * @param {string|null} [excludeId] - Identifiant du service à exclure (mise à jour).
 * @returns {Promise<Object|null>} Le service en conflit ou null.
 */
async function findServiceByName(establishmentId, name, excludeId = null) {
    const result = await pool.query(
        `SELECT ${PUBLIC_COLUMNS}
         FROM services
         WHERE establishment_id = $1
           AND LOWER(name) = LOWER($2)
           AND ($3::uuid IS NULL OR id <> $3)
         LIMIT 1`,
        [establishmentId, name, excludeId]
    );

    return result.rows[0] || null;
}

/**
 * Met à jour les informations d'un service.
 *
 * @param {string} id - Identifiant UUID du service.
 * @param {Object} data - Champs à mettre à jour (name?, description?).
 * @returns {Promise<Object|null>} Le service mis à jour ou null.
 */
async function updateService(id, data) {
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
        `UPDATE services
         SET ${assignments.join(', ')}
         WHERE id = $${values.length}
         RETURNING ${PUBLIC_COLUMNS}`,
        values
    );

    return result.rows[0] || null;
}

/**
 * Active ou désactive un service.
 *
 * @param {string} id - Identifiant UUID du service.
 * @param {boolean} status - True pour activer, False pour désactiver.
 * @returns {Promise<Object|null>} Le service mis à jour ou null.
 */
async function updateServiceStatus(id, status) {
    const result = await pool.query(
        `UPDATE services
         SET status = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING ${PUBLIC_COLUMNS}`,
        [id, status]
    );

    return result.rows[0] || null;
}

/**
 * Supprime un service.
 *
 * @param {string} id - Identifiant UUID du service.
 * @returns {Promise<boolean>} True si un service a été supprimé.
 */
async function deleteService(id) {
    const result = await pool.query(
        'DELETE FROM services WHERE id = $1',
        [id]
    );

    return result.rowCount > 0;
}

export {
    createService,
    findServicesByEstablishment,
    findServiceById,
    findServiceByName,
    updateService,
    updateServiceStatus,
    deleteService,
};
