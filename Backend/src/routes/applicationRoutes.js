const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const fileParser = require("../middlewares/fileParser");
const validateFileLimits = require("../validators/validateFileLimits");
const applicationValidator = require("../validators/applicationValidator");
const applicationController = require("../controllers/applicationController");

router.post(
  "/apply/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("user"),
  fileParser(["resume"]),
  validateFileLimits({
    resume: {
      minCount: 1,
      maxCount: 1,
      maxSize: 5,
      allowedTypes: ["application/pdf"],
      onExceedCount: "ignore",
      onExceedSize: "error",
      onInvalidType: "error",
    },
  }),
  applicationValidator.validateApplication,
  applicationController.applyToJob
);

router.get(
  "/all",
  authMiddleware.protect,
  authMiddleware.restrictTo("owner"),
  applicationController.getAllApplications
);

router.get(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("owner"),
  applicationController.getApplicationById
);

router.patch(
  "/:id/accept",
  authMiddleware.protect,
  authMiddleware.restrictTo("owner"),
  applicationController.acceptApplication
);

router.patch(
  "/:id/reject",
  authMiddleware.protect,
  authMiddleware.restrictTo("owner"),
  applicationController.rejectApplication
);

module.exports = router;
