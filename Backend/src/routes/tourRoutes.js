// Core
const express = require("express");
const router = express.Router();

// Middlewares
const authMiddleware = require("../middlewares/authMiddleware");

// File Upload (Multer)
const fileParser = require("../middlewares/fileParser");

// Validators
const validateFileLimits = require("../validators/validateFileLimits");
const tourValidator = require("../validators/tourValidator");

// Controllers
const tourController = require("../controllers/tourController");

// Routes

// Create a new tour with thumbnail and images
router.post(
  "/create",
  fileParser(["thumbnail", "images"]),
  validateFileLimits({
    thumbnail: {
      minCount: 1,
      maxCount: 1,
      maxSize: 5,
      allowedTypes: ["image/*"],
      onExceedCount: "ignore",
      onExceedSize: "error",
      onInvalidType: "error",
    },
    images: {
      minCount: 4,
      maxCount: 5,
      maxSize: 5,
      allowedTypes: ["image/*"],
      onExceedCount: "ignore",
      onExceedSize: "error",
      onInvalidType: "error",
    },
  }),
  tourValidator.tourInputValidator,
  tourController.createTour
);

// update tour
router.post(
  "/update/:slug",
  fileParser(["thumbnail", "images"]),
  (req, res, next) => {
    const existingThumbnail = req.body.existingThumbnail;
    const existingImages = req.body.existingImages
      ? req.body.existingImages
      : [];

    const thumbnailMin = existingThumbnail ? 0 : 1;
    const imageMin = 4 - existingImages.length;

    return validateFileLimits({
      thumbnail: {
        minCount: thumbnailMin,
        maxCount: 1,
        maxSize: 5,
        allowedTypes: ["image/*"],
        onExceedCount: "ignore",
        onExceedSize: "error",
        onInvalidType: "error",
      },
      images: {
        minCount: imageMin,
        maxCount: 5,
        maxSize: 20,
        allowedTypes: ["image/*"],
        onExceedCount: "ignore",
        onExceedSize: "error",
        onInvalidType: "error",
      },
    })(req, res, next);
  },
  tourValidator.tourInputValidator,
  tourController.updateTour
);

// Route to get all tours
router.get("/", authMiddleware.protect, tourController.getAllTours);

// Route for card-style tours
router.get("/cards", tourController.getAllToursAsCards);

// Get a single tour by its slug
router.get("/:slug", tourController.getTourBySlug);

router.patch(
  "/like/:tourId",
  authMiddleware.protect,
  tourController.likeOrUnlikeTour
);

module.exports = router;
