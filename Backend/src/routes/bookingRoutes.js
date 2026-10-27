const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

router.get(
  "/all",
  authMiddleware.protect,
  authMiddleware.restrictTo("owner", "admin"),
  bookingController.getAllBookings
);

router.get(
  "/users",
  authMiddleware.protect,
  authMiddleware.restrictTo("user"),
  bookingController.getUserBookings
);

router.patch(
  "/cancel/:id",
  authMiddleware.protect,
  bookingController.cancelBooking
);

router.get(
  "/status/:status",
  authMiddleware.protect,
  authMiddleware.restrictTo("guide"),
  bookingController.getBookingsByTripStatus
);

router.get(
  "/detail/:id",
  authMiddleware.protect,
  bookingController.getBookingById
);

router.get(
  "/tour/:slug",
  authMiddleware.protect,
  authMiddleware.restrictTo("owner", "admin"),
  bookingController.getTourBookings
);

module.exports = router;
