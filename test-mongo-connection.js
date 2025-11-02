require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n🔍 MongoDB Connection Test\n');
console.log('========================\n');

// Mask password in URI for display
const maskedUri = process.env.MONGODB_URI 
  ? process.env.MONGODB_URI.replace(/:[^:@]*@/, ':***@')
  : 'NOT SET';

console.log('Connection URI:', maskedUri);
console.log('');

async function testConnection() {
  try {
    console.log('⏳ Attempting to connect...\n');
    
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    const startTime = Date.now();
    await mongoose.connect(process.env.MONGODB_URI, options);
    const endTime = Date.now();

    console.log('✅ Connection Successful!\n');
    console.log('========================\n');
    console.log('📊 Connection Details:');
    console.log('   Host:', mongoose.connection.host);
    console.log('   Database:', mongoose.connection.name);
    console.log('   Port:', mongoose.connection.port || 'N/A');
    console.log('   Connection Time:', `${endTime - startTime}ms`);
    console.log('   Ready State:', mongoose.connection.readyState);
    
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    console.log('   Status:', states[mongoose.connection.readyState]);
    console.log('\n✅ Your MongoDB connection is working!\n');
    
    await mongoose.connection.close();
    console.log('👋 Connection closed gracefully\n');
    process.exit(0);
    
  } catch (error) {
    console.log('❌ Connection Failed!\n');
    console.log('========================\n');
    console.log('Error:', error.message);
    console.log('\n🔧 Possible Solutions:\n');
    
    if (error.message.includes('ETIMEOUT') || error.message.includes('queryTxt ETIMEOUT')) {
      console.log('   1. Check your internet connection');
      console.log('   2. Verify MongoDB cluster is running');
      console.log('   3. Check IP whitelist in MongoDB Atlas');
      console.log('   4. Try using a VPN if network blocks MongoDB');
      console.log('   5. Check firewall settings');
    } else if (error.message.includes('authentication failed')) {
      console.log('   1. Check username/password in MONGODB_URI');
      console.log('   2. URL encode special characters in password');
      console.log('   3. Verify database user exists in MongoDB Atlas');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('   1. Check your internet connection');
      console.log('   2. Verify connection string is correct');
      console.log('   3. Check DNS resolution');
    } else {
      console.log('   1. Check MONGODB_URI in .env file');
      console.log('   2. Verify connection string format');
      console.log('   3. Check MongoDB Atlas cluster status');
    }
    
    console.log('\n📚 See MONGODB_TROUBLESHOOTING.md for detailed help\n');
    process.exit(1);
  }
}

// Test DNS resolution first
console.log('🔍 Testing DNS resolution...\n');

if (process.env.MONGODB_URI) {
  const match = process.env.MONGODB_URI.match(/@([^/]+)/);
  if (match) {
    const host = match[1].split('?')[0];
    require('dns').lookup(host, (err, address) => {
      if (err) {
        console.log('❌ DNS Resolution Failed:', err.message);
        console.log('   This means your network cannot reach MongoDB\n');
      } else {
        console.log('✅ DNS Resolution Successful');
        console.log('   Host:', host);
        console.log('   IP Address:', address);
        console.log('');
      }
      testConnection();
    });
  } else {
    testConnection();
  }
} else {
  console.log('❌ MONGODB_URI not set in .env file!\n');
  process.exit(1);
}

