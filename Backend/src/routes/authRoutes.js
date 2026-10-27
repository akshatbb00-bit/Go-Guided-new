// Core
const express = require("express");
const router = express.Router();

// Middlewares
const authMiddleware = require("../middlewares/authMiddleware");

// Validators
const authValidator = require("../validators/authValidator");

// Controllers
const authController = require("../controllers/authController");

// Routes

// Register new user
router.post(
  "/register",
  authValidator.registerValidator,
  authController.register
);

// Login
router.post("/login", authValidator.loginValidator, authController.login);

// Get current logged-in user's data
router.get("/me", authMiddleware.protect, authController.getMe);

router.patch(
  "/forgot-password",
  authValidator.forgotPasswordValidator,
  authController.forgotPassword
);

router.patch(
  "/reset-password",
  authValidator.resetPasswordValidator,
  authController.resetPassword
);

router.patch(
  "/update-password",
  authMiddleware.protect,
  authValidator.updatePasswordValidator,
  authController.updatePassword
);

router.post("/logout", authController.logout);

module.exports = router;
