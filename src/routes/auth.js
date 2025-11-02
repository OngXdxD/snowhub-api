const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateMe 
} = require('../controllers/authController');
const { socialAuth, googleAuth } = require('../controllers/oauthController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/social-auth', socialAuth); // Social OAuth login/register (Google, Facebook, etc.)
router.post('/google', googleAuth); // Legacy - redirects to social-auth

// Protected routes - accepts JSON (no file upload middleware)
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;

