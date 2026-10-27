// Core
const axios = require("axios");

// Utilities
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.reverseGeocode = catchAsync(async (req, res, next) => {
  const { lat, lon } = req.query;

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (
    !lat ||
    !lon ||
    isNaN(latNum) ||
    isNaN(lonNum) ||
    latNum < -90 ||
    latNum > 90 ||
    lonNum < -180 ||
    lonNum > 180
  ) {
    return next(new AppError("Invalid latitude or longitude.", 400));
  }

  const { data } = await axios.get(
    "https://nominatim.openstreetmap.org/reverse",
    {
      params: {
        lat: latNum,
        lon: lonNum,
        format: "json",
      },
      headers: {
        "User-Agent": "GoGuided/1.0",
      },
    }
  );

  if (!data || !data.address) {
    return next(new AppError("Could not resolve location.", 500));
  }

  const address = data.address;

  const primaryName =
    address.neighbourhood ||
    address.residential ||
    address.locality ||
    address.quarter ||
    address.suburb ||
    address.hamlet ||
    address.village ||
    address.town ||
    address.city ||
    address.municipality ||
    address.county ||
    "Unknown Location";

  const secondaryName =
    address.state ||
    address.state_district ||
    address.region ||
    address.country ||
    "";

  const locationName = secondaryName
    ? `${primaryName}, ${secondaryName}`
    : primaryName;

  res.status(200).json({
    isSuccess: true,
    message: "Location fetched successfully.",
    data: { locationName },
  });
});
