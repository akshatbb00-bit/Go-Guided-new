const { body } = require("express-validator");

// Regex for only alphabets (no spaces, no hyphens)
const alphaOnlyRegex = /^[A-Za-z]+$/;

// Safe capitalize function
const capitalize = (str) =>
  typeof str === "string" && str.length > 0
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : str;

const formatFieldName = (field) => {
  return field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
};

// First Name Validator (required)
exports.firstNameFieldValidator = body("firstName")
  .trim()
  .notEmpty()
  .withMessage("First name is required")
  .isLength({ min: 2 })
  .withMessage("First name must be at least 2 characters long")
  .matches(alphaOnlyRegex)
  .withMessage("First name must contain only letters (A–Z)")
  .customSanitizer((value) => capitalize(value));

// Last Name Validator (optional)
exports.lastNameFieldValidator = body("lastName")
  .trim()
  .optional({ checkFalsy: true })
  .isLength({ min: 2 })
  .withMessage("Last name must be at least 2 characters long")
  .matches(alphaOnlyRegex)
  .withMessage("Last name must contain only letters (A–Z)")
  .customSanitizer((value) => {
    if (!value) return "";
    return capitalize(value);
  });

exports.fullNameFieldValidator = (fieldName) =>
  body(fieldName)
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Full name must contain only letters and spaces")
    .customSanitizer((value) => {
      return value
        .split(" ")
        .filter(Boolean)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    });

exports.splitNameToFirstAndLast = body("name")
  .trim()
  .notEmpty()
  .withMessage("Name is required")
  .customSanitizer((value, { req }) => {
    const cleaned = value.replace(/\s+/g, " ").trim();
    const parts = cleaned.split(" ");

    req.body.firstName = parts.length > 0 ? capitalize(parts[0]) : "";
    req.body.lastName =
      parts.length > 1 ? capitalize(parts[parts.length - 1]) : "";

    return cleaned;
  });

exports.emailFieldValidator = body("email")
  .trim()
  .notEmpty()
  .withMessage("Email is required")
  .normalizeEmail({ all_lowercase: true })
  .isEmail()
  .withMessage("Invalid email format")
  .isLength({ max: 320 })
  .withMessage("Email must not exceed 320 characters");

const phoneRegex = /^[6-9]\d{9}$/;

exports.phoneFieldValidator = body("phone")
  .trim()
  .notEmpty()
  .withMessage("Phone number is required")
  .matches(phoneRegex)
  .withMessage("Phone number must be a valid 10-digit Indian mobile number");

exports.strongPasswordFieldValidator = (fieldName) =>
  body(fieldName)
    .trim()
    .notEmpty()
    .withMessage(`${formatFieldName(fieldName)} is required`)
    .isLength({ min: 8 })
    .withMessage(`${fieldName} must be at least 8 characters long`)
    .matches(/[a-z]/)
    .withMessage(`${fieldName} must contain at least one lowercase letter`)
    .matches(/[A-Z]/)
    .withMessage(`${fieldName} must contain at least one uppercase letter`)
    .matches(/[0-9]/)
    .withMessage(`${fieldName} must contain at least one number`)
    .matches(/[@$!%*?&]/)
    .withMessage(
      `${fieldName} must contain at least one special character (@, $, !, %, *, ?, &)`
    );

exports.confirmPasswordValidator = (fieldName, matchFieldName) =>
  body(fieldName)
    .notEmpty()
    .withMessage(`${formatFieldName(fieldName)} is required`)
    .custom((value, { req }) => {
      if (value !== req.body[matchFieldName]) {
        throw new Error(
          `${formatFieldName(fieldName)} and ${formatFieldName(
            matchFieldName
          )} do not match`
        );
      }
      return true;
    });

exports.passwordFieldValidator = (fieldName) =>
  body(fieldName)
    .notEmpty()
    .withMessage(`${formatFieldName(fieldName)} is required`);

exports.otpFieldValidator = body("otp")
  .trim()
  .notEmpty()
  .withMessage("OTP is required.")
  .isLength({ min: 6, max: 6 })
  .withMessage("OTP must be exactly 6 digits.")
  .isNumeric()
  .withMessage("OTP must contain only numbers.");

exports.tourFieldValidator = [
  body("tour._id")
    .notEmpty()
    .withMessage("Tour ID is required")
    .isString()
    .withMessage("Tour ID must be a valid string"),

  body("tour.name")
    .notEmpty()
    .withMessage("Tour name is required")
    .isString()
    .withMessage("Tour name must be a string"),

  body("tour.price")
    .notEmpty()
    .withMessage("Tour price is required")
    .isFloat({ gt: 0 })
    .withMessage("Tour price must be a positive number"),
];
