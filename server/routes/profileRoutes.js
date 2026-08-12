import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getProfile,
  updateProfile,
} from "../controllers/profileController.js";

const router = express.Router();

// ======================================================
// GET PROFILE
// GET /api/profile
// ======================================================

router.get(
  "/",
  authMiddleware,
  getProfile
);

// ======================================================
// UPDATE PROFILE
// PUT /api/profile
// ======================================================

router.put(
  "/",
  authMiddleware,
  updateProfile
);

export default router;