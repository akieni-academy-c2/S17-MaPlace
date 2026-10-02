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
    customerName: 'Jean',
    customerPhone: '0611111111',
    status: 'COMPLETED',
  },
  {
    establishmentEmail: 'pharmacie@example.com',
    number: 2,
    customerName: 'Paul',
    customerPhone: '0622222222',
    status: 'SERVING',
  },
  {
    establishmentEmail: 'pharmacie@example.com',
    number: 3,
    customerName: 'Marie',
    customerPhone: '0633333333',
    status: 'WAITING',
  },
  {
    establishmentEmail: 'pharmacie@example.com',
    number: 4,
    customerName: 'David',
    customerPhone: '0644444444',
    status: 'WAITING',
  },
];

const seed = async () => {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seed...');

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

      console.log(
        `🏢 Created: ${establishment.name}`
      );
    }

    // ==========================================
    // CRÉATION DES TICKETS
    // ==========================================

    for (const ticket of tickets) {
      const establishmentId =
        establishmentIds[ticket.establishmentEmail];

      await client.query(
        `
          INSERT INTO tickets (
            establishment_id,
            number,
            customer_name,
            customer_phone,
            status
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          establishmentId,
          ticket.number,
          ticket.customerName,
          ticket.customerPhone,
          ticket.status,
        ]
      );

      console.log(
        `🎟️ Created ticket #${ticket.number}`
      );
    }

    await client.query('COMMIT');

    console.log('✅ Database seed completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('❌ Database seed failed:', error);

    process.exitCode = 1;
  } finally {
    client.release();

    await pool.end();
  }
};

seed();