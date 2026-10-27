const { body } = require("express-validator");
const validate = require("./validate");

exports.validateSendCustomEmail = validate([
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("subject")
    .notEmpty()
    .withMessage("Subject is required")
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Subject must be under 100 characters"),

  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Message must be under 2000 characters"),

  body("name")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Name must be under 50 characters"),
]);
