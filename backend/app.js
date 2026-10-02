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

// ==========================================
// MIDDLEWARES
// ==========================================

app.use(express.json());

// ==========================================
// ROUTES
// ==========================================

app.get('/', (req, res) => {
  res.json({
    message: 'Ma Place API',
  });
});

// Vérification de l'API et de PostgreSQL.
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

// Authentification des établissements.
app.use('/api/auth', authRoutes);

// Gestion des établissements.
app.use(
  '/api/establishments',
  establishmentRoutes
);

// Gestion de la file par l'établissement authentifié.
app.use('/api/queue', queueRoutes);

// Création et suivi des tickets visiteurs.
app.use('/api/tickets', ticketRoutes);

// ==========================================
// GESTION DES ERREURS
// ==========================================

app.use(errorMiddleware);

// ==========================================
// SERVEUR
// ==========================================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});