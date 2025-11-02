# Fix JWT "Invalid Algorithm" Error

## 🔴 The Problem

You're getting `JsonWebTokenError: invalid algorithm` even with "fresh login".

**This means:** The token you're using was created with a **DIFFERENT JWT_SECRET** than what's currently in your `.env` file.

---

## ✅ The Solution

### Option 1: Get a Fresh Token (Easiest)

Run this command to generate a token that works with your current JWT_SECRET:

```bash
node get-fresh-token.js
```

This will:
1. Connect to your database
2. Find a user (default: snow@example.com)
3. Generate a token with your CURRENT JWT_SECRET
4. Display the token for you to copy

**Copy the token and use it!**

---

### Option 2: Login Again (Proper Way)

**Make sure your server is running:**
```bash
yarn dev
```

**Then login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "snow@example.com",
    "password": "password123"
  }'
```

**Or in Postman:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "snow@example.com",
  "password": "password123"
}
```

**Copy the `token` from the response!**

---

### Option 3: Check What's Wrong with Your Token

Restart your server with debugging:

```bash
# Stop server (Ctrl+C)
# Set to development mode
# In your .env, make sure:
NODE_ENV=development

# Restart
yarn dev
```

Now when you make a request, you'll see:
```
🔍 Token received (first 20 chars): eyJhbGciOiJIUzI1NiIs...
🔍 Token length: 171
🔍 Token algorithm: HS256
🔍 Token type: JWT
```

If you see `invalid algorithm` error, it means your token is corrupted or wrong.

---

## 🔍 Why This Happens

### Cause 1: Changed JWT_SECRET
You changed `JWT_SECRET` in `.env` after creating the token.

**Solution:** Login again to get new token.

### Cause 2: Wrong JWT_SECRET on Server
Your server is using a different JWT_SECRET than when you logged in.

**Check:**
```bash
node -e "require('dotenv').config(); console.log('JWT_SECRET:', process.env.JWT_SECRET)"
```

### Cause 3: Token from Different Server
You got the token from a different server/environment.

**Solution:** Login again on THIS server.

### Cause 4: Corrupted Token
Token got corrupted when copying/pasting.

**Check:**
- No extra spaces
- No line breaks
- Complete token (should be ~150-200 characters)
- Format: `eyJ...` (starts with "eyJ")

---

## 🧪 Test Your Setup

### Test 1: Check JWT_SECRET
```bash
node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET)"
```

**Expected:** Should print your JWT secret (51 characters)

### Test 2: Test JWT Flow
```bash
node test-jwt-flow.js
```

**Expected:** Should show "JWT Flow is working correctly!"

### Test 3: Get Fresh Token
```bash
node get-fresh-token.js
```

**Expected:** Should print a valid token

### Test 4: Test with Fresh Token
```bash
# Get token from step 3, then:
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** Should return your user data

---

## 📋 Step-by-Step Fix

1. **Stop your server** (Ctrl+C)

2. **Check .env file:**
```env
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
```

3. **Restart server:**
```bash
yarn dev
```

4. **Get fresh token:**
```bash
node get-fresh-token.js
```

5. **Copy the token and test:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <paste-token-here>"
```

6. **If it works:** Use this token! ✅

7. **If it still fails:** Check the debug logs in your server terminal

---

## 🔧 Common Mistakes

### ❌ Wrong: Using old token
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6... (OLD TOKEN)
```

### ✅ Correct: Get new token from login
```javascript
// 1. Login
POST /api/auth/login
{
  "email": "snow@example.com",
  "password": "password123"
}

// 2. Get token from response
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..." // ✅ USE THIS
  }
}

// 3. Use in requests
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

---

## ⚠️ Important Notes

1. **Tokens are tied to JWT_SECRET**
   - If JWT_SECRET changes, ALL old tokens become invalid

2. **Token format**
   - Should start with `eyJ`
   - ~150-200 characters long
   - No spaces or line breaks

3. **Where tokens come from**
   - Login: `POST /api/auth/login`
   - Register: `POST /api/auth/register`
   - Both return a `token` field

4. **How to use tokens**
   ```
   Authorization: Bearer <token>
   ```
   - Note the space after "Bearer"
   - No quotes around token

---

## 🆘 Still Not Working?

### Check Server Logs

When you make a request, you should see in server terminal:
```
🔍 Token received (first 20 chars): eyJhbGciOiJIUzI1NiIs...
🔍 Token length: 171
🔍 Token algorithm: HS256
```

If you see:
```
❌ Auth middleware error: JsonWebTokenError - invalid algorithm
💡 Hint: The token was created with a different JWT_SECRET or is corrupted.
```

**This means:** You MUST get a new token.

### Fresh Start

1. Stop server
2. Delete old tokens
3. Run: `node get-fresh-token.js`
4. Copy new token
5. Test with new token

---

## ✅ Summary

**The token you're using is INVALID.**

**Fix:** Get a new token by:
1. Running `node get-fresh-token.js`, OR
2. Calling `POST /api/auth/login` again

**Then use the NEW token in your requests!**

