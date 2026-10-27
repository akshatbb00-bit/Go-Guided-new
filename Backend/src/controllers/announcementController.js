const Announcement = require("../models/announcementModel");

const catchAsync = require("../utils/catchAsync");

exports.createAnnouncement = catchAsync(async (req, res) => {
  const { title, message, visibleTo, postedBy } = req.body;

  const announcement = new Announcement({
    title,
    message,
    visibleTo,
    postedBy,
    date: new Date(),
  });

  await announcement.save();

  return res.status(201).json({
    isSuccess: true,
    message: "Announcement created successfully.",
    data: { announcement },
  });
});

exports.getAnnouncements = catchAsync(async (req, res) => {
  const userRole = req.user?.role?.toLowerCase(); // from auth middleware

  if (!userRole) {
    return res.status(400).json({
      isSuccess: false,
      message: "User role is required to fetch announcements",
    });
  }

  let query = {};

  // Only filter if not owner
  if (userRole !== "owner") {
    const allowedVisibleTo = ["Everyone", "Users"]; // Default for all

    if (userRole === "admin") {
      allowedVisibleTo.push("Guides");
    } else if (userRole === "guide") {
      // Guides can only see Everyone and Users
    } else if (userRole === "user") {
      // Users only see Everyone and Users
    }

    query.visibleTo = { $in: allowedVisibleTo };
  }

  const announcements = await Announcement.find(query)
    .sort({ date: -1 })
    .limit(100);

  return res.status(200).json({ isSuccess: true, data: { announcements } });
});
