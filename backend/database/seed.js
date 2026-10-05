import bcrypt from 'bcrypt';
import pool from '../src/config/database.js';

const establishments = [
  {
    name: 'Pharmacie Centrale',
    email: 'pharmacie@example.com',
    password: 'password123',
    phone: '0600000001',
    queueStatus: 'OPEN',
    averageServiceMinutes: 5,
  },
  {
    name: 'Salon Élégance',
    email: 'salon@example.com',
    password: 'password123',
    phone: '0600000002',
    queueStatus: 'CLOSED',
    averageServiceMinutes: 30,
  },
  {
    name: 'Centre Administratif',
    email: 'administration@example.com',
    password: 'password123',
    phone: '0600000003',
    queueStatus: 'CLOSED',
    averageServiceMinutes: 10,
  },
];

const seed = async () => {
  const client = await pool.connect();

  try {
    console.log('Starting database seed...');

    await client.query('BEGIN');

    await client.query('DELETE FROM tickets');
    await client.query('DELETE FROM queues');
    await client.query('DELETE FROM establishments');

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
            queue_status,
            average_service_minutes
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `,
        [
          establishment.name,
          establishment.email,
          passwordHash,
          establishment.phone,
          establishment.queueStatus,
          establishment.averageServiceMinutes,
        ]
      );

      const establishmentId = result.rows[0].id;

      if (establishment.queueStatus === 'OPEN') {
        await client.query(
          `
            INSERT INTO queues (
              establishment_id,
              status,
              last_number,
              opened_at
            )
            VALUES ($1, 'OPEN', 0, NOW())
          `,
          [establishmentId]
        );
      }
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