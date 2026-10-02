import { Router } from 'express';
import { register, login, getMe } from '../controller/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/** POST /api/auth/register — inscription d'un nouvel utilisateur. */
router.post('/register', register);

/** POST /api/auth/login — connexion d'un utilisateur. */
router.post('/login', login);

/** GET /api/auth/me — utilisateur connecté (protégé). */
router.get('/me', authenticate, getMe);

export default router;
