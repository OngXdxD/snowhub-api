# SnowHub API

A RESTful API backend for SnowHub, a winter sports social sharing platform. Share your skiing and snowboarding adventures with the community!

## 🏔️ Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Post Management**: Create, read, update, and delete posts with image uploads
- **Social Features**: Follow/unfollow users, like posts, and comment
- **Image Upload**: Cloudinary integration for image storage
- **Pagination**: Efficient data loading with pagination support
- **Filtering & Sorting**: Filter posts by tag, author, search terms, and sort by various criteria
- **Security**: Helmet for security headers, rate limiting, CORS support

## 🚀 Technology Stack

- **Runtime**: Node.js (v20.19+ or v22.12+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Image Storage**: Cloudinary
- **Security**: bcrypt, helmet, express-rate-limit

## 📁 Project Structure

```
snowhub-api/
├── src/
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Comment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── posts.js
│   │   ├── users.js
│   │   └── comments.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── userController.js
│   │   └── commentController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd snowhub-api
   ```

2. **Install dependencies**
   
   This project uses **Yarn** as the package manager:
   ```bash
   yarn install
   # or simply
   yarn
   ```
   
   > 💡 **Note**: See [YARN_GUIDE.md](YARN_GUIDE.md) for comprehensive Yarn usage and commands

3. **Set up environment variables**
   
   Create a `.env` file in the root directory and copy the contents from `.env.example`:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

4. **Set up MongoDB**
   
   You can use either:
   - **Local MongoDB**: Install MongoDB locally and use `mongodb://localhost:27017/snowhub`
   - **MongoDB Atlas**: Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

5. **Set up Cloudinary**
   
   Create a free account at [cloudinary.com](https://cloudinary.com) and get your credentials from the dashboard.

## 🏃 Running the Application

**Development mode** (with auto-restart):
```bash
yarn dev
```

**Production mode**:
```bash
yarn start
```

The server will start on `http://localhost:5000` (or the PORT specified in your .env file).

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Routes (`/api/auth`)

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "bio": "Passionate skier from Colorado"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Current User Profile (Protected)
```http
PUT /api/auth/me
Authorization: Bearer <token>
Content-Type: multipart/form-data

username: johndoe
bio: Updated bio
avatar: <file>
currentPassword: oldpassword
newPassword: newpassword
```

### Post Routes (`/api/posts`)

#### Get All Posts
```http
GET /api/posts?page=1&limit=10&tag=Skiing&sort=popular&search=powder
```

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `tag`: Filter by tag (Skiing, Snowboarding, Gear, Resort, Backcountry, Other)
- `author`: Filter by author ID
- `sort`: Sort by (newest, oldest, popular, views)
- `search`: Search in title and content

#### Get Single Post
```http
GET /api/posts/:id
```

#### Create New Post (Protected)
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: Epic Powder Day
content: Had an amazing day at the resort!
image: <file>
tag: Skiing
location: Whistler, BC
```

#### Update Post (Protected, Author Only)
```http
PUT /api/posts/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: Updated title
content: Updated content
```

#### Delete Post (Protected, Author Only)
```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

#### Like/Unlike Post (Protected)
```http
POST /api/posts/:id/like
Authorization: Bearer <token>
```

#### Get Post Comments
```http
GET /api/posts/:id/comments?page=1&limit=20
```

#### Add Comment to Post (Protected)
```http
POST /api/posts/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Amazing shot! Where is this?"
}
```

### User Routes (`/api/users`)

#### Get User Profile
```http
GET /api/users/:id
```

#### Get User's Posts
```http
GET /api/users/:id/posts?page=1&limit=10
```

#### Follow/Unfollow User (Protected)
```http
POST /api/users/:id/follow
Authorization: Bearer <token>
```

#### Get User's Followers
```http
GET /api/users/:id/followers?page=1&limit=20
```

#### Get Users Being Followed
```http
GET /api/users/:id/following?page=1&limit=20
```

### Comment Routes (`/api/comments`)

#### Update Comment (Protected, Author Only)
```http
PUT /api/comments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Updated comment text"
}
```

#### Delete Comment (Protected, Author Only)
```http
DELETE /api/comments/:id
Authorization: Bearer <token>
```

### Health Check
```http
GET /api/health
```

## 🔒 Security Features

- **Password Hashing**: Uses bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Helmet**: Sets various HTTP headers for security
- **Rate Limiting**: Prevents abuse with request rate limiting
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Mongoose schema validation
- **File Upload Limits**: 5MB max file size

## 📊 Database Models

### User Model
- username (unique, required)
- email (unique, required)
- password (hashed, required)
- avatar (URL)
- bio
- followers (array of User IDs)
- following (array of User IDs)
- timestamps

### Post Model
- title (required)
- content (required)
- image (URL, required)
- author (User ID, required)
- tag (enum)
- location
- likes (array of User IDs)
- likeCount
- commentCount
- views
- timestamps

### Comment Model
- post (Post ID, required)
- author (User ID, required)
- text (required)
- timestamps

## 🧪 Testing

You can test the API using tools like:
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Thunder Client](https://www.thunderclient.com/) (VS Code extension)
- cURL

## 🚀 Deployment

### Environment Variables for Production

Make sure to set these in your production environment:
- `NODE_ENV=production`
- `MONGODB_URI`: Production MongoDB URI
- `JWT_SECRET`: Strong, unique secret key
- `CORS_ORIGIN`: Your frontend domain(s)
- Cloudinary credentials

### Recommended Platforms

- **Render**: [render.com](https://render.com)
- **Railway**: [railway.app](https://railway.app)
- **Heroku**: [heroku.com](https://heroku.com)
- **AWS**: Amazon Web Services
- **DigitalOcean**: [digitalocean.com](https://digitalocean.com)

## 📝 License

ISC

## 👨‍💻 Author

Created for SnowHub - Winter Sports Social Platform

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show Your Support

Give a ⭐️ if you like this project!

