import { Router } from 'express';
import {
    listServices,
    createServiceHandler,
    getService,
    updateServiceHandler,
    updateServiceStatusHandler,
    deleteServiceHandler,
} from '../controller/serviceController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Toutes les routes services sont protégées par l'authentification.
router.use(authenticate);

/** POST /api/establishments/:establishmentId/services — crée un service. */
router.post('/:establishmentId/services', createServiceHandler);

/** GET /api/establishments/:establishmentId/services — liste les services. */
router.get('/:establishmentId/services', listServices);

/** GET /api/establishments/:establishmentId/services/:serviceId — détail. */
router.get('/:establishmentId/services/:serviceId', getService);

/** PATCH /api/establishments/:establishmentId/services/:serviceId — mise à jour. */
router.patch('/:establishmentId/services/:serviceId', updateServiceHandler);

/** PATCH /api/establishments/:establishmentId/services/:serviceId/status — active/désactive. */
router.patch('/:establishmentId/services/:serviceId/status', updateServiceStatusHandler);

/** DELETE /api/establishments/:establishmentId/services/:serviceId — suppression. */
router.delete('/:establishmentId/services/:serviceId', deleteServiceHandler);

export default router;
