const express = require("express");
const { 
  login, 
  registration, 
  setupTwoFactor, 
  verifyAndEnableTwoFactor, 
  loginWithOTP, 
  disableTwoFactor 
} = require("../controllers/auth");
const router = express.Router();

router.post("/login", login);
router.post("/registration", registration);
router.post("/setup-2fa", setupTwoFactor);
router.post("/verify-2fa", verifyAndEnableTwoFactor);
router.post("/login-2fa", loginWithOTP);
router.post("/disable-2fa", disableTwoFactor);

module.exports = router;
