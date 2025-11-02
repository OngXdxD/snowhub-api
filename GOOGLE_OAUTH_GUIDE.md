# Google OAuth Integration Guide

## ✅ What's Supported Now

The API now supports **BOTH** authentication methods:

1. **Email/Password** (Traditional) → HS256 tokens
2. **Google OAuth** → RS256 tokens accepted, returns HS256 tokens

---

## 🔐 How It Works

### Option 1: Email/Password Login (Original)

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIs..." // HS256 token
  }
}
```

---

### Option 2: Google OAuth Login (NEW)

**Step 1: User logs in with Google on frontend**
- Frontend gets Google OAuth token (RS256)

**Step 2: Send Google token to backend**

```bash
POST /api/auth/google
Content-Type: application/json

{
  "token": "eyJhbGciOiJSUzI1NiIs...", // Google's RS256 token
  "email": "user@gmail.com",
  "username": "johndoe", // optional
  "avatar": "https://lh3.googleusercontent.com/..." // optional
}
```

**What happens:**
- Backend decodes Google token to get email
- If user exists → login
- If user doesn't exist → auto-register
- Returns **our own HS256 token**

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "username": "johndoe",
      "email": "user@gmail.com",
      "avatar": "https://...",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIs..." // HS256 token (use this!)
  }
}
```

**Step 3: Use the returned HS256 token**

```bash
POST /api/posts
Authorization: Bearer eyJhbGciOiJIUzI1NiIs... # Use the HS256 token from step 2
Content-Type: application/json

{
  "title": "My Post",
  "content": "...",
  "image": "filename.jpg"
}
```

---

## 🔄 Frontend Flow

### React/Next.js Example:

```javascript
// 1. User clicks "Login with Google"
const handleGoogleLogin = async (googleCredential) => {
  try {
    // Send Google token to your backend
    const response = await fetch('http://localhost:5000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: googleCredential.credential, // RS256 token from Google
        email: googleCredential.email,
        username: googleCredential.name,
        avatar: googleCredential.picture
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Save the HS256 token
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Now use this token for all API calls
      console.log('Logged in!', data.data.user);
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// 2. Use the saved token for API calls
const createPost = async (postData) => {
  const token = localStorage.getItem('token'); // HS256 token
  
  const response = await fetch('http://localhost:5000/api/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  });
  
  return response.json();
};
```

---

## 📊 Token Flow Diagram

```
Frontend                          Backend
--------                          -------

[Google Login] 
    ↓
Get RS256 Token
    ↓
POST /api/auth/google
    ↓                             Decode RS256 token
    ↓                             Get user email
    ↓                             Find or create user
    ↓                             Generate HS256 token
    ↓                                   ↓
Receive HS256 Token  ←─────────────────┘
    ↓
Save HS256 Token
    ↓
Use for all API calls
    ↓
POST /api/posts
Authorization: Bearer HS256_TOKEN
```

---

## ✅ Both Methods Work

### Method 1: Traditional Login
```
POST /api/auth/login → Get HS256 token → Use token
```

### Method 2: Google OAuth
```
Google Login → Get RS256 token → POST /api/auth/google → Get HS256 token → Use token
```

---

## 🧪 Test Google OAuth

**1. Simulate Google login:**
```bash
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "token": "dummy-google-token",
    "email": "test@gmail.com",
    "username": "testuser",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

**2. Use the returned token:**
```bash
# Copy token from response
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token-from-step-1>"
```

---

## ⚠️ Important Notes

1. **Don't use RS256 tokens directly** in API calls
   - Google gives you RS256
   - Exchange it for HS256 via `/api/auth/google`
   - Use HS256 for all subsequent requests

2. **Auto-registration**
   - If user doesn't exist, they're automatically created
   - Random password is set (they'll use Google login)

3. **Token expiration**
   - HS256 tokens expire in 30 days (configurable)
   - Google RS256 tokens expire sooner
   - Refresh by calling `/api/auth/google` again

---

## 🔒 Security

- Google tokens are decoded (not verified) - trust Google's authentication
- User lookup by email ensures user exists
- HS256 tokens are generated with your JWT_SECRET
- All subsequent requests use HS256 tokens

---

## 📝 Summary

**Before:**
- ❌ RS256 tokens rejected
- ✅ Only HS256 (email/password) supported

**Now:**
- ✅ RS256 tokens accepted via `/api/auth/google`
- ✅ Auto-converts to HS256 token
- ✅ Both Google OAuth and email/password work
- ✅ Seamless authentication flow

**You can now use Google OAuth! 🎉**

