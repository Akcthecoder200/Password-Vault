#!/bin/bash

# This script helps build the Next.js application on Render
echo "� Debugging environment..."
pwd
ls -la

echo "�📦 Installing dependencies including tailwindcss..."
npm install
echo "Installing tailwindcss explicitly..."
npm install tailwindcss postcss autoprefixer --save

echo "🔧 Checking for tailwindcss..."
if npm list tailwindcss > /dev/null 2>&1; then
  echo "✅ tailwindcss is installed!"
else
  echo "⚠️  tailwindcss is NOT installed. Trying alternative method..."
  npm install tailwindcss postcss autoprefixer --force
fi

echo "📄 Creating postcss.config.js if it doesn't exist..."
if [ ! -f "postcss.config.js" ]; then
  echo "module.exports = { plugins: { tailwindcss: {}, autoprefixer: {}, }, };" > postcss.config.js
fi

echo "📄 Creating tailwind.config.js if it doesn't exist..."
if [ ! -f "tailwind.config.js" ]; then
  echo "module.exports = { content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'], theme: { extend: {}, }, plugins: [], };" > tailwind.config.js
fi

echo "🔧 Building Next.js application..."
NODE_ENV=production npm run build

echo "✅ Build completed!"