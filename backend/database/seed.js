import bcrypt from 'bcrypt';
import pool from '../src/config/database.js';

const establishments = [
  {
    name: 'Pharmacie Centrale',
    email: 'pharmacie@example.com',
    password: 'password123',
    phone: '0600000001',
    queueStatus: 'OPEN',
  },
  {
    name: 'Salon Élégance',
    email: 'salon@example.com',
    password: 'password123',
    phone: '0600000002',
    queueStatus: 'CLOSED',
  },
  {
    name: 'Centre Administratif',
    email: 'administration@example.com',
    password: 'password123',
    phone: '0600000003',
    queueStatus: 'CLOSED',
  },
];

const tickets = [
  {
    establishmentEmail: 'pharmacie@example.com',
    number: 1,
    name: 'Jean',
    phone: '0611111111',
    status: 'COMPLETED',
  },
  {
    establishmentEmail: 'pharmacie@example.com',
    number: 2,
    name: 'Paul',
    phone: '0622222222',
    status: 'SERVING',
  },
  {
    establishmentEmail: 'pharmacie@example.com',
    number: 3,
    name: 'Marie',
    phone: '0633333333',
    status: 'WAITING',
  },
  {
    establishmentEmail: 'pharmacie@example.com',
    number: 4,
    name: 'David',
    phone: '0644444444',
    status: 'WAITING',
  },
];

const seed = async () => {
  const client = await pool.connect();

  try {
    console.log('Starting database seed...');

    await client.query('BEGIN');

    // ==========================================
    // RESET DES DONNÉES
    // ==========================================

    await client.query('DELETE FROM tickets');
    await client.query('DELETE FROM establishments');

    // ==========================================
    // CRÉATION DES ÉTABLISSEMENTS
    // ==========================================

    const establishmentIds = {};
    const queueIds = {};

    for (const establishment of establishments) {
      const passwordHash = await bcrypt.hash(
        establishment.password,
        10
      );

      const result = await client.query(
        `
          INSERT INTO establishments (
            name,
            email,
            password_hash,
            phone,
            queue_status
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `,
        [
          establishment.name,
          establishment.email,
          passwordHash,
          establishment.phone,
          establishment.queueStatus,
        ]
      );

      establishmentIds[establishment.email] =
        result.rows[0].id;

      const lastNumber = tickets.reduce(
        (highest, ticket) =>
          ticket.establishmentEmail === establishment.email
            ? Math.max(highest, ticket.number)
            : highest,
        0
      );

      const queueResult = await client.query(
        `
          INSERT INTO queues (
            establishment_id,
            status,
            last_number,
            closed_at
          )
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `,
        [
          establishmentIds[establishment.email],
          establishment.queueStatus,
          lastNumber,
          establishment.queueStatus === 'CLOSED'
            ? new Date()
            : null,
        ]
      );

      queueIds[establishment.email] =
        queueResult.rows[0].id;

      console.log(
        `Created: ${establishment.name}`
      );
    }

    // ==========================================
    // CRÉATION DES TICKETS
    // ==========================================
    for (const ticket of tickets) {
      const queueId = queueIds[ticket.establishmentEmail];

      await client.query(
        `
          INSERT INTO tickets (
            queue_id,
            number,
            name,
            phone,
            status
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          queueId,
          ticket.number,
          ticket.name,
          ticket.phone,
          ticket.status,
        ]
      );

      console.log(
        `Created ticket #${ticket.number}`
      );
    }

    await client.query('COMMIT');

    console.log('Database seed completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('Database seed failed:', error);

    process.exitCode = 1;
  } finally {
    client.release();

    await pool.end();
  }
};

seed();