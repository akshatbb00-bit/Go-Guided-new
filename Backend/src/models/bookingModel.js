const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    tourTitle: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    pricePerPerson: {
      type: Number,
      required: true,
    },
    numberOfParticipants: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    members: [
      {
        name: String,
        age: Number,
        gender: {
          type: String,
          enum: ["male", "female", "other"],
        },
      },
    ],
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
