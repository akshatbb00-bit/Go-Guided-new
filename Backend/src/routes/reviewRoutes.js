const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const reviewValidator = require("../validators/reviewValidator");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

router.post(
  "/:tourId",
  authMiddleware.protect,
  authMiddleware.restrictTo("user"),
  reviewValidator.validateReview,
  reviewController.createOrUpdateReview
);

router.delete(
  "/:reviewId",
  authMiddleware.protect,
  authMiddleware.restrictTo("user", "owner", "admin"),
  reviewController.deleteReview
);

router.get(
  "/user-reviews",
  authMiddleware.protect,
  authMiddleware.restrictTo("user"),
  reviewController.getUserReviews
);

router.get(
  "/all",
  authMiddleware.protect,
  authMiddleware.restrictTo("owner", "admin"),
  reviewController.getAllReviews
);

router.get("/recent", reviewController.getRecentReviews);

// GET a single review by ID
router.get("/:id", reviewController.getReviewById);

module.exports = router;
