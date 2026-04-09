const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function generateOTPSecret() {
    return speakeasy.generateSecret({
        name: 'Management System',
        issuer: 'Your App'
    });
}

function generateOTPQRCode(secret) {
    return new Promise((resolve, reject) => {
        qrcode.toDataURL(secret.otpauth_url, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

function verifyOTP(secret, token) {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time windows (30 seconds each) for clock skew
    });
}

function generateOTPToken(secret) {
    return speakeasy.totp({
        secret: secret,
        encoding: 'base32'
    });
}

module.exports = { 
    isValidEmail, 
    generateOTPSecret, 
    generateOTPQRCode, 
    verifyOTP,
    generateOTPToken 
};