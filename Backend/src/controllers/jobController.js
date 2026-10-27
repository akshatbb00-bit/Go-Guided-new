const Job = require("../models/jobModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.createJob = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    location,
    lastDateToApply,
    numberOfPosts,
    salary,
  } = req.body;

  // Check if a similar job already exists
  const existingJob = await Job.findOne({
    title,
    location,
    lastDateToApply,
  });

  if (existingJob) {
    return next(new AppError("A similar job already exists.", 409));
  }

  // If not duplicate, create new job
  await Job.create({
    title,
    description,
    location,
    salary,
    lastDateToApply,
    numberOfPosts,
    createdAt: new Date(),
  });

  return res.status(201).json({
    isSuccess: true,
    message: "Job created successfully.",
  });
});

exports.getAllJobs = catchAsync(async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });

  return res.status(200).json({
    isSuccess: true,
    data: jobs,
  });
});

exports.deleteJob = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await Job.findByIdAndDelete(jobId);

  if (!job) {
    return next(new AppError("Job not found.", 404));
  }

  return res.status(200).json({
    isSuccess: true,
    message: "Job deleted successfully.",
    jobId,
  });
});
