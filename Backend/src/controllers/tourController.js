const slugify = require("slugify");
// Models
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const Review = require("../models/reviewModel");
const SearchLog = require("../models/searchModel");

// Utilities
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} = require("../utils/cloudinaryUploader");

function transformTourSpots(tourSpots) {
  return tourSpots.map((spot) => {
    const dayLabel = `Day ${spot.day}`;
    const lat = spot.location.coordinates[1];
    const lng = spot.location.coordinates[0];

    return {
      day: dayLabel,
      place: spot.name,
      task: spot.description,
      position: { lat, lng },
    };
  });
}

exports.createTour = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    location,
    duration,
    participants,
    difficulty,
    languages,
    startDate,
    overview,
    highlights,
    included,
    guides,
    pricePerPerson,
    currency = "INR",
    stops,
  } = req.body;

  const slug = slugify(title, { lower: true });

  const existingTour = await Tour.findOne({ slug });
  if (existingTour) {
    return next(
      new AppError(
        "A tour with this title already exists. Please choose a different title.",
        400
      )
    );
  }

  // Transform tour spots
  const tourSpots = stops.map((spot, index) => ({
    day: index + 1,
    name: spot.name.trim(),
    description: spot.description.trim(),
    location: {
      type: "Point",
      coordinates: [parseFloat(spot.lng), parseFloat(spot.lat)], // [lng, lat]
    },
  }));

  // Validate thumbnail presence
  if (!req.files?.thumbnail || req.files.thumbnail.length === 0) {
    return next(new AppError("Thumbnail image is required", 400));
  }

  // ✅ Upload thumbnail (resize + compress)
  const thumbnailFile = req.files.thumbnail[0];
  const thumbnail = await uploadImageToCloudinary({
    buffer: thumbnailFile.buffer,
    folder: `goguided/tours/${slug}/thumbnail`,
    publicId: `thumbnail_${Date.now()}`,
    resize: { width: 600, height: 900 },
    quality: 85,
  });

  // Validate image presence
  if (!req.files?.images || req.files.images.length === 0) {
    return next(new AppError("At least one image is required", 400));
  }

  // ✅ Upload images in parallel
  const imageUploadPromises = req.files.images.map((img, i) =>
    uploadImageToCloudinary({
      buffer: img.buffer,
      folder: `goguided/tours/${slug}/images`,
      publicId: `image_${Date.now()}_${i}}`,
      resize: { width: 1920 },
      quality: 85,
    })
  );

  const images = await Promise.all(imageUploadPromises);

  // ✅ Create tour in DB
  const newTour = await Tour.create({
    title: title.trim(),
    slug,
    description,
    location: location.trim(),
    duration,
    participants: Number(participants),
    difficulty,
    languages,
    startDate: new Date(startDate),
    endDate: new Date(
      new Date(startDate).getTime() + (duration - 1) * 24 * 60 * 60 * 1000
    ),
    overview: overview.trim(),
    highlights,
    included,
    guides,
    thumbnail,
    images,
    tourSpots,
    pricePerPerson: Number(pricePerPerson),
    currency,
  });

  res.status(201).json({
    isSuccess: true,
    message: "Tour created successfully.",
    tour: newTour,
  });
});

