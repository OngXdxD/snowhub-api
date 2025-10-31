# SnowHub API - Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Install dependencies
yarn install
# or simply
yarn

# Create environment file
cp env.example .env
# Then edit .env with your configuration

# Start development server
yarn dev

# Start production server
yarn start
```

## 🔑 Required Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/snowhub
JWT_SECRET=your_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📡 Base URL

```
Local: http://localhost:5000/api
```

## 🔐 Authentication

Include in headers for protected routes:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📋 Endpoint Quick Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register user |
| POST | `/auth/login` | ❌ | Login user |
| GET | `/auth/me` | ✅ | Get current user |
| PUT | `/auth/me` | ✅ | Update profile |

### Posts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/posts` | ❌ | Get all posts |
| GET | `/posts/:id` | ❌ | Get single post |
| POST | `/posts` | ✅ | Create post |
| PUT | `/posts/:id` | ✅ | Update post |
| DELETE | `/posts/:id` | ✅ | Delete post |
| POST | `/posts/:id/like` | ✅ | Like/unlike post |
| GET | `/posts/:id/comments` | ❌ | Get comments |
| POST | `/posts/:id/comments` | ✅ | Add comment |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/:id` | ❌ | Get user profile |
| GET | `/users/:id/posts` | ❌ | Get user's posts |
| POST | `/users/:id/follow` | ✅ | Follow/unfollow |
| GET | `/users/:id/followers` | ❌ | Get followers |
| GET | `/users/:id/following` | ❌ | Get following |

### Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/comments/:id` | ✅ | Update comment |
| DELETE | `/comments/:id` | ✅ | Delete comment |

## 📊 Query Parameters

### Get All Posts
```
?page=1              # Page number
&limit=10            # Items per page
&tag=Skiing          # Filter by tag
&author=USER_ID      # Filter by author
&sort=popular        # Sort (newest, oldest, popular, views)
&search=powder       # Search in title/content
```

## 📤 Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user","email":"user@test.com","password":"pass123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'
```

### Create Post (with image)
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer TOKEN" \
  -F "title=Epic Day" \
  -F "content=Amazing powder!" \
  -F "tag=Skiing" \
  -F "image=@photo.jpg"
```

### Like Post
```bash
curl -X POST http://localhost:5000/api/posts/POST_ID/like \
  -H "Authorization: Bearer TOKEN"
```

## 📦 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 50,
      "limit": 10
    }
  }
}
```

## 🏷️ Post Tags

Available tags:
- `Skiing`
- `Snowboarding`
- `Gear`
- `Resort`
- `Backcountry`
- `Other`

## 📁 File Upload

### Supported Formats
- JPEG / JPG
- PNG
- GIF
- WEBP

### Limits
- Max size: 5 MB
- Optimized to: 1200x1200px
- Auto quality optimization

### Upload Fields
- Posts: `image` (required)
- Profile: `avatar` (optional)

## 🔒 Security

### Rate Limits
- General API: 100 requests / 15 min
- Auth routes: 5 requests / 15 min

### Password Requirements
- Minimum length: 6 characters
- Hashed with bcrypt

### JWT Token
- Default expiry: 30 days
- Include in Authorization header
- Format: `Bearer TOKEN`

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Connection refused | Check if server is running |
| 401 Unauthorized | Include valid JWT token |
| 404 Not found | Verify endpoint URL |
| 413 Payload too large | Reduce image file size |
| 429 Too many requests | Wait 15 minutes or restart server |

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Complete documentation |
| `SETUP.md` | Setup instructions |
| `API_TESTING_GUIDE.md` | Testing guide |
| `DEPLOYMENT.md` | Deployment guide |
| `PROJECT_SUMMARY.md` | Project overview |
| `QUICK_REFERENCE.md` | This file |

## 🛠️ Development Tips

### Check Server Status
```bash
curl http://localhost:5000/api/health
```

### View Logs (Development)
Server logs appear in terminal where `yarn dev` is running

### Test with Postman
Import `POSTMAN_COLLECTION.json` for ready-to-use requests

### Database GUI
Use [MongoDB Compass](https://www.mongodb.com/products/compass) to view data

### Image Storage
View uploads in [Cloudinary Dashboard](https://cloudinary.com/console)

## ⚡ Pro Tips

1. **Save your JWT token** after login/register
2. **Test auth first** before testing protected routes
3. **Use environment variables** for different environments
4. **Enable auto-restart** with nodemon in development
5. **Check logs** for detailed error messages
6. **Use Postman collections** for faster testing
7. **Monitor MongoDB** for data verification
8. **Test file uploads** with small images first
9. **Follow rate limits** when testing
10. **Read error messages** carefully

## 🎯 Testing Workflow

1. Start server: `yarn dev`
2. Register user → Save token
3. Login (if needed) → Save token
4. Create post with image → Save post ID
5. Like the post
6. Add comment → Save comment ID
7. Get all posts (verify your post appears)
8. Update/delete as needed

## 📞 Help

For detailed information, see:
- Setup help: `SETUP.md`
- API details: `README.md`
- Testing: `API_TESTING_GUIDE.md`
- Deployment: `DEPLOYMENT.md`

---

**Keep this file handy for quick reference! 🏔️⛷️**

