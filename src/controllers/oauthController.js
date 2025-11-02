const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Social OAuth login/register (Google, Facebook, etc.)
// @route   POST /api/auth/social-auth
// @access  Public
exports.socialAuth = async (req, res) => {
  try {
    const { email, username, avatar, displayName, uid } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    console.log('🔐 Social auth attempt for:', email);

    // Check if user already exists by email
    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user) {
      // User exists - login
      console.log('✅ Existing user logged in:', user.email);
      
      // Update avatar if provided and different
      if (avatar && avatar !== user.avatar) {
        user.avatar = avatar;
        await user.save();
        console.log('📸 Avatar updated for user:', user.email);
      }
    } else {
      // User doesn't exist - create new user
      console.log('👤 Creating new user via social auth:', email);
      
      // Generate username if not provided
      let finalUsername = username || displayName || email.split('@')[0];
      
      // Ensure username is unique
      let usernameExists = await User.findOne({ username: finalUsername });
      let counter = 1;
      while (usernameExists) {
        finalUsername = `${username || displayName || email.split('@')[0]}_${counter}`;
        usernameExists = await User.findOne({ username: finalUsername });
        counter++;
      }

      // Generate random password (user will use social login)
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      
      user = await User.create({
        username: finalUsername,
        email: email.toLowerCase().trim(),
        password: randomPassword,
        avatar: avatar || '',
        bio: '',
        location: ''
      });

      console.log('✅ New user created:', user.username, '-', user.email);
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data and token
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        followers: user.followers.length,
        following: user.following.length,
        createdAt: user.createdAt
      },
      token: token
    });

  } catch (error) {
    console.error('❌ Social auth error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during social authentication'
    });
  }
};

// @desc    Google OAuth login/register (LEGACY - kept for backward compatibility)
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  // Redirect to socialAuth for consistency
  return exports.socialAuth(req, res);
};

