import express from "express";

import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// ======================================================
// CREATE ORDER - USER
// POST /api/orders
// ======================================================

router.post(
  "/",
  authMiddleware,
  createOrder
);

// ======================================================
// ADMIN - GET ALL ORDERS
// GET /api/orders/admin
// ======================================================

router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  getAllOrders
);

// ======================================================
// ADMIN - GET SINGLE ORDER
// GET /api/orders/admin/:id
// ======================================================

router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  getOrderById
);

// ======================================================
// ADMIN - UPDATE ORDER STATUS
// PUT /api/orders/admin/:id/status
// ======================================================

router.put(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
);

export default router;