import pool from '../config/database.js';

/**
 * Liste les catégories actives.
 *
 * @returns {Promise<Array>} Liste des catégories (id, designation, status).
 */
async function listCategories() {
    const result = await pool.query(
        `SELECT id, designation, status
         FROM categories
         WHERE status = TRUE
         ORDER BY designation`
    );

    return result.rows;
}

/**
 * Recherche une catégorie par son identifiant.
 *
 * @param {string} id - Identifiant UUID de la catégorie.
 * @returns {Promise<Object|null>} La catégorie ou null.
 */
async function findCategoryById(id) {
    const result = await pool.query(
        `SELECT id, designation, status FROM categories WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

export { listCategories, findCategoryById };
