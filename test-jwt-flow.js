require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('\n🔐 Testing JWT Flow\n');
console.log('==================\n');

const JWT_SECRET = process.env.JWT_SECRET;

console.log('1. JWT_SECRET exists:', !!JWT_SECRET);
console.log('2. JWT_SECRET length:', JWT_SECRET?.length);
console.log('3. JWT_SECRET value:', JWT_SECRET);

console.log('\n📝 Step 1: Generate Token (like login does)\n');

try {
  // Generate token like the login endpoint does
  const userId = '507f1f77bcf86cd799439011'; // Sample user ID
  
  const token = jwt.sign(
    { id: userId }, 
    JWT_SECRET, 
    { expiresIn: '30d' }
  );
  
  console.log('✅ Token generated successfully!');
  console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
  console.log('Token length:', token.length);
  
  console.log('\n📝 Step 2: Verify Token (like auth middleware does)\n');
  
  // Verify token like the auth middleware does
  const decoded = jwt.verify(token, JWT_SECRET);
  
  console.log('✅ Token verified successfully!');
  console.log('Decoded payload:', decoded);
  
  console.log('\n🎉 JWT Flow is working correctly!\n');
  console.log('Your issue is NOT with JWT generation/verification.');
  console.log('The problem is that you are using an OLD token.\n');
  console.log('🔧 Solution: Login again to get a NEW token!\n');
  
} catch (error) {
  console.log('❌ Error:', error.message);
  console.log('\nThis means there IS a problem with JWT!\n');
}

console.log('\n📋 Test with actual login:\n');
console.log('POST http://localhost:5000/api/auth/login');
console.log('Content-Type: application/json\n');
console.log('{');
console.log('  "email": "snow@example.com",');
console.log('  "password": "password123"');
console.log('}\n');
console.log('Copy the token from the response and use it!\n');

