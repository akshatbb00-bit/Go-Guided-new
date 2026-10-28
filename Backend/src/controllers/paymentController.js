const crypto = require("crypto");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const razorpay = require("../config/razorpay"); // Razorpay instance
const Booking = require("../models/bookingModel");
const User = require("../models/userModel");
const Tour = require("../models/tourModel");
const { isDemoMode, newDemoOrder, signDemoPayment } = require("../utils/demoPayments");

// CREATE PAYMENT ORDER
exports.createPaymentOrder = catchAsync(async (req, res, next) => {
  const { totalAmount } = req.body;
  const options = {
    amount: totalAmount * 100, // Amount in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  // Demo mode: simulated checkout, no call to Razorpay
  if (isDemoMode()) {
    const demo = newDemoOrder(options.amount, options.currency);
    return res.status(200).json({ isSuccess: true, data: demo });
  }

  const order = await razorpay.orders.create(options);

  res.status(200).json({
    isSuccess: true,
    data: {
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    },
  });
});

// DEMO PAYMENT: the demo portal calls this after the user "pays". Only works for demo orders in demo mode.
exports.signDemoPaymentRequest = catchAsync(async (req, res, next) => {
  const { order_id } = req.body;
  if (!isDemoMode()) return next(new AppError("Demo payments are turned off", 404));
  if (typeof order_id !== "string" || !order_id.startsWith("order_demo_")) {
    return next(new AppError("Not a demo order", 400));
  }
  res.status(200).json({ isSuccess: true, data: signDemoPayment(order_id) });
});

// VERIFY PAYMENT
exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tour } =
    req.body;
  const { userId } = req.user;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(
      new AppError("Payment verification failed. Please try again.", 400),
    );
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return next(
      new AppError("Payment verification failed. Please try again.", 400),
    );
  }

  const booking = await Booking.create({
    user: userId,
    tour: tour._id,
    paymentId: razorpay_payment_id,
    tourTitle: tour.tourTitle,
    numberOfParticipants: tour.numberOfParticipants,
    pricePerPerson: tour.pricePerPerson,
    amountPaid: tour.amountPaid,
    members: tour.members,
    currency: tour.currency,
    phoneNumber: tour.phoneNumber,
  });

  const user = await User.findById(userId);
  user.bookings.push(booking._id);
  await user.save();

  // 🔹 Increment tour visits
  await Tour.findByIdAndUpdate(tour._id, { $inc: { visits: 1 } });

  res.status(200).json({
    isSuccess: true,
    message: "Payment verified successfully",
  });
});
