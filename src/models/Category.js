const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  normalizedName: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true
});

// Pre-save hook to normalize name
categorySchema.pre('validate', function(next) {
  if (!this.name) {
    return next();
  }

  const normalized = this.name.trim().replace(/\s+/g, ' ');
  this.name = normalized.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  this.normalizedName = normalized.toLowerCase();

  next();
});

module.exports = mongoose.model('Category', categorySchema);

