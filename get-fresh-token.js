require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./src/models/User');

console.log('\n🔑 Get Fresh JWT Token\n');
console.log('======================\n');

async function getFreshToken() {
  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected!\n');

    // Find a user (or use specific email)
    const email = process.argv[2] || 'snow@example.com';
    console.log('👤 Looking for user:', email);
    
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found!');
      console.log('\n💡 Available options:');
      console.log('   1. Create a user via POST /api/auth/register');
      console.log('   2. Run: yarn seed (to populate sample users)');
      console.log('   3. Specify different email: node get-fresh-token.js your@email.com\n');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('✅ User found:', user.username);
    console.log('   ID:', user._id);
    console.log('   Email:', user.email);

    // Generate fresh token with current JWT_SECRET
    console.log('\n🔐 Generating fresh token...');
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    console.log('✅ Token generated!\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('YOUR FRESH TOKEN (copy this):');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(token);
    console.log('\n═══════════════════════════════════════════════════════════════\n');

    // Verify it works
    console.log('🧪 Verifying token works...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified successfully!');
    console.log('   User ID:', decoded.id);
    console.log('   Expires:', new Date(decoded.exp * 1000).toLocaleString());

    console.log('\n📋 How to use:\n');
    console.log('1. Copy the token above');
    console.log('2. In Postman/Thunder Client/curl, set header:');
    console.log('   Authorization: Bearer <paste-token-here>\n');
    console.log('3. Make request to protected endpoint like:');
    console.log('   POST http://localhost:5000/api/posts\n');

    console.log('🔒 Password for this user: password123\n');
    console.log('Or use login endpoint:');
    console.log('POST http://localhost:5000/api/auth/login');
    console.log(`{
  "email": "${user.email}",
  "password": "password123"
}\n`);

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

getFreshToken();

