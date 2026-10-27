const { body } = require("express-validator");
const validate = require("./validate");

exports.validateAnnouncement = validate([
  body("title").trim().notEmpty().withMessage("Title is required."),

  body("message").trim().notEmpty().withMessage("Message is required."),

  body("visibleTo")
    .trim()
    .notEmpty()
    .withMessage("Target audience is required.")
    .isIn(["Everyone", "Users", "Guides", "Admins"])
    .withMessage(
      "Target audience must be one of: Everyone, Users, Guides, Admins."
    ),
]);
