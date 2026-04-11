# Authentication System - Test Scenarios

## 🧪 Complete Test Scenarios

Use these scenarios to verify all authentication features are working correctly.

---

## Scenario 1: Basic Registration & Login

### Step 1: Register User
```bash
curl -X POST http://localhost:8000/auth/registration \
  -H "Content-Type: application/json" \
  -d '{\n    "fullName": "John Doe",\n    "email": "john.doe@example.com",\n    "password": "SecurePass123!",\n    "confirmPassword": "SecurePass123!"\n  }' \
```

**Expected Result:**
- ✅ Status: 201
- ✅ Message: "Registration successful. Please verify your email."
- ✅ userId returned

**What happens:**
- User created in MongoDB
- Email verification token generated
- Verification email sent (if email configured)

---

### Step 2: Verify Email
```bash
# From email received: extract the token
curl -X POST http://localhost:8000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{\n    "token": "token-from-email"\n  }'
```

**Expected Result:**
- ✅ Status: 200
- ✅ Message: "Email verified successfully."

**What happens:**
- isVerified set to true
- Verification token cleared

---

### Step 3: Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{\n    "email": "john.doe@example.com",\n    "password": "SecurePass123!"\n  }'
```

**Expected Result:**
- ✅ Status: 200
- ✅ accessToken provided
- ✅ refreshToken provided
- ✅ User object with id, fullName, email

**Tokens should contain:**
- accessToken: Valid JWT (exp: 1 hour)
- refreshToken: Valid JWT (exp: 7 days)

---

## Scenario 2: Password Validation

### Test: Invalid Password Format
```bash
curl -X POST http://localhost:8000/auth/registration \
  -H "Content-Type: application/json" \
  -d '{\n    "fullName": "Test User",\n    "email": "test@example.com",\n    "password": "weak",\n    "confirmPassword": "weak"\n  }'
```

**Expected Result:**
- ✅ Status: 400
- ✅ Message: "Password must be at least 8 characters with uppercase, number, and special character."

**Valid passwords must include:**
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one number (0-9)
- ✅ At least one special character (@$!%*?&)

### Valid password examples:
- `SecurePass123!` ✅
- `MyPass@1234` ✅
- `TestAbc$987` ✅

### Invalid password examples:
- `password` ❌ (no uppercase, number, or special char)
- `Password123` ❌ (no special character)
- `Pass@1` ❌ (less than 8 characters)

---

## Scenario 3: Duplicate Email Prevention

### Test: Register same email twice
```bash
# First registration (successful)
curl -X POST http://localhost:8000/auth/registration \
  -H "Content-Type: application/json" \
  -d '{\n    "fullName": "User One",\n    "email": "duplicate@example.com",\n    "password": "ValidPass123!",\n    "confirmPassword": "ValidPass123!"\n  }'

# Second registration (should fail)
curl -X POST http://localhost:8000/auth/registration \
  -H "Content-Type: application/json" \
  -d '{\n    "fullName": "User Two",\n    "email": "duplicate@example.com",\n    "password": "ValidPass123!",\n    "confirmPassword": "ValidPass123!"\n  }'
```

**Expected Result (Second):**
- ✅ Status: 409
- ✅ Message: "Email already registered."

---

## Scenario 4: JWT Token Management

### Test: Access Protected Endpoint with Token
```bash
curl -X POST http://localhost:8000/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{\n    "userId": "user-id-from-login"\n  }'
```

**Expected Result:**
- ✅ Status: 200

### Test: Access Protected Endpoint WITHOUT Token
```bash
curl -X POST http://localhost:8000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{\n    "userId": "user-id-from-login"\n  }'
```

**Expected Result:**
- ✅ Status: 401
- ✅ Message: "No token provided. Access denied."

### Test: Access with Invalid Token
```bash
curl -X POST http://localhost:8000/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token-xyz" \
  -d '{\n    "userId": "user-id"\n  }'
```

**Expected Result:**
- ✅ Status: 401
- ✅ Message: "Invalid or expired token."

---

## Scenario 5: Token Refresh Flow

### Step 1: Login and Save Tokens
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{\n    "email": "john.doe@example.com",\n    "password": "SecurePass123!"\n  }'

# Save accessToken and refreshToken from response
```

### Step 2: Use Refresh Token
```bash
curl -X POST http://localhost:8000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{\n    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."\n  }'
```

**Expected Result:**
- ✅ Status: 200
- ✅ New accessToken provided
- ✅ Old accessToken becomes invalid

---

## Scenario 6: Account Lockout (Security Feature)

### Test: Multiple Failed Logins
```bash
# Attempt 1 (invalid password)
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{\n    "email": "john.doe@example.com",\n    "password": "WrongPass123!"\n  }'
# Response: 401 - Invalid email or password

# Attempt 2-5: Repeat with wrong password

# Attempt 6 (after 5 failed attempts)
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{\n    "email": "john.doe@example.com",\n    "password": "WrongPass123!"\n  }'
```

**Expected Result (after 5 failed attempts):**
- ✅ Status: 403
- ✅ Message: "Account locked due to multiple failed attempts. Try again later."

**Account Unlock:**
- ✅ Automatic after 15 minutes

---

## Scenario 7: Two-Factor Authentication (2FA)

### Step 1: Setup 2FA
```bash
curl -X POST http://localhost:8000/auth/setup-2fa \
  -H "Content-Type: application/json" \
  -d '{\n    "email": "john.doe@example.com"\n  }'
```

