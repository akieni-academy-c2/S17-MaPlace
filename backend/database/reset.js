import { readFile } from 'node:fs/promises';
import pool from '../src/config/database.js';

// Recrée la base à partir de schema.sql : supprime les objets de
// l'application (tables, types, fonction) puis rejoue le schéma complet.
// Toutes les données sont perdues : à lancer avant `npm run seed`.
const DROP_OBJECTS = `
  DROP TABLE IF EXISTS tickets, queues, establishments CASCADE;
  DROP TYPE IF EXISTS ticket_status, queue_status, establishment_category CASCADE;
  DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
`;

const reset = async () => {
  const client = await pool.connect();

  try {
    console.log('Resetting database schema...');

    const schema = await readFile(
      new URL('./schema.sql', import.meta.url),
      'utf8'
    );

    await client.query('BEGIN');
    await client.query(DROP_OBJECTS);
    await client.query(schema);
    await client.query('COMMIT');

    console.log('Database schema created successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database reset failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

reset();
