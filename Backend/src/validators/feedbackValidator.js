const { body } = require("express-validator");
const validate = require("./validate");

exports.validateCreateFeedback = validate([
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .customSanitizer((value) => value.replace(/\s+/g, " ")) // Collapse multiple spaces into one
    .customSanitizer((value) => value.replace(/^\s+|\s+$/g, "")) // Trim again
    .isLength({ min: 2, max: 20 })
    .withMessage("Name must be between 2 and 20 characters")
    .matches(/^[A-Za-z ]+$/)
    .withMessage("Name must contain only letters and spaces")
    .customSanitizer((value) =>
      value
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ")
    ),

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
    .isLength({ max: 50 })
    .withMessage("Subject must be under 50 characters"),

  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Message must be under 1000 characters"),
]);

exports.validateReplyToFeedback = validate([
  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Message must be under 1000 characters"),
]);
