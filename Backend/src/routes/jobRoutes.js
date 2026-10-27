const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const jobValidator = require("../validators/jobValidator");
const jobController = require("../controllers/jobController");

router.post(
  "/post-job",
  authMiddleware.protect,
  authMiddleware.restrictTo("owner"),
  jobValidator.createJobValidator,
  jobController.createJob
);

router.get("/get-jobs", jobController.getAllJobs);

router.delete(
  "/delete-job/:jobId",
  authMiddleware.protect,
  authMiddleware.restrictTo("owner"),
  jobController.deleteJob
);

module.exports = router;
