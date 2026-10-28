const express = require("express");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/create-order",
  authMiddleware.protect,
  paymentController.createPaymentOrder
);

router.post(
  "/verify-payment",
  authMiddleware.protect,
  paymentController.verifyPayment
);

router.post(
  "/demo-sign",
  authMiddleware.protect,
  paymentController.signDemoPaymentRequest
);

module.exports = router;
