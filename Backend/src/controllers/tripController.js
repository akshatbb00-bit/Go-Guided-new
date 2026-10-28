const crypto = require("crypto");
const Trip = require("../models/tripModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const razorpay = require("../config/razorpay");
const { calculateTripPrice, BUDGET_LEVELS } = require("../utils/tripPricing");
const { generateItinerary, sanitizeStops } = require("../utils/tripPlanner");
const { isDemoMode, newDemoOrder } = require("../utils/demoPayments");

// ---------- validation helpers ----------
const str = (v, min, max, label) => {
  const s = String(v ?? "").trim();
  if (s.length < min || s.length > max) throw new AppError(`${label} must be ${min}-${max} characters`, 400);
  return s;
};
const int = (v, min, max, label) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new AppError(`${label} must be a whole number from ${min} to ${max}`, 400);
  return n;
};
// today or later (compared in UTC, so travellers in any time zone are treated fairly)
const futureDate = (v) => {
  const d = new Date(v);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (Number.isNaN(d.getTime()) || d < today) throw new AppError("Start date cannot be in the past", 400);
  return d;
};
const readPlanInput = (body) => {
  const budgetLevel = String(body.budgetLevel || "standard");
  if (!BUDGET_LEVELS.includes(budgetLevel)) throw new AppError("Budget level must be economy, standard or premium", 400);
  return {
    origin: str(body.origin, 2, 100, "Starting city"),
    destination: str(body.destination, 2, 100, "Destination"),
    purpose: str(body.purpose || "Leisure trip", 2, 100, "Purpose"),
    startDate: futureDate(body.startDate),
    days: int(body.days, 1, 15, "Number of days"),
    travellers: int(body.travellers, 1, 30, "Number of travellers"),
    budgetLevel,
    preferences: String(body.preferences || "").trim().slice(0, 300),
  };
};
const loadOwnTrip = async (id, userId) => {
  const trip = await Trip.findById(id);
  if (!trip) throw new AppError("Trip not found", 404);
  if (trip.user.toString() !== userId) throw new AppError("Access denied", 403);
  return trip;
};

// POST /trip/suggest  -> AI itinerary + price estimate (nothing is saved)
exports.suggestTrip = catchAsync(async (req, res, next) => {
  const input = readPlanInput(req.body);
  let plan;
  try {
    plan = await generateItinerary({ ...input, startDate: input.startDate.toISOString().slice(0, 10) });
  } catch (err) {
    console.error("Trip planner error:", err.aiBusy ? err.message : err);
    if (err.aiBusy) return next(new AppError(err.message, 503));
    return next(new AppError("The trip assistant could not make a plan right now. Please try again.", 502));
  }
  if (!plan.stops.length) return next(new AppError("No valid places were found. Please try a different destination.", 502));

  const pricing = calculateTripPrice({ days: input.days, travellers: input.travellers, stopsCount: plan.stops.length, budgetLevel: input.budgetLevel });
  res.status(200).json({ isSuccess: true, data: { plan, pricing } });
});

// POST /trip/quote  { days, travellers, stopsCount, budgetLevel } -> price estimate
exports.quoteTrip = catchAsync(async (req, res, next) => {
  const budgetLevel = String(req.body.budgetLevel || "standard");
  if (!BUDGET_LEVELS.includes(budgetLevel)) return next(new AppError("Invalid budget level", 400));
  const pricing = calculateTripPrice({
    days: int(req.body.days, 1, 15, "Number of days"),
    travellers: int(req.body.travellers, 1, 30, "Number of travellers"),
    stopsCount: int(req.body.stopsCount, 1, 30, "Number of stops"),
    budgetLevel,
  });
  res.status(200).json({ isSuccess: true, data: { pricing } });
});

// POST /trip  -> save the (edited) plan as a draft; price is recalculated here
exports.createTrip = catchAsync(async (req, res, next) => {
  const input = readPlanInput(req.body);
  const title = str(req.body.title, 3, 150, "Title");
  const summary = String(req.body.summary || "").slice(0, 600);

  // stops arrive as {day,name,place,description,lat,lng}
  const stops = sanitizeStops(
    (req.body.stops || []).map((s) => ({ ...s, lat: s.lat ?? s.location?.coordinates?.[1], lng: s.lng ?? s.location?.coordinates?.[0] })),
    input.days
  );
  if (!stops.length) return next(new AppError("Add at least one stop", 400));

  const pricing = calculateTripPrice({ days: input.days, travellers: input.travellers, stopsCount: stops.length, budgetLevel: input.budgetLevel });
  const trip = await Trip.create({
    user: req.user.userId, title, summary,
    origin: input.origin, destination: input.destination, purpose: input.purpose,
    startDate: input.startDate, numberOfDays: input.days, numberOfTravellers: input.travellers,
    budgetLevel: input.budgetLevel, stops, pricing,
  });
  res.status(201).json({ isSuccess: true, data: { trip } });
});

