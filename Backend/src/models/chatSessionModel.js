const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One session per user
    },
    history: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
      },
    ],
    lastFilteredTours: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tour" }],
    lastBookingContext: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);
