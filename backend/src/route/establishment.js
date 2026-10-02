import { Router } from 'express';
import {
    createEstablishmentHandler,
    listMyEstablishments,
    getEstablishment,
    updateEstablishmentHandler,
    updateEstablishmentStatusHandler,
} from '../controller/establishmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Toutes les routes établissements sont protégées par l'authentification.
router.use(authenticate);

/** POST /api/establishments — crée un établissement. */
router.post('/', createEstablishmentHandler);

/** GET /api/establishments — liste les établissements de l'utilisateur. */
router.get('/', listMyEstablishments);

/** GET /api/establishments/:id — détail d'un établissement géré. */
router.get('/:id', getEstablishment);

/** PATCH /api/establishments/:id — met à jour un établissement géré. */
router.patch('/:id', updateEstablishmentHandler);

/** PATCH /api/establishments/:id/status — ACTIVE / INACTIVE. */
router.patch('/:id/status', updateEstablishmentStatusHandler);

export default router;
