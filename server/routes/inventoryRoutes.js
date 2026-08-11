import express from "express";

import { getInventory } from "../controllers/inventoryController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// ======================================================
// GET INVENTORY
// GET /api/inventory
// ADMIN ONLY
// ======================================================

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getInventory
);

export default router;