// GET /trip/mine
exports.getMyTrips = catchAsync(async (req, res) => {
  const trips = await Trip.find({ user: req.user.userId }).sort({ createdAt: -1 }).lean();
  res.status(200).json({ isSuccess: true, data: { trips } });
});

// GET /trip/all  (admin, owner)
exports.getAllTrips = catchAsync(async (req, res) => {
  const filter = req.query.status ? { status: String(req.query.status) } : {};
  const trips = await Trip.find(filter)
    .sort({ createdAt: -1 })
    .populate("user", "firstName lastName email phone")
    .populate("assignedGuide", "firstName lastName")
    .lean();
  res.status(200).json({ isSuccess: true, data: { trips } });
});

// GET /trip/:id
exports.getTripById = catchAsync(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id).populate("user", "firstName lastName email phone").lean();
  if (!trip) return next(new AppError("Trip not found", 404));
  const isStaff = ["admin", "owner"].includes(req.user.role);
  const ownerId = String(trip.user?._id ?? trip.user);
  if (!isStaff && ownerId !== req.user.userId) return next(new AppError("Access denied", 403));
  res.status(200).json({ isSuccess: true, data: { trip } });
});

// POST /trip/:id/create-order  { phoneNumber, members:[{name,age,gender}] }
// The amount comes from the saved trip, never from the browser.
exports.createTripOrder = catchAsync(async (req, res, next) => {
  const trip = await loadOwnTrip(req.params.id, req.user.userId);
  if (trip.status !== "draft") return next(new AppError("This trip is already booked or closed", 400));

  const phoneNumber = str(req.body.phoneNumber, 8, 15, "Phone number");
  const members = Array.isArray(req.body.members) ? req.body.members : [];
  if (members.length !== trip.numberOfTravellers) {
    return next(new AppError(`Please add details of all ${trip.numberOfTravellers} travellers`, 400));
  }
  trip.members = members.map((m) => ({
    name: str(m.name, 2, 80, "Member name"),
    age: int(m.age, 0, 120, "Member age"),
    gender: ["male", "female", "other"].includes(m.gender) ? m.gender : undefined,
  }));
  trip.phoneNumber = phoneNumber;

  // Demo mode: simulated checkout (see utils/demoPayments.js); otherwise a real Razorpay order
  const order = isDemoMode()
    ? newDemoOrder(trip.pricing.total * 100)
    : await razorpay.orders.create({
        amount: trip.pricing.total * 100, // paise
        currency: "INR",
        receipt: `trip_${trip._id}`,
      });
  trip.razorpayOrderId = order.id;
  await trip.save();

  res.status(200).json({ isSuccess: true, data: { id: order.id, amount: order.amount, currency: order.currency, ...(order.demo ? { demo: true } : {}) } });
});

// POST /trip/:id/verify-payment
exports.verifyTripPayment = catchAsync(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const trip = await loadOwnTrip(req.params.id, req.user.userId);

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new AppError("Payment verification failed. Please try again.", 400));
  }
  if (trip.razorpayOrderId !== razorpay_order_id) {
    return next(new AppError("Payment verification failed. Please try again.", 400));
  }
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (expected !== razorpay_signature) {
    return next(new AppError("Payment verification failed. Please try again.", 400));
  }

  trip.status = "booked";
  trip.paymentId = razorpay_payment_id;
  await trip.save();
  res.status(200).json({ isSuccess: true, message: "Trip booked successfully", data: { trip } });
});

// PATCH /trip/:id/cancel  (draft trips only)
exports.cancelDraftTrip = catchAsync(async (req, res, next) => {
  const trip = await loadOwnTrip(req.params.id, req.user.userId);
  if (trip.status !== "draft") return next(new AppError("Only a trip that is not paid yet can be removed here", 400));
  trip.status = "cancelled";
  await trip.save();
  res.status(200).json({ isSuccess: true, message: "Trip removed" });
});

// PATCH /trip/:id/manage  { status?: "completed"|"cancelled", assignedGuide?: userId } (admin, owner)
exports.manageTrip = catchAsync(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) return next(new AppError("Trip not found", 404));
  if (req.body.status) {
    if (!["completed", "cancelled"].includes(req.body.status)) return next(new AppError("Invalid status", 400));
    trip.status = req.body.status;
  }
  if (req.body.assignedGuide !== undefined) {
    if (req.body.assignedGuide === null || req.body.assignedGuide === "") trip.assignedGuide = null;
    else {
      const guide = await User.findOne({ _id: req.body.assignedGuide, role: "guide" }).select("_id");
      if (!guide) return next(new AppError("Guide not found", 404));
      trip.assignedGuide = guide._id;
    }
  }
  await trip.save();
  res.status(200).json({ isSuccess: true, message: "Trip updated", data: { trip } });
});
