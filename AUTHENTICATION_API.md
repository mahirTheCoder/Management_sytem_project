# Complete Authentication API Documentation

This is a comprehensive guide for all authentication endpoints in the Management System. The system includes JWT token-based authentication, 2FA/OTP support, email verification, and password recovery.

## Table of Contents
1. [Authentication Flows](#authentication-flows)
2. [Public Endpoints](#public-endpoints)
3. [Protected Endpoints](#protected-endpoints)
4. [2FA/OTP Endpoints](#2faota-endpoints)
5. [Response Formats](#response-formats)
6. [Error Handling](#error-handling)

---

## Authentication Flows

### Standard Login Flow
1. User registers with email and password
2. Email verification link sent to user's email
3. User verifies email
4. User logs in with credential
5. Server responds with access token and refresh token
6. User sends access token in Authorization header for protected routes
7. When access token expires, use refresh token to get new access token

### 2FA Login Flow
1. User logs in with credentials
2. If 2FA is enabled, server responds with `requiresOTP: true` and `userId`
3. User provides OTP from authenticator app
4. User receives access and refresh tokens

---

## Public Endpoints

### 1. User Registration

**Endpoint:** `POST /auth/registration`

**Description:** Create a new user account. Email verification will be required.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character (@$!%*?&)

**Success Response (201):**
```json
{
  "message": "Registration successful. Please verify your email.",
  "userId": "60f1b2b3c4d5e6f7g8h9i0j1"
}
```

**Error Responses:**
- `400` - Missing fields, invalid email, weak password, or passwords don't match
- `409` - Email already registered

---

### 2. Verify Email

**Endpoint:** `POST /auth/verify-email`

**Description:** Verify user's email using the token sent in verification email.

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified successfully."
}
```

**Error Responses:**
- `400` - Invalid or expired verification token

---

### 3. User Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive access and refresh tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200) - Without 2FA:**
```json
{
  "message": "Login successful.",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f1b2b3c4d5e6f7g8h9i0j1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "avatar": ""
  }
}
```

**Success Response (200) - With 2FA Enabled:**
```json
{
  "message": "Password verified. Please provide OTP token.",
  "requiresOTP": true,
  "userId": "60f1b2b3c4d5e6f7g8h9i0j1"
}
```

**Error Responses:**
- `401` - Invalid email or password
- `403` - Email not verified OR Account locked (too many failed attempts)

---

### 4. Refresh Access Token

**Endpoint:** `POST /auth/refresh-token`

**Description:** Get a new access token using a refresh token (when access token expires).

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "message": "Token refreshed successfully.",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Refresh token is required
- `401` - Invalid or expired refresh token

---

### 5. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Description:** Request a password reset email. Email with reset link will be sent if account exists (for security, success message is shown regardless).

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset link sent to your email."
}
```

---

### 6. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Description:** Reset password using the token from the reset email.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successfully."
}
```

**Error Responses:**
- `400` - Invalid/expired token, weak password, or passwords don't match

---

## Protected Endpoints

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <access_token>
```

### 1. Change Password

**Endpoint:** `POST /auth/change-password`

**Description:** Change password for logged-in user. Requires current password verification.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "oldPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully."
}
```

**Error Responses:**
- `401` - Current password is incorrect
- `400` - New password doesn't meet requirements or passwords don't match

---

### 2. Logout

**Endpoint:** `POST /auth/logout`

**Description:** Logout user by invalidating refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "60f1b2b3c4d5e6f7g8h9i0j1"
}
```

**Success Response (200):**
```json
{
  "message": "Logout successful."
}
```

---

## 2FA/OTA Endpoints

### 1. Setup Two-Factor Authentication

**Endpoint:** `POST /auth/setup-2fa`

**Description:** Generate OTP secret and QR code for 2FA setup. User must verify the OTP before it's enabled.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Two-factor authentication setup initiated.",
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQA...",
  "otpauth_url": "otpauth://totp/Management%20System:john@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Your%20App"
}
```

**Steps:**
1. Scan QR code with authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
2. Or manually enter the secret: `JBSWY3DPEHPK3PXP`
3. Call `/verify-2fa` endpoint to confirm

---

### 2. Verify and Enable 2FA

**Endpoint:** `POST /auth/verify-2fa`

**Description:** Verify OTP token to enable two-factor authentication.

**Request Body:**
```json
{
  "email": "john@example.com",
  "token": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "Two-factor authentication enabled successfully."
}
```

**Error Responses:**
- `400` - Invalid OTP token
- `404` - User not found

---

### 3. Login with OTP

**Endpoint:** `POST /auth/login-2fa`

**Description:** Complete login with 2FA by providing OTP token. Use the `userId` from initial login response.

**Request Body:**
```json
{
  "userId": "60f1b2b3c4d5e6f7g8h9i0j1",
  "token": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful with two-factor authentication.",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Invalid OTP token
- `404` - User not found

---

### 4. Disable 2FA

**Endpoint:** `POST /auth/disable-2fa`

**Description:** Disable two-factor authentication. Current OTP token required for verification.

**Request Body:**
```json
{
  "email": "john@example.com",
  "token": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "Two-factor authentication disabled successfully."
}
```

**Error Responses:**
- `400` - Invalid OTP token or 2FA not enabled
- `404` - User not found

---

## Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

---

## Error Handling

### Common HTTP Status Codes

| Status Code | Meaning |
|------------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or missing fields |
| 401 | Unauthorized - Invalid credentials or expired token |
| 403 | Forbidden - Access denied (2FA required, email not verified, account locked) |
| 404 | Not Found - User or resource not found |
| 409 | Conflict - Email already registered |
| 500 | Internal Server Error |

### Security Features

1. **Account Lockout:** After 5 failed login attempts, account is locked for 15 minutes
2. **Password Hashing:** Passwords are hashed using bcrypt with 10 salt rounds
3. **Token Expiry:** 
   - Access tokens expire in 1 hour
   - Refresh tokens expire in 7 days
   - Verification tokens expire in 24 hours
   - Password reset tokens expire in 1 hour
4. **2FA/OTP:** Time-based One-Time Password (TOTP) using 30-second time windows
5. **Email Verification:** Users must verify email before first login

---

## Usage Example

### Complete Authentication Flow

```javascript
// 1. Register
POST /auth/registration
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}

// 2. Verify Email (link from email)
POST /auth/verify-email
{
  "token": "verification-token"
}

// 3. Login
POST /auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
// Response: { accessToken, refreshToken, ... }

// 4. Use Access Token for Protected Routes
GET /api/protected-route
Headers: Authorization: Bearer <accessToken>

// 5. Refresh Token (when accessToken expires)
POST /auth/refresh-token
{
  "refreshToken": "refreshToken"
}
// Response: { accessToken (new) }

// 6. Change Password
POST /auth/change-password
Headers: Authorization: Bearer <accessToken>
{
  "oldPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}

// 7. Logout
POST /auth/logout
Headers: Authorization: Bearer <accessToken>
{
  "userId": "user-id"
}
```

---

## Installation & Setup

1. **Install Dependencies:**
```bash
npm install
```

2. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`
   - Update all values with your configuration

3. **Start Server:**
```bash
npm start
```

4. **Email Configuration (Gmail Example):**
   - Enable 2-Step Verification
   - Generate App Password
   - Use App Password in `.env`

---

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:8000/auth/registration \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@example.com","password":"SecurePass123!","confirmPassword":"SecurePass123!"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'

# Refresh Token
curl -X POST http://localhost:8000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your-refresh-token"}'
```
