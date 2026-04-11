const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');

require('dotenv').config();

// Email validation
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Password validation (minimum 8 chars, at least one uppercase, one number, one special char)
function isValidPassword(password) {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordPattern.test(password);
}

// Generate OTP secret
function generateOTPSecret() {
    return speakeasy.generateSecret({
        name: 'Management System',
        issuer: 'Your App'
    });
}

// Generate QR code for OTP
function generateOTPQRCode(secret) {
    return new Promise((resolve, reject) => {
        qrcode.toDataURL(secret.otpauth_url, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

// Verify OTP token
function verifyOTP(secret, token) {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2
    });
}

// Generate OTP token
function generateOTPToken(secret) {
    return speakeasy.totp({
        secret: secret,
        encoding: 'base32'
    });
}



module.exports = { 
    isValidEmail,
    isValidPassword,
    generateOTPSecret, 
    generateOTPQRCode, 
    verifyOTP,
    generateOTPToken,
    generateJWT,
    verifyJWT,
    generateRefreshToken,
    verifyRefreshToken,
    generateRandomToken,
    hashToken,
    sendVerificationEmail,
    sendPasswordResetEmail
};