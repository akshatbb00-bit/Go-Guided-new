const multer = require("multer");
const AppError = require("../utils/appError");

const storage = multer.memoryStorage();

/**
 * Middleware to parse multipart form files and attach to req.files.
 *
 * @param {Array<string>} fieldNames - Names of file fields
 * @returns {Function} Express middleware
 */
function fileParser(fieldNames) {
  const upload = multer({ storage }).fields(
    fieldNames.map((name) => ({ name }))
  );

  return function (req, res, next) {
    upload(req, res, function (err) {
      if (err) {
        return next(new AppError("Failed to process uploaded files.", 500));
      }

      next();
    });
  };
}

module.exports = fileParser;
