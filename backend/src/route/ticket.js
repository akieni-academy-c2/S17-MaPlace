import { Router } from 'express';
import {
    joinQueueHandler,
    getTicketHandler,
    leaveQueueHandler,
} from '../controller/ticketController.js';
import { optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

// Routes publiques : le client peut être anonyme (user_id nullable).
// Si un token est fourni, il est validé et le ticket est rattaché au compte.
router.use(optionalAuthenticate);

const BASE = '/:establishmentId/services/:serviceId/queue/tickets';

/** POST .../queue/tickets — rejoindre la file (nom + téléphone). */
router.post(BASE, joinQueueHandler);

/** GET .../queue/tickets/:trackingToken — consulter son ticket et sa position. */
router.get(`${BASE}/:trackingToken`, getTicketHandler);

/** DELETE .../queue/tickets/:trackingToken — quitter la file (annulation). */
router.delete(`${BASE}/:trackingToken`, leaveQueueHandler);

export default router;
