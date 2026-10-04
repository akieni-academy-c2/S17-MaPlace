import pool from '../config/database.js';

const findCurrentByEstablishmentId = async (establishmentId) => {
  const result = await pool.query(
    `
      SELECT
        e.id AS establishment_id,
        e.queue_status AS establishment_queue_status,
        q.id AS queue_id,
        q.status AS queue_status,
        q.last_number,
        q.pause_reason,
        q.opened_at,
        q.closed_at,
        q.created_at,
        q.updated_at
      FROM establishments e
      LEFT JOIN LATERAL (
        SELECT
          id,
          status,
          last_number,
          pause_reason,
          opened_at,
          closed_at,
          created_at,
          updated_at
        FROM queues
        WHERE establishment_id = e.id
          AND status IN ('OPEN', 'PAUSED')
        ORDER BY opened_at DESC
        LIMIT 1
      ) q ON TRUE
      WHERE e.id = $1
    `,
    [establishmentId]
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  if (!row.queue_id) {
    return {
      queue: null,
      queueStatus: 'CLOSED',
    };
  }

  return {
    queue: {
      id: row.queue_id,
      status: row.queue_status,
      last_number: row.last_number,
      pause_reason: row.pause_reason,
      opened_at: row.opened_at,
      closed_at: row.closed_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    queueStatus: row.queue_status,
  };
};

const openForEstablishment = async (establishmentId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const establishment = await client.query(
      'SELECT id FROM establishments WHERE id = $1 FOR UPDATE',
      [establishmentId]
    );

    if (establishment.rowCount === 0) {
      await client.query('COMMIT');
      return { outcome: 'establishment_not_found' };
    }

    const currentQueue = await client.query(
      `
        SELECT *
        FROM queues
        WHERE establishment_id = $1
          AND status IN ('OPEN', 'PAUSED')
        ORDER BY opened_at DESC
        LIMIT 1
        FOR UPDATE
      `,
      [establishmentId]
    );

    if (currentQueue.rowCount > 0) {
      await client.query('COMMIT');
      return {
        outcome: 'queue_already_active',
        queue: currentQueue.rows[0],
      };
    }

    const result = await client.query(
      `
        INSERT INTO queues (establishment_id, status)
        VALUES ($1, 'OPEN')
        RETURNING *
      `,
      [establishmentId]
    );

    await client.query(
      "UPDATE establishments SET queue_status = 'OPEN' WHERE id = $1",
      [establishmentId]
    );

    await client.query('COMMIT');

    return {
      outcome: 'opened',
      queue: result.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// `pauseReason` : motif enregistré avec une pause ('NEXT_DAY'), effacé par
// toute autre transition.
const transitionCurrentStatus = async (
  establishmentId,
  allowedStatuses,
  targetStatus,
  { pauseReason = null } = {}
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const establishment = await client.query(
      'SELECT id FROM establishments WHERE id = $1 FOR UPDATE',
      [establishmentId]
    );

    if (establishment.rowCount === 0) {
      await client.query('COMMIT');
      return { outcome: 'establishment_not_found' };
    }

    const currentQueue = await client.query(
      `
        SELECT *
        FROM queues
        WHERE establishment_id = $1
          AND status IN ('OPEN', 'PAUSED')
        ORDER BY opened_at DESC
        LIMIT 1
        FOR UPDATE
      `,
      [establishmentId]
    );

    if (currentQueue.rowCount === 0) {
      await client.query('COMMIT');
      return { outcome: 'no_active_queue' };
    }

    const queue = currentQueue.rows[0];

    if (!allowedStatuses.includes(queue.status)) {
      await client.query('COMMIT');
      return {
        outcome: 'invalid_transition',
        queue,
      };
    }

    const result = await client.query(
      `
        UPDATE queues
        SET
          status = $2::queue_status,
          pause_reason = $3,
          closed_at = CASE
            WHEN $2::queue_status = 'CLOSED'::queue_status THEN NOW()
            ELSE NULL
          END
        WHERE id = $1
        RETURNING *
      `,
      [queue.id, targetStatus, pauseReason]
    );

    // Report au lendemain : le client au guichet est servi, les tickets en
    // attente sont conservés avec leur numéro jusqu'à la reprise.
    if (pauseReason === 'NEXT_DAY') {
      await client.query(
        `
          UPDATE tickets
          SET status = 'COMPLETED'
          WHERE queue_id = $1 AND status = 'SERVING'
        `,
        [queue.id]
      );
    }

    // Fermeture : les tickets non traités sont réinitialisés. Le client au
    // guichet est considéré comme servi, les tickets en attente sont annulés
    // (la numérotation repart de #1 à la prochaine ouverture).
    if (targetStatus === 'CLOSED') {
      await client.query(
        `
          UPDATE tickets
          SET status = CASE
            WHEN status = 'SERVING' THEN 'COMPLETED'::ticket_status
            ELSE 'CANCELLED'::ticket_status
          END
          WHERE queue_id = $1
            AND status IN ('WAITING', 'SERVING')
        `,
        [queue.id]
      );
    }

    await client.query(
      'UPDATE establishments SET queue_status = $1 WHERE id = $2',
      [targetStatus, establishmentId]
    );

    await client.query('COMMIT');

    return {
      outcome: 'transitioned',
      queue: result.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export {
  findCurrentByEstablishmentId,
  openForEstablishment,
  transitionCurrentStatus,
};
