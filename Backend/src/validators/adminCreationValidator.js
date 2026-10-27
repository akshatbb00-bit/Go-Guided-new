const {
  fullNameFieldValidator,
  emailFieldValidator,
  phoneFieldValidator,
} = require("./commonFieldValidators");
const validate = require("./validate");

exports.createAdminValidator = validate([
  fullNameFieldValidator("name"),
  emailFieldValidator,
  phoneFieldValidator,
]);
