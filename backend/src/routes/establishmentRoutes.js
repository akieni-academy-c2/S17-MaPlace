import { Router } from 'express';

import {
  getAll,
  getOne,
} from '../controllers/establishmentController.js';

const router = Router();

// Liste publique des établissements.
router.get('/', getAll);

// Détails d'un établissement.
router.get('/:id', getOne);

export default router;