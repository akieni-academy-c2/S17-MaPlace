import { Router } from 'express';

import {
  login,
  me,
} from '../controllers/authController.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Route publique : permet à l'établissement
// de récupérer son JWT.
router.post('/login', login);

// Route protégée : nécessite un JWT valide.
router.get('/me', authMiddleware, me);

export default router;