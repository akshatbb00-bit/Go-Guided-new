const Feedback = require("../models/feedbackModel");
const catchAsync = require("../utils/catchAsync");
const { sendFeedbackResolvedEmail } = require("../utils/email");

//helper functions
const splitName = (fullName) => {
  if (!fullName) return { firstName: "", lastName: "" };
  const parts = fullName.trim().split(" ");
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ") || "",
  };
};

//controlller functions

exports.createFeedback = catchAsync(async (req, res) => {
  const { name, email, subject, message } = req.body;

  await Feedback.create({
    name: name,
    email,
    subject,
    message,
  });

  res.status(201).json({
    status: "success",
    message:
      "Thank you for your feedback. Please wait for a response on the email you provided.",
  });
});

exports.replyToFeedback = catchAsync(async (req, res, next) => {
  const { feedbackId } = req.params;
  const { message } = req.body;

  const feedback = await Feedback.findById(feedbackId);

  if (!feedback) {
    return next(new AppError("Feedback not found", 404));
  }

  if (feedback.isResolved) {
    return res.status(400).json({
      status: "fail",
      message: "This feedback has already been marked as resolved.",
    });
  }

  //sending email
  const { firstName, lastName } = splitName(feedback.name || "User");

  await sendFeedbackResolvedEmail({
    user: { firstName, lastName, email: feedback.email },
    message,
  });

  feedback.isResolved = true;
  await feedback.save();

  res.status(200).json({
    status: "success",
    message: "Reply sent and feedback marked as resolved",
  });
});

exports.getAllFeedbacks = catchAsync(async (req, res) => {
  let { page, limit, status, startDate, endDate, search } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (status === "resolved") filter.isResolved = true;
  if (status === "unresolved") filter.isResolved = false;

  if (startDate && endDate) {
    const start = new Date(startDate).setUTCHours(0, 0, 0, 0);
    const end = new Date(endDate).setUTCHours(23, 59, 59, 999);

    filter.createdAt = {
      $gte: start,
      $lte: end,
    };
  }

  if (search) {
    const searchRegex = new RegExp(search, "i"); // case-insensitive regex

    filter.$or = [
      { name: { $regex: searchRegex } },
      { email: { $regex: searchRegex } },
      { subject: { $regex: searchRegex } },
      { message: { $regex: searchRegex } },
    ];
  }

  const sortOrder = req.query.sort === "desc" ? -1 : 1;

  const [feedbacks, total] = await Promise.all([
    Feedback.find(filter)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit)
      .select("name email subject message createdAt isResolved"),
    Feedback.countDocuments(filter),
  ]);

  res.status(200).json({
    status: "success",
    page,
    results: feedbacks.length,
    total,
    totalPages: Math.ceil(total / limit),
    data: {
      feedbacks,
    },
  });
});
