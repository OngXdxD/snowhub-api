const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public (optional auth for isFollowing)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's post count
    const postCount = await Post.countDocuments({ author: user._id });

    // Check if current user is following this user (if authenticated)
    let isFollowing = false;
    if (req.user) {
      const currentUser = await User.findById(req.user._id);
      isFollowing = currentUser.following.includes(req.params.id);
    }

    res.status(200).json({
      success: true,
      id: user._id,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar, // Just filename
      location: user.location || '',
      joinedDate: user.createdAt,
      isFollowing: isFollowing, // Only if requesting user is authenticated
      stats: {
        posts: postCount,
        followers: user.followers.length,
        following: user.following.length,
        bookmarks: user.bookmarks.length
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's posts
// @route   GET /api/users/:id/posts
// @access  Public
exports.getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's posts
    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: req.params.id });

    // Format posts for profile page
    const formattedPosts = posts.map(post => ({
      id: post._id,
      image: post.image, // Just filename
      title: post.title,
      likes: post.likeCount,
      comments: post.commentCount,
      createdAt: post.createdAt
    }));

    res.status(200).json({
      success: true,
      posts: formattedPosts,
      totalPosts: total,
      page: page,
      hasMore: total > page * limit
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Follow/unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res) => {
  try {
    // Can't follow yourself
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Find the user to follow
    const userToFollow = await User.findById(req.params.id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find current user
    const currentUser = await User.findById(req.user._id);

    // Check if already following
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user._id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      success: true,
      isFollowing: !isFollowing, // true if now following, false if unfollowed
      followerCount: userToFollow.followers.length // Updated follower count
    });
  } catch (error) {
    console.error('Follow user error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Public
exports.getFollowers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id)
      .populate({
        path: 'followers',
        select: 'username avatar bio',
        options: {
          skip: skip,
          limit: limit
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const total = user.followers.length;

    res.status(200).json({
      success: true,
      data: {
        followers: user.followers,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get users being followed
// @route   GET /api/users/:id/following
// @access  Public
exports.getFollowing = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id)
      .populate({
        path: 'following',
        select: 'username avatar bio',
        options: {
          skip: skip,
          limit: limit
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const total = user.following.length;

    res.status(200).json({
      success: true,
      data: {
        following: user.following,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Bookmark/unbookmark a post
// @route   POST /api/users/:userId/bookmark/:postId
// @access  Private
exports.bookmarkPost = async (req, res) => {
  try {
    const { userId, postId } = req.params;

    // Check if user is authorized (can only bookmark for themselves)
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to bookmark posts for this user'
      });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already bookmarked
    const isBookmarked = user.bookmarks.includes(postId);

    if (isBookmarked) {
      // Unbookmark - remove post from bookmarks
      user.bookmarks = user.bookmarks.filter(
        id => id.toString() !== postId
      );
    } else {
      // Bookmark - add post to bookmarks
      user.bookmarks.push(postId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      isBookmarked: !isBookmarked, // true if now bookmarked, false if unbookmarked
      bookmarkCount: user.bookmarks.length
    });

  } catch (error) {
    console.error('Bookmark post error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Post or user not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's bookmarked posts
// @route   GET /api/users/:userId/bookmarks
// @access  Private (user can only see their own bookmarks)
exports.getBookmarks = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    // Check if user is authorized (can only see their own bookmarks)
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view bookmarks for this user'
      });
    }

    // Get user with bookmarks
    const user = await User.findById(userId).populate({
      path: 'bookmarks',
      select: '_id image title likeCount commentCount views createdAt',
      options: {
        sort: { createdAt: -1 },
        skip: skip,
        limit: limit
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format posts for response
    const formattedPosts = user.bookmarks.map(post => ({
      id: post._id,
      image: post.image, // Just filename
      title: post.title,
      likes: post.likeCount,
      comments: post.commentCount,
      views: post.views,
      createdAt: post.createdAt
    }));

    const total = user.bookmarks.length;

    res.status(200).json({
      success: true,
      bookmarks: formattedPosts,
      totalBookmarks: total,
      page: page,
      hasMore: total > page * limit
    });

  } catch (error) {
    console.error('Get bookmarks error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

