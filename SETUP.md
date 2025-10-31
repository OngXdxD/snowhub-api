# SnowHub API - Quick Setup Guide

Follow these steps to get your SnowHub API up and running quickly.

## Step 1: Prerequisites

Make sure you have the following installed:
- Node.js (v20.19+ or v22.12+)
- npm (comes with Node.js)
- MongoDB (local installation OR MongoDB Atlas account)
- Cloudinary account (free tier is sufficient)

## Step 2: Verify Installation

Check your Node.js and npm versions:

```bash
node --version
npm --version
```

## Step 3: Install Dependencies

Dependencies are already listed in `package.json`. Install them:

```bash
yarn install
# or simply
yarn
```

This will install:
- express
- mongoose
- jsonwebtoken
- bcryptjs
- multer
- cloudinary
- cors
- helmet
- dotenv
- morgan
- express-rate-limit
- express-validator
- nodemon (dev dependency)

## Step 4: Set Up MongoDB

### Option A: Local MongoDB

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   - **Windows**: MongoDB should start automatically as a service
   - **macOS**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

Your connection string will be: `mongodb://localhost:27017/snowhub`

### Option B: MongoDB Atlas (Cloud)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier M0)
4. Click "Connect" and choose "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `myFirstDatabase` with `snowhub`

Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/snowhub?retryWrites=true&w=majority`

## Step 5: Set Up Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. From your dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

## Step 6: Configure Environment Variables

1. Copy the environment template:
   ```bash
   # On Windows (PowerShell)
   Copy-Item env.example .env
   
   # On macOS/Linux
   cp env.example .env
   ```

2. Open `.env` file and update the following:

   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # Database - REPLACE WITH YOUR MONGODB CONNECTION STRING
   MONGODB_URI=mongodb://localhost:27017/snowhub

   # JWT Configuration - REPLACE WITH A STRONG SECRET KEY
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=30d

   # Cloudinary Configuration - REPLACE WITH YOUR CLOUDINARY CREDENTIALS
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # CORS Configuration
   CORS_ORIGIN=*
   ```

### Important: Generate a Strong JWT Secret

Use one of these methods to generate a secure JWT secret:

```bash
# On macOS/Linux
openssl rand -base64 32

# Using Node.js (any platform)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET`.

## Step 7: Start the Server

### Development Mode (with auto-reload)
```bash
yarn dev
```

### Production Mode
```bash
yarn start
```

## Step 8: Verify Installation

1. Check the console output. You should see:
   ```
   ╔══════════════════════════════════════════════════════╗
   ║              🏔️  SnowHub API Server  ⛷️              ║
   ╠══════════════════════════════════════════════════════╣
   ║  Status: Running                                     ║
   ║  Port: 5000                                         ║
   ║  Environment: development                           ║
   ║  Timestamp: ...                                     ║
   ╚══════════════════════════════════════════════════════╝
   
   MongoDB Connected: ...
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:5000/api/health
   ```

   Or visit in browser: `http://localhost:5000/`

   Expected response:
   ```json
   {
     "success": true,
     "message": "SnowHub API is running",
     "timestamp": "2025-10-31T..."
   }
   ```

3. Visit in browser: `http://localhost:5000/`

## Step 9: Test the API

Refer to `API_TESTING_GUIDE.md` for comprehensive testing instructions.

Quick test - Register a user:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "bio": "Test user"
  }'
```

## Common Issues and Solutions

### Issue 1: "Cannot connect to MongoDB"

**Solution:**
- Check if MongoDB is running (local installation)
- Verify your connection string in `.env`
- For Atlas, check if your IP is whitelisted
- Check network connectivity

### Issue 2: "Cloudinary upload failed"

**Solution:**
- Verify Cloudinary credentials in `.env`
- Check if cloud name, API key, and secret are correct
- Ensure no extra spaces in the `.env` file

### Issue 3: "Port 5000 is already in use"

**Solution:**
- Change the PORT in `.env` file to another value (e.g., 5001)
- Or stop the process using port 5000:
  - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
  - macOS/Linux: `lsof -i :5000` then `kill -9 <PID>`

### Issue 4: "Module not found"

**Solution:**
- Delete `node_modules` folder
- Delete `yarn.lock` (if exists)
- Run `yarn install` again

### Issue 5: ".env file not loading"

**Solution:**
- Ensure the file is named exactly `.env` (not `.env.txt`)
- The `.env` file should be in the root directory (same level as `package.json`)
- Restart the server after making changes to `.env`

## Project Structure

After setup, your project should look like this:

```
snowhub-api/
├── node_modules/          # Dependencies (created by npm install)
├── src/
│   ├── config/
│   │   ├── cloudinary.js  # Cloudinary configuration
│   │   └── db.js          # Database connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── commentController.js
│   │   ├── postController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js        # Authentication middleware
│   │   └── upload.js      # File upload middleware
│   ├── models/
│   │   ├── Comment.js
│   │   ├── Post.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── comments.js
│   │   ├── posts.js
│   │   └── users.js
│   └── server.js          # Main application file
├── .env                   # Environment variables (YOU CREATE THIS)
├── .gitignore            # Git ignore rules
├── API_TESTING_GUIDE.md  # API testing documentation
├── env.example           # Environment template
├── package.json          # Project dependencies
├── package-lock.json     # Locked dependency versions
├── README.md             # Main documentation
└── SETUP.md             # This file
```

## Next Steps

1. ✅ Server is running
2. 📖 Read the API documentation in `README.md`
3. 🧪 Test the API using `API_TESTING_GUIDE.md`
4. 🔨 Start building your frontend application
5. 🚀 Deploy to production when ready

## Useful Commands

```bash
# Install dependencies
yarn install
# or simply
yarn

# Start development server (with auto-reload)
yarn dev

# Start production server
yarn start

# Check for outdated packages
yarn outdated

# Update packages
yarn upgrade

# Add a new package
yarn add package-name

# Remove a package
yarn remove package-name
```

## Getting Help

If you encounter any issues:

1. Check the console for error messages
2. Review the `README.md` for API documentation
3. Ensure all environment variables are correctly set
4. Verify MongoDB and Cloudinary connections
5. Check the logs for detailed error information

## Security Checklist for Production

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong, unique value
- [ ] Update `MONGODB_URI` to production database
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `CORS_ORIGIN` (not `*`)
- [ ] Enable MongoDB authentication
- [ ] Use environment variables (don't commit `.env`)
- [ ] Enable HTTPS
- [ ] Set up proper logging
- [ ] Configure rate limiting appropriately
- [ ] Review and update security headers

Happy coding! 🏔️⛷️❄️