exports.getAllTours = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortOrder = "asc",
    status,
    startDate,
    endDate,
  } = req.query;

  const filters = {};

  // 🔍 Search on tour title (case-insensitive)
  if (search) {
    filters.title = { $regex: search, $options: "i" };
  }

  // 📆 Date range filter
  if (startDate || endDate) {
    filters.startDate = {};
    if (startDate) filters.startDate.$gte = new Date(startDate);
    if (endDate) filters.startDate.$lte = new Date(endDate);
  }

  // 🟡 Status filtering logic (based on current date)
  if (status) {
    const today = new Date();

    if (status === "upcoming") {
      filters.startDate = { $gt: today };
    } else if (status === "ongoing") {
      filters.startDate = { $lte: today };
      filters.endDate = { $gte: today };
    } else if (status === "completed") {
      filters.endDate = { $lt: today };
    }
  }

  // 📊 Pagination setup
  const skip = (page - 1) * limit;

  // 🧮 Get total count after filtering
  const total = await Tour.countDocuments(filters);

  // 📦 Fetch filtered & paginated data
  const tours = await Tour.find(filters)
    .select(
      "title slug location duration difficulty startDate endDate pricePerPerson description participants"
    )
    .sort({
      pricePerPerson: sortOrder === "desc" ? -1 : 1, // ✅ Sort by price first
      startDate: 1, // ✅ Sort by start date next
    })
    .skip(skip)
    .limit(Number(limit));

  // ✅ Final response
  res.status(200).json({
    isSuccess: true,
    data: {
      totalPages: Math.ceil(total / limit),
      total,
      tours,
    },
  });
});

exports.getAllToursAsCards = catchAsync(async (req, res, next) => {
  const { search = "", status, difficulty, startDate, endDate } = req.query;

  const filters = {};
  // 🔍 Search
  if (search) {
    await SearchLog.findOneAndUpdate(
      { query: search }, // find by query
      {
        $inc: { frequency: 1 }, // increment frequency
      },
      { upsert: true, new: true } // create if not exists
    );
    filters.title = { $regex: search, $options: "i" };
  }

  // 🔽 Difficulty
  if (difficulty) filters.difficulty = difficulty.toLowerCase();

  // 📆 Date range
  if (startDate || endDate) {
    filters.startDate = {};
    if (startDate) filters.startDate.$gte = new Date(startDate);
    if (endDate) filters.startDate.$lte = new Date(endDate);
  }

  // 🟡 Status filter
  if (status) {
    const today = new Date();
    if (status === "upcoming") filters.startDate = { $gt: today };
    else if (status === "ongoing") {
      filters.startDate = { $lte: today };
      filters.endDate = { $gte: today };
    } else if (status === "completed") filters.endDate = { $lt: today };
  }

  // 🔹 Fetch all tours for each category
  const [generalTours, mostVisitedTours, mostLikedTours] = await Promise.all([
    // General Tours (recent)
    Tour.find(filters)
      .sort({ createdAt: -1 })
      .select(
        "title slug description location startDate endDate difficulty tourSpots thumbnail visits likes pricePerPerson"
      )
      .lean(),

    // Most Visited Tours
    Tour.find(filters)
      .sort({ visits: -1 })
      .select(
        "title slug description location startDate endDate difficulty tourSpots thumbnail visits likes pricePerPerson"
      )
      .lean(),

    // Most Liked Tours (sorted by likes array length)
    Tour.aggregate([
      { $match: filters },
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } },
        },
      },
      { $sort: { likesCount: -1 } },
      {
        $project: {
          title: 1,
          slug: 1,
          description: 1,
          location: 1,
          startDate: 1,
          endDate: 1,
          difficulty: 1,
          tourSpots: 1,
          thumbnail: 1,
          visits: 1,
          likes: 1,
          pricePerPerson: 1,
        },
      },
    ]),
  ]);

  // 🔹 Aggregate ratings only for fetched tours
  const tourIds = [
    ...generalTours.map((t) => t._id),
    ...mostVisitedTours.map((t) => t._id),
    ...mostLikedTours.map((t) => t._id),
  ];

  const ratingAgg = await Review.aggregate([
    { $match: { tour: { $in: tourIds } } },
    { $group: { _id: "$tour", avgRating: { $avg: "$rating" } } },
  ]);

  const ratingMap = {};
  ratingAgg.forEach((r) => {
    ratingMap[r._id.toString()] = parseFloat(r.avgRating.toFixed(1));
  });

  // 🔹 Helper to format tours
  const formatTours = (tours) =>
    tours.map((tour) => ({
      _id: tour._id,
      title: tour.title,
      slug: tour.slug,
      description: tour.description,
      location: tour.location,
      startDate: tour.startDate,
      endDate: tour.endDate,
      difficulty: tour.difficulty,
      avgRating: ratingMap[tour._id.toString()] || 0,
      tourSpots: tour.tourSpots?.length || 0,
      thumbnail: tour.thumbnail?.secure_url || null,
      visits: tour.visits || 0,
      likes: tour.likes?.length || 0, // updated to number of likes
      pricePerPerson: tour.pricePerPerson || 0,
    }));

  // 🔹 Overall total tours count
  const totalTours = await Tour.countDocuments(filters);

  res.status(200).json({
    isSuccess: true,
    data: {
      totalTours,
      tour: [
        { category: "general", tours: formatTours(generalTours) },
        { category: "mostVisited", tours: formatTours(mostVisitedTours) },
        { category: "mostLiked", tours: formatTours(mostLikedTours) },
      ],
    },
  });
});

