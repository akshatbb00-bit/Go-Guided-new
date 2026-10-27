const Review = require("../models/reviewModel");
const User = require("../models/userModel");
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createOrUpdateReview = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  const { userId } = req.user;
  const { rating, review } = req.body;

  // Check if the user already submitted a review for this tour
  let existingReview = await Review.findOne({ tour: tourId, user: userId });

  let savedReview;
  if (existingReview) {
    // Update existing review
    existingReview.rating = rating;
    existingReview.review = review;
    existingReview.updatedAt = Date.now();
    savedReview = await existingReview.save();
  } else {
    // Create new review
    savedReview = await Review.create({
      tour: tourId,
      user: userId,
      rating,
      review,
    });

    // Optional: Add review to user's review list
    const user = await User.findById(userId);
    if (user) {
      user.reviews.push(savedReview._id);
      await user.save();
    }
  }

  res.status(existingReview ? 200 : 201).json({
    isSuccess: true,
    message: existingReview
      ? "Review updated successfully."
      : "Review submitted successfully.",
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;
  const { userId, role } = req.user;

  // Find the review
  const review = await Review.findById(reviewId);
  if (!review) {
    return next(
      new AppError("You have not submitted a review for this tour.", 404)
    );
  }

  // Authorization: Only the author, admin, or owner can delete the review
  const isAuthor = review.user.toString() === userId;
  const isPrivileged = role === "admin" || role === "owner";

  if (!isAuthor && !isPrivileged) {
    return next(
      new AppError("You are not authorized to delete this review.", 403)
    );
  }

  // Delete review
  await review.deleteOne();

  // Remove from user's review list only if author is deleting
  if (isAuthor) {
    const user = await User.findById(userId);
    if (user) {
      user.reviews = user.reviews.filter((r) => r.toString() !== reviewId);
      await user.save({ validateBeforeSave: false });
    }
  }

  res.status(200).json({
    isSuccess: true,
    message: "Review has been deleted successfully.",
  });
});

exports.getUserReviews = catchAsync(async (req, res, next) => {
  const { userId } = req.user;

  // 1. Get user's bookings (booking IDs)
  const user = await User.findById(userId).select("bookings");
  const bookingIds = user?.bookings;

  if (!bookingIds || bookingIds.length === 0) {
    return res.status(200).json({
      isSuccess: true,
      reviewed: [],
      notReviewed: [],
    });
  }

  // 2. Get valid Booking documents
  const bookings = await Booking.find({
    _id: { $in: bookingIds },
    status: { $ne: "cancelled" }, // ✅ Exclude cancelled
  }).select("tour");

  const tourIds = bookings.map((b) => b.tour.toString());

  // 3. Get all reviews by this user
  const reviews = await Review.find({ user: userId }).select(
    "tour rating review createdAt"
  );

  const reviewedTourIds = reviews.map((r) => r.tour.toString());

  // 4. Get all tours once, reduce DB calls
  const tours = await Tour.find({ _id: { $in: tourIds } }).select(
    "title slug endDate"
  );

  const reviewedTours = [];
  const notReviewedTours = [];

  const today = new Date();

  for (const tour of tours) {
    const tourId = tour._id.toString();

    const isCompleted = new Date(tour.endDate) < today;

    if (!isCompleted) continue; // ✅ Skip tours not yet completed

    if (reviewedTourIds.includes(tourId)) {
      const review = reviews.find((r) => r.tour.toString() === tourId);
      reviewedTours.push({ tour, review });
    } else {
      notReviewedTours.push(tour);
    }
  }

  res.status(200).json({
    isSuccess: true,
    data: { reviewedTours, notReviewedTours },
  });
});

exports.getRecentReviews = catchAsync(async (req, res, next) => {
  const reviewsRaw = await Review.find()
    .sort({ createdAt: -1 })
    .limit(15)
    .populate("user", "firstName lastName profilePic")
    .select("review rating user");

  const reviews = reviewsRaw.map((review) => ({
    _id: review._id,
    review: review.review,
    rating: review.rating,
    reviewerName: `${review.user.firstName} ${review.user.lastName}`,
    profilePicUrl: review.user.profilePic?.url || null,
  }));

  res.status(200).json({
    isSuccess: true,
    results: reviews.length,
    data: { reviews },
  });
});

exports.getAllReviews = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { search, rating, startDate, endDate, sortOrder = "desc" } = req.query;

  const query = {};

  // 🔍 Search in user's name or email
  if (search) {
    query.$or = [
      { "user.firstName": { $regex: search, $options: "i" } },
      { "user.lastName": { $regex: search, $options: "i" } },
      { "user.email": { $regex: search, $options: "i" } },
    ];
  }

  if (rating) {
    if (rating.startsWith("gte_")) {
      const threshold = parseInt(rating.split("_")[1], 10);
      query.rating = { $gte: threshold };
    } else if (rating.startsWith("eq_")) {
      const value = parseInt(rating.split("_")[1], 10);
      query.rating = value;
    }
  }

  // 🗓️ Date filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // ⚙️ Base query with user population and filtering
  const baseQuery = Review.find(query)
    .populate({
      path: "user",
      select: "firstName lastName email",
    })
    .select("rating createdAt user")
    .sort({ createdAt: sortOrder === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  // Count total matching docs
  const [reviews, total] = await Promise.all([
    baseQuery,
    Review.countDocuments(query),
  ]);

  // 🧾 Transform data
  const transformedReviews = reviews.map((review) => ({
    _id: review._id,
    reviewerName: `${review.user.firstName} ${review.user.lastName}`,
    reviewerEmail: review.user.email,
    rating: review.rating,
    createdAt: review.createdAt,
  }));

  // 📤 Response
  res.status(200).json({
    success: true,
    data: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total,
      results: reviews.length,
      reviews: transformedReviews,
    },
  });
});

exports.getReviewById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id)
    .populate({
      path: "user",
      select: "firstName lastName email",
    })
    .populate({
      path: "tour",
      select: "title",
    });

  if (!review) {
    return res.status(404).json({ message: "Review not found." });
  }

  const reviewer = review.user;
  const tour = review.tour;

  const formattedReview = {
    id: review._id,
    reviewerName: reviewer
      ? `${reviewer.firstName} ${reviewer.lastName || ""}`.trim()
      : "Unknown",
    email: reviewer?.email || "N/A",
    date: review.createdAt,
    rating: review.rating,
    tourName: tour?.title || "Unknown",
    message: review.review,
  };

  res.status(200).json({
    isSuccess: true,
    data: { review: formattedReview },
  });
});
