# Contributing to SnowHub API

Thank you for your interest in contributing to SnowHub API! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background or experience level.

### Expected Behavior

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- Node.js v20.19+ or v22.12+
- npm (comes with Node.js)
- Git
- MongoDB (local or Atlas account)
- Cloudinary account
- Code editor (VS Code recommended)

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/snowhub-api.git
   cd snowhub-api
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/snowhub-api.git
   ```

4. **Install dependencies**
   ```bash
   yarn install
   # or simply
   yarn
   ```

5. **Set up environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

6. **Start development server**
   ```bash
   yarn dev
   ```

## 📁 Project Structure

```
snowhub-api/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   └── server.js       # Main application
├── .gitignore
├── package.json
└── README.md
```

## 💻 Coding Standards

### JavaScript Style Guide

We follow modern JavaScript best practices:

#### General Guidelines

- Use `const` by default, `let` when reassignment is needed
- Never use `var`
- Use meaningful variable names
- Keep functions small and focused
- Add comments for complex logic
- Use async/await over promises when possible

#### File Organization

```javascript
// 1. Dependencies
const express = require('express');
const User = require('../models/User');

// 2. Configuration/Constants
const MAX_LIMIT = 100;

// 3. Helper Functions
const formatDate = (date) => { /* ... */ };

// 4. Main Functions
exports.getUsers = async (req, res) => { /* ... */ };

// 5. Exports (if not already exported inline)
module.exports = { getUsers };
```

#### Function Style

```javascript
// ✅ Good
exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }
    
    // Rest of logic...
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ❌ Bad
exports.createPost = (req,res)=>{
  const title=req.body.title
  const content=req.body.content
  // No error handling, poor formatting
}
```

#### Error Handling

Always include proper error handling:

```javascript
// ✅ Good
try {
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  // Success logic
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Server error'
  });
}
```

#### Response Format

Always use consistent response format:

```javascript
// Success
{
  "success": true,
  "data": { /* ... */ }
}

// Error
{
  "success": false,
  "message": "Error description"
}

// Paginated
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 50,
      "limit": 10
    }
  }
}
```

### Database Models

- Use singular names for models (User, Post, Comment)
- Add validation at schema level
- Include timestamps
- Add indexes for frequently queried fields
- Document complex fields

```javascript
const schema = new mongoose.Schema({
  field: {
    type: String,
    required: [true, 'Field is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Minimum 3 characters'],
    maxlength: [50, 'Maximum 50 characters']
  }
}, {
  timestamps: true
});

// Add indexes
schema.index({ field: 1 });
```

### API Routes

- Use plural names for resource routes (/posts, /users)
- Follow RESTful conventions
- Use proper HTTP methods
- Implement proper middleware order

```javascript
// ✅ Good
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPost);
router.post('/posts', protect, upload.single('image'), createPost);
router.put('/posts/:id', protect, updatePost);
router.delete('/posts/:id', protect, deletePost);
```

### Security Guidelines

- Never expose sensitive data (passwords, secrets)
- Always validate user input
- Use parameterized queries (Mongoose does this)
- Implement rate limiting
- Use HTTPS in production
- Sanitize file uploads
- Check authorization for protected actions

## 🔨 Making Changes

### Branching Strategy

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow coding standards
   - Add comments for complex logic
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add user search functionality"
   ```

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat: add password reset functionality
fix: resolve image upload error for large files
docs: update API documentation for user endpoints
refactor: improve error handling in auth controller
```

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream changes
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

## 🧪 Testing

### Manual Testing

1. **Start the server**
   ```bash
   npm run dev
   ```

2. **Test endpoints**
   - Use Postman collection (POSTMAN_COLLECTION.json)
   - Follow API_TESTING_GUIDE.md
   - Test all affected endpoints
   - Test edge cases and error conditions

3. **Verify changes**
   - Check database for correct data
   - Verify file uploads (if applicable)
   - Test authentication/authorization
   - Check console for errors

### Testing Checklist

Before submitting changes, verify:

- [ ] Code follows style guidelines
- [ ] No console.log statements left in code (except intentional logging)
- [ ] Error handling is implemented
- [ ] Input validation is present
- [ ] Authentication/authorization works correctly
- [ ] Database changes are working
- [ ] No breaking changes (or clearly documented)
- [ ] Documentation is updated
- [ ] No sensitive data exposed

## 📤 Submitting Changes

### Pull Request Process

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

3. **PR Title Format**
   ```
   feat: Add user search functionality
   fix: Resolve image upload bug
   docs: Update API documentation
   ```

4. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Changes Made
   - Change 1
   - Change 2
   
   ## Testing
   - How to test the changes
   
   ## Screenshots (if applicable)
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-reviewed the code
   - [ ] Commented complex code
   - [ ] Documentation updated
   - [ ] No breaking changes
   - [ ] Tested thoroughly
   ```

5. **Review Process**
   - Wait for maintainer review
   - Address feedback
   - Make requested changes
   - Push updates to same branch

## 🐛 Reporting Bugs

### Before Submitting

1. Check existing issues
2. Verify it's actually a bug
3. Test with latest version
4. Gather necessary information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Send request '...'
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Screenshots/Logs**
If applicable, add screenshots or error logs.

**Environment:**
- OS: [e.g., Windows 10]
- Node.js version: [e.g., v20.19.0]
- MongoDB version: [e.g., 7.0]

**Additional context**
Any other context about the problem.
```

## 💡 Requesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem.

**Describe the solution you'd like**
Clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context, screenshots, or examples.

**Proposed implementation**
If you have ideas on how to implement this.
```

## 📚 Documentation

When adding new features:

- Update README.md with new endpoints
- Add examples to API_TESTING_GUIDE.md
- Update Postman collection
- Add entry to CHANGELOG.md
- Update QUICK_REFERENCE.md if applicable

## 🎯 Areas for Contribution

Looking for ways to contribute? Consider:

### High Priority
- [ ] Email verification system
- [ ] Password reset functionality
- [ ] Automated testing suite
- [ ] API documentation with Swagger
- [ ] Performance optimization

### Medium Priority
- [ ] User notifications system
- [ ] Advanced search functionality
- [ ] Caching with Redis
- [ ] Admin panel endpoints
- [ ] User reporting system

### Nice to Have
- [ ] WebSocket for real-time updates
- [ ] Video upload support
- [ ] Story/reel feature
- [ ] Analytics dashboard
- [ ] Social media sharing

## 🏆 Recognition

Contributors will be:
- Listed in project documentation
- Mentioned in release notes
- Given credit in commit history

## 📞 Questions?

If you have questions:
- Open an issue with the "question" label
- Check existing documentation
- Review closed issues for similar questions

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC).

---

Thank you for contributing to SnowHub API! 🏔️⛷️❄️

**Happy Coding!**

