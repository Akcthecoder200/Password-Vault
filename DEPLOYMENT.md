# Password Vault Deployment Guide

This guide outlines the steps and changes made to ensure the Password Vault application deploys correctly on Render.

## 🔧 Key Changes Made

### Tailwind CSS Configuration

1. **Updated `tailwind.config.js`**

   - Expanded content paths to include all possible file locations
   - Added support for app and src directories
   - Enhanced theme configuration with primary color palette
   - Changed to CommonJS syntax (`module.exports`) for compatibility with Next.js 14

2. **Enhanced `render-build.sh`**

   - Added improved debugging and error reporting
   - Added explicit installation of latest Tailwind CSS dependencies
   - Created fallback configuration files if they don't exist
   - Ensured globals.css has proper Tailwind directives

3. **Created Fallback Mechanism**

   - Enhanced `tailwind-direct.js` with comprehensive fallback CSS utilities
   - Generated static CSS when Tailwind fails to build
   - Added import helper in `_app.js` for emergency use

4. **Updated Package Configuration**
   - Set Node.js engine to v20.x
   - Moved Tailwind CSS from devDependencies to dependencies
   - Added custom build script that pre-processes CSS
   - Created fallback mechanism if Tailwind CSS processing fails

## 🚀 Deployment Instructions

### Local Development

1. Install dependencies:

   ```bash
   cd client
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

### Deploying on Render

1. Make sure the Render.yaml file is in the project root with the following configuration:

   ```yaml
   services:
     # Backend API Service
     - type: web
       name: password-vault-api
       env: node
       plan: free
       region: oregon
       buildCommand: cd server && npm install
       startCommand: cd server && npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 4000
         - key: MONGODB_URI
           sync: false
         - key: JWT_SECRET
           generateValue: true
       healthCheckPath: /api/health
       autoDeploy: true

     # Frontend Service
     - type: web
       name: password-vault-frontend
       env: node
       plan: free
       region: oregon
       buildCommand: cd client && chmod +x render-build.sh && ./render-build.sh
       startCommand: cd client && npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: NEXT_PUBLIC_API_URL
           value: https://password-vault-api.onrender.com
       autoDeploy: true
   ```

2. Push your code to GitHub and connect the repository to Render.

3. Add any required environment variables in the Render dashboard.

4. Deploy both services.

## ⚠️ Troubleshooting

If you encounter Tailwind CSS issues during deployment:

1. Check the build logs for specific errors.

2. Make sure your PostCSS configuration uses CommonJS format:

   - Use `module.exports = { plugins: {...} }` instead of ES modules syntax
   - This is required for Next.js 14.0.0 compatibility

3. Ensure Tailwind CSS is installed as a regular dependency:

   ```json
   "dependencies": {
     "tailwindcss": "^3.3.0",
     "postcss": "^8.4.31",
     "autoprefixer": "^10.4.14"
   }
   ```

4. If Tailwind CSS fails to build:

   - Uncomment the fallback import in `_app.js`:

   ```javascript
   // Uncomment the line below if Tailwind CSS fails to load during deployment
   import "../styles/tailwind-fallback";
   ```

5. For libsodium-wrappers issues:

   - Use the provided fix-libsodium.js script as mentioned in ENCRYPTION_FIX.md

6. If the build fails with Node.js version errors:
   - Verify the engine specification in package.json matches Render's Node.js version.

## 🔒 API Testing

To test the API endpoints, use the Swagger documentation available at:

```
https://password-vault-api.onrender.com/api-docs
```

This provides a comprehensive interface for testing all API endpoints directly from the browser.
