# SnowHub API Testing Guide

This guide will help you test all the endpoints of the SnowHub API.

## Prerequisites

1. Server is running on `http://localhost:5000`
2. MongoDB is connected
3. Cloudinary is configured (for image uploads)

## Testing Flow

### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "bio": "Test user bio"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token** - You'll need it for authenticated requests!

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Get Current User (Protected)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Create a Post (Protected)

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "title=Epic Powder Day" \
  -F "content=Had an amazing day at the resort!" \
  -F "tag=Skiing" \
  -F "location=Whistler, BC" \
  -F "image=@/path/to/your/image.jpg"
```

**Note:** Replace `/path/to/your/image.jpg` with an actual image path.

**Save the post ID** from the response!

### 5. Get All Posts

```bash
# Basic request
curl -X GET http://localhost:5000/api/posts

# With pagination
curl -X GET "http://localhost:5000/api/posts?page=1&limit=10"

# Filter by tag
curl -X GET "http://localhost:5000/api/posts?tag=Skiing"

# Sort by popular
curl -X GET "http://localhost:5000/api/posts?sort=popular"

# Search
curl -X GET "http://localhost:5000/api/posts?search=powder"
```

### 6. Get Single Post

```bash
curl -X GET http://localhost:5000/api/posts/POST_ID_HERE
```

### 7. Like a Post (Protected)

```bash
curl -X POST http://localhost:5000/api/posts/POST_ID_HERE/like \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 8. Add Comment to Post (Protected)

```bash
curl -X POST http://localhost:5000/api/posts/POST_ID_HERE/comments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Amazing shot! Where is this?"
  }'
```

**Save the comment ID** from the response!

### 9. Get Post Comments

```bash
curl -X GET "http://localhost:5000/api/posts/POST_ID_HERE/comments?page=1&limit=20"
```

### 10. Update Comment (Protected)

```bash
curl -X PUT http://localhost:5000/api/comments/COMMENT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Updated comment text"
  }'
```

### 11. Delete Comment (Protected)

```bash
curl -X DELETE http://localhost:5000/api/comments/COMMENT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 12. Update Post (Protected)

```bash
curl -X PUT http://localhost:5000/api/posts/POST_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "title=Updated Title" \
  -F "content=Updated content"
```

### 13. Get User Profile

```bash
curl -X GET http://localhost:5000/api/users/USER_ID_HERE
```

### 14. Get User's Posts

```bash
curl -X GET "http://localhost:5000/api/users/USER_ID_HERE/posts?page=1&limit=10"
```

### 15. Follow User (Protected)

First, register another user, then:

```bash
curl -X POST http://localhost:5000/api/users/OTHER_USER_ID/follow \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 16. Get Followers

```bash
curl -X GET "http://localhost:5000/api/users/USER_ID_HERE/followers?page=1&limit=20"
```

### 17. Get Following

```bash
curl -X GET "http://localhost:5000/api/users/USER_ID_HERE/following?page=1&limit=20"
```

### 18. Update Profile (Protected)

```bash
# Without image
curl -X PUT http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "username=newusername" \
  -F "bio=Updated bio"

# With avatar image
curl -X PUT http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "username=newusername" \
  -F "bio=Updated bio" \
  -F "avatar=@/path/to/avatar.jpg"

# Change password
curl -X PUT http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "currentPassword=password123" \
  -F "newPassword=newpassword456"
```

### 19. Delete Post (Protected)

```bash
curl -X DELETE http://localhost:5000/api/posts/POST_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 20. Health Check

```bash
curl -X GET http://localhost:5000/api/health
```

## Using Postman

If you prefer using Postman:

1. **Set up Environment Variables:**
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: (will be set after login)

2. **Authorization:**
   - For protected routes, go to Authorization tab
   - Select "Bearer Token"
   - Enter your token

3. **File Uploads:**
   - Use "Body" tab
   - Select "form-data"
   - For file fields, hover over the key input and select "File" from dropdown
   - Choose your image file

## Common Response Codes

- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation error)
- `401`: Unauthorized (no token or invalid token)
- `403`: Forbidden (not authorized for this action)
- `404`: Not found
- `429`: Too many requests (rate limit exceeded)
- `500`: Server error

## Testing Tips

1. **Save IDs:** Keep track of user IDs, post IDs, and comment IDs from responses
2. **Token Management:** Store your JWT token and use it for all protected routes
3. **Image Files:** Prepare some test images (JPEG, PNG, etc.) for post and avatar uploads
4. **Multiple Users:** Create multiple users to test follow/unfollow functionality
5. **Rate Limiting:** If you hit rate limits, wait 15 minutes or restart the server

## Example Complete Flow

1. Register user A
2. Login as user A (get token A)
3. Create post 1 as user A
4. Register user B
5. Login as user B (get token B)
6. User B likes post 1
7. User B comments on post 1
8. User B follows user A
9. Get user A's followers (should see user B)
10. User A updates their profile
11. Get all posts (should see post 1)
12. User A deletes post 1

Happy testing! 🏔️⛷️

