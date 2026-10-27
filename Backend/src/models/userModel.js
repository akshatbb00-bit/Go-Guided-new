const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpiresAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "admin", "guide", "owner"],
      default: "user",
    },
    profilePic: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    // ✅ Guide-specific fields

    availabilityStatus: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },

    availableFrom: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving, if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.isPasswordValid = async function (password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
