// Core
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Models
const OtpVerification = require("../models/otpModel");
const User = require("../models/userModel");

// Utilities
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const {
  sendRegistrationOtpEmail,
  sendPasswordResetEmail,
} = require("../utils/email");
const { generateOTP } = require("../utils/otp");
const { generateToken } = require("../utils/generateToken");

// Controllers

//  Register new user
exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, otp } = req.body;

  const existingUser = await User.findOne({ email }).select("+isDeleted");

  if (existingUser) {
    if (existingUser.isDeleted) {
      return next(
        new AppError(
          "Account exists but is marked deleted. Please contact support.",
          400
        )
      );
    }
    return next(new AppError("User already exists with this email.", 400));
  }

  const purpose = "email_verification";

  // Validate OTP
  const otpDoc = await OtpVerification.findOne({ email, purpose });

  const now = Date.now();

  if (!otpDoc || otpDoc.otp !== otp || otpDoc.otpExpiresAt < now) {
    return next(
      new AppError("The OTP is invalid or has expired. Please try again.", 400)
    );
  }

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
  });

  await newUser.save({ validateBeforeSave: false });

  res.status(201).json({
    isSuccess: true,
    message: "Account registered successfully. You can now log in.",
  });
});

// Verify email
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  // 1. Check if user exists
  const user = await User.findOne({ email }).select(
    "+emailVerificationOTP +emailVerificationOTPExpires"
  );

  if (!user) {
    return next(new AppError("No account found with this email", 404));
  }

  // 2. Check if already verified
  if (user.isEmailVerified) {
    return next(new AppError("Email is already verified", 400));
  }

  // 3. Check OTP
  if (
    !user.emailVerificationOTP ||
    user.emailVerificationOTP !== otp ||
    user.emailVerificationOTPExpires < Date.now()
  ) {
    return next(
      new AppError(
        "The OTP you entered is invalid or has expired. Please request a new OTP to proceed.",
        400
      )
    );
  }

  // 4. Mark as verified and clear OTP fields
  user.isEmailVerified = true;
  user.emailVerificationOTP = undefined;
  user.emailVerificationOTPExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // 5. Respond
  res.status(200).json({
    isSuccess: true,
    message: "Email has been successfully verified",
  });
});

// send OTP
exports.sendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const purpose = "email_verification";
  const now = Date.now();

  const expiryTime =
    now + Number(process.env.OTP_EXPIRES_IN_MINUTES || 5) * 60 * 1000;

  let otpDoc = await OtpVerification.findOne({ email, purpose });

  // Generate new OTP
  const otp = generateOTP();

  if (otpDoc) {
    otpDoc.otp = otp;
    otpDoc.otpExpiresAt = expiryTime;
  } else {
    otpDoc = new OtpVerification({
      email,
      otp,
      otpExpiresAt: expiryTime,
      purpose,
    });
  }

  await otpDoc.save();

  const { isEmailSent, message: emailErrorMessage } =
    await sendRegistrationOtpEmail({ user: { email }, otp });

  if (!isEmailSent) {
    return next(new AppError(emailErrorMessage, 500));
  }

  res.status(200).json({
    isSuccess: true,
    message: "OTP has been sent to your email successfully.",
  });
});

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendTokenAsCookie = (user, token, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
  };

  res.cookie("token", token, cookieOptions);

  // Remove sensitive data before sending response
  user.password = undefined;

  res.status(200).json({
    isSuccess: true,
    message: "Logged in successfully",
    user: {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: user.role,
      profilePicUrl: user?.profilePic?.url,
    },
  });
};

// Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email }).select("+password +isDeleted");

  if (!user) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // Check if account is deleted
  if (user.isDeleted) {
    return next(
      new AppError("Account is marked as deleted. Please contact support.", 403)
    );
  }

  // Validate password
  const isValid = await user.isPasswordValid(password, user.password);
  if (!isValid) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // Generate token
  const token = signToken(user._id);

  // Send token in cookie
  sendTokenAsCookie(user, token, res);
});

// Get current logged-in user's data
exports.getMe = catchAsync(async (req, res, next) => {
  const { userId } = req.user;

  const user = await User.findById(userId);

  if (!user) {
    return next(
      new AppError(
        "Unable to retrieve user information. Please log in again.",
        404
      )
    );
  }

  res.status(200).json({
    isSuccess: true,
    user: {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: user.role,
      profilePicUrl: user?.profilePic?.url,
    },
  });
});

// Handle forgot password request: generates reset token and emails it
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.isDeleted) {
    return res.status(200).json({
      isSuccess: true,
      message:
        "If a user with that email exists, a password reset link has been sent.",
    });
  }

  const { token, hashedToken, tokenExpiresAt } = generateToken();

  user.passwordResetToken = hashedToken;
  user.passwordResetTokenExpiresAt = tokenExpiresAt;
  await user.save();

  const passwordResetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const { isEmailSent, message: emailErrorMessage } =
    await sendPasswordResetEmail({
      user: {
        email,
        firstName: user.firstName,
        passwordResetToken: token,
      },
      passwordResetUrl,
    });

  if (!isEmailSent) {
    return next(new AppError(emailErrorMessage, 500));
  }
  res.status(200).json({
    isSuccess: true,
    message: "Password reset link sent to your email.",
  });
});

// Reset password using valid reset token
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.query;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresAt: { $gt: Date.now() },
    isDeleted: { $ne: true },
  }).select("+password");

  if (!user) {
    return next(
      new AppError(
        "The reset link is invalid or has expired. Please request a new one.",
        400
      )
    );
  }

  const isSame = await user.isPasswordValid(password, user.password);
  if (isSame) {
    return next(
      new AppError("New password cannot be the same as your old password.", 400)
    );
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresAt = undefined;
  await user.save();

  res.status(200).json({
    isSuccess: true,
    message: "Password updated successfully. You can now log in.",
  });
});

// Update password from profile (requires current password)
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const { userId } = req.user;

  const user = await User.findById(userId).select("+password");

  if (!user || user.isDeleted) {
    return next(
      new AppError("User account not found or has been deactivated.", 404)
    );
  }

  const correctPassword = await user.isPasswordValid(
    currentPassword,
    user.password
  );

  if (!correctPassword) {
    return next(
      new AppError("The current password you entered is incorrect.", 401)
    );
  }

  if (currentPassword === newPassword) {
    return next(
      new AppError(
        "New password cannot be the same as the current password.",
        400
      )
    );
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    isSuccess: true,
    message: "Your password has been updated successfully.",
  });
});

// Logout user by clearing the authentication cookie
exports.logout = catchAsync(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({
    isSuccess: true,
    message: "Logged out successfully",
  });
});
