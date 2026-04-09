# OTP (Two-Factor Authentication) Setup Guide

This project now includes proper OTP (One-Time Password) setup for enhanced security using Time-based One-Time Password (TOTP) standard.

## Features Added

- **Setup 2FA**: Generate QR code and secret for authenticator apps
- **Enable 2FA**: Verify and enable two-factor authentication
- **Login with 2FA**: Enhanced login flow requiring OTP for users with 2FA enabled
- **Disable 2FA**: Securely disable two-factor authentication

## API Endpoints

### 1. Setup Two-Factor Authentication
**POST** `/auth/setup-2fa`

Request Body:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "message": "Two-factor authentication setup initiated.",
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "otpauth_url": "otpauth://totp/Management%20System:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Your%20App"
}
```

### 2. Verify and Enable 2FA
**POST** `/auth/verify-2fa`

Request Body:
```json
{
  "email": "user@example.com",
  "token": "123456"
}
```

Response:
```json
{
  "message": "Two-factor authentication enabled successfully."
}
```

### 3. Login (Updated Flow)
**POST** `/auth/login`

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response (if 2FA enabled):
```json
{
  "message": "Password verified. Please provide OTP token.",
  "requiresOTP": true,
  "userId": "60f1b2b3c4d5e6f7g8h9i0j1"
}
```

### 4. Login with OTP
**POST** `/auth/login-2fa`

Request Body:
```json
{
  "userId": "60f1b2b3c4d5e6f7g8h9i0j1",
  "token": "123456"
}
```

Response:
```json
{
  "message": "Login successful with two-factor authentication."
}
```

### 5. Disable 2FA
**POST** `/auth/disable-2fa`

Request Body:
```json
{
  "email": "user@example.com",
  "token": "123456"
}
```

Response:
```json
{
  "message": "Two-factor authentication disabled successfully."
}
```

## How to Use

1. **Setup 2FA**:
   - User logs in with email/password
   - Call `/auth/setup-2fa` to get QR code and secret
   - User scans QR code with authenticator app (Google Authenticator, Authy, etc.)
   - Call `/auth/verify-2fa` with a token from the app to enable 2FA

2. **Login with 2FA**:
   - User provides email/password
   - If 2FA is enabled, system responds with `requiresOTP: true` and `userId`
   - User provides OTP token from authenticator app
   - Call `/auth/login-2fa` with `userId` and `token`

3. **Disable 2FA**:
   - User must provide current OTP token to disable 2FA
   - Call `/auth/disable-2fa` with email and current token

## Dependencies Added

- `speakeasy`: For TOTP generation and verification
- `qrcode`: For generating QR codes for authenticator apps

## Security Features

- TOTP tokens are valid for 30 seconds with 2-window tolerance for clock skew
- OTP secrets are stored securely in the database
- Users must provide current OTP token to disable 2FA
- Failed OTP attempts don't reveal if 2FA is enabled or not

## Testing the Setup

1. Start the server: `npm start`
2. Use a tool like Postman or curl to test the endpoints
3. For QR code testing, you can use the `qrCode` data URL in a browser or image viewer

Example curl commands:

```bash
# Setup 2FA
curl -X POST http://localhost:3000/auth/setup-2fa \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Verify and enable 2FA
curl -X POST http://localhost:3000/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","token":"123456"}'
```</content>
<parameter name="filePath">c:\Users\User\OneDrive\Desktop\Management_sytem_project\OTP_SETUP_README.md