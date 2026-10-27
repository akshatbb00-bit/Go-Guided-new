// update-booking-phoneNumbers.js

const mongoose = require("mongoose");

const DB_URI =
  "mongodb+srv://owner:owner@cluster0.nd23h.mongodb.net/?retryWrites=true&w=majority";

const DB_NAME = "go-guided";

// 11 different realistic Indian mobile numbers
const phoneNumbers = [
  9876543210, 9812345678, 9890011223, 9123456789, 9988776655, 9701234567,
  9365432109, 9955112233, 9822334455, 9090909090, 9445566778,
];

async function run() {
  try {
    await mongoose.connect(DB_URI, {
      dbName: DB_NAME,
    });

    console.log("✅ Connected to MongoDB");

    const Booking = mongoose.connection.collection("bookings");

    // Fetch first 11 bookings
    const bookings = await Booking.find({}).limit(11).toArray();

    if (!bookings.length) {
      console.log("No bookings found");
      process.exit(0);
    }

    for (let i = 0; i < bookings.length; i++) {
      await Booking.updateOne(
        { _id: bookings[i]._id },
        {
          $set: {
            phoneNumber: phoneNumbers[i],
          },
        },
      );

      console.log(`Updated Booking ${bookings[i]._id} => ${phoneNumbers[i]}`);
    }

    console.log("✅ 11 bookings updated successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

run();
