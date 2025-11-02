const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret || secret.trim().length === 0) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  if (secret.length < 32) {
    console.warn('⚠️  Warning: JWT_SECRET should be at least 32 characters long for security');
  }
  
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: userExists.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      bio: bio || ''
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          followers: user.followers,
          following: user.following,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          followers: user.followers,
          following: user.following,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateMe = async (req, res) => {
  try {
    const { username, email, bio, avatar, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update basic fields
    if (username) {
      // Validate username
      if (typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 30) {
        return res.status(400).json({
          success: false,
          message: 'Username must be between 3 and 30 characters'
        });
      }

      // Check if username is taken by another user
      const existingUser = await User.findOne({ 
        username: username.trim(), 
        _id: { $ne: user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
      user.username = username.trim();
    }

    if (email) {
      // Validate email format
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (typeof email !== 'string' || !emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email address'
        });
      }

      // Check if email is taken by another user
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      user.email = email.toLowerCase().trim();
    }

    if (bio !== undefined) {
      if (typeof bio !== 'string' || bio.length > 200) {
        return res.status(400).json({
          success: false,
          message: 'Bio cannot exceed 200 characters'
        });
      }
      user.bio = bio.trim();
    }

    // Handle avatar update - avatar is just a filename (already uploaded to R2)
    if (avatar) {
      if (typeof avatar !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid avatar filename'
        });
      }
      user.avatar = avatar.trim();
    }

    // Handle password change
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      user.password = newPassword;
    }

    await user.save();

    // Get updated user without password
    const updatedUser = await User.findById(user._id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

