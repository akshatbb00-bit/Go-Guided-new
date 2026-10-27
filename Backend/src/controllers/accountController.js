// Core

// Models
const User = require("../models/userModel");

// Utilities
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { uploadImageToCloudinary } = require("../utils/cloudinaryUploader");

// Configs

exports.updateName = catchAsync(async (req, res, next) => {
  const { firstName, lastName } = req.body;
  const { userId } = req.user;

  const user = await User.findById(userId);

  if (!user || user.isDeleted) {
    return next(
      new AppError("User account not found or has been deleted.", 404)
    );
  }

  const isFirstNameSame = user.firstName === firstName;
  const isLastNameSame = user.lastName === lastName;

  if (isFirstNameSame && isLastNameSame) {
    return next(new AppError("New name is the same as the current one.", 400));
  }

  user.firstName = firstName;
  user.lastName = lastName;

  await user.save();

  res.status(200).json({
    isSuccess: true,
    message: "Your name has been updated successfully.",
    data: {
      user: {
        name: `${user.firstName} ${user.lastName}`.trim(),
      },
    },
  });
});

exports.updateProfilePicture = catchAsync(async (req, res, next) => {
  const { userId } = req.user;

  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    return next(new AppError("User not found or has been deactivated.", 404));
  }

  // ✅ Validate uploaded image
  const file = req.files?.profilePic?.[0];

  if (!file || !file.buffer) {
    return next(new AppError("No valid image file was provided.", 400));
  }

  const uploadResult = await uploadImageToCloudinary({
    buffer: file.buffer,
    folder: `goguided/users/${userId}`,
    publicId: "avatar",
    resize: { width: 300, height: 300 },
    quality: 90,
  });

  user.profilePic = {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  };

  await user.save();

  res.status(200).json({
    isSuccess: true,
    message: "Profile picture updated successfully.",
    data: {
      user: {
        profilePicUrl: user.profilePic.url,
      },
    },
  });
});
