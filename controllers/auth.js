const authSchema = require("../model/authSchema");
const bcrypt = require("bcrypt");
const {
  isValidEmail,
  isValidPassword,
  generateOTPSecret,
  generateOTPQRCode,
  verifyOTP,
  generateOTPToken,
  generateJWT,
  generateRefreshToken,
  verifyJWT,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../helpers/utils");

// Registration with email verification
const registration = async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  try {
    // Validation
    if (!fullName?.trim())
      return res.status(400).send({ message: "Full name is required." });
    if (!email) return res.status(400).send({ message: "Email is required." });
    if (!isValidEmail(email))
      return res.status(400).send({ message: "Email is invalid." });
    if (!password)
      return res.status(400).send({ message: "Password is required." });
    if (password !== confirmPassword)
      return res
        .status(400)
        .send({ message: "Passwords do not match." });
    if (!isValidPassword(password))
      return res.status(400).send({
        message:
          "Password must be at least 8 characters with uppercase, number, and special character.",
      });

    // Check if user exists
    const existingUser = await authSchema.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res
        .status(409)
        .send({ message: "Email already registered." });

    // Create user
    const newUser = new authSchema({
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      password,
    });

    // Generate email verification token
    const verificationToken = generateRandomToken();
    newUser.emailVerificationToken = hashToken(verificationToken);
    newUser.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await newUser.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(
      email,
      verificationToken,
      fullName
    );

    if (emailSent) {
      res.status(201).send({
        message: "Registration successful. Please verify your email.",
        userId: newUser._id,
      });
    } else {
      res.status(201).send({
        message:
          "Registration successful, but email verification could not be sent.",
        userId: newUser._id,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Registration failed." });
  }
};

// Email verification
const verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    if (!token)
      return res.status(400).send({ message: "Verification token is required." });

    const hashedToken = hashToken(token);
    const user = await authSchema.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).send({
        message: "Invalid or expired verification token.",
      });

    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;
    await user.save();

    res.status(200).send({ message: "Email verified successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Email verification failed." });
  }
};

// Simple Registration without email verification
const simpleRegister = async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  try {
    // Validation
    if (!fullName?.trim())
      return res.status(400).send({ message: "Full name is required." });
    if (!email) return res.status(400).send({ message: "Email is required." });
    if (!isValidEmail(email))
      return res.status(400).send({ message: "Email is invalid." });
    if (!password)
      return res.status(400).send({ message: "Password is required." });
    if (password !== confirmPassword)
      return res
        .status(400)
        .send({ message: "Passwords do not match." });
    if (!isValidPassword(password))
      return res.status(400).send({
        message:
          "Password must be at least 8 characters with uppercase, number, and special character.",
      });

    // Check if user exists
    const existingUser = await authSchema.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res
        .status(409)
        .send({ message: "Email already registered." });


  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Registration failed." });
  }
};

// Login with JWT token generation
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email) return res.status(400).send({ message: "Email is required." });
    if (!password)
      return res.status(400).send({ message: "Password is required." });

    const user = await authSchema.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).send({ message: "Invalid email or password." });

    // Check if account is locked
    if (user.isAccountLocked()) {
      return res.status(403).send({
        message:
          "Account locked due to multiple failed attempts. Try again later.",
      });
    }

    // Verify password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      await user.incLoginAttempts();
      return res.status(401).send({ message: "Invalid email or password." });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).send({
        message: "Please verify your email before logging in.",
      });
    }

    // If 2FA is enabled, require OTP token
    if (user.isTwoFactorEnabled) {
      return res.status(200).send({
        message: "Password verified. Please provide OTP token.",
        requiresOTP: true,
        userId: user._id,
      });
    }

    // Generate tokens
    const accessToken = generateJWT(user._id.toString(), "1h");
    const refreshToken = generateRefreshToken(user._id.toString(), "7d");

    // Save refresh token to database
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.lastLogin = new Date();
    await user.resetLoginAttempts();

    res.status(200).send({
      message: "Login successful.",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Login failed." });
  }
};

