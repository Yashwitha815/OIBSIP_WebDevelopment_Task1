import express from "express";

import {
  getInventory,
  addInventory,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoryController.js";

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

// ======================================================
// ADD INVENTORY
// POST /api/inventory
// ADMIN ONLY
// ======================================================

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  addInventory
);

// ======================================================
// UPDATE INVENTORY
// PUT /api/inventory/:id
// ADMIN ONLY
// ======================================================

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateInventory
);

// ======================================================
// DELETE INVENTORY
// DELETE /api/inventory/:id
// ADMIN ONLY
// ======================================================

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteInventory
);

export default router;