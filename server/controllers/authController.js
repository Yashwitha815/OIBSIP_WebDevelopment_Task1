import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validationResult } from "express-validator";

import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

// ======================================================
// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
// ======================================================

export const registerUser = async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      name,
      email,
      password,
      confirmPassword,
    } = req.body;

    // Password Match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check Existing User
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    // Generate Verification Token
    const verificationToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Create User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,

      isVerified: false,

      verificationToken,

      verificationTokenExpires:
        Date.now() + 24 * 60 * 60 * 1000,
    });

    // Verification URL
    const verifyURL =
      `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    console.log("==================================");
    console.log("Verification URL:", verifyURL);
    console.log("==================================");

    // Send Verification Email
    await sendEmail({
      email: user.email,

      subject: "Verify your PizzaVerse Account 🍕",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          padding: 30px;
          background: #fff8f5;
        ">

          <h1 style="color:#ff6b00;">
            🍕 Welcome to PizzaVerse
          </h1>

          <p>Hello <b>${user.name}</b>,</p>

          <p>
            Thank you for registering with PizzaVerse.
          </p>

          <p>
            Please verify your email by clicking
            the button below.
          </p>

          <a
            href="${verifyURL}"
            style="
              display:inline-block;
              padding:14px 26px;
              background:#ff6b00;
              color:white;
              text-decoration:none;
              border-radius:8px;
              font-weight:bold;
            "
          >
            Verify Email
          </a>

          <p style="margin-top:20px;">
            This verification link will expire in
            <b>24 hours</b>.
          </p>

          <hr>

          <small>
            If you didn't create this account,
            you can safely ignore this email.
          </small>

        </div>
      `,
    });

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
    });

  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
// ======================================================

export const loginUser = async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Email Verification Check
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message:
          "Please verify your email before logging in.",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT Token
    const token = generateToken(
      user._id,
      user.role
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// @desc    Verify Email
// @route   GET /api/auth/verify-email/:token
// @access  Public
// ======================================================

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired verification link.",
      });
    }

    // Mark account as verified
    user.isVerified = true;

    // Remove verification token
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Email verified successfully. You can now login.",
    });

  } catch (error) {
    console.error("Verify Email Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
// ======================================================

export const forgotPassword = async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    // Find User
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    /*
      We intentionally return the same message
      whether the email exists or not.
      This prevents people from checking
      which emails are registered.
    */

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Hash token before storing it in database
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save reset token
    user.resetPasswordToken = hashedResetToken;

    // Token expires in 15 minutes
    user.resetPasswordExpires =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    // Reset URL
    const resetURL =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    console.log("==================================");
    console.log("Password Reset URL:", resetURL);
    console.log("==================================");

    // Send email
    await sendEmail({
      email: user.email,

      subject:
        "Reset your PizzaVerse Password 🔑",

      html: `
        <div style="
          font-family:Arial,sans-serif;
          padding:30px;
          background:#fff8f5;
        ">

          <h1 style="color:#ff6b00;">
            🍕 PizzaVerse
          </h1>

          <h2>
            Password Reset Request
          </h2>

          <p>
            Hello <b>${user.name}</b>,
          </p>

          <p>
            We received a request to reset
            your PizzaVerse account password.
          </p>

          <p>
            Click the button below to create
            a new password.
          </p>

          <a
            href="${resetURL}"
            style="
              display:inline-block;
              padding:14px 26px;
              background:#ff6b00;
              color:white;
              text-decoration:none;
              border-radius:8px;
              font-weight:bold;
            "
          >
            Reset Password
          </a>

          <p style="margin-top:20px;">
            This link will expire in
            <b>15 minutes</b>.
          </p>

          <p>
            If you didn't request a password reset,
            you can safely ignore this email.
          </p>

          <hr>

          <small>
            PizzaVerse Security Team 🍕
          </small>

        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });

  } catch (error) {
    console.error(
      "Forgot Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
// ======================================================

export const resetPassword = async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Password Match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Hash received token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,

      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired password reset link.",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    // Update password
    user.password = hashedPassword;

    // Remove reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login.",
    });

  } catch (error) {
    console.error(
      "Reset Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// @desc    Get Current User
// @route   GET /api/auth/me
// @access  Private
// ======================================================

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });

  } catch (error) {
    console.error(
      "Get Me Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};