# SnowHub API - Deployment Guide

This guide covers deploying the SnowHub API to various cloud platforms.

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] All code committed to a Git repository (GitHub, GitLab, Bitbucket)
- [ ] Production MongoDB database (MongoDB Atlas recommended)
- [ ] Cloudinary account configured
- [ ] Strong JWT secret generated
- [ ] Environment variables prepared
- [ ] Tested API locally

## Option 1: Deploy to Render (Recommended)

Render offers free tier and is easy to set up.

### Step 1: Prepare Repository

1. Push your code to GitHub
2. Ensure `.gitignore` excludes `node_modules/` and `.env`

### Step 2: Create Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 3: Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: snowhub-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for production)

### Step 4: Set Environment Variables

In Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/snowhub
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=https://yourfrontend.com
```

### Step 5: Deploy

1. Click "Create Web Service"
2. Render will automatically deploy
3. Your API will be live at `https://snowhub-api.onrender.com`

### Notes:
- Free tier services may spin down after inactivity
- First request after inactivity may take 30-60 seconds

## Option 2: Deploy to Railway

Railway offers excellent developer experience.

### Step 1: Prepare Repository

Push your code to GitHub

### Step 2: Create Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 3: Create Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository

### Step 4: Configure

Railway auto-detects Node.js. Add environment variables:

1. Click on your service
2. Go to "Variables" tab
3. Add all environment variables (same as Render above)

### Step 5: Deploy

Railway automatically deploys on push to main branch.

Your API will be live at `https://snowhub-api.up.railway.app`

## Option 3: Deploy to Heroku

Heroku is a popular PaaS with good documentation.

### Step 1: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login

```bash
heroku login
```

### Step 3: Create App

```bash
cd snowhub-api
heroku create snowhub-api
```

### Step 4: Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_strong_secret_key
heroku config:set JWT_EXPIRE=30d
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/snowhub
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
heroku config:set CLOUDINARY_API_KEY=your_api_key
heroku config:set CLOUDINARY_API_SECRET=your_api_secret
heroku config:set CORS_ORIGIN=https://yourfrontend.com
```

### Step 5: Deploy

```bash
git push heroku main
```

### Step 6: Open

```bash
heroku open
```

Your API will be live at `https://snowhub-api.herokuapp.com`

## Option 4: Deploy to DigitalOcean App Platform

DigitalOcean offers robust hosting with good pricing.

### Step 1: Create Account

