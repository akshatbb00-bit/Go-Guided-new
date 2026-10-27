const crypto = require("crypto");

const generateToken = () => {
  const expiryInMinutes =
    parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY_MIN, 10) || 30;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  const tokenExpiresAt = new Date(Date.now() + expiryInMinutes * 60 * 1000);

  return {
    token: rawToken,
    hashedToken,
    tokenExpiresAt,
  };
};

module.exports = { generateToken };
