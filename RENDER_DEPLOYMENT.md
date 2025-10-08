# Render Deployment Guide for Password Vault

This guide provides step-by-step instructions to deploy your Password Vault application on Render.

## Overview

The Password Vault application consists of:

- **Backend**: Node.js/Express API server with MongoDB
- **Frontend**: Next.js React application
- **Database**: MongoDB Atlas (recommended for production)

## Prerequisites

1. GitHub repository with your code
2. Render account (free tier available)
3. MongoDB Atlas account (for production database)

## Step 1: Prepare Your Code for Deployment

### 1.1 Update Server Package.json

Ensure your server has the correct start script and Node.js version specified:

```json
{
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "start": "node index.js",
    "build": "echo 'No build step required'"
  }
}
```

### 1.2 Create render.yaml (Optional but Recommended)

Create a `render.yaml` file in your project root for Infrastructure as Code:

```yaml
services:
  - type: web
    name: password-vault-api
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 4000
      - key: MONGODB_URI
        fromDatabase:
          name: password-vault-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
    healthCheckPath: /api/health

  - type: web
    name: password-vault-frontend
    env: node
    plan: free
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_API_URL
        value: https://password-vault-api.onrender.com

databases:
  - name: password-vault-db
    databaseName: password_vault
    user: vault_user
```

### 1.3 Update CORS Configuration

Update your server's CORS configuration for production:

```javascript
// In server/index.js
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.onrender.com"]
        : ["http://localhost:3000"],
    credentials: true,
  })
);
```

## Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses (use 0.0.0.0/0 for Render)
5. Get your connection string

## Step 3: Deploy Backend API

### Option A: Using Render Dashboard

1. **Create New Web Service**:

   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**:

   - **Name**: `password-vault-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Set Environment Variables**:

   ```
   NODE_ENV=production
   PORT=4000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secure_jwt_secret_here
   ```

4. **Deploy**: Click "Create Web Service"

### Option B: Using Render Blueprint (render.yaml)

1. Push your code with `render.yaml` to GitHub
2. In Render Dashboard, click "New" → "Blueprint"
3. Connect your repository
4. Render will automatically create services based on your `render.yaml`

## Step 4: Deploy Frontend

1. **Create New Static Site or Web Service**:

   - Go to Render Dashboard
   - Click "New" → "Web Service" (for Next.js)
   - Connect your GitHub repository

2. **Configure Service**:

   - **Name**: `password-vault-frontend`
   - **Root Directory**: `client`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

3. **Set Environment Variables**:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-api-service-name.onrender.com
   ```

## Step 5: Update Frontend API Configuration

Update your frontend to use the production API URL:

```javascript
// In client/utils/api.js or wherever you configure axios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
```

## Step 6: Production Optimizations

### 6.1 Add Health Check Endpoint

Ensure your backend has a health check (already implemented):

```javascript
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
```

### 6.2 Add Production Logging

```javascript
// Add to server/index.js
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}
```

### 6.3 Security Headers

```javascript
// Add security middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
```

## Step 7: Domain Configuration (Optional)

1. **Custom Domain**:

   - In Render Dashboard, go to your service
   - Navigate to "Settings" → "Custom Domains"
   - Add your domain and configure DNS

2. **SSL**: Render provides free SSL certificates automatically

## Step 8: Monitoring and Maintenance

1. **Logs**: Access logs in Render Dashboard under "Logs" tab
2. **Metrics**: Monitor performance in the "Metrics" tab
3. **Alerts**: Set up alerts for service downtime

## Troubleshooting

### Common Issues:

1. **Build Failures**:

   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **Database Connection Issues**:

   - Verify MongoDB Atlas connection string
   - Ensure IP whitelist includes 0.0.0.0/0
   - Check database user permissions

3. **CORS Errors**:

   - Update CORS configuration with correct frontend URL
   - Ensure credentials are handled properly

4. **Environment Variables**:
   - Double-check all required environment variables are set
   - Verify variable names match your code

## Cost Considerations

- **Free Tier Limitations**:

  - 750 hours/month (services spin down after 15 minutes of inactivity)
  - 512MB RAM, 0.1 CPU
  - Limited bandwidth

- **Paid Plans**: Start at $7/month for always-on services

## Security Checklist

- [ ] Use strong JWT secrets
- [ ] Enable HTTPS only
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Regular security updates

## Next Steps After Deployment

1. Test all functionality in production
2. Set up monitoring and alerting
3. Configure backups for your database
4. Implement CI/CD pipeline for automatic deployments
5. Consider implementing caching for better performance

Your Password Vault should now be successfully deployed on Render!
