const dotenv = require("dotenv");
const mongoose = require("mongoose");
const logger = require("./utils/logger");

// Handle uncaught exceptions
// process.on("uncaughtException", (err) => {
//   logger.error(`💥 UNCAUGHT EXCEPTION: ${err.name} | ${err.message}`);
//   process.exit(1);
// });

// Load env
const env = process.env.NODE_ENV || "development";
const envFile = `.env.${env}`;

logger.info(`🌱 Loading environment from: ${envFile}`);

dotenv.config({ path: envFile });

const app = require("./app");

// Config
const PORT = process.env.PORT || 5000;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
const DB_URI = process.env.DB_URI;

let server;

// Connect to MongoDB
const connectDB = async (retries = 5) => {
  while (retries) {
    try {
      await mongoose.connect(DB_URI, { dbName: process.env.DB_NAME });
      logger.info("✅ MongoDB connected successfully");
      startServer();
      return;
    } catch (err) {
      logger.warn(
        `🔁 Retry MongoDB connection (${5 - retries + 1}/5): ${err.message}`
      );
      retries--;
      await new Promise((res) => setTimeout(res, 5000)); // wait 5 sec before retry
    }
  }

  logger.error("❌ All MongoDB connection attempts failed.");
  process.exit(1);
};

const startServer = () => {
  server = app.listen(PORT, () => {
    logger.info(`🚀 Server running at ${SERVER_URL} [${env}]`);

    if (process.env.NODE_ENV === "production") {
      console.log(`✔️  Server started on port ${PORT} [production]`);
    }
  });
};

// Graceful shutdowns
process.on("unhandledRejection", (err) => {
  logger.error(`💥 UNHANDLED REJECTION: ${err.name} | ${err.message}`);
  shutdown(1);
});

process.on("SIGTERM", () => {
  logger.info("📦 SIGTERM received. Shutting down gracefully...");
  shutdown(0);
});

const shutdown = async (exitCode) => {
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }

    await mongoose.connection.close();
    logger.info("📴 MongoDB connection closed");

    process.exit(exitCode);
  } catch (err) {
    logger.error(`❌ Error during shutdown: ${err.message}`);
    process.exit(1);
  }
};

// Init everything
connectDB();
