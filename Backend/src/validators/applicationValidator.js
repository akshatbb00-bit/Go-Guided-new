const { body } = require("express-validator");
const validate = require("./validate");
const {
  fullNameFieldValidator,
  emailFieldValidator,
  phoneFieldValidator,
} = require("./commonFieldValidators");

exports.validateApplication = validate([
  fullNameFieldValidator("fullName"),
  emailFieldValidator,
  phoneFieldValidator,

  body("linkedin")
    .optional()
    .isURL()
    .withMessage("Please enter a valid URL for LinkedIn"),

  body("experience")
    .optional()
    .isNumeric()
    .withMessage("Experience must be a numeric value")
    .isFloat({ min: 0 })
    .withMessage("Experience must be zero or more"),
]);
