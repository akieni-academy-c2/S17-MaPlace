import pool from '../config/database.js';

// Ajoute à chaque établissement les chiffres de sa file active (ouverte ou en pause) :
// numéro au guichet, nombre de clients en attente et motif de pause.
const CURRENT_QUEUE_STATS = `
  LEFT JOIN LATERAL (
    SELECT
      q.pause_reason,
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

/**
 * Liste publique des établissements avec les chiffres de leur file, triée par nom.
 * Le mot de passe (password_hash) n'est jamais renvoyé.
 */
const findAll = async () => {
  const result = await pool.query(`
    SELECT
      e.id,
      e.name,
      e.email,
      e.phone,
      e.category,
      e.description,
      e.address,
      e.district,
      e.city,
      e.opening_hours,
      e.queue_status,
      e.average_service_minutes,
      stats.pause_reason,
      stats.current_number,
      COALESCE(stats.waiting_count, 0) AS waiting_count
    FROM establishments e
    ${CURRENT_QUEUE_STATS}
    ORDER BY e.name ASC
  `);

  return result.rows;
};

/** Fiche publique d'un établissement, ou null s'il n'existe pas. */
const findById = async (id) => {
  const result = await pool.query(
    `
      SELECT
        e.id,
        e.name,
        e.email,
        e.phone,
        e.category,
        e.description,
        e.address,
        e.district,
        e.city,
        e.opening_hours,
        e.queue_status,
        e.average_service_minutes,
        stats.pause_reason,
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

/** Établissement avec son mot de passe chiffré, utilisé uniquement pour la connexion. */
const findByEmail = async (email) => {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        phone,
        category,
        queue_status,
        average_service_minutes
      FROM establishments
      WHERE email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
};

/** Enregistre la durée moyenne d'un passage ; renvoie null si l'établissement n'existe pas. */
const updateAverageServiceMinutes = async (id, minutes) => {
  const result = await pool.query(
    `
      UPDATE establishments
      SET average_service_minutes = $2
      WHERE id = $1
      RETURNING id, average_service_minutes
    `,
    [id, minutes]
  );

  return result.rows[0] || null;
};

export {
  findAll,
  findById,
  findByEmail,
  updateAverageServiceMinutes,
};