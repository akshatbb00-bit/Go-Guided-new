const catchAsync = require("../utils/catchAsync");
const Job = require("../models/jobModel");
const User = require("../models/userModel");
const Application = require("../models/jobApplicationModel");
const { uploadFileToCloudinary } = require("../utils/cloudinaryUploader");
const AppError = require("../utils/appError");
const crypto = require("crypto");
const { sendGuideWelcomeEmail } = require("../utils/email");

exports.applyToJob = catchAsync(async (req, res, next) => {
  const { id: jobId } = req.params;
  const { userId } = req.user;
  const { fullName, email, phone, linkedIn, experience } = req.body;
  const resume = req.files?.resume?.[0];

  // 1. Fetch job and check if it exists
  const job = await Job.findById(jobId);
  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  // 2. Check if application deadline has passed
  if (job.lastDate && new Date() > new Date(job.lastDate)) {
    return next(new AppError("The application deadline has passed.", 400));
  }

  // 3. Check if user already applied
  const existing = await Application.findOne({ jobId, applicant: userId });
  if (existing) {
    return next(new AppError("You have already applied to this job.", 409));
  }

  // 4. Prepare filename
  const sanitizeForFilename = (name) =>
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, "_");

  const displayName = `resume-${sanitizeForFilename(fullName)}`;

  // 5. Upload to Cloudinary
  const result = await uploadFileToCloudinary({
    buffer: resume.buffer,
    folder: `goguided/applications/resumes/${jobId}/${userId}`,
    publicId: displayName,
    resourceType: "raw",
    fileFormat: "pdf",
  });

  // 6. Store application
  const app = await Application.create({
    jobId,
    applicant: userId,
    fullName,
    email,
    phone,
    linkedInURL: linkedIn,
    experience,
    resumeUrl: result.secure_url,
    appliedAt: new Date(),
  });

  res.status(201).json({
    isSuccess: true,
    message: "Application submitted successfully",
    data: app,
  });
});

exports.getAllApplications = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const sortOrder = req.query?.sort === "asc" ? 1 : -1;

  const [applications, total] = await Promise.all([
    Application.find()
      .sort({ createdAt: -1 }) // optional: latest first
      .skip(skip)
      .limit(limit)
      .sort({ appliedAt: sortOrder }),
    Application.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    isSuccess: true,
    data: {
      applications,
      currentPage: page,
      totalPages,
      totalResults: total,
      pageSize: limit,
    },
  });
});

exports.getApplicationById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const application = await Application.findById(id).populate({
    path: "jobId",
    select: "title -_id",
  });

  if (!application) {
    return next(new AppError("No application found with that ID", 404));
  }

  res.status(200).json({
    isSuccess: true,
    data: {
      application,
    },
  });
});

exports.acceptApplication = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const application = await Application.findById(id);
  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  if (application.status === "accepted") {
    return next(new AppError("Application is already accepted", 400));
  }

  if (application.status === "rejected") {
    return next(new AppError("Cannot accept a rejected application", 400));
  }

  // Update application status
  application.status = "accepted";
  await application.save();

  let user = await User.findOne({ email: application.email });

  if (user) {
    // Existing user: assign guide role if not already
    user.role = "guide";
    await user.save();

    // Send  email
    await sendGuideWelcomeEmail({
      user: {
        email: user.email,
        firstName: user.firstName,
      },
    });
  } else {
    // Generate temporary password
    const tempPassword = crypto.randomBytes(6).toString("hex");

    const [firstName = "", lastName = ""] = application.fullName.split(" ");

    user = await User.create({
      firstName,
      lastName,
      email: application.email,
      phone: application.phone,
      password: tempPassword, // make sure password hashing is in model
      role: "guide",
    });

    // Send password via email
    await sendGuideWelcomeEmail({
      user: {
        email: user.email,
        firstName: user.firstName,
      },
      tempPassword,
    });
  }

  res.status(200).json({
    isSuccess: true,
    message: "Application accepted and user onboarded successfully.",
  });
});

exports.rejectApplication = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const application = await Application.findById(id);
  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  if (application.status === "rejected") {
    return next(new AppError("Application is already rejected", 400));
  }

  if (application.status === "accepted") {
    return next(new AppError("Cannot reject an accepted application", 400));
  }

  application.status = "rejected";
  await application.save();

  res.status(200).json({
    isSuccess: true,
    message: "Application rejected successfully",
    data: { application },
  });
});
