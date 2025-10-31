# Database Seeding

This directory contains scripts to populate your MongoDB database with sample data.

## Usage

### Seed the Database

To populate your database with sample data, run:

```bash
yarn seed
```

Or:

```bash
npm run seed
```

## What Gets Created

The seed script will create:

### 👥 **5 Sample Users**
- `snow@example.com` - snowrider
- `board@example.com` - boardmaster
- `powder@example.com` - powderhunter
- `alpine@example.com` - alpineadventurer
- `resort@example.com` - resortpro

**All users have the password:** `password123`

### 📝 **8 Sample Posts**
Posts covering various topics:
- Skiing experiences
- Snowboarding content
- Gear reviews
- Resort visits
- Backcountry adventures

### 💬 **Random Comments**
Each post gets 1-5 random comments from users

### ❤️ **Social Interactions**
- Random likes on posts
- Follow/follower relationships between users

## Warning

⚠️ **This script will delete all existing data** in the User, Post, and Comment collections before seeding!

Only run this on:
- Development databases
- New/empty databases
- When you want to reset your data

**Never run this on production databases!**

## Configuration

The script uses your `.env` file to connect to MongoDB:
```
MONGODB_URI=mongodb://localhost:27017/snowhub
```

Make sure your `.env` file is properly configured before running the seed script.

## Sample Data Details

- **Users**: Come with avatars, bios, and pre-configured follow relationships
- **Posts**: Include realistic titles, content, images (from Unsplash), tags, and locations
- **Comments**: Varied engagement-style comments
- **Likes**: Randomly distributed across posts
- **Views**: Random view counts (50-550 per post)

## Test the Seeded Data

After seeding, you can:

1. **Login** with any of the sample users
2. **Browse posts** at `GET /api/posts`
3. **View user profiles** at `GET /api/users/:id`
4. **Test all API endpoints** with pre-populated data

## Troubleshooting

### Connection Error
If you get a connection error, check:
- MongoDB is running
- `MONGODB_URI` in `.env` is correct
- Database name matches your configuration

### Permission Error
Make sure your MongoDB user has write permissions to the database.

### Duplicate Key Error
This usually means some data already exists. The script should clear existing data, but if it fails, manually delete the collections first.

