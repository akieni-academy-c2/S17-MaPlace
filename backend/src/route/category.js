import { Router } from 'express';
import { listCategories } from '../controller/categoryController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/** GET /api/categories — liste des catégories (protégé). */
router.get('/', authenticate, listCategories);

export default router;
