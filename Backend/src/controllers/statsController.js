const catchAsync = require("../utils/catchAsync");
const Booking = require("../models/bookingModel");
const Tour = require("../models/tourModel");
const Review = require("../models/reviewModel");
const User = require("../models/userModel");
const Feedback = require("../models/feedbackModel");
const Job = require("../models/jobModel");

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  const [bookingsStats, toursStats, reviewsStats, monthlyBookings] =
    await Promise.all([
      // 1) Total confirmed booking amount
      Booking.aggregate([
        { $match: { status: "confirmed" } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amountPaid" },
          },
        },
      ]),

      // 2) Tours by status (upcoming / ongoing / completed)
      Tour.aggregate([
        {
          $project: {
            status: {
              $switch: {
                branches: [
                  { case: { $gt: ["$startDate", now] }, then: "upcoming" },
                  {
                    case: {
                      $and: [
                        { $lte: ["$startDate", now] },
                        { $gte: ["$endDate", now] },
                      ],
                    },
                    then: "ongoing",
                  },
                  { case: { $lt: ["$endDate", now] }, then: "completed" },
                ],
                default: "unknown",
              },
            },
          },
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // 3) Average rating
      Review.aggregate([
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
          },
        },
      ]),

      // 4) Monthly confirmed bookings in the last year
      Booking.aggregate([
        {
          $match: {
            status: "confirmed",
            createdAt: { $gte: oneYearAgo },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

  // Handle booking amount
  const bookingData = bookingsStats[0] || { totalAmount: 0 };

  // Format tour status counts
  const toursByStatus = { upcoming: 0, ongoing: 0, completed: 0 };
  toursStats.forEach(({ _id, count }) => {
    if (toursByStatus[_id] !== undefined) {
      toursByStatus[_id] = count;
    }
  });

  // Handle average rating
  const reviewData = reviewsStats[0] || { avgRating: 0 };

  // Monthly booking data in calendar order
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthMap = monthlyBookings.reduce((acc, { _id, count }) => {
    acc[_id.month] = count;
    return acc;
  }, {});

  const bookingsPerMonth = monthNames.map((name, index) => ({
    name,
    value: monthMap[index + 1] || 0,
  }));

  // Final response
  res.status(200).json({
    isSuccess: true,
    data: {
      totalConfirmedBookingAmount: bookingData.totalAmount,
      toursByStatus,
      averageRating: Math.round(reviewData.avgRating * 10) / 10 || 0,
      bookingsPerMonth,
    },
  });
});

exports.getStatCardCounts = catchAsync(async (req, res, next) => {
  const userRole = req.user?.role;

  const [
    bookingsCount,
    toursCount,
    reviewsCount,
    feedbacksCount,
    jobsCount,
    usersCount,
    guidesCount,
    adminsCount,
  ] = await Promise.all([
    Booking.countDocuments(),
    Tour.countDocuments(),
    Review.countDocuments(),
    Feedback.countDocuments(),
    Job.countDocuments(),
    User.countDocuments({ role: "user", isDeleted: false }),
    User.countDocuments({ role: "guide" }),
    User.countDocuments({ role: "admin" }),
  ]);

  const data = {
    bookings: bookingsCount,
    tours: toursCount,
    reviews: reviewsCount,
    users: usersCount,
    feedbacks: feedbacksCount,
    guides: guidesCount,
    jobs: jobsCount,
  };

  // Include admins count only for owner
  if (userRole === "owner") {
    data.admins = adminsCount;
  }

  res.status(200).json({
    isSuccess: true,
    data: { statsCount: data },
  });
});

exports.getAchievements = catchAsync(async (req, res, next) => {
  // Total trips planned = number of bookings
  const tripsPlanned = await Tour.countDocuments();

  // Get all tours with their tourSpots
  const tours = await Tour.find({}, "tourSpots");

  // Extract all coordinates
  const allCoordinates = tours.flatMap((tour) =>
    tour.tourSpots.map((spot) => spot.location?.coordinates?.join(","))
  );

  // Deduplicate coordinates
  const uniqueCoordinates = [...new Set(allCoordinates.filter(Boolean))];
  const destinationsCovered = uniqueCoordinates.length;

  // Repeat travelers calculation
  const users = await User.find({}, "_id bookings");
  const repeatTravelersCount = users.filter(
    (u) => u.bookings.length > 1
  ).length;
  const repeatTravelersPercentage =
    users.length > 0
      ? Math.round((repeatTravelersCount / users.length) * 100)
      : 0;

  // Reviews and average rating
  const reviews = await Review.find({}, "rating");
  const avgRatingValue =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const averageRating = avgRatingValue.toFixed(1);
  const customerSatisfaction = Math.round((avgRatingValue / 5) * 100);

  const profitsDonated = 10; // Hardcoded or calculated elsewhere

  // ✅ Respond
  res.status(200).json({
    success: true,
    message: "Achievements fetched successfully",
    data: {
      destinationsCovered,
      customerSatisfaction,
      repeatTravelers: repeatTravelersPercentage,
      averageRating,
      profitsDonated,
      tripsPlanned,
    },
  });
});
