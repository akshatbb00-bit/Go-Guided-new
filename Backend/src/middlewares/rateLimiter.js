const rateLimit = require("express-rate-limit");

exports.createRateLimiter = (options = {}) => {
  const {
    windowMs = 5 * 60 * 1000, // default 5 minutes
    max = 1,
    message = "Too many requests, please try again later.",
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: "fail",
      message,
    },
  });
};
