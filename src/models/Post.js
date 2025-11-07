const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  tag: {
    type: String,
    enum: ['Skiing', 'Snowboarding', 'Gear', 'Resort', 'Backcountry', 'Other'],
    default: 'Other'
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tag: 1, createdAt: -1 });
postSchema.index({ categories: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

// Update likeCount when likes array changes
postSchema.pre('save', function(next) {
  this.likeCount = this.likes.length;
  next();
});

module.exports = mongoose.model('Post', postSchema);

