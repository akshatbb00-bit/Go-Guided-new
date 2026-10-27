const { body } = require("express-validator");
const validate = require("./validate");

// Validation middleware for creating a review
exports.validateReview = validate([
  body("rating")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage("Please provide a rating.")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating should be between 1 and 5."),

  body("review")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage("Please write a short review.")
    .isLength({ min: 5 })
    .withMessage("Your review should be at least 5 characters long."),
]);
