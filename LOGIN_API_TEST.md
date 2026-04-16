# Login API Testing Guide

## API Endpoint
```
POST http://localhost:8000/auth/login
```

## Prerequisites
1. Server must be running: `npm start`
2. MongoDB must be connected
3. A user account must exist (register first using `/auth/simple-register`)

---

## Test Scenarios

### 1. **Successful Login**

**cURL Command:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Login successful.",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "user@example.com",
    "avatar": null
  }
}
```

---

### 2. **Missing Email**

**cURL Command:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "SecurePass123!"
  }'
```

**Expected Response (400):**
```json
{
  "message": "Email is required."
}
```

---

### 3. **Missing Password**

**cURL Command:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Expected Response (400):**
```json
{
  "message": "Password is required."
}
```

---

### 4. **Invalid Credentials**

**cURL Command:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "WrongPassword123!"
  }'
```

**Expected Response (401):**
```json
{
  "message": "Invalid email or password."
}
```

---

### 5. **Unverified Email**

**cURL Command:** (if using email verification registration)
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "unverified@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response (403):**
```json
{
  "message": "Please verify your email before logging in."
}
```

---

### 6. **Login with 2FA Enabled**

**cURL Command:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user2fa@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Password verified. Please provide OTP token.",
  "requiresOTP": true,
  "userId": "507f1f77bcf86cd799439011"
}
```

Then use `/auth/login-2fa` endpoint with the OTP token.

---

### 7. **Account Locked (After Multiple Failed Attempts)**

**After 5 failed login attempts, the account is locked for a period.**

**cURL Command:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "locked@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response (403):**
```json
{
  "message": "Account locked due to multiple failed attempts. Try again later."
}
```

---

## Using PowerShell

```powershell
$body = @{
    email = "user@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

---

## Using Postman

1. Create a new **POST** request
2. URL: `http://localhost:8000/auth/login`
3. Go to **Body** tab → Select **raw** → Choose **JSON**
4. Paste the request body:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
5. Click **Send**

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200  | Login successful |
| 400  | Missing required fields or validation error |
| 401  | Invalid credentials |
| 403  | Email not verified OR Account locked OR OTP required |
| 404  | User not found |
| 500  | Server error |

---

## Next Steps After Login

1. **Store the tokens** (accessToken and refreshToken) in your client
2. **Use accessToken** in Authorization header: `Authorization: Bearer {accessToken}`
3. **Refresh token** when it expires using `/auth/refresh-token`
4. **Logout** using `/auth/logout` when done
