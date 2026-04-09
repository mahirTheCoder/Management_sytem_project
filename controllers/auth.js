const authSchema = require("../model/authSchema");
const {
  isValidEmail,
  generateOTPSecret,
  generateOTPQRCode,
  verifyOTP,
  generateOTPToken,
} = require("../helpers/utils");

const registration = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName?.trim())
      return res.status(400).send({ message: "FullName is required." });
    if (!email) return res.status(400).send({ message: "Email is required." });
    if (!isValidEmail(email))
      return res.status(400).send({ message: "Email is invalid." });
    if (!password)
      return res.status(400).send({ message: "Password is required." });

    const existEmail = await authSchema.findOne({ email });
    if (existEmail)
      return res
        .status(400)
        .send({ message: "This email is already registered." });

    const user = new authSchema({ fullName, email, password });
    await user.save();

    res.status(201).send({ message: "Registration successful." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error." });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email) return res.status(400).send({ message: "Email is required." });
    if (!password)
      return res.status(400).send({ message: "Password is required." });

    const user = await authSchema.findOne({ email });
    if (!user)
      return res.status(401).send({ message: "Invalid email or password." });

    const validPassword = await user.comparePassword(password);
    if (!validPassword)
      return res.status(401).send({ message: "Invalid email or password." });

    // If 2FA is enabled, require OTP token
    if (user.isTwoFactorEnabled) {
      return res.status(200).send({
        message: "Password verified. Please provide OTP token.",
        requiresOTP: true,
        userId: user._id,
      });
    }

    res.status(200).send({ message: "Login successful." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Login failed." });
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

    res
      .status(200)
      .send({ message: "Login successful with two-factor authentication." });
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
  login,
  setupTwoFactor,
  verifyAndEnableTwoFactor,
  loginWithOTP,
  disableTwoFactor,
};
