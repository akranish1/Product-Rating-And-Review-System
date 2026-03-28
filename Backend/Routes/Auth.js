const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  login,
  logout,
  me,
  resendOtp,
  signup,
  verifyOtp,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.post("/logout", logout);

module.exports = router;
