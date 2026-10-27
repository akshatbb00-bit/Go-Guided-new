const Booking = require("../models/bookingModel");
const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const razorpay = require("../config/razorpay");

exports.getAllBookings = catchAsync(async (req, res, next) => {
  // Query params
  const {
    search = "",
    sortOrder = "desc",
    status,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Step 1: Build filter
  const filter = {};

  if (search) {
    filter.tourTitle = { $regex: search, $options: "i" };
  }

  if (status) {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Step 2: Query from DB
  const [totalCount, bookings] = await Promise.all([
    Booking.countDocuments(filter),
    Booking.find(filter)
      .sort({ createdAt: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "user",
        select: "firstName lastName email",
      }),
  ]);

  // Step 3: Format results
  const formattedBookings = bookings.map((booking) => {
    const tourTitle = booking.tourTitle || {};
    const customerName = booking.user
      ? `${booking.user.firstName} ${booking.user.lastName}`
      : "";
    const customerEmail = booking.user.email;

    return {
      _id: booking._id,
      tourTitle,
      status: booking.status,
      createdAt: booking.createdAt,
      customerName,
      customerEmail,
    };
  });

  return res.status(200).json({
    isSuccess: true,
    data: {
      total: totalCount,
      results: bookings.length,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page),
      bookings: formattedBookings,
    },
  });
});

exports.getUserBookings = catchAsync(async (req, res, next) => {
  const { userId } = req.user;

  // Query params
  const {
    search = "",
    sortOrder = "desc",
    status,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Step 1: Build filter
  const filter = { user: userId };

  if (search) {
    filter.tourTitle = { $regex: search, $options: "i" };
  }

  if (status) {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Step 2: Query from DB
  const [totalCount, bookings] = await Promise.all([
    Booking.countDocuments(filter),
    Booking.find(filter)
      .sort({ createdAt: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "tour",
        select: "startDate endDate guides",
        populate: {
          path: "guides",
          select: "firstName lastName",
        },
      }),
  ]);

  // Step 3: Format results with tour members
  const formattedBookings = await Promise.all(
    bookings.map(async (booking) => {
      const tour = booking.tour || {};

      const guides = Array.isArray(tour.guides)
        ? tour.guides.map((g) => `${g.firstName} ${g.lastName}`)
        : [];

      // Get all other users booked on same tour
      const members = await Booking.find({
        tour: tour._id,
        status: { $ne: "cancelled" },
      }).populate({
        path: "user",
        select: "firstName lastName email",
      });

      const otherMembers = members.map((item) => {
        const user = item.user || {};

        return {
          _id: item._id,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          email: user.email || null,
          phoneNumber: item.phoneNumber || null, // from booking
        };
      });

      // Compute trip status
      const today = new Date();
      const start = new Date(tour.startDate);
      const end = new Date(tour.endDate);

      let tripStat = "upcoming";
      if (today > end) tripStat = "completed";
      else if (today >= start && today <= end) tripStat = "ongoing";

      return {
        id: booking._id,
        status: booking.status,
        tripStatus: tripStat,
        createdAt: booking.createdAt,

        tour: {
          _id: tour._id,
          title: booking.tourTitle,
          startDate: tour.startDate,
          endDate: tour.endDate,
          guides,
          members: otherMembers, // all booked users on this tour
        },
      };
    }),
  );

  return res.status(200).json({
    isSuccess: true,
    data: {
      total: totalCount,
      results: bookings.length,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page),
      bookings: formattedBookings,
    },
  });
});

exports.cancelBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new AppError("Booking not found", 404));
  }

  // Prevent double cancellation
  if (booking.status === "cancelled") {
    return next(new AppError("Booking already cancelled", 400));
  }

  // Optional: Check if booking is refundable based on tour start date
  const tourStart = new Date(booking.tourStartDate); // assuming you store this
  if (new Date() >= tourStart) {
    return next(new AppError("Tour has already started, cannot cancel.", 400));
  }

  // Refund payment if applicable
  if (booking.paymentId) {
    try {
      razorpay.payments.refund(booking.paymentId);
    } catch (err) {
      return next(new AppError("Refund failed. Please try again later.", 502));
    }
  }

  // Mark booking as cancelled
  booking.status = "cancelled";
  await booking.save();

  res.status(200).json({
    isSuccess: true,
    message: "Booking cancelled and payment refunded successfully.",
  });
});