Go to [digitalocean.com](https://www.digitalocean.com)

### Step 2: Create App

1. Go to "Apps" in dashboard
2. Click "Create App"
3. Choose GitHub and select repository
4. Configure:
   - **Type**: Web Service
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`

### Step 3: Environment Variables

Add all environment variables in the "Environment Variables" section

### Step 4: Deploy

Click "Create Resources" - deployment starts automatically

## Option 5: Deploy to AWS (Advanced)

For production-grade deployment with full control.

### Using AWS Elastic Beanstalk

1. Install AWS CLI and EB CLI
2. Initialize EB:
   ```bash
   eb init -p node.js snowhub-api
   ```
3. Create environment:
   ```bash
   eb create snowhub-api-env
   ```
4. Set environment variables:
   ```bash
   eb setenv NODE_ENV=production JWT_SECRET=xxx ...
   ```
5. Deploy:
   ```bash
   eb deploy
   ```

## MongoDB Atlas Setup (Production)

### Step 1: Create Cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create account and new cluster (M0 free tier or higher)
3. Wait for cluster to be created

### Step 2: Database Access

1. Go to "Database Access"
2. Add new database user
3. Set username and strong password
4. Grant "Read and write to any database"

### Step 3: Network Access

1. Go to "Network Access"
2. Add IP Address
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your server's IP addresses

### Step 4: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your database user password
5. Replace `myFirstDatabase` with `snowhub`

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/snowhub?retryWrites=true&w=majority
```

## Post-Deployment Configuration

### 1. Test API

```bash
# Health check
curl https://your-api-url.com/api/health

# Register test user
curl -X POST https://your-api-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
```

### 2. Update Frontend

Update your frontend to use the production API URL:

```javascript
const API_URL = 'https://your-api-url.com/api';
```

### 3. Configure CORS

Update `CORS_ORIGIN` environment variable:

```
CORS_ORIGIN=https://yourfrontend.com,https://www.yourfrontend.com
```

For multiple origins in code (if needed):

```javascript
// In server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true
}));
```

### 4. Set Up Logging

Consider adding logging service:
- [LogDNA](https://www.logdna.com/)
- [Papertrail](https://www.papertrail.com/)
- [Loggly](https://www.loggly.com/)

### 5. Monitor Performance

Set up monitoring:
- [New Relic](https://newrelic.com/)
- [DataDog](https://www.datadoghq.com/)
- Built-in platform monitoring

## Security Considerations

### 1. Environment Variables

✅ **DO:**
- Use strong, unique JWT secret (32+ characters)
- Use environment-specific MongoDB databases
- Rotate secrets regularly
- Use different Cloudinary folders for environments

❌ **DON'T:**
- Commit `.env` file to repository
- Use weak or default secrets
- Share production credentials

### 2. CORS Configuration

```javascript
// Production - specific origins
CORS_ORIGIN=https://yourapp.com,https://www.yourapp.com

// Development only
CORS_ORIGIN=*
```

### 3. Rate Limiting

Current settings:
- General API: 100 requests per 15 minutes
- Auth routes: 5 requests per 15 minutes

Adjust in `server.js` if needed.

### 4. HTTPS

Most platforms (Render, Railway, Heroku) provide free SSL certificates automatically.

For custom domains:
- Use Let's Encrypt
- Configure SSL in platform settings

### 5. Database Security

- Enable MongoDB authentication
- Use strong database passwords
- Restrict network access by IP
- Regular backups (MongoDB Atlas does this automatically)

## Domain Configuration

### 1. Get Domain

Register domain from:
- [Namecheap](https://www.namecheap.com)
- [Google Domains](https://domains.google)
- [GoDaddy](https://www.godaddy.com)

### 2. Configure DNS

Add CNAME record:
```
api.yourdomain.com → your-app.platform.com
```

### 3. Update Platform

In your platform dashboard, add custom domain:
- Render: Settings → Custom Domain
- Railway: Settings → Domains
- Heroku: Settings → Domains

## Continuous Deployment

Most platforms support automatic deployment on git push:

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl https://api.render.com/deploy/xxx
```

## Scaling Considerations

### Horizontal Scaling

- Use platform's auto-scaling features
- Load balancing is usually automatic

### Database Scaling

- Upgrade MongoDB Atlas tier as needed
- Consider read replicas for high traffic

### Caching

Consider adding Redis for:
- Session storage
- API response caching
- Rate limiting

### CDN

Use CDN for static assets:
- Cloudinary for images (already configured)
- CloudFlare for API caching (optional)

## Backup Strategy

### Database Backups

MongoDB Atlas provides automatic backups:
- Point-in-time recovery
- Snapshot backups
- Cross-region replication

### Code Backups

- Git repository (GitHub, GitLab)
- Regular commits
- Tagged releases

## Monitoring and Maintenance

### 1. Health Checks

Set up monitoring service to ping:
```
https://your-api.com/api/health
```

### 2. Error Tracking

Integrate error tracking:
- [Sentry](https://sentry.io/)
- [Rollbar](https://rollbar.com/)
- [Bugsnag](https://www.bugsnag.com/)

### 3. Uptime Monitoring

Use services like:
- [UptimeRobot](https://uptimerobot.com/)
- [Pingdom](https://www.pingdom.com/)
- [StatusCake](https://www.statuscake.com/)

### 4. Log Management

Review logs regularly:
```bash
# Render
render logs

# Railway
railway logs

# Heroku
heroku logs --tail
```

## Cost Optimization

### Free Tiers

- **MongoDB Atlas**: 512 MB storage (M0)
- **Cloudinary**: 25 GB storage, 25 GB bandwidth
- **Render**: 750 hours/month
- **Railway**: $5 credit/month

### Paid Tiers (When to Upgrade)

Upgrade when you need:
- More than 500 MB database storage
- Always-on service (no cold starts)
- Custom domain with SSL
- More compute resources
- Better support

## Troubleshooting

### API Not Starting

1. Check logs for errors
2. Verify all environment variables are set
3. Test MongoDB connection string locally
4. Check Node.js version compatibility

### Database Connection Failed

1. Verify MongoDB URI format
2. Check network access whitelist
3. Verify database user credentials
4. Test connection with MongoDB Compass

### Image Upload Not Working

1. Verify Cloudinary credentials
2. Check file size limits
3. Review Cloudinary dashboard for errors
4. Test upload locally first

### CORS Errors

1. Check CORS_ORIGIN environment variable
2. Verify frontend URL matches
3. Check browser developer console
4. Test with Postman (CORS doesn't apply)

## Support and Resources

- **Documentation**: README.md in repository
- **API Testing**: API_TESTING_GUIDE.md
- **Setup Guide**: SETUP.md
- **Platform Docs**: Check your hosting platform's documentation

## Next Steps After Deployment

1. ✅ Test all API endpoints
2. ✅ Monitor performance and errors
3. ✅ Set up automated backups
4. ✅ Configure monitoring and alerts
5. ✅ Document API URL for frontend team
6. ✅ Set up CI/CD pipeline
7. ✅ Plan for scaling

Congratulations on deploying SnowHub API! 🎉🏔️⛷️

