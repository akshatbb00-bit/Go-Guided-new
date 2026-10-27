const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpiresAt: {
    type: Date,
    required: true,
  },
  purpose: {
    type: String,
    enum: ["email_verification"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: Number(process.env.REGISTRATION_OTP_EXPIRES_IN_MINUTES || 5) * 60, // in seconds
  },
});

otpVerificationSchema.index({ email: 1, purpose: 1 });

module.exports = mongoose.model("OtpVerification", otpVerificationSchema);
