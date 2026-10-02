import 'dotenv/config';
import express from 'express';
import pool from './src/config/database.js';
import authRouter from './src/route/auth.js';
import userRouter from './src/route/user.js';
import establishmentRouter from './src/route/establishment.js';
import categoryRouter from './src/route/category.js';
import serviceRouter from './src/route/service.js';
import queueRouter from './src/route/queue.js';
import { notFound, errorHandler } from './src/middleware/errorHandler.js';

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

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/establishments', establishmentRouter);
app.use('/api/establishments', serviceRouter);
app.use('/api/establishments', queueRouter);
app.use('/api/categories', categoryRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});