import { Router } from 'express';
import { getMe, updateMe, updateMyPassword } from '../controller/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Toutes les routes users sont protégées par l'authentification.
router.use(authenticate);

/** GET /api/users/me — utilisateur connecté. */
router.get('/me', getMe);

/** PATCH /api/users/me — met à jour le profil (nom, email, téléphone). */
router.patch('/me', updateMe);

/** PATCH /api/users/me/password — change le mot de passe. */
router.patch('/me/password', updateMyPassword);

export default router;
