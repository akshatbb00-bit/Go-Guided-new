const validate = require("./validate");

const {
  firstNameFieldValidator,
  lastNameFieldValidator,
  splitNameToFirstAndLast,
} = require("./commonFieldValidators");

exports.updateNameValidator = validate([
  splitNameToFirstAndLast,
  firstNameFieldValidator,
  lastNameFieldValidator,
]);
