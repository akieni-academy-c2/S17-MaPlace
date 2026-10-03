import { Router } from "express";

import {
  cancel,
  complete,
  cancelByClient,
  create,
  getOne,
} from "../controllers/ticketController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", create);
router.get("/:id", getOne);
router.post("/:id/complete", authMiddleware, complete);
router.post("/:id/cancel", authMiddleware, cancel);
router.post("/:id/cancel-by-client", cancelByClient);

export default router;
