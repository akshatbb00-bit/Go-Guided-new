/**
 * Generates a 6-digit numeric OTP.
 */
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
