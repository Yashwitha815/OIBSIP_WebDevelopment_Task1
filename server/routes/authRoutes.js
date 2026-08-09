import express from "express";
import { body } from "express-validator";

import {
  registerUser,
  loginUser,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================================
// GET CURRENT USER
// GET /api/auth/me
// ======================================================

router.get(
  "/me",
  authMiddleware,
  getMe
);

// ======================================================
// REGISTER
// POST /api/auth/register
// ======================================================

router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email"),

    body("password")
      .isLength({ min: 6 })
      .withMessage(
        "Password must be at least 6 characters"
      ),

    body("confirmPassword")
      .notEmpty()
      .withMessage(
        "Confirm Password is required"
      ),
  ],
  registerUser
);

// ======================================================
// LOGIN
// POST /api/auth/login
// ======================================================

router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email"),

    body("password")
      .notEmpty()
      .withMessage(
        "Password is required"
      ),
  ],
  loginUser
);

// ======================================================
// VERIFY EMAIL
// GET /api/auth/verify-email/:token
// ======================================================

router.get(
  "/verify-email/:token",
  verifyEmail
);

// ======================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ======================================================

router.post(
  "/forgot-password",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage(
        "Enter a valid email"
      ),
  ],
  forgotPassword
);

// ======================================================
// RESET PASSWORD
// PUT /api/auth/reset-password/:token
// ======================================================

router.put(
  "/reset-password/:token",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage(
        "Password must be at least 6 characters"
      ),

    body("confirmPassword")
      .notEmpty()
      .withMessage(
        "Confirm Password is required"
      ),
  ],
  resetPassword
);

export default router;