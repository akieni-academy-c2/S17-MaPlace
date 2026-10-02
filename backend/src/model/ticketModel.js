import crypto from 'node:crypto';
import pool from '../config/database.js';

/** Colonnes renvoyées aux clients. */
const PUBLIC_COLUMNS =
    'id, queue_id, user_id, name, phone, number, status, channel, ' +
    'tracking_token, created_at, updated_at, called_at, completed_at';

/** Statuts d'un ticket encore actif dans la file. */
const ACTIVE_STATUSES = ['WAITING', 'CALLED', 'IN_SERVICE'];

/** Statuts depuis lesquels le client peut quitter la file. */
const CANCELLABLE_STATUSES = ['WAITING', 'CALLED'];

/**
 * Génère le jeton de suivi anonyme d'un ticket.
 *
 * @returns {string} Jeton URL-sûr de 24 caractères.
 */
function generateTrackingToken() {
    return crypto.randomBytes(18).toString('base64url');
}

/**
 * Crée un ticket dans une file, avec son numéro séquentiel.
 *
 * La file est verrouillée (SELECT ... FOR UPDATE) pendant la transaction :
 * deux créations concurrentes ne peuvent pas obtenir le même numéro.
 * L'événement de naissance du ticket est consigné dans ticket_events.
 *
 * @param {Object} data - Données du ticket.
 * @param {string} data.queueId - Identifiant UUID de la file.
 * @param {string|null} data.userId - Identifiant de l'utilisateur ou null (anonyme).
 * @param {string} data.name - Nom de la personne.
 * @param {string} data.phone - Téléphone de la personne.
 * @param {string} data.channel - Canal : ONLINE ou PHYSICAL.
 * @returns {Promise<Object>} Le ticket créé.
 */
async function createTicket({ queueId, userId, name, phone, channel }) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Verrouille la file : sérialise les créations concurrentes.
        const lock = await client.query(
            'SELECT id FROM queues WHERE id = $1 FOR UPDATE',
            [queueId]
        );

        if (lock.rowCount === 0) {
            throw new Error('File d\'attente introuvable.');
        }

        const sequence = await client.query(
            `SELECT COALESCE(MAX(number), 0) + 1 AS next_number
               FROM tickets
              WHERE queue_id = $1`,
            [queueId]
        );

        const number = sequence.rows[0].next_number;
        const trackingToken = generateTrackingToken();

        const created = await client.query(
            `INSERT INTO tickets
                (queue_id, user_id, name, phone, number, status, channel, tracking_token)
             VALUES ($1, $2, $3, $4, $5, 'WAITING', $6, $7)
             RETURNING ${PUBLIC_COLUMNS}`,
            [queueId, userId, name, phone, number, channel, trackingToken]
        );

        const ticket = created.rows[0];

        await client.query(
            `INSERT INTO ticket_events (ticket_id, old_status, new_status, actor_id)
             VALUES ($1, NULL, $2, $3)`,
            [ticket.id, ticket.status, userId]
        );

        await client.query('COMMIT');

        return ticket;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Retourne le ticket actif d'un utilisateur dans une file.
 *
 * @param {string} queueId - Identifiant UUID de la file.
 * @param {string} userId - Identifiant UUID de l'utilisateur.
 * @returns {Promise<Object|null>} Le ticket ou null.
 */
async function findActiveTicketByUser(queueId, userId) {
    const result = await pool.query(
        `SELECT ${PUBLIC_COLUMNS}
           FROM tickets
          WHERE queue_id = $1
            AND user_id = $2
            AND status IN ('WAITING', 'CALLED', 'IN_SERVICE')
          LIMIT 1`,
        [queueId, userId]
    );

    return result.rows[0] || null;
}

/**
 * Retourne un ticket à partir de son jeton de suivi.
 *
 * @param {string} trackingToken - Jeton de suivi du ticket.
 * @returns {Promise<Object|null>} Le ticket ou null.
 */
async function findByTrackingToken(trackingToken) {
    const result = await pool.query(
        `SELECT ${PUBLIC_COLUMNS}
           FROM tickets
          WHERE tracking_token = $1
          LIMIT 1`,
        [trackingToken]
    );

    return result.rows[0] || null;
}

/**
 * Compte les personnes encore devant un numéro donné dans une file.
 *
 * Seuls les tickets actifs comptent : un ticket annulé ou terminé ne bloque plus.
 *
 * @param {string} queueId - Identifiant UUID de la file.
 * @param {number} number - Numéro du ticket courant.
 * @returns {Promise<number>} Nombre de personnes devant.
 */
async function countPeopleAhead(queueId, number) {
    const result = await pool.query(
        `SELECT COUNT(*)::int AS total
           FROM tickets
          WHERE queue_id = $1
            AND number < $2
            AND status IN ('WAITING', 'CALLED', 'IN_SERVICE')`,
        [queueId, number]
    );

    return result.rows[0].total;
}

/**
 * Calcule la position d'un ticket dans sa file.
 *
 * @param {Object} ticket - Ticket concerné.
 * @returns {Promise<number|null>} Position (1 = premier) ou null si le ticket
 *                                 n'est plus actif.
 */
async function getPosition(ticket) {
    if (!ACTIVE_STATUSES.includes(ticket.status)) {
        return null;
    }

    const peopleAhead = await countPeopleAhead(ticket.queue_id, ticket.number);

    return peopleAhead + 1;
}

/**
 * Annule logiquement le ticket (status → CANCELLED) et consigne l'événement.
 *
 * @param {Object} ticket - Ticket à annuler.
 * @param {string|null} [actorId] - Utilisateur ayant annulé (null si anonyme).
 * @returns {Promise<Object|null>} Le ticket annulé ou null si l'état interdit
 *                                 l'annulation.
 */
async function cancelTicket(ticket, actorId = null) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const updated = await client.query(
            `UPDATE tickets
                SET status = 'CANCELLED',
                    updated_at = CURRENT_TIMESTAMP
              WHERE id = $1
                AND status = ANY($2::ticket_status[])
             RETURNING ${PUBLIC_COLUMNS}`,
            [ticket.id, CANCELLABLE_STATUSES]
        );

        if (updated.rowCount === 0) {
            await client.query('ROLLBACK');
            return null;
        }

        const cancelled = updated.rows[0];

        await client.query(
            `INSERT INTO ticket_events (ticket_id, old_status, new_status, actor_id)
             VALUES ($1, $2, $3, $4)`,
            [cancelled.id, ticket.status, cancelled.status, actorId]
        );

        await client.query('COMMIT');

        return cancelled;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export {
    createTicket,
    findActiveTicketByUser,
    findByTrackingToken,
    countPeopleAhead,
    getPosition,
    cancelTicket,
    ACTIVE_STATUSES,
    CANCELLABLE_STATUSES,
};
