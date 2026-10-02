import pool from '../config/database.js';

/** Colonnes renvoyées aux clients. */
const PUBLIC_COLUMNS =
    'id, establishment_id, service_id, date, status, opened_at, closed_at';

/**
 * Crée la file d'attente d'un service pour la journée courante.
 *
 * La date vaut CURRENT_DATE (défaut de la colonne) : c'est la règle d'or,
 * une file = un service + une journée. L'état initial est OPEN.
 *
 * @param {Object} data - Données de la file.
 * @param {string} data.establishmentId - Identifiant UUID de l'établissement.
 * @param {string} data.serviceId - Identifiant UUID du service.
 * @returns {Promise<Object>} La file créée.
 */
async function createQueue({ establishmentId, serviceId }) {
    const result = await pool.query(
        `INSERT INTO queues (establishment_id, service_id)
         VALUES ($1, $2)
         RETURNING ${PUBLIC_COLUMNS}`,
        [establishmentId, serviceId]
    );

    return result.rows[0];
}

/**
 * Retourne la file d'attente du jour pour un service.
 *
 * @param {string} serviceId - Identifiant UUID du service.
 * @param {string|null} [date] - Date AAAA-MM-JJ (défaut : aujourd'hui).
 * @returns {Promise<Object|null>} La file ou null si elle n'existe pas.
 */
async function findQueueByServiceAndDate(serviceId, date = null) {
    const result = await pool.query(
        `SELECT ${PUBLIC_COLUMNS}
           FROM queues
          WHERE service_id = $1
            AND date = COALESCE($2::date, CURRENT_DATE)
          LIMIT 1`,
        [serviceId, date]
    );

    return result.rows[0] || null;
}

/**
 * Compte les files d'attente rattachées à un service.
 *
 * Sert à refuser la suppression d'un service qui a un historique (FK RESTRICT).
 *
 * @param {string} serviceId - Identifiant UUID du service.
 * @returns {Promise<number>} Nombre de files liées à ce service.
 */
async function countQueuesByService(serviceId) {
    const result = await pool.query(
        'SELECT COUNT(*)::int AS total FROM queues WHERE service_id = $1',
        [serviceId]
    );

    return result.rows[0].total;
}

/**
 * Change l'état d'une file d'attente.
 *
 * Lorsque la file passe à CLOSED, l'horodatage de fermeture est renseigné.
 *
 * @param {string} id - Identifiant UUID de la file.
 * @param {string} status - Nouvel état (OPEN, PAUSED, REGISTRATION_CLOSED, CLOSED).
 * @returns {Promise<Object|null>} La file mise à jour ou null.
 */
async function updateQueueStatus(id, status) {
    const result = await pool.query(
        `UPDATE queues
            SET status = $2,
                closed_at = CASE
                    WHEN $2::queue_status = 'CLOSED' THEN CURRENT_TIMESTAMP
                    ELSE NULL
                END,
                opened_at = CASE
                    WHEN $2::queue_status = 'OPEN' THEN CURRENT_TIMESTAMP
                    ELSE opened_at
                END
          WHERE id = $1
          RETURNING ${PUBLIC_COLUMNS}`,
        [id, status]
    );

    return result.rows[0] || null;
}

/**
 * Retourne les statistiques de présence d'une file d'attente.
 *
 * - peoplePresent : personnes encore en file (WAITING, CALLED, IN_SERVICE).
 * - currentTicket : ticket en cours appelé (CALLED ou IN_SERVICE), le plus récent.
 *
 * @param {string} queueId - Identifiant UUID de la file.
 * @returns {Promise<Object>} { peoplePresent: number, currentTicket: Object|null }.
 */
async function getQueueStats(queueId) {
    const result = await pool.query(
        `SELECT
            (SELECT COUNT(*)::int
               FROM tickets
              WHERE queue_id = $1
                AND status IN ('WAITING', 'CALLED', 'IN_SERVICE')) AS people_present,
            (SELECT row_to_json(t)
               FROM (
                    SELECT id, number, status, name
                      FROM tickets
                     WHERE queue_id = $1
                       AND status IN ('CALLED', 'IN_SERVICE')
                     ORDER BY called_at DESC NULLS LAST
                     LIMIT 1
               ) t) AS current_ticket`,
        [queueId]
    );

    const row = result.rows[0];

    return {
        peoplePresent: row.people_present,
        currentTicket: row.current_ticket || null,
    };
}

export {
    createQueue,
    findQueueByServiceAndDate,
    countQueuesByService,
    updateQueueStatus,
    getQueueStats,
};
