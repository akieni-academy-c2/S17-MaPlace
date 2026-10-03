import pool from '../config/database.js';

// Indicateurs publics de la file active (OPEN/PAUSED) la plus récente :
// numéro actuellement au guichet (SERVING) et nombre de tickets WAITING.
// Lecture seule : aucune incidence sur les transitions de file ou de ticket.
const CURRENT_QUEUE_STATS = `
  LEFT JOIN LATERAL (
    SELECT
      (
        SELECT t.number
        FROM tickets t
        WHERE t.queue_id = q.id AND t.status = 'SERVING'
        ORDER BY t.number DESC
        LIMIT 1
      ) AS current_number,
      (
        SELECT COUNT(*)::INTEGER
        FROM tickets t
        WHERE t.queue_id = q.id AND t.status = 'WAITING'
      ) AS waiting_count
    FROM queues q
    WHERE q.establishment_id = e.id
      AND q.status IN ('OPEN', 'PAUSED')
    ORDER BY q.opened_at DESC
    LIMIT 1
  ) stats ON TRUE
`;

// Les requêtes publiques n'exposent pas password_hash.
const findAll = async () => {
  const result = await pool.query(`
    SELECT
      e.id,
      e.name,
      e.email,
      e.phone,
      e.queue_status,
      stats.current_number,
      COALESCE(stats.waiting_count, 0) AS waiting_count
    FROM establishments e
    ${CURRENT_QUEUE_STATS}
    ORDER BY e.name ASC
  `);

  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query(
    `
      SELECT
        e.id,
        e.name,
        e.email,
        e.phone,
        e.queue_status,
        stats.current_number,
        COALESCE(stats.waiting_count, 0) AS waiting_count
      FROM establishments e
      ${CURRENT_QUEUE_STATS}
      WHERE e.id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};

const findByEmail = async (email) => {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        phone,
        queue_status
      FROM establishments
      WHERE email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
};

export {
  findAll,
  findById,
  findByEmail,
};