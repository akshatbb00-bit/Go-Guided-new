const { body } = require("express-validator");
const validate = require("./validate");

exports.updateGuideStatusValidator = validate([
  body("status")
    .exists()
    .withMessage("Please select your availability status.")
    .isIn(["available", "unavailable"])
    .withMessage("Status must be either available or unavailable."),

  body("nextAvailableFrom")
    .if(body("status").equals("unavailable"))
    .exists()
    .withMessage("Please provide the date when you'll be available again.")
    .bail()
    .isISO8601()
    .withMessage("Please enter a valid date (e.g. 2026-08-15).")
    .bail()
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // normalize to 00:00

      if (inputDate <= today) {
        throw new Error("Date must be in the future.");
      }
      return true;
    }),
]);