**Expected Result:**
- ✅ Status: 200
- ✅ QR code (data URL) provided
- ✅ Secret key provided
- ✅ otpauth_url provided

**What to do:**
- Scan QR code with Google Authenticator, Authy, or Microsoft Authenticator
- You'll get a 6-digit OTP code

### Step 2: Verify 2FA
```bash
curl -X POST http://localhost:8000/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{\n    "email": "john.doe@example.com",\n    "token": "123456"\n  }'
```

**Expected Result:**
- ✅ Status: 200
- ✅ Message: "Two-factor authentication enabled successfully."

### Step 3: Login with 2FA Enabled
```bash
# First step: password login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{\n    "email": "john.doe@example.com",\n    "password": "SecurePass123!"\n  }'
```

**Expected Result:**
- ✅ Status: 200
- ✅ Message: "Password verified. Please provide OTP token."
- ✅ requiresOTP: true
- ✅ userId provided

### Step 4: Login with OTP
```bash
curl -X POST http://localhost:8000/auth/login-2fa \
  -H "Content-Type: application/json" \
  -d '{\n    "userId": "user-id-from-previous-step",\n    "token": "123456"\n  }'
```

**Expected Result:**
- ✅ Status: 200
- ✅ accessToken provided
- ✅ refreshToken provided
- ✅ User object provided

### Step 5: Disable 2FA
```bash
curl -X POST http://localhost:8000/auth/disable-2fa \
  -H "Content-Type: application/json" \
  -d '{\n    "email": "john.doe@example.com",\n    "token": "123456"\n  }'
```

**Expected Result:**
- ✅ Status: 200
- ✅ Message: "Two-factor authentication disabled successfully."

---

## Scenario 8: Password Reset & Recovery

### Step 1: Request Password Reset
```bash
curl -X POST http://localhost:8000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{\n    "email": "john.doe@example.com"\n  }'
```

**Expected Result:**
- ✅ Status: 200
- ✅ Message: "Password reset link sent to your email."
- ✅ Email received with reset link

### Step 2: Reset Password
```bash
# Extract token from email link
curl -X POST http://localhost:8000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{\n    "token": "token-from-email",\n    "newPassword": "NewSecurePass456!",\n    "confirmPassword": "NewSecurePass456!"\n  }'
```

**Expected Result:**
- ✅ Status: 200
- ✅ Message: "Password reset successfully."

### Step 3: Login with New Password
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{\n    "email": "john.doe@example.com",\n    "password": "NewSecurePass456!"\n  }'
```

**Expected Result:**
- ✅ Status: 200
- ✅ Successfully logged in with new password

---

## Scenario 9: Change Password

### Prerequisites: Logged-in user with accessToken

```bash
curl -X POST http://localhost:8000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer access-token-here" \
  -d '{\n    "oldPassword": "SecurePass123!",\n    "newPassword": "UpdatedPass789!",\n    "confirmPassword": "UpdatedPass789!"\n  }'
```

**Expected Result:**
- ✅ Status: 200
- ✅ Message: "Password changed successfully."

### Test: Wrong Old Password
```bash
curl -X POST http://localhost:8000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer access-token-here" \
  -d '{\n    "oldPassword": "WrongPassword123!",\n    "newPassword": "UpdatedPass789!",\n    "confirmPassword": "UpdatedPass789!"\n  }'
```

**Expected Result:**
- ✅ Status: 401
- ✅ Message: "Current password is incorrect."

---

## Scenario 10: Email Verification

### Test: Login Before Email Verification
```bash
# After registration, before clicking verify link
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{\n    "email": "unverified@example.com",\n    "password": "SecurePass123!"\n  }'
```

**Expected Result:**
- ✅ Status: 403
- ✅ Message: "Please verify your email before logging in."

---

## ✅ Verification Checklist

After running all scenarios, verify:

- [ ] Registration works with strong passwords
- [ ] Email verification is required
- [ ] Weak passwords are rejected
- [ ] Duplicate emails are prevented
- [ ] JWT tokens are issued and valid
- [ ] Token refresh works correctly
- [ ] Account locks after 5 failed attempts
- [ ] 2FA can be setup and verified
- [ ] Login with 2FA works
- [ ] Password reset email flow works
- [ ] Change password for logged-in users works
- [ ] Protected endpoints require valid tokens
- [ ] Invalid tokens are rejected

---

## 🐛 Debug Tips

### MongoDB Issues
```bash
# Check if user exists
db.auths.findOne({ email: "john.doe@example.com" })

# View all users
db.auths.find().pretty()

# Delete test user
db.auths.deleteOne({ email: "test@example.com" })
```

### Check Server Logs
- Look for error messages in terminal
- Check MongoDB connection
- Verify environment variables

### Postman Tips
- Set environment variables for tokens
- Use Pre-request Script to extract tokens
- Add tests to verify responses

---

## 📊 Success Metrics

Your authentication system is working if:

1. ✅ All 10 scenarios pass without errors
2. ✅ Passwords meet security requirements
3. ✅ Tokens are generated and validated correctly
4. ✅ Email verification works (or shows graceful fallback)
5. ✅ 2FA setup and verification works
6. ✅ Account lockout prevents brute force
7. ✅ Protected endpoints require authentication
8. ✅ Password reset flow completes successfully
9. ✅ Token refresh extends session
10. ✅ Logout invalidates tokens

---

**Test Status: Ready for Production ✅**
