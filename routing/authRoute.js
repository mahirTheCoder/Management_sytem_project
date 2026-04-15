const express = require("express");
const {
  login,
  registration,
  simpleRegister,
  verifyEmail,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  setupTwoFactor,
  verifyAndEnableTwoFactor,
  loginWithOTP,
  disableTwoFactor,
} = require("../controllers/auth");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/registration", registration);
router.post("/simple-register", simpleRegister);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// 2FA routes
router.post("/setup-2fa", setupTwoFactor);
router.post("/verify-2fa", verifyAndEnableTwoFactor);
router.post("/login-2fa", loginWithOTP);
router.post("/disable-2fa", disableTwoFactor);

// Protected routes
router.post("/logout", verifyToken, logout);
router.post("/change-password", verifyToken, changePassword);

module.exports = router;
