import express from 'express';
import 'dotenv/config';
import pool from './src/config/database.js';

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');

        res.json({
            message: 'Ma Place API fonctionne',
            database: result.rows[0],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Erreur de connexion à la base de données',
        });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});