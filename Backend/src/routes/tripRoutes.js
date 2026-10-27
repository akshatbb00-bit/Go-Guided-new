const express = require("express");
const tripController = require("../controllers/tripController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(authMiddleware.protect);

// Traveller (user)
router.post("/suggest", authMiddleware.restrictTo("user"), tripController.suggestTrip);
router.post("/quote", authMiddleware.restrictTo("user"), tripController.quoteTrip);
router.post("/", authMiddleware.restrictTo("user"), tripController.createTrip);
router.get("/mine", authMiddleware.restrictTo("user"), tripController.getMyTrips);
router.post("/:id/create-order", authMiddleware.restrictTo("user"), tripController.createTripOrder);
router.post("/:id/verify-payment", authMiddleware.restrictTo("user"), tripController.verifyTripPayment);
router.patch("/:id/cancel", authMiddleware.restrictTo("user"), tripController.cancelDraftTrip);

// Admin and owner
router.get("/all", authMiddleware.restrictTo("admin", "owner"), tripController.getAllTrips);
router.patch("/:id/manage", authMiddleware.restrictTo("admin", "owner"), tripController.manageTrip);

// One trip (its owner, or staff)
router.get("/:id", tripController.getTripById);

module.exports = router;
