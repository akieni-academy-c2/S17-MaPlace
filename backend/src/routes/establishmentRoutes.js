import { Router } from 'express';

import {
  getAll,
  getOne,
  updateMe,
} from '../controllers/establishmentController.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getAll);

router.patch('/me', authMiddleware, updateMe);

router.get('/:id', getOne);

export default router;