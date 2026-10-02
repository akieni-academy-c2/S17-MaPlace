import express from 'express';
import 'dotenv/config';

import pool from './src/config/database.js';

import authRoutes from './src/routes/authRoutes.js';
import errorMiddleware from './src/middleware/errorMiddleware.js';

const app = express();

const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARES GÉNÉRAUX
// ==========================================

// Permet à Express de comprendre les requêtes
// contenant un body JSON.
app.use(express.json());

// ==========================================
// ROUTES
// ==========================================

// Route de base pour vérifier que l'API fonctionne.
app.get('/', (req, res) => {
  res.json({
    message: 'Ma Place API',
  });
});

// Vérifie à la fois Express et PostgreSQL.
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

// Toutes les routes d'authentification
// commencent par /api/auth.
app.use('/api/auth', authRoutes);

// ==========================================
// GESTION DES ERREURS
// ==========================================

// Ce middleware doit être placé après les routes
// pour pouvoir récupérer leurs erreurs.
app.use(errorMiddleware);

// ==========================================
// DÉMARRAGE DU SERVEUR
// ==========================================

app.listen(PORT, () => {
  console.log(
    `server running on http://localhost:${PORT}`
  );
});