// Refresh access token
const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken)
      return res.status(400).send({ message: "Refresh token is required." });

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded)
      return res.status(401).send({ message: "Invalid or expired refresh token." });

    const user = await authSchema.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res
        .status(401)
        .send({ message: "Invalid refresh token." });
    }

    // Generate new access token
    const newAccessToken = generateJWT(user._id.toString(), "1h");

    res.status(200).send({
      message: "Token refreshed successfully.",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Token refresh failed." });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.userId;

    if (!userId)
      return res.status(400).send({ message: "User ID is required." });

    // Clear refresh token from database
    await authSchema.findByIdAndUpdate(userId, {
      $set: { refreshToken: null, refreshTokenExpiry: null },
    });

    res.status(200).send({ message: "Logout successful." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Logout failed." });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) return res.status(400).send({ message: "Email is required." });

    const user = await authSchema.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(404).send({
        message: "If email exists, a password reset link will be sent.",
      }); // Security: Don't reveal if email exists

    // Generate password reset token
    const resetToken = generateRandomToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    const emailSent = await sendPasswordResetEmail(
      email,
      resetToken,
      user.fullName
    );

    res.status(200).send({
      message: emailSent
        ? "Password reset link sent to your email."
        : "Password reset initiated. Email could not be sent.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Password reset request failed." });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  try {
    if (!token)
      return res.status(400).send({ message: "Reset token is required." });
    if (!newPassword)
      return res.status(400).send({ message: "New password is required." });
    if (newPassword !== confirmPassword)
      return res.status(400).send({ message: "Passwords do not match." });
    if (!isValidPassword(newPassword))
      return res.status(400).send({
        message:
          "Password must be at least 8 characters with uppercase, number, and special character.",
      });

    const hashedToken = hashToken(token);
    const user = await authSchema.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .send({ message: "Invalid or expired reset token." });

    // Update password
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    await user.save();

    res.status(200).send({ message: "Password reset successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Password reset failed." });
  }
};

// Change password (for logged-in users)
const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user?.userId || req.body.userId;

  try {
    if (!userId)
      return res.status(400).send({ message: "User ID is required." });
    if (!oldPassword)
      return res.status(400).send({ message: "Current password is required." });
    if (!newPassword)
      return res.status(400).send({ message: "New password is required." });
    if (newPassword !== confirmPassword)
      return res.status(400).send({ message: "Passwords do not match." });
    if (!isValidPassword(newPassword))
      return res.status(400).send({
        message:
          "Password must be at least 8 characters with uppercase, number, and special character.",
      });

    const user = await authSchema.findById(userId);
    if (!user) return res.status(404).send({ message: "User not found." });

    // Verify old password
    const validPassword = await user.comparePassword(oldPassword);
    if (!validPassword)
      return res.status(401).send({ message: "Current password is incorrect." });

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).send({ message: "Password changed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Password change failed." });
  }
};

const setupTwoFactor = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) return res.status(400).send({ message: "Email is required." });

    const user = await authSchema.findOne({ email });
    if (!user) return res.status(404).send({ message: "User not found." });

    if (user.isTwoFactorEnabled) {
      return res
        .status(400)
        .send({ message: "Two-factor authentication is already enabled." });
    }

    // Generate OTP secret
    const secret = generateOTPSecret();

    // Generate QR code
    const qrCode = await generateOTPQRCode(secret);

    // Save secret temporarily (user needs to verify before enabling)
    user.otpSecret = secret.base32;
    await user.save();

    res.status(200).send({
      message: "Two-factor authentication setup initiated.",
      secret: secret.base32,
      qrCode: qrCode,
      otpauth_url: secret.otpauth_url,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "Failed to setup two-factor authentication." });
  }
};

const verifyAndEnableTwoFactor = async (req, res) => {
  const { email, token } = req.body;

  try {
    if (!email) return res.status(400).send({ message: "Email is required." });
    if (!token)
      return res.status(400).send({ message: "OTP token is required." });

    const user = await authSchema.findOne({ email });
    if (!user) return res.status(404).send({ message: "User not found." });

    if (user.isTwoFactorEnabled) {
      return res
        .status(400)
        .send({ message: "Two-factor authentication is already enabled." });
    }

    if (!user.otpSecret) {
      return res
        .status(400)
        .send({ message: "Please setup two-factor authentication first." });
    }

    // Verify the token
    const isValid = verifyOTP(user.otpSecret, token);
    if (!isValid) {
      return res.status(400).send({ message: "Invalid OTP token." });
    }

    // Enable 2FA
    user.isTwoFactorEnabled = true;
    await user.save();

    res
      .status(200)
      .send({ message: "Two-factor authentication enabled successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "Failed to enable two-factor authentication." });
  }
};

const loginWithOTP = async (req, res) => {
  const { userId, token } = req.body;

  try {
    if (!userId)
      return res.status(400).send({ message: "User ID is required." });
    if (!token)
      return res.status(400).send({ message: "OTP token is required." });

    const user = await authSchema.findById(userId);
    if (!user) return res.status(404).send({ message: "User not found." });

    if (!user.isTwoFactorEnabled || !user.otpSecret) {
      return res.status(400).send({
        message: "Two-factor authentication is not enabled for this user.",
      });
    }

    // Verify the token
    const isValid = verifyOTP(user.otpSecret, token);
    if (!isValid) {
      return res.status(400).send({ message: "Invalid OTP token." });
    }

    // Generate JWT tokens
    const accessToken = generateJWT(user._id.toString(), "1h");
    const refreshToken = generateRefreshToken(user._id.toString(), "7d");

    // Save refresh token to database
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.lastLogin = new Date();
    await user.save();

    res.status(200).send({
      message: "Login successful with two-factor authentication.",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "OTP verification failed." });
  }
};

const disableTwoFactor = async (req, res) => {
  const { email, token } = req.body;

  try {
    if (!email) return res.status(400).send({ message: "Email is required." });
    if (!token)
      return res.status(400).send({ message: "OTP token is required." });

    const user = await authSchema.findOne({ email });
    if (!user) return res.status(404).send({ message: "User not found." });

    if (!user.isTwoFactorEnabled) {
      return res
        .status(400)
        .send({ message: "Two-factor authentication is not enabled." });
    }

    // Verify the token before disabling
    const isValid = verifyOTP(user.otpSecret, token);
    if (!isValid) {
      return res.status(400).send({ message: "Invalid OTP token." });
    }

    // Disable 2FA
    user.isTwoFactorEnabled = false;
    user.otpSecret = null;
    await user.save();

    res
      .status(200)
      .send({ message: "Two-factor authentication disabled successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "Failed to disable two-factor authentication." });
  }
};

module.exports = {
  registration,
  simpleRegister,
  verifyEmail,
  login,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  setupTwoFactor,
  verifyAndEnableTwoFactor,
  loginWithOTP,
  disableTwoFactor,
};
