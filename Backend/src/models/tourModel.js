const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: { type: String, required: true },

    tourSpots: [
      {
        day: {
          type: Number,
          required: true,
          min: 1,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
        location: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
          },
          coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
            validate: {
              validator: (val) =>
                Array.isArray(val) &&
                val.length === 2 &&
                val[0] >= -180 &&
                val[0] <= 180 &&
                val[1] >= -90 &&
                val[1] <= 90,
              message: "Coordinates must be [longitude, latitude]",
            },
          },
        },
      },
    ],

    duration: { type: Number, required: true },
    participants: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    languages: [{ type: String, required: true }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    overview: { type: String, required: true },
    highlights: [{ type: String, required: true }],
    included: [{ type: String, required: true }],

    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    thumbnail: {
      public_id: {
        type: String,
        required: [true, "Thumbnail must have a public_id"],
      },
      secure_url: {
        type: String,
        required: [true, "Thumbnail must have a secure_url"],
      },
    },

    images: {
      type: [
        {
          public_id: {
            type: String,
            required: [true, "Each image must have a public_id"],
          },
          secure_url: {
            type: String,
            required: [true, "Each image must have a secure_url"],
          },
        },
      ],
      required: true,
    },
    visits: { type: Number, default: 0 },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pricePerPerson: { type: Number, required: true },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tour", tourSchema);
