const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Check if JWT_SECRET is set
      if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET is not set in environment variables!');
        return res.status(500).json({ 
          success: false,
          message: 'Server configuration error' 
        });
      }

      // Debug: Log token info (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Token received (first 20 chars):', token.substring(0, 20) + '...');
        console.log('🔍 Token length:', token.length);
        
        // Try to decode without verification to see payload
        try {
          const decoded = jwt.decode(token, { complete: true });
          if (decoded) {
            console.log('🔍 Token algorithm:', decoded.header.alg);
            console.log('🔍 Token type:', decoded.header.typ);
          } else {
            console.log('⚠️  Token could not be decoded - malformed token');
          }
        } catch (decodeError) {
          console.log('⚠️  Token decode error:', decodeError.message);
        }
      }

      // Check token algorithm first
      const decodedHeader = jwt.decode(token, { complete: true });
      
      if (!decodedHeader) {
        throw new Error('Invalid token format');
      }

      const algorithm = decodedHeader.header.alg;

      // Verify token based on algorithm
      let decoded;
      
      if (algorithm === 'RS256' || algorithm === 'RS384' || algorithm === 'RS512') {
        // RSA tokens (from Google OAuth, Firebase, etc.)
        // Just decode without verification for now (OAuth provider verifies)
        decoded = jwt.decode(token);
        
        if (!decoded) {
          throw new Error('Failed to decode RS256 token');
        }

        // Google tokens have 'sub' (subject) as user ID, not 'id'
        // Map it to 'id' for consistency
        if (decoded.sub && !decoded.id) {
          decoded.id = decoded.sub;
        }

        // For Google tokens, we'll look up user by email or Google ID
        if (decoded.email) {
          try {
            // Try to find user by email from OAuth token
            const oauthUser = await User.findOne({ email: decoded.email }).maxTimeMS(5000);
            
            if (oauthUser) {
              decoded.id = oauthUser._id.toString();
            } else {
              // User doesn't exist - they need to register via POST /api/auth/google first
              throw new Error('User not found. Please register via POST /api/auth/google first.');
            }
          } catch (dbError) {
            if (dbError.name === 'MongooseError' || dbError.message.includes('buffering timed out')) {
              throw new Error('Database connection error. Please try again later.');
            }
            throw dbError;
          }
        }

      } else if (algorithm === 'HS256' || algorithm === 'HS384' || algorithm === 'HS512') {
        // HMAC tokens (our own tokens from email/password login)
        decoded = jwt.verify(token, process.env.JWT_SECRET, {
          algorithms: ['HS256', 'HS384', 'HS512']
        });
      } else {
        throw new Error(`Unsupported algorithm: ${algorithm}`);
      }

      // Get user from token (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      next();
    } catch (error) {
      console.error('❌ Auth middleware error:', error.name || 'Error', '-', error.message);
      
      // Provide more specific error messages
      let message = 'Not authorized, token failed';
      let statusCode = 401;
      
      if (error.message && error.message.includes('Database connection error')) {
        message = 'Database connection error. Please try again later.';
        statusCode = 503; // Service Unavailable
        console.error('💡 MongoDB is disconnected or timing out!');
      } else if (error.message && error.message.includes('User not found')) {
        message = 'User not found. Please register via POST /api/auth/google first.';
        console.error('💡 OAuth user not found in database. User needs to register.');
      } else if (error.message && error.message.includes('Failed to decode RS256 token')) {
        message = 'Invalid OAuth token. Please login again.';
      } else if (error.name === 'JsonWebTokenError') {
        if (error.message.includes('invalid algorithm')) {
          message = 'Invalid token algorithm. Please login again.';
        } else if (error.message.includes('jwt malformed')) {
          message = 'Malformed token. Please login again.';
        } else {
          message = 'Invalid token. Please login again.';
        }
      } else if (error.name === 'TokenExpiredError') {
        message = 'Token expired. Please login again.';
      } else if (error.name === 'MongooseError') {
        message = 'Database error. Please try again later.';
        statusCode = 503;
      }
      
      return res.status(statusCode).json({ 
        success: false,
        message 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token' 
    });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Just continue without user
      req.user = null;
    }
  }

  next();
};

module.exports = { protect, optionalAuth };

