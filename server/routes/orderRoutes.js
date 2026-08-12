import express from "express";

import {
  createOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
} from "../controllers/orderController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// ======================================================
// USER CHECKOUT
// ======================================================

router.post("/", authMiddleware, createOrder);

router.post(
  "/razorpay/create",
  authMiddleware,
  createRazorpayOrder,
);

router.post(
  "/razorpay/verify",
  authMiddleware,
  verifyRazorpayPayment,
);

router.get(
  "/my-orders",
  authMiddleware,
  getMyOrders,
);
// ======================================================
// ADMIN - ORDERS
// ======================================================

router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  getAllOrders,
);

router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  getOrderById,
);

router.put(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus,
);

export default router;
