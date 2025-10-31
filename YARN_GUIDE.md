# Using Yarn with SnowHub API

This project is configured to use **Yarn** as the package manager. This guide provides Yarn-specific commands and best practices.

## Why Yarn?

- **Faster**: Parallel installation and caching
- **Reliable**: Deterministic dependency resolution
- **Secure**: Built-in checksums for packages
- **Offline Mode**: Install packages from cache

## Installation

If you don't have Yarn installed:

### Using npm (one-time install)
```bash
npm install -g yarn
```

### Using Corepack (Node.js 16.10+)
```bash
corepack enable
corepack prepare yarn@stable --activate
```

### Verify Installation
```bash
yarn --version
```

## Essential Yarn Commands

### Installing Dependencies

```bash
# Install all dependencies from package.json
yarn install

# Or simply
yarn

# Install and add to dependencies
yarn add package-name

# Install and add to devDependencies
yarn add package-name --dev
# or
yarn add package-name -D

# Install specific version
yarn add package-name@1.2.3

# Install from GitHub
yarn add user/repo
```

### Running Scripts

```bash
# Start development server (defined in package.json)
yarn dev

# Start production server
yarn start

# Run any script from package.json
yarn <script-name>
```

### Managing Dependencies

```bash
# Remove a package
yarn remove package-name

# Upgrade a package to latest version
yarn upgrade package-name

# Upgrade all packages
yarn upgrade

# Check for outdated packages
yarn outdated

# List installed packages
yarn list

# Show why a package is installed
yarn why package-name
```

### Workspace Commands

```bash
# Clean cache
yarn cache clean

# Verify package integrity
yarn check

# Get information about your Yarn installation
yarn info
```

## SnowHub API Specific Commands

### Development Workflow

```bash
# 1. Clone and setup
git clone <repository-url>
cd snowhub-api

# 2. Install dependencies
yarn

# 3. Setup environment
cp env.example .env
# Edit .env with your configuration

# 4. Start development server
yarn dev

# 5. In another terminal, test the API
curl http://localhost:5000/api/health
```

### Production Workflow

```bash
# Install production dependencies only
yarn install --production

# Start production server
yarn start
```

## Yarn vs NPM Command Comparison

| NPM | Yarn | Description |
|-----|------|-------------|
| `npm install` | `yarn` or `yarn install` | Install dependencies |
| `npm install pkg` | `yarn add pkg` | Add package |
| `npm install pkg --save-dev` | `yarn add pkg --dev` | Add dev package |
| `npm uninstall pkg` | `yarn remove pkg` | Remove package |
| `npm update` | `yarn upgrade` | Update packages |
| `npm run script` | `yarn script` | Run script |
| `npm start` | `yarn start` | Run start script |
| `npm test` | `yarn test` | Run test script |
| `npm outdated` | `yarn outdated` | Check outdated |
| `npm cache clean` | `yarn cache clean` | Clean cache |

## Understanding yarn.lock

The `yarn.lock` file:
- **Locks exact versions** of all dependencies
- **Ensures consistency** across all installations
- **Should be committed** to version control
- **Auto-generated** by Yarn, don't edit manually

### When to Update yarn.lock

```bash
# After adding a package
yarn add package-name
# yarn.lock is automatically updated

# After removing a package
yarn remove package-name
# yarn.lock is automatically updated

# After upgrading packages
yarn upgrade
# yarn.lock is automatically updated
```

## Troubleshooting

### Issue: "yarn: command not found"

**Solution:**
```bash
# Install Yarn globally
npm install -g yarn

# Or enable Corepack (Node.js 16.10+)
corepack enable
```

### Issue: Dependency conflicts

**Solution:**
```bash
# Remove node_modules and reinstall
rm -rf node_modules yarn.lock
yarn install
```

### Issue: Cached package causing issues

**Solution:**
```bash
# Clean Yarn cache
yarn cache clean

# Reinstall
yarn install
```

### Issue: "Integrity check failed"

**Solution:**
```bash
# Remove yarn.lock and reinstall
rm yarn.lock
yarn install
```

## Yarn Workspaces (Future)

If this project grows to a monorepo structure:

```json
// package.json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

Then use:
```bash
# Run script in specific workspace
yarn workspace package-name run script-name

# Add dependency to specific workspace
yarn workspace package-name add dependency-name
```

## Performance Tips

### 1. Use Offline Mirror
```bash
# Install from cache without network
yarn install --offline
```

### 2. Enable PnP (Plug'n'Play) - Optional
```bash
# In .yarnrc.yml
nodeLinker: pnp
```

### 3. Prefer Exact Versions
```bash
# Add package with exact version (no ^)
yarn add package-name --exact
# or
yarn add package-name -E
```

## Yarn Configuration

### Project-level (.yarnrc.yml)
```yaml
# Example configuration
nodeLinker: node-modules
npmRegistryServer: "https://registry.yarnpkg.com"
```

### Global Configuration
```bash
# Set registry
yarn config set registry https://registry.yarnpkg.com

# Set proxy
yarn config set proxy http://proxy.example.com:8080

# View all config
yarn config list
```

## CI/CD with Yarn

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'yarn'
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Start server
        run: yarn start &
```

### GitLab CI Example

```yaml
image: node:20

cache:
  paths:
    - node_modules/
    - .yarn

stages:
  - test
  - deploy

test:
  stage: test
  script:
    - yarn install --frozen-lockfile
    - yarn start
```

## Docker with Yarn

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Copy source code
COPY . .

# Start server
CMD ["yarn", "start"]
```

## Best Practices

### 1. Always Commit yarn.lock
```bash
git add yarn.lock
git commit -m "Update dependencies"
```

### 2. Use --frozen-lockfile in CI
```bash
# Ensures exact versions from yarn.lock
yarn install --frozen-lockfile
```

### 3. Keep Yarn Updated
```bash
# Update Yarn itself
yarn set version stable
```

### 4. Regular Dependency Updates
```bash
# Check for updates weekly
yarn outdated

# Update non-breaking changes
yarn upgrade

# Update to latest (including breaking)
yarn upgrade --latest
```

### 5. Security Audits
```bash
# Check for vulnerabilities
yarn audit

# Fix vulnerabilities
yarn audit fix
```

## Useful Yarn Plugins

### Enable/Disable Plugins
```bash
# Interactive upgrade plugin
yarn plugin import interactive-tools

# Workspace tools
yarn plugin import workspace-tools
```

## Quick Reference Card

```bash
# Common Development Commands
yarn              # Install dependencies
yarn dev          # Start development server
yarn start        # Start production server
yarn add pkg      # Add package
yarn remove pkg   # Remove package
yarn upgrade      # Update packages
yarn outdated     # Check outdated packages

# Maintenance Commands
yarn cache clean  # Clean cache
yarn check        # Verify packages
yarn audit        # Security audit

# Information Commands
yarn list         # List packages
yarn why pkg      # Why is package installed
yarn info pkg     # Package information
```

## Getting Help

```bash
# General help
yarn help

# Help for specific command
yarn help add
yarn help install
```

## Resources

- [Yarn Official Documentation](https://yarnpkg.com/)
- [Yarn CLI Commands](https://yarnpkg.com/cli)
- [Yarn vs npm](https://yarnpkg.com/getting-started/migration)

---

**Note**: This project is configured to work with **Yarn v1 (Classic)**. If using Yarn v2+ (Berry), some commands may differ. Check the `packageManager` field in `package.json`.

Happy coding with Yarn! 🧶

