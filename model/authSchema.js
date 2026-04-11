const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const authSchema = new mongoose.Schema({
  avatar: {
    type: String,
    default: "",
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
  },
  emailVerificationExpiry: {
    type: Date,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Date,
  },
  otpSecret: {
    type: String,
    default: null,
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  refreshToken: {
    type: String,
    default: null,
  },
  refreshTokenExpiry: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpiry: {
    type: Date,
  },
  lastLogin: {
    type: Date,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

authSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Instance method to compare password
authSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw err;
  }
};

// Instance method to check if account is locked
authSchema.methods.isAccountLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Instance method to increment login attempts
authSchema.methods.incLoginAttempts = async function () {
  // Reset login attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Lock account after 5 failed attempts for 15 minutes
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 15 * 60 * 1000; // 15 minutes
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isAccountLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
authSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

module.exports = mongoose.model("auth", authSchema);
