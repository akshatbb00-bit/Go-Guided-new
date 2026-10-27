const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const announcementValidator = require("../validators/announcementValidator");
const announcementController = require("../controllers/announcementController");

const router = express.Router();

router.post(
  "/post",
  authMiddleware.protect,
  authMiddleware.restrictTo("owner", "admin", "guide"),
  announcementValidator.validateAnnouncement,
  announcementController.createAnnouncement
);

router.get(
  "/",
  authMiddleware.protect,
  announcementController.getAnnouncements
);

module.exports = router;
