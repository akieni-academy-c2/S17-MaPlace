import 'dotenv/config';
import express from 'express';
import pool from './src/config/database.js';
import authRouter from './src/route/auth.js';
import userRouter from './src/route/user.js';
import establishmentRouter from './src/route/establishment.js';
import categoryRouter from './src/route/category.js';
import serviceRouter from './src/route/service.js';
import queueRouter from './src/route/queue.js';
import ticketRouter from './src/route/ticket.js';
import { notFound, errorHandler } from './src/middleware/errorHandler.js';

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
            message: 'Ma Place API fonctionne',
    });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
// Les tickets sont publics (client anonyme possible) : ils doivent être
// montés AVANT les routeurs qui imposent authenticate sur /api/establishments.
app.use('/api/establishments', ticketRouter);
app.use('/api/establishments', establishmentRouter);
app.use('/api/establishments', serviceRouter);
app.use('/api/establishments', queueRouter);
app.use('/api/categories', categoryRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});