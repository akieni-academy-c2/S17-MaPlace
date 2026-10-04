import { Router } from 'express';

import {
  callNext,
  close,
  createTicket,
  getCurrent,
  open,
  pause,
  postpone,
  resume,
} from '../controllers/queueController.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getCurrent);
router.post('/open', open);
router.post('/pause', pause);
router.post('/postpone', postpone);
router.post('/resume', resume);
router.post('/close', close);
router.post('/next', callNext);
router.post('/tickets', createTicket);

export default router;
