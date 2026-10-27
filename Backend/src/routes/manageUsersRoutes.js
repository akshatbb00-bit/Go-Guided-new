const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const manageUsersController = require("../controllers/manageUsersController");
const manageUsersValidator = require("../validators/manageUsersValidator");

const router = express.Router();

router.get(
  "/users",
  authMiddleware.protect,
  authMiddleware.restrictTo("owner"),
  manageUsersController.getUsers
);
router.get(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("owner"),
  manageUsersController.getUserById
);

//send custom email to user
router.post(
  "/send-custom-email",
  authMiddleware.protect,
  authMiddleware.restrictTo("admin", "owner"),
  manageUsersValidator.validateSendCustomEmail,
  manageUsersController.sendCustomEmail
);
module.exports = router;
