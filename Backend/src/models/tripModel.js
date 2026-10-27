const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, min: 1 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    place: { type: String, trim: true, maxlength: 120, default: "" },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    summary: { type: String, trim: true, maxlength: 600, default: "" },
    origin: { type: String, required: true, trim: true, maxlength: 100 },
    destination: { type: String, required: true, trim: true, maxlength: 100 },
    purpose: { type: String, trim: true, maxlength: 100, default: "Leisure trip" },
    startDate: { type: Date, required: true },
    numberOfDays: { type: Number, required: true, min: 1, max: 15 },
    numberOfTravellers: { type: Number, required: true, min: 1, max: 30 },
    budgetLevel: { type: String, enum: ["economy", "standard", "premium"], default: "standard" },
    stops: { type: [stopSchema], validate: (v) => v.length > 0 },
    members: [
      {
        name: { type: String, trim: true },
        age: Number,
        gender: { type: String, enum: ["male", "female", "other"] },
        _id: false,
      },
    ],
    phoneNumber: { type: String, trim: true },
    pricing: {
      currency: { type: String, default: "INR" },
      breakdown: [{ label: String, amount: Number, _id: false }],
      total: { type: Number, required: true },
      perPerson: Number,
    },
    razorpayOrderId: String,
    paymentId: String,
    status: { type: String, enum: ["draft", "booked", "completed", "cancelled"], default: "draft" },
    assignedGuide: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

tripSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Trip", tripSchema);
