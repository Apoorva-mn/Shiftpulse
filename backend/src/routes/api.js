
const express = require("express");

const controller = require("../Controllers/authController");
const authenticateToken = require("../middleware/authmiddleware");

const router = express.Router();


// Login
router.post(
  "/auth/login",
  controller.login
);


// Clock In
router.post(
  "/shifts/:employee_id/clock-in",
  authenticateToken,
  controller.clockIn
);


// Clock Out
router.post(
  "/shifts/:employee_id/clock-out",
  authenticateToken,
  controller.clockOut
);


// Active Dashboard
router.get(
  "/dashboard/active",
  authenticateToken,
  controller.getActiveShifts
);

router.post( "/shifts/:shiftId/ping", authenticateToken, controller.ping );


module.exports = router;

