import express from 'express';
import 'dotenv/config';

import pool from './src/config/database.js';

import authRoutes from './src/routes/authRoutes.js';
import establishmentRoutes
  from './src/routes/establishmentRoutes.js';
import queueRoutes from './src/routes/queueRoutes.js';
import ticketRoutes from './src/routes/ticketRoutes.js';

import errorMiddleware
  from './src/middleware/errorMiddleware.js';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Ma Place API',
  });
});

app.get('/health', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);

app.use(
  '/api/establishments',
  establishmentRoutes
);

app.use('/api/queue', queueRoutes);

app.use('/api/tickets', ticketRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});