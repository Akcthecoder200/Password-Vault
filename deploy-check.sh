#!/bin/bash

# Quick Deployment Script for Render
# This script helps prepare your project for Render deployment

echo "🚀 Preparing Password Vault for Render deployment..."

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not initialized. Please initialize git first."
    exit 1
fi

echo "✅ Project structure verified"

# Check for required files
echo "📋 Checking required files..."

required_files=(
    "server/package.json"
    "client/package.json" 
    "server/index.js"
    "render.yaml"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Validate package.json files have required scripts
echo "📦 Validating package.json files..."

# Check server package.json
if ! grep -q '"start":' server/package.json; then
    echo "❌ Server package.json missing 'start' script"
    exit 1
fi

if ! grep -q '"engines":' server/package.json; then
    echo "⚠️  Warning: Server package.json missing Node.js version specification"
fi

# Check client package.json
if ! grep -q '"build":' client/package.json; then
    echo "❌ Client package.json missing 'build' script"
    exit 1
fi

if ! grep -q '"start":' client/package.json; then
    echo "❌ Client package.json missing 'start' script"
    exit 1
fi

echo "✅ Package.json files validated"

# Check for environment configuration
echo "🔧 Checking environment configuration..."

if [ -f "server/.env.example" ]; then
    echo "✅ Server environment example found"
else
    echo "⚠️  Warning: server/.env.example not found"
fi

if [ -f "server/.env.production" ]; then
    echo "✅ Server production environment template found"
else
    echo "⚠️  Warning: server/.env.production not found"
fi

# Check if Swagger is configured
if grep -q "swagger" server/package.json; then
    echo "✅ Swagger dependencies found"
else
    echo "⚠️  Warning: Swagger dependencies not found"
fi

# Validate API configuration
if [ -f "client/utils/api.js" ]; then
    if grep -q "NEXT_PUBLIC_API_URL" client/utils/api.js; then
        echo "✅ Frontend API configuration ready for production"
    else
        echo "⚠️  Warning: Frontend API configuration may not be production-ready"
    fi
else
    echo "⚠️  Warning: client/utils/api.js not found"
fi

echo ""
echo "🎯 Pre-deployment Summary:"
echo "================================"

# Check git status
uncommitted=$(git status --porcelain | wc -l)
if [ $uncommitted -eq 0 ]; then
    echo "✅ All changes committed"
else
    echo "⚠️  Warning: $uncommitted uncommitted changes found"
    echo "   Run 'git add .' and 'git commit -m \"your message\"' to commit changes"
fi

# Check if remote origin exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Git remote origin configured"
    echo "   Remote: $(git remote get-url origin)"
else
    echo "❌ Git remote origin not configured"
    echo "   Add your GitHub repository: git remote add origin <your-repo-url>"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Ensure all changes are committed and pushed to GitHub"
echo "2. Set up MongoDB Atlas database"
echo "3. Create Render account and connect your GitHub repository"
echo "4. Use the render.yaml file for automatic deployment"
echo "5. Set environment variables in Render dashboard"
echo "6. Follow the DEPLOYMENT_CHECKLIST.md for detailed steps"

echo ""
echo "🔗 Important URLs after deployment:"
echo "   API Swagger Docs: https://your-api-service.onrender.com/api-docs"
echo "   Frontend: https://your-frontend-service.onrender.com"

echo ""
echo "🚀 Ready for Render deployment!"