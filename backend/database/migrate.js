import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from '../src/config/database.js';

const MIGRATIONS_DIR = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'migrations'
);

/**
 * Crée la table de suivi des migrations si elle n'existe pas.
 *
 * @param {import('pg').PoolClient} client - Connexion PostgreSQL.
 * @returns {Promise<void>} Ne retourne aucune valeur.
 */
async function ensureMigrationsTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            filename TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

/**
 * Retourne la liste des fichiers de migration, triés par nom.
 *
 * @returns {Promise<Array<string>>} Noms de fichiers (.sql).
 */
async function listMigrationFiles() {
    const files = await fs.promises.readdir(MIGRATIONS_DIR);

    return files.filter((file) => file.endsWith('.sql')).sort();
}

/**
 * Retourne les migrations déjà appliquées.
 *
 * @param {import('pg').PoolClient} client - Connexion PostgreSQL.
 * @returns {Promise<Array<string>>} Noms des migrations déjà exécutées.
 */
async function appliedMigrations(client) {
    const result = await client.query('SELECT filename FROM schema_migrations');

    return result.rows.map((row) => row.filename);
}

/**
 * Applique toutes les migrations non encore exécutées, une par transaction.
 *
 * @returns {Promise<void>} Ne retourne aucune valeur.
 * @throws {Error} Échec d'une migration : la transaction est annulée.
 */
async function runMigrations() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await ensureMigrationsTable(client);
        await client.query('COMMIT');

        const files = await listMigrationFiles();
        const done = await appliedMigrations(client);

        const pending = files.filter((file) => !done.includes(file));

        if (pending.length === 0) {
            console.log('Aucune migration à appliquer.');
            return;
        }

        for (const file of pending) {
            const sql = await fs.promises.readFile(
                path.join(MIGRATIONS_DIR, file),
                'utf8'
            );

            try {
                await client.query('BEGIN');
                await client.query(sql);
                await client.query(
                    'INSERT INTO schema_migrations (filename) VALUES ($1)',
                    [file]
                );
                await client.query('COMMIT');

                console.log(`Migration appliquée : ${file}`);
            } catch (error) {
                await client.query('ROLLBACK');
                throw new Error(
                    `Échec de la migration ${file} : ${error.message}`
                );
            }
        }
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations();
