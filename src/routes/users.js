const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getUserPosts,
  followUser,
  getFollowers,
  getFollowing,
  bookmarkPost,
  getBookmarks
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes (optionalAuth allows checking if user is following)
router.get('/:id', optionalAuth, getUserProfile);
router.get('/:id/posts', getUserPosts);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// Protected routes
router.post('/:id/follow', protect, followUser);
router.post('/:id/bookmark/:postId', protect, bookmarkPost); // Bookmark/unbookmark post
router.get('/:id/bookmarks', protect, getBookmarks); // Get user's bookmarks

module.exports = router;

