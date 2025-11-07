const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Category = require('../models/Category');

const normalizeCategoryName = (name) => {
  if (typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ');
};

const titleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

const resolveCategories = async (categories) => {
  if (!categories) return [];
  if (!Array.isArray(categories)) {
    throw Object.assign(new Error('Categories must be an array of strings'), { statusCode: 400 });
  }

  const normalized = [...new Set(
    categories
      .filter((name) => typeof name === 'string' && name.trim())
      .map((name) => normalizeCategoryName(name))
  )];

  if (!normalized.length) {
    return [];
  }

  const categoryDocs = await Category.find({
    normalizedName: { $in: normalized.map((name) => name.toLowerCase()) }
  });

  if (categoryDocs.length !== normalized.length) {
    const foundNames = categoryDocs.map((cat) => cat.normalizedName);
    const missing = normalized.filter((name) => !foundNames.includes(name.toLowerCase()));
    throw Object.assign(new Error(`Unknown categories: ${missing.join(', ')}`), { statusCode: 400 });
  }

  const docMap = new Map(categoryDocs.map((doc) => [doc.normalizedName, doc]));
  return normalized.map((name) => docMap.get(name.toLowerCase()));
};

const formatCategories = (categories) => {
  if (!categories) return [];
  return categories.map((cat) => ({
    id: cat._id || cat,
    name: cat.name ? cat.name : undefined
  })).filter((cat) => cat.name);
};

const formatPost = (post) => {
  if (!post) return null;
  const obj = post.toObject ? post.toObject({ virtuals: true }) : post;

  return {
    ...obj,
    categories: formatCategories(obj.categories)
  };
};

// @desc    Get all posts with pagination, sorting, and filtering
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.tag) {
      filter.tag = req.query.tag;
    }
    
    if (req.query.author) {
      filter.author = req.query.author;
    }

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.categories) {
      const categoryNames = req.query.categories.split(',').map((name) => normalizeCategoryName(name));
      const categoryDocs = await Category.find({
        normalizedName: { $in: categoryNames.map((name) => name.toLowerCase()) }
      });

      if (!categoryDocs.length) {
        return res.status(200).json({
          success: true,
          data: {
            posts: [],
            pagination: {
              current: page,
              pages: 0,
              total: 0,
              limit
            }
          }
        });
      }

      filter.categories = { $in: categoryDocs.map((cat) => cat._id) };
    }

    // Build sort object
    let sort = {};
    switch (req.query.sort) {
      case 'popular':
        sort = { likeCount: -1, createdAt: -1 };
        break;
      case 'views':
        sort = { views: -1, createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
    }

    // Execute query
    const posts = await Post.find(filter)
      .populate('author', 'username avatar')
      .populate('categories', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Post.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        posts: posts.map(formatPost),
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar bio followers following')
      .populate('categories', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.status(200).json({
      success: true,
      data: formatPost(post)
    });
  } catch (error) {
    console.error('Get post error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { title, content, tag, location, image, categories } = req.body;

    // Validate required fields
    if (!title || !content || !image) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and image are required'
      });
    }

    // Validate data types
    if (typeof title !== 'string' || typeof content !== 'string' || typeof image !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data types'
      });
    }

    // Validate field lengths
    if (title.trim().length < 3 || title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title must be between 3 and 100 characters'
      });
    }

    if (content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 10 characters'
      });
    }

    let categoryDocs = [];

    if (categories) {
      try {
        categoryDocs = await resolveCategories(categories);
      } catch (err) {
        const statusCode = err.statusCode || 400;
        return res.status(statusCode).json({
          success: false,
          message: err.message
        });
      }
    }

    // Create post - image is just a filename (already uploaded to R2)
    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      image: image.trim(), // Store filename only
      author: req.user._id,
      tag: tag?.trim() || 'Other',
      location: location?.trim() || '',
      categories: categoryDocs.map((cat) => cat._id)
    });

    // Populate author and categories details
    await post.populate('author', 'username avatar');
    await post.populate('categories', 'name');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: formatPost(post)
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (author only)
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const { title, content, tag, location, image, categories } = req.body;

    // Update fields with validation
    if (title) {
      if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Title must be between 3 and 100 characters'
        });
      }
      post.title = title.trim();
    }

    if (content) {
      if (typeof content !== 'string' || content.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Content must be at least 10 characters'
        });
      }
      post.content = content.trim();
    }

    if (tag) post.tag = tag.trim();
    if (location !== undefined) post.location = typeof location === 'string' ? location.trim() : '';

    // Handle image update - image is just a filename (already uploaded to R2)
    if (image) {
      if (typeof image !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid image filename'
        });
      }
      post.image = image.trim();
    }

    if (categories !== undefined) {
      try {
        const categoryDocs = await resolveCategories(categories);
        post.categories = categoryDocs.map((cat) => cat._id);
      } catch (err) {
        const statusCode = err.statusCode || 400;
        return res.status(statusCode).json({
          success: false,
          message: err.message
        });
      }
    }

    await post.save();
    await post.populate('author', 'username avatar');
    await post.populate('categories', 'name');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: formatPost(post)
    });
  } catch (error) {
    console.error('Update post error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (author only)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });

    // Delete post
    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post and associated comments deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Like/unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already liked the post
    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike - remove user from likes array
      post.likes.splice(likeIndex, 1);
    } else {
      // Like - add user to likes array
      post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        liked: likeIndex === -1,
        likeCount: post.likeCount
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Public
exports.getPostComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ post: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get post comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    // Check if post exists
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Create comment
    const comment = await Comment.create({
      post: req.params.id,
      author: req.user._id,
      text: text.trim()
    });

    // Update post comment count
    post.commentCount += 1;
    await post.save();

    // Populate author details
    await comment.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get category usage summary
// @route   GET /api/posts/categories
// @access  Public
exports.getPostCategorySummary = async (req, res) => {
  try {
    const summary = await Post.aggregate([
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 0,
          id: '$category._id',
          name: '$category.name',
          count: '$count'
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.status(200).json({
      success: true,
      categories: summary
    });
  } catch (error) {
    console.error('Get post category summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
