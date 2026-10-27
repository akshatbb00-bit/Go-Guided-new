// =======================
// Core Modules & Packages
// =======================
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// =======================
// Custom Utilities & Error Handling
// =======================
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

// =======================
// Routes
// =======================
const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const tourRoutes = require("./routes/tourRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const guideRoutes = require("./routes/guideRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminCreationRoutes = require("./routes/adminCreationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const manageUsersRoutes = require("./routes/manageUsersRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const geocodeRoutes = require("./routes/geocodeRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const chatBotRoutes = require("./routes/chatbotRoutes");

const app = express();

// =======================
// Global Middleware
// =======================

// Trust reverse proxy (e.g., for secure cookies behind Nginx, Heroku)
app.set("trust proxy", 1);

// Set security-related HTTP headers
app.use(helmet());

// Rate limiter (apply to all /api/* routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 100 requests
  message: "Oops! Too many requests. Let’s slow down and try again shortly",
});
app.use("/api", limiter);

// Enable CORS for frontend origin
const allowedOrigins = [process.env.FRONTEND_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Parse cookies from incoming requests
app.use(cookieParser());

// Parse incoming JSON payloads
app.use(express.json());

// Log HTTP requests (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// =======================
// Health Check Route
// =======================
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    isSuccess: true,
    message: "Backend is live and working",
  });
});

// =======================
// Application Routes
// =======================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/account", accountRoutes);
app.use("/api/v1/tour", tourRoutes);
app.use("/api/v1/job", jobRoutes);
app.use("/api/v1/application", applicationRoutes);
app.use("/api/v1/guide", guideRoutes);
app.use("/api/v1/review", reviewRoutes);
app.use("/api/v1/booking", bookingRoutes);
app.use("/api/v1/admin", adminCreationRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/announcement", announcementRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/user", manageUsersRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.use("/api/v1/geocode", geocodeRoutes);

app.use("/api/v1/analytics", analyticsRoutes);

app.use("/api/v1/chat", chatBotRoutes);

// =======================
// Handle Unmatched Routes
// =======================
app.use((req, res, next) => {
  return next(new AppError("The requested resource was not found", 404));
});

// =======================
// Global Error Handler
// =======================
app.use(globalErrorHandler);

module.exports = app;
