const User = require("../models/userModel");
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.updateGuideStatus = catchAsync(async (req, res) => {
  const { userId: guideId } = req.user;
  const { status, nextAvailableFrom } = req.body;

  const guide = await User.findById(guideId);

  if (!guide || guide.role !== "guide") {
    throw new AppError("Guide not found or unauthorized access.", 404);
  }

  if (status === "unavailable") {
    const nextAvailableDate = new Date(nextAvailableFrom);
    const today = new Date();

    const conflict = await Tour.exists({
      guide: guideId,
      startDate: { $lte: nextAvailableDate },
      endDate: { $gte: today },
    });

    if (conflict) {
      throw new AppError(
        "You are already booked on a tour that overlaps with your selected availability date.",
        400
      );
    }
  }

  guide.availabilityStatus = status;
  guide.availableFrom =
    status === "unavailable" ? new Date(nextAvailableFrom) : null;

  await guide.save();

  return res.status(200).json({
    isSuccess: true,
    message: "Availability status updated",
    data: {
      status: guide.availabilityStatus,
      nextAvailableFrom: guide.availableFrom,
    },
  });
});

exports.getMyStatus = catchAsync(async (req, res) => {
  const { userId: guideId } = req.user;

  const guide = await User.findById(guideId).select(
    "name availabilityStatus availableFrom role"
  );

  if (!guide || guide.role !== "guide") {
    throw new AppError("Guide not found or unauthorized access.", 404);
  }

  return res.status(200).json({
    isSuccess: true,
    data: {
      status: guide.availabilityStatus,
      nextAvailableFrom: guide.availableFrom,
    },
  });
});

exports.getAvailableGuides = catchAsync(async (req, res, next) => {
  const { startDate, duration } = req.query;

  if (!startDate || !duration) {
    return res.status(400).json({
      error: "startDate and duration are required as query parameters",
    });
  }

  const tourStart = new Date(startDate);
  const tourEnd = new Date(tourStart);
  tourEnd.setDate(tourEnd.getDate() + parseInt(duration));

  // Step 1: Get potential guides based on availability
  const potentialGuides = await User.find({
    role: "guide",
    $or: [
      { availabilityStatus: "available" },
      {
        availabilityStatus: "unavailable",
        availableFrom: { $lte: tourStart },
      },
    ],
  });

  const guideIds = potentialGuides.map((g) => g._id);

  // Step 2: Find conflicting tours where any of these guides are already assigned
  const conflictingTours = await Tour.find({
    guides: { $in: guideIds },
    $expr: {
      $and: [
        { $lte: ["$startDate", tourEnd] },
        {
          $gte: [
            {
              $add: [
                "$startDate",
                { $multiply: ["$duration", 86400000] }, // duration × ms
              ],
            },
            tourStart,
          ],
        },
      ],
    },
  });

  // Step 3: Build a set of booked guide IDs
  const bookedGuideIds = new Set();
  conflictingTours.forEach((tour) => {
    tour.guides.forEach((gid) => bookedGuideIds.add(gid.toString()));
  });

  // Step 4: Filter potential guides
  const availableGuides = potentialGuides.filter((guide) => {
    return !bookedGuideIds.has(guide._id.toString());
  });

  res.status(200).json({
    isSuccess: true,
    data: {
      guides: availableGuides.map((guide) => ({
        _id: guide._id,
        name: `${guide.firstName} ${guide.lastName}`.trim(),
      })),
    },
  });
});

exports.getGuideBookingStats = catchAsync(async (req, res, next) => {
  const guideId = req.user.userId;

  // Step 1: Get tours for this guide
  const tours = await Tour.find({ guides: guideId }).select(
    "_id startDate endDate"
  );

  if (!tours.length) {
    return res.status(200).json({
      isSuccess: true,
      data: { completed: 0, ongoing: 0, upcoming: 0 },
    });
  }

  const today = new Date();
  const stats = {
    completed: 0,
    ongoing: 0,
    upcoming: 0,
  };

  // Step 2: Build tourId -> tripStatus map
  const tourStatusMap = {};
  tours.forEach((tour) => {
    const start = new Date(tour.startDate);
    const end = new Date(tour.endDate);

    let tripStatus = "upcoming";
    if (today > end) tripStatus = "completed";
    else if (today >= start && today <= end) tripStatus = "ongoing";

    tourStatusMap[tour._id.toString()] = tripStatus;
  });

  // Step 3: Get confirmed bookings for these tours
  const bookings = await Booking.find({
    tour: { $in: tours.map((t) => t._id) },
    status: "confirmed",
  }).select("tour");

  // Step 4: Tally booking counts by trip status
  bookings.forEach((booking) => {
    const tripStatus = tourStatusMap[booking.tour.toString()];
    if (tripStatus) stats[tripStatus]++;
  });

  return res.status(200).json({
    isSuccess: true,
    data: { stats },
  });
});
