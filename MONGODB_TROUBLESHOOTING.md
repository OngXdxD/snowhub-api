# MongoDB Connection Troubleshooting Guide

## 🔴 Error: queryTxt ETIMEOUT

This error means MongoDB connection is timing out after a few minutes of inactivity.

---

## ✅ What I Fixed

Updated `src/config/db.js` with:

1. **Connection Pooling**
   - `maxPoolSize: 10` - Keep up to 10 connections alive
   - `minPoolSize: 2` - Always maintain 2 connections

2. **Timeout Settings**
   - `serverSelectionTimeoutMS: 5000` - Fail fast (5s instead of 30s)
   - `socketTimeoutMS: 45000` - Close idle sockets after 45s
   - `maxIdleTimeMS: 10000` - Remove idle connections after 10s

3. **Retry Logic**
   - Automatically retry connection on timeout
   - Wait 5 seconds between retries

4. **Better Event Handling**
   - Log disconnections
   - Log reconnections
   - Auto-reconnect on connection loss

---

## 🔍 Common Causes

### 1. **MongoDB Atlas Free Tier Auto-Pause**
MongoDB Atlas free tier (M0) pauses clusters after 60 minutes of inactivity.

**Solution:**
- Upgrade to M2+ tier (paid)
- Or accept the pause behavior (connection will resume on next request)

### 2. **Network/Firewall Issues**
Your network or firewall blocks MongoDB connections.

**Check:**
```bash
# Test DNS resolution
nslookup cluster0.6hvhvy0.mongodb.net

# Test connection
ping cluster0.6hvhvy0.mongodb.net
```

**Solution:**
- Check firewall settings
- Whitelist IP address in MongoDB Atlas
- Use VPN if network blocks MongoDB

### 3. **IP Whitelist in MongoDB Atlas**
Your IP address changed or isn't whitelisted.

**Solution:**
1. Go to MongoDB Atlas Dashboard
2. Network Access → IP Access List
3. Add your current IP or use `0.0.0.0/0` for testing (NOT production!)

### 4. **Connection String Issues**
Wrong connection string or missing parameters.

**Check your `.env`:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.6hvhvy0.mongodb.net/snowhub?retryWrites=true&w=majority
```

**Common mistakes:**
- ❌ Wrong password
- ❌ Wrong database name
- ❌ Missing `?retryWrites=true`
- ❌ Using `mongodb://` instead of `mongodb+srv://`

---

## 🧪 Test Your Connection

### 1. Test DNS Resolution
```bash
node -e "require('dns').lookup('cluster0.6hvhvy0.mongodb.net', console.log)"
```

**Expected:** Should resolve to IP addresses

### 2. Test MongoDB Connection
Create `test-mongo.js`:
```javascript
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('URI:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':***@'));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Connection successful!');
    console.log('Host:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
```

Run: `node test-mongo.js`

---

## 🔧 Quick Fixes

### Fix 1: Add IP to Whitelist (MongoDB Atlas)

1. Go to https://cloud.mongodb.com
2. Select your cluster
3. Click "Network Access" (left sidebar)
4. Click "Add IP Address"
5. Click "Allow Access from Anywhere" (for testing)
6. Or add your current IP

### Fix 2: Check Password Special Characters

If your password has special characters, URL encode them:

**Original:** `P@ssw0rd!`  
**Encoded:** `P%40ssw0rd%21`

Use this in your connection string:
```
mongodb+srv://user:P%40ssw0rd%21@cluster...
```

### Fix 3: Update Connection String

Make sure you're using `mongodb+srv://` (SRV record):

```env
# ✅ CORRECT
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxx.mongodb.net/dbname?retryWrites=true&w=majority

# ❌ WRONG
MONGODB_URI=mongodb://user:pass@cluster0.xxx.mongodb.net/dbname
```

### Fix 4: Restart Your Server

Sometimes it's just a stale connection:
```bash
# Stop server (Ctrl+C)
# Clear node modules cache
rm -rf node_modules/.cache

# Restart
yarn dev
```

---

## 🚨 If Problem Persists

### Option 1: Use Local MongoDB (Development)

Install MongoDB locally:
```bash
# Windows (with Chocolatey)
choco install mongodb

# Or download from: https://www.mongodb.com/try/download/community
```

Update `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/snowhub
```

### Option 2: Check MongoDB Atlas Status

Visit: https://status.mongodb.com/

Check if MongoDB Atlas has any outages.

### Option 3: Check Logs in MongoDB Atlas

1. Go to MongoDB Atlas Dashboard
2. Select Cluster → Metrics
3. Check "Connections" graph
4. Look for connection spikes or errors

---

## 📊 Monitor Connection Health

Add this endpoint to monitor MongoDB status:

```javascript
// In src/server.js or create new route
app.get('/api/health/db', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    database: states[dbState],
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    timestamp: new Date().toISOString()
  });
});
```

Test: `http://localhost:5000/api/health/db`

---

## 🎯 Best Practices

1. **Use Connection Pooling** (already added in fixed code)
2. **Handle disconnections gracefully** (already added)
3. **Add retry logic** (already added)
4. **Monitor connection health**
5. **Use MongoDB Atlas M2+ tier** for production (no auto-pause)

---

## 📝 After Fixes Applied

The new configuration will:
- ✅ Automatically retry on timeout
- ✅ Maintain connection pool
- ✅ Reconnect on disconnection
- ✅ Fail fast (5s timeout instead of 30s)
- ✅ Log connection status changes

**Your server will now handle MongoDB timeouts gracefully!**

---

## 💡 Need Help?

1. Check MongoDB Atlas status
2. Verify IP whitelist
3. Test connection string
4. Check firewall/network
5. Consider local MongoDB for development

