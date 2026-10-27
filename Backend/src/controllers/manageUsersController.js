const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const { sendCustomEmailService } = require("../utils/email");
const Tour = require("../models/tourModel");

exports.getUsers = catchAsync(async (req, res, next) => {
  const { search, role, sort, startDate, endDate } = req.query;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const baseFilter = { isDeleted: false };
  const filterConditions = [baseFilter];

  if (role) {
    filterConditions.push({ role });
  }

  if (search) {
    filterConditions.push({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    });
  }

  if (startDate && endDate) {
    const start = new Date(startDate).setUTCHours(0, 0, 0, 0);
    const end = new Date(endDate).setUTCHours(23, 59, 59, 999);

    filterConditions.push({
      createdAt: {
        $gte: start,
        $lte: end,
      },
    });
  }

  const finalFilter =
    filterConditions.length > 1 ? { $and: filterConditions } : baseFilter;

  const sortOrder = { createdAt: sort === "desc" ? -1 : 1 };

  const [users, total] = await Promise.all([
    User.find(finalFilter)
      .sort(sortOrder)
      .skip(skip)
      .limit(limit)
      .select(
        "firstName lastName email phone createdAt updatedAt role priority availabilityStatus "
      ),
    User.countDocuments(finalFilter),
  ]);

  res.status(200).json({
    status: "success",
    results: users.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: { users },
  });
});

exports.sendCustomEmail = catchAsync(async (req, res, next) => {
  const { subject, message, email, name } = req.body;

  // Check if the user exists
  const userExists = await User.findOne({ email });
  if (!userExists) {
    return next(
      new AppError("No user found with the provided email address", 404)
    );
  }

  // Sending custom email
  await sendCustomEmailService({
    user: { firstName: name || "User", email },
    subject,
    message,
  });

  res.status(200).json({
    status: "success",
    message: "Custom email sent successfully",
  });
});

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("bookings");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let tours = [];

    if (user.role === "guide") {
      tours = await Tour.find({ guides: user._id })
        .select("title startDate endDate guides")
        .populate("guides", "firstName lastName email");
      user._doc.tours = tours;
    }
    res.status(200).json({ data: { user } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
