import express from "express";
import { body } from "express-validator";

import {
  registerUser,
  loginUser,
  getMe,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================================
// GET CURRENT USER
// GET /api/auth/me
// ======================================================

router.get("/me", authMiddleware, getMe);

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
      .withMessage("Password must be at least 6 characters"),

    body("confirmPassword")
      .notEmpty()
      .withMessage("Confirm Password is required"),
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
      .withMessage("Password is required"),
  ],
  loginUser
);

export default router;