import pool from '../config/database.js';
import crypto from 'node:crypto';

const createForEstablishment = async (
  establishmentId,
  name,
  phone
) => {
  const client = await pool.connect();
  const cancelToken = crypto.randomBytes(32).toString('hex');

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

    const queueResult = await client.query(
      `
        SELECT id, status
        FROM queues
        WHERE establishment_id = $1
          AND status IN ('OPEN', 'PAUSED')
        ORDER BY opened_at DESC
        LIMIT 1
        FOR UPDATE
      `,
      [establishmentId]
    );

    if (queueResult.rowCount === 0) {
      await client.query('COMMIT');
      return {
        outcome: 'queue_not_open',
        queueStatus: 'CLOSED',
      };
    }

    const queue = queueResult.rows[0];

    if (queue.status !== 'OPEN') {
      await client.query('COMMIT');
      return {
        outcome: 'queue_not_open',
        queueStatus: queue.status,
      };
    }

    const numberResult = await client.query(
      `
        UPDATE queues
        SET last_number = last_number + 1
        WHERE id = $1
        RETURNING last_number
      `,
      [queue.id]
    );

    const ticketResult = await client.query(
      `
        INSERT INTO tickets (
          queue_id,
          number,
          name,
          phone,
          cancel_token
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, queue_id, number, name, status, created_at
      `,
      [
        queue.id,
        numberResult.rows[0].last_number,
        name,
        phone,
        cancelToken,
      ]
    );

    await client.query('COMMIT');

    return {
      outcome: 'created',
      ticket: {
        ...ticketResult.rows[0],
        cancelToken,
      },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const findById = async (ticketId) => {
  const result = await pool.query(
    `
      SELECT
        t.id,
        t.queue_id,
        t.number,
        t.name,
        t.status,
        t.created_at,
        t.updated_at,
        e.id AS establishment_id,
        e.name AS establishment_name,
        q.status AS queue_status,
        COUNT(ahead.id)::INTEGER AS people_ahead,
        (
          SELECT serving.number
          FROM tickets serving
          WHERE serving.queue_id = t.queue_id
            AND serving.status = 'SERVING'
          ORDER BY serving.number DESC
          LIMIT 1
        ) AS current_number
      FROM tickets t
      JOIN queues q ON q.id = t.queue_id
      JOIN establishments e ON e.id = q.establishment_id
      LEFT JOIN tickets ahead
        ON ahead.queue_id = t.queue_id
        AND ahead.status = 'WAITING'
        AND ahead.number < t.number
      WHERE t.id = $1
      GROUP BY t.id, e.id, e.name, q.status
    `,
    [ticketId]
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  const isWaiting = row.status === 'WAITING';
  const peopleAhead = isWaiting ? row.people_ahead : 0;

  return {
    id: row.id,
    queueId: row.queue_id,
    number: row.number,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    currentNumber: row.current_number,
    position: isWaiting ? peopleAhead + 1 : null,
    peopleAhead,
    queueStatus: row.queue_status,
    establishment: {
      id: row.establishment_id,
      name: row.establishment_name,
    },
  };
};

const findAllForCurrentQueue = async (establishmentId) => {
  const result = await pool.query(
    `
      SELECT
        t.id,
        t.queue_id AS "queueId",
        t.number,
        t.name,
        t.phone,
        t.status,
        t.created_at AS "createdAt",
        t.updated_at AS "updatedAt"
      FROM tickets t
      JOIN queues q ON q.id = t.queue_id
      WHERE q.establishment_id = $1
        AND q.status IN ('OPEN', 'PAUSED')
        AND q.id = (
          SELECT current_queue.id
          FROM queues AS current_queue
          WHERE current_queue.establishment_id = $1
            AND current_queue.status IN ('OPEN', 'PAUSED')
          ORDER BY current_queue.opened_at DESC
          LIMIT 1
        )
      ORDER BY t.number ASC
    `,
    [establishmentId]
  );

  return result.rows;
};

const callNextForEstablishment = async (establishmentId) => {
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

    const queueResult = await client.query(
      `
        SELECT id, status
        FROM queues
        WHERE establishment_id = $1
          AND status IN ('OPEN', 'PAUSED')
        ORDER BY opened_at DESC
        LIMIT 1
        FOR UPDATE
      `,
      [establishmentId]
    );

    if (queueResult.rowCount === 0) {
      await client.query('COMMIT');
      return { outcome: 'queue_not_open', queueStatus: 'CLOSED' };
    }

    const queue = queueResult.rows[0];

    if (queue.status !== 'OPEN') {
      await client.query('COMMIT');
      return {
        outcome: 'queue_not_open',
        queueStatus: queue.status,
      };
    }

    const ticketResult = await client.query(
      `
        SELECT id
        FROM tickets
        WHERE queue_id = $1 AND status = 'WAITING'
        ORDER BY number ASC
        LIMIT 1
        FOR UPDATE
      `,
      [queue.id]
    );

    if (ticketResult.rowCount === 0) {
      await client.query('COMMIT');
      return { outcome: 'no_waiting_tickets' };
    }

    await client.query(
      `
        UPDATE tickets
        SET status = 'COMPLETED'
        WHERE queue_id = $1 AND status = 'SERVING'
      `,
      [queue.id]
    );

    const result = await client.query(
      `
        UPDATE tickets
        SET status = 'SERVING'
        WHERE id = $1
        RETURNING id, queue_id, number, name, status, created_at
      `,
      [ticketResult.rows[0].id]
    );

    await client.query('COMMIT');

    return {
      outcome: 'called',
      ticket: result.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateOwnedTicketStatus = async (
  ticketId,
  establishmentId,
  allowedStatuses,
  targetStatus
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

    const ticketResult = await client.query(
      `
        SELECT
          t.id,
          t.queue_id,
          t.number,
          t.name,
          t.status,
          t.created_at,
          q.status AS queue_status
        FROM tickets t
        JOIN queues q ON q.id = t.queue_id
        WHERE t.id = $1
          AND q.establishment_id = $2
        FOR UPDATE OF q, t
      `,
      [ticketId, establishmentId]
    );

    if (ticketResult.rowCount === 0) {
      await client.query('COMMIT');
      return { outcome: 'ticket_not_found' };
    }

    const currentTicket = ticketResult.rows[0];

    if (currentTicket.queue_status === 'CLOSED') {
      await client.query('COMMIT');
      return {
        outcome: 'queue_closed',
        ticket: currentTicket,
      };
    }

    if (!allowedStatuses.includes(currentTicket.status)) {
      await client.query('COMMIT');
      return {
        outcome: 'invalid_status',
        ticket: currentTicket,
      };
    }

    const result = await client.query(
      `
        UPDATE tickets
        SET status = $2
        WHERE id = $1
        RETURNING id, queue_id, number, name, status, created_at
      `,
      [ticketId, targetStatus]
    );

    await client.query('COMMIT');

    return {
      outcome: 'updated',
      ticket: result.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const cancelByClient = async (ticketId, cancelToken) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const ticketResult = await client.query(
      `
        SELECT
          id,
          queue_id,
          number,
          name,
          status,
          created_at
        FROM tickets
        WHERE id = $1
          AND cancel_token = $2
        FOR UPDATE
      `,
      [ticketId, cancelToken]
    );

    if (ticketResult.rowCount === 0) {
      await client.query('COMMIT');

      return {
        outcome: 'ticket_not_found',
      };
    }

    const ticket = ticketResult.rows[0];

    if (ticket.status !== 'WAITING') {
      await client.query('COMMIT');

      return {
        outcome: 'invalid_status',
        ticket,
      };
    }

    const result = await client.query(
      `
        UPDATE tickets
        SET status = 'CANCELLED'
        WHERE id = $1
        RETURNING id, queue_id, number, name, status, created_at
      `,
      [ticketId]
    );

    await client.query('COMMIT');

    return {
      outcome: 'updated',
      ticket: result.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export {
  callNextForEstablishment,
  cancelByClient,
  createForEstablishment,
  findAllForCurrentQueue,
  findById,
  updateOwnedTicketStatus,
};