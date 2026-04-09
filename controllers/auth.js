const authSchema = require("../model/authSchema");
const bcrypt = require("bcrypt");
const { 
    isValidEmail, 
    generateOTPSecret, 
    generateOTPQRCode, 
    verifyOTP,
    generateOTPToken 
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
      return res.status(400).send({ message: "This email is already registered." });

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

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).send({ message: "Invalid email or password." });

    // If 2FA is enabled, require OTP token
    if (user.isTwoFactorEnabled) {
      return res.status(200).send({ 
        message: "Password verified. Please provide OTP token.",
        requiresOTP: true,
        userId: user._id
      });
    }

    res.status(200).send({ message: "Login successful." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Login failed." });
  }
};



module.exports = { 
  registration, 
  login, 
  setupTwoFactor, 
  verifyAndEnableTwoFactor, 
  loginWithOTP, 
  disableTwoFactor 
};