exports.getBookingsByTripStatus = catchAsync(async (req, res, next) => {
  const guideId = req.user.userId;
  const { status } = req.params;
  const {
    search,
    sort = "desc", // default is descending
    page = 1,
    limit = 10,
    startDate,
    endDate,
  } = req.query;

  if (!["completed", "ongoing", "upcoming"].includes(status)) {
    return res.status(400).json({
      isSuccess: false,
      message: "Invalid status. Must be 'completed', 'ongoing', or 'upcoming'.",
    });
  }

  // Step 1: Get tours assigned to this guide
  const tours = await Tour.find({ guides: guideId }).select(
    "_id title startDate endDate",
  );

  if (!tours.length) {
    return res.status(200).json({ isSuccess: true, results: 0, data: [] });
  }

  const today = new Date();

  // Step 2: Filter tours by trip status
  const matchingTours = tours.filter((tour) => {
    const start = new Date(tour.startDate);
    const end = new Date(tour.endDate);

    if (status === "completed") return today > end;
    if (status === "ongoing") return today >= start && today <= end;
    if (status === "upcoming") return today < start;
  });

  const matchingTourIds = matchingTours.map((tour) => tour._id);

  if (!matchingTourIds.length) {
    return res.status(200).json({ isSuccess: true, results: 0, data: [] });
  }

  // Step 3: Build booking query
  const query = {
    tour: { $in: matchingTourIds },
    status: "confirmed",
  };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Step 4: Get all bookings matching query
  let bookingsQuery = Booking.find(query)
    .populate({
      path: "tour",
      select: "title startDate endDate",
    })
    .populate({
      path: "user",
      select: "firstName lastName email",
    });

  // Step 5: Apply sorting
  const sortOrder = sort === "asc" ? 1 : -1;
  bookingsQuery = bookingsQuery.sort({ createdAt: sortOrder });

  // Step 6: Execute query
  const allBookings = await bookingsQuery;

  // Step 7: Apply in-memory search filtering
  let filtered = allBookings;
  if (search) {
    const lowerSearch = search.toLowerCase();
    filtered = allBookings.filter((b) => {
      const userMatch =
        b.user?.firstName?.toLowerCase().includes(lowerSearch) ||
        b.user?.lastName?.toLowerCase().includes(lowerSearch);
      const tourMatch = b.tour?.title?.toLowerCase().includes(lowerSearch);
      return userMatch || tourMatch;
    });
  }

  // Step 8: Pagination
  const pageInt = parseInt(page, 10);
  const limitInt = parseInt(limit, 10);
  const startIndex = (pageInt - 1) * limitInt;
  const paginated = filtered.slice(startIndex, startIndex + limitInt);

  const formatted = paginated.map((b) => ({
    _id: b._id,
    tourTitle: b.tour?.title || "N/A",
    customerName: `${b.user?.firstName || ""} ${b.user?.lastName || ""}`.trim(),
    customerEmail: b.user?.email || "N/A",
    bookingDate: b.createdAt,
    status,
  }));

  res.status(200).json({
    isSuccess: true,
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / limitInt),
    page: pageInt,
    limit: limitInt,
    results: formatted.length,
    data: { bookings: formatted },
  });
});

exports.getBookingById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id)
    .populate({
      path: "user",
      select: "firstName lastName email phone",
    })
    .populate({
      path: "tour",
      select: "title startDate endDate guides",
      populate: {
        path: "guides",
        select: "firstName lastName email phone",
      },
    })
    .lean();

  if (!booking) {
    return res.status(404).json({
      data: { booking: {} },
    });
  }

  // Prepare guide names list
  const guideNames = (booking.tour?.guides || []).map((guide) =>
    `${guide.firstName} ${guide.lastName || ""}`.trim(),
  );

  // Shape the final response
  const response = {
    id: booking._id,
    customer: `${booking.user?.firstName} ${
      booking.user?.lastName || ""
    }`.trim(),
    email: booking.user?.email,
    contact: booking.user?.phone,
    tourTitle: booking.tour?.title || booking.tourTitle,
    startDate: booking.tour?.startDate,
    endDate: booking.tour?.endDate,
    pricePerPerson: booking.pricePerPerson,
    numberOfParticipants: booking.numberOfParticipants,
    amountPaid: booking.amountPaid,
    paymentId: booking.paymentId,
    status: booking.status,
    guides: guideNames,
    members: booking.members,
    createdAt: booking.createdAt,
    currency: booking.currency,
  };

  return res.status(200).json({
    isSuccess: true,
    data: { booking: response },
  });
});

exports.getTourBookings = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortOrder: sort = "desc",
    search = "",
    status,
    startDate,
    endDate,
  } = req.query;
  const { slug } = req.params;

  // 1. Find the tour
  const tour = await Tour.findOne({ slug });
  if (!tour) {
    return res.status(404).json({
      data: null,
      message: "Tour not found",
    });
  }

  // 2. Build query
  let query = { tour: tour._id };

  if (status && ["confirmed", "cancelled"].includes(status)) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    const users = await User.find({
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    query.user = { $in: users.map((u) => u._id) };
  }

  const sortOrder = sort === "asc" ? 1 : -1;
  const skip = (Number(page) - 1) * Number(limit);

  const totalCount = await Booking.countDocuments(query);

  const bookings = await Booking.find(query)
    .populate("user", "firstName lastName email")
    .sort({ createdAt: sortOrder })
    .skip(skip)
    .limit(Number(limit));

  // 3. Format minimal response
  const formattedBookings = bookings.map((booking) => ({
    bookingId: booking._id,
    tourTitle: booking.tourTitle,
    customerName:
      `${booking.user?.firstName} ${booking.user?.lastName}`.trim() || "N/A",
    customerEmail: booking.user?.email || "N/A",
    dateOfBooking: booking.createdAt,
    status: booking.status,
  }));

  // 4. Final response
  res.status(200).json({
    isSuccess: true,
    data: {
      total: totalCount,
      results: bookings.length,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page),
      bookings: formattedBookings,
    },
  });
});
