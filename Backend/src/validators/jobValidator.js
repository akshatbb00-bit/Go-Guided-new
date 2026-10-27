const { body } = require("express-validator");
const validate = require("./validate");

exports.createJobValidator = validate([
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Job title is required")
    .isString()
    .withMessage("Job title must be a string"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Job description is required")
    .isString()
    .withMessage("Job description must be a string"),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required")
    .isString()
    .withMessage("Location must be a string"),

  body("salary.min")
    .trim()
    .notEmpty()
    .withMessage("Minimum salary is required")
    .isFloat({ min: 0 })
    .withMessage("Minimum salary must be a positive number"),

  body("salary.max")
    .trim()
    .notEmpty()
    .withMessage("Maximum salary is required")
    .isFloat({ min: 0 })
    .withMessage("Maximum salary must be a positive number"),

  body("lastDateToApply")
    .notEmpty()
    .withMessage("Last date is required")
    .isISO8601()
    .withMessage("Last date must be a valid date"),

  body("numberOfPosts")
    .trim()
    .notEmpty()
    .withMessage("Number of posts is required")
    .isInt({ min: 1 })
    .withMessage("Must be at least 1 post"),
]);
