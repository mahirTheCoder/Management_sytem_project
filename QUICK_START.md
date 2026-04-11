# Quick Start Guide - Authentication System

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js (v14+)
- MongoDB running locally
- An email account (Gmail recommended for testing)
- A code editor (VS Code recommended)

---

## ⚡ Quick Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create `.env` File
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Step 3: Update `.env` with Your Values
```env
MONGODB_URI=mongodb://localhost:27017/management_system
PORT=8000
NODE_ENV=development

# JWT Keys - Change these to random values!
JWT_SECRET=your-super-secret-jwt-key-12345
JWT_REFRESH_SECRET=your-super-secret-refresh-key-12345

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-from-google

FRONTEND_URL=http://localhost:3000
```

### Step 4: Setup Gmail (for testing)
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Generate "App Password" for Node.js
4. Copy the generated password to `.env`

### Step 5: Ensure MongoDB is Running
```bash
# macOS/Linux
brew services start mongodb-community

# Windows
# Start MongoDB from Services or run mongod.exe

# Docker (alternative)
docker run -d -p 27017:27017 --name mongodb mongo
```

### Step 6: Start the Server
```bash
npm start
```

**Expected Output:**
```
Server running on port 8000
MongoDB connected successfully
```

---

## 🧪 Test the API

### Using Postman (Recommended)
1. Download [Postman](https://www.postman.com/downloads/)
2. Import the following examples

### Using cURL

#### 1. Register a User
```bash
curl -X POST http://localhost:8000/auth/registration \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "testuser@example.com",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!"
  }'
```

**Response:**
```json
{
  "message": "Registration successful. Please verify your email.",
  "userId": "60f1b2b3c4d5e6f7g8h9i0j1"
}
```

#### 2. Verify Email
Check your email for verification link. Or use token from response to call:
```bash
curl -X POST http://localhost:8000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification-token-from-email"
  }'
```

#### 3. Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }'
```

**Response:**
```json
{
  "message": "Login successful.",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f1b2b3c4d5e6f7g8h9i0j1",
    "fullName": "Test User",
    "email": "testuser@example.com",
    "avatar": ""
  }
}
```

#### 4. Refresh Token (when AccessToken expires)
```bash
curl -X POST http://localhost:8000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

#### 5. Setup 2FA (Optional)
```bash
curl -X POST http://localhost:8000/auth/setup-2fa \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }'
```

**Response includes QR code - Scan with Google Authenticator, Authy, or Microsoft Authenticator**

#### 6. Change Password (Protected)
```bash
curl -X POST http://localhost:8000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "oldPassword": "TestPass123!",
    "newPassword": "NewTestPass456!",
    "confirmPassword": "NewTestPass456!"
  }'
```

#### 7. Logout (Protected)
```bash
curl -X POST http://localhost:8000/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "userId": "60f1b2b3c4d5e6f7g8h9i0j1"
  }'
```

---

## 📦 Postman Collection

Create a new request in Postman with these examples:

### Environment Variables (in Postman)
```
baseUrl = http://localhost:8000
accessToken = <from login response>
refreshToken = <from login response>
userId = <from login response>
```

### Requests
1. **Register**: `POST {{baseUrl}}/auth/registration`
2. **Login**: `POST {{baseUrl}}/auth/login`
3. **Refresh**: `POST {{baseUrl}}/auth/refresh-token`
4. **Change Password**: `POST {{baseUrl}}/auth/change-password` (with Bearer token)
5. **Logout**: `POST {{baseUrl}}/auth/logout` (with Bearer token)

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to MongoDB"
- **Fix**: Ensure MongoDB is running: `mongod`
- **Check**: `MONGODB_URI` in `.env` is correct

### Issue: "Email not sending"
- **Fix**: Check EMAIL credentials in `.env`
- **Test**: Use [Mailtrap](https://mailtrap.io) for testing
- **Debug**: Check console for detailed error

### Issue: "Invalid token"
- **Fix**: Token may have expired or JWT secrets don't match
- **Check**: Ensure `JWT_SECRET` is same on server

### Issue: "Email already registered"
- **Fix**: Use different email or delete user from MongoDB
- **Debug**: Check MongoDB collection

### Issue: "Password doesn't meet requirements"
- **Requirements**: 
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character (@$!%*?&)

---

## 📚 Documentation

For detailed API documentation, see: [AUTHENTICATION_API.md](./AUTHENTICATION_API.md)

For system overview, see: [AUTHENTICATION_SYSTEM.md](./AUTHENTICATION_SYSTEM.md)

---

## 🎯 Next Steps

1. ✅ Register and login to verify setup
2. ✅ Test email verification flow
3. ✅ Setup 2FA with authenticator app
4. ✅ Test refresh token flow
5. ✅ Test password reset workflow
6. ✅ Integrate with frontend

---

## 💡 Pro Tips

- **Keep tokens safe**: Never expose access tokens in URLs or logs
- **Use HTTPS**: Always use HTTPS in production
- **Rotate secrets**: Change JWT_SECRET regularly
- **Monitor attempts**: Track failed login attempts
- **Test email**: Use Mailtrap for development/testing
- **Rate limit**: Add rate limiting middleware in production

---

## 🤝 Common Integration Points

### Frontend Integration Example (JavaScript/React)

```javascript
// Login
const response = await fetch('http://localhost:8000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123!'
  })
});

const data = await response.json();
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);

// Use token in API calls
const protectedResponse = await fetch('http://localhost:8000/api/protected', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});
```

---

## 📞 Need Help?

1. Check error messages in terminal
2. Review [AUTHENTICATION_API.md](./AUTHENTICATION_API.md)
3. Verify `.env` configuration
4. Check MongoDB connection
5. Review console logs for detailed errors

---

**Happy coding! 🚀**
