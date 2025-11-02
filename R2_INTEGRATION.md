# Cloudflare R2 Integration Guide

## Overview

The SnowHub API now works with **Cloudflare R2** direct uploads. The frontend uploads files directly to R2, and the backend only receives and stores **filenames**.

---

## ✅ What Changed

### Removed:
- ❌ Multer file upload middleware
- ❌ Cloudinary upload handling
- ❌ File processing on backend
- ❌ FormData parsing for file uploads

### Added:
- ✅ JSON-only API endpoints
- ✅ Filename validation
- ✅ Strict type checking
- ✅ Better validation messages

---

## 📋 API Documentation

### POST /api/posts (Create Post)

**Request Type:** `application/json` (NOT FormData)

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Epic Powder Day at Whistler! ❄️⛷️",
  "content": "The conditions were absolutely perfect today. Fresh powder, blue skies, and perfect temperature. The tree runs were absolutely magical!",
  "tag": "Skiing",
  "location": "Whistler Blackcomb, BC",
  "image": "user_123_20241102_143025_abc123def.jpg"
}
```

**Field Specifications:**
- `title` (string, required): 3-100 characters
- `content` (string, required): 10+ characters  
- `tag` (string, optional): Category (Skiing, Snowboarding, Gear, Resort, Backcountry, Other)
- `location` (string, optional): Location name
- `image` (string, required): **Filename only** (already uploaded to R2)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "_id": "post_abc123",
    "title": "Epic Powder Day at Whistler! ❄️⛷️",
    "content": "The conditions were absolutely perfect today...",
    "tag": "Skiing",
    "location": "Whistler Blackcomb, BC",
    "image": "user_123_20241102_143025_abc123def.jpg",
    "author": {
      "_id": "user_123",
      "username": "SkiPro",
      "avatar": "avatar_filename.jpg"
    },
    "likes": [],
    "likeCount": 0,
    "commentCount": 0,
    "views": 0,
    "createdAt": "2024-11-02T14:30:25.000Z",
    "updatedAt": "2024-11-02T14:30:25.000Z"
  }
}
```

**Error Responses:**

400 Bad Request - Missing fields:
```json
{
  "success": false,
  "message": "Title, content, and image are required"
}
```

400 Bad Request - Invalid types:
```json
{
  "success": false,
  "message": "Invalid data types"
}
```

400 Bad Request - Validation error:
```json
{
  "success": false,
  "message": "Title must be between 3 and 100 characters"
}
```

401 Unauthorized - No/invalid token:
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

---

### PUT /api/posts/:id (Update Post)

**Request Type:** `application/json`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "content": "Updated content here...",
  "tag": "Snowboarding",
  "location": "Updated Location",
  "image": "new_image_filename.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "_id": "post_abc123",
    "title": "Updated Title",
    "content": "Updated content here...",
    "image": "new_image_filename.jpg",
    ...
  }
}
```

**Error Responses:**

403 Forbidden - Not the author:
```json
{
  "success": false,
  "message": "Not authorized to update this post"
}
```

404 Not Found:
```json
{
  "success": false,
  "message": "Post not found"
}
```

---

### PUT /api/auth/me (Update Profile)

**Request Type:** `application/json`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "username": "newusername",
  "email": "newemail@example.com",
  "bio": "Updated bio text here...",
  "avatar": "avatar_filename.jpg",
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Field Specifications:**
- `username` (string, optional): 3-30 characters
- `email` (string, optional): Valid email format
- `bio` (string, optional): Max 200 characters
- `avatar` (string, optional): **Filename only** (already uploaded to R2)
- `currentPassword` (string, required if changing password): Current password
- `newPassword` (string, required if changing password): New password (min 6 chars)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "user_123",
    "username": "newusername",
    "email": "newemail@example.com",
    "bio": "Updated bio text here...",
    "avatar": "avatar_filename.jpg",
    "followers": [],
    "following": [],
    "createdAt": "2024-11-01T10:00:00.000Z",
    "updatedAt": "2024-11-02T14:30:25.000Z"
  }
}
```

**Error Responses:**

400 Bad Request - Username taken:
```json
{
  "success": false,
  "message": "Username already taken"
}
```

401 Unauthorized - Wrong password:
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

## 🔄 Frontend Integration Flow

### Creating a Post:

1. **User selects image** in frontend
2. **Frontend uploads to R2** directly
3. **R2 returns filename** (e.g., `user_123_20241102_143025.jpg`)
4. **Frontend sends JSON** to backend:
   ```javascript
   const response = await fetch('/api/posts', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       title: 'My Post',
       content: 'Post content...',
       image: 'user_123_20241102_143025.jpg', // Filename from R2
       tag: 'Skiing',
       location: 'Whistler'
     })
   });
   ```

### Displaying Images:

The backend stores only filenames. Frontend constructs full URLs:

```javascript
const R2_PUBLIC_URL = 'https://your-r2-bucket.r2.cloudflarestorage.com';

// Post image
const imageUrl = `${R2_PUBLIC_URL}/${post.image}`;

// User avatar
const avatarUrl = `${R2_PUBLIC_URL}/${user.avatar}`;
```

---

## 🧪 Testing

### Test POST /api/posts:

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "content": "This is a test post with R2 integration",
    "image": "test_image_123.jpg",
    "tag": "Skiing",
    "location": "Test Resort"
  }'
```

### Test PUT /api/auth/me:

```bash
curl -X PUT http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "bio": "Updated bio",
    "avatar": "avatar_123.jpg"
  }'
```

---

## ⚠️ Important Notes

1. **No File Upload Middleware**: Routes no longer use `multer` or file upload middleware
2. **JSON Only**: All requests must send `Content-Type: application/json`
3. **Filename Validation**: Backend validates that `image` and `avatar` are strings
4. **R2 Responsibility**: Frontend is responsible for uploading to R2 before calling API
5. **Full URLs**: Frontend constructs full R2 URLs for displaying images

---

## 🔒 Security Considerations

1. **Filename Validation**: Backend validates filenames are strings (no path traversal)
2. **Authorization**: All create/update endpoints require valid JWT
3. **Ownership Checks**: Users can only update their own posts/profile
4. **Input Sanitization**: All strings are trimmed and validated

---

## 📝 Migration Checklist

- [x] Remove multer middleware from routes
- [x] Update POST /api/posts to accept JSON
- [x] Update PUT /api/posts/:id to accept JSON
- [x] Update PUT /api/auth/me to accept JSON
- [x] Remove Cloudinary upload code
- [x] Add filename validation
- [x] Update error messages
- [x] Test all endpoints

---

## 🚀 Deployment

No additional environment variables needed! The backend no longer needs:
- ❌ CLOUDINARY_CLOUD_NAME
- ❌ CLOUDINARY_API_KEY  
- ❌ CLOUDINARY_API_SECRET

(You can keep them for backward compatibility, but they're not used)

---

## 📞 Support

If you encounter issues:
1. Verify `Content-Type: application/json` header is set
2. Check JWT token is valid and not expired
3. Ensure `image`/`avatar` fields contain filenames (strings)
4. Verify file was uploaded to R2 successfully before API call

