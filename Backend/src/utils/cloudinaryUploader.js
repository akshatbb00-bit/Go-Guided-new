const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const AppError = require("./appError");
const logger = require("./logger");

/**
 * Uploads an image directly to Cloudinary (no local processing or compression).
 *
 * @param {Object} params
 * @param {Buffer} params.buffer - Raw image buffer
 * @param {String} params.folder - Cloudinary folder path
 * @param {String} [params.publicId] - Optional specific public ID
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadImageToCloudinary = ({ buffer, folder, publicId = undefined }) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: "image",
          overwrite: true,
          disable_promises: true,
        },
        (err, result) => {
          if (err) {
            logger.error("⛔ Cloudinary upload error:", err);
            return reject(
              new AppError(
                "There was a problem uploading the image. Please try again.",
                502
              )
            );
          }
          resolve(result);
        }
      );

      // Directly stream the image buffer to Cloudinary
      streamifier.createReadStream(buffer).pipe(uploadStream);
    } catch (err) {
      logger.error("⛔ Image upload error:", err);
      reject(
        new AppError("Could not upload the image. Please try again later.", 500)
      );
    }
  });
};

/**
 * Uploads a raw file (e.g., PDF, DOCX) to Cloudinary without image processing.
 *
 * @param {Object} params - Configuration object.
 * @param {Buffer} params.buffer - The raw file buffer to upload.
 * @param {string} params.folder - Cloudinary folder path (e.g., "applications/resumes").
 * @param {string} [params.publicId] - Optional specific public ID.
 * @param {string} [params.resourceType="raw"] - Cloudinary resource type. Default is "raw" for files.
 * @param {string} [params.fileFormat] - Optional file format (e.g., "pdf", "docx").
 * @returns {Promise<Object>} - Cloudinary upload result.
 *
 * @throws {AppError} - If the upload fails.
 */
const uploadFileToCloudinary = ({
  buffer,
  folder,
  publicId = undefined,
  resourceType = "raw",
  fileFormat = undefined,
}) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: resourceType,
          format: fileFormat,
          overwrite: true,
          disable_promises: true,
        },
        (err, result) => {
          if (err) {
            logger.error("❌ Cloudinary file upload error:", err);
            return reject(
              new AppError("File upload failed. Please try again later.", 502)
            );
          }
          resolve(result);
        }
      );

      // Directly stream the raw buffer
      streamifier.createReadStream(buffer).pipe(uploadStream);
    } catch (err) {
      logger.error("❌ File streaming error:", err);
      reject(
        new AppError("Could not process the file. Please try again.", 500)
      );
    }
  });
};

/**
 * Delete an image from Cloudinary using its public_id.
 * @param {string} publicId - The Cloudinary public ID of the image to delete.
 * @returns {Promise<void>}
 */
const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true, // Optional: clears CDN cache
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Failed to delete image`);
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadImageToCloudinary,
  uploadFileToCloudinary,
  deleteImageFromCloudinary,
};
