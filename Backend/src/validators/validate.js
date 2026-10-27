const { validationResult } = require("express-validator");
const AppError = require("../utils/appError");

module.exports = (rules) => {
  return async (req, res, next) => {
    for (let rule of rules) {
      await rule.run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        return next(new AppError(firstError.msg, 400));
      }
    }

    next();
  };
};