exports.getTourBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  let tour = await Tour.findOne({ slug }).populate({
    path: "guides",
    select: "firstName lastName profilePic",
  });

  if (!tour) return next(new AppError("Tour not found", 404));

  // Get all reviews for this tour with user info
  const reviews = await Review.find({ tour: tour._id })
    .select("rating review")
    .populate({
      path: "user",
      select: "firstName lastName profilePic",
    })
    .sort({ createdAt: -1 })
    .limit(10);

  // Calculate booked participants
  const bookingAgg = await Booking.aggregate([
    {
      $match: {
        tour: tour._id,
        status: "confirmed",
      },
    },
    {
      $group: {
        _id: "$tour",
        totalBooked: { $sum: "$numberOfParticipants" },
      },
    },
  ]);

  const booked = bookingAgg[0]?.totalBooked || 0;
  const availableSlots = Math.max(0, tour.participants - booked);

  // Get average rating and total reviews for this tour
  const ratingAgg = await Review.aggregate([
    {
      $match: { tour: tour._id },
    },
    {
      $group: {
        _id: "$tour",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const avgRating = ratingAgg[0]?.avgRating || 0;
  const totalReviews = ratingAgg[0]?.totalReviews || 0;

  // Convert tour to plain object
  tour = tour.toObject();

  // Add reviews
  tour.reviews = reviews.map((r) => ({
    _id: r._id,
    rating: r.rating,
    review: r.review,
    reviewerName: `${r.user.firstName} ${r.user.lastName}`,
    profilePicUrl: r.user.profilePic?.url || null,
  }));

  // Add available slots and rating info
  tour.availableSlots = availableSlots;
  tour.avgRating = parseFloat(avgRating.toFixed(1));
  tour.totalReviews = totalReviews;

  // Transform images
  if (tour.images && Array.isArray(tour.images)) {
    tour.images = tour.images.map((image) => ({ url: image.secure_url }));
  }

  // Transform guides
  if (tour.guides && Array.isArray(tour.guides)) {
    tour.guides = tour.guides.map((guide) => ({
      _id: guide._id,
      name: `${guide.firstName} ${guide.lastName}`,
      profilePicUrl: guide.profilePic?.url || null,
    }));
  }

  if (tour.tourSpots && Array.isArray(tour.tourSpots)) {
    tour.tourSpots = transformTourSpots(tour.tourSpots);
  }

  res.status(200).json({
    isSuccess: true,
    data: {
      tour: tour || [],
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const { slug: oldSlug } = req.params;
  const {
    title,
    description,
    location,
    duration,
    participants,
    difficulty,
    languages,
    startDate,
    overview,
    highlights,
    included,
    guides,
    pricePerPerson,
    currency = "INR",
    stops,
    existingImages = [],
    existingThumbnail = null,
  } = req.body;

  const tour = await Tour.findOne({ slug: oldSlug });
  if (!tour) {
    return next(new AppError("Tour not found", 404));
  }

  const slug = slugify(title, { lower: true });

  // ✅ Update tourSpots
  const tourSpots = stops.map((spot, index) => ({
    day: index + 1,
    name: spot.name.trim(),
    description: spot.description.trim(),
    location: {
      type: "Point",
      coordinates: [parseFloat(spot.lng), parseFloat(spot.lat)],
    },
  }));

  // ✅ Handle Thumbnail Update
  let finalThumbnail = tour.thumbnail;

  const newThumbnailFile = req.files?.thumbnail?.[0];
  if (newThumbnailFile) {
    // Delete old thumbnail
    if (tour.thumbnail?.public_id) {
      await deleteImageFromCloudinary(tour.thumbnail.public_id);
    }

    // Upload new thumbnail
    finalThumbnail = await uploadImageToCloudinary({
      buffer: newThumbnailFile.buffer,
      folder: `goguided/tours/${slug}/thumbnail`,
      publicId: `thumbnail_${Date.now()}`,
      resize: { width: 600, height: 900 },
      quality: 85,
    });
  } else if (!existingThumbnail) {
    return next(new AppError("Thumbnail is required", 400));
  }

  // ✅ Handle Image Update
  const existingImageUrls = Array.isArray(existingImages)
    ? existingImages
    : [existingImages];

  const removedImages = tour.images.filter(
    (img) => !existingImageUrls.includes(img.secure_url)
  );

  // ❌ Delete removed images from Cloudinary
  await Promise.all(
    removedImages.map((img) => deleteImageFromCloudinary(img.public_id))
  );

  // ✅ Upload newly added images
  const newImages = [];
  if (req.files?.images && req.files.images.length > 0) {
    const uploadPromises = req.files.images.map((img, i) =>
      uploadImageToCloudinary({
        buffer: img.buffer,
        folder: `goguided/tours/${slug}/images`,
        publicId: `image_${Date.now()}_${i}}`,
        resize: { width: 1920 },
        quality: 85,
      })
    );

    const uploaded = await Promise.all(uploadPromises);
    newImages.push(...uploaded);
  }

  const finalImages = [
    ...tour.images.filter((img) => existingImageUrls.includes(img.secure_url)),
    ...newImages,
  ];

  if (finalImages.length === 0) {
    return next(new AppError("At least one image is required", 400));
  }

  // ✅ Update tour in DB
  tour.title = title.trim();
  tour.slug = slug;
  tour.description = description;
  tour.location = location.trim();
  tour.duration = Number(duration);
  tour.participants = Number(participants);
  tour.difficulty = difficulty;
  tour.languages = languages;
  tour.startDate = new Date(startDate);
  tour.endDate = new Date(
    new Date(startDate).getTime() + (duration - 1) * 24 * 60 * 60 * 1000
  );
  tour.overview = overview.trim();
  tour.highlights = highlights;
  tour.included = included;
  tour.guides = guides;
  tour.thumbnail = finalThumbnail;
  tour.images = finalImages;
  tour.tourSpots = tourSpots;
  tour.pricePerPerson = Number(pricePerPerson);
  tour.currency = currency;

  await tour.save();

  res.status(200).json({
    isSuccess: true,
    message: "Tour updated successfully.",
    tour,
  });
});

exports.likeOrUnlikeTour = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  const { action } = req.body;
  const { userId } = req.user;

  if (!tourId) return next(new AppError("Tour ID is required", 400));

  const tour = await Tour.findById(tourId);
  if (!tour) return next(new AppError("Tour not found", 404));

  if (!Array.isArray(tour.likes)) tour.likes = [];

  if (action === "like") {
    if (!tour.likes.includes(userId)) {
      tour.likes.push(userId);
      await tour.save();
    }
    return res.status(200).json({
      isSuccess: true,
      message: "Tour liked",
      likes: tour.likes.length,
    });
  } else if (action === "unlike") {
    tour.likes = tour.likes.filter((id) => id.toString() !== userId.toString());
    await tour.save();
    return res.status(200).json({
      isSuccess: true,
      message: "Tour unliked",
      likes: tour.likes.length,
    });
  } else {
    return next(new AppError("Invalid action", 400));
  }
});
