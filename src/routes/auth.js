const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateMe 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, upload.single('avatar'), handleMulterError, updateMe);

module.exports = router;

