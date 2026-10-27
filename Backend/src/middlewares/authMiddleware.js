const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Protect routes (only for logged-in users)
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // Get token from cookies instead of Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return next(
      new AppError("You're not logged in. Please log in to continue.", 401)
    );
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if user still exists

  const currentUser = await User.findById(decoded.id).select("role");
  if (!currentUser) {
    return next(
      new AppError(
        "Unable to retrieve user information. Please log in again.",
        404
      )
    );
  }

  // Attach user to request
  req.user = { userId: currentUser._id.toString(), role: currentUser.role };
  next();
});

// Restrict access to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Access denied", 403));
    }
    next();
  };
};
