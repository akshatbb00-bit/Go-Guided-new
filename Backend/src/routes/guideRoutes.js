const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const guideValidators = require("../validators/guideValidators");
const guideController = require("../controllers/guideController");

// ✅ PUT route – guide updates their own availability
router.patch(
  "/status",
  authMiddleware.protect,
  authMiddleware.restrictTo("guide"),
  guideValidators.updateGuideStatusValidator,
  guideController.updateGuideStatus
);

// ✅ GET route – guide checks their current status
router.get(
  "/status",
  authMiddleware.protect,
  authMiddleware.restrictTo("guide"),
  guideController.getMyStatus
);

router.get(
  "/available",
  authMiddleware.protect,
  authMiddleware.restrictTo("owner"),
  guideController.getAvailableGuides
);

router.get(
  "/booking-stats",
  authMiddleware.protect,
  authMiddleware.restrictTo("guide"),
  guideController.getGuideBookingStats
);

module.exports = router;
