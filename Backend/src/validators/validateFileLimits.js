const AppError = require("../utils/appError");

/**
 * Middleware to validate uploaded file limits and types per field.
 *
 * @param {Record<string, {
 *   minCount?: number,
 *   maxCount?: number,
 *   maxSize?: number, // in megabytes
 *   allowedTypes?: string[],
 *   onExceedCount?: "error" | "ignore",
 *   onExceedSize?: "error" | "ignore",
 *   onInvalidType?: "error" | "ignore"
 * }>} limitsConfig
 * @returns {Function} Express middleware
 */
function validateFileLimits(limitsConfig) {
  return function (req, res, next) {
    const files = req.files || {};

    for (const field in limitsConfig) {
      const {
        minCount,
        maxCount,
        maxSize,
        allowedTypes,
        onExceedCount = "error",
        onExceedSize = "error",
        onInvalidType = "error",
      } = limitsConfig[field];

      let uploaded = files[field] || [];

      // ✅ minCount check
      if (minCount !== undefined && uploaded.length < minCount) {
        const message =
          minCount === 1
            ? `${field} file is missing.`
            : `At least ${minCount} files required for '${field}'.`;

        return next(new AppError(message, 400));
      }

      // ✅ maxCount check
      if (maxCount !== undefined && uploaded.length > maxCount) {
        if (onExceedCount === "error") {
          return next(
            new AppError(
              `Too many files uploaded for '${field}'. Max allowed is ${maxCount}.`,
              400
            )
          );
        } else if (onExceedCount === "ignore") {
          uploaded = uploaded.slice(0, maxCount);
          files[field] = uploaded;
        }
      }

      // ✅ maxSize check (per file)
      if (maxSize !== undefined) {
        const maxBytes = maxSize * 1024 * 1024;
        const oversized = uploaded.filter((file) => file.size > maxBytes);

        if (oversized.length > 0) {
          if (onExceedSize === "error") {
            return next(
              new AppError(
                `File too large in '${field}'. Max allowed size is ${maxSize}MB.`,
                400
              )
            );
          } else if (onExceedSize === "ignore") {
            uploaded = uploaded.filter((file) => file.size <= maxBytes);
            files[field] = uploaded;
          }
        }
      }

      // ✅ allowedTypes check
      if (allowedTypes && allowedTypes.length > 0) {
        const isAllowed = (type) =>
          allowedTypes.some((allowed) =>
            allowed.endsWith("/*")
              ? type.startsWith(allowed.split("/")[0] + "/")
              : type === allowed
          );

        const invalidFiles = uploaded.filter(
          (file) => !isAllowed(file.mimetype)
        );

        if (invalidFiles.length > 0) {
          if (onInvalidType === "error") {
            return next(
              new AppError(
                `Invalid file type in '${field}'. Only ${allowedTypes.join(
                  ", "
                )} allowed.`,
                400
              )
            );
          } else if (onInvalidType === "ignore") {
            uploaded = uploaded.filter((file) => isAllowed(file.mimetype));
            files[field] = uploaded;
          }
        }
      }
    }

    next();
  };
}

module.exports = validateFileLimits;
