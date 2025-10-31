const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getPostComments,
  addComment
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

// Public routes
router.get('/', getAllPosts);
router.get('/:id', getPost);
router.get('/:id/comments', getPostComments);

// Protected routes
router.post('/', protect, upload.single('image'), handleMulterError, createPost);
router.put('/:id', protect, upload.single('image'), handleMulterError, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comments', protect, addComment);

module.exports = router;

