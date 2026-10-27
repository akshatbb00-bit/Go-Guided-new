const { query } = require("express-validator");

const validate = require("./validate");
const {
  firstNameFieldValidator,
  lastNameFieldValidator,
  emailFieldValidator,
  phoneFieldValidator,
  strongPasswordFieldValidator: registerPasswordFieldValidator,
  strongPasswordFieldValidator: resetPasswordFieldValidator,
  strongPasswordFieldValidator: updatePasswordFieldValidator,
  passwordFieldValidator,
  otpFieldValidator,
  confirmPasswordValidator,
} = require("./commonFieldValidators");

exports.registerValidator = validate([
  firstNameFieldValidator,
  lastNameFieldValidator,
  emailFieldValidator,
  phoneFieldValidator,
  registerPasswordFieldValidator("password"),
  confirmPasswordValidator("password", "confirmPassword"),
  otpFieldValidator,
]);

exports.verifyEmail = validate([emailFieldValidator, otpFieldValidator]);

exports.sendOTPValidator = validate([emailFieldValidator]);

exports.loginValidator = validate([
  emailFieldValidator,
  passwordFieldValidator("password"),
]);

exports.forgotPasswordValidator = validate([emailFieldValidator]);

exports.resetPasswordValidator = validate([
  query("token").notEmpty().withMessage("Reset token is required."),
  resetPasswordFieldValidator("password"),
  confirmPasswordValidator("confirmPassword", "password"),
]);

exports.updatePasswordValidator = validate([
  passwordFieldValidator("currentPassword"),
  updatePasswordFieldValidator("newPassword"),
  confirmPasswordValidator("confirmNewPassword", "newPassword"),
]);
