const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Protect routes (only for logged-in users)
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // The token comes from the cookie, or from an "Authorization: Bearer <token>" header
  // (the header is used when the browser blocks cross-site cookies)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.slice(7).trim();
  }
  if (!token) {
    return next(
      new AppError("You're not logged in. Please log in to continue.", 401)
    );
  }

  // Verify token (a bad or expired token is a normal "please log in again", not a server error)
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return next(new AppError("Your login is invalid or has expired. Please log in again.", 401));
  }

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
