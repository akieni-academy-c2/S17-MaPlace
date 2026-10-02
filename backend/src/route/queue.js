import { Router } from 'express';
import {
    openQueueHandler,
    getQueueHandler,
    updateQueueStatusHandler,
} from '../controller/queueController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Toutes les routes files d'attente sont protégées par l'authentification.
router.use(authenticate);

/** POST /api/establishments/:establishmentId/services/:serviceId/queue — ouvre la file du jour. */
router.post('/:establishmentId/services/:serviceId/queue', openQueueHandler);

/** GET /api/establishments/:establishmentId/services/:serviceId/queue — état de la file du jour. */
router.get('/:establishmentId/services/:serviceId/queue', getQueueHandler);

/** PATCH /api/establishments/:establishmentId/services/:serviceId/queue — change l'état de la file. */
router.patch('/:establishmentId/services/:serviceId/queue', updateQueueStatusHandler);

export default router;
