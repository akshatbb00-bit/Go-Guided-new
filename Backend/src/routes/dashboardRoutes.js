const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const statsController = require("../controllers/statsController");

const router = express.Router();

router.get(
  "/stats",
  authMiddleware.protect,
  authMiddleware.restrictTo("owner"),
  statsController.getDashboardStats
);

router.get(
  "/stat-cards",
  authMiddleware.protect,
  authMiddleware.restrictTo("owner", "admin"),
  statsController.getStatCardCounts
);

router.get(
  "/achievements",
  authMiddleware.protect,
  statsController.getAchievements
);

module.exports = router;
