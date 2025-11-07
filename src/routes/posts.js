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
  addComment,
  getPostCategorySummary
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllPosts);
router.get('/categories', getPostCategorySummary);
router.get('/:id', getPost);
router.get('/:id/comments', getPostComments);

// Protected routes - accepts JSON (no file upload middleware)
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comments', protect, addComment);

module.exports = router;
