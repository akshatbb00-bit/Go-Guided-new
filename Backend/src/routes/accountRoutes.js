const express = require("express");
const accountController = require("../controllers/accountController");
const accountValidator = require("../validators/accountValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const fileParser = require("../middlewares/fileParser");
const validateFileLimits = require("../validators/validateFileLimits");

const router = express.Router();

router.patch(
  "/update-name",
  authMiddleware.protect,
  accountValidator.updateNameValidator,
  accountController.updateName
);

router.patch(
  "/update-profile-pic",
  authMiddleware.protect,
  fileParser(["profilePic"]),
  validateFileLimits({
    profilePic: {
      minCount: 1,
      maxCount: 1,
      maxSize: 5,
      allowedTypes: ["image/*"],
      onExceedCount: "ignore",
      onExceedSize: "error",
      onInvalidType: "error",
    },
  }),
  accountController.updateProfilePicture
);

module.exports = router;
