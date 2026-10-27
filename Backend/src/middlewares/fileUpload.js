const multer = require("multer");

// In-memory storage configuration
const storage = multer.memoryStorage();

// You can customize limits, file filters, etc. here
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit to 10 MB
  },
});

module.exports = upload;
