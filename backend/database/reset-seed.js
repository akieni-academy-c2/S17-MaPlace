import pool from '../src/config/database.js';

import {
    seedCategories,
    seedUsers,
    seedEstablishments
} from './seed.js';

async function resetDatabase(client) {
    await client.query(`
        TRUNCATE TABLE
            ticket_events,
            tickets,
            queues,
            establishments,
            categories,
            users
        RESTART IDENTITY CASCADE
    `);

    console.log('Base de données réinitialisée.');
}

async function resetAndSeed() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Réinitialisation de la base...\n');

        await resetDatabase(client);

        console.log('\nInsertion des données...\n');

        await seedCategories(client);
        await seedUsers(client);
        await seedEstablishments(client);

        await client.query('COMMIT');

        console.log(
            '\nReset + seed terminé avec succès.'
        );
    } catch (error) {
        await client.query('ROLLBACK');

        console.error(
            'Erreur pendant le reset + seed :',
            error.message
        );

        console.error(
            'Toutes les opérations ont été annulées.'
        );
    } finally {
        client.release();
        await pool.end();
    }
}

resetAndSeed();