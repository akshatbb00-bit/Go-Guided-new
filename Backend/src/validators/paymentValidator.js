const { body } = require("express-validator");
const validate = require("./validate");
const { tourFieldValidator } = require("./commonFieldValidators");
exports.createPaymentValidator = validate([
  body("totalAmount")
    .notEmpty()
    .withMessage("Total Amount is required")
    .isFloat({ gt: 0 })
    .withMessage("Total Amount must be a positive number"),
]);

exports.verifyPaymentValidator = validate([
  body("razorpay_order_id")
    .notEmpty()
    .withMessage("razorpay_order_id is required"),
  body("razorpay_payment_id")
    .notEmpty()
    .withMessage("razorpay_payment_id is required"),
  body("razorpay_signature")
    .notEmpty()
    .withMessage("razorpay_signature is required"),
  ...tourFieldValidator,
]);
