const express = require("express");

const { createRateLimiter } = require("../middlewares/rateLimiter");
const authMiddleware = require("../middlewares/authMiddleware");
const feedbackValidator = require("../validators/feedbackValidator");
const feedbackController = require("../controllers/feedbackController");

// Custom limiter for feedback route
const feedbackLimiter = createRateLimiter({
  windowMs: 30 * 60 * 1000,
  max: 1,
  message:
    "You’ve already submitted feedback recently. Please wait a few minutes before trying again.",
});

const router = express.Router();

router.get(
  "/get-all-feedbacks",
  authMiddleware.protect,
  authMiddleware.restrictTo("admin", "owner"),
  feedbackController.getAllFeedbacks
);

router.post(
  "/create",
  feedbackLimiter,
  feedbackValidator.validateCreateFeedback,
  feedbackController.createFeedback
);

router.patch(
  "/resolve/:feedbackId",
  authMiddleware.protect,
  authMiddleware.restrictTo("admin", "owner"),
  feedbackValidator.validateReplyToFeedback,
  feedbackController.replyToFeedback
);

module.exports = router;
