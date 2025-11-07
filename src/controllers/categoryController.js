const Category = require('../models/Category');

// Helper to normalize name (same logic as model)
const normalizeName = (name) => {
  if (typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ');
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      categories: categories.map(cat => ({
        id: cat._id,
        name: cat.name
      }))
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const normalized = normalizeName(name);
    const normalizedLower = normalized.toLowerCase();

    // Check for duplicate (case-insensitive)
    const existing = await Category.findOne({ normalizedName: normalizedLower });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Category already exists',
        category: {
          id: existing._id,
          name: existing.name
        }
      });
    }

    // Create new category
    const category = await Category.create({ name: normalized });

    res.status(201).json({
      success: true,
      category: {
        id: category._id,
        name: category.name
